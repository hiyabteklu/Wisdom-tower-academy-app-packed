#!/usr/bin/env python3
"""Open the ECE root path natively (offline) from every entry point.

In MainActivity.kt, handleGlobalNav only matches catalog package paths. The website ECE root
(/academy/special-packages/electrical-computer-engineering) is not one, so it fell through to the
website (online only). This adds the root path to the catalog match so it opens package ece-y3-sem-1
(the native screen that shows both semesters). Each anchor must match exactly once. Safe to run twice.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
ANCHOR = "                it.path.equals(pathPart, ignoreCase = true) ||\n"
MARK = "electrical-computer-engineering\", ignoreCase = true) && it.id == \"ece-y3-sem-1\""
ADD = (
    "                (pathPart.trimEnd('/').equals(\"/academy/special-packages/electrical-computer-engineering\", ignoreCase = true) "
    "&& it.id == \"ece-y3-sem-1\") ||\n"
)

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)
n = src.count(ANCHOR)
if n != 1:
    print(f"ERROR: anchor found {n} times (need exactly 1); file not changed")
    sys.exit(1)
FILE.write_text(src.replace(ANCHOR, ANCHOR + ADD), encoding="utf-8")
print("patched handleGlobalNav: ECE root path now opens native package ece-y3-sem-1")
