package com.wisdomtower.academy.ui.study

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
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted
import com.wisdomtower.academy.ui.theme.wisdomDialogEnter

/**
 * Small message pop-up used when a course hub is closed (plan step N9). Layout follows the website's
 * `ComingSoonModal.tsx`: optional amber badge, title, hub name in cyan, sentence, one cyan button.
 * The texts come from `ContentAccess` (copied from the website); there is never a price or a purchase button.
 *
 * M11 slice 7: the card scales in and fades (wisdomDialogEnter, 200 ms); closing stays the platform's instant dismiss.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
@Composable
internal fun HubGateDialog(
    badge: String?,
    title: String,
    hubName: String?,
    message: String,
    buttonText: String,
    onClose: () -> Unit
) {
    Dialog(onDismissRequest = onClose) {
        Column(
            modifier = Modifier
                .wisdomDialogEnter()
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(Color(0xFF111B2E))
                .border(BorderStroke(1.dp, WisdomBorderWhite), RoundedCornerShape(24.dp))
                .padding(horizontal = 24.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (badge != null) {
                Text(
                    text = badge.uppercase(),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFFCD34D),
                    letterSpacing = 1.sp,
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(Color(0xFFF59E0B).copy(alpha = 0.10f))
                        .border(
                            BorderStroke(1.dp, Color(0xFFFBBF24).copy(alpha = 0.25f)),
                            RoundedCornerShape(50)
                        )
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                )
                Spacer(modifier = Modifier.height(10.dp))
            }

            Text(
                text = title,
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                textAlign = TextAlign.Center
            )

            if (hubName != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = hubName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WisdomCyan,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = message,
                fontSize = 14.sp,
                color = WisdomMuted,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(22.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(WisdomCyan)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = ripple(color = Color.White.copy(alpha = 0.3f)),
                        onClick = onClose
                    )
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = buttonText,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF020617)
                )
            }
        }
    }
}
