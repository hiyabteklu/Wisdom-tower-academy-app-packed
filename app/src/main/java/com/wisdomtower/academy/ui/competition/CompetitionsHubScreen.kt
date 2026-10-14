package com.wisdomtower.academy.ui.competition

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.competition.CompetitionAction
import com.wisdomtower.academy.data.competition.CompetitionDisplay
import com.wisdomtower.academy.data.competition.CompetitionPhase
import com.wisdomtower.academy.data.competition.CompetitionPhaseLogic
import com.wisdomtower.academy.data.competition.CompetitionRepository
import com.wisdomtower.academy.data.competition.CompetitionResult
import com.wisdomtower.academy.data.competition.CompetitionSession
import com.wisdomtower.academy.data.competition.CompetitionSummary
import com.wisdomtower.academy.data.competition.CountdownKind
import com.wisdomtower.academy.data.competition.SubmitResult
import com.wisdomtower.academy.ui.study.ScreenBackButton
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

private val CardBg = Color(0xFF131F38)
private val CyanAccent = Color(0xFF22E0FF)
private val LiveGreen = Color(0xFF22C55E)
private val MutedText = Color(0xFF94A3B8)
private val ErrorRed = Color(0xFFF87171)
private val DarkText = Color(0xFF0A101D)

// C5 slice 1: the competitions hub opened by the trophy button (list of contests with phase badge,
// live countdown, start and end time in Ethiopia time). Data comes only from the server through
// CompetitionRepository; every text on a card is a server value or a plain label, nothing is invented.
// The list reloads every 30 seconds so an admin pause or start-now reaches an open screen (owner Q7),
// and again when a card's phase moves on with the clock.
// C5 slice 2: a contest the server still marks as unseen gets a small cyan dot in front of its title
// (no text, so nothing is invented). The screen keeps the dot for as long as it stays open and tells the
// server through CompetitionRepository.markSeen, so the dot is gone the next time the hub opens.
// A failed markSeen call is simply tried again on the next 30 second reload.
// C6 slice 3: Join, Resume and Practice buttons. They call CompetitionRepository.start and then show
// CompetitionExamScreen inside this same screen (so MainActivity needs no change). Join asks for a
// confirmation first, because the ranked attempt cannot be restarted (decision C). Resume starts at once.
// Practice is offered only when the server says it is available (after the window ended, decision A).
// After the exam a short line says it was submitted; a practice score is shown only as the server sent it.
// C7 slice 2: a Leaderboard button on every ended contest the student may enter (decision G). It opens
// CompetitionLeaderboardScreen inside this same screen. The review screen is not here yet (C7 slice 3).
// The lockdown flag is raised by CompetitionExamScreen (C6 slice 4), not here.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@Composable
fun CompetitionsHubScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var contests by remember { mutableStateOf<List<CompetitionSummary>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var errorText by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }
    var nowMs by remember { mutableLongStateOf(CompetitionRepository.serverNowMs()) }
    // ids that were unseen when this screen first got them (the dot stays while the screen is open)
    var freshIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    // ids the server already confirmed as seen
    val markedIds = remember { mutableSetOf<String>() }
    // C6 slice 3: the running exam (null = the list is shown), the contest being started, the join question
    var session by remember { mutableStateOf<CompetitionSession?>(null) }
    var startingId by remember { mutableStateOf<String?>(null) }
    var confirmId by remember { mutableStateOf<String?>(null) }
    var actionError by remember { mutableStateOf<String?>(null) }
    var notice by remember { mutableStateOf<String?>(null) }
    // C7 slice 2: the contest whose leaderboard is open (null = not open)
    var leaderboardOf by remember { mutableStateOf<CompetitionSummary?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(reloadKey) {
        if (contests.isEmpty()) loading = true
        when (val r = CompetitionRepository.listCompetitions()) {
            is CompetitionResult.Ok -> {
                contests = r.value.items
                errorText = null
                val unseenIds = r.value.items.filter { it.unseen }.map { it.id }
                if (unseenIds.isNotEmpty()) {
                    freshIds = freshIds + unseenIds
                    for (id in unseenIds) {
                        if (id !in markedIds) {
                            val marked = CompetitionRepository.markSeen(id)
                            if (marked is CompetitionResult.Ok) markedIds.add(id)
                        }
                    }
                }
            }
            is CompetitionResult.Failed -> errorText = r.message
        }
        loading = false
    }

    // clock for the countdown (server-corrected), once per second
    LaunchedEffect(Unit) {
        while (true) {
            nowMs = CompetitionRepository.serverNowMs()
            delay(1000L)
        }
    }

    // poll the server every 30 seconds (not while an exam or a leaderboard is open)
    LaunchedEffect(Unit) {
        while (true) {
            delay(30_000L)
            if (session == null && leaderboardOf == null) reloadKey += 1
        }
    }

    val known = CompetitionRepository.isServerTimeKnown()
    val rows = contests.map { it to CompetitionPhaseLogic.describe(it, nowMs, known) }
    val anyNeedsRefresh = rows.any { it.second.needsRefresh }
    LaunchedEffect(anyNeedsRefresh) {
        if (anyNeedsRefresh) {
            delay(1500L)
            reloadKey += 1
        }
    }

    fun startContest(id: String, ranked: Boolean) {
        if (startingId != null) return
        startingId = id
        confirmId = null
        actionError = null
        notice = null
        scope.launch {
            val r = CompetitionRepository.start(id, ranked)
            if (r is CompetitionResult.Ok) {
                session = r.value
            } else if (r is CompetitionResult.Failed) {
                actionError = r.message
                reloadKey += 1
            }
            startingId = null
        }
    }

    val active = session
    val board = leaderboardOf
    if (active != null) {
        CompetitionExamScreen(
            session = active,
            onFinished = { result ->
                session = null
                notice = finishedNotice(result)
                reloadKey += 1
            },
            onExit = {
                session = null
                reloadKey += 1
            },
            modifier = Modifier.fillMaxSize()
        )
    } else if (board != null) {
        CompetitionLeaderboardScreen(
            competitionId = board.id,
            title = board.title,
            onBack = { leaderboardOf = null },
            modifier = Modifier.fillMaxSize()
        )
    } else {
        Column(modifier = modifier) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ScreenBackButton(onClick = onBack)
                Text(
                    text = "Competitions",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            val shownNotice = notice
            if (shownNotice != null) {
                Text(
                    text = shownNotice,
                    color = LiveGreen,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 4.dp)
                )
            }
            val shownError = actionError
            if (shownError != null) {
                Text(
                    text = shownError,
                    color = ErrorRed,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 4.dp)
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 14.dp),
                contentAlignment = Alignment.Center
            ) {
                if (loading && contests.isEmpty()) {
                    CircularProgressIndicator(color = CyanAccent, strokeWidth = 3.dp)
                } else if (contests.isEmpty()) {
                    Text(
                        text = errorText ?: "No competitions right now.",
                        color = MutedText,
                        fontSize = 14.sp
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(rows, key = { it.first.id }) { row ->
                            val contestId = row.first.id
                            CompetitionCard(
                                summary = row.first,
                                display = row.second,
                                isNew = contestId in freshIds,
                                busy = startingId != null,
                                starting = startingId == contestId,
                                confirming = confirmId == contestId,
                                onStart = { ranked -> startContest(contestId, ranked) },
                                onAskJoin = {
                                    actionError = null
                                    notice = null
                                    confirmId = contestId
                                },
                                onCancelJoin = { confirmId = null },
                                onOpenLeaderboard = {
                                    actionError = null
                                    notice = null
                                    leaderboardOf = row.first
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

// One plain line after an exam. A practice score is shown only when the server sent it; a ranked score is
// not shown here (the leaderboard shows it after the window ends).
private fun finishedNotice(result: SubmitResult?): String {
    if (result == null) return "Your answers were already submitted."
    val score = result.score
    val total = result.total
    if (result.mode == "practice" && score != null && total != null) {
        return "Practice finished: " + score.toString() + " of " + total.toString() + "."
    }
    return "Your answers were submitted."
}

@Composable
private fun CompetitionCard(
    summary: CompetitionSummary,
    display: CompetitionDisplay,
    isNew: Boolean,
    busy: Boolean,
    starting: Boolean,
    confirming: Boolean,
    onStart: (Boolean) -> Unit,
    onAskJoin: () -> Unit,
    onCancelJoin: () -> Unit,
    onOpenLeaderboard: () -> Unit
) {
    val shape = RoundedCornerShape(18.dp)
    val badge = if (display.phase == CompetitionPhase.PAUSED) {
        "Postponed by admin"
    } else {
        CompetitionPhaseLogic.phaseLabel(display.phase)
    }
    val badgeColor = when (display.phase) {
        CompetitionPhase.LIVE -> LiveGreen
        CompetitionPhase.UPCOMING -> CyanAccent
        else -> MutedText
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardBg, shape)
            .border(1.dp, Color.White.copy(alpha = 0.2f), shape)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (isNew) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .background(CyanAccent, CircleShape)
                )
            }
            Text(
                text = summary.title,
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )
            if (badge.isNotEmpty()) {
                Text(
                    text = badge,
                    color = badgeColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .border(1.dp, badgeColor.copy(alpha = 0.6f), RoundedCornerShape(999.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }

        val description = summary.description
        if (!description.isNullOrBlank()) {
            Text(text = description, color = MutedText, fontSize = 13.sp)
        }

        Text(
            text = summary.questionCount.toString() + " questions  \u2022  " + summary.durationMin.toString() + " min",
            color = Color(0xFFE2E8F0),
            fontSize = 12.sp
        )

        if (display.countdownKind != CountdownKind.NONE) {
            val lead = if (display.countdownKind == CountdownKind.STARTS_IN) "Starts in " else "Ends in "
            Text(
                text = lead + CompetitionPhaseLogic.formatCountdown(display.countdownMs),
                color = CyanAccent,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Text(text = "Starts: " + formatEat(summary.startsAtMs), color = MutedText, fontSize = 12.sp)
        Text(text = "Ends: " + formatEat(summary.endsAtMs), color = MutedText, fontSize = 12.sp)

        if (display.action == CompetitionAction.SUBMITTED) {
            Text(text = "Submitted", color = LiveGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }

        // C6 slice 3: the buttons. Join asks first (the ranked attempt cannot be restarted).
        val primaryLabel: String? = when (display.action) {
            CompetitionAction.JOIN -> "Join"
            CompetitionAction.RESUME -> "Resume"
            CompetitionAction.PRACTICE -> "Practice"
            else -> null
        }
        val showSecondaryPractice = display.action != CompetitionAction.PRACTICE &&
            display.canPractice && summary.practiceAvailable
        // C7 slice 2: the leaderboard of an ended contest (decision G: everyone in the audience)
        val showLeaderboard = display.canViewLeaderboard && summary.canEnter

        if (confirming && display.action == CompetitionAction.JOIN) {
            Text(
                text = "Start your ranked attempt? It cannot be restarted.",
                color = Color.White,
                fontSize = 13.sp
            )
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                CardButton(label = "Cancel", filled = false, enabled = !busy, onClick = onCancelJoin)
                CardButton(
                    label = if (starting) "Starting..." else "Start",
                    filled = true,
                    enabled = !busy,
                    onClick = { onStart(true) }
                )
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (primaryLabel != null) {
                    CardButton(
                        label = if (starting && display.action != CompetitionAction.JOIN) "Starting..." else primaryLabel,
                        filled = true,
                        enabled = !busy,
                        onClick = {
                            when (display.action) {
                                CompetitionAction.JOIN -> onAskJoin()
                                CompetitionAction.RESUME -> onStart(true)
                                else -> onStart(false)
                            }
                        }
                    )
                }
                if (showSecondaryPractice) {
                    CardButton(
                        label = if (starting) "Starting..." else "Practice",
                        filled = false,
                        enabled = !busy,
                        onClick = { onStart(false) }
                    )
                }
                if (showLeaderboard) {
                    CardButton(
                        label = "Leaderboard",
                        filled = display.action == CompetitionAction.VIEW_RESULT,
                        enabled = !busy,
                        onClick = onOpenLeaderboard
                    )
                }
            }
        }

        // prize and points arrive from the server only after the window ended; shown exactly as sent
        val prizeTitle = summary.prizeTitle
        if (!prizeTitle.isNullOrBlank()) {
            Text(text = prizeTitle, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            val prizeDetails = summary.prizeDetails
            if (!prizeDetails.isNullOrBlank()) {
                Text(text = prizeDetails, color = MutedText, fontSize = 12.sp)
            }
        }
        val points = summary.points
        if (points != null) {
            Text(text = points.toString() + " points", color = CyanAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun CardButton(label: String, filled: Boolean, enabled: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(12.dp)
    val alpha = if (enabled) 1f else 0.5f
    Box(
        modifier = Modifier
            .clip(shape)
            .background(if (filled) CyanAccent.copy(alpha = alpha) else CardBg)
            .border(1.dp, CyanAccent.copy(alpha = if (filled) 0f else 0.5f * alpha), shape)
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = 20.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (filled) DarkText else Color.White.copy(alpha = alpha),
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

// All competition times are shown in Ethiopia time (owner Q8), whatever the phone's zone is.
private fun formatEat(ms: Long): String {
    val format = SimpleDateFormat("d MMM yyyy, HH:mm", Locale.US)
    format.timeZone = TimeZone.getTimeZone("GMT+03:00")
    return format.format(Date(ms)) + " EAT"
}
