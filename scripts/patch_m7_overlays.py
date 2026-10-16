#!/usr/bin/env python3
"""M7 (docs/UI_MOTION_PLAN.md): motion for the drawer, top bar, notifications screen, splash handoff and the timer dialog.

Edits MainActivity.kt only, by exact anchors (every anchor must match exactly once, otherwise NOTHING is written):
 - drawer: the panel slides in from the left while the scrim fades (same 260 / 200 ms clock), rows rise in 30 ms apart
 - top bar: the title cross-fades between "Wisdom Tower Academy" and "Study Workspace"; the red bell dot pops in with a spring
 - notifications screen: opens and closes with the shared push layer (WisdomPushLayer), like competitions
 - splash: the system splash fades and grows slightly into the app instead of vanishing
 - timer dialog: scale 0.94 to 1 plus fade (helper in ui/theme/WisdomOverlayMotion.kt)
Safe to run twice (marker M7-motion). No behaviour, state or back handling is changed.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "M7-motion"

EDITS = []  # (name, anchor, replacement)

EDITS.append(("import Crossfade",
    "import androidx.compose.animation.AnimatedVisibility\n",
    "import androidx.compose.animation.AnimatedVisibility\nimport androidx.compose.animation.Crossfade\n"))

EDITS.append(("import helpers",
    "import com.wisdomtower.academy.ui.theme.WisdomPushLayer\n",
    "import com.wisdomtower.academy.ui.theme.WisdomPushLayer\n"
    "import com.wisdomtower.academy.ui.theme.wisdomDialogEnter\n"
    "import com.wisdomtower.academy.ui.theme.wisdomStaggerIn\n"))

EDITS.append(("splash handoff",
    "        splash.setKeepOnScreenCondition { keepSplash }\n",
    "        splash.setKeepOnScreenCondition { keepSplash }\n"
    "        // M7-motion: the system splash fades and grows a little into the app instead of vanishing in one frame\n"
    "        splash.setOnExitAnimationListener(object : androidx.core.splashscreen.SplashScreen.OnExitAnimationListener {\n"
    "            override fun onSplashScreenExit(splashScreenViewProvider: androidx.core.splashscreen.SplashScreenViewProvider) {\n"
    "                splashScreenViewProvider.view.animate()\n"
    "                    .alpha(0f)\n"
    "                    .scaleX(1.06f)\n"
    "                    .scaleY(1.06f)\n"
    "                    .setDuration(260L)\n"
    "                    .setInterpolator(android.view.animation.AccelerateDecelerateInterpolator())\n"
    "                    .withEndAction { splashScreenViewProvider.remove() }\n"
    "                    .start()\n"
    "            }\n"
    "        })\n"))

EDITS.append(("top bar title cross-fade",
    "                            Text(\n"
    "                                text = if (activeStudyUrl != null) \"Study Workspace\" else \"Wisdom Tower Academy\",\n"
    "                                color = Color.White,\n"
    "                                fontSize = 15.sp,\n"
    "                                fontWeight = FontWeight.Bold,\n"
    "                                letterSpacing = 0.2.sp,\n"
    "                                maxLines = 1,\n"
    "                                overflow = TextOverflow.Ellipsis\n"
    "                            )\n",
    "                            Crossfade(\n"
    "                                targetState = activeStudyUrl != null,\n"
    "                                animationSpec = tween(200),\n"
    "                                label = \"topBarTitle\"\n"
    "                            ) { inStudy ->\n"
    "                                Text(\n"
    "                                    text = if (inStudy) \"Study Workspace\" else \"Wisdom Tower Academy\",\n"
    "                                    color = Color.White,\n"
    "                                    fontSize = 15.sp,\n"
    "                                    fontWeight = FontWeight.Bold,\n"
    "                                    letterSpacing = 0.2.sp,\n"
    "                                    maxLines = 1,\n"
    "                                    overflow = TextOverflow.Ellipsis\n"
    "                                )\n"
    "                            }\n"))

EDITS.append(("bell dot pop",
    "                                    if (unreadNotifCount > 0) {\n"
    "                                        Box(\n"
    "                                            modifier = Modifier\n"
    "                                                .size(8.dp)\n"
    "                                                .align(Alignment.TopEnd)\n"
    "                                                .background(Color(0xFFEF4444), CircleShape)\n"
    "                                        )\n"
    "                                    }\n",
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
    "                                    }\n"))

EDITS.append(("notifications push layer",
    "                if (showNotifications) {\n"
    "                    NotificationsScreen(\n"
    "                        onBack = { showNotifications = false; notificationOpenId = null }, // R6-notif-open\n"
    "                        openId = notificationOpenId,\n",
    "                // M7-motion: opens and closes with the shared push layer; the item is the open id (\"\" = list) so the screen keeps its content while it slides out\n"
    "                WisdomPushLayer(item = if (showNotifications) (notificationOpenId ?: \"\") else null, zIndexValue = 17f) { openIdNow ->\n"
    "                    NotificationsScreen(\n"
    "                        onBack = { showNotifications = false; notificationOpenId = null }, // R6-notif-open\n"
    "                        openId = openIdNow.ifEmpty { null },\n"))

EDITS.append(("drawer scrim timing",
    "            enter = fadeIn(tween(160)),\n"
    "            exit = fadeOut(tween(140)),\n"
    "            modifier = Modifier.zIndex(150f)\n",
    "            enter = fadeIn(tween(260)),\n"
    "            exit = fadeOut(tween(200)),\n"
    "            modifier = Modifier.zIndex(150f)\n"))

EDITS.append(("drawer panel slide",
    "                        .fillMaxHeight()\n"
    "                        .width(270.dp)\n",
    "                        .fillMaxHeight()\n"
    "                        .width(270.dp)\n"
    "                        .animateEnterExit(\n"
    "                            enter = slideInHorizontally(tween(260, easing = FastOutSlowInEasing)) { -it },\n"
    "                            exit = slideOutHorizontally(tween(200, easing = FastOutSlowInEasing)) { -it }\n"
    "                        )\n"))

for i, label in enumerate(["AI Tutor", "Calculator", "Notebook", "Timer", "Planner", "Refresh"]):
    EDITS.append((f"drawer row index {label}",
        f"                                label = \"{label}\",\n",
        f"                                label = \"{label}\",\n                                index = {i},\n"))

EDITS.append(("drawer links index (forEachIndexed)",
    "                            overflowMenuLinks.forEach { link ->\n",
    "                            overflowMenuLinks.forEachIndexed { linkIndex, link ->\n"))
EDITS.append(("drawer links index (argument)",
    "                                    label = link.label,\n",
    "                                    label = link.label,\n                                    index = 6 + linkIndex,\n"))

EDITS.append(("DrawerCompactRow stagger",
    "    label: String,\n"
    "    onClick: () -> Unit\n"
    ") {\n"
    "    val interactionSource = remember { MutableInteractionSource() }\n"
    "    val isPressed by interactionSource.collectIsPressedAsState()\n"
    "    val view = LocalView.current\n"
    "\n"
    "    Row(\n"
    "        modifier = Modifier\n"
    "            .fillMaxWidth()\n"
    "            .clip(RoundedCornerShape(8.dp))\n",
    "    label: String,\n"
    "    onClick: () -> Unit,\n"
    "    index: Int = 0\n"
    ") {\n"
    "    val interactionSource = remember { MutableInteractionSource() }\n"
    "    val isPressed by interactionSource.collectIsPressedAsState()\n"
    "    val view = LocalView.current\n"
    "\n"
    "    Row(\n"
    "        modifier = Modifier\n"
    "            .wisdomStaggerIn(index)\n"
    "            .fillMaxWidth()\n"
    "            .clip(RoundedCornerShape(8.dp))\n"))

EDITS.append(("timer dialog enter",
    "            shadowElevation = 24.dp,\n"
    "            modifier = Modifier\n"
    "                .fillMaxWidth()\n"
    "                .padding(16.dp)\n",
    "            shadowElevation = 24.dp,\n"
    "            modifier = Modifier\n"
    "                .wisdomDialogEnter()\n"
    "                .fillMaxWidth()\n"
    "                .padding(16.dp)\n"))


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
        print("ERROR: braces unbalanced after patch; file not changed")
        return 1
    FILE.write_text(out, encoding="utf-8")
    print(f"patched ({len(EDITS)} edits)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
