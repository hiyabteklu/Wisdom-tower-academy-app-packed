package com.wisdomtower.academy.ui.packages

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomDark
import com.wisdomtower.academy.ui.theme.WisdomModernCard

/**
 * THE one card used for packages, subjects and courses everywhere in the app (owner rule 2026-10-11):
 * optional picture (16:9, no overlay, no tag, no gradient), the title, and one "Open" button.
 * Nothing else: no description, no price, no lock, no label. Always free.
 * Always used inside [openGrid] so every list is two cards per row.
 */
@Composable
fun OpenCard(
    title: String,
    image: Any?,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    WisdomModernCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        onClick = onClick
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            if (image != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f)
                        .background(WisdomDark)
                ) {
                    AsyncImage(
                        model = ImageRequest.Builder(context)
                            .data(image)
                            .crossfade(true)
                            .build(),
                        contentDescription = title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 12.dp)
            ) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    minLines = 2,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(WisdomCyan.copy(alpha = 0.12f))
                        .border(
                            BorderStroke(1.dp, WisdomCyan.copy(alpha = 0.45f)),
                            RoundedCornerShape(10.dp)
                        )
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = ripple(color = WisdomCyan.copy(alpha = 0.25f)),
                            onClick = onClick
                        )
                        .padding(vertical = 8.dp, horizontal = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Open",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WisdomCyan
                    )
                }
            }
        }
    }
}

/**
 * Lays a list out as a two-column grid inside a LazyColumn (two cards per row, like the website
 * `grid-cols-2`). [prefix] must be unique inside one LazyColumn.
 */
fun <T> LazyListScope.openGrid(
    prefix: String,
    list: List<T>,
    card: @Composable (T) -> Unit
) {
    items(
        count = (list.size + 1) / 2,
        key = { rowIndex -> "${prefix}_row_$rowIndex" }
    ) { rowIndex ->
        val first = list[rowIndex * 2]
        val second = list.getOrNull(rowIndex * 2 + 1)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(modifier = Modifier.weight(1f)) { card(first) }
            if (second != null) {
                Box(modifier = Modifier.weight(1f)) { card(second) }
            } else {
                Spacer(modifier = Modifier.weight(1f))
            }
        }
    }
}
