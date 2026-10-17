package com.wisdomtower.academy.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * L2 (docs/DAY_NIGHT_PLAN.md): surface of a text field (Settings fields and later the sign-in fields). Night: the navy
 * `0F1829` the Settings fields always had. Day: a very light grey-white so the dark text and the label have strong
 * contrast. A getter: read it while composing, not once at class load.
 */
val WisdomFieldSurface: Color
    get() = if (AppThemeMode.isDark) Color.White.copy(alpha = 0.06f) else Color(0xFFF8FAFC)
