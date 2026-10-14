package com.wisdomtower.academy.ui.account

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Shield
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.data.model.UserProfile
import com.wisdomtower.academy.ui.auth.NativeSignInScreen
import com.wisdomtower.academy.ui.competition.CompetitionPointsCard
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentFuchsia
import com.wisdomtower.academy.ui.theme.WisdomAccentPurple
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomGlassCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import kotlin.math.roundToInt

// ---------------------------------------------------------------------------
// Option lists: copied from the website (S4 item d). Never invent options here:
// the chosen value is written to the same Supabase `profiles` row the website uses.
//  - levels:  website-reference/src/lib/academic-levels.ts  (ACADEMIC_LEVEL_OPTIONS)
//  - streams, regions, avatar presets: website-reference/src/lib/profile.ts
// ---------------------------------------------------------------------------
val EDUCATION_LEVEL_OPTIONS = listOf(
    "Grade 9", "Grade 10", "Grade 11", "Grade 12",
    "Remedial", "Freshman", "3rd Year (ECE)", "Other"
)

val ACADEMIC_STREAM_OPTIONS = listOf(
    "Natural Science",
    "Social Science",
    "Electrical & Computer Engineering (ECE)",
    "Software Engineering / Computer Science",
    "Civil / Mechanical Engineering",
    "Medicine / Health Sciences",
    "Accounting & Finance",
    "Economics & Management",
    "Law & Jurisprudence",
    "General / Undeclared"
)

val ETHIOPIAN_REGION_OPTIONS = listOf(
    "Addis Ababa", "Oromia", "Amhara", "Tigray", "Sidama",
    "Central Ethiopia", "South Ethiopia", "South West Ethiopia",
    "Dire Dawa", "Harari", "Somali", "Afar", "Benishangul-Gumuz", "Gambela"
)

/**
 * One avatar. `id`, `name` and `role` are the website's AVATAR_PRESETS (website-reference/src/lib/profile.ts).
 * `gradient` are the website's three gradient colours (Tailwind values); `icon` is the closest Material
 * icon to the website's Lucide icon (GraduationCap, Cpu, Atom, HeartPulse, Code2, Compass, Scale, Zap).
 */
data class AvatarPresetOption(
    val id: String,
    val name: String,
    val role: String,
    val accent: Color,
    val gradient: List<Color>,
    val icon: ImageVector
)

val AVATAR_PRESETS_LIST = listOf(
    AvatarPresetOption(
        "scholar-cyan", "Apex Scholar", "Academic Excellence", WisdomCyan,
        listOf(Color(0xFF06B6D4), Color(0xFF0284C7), Color(0xFF1D4ED8)), Icons.Default.School
    ),
    AvatarPresetOption(
        "engineer-amber", "Architect & Engineer", "Engineering & Tech", WisdomAccentAmber,
        listOf(Color(0xFFFBBF24), Color(0xFFF97316), Color(0xFFD97706)), Icons.Default.Memory
    ),
    AvatarPresetOption(
        "scientist-emerald", "Natural Scientist", "Research & Discovery", WisdomAccentEmerald,
        listOf(Color(0xFF34D399), Color(0xFF0D9488), Color(0xFF0E7490)), Icons.Default.Science
    ),
    AvatarPresetOption(
        "doctor-rose", "Medical Pioneer", "Health & Medicine", WisdomAccentRose,
        listOf(Color(0xFFF43F5E), Color(0xFFDB2777), Color(0xFFB91C1C)), Icons.Default.Favorite
    ),
    AvatarPresetOption(
        "coder-violet", "Software Innovator", "Computing & AI", WisdomAccentViolet,
        listOf(Color(0xFFA855F7), Color(0xFF7C3AED), Color(0xFF4338CA)), Icons.Default.Code
    ),
    AvatarPresetOption(
        "astronomer-sky", "Cosmic Explorer", "Physics & Astronomy", WisdomAccentSky,
        listOf(Color(0xFF38BDF8), Color(0xFF2563EB), Color(0xFF3730A3)), Icons.Default.Explore
    ),
    AvatarPresetOption(
        "lawyer-gold", "Social Thinker", "Social Sciences & Law", WisdomAccentAmber,
        listOf(Color(0xFFFACC15), Color(0xFFF59E0B), Color(0xFF44403C)), Icons.Default.Gavel
    ),
    AvatarPresetOption(
        "visionary-neon", "Future Leader", "Leadership & Impact", WisdomAccentFuchsia,
        listOf(Color(0xFFD946EF), Color(0xFFEC4899), Color(0xFFF97316)), Icons.Default.FlashOn
    )
)

