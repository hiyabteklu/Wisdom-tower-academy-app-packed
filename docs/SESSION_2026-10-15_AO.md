# SESSION 2026-10-15 AO (Claude chat): real-send test, read-only check, NOTHING sent

Repo is PUBLIC: no secrets, no student names, no user ids. Owner: "Continue" after session AN. Read-only SQL on the live project; no rows written, no push sent.

## Found (live data, read-only)
- `scheduled_notifications` has NO per-student column. Its audience is only `audience_scope`, `package_id`, `competition_id` (columns read from `information_schema`). `admin_schedule_notification(p_title, p_body, p_send_at, p_url, p_audience_scope, p_package_id, p_competition_id)`.
- All 67 profiles have `active_academic_scope` = `freshman`. So any scope-based scheduled notification reaches every student, and "owner only" cannot be done through the scheduler unless a package matches only the owner (not checked, not assumed).
- Conclusion: DO NOT schedule a test row with scope `all` or `freshman`: it would push to real students.

## Safe ways to test the deep link (owner-only, no scheduler)
1. Push: the website admin panel (Notifications) sends to ONE target (the owner's own user id) with the link `/competitions`; needs the admin login, which the agent does not have. The owner can do this himself after the patch from session AN is merged.
2. Bell list row only (no push): the agent can insert ONE row into `notifications` with `target` = the owner's user id and `url` = `/competitions`, with the owner's OK and his user id. Not done.

## Next
- Owner applies and merges `patch_c8_push_opens_trophy.py` (session AN), then does test 1 or says "go" for test 2.
- Still open for C8: website admin screen to schedule, list and cancel scheduled notifications (website repo).
