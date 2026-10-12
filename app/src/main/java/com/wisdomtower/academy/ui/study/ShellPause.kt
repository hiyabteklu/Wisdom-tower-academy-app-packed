package com.wisdomtower.academy.ui.study

import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalView
import kotlinx.coroutines.delay

/**
 * F1 (owner report 2026-10-12, problem 3: vertical scroll freezes in notes, flashcards, question banks, exams),
 * reworked in F1b (2026-10-12, the owner reported the freeze again after F1).
 *
 * HYPOTHESIS (not proven): `MainActivity` keeps the big website WebView full-screen and VISIBLE underneath every
 * native screen (it never changes its visibility). All WebViews of an app share ONE browser process, so the busy
 * website page (animations, timers, React updates) keeps rendering at full speed behind the local notes / quiz /
 * flashcard pages: touches arrive but the page is too busy to scroll. Only the pages that are WebViews freeze;
 * the PDF reader (drawn natively) is not affected, which fits the owner's report.
 *
 * F1 only called `WebView.onPause()`, which per the Android documentation does NOT pause JavaScript, so the website
 * kept running. F1b makes the hidden website WebViews really INVISIBLE (the browser then stops rendering them and
 * throttles their timers) while a native content screen is shown, and sets them back to VISIBLE when the screen is
 * left. Only the WebViews that were VISIBLE when this screen opened are touched, and only those are restored.
 * It never touches the app's own local pages (address contains `android_asset/notes/`). `pauseTimers()` is NOT used
 * because it works for ALL WebViews of the app and would stop the local pages too (exam timer, math rendering).
 * No change in `MainActivity.kt` is needed.
 */
private const val OWN_PAGES = "android_asset/notes/"

private fun otherWebViews(root: View): List<WebView> {
    val found = ArrayList<WebView>()
    fun walk(v: View) {
        if (v is WebView) {
            val address = v.url
            if (address != null && !address.contains(OWN_PAGES)) found.add(v)
            return
        }
        if (v is ViewGroup) {
            for (i in 0 until v.childCount) walk(v.getChildAt(i))
        }
    }
    walk(root)
    return found
}

@Composable
internal fun PauseShellWhileShown() {
    val view = LocalView.current
    // The WebViews this screen hid (and so must show again when it is left).
    val hidden = remember { ArrayList<WebView>() }

    DisposableEffect(view) {
        for (wv in otherWebViews(view.rootView)) {
            try {
                if (wv.visibility == View.VISIBLE) {
                    wv.visibility = View.INVISIBLE
                    hidden.add(wv)
                }
                wv.onPause()
            } catch (_: Exception) {
            }
        }
        onDispose {
            for (wv in hidden) {
                try {
                    wv.visibility = View.VISIBLE
                    wv.onResume()
                } catch (_: Exception) {
                }
            }
            hidden.clear()
        }
    }

    // `MainActivity` calls onResume() on its WebView when the app comes back from the background: pause again.
    LaunchedEffect(view) {
        while (true) {
            delay(1500L)
            for (wv in hidden) {
                try {
                    wv.onPause()
                } catch (_: Exception) {
                }
            }
        }
    }
}