// Crown / gold tones (metal look: light, mid, deep, edge)
private val GoldLight = Color(0xFFFFF1B8)
private val GoldMid = Color(0xFFF2C14E)
private val GoldDeep = Color(0xFFC48A14)
private val GoldEdge = Color(0xFF8A5A0C)

// Text colour on a filled (selected) pill
private val PillOnAccent = Color(0xFF06101F)

/**
 * Native Account screen.
 * - Signed-out: native sign-in / create-account screen (ui/auth/NativeSignInScreen.kt), a copy of
 *   the website login page that talks to Supabase directly (S2d). On success the session is stored
 *   by AuthStateManager.applyNativeSession and this screen switches to the signed-in view.
 * - Signed-in (T7, owner request 2026-10-13): "My Profile" gauge card (real score, premium crown at 100%),
 *   three profile sections with avatar grid and wrapping pill selectors (nothing is cut off to the right),
 *   Save, and Log Out as the LAST item. The student ID card, the "tap to flip" button and the
 *   folio / status / preferences / log-out box were removed.
 * - Competition points (owner decision B, session O): a small card above the profile panel with the
 *   cumulative competition points total from the server (ui/competition/CompetitionPointsCard.kt).
 *
 * S4 item d: no invented defaults (stream, region) and no invented enrollment card.
 * Not ported: the website's Admin button (shown only for admin e-mails).
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
        NativeSignInScreen(
            modifier = modifier,
            onSuccess = { result -> AuthStateManager.applyNativeSession(result) },
            onForgotPassword = { onNavigateToUrl("/forgot-password") },
            onOpenTerms = { onNavigateToUrl("/terms") },
            onOpenPrivacy = { onNavigateToUrl("/privacy") }
        )
        return
    }

    // Signed-in state. When no saved profile exists yet, start empty (the website does the same);
    // "Student Scholar" is the website's own display-name fallback.
    var currentProfile by remember(userProfile) {
        mutableStateOf(
            userProfile ?: UserProfile(
                id = "student",
                email = userEmail,
                fullName = userName,
                firstName = userName?.substringBefore(" "),
                lastName = userName?.substringAfter(" ", "")
            )
        )
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item(key = "competition_points") {
                CompetitionPointsCard()
            }

            item(key = "my_profile_panel") {
                MyProfilePanel(
                    profile = currentProfile,
                    fallbackName = userName,
                    onProfileUpdated = { updated ->
                        currentProfile = updated
                        AuthStateManager.updateProfile(updated)
                        Toast.makeText(context, "Saved", Toast.LENGTH_SHORT).show()
                    },
                    onSignOut = onSignOut
                )
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

private fun initialsOf(name: String): String =
    name.trim()
        .split(Regex("\\s+"))
        .filter { it.isNotEmpty() }
        .take(2)
        .joinToString("") { it.take(1) }
        .uppercase()

/** iOS-like press feedback: a quick, slightly bouncy shrink while the finger is down. */
@Composable
private fun pressScale(interactionSource: MutableInteractionSource, pressed: Float = 0.96f): Float {
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) pressed else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
        label = "press_scale"
    )
    return scale
}

// ---------------------------------------------------------------------------
// My Profile: panel (hero + sections + save + log out)
// ---------------------------------------------------------------------------

/**
 * Same fields, option lists, defaults and score rules as the website ProfileCompletionPanel.tsx.
 * The completion score is computed live from the form state, exactly like the website.
 */
