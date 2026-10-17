package com.wisdomtower.academy.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/**
 * Unified Wisdom Tower Academy color tokens mirroring the live website (src/app/globals.css).
 * Source of truth: https://www.wisdom-tower-academy.live
 *
 * L1 (docs/DAY_NIGHT_PLAN.md, owner order 2026-10-17): every token below is now MODE AWARE. The names did not change, so
 * every screen that already uses them follows the day / night switch ([AppThemeMode]) with no edit. In night mode each
 * token returns exactly the value it always had (the approved look). In day mode it returns the light value from
 * [WisdomLightPalette], chosen so that text has at least 4.5:1 contrast on the day backgrounds and icons at least 3:1.
 *
 * BG-TOKENS (2026-10-17, owner: the chosen background must show literally everywhere): the three NIGHT fill tokens
 * [card], [cardElevated] and [surfaceDeep] and the night [WisdomCardSurfaceGradient] are see-through, so every screen that
 * paints its cards, panels and surfaces with `WisdomCard`, `WisdomCardElevated`, `WisdomDark` or the card gradient lets
 * the chosen background show through. [navy] and [background] stay solid on purpose (the status and navigation bars are
 * painted with [navy]). Their RGB values are unchanged.
 * BG-STRENGTH (2026-10-17, owner: the glass is good but too faint against the textured background, raise slightly):
 * alpha 0x66 (40 percent) became 0x85 (52 percent); the gradient 0x66 / 0x73 became 0x85 / 0x8F. To go back, set them to
 * 66 / 66 / 66 and 66 / 73.
 *
 * Two NEW tokens cover what `Color.White` / `Color.Black` were used for in screens:
 *  - [WisdomInk]   = the foreground colour (white at night, deep navy by day). Use it for text, icons and white tints.
 *  - [WisdomOnInk] = text on top of an [WisdomInk] fill (black at night, white by day), e.g. a selected chip.
 * Rule for the screen sweeps: never write `Color.White` / `Color.Black` for text or tints again; use these two.
 *
 * A token is a getter, so it must be read while composing or drawing. A value read once at class load (a top-level
 * `val x = WisdomCyan`, or `remember { }` without keys) will NOT follow the switch; the sweeps fix those places.
 */
internal object WisdomDarkPalette {
    val cyan = Color(0xFF22E0FF)
    val cyanDark = Color(0xFF00C4E6)
    val background = Color(0xFF070C16)
    val surfaceDeep = Color(0x850A101C)
    val navy = Color(0xFF060B15)
    val card = Color(0x850C1424)
    val cardElevated = Color(0x85162134)
    val cardBorder = Color(0x3322E0FF)
    val cardBorderSubtle = Color(0x17FFFFFF)
    val borderWhite = Color(0x1AFFFFFF)
    val muted = Color(0xFFAAB6C8)
    val textPrimary = Color(0xFFF4F7FB)
    val onCyan = Color(0xFF070D17)
    val ink = Color(0xFFFFFFFF)
    val onInk = Color(0xFF000000)
    val purple = Color(0xFFA855F7)
    val violet = Color(0xFF8B5CF6)
    val amber = Color(0xFFF59E0B)
    val emerald = Color(0xFF10B981)
    val rose = Color(0xFFF43F5E)
    val sky = Color(0xFF38BDF8)
    val orange = Color(0xFFF97316)
    val indigo = Color(0xFF6366F1)
    val fuchsia = Color(0xFFD946EF)
}

/** Day values. Contrast checked by hand against white and F4F7FB: cyan 5.0, muted 7.1, every accent 5.0 or more. */
internal object WisdomLightPalette {
    val cyan = Color(0xFF0E7490)
    val cyanDark = Color(0xFF155E75)
    val background = Color(0xFFF4F7FB)
    val surfaceDeep = Color(0xFFE8EEF6)
    val navy = Color(0xFFF4F7FB)
    val card = Color(0xFFFFFFFF)
    val cardElevated = Color(0xFFF8FAFC)
    val cardBorder = Color(0x330E7490)
    val cardBorderSubtle = Color(0x1A0F172A)
    val borderWhite = Color(0x240F172A)
    val muted = Color(0xFF475569)
    val textPrimary = Color(0xFF0F172A)
    val onCyan = Color(0xFFFFFFFF)
    val ink = Color(0xFF0F172A)
    val onInk = Color(0xFFFFFFFF)
    val purple = Color(0xFF7E22CE)
    val violet = Color(0xFF6D28D9)
    val amber = Color(0xFFB45309)
    val emerald = Color(0xFF047857)
    val rose = Color(0xFFBE123C)
    val sky = Color(0xFF0369A1)
    val orange = Color(0xFFC2410C)
    val indigo = Color(0xFF4338CA)
    val fuchsia = Color(0xFFA21CAF)
}

private fun pick(dark: Color, light: Color): Color = if (AppThemeMode.isDark) dark else light

