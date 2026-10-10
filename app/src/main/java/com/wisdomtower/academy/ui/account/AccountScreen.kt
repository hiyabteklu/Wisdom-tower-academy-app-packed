package com.wisdomtower.academy.ui.account

import android.content.ClipData
import android.content.ClipboardManager
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Sparkles
import androidx.compose.material3.ripple
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.data.model.StudentIdData
import com.wisdomtower.academy.data.model.StudentIdGenerator
import com.wisdomtower.academy.data.model.UserProfile
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentFuchsia
import com.wisdomtower.academy.ui.theme.WisdomAccentIndigo
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
import com.wisdomtower.academy.ui.theme.WisdomPrimaryButton
import com.wisdomtower.academy.ui.theme.WisdomSecondaryButton

/**
 * Native Account screen strictly matching website reference:
 * - src/app/account/page.tsx
 * - src/components/StudentIdCard.tsx
 * - src/components/account/ProfileCompletionPanel.tsx
 *
 * Signed out: Sends guests to login (login card CTA).
 * Signed in:
 * - Digital Student ID card with verified details & golden crown if 100% complete
 * - Floating glassmorphic pill control bar (Folio + Copy, Your status, Learning Hub, Preferences, Log Out)
 * - Scholar Profile Verification panel (completion gauge, checklist, 3 collapsible steps, Save Profile Changes)
 */

val EDUCATION_LEVEL_OPTIONS = listOf(
    "Grade 9", "Grade 10", "Grade 11", "Grade 12",
    "Remedial", "Freshman", "Senior University / Exit Exam", "Post-Graduate", "Other"
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
        // Website sends guests to login
        GuestLoginView(
            modifier = modifier,
            onSignIn = { onNavigateToUrl("/login") },
            onSignUp = { onNavigateToUrl("/signup") }
        )
        return
    }

    // Signed-in state: read & update live profile
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
            // 1. Digital Student ID Card
            item(key = "student_id_card") {
                DigitalStudentIdCard(
                    displayName = currentProfile.fullName ?: userName ?: "Student Scholar",
                    idData = studentIdData,
                    userEmail = currentProfile.email ?: userEmail,
                    userProfile = currentProfile,
                    hasCrown = hasCrown,
                    onCopyFolio = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Student Folio", studentIdData.folioNumber))
                        copiedFolio = true
                        Toast.makeText(context, "Student Folio copied to clipboard", Toast.LENGTH_SHORT).show()
                    },
                    copied = copiedFolio
                )
            }

            // 2. Floating Glassmorphic Pill Control Bar
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

            // 3. Scholar Profile Verification Panel
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

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

/**
 * Guest Login View matching website when not logged in
 */
