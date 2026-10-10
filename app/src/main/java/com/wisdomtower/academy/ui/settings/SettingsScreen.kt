package com.wisdomtower.academy.ui.settings

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Adjust
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.VolumeDown
import androidx.compose.material.icons.filled.VolumeMute
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.ripple
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

/**
 * Native Settings screen strictly mirroring website reference:
 * - src/app/settings/page.tsx
 *
 * Header card:
 * - Student avatar, full name, VERIFIED badge, academic level, "Edit Profile" and "Account" navigation buttons
 *
 * 6 Stacked Accordion Sections:
 * 1. Study Goals & Target Milestones
 * 2. Notifications & Study Alerts
 * 3. Game Sound
 * 4. Reading & Display
 * 5. Offline Data & Cloud Sync
 * 6. Security
 */
@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier,
    onNavigateToUrl: (String) -> Unit
) {
    val context = LocalContext.current
    val prefsStorage = remember { context.getSharedPreferences("wt_settings_prefs", Context.MODE_PRIVATE) }

    val currentProfile by AuthStateManager.currentProfile.collectAsState()
    val currentUser by AuthStateManager.currentUser.collectAsState()
    val isLoggedIn by AuthStateManager.isLoggedIn.collectAsState()

    val displayName = currentProfile?.fullName ?: currentUser?.fullName ?: if (isLoggedIn) "Enrolled Student" else "Guest Scholar"
    val academicLevel = currentProfile?.educationLevel ?: "Academic Scholar"
    val institution = currentProfile?.schoolName

    // Section expanded states
    var openStudy by remember { mutableStateOf(false) }
    var openNotifs by remember { mutableStateOf(false) }
    var openAudio by remember { mutableStateOf(false) }
    var openDisplay by remember { mutableStateOf(false) }
    var openStorage by remember { mutableStateOf(false) }
    var openSecurity by remember { mutableStateOf(false) }

    // Section 1: Study Goals
    var dailyGoalMinutes by remember { mutableIntStateOf(currentProfile?.dailyStudyGoalMinutes ?: prefsStorage.getInt("daily_study_goal_minutes", 45)) }
    var targetExam by remember { mutableStateOf(currentProfile?.targetExam ?: prefsStorage.getString("target_exam", "") ?: "") }
    var targetScore by remember { mutableStateOf(currentProfile?.targetScore ?: prefsStorage.getString("target_score", "") ?: "") }
    var studyWindow by remember { mutableStateOf(prefsStorage.getString("preferred_study_time", "evening") ?: "evening") }

    // Section 2: Notifications
    var notifDailyStudy by remember { mutableStateOf(prefsStorage.getBoolean("notif_daily_study", true)) }
    var notifExams by remember { mutableStateOf(prefsStorage.getBoolean("notif_exams", true)) }
    var notifWeeklyDigest by remember { mutableStateOf(prefsStorage.getBoolean("notif_weekly_digest", true)) }

    // Section 3: Game Sound
    var soundEffects by remember { mutableStateOf(prefsStorage.getBoolean("sound_effects", true)) }
    var soundVolume by remember { mutableFloatStateOf(prefsStorage.getFloat("sound_volume", 0.5f)) }

    // Section 4: Reading & Display
    var fontSize by remember { mutableStateOf(prefsStorage.getString("font_size", "normal") ?: "normal") }

    // Section 5: Offline Data
    var syncMessage by remember { mutableStateOf<String?>(null) }
    var isSyncing by remember { mutableStateOf(false) }

    // Section 6: Security
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordSuccess by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // TOP HEADER: Student Identity & Actions
            item(key = "settings_header_card") {
                WisdomModernCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 20.dp,
                    borderColor = WisdomBorderWhite
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                modifier = Modifier.weight(1f),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(CircleShape)
                                        .background(WisdomCyan.copy(alpha = 0.15f))
                                        .border(BorderStroke(1.5.dp, WisdomCyan.copy(alpha = 0.5f)), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Person,
                                        contentDescription = null,
                                        tint = WisdomCyan,
                                        modifier = Modifier.size(26.dp)
                                    )
                                }

                                Column {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = displayName,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White
                                        )
                                        Box(
                                            modifier = Modifier
                                                .clip(CircleShape)
                                                .background(Color.White.copy(alpha = 0.08f))
                                                .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape)
                                                .padding(horizontal = 6.dp, vertical = 1.dp)
                                        ) {
                                            Text(
                                                text = "VERIFIED",
                                                fontSize = 8.5.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color.White
                                            )
                                        }
                                    }

                                    Text(
                                        text = if (institution.isNullOrBlank()) academicLevel else "$academicLevel · $institution",
                                        fontSize = 11.5.sp,
                                        color = WisdomMuted,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Header Action Buttons: "Edit Profile" & "Account"
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(WisdomCyan.copy(alpha = 0.12f))
                                    .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.4f)), RoundedCornerShape(12.dp))
                                    .clickable { onNavigateToUrl("/account") }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Person, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(text = "Edit Profile", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = WisdomCyan)
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color.White.copy(alpha = 0.05f))
                                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                    .clickable { onNavigateToUrl("/account") }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Color.White, modifier = Modifier.size(13.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(text = "Account", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                }
                            }
                        }
                    }
                }
            }

            // SECTION 1: Study Goals & Target Milestones
            item(key = "section_1_study") {
                SettingsAccordionCard(
                    icon = Icons.Default.Adjust,
                    title = "Study Goals & Target Milestones",
                    subtitle = "Daily target ($dailyGoalMinutes mins), study hours, and exam targets",
                    isExpanded = openStudy,
                    onToggle = { openStudy = !openStudy }
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        Text(
                            text = "DAILY STUDY TARGET (MINUTES PER DAY)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = WisdomMuted,
                            letterSpacing = 0.5.sp
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf(15, 30, 45, 60, 90, 120).forEach { mins ->
                                val isSelected = dailyGoalMinutes == mins
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSelected) Color.White else Color.White.copy(alpha = 0.04f))
                                        .border(BorderStroke(1.dp, if (isSelected) Color.White else WisdomBorderWhite), RoundedCornerShape(10.dp))
                                        .clickable {
                                            dailyGoalMinutes = mins
                                            prefsStorage.edit().putInt("daily_study_goal_minutes", mins).apply()
                                        }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${mins}m",
                                        fontSize = 11.5.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) Color.Black else Color.White
                                    )
                                }
                            }
                        }

                        OutlinedTextField(
                            value = targetExam,
                            onValueChange = {
                                targetExam = it
                                prefsStorage.edit().putString("target_exam", it).apply()
                            },
                            label = { Text("Target Milestone / Exam", fontSize = 11.sp) },
                            placeholder = { Text("e.g. University Exit Exam or Matriculation", fontSize = 11.sp, color = WisdomMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = settingsFieldColors()
                        )

                        OutlinedTextField(
                            value = targetScore,
                            onValueChange = {
                                targetScore = it
                                prefsStorage.edit().putString("target_score", it).apply()
                            },
                            label = { Text("Target Score / GPA", fontSize = 11.sp) },
                            placeholder = { Text("e.g. 3.85 GPA or 90%+", fontSize = 11.sp, color = WisdomMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = settingsFieldColors()
                        )

                        Text(
                            text = "PREFERRED DAILY STUDY WINDOW",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = WisdomMuted,
                            letterSpacing = 0.5.sp
                        )

                        val windows = listOf(
                            "morning" to ("Early Morning" to "5:00 AM – 8:00 AM"),
                            "afternoon" to ("Afternoon" to "1:00 PM – 4:00 PM"),
                            "evening" to ("Evening" to "6:00 PM – 9:00 PM"),
                            "night" to ("Late Night" to "10:00 PM – 1:00 AM")
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            windows.take(2).forEach { (id, pair) ->
                                val isSelected = studyWindow == id
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSelected) Color.White.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f))
                                        .border(BorderStroke(1.dp, if (isSelected) Color.White.copy(alpha = 0.5f) else WisdomBorderWhite), RoundedCornerShape(10.dp))
                                        .clickable {
                                            studyWindow = id
                                            prefsStorage.edit().putString("preferred_study_time", id).apply()
                                        }
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = pair.first, fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                        Text(text = pair.second, fontSize = 9.sp, color = WisdomMuted)
                                    }
                                }
                            }
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            windows.drop(2).forEach { (id, pair) ->
                                val isSelected = studyWindow == id
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSelected) Color.White.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f))
                                        .border(BorderStroke(1.dp, if (isSelected) Color.White.copy(alpha = 0.5f) else WisdomBorderWhite), RoundedCornerShape(10.dp))
                                        .clickable {
                                            studyWindow = id
                                            prefsStorage.edit().putString("preferred_study_time", id).apply()
                                        }
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = pair.first, fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                        Text(text = pair.second, fontSize = 9.sp, color = WisdomMuted)
                                    }
                                }
                            }
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(WisdomCyan)
                                .clickable {
                                    val updated = currentProfile?.copy(
                                        dailyStudyGoalMinutes = dailyGoalMinutes,
                                        targetExam = targetExam,
                                        targetScore = targetScore
                                    )
                                    if (updated != null) {
                                        AuthStateManager.updateProfile(updated)
                                    }
                                    Toast.makeText(context, "Study goals updated", Toast.LENGTH_SHORT).show()
                                }
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Save, contentDescription = null, tint = WisdomDarkOnCyan, modifier = Modifier.size(15.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = "Save Study Goals", fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = WisdomDarkOnCyan)
                            }
                        }
                    }
                }
            }

            // SECTION 2: Notifications & Study Alerts
            item(key = "section_2_notifs") {
                SettingsAccordionCard(
                    icon = Icons.Default.Notifications,
                    title = "Notifications & Study Alerts",
                    subtitle = "Daily reminders, exam alerts, and weekly digest",
                    isExpanded = openNotifs,
                    onToggle = { openNotifs = !openNotifs }
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        ToggleRow(
                            title = "Daily Study Goal Reminder",
                            subtitle = "Receive a prompt to complete your $dailyGoalMinutes-minute daily session.",
                            checked = notifDailyStudy,
                            onCheckedChange = {
                                notifDailyStudy = it
                                prefsStorage.edit().putBoolean("notif_daily_study", it).apply()
                            }
                        )

                        ToggleRow(
                            title = "Exam & Syllabus Updates",
                            subtitle = "Alert when new model exams, past papers, or questions are published.",
                            checked = notifExams,
                            onCheckedChange = {
                                notifExams = it
                                prefsStorage.edit().putBoolean("notif_exams", it).apply()
                            }
                        )

                        ToggleRow(
                            title = "Weekly Performance Digest",
                            subtitle = "Receive a concise weekly summary of your study hours and accuracy.",
                            checked = notifWeeklyDigest,
                            onCheckedChange = {
                                notifWeeklyDigest = it
                                prefsStorage.edit().putBoolean("notif_weekly_digest", it).apply()
                            }
                        )
                    }
                }
            }

            // SECTION 3: Game Sound
            item(key = "section_3_audio") {
                val volumePercent = (soundVolume * 100).toInt()
                val badgeText = if (soundEffects) "$volumePercent% Volume" else "Muted"

                SettingsAccordionCard(
                    icon = Icons.Default.SportsEsports,
                    title = "Game Sound",
                    subtitle = "Audio effects and volume levels for educational games and study challenges",
                    badgeText = badgeText,
                    isExpanded = openAudio,
                    onToggle = { openAudio = !openAudio }
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        ToggleRow(
                            title = "Game Sound Effects",
                            subtitle = "Chimes for interactive minigames and challenges",
                            checked = soundEffects,
                            onCheckedChange = {
                                soundEffects = it
                                prefsStorage.edit().putBoolean("sound_effects", it).apply()
                            }
                        )

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                .padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Game Audio Volume ($volumePercent%)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Reset 50%",
                                    fontSize = 11.sp,
                                    color = WisdomCyan,
                                    modifier = Modifier.clickable {
                                        soundVolume = 0.5f
                                        prefsStorage.edit().putFloat("sound_volume", 0.5f).apply()
                                    }
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.VolumeMute, contentDescription = null, tint = WisdomMuted, modifier = Modifier.size(16.dp))
                                Slider(
                                    value = soundVolume,
                                    onValueChange = {
                                        soundVolume = it
                                        prefsStorage.edit().putFloat("sound_volume", it).apply()
                                    },
                                    valueRange = 0.05f..1f,
                                    modifier = Modifier.weight(1f),
                                    colors = SliderDefaults.colors(
                                        thumbColor = Color.White,
                                        activeTrackColor = Color.White,
                                        inactiveTrackColor = Color.White.copy(alpha = 0.15f)
                                    )
                                )
                                Icon(Icons.Default.VolumeUp, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }

            // SECTION 4: Reading & Display
            item(key = "section_4_display") {
                SettingsAccordionCard(
                    icon = Icons.Default.PhoneAndroid,
                    title = "Reading & Display",
                    subtitle = "Font size and high-contrast typography preview",
                    isExpanded = openDisplay,
                    onToggle = { openDisplay = !openDisplay }
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        Text(text = "1. FONT SIZE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.5.sp)

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(
                                "compact" to ("Compact" to "15.5px"),
                                "normal" to ("Standard" to "16px"),
                                "large" to ("Large" to "18px")
                            ).forEach { (id, pair) ->
                                val isSelected = fontSize == id
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(if (isSelected) Color.White else Color.White.copy(alpha = 0.04f))
                                        .border(BorderStroke(1.dp, if (isSelected) Color.White else WisdomBorderWhite), RoundedCornerShape(12.dp))
                                        .clickable {
                                            fontSize = id
                                            prefsStorage.edit().putString("font_size", id).apply()
                                        }
                                        .padding(vertical = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(text = pair.first, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (isSelected) Color.Black else Color.White)
                                        Text(text = pair.second, fontSize = 10.sp, color = if (isSelected) Color.DarkGray else WisdomMuted)
                                    }
                                }
                            }
                        }

                        Text(text = "2. TYPOGRAPHY STYLE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.5.sp)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Column {
                                Text(text = "Wisdom Tower Signature Bold", fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text(
                                    text = "Geometric sans-serif (Plus Jakarta Sans) with rich weights, punchy headers, and crystal-clear math and equation readability across notes and flashcards.",
                                    fontSize = 11.sp,
                                    color = WisdomMuted,
                                    lineHeight = 15.sp,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }

                        // Sample Preview
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.05f))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                .padding(14.dp)
                        ) {
                            val sampleSize = when (fontSize) {
                                "compact" -> 12.sp
                                "large" -> 15.sp
                                else -> 13.5.sp
                            }
                            Text(
                                text = "Wisdom Tower Academy features a bold, stylized typography system engineered for effortless scanning and long-term concept retention across mobile and desktop displays.",
                                fontSize = sampleSize,
                                color = Color.White,
                                lineHeight = 19.sp
                            )
                        }
                    }
                }
            }

            // SECTION 5: Offline Data & Cloud Sync
            item(key = "section_5_storage") {
                SettingsAccordionCard(
                    icon = Icons.Default.Storage,
                    title = "Offline Data & Cloud Sync",
                    subtitle = "Cached offline data (24.8 MB) and cloud synchronization",
                    isExpanded = openStorage,
                    onToggle = { openStorage = !openStorage }
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        if (syncMessage != null) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(WisdomAccentEmerald.copy(alpha = 0.15f))
                                    .border(BorderStroke(1.dp, WisdomAccentEmerald.copy(alpha = 0.4f)), RoundedCornerShape(10.dp))
                                    .padding(10.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = WisdomAccentEmerald, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(text = syncMessage.orEmpty(), fontSize = 11.5.sp, color = WisdomAccentEmerald, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "Total Cached Offline Data", fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text(
                                    text = "PDF textbooks, summaries, question banks, study logs, and offline assets.",
                                    fontSize = 11.sp,
                                    color = WisdomMuted,
                                    lineHeight = 15.sp
                                )
                            }
                            Text(
                                text = "24.8 MB",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.padding(start = 8.dp)
                            )
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(WisdomCyan)
                                .clickable {
                                    isSyncing = true
                                    syncMessage = "Synced: All offline study notes, practice attempts, and cached data are synchronized with the cloud."
                                    isSyncing = false
                                }
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Refresh, contentDescription = null, tint = WisdomDarkOnCyan, modifier = Modifier.size(15.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (isSyncing) "Syncing..." else "Sync to Cloud",
                                    fontSize = 12.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WisdomDarkOnCyan
                                )
                            }
                        }
                    }
                }
            }

            // SECTION 6: Security
            item(key = "section_6_security") {
                SettingsAccordionCard(
                    icon = Icons.Default.Lock,
                    title = "Security",
                    subtitle = "Change account password",
                    isExpanded = openSecurity,
                    onToggle = { openSecurity = !openSecurity }
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(WisdomAccentAmber.copy(alpha = 0.12f))
                                .border(BorderStroke(1.dp, WisdomAccentAmber.copy(alpha = 0.35f)), RoundedCornerShape(10.dp))
                                .padding(12.dp)
                        ) {
                            Row(verticalAlignment = Alignment.Top) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = WisdomAccentAmber, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(text = "Account Security Notice", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentAmber)
                                    Text(
                                        text = "Your password will be updated and your next login will require this new password. Please make sure you record it securely.",
                                        fontSize = 10.5.sp,
                                        color = Color.White,
                                        lineHeight = 14.sp
                                    )
                                }
                            }
                        }

                        if (passwordSuccess) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(WisdomAccentEmerald.copy(alpha = 0.15f))
                                    .border(BorderStroke(1.dp, WisdomAccentEmerald.copy(alpha = 0.4f)), RoundedCornerShape(10.dp))
                                    .padding(10.dp)
                            ) {
                                Text(text = "Password updated successfully.", fontSize = 11.5.sp, color = WisdomAccentEmerald, fontWeight = FontWeight.SemiBold)
                            }
                        }

                        OutlinedTextField(
                            value = newPassword,
                            onValueChange = { newPassword = it },
                            label = { Text("New Password", fontSize = 11.sp) },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = settingsFieldColors()
                        )

                        OutlinedTextField(
                            value = confirmPassword,
                            onValueChange = { confirmPassword = it },
                            label = { Text("Confirm New Password", fontSize = 11.sp) },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = settingsFieldColors()
                        )

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(WisdomCyan)
                                .clickable {
                                    if (newPassword.length < 6) {
                                        Toast.makeText(context, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                                    } else if (newPassword != confirmPassword) {
                                        Toast.makeText(context, "Passwords do not match", Toast.LENGTH_SHORT).show()
                                    } else {
                                        passwordSuccess = true
                                        newPassword = ""
                                        confirmPassword = ""
                                        Toast.makeText(context, "Password updated successfully", Toast.LENGTH_SHORT).show()
                                    }
                                }
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "Update Password", fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = WisdomDarkOnCyan)
                        }
                    }
                }
            }

            item(key = "settings_bottom_spacer") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
