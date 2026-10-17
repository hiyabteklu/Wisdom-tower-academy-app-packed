# Session 2026-10-17: background on every screen, tools and forms too

Owner (2026-10-17): the chosen background (Dark, BG 1-3, Blue) must show on ALL screens, ALL tools and the forms, no exception. This settles the open OWNER DECISION in `docs/GLASS_PLAN.md` area 6: the tool outer panels become see-through.

Why the pictures were missing (read from code): the overlay layers in `MainActivity.kt` (tabs zIndex 10, AI Tutor 16, Notifications and Competitions 17, Study workspace 18, Drawer pages 25) each paint `.background(WisdomNavy)` on top of the backdrop; Theme.kt and WisdomTabLayer.kt do the same. Tool panels were solid (`0xFF0A1122`, `0xFF0F172A`) or 85 percent (`0xFF0C1626`, `StPanelBg`).

Fix: ONE script, `scripts/patch_backdrop_all.py`. It runs `scripts/patch_backdrop_everywhere.py` first (idempotent), then turns the tool panels into glass (white 4 percent) and the form fields, the Account panel and the Forgot-password card into glass (white 6 percent). Strings that are not found are printed as MISSING, not as errors.

Run: GitHub > Actions > Apply pending patches > script `patch_backdrop_all.py`, branch `claude/backdrop-all`. Merge when the build is green.

Left opaque on purpose: dialogs, drop-down menus, PDF page badge (they float above the page). Not compiled, not seen on a phone. If panels are hard to read on a bright picture, raise the white alpha (0.04 / 0.06) in the script, not per file.
