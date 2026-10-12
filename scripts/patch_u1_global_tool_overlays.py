#!/usr/bin/env python3
"""U1 Option A: Global drawer and study tools accessibility (owner instruction, 2026-10-12).

Before:
  - Study tools (AI Tutor, Calculator, Timer, Planner, Notebook, Targets, Status) only existed inside
    LearningScreen at zIndex 10f.
  - When a student opened a course or reader, StudyWorkspaceScreen covered the viewport at zIndex 18f.
  - navigateTo switched selectedIndex to 1 without clearing activeWorkspace, leaving the tool running
    invisibly underneath the workspace.
  - Drawer screens (About, Contact, FAQ, etc.) were at zIndex 16f, also covered by StudyWorkspaceScreen (18f).

After:
  - Native study tools are hosted in MainActivity as global overlays at zIndex 120f (above workspace 18f).
  - Tapping AI Tutor, Calculator, etc. from the drawer or link handler opens the tool directly over
    the active course, book, notes, or quiz.
  - Tapping Back (or device back button) dismisses the tool overlay and returns the student directly
    to their current study material without losing place or progress.
  - Native drawer screens (About, Contact, FAQ, Privacy, Terms) are raised to zIndex 25f so they open
    cleanly from inside courses and readers.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "U1 Option A: study tools open as a global overlay"

if not FILE.exists():
    print(f"ERROR: {FILE} does not exist", file=sys.stderr)
    sys.exit(1)

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

edits = [
    # 1. Imports for native study tool composables
    (
        "import com.wisdomtower.academy.ui.study.contentScopePath\n",
        "import com.wisdomtower.academy.ui.study.contentScopePath\n"
        "import com.wisdomtower.academy.ui.study.NativeTutorScreen\n"
        "import com.wisdomtower.academy.ui.study.NativeCalculatorScreen\n"
        "import com.wisdomtower.academy.ui.study.NativeTimerScreen\n"
        "import com.wisdomtower.academy.ui.study.NativePlannerScreen\n"
        "import com.wisdomtower.academy.ui.study.NativeNotebookScreen\n"
        "import com.wisdomtower.academy.ui.study.NativeTargetsScreen\n"
        "import com.wisdomtower.academy.ui.study.NativeStatusScreen\n"
    ),

    # 2. State variable for active global study tool overlay
    (
        "    var activeDrawerScreen by remember { mutableStateOf<String?>(null) }\n",
        "    var activeDrawerScreen by remember { mutableStateOf<String?>(null) }\n"
        "    var activeStudyTool by remember { mutableStateOf<String?>(null) }\n"
    ),

    # 3. resetOverlays clears activeStudyTool
    (
        "    val resetOverlays: () -> Unit = {\n        activeWorkspace = null\n",
        "    val resetOverlays: () -> Unit = {\n        activeStudyTool = null\n        activeWorkspace = null\n"
    ),

    # 4. navigateTo sets activeStudyTool directly without switching tabs or losing workspace
    (
        '''        val targetUrl = url.trim()
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=tutor")) {
            com.wisdomtower.academy.ui.study.NativeToolRequests.requestTutor()
            menuExpanded = false
            activeStudyUrl = null
            selectedIndex = 1
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=calc")) {
            com.wisdomtower.academy.ui.study.NativeToolRequests.requestCalculator()
            menuExpanded = false
            activeStudyUrl = null
            selectedIndex = 1
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=time")) {
            com.wisdomtower.academy.ui.study.NativeToolRequests.requestTimer()
            menuExpanded = false
            activeStudyUrl = null
            selectedIndex = 1
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=plan")) {
            com.wisdomtower.academy.ui.study.NativeToolRequests.requestPlanner()
            menuExpanded = false
            activeStudyUrl = null
            selectedIndex = 1
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=note")) {
            com.wisdomtower.academy.ui.study.NativeToolRequests.requestNotebook()
            menuExpanded = false
            activeStudyUrl = null
            selectedIndex = 1
            return
        }
        if (targetUrl.contains("/learning") && (targetUrl.contains("tool=goal") || targetUrl.contains("tool=target"))) {
            com.wisdomtower.academy.ui.study.NativeToolRequests.requestTargets()
            menuExpanded = false
            activeStudyUrl = null
            selectedIndex = 1
            return
        }
        if (targetUrl.contains("/learning") && (targetUrl.contains("tool=analytic") || targetUrl.contains("tool=status"))) {
            com.wisdomtower.academy.ui.study.NativeToolRequests.requestStatus()
            menuExpanded = false
            activeStudyUrl = null
            selectedIndex = 1
            return
        }''',
        '''        val targetUrl = url.trim()
        // U1 Option A: study tools open as a global overlay without changing tabs or clearing workspace
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=tutor")) {
            activeStudyTool = "tutor"
            menuExpanded = false
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=calc")) {
            activeStudyTool = "calculator"
            menuExpanded = false
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=time")) {
            activeStudyTool = "timer"
            menuExpanded = false
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=plan")) {
            activeStudyTool = "planner"
            menuExpanded = false
            return
        }
        if (targetUrl.contains("/learning") && targetUrl.contains("tool=note")) {
            activeStudyTool = "notes"
            menuExpanded = false
            return
        }
        if (targetUrl.contains("/learning") && (targetUrl.contains("tool=goal") || targetUrl.contains("tool=target"))) {
            activeStudyTool = "targets"
            menuExpanded = false
            return
        }
        if (targetUrl.contains("/learning") && (targetUrl.contains("tool=analytic") || targetUrl.contains("tool=status"))) {
            activeStudyTool = "status"
            menuExpanded = false
            return
        }'''
    ),

    # 5. BackHandler handles activeStudyTool before closing deeper screens
    (
        "        if (menuExpanded) {\n            menuExpanded = false\n            return@BackHandler\n        }\n",
        "        if (menuExpanded) {\n            menuExpanded = false\n            return@BackHandler\n        }\n        if (activeStudyTool != null) {\n            activeStudyTool = null\n            return@BackHandler\n        }\n"
    ),

    # 6. shouldOverrideUrlLoading also routes tool URLs to activeStudyTool overlay
    (
        '''                                    if (u.contains("/learning") && u.contains("tool=tutor")) {
                                        com.wisdomtower.academy.ui.study.NativeToolRequests.requestTutor()
                                        menuExpanded = false
                                        activeStudyUrl = null
                                        selectedIndex = 1
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=calc")) {
                                        com.wisdomtower.academy.ui.study.NativeToolRequests.requestCalculator()
                                        menuExpanded = false
                                        activeStudyUrl = null
                                        selectedIndex = 1
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=time")) {
                                        com.wisdomtower.academy.ui.study.NativeToolRequests.requestTimer()
                                        menuExpanded = false
                                        activeStudyUrl = null
                                        selectedIndex = 1
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=plan")) {
                                        com.wisdomtower.academy.ui.study.NativeToolRequests.requestPlanner()
                                        menuExpanded = false
                                        activeStudyUrl = null
                                        selectedIndex = 1
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=note")) {
                                        com.wisdomtower.academy.ui.study.NativeToolRequests.requestNotebook()
                                        menuExpanded = false
                                        activeStudyUrl = null
                                        selectedIndex = 1
                                        return true
                                    }
                                    if (u.contains("/learning") && (u.contains("tool=goal") || u.contains("tool=target"))) {
                                        com.wisdomtower.academy.ui.study.NativeToolRequests.requestTargets()
                                        menuExpanded = false
                                        activeStudyUrl = null
                                        selectedIndex = 1
                                        return true
                                    }
                                    if (u.contains("/learning") && (u.contains("tool=analytic") || u.contains("tool=status"))) {
                                        com.wisdomtower.academy.ui.study.NativeToolRequests.requestStatus()
                                        menuExpanded = false
                                        activeStudyUrl = null
                                        selectedIndex = 1
                                        return true
                                    }''',
        '''                                    // U1 Option A: study tools open as a global overlay without changing tabs or clearing workspace
                                    if (u.contains("/learning") && u.contains("tool=tutor")) {
                                        activeStudyTool = "tutor"
                                        menuExpanded = false
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=calc")) {
                                        activeStudyTool = "calculator"
                                        menuExpanded = false
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=time")) {
                                        activeStudyTool = "timer"
                                        menuExpanded = false
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=plan")) {
                                        activeStudyTool = "planner"
                                        menuExpanded = false
                                        return true
                                    }
                                    if (u.contains("/learning") && u.contains("tool=note")) {
                                        activeStudyTool = "notes"
                                        menuExpanded = false
                                        return true
                                    }
                                    if (u.contains("/learning") && (u.contains("tool=goal") || u.contains("tool=target"))) {
                                        activeStudyTool = "targets"
                                        menuExpanded = false
                                        return true
                                    }
                                    if (u.contains("/learning") && (u.contains("tool=analytic") || u.contains("tool=status"))) {
                                        activeStudyTool = "status"
                                        menuExpanded = false
                                        return true
                                    }'''
    ),

    # 7. Drawer screens zIndex raised to 25f, and Study Tool Overlays rendered at zIndex 120f
    (
        '''                // Native Drawer Screens (About, Contact, FAQ, Privacy, Terms)
                if (activeDrawerScreen != null) {
                    when (activeDrawerScreen) {
                        "about" -> AboutScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(16f)
                        )
                        "contact" -> ContactScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(16f)
                        )
                        "faq" -> FaqScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(16f)
                        )
                        "privacy" -> PrivacyScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(16f)
                        )
                        "terms" -> TermsScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(16f)
                        )
                    }
                }''',
        '''                // Native Drawer Screens (About, Contact, FAQ, Privacy, Terms)
                // U1 Option A: raised to zIndex 25f so they open above StudyWorkspaceScreen (18f)
                if (activeDrawerScreen != null) {
                    when (activeDrawerScreen) {
                        "about" -> AboutScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(25f)
                        )
                        "contact" -> ContactScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(25f)
                        )
                        "faq" -> FaqScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(25f)
                        )
                        "privacy" -> PrivacyScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(25f)
                        )
                        "terms" -> TermsScreen(
                            onBack = { activeDrawerScreen = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(25f)
                        )
                    }
                }

                // Native Global Study Tools Overlays (U1 Option A: accessible from any screen at zIndex 120f)
                val currentTool = activeStudyTool
                if (currentTool != null) {
                    when (currentTool) {
                        "tutor" -> NativeTutorScreen(
                            onBack = { activeStudyTool = null },
                            courseContext = activeWorkspace?.first,
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(120f)
                        )
                        "calculator" -> NativeCalculatorScreen(
                            onBack = { activeStudyTool = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(120f)
                        )
                        "timer" -> NativeTimerScreen(
                            onBack = { activeStudyTool = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(120f)
                        )
                        "planner" -> NativePlannerScreen(
                            onBack = { activeStudyTool = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(120f)
                        )
                        "notes" -> NativeNotebookScreen(
                            onBack = { activeStudyTool = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(120f)
                        )
                        "targets" -> NativeTargetsScreen(
                            onBack = { activeStudyTool = null },
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(120f)
                        )
                        "status" -> NativeStatusScreen(
                            onBack = { activeStudyTool = null },
                            isLoggedIn = isLoggedIn,
                            studentName = currentProfile?.fullName ?: currentUser?.fullName,
                            educationLevel = currentProfile?.educationLevel,
                            stream = currentProfile?.stream,
                            dailyGoalMinutes = currentProfile?.dailyStudyGoalMinutes?.takeIf { it > 0 } ?: 45,
                            modifier = Modifier
                                .fillMaxSize()
                                .background(WisdomNavy)
                                .zIndex(120f)
                        )
                    }
                }'''
    ),

    # 8. Sync NativeToolRequests into activeStudyTool
    (
        "    LaunchedEffect(isLoggedIn, currentUser?.id) {\n",
        "    if (com.wisdomtower.academy.ui.study.NativeToolRequests.pendingTutor) {\n"
        "        com.wisdomtower.academy.ui.study.NativeToolRequests.pendingTutor = false\n"
        "        activeStudyTool = \"tutor\"\n"
        "    }\n"
        "    if (com.wisdomtower.academy.ui.study.NativeToolRequests.pendingCalculator) {\n"
        "        com.wisdomtower.academy.ui.study.NativeToolRequests.pendingCalculator = false\n"
        "        activeStudyTool = \"calculator\"\n"
        "    }\n"
        "    if (com.wisdomtower.academy.ui.study.NativeToolRequests.pendingTimer) {\n"
        "        com.wisdomtower.academy.ui.study.NativeToolRequests.pendingTimer = false\n"
        "        activeStudyTool = \"timer\"\n"
        "    }\n"
        "    if (com.wisdomtower.academy.ui.study.NativeToolRequests.pendingPlanner) {\n"
        "        com.wisdomtower.academy.ui.study.NativeToolRequests.pendingPlanner = false\n"
        "        activeStudyTool = \"planner\"\n"
        "    }\n"
        "    if (com.wisdomtower.academy.ui.study.NativeToolRequests.pendingNotebook) {\n"
        "        com.wisdomtower.academy.ui.study.NativeToolRequests.pendingNotebook = false\n"
        "        activeStudyTool = \"notes\"\n"
        "    }\n"
        "    if (com.wisdomtower.academy.ui.study.NativeToolRequests.pendingTargets) {\n"
        "        com.wisdomtower.academy.ui.study.NativeToolRequests.pendingTargets = false\n"
        "        activeStudyTool = \"targets\"\n"
        "    }\n"
        "    if (com.wisdomtower.academy.ui.study.NativeToolRequests.pendingStatus) {\n"
        "        com.wisdomtower.academy.ui.study.NativeToolRequests.pendingStatus = false\n"
        "        activeStudyTool = \"status\"\n"
        "    }\n\n"
        "    LaunchedEffect(isLoggedIn, currentUser?.id) {\n"
    )
]

for idx, (old, new) in enumerate(edits, 1):
    cnt = src.count(old)
    if cnt != 1:
        print(f"ERROR: edit {idx} anchor found {cnt} times (need 1); file unchanged", file=sys.stderr)
        sys.exit(1)
    src = src.replace(old, new)

FILE.write_text(src, encoding="utf-8")
print("patched")
