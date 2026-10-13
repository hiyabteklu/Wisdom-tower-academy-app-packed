package com.wisdomtower.academy.ui.settings

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.content.MySubjectsStore
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted

/**
 * T8 "My Subjects" card of the Settings screen: the student picks the package(s) they study and, inside each, the
 * subjects. "Your status" counts only these (see `NativeStatusScreen`). Wrapping pills like the Account screen, nothing
 * cut off to the right. The choice stays on this device (per signed-in user); nothing is deleted or hidden anywhere.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MySubjectsSection(
    userId: String?,
    educationLevel: String?,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    LaunchedEffect(userId) { MySubjectsStore.load(context, userId) }

    val choice = MySubjectsStore.choice
    // Packages the student just tapped but has not picked a subject in yet (not saved until a subject is picked)
    var tappedOpen by remember { mutableStateOf<Set<String>>(emptySet()) }
    val openIds: Set<String> = tappedOpen + choice.keys
    val active = resolveActiveSubjects(choice, educationLevel)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (userId.isNullOrBlank()) {
            Text(
                "Sign in to choose your subjects.",
                fontSize = 12.sp,
                color = WisdomMuted,
                lineHeight = 17.sp
            )
        } else {
            Text("WHAT ARE YOU STUDYING?", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.8.sp)

            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MY_SUBJECT_GROUPS.forEach { group ->
                    SubjectPill(
                        label = group.label,
                        selected = openIds.contains(group.id),
                        onClick = {
                            if (openIds.contains(group.id)) {
                                tappedOpen = tappedOpen - group.id
                                MySubjectsStore.clearGroup(group.id)
                            } else {
                                tappedOpen = tappedOpen + group.id
                            }
                        }
                    )
                }
            }

            val hint = when (active.source) {
                SubjectsSource.CHOSEN -> "Your status counts only the subjects you picked."
                SubjectsSource.FROM_LEVEL ->
                    "Until you pick subjects, your status counts every subject of your Academic Level."
                SubjectsSource.NONE -> "Until you pick subjects, your status counts all your activity."
            }
            Text(hint, fontSize = 11.sp, color = WisdomMuted, lineHeight = 16.sp)

            MY_SUBJECT_GROUPS.filter { openIds.contains(it.id) }.forEach { group ->
                val picked: Set<String> = choice[group.id] ?: emptySet()
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "${group.label.uppercase()} · ${picked.size} selected",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            letterSpacing = 0.6.sp
                        )
                        Text(
                            "Clear",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WisdomCyan,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable {
                                    tappedOpen = tappedOpen + group.id
                                    MySubjectsStore.clearGroup(group.id)
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }

                    if (group.id == "freshman") {
                        Text("QUICK FILL", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.8.sp)
                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FRESHMAN_QUICK_FILLS.forEach { fill ->
                                SubjectPill(
                                    label = fill.first,
                                    selected = false,
                                    onClick = {
                                        tappedOpen = tappedOpen + group.id
                                        MySubjectsStore.setGroup(group.id, fill.second)
                                    }
                                )
                            }
                        }
                    }

                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        group.subjects.forEach { subject ->
                            SubjectPill(
                                label = subject.name,
                                selected = picked.contains(subject.slug),
                                onClick = {
                                    val next = if (picked.contains(subject.slug)) picked - subject.slug else picked + subject.slug
                                    tappedOpen = tappedOpen + group.id
                                    MySubjectsStore.setGroup(group.id, next)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SubjectPill(label: String, selected: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Box(
        modifier = Modifier
            .clip(shape)
            .background(if (selected) WisdomCyan else Color.White.copy(alpha = 0.06f))
            .border(BorderStroke(1.dp, if (selected) WisdomCyan else WisdomBorderWhite), shape)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            label,
            fontSize = 12.5.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            color = if (selected) WisdomDarkOnCyan else Color(0xFFE2E8F0)
        )
    }
}
