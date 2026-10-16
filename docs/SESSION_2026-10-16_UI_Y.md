# SESSION 2026-10-16 UI_Y: M10 slice 2 written (competition exam window motion)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_X.md` and `docs/UI_MOTION_PLAN.md`. Owner said "Continue".

## Current motion (G3: live code on `main`, read before changing)
- `assets/notes/competition_exam.html` is the competition's exam window, a WebView page that mirrors the hub runner `quiz.html` (exam mode) with server grading. `draw()` rebuilds the page with `innerHTML` on every change, so question changes, picks and dialogs appeared in one frame. Existing motion: only the score gauge ease.

## What was written (only `assets/notes/competition_exam.html` changed; no Kotlin)
The same three effects as `quiz.html` (see `docs/SESSION_2026-10-16_UI_X.md` for the safety rules), with the exam specifics:
- Question change (Next, Prev, number pill, swipe): the new card slides in 14 px from the side it came from, 0.22 s; the first load rises 10 px.
- Answer pick: a short pulse on the chosen choice. Autosave (`onAnswers`) is still sent in the same call, right after `draw()`; nothing waits for the animation.
- Dialogs: the "Submit this exam?" confirm, the score card after a successful submit and the Score Card button fade in. The "Submitting..." and "Could not submit" dialogs are NOT animated, and no dialog animates on close.
- Last minute: the red countdown fades softly in and out (CSS on the existing `warn` class; the clock, the 1 s tick, the server-clock forced submit and the submit retry are untouched).
- Unchanged: texts, grading (server), bridge calls, `wtBack`, `wtForceSubmit`, `wtSubmitResult`, lockdown, review. The cheating warning line is not animated.

## Evidence
- Code read only. Not run (no browser or build tools here), CI NOT seen, not seen on a device. `[~]` Hand-written whole-file resend, so the first phone check is that a ranked or practice exam still opens with its questions.
- Hypothesis: `prefers-reduced-motion` follows the phone's Remove animations setting in this WebView (not verified).

## Owner step
Build from `main`, open a practice exam in the trophy screen: Next / Prev slide, picking pulses, Submit Exam fades the dialog in, the score card fades in. Ranked exams use the same page, so check once there too (the clock keeps running, Submit still works at once). If the exam page is blank, the previous version of `competition_exam.html` is the revert.

## Not done
- `competition_review.html` (review of a finished contest) has no new motion; the Kotlin review screen already got the M9 treatment only through the hub card, not the page itself. Left for M11.
- The status table in `docs/UI_MOTION_PLAN.md` is still not updated; this log is the status: M1 to M9 written, M10 written (both runners).

## Next
M11: consistency pass (find any screen still without the kit, fix feel differences, update the phone checklist). Read the live screens first; no new features.
