# SESSION 2026-10-15 AJ (Claude chat): competition review rebuilt in the hub's review look, swipe, one button row

Repo is PUBLIC. Owner (2026-10-15, after opening the review of the first TEST contest): use the hub's official solution and Explain with AI buttons as they are, same review mode as the exam on the hubs, no solution open by default, no button stacked over a button (one row), and a swipe left or right also moves to the next or previous question. Screenshots showed: a big solid Explain button over a Previous and Next row, the solution always open under the question.

## Done (`[~]` written, NOT compiled by me, CI NOT seen, not seen on a device)
- `assets/notes/competition_review.html` (whole file): hub review look copied from `quiz.html` (item card, Correct / Wrong / Skipped badge, choices with the marks "Correct" and "Your Choice", the hub's green Official solution button and violet Explain with AI button with the hub's own colours, the hub's solution and AI boxes). Both buttons sit in ONE row. The solution is CLOSED every time a question opens and toggles in the page (Hide solution / Official solution); it stays open while the AI answer arrives for the same question. Swipe: left = next, right = previous (same 50 px and 1.5 ratio rule as the hub page). The page uses a small bridge `WTReview` with `swipe(direction)` and `explain(arg)`.
- `CompetitionReviewView.kt` (whole file): adds the bridge (`ReviewBridge`, calls handed to the main thread), new optional parameters `canExplain`, `explaining`, `onSwipe`, `onExplain`, all with defaults.
- `CompetitionReviewScreen.kt` (whole file): the native big Explain button is gone (the page owns it), `canExplain = !ExamLockdown.active` (so the explanation stays closed until the window ends and while a ranked exam runs), swipe moves the index, Back / Try again / Previous / Next are `CompetitionPillButton` (glass pills, one row for Previous and Next). Unused solid button code and imports removed.

## Notes and risks
- The two hub buttons keep the hub's own small rounded look and tint (owner said "as they are"); the rest of the screen uses the glass pills. If he wants those two as full pills, change `.sol` and `.aibtn` radius in the page to 999px.
- Hypothesis: the swipe may also scroll the page a little when the finger is not horizontal enough; the same rule works in the hub page.
- The page choice text is the hub's plain sans look (no serif italic); the prompt keeps the serif look like the hub.
- Not done: leaderboard screen glass (still next), points card glass, board update.
