package com.wisdomtower.academy.ui.theme

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * "Glass" look of the Targets screen (owner reference, 2026-10-13): a very see-through white tint with a thin
 * white edge, so the glow of [AtmosphereBackground] shows through. Values copied from `NativeTargetsScreen`:
 *  - panel / row fill   : white 4%   ([WisdomGlassFill])
 *  - pill / button fill : white 6%   ([WisdomGlassFillStrong])
 *  - quiet (done) fill  : white 2%   ([WisdomGlassFillQuiet])
 *  - edge               : white 8%   ([WisdomGlassBorder])
 *  - corners            : 16dp for rows, 24dp for big panels, fully round for pills
 * Plan and order of the areas: docs/GLASS_PLAN.md.
 */
val WisdomGlassFill = Color.White.copy(alpha = 0.04f)
val WisdomGlassFillStrong = Color.White.copy(alpha = 0.06f)
val WisdomGlassFillQuiet = Color.White.copy(alpha = 0.02f)
val WisdomGlassBorder = Color.White.copy(alpha = 0.08f)

/**
 * Same shape of call as [WisdomModernCard], but see-through glass instead of the almost solid navy.
 * S3 (TalkBack): a tappable card is announced as a button (Role.Button).
 */
@Composable
fun WisdomGlassCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
    fill: Color = WisdomGlassFill,
    borderColor: Color = WisdomGlassBorder,
    borderWidth: Dp = 1.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit
) {
    val shape = RoundedCornerShape(cornerRadius)
    val clickModifier = if (onClick != null) {
        Modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            role = Role.Button,
            indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),
            onClick = onClick
        )
    } else Modifier

    Box(
        modifier = modifier
            .clip(shape)
            .background(fill)
            .border(BorderStroke(borderWidth, borderColor), shape)
            .then(clickModifier),
        content = content
    )
}
