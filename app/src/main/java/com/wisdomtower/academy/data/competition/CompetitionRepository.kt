package com.wisdomtower.academy.data.competition

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
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

/** Why a competition call failed. Show [CompetitionResult.Failed.message]; branch on this for behaviour. */
enum class CompetitionError {
    OFFLINE,
    NOT_SIGNED_IN,
    NOT_LIVE,
    PRACTICE_NOT_OPEN,
    ALREADY_SUBMITTED,
    EXPIRED,
    NOT_ALLOWED_AUDIENCE,
    NOT_ALLOWED_PACKAGE,
    NOT_FOUND,
    REVIEW_NOT_OPEN,
    DISQUALIFIED,
    BAD_INPUT,
    SERVER
}

/**
 * Result of a competition call. [Failed.message] is plain language, safe to show to the student.
 * [Failed.detail] carries the admin's reason for [CompetitionError.DISQUALIFIED] (that student only), else null.
 */
sealed class CompetitionResult<out T> {
    data class Ok<T>(val value: T) : CompetitionResult<T>()

    data class Failed(
        val error: CompetitionError,
        val message: String,
        val detail: String? = null
    ) : CompetitionResult<Nothing>()
}

/**
 * C3 slice 2: calls the competition RPCs (`docs/COMPETITION_API_CONTRACT.md`) with the signed-in student's
 * own token, the same way `ExamAttemptRepository` does (refresh before the call, one forced refresh and one
 * retry after HTTP 401). Parses with [CompetitionParsers]. Never logs tokens or bodies, only HTTP status codes.
 *
 * SERVER TIME: every time that matters (phase, deadline, result) is decided by the database. The phone clock
 * is used ONLY to draw the countdown, through [serverNowMs], which is the phone clock plus the offset learned
 * from the server (`server_now` in [listCompetitions] / [start], or [syncServerTime]). The offset uses the
 * middle of the request time, so a slow network adds at most half the round-trip of error to the countdown.
 *
 * HOW SCREENS SHOULD USE IT (found by the C1 SQL test T33, `docs/SESSION_2026-10-14_I.md`):
 *  - Call [listCompetitions] when the hub opens: it also finalizes overdue attempts on the server.
 *  - [start] answers `ALREADY_SUBMITTED` for a finished or timed-out ranked attempt: treat that as
 *    "show my result" (leaderboard / review after close), not as a crash.
 *  - After `NOT_LIVE` / `EXPIRED` refresh the list; the server's phase is the truth.
 *
 * STATUS: `[~]` written, NOT compiled, NOT tested on a device. Nothing calls it yet.
 */
object CompetitionRepository {
    private const val TAG = "CompetitionRepo"

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()
    private val UUID_REGEX = Regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    // ---------- server clock (countdown only) ----------

    @Volatile
    private var offsetMs: Long = 0L

    @Volatile
    private var offsetKnown: Boolean = false

    /** Phone clock corrected by the server offset. Use ONLY to draw countdowns. */
    fun serverNowMs(): Long = System.currentTimeMillis() + offsetMs

    /** False until one call has returned the server time; before that [serverNowMs] is just the phone clock. */
    fun isServerTimeKnown(): Boolean = offsetKnown

    private fun noteServerTime(serverMs: Long, localMidMs: Long) {
        offsetMs = serverMs - localMidMs
        offsetKnown = true
    }

    // ---------- student calls ----------

    /** Asks the server for its clock and stores the offset. Returns the server time in epoch milliseconds. */
    suspend fun syncServerTime(): CompetitionResult<Long> =
        rpc("competition_server_time", JSONObject()) { body, mid ->
            val ms = CompetitionParsers.parseTimeMs(body.trim().removeSurrounding("\""))
            if (ms != null) noteServerTime(ms, mid)
            ms
        }

    /** The contests this student may see (published, right audience), with phase and own attempt. */
    suspend fun listCompetitions(): CompetitionResult<CompetitionList> =
        rpc("list_competitions", JSONObject()) { body, mid ->
            val list = CompetitionParsers.parseList(JSONObject(body))
            val now = list.serverNowMs
            if (now != null) noteServerTime(now, mid)
            list
        }

    /** Clears the "new" dot of one contest. */
    suspend fun markSeen(competitionId: String): CompetitionResult<Unit> {
        if (!isUuid(competitionId)) return failed(CompetitionError.BAD_INPUT)
        return rpc("mark_competition_seen", JSONObject().put("p_competition_id", competitionId)) { _, _ -> Unit }
    }

