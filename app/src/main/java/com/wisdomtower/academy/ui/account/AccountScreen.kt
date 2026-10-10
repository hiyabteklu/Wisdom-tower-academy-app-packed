package com.wisdomtower.academy.ui.account

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.data.model.StudentIdData
import com.wisdomtower.academy.data.model.StudentIdGenerator
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
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import kotlinx.coroutines.launch

val EDUCATION_LEVEL_OPTIONS = listOf(
    "Freshman", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
    "Remedial", "Senior University / Exit Exam", "Post-Graduate", "Other"
)

val ACADEMIC_STREAM_OPTIONS = listOf(
    "Natural Science", "Social Science", "Electrical & Computer Engineering",
    "Other Engineering", "Medicine & Health Sciences", "Business & Economics",
    "Law & Governance", "General / Other"
)

val ETHIOPIAN_REGION_OPTIONS = listOf(
    "Addis Ababa", "Dire Dawa", "Oromia", "Amhara", "Tigray", "Sidama",
    "Somali", "SNNP", "Benishangul-Gumuz", "Afar", "Gambela", "Harari",
    "South Ethiopia", "Central Ethiopia", "Southwest Ethiopia"
)

data class AvatarPresetOption(
    val id: String,
    val name: String,
    val role: String,
    val color: Color
)

val AVATAR_PRESETS_LIST = listOf(
    AvatarPresetOption("scholar-cyan", "Scholar Cyan", "Analytical Mind", WisdomCyan),
    AvatarPresetOption("scholar-violet", "Scholar Violet", "Creative Scholar", WisdomAccentViolet),
    AvatarPresetOption("scholar-amber", "Scholar Amber", "Dedicated Thinker", WisdomAccentAmber),
    AvatarPresetOption("scholar-emerald", "Scholar Emerald", "Scientific Inquirer", WisdomAccentEmerald),
    AvatarPresetOption("scholar-rose", "Scholar Rose", "Strategic Visionary", WisdomAccentRose),
    AvatarPresetOption("scholar-sky", "Scholar Sky", "Natural Explorer", WisdomAccentSky)
)

/**
 * Native Account screen strictly matching website reference:
 * - Signed-out: Direct port of website login/signup form (src/app/login, src/app/signup)
 * - Signed-in: Flippable 3D Student ID Card, floating folio control bar, 3 numbered verification sections
 */
