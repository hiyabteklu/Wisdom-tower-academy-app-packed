package com.wisdomtower.academy.ui.study

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

/**
 * Requests from anywhere in the app (drawer row, website links caught in MainActivity) to open a NATIVE tool on the
 * Learning tab. `LearningScreen` watches the flags, opens the native screen and resets the flag.
 * Written for patches P7 (tutor), P8 (calculator), P9 (timer), P10 (planner) and P11 (notebook, targets), owner
 * problems 1 and 2, 2026-10-12. Compose state, so a change is seen by the screen at once.
 */
object NativeToolRequests {
    var pendingTutor by mutableStateOf(false)
    var pendingCalculator by mutableStateOf(false)
    var pendingTimer by mutableStateOf(false)
    var pendingPlanner by mutableStateOf(false)
    var pendingNotebook by mutableStateOf(false)
    var pendingTargets by mutableStateOf(false)

    fun requestTutor() {
        pendingTutor = true
    }

    fun requestCalculator() {
        pendingCalculator = true
    }

    fun requestTimer() {
        pendingTimer = true
    }

    fun requestPlanner() {
        pendingPlanner = true
    }

    fun requestNotebook() {
        pendingNotebook = true
    }

    fun requestTargets() {
        pendingTargets = true
    }
}
