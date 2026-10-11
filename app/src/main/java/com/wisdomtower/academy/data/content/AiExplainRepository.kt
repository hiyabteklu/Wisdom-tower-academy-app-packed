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
 * AI helpers of the native learning screens (plan step N10). Both call the website route `/api/ai/explain`
 * (website-reference/src/app/api/ai/explain/route.ts): the AI keys stay on the website server, the route needs
 * no sign-in, and it keeps its own shared cache of answers.
 *  - [explain]: "Explain with AI" of the quiz screen. The body is the one the website's `QuizExamViewer.tsx` sends:
 *    `{ mode: "question", text, question, choices, studentAnswer, correctAnswer, solution, resourceId }`.
 *    Fallbacks: the route's `explanation`, else its `error`, else "-"; "AI unavailable" when unreachable.
 *  - [summarize]: the "Summary" button of a short note. The body is the one the website's `NotesViewer.tsx` sends:
 *    `{ text: first 8000 characters of the note, resourceId, mode: "summarize" }`. Fallbacks as the website:
 *    `explanation`, else `error`, else "No summary returned."; "Could not reach AI. Try again later." when unreachable.
 *
 * Never throws (except cancellation), never logs the question or note text.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object AiExplainRepository {
    private const val UNAVAILABLE = "AI unavailable"
    private const val SUMMARY_EMPTY = "No summary returned."
    private const val SUMMARY_UNREACHABLE = "Could not reach AI. Try again later."

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(40, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    suspend fun explain(payloadJson: String): String = post(payloadJson, "-", UNAVAILABLE)

    suspend fun summarize(noteText: String, resourceId: String): String {
        val payload = JSONObject()
            .put("text", noteText.take(8000))
            .put("resourceId", resourceId)
            .put("mode", "summarize")
            .toString()
        return post(payload, SUMMARY_EMPTY, SUMMARY_UNREACHABLE)
    }

    private suspend fun post(payloadJson: String, emptyText: String, unreachableText: String): String =
        withContext(Dispatchers.IO) {
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
                        unreachableText
                    } else {
                        val text = data.optString("explanation", "").trim()
                        val error = data.optString("error", "").trim()
                        when {
                            text.isNotEmpty() -> text
                            error.isNotEmpty() -> error
                            else -> emptyText
                        }
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                unreachableText
            }
        }
}
