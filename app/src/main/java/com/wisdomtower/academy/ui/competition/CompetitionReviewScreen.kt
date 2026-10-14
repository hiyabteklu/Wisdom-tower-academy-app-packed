package com.wisdomtower.academy.ui.competition

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.wisdomtower.academy.data.competition.CompetitionRepository
import com.wisdomtower.academy.data.competition.CompetitionResult
import com.wisdomtower.academy.data.competition.ReviewResult
import com.wisdomtower.academy.ui.theme.AtmosphereBackground

private val RvCardBg = Color(0xFF131F38)
private val RvCyan = Color(0xFF22E0FF)
private val RvMuted = Color(0xFF94A3B8)
private val RvRed = Color(0xFFF87171)
private val RvDarkText = Color(0xFF0A101D)

// C7 slice 3: review of the student's own ranked attempt after the window closed. Loads
// CompetitionRepository.review (the server refuses it earlier, the plain message is shown), then shows one
// question at a time through CompetitionReviewView (math rendered): the correct answer, the student's pick and
// the solution, all exactly as the server sent them. Previous and Next move between questions.
// Not here yet: the Explain with AI button (a later slice; it must stay off while a ranked exam runs).
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@Composable
fun CompetitionReviewScreen(
    competitionId: String,
    title: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var loading by remember(competitionId) { mutableStateOf(true) }
    var review by remember(competitionId) { mutableStateOf<ReviewResult?>(null) }
    var errorText by remember(competitionId) { mutableStateOf<String?>(null) }
    var reloadKey by remember(competitionId) { mutableIntStateOf(0) }
    var index by remember(competitionId) { mutableIntStateOf(0) }

    LaunchedEffect(competitionId, reloadKey) {
        loading = true
        errorText = null
        val r = CompetitionRepository.review(competitionId)
        if (r is CompetitionResult.Ok) {
            review = r.value
        } else if (r is CompetitionResult.Failed) {
            errorText = r.message
        }
        loading = false
    }

    BackHandler(enabled = true) { onBack() }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                RvButton(label = "Back", filled = false, enabled = true, onClick = onBack)
                Spacer(modifier = Modifier.size(12.dp))
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
            }

            val res = review
            val err = errorText
            if (loading && res == null) {
                Text(text = "Loading...", color = RvMuted, fontSize = 14.sp)
            } else if (res == null) {
                Text(text = err ?: "The review could not be loaded.", color = RvRed, fontSize = 13.sp)
                RvButton(label = "Try again", filled = true, enabled = true, onClick = { reloadKey += 1 })
            } else if (res.questions.isEmpty()) {
                Text(text = "There are no questions to review.", color = RvMuted, fontSize = 14.sp)
            } else {
                val questions = res.questions
                val position = if (index >= questions.size) questions.size - 1 else index
                val q = questions[position]
                val score = res.score
                val total = res.total
                if (score != null && total != null) {
                    Text(
                        text = "Your score: " + score.toString() + " of " + total.toString(),
                        color = RvCyan,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Text(
                    text = "Question " + (position + 1).toString() + " of " + questions.size.toString(),
                    color = Color.White,
                    fontSize = 13.sp
                )
                CompetitionReviewView(
                    questionId = q.id,
                    prompt = q.prompt,
                    choices = q.choices,
                    correct = q.correct,
                    chosen = q.chosen,
                    solution = q.solution,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    RvButton(
                        label = "Previous",
                        filled = false,
                        enabled = position > 0,
                        onClick = { index = position - 1 }
                    )
                    RvButton(
                        label = "Next",
                        filled = true,
                        enabled = position < questions.size - 1,
                        onClick = { index = position + 1 }
                    )
                }
            }
        }
    }
}

@Composable
private fun RvButton(label: String, filled: Boolean, enabled: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(12.dp)
    val alpha = if (enabled) 1f else 0.4f
    Box(
        modifier = Modifier
            .clip(shape)
            .background(if (filled) RvCyan.copy(alpha = alpha) else RvCardBg)
            .border(1.dp, RvCyan.copy(alpha = if (filled) 0f else 0.5f * alpha), shape)
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = 18.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (filled) RvDarkText else Color.White.copy(alpha = alpha),
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
