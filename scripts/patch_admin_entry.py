#!/usr/bin/env python3
"""Admin entry in the native app (owner order 2026-10-15).

Adds an "Admin Console" button to the native Account screen. It is shown ONLY when the database says the
signed-in account is an admin (RPC public.am_i_admin(), see docs/sql/am_i_admin.sql; no e-mail is stored in the
app). Tapping it opens the website page /admin in the existing in-app web overlay (openToolOverlay), which
already carries the signed-in session. The website page and its API routes check admin rights again.

Edits (all or nothing, safe to run twice):
  1. NEW  app/src/main/java/com/wisdomtower/academy/data/admin/AdminAccess.kt
  2. NEW  app/src/main/java/com/wisdomtower/academy/ui/account/AdminEntryButton.kt
  3. EDIT ui/account/AccountScreen.kt : one LazyColumn item above the profile panel (Log Out stays the last item)
  4. EDIT MainActivity.kt             : navigateTo(): a link ending in /admin opens the overlay titled "Admin Console"
Marker: ADMIN-entry
"""
import sys
from pathlib import Path

ROOT = Path("app/src/main/java/com/wisdomtower/academy")
ACCOUNT = ROOT / "ui/account/AccountScreen.kt"
MAIN = ROOT / "MainActivity.kt"
NEW_ACCESS = ROOT / "data/admin/AdminAccess.kt"
NEW_BUTTON = ROOT / "ui/account/AdminEntryButton.kt"
MARK = "ADMIN-entry"

ACCESS_KT = '''package com.wisdomtower.academy.data.admin

import android.util.Log
import com.wisdomtower.academy.BuildConfig
import com.wisdomtower.academy.data.auth.AuthStateManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/**
 * ADMIN-entry: asks the database whether the signed-in account is an admin (RPC `am_i_admin`, which returns
 * `private.is_admin()`; SQL in `docs/sql/am_i_admin.sql`). No e-mail address is kept in the app.
 * Any failure (offline, function not installed yet, signed out) answers false, so a student never sees the button.
 * A true or false answer is remembered for the signed-in user until the app process ends.
 *
 * STATUS: `[~]` written, NOT compiled, NOT tested on a device.
 */
object AdminAccess {
    private const val TAG = "AdminAccess"

    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    private val supabaseUrl: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_URL.trim().trimEnd('/')
    private val anonKey: String get() = BuildConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()

    @Volatile
    private var cachedUserId: String? = null

    @Volatile
    private var cachedValue: Boolean = false

    private fun call(token: String): Pair<Int, String> {
        val request = Request.Builder()
            .url("$supabaseUrl/rest/v1/rpc/am_i_admin")
            .addHeader("apikey", anonKey)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Accept", "application/json")
            .post("{}".toRequestBody(JSON_MEDIA))
            .build()
        http.newCall(request).execute().use { resp ->
            return Pair(resp.code, resp.body?.string().orEmpty())
        }
    }

    suspend fun isAdmin(): Boolean = withContext(Dispatchers.IO) {
        try {
            AuthStateManager.refreshIfNeeded()
            val user = AuthStateManager.currentUser.value ?: return@withContext false
            val uid = user.id.toString()
            if (cachedUserId == uid) return@withContext cachedValue
            val token1 = user.accessToken
            if (token1.isNullOrBlank()) return@withContext false
            var reply = call(token1)
            if (reply.first == 401 && AuthStateManager.refreshIfNeeded(force = true)) {
                val token2 = AuthStateManager.currentUser.value?.accessToken
                if (!token2.isNullOrBlank()) reply = call(token2)
            }
            if (reply.first in 200..299) {
                val answer = reply.second.trim() == "true"
                cachedUserId = uid
                cachedValue = answer
                answer
            } else {
                Log.w(TAG, "am_i_admin failed: HTTP ${reply.first}")
                false
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "am_i_admin failed: ${e.javaClass.simpleName}")
            false
        }
    }
}
'''

