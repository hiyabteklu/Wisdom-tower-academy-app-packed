#!/usr/bin/env python3
"""S3 (docs/PLAY_STORE_UI_PLAN.md): TalkBack roles on the shared controls that live in BIG files.

The small shared files (WisdomGlass.kt, WisdomComponents.kt, OpenCard.kt, SignInPill.kt) are already changed on main.
This script changes the two files that are too big to resend:
  - ui/study/HubItemListScreen.kt : the round back button (ScreenBackButton) gets Role.Button.
  - MainActivity.kt               : each bottom-nav tab is announced as a Tab and says whether it is selected, the
                                    selected tab's label is no longer read twice (icon description already names it),
                                    the study-timer chip in the top bar gets Role.Button.
Safe to run twice (marker S3-a11y). If any anchor is not found exactly once, NOTHING is written.
"""
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy")
MARK = "S3-a11y"

HUB = BASE / "ui/study/HubItemListScreen.kt"
MAIN = BASE / "MainActivity.kt"

hub_src = HUB.read_text(encoding="utf-8")
main_src = MAIN.read_text(encoding="utf-8")

if MARK in hub_src and MARK in main_src:
    print("already patched, nothing to do")
    sys.exit(0)

errors = []


def swap(src, name, old, new):
    n = src.count(old)
    if n != 1:
        errors.append(f"{name}: anchor found {n} times (need exactly 1)")
        return src
    return src.replace(old, new)


# ---- HubItemListScreen.kt: ScreenBackButton -------------------------------------------------------------------
hub_old = (
    "            .clickable(\n"
    "                interactionSource = remember { MutableInteractionSource() },\n"
    "                indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),\n"
    "                onClick = onClick\n"
    "            ),\n"
    "        contentAlignment = Alignment.Center\n"
    "    ) {\n"
    "        Icon(\n"
    "            imageVector = Icons.AutoMirrored.Filled.ArrowBack,\n"
)
hub_new = (
    "            .clickable(\n"
    "                interactionSource = remember { MutableInteractionSource() },\n"
    "                indication = ripple(color = WisdomCyan.copy(alpha = 0.2f)),\n"
    "                role = androidx.compose.ui.semantics.Role.Button, // S3-a11y\n"
    "                onClick = onClick\n"
    "            ),\n"
    "        contentAlignment = Alignment.Center\n"
    "    ) {\n"
    "        Icon(\n"
    "            imageVector = Icons.AutoMirrored.Filled.ArrowBack,\n"
)
if MARK not in hub_src:
    hub_src = swap(hub_src, "HubItemListScreen back button", hub_old, hub_new)

# ---- MainActivity.kt -------------------------------------------------------------------------------------------
if MARK not in main_src:
    tab_old = (
        "                                .clickable(\n"
        "                                    interactionSource = interactionSource,\n"
        "                                    indication = null\n"
        "                                ) {\n"
        "                                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)\n"
        "                                    if (index != selectedIndex) onItemSelected(index, item)\n"
        "                                },\n"
    )
    tab_new = (
        "                                .clickable(\n"
        "                                    interactionSource = interactionSource,\n"
        "                                    indication = null,\n"
        "                                    role = androidx.compose.ui.semantics.Role.Tab // S3-a11y\n"
        "                                ) {\n"
        "                                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)\n"
        "                                    if (index != selectedIndex) onItemSelected(index, item)\n"
        "                                }\n"
        "                                .semantics { this.selected = selected },\n"
    )
    main_src = swap(main_src, "bottom nav tab", tab_old, tab_new)

    label_old = (
        "                                        softWrap = false,\n"
        "                                        modifier = Modifier.padding(start = 6.dp)\n"
    )
    label_new = (
        "                                        softWrap = false,\n"
        "                                        modifier = Modifier.clearAndSetSemantics { }.padding(start = 6.dp) // S3-a11y: the icon already names the tab\n"
    )
    main_src = swap(main_src, "bottom nav label", label_old, label_new)

    timer_old = (
        "                                        .clickable {\n"
        "                                            view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)\n"
        "                                            showTimerControlDialog = true\n"
        "                                        }\n"
    )
    timer_new = (
        "                                        .clickable(role = androidx.compose.ui.semantics.Role.Button) { // S3-a11y\n"
        "                                            view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)\n"
        "                                            showTimerControlDialog = true\n"
        "                                        }\n"
    )
    main_src = swap(main_src, "timer chip", timer_old, timer_new)

    imp_old = "import androidx.compose.ui.platform.LocalView\n"
    imp_new = (
        imp_old
        + "import androidx.compose.ui.semantics.clearAndSetSemantics\n"
        + "import androidx.compose.ui.semantics.selected\n"
        + "import androidx.compose.ui.semantics.semantics\n"
    )
    for imp in ("clearAndSetSemantics", "selected", "semantics"):
        if f"import androidx.compose.ui.semantics.{imp}\n" in main_src:
            errors.append(f"MainActivity import for {imp} already present (script needs an update)")
    main_src = swap(main_src, "MainActivity imports", imp_old, imp_new)

if errors:
    print("ERROR, nothing written:")
    for e in errors:
        print(" -", e)
    sys.exit(1)

HUB.write_text(hub_src, encoding="utf-8")
MAIN.write_text(main_src, encoding="utf-8")
print("patched: HubItemListScreen.kt, MainActivity.kt")
