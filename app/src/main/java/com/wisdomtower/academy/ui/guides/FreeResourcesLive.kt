package com.wisdomtower.academy.ui.guides

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
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
 * Shown when the admin has not written an intro. 2026-10-17: lightly polished for a more human tone (same ideas,
 * same bullets). The Tip card on the Scholarships tab splits it at blank lines; a paragraph whose lines start with
 * a bullet becomes a checklist.
 */
const val SCHOLARSHIP_DEFAULT_INTRO =
    "A scholarship can change what is possible for you: lower fees, covered materials, or a door open to a program abroad.\n\nThis page collects opportunities for Ethiopian students and the wider region: local awards, national schemes, and international programs that accept applicants from Africa. Every card tells you who it is for, what it covers, the deadline when we have it, and where to apply.\n\nHow to use this page\n• Read the eligibility notes carefully: many awards are limited by grade, field, gender, or need.\n• Start early. Strong applications need transcripts, recommendations, and a clear personal statement.\n• Keep a simple tracker of deadlines, required documents, and status.\n• Stick to official sites and verified partners.\n\nWe keep adding and updating listings. If you know a good scholarship that is missing, use Contact us and send the official link."

/**
 * REAL Success Stories and Scholarships, read from the SAME Supabase tables as the website
 * (`public.free_resource_items` and `public.free_resource_pages`, only `published = true`, same
 * filters and order as `listFreeResourceItems` in website-reference/src/lib/free-resources.ts).
 * Public URL + anon key from BuildConfig only, no secrets. The anon role may read published rows
 * (see website-reference/docs/free-resources-setup.sql).
 *
 * There is NO bundled sample content: the earlier bundled stories and scholarships were invented
 * and were removed (owner confirmed 2026-10-11). Until the first successful load the lists are
 * empty. The last successful server answer for the items is kept in a small file on the phone so
 * the lists also work offline; that file only ever holds rows that came from the server.
 *
 * The lists and the flags are Compose state: a screen that reads them recomposes when they change.
 *
 * Field mapping copied from the website pages (success-stories/page.tsx, scholarships/page.tsx):
 *  - story: meta.studentName, meta.program, meta.result (or title), meta.year, meta.quote, body_md,
 *    image_path (cover photo, bucket `free-resources`, see [publicImageUrl])
 *  - scholarship: title, meta.provider|organization, meta.amount|award, meta.eligibility,
 *    meta.level|degree, meta.country|location, deadline, external_url, body_md
 *  - page shells: subtitle (both pages) and body_md (scholarships intro)
 *
 * STATUS: NOT compiled, NOT tested on a phone.
 */
object FreeResourcesLive {
    val stories = mutableStateListOf<SuccessStory>()
    val scholarships = mutableStateListOf<ScholarshipOpportunity>()

    /** True once the first load attempt (server or not) has finished. */
    var loaded by mutableStateOf(false)
        private set

    /** True when the last server call for that tab failed (nothing is known about the server). */
    var storiesFailed by mutableStateOf(false)
        private set
    var scholarshipsFailed by mutableStateOf(false)
        private set

    /** Page shell texts written by the owner in the admin panel ("" = none). */
    var storiesSubtitle by mutableStateOf("")
        private set
    var scholarshipsSubtitle by mutableStateOf("")
        private set
    var scholarshipsIntro by mutableStateOf("")
        private set

    private const val TAG = "FreeResources"
    private const val CACHE_FILE = "free_resources_cache.json"
    private const val ORDER = "&order=sort_order.asc,created_at.desc"

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

        val storyRows = get(
            "free_resource_items?select=*&page_slug=eq.success-stories&kind=eq.success_story&published=eq.true$ORDER"
        )
        val scholarshipRows = get(
            "free_resource_items?select=*&page_slug=eq.scholarships&kind=eq.scholarship&published=eq.true$ORDER"
        )
        if (storyRows != null) publishStories(parseStories(storyRows))
        if (scholarshipRows != null) publishScholarships(parseScholarships(scholarshipRows))
        storiesFailed = storyRows == null
        scholarshipsFailed = scholarshipRows == null

        val storyPage = get("free_resource_pages?select=*&slug=eq.success-stories&published=eq.true")
        if (storyPage != null) {
            storiesSubtitle = storyPage.optJSONObject(0).pick("subtitle")
        }
        val scholarshipPage = get("free_resource_pages?select=*&slug=eq.scholarships&published=eq.true")
        if (scholarshipPage != null) {
            val row = scholarshipPage.optJSONObject(0)
            scholarshipsSubtitle = row.pick("subtitle")
            scholarshipsIntro = row.pick("body_md")
        }

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
        loaded = true
    }

    private fun readCache(file: File): JSONObject? = try {
        if (file.exists()) JSONObject(file.readText()) else null
    } catch (_: Exception) {
        null
    }

    /** GET on the Supabase REST API. Returns the rows, or null when the call failed. */
    private fun get(path: String): JSONArray? {
        val base = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
        val key = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
        if (base.isEmpty() || key.isEmpty()) return null
        return try {
            val request = Request.Builder()
                .url("$base/rest/v1/$path")
                .addHeader("apikey", key)
                .addHeader("Authorization", "Bearer $key")
                .addHeader("Accept", "application/json")
                .get()
                .build()
            http.newCall(request).execute().use { resp ->
                if (!resp.isSuccessful) {
                    Log.w(TAG, "GET failed: HTTP ${resp.code}")
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

    /**
     * Same as the website's `freeResourcePublicUrl`: a full http(s) link is used as it is, anything else is a path
     * inside the PUBLIC storage bucket `free-resources`. Returns "" when there is no image.
     */
    private fun publicImageUrl(path: String): String {
        if (path.isEmpty()) return ""
        if (path.startsWith("http://") || path.startsWith("https://")) return path
        val base = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
        if (base.isEmpty()) return ""
        val encoded = path.trimStart('/').split('/').joinToString("/") { Uri.encode(it) }
        return "$base/storage/v1/object/public/free-resources/$encoded"
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
                    body = row.pick("body_md"),
                    imageUrl = publicImageUrl(row.pick("image_path"))
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
