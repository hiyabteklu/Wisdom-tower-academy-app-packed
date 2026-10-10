package com.wisdomtower.academy.ui.guides

import android.content.Intent
import android.net.Uri
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
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Coffee
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Diversity3
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.FormatQuote
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Grass
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.ripple
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
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
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

@Composable
fun GuidesScreen(
    initialSlug: String = "study-techniques",
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var activeSlug by remember { mutableStateOf(initialSlug) }

    val (uniIntro, universitiesList) = remember { GuidesRepository.loadUniversities(context) }
    val (deptCategories, departmentsList) = remember { GuidesRepository.loadDepartments(context) }
    val (storiesList, scholarshipsList) = remember { GuidesRepository.loadFreeResources(context) }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // TOP BAR
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

            // GUIDE TABS SWITCHER
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

            // DYNAMIC SECTION
            when (activeSlug) {
                "study-techniques" -> {
                    item(key = "guide_study_techniques") {
                        StudyTechniquesFullSection()
                    }
                }
                "success-stories" -> {
                    item(key = "guide_success_stories") {
                        SuccessStoriesFullSection(stories = storiesList)
                    }
                }
                "campus-life" -> {
                    item(key = "guide_campus_life") {
                        CampusLifeFullSection()
                    }
                }
                "universities" -> {
                    item(key = "guide_universities") {
                        UniversitiesFullSection(introParagraphs = uniIntro, universities = universitiesList)
                    }
                }
                "departments" -> {
                    item(key = "guide_departments") {
                        DepartmentsFullSection(categories = deptCategories, departments = departmentsList)
                    }
                }
                "scholarships" -> {
                    item(key = "guide_scholarships") {
                        ScholarshipsFullSection(scholarships = scholarshipsList)
                    }
                }
                else -> {
                    item(key = "guide_fallback") {
                        StudyTechniquesFullSection()
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(36.dp))
            }
        }
    }
}

/* =========================================================================================
   1. STUDY TECHNIQUES (Word for word matching website StudyTechniquesPage & Sections)
========================================================================================= */

