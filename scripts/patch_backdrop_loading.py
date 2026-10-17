#!/usr/bin/env python3
"""BG-LOADING (owner report 2026-10-17: black while loading notes, exams, flashcards; solid panel on the Packages loading screen).

1. Six local-page WebView screens get an onPageStarted that hides the page (alpha 0) until the glass script has run
   (AppBackdrop.clearPageBackground reveals it with a short fade; a 1.5 s safety reveal exists). The native backdrop shows
   meanwhile, so there is no black flash. Screens: NotesReaderScreen, FlashcardsScreen, QuizExamScreen, NativeTutorScreen,
   CompetitionExamScreen, CompetitionReviewView. A file that already has onPageStarted is skipped and reported.
2. MainActivity.kt: the start-up loader overlay was a solid navy (BarBg) fill; it now draws the chosen app background.
Each anchor must match exactly once or that file is not written. Safe to run twice (marker BG-LOADING).
"""
import re
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy")
MARK = "BG-LOADING"
WEB_FILES = [
    "ui/study/NotesReaderScreen.kt",
    "ui/study/FlashcardsScreen.kt",
    "ui/study/QuizExamScreen.kt",
    "ui/study/NativeTutorScreen.kt",
    "ui/competition/CompetitionExamScreen.kt",
    "ui/competition/CompetitionReviewView.kt",
]
PAT = re.compile(
    r"^(?P<ind>[ \t]*)override fun onPageFinished\(view: WebView, url: String\?\) \{\n"
    r"(?P=ind)[ \t]+AppBackdrop\.clearPageBackground\(view\)\n",
    re.M,
)
INSERT = (
    "{ind}// BG-LOADING: hide the page until the glass script has run, the native backdrop shows meanwhile\n"
    "{ind}override fun onPageStarted(view: WebView, url: String?, favicon: android.graphics.Bitmap?) {{\n"
    "{ind}    AppBackdrop.hidePageUntilReady(view)\n"
    "{ind}}}\n\n"
)

LOADER_OLD = (
    "                    val loaderBg = if (isInitialLoading) BarBg else Color.Transparent\n"
    "                    Box(\n"
    "                        modifier = Modifier\n"
    "                            .fillMaxSize()\n"
    "                            .background(loaderBg),\n"
)
LOADER_NEW = (
    "                    // BG-LOADING: the start-up loader draws the chosen app background, not a solid navy fill\n"
    "                    Box(\n"
    "                        modifier = Modifier\n"
    "                            .fillMaxSize()\n"
    "                            .then(if (isInitialLoading) Modifier.appBackdrop() else Modifier),\n"
)


def main() -> int:
    plan = []
    for rel in WEB_FILES:
        p = BASE / rel
        if not p.exists():
            print(f"ERROR: {p} missing; nothing written")
            return 1
        src = p.read_text(encoding="utf-8")
        if MARK in src:
            print(f"{rel}: already patched")
            continue
        if "onPageStarted" in src:
            print(f"{rel}: has its own onPageStarted, SKIPPED (needs a manual line)")
            continue
        ms = list(PAT.finditer(src))
        if len(ms) != 1:
            print(f"ERROR: {rel}: anchor found {len(ms)} times (need 1); nothing written")
            return 1
        m = ms[0]
        out = src[: m.start()] + INSERT.format(ind=m.group("ind")) + src[m.start():]
        plan.append((p, out))
    mp = BASE / "MainActivity.kt"
    ms = mp.read_text(encoding="utf-8")
    if MARK not in ms:
        if ms.count(LOADER_OLD) != 1:
            print(f"ERROR: MainActivity loader anchor found {ms.count(LOADER_OLD)} times; nothing written")
            return 1
        plan.append((mp, ms.replace(LOADER_OLD, LOADER_NEW)))
    for p, out in plan:
        p.write_text(out, encoding="utf-8")
        print(f"patched {p}")
    print("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
