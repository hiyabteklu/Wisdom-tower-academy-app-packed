#!/usr/bin/env python3
"""C4 (competition space): the top-bar Refresh button becomes a trophy button, and Refresh moves
into the drawer between the TOOLS group and the SUPPORT & ABOUT group (owner Q6, 2026-10-14).

What it does to MainActivity.kt (exact anchors, each must match exactly once, safe to run twice):
 1. imports EmojiEvents and CompetitionsHubScreen
 2. adds state `showCompetitions` and clears it in resetOverlays and in the back handler
 3. hoists the existing refresh logic UNCHANGED into a local fun `performHardRefresh()`
    (only `return@IconButton` becomes `return`)
 4. replaces the top-bar Refresh IconButton with a trophy IconButton that opens the competitions screen
 5. adds a "Refresh" row to the drawer, between TOOLS and SUPPORT & ABOUT, calling performHardRefresh()
 6. mounts CompetitionsHubScreen as an overlay next to the notifications overlay
If ANY anchor fails nothing is written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "C4-competitions-trophy"

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do"); sys.exit(0)

errors = []

def once(text, anchor, label):
    n = text.count(anchor)
    if n != 1:
        errors.append(f"{label}: anchor found {n} times (need exactly 1)")
        return False
    return True

# ---- 1. imports
A_IMPORT_REFRESH = "import androidx.compose.material.icons.filled.Refresh\n"
A_IMPORT_ABOUT = "import com.wisdomtower.academy.ui.drawer.AboutScreen\n"
# ---- 2. state / reset / back
A_STATE = "    var showNotifications by remember { mutableStateOf(false) } // P15-native-notifications\n"
A_RESET = "        showNotifications = false // P15-native-notifications\n        closeToolOverlay()\n"
A_BACK = "        if (showNotifications) { // P15-native-notifications\n            showNotifications = false\n            return@BackHandler\n        }\n"
# ---- 3. hoist point (start of the root Box of MainScreen's UI)
A_HOIST = "    Box(\n        modifier = Modifier\n            .fillMaxSize()\n            .background(BarBg)\n    ) {\n        com.wisdomtower.academy.ui.theme.AtmosphereBackground(modifier = Modifier.fillMaxSize())\n        Scaffold(\n"
# ---- 4. top bar refresh button (start .. end)
A_TB_START = ("                            IconButton(\n"
              "                                onClick = {\n"
              "                                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)\n"
              "                                    // S12-P3: a native screen covers the WebView, so refresh the native data\n")
A_TB_END = ("                                Icon(\n"
            "                                    imageVector = Icons.Filled.Refresh,\n"
            "                                    contentDescription = \"Refresh\",\n"
            "                                    tint = Accent,\n"
            "                                    modifier = Modifier.size(22.dp)\n"
            "                                )\n"
            "                            }\n")
A_TB_BODY_END = "                                },\n                                modifier = Modifier.size(44.dp)\n                            ) {\n"
# ---- 5. drawer
A_DRAWER = ("                            Spacer(modifier = Modifier.height(4.dp))\n\n"
            "                            Text(\n"
            "                                text = \"SUPPORT & ABOUT\",\n")
# ---- 6. overlay
A_OVERLAY = "                // P15-native-notifications: native notifications screen (bell)\n                if (showNotifications) {\n"

for a, l in [(A_IMPORT_REFRESH, "import Refresh"), (A_IMPORT_ABOUT, "import About"), (A_STATE, "state"),
             (A_RESET, "resetOverlays"), (A_BACK, "back handler"), (A_HOIST, "hoist point"),
             (A_TB_START, "top bar start"), (A_TB_END, "top bar end"), (A_DRAWER, "drawer"), (A_OVERLAY, "overlay")]:
    once(src, a, l)
if src.count("import androidx.compose.material.icons.filled.EmojiEvents\n") != 0:
    errors.append("EmojiEvents import already present")
if errors:
    print("ERROR, file not changed:"); [print(" -", e) for e in errors]; sys.exit(1)

# --- extract the existing refresh lambda body (kept unchanged)
s = src.index(A_TB_START)
e_icon = src.index(A_TB_END, s) + len(A_TB_END)
block = src[s:e_icon]
body_start = block.index("                                    // S12-P3")
body_end = block.index(A_TB_BODY_END)
body = block[body_start:body_end]
if "Icons.Filled.Refresh" not in block or block.count("IconButton(") != 1:
    print("ERROR: unexpected top bar block shape; file not changed"); sys.exit(1)
lines = body.split("\n")
fun_lines = []
for ln in lines:
    ln = ln.replace("return@IconButton", "return")
    fun_lines.append(ln[28:] if ln.startswith(" " * 28) else ln)   # dedent 36 -> 8 spaces
fun_body = "\n".join(fun_lines).rstrip() + "\n"
hoisted = ("    // " + MARK + ": the hard-refresh logic that used to live in the top-bar button (unchanged), now shared with the drawer row\n"
           "    fun performHardRefresh() {\n" + fun_body + "    }\n\n")

trophy = ("                            IconButton(\n"
          "                                onClick = {\n"
          "                                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)\n"
          "                                    // " + MARK + ": trophy opens the competitions screen\n"
          "                                    resetOverlays()\n"
          "                                    showCompetitions = true\n"
          "                                },\n"
          "                                modifier = Modifier.size(44.dp)\n"
          "                            ) {\n"
          "                                Icon(\n"
          "                                    imageVector = Icons.Filled.EmojiEvents,\n"
          "                                    contentDescription = \"Competitions\",\n"
          "                                    tint = Accent,\n"
          "                                    modifier = Modifier.size(22.dp)\n"
          "                                )\n"
          "                            }\n")

drawer_rows = ("                            Spacer(modifier = Modifier.height(4.dp))\n\n"
               "                            DrawerCompactRow(\n"
               "                                icon = Icons.Filled.Refresh,\n"
               "                                label = \"Refresh\",\n"
               "                                onClick = {\n"
               "                                    menuExpanded = false\n"
               "                                    performHardRefresh()\n"
               "                                }\n"
               "                            )\n\n"
               "                            Spacer(modifier = Modifier.height(8.dp))\n"
               "                            Box(\n"
               "                                modifier = Modifier\n"
               "                                    .fillMaxWidth()\n"
               "                                    .height(1.dp)\n"
               "                                    .background(CardBorderSubtle)\n"
               "                            )\n"
               "                            Spacer(modifier = Modifier.height(4.dp))\n\n"
               "                            Text(\n"
               "                                text = \"SUPPORT & ABOUT\",\n")

overlay = ("                // " + MARK + ": native competitions screen (trophy)\n"
           "                if (showCompetitions) {\n"
           "                    CompetitionsHubScreen(\n"
           "                        onBack = { showCompetitions = false },\n"
           "                        modifier = Modifier\n"
           "                            .fillMaxSize()\n"
           "                            .background(WisdomNavy)\n"
           "                            .zIndex(17f)\n"
           "                    )\n"
           "                }\n\n")

out = src
out = out.replace(block, trophy)
out = out.replace(A_IMPORT_REFRESH, A_IMPORT_REFRESH + "import androidx.compose.material.icons.filled.EmojiEvents\n")
out = out.replace(A_IMPORT_ABOUT, A_IMPORT_ABOUT + "import com.wisdomtower.academy.ui.competition.CompetitionsHubScreen\n")
out = out.replace(A_STATE, A_STATE + "    var showCompetitions by remember { mutableStateOf(false) } // " + MARK + "\n")
out = out.replace(A_RESET, "        showNotifications = false // P15-native-notifications\n        showCompetitions = false // " + MARK + "\n        closeToolOverlay()\n")
out = out.replace(A_BACK, "        if (showCompetitions) { // " + MARK + "\n            showCompetitions = false\n            return@BackHandler\n        }\n" + A_BACK)
out = out.replace(A_HOIST, hoisted + A_HOIST)
out = out.replace(A_DRAWER, drawer_rows)
out = out.replace(A_OVERLAY, overlay + A_OVERLAY)

# sanity: each new thing exactly where expected
checks = {"performHardRefresh()": 2, "showCompetitions = true": 1, "Icons.Filled.EmojiEvents": 1}
for k, v in checks.items():
    if out.count(k) < v:
        print(f"ERROR: sanity check failed for {k}; file not changed"); sys.exit(1)
if "return@IconButton" in hoisted:
    print("ERROR: leftover return@IconButton in hoisted fun; file not changed"); sys.exit(1)
FILE.write_text(out, encoding="utf-8")
print("patched")
