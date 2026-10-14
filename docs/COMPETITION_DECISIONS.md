# COMPETITION_DECISIONS.md — owner answers (2026-10-14) and what they change

> **This file OVERRIDES `docs/COMPETITION_PLAN.md` wherever they differ.** Read the plan first for the data model and stages, then this file. Owner answers are quoted in the owner's words; "Design effect" is the agent's consequence of each answer (proposal until the owner approves it in C0).

## 1. Owner answers

**Q1 Who can enter.** "decided by their profile/setting/registered package. Does they need to own that = can't I decide when in release the exam?"
- Design effect: each contest has an audience filter (profile scope / settings / package) AND an admin switch `requires_package` chosen at release time. Default OFF (anyone matching the audience may enter). The admin decides per contest.

**Q2 Where to create.** "in the Website admin dashboard."
- Design effect: admin UI lives in the WEBSITE repo (`hiyabteklu/Wisdom-tower-academy`), a separate task. The app repo defines the database contract (tables and RPCs) that the dashboard calls. App agents must not edit `website-reference/**`. Until the dashboard exists, publishing can be done with the SQL RPC `admin_publish_competition_from_exam`.

**Q3 Attempts and window.** "it's there always, but when the countdown ends the exam starts globally, and the given time ends globally. But the exam is still accessible in practice mode. But that doesn't count into that exams leader board. The leader board of that exam record results that are submitted within the active given window. Outside that the exam is practice mode."
- Design effect (changes the plan):
  - One GLOBAL window `starts_at` to `ends_at = starts_at + duration`. Everyone's deadline is `ends_at` (a student who joins late only gets the remaining time; the plan's `late_join_min` is dropped, pending confirmation in section 3).
  - `competition_entries.mode` is `ranked` or `practice`. Exactly one ranked entry per student per contest (unique on competition + user where mode = ranked). Practice entries are unlimited and never rank.
  - Ranked = started and submitted inside the window. Anything submitted after `ends_at` is not ranked.
  - Practice mode behaves like the existing hub exam runner (answers/explanations shown, own pace). Because practice shows answers, practice is served ONLY after `ends_at` (server check), never during the live window. The exam stays in the app as a practice exam afterwards. Confirm in section 3.

**Q4 Leaderboard.** "full name, 1-3 in visible good card, 4-10 in expandable retracted form. All with time used+score out of the total."
- Design effect: leaderboard shows full name, score as `score / total`, and time used. Ranks 1 to 3 are prominent cards (gold/silver/bronze accents allowed), ranks 4 to 10 in a collapsed expandable section. Ranking: higher score first, then less time used (tie-break; confirm in section 3). Disqualified entries are omitted. Visible after the window ends (see Q5).

**Q5 Prizes.** "Prize decided by admin (mobile internet package, full access to wisdom tower academy.. etc, and cumulative points accumulating and qualifying for other amazing things. but don't list them there... The exact prize is shown after the exam timer ends and leaderboard shows."
- Design effect: the app must NOT show any prize before `ends_at`, and must not hard-code any prize text. Prize text is admin-entered per contest (`prize_title`, `prize_details`, optionally per rank) and the server returns it only after `ends_at`. Never put it in the list/countdown payload before then. Cumulative points: a ledger table `competition_points (user_id, competition_id, points, reason, created_at)` written by the server (admin rule, see open question B); the app shows a total only where the owner decides. "Other amazing things" are out of scope for now.

**Q6 Refresh button.** "the refresh button becomes in the drawer, where the delicate notification setting used to be (between the tools and about and support, in the middle of them."
- Design effect: remove Refresh from the top bar, add a "Refresh" row to the drawer (`ui/drawer/*`) between the Tools group and the About and Support group, same row style as its neighbours, same hard-refresh action the top button ran (`StructuralNav.HARD_REFRESH_JS` + reload, with the offline fallbacks it has today). Part of stage C4's patch.

