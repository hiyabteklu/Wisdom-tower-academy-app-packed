package com.wisdomtower.academy.ui.study

import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalView
import kotlinx.coroutines.delay

/**
 * F1 (owner report 2026-10-12, problem 3: vertical scroll freezes in notes and question banks).
 *
 * HYPOTHESIS (not proven): `MainActivity` keeps the big website WebView alive underneath every native screen.
 * All WebViews of an app share ONE browser process, so a busy website page (animations, timers) can starve the
 * local notes / quiz / flashcard pages that are drawn on top: touches arrive but the page is too busy to scroll.
 *
 * While a native content screen is shown, this pauses every OTHER WebView in the window (rendering, animations
 * and timers of hidden pages are throttled by the system) and resumes them when the screen is left. It never
 * touches the app's own local pages (address contains `android_asset/notes/`). It repeats every 1.5 seconds
 * because `MainActivity` resumes its WebView when the app comes back from the background.
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
    DisposableEffect(view) {
        onDispose {
            for (wv in otherWebViews(view.rootView)) {
                try {
                    wv.onResume()
                } catch (_: Exception) {
                }
            }
        }
    }
    LaunchedEffect(view) {
        while (true) {
            for (wv in otherWebViews(view.rootView)) {
                try {
                    wv.onPause()
                } catch (_: Exception) {
                }
            }
            delay(1500L)
        }
    }
}
