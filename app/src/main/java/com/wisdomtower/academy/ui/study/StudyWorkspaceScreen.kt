package com.wisdomtower.academy.ui.study

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.packages.NATIVE_LEARNING_HUBS
import com.wisdomtower.academy.ui.packages.OpenCard
import com.wisdomtower.academy.ui.packages.openGrid
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted

/**
 * Native Study Workspace Screen: header + the 6 Learning Hub cards.
 *
 * S12b (2026-10-11): removed everything the website does not have (Performance Tracker, Log Score,
 * Recent Activity & Drills, invented subtitle and grade labels). A real tracker must be rebuilt only
 * from the website's real data (see STATUS.md, S12b).
 *
 * Owner card rule (2026-10-11): every card is the shared [OpenCard] (picture, title, "Open") in a
 * two-column grid. The old hub card had a dark gradient over the picture, a category tag and a
 * description; all three are gone. Hub names are the website's (`data/academy.ts` `resourceHubs`).
 * STATUS: not compiled.
 */
@Composable
fun StudyWorkspaceScreen(
    title: String,
    scopeSubtitle: String,
    basePath: String,
    onBack: () -> Unit,
    onOpenHub: (hubId: String, hubUrl: String) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Top Navigation & Subject Title Header
            item(key = "workspace_header") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF111B2E).copy(alpha = 0.8f))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape)
                                .clickable(
                                    interactionSource = remember { MutableInteractionSource() },
                                    indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),
                                    onClick = onBack
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Text(
                                text = scopeSubtitle.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = WisdomCyan,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = title,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            // "Learning Hubs" label: same wording as the website course pages (small, uppercase, muted)
            item(key = "learning_hubs_title") {
                Text(
                    text = "Learning Hubs".uppercase(),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WisdomMuted,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // The 6 hub cards (Books, Short Notes, Flashcards, Question Banks, Exams, Life Savers)
            openGrid("hubs", NATIVE_LEARNING_HUBS) { hub ->
                OpenCard(hub.name, hub.assetImage) {
                    val fullPath = "$basePath/${hub.id}"
                    val url = if (fullPath.startsWith("http")) fullPath else "https://www.wisdom-tower-academy.live$fullPath"
                    onOpenHub(hub.id, url)
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}
