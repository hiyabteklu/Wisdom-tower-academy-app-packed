package com.wisdomtower.academy.ui.guides

// Guides audited against website-reference/ (2026-10-11, session F). Every label and text below is
// copied from the website pages: components/academy/*, app/academy/{universities,departments,
// scholarships,success-stories}/page.tsx and data/universities.ts. Do not add wording that is not there.
//
// 2026-10-14 (docs/SESSION_2026-10-14_resources_ios.md): iOS-style redesign. ONLY look, sizes, icons and motion changed.
// Every sentence is unchanged. Motion language is copied from NativeSignInScreen (expand 280 ms + fade, press-in spring
// 0.6 / 500, sliding/animated pills). Sizes: page title 26 sp, hero title 30 sp, card titles 22 sp, body 16 sp / 26 sp.

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Park
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.ContentFontFamily
import com.wisdomtower.academy.ui.theme.OutfitFontFamily
import com.wisdomtower.academy.ui.theme.PlusJakartaSansFontFamily
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentOrange
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomGlassFill
import com.wisdomtower.academy.ui.theme.WisdomGlassFillStrong
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import kotlinx.coroutines.delay

/* ============================== look and motion tokens ============================== */

private val GuideBodyColor = Color(0xFFE2E8F0)
private val GuideSoftColor = Color(0xFFCBD5E1)

/** Reading text of every guide page: 16 sp on 26 sp lines, light slate (high contrast on the dark glass). */
private val GuideBodyStyle = TextStyle(
    fontFamily = PlusJakartaSansFontFamily,
    fontWeight = FontWeight.Normal,
    fontSize = 16.sp,
    lineHeight = 26.sp,
    color = GuideBodyColor
)

/** Quotes (success stories, universities closing line): the app's content serif in italic, a little larger. */
private val GuideQuoteStyle = TextStyle(
    fontFamily = ContentFontFamily,
    fontStyle = FontStyle.Italic,
    fontWeight = FontWeight.Normal,
    fontSize = 19.sp,
    lineHeight = 28.sp,
    color = Color(0xFFFDE68A)
)

// Same family of motion as the login page: soft expand + fade, quicker retract.
private val RevealIn = expandVertically(
    expandFrom = Alignment.Top,
    animationSpec = spring(dampingRatio = 0.85f, stiffness = 300f)
) + fadeIn(animationSpec = tween(300))
private val RevealOut = shrinkVertically(
    shrinkTowards = Alignment.Top,
    animationSpec = tween(240)
) + fadeOut(animationSpec = tween(160))

/** Press-in like the login button (scale 0.96 with a springy return). Must be the FIRST modifier of the element. */
@Composable
private fun Modifier.softClickable(onClick: () -> Unit): Modifier {
    val source = remember { MutableInteractionSource() }
    val pressed by source.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.96f else 1f,
        animationSpec = spring(dampingRatio = 0.6f, stiffness = 500f),
        label = "guidePressScale"
    )
    return this
        .graphicsLayer {
            scaleX = scale
            scaleY = scale
        }
        .clickable(interactionSource = source, indication = null, onClick = onClick)
}

/** Soft entrance of a block: fades in and rises a little, with a small stagger by [index]. */
@Composable
private fun Reveal(index: Int, content: @Composable () -> Unit) {
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay(minOf(index, 6) * 70L)
        shown = true
    }
    val progress by animateFloatAsState(
        targetValue = if (shown) 1f else 0f,
        animationSpec = tween(durationMillis = 460),
        label = "guideReveal"
    )
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer {
                alpha = progress
                translationY = (1f - progress) * 40f
            }
    ) {
        content()
    }
}

/** Same icons as the Home tiles, so a tile and its page match. */
private fun guideIcon(slug: String): ImageVector = when (slug) {
    "success-stories" -> Icons.Filled.EmojiEvents
    "campus-life" -> Icons.Filled.Park
    "universities" -> Icons.Filled.Apartment
    "departments" -> Icons.AutoMirrored.Filled.MenuBook
    "scholarships" -> Icons.Filled.School
    else -> Icons.Filled.Lightbulb
}

/* ============================== screen ============================== */

@Composable
fun GuidesScreen(
    initialSlug: String = "study-techniques",
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var activeSlug by remember { mutableStateOf(initialSlug) }
    val listState = rememberLazyListState()
    val tabState = rememberLazyListState()

    val (uniIntro, universitiesList) = remember { GuidesRepository.loadUniversities(context) }
    val uniClosing = remember { GuidesRepository.loadUniversitiesClosing(context) }
    val (deptCategories, departmentsList) = remember { GuidesRepository.loadDepartments(context) }
    val (storiesList, scholarshipsList) = remember { GuidesRepository.loadFreeResources(context) }

    // Keep the chosen tab in view, and bring the page back up to the tabs when a new guide opens.
    LaunchedEffect(activeSlug) {
        val index = GUIDE_TABS.indexOfFirst { it.slug == activeSlug }
        if (index >= 0) tabState.animateScrollToItem(maxOf(index - 1, 0))
        if (listState.firstVisibleItemIndex > 1) listState.animateScrollToItem(1)
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            item(key = "top_nav") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    GuideBackPill(onBack = onBack)
                    Spacer(modifier = Modifier.width(14.dp))
                    // Website heading of the guides list on /academy.
                    Text(
                        text = "Other resources",
                        fontFamily = OutfitFontFamily,
                        fontSize = 26.sp,
                        lineHeight = 31.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }
            }

            item(key = "switcher_row") {
                LazyRow(
                    state = tabState,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(GUIDE_TABS) { tab ->
                        GuideTabPill(
                            tab = tab,
                            selected = activeSlug == tab.slug,
                            onClick = { activeSlug = tab.slug }
                        )
                    }
                }
            }

            item(key = "guide_content") {
                AnimatedContent(
                    targetState = activeSlug,
                    transitionSpec = {
                        (fadeIn(animationSpec = tween(340, delayMillis = 90)) +
                            slideInVertically(animationSpec = tween(340, delayMillis = 90)) { it / 14 }) togetherWith
                            fadeOut(animationSpec = tween(120))
                    },
                    label = "guideTabContent"
                ) { slug ->
                    when (slug) {
                        "success-stories" -> SuccessStoriesFullSection(stories = storiesList)
                        "campus-life" -> CampusLifeFullSection()
                        "universities" -> UniversitiesFullSection(
                            introParagraphs = uniIntro,
                            closing = uniClosing,
                            universities = universitiesList
                        )
                        "departments" -> DepartmentsFullSection(categories = deptCategories, departments = departmentsList)
                        "scholarships" -> ScholarshipsFullSection(scholarships = scholarshipsList)
                        else -> StudyTechniquesFullSection()
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(36.dp))
            }
        }
    }
}

/* ============================== shared pieces ============================== */

@Composable
private fun GuideBackPill(onBack: () -> Unit) {
    Box(
        modifier = Modifier
            .softClickable(onClick = onBack)
            .size(48.dp)
            .clip(CircleShape)
            .background(WisdomGlassFillStrong)
            .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Back",
            tint = Color.White,
            modifier = Modifier.size(24.dp)
        )
    }
}

