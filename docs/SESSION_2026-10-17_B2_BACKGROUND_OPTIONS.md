# SESSION 2026-10-17 B2 BACKGROUND OPTIONS (chat, owner: "do B2 from the plan of background upgrading")

Slice B2 of `docs/PLAN_SOLID_BACKGROUND_OPTIONS.md`. Written and pushed, NOT compiled by me, CI NOT seen, NOT seen on a device (owner rule: pushed counts as done; report only what is not done).

## What changed
- NEW `ui/theme/AppBackground.kt`: enum `AppBackgroundOption` with the 5 plan colours (Midnight #0A101D default, Deep Ink #060B15, Navy #0E172A, Twilight #121A33, Graphite #0C1116) and `AppBackground`, the one holder of the choice. The choice is saved in SharedPreferences (file `wt_app_background_prefs`, key `wt_app_background`, default Midnight) and exposed as Compose state. `AppBackground.select(context, option)` applies it to the whole app at once and saves it; `AppBackground.options` is the list for the Settings picker (B3).
- `ui/theme/AppBackdrop.kt`: `color` now reads the chosen option; `webViewColor` returns it; `clearPageBackground` injects `html,body{background:<chosen hex> !important}` and updates the same style element if it is injected again.
- Not touched: `WisdomComponents.kt` (`AtmosphereBackground` already draws `AppBackdrop.color`, so it follows the choice by itself), the five WebView files, `NativeTutorScreen.kt`, `WisdomTowerApplication.kt`, forbidden files. No new dependency, no file deleted.

## Not done (next slices)
- B3: the Settings picker ("Background" section with 5 swatches in `ui/settings/SettingsScreen.kt`, call `AppBackground.select`). Until B3 exists nothing in the UI changes the colour, so the app looks exactly as after B1.
- B4: phone check and colour tuning. Owner questions 1 to 3 of the plan are still open (delete `tutor_bg.jpg`? are the 5 colours fine? whole app at once is planned); defaults are used.

## Notes for B3
- A local-page WebView that is already open keeps the old colour until its page loads again. Settings is a native screen, so this only matters if a page is kept alive behind it; check on the phone.
- Use `AppBackground.selected` to ring the chosen swatch (reading it in a composable updates the ring by itself).
