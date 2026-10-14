package com.wisdomtower.academy.ui.competition

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.competition.CompetitionRepository
import com.wisdomtower.academy.data.competition.CompetitionResult
import com.wisdomtower.academy.data.competition.MyPoints
import com.wisdomtower.academy.ui.theme.WisdomBorderWhite
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomGlassCard
import com.wisdomtower.academy.ui.theme.WisdomMuted

// C7 follow-up (owner decision B): the cumulative competition points total, shown in Account.
// Loads CompetitionRepository.myPoints once when the card enters the screen. Every number and title comes from the
// server; while loading, or if the call fails, NOTHING is drawn (no placeholder number, no error box in Account).
// The list shows the 5 newest entries the server returned, in the server's order.
// Status: written, not compiled, not seen on a device.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@Composable
fun CompetitionPointsCard(modifier: Modifier = Modifier) {
    var points by remember { mutableStateOf<MyPoints?>(null) }

    LaunchedEffect(Unit) {
        val r = CompetitionRepository.myPoints()
        if (r is CompetitionResult.Ok) {
            points = r.value
        }
    }

    val p = points ?: return

    WisdomGlassCard(
        modifier = modifier.fillMaxWidth(),
        cornerRadius = 18.dp,
        borderColor = WisdomBorderWhite
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "COMPETITION POINTS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = WisdomCyan,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = p.total.toString(),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
            }
            val shown = p.items.take(5)
            for (item in shown) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.title,
                        fontSize = 12.sp,
                        color = WisdomMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = "+" + item.points.toString(),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
