package com.wisdomtower.academy.data.competition

import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.TimeZone

/**
 * C3 slice 1: plain data models + JSON parsers for the competition RPCs. NO network, NO Android UI.
 * Shapes come from `docs/COMPETITION_API_CONTRACT.md` and were exercised by the C1 SQL tests
 * (`docs/SESSION_2026-10-14_I.md`). Status: `[~]` written, not compiled, not phone-tested.
 *
 * Rules followed: no `java.time` (minSdk 24, no desugaring in this project), only `org.json`.
 * Times are epoch milliseconds (UTC). Every time comes from the SERVER; the phone clock is never
 * used to decide a result (the repository slice will add a server-time offset for the countdown only).
 * Nothing here invents text or numbers: a missing field stays null.
 */

/** Where a contest is in its life, as computed by the database (`private.competition_phase`). */
enum class CompetitionPhase {
    UPCOMING, PAUSED, LIVE, CLOSED, CANCELLED, UNKNOWN;

    companion object {
        fun fromServer(value: String?): CompetitionPhase = when (value) {
            "upcoming" -> UPCOMING
            "paused" -> PAUSED
            "live" -> LIVE
            "closed" -> CLOSED
            "cancelled" -> CANCELLED
            else -> UNKNOWN
        }
    }
}

/** The signed-in student's own ranked attempt, if any (`ranked_entry` in `list_competitions`). */
data class RankedEntrySummary(
    val id: String,
    /** `in_progress`, `submitted` or `auto_submitted`. */
    val status: String,
    val deadlineAtMs: Long?,
    val disqualified: Boolean
)

/**
 * One contest card from `list_competitions`.
 * [prizeTitle], [prizeDetails] and [points] are null until the window has ended (server hides them).
 * [access] is `ok` or `package`; [canEnter] is false when a package is required and missing.
 */
data class CompetitionSummary(
    val id: String,
    val title: String,
    val description: String?,
    val audience: String,
    val startsAtMs: Long,
    val endsAtMs: Long,
    val durationMin: Int,
    val questionCount: Int,
    val countdownState: String,
    val phase: CompetitionPhase,
    val requiresPackage: Boolean,
    val canEnter: Boolean,
    val access: String,
    val rankedEntry: RankedEntrySummary?,
    val practiceAvailable: Boolean,
    val unseen: Boolean,
    val prizeTitle: String?,
    val prizeDetails: String?,
    val points: Int?
)

/** [serverNowMs] is the server clock at the moment of the call (null if the server did not send it). */
data class CompetitionList(
    val serverNowMs: Long?,
    val items: List<CompetitionSummary>
)

/** A question as sent to the student: NEVER contains the correct answer or the solution. */
data class CompetitionQuestion(
    val id: String,
    val position: Int,
    val prompt: String,
    val choices: List<String>
)

/**
 * Result of `start_competition`. [mode] is `ranked` or `practice`. [deadlineAtMs] is the global
 * `ends_at` for ranked and null for practice. [answers] maps question id to the chosen choice index
 * (already-saved answers, so a restart resumes).
 */
data class CompetitionSession(
    val serverNowMs: Long?,
    val entryId: String,
    val mode: String,
    val startedAtMs: Long,
    val deadlineAtMs: Long?,
    val durationMin: Int,
    val answers: Map<String, Int>,
    val questions: List<CompetitionQuestion>
)

/** Result of `submit_competition`. [status] is `submitted` or `auto_submitted`. */
data class SubmitResult(
    val entryId: String,
    val mode: String,
    val status: String,
    val score: Int?,
    val total: Int?,
    val correctCount: Int?,
    val timeTakenMs: Long?,
    val submittedAtMs: Long?
)

data class LeaderboardRow(
    val rank: Int,
    val name: String,
    val score: Int,
    val total: Int,
    val timeTakenMs: Long
)

