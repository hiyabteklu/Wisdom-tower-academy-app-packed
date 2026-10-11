package com.wisdomtower.academy.ui.study

import androidx.activity.compose.BackHandler
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.content.LearningContentRepository
import com.wisdomtower.academy.data.content.LearningResource
import com.wisdomtower.academy.ui.packages.NATIVE_LEARNING_HUBS
import com.wisdomtower.academy.ui.packages.OpenCard
import com.wisdomtower.academy.ui.packages.openGrid
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted

private const val SITE_ORIGIN = "https://www.wisdom-tower-academy.live"

/**
 * Hubs that open in a NATIVE screen (list from Supabase + native viewer) instead of the website page.
 * "books" (native PDF reader, plan steps N2 + N4) and "short-notes" (local KaTeX page, step N6).
 * To switch a hub back to the website page (for example if the native screen misbehaves on a phone),
 * remove its id from this set: nothing else changes.
 */
private val NATIVE_HUB_IDS = setOf("books", "short-notes")

/** Which native screen is open on top of the six hub cards (null = the cards themselves). */
private sealed interface WorkspaceView {
    data class HubList(val hubId: String) : WorkspaceView
    data class Pdf(val item: LearningResource) : WorkspaceView
    data class Note(val item: LearningResource) : WorkspaceView
}

/**
 * Website route shapes (website-reference/src/app/academy):
 *  - hubs live at /academy/{coc|uat|gat|exit-exam}/{hub}
 *  - hubs live at /academy/freshman/{subject}/{hub}, /academy/remedial/{subject}/{hub},
 *    /academy/grades/{grade}/{subject}/{hub}, /academy/special-packages/{slug}/{semester}/{course}/{hub}
 *  - there is NO hub directly under /academy/freshman, /academy/remedial, /academy/grades/{grade}
 *    or /academy/special-packages/{slug}/{semester}: "{base}/books" there would be read as a subject
 *    or course called "books" and give "404 Page Not Found".
 *  - Entrance Questions: the YEAR page /academy/entrance-questions/{stream}/{subject}/{year} IS the exams
 *    hub (website `HubContentView` with hub `exams`); there are no six hubs below it.
 */
private val NEEDS_SUBJECT_LEVEL = Regex(
    "^/academy/(freshman|remedial|grades/[^/]+|special-packages/[^/]+/[^/]+)$"
)

private val ENTRANCE_YEAR_PATH = Regex(
    "^/academy/entrance-questions/[^/]+/[^/]+/[0-9]{4}$"
)

// Course page -> `learning_resources.scope_path`, as the website hub pages build it (`scopePath` in
// website-reference/src/app/academy/.../[resource]/page.tsx and `eceScope` in lib/content.ts).
private val SCOPE_FRESHMAN = Regex("^/academy/freshman/([^/]+)$")
private val SCOPE_REMEDIAL = Regex("^/academy/remedial/([^/]+)$")
private val SCOPE_GRADE = Regex("^/academy/grades/([^/]+)/([^/]+)$")
private val SCOPE_ECE = Regex("^/academy/special-packages/[^/]+/(sem-[12])/([^/]+)$")

private fun cleanBase(basePath: String): String {
    var base = basePath.trim()
    if (base.startsWith("http")) {
        base = base.removePrefix(SITE_ORIGIN)
    }
    base = base.substringBefore('?').substringBefore('#').trimEnd('/')
    if (base.isEmpty()) base = "/academy"
    return base
}

/** Address of an Entrance Questions year page (the exams page itself), or null for any other path. */
internal fun entranceYearUrl(basePath: String): String? {
    val base = cleanBase(basePath)
    return if (ENTRANCE_YEAR_PATH.matches(base)) SITE_ORIGIN + base else null
}

/**
 * The `learning_resources.scope_path` of the course at [basePath] (for example `freshman/physics`,
 * `grade/9/biology`, `remedial/maths`, `ece/sem-2/eceg3082`), or null when the path is not a course page
 * the native screens can read (COC / UAT / GAT, Entrance Questions, package levels): those keep using
 * the website page.
 */
internal fun contentScopePath(basePath: String): String? {
    var base = cleanBase(basePath)
    val last = base.substringAfterLast('/')
    if (NATIVE_LEARNING_HUBS.any { it.id == last }) {
        base = base.substringBeforeLast('/')
    }
    SCOPE_FRESHMAN.matchEntire(base)?.let { return "freshman/${it.groupValues[1]}" }
    SCOPE_REMEDIAL.matchEntire(base)?.let { return "remedial/${it.groupValues[1]}" }
    SCOPE_GRADE.matchEntire(base)?.let { return "grade/${it.groupValues[1]}/${it.groupValues[2]}" }
    SCOPE_ECE.matchEntire(base)?.let { return "ece/${it.groupValues[1]}/${it.groupValues[2]}" }
    return null
}

/**
 * Builds the address of a learning hub so it can never point at a page that does not exist:
 *  1. a base that already ends with a hub id (for example "/academy/freshman/books") loses that hub id
 *     first, so the hub is never doubled ("/books/books");
 *  2. a base that is only a package level without subjects opens the real package page instead of
 *     a hub that does not exist there.
 */
