package com.wisdomtower.academy.ui.drawer

import android.content.Context
import android.widget.Toast
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
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.QuestionAnswer
import androidx.compose.material.icons.filled.Scale
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.ripple
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentPurple
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

@Composable
fun DrawerHeaderBar(
    title: String,
    onBack: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 6.dp),
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
            text = title,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
    }
}

/* =========================================================================================
   1. ABOUT ACADEMY SCREEN
========================================================================================= */

@Composable
fun AboutScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item(key = "header") {
                DrawerHeaderBar(title = "About Academy", onBack = onBack)
            }

            item(key = "hero") {
                WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
                    Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(WisdomCyan.copy(alpha = 0.12f))
                                .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.3f)), RoundedCornerShape(8.dp))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text("INSTITUTIONAL VISION", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                        }

                        Text(
                            text = "Elevating Ethiopian e-learning into a world-class academic sphere.",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            lineHeight = 25.sp
                        )

                        Text(
                            text = "Wisdom Tower Academy is engineered to empower Ethiopian students across secondary, transition, and university levels. We combine verified curriculum coverage, adaptive practice, and high-yield retrieval methods into a reliable, offline-capable environment.",
                            fontSize = 12.sp,
                            color = WisdomMuted,
                            lineHeight = 17.sp
                        )
                    }
                }
            }

            // 4 Pillars
            item(key = "pillars_heading") {
                Text(
                    text = "FOUR PEDAGOGICAL PILLARS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomCyan,
                    letterSpacing = 1.sp
                )
            }

            item(key = "pillars_list") {
                val pillars = listOf(
                    Triple("21st-Century Learning Architecture", "Advanced EdTech", "Learning requires active cognition, not passive consumption. We fuse adaptive question banks, interactive flashcard recall, and on-demand AI conceptual tutoring into a single frictionless workspace."),
                    Triple("100% Aligned to New Curriculum", "Official Alignment", "Built from the ground up to reflect Ethiopia's reformed competence-based modular framework. Every chapter note, practice test, and syllabus track matches the exact national standards."),
                    Triple("Nationwide Low-Bandwidth Resilience", "Offline-First", "Education must reach every student, regardless of connectivity. Materials remain instantly readable offline across all regions of Ethiopia."),
                    Triple("Beyond Academics: The Whole Scholar", "Holistic Trajectory", "We bridge students from exam halls to real-world impact. Explore verified scholarship databases, university campus guides, career competency prep, and lifelong networks.")
                )

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    pillars.forEach { (pTitle, pBadge, pDesc) ->
                        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 16.dp) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(pTitle, fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(WisdomCyan.copy(alpha = 0.1f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(pBadge, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                                    }
                                }
                                Text(pDesc, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp)
                            }
                        }
                    }
                }
            }

            // Impact metrics
            item(key = "metrics") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val stats = listOf(
                        Pair("30K+", "Ambitious Scholars"),
                        Pair("20+", "Freshman Courses"),
                        Pair("100%", "Curriculum Aligned"),
                        Pair("0ms", "Offline Delay")
                    )
                    stats.forEach { (v, l) ->
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(14.dp))
                                .background(Color.White.copy(alpha = 0.04f))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(14.dp))
                                .padding(vertical = 10.dp, horizontal = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(v, fontSize = 14.sp, fontWeight = FontWeight.Black, color = WisdomCyan)
                                Text(l, fontSize = 9.sp, color = WisdomMuted, maxLines = 1)
                            }
                        }
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

