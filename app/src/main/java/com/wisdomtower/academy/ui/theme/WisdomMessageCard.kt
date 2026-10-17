package com.wisdomtower.academy.ui.theme

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.auth.SignInPill

/**
 * S6 (docs/PLAY_STORE_UI_PLAN.md): the ONE shared card for "loading failed", "nothing here yet" and "sign in to
 * continue" messages. Glass look of the Targets screen (same as the old private `MessageCard` of the hub list).
 *
 *  - [title]      optional bold heading
 *  - [message]    the text (always shown)
 *  - [isError]    soft red tint; TalkBack reads the card out when it appears (polite live region)
 *  - [onRetry]    shows a small Retry button (label [retryLabel]); 48 dp touch target, announced as a button
 *  - [showSignIn] shows the shared [SignInPill] under the message (label [signInLabel]); [onSignIn] null = the
 *                 app's normal sign-in route (SignInNavigator)
 * Written, not compiled, not seen on a device.
 */
@Composable
fun WisdomMessageCard(
    message: String,
    modifier: Modifier = Modifier,
    title: String? = null,
    isError: Boolean = false,
    onRetry: (() -> Unit)? = null,
    retryLabel: String = "Retry",
    showSignIn: Boolean = false,
    signInLabel: String = "Sign in",
    onSignIn: (() -> Unit)? = null
) {
    val shape = RoundedCornerShape(20.dp)
    val fill = if (isError) Color(0x22F43F5E) else WisdomGlassFill
    val edge = if (isError) Color(0xFFF43F5E).copy(alpha = 0.35f) else WisdomGlassBorder
    val messageColor = if (isError) Color(0xFFFDA4AF) else WisdomMuted
    val live = if (isError) Modifier.semantics { liveRegion = LiveRegionMode.Polite } else Modifier

    Column(
        modifier = modifier
            .fillMaxWidth()
            .then(live)
            .clip(shape)
            .background(fill)
            .border(BorderStroke(1.dp, edge), shape)
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (title != null) {
            Text(text = title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.height(8.dp))
        }
        Text(
            text = message,
            fontSize = 13.sp,
            color = messageColor,
            textAlign = TextAlign.Center
        )
        if (onRetry != null) {
            Spacer(modifier = Modifier.height(14.dp))
            Box(
                modifier = Modifier
                    .minimumInteractiveComponentSize()
                    .clip(RoundedCornerShape(10.dp))
                    .background(WisdomCyan.copy(alpha = 0.12f))
                    .border(BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.45f)), RoundedCornerShape(10.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = ripple(color = WisdomCyan.copy(alpha = 0.25f)),
                        role = Role.Button,
                        onClick = onRetry
                    )
                    .padding(horizontal = 18.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(text = retryLabel, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = WisdomCyan)
            }
        }
        if (showSignIn) {
            Spacer(modifier = Modifier.height(10.dp))
            SignInPill(label = signInLabel, onClick = onSignIn)
        }
    }
}