@Composable
private fun MyProfilePanel(
    profile: UserProfile,
    fallbackName: String?,
    onProfileUpdated: (UserProfile) -> Unit,
    onSignOut: () -> Unit
) {
    // Website defaults: first/last name from full name; level "Freshman"; stream, region empty; avatar scholar-cyan
    var firstName by remember(profile.firstName, profile.fullName) {
        mutableStateOf(
            profile.firstName?.takeIf { it.isNotBlank() }
                ?: profile.fullName?.trim()?.substringBefore(" ").orEmpty()
        )
    }
    var lastName by remember(profile.lastName, profile.fullName) {
        mutableStateOf(
            profile.lastName?.takeIf { it.isNotBlank() }
                ?: profile.fullName?.trim()?.substringAfter(" ", "").orEmpty()
        )
    }
    var educationLevel by remember(profile.educationLevel) {
        mutableStateOf(profile.educationLevel?.takeIf { it.isNotBlank() } ?: "Freshman")
    }
    var stream by remember(profile.stream) { mutableStateOf(profile.stream ?: "") }
    var schoolName by remember(profile.schoolName) { mutableStateOf(profile.schoolName ?: "") }
    var townRegion by remember(profile.townRegion) { mutableStateOf(profile.townRegion ?: "") }
    var phone by remember(profile.phone) { mutableStateOf(profile.phone ?: "") }
    var targetExam by remember(profile.targetExam) { mutableStateOf(profile.targetExam ?: "") }
    var selectedAvatarPreset by remember(profile.avatarPreset) {
        mutableStateOf(profile.avatarPreset?.takeIf { it.isNotBlank() } ?: "scholar-cyan")
    }
    // Website stores the free-text level under "Other" in bio as "Custom Level: ..."
    var customLevel by remember(profile.bio) {
        mutableStateOf(
            profile.bio?.takeIf { it.startsWith("Custom Level: ") }?.removePrefix("Custom Level: ") ?: ""
        )
    }

    var step1Expanded by remember { mutableStateOf(false) }
    var step2Expanded by remember { mutableStateOf(false) }
    var step3Expanded by remember { mutableStateOf(false) }

    val hasName = firstName.isNotBlank() || !profile.fullName.isNullOrBlank()
    val completionScore = run {
        var score = 0
        if (hasName) score += 20
        if (educationLevel.isNotBlank()) score += 20
        if (stream.isNotBlank()) score += 15
        if (schoolName.isNotBlank()) score += 15
        if (townRegion.isNotBlank()) score += 10
        if (targetExam.isNotBlank()) score += 10
        if (phone.isNotBlank()) score += 10
        minOf(100, score)
    }

    val composedName = listOf(firstName.trim(), lastName.trim()).filter { it.isNotBlank() }.joinToString(" ")
    val displayName = composedName.ifBlank {
        profile.fullName?.takeIf { it.isNotBlank() }
            ?: fallbackName?.takeIf { it.isNotBlank() }
            ?: "Student Scholar"
    }
    val selectedPreset = AVATAR_PRESETS_LIST.firstOrNull { it.id == selectedAvatarPreset }

    // Every item that adds to the score is listed (the website list had no "Target Exam" although it is worth 10 points)
    val milestones = listOf(
        "Legal Name" to hasName,
        "Academic Level" to educationLevel.isNotBlank(),
        "Stream" to stream.isNotBlank(),
        "Institution" to schoolName.isNotBlank(),
        "Region" to townRegion.isNotBlank(),
        "Phone" to phone.isNotBlank(),
        "Target Exam" to targetExam.isNotBlank()
    )

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        MyProfileHero(
            score = completionScore,
            displayName = displayName,
            avatar = selectedPreset,
            milestones = milestones
        )

        // STEP 1: Avatar & Legal Identity
        StepAccordionCard(
            stepNumber = 1,
            title = "Character Avatar & Legal Identity",
            subtitle = "Select your scholar avatar preset, first and last name",
            isFilled = hasName,
            unfilledLabel = "Required",
            isExpanded = step1Expanded,
            onToggle = { step1Expanded = !step1Expanded }
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                FieldLabel("ACADEMIC CHARACTER AVATAR")
                AvatarPicker(
                    selectedId = selectedAvatarPreset,
                    onSelect = { selectedAvatarPreset = it }
                )

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = firstName,
                        onValueChange = { firstName = it },
                        label = { Text("First Name", fontSize = 11.sp) },
                        placeholder = { Text("e.g. Abebe", fontSize = 11.sp, color = WisdomMuted) },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        colors = fieldColors()
                    )
                    OutlinedTextField(
                        value = lastName,
                        onValueChange = { lastName = it },
                        label = { Text("Last Name", fontSize = 11.sp) },
                        placeholder = { Text("e.g. Bikila", fontSize = 11.sp, color = WisdomMuted) },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
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
            isFilled = educationLevel.isNotBlank() && stream.isNotBlank() && schoolName.isNotBlank() && townRegion.isNotBlank(),
            unfilledLabel = "Incomplete",
            isExpanded = step2Expanded,
            onToggle = { step2Expanded = !step2Expanded }
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                FieldLabel("EDUCATION LEVEL")
                PillSelector(
                    options = EDUCATION_LEVEL_OPTIONS,
                    selected = educationLevel,
                    accent = WisdomCyan,
                    onSelect = { educationLevel = it }
                )

                if (educationLevel == "Other") {
                    OutlinedTextField(
                        value = customLevel,
                        onValueChange = { customLevel = it },
                        label = { Text("Specify Your Academic Level", fontSize = 11.sp) },
                        placeholder = { Text("e.g. Master's Degree, College Diploma, Self-learner...", fontSize = 11.sp, color = WisdomMuted) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        colors = fieldColors()
                    )
                }

                FieldLabel("STREAM / ACADEMIC TRACK")
                PillSelector(
                    options = ACADEMIC_STREAM_OPTIONS,
                    selected = stream,
                    accent = WisdomAccentPurple,
                    onSelect = { stream = it }
                )

                OutlinedTextField(
                    value = schoolName,
                    onValueChange = { schoolName = it },
                    label = { Text("School / University Name", fontSize = 11.sp) },
                    placeholder = { Text("e.g. Addis Ababa University / Millenium High", fontSize = 11.sp, color = WisdomMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    colors = fieldColors()
                )

                FieldLabel("TOWN / REGION IN ETHIOPIA")
                PillSelector(
                    options = ETHIOPIAN_REGION_OPTIONS,
                    selected = townRegion,
                    accent = WisdomAccentEmerald,
                    onSelect = { townRegion = it }
                )
            }
        }

        // STEP 3: Contact Phone & Target Exam
        StepAccordionCard(
            stepNumber = 3,
            title = "Contact Phone & Target Exam",
            subtitle = "Phone number, target national exam, and score goal",
            isFilled = phone.isNotBlank() && targetExam.isNotBlank(),
            unfilledLabel = "Incomplete",
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
                    shape = RoundedCornerShape(14.dp),
                    colors = fieldColors()
                )

                OutlinedTextField(
                    value = targetExam,
                    onValueChange = { targetExam = it },
                    label = { Text("Target Exam / Goal", fontSize = 11.sp) },
                    placeholder = { Text("e.g. National Matric, Exit Exam, GPA 3.8+", fontSize = 11.sp, color = WisdomMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    colors = fieldColors()
                )
            }
        }

        SaveProfileButton(
            onClick = {
                // Website: bio is only rewritten while the level is "Other"
                val newBio = if (educationLevel == "Other") {
                    if (customLevel.isNotBlank()) "Custom Level: ${customLevel.trim()}" else ""
                } else {
                    profile.bio
                }
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
                    avatarPreset = selectedAvatarPreset,
                    bio = newBio
                )
                onProfileUpdated(updated)
            }
        )

        // Log Out is the LAST item of the screen (owner request 2026-10-13)
        Spacer(modifier = Modifier.height(6.dp))
        LogOutButton(onClick = onSignOut)
    }
}