/** Tab as an iOS style pill: icon + label, colours glide between selected and not selected. */
@Composable
private fun GuideTabPill(tab: GuideTab, selected: Boolean, onClick: () -> Unit) {
    val accent = tab.accentColor
    val background by animateColorAsState(
        targetValue = if (selected) accent.copy(alpha = 0.22f) else WisdomGlassFillStrong,
        animationSpec = tween(240),
        label = "guideTabBg"
    )
    val edge by animateColorAsState(
        targetValue = if (selected) accent else WisdomBorderWhite,
        animationSpec = tween(240),
        label = "guideTabEdge"
    )
    val foreground by animateColorAsState(
        targetValue = if (selected) accent else GuideSoftColor,
        animationSpec = tween(240),
        label = "guideTabFg"
    )
    Row(
        modifier = Modifier
            .softClickable(onClick = onClick)
            .clip(CircleShape)
            .background(background)
            .border(BorderStroke(1.5.dp, edge), CircleShape)
            .padding(horizontal = 18.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = guideIcon(tab.slug),
            contentDescription = null,
            tint = foreground,
            modifier = Modifier.size(20.dp)
        )
        Text(
            text = tab.title,
            fontSize = 15.sp,
            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.SemiBold,
            color = foreground,
            maxLines = 1
        )
    }
}

@Composable
private fun IconTile(icon: ImageVector, accent: Color, tile: Dp = 44.dp, glyph: Dp = 24.dp) {
    Box(
        modifier = Modifier
            .size(tile)
            .clip(CircleShape)
            .background(accent.copy(alpha = 0.18f))
            .border(BorderStroke(1.dp, accent.copy(alpha = 0.45f)), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = accent,
            modifier = Modifier.size(glyph)
        )
    }
}

/** Glass card with big rounded corners; an optional accent colours its edge. */
@Composable
private fun GuideCard(accent: Color?, content: @Composable ColumnScope.() -> Unit) {
    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 28.dp,
        borderColor = accent?.copy(alpha = 0.35f) ?: WisdomBorderWhite
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            content = content
        )
    }
}

/** Page hero: accent glow, big icon, heavy 30 sp title, body split into readable paragraphs. */
@Composable
private fun GuideHeaderCard(tag: String, accent: Color, icon: ImageVector, title: String, body: String?) {
    val shape = RoundedCornerShape(30.dp)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(Brush.verticalGradient(listOf(accent.copy(alpha = 0.24f), accent.copy(alpha = 0.05f))))
            .border(
                BorderStroke(
                    1.dp,
                    Brush.verticalGradient(listOf(accent.copy(alpha = 0.55f), Color.White.copy(alpha = 0.06f)))
                ),
                shape
            )
            .padding(22.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            IconTile(icon = icon, accent = accent, tile = 52.dp, glyph = 28.dp)
            PillTag(label = tag.uppercase(), color = accent)
        }
        Text(
            text = title,
            fontFamily = OutfitFontFamily,
            fontWeight = FontWeight.Black,
            fontSize = 30.sp,
            lineHeight = 36.sp,
            color = Color.White
        )
        if (!body.isNullOrBlank()) {
            Paragraphs(text = body)
        }
    }
}

/** Splits a text at blank lines and shows each paragraph with comfortable spacing. The words are not changed. */
@Composable
private fun Paragraphs(text: String, style: TextStyle = GuideBodyStyle) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        text.split("\n\n").map { it.trim() }.filter { it.isNotEmpty() }.forEach { paragraph ->
            Text(text = paragraph, style = style)
        }
    }
}

@Composable
private fun SectionTitleRow(icon: ImageVector, accent: Color, title: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        IconTile(icon = icon, accent = accent)
        Text(
            text = title,
            fontFamily = OutfitFontFamily,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 22.sp,
            lineHeight = 27.sp,
            color = Color.White,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun PillTag(label: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(CircleShape)
            .background(color.copy(alpha = 0.16f))
            .border(BorderStroke(1.dp, color.copy(alpha = 0.4f)), CircleShape)
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = 0.8.sp,
            color = color
        )
    }
}

@Composable
private fun FactBadge(label: String) {
    Box(
        modifier = Modifier
            .clip(CircleShape)
            .background(Color.White.copy(alpha = 0.07f))
            .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape)
            .padding(horizontal = 14.dp, vertical = 7.dp)
    ) {
        Text(text = label, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = GuideSoftColor)
    }
}

@Composable
private fun BadgeRow(labels: List<String>) {
    if (labels.isEmpty()) return
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(labels) { label -> FactBadge(label = label) }
    }
}

/** Titled box inside an expanded card: round icon, heavy 18 sp title in the accent colour, then the content. */
@Composable
private fun InfoBox(title: String, icon: ImageVector, accent: Color, content: @Composable ColumnScope.() -> Unit) {
    val shape = RoundedCornerShape(24.dp)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(accent.copy(alpha = 0.08f))
            .border(BorderStroke(1.dp, accent.copy(alpha = 0.3f)), shape)
            .padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            IconTile(icon = icon, accent = accent, tile = 36.dp, glyph = 20.dp)
            Text(
                text = title,
                fontFamily = OutfitFontFamily,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                lineHeight = 23.sp,
                color = accent,
                modifier = Modifier.weight(1f)
            )
        }
        content()
    }
}

/** Bullet with a native icon in a round accent tile instead of a text dot. */
@Composable
private fun IconBullet(text: String, icon: ImageVector, color: Color) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
        Box(
            modifier = Modifier
                .padding(top = 1.dp)
                .size(26.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.16f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(16.dp)
            )
        }
        Text(text = text, style = GuideBodyStyle, modifier = Modifier.weight(1f))
    }
}

/** Tap row that opens and closes smoothly (spring expand + fade, chevron turns), like the sign-up fields. */
@Composable
private fun AccordionCard(
    title: String,
    icon: ImageVector,
    accent: Color,
    initiallyExpanded: Boolean = false,
    content: @Composable ColumnScope.() -> Unit
) {
    var open by remember { mutableStateOf(initiallyExpanded) }
    val chevron by animateFloatAsState(
        targetValue = if (open) 180f else 0f,
        animationSpec = tween(260),
        label = "guideChevron"
    )
    val edge by animateColorAsState(
        targetValue = if (open) accent.copy(alpha = 0.55f) else Color.White.copy(alpha = 0.10f),
        animationSpec = tween(240),
        label = "guideAccordionEdge"
    )
    val fill by animateColorAsState(
        targetValue = if (open) accent.copy(alpha = 0.07f) else WisdomGlassFill,
        animationSpec = tween(240),
        label = "guideAccordionFill"
    )
    val shape = RoundedCornerShape(26.dp)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(fill)
            .border(BorderStroke(1.dp, edge), shape)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { open = !open }
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            IconTile(icon = icon, accent = accent, tile = 40.dp, glyph = 22.dp)
            Text(
                text = title,
                fontFamily = PlusJakartaSansFontFamily,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                lineHeight = 23.sp,
                color = Color.White,
                modifier = Modifier.weight(1f)
            )
            Icon(
                imageVector = Icons.Filled.KeyboardArrowDown,
                contentDescription = null,
                tint = accent,
                modifier = Modifier
                    .size(26.dp)
                    .rotate(chevron)
            )
        }
        AnimatedVisibility(visible = open, enter = RevealIn, exit = RevealOut) {
            Column(
                modifier = Modifier.padding(start = 18.dp, end = 18.dp, bottom = 18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                content()
            }
        }
    }
}

