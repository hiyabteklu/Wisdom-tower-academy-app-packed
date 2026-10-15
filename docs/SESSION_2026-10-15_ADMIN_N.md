# SESSION 2026-10-15 ADMIN_N: live check of the A16 open-policy finding (read-only)

> Repo is PUBLIC: no secrets, no student data. Owner: "read the handoff and status and continue". Read: `HANDOFF.md`, `STATUS.md`, `docs/ADMIN_MOBILE_PLAN.md`, `docs/COMPETITION_STATUS.md`, `docs/NOTIFICATIONS_V2_PLAN.md`, sessions ADMIN_C, D, E, M. The owner named no task, so I took the open item that ADMIN_M left under "LEFT" and that needs no phone: check the live database against the stale master SQL in the Database Hub. NO code, NO data and NO policy was changed.

## Question (from ADMIN_M)
The master SQL in `DatabaseHubPanel.tsx` has policies with `using (true)` for every signed-in user ("Authenticated read all orders", "Authenticated update orders", "Authenticated manage grants", "Authenticated update content locks", "Authenticated read profiles", "Anyone manage rate limits"). Are they live?

## Answer: REJECTED for the live project (read-only SQL on "Wisdom tower academy", 2026-10-15 evening)
- `pg_policies` in schema `public`, filtered to rows whose condition is `true` or empty: only the expected, intended ones remain:
  - SELECT for anon + authenticated: `content_locks` (`cl_public_select`), `question_explanations` (`qe_public_select`).
  - INSERT for anon + authenticated with `with_check = true`: `inquiries` (`inq_anyone_insert`), `talent_applications` (`ta_anyone_insert`). Public forms, as designed.
  - Other INSERT policies are scoped to the caller (`user_id = auth.uid()`, owner of the business, orders limited to `pending_payment` / `pending_verification` with `verified_at` and `verified_by` null).
- Count of non-SELECT policies with `qual = true` on `orders`, `access_grants`, `content_locks`, `profiles`, `api_rate_limits`: **0**.
- None of the six policy names quoted above exists live. The live project was hardened (admin checks go through `private.is_admin()`), so the Database Hub's `MASTER_SQL_SCRIPT` is a STALE copy. Verdict stays: **never run that script on live** (it would add the open policies). Still not done: replace or retire that script (a website change, not a layout slice).

## Security advisor (Supabase linter, same session) - what is new for the board
1. ERROR `security_definer_view`: `public.leaderboard_by_scope`. Definition read: it groups `academic_results` by scope and user and joins `profiles.full_name` (shows "Student" when empty). Grants: SELECT for `authenticated` only (anon has no SELECT). So any signed-in user can list user ids, display names and scores per scope. HYPOTHESIS: this is the old public leaderboard the app uses on purpose (`get_leaderboard`), so display names visible to signed-in users may be intended; it is NOT an anonymous leak. Owner decision needed (see below). Not changed.
2. WARN `auth_leaked_password_protection`: disabled. This is a Supabase dashboard setting (Auth > password security); only the owner can switch it. Not changed.
3. WARN x30 `authenticated_security_definer_function_executable`: all are the competition, notification-v2 and admin RPCs plus `am_i_admin`, `get_leaderboard`, `competition_*`. Expected by design: the admin ones check `private.is_admin()` inside (rolled-back tests in sessions I, AA and C10-E; I did not re-run them here). Not changed.
4. INFO `rls_enabled_no_policy`: `private.admin_emails`, `public.ai_explanations`, `public.api_rate_limits`. RLS on with no policy = nobody but the service role can touch them. Safe, as intended.
5. Read-only only: I did not test a non-admin session calling an admin RPC in this session.

## Owner questions (new, none blocks work)
- Q1: Is it OK that any signed-in student can see other students' display names and best scores through `leaderboard_by_scope` / `get_leaderboard`? If not, say so and a later session switches the view to `security_invoker` or limits it to the top rows.
- Q2: Please switch on "Prevent use of leaked passwords" in the Supabase dashboard (Authentication > Providers/Password security). Whether the free plan offers it is not verified.

## Status of the live tasks after this session (read from the logs, not re-verified)
- Admin console redesign: A0 to A3 and A5 to A16 pushed; `patch_admin_host.py` merged as PR #31 (CI not seen). LEFT: A4 (only if scrolling still freezes), `touch-action: pan-y` (ADMIN_E said add after A16), `EntryFlagsInfo.tsx` not audited, A17 regression pass on the phone, retire the stale master SQL.
- Notifications v2: R1 to R6 done in code or live (R6 patch merged as PR #28); R7 (real-send test to the owner's own user) needs his user id and OK; then R8 cleanup.
- Competition: C9 and C10 items remain per `docs/SESSION_2026-10-15_S.md`.

## Next (in order)
1. Owner: report the CI result of the newest `main` build (if red, paste the line starting with `e: file:///`); phone test A17 when convenient.
2. Next agent, no phone needed: add `touch-action: pan-y` to `src/app/admin/layout.tsx` (website repo) now that all panels are converted, then retire the stale `MASTER_SQL_SCRIPT` in the Database Hub (replace by a read-only status view).
3. R7 once the owner gives his user id and OK.

## Status
- 2026-10-15 | Claude (chat) | ADMIN_N: A16 open-policy finding REJECTED for live; advisor findings logged | LEFT: as above | NOTES: read-only; no repository code changed; `[~]` nothing compiled this session.