// ---------------------------------------------------------------------------
// Hero: gauge + avatar + premium crown
// ---------------------------------------------------------------------------

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun MyProfileHero(
    score: Int,
    displayName: String,
    avatar: AvatarPresetOption?,
    milestones: List<Pair<String, Boolean>>
) {
    val complete = score >= 100
    val progress by animateFloatAsState(
        targetValue = score / 100f,
        animationSpec = tween(durationMillis = 900, easing = FastOutSlowInEasing),
        label = "my_profile_gauge"
    )
    val shownScore = (progress * 100f).roundToInt()
    val accent = if (complete) GoldMid else WisdomCyan
    val doneCount = milestones.count { it.second }

    // The crown fades and bounces in at 100%. No AnimatedVisibility here: inside this Box-in-Column the compiler
    // refuses it ("cannot be called in this context with an implicit receiver", see docs/SESSION_2026-10-13_H.md).
    val crownAlpha by animateFloatAsState(
        targetValue = if (complete) 1f else 0f,
        animationSpec = tween(durationMillis = 600),
        label = "crown_alpha"
    )
    val crownScale by animateFloatAsState(
        targetValue = if (complete) 1f else 0.6f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "crown_scale"
    )

    WisdomGlassCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 24.dp,
        borderWidth = if (complete) 1.5.dp else 1.dp,
        borderColor = if (complete) GoldMid.copy(alpha = 0.6f) else WisdomCyan.copy(alpha = 0.35f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        if (complete) listOf(Color(0xFF1E1A11), Color(0xFF0F1424))
                        else listOf(Color(0xFF121C32), Color(0xFF0D1527))
                    )
                )
                .padding(horizontal = 16.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "MY PROFILE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = accent,
                letterSpacing = 2.sp
            )

            // Gauge with the crown resting on top of the ring (only at 100%)
            Box(contentAlignment = Alignment.TopCenter) {
                Box(modifier = Modifier.padding(top = 26.dp, bottom = 10.dp)) {
                    ProfileGauge(
                        progress = progress,
                        shownScore = shownScore,
                        complete = complete,
                        avatar = avatar,
                        initials = initialsOf(displayName)
                    )
                }
                if (crownAlpha > 0f) {
                    PremiumCrown(
                        modifier = Modifier.graphicsLayer {
                            alpha = crownAlpha
                            scaleX = crownScale
                            scaleY = crownScale
                        }
                    )
                }
            }

            Text(
                text = displayName,
                fontSize = 20.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center
            )

            if (complete) {
                Row(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(GoldMid.copy(alpha = 0.14f))
                        .border(BorderStroke(1.dp, GoldMid.copy(alpha = 0.5f)), CircleShape)
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                ) {
                    Icon(Icons.Default.Shield, contentDescription = null, tint = GoldMid, modifier = Modifier.size(12.dp))
                    Text(text = "Verified", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldMid)
                }
                Text(
                    text = "Golden Scholar Crown active",
                    fontSize = 11.5.sp,
                    color = WisdomMuted,
                    textAlign = TextAlign.Center
                )
            } else {
                Text(
                    text = "Avatar, academic track, institution & phone required",
                    fontSize = 11.5.sp,
                    color = WisdomMuted,
                    textAlign = TextAlign.Center
                )
            }

            Text(
                text = "$doneCount of ${milestones.size} steps complete",
                fontSize = 10.5.sp,
                fontWeight = FontWeight.SemiBold,
                color = accent.copy(alpha = 0.9f)
            )

            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                milestones.forEach { (label, done) ->
                    ChecklistChip(label = label, done = done)
                }
            }
        }
    }
}