@Composable
fun AccountScreen(
    modifier: Modifier = Modifier,
    isLoggedIn: Boolean = false,
    userName: String? = null,
    userEmail: String? = null,
    userProfile: UserProfile? = null,
    onSignOut: () -> Unit = {},
    onNavigateToUrl: (String) -> Unit
) {
    val context = LocalContext.current

    if (!isLoggedIn) {
        // Faithful native port of website login/register page design
        NativeAuthFormScreen(
            modifier = modifier,
            onNavigateToUrl = onNavigateToUrl
        )
        return
    }

    // Signed-in state
    var currentProfile by remember(userProfile) {
        mutableStateOf(
            userProfile ?: UserProfile(
                id = "student",
                email = userEmail,
                fullName = userName ?: "Student Scholar",
                firstName = userName?.substringBefore(" "),
                lastName = userName?.substringAfter(" ", ""),
                educationLevel = "Freshman",
                stream = "Natural Science",
                avatarPreset = "scholar-cyan"
            )
        )
    }

    // Calculate live profile score (matching website ProfileCompletionPanel.tsx)
    val profileScore = remember(currentProfile) {
        var score = 0
        if (!currentProfile.firstName.isNullOrBlank() || !currentProfile.fullName.isNullOrBlank()) score += 20
        if (!currentProfile.educationLevel.isNullOrBlank()) score += 20
        if (!currentProfile.stream.isNullOrBlank()) score += 15
        if (!currentProfile.schoolName.isNullOrBlank()) score += 15
        if (!currentProfile.townRegion.isNullOrBlank()) score += 10
        if (!currentProfile.targetExam.isNullOrBlank()) score += 10
        if (!currentProfile.phone.isNullOrBlank()) score += 10
        minOf(100, score)
    }

    val hasCrown = profileScore >= 100

    val studentIdData = remember(currentProfile) {
        StudentIdGenerator.computeStudentId(currentProfile.id, currentProfile)
    }

    var copiedFolio by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Flippable Digital Student ID Card (Front & Back)
            item(key = "flippable_student_id_card") {
                FlippableStudentIdCard(
                    displayName = currentProfile.fullName ?: userName ?: "Student Scholar",
                    idData = studentIdData,
                    userProfile = currentProfile,
                    hasCrown = hasCrown
                )
            }

            // 2. Floating Glassmorphic Pill Control Bar (Folio + Copy, Status, Learning, Preferences, Log Out)
            item(key = "floating_control_bar") {
                FloatingPillControlBar(
                    folioNumber = studentIdData.folioNumber,
                    copiedFolio = copiedFolio,
                    onCopyFolio = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Student Folio", studentIdData.folioNumber))
                        copiedFolio = true
                        Toast.makeText(context, "Student Folio copied to clipboard", Toast.LENGTH_SHORT).show()
                    },
                    onNavigateToUrl = onNavigateToUrl,
                    onSignOut = onSignOut
                )
            }

            // 3. Scholar Profile Verification Panel (Exact 3 numbered steps + fixed width gauge badge)
            item(key = "profile_completion_panel") {
                ScholarProfileVerificationPanel(
                    profile = currentProfile,
                    completionScore = profileScore,
                    onProfileUpdated = { updated ->
                        currentProfile = updated
                        AuthStateManager.updateProfile(updated)
                        Toast.makeText(context, "Profile changes saved successfully", Toast.LENGTH_SHORT).show()
                    }
                )
            }

            // 4. Enrolled Curriculums & Access
            item(key = "enrolled_curriculum_section") {
                EnrolledCurriculumSection(
                    educationLevel = currentProfile.educationLevel ?: "Freshman",
                    onNavigateToUrl = onNavigateToUrl
                )
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

/**
 * Native Auth Form Screen directly matching website src/app/login/page.tsx
 */
@Composable
private fun NativeAuthFormScreen(
    modifier: Modifier = Modifier,
    onNavigateToUrl: (String) -> Unit
) {
    var mode by remember { mutableStateOf<"signin" | "signup">("signin") }
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var fullName by remember { mutableStateOf("") }
    var educationLevel by remember { mutableStateOf("Freshman") }
    var customEducationLevel by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var agreedToTerms by remember { mutableStateOf(true) }
    var levelPickerExpanded by remember { mutableStateOf(false) }
    var noticeText by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Logo & Branding
            item(key = "auth_header") {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(WisdomCyan.copy(alpha = 0.15f))
                            .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.35f)), RoundedCornerShape(16.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.School,
                            contentDescription = null,
                            tint = WisdomCyan,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Text(
                        text = "Wisdom Tower Academy",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        letterSpacing = (-0.5).sp
                    )

                    Text(
                        text = if (mode == "signin") "Sign in to your scholar folio" else "Create your official scholar folio",
                        fontSize = 12.sp,
                        color = WisdomMuted
                    )
                }
            }

            // Auth Card
            item(key = "auth_card") {
                WisdomModernCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 24.dp,
                    borderColor = WisdomBorderWhite
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.verticalGradient(
                                    listOf(Color(0xFF132038), Color(0xFF0E172A), Color(0xFF0A101D))
                                )
                            )
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Top Radiant Highlight
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(2.dp)
                                .background(
                                    Brush.horizontalGradient(
                                        listOf(WisdomCyan, WisdomAccentSky, WisdomCyan)
                                    )
                                )
                        )

                        // Mode Switcher Tabs
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(Color(0xFF070D18))
                                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(14.dp))
                                .padding(4.dp),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (mode == "signin") Color.White.copy(alpha = 0.15f) else Color.Transparent)
                                    .clickable {
                                        mode = "signin"
                                        noticeText = null
                                    }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "Sign In",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (mode == "signin") Color.White else WisdomMuted
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (mode == "signup") Color.White.copy(alpha = 0.15f) else Color.Transparent)
                                    .clickable {
                                        mode = "signup"
                                        noticeText = null
                                    }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "Create Account",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (mode == "signup") Color.White else WisdomMuted
                                )
                            }
                        }

                        // Full Name (Only for signup)
                        if (mode == "signup") {
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "FULL LEGAL NAME",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFCBD5E1),
                                    letterSpacing = 0.5.sp
                                )
                                OutlinedTextField(
                                    value = fullName,
                                    onValueChange = { fullName = it },
                                    placeholder = { Text("e.g. Abebe Bikila", fontSize = 12.5.sp, color = WisdomMuted) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Person, contentDescription = null, tint = WisdomMuted, modifier = Modifier.size(18.dp))
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true,
                                    shape = RoundedCornerShape(12.dp),
                                    colors = fieldColors()
                                )
                            }
                        }

                        // Email or Phone Number
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "EMAIL OR PHONE NUMBER",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFCBD5E1),
                                letterSpacing = 0.5.sp
                            )
                            OutlinedTextField(
                                value = identifier,
                                onValueChange = { identifier = it },
                                placeholder = { Text("name@email.com or 09xxxxxxxx", fontSize = 12.5.sp, color = WisdomMuted) },
                                leadingIcon = {
                                    val icon = if (identifier.contains("@")) Icons.Default.Email else Icons.Default.Phone
                                    Icon(icon, contentDescription = null, tint = WisdomMuted, modifier = Modifier.size(18.dp))
                                },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                colors = fieldColors()
                            )
                        }

                        // Academic Level (Only for signup)
                        if (mode == "signup") {
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "ACADEMIC LEVEL",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFCBD5E1),
                                    letterSpacing = 0.5.sp
                                )
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(Color(0xFF0A101D))
                                        .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                        .clickable { levelPickerExpanded = !levelPickerExpanded }
                                        .padding(horizontal = 14.dp, vertical = 13.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            Icon(Icons.Default.School, contentDescription = null, tint = WisdomMuted, modifier = Modifier.size(18.dp))
                                            Text(
                                                text = educationLevel,
                                                fontSize = 13.sp,
                                                color = Color.White
                                            )
                                        }
                                        Icon(
                                            Icons.Default.KeyboardArrowDown,
                                            contentDescription = null,
                                            tint = WisdomMuted,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }

                                if (levelPickerExpanded) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(Color(0xFF0F1829))
                                            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                                            .padding(vertical = 4.dp)
                                    ) {
                                        EDUCATION_LEVEL_OPTIONS.forEach { opt ->
                                            val isSel = educationLevel == opt
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clickable {
                                                        educationLevel = opt
                                                        levelPickerExpanded = false
                                                    }
                                                    .background(if (isSel) WisdomCyan.copy(alpha = 0.15f) else Color.Transparent)
                                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Text(
                                                    text = opt,
                                                    fontSize = 12.5.sp,
                                                    color = if (isSel) WisdomCyan else Color.White,
                                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal
                                                )
                                                if (isSel) {
                                                    Icon(Icons.Default.Check, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(16.dp))
                                                }
                                            }
                                        }
                                    }
                                }

                                if (educationLevel == "Other") {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    OutlinedTextField(
                                        value = customEducationLevel,
                                        onValueChange = { customEducationLevel = it },
                                        placeholder = { Text("Specify academic level...", fontSize = 12.sp, color = WisdomMuted) },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        shape = RoundedCornerShape(12.dp),
                                        colors = fieldColors()
                                    )
                                }
                            }
                        }

                        // Password Field
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "PASSWORD",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFCBD5E1),
                                    letterSpacing = 0.5.sp
                                )
                                if (mode == "signin") {
                                    Text(
                                        text = "Forgot password?",
                                        fontSize = 11.sp,
                                        color = WisdomCyan,
                                        fontWeight = FontWeight.Medium,
                                        modifier = Modifier.clickable {
                                            onNavigateToUrl("/forgot-password")
                                        }
                                    )
                                }
                            }

                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                placeholder = { Text("••••••••", fontSize = 13.sp, color = WisdomMuted) },
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, contentDescription = null, tint = WisdomMuted, modifier = Modifier.size(18.dp))
                                },
                                trailingIcon = {
                                    Icon(
                                        imageVector = if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = null,
                                        tint = WisdomMuted,
                                        modifier = Modifier
                                            .size(18.dp)
                                            .clickable { showPassword = !showPassword }
                                    )
                                },
                                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                colors = fieldColors()
                            )
                        }

                        // Confirm Password (Only for signup)
                        if (mode == "signup") {
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "CONFIRM PASSWORD",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFCBD5E1),
                                    letterSpacing = 0.5.sp
                                )
                                OutlinedTextField(
                                    value = confirmPassword,
                                    onValueChange = { confirmPassword = it },
                                    placeholder = { Text("••••••••", fontSize = 13.sp, color = WisdomMuted) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, contentDescription = null, tint = WisdomMuted, modifier = Modifier.size(18.dp))
                                    },
                                    visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true,
                                    shape = RoundedCornerShape(12.dp),
                                    colors = fieldColors()
                                )
                            }

                            // Terms Agreement Checkbox
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = agreedToTerms,
                                    onCheckedChange = { agreedToTerms = it },
                                    colors = CheckboxDefaults.colors(
                                        checkedColor = WisdomCyan,
                                        checkmarkColor = Color(0xFF090D16)
                                    )
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "I agree to Terms of Service and Privacy Policy.",
                                    fontSize = 11.5.sp,
                                    color = Color(0xFFCBD5E1)
                                )
                            }
                        }

                        // Notice Text
                        noticeText?.let { notice ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF1E293B).copy(alpha = 0.8f))
                                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp))
                                    .padding(10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = notice,
                                    fontSize = 11.5.sp,
                                    color = WisdomAccentAmber,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }

                        // Primary Submit Button
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isLoading) WisdomCyan.copy(alpha = 0.6f) else WisdomCyan)
                                .clickable(enabled = !isLoading) {
                                    val id = identifier.trim()
                                    if (id.isBlank()) {
                                        noticeText = "Please enter your email or phone number."
                                        return@clickable
                                    }
                                    if (password.isBlank()) {
                                        noticeText = "Please enter your password."
                                        return@clickable
                                    }
                                    if (mode == "signup") {
                                        if (fullName.trim().isBlank()) {
                                            noticeText = "Please enter your full legal name."
                                            return@clickable
                                        }
                                        if (password.length < 6) {
                                            noticeText = "Password must be at least 6 characters."
                                            return@clickable
                                        }
                                        if (password != confirmPassword) {
                                            noticeText = "Passwords do not match."
                                            return@clickable
                                        }
                                        if (!agreedToTerms) {
                                            noticeText = "Please accept the Terms of Service to continue."
                                            return@clickable
                                        }
                                    }

                                    isLoading = true
                                    noticeText = null

                                    // Hand off through authenticated web session for live Supabase sign-in
                                    val authTargetUrl = if (mode == "signin") {
                                        "/login?identifier=${android.net.Uri.encode(id)}"
                                    } else {
                                        "/signup?identifier=${android.net.Uri.encode(id)}&name=${android.net.Uri.encode(fullName)}"
                                    }
                                    onNavigateToUrl(authTargetUrl)
                                    isLoading = false
                                }
                                .padding(vertical = 14.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isLoading) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        color = WisdomDarkOnCyan,
                                        strokeWidth = 2.dp
                                    )
                                    Text(
                                        text = if (mode == "signin") "Signing In..." else "Creating Account...",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = WisdomDarkOnCyan
                                    )
                                }
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = if (mode == "signin") "Sign In" else "Create Account",
                                        fontSize = 13.5.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = WisdomDarkOnCyan
                                    )
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                        contentDescription = null,
                                        tint = WisdomDarkOnCyan,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }

                        // Bottom Switcher
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            if (mode == "signin") {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(text = "Don't have an account?", fontSize = 12.sp, color = WisdomMuted)
                                    Text(
                                        text = "Create a free account",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = WisdomCyan,
                                        modifier = Modifier.clickable {
                                            mode = "signup"
                                            noticeText = null
                                        }
                                    )
                                }
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(text = "Already have an account?", fontSize = 12.sp, color = WisdomMuted)
                                    Text(
                                        text = "Sign in here",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = WisdomCyan,
                                        modifier = Modifier.clickable {
                                            mode = "signin"
                                            noticeText = null
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Flippable 3D Student ID Card mirroring website StudentIdCard.tsx
 */
@Composable
private fun FlippableStudentIdCard(
    displayName: String,
    idData: StudentIdData,
    userProfile: UserProfile?,
    hasCrown: Boolean
) {
    var isFlipped by remember { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(durationMillis = 500),
        label = "card_flip"
    )

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Card Box with 3D Y rotation
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .graphicsLayer {
                    rotationY = rotation
                    cameraDistance = 12f * density
                }
                .clickable { isFlipped = !isFlipped }
        ) {
            if (rotation <= 90f) {
                // FRONT FACE
                StudentIdCardFront(
                    displayName = displayName,
                    idData = idData,
                    userProfile = userProfile,
                    hasCrown = hasCrown
                )
            } else {
                // BACK FACE (rotated 180 so it appears upright)
                Box(modifier = Modifier.graphicsLayer { rotationY = 180f }) {
                    StudentIdCardBack(
                        idData = idData
                    )
                }
            }
        }

        // Tap Card to Flip Button
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(Color.White.copy(alpha = 0.05f))
                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(20.dp))
                .clickable { isFlipped = !isFlipped }
                .padding(horizontal = 14.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = null,
                    tint = WisdomCyan,
                    modifier = Modifier.size(13.dp)
                )
                Text(
                    text = if (isFlipped) "View front side" else "Tap card to flip",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFCBD5E1)
                )
            }
        }
    }
}

