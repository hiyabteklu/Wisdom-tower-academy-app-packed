package com.wisdomtower.academy.ui.study

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.WisdomCyan

/**
 * Download states for offline learning materials (books, notes, flashcards, exams, question banks).
 */
enum class DownloadState {
    IDLE,
    DOWNLOADING,
    DOWNLOADED,
    FAILED
}

/**
 * T5 (2026-10-12): Real circular download gauge.
 *
 * Owner words:
 * "The download progress for all: a real circular gauge, not big, just as it is the spinning
 * circle there, but instead of spinning indefinitely it shows the real progress and the percent
 * inside the circle until it changes into a check mark."
 *
 * - When [state] is [DownloadState.DOWNLOADING]:
 *   - If [progress] is known (0f..1f): shows a determinate circular gauge with the percent
 *     (e.g. "45%") inside the circle.
 *   - If [progress] is unknown (null or < 0f): shows an indeterminate spinner with NO percent (G4).
 * - When [state] is [DownloadState.DOWNLOADED]: turns into the existing green check mark.
 * - When [state] is [DownloadState.FAILED]: turns into a clear red retry icon.
 * - When [state] is [DownloadState.IDLE]: shows the standard download arrow.
 */
@Composable
fun DownloadGauge(
    state: DownloadState,
    progress: Float?,
    modifier: Modifier = Modifier,
    size: Dp = 22.dp,
    strokeWidth: Dp = 2.dp,
    color: Color = WisdomCyan,
    downloadedColor: Color = Color(0xFF34D399),
    failedColor: Color = Color(0xFFF87171),
    trackColor: Color = WisdomCyan.copy(alpha = 0.2f)
) {
    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        when (state) {
            DownloadState.DOWNLOADED -> {
                Icon(
                    imageVector = Icons.Filled.CheckCircle,
                    contentDescription = "Saved offline. Tap to remove",
                    tint = downloadedColor,
                    modifier = Modifier.size(size.coerceAtMost(22.dp))
                )
            }

            DownloadState.FAILED -> {
                Icon(
                    imageVector = Icons.Filled.Refresh,
                    contentDescription = "Download failed. Tap to retry",
                    tint = failedColor,
                    modifier = Modifier.size(size.coerceAtMost(22.dp))
                )
            }

            DownloadState.IDLE -> {
                Icon(
                    imageVector = Icons.Filled.Download,
                    contentDescription = "Download for offline use",
                    tint = color,
                    modifier = Modifier.size(size.coerceAtMost(22.dp))
                )
            }

            DownloadState.DOWNLOADING -> {
                if (progress != null && progress >= 0f) {
                    val p = progress.coerceIn(0f, 1f)
                    val pct = (p * 100).toInt()
                    CircularProgressIndicator(
                        progress = { p },
                        modifier = Modifier.size(size),
                        color = color,
                        strokeWidth = strokeWidth,
                        trackColor = trackColor
                    )
                    if (size >= 18.dp) {
                        Text(
                            text = "$pct%",
                            fontSize = if (pct >= 100) 6.sp else if (size >= 24.dp) 8.sp else 7.sp,
                            fontWeight = FontWeight.Bold,
                            color = color,
                            maxLines = 1
                        )
                    }
                } else {
                    // Total unknown: keep indefinite spinner and show NO percent (rule G4)
                    CircularProgressIndicator(
                        modifier = Modifier.size(size),
                        color = color,
                        strokeWidth = strokeWidth,
                        trackColor = trackColor
                    )
                }
            }
        }
    }
}

/**
 * Convenience overload deriving [DownloadState] from flags.
 */
@Composable
fun DownloadGauge(
    isDownloaded: Boolean,
    progress: Float?,
    failed: Boolean = false,
    modifier: Modifier = Modifier,
    size: Dp = 22.dp,
    strokeWidth: Dp = 2.dp,
    color: Color = WisdomCyan,
    downloadedColor: Color = Color(0xFF34D399),
    failedColor: Color = Color(0xFFF87171),
    trackColor: Color = WisdomCyan.copy(alpha = 0.2f)
) {
    val state = when {
        isDownloaded -> DownloadState.DOWNLOADED
        progress != null -> DownloadState.DOWNLOADING
        failed -> DownloadState.FAILED
        else -> DownloadState.IDLE
    }
    DownloadGauge(
        state = state,
        progress = progress,
        modifier = modifier,
        size = size,
        strokeWidth = strokeWidth,
        color = color,
        downloadedColor = downloadedColor,
        failedColor = failedColor,
        trackColor = trackColor
    )
}
