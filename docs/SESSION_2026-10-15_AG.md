# SESSION 2026-10-15 AG (Claude chat): second owner-only test contest, first real RANKED run on live data

Repo is PUBLIC: no secrets, no student names, no user ids. No code changed. Follows `docs/SESSION_2026-10-15_AF.md`.

## Done
1. Owner confirmed the newest builds on `main` are green (#421 to #432 in his screenshot).
2. Phone test of the PRACTICE run on the new exam window (owner screenshots 09:27 EAT): top bar and bottom nav stay visible, KaTeX renders, flag and cross-out work, number board works, score popup 3 of 10. Server check: that entry stored 10 answers, score 3.
3. Created a second owner-only contest on live data by cloning the first one in SQL (the admin RPC needs an admin login, the connector has none): title "TEST 2 - owner only", audience `owner-test` (no student matches), 10 questions and 10 keys copied, window 06:32 to 06:52 UTC (09:32 to 09:52 EAT). Row id is in the database, not needed here.
4. Owner ran the RANKED attempt (screenshots 09:33 to 09:34 EAT): countdown, Join, rules page with confirm, exam with timer and "do not leave this window" line, "Submit this exam?" box (answered 10 of 10, flagged 1), score popup 1 of 10, hub card shows "Live ... Submitted" and "Your answers were submitted."
5. Server check (read-only): 1 ranked entry, 10 answers stored, score 1, time 36.4 s, not disqualified. The saved answers and the score agree with the phone. This is the first ranked run that saved answers on live data.

## Conclusions (evidence = owner screenshots + the SQL rows above)
- Hypothesis from AF (the 04:17 ranked run used the old exam screen) is now supported: the new window saves answers in ranked mode. Still only one account tested.
- Ranked score popup appears right after submit while the window is live ("The leaderboard opens when the competition window ends"). Owner to confirm this is wanted (he asked for the hub score popup after submit).

## Open
- Review button text wraps ("Revie / w") on ended cards (three buttons in one row, `CompetitionsHubScreen.kt`). Not fixed.
- After 06:52 UTC: owner opens Leaderboard and Review on TEST 2; he reports what he sees.
- Test rows (both contests, all entries) are still in the database. Delete ONLY when the owner says so, then check counts are 0.
- Then: C8 leftovers (real send test to the owner only, deep link, website admin UI), C5 dot look, C9, C10 (`docs/SESSION_2026-10-15_S.md`).
