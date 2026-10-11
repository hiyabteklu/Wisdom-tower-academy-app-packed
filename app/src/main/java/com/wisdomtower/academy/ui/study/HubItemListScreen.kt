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
import com.wisdomtower.academy.data.content.ContentListResult
import com.wisdomtower.academy.data.content.LearningContentRepository
import com.wisdomtower.academy.data.content.LearningResource
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted
import org.json.JSONObject

/** Hubs whose list rows show a count (cards / questions), so their list needs the `meta` JSON too. */
private val COUNT_HUBS = setOf("flashcards", "question-banks", "exams")

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
                        ItemRow(item = item, hubId = hubId, isNew = isNew) {
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

@Composable
private fun ItemRow(item: LearningResource, hubId: String, isNew: Boolean, onClick: () -> Unit) {
    val count = remember(item.id, item.metaJson) { itemCount(item) }
    val countText = when {
        count == null -> null
        hubId == "flashcards" -> "$count ${if (count == 1) "card" else "cards"}"
        else -> "$count ${if (count == 1) "question" else "questions"}"
    }
    val subline = listOfNotNull(item.chapter?.let { "Chapter $it" }, countText).joinToString(" \u00B7 ")

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 14.dp),
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
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = WisdomMuted,
                modifier = Modifier.size(22.dp)
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
