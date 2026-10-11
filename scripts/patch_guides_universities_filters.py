#!/usr/bin/env python3
"""P6: Universities guide, three small gaps against the website page
website-reference/src/app/academy/universities/page.tsx.

The website shows three header chips ("N Institutions", "M In-Depth Guides", "All Ethiopian Regions")
and a "Detailed Guides" filter button (universities whose data has detailed = true). The native screen
only had the first chip and no such filter.

Edits (GuidesScreen.kt is 70 KB, so this is done by exact anchors, not by resending the file):
  GuidesData.kt   : new field UniversityDetail.detailed, read from the packed JSON key "detailed".
  GuidesScreen.kt : state detailedOnly, filter on it, the three chips, the "Detailed Guides" chip.
Each anchor must match exactly once, otherwise nothing is changed. Safe to run twice.
"""
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy/ui/guides")

DATA = BASE / "GuidesData.kt"
SCREEN = BASE / "GuidesScreen.kt"

DATA_MARK = "val detailed: Boolean = false"
SCREEN_MARK = "detailedOnly"

# (anchor, replacement)
DATA_EDITS = [
    (
        "    val knownFor: List<String> = emptyList()\n)",
        "    val knownFor: List<String> = emptyList(),\n    val detailed: Boolean = false\n)",
    ),
    (
        "                            knownFor = known\n",
        "                            knownFor = known,\n"
        "                            detailed = u.optBoolean(\"detailed\", false)\n",
    ),
]

SCREEN_EDITS = [
    (
        "    var showNbCard by remember { mutableStateOf(false) }\n",
        "    var showNbCard by remember { mutableStateOf(false) }\n"
        "    var detailedOnly by remember { mutableStateOf(false) }\n",
    ),
    (
        "    val filteredList = remember(searchQuery, selectedRegion, featuredOnly, universities) {\n",
        "    val filteredList = remember(searchQuery, selectedRegion, featuredOnly, detailedOnly, universities) {\n",
    ),
    (
        "            if (featuredOnly && !u.featured) return@filter false\n",
        "            if (featuredOnly && !u.featured) return@filter false\n"
        "            if (detailedOnly && !u.detailed) return@filter false\n",
    ),
    (
        "        FactBadge(label = \"${universities.size} Institutions\")\n",
        "        val detailedCount = remember(universities) { universities.count { it.detailed } }\n"
        "        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {\n"
        "            item(key = \"count_institutions\") { FactBadge(label = \"${universities.size} Institutions\") }\n"
        "            item(key = \"count_detailed\") { FactBadge(label = \"$detailedCount In-Depth Guides\") }\n"
        "            item(key = \"count_regions\") { FactBadge(label = \"All Ethiopian Regions\") }\n"
        "        }\n",
    ),
    (
        "            items(regions) { reg ->\n",
        "            item(key = \"detailed_chip\") {\n"
        "                FilterChip(label = \"Detailed Guides\", selected = detailedOnly, accent = WisdomAccentViolet) {\n"
        "                    detailedOnly = !detailedOnly\n"
        "                }\n"
        "            }\n"
        "            items(regions) { reg ->\n",
    ),
]


def plan(path, mark, edits):
    """Return new text, or None if already patched. Exit with an error if an anchor is not unique."""
    src = path.read_text(encoding="utf-8")
    if mark in src:
        print(f"{path.name}: already patched, nothing to do")
        return None
    for anchor, _ in edits:
        n = src.count(anchor)
        if n != 1:
            print(f"ERROR in {path.name}: anchor found {n} times (need exactly 1): {anchor!r}")
            print("Nothing was changed.")
            sys.exit(1)
    for anchor, repl in edits:
        src = src.replace(anchor, repl)
    return src


new_data = plan(DATA, DATA_MARK, DATA_EDITS)
new_screen = plan(SCREEN, SCREEN_MARK, SCREEN_EDITS)

if new_data is not None:
    DATA.write_text(new_data, encoding="utf-8")
    print(f"{DATA.name}: patched")
if new_screen is not None:
    SCREEN.write_text(new_screen, encoding="utf-8")
    print(f"{SCREEN.name}: patched")
