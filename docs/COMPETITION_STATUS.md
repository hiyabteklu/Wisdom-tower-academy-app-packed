# COMPETITION_STATUS.md — THE ONLY LIVE WORK (started 2026-10-14)

> Repo is PUBLIC: no secrets, no student names or emails. Read order: this file, `docs/COMPETITION_DECISIONS.md` (owner answers; OVERRIDES the plan), `docs/COMPETITION_PLAN.md` (data model, stages, edge cases), then `docs/BUILD_PITFALLS.md` before any Kotlin. Database contract: `docs/COMPETITION_API_CONTRACT.md`. SQL copy of what is live: `docs/sql/competitions_v1.sql`.
>
> **FREE-QUOTA RULE (owner is on a free plan and rotates ~8 accounts): read `docs/AGENT_QUOTA_PROTOCOL.md`. Do ONE small slice, push it in ONE commit together with this board and a session log, then tell the owner what is next. Work that is not pushed is lost.**

## Owner order (2026-10-14, in the owner's words)
"Questions A-G are accepted as default. So it becomes your task. Start and execute all the plan one at a time (the task associated with the refresh button to trophy and completion.... Etc. No other task, remove any other tasks. Cuz they're all done (or archive them), what we have in hand is building the competition space."

Meaning for agents: run the stages below IN ORDER, one at a time, without waiting for the owner to name each one. Finish a stage (state the evidence), log it here, then start the next. Do not start any task that is not a competition stage. Old tasks are archived (`docs/archive/README.md`).

## C0 decisions: A to G accepted as the proposed defaults (owner, 2026-10-14)
- A. Practice mode only AFTER the window ends. During the live window students can only take the ranked attempt.
- B. Cumulative points: the admin sets points per contest; the total is shown in Account.
- C. A student who joins late gets only the remaining time of the global window; the ranked attempt cannot be restarted.
- D. Tie-break: same score, then less time used, then earlier submit.
- E. A student ranked outside the top 10 sees their own rank and score as one extra row under the list; nobody else below rank 10 is shown.
- F. A disqualified student sees a message with the reason, only that student.
- G. Every signed-in student in the audience sees the leaderboard.

## Stage board (status values: TODO, IN PROGRESS, `[~]` written but not compiled or phone-tested, DONE-VERIFIED with the evidence named)
| Stage | What | Status |
|---|---|---|
| C0 | Decisions recorded, old tasks archived | DONE 2026-10-14 (docs only) |
| C1 | Database + security (tables, RLS, RPCs, SQL tests) | DONE-VERIFIED 2026-10-14 (session I): 4 migrations applied live; RLS/policies/anon-blocked checked (session G); FUNCTIONAL SQL TESTS RUN LIVE inside one rolled-back transaction: 84 of 85 checks passed, 1 minor finding (see session log, session I). Afterwards 0 test rows left, student-id sequence untouched. Repo copy of the SQL: `docs/sql/competitions_v1.sql`. Not covered by SQL tests: real-time behaviour across separate transactions (time cannot pass inside one transaction), and the website/app calling these RPCs (C2/C3+). |
| C2 | Admin publish path (SQL RPC + checklist, website dashboard contract) | IN PROGRESS: C2. SQL RPCs exist AND are now functionally tested (admin publish from exam, reschedule, pause/resume/cancel, start-now, unpublish, disqualify); contract written (`docs/COMPETITION_API_CONTRACT.md`). Website dashboard + owner checklist TODO |
| C3 | App data layer (`data/competition/*`, server-time offset, phase logic) | IN PROGRESS: C3. Slice 1 `[~]` (session J): `CompetitionModels.kt` (models + JSON parsers). Slice 2 `[~]` (session K): `CompetitionRepository.kt` (RPC calls, plain-language errors, server-time offset). Both written, NOT compiled, nothing calls them yet. Left: slice 3 `CompetitionPhaseLogic.kt` (countdown text + which button to show) |
| C4 | Trophy replaces Refresh in the top bar; Refresh row moves to the drawer (patch script for `MainActivity.kt`) | TODO |
| C5 | Competitions hub + countdown screen | TODO |
| C6 | Native exam runner (ranked uses global `ends_at`; practice reuses the hub exam runner) | TODO |
| C7 | Results + leaderboard + review (top 3 cards, 4 to 10 expandable) | TODO |
| C8 | Scheduled and targeted notifications | TODO |
| C9 | Hardening and release (test matrix, regression checklist) | TODO |
| C10 | Integrity (flags, lockdown, disqualification, admin review) | TODO (later hooks only are built in C1) |