@Composable
private fun StudyTechniquesFullSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomAccentAmber.copy(alpha = 0.12f))
                        .border(BorderStroke(1.dp, WisdomAccentAmber.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("OTHER RESOURCES", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                }

                Text(
                    text = "Evidence-Based Study Techniques",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                Text(
                    text = "Covering pages and highlighting lines can feel like work. Often it is only exposure. What tends to stick is what you can produce from memory without looking: a definition in your own words, a method you can choose under time pressure, a problem you solve from a blank page.\n\nThis guide walks through methods that match how memory actually forms. None of them require an innate gift. They require structured retrieval, honest feedback, and deliberate practice.",
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.82f),
                    lineHeight = 17.sp
                )
            }
        }

        // Why usual routine disappoints
        WisdomModernCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 20.dp,
            borderColor = WisdomAccentAmber.copy(alpha = 0.35f)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.Book, contentDescription = null, tint = WisdomAccentAmber, modifier = Modifier.size(18.dp))
                    Text("Why the usual routine disappoints", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
                Text(
                    text = "Rereading a chapter until it feels familiar is calming. Watching a clear video is pleasant. Neither one forces your mind to generate the answer. On exam day the question is closed book, timed, and mixed with other topics. If your only practice was open book and smooth, the gap shows up late.\n\nA better measure of a study session is simple: what can you produce from memory afterward? If the answer is thin, the session taught less than the hours suggest.",
                    fontSize = 11.5.sp,
                    color = WisdomMuted,
                    lineHeight = 16.sp
                )
            }
        }

        // 01 Active Recall
        StudyTechniqueStepCard(
            stepNumber = "01",
            category = "Core Principle",
            title = "Active Recall",
            highlight = "Learning is not only what goes in. It is what you can pull back out without the page in front of you.",
            body = "Recognition is easy. You open the notes, see a formula, and think you know this. Closing the book and writing that formula from scratch is harder. That mental effort is useful: each time you retrieve something successfully, the synaptic path strengthens.",
            routineItems = listOf(
                "After a section, close everything and write what you remember.",
                "Explain a lecture out loud without looking at notes.",
                "Attempt a problem before you watch or read the solution."
            ),
            commonTrap = "Rereading until the text feels familiar, then stopping. Familiarity is passive recognition, not the ability to produce the answer on exam day.",
            accentColor = WisdomAccentAmber
        )

        // 02 Spacing
        StudyTechniqueStepCard(
            stepNumber = "02",
            category = "Retention Rhythm",
            title = "Spacing Your Review",
            highlight = "Memory naturally fades. Returning after deliberate intervals is how you convert short-term exposure into permanent recall.",
            body = "Cramming an entire chapter in one evening can make you fluent for a few hours. A few days later, much of that fluency disappears. Spreading the same total study hours across several spaced intervals leaves substantially higher retention behind.",
            routineItems = listOf(
                "Revisit important ideas days and weeks later, not only the night before.",
                "Spend ten minutes on last week's material before starting new work.",
                "Space formulas and definitions; let minor details wait until required."
            ),
            commonTrap = "Treating a single long night as done for a whole chapter. Short-term fluency during the study session is not the same as durable memory that survives until finals.",
            accentColor = WisdomAccentOrange
        )

        // 03 Practice Testing
        StudyTechniqueStepCard(
            stepNumber = "03",
            category = "Low-Stakes Testing",
            title = "Practice Testing",
            highlight = "Tests are not merely for grading. When used early, self-quizzing is the fastest training mechanism.",
            body = "Waiting until you feel ready wastes the learning value of early mistakes. A low-stakes quiz or past paper reveals gaps while there is still time to correct them. After each attempt, rebuild the correct derivation in writing.",
            routineItems = listOf(
                "Attempt practice questions before complete confidence arrives.",
                "Keep a brief error log: what you tried, what went wrong, what is correct.",
                "Time a test section occasionally so you adjust to actual exam pressure."
            ),
            commonTrap = "Checking the answer key immediately, feeling relieved, and moving on without independently re-solving the problem from scratch.",
            accentColor = WisdomAccentRose
        )

        // 04 Mixing Related Topics
        StudyTechniqueStepCard(
            stepNumber = "04",
            category = "Discrimination Skill",
            title = "Mixing Related Topics",
            highlight = "Doing twenty identical problems feels comfortable. Real university exams shuffle types. Practice should reflect that reality.",
            body = "Master a method in a focused block first. Once you understand the core mechanics, weave problems with neighboring chapters so selecting the appropriate tool under ambiguity becomes automatic.",
            routineItems = listOf(
                "After initial competence, mix problem types in a single drill session.",
                "Revise related chapters in alternating short bursts.",
                "Block practice initially; interleave once the formulas are recognizable."
            ),
            commonTrap = "Finishing a long run of identical exercises and never practicing selection among competing formulas, leaving you disoriented on exam day.",
            accentColor = WisdomAccentViolet
        )

        // Everyday Habits
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Everyday Habits That Support the Core Four", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("These habits lower cognitive friction and keep your recall and testing schedule consistent.", fontSize = 11.5.sp, color = WisdomMuted)

                val habits = listOf(
                    Pair("Blurting & Retrieval", "Set a 10-minute timer. Write everything you recall about a topic on a blank page. Compare with your notes, fill the gaps, and retry tomorrow."),
                    Pair("Plain Language Teaching", "If you cannot explain an idea in plain words without looking, your mental model is incomplete. Stalling highlights what requires another pass."),
                    Pair("Turn Notes into Cues", "Full lecture notes are for initial orientation. For exam revision, shrink them into prompt questions and small diagrams you expand from memory."),
                    Pair("Protected Focus Blocks", "Late nights that sacrifice sleep cost more than they yield. A 90-minute protected focus block beats four hours of distracted multitasking.")
                )

                habits.forEach { (hTitle, hDesc) ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.03f))
                            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(text = hTitle, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                            Text(text = hDesc, fontSize = 11.sp, color = Color.White.copy(alpha = 0.85f), lineHeight = 15.sp)
                        }
                    }
                }
            }
        }

        // What to Drop Immediately
        WisdomModernCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 20.dp,
            borderColor = WisdomAccentRose.copy(alpha = 0.4f)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.Block, contentDescription = null, tint = WisdomAccentRose, modifier = Modifier.size(18.dp))
                    Text("What to Drop Immediately", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
                Text("These common study habits feel reassuring but offer almost zero long-term retention:", fontSize = 11.5.sp, color = WisdomAccentRose.copy(alpha = 0.9f))

                val traps = listOf(
                    "Rereading highlighted pages repeatedly until they look familiar",
                    "Watching video explanations without pausing to derive the solution yourself",
                    "Copying notes from classmates without reconstructing the argument independently",
                    "Cramming exclusively the night before and calling it an exam strategy",
                    "Avoiding timed mock questions because they feel uncomfortable"
                )

                traps.forEach { trap ->
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("×", fontSize = 14.sp, fontWeight = FontWeight.Black, color = WisdomAccentRose)
                        Text(trap, fontSize = 11.5.sp, color = WisdomMuted)
                    }
                }
            }
        }
    }
}

