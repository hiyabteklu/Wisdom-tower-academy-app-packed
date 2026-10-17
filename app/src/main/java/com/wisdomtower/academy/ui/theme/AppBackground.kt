package com.wisdomtower.academy.ui.theme

import android.content.Context
import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import com.wisdomtower.academy.WisdomTowerApplication
import java.util.Locale
import kotlin.math.roundToInt

/**
 * One soft, blurred colour glow of a background (no dots, no stars, no hard edges). [x] and [y] are the centre as a
 * fraction of the screen (0 to 1, may be a little outside), [radius] is a fraction of the LONGER screen side, [alpha] is
 * the strength at the centre (it fades smoothly to 0 at the edge). Low alpha keeps the glass cards readable.
 */
class BackdropGlow(val x: Float, val y: Float, val radius: Float, val color: Color, val alpha: Float)

/** Colour of the faint diagonal light sweep that Nebula has. */
private val BandColor = Color(0xFFA9C0FF)

/**
 * The backgrounds the student can choose from (plan B2/B3 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md, reworked on
 * 2026-10-17 after the owner saw the first five flat navy colours: "no difference, ugly").
 *
 * NIGHT (5): a slightly blue one, a pure black one, Galaxy (the owner's Milky Way photo, blurred smooth, see
 * BackdropPhotos.kt), and two smooth space looks made only of soft glows (nebula, dusk).
 * DAY (5, L1 of docs/DAY_NIGHT_PLAN.md, [isDay] = true): five light looks made the same way, a pale page colour with
 * one or two very soft, low-opacity glows (cloud, sky, mint, sand, lilac). Dark text has strong contrast on all of them.
 * No dots, no stars. [base] is the plain colour under the look; it is also what native views that need one solid colour use.
 * The saved choice is the constant NAME, so keep the names (an unknown old name falls back to the default of its mode:
 * Midnight at night, Cloud by day).
 */
