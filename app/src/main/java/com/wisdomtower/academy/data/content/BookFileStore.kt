package com.wisdomtower.academy.data.content

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

/**
 * Keeps book PDFs on the phone so they open offline after the first download (plan step N4).
 * Files live in the app's private storage: `files/books/<key>.pdf`. No login or secret is needed: the
 * Appwrite file address from [LearningContentRepository.appwriteViewUrl] is public (role "Any" can read,
 * the website's own `/api/content/pdf` proxy reads the same address).
 *
 * F4b (2026-10-12): [delete] removes a saved book (used by "Remove saved" in the hub list).
 * T4 (2026-10-12): [probeFileSize], [getCachedFileSize], and [formatBytes] provide real book file sizes
 * (e.g. "12.4 MB") before downloading, with persistent offline caching in `wt_book_sizes` SharedPreferences.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object BookFileStore {
    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    private val probeHttp = http.newBuilder()
        .connectTimeout(4, TimeUnit.SECONDS)
        .readTimeout(4, TimeUnit.SECONDS)
        .build()

    private val sizeMemoryCache = ConcurrentHashMap<String, Long>()

    /** Same file-name rule for [ensureFile] and [delete]. */
    private fun safeName(key: String): String = key.replace(Regex("[^A-Za-z0-9._-]"), "_").take(100)

    /** Removes the saved PDF (and an unfinished download) of [key] from the phone. Never throws. */
    fun delete(context: Context, key: String) {
        val dir = File(context.filesDir, "books")
        val safe = safeName(key)
        runCatching { File(dir, "$safe.pdf").delete() }
        runCatching { File(dir, "$safe.part").delete() }
    }

    /** Returns the byte size of the downloaded local PDF file, or null if not downloaded. */
    fun getSavedFileSize(context: Context, key: String): Long? {
        val dir = File(context.filesDir, "books")
        val safe = safeName(key)
        val file = File(dir, "$safe.pdf")
        return if (file.exists() && file.length() > 0L) file.length() else null
    }

    /** Returns cached file size if known (from memory, disk, or prefs), or null. Never makes a network call. */
    fun getCachedFileSize(context: Context, key: String): Long? {
        sizeMemoryCache[key]?.let { return it }
        getSavedFileSize(context, key)?.let {
            sizeMemoryCache[key] = it
            return it
        }
        val prefs = context.getSharedPreferences("wt_book_sizes", Context.MODE_PRIVATE)
        val saved = prefs.getLong(key, -1L)
        if (saved > 0L) {
            sizeMemoryCache[key] = saved
            return saved
        }
        return null
    }

    /** Saves a known file size into memory and persistent preferences. */
    fun saveCachedSize(context: Context, key: String, sizeBytes: Long) {
        if (sizeBytes <= 0L) return
        sizeMemoryCache[key] = sizeBytes
        context.getSharedPreferences("wt_book_sizes", Context.MODE_PRIVATE)
            .edit()
            .putLong(key, sizeBytes)
            .apply()
    }

    /**
     * Probes the file size of [url] without downloading the whole file.
     * Checks local cache first; if not found, performs a lightweight HEAD / Range probe.
     * Result is cached locally so subsequent calls are instant and offline-ready.
     */
    suspend fun probeFileSize(context: Context, key: String, url: String): Long? = withContext(Dispatchers.IO) {
        getCachedFileSize(context, key)?.let { return@withContext it }

        // 1) Lightweight HEAD probe
        try {
            val reqHead = Request.Builder().url(url).head().build()
            probeHttp.newCall(reqHead).execute().use { resp ->
                if (resp.isSuccessful) {
                    val cl = resp.header("Content-Length")?.toLongOrNull()
                    if (cl != null && cl > 0L) {
                        saveCachedSize(context, key, cl)
                        return@withContext cl
                    }
                }
            }
        } catch (_: Exception) {}

        // 2) Range GET probe (1 byte: bytes=0-0)
        try {
            val reqRange = Request.Builder()
                .url(url)
                .header("Range", "bytes=0-0")
                .get()
                .build()
            probeHttp.newCall(reqRange).execute().use { resp ->
                val cr = resp.header("Content-Range")
                val total = cr?.substringAfterLast('/')?.toLongOrNull()
                if (total != null && total > 0L) {
                    saveCachedSize(context, key, total)
                    return@withContext total
                }
                val cl = resp.header("Content-Length")?.toLongOrNull()
                if (cl != null && cl > 1L) {
                    saveCachedSize(context, key, cl)
                    return@withContext cl
                }
            }
        } catch (_: Exception) {}

        null
    }

    /** Formats a byte count into clean "XX.X MB" or "XX.X KB". Returns empty string if <= 0. */
    fun formatBytes(bytes: Long): String {
        if (bytes <= 0L) return ""
        val kb = bytes / 1024.0
        val mb = kb / 1024.0
        return if (mb >= 1.0) {
            String.format(java.util.Locale.US, "%.1f MB", mb)
        } else {
            String.format(java.util.Locale.US, "%.1f KB", kb)
        }
    }

    /**
     * Returns the local file for [key], downloading [url] first when it is not on the phone yet.
     * [onProgress] gets 0..1 while the size is known. Throws `java.io.IOException` for network trouble and
     * `IllegalStateException` for any other problem (bad HTTP status, file is not a PDF).
     */
    suspend fun ensureFile(
        context: Context,
        key: String,
        url: String,
        onProgress: (Float) -> Unit
    ): File = withContext(Dispatchers.IO) {
        val dir = File(context.filesDir, "books").apply { mkdirs() }
        val safe = safeName(key)
        val target = File(dir, "$safe.pdf")
        if (target.exists() && target.length() > 0L) {
            saveCachedSize(context, key, target.length())
            return@withContext target
        }

        val part = File(dir, "$safe.part")
        val request = Request.Builder().url(url).get().build()
        http.newCall(request).execute().use { resp ->
            if (!resp.isSuccessful) throw IllegalStateException("HTTP ${resp.code}")
            val body = resp.body ?: throw IllegalStateException("Empty answer")
            val total = body.contentLength()
            body.byteStream().use { input ->
                part.outputStream().use { out ->
                    val buffer = ByteArray(64 * 1024)
                    var done = 0L
                    var lastReported = 0L
                    while (true) {
                        ensureActive()
                        val read = input.read(buffer)
                        if (read < 0) break
                        out.write(buffer, 0, read)
                        done += read
                        if (total > 0L && done - lastReported > 256 * 1024) {
                            lastReported = done
                            onProgress(done.toFloat() / total.toFloat())
                        }
                    }
                }
            }
        }

        val header = part.inputStream().use { input ->
            val bytes = ByteArray(5)
            val n = input.read(bytes)
            if (n > 0) String(bytes, 0, n) else ""
        }
        if (!header.startsWith("%PDF")) {
            part.delete()
            throw IllegalStateException("Not a PDF")
        }
        if (!part.renameTo(target)) {
            part.copyTo(target, overwrite = true)
            part.delete()
        }
        saveCachedSize(context, key, target.length())
        onProgress(1f)
        target
    }
}
