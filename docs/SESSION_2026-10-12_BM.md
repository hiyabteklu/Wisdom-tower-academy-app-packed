# Session log 2026-10-12 BM: U1 Option A implementation (global drawer tools and screens overlay)

> Continues `docs/SESSION_2026-10-12_BL.md`. Repo is PUBLIC: no secrets.

- 2026-10-12 | Claude / AI Studio Agent | DONE `[~]` (written, not compiled in CI): U1 Option A implemented per owner instruction ("Option A is better, implement it").
  - Patch script: `scripts/patch_u1_global_tool_overlays.py` (P16 in `docs/PENDING_PATCHES.md`).
  - Executed on `app/src/main/java/com/wisdomtower/academy/MainActivity.kt` and packed with `scripts/pack_mainactivity.py`.
  - Changes:
    1. **Global Tool Overlay (`activeStudyTool`)**:
       - Hosted in `MainActivity.kt` at `zIndex(120f)`, above `StudyWorkspaceScreen` (`18f`) and all tab screens (`10f`).
       - Tapping AI Tutor, Calculator, Timer, Planner, Notebook, Targets, or Status from the drawer menu (or link handler) sets `activeStudyTool` directly without clearing `activeWorkspace` or changing the bottom navigation tab.
       - Passes `courseContext = activeWorkspace?.first` to `NativeTutorScreen` so the tutor automatically knows which course the student is studying.
       - `BackHandler` in `MainActivity.kt` dismisses `activeStudyTool = null`, leaving the student on the exact book, notes, quiz, or course page without losing their position or progress.
    2. **Drawer Support Screens (`AboutScreen`, `ContactScreen`, `FaqScreen`, `PrivacyScreen`, `TermsScreen`)**:
       - Raised from `zIndex(16f)` to `zIndex(25f)` (above `StudyWorkspaceScreen` `18f`).
       - Tapping About, FAQ, Contact, etc. from the drawer now opens cleanly even from inside a course or reader, and Back returns right to the course/reader.
    3. **Overlay reset**:
       - `resetOverlays()` clears `activeStudyTool = null`.

- LEFT:
  - Owner tests on phone after GitHub Actions build is green.
  - Next UI polishing items in `STATUS.md` B1: U2 (AI Tutor design & polish, next steps in `SESSION_2026-10-12_BK.md` / `BH.md`), U3 (maximize reading space), U4 (book download sizes), U5 (accurate download progress).

- TEST (owner, after GitHub Action build is green):
  1. Open a course or package (e.g. Packages > Freshman > Applied Mathematics I).
  2. Open a book (PDF reader) or short notes or flashcards.
  3. Tap the top-left hamburger menu:
     - Tap **AI Tutor**: the AI Tutor opens smoothly over the textbook/notes.
     - Press the device Back button (or the tutor Back arrow): the tutor closes and you are **still on your exact textbook/notes page**!
     - Open the drawer again and tap **Calculator**: the calculator opens over the textbook. Press Back to return.
     - Open the drawer and tap **About Academy** or **FAQ**: the screen opens cleanly above the course. Press Back to return.
  4. Repeat from Home screen, Packages screen, Account screen: tools open smoothly and close back to the respective screen.
  5. Regression checklist (`HANDOFF.md` section 9): verify normal navigation, tab switching, and bottom nav continue to behave without regression.

- NOTES/UNSURE:
  - Not compiled in CI yet (marked `[~]` per protocol). Tested with dry run and idempotency check.
  - `pack_mainactivity.py` was executed to update `MainActivity.kt.gz.b64` and `ma_part0..5.b64` so the repo build/restore mechanism stays in sync.