private fun SettingsAccordionCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    badgeText: String? = null,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    content: @Composable () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        borderColor = WisdomBorderWhite
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle)
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = icon, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(20.dp))
                    }

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(text = title, fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            if (badgeText != null) {
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color.White.copy(alpha = 0.08f))
                                        .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape)
                                        .padding(horizontal = 6.dp, vertical = 1.dp)
                                ) {
                                    Text(text = badgeText, fontSize = 8.5.sp, color = WisdomMuted)
                                }
                            }
                        }
                        Text(text = subtitle, fontSize = 11.sp, color = WisdomMuted)
                    }
                }

                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = WisdomMuted,
                    modifier = Modifier.size(20.dp)
                )
            }

            if (isExpanded) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White.copy(alpha = 0.02f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite.copy(alpha = 0.4f)))
                ) {
                    content()
                }
            }
        }
    }
}

@Composable
private fun ToggleRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White.copy(alpha = 0.03f))
            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text(text = subtitle, fontSize = 10.5.sp, color = WisdomMuted, lineHeight = 14.sp)
        }

        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.Black,
                checkedTrackColor = Color.White,
                uncheckedThumbColor = Color.White,
                uncheckedTrackColor = Color.White.copy(alpha = 0.15f),
                uncheckedBorderColor = Color.Transparent
            )
        )
    }
}

@Composable
private fun settingsFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = WisdomCyan,
    unfocusedBorderColor = WisdomBorderWhite,
    focusedContainerColor = Color(0xFF0F1829),
    unfocusedContainerColor = Color(0xFF0F1829),
    focusedTextColor = Color.White,
    unfocusedTextColor = Color.White,
    focusedLabelColor = WisdomCyan,
    unfocusedLabelColor = WisdomMuted
)
