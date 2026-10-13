package com.wisdomtower.academy.data.content

import android.content.Context
import android.util.Log
import com.wisdomtower.academy.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

/** resource id -> subject key ("<picker package id>/<subject slug>"), with the time it was fetched. */
data class ScopeIndex(val map: Map<String, String>, val fetchedAtMs: Long)

/**
 * T8: maps every published `learning_resources` row to its subject, so "Your status" can count only the picked subjects.
 * One public read (anon key, published rows only, same as the native hubs): `id, package_id, scope_path`. The subject is
 * the LAST segment of `scope_path`; ECE rows (both semesters carry package_id `ece-y3-sem-1`, docs/CONTENT_SHAPES.md)
 * use the picker package `ece`. The result is cached in the app's files folder, so it also works offline; it is refreshed
 * when older than 24 hours or when asked. Never logs bodies, only HTTP status codes. Never throws.
 *
 * STATUS: written, NOT compiled, NOT tested on a device. Hypothesis: grade subject ids in `PackagesData.kt`
 * (for example `mathematics`) equal the last `scope_path` segment in the database; the plan verified this only for
 * Freshman (21 subjects) and ECE (13 slugs).
 */
object ResourceScopeIndex {
    private const val TAG = "ResourceScopeIndex"
    private const val FILE_NAME = "my_subjects_scope_index.json"
    private const val MAX_AGE_MS = 24L * 60L * 60L * 1000L
    private const val PAGE = 1000

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    /** "<picker package id>/<slug>" or null when the path is empty. */
    fun subjectKey(packageId: String, scopePath: String): String? {
        val segments = scopePath.trim().trim('/').split('/').filter { it.isNotBlank() }
        if (segments.isEmpty()) return null
        val slug = segments.last().lowercase()
        val pkg = if (segments.first().equals("ece", ignoreCase = true) || packageId.startsWith("ece")) {
            MySubjectsStore.ECE
        } else {
            packageId
        }
        if (pkg.isBlank()) return null
        return "$pkg/$slug"
    }

    /**
     * Cached index when it is fresh; otherwise a new read, falling back to an older cache when offline.
     * Returns null only when there is no cache and the read failed (the caller must then NOT show filtered totals).
     */
    suspend fun get(context: Context, forceRefresh: Boolean = false): ScopeIndex? = withContext(Dispatchers.IO) {
        val cached = readCache(context)
        val now = System.currentTimeMillis()
        if (cached != null && !forceRefresh && now - cached.fetchedAtMs < MAX_AGE_MS) {
            return@withContext cached
        }
        val fetched = fetchAll()
        if (fetched != null) {
            val index = ScopeIndex(fetched, now)
            writeCache(context, index)
            index
        } else {
            cached
        }
    }

    private fun fetchAll(): Map<String, String>? {
        return try {
            val out = HashMap<String, String>()
            var offset = 0
            while (true) {
                val url = "$supabaseUrl/rest/v1/learning_resources".toHttpUrl().newBuilder()
                    .addQueryParameter("select", "id,package_id,scope_path")
                    .addQueryParameter("published", "eq.true")
                    .addQueryParameter("order", "id")
                    .addQueryParameter("limit", PAGE.toString())
                    .addQueryParameter("offset", offset.toString())
                    .build()
                val request = Request.Builder()
                    .url(url)
                    .addHeader("apikey", anonKey)
                    .addHeader("Authorization", "Bearer $anonKey")
                    .addHeader("Accept", "application/json")
                    .get()
                    .build()
                val count = http.newCall(request).execute().use { resp ->
                    if (!resp.isSuccessful) {
                        Log.w(TAG, "read failed: HTTP ${resp.code}")
                        return null
                    }
                    val arr = JSONArray(resp.body?.string().orEmpty())
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val id = o.optString("id", "")
                        val key = subjectKey(
                            o.optString("package_id", ""),
                            if (o.isNull("scope_path")) "" else o.optString("scope_path", "")
                        )
                        if (id.isNotBlank() && key != null) out[id] = key
                    }
                    arr.length()
                }
                if (count < PAGE) break
                offset += PAGE
            }
            out
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "fetchAll failed: ${e.javaClass.simpleName}")
            null
        }
    }

    private fun readCache(context: Context): ScopeIndex? {
        return try {
            val file = File(context.filesDir, FILE_NAME)
            if (!file.exists()) return null
            val root = JSONObject(file.readText())
            val m = root.getJSONObject("m")
            val map = HashMap<String, String>(m.length())
            val names = m.keys()
            while (names.hasNext()) {
                val k = names.next()
                map[k] = m.getString(k)
            }
            ScopeIndex(map, root.optLong("t", 0L))
        } catch (e: Exception) {
            null
        }
    }

    private fun writeCache(context: Context, index: ScopeIndex) {
        try {
            val m = JSONObject()
            index.map.forEach { (k, v) -> m.put(k, v) }
            val root = JSONObject().put("t", index.fetchedAtMs).put("m", m)
            File(context.filesDir, FILE_NAME).writeText(root.toString())
        } catch (e: Exception) {
            Log.w(TAG, "cache write failed: ${e.javaClass.simpleName}")
        }
    }
}
