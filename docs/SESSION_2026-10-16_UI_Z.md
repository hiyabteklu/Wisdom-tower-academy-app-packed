# SESSION 2026-10-16 UI_Z: M11 slice 1 (state audit + competition review page motion)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_Y.md` and `docs/UI_MOTION_PLAN.md`. Owner said "Continue" (M11, the consistency pass).

## Audit: what is live on `main` (GitHub code search for the markers; the search index can lag, so treat as likely, not proven)
- `MainActivity.kt` contains the markers of M2 (`FloatingPillNav v2`), M3 (`WisdomTabLayer`), M5 (`WisdomPushLayer`) and M7 (`M7-motion`): their patch scripts were applied.
- Compose kit in use: `WisdomReveal.kt` (`wisdomReveal`) in `OpenCard.kt`, `HubItemListScreen.kt`, the competition hub and the leaderboard; `WisdomExpandable` in Settings and the leaderboard; `WisdomOverlayMotion.kt` and `WisdomPushLayer.kt` for the drawer, dialogs, notifications and competitions.
- WebView pages with motion: `flashcards.html` (M8), `quiz.html` and `competition_exam.html` (M10), `competition_review.html` (this slice).
- NOT checked: whether `patch_m6_hub_rows.py` and `patch_m7b_bell_dot.py` were applied (search by marker not done); the Learning, Home and Packages screens' own use of the kit beyond `OpenCard`.

## What was written (only `assets/notes/competition_review.html`; no Kotlin)
- A newly shown question rises in (10 px, 0.24 s), detected by the page's own id change, so swiping through questions animates and an AI answer or solution redraw does not.
- The Official solution box fades down (0.22 s) when it is opened by the button; the AI explanation box fades down when it first arrives on the same question. Closing and re-opening a question never replays the AI box.
- Same safety rules as `quiz.html`: transform and opacity only, one-shot classes added by `draw()` after the DOM is built, inside `prefers-reduced-motion: no-preference`, taps work from the first frame. Texts, bridge calls, the server's solution rules and swipe handling unchanged.

## Evidence
- Code read only. Not run, CI NOT seen, not seen on a device. `[~]` Whole-file resend: the first phone check is that a review still opens with its question and choices.

## Still open for M11 (honest list)
1. Drawer screens (About, Contact, FAQ, Privacy, Terms): still a cut; they live in their own `when` block in `MainActivity.kt` (patch script job, back handling must not change).
2. Trophy shimmer while a contest is live: not done (needs a live-contest signal in the top bar).
3. Dialog close is still the platform's instant dismiss; the hub gate dialog and other dialogs in other files were never read.
4. Competition rules page, review screen frame and points card (Kotlin): no motion of their own yet.
5. Home, Learning, Packages: confirm on the phone that cards rise once (M4) and tab changes fade (M3).
6. `docs/UI_MOTION_PLAN.md` section 7 status table: still says NOT STARTED; real status is the `SESSION_2026-10-16_UI_*` logs (M1 to M10 written, M11 partly).

## Phone checklist (add to HANDOFF section 9 for motion work)
Tap each of the 5 tabs fast and slow (pill glides, page fades through, no flash). Scroll Home, Packages and Learning (cards rise once, never replay). Open and close a package, a hub, a note, a book, a competition: Back reverses the motion. Open and close every Settings card. Open and close the menu, the bell list, the exit dialog. Flip and swipe a flashcard deck. Open a question bank and an exam: Next / Prev slide, pick pulses, dialogs fade in, the timer and Submit stay instant. Open Trophy, a finished contest's Leaderboard (2nd, 1st, 3rd rise; Ranks 4 to N opens smoothly) and Review (new question rises). Switch the phone to Remove animations: everything works instantly.

## Next
M11 slice 2 (owner's pick): drawer screens push layer (patch script), or the Kotlin rules page and points card, or the trophy shimmer, or updating the status table in `UI_MOTION_PLAN.md` (large file).
