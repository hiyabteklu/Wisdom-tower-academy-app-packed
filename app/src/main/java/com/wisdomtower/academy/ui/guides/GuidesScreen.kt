package com.wisdomtower.academy.ui.guides

// Guides audited against website-reference/ (2026-10-11, session F). Every label and text below is
// copied from the website pages: components/academy/*, app/academy/{universities,departments,
// scholarships,success-stories}/page.tsx and data/universities.ts. Do not add wording that is not there.

import com.wisdomtower.academy.ui.theme.WisdomGlassFill
import com.wisdomtower.academy.ui.theme.WisdomGlassFillStrong
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
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentOrange
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
    val context = LocalContext.current
    var activeSlug by remember { mutableStateOf(initialSlug) }

    val (uniIntro, universitiesList) = remember { GuidesRepository.loadUniversities(context) }
    val uniClosing = remember { GuidesRepository.loadUniversitiesClosing(context) }
    val (deptCategories, departmentsList) = remember { GuidesRepository.loadDepartments(context) }
    val (storiesList, scholarshipsList) = remember { GuidesRepository.loadFreeResources(context) }

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
                            .background(WisdomGlassFillStrong)
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
                    // Website heading of the guides list on /academy.
                    Text(
                        text = "Other resources",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            item(key = "switcher_row") {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(GUIDE_TABS) { tab ->
                        val isSelected = activeSlug == tab.slug
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .border(
                                    BorderStroke(1.dp, if (isSelected) tab.accentColor else WisdomBorderWhite),
                                    RoundedCornerShape(20.dp)
                                )
                                .background(
                                    if (isSelected) tab.accentColor.copy(alpha = 0.15f)
                                    else WisdomGlassFill
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

            when (activeSlug) {
                "success-stories" -> item(key = "guide_success_stories") {
                    SuccessStoriesFullSection(stories = storiesList)
                }
                "campus-life" -> item(key = "guide_campus_life") {
                    CampusLifeFullSection()
                }
                "universities" -> item(key = "guide_universities") {
                    UniversitiesFullSection(
                        introParagraphs = uniIntro,
                        closing = uniClosing,
                        universities = universitiesList
                    )
                }
                "departments" -> item(key = "guide_departments") {
                    DepartmentsFullSection(categories = deptCategories, departments = departmentsList)
                }
                "scholarships" -> item(key = "guide_scholarships") {
                    ScholarshipsFullSection(scholarships = scholarshipsList)
                }
                else -> item(key = "guide_study_techniques") {
                    StudyTechniquesFullSection()
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(36.dp))
            }
        }
    }
}

/* ============================== shared small pieces ============================== */

@Composable
private fun GuideHeaderCard(tag: String, accent: Color, title: String, body: String?) {
    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            SmallTag(label = tag.uppercase(), color = accent)
            Text(text = title, fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color.White)
            if (!body.isNullOrBlank()) {
                Text(
                    text = body,
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.85f),
                    lineHeight = 17.sp
                )
            }
        }
    }
}

@Composable
private fun SmallTag(label: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.12f))
            .border(BorderStroke(1.dp, color.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = color)
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
        Text(label, fontSize = 10.5.sp, color = WisdomMuted)
    }
}

@Composable
private fun InfoBox(title: String, accent: Color, content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(accent.copy(alpha = 0.05f))
            .border(BorderStroke(1.dp, accent.copy(alpha = 0.2f)), RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(title.uppercase(), fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = accent)
            content()
        }
    }
}

@Composable
private fun BulletLine(text: String, bullet: String, color: Color) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.Top) {
        Text(bullet, color = color, fontWeight = FontWeight.Bold, fontSize = 11.sp)
        Text(text, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.9f), lineHeight = 16.sp)
    }
}