@Composable
private fun ChecklistChip(label: String, done: Boolean) {
    Row(
        modifier = Modifier
            .clip(CircleShape)
            .background(if (done) WisdomAccentEmerald.copy(alpha = 0.14f) else Color.White.copy(alpha = 0.05f))
            .border(
                BorderStroke(1.dp, if (done) WisdomAccentEmerald.copy(alpha = 0.4f) else WisdomBorderWhite),
                CircleShape
            )
            .padding(horizontal = 10.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        if (done) {
            Icon(Icons.Default.Check, contentDescription = null, tint = WisdomAccentEmerald, modifier = Modifier.size(11.dp))
        } else {
            Box(
                modifier = Modifier
                    .size(9.dp)
                    .border(BorderStroke(1.2.dp, WisdomMuted), CircleShape)
            )
        }
        Text(
            text = label,
            fontSize = 10.5.sp,
            fontWeight = FontWeight.Medium,
            color = if (done) Color.White else WisdomMuted
        )
    }
}

/** Circular gauge (drawn with Canvas, like the timer ring) with the avatar inside and the percent as a badge. */
@Composable
private fun ProfileGauge(
    progress: Float,
    shownScore: Int,
    complete: Boolean,
    avatar: AvatarPresetOption?,
    initials: String
) {
    Box(modifier = Modifier.size(132.dp), contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val stroke = 9.dp.toPx()
            val inset = stroke / 2f
            val arcSize = Size(size.width - stroke, size.height - stroke)
            val topLeft = Offset(inset, inset)

            if (complete) {
                // soft golden glow behind the ring
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(GoldMid.copy(alpha = 0.30f), Color.Transparent),
                        center = center,
                        radius = size.minDimension / 2f
                    ),
                    radius = size.minDimension / 2f,
                    center = center
                )
            }

            // track
            drawArc(
                color = Color.White.copy(alpha = 0.08f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = stroke)
            )

            if (progress > 0f) {
                if (complete) {
                    rotate(-90f) {
                        drawArc(
                            brush = Brush.sweepGradient(listOf(GoldLight, GoldMid, GoldDeep, GoldMid, GoldLight)),
                            startAngle = 0f,
                            sweepAngle = 360f * progress,
                            useCenter = false,
                            topLeft = topLeft,
                            size = arcSize,
                            style = Stroke(width = stroke, cap = StrokeCap.Round)
                        )
                    }
                } else {
                    drawArc(
                        color = WisdomCyan,
                        startAngle = -90f,
                        sweepAngle = 360f * progress,
                        useCenter = false,
                        topLeft = topLeft,
                        size = arcSize,
                        style = Stroke(width = stroke, cap = StrokeCap.Round)
                    )
                }
            }
        }

        AvatarDisc(
            preset = avatar,
            initials = initials,
            size = 88.dp,
            iconSize = 40.dp
        )

        // percent badge on the lower edge of the ring
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .offset(y = 10.dp)
                .clip(CircleShape)
                .background(Color(0xFF0B1220))
                .border(
                    BorderStroke(1.dp, if (complete) GoldMid.copy(alpha = 0.7f) else WisdomCyan.copy(alpha = 0.6f)),
                    CircleShape
                )
                .padding(horizontal = 11.dp, vertical = 3.dp)
        ) {
            Text(
                text = "$shownScore%",
                fontSize = 12.sp,
                fontWeight = FontWeight.Black,
                color = if (complete) GoldMid else WisdomCyan,
                maxLines = 1,
                softWrap = false
            )
        }
    }
}

