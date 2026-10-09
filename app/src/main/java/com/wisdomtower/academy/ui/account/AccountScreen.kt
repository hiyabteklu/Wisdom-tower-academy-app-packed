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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Login
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Verified
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
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
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import com.wisdomtower.academy.ui.theme.WisdomPrimaryButton
import com.wisdomtower.academy.ui.theme.WisdomSecondaryButton
import com.wisdomtower.academy.data.model.StudentIdData
import com.wisdomtower.academy.data.model.StudentIdGenerator
import com.wisdomtower.academy.data.model.UserProfile
import com.wisdomtower.academy.data.repository.AcademyRepository

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
    var copiedFolio by remember { mutableStateOf(false) }
    val studentIdData = remember(userProfile, isLoggedIn) {
        StudentIdGenerator.computeStudentId(userProfile?.id, userProfile)
    }
    val studentFolio = studentIdData.folioNumber
    val displayName = userProfile?.fullName ?: userName ?: if (isLoggedIn) "Student Scholar" else "Guest Scholar"
    val email = userProfile?.email ?: userEmail

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // Header
            item(key = "account_header") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Student Command Center",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Your digital student identity, active enrollments, and academic status.",
                        fontSize = 13.sp,
                        color = WisdomMuted,
                        lineHeight = 18.sp
                    )
                }
            }

            // Digital Student ID Card
            item(key = "student_id_card") {
                DigitalStudentIdCard(
                    displayName = displayName,
                    idData = studentIdData,
                    isLoggedIn = isLoggedIn,
                    userEmail = email,
                    userProfile = userProfile,
                    onCopyFolio = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Student Folio", studentFolio))
                        copiedFolio = true
                        Toast.makeText(context, "Student Folio copied to clipboard", Toast.LENGTH_SHORT).show()
                    },
                    copied = copiedFolio
                )
            }

            // Quick Floating Action Pills (Status, Learning Hub, Preferences, Sign In/Out)
            item(key = "quick_actions_bar") {
                WisdomModernCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 16.dp,
                    borderColor = WisdomBorderWhite
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            AccountPillButton(
                                label = "Your Status",
                                icon = Icons.AutoMirrored.Filled.TrendingUp,
                                tint = WisdomCyan,
                                modifier = Modifier.weight(1f),
                                onClick = { onNavigateToUrl("/learning?tool=status") }
                            )

                            AccountPillButton(
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
                            AccountPillButton(
                                label = "Preferences",
                                icon = Icons.Default.Settings,
                                tint = WisdomMuted,
                                modifier = Modifier.weight(1f),
                                onClick = { onNavigateToUrl("/settings") }
                            )

                            if (isLoggedIn) {
                                AccountPillButton(
                                    label = "Sign Out",
                                    icon = Icons.AutoMirrored.Filled.Logout,
                                    tint = WisdomAccentRose,
                                    modifier = Modifier.weight(1f),
                                    onClick = onSignOut
                                )
                            } else {
                                AccountPillButton(
                                    label = "Sign In",
                                    icon = Icons.AutoMirrored.Filled.Login,
                                    tint = WisdomAccentAmber,
                                    modifier = Modifier.weight(1f),
                                    onClick = { onNavigateToUrl("/login") }
                                )
                            }
                        }
                    }
                }
            }

            // Enrolled Packages / Active Passes
            item(key = "enrolled_section") {
                val enrolledPasses = remember(isLoggedIn) {
                    AcademyRepository.getEnrolledPackages(isLoggedIn)
                }

                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Active Course Access",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 10.dp)
                    )

                    if (enrolledPasses.isNotEmpty()) {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            enrolledPasses.forEach { pass ->
                                WisdomModernCard(
                                    modifier = Modifier.fillMaxWidth(),
                                    cornerRadius = 14.dp,
                                    borderColor = WisdomBorderWhite,
                                    onClick = { onNavigateToUrl(pass.packagePath) }
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(36.dp)
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(WisdomCyan.copy(alpha = 0.15f)),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.School,
                                                    contentDescription = null,
                                                    tint = WisdomCyan,
                                                    modifier = Modifier.size(20.dp)
                                                )
                                            }
                                            Column {
                                                Text(
                                                    text = pass.packageName,
                                                    fontSize = 13.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.White
                                                )
                                                Text(
                                                    text = pass.source,
                                                    fontSize = 11.sp,
                                                    color = WisdomMuted
                                                )
                                            }
                                        }

                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .clip(CircleShape)
                                                    .background(WisdomAccentEmerald.copy(alpha = 0.15f))
                                                    .border(BorderStroke(1.dp, WisdomAccentEmerald.copy(alpha = 0.4f)), CircleShape)
                                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                                            ) {
                                                Text(
                                                    text = "Active",
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = WisdomAccentEmerald
                                                )
                                            }

                                            WisdomOpenButton(
                                                onClick = { onNavigateToUrl(pass.packagePath) },
                                                label = "Study →"
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        WisdomModernCard(
                            modifier = Modifier.fillMaxWidth(),
                            cornerRadius = 14.dp,
                            borderColor = WisdomBorderWhite
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "No active course passes",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Sign in to activate full academic curriculum passes and offline storage.",
                                    fontSize = 12.sp,
                                    color = WisdomMuted
                                )
                            }
                        }
                    }
                }
            }

            // Profile Completion Prompt if signed in, or Sign In banner if guest
            item(key = "auth_prompt") {
                if (!isLoggedIn) {
                    WisdomModernCard(
                        modifier = Modifier.fillMaxWidth(),
                        cornerRadius = 14.dp,
                        borderColor = WisdomAccentAmber.copy(alpha = 0.4f)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(
                                text = "Create Your Free Academy Account",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Sign in to synchronize study progress, save notebook sheets, track mock exam scores, and access offline vaults.",
                                fontSize = 12.sp,
                                color = WisdomMuted,
                                lineHeight = 17.sp
                            )
                            WisdomPrimaryButton(
                                text = "Sign In / Register",
                                onClick = { onNavigateToUrl("/login") },
                                modifier = Modifier.fillMaxWidth(),
                                icon = {
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                        contentDescription = null,
                                        tint = WisdomDarkOnCyan,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
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

@Composable
private fun DigitalStudentIdCard(
    displayName: String,
    idData: StudentIdData,
    isLoggedIn: Boolean,
    userEmail: String?,
    userProfile: UserProfile?,
    onCopyFolio: () -> Unit,
    copied: Boolean
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
        borderWidth = 1.dp,
        borderColor = WisdomCyan.copy(alpha = 0.4f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF132238),
                            Color(0xFF091220)
                        )
                    )
                )
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
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(WisdomCyan.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Badge,
                            contentDescription = null,
                            tint = WisdomCyan,
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
                            color = WisdomCyan,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(if (isLoggedIn) WisdomAccentEmerald.copy(alpha = 0.15f) else WisdomCyan.copy(alpha = 0.15f))
                        .border(
                            BorderStroke(1.dp, if (isLoggedIn) WisdomAccentEmerald.copy(alpha = 0.5f) else WisdomCyan.copy(alpha = 0.4f)),
                            CircleShape
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = if (isLoggedIn) idData.status else "GUEST ACCESS",
                        fontSize = 9.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isLoggedIn) WisdomAccentEmerald else WisdomCyan,
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
                        .background(WisdomCyan.copy(alpha = 0.12f))
                        .border(BorderStroke(2.dp, WisdomCyan.copy(alpha = 0.5f)), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = WisdomCyan,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = displayName,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        text = userEmail ?: "Higher Education Stream",
                        fontSize = 11.sp,
                        color = WisdomMuted
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${idData.academicTrack} · ${idData.institutionName}",
                        fontSize = 10.5.sp,
                        color = WisdomCyan.copy(alpha = 0.85f),
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
                        color = WisdomCyan,
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
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.08f))
                        .clickable(onClick = onCopyFolio),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (copied) Icons.Default.Check else Icons.Default.ContentCopy,
                        contentDescription = "Copy Folio",
                        tint = if (copied) WisdomAccentEmerald else Color.White,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun AccountPillButton(
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
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = tint,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
    }
}