// Primary Palette
val WisdomCyan: Color get() = pick(WisdomDarkPalette.cyan, WisdomLightPalette.cyan) // night: --cyan #22e0ff; day: deep cyan for contrast
val WisdomCyanDark: Color get() = pick(WisdomDarkPalette.cyanDark, WisdomLightPalette.cyanDark)
val WisdomBackground: Color get() = pick(WisdomDarkPalette.background, WisdomLightPalette.background) // root canvas (--background: #070c16)
val WisdomDark: Color get() = pick(WisdomDarkPalette.surfaceDeep, WisdomLightPalette.surfaceDeep) // secondary background (--wt-dark: #0a101c)
val WisdomNavy: Color get() = pick(WisdomDarkPalette.navy, WisdomLightPalette.navy) // page / status background
val WisdomCard: Color get() = pick(WisdomDarkPalette.card, WisdomLightPalette.card) // surface card (--wt-card)
val WisdomCardElevated: Color get() = pick(WisdomDarkPalette.cardElevated, WisdomLightPalette.cardElevated) // card-modern surface
val WisdomCardBorder: Color get() = pick(WisdomDarkPalette.cardBorder, WisdomLightPalette.cardBorder) // soft cyan card border
val WisdomCardBorderSubtle: Color get() = pick(WisdomDarkPalette.cardBorderSubtle, WisdomLightPalette.cardBorderSubtle) // 1px border
val WisdomBorderWhite: Color get() = pick(WisdomDarkPalette.borderWhite, WisdomLightPalette.borderWhite) // night: white 10%; day: ink 14%
val WisdomMuted: Color get() = pick(WisdomDarkPalette.muted, WisdomLightPalette.muted) // slate muted text (--wt-muted)
val WisdomTextPrimary: Color get() = pick(WisdomDarkPalette.textPrimary, WisdomLightPalette.textPrimary) // (--foreground)
val WisdomDarkOnCyan: Color get() = pick(WisdomDarkPalette.onCyan, WisdomLightPalette.onCyan) // text on a solid cyan button (dark at night, white by day)

// New in L1: foreground and its opposite (replace Color.White / Color.Black for text, icons and tints in screens)
val WisdomInk: Color get() = pick(WisdomDarkPalette.ink, WisdomLightPalette.ink)
val WisdomOnInk: Color get() = pick(WisdomDarkPalette.onInk, WisdomLightPalette.onInk)

// Semantic & Category Accents (day values are darker so they stay readable on light cards)
val WisdomAccentPurple: Color get() = pick(WisdomDarkPalette.purple, WisdomLightPalette.purple)
val WisdomAccentViolet: Color get() = pick(WisdomDarkPalette.violet, WisdomLightPalette.violet)
val WisdomAccentAmber: Color get() = pick(WisdomDarkPalette.amber, WisdomLightPalette.amber)
val WisdomAccentEmerald: Color get() = pick(WisdomDarkPalette.emerald, WisdomLightPalette.emerald)
val WisdomAccentRose: Color get() = pick(WisdomDarkPalette.rose, WisdomLightPalette.rose)
val WisdomAccentSky: Color get() = pick(WisdomDarkPalette.sky, WisdomLightPalette.sky)
val WisdomAccentOrange: Color get() = pick(WisdomDarkPalette.orange, WisdomLightPalette.orange)
val WisdomAccentIndigo: Color get() = pick(WisdomDarkPalette.indigo, WisdomLightPalette.indigo)
val WisdomAccentFuchsia: Color get() = pick(WisdomDarkPalette.fuchsia, WisdomLightPalette.fuchsia)

// Gradient Brushes
val WisdomHeroGradientBrush: Brush
    get() = if (AppThemeMode.isDark) {
        Brush.horizontalGradient(colors = listOf(Color(0xFF22E0FF), Color(0xFF38BDF8), Color(0xFF818CF8)))
    } else {
        Brush.horizontalGradient(colors = listOf(Color(0xFF0E7490), Color(0xFF0369A1), Color(0xFF4338CA)))
    }

val WisdomCardSurfaceGradient: Brush
    get() = if (AppThemeMode.isDark) {
        Brush.verticalGradient(colors = listOf(Color(0x85162134), Color(0x8F0E1624)))
    } else {
        Brush.verticalGradient(colors = listOf(Color(0xF2FFFFFF), Color(0xF2F8FAFC)))
    }

val WisdomPrimaryBtnGradient: Brush
    get() = if (AppThemeMode.isDark) {
        Brush.horizontalGradient(colors = listOf(Color(0xFF22E0FF), Color(0xFF00C4E6)))
    } else {
        Brush.horizontalGradient(colors = listOf(Color(0xFF0E7490), Color(0xFF155E75)))
    }

// Material 3 mappings
val NavyPrimary: Color get() = WisdomCyan
val NavyBackground: Color get() = WisdomNavy
val NavySurface: Color get() = WisdomCard
val NavyOnPrimary: Color get() = WisdomDarkOnCyan
val NavyOnBackground: Color get() = WisdomTextPrimary
val NavyOnSurface: Color get() = WisdomTextPrimary
