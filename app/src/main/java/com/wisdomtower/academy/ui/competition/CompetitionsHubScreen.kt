package com.wisdomtower.academy.ui.competition

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import com.wisdomtower.academy.data.competition.CompetitionSummary
import com.wisdomtower.academy.data.competition.CountdownKind
import com.wisdomtower.academy.ui.study.ScreenBackButton
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

private val CardBg = Color(0xFF131F38)
private val CyanAccent = Color(0xFF22E0FF)
private val LiveGreen = Color(0xFF22C55E)
private val MutedText = Color(0xFF94A3B8)

// C5 slice 1: the competitions hub opened by the trophy button (list of contests with phase badge,
// live countdown, start and end time in Ethiopia time). Data comes only from the server through
// CompetitionRepository; every text on a card is a server value or a plain label, nothing is invented.
// NOT in this slice (later stages): join, resume, practice buttons (C6), leaderboard and review (C7).
// The list reloads every 30 seconds so an admin pause or start-now reaches an open screen (owner Q7),
// and again when a card's phase moves on with the clock.
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

    LaunchedEffect(reloadKey) {
        if (contests.isEmpty()) loading = true
        when (val r = CompetitionRepository.listCompetitions()) {
            is CompetitionResult.Ok -> {
                contests = r.value.items
                errorText = null
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

    // poll the server every 30 seconds
    LaunchedEffect(Unit) {
        while (true) {
            delay(30_000L)
            reloadKey += 1
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
                        CompetitionCard(summary = row.first, display = row.second)
                    }
                }
            }
        }
    }
}

@Composable
private fun CompetitionCard(summary: CompetitionSummary, display: CompetitionDisplay) {
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

// All competition times are shown in Ethiopia time (owner Q8), whatever the phone's zone is.
private fun formatEat(ms: Long): String {
    val format = SimpleDateFormat("d MMM yyyy, HH:mm", Locale.US)
    format.timeZone = TimeZone.getTimeZone("GMT+03:00")
    return format.format(Date(ms)) + " EAT"
}
