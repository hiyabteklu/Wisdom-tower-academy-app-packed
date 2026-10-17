package com.wisdomtower.academy.ui.theme

import android.content.Context
import android.graphics.BitmapFactory
import android.webkit.WebView
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap

/**
 * The app-wide default background picture (owner request 2026-10-17: "make all the apps background the tutor_bg.jpg
 * ... the apps default background for all, reading notes, exams, etc").
 *
 * The picture is the file `assets/backgrounds/tutor_bg.jpg`. It was first used only by the AI Tutor screen; now
 * [AtmosphereBackground] (which every screen and the app shell already draw) shows it with a dark scrim, so every
 * native screen gets it without any per-screen code.
 *
 * It is decoded ONCE per app process and kept (a large picture is down-sampled to about 1080 px wide). When the file is
 * missing or cannot be decoded, [get] returns null and everything keeps the old look (dark page colour with the two
 * soft glow orbs), so the build and the app never depend on the picture being there.
 *
 * The local HTML pages (notes, flashcards, quiz, competition exam and review) are shown in WebViews that paint their
 * own solid dark page colour. To let the picture show through them, [webViewColor] makes the WebView see-through and
 * [clearPageBackground] injects one CSS rule that makes the page's html and body transparent. Both do nothing when
 * there is no picture.
 */
object AppBackdrop {
    private const val ASSET_PATH = "backgrounds/tutor_bg.jpg"
    private const val TARGET_WIDTH_PX = 1080
    private const val PAGE_FALLBACK_COLOR = 0xFF0A101D.toInt()

    // One style element, added once per page; the important flag beats the page's own background rule.
    private const val CLEAR_PAGE_JS =
        "(function(){var d=document;if(d.getElementById('wt-appbg'))return;" +
            "var s=d.createElement('style');s.id='wt-appbg';" +
            "s.textContent='html,body{background:transparent !important}';" +
            "(d.head||d.documentElement).appendChild(s);})();"

    private val lock = Any()
    private var loaded = false
    private var picture: ImageBitmap? = null

    /** The picture, or null when it is missing or unreadable. Decoded on the first call only. */
    fun get(context: Context): ImageBitmap? {
        synchronized(lock) {
            if (!loaded) {
                picture = decode(context.applicationContext)
                loaded = true
            }
            return picture
        }
    }

    /** Background colour for a WebView that shows a local page: see-through when the picture exists. */
    fun webViewColor(context: Context): Int =
        if (get(context) != null) android.graphics.Color.TRANSPARENT else PAGE_FALLBACK_COLOR

    /** Call from onPageFinished of a local-page WebView: makes the page's html and body transparent. */
    fun clearPageBackground(view: WebView) {
        if (get(view.context) != null) {
            view.evaluateJavascript(CLEAR_PAGE_JS, null)
        }
    }

    private fun decode(context: Context): ImageBitmap? =
        try {
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            context.assets.open(ASSET_PATH).use { BitmapFactory.decodeStream(it, null, bounds) }
            var sample = 1
            while (bounds.outWidth / (sample * 2) >= TARGET_WIDTH_PX) sample *= 2
            val options = BitmapFactory.Options().apply { inSampleSize = sample }
            context.assets.open(ASSET_PATH).use { BitmapFactory.decodeStream(it, null, options) }?.asImageBitmap()
        } catch (e: Exception) {
            null
        } catch (e: OutOfMemoryError) {
            null
        }
}
