# SESSION 2026-10-15 AX: Notifications v2, slice R1 (database) - WRITTEN, NOT APPLIED

## What happened
- Read `docs/SUPABASE_NOTES.md`, then read the live project READ-ONLY (function definitions, columns, policies, counts). Facts used: `scheduled_notifications` has no category/content/audiences yet; `notifications` has no type constraint (so `contest` needs no change); `enrollments` and `access_grants` have `user_id` + `package_id`; `private.is_admin()` reads the e-mail from the JWT; live education levels: 5 ECE, 4 Freshman, 1 Grade 9, 57 empty (67 profiles).
- Wrote the whole R1 migration (`docs/sql/notifications_v2.sql`) and a 19-check rolled-back test (`docs/sql/notifications_v2_test.sql`).
- Tried to run the test on the live project TWICE (one-transaction script that raises an exception at the end so everything rolls back). Both calls came back `cancelled` (the second one after the owner said yes in chat), i.e. the tool did not run them. A read-only check afterwards confirmed the live database is UNCHANGED (0 new columns, 0 new table, 0 new functions).

## Evidence level
- Migration SQL: **written, NEVER executed anywhere, so syntax and logic are UNTESTED.** Do not call it done.
- Nothing on the live database was changed.

## What the migration adds (plan section 4, with two deliberate deviations)
- `scheduled_notifications`: `category` (admin/material/contest), `content` jsonb, `audiences` text[].
- NEW table `notification_audiences` (custom audiences), RLS admin only.
- `private.notification_v2_clean` (validation; contest url forced to `/competitions`, announcement url empty, material url required, content must be `{v:1, blocks:[...]}`, max 20 audience entries, 20 KB content).
- `public.resolve_notification_audience(text[])`: ONE resolver, service_role only. Entries: `all`/empty = everybody; a registration level (case-insensitive, vs `profiles.education_level`); `custom:<uuid>`. Union, one id per student.
- Admin functions: `admin_count_notification_audience`, `admin_audience_level_counts`, `admin_add_notification_audience`, `admin_delete_notification_audience` (blocked while a pending schedule uses it), `admin_list_notification_audiences`, `admin_schedule_notification_v2`, `admin_update_scheduled_notification_v2`, `admin_list_scheduled_notifications_v2`. Old functions untouched.
- Deviation 1: the plan said a shared TypeScript resolver on the website; the SQL resolver is the single source of truth instead (website dispatch calls it with the service key). Slice R2 must follow this.
- Deviation 2: added `admin_list_scheduled_notifications_v2` (the old list function cannot return the new columns).
- WARNING: do not use the `_v2` schedule functions from the website until R2 is deployed. The OLD dispatch route ignores the new columns and would send a targeted notice to everybody.

## Next (owner or next agent)
1. Run `docs/sql/notifications_v2_test.sql` (instructions in its header) in the Supabase SQL editor, or allow an agent to run it. Fix any error it shows, then apply `docs/sql/notifications_v2.sql` as ONE migration named `notifications_v2`.
2. R2 (website): dispatch/send routes read category, content, audiences; call `resolve_notification_audience`; type `contest`; url rules.
3. Still not logged in the plan progress table (section 8) or `docs/COMPETITION_STATUS.md`: R4 `[~]`, R5 `[~]`, R1 `written, not applied`.
