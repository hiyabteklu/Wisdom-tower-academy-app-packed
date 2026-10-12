# Instructions for AI coding agents

The agent rules live in ONE place: **`HANDOFF.md` section 0 (MANDATORY AGENT PROTOCOL)**. Read `HANDOFF.md` in full first, then `STATUS.md` (owner decisions in section A, active roadmap in section B1), then `docs/BUILD_PITFALLS.md` before writing any code, and the newest `docs/SESSION_*.md` files. `HANDOFF.md` section 2 says which documents are current and which are historical. Section 0, rule 10, plus `docs/EDITING_LARGE_FILES.md`, explain how to change files that are too big to resend (patch script in `scripts/` + the GitHub Action); never stop at "the file is too big".

Current phase (2026-10-12): everything planned earlier is reported done by the owner; the only active work is the UI polishing roadmap (`STATUS.md` B1, items U1 to U5), which is PLANNED, NOT IMPLEMENTED. Do not implement anything until the owner says which item to start. When you do: inspect the code first, make focused changes, keep the approved design, avoid regressions, and never claim something is verified or tested without evidence.

Work on one task at a time. Before you stop (or when your quota is nearly out), write the session log first.

The repo is public: never commit secrets or personal data. The owner is not a coder: explain in plain language.
