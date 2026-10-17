package com.wisdomtower.academy.ui.theme

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import com.wisdomtower.academy.WisdomTowerApplication
import java.util.Locale
import kotlin.math.roundToInt

/**
 * One soft, blurred colour glow of a background (no dots, no stars, no hard edges). [x] and [y] are the centre as a
 * fraction of the screen (0 to 1, may be a little outside), [radius] is a fraction of the LONGER screen side, [alpha] is
 * the strength at the centre (it fades smoothly to 0 at the edge). Low alpha keeps the glass cards readable.
 */
class BackdropGlow(val x: Float, val y: Float, val radius: Float, val color: Color, val alpha: Float)

/** Colour of the faint diagonal light sweep that Galaxy and Nebula have. */
private val BandColor = Color(0xFFA9C0FF)

/**
 * The 5 backgrounds the student can choose from (plan B2/B3 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md, reworked on
 * 2026-10-17 after the owner saw the first five flat navy colours: "no difference, ugly").
 *
 * Now they really differ: a slightly blue one, a pure black one, and three smooth space looks made only of soft glows
 * (galaxy, nebula, dusk). Nothing is a picture file (no APK size), nothing has dots or stars. [base] is the plain colour
 * under the glows; the plain colour is also what native views that need one solid colour use.
 * The saved choice is the constant NAME, so keep the names (an unknown old name falls back to Midnight).
 */
enum class AppBackgroundOption(
    val label: String,
    val base: Color,
    val glows: List<BackdropGlow> = emptyList(),
    val bandAlpha: Float = 0f
) {
    Midnight(
        "Midnight", Color(0xFF0A1530),
        listOf(BackdropGlow(0.5f, -0.05f, 0.95f, Color(0xFF2F6BFF), 0.20f))
    ),
    Black("Black", Color(0xFF000000)),
    Galaxy(
        "Galaxy", Color(0xFF070A1C),
        listOf(
            BackdropGlow(0.12f, 0.08f, 0.80f, Color(0xFF6D4AFF), 0.30f),
            BackdropGlow(0.95f, 0.48f, 0.85f, Color(0xFF1E7BFF), 0.24f),
            BackdropGlow(0.30f, 1.00f, 0.90f, Color(0xFFC03FB5), 0.16f)
        ),
        0.05f
    ),
    Nebula(
        "Nebula", Color(0xFF060F1A),
        listOf(
            BackdropGlow(0.88f, 0.04f, 0.85f, Color(0xFF12C6B8), 0.22f),
            BackdropGlow(0.08f, 0.58f, 0.90f, Color(0xFF1F5BFF), 0.22f),
            BackdropGlow(0.72f, 1.00f, 0.85f, Color(0xFF7B3FE4), 0.16f)
        ),
        0.05f
    ),
    Dusk(
        "Dusk", Color(0xFF0C0817),
        listOf(
            BackdropGlow(0.20f, 0.00f, 0.85f, Color(0xFF9B3DFF), 0.30f),
            BackdropGlow(0.96f, 0.70f, 0.90f, Color(0xFFFF4F9A), 0.16f),
            BackdropGlow(0.10f, 0.92f, 0.75f, Color(0xFF3B4BFF), 0.18f)
        )
    );

    /** The plain colour (same as [base]). */
    val color: Color get() = base

    /** The plain colour as #RRGGBB text. */
    val hex: String get() = String.format(Locale.US, "#%06X", base.toArgb() and 0xFFFFFF)

    /**
     * The same look as a CSS background value for the local WebView pages (notes, quiz, tutor ...), so a page shows the
     * same glows as the native screens. Glow sizes use vmax (1% of the longer viewport side), like [BackdropGlow.radius].
     */
    val cssBackground: String
        get() {
            val layers = ArrayList<String>()
            glows.forEach { g ->
                val c = rgb(g.color)
                layers.add(
                    "radial-gradient(circle " + pct(g.radius) + "vmax at " + pct(g.x) + "% " + pct(g.y) + "%," +
                        "rgba(" + c + "," + num(g.alpha) + "),rgba(" + c + ",0))"
                )
            }
            if (bandAlpha > 0f) {
                val c = rgb(BandColor)
                layers.add(
                    "linear-gradient(135deg,rgba(" + c + ",0) 0%,rgba(" + c + "," + num(bandAlpha) + ") 50%,rgba(" + c + ",0) 100%)"
                )
            }
            layers.add(hex)
            return layers.joinToString(",")
        }
}

private fun rgb(c: Color): String =
    (c.red * 255f).roundToInt().toString() + "," + (c.green * 255f).roundToInt() + "," + (c.blue * 255f).roundToInt()

private fun num(v: Float): String = String.format(Locale.US, "%.3f", v)

private fun pct(v: Float): String = String.format(Locale.US, "%.1f", v * 100f)

/**
 * Draws a background: the plain colour, then the soft glows, then (Galaxy and Nebula) a very faint diagonal light sweep.
 * With no [option] it draws the one the student chose and follows later changes at once (the choice is Compose state read
 * while drawing). Settings passes each option to draw its little preview circle.
 */
fun Modifier.appBackdrop(option: AppBackgroundOption? = null): Modifier = this.drawBehind {
    val opt = option ?: AppBackground.selected
    drawRect(color = opt.base)
    val longSide = maxOf(size.width, size.height)
    opt.glows.forEach { g ->
        drawRect(
            brush = Brush.radialGradient(
                colors = listOf(g.color.copy(alpha = g.alpha), g.color.copy(alpha = 0f)),
                center = Offset(size.width * g.x, size.height * g.y),
                radius = longSide * g.radius
            )
        )
    }
    if (opt.bandAlpha > 0f) {
        drawRect(
            brush = Brush.linearGradient(
                0f to BandColor.copy(alpha = 0f),
                0.5f to BandColor.copy(alpha = opt.bandAlpha),
                1f to BandColor.copy(alpha = 0f),
                start = Offset.Zero,
                end = Offset(size.width, size.height)
            )
        )
    }
}

/**
 * The ONE holder of the chosen background. The choice is saved in SharedPreferences (key [KEY], default Midnight) and
 * exposed as Compose state, so every [AtmosphereBackground] redraws the moment [select] is called.
 *
 * The saved value is read once when this object is first used (the Application already exists by then), so no state is
 * written while a screen is composing.
 */
object AppBackground {
    private const val PREFS_NAME = "wt_app_background_prefs"
    private const val KEY = "wt_app_background"

    private var selectedState by mutableStateOf(readSaved())

    /** All 5 options in display order (for the Settings picker). */
    val options: List<AppBackgroundOption> = AppBackgroundOption.values().toList()

    /** The option in use now. Reading it inside a composable or a draw block makes that follow later changes. */
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
