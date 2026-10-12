package com.wisdomtower.academy.data.reminders

import android.Manifest
import android.app.Activity
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.wisdomtower.academy.ui.study.StudyBlock
import java.util.Calendar

/**
 * Reminders for the NATIVE Study Planner (owner decision 2026-10-12: the native planner must send reminder
 * notifications; no sharing with the website planner).
 *
 * How it works: every block of the weekly timetable gets ONE system alarm for its next start time (its weekday and
 * "HH:MM"). When the alarm fires, [PlannerReminderReceiver] posts the existing "Planner Reminder" notification
 * (`AcademyNotificationManager.notifyPlannerTaskDue`, which respects the Settings switch "Planner & Deadlines") and sets
 * the alarm for the same weekday next week. Alarms work while the app is closed. [sync] is called after every change of
 * the timetable; [PlannerBootReceiver] calls it again after a reboot, an app update, a clock change or a time zone change
 * (alarms do not survive a reboot).
 *
 * Exactness: with the "alarms & reminders" permission the alarm is exact; without it (the user may switch it off in the
 * phone settings, Android 13+ starts with it off) the alarm still fires but the system may delay it by a few minutes.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object PlannerReminderScheduler {
    private const val PREFS = "wta_planner_reminders"
    private const val KEY_SCHEDULED = "scheduled_ids"
    private const val KEY_ASKED_NOTIFICATIONS = "asked_notification_permission"
    private const val NOTIFICATION_PERMISSION_REQUEST = 7301

    const val ACTION_FIRE = "com.wisdomtower.academy.PLANNER_REMINDER"
    const val EXTRA_BLOCK_ID = "planner_block_id"

    /** The page a tapped reminder opens (the native planner once patch P10 is applied). */
    const val TARGET_URL = "https://www.wisdom-tower-academy.live/learning?tool=planner"

    /**
     * First moment after [after] (milliseconds) that is [day] (0 = Monday ... 6 = Sunday) at [startMinutes] after midnight,
     * in the phone's time zone. Uses calendar days, so summer/winter time changes do not move the reminder.
     */
    fun nextTriggerMillis(day: Int, startMinutes: Int, after: Long): Long {
        val cal = Calendar.getInstance()
        cal.timeInMillis = after
        val targetDow = if (day == 6) Calendar.SUNDAY else day + 2 // Calendar.MONDAY is 2 ... SATURDAY is 7
        cal.set(Calendar.HOUR_OF_DAY, startMinutes / 60)
        cal.set(Calendar.MINUTE, startMinutes % 60)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val diff = (targetDow - cal.get(Calendar.DAY_OF_WEEK) + 7) % 7
        cal.add(Calendar.DAY_OF_YEAR, diff)
        if (cal.timeInMillis <= after) cal.add(Calendar.DAY_OF_YEAR, 7)
        return cal.timeInMillis
    }

    /** Replaces all planner alarms by one alarm per block of [blocks]. Safe to call as often as needed. */
    fun sync(context: Context, blocks: List<StudyBlock>) {
        val app = context.applicationContext
        val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val old = prefs.getStringSet(KEY_SCHEDULED, emptySet()) ?: emptySet()
        old.forEach { cancel(app, it) }
        val now = System.currentTimeMillis()
        val ids = HashSet<String>()
        blocks.forEach { b ->
            schedule(app, b, now)
            ids.add(b.id)
        }
        prefs.edit().putStringSet(KEY_SCHEDULED, ids).apply()
    }

    /** Sets the alarm of one block for its first start time after [after]. */
    fun schedule(context: Context, block: StudyBlock, after: Long) {
        val app = context.applicationContext
        val am = app.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val parts = block.startTime.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: return
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
        val trigger = nextTriggerMillis(block.day, h * 60 + m, after)
        val pi = pendingIntent(app, block.id)
        try {
            val exact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
            if (exact) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pi)
            } else {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pi)
            }
        } catch (e: SecurityException) {
            // The exact-alarm permission was taken away while we were setting it: use the relaxed alarm.
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pi)
        }
    }

    private fun cancel(app: Context, blockId: String) {
        val am = app.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        am.cancel(pendingIntent(app, blockId))
    }

    private fun pendingIntent(app: Context, blockId: String): PendingIntent {
        val intent = Intent(app, PlannerReminderReceiver::class.java)
            .setAction(ACTION_FIRE)
            .putExtra(EXTRA_BLOCK_ID, blockId)
        return PendingIntent.getBroadcast(
            app,
            blockId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /**
     * Android 13+ shows reminders only after the student allows notifications. Asks once (the first time a block is
     * added), only when [context] is (or wraps) an Activity and the permission is not granted yet. The answer is not
     * needed here: the system remembers it.
     */
    fun askNotificationPermissionOnce(context: Context?) {
        if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val app = context.applicationContext
        if (ContextCompat.checkSelfPermission(app, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) return
        val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (prefs.getBoolean(KEY_ASKED_NOTIFICATIONS, false)) return
        var c: Context? = context
        while (c is ContextWrapper) {
            if (c is Activity) break
            c = c.baseContext
        }
        val activity = c as? Activity ?: return
        prefs.edit().putBoolean(KEY_ASKED_NOTIFICATIONS, true).apply()
        ActivityCompat.requestPermissions(activity, arrayOf(Manifest.permission.POST_NOTIFICATIONS), NOTIFICATION_PERMISSION_REQUEST)
    }
}
