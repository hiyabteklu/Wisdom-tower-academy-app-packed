package com.wisdomtower.academy.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.packages.ENTRANCE_BASE_PATH
import com.wisdomtower.academy.ui.packages.ENTRANCE_IMAGE_ASSET
import com.wisdomtower.academy.ui.packages.OpenCard
import com.wisdomtower.academy.ui.packages.openGrid
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
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
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

// Cards in the order of the website home / academy page (LandingPathways.tsx, 2026-10-11):
// ECE, Freshman, Grade 9, 10, 11, 12 (independent cards, no combined "Grade 9-12"), Entrance Questions,
// COC, UAT, GAT, Exit Exam, Remedial. Grade pictures are the website package images.
//
// ECE: the website card links to /academy/special-packages/electrical-computer-engineering, a page that is not a
// catalog package, so the app router sent it to the website (online only). The native ECE package screen
// (path .../sem-1) already shows BOTH semesters, every course and the six hub cards without a connection,
// so the card opens that. Name and picture (ece.jpg, kept in step with the website by `copySpecialPackageImages`)
// are unchanged.
val HOME_PROGRAMS = listOf(
    ProgramItem(
        id = "ece",
        name = "ECE Engineering",
        path = "/academy/special-packages/electrical-computer-engineering/sem-1",
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
        id = "grade-9",
        name = "Grade 9",
        path = "/academy/grades/9",
        assetImage = "file:///android_asset/images/packages/grade-9_67df27.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/grade-9_67df27.jpeg",
        accentColor = WisdomAccentSky
    ),
    ProgramItem(
        id = "grade-10",
        name = "Grade 10",
        path = "/academy/grades/10",
        assetImage = "file:///android_asset/images/packages/grade-10_156767.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/grade-10_156767.jpeg",
        accentColor = WisdomAccentViolet
    ),
    ProgramItem(
        id = "grade-11",
        name = "Grade 11",
        path = "/academy/grades/11",
        assetImage = "file:///android_asset/images/packages/grade-11_6309fc.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/grade-11_6309fc.jpeg",
        accentColor = WisdomAccentAmber
    ),
    ProgramItem(
        id = "grade-12",
        name = "Grade 12",
        path = "/academy/grades/12",
        assetImage = "file:///android_asset/images/packages/grade-12_f1ddef.jpeg",
        webImageFallback = "https://wisdom-tower-academy.live/images/packages/grade-12_f1ddef.jpeg",
        accentColor = WisdomAccentEmerald
    ),
    ProgramItem(
        id = "entrance-questions",
        name = "Entrance Questions",
        path = ENTRANCE_BASE_PATH,
        assetImage = ENTRANCE_IMAGE_ASSET,
        webImageFallback = "https://wisdom-tower-academy.live/images/Entrance%20questions.jpeg",
        accentColor = WisdomCyan
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
    Box(modifier = modifier.fillMaxSize()) {
        // Atmospheric radial background
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(22.dp)
        ) {
            // 1. Account line: one row, "New here? Create a free account" + "Sign in" (signed out)
            //    or the welcome text + "My Learning" (signed in). The big "Wisdom Tower Academy" title and the
            //    "Enter Academy" button were removed on purpose (2026-10-13): the header already shows the brand.
            item(key = "hero_section") {
                HeroSection(
                    isLoggedIn = isLoggedIn,
                    userName = userName,
                    onLearning = { onNavigateToUrl("/learning") },
                    onSignIn = { onNavigateToUrl("/login") },
                    onSignUp = { onNavigateToUrl("/signup") }
                )
            }

            // 2. "Open Learning" card: the shared OpenCard (picture, title, Open). No gradient, no floating pill.
            item(key = "welcome_card") {
                OpenCard(
                    title = "Open Learning",
                    image = "file:///android_asset/images/home/academy.jpg",
                    onClick = { onNavigateToUrl("/learning") }
                )
            }

            // 3. Program cards: the shared OpenCard, two per row
            openGrid("programs", HOME_PROGRAMS) { program ->
                OpenCard(program.name, program.assetImage) { onNavigateToUrl(program.path) }
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

/**
 * The only thing at the top of Home: ONE line.
 *  - signed out: "New here? Create a free account" on the left, "Sign in" button on the right;
 *  - signed in: "Welcome back, <name>" on the left, "My Learning" button on the right.
 */
@Composable
private fun HeroSection(
    isLoggedIn: Boolean,
    userName: String?,
    onLearning: () -> Unit,
    onSignIn: () -> Unit,
    onSignUp: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (isLoggedIn) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Welcome back, ",
                    color = WisdomMuted,
                    fontSize = 12.sp
                )
                Text(
                    text = (userName ?: "Student"),
                    color = WisdomCyan,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
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
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
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

            // Small round arrow badge on the right matching website span.rounded-full
            Box(
                modifier = Modifier
                    .size(22.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.04f))
                    .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = WisdomMuted,
                    modifier = Modifier.size(11.dp)
                )
            }
        }
    }
}