/**
 * FRONT FACE of Student ID Card
 */
@Composable
private fun StudentIdCardFront(
    displayName: String,
    idData: StudentIdData,
    userProfile: UserProfile?,
    hasCrown: Boolean
) {
    val borderColor = if (hasCrown) WisdomAccentAmber.copy(alpha = 0.7f) else WisdomCyan.copy(alpha = 0.4f)
    val cardBg = if (hasCrown) {
        listOf(Color(0xFF1E1A11), Color(0xFF0F1424), Color(0xFF090D18))
    } else {
        listOf(Color(0xFF121C32), Color(0xFF0D1527), Color(0xFF0A1020))
    }

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
        borderWidth = if (hasCrown) 1.5.dp else 1.dp,
        borderColor = borderColor
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(cardBg))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Institutional Top Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color.White.copy(alpha = 0.06f))
                            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.School,
                            contentDescription = null,
                            tint = if (hasCrown) WisdomAccentAmber else WisdomCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Wisdom Tower Academy",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = "OFFICIAL STUDENT CREDENTIAL",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WisdomMuted,
                            letterSpacing = 0.8.sp
                        )
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(WisdomAccentEmerald)
                        )
                        Text(
                            text = idData.status,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = WisdomAccentEmerald,
                            letterSpacing = 0.5.sp
                        )
                    }
                    Text(
                        text = "ETHIOPIA",
                        fontSize = 8.sp,
                        fontFamily = FontFamily.Monospace,
                        color = WisdomMuted,
                        letterSpacing = 0.5.sp
                    )
                }
            }

            // Main Card Body (Avatar, Legal Name, ID, Folio, Scope)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Avatar with VERIFIED badge
                Box(
                    contentAlignment = Alignment.BottomCenter
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(if (hasCrown) WisdomAccentAmber.copy(alpha = 0.15f) else WisdomCyan.copy(alpha = 0.12f))
                            .border(
                                BorderStroke(1.5.dp, if (hasCrown) WisdomAccentAmber else WisdomCyan.copy(alpha = 0.5f)),
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (hasCrown) Icons.Default.EmojiEvents else Icons.Default.Person,
                            contentDescription = null,
                            tint = if (hasCrown) WisdomAccentAmber else WisdomCyan,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(Color(0xFF0F172A))
                            .border(BorderStroke(0.8.dp, WisdomCyan.copy(alpha = 0.5f)), CircleShape)
                            .padding(horizontal = 5.dp, vertical = 1.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(7.dp))
                            Text(
                                text = "VERIFIED",
                                fontSize = 7.sp,
                                fontWeight = FontWeight.Bold,
                                color = WisdomCyan,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }

                // Student Metadata Information
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = "FULL LEGAL NAME",
                        fontSize = 7.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WisdomMuted,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = displayName,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "STUDENT ID NO.",
                                fontSize = 7.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = WisdomMuted,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = idData.idNumber,
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (hasCrown) WisdomAccentAmber else WisdomCyan,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Column {
                            Text(
                                text = "REGISTRY FOLIO",
                                fontSize = 7.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = WisdomMuted,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = idData.folioNumber,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFCBD5E1),
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    Text(
                        text = "${userProfile?.educationLevel ?: idData.academicTrack} · ${userProfile?.stream ?: "Core Curriculum"}",
                        fontSize = 10.sp,
                        color = if (hasCrown) WisdomAccentAmber.copy(alpha = 0.9f) else WisdomCyan.copy(alpha = 0.85f),
                        fontWeight = FontWeight.Medium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Bottom Validity Bar with Barcode
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(1.dp)) {
                    Text(
                        text = "Issued: ${idData.issueDateFull} · Valid: ${idData.expiryDateFull}",
                        fontSize = 8.5.sp,
                        color = WisdomMuted
                    )
                    Text(
                        text = "${userProfile?.schoolName ?: idData.institutionName} (${userProfile?.townRegion ?: "Ethiopia"})",
                        fontSize = 8.5.sp,
                        color = WisdomMuted.copy(alpha = 0.8f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Realistic Barcode Graphic
                Column(horizontalAlignment = Alignment.End) {
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color.White)
                            .padding(horizontal = 4.dp, vertical = 2.dp),
                        horizontalArrangement = Arrangement.spacedBy(1.5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val barWidths = listOf(1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3)
                        barWidths.forEach { w ->
                            Box(
                                modifier = Modifier
                                    .width(w.dp)
                                    .height(14.dp)
                                    .background(Color.Black)
                            )
                        }
                    }
                    Text(
                        text = idData.numericId,
                        fontSize = 7.sp,
                        fontFamily = FontFamily.Monospace,
                        color = WisdomMuted,
                        letterSpacing = 1.sp
                    )
                }
            }
        }
    }
}

/**
 * BACK FACE of Student ID Card (Institutional Terms, Validity, Registrar Seal)
 */
@Composable
private fun StudentIdCardBack(
    idData: StudentIdData
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
        borderWidth = 1.dp,
        borderColor = WisdomBorderWhite
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFF121C32), Color(0xFF0D1527), Color(0xFF0A1020))
                    )
                )
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Terms Header
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = "INSTITUTIONAL TERMS & CONDITIONS",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "This digital credential certifies active enrollment in Wisdom Tower Academy. It authorizes the named scholar to access designated curriculum repositories, examination simulations, and academic resource hubs.",
                    fontSize = 8.5.sp,
                    color = WisdomMuted,
                    lineHeight = 11.5.sp
                )
            }

            // 4-Item Information Box
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color.White.copy(alpha = 0.03f))
                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp))
                    .padding(8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Column {
                        Text(text = "ACADEMIC REGISTRY", fontSize = 7.5.sp, color = WisdomMuted)
                        Text(text = "Wisdom Tower Academy", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Column {
                        Text(text = "OFFICIAL SUPPORT", fontSize = 7.5.sp, color = WisdomMuted)
                        Text(text = "support@wisdomtower.tech", fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = WisdomCyan)
                    }
                }

                Column(verticalArrangement = Arrangement.spacedBy(6.dp), horizontalAlignment = Alignment.End) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "VALIDITY PERIOD", fontSize = 7.5.sp, color = WisdomMuted)
                        Text(text = "1 Academic Year", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "CREDENTIAL VERIFICATION", fontSize = 7.5.sp, color = WisdomMuted)
                        Text(text = "wisdomtower.tech/verify", fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = Color.White)
                    }
                }
            }

            // Registrar Signature & Seal
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "AUTHORIZATION SEAL", fontSize = 7.5.sp, fontFamily = FontFamily.Monospace, color = WisdomMuted)
                    Text(
                        text = "Academic Affairs Registrar",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WisdomCyan
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "REF: ${idData.idNumber}", fontSize = 8.sp, fontFamily = FontFamily.Monospace, color = WisdomMuted)
                    Text(
                        text = "DIGITALLY SIGNED & VERIFIED",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        color = WisdomAccentEmerald
                    )
                }
            }
        }
    }
}