/** Result of `competition_leaderboard`. Before the window closes the server only says it is not available. */
sealed class LeaderboardResult {
    data class NotAvailable(val phase: CompetitionPhase) : LeaderboardResult()

    /**
     * [top] has ranks 1 to 10 at most. [me] is the student's own row (may be outside the top 10, or null
     * when the student has no ranked result). [disqualified] true means show [disqualifiedReason] only to
     * this student. Prize fields are plain server values.
     */
    data class Available(
        val participants: Int,
        val totalQuestions: Int,
        val top: List<LeaderboardRow>,
        val me: LeaderboardRow?,
        val disqualified: Boolean,
        val disqualifiedReason: String?,
        val prizeTitle: String?,
        val prizeDetails: String?,
        val points: Int?
    ) : LeaderboardResult()
}

/** One reviewed question (only after the window closes): correct index, solution text, student's pick. */
data class ReviewQuestion(
    val id: String,
    val position: Int,
    val prompt: String,
    val choices: List<String>,
    val correct: Int,
    val solution: String,
    val chosen: Int?
)

data class ReviewResult(
    val entryId: String,
    val mode: String,
    val score: Int?,
    val total: Int?,
    val timeTakenMs: Long?,
    val submittedAtMs: Long?,
    val questions: List<ReviewQuestion>
)

data class PointItem(
    val competitionId: String,
    val title: String,
    val points: Int,
    val createdAtMs: Long?
)

/** Result of `get_my_competition_points` (cumulative points shown in Account, decision B). */
data class MyPoints(
    val total: Int,
    val items: List<PointItem>
)

// ---------- small JSON helpers (file-private) ----------

private fun JSONObject.strOrNull(key: String): String? =
    if (!has(key) || isNull(key)) null else getString(key)

private fun JSONObject.intOrNull(key: String): Int? =
    if (!has(key) || isNull(key)) null else optInt(key)

private fun JSONObject.longOrNull(key: String): Long? =
    if (!has(key) || isNull(key)) null else optLong(key)

private fun JSONObject.timeOrNull(key: String): Long? =
    CompetitionParsers.parseTimeMs(strOrNull(key))

private fun JSONArray?.toStringList(): List<String> {
    if (this == null) return emptyList()
    val out = ArrayList<String>(length())
    for (i in 0 until length()) out.add(optString(i, ""))
    return out
}

/** `{"<question id>": <choice index>}` to a map; entries that are not a non-negative number are skipped. */
private fun JSONObject?.toAnswerMap(): Map<String, Int> {
    if (this == null) return emptyMap()
    val out = LinkedHashMap<String, Int>()
    val keyIter = keys()
    while (keyIter.hasNext()) {
        val k = keyIter.next()
        val v = optInt(k, -1)
        if (v >= 0) out[k] = v
    }
    return out
}

/** Parsers for the JSON the competition RPCs return. Each returns null (or empty) instead of throwing on missing pieces. */
object CompetitionParsers {

    private val TIME_RE =
        Regex("""^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}(?::?\d{2})?)$""")

    /**
     * Postgres timestamptz text (e.g. `2026-10-14T14:11:52.206234+00:00`) to epoch milliseconds.
     * Handles `Z`, `+00`, `+00:00`, `+0000` and a fraction of any length. Null when the text is not a timestamp.
     */
    fun parseTimeMs(text: String?): Long? {
        if (text.isNullOrBlank()) return null
        val g = TIME_RE.matchEntire(text.trim())?.groupValues ?: return null
        val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        cal.clear()
        cal.set(g[1].toInt(), g[2].toInt() - 1, g[3].toInt(), g[4].toInt(), g[5].toInt(), g[6].toInt())
        var ms = cal.timeInMillis
        if (g[7].isNotEmpty()) ms += g[7].padEnd(3, '0').take(3).toLong()
        val zone = g[8]
        if (zone != "Z") {
            val sign = if (zone[0] == '-') -1L else 1L
            val digits = zone.substring(1).replace(":", "")
            val hh = digits.substring(0, 2).toLong()
            val mm = if (digits.length >= 4) digits.substring(2, 4).toLong() else 0L
            ms -= sign * (hh * 60L + mm) * 60_000L
        }
        return ms
    }