/** Full width (or compact) pill that expands/collapses a card; the chevron turns, the pill presses in. */
@Composable
private fun ExpandPill(label: String, expanded: Boolean, accent: Color, fullWidth: Boolean, onToggle: () -> Unit) {
    val chevron by animateFloatAsState(
        targetValue = if (expanded) 180f else 0f,
        animationSpec = tween(260),
        label = "guidePillChevron"
    )
    val fill by animateColorAsState(
        targetValue = accent.copy(alpha = if (expanded) 0.10f else 0.22f),
        animationSpec = tween(240),
        label = "guidePillFill"
    )
    Row(
        modifier = (if (fullWidth) Modifier.fillMaxWidth() else Modifier)
            .softClickable(onClick = onToggle)
            .clip(CircleShape)
            .background(fill)
            .border(BorderStroke(1.dp, accent.copy(alpha = 0.45f)), CircleShape)
            .padding(horizontal = 22.dp, vertical = 13.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = accent)
        Spacer(modifier = Modifier.width(8.dp))
        Icon(
            imageVector = Icons.Filled.KeyboardArrowDown,
            contentDescription = null,
            tint = accent,
            modifier = Modifier
                .size(22.dp)
                .rotate(chevron)
        )
    }
}

/** Pill that opens a page outside the app (website, apply). */
@Composable
private fun LinkPill(label: String, accent: Color, filled: Boolean, onClick: () -> Unit) {
    val foreground = if (filled) Color.White else accent
    Row(
        modifier = Modifier
            .softClickable(onClick = onClick)
            .clip(CircleShape)
            .background(if (filled) accent else accent.copy(alpha = 0.14f))
            .border(
                BorderStroke(1.dp, if (filled) Color.Transparent else accent.copy(alpha = 0.45f)),
                CircleShape
            )
            .padding(horizontal = 22.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(text = label, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = foreground)
        Icon(
            imageVector = Icons.AutoMirrored.Filled.OpenInNew,
            contentDescription = null,
            tint = foreground,
            modifier = Modifier.size(18.dp)
        )
    }
}

@Composable
private fun GuideSearchField(value: String, onChange: (String) -> Unit, placeholder: String) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        textStyle = TextStyle(
            fontFamily = PlusJakartaSansFontFamily,
            fontSize = 16.sp,
            color = Color.White
        ),
        placeholder = { Text(placeholder, fontSize = 15.sp, color = GuideSoftColor) },
        leadingIcon = {
            Icon(Icons.Filled.Search, contentDescription = null, tint = WisdomCyan, modifier = Modifier.size(22.dp))
        },
        trailingIcon = if (value.isNotEmpty()) {
            {
                Icon(
                    imageVector = Icons.Filled.Close,
                    contentDescription = "Clear",
                    tint = GuideSoftColor,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .clickable { onChange("") }
                        .padding(9.dp)
                )
            }
        } else null,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(30.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = WisdomCyan,
            unfocusedBorderColor = WisdomBorderWhite,
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            cursorColor = WisdomCyan,
            focusedContainerColor = Color(0xFF0F172A),
            unfocusedContainerColor = Color(0xFF0F172A)
        ),
        singleLine = true
    )
}

@Composable
private fun FilterChip(label: String, selected: Boolean, accent: Color, onClick: () -> Unit) {
    val fill by animateColorAsState(
        targetValue = if (selected) accent.copy(alpha = 0.22f) else Color.White.copy(alpha = 0.06f),
        animationSpec = tween(240),
        label = "guideChipFill"
    )
    val edge by animateColorAsState(
        targetValue = if (selected) accent.copy(alpha = 0.7f) else WisdomBorderWhite,
        animationSpec = tween(240),
        label = "guideChipEdge"
    )
    val foreground by animateColorAsState(
        targetValue = if (selected) accent else GuideSoftColor,
        animationSpec = tween(240),
        label = "guideChipFg"
    )
    Box(
        modifier = Modifier
            .softClickable(onClick = onClick)
            .clip(CircleShape)
            .background(fill)
            .border(BorderStroke(1.dp, edge), CircleShape)
            .padding(horizontal = 18.dp, vertical = 10.dp)
    ) {
        Text(
            text = label,
            fontSize = 15.sp,
            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.SemiBold,
            color = foreground,
            maxLines = 1
        )
    }
}

@Composable
private fun EmptyNoteCard(title: String?, text: String) {
    GuideCard(accent = null) {
        if (title != null) {
            Text(
                text = title,
                fontFamily = OutfitFontFamily,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 20.sp,
                lineHeight = 25.sp,
                color = Color.White
            )
        }
        Text(text = text, style = GuideBodyStyle)
    }
}

private fun openLink(context: android.content.Context, url: String) {
    try {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    } catch (_: Exception) {
    }
}

/* ============================== 1. STUDY TECHNIQUES ============================== */
/* Source: components/academy/StudyTechniquesPage.tsx and StudyTechniquesSections.tsx (checked word for word). */

