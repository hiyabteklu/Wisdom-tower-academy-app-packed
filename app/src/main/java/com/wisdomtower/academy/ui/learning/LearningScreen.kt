package com.wisdomtower.academy.ui.learning

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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.wisdomtower.academy.ui.packages.CATALOG_PACKAGES
import com.wisdomtower.academy.ui.packages.NativePackage
import com.wisdomtower.academy.data.model.UserProfile
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentPurple
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import com.wisdomtower.academy.ui.theme.WisdomOpenButton

data class StudyTool(
    val id: String,
    val name: String,
    val urlParam: String,
    val icon: ImageVector,
    val color: Color
)

data class StudyModeHub(
    val title: String,
    val description: String,
    val path: String,
    val icon: ImageVector,
    val accentColor: Color
)

val STUDY_TOOLS = listOf(
    StudyTool("tutor", "AI Tutor", "tool=tutor", Icons.Default.AutoAwesome, WisdomCyan),
    StudyTool("calc", "Calculator", "tool=calc", Icons.Default.Calculate, WisdomAccentPurple),
    StudyTool("notes", "Notebook", "tool=note", Icons.Default.EditNote, WisdomAccentAmber),
    StudyTool("timer", "Pomodoro", "tool=time", Icons.Default.Timer, WisdomAccentEmerald),
    StudyTool("planner", "Planner", "tool=plan", Icons.Default.CalendarMonth, WisdomAccentSky),
    StudyTool("analytics", "Tracker", "tool=analytics", Icons.Default.BarChart, WisdomAccentRose),
    StudyTool("goals", "Targets", "tool=goals", Icons.Default.CheckCircle, WisdomAccentEmerald)
)

val STUDY_HUBS = listOf(
    StudyModeHub(
        title = "Official Textbooks",
        description = "Read curriculum & reference books offline",
        path = "/academy/freshman/books",
        icon = Icons.AutoMirrored.Filled.MenuBook,
        accentColor = WisdomCyan
    ),
    StudyModeHub(
        title = "Short Notes",
        description = "Chapter-by-chapter summaries & formulas",
        path = "/academy/freshman/short-notes",
        icon = Icons.Default.Description,
        accentColor = WisdomAccentAmber
    ),
    StudyModeHub(
        title = "Question Banks",
        description = "Targeted drills with AI explanations",
        path = "/academy/freshman/question-banks",
        icon = Icons.Default.Quiz,
        accentColor = WisdomAccentPurple
    ),
    StudyModeHub(
        title = "Practice Exams",
        description = "Model & timed exams with full solutions",
        path = "/academy/freshman/exams",
        icon = Icons.AutoMirrored.Filled.Assignment,
        accentColor = WisdomAccentEmerald
    ),
    StudyModeHub(
        title = "Flashcard Decks",
        description = "Rapid active recall & spaced repetition",
        path = "/academy/freshman/flashcards",
        icon = Icons.Default.Layers,
        accentColor = WisdomAccentRose
    ),
    StudyModeHub(
        title = "Life Savers",
        description = "High-yield formulas, cheat sheets & quick recall",
        path = "/academy/freshman/life-savers",
        icon = Icons.Default.School,
        accentColor = WisdomAccentSky
    )
)

