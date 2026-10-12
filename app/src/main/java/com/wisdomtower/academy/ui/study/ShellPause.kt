package com.wisdomtower.academy.ui.study

import android.annotation.SuppressLint
import android.view.MotionEvent
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
 * reworked in F1b and F1c (2026-10-12, the owner reported it again after F1 and F1b).
 *
 * F1b: `MainActivity` keeps the big website WebView full-screen and VISIBLE underneath every native screen. While a
 * native content screen is shown, every other WebView that is VISIBLE is set INVISIBLE (the browser stops drawing it
 * and throttles its timers) and `onPause()` is called; the same WebViews are set VISIBLE again when the screen is
 * left. `pauseTimers()` is NOT used (it is global and would stop the local pages too). Hypothesis, not proven.
 *
 * F1c (owner test after F1b: "scroll works only if the finger stays down for a moment before moving; a quick
 * swipe does nothing"): a quick swipe is lost, a slow one works. The page scripts have no blocking touch handler,
 * so the likely place is the Android side. Every local page WebView (address contains `android_asset/notes/`:
 * notes, flashcards, question banks, exams) now gets, once, from here (so the three screen files stay unchanged):
 *  - a touch listener that, on the first finger-down, asks every parent not to intercept the gesture
 *    (`requestDisallowInterceptTouchEvent(true)`); it never consumes a touch itself;
 *  - no over-scroll effect, and the WebView's own pinch/double-tap zoom is switched off (the zoom gesture detector
 *    waits to tell a pinch from a scroll; the pages are made for reading at one size).
 * NOT proven to be the cause; see `docs/SESSION_2026-10-12_AR.md` for what to try next.
 *
 * F1e (2026-10-12, owner: flashcards stay completely dark, also after the page was rewritten without 3D in F1d):
 * as soon as the flashcards page is on screen, the website WebViews hidden by F1b are made VISIBLE and resumed
 * again and are no longer hidden or paused for the rest of this screen (a flashcard deck does not need the quiet
 * background: it has no long scrolling text). The touch fix of F1c still applies to it. Hypothesis, not proven:
 * hiding the website WebView stops the deck WebView from being drawn on this phone.
 */
private const val OWN_PAGES = "android_asset/notes/"
private const val DECK_PAGE = "flashcards.html"

private fun allWebViews(root: View): List<WebView> {
    val found = ArrayList<WebView>()
    fun walk(v: View) {
        if (v is WebView) {
            found.add(v)
            return
        }
        if (v is ViewGroup) {
            for (i in 0 until v.childCount) walk(v.getChildAt(i))
        }
    }
    walk(root)
    return found
}

private fun isOwnPage(wv: WebView): Boolean = wv.url?.contains(OWN_PAGES) == true

@SuppressLint("ClickableViewAccessibility")
private fun fixLocalPageTouch(wv: WebView) {
    wv.overScrollMode = View.OVER_SCROLL_NEVER
    wv.settings.setSupportZoom(false)
    wv.settings.builtInZoomControls = false
    wv.setOnTouchListener { v, event ->
        if (event.actionMasked == MotionEvent.ACTION_DOWN) {
            v.parent?.requestDisallowInterceptTouchEvent(true)
        }
        false
    }
}

@Composable
internal fun PauseShellWhileShown() {
    val view = LocalView.current
    // The WebViews this screen hid (and so must show again when it is left).
    val hidden = remember { ArrayList<WebView>() }
    // The local page WebViews that already got the touch fix (weak, so a destroyed WebView is not kept alive).
    val fixed = remember { java.util.Collections.newSetFromMap(java.util.WeakHashMap<WebView, Boolean>()) }
    // F1e: true once the flashcards page was seen; from then on nothing is hidden or paused any more.
    val released = remember { BooleanArray(1) }

    DisposableEffect(view) {
        for (wv in allWebViews(view.rootView)) {
            try {
                if (wv.url == null || isOwnPage(wv)) continue
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

    // Local page WebViews are created later (when a note, deck or quiz is opened): fix each one once, soon after.
    LaunchedEffect(view) {
        while (true) {
            var deckOpen = false
            for (wv in allWebViews(view.rootView)) {
                try {
                    if (isOwnPage(wv)) {
                        if (wv.url?.contains(DECK_PAGE) == true) deckOpen = true
                        if (fixed.add(wv)) fixLocalPageTouch(wv)
                    }
                } catch (_: Exception) {
                }
            }
            if (deckOpen && !released[0]) {
                released[0] = true
                for (wv in hidden) {
                    try {
                        wv.visibility = View.VISIBLE
                        wv.onResume()
                    } catch (_: Exception) {
                    }
                }
                hidden.clear()
            }
            delay(300L)
        }
    }

    // `MainActivity` calls onResume() on its WebView when the app comes back from the background: pause again.
    LaunchedEffect(view, hidden) {
        while (true) {
            delay(1500L)
            if (released[0]) continue
            for (wv in hidden) {
                try {
                    wv.onPause()
                } catch (_: Exception) {
                }
            }
        }
    }
}
