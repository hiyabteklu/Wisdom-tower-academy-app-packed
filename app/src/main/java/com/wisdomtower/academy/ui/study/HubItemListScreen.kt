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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
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
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import org.json.JSONObject

/** Hubs whose list rows show a count (cards / questions), so their list needs the `meta` JSON too. */
private val COUNT_HUBS = setOf("flashcards", "question-banks", "exams")

/** Progress value meaning "downloading, size not known" (notes, flashcards, questions have no byte count). */
private const val SIZE_UNKNOWN = -1f

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

    fun startDownload(item: LearningResource) {
        if (item.id in busy) return
        busy = busy + (item.id to SIZE_UNKNOWN)
        failed = failed - item.id
        downloadScope.launch {
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
                    items(current.items, key = { it.id }) { item ->
                        val isNew = item.id !in seen
                        ItemRow(
                            item = item,
                            hubId = hubId,
                            isNew = isNew,
                            isDownloaded = item.id in downloaded,
                            progress = busy[item.id],
                            hasFailed = item.id in failed,
                            onDownload = { startDownload(item) }
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

@Composable
private fun ItemRow(
    item: LearningResource,
    hubId: String,
    isNew: Boolean,
    isDownloaded: Boolean,
    progress: Float?,
    hasFailed: Boolean,
    onDownload: () -> Unit,
    onClick: () -> Unit
) {
    val count = remember(item.id, item.metaJson) { itemCount(item) }
    val countText = when {
        count == null -> null
        hubId == "flashcards" -> "$count ${if (count == 1) "card" else "cards"}"
        else -> "$count ${if (count == 1) "question" else "questions"}"
    }
    val subline = listOfNotNull(
        item.chapter?.let { "Chapter $it" },
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
                        color = Color(0xFFFDA4AF)
                    )
                }
            }
            Spacer(modifier = Modifier.width(8.dp))
            DownloadButton(isDownloaded = isDownloaded, progress = progress, onClick = onDownload)
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = WisdomMuted,
                modifier = Modifier.size(22.dp)
            )
        }
    }
}

/** Small round button on the item: download arrow, percent or spinner while busy, green check when saved. */
@Composable
private fun DownloadButton(isDownloaded: Boolean, progress: Float?, onClick: () -> Unit) {
    val enabled = !isDownloaded && progress == null
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
                contentDescription = "Saved offline",
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
internal fun ScreenBackButton(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(Color(0xFF111B2E).copy(alpha = 0.8f))
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
            modifier = Modifier.size(18.dp)
        )
    }
}
