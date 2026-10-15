# NOTIFICATIONS_V2_PLAN.md — notification system v2 (written 2026-10-15, session AU)

> Repo is PUBLIC: no secrets, no student names or emails. This is the live plan for the owner's order of 2026-10-15 (below). It extends stage C8 (scheduled and targeted notifications). Progress table at the bottom: UPDATE IT IN EVERY COMMIT of this work.
> Work spans THREE places: the app repo (this one), the WEBSITE repo `hiyabteklu/Wisdom-tower-academy` (admin dashboard, API) and the live Supabase project. Each slice says where it lives.
> **FAILED / CANCELLED ATTEMPTS are logged in `docs/SESSION_2026-10-15_AY.md` (table F1 to F5). Read it before retrying anything.**

## 1. Owner order (2026-10-15, in the owner's words)

"Notification push. Category only these: 1. admin announcement 2. new material release 3. contest. Then after clicking proper path to the locations, contest to the contest screen, new material release to the material/subject location (make a path selector for admin). And admins announcement just to full screen reading mode on the notification section (not only a pop up that redirects to learning section, but if the category is admin announcement, in the notification list when clicked it should open a reading view in there, not leading to somewhere), and for all notification pushes the admin dashboard make amazing designing features title, subtitle, highlight, bold, then a golden colors for them, so it feels amazing to read, not just SMS like ugly markdown. Enhance the admin dashboard more smoothly. And the audience scope should be pick from the attached list above (use all the audience type they picked on registration) and also make it possible to select more than one audience scopes (fresh + ECE + grade 9 etc... I can add more custom audience scope)."

The attached picture is the registration "Education level" chips: Grade 9, Grade 10, Grade 11, Grade 12, Remedial, Freshman, 3rd Year (ECE), Other.

Owner also said: "As this task may be multi step, plan it and document it before we start". Later (same day): "document any unsuccessful attempt so next agent will pick it up". Earlier standing rules still apply: a green CI build is enough to start the next task; no phone test needed to continue.

Phase note: HANDOFF says the competition space is the only live work. This order comes from the owner and is notification work that extends C8 (contest category, trophy deep link), so it is accepted as C8 slices 7 and later. Nothing else outside it is started.

## 2. What exists today (VERIFIED by reading code or live read-only SQL on 2026-10-15; the live website may differ from the repo)