@Composable
private fun StudyTechniquesFullSection() {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Reveal(0) {
            GuideHeaderCard(
                tag = "Other resources",
                accent = WisdomAccentAmber,
                icon = Icons.Filled.Lightbulb,
                title = "Evidence-Based Study Techniques",
                body = "Covering pages and highlighting lines can feel like work. Often it is only exposure. What tends to stick is what you can produce from memory without looking: a definition in your own words, a method you can choose under time pressure, a problem you solve from a blank page.\n\nThis guide walks through methods that match how memory actually forms. None of them require an innate gift. They require structured retrieval, honest feedback, and deliberate practice."
            )
        }

        Reveal(1) {
            GuideCard(accent = WisdomAccentAmber) {
                SectionTitleRow(icon = Icons.Filled.Book, accent = WisdomAccentAmber, title = "Why the usual routine disappoints")
                Paragraphs(
                    text = "Rereading a chapter until it feels familiar is calming. Watching a clear video is pleasant. Neither one forces your mind to generate the answer. On exam day the question is closed book, timed, and mixed with other topics. If your only practice was open book and smooth, the gap shows up late.\n\nA better measure of a study session is simple: what can you produce from memory afterward? If the answer is thin, the session taught less than the hours suggest."
                )
            }
        }

        Reveal(2) {
            StudyTechniqueStepCard(
                stepNumber = "01",
                category = "Core Principle",
                title = "Active Recall",
                highlight = "Learning is not only what goes in. It is what you can pull back out without the page in front of you.",
                body = "Recognition is easy. You open the notes, see a formula, and think you know this. Closing the book and writing that formula from scratch is harder. That mental effort is useful: each time you retrieve something successfully, the synaptic path strengthens.",
                routineItems = listOf(
                    "After a section, close everything and write what you remember.",
                    "Explain a lecture out loud without looking at notes.",
                    "Attempt a problem before you watch or read the solution."
                ),
                commonTrap = "Rereading until the text feels familiar, then stopping. Familiarity is passive recognition, not the ability to produce the answer on exam day.",
                accentColor = WisdomAccentAmber
            )
        }

        Reveal(3) {
            StudyTechniqueStepCard(
                stepNumber = "02",
                category = "Retention Rhythm",
                title = "Spacing Your Review",
                highlight = "Memory naturally fades. Returning after deliberate intervals is how you convert short-term exposure into permanent recall.",
                body = "Cramming an entire chapter in one evening can make you fluent for a few hours. A few days later, much of that fluency disappears. Spreading the same total study hours across several spaced intervals leaves substantially higher retention behind.",
                routineItems = listOf(
                    "Revisit important ideas days and weeks later, not only the night before.",
                    "Spend ten minutes on last week's material before starting new work.",
                    "Space formulas and definitions; let minor details wait until required."
                ),
                commonTrap = "Treating a single long night as done for a whole chapter. Short-term fluency during the study session is not the same as durable memory that survives until finals.",
                accentColor = WisdomAccentOrange
            )
        }

        Reveal(4) {
            StudyTechniqueStepCard(
                stepNumber = "03",
                category = "Low-Stakes Testing",
                title = "Practice Testing",
                highlight = "Tests are not merely for grading. When used early, self-quizzing is the fastest training mechanism.",
                body = "Waiting until you feel ready wastes the learning value of early mistakes. A low-stakes quiz or past paper reveals gaps while there is still time to correct them. After each attempt, rebuild the correct derivation in writing.",
                routineItems = listOf(
                    "Attempt practice questions before complete confidence arrives.",
                    "Keep a brief error log: what you tried, what went wrong, what is correct.",
                    "Time a test section occasionally so you adjust to actual exam pressure."
                ),
                commonTrap = "Checking the answer key immediately, feeling relieved, and moving on without independently re-solving the problem from scratch.",
                accentColor = WisdomAccentRose
            )
        }

        Reveal(5) {
            StudyTechniqueStepCard(
                stepNumber = "04",
                category = "Discrimination Skill",
                title = "Mixing Related Topics",
                highlight = "Doing twenty identical problems feels comfortable. Real university exams shuffle types. Practice should reflect that reality.",
                body = "Master a method in a focused block first. Once you understand the core mechanics, weave problems with neighboring chapters so selecting the appropriate tool under ambiguity becomes automatic.",
                routineItems = listOf(
                    "After initial competence, mix problem types in a single drill session.",
                    "Revise related chapters in alternating short bursts.",
                    "Block practice initially; interleave once the formulas are recognizable."
                ),
                commonTrap = "Finishing a long run of identical exercises and never practicing selection among competing formulas, leaving you disoriented on exam day.",
                accentColor = WisdomAccentViolet
            )
        }

        Reveal(6) {
            GuideCard(accent = null) {
                SectionTitleRow(icon = Icons.Filled.Star, accent = WisdomCyan, title = "Everyday Habits That Support the Core Four")
                Text(
                    text = "These habits lower cognitive friction and keep your recall and testing schedule consistent.",
                    style = GuideBodyStyle
                )

                val habits = listOf(
                    Triple("Blurting & Retrieval", "Set a 10-minute timer. Write everything you recall about a topic on a blank page. Compare with your notes, fill the gaps, and retry tomorrow.", Icons.Filled.Timer),
                    Triple("Plain Language Teaching", "If you cannot explain an idea in plain words without looking, your mental model is incomplete. Stalling highlights what requires another pass.", Icons.Filled.School),
                    Triple("Turn Notes into Cues", "Full lecture notes are for initial orientation. For exam revision, shrink them into prompt questions and small diagrams you expand from memory.", Icons.Filled.Create),
                    Triple("Protected Focus Blocks", "Late nights that sacrifice sleep cost more than they yield. A 90-minute protected focus block beats four hours of distracted multitasking.", Icons.Filled.Lock)
                )

                habits.forEachIndexed { index, (hTitle, hDesc, hIcon) ->
                    AccordionCard(
                        title = hTitle,
                        icon = hIcon,
                        accent = WisdomCyan,
                        initiallyExpanded = index == 0
                    ) {
                        Text(text = hDesc, style = GuideBodyStyle)
                    }
                }
            }
        }

        Reveal(7) {
            GuideCard(accent = WisdomAccentRose) {
                SectionTitleRow(icon = Icons.Filled.Block, accent = WisdomAccentRose, title = "What to Drop Immediately")
                Text(
                    text = "These common study habits feel reassuring but offer almost zero long-term retention:",
                    style = GuideBodyStyle.copy(color = WisdomAccentRose)
                )

                val traps = listOf(
                    "Rereading highlighted pages repeatedly until they look familiar",
                    "Watching video explanations without pausing to derive the solution yourself",
                    "Copying notes from classmates without reconstructing the argument independently",
                    "Cramming exclusively the night before and calling it an exam strategy",
                    "Avoiding timed mock questions because they feel uncomfortable"
                )
                traps.forEach { trap ->
                    IconBullet(text = trap, icon = Icons.Filled.Block, color = WisdomAccentRose)
                }
            }
        }
    }
}

@Composable
private fun StudyTechniqueStepCard(
    stepNumber: String,
    category: String,
    title: String,
    highlight: String,
    body: String,
    routineItems: List<String>,
    commonTrap: String,
    accentColor: Color
) {
    GuideCard(accent = accentColor) {
        StepHeader(stepNumber, category, title, accentColor)

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            IconTile(icon = Icons.Filled.Lightbulb, accent = accentColor, tile = 34.dp, glyph = 19.dp)
            Text(
                text = highlight,
                fontFamily = PlusJakartaSansFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                lineHeight = 27.sp,
                color = Color.White,
                modifier = Modifier.weight(1f)
            )
        }
        Text(text = body, style = GuideBodyStyle)

        InfoBox(title = "Try this routine", icon = Icons.Filled.CheckCircle, accent = accentColor) {
            routineItems.forEach { item -> IconBullet(text = item, icon = Icons.Filled.CheckCircle, color = accentColor) }
        }

        InfoBox(title = "Common Trap", icon = Icons.Filled.Warning, accent = WisdomAccentRose) {
            Text(text = commonTrap, style = GuideBodyStyle)
        }
    }
}

@Composable
private fun StepHeader(step: String, category: String, title: String, accentColor: Color) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        Box(
            modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(accentColor.copy(alpha = 0.18f))
                .border(BorderStroke(1.5.dp, accentColor.copy(alpha = 0.55f)), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = step,
                fontFamily = OutfitFontFamily,
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = accentColor
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = category.uppercase(),
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.8.sp,
                color = accentColor
            )
            Text(
                text = title,
                fontFamily = OutfitFontFamily,
                fontSize = 24.sp,
                lineHeight = 29.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
        }
    }
}

/* ============================== 2. SUCCESS STORIES ============================== */
/* Source: app/academy/success-stories/page.tsx. Items come from the website's Supabase table. */

@Composable
private fun SuccessStoriesFullSection(stories: List<SuccessStory>) {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Reveal(0) {
            GuideHeaderCard(
                tag = "Free resource",
                accent = WisdomAccentAmber,
                icon = Icons.Filled.EmojiEvents,
                title = "Success Stories",
                body = FreeResourcesLive.storiesSubtitle.ifBlank { null }
            )
        }

        if (stories.isNotEmpty()) {
            FactBadge(label = "${stories.size} ${if (stories.size == 1) "story" else "stories"}")
        }

        if (stories.isEmpty()) {
            if (!FreeResourcesLive.loaded) {
                FreeResourcesStateCard(null, "Loading…")
            } else if (FreeResourcesLive.storiesFailed) {
                FreeResourcesStateCard(null, "Could not load stories.")
            } else {
                FreeResourcesStateCard("No stories yet", "Published stories will appear here as large photo cards.")
            }
        }
        stories.forEachIndexed { index, story ->
            key(story.id) {
                Reveal(index + 1) { SuccessStoryCardItem(story = story) }
            }
        }
    }
}

