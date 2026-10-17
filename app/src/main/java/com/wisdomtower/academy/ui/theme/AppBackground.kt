package com.wisdomtower.academy.ui.theme

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import com.wisdomtower.academy.WisdomTowerApplication

/**
 * The 5 solid background colours the student can choose from (plan B2 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md).
 * All five are dark and low in saturation so the see-through glass cards keep their contrast. The hex values are
 * proposals from the existing navy family; the owner may change them after seeing them on the phone (plan B4).
 */
enum class AppBackgroundOption(val label: String, val color: Color) {
    Midnight("Midnight", Color(0xFF0A101D)),
    DeepInk("Deep Ink", Color(0xFF060B15)),
    Navy("Navy", Color(0xFF0E172A)),
    Twilight("Twilight", Color(0xFF121A33)),
    Graphite("Graphite", Color(0xFF0C1116));

    /** The colour as #RRGGBB text, used for the CSS of the local WebView pages. */
    val hex: String get() = String.format("#%06X", color.toArgb() and 0xFFFFFF)
}

/**
 * The ONE holder of the chosen background. The choice is saved in SharedPreferences (key [KEY], default Midnight) and
 * exposed as Compose state, so every [AtmosphereBackground] recomposes the moment [select] is called.
 *
 * The saved value is read once when this object is first used (the Application already exists by then), so no state is
 * written while a screen is composing.
 */
object AppBackground {
    private const val PREFS_NAME = "wt_app_background_prefs"
    private const val KEY = "wt_app_background"

    private var selectedState by mutableStateOf(readSaved())

    /** All 5 options in display order (for the Settings picker, plan B3). */
    val options: List<AppBackgroundOption> = AppBackgroundOption.values().toList()

    /** The option in use now. Reading it inside a composable makes that composable follow later changes. */
    val selected: AppBackgroundOption
        get() = selectedState

    /** Applies the option to the whole app at once and saves it. */
    fun select(context: Context, option: AppBackgroundOption) {
        selectedState = option
        context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY, option.name)
            .apply()
    }

    private fun readSaved(): AppBackgroundOption {
        val app = runCatching { WisdomTowerApplication.instance }.getOrNull()
            ?: return AppBackgroundOption.Midnight
        val name = app.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(KEY, null)
        return AppBackgroundOption.values().firstOrNull { it.name == name } ?: AppBackgroundOption.Midnight
    }
}