/**
 * Floating Glassmorphic Pill Control Bar mirroring website Account page
 */
@Composable
private fun FloatingPillControlBar(
    folioNumber: String,
    copiedFolio: Boolean,
    onCopyFolio: () -> Unit,
    onNavigateToUrl: (String) -> Unit,
    onSignOut: () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 18.dp,
        borderColor = WisdomBorderWhite
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Row 1: Folio Pill with Copy
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.04f))
                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = "Folio", fontSize = 11.sp, color = WisdomMuted)
                    Text(text = folioNumber, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = FontFamily.Monospace)
                }
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.08f))
                        .clickable(onClick = onCopyFolio),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (copiedFolio) Icons.Default.Check else Icons.Default.ContentCopy,
                        contentDescription = "Copy Folio",
                        tint = if (copiedFolio) WisdomAccentEmerald else WisdomCyan,
                        modifier = Modifier.size(13.dp)
                    )
                }
            }

            // Row 2: Action Pills
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                PillActionBtn(
                    label = "Your status",
                    icon = Icons.AutoMirrored.Filled.TrendingUp,
                    tint = WisdomCyan,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToUrl("/learning?tool=analytics") }
                )
                PillActionBtn(
                    label = "Learning Hub",
                    icon = Icons.AutoMirrored.Filled.MenuBook,
                    tint = WisdomAccentEmerald,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToUrl("/learning") }
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                PillActionBtn(
                    label = "Preferences",
                    icon = Icons.Default.Settings,
                    tint = WisdomMuted,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToUrl("/settings") }
                )
                PillActionBtn(
                    label = "Log Out",
                    icon = Icons.AutoMirrored.Filled.Logout,
                    tint = WisdomAccentRose,
                    modifier = Modifier.weight(1f),
                    onClick = onSignOut
                )
            }
        }
    }
}

