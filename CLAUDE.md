# Instructions for Claude agents

**FIRST, OWNER RULE 2026-10-16: read `docs/OWNER_RULE_WRITTEN_IS_DONE.md`. Written and pushed code counts as DONE (builds are green, the owner has confirmed it works). It overrides every `[~]`, "CI NOT seen" and "not seen on a device" label in the older docs. Report only what is genuinely not done.**

The agent rules live in ONE place: **`HANDOFF.md` section 0 (MANDATORY AGENT PROTOCOL)**. Read `HANDOFF.md` in full first, then **`docs/COMPETITION_STATUS.md`** (the live stage board), `docs/COMPETITION_DECISIONS.md` (owner answers, they override the plan), `docs/COMPETITION_PLAN.md`, then `docs/BUILD_PITFALLS.md` before writing any code, and the newest `docs/SESSION_*.md` files. Section 0, rule 10, plus `docs/EDITING_LARGE_FILES.md`, explain how to change files that are too big to resend: patch script plus the GitHub Action; NEVER answer "the file is too big".

**NOTIFICATIONS V2 (owner order 2026-10-15, live work, extends C8): read `docs/NOTIFICATIONS_V2_PLAN.md` (plan, verified facts, slices R0 to R8, progress table in its section 8) right after the status board. It spans this repo, the WEBSITE repo and the live Supabase project.**

**ADMIN CONSOLE (owner orders 2026-10-15 and 2026-10-16): `docs/ADMIN_MOBILE_PLAN.md` and `docs/ADMIN_UI_V2_PLAN.md`. Code is in the WEBSITE repo.**

**FREE-QUOTA RULE (owner is on a free plan and rotates between ~8 accounts; unpushed work is lost): read `docs/AGENT_QUOTA_PROTOCOL.md`. Do ONE small slice, push it in ONE commit with the stage board and a session log, then tell the owner what is next. Do not chain many stages in one chat.**

Current phase (2026-10-14): **the competition space is the ONLY live work** (trophy replaces Refresh, global timed exams, countdown, native runner, leaderboard). The owner ordered the stages C1 to C10 to be executed one at a time, in order. UI polishing T1 to T9 and everything older is archived (`docs/archive/README.md`): do not work on it. The global constraints G1 to G9 in `docs/UI_POLISH_TASKS.md` (forbidden files, no invented text, no new dependencies or hosts) stay in force. For every stage: inspect the code first, make focused changes, keep the approved design, and avoid regressions.

Before you stop (or when your quota is nearly out), write the session log first (`docs/COMPETITION_STATUS.md` session log and a `docs/SESSION_*.md` file).

The repo is public: never commit secrets or personal data. The owner is not a coder: explain in plain language, short, answer first; ask in plain words when you are stuck.
