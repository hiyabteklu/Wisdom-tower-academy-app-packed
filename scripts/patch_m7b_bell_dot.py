#!/usr/bin/env python3
"""M7b: fixes the build error from patch_m7_overlays.py in MainActivity.kt (bell dot).

Error: 'RowScope.AnimatedVisibility ... cannot be called in this context with an implicit receiver' (the bell dot sits inside
an IconButton lambda that is lexically inside a Row). The dot is now a plain Box whose scale is eased with
animateFloatAsState (spring pop), no AnimatedVisibility, no scope. Same look and behaviour.
Safe to run twice (marker M7b-bell). Every anchor must match exactly once, otherwise nothing is written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "M7b-bell"

OLD = (
    "                                    AnimatedVisibility(\n"
    "                                        visible = unreadNotifCount > 0,\n"
    "                                        modifier = Modifier.align(Alignment.TopEnd),\n"
    "                                        enter = scaleIn(spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)) + fadeIn(tween(120)),\n"
    "                                        exit = scaleOut(tween(120)) + fadeOut(tween(120))\n"
    "                                    ) {\n"
    "                                        Box(\n"
    "                                            modifier = Modifier\n"
    "                                                .size(8.dp)\n"
    "                                                .background(Color(0xFFEF4444), CircleShape)\n"
    "                                        )\n"
    "                                    }\n"
)
NEW = (
    "                                    // M7b-bell: spring pop without AnimatedVisibility (it cannot be called here: implicit RowScope receiver)\n"
    "                                    val bellDotScale by animateFloatAsState(\n"
    "                                        targetValue = if (unreadNotifCount > 0) 1f else 0f,\n"
    "                                        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),\n"
    "                                        label = \"bellDotScale\"\n"
    "                                    )\n"
    "                                    if (bellDotScale > 0.01f) {\n"
    "                                        Box(\n"
    "                                            modifier = Modifier\n"
    "                                                .size(8.dp)\n"
    "                                                .align(Alignment.TopEnd)\n"
    "                                                .graphicsLayer {\n"
    "                                                    scaleX = bellDotScale\n"
    "                                                    scaleY = bellDotScale\n"
    "                                                    alpha = bellDotScale.coerceIn(0f, 1f)\n"
    "                                                }\n"
    "                                                .background(Color(0xFFEF4444), CircleShape)\n"
    "                                        )\n"
    "                                    }\n"
)


def main() -> int:
    src = FILE.read_text(encoding="utf-8")
    if MARK in src:
        print("already patched, nothing to do")
        return 0
    n = src.count(OLD)
    if n != 1:
        print(f"ERROR: bell dot block found {n} times (need exactly 1); file not changed")
        return 1
    out = src.replace(OLD, NEW)
    if out.count("{") - out.count("}") != src.count("{") - src.count("}"):
        print("ERROR: braces unbalanced after patch; file not changed")
        return 1
    FILE.write_text(out, encoding="utf-8")
    print("patched")
    return 0


if __name__ == "__main__":
    sys.exit(main())