@Composable
private fun PillActionBtn(
    label: String,
    icon: ImageVector,
    tint: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Color(0xFF0F1829))
            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(color = tint.copy(alpha = 0.2f)),
                onClick = onClick
            )
            .padding(horizontal = 10.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = tint, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = label, fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
    }
}

/**
 * Scholar Profile Verification Panel strictly matching website ProfileCompletionPanel.tsx
 */
@Composable
private fun ScholarProfileVerificationPanel(
    profile: UserProfile,
    completionScore: Int,
    onProfileUpdated: (UserProfile) -> Unit
) {
    var firstName by remember(profile.firstName) { mutableStateOf(profile.firstName ?: "") }
    var lastName by remember(profile.lastName) { mutableStateOf(profile.lastName ?: "") }
    var educationLevel by remember(profile.educationLevel) { mutableStateOf(profile.educationLevel ?: "Freshman") }
    var stream by remember(profile.stream) { mutableStateOf(profile.stream ?: "Natural Science") }
    var schoolName by remember(profile.schoolName) { mutableStateOf(profile.schoolName ?: "") }
    var townRegion by remember(profile.townRegion) { mutableStateOf(profile.townRegion ?: "Addis Ababa") }
    var phone by remember(profile.phone) { mutableStateOf(profile.phone ?: "") }
    var targetExam by remember(profile.targetExam) { mutableStateOf(profile.targetExam ?: "") }
    var selectedAvatarPreset by remember(profile.avatarPreset) { mutableStateOf(profile.avatarPreset ?: "scholar-cyan") }

    var step1Expanded by remember { mutableStateOf(false) }
    var step2Expanded by remember { mutableStateOf(false) }
    var step3Expanded by remember { mutableStateOf(false) }
    var checklistExpanded by remember { mutableStateOf(false) }
    var isSaving by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Completion Gauge Header Card
        WisdomModernCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 16.dp,
            borderColor = if (completionScore >= 100) WisdomAccentAmber.copy(alpha = 0.5f) else WisdomCyan.copy(alpha = 0.35f)
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
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(if (completionScore >= 100) WisdomAccentAmber.copy(alpha = 0.2f) else WisdomCyan.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "$completionScore%",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = if (completionScore >= 100) WisdomAccentAmber else WisdomCyan
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (completionScore >= 100) "Scholar Profile Verified 👑" else "Scholar Profile Verification",
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (completionScore >= 100) WisdomAccentAmber else Color.White
                            )
                            Text(
                                text = if (completionScore >= 100) "👑 Golden Scholar Crown active on student ID" else "Avatar, academic track, institution & phone required",
                                fontSize = 10.5.sp,
                                color = WisdomMuted,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    // Completion percentage badge: softWrap=false, maxLines=1 to prevent vertical text wrap
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(if (completionScore >= 100) WisdomAccentAmber.copy(alpha = 0.15f) else WisdomCyan.copy(alpha = 0.15f))
                            .border(BorderStroke(1.dp, if (completionScore >= 100) WisdomAccentAmber.copy(alpha = 0.5f) else WisdomCyan.copy(alpha = 0.4f)), CircleShape)
                            .padding(horizontal = 9.dp, vertical = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "$completionScore% Complete",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (completionScore >= 100) WisdomAccentAmber else WisdomCyan,
                            maxLines = 1,
                            softWrap = false
                        )
                    }
                }

                // Expandable Checklist Trigger
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { checklistExpanded = !checklistExpanded }
                        .padding(top = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (checklistExpanded) "Hide verification checklist" else "View 7 verification milestones",
                        fontSize = 10.5.sp,
                        color = WisdomCyan,
                        fontWeight = FontWeight.Medium
                    )
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomCyan,
                        modifier = Modifier.size(16.dp)
                    )
                }

                AnimatedVisibility(visible = checklistExpanded) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White.copy(alpha = 0.03f))
                            .padding(8.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        val milestones = listOf(
                            "Character Avatar & Legal Name" to (firstName.isNotBlank()),
                            "Education Level" to (educationLevel.isNotBlank()),
                            "Academic Stream" to (stream.isNotBlank()),
                            "School / University" to (schoolName.isNotBlank()),
                            "Town / Region" to (townRegion.isNotBlank()),
                            "Target Exam" to (targetExam.isNotBlank()),
                            "Contact Phone" to (phone.isNotBlank())
                        )
                        milestones.forEach { (label, done) ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = if (done) "✓" else "○",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (done) WisdomAccentEmerald else WisdomMuted
                                )
                                Text(
                                    text = label,
                                    fontSize = 10.sp,
                                    color = if (done) Color.White else WisdomMuted
                                )
                            }
                        }
                    }
                }
            }
        }

        // STEP 1: Avatar & Legal Identity
        StepAccordionCard(
            stepNumber = 1,
            title = "Character Avatar & Legal Identity",
            subtitle = "Select your scholar avatar preset, first and last name",
            isFilled = firstName.isNotBlank(),
            isExpanded = step1Expanded,
            onToggle = { step1Expanded = !step1Expanded }
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(text = "ACADEMIC CHARACTER AVATAR", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.5.sp)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(AVATAR_PRESETS_LIST) { preset ->
                        val selected = selectedAvatarPreset == preset.id
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (selected) preset.color.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, if (selected) preset.color else WisdomBorderWhite), RoundedCornerShape(12.dp))
                                .clickable { selectedAvatarPreset = preset.id }
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(text = preset.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (selected) preset.color else Color.White)
                                Text(text = preset.role, fontSize = 9.sp, color = WisdomMuted)
                            }
                        }
                    }
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = firstName,
                        onValueChange = { firstName = it },
                        label = { Text("First Name", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        colors = fieldColors()
                    )
                    OutlinedTextField(
                        value = lastName,
                        onValueChange = { lastName = it },
                        label = { Text("Last Name", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        colors = fieldColors()
                    )
                }
            }
        }

        // STEP 2: Academic Curriculum, Track & Institution
        StepAccordionCard(
            stepNumber = 2,
            title = "Academic Curriculum, Track & Institution",
            subtitle = "Academic level, stream, university/school, and region",
            isFilled = schoolName.isNotBlank(),
            isExpanded = step2Expanded,
            onToggle = { step2Expanded = !step2Expanded }
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(text = "EDUCATION LEVEL", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.5.sp)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(EDUCATION_LEVEL_OPTIONS) { level ->
                        val selected = educationLevel == level
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selected) WisdomCyan.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, if (selected) WisdomCyan else WisdomBorderWhite), RoundedCornerShape(10.dp))
                                .clickable { educationLevel = level }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(text = level, fontSize = 11.sp, color = if (selected) WisdomCyan else Color.White, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                        }
                    }
                }

                Text(text = "STREAM / ACADEMIC TRACK", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.5.sp)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(ACADEMIC_STREAM_OPTIONS) { st ->
                        val selected = stream == st
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selected) WisdomAccentPurple.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, if (selected) WisdomAccentPurple else WisdomBorderWhite), RoundedCornerShape(10.dp))
                                .clickable { stream = st }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(text = st, fontSize = 11.sp, color = if (selected) WisdomAccentPurple else Color.White, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                        }
                    }
                }

                OutlinedTextField(
                    value = schoolName,
                    onValueChange = { schoolName = it },
                    label = { Text("School / University Name", fontSize = 11.sp) },
                    placeholder = { Text("e.g. Addis Ababa University", fontSize = 11.sp, color = WisdomMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    colors = fieldColors()
                )

                Text(text = "TOWN / REGION IN ETHIOPIA", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = WisdomMuted, letterSpacing = 0.5.sp)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(ETHIOPIAN_REGION_OPTIONS) { reg ->
                        val selected = townRegion == reg
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selected) WisdomAccentEmerald.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f))
                                .border(BorderStroke(1.dp, if (selected) WisdomAccentEmerald else WisdomBorderWhite), RoundedCornerShape(10.dp))
                                .clickable { townRegion = reg }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(text = reg, fontSize = 11.sp, color = if (selected) WisdomAccentEmerald else Color.White, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                        }
                    }
                }
            }
        }

        // STEP 3: Contact Phone & Target Exam
        StepAccordionCard(
            stepNumber = 3,
            title = "Contact Phone & Target Exam",
            subtitle = "Phone number, target national exam, and score goal",
            isFilled = phone.isNotBlank() || targetExam.isNotBlank(),
            isExpanded = step3Expanded,
            onToggle = { step3Expanded = !step3Expanded }
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Phone Number (Optional)", fontSize = 11.sp) },
                    placeholder = { Text("e.g. 0911223344", fontSize = 11.sp, color = WisdomMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    colors = fieldColors()
                )

                OutlinedTextField(
                    value = targetExam,
                    onValueChange = { targetExam = it },
                    label = { Text("Target Exam / Goal", fontSize = 11.sp) },
                    placeholder = { Text("e.g. National Matric, Exit Exam, GPA 3.8+", fontSize = 11.sp, color = WisdomMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    colors = fieldColors()
                )
            }
        }

        // Save Button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(WisdomCyan)
                .clickable {
                    isSaving = true
                    val composedName = listOf(firstName.trim(), lastName.trim()).filter { it.isNotBlank() }.joinToString(" ")
                    val updated = profile.copy(
                        fullName = if (composedName.isNotBlank()) composedName else profile.fullName,
                        firstName = firstName.trim(),
                        lastName = lastName.trim(),
                        educationLevel = educationLevel,
                        stream = stream,
                        schoolName = schoolName.trim(),
                        townRegion = townRegion,
                        phone = phone.trim(),
                        targetExam = targetExam.trim(),
                        avatarPreset = selectedAvatarPreset
                    )
                    onProfileUpdated(updated)
                    isSaving = false
                }
                .padding(vertical = 12.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                Icon(imageVector = Icons.Default.Save, contentDescription = null, tint = WisdomDarkOnCyan, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isSaving) "Saving Changes..." else "Save Profile Changes",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomDarkOnCyan
                )
            }
        }
    }
}

