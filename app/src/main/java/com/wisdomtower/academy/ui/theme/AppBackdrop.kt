package com.wisdomtower.academy.ui.theme

import android.content.Context
import android.webkit.WebView
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb

/**
 * The app background as the rest of the code sees it (plan B2 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md, reworked
 * 2026-10-17: the 5 options are now blue, black and three soft space looks, see [AppBackgroundOption]).
 *
 * Native screens draw it through [AtmosphereBackground]. Every local-page WebView (notes, flashcards, quiz, competition
 * exam and review, AI Tutor) calls [webViewColor] and [clearPageBackground].
 *
 * Slice BG1 (docs/PLAN_BACKDROP_REMAINING.md, 2026-10-17): the WebView and the page are now fully TRANSPARENT. The
 * picture is drawn natively by [AtmosphereBackground] behind the WebView. Before, the page tried to load the picture
 * itself with a CSS file:///android_asset url, which a page loaded from another origin is not allowed to read, so only
 * the flat colour showed.
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

    /** Background colour for a WebView that shows a local page: transparent, so the native backdrop shows through. */
    @Suppress("UNUSED_PARAMETER")
    fun webViewColor(context: Context): Int = android.graphics.Color.TRANSPARENT

    /** Call from onPageFinished of a local-page WebView: makes the page itself see-through (no colour, no picture). */
    fun clearPageBackground(view: WebView) {
        val css = "html{background:transparent !important}body{background:transparent !important}"
        view.evaluateJavascript(clearPageJs(css), null)
    }
}