@Composable
private fun MoreLessButton(expanded: Boolean, accent: Color, onToggle: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(accent.copy(alpha = if (expanded) 0.08f else 0.15f))
            .border(BorderStroke(1.dp, accent.copy(alpha = 0.3f)), RoundedCornerShape(20.dp))
            .clickable { onToggle() }
            .padding(vertical = 9.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(if (expanded) "Less" else "More", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = accent)
            Icon(
                imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                contentDescription = null,
                tint = accent,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
private fun GuideSearchField(value: String, onChange: (String) -> Unit, placeholder: String) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        placeholder = { Text(placeholder, fontSize = 12.sp, color = WisdomMuted) },
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
}

@Composable
private fun FilterChip(label: String, selected: Boolean, accent: Color, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(if (selected) accent.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.05f))
            .border(BorderStroke(1.dp, if (selected) accent.copy(alpha = 0.5f) else WisdomBorderWhite), RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(
            text = label,
            fontSize = 11.5.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            color = if (selected) accent else WisdomMuted
        )
    }
}

@Composable
private fun EmptyNoteCard(title: String?, text: String) {
    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            if (title != null) {
                Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
            Text(text, fontSize = 12.sp, color = WisdomMuted, lineHeight = 17.sp)
        }
    }
}

private fun openLink(context: android.content.Context, url: String) {
    try {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    } catch (_: Exception) {
    }
}

/* ============================== 1. STUDY TECHNIQUES ============================== */
/* Source: components/academy/StudyTechniquesPage.tsx and StudyTechniquesSections.tsx (checked word for word). */

@Composable
private fun StudyTechniquesFullSection() {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        GuideHeaderCard(
            tag = "Other resources",
            accent = WisdomAccentAmber,
            title = "Evidence-Based Study Techniques",
            body = "Covering pages and highlighting lines can feel like work. Often it is only exposure. What tends to stick is what you can produce from memory without looking: a definition in your own words, a method you can choose under time pressure, a problem you solve from a blank page.\n\nThis guide walks through methods that match how memory actually forms. None of them require an innate gift. They require structured retrieval, honest feedback, and deliberate practice."
        )

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
                    Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
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
            StepHeader(stepNumber, category, title, accentColor)
            Text(text = highlight, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            Text(text = body, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp)

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
                    routineItems.forEach { item -> BulletLine(item, "•", accentColor) }
                }
            }

            InfoBox(title = "Common Trap", accent = WisdomAccentRose) {
                Text(commonTrap, fontSize = 11.sp, color = WisdomMuted, lineHeight = 15.sp)
            }
        }
    }
}

@Composable
private fun StepHeader(step: String, category: String, title: String, accentColor: Color) {
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
}

/* ============================== 2. SUCCESS STORIES ============================== */
/* Source: app/academy/success-stories/page.tsx. Items come from the website's Supabase table. */

@Composable
private fun SuccessStoriesFullSection(stories: List<SuccessStory>) {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        GuideHeaderCard(
            tag = "Free resource",
            accent = WisdomAccentAmber,
            title = "Success Stories",
            body = FreeResourcesLive.storiesSubtitle.ifBlank { null }
        )

        if (stories.isNotEmpty()) {
            Text(
                text = "${stories.size} ${if (stories.size == 1) "story" else "stories"}",
                fontSize = 11.sp,
                color = WisdomMuted
            )
        }

        if (stories.isEmpty()) {
            if (!FreeResourcesLive.loaded) {
                FreeResourcesStateCard(null, "Loading…")
            } else if (FreeResourcesLive.storiesFailed) {
                FreeResourcesStateCard(null, "Could not load stories.")
            } else {
                FreeResourcesStateCard("No stories yet", "Published stories will appear here as large photo cards.")
            }
        }
        stories.forEach { story -> SuccessStoryCardItem(story = story) }
    }
}

/**
 * Cover photo of a success story (website: 16:10 photo at the top of the card, amber trophy when there is no
 * photo). The trophy stays behind the photo, so it is also what the student sees while the photo loads or if
 * it cannot be loaded.
 */
