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
import com.wisdomtower.academy.ui.theme.WisdomModernCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

/** Plain message card for the Success Stories / Scholarships tabs (loading, error, nothing published). */
@Composable
fun FreeResourcesStateCard(heading: String?, message: String) {
    WisdomModernCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            if (heading != null) {
                Text(heading, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
            Text(message, fontSize = 12.sp, color = WisdomMuted, lineHeight = 16.sp)
        }
    }
}
