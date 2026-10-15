# SESSION 2026-10-15 AU (Claude chat): notification system v2, plan only

Repo is PUBLIC: no secrets, no student names or emails.

## Owner order (in the owner's words, 2026-10-15)
Full text is in `docs/NOTIFICATIONS_V2_PLAN.md` section 1 and in `docs/COMPETITION_DECISIONS.md` section 4. Short version: only three push categories (admin announcement, new material release, contest); contest opens the contest screen; material opens the material/subject location with a path selector in the admin; an announcement opens a full-screen reading view inside the notification list; admin composer with title, subtitle, highlight, bold in gold; smoother admin dashboard; audience picked from the registration education levels, several at once, plus custom audiences. "Plan it and document it before we start."

## What I did
- Read `HANDOFF.md`, `CLAUDE.md`, `AGENTS.md`, `docs/AGENT_QUOTA_PROTOCOL.md`, `docs/C8_NOTIFICATIONS_PLAN.md`, sessions AR and AT, the status board (all read), `NotificationsScreen.kt`, `NotificationRepository.kt`, `AcademyFirebaseMessagingService.kt`, the link router and intent code in `MainActivity.kt` (searched, not read line by line), and in the WEBSITE repo `academic-levels.ts`, `notifications.ts`, `api/notifications/route.ts`, `api/notifications/dispatch/route.ts`, `NotificationsPanel.tsx`, `admin-nav.ts`. Not read yet: the website send route file, `ScheduledNotificationsPanel.tsx`, `contentScopePath` in full.
- Read-only SQL on the live project (no writes): profile levels, scopes, notification types, table columns, admin function names.
- Wrote `docs/NOTIFICATIONS_V2_PLAN.md` (verified facts, design, data contract, slices R0 to R8, defaults) and logged the owner's order in `docs/COMPETITION_DECISIONS.md` section 4. `CLAUDE.md` and `AGENTS.md` got one pointer line.

## Findings that change the work
1. **All 67 profiles have the scope `freshman`**, so the existing audience rule cannot tell groups apart (a Grade 9 notice would reach everybody). The registration choice lives in `profiles.education_level`; 57 of 67 are empty there (5 ECE, 4 Freshman, 1 Grade 9). v2 filters on `education_level`; students with no level only get Everyone-notices (default, owner can change).
2. Rich content can travel in the existing `notifications.metadata` (jsonb), so the student-facing table needs no change.
3. The admin already has a complete course tree (`ADMIN_CONTENT_TREE`) that the path selector will reuse.
4. The app's list screen has no reading view and sends every tap to `onOpenUrl`; `NotificationRepository` ignores `metadata`.

## Not done
No code and no database change in this commit. The status board `docs/COMPETITION_STATUS.md` (about 50 KB) was NOT rewritten, on purpose: the chat tools replace whole files and a transcription slip would damage the board. The progress table in `docs/NOTIFICATIONS_V2_PLAN.md` section 8 is the live record for this work until the board gets one line (later slice).

## Next, in order
R1 database migration (Supabase), R2 website library and routes, R3 website composer, R4 and R5 app, R6 patch script, R7 safe real-send test to the owner's own user, R8 cleanup. See the plan section 5.
