package com.wisdomtower.academy.ui.study

import android.content.Context
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Scoreboard
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.wisdomtower.academy.ui.packages.NATIVE_LEARNING_HUBS
import com.wisdomtower.academy.ui.packages.NativeLearningHub
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

data class StudyHistoryRecord(
    val id: String,
    val title: String,
    val scorePercent: Int,
    val dateLabel: String,
    val hubName: String
)

/**
 * Native Study Workspace Screen matching:
 * - website-reference/src/components/ResourceHubGrid.tsx
 * - website-reference/src/components/AcademicResultSaver.tsx
 * - website-reference/src/app/academy/[slug] courses
 *
 * Provides:
 * 1. Breadcrumb & Subject header
 * 2. Academic Result Saver & Performance Gauge
 * 3. Recent Study & Exam History block (offline-capable)
 * 4. The 6 Learning Hub Cards (Books, Short Notes, Flashcards, Question Banks, Exams, Life Savers)
 * 5. Single Alive WebView Handoff on hub card tap
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
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("wt_study_history", Context.MODE_PRIVATE) }
    val historyKey = remember(basePath) { "history_${basePath.replace("/", "_")}" }

    var showRecordDialog by remember { mutableStateOf(false) }
    val historyRecords = remember { mutableStateListOf<StudyHistoryRecord>() }

    // Load recorded results for this subject/scope
    LaunchedEffect(historyKey) {
        val raw = prefs.getString(historyKey, "") ?: ""
        historyRecords.clear()
        if (raw.isNotBlank()) {
            val items = raw.split(";;").filter { it.isNotBlank() }
            for (item in items) {
                val parts = item.split("::")
                if (parts.size >= 5) {
                    historyRecords.add(
                        StudyHistoryRecord(
                            id = parts[0],
                            title = parts[1],
                            scorePercent = parts[2].toIntOrNull() ?: 0,
                            dateLabel = parts[3],
                            hubName = parts[4]
                        )
                    )
                }
            }
        }
    }

    fun saveRecord(title: String, score: Int, hubName: String) {
        val newRecord = StudyHistoryRecord(
            id = "rec_${System.currentTimeMillis()}",
            title = title,
            scorePercent = score,
            dateLabel = "Today",
            hubName = hubName
        )
        historyRecords.add(0, newRecord)
        val serialized = historyRecords.joinToString(";;") {
            "${it.id}::${it.title}::${it.scorePercent}::${it.dateLabel}::${it.hubName}"
        }
        prefs.edit().putString(historyKey, serialized).apply()
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

            // Academic Result Saver Card (Progress & Grade Status)
            item(key = "academic_result_saver") {
                val averageScore = if (historyRecords.isEmpty()) null else historyRecords.map { it.scorePercent }.average().toInt()

                WisdomModernCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 16.dp
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
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
                                        imageVector = Icons.Default.Scoreboard,
                                        contentDescription = null,
                                        tint = WisdomCyan,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                                Column {
                                    Text(
                                        text = "Performance Tracker",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = if (averageScore != null) "Average: $averageScore% (${getGradeLabel(averageScore)})" else "No test records yet",
                                        fontSize = 11.sp,
                                        color = if (averageScore != null) WisdomAccentEmerald else WisdomMuted
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(WisdomCyan.copy(alpha = 0.12f))
                                    .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.35f)), RoundedCornerShape(8.dp))
                                    .clickable { showRecordDialog = true }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Add,
                                        contentDescription = null,
                                        tint = WisdomCyan,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Log Score",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = WisdomCyan
                                    )
                                }
                            }
                        }

                        if (averageScore != null) {
                            Spacer(modifier = Modifier.height(12.dp))
                            // Progress bar
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(Color.White.copy(alpha = 0.08f))
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(fraction = (averageScore / 100f).coerceIn(0f, 1f))
                                        .height(6.dp)
                                        .background(
                                            Brush.horizontalGradient(
                                                listOf(WisdomCyan, WisdomAccentEmerald)
                                            )
                                        )
                                )
                            }
                        }
                    }
                }
            }

            // Recent Activity / Exam History Section
            item(key = "history_header") {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recent Activity & Drills",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    if (historyRecords.isNotEmpty()) {
                        Text(
                            text = "${historyRecords.size} logged",
                            fontSize = 11.sp,
                            color = WisdomMuted
                        )
                    }
                }
            }

            if (historyRecords.isEmpty()) {
                item(key = "history_empty") {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF0F172A).copy(alpha = 0.5f))
                            .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.06f)), RoundedCornerShape(12.dp))
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.History,
                                contentDescription = null,
                                tint = WisdomMuted.copy(alpha = 0.6f),
                                modifier = Modifier.size(24.dp)
                            )
                            Text(
                                text = "No study sessions or test scores recorded yet",
                                fontSize = 12.sp,
                                color = WisdomMuted,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = "Select any hub card below to begin reading or solving exercises.",
                                fontSize = 10.sp,
                                color = WisdomMuted.copy(alpha = 0.7f),
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            } else {
                items(historyRecords.take(3), key = { it.id }) { record ->
                    StudyHistoryItemRow(record = record)
                }
            }

            // Section 4: Learning Hubs Title
            item(key = "learning_hubs_title") {
                Column(modifier = Modifier.padding(top = 10.dp)) {
                    Text(
                        text = "Learning Hubs",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "All 6 academic study formats with verified curriculum coverage",
                        fontSize = 12.sp,
                        color = WisdomMuted
                    )
                }
            }

            // 6 Learning Hub Cards (Books, Short Notes, Flashcards, Question Banks, Exams, Life Savers)
            items(NATIVE_LEARNING_HUBS, key = { it.id }) { hub ->
                StudyHubCard(
                    hub = hub,
                    onClick = {
                        val fullPath = "$basePath/${hub.id}"
                        val url = if (fullPath.startsWith("http")) fullPath else "https://www.wisdom-tower-academy.live$fullPath"
                        onOpenHub(hub.id, url)
                    }
                )
            }

            item(key = "bottom_space") {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }

        // Score recording dialog
        if (showRecordDialog) {
            RecordScoreDialog(
                onDismiss = { showRecordDialog = false },
                onSave = { title, score, hubName ->
                    saveRecord(title, score, hubName)
                    showRecordDialog = false
                }
            )
        }
    }
}

@Composable
fun StudyHubCard(
    hub: NativeLearningHub,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        onClick = onClick
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // 16:9 Aspect Ratio Hub Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .background(WisdomDark)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(hub.assetImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = hub.name,
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
                                    Color(0x66000000),
                                    Color(0xCC060B15)
                                )
                            )
                        )
                )

                // Hub category tag in corner
                Box(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(12.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color(0xFF060B15).copy(alpha = 0.85f))
                        .border(BorderStroke(1.dp, hub.accentColor.copy(alpha = 0.4f)), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = hub.name.uppercase(),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = hub.accentColor,
                        letterSpacing = 0.8.sp
                    )
                }
            }

            // Info & Action Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = hub.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = hub.description,
                        fontSize = 12.sp,
                        color = WisdomMuted,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        lineHeight = 16.sp
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.08f))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)), RoundedCornerShape(10.dp))
                        .clickable(onClick = onClick)
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Open",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.Default.ChevronRight,
                            contentDescription = null,
                            tint = WisdomCyan,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StudyHistoryItemRow(record: StudyHistoryRecord) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF111B2E).copy(alpha = 0.6f))
            .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(
                            when {
                                record.scorePercent >= 80 -> WisdomAccentEmerald.copy(alpha = 0.15f)
                                record.scorePercent >= 60 -> WisdomCyan.copy(alpha = 0.15f)
                                else -> WisdomAccentAmber.copy(alpha = 0.15f)
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${record.scorePercent}%",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = when {
                            record.scorePercent >= 80 -> WisdomAccentEmerald
                            record.scorePercent >= 60 -> WisdomCyan
                            else -> WisdomAccentAmber
                        }
                    )
                }

                Column {
                    Text(
                        text = record.title,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "${record.hubName} · ${record.dateLabel}",
                        fontSize = 10.sp,
                        color = WisdomMuted
                    )
                }
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color.White.copy(alpha = 0.05f))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = getGradeLabel(record.scorePercent),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun RecordScoreDialog(
    onDismiss: () -> Unit,
    onSave: (title: String, score: Int, hubName: String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var scoreText by remember { mutableStateOf("") }
    var selectedHub by remember { mutableStateOf("Exams") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Log Exam / Drill Score",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = WisdomMuted,
                        modifier = Modifier
                            .size(20.dp)
                            .clickable(onClick = onDismiss)
                    )
                }

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Topic / Chapter (e.g. Chapter 2 Quiz)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = WisdomCyan,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
                        focusedLabelColor = WisdomCyan,
                        unfocusedLabelColor = WisdomMuted
                    )
                )

                OutlinedTextField(
                    value = scoreText,
                    onValueChange = { if (it.length <= 3 && it.all { c -> c.isDigit() }) scoreText = it },
                    label = { Text("Score Percent (0-100)") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Done),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = WisdomCyan,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
                        focusedLabelColor = WisdomCyan,
                        unfocusedLabelColor = WisdomMuted
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = onDismiss,
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                    ) {
                        Text("Cancel", color = WisdomMuted)
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = {
                            val score = scoreText.toIntOrNull() ?: 0
                            val finalTitle = title.ifBlank { "Practice Drill" }
                            onSave(finalTitle, score.coerceIn(0, 100), selectedHub)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = WisdomCyan),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Save Result", color = WisdomDark, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

fun getGradeLabel(score: Int): String {
    return when {
        score >= 85 -> "Extraordinary"
        score >= 70 -> "Excellent"
        score >= 55 -> "Good Progress"
        score >= 40 -> "Needs Review"
        else -> "Just Started"
    }
}