/**
 * Premium crown, drawn as a vector: metallic gold gradient, deeper gold edge, small gems and a slow
 * light sheen that sweeps across now and then. No emoji, no stock icon.
 */
@Composable
private fun PremiumCrown(modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "crown_sheen")
    val sheen by transition.animateFloat(
        initialValue = -0.5f,
        targetValue = 1.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 3600, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "crown_sheen_x"
    )

    Canvas(modifier = modifier.size(width = 66.dp, height = 46.dp)) {
        val w = size.width
        val h = size.height

        val crown = Path().apply {
            moveTo(0.10f * w, 0.80f * h)
            lineTo(0.03f * w, 0.22f * h)
            lineTo(0.28f * w, 0.52f * h)
            lineTo(0.50f * w, 0.07f * h)
            lineTo(0.72f * w, 0.52f * h)
            lineTo(0.97f * w, 0.22f * h)
            lineTo(0.90f * w, 0.80f * h)
            close()
        }
        val metal = Brush.linearGradient(
            colors = listOf(GoldLight, GoldMid, GoldDeep, GoldMid),
            start = Offset(0f, 0f),
            end = Offset(w, h)
        )

        // body
        drawPath(path = crown, brush = metal)
        drawPath(
            path = crown,
            color = GoldEdge.copy(alpha = 0.9f),
            style = Stroke(width = 1.2.dp.toPx(), join = StrokeJoin.Round)
        )

        // base band
        drawRoundRect(
            brush = metal,
            topLeft = Offset(0.08f * w, 0.80f * h),
            size = Size(0.84f * w, 0.16f * h),
            cornerRadius = CornerRadius(3.dp.toPx())
        )
        drawRoundRect(
            color = GoldEdge.copy(alpha = 0.9f),
            topLeft = Offset(0.08f * w, 0.80f * h),
            size = Size(0.84f * w, 0.16f * h),
            cornerRadius = CornerRadius(3.dp.toPx()),
            style = Stroke(width = 1.dp.toPx())
        )

        // light sheen, clipped to the crown shape
        clipPath(crown) {
            val x = sheen * w
            drawRect(
                brush = Brush.linearGradient(
                    colors = listOf(Color.Transparent, Color.White.copy(alpha = 0.65f), Color.Transparent),
                    start = Offset(x - 0.22f * w, 0f),
                    end = Offset(x + 0.22f * w, 0.7f * h)
                )
            )
        }

        // gems on the three tips and one on the band
        val gem = Color(0xFFFFFBEA)
        listOf(
            Offset(0.03f * w, 0.20f * h),
            Offset(0.50f * w, 0.05f * h),
            Offset(0.97f * w, 0.20f * h)
        ).forEach { c ->
            drawCircle(color = GoldEdge, radius = 0.055f * w, center = c)
            drawCircle(color = gem, radius = 0.040f * w, center = c)
        }
        drawCircle(color = GoldEdge, radius = 0.050f * w, center = Offset(0.50f * w, 0.88f * h))
        drawCircle(color = Color(0xFF7DE8FF), radius = 0.036f * w, center = Offset(0.50f * w, 0.88f * h))
    }
}

