package com.wisdomtower.academy.ui.study

import android.content.Context
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Download
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.data.content.BookFileStore
import com.wisdomtower.academy.data.content.ContentItemResult
import com.wisdomtower.academy.data.content.ContentListResult
import com.wisdomtower.academy.data.content.LearningContentRepository
import com.wisdomtower.academy.data.content.LearningResource
import com.wisdomtower.academy.data.content.SavedContent
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

/** Hubs whose list rows show a count (cards / questions), so their list needs the `meta` JSON too. */
private val COUNT_HUBS = setOf("flashcards", "question-banks", "exams")

/** Progress value meaning "downloading, size not known" (notes, flashcards, questions have no byte count). */
private const val SIZE_UNKNOWN = -1f

/** Soft red used for "remove" and failure texts. */
private val RemoveRed = Color(0xFFFDA4AF)

/**
 * Native list of the items inside one learning hub of one course (plan step N2). Replaces the website's
 * hub page for the hubs that have a native viewer. Texts and row content copied from the website's
 * `components/learning/HubContentView.tsx`:
 *  - not signed in: "Sign in to open" + its sentence (real content needs a signed-in student);
 *  - row: title, "Chapter N", "N cards" (flashcards) or "N questions" (question banks, exams), a "New" badge
 *    until the item was opened once on this phone;
 *  - empty: "No published materials in this hub yet. Check back soon."; failure: its message + "Retry".
 * Data: [LearningContentRepository.list] (direct Supabase read, offline copy).
 *
 * F4 (2026-10-12, owner report problem 4): every row has a small Download button on the item itself. Books are
 * saved with [BookFileStore] (real percent while downloading); notes, flashcard decks, question banks and exams
 * are saved with [LearningContentRepository.getResource] (`refresh = true`), after which they open offline and
 * instantly. While downloading the button shows the percent (or a spinner when the size is unknown) and a thin
 * bar appears under the row; when done it turns into a green check and the row says "Saved offline"; a failure
 * says so under the row and a tap on the button tries again. The "downloaded" marks are kept in the preferences
 * file `wt_downloaded_resources` (ids only). A download stops if the student leaves this list.
 *
 * F4b (2026-10-12, owner choice "Download all + delete saved items"):
 *  - "Download all (n)" above the list saves every item of this hub that is not saved yet, one after the other
 *    ("Downloading 2 of 10..."); an item that fails is marked as failed and the next one goes on;
 *  - a tap on the green check of an item asks "Remove from this phone?" and deletes only that saved copy;
 *  - "Remove saved (n)" asks once and deletes every saved item of this hub ([SavedContent]).
 *    Reading progress is kept; the item can be downloaded again at any time.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
@Composable
fun HubItemListScreen(
    scopePath: String,
    hubId: String,
    hubName: String,
    courseTitle: String,
    onBack: () -> Unit,
    onOpenItem: (LearningResource) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val loggedIn by AuthStateManager.isLoggedIn.collectAsState()
    var result by remember(scopePath, hubId) { mutableStateOf<ContentListResult?>(null) }
    var reload by remember { mutableStateOf(0) }
    val seenPrefs = remember { context.getSharedPreferences("wt_seen_resources", Context.MODE_PRIVATE) }
    var seen by remember { mutableStateOf<Set<String>>(seenPrefs.getStringSet("ids", null)?.toSet() ?: emptySet()) }

    // F4: downloads (ids saved on this phone, ids busy right now with their progress, ids that failed)
    val downloadScope = rememberCoroutineScope()
    val downloadPrefs = remember { context.getSharedPreferences("wt_downloaded_resources", Context.MODE_PRIVATE) }
    var downloaded by remember { mutableStateOf<Set<String>>(downloadPrefs.getStringSet("ids", null)?.toSet() ?: emptySet()) }
    var busy by remember { mutableStateOf<Map<String, Float>>(emptyMap()) }
    var failed by remember { mutableStateOf<Set<String>>(emptySet()) }

    // T4 (2026-10-12): Real book file sizes (memory map keyed by resource id)
    var fileSizeMap by remember { mutableStateOf<Map<String, Long>>(emptyMap()) }
    val probeScope = rememberCoroutineScope()

    // F4b: "Download all" progress (items done, items in total) and the items waiting for a "Remove" answer
    var bulk by remember { mutableStateOf<Pair<Int, Int>?>(null) }
    var confirmRemove by remember { mutableStateOf<List<LearningResource>?>(null) }

    /** Saves one item. The caller has already put the item into [busy]; this removes it again at the end. */
    suspend fun runDownload(item: LearningResource) {
        failed = failed - item.id
        try {
            downloadItem(context, item) { fraction -> busy = busy + (item.id to fraction) }
            downloaded = downloaded + item.id
            downloadPrefs.edit().putStringSet("ids", downloaded.toSet()).apply()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            failed = failed + item.id
        } finally {
            busy = busy - item.id
        }
    }

    fun startDownload(item: LearningResource) {
        if (item.id in busy) return
        busy = busy + (item.id to SIZE_UNKNOWN)
        downloadScope.launch { runDownload(item) }
    }

    fun downloadAll(all: List<LearningResource>) {
        if (bulk != null) return
        val todo = all.filter { it.id !in downloaded && it.id !in busy }
        if (todo.isEmpty()) return
        bulk = 0 to todo.size
        downloadScope.launch {
            try {
                for ((index, item) in todo.withIndex()) {
                    busy = busy + (item.id to SIZE_UNKNOWN)
                    runDownload(item)
                    bulk = (index + 1) to todo.size
                }
            } finally {
                bulk = null
            }
        }
    }

    fun removeSaved(list: List<LearningResource>) {
        downloadScope.launch {
            withContext(Dispatchers.IO) {
                for (item in list) SavedContent.delete(context, item)
            }
            val ids = list.map { it.id }.toSet()
            downloaded = downloaded - ids
            downloadPrefs.edit().putStringSet("ids", downloaded.toSet()).apply()
            failed = failed - ids
        }
    }

    LaunchedEffect(scopePath, hubId, loggedIn, reload) {
        if (loggedIn) {
            result = null
            result = LearningContentRepository.list(context, scopePath, hubId, full = hubId in COUNT_HUBS)
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item(key = "hub_list_header") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ScreenBackButton(onBack)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = courseTitle.uppercase(),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WisdomCyan,
                            letterSpacing = 1.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = hubName,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            val current = result
            when {
                !loggedIn -> item(key = "hub_list_signin") {
                    MessageCard(
                        title = "Sign in to open",
                        message = "Create a free account to unlock books, notes, questions, and exams. " +
                            "No payment required for registered students.",
                        onRetry = null
                    )
                }

                current == null -> item(key = "hub_list_loading") {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = WisdomCyan)
                    }
                }

                current is ContentListResult.Failure -> item(key = "hub_list_failure") {
                    MessageCard(title = null, message = current.message, onRetry = { reload += 1 })
                }

                current is ContentListResult.Success && current.items.isEmpty() -> item(key = "hub_list_empty") {
                    MessageCard(
                        title = null,
                        message = "No published materials in this hub yet. Check back soon.",
                        onRetry = null
                    )
                }

                current is ContentListResult.Success -> {
                    // T4: If this is the books hub, load cached file sizes instantly and probe missing ones quietly
                    LaunchedEffect(current.items, hubId) {
                        if (hubId == "books") {
                            // 1) Quick read of local cache / saved files (no network)
                            val quickSizes = mutableMapOf<String, Long>()
                            for (item in current.items) {
                                BookFileStore.getCachedFileSize(context, item.id)?.let {
                                    quickSizes[item.id] = it
                                }
                            }
                            if (quickSizes.isNotEmpty()) {
                                fileSizeMap = fileSizeMap + quickSizes
                            }

                            // 2) Probe remaining un-downloaded books with lightweight HEAD / Range request
                            for (item in current.items) {
                                if (item.id !in fileSizeMap && item.id !in quickSizes) {
                                    val url = LearningContentRepository.appwriteViewUrl(item.storagePath)
                                    if (url != null) {
                                        val probed = BookFileStore.probeFileSize(context, item.id, url)
                                        if (probed != null && probed > 0L) {
                                            fileSizeMap = fileSizeMap + (item.id to probed)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    item(key = "hub_list_tools") {
                        DownloadTools(
                            todo = current.items.count { it.id !in downloaded },
                            saved = current.items.count { it.id in downloaded },
                            bulk = bulk,
                            onDownloadAll = { downloadAll(current.items) },
                            onRemoveAll = { confirmRemove = current.items.filter { it.id in downloaded } }
                        )
                    }
                    items(current.items, key = { it.id }) { item ->
                        val isNew = item.id !in seen
                        ItemRow(
                            item = item,
                            hubId = hubId,
                            isNew = isNew,
                            isDownloaded = item.id in downloaded,
                            knownSize = if (hubId == "books") fileSizeMap[item.id] else null,
                            progress = busy[item.id],
                            hasFailed = item.id in failed,
                            onDownload = { startDownload(item) },
                            onRemove = { confirmRemove = listOf(item) }
                        ) {
                            seen = seen + item.id
                            seenPrefs.edit().putStringSet("ids", seen.toSet()).apply()
                            onOpenItem(item)
                        }
                    }
                }
            }

            item(key = "hub_list_bottom") { Spacer(modifier = Modifier.height(32.dp)) }
        }

        val toRemove = confirmRemove
        if (toRemove != null && toRemove.isNotEmpty()) {
            AlertDialog(
                onDismissRequest = { confirmRemove = null },
                containerColor = Color(0xFF111B2E),
                title = {
                    Text(
                        text = if (toRemove.size == 1) "Remove from this phone?" else "Remove ${toRemove.size} saved items?",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                },
                text = {
                    Text(
                        text = if (toRemove.size == 1) {
                            "\"${toRemove[0].title}\" will no longer open offline. You can download it again at any time."
                        } else {
                            "These items will no longer open offline. You can download them again at any time."
                        },
                        color = WisdomMuted
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        removeSaved(toRemove)
                        confirmRemove = null
                    }) {
                        Text(text = "Remove", color = RemoveRed, fontWeight = FontWeight.SemiBold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { confirmRemove = null }) {
                        Text(text = "Cancel", color = WisdomCyan, fontWeight = FontWeight.SemiBold)
                    }
                }
            )
        }
    }
}

/**
 * Saves one item on the phone. Books: the PDF file (progress 0..1 through [onProgress]). Everything else: the
 * full row from the server, saved by the repository (throws when the server could not be reached, so a stale
 * copy is never reported as "downloaded").
 */
private suspend fun downloadItem(context: Context, item: LearningResource, onProgress: (Float) -> Unit) {
    if (item.contentType == "pdf") {
        val url = LearningContentRepository.appwriteViewUrl(item.storagePath)
            ?: throw IllegalStateException("No file address")
        BookFileStore.ensureFile(context, item.id, url, onProgress)
    } else {
        val result = LearningContentRepository.getResource(context, item.id, refresh = true)
        val found = result as? ContentItemResult.Found ?: throw IllegalStateException("Not available")
        if (found.fromCache) throw java.io.IOException("Offline")
    }
}

/**
 * The two buttons above the list: "Download all (n)" (n = items not saved yet) or, while it runs,
 * "Downloading 2 of 10..."; and "Remove saved (n)" when something of this hub is saved.
 */
@Composable
private fun DownloadTools(
    todo: Int,
    saved: Int,
    bulk: Pair<Int, Int>?,
    onDownloadAll: () -> Unit,
    onRemoveAll: () -> Unit
) {
    if (bulk == null && todo == 0 && saved == 0) return
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (bulk != null) {
            ToolPill(
                text = "Downloading ${minOf(bulk.first + 1, bulk.second)} of ${bulk.second}\u2026",
                color = WisdomCyan,
                enabled = false,
                onClick = {}
            )
        } else {
            if (todo > 0) {
                ToolPill(text = "Download all ($todo)", color = WisdomCyan, enabled = true, onClick = onDownloadAll)
            }
            if (saved > 0) {
                ToolPill(text = "Remove saved ($saved)", color = RemoveRed, enabled = true, onClick = onRemoveAll)
            }
        }
    }
}

/** Small rounded text button (same look as the "Retry" button of the message card). */
@Composable
private fun ToolPill(text: String, color: Color, enabled: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(color.copy(alpha = 0.12f))
            .border(BorderStroke(1.dp, color.copy(alpha = 0.45f)), RoundedCornerShape(10.dp))
            .clickable(
                enabled = enabled,
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(color = color.copy(alpha = 0.25f)),
                onClick = onClick
            )
            .padding(horizontal = 14.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(text = text, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = color)
    }
}

@Composable
private fun ItemRow(
    item: LearningResource,
    hubId: String,
    isNew: Boolean,
    isDownloaded: Boolean,
    knownSize: Long?,
    progress: Float?,
    hasFailed: Boolean,
    onDownload: () -> Unit,
    onRemove: () -> Unit,
    onClick: () -> Unit
) {
    val count = remember(item.id, item.metaJson) { itemCount(item) }
    val countText = when {
        count == null -> null
        hubId == "flashcards" -> "$count ${if (count == 1) "card" else "cards"}"
        else -> "$count ${if (count == 1) "question" else "questions"}"
    }
    val sizeText = when {
        hubId != "books" -> null
        knownSize != null && knownSize > 0L -> BookFileStore.formatBytes(knownSize)
        else -> null
    }
    val subline = listOfNotNull(
        item.chapter?.let { "Chapter $it" },
        sizeText,
        countText,
        if (isDownloaded) "Saved offline" else null
    ).joinToString(" \u00B7 ")

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 14.dp, end = 8.dp, top = 12.dp, bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = item.title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    if (isNew) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "NEW",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFFFECDD3)
                        )
                    }
                }
                if (subline.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = subline, fontSize = 12.sp, color = WisdomMuted)
                }
                if (progress != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    if (progress >= 0f) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(Color.White.copy(alpha = 0.1f))
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(progress.coerceIn(0f, 1f))
                                    .height(4.dp)
                                    .background(WisdomCyan)
                            )
                        }
                    } else {
                        Text(text = "Downloading\u2026", fontSize = 11.sp, color = WisdomCyan)
                    }
                } else if (hasFailed) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Download failed. Check your connection and tap the button to try again.",
                        fontSize = 11.sp,
                        color = RemoveRed
                    )
                }
            }
            Spacer(modifier = Modifier.width(8.dp))
            DownloadButton(
                isDownloaded = isDownloaded,
                progress = progress,
                onClick = if (isDownloaded) onRemove else onDownload
            )
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = WisdomMuted,
                modifier = Modifier.size(22.dp)
            )
        }
    }
}

