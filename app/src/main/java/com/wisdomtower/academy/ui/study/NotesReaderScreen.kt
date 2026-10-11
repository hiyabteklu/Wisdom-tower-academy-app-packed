package com.wisdomtower.academy.ui.study

import android.annotation.SuppressLint
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.wisdomtower.academy.data.content.ContentItemResult
import com.wisdomtower.academy.data.content.LearningContentRepository
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted
import org.json.JSONObject

/**
 * Native reader for one short note (plan step N6): loads the full row from Supabase
 * ([LearningContentRepository.getResource], offline copy kept) and shows its `body_md` in the LOCAL page
 * `assets/notes/index.html` (the website's RichContent + KaTeX dialect, no website page, no network).
 * Not done yet: reading progress (`learning_progress`), the website's "Summary" (AI) button.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
@Composable
fun NotesReaderScreen(
    title: String,
    resourceId: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var attempt by remember { mutableStateOf(0) }
    var result by remember(resourceId) { mutableStateOf<ContentItemResult?>(null) }

    LaunchedEffect(resourceId, attempt) {
        result = null
        result = LearningContentRepository.getResource(context, resourceId)
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ScreenBackButton(onBack)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            when (val r = result) {
                null -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = WisdomCyan)
                }

                is ContentItemResult.Found -> NoteWebView(
                    body = r.item.bodyMd.orEmpty(),
                    modifier = Modifier.fillMaxSize()
                )

                is ContentItemResult.NotFound -> NoteMessage(
                    message = "Unable to load materials right now. Please try again.",
                    onRetry = { attempt += 1 }
                )

                is ContentItemResult.Failure -> NoteMessage(message = r.message, onRetry = { attempt += 1 })
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun NoteWebView(body: String, modifier: Modifier) {
    // JSONObject.quote gives a safe JavaScript string literal (quotes, backslashes, newlines escaped)
    val literal = remember(body) { JSONObject.quote(body) }
    key(literal) {
        AndroidView(
            modifier = modifier,
            factory = { ctx ->
                WebView(ctx).apply {
                    setBackgroundColor(0xFF0A101D.toInt())
                    settings.javaScriptEnabled = true
                    settings.allowFileAccess = true
                    settings.blockNetworkLoads = true
                    settings.domStorageEnabled = false
                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView, url: String?) {
                            view.evaluateJavascript("window.setNote($literal);", null)
                        }

                        // The note page never navigates away; ignore every link tap.
                        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean = true
                    }
                    loadUrl("file:///android_asset/notes/index.html")
                }
            },
            onRelease = { it.destroy() }
        )
    }
}

@Composable
private fun NoteMessage(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = message, fontSize = 13.sp, color = WisdomMuted, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(14.dp))
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(10.dp))
                .background(WisdomCyan.copy(alpha = 0.12f))
                .clickable { onRetry() }
                .padding(horizontal = 18.dp, vertical = 8.dp)
        ) {
            Text(text = "Retry", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = WisdomCyan)
        }
    }
}