    /**
     * Starts (or resumes) the attempt. [ranked] true = the one ranked attempt (only while the contest is live);
     * false = practice (only after it ended). The returned questions carry no answers.
     */
    suspend fun start(competitionId: String, ranked: Boolean): CompetitionResult<CompetitionSession> {
        if (!isUuid(competitionId)) return failed(CompetitionError.BAD_INPUT)
        val args = JSONObject()
            .put("p_competition_id", competitionId)
            .put("p_mode", if (ranked) "ranked" else "practice")
        return rpc("start_competition", args) { body, mid ->
            val session = CompetitionParsers.parseSession(JSONObject(body))
            val now = session?.serverNowMs
            if (now != null) noteServerTime(now, mid)
            session
        }
    }

    /** Autosave. [answers] maps question id to the chosen choice index. Refused after the deadline or submit. */
    suspend fun saveAnswers(entryId: String, answers: Map<String, Int>): CompetitionResult<Unit> {
        if (!isUuid(entryId)) return failed(CompetitionError.BAD_INPUT)
        val args = JSONObject()
            .put("p_entry_id", entryId)
            .put("p_answers", answersJson(answers))
        return rpc("save_competition_answers", args) { _, _ -> Unit }
    }

    /**
     * Submits. Safe to call twice (the second call just returns the same result). When the deadline already
     * passed the server grades the SAVED answers and ignores [answers]. Pass the latest answers so nothing is lost.
     */
    suspend fun submit(entryId: String, answers: Map<String, Int>?): CompetitionResult<SubmitResult> {
        if (!isUuid(entryId)) return failed(CompetitionError.BAD_INPUT)
        val args = JSONObject().put("p_entry_id", entryId)
        if (answers != null) args.put("p_answers", answersJson(answers))
        return rpc("submit_competition", args) { body, _ -> CompetitionParsers.parseSubmit(JSONObject(body)) }
    }

    /** Leaderboard; `LeaderboardResult.NotAvailable` until the window has closed. */
    suspend fun leaderboard(competitionId: String): CompetitionResult<LeaderboardResult> {
        if (!isUuid(competitionId)) return failed(CompetitionError.BAD_INPUT)
        return rpc("competition_leaderboard", JSONObject().put("p_competition_id", competitionId)) { body, _ ->
            CompetitionParsers.parseLeaderboard(JSONObject(body))
        }
    }

    /** Answer review; only after the window closed (`REVIEW_NOT_OPEN` before). [entryId] null = my ranked attempt. */
    suspend fun review(competitionId: String, entryId: String? = null): CompetitionResult<ReviewResult> {
        if (!isUuid(competitionId)) return failed(CompetitionError.BAD_INPUT)
        if (entryId != null && !isUuid(entryId)) return failed(CompetitionError.BAD_INPUT)
        val args = JSONObject().put("p_competition_id", competitionId)
        if (entryId != null) args.put("p_entry_id", entryId)
        return rpc("competition_review", args) { body, _ -> CompetitionParsers.parseReview(JSONObject(body)) }
    }

    /** Cumulative competition points (shown in Account, decision B). */
    suspend fun myPoints(): CompetitionResult<MyPoints> =
        rpc("get_my_competition_points", JSONObject()) { body, _ -> CompetitionParsers.parsePoints(JSONObject(body)) }

    // ---------- error text ----------

    /**
     * Maps the database's exception text (see the RPC bodies in `docs/sql/competitions_v1.sql`, each starts with a
     * fixed word such as `ranked_not_live: phase is closed`) to a [CompetitionError]. Unknown text becomes SERVER.
     */
    fun mapServerMessage(raw: String): CompetitionError {
        val m = raw.trim()
        return when {
            m.startsWith("not_signed_in") -> CompetitionError.NOT_SIGNED_IN
            m.startsWith("ranked_not_live") -> CompetitionError.NOT_LIVE
            m.startsWith("practice_not_open") -> CompetitionError.PRACTICE_NOT_OPEN
            m.startsWith("already_submitted") -> CompetitionError.ALREADY_SUBMITTED
            m.startsWith("expired") || m.startsWith("deadline_passed") -> CompetitionError.EXPIRED
            m.startsWith("not_allowed: package") -> CompetitionError.NOT_ALLOWED_PACKAGE
            m.startsWith("not_allowed") -> CompetitionError.NOT_ALLOWED_AUDIENCE
            m.startsWith("competition_not_found") || m.startsWith("entry_not_found") -> CompetitionError.NOT_FOUND
            m.startsWith("review_not_open") -> CompetitionError.REVIEW_NOT_OPEN
            m.startsWith("disqualified") -> CompetitionError.DISQUALIFIED
            m.startsWith("bad_answers") || m.startsWith("bad_mode") -> CompetitionError.BAD_INPUT
            else -> CompetitionError.SERVER
        }
    }

