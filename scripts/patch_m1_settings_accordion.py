#!/usr/bin/env python3
"""M1 (docs/UI_MOTION_PLAN.md): Settings cards open and close smoothly like the Account section.
Only motion; no text, layout or colour decision changes.
1. SettingsAccordionCard: the body used a plain `if (isExpanded)` (instant). Now WisdomExpandable (expand + fade, quicker close).
2. The chevron rotates 180 degrees (spring) and, with the card edge, turns cyan while the card is open.
3. The selection chips (study minutes, study window, font size) fade between selected / not selected colours.
Needs ui/theme/WisdomMotion.kt (WisdomExpandable, wisdomAnimatedColor). Every anchor must match the expected number of
times or NOTHING is written. Safe to run twice."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/settings/SettingsScreen.kt")
MARK = "accordionChevronTint"

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

edits = []  # (label, old, new, expected_count)


def add(label, old, new, count=1):
    edits.append((label, old, new, count))


add(
    "imports",
    "import androidx.compose.foundation.BorderStroke\n",
    "import androidx.compose.animation.animateColorAsState\n"
    "import androidx.compose.animation.core.animateFloatAsState\n"
    "import androidx.compose.animation.core.spring\n"
    "import androidx.compose.animation.core.tween\n"
    "import androidx.compose.ui.draw.rotate\n"
    "import androidx.compose.foundation.BorderStroke\n",
)
add(
    "theme imports",
    "import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan\n",
    "import com.wisdomtower.academy.ui.theme.WisdomDarkOnCyan\n"
    "import com.wisdomtower.academy.ui.theme.WisdomExpandable\n"
    "import com.wisdomtower.academy.ui.theme.wisdomAnimatedColor\n",
)
add(
    "card start",
    "    WisdomGlassCard(\n        modifier = Modifier.fillMaxWidth(),\n        cornerRadius = 16.dp,\n"
    "        borderColor = WisdomBorderWhite\n    ) {\n        Column(modifier = Modifier.fillMaxWidth()) {\n",
    "    val edge by animateColorAsState(\n"
    "        targetValue = if (isExpanded) WisdomCyan.copy(alpha = 0.4f) else WisdomBorderWhite,\n"
    "        animationSpec = tween(240),\n        label = \"accordionEdge\"\n    )\n"
    "    val accordionChevronTint by animateColorAsState(\n"
    "        targetValue = if (isExpanded) WisdomCyan else WisdomMuted,\n"
    "        animationSpec = tween(240),\n        label = \"accordionChevronTintAnim\"\n    )\n"
    "    val chevronAngle by animateFloatAsState(\n"
    "        targetValue = if (isExpanded) 180f else 0f,\n"
    "        animationSpec = spring(dampingRatio = 0.8f, stiffness = 400f),\n        label = \"accordionChevron\"\n    )\n"
    "    WisdomGlassCard(\n        modifier = Modifier.fillMaxWidth(),\n        cornerRadius = 16.dp,\n"
    "        borderColor = edge\n    ) {\n        Column(modifier = Modifier.fillMaxWidth()) {\n",
)
add(
    "chevron",
    "                    imageVector = Icons.Default.KeyboardArrowDown,\n                    contentDescription = null,\n"
    "                    tint = WisdomMuted,\n                    modifier = Modifier.size(20.dp)\n",
    "                    imageVector = Icons.Default.KeyboardArrowDown,\n                    contentDescription = null,\n"
    "                    tint = accordionChevronTint,\n                    modifier = Modifier.size(20.dp).rotate(chevronAngle)\n",
)
add(
    "body",
    "            if (isExpanded) {\n                Box(\n",
    "            WisdomExpandable(visible = isExpanded) {\n                Box(\n",
)
# chips: study minutes + font size share these two lines
add(
    "chip fill white",
    ".background(if (isSelected) Color.White else Color.White.copy(alpha = 0.04f))",
    ".background(wisdomAnimatedColor(isSelected, Color.White, Color.White.copy(alpha = 0.04f)))",
    2,
)
add(
    "minutes border",
    ".border(BorderStroke(1.dp, if (isSelected) Color.White else WisdomBorderWhite), RoundedCornerShape(10.dp))",
    ".border(BorderStroke(1.dp, wisdomAnimatedColor(isSelected, Color.White, WisdomBorderWhite)), RoundedCornerShape(10.dp))",
)
add(
    "font border",
    ".border(BorderStroke(1.dp, if (isSelected) Color.White else WisdomBorderWhite), RoundedCornerShape(12.dp))",
    ".border(BorderStroke(1.dp, wisdomAnimatedColor(isSelected, Color.White, WisdomBorderWhite)), RoundedCornerShape(12.dp))",
)
add(
    "window fill",
    ".background(if (isSelected) Color.White.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f))",
    ".background(wisdomAnimatedColor(isSelected, Color.White.copy(alpha = 0.15f), Color.White.copy(alpha = 0.03f)))",
    2,
)
add(
    "window border",
    ".border(BorderStroke(1.dp, if (isSelected) Color.White.copy(alpha = 0.5f) else WisdomBorderWhite), RoundedCornerShape(10.dp))",
    ".border(BorderStroke(1.dp, wisdomAnimatedColor(isSelected, Color.White.copy(alpha = 0.5f), WisdomBorderWhite)), RoundedCornerShape(10.dp))",
    2,
)
add(
    "chip text black",
    "color = if (isSelected) Color.Black else Color.White",
    "color = wisdomAnimatedColor(isSelected, Color.Black, Color.White)",
    2,
)
add(
    "chip text grey",
    "color = if (isSelected) Color.DarkGray else WisdomMuted",
    "color = wisdomAnimatedColor(isSelected, Color.DarkGray, WisdomMuted)",
)

out = src
for label, old, new, count in edits:
    n = out.count(old)
    if n != count:
        print(f"ERROR: anchor '{label}' found {n} times (need {count}); nothing written")
        sys.exit(1)
    out = out.replace(old, new)

FILE.write_text(out, encoding="utf-8")
print(f"patched SettingsScreen.kt ({len(edits)} edits)")