    /** `list_competitions` result. Cards missing an id, title or time are skipped (never invented). */
    fun parseList(root: JSONObject): CompetitionList {
        val arr = root.optJSONArray("competitions") ?: JSONArray()
        val items = ArrayList<CompetitionSummary>()
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            val card = parseSummary(o)
            if (card != null) items.add(card)
        }
        return CompetitionList(root.timeOrNull("server_now"), items)
    }

    fun parseSummary(o: JSONObject): CompetitionSummary? {
        val id = o.strOrNull("id") ?: return null
        val title = o.strOrNull("title") ?: return null
        val startsAt = o.timeOrNull("starts_at") ?: return null
        val endsAt = o.timeOrNull("ends_at") ?: return null
        val entryObj = o.optJSONObject("ranked_entry")
        val entryId = entryObj?.strOrNull("id")
        val ranked = if (entryObj != null && entryId != null) {
            RankedEntrySummary(
                id = entryId,
                status = entryObj.strOrNull("status") ?: "in_progress",
                deadlineAtMs = entryObj.timeOrNull("deadline_at"),
                disqualified = entryObj.optBoolean("disqualified", false)
            )
        } else null
        return CompetitionSummary(
            id = id,
            title = title,
            description = o.strOrNull("description"),
            audience = o.strOrNull("audience") ?: "all",
            startsAtMs = startsAt,
            endsAtMs = endsAt,
            durationMin = o.optInt("duration_min", 0),
            questionCount = o.optInt("question_count", 0),
            countdownState = o.strOrNull("countdown_state") ?: "running",
            phase = CompetitionPhase.fromServer(o.strOrNull("phase")),
            requiresPackage = o.optBoolean("requires_package", false),
            canEnter = o.optBoolean("can_enter", false),
            access = o.strOrNull("access") ?: "ok",
            rankedEntry = ranked,
            practiceAvailable = o.optBoolean("practice_available", false),
            unseen = o.optBoolean("unseen", false),
            prizeTitle = o.strOrNull("prize_title"),
            prizeDetails = o.strOrNull("prize_details"),
            points = o.intOrNull("points")
        )
    }

    private fun parseQuestions(arr: JSONArray?): List<CompetitionQuestion> {
        if (arr == null) return emptyList()
        val out = ArrayList<CompetitionQuestion>()
        for (i in 0 until arr.length()) {
            val q = arr.optJSONObject(i) ?: continue
            val id = q.strOrNull("id") ?: continue
            val prompt = q.strOrNull("prompt") ?: continue
            out.add(CompetitionQuestion(id, q.optInt("position", i + 1), prompt, q.optJSONArray("choices").toStringList()))
        }
        return out.sortedBy { it.position }
    }

    /** `start_competition` result; null when the entry id or start time is missing. */
    fun parseSession(o: JSONObject): CompetitionSession? {
        val entryId = o.strOrNull("entry_id") ?: return null
        val startedAt = o.timeOrNull("started_at") ?: return null
        return CompetitionSession(
            serverNowMs = o.timeOrNull("server_now"),
            entryId = entryId,
            mode = o.strOrNull("mode") ?: "ranked",
            startedAtMs = startedAt,
            deadlineAtMs = o.timeOrNull("deadline_at"),
            durationMin = o.optInt("duration_min", 0),
            answers = o.optJSONObject("answers").toAnswerMap(),
            questions = parseQuestions(o.optJSONArray("questions"))
        )
    }

    /** `submit_competition` result. */
    fun parseSubmit(o: JSONObject): SubmitResult? {
        val entryId = o.strOrNull("entry_id") ?: return null
        return SubmitResult(
            entryId = entryId,
            mode = o.strOrNull("mode") ?: "ranked",
            status = o.strOrNull("status") ?: "submitted",
            score = o.intOrNull("score"),
            total = o.intOrNull("total"),
            correctCount = o.intOrNull("correct_count"),
            timeTakenMs = o.longOrNull("time_taken_ms"),
            submittedAtMs = o.timeOrNull("submitted_at")
        )
    }

    private fun parseRow(o: JSONObject?): LeaderboardRow? {
        if (o == null) return null
        val rank = o.intOrNull("rank") ?: return null
        return LeaderboardRow(
            rank = rank,
            name = o.strOrNull("name") ?: "Student",
            score = o.optInt("score", 0),
            total = o.optInt("total", 0),
            timeTakenMs = o.optLong("time_taken_ms", 0L)
        )
    }

    /** `competition_leaderboard` result. */
    fun parseLeaderboard(o: JSONObject): LeaderboardResult {
        if (!o.optBoolean("available", false)) {
            return LeaderboardResult.NotAvailable(CompetitionPhase.fromServer(o.strOrNull("phase")))
        }
        val topArr = o.optJSONArray("top") ?: JSONArray()
        val top = ArrayList<LeaderboardRow>()
        for (i in 0 until topArr.length()) {
            val row = parseRow(topArr.optJSONObject(i))
            if (row != null) top.add(row)
        }
        val dq = o.optJSONObject("disqualified")
        return LeaderboardResult.Available(
            participants = o.optInt("participants", 0),
            totalQuestions = o.optInt("total_questions", 0),
            top = top.sortedBy { it.rank },
            me = parseRow(o.optJSONObject("me")),
            disqualified = dq != null,
            disqualifiedReason = dq?.strOrNull("reason"),
            prizeTitle = o.strOrNull("prize_title"),
            prizeDetails = o.strOrNull("prize_details"),
            points = o.intOrNull("points")
        )
    }

    /** `competition_review` result; null when the entry block is missing. */
    fun parseReview(o: JSONObject): ReviewResult? {
        val entry = o.optJSONObject("entry") ?: return null
        val entryId = entry.strOrNull("id") ?: return null
        val arr = o.optJSONArray("questions") ?: JSONArray()
        val qs = ArrayList<ReviewQuestion>()
        for (i in 0 until arr.length()) {
            val q = arr.optJSONObject(i) ?: continue
            val id = q.strOrNull("id") ?: continue
            val prompt = q.strOrNull("prompt") ?: continue
            val correct = q.intOrNull("correct") ?: continue
            qs.add(
                ReviewQuestion(
                    id = id,
                    position = q.optInt("position", i + 1),
                    prompt = prompt,
                    choices = q.optJSONArray("choices").toStringList(),
                    correct = correct,
                    solution = q.strOrNull("solution") ?: "",
                    chosen = q.intOrNull("chosen")
                )
            )
        }
        return ReviewResult(
            entryId = entryId,
            mode = entry.strOrNull("mode") ?: "ranked",
            score = entry.intOrNull("score"),
            total = entry.intOrNull("total"),
            timeTakenMs = entry.longOrNull("time_taken_ms"),
            submittedAtMs = entry.timeOrNull("submitted_at"),
            questions = qs.sortedBy { it.position }
        )
    }

    /** `get_my_competition_points` result. */
    fun parsePoints(o: JSONObject): MyPoints {
        val arr = o.optJSONArray("items") ?: JSONArray()
        val items = ArrayList<PointItem>()
        for (i in 0 until arr.length()) {
            val p = arr.optJSONObject(i) ?: continue
            val cid = p.strOrNull("competition_id") ?: continue
            items.add(PointItem(cid, p.strOrNull("title") ?: "", p.optInt("points", 0), p.timeOrNull("created_at")))
        }
        return MyPoints(total = o.optInt("total", 0), items = items)
    }
}
