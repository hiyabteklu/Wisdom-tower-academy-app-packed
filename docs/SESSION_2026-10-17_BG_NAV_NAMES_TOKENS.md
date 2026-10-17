# Session 2026-10-17: BG-NAV, BG-NAMES, BG-TOKENS (continues SESSION_2026-10-17_BG_WEB_AND_NATIVE_SWEEP.md)

Sweep (PR #58) is MERGED on main: 24 literal changes in 16 files (report: `docs/BACKDROP_SWEEP_REPORT.md`, nav code: `docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt`). Build result not seen by the agent.

## DONE on main (not compiled, not seen on a phone)
- BG-TOKENS `ui/theme/Color.kt` (fc7df972): night `card`, `cardElevated`, `surfaceDeep` and the night card gradient are now 40% see-through (alpha 0x66). Every screen using `WisdomCard`, `WisdomCardElevated`, `WisdomDark`, `WisdomCardSurfaceGradient` follows. `navy` and `background` stay solid (status / navigation bars use `navy`). To undo: set the alpha bytes back to FF (E6 / F5 for the gradient).
- BG-THEME `Theme.kt` (b79e7908): Material surface-container roles see-through (dialogs, menus, clock, sheets).
- BG-WEB `AppBackdrop.kt`: one script makes dark-blue panels of every WebView page glass.

## OWNER STEP (script written, NOT run)
Actions > Apply pending patches > script `patch_backdrop_nav_names.py`, branch `claude/backdrop-nav-names`. It (1) turns the bottom nav track into white 6% glass with no outline and no glow shadow (the approved pill, labels and animation are untouched; anchor copied from the snapshot, tested on a mock), (2) makes the named navy fills `CardSurface`, `StPanelBg`, `RulesNavy`, `OnboardCard` 40% and the exit dialog `DialogBg` 70%.

## STILL SOLID ON PURPOSE
`BarBg` (root fill under the backdrop, cold splash), `OnboardBg` (first-run screen), status and navigation bar colours.

## LEFT AFTER THAT (check on the phone, then one slice each)
- Any screen still flat: send a screenshot; likely a `Surface(color = ...)` or a hex literal built another way.
- If text is hard to read on a bright picture: raise the alpha bytes (`Color.kt` 0x66, `Theme.kt` 0xB3, GLASS in AppBackdrop.kt 0.05).
- Native competition board screens and the Tutor top / input pills: verify on the phone.
