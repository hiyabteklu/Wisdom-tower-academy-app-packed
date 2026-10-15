# SESSION 2026-10-15 C9 security check (Claude chat, read-only)

> Owner order: read the handoff and status and continue. I read `HANDOFF.md`, `docs/COMPETITION_STATUS.md`, sessions S, AT, AU and AY. File name is not a letter because AU to AY were already taken by the notifications v2 work running in parallel. GitHub and Supabase connectors. NO code, NO database change, NO test rows touched. The board was NOT updated (big file, whole-file replace is risky).

## What I ran (read-only)
1. Supabase security advisor on the live project, 2026-10-15 09:21 UTC.
2. One catalog query: for every `admin_*` and competition function in `public`, does its definition mention `is_admin`, and can `anon` or `authenticated` execute it.

## Results (facts from the tool output)
- All 10 `admin_*` functions (competition and scheduled-notification) contain an `is_admin` check, are NOT executable by `anon`, and are executable by `authenticated`. This is the intended design (the check is inside the function). It is a text check of the definitions, not a new functional test (functional tests: session I of 2026-10-14 and session AA).
- All 9 student competition functions (`list_competitions`, `start_competition`, `save_competition_answers`, `submit_competition`, `competition_leaderboard`, `competition_review`, `competition_server_time`, `get_my_competition_points`, `mark_competition_seen`) are NOT executable by `anon`. Signed-in only, as intended.
- The advisor's 20 "signed-in users can run a SECURITY DEFINER function" warnings are those functions plus `get_leaderboard`. For the competition ones that is by design, not a finding.

## Items that are NOT competition work (advisor findings; nothing changed)
1. `public.get_leaderboard(p_scope_id, p_limit)` is SECURITY DEFINER and callable by `anon` (not signed in). It belongs to the older website leaderboard. I did not read what it returns, so I do not know if it exposes names (hypothesis only). Owner decision needed, because the website may rely on it.
2. View `public.leaderboard_by_scope` is SECURITY DEFINER (advisor level ERROR). Same older leaderboard; not read, not changed.
3. Leaked-password protection is off in Supabase Auth. Dashboard setting for the OWNER (Authentication, password security); I did not check whether the free plan allows it.
4. INFO only: `private.admin_emails`, `public.ai_explanations`, `public.api_rate_limits` have RLS on and no policy (only the server role can use them). Probably intended; not checked.

## Also noticed
- The Supabase SQL tool was not tried for the R1 test here. Sessions AX/AY report `cancelled` calls for a big multi-statement script (F2, F3 in the AY file). My two read-only queries ran fine.

## Still open
C9 test matrix with the owner and a load test of `start_competition`; C10 integrity; the owner's first contest through the admin screen; the 2 TEST contests and their entries stay until the owner says delete. The safe real-send test is R7 in `docs/NOTIFICATIONS_V2_PLAN.md`.
