# SESSION 2026-10-15 AE (Claude chat): C8 slice 4 applied and tested live (the once-a-minute dispatcher)

Repo is PUBLIC: no secrets here. The owner asked for the secret value, then said "Run the supabase yourself", then showed a Vercel screenshot.

## What was done
1. Owner put `NOTIFICATION_DISPATCH_SECRET` in Vercel and redeployed. Evidence: owner's screenshot shows website commit `772697c` Ready (2m) and a Production redeploy of it Ready, 2026-10-15.
2. In the live Supabase project the SAME value was stored in Vault under the name `notification_dispatch_secret` (`vault.create_secret`). The value is NOT written in this repo. (It was generated in a chat and shown to the owner there; if the owner wants it rotated: new value in Vercel + `vault.update_secret` + redeploy.)
3. `pg_cron` job `dispatch-scheduled-notifications`, every minute (`* * * * *`), calls `net.http_post` to `https://www.wisdom-tower-academy.live/api/notifications/dispatch` with header `x-dispatch-secret` read from `vault.decrypted_secrets`. SQL copy: `docs/sql/competitions_v2b_dispatch_cron.sql`.

## Evidence (run live, 2026-10-15)
One test row was inserted directly (audience scope `zz_selftest_nobody`, which matches no student, send time one minute in the past), so NOBODY could receive anything. After one cron minute: row status `failed`, attempts 1, last_error `No students match this audience.`; `net._http_response` showed HTTP 200 with `{ok:true, processed:1, results:[{... status:"failed", error:"No students match this audience."}]}`; `cron.job_run_details` showed `succeeded`. This proves: cron fires, Vault secret is readable by the job, the website accepts the secret, claim and audience rule run, status and last_error are written. The test row was then DELETED (0 test rows left).

## NOT tested
- A real send: no in-app notification and no push has been sent by this pipeline yet (per-student and broadcast paths, FCM). To test safely, schedule one row whose audience is only the owner's own account (needs an owner-only scope, which does not exist today; options: a competition-less row with `package_id` held only by the owner, or temporarily send to `freshman` and accept that all students get it). Owner decides.
- A wrong or missing secret returning 401 (code read only).
- The job runs forever every minute; each run with no due rows is cheap. Undo: `select cron.unschedule('dispatch-scheduled-notifications');`.

## Not done (next)
- A safe real-send test (see above).
- Slice 5: app deep link from a push or notification row to the trophy screen (patch script for `MainActivity.kt`; read `AcademyNotificationManager` first).
- Website admin UI to schedule, list and cancel scheduled notifications (the four RPCs exist, session AA).
- Test contest on live data (owner OK from session AC; not started).
