# Instructions for AI coding agents

The agent rules live in ONE place: **`HANDOFF.md` section 0 (MANDATORY AGENT PROTOCOL)**. Read `HANDOFF.md` in full first, then **`docs/COMPETITION_STATUS.md`** (the live stage board), `docs/COMPETITION_DECISIONS.md` (owner answers, they override the plan), `docs/COMPETITION_PLAN.md`, then `docs/BUILD_PITFALLS.md` before writing any code, and the newest `docs/SESSION_*.md` files. Section 0, rule 10, plus `docs/EDITING_LARGE_FILES.md`, explain how to change files that are too big to resend (patch script in `scripts/` + the GitHub Action); never stop at "the file is too big".

Current phase (2026-10-14): **the competition space is the ONLY live work.** The owner ordered stages C1 to C10 to be executed one at a time, in order. UI polishing T1 to T9 and everything older is archived (`docs/archive/README.md`): do not work on it. The global constraints G1 to G9 in `docs/UI_POLISH_TASKS.md` stay in force. Inspect the code first, make focused changes, keep the approved design, avoid regressions, and never claim something is verified or tested without evidence.

Before you stop (or when your quota is nearly out), write the session log first.

The repo is public: never commit secrets or personal data. The owner is not a coder: explain in plain language.