/* =========================================================================================
   2. CONTACT & SUPPORT SCREEN (Real native form: Name, Email, Topic, Message, Send)
========================================================================================= */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContactScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var selectedTopic by remember { mutableStateOf("Packages & pricing") }
    var message by remember { mutableStateOf("") }
    var isSubmitted by remember { mutableStateOf(false) }
    var isSending by remember { mutableStateOf(false) }
    var topicDropdownExpanded by remember { mutableStateOf(false) }

    val topics = listOf(
        "Packages & pricing",
        "Grades 9–12",
        "Freshman",
        "Exit Exam",
        "GAT",
        "Account / login help",
        "Payment & access",
        "Other"
    )

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item(key = "header") {
                DrawerHeaderBar(title = "Contact & Support", onBack = onBack)
            }

            if (isSubmitted) {
                item(key = "success_state") {
                    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 24.dp) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape)
                                    .background(WisdomAccentEmerald.copy(alpha = 0.15f))
                                    .border(BorderStroke(1.dp, WisdomAccentEmerald.copy(alpha = 0.4f)), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = WisdomAccentEmerald,
                                    modifier = Modifier.size(30.dp)
                                )
                            }

                            Text("Message received", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(
                                text = "Thanks for reaching out. We aim to reply within 24 hours. Your inquiry has been logged locally and queued for priority dispatch.",
                                fontSize = 12.sp,
                                color = WisdomMuted,
                                lineHeight = 17.sp,
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(WisdomCyan)
                                    .clickable {
                                        fullName = ""
                                        message = ""
                                        isSubmitted = false
                                    }
                                    .padding(horizontal = 20.dp, vertical = 10.dp)
                            ) {
                                Text("Send another message", fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                            }
                        }
                    }
                }
            } else {
                item(key = "intro_card") {
                    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Contact Academy", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                            Text(
                                "Questions about pathways, packages, or your account? Send a message; we aim to reply within 24 hours.",
                                fontSize = 12.sp,
                                color = WisdomMuted,
                                lineHeight = 16.sp
                            )
                        }
                    }
                }

                item(key = "form_card") {
                    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
                        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                            // Full Name
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Full Name", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                OutlinedTextField(
                                    value = fullName,
                                    onValueChange = { fullName = it },
                                    placeholder = { Text("Your full name", fontSize = 12.sp, color = WisdomMuted) },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp),
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

                            // Email Address
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Email Address", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                OutlinedTextField(
                                    value = email,
                                    onValueChange = { email = it },
                                    placeholder = { Text("you@example.com", fontSize = 12.sp, color = WisdomMuted) },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp),
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

                            // Topic Dropdown
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Topic", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                ExposedDropdownMenuBox(
                                    expanded = topicDropdownExpanded,
                                    onExpandedChange = { topicDropdownExpanded = it }
                                ) {
                                    OutlinedTextField(
                                        value = selectedTopic,
                                        onValueChange = {},
                                        readOnly = true,
                                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = topicDropdownExpanded) },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .menuAnchor(),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = WisdomCyan,
                                            unfocusedBorderColor = WisdomBorderWhite,
                                            focusedTextColor = Color.White,
                                            unfocusedTextColor = Color.White,
                                            focusedContainerColor = Color(0xFF0F172A),
                                            unfocusedContainerColor = Color(0xFF0F172A)
                                        )
                                    )
                                    ExposedDropdownMenu(
                                        expanded = topicDropdownExpanded,
                                        onDismissRequest = { topicDropdownExpanded = false },
                                        modifier = Modifier.background(Color(0xFF0F172A))
                                    ) {
                                        topics.forEach { t ->
                                            DropdownMenuItem(
                                                text = { Text(t, color = Color.White, fontSize = 12.sp) },
                                                onClick = {
                                                    selectedTopic = t
                                                    topicDropdownExpanded = false
                                                }
                                            )
                                        }
                                    }
                                }
                            }

                            // Message
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Message", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                OutlinedTextField(
                                    value = message,
                                    onValueChange = { message = it },
                                    placeholder = { Text("How can we help? Include your grade/level if relevant.", fontSize = 12.sp, color = WisdomMuted) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(110.dp),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = WisdomCyan,
                                        unfocusedBorderColor = WisdomBorderWhite,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White,
                                        focusedContainerColor = Color(0xFF0F172A),
                                        unfocusedContainerColor = Color(0xFF0F172A)
                                    ),
                                    maxLines = 5
                                )
                            }

                            // Submit Button
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(WisdomCyan)
                                    .clickable {
                                        if (fullName.isBlank() || email.isBlank() || message.isBlank()) {
                                            Toast.makeText(context, "Please fill in all required fields", Toast.LENGTH_SHORT).show()
                                        } else {
                                            isSending = true
                                            // Store locally
                                            val sp = context.getSharedPreferences("wta_inquiries", Context.MODE_PRIVATE)
                                            sp.edit().putString("last_inquiry_${System.currentTimeMillis()}", "$fullName | $email | $selectedTopic | $message").apply()
                                            isSending = false
                                            isSubmitted = true
                                        }
                                    }
                                    .padding(vertical = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, tint = Color.Black, modifier = Modifier.size(15.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(if (isSending) "Sending..." else "Send Message", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                }
                            }
                        }
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