@Composable
private fun StudyTechniqueStepCard(
    stepNumber: String,
    category: String,
    title: String,
    highlight: String,
    body: String,
    routineItems: List<String>,
    commonTrap: String,
    accentColor: Color
) {
    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(CircleShape)
                        .background(accentColor.copy(alpha = 0.15f))
                        .border(BorderStroke(1.dp, accentColor.copy(alpha = 0.4f)), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(stepNumber, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = accentColor, fontFamily = FontFamily.Monospace)
                }
                Column {
                    Text(category.uppercase(), fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = accentColor)
                    Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            Text(text = highlight, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            Text(text = body, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp)

            // Try this routine
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.03f))
                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("TRY THIS ROUTINE", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = accentColor)
                    routineItems.forEach { item ->
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.Top) {
                            Text("•", color = accentColor, fontWeight = FontWeight.Bold)
                            Text(item, fontSize = 11.sp, color = Color.White.copy(alpha = 0.9f))
                        }
                    }
                }
            }

            // Common trap
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(WisdomAccentRose.copy(alpha = 0.05f))
                    .border(BorderStroke(1.dp, WisdomAccentRose.copy(alpha = 0.2f)), RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("COMMON TRAP", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)
                    Text(commonTrap, fontSize = 11.sp, color = WisdomMuted, lineHeight = 15.sp)
                }
            }
        }
    }
}

/* =========================================================================================
   2. SUCCESS STORIES (Word for word matching website SuccessStoriesPage)
========================================================================================= */

@Composable
private fun SuccessStoriesFullSection(stories: List<SuccessStory>) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomAccentAmber.copy(alpha = 0.12f))
                        .border(BorderStroke(1.dp, WisdomAccentAmber.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("FREE RESOURCE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                }

                Text(
                    text = "Success Stories",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                Text(
                    text = "Students share how deliberate practice, active recall, and closed-book testing changed their scores and entrance results across Ethiopia.",
                    fontSize = 12.sp,
                    color = WisdomMuted,
                    lineHeight = 16.sp
                )
            }
        }

        stories.forEach { story ->
            SuccessStoryCardItem(story = story)
        }
    }
}

@Composable
private fun SuccessStoryCardItem(story: SuccessStory) {
    var expanded by remember { mutableStateOf(false) }

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
        borderColor = if (expanded) WisdomAccentAmber.copy(alpha = 0.5f) else WisdomBorderWhite
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("ACHIEVEMENT", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                    Text(story.achievement, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text("${story.name} • ${story.program} • ${story.year}", fontSize = 11.sp, color = WisdomMuted)
                }
                Icon(
                    imageVector = Icons.Default.EmojiEvents,
                    contentDescription = null,
                    tint = WisdomAccentAmber,
                    modifier = Modifier.size(24.dp)
                )
            }

            if (story.quote.isNotBlank()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(WisdomAccentAmber.copy(alpha = 0.06f))
                        .border(BorderStroke(1.dp, WisdomAccentAmber.copy(alpha = 0.2f)), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = "“${story.quote}”",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFFDE68A),
                        lineHeight = 16.sp
                    )
                }
            }

            Text(
                text = story.body,
                fontSize = 11.5.sp,
                color = WisdomMuted,
                lineHeight = 16.sp,
                maxLines = if (expanded) Int.MAX_VALUE else 3,
                overflow = TextOverflow.Ellipsis
            )

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { expanded = !expanded }
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (expanded) "Show less" else "Read full details",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomAccentAmber
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = WisdomAccentAmber,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}

/* =========================================================================================
   3. CAMPUS LIFE FIELD GUIDE (Word for word matching website CampusLifePage & Sections)
========================================================================================= */