@Composable
private fun StoryCover(imageUrl: String, description: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1.6f)
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .background(Color(0xFF0B1426)),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.EmojiEvents,
            contentDescription = null,
            tint = WisdomAccentAmber.copy(alpha = 0.3f),
            modifier = Modifier.size(56.dp)
        )
        if (imageUrl.isNotBlank()) {
            AsyncImage(
                model = imageUrl,
                contentDescription = description,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun SuccessStoryCardItem(story: SuccessStory) {
    var expanded by remember { mutableStateOf(false) }
    val longBody = story.body.trim().length > 220

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
        borderColor = if (expanded) WisdomAccentAmber.copy(alpha = 0.5f) else WisdomBorderWhite
    ) {
        Column {
            StoryCover(
                imageUrl = story.imageUrl,
                description = story.name.ifBlank { story.achievement }
            )
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("ACHIEVEMENT", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                        Text(story.achievement, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White)
                        val byline = listOf(story.name, story.program, story.year).filter { it.isNotBlank() }.joinToString(" · ")
                        if (byline.isNotEmpty()) {
                            Text(byline, fontSize = 11.sp, color = WisdomMuted)
                        }
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
                            fontStyle = FontStyle.Italic,
                            color = Color(0xFFFDE68A),
                            lineHeight = 16.sp
                        )
                    }
                }

                if (story.body.isNotBlank()) {
                    Text(
                        text = story.body.trim(),
                        fontSize = 11.5.sp,
                        color = WisdomMuted,
                        lineHeight = 16.sp,
                        maxLines = if (expanded || !longBody) Int.MAX_VALUE else 3,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                if (longBody) {
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { expanded = !expanded }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (expanded) "Show less" else "Read full story",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = WisdomAccentAmber
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                            contentDescription = null,
                            tint = WisdomAccentAmber,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }
        }
    }
}

/* ============================== 3. CAMPUS LIFE ============================== */
/* Source: components/academy/CampusLifePage.tsx and CampusLifeSections.tsx. */

private data class CampusCard(val title: String, val body: String)

@Composable
private fun CampusLifeFullSection() {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        GuideHeaderCard(
            tag = "Other resources",
            accent = WisdomAccentSky,
            title = "Campus Life Field Guide",
            body = "Most of what decides your grades does not happen only at a desk with a highlighter. It happens in the hours between classes: who you sit with, how late you stay online, whether you recover after a hard week, and whether a weak lecture still leaves you with something you can revise.\n\nThis page is a practical guide to that side of university: friendships, pressure, classrooms, and the buildings and people around you. Nothing here is a personality test. It is ordinary advice that works when you apply it imperfectly but consistently."
        )

        CampusSectionCard(
            step = "01",
            category = "Social Dynamics",
            title = "Friends & Social Life",
            subtitle = "Keeping friends without losing the semester",
            paragraphs = listOf(
                "University is where many people meet the friends they keep for years. That matters. What also matters is that endless availability-answering every message the moment it arrives, accepting every invitation because saying no feels rude-leaves almost no quiet stretch for real study.",
                "You do not need to become cold. You need a simple pattern: some hours are for work, and during those hours you are allowed to be slow to reply. When you are free, be actually free. People respect clarity more than vague half-attention all day long."
            ),
            bullets = listOf(
                "Block a few study hours where your phone is not the priority.",
                "Put social plans after those blocks when you can, not in the middle of them.",
                "A short, honest 'I am finishing this, talk later' is enough; you do not owe a speech."
            ),
            cards = listOf(
                CampusCard(
                    "What “everyone is doing” really means",
                    "Peer pressure on campus rarely looks like orders. More often it is the quiet assumption that skipping class is normal, or that starting assignments the night before is standard. Decide your minimum standards in advance and study near peers who work diligently."
                ),
                CampusCard(
                    "Loneliness is not discipline",
                    "Cutting everyone off is not a healthy strategy. Most students thrive with one or two steady, reliable relationships rather than large superficial circles. Schedule meaningful connections like a weekly study walk or a short call home."
                )
            ),
            accentColor = WisdomAccentRose
        )

        CampusSectionCard(
            step = "02",
            category = "Mental Stamina",
            title = "Energy & Pressure Management",
            subtitle = null,
            paragraphs = emptyList(),
            bullets = emptyList(),
            cards = listOf(
                CampusCard(
                    "When motivation comes and goes",
                    "Some weeks you feel sharp; other weeks opening the textbook feels heavy. On low-energy days, shrink the scope: do a 15-minute recall review or one section of problems. Continuity beats boom-and-bust cramming."
                ),
                CampusCard(
                    "Noticing burnout early",
                    "Burnout builds quietly: you sleep but wake up exhausted, tasks feel numb, or irritability spikes. Cut study volume, simplify your commitments, and talk to someone early instead of pushing until complete collapse."
                ),
                CampusCard(
                    "Showing up routinely",
                    "Do not wait for inspirational moods. Anchor to simple physical triggers: the same desk, a consistent starting hour, and an easy first step. Reliable small steps get you across four or five undergraduate years."
                ),
                CampusCard(
                    "Rest that actually restores",
                    "Infinite phone scrolling leaves you depleted. Authentic restoration means uninterrupted sleep, sunlight, walking outdoors, screen-free meals, and genuine human conversations."
                )
            ),
            accentColor = WisdomAccentViolet
        )

        CampusSectionCard(
            step = "03",
            category = "Classroom Strategy",
            title = "Lectures & Classroom Time",
            subtitle = null,
            paragraphs = emptyList(),
            bullets = emptyList(),
            cards = listOf(
                CampusCard(
                    "Where you sit and how you listen",
                    "Sitting in front where you clearly view the board reduces the cognitive strain of staying locked into complex derivations. The back rows invite distractions and lost hours."
                ),
                CampusCard(
                    "Attendance without perfectionism",
                    "You will occasionally miss class. What matters is never leaving a missed core concept unrepaired. Treat the day you missed as the deadline to copy notes and derive the examples."
                ),
                CampusCard(
                    "Phone silence and attention resets",
                    "Attention drifts for everyone. Silence notifications and mark the moment your focus strayed. Focus is a muscle you re-engage throughout the hour, not an all-or-nothing test."
                ),
                CampusCard(
                    "When the instruction feels dense",
                    "Not every professor explains concepts accessibly. Treat the lecture as an outline of what the university values, then verify concepts in textbooks or with classmates immediately after."
                ),
                CampusCard(
                    "The 15-Minute Same-Day Payoff",
                    "Immediately after a demanding lecture, write three core takeaways on a blank page from memory before checking your notes. This simple habit preserves weeks of preparation effort."
                )
            ),
            accentColor = WisdomAccentSky
        )

        CampusSectionCard(
            step = "04",
            category = "Campus Facilities",
            title = "Places, Study Groups & Faculty",
            subtitle = null,
            paragraphs = emptyList(),
            bullets = emptyList(),
            cards = listOf(
                CampusCard(
                    "Use buildings on purpose",
                    "The university library is for deep concentration; dorms and cafeterias are for unwinding. Separating physical spaces prevents mental clutter."
                ),
                CampusCard(
                    "Group work discipline",
                    "Agree on milestones, dates, and ownership early. Never leave collective assignments for a frantic overnight rush the evening before submission."
                ),
                CampusCard(
                    "Approaching instructors",
                    "Bring precise problem statements to office hours early in the term. Instructors respect proactive curiosity much more than vague last-minute exam panicking."
                )
            ),
            accentColor = WisdomAccentEmerald
        )

        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("A Simple Weekly Reflection Check", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(
                    "You do not need to tick every box every week. Use this diagnostic when the term begins feeling noisy, unfocused, or overwhelming:",
                    fontSize = 11.5.sp,
                    color = WisdomMuted,
                    lineHeight = 16.sp
                )
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
    subtitle: String?,
    paragraphs: List<String>,
    bullets: List<String>,
    cards: List<CampusCard>,
    accentColor: Color
) {
    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            StepHeader(step, category, title, accentColor)

            if (subtitle != null) {
                Text(subtitle, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
            paragraphs.forEach { p ->
                Text(p, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp)
            }
            bullets.forEach { b -> BulletLine(b, "•", accentColor) }

            cards.forEach { c ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White.copy(alpha = 0.03f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                        .padding(10.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text(c.title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(c.body, fontSize = 11.sp, color = WisdomMuted, lineHeight = 15.sp)
                    }
                }
            }
        }
    }
}

/* ============================== 4. UNIVERSITIES ============================== */
/* Source: app/academy/universities/page.tsx and data/universities.ts. */

@Composable
private fun UniversitiesFullSection(
    introParagraphs: List<String>,
    closing: String,
    universities: List<UniversityDetail>
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedRegion by remember { mutableStateOf(ALL_REGIONS) }
    var featuredOnly by remember { mutableStateOf(false) }
    var showNbCard by remember { mutableStateOf(false) }
    var detailedOnly by remember { mutableStateOf(false) }

    val regions = listOf(
        ALL_REGIONS, "Addis Ababa", "Amhara", "Oromia", "Tigray", "SNNPR",
        "Somali", "Afar", "Benishangul Gumuz", "Gambela", "Dire Dawa"
    )

    val filteredList = remember(searchQuery, selectedRegion, featuredOnly, detailedOnly, universities) {
        val q = searchQuery.trim().lowercase()
        universities.filter { u ->
            if (featuredOnly && !u.featured) return@filter false
            if (detailedOnly && !u.detailed) return@filter false
            if (selectedRegion != ALL_REGIONS && u.region != selectedRegion) return@filter false
            if (q.isEmpty()) return@filter true
            u.name.lowercase().contains(q) ||
                u.abbr.lowercase().contains(q) ||
                u.location.lowercase().contains(q) ||
                u.region.lowercase().contains(q) ||
                u.strengths.any { it.lowercase().contains(q) } ||
                u.knownFor.any { it.lowercase().contains(q) }
        }
    }

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        GuideHeaderCard(
            tag = "Other resources",
            accent = WisdomAccentViolet,
            title = "Ethiopian Universities Directory",
            body = "$UNIVERSITIES_SUBTITLE. Authentic guides, student fit, climate, and campus realities before you pick."
        )

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
                                .size(26.dp)
                                .clip(CircleShape)
                                .background(WisdomAccentSky.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("NB", fontSize = 9.5.sp, fontWeight = FontWeight.Black, color = WisdomAccentSky)
                        }
                        Text("Read this before you choose", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Icon(
                        imageVector = if (showNbCard) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomAccentSky,
                        modifier = Modifier.size(18.dp)
                    )
                }

                AnimatedVisibility(visible = showNbCard) {
                    Column(modifier = Modifier.padding(top = 10.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        introParagraphs.forEach { p ->
                            Text(p, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.85f), lineHeight = 16.sp)
                        }
                        if (closing.isNotBlank()) {
                            Text(
                                closing,
                                fontSize = 11.5.sp,
                                fontStyle = FontStyle.Italic,
                                color = Color.White.copy(alpha = 0.8f),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }
        }

        val detailedCount = remember(universities) { universities.count { it.detailed } }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            item(key = "count_institutions") { FactBadge(label = "${universities.size} Institutions") }
            item(key = "count_detailed") { FactBadge(label = "$detailedCount In-Depth Guides") }
            item(key = "count_regions") { FactBadge(label = "All Ethiopian Regions") }
        }

        GuideSearchField(
            value = searchQuery,
            onChange = { searchQuery = it },
            placeholder = "Search by university name, abbr (AAU, ASTU...), or city..."
        )

        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            item(key = "featured_chip") {
                FilterChip(label = "Featured", selected = featuredOnly, accent = WisdomAccentAmber) {
                    featuredOnly = !featuredOnly
                }
            }
            item(key = "detailed_chip") {
                FilterChip(label = "Detailed Guides", selected = detailedOnly, accent = WisdomAccentViolet) {
                    detailedOnly = !detailedOnly
                }
            }
            items(regions) { reg ->
                FilterChip(label = reg, selected = selectedRegion == reg, accent = WisdomAccentViolet) {
                    selectedRegion = reg
                }
            }
        }

        if (filteredList.isEmpty()) {
            EmptyNoteCard("No universities found", "Try adjusting your search terms or clearing the region filter.")
        }
        filteredList.forEach { uni -> UniversityDetailCard(uni = uni) }
    }
}

private const val ALL_REGIONS = "All Regions"

@Composable
private fun UniversityDetailCard(uni: UniversityDetail) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val previewTags = (if (uni.knownFor.isNotEmpty()) uni.knownFor else uni.strengths).take(3)

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 22.dp,
        borderColor = if (expanded) WisdomAccentSky.copy(alpha = 0.4f) else WisdomBorderWhite
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                SmallTag(label = uni.abbr, color = WisdomAccentSky)
                FactBadge(label = uni.region)
                if (uni.featured) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = WisdomAccentAmber, modifier = Modifier.size(12.dp))
                    Text("FEATURED", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                }
            }

            Text(uni.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = WisdomAccentSky, modifier = Modifier.size(12.dp))
                Text(uni.location, fontSize = 11.sp, color = WisdomMuted)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                if (uni.distanceFromAddisKm != null) {
                    FactBadge(label = if (uni.distanceFromAddisKm == 0) "In Capital" else "~${uni.distanceFromAddisKm} km")
                }
                if (uni.elevationM != null) FactBadge(label = "~${uni.elevationM}m")
                if (uni.founded.isNotBlank()) FactBadge(label = "Est. ${uni.founded}")
            }

            if (!expanded) {
                if (previewTags.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        previewTags.forEach { FactBadge(label = it) }
                    }
                }
                if (uni.studentFit.isNotBlank()) {
                    Text(
                        text = uni.studentFit,
                        fontSize = 11.5.sp,
                        color = WisdomMuted,
                        lineHeight = 16.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            AnimatedVisibility(visible = expanded) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (uni.campuses.isNotBlank()) {
                        InfoBox("Campus Geography & Setup", WisdomAccentSky) {
                            Text(uni.campuses, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.9f), lineHeight = 16.sp)
                        }
                    }
                    if (uni.climate.isNotBlank()) {
                        InfoBox("Weather & Climate", WisdomAccentAmber) {
                            Text(uni.climate, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.9f), lineHeight = 16.sp)
                        }
                    }
                    if (uni.distanceNote.isNotBlank()) {
                        Text(
                            text = "Travel Context: ${uni.distanceNote}",
                            fontSize = 11.5.sp,
                            color = WisdomMuted,
                            lineHeight = 16.sp
                        )
                    }
                    if (uni.knownFor.isNotEmpty()) {
                        InfoBox("Prominent Disciplines", WisdomAccentViolet) {
                            uni.knownFor.forEach { BulletLine(it, "•", WisdomAccentViolet) }
                        }
                    }
                    if (uni.strengths.isNotEmpty()) {
                        InfoBox("Academic Strengths", WisdomAccentSky) {
                            uni.strengths.forEach { BulletLine(it, "✓", WisdomAccentSky) }
                        }
                    }
                    if (uni.studentFit.isNotBlank()) {
                        InfoBox("Student Fit", WisdomAccentEmerald) {
                            Text(uni.studentFit, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.9f), lineHeight = 16.sp)
                        }
                    }
                    if (uni.whatToExpect.isNotEmpty()) {
                        InfoBox("Campus Life Reality", WisdomCyan) {
                            uni.whatToExpect.forEach { Text(it, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp) }
                        }
                    }
                    if (uni.tips.isNotEmpty()) {
                        InfoBox("Insider Tips for Students", WisdomAccentAmber) {
                            uni.tips.forEach { BulletLine(it, "•", WisdomAccentAmber) }
                        }
                    }
                }
            }

            MoreLessButton(expanded = expanded, accent = WisdomAccentSky) { expanded = !expanded }

            if (uni.website.isNotBlank() && uni.website != "#") {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White.copy(alpha = 0.04f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(16.dp))
                        .clickable { openLink(context, uni.website) }
                        .padding(horizontal = 12.dp, vertical = 7.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Website", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = WisdomAccentSky)
                        Icon(Icons.AutoMirrored.Filled.OpenInNew, contentDescription = null, tint = WisdomAccentSky, modifier = Modifier.size(12.dp))
                    }
                }
            }
        }
    }
}

