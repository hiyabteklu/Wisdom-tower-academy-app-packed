package com.wisdomtower.academy.data.content

import android.util.Log
import com.wisdomtower.academy.BuildConfig
import com.wisdomtower.academy.data.auth.AuthStateManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.TimeUnit

/**
 * Saves a submitted exam like `saveExamAttempt` in `website-reference/src/lib/content.ts`:
 *  1. one row in `public.exam_attempts` (`user_id, resource_id, submitted_at, score, answers, meta { total }`);
 *  2. when the course page has a tracker scope id, one row in `public.academic_results`
 *     (`user_id, scope_id, title, total, correct, missed, percent`) so the result shows in the student's
 *     tracker exactly as a website exam does.
 * Both tables accept inserts for the student's own rows only (policies `auth.uid() = user_id`).
 * The two inserts are independent (as on the website): a failed attempt row does not stop the tracker row.
 *
 * Uses the student's own access token (refreshed when needed, one retry after a 401). Never logs tokens or
 * bodies, only HTTP status codes. NOT queued offline (the website's offline queue is not ported yet): when
 * the phone is offline at submit time the function returns false and nothing is stored.
 *
 * STATUS: written, NOT compiled, NOT tested on a device (plan step N5).
 */
object ExamAttemptRepository {
    private const val TAG = "ExamAttempt"
    private const val STATUS_OK = 0
    private const val STATUS_UNAUTHORIZED = 1
    private const val STATUS_FAILED = 2

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()
    private val UUID_REGEX = Regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
    private val mutex = Mutex()

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    /**
     * [answers] is the object the quiz page sends: question index (as text) to chosen choice index.
     * [scopeId] is the website's `trackerScopeId` for this course page, or null when it is unknown.
     * Returns true when the attempt row was accepted by the server.
     */
    suspend fun saveAttempt(
        resourceId: String,
        score: Int,
        total: Int,
        answers: JSONObject,
        title: String,
        scopeId: String?
    ): Boolean = mutex.withLock {
        withContext(Dispatchers.IO) {
            if (!UUID_REGEX.matches(resourceId) || total <= 0) return@withContext false
            try {
                val attemptStatus = insertWithRetry("exam_attempts") { userId ->
                    JSONObject()
                        .put("user_id", userId)
                        .put("resource_id", resourceId)
                        .put("submitted_at", nowIso())
                        .put("score", score)
                        .put("answers", answers)
                        .put("meta", JSONObject().put("total", total))
                }

                if (!scopeId.isNullOrBlank()) {
                    val missed = maxOf(0, total - score)
                    val percent = Math.round(score.toDouble() / total * 1000.0) / 10.0
                    insertWithRetry("academic_results") { userId ->
                        JSONObject()
                            .put("user_id", userId)
                            .put("scope_id", scopeId)
                            .put("title", title.ifBlank { "Exam attempt" })
                            .put("total", total)
                            .put("correct", score)
                            .put("missed", missed)
                            .put("percent", percent)
                    }
                }
                attemptStatus == STATUS_OK
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.w(TAG, "saveAttempt failed: ${e.javaClass.simpleName}")
                false
            }
        }
    }

    /** One insert; on HTTP 401 forces one token refresh and tries once more. Returns a STATUS_* value. */
    private suspend fun insertWithRetry(table: String, buildBody: (userId: String) -> JSONObject): Int {
        AuthStateManager.refreshIfNeeded()
        val first = AuthStateManager.currentUser.value
        val token1 = first?.accessToken
        if (first == null || token1.isNullOrBlank() || !UUID_REGEX.matches(first.id)) {
            return STATUS_FAILED
        }
        var status = post(table, token1, buildBody(first.id))
        if (status == STATUS_UNAUTHORIZED && AuthStateManager.refreshIfNeeded(force = true)) {
            val second = AuthStateManager.currentUser.value
            val token2 = second?.accessToken
            if (second != null && !token2.isNullOrBlank() && UUID_REGEX.matches(second.id)) {
                status = post(table, token2, buildBody(second.id))
            }
        }
        return status
    }

    private fun post(table: String, token: String, body: JSONObject): Int {
        val request = Request.Builder()
            .url("$supabaseUrl/rest/v1/$table")
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Prefer", "return=minimal")
            .post(body.toString().toRequestBody(JSON_MEDIA))
            .build()
        http.newCall(request).execute().use { resp ->
            return when {
                resp.code == 401 -> STATUS_UNAUTHORIZED
                resp.isSuccessful -> STATUS_OK
                else -> {
                    Log.w(TAG, "insert into $table failed: HTTP ${resp.code}")
                    STATUS_FAILED
                }
            }
        }
    }

    private fun nowIso(): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }.format(Date())
}
