# OWNER_RULE_WRITTEN_IS_DONE.md — READ THIS BEFORE THE STATUS BOARD (owner order 2026-10-16)

> Repo is PUBLIC: no secrets, no student data. This rule OVERRIDES every `[~]`, "CI NOT seen", "Vercel NOT seen", "not seen on a device" and "never run" label in `HANDOFF.md`, `docs/COMPETITION_STATUS.md`, `docs/ADMIN_MOBILE_PLAN.md`, `docs/ADMIN_UI_V2_PLAN.md`, `docs/NOTIFICATIONS_V2_PLAN.md` and all `docs/SESSION_*.md` files written before this date.

## Owner's words (2026-10-16)
"This is all log or documents not being updated, but the task is almost all done. If code is written, mark it as done, cuz I'm seeing all GitHub and Vercel builds all green. If something is red I'll show you in a screenshot, so every written code is green, and I confirmed it worked. If there are problems I will write a correction request myself. Write this rule and tell me only what's genuinely not done."

## The rule
1. Code that is written and pushed to `main` counts as DONE. Builds (GitHub CI, Vercel) are green unless the owner shows a red screenshot. Do not write `[~]`, "CI NOT seen" or "not seen on a device" for such code, and do not ask the owner to confirm builds or phone-test it first.
2. The owner has used the app and confirmed it works. Problems arrive as a correction request from the owner; until then nothing written is "unverified".
3. When reporting status, list ONLY what is genuinely not done: work not yet written, owner-only actions, and decisions waiting for the owner. Do not list "needs a phone test" or "CI not seen" items.
4. Old `[~]` labels in earlier logs are stale. Do not rewrite those logs; treat them as DONE. New logs say DONE for written and pushed code.
5. Still never invent text, numbers or progress values, never write secrets, and still label real guesses about a cause "hypothesis" when debugging a reported problem.
6. Live data changes (deleting test rows, real sends, revoking database access) still need the owner's explicit OK first.

## Genuinely not done (as of 2026-10-16, from the session logs)
- C9: the test matrix and a load test of `start_competition` (not written or run).
- C9: owner decision on the old website leaderboard (`leaderboard_by_scope` and `get_leaderboard` readable by anyone, showing full names). Suggested fix is in `docs/SESSION_2026-10-15_C9_security_check.md`.
- C10 leftovers: lockdown reading beyond the review screen, disqualification flow and admin review of flags (only the hooks and the admin flags list exist).
- Notifications v2: push-tap test to the owner's own user (R7), R8 cleanup, then delete the R7 test row `notif_r7test_20261015` when the owner says so.
- Optional automatic competition reminders (C8 TODO).
- Owner-only: turn on leaked-password protection in Supabase Auth; say when the TEST and TEST 2 contests and their entries may be deleted.
- Admin redesign: F11 (pause the main WebView while admin is open) and the F12 A/B only if the owner reports the scroll freeze again.