@Composable
private fun StepAccordionCard(
    stepNumber: Int,
    title: String,
    subtitle: String,
    isFilled: Boolean,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    content: @Composable () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 14.dp,
        borderColor = WisdomBorderWhite
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle)
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Box(
                        modifier = Modifier
                            .size(26.dp)
                            .clip(CircleShape)
                            .background(WisdomCyan.copy(alpha = 0.15f))
                            .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.4f)), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "$stepNumber", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                    }

                    Column {
                        Text(text = title, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(text = subtitle, fontSize = 10.5.sp, color = WisdomMuted)
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(if (isFilled) WisdomAccentEmerald.copy(alpha = 0.15f) else WisdomAccentAmber.copy(alpha = 0.15f))
                            .border(BorderStroke(1.dp, if (isFilled) WisdomAccentEmerald.copy(alpha = 0.4f) else WisdomAccentAmber.copy(alpha = 0.4f)), CircleShape)
                            .padding(horizontal = 7.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (isFilled) "Filled" else "Required",
                            fontSize = 9.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isFilled) WisdomAccentEmerald else WisdomAccentAmber
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = WisdomMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            if (isExpanded) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White.copy(alpha = 0.02f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite.copy(alpha = 0.5f)))
                ) {
                    content()
                }
            }
        }
    }
}

