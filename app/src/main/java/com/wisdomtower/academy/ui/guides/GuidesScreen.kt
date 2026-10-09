package com.wisdomtower.academy.ui.guides

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.FormatQuote
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.LocalCafe
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Park
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.ripple
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentOrange
import com.wisdomtower.academy.ui.theme.WisdomAccentPurple
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

@Composable
fun GuidesScreen(
    initialSlug: String = "study-techniques",
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var activeSlug by remember { mutableStateOf(initialSlug) }

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
                        text = "Academy Guide & Resources",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            // Guide Switcher Row
            item(key = "switcher_row") {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(GUIDE_TABS) { tab ->
                        val isSelected = activeSlug == tab.slug
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .border(
                                    BorderStroke(
                                        1.dp,
                                        if (isSelected) tab.accentColor else WisdomBorderWhite
                                    ),
                                    RoundedCornerShape(20.dp)
                                )
                                .background(
                                    if (isSelected) tab.accentColor.copy(alpha = 0.15f)
                                    else Color(0xFF111B2E).copy(alpha = 0.6f)
                                )
                                .clickable(
                                    interactionSource = remember { MutableInteractionSource() },
                                    indication = ripple(color = tab.accentColor.copy(alpha = 0.2f)),
                                    onClick = { activeSlug = tab.slug }
                                )
                                .padding(horizontal = 14.dp, vertical = 7.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = tab.title,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) tab.accentColor else WisdomMuted
                            )
                        }
                    }
                }
            }

            // Dynamic Guide Content
            when (activeSlug) {
                "study-techniques" -> {
                    item(key = "guide_study_techniques") {
                        StudyTechniquesSection()
                    }
                }
                "success-stories" -> {
                    item(key = "guide_success_stories") {
                        SuccessStoriesSection()
                    }
                }
                "campus-life" -> {
                    item(key = "guide_campus_life") {
                        CampusLifeSection()
                    }
                }
                "universities" -> {
                    item(key = "guide_universities") {
                        UniversitiesSection()
                    }
                }
                "departments" -> {
                    item(key = "guide_departments") {
                        DepartmentsSection()
                    }
                }
                "scholarships" -> {
                    item(key = "guide_scholarships") {
                        ScholarshipsSection()
                    }
                }
                else -> {
                    item(key = "guide_fallback") {
                        StudyTechniquesSection()
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
private fun StudyTechniquesSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        GuideHeaderBox(
            title = "Evidence-Based Study Techniques",
            subtitle = "Methods that match how long-term memory forms: structured retrieval, honest feedback, and deliberate practice.",
            accentColor = WisdomCyan
        )

        TechniqueCard(
            title = "Active Recall beats Rereading",
            description = "Rereading a chapter until it feels familiar creates an illusion of competence. True retention happens when you close the book and force your brain to generate the definition, formula, or proof from memory.",
            icon = Icons.Default.Lightbulb,
            accentColor = WisdomCyan
        )

        TechniqueCard(
            title = "Spaced Repetition Schedule",
            description = "Memory decays along a predictable curve. Reviewing high-yield topics at expanding intervals (Day 1, Day 3, Day 7, Day 21) resets the forgetting curve and cements concepts into long-term recall.",
            icon = Icons.Default.Timer,
            accentColor = WisdomAccentAmber
        )

        TechniqueCard(
            title = "Closed-Book Practice Testing",
            description = "Simulate real exam conditions: strict time limits, zero notes, and mixed topics. Testing is not merely an assessment—it is an active learning mechanism that highlights critical knowledge gaps.",
            icon = Icons.AutoMirrored.Filled.MenuBook,
            accentColor = WisdomAccentEmerald
        )

        TechniqueCard(
            title = "Interleaving Topics",
            description = "Avoid blocking 6 hours on a single formula type. Mix related subjects (e.g., alternating between mechanics and calculus problems) to train problem classification under pressure.",
            icon = Icons.AutoMirrored.Filled.MenuBook,
            accentColor = WisdomAccentPurple
        )
    }
}

@Composable
private fun SuccessStoriesSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        GuideHeaderBox(
            title = "Top Student Success Stories",
            subtitle = "Preparation routines, score milestones, and high-yield habits from top-ranking students.",
            accentColor = WisdomAccentAmber
        )

        SUCCESS_STORIES.forEach { story ->
            WisdomModernCard(
                modifier = Modifier.fillMaxWidth(),
                cornerRadius = 14.dp,
                borderColor = WisdomAccentAmber.copy(alpha = 0.35f)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = story.achievement,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = WisdomAccentAmber
                        )
                        Text(
                            text = story.year,
                            fontSize = 11.sp,
                            color = WisdomMuted
                        )
                    }

                    Text(
                        text = "${story.name} · ${story.program}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(WisdomAccentAmber.copy(alpha = 0.08f))
                            .border(BorderStroke(1.dp, WisdomAccentAmber.copy(alpha = 0.25f)), RoundedCornerShape(8.dp))
                            .padding(10.dp)
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(
                                imageVector = Icons.Default.FormatQuote,
                                contentDescription = null,
                                tint = WisdomAccentAmber,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "“${story.quote}”",
                                fontSize = 12.sp,
                                color = Color(0xFFFEF3C7),
                                lineHeight = 16.sp
                            )
                        }
                    }

                    Text(
                        text = story.body,
                        fontSize = 12.sp,
                        color = WisdomMuted,
                        lineHeight = 17.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun CampusLifeSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        GuideHeaderBox(
            title = "University Campus Life Guide",
            subtitle = "Navigating first-year lectures, dorm living, study groups, and mental well-being.",
            accentColor = WisdomAccentSky
        )

        TechniqueCard(
            title = "Dorm Living & Study Environments",
            description = "Dorm rooms are noisy hubs. Establish boundaries early with roommates, and identify quiet study corners in central university libraries or departmental study halls before midterms arrive.",
            icon = Icons.Default.Park,
            accentColor = WisdomAccentSky
        )

        TechniqueCard(
            title = "Lecture Discipline & Note Organization",
            description = "Review lecture slides 15 minutes before the lecture. Treat class time as clarification rather than first exposure, and synthesize lecture notes within 24 hours.",
            icon = Icons.Default.School,
            accentColor = WisdomCyan
        )

        TechniqueCard(
            title = "Sleep & Nutrition Routine",
            description = "All-nighters dramatically reduce cognitive recall on STEM and analytical exams. Aim for consistent sleep cycles, especially during the 72 hours preceding semester finals.",
            icon = Icons.Default.LocalCafe,
            accentColor = WisdomAccentAmber
        )
    }
}

