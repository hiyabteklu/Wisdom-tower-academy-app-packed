package com.wisdomtower.academy.data.content

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray
import org.json.JSONObject

/**
 * T8 "My Subjects": the subjects the student studies, chosen in Settings. "Your status" counts only these.
 *
 * Shape: group id (`freshman`, `ece`, `grade-9` ... `grade-12`) -> the picked subject slugs (the last segment of
 * `learning_resources.scope_path`). A group with no picked subject is not stored, so it is not followed.
 *
 * Kept on the device only, per signed-in user id (owner answer D, 2026-10-14), in its own preferences file. Nothing
 * is deleted anywhere and nothing is sent to the server: the choice only changes what is COUNTED.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object MySubjectsStore {
    private const val PREFS = "wta_my_subjects"
    private const val KEY_PREFIX = "choice_"

    /** group id -> picked subject slugs. Empty map = nothing picked. */
    var choice by mutableStateOf<Map<String, Set<String>>>(emptyMap())
        private set

    private var prefs: SharedPreferences? = null
    private var loaded = false
    private var loadedUserId: String? = null

    /** Loads the saved choice of [userId] (empty when signed out). Safe to call many times. */
    fun load(context: Context, userId: String?) {
        val p = prefs ?: context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE).also { prefs = it }
        if (loaded && userId == loadedUserId) return
        loaded = true
        loadedUserId = userId
        choice = if (userId.isNullOrBlank()) emptyMap() else parse(p.getString(KEY_PREFIX + userId, null))
    }

    /** Replaces the picked subjects of one group and saves. An empty set removes the group. Ignored when signed out. */
    fun setGroup(groupId: String, slugs: Set<String>) {
        val userId = loadedUserId
        val p = prefs
        if (userId.isNullOrBlank() || p == null) return
        val next = choice.toMutableMap()
        if (slugs.isEmpty()) {
            next.remove(groupId)
        } else {
            next[groupId] = slugs
        }
        choice = next
        p.edit().putString(KEY_PREFIX + userId, serialize(next)).apply()
    }

    fun clearGroup(groupId: String) {
        setGroup(groupId, emptySet())
    }

    private fun serialize(map: Map<String, Set<String>>): String {
        val obj = JSONObject()
        for ((group, slugs) in map) {
            obj.put(group, JSONArray(slugs.toList()))
        }
        return obj.toString()
    }

    private fun parse(raw: String?): Map<String, Set<String>> {
        if (raw.isNullOrEmpty()) return emptyMap()
        return try {
            val obj = JSONObject(raw)
            val out = LinkedHashMap<String, Set<String>>()
            val keys = obj.keys()
            while (keys.hasNext()) {
                val group = keys.next()
                val arr = obj.optJSONArray(group) ?: continue
                val slugs = LinkedHashSet<String>()
                for (i in 0 until arr.length()) {
                    val s = arr.optString(i, "")
                    if (s.isNotEmpty()) slugs.add(s)
                }
                if (slugs.isNotEmpty()) out[group] = slugs
            }
            out
        } catch (e: Exception) {
            emptyMap() // damaged saved text: start empty
        }
    }
}
