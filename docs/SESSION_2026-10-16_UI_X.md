# SESSION 2026-10-16 UI_X: M10 slice 1 written (hub quiz and exam runner motion)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_W.md` and `docs/UI_MOTION_PLAN.md`. Owner said "Continue" after M9.

## Current motion (G3: live code on `main`, read before changing)
- `assets/notes/quiz.html` is the hub quiz and exam runner (a WebView page). `draw()` rebuilds the whole page with `innerHTML` on every change, so a question change, an answer pick and opening a dialog all appear in one frame. Existing motion: the wrong-answer shake, the score gauge ease (700 ms), smooth scrolling of the number pill.
- The competition exam window (`competition_exam.html`, a copy of this runner) is NOT changed in this slice: read it first, then give it the same three effects (slice 2).

## What was written (only `assets/notes/quiz.html` changed; no Kotlin)
- Question change (Next, Prev, number pill, swipe): the new card slides in 14 px from the side it came from (forward from the right, back from the left), 0.22 s; Retake and first load rise 10 px, 0.26 s.
- Answer pick: the chosen choice gives a short press pulse (0.26 s). Skipped when the wrong-answer shake plays, so the two never fight.
- Dialogs (Finish / Submit confirmation, score card): a 0.2 s fade of the scrim and a 0.24 s scale-in of the sheet (0.94 to 1).
- Last minute of an exam: the red timer fades softly in and out (visual only; the text and the clock are untouched).
- How it stays safe: three one-shot flags (`enterDir`, `pulseCi`, `ovlIn`) are set only by a real change and cleared by `draw()` right after it adds a class, so a flag toggle, a solution open or an AI answer never replays an entrance. All effects are transform and opacity only, inside `@media (prefers-reduced-motion: no-preference)`. Nothing is delayed: buttons work from the first frame. The timer, Submit Exam, Finish Practice, Keep Going and the close buttons have no animation on press or close (closing a dialog stays instant).
- Unchanged: all texts, grading, progress reporting, the bridge calls, the timer logic, swipe rules, review.

## Evidence
- Code read only. I did not run the page (no browser or build tools in this chat) and CI was not seen. `[~]` The new CSS and the three `draw()` blocks were written by hand from the file as read; a typo would show as no animation or a broken page, so the first thing to check on the phone is that a quiz still opens.
- Hypothesis: `prefers-reduced-motion` follows the phone's Remove animations setting inside this WebView. Not verified; if it does not, the effects simply always play.

## Owner step
Build from `main`, open a question bank and an exam in a hub: tap Next / Prev (card slides), pick a choice (small pulse), tap Finish (dialog fades in), submit (score card fades in), in an exam wait for the last minute (timer fades softly). If a quiz shows a blank page, say so: the revert is the previous version of `quiz.html`.

## Not done
- `competition_exam.html` (slice 2, next). Review screen of the competition (`competition_review.html`) not touched.
- The status table in `docs/UI_MOTION_PLAN.md` is still not updated; this log is the status: M1 to M9 written, M10 slice 1 written.

## Next
M10 slice 2: the same three effects in `competition_exam.html` (read it first), then M11 (consistency pass).
