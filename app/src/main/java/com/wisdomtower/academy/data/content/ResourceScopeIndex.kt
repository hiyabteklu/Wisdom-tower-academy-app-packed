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

/**
 * The subject of a learning resource: [group] is `freshman`, `ece`, `grade-9` ... `grade-12`; [slug] is the last segment
 * of `scope_path` (the course slug for ECE). Both empty = the resource belongs to no group of the "My Subjects" picker
 * (for example COC, UAT, GAT or an Entrance Questions year).
 */
data class SubjectKey(val group: String, val slug: String)

/**
 * `scope_path` shapes (docs/CONTENT_SHAPES.md): `freshman/<slug>`, `ece/sem-<1|2>/<slug>` (Semester 2 courses also use
 * `sem-1`, so only the slug counts), `grade/<n>/<slug>`. `freshman/mathematics` is the website's old name of
 * `freshman/math-natural` (same alias as `LearningContentRepository.scopeFilter`). Anything else: null.
 */
fun subjectKeyOfScope(scopePath: String): SubjectKey? {
    val parts = scopePath.trim().trim('/').split('/')
    if (parts.any { it.isBlank() }) return null
    return when (parts[0]) {
        "freshman" ->
            if (parts.size == 2) SubjectKey("freshman", if (parts[1] == "mathematics") "math-natural" else parts[1]) else null
        "ece" ->
            if (parts.size == 3) SubjectKey("ece", parts[2]) else null
        "grade" ->
            if (parts.size == 3) SubjectKey("grade-${parts[1]}", parts[2]) else null
        else -> null
    }
}

/**
 * Map `learning_resources.id` -> [SubjectKey] for every published resource, from ONE paged request (public key, no new
 * host), cached on the device so it also works offline. Progress rows only hold a resource id, so this map is what lets
 * "Your status" keep only the picked subjects (T8). Never throws, never logs bodies or keys.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object ResourceScopeIndex {
    private const val TAG = "ResourceScopeIndex"
    private const val CACHE_FILE = "my_subjects_scope_index.json"
    private const val STALE_MS = 12L * 60L * 60L * 1000L
    private const val RECHECK_MS = 10L * 60L * 1000L
    private const val PAGE = 1000
    private const val MAX_PAGES = 20

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    private class Cached(val savedAt: Long, val map: Map<String, SubjectKey>)

    /**
     * The index, or null when there is neither a saved copy nor a network (the caller must then NOT show filtered
     * numbers). Uses the saved copy when it is fresh; when [neededIds] holds an id the copy does not know (new content)
     * and the copy is older than 10 minutes, asks the server again. A stale copy is still used when the network fails.
     */
    suspend fun load(context: Context, neededIds: Collection<String>): Map<String, SubjectKey>? =
        withContext(Dispatchers.IO) {
            val cached = readCache(context)
            val now = System.currentTimeMillis()
            if (cached != null) {
                val age = now - cached.savedAt
                val missing = neededIds.any { it.isNotBlank() && !cached.map.containsKey(it) }
                if (age < STALE_MS && (!missing || age < RECHECK_MS)) return@withContext cached.map
            }
            val fresh: Map<String, SubjectKey>? = try {
                fetchAll()
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.w(TAG, "fetch failed: ${e.javaClass.simpleName}")
                null
            }
            if (fresh != null) {
                writeCache(context, now, fresh)
                fresh
            } else {
                cached?.map
            }
        }

    private fun fetchAll(): Map<String, SubjectKey> {
        val out = HashMap<String, SubjectKey>()
        var offset = 0
        for (page in 0 until MAX_PAGES) {
            val url = "$supabaseUrl/rest/v1/learning_resources".toHttpUrl().newBuilder()
                .addQueryParameter("select", "id,scope_path")
                .addQueryParameter("published", "eq.true")
                .addQueryParameter("order", "id.asc")
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
            val arr = http.newCall(request).execute().use { resp ->
                if (!resp.isSuccessful) throw IllegalStateException("HTTP ${resp.code}")
                JSONArray(resp.body?.string().orEmpty())
            }
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                val id = o.optString("id", "")
                if (id.isBlank()) continue
                out[id] = subjectKeyOfScope(o.optString("scope_path", "")) ?: SubjectKey("", "")
            }
            if (arr.length() < PAGE) return out
            offset += PAGE
        }
        throw IllegalStateException("too many pages")
    }

    private fun encode(key: SubjectKey): String =
        if (key.group.isEmpty()) "" else "${key.group}|${key.slug}"

    private fun decode(value: String): SubjectKey {
        val i = value.indexOf('|')
        return if (i <= 0) SubjectKey("", "") else SubjectKey(value.substring(0, i), value.substring(i + 1))
    }

    private fun readCache(context: Context): Cached? {
        return try {
            val file = File(context.filesDir, CACHE_FILE)
            if (!file.exists()) return null
            val obj = JSONObject(file.readText())
            val m = obj.optJSONObject("map") ?: return null
            val map = HashMap<String, SubjectKey>(m.length())
            val keys = m.keys()
            while (keys.hasNext()) {
                val id = keys.next()
                map[id] = decode(m.optString(id, ""))
            }
            Cached(obj.optLong("savedAt", 0L), map)
        } catch (e: Exception) {
            null // damaged or unreadable copy: behave as if there is none
        }
    }

    private fun writeCache(context: Context, savedAt: Long, map: Map<String, SubjectKey>) {
        try {
            val m = JSONObject()
            for ((id, key) in map) {
                m.put(id, encode(key))
            }
            val obj = JSONObject()
            obj.put("savedAt", savedAt)
            obj.put("map", m)
            File(context.filesDir, CACHE_FILE).writeText(obj.toString())
        } catch (e: Exception) {
            Log.w(TAG, "cache write failed: ${e.javaClass.simpleName}")
        }
    }
}