App (this repo):
1. `ui/notifications/NotificationsScreen.kt`: list with filters All / Material Releases / Announcements; every row tap calls `NotificationRepository.markRead` then `onOpenUrl(n.url)` (= `handleGlobalNav` in `MainActivity.kt`), so an announcement today just navigates away (default url `/learning`). No reading view exists. **(Changed by R5, see section 8.)**
2. `data/repository/NotificationRepository.kt`: loads `GET https://www.wisdom-tower-academy.live/api/notifications?userId=&email=` and keeps id, title, body, type, target, url, createdAt, read. It does NOT read `metadata`. `NativeNotificationItem` has no content field. **(Changed by R4.)**
3. `fcm/AcademyFirebaseMessagingService.kt`: shows the system notification from the push data (`url`, `title`, `body`); tap puts `extra_target_url` in the intent; `MainActivity.extractNotificationUrl` turns it into `pendingNotificationUrl` and the router runs.
4. Router `handleGlobalNav` in `MainActivity.kt` (line numbers of today's file: ~1810 to 1900): a path ending `/competitions` opens the trophy screen (C8 slice 5, PR #27); `/learning`, `/academy/...` package paths, `/account`, `/settings`, drawer pages; a hub path whose last part is one of books, life-savers, short-notes, flashcards, question-banks, exams AND for which `contentScopePath(...)` (in `ui/study/StudyWorkspaceScreen.kt`) is not null opens the native hub list; other paths open the website page in the WebView.
5. `MainActivity.kt` is about 245 KB: changes go through a patch script + the "Apply pending patches" Action (HANDOFF rule 10, `docs/EDITING_LARGE_FILES.md`). `NotificationsScreen.kt` and `NotificationRepository.kt` are small enough to resend whole.

Website (`Wisdom-tower-academy`, code read at commit `f5f85bc`):
6. `src/lib/notifications.ts`: `NotificationType = "material" | "admin" | "payment" | "general"`; `createAndPushNotification` writes one `notifications` row and sends FCM to tokens for the target. Targets are only `"all"` or one user id. `metadata` (jsonb) is saved and returned by `GET /api/notifications` (so rich content can travel in `metadata` with NO schema change). The send route turns any other type into `general`. **(Changed by R2.)**
7. `src/app/api/notifications/dispatch/route.ts`: the scheduler endpoint (secret header). Audience rule: `scope` from `profiles.active_academic_scope`, optional `package_id` via `enrollments` / `access_grants`; sends a broadcast or one notification per matching student; always type `admin`. **(Changed by R2.)**
8. `src/components/admin/NotificationsPanel.tsx` (compose form, 4 presets, history, FCM guide) + `ScheduledNotificationsPanel.tsx` (schedule, list, cancel). Compose has category select (material, admin, payment, general), free-text "Deep Link / Target Path", audience = everyone or one user id/email, plain textarea body. No formatting, no path selector, no multi-audience.
9. `src/data/admin-nav.ts` exports `ADMIN_CONTENT_TREE` (Grades 9-12 > subject > hub; Entrance Questions; Freshman > subject > hub; Special packages (ECE) > semester > course > hub) with `scopePath` and `packageId` on every node. THE PATH SELECTOR REUSES THIS TREE, so it can never offer a path that does not exist.
10. `src/lib/academic-levels.ts` exports `ACADEMIC_LEVEL_OPTIONS` (the registration chips). The audience picker imports it so the two never drift.

Live database (read-only SQL, project "Wisdom tower academy", 2026-10-15):
11. `profiles.education_level` holds the registration choice. Counts: 5 "3rd Year (ECE)", 4 "Freshman", 1 "Grade 9", **57 empty (null)**. 67 profiles in all.
12. `profiles.active_academic_scope` is `freshman` for ALL 67 profiles. **So today's audience rule (scope) cannot separate groups: a "Grade 9" notice would reach everybody.** v2 must filter on `education_level`.
13. `notifications.type` counts: admin 7, general 2, material 1. Columns: id, title, body, type, target, url, created_by, created_at, metadata (jsonb). (Session AX: `notifications` has NO type check constraint, so `contest` needs no database change there.)
14. `scheduled_notifications` columns: id, title, body, audience_scope, package_id, competition_id, url, send_at, status, created_by, created_at, sent_at, attempts, last_error. Admin functions: `admin_schedule_notification(p_title, p_body, p_send_at, p_url, p_audience_scope, p_package_id, p_competition_id)`, `admin_update_scheduled_notification(...)`, `admin_cancel_scheduled_notification(p_id)`, `admin_list_scheduled_notifications(p_limit)`.

NOT verified: how the typed text of "Other" is stored in `education_level` (no such value exists live yet); that `contentScopePath` accepts every path the selector would produce (slice R5 was to read it fully; NOT done yet, still open); FCM data size in practice (limit 4 KB, see 3.3).

## 3. Design

### 3.1 Three categories only
- Stored `type` values: `admin` (label "Admin announcement"), `material` ("New material release"), `contest` (NEW, label "Contest"). The website type list and the send route must allow `contest` (today it becomes `general`).
- The composer offers only these three. The four old presets are removed.
- Old rows keep working: `general` and `payment` rows (2 + 0 live) are shown as Announcements in the app (default, see section 6). Nothing is deleted.
- App filters: All / Material Releases / Announcements / Contests.

### 3.2 What a tap does
| Category | Destination | How |
|---|---|---|
| contest | native trophy screen | url is fixed to `/competitions` (admin has nothing to choose). App already routes it (C8 slice 5). |
| material | the material/subject location | admin picks it with the PATH SELECTOR (3.5); url = the website path of that hub; app router opens the native hub when it can. |
| admin | full-screen READING VIEW inside the notifications section | no navigation anywhere: the list row opens a reader in place (3.4); back returns to the list. A push tap opens the notifications screen with that reader open. |

### 3.3 Rich content, not markdown
- The composer saves structured content in `metadata.content` (jsonb, no schema change on `notifications`):
  `{ "v": 1, "blocks": [ {"t":"title","text":""}, {"t":"subtitle","text":""}, {"t":"p","runs":[{"text":"","b":true,"hl":true}]}, {"t":"callout","runs":[...]}, {"t":"list","items":[[runs],...]}, {"t":"divider"} ] }`
  A "run" is a piece of text with optional bold (`b`) and highlight (`hl`). No markdown is parsed anywhere, so nothing can look like raw symbols.
- `body` stays a short PLAIN preview generated from the blocks (about 160 characters). It is what the lock screen, the push and old app versions show. A row with no `content` (every row that exists today) is shown in the same gold style from `title` + `body`.
- The PUSH never carries the blocks (FCM data limit is 4 KB): it carries title, plain preview, type, id and url. The reader loads the blocks from the list API.
- Gold look (tokens to be read from the app's existing theme in R5, nothing invented): title in strong gold, subtitle in a softer gold, highlight = gold-tinted background with dark text, bold = bright white, callout = glass card with a gold left bar, divider = thin gold gradient line. The admin live preview uses the same palette so what the admin sees is what the student gets. (R5 used the amber `0xFFFCD34D` that the Announcement icon already used; the admin preview must use the same value.)

### 3.4 Reading view (app)
- New `ui/notifications/NotificationReaderScreen.kt`: full screen inside `NotificationsScreen` (state `openedId`, system back and an on-screen back arrow return to the list, the row is marked read). Renders the blocks with Compose `AnnotatedString`; category pill, date, then the content, glass/gold styling consistent with the approved design.
- Push tap for an announcement: `createAndPushNotification` sets `url = /notifications?open=<id>` for type `admin`; a small `MainActivity.kt` patch adds a `/notifications` branch that shows the notifications screen with that id open.

### 3.5 Admin path selector (website)
- Cascading picker built from `ADMIN_CONTENT_TREE`: Package group > subject/course > hub (books, life-savers, short-notes, flashcards, question-banks, exams) with a breadcrumb and a "this opens: …" line showing the final path. Output = the public website path of that hub (same path shape the app router already understands). A "Subject only" option opens the subject, no hub.
- Mapping `scopePath` (`grade/9/physics`, `freshman/<id>`, `ece/<sem>/<course>`) to the public path is read from the website's `src/app/academy` routes in slice R3 before writing it.

### 3.6 Audience (multi-select, from registration)
- Chips: **Everyone**, then the eight registration levels (imported from `ACADEMIC_LEVEL_OPTIONS`): Grade 9, Grade 10, Grade 11, Grade 12, Remedial, Freshman, 3rd Year (ECE), Other. Several can be selected; the result is the UNION, one notification per student even if two chips match.
- Source of truth: `profiles.education_level` (live fact 11/12), compared case-insensitively. `active_academic_scope` is NOT used (fact 12).
- Each chip shows how many students it reaches today (a live count), so the admin sees "3rd Year (ECE): 5" before sending.
- Custom audiences: the admin can add one (a name + the level texts and/or package ids it matches), it is saved in a new table `notification_audiences` and appears as a chip from then on; it can be deleted. This also covers an "Other" level someone typed. Stored in the audiences list as `custom:<uuid>`.
- Students with no level saved (57 of 67 today) are reached only by Everyone (default, see section 6). The picker says so, with the count.
- Specific user (id or email) stays available as before.

### 3.7 Admin dashboard, smoother
- The notifications tab is rebuilt as one guided composer: 1 Category (three large cards) > 2 Write (block editor with a toolbar: Title, Subtitle, Highlight, Bold, Callout, Bullets, Divider) with a live phone preview (list card AND reading view) > 3 Destination (contest = automatic, material = path selector, announcement = none) > 4 Audience chips with live counts > 5 When (send now / schedule, time in Ethiopia time) > Review & send.
- Smoothness: no full-form reset after sending, toasts instead of one banner, skeleton loaders, optimistic list updates, scheduled rows can be edited (the database function already exists), history filter by category with gold badges, tab content loaded on demand. HYPOTHESIS: "smoothly" means this notifications tab plus faster, calmer tab switching in `/admin`; if the owner meant something else it is corrected in the log.

## 4. Data contract changes (slice R1, Supabase migration; SQL copy in `docs/sql/notifications_v2.sql`, test in `docs/sql/notifications_v2_test.sql`)
- `scheduled_notifications`: add `category text` (admin | material | contest), `content jsonb`, `audiences text[]` (empty or null = everyone; old `audience_scope` stays for old rows).
- NEW table `notification_audiences (id uuid pk, label text unique, match_levels text[], match_package_ids text[], created_by, created_at)`; RLS on, admin only (`private.is_admin()`), no student policy.
- NEW functions: `resolve_notification_audience(text[])` (service_role only, the ONE resolver; deviation from the first idea of a TypeScript resolver), `admin_count_notification_audience`, `admin_audience_level_counts`, `admin_add/delete/list_notification_audience(s)`, `admin_schedule_notification_v2`, `admin_update_scheduled_notification_v2`, `admin_list_scheduled_notifications_v2`. The old functions stay until the website switches (cleanup slice R8), because two overloads of one name can make named RPC calls ambiguous.
- Every migration is tested inside a rolled-back transaction first, results written in the log. **(R1 test has NOT been run yet, see F2/F3 in `docs/SESSION_2026-10-15_AY.md`.)**

## 5. Slices (each small, pushed alone, logged here; `[~]` = written, not compiled; CI result is what upgrades it)
| Slice | Where | What | Needs |
|---|---|---|---|
| R0 | app repo | this plan + owner order logged | done |
| R1 | Supabase + app `docs/sql` | migration of section 4, 19 rolled-back checks | Supabase connector (owner granted write); test run by owner if the tool stays cancelled |
| R2 | website | audience resolver use, type `contest`, send route accepts category + audiences + content + auto url (`/competitions`, `/notifications?open=<id>`), dispatch uses the resolver | R1 applied for audience sends |
| R3 | website | new composer: block editor, live preview, path selector, audience chips with counts, custom audiences, schedule v2, edit scheduled rows | R1, R2 |
| R4 | app | `NativeNotificationItem` + `NotificationRepository` read `metadata.content`; keep old rows working | none |
| R5 | app | `NotificationReaderScreen.kt`, gold list rows, Contests filter, tap rules (announcement opens the reader, others `onOpenUrl`); read `contentScopePath` fully and test the path list (the last part is still OPEN) | R4 |
| R6 | app, patch script | `MainActivity.kt`: `/notifications?open=<id>` branch (reader opens from a push, passes `openId` to `NotificationsScreen`); owner runs the Action | R5 |
| R7 | all | safe real-send test to the OWNER'S OWN user only, then docs: board, HANDOFF pointer, session log | R2 to R6, owner's user id |
| R8 | Supabase + website | cleanup: drop old scheduling functions, remove the old presets, make the app send its token | after R7 |

## 6. Defaults chosen (owner can change any of them; none blocks the work)
1. Old `general` / `payment` rows show as Announcements.
2. Students with no saved level get only Everyone-notices.
3. A custom audience = a name + level texts and/or package ids (union with the chips).
4. Contest notices open the trophy screen (not one specific contest).
5. "Smoothly" = section 3.7.

## 7. Rules that apply (from HANDOFF, restated)
Inspect code before changing it; focused changes; keep the approved design; no invented text; no secrets or student data in this public repo; forbidden files stay untouched (`.env.example`, `.github/`, gradle files, manifest unless the task says so, legacy web shell files, branding); big file `MainActivity.kt` only by patch script; label evidence honestly.

## 8. Progress (append a row per commit; newest last)
| Date | Slice | Status | Evidence |
|---|---|---|---|
| 2026-10-15 | R0 plan | DONE | this file; facts in section 2 read from the repos and live read-only SQL |
| 2026-10-15 | R4 app reads content | `[~]` written, not compiled | commit `a439912` (app repo); `NotificationModel.kt`, `NotificationRepository.kt`; session AV. CI not seen |
| 2026-10-15 | R5 reader + gold rows + Contests filter | `[~]` written, not compiled | commit `203fa7c` (app repo); `NotificationReaderScreen.kt`, `NotificationsScreen.kt` (new optional `openId` param, wired in R6); session AW. CI not seen. `contentScopePath` check still open |
| 2026-10-15 | R1 database | WRITTEN, NOT APPLIED, NOT TESTED | commit `f20b902`; `docs/sql/notifications_v2.sql` + `_test.sql`; live DB verified unchanged; test run CANCELLED twice (F2, F3) |
| 2026-10-15 | R2 website routes | `[~]` written, not compiled, not deployed-checked | website repo commit `601db0a`; session AY; audience sends need R1 applied |
| next | R1 run test + apply, check Vercel build of `601db0a`, then R3, R6, R7, R8 | pending | see session AY "Next, in order" |