/**
 * Small round button on the item: download arrow, percent or spinner while busy, green check when saved.
 * F4b: the green check can be tapped (it asks before removing the saved copy); [onClick] is the download
 * for a not saved item and the remove question for a saved one.
 */
@Composable
private fun DownloadButton(isDownloaded: Boolean, progress: Float?, onClick: () -> Unit) {
    val enabled = progress == null
    Box(
        modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(Color(0xFF111B2E).copy(alpha = 0.8f))
            .border(
                BorderStroke(1.dp, if (isDownloaded) Color(0xFF34D399).copy(alpha = 0.6f) else WisdomBorderWhite),
                CircleShape
            )
            .clickable(
                enabled = enabled,
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(color = WisdomCyan.copy(alpha = 0.25f)),
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        when {
            isDownloaded -> Icon(
                imageVector = Icons.Filled.CheckCircle,
                contentDescription = "Saved offline. Tap to remove",
                tint = Color(0xFF34D399),
                modifier = Modifier.size(20.dp)
            )

            progress == null -> Icon(
                imageVector = Icons.Filled.Download,
                contentDescription = "Download for offline use",
                tint = WisdomCyan,
                modifier = Modifier.size(20.dp)
            )

            progress >= 0f -> Text(
                text = "${(progress.coerceIn(0f, 1f) * 100).toInt()}%",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = WisdomCyan
            )

            else -> CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                color = WisdomCyan,
                strokeWidth = 2.dp
            )
        }
    }
}

