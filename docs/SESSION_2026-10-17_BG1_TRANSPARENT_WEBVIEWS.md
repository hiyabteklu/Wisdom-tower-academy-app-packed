# Session 2026-10-17: BG1 transparent WebViews (slice 1 of docs/PLAN_BACKDROP_REMAINING.md)

DONE: `ui/theme/AppBackdrop.kt` (commit 41e53e0b): `webViewColor()` now returns `Color.TRANSPARENT`; `clearPageBackground()` injects only `html{background:transparent !important}body{background:transparent !important}` (no colour, no picture url, no glows). The picture is drawn natively by `AtmosphereBackground` behind the WebView.

CHECKED (code search, 2026-10-17): every caller of `clearPageBackground` / `webViewColor` has `AtmosphereBackground` in its screen file: NotesReaderScreen, FlashcardsScreen, QuizExamScreen, NativeTutorScreen, CompetitionExamScreen, CompetitionReviewScreen (hosts CompetitionReviewView). Step 0 of the plan was already done by the owner (PR #57 `patch_backdrop_all.py` merged 14:33 UTC, PR #56 `patch_backdrop_everywhere.py` merged before it).

TEST (owner, after the GitHub Action build is green): choose BG 1, 2 or 3 in Settings > background; open a note, a flashcard deck, a quiz, the AI Tutor, a competition exam: the picture must show behind the page (cards and bars may still be solid navy until BG3 to BG5).

NOT compiled, not run on a phone. If the build is red, paste the line starting with `e: file:///`.

RISK (hypothesis): if a page's own HTML/CSS gives `.app`, `#root` or a wrapper its own solid background (not on `html` or `body`), the page stays flat; that is slice BG3 to BG5 work, not BG1.

LEFT (order from the plan): BG6 bottom nav track, BG2 drawer panel, BG3 quiz + competition_exam html, BG4 flashcards html, BG5 tutor, BG7 dialogs and leftovers.
