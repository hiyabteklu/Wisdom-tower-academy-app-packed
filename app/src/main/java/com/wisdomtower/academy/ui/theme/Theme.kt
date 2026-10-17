package com.wisdomtower.academy.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp

private val DarkColorScheme =
  darkColorScheme(
    primary = NavyPrimary,
    background = NavyBackground,
    surface = NavySurface,
    onPrimary = NavyOnPrimary,
    onBackground = NavyOnBackground,
    onSurface = NavyOnSurface
  )

private val LightColorScheme = DarkColorScheme // Force dark navy theme for both modes

/**
 * Owner report 2026-10-12 (problem 5): many native texts are 10.5 to 12 sp and look tiny. One app-wide lift of
 * all `sp` text by 12 percent, on top of the phone's own font-size setting, but never above a total of 1.5
 * (a student who already chose a very large system font gets no extra growth). Layout sizes in `dp` are not
 * touched. If one screen clips its text because of this, fix that screen's fixed height, do not remove the lift.
 */
private const val APP_FONT_LIFT = 1.12f
private const val APP_FONT_SCALE_CAP = 1.5f

/**
 * S8 (docs/PLAY_STORE_UI_PLAN.md): on a tablet or a phone in landscape the app content is at most 720 dp wide and
 * centered (the window background is the same navy, see `res/values/themes.xml`, so the side areas just look like margin).
 * On a normal portrait phone (narrower than 720 dp) nothing changes. Dialogs and menus are separate windows and are not capped.
 * Written, not compiled, not seen on a tablet.
 */
private val APP_CONTENT_MAX_WIDTH = 720.dp

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  // Dynamic color is available on Android 12+
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }

      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  val systemDensity = LocalDensity.current
  val liftedDensity = Density(
    density = systemDensity.density,
    fontScale = minOf(systemDensity.fontScale * APP_FONT_LIFT, maxOf(systemDensity.fontScale, APP_FONT_SCALE_CAP))
  )

  CompositionLocalProvider(LocalDensity provides liftedDensity) {
    MaterialTheme(colorScheme = colorScheme, typography = Typography) {
      Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) { // S8-width-cap
        Box(modifier = Modifier.widthIn(max = APP_CONTENT_MAX_WIDTH).fillMaxWidth().fillMaxHeight()) {
          content()
        }
      }
    }
  }
}
