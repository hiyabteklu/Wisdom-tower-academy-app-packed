# C8 PLAN: scheduled and targeted notifications (written 2026-10-15, session R)

> Status: PLAN ONLY, nothing built. Written by a chat that had GitHub but NOT the Supabase connector, so no SQL was run or tested. Repo is PUBLIC: no secrets here.
> Owner words (Q7, 2026-10-14): "advanced admin dashboard where I can show and hide exams, start and stop countdown, filter users by package to push notification. And trigger notification at selected time". Decision file: `docs/COMPETITION_DECISIONS.md` Q7.

## 1. Verified facts (read from `website-reference/`, the read-only snapshot of the website, on 2026-10-15; the live website may differ)

1. **`POST /api/notifications/send` has NO login check.** `src/app/api/notifications/send/route.ts` reads title, body, type, target, url from the request and calls `createAndPushNotification`. Anyone who knows the address can send a notification and a push to every device. This is a website bug (website repo, not this repo). Strong recommendation: lock it (admin or secret only) BEFORE C8 adds a scheduler that calls it.
2. **Targets are only `all` or one user id.** `getDeviceTokensForTarget` in `src/lib/notifications.ts` filters `user_device_tokens` by `user_id` equal to the target. There is NO filter by package, level or scope. An e-mail target shows in the in-app list but gets NO push, because tokens are matched by user id only.
3. **Types are limited** to `material`, `admin`, `payment`, `general`; any other type is turned into `general` by the send route. A `competition` type would need a website change, or competition notices use `admin` for now.
4. `notifications` rows have `id` (text), `title`, `body`, `type`, `target`, `url`, `created_by`, `created_at`, `metadata` (jsonb). Students can read only rows with target `all` or their own id (RLS since 2026-10-11, `docs/SUPABASE_NOTES.md`). `user_device_tokens` is admin/service only.
5. The push itself (FCM) runs on the website server with its service credentials. The database cannot send pushes alone.
6. Vercel's free plan only allows daily cron jobs (owner note in Q7), so the scheduler must live in Supabase (`pg_cron`), not Vercel.

## 2. Design (proposal)

### Database (needs the Supabase connector; one migration, then a copy in `docs/sql/`)
- Table `scheduled_notifications`: `id uuid`, `title`, `body`, `url` (for example the competitions screen), `send_at timestamptz`, `status` (`pending`, `sending`, `sent`, `failed`, `cancelled`), `audience` (all, or by scope, and/or `package_id`), `competition_id null`, `created_by`, `created_at`, `sent_at null`, `last_error null`, `attempts int`. RLS ON, admin only (`private.is_admin()`), no student policy.
- RPCs for the dashboard (admin only): schedule, edit while `pending`, cancel, list.
- Dispatcher function run by `pg_cron` every minute: picks due `pending` rows with `for update skip locked`, marks them `sending`, calls the website with `pg_net`, then sets `sent` or `failed`. Retries are limited by `attempts`.
- The shared secret for that call lives in Supabase Vault and in a Vercel env var. NEVER in this repo.
- To confirm first: are `pg_cron` and `pg_net` enabled on the free plan project (check `pg_available_extensions`).

### Website (separate repo `hiyabteklu/Wisdom-tower-academy`, not editable from here)
- Lock `/api/notifications/send` (see 1.1).
- New endpoint, for example `/api/notifications/dispatch`, that accepts ONLY a request carrying the shared secret, reads the audience, finds the matching user ids (profiles scope, package through `enrollments` / `access_grants`), and sends: one broadcast row for `all`, or per-user rows and pushes for a filtered audience. This is also where "filter users by package" becomes real (fact 1.2).
- Allow a `competition` notification type (fact 1.3).

### App (this repo)
- Tapping a push or a notification row with a competitions `url` should open the trophy screen (`showCompetitions`). Needs a read of `AcademyNotificationManager` and the notification row click code, then a `MainActivity.kt` patch script. Not read yet.

## 3. Slices (each one small, pushed alone)
1. (Owner or website agent) Lock the send route. No dependency on this repo.
2. (Needs Supabase connector) Check `pg_cron` / `pg_net`; write and apply the migration for `scheduled_notifications` + admin RPCs; SQL tests rolled back; copy to `docs/sql/competitions_v2_notifications.sql`.
3. (Website repo) dispatch endpoint with secret check and audience resolution.
4. (Needs connector + owner adds the secret in Vault and Vercel) the `pg_cron` dispatcher, tested with a row addressed to the owner's own account only.
5. (This repo) deep link from the push to the competitions screen (patch script).
6. Optional: automatic reminders when a contest is published (T-1d, T-1h, T-10m, start) as rows in `scheduled_notifications`. Only if the owner wants them; Q7 asked for admin-chosen times.

## 4. What the owner needs to decide or do
- Agree that the send route gets locked first (slice 1). Recommended: yes, today.
- Start the next chat with the Supabase connector turned on for slice 2, and the website repo for slices 1 and 3.
- Later: add the shared secret to Vercel and Supabase Vault yourself (never paste it in a chat or in this repo).
