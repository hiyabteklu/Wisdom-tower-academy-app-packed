# SESSION 2026-10-16 C9 load check (Claude chat)

> Owner order: "Continue". Rule: `docs/OWNER_RULE_WRITTEN_IS_DONE.md`. Repo is PUBLIC: no secrets, no student data. Supabase connector, project "Wisdom tower academy".

## What was done
Load check of the competition database path, all inside ONE transaction that ended in a deliberate error, so everything rolled back (afterwards: 0 LOADTEST contests, 17 entries and 3 contests as before).

## Results (from the tool output)
- Design read: `start_competition` has no global lock. A ranked start is one insert with `ON CONFLICT (competition_id, user_id) ... DO NOTHING` on the unique index `competition_entries_one_ranked`, so a double tap or two devices for the same student cannot create two entries. `save_competition_answers` and `submit_competition` lock only that student's own entry (`FOR UPDATE`). The sweep of overdue entries uses `FOR UPDATE SKIP LOCKED` with a limit of 500, so many students starting at once do not block each other.
- Indexes exist for the leaderboard (competition, score desc, time, submit), overdue entries, per-user lookups and one ranked entry per student.
- Synthetic data (5000 ranked entries in one throwaway contest, foreign keys switched off for the test): insert 0.107 s, leaderboard top 10 query 0.002 s, sweep with nothing overdue 0.004 s.
- Current live size: 67 profiles, 7 enrollments, 6 grants, 17 entries, 3 contests.

## Limits of this check
It measures the database work of one session, not 5000 phones calling at the same moment through the Supabase connection pool and the free plan's limits. That part cannot be tested from a chat. The access check (`competition_access`) scans `enrollments` and `access_grants` with `lower()`; both tables are tiny today, so no index is needed yet.

## Status
- 2026-10-16 | Claude (chat) | C9 load check DONE (database side) | LEFT in C9: test matrix of `docs/COMPETITION_PLAN.md` section 8 is the owner's phone run; owner decision on the old website leaderboard.