/**
 * Cover photo of a success story (website: 16:10 photo at the top of the card, amber trophy when there is no
 * photo). The trophy stays behind the photo, so it is also what the student sees while the photo loads or if
 * it cannot be loaded.
 */
@Composable
private fun StoryCover(imageUrl: String, description: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1.6f)
            .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
            .background(Color(0xFF0B1426)),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Filled.EmojiEvents,
            contentDescription = null,
            tint = WisdomAccentAmber.copy(alpha = 0.3f),
            modifier = Modifier.size(64.dp)
        )
        if (imageUrl.isNotBlank()) {
            AsyncImage(
                model = imageUrl,
                contentDescription = description,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun SuccessStoryCardItem(story: SuccessStory) {
    var expanded by remember { mutableStateOf(false) }
    val longBody = story.body.trim().length > 220
    val edge by animateColorAsState(
        targetValue = if (expanded) WisdomAccentAmber.copy(alpha = 0.55f) else WisdomBorderWhite,
        animationSpec = tween(240),
        label = "storyEdge"
    )

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 28.dp,
        borderColor = edge
    ) {
        Column {
            StoryCover(
                imageUrl = story.imageUrl,
                description = story.name.ifBlank { story.achievement }
            )
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .animateContentSize(animationSpec = spring(dampingRatio = 0.85f, stiffness = 300f))
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "ACHIEVEMENT",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 0.8.sp,
                            color = WisdomAccentAmber
                        )
                        Text(
                            text = story.achievement,
                            fontFamily = OutfitFontFamily,
                            fontSize = 24.sp,
                            lineHeight = 29.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        val byline = listOf(story.name, story.program, story.year).filter { it.isNotBlank() }.joinToString(" · ")
                        if (byline.isNotEmpty()) {
                            Text(
                                text = byline,
                                fontSize = 15.sp,
                                lineHeight = 21.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = GuideSoftColor
                            )
                        }
                    }
                    IconTile(icon = Icons.Filled.EmojiEvents, accent = WisdomAccentAmber, tile = 46.dp, glyph = 26.dp)
                }

                if (story.quote.isNotBlank()) {
                    val quoteShape = RoundedCornerShape(22.dp)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(quoteShape)
                            .background(WisdomAccentAmber.copy(alpha = 0.08f))
                            .border(BorderStroke(1.dp, WisdomAccentAmber.copy(alpha = 0.3f)), quoteShape)
                            .padding(16.dp)
                    ) {
                        Text(text = "“${story.quote}”", style = GuideQuoteStyle)
                    }
                }

                if (story.body.isNotBlank()) {
                    Text(
                        text = story.body.trim(),
                        style = GuideBodyStyle,
                        maxLines = if (expanded || !longBody) Int.MAX_VALUE else 3,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                if (longBody) {
                    ExpandPill(
                        label = if (expanded) "Show less" else "Read full story",
                        expanded = expanded,
                        accent = WisdomAccentAmber,
                        fullWidth = false,
                        onToggle = { expanded = !expanded }
                    )
                }
            }
        }
    }
}

/* ============================== 3. CAMPUS LIFE ============================== */
/* Source: components/academy/CampusLifePage.tsx and CampusLifeSections.tsx. */

private data class CampusCard(val title: String, val body: String, val icon: ImageVector)

@Composable
private fun CampusLifeFullSection() {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Reveal(0) {
            GuideHeaderCard(
                tag = "Other resources",
                accent = WisdomAccentSky,
                icon = Icons.Filled.Park,
                title = "Campus Life Field Guide",
                body = "Most of what decides your grades does not happen only at a desk with a highlighter. It happens in the hours between classes: who you sit with, how late you stay online, whether you recover after a hard week, and whether a weak lecture still leaves you with something you can revise.\n\nThis page is a practical guide to that side of university: friendships, pressure, classrooms, and the buildings and people around you. Nothing here is a personality test. It is ordinary advice that works when you apply it imperfectly but consistently."
            )
        }

        Reveal(1) {
            CampusSectionCard(
                step = "01",
                category = "Social Dynamics",
                title = "Friends & Social Life",
                subtitle = "Keeping friends without losing the semester",
                paragraphs = listOf(
                    "University is where many people meet the friends they keep for years. That matters. What also matters is that endless availability-answering every message the moment it arrives, accepting every invitation because saying no feels rude-leaves almost no quiet stretch for real study.",
                    "You do not need to become cold. You need a simple pattern: some hours are for work, and during those hours you are allowed to be slow to reply. When you are free, be actually free. People respect clarity more than vague half-attention all day long."
                ),
                bullets = listOf(
                    "Block a few study hours where your phone is not the priority.",
                    "Put social plans after those blocks when you can, not in the middle of them.",
                    "A short, honest 'I am finishing this, talk later' is enough; you do not owe a speech."
                ),
                cards = listOf(
                    CampusCard(
                        "What “everyone is doing” really means",
                        "Peer pressure on campus rarely looks like orders. More often it is the quiet assumption that skipping class is normal, or that starting assignments the night before is standard. Decide your minimum standards in advance and study near peers who work diligently.",
                        Icons.Filled.Groups
                    ),
                    CampusCard(
                        "Loneliness is not discipline",
                        "Cutting everyone off is not a healthy strategy. Most students thrive with one or two steady, reliable relationships rather than large superficial circles. Schedule meaningful connections like a weekly study walk or a short call home.",
                        Icons.Filled.Favorite
                    )
                ),
                accentColor = WisdomAccentRose
            )
        }

        Reveal(2) {
            CampusSectionCard(
                step = "02",
                category = "Mental Stamina",
                title = "Energy & Pressure Management",
                subtitle = null,
                paragraphs = emptyList(),
                bullets = emptyList(),
                cards = listOf(
                    CampusCard(
                        "When motivation comes and goes",
                        "Some weeks you feel sharp; other weeks opening the textbook feels heavy. On low-energy days, shrink the scope: do a 15-minute recall review or one section of problems. Continuity beats boom-and-bust cramming.",
                        Icons.Filled.Bolt
                    ),
                    CampusCard(
                        "Noticing burnout early",
                        "Burnout builds quietly: you sleep but wake up exhausted, tasks feel numb, or irritability spikes. Cut study volume, simplify your commitments, and talk to someone early instead of pushing until complete collapse.",
                        Icons.Filled.Warning
                    ),
                    CampusCard(
                        "Showing up routinely",
                        "Do not wait for inspirational moods. Anchor to simple physical triggers: the same desk, a consistent starting hour, and an easy first step. Reliable small steps get you across four or five undergraduate years.",
                        Icons.Filled.DateRange
                    ),
                    CampusCard(
                        "Rest that actually restores",
                        "Infinite phone scrolling leaves you depleted. Authentic restoration means uninterrupted sleep, sunlight, walking outdoors, screen-free meals, and genuine human conversations.",
                        Icons.Filled.Bedtime
                    )
                ),
                accentColor = WisdomAccentViolet
            )
        }

        Reveal(3) {
            CampusSectionCard(
                step = "03",
                category = "Classroom Strategy",
                title = "Lectures & Classroom Time",
                subtitle = null,
                paragraphs = emptyList(),
                bullets = emptyList(),
                cards = listOf(
                    CampusCard(
                        "Where you sit and how you listen",
                        "Sitting in front where you clearly view the board reduces the cognitive strain of staying locked into complex derivations. The back rows invite distractions and lost hours.",
                        Icons.Filled.LocationOn
                    ),
                    CampusCard(
                        "Attendance without perfectionism",
                        "You will occasionally miss class. What matters is never leaving a missed core concept unrepaired. Treat the day you missed as the deadline to copy notes and derive the examples.",
                        Icons.Filled.CheckCircle
                    ),
                    CampusCard(
                        "Phone silence and attention resets",
                        "Attention drifts for everyone. Silence notifications and mark the moment your focus strayed. Focus is a muscle you re-engage throughout the hour, not an all-or-nothing test.",
                        Icons.Filled.Notifications
                    ),
                    CampusCard(
                        "When the instruction feels dense",
                        "Not every professor explains concepts accessibly. Treat the lecture as an outline of what the university values, then verify concepts in textbooks or with classmates immediately after.",
                        Icons.Filled.Info
                    ),
                    CampusCard(
                        "The 15-Minute Same-Day Payoff",
                        "Immediately after a demanding lecture, write three core takeaways on a blank page from memory before checking your notes. This simple habit preserves weeks of preparation effort.",
                        Icons.Filled.Timer
                    )
                ),
                accentColor = WisdomAccentSky
            )
        }

        Reveal(4) {
            CampusSectionCard(
                step = "04",
                category = "Campus Facilities",
                title = "Places, Study Groups & Faculty",
                subtitle = null,
                paragraphs = emptyList(),
                bullets = emptyList(),
                cards = listOf(
                    CampusCard(
                        "Use buildings on purpose",
                        "The university library is for deep concentration; dorms and cafeterias are for unwinding. Separating physical spaces prevents mental clutter.",
                        Icons.Filled.Apartment
                    ),
                    CampusCard(
                        "Group work discipline",
                        "Agree on milestones, dates, and ownership early. Never leave collective assignments for a frantic overnight rush the evening before submission.",
                        Icons.Filled.Groups
                    ),
                    CampusCard(
                        "Approaching instructors",
                        "Bring precise problem statements to office hours early in the term. Instructors respect proactive curiosity much more than vague last-minute exam panicking.",
                        Icons.Filled.Person
                    )
                ),
                accentColor = WisdomAccentEmerald
            )
        }

        Reveal(5) {
            GuideCard(accent = null) {
                SectionTitleRow(icon = Icons.Filled.CheckCircle, accent = WisdomAccentSky, title = "A Simple Weekly Reflection Check")
                Text(
                    text = "You do not need to tick every box every week. Use this diagnostic when the term begins feeling noisy, unfocused, or overwhelming:",
                    style = GuideBodyStyle
                )
                val checks = listOf(
                    "At least one stretch of real focus away from group chats and open invitations",
                    "One genuine conversation or check-in, not only reacting to notifications",
                    "Same-day review after the hardest lecture you attended",
                    "Studying at least once in a place chosen for the work, not only by habit",
                    "An honest look at sleep, mood, and avoidance, reducing load when running empty",
                    "For any group task, roles and dates written down before deadlines approach"
                )
                checks.forEach { c ->
                    IconBullet(text = c, icon = Icons.Filled.CheckCircle, color = WisdomAccentSky)
                }
            }
        }
    }
}

