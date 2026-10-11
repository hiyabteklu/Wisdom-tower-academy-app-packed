package com.wisdomtower.academy.ui.drawer

import android.util.Log
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
 * Sends the Contact form to the SAME place the website sends it: a new row in the Supabase table
 * `inquiries` (website-reference/src/app/contact/page.tsx: name, email, service or null, message,
 * status "new"). Public URL + anon key from BuildConfig only, no secrets.
 * Before 2026-10-11 the app only saved the text on the phone and still told the student
 * "Message received", which was false.
 *
 * STATUS: NOT compiled, NOT tested on a phone. If the insert is refused (HTTP 401/403) the row
 * policy of `inquiries` does not allow the anon key: logcat tag `Inquiry` shows the code.
 */
object InquirySubmitter {
    private const val TAG = "Inquiry"

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    /** Returns null when the message was stored, otherwise a plain-language error text. */
    suspend fun submit(name: String, email: String, service: String, message: String): String? =
        withContext(Dispatchers.IO) {
            val base = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
            val key = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
            if (base.isEmpty() || key.isEmpty()) {
                return@withContext "Something went wrong. Please try again."
            }
            try {
                val body = JSONObject()
                body.put("name", name.trim())
                body.put("email", email.trim())
                if (service.isEmpty()) body.put("service", JSONObject.NULL) else body.put("service", service)
                body.put("message", message.trim())
                body.put("status", "new")

                val request = Request.Builder()
                    .url("$base/rest/v1/inquiries")
                    .addHeader("apikey", key)
                    .addHeader("Authorization", "Bearer $key")
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Prefer", "return=minimal")
                    .post(body.toString().toRequestBody("application/json".toMediaType()))
                    .build()

                http.newCall(request).execute().use { resp ->
                    if (resp.isSuccessful) {
                        null
                    } else {
                        Log.w(TAG, "POST failed: HTTP ${resp.code}")
                        "Failed to submit. Please try again."
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                "Check your internet connection and try again."
            }
        }
}
