package com.wisdomtower.academy.ui.study

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONObject
import kotlin.math.ceil
import kotlin.math.max

/**
 * State of the native focus timer. Same model and rules as `website-reference/src/lib/focus-timer.ts`:
 * `totalSec`, an absolute end time (`endAt`) while running, `leftWhenPaused`, `running`; remaining seconds are rounded UP;
 * start / pause / reset / preset behave like `startFocus`, `pauseFocus`, `resetFocus`, `setPreset`; when the time reaches
 * zero the timer goes back to the full length, stopped (like the website). The state is saved on the phone (same JSON
 * fields as the website's `wt_focus_timer_v1`) so the timer survives leaving the screen and closing the app.
 *
 * Who ticks it: the app shell (`MainScreen` in MainActivity.kt, patch P9) calls [tick] every 250 ms while [running], so the
 * timer keeps counting on every screen; it also sends the "session finished" notification when [completions] goes up.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object NativeFocusTimer {
    private const val PREFS = "wta_native_focus_timer"
    private const val KEY = "wt_focus_timer_v1"
    private const val DEFAULT_TOTAL = 25 * 60

    /** Length of the current session in seconds. */
    var totalSec by mutableIntStateOf(DEFAULT_TOTAL)
        private set

    /** Seconds left (rounded up). Updated by every change and by [tick]. */
    var seconds by mutableIntStateOf(DEFAULT_TOTAL)
        private set

    var running by mutableStateOf(false)
        private set

    /** Goes up by one each time a running session reaches zero. */
    var completions by mutableIntStateOf(0)
        private set

    private var endAt: Long = 0L
    private var leftWhenPaused: Int = DEFAULT_TOTAL
    private var prefs: SharedPreferences? = null

    /** True while a session is running or paused part-way (so the top-bar indicator has something to show). */
    fun isActive(): Boolean = running || (seconds in 1 until totalSec)

    /** Loads the saved state once. Safe to call many times. */
    fun init(context: Context) {
        if (prefs != null) return
        val p = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs = p
        val raw = p.getString(KEY, null) ?: return
        try {
            val o = JSONObject(raw)
            val t = o.optInt("totalSec", 0)
            totalSec = if (t > 0) t else DEFAULT_TOTAL
            val l = o.optInt("leftWhenPaused", 0)
            leftWhenPaused = if (l > 0) l else DEFAULT_TOTAL
            endAt = o.optLong("endAt", 0L)
            val wasRunning = o.optBoolean("running", false) && endAt > 0L
            if (wasRunning && endAt <= System.currentTimeMillis()) {
                // The session ended while the app was closed: back to ready, silently (no late notification).
                endAt = 0L
                leftWhenPaused = totalSec
                running = false
                seconds = totalSec
                save()
            } else {
                running = wasRunning
                seconds = remainingAt(System.currentTimeMillis())
            }
        } catch (e: Exception) {
            // Keep the defaults when the saved text is damaged.
        }
    }

    /** `startFocus()` of the website: runs for the seconds that are left (does nothing when none are left). */
    fun start() {
        val now = System.currentTimeMillis()
        val left = remainingAt(now)
        if (left <= 0) return
        endAt = now + left * 1000L
        leftWhenPaused = left
        running = true
        seconds = left
        save()
    }

    /** `pauseFocus()` of the website. */
    fun pause() {
        val left = remainingAt(System.currentTimeMillis())
        endAt = 0L
        leftWhenPaused = left
        running = false
        seconds = left
        save()
    }

    /** `resetFocus(sec)` of the website: back to the full length ([sec] when given), stopped. */
    fun reset(sec: Int? = null) {
        val total = sec ?: totalSec
        totalSec = total
        endAt = 0L
        leftWhenPaused = total
        running = false
        seconds = total
        save()
    }

    /** `setPreset(sec)` of the website. */
    fun setPreset(sec: Int) {
        reset(sec)
    }

    fun togglePlayPause() {
        if (running) pause() else start()
    }

    /** Called about four times a second while [running]: refreshes [seconds], finishes the session at zero. */
    fun tick() {
        if (!running) return
        val left = remainingAt(System.currentTimeMillis())
        if (left <= 0) {
            reset(totalSec)
            completions += 1
        } else {
            seconds = left
        }
    }

    private fun remainingAt(now: Long): Int {
        return if (running && endAt > 0L) {
            max(0, ceil((endAt - now) / 1000.0).toInt())
        } else {
            max(0, leftWhenPaused)
        }
    }

    private fun save() {
        val o = JSONObject()
        o.put("totalSec", totalSec)
        o.put("endAt", if (endAt > 0L) endAt else JSONObject.NULL)
        o.put("leftWhenPaused", leftWhenPaused)
        o.put("running", running)
        prefs?.edit()?.putString(KEY, o.toString())?.apply()
    }
}
