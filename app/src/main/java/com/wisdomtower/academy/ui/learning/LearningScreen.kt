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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.ripple
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.wisdomtower.academy.data.model.StudentIdGenerator
import com.wisdomtower.academy.data.model.UserProfile
import com.wisdomtower.academy.ui.packages.CATALOG_PACKAGES
import com.wisdomtower.academy.ui.packages.NativePackage
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

/**
 * Native Learning screen strictly mirroring website reference:
 * - src/app/learning/page.tsx
 * - src/app/learning/LearningContent.tsx
 *
 * Header:
 * - Scholar Avatar, Full Name, Student Folio (WTA-XXXX), User Email
 * - Quick Metrics Bar: Streak (1d Streak), Goals (% Goals), Tested (X Tested)
 * - Guest Scholar Banner if signed out
 *
 * Study Tools Dock (8 tiles):
 * - Timer, Planner, Targets, Notebook, Calculator, AI Tutor, Your status, Courses
 *
 * Curriculum Section:
 * - Header: Curriculum with "All Courses (X)"
 * - 2-Column cards with 16:9 images, titles, level badges, and "Start Learning"
 */

data class StudyToolTile(
    val key: String,
    val title: String,
    val icon: ImageVector,
    val url: String
)

val STUDY_TOOLS_TILES = listOf(
    StudyToolTile("timer", "Timer", Icons.Default.Timer, "/learning?tool=timer"),
    StudyToolTile("planner", "Planner", Icons.Default.CalendarMonth, "/learning?tool=planner"),
    StudyToolTile("goals", "Targets", Icons.Default.CheckCircle, "/learning?tool=goals"),
    StudyToolTile("notes", "Notebook", Icons.Default.Folder, "/learning?tool=notes"),
    StudyToolTile("calculator", "Calculator", Icons.Default.Calculate, "/learning?tool=calculator"),
    StudyToolTile("tutor", "AI Tutor", Icons.Default.AutoAwesome, "/learning?tool=tutor"),
    StudyToolTile("analytics", "Your status", Icons.AutoMirrored.Filled.TrendingUp, "/learning?tool=analytics"),
    StudyToolTile("courses", "Courses", Icons.AutoMirrored.Filled.MenuBook, "/packages")
)