@Composable
private fun CampusLifeFullSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomAccentSky.copy(alpha = 0.12f))
                        .border(BorderStroke(1.dp, WisdomAccentSky.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("OTHER RESOURCES", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentSky)
                }

                Text(
                    text = "Campus Life Field Guide",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                Text(
                    text = "Most of what decides your grades does not happen only at a desk with a highlighter. It happens in the hours between classes: who you sit with, how late you stay online, whether you recover after a hard week, and whether a weak lecture still leaves you with something you can revise.\n\nThis page is a practical guide to that side of university: friendships, pressure, classrooms, and the buildings and people around you. Nothing here is a personality test. It is ordinary advice that works when you apply it imperfectly but consistently.",
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.85f),
                    lineHeight = 17.sp
                )
            }
        }

        // 01 Friends & Social Life
        CampusSectionCard(
            step = "01",
            category = "Social Dynamics",
            title = "Friends & Social Life",
            subtitle = "Keeping friends without losing the semester",
            mainText = "University is where many people meet the friends they keep for years. That matters. What also matters is that endless availability—answering every message the moment it arrives, accepting every invitation because saying no feels rude—leaves almost no quiet stretch for real study.\n\nYou do not need to become cold. You need a simple pattern: some hours are for work, and during those hours you are allowed to be slow to reply. When you are free, be actually free. People respect clarity more than vague half-attention all day long.",
            bullets = listOf(
                "Block a few study hours where your phone is not the priority.",
                "Put social plans after those blocks when you can, not in the middle of them.",
                "A short, honest 'I am finishing this, talk later' is enough; you do not owe a speech."
            ),
            extraSubheadings = listOf(
                Pair("What “everyone is doing” really means", "Peer pressure on campus rarely looks like orders. More often it is the quiet assumption that skipping class is normal, or that starting assignments the night before is standard. Decide your minimum standards in advance and study near peers who work diligently."),
                Pair("Loneliness is not discipline", "Cutting everyone off is not a healthy strategy. Most students thrive with one or two steady, reliable relationships rather than large superficial circles. Schedule meaningful connections like a weekly study walk or a short call home.")
            ),
            accentColor = WisdomAccentRose
        )

        // 02 Energy & Pressure Management
        CampusSectionCard(
            step = "02",
            category = "Mental Stamina",
            title = "Energy & Pressure Management",
            subtitle = "Sustaining momentum through midterm pressure",
            mainText = "Some weeks you feel sharp; other weeks opening the textbook feels heavy. On low-energy days, shrink the scope: do a 15-minute recall review or one section of problems. Continuity beats boom-and-bust cramming.",
            bullets = emptyList(),
            extraSubheadings = listOf(
                Pair("When motivation comes and goes", "Do not wait for inspirational moods. Anchor to simple physical triggers: the same desk, a consistent starting hour, and an easy first step. Reliable small steps get you across four or five undergraduate years."),
                Pair("Noticing burnout early", "Burnout builds quietly: you sleep but wake up exhausted, tasks feel numb, or irritability spikes. Cut study volume, simplify your commitments, and talk to someone early instead of pushing until complete collapse."),
                Pair("Rest that actually restores", "Infinite phone scrolling leaves you depleted. Authentic restoration means uninterrupted sleep, sunlight, walking outdoors, screen-free meals, and genuine human conversations.")
            ),
            accentColor = WisdomAccentViolet
        )

        // 03 Lectures & Classroom Time
        CampusSectionCard(
            step = "03",
            category = "Classroom Strategy",
            title = "Lectures & Classroom Time",
            subtitle = "Where you sit and how you listen",
            mainText = "Sitting in front where you clearly view the board reduces the cognitive strain of staying locked into complex derivations. The back rows invite distractions and lost hours.",
            bullets = emptyList(),
            extraSubheadings = listOf(
                Pair("Attendance without perfectionism", "You will occasionally miss class. What matters is never leaving a missed core concept unrepaired. Treat the day you missed as the deadline to copy notes and derive the examples."),
                Pair("Phone silence and attention resets", "Attention drifts for everyone. Silence notifications and mark the moment your focus strayed. Focus is a muscle you re-engage throughout the hour, not an all-or-nothing test."),
                Pair("When instruction feels dense", "Not every professor explains concepts accessibly. Treat the lecture as an outline of what the university values, then verify concepts in textbooks or with classmates immediately after."),
                Pair("The 15-Minute Same-Day Payoff", "Immediately after a demanding lecture, write three core takeaways on a blank page from memory before checking your notes. This simple habit preserves weeks of preparation effort.")
            ),
            accentColor = WisdomAccentSky
        )

        // 04 Places, Study Groups & Faculty
        CampusSectionCard(
            step = "04",
            category = "Campus Facilities",
            title = "Places, Study Groups & Faculty",
            subtitle = "Navigating campus environments purposefully",
            mainText = "The university library is for deep concentration; dorms and cafeterias are for unwinding. Separating physical spaces prevents mental clutter.",
            bullets = emptyList(),
            extraSubheadings = listOf(
                Pair("Group work discipline", "Agree on milestones, dates, and ownership early. Never leave collective assignments for a frantic overnight rush the evening before submission."),
                Pair("Approaching instructors", "Bring precise problem statements to office hours early in the term. Instructors respect proactive curiosity much more than vague last-minute exam panicking.")
            ),
            accentColor = WisdomAccentEmerald
        )

        // Simple Weekly Reflection Check
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("A Simple Weekly Reflection Check", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Use this diagnostic when the term begins feeling noisy, unfocused, or overwhelming:", fontSize = 11.5.sp, color = WisdomMuted)

                val checks = listOf(
                    "At least one stretch of real focus away from group chats and open invitations",
                    "One genuine conversation or check-in, not only reacting to notifications",
                    "Same-day review after the hardest lecture you attended",
                    "Studying at least once in a place chosen for the work, not only by habit",
                    "An honest look at sleep, mood, and avoidance, reducing load when running empty",
                    "For any group task, roles and dates written down before deadlines approach"
                )

                checks.forEach { c ->
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = WisdomAccentSky, modifier = Modifier.size(14.dp))
                        Text(c, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.9f), lineHeight = 15.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun CampusSectionCard(
    step: String,
    category: String,
    title: String,
    subtitle: String,
    mainText: String,
    bullets: List<String>,
    extraSubheadings: List<Pair<String, String>>,
    accentColor: Color
) {
    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(CircleShape)
                        .background(accentColor.copy(alpha = 0.15f))
                        .border(BorderStroke(1.dp, accentColor.copy(alpha = 0.4f)), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(step, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = accentColor, fontFamily = FontFamily.Monospace)
                }
                Column {
                    Text(category.uppercase(), fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = accentColor)
                    Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            Text(subtitle, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            Text(mainText, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp)

            if (bullets.isNotEmpty()) {
                bullets.forEach { b ->
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.Top) {
                        Text("•", color = accentColor, fontWeight = FontWeight.Bold)
                        Text(b, fontSize = 11.sp, color = Color.White.copy(alpha = 0.9f))
                    }
                }
            }

            extraSubheadings.forEach { (subH, subBody) ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White.copy(alpha = 0.03f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                        .padding(10.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text(subH, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(subBody, fontSize = 11.sp, color = WisdomMuted, lineHeight = 15.sp)
                    }
                }
            }
        }
    }
}

/* =========================================================================================
   4. UNIVERSITIES DIRECTORY (All 45 authentic Ethiopian Universities from universities.json)
========================================================================================= */

@Composable
private fun UniversitiesFullSection(
    introParagraphs: List<String>,
    universities: List<UniversityDetail>
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedRegion by remember { mutableStateOf("All") }
    var showNbCard by remember { mutableStateOf(false) }

    val regions = listOf(
        "All", "Addis Ababa", "Amhara", "Oromia", "Tigray", "SNNPR",
        "Somali", "Afar", "Benishangul Gumuz", "Gambela", "Dire Dawa"
    )

    val filteredList = remember(searchQuery, selectedRegion, universities) {
        universities.filter { u ->
            val matchRegion = selectedRegion == "All" || u.region.equals(selectedRegion, ignoreCase = true)
            val matchSearch = searchQuery.isBlank() ||
                u.name.contains(searchQuery, ignoreCase = true) ||
                u.abbr.contains(searchQuery, ignoreCase = true) ||
                u.location.contains(searchQuery, ignoreCase = true)
            matchRegion && matchSearch
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Header
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomAccentViolet.copy(alpha = 0.12f))
                        .border(BorderStroke(1.dp, WisdomAccentViolet.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("45 INSTITUTIONS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentViolet)
                }

                Text(
                    text = "Ethiopian Universities Directory",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                Text(
                    text = "What it actually feels like to study at each university: candid student realities, dorm conditions, registrar pace, and program strengths.",
                    fontSize = 12.sp,
                    color = WisdomMuted
                )
            }
        }

        // NB Intro Card (Expandable)
        WisdomModernCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 18.dp,
            borderColor = WisdomAccentSky.copy(alpha = 0.4f)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showNbCard = !showNbCard },
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(WisdomAccentSky.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("NB", fontSize = 9.5.sp, fontWeight = FontWeight.Black, color = WisdomAccentSky)
                        }
                        Text("Read this before you choose", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomAccentSky,
                        modifier = Modifier.size(18.dp)
                    )
                }

                AnimatedVisibility(visible = showNbCard) {
                    Column(
                        modifier = Modifier.padding(top = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        introParagraphs.forEach { p ->
                            Text(p, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.85f), lineHeight = 16.sp)
                        }
                    }
                }
            }
        }

        // Search Box
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search 45 universities by name or city…", fontSize = 12.sp, color = WisdomMuted) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(16.dp)) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = WisdomCyan,
                unfocusedBorderColor = WisdomBorderWhite,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedContainerColor = Color(0xFF0F172A),
                unfocusedContainerColor = Color(0xFF0F172A)
            ),
            singleLine = true
        )

        // Region Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(regions) { reg ->
                val isSel = selectedRegion == reg
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (isSel) WisdomAccentViolet else Color.White.copy(alpha = 0.05f))
                        .border(BorderStroke(1.dp, if (isSel) WisdomAccentViolet else WisdomBorderWhite), RoundedCornerShape(16.dp))
                        .clickable { selectedRegion = reg }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = reg,
                        fontSize = 11.sp,
                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSel) Color.White else WisdomMuted
                    )
                }
            }
        }

        Text(
            text = "Showing ${filteredList.size} of ${universities.size} universities",
            fontSize = 11.sp,
            color = WisdomMuted
        )

        // List of Universities
        filteredList.forEach { uni ->
            UniversityDetailCard(uni = uni)
        }
    }
}

