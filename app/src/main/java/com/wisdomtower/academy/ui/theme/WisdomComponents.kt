package com.wisdomtower.academy.ui.theme

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ripple
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Reusable UI Components reproducing website CSS classes (globals.css & ui-polish.css).
 */

/**
 * Soft press-in used by the tappable controls (iOS feel, same spring as the login button: scale down a little while the
 * finger is down, springy return). It must be the FIRST modifier of the element so the whole element (shape included)
 * scales. Added 2026-10-14 (docs/SESSION_2026-10-14_resources_ios.md).
 */
@Composable
fun Modifier.wisdomPressScale(source: MutableInteractionSource, pressedScale: Float = 0.96f): Modifier {
    val pressed by source.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (pressed) pressedScale else 1f,
        animationSpec = spring(dampingRatio = 0.6f, stiffness = 500f),
        label = "wisdomPressScale"
    )
    return this.graphicsLayer {
        scaleX = scale
        scaleY = scale
    }
}

/**
 * GLASS (2026-10-13, owner request, docs/GLASS_PLAN.md area 5): the default card is now the see-through glass of the
 * Targets screen (white 4% fill, white 8% edge, see WisdomGlass.kt), so every screen that still calls this card
 * follows the glass look. An explicit borderColor passed by a caller (accent edges) is kept.
 *
 * 2026-10-14: a card that is tappable ([onClick] given) now presses in softly (scale 0.975). A card without [onClick]
 * is exactly as before (no extra state, so long lists stay cheap).
 *
 * S3 (TalkBack): the four tappable components in this file (card, primary, secondary and open buttons) are announced
 * as buttons (Role.Button). Looks are unchanged.
 */
@Composable
fun WisdomModernCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
    borderColor: Color = WisdomGlassBorder,
    borderWidth: Dp = 1.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit
) {
    val shape = RoundedCornerShape(cornerRadius)
    if (onClick == null) {
        Box(
            modifier = modifier
                .clip(shape)
                .background(WisdomGlassFill)
                .border(BorderStroke(borderWidth, borderColor), shape),
            content = content
        )
    } else {
        val interaction = remember { MutableInteractionSource() }
        Box(
            modifier = modifier
                .wisdomPressScale(interaction, 0.975f)
                .clip(shape)
                .background(WisdomGlassFill)
                .border(BorderStroke(borderWidth, borderColor), shape)
                .clickable(
                    interactionSource = interaction,
                    role = Role.Button,
                    indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),
                    onClick = onClick
                ),
            content = content
        )
    }
}

/** Pill shaped (2026-10-14, iOS feel) with a soft press-in. Size and colours unchanged. */
@Composable
fun WisdomPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: (@Composable () -> Unit)? = null
) {
    val shape = CircleShape
    val interaction = remember { MutableInteractionSource() }
    Row(
        modifier = modifier
            .wisdomPressScale(interaction, 0.97f)
            .clip(shape)
            .background(WisdomPrimaryBtnGradient)
            .clickable(
                interactionSource = interaction,
                role = Role.Button,
                indication = ripple(color = Color.White.copy(alpha = 0.3f)),
                onClick = onClick
            )
            .padding(horizontal = 22.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = text,
            color = WisdomDarkOnCyan,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
        )
        if (icon != null) {
            Spacer(modifier = Modifier.width(8.dp))
            icon()
        }
    }
}

/** Pill shaped (2026-10-14, iOS feel) with a soft press-in. Size and colours unchanged. */
@Composable
fun WisdomSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    borderColor: Color = WisdomBorderWhite,
    textColor: Color = WisdomTextPrimary,
    icon: (@Composable () -> Unit)? = null
) {
    val shape = CircleShape
    val interaction = remember { MutableInteractionSource() }
    Row(
        modifier = modifier
            .wisdomPressScale(interaction, 0.97f)
            .clip(shape)
            .border(BorderStroke(1.dp, borderColor), shape)
            .background(WisdomGlassFillStrong)
            .clickable(
                interactionSource = interaction,
                role = Role.Button,
                indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),
                onClick = onClick
            )
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (icon != null) {
            icon()
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
            text = text,
            color = textColor,
            fontWeight = FontWeight.SemiBold,
            fontSize = 14.sp
        )
    }
}

/**
 * Compact pill button (.btn-open) used across all pathway cards. Soft press-in added 2026-10-14.
 */
@Composable
fun WisdomOpenButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Open →"
) {
    val shape = CircleShape
    val interaction = remember { MutableInteractionSource() }
    Box(
        modifier = modifier
            .wisdomPressScale(interaction, 0.94f)
            .clip(shape)
            .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.5f)), shape)
            .background(WisdomCyan.copy(alpha = 0.08f))
            .clickable(
                interactionSource = interaction,
                role = Role.Button,
                indication = ripple(color = WisdomCyan.copy(alpha = 0.3f)),
                onClick = onClick
            )
            .padding(horizontal = 12.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = WisdomCyan,
            fontWeight = FontWeight.Bold,
            fontSize = 11.sp
        )
    }
}

/**
 * Atmospheric background: two soft glow orbs (cyan top-left, purple middle-right) on the dark page colour.
 *
 * GLASS area 7 (2026-10-13, docs/GLASS_PLAN.md): the orbs are now drawn with radial gradients that fade to fully
 * transparent at their own edge. Before, each orb was a solid circle with `Modifier.blur(...)`: the blur is cut at the
 * square box of the circle (hard rectangle edges, seen in the owner's screenshots) and does nothing on Android 11 and
 * older (hard circle). Gradients look the same on every phone and are cheaper than a blur on every screen.
 * Same colours, same centres (cyan at 130dp / 70dp, purple at 280dp / 240dp from the top-left corner) and about the
 * same strength as the old blurred look. Hypothesis: the strength may need a small tweak after the owner sees it.
 */
@Composable
fun AtmosphereBackground(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(WisdomBackground)
            .clipToBounds()
            .drawBehind {
                // Orb 1: cyan glow top
                drawGlowOrb(
                    color = WisdomCyan,
                    peakAlpha = 0.11f,
                    center = Offset(130.dp.toPx(), 70.dp.toPx()),
                    radius = 220.dp.toPx()
                )
                // Orb 2: purple glow middle right
                drawGlowOrb(
                    color = WisdomAccentPurple,
                    peakAlpha = 0.08f,
                    center = Offset(280.dp.toPx(), 240.dp.toPx()),
                    radius = 190.dp.toPx()
                )
            }
    )
}

/** One soft glow: strongest in the centre, smooth bell-shaped fall-off, exactly transparent at [radius]. */
private fun DrawScope.drawGlowOrb(color: Color, peakAlpha: Float, center: Offset, radius: Float) {
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(
                color.copy(alpha = peakAlpha),
                color.copy(alpha = peakAlpha * 0.91f),
                color.copy(alpha = peakAlpha * 0.68f),
                color.copy(alpha = peakAlpha * 0.42f),
                color.copy(alpha = peakAlpha * 0.21f),
                color.copy(alpha = 0f)
            ),
            center = center,
            radius = radius
        ),
        radius = radius,
        center = center
    )
}
