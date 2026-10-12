package com.wisdomtower.academy.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.R

// Bundled offline typography matching Outfit (display) & Plus Jakarta Sans (body) from website-reference
val OutfitFontFamily = FontFamily(
    Font(R.font.outfit_regular, FontWeight.Normal),
    Font(R.font.outfit_semibold, FontWeight.SemiBold),
    Font(R.font.outfit_bold, FontWeight.Bold),
    Font(R.font.outfit_extrabold, FontWeight.ExtraBold),
    Font(R.font.outfit_black, FontWeight.Black),
)

val PlusJakartaSansFontFamily = FontFamily(
    Font(R.font.plus_jakarta_sans_regular, FontWeight.Normal),
    Font(R.font.plus_jakarta_sans_medium, FontWeight.Medium),
    Font(R.font.plus_jakarta_sans_semibold, FontWeight.SemiBold),
    Font(R.font.plus_jakarta_sans_bold, FontWeight.Bold),
    Font(R.font.plus_jakarta_sans_extrabold, FontWeight.ExtraBold),
)

// Bundled offline typography matching Tinos (Google Fonts, Times New Roman metric-compatible serif)
val TinosFontFamily = FontFamily(
    Font(R.font.tinos_regular, FontWeight.Normal, FontStyle.Normal),
    Font(R.font.tinos_italic, FontWeight.Normal, FontStyle.Italic),
    Font(R.font.tinos_bold, FontWeight.Bold, FontStyle.Normal),
    Font(R.font.tinos_bold_italic, FontWeight.Bold, FontStyle.Italic),
)

// Single global switch for content text (T2): change to FontStyle.Normal for upright body text
val ContentFontStyle: FontStyle = FontStyle.Italic

val ContentFontFamily: FontFamily = TinosFontFamily

// Shared typography tokens for content text across reading & learning screens (T2)
// 1. Question & Explanation: 17 sp / line 26 sp
val ContentQuestionStyle = TextStyle(
    fontFamily = ContentFontFamily,
    fontStyle = ContentFontStyle,
    fontWeight = FontWeight.Normal,
    fontSize = 17.sp,
    lineHeight = 26.sp,
    color = WisdomTextPrimary
)

val ContentExplanationStyle = TextStyle(
    fontFamily = ContentFontFamily,
    fontStyle = ContentFontStyle,
    fontWeight = FontWeight.Normal,
    fontSize = 17.sp,
    lineHeight = 26.sp,
    color = WisdomTextPrimary
)

// 2. Options: 16 sp / line 24 sp
val ContentOptionStyle = TextStyle(
    fontFamily = ContentFontFamily,
    fontStyle = ContentFontStyle,
    fontWeight = FontWeight.Normal,
    fontSize = 16.sp,
    lineHeight = 24.sp,
    color = WisdomTextPrimary
)

// 3. Flashcard face: 20 sp / line 28 sp
val ContentFlashcardStyle = TextStyle(
    fontFamily = ContentFontFamily,
    fontStyle = ContentFontStyle,
    fontWeight = FontWeight.Normal,
    fontSize = 20.sp,
    lineHeight = 28.sp,
    color = WisdomTextPrimary
)

// 4. Content Caption: 13 sp / line 18 sp
val ContentCaptionStyle = TextStyle(
    fontFamily = ContentFontFamily,
    fontStyle = ContentFontStyle,
    fontWeight = FontWeight.Normal,
    fontSize = 13.sp,
    lineHeight = 18.sp,
    color = WisdomMuted
)

val Typography = Typography(
    displayLarge = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.Black,
        fontSize = 36.sp,
        lineHeight = 42.sp,
        letterSpacing = (-0.02).sp,
        color = WisdomTextPrimary
    ),
    displayMedium = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 34.sp,
        letterSpacing = (-0.02).sp,
        color = WisdomTextPrimary
    ),
    displaySmall = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 30.sp,
        letterSpacing = (-0.01).sp,
        color = WisdomTextPrimary
    ),
    titleLarge = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        lineHeight = 26.sp,
        letterSpacing = (-0.01).sp,
        color = WisdomTextPrimary
    ),
    titleMedium = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
        letterSpacing = 0.sp,
        color = WisdomTextPrimary
    ),
    titleSmall = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 18.sp,
        letterSpacing = 0.sp,
        color = WisdomTextPrimary
    ),
    bodyLarge = TextStyle(
        fontFamily = PlusJakartaSansFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.sp,
        color = WisdomTextPrimary
    ),
    bodyMedium = TextStyle(
        fontFamily = PlusJakartaSansFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.sp,
        color = WisdomMuted
    ),
    bodySmall = TextStyle(
        fontFamily = PlusJakartaSansFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.sp,
        color = WisdomMuted
    ),
    labelLarge = TextStyle(
        fontFamily = PlusJakartaSansFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 18.sp,
        letterSpacing = 0.sp
    ),
    labelMedium = TextStyle(
        fontFamily = PlusJakartaSansFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.sp
    ),
    labelSmall = TextStyle(
        fontFamily = PlusJakartaSansFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        lineHeight = 14.sp,
        letterSpacing = 0.5.sp
    )
)
