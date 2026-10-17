package com.wisdomtower.academy.ui.theme

import android.content.Context
import android.webkit.WebView
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb

/**
 * The app background colour as the rest of the code sees it (plan B2 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md).
 *
 * The colour now comes from the student's choice held in [AppBackground] (Midnight #0A101D until they pick another one).
 * Every screen goes through [AtmosphereBackground] and every local-page WebView (notes, flashcards, quiz, competition
 * exam and review, AI Tutor) already calls [webViewColor] and [clearPageBackground], so none of those files changed.
 */
object AppBackdrop {
    /** The solid page colour of the whole app. Reading it in a composable follows the chosen option live. */
    val color: Color
        get() = AppBackground.selected.color

    // One style element per page; calling it again updates the same element, and the important flag beats the page's own rule.
    private fun clearPageJs(hex: String): String =
        "(function(){var d=document;var s=d.getElementById('wt-appbg');" +
            "if(!s){s=d.createElement('style');s.id='wt-appbg';(d.head||d.documentElement).appendChild(s);}" +
            "s.textContent='html,body{background:" + hex + " !important}';})();"

    /** Background colour for a WebView that shows a local page. */
    fun webViewColor(context: Context): Int = color.toArgb()

    /** Call from onPageFinished of a local-page WebView: gives the page's html and body the chosen colour. */
    fun clearPageBackground(view: WebView) {
        view.evaluateJavascript(clearPageJs(AppBackground.selected.hex), null)
    }
}
