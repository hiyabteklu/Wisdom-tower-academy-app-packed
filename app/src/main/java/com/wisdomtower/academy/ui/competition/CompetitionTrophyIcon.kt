package com.wisdomtower.academy.ui.competition

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.requiredSize
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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.data.competition.CompetitionPhase
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
 * M11 slice 10 (docs/UI_MOTION_PLAN.md): while at least one contest has phase LIVE (the server's own `phase`
 * from the same call, nothing computed on the phone) a slow soft glow breathes behind the trophy (about 2.6 s per
 * breath). `graphicsLayer` only, read in the draw phase, so no recomposition per frame; it runs only while live.
 * Not live, signed out or a failed call with no earlier answer: no glow. The dot logic is unchanged.
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
    var hasLive by remember { mutableStateOf(false) }

    LaunchedEffect(isLoggedIn, refreshKey) {
        if (!isLoggedIn) {
            hasNew = false
            hasLive = false
            return@LaunchedEffect
        }
        while (true) {
            val result = CompetitionRepository.listCompetitions()
            if (result is CompetitionResult.Ok) {
                hasNew = result.value.items.any { it.unseen }
                hasLive = result.value.items.any { it.phase == CompetitionPhase.LIVE }
            }
            delay(TROPHY_DOT_REFRESH_MS)
        }
    }

    val showDot = isLoggedIn && hasNew
    val showGlow = isLoggedIn && hasLive

    Box(modifier = modifier) {
        if (showGlow) {
            TrophyGlow(color = tint, modifier = Modifier.align(Alignment.Center))
        }
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

/** M11 slice 10: the breathing glow. Composed only while a contest is live, so no animation runs otherwise. */
@Composable
private fun TrophyGlow(color: Color, modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "trophyGlow")
    val breath by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(durationMillis = 1300, easing = LinearEasing), RepeatMode.Reverse),
        label = "trophyGlowBreath"
    )
    Box(
        modifier = modifier
            .requiredSize(34.dp)
            .graphicsLayer {
                alpha = 0.10f + 0.22f * breath
                val s = 0.86f + 0.14f * breath
                scaleX = s
                scaleY = s
            }
            .background(color, CircleShape)
    )
}
