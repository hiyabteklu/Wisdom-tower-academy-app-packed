# SESSION 2026-10-16 C8 auto reminders and notification cleanup (Claude chat, Supabase connector)

> Owner orders (2026-10-16): "Delete all test notice, even all past sent notifications. Competition reminders = OK. What is protected is only the AI tutor, leave anything else as it is, cuz it's adding complexities." Repo is PUBLIC.

## 1. Notifications cleared: DONE
Deleted ALL rows of `public.notifications` (8: 7 admin, 1 material, including the R7 test) and the 1 sent row of `public.scheduled_notifications`. Custom audiences table was already empty. Afterwards 0 rows in both. This removed past notices from every student's bell list too (the owner asked for "all past sent notifications").

## 2. Automatic competition reminders: DONE (database), tested rolled back
Migration `competition_auto_reminders` (SQL copy `docs/sql/competitions_v3_auto_reminders.sql`). Whenever a contest is inserted or its publish state, times, audience, title, package or countdown state change, the database replaces its waiting reminder rows in `scheduled_notifications` (created_by `auto-reminder`): "Competition starts in 1 hour" (only if the start is more than 1 hour away) and "Competition is open" (at the start). Link `/competitions`, which opens the trophy screen. The existing cron dispatcher sends them; no website change.
- Audience: `all`, a student scope (freshman), or a package id (matched through enrollments and grants). `owner-test`, comma lists and unknown audiences get NO reminders (nothing is sent rather than guessed).
- Unpublished, paused or deleted contest: waiting reminders are removed (a before-delete trigger also removes them, because the foreign key would otherwise leave a row with no contest, which the dispatcher would treat as a broadcast).
- Test (one rolled-back transaction): 3 hours ahead gave 2 rows; moving the start to 30 minutes gave 1; package audience set the package; `owner-test` gave 0; unpublished gave 0; republished with `all` gave 1; delete gave 0. Afterwards 0 leftovers, 1 contest as before.
- The wording of the two messages is the agent's (owner can change it). Times are written in Ethiopia time.
- Not tested: a real send of a reminder (needs a real contest to be published; the dispatcher path is the one already verified in session AE).

## 3. Lockdown scope: DECISION
Only the AI Tutor is blocked during a ranked exam (already built). Nothing else is added. No phone pinning. The other tools stay as they are.