/* ============================== 5. DEPARTMENTS ============================== */
/* Source: app/academy/departments/page.tsx. */

private const val ALL_FIELDS = "All Fields"

@Composable
private fun DepartmentsFullSection(
    categories: List<DepartmentCategoryDetail>,
    departments: List<DepartmentDetail>
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCat by remember { mutableStateOf(ALL_FIELDS) }

    val filterOptions = listOf(ALL_FIELDS) + categories.map { it.label }

    val filteredList = remember(searchQuery, selectedCat, departments, categories) {
        val q = searchQuery.trim().lowercase()
        departments.filter { d ->
            val catLabel = categories.find { it.id == d.categoryId }?.label ?: ""
            if (selectedCat != ALL_FIELDS && catLabel != selectedCat) return@filter false
            if (q.isEmpty()) return@filter true
            "${d.name} ${d.shortName} ${d.about} ${d.careers.joinToString(" ")}".lowercase().contains(q)
        }
    }

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        GuideHeaderCard(
            tag = "Other resources",
            accent = WisdomAccentOrange,
            title = "Department Field Guides",
            body = "What competitive undergraduate fields actually demand: real coursework, career roles, market demand in Ethiopia, and the trade-offs nobody puts on the official brochure."
        )

        FactBadge(label = "${departments.size} Academic Fields & Engineering Streams")

        GuideSearchField(
            value = searchQuery,
            onChange = { searchQuery = it },
            placeholder = "Search departments, careers, skills..."
        )

        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(filterOptions) { cat ->
                FilterChip(label = cat, selected = selectedCat == cat, accent = WisdomAccentOrange) {
                    selectedCat = cat
                }
            }
        }

        if (filteredList.isEmpty()) {
            EmptyNoteCard("No fields match your search", "Try another keyword or select All categories.")
        }
        filteredList.forEach { dept ->
            val catLabel = categories.find { it.id == dept.categoryId }?.label ?: "Academic Field"
            DepartmentDetailCard(dept = dept, categoryLabel = catLabel)
        }
    }
}

