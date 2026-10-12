# Session log 2026-10-12 BP: T1 (tool overlay return & phone back button fix)

> Continues `docs/SESSION_2026-10-12_BO.md`. Repo is PUBLIC: no secrets.

- 2026-10-12 | AI Studio Agent | DONE [~]: T1 per owner instruction ("Implement T1").
  - **ROOT CAUSE OF PHONE BACK ISSUE (verified in code):**
    In Jetpack Compose (`androidx.activity.compose.BackHandler`), the most recently composed enabled `BackHandler` receives the Back event first. In `MainActivity.kt`, the root `BackHandler` was registered at the top of `MainScreen` (before `StudyWorkspaceScreen` or `QuizExamScreen` entered composition). `StudyWorkspaceScreen.kt` has `BackHandler(enabled = view != null && view !is WorkspaceView.Quiz)` and `QuizExamScreen.kt` has `BackHandler(enabled = true)`. When a student opened a tool overlay (AI Tutor, Calculator, etc.) over an open book, note, flashcard deck, or exam, the deeper `BackHandler` inside `StudyWorkspaceScreen` or `QuizExamScreen` was registered after `MainActivity`'s root `BackHandler`. Pressing the phone Back button was intercepted by the reader or exam handler instead of `activeStudyTool`, which closed the note or prompted exit guilt in the exam while the tool was open!
  - **WHAT WAS DONE:**
    1. **Standardized Return Control Across All 7 Tools (Goal 1):**
       - Updated `ScreenBackButton` in `HubItemListScreen.kt` to have a full **48dp touch target** (`size(48.dp)` with centered 20dp `Icons.AutoMirrored.Filled.ArrowBack`), meeting Android accessibility requirements and fixing the owner's "in the AI Tutor it is a small back arrow".
       - Standardized all 7 tools (`NativeCalculatorScreen.kt`, `NativeTimerScreen.kt`, `NativePlannerScreen.kt`, `NativeNotebookScreen.kt`, `NativeTargetsScreen.kt`, `NativeStatusScreen.kt`, `NativeTutorScreen.kt`) to share the **exact same top-left position** (`padding(horizontal = 12.dp, vertical = 8.dp)`) with `ScreenBackButton(onBack)`.
       - **Removed all red Close buttons** (`Icons.Filled.Close` with `0xFFF43F5E` red background and "Close" text) from Calculator, Timer, Planner, Notebook, Targets, and Status.
    2. **Fixed Phone Hardware & Gesture Back Button Priority (Goal 2 & 3):**
       - Added local `BackHandler(enabled = true) { onBack() }` directly inside `NativeCalculatorScreen`, `NativeTimerScreen`, `NativePlannerScreen`, `NativeNotebookScreen`, `NativeTargetsScreen`, and `NativeStatusScreen`.
       - In `NativeTutorScreen`: history panel closes first (`BackHandler(enabled = showHistory) { showHistory = false }`), and when history is closed, `BackHandler(enabled = !showHistory) { onBack() }` closes the tutor overlay.
       - In `MainActivity.kt`: added local `BackHandler(enabled = true) { activeStudyTool = null }` inside the `if (currentTool != null)` overlay rendering block (zIndex 120f). Because this block is composed when the overlay opens (after the underlying workspace was already composed), it sits at the top of the back dispatcher stack and intercepts Back first.
       - In `MainActivity.kt`: added local `BackHandler(enabled = true) { activeDrawerScreen = null }` inside the drawer screens block (zIndex 25f), and updated the root `BackHandler` sequence so `activeDrawerScreen` is checked before `activeWorkspace`. Drawer screens (About, FAQ, Contact, Privacy, Terms) now close cleanly on phone Back without closing the student's workspace.
    3. **Exam Timer Behavior (T1 constraint):**
       - Exam timer logic was not modified. The exam runs inside `QuizExamScreen`'s local packed WebView (`quiz.html`), which remains mounted in composition beneath the overlay (`zIndex(120f)`). The timer continues running normally while a tool is open, and when the tool is closed, the student is on the exact same question with their existing timer and answers intact.
    4. **Large File & Patch Protocol:**
       - Created patch script `scripts/patch_t1_tool_overlay_back.py` (P17).
       - Applied cleanly to `MainActivity.kt`.
       - Ran `scripts/pack_mainactivity.py` to regenerate `scripts/MainActivity.kt.gz.b64` and `scripts/ma_part0..5.b64` in sync with `MainActivity.kt`.
       - Logged P17 in `docs/PENDING_PATCHES.md`.
  - **FILES TOUCHED:**
    - `app/src/main/java/com/wisdomtower/academy/ui/study/HubItemListScreen.kt` (ScreenBackButton 48dp touch target)
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativeCalculatorScreen.kt` (BackHandler, ScreenBackButton toolbar, red Close button removed)
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativeTimerScreen.kt` (BackHandler, ScreenBackButton toolbar, red Close button removed)
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativePlannerScreen.kt` (BackHandler, ScreenBackButton toolbar, red Close button removed)
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativeNotebookScreen.kt` (BackHandler, ScreenBackButton toolbar, red Close button removed)
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativeTargetsScreen.kt` (BackHandler, ScreenBackButton toolbar, red Close button removed)
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativeStatusScreen.kt` (BackHandler, ScreenBackButton toolbar, red Close button removed)
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativeTutorScreen.kt` (overlay BackHandler, toolbar padding 12dp/8dp)
    - `app/src/main/java/com/wisdomtower/academy/MainActivity.kt` (via P17 patch script + packed blobs)
    - `scripts/patch_t1_tool_overlay_back.py` (new patch script P17)
    - `scripts/MainActivity.kt.gz.b64` & `scripts/ma_part0..5.b64` (updated via `pack_mainactivity.py`)
    - `docs/PENDING_PATCHES.md` (P17 recorded)
  - **VERIFICATION:**
    - Brace nesting across all 9 modified files is balanced (`diff=0`).
    - Web applet compilation succeeded (`compile_applet`).
    - Lint check succeeded (`lint_applet` / `tsc --noEmit`).
  - **LEFT:** Owner phone testing for T1. Then owner chooses next task (e.g. T2 fonts, or as owner decides).
  - **WHAT THE OWNER SHOULD TEST ON THE PHONE:**
    1. Inside a book (PDF reader), note reader, flashcards deck, and a running exam:
       - Open each of the 7 tools from the drawer menu (AI Tutor, Calculator, Timer, Planner, Notebook, Targets, Status).
       - Verify that every tool has the exact same top-left back arrow (`ScreenBackButton`) with a comfortable touch target (48dp), and no red Close buttons remain.
       - Tap the back arrow: verify the tool closes immediately and you return to the exact same book page, note scroll position, flashcard deck, or exam question.
       - Open a tool again and press the phone's hardware/gesture Back button: verify that the tool closes FIRST, leaving your study content untouched.
       - Press phone Back a second time: verify it now goes back in your study history (e.g. leaves the reader or prompts exit guilt in an exam).
    2. In AI Tutor: open the "Chats" history panel, press phone Back: verify history panel closes first; press phone Back again: verify Tutor overlay closes.
    3. From Home, Packages, and Account tabs: open a tool, verify back arrow and phone Back return to where you were.
    4. Drawer screens (About, FAQ, Contact, Privacy, Terms) opened while studying: verify phone Back closes the drawer screen first, returning to your study screen.
