#!/usr/bin/env python3
"""BG-NAV + BG-NAMES (docs/SESSION_2026-10-17_BG_WEB_AND_NATIVE_SWEEP.md, owner: background literally everywhere).

1. Bottom navigation (MainActivity.kt, AliveBottomNav): the track loses its navy gradient, its cyan outline ("the road")
   and its glow shadow and becomes see-through white 6 percent glass. The approved pill, labels and animation are NOT touched.
2. Named navy fills the first sweep could not see (they are `private val Name = Color(0xFF...)`): CardSurface, StPanelBg,
   RulesNavy, OnboardCard get alpha 0x66 (40 percent), DialogBg (the exit dialog) gets 0xB3 (70 percent); every
   `StPanelBg.copy(alpha = 0.xx)` becomes 0.40. BarBg, OnboardBg and the text colours are left alone on purpose.
Anchors are exact; a block that is not found is reported and skipped, nothing else is changed. Safe to run twice.
"""
import re
from pathlib import Path

ROOT = Path("app/src/main/java")
MAIN = ROOT / "com/wisdomtower/academy/MainActivity.kt"

NAV_OLD = (
    "                .shadow(\n"
    "                    elevation = 14.dp,\n"
    "                    shape = trackShape,\n"
    "                    ambientColor = Accent.copy(alpha = 0.25f),\n"
    "                    spotColor = Accent.copy(alpha = 0.25f)\n"
    "                )\n"
    "                .clip(trackShape)\n"
    "                .background(Brush.verticalGradient(listOf(NavTrackTop, NavTrackBottom)))\n"
    "                .border(BorderStroke(1.dp, CardBorder), trackShape)\n"
)
NAV_NEW = (
    "                .clip(trackShape)\n"
    "                .background(Color.White.copy(alpha = 0.06f)) // BG-NAV: glass track, no outline, no glow\n"
)

report = []

if MAIN.exists():
    t = MAIN.read_text(encoding="utf-8")
    if NAV_NEW in t:
        report.append("nav: already patched")
    elif t.count(NAV_OLD) == 1:
        MAIN.write_text(t.replace(NAV_OLD, NAV_NEW), encoding="utf-8")
        report.append("nav: track is glass now")
    else:
        report.append(f"nav: MISSING (anchor found {t.count(NAV_OLD)} times), not changed")
else:
    report.append("nav: MainActivity.kt not found")

ALPHA = {"CardSurface": "66", "StPanelBg": "66", "RulesNavy": "66", "OnboardCard": "66", "DialogBg": "B3"}
DEF = re.compile(r"(private val (" + "|".join(ALPHA) + r")\s*(?::\s*Color\s*)?=\s*)Color\(0xFF([0-9A-Fa-f]{6})\)")
COPY = re.compile(r"\bStPanelBg\.copy\(alpha = 0\.\d+f\)")
n_def = n_copy = 0
for p in sorted(ROOT.rglob("*.kt")):
    t = p.read_text(encoding="utf-8")
    new = DEF.sub(lambda m: f"{m.group(1)}Color(0x{ALPHA[m.group(2)]}{m.group(3).upper()})", t)
    d = len(DEF.findall(t))
    new, c = COPY.subn("StPanelBg.copy(alpha = 0.40f)", new)
    if new != t:
        p.write_text(new, encoding="utf-8")
    n_def += d
    n_copy += c
report.append(f"names: {n_def} definition(s) made see-through, {n_copy} StPanelBg.copy(...) set to 0.40")
print("; ".join(report))
