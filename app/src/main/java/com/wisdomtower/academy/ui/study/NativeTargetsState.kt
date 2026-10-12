package com.wisdomtower.academy.ui.study

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray
import org.json.JSONObject

/** One study target. Same fields as `StudyGoalItem` in `website-reference/src/app/learning/LearningContent.tsx`. */
data class NativeGoal(
    val id: String,
    val text: String,
    val completed: Boolean,
    val priority: String // "high" | "medium" | "low"
)

/**
 * State of the native Targets tool (the website's "Targets", `activeFeature === "goals"` in LearningContent.tsx).
 * Saved on the phone under the website's key and JSON shape (`wt_student_goals_v5`: a JSON array of
 * `{id, text, completed, priority}`), in its own preferences file. Not shared with the website's goals.
 *
 * Difference from the website (owner rule "no fabricated content"): the website puts 3 invented sample targets
 * ("Complete 15 Model Exam Questions" marked done, ...) into every new browser; the native list starts EMPTY.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object NativeTargetsState {
    private const val PREFS = "wta_native_goals"
    private const val KEY = "wt_student_goals_v5"

    var goals by mutableStateOf<List<NativeGoal>>(emptyList())
        private set

    private var prefs: SharedPreferences? = null

    /** Loads the saved targets once. Safe to call many times. */
    fun init(context: Context) {
        if (prefs != null) return
        val p = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs = p
        goals = parse(p.getString(KEY, null))
    }

    private fun parse(raw: String?): List<NativeGoal> {
        if (raw.isNullOrEmpty()) return emptyList()
        return try {
            val arr = JSONArray(raw)
            val out = ArrayList<NativeGoal>()
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                val id = o.optString("id", "")
                if (id.isEmpty()) continue
                out.add(
                    NativeGoal(
                        id = id,
                        text = o.optString("text", ""),
                        completed = o.optBoolean("completed", false),
                        priority = o.optString("priority", "medium")
                    )
                )
            }
            out
        } catch (e: Exception) {
            emptyList() // damaged saved text: start empty
        }
    }

    /** `persistGoals` of the website: replaces the list and saves it. */
    fun save(next: List<NativeGoal>) {
        goals = next
        val arr = JSONArray()
        next.forEach { g ->
            val o = JSONObject()
            o.put("id", g.id)
            o.put("text", g.text)
            o.put("completed", g.completed)
            o.put("priority", g.priority)
            arr.put(o)
        }
        prefs?.edit()?.putString(KEY, arr.toString())?.apply()
    }

    /** Same id style as the website: `g-<millis>`. */
    fun newId(): String = "g-${System.currentTimeMillis()}"
}