@Composable
fun LearningScreen(
    modifier: Modifier = Modifier,
    isLoggedIn: Boolean = false,
    userProfile: UserProfile? = null,
    packageList: List<NativePackage> = CATALOG_PACKAGES,
    onOpenTool: (String) -> Unit,
    onOpenHub: (String) -> Unit,
    onSelectCourse: (NativePackage) -> Unit
) {
    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // Header
            item(key = "learning_header") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Learning Suite",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (isLoggedIn && !userProfile?.fullName.isNullOrBlank()) {
                            "Welcome back, ${userProfile?.fullName} · ${userProfile?.educationLevel ?: "Academic Track"}"
                        } else {
                            "Study workspace, smart tools, textbooks, and interactive question banks."
                        },
                        fontSize = 13.sp,
                        color = if (isLoggedIn) WisdomCyan else WisdomMuted,
                        lineHeight = 18.sp
                    )
                }
            }

            // Academic Progress Tracker & Analytics (Phase C)
            item(key = "progress_tracker_card") {
                WisdomModernCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 16.dp,
                    borderColor = WisdomCyan.copy(alpha = 0.4f),
                    onClick = { onOpenTool("/learning?tool=analytics") }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(WisdomAccentRose.copy(alpha = 0.16f))
                                    .border(BorderStroke(1.dp, WisdomAccentRose.copy(alpha = 0.45f)), RoundedCornerShape(10.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.BarChart,
                                    contentDescription = null,
                                    tint = WisdomAccentRose,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Academic Progress Tracker",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = if (isLoggedIn) "Live sync with your study records & scores" else "Track streak, targets & tested exam scores",
                                    fontSize = 11.sp,
                                    color = WisdomMuted
                                )
                            }
                        }

                        WisdomOpenButton(onClick = { onOpenTool("/learning?tool=analytics") })
                    }
                }
            }

            // Quick Study Tools Carousel
            item(key = "tools_carousel") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Study Tools",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 10.dp)
                    )

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(STUDY_TOOLS) { tool ->
                            StudyToolChip(
                                tool = tool,
                                onClick = { onOpenTool("/learning?${tool.urlParam}") }
                            )
                        }
                    }
                }
            }

            // Study Mode Hubs (Textbooks, Notes, Question Bank, Exams, Flashcards)
            item(key = "hubs_header") {
                Text(
                    text = "Study Hubs",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            items(STUDY_HUBS) { hub ->
                StudyHubRowCard(
                    hub = hub,
                    onClick = { onOpenHub(hub.path) }
                )
            }

            // Programs & Courses Section
            item(key = "courses_header") {
                Text(
                    text = "Your Programs & Courses",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(top = 10.dp)
                )
            }

            items(
                count = (packageList.size + 1) / 2,
                key = { rowIndex -> "course_row_$rowIndex" }
            ) { rowIndex ->
                val first = packageList[rowIndex * 2]
                val second = packageList.getOrNull(rowIndex * 2 + 1)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(modifier = Modifier.weight(1f)) {
                        CourseLaunchCard(
                            pkg = first,
                            onClick = { onSelectCourse(first) }
                        )
                    }
                    if (second != null) {
                        Box(modifier = Modifier.weight(1f)) {
                            CourseLaunchCard(
                                pkg = second,
                                onClick = { onSelectCourse(second) }
                            )
                        }
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

@Composable
private fun StudyToolChip(
    tool: StudyTool,
    onClick: () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.width(108.dp),
        cornerRadius = 14.dp,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(tool.color.copy(alpha = 0.14f))
                    .border(BorderStroke(1.dp, tool.color.copy(alpha = 0.4f)), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = tool.icon,
                    contentDescription = tool.name,
                    tint = tool.color,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = tool.name,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun StudyHubRowCard(
    hub: StudyModeHub,
    onClick: () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 14.dp,
        borderColor = WisdomBorderWhite,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(hub.accentColor.copy(alpha = 0.12f))
                    .border(BorderStroke(1.dp, hub.accentColor.copy(alpha = 0.35f)), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = hub.icon,
                    contentDescription = null,
                    tint = hub.accentColor,
                    modifier = Modifier.size(22.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = hub.title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = hub.description,
                    fontSize = 11.sp,
                    color = WisdomMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            WisdomOpenButton(onClick = onClick, label = "Enter →")
        }
    }
}

@Composable
private fun CourseLaunchCard(
    pkg: NativePackage,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 14.dp,
        onClick = onClick
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 10f)
                    .background(WisdomDark)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(pkg.assetImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = pkg.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = pkg.name,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 6.dp)
                )

                WisdomOpenButton(onClick = onClick, label = "Study →")
            }
        }
    }
}
