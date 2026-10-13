package com.wisdomtower.academy.ui.guides

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.OutfitFontFamily
import com.wisdomtower.academy.ui.theme.PlusJakartaSansFontFamily
import com.wisdomtower.academy.ui.theme.WisdomModernCard

/**
 * Plain message card for the Success Stories / Scholarships tabs (loading, error, nothing published).
 * Larger type (2026-10-14, Other resources redesign): heading 20 sp heavy, message 16 sp.
 */
@Composable
fun FreeResourcesStateCard(heading: String?, message: String) {
    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 28.dp) {
        Column(
            modifier = Modifier.padding(22.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (heading != null) {
                Text(
                    text = heading,
                    fontFamily = OutfitFontFamily,
                    fontSize = 20.sp,
                    lineHeight = 25.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
            }
            Text(
                text = message,
                fontFamily = PlusJakartaSansFontFamily,
                fontSize = 16.sp,
                lineHeight = 25.sp,
                color = Color(0xFFCBD5E1)
            )
        }
    }
}
