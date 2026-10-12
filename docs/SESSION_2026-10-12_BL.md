# Session log 2026-10-12 BL: U1 (drawer/menu tools do not open inside courses and readers), root cause analysis

> Continues `docs/SESSION_2026-10-12_BK.md`. Repo is PUBLIC: no secrets. Investigation only: NO application code is changed in this session.

- 2026-10-12 | Claude / AI Studio Agent | DONE: U1 root-cause investigation completed per `STATUS.md` B1 and `HANDOFF.md` rule 11(g). Found exact causes in `MainActivity.kt` and `StudyWorkspaceScreen.kt` across layers, navigation state, and zIndex ordering.

---

## 1. Summary of the Problem (Owner Report)
The AI Tutor and the other drawer/menu study tools (Calculator, Notebook, Timer, Planner) fail to open while reading or inside a course/package, but they work as expected on the home screen.

---

## 2. Verified Root Causes (Code Audit)

### Root Cause 1: Layering and `zIndex` conflict with `StudyWorkspaceScreen`
- **Location**: `MainActivity.kt` lines 3187–3206 and `StudyWorkspaceScreen.kt` lines 320–375.
- Whenever a student is inside a course, package hub, or reading content (PDF reader, Notes reader, Flashcards, Quiz/Exam):
  `activeWorkspace` is non-null (`Triple(...)`).
- In `MainActivity.kt`, `StudyWorkspaceScreen` is rendered at:
  ```kotlin
  modifier = Modifier.fillMaxSize().background(WisdomNavy).zIndex(18f)
  ```
- All native reading screens (`PdfReaderScreen`, `NotesReaderScreen`, `FlashcardsScreen`, `QuizExamScreen`, `HubItemListScreen`) run inside `StudyWorkspaceScreen`.
- In contrast, the native study tools (`NativeTutorScreen`, `NativeCalculatorScreen`, etc.) ONLY exist inside `LearningScreen.kt`, which is rendered at:
  ```kotlin
  modifier = Modifier.fillMaxSize().background(WisdomNavy).zIndex(10f)
  ```
- Because `zIndex(18f)` > `zIndex(10f)`, `StudyWorkspaceScreen` sits strictly on top of `LearningScreen`.

### Root Cause 2: `navigateTo` does not clear `activeWorkspace`
- **Location**: `MainActivity.kt` lines 1178–1226.
- When a student taps "AI Tutor", "Calculator", "Notebook", "Timer", or "Planner" in the drawer/menu (which sits at `zIndex(150f)`):
  The click calls `navigateTo("https://www.wisdom-tower-academy.live/learning?tool=<tool>")`.
- `navigateTo` intercepts each tool and executes:
  ```kotlin
  com.wisdomtower.academy.ui.study.NativeToolRequests.requestTutor()
  menuExpanded = false
  activeStudyUrl = null
  selectedIndex = 1
  return
  ```
- Notice: `navigateTo` sets `selectedIndex = 1` and `menuExpanded = false`, but **never clears `activeWorkspace`** (`activeWorkspace = null` is NOT called; `resetOverlays()` is NOT called).
- Result: `StudyWorkspaceScreen` remains active on screen at `zIndex(18f)`. Underneath it at `zIndex(10f)`, `LearningScreen` received the request and opened the tool, but it is 100% invisible because `StudyWorkspaceScreen` covers it!
- To the student: the drawer closes, and nothing appears to happen. If the student later presses Back out of the course/workspace, the tool suddenly appears on the Learning tab because it was running underneath all along.

### Root Cause 3: Drawer Screens (About, Contact, FAQ, etc.) are also covered
- **Location**: `MainActivity.kt` lines 3266–3304.
- `AboutScreen`, `ContactScreen`, `FaqScreen`, `PrivacyScreen`, and `TermsScreen` are rendered with:
  ```kotlin
  modifier = Modifier.zIndex(16f)
  ```
- Because `16f < 18f`, tapping "About Academy", "Contact & Support", or "FAQ" from the drawer while inside a course or reader also fails to show, because `StudyWorkspaceScreen` (18f) covers them.

### Root Cause 4: In Web Study Views, the Hamburger Menu is replaced by Back Arrow
- **Location**: `MainActivity.kt` line 1875.
- When studying a web URL (`activeStudyUrl != null`), the top app bar's left button changes from `Icons.Filled.Menu` to `Icons.AutoMirrored.Filled.ArrowBack`. The drawer cannot be opened from web study views.

---

## 3. Two Proposed Fix Options for the Owner

### Option A (Recommended): True Global Study Overlays (Keep Reading Position)
When a student is reading a textbook or taking a quiz and asks the AI Tutor or opens the Calculator:
- Hoist the tools (or a global tool overlay container) in `MainActivity.kt` above the workspace (e.g., at `zIndex(120f)`).
- The AI Tutor or Calculator opens smoothly over the book or course.
- When closed (Back button or X), the student is **still on the exact page of the book or course** without losing progress!
- Also raise drawer screens (`AboutScreen`, `ContactScreen`, etc.) to `zIndex(25f)` (above workspace 18f).

### Option B: Switch Away to Learning Tab (`resetOverlays()`)
- In `navigateTo` for the 7 tools, call `resetOverlays()` (or `activeWorkspace = null; selectedPackage = null`) so `StudyWorkspaceScreen` is closed and the student is switched to the Learning tab with the tool open.
- In drawer rows for About/Contact/FAQ, also clear `activeWorkspace = null`.
- Trade-off: Closes the current course or book immediately. When the student finishes using the tool, they land on the Learning tab rather than back in their book.

---

- LEFT: Owner decides between Option A (study tool opens over the book/course so reading place is kept) and Option B (tool closes the book/course and switches to Learning tab).
- TEST: Not applicable yet (investigation session only; no code changes made).