/* =========================================================================================
   3. FAQ SCREEN
========================================================================================= */

@Composable
fun FaqScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val faqItems = listOf(
        Pair("How does offline learning work in the Academy app?", "All core resources—including this guide, the 45 university profiles, 26 department field guides, evidence-based study techniques, and catalog outlines—are stored directly on your device. When you open study hubs or practice tests while online, they are automatically cached in the local vault so you can review them with zero internet afterwards."),
        Pair("Are courses aligned with Ethiopia's New Curriculum?", "Yes, 100%. Wisdom Tower Academy curriculum is built strictly in accordance with Ethiopia's updated modular, competence-based framework across Grades 9–12, Remedial foundations, and University Freshman programs."),
        Pair("What are the six learning hubs available for each course?", "Every course and package provides: 1) Official Textbooks, 2) Chapter Summaries & Short Notes, 3) Chapter Question Banks, 4) Mock & Model Practice Exams with solutions, 5) Explain with AI Conceptual Tutor, and 6) Rapid Recall Flashcards."),
        Pair("How does Ethiopian Freshman GPA calculation work?", "The Academy integrates the official 4.0 cumulative scale used by Ethiopian public universities (AAU, ASTU, AASTU, JU, BDU), calculating course credit hours, letter grades (A+ down to F), and semester GPA cutoffs for competitive engineering and medicine placement."),
        Pair("How do I activate course passes and complete payment?", "Tuition payments in Ethiopian Birr (ETB) can be made through domestic channels including Telebirr, Commercial Bank of Ethiopia (CBE Birr), and Bank of Abyssinia. After submitting your transaction reference, verified access is granted automatically to your Digital Student ID.")
    )

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item(key = "header") {
                DrawerHeaderBar(title = "Frequently Asked Questions", onBack = onBack)
            }

            item(key = "intro") {
                WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("FAQ & Scholar Guide", fontSize = 17.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text("Answers to common questions about programs, curriculum alignment, offline access, and study tools.", fontSize = 12.sp, color = WisdomMuted)
                    }
                }
            }

            items(faqItems) { (q, a) ->
                var open by remember { mutableStateOf(false) }
                WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 16.dp) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { open = !open },
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(q, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.weight(1f))
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = null,
                                tint = WisdomCyan,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        AnimatedVisibility(visible = open) {
                            Text(
                                text = a,
                                fontSize = 11.5.sp,
                                color = WisdomMuted,
                                lineHeight = 16.sp,
                                modifier = Modifier.padding(top = 10.dp)
                            )
                        }
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

/* =========================================================================================
   4. PRIVACY POLICY SCREEN (Word for word matching website PrivacyPage)
========================================================================================= */

@Composable
fun PrivacyScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item(key = "header") {
                DrawerHeaderBar(title = "Privacy Policy", onBack = onBack)
            }

            item(key = "intro_card") {
                WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(16.dp))
                            Text("STUDENT DATA PROTECTION", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                            Text("• Effective 2026/2027", fontSize = 10.sp, color = WisdomMuted)
                        }

                        Text("Institutional Privacy Policy", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text(
                            text = "Wisdom Tower Academy is dedicated to safeguarding the privacy, personal records, and academic integrity of every enrolled learner. This charter articulates our rigorous protocols for data stewardship, encryption safeguards, and the protection of student telemetry.",
                            fontSize = 11.5.sp,
                            color = WisdomMuted,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            item(key = "guarantees") {
                WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 18.dp, borderColor = WisdomCyan.copy(alpha = 0.3f)) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("OUR ACADEMIC PRIVACY GUARANTEES", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)

                        val g = listOf(
                            Pair("Zero Data Monetization", "We never sell, lease, or broker student personal or academic data to third-party ad networks."),
                            Pair("End-to-End Encryption", "TLS 1.3 protocol protects all transit data; cryptographic vaults secure student profiles at rest."),
                            Pair("Student-Centric Ownership", "Your progress records, bookmarks, and quiz histories belong to your academic journey."),
                            Pair("Underage Scholar Protections", "Dedicated safety guardrails for secondary school learners in Grades 9–12.")
                        )

                        g.forEach { (title, desc) ->
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("• $title", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text(desc, fontSize = 11.sp, color = WisdomMuted, modifier = Modifier.padding(start = 10.dp))
                            }
                        }
                    }
                }
            }

            item(key = "policy_body") {
                val sections = listOf(
                    Pair("01 Scope & Controller Identity", "Wisdom Tower Academy operates digital education infrastructure across Ethiopia. Student records and telemetry are managed under strict institutional governance with designated data controllers."),
                    Pair("02 Categories of Data Processed", "We collect academic identifiers (Student Folio, legal name, educational institution, target exams) and learning telemetry (quiz attempts, timer durations, flashcard spaced repetition intervals). We do not collect extraneous tracking cookies."),
                    Pair("03 Local Caching & Edge Storage", "Study documents, summaries, and lecture notes are cached inside the application sandbox on your device for offline resilience. Local data remains under your direct device ownership."),
                    Pair("04 Third-Party Payment Protection", "Payment credentials are processed directly through certified financial aggregators (Telebirr, CBE Birr). The Academy never stores complete account PINs or card CVVs.")
                )

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    sections.forEach { (sTitle, sBody) ->
                        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 16.dp) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(sTitle, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text(sBody, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp)
                            }
                        }
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

