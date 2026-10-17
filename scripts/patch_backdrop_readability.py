#!/usr/bin/env python3
"""BG-READ (owner order 2026-10-17: text in the drawer mixes with the cards behind it; raise pop-up / overlay opacity slightly).

Edits MainActivity.kt only, by exact anchors (each must match exactly once, otherwise NOTHING is written):
 - drawer panel gradient: 40 percent (0x66) to 85 percent (0xD9)
 - dim behind the drawer: 40 percent (0x66) to 55 percent (0x8C)
 - bottom navigation glass track: white 6 percent to 9 percent (glass strengths raised together, owner: slightly, everywhere)
Safe to run twice (marker BG-READ). To undo: set the values back to 0x66 / 0x66 / 0x66 / 0.06f.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "BG-READ"
EDITS = [
    ("drawer scrim",
     "                    .background(Color(0x66030812))\n",
     "                    .background(Color(0x8C030812)) // BG-READ: slightly stronger dim behind the drawer\n"),
    ("drawer panel",
     "                                listOf(Color(0x66152238), Color(0x660D1829))\n",
     "                                listOf(Color(0xD9152238), Color(0xD90D1829)) // BG-READ: 85 percent so text does not mix with what is behind\n"),
    ("nav track",
     "                .background(Color.White.copy(alpha = 0.06f)) // BG-NAV: glass track, no outline, no glow\n",
     "                .background(Color.White.copy(alpha = 0.09f)) // BG-NAV: glass track, no outline, no glow (BG-READ: 9 percent)\n"),
]

def main() -> int:
    src = FILE.read_text(encoding="utf-8")
    if MARK in src:
        print("already patched, nothing to do")
        return 0
    out = src
    for name, anchor, repl in EDITS:
        n = out.count(anchor)
        if n != 1:
            print(f"ERROR: anchor '{name}' found {n} times (need exactly 1); file not changed")
            return 1
        out = out.replace(anchor, repl)
    if out.count("{") - out.count("}") != src.count("{") - src.count("}"):
        print("ERROR: braces unbalanced; file not changed")
        return 1
    FILE.write_text(out, encoding="utf-8")
    print(f"patched ({len(EDITS)} edits)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
