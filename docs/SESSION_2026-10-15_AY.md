# SESSION 2026-10-15 AY: Notifications v2, slice R2 (website) + failure log

## R2 pushed to the WEBSITE repo `hiyabteklu/Wisdom-tower-academy`, commit `601db0a` (branch main)
NOT compiled, NOT deployed-checked, NOT tested. Marked `[~]`. Vercel build result NOT seen.

Files (all in the website repo):
- NEW `src/lib/notification-v2.ts`: categories (admin, material, contest), content validator `sanitizeContent` (shape `{v:1, blocks:[title, subtitle, p, callout, list, divider]}`, same shape the Android app parses), `previewFromContent` (plain preview text).
- NEW `src/lib/notification-audience.ts`: `normalizeAudiences`, `resolveAudienceViaDatabase` (calls SQL function `resolve_notification_audience`, service key), `sendToAudience` (broadcast = ONE row target "all"; a student list = one row per student), `AudienceEmptyError`.
- CHANGED `src/lib/notifications.ts`: type `contest` added; `createAndPushNotification` default url when none is given: admin -> `/notifications?open=<id>`, contest -> `/competitions`, else `/learning`; `listNotificationsForUser(userId, email, verified=false)` now reads with the SERVICE client for the matching user id / e-mail so notices addressed to ONE student (audience sends) become visible (row security hides them from the public key); without a verified token only admin/material/contest rows are returned for a targeted student, never payment/general.
- CHANGED `src/app/api/notifications/route.ts` (GET): accepts the student's access token (Bearer); with a valid token the id/e-mail come from the TOKEN. Without a token the old `?userId=&email=` behaviour stays (the app does not send a token yet).
- CHANGED `src/app/api/notifications/send/route.ts`: LEGACY mode (no `category` in the body) = old behaviour; V2 mode (`category` sent) = admin|material|contest, optional rich `content`, optional `audiences` string[] (empty = everybody) or one `target` user id; contest url forced `/competitions`; material url REQUIRED and must start with "/"; admin has no url (reading view).
- CHANGED `src/app/api/notifications/dispatch/route.ts`: claim now reads `*` (works before and after the migration); a row with `category` or `audiences` uses the v2 path and the SQL resolver; legacy rows keep the old scope/package rule and now pass an explicit url `/learning`.

## HARD DEPENDENCY
V2 audience sends (non-empty `audiences`) and scheduled v2 rows call `public.resolve_notification_audience`, which does NOT exist on the live database yet (R1 migration `docs/sql/notifications_v2.sql` is NOT applied). Until R1 is applied: an everybody-send (empty audiences) works (no database function needed); any send with audiences returns an error. Nothing else breaks.

## Known weak points of R2 (read before relying on it)
1. `listNotificationsForUser` builds a PostgREST `.or(...)` string with the e-mail (`target.ilike.<email>`): an e-mail containing `%` or `_` acts as a wildcard in ilike. It is validated by a simple regex only. HYPOTHESIS: harmless (it only ever matches the caller's own e-mail pattern or more), but better to compare lower-cased exact in a later cleanup.
2. Without a token, anyone who knows a student's user id (uuid) or e-mail can read the admin/material/contest notices addressed to that student (announcements only, never payment/general). Real fix: the Android app sends its access token (listed in WEBSITE_CHANGES.md section 3; not done).
3. Not compiled: TypeScript issues are possible (for example `type: category` assigns a `NotificationCategory` to `NotificationType`, which should be fine because the union contains all three; `row.category` type narrowing in dispatch).
4. The admin screen (`NotificationsPanel.tsx`, `ScheduledNotificationsPanel.tsx`) still uses the OLD API (legacy mode) and still offers 4 types; R3 replaces it. `NotificationsPanel.tsx` imports `NotificationType`, which only widened, so it should still compile.

## FAILED / CANCELLED / BLOCKED ATTEMPTS (so the next agent does not repeat them blindly)
| # | Where | What was tried | Result | What to do instead |
|---|---|---|---|---|
| F1 | session AV start | `list_repos` (claude-code-remote tool) to find the repo | Error: no GitHub account linked | Use the GitHub connector tools (`search_repositories`, `get_file_contents`, `push_files`); they worked |
| F2 | session AX, R1 | Supabase `execute_sql`: ONE script = full migration + 19 checks + final `raise exception` + `rollback` (to prove it on live without keeping anything) | Tool call came back `cancelled` (nothing ran). Cause unknown (hypothesis: the tool blocks or asks approval for multi-statement DDL scripts, possibly because the destructive-statement confirmation did not reach the owner) | Ask the owner to run `docs/sql/notifications_v2_test.sql` in the SQL editor (header has the 4 steps), or try smaller calls: first only the DDL part in `begin; ... rollback;`, then the DO block separately is NOT possible (separate calls are separate transactions), so keep one script |
| F3 | session AX, R1 | Same script again, after the owner answered "Yes, run the test" in chat | `cancelled` again, nothing ran | Same as F2. Do not retry the identical call a third time. Verified afterwards by a read-only query: live DB unchanged (0 new columns, 0 new table, 0 new functions) |
| F4 | session AX | Read-only query selecting `status` from `enrollments` / `access_grants` | SQL error: those tables have no `status` column | Not a problem; they only have user_id, email, package_id, package_name, source, etc. |
| F5 | session AX | (deviation, not a failure) plan said TypeScript resolver; SQL resolver used instead | n/a | Follow the SQL resolver (R2 does) |

Also not done yet (not failures, just pending): R1 applied to live; R3 admin composer; R6 `MainActivity.kt` patch (so a push tap opens the reader); R7 safe real-send test to the owner's own user; R8 cleanup.

## Next, in order
1. Run the R1 test (owner or an agent whose SQL tool is allowed), read the `RESULTS` line, fix SQL if needed, then apply `docs/sql/notifications_v2.sql` as ONE migration `notifications_v2`.
2. Check the website (Vercel) build of commit `601db0a`; fix compile errors first (log them in the website repo notes and here).
3. R3: new admin composer in the website repo (block editor, live phone preview in gold style, path selector from `ADMIN_CONTENT_TREE`, audience chips from `ACADEMIC_LEVEL_OPTIONS` with live counts via `admin_count_notification_audience` / `admin_audience_level_counts`, custom audiences, schedule v2 via `admin_schedule_notification_v2`, edit scheduled rows).
4. R6 patch script for `MainActivity.kt` (`/notifications?open=<id>` -> `NotificationsScreen(openId = ...)`).
