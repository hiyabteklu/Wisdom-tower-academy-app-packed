package com.wisdomtower.academy.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.Icon
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan

/**
 * Where a "Sign in" tap goes. MainActivity sets [open] to its own sign-in route
 * (`handleGlobalNav("/login")`: closes any open overlay and selects the Account tab, where the native
 * sign-in screen is). Any screen that tells a signed-out student "sign in to ..." shows a [SignInPill],
 * so the student reaches sign-in in one tap from wherever they are.
 */
object SignInNavigator {
    @Volatile
    var open: (() -> Unit)? = null
}

/** The shared "Sign in" pill (same cyan pill look as the sign-in buttons of the app). */
@Composable
fun SignInPill(
    modifier: Modifier = Modifier,
    label: String = "Sign in",
    onClick: (() -> Unit)? = null
) {
    Row(
        modifier = modifier
            .minimumInteractiveComponentSize() // S3: 48dp touch target, the pill looks the same
            .clip(RoundedCornerShape(50))
            .background(WisdomCyan)
            .clickable(role = Role.Button) { (onClick ?: SignInNavigator.open)?.invoke() }
            .padding(horizontal = 20.dp, vertical = 9.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, color = WisdomDarkOnCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = WisdomDarkOnCyan,
            modifier = Modifier.size(14.dp)
        )
    }
}

/** A [SignInPill] that appears only while nobody is signed in (it removes itself after sign-in). */
@Composable
fun SignedOutSignInPill(
    modifier: Modifier = Modifier,
    topPadding: Dp = 0.dp
) {
    val loggedIn by AuthStateManager.isLoggedIn.collectAsState()
    if (!loggedIn) {
        SignInPill(modifier = modifier.padding(top = topPadding))
    }
}
