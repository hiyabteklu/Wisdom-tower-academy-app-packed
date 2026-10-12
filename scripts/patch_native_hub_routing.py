#!/usr/bin/env python3
"""P13: website-style hub links (for example /academy/freshman/physics/life-savers) open the NATIVE hub list.

Before: handleGlobalNav in MainActivity.kt sent every URL ending in a hub id to the website page in the WebView.
After: when the path ends with a hub id and is a course page the native screens can read (contentScopePath),
the router opens the native StudyWorkspaceScreen for that course; StudyWorkspaceScreen then opens the hub list
straight away (it reads the hub id at the end of the path). Anchors must match exactly once; safe to run twice.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
WS_FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/study/StudyWorkspaceScreen.kt")
MARK = "P13-native-hub-routing"
WS_MARK = "P13 initial hub"
WS_ANCHOR = """    if (entranceUrl != null) {
        LaunchedEffect(entranceUrl) {
            onOpenHub("exams", entranceUrl)
        }
    }
"""
WS_ADD = """
    // P13 initial hub: a link that ends with a hub id (for example .../physics/life-savers) opens that native
    // hub list straight away, once the access check says the course is open. Back returns to the six cards.
    val initialHub = remember(basePath) {
        cleanBase(basePath).substringAfterLast('/')
            .takeIf { it in NATIVE_HUB_IDS && contentScope != null && entranceUrl == null }
    }
    var initialHubHandled by remember(basePath) { mutableStateOf(false) }
    LaunchedEffect(basePath, access.gate) {
        if (initialHub != null && !initialHubHandled && access.gate == HubGate.Open) {
            initialHubHandled = true
            view = WorkspaceView.HubList(initialHub)
        }
    }
"""

IMPORT_ANCHOR = "import com.wisdomtower.academy.ui.study.StudyWorkspaceScreen\n"
IMPORT_ADD = "import com.wisdomtower.academy.ui.study.contentScopePath\n"

ANCHOR = '                if (fullUrl.contains("/books") || fullUrl.contains("/short-notes") || fullUrl.contains("/flashcards") || fullUrl.contains("/question-banks") || fullUrl.contains("/exams") || fullUrl.contains("/life-savers")) {\n'
NEW = '''                // P13-native-hub-routing: a course hub link opens the native hub list, not the website page
                val hubPathClean = pathPart.substringBefore('?').substringBefore('#').trimEnd('/')
                val hubLast = hubPathClean.substringAfterLast('/')
                if (hubLast in setOf("books", "life-savers", "short-notes", "flashcards", "question-banks", "exams") &&
                    contentScopePath(hubPathClean) != null
                ) {
                    val slug = hubPathClean.substringBeforeLast('/').substringAfterLast('/')
                    val courseTitle = slug.split('-').filter { it.isNotEmpty() }
                        .joinToString(" ") { part -> part.replaceFirstChar { it.uppercase() } }
                    activeWorkspace = Triple(courseTitle, "Academy", hubPathClean)
                } else if (fullUrl.contains("/books") || fullUrl.contains("/short-notes") || fullUrl.contains("/flashcards") || fullUrl.contains("/question-banks") || fullUrl.contains("/exams") || fullUrl.contains("/life-savers")) {
'''

src = FILE.read_text(encoding="utf-8")
ws = WS_FILE.read_text(encoding="utf-8")
if MARK in src and WS_MARK in ws:
    print("already patched, nothing to do"); sys.exit(0)
if (MARK in src) != (WS_MARK in ws):
    print("ERROR: only one of the two files is patched; fix by hand, nothing changed"); sys.exit(1)
for name, text, a in (("import", src, IMPORT_ANCHOR), ("router", src, ANCHOR), ("workspace", ws, WS_ANCHOR)):
    n = text.count(a)
    if n != 1:
        print(f"ERROR: {name} anchor found {n} times (need exactly 1); nothing changed"); sys.exit(1)
src = src.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + IMPORT_ADD).replace(ANCHOR, NEW)
ws = ws.replace(WS_ANCHOR, WS_ANCHOR + WS_ADD)
FILE.write_text(src, encoding="utf-8")
WS_FILE.write_text(ws, encoding="utf-8")
print("patched both files")
