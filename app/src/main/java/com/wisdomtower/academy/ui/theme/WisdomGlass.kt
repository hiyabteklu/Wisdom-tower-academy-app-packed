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
 * "Glass" look of the Targets screen (owner reference, 2026-10-13): a see-through white tint with a thin
 * white edge, so the glow of [AtmosphereBackground] shows through. Night values:
 *  - panel / row fill   : white 12%  ([WisdomGlassFill])
 *  - pill / button fill : white 16%  ([WisdomGlassFillStrong])
 *  - quiet (done) fill  : white 7%   ([WisdomGlassFillQuiet])
 *  - edge               : white 18%  ([WisdomGlassBorder])
 *  - corners            : 16dp for rows, 24dp for big panels, fully round for pills
 * BG-POPUP (2026-10-17, owner: "increase the glass opacity, I am not seeing much difference"): the night values were
 * 4 / 6 / 2 / 8 percent. To go back to them, use those four numbers.
 * Plan and order of the areas: docs/GLASS_PLAN.md.
 *
 * L1 (docs/DAY_NIGHT_PLAN.md): by day the glass is frosted white (a see-through white card on the light glow) with a thin
 * ink edge, so cards stay visible and the text on them ([WisdomInk]) has strong contrast. Night is unchanged.
 * These are getters: read them while composing or drawing, not once at class load.
 */
val WisdomGlassFill: Color
    get() = if (AppThemeMode.isDark) Color.White.copy(alpha = 0.12f) else Color.White.copy(alpha = 0.72f)
val WisdomGlassFillStrong: Color
    get() = if (AppThemeMode.isDark) Color.White.copy(alpha = 0.16f) else Color.White.copy(alpha = 0.88f)
val WisdomGlassFillQuiet: Color
    get() = if (AppThemeMode.isDark) Color.White.copy(alpha = 0.07f) else Color.White.copy(alpha = 0.5f)
val WisdomGlassBorder: Color
    get() = if (AppThemeMode.isDark) Color.White.copy(alpha = 0.18f) else WisdomLightPalette.ink.copy(alpha = 0.12f)

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
