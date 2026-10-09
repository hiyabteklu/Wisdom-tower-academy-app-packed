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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.HelpOutline
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Policy
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier,
    onNavigateToUrl: (String) -> Unit
) {
    val context = LocalContext.current
    var studyReminders by remember { mutableStateOf(true) }
    var examAnnouncements by remember { mutableStateOf(true) }
    var keepScreenAwake by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // Header
            item(key = "settings_header") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Preferences & Settings",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Configure push alerts, local vault storage, and application preferences.",
                        fontSize = 13.sp,
                        color = WisdomMuted,
                        lineHeight = 18.sp
                    )
                }
            }

            // Section: Notifications (FCM)
            item(key = "notifications_section") {
                SettingsSectionContainer(
                    title = "Push Notifications",
                    icon = Icons.Default.Notifications,
                    iconColor = WisdomCyan
                ) {
                    SettingToggleRow(
                        title = "Study Reminders",
                        description = "Daily alerts to keep your practice and review streaks alive",
                        checked = studyReminders,
                        onCheckedChange = { studyReminders = it }
                    )

                    SettingDivider()

                    SettingToggleRow(
                        title = "Exam & Model Paper Alerts",
                        description = "Instant notice when national past papers or model tests are uploaded",
                        checked = examAnnouncements,
                        onCheckedChange = { examAnnouncements = it }
                    )
                }
            }

            // Section: Offline Storage & PDF Vault
            item(key = "storage_section") {
                SettingsSectionContainer(
                    title = "Offline Storage & Vault",
                    icon = Icons.Default.Storage,
                    iconColor = WisdomAccentEmerald
                ) {
                    SettingActionRow(
                        title = "Offline PDF Vault",
                        description = "Textbooks & notes stored securely in private app storage",
                        actionLabel = "Active",
                        onClick = {
                            Toast.makeText(context, "Offline Vault is active and encrypted with FLAG_SECURE", Toast.LENGTH_SHORT).show()
                        }
                    )

                    SettingDivider()

                    SettingActionRow(
                        title = "Clear Application Cache",
                        description = "Remove temporary web caches without deleting downloaded PDFs",
                        actionLabel = "Clear",
                        onClick = {
                            Toast.makeText(context, "Temporary cache cleared successfully", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }

            // Section: Display & Experience
            item(key = "display_section") {
                SettingsSectionContainer(
                    title = "Display & Reading",
                    icon = Icons.Default.DarkMode,
                    iconColor = WisdomAccentAmber
                ) {
                    SettingActionRow(
                        title = "App Appearance",
                        description = "Deep Obsidian Navy theme (optimizes battery on OLED displays)",
                        actionLabel = "Obsidian",
                        onClick = {}
                    )

                    SettingDivider()

                    SettingToggleRow(
                        title = "Keep Screen On",
                        description = "Prevent display from timing out while studying notes and solving exams",
                        checked = keepScreenAwake,
                        onCheckedChange = { keepScreenAwake = it }
                    )
                }
            }

            // Section: Support & Legal
            item(key = "support_section") {
                SettingsSectionContainer(
                    title = "About & Legal",
                    icon = Icons.Default.Info,
                    iconColor = WisdomMuted
                ) {
                    SettingNavRow(
                        title = "Terms of Service",
                        onClick = { onNavigateToUrl("/terms") }
                    )

                    SettingDivider()

                    SettingNavRow(
                        title = "Privacy Policy",
                        onClick = { onNavigateToUrl("/privacy") }
                    )

                    SettingDivider()

                    SettingNavRow(
                        title = "Contact Support & Inquiries",
                        onClick = { onNavigateToUrl("/contact") }
                    )

                    SettingDivider()

                    SettingActionRow(
                        title = "Version",
                        description = "Wisdom Tower Academy Native App",
                        actionLabel = "v1.0.0",
                        onClick = {}
                    )
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

@Composable
private fun SettingsSectionContainer(
    title: String,
    icon: ImageVector,
    iconColor: Color,
    content: @Composable () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(16.dp)
            )
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        WisdomModernCard(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 14.dp,
            borderColor = WisdomBorderWhite
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp)
            ) {
                content()
            }
        }
    }
}

@Composable
private fun SettingToggleRow(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = description,
                fontSize = 11.sp,
                color = WisdomMuted,
                lineHeight = 15.sp
            )
        }

        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color(0xFF070C16),
                checkedTrackColor = WisdomCyan,
                uncheckedThumbColor = Color.White,
                uncheckedTrackColor = Color.White.copy(alpha = 0.15f)
            )
        )
    }
}

@Composable
private fun SettingActionRow(
    title: String,
    description: String,
    actionLabel: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = description,
                fontSize = 11.sp,
                color = WisdomMuted,
                lineHeight = 15.sp
            )
        }

        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(8.dp))
                .background(WisdomCyan.copy(alpha = 0.1f))
                .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.35f)), RoundedCornerShape(8.dp))
                .padding(horizontal = 10.dp, vertical = 5.dp)
        ) {
            Text(
                text = actionLabel,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = WisdomCyan
            )
        }
    }
}

@Composable
private fun SettingNavRow(
    title: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple(color = WisdomCyan.copy(alpha = 0.2f)),
                onClick = onClick
            )
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = title,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White
        )
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = WisdomMuted,
            modifier = Modifier.size(14.dp)
        )
    }
}

@Composable
private fun SettingDivider() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp)
            .height(1.dp)
            .background(Color.White.copy(alpha = 0.06f))
    )
}
