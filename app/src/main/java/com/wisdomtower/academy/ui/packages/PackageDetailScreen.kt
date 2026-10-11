package com.wisdomtower.academy.ui.packages

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
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted

/**
 * Package page. Rewritten 2026-10-11 (owner rules): every card is the shared [OpenCard]
 * (picture, title, Open button) in a TWO-column grid. No hero picture with gradient or tag, no
 * descriptions, no "What is included" list, no filter chips, no invented headings, nothing locked.
 *
 * Headings copied from the website pages (website-reference/src/app/academy/):
 *  - freshman/page.tsx: "Freshman courses" + "including preengineering & others", label "Subjects"
 *  - grades/[grade]/page.tsx: "Secondary Curriculum" + grade label, label "Subjects"
 *  - remedial/page.tsx: "Remedial", label "Subjects"
 *  - special-packages/[slug]/page.tsx: package name (the website's "Department track · year" line is not copied
 *    because the year text is not in the app data)
 * The Freshman GPA calculator is kept (the website shows it on the same page).
 * The unused parameters are kept so the caller in MainActivity.kt does not change.
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
    val isFreshman = pkg.id == "freshman"
    val isEce = pkg.id.startsWith("ece")
    val isGrade = pkg.group == "grades"
    val isRemedial = pkg.id == "remedial"
    val hasSubjectList = isFreshman || isEce || isGrade || isRemedial

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
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
                }
            }

            // Page heading (website wording)
            item(key = "page_heading") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    if (isGrade) {
                        Text(
                            text = "Secondary Curriculum",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WisdomMuted
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                    }
                    Text(
                        text = if (isFreshman) "Freshman courses" else pkg.name,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (isFreshman) {
                        Text(
                            text = "including preengineering & others",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = WisdomMuted
                        )
                    }
                }
            }

            if (isFreshman) {
                item(key = "gpa_calculator") {
                    GpaCalculatorCard()
                }
            }

            // ── Freshman: all subjects (the website has no stream/semester filters) ──
            if (isFreshman) {
                item(key = "subjects_label") { SubjectsLabel() }
                openGrid("freshman", FRESHMAN_SUBJECTS) { subject ->
                    OpenCard(subject.name, subject.assetImage) {
                        onOpenSubjectWorkspace(subject.name, "Freshman Program · Subject", subject.path)
                    }
                }
            }

            // ── ECE: both semesters, each as its own two-column grid ──
            if (isEce) {
                item(key = "ece_sem1_label") { SubjectsLabel("Semester 1") }
                openGrid("ece1", ECE_SEM1_COURSES) { course ->
                    OpenCard("${course.code} · ${course.title}", course.assetImage) {
                        onOpenSubjectWorkspace(
                            "${course.code} · ${course.title}",
                            "ECE Year 3 · Semester 1",
                            course.path
                        )
                    }
                }
                item(key = "ece_sem2_label") { SubjectsLabel("Semester 2") }
                openGrid("ece2", ECE_SEM2_COURSES) { course ->
                    OpenCard("${course.code} · ${course.title}", course.assetImage) {
                        onOpenSubjectWorkspace(
                            "${course.code} · ${course.title}",
                            "ECE Year 3 · Semester 2",
                            course.path
                        )
                    }
                }
            }

            // ── Grades 9–12 ──
            if (isGrade) {
                val gradeSubjects = when (pkg.id) {
                    "grade-9" -> GRADE_9_SUBJECTS
                    "grade-10" -> GRADE_10_SUBJECTS
                    "grade-11" -> GRADE_11_SUBJECTS
                    "grade-12" -> GRADE_12_SUBJECTS
                    else -> emptyList()
                }
                item(key = "subjects_label") { SubjectsLabel() }
                openGrid("grade", gradeSubjects) { gSubject ->
                    OpenCard(gSubject.name, null) {
                        onOpenSubjectWorkspace(
                            "${gSubject.name} (Grade ${gSubject.grade})",
                            "Grade ${gSubject.grade} Curriculum",
                            gSubject.path
                        )
                    }
                }
            }

            // ── Remedial ──
            if (isRemedial) {
                item(key = "subjects_label") { SubjectsLabel() }
                openGrid("remedial", REMEDIAL_SUBJECTS) { subject ->
                    OpenCard(subject.name, subject.assetImage) {
                        onOpenSubjectWorkspace(subject.name, "Remedial Program", subject.path)
                    }
                }
            }

            // Any other package (COC, UAT, GAT, Exit Exam ...): one card that opens its study hubs
            if (!hasSubjectList) {
                openGrid("package", listOf(pkg)) { p ->
                    OpenCard(p.name, p.assetImage) {
                        onOpenSubjectWorkspace(p.name, "Academy Package", p.path)
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}

@Composable
private fun SubjectsLabel(text: String = "Subjects") {
    Text(
        text = text.uppercase(),
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = WisdomMuted,
        letterSpacing = 1.5.sp
    )
}
