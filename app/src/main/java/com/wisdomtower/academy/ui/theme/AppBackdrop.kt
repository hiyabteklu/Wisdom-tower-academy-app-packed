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
 * exam and review, AI Tutor) calls [webViewColor] and [clearPageBackground]: the WebView keeps the plain colour and the
 * page gets the same soft glows as CSS, so a page looks like the native screens and does not depend on what is behind it.
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

    /** Background colour for a WebView that shows a local page (the plain colour of the chosen option). */
    fun webViewColor(context: Context): Int = color.toArgb()

    /** Call from onPageFinished of a local-page WebView: gives the page the chosen background (colour and soft glows). */
    fun clearPageBackground(view: WebView) {
        val bg = AppBackground.selected.cssBackground
        val css = "html{background:" + bg + " !important;background-attachment:fixed !important;" +
            "background-repeat:no-repeat !important}body{background:transparent !important}"
        view.evaluateJavascript(clearPageJs(css), null)
    }
}
