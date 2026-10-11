# HANDOVER.md — state at the end of the 2026-10-11 chat session (newest first; read before STATUS.md)

> Written by Claude (chat) when the owner's usage limit was nearly reached. Repo is PUBLIC: no secrets, no personal data. Owner is not a coder: plain language, short, lead with the answer.

## 1. Where things stand (verified unless marked hypothesis)

- `main` builds green (Actions runs #50 to #58 all green, including my commits `8fb3e15`, `8cef475`, `4df5de5`, `dadb5b1`).
- The workflow "Apply pending patches" (added by the owner by hand: the chat tool cannot push `.github/workflows/*`, 403) ran green and created branch **`fix/nav-bell-refresh`**. I verified that its `MainActivity.kt` contains the markers `S12-P1`, `S12-P2`, `S12-P3`. The owner reports that "Build Production AAB & APK" on that branch is **green**.
- **NOT merged into `main` yet.** NOT tested on a phone yet. Next owner step: install that build, test (below), then merge via Pull request (base `main`, compare `fix/nav-bell-refresh`).
- Phone test list for the branch: (a) Packages > Grade 9 > Open Study Hubs > tap a hub: it opens (before: tap looked dead because the workspace overlay stayed on top); (b) bell: opens the website notifications page immediately (before: loaded hidden under the native screen, showed minutes later); (c) top-bar refresh on Home / Packages / Account / Settings: shows "Refreshing…" and reloads notifications and catalog (before: only reloaded a hidden WebView); (d) study workspace shows only the header, "LEARNING HUBS" and 6 hub cards, no Performance Tracker / Log Score.

## 2. What this session changed (all on `main` unless noted)

- `8fb3e15` `NotificationRepository.kt`: no invented welcome notification (it also made the unread dot always red), `isRefreshing` / `lastError` state, encoded query, failures no longer silent. No screen shows those states yet.
- `8cef475` `StudyWorkspaceScreen.kt`: removed invented "Performance Tracker", "Log Score" dialog, "Recent Activity & Drills", hub subtitle, wrong grade labels. The website has NO manual score entry (its `AcademicResultSaver.tsx` is "Progress Tracker" reading real Supabase `academic_results` + `getScopeStats`).
- `4df5de5` `scripts/apply_pending_patches.py`: applies P1 to P3 to `MainActivity.kt` (idempotent, each anchor must match once).
- `docs/PENDING_PATCHES.md`: owner report, session log text, P1 to P4 causes. `CLAUDE.md` / `AGENTS.md` point to it.
- The owner's complaints (not yet copied into `STATUS.md`, which is too large for the chat tool to resend): see `docs/PENDING_PATCHES.md` section A.

## 3. Next tasks, in order

1. Owner phone test of `fix/nav-bell-refresh`, then merge. If something fails, fix on that branch.
2. If your tool can edit big files: copy `docs/PENDING_PATCHES.md` sections A and B into `STATUS.md` (sections A and C), tick S12 in the checklist, then remove them from PENDING_PATCHES. Write the log first.
3. S4 (d) rest, one file per commit, compare with `website-reference/` and never invent text: `ui/guides/GuidesData.kt`, `HomeScreen.kt` and `SettingsScreen.kt` wording, `docs/FIDELITY_AUDIT.md` (written by an older agent, do not trust). Then check the Home screen for invented numbers.
4. The owner's "face tracker" and "manual input" pages: NOT found in the app code (hypothesis: website pages shown in the WebView, e.g. under `/learning`). Ask for a screenshot and search `website-reference/`. The owner's report point 4 arrived blank: ask what it was.
5. Native hub cards on the website show an item count per hub (`ResourceHubGrid.tsx` `hubCounts` from `listResources`); native cards do not. A real native "Progress Tracker" is possible only through the website's real data (read `docs/SUPABASE_NOTES.md` first for `academic_results` policies); ask the owner before building it.
6. Split `MainActivity.kt` (244 KB, 4541 lines) so any tool can edit it. Plan: JS constants and helpers (lines about 231-770) to `WebScripts.kt`; bottom nav, loaders, dialogs (about 3871-4541) to `ShellComponents.kt`; then cut `MainScreen` (about 950-3870) into smaller composables. One step per commit, green build between. Method that works without a big-file tool: write a Python script in `scripts/` that moves the line ranges (test it on a copy), and run it through the owner's "Apply pending patches" style workflow (new branch, then build, then merge). Note `scripts/restore_mainactivity.py` keeps a valid `MainActivity.kt` already on disk, so edits are not overwritten by the build.
7. Still open from earlier sessions: P4 (`tabIndexForUrl` sends any "academy"/"learning" path to the Learning tab; check after P1 to P3), the `/login` interception in `MainActivity.kt`, S5 to S11 in `STATUS.md`.

## 4. Tool limits learned (for chat-based agents)

- GitHub MCP tool can only replace whole files: fine up to about 40 KB, not for `MainActivity.kt` (244 KB) or reliably for `STATUS.md` (38 KB). It cannot push `.github/workflows/*`. Big files fetched by it are saved to `/mnt/user-data/tool_results/` and can be grepped there.
- The sandbox has no internet and no Kotlin compiler: only the owner's GitHub Actions build proves anything compiles. Always say "not compiled" until the build is green AND the owner tested on the phone.
- `AuthStateManager.refreshIfNeeded` is a `suspend` function: it cannot be called from a button click without a coroutine scope.
