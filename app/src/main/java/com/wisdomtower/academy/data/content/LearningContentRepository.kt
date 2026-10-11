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
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Reads the learning content (books, notes, flashcards, question banks, exams) straight from the SAME
 * Supabase table as the website, `public.learning_resources`, with the public anon key from BuildConfig.
 * Published rows are readable by everyone (policy `lr_public_select_published`, see
 * `docs/SUPABASE_NOTES.md`), so no secret and no website page is involved.
 *
 * Query rules copied from `listResources` in `website-reference/src/lib/content.ts`:
 *  - hub `short-notes` also matches the old hub name `references`;
 *  - an ECE course is looked up under BOTH `ece/sem-1/<slug>` and `ece/sem-2/<slug>` (the real data stores
 *    every ECE row under `ece/sem-1/...`, also for Semester 2 courses, see `docs/CONTENT_SHAPES.md`);
 *    if nothing is found, fall back to `scope_path` containing the slug;
 *  - `freshman/math-natural` and `freshman/mathematics` are the same subject;
 *  - published rows only, ordered by `sort_order`.
 *
 * Offline: every successful answer is saved as a small JSON file in the app's private storage; when the
 * phone cannot reach the server the saved copy is returned (`fromCache = true`).
 *
 * The sign-in check (real content needs a signed-in student) belongs to the screen that calls this.
 *
 * STATUS: written, NOT compiled, NOT tested on a device (plan step N1, `docs/NATIVE_CONTENT_PLAN.md`).
 */
object LearningContentRepository {
    private const val TAG = "LearningContent"
    private const val NO_INTERNET = "Check your internet connection and try again."
    private const val LOAD_FAILED = "Unable to load materials right now. Please try again."

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private val ECE_SCOPE = Regex("^ece/(sem-[12])/([^/]+)$")
    private val UUID_REGEX = Regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
    private val APPWRITE_ID_REGEX = Regex("^[A-Za-z0-9._-]{1,64}$")

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    /** Columns of a light list (no note text, no quiz/flashcard JSON). */
    private const val LIGHT_COLUMNS =
        "id,package_id,scope_path,hub,title,chapter,sort_order,content_type,storage_path,published"

