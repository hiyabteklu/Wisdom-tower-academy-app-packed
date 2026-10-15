package com.wisdomtower.academy.data.admin

import android.util.Log
import com.wisdomtower.academy.BuildConfig
import com.wisdomtower.academy.data.auth.AuthStateManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/**
 * ADMIN-entry: asks the database whether the signed-in account is an admin (RPC `am_i_admin`, which returns
 * `private.is_admin()`; SQL in `docs/sql/am_i_admin.sql`). No e-mail address is kept in the app.
 * Any failure (offline, function not installed yet, signed out) answers false, so a student never sees the button.
 * A true or false answer is remembered for the signed-in user until the app process ends.
 *
 * STATUS: `[~]` written, NOT compiled, NOT tested on a device.
 */
object AdminAccess {
    private const val TAG = "AdminAccess"

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    @Volatile
    private var cachedUserId: String? = null

    @Volatile
    private var cachedValue: Boolean = false

    private fun call(token: String): Pair<Int, String> {
        val request = Request.Builder()
            .url("$supabaseUrl/rest/v1/rpc/am_i_admin")
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Accept", "application/json")
            .post("{}".toRequestBody(JSON_MEDIA))
            .build()
        http.newCall(request).execute().use { resp ->
            return Pair(resp.code, resp.body?.string().orEmpty())
        }
    }

    suspend fun isAdmin(): Boolean = withContext(Dispatchers.IO) {
        try {
            AuthStateManager.refreshIfNeeded()
            val user = AuthStateManager.currentUser.value ?: return@withContext false
            val uid = user.id.toString()
            if (cachedUserId == uid) return@withContext cachedValue
            val token1 = user.accessToken
            if (token1.isNullOrBlank()) return@withContext false
            var reply = call(token1)
            if (reply.first == 401 && AuthStateManager.refreshIfNeeded(force = true)) {
                val token2 = AuthStateManager.currentUser.value?.accessToken
                if (!token2.isNullOrBlank()) reply = call(token2)
            }
            if (reply.first in 200..299) {
                val answer = reply.second.trim() == "true"
                cachedUserId = uid
                cachedValue = answer
                answer
            } else {
                Log.w(TAG, "am_i_admin failed: HTTP ${reply.first}")
                false
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "am_i_admin failed: ${e.javaClass.simpleName}")
            false
        }
    }
}
