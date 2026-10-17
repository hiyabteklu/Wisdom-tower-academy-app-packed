# PLAN: chosen background on EVERY screen - STATUS 2026-10-17 (read this first)

Owner rule, said many times: NO EXCEPTIONS. The chosen background (Dark, BG 1-3, Blue) must show behind every screen, tool, form, pop-up, drawer and the bottom navigation. Owner uses a phone only, free plan limit is near: ONE small slice per chat, write it down, push every time. Never resend MainActivity.kt (261 KB): use a patch script in `scripts/` (owner runs Actions > Apply pending patches, then Claude checks the branch and opens the PR).

## STATUS (edited in place). Nothing below has been compiled-checked by an agent or seen on a phone.
- [x] Step 0 `patch_backdrop_all.py` merged (PR #57).
- [~] BG1 `ui/theme/AppBackdrop.kt`: WebView and local pages transparent (41e53e0b). On main.
- [~] BG-WEB `AppBackdrop.kt` GLASS_JS (fa764f46): one script turns every opaque dark-blue panel of every WebView page (notes, question banks, quiz/exam, flashcards, tutor page, competition pages) into white 5% glass; accent colours and answer states untouched. On main. This REPLACES the old per-page plans BG3, BG4, BG5-html (no HTML edits needed).
- [~] BG-THEME `ui/theme/Theme.kt` (b79e7908): dark Material surface-container roles see-through: default pop-ups (AlertDialog, menus, clock/TimePicker, DatePicker, sheets). On main.
- [~] BG-NATIVE `scripts/patch_backdrop_native_sweep.py`: RUN and MERGED (PR #58). 24 literals in 16 files. Report: `docs/BACKDROP_SWEEP_REPORT.md`; nav code: `docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt`.
- [~] BG-TOKENS `ui/theme/Color.kt` (fc7df972): night `card`, `cardElevated`, `surfaceDeep` and the card gradient are 40% see-through (alpha 0x66). `navy`/`background` stay solid (system bars use navy).
- [ ] BG-NAV + BG-NAMES `scripts/patch_backdrop_nav_names.py`: written, tested on a mock, NOT RUN. Owner: Actions > Apply pending patches > script `patch_backdrop_nav_names.py`, branch `claude/backdrop-nav-names`; then Claude checks the branch and opens the PR when the build is green. It makes the bottom nav track white 6% glass (no outline, no glow; pill, labels, animation untouched) and the named fills CardSurface, StPanelBg, RulesNavy, OnboardCard 40%, DialogBg 70%.
- [ ] Drawer (BG2): the sweep/tokens should cover it; verify on the phone. If still solid, read the drawer panel code in MainActivity (search `Color(0x` near the drawer) and write an exact patch.
- [ ] Phone check after the build is green: drawer, bottom bar, notes, quiz, question bank, flashcards, AI Tutor (native pills too), clock pop-up, a contest exam / result board. Owner sends screenshots of anything still solid.
- Solid on purpose: cold splash, `BarBg` root fill, `OnboardBg`, status and navigation bar colours.
- Tuning in one place each: Color.kt alpha 0x66, Theme.kt 0xB3 / 0x99 / 0x33, AppBackdrop.kt GLASS 0.05, nav patch 0.06. Raise if text is hard to read on a bright picture.
- Do NOT apply `patch_glass_nav.py` (P20): it shows labels on every tab; the approved nav shows the label only on the selected pill.

Session logs: `docs/SESSION_2026-10-17_BG_WEB_AND_NATIVE_SWEEP.md`, `docs/SESSION_2026-10-17_BG_NAV_NAMES_TOKENS.md`, `docs/SESSION_2026-10-17_BG1_TRANSPARENT_WEBVIEWS.md`.

## Old plan notes (kept short)
- Notes page flat navy was caused by the MainActivity overlay fill and a file:// css picture the page could not read; fixed by BG1 + Step 0.
- Dialogs and drop-downs: owner wants glass too (about 70% so text stays readable): done through Theme.kt and the sweep.
- Rules for the next Claude: small files (AppBackdrop.kt, Color.kt, Theme.kt, html) may be edited directly on main; if the build is red the owner pastes the line starting with `e: file:///`.
