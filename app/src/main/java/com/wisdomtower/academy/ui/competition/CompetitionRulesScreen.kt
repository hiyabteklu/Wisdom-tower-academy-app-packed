package com.wisdomtower.academy.ui.competition

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.wisdomtower.academy.ui.theme.AtmosphereBackground

private val RulesCardBg = Color(0xFF131F38)
private val RulesCyan = Color(0xFF22E0FF)
private val RulesMuted = Color(0xFF94A3B8)
private val RulesRed = Color(0xFFF87171)
private val RulesDarkText = Color(0xFF0A101D)

// Session U (owner, 2026-10-15): the exam must open on a FULL screen (no top bar, no bottom bar) and the
// student must first read a short red warning. Two parts live in this file:
// 1. CompetitionFullScreen: a full-screen dialog that covers the whole phone screen. The hub shows the rules
//    page and the exam inside it (no MainActivity change). Back is handled by the content (BackHandler) and,
//    as a backup, by onBack.
// 2. CompetitionRulesScreen: the reading page before a RANKED attempt. Short red lines with an exclamation
//    mark, in the owner's words. It replaces the small confirm line that used to sit on the hub card.
// Session V (owner, first phone test): with decorFitsSystemWindows = false the dialog window sat BELOW the
// status bar but was as tall as the whole screen, so the bottom buttons were pushed off the screen (evidence:
// the screenshot, hypothesis for the cause). The dialog now keeps the default (the system fits it between the
// status bar and the navigation bar) and the screens below add no inset padding of their own.
// NOTE for the owner: the warning says the built-in system will flag the student. The flagging itself is
// stage C10 and is NOT built yet, so today the text is a warning only.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@Composable
fun CompetitionFullScreen(
    onBack: () -> Unit,
    content: @Composable () -> Unit
) {
    Dialog(
        onDismissRequest = onBack,
        properties = DialogProperties(
            dismissOnBackPress = true,
            dismissOnClickOutside = false,
            usePlatformDefaultWidth = false
        )
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            content()
        }
    }
}

@Composable
fun CompetitionRulesScreen(
    title: String,
    questionCount: Int,
    durationMin: Int,
    starting: Boolean,
    onStart: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier
) {
    BackHandler(enabled = true) {
        if (!starting) onCancel()
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = questionCount.toString() + " questions  \u2022  " + durationMin.toString() + " min",
                    color = Color(0xFFE2E8F0),
                    fontSize = 14.sp
                )

                val warningShape = RoundedCornerShape(16.dp)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(RulesRed.copy(alpha = 0.08f), warningShape)
                        .border(1.dp, RulesRed.copy(alpha = 0.7f), warningShape)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    RulesLine("! Any attempt to cheat will result in disqualification.")
                    RulesLine("! No notes, books or other references.")
                    RulesLine("! No AI tools.")
                    RulesLine("! Do not leave this window.")
                    RulesLine("! Our built-in system will flag you.")
                }

                Text(
                    text = "Your ranked attempt cannot be restarted. The clock keeps running until the contest ends.",
                    color = RulesMuted,
                    fontSize = 13.sp
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                RulesButton(
                    label = "Cancel",
                    filled = false,
                    enabled = !starting,
                    onClick = onCancel,
                    modifier = Modifier.weight(1f)
                )
                RulesButton(
                    label = if (starting) "Starting..." else "I understand, start",
                    filled = true,
                    enabled = !starting,
                    onClick = onStart,
                    modifier = Modifier.weight(2f)
                )
            }
        }
    }
}

@Composable
private fun RulesLine(text: String) {
    Text(
        text = text,
        color = RulesRed,
        fontSize = 15.sp,
        fontWeight = FontWeight.Bold
    )
}

@Composable
private fun RulesButton(
    label: String,
    filled: Boolean,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val shape = RoundedCornerShape(12.dp)
    val alpha = if (enabled) 1f else 0.5f
    Box(
        modifier = modifier
            .clip(shape)
            .background(if (filled) RulesCyan.copy(alpha = alpha) else RulesCardBg)
            .border(1.dp, RulesCyan.copy(alpha = if (filled) 0f else 0.5f * alpha), shape)
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = 20.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (filled) RulesDarkText else Color.White.copy(alpha = alpha),
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
