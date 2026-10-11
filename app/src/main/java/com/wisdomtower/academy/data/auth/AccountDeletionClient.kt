package com.wisdomtower.academy.data.auth

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
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Account deletion (Google Play requirement). Calls the website route `POST /api/account/delete`
 * (website commit b3604734, `src/app/api/account/delete/route.ts`) with the student's own access token.
 * The server reads the user from the token and does the deleting with the service-role key, which
 * never leaves the server. Body `{ "confirm": "DELETE" }` is required by the route.
 *
 * Reuses [AccountCallResult] from SupabaseAccountClient.kt. NOT compiled, NOT tested on a phone.
 */
object AccountDeletionClient {
    private const val TAG = "AccountDeletion"
    private const val SESSION_EXPIRED = "Your session expired. Please sign in again."
    private const val NO_INTERNET = "Check your internet connection and try again."
    private const val GENERIC =
        "Could not delete the account. Please try again, or contact support."

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    private val siteUrl: String get() = BuildConfig.NEXT_PUBLIC_SITE_URL.trim().trimEnd('/')

    suspend fun deleteAccount(accessToken: String): AccountCallResult =
        withContext(Dispatchers.IO) {
            if (accessToken.isBlank()) {
                return@withContext AccountCallResult.Failure(SESSION_EXPIRED, true)
            }
            try {
                val request = Request.Builder()
                    .url("$siteUrl/api/account/delete")
                    .addHeader("Authorization", "Bearer $accessToken")
                    .addHeader("Accept", "application/json")
                    .post(JSONObject().put("confirm", "DELETE").toString().toRequestBody(JSON_MEDIA))
                    .build()
                http.newCall(request).execute().use { resp ->
                    val text = resp.body?.string().orEmpty()
                    val obj = try {
                        JSONObject(text)
                    } catch (_: Exception) {
                        null
                    }
                    when {
                        resp.isSuccessful && obj?.optBoolean("success", false) == true ->
                            AccountCallResult.Success

                        resp.code == 401 -> AccountCallResult.Failure(SESSION_EXPIRED, true)

                        else -> {
                            Log.w(TAG, "deleteAccount failed: HTTP ${resp.code}")
                            val message = obj?.optString("error").orEmpty()
                            AccountCallResult.Failure(message.ifBlank { GENERIC })
                        }
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: IOException) {
                AccountCallResult.Failure(NO_INTERNET)
            } catch (e: Exception) {
                AccountCallResult.Failure(GENERIC)
            }
        }
}
