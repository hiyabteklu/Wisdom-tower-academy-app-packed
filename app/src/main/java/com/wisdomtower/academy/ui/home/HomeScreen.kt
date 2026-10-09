package com.wisdomtower.academy.ui.home

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
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
import androidx.compose.foundation.layout.aspectRatio
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
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Park
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentFuchsia
import com.wisdomtower.academy.ui.theme.WisdomAccentIndigo
import com.wisdomtower.academy.ui.theme.WisdomAccentOrange
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

data class ProgramItem(
    val id: String,
    val name: String,
    val path: String,
    val assetImage: String,
    val webImageFallback: String,
    val accentColor: Color
)

data class ResourceGuide(
    val name: String,
    val path: String,
    val icon: ImageVector,
    val accentColor: Color
)

// Ordered programs exactly matching Section 6 of NATIVE_APP_BRIEF.md
val HOME_PROGRAMS = listOf(
    ProgramItem(
        id = "ece",
        name = "ECE Engineering",
        path = "/academy/special-packages/electrical-computer-engineering",
        assetImage = "file:///android_asset/images/special-packages/ece.jpg",
        webImageFallback = "https://wisdom-tower-academy.live/images/special-packages/ece.jpg",
        accentColor = WisdomAccentViolet
    ),
    ProgramItem(
        id = "freshman",
        name = "Freshman",
        path = "/academy/freshman",
        assetImage = "file:///android_asset/images/packages/freshman_00241b.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/freshman_00241b.jpeg",
        accentColor = WisdomAccentPurple
    ),
    ProgramItem(
        id = "grade-9-12",
        name = "Grade 9–12",
        path = "/academy/grades",
        assetImage = "file:///android_asset/images/packages/grade-9-12_9842aa.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/grade-9-12_9842aa.jpeg",
        accentColor = WisdomAccentSky
    ),
    ProgramItem(
        id = "coc",
        name = "COC",
        path = "/academy/coc",
        assetImage = "file:///android_asset/images/packages/coc_e44a09.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/coc_e44a09.jpeg",
        accentColor = WisdomAccentIndigo
    ),
    ProgramItem(
        id = "uat",
        name = "UAT",
        path = "/academy/uat",
        assetImage = "file:///android_asset/images/packages/uat_56b257.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/uat_56b257.jpeg",
        accentColor = WisdomAccentEmerald
    ),
    ProgramItem(
        id = "gat",
        name = "GAT",
        path = "/academy/gat",
        assetImage = "file:///android_asset/images/packages/gat_46ddb1.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/gat_46ddb1.jpeg",
        accentColor = WisdomAccentRose
    ),
    ProgramItem(
        id = "exit-exam",
        name = "Exit Exam",
        path = "/academy/exit-exam",
        assetImage = "file:///android_asset/images/packages/exit-exam_c32a43.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/exit-exam_c32a43.jpeg",
        accentColor = WisdomAccentFuchsia
    ),
    ProgramItem(
        id = "remedial",
        name = "Remedial",
        path = "/academy/remedial",
        assetImage = "file:///android_asset/images/packages/remedial.jpg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/remedial.jpg",
        accentColor = WisdomAccentAmber
    )
)

val OTHER_RESOURCES = listOf(
    ResourceGuide("Success Stories", "/academy/success-stories", Icons.Default.EmojiEvents, WisdomAccentAmber),
    ResourceGuide("Study Techniques", "/academy/study-techniques", Icons.Default.Lightbulb, WisdomCyan),
    ResourceGuide("Campus Life", "/academy/campus-life", Icons.Default.Park, WisdomAccentSky),
    ResourceGuide("Universities Directory", "/academy/universities", Icons.Default.Apartment, WisdomAccentViolet),
    ResourceGuide("Departments Guide", "/academy/departments", Icons.AutoMirrored.Filled.MenuBook, WisdomAccentOrange),
    ResourceGuide("Scholarships Guide", "/academy/scholarships", Icons.Default.School, WisdomAccentRose)
)