@Composable
private fun CampusSectionCard(
    step: String,
    category: String,
    title: String,
    subtitle: String?,
    paragraphs: List<String>,
    bullets: List<String>,
    cards: List<CampusCard>,
    accentColor: Color
) {
    GuideCard(accent = accentColor) {
        StepHeader(step, category, title, accentColor)

        if (subtitle != null) {
            Text(
                text = subtitle,
                fontFamily = PlusJakartaSansFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 19.sp,
                lineHeight = 26.sp,
                color = Color.White
            )
        }
        paragraphs.forEach { p ->
            Text(text = p, style = GuideBodyStyle)
        }
        bullets.forEach { b -> IconBullet(text = b, icon = Icons.Filled.CheckCircle, color = accentColor) }

        cards.forEachIndexed { index, c ->
            AccordionCard(
                title = c.title,
                icon = c.icon,
                accent = accentColor,
                initiallyExpanded = index == 0
            ) {
                Text(text = c.body, style = GuideBodyStyle)
            }
        }
    }
}

/* ============================== 4. UNIVERSITIES ============================== */
/* Source: app/academy/universities/page.tsx and data/universities.ts. */

@Composable
private fun UniversitiesFullSection(
    introParagraphs: List<String>,
    closing: String,
    universities: List<UniversityDetail>
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedRegion by remember { mutableStateOf(ALL_REGIONS) }
    var featuredOnly by remember { mutableStateOf(false) }
    var detailedOnly by remember { mutableStateOf(false) }

    val regions = listOf(
        ALL_REGIONS, "Addis Ababa", "Amhara", "Oromia", "Tigray", "SNNPR",
        "Somali", "Afar", "Benishangul Gumuz", "Gambela", "Dire Dawa"
    )

    val filteredList = remember(searchQuery, selectedRegion, featuredOnly, detailedOnly, universities) {
        val q = searchQuery.trim().lowercase()
        universities.filter { u ->
            if (featuredOnly && !u.featured) return@filter false
            if (detailedOnly && !u.detailed) return@filter false
            if (selectedRegion != ALL_REGIONS && u.region != selectedRegion) return@filter false
            if (q.isEmpty()) return@filter true
            u.name.lowercase().contains(q) ||
                u.abbr.lowercase().contains(q) ||
                u.location.lowercase().contains(q) ||
                u.region.lowercase().contains(q) ||
                u.strengths.any { it.lowercase().contains(q) } ||
                u.knownFor.any { it.lowercase().contains(q) }
        }
    }

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Reveal(0) {
            GuideHeaderCard(
                tag = "Other resources",
                accent = WisdomAccentViolet,
                icon = Icons.Filled.Apartment,
                title = "Ethiopian Universities Directory",
                body = "$UNIVERSITIES_SUBTITLE. Authentic guides, student fit, climate, and campus realities before you pick."
            )
        }

        Reveal(1) {
            AccordionCard(
                title = "Read this before you choose",
                icon = Icons.Filled.Info,
                accent = WisdomAccentSky
            ) {
                introParagraphs.forEach { p ->
                    Text(text = p, style = GuideBodyStyle)
                }
                if (closing.isNotBlank()) {
                    Text(text = closing, style = GuideQuoteStyle.copy(color = GuideBodyColor))
                }
            }
        }

        val detailedCount = remember(universities) { universities.count { it.detailed } }
        BadgeRow(
            labels = listOf(
                "${universities.size} Institutions",
                "$detailedCount In-Depth Guides",
                "All Ethiopian Regions"
            )
        )

        GuideSearchField(
            value = searchQuery,
            onChange = { searchQuery = it },
            placeholder = "Search by university name, abbr (AAU, ASTU...), or city..."
        )

        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item(key = "featured_chip") {
                FilterChip(label = "Featured", selected = featuredOnly, accent = WisdomAccentAmber) {
                    featuredOnly = !featuredOnly
                }
            }
            item(key = "detailed_chip") {
                FilterChip(label = "Detailed Guides", selected = detailedOnly, accent = WisdomAccentViolet) {
                    detailedOnly = !detailedOnly
                }
            }
            items(regions) { reg ->
                FilterChip(label = reg, selected = selectedRegion == reg, accent = WisdomAccentViolet) {
                    selectedRegion = reg
                }
            }
        }

        if (filteredList.isEmpty()) {
            EmptyNoteCard("No universities found", "Try adjusting your search terms or clearing the region filter.")
        }
        filteredList.forEachIndexed { index, uni ->
            key(uni.id) {
                Reveal(index) { UniversityDetailCard(uni = uni) }
            }
        }
    }
}

