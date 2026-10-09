package com.wisdomtower.academy.ui.theme

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Reusable UI Components reproducing website CSS classes (globals.css & ui-polish.css).
 */

@Composable
fun WisdomModernCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
    borderColor: Color = WisdomCardBorderSubtle,
    borderWidth: Dp = 1.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit
) {
    val shape = RoundedCornerShape(cornerRadius)
    val clickModifier = if (onClick != null) {
        Modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = rememberRipple(color = WisdomCyan.copy(alpha = 0.2f)),
            onClick = onClick
        )
    } else Modifier

    Box(
        modifier = modifier
            .clip(shape)
            .border(BorderStroke(borderWidth, borderColor), shape)
            .background(WisdomCardSurfaceGradient)
            .then(clickModifier),
        content = content
    )
}

@Composable
fun WisdomPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: (@Composable () -> Unit)? = null
) {
    val shape = RoundedCornerShape(12.dp)
    Row(
        modifier = modifier
            .clip(shape)
            .background(WisdomPrimaryBtnGradient)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple(color = Color.White.copy(alpha = 0.3f)),
                onClick = onClick
            )
            .padding(horizontal = 20.dp, vertical = 12.dp),
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

@Composable
fun WisdomSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    borderColor: Color = WisdomBorderWhite,
    textColor: Color = WisdomTextPrimary,
    icon: (@Composable () -> Unit)? = null
) {
    val shape = RoundedCornerShape(12.dp)
    Row(
        modifier = modifier
            .clip(shape)
            .border(BorderStroke(1.dp, borderColor), shape)
            .background(Color(0xFF111B2E).copy(alpha = 0.85f))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple(color = WisdomCyan.copy(alpha = 0.2f)),
                onClick = onClick
            )
            .padding(horizontal = 18.dp, vertical = 12.dp),
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
 * Compact pill button (.btn-open) used across all pathway cards.
 */
@Composable
fun WisdomOpenButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    label: String = "Open →"
) {
    val shape = RoundedCornerShape(20.dp)
    Box(
        modifier = modifier
            .clip(shape)
            .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.5f)), shape)
            .background(WisdomCyan.copy(alpha = 0.08f))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple(color = WisdomCyan.copy(alpha = 0.3f)),
                onClick = onClick
            )
            .padding(horizontal = 10.dp, vertical = 4.dp),
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
 * Atmospheric background reproduction with soft radial glow orbs.
 */
@Composable
fun AtmosphereBackground(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(WisdomBackground)
    ) {
        // Orb 1: Cyan glow top
        Box(
            modifier = Modifier
                .size(240.dp)
                .offset(x = 10.dp, y = (-50).dp)
                .blur(80.dp)
                .background(WisdomCyan.copy(alpha = 0.16f), CircleShape)
        )
        // Orb 2: Purple glow middle right
        Box(
            modifier = Modifier
                .size(200.dp)
                .offset(x = 180.dp, y = 140.dp)
                .blur(70.dp)
                .background(WisdomAccentPurple.copy(alpha = 0.12f), CircleShape)
        )
    }
}