@Composable
private fun GuestLoginView(
    modifier: Modifier = Modifier,
    onSignIn: () -> Unit,
    onSignUp: () -> Unit
) {
    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(WisdomCyan.copy(alpha = 0.15f))
                    .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.4f)), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Badge,
                    contentDescription = null,
                    tint = WisdomCyan,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Scholar Sign In Required",
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Sign in to access your official Digital Student ID, save study goals, and manage your academic profile.",
                fontSize = 13.sp,
                color = WisdomMuted,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(28.dp))

            WisdomPrimaryButton(
                text = "Sign In to Account",
                onClick = onSignIn,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            WisdomSecondaryButton(
                text = "Create Free Account",
                onClick = onSignUp,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

/**
 * Digital Student ID Card mirroring website StudentIdCard.tsx
 */
@Composable
private fun DigitalStudentIdCard(
    displayName: String,
    idData: StudentIdData,
    userEmail: String?,
    userProfile: UserProfile?,
    hasCrown: Boolean,
    onCopyFolio: () -> Unit,
    copied: Boolean
) {
    val borderColor = if (hasCrown) WisdomAccentAmber.copy(alpha = 0.8f) else WisdomCyan.copy(alpha = 0.45f)
    val cardBg = if (hasCrown) {
        listOf(Color(0xFF1F1B10), Color(0xFF0F1424))
    } else {
        listOf(Color(0xFF132238), Color(0xFF091220))
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
                .padding(18.dp)
        ) {
            // Card Header
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
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(if (hasCrown) WisdomAccentAmber.copy(alpha = 0.2f) else WisdomCyan.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (hasCrown) Icons.Default.EmojiEvents else Icons.Default.Badge,
                            contentDescription = null,
                            tint = if (hasCrown) WisdomAccentAmber else WisdomCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Wisdom Tower Academy",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = idData.idNumber,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (hasCrown) WisdomAccentAmber else WisdomCyan,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(if (hasCrown) WisdomAccentAmber.copy(alpha = 0.15f) else WisdomAccentEmerald.copy(alpha = 0.15f))
                        .border(
                            BorderStroke(1.dp, if (hasCrown) WisdomAccentAmber.copy(alpha = 0.6f) else WisdomAccentEmerald.copy(alpha = 0.5f)),
                            CircleShape
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = if (hasCrown) "VERIFIED SCHOLAR 👑" else idData.status,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (hasCrown) WisdomAccentAmber else WisdomAccentEmerald,
                        letterSpacing = 0.5.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Student Avatar + Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(if (hasCrown) WisdomAccentAmber.copy(alpha = 0.15f) else WisdomCyan.copy(alpha = 0.12f))
                        .border(BorderStroke(2.dp, if (hasCrown) WisdomAccentAmber else WisdomCyan.copy(alpha = 0.6f)), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = if (hasCrown) WisdomAccentAmber else WisdomCyan,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = displayName,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        if (hasCrown) {
                            Text(text = "👑", fontSize = 14.sp)
                        }
                    }
                    Text(
                        text = userEmail ?: "Higher Education Stream",
                        fontSize = 11.sp,
                        color = WisdomMuted
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${userProfile?.educationLevel ?: idData.academicTrack} · ${userProfile?.schoolName ?: idData.institutionName}",
                        fontSize = 10.5.sp,
                        color = if (hasCrown) WisdomAccentAmber.copy(alpha = 0.9f) else WisdomCyan.copy(alpha = 0.85f),
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Folio Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF070C16).copy(alpha = 0.6f))
                    .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "FOLIO NUMBER",
                        fontSize = 9.sp,
                        color = WisdomMuted,
                        letterSpacing = 0.5.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = idData.folioNumber,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (hasCrown) WisdomAccentAmber else WisdomCyan,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "ISSUED: ${idData.issueDateFull}",
                        fontSize = 8.5.sp,
                        color = WisdomMuted.copy(alpha = 0.7f)
                    )
                }

                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.08f))
                        .clickable(onClick = onCopyFolio),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (copied) Icons.Default.Check else Icons.Default.ContentCopy,
                        contentDescription = "Copy Folio",
                        tint = if (copied) WisdomAccentEmerald else Color.White,
                        modifier = Modifier.size(15.dp)
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
        cornerRadius = 16.dp,
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
                        contentDescription = null,
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
                    .padding(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
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

                        Column {
                            Text(
                                text = if (completionScore >= 100) "Scholar Profile Verified 👑" else "Scholar Profile Verification",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (completionScore >= 100) WisdomAccentAmber else Color.White
                            )
                            Text(
                                text = if (completionScore >= 100) "Golden Scholar Crown active on student ID" else "Avatar, academic track, institution & phone required",
                                fontSize = 11.sp,
                                color = WisdomMuted
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(if (completionScore >= 100) WisdomAccentAmber.copy(alpha = 0.15f) else WisdomCyan.copy(alpha = 0.15f))
                            .border(BorderStroke(1.dp, if (completionScore >= 100) WisdomAccentAmber.copy(alpha = 0.5f) else WisdomCyan.copy(alpha = 0.4f)), CircleShape)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "$completionScore% Complete",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (completionScore >= 100) WisdomAccentAmber else WisdomCyan
                        )
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