// ---------------------------------------------------------------------------
// Avatars
// ---------------------------------------------------------------------------

/** Round avatar: the website preset gradient with its icon (or the name initials, like the website fallback). */
@Composable
private fun AvatarDisc(
    preset: AvatarPresetOption?,
    initials: String,
    size: Dp,
    iconSize: Dp,
    modifier: Modifier = Modifier,
    glow: Dp = 0.dp
) {
    val colors = preset?.gradient ?: listOf(Color(0xFF0891B2), Color(0xFF0369A1), Color(0xFF3730A3))
    val glowColor = preset?.accent ?: WisdomCyan
    Box(
        modifier = modifier
            .size(size)
            .shadow(glow, CircleShape, ambientColor = glowColor, spotColor = glowColor)
            .clip(CircleShape)
            .background(Brush.linearGradient(colors))
            .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.25f)), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        // soft gloss on the upper half
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .fillMaxHeight(0.5f)
                .background(Brush.verticalGradient(listOf(Color.White.copy(alpha = 0.22f), Color.Transparent)))
        )
        if (preset != null) {
            Icon(
                imageVector = preset.icon,
                contentDescription = preset.name,
                tint = Color.White,
                modifier = Modifier.size(iconSize)
            )
        } else {
            Text(
                text = initials,
                fontSize = (size.value * 0.34f).sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}

/** 8 avatars in two rows of 4 (everything visible, no sideways scrolling) and the chosen name + role below. */
@Composable
private fun AvatarPicker(selectedId: String, onSelect: (String) -> Unit) {
    val selected = AVATAR_PRESETS_LIST.firstOrNull { it.id == selectedId }
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        AVATAR_PRESETS_LIST.chunked(4).forEach { rowItems ->
            Row(modifier = Modifier.fillMaxWidth()) {
                rowItems.forEach { preset ->
                    Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                        AvatarTile(
                            preset = preset,
                            selected = preset.id == selectedId,
                            onClick = { onSelect(preset.id) }
                        )
                    }
                }
            }
        }
        if (selected != null) {
            Text(
                text = selected.name,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = selected.accent,
                textAlign = TextAlign.Center
            )
            Text(
                text = selected.role,
                fontSize = 10.5.sp,
                color = WisdomMuted,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun AvatarTile(preset: AvatarPresetOption, selected: Boolean, onClick: () -> Unit) {
    val haptic = LocalHapticFeedback.current
    val interaction = remember { MutableInteractionSource() }
    val press = pressScale(interaction, 0.92f)
    val lift by animateFloatAsState(
        targetValue = if (selected) 1.06f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
        label = "avatar_lift"
    )
    val ring by animateFloatAsState(
        targetValue = if (selected) 1f else 0f,
        animationSpec = tween(220),
        label = "avatar_ring"
    )
    val glow by animateDpAsState(
        targetValue = if (selected) 12.dp else 0.dp,
        animationSpec = tween(220),
        label = "avatar_glow"
    )
    val scale = press * lift

    Box(
        modifier = Modifier
            .size(66.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                alpha = 0.72f + 0.28f * ring
            }
            .clickable(
                interactionSource = interaction,
                indication = null,
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    onClick()
                }
            ),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .border(BorderStroke(2.dp, preset.accent.copy(alpha = ring)), CircleShape)
        )
        AvatarDisc(
            preset = preset,
            initials = "",
            size = 54.dp,
            iconSize = 26.dp,
            glow = glow
        )
        if (selected) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(preset.accent)
                    .border(BorderStroke(2.dp, Color(0xFF0B1220)), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Check, contentDescription = null, tint = PillOnAccent, modifier = Modifier.size(11.dp))
            }
        }
    }
}

// ---------------------------------------------------------------------------
// iOS-like pill selectors (wrap onto several lines: nothing hidden to the right)
// ---------------------------------------------------------------------------

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun PillSelector(
    options: List<String>,
    selected: String,
    accent: Color,
    onSelect: (String) -> Unit
) {
    FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        options.forEach { option ->
            PillOption(
                label = option,
                selected = selected == option,
                accent = accent,
                onClick = { onSelect(option) }
            )
        }
    }
}