@Composable
fun LearningScreen(
    modifier: Modifier = Modifier,
    isLoggedIn: Boolean = false,
    userName: String? = null,
    userEmail: String? = null,
    userProfile: UserProfile? = null,
    packageList: List<NativePackage> = CATALOG_PACKAGES,
    onOpenTool: (String) -> Unit = {},
    onOpenHub: (String) -> Unit = {},
    onSelectCourse: (NativePackage) -> Unit = {},
    onNavigateToUrl: (String) -> Unit = {}
) {
    val displayName = userProfile?.fullName ?: userName ?: if (isLoggedIn) "Student Scholar" else "Scholar"
    val email = userProfile?.email ?: userEmail
    val studentIdData = remember(userProfile, isLoggedIn) {
        StudentIdGenerator.computeStudentId(userProfile?.id, userProfile)
    }
    val studentId = studentIdData.idNumber

    // Filter enrolled / featured courses for Curriculum section (defaults to Freshman, COC, Grade 12, etc.)
    val enrolledCourses = remember(packageList) {
        val preferredIds = listOf("freshman", "coc", "grade-12", "uat", "ece-y3-sem-1", "remedial")
        val found = packageList.filter { it.id in preferredIds }
        if (found.isNotEmpty()) found else packageList.take(6)
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // TOP HEADER: Scholar Name, Folio, Email, Quick Metrics
            item(key = "learning_header") {
                WisdomModernCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 24.dp,
                    borderColor = WisdomBorderWhite
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                // Avatar Initial Box
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(Color.White.copy(alpha = 0.08f))
                                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.14f)), RoundedCornerShape(14.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = displayName.take(1).uppercase(),
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                }

                                Column {
                                    Text(
                                        text = displayName,
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = studentId,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = WisdomCyan,
                                            fontFamily = FontFamily.Monospace
                                        )
                                        if (!email.isNullOrBlank()) {
                                            Text(
                                                text = "• $email",
                                                fontSize = 10.5.sp,
                                                color = WisdomMuted,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Compact Quick Metrics Bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Metric 1: Streak
                            Row(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(Color.White.copy(alpha = 0.04f))
                                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(20.dp))
                                    .padding(vertical = 6.dp, horizontal = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(Icons.Default.LocalFireDepartment, contentDescription = null, tint = WisdomAccentAmber, modifier = Modifier.size(13.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(text = "1d Streak", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                            }

                            // Metric 2: Goals
                            Row(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(Color.White.copy(alpha = 0.04f))
                                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(20.dp))
                                    .padding(vertical = 6.dp, horizontal = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(13.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(text = "100% Goals", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                            }

                            // Metric 3: Tested
                            Row(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(Color.White.copy(alpha = 0.04f))
                                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(20.dp))
                                    .padding(vertical = 6.dp, horizontal = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = WisdomAccentAmber, modifier = Modifier.size(13.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(text = "0 Tested", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                            }
                        }
                    }
                }
            }

            // GUEST SCHOLAR BANNER (if signed out)
            if (!isLoggedIn) {
                item(key = "guest_banner") {
                    WisdomModernCard(
                        modifier = Modifier.fillMaxWidth(),
                        cornerRadius = 18.dp,
                        borderColor = WisdomBorderWhite
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "Scholar Access",
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Sign in or create an account to sync your study notes, targets, and course progress.",
                                fontSize = 11.sp,
                                color = WisdomMuted,
                                lineHeight = 15.sp
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(Color.White)
                                        .clickable { onNavigateToUrl("/login") }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = "Sign In", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                }

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(Color.White.copy(alpha = 0.05f))
                                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)), RoundedCornerShape(20.dp))
                                        .clickable { onNavigateToUrl("/signup") }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = "Create Account", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                }
                            }
                        }
                    }
                }
            }

            // STUDY TOOLS DOCK (8 tiles matching website)
            item(key = "study_tools_dock") {
                WisdomModernCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 24.dp,
                    borderColor = WisdomBorderWhite
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "STUDY TOOLS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = WisdomMuted,
                            letterSpacing = 0.8.sp,
                            modifier = Modifier.padding(start = 2.dp)
                        )

                        // 4x2 Grid of phone-like toolbar tiles
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Row 1 (Timer, Planner, Targets, Notebook)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                STUDY_TOOLS_TILES.take(4).forEach { tile ->
                                    Box(modifier = Modifier.weight(1f)) {
                                        ToolTileButton(
                                            tile = tile,
                                            onClick = { onOpenTool(tile.url) }
                                        )
                                    }
                                }
                            }

                            // Row 2 (Calculator, AI Tutor, Your status, Courses)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                STUDY_TOOLS_TILES.drop(4).forEach { tile ->
                                    Box(modifier = Modifier.weight(1f)) {
                                        ToolTileButton(
                                            tile = tile,
                                            onClick = {
                                                if (tile.key == "courses") {
                                                    onNavigateToUrl("/packages")
                                                } else {
                                                    onOpenTool(tile.url)
                                                }
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // CURRICULUM SECTION
            item(key = "curriculum_header") {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp, bottom = 2.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.MenuBook,
                            contentDescription = null,
                            tint = WisdomCyan,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Curriculum",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(Color.White.copy(alpha = 0.04f))
                            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(20.dp))
                            .clickable { onNavigateToUrl("/packages") }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "All Courses (${packageList.size})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = WisdomCyan
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = WisdomCyan,
                                modifier = Modifier.size(11.dp)
                            )
                        }
                    }
                }
            }

            // 2-Column Curriculum Cards Grid
            items(
                count = (enrolledCourses.size + 1) / 2,
                key = { rowIndex -> "curriculum_row_$rowIndex" }
            ) { rowIndex ->
                val first = enrolledCourses[rowIndex * 2]
                val second = enrolledCourses.getOrNull(rowIndex * 2 + 1)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(modifier = Modifier.weight(1f)) {
                        CurriculumCourseCard(
                            pkg = first,
                            onClick = {
                                onOpenHub(first.path)
                            },
                            onOpenHubLink = onOpenHub
                        )
                    }
                    if (second != null) {
                        Box(modifier = Modifier.weight(1f)) {
                            CurriculumCourseCard(
                                pkg = second,
                                onClick = {
                                    onOpenHub(second.path)
                                },
                                onOpenHubLink = onOpenHub
                            )
                        }
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            item(key = "learning_bottom_spacer") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
private fun ToolTileButton(
    tile: StudyToolTile,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White.copy(alpha = 0.04f))
            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(16.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),
                onClick = onClick
            )
            .padding(vertical = 10.dp, horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.06f))
                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = tile.icon,
                    contentDescription = null,
                    tint = WisdomCyan,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = tile.title,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun CurriculumCourseCard(
    pkg: NativePackage,
    onClick: () -> Unit,
    onOpenHubLink: (String) -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        onClick = onClick
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
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

                // Level tag overlay
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .fillMaxWidth()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color(0xEE060B15))
                            )
                        )
                        .padding(horizontal = 10.dp, vertical = 8.dp)
                ) {
                    Column {
                        Text(
                            text = pkg.name,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = pkg.enrolledLabel.uppercase(),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WisdomCyan,
                            letterSpacing = 0.5.sp
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 10.dp)
            ) {
                // Progress Indicator
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Progress",
                        fontSize = 10.sp,
                        color = WisdomMuted
                    )
                    Text(
                        text = "Active",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WisdomAccentEmerald
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(Color.White.copy(alpha = 0.08f))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.35f)
                            .height(4.dp)
                            .background(WisdomCyan)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Fast Hub Links (Books, Notes, Cards, Questions, Exams, Life Savers)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    val quickHubs = listOf(
                        "books" to "Books",
                        "short-notes" to "Notes",
                        "flashcards" to "Cards",
                        "question-banks" to "Quizzes",
                        "exams" to "Exams",
                        "life-savers" to "Guides"
                    )
                    quickHubs.take(4).forEach { (hubId, hubLabel) ->
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color.White.copy(alpha = 0.04f))
                                .border(BorderStroke(0.5.dp, Color.White.copy(alpha = 0.1f)), RoundedCornerShape(6.dp))
                                .clickable { onOpenHubLink("${pkg.path}/$hubId") }
                                .padding(vertical = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = hubLabel,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Medium,
                                color = WisdomMuted,
                                maxLines = 1
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Continue action button
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomCyan.copy(alpha = 0.12f))
                        .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.45f)), RoundedCornerShape(8.dp))
                        .clickable(onClick = onClick)
                        .padding(vertical = 6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.MenuBook,
                            contentDescription = null,
                            tint = WisdomCyan,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Continue",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WisdomCyan
                        )
                    }
                }
            }
        }
    }
}

