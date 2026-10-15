# SESSION 2026-10-15 AP (Claude chat): STATUS SNAPSHOT at the end of the quota

Repo is PUBLIC. Newest first. The stage board `docs/COMPETITION_STATUS.md` covers sessions up to AL; this file and AM, AN, AO are NOT yet on the board (add them in the next board edit).

## State
- Glass sweep of the competition screens: done in code (hub AH, rules AI, review AJ, leaderboard AK, points card already glass AL). All `[~]`: CI not seen, not seen on a device.
- C8 slice 5 (push opens the trophy screen): patch script `scripts/patch_c8_push_opens_trophy.py` written and tested twice on a copy of the real `MainActivity.kt` (session AN, commit `b7ea82d`). NOT applied. Owner steps: GitHub > Actions > Apply pending patches > script name `patch_c8_push_opens_trophy.py` (no `scripts/`) > new branch name > wait for green build > test > merge.
- Real-send test: NOT done, nothing sent. The scheduler cannot target one student and all 67 profiles share one scope, so a scheduled test would reach real students (session AO). Safe tests: the owner sends one notification to his own user from the website admin panel with link `/competitions`, or the agent inserts one in-app row for the owner's user only (needs his OK and his user id).
- Both TEST contests (audience `owner-test`) and all their entries are still in the database. Delete only when the owner says so, then check counts are 0.

## Next, in order
1. Owner: build on `main` green? (paste the `e: file:///` line if red). Apply and merge the AN patch. Phone test: Leaderboard and Review on the ended TEST 2; push or bell row with link `/competitions` opens the trophy screen.
2. C8 leftovers: website admin screen to schedule, list and cancel scheduled notifications (website repo).
3. C9 test matrix and regression checklist, C10 integrity (`docs/SESSION_2026-10-15_S.md` tasks 6 and 7).