@Composable
private fun PillOption(label: String, selected: Boolean, accent: Color, onClick: () -> Unit) {
    val haptic = LocalHapticFeedback.current
    val interaction = remember { MutableInteractionSource() }
    val scale = pressScale(interaction, 0.93f)
    val background by animateColorAsState(
        targetValue = if (selected) accent else Color.White.copy(alpha = 0.06f),
        animationSpec = tween(220),
        label = "pill_background"
    )
    val textColor by animateColorAsState(
        targetValue = if (selected) PillOnAccent else Color(0xFFE2E8F0),
        animationSpec = tween(220),
        label = "pill_text"
    )
    val borderColor by animateColorAsState(
        targetValue = if (selected) accent else WisdomBorderWhite,
        animationSpec = tween(220),
        label = "pill_border"
    )
    val glow by animateDpAsState(
        targetValue = if (selected) 10.dp else 0.dp,
        animationSpec = tween(220),
        label = "pill_glow"
    )
    val shape = RoundedCornerShape(50)

    Row(
        modifier = Modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .shadow(glow, shape, ambientColor = accent, spotColor = accent)
            .clip(shape)
            .background(background)
            .border(BorderStroke(1.dp, borderColor), shape)
            .clickable(
                interactionSource = interaction,
                indication = null,
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    onClick()
                }
            )
            .heightIn(min = 38.dp)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        AnimatedVisibility(visible = selected) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Check, contentDescription = null, tint = textColor, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
            }
        }
        Text(
            text = label,
            fontSize = 12.5.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            color = textColor
        )
    }
}

@Composable
private fun FieldLabel(text: String) {
    Text(
        text = text,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = WisdomMuted,
        letterSpacing = 0.8.sp
    )
}

// ---------------------------------------------------------------------------
// Sections, buttons, fields
// ---------------------------------------------------------------------------

@Composable
private fun StepAccordionCard(
    stepNumber: Int,
    title: String,
    subtitle: String,
    isFilled: Boolean,
    unfilledLabel: String,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    content: @Composable () -> Unit
) {
    val chevron by animateFloatAsState(
        targetValue = if (isExpanded) 180f else 0f,
        animationSpec = tween(250),
        label = "step_chevron"
    )

    WisdomGlassCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 18.dp,
        borderColor = WisdomBorderWhite
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle)
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(WisdomCyan.copy(alpha = 0.15f))
                        .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.4f)), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "$stepNumber", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WisdomCyan)
                }

                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(text = title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(text = subtitle, fontSize = 10.5.sp, color = WisdomMuted)
                    Box(
                        modifier = Modifier
                            .padding(top = 4.dp)
                            .clip(CircleShape)
                            .background(if (isFilled) WisdomAccentEmerald.copy(alpha = 0.15f) else WisdomAccentAmber.copy(alpha = 0.15f))
                            .border(
                                BorderStroke(1.dp, if (isFilled) WisdomAccentEmerald.copy(alpha = 0.4f) else WisdomAccentAmber.copy(alpha = 0.4f)),
                                CircleShape
                            )
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (isFilled) "Filled" else unfilledLabel,
                            fontSize = 9.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isFilled) WisdomAccentEmerald else WisdomAccentAmber
                        )
                    }
                }

                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = WisdomMuted,
                    modifier = Modifier
                        .size(20.dp)
                        .graphicsLayer { rotationZ = chevron }
                )
            }

            AnimatedVisibility(visible = isExpanded) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White.copy(alpha = 0.02f))
                ) {
                    content()
                }
            }
        }
    }
}

@Composable
private fun SaveProfileButton(onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val scale = pressScale(interaction, 0.97f)
    val shape = RoundedCornerShape(16.dp)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(shape)
            .background(Brush.horizontalGradient(listOf(WisdomCyan, Color(0xFF38BDF8))))
            .clickable(interactionSource = interaction, indication = null, onClick = onClick)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(imageVector = Icons.Default.Save, contentDescription = null, tint = WisdomDarkOnCyan, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = "Save Profile Changes", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = WisdomDarkOnCyan)
    }
}

@Composable
private fun LogOutButton(onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val scale = pressScale(interaction, 0.97f)
    val shape = RoundedCornerShape(16.dp)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(shape)
            .background(WisdomAccentRose.copy(alpha = 0.12f))
            .border(BorderStroke(1.dp, WisdomAccentRose.copy(alpha = 0.45f)), shape)
            .clickable(interactionSource = interaction, indication = null, onClick = onClick)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.Logout,
            contentDescription = null,
            tint = WisdomAccentRose,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "Log Out", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)
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