    private fun messageFor(error: CompetitionError): String = when (error) {
        CompetitionError.OFFLINE -> "Check your internet connection and try again."
        CompetitionError.NOT_SIGNED_IN -> "Please sign in to join competitions."
        CompetitionError.NOT_LIVE -> "This competition is not open right now."
        CompetitionError.PRACTICE_NOT_OPEN -> "Practice opens after the competition ends."
        CompetitionError.ALREADY_SUBMITTED -> "You have already submitted this competition."
        CompetitionError.EXPIRED -> "The time for this competition has ended."
        CompetitionError.NOT_ALLOWED_AUDIENCE -> "This competition is not available for your level."
        CompetitionError.NOT_ALLOWED_PACKAGE -> "This competition is not included in your account."
        CompetitionError.NOT_FOUND -> "This competition is no longer available."
        CompetitionError.REVIEW_NOT_OPEN -> "Answers open after the competition ends."
        CompetitionError.DISQUALIFIED -> "You were disqualified from this competition."
        CompetitionError.BAD_INPUT -> "Something went wrong. Please try again."
        CompetitionError.SERVER -> "Unable to reach the competition service right now. Please try again."
    }

    // ---------- internals ----------

    private fun failed(error: CompetitionError, detail: String? = null): CompetitionResult.Failed =
        CompetitionResult.Failed(error, messageFor(error), detail)

    private fun isUuid(value: String): Boolean = UUID_REGEX.matches(value)

    private fun answersJson(answers: Map<String, Int>): JSONObject {
        val out = JSONObject()
        for ((questionId, choice) in answers) out.put(questionId, choice)
        return out
    }

    private fun errorMessage(body: String): String =
        runCatching { JSONObject(body).optString("message") }.getOrDefault("")

    private class Reply(val code: Int, val body: String, val midMs: Long)

    private fun send(name: String, token: String, args: JSONObject): Reply {
        val startMs = System.currentTimeMillis()
        val request = Request.Builder()
            .url("$supabaseUrl/rest/v1/rpc/$name")
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Accept", "application/json")
            .post(args.toString().toRequestBody(JSON_MEDIA))
            .build()
        http.newCall(request).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            val endMs = System.currentTimeMillis()
            return Reply(resp.code, text, (startMs + endMs) / 2)
        }
    }

    /**
     * One RPC call with the student's token: refresh if needed, one forced refresh + retry on HTTP 401.
     * HTTP 400 carries the database's exception text in `message`. [parse] gets the body and the phone-clock
     * midpoint of the request; returning null means "unexpected answer".
     */
    private suspend fun <T> rpc(
        name: String,
        args: JSONObject,
        parse: (body: String, localMidMs: Long) -> T?
    ): CompetitionResult<T> = withContext(Dispatchers.IO) {
        try {
            AuthStateManager.refreshIfNeeded()
            val first = AuthStateManager.currentUser.value
            val token1 = first?.accessToken
            if (first == null || token1.isNullOrBlank()) {
                return@withContext failed(CompetitionError.NOT_SIGNED_IN)
            }
            var reply = send(name, token1, args)
            if (reply.code == 401 && AuthStateManager.refreshIfNeeded(force = true)) {
                val token2 = AuthStateManager.currentUser.value?.accessToken
                if (!token2.isNullOrBlank()) reply = send(name, token2, args)
            }
            when {
                reply.code in 200..299 -> {
                    val value = parse(reply.body, reply.midMs)
                    if (value != null) CompetitionResult.Ok(value) else failed(CompetitionError.SERVER)
                }
                reply.code == 401 -> failed(CompetitionError.NOT_SIGNED_IN)
                reply.code == 400 -> {
                    val raw = errorMessage(reply.body)
                    val error = mapServerMessage(raw)
                    val reason = if (error == CompetitionError.DISQUALIFIED) {
                        raw.substringAfter(':', "").trim().ifEmpty { null }
                    } else null
                    failed(error, reason)
                }
                else -> {
                    Log.w(TAG, "$name failed: HTTP ${reply.code}")
                    failed(CompetitionError.SERVER)
                }
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: IOException) {
            failed(CompetitionError.OFFLINE)
        } catch (e: Exception) {
            Log.w(TAG, "$name failed: ${e.javaClass.simpleName}")
            failed(CompetitionError.SERVER)
        }
    }
}
