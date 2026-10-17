# DAY_NIGHT_PLAN.md — day and night mode (owner order 2026-10-17)

> Owner words: "build functional amazing day and night mode (use icon not text to switch, as a button in settings display, theme and background, and this switch became in one setting). It should be functional, no text getting missed or bad contrast. Build it carefully."
> This OVERRIDES the earlier decision "DARK ONLY for launch" (`docs/PLAY_STORE_UI_PLAN.md`, S7). Night stays the default and its look must not change. Free-plan rule: ONE slice per chat (`docs/AGENT_QUOTA_PROTOCOL.md`). Repo is public: no secrets.

## 1. Verified facts (code read on 2026-10-17)
- Colours were top-level constants in `ui/theme/Color.kt` (`WisdomCyan`, `WisdomMuted`, ...). Screens use them directly, and about 44 files use `Color.White` and about 40 files use literal `Color(0xFF...)` dark navy values. So switching only the Material scheme would leave white text on white. The fix must be done through tokens, then file by file.
- `Theme.kt` forced the dark scheme (`LightColorScheme = DarkColorScheme`). System bars are navy from `res/values/themes.xml` (not edge-to-edge). The window background is navy (S8 width cap showed it at the sides).
- Backgrounds: `AppBackground` (Compose state + SharedPreferences) with 5 night looks. `AppBackdrop.clearPageBackground` injects `AppBackground.selected.cssBackground` into the local WebView pages (notes, quiz, tutor ...), whose text is light.
- Settings had two cards: "Reading & Display" (font size, typography, live preview) and "Background".

## 2. Design (L1, written)
- `AppThemeMode` (new): ONE holder, Compose state + SharedPreferences (`wt_app_theme_prefs`, default night).
- `Color.kt`: every token is a mode-aware getter (same names). Night values are exactly the old ones. Day values come from `WisdomLightPalette` (page F4F7FB, cards white, text 0F172A, muted 475569, cyan 0E7490, accents darkened). New tokens `WisdomInk` (white at night, 0F172A by day) and `WisdomOnInk` (black at night, white by day).
- `Theme.kt`: real light Material scheme; follows `AppThemeMode` (not the phone setting); paints the page colour behind the width-capped content; status and navigation bars follow the mode (icons dark by day).
- `WisdomGlass.kt`: glass fills become frosted white by day (white 72% / 88% / 50%), edge ink 12%.
- `AppBackground.kt`: 5 NIGHT looks (unchanged, same saved key) + 5 DAY looks (Cloud, Sky, Mint, Sand, Lilac); one saved choice per mode. Web pages keep the dark background until slice L8 (`hex` and `cssBackground` of a day look return the Midnight values on purpose).
- Settings: ONE card "Display & Theme" (`ui/settings/DisplaySection.kt`): 1 sun/moon icon switch (no text, TalkBack: switch named "Day and night mode", states "Day mode"/"Night mode"), 2 backgrounds of the current mode, 3 font size, 4 typography, live preview (texts and saved font setting unchanged). `scripts/patch_l1_display_section.py` swaps it in for the two old cards (tested on a fixture, run twice).

## 3. Rules for every sweep slice (do not invent new rules)
1. Text, icons and tints: never `Color.White` / `Color.Black`. Use `WisdomTextPrimary` or `WisdomInk` for text and icons, `WisdomMuted` for secondary text, `WisdomInk.copy(alpha = x)` for white tints and borders, `WisdomOnInk` for text on a `WisdomInk` fill (selected chips).
2. Text on a solid accent or cyan fill: `WisdomDarkOnCyan` on cyan; white on an accent fill by day (accents are 5:1 or darker on white).
3. Literal dark surfaces (`Color(0xFF0C1424)`, `0xFF0F1829`, `0xFF131f38` ...): replace with `WisdomCard`, `WisdomCardElevated`, `WisdomGlassFill*` or `WisdomNavy`. Scrims over photos or the PDF page may stay black.
4. Never read a token once (top-level `val x = WisdomCyan`, `remember { listOf(WisdomCyan) }` without keys): it will not follow the switch. Use a getter or a function.
5. Contrast: normal text 4.5:1 or more, large text and icons 3:1 or more, in BOTH modes. Check the day value against white and F4F7FB and the glow looks (Sky, Mint, Sand, Lilac are all very pale). Night must look identical to before.
6. Big files (`MainActivity.kt`, `SettingsScreen.kt`, `LearningScreen.kt`, over about 30 KB): patch script plus the Action (`docs/EDITING_LARGE_FILES.md`). Real Material icons only (`docs/BUILD_PITFALLS.md`). No new dependency or host.

## 4. Slices
| Slice | What | Status |
|---|---|---|
| L1 | Foundation: tokens, light scheme, day backgrounds, system bars, merged Settings card with the icon switch | WRITTEN 2026-10-17 (owner: run the patch, see section 5) |
| L2 | Shared pieces: `WisdomMessageCard`, `OpenCard`, `SignInPill`, `ScreenBackButton`, bottom nav, top bar (MainActivity patch), drawer shell | open |
| L3 | Home and Learning screens | open |
| L4 | Packages, Package detail, Account, sign-in, forgot password | open |
| L5 | Rest of Settings (`SettingsScreen.kt` sweep script, `MySubjectsSection`, `AccountDeletionSection`), Drawer screens, Guides, Notifications | open |
| L6 | Study tools: Notebook, Planner, Timer, Calculator, Targets, Cover page, PDF reader, Tutor, Hub lists, Status | open |
| L7 | Competitions (7 files) | open |
| L8 | Local WebView pages (notes, quiz, tutor, math) follow day mode; admin console overlay; onboarding, splash, dialogs | open |
| L9 | Full contrast audit with owner screenshots in both modes (all tabs, TalkBack, font Large) | open |

## 5. What the owner does for L1
1. GitHub > Actions > Apply pending patches > script `patch_l1_display_section.py`, branch `fix/day-night-l1`. Wait for the green build, test, merge. (Without the patch the app still builds and Settings shows the two old cards; the new card is simply not shown yet.)
2. On the phone: Settings > "Display & Theme" > tap the sun/moon pill. Expected: the whole app flips at once and stays after closing the app; the five background swatches change with the mode; status bar and bottom bar follow.
3. KNOWN until L2 to L8 are done: screens that still write `Color.White` for text will show white text on the light page in Day mode. That is exactly what the sweep slices fix, one area per chat. Do not publish Day mode to students before L9 is signed off. The local web pages stay dark in Day mode on purpose until L8.