    /**
     * Lists the published resources of one course/subject ([scopePath], for example `ece/sem-2/eceg3082`,
     * `freshman/physics`, `grade/9/biology`) in one hub ([hub], for example `short-notes`).
     * [full] = false returns light rows (fast, for the hub list); true also returns `body_md` and `meta`
     * (use it to prefetch a whole subject's notes for offline reading).
     */
    suspend fun list(
        context: Context,
        scopePath: String,
        hub: String,
        full: Boolean = false
    ): ContentListResult = withContext(Dispatchers.IO) {
        val cacheFile = cacheFile(context, "list_${scopePath}_${hub}_${if (full) "full" else "light"}")
        try {
            val rows = fetchRows(scopePath, hub, full)
            writeCache(cacheFile, rows.toString())
            ContentListResult.Success(rows.objects().map(::rowToResource), false)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "list failed: ${e.javaClass.simpleName}")
            val cached = readCache(cacheFile)?.let { runCatching { JSONArray(it) }.getOrNull() }
            if (cached != null) {
                ContentListResult.Success(cached.objects().map(::rowToResource), true)
            } else {
                ContentListResult.Failure(if (e is IOException) NO_INTERNET else LOAD_FAILED)
            }
        }
    }

    /** Loads one resource with its full body and meta (note text, flashcards, questions). */
    suspend fun getResource(context: Context, id: String): ContentItemResult = withContext(Dispatchers.IO) {
        if (!UUID_REGEX.matches(id)) return@withContext ContentItemResult.NotFound
        val cacheFile = cacheFile(context, "item_$id")
        try {
            val url = "$supabaseUrl/rest/v1/learning_resources".toHttpUrl().newBuilder()
                .addQueryParameter("select", "*")
                .addQueryParameter("id", "eq.$id")
                .addQueryParameter("published", "eq.true")
                .addQueryParameter("limit", "1")
                .build().toString()
            val rows = JSONArray(get(url))
            if (rows.length() == 0) return@withContext ContentItemResult.NotFound
            val row = rows.getJSONObject(0)
            writeCache(cacheFile, row.toString())
            ContentItemResult.Found(rowToResource(row), false)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "getResource failed: ${e.javaClass.simpleName}")
            val cached = readCache(cacheFile)?.let { runCatching { JSONObject(it) }.getOrNull() }
            if (cached != null) {
                ContentItemResult.Found(rowToResource(cached), true)
            } else {
                ContentItemResult.Failure(if (e is IOException) NO_INTERNET else LOAD_FAILED)
            }
        }
    }

    /**
     * The address of a book file on Appwrite (same URL the website's `/api/content/pdf` proxy reads), or null
     * when [storagePath] is not an `appwrite:<FILE_ID>` path. Uses only the public `NEXT_PUBLIC_APPWRITE_*`
     * values from BuildConfig. The id may be followed by `|...`; that part is cut off.
     */
    fun appwriteViewUrl(storagePath: String?): String? {
        if (storagePath == null || !storagePath.startsWith("appwrite:")) return null
        val fileId = storagePath.removePrefix("appwrite:").substringBefore('|').trim()
        if (!APPWRITE_ID_REGEX.matches(fileId)) return null
        val endpoint = BuildConfig.NEXT_PUBLIC_APPWRITE_ENDPOINT.trim().trimEnd('/')
        val project = BuildConfig.NEXT_PUBLIC_APPWRITE_PROJECT_ID.trim()
        val bucket = BuildConfig.NEXT_PUBLIC_APPWRITE_BUCKET_ID.trim()
        if (endpoint.isEmpty() || project.isEmpty() || bucket.isEmpty()) return null
        return "$endpoint/storage/buckets/$bucket/files/$fileId/view?project=$project"
    }

    // ---------- internals ----------

    private fun fetchRows(scopePath: String, hub: String, full: Boolean): JSONArray {
        val hubFilter = if (hub == "short-notes") "in.(\"short-notes\",\"references\")" else "eq.$hub"
        var rows = queryRows(scopeFilter(scopePath), hubFilter, full)
        val ece = ECE_SCOPE.matchEntire(scopePath)
        if (rows.length() == 0 && ece != null) {
            rows = queryRows("ilike.*${ece.groupValues[2]}*", hubFilter, full)
        }
        return rows
    }

    /** The PostgREST filter for `scope_path`, with the ECE and math quirks of the website. */
    private fun scopeFilter(scopePath: String): String {
        val ece = ECE_SCOPE.matchEntire(scopePath)
        return when {
            ece != null -> {
                val other = if (ece.groupValues[1] == "sem-1") "sem-2" else "sem-1"
                "in.(\"$scopePath\",\"ece/$other/${ece.groupValues[2]}\")"
            }
            scopePath == "freshman/math-natural" || scopePath == "freshman/mathematics" ->
                "in.(\"freshman/math-natural\",\"freshman/mathematics\")"
            else -> "eq.$scopePath"
        }
    }

    private fun queryRows(scopeFilter: String, hubFilter: String, full: Boolean): JSONArray {
        val url = "$supabaseUrl/rest/v1/learning_resources".toHttpUrl().newBuilder()
            .addQueryParameter("select", if (full) "*" else LIGHT_COLUMNS)
            .addQueryParameter("scope_path", scopeFilter)
            .addQueryParameter("hub", hubFilter)
            .addQueryParameter("published", "eq.true")
            .addQueryParameter("order", "sort_order.asc")
            .build().toString()
        return JSONArray(get(url))
    }

    /** GET with the public key. Network trouble throws IOException; any other HTTP error throws IllegalStateException. */
    private fun get(url: String): String {
        val request = Request.Builder()
            .url(url)
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $anonKey")
            .addHeader("Accept", "application/json")
            .get()
            .build()
        return http.newCall(request).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IllegalStateException("HTTP ${resp.code}")
            text
        }
    }

    private fun rowToResource(row: JSONObject): LearningResource {
        val rawHub = row.optString("hub")
        return LearningResource(
            id = row.optString("id"),
            packageId = row.optString("package_id"),
            scopePath = row.optString("scope_path"),
            hub = if (rawHub == "references") "short-notes" else rawHub,
            title = row.optString("title"),
            chapter = if (row.isNull("chapter")) null else row.optInt("chapter"),
            sortOrder = row.optInt("sort_order", 0),
            contentType = row.optString("content_type"),
            storagePath = row.nstr("storage_path"),
            bodyMd = row.nstr("body_md"),
            metaJson = row.optJSONObject("meta")?.toString() ?: "{}"
        )
    }

    private fun JSONObject.nstr(key: String): String? {
        if (isNull(key)) return null
        val v = optString(key)
        return if (v == "null") null else v.ifBlank { null }
    }

    private fun JSONArray.objects(): List<JSONObject> =
        (0 until length()).mapNotNull { optJSONObject(it) }

    // ---------- small file cache (app private storage, no secrets) ----------

    private fun cacheFile(context: Context, key: String): File {
        val dir = File(context.filesDir, "content_cache").apply { mkdirs() }
        return File(dir, key.replace(Regex("[^A-Za-z0-9._-]"), "_").take(150) + ".json")
    }

    private fun writeCache(file: File, text: String) {
        runCatching { file.writeText(text) }
    }

    private fun readCache(file: File): String? =
        runCatching { if (file.exists()) file.readText() else null }.getOrNull()
}
