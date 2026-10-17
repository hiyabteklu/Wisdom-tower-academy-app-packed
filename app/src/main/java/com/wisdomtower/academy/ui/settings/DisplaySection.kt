package com.wisdomtower.academy.ui.settings

import android.content.Context
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.NightsStay
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.AppBackground
import com.wisdomtower.academy.ui.theme.AppBackgroundOption
import com.wisdomtower.academy.ui.theme.AppThemeMode
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomExpandable
import com.wisdomtower.academy.ui.theme.WisdomGlassCard
import com.wisdomtower.academy.ui.theme.WisdomGlassFillStrong
import com.wisdomtower.academy.ui.theme.WisdomInk
import com.wisdomtower.academy.ui.theme.WisdomMuted
import com.wisdomtower.academy.ui.theme.WisdomOnInk
import com.wisdomtower.academy.ui.theme.WisdomPrimaryBtnGradient
import com.wisdomtower.academy.ui.theme.WisdomTextPrimary
import com.wisdomtower.academy.ui.theme.appBackdrop
import com.wisdomtower.academy.ui.theme.wisdomAnimatedColor

/**
 * L1 of docs/DAY_NIGHT_PLAN.md (owner order 2026-10-17): ONE Settings card for Display, Theme and Background.
 *
 *  1. THEME       a sun / moon ICON switch (no text). Tap it: the whole app changes at once ([AppThemeMode]) and the choice is saved.
 *  2. BACKGROUND  the five round swatches of the mode in use now (night looks at night, day looks by day), see [AppBackground].
 *  3. FONT SIZE, 4. TYPOGRAPHY STYLE and LIVE SAMPLE PREVIEW: moved here unchanged from the old "Reading & Display" card
 *     (same texts, same saved setting `font_size` in `wt_settings_prefs`).
 *
 * It replaces the two cards "Reading & Display" and "Background" (scripts/patch_l1_display_section.py does the swap in
 * SettingsScreen.kt, which is too big to resend). Every colour here is a mode-aware token from Color.kt, so text keeps its
 * contrast in both modes. TalkBack: the switch is announced as a switch named "Day and night mode" with its state.
 * Texts that are new: the card title and the five day background names (the subtitle shows the chosen mode and background).
 */
