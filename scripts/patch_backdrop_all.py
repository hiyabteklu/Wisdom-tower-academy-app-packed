#!/usr/bin/env python3
"""Make the chosen app background show on EVERY screen, tools and forms included. No exceptions.

One run does everything:
  1. runs scripts/patch_backdrop_everywhere.py (overlay layers, tabs, root, WebViews in MainActivity.kt,
     Theme.kt, WisdomTabLayer.kt). It is idempotent, so running it again is harmless.
  2. tools: the solid or 85 percent outer panels of Calculator, Planner (also its time gutter and the small
     panel behind the grid), Timer, Notebook, Targets and Status become glass (white 4 percent).
  3. forms: text-field containers (Settings, Account, Drawer / Contact, Guides search), the Account panel and
     the Forgot-password card become glass (white 6 percent, card gradient white 7 to 3 percent).

Left opaque on purpose: dialogs, drop-down menus and the PDF page badge (they float above the page and must
stay readable). Idempotent: safe to run twice. A string that is not found is printed as MISSING; it is not an error.
Usage (from the repo root): python3 scripts/patch_backdrop_all.py
"""
import os
import runpy
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
os.chdir(ROOT)

BASE = os.path.join(HERE, "patch_backdrop_everywhere.py")
sys.argv = [BASE]
runpy.run_path(BASE, run_name="__main__")

UI = "app/src/main/java/com/wisdomtower/academy/ui/"
GLASS4 = "Color.White.copy(alpha = 0.04f)"
GLASS6 = "Color.White.copy(alpha = 0.06f)"

# (file, old, new)
EDITS = [
    # ---- tools: outer panels
    (UI + "study/NativeCalculatorScreen.kt", ".background(Color(0xFF0A1122))", ".background(" + GLASS4 + ")"),
    (UI + "study/NativePlannerScreen.kt", ".background(Color(0xFF0A1122))", ".background(" + GLASS4 + ")"),
    (UI + "study/NativePlannerScreen.kt", ".background(Color(0xFF070E1C))", ".background(" + GLASS4 + ")"),
    (UI + "study/NativeTimerScreen.kt", ".background(Color(0xFF0F172A))", ".background(" + GLASS4 + ")"),
    (UI + "study/NativeNotebookScreen.kt", ".background(Color(0xFF0C1626).copy(alpha = 0.85f))", ".background(" + GLASS4 + ")"),
    (UI + "study/NativeTargetsScreen.kt", ".background(Color(0xFF0C1626).copy(alpha = 0.85f))", ".background(" + GLASS4 + ")"),
    (UI + "study/NativeStatusScreen.kt", ".background(StPanelBg.copy(alpha = 0.85f))", ".background(" + GLASS4 + ")"),
    # ---- forms: text-field containers and panels
    (UI + "theme/WisdomFieldTokens.kt", "if (AppThemeMode.isDark) Color(0xFF0F1829) else", "if (AppThemeMode.isDark) " + GLASS6 + " else"),
    (UI + "settings/SettingsScreen.kt", "edContainerColor = Color(0xFF0F1829)", "edContainerColor = " + GLASS6),
    (UI + "account/AccountScreen.kt", "edContainerColor = Color(0xFF0F1829)", "edContainerColor = " + GLASS6),
    (UI + "account/AccountScreen.kt", ".background(Color(0xFF0F1829))", ".background(" + GLASS6 + ")"),
    (UI + "drawer/DrawerScreens.kt", "edContainerColor = Color(0xFF0F172A)", "edContainerColor = " + GLASS6),
    (UI + "guides/GuidesScreen.kt", "edContainerColor = Color(0xFF0F172A)", "edContainerColor = " + GLASS6),
    (UI + "auth/ForgotPasswordScreen.kt",
     "listOf(Color(0xFF131F38), Color(0xFF0E172A), Color(0xFF0A101D))",
     "listOf(Color.White.copy(alpha = 0.07f), Color.White.copy(alpha = 0.04f), Color.White.copy(alpha = 0.03f))"),
]

print("---- tools and forms ----")
for path, old, new in EDITS:
    if not os.path.exists(path):
        print("MISSING FILE:", path)
        continue
    with open(path, encoding="utf-8") as f:
        text = f.read()
    n = text.count(old)
    if n:
        with open(path, "w", encoding="utf-8") as f:
            f.write(text.replace(old, new))
        print("patched %d x  %s  [%s]" % (n, os.path.basename(path), old[:48]))
    elif new in text:
        print("already done  %s  [%s]" % (os.path.basename(path), old[:48]))
    else:
        print("MISSING string  %s  [%s]" % (os.path.basename(path), old[:48]))
print("done")