/**
 * Enrolled Curriculum Section matching website Orders / Enrolled Courses
 */
@Composable
private fun EnrolledCurriculumSection(
    educationLevel: String,
    onNavigateToUrl: (String) -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        borderColor = WisdomBorderWhite
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "CURRICULUM ENROLLMENTS",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomMuted,
                    letterSpacing = 0.5.sp
                )
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(WisdomAccentEmerald.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "100% Free Access",
                        fontSize = 9.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = WisdomAccentEmerald
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF0F1829))
                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(12.dp))
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Active Academic Pass: $educationLevel",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "All books, question banks, flashcards, exams & life savers unlocked",
                        fontSize = 10.5.sp,
                        color = WisdomMuted
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(WisdomCyan.copy(alpha = 0.15f))
                        .clickable { onNavigateToUrl("/learning") }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "Study →",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = WisdomCyan
                    )
                }
            }
        }
    }
}

@Composable
private fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = WisdomCyan,
    unfocusedBorderColor = WisdomBorderWhite,
    focusedContainerColor = Color(0xFF0F1829),
    unfocusedContainerColor = Color(0xFF0F1829),
    focusedTextColor = Color.White,
    unfocusedTextColor = Color.White,
    focusedLabelColor = WisdomCyan,
    unfocusedLabelColor = WisdomMuted
)
