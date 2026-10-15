# SESSION 2026-10-15 AD (Claude chat): C8 slice 3, the website dispatch endpoint

Repo is PUBLIC: no secrets here. Owner said: read the handoff and status and continue. Standing OK from session AC ("Agree for all, continue") covers editing the website repo.

## What was done
Read `HANDOFF.md`, `docs/COMPETITION_STATUS.md`, sessions AA and AC, the C8 plan, the website's `src/lib/notifications.ts`, `send/route.ts`, `supabase-server.ts`, and (read-only, live Supabase) the columns of `scheduled_notifications`, `competitions`, `profiles`, `enrollments`, `access_grants`, and the body of `private.competition_access`.

Pushed to the WEBSITE repo `hiyabteklu/Wisdom-tower-academy` `main`, commit `772697c`: NEW `src/app/api/notifications/dispatch/route.ts` (`[~]` written, NOT compiled, NOT tested live; the push triggers a Vercel deploy, so check that build).

How it behaves (code written, not run):
- POST only. The caller must send header `x-dispatch-secret` equal to the server env var `NOTIFICATION_DISPATCH_SECRET`. If that variable is missing or shorter than 16 characters the route answers 503 to everybody (fails closed). Wrong or missing secret: 401. Comparison is constant time.
- One run takes up to 10 rows with status `pending` and `send_at` in the past, claims each (`pending` to `sending`, attempts + 1; a row another run already claimed is skipped), sends, then sets `sent` (with `sent_at`) or, on error, back to `pending` for a retry on the next run until 3 attempts, then `failed` with `last_error`.
- Audience rule (copied from the live `private.competition_access`, read from the database): no scope and no package = ONE broadcast to everybody. Scope = `profiles.active_academic_scope` (empty counts as `freshman`, `all` means everybody). Package = a row in `enrollments` or `access_grants` for that package by user id or e-mail. If the row has a `competition_id` and no scope or package of its own, the competition's `audience` and (when `requires_package`) `package_id` are used. A filtered audience gets one notification per student (target = the student id), 10 at a time. A competition id that does not exist makes the row `failed` (no accidental broadcast). An audience with zero students makes it `failed` with the reason in `last_error`.
- The notification type is `admin` (the type list is fixed; a `competition` type would be a separate website change).
- Answer body lists, per row: id, status, number of students, pushes accepted by FCM. No e-mails or names.

## Answer to the open question (audience_scope values)
The scheduler treats `audience_scope` like the competitions' `audience`: `all`, or the student's academic scope (live profiles currently hold only `freshman`). Free text that matches no student gives a `failed` row, not a broadcast.

## Known gaps (hypothesis / not tested)
- A run that dies after the claim leaves the row in `sending`; it is never re-sent automatically (avoids duplicate pushes). Look at such rows by hand.
- A student with no device token still gets the in-app row, but no push (same as before).
- `createAndPushNotification` swallows database insert errors (logs only), so a row can be marked `sent` even if the insert failed. Existing behaviour, not changed.
- Not run against live data. No real push has been sent.

## OWNER ACTIONS (never paste the secret in a chat or in this repo)
1. Check the website build on Vercel for commit `772697c`. If red, paste the error line.
2. Make one long random value (at least 32 characters). Put it in Vercel as env var `NOTIFICATION_DISPATCH_SECRET` (Production) and redeploy. Until then the route answers 503, which is safe.
3. Put the SAME value in Supabase Vault from the SQL editor (not from chat): `select vault.create_secret('<the value>', 'notification_dispatch_secret');`

## DRAFT for slice 4 (NOT applied; apply only after steps 2 and 3 are done; test with one row addressed to the owner's own scope first)
Checked live today: `cron.schedule` and `net.http_post` exist, `supabase_vault`, `pg_cron`, `pg_net` are installed.

```sql
select cron.schedule(
  'dispatch-scheduled-notifications',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://www.wisdom-tower-academy.live/api/notifications/dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-dispatch-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notification_dispatch_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);
```
Undo: `select cron.unschedule('dispatch-scheduled-notifications');`. Result of each call can be read in `net._http_response`. Hypothesis: the migration role may need rights on `vault.decrypted_secrets`; if the job shows an error there, read it from `cron.job_run_details`.

## Not done (next)
- Slice 4 (above) after the owner's steps; first live test with one scheduled row.
- Slice 5: app deep link from a push or notification row to the trophy screen (patch script for `MainActivity.kt`; read `AcademyNotificationManager` first).
- The website admin page has no UI yet to schedule, list or cancel scheduled notifications (the four RPCs exist). That is part of C2/C8 on the website.
- Test contest on live data (owner's OK exists from session AC; not started).
