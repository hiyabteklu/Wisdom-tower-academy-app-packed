package com.wisdomtower.academy.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/**
 * Unified Wisdom Tower Academy color tokens mirroring the live website (src/app/globals.css).
 * Source of truth: https://www.wisdom-tower-academy.live
 */
// Primary Palette
val WisdomCyan = Color(0xFF22E0FF) // Source of truth accent cyan (--cyan: #22e0ff)
val WisdomCyanDark = Color(0xFF00C4E6)
val WisdomBackground = Color(0xFF070C16) // Root canvas background (--background: #070c16)
val WisdomDark = Color(0xFF0A101C) // Secondary background (--wt-dark: #0a101c)
val WisdomNavy = Color(0xFF060B15) // Deep obsidian navy page/status background
val WisdomCard = Color(0xFF0C1424) // Surface dark card (--wt-card: #1c283c / #0c1424)
val WisdomCardElevated = Color(0xFF162134) // card-modern surface
val WisdomCardBorder = Color(0x3322E0FF) // Soft cyan card border
val WisdomCardBorderSubtle = Color(0x17FFFFFF) // 1px border rgba(255, 255, 255, 0.09)
val WisdomBorderWhite = Color(0x1AFFFFFF) // rgba(255, 255, 255, 0.10)
val WisdomMuted = Color(0xFFAAB6C8) // Slate muted text (--wt-muted: #aab6c8)
val WisdomTextPrimary = Color(0xFFF4F7FB) // (--foreground: #f4f7fb)
val WisdomDarkOnCyan = Color(0xFF070D17) // Dark text on solid cyan buttons

// Semantic & Category Accents
val WisdomAccentPurple = Color(0xFFA855F7)
val WisdomAccentViolet = Color(0xFF8B5CF6)
val WisdomAccentAmber = Color(0xFFF59E0B)
val WisdomAccentEmerald = Color(0xFF10B981)
val WisdomAccentRose = Color(0xFFF43F5E)
val WisdomAccentSky = Color(0xFF38BDF8)
val WisdomAccentOrange = Color(0xFFF97316)
val WisdomAccentIndigo = Color(0xFF6366F1)
val WisdomAccentFuchsia = Color(0xFFD946EF)

// Gradient Brushes
val WisdomHeroGradientBrush = Brush.horizontalGradient(
    colors = listOf(
        Color(0xFF22E0FF),
        Color(0xFF38BDF8),
        Color(0xFF818CF8)
    )
)

val WisdomCardSurfaceGradient = Brush.verticalGradient(
    colors = listOf(
        Color(0xE6162134),
        Color(0xF50E1624)
    )
)

val WisdomPrimaryBtnGradient = Brush.horizontalGradient(
    colors = listOf(
        Color(0xFF22E0FF),
        Color(0xFF00C4E6)
    )
)

// Material 3 mappings
val NavyPrimary = WisdomCyan
val NavyBackground = WisdomNavy
val NavySurface = WisdomCard
val NavyOnPrimary = WisdomDarkOnCyan
val NavyOnBackground = WisdomTextPrimary
val NavyOnSurface = WisdomTextPrimary
