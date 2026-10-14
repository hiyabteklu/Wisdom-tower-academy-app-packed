package com.wisdomtower.academy.ui.competition

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.competition.CompetitionRepository
import com.wisdomtower.academy.data.competition.CompetitionResult
import com.wisdomtower.academy.data.competition.LeaderboardResult
import com.wisdomtower.academy.data.competition.LeaderboardRow
import com.wisdomtower.academy.ui.theme.AtmosphereBackground

private val LbCardBg = Color(0xFF131F38)
private val LbCyan = Color(0xFF22E0FF)
private val LbMuted = Color(0xFF94A3B8)
private val LbRed = Color(0xFFF87171)
private val LbDarkText = Color(0xFF0A101D)
private val LbGold = Color(0xFFFBBF24)
private val LbSilver = Color(0xFFCBD5E1)
private val LbBronze = Color(0xFFD97706)

// C7 slice 1: the leaderboard of one finished contest (owner decisions D, E, F, G).
// Everything shown is a server value from competition_leaderboard: names, scores, times, prize, points.
// Ranks 1 to 3 are cards, ranks 4 to 10 sit behind one expand button, a student outside the top 10 sees
// their own row under the list (E), a disqualified student sees a message with the reason (F).
// Before the window closes the server says "not available" and this screen shows a short notice.
// NOT reachable yet: no button opens it until the hub is wired to it (next slice).
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@Composable
fun CompetitionLeaderboardScreen(
    competitionId: String,
    title: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var loading by remember(competitionId) { mutableStateOf(true) }
    var result by remember(competitionId) { mutableStateOf<LeaderboardResult?>(null) }
    var errorText by remember(competitionId) { mutableStateOf<String?>(null) }
    var reloadKey by remember(competitionId) { mutableIntStateOf(0) }

    LaunchedEffect(competitionId, reloadKey) {
        loading = true
        errorText = null
        val r = CompetitionRepository.leaderboard(competitionId)
        if (r is CompetitionResult.Ok) {
            result = r.value
        } else if (r is CompetitionResult.Failed) {
            errorText = r.message
        }
        loading = false
    }

    BackHandler(enabled = true) { onBack() }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                LbButton(label = "Back", filled = false, onClick = onBack)
                Spacer(modifier = Modifier.size(12.dp))
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
            }

            val res = result
            val err = errorText
            if (loading && res == null) {
                Text(text = "Loading...", color = LbMuted, fontSize = 14.sp)
            } else if (res == null) {
                Text(text = err ?: "The leaderboard could not be loaded.", color = LbRed, fontSize = 13.sp)
                LbButton(label = "Try again", filled = true, onClick = { reloadKey += 1 })
            } else if (res is LeaderboardResult.NotAvailable) {
                Text(
                    text = "The leaderboard opens when the competition window closes.",
                    color = LbMuted,
                    fontSize = 14.sp
                )
            } else if (res is LeaderboardResult.Available) {
                LeaderboardBody(res)
            }
        }
    }
}

@Composable
private fun LeaderboardBody(res: LeaderboardResult.Available) {
    var expanded by remember { mutableStateOf(false) }
    val topThree = res.top.filter { it.rank <= 3 }
    val others = res.top.filter { it.rank > 3 }
    val me = res.me
    val myRank = me?.rank

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        if (res.disqualified) {
            val reason = res.disqualifiedReason
            val message = if (reason.isNullOrBlank()) {
                "You were disqualified from this competition."
            } else {
                "You were disqualified from this competition. Reason: " + reason
            }
            Text(text = message, color = LbRed, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }

        Text(
            text = res.participants.toString() + (if (res.participants == 1) " participant" else " participants"),
            color = LbMuted,
            fontSize = 12.sp
        )

        if (res.top.isEmpty()) {
            Text(text = "No ranked results yet.", color = LbMuted, fontSize = 14.sp)
        }

        for (row in topThree) {
            LbRow(row = row, highlight = row.rank == myRank, big = true)
        }

        if (others.isNotEmpty()) {
            if (expanded) {
                for (row in others) {
                    LbRow(row = row, highlight = row.rank == myRank, big = false)
                }
            }
            val lastRank = others.last().rank
            LbButton(
                label = if (expanded) "Hide ranks 4 to " + lastRank.toString() else "Show ranks 4 to " + lastRank.toString(),
                filled = false,
                onClick = { expanded = !expanded }
            )
        }

        if (me != null && res.top.none { it.rank == me.rank }) {
            Text(text = "Your rank", color = LbMuted, fontSize = 12.sp)
            LbRow(row = me, highlight = true, big = false)
        }

        val prizeTitle = res.prizeTitle
        val prizeDetails = res.prizeDetails
        val points = res.points
        if (prizeTitle != null || prizeDetails != null || points != null) {
            val shape = RoundedCornerShape(16.dp)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(shape)
                    .background(LbCardBg)
                    .border(1.dp, Color.White.copy(alpha = 0.2f), shape)
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (prizeTitle != null) {
                    Text(text = prizeTitle, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
                if (prizeDetails != null) {
                    Text(text = prizeDetails, color = LbMuted, fontSize = 13.sp)
                }
                if (points != null) {
                    Text(text = "Points: " + points.toString(), color = LbCyan, fontSize = 13.sp)
                }
            }
        }
    }
}

private fun rankColor(rank: Int): Color = when (rank) {
    1 -> LbGold
    2 -> LbSilver
    3 -> LbBronze
    else -> LbCyan
}

// 125000 ms becomes 2:05
private fun formatTaken(ms: Long): String {
    val totalSeconds = ms / 1000L
    val minutes = totalSeconds / 60L
    val seconds = totalSeconds % 60L
    return minutes.toString() + ":" + (if (seconds < 10L) "0" else "") + seconds.toString()
}

@Composable
private fun LbRow(row: LeaderboardRow, highlight: Boolean, big: Boolean) {
    val shape = RoundedCornerShape(if (big) 16.dp else 12.dp)
    val accent = rankColor(row.rank)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(LbCardBg)
            .border(if (highlight) 2.dp else 1.dp, if (highlight) LbCyan else Color.White.copy(alpha = 0.2f), shape)
            .padding(horizontal = 14.dp, vertical = if (big) 14.dp else 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = row.rank.toString(),
            color = accent,
            fontSize = if (big) 24.sp else 16.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.size(if (big) 40.dp else 32.dp)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = row.name,
                color = Color.White,
                fontSize = if (big) 15.sp else 14.sp,
                fontWeight = FontWeight.Bold
            )
            Text(text = "Time " + formatTaken(row.timeTakenMs), color = LbMuted, fontSize = 12.sp)
        }
        Text(
            text = row.score.toString() + " of " + row.total.toString(),
            color = LbCyan,
            fontSize = if (big) 16.sp else 14.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun LbButton(label: String, filled: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(12.dp)
    Box(
        modifier = Modifier
            .clip(shape)
            .background(if (filled) LbCyan else LbCardBg)
            .border(1.dp, LbCyan.copy(alpha = if (filled) 0f else 0.5f), shape)
            .clickable { onClick() }
            .padding(horizontal = 18.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (filled) LbDarkText else Color.White,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