BUTTON_KT = '''package com.wisdomtower.academy.ui.account

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.admin.AdminAccess

/**
 * ADMIN-entry: the "Admin Console" button on the Account screen. Draws nothing unless the database confirms
 * the signed-in account is an admin ([AdminAccess.isAdmin]). [userKey] only restarts the check when the
 * signed-in account changes; it is never stored. Tapping calls [onOpen] (the Account screen sends "/admin").
 * Purple, like the website's Admin button.
 *
 * STATUS: `[~]` written, NOT compiled, NOT tested on a device.
 */
@Composable
fun AdminEntryButton(userKey: String?, onOpen: () -> Unit) {
    var isAdmin by remember(userKey) { mutableStateOf(false) }
    LaunchedEffect(userKey) { isAdmin = AdminAccess.isAdmin() }
    if (!isAdmin) return

    val accent = Color(0xFFC084FC)
    val shape = RoundedCornerShape(16.dp)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(accent.copy(alpha = 0.12f))
            .border(BorderStroke(1.dp, accent.copy(alpha = 0.45f)), shape)
            .clickable(onClick = onOpen)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Filled.Shield,
            contentDescription = null,
            tint = accent,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "Admin Console", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = accent)
    }
}
'''

ACCOUNT_ANCHOR = '            item(key = "my_profile_panel") {\n'
ACCOUNT_ADD = (
    '            // ADMIN-entry: shown only for admins (database check); above the profile panel so Log Out stays last\n'
    '            item(key = "admin_entry") {\n'
    '                AdminEntryButton(userKey = userEmail, onOpen = { onNavigateToUrl("/admin") })\n'
    '            }\n\n'
)
MAIN_ANCHOR = (
    '        if (targetUrl.contains("/checkout")) {\n'
    '            openToolOverlay(targetUrl, "Package Checkout")\n'
    '            return\n'
    '        }\n'
)
MAIN_ADD = (
    '        // ADMIN-entry: the website admin console opens in the in-app overlay (the page and its API re-check admin rights)\n'
    '        if (notifUri != null && notifUri.path.orEmpty().trimEnd(\'/\').lowercase().endsWith("/admin")) {\n'
    '            openToolOverlay(targetUrl, "Admin Console")\n'
    '            return\n'
    '        }\n'
)


def main() -> int:
    for f in (ACCOUNT, MAIN):
        if not f.exists():
            print(f"ERROR: {f} not found; nothing changed")
            return 1
    acc = ACCOUNT.read_text(encoding="utf-8")
    mn = MAIN.read_text(encoding="utf-8")
    if MARK in acc and MARK in mn and NEW_ACCESS.exists() and NEW_BUTTON.exists():
        print("already patched, nothing to do")
        return 0
    if MARK in acc or MARK in mn or NEW_ACCESS.exists() or NEW_BUTTON.exists():
        print("ERROR: partly patched; nothing changed")
        return 1
    if acc.count(ACCOUNT_ANCHOR) != 1:
        print(f"ERROR: AccountScreen anchor found {acc.count(ACCOUNT_ANCHOR)} times (need 1); nothing changed")
        return 1
    if mn.count(MAIN_ANCHOR) != 1:
        print(f"ERROR: MainActivity anchor found {mn.count(MAIN_ANCHOR)} times (need 1); nothing changed")
        return 1
    if "val notifUri" not in mn:
        print("ERROR: notifUri not found in MainActivity; nothing changed")
        return 1
    acc = acc.replace(ACCOUNT_ANCHOR, ACCOUNT_ADD + ACCOUNT_ANCHOR)
    mn = mn.replace(MAIN_ANCHOR, MAIN_ADD + MAIN_ANCHOR)
    NEW_ACCESS.parent.mkdir(parents=True, exist_ok=True)
    NEW_ACCESS.write_text(ACCESS_KT, encoding="utf-8")
    NEW_BUTTON.write_text(BUTTON_KT, encoding="utf-8")
    ACCOUNT.write_text(acc, encoding="utf-8")
    MAIN.write_text(mn, encoding="utf-8")
    print("patched")
    return 0


sys.exit(main())
