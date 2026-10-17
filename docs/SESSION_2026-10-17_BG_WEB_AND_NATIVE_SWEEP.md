# Session 2026-10-17: BG-WEB + BG-NATIVE (owner: "make the background literally everywhere, no pop up, no form left")

Owner screenshots (5:39 to 5:41) showed flat navy in: drawer, bottom nav track, notes, quiz/exam, flashcards, AI Tutor, pop-ups. They were taken BEFORE BG1 was built, so they only prove the state before today's commits.

## DONE (written, NOT compiled, NOT seen on a phone)
1. BG1 `AppBackdrop.kt` (41e53e0b): WebView + page transparent.
2. BG-WEB `AppBackdrop.kt` (fa764f46): `clearPageBackground()` also runs `GLASS_JS`. One script for ALL local pages (notes, question banks, quiz/exam, flashcards, AI Tutor page, competition exam/review/board pages): every opaque dark-blue block (blue strongest channel, max 110) becomes white 5% glass; navy-only gradients likewise; a full-screen wrapper becomes transparent; inline highlights and accent colours (green Known, orange Next, cyan, red/green answer states) untouched; re-runs on class changes so selected/correct/wrong still work. No per-page edits needed, new pages are covered automatically.
3. BG-NATIVE `scripts/patch_backdrop_native_sweep.py` (0ef40ad8): NOT RUN YET. Needs the owner to run it (see below). It rewrites only hex literals in every `.kt` under `app/src/main/java`: `.background(Color(0xFF<navy>))` to 30%, `containerColor = Color(0xFF<navy>)` (dialogs, menus) to 70%, old near-solid navy (0xC0..0xF8 alpha) to 40%. Tested on a sample (idempotent, text colours untouched). It also writes `docs/BACKDROP_SWEEP_REPORT.md` (places still using a NAMED navy colour) and `docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt` (current bottom nav code).

## OWNER STEP
GitHub > Actions > Apply pending patches > Run workflow: script `patch_backdrop_native_sweep.py`, branch `claude/backdrop-native-sweep`. Then tell Claude: check the branch, open the pull request when the build is green.

## KNOWN GAPS after this (next slices)
- Bottom nav: `patch_glass_nav.py` (P20) was never applied (no `NavGlassTrack` in MainActivity.kt), so the track has an outline "road" and a navy fill. If the track uses a named colour or a border the sweep cannot change it, read `docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt` and write a small exact patch (track fill white 5%, no outline, keep the approved wide pill with label).
- Named colours (`BarBg`, `StPanelBg`, etc.) used as fills: listed in `docs/BACKDROP_SWEEP_REPORT.md`; fix one file per slice.
- Compose components that take their colour from the Material theme (default `AlertDialog`, `DropdownMenu`, `TimePicker` / clock dialog, `ModalBottomSheet`, `DatePicker`) when no `containerColor` is written in code: need an explicit `containerColor` (70% navy) added, listed next from a code search.
- Native tutor top pill / input pill: only fixed if they use hex literals.
