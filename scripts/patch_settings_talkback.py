#!/usr/bin/env python3
"""S3 part 3: TalkBack roles and spoken states for ui/settings/SettingsScreen.kt (68 KB, too big to resend).

Accessibility only: no text, colour, spacing or logic change.
  - header buttons (Edit Profile, Account), Save Study Goals, Reset 50%, Sync to Cloud, Update Password: Role.Button
  - daily-goal chips, study-window cards, font-size cards: Role.RadioButton + "selected" state
  - accordion headers: Role.Button + spoken "Expanded" / "Collapsed"
  - ToggleRow: the whole row is one switch (Role.Switch, label + state read together); the Switch itself
    no longer handles taps (the row does). No ripple is added, the look is the same.
  - volume slider gets the spoken name "Game audio volume"
  - sync notice, password success and password error boxes are announced when they appear
Safe to run twice (marker check). Every anchor must match the expected number of times, otherwise nothing is written.
"""
import re
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/settings/SettingsScreen.kt")
MARK = "import androidx.compose.foundation.selection.toggleable"

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

RADIO = lambda m: ".semantics { selected = isSelected }" + m.group(1) + ".clickable(role = Role.RadioButton) {" + m.group(1) + m.group(2)
BUTTON = lambda m: ".clickable(role = Role.Button) {"
LIVE = "\n                                    .semantics { liveRegion = LiveRegionMode.Polite }"


def toggle_row(m):
    ws = m.group(2)
    return (m.group(1) + ws +
            ".toggleable(" + ws + "    value = checked," + ws + "    interactionSource = remember { MutableInteractionSource() },"
            + ws + "    indication = null," + ws + "    role = Role.Switch," + ws + "    onValueChange = onCheckedChange" + ws + ")"
            + ws + ".padding(12.dp)")


# (name, regex, replacement (str or function), expected count)
EDITS = [
    ("imports", r"import androidx\.compose\.foundation\.clickable\n",
     lambda m: m.group(0)
     + "import androidx.compose.foundation.selection.toggleable\n"
     + "import androidx.compose.ui.semantics.LiveRegionMode\n"
     + "import androidx.compose.ui.semantics.Role\n"
     + "import androidx.compose.ui.semantics.contentDescription\n"
     + "import androidx.compose.ui.semantics.liveRegion\n"
     + "import androidx.compose.ui.semantics.selected\n"
     + "import androidx.compose.ui.semantics.semantics\n"
     + "import androidx.compose.ui.semantics.stateDescription\n", 1),
    ("header buttons", r'\.clickable \{ onNavigateToUrl\("/account"\) \}',
     lambda m: '.clickable(role = Role.Button) { onNavigateToUrl("/account") }', 2),
    ("goal chips", r"\.clickable \{(\s*)(dailyGoalMinutes = mins)", RADIO, 1),
    ("study windows", r"\.clickable \{(\s*)(studyWindow = id)", RADIO, 2),
    ("font size cards", r"\.clickable \{(\s*)(fontSize = id)", RADIO, 1),
    ("reset 50", r"\.clickable \{(?=\s*soundVolume = 0\.5f)", BUTTON, 1),
    ("save goals", r"\.clickable \{(?=\s*val base = currentProfile\s*if \(!isLoggedIn \|\| base == null\))", BUTTON, 1),
    ("sync", r"\.clickable \{(?=\s*val base = currentProfile\s*if \(isSyncing\))", BUTTON, 1),
    ("update password", r"\.clickable \{(?=\s*if \(passwordBusy\) return@clickable)", BUTTON, 1),
    ("accordion header", r"\.clickable\(onClick = onToggle\)",
     lambda m: '.semantics { stateDescription = if (isExpanded) "Expanded" else "Collapsed" }\n'
               '                    .clickable(role = Role.Button, onClick = onToggle)', 1),
    ("toggle row",
     r"(private fun ToggleRow\([\s\S]*?\.border\(BorderStroke\(1\.dp, WisdomBorderWhite\), RoundedCornerShape\(12\.dp\)\))(\s*)\.padding\(12\.dp\)",
     toggle_row, 1),
    ("switch", r"onCheckedChange = onCheckedChange,(\s*)colors = SwitchDefaults\.colors",
     lambda m: "onCheckedChange = null," + m.group(1) + "colors = SwitchDefaults.colors", 1),
    ("slider", r"(valueRange = 0\.05f\.\.1f,\s*)modifier = Modifier\.weight\(1f\),",
     lambda m: m.group(1) + 'modifier = Modifier.weight(1f).semantics { contentDescription = "Game audio volume" },', 1),
    ("sync notice", r"\.border\(BorderStroke\(1\.dp, tone\.copy\(alpha = 0\.4f\)\), RoundedCornerShape\(10\.dp\)\)",
     lambda m: m.group(0) + LIVE, 1),
    ("password success", r"\.border\(BorderStroke\(1\.dp, WisdomAccentEmerald\.copy\(alpha = 0\.4f\)\), RoundedCornerShape\(10\.dp\)\)",
     lambda m: m.group(0) + LIVE, 1),
    ("password error", r"\.border\(BorderStroke\(1\.dp, WisdomAccentRose\.copy\(alpha = 0\.4f\)\), RoundedCornerShape\(10\.dp\)\)",
     lambda m: m.group(0) + LIVE, 1),
]

for name, pat, rep, want in EDITS:
    found = len(re.findall(pat, src))
    if found != want:
        print(f"ERROR: anchor '{name}' found {found} times (need {want}); file not changed")
        sys.exit(1)
    src = re.sub(pat, rep, src)

FILE.write_text(src, encoding="utf-8")
print("patched: %d edits" % len(EDITS))
