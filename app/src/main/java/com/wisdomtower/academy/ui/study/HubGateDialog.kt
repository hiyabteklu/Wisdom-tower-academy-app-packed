package com.wisdomtower.academy.ui.study

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.wisdomtower.academy.data.content.ContentAccess
import com.wisdomtower.academy.data.content.RedeemResult
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomMuted
import kotlinx.coroutines.launch

/**
 * Small message pop-up used when a course hub is closed (plan step N9). Layout follows the website's
 * `ComingSoonModal.tsx`: optional amber badge, title, hub name in cyan, sentence, one cyan button.
 * The texts come from `ContentAccess` (copied from the website); there is never a price or a purchase button.
 *
 * Activation code box (owner request 2026-10-13): when the title is [ContentAccess.PURCHASE_TITLE] (the
 * "Package required" pop-up, the only place that title is used) the pop-up also shows "Have an activation code?",
 * a code field and an Activate button. The code goes to [ContentAccess.redeem]; on success the pop-up closes and
 * the student taps the hub again (the gate re-checks ownership live). No payment words are shown here.
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
    val showCodeEntry = title == ContentAccess.PURCHASE_TITLE
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var code by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    val activate: () -> Unit = {
        if (!busy && code.isNotBlank()) {
            busy = true
            error = null
            scope.launch {
                val result = ContentAccess.redeem(code)
                busy = false
                if (result is RedeemResult.Success) {
                    Toast.makeText(context, ContentAccess.CODE_SUCCESS, Toast.LENGTH_LONG).show()
                    onClose()
                } else if (result is RedeemResult.Failure) {
                    error = result.message
                }
            }
        }
    }

    Dialog(onDismissRequest = { if (!busy) onClose() }) {
        Column(
            modifier = Modifier
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
                    fontSize = 10.sp,
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

            if (showCodeEntry) {
                Spacer(modifier = Modifier.height(18.dp))
                Text(
                    text = ContentAccess.CODE_PROMPT,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = code,
                        onValueChange = {
                            code = it.take(24)
                            error = null
                        },
                        placeholder = { Text(ContentAccess.CODE_HINT, fontSize = 12.sp, color = WisdomMuted) },
                        singleLine = true,
                        enabled = !busy,
                        keyboardOptions = KeyboardOptions(
                            capitalization = KeyboardCapitalization.Characters,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(onDone = { activate() }),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = WisdomCyan,
                            unfocusedBorderColor = WisdomBorderWhite,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            disabledTextColor = WisdomMuted,
                            disabledBorderColor = WisdomBorderWhite
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .border(BorderStroke(1.dp, WisdomCyan), RoundedCornerShape(10.dp))
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = ripple(color = Color.White.copy(alpha = 0.3f)),
                                enabled = !busy && code.isNotBlank(),
                                onClick = activate
                            )
                            .padding(horizontal = 14.dp, vertical = 14.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (busy) "..." else ContentAccess.CODE_BUTTON,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (!busy && code.isNotBlank()) WisdomCyan else WisdomMuted
                        )
                    }
                }
                val shownError = error
                if (shownError != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = shownError,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WisdomAccentRose,
                        textAlign = TextAlign.Center
                    )
                }
            }

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
