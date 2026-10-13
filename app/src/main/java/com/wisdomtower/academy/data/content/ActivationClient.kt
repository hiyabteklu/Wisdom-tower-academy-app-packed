package com.wisdomtower.academy.data.content

import android.util.Log
import com.wisdomtower.academy.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

/** Answer of the "redeem activation code" call. */
sealed class RedeemResult {
    /** The code worked (or this student had already used it): [packageIds] are now owned. */
    data class Success(
        val packageIds: List<String>,
        val packageName: String?,
        val already: Boolean
    ) : RedeemResult()

    data class Failure(val message: String, val sessionExpired: Boolean = false) : RedeemResult()
}

/**
 * Talks to Supabase with the student's own login (never a secret key):
 *  - [redeem]: RPC `public.redeem_activation_code(p_code)` (SQL in `docs/sql/activation_codes.sql`). The server
 *    checks the code, marks it used and adds a row to `public.enrollments` for the signed-in student.
 *  - [fetchOwnedPackageIds]: reads the student's OWN rows (row level security shows only those) of
 *    `enrollments`, `access_grants` and verified `orders`: the same three sources as the website's
 *    `lib/ownership.ts`.
 *
 * STATUS: written, NOT compiled, NOT tested on a device. The SQL must be applied in Supabase first.
 */
object ActivationClient {
    private const val TAG = "ActivationClient"
    private const val SESSION_EXPIRED = "Your session expired. Please sign in again."
    private const val NO_INTERNET = "Check your internet connection and try again."
    private const val GENERIC = "Could not check the code. Please try again."

    private val http = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .callTimeout(20, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    suspend fun redeem(code: String, accessToken: String): RedeemResult = withContext(Dispatchers.IO) {
        if (accessToken.isBlank()) {
            return@withContext RedeemResult.Failure(SESSION_EXPIRED, true)
        }
        try {
            val body = JSONObject().put("p_code", code.trim()).toString().toRequestBody(JSON_MEDIA)
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/rpc/redeem_activation_code")
                .addHeader("apikey", anonKey)
                .addHeader("Authorization", "Bearer $accessToken")
                .addHeader("Accept", "application/json")
                .post(body)
                .build()
            http.newCall(request).execute().use { resp ->
                parseRedeem(resp.code, resp.body?.string().orEmpty())
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: IOException) {
            RedeemResult.Failure(NO_INTERNET)
        } catch (e: Exception) {
            Log.w(TAG, "redeem failed: ${e.javaClass.simpleName}")
            RedeemResult.Failure(GENERIC)
        }
    }

    private fun parseRedeem(httpCode: Int, text: String): RedeemResult {
        if (httpCode == 401) return RedeemResult.Failure(SESSION_EXPIRED, true)
        val obj = try {
            JSONObject(text)
        } catch (_: Exception) {
            null
        }
        if (httpCode !in 200..299 || obj == null) {
            Log.w(TAG, "redeem failed: HTTP $httpCode")
            return RedeemResult.Failure(GENERIC)
        }
        if (obj.optBoolean("ok", false)) {
            val name = if (obj.isNull("package_name")) null else obj.optString("package_name").ifBlank { null }
            return RedeemResult.Success(
                packageIds = readStrings(obj.optJSONArray("package_ids")),
                packageName = name,
                already = obj.optBoolean("already", false)
            )
        }
        return when (obj.optString("error")) {
            "invalid_code" -> RedeemResult.Failure("That code is not valid. Check it and try again.")
            "already_used" -> RedeemResult.Failure("This code has already been used.")
            "expired" -> RedeemResult.Failure("This code has expired.")
            "too_many_attempts" -> RedeemResult.Failure("Too many attempts. Please wait a while and try again.")
            "not_signed_in" -> RedeemResult.Failure(SESSION_EXPIRED, true)
            else -> RedeemResult.Failure(GENERIC)
        }
    }

    private fun readStrings(array: JSONArray?): List<String> {
        if (array == null) return emptyList()
        val out = ArrayList<String>()
        for (i in 0 until array.length()) {
            val value = array.optString(i)
            if (value.isNotBlank()) out.add(value)
        }
        return out
    }

    /**
     * Package ids the signed-in student owns by purchase, grant or code, or null when they could not be read
     * (all three reads must work, so a network hiccup never shrinks what the student owns).
     */
    suspend fun fetchOwnedPackageIds(accessToken: String): Set<String>? = withContext(Dispatchers.IO) {
        if (accessToken.isBlank()) {
            return@withContext null
        }
        try {
            val out = HashSet<String>()
            out.addAll(fetchColumn("enrollments", null, accessToken))
            out.addAll(fetchColumn("access_grants", null, accessToken))
            out.addAll(fetchColumn("orders", "eq.verified", accessToken))
            out
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "ownership read failed: ${e.javaClass.simpleName}")
            null
        }
    }

    private fun fetchColumn(table: String, statusFilter: String?, accessToken: String): List<String> {
        val builder = "$supabaseUrl/rest/v1/$table".toHttpUrl().newBuilder()
            .addQueryParameter("select", "package_id")
        if (statusFilter != null) builder.addQueryParameter("status", statusFilter)
        val request = Request.Builder()
            .url(builder.build().toString())
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $accessToken")
            .addHeader("Accept", "application/json")
            .get()
            .build()
        val text = http.newCall(request).execute().use { resp ->
            val body = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IllegalStateException("HTTP ${resp.code}")
            body
        }
        val rows = JSONArray(text)
        val out = ArrayList<String>()
        for (i in 0 until rows.length()) {
            val row = rows.optJSONObject(i) ?: continue
            val id = row.optString("package_id")
            if (id.isNotBlank()) out.add(id)
        }
        return out
    }
}
