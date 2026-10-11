package com.wisdomtower.academy.data.auth

import android.util.Log
import com.wisdomtower.academy.BuildConfig
import com.wisdomtower.academy.data.model.UserProfile
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.TimeUnit

/** Result of a call that only needs "worked" or "failed with a message safe to show to the student". */
sealed class AccountCallResult {
    object Success : AccountCallResult()

    data class Failure(val message: String, val sessionExpired: Boolean = false) : AccountCallResult()
}

/** Outcome of reading the student's `profiles` row: the caller can tell "no row" from "failed". */
sealed class ProfileFetchResult {
    data class Found(val profile: UserProfile) : ProfileFetchResult()

    /** The call worked but this student has no row yet. */
    object NotFound : ProfileFetchResult()

    object SessionExpired : ProfileFetchResult()

    /** Network or server problem: nothing is known about the row. */
    object Failed : ProfileFetchResult()
}

/**
 * Real server calls for the signed-in student, against the SAME Supabase project as the website
 * (public URL + anon key from BuildConfig, the student's own access token; no secrets):
 *  - [updatePassword]: same as the website settings page `supabase.auth.updateUser({ password })`.
 *  - [fetchProfile] / [saveProfile]: same table and columns as the website `lib/profile.ts`
 *    (`public.profiles`, read `select *`, write `update ... where id = user id`; if the student has no
 *    row yet it is created, like the website's `ensureProfile`).
 *
 * STATUS: compiles in CI (builds #43/#44), NOT yet tested on a device (see STATUS.md).
 */
object SupabaseAccountClient {
    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    private const val TAG = "SupabaseAccount"
    private val UUID_REGEX = Regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")

    private const val SESSION_EXPIRED = "Your session expired. Please sign in again."
    private const val NO_INTERNET = "Check your internet connection and try again."
    private const val SERVER_SAVE_FAILED =
        "Could not save to the server. Your changes are saved on this phone only."

    // ---------- password ----------

