# SESSION 2026-10-17 L1 — day / night foundation

Owner order: day and night mode, icon switch, display + theme + background in one setting, no text lost, no bad contrast. Plan and slices: `docs/DAY_NIGHT_PLAN.md`.

## What was pushed (one commit on `main`)
- NEW `ui/theme/AppThemeMode.kt` (holder, default night, saved).
- `ui/theme/Color.kt`: all tokens mode-aware (same names), `WisdomDarkPalette` / `WisdomLightPalette`, new `WisdomInk` / `WisdomOnInk`.
- `ui/theme/Theme.kt`: light Material scheme, follows `AppThemeMode`, page colour behind the 720 dp cap, system bars follow the mode.
- `ui/theme/WisdomGlass.kt`: glass tokens are getters, frosted white by day.
- `ui/theme/AppBackground.kt`: 5 day looks, one saved choice per mode (night key unchanged), web background kept dark.
- NEW `ui/settings/DisplaySection.kt`: "Display & Theme" card with the sun/moon icon switch.
- NEW `scripts/patch_l1_display_section.py`: swaps it in for "Reading & Display" + "Background" (tested on a fixture copy: first run patched, second run "already patched"; NOT run on the real file).
- NEW `docs/DAY_NIGHT_PLAN.md`, this log, a pointer line in `CLAUDE.md`.

## Evidence
Code read only. Not compiled here, not seen on a device. Night values were copied unchanged from the old files; the Material dark scheme still has exactly its six old values.

## UNSURE (for the next agent)
- Icons `WbSunny` and `NightsStay` are standard Material extended icons (same set as `Palette`, `Storage` already used), not grepped in the dependency.
- Status and navigation bar colours are set at runtime with the deprecated `Window` setters (warning silenced). In night they are set to `060B15`; `@color/brand_navy` was not read, so the night bars may differ by a shade from before (hypothesis: identical).
- Tokens are getters: any top-level `val x = WisdomCyan` or key-less `remember` in screens will not follow the switch (found by the sweeps).
- Day pages in WebViews stay dark on purpose until L8.

## Next
Owner runs the patch. Then L2 (shared pieces). Say "do L2".
