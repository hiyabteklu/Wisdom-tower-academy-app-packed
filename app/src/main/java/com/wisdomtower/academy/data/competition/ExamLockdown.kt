package com.wisdomtower.academy.data.competition

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

// C6 slice 4: the one app-wide flag that says a ranked competition exam is running.
// Owner decision Q9 (2026-10-14): build the hook now, security later. C10 (integrity) will read it to switch
// the AI tutor and the tool overlays off, to warn when the student leaves the app and to flag suspicious activity.
// Nothing reads it yet, so raising it changes no behaviour today.
// It is Compose state, so any screen that reads active redraws when it changes.
// Only a ranked exam raises it. Practice does not.
// Note: do not write a slash followed by a star inside any comment, Kotlin nests comments.
object ExamLockdown {
    var active by mutableStateOf(false)
        private set

    fun enter() {
        active = true
    }

    fun leave() {
        active = false
    }
}
