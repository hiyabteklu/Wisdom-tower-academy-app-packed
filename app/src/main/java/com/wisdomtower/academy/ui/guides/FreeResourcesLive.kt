package com.wisdomtower.academy.ui.guides

import android.content.Context
import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.snapshots.Snapshot
import com.wisdomtower.academy.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.concurrent.TimeUnit

/**
 * REAL Success Stories and Scholarships, read from the SAME Supabase table as the website
 * (`public.free_resource_items`, only `published = true`, same filters and order as
 * `listFreeResourceItems` in website-reference/src/lib/free-resources.ts). Public URL + anon key
 * from BuildConfig only, no secrets. The anon role may read published rows (see
 * website-reference/docs/free-resources-setup.sql, policy `free_resource_items_select_published`).
 *
 * There is NO bundled sample content any more: the earlier bundled stories and scholarships were
 * invented and were removed (owner confirmed 2026-10-11). Until the first successful load the
 * lists are empty. The last successful server answer is kept in a small file on the phone so the
 * lists also work offline; that file only ever holds rows that came from the server.
 *
 * The lists are Compose state lists: a screen that reads them recomposes when they change.
 *
 * Field mapping copied from the website pages (success-stories/page.tsx, scholarships/page.tsx):
 *  - story: meta.studentName, meta.program, meta.result (or title), meta.year, meta.quote, body_md
 *  - scholarship: title, meta.provider|organization, meta.amount|award, meta.eligibility,
 *    meta.level|degree, meta.country|location, deadline, external_url, body_md
 *
 * STATUS: NOT compiled, NOT tested on a phone.
 */
object FreeResourcesLive {
    val stories = mutableStateListOf<SuccessStory>()
    val scholarships = mutableStateListOf<ScholarshipOpportunity>()

    private const val TAG = "FreeResources"
    private const val CACHE_FILE = "free_resources_cache.json"

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val lock = Any()
    private var job: Job? = null
    private var cacheLoaded = false

    /** Starts one background load (cache first, then the server). Does nothing if one is running. */
    fun refresh(context: Context) {
        val app = context.applicationContext
        synchronized(lock) {
            if (job?.isActive == true) return
            job = scope.launch { load(app) }
        }
    }

    private fun load(app: Context) {
        val cacheFile = File(app.filesDir, CACHE_FILE)
        if (!cacheLoaded) {
            cacheLoaded = true
            val cached = readCache(cacheFile)
            if (cached != null) {
                publishStories(parseStories(cached.optJSONArray("stories")))
                publishScholarships(parseScholarships(cached.optJSONArray("scholarships")))
            }
        }

        val storyRows = fetch("success-stories", "success_story")
        val scholarshipRows = fetch("scholarships", "scholarship")
        if (storyRows != null) publishStories(parseStories(storyRows))
        if (scholarshipRows != null) publishScholarships(parseScholarships(scholarshipRows))

        if (storyRows != null || scholarshipRows != null) {
            try {
                val cache = readCache(cacheFile) ?: JSONObject()
                if (storyRows != null) cache.put("stories", storyRows)
                if (scholarshipRows != null) cache.put("scholarships", scholarshipRows)
                cacheFile.writeText(cache.toString())
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                // offline copy is optional
            }
        }
    }

    private fun readCache(file: File): JSONObject? = try {
        if (file.exists()) JSONObject(file.readText()) else null
    } catch (_: Exception) {
        null
    }

    /** Returns the rows, or null when the call failed (so a failure never wipes what is shown). */
    private fun fetch(pageSlug: String, kind: String): JSONArray? {
        val base = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
        val key = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
        if (base.isEmpty() || key.isEmpty()) return null
        return try {
            val url = "$base/rest/v1/free_resource_items?select=*" +
                "&page_slug=eq.$pageSlug&kind=eq.$kind&published=eq.true" +
                "&order=sort_order.asc,created_at.desc"
            val request = Request.Builder()
                .url(url)
                .addHeader("apikey", key)
                .addHeader("Authorization", "Bearer $key")
                .addHeader("Accept", "application/json")
                .get()
                .build()
            http.newCall(request).execute().use { resp ->
                if (!resp.isSuccessful) {
                    Log.w(TAG, "fetch $pageSlug failed: HTTP ${resp.code}")
                    null
                } else {
                    JSONArray(resp.body?.string().orEmpty())
                }
            }
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            null
        }
    }

    private fun publishStories(list: List<SuccessStory>) {
        Snapshot.withMutableSnapshot {
            stories.clear()
            stories.addAll(list)
        }
    }

    private fun publishScholarships(list: List<ScholarshipOpportunity>) {
        Snapshot.withMutableSnapshot {
            scholarships.clear()
            scholarships.addAll(list)
        }
    }

    /** First non-blank string among [keys], or "". */
    private fun JSONObject?.pick(vararg keys: String): String {
        if (this == null) return ""
        for (k in keys) {
            if (has(k) && !isNull(k)) {
                val v = optString(k).trim()
                if (v.isNotEmpty() && v != "null") return v
            }
        }
        return ""
    }

    private fun parseStories(rows: JSONArray?): List<SuccessStory> {
        val out = mutableListOf<SuccessStory>()
        if (rows == null) return out
        for (i in 0 until rows.length()) {
            val row = rows.optJSONObject(i) ?: continue
            val meta = row.optJSONObject("meta")
            out.add(
                SuccessStory(
                    id = row.pick("id"),
                    name = meta.pick("studentName"),
                    achievement = meta.pick("result").ifEmpty { row.pick("title") },
                    program = meta.pick("program"),
                    year = meta.pick("year"),
                    quote = meta.pick("quote"),
                    body = row.pick("body_md")
                )
            )
        }
        return out
    }

    private fun parseScholarships(rows: JSONArray?): List<ScholarshipOpportunity> {
        val out = mutableListOf<ScholarshipOpportunity>()
        if (rows == null) return out
        for (i in 0 until rows.length()) {
            val row = rows.optJSONObject(i) ?: continue
            val meta = row.optJSONObject("meta")
            out.add(
                ScholarshipOpportunity(
                    id = row.pick("id"),
                    title = row.pick("title"),
                    provider = meta.pick("provider", "organization"),
                    amount = meta.pick("amount", "award"),
                    level = meta.pick("level", "degree"),
                    country = meta.pick("country", "location"),
                    eligibility = meta.pick("eligibility"),
                    deadline = formatDeadline(row.pick("deadline")),
                    externalUrl = row.pick("external_url"),
                    body = row.pick("body_md")
                )
            )
        }
        return out
    }

    /** Like the website: a valid date is shown as "Nov 30, 2026", anything else as it is. */
    private fun formatDeadline(raw: String): String {
        if (raw.isEmpty()) return ""
        return try {
            val date = SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(raw.take(10)) ?: return raw
            SimpleDateFormat("MMM d, yyyy", Locale.US).format(date)
        } catch (_: Exception) {
            raw
        }
    }
}
