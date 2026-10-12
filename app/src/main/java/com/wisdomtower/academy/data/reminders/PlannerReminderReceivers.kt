package com.wisdomtower.academy.data.reminders

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.wisdomtower.academy.AcademyNotificationManager
import com.wisdomtower.academy.data.auth.AuthStateManager
import com.wisdomtower.academy.ui.study.NativePlannerState
import java.util.Locale

/**
 * Fires when the alarm of a planner block goes off: posts the reminder ("Hi <first name>, it's time for <title>
 * (<time>) — let's make some great progress today.", the same words the website planner uses through
 * `notifyPlannerTaskDue`) and sets next week's alarm for the block. A block that was deleted in the meantime sends nothing.
 * Registered in AndroidManifest.xml (not exported).
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
class PlannerReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != PlannerReminderScheduler.ACTION_FIRE) return
        val id = intent.getStringExtra(PlannerReminderScheduler.EXTRA_BLOCK_ID) ?: return
        val app = context.applicationContext
        val block = NativePlannerState.loadStored(app).firstOrNull { it.id == id } ?: return

        val firstName = AuthStateManager.currentUser.value?.fullName
            ?.trim()?.split(" ")?.firstOrNull()?.takeIf { it.isNotBlank() }
        AcademyNotificationManager.notifyPlannerTaskDue(
            ctx = app,
            taskName = block.title,
            dueTimeText = format12(block.startTime),
            studentName = firstName,
            targetUrl = PlannerReminderScheduler.TARGET_URL
        )

        // Same weekday next week. The one-minute margin keeps an alarm that arrives a moment early from firing twice.
        PlannerReminderScheduler.schedule(app, block, System.currentTimeMillis() + 60_000L)
    }

    private fun format12(t: String): String {
        val parts = t.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: return t
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
        val ampm = if (h >= 12) "PM" else "AM"
        val displayH = if (h % 12 == 0) 12 else h % 12
        return String.format(Locale.US, "%d:%02d %s", displayH, m, ampm)
    }
}

/**
 * Rebuilds all planner alarms after the phone restarts, after the app is updated, when the clock or the time zone
 * changes, and when the exact-alarm permission is switched on or off (alarms are lost or wrong in these cases).
 * Registered in AndroidManifest.xml.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
class PlannerBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val app = context.applicationContext
        PlannerReminderScheduler.sync(app, NativePlannerState.loadStored(app))
    }
}
