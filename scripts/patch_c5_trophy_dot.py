#!/usr/bin/env python3
"""C5 slice 3 (competition space): a small red dot on the top-bar trophy when the server says a contest is new
to this student (`unseen` in list_competitions). The trophy Icon is replaced by the composable
`CompetitionTrophyIcon` (new file `ui/competition/CompetitionTrophyIcon.kt`), which draws the same icon and
the dot and asks the server itself (on sign-in, whenever `showCompetitions` changes, and every 2 minutes).

What it does to MainActivity.kt (one exact anchor, must match exactly once, safe to run twice):
 - replaces the 6-line `Icon(... Icons.Filled.EmojiEvents ...)` block inside the trophy IconButton with a call
   to com.wisdomtower.academy.ui.competition.CompetitionTrophyIcon (fully qualified, so no import is needed)
If the anchor fails nothing is written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "C5-trophy-dot"

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

A_ICON = ("                                Icon(\n"
          "                                    imageVector = Icons.Filled.EmojiEvents,\n"
          "                                    contentDescription = \"Competitions\",\n"
          "                                    tint = Accent,\n"
          "                                    modifier = Modifier.size(22.dp)\n"
          "                                )\n")

n = src.count(A_ICON)
if n != 1:
    print(f"ERROR: trophy icon anchor found {n} times (need exactly 1); file not changed")
    sys.exit(1)

NEW = ("                                // " + MARK + ": same trophy icon, plus a red dot while a contest is new to the student\n"
       "                                com.wisdomtower.academy.ui.competition.CompetitionTrophyIcon(\n"
       "                                    tint = Accent,\n"
       "                                    refreshKey = showCompetitions\n"
       "                                )\n")

out = src.replace(A_ICON, NEW)
if out.count(MARK) != 1 or out.count("CompetitionTrophyIcon(") != 1:
    print("ERROR: sanity check failed; file not changed")
    sys.exit(1)
FILE.write_text(out, encoding="utf-8")
print("patched")