@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    isLoggedIn: Boolean = false,
    userName: String? = null,
    onNavigateToUrl: (String) -> Unit
) {
    val context = LocalContext.current

    Box(modifier = modifier.fillMaxSize()) {
        // Atmospheric radial background
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(22.dp)
        ) {
            // 1. Hero Section
            item(key = "hero_section") {
                HeroSection(
                    isLoggedIn = isLoggedIn,
                    userName = userName,
                    onEnterAcademy = { onNavigateToUrl("/academy") },
                    onLearning = { onNavigateToUrl("/learning") },
                    onSignIn = { onNavigateToUrl("/login") },
                    onSignUp = { onNavigateToUrl("/signup") }
                )
            }

            // 2. Welcome Image Card (Full width, 16:9, rounded, floating pill)
            item(key = "welcome_card") {
                WelcomeCard(
                    onOpenLearning = { onNavigateToUrl("/learning") }
                )
            }

            // 3. Program Cards Grid (2 columns on mobile, 16:10 top image, title + Open button)
            item(key = "pathways_header") {
                Text(
                    text = "Structured Pathways",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomTextPrimary,
                    modifier = Modifier.padding(top = 4.dp, bottom = 4.dp)
                )
            }

            items(
                count = (HOME_PROGRAMS.size + 1) / 2,
                key = { rowIndex -> "program_row_$rowIndex" }
            ) { rowIndex ->
                val first = HOME_PROGRAMS[rowIndex * 2]
                val second = HOME_PROGRAMS.getOrNull(rowIndex * 2 + 1)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(modifier = Modifier.weight(1f)) {
                        ProgramGridCard(
                            program = first,
                            onClick = { onNavigateToUrl(first.path) }
                        )
                    }
                    if (second != null) {
                        Box(modifier = Modifier.weight(1f)) {
                            ProgramGridCard(
                                program = second,
                                onClick = { onNavigateToUrl(second.path) }
                            )
                        }
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            // 4. "Other resources" heading & 2-column grid
            item(key = "resources_header") {
                Text(
                    text = "Other resources",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomTextPrimary,
                    modifier = Modifier.padding(top = 10.dp, bottom = 4.dp)
                )
            }

            items(
                count = (OTHER_RESOURCES.size + 1) / 2,
                key = { rowIndex -> "resource_row_$rowIndex" }
            ) { rowIndex ->
                val first = OTHER_RESOURCES[rowIndex * 2]
                val second = OTHER_RESOURCES.getOrNull(rowIndex * 2 + 1)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(modifier = Modifier.weight(1f)) {
                        ResourceCompactCard(
                            resource = first,
                            onClick = { onNavigateToUrl(first.path) }
                        )
                    }
                    if (second != null) {
                        Box(modifier = Modifier.weight(1f)) {
                            ResourceCompactCard(
                                resource = second,
                                onClick = { onNavigateToUrl(second.path) }
                            )
                        }
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            // Bottom breathing space above bottom bar
            item(key = "bottom_spacer") {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun HeroSection(
    isLoggedIn: Boolean,
    userName: String?,
    onEnterAcademy: () -> Unit,
    onLearning: () -> Unit,
    onSignIn: () -> Unit,
    onSignUp: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "hero_gradient")
    val gradientShift by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "hero_anim"
    )

    val animatedGradient = Brush.horizontalGradient(
        colors = listOf(
            WisdomCyan,
            WisdomAccentSky,
            WisdomAccentViolet,
            WisdomCyan
        ),
        startX = gradientShift * 200f,
        endX = (gradientShift + 1f) * 600f
    )

    Column(modifier = Modifier.fillMaxWidth()) {
        // "Wisdom Tower Academy" with animated gradient accent on "Tower"
        val headingText = buildAnnotatedString {
            withStyle(SpanStyle(color = Color.White, fontWeight = FontWeight.Black)) {
                append("Wisdom ")
            }
            withStyle(
                SpanStyle(
                    brush = animatedGradient,
                    fontWeight = FontWeight.Black
                )
            ) {
                append("Tower ")
            }
            withStyle(SpanStyle(color = Color.White, fontWeight = FontWeight.Black)) {
                append("Academy")
            }
        }

        Text(
            text = headingText,
            fontSize = 32.sp,
            lineHeight = 38.sp,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Action Buttons Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            WisdomPrimaryButton(
                text = "Enter Academy",
                onClick = onEnterAcademy,
                icon = {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        tint = WisdomDarkOnCyan,
                        modifier = Modifier.size(16.dp)
                    )
                }
            )

            if (isLoggedIn) {
                WisdomSecondaryButton(
                    text = "My Learning",
                    onClick = onLearning,
                    borderColor = WisdomCyan.copy(alpha = 0.4f),
                    textColor = WisdomCyan,
                    icon = {
                        Icon(
                            imageVector = Icons.Default.School,
                            contentDescription = null,
                            tint = WisdomCyan,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                )
            } else {
                WisdomSecondaryButton(
                    text = "Sign in",
                    onClick = onSignIn,
                    borderColor = WisdomAccentAmber.copy(alpha = 0.45f),
                    textColor = WisdomAccentAmber,
                    icon = {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Login,
                            contentDescription = null,
                            tint = WisdomAccentAmber,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                )
            }
        }

        // Status Line: Welcome back / New here?
        Spacer(modifier = Modifier.height(10.dp))
        if (isLoggedIn) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Welcome back, ",
                    color = WisdomMuted,
                    fontSize = 12.sp
                )
                Text(
                    text = (userName ?: "Student"),
                    color = WisdomCyan,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = " · ",
                    color = WisdomMuted,
                    fontSize = 12.sp
                )
                Text(
                    text = "Continue where you left off",
                    color = WisdomCyan.copy(alpha = 0.9f),
                    fontSize = 12.sp,
                    modifier = Modifier.clickable(onClick = onLearning)
                )
            }
        } else {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "New here? ",
                    color = WisdomMuted,
                    fontSize = 12.sp
                )
                Text(
                    text = "Create a free account",
                    color = WisdomCyan,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable(onClick = onSignUp)
                )
            }
        }
    }
}

@Composable
private fun WelcomeCard(
    onOpenLearning: () -> Unit
) {
    val context = LocalContext.current
    WisdomModernCard(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f),
        cornerRadius = 20.dp,
        onClick = onOpenLearning
    ) {
        // Academy visual with fallback
        AsyncImage(
            model = ImageRequest.Builder(context)
                .data("file:///android_asset/images/home/academy.jpg")
                .crossfade(true)
                .error(android.R.drawable.stat_notify_sync)
                .build(),
            contentDescription = "Wisdom Tower Academy Learning",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Dark gradient overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Transparent,
                            Color(0x66000000),
                            Color(0xCC000000)
                        )
                    )
                )
        )

        // Floating pill "Open Learning →" bottom-right
        Row(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(12.dp)
                .clip(CircleShape)
                .background(Color(0xE6060B15))
                .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.5f)), CircleShape)
                .padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = Icons.Default.School,
                contentDescription = null,
                tint = WisdomCyan,
                modifier = Modifier.size(14.dp)
            )
            Text(
                text = "Open Learning",
                color = Color.White,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = WisdomCyan,
                modifier = Modifier.size(12.dp)
            )
        }
    }
}

@Composable
private fun ProgramGridCard(
    program: ProgramItem,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 14.dp,
        onClick = onClick
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // 16:10 Image on top
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 10f)
                    .background(WisdomDark)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(program.assetImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = program.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            // Single content row: title on left, Open button on right
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = program.name,
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 6.dp)
                )

                WisdomOpenButton(onClick = onClick)
            }
        }
    }
}

@Composable
private fun ResourceCompactCard(
    resource: ResourceGuide,
    onClick: () -> Unit
) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 12.dp,
        borderColor = WisdomBorderWhite,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Small icon tile
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(resource.accentColor.copy(alpha = 0.12f))
                    .border(BorderStroke(1.dp, resource.accentColor.copy(alpha = 0.35f)), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = resource.icon,
                    contentDescription = null,
                    tint = resource.accentColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Title
            Text(
                text = resource.name,
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 15.sp,
                modifier = Modifier.weight(1f)
            )

            // Arrow
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = WisdomMuted,
                modifier = Modifier.size(12.dp)
            )
        }
    }
}
