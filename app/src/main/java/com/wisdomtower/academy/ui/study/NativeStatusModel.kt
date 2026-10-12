package com.wisdomtower.academy.ui.study

import com.wisdomtower.academy.data.content.ProgressRow
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone
import kotlin.math.roundToInt

/**
 * Logic of the native "Your status" screen (F7 part 5). Port of `computeStudentAnalytics` and
 * `resolveStudentTrackBenchmark` in `website-reference/src/lib/student-knowledge-base.ts`, with ONE owner-rule change:
 * REAL DATA ONLY (owner, 2026-10-11: no fabricated numbers). The website invents values when the student has no
 * records (42 questions with 34 correct, 91% focus, a 4-day streak, 35 minutes of study per day since sign-up, a focus
 * ratio never below 65%, a fixed split of the total over the weekdays, a reading speed computed from the track benchmark,
 * a solve pace of benchmark + 0.1 minutes). None of that is copied: a figure that cannot be measured is `null` and the
 * screen shows a dash. Not ported because they cannot be measured from `learning_progress`: reading speed (WPM) and the
 * reading-method diagnostic, solve pace, the weekly percent of the target (the table has lifetime seconds per item, no
 * per-day log), the weekday chart.
 */
data class StatusTrack(
    val id: String,
    val name: String,
    val category: String,
    val weeklyTargetHours: Double,
    val targetMinutesPerQuestion: Double,
    val eliteAccuracy: Int,
    val honorsAccuracy: Int,
    val passAccuracy: Int
)

/** Same tracks, names, categories, targets and thresholds as `ACADEMIC_KNOWLEDGE_BASE`, same order. */
val STATUS_TRACKS: List<StatusTrack> = listOf(
    StatusTrack("freshman-natural", "Freshman (Natural Science Stream)", "University Freshman", 12.0, 1.3, 88, 78, 60),
    StatusTrack("freshman-social", "Freshman (Social Science Stream)", "University Freshman", 10.5, 1.2, 88, 78, 60),
    StatusTrack("freshman-all", "Freshman (Complete 21 Subjects Hub)", "University Freshman", 14.0, 1.25, 88, 78, 60),
    StatusTrack("grade-12", "Grade 12 National Matriculation", "Secondary Education", 14.0, 1.2, 85, 75, 55),
    StatusTrack("grade-11", "Grade 11 Secondary Curriculum", "Secondary Education", 12.0, 1.2, 85, 75, 55),
    StatusTrack("grade-10", "Grade 10 Secondary Curriculum", "Secondary Education", 11.0, 1.2, 82, 72, 55),
    StatusTrack("grade-9", "Grade 9 Secondary Curriculum", "Secondary Education", 10.0, 1.2, 82, 72, 55),
    StatusTrack("remedial", "Remedial University Program", "Remedial Program", 11.0, 1.25, 82, 72, 50),
    StatusTrack("ece-engineering", "ECE Year 3 Semester 1 (Engineering)", "Department Special Track", 15.0, 2.0, 85, 75, 60)
)

/** Prints 12.0 as "12" and 10.5 as "10.5", like JavaScript. */
fun formatStatusNumber(value: Double): String =
    if (value % 1.0 == 0.0) value.toLong().toString() else value.toString()

/**
 * Steps 1 and 4 of `resolveStudentTrackBenchmark` (education level text first, else the Freshman default by stream).
 * Steps 2 and 3 are skipped on purpose: step 2 (enrolled package ids) gives the same answer as step 4 for the website's
 * default course lists, and step 3 compares resource ids with paths like "grade/12/" while the real ids are UUIDs, so it
 * can never match.
 */
fun resolveStatusTrack(educationLevel: String?, stream: String?): StatusTrack {
    val edu = (educationLevel ?: "").lowercase().trim()
    val st = (stream ?: "").lowercase().trim()
    fun track(id: String): StatusTrack = STATUS_TRACKS.first { it.id == id }
    return when {
        edu.contains("12") || edu.contains("matric") -> track("grade-12")
        edu.contains("11") -> track("grade-11")
        edu.contains("10") -> track("grade-10")
        edu.contains("9") -> track("grade-9")
        edu.contains("remedial") -> track("remedial")
        edu.contains("ece") || edu.contains("electrical") || edu.contains("engineering") -> track("ece-engineering")
        edu.contains("freshman") -> if (edu.contains("social") || st.contains("social")) track("freshman-social") else track("freshman-natural")
        st.contains("social") -> track("freshman-social")
        else -> track("freshman-natural")
    }
}

