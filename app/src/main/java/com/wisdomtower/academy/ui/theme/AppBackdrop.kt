package com.wisdomtower.academy.ui.theme

import android.content.Context
import android.webkit.WebView
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb

/**
 * The ONE app background colour (plan B1 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md, owner request 2026-10-17: the
 * picture looked cluttered, use a clean solid colour that suits the glass cards).
 *
 * Midnight (#0A101D) is the default. Plan B2 replaces the fixed value by the 5 options the student picks in Settings;
 * the helpers below are the only places that need to change then, because every screen goes through
 * [AtmosphereBackground] and every local-page WebView (notes, flashcards, quiz, competition exam and review, AI Tutor)
 * already calls [webViewColor] and [clearPageBackground].
 *
 * The old picture (assets/backgrounds/tutor_bg.jpg) is no longer used by any code.
 */
object AppBackdrop {
    /** The solid page colour of the whole app. */
    val color: Color = Color(0xFF0A101D)

    // One style element, added once per page; the important flag beats the page's own background rule.
    private const val CLEAR_PAGE_JS =
        "(function(){var d=document;if(d.getElementById('wt-appbg'))return;" +
            "var s=d.createElement('style');s.id='wt-appbg';" +
            "s.textContent='html,body{background:#0A101D !important}';" +
            "(d.head||d.documentElement).appendChild(s);})();"

    /** Background colour for a WebView that shows a local page. */
    fun webViewColor(context: Context): Int = color.toArgb()

    /** Call from onPageFinished of a local-page WebView: gives the page's html and body the app colour. */
    fun clearPageBackground(view: WebView) {
        view.evaluateJavascript(CLEAR_PAGE_JS, null)
    }
}
