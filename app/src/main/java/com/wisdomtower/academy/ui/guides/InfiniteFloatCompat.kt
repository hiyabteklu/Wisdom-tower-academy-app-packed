package com.wisdomtower.academy.ui.guides

import androidx.compose.animation.core.InfiniteRepeatableSpec
import androidx.compose.animation.core.InfiniteTransition
import androidx.compose.animation.core.animateFloat as coreAnimateFloat
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State

/**
 * GuidesScreen.kt calls `transition.animateFloat(...)` for the pulsing Tip bulb but does not import it. Same-package
 * declarations resolve without an import, so this thin wrapper fixes the build without touching that big file.
 * (If you ever add `import androidx.compose.animation.core.animateFloat` to GuidesScreen.kt, this file can be deleted.)
 */
@Composable
internal fun InfiniteTransition.animateFloat(
    initialValue: Float,
    targetValue: Float,
    animationSpec: InfiniteRepeatableSpec<Float>,
    label: String = "FloatAnimation"
): State<Float> = this.coreAnimateFloat(initialValue, targetValue, animationSpec, label)
