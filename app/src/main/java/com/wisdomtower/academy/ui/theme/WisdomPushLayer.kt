package com.wisdomtower.academy.ui.theme

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutLinearInEasing
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex

/** Holds the last non-null item so the screen keeps its content while it slides out. Not Compose state on purpose. */
private class LastItem<T>(var value: T?)

/**
 * M5 (docs/UI_MOTION_PLAN.md): push / pop motion for a full-screen overlay (study workspace, guides, competitions).
 *
 * [item] != null shows the screen: it slides in 56 dp from the right while fading in (280 ms, decelerate).
 * [item] == null closes it: it fades out and slides back (220 ms, quicker than open), keeping the LAST item as its content
 * until it is gone, then it is removed exactly as before. The screen below shows through the fade (the old screen recedes).
 *
 * - `graphicsLayer` only (alpha, translationX), read in the draw phase: no recomposition per frame.
 * - Touch works from the first frame (a layer at alpha 0 still receives taps).
 * - This file never changes the state that decides visibility; back handling stays where it is.
 */
@Composable
fun <T : Any> WisdomPushLayer(
    item: T?,
    zIndexValue: Float,
    content: @Composable (T) -> Unit
) {
    val last = remember { LastItem<T>(item) }
    if (item != null) last.value = item
    val wanted = item != null
    val progress = remember { Animatable(if (wanted) 1f else 0f) }
    var shown by remember { mutableStateOf(wanted) }

    LaunchedEffect(wanted) {
        if (wanted) {
            shown = true
            progress.animateTo(1f, tween(durationMillis = 280, easing = LinearOutSlowInEasing))
        } else {
            progress.animateTo(0f, tween(durationMillis = 220, easing = FastOutLinearInEasing))
            shown = false
            last.value = null
        }
    }

    val current = last.value
    if (current != null && (wanted || shown)) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .zIndex(zIndexValue)
                .graphicsLayer {
                    alpha = progress.value
                    translationX = (1f - progress.value) * 56.dp.toPx()
                }
        ) {
            content(current)
        }
    }
}
