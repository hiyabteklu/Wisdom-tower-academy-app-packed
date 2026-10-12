package com.wisdomtower.academy.data.auth

import com.wisdomtower.academy.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

/** Result of checking the reset code. [Verified.accessToken] is a short recovery session: NEVER log it. */
sealed class RecoveryVerifyResult {
    data class Verified(val accessToken: String) : RecoveryVerifyResult()

    data class Failure(val message: String) : RecoveryVerifyResult()
}

/**
 * Native password reset against the SAME Supabase project as the website
 * (public URL + anon key from BuildConfig; no secrets).
 *
 * Flow:
 *  1. [requestReset]: POST /auth/v1/recover with the same redirect the website uses, so the e-mail
 *     link still works on the website (website forgot-password page does exactly this call).
 *  2. [verifyCode]: POST /auth/v1/verify {type: recovery, email, token}. Only works when the
 *     Supabase "Reset Password" e-mail template contains {{ .Token }} (owner step, see the
 *     session log BB). Gives a short recovery session.
 *  3. the caller sets the new password with [SupabaseAccountClient.updatePassword] (same call as
 *     the website reset page, `updateUser({ password })`), then [endRecoverySession].
 *
 * Phone-only accounts (p<digits>@phone.wisdomtower.app) have no mailbox: reset is by e-mail only,
 * like the website page (its input is type=email).
 *
 * STATUS: written, NOT yet compiled or tested on a device (see STATUS.md / session log BB).
 */
object SupabasePasswordResetClient {
    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()
    private val EMAIL_REGEX = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    // Same string as `redirectTo` in website-reference/src/app/forgot-password/page.tsx
    private const val RESET_REDIRECT = "https://wisdom-tower-academy.live/reset-password"

    private const val NO_INTERNET = "Check your internet connection and try again."
    private const val SEND_FAILED = "Could not send the reset email. Please try again."

    // Website forgot-password page wording
    private const val RATE_LIMIT_HOUR =
        "Too many reset emails sent. Please wait about 1 hour (or check spam), then try again. Google-only accounts need this link once to set a password."

    // Website reset-password page wording, "link" changed to "code"
    private const val INVALID_CODE = "Invalid or expired reset code. Please request a new one."

    fun looksLikeEmail(value: String): Boolean {
        val v = value.trim()
        return v.contains("@") && EMAIL_REGEX.matches(v)
    }

    suspend fun requestReset(email: String): AccountCallResult = withContext(Dispatchers.IO) {
        val target = email.trim().lowercase()
        if (!looksLikeEmail(target)) {
            return@withContext AccountCallResult.Failure("Enter the email address of your account.")
        }
        try {
            val url = "$supabaseUrl/auth/v1/recover".toHttpUrl().newBuilder()
                .addQueryParameter("redirect_to", RESET_REDIRECT)
                .build()
            val request = Request.Builder()
                .url(url)
                .addHeader("apikey", anonKey)
                .post(JSONObject().put("email", target).toString().toRequestBody(JSON_MEDIA))
                .build()
            http.newCall(request).execute().use { resp ->
                val text = resp.body?.string().orEmpty()
                if (resp.isSuccessful) AccountCallResult.Success else requestFailure(resp.code, text)
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: IOException) {
            AccountCallResult.Failure(NO_INTERNET)
        } catch (e: Exception) {
            AccountCallResult.Failure(SEND_FAILED)
        }
    }

    suspend fun verifyCode(email: String, code: String): RecoveryVerifyResult = withContext(Dispatchers.IO) {
        val target = email.trim().lowercase()
        val token = code.filter { !it.isWhitespace() }
        if (!looksLikeEmail(target) || token.isEmpty()) {
            return@withContext RecoveryVerifyResult.Failure(INVALID_CODE)
        }
        try {
            val body = JSONObject()
                .put("type", "recovery")
                .put("email", target)
                .put("token", token)
            val request = Request.Builder()
                .url("$supabaseUrl/auth/v1/verify")
                .addHeader("apikey", anonKey)
                .post(body.toString().toRequestBody(JSON_MEDIA))
                .build()
            val result: RecoveryVerifyResult = http.newCall(request).execute().use { resp ->
                val text = resp.body?.string().orEmpty()
                if (!resp.isSuccessful) {
                    verifyFailure(resp.code, text)
                } else {
                    val access = try {
                        JSONObject(text).optString("access_token")
                    } catch (_: Exception) {
                        ""
                    }
                    if (access.isBlank()) {
                        RecoveryVerifyResult.Failure(INVALID_CODE)
                    } else {
                        RecoveryVerifyResult.Verified(access)
                    }
                }
            }
            result
        } catch (e: CancellationException) {
            throw e
        } catch (e: IOException) {
            RecoveryVerifyResult.Failure(NO_INTERNET)
        } catch (e: Exception) {
            RecoveryVerifyResult.Failure("Something went wrong. Please try again.")
        }
    }

    /**
     * Best effort, like the website's signOut after a reset. scope=local ends only this recovery
     * session and does not sign the student out of other devices.
     */
    suspend fun endRecoverySession(accessToken: String) {
        withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("$supabaseUrl/auth/v1/logout?scope=local")
                    .addHeader("apikey", anonKey)
                    .addHeader("Authorization", "Bearer $accessToken")
                    .post("{}".toRequestBody(JSON_MEDIA))
                    .build()
                http.newCall(request).execute().close()
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                // nothing to do: the recovery session expires by itself
            }
        }
    }

    // ---------- internals ----------

    private fun parse(body: String): Pair<String, String> {
        val obj = try {
            JSONObject(body)
        } catch (_: Exception) {
            null
        }
        val code = obj?.optString("error_code").orEmpty().lowercase()
        val msg = listOf("msg", "message", "error_description")
            .map { obj?.optString(it).orEmpty() }
            .firstOrNull { it.isNotBlank() }
            .orEmpty()
            .lowercase()
        return code to msg
    }

    private fun requestFailure(httpCode: Int, body: String): AccountCallResult.Failure {
        val (code, msg) = parse(body)
        val limited = httpCode == 429 || code.contains("rate_limit") || msg.contains("rate limit")
        return when {
            limited && msg.contains("seconds") ->
                AccountCallResult.Failure("Please wait a minute, then try again.")

            limited -> AccountCallResult.Failure(RATE_LIMIT_HOUR)

            httpCode == 400 || httpCode == 422 -> AccountCallResult.Failure("Enter a valid email address.")

            else -> AccountCallResult.Failure(SEND_FAILED)
        }
    }

    private fun verifyFailure(httpCode: Int, body: String): RecoveryVerifyResult.Failure {
        val (code, _) = parse(body)
        return if (httpCode == 429 || code.contains("rate_limit")) {
            RecoveryVerifyResult.Failure("Too many attempts. Please wait a moment and try again.")
        } else {
            RecoveryVerifyResult.Failure(INVALID_CODE)
        }
    }
}
