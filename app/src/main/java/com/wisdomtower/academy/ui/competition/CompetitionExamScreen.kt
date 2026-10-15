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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.data.competition.CompetitionError
import com.wisdomtower.academy.data.competition.CompetitionPhaseLogic
import com.wisdomtower.academy.data.competition.CompetitionRepository
import com.wisdomtower.academy.data.competition.CompetitionResult
import com.wisdomtower.academy.data.competition.CompetitionRunnerState
import com.wisdomtower.academy.data.competition.CompetitionSession
import com.wisdomtower.academy.data.competition.ExamLockdown
import com.wisdomtower.academy.data.competition.SubmitResult
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val ExamCardBg = Color(0xFF131F38)
private val ExamCyan = Color(0xFF22E0FF)
private val ExamMuted = Color(0xFF94A3B8)
private val ExamRed = Color(0xFFF87171)
private val ExamDarkText = Color(0xFF0A101D)

// A last autosave when the student leaves the screen must not be cancelled with the screen.
private val examSaveScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

// C6 slice 2: the native competition exam screen (ranked or practice), built on CompetitionRunnerState.
// Reachable since slice 3: the hub cards open it with the Join / Resume / Practice buttons.
// What it does: shows one question at a time with its choices, a row of question numbers, the time left
// to the GLOBAL deadline (server-corrected clock), autosaves the answers a moment after each change and
// every 10 seconds (saveAnswers), and submits when the student confirms or when the time reaches zero
// (submit sends the latest answers; the server grades the saved ones if the deadline already passed).
// ALREADY_SUBMITTED is handled as show-my-result: onFinished(null). Otherwise onFinished gets the result.
// Leaving with the Back button does not stop the clock; the student can resume until the deadline.
// Slice 2b (owner: we want LaTeX and KaTeX): the question and its choices are drawn by
// CompetitionQuestionView, which shows them in the local KaTeX page assets/notes/competition.html.
// Slice 4: while a ranked exam is open it raises ExamLockdown.active (C10 reads it, nothing does yet).
// Session U (owner, 2026-10-15): the hub now shows this screen full screen (CompetitionFullScreen), and a
// ranked exam shows one short red reminder line under the header.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
@Composable
fun CompetitionExamScreen(
    session: CompetitionSession,
    onFinished: (SubmitResult?) -> Unit,
    onExit: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state = remember(session.entryId) { CompetitionRunnerState(session) }
    var version by remember(session.entryId) { mutableIntStateOf(0) }
    var nowMs by remember { mutableLongStateOf(CompetitionRepository.serverNowMs()) }
    var confirming by remember { mutableStateOf(false) }
    var submitting by remember { mutableStateOf(false) }
    var errorText by remember { mutableStateOf<String?>(null) }
    var saveFailed by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val view = LocalView.current

    // keep the screen on while the exam is open
    DisposableEffect(Unit) {
        view.keepScreenOn = true
        onDispose { view.keepScreenOn = false }
    }

    // ranked exam open: raise the app-wide lockdown flag, lower it when the screen goes away
    DisposableEffect(session.entryId) {
        if (state.isRanked) ExamLockdown.enter()
        onDispose {
            if (state.isRanked) ExamLockdown.leave()
        }
    }

    // clock, once per second, server-corrected
    LaunchedEffect(Unit) {
        while (true) {
            nowMs = CompetitionRepository.serverNowMs()
            delay(1000L)
        }
    }

    suspend fun saveNow() {
        if (!state.hasUnsavedChanges()) return
        val snapshot = state.answersSnapshot()
        val saved = CompetitionRepository.saveAnswers(session.entryId, snapshot)
        if (saved is CompetitionResult.Ok) {
            state.markSaved(snapshot)
            saveFailed = false
        } else {
            saveFailed = true
        }
    }

    // autosave a moment after each change (the effect restarts on every change, so it waits for a pause)
    LaunchedEffect(version) {
        if (state.hasUnsavedChanges() && !submitting) {
            delay(1200L)
            if (!submitting) saveNow()
        }
    }

    // and retry every 10 seconds, so a failed save is not forgotten
    LaunchedEffect(Unit) {
        while (true) {
            delay(10_000L)
            if (!submitting) saveNow()
        }
    }

    fun doSubmit() {
        if (submitting) return
        submitting = true
        errorText = null
        scope.launch {
            val r = CompetitionRepository.submit(session.entryId, state.answersSnapshot())
            if (r is CompetitionResult.Ok) {
                onFinished(r.value)
            } else if (r is CompetitionResult.Failed) {
                if (r.error == CompetitionError.ALREADY_SUBMITTED) {
                    onFinished(null)
                } else {
                    errorText = r.message
                    submitting = false
                }
            }
        }
    }

    // time is up: submit by itself; if that fails (offline) try again every 3 seconds
    val timeUp = state.isRanked && state.isTimeUp(nowMs)
    LaunchedEffect(timeUp, submitting) {
        if (timeUp && !submitting) {
            if (errorText != null) delay(3000L)
            doSubmit()
        }
    }

    BackHandler(enabled = true) {
        if (!submitting) {
            if (confirming) {
                confirming = false
            } else {
                val snapshot = state.answersSnapshot()
                if (state.hasUnsavedChanges()) {
                    examSaveScope.launch { CompetitionRepository.saveAnswers(session.entryId, snapshot) }
                }
                onExit()
            }
        }
    }

    // reading version here makes the screen redraw after every answer or move
    val question = if (version >= 0) state.currentQuestion() else null
    val remaining = state.remainingMs(nowMs)

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        if (question == null) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(text = "This competition has no questions to show.", color = ExamMuted, fontSize = 14.sp)
                Spacer(modifier = Modifier.size(12.dp))
                ExamButton(label = "Back", filled = false, enabled = true, onClick = onExit)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .statusBarsPadding()
                    .navigationBarsPadding()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // top: position and time left
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Question " + (state.currentIndex + 1).toString() + " of " + state.questionCount.toString(),
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    if (remaining != null) {
                        Text(
                            text = CompetitionPhaseLogic.formatCountdown(remaining),
                            color = if (remaining < 60_000L) ExamRed else ExamCyan,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Session U: one short red reminder while a ranked exam is open
                if (state.isRanked) {
                    Text(
                        text = "! Cheating means disqualification. Do not leave this window.",
                        color = ExamRed,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // question numbers: filled = answered, outlined = current
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(state.questionCount) { i ->
                        val answered = state.isAnswered(i)
                        val current = i == state.currentIndex
                        val shape = RoundedCornerShape(10.dp)
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(shape)
                                .background(if (answered) ExamCyan.copy(alpha = 0.25f) else ExamCardBg)
                                .border(1.dp, if (current) ExamCyan else Color.White.copy(alpha = 0.2f), shape)
                                .clickable(enabled = !submitting) {
                                    state.goTo(i)
                                    version += 1
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = (i + 1).toString(), color = Color.White, fontSize = 12.sp)
                        }
                    }
                }

                // the question and its choices, with math, in the local KaTeX page
                CompetitionQuestionView(
                    questionId = question.id,
                    prompt = question.prompt,
                    choices = question.choices,
                    selected = state.answerFor(question.id),
                    enabled = !submitting,
                    onPick = { index ->
                        state.select(question.id, index)
                        version += 1
                    },
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                )

                if (saveFailed) {
                    Text(
                        text = "Your latest answers are not saved yet. Trying again.",
                        color = ExamRed,
                        fontSize = 12.sp
                    )
                }
                val shownError = errorText
                if (shownError != null) {
                    Text(text = shownError, color = ExamRed, fontSize = 12.sp)
                }

                // bottom: move and submit
                if (submitting) {
                    Text(
                        text = if (timeUp) "Time is up. Submitting..." else "Submitting...",
                        color = ExamCyan,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                } else if (confirming) {
                    val left = state.unansweredCount
                    Text(
                        text = if (left > 0) "Submit now? " + left.toString() + " unanswered." else "Submit your answers?",
                        color = Color.White,
                        fontSize = 14.sp
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        ExamButton(label = "Keep going", filled = false, enabled = true, onClick = { confirming = false })
                        ExamButton(label = "Submit", filled = true, enabled = true, onClick = {
                            confirming = false
                            doSubmit()
                        })
                    }
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        ExamButton(
                            label = "Previous",
                            filled = false,
                            enabled = state.currentIndex > 0,
                            onClick = {
                                state.previous()
                                version += 1
                            }
                        )
                        ExamButton(
                            label = "Next",
                            filled = false,
                            enabled = state.currentIndex < state.questionCount - 1,
                            onClick = {
                                state.next()
                                version += 1
                            }
                        )
                        ExamButton(label = "Submit", filled = true, enabled = true, onClick = { confirming = true })
                    }
                }
            }
        }
    }
}

@Composable
private fun ExamButton(label: String, filled: Boolean, enabled: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(12.dp)
    val alpha = if (enabled) 1f else 0.4f
    Box(
        modifier = Modifier
            .clip(shape)
            .background(if (filled) ExamCyan.copy(alpha = alpha) else ExamCardBg.copy(alpha = alpha))
            .border(1.dp, ExamCyan.copy(alpha = if (filled) 0f else 0.5f * alpha), shape)
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = 18.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (filled) ExamDarkText else Color.White.copy(alpha = alpha),
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
