package com.wisdomtower.academy.ui.competition

import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import org.json.JSONArray
import org.json.JSONObject

// C6 slice 2b: shows ONE competition question with its choices, LaTeX and KaTeX included, in the local page
// assets/notes/competition.html (same renderer as the notes and the hub quiz). One WebView is kept for the whole
// exam: the screen sends the current question to it with window.setQuestion(...) and the page reports a tap with
// WTBridge.onPick(index). Only the prompt, the choices and the chosen index go into the page, never an answer key.
// The page has no network (blockNetworkLoads) and ignores every link.
// Session V (owner, first phone test): the WebView background is now transparent (the page is too), so the
// app's own background shows through instead of a flat dark slab behind the question card.
// Status: written, not compiled, not seen on a device.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.

// Receives the tap from the page on a WebView thread and hands it to the main thread.
private class QuestionBridge(private val onPickIndex: (Int) -> Unit) {
    private val main = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun onPick(index: Int) {
        main.post { onPickIndex(index) }
    }
}

@SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
@Composable
fun CompetitionQuestionView(
    questionId: String,
    prompt: String,
    choices: List<String>,
    selected: Int?,
    enabled: Boolean,
    onPick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val latestOnPick by rememberUpdatedState(onPick)
    val bridge = remember { QuestionBridge { index -> latestOnPick(index) } }
    val webRef = remember { arrayOfNulls<WebView>(1) }
    var pageReady by remember { mutableStateOf(false) }

    val payload = remember(questionId, prompt, choices, selected, enabled) {
        val list = JSONArray()
        for (choice in choices) list.put(choice)
        JSONObject()
            .put("id", questionId)
            .put("prompt", prompt)
            .put("choices", list)
            .put("selected", selected ?: -1)
            .put("enabled", enabled)
            .toString()
    }

    // JSONObject.quote gives a safe JavaScript string literal; the page parses it with JSON.parse
    LaunchedEffect(payload, pageReady) {
        val web = webRef[0]
        if (pageReady && web != null) {
            web.evaluateJavascript("window.setQuestion(" + JSONObject.quote(payload) + ");", null)
        }
    }

    AndroidView(
        modifier = modifier,
        factory = { ctx ->
            WebView(ctx).apply {
                setBackgroundColor(0)
                settings.javaScriptEnabled = true
                settings.allowFileAccess = true
                settings.blockNetworkLoads = true
                settings.domStorageEnabled = false
                addJavascriptInterface(bridge, "WTBridge")
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView, url: String?) {
                        pageReady = true
                    }

                    // the page never navigates away; ignore every link tap
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean = true
                }
                webRef[0] = this
                loadUrl("file:///android_asset/notes/competition.html")
            }
        },
        onRelease = {
            it.removeJavascriptInterface("WTBridge")
            if (webRef[0] === it) webRef[0] = null
            it.destroy()
        }
    )
}