@Composable
fun DisplayThemeSection() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("wt_settings_prefs", Context.MODE_PRIVATE) }
    var expanded by remember { mutableStateOf(false) }
    var fontSize by remember { mutableStateOf(prefs.getString("font_size", "normal") ?: "normal") }
    val isDark = AppThemeMode.isDark
    val chosen = AppBackground.selected

    val edge by animateColorAsState(
        targetValue = if (expanded) WisdomCyan.copy(alpha = 0.4f) else WisdomBorderWhite,
        animationSpec = tween(240),
        label = "displayEdge"
    )
    val chevronTint by animateColorAsState(
        targetValue = if (expanded) WisdomCyan else WisdomMuted,
        animationSpec = tween(240),
        label = "displayChevronTint"
    )
    val chevronAngle by animateFloatAsState(
        targetValue = if (expanded) 180f else 0f,
        animationSpec = spring(dampingRatio = 0.8f, stiffness = 400f),
        label = "displayChevron"
    )

    WisdomGlassCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        borderColor = edge
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { stateDescription = if (expanded) "Expanded" else "Collapsed" }
                    .clickable(role = Role.Button) { expanded = !expanded }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(WisdomInk.copy(alpha = 0.05f))
                            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Filled.Palette, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(20.dp))
                    }
                    Column {
                        Text(text = "Display & Theme", fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = WisdomTextPrimary)
                        Text(
                            text = (if (isDark) "Night mode" else "Day mode") + " · " + chosen.label,
                            fontSize = 11.sp,
                            color = WisdomMuted
                        )
                    }
                }
                Icon(
                    imageVector = Icons.Filled.KeyboardArrowDown,
                    contentDescription = null,
                    tint = chevronTint,
                    modifier = Modifier.size(20.dp).rotate(chevronAngle)
                )
            }

            WisdomExpandable(visible = expanded) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(WisdomInk.copy(alpha = 0.02f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite.copy(alpha = 0.4f)))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        DisplayLabel("1. THEME")
                        DayNightSwitch(isDark = isDark, onChange = { dark -> AppThemeMode.setDark(context, dark) })

                        DisplayLabel("2. BACKGROUND")
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                            AppBackground.options.forEach { option ->
                                DisplaySwatch(
                                    option = option,
                                    isSelected = option == chosen,
                                    modifier = Modifier.weight(1f),
                                    onPick = { AppBackground.select(context, option) }
                                )
                            }
                        }

                        DisplayLabel("3. FONT SIZE")
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(
                                "compact" to ("Compact" to "15.5px"),
                                "normal" to ("Standard" to "16px"),
                                "large" to ("Large" to "18px")
                            ).forEach { (id, pair) ->
                                val isSelected = fontSize == id
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(wisdomAnimatedColor(isSelected, WisdomInk, WisdomInk.copy(alpha = 0.04f)))
                                        .border(
                                            BorderStroke(1.dp, wisdomAnimatedColor(isSelected, WisdomInk, WisdomBorderWhite)),
                                            RoundedCornerShape(12.dp)
                                        )
                                        .selectable(
                                            selected = isSelected,
                                            role = Role.RadioButton,
                                            onClick = {
                                                fontSize = id
                                                prefs.edit().putString("font_size", id).apply()
                                            }
                                        )
                                        .padding(vertical = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(
                                            text = pair.first,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = wisdomAnimatedColor(isSelected, WisdomOnInk, WisdomTextPrimary)
                                        )
                                        Text(
                                            text = pair.second,
                                            fontSize = 12.sp,
                                            color = wisdomAnimatedColor(isSelected, WisdomOnInk.copy(alpha = 0.75f), WisdomMuted)
                                        )
                                    }
                                }
                            }
                        }

                        DisplayLabel("4. TYPOGRAPHY STYLE")
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(WisdomInk.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Column {
                                Text(text = "Wisdom Tower Signature Bold", fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = WisdomTextPrimary)
                                Text(
                                    text = "Geometric sans-serif (Plus Jakarta Sans) with rich weights, punchy headers, and crystal-clear math and equation readability across notes and flashcards.",
                                    fontSize = 11.sp,
                                    color = WisdomMuted,
                                    lineHeight = 15.sp,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }

                        // Live Sample Preview (website texts and px sizes)
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            DisplayLabel("LIVE SAMPLE PREVIEW")
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(WisdomInk.copy(alpha = 0.05f))
                                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                    .padding(14.dp)
                            ) {
                                val sampleSize = when (fontSize) {
                                    "compact" -> 15.5.sp
                                    "large" -> 18.sp
                                    else -> 16.sp
                                }
                                val sampleLabel = when (fontSize) {
                                    "compact" -> "Compact (15.5px)"
                                    "large" -> "Large (18px)"
                                    else -> "Standard (16px)"
                                }
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = sampleLabel,
                                        fontSize = 11.sp,
                                        color = WisdomTextPrimary.copy(alpha = 0.85f),
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "PREVIEW",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = WisdomMuted,
                                        letterSpacing = 0.5.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(1.dp)
                                        .background(WisdomBorderWhite)
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = "Wisdom Tower Academy features a bold, stylized typography system engineered for effortless scanning and long-term concept retention across mobile and desktop displays.",
                                    fontSize = sampleSize,
                                    fontWeight = FontWeight.Medium,
                                    color = WisdomTextPrimary,
                                    lineHeight = sampleSize * 1.5f
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DisplayLabel(text: String) {
    Text(text = text, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.5.sp)
}

/**
 * The day / night switch, icons only: a pill with a sun on the left and a moon on the right, and a round cyan thumb that
 * slides under the active icon (springy, like the rest of the app). Tapping anywhere on the pill flips the mode. The
 * pill is 52 dp tall, so it is a comfortable touch target. The active icon is dark on the cyan thumb (white by day, see
 * [WisdomDarkOnCyan]), the inactive one is [WisdomMuted]; both have at least 3:1 contrast in both modes.
 */
@Composable
private fun DayNightSwitch(isDark: Boolean, onChange: (Boolean) -> Unit) {
    val trackWidth = 108.dp
    val trackHeight = 52.dp
    val pad = 4.dp
    val thumbSize = trackHeight - pad - pad
    val thumbX by animateDpAsState(
        targetValue = if (isDark) trackWidth - thumbSize - pad else pad,
        animationSpec = spring(dampingRatio = 0.75f, stiffness = 500f),
        label = "dayNightThumb"
    )
    val sunTint = wisdomAnimatedColor(!isDark, WisdomDarkOnCyan, WisdomMuted)
    val moonTint = wisdomAnimatedColor(isDark, WisdomDarkOnCyan, WisdomMuted)

    Box(
        modifier = Modifier
            .size(width = trackWidth, height = trackHeight)
            .clip(CircleShape)
            .background(WisdomGlassFillStrong)
            .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape)
            .toggleable(value = isDark, role = Role.Switch, onValueChange = onChange)
            .semantics {
                contentDescription = "Day and night mode"
                stateDescription = if (isDark) "Night mode" else "Day mode"
            }
    ) {
        Box(
            modifier = Modifier
                .offset(x = thumbX, y = pad)
                .size(thumbSize)
                .clip(CircleShape)
                .background(WisdomPrimaryBtnGradient)
        )
        Row(
            modifier = Modifier.fillMaxSize().padding(horizontal = pad),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.size(thumbSize), contentAlignment = Alignment.Center) {
                Icon(Icons.Filled.WbSunny, contentDescription = null, tint = sunTint, modifier = Modifier.size(24.dp))
            }
            Box(modifier = Modifier.size(thumbSize), contentAlignment = Alignment.Center) {
                Icon(Icons.Filled.NightsStay, contentDescription = null, tint = moonTint, modifier = Modifier.size(24.dp))
            }
        }
    }
}

@Composable
private fun DisplaySwatch(
    option: AppBackgroundOption,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onPick: () -> Unit
) {
    val ring = wisdomAnimatedColor(isSelected, WisdomCyan, Color.Transparent)
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .selectable(selected = isSelected, role = Role.RadioButton, onClick = onPick)
            .padding(vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(52.dp)
                .border(BorderStroke(2.dp, ring), CircleShape)
                .padding(4.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
                    .appBackdrop(option)
                    .border(BorderStroke(1.dp, WisdomInk.copy(alpha = 0.35f)), CircleShape)
            )
        }
        Text(
            text = option.label,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) WisdomTextPrimary else WisdomMuted,
            textAlign = TextAlign.Center
        )
    }
}
