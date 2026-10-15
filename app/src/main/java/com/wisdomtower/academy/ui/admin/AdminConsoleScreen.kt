package com.wisdomtower.academy.ui.admin

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.wisdomtower.academy.data.auth.AuthStateManager

// Admin slice A3 (docs/ADMIN_MOBILE_PLAN.md section 5, findings F1 to F7 in docs/SESSION_2026-10-15_ADMIN_A0.md).
// The Admin Console page hosted in its OWN small WebView, meant to sit between the app top bar and the bottom
// navigation (same idea as CompetitionFullScreen), instead of the shared tool overlay.
// What this WebView deliberately does NOT do: it never runs EARLY_HIDE_CHROME_JS, NATIVE_CHROME_JS,
// AI_TUTOR_CHROME_JS, PRECACHE_AND_UNBLOCK_JS or AUTH_BRIDGE_JS. So no header, footer or nav element of the admin page
// is hidden (F2), no close button is hijacked (F3), no observer and no polling timer runs (F4), and text selection
// and copy are left alone (F5).
// What it does: injects the signed-in session (AuthStateManager.injectSessionIntoWebView, like the main WebView),
// keeps pinch zoom OFF (F6), turns the over-scroll glow and the sideways scroll bar off, lets only admin pages
// of the website load inside it, hands every other website link to the app (onLeaveToApp) and every outside link to
// the system browser. Back goes back inside the page (sections are opened with pushState by slice A1), and when
// there is no page history left it calls onClose.
// Not here: the native top bar and the close control (the call site owns them), the call site itself (a patch
// script for MainActivity.kt, next slice), a file chooser (no WebView in this app has one today, so uploads in
// admin panels are not possible yet).
// Status: written, NOT compiled, NOT called by anything, not seen on a device.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AdminConsoleScreen(
    url: String,
    onClose: () -> Unit,
    onLeaveToApp: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val webRef = remember { arrayOfNulls<WebView>(1) }
    val closeNow = rememberUpdatedState(onClose)
    val leaveNow = rememberUpdatedState(onLeaveToApp)

    BackHandler {
        val web = webRef[0]
        if (web != null && web.canGoBack()) web.goBack() else closeNow.value()
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { ctx ->
            WebView(ctx).apply {
                setBackgroundColor(0xFF0A101D.toInt())
                overScrollMode = View.OVER_SCROLL_NEVER
                isHorizontalScrollBarEnabled = false
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.setSupportZoom(false)
                settings.builtInZoomControls = false
                settings.displayZoomControls = false
                settings.useWideViewPort = true
                settings.loadWithOverviewMode = false
                settings.userAgentString = settings.userAgentString + " WisdomTowerApp wta-native"
                webViewClient = object : WebViewClient() {
                    override fun onPageStarted(view: WebView, pageUrl: String?, favicon: Bitmap?) {
                        if (pageUrl != null && !pageUrl.startsWith("file://")) {
                            AuthStateManager.injectSessionIntoWebView(view)
                        }
                    }

                    override fun onPageFinished(view: WebView, pageUrl: String?) {
                        if (pageUrl != null && !pageUrl.startsWith("file://")) {
                            AuthStateManager.injectSessionIntoWebView(view)
                        }
                    }

                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                        val target = request.url
                        val host = target.host ?: ""
                        val path = target.path ?: ""
                        val ours = host == "wisdom-tower-academy.live" || host.endsWith(".wisdom-tower-academy.live")
                        if (ours && path.startsWith("/admin")) return false
                        if (ours) {
                            leaveNow.value(target.toString())
                            return true
                        }
                        try {
                            val open = Intent(Intent.ACTION_VIEW, Uri.parse(target.toString()))
                            open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            view.context.startActivity(open)
                        } catch (e: Exception) {
                            // no app can open the link: ignore it
                        }
                        return true
                    }
                }
                webRef[0] = this
                loadUrl(url)
            }
        },
        onRelease = {
            if (webRef[0] === it) webRef[0] = null
            it.destroy()
        }
    )
}
