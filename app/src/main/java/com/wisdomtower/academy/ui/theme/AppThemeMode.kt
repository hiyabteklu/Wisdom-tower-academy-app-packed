package com.wisdomtower.academy.ui.theme

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.wisdomtower.academy.WisdomTowerApplication

/**
 * L1 (docs/DAY_NIGHT_PLAN.md): the ONE holder of the day / night choice. Same pattern as [AppBackground]: the choice is
 * saved in SharedPreferences (key [KEY], default night, which is the approved look) and exposed as Compose state, so every
 * colour token in Color.kt that reads [isDark] inside a composable or a draw block follows a change at once.
 *
 * The saved value is read once when this object is first used (the Application already exists by then), so no state is
 * written while a screen is composing.
 */
object AppThemeMode {
    private const val PREFS_NAME = "wt_app_theme_prefs"
    private const val KEY = "wt_theme_mode"
    private const val NIGHT = "night"
    private const val DAY = "day"

    private var darkState by mutableStateOf(readSaved())

    /** True for night mode (the default). Reading it inside a composable or a draw block makes that follow later changes. */
    val isDark: Boolean
        get() = darkState

    /** Applies night ([dark] = true) or day ([dark] = false) to the whole app at once and saves it. */
    fun setDark(context: Context, dark: Boolean) {
        darkState = dark
        context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY, if (dark) NIGHT else DAY)
            .apply()
    }

    private fun readSaved(): Boolean {
        val app = runCatching { WisdomTowerApplication.instance }.getOrNull() ?: return true
        return app.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(KEY, NIGHT) != DAY
    }
}
