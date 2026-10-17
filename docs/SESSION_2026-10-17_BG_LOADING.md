# SESSION 2026-10-17 BG_LOADING (continues docs/SESSION_2026-10-17_BG_FEEDBACK_1.md, problem 2)

Written and pushed. NOT compiled, CI NOT seen, NOT seen on a phone. Causes below are hypotheses from reading the code.

- Packages loading screen (screenshot): the start-up loader overlay in `MainActivity.kt` fills with solid `BarBg` navy while `isInitialLoading` is true. Hypothesis: that is the flat panel the owner saw.
- Notes / exams / flashcards black: the page keeps its own dark colour from the start of loading until `onPageFinished` runs the glass script.
- `AppBackdrop.kt` (c0935171): new `hidePageUntilReady(view)` (alpha 0, safety reveal 1.5 s); `clearPageBackground` fades the page in (140 ms) when the glass script has run.
- `scripts/patch_backdrop_loading.py` (f2fc3ef9), tested on copies (all 7 edits, idempotent): adds `onPageStarted` calling `hidePageUntilReady` to NotesReaderScreen, FlashcardsScreen, QuizExamScreen, NativeTutorScreen, CompetitionExamScreen, CompetitionReviewView (a file that already has `onPageStarted` is skipped and reported); the MainActivity loader now draws `appBackdrop()` instead of `BarBg`. The script reads the real files, so the regex was only tested on the shape seen in code search; if it reports an ERROR nothing is written.
- OWNER STEPS: Actions > Apply pending patches > `patch_backdrop_readability.py` (drawer, from BG_DRAWER) and `patch_backdrop_loading.py`; each on its own branch, then Claude opens the PRs. Run them one after the other, merging the first before the second (both edit MainActivity.kt).
- Phone check: open notes, a quiz, flashcards, the AI Tutor and a contest exam: no black flash, no page left invisible.
