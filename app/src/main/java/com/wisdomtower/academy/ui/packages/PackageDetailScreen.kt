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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.ripple
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentPurple
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCardBorderSubtle
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import com.wisdomtower.academy.ui.theme.WisdomOpenButton
import com.wisdomtower.academy.ui.theme.WisdomPrimaryButton
import com.wisdomtower.academy.ui.theme.WisdomSecondaryButton
import com.wisdomtower.academy.ui.theme.WisdomTextPrimary

@Composable
fun PackageDetailScreen(
    pkg: NativePackage,
    onBack: () -> Unit,
    onStartLearning: (String) -> Unit,
    onUnlock: (String) -> Unit,
    isLoggedIn: Boolean = false,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val isFreshman = pkg.id == "freshman"

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Top Navigation Bar
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
                        text = pkg.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Hero Visual Card
            item(key = "hero_card") {
                WisdomModernCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f),
                    cornerRadius = 18.dp
                ) {
                    AsyncImage(
                        model = ImageRequest.Builder(context)
                            .data(pkg.assetImage)
                            .crossfade(true)
                            .build(),
                        contentDescription = pkg.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color(0x99000000),
                                        Color(0xEE060B15)
                                    )
                                )
                            )
                    )

                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(14.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = pkg.enrolledLabel,
                                fontSize = 11.sp,
                                color = WisdomMuted,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = pkg.name,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                    }
                }
            }

            // Description & CTAs
            item(key = "description_and_actions") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = pkg.description,
                        fontSize = 13.sp,
                        color = WisdomMuted,
                        lineHeight = 19.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        WisdomPrimaryButton(
                            text = "Start Learning",
                            onClick = { onStartLearning(pkg.path) },
                            modifier = Modifier.fillMaxWidth(),
                            icon = {
                                Icon(
                                    imageVector = Icons.Default.School,
                                    contentDescription = null,
                                    tint = WisdomDarkOnCyan,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        )
                    }
                }
            }

            // Quick Study Hub Launchers (Phase C Handoffs: Textbooks, Notes, Flashcards, Questions, Exams, Tutor, Progress)
            item(key = "study_hubs_launchers") {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Study Resources & Handoffs",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 10.dp, bottom = 10.dp)
                    )

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        item {
                            PackageResourceChip(
                                title = "Textbooks",
                                icon = Icons.AutoMirrored.Filled.MenuBook,
                                color = WisdomCyan,
                                onClick = { onStartLearning("${pkg.path}/books") }
                            )
                        }
                        item {
                            PackageResourceChip(
                                title = "Short Notes",
                                icon = Icons.Default.Description,
                                color = WisdomAccentAmber,
                                onClick = { onStartLearning("${pkg.path}/short-notes") }
                            )
                        }
                        item {
                            PackageResourceChip(
                                title = "Flashcards",
                                icon = Icons.Default.Layers,
                                color = WisdomAccentRose,
                                onClick = { onStartLearning("${pkg.path}/flashcards") }
                            )
                        }
                        item {
                            PackageResourceChip(
                                title = "Question Banks",
                                icon = Icons.Default.Quiz,
                                color = WisdomAccentPurple,
                                onClick = { onStartLearning("${pkg.path}/question-banks") }
                            )
                        }
                        item {
                            PackageResourceChip(
                                title = "Practice Exams",
                                icon = Icons.AutoMirrored.Filled.Assignment,
                                color = WisdomAccentEmerald,
                                onClick = { onStartLearning("${pkg.path}/exams") }
                            )
                        }
                        item {
                            PackageResourceChip(
                                title = "AI Tutor",
                                icon = Icons.Default.AutoAwesome,
                                color = WisdomCyan,
                                onClick = { onStartLearning("/learning?tool=tutor") }
                            )
                        }
                        item {
                            PackageResourceChip(
                                title = "Progress Tracker",
                                icon = Icons.Default.BarChart,
                                color = WisdomAccentSky,
                                onClick = { onStartLearning("/learning?tool=analytics") }
                            )
                        }
                    }
                }
            }

            // What's Included Section
            item(key = "includes_header") {
                Text(
                    text = "What is Included",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            items(pkg.includes) { feature ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF111B2E).copy(alpha = 0.5f))
                        .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(10.dp))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = WisdomCyan,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = feature,
                        fontSize = 12.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Included Courses / Subjects (For Freshman and Multi-subject programs)
            if (isFreshman) {
                item(key = "subjects_header") {
                    Text(
                        text = "Included Courses (20+)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 10.dp)
                    )
                }

                items(FRESHMAN_SUBJECTS) { subject ->
                    SubjectRowCard(
                        subject = subject,
                        onClick = { onStartLearning(subject.path) }
                    )
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}

@Composable
fun SubjectRowCard(
    subject: NativeSubject,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 12.dp,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Subject Thumbnail
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(WisdomDark)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(subject.assetImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = subject.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            // Subject Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = subject.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subject.description,
                    fontSize = 11.sp,
                    color = WisdomMuted,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 14.sp
                )
            }

            // Open Action
            WisdomOpenButton(onClick = onClick, label = "Study →")
        }
    }
}

@Composable
private fun PackageResourceChip(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.width(112.dp),
        cornerRadius = 14.dp,
        borderColor = WisdomBorderWhite,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.14f))
                    .border(BorderStroke(1.dp, color.copy(alpha = 0.45f)), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = color,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
