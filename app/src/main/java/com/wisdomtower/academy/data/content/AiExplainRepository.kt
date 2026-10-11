package com.wisdomtower.academy.data.content

import com.wisdomtower.academy.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * "Explain with AI" for the native quiz screen (plan step N10). Calls the website route `/api/ai/explain`
 * (website-reference/src/app/api/ai/explain/route.ts): the AI keys stay on the website server, the route needs
 * no sign-in, and it keeps its own shared cache of answers. The request body is the one the website's
 * `QuizExamViewer.tsx` sends: `{ mode: "question", text, question, choices, studentAnswer, correctAnswer,
 * solution, resourceId }`.
 *
 * The result is the text to show: the route's `explanation`, else its `error`, else "-" (same fallbacks as the
 * website), and "AI unavailable" when the phone cannot reach the website. Never throws (except cancellation),
 * never logs the question text.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object AiExplainRepository {
    private const val UNAVAILABLE = "AI unavailable"

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(40, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    suspend fun explain(payloadJson: String): String = withContext(Dispatchers.IO) {
        try {
            val base = BuildConfig.NEXT_PUBLIC_SITE_URL.trim().trimEnd('/')
            val request = Request.Builder()
                .url("$base/api/ai/explain")
                .post(payloadJson.toRequestBody(JSON_MEDIA))
                .build()
            http.newCall(request).execute().use { resp ->
                val raw = resp.body?.string().orEmpty()
                val data = try {
                    JSONObject(raw)
                } catch (e: Exception) {
                    null
                }
                if (data == null) {
                    UNAVAILABLE
                } else {
                    val text = data.optString("explanation", "").trim()
                    val error = data.optString("error", "").trim()
                    when {
                        text.isNotEmpty() -> text
                        error.isNotEmpty() -> error
                        else -> "-"
                    }
                }
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            UNAVAILABLE
        }
    }
}