**Q7 Reminders and control.** "advanced admin dashboard where I can show and hide exams, start and stop countdown, filter users by package to push notification. And trigger notification at selected time"
- Design effect, admin controls the database must support: `published` (show/hide), `countdown_state` (`running` / `paused` / `cancelled`, so the admin can stop the countdown or postpone; the app shows "Postponed by admin" instead of a ticking timer, and a start/stop change must reach open apps within seconds, via polling every 30 s or Supabase Realtime, decide in C3), editable `starts_at` until the contest starts, and a "start now" action. Notifications: a table `scheduled_notifications (id, title, body, audience filter incl. package_id, send_at, status, competition_id null, created_by)`; a scheduler sends them at `send_at` using the existing push sender. Verify before building: Vercel's free plan only allows daily cron jobs, so the scheduler should be Supabase `pg_cron` (every minute) calling the existing website push API or an edge function. The website API secret stays server-side only (public repo!).

**Q8 Time zone.** "yes in Ethiopia time" — every time shown in EAT (UTC+3), regardless of the phone's zone.

**Q9 Security.** "don't worry about screenshots now, cuz the entire app will be screenshot and copy text protected with few exceptions. So leave this for later, cuz we will use advanced security measures, flagging suspicious activities during exam, disabling Ai tutor when exam is started, and strict warning and protection not to switch into other apps if the exam is running. And we'll have detailed flagging, and disqualification marks with its reason and ommiting from leaderboard."
- Design effect: no `FLAG_SECURE` work in the competition stages. Build now only the HOOKS so security can be added later without a rewrite: `competition_entries.disqualified bool default false`, `disqualified_reason text`, `competition_flags (id, entry_id, kind, detail jsonb, created_at)`, a leaderboard that excludes disqualified rows, and one app-wide state `ExamLockdown.active` (true while a ranked exam runs) that the AI tutor and tool overlays can read later. New stage **C10 Integrity** (later, owner starts it) will add flagging of suspicious activity, strict app-switch warnings/protection, AI tutor disabling during the exam, disqualification flow with reasons and admin review UI.

**Q10 After the contest.** "yes, the content production manual will be adjusted to use amazing explanations, and explain with Ai button as well. (Similar to the exam in the hub)."
- Design effect: after `ends_at`, review shows correct answers + solutions and the same "Explain with AI" button the hub exams have. Contest questions therefore need a `solution` (the production manual will require it; the dashboard form should make it required). The AI tutor/Explain stays OFF while a ranked exam is running.

## 2. Changed stage list (supersedes section 6 of the plan where different)

- C1 Database: use the Q3 model (global window, `mode`, one ranked entry), plus the Q5/Q7/Q9 columns and tables above.
- C2 Admin: website dashboard contract only (separate repo task). SQL RPC works meanwhile.
- C4 Top bar: trophy replaces Refresh; Refresh moves to the drawer (Q6).
- C5 Hub/countdown: states are `upcoming`, `live`, `paused/postponed`, `closed (practice available)`. Prize text hidden until `ends_at`.
- C6 Runner: ranked runner uses the global `ends_at`; practice runner reuses the hub exam runner.
- C7 Results: leaderboard per Q4 (top 3 cards, 4 to 10 expandable), prizes and points shown only after `ends_at`.
- C8 Notifications: scheduled/targeted pushes per Q7.
- C10 Integrity (NEW, later): see Q9.

## 3. Still open (ask the owner; defaults in brackets are what the agent proposes)

A. Practice mode only after the window ends, never during it? [yes; during the live window students can only take the ranked attempt]
B. Cumulative points: how are they earned (for example fixed points per rank, or points from the score), and where does the student see their total? [admin sets points per contest; total shown in Account]
C. A student who joins late gets only the remaining time of the global window, and the ranked attempt cannot be restarted. [yes]
D. Tie-break: same score, then less time used, then earlier submit. [yes]
E. Should a student ranked outside the top 10 see their own rank and score? [yes, one extra row under the list; nobody else below rank 10 is shown]
F. Does a disqualified student see a message with the reason? [yes, only to that student]
G. Who sees the leaderboard: every signed-in student, or only people who took the ranked attempt? [every signed-in student in the audience]

## 4. Owner answers to section 3 (append, dated, in the owner's words)

- (none yet)
