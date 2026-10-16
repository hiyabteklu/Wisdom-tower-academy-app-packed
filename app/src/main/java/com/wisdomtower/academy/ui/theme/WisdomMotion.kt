package com.wisdomtower.academy.ui.theme

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

/**
 * Wisdom Motion: the ONE place for the app's motion values (docs/UI_MOTION_PLAN.md, section 4).
 * Calm, iOS-like. The open motion is a copy of the approved sign-in motion (expand + fade 280 ms, quicker close).
 * Starting values: tune on the phone, change them here and every screen follows.
 */
object WisdomMotion {
    const val RevealMs = 280
    const val ConcealMs = 220
    const val ConcealFadeMs = 160
    const val ColorMs = 240

    val RevealIn: EnterTransition =
        expandVertically(expandFrom = Alignment.Top, animationSpec = tween(RevealMs)) +
            fadeIn(animationSpec = tween(RevealMs))

    val ConcealOut: ExitTransition =
        shrinkVertically(shrinkTowards = Alignment.Top, animationSpec = tween(ConcealMs)) +
            fadeOut(animationSpec = tween(ConcealFadeMs))
}

/** A section that opens and closes smoothly (accordions, forms). Replaces a plain `if (open) { ... }`. */
@Composable
fun WisdomExpandable(
    visible: Boolean,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    AnimatedVisibility(
        visible = visible,
        modifier = modifier,
        enter = WisdomMotion.RevealIn,
        exit = WisdomMotion.ConcealOut
    ) {
        content()
    }
}

/** Colour that glides between selected and not selected (chips, pills, borders, text). */
@Composable
fun wisdomAnimatedColor(selected: Boolean, selectedColor: Color, idleColor: Color): Color {
    val color by animateColorAsState(
        targetValue = if (selected) selectedColor else idleColor,
        animationSpec = tween(WisdomMotion.ColorMs),
        label = "wisdomAnimatedColor"
    )
    return color
}