@Composable
private fun UniversityDetailCard(uni: UniversityDetail) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current

    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(uni.abbr, fontSize = 12.sp, fontWeight = FontWeight.Black, color = WisdomAccentViolet, fontFamily = FontFamily.Monospace)
                        if (uni.featured) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(WisdomAccentAmber.copy(alpha = 0.2f))
                                    .padding(horizontal = 4.dp, vertical = 1.dp)
                            ) {
                                Text("FEATURED", fontSize = 8.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                            }
                        }
                    }
                    Text(uni.name, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = WisdomAccentSky, modifier = Modifier.size(12.dp))
                        Text(uni.location, fontSize = 11.sp, color = WisdomMuted)
                    }
                }
            }

            // Key facts row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (uni.founded.isNotBlank()) {
                    FactBadge(label = "Est. ${uni.founded}")
                }
                if (uni.elevationM != null) {
                    FactBadge(label = "${uni.elevationM}m elev.")
                }
                if (uni.distanceFromAddisKm != null) {
                    FactBadge(label = "${uni.distanceFromAddisKm} km from Addis")
                }
            }

            if (uni.campuses.isNotBlank()) {
                Text(
                    text = uni.campuses,
                    fontSize = 11.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    lineHeight = 15.sp,
                    maxLines = if (expanded) Int.MAX_VALUE else 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            AnimatedVisibility(visible = expanded) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (uni.strengths.isNotEmpty()) {
                        Text("KEY STRENGTHS", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentViolet)
                        uni.strengths.forEach { s ->
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.Top) {
                                Text("•", color = WisdomAccentViolet, fontWeight = FontWeight.Bold)
                                Text(s, fontSize = 11.sp, color = WisdomMuted)
                            }
                        }
                    }

                    if (uni.whatToExpect.isNotEmpty()) {
                        Text("WHAT TO EXPECT ON CAMPUS", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                        uni.whatToExpect.forEach { w ->
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.Top) {
                                Text("•", color = WisdomAccentAmber, fontWeight = FontWeight.Bold)
                                Text(w, fontSize = 11.sp, color = WisdomMuted)
                            }
                        }
                    }

                    if (uni.studentFit.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color.White.copy(alpha = 0.04f))
                                .padding(8.dp)
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("STUDENT FIT", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                                Text(uni.studentFit, fontSize = 10.5.sp, color = Color.White.copy(alpha = 0.85f))
                            }
                        }
                    }

                    if (uni.website.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(WisdomCyan.copy(alpha = 0.1f))
                                .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                                .clickable {
                                    try {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uni.website))
                                        context.startActivity(intent)
                                    } catch (_: Exception) {}
                                }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Official Portal", fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.AutoMirrored.Filled.OpenInNew, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(11.dp))
                            }
                        }
                    }
                }
            }

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { expanded = !expanded }
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (expanded) "Show less" else "Read full campus guide",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomAccentViolet
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = WisdomAccentViolet,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}

