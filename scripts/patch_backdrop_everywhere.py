#!/usr/bin/env python3
"""Make the chosen app background (Dark / BG 1-3 / Blue) show on EVERY screen.

Replaces the solid navy fills in MainActivity.kt with Modifier.appBackdrop()
and makes the WebViews / injected website CSS transparent so the native
backdrop shows through. Idempotent: safe to run twice.
Usage: python3 scripts/patch_backdrop_everywhere.py [path/to/MainActivity.kt]
"""
import sys, re

PATH = sys.argv[1] if len(sys.argv) > 1 else \
    "app/src/main/java/com/wisdomtower/academy/MainActivity.kt"
src = open(PATH, encoding="utf-8").read()
orig = src
counts = {}

def sub(name, old, new):
    global src
    n = src.count(old)
    counts[name] = n
    src = src.replace(old, new)

IMPORT_ANCHOR = "import com.wisdomtower.academy.ui.theme.WisdomNavy\n"
IMPORT_NEW = "import com.wisdomtower.academy.ui.theme.appBackdrop\n"
if IMPORT_NEW not in src:
    assert src.count(IMPORT_ANCHOR) == 1, "import anchor not unique"
    src = src.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + IMPORT_NEW)
    counts["import"] = 1

sub("navy fills", ".background(WisdomNavy)", ".appBackdrop()")
sub("overlay fills", ".background(Color(0xFF060B15))", ".appBackdrop()")
sub("root fill", ".background(BarBg)", ".appBackdrop()")
sub("webview bg", 'setBackgroundColor(AndroidColor.parseColor("#060B15"))',
    "setBackgroundColor(AndroidColor.TRANSPARENT)")
sub("css important", "background-color:#060B15!important",
    "background-color:transparent!important")
sub("js style bg", "style.backgroundColor='#060B15'",
    "style.backgroundColor='transparent'")

if src != orig:
    open(PATH, "w", encoding="utf-8").write(src)

# Same-package theme files: the app root box and the tab layer also painted solid navy.
import os
theme_dir = os.path.join(os.path.dirname(PATH), "ui", "theme")
for fname in ("Theme.kt", "WisdomTabLayer.kt"):
    fp = os.path.join(theme_dir, fname)
    if not os.path.exists(fp):
        print("missing (skipped):", fp)
        continue
    t = open(fp, encoding="utf-8").read()
    n = t.count(".background(WisdomNavy)")
    if n:
        open(fp, "w", encoding="utf-8").write(t.replace(".background(WisdomNavy)", ".appBackdrop()"))
    print(f"{fname}: {n}")
for k, v in counts.items():
    print(f"{k}: {v}")
print("changed" if src != orig else "already patched / nothing to do")
