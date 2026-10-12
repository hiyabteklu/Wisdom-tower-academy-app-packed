package com.wisdomtower.academy.ui.study

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray
import org.json.JSONObject

/**
 * One block of the weekly timetable. Same shape as `StudyBlock` in
 * `website-reference/src/components/learning/StudyPlanner.tsx`: `day` 0 = Monday ... 6 = Sunday, `startTime` and
 * `endTime` as 24-hour "HH:MM", `color` = the website's palette class string (kept as it is so both sides can read it).
 */
data class StudyBlock(
    val id: String,
    val day: Int,
    val startTime: String,
    val endTime: String,
    val title: String,
    val color: String
)

/**
 * State of the native Study Planner. Saved on the phone under the same key and JSON shape as the website
 * (`wt_study_planner_v3`: a JSON array of blocks), in its own preferences file.
 *
 * Difference from the website (owner rule "no fabricated content"): the website puts 7 invented sample blocks
 * ("Math - Calculus I" ...) into every new browser; the native planner starts EMPTY.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object NativePlannerState {
    private const val PREFS = "wta_native_study_planner"
    private const val KEY = "wt_study_planner_v3"

    var blocks by mutableStateOf<List<StudyBlock>>(emptyList())
        private set

    private var prefs: SharedPreferences? = null

    /** Loads the saved blocks once. Safe to call many times. */
    fun init(context: Context) {
        if (prefs != null) return
        val p = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs = p
        val raw = p.getString(KEY, null) ?: return
        try {
            val arr = JSONArray(raw)
            val out = ArrayList<StudyBlock>()
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                val id = o.optString("id", "")
                val start = o.optString("startTime", "")
                val end = o.optString("endTime", "")
                if (id.isEmpty() || start.isEmpty() || end.isEmpty()) continue
                out.add(
                    StudyBlock(
                        id = id,
                        day = o.optInt("day", 0).coerceIn(0, 6),
                        startTime = start,
                        endTime = end,
                        title = o.optString("title", "Study Session"),
                        color = o.optString("color", "")
                    )
                )
            }
            blocks = out
        } catch (e: Exception) {
            // Keep the empty list when the saved text is damaged.
        }
    }

    /** `persistBlocks` of the website: replaces the list and saves it. */
    fun save(next: List<StudyBlock>) {
        blocks = next
        val arr = JSONArray()
        next.forEach { b ->
            val o = JSONObject()
            o.put("id", b.id)
            o.put("day", b.day)
            o.put("startTime", b.startTime)
            o.put("endTime", b.endTime)
            o.put("title", b.title)
            o.put("color", b.color)
            arr.put(o)
        }
        prefs?.edit()?.putString(KEY, arr.toString())?.apply()
    }

    /** Same id style as the website: `blk-<millis>-<4 random characters>`. */
    fun newId(): String {
        val chars = "abcdefghijklmnopqrstuvwxyz0123456789"
        val tail = (1..4).map { chars.random() }.joinToString("")
        return "blk-${System.currentTimeMillis()}-$tail"
    }
}