private const val ALL_REGIONS = "All Regions"

@Composable
private fun UniversityDetailCard(uni: UniversityDetail) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val previewTags = (if (uni.knownFor.isNotEmpty()) uni.knownFor else uni.strengths).take(3)
    val edge by animateColorAsState(
        targetValue = if (expanded) WisdomAccentSky.copy(alpha = 0.5f) else WisdomBorderWhite,
        animationSpec = tween(240),
        label = "uniEdge"
    )

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 28.dp,
        borderColor = edge
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                PillTag(label = uni.abbr, color = WisdomAccentSky)
                if (uni.featured) {
                    Icon(Icons.Filled.Star, contentDescription = null, tint = WisdomAccentAmber, modifier = Modifier.size(18.dp))
                    Text(
                        text = "FEATURED",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.8.sp,
                        color = WisdomAccentAmber
                    )
                }
            }

            Text(
                text = uni.name,
                fontFamily = OutfitFontFamily,
                fontSize = 23.sp,
                lineHeight = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Filled.LocationOn, contentDescription = null, tint = WisdomAccentSky, modifier = Modifier.size(20.dp))
                Text(text = uni.location, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = GuideSoftColor)
            }

            val facts = buildList {
                if (uni.region.isNotBlank()) add(uni.region)
                if (uni.distanceFromAddisKm != null) {
                    add(if (uni.distanceFromAddisKm == 0) "In Capital" else "~${uni.distanceFromAddisKm} km")
                }
                if (uni.elevationM != null) add("~${uni.elevationM}m")
                if (uni.founded.isNotBlank()) add("Est. ${uni.founded}")
            }
            BadgeRow(labels = facts)

            AnimatedVisibility(visible = !expanded, enter = RevealIn, exit = RevealOut) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    previewTags.forEach { tag ->
                        IconBullet(text = tag, icon = Icons.Filled.Star, color = WisdomAccentSky)
                    }
                    if (uni.studentFit.isNotBlank()) {
                        Text(
                            text = uni.studentFit,
                            style = GuideBodyStyle,
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            AnimatedVisibility(visible = expanded, enter = RevealIn, exit = RevealOut) {
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    var n = 0
                    if (uni.campuses.isNotBlank()) {
                        Reveal(n++) {
                            InfoBox("Campus Geography & Setup", Icons.Filled.LocationOn, WisdomAccentSky) {
                                Text(text = uni.campuses, style = GuideBodyStyle)
                            }
                        }
                    }
                    if (uni.climate.isNotBlank()) {
                        Reveal(n++) {
                            InfoBox("Weather & Climate", Icons.Filled.WbSunny, WisdomAccentAmber) {
                                Text(text = uni.climate, style = GuideBodyStyle)
                            }
                        }
                    }
                    if (uni.distanceNote.isNotBlank()) {
                        Reveal(n++) {
                            Text(text = "Travel Context: ${uni.distanceNote}", style = GuideBodyStyle)
                        }
                    }
                    if (uni.knownFor.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Prominent Disciplines", Icons.Filled.School, WisdomAccentViolet) {
                                uni.knownFor.forEach { IconBullet(text = it, icon = Icons.Filled.Star, color = WisdomAccentViolet) }
                            }
                        }
                    }
                    if (uni.strengths.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Academic Strengths", Icons.Filled.EmojiEvents, WisdomAccentSky) {
                                uni.strengths.forEach { IconBullet(text = it, icon = Icons.Filled.CheckCircle, color = WisdomAccentSky) }
                            }
                        }
                    }
                    if (uni.studentFit.isNotBlank()) {
                        Reveal(n++) {
                            InfoBox("Student Fit", Icons.Filled.Person, WisdomAccentEmerald) {
                                Text(text = uni.studentFit, style = GuideBodyStyle)
                            }
                        }
                    }
                    if (uni.whatToExpect.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Campus Life Reality", Icons.Filled.Groups, WisdomCyan) {
                                uni.whatToExpect.forEach { Text(text = it, style = GuideBodyStyle) }
                            }
                        }
                    }
                    if (uni.tips.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Insider Tips for Students", Icons.Filled.Lightbulb, WisdomAccentAmber) {
                                uni.tips.forEach { IconBullet(text = it, icon = Icons.Filled.Lightbulb, color = WisdomAccentAmber) }
                            }
                        }
                    }
                }
            }

            ExpandPill(
                label = if (expanded) "Less" else "More",
                expanded = expanded,
                accent = WisdomAccentSky,
                fullWidth = true,
                onToggle = { expanded = !expanded }
            )

            if (uni.website.isNotBlank() && uni.website != "#") {
                LinkPill(label = "Website", accent = WisdomAccentSky, filled = false) {
                    openLink(context, uni.website)
                }
            }
        }
    }
}

/* ============================== 5. DEPARTMENTS ============================== */
/* Source: app/academy/departments/page.tsx. */

private const val ALL_FIELDS = "All Fields"

@Composable
private fun DepartmentsFullSection(
    categories: List<DepartmentCategoryDetail>,
    departments: List<DepartmentDetail>
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCat by remember { mutableStateOf(ALL_FIELDS) }

    val filterOptions = listOf(ALL_FIELDS) + categories.map { it.label }

    val filteredList = remember(searchQuery, selectedCat, departments, categories) {
        val q = searchQuery.trim().lowercase()
        departments.filter { d ->
            val catLabel = categories.find { it.id == d.categoryId }?.label ?: ""
            if (selectedCat != ALL_FIELDS && catLabel != selectedCat) return@filter false
            if (q.isEmpty()) return@filter true
            "${d.name} ${d.shortName} ${d.about} ${d.careers.joinToString(" ")}".lowercase().contains(q)
        }
    }

    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Reveal(0) {
            GuideHeaderCard(
                tag = "Other resources",
                accent = WisdomAccentOrange,
                icon = Icons.AutoMirrored.Filled.MenuBook,
                title = "Department Field Guides",
                body = "What competitive undergraduate fields actually demand: real coursework, career roles, market demand in Ethiopia, and the trade-offs nobody puts on the official brochure."
            )
        }

        BadgeRow(labels = listOf("${departments.size} Academic Fields & Engineering Streams"))

        GuideSearchField(
            value = searchQuery,
            onChange = { searchQuery = it },
            placeholder = "Search departments, careers, skills..."
        )

        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(filterOptions) { cat ->
                FilterChip(label = cat, selected = selectedCat == cat, accent = WisdomAccentOrange) {
                    selectedCat = cat
                }
            }
        }

        if (filteredList.isEmpty()) {
            EmptyNoteCard("No fields match your search", "Try another keyword or select All categories.")
        }
        filteredList.forEachIndexed { index, dept ->
            val catLabel = categories.find { it.id == dept.categoryId }?.label ?: "Academic Field"
            key(dept.id) {
                Reveal(index) { DepartmentDetailCard(dept = dept, categoryLabel = catLabel) }
            }
        }
    }
}