internal fun safeHubUrl(basePath: String, hubId: String): String {
    var base = cleanBase(basePath)

    val last = base.substringAfterLast('/')
    if (NATIVE_LEARNING_HUBS.any { it.id == last }) {
        base = base.substringBeforeLast('/')
    }

    val path = if (NEEDS_SUBJECT_LEVEL.matches(base)) base else "$base/$hubId"
    return SITE_ORIGIN + path
}

/**
 * Native Study Workspace Screen: header + the 6 Learning Hub cards.
 *
 * S12b (2026-10-11): removed everything the website does not have (Performance Tracker, Log Score,
 * Recent Activity & Drills, invented subtitle and grade labels). A real tracker must be rebuilt only
 * from the website's real data (see STATUS.md, S12b).
 *
 * Owner card rule (2026-10-11): every card is the shared [OpenCard] (picture, title, "Open") in a
 * two-column grid. The old hub card had a dark gradient over the picture, a category tag and a
 * description; all three are gone. Hub names are the website's (`data/academy.ts` `resourceHubs`).
 * Links: see [safeHubUrl].
 *
 * Entrance Questions year (2026-10-11): the year page is the exams page itself, so this screen opens it
 * straight away (LaunchedEffect) and, as a fallback if that is ever missed, shows a single "Exams" card.
 *
 * Native hubs (2026-10-11, plan N2 + N4 + N6): a hub listed in [NATIVE_HUB_IDS] opens [HubItemListScreen]
 * (rows read from Supabase) and then [PdfReaderScreen] (books) or [NotesReaderScreen] (short notes), all
 * inside this screen, so `MainActivity` is not involved. System Back goes viewer -> list -> the six cards.
 * The other hubs still open the website page through `onOpenHub`.
 * STATUS: not compiled.
 */
@Composable
fun StudyWorkspaceScreen(
    title: String,
    scopeSubtitle: String,
    basePath: String,
    onBack: () -> Unit,
    onOpenHub: (hubId: String, hubUrl: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val entranceUrl = remember(basePath) { entranceYearUrl(basePath) }
    val contentScope = remember(basePath) { contentScopePath(basePath) }
    var view by remember(basePath) { mutableStateOf<WorkspaceView?>(null) }

    if (entranceUrl != null) {
        LaunchedEffect(entranceUrl) {
            onOpenHub("exams", entranceUrl)
        }
    }

    BackHandler(enabled = view != null) {
        view = when (view) {
            is WorkspaceView.Pdf -> WorkspaceView.HubList("books")
            is WorkspaceView.Note -> WorkspaceView.HubList("short-notes")
            else -> null
        }
    }

    val shown = view
    if (shown != null && contentScope != null) {
        when (shown) {
            is WorkspaceView.HubList -> HubItemListScreen(
                scopePath = contentScope,
                hubId = shown.hubId,
                hubName = NATIVE_LEARNING_HUBS.firstOrNull { it.id == shown.hubId }?.name ?: shown.hubId,
                courseTitle = title,
                onBack = { view = null },
                onOpenItem = { item ->
                    when (item.contentType) {
                        "pdf" -> view = WorkspaceView.Pdf(item)
                        "markdown" -> view = WorkspaceView.Note(item)
                    }
                },
                modifier = modifier
            )

            is WorkspaceView.Pdf -> PdfReaderScreen(
                title = shown.item.title,
                url = LearningContentRepository.appwriteViewUrl(shown.item.storagePath),
                cacheKey = shown.item.id,
                onBack = { view = WorkspaceView.HubList("books") },
                modifier = modifier
            )

            is WorkspaceView.Note -> NotesReaderScreen(
                title = shown.item.title,
                resourceId = shown.item.id,
                onBack = { view = WorkspaceView.HubList("short-notes") },
                modifier = modifier
            )
        }
        return
    }

    val hubs = if (entranceUrl != null) {
        NATIVE_LEARNING_HUBS.filter { it.id == "exams" }
    } else {
        NATIVE_LEARNING_HUBS
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Top Navigation & Subject Title Header
            item(key = "workspace_header") {
                Column(modifier = Modifier.fillMaxWidth()) {
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

                        Column {
                            Text(
                                text = scopeSubtitle.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = WisdomCyan,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = title,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            // "Learning Hubs" label: same wording as the website course pages (small, uppercase, muted)
            item(key = "learning_hubs_title") {
                Text(
                    text = (if (entranceUrl != null) "Exams" else "Learning Hubs").uppercase(),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WisdomMuted,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // The 6 hub cards (Books, Short Notes, Flashcards, Question Banks, Exams, Life Savers);
            // for an Entrance Questions year only the Exams card (the year page itself)
            openGrid("hubs", hubs) { hub ->
                OpenCard(hub.name, hub.assetImage) {
                    if (entranceUrl == null && contentScope != null && hub.id in NATIVE_HUB_IDS) {
                        view = WorkspaceView.HubList(hub.id)
                    } else {
                        onOpenHub(hub.id, entranceUrl ?: safeHubUrl(basePath, hub.id))
                    }
                }
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}
