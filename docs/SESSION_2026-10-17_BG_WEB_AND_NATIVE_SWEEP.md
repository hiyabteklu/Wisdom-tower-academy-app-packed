# Session 2026-10-17: BG-WEB + BG-THEME + BG-NATIVE sweep (owner: "make the background literally everywhere, no pop up, no form left")

Owner screenshots (5:39 to 5:41) showed flat navy in: drawer, bottom nav track, notes, quiz/exam, flashcards, AI Tutor, pop-ups. They were taken BEFORE BG1 was built, so they only prove the state before today's commits.

## DONE (written, NOT compiled, NOT seen on a phone)
1. BG1 `AppBackdrop.kt` (41e53e0b): WebView + page transparent.
2. BG-WEB `AppBackdrop.kt` (fa764f46): `clearPageBackground()` also runs `GLASS_JS`. One script for ALL local pages (notes, question banks, quiz/exam, flashcards, AI Tutor page, competition exam/review/board pages): every opaque dark-blue block (blue strongest channel, max 110) becomes white 5% glass; navy-only gradients likewise; a full-screen wrapper becomes transparent; inline highlights and accent colours (green Known, orange Next, cyan, red/green answer states) untouched; re-runs on class changes so selected/correct/wrong still work. No per-page edits needed, new pages are covered automatically.
3. BG-THEME `Theme.kt` (b79e7908): the dark Material colour scheme now sets `surfaceContainerLowest/Low/Container/High/Highest`, `surfaceBright`, `surfaceDim` to see-through navy (60 to 70%) or white glass (20%). Every default pop-up that takes its fill from the theme (AlertDialog, DropdownMenu, TimePicker clock, DatePicker, ModalBottomSheet, filled Card) is now see-through from this ONE place. Compose BOM 2024.09.00 = Material3 1.3, so these parameters exist. Night only; the light scheme is unchanged.
4. BG-NATIVE `scripts/patch_backdrop_native_sweep.py` (0ef40ad8): NOT RUN YET. Needs the owner to run it (see below). It rewrites only hex literals in every `.kt` under `app/src/main/java`: `.background(Color(0xFF<navy>))` to 30%, `containerColor = Color(0xFF<navy>)` (dialogs, menus) to 70%, old near-solid navy (0xC0..0xF8 alpha) to 40%. Tested on a sample (idempotent, text colours untouched). It also writes `docs/BACKDROP_SWEEP_REPORT.md` (places still using a NAMED navy colour) and `docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt` (current bottom nav code).

## OWNER STEP
GitHub > Actions > Apply pending patches > Run workflow: script `patch_backdrop_native_sweep.py`, branch `claude/backdrop-native-sweep`. Then tell Claude: check the branch, open the pull request when the build is green.

## KNOWN GAPS after this (next slices, in order)
- Bottom nav: `patch_glass_nav.py` (P20) was never applied (no `NavGlassTrack` in MainActivity.kt), so the track has an outline "road" and a navy fill. Needs the sweep run first, then read `docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt` and write a small exact patch (track fill white 5%, no outline, keep the approved wide pill with label). Do NOT replace the function with P20's version: that one shows labels on all tabs, the approved design shows the label only on the selected pill.
- Named colours (`BarBg`, `StPanelBg`, etc.) used as fills: listed in `docs/BACKDROP_SWEEP_REPORT.md`; fix one file per slice.
- Native tutor top pill / input pill and the contest native screens: only fixed if they use hex literals; check the report.
- Cold-start splash stays solid on purpose.
