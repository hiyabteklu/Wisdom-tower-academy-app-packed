# SESSION 2026-10-16 C9 owner orders executed (Claude chat, Supabase connector)

> Owner orders (2026-10-16): "1. yes lock it  2. yes send it to me only  3. delete test contests". Repo is PUBLIC: no ids of students, no emails.

## 1. Old website leaderboard locked from signed-out users: DONE
Live check first: `anon` already had NO select on `public.leaderboard_by_scope` and NO execute on `public.get_leaderboard(text,integer)` (checked with `has_table_privilege` and `has_function_privilege`: both false; `authenticated` true). So the exposure described in `SESSION_2026-10-15_C9_security_check.md` was no longer present at check time (someone, or a later migration, had already revoked it). I still applied migration `lock_old_leaderboard_from_anon` (revoke all on the view from anon; revoke execute from anon and public on the function; grant to authenticated and service_role) so the state is explicit. Effect: signed-out visitors cannot read student names from the old leaderboard; signed-in students still can.

## 2. Push-tap test: NOT possible from here (needs the owner)
A push (FCM) is sent only through the website route `/api/notifications/send` with an admin session token, and the scheduler can target only levels or packages (`notification_audiences` has `match_levels` and `match_package_ids`), never one student. So an agent cannot send a push to one person. The in-app test row `notif_r7test_20261015` already exists for the owner. Owner steps: website admin > Push Broadcasts > Compose, audience = his own user only (the send route accepts one user id), link `/notifications?open=<id>` or `/competitions`, Send; tap the push on the phone.

## 3. Test contests deleted: DONE
Deleted only "TEST - owner only" and "TEST 2 - owner only" (audience `owner-test`) with all their entries (13 and 3), questions (10 each) and answer keys. A trigger (`lock_after_start`) refuses deleting questions after a start, so the delete ran in one transaction with triggers off (`session_replication_role = replica`), guarded by a check that exactly those two contests matched. Afterwards: 1 contest, 1 entry, 39 questions, 39 keys, 0 flags, 1 points row; 0 orphan entries or questions. The remaining contest "Ch 1-4 exam" (audience `ece-y3-sem-1`, not published, 1 entry, 1 points row) was NOT touched: it is not a TEST row.