@Composable
private fun UniversitiesSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        GuideHeaderBox(
            title = "Universities Directory",
            subtitle = "Profiles, campus climates, department strengths, and admission insights across Ethiopia.",
            accentColor = WisdomAccentViolet
        )

        UNIVERSITIES_LIST.forEach { uni ->
            WisdomModernCard(
                modifier = Modifier.fillMaxWidth(),
                cornerRadius = 14.dp,
                borderColor = WisdomAccentViolet.copy(alpha = 0.35f)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = uni.name,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(WisdomAccentViolet.copy(alpha = 0.15f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = uni.abbreviation,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = WisdomAccentViolet
                            )
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = WisdomAccentSky,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = uni.location,
                            fontSize = 11.sp,
                            color = WisdomAccentSky
                        )
                    }

                    Text(
                        text = "Key Strengths: ${uni.strengths}",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.9f),
                        lineHeight = 16.sp
                    )

                    Text(
                        text = "Environment: ${uni.climate}",
                        fontSize = 11.sp,
                        color = WisdomMuted
                    )
                }
            }
        }
    }
}

@Composable
private fun DepartmentsSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        GuideHeaderBox(
            title = "Departments & Majors Guide",
            subtitle = "Understand curriculum requirements, required streams, and career trajectories before selecting your field.",
            accentColor = WisdomAccentOrange
        )

        DEPARTMENTS_LIST.forEach { dept ->
            WisdomModernCard(
                modifier = Modifier.fillMaxWidth(),
                cornerRadius = 14.dp,
                borderColor = WisdomAccentOrange.copy(alpha = 0.35f)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = dept.name,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Text(
                        text = "Category: ${dept.category} · Requires: ${dept.streamRequired}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WisdomAccentOrange
                    )

                    Text(
                        text = dept.description,
                        fontSize = 12.sp,
                        color = WisdomMuted,
                        lineHeight = 16.sp
                    )

                    Row(
                        modifier = Modifier.padding(top = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Work,
                            contentDescription = null,
                            tint = WisdomAccentAmber,
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = "Careers: ${dept.careerPaths}",
                            fontSize = 11.sp,
                            color = Color.White.copy(alpha = 0.85f),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ScholarshipsSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        GuideHeaderBox(
            title = "Scholarships & Funding Guide",
            subtitle = "Verified higher education opportunities, grant criteria, and personal statement strategies.",
            accentColor = WisdomAccentRose
        )

        TechniqueCard(
            title = "Maintain High Grade Foundations",
            description = "Most domestic and international scholarship boards require consistent academic standings (GPA 3.5+ or top percentile matriculation marks). Academic rigor remains the primary baseline filter.",
            icon = Icons.Default.EmojiEvents,
            accentColor = WisdomAccentRose
        )

        TechniqueCard(
            title = "Crafting a Compelling Motivation Essay",
            description = "Focus on specific problems you aim to solve. Connect your department coursework directly to tangible development challenges in healthcare, software, energy, or economic policy.",
            icon = Icons.AutoMirrored.Filled.MenuBook,
            accentColor = WisdomAccentAmber
        )

        TechniqueCard(
            title = "Standardized Entrance & Language Exams",
            description = "Prepare early for entrance certifications (UAT, GAT, IELTS, or TOEFL). High test percentiles unlock university fee waivers and merit-based grants.",
            icon = Icons.Default.CheckCircle,
            accentColor = WisdomAccentEmerald
        )
    }
}

@Composable
private fun GuideHeaderBox(
    title: String,
    subtitle: String,
    accentColor: Color
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 14.dp,
        borderColor = accentColor.copy(alpha = 0.4f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                fontSize = 17.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                fontSize = 12.sp,
                color = WisdomMuted,
                lineHeight = 17.sp
            )
        }
    }
}

@Composable
private fun TechniqueCard(
    title: String,
    description: String,
    icon: ImageVector,
    accentColor: Color
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 12.dp,
        borderColor = WisdomBorderWhite
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(accentColor.copy(alpha = 0.12f))
                    .border(BorderStroke(1.dp, accentColor.copy(alpha = 0.35f)), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(20.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(3.dp))
                Text(
                    text = description,
                    fontSize = 12.sp,
                    color = WisdomMuted,
                    lineHeight = 16.sp
                )
            }
        }
    }
}
