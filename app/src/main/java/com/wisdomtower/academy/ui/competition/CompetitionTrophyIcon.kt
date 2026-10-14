package com.wisdomtower.academy.ui.competition

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.data.competition.CompetitionRepository
import com.wisdomtower.academy.data.competition.CompetitionResult
import kotlinx.coroutines.delay

private const val TROPHY_DOT_REFRESH_MS = 120_000L
private val TROPHY_DOT_RED = Color(0xFFEF4444)

/**
 * C5 slice 3: the top-bar trophy icon with a small red dot while at least one contest is NEW to this student.
 *
 * "New" is exactly the server's `unseen` flag from `list_competitions` (the same flag that drives the cyan dot on
 * the hub cards). The hub clears it per contest through `markSeen` when it opens, so the dot goes away after the
 * student has opened the trophy screen and the next check runs.
 *
 * When it asks the server: when the student signs in, every time [refreshKey] changes (MainActivity passes
 * `showCompetitions`, so the check runs again when the hub opens and when it closes) and every 2 minutes.
 * A failed call keeps the last known state and never shows an error. Signed out: no dot, no call.
 * Nothing is invented: no dot unless the server said `unseen` is true for a contest.
 *
 * Used from MainActivity.kt through `scripts/patch_c5_trophy_dot.py` (it replaces the plain trophy Icon).
 * STATUS: `[~]` written, NOT compiled, NOT seen on a device.
 */
@Composable
fun CompetitionTrophyIcon(
    tint: Color,
    refreshKey: Any?,
    modifier: Modifier = Modifier
) {
    val isLoggedIn by AuthStateManager.isLoggedIn.collectAsState()
    var hasNew by remember { mutableStateOf(false) }

    LaunchedEffect(isLoggedIn, refreshKey) {
        if (!isLoggedIn) {
            hasNew = false
            return@LaunchedEffect
        }
        while (true) {
            val result = CompetitionRepository.listCompetitions()
            if (result is CompetitionResult.Ok) {
                hasNew = result.value.items.any { it.unseen }
            }
            delay(TROPHY_DOT_REFRESH_MS)
        }
    }

    val showDot = isLoggedIn && hasNew

    Box(modifier = modifier) {
        Icon(
            imageVector = Icons.Filled.EmojiEvents,
            contentDescription = if (showDot) "Competitions, new" else "Competitions",
            tint = tint,
            modifier = Modifier.size(22.dp)
        )
        if (showDot) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .size(8.dp)
                    .background(TROPHY_DOT_RED, CircleShape)
            )
        }
    }
}