    suspend fun updatePassword(accessToken: String, newPassword: String): AccountCallResult =
        withContext(Dispatchers.IO) {
            if (accessToken.isBlank()) {
                return@withContext AccountCallResult.Failure(SESSION_EXPIRED, true)
            }
            try {
                val request = Request.Builder()
                    .url("$supabaseUrl/auth/v1/user")
                    .addHeader("apikey", anonKey)
                    .addHeader("Authorization", "Bearer $accessToken")
                    .put(JSONObject().put("password", newPassword).toString().toRequestBody(JSON_MEDIA))
                    .build()
                http.newCall(request).execute().use { resp ->
                    val text = resp.body?.string().orEmpty()
                    if (resp.isSuccessful) AccountCallResult.Success else passwordFailure(resp.code, text)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: IOException) {
                AccountCallResult.Failure(NO_INTERNET)
            } catch (e: Exception) {
                AccountCallResult.Failure("Failed to update password")
            }
        }

    private fun passwordFailure(httpCode: Int, body: String): AccountCallResult.Failure {
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
        return when {
            httpCode == 401 || code == "bad_jwt" || code == "session_not_found" || code.contains("jwt") ->
                AccountCallResult.Failure(SESSION_EXPIRED, true)

            code == "weak_password" || msg.contains("password should be") ->
                AccountCallResult.Failure("Password must be at least 6 characters.")

            code == "same_password" || msg.contains("different from the old password") ->
                AccountCallResult.Failure("New password should be different from the old password.")

            httpCode == 429 || code.contains("rate_limit") ->
                AccountCallResult.Failure("Too many attempts. Please wait a moment and try again.")

            else -> AccountCallResult.Failure("Failed to update password")
        }
    }

    // ---------- profile ----------

    /**
     * Reads the student's row from `profiles`. Tells apart: found, no row yet, session expired (401)
     * and any other failure, so the caller never treats a failed call as "no profile".
     */
    suspend fun fetchProfile(userId: String, accessToken: String, base: UserProfile?): ProfileFetchResult =
        withContext(Dispatchers.IO) {
            if (!UUID_REGEX.matches(userId) || accessToken.isBlank()) return@withContext ProfileFetchResult.Failed
            try {
                val request = Request.Builder()
                    .url("$supabaseUrl/rest/v1/profiles?id=eq.$userId&select=*")
                    .addHeader("apikey", anonKey)
                    .addHeader("Authorization", "Bearer $accessToken")
                    .addHeader("Accept", "application/json")
                    .get()
                    .build()
                http.newCall(request).execute().use { resp ->
                    when {
                        resp.code == 401 -> ProfileFetchResult.SessionExpired
                        !resp.isSuccessful -> {
                            Log.w(TAG, "fetchProfile failed: HTTP ${resp.code}")
                            ProfileFetchResult.Failed
                        }
                        else -> {
                            val arr = JSONArray(resp.body?.string().orEmpty())
                            if (arr.length() == 0) {
                                ProfileFetchResult.NotFound
                            } else {
                                ProfileFetchResult.Found(rowToProfile(arr.getJSONObject(0), userId, base))
                            }
                        }
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                ProfileFetchResult.Failed
            }
        }

    /**
     * Writes the student's profile fields to `profiles`. Only fields that are not null are sent,
     * so unknown values never overwrite server data. Success only when the server really returned
     * the updated row (a row-level-security refusal returns no row and is reported as a failure).
     * [includeDailyGoal] must be false when the app never read the server value (the model's 45 is
     * then only a default and must not overwrite the student's real goal).
     */
    suspend fun saveProfile(
        userId: String,
        accessToken: String,
        profile: UserProfile,
        includeDailyGoal: Boolean = true
    ): AccountCallResult =
        withContext(Dispatchers.IO) {
            if (!UUID_REGEX.matches(userId)) {
                return@withContext AccountCallResult.Failure(SERVER_SAVE_FAILED)
            }
            if (accessToken.isBlank()) {
                return@withContext AccountCallResult.Failure(SESSION_EXPIRED, true)
            }
            try {
                val body = profileBody(profile, includeDailyGoal)
                val (code, text) = send(
                    "PATCH",
                    "$supabaseUrl/rest/v1/profiles?id=eq.$userId",
                    accessToken,
                    body,
                    "return=representation"
                )
                if (code == 401) return@withContext AccountCallResult.Failure(SESSION_EXPIRED, true)
                if (code in 200..299 && rowCount(text) > 0) return@withContext AccountCallResult.Success

                if (code in 200..299) {
                    // No row for this student yet: create it, like the website's ensureProfile.
                    body.put("id", userId)
                    val (code2, text2) = send(
                        "POST",
                        "$supabaseUrl/rest/v1/profiles?on_conflict=id",
                        accessToken,
                        body,
                        "resolution=merge-duplicates,return=representation"
                    )
                    if (code2 == 401) return@withContext AccountCallResult.Failure(SESSION_EXPIRED, true)
                    if (code2 in 200..299 && rowCount(text2) > 0) return@withContext AccountCallResult.Success
                    Log.w(TAG, "saveProfile failed: PATCH $code returned no row, POST $code2")
                } else {
                    Log.w(TAG, "saveProfile failed: PATCH $code")
                }
                AccountCallResult.Failure(SERVER_SAVE_FAILED)
            } catch (e: CancellationException) {
                throw e
            } catch (e: IOException) {
                AccountCallResult.Failure(NO_INTERNET)
            } catch (e: Exception) {
                AccountCallResult.Failure(SERVER_SAVE_FAILED)
            }
        }

    // ---------- internals ----------

    private fun send(method: String, url: String, token: String, body: JSONObject, prefer: String): Pair<Int, String> {
        val request = Request.Builder()
            .url(url)
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Accept", "application/json")
            .addHeader("Prefer", prefer)
            .method(method, body.toString().toRequestBody(JSON_MEDIA))
            .build()
        return http.newCall(request).execute().use { it.code to it.body?.string().orEmpty() }
    }

    private fun rowCount(text: String): Int = try {
        JSONArray(text).length()
    } catch (_: Exception) {
        0
    }

    private fun nowIso(): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }.format(Date())

    /** Column names exactly as in the website's `UserProfileRecord` (lib/profile.ts). */
    private fun profileBody(p: UserProfile, includeDailyGoal: Boolean): JSONObject {
        val body = JSONObject()
        fun put(key: String, value: String?) {
            if (value != null) body.put(key, value)
        }
        put("full_name", p.fullName)
        put("first_name", p.firstName)
        put("last_name", p.lastName)
        put("phone", p.phone)
        put("education_level", p.educationLevel)
        put("school_name", p.schoolName)
        put("town_region", p.townRegion)
        put("stream", p.stream)
        put("bio", p.bio)
        put("target_exam", p.targetExam)
        put("target_score", p.targetScore)
        put("preferred_study_time", p.preferredStudyTime)
        put("avatar_preset", p.avatarPreset)
        put("avatar_url", p.avatarUrl)
        if (includeDailyGoal) body.put("daily_study_goal_minutes", p.dailyStudyGoalMinutes)
        body.put("updated_at", nowIso())
        return body
    }

    private fun JSONObject.nstr(key: String): String? {
        if (!has(key) || isNull(key)) return null
        val v = optString(key)
        return if (v == "null") null else v.ifBlank { null }
    }

    private fun rowToProfile(row: JSONObject, userId: String, base: UserProfile?): UserProfile =
        UserProfile(
            id = userId,
            email = row.nstr("email") ?: base?.email,
            fullName = row.nstr("full_name") ?: base?.fullName,
            firstName = row.nstr("first_name") ?: base?.firstName,
            lastName = row.nstr("last_name") ?: base?.lastName,
            phone = row.nstr("phone") ?: base?.phone,
            educationLevel = row.nstr("education_level") ?: base?.educationLevel,
            schoolName = row.nstr("school_name") ?: base?.schoolName,
            townRegion = row.nstr("town_region") ?: base?.townRegion,
            stream = row.nstr("stream") ?: base?.stream,
            bio = row.nstr("bio") ?: base?.bio,
            targetExam = row.nstr("target_exam") ?: base?.targetExam,
            targetScore = row.nstr("target_score") ?: base?.targetScore,
            dailyStudyGoalMinutes = if (row.has("daily_study_goal_minutes") && !row.isNull("daily_study_goal_minutes")) {
                row.optInt("daily_study_goal_minutes", base?.dailyStudyGoalMinutes ?: 45)
            } else {
                base?.dailyStudyGoalMinutes ?: 45
            },
            preferredStudyTime = row.nstr("preferred_study_time") ?: base?.preferredStudyTime,
            avatarPreset = row.nstr("avatar_preset") ?: base?.avatarPreset,
            avatarUrl = row.nstr("avatar_url") ?: base?.avatarUrl,
            studentIdNumber = row.nstr("student_id_number") ?: base?.studentIdNumber,
            createdAt = row.nstr("created_at") ?: base?.createdAt
        )
}
