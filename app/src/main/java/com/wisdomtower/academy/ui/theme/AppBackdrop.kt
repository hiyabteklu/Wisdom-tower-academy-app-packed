package com.wisdomtower.academy.ui.theme

import android.content.Context
import android.webkit.WebView
import androidx.compose.ui.graphics.Color

/**
 * The app background as the rest of the code sees it (plan B2 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md, reworked
 * 2026-10-17: the 5 options are now blue, black and three soft space looks, see [AppBackgroundOption]).
 *
 * Native screens draw it through [AtmosphereBackground]. Every local-page WebView (notes, flashcards, quiz, competition
 * exam and review, AI Tutor) calls [webViewColor] and [clearPageBackground]. Since slice BG1 of
 * docs/PLAN_BACKDROP_REMAINING.md (2026-10-17) the WebView and its page are TRANSPARENT: the chosen picture is drawn
 * natively by [AtmosphereBackground] behind the WebView, so pictures (BG 1-3) show on every page. Before BG1 the page
 * painted a CSS colour and a file:// picture url, which a page not loaded from a file:// origin cannot read, so only a
 * flat navy showed.
 */
object AppBackdrop {
    /** The plain page colour of the chosen option. Reading it in a composable follows the choice live. */
    val color: Color
        get() = AppBackground.selected.color

    // One style element per page; calling it again updates the same element, and the important flag beats the page's own rule.
    private fun clearPageJs(css: String): String =
        "(function(){var d=document;var s=d.getElementById('wt-appbg');" +
            "if(!s){s=d.createElement('style');s.id='wt-appbg';(d.head||d.documentElement).appendChild(s);}" +
            "s.textContent='" + css + "';})();"

    /** Background colour for a WebView that shows a local page: transparent, the native backdrop shows through. */
    @Suppress("UNUSED_PARAMETER")
    fun webViewColor(context: Context): Int = android.graphics.Color.TRANSPARENT

    /**
     * Call from onPageFinished of a local-page WebView: makes the page itself transparent (no colour, no picture url, no glows).
     * Every caller must have [AtmosphereBackground] behind its WebView (checked 2026-10-17: Notes, Flashcards, Quiz,
     * Competition exam and review, AI Tutor all have it).
     */
    fun clearPageBackground(view: WebView) {
        val css = "html{background:transparent !important}body{background:transparent !important}"
        view.evaluateJavascript(clearPageJs(css), null)
    }
}
