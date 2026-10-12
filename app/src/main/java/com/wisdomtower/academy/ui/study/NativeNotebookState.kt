package com.wisdomtower.academy.ui.study

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray
import org.json.JSONObject
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/** One sheet of the notebook. Same fields as `NoteSheet` in `website-reference/src/app/learning/LearningContent.tsx`. */
data class NativeNoteSheet(
    val id: String,
    val title: String,
    val content: String,
    val updatedAt: String
)

/** One folder of the notebook. Same fields as `NoteFolder` in `LearningContent.tsx`. */
data class NativeNoteFolder(
    val id: String,
    val name: String,
    val sheets: List<NativeNoteSheet>
)

/**
 * State of the native Notebook (the website's "Notebook" tool, `activeFeature === "notes"` in LearningContent.tsx).
 * Saved on the phone under the website's key and JSON shape (`wt_student_notebook_v5`: a JSON array of folders with
 * their sheets), in its own preferences file. Notes are NOT shared with the website notebook (same decision as the
 * planner: the website keeps them in the WebView's localStorage).
 *
 * Difference from the website (owner rule "no fabricated content"): the website puts two sample folders ("Freshman Year",
 * "Entrance & Exit Notes") with sample sheets into every new browser; the native notebook starts EMPTY.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object NativeNotebookState {
    private const val PREFS = "wta_native_notebook"
    private const val KEY = "wt_student_notebook_v5"
    private const val ISO = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"

    var folders by mutableStateOf<List<NativeNoteFolder>>(emptyList())
        private set

    private var prefs: SharedPreferences? = null

    /** Loads the saved notebook once. Safe to call many times. */
    fun init(context: Context) {
        if (prefs != null) return
        val p = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs = p
        folders = parse(p.getString(KEY, null))
    }

    private fun parse(raw: String?): List<NativeNoteFolder> {
        if (raw.isNullOrEmpty()) return emptyList()
        return try {
            val arr = JSONArray(raw)
            val out = ArrayList<NativeNoteFolder>()
            for (i in 0 until arr.length()) {
                val fo = arr.optJSONObject(i) ?: continue
                val fid = fo.optString("id", "")
                if (fid.isEmpty()) continue
                val sheets = ArrayList<NativeNoteSheet>()
                val sa = fo.optJSONArray("sheets")
                if (sa != null) {
                    for (j in 0 until sa.length()) {
                        val so = sa.optJSONObject(j) ?: continue
                        val sid = so.optString("id", "")
                        if (sid.isEmpty()) continue
                        sheets.add(
                            NativeNoteSheet(
                                id = sid,
                                title = so.optString("title", ""),
                                content = so.optString("content", ""),
                                updatedAt = so.optString("updatedAt", "")
                            )
                        )
                    }
                }
                out.add(NativeNoteFolder(fid, fo.optString("name", ""), sheets))
            }
            out
        } catch (e: Exception) {
            emptyList() // damaged saved text: start empty
        }
    }

    /** `persistNotebook` of the website: replaces the list and saves it. */
    fun save(next: List<NativeNoteFolder>) {
        folders = next
        val arr = JSONArray()
        next.forEach { f ->
            val fo = JSONObject()
            fo.put("id", f.id)
            fo.put("name", f.name)
            val sa = JSONArray()
            f.sheets.forEach { s ->
                val so = JSONObject()
                so.put("id", s.id)
                so.put("title", s.title)
                so.put("content", s.content)
                so.put("updatedAt", s.updatedAt)
                sa.put(so)
            }
            fo.put("sheets", sa)
            arr.put(fo)
        }
        prefs?.edit()?.putString(KEY, arr.toString())?.apply()
    }

    /** `new Date().toISOString()` of the website. */
    fun isoNow(): String {
        val f = SimpleDateFormat(ISO, Locale.US)
        f.timeZone = TimeZone.getTimeZone("UTC")
        return f.format(Date())
    }

    /** `new Date(iso).toLocaleDateString()` of the website, in the phone's short date style. */
    fun displayDate(iso: String): String {
        if (iso.isEmpty()) return ""
        return try {
            val f = SimpleDateFormat(ISO, Locale.US)
            f.timeZone = TimeZone.getTimeZone("UTC")
            val d = f.parse(iso) ?: return ""
            DateFormat.getDateInstance(DateFormat.SHORT).format(d)
        } catch (e: Exception) {
            ""
        }
    }

    /** Same id style as the website: `<prefix>-<millis>` (prefix `f` for folders, `s` for sheets). */
    fun newId(prefix: String): String = "$prefix-${System.currentTimeMillis()}"
}
