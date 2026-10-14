# COMPETITION_PLAN.md — Trophy, global exams and competitions (stages C0 to C9)

> Written 2026-10-14 by Claude (chat). Status: **PLAN ONLY. Nothing here is built.** Per `HANDOFF.md` rule 3, an agent implements only the stage the owner names, one at a time. This repository is PUBLIC: no secrets, no student names or emails.
> Read first: `HANDOFF.md`, `docs/UI_POLISH_TASKS.md` (G1 to G9), `docs/BUILD_PITFALLS.md`, `docs/EDITING_LARGE_FILES.md`, `docs/SUPABASE_NOTES.md`, `docs/CONTENT_SHAPES.md`.

## 1. Owner's request (2026-10-14, in the owner's words)

- Top bar: "remove the refresh button and replace it by trophy (not emoji, use native icon)... we will use it for competition."
- Concept: "new global exam (example if I pushed freshman exam, user see a new notification like dot on the trophy. So they know there's exam or competition waiting. Proper countdown day, hour, minutes, seconds, till the exam time set by admin. After that proper exam page, native."
- "Design it flawlessly... design plan first stage by stage." The owner knows the request is not complete; agents must ask the open questions in section 3 (do not guess them).

## 2. Verified facts about the current system (checked 2026-10-14)

App (`MainActivity.kt`, top bar around the `IconButton` with `Icons.Filled.Refresh`): the Refresh button runs a WebView hard refresh. Next to it is the Notifications bell with a red 8dp dot driven by `NotificationRepository.unreadCount`. Bottom nav is `AliveBottomNav` (see `scripts/patch_floating_nav.py`).

Supabase project "Wisdom tower academy" (public schema, RLS on in every table):
- `learning_resources` (hub, scope_path, content_type, meta jsonb, published). Hub `exams`, content_type `exam`: `meta = { durationMin, questions: [ { prompt, choices[], correct, solution } ] }`. **Policy `lr_public_select_published` lets ANY client read published rows, including the `correct` answers.** So a real competition must NOT be served from this table (answers would be readable before and during the contest).
- `exam_attempts` (user_id, resource_id, started_at, submitted_at, score, answers jsonb, meta jsonb; policy: owner only). `academic_results` (user_id, scope_id, title, total, correct, missed, percent). Both are client-writable by the owner of the row, so scores written by the client cannot be trusted for a contest.
- `notifications` (id text, title, body, type, target, url, created_by, created_at, metadata jsonb). Types seen: `admin`, `general`; target `all` or a user id/email. Admin rights come from `private.is_admin()` (used by the admin policies). `user_device_tokens` holds FCM tokens (platform, device_name).
- `profiles` has `active_academic_scope`, `stream`, `education_level`, `full_name`, `first_name`, `last_name`, `student_id_number`, `app_preferences jsonb`. `enrollments` / `access_grants` hold package access (`package_id`).
- Existing native exam runner (N-steps in `docs/NATIVE_CONTENT_PLAN.md`) already shows questions, timer and submit. Reuse its look and components; do not fork a second design.

## 3. OPEN QUESTIONS FOR THE OWNER (ask these before stage C1; record answers in section 11)

1. **Who can enter?** Everyone, or only one audience per contest (e.g. Freshman only, Grade 9 to 12 only, one package only)? Must a student own/unlock a package to enter, or is it free for all signed-in users?
2. **Where does the admin create it?** (a) a new admin form on the website, (b) a small admin-only screen inside the app (shown only when `private.is_admin()` is true), (c) for now a Supabase SQL helper that Claude/agent runs for you. Does "push the freshman exam" mean "pick an existing exam from `learning_resources` and set a start time"? (Recommended: yes, copy it into a contest.)
3. **Result rules:** one attempt only? Fixed duration from the moment the student starts, or one shared hard end time for everyone? Late join allowed (and how many minutes)? Rank by score then fastest time?
4. **Leaderboard privacy:** show full names, first name + initial, or a nickname? Top 10 only, or every student sees their own rank? Show it to everyone or only after the contest closes?
5. **Prizes/rewards:** any badge, certificate, points, or only rank? (affects stage C8)
6. **Refresh button:** it disappears from the top bar. Keep a replacement (pull-to-refresh on pages, or a "Refresh page" item in the drawer/Settings) or drop it entirely?
7. **Reminders:** which push reminders do you want (suggested: when published, 1 day before, 1 hour before, 10 minutes before, at start)? Is push to everyone fine, or only the audience?
8. **Time zone:** show all times in Ethiopia time (EAT, UTC+3) for everyone? (Recommended.)
9. **Anti-cheating level:** block screenshots/screen recording during the exam (Android `FLAG_SECURE`), warn when the app is backgrounded, auto-submit after N leaves? Or keep it simple?
10. **Questions after the contest:** show the correct answers and explanations after it closes (recommended), or never?