@Composable
private fun DepartmentDetailCard(dept: DepartmentDetail, categoryLabel: String) {
    var expanded by remember { mutableStateOf(false) }
    val edge by animateColorAsState(
        targetValue = if (expanded) WisdomCyan.copy(alpha = 0.5f) else WisdomBorderWhite,
        animationSpec = tween(240),
        label = "deptEdge"
    )

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 28.dp,
        borderColor = edge
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                PillTag(label = categoryLabel.uppercase(), color = WisdomAccentOrange)
            }
            if (dept.durationYears.isNotBlank()) BadgeRow(labels = listOf(dept.durationYears))

            Text(
                text = dept.name,
                fontFamily = OutfitFontFamily,
                fontSize = 23.sp,
                lineHeight = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )

            AnimatedVisibility(visible = !expanded, enter = RevealIn, exit = RevealOut) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = dept.about,
                        style = GuideBodyStyle,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis
                    )
                    dept.careers.take(3).forEach { career ->
                        IconBullet(text = career, icon = Icons.Filled.Work, color = WisdomAccentOrange)
                    }
                }
            }

            AnimatedVisibility(visible = expanded, enter = RevealIn, exit = RevealOut) {
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    var n = 0
                    Reveal(n++) {
                        InfoBox("What This Field Demands", Icons.Filled.Info, WisdomAccentSky) {
                            Text(text = dept.about, style = GuideBodyStyle)
                        }
                    }
                    if (dept.courses.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Core Coursework & Modules", Icons.Filled.Book, WisdomAccentAmber) {
                                dept.courses.forEach { IconBullet(text = it, icon = Icons.Filled.Book, color = WisdomAccentAmber) }
                            }
                        }
                    }
                    if (dept.careers.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Career Paths & Roles", Icons.Filled.Work, WisdomAccentEmerald) {
                                dept.careers.forEach { IconBullet(text = it, icon = Icons.Filled.CheckCircle, color = WisdomAccentEmerald) }
                            }
                        }
                    }
                    if (dept.market.isNotBlank()) {
                        Reveal(n++) {
                            InfoBox("Ethiopian Market Reality & Outlook", Icons.AutoMirrored.Filled.TrendingUp, WisdomAccentViolet) {
                                Text(text = dept.market, style = GuideBodyStyle)
                            }
                        }
                    }
                    if (dept.pros.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Key Upsides", Icons.Filled.ThumbUp, WisdomAccentEmerald) {
                                dept.pros.forEach { IconBullet(text = it, icon = Icons.Filled.ThumbUp, color = WisdomAccentEmerald) }
                            }
                        }
                    }
                    if (dept.cons.isNotEmpty()) {
                        Reveal(n++) {
                            InfoBox("Trade-offs", Icons.Filled.Warning, WisdomAccentRose) {
                                dept.cons.forEach { IconBullet(text = it, icon = Icons.Filled.Warning, color = WisdomAccentRose) }
                            }
                        }
                    }
                }
            }

            ExpandPill(
                label = if (expanded) "Less" else "More",
                expanded = expanded,
                accent = WisdomCyan,
                fullWidth = true,
                onToggle = { expanded = !expanded }
            )
        }
    }
}

/* ============================== 6. SCHOLARSHIPS ============================== */
/* Source: app/academy/scholarships/page.tsx. Items come from the website's Supabase table. */

@Composable
private fun ScholarshipsFullSection(scholarships: List<ScholarshipOpportunity>) {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Reveal(0) {
            GuideHeaderCard(
                tag = "Free resource",
                accent = WisdomAccentRose,
                icon = Icons.Filled.School,
                title = "Scholarship Info",
                body = FreeResourcesLive.scholarshipsSubtitle.ifBlank { "Funding options and how to prepare strong applications." }
            )
        }

        Reveal(1) {
            AccordionCard(
                title = "How to use this page & apply well",
                icon = Icons.Filled.Info,
                accent = WisdomAccentRose
            ) {
                Text(
                    text = FreeResourcesLive.scholarshipsIntro.ifBlank { SCHOLARSHIP_DEFAULT_INTRO },
                    style = GuideBodyStyle
                )
            }
        }

        if (scholarships.isNotEmpty()) {
            FactBadge(label = "${scholarships.size} ${if (scholarships.size == 1) "opportunity" else "opportunities"}")
        }

        if (scholarships.isEmpty()) {
            if (!FreeResourcesLive.loaded) {
                FreeResourcesStateCard(null, "Loading scholarships…")
            } else if (FreeResourcesLive.scholarshipsFailed) {
                FreeResourcesStateCard(null, "Unable to load scholarship opportunities right now.")
            } else {
                FreeResourcesStateCard(
                    null,
                    "Individual scholarship cards will appear here as we publish them. Use the guide above while preparing applications."
                )
            }
        }
        scholarships.forEachIndexed { index, sch ->
            key(sch.id) {
                Reveal(index + 2) { ScholarshipCardItem(sch = sch) }
            }
        }

        if (scholarships.isNotEmpty()) {
            EmptyNoteCard(
                null,
                "Always verify deadlines and requirements on the official page. Requirements change. Treat this as a curated guide."
            )
        }
    }
}

@Composable
private fun ScholarshipCardItem(sch: ScholarshipOpportunity) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val longBody = sch.body.trim().length > 240

    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 28.dp) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .animateContentSize(animationSpec = spring(dampingRatio = 0.85f, stiffness = 300f))
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            val facts = buildList {
                if (sch.deadline.isNotBlank()) add("Deadline: ${sch.deadline}")
                if (sch.level.isNotBlank()) add(sch.level)
                if (sch.country.isNotBlank()) add(sch.country)
            }
            BadgeRow(labels = facts)

            Text(
                text = sch.title,
                fontFamily = OutfitFontFamily,
                fontSize = 23.sp,
                lineHeight = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
            val providerLine = listOf(sch.provider, sch.amount).filter { it.isNotBlank() }.joinToString(" · ")
            if (providerLine.isNotEmpty()) {
                Text(
                    text = providerLine,
                    fontSize = 17.sp,
                    lineHeight = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = WisdomAccentRose
                )
            }

            if (sch.eligibility.isNotBlank()) {
                InfoBox("Eligibility", Icons.Filled.CheckCircle, WisdomAccentRose) {
                    Text(text = sch.eligibility, style = GuideBodyStyle)
                }
            }

            if (sch.body.isNotBlank()) {
                Text(
                    text = sch.body.trim(),
                    style = GuideBodyStyle,
                    maxLines = if (expanded || !longBody) Int.MAX_VALUE else 3,
                    overflow = TextOverflow.Ellipsis
                )
            }

            if (longBody) {
                ExpandPill(
                    label = if (expanded) "Show less" else "Read full details",
                    expanded = expanded,
                    accent = WisdomAccentRose,
                    fullWidth = false,
                    onToggle = { expanded = !expanded }
                )
            }

            if (sch.externalUrl.isNotBlank()) {
                LinkPill(label = "Apply / Official Page", accent = WisdomAccentRose, filled = true) {
                    openLink(context, sch.externalUrl)
                }
            }
        }
    }
}