Still unconfirmed (carried over, not blocking): build results of #363 (T9 motion follow-up) and PR #24 (floating nav). If a build is red, the owner pastes the line that starts with `e: file:///`.

## Session log (append only)
- 2026-10-14 | Claude (chat) | C0 done. `IN PROGRESS: C1` (database). Plan for C1: write `docs/sql/competitions_v1.sql`, apply it to the Supabase project with the connector (owner granted read and write on 2026-10-11 and ordered execution on 2026-10-14), verify with rolled-back SQL tests, remove test data, log results here.
- 2026-10-14 | Claude (chat, session G) | Found C1 applied in live Supabase but unlogged (previous agent cut off). Verified security state live (see stage board), wrote `docs/COMPETITION_API_CONTRACT.md`, `docs/SESSION_2026-10-14_G.md`. C1 stays `[~]`: functional tests not seen. Correction: the plan line above says the SQL goes to `docs/sql/competitions_v1.sql`; that file is NOT in the repo yet. Next: run and log SQL tests, push the SQL copy (use the live CTE leaderboard), then C2 website dashboard / C3.
- 2026-10-14 | Claude (chat, session H, free-quota slice) | Pushed `docs/sql/competitions_v1.sql` (verbatim copy of the 4 live migrations, read back from `supabase_migrations.schema_migrations`) and `docs/AGENT_QUOTA_PROTOCOL.md`; `docs/SESSION_2026-10-14_H.md`. Correction to session G line: the SQL copy IS in the repo now. C1 still `[~]` (functional SQL tests not run). Next slice: C1 functional tests (rolled back) or first C3 Kotlin file from the contract.
- 2026-10-14 | Claude (chat, session I, free-quota slice) | C1 functional SQL tests RUN on the live project, all inside ONE transaction that ends in a deliberate error so everything rolls back. Result: 84 of 85 checks PASS. Details in `docs/SESSION_2026-10-14_I.md`. The one non-pass (T33) is a minor, explained behaviour, not a data or security bug. Verified afterwards: 0 test users, profiles, contests, entries, points, resources, enrollments, grants, admin rows left; student-id sequence not consumed (setup skipped the profile trigger on purpose). C1 -> DONE-VERIFIED. Next slice (owner's B): first small Kotlin file for C3 from `docs/COMPETITION_API_CONTRACT.md`.
- 2026-10-14 | Claude (chat, session J, free-quota slice) | `IN PROGRESS: C3`. Pushed `app/src/main/java/com/wisdomtower/academy/data/competition/CompetitionModels.kt` (models + org.json parsers for all student RPC results; no java.time because minSdk 24 has no desugaring) and `docs/SESSION_2026-10-14_J.md`. `[~]` not compiled, not called by anything. Correction to session I: its last paragraph names `docs/COMPLETION_API_CONTRACT.md` by mistake; the real file is `docs/COMPETITION_API_CONTRACT.md`. Next slice: `CompetitionRepository.kt` (read `SupabaseAuthClient.kt` and `LearningContentRepository.kt` first for how to call Supabase with the user token).
- 2026-10-14 | Claude (chat, session K, free-quota slice) | Pushed `app/src/main/java/com/wisdomtower/academy/data/competition/CompetitionRepository.kt` (all 9 student RPCs, token refresh + one retry on 401 copied from `ExamAttemptRepository`, plain-language errors, server-time offset for countdowns only) and `docs/SESSION_2026-10-14_K.md`. `[~]` not compiled, not called by anything. Next slice: `CompetitionPhaseLogic.kt` (pure countdown/button logic), then C4.
