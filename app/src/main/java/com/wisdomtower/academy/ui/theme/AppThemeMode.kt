package com.wisdomtower.academy.ui.theme

/**
 * DAY MODE REMOVED (owner order 2026-10-17): the app uses many transparent "glass" cards, which do not work on a light
 * page, so the app is night-only again. [isDark] is always true. It is kept (instead of deleting it and editing every
 * colour token) so Color.kt, WisdomGlass.kt, WisdomFieldTokens.kt, WisdomMessageCard.kt and Theme.kt keep compiling and
 * return exactly the night values they always had. The light branches in those files are dead code; do not bring them back.
 * The student now chooses only a background (see [AppBackground]).
 */
object AppThemeMode {
    /** Always true. */
    val isDark: Boolean
        get() = true
}