@Composable
private fun FactBadge(label: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(Color.White.copy(alpha = 0.04f))
            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 3.dp)
    ) {
        Text(label, fontSize = 9.5.sp, color = WisdomMuted)
    }
}

/* =========================================================================================
   5. DEPARTMENT FIELD GUIDES (All 26 authentic departments from departments.json)
========================================================================================= */

@Composable
private fun DepartmentsFullSection(
    categories: List<DepartmentCategoryDetail>,
    departments: List<DepartmentDetail>
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCat by remember { mutableStateOf("All") }

    val filterOptions = listOf("All") + categories.map { it.label }

    val filteredList = remember(searchQuery, selectedCat, departments, categories) {
        departments.filter { d ->
            val catLabel = categories.find { it.id == d.categoryId }?.label ?: ""
            val matchCat = selectedCat == "All" || catLabel.equals(selectedCat, ignoreCase = true)
            val matchSearch = searchQuery.isBlank() ||
                d.name.contains(searchQuery, ignoreCase = true) ||
                d.shortName.contains(searchQuery, ignoreCase = true) ||
                d.about.contains(searchQuery, ignoreCase = true)
            matchCat && matchSearch
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomAccentOrange.copy(alpha = 0.12f))
                        .border(BorderStroke(1.dp, WisdomAccentOrange.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("26 UNDERGRADUATE FIELDS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentOrange)
                }

                Text(
                    text = "Department Field Guides",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                Text(
                    text = "Written for students choosing a path, not institutional brochure tone: course depth, career pathways, market realities, pros and cons.",
                    fontSize = 12.sp,
                    color = WisdomMuted
                )
            }
        }

        // Search Box
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search 26 departments by title, career…", fontSize = 12.sp, color = WisdomMuted) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(16.dp)) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = WisdomCyan,
                unfocusedBorderColor = WisdomBorderWhite,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedContainerColor = Color(0xFF0F172A),
                unfocusedContainerColor = Color(0xFF0F172A)
            ),
            singleLine = true
        )

        // Categories Row
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(filterOptions) { cat ->
                val isSel = selectedCat == cat
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (isSel) WisdomAccentOrange else Color.White.copy(alpha = 0.05f))
                        .border(BorderStroke(1.dp, if (isSel) WisdomAccentOrange else WisdomBorderWhite), RoundedCornerShape(16.dp))
                        .clickable { selectedCat = cat }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = cat,
                        fontSize = 11.sp,
                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSel) Color.White else WisdomMuted
                    )
                }
            }
        }

        Text(
            text = "Showing ${filteredList.size} of ${departments.size} departments",
            fontSize = 11.sp,
            color = WisdomMuted
        )

        filteredList.forEach { dept ->
            DepartmentDetailCard(dept = dept)
        }
    }
}