## 4. Design principles

- **Server decides time.** The countdown and the exam deadline use Supabase server time. The app fetches `server_now` once, stores `offset = server_now - device_now`, and renders every timer as `target - (device_now + offset)`. Changing the phone clock must not open or extend a contest.
- **Server decides answers and scores.** Answer keys live in a table no client can read. Grading runs inside a `security definer` Postgres function. The app never sees `correct` for a contest question until results are open.
- **Questions are not delivered early.** The questions are returned by a function only after `starts_at` (server check). Before that the app only knows title, audience, times, question count.
- **Native, offline-honest.** Countdown works offline once the contest is cached (using the stored offset). Starting or submitting needs a connection; the UI says so plainly ("You're offline") and keeps answers saved locally until it can submit.
- **Visual language:** the existing palette (`BarBg` #060B15, `Accent` cyan #22E0FF, `CardSurface`, `CardBorder`), Tinos font rules from T2, the same rounded cards as Home. Gold (a warm yellow) is allowed only for the trophy "results ready" state and rank badges. No emoji; Material or custom vector icons only (see `BUILD_PITFALLS.md`). No invented text, numbers or prizes (HANDOFF 11h): every string comes from the contest row or from the owner's answers.

## 5. Data model (proposal; apply as a Supabase migration only after C0 is approved, follow `docs/SUPABASE_NOTES.md`)

All tables in `public`, RLS ON. Admin = `private.is_admin()`.

`competitions` (readable by every signed-in user when `status <> 'draft'`; writable by admin only)
- `id uuid pk`, `title text`, `description text null`, `audience text` (e.g. `all`, `freshman`, `grade/9`; match the scope vocabulary used by `profiles.active_academic_scope` and `learning_resources.scope_path`), `package_id text null`
- `source_resource_id uuid null` (the exam it was copied from, informational)
- `announce_at timestamptz` (when it becomes visible; trophy dot starts here), `starts_at timestamptz`, `duration_min int`, `late_join_min int default 0`, `results_at timestamptz null` (when ranks/answers open)
- `status text` check in (`draft`,`scheduled`,`live`,`closed`) — `live` and `closed` are DERIVED from times in the view/RPC, not trusted from the column; the column only needs `draft` vs published.
- `question_count int`, `max_points numeric`, `created_by`, `created_at`, `updated_at`

`competition_questions` (no direct client read; delivered by RPC only)
- `id uuid pk`, `competition_id`, `position int`, `prompt text`, `choices jsonb`, optional `image_path text`

`competition_answer_keys` (admin read/write only; NO client policy)
- `question_id uuid pk`, `correct int`, `solution text null`

`competition_entries` (one row per student per contest)
- `id uuid pk`, `competition_id`, `user_id`, `started_at`, `deadline_at`, `submitted_at null`, `answers jsonb`, `score numeric null`, `correct_count int null`, `time_taken_ms int null`, `status text` (`in_progress`,`submitted`,`auto_submitted`), `unique (competition_id, user_id)`
- Client may SELECT own row and UPDATE only `answers` while `in_progress` and `now() < deadline_at` (via RPC `save_competition_answers`, preferred over a raw UPDATE policy). Client can never write `score`.

`competition_seen` (`user_id`, `competition_id`, `seen_at`, pk both) — drives the trophy dot per user across devices.

RPCs (all `security definer`, `set search_path = ''`, check `auth.uid()` is not null):
- `competition_server_time()` returns `now()`.
- `list_competitions()` returns visible contests for the caller's audience with a derived `phase` (`upcoming`,`live`,`closed`,`results_open`), `entry_status`, `has_unseen`.
- `start_competition(competition_id)` → checks audience/access, `now() >= starts_at`, `now() <= starts_at + late_join`, creates or returns the entry with `deadline_at = least(now() + duration, starts_at + duration + late_join)` (decide in Q3), returns the questions WITHOUT keys, shuffled only if the owner wants it.
- `save_competition_answers(entry_id, answers jsonb)` (autosave, rejects after deadline).
- `submit_competition(entry_id)` grades server-side, stores score/time, returns the summary (not the keys unless results are open).
- `competition_leaderboard(competition_id)` rank, display name (per Q4), score, time; only after `results_at`.
- `competition_review(competition_id)` returns the student's own answers with correct answers and solutions, only after `results_at`.
- `admin_publish_competition_from_exam(resource_id, title, audience, announce_at, starts_at, duration_min, late_join_min, results_at)` copies the questions from `learning_resources.meta.questions` into `competition_questions` + `competition_answer_keys` (admin only). This is the "I pushed the Freshman exam" action.
- Optional: `pg_cron` job (free plan allows it; confirm) that inserts reminder rows into `notifications` at T-1d, T-1h, T-10m and start, plus a call to the existing push sender. Confirm with the owner (Q7).

Indexes: `competition_entries (competition_id, score desc, time_taken_ms)`, `competitions (starts_at)`.
Do NOT put contest questions into `learning_resources`.

## 6. Stages (the owner starts ONE at a time by naming it)

**C0 — Decisions (no code).** Owner answers section 3. The agent records answers in section 11 and in `STATUS.md` section A (owner's words, dated). Output: this plan with all `TBD` filled.

**C1 — Database and security.** Write the migration (tables, RLS, RPCs above) as a file under `docs/sql/` first, show it to the owner, then apply with the Supabase connector. Verify with SQL tests: a student cannot read `competition_answer_keys`; cannot call `start_competition` before `starts_at`; cannot UPDATE `score`; cannot submit twice; cannot save after `deadline_at`; leaderboard empty before `results_at`. Seed ONE test contest (audience restricted to the owner's own account or marked draft) and delete it after testing. Log what was verified.

**C2 — Admin way to publish (Q2).** Implement the chosen path. Minimum viable: a documented SQL call of `admin_publish_competition_from_exam` plus a checklist in `docs/`. If the website admin form is chosen, the work is in the WEBSITE repo (`hiyabteklu/Wisdom-tower-academy`), a separate task: this app repo's agents must not edit `website-reference/**`.

**C3 — Data layer in the app.** `data/competition/CompetitionRepository.kt` (+ model classes): fetch list, server-time offset (re-sync on app resume and every few minutes), cache last list for offline countdown, start/save/submit calls, retry queue for a pending submit. Same Supabase client/auth/refresh used by `AcademyRepository`. Unit-testable pure function `remaining(target, now, offset)` and `phaseOf(competition, now)`.

**C4 — Trophy in the top bar.** Replace the Refresh `IconButton` (about line 2060 of `MainActivity.kt`) with a trophy button. Icon: native vector, not emoji. Use `Icons.Filled.EmojiEvents` only if the extended icon set is already on the classpath (check how `MenuBook`/`ViewList` are imported); otherwise add a small custom `ImageVector` in `ui/competition/TrophyIcon.kt`. Same size/tint/hit target (44dp, 22dp icon, `Accent`) as the bell. Dot states (decide exact look with the owner, proposal): red dot = new contest not yet seen; pulsing cyan dot = a contest is LIVE now you can join; gold dot = your results/rank are ready. No dot = nothing pending; tapping still opens the hub. Dot clears per contest when the student opens that contest card (`competition_seen`). Must be done with a patch script because `MainActivity.kt` is huge (HANDOFF rule 10); tested on a copy; log it in `docs/PENDING_PATCHES.md`. Decide what replaces Refresh (Q6) in the same patch. Show the dot only for signed-in users in the audience.

**C5 — Competitions hub and countdown screen.** Native screen opened from the trophy (same overlay/back behavior as the tool overlay from T1; phone Back returns exactly where the student was). Contents: hero card for the next/live contest (title, audience, date and time in EAT, duration, number of questions, "Starts in" with large `DD : HH : MM : SS` digits, labels Days/Hours/Minutes/Seconds, ticking every second from the server-synced clock), a primary button whose state follows the phase (disabled "Opens in …" before start; "Join now" while live; "Continue" if in progress; "View result" after), then sections Upcoming, Live, Past. Empty state: honest text, no invented content. Accessibility: digits have a content description with the full sentence ("2 days 4 hours …"); respect reduced motion (no flip animation, plain digit change).

**C6 — Exam runner (native).** Reuse the existing native exam runner UI: one question per screen, choices, flag-for-review, question palette, big server-driven timer (turns warning color in the last 5 minutes and last minute), autosave of each answer (debounced, to `save_competition_answers`, and to local storage for crash/offline recovery), resume after app kill or sign-in on another phone (same `deadline_at`), confirmation dialog before submit with answered/unanswered counts, auto-submit exactly at `deadline_at`, keep-screen-on, hardware Back asks "leave exam?" and never loses answers. Anti-cheat per Q9. A short pre-start "waiting room" in the last minutes (countdown, rules, check connection) before the questions load.

**C7 — Results and leaderboard.** After submit: summary (score, correct/missed, time) immediately; rank and leaderboard when `results_at` passes (Q3/Q4); review mode with correct answers and solutions after `results_at` (Q10). Write the result into `academic_results` only AFTER the server grading (use the server response, not client math), so Account analytics stays consistent.

**C8 — Notifications and reminders.** Contest published → a `notifications` row (type `competition`, `url` deep link into C5) + push; reminders per Q7; tapping a push opens the contest card. Reuse `AcademyNotificationManager`, `fcm/*`, `/api/notifications`. No new network hosts (HANDOFF rule 13) unless the owner allows.

**C9 — Hardening and release.** Run the full test matrix (section 8), the regression checklist in `HANDOFF.md` section 9, update `STATUS.md`, `docs/PLAY_STORE_LISTING.md` only if the owner asks.

Dependencies: C1 before everything; C3 before C4 to C7; C4 and C5 can follow C3 in either order; C7 needs C6; C8 can run after C1.

## 7. Edge cases the design must handle (write tests/notes for each)

- Phone clock wrong or timezone changed: timers use server offset; displayed times always EAT (Q8).
- App killed, phone dies, or sign-in on a second device mid-exam: resume from server `answers` and the same `deadline_at`.
- No internet at start time: show clear message, keep retrying `start_competition`; never fall back to a local/fake exam (HANDOFF §4 item 3 lesson).
- Submit fails at the deadline: keep the payload locally, retry on reconnect; the server accepts `answers` saved before `deadline_at` and grades them when `submit` or the auto-grade sweep runs.
- Late join window, tie-break (score, then least time, then earliest submit), student leaves audience (scope change) mid-contest (entry stays valid).
- Admin edits a question after publishing: lock edits once `starts_at` passes; changing times only allowed before start.
- Many students pressing "Join" in the same second at start: `start_competition` must be a cheap, indexed, idempotent call (free Supabase plan limits); stagger nothing, but test with a load script before a big contest.
- Contest in the past on first install: show under Past, no dot.

## 8. Test matrix (phone, owner) — fill the result and date per row

Dot appears after publish (not before `announce_at`); dot clears after opening the card; countdown matches the admin time to the second; changing phone clock does not change it; Join disabled before start, enabled at start; kill app mid-exam and resume; airplane mode before start, during exam, at submit; submit twice; two devices; leaderboard hidden until `results_at`; answers hidden until `results_at`; trophy visible on every tab; Back button behavior; reduced-motion; long contest title; very small phone.

## 9. Files likely touched (for the planner of each stage)

New: `docs/sql/competitions_v1.sql`, `data/competition/*`, `ui/competition/*` (hub, countdown, runner, results, `TrophyIcon.kt` if needed), a `scripts/patch_trophy_topbar.py`. Edited via patch script: `MainActivity.kt` (top bar and overlay hook). Never edit the forbidden files in `HANDOFF.md` rule 12. Navigation entry: follow how the notifications screen is opened (`showNotifications` pattern) so Back behavior stays consistent.

## 10. Rules reminders for the agent

Inspect before changing; one small commit per stage; mark code `[~]` until CI is green and the owner tested; never claim a test you did not see; plain, short, non-technical messages to the owner; log `IN PROGRESS: C<n>` in a `docs/SESSION_*.md` before starting a big stage.

## 11. Owner answers (append, dated, in the owner's words)

- (none yet)
