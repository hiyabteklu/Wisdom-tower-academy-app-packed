# SESSION 2026-10-15 AA (Claude chat): C8 slice 2, database part, applied and tested live

Repo is PUBLIC: no secrets here. Owner said "Yes" to the C8 database step (after session Z).

## What was done (Supabase project `amieczmpqrvavzjikbdi`, via the connector)
1. Migration `c8_extensions_pg_cron_pg_net`: enabled `pg_cron` and `pg_net` (both were available, not installed).
2. DISCOVERY: `public.scheduled_notifications` ALREADY EXISTED (empty, 0 rows), created by `competitions_v1_a`, with RLS on and the policy `sched_admin_all` (`private.is_admin()`), column `audience_scope` (null = everybody), and no `attempts` / `last_error`. My first migration (a CREATE TABLE) failed with `already exists` and changed nothing; I then wrote an additive one. CORRECTION to the C8 plan (`docs/C8_NOTIFICATIONS_PLAN.md` section 2): the table is not new, and the audience column is `audience_scope`, not `audience`.
3. Migration `c8_scheduled_notifications_columns_and_admin_rpcs`: added `attempts` and `last_error`; status check now allows `pending, sending, sent, failed, cancelled`; index on `(status, send_at)`; four admin RPCs (`admin_schedule_notification`, `admin_update_scheduled_notification` (only while pending), `admin_cancel_scheduled_notification` (only while pending), `admin_list_scheduled_notifications`). Same pattern as the competition RPCs: security definer, empty search_path, admin check inside, anon and public revoked, authenticated granted. SQL copy: `docs/sql/competitions_v2_notifications.sql`.

## Evidence (run live, 13 checks, all PASS)
One transaction that ends in a deliberate error so everything rolled back (a temporary admin e-mail on an `.invalid` domain was inserted inside it). Checked: non-admin blocked on schedule and list (`admin_only`); anon has no execute permission; a past send time is rejected; a blank title is rejected; schedule trims text and records the caller's e-mail; list shows the row (status pending, attempts 0); update works and clears the audience when not given; cancel works; cancelling twice and editing a cancelled row are rejected (`not_pending_or_not_found`); status `sending` is accepted. Afterwards verified: 0 leftover test admin rows, 0 rows in `scheduled_notifications`, 0 cron jobs. Not tested: a non-admin reading the table directly under RLS (the policy text is `private.is_admin()`; the test only showed the select did not error), and any real push.

## NOT done (next)
- Slice 3 (WEBSITE repo `hiyabteklu/Wisdom-tower-academy`): dispatch endpoint that accepts only a shared secret, resolves the audience (`audience_scope`, `package_id`) and sends. Not started. Needs the owner's OK to edit the website repo.
- Slice 4: `pg_pool` is not needed; the `pg_cron` job that calls the endpoint with `pg_net`. The secret goes into Vault and Vercel by the OWNER, never in chat or repo.
- Slice 5: app deep link to the trophy screen (patch script).
- Open question for the owner: what values will `audience_scope` take (it is free text today; competitions use `audience`)?