enum class AppBackgroundOption(
    val label: String,
    val base: Color,
    val glows: List<BackdropGlow> = emptyList(),
    val bandAlpha: Float = 0f,
    /** Base64 of a small, already smooth JPEG that is stretched over the screen, or null. */
    val photo: String? = null,
    /** True for the five day looks. */
    val isDay: Boolean = false
) {
    Midnight(
        "Midnight", Color(0xFF0A1530),
        listOf(BackdropGlow(0.5f, -0.05f, 0.95f, Color(0xFF2F6BFF), 0.20f))
    ),
    Black("Black", Color(0xFF000000)),
    Galaxy("Galaxy", Color(0xFF0B1226), photo = GALAXY_BACKDROP_BASE64),
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
    ),

    // ---- DAY looks (L1) ----
    Cloud(
        "Cloud", Color(0xFFF4F7FB),
        listOf(BackdropGlow(0.5f, -0.05f, 0.95f, Color(0xFF38BDF8), 0.22f)),
        isDay = true
    ),
    Sky(
        "Sky", Color(0xFFEAF3FF),
        listOf(
            BackdropGlow(0.85f, 0.00f, 0.90f, Color(0xFF3B82F6), 0.20f),
            BackdropGlow(0.10f, 0.70f, 0.90f, Color(0xFF22D3EE), 0.16f)
        ),
        isDay = true
    ),
    Mint(
        "Mint", Color(0xFFEEF9F4),
        listOf(
            BackdropGlow(0.20f, 0.00f, 0.90f, Color(0xFF10B981), 0.18f),
            BackdropGlow(0.90f, 0.80f, 0.80f, Color(0xFF22D3EE), 0.12f)
        ),
        isDay = true
    ),
    Sand(
        "Sand", Color(0xFFFBF5EA),
        listOf(
            BackdropGlow(0.80f, 0.00f, 0.90f, Color(0xFFF59E0B), 0.18f),
            BackdropGlow(0.10f, 0.90f, 0.80f, Color(0xFFF97316), 0.10f)
        ),
        isDay = true
    ),
    Lilac(
        "Lilac", Color(0xFFF4F0FF),
        listOf(
            BackdropGlow(0.20f, 0.00f, 0.90f, Color(0xFFA855F7), 0.16f),
            BackdropGlow(0.95f, 0.70f, 0.90f, Color(0xFFEC4899), 0.10f)
        ),
        isDay = true
    );

    /** The plain colour (same as [base]). */
    val color: Color get() = base

    /**
     * The plain colour as #RRGGBB text. For a day look this is the default night colour on purpose: it is used for the
     * local WebView pages (notes, quiz, tutor ...), whose text is still light, so they stay dark until slice L8 of
     * docs/DAY_NIGHT_PLAN.md makes them follow day mode.
     */
    val hex: String
        get() = if (isDay) Midnight.hex else String.format(Locale.US, "#%06X", base.toArgb() and 0xFFFFFF)

    /**
     * The same look as a CSS background value for the local WebView pages (notes, quiz, tutor ...), so a page shows the
     * same look as the native screens. Glow sizes use vmax (1% of the longer viewport side), like [BackdropGlow.radius];
     * a photo is stretched to cover the screen. For a day look it returns the Midnight look (see [hex]).
     */
    val cssBackground: String
        get() {
            if (isDay) return Midnight.cssBackground
            val layers = ArrayList<String>()
            if (photo != null) {
                layers.add("url(data:image/jpeg;base64," + photo + ") center / cover no-repeat")
            }
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

/** Decodes each option's small photo once and keeps it. */
private object BackdropPhotos {
    private val cache = HashMap<String, ImageBitmap>()

    @Synchronized
    fun get(option: AppBackgroundOption): ImageBitmap? {
        val data = option.photo ?: return null
        cache[option.name]?.let { return it }
        val decoded = runCatching {
            val bytes = Base64.decode(data, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap()
        }.getOrNull() ?: return null
        cache[option.name] = decoded
        return decoded
    }
}

/**
 * Draws a background: the plain colour, then the photo (Galaxy), then the soft glows, then (Nebula) a very faint diagonal
 * light sweep. With no [option] it draws the one the student chose for the current mode (day or night) and follows later
 * changes at once (the choice and the mode are Compose state read while drawing). Settings passes each option to draw
 * its little preview circle.
 */
fun Modifier.appBackdrop(option: AppBackgroundOption? = null): Modifier = this.drawBehind {
    val opt = option ?: AppBackground.selected
    drawRect(color = opt.base)
    val photo = BackdropPhotos.get(opt)
    if (photo != null) {
        // "Cover": scale the picture to fill the screen and crop the overflow evenly; High quality filtering keeps it smooth.
        val scale = maxOf(size.width / photo.width, size.height / photo.height)
        val srcW = (size.width / scale).roundToInt().coerceIn(1, photo.width)
        val srcH = (size.height / scale).roundToInt().coerceIn(1, photo.height)
        drawImage(
            image = photo,
            srcOffset = IntOffset((photo.width - srcW) / 2, (photo.height - srcH) / 2),
            srcSize = IntSize(srcW, srcH),
            dstSize = IntSize(size.width.roundToInt(), size.height.roundToInt()),
            filterQuality = FilterQuality.High
        )
    }
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
 * The ONE holder of the chosen backgrounds. There are two saved choices, one per mode: night (key [KEY_NIGHT], default
 * Midnight, the same key as before L1, so an old choice is kept) and day (key [KEY_DAY], default Cloud). Both are
 * Compose state and [selected] follows [AppThemeMode], so every [AtmosphereBackground] redraws the moment [select] or the
 * day / night switch is used.
 *
 * The saved values are read once when this object is first used (the Application already exists by then), so no state is
 * written while a screen is composing.
 */
object AppBackground {
    private const val PREFS_NAME = "wt_app_background_prefs"
    private const val KEY_NIGHT = "wt_app_background"
    private const val KEY_DAY = "wt_app_background_day"

    private var nightState by mutableStateOf(readSaved(KEY_NIGHT, false, AppBackgroundOption.Midnight))
    private var dayState by mutableStateOf(readSaved(KEY_DAY, true, AppBackgroundOption.Cloud))

    /** The 5 night options in display order. */
    val nightOptions: List<AppBackgroundOption> = AppBackgroundOption.values().filter { !it.isDay }

    /** The 5 day options in display order. */
    val dayOptions: List<AppBackgroundOption> = AppBackgroundOption.values().filter { it.isDay }

    /** The 5 options of the mode in use now (for the Settings picker). */
    val options: List<AppBackgroundOption>
        get() = if (AppThemeMode.isDark) nightOptions else dayOptions

    /** The option in use now (night or day choice, by the mode). Reading it inside a composable or a draw block makes that follow later changes. */
    val selected: AppBackgroundOption
        get() = if (AppThemeMode.isDark) nightState else dayState

    /** Applies the option to the whole app at once and saves it (a day option is saved as the day choice, a night option as the night choice). */
    fun select(context: Context, option: AppBackgroundOption) {
        if (option.isDay) dayState = option else nightState = option
        context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(if (option.isDay) KEY_DAY else KEY_NIGHT, option.name)
            .apply()
    }

    private fun readSaved(key: String, day: Boolean, default: AppBackgroundOption): AppBackgroundOption {
        val app = runCatching { WisdomTowerApplication.instance }.getOrNull() ?: return default
        val name = app.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(key, null)
        return AppBackgroundOption.values().firstOrNull { it.name == name && it.isDay == day } ?: default
    }
}
