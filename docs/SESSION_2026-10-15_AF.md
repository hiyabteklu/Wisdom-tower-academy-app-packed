# SESSION 2026-10-15 AF (Claude chat): read the handoff and status, then a READ-ONLY check of the live competition data

Repo is PUBLIC: no secrets, no student names or emails, no user ids here. Owner order: "read the handoff and status ... and continue". No code was changed. Nothing was written to Supabase. `docs/COMPETITION_STATUS.md` was NOT edited in this commit (it is a very large file and has to be resent whole; the next agent reads this file because HANDOFF section 0 says to read the newest SESSION files).

## What was found (read-only SQL on the live project, 2026-10-15 about 06:20 UTC)
1. A test contest ALREADY EXISTS on live data and no session file or board line mentions it: title "TEST - owner only", audience value `owner-test` (matches no student scope, so only an admin passes `private.competition_access`; real students cannot see or join it, read from the live function body), published, no package needed, 15 minute window 04:16 to 04:31 UTC today, 10 questions, 0 points. Created 04:01 UTC today. It is ENDED now.
2. `scheduled_notifications` has 0 rows (session AE test row is gone, as logged).
3. Entries on that contest: 9 entries, all from ONE user (the account that tested), none disqualified.
   - 1 ranked entry: started 04:17:46, submitted at exactly the window end 04:31:02 (the server closed it at `ends_at`), score 0, saved answers were EMPTY (`{}`).
   - 8 practice entries: 3 submitted (scores 0, 2, 2 of 10), 5 started and never submitted. Saved answers are real (a few hundred characters) only in the two latest practice runs (the ones with score 2); the earlier practice entries hold only a short stub (43 characters).

## What this means (hypotheses, label them so)
- Proven by the data: start, practice start, submit, server-side grading, the forced close at `ends_at`, and the window closing all ran against live data from a real phone. This is the first evidence that C3, C6 reach the server. It is NOT a full pass: the owner has not said what he saw on screen.
- Hypothesis 1: the ranked run at 04:17 used the OLD native exam screen (before session X rebuilt it as the hub exam window): its answers never reached the server, so the server graded an empty answer sheet (score 0). The later practice runs saved answers, which fits the new window working. NOT proven; needs the owner to say which app build ran at 04:17 and whether he answered questions then.
- Hypothesis 2 (if hypothesis 1 is wrong): autosave did not run during the ranked attempt. Check `CompetitionExamScreen.kt` autosave against a ranked run on the newest build.
- The earlier practice entries with the 43-character stub and no submit look like exams opened and left (or the back button), not errors. Hypothesis.
- Because the ranked attempt is used up (one per student, decision), the owner cannot redo ranked on this contest. A second test contest is needed to retest ranked autosave and the leaderboard with a real score.

## Not done / next, in order
1. Ask the owner: (a) newest "Build Production AAB & APK" result on `main` (if red, paste the line starting with `e: file:///`); (b) what the phone showed in the 04:17 ranked run (answers visible? timer? submit?); (c) whether the leaderboard and review screens opened on the ended test contest and showed rank 1 with score 0 (read the leaderboard rule: ended window means it should show).
2. Owner decides: keep the test rows (to look at leaderboard and review again) or delete them. DO NOT delete without his word. When he says delete: remove the contest and its entries, questions, keys and `competition_seen` rows, then check counts are 0 and log it.
3. A second owner-only test contest (admin RPC `admin_publish_competition_from_exam`, audience `owner-test` again, a window of about 20 minutes starting a few minutes ahead) to retest a ranked run with answers. Needs the Supabase connector and the owner present on his phone.
4. Then the C8 leftovers (safe real-send test to the owner only, slice 5 deep link, website admin UI), C5 dot look, C9, C10 as in `docs/SESSION_2026-10-15_S.md`.

## Note for the board (add in the next board edit)
C6 / C3 line: "Live data seen 2026-10-15 (read-only, session AF): the ranked entry was force-closed at `ends_at` with empty answers (score 0); practice runs saved answers and scored 2 of 10 twice. Cause of the empty ranked answers not known (hypotheses in `docs/SESSION_2026-10-15_AF.md`)."