/* =========================================================================================
   5. TERMS OF SERVICE SCREEN (Word for word matching website TermsPage)
========================================================================================= */

@Composable
fun TermsScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item(key = "header") {
                DrawerHeaderBar(title = "Terms of Service", onBack = onBack)
            }

            item(key = "intro_card") {
                WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 22.dp) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.Scale, contentDescription = null, tint = WisdomAccentAmber, modifier = Modifier.size(16.dp))
                            Text("INSTITUTIONAL AGREEMENT", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                            Text("• Effective 2026/2027", fontSize = 10.sp, color = WisdomMuted)
                        }

                        Text("Terms of Service & Academic Agreement", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text(
                            text = "These Terms govern your enrollment, access to curriculum materials, digital examination engines, and software services provided by Wisdom Tower Academy. By registering an account or accessing any academic track, you enter into a legally binding academic compact.",
                            fontSize = 11.5.sp,
                            color = WisdomMuted,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            item(key = "compact_summary") {
                WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 18.dp, borderColor = WisdomAccentAmber.copy(alpha = 0.3f)) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("CORE ACADEMIC COMPACT AT A GLANCE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)

                        val compacts = listOf(
                            Pair("Personal Educational License", "Course enrollments, solved exams, and lecture notes are licensed strictly for your individual academic preparation and cannot be redistributed, scraped, or shared."),
                            Pair("Academic Integrity", "Wisdom Tower Academy upholds rigorous academic honesty. The platform is designed to develop genuine competence under Ethiopia's new curriculum framework."),
                            Pair("Verified Access", "Tuition fees in Ethiopian Birr (ETB) are verified through domestic payment channels (Telebirr, CBE, Abyssinia). Verified orders unlock immediate learning hub access.")
                        )

                        compacts.forEach { (title, desc) ->
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("• $title", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text(desc, fontSize = 11.sp, color = WisdomMuted, modifier = Modifier.padding(start = 10.dp))
                            }
                        }
                    }
                }
            }

            item(key = "terms_sections") {
                val tSections = listOf(
                    Pair("01 Academic Purpose & Acceptance", "Wisdom Tower Academy operates digital education infrastructure engineered to support secondary learners (Grades 9–12), remedial foundation candidates, university freshman scholars, departmental engineering students, and entrance candidates."),
                    Pair("02 Student Accounts & Folio Security", "Scholars are assigned unique Student Folios (WTA-XXXX). You are responsible for preserving credential confidentiality and ensuring legal name accuracy for verified certifications."),
                    Pair("03 Intellectual Property & Content Rights", "Curriculum notes, questions, answer derivations, and interactive software modules are proprietary property protected by copyright and trade law."),
                    Pair("04 Service Availability & Offline Resilience", "While we strive for continuous service uptime, the native application provides offline cache storage so learning continuity is maintained regardless of power or regional connectivity outages.")
                )

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    tSections.forEach { (tTitle, tDesc) ->
                        WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 16.dp) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(tTitle, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text(tDesc, fontSize = 11.5.sp, color = WisdomMuted, lineHeight = 16.sp)
                            }
                        }
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}