@Composable
private fun DepartmentDetailCard(dept: DepartmentDetail, categoryLabel: String) {
    var expanded by remember { mutableStateOf(false) }

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 22.dp,
        borderColor = if (expanded) WisdomCyan.copy(alpha = 0.4f) else WisdomBorderWhite
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                SmallTag(label = categoryLabel.uppercase(), color = WisdomAccentOrange)
                if (dept.durationYears.isNotBlank()) FactBadge(label = dept.durationYears)
            }

            Text(dept.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)

            if (!expanded) {
                Text(
                    text = dept.about,
                    fontSize = 11.5.sp,
                    color = WisdomMuted,
                    lineHeight = 16.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                if (dept.careers.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        dept.careers.take(3).forEach { FactBadge(label = it) }
                    }
                }
            }

            AnimatedVisibility(visible = expanded) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    InfoBox("What This Field Demands", WisdomAccentSky) {
                        Text(dept.about, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.9f), lineHeight = 16.sp)
                    }
                    if (dept.courses.isNotEmpty()) {
                        InfoBox("Core Coursework & Modules", WisdomAccentAmber) {
                            dept.courses.forEach { BulletLine(it, "•", WisdomAccentAmber) }
                        }
                    }
                    if (dept.careers.isNotEmpty()) {
                        InfoBox("Career Paths & Roles", WisdomAccentEmerald) {
                            dept.careers.forEach { BulletLine(it, "✓", WisdomAccentEmerald) }
                        }
                    }
                    if (dept.market.isNotBlank()) {
                        InfoBox("Ethiopian Market Reality & Outlook", WisdomAccentViolet) {
                            Text(dept.market, fontSize = 11.5.sp, color = Color.White.copy(alpha = 0.9f), lineHeight = 16.sp)
                        }
                    }
                    if (dept.pros.isNotEmpty()) {
                        InfoBox("Key Upsides", WisdomAccentEmerald) {
                            dept.pros.forEach { BulletLine(it, "+", WisdomAccentEmerald) }
                        }
                    }
                    if (dept.cons.isNotEmpty()) {
                        InfoBox("Trade-offs", WisdomAccentRose) {
                            dept.cons.forEach { BulletLine(it, "−", WisdomAccentRose) }
                        }
                    }
                }
            }

            MoreLessButton(expanded = expanded, accent = WisdomCyan) { expanded = !expanded }
        }
    }
}

