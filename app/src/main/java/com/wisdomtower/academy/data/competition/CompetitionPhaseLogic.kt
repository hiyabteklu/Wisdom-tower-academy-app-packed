package com.wisdomtower.academy.data.competition

/** What the main button of a contest card should do. The UI picks the wording; this only decides the case. */
enum class CompetitionAction {
    /** Start the one ranked attempt (live, allowed, no attempt yet). */
    JOIN,

    /** A ranked attempt is in progress: go back into the exam. */
    RESUME,

    /** Ranked attempt already handed in; results come after the window ends. */
    SUBMITTED,

    /** Window ended and the student has a ranked attempt: show leaderboard / review. */
    VIEW_RESULT,

    /** Window ended and the student took no ranked attempt: practice is open. */
    PRACTICE,

    /** Not started yet or paused: show the countdown / status, no action. */
    WAIT,

    /** Live but this student cannot take part; see [CompetitionDisplay.blockedReason]. */
    BLOCKED,

    /** Nothing to do (cancelled or unknown). */
    NONE
}

/** Which countdown to draw. */
enum class CountdownKind { NONE, STARTS_IN, ENDS_IN }

/**
 * Everything a contest card needs, computed from the server's list row and the server-corrected clock.
 *
 * [phase] is the phase after the clock moved on since the last list refresh (a card that was upcoming when
 * the list was loaded turns live at its start time without a new request). [needsRefresh] is true when that
 * local phase differs from the one the server sent: reload the list, because prize, points and practice
 * only appear after the server itself says the window is closed.
 */
data class CompetitionDisplay(
    val phase: CompetitionPhase,
    val action: CompetitionAction,
    val blockedReason: CompetitionError?,
    val countdownKind: CountdownKind,
    val countdownMs: Long,
    val canPractice: Boolean,
    val canViewLeaderboard: Boolean,
    val needsRefresh: Boolean
)

/**
 * C3 slice 3: pure logic, no Android, no network, no clock access (the caller passes the time), so it can be
 * unit-tested. Status: `[~]` written, NOT compiled, nothing calls it yet.
 *
 * Rules implemented (owner decisions in `docs/COMPETITION_STATUS.md`): ranked only while live (A); a late joiner
 * keeps the global deadline and cannot restart (C, the server enforces it; RESUME only when an attempt is in
 * progress); practice only after the window ended (A); everyone in the audience sees the leaderboard after the
 * window ends (G); a disqualified student is blocked while live and still sees the result screen after (F).
 * The SERVER stays the judge: if the phone clock is a little off and the server refuses, the repository returns
 * `NOT_LIVE` / `EXPIRED` and the screen refreshes the list.
 */
object CompetitionPhaseLogic {

    /** [nowMs] should be `CompetitionRepository.serverNowMs()`; [serverTimeKnown] is `isServerTimeKnown()`. */
    fun describe(summary: CompetitionSummary, nowMs: Long, serverTimeKnown: Boolean): CompetitionDisplay {
        val phase = effectivePhase(summary, nowMs, serverTimeKnown)
        val entry = summary.rankedEntry

        val blocked: CompetitionError? = when {
            !summary.canEnter ->
                if (summary.access == "package") CompetitionError.NOT_ALLOWED_PACKAGE else CompetitionError.NOT_ALLOWED_AUDIENCE
            entry != null && entry.disqualified -> CompetitionError.DISQUALIFIED
            else -> null
        }

        var kind = CountdownKind.NONE
        var countdown = 0L
        if (phase == CompetitionPhase.UPCOMING) {
            kind = CountdownKind.STARTS_IN
            countdown = maxOf(0L, summary.startsAtMs - nowMs)
        } else if (phase == CompetitionPhase.LIVE) {
            kind = CountdownKind.ENDS_IN
            countdown = maxOf(0L, summary.endsAtMs - nowMs)
        }

        val canPractice = phase == CompetitionPhase.CLOSED && summary.canEnter

        val action = when (phase) {
            CompetitionPhase.CANCELLED, CompetitionPhase.UNKNOWN -> CompetitionAction.NONE
            CompetitionPhase.PAUSED, CompetitionPhase.UPCOMING -> CompetitionAction.WAIT
            CompetitionPhase.LIVE -> when {
                blocked != null -> CompetitionAction.BLOCKED
                entry == null -> CompetitionAction.JOIN
                entry.status == "in_progress" -> CompetitionAction.RESUME
                else -> CompetitionAction.SUBMITTED
            }
            CompetitionPhase.CLOSED -> when {
                entry != null -> CompetitionAction.VIEW_RESULT
                canPractice -> CompetitionAction.PRACTICE
                else -> CompetitionAction.NONE
            }
        }

        return CompetitionDisplay(
            phase = phase,
            action = action,
            blockedReason = if (action == CompetitionAction.BLOCKED) blocked else null,
            countdownKind = kind,
            countdownMs = countdown,
            canPractice = canPractice,
            canViewLeaderboard = phase == CompetitionPhase.CLOSED,
            needsRefresh = summary.phase != CompetitionPhase.UNKNOWN && phase != summary.phase
        )
    }

    /**
     * The server's phase, moved forward by the clock only for the two natural transitions (upcoming to live to
     * closed). Paused and cancelled never change by themselves. Without a known server offset the server's
     * phase is used as it is.
     */
    fun effectivePhase(summary: CompetitionSummary, nowMs: Long, serverTimeKnown: Boolean): CompetitionPhase {
        if (!serverTimeKnown) return summary.phase
        return when (summary.phase) {
            CompetitionPhase.UPCOMING ->
                if (nowMs >= summary.endsAtMs) CompetitionPhase.CLOSED
                else if (nowMs >= summary.startsAtMs) CompetitionPhase.LIVE
                else CompetitionPhase.UPCOMING
            CompetitionPhase.LIVE ->
                if (nowMs >= summary.endsAtMs) CompetitionPhase.CLOSED else CompetitionPhase.LIVE
            else -> summary.phase
        }
    }

    /**
     * Milliseconds left for an exam in progress (never below 0), or null when there is no deadline (practice).
     * When it reaches 0 the screen submits; the server grades the saved answers if the deadline already passed.
     */
    fun remainingMs(deadlineAtMs: Long?, nowMs: Long): Long? =
        if (deadlineAtMs == null) null else maxOf(0L, deadlineAtMs - nowMs)

    /** `HH:MM:SS`, or `Nd HH:MM:SS` from one day up. Negative input is shown as zero. */
    fun formatCountdown(ms: Long): String {
        val total = if (ms < 0L) 0L else ms / 1000L
        val days = total / 86_400L
        val hours = (total % 86_400L) / 3_600L
        val minutes = (total % 3_600L) / 60L
        val seconds = total % 60L
        val clock = two(hours) + ":" + two(minutes) + ":" + two(seconds)
        return if (days > 0L) "${days}d $clock" else clock
    }

    /** One plain word for the phase badge. Empty for [CompetitionPhase.UNKNOWN] (never invent a status). */
    fun phaseLabel(phase: CompetitionPhase): String = when (phase) {
        CompetitionPhase.UPCOMING -> "Upcoming"
        CompetitionPhase.PAUSED -> "Paused"
        CompetitionPhase.LIVE -> "Live"
        CompetitionPhase.CLOSED -> "Ended"
        CompetitionPhase.CANCELLED -> "Cancelled"
        CompetitionPhase.UNKNOWN -> ""
    }

    private fun two(value: Long): String = if (value < 10L) "0$value" else value.toString()
}