@Composable
private fun DepartmentDetailCard(dept: DepartmentDetail) {
    var expanded by remember { mutableStateOf(false) }

    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(dept.durationYears.uppercase(), fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentOrange)
                    Text(dept.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            Text(
                text = dept.about,
                fontSize = 11.5.sp,
                color = WisdomMuted,
                lineHeight = 16.sp,
                maxLines = if (expanded) Int.MAX_VALUE else 3,
                overflow = TextOverflow.Ellipsis
            )

            AnimatedVisibility(visible = expanded) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (dept.courses.isNotEmpty()) {
                        Text("CORE COURSES", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                        Text(dept.courses.joinToString(" • "), fontSize = 11.sp, color = Color.White.copy(alpha = 0.85f))
                    }

                    if (dept.careers.isNotEmpty()) {
                        Text("CAREER PATHS", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentEmerald)
                        Text(dept.careers.joinToString(" • "), fontSize = 11.sp, color = WisdomMuted)
                    }

                    if (dept.market.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color.White.copy(alpha = 0.03f))
                                .padding(8.dp)
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("JOB MARKET REALITY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                                Text(dept.market, fontSize = 10.5.sp, color = WisdomMuted, lineHeight = 15.sp)
                            }
                        }
                    }

                    if (dept.pros.isNotEmpty()) {
                        Text("ADVANTAGES", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentEmerald)
                        dept.pros.forEach { p ->
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("✓", color = WisdomAccentEmerald, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Text(p, fontSize = 11.sp, color = WisdomMuted)
                            }
                        }
                    }

                    if (dept.cons.isNotEmpty()) {
                        Text("CONSIDERATIONS", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)
                        dept.cons.forEach { c ->
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("!", color = WisdomAccentRose, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Text(c, fontSize = 11.sp, color = WisdomMuted)
                            }
                        }
                    }
                }
            }

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { expanded = !expanded }
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (expanded) "Show less" else "Read full field guide",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomAccentOrange
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = WisdomAccentOrange,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}