/* ============================== 6. SCHOLARSHIPS ============================== */
/* Source: app/academy/scholarships/page.tsx. Items come from the website's Supabase table. */

@Composable
private fun ScholarshipsFullSection(scholarships: List<ScholarshipOpportunity>) {
    var showTips by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        GuideHeaderCard(
            tag = "Free resource",
            accent = WisdomAccentRose,
            title = "Scholarship Info",
            body = FreeResourcesLive.scholarshipsSubtitle.ifBlank { "Funding options and how to prepare strong applications." }
        )

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
                                .clip(RoundedCornerShape(8.dp))
                                .background(WisdomAccentRose.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Tips", fontSize = 9.5.sp, fontWeight = FontWeight.Black, color = WisdomAccentRose)
                        }
                        Text("How to use this page & apply well", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Icon(
                        imageVector = if (showTips) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomAccentRose,
                        modifier = Modifier.size(18.dp)
                    )
                }

                AnimatedVisibility(visible = showTips) {
                    Column(modifier = Modifier.padding(top = 10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = FreeResourcesLive.scholarshipsIntro.ifBlank { SCHOLARSHIP_DEFAULT_INTRO },
                            fontSize = 11.5.sp,
                            color = Color.White.copy(alpha = 0.85f),
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        if (scholarships.isNotEmpty()) {
            Text(
                text = "${scholarships.size} ${if (scholarships.size == 1) "opportunity" else "opportunities"}",
                fontSize = 11.sp,
                color = WisdomMuted
            )
        }

        if (scholarships.isEmpty()) {
            if (!FreeResourcesLive.loaded) {
                FreeResourcesStateCard(null, "Loading scholarships…")
            } else if (FreeResourcesLive.scholarshipsFailed) {
                FreeResourcesStateCard(null, "Unable to load scholarship opportunities right now.")
            } else {
                FreeResourcesStateCard(
                    null,
                    "Individual scholarship cards will appear here as we publish them. Use the guide above while preparing applications."
                )
            }
        }
        scholarships.forEach { sch -> ScholarshipCardItem(sch = sch) }

        if (scholarships.isNotEmpty()) {
            EmptyNoteCard(
                null,
                "Always verify deadlines and requirements on the official page. Requirements change. Treat this as a curated guide."
            )
        }
    }
}

@Composable
private fun ScholarshipCardItem(sch: ScholarshipOpportunity) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val longBody = sch.body.trim().length > 240

    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                if (sch.deadline.isNotBlank()) FactBadge(label = "Deadline: ${sch.deadline}")
                if (sch.level.isNotBlank()) FactBadge(label = sch.level)
                if (sch.country.isNotBlank()) FactBadge(label = sch.country)
            }

            Text(sch.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            val providerLine = listOf(sch.provider, sch.amount).filter { it.isNotBlank() }.joinToString(" · ")
            if (providerLine.isNotEmpty()) {
                Text(providerLine, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = WisdomAccentRose)
            }

            if (sch.eligibility.isNotBlank()) {
                InfoBox("Eligibility", WisdomAccentRose) {
                    Text(sch.eligibility, fontSize = 11.sp, color = WisdomMuted, lineHeight = 15.sp)
                }
            }

            if (sch.body.isNotBlank()) {
                Text(
                    text = sch.body.trim(),
                    fontSize = 11.5.sp,
                    color = WisdomMuted,
                    lineHeight = 16.sp,
                    maxLines = if (expanded || !longBody) Int.MAX_VALUE else 3,
                    overflow = TextOverflow.Ellipsis
                )
            }

            if (longBody) {
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
                        imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomAccentRose,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }

            if (sch.externalUrl.isNotBlank()) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(WisdomAccentRose)
                        .clickable { openLink(context, sch.externalUrl) }
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Apply / Official Page", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Icon(Icons.AutoMirrored.Filled.OpenInNew, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
                    }
                }
            }
        }
    }
}
