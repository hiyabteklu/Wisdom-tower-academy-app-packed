package com.wisdomtower.academy.ui.competition

import android.annotation.SuppressLint
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import org.json.JSONArray
import org.json.JSONObject

// C7 slice 3: shows ONE reviewed competition question (prompt, choices with the correct one marked, the student's
// own pick, the solution), LaTeX and KaTeX included, in the local page assets/notes/competition_review.html.
// One WebView is kept for the whole review: the screen sends the current question with window.setReview(...).
// The page has no taps and no bridge, no network (blockNetworkLoads) and ignores every link.
// The correct answer and the solution only reach this view after the server closed the window (the server
// refuses competition_review before that).
// C7 slice 4: the optional explanation parameter is the text of an AI explanation (empty when there is none);
// the page shows it in its own block, math rendered.
// Status: written, not compiled, not seen on a device.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun CompetitionReviewView(
    questionId: String,
    prompt: String,
    choices: List<String>,
    correct: Int,
    chosen: Int?,
    solution: String,
    modifier: Modifier = Modifier,
    explanation: String = ""
) {
    val webRef = remember { arrayOfNulls<WebView>(1) }
    var pageReady by remember { mutableStateOf(false) }

    val payload = remember(questionId, prompt, choices, correct, chosen, solution, explanation) {
        val list = JSONArray()
        for (choice in choices) list.put(choice)
        JSONObject()
            .put("id", questionId)
            .put("prompt", prompt)
            .put("choices", list)
            .put("correct", correct)
            .put("chosen", chosen ?: -1)
            .put("solution", solution)
            .put("explanation", explanation)
            .toString()
    }

    // JSONObject.quote gives a safe JavaScript string literal; the page parses it with JSON.parse
    LaunchedEffect(payload, pageReady) {
        val web = webRef[0]
        if (pageReady && web != null) {
            web.evaluateJavascript("window.setReview(" + JSONObject.quote(payload) + ");", null)
        }
    }

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
                        pageReady = true
                    }

                    // the page never navigates away; ignore every link tap
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean = true
                }
                webRef[0] = this
                loadUrl("file:///android_asset/notes/competition_review.html")
            }
        },
        onRelease = {
            if (webRef[0] === it) webRef[0] = null
            it.destroy()
        }
    )
}