/* =========================================================================================
   6. SCHOLARSHIPS (Word for word matching website ScholarshipsPage)
========================================================================================= */

@Composable
private fun ScholarshipsFullSection(scholarships: List<ScholarshipOpportunity>) {
    var showTips by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomAccentRose.copy(alpha = 0.12f))
                        .border(BorderStroke(1.dp, WisdomAccentRose.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("FREE RESOURCE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)
                }

                Text(
                    text = "Scholarship Opportunities",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                Text(
                    text = "Funding options and how to prepare strong applications: local awards, national schemes, and international programs accepting Ethiopian applicants.",
                    fontSize = 12.sp,
                    color = WisdomMuted
                )
            }
        }

        // Tips Accordion
        WisdomModernCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 18.dp,
            borderColor = WisdomAccentRose.copy(alpha = 0.35f)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showTips = !showTips },
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(WisdomAccentRose.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Tips", fontSize = 9.sp, fontWeight = FontWeight.Black, color = WisdomAccentRose)
                        }
                        Text("How to use this page & apply well", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomAccentRose,
                        modifier = Modifier.size(18.dp)
                    )
                }

                AnimatedVisibility(visible = showTips) {
                    Column(
                        modifier = Modifier.padding(top = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "• Read eligibility notes carefully: many awards are limited by grade, field, gender, or need.\n• Start early. Strong applications need transcripts, recommendations, and a clear personal statement.\n• Keep a simple tracker of deadlines, required documents, and status.\n• Prefer official sites and verified partners.\n• Always verify deadlines and requirements on the official page.",
                            fontSize = 11.5.sp,
                            color = Color.White.copy(alpha = 0.85f),
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        scholarships.forEach { sch ->
            ScholarshipCardItem(sch = sch)
        }
    }
}

@Composable
private fun ScholarshipCardItem(sch: ScholarshipOpportunity) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current

    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(sch.provider.uppercase(), fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)
                    Text(sch.title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(sch.amount, fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = WisdomAccentEmerald)
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                FactBadge(label = "Deadline: ${sch.deadline}")
                FactBadge(label = sch.level)
                FactBadge(label = sch.country)
            }

            if (sch.eligibility.isNotBlank()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White.copy(alpha = 0.03f))
                        .padding(8.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text("ELIGIBILITY", fontSize = 8.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)
                        Text(sch.eligibility, fontSize = 10.5.sp, color = WisdomMuted, lineHeight = 14.sp)
                    }
                }
            }

            Text(
                text = sch.body,
                fontSize = 11.5.sp,
                color = WisdomMuted,
                lineHeight = 16.sp,
                maxLines = if (expanded) Int.MAX_VALUE else 3,
                overflow = TextOverflow.Ellipsis
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { expanded = !expanded }
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (expanded) "Show less" else "Read full details",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = WisdomAccentRose
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomAccentRose,
                        modifier = Modifier.size(14.dp)
                    )
                }

                if (sch.externalUrl.isNotBlank()) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(WisdomAccentRose)
                            .clickable {
                                try {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(sch.externalUrl))
                                    context.startActivity(intent)
                                } catch (_: Exception) {}
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Apply Official", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.AutoMirrored.Filled.OpenInNew, contentDescription = null, tint = Color.White, modifier = Modifier.size(11.dp))
                        }
                    }
                }
            }
        }
    }
}