/** Number of flashcards or questions inside the row's `meta`, or null when it has neither. */
private fun itemCount(item: LearningResource): Int? = runCatching {
    val meta = JSONObject(item.metaJson)
    (meta.optJSONArray("cards") ?: meta.optJSONArray("questions"))?.length()
}.getOrNull()

@Composable
private fun MessageCard(title: String?, message: String, onRetry: (() -> Unit)?) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF111B2E).copy(alpha = 0.8f))
            .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(16.dp))
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (title != null) {
            Text(text = title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.height(8.dp))
        }
        Text(
            text = message,
            fontSize = 13.sp,
            color = WisdomMuted,
            textAlign = TextAlign.Center
        )
        if (onRetry != null) {
            Spacer(modifier = Modifier.height(14.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(10.dp))
                    .background(WisdomCyan.copy(alpha = 0.12f))
                    .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.45f)), RoundedCornerShape(10.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = ripple(color = WisdomCyan.copy(alpha = 0.25f)),
                        onClick = onRetry
                    )
                    .padding(horizontal = 18.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "Retry", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = WisdomCyan)
            }
        }
    }
}

/** The round back button used at the top of the study screens (same look as the package and workspace pages). */
@Composable
internal fun ScreenBackButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(Color(0xFF111B2E).copy(alpha = 0.85f))
            .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Back",
            tint = Color.White,
            modifier = Modifier.size(20.dp)
        )
    }
}
