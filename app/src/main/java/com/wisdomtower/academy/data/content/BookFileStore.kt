package com.wisdomtower.academy.data.content

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.util.concurrent.TimeUnit

/**
 * Keeps book PDFs on the phone so they open offline after the first download (plan step N4).
 * Files live in the app's private storage: `files/books/<key>.pdf`. No login or secret is needed: the
 * Appwrite file address from [LearningContentRepository.appwriteViewUrl] is public (role "Any" can read,
 * the website's own `/api/content/pdf` proxy reads the same address).
 *
 * F4b (2026-10-12): [delete] removes a saved book (used by "Remove saved" in the hub list).
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object BookFileStore {
    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    /** Same file-name rule for [ensureFile] and [delete]. */
    private fun safeName(key: String): String = key.replace(Regex("[^A-Za-z0-9._-]"), "_").take(100)

    /** Removes the saved PDF (and an unfinished download) of [key] from the phone. Never throws. */
    fun delete(context: Context, key: String) {
        val dir = File(context.filesDir, "books")
        val safe = safeName(key)
        runCatching { File(dir, "$safe.pdf").delete() }
        runCatching { File(dir, "$safe.part").delete() }
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
        if (target.exists() && target.length() > 0L) return@withContext target

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
        onProgress(1f)
        target
    }
}
