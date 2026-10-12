#!/usr/bin/env python3
"""T1: Tool overlay back navigation and phone Back button priority fix.

Goals:
  - Phone Back button closes the active study tool overlay first before deeper
    screens (StudyWorkspaceScreen, QuizExamScreen) receive Back.
  - Native drawer screens (About, FAQ, Contact, Privacy, Terms) close on phone Back
    before the workspace/course closes.
  - Root BackHandler order updated so drawer screens are closed before closing
    the active workspace.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "T1: tool overlay and drawer screens have local BackHandler"

if not FILE.exists():
    print(f"ERROR: {FILE} does not exist", file=sys.stderr)
    sys.exit(1)

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

edits = [
    # 1. Root BackHandler order: activeDrawerScreen checked before activeWorkspace
    (
        '''        if (activeWorkspace != null) {
            activeWorkspace = null
            return@BackHandler
        }
        if (selectedPackage != null) {
            selectedPackage = null
            return@BackHandler
        }
        if (activeStudyUrl != null) {
            activeStudyUrl = null
            return@BackHandler
        }
        if (activeGuideSlug != null) {
            activeGuideSlug = null
            return@BackHandler
        }
        if (showNotifications) { // P15-native-notifications
            showNotifications = false
            return@BackHandler
        }
        if (activeDrawerScreen != null) {
            activeDrawerScreen = null
            return@BackHandler
        }''',
        '''        // T1: Drawer screens (About, Contact, FAQ, etc.) close before the active workspace
        if (activeDrawerScreen != null) {
            activeDrawerScreen = null
            return@BackHandler
        }
        if (activeWorkspace != null) {
            activeWorkspace = null
            return@BackHandler
        }
        if (selectedPackage != null) {
            selectedPackage = null
            return@BackHandler
        }
        if (activeStudyUrl != null) {
            activeStudyUrl = null
            return@BackHandler
        }
        if (activeGuideSlug != null) {
            activeGuideSlug = null
            return@BackHandler
        }
        if (showNotifications) { // P15-native-notifications
            showNotifications = false
            return@BackHandler
        }'''
    ),

    # 2. Local BackHandler in activeDrawerScreen UI block
    (
        '''                // Native Drawer Screens (About, Contact, FAQ, Privacy, Terms)
                // U1 Option A: raised to zIndex 25f so they open above StudyWorkspaceScreen (18f)
                if (activeDrawerScreen != null) {''',
        '''                // Native Drawer Screens (About, Contact, FAQ, Privacy, Terms)
                // U1 Option A: raised to zIndex 25f so they open above StudyWorkspaceScreen (18f)
                if (activeDrawerScreen != null) {
                    BackHandler(enabled = true) { activeDrawerScreen = null }'''
    ),

    # 3. Local BackHandler in activeStudyTool UI overlay block
    (
        '''                // Native Global Study Tools Overlays (U1 Option A: accessible from any screen at zIndex 120f)
                val currentTool = activeStudyTool
                if (currentTool != null) {''',
        '''                // Native Global Study Tools Overlays (U1 Option A: accessible from any screen at zIndex 120f)
                // T1: tool overlay and drawer screens have local BackHandler
                val currentTool = activeStudyTool
                if (currentTool != null) {
                    BackHandler(enabled = true) { activeStudyTool = null }'''
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