data class StatusRecommendation(
    val id: String,
    val category: String,
    val title: String,
    val description: String,
    val actionableStep: String
)

data class StatusAlert(
    val id: String,
    val severity: String,
    val signal: String,
    val observedData: String,
    val immediateAction: String
)

data class StatusSummary(
    val itemCount: Int,
    val totalStudyMinutes: Int,
    val totalStudyHours: Double,
    /** null when no focus time was recorded */
    val focusRatioPct: Int?,
    val questionsAttempted: Int,
    val questionsCorrect: Int,
    /** null when no question was answered */
    val accuracyPct: Double?,
    val streakDays: Int,
    /** null when accuracy is unknown */
    val tier: String?,
    /** null unless both accuracy and focus are known */
    val retentionIndexPct: Int?,
    val retentionRating: String?,
    val retentionExplanation: String?,
    val recommendations: List<StatusRecommendation>,
    val alerts: List<StatusAlert>
)

private fun utcDay(daysAgo: Int): String {
    val zone = TimeZone.getTimeZone("UTC")
    val cal = Calendar.getInstance(zone)
    cal.add(Calendar.DAY_OF_YEAR, -daysAgo)
    val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    fmt.timeZone = zone
    return fmt.format(cal.time)
}

fun computeStatus(rows: List<ProgressRow>, track: StatusTrack): StatusSummary {
    var totalSec = 0L
    var focusSec = 0L
    var attempted = 0
    var correct = 0
    val days = HashSet<String>()
    for (r in rows) {
        totalSec += r.totalSeconds
        focusSec += r.focusSeconds
        attempted += r.quizAttempted
        correct += r.quizCorrect
        val opened = r.lastOpenedAt
        if (opened != null && opened.length >= 10) days.add(opened.substring(0, 10))
    }

    val minutes = (totalSec / 60.0).roundToInt()
    val hours = ((minutes / 60.0) * 10).roundToInt() / 10.0
    val focus: Int? =
        if (totalSec > 0L && focusSec > 0L) minOf(100, (focusSec * 100.0 / totalSec).roundToInt()) else null
    val accuracy: Double? =
        if (attempted > 0) (correct * 1000.0 / attempted).roundToInt() / 10.0 else null

    // Streak: consecutive days (UTC dates, like the website) ending today or yesterday
    var streak = 0
    val startAgo = when {
        days.contains(utcDay(0)) -> 0
        days.contains(utcDay(1)) -> 1
        else -> -1
    }
    if (startAgo >= 0) {
        var i = startAgo
        while (days.contains(utcDay(i))) {
            streak++
            i++
        }
    }

    val tier: String? = accuracy?.let { a ->
        when {
            a >= track.eliteAccuracy -> "Elite Scholar Rank"
            a >= track.honorsAccuracy -> "Honors Distinction"
            a < track.passAccuracy -> "Critical Review Required"
            else -> "Solid Foundational"
        }
    }

    var retentionIndex: Int? = null
    var retentionRating: String? = null
    var retentionExplanation: String? = null
    if (accuracy != null && focus != null) {
        val idx = (accuracy * 0.75 + focus * 0.25).roundToInt()
        retentionIndex = idx
        when {
            idx >= 80 -> {
                retentionRating = "High Long-Term Retention"
                retentionExplanation = "Your quiz accuracy and focused session duration demonstrate strong cognitive consolidation. Concepts drilled recently have high recall probability in timed exam conditions."
            }
            idx < 62 -> {
                retentionRating = "Memory Decay Risk"
                retentionExplanation = "Memory decay risk detected. Accuracy shows sharp drop-offs when questions are attempted after multi-day reading gaps. Immediate active recall drills are required."
            }
            else -> {
                retentionRating = "Moderate Retention"
                retentionExplanation = "Moderate retention observed. You understand core concepts when tested promptly, but without 48-hour spaced retrieval drills, recall drops significantly on cumulative exams."
            }
        }
    }

    val recommendations = listOf(
        StatusRecommendation(
            id = "rec-active-recall",
            category = "Recall Technique",
            title = "Shift from Passive Re-Reading to Active Retrieval",
            description = "Re-reading notes creates an illusion of competence. Testing yourself with closed-book flashcards or question drills triples long-term neural recall.",
            actionableStep = "After every 20 minutes of reading, close the chapter and answer at least 8 practice questions immediately."
        ),
        StatusRecommendation(
            id = "rec-pomodoro-focus",
            category = "Focus Calibration",
            title = "Calibrate Study Blocks to 25-Minute Focus Sprints",
            description = (if (focus != null) "Data confirms your focus ratio is $focus%. " else "") +
                "Long unstructured study sessions lead to cognitive fatigue and mind-wandering.",
            actionableStep = "Use the built-in Pomodoro timer: 25 minutes of strict single-task focus followed by a non-negotiable 5-minute mental break."
        ),
        StatusRecommendation(
            id = "rec-spaced-repetition",
            category = "Routine",
            title = "Review Within the Critical 24-Hour Memory Window",
            description = "According to the Ebbinghaus forgetting curve, up to 70% of new material is forgotten within 48 hours unless reviewed once within the first 24 hours.",
            actionableStep = "Dedicate the first 10 minutes of every daily study session to reviewing yesterday's questions before opening new chapters."
        ),
        StatusRecommendation(
            id = "rec-exam-pacing",
            category = "Time & Pacing",
            title = "Practice Elimination Pacing Under Timed Countdown",
            description = "The benchmark pace for ${track.name} is ${formatStatusNumber(track.targetMinutesPerQuestion)} min/question.",
            actionableStep = "In multiple-choice questions, train yourself to eliminate 2 incorrect distractor choices within the first 20 seconds."
        )
    )

    val alerts = ArrayList<StatusAlert>()
    if (minutes == 0) {
        alerts.add(
            StatusAlert(
                id = "stop-inactivity-gap",
                severity = "Warning",
                signal = "Zero Study Sessions Logged This Week",
                observedData = "0.0 hours recorded toward your ${formatStatusNumber(track.weeklyTargetHours)}-hour target for ${track.name}. Zero active sessions detected in this period.",
                immediateAction = "Open a chapter in your Learning Hub today and complete an initial 20-minute study interval."
            )
        )
    }
    if (accuracy != null && accuracy < 60.0) {
        alerts.add(
            StatusAlert(
                id = "stop-unreviewed-misses",
                severity = "Critical",
                signal = "Low Question Drill Accuracy (< 60%)",
                observedData = "Recorded accuracy is ${formatStatusNumber(accuracy)}% ($correct correct out of $attempted attempts). Advancing without reviewing missed items solidifies mistakes.",
                immediateAction = "Pause new drill sets. Open missed questions and read the step-by-step solution derivation before re-attempting."
            )
        )
    }
    if (minutes > 10 && focus != null && focus < 60) {
        alerts.add(
            StatusAlert(
                id = "stop-idle-distraction",
                severity = "Warning",
                signal = "High Off-Focus / Passive Dwell Ratio",
                observedData = "Active focus ratio is measured at $focus%. More than 40% of session time was spent idle or in background tabs.",
                immediateAction = "Use 25-minute Pomodoro focus blocks with fullscreen reading mode to eliminate tab-switching distractions."
            )
        )
    }
    if (minutes > 0 && streak == 0) {
        alerts.add(
            StatusAlert(
                id = "stop-broken-streak",
                severity = "Warning",
                signal = "Study Cadence Stalled (0-Day Streak)",
                observedData = "Recent multi-day lapse detected since last logged study activity. Inconsistent intervals compound forgetting rates.",
                immediateAction = "Complete at least one short 15-minute flashcard or question bank review today to restore your active streak."
            )
        )
    }
    if (alerts.isEmpty()) {
        val focusPart = if (focus != null) "$focus% focus ratio and a " else "a "
        alerts.add(
            StatusAlert(
                id = "signal-healthy-habits",
                severity = "Warning",
                signal = "Study Cadence Verified: No Destructive Anomalies",
                observedData = "Current verified metrics: ${formatStatusNumber(hours)}h logged, $focusPart$streak-day streak. Data shows consistent learning discipline.",
                immediateAction = "Maintain your active recall cycle and schedule a comprehensive chapter mock exam every weekend."
            )
        )
    }

    return StatusSummary(
        itemCount = rows.size,
        totalStudyMinutes = minutes,
        totalStudyHours = hours,
        focusRatioPct = focus,
        questionsAttempted = attempted,
        questionsCorrect = correct,
        accuracyPct = accuracy,
        streakDays = streak,
        tier = tier,
        retentionIndexPct = retentionIndex,
        retentionRating = retentionRating,
        retentionExplanation = retentionExplanation,
        recommendations = recommendations,
        alerts = alerts
    )
}
