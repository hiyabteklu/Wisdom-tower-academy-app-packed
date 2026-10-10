package com.wisdomtower.academy.ui.packages

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
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
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import com.wisdomtower.academy.ui.theme.WisdomOpenButton
import com.wisdomtower.academy.ui.theme.WisdomPrimaryButton

/**
 * Native Package Detail Screen strictly mirroring website reference:
 * - src/app/academy/freshman/page.tsx
 * - src/app/academy/special-packages/page.tsx
 * - src/app/academy/grades/page.tsx
 * - src/app/academy/[branch]/page.tsx
 *
 * Implements:
 * 1. Stream & Semester grouping for Freshman (Natural vs Social, Sem 1 vs Sem 2)
 * 2. Branch Leaderboard & Collapsible GPA Calculator
 * 3. ECE Semester 1 & Semester 2 engineering courses with official codes & thumbnails
 * 4. Grade 9–12 curriculum subjects with hints and icons
 * 5. Remedial 7 foundation prerequisite subjects
 * 6. Direct hierarchical navigation into native StudyWorkspaceScreen (6 Hubs)
 */
@Composable
fun PackageDetailScreen(
    pkg: NativePackage,
    onBack: () -> Unit,
    onOpenSubjectWorkspace: (title: String, subtitle: String, path: String) -> Unit,
    onStartLearning: (String) -> Unit,
    onUnlock: (String) -> Unit,
    isLoggedIn: Boolean = false,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val isFreshman = pkg.id == "freshman"
    val isEce = pkg.id.startsWith("ece")
    val isGrade = pkg.group == "grades"
    val isRemedial = pkg.id == "remedial"

    // Freshman filter state: 0 = All, 1 = Natural, 2 = Social, 3 = Sem 1, 4 = Sem 2
    var freshmanFilterIndex by remember { mutableIntStateOf(0) }
    var gpaCalculatorOpen by remember { mutableStateOf(false) }

    // ECE semester selector: 1 = Sem 1, 2 = Sem 2
    var eceSemesterIndex by remember {
        mutableIntStateOf(if (pkg.id == "ece-y3-sem-2") 2 else 1)
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Top Navigation Bar
            item(key = "top_nav") {
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
                    Text(
                        text = pkg.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Hero Visual Card (16:9)
            item(key = "hero_card") {
                WisdomModernCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f),
                    cornerRadius = 18.dp
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

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color(0x99000000),
                                        Color(0xEE060B15)
                                    )
                                )
                            )
                    )

                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(14.dp)
                    ) {
                        Text(
                            text = pkg.enrolledLabel,
                            fontSize = 11.sp,
                            color = WisdomCyan,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = pkg.name,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                    }
                }
            }

            // Description & Primary Action
            item(key = "description_and_actions") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = pkg.description,
                        fontSize = 13.sp,
                        color = WisdomMuted,
                        lineHeight = 19.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    WisdomPrimaryButton(
                        text = "Open Study Hubs",
                        onClick = {
                            onOpenSubjectWorkspace(pkg.name, "Academy Package", pkg.path)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        icon = {
                            Icon(
                                imageVector = Icons.Default.School,
                                contentDescription = null,
                                tint = WisdomDarkOnCyan,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )
                }
            }

            // Branch Leaderboard (Freshman, COC, UAT, GAT, Exit Exam)
            if (isFreshman || pkg.group == "branch") {
                item(key = "branch_leaderboard") {
                    BranchLeaderboardCard(branchName = pkg.shortName)
                }
            }

            // Collapsible GPA Calculator (Freshman)
            if (isFreshman) {
                item(key = "collapsible_gpa") {
                    CollapsibleGpaCard(
                        isOpen = gpaCalculatorOpen,
                        onToggle = { gpaCalculatorOpen = !gpaCalculatorOpen }
                    )
                }
            }

            // ── FRESHMAN SECTION: Stream & Semester Filter Tabs + 20 Courses ──
            if (isFreshman) {
                item(key = "freshman_filters") {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Courses by Stream & Semester",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )

                        val filterTabs = listOf("All (21)", "Natural", "Social", "Sem 1", "Sem 2")
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(filterTabs.indices.toList()) { index ->
                                val isSelected = freshmanFilterIndex == index
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(
                                            if (isSelected) WisdomCyan else Color.White.copy(alpha = 0.08f)
                                        )
                                        .border(
                                            BorderStroke(
                                                1.dp,
                                                if (isSelected) WisdomCyan else Color.White.copy(alpha = 0.15f)
                                            ),
                                            RoundedCornerShape(20.dp)
                                        )
                                        .clickable { freshmanFilterIndex = index }
                                        .padding(horizontal = 14.dp, vertical = 7.dp)
                                ) {
                                    Text(
                                        text = filterTabs[index],
                                        fontSize = 12.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) WisdomDark else Color.White
                                    )
                                }
                            }
                        }
                    }
                }

                val filteredFreshmanSubjects = run {
                    when (freshmanFilterIndex) {
                        1 -> FRESHMAN_SUBJECTS.filter { it.id in FRESHMAN_NATURAL_IDS }
                        2 -> FRESHMAN_SUBJECTS.filter { it.id in FRESHMAN_SOCIAL_IDS }
                        3 -> FRESHMAN_SUBJECTS.filter { it.id in FRESHMAN_SEM1_IDS }
                        4 -> FRESHMAN_SUBJECTS.filter { it.id in FRESHMAN_SEM2_IDS }
                        else -> FRESHMAN_SUBJECTS
                    }
                }

                items(filteredFreshmanSubjects, key = { it.id }) { subject ->
                    SubjectRowCard(
                        subject = subject,
                        onClick = {
                            onOpenSubjectWorkspace(
                                subject.name,
                                "Freshman Program · Subject",
                                subject.path
                            )
                        }
                    )
                }
            }

            // ── SPECIAL PACKAGES (ECE): Semester 1 & Semester 2 Engineering Courses ──
            if (isEce) {
                item(key = "ece_semester_selector") {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Department Curriculum (Year 3)",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (eceSemesterIndex == 1) WisdomAccentViolet else Color.White.copy(alpha = 0.08f))
                                    .clickable { eceSemesterIndex = 1 }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "Semester 1 (7 Courses)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (eceSemesterIndex == 1) Color.White else WisdomMuted
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (eceSemesterIndex == 2) WisdomAccentViolet else Color.White.copy(alpha = 0.08f))
                                    .clickable { eceSemesterIndex = 2 }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "Semester 2 (7 Courses)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (eceSemesterIndex == 2) Color.White else WisdomMuted
                                )
                            }
                        }
                    }
                }

                val activeEceCourses = if (eceSemesterIndex == 1) ECE_SEM1_COURSES else ECE_SEM2_COURSES

                items(activeEceCourses, key = { it.code }) { course ->
                    SpecialCourseRowCard(
                        course = course,
                        onClick = {
                            onOpenSubjectWorkspace(
                                "${course.code} · ${course.title}",
                                "ECE Year 3 · ${if (course.semester == "sem-1") "Semester 1" else "Semester 2"}",
                                course.path
                            )
                        }
                    )
                }
            }

            // ── GRADES 9–12: Curriculum Subjects by Grade Level ──
            if (isGrade) {
                val gradeSubjects = when (pkg.id) {
                    "grade-9" -> GRADE_9_SUBJECTS
                    "grade-10" -> GRADE_10_SUBJECTS
                    "grade-11" -> GRADE_11_SUBJECTS
                    "grade-12" -> GRADE_12_SUBJECTS
                    else -> emptyList()
                }

                item(key = "grade_subjects_heading") {
                    Text(
                        text = "Curriculum Subjects (${gradeSubjects.size})",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                items(gradeSubjects, key = { it.id }) { gSubject ->
                    GradeSubjectRowCard(
                        subject = gSubject,
                        accentColor = pkg.accentColor,
                        onClick = {
                            onOpenSubjectWorkspace(
                                "${gSubject.name} (Grade ${gSubject.grade})",
                                "Grade ${gSubject.grade} Curriculum",
                                gSubject.path
                            )
                        }
                    )
                }
            }

            // ── REMEDIAL: 7 Core Foundation Subjects ──
            if (isRemedial) {
                item(key = "remedial_heading") {
                    Text(
                        text = "7 Prerequisite Subjects",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                items(REMEDIAL_SUBJECTS, key = { it.id }) { subject ->
                    SubjectRowCard(
                        subject = subject,
                        onClick = {
                            onOpenSubjectWorkspace(
                                subject.name,
                                "Remedial Program",
                                subject.path
                            )
                        }
                    )
                }
            }

            // What's Included Section
            item(key = "includes_header") {
                Text(
                    text = "What is Included",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            items(pkg.includes) { feature ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF111B2E).copy(alpha = 0.5f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = WisdomCyan,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = feature,
                        fontSize = 12.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}

@Composable
fun BranchLeaderboardCard(branchName: String) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 14.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.EmojiEvents,
                        contentDescription = null,
                        tint = WisdomAccentAmber,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = "$branchName Leaderboard",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Text(
                    text = "Weekly Top",
                    fontSize = 11.sp,
                    color = WisdomCyan,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                LeaderboardPodiumItem(rank = "#1", name = "Addis Ababa Univ.", points = "3,480 pts")
                LeaderboardPodiumItem(rank = "#2", name = "Jimma University", points = "3,120 pts")
                LeaderboardPodiumItem(rank = "#3", name = "Hawassa Univ.", points = "2,890 pts")
            }
        }
    }
}

@Composable
private fun LeaderboardPodiumItem(rank: String, name: String, points: String) {
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Color.White.copy(alpha = 0.04f))
            .padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = rank, fontSize = 11.sp, fontWeight = FontWeight.Black, color = WisdomAccentAmber)
        Text(text = name, fontSize = 10.sp, color = Color.White, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(text = points, fontSize = 9.sp, color = WisdomMuted)
    }
}

@Composable
fun CollapsibleGpaCard(isOpen: Boolean, onToggle: () -> Unit) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 14.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Calculate,
                        contentDescription = null,
                        tint = WisdomCyan,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = "University GPA Calculator",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Icon(
                    imageVector = if (isOpen) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = WisdomMuted,
                    modifier = Modifier.size(20.dp)
                )
            }

            AnimatedVisibility(visible = isOpen) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "Target Ethiopian Higher Education scale (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0).",
                        fontSize = 11.sp,
                        color = WisdomMuted
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Target Term GPA: 3.80+", fontSize = 12.sp, color = WisdomAccentEmerald, fontWeight = FontWeight.Bold)
                        Text(text = "Credits: 19 ECTS", fontSize = 12.sp, color = WisdomMuted)
                    }
                }
            }
        }
    }
}

@Composable
fun SubjectRowCard(
    subject: NativeSubject,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 12.dp,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Subject Thumbnail
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(WisdomDark)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(subject.assetImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = subject.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            // Subject Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = subject.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subject.description,
                    fontSize = 11.sp,
                    color = WisdomMuted,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 14.sp
                )
            }

            WisdomOpenButton(onClick = onClick, label = "Study →")
        }
    }
}

@Composable
fun SpecialCourseRowCard(
    course: NativeSpecialCourse,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 12.dp,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(WisdomDark)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(course.assetImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = course.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = course.code,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomAccentViolet
                )
                Text(
                    text = course.title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            WisdomOpenButton(onClick = onClick, label = "Open →")
        }
    }
}

@Composable
fun GradeSubjectRowCard(
    subject: NativeGradeSubject,
    accentColor: Color,
    onClick: () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 12.dp,
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
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(accentColor.copy(alpha = 0.12f))
                    .border(BorderStroke(1.dp, accentColor.copy(alpha = 0.35f)), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.MenuBook,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = subject.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = subject.hint,
                    fontSize = 11.sp,
                    color = WisdomMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            WisdomOpenButton(onClick = onClick, label = "Study →")
        }
    }
}
