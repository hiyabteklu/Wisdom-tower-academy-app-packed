#!/usr/bin/env python3
"""Glass look for the shell (docs/GLASS_PLAN.md area 8 + owner request 2026-10-13): bottom navigation, top bar, side drawer.

 - bottom nav: floating see-through glass bar, NO outline on the track and NO hairline above it; the sliding
   pill is the only outlined element (wide thin pill, 1dp edge) and glides with a long ease-out slide. The pill starts moving on the tap
   itself (the page switch follows 70 ms later) so the slide is seen, not hidden behind the page change.
 - top bar: transparent glass tint (white 4%) instead of solid navy; hairline is white 8%.
 - root: AtmosphereBackground behind the Scaffold and Scaffold container transparent, so the glow shows under the bars.
 - drawer: lighter navy-teal panel with a white 10% edge, lighter scrim.
Only the standard library. Anchors must match exactly once, otherwise nothing is written. Safe to run twice.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "NavGlassTrack"

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do"); sys.exit(0)

NEW_NAV = '''private val NavGlassTrack = Color.White.copy(alpha = 0.05f)

/**
 * Glass bottom navigation (owner request 2026-10-13). One see-through capsule, no outline of its own; the sliding
 * selection pill is the only outlined piece (wide and thin, 1dp edge, soft cyan fill). The pill glides with a long
 * ease-out slide and starts on the tap itself; the page switch follows a moment later.
 */
@Composable
private fun AliveBottomNav(
    items: List<BottomNavItem>,
    selectedIndex: Int,
    onItemSelected: (Int, BottomNavItem) -> Unit,
    modifier: Modifier = Modifier,
) {
    val view = LocalView.current
    var pending by remember { mutableStateOf<Int?>(null) }
    val targetIndex = pending ?: selectedIndex

    LaunchedEffect(pending) {
        val p = pending ?: return@LaunchedEffect
        delay(70)
        items.getOrNull(p)?.let { onItemSelected(p, it) }
        pending = null
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.navigationBars)
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp)
                .clip(RoundedCornerShape(999.dp))
                .background(NavGlassTrack)
        ) {
            val itemCount = items.size.coerceAtLeast(1)
            val tabWidth = maxWidth / itemCount

            val pillLeft by animateDpAsState(
                targetValue = tabWidth * targetIndex,
                animationSpec = tween(
                    durationMillis = 460,
                    easing = androidx.compose.animation.core.CubicBezierEasing(0.22f, 1f, 0.36f, 1f)
                ),
                label = "bottomNavPillSlide"
            )

            Box(
                modifier = Modifier
                    .offset(x = pillLeft)
                    .width(tabWidth)
                    .fillMaxHeight()
                    .padding(horizontal = 4.dp, vertical = 7.dp)
                    .clip(RoundedCornerShape(999.dp))
                    .background(
                        Brush.verticalGradient(
                            listOf(Accent.copy(alpha = 0.20f), Accent.copy(alpha = 0.09f))
                        )
                    )
                    .border(
                        BorderStroke(1.dp, Accent.copy(alpha = 0.55f)),
                        RoundedCornerShape(999.dp)
                    )
            )

            Row(
                modifier = Modifier.fillMaxSize(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                items.forEachIndexed { index, item ->
                    val selected = targetIndex == index
                    val interactionSource = remember(index) { MutableInteractionSource() }
                    val isPressed by interactionSource.collectIsPressedAsState()

                    val contentScale by animateFloatAsState(
                        targetValue = if (isPressed) 0.94f else 1.0f,
                        animationSpec = tween(120),
                        label = "tabItemScale"
                    )
                    val iconColor by animateColorAsState(
                        targetValue = if (selected) Accent else Muted,
                        animationSpec = tween(260),
                        label = "tabIconColor"
                    )
                    val textColor by animateColorAsState(
                        targetValue = if (selected) Accent else Muted,
                        animationSpec = tween(260),
                        label = "tabTextColor"
                    )

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .clip(RoundedCornerShape(999.dp))
                            .clickable(
                                interactionSource = interactionSource,
                                indication = null
                            ) {
                                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                if (index != targetIndex) pending = index
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                            modifier = Modifier
                                .fillMaxSize()
                                .scale(contentScale)
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.title,
                                tint = iconColor,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = item.title,
                                color = textColor,
                                fontSize = 10.sp,
                                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                letterSpacing = (-0.1).sp
                            )
                        }
                    }
                }
            }
        }
    }
}

'''

# 1. replace the whole AliveBottomNav function (keeps its two old doc comments above; harmless)
start_a = "@Composable\nprivate fun AliveBottomNav("
end_a = "/**\n * Universal high-speed centered circular animated loader."
if src.count(start_a) != 1 or src.count(end_a) != 1:
    print(f"ERROR: nav function anchors found {src.count(start_a)} / {src.count(end_a)} times; file not changed"); sys.exit(1)
i, j = src.index(start_a), src.index(end_a)
if j < i:
    print("ERROR: anchors out of order; file not changed"); sys.exit(1)
src = src[:i] + NEW_NAV + src[j:]

def rep(old, new, label):
    global src
    n = src.count(old)
    if n != 1:
        print(f"ERROR: anchor '{label}' found {n} times (need exactly 1); file not changed"); sys.exit(1)
    src = src.replace(old, new)

# 2. root glow + transparent scaffold
rep("            .fillMaxSize()\n            .background(BarBg)\n    ) {\n        Scaffold(\n",
    "            .fillMaxSize()\n            .background(BarBg)\n    ) {\n        com.wisdomtower.academy.ui.theme.AtmosphereBackground(modifier = Modifier.fillMaxSize())\n        Scaffold(\n",
    "root box")
rep("            containerColor = BarBg,\n            contentWindowInsets = WindowInsets(0, 0, 0, 0),\n            topBar = {",
    "            containerColor = Color.Transparent,\n            contentWindowInsets = WindowInsets(0, 0, 0, 0),\n            topBar = {",
    "scaffold container")

# 3. top bar glass + hairline
rep("            topBar = {\n                Column(\n                    modifier = Modifier\n                        .fillMaxWidth()\n                        .background(BarBg)\n                ) {",
    "            topBar = {\n                Column(\n                    modifier = Modifier\n                        .fillMaxWidth()\n                        .background(Color.White.copy(alpha = 0.04f))\n                ) {",
    "top bar")
rep("                            .height(1.dp)\n                            .background(CardBorderSubtle)\n                    )\n                }\n            },\n            bottomBar = {",
    "                            .height(1.dp)\n                            .background(Color.White.copy(alpha = 0.08f))\n                    )\n                }\n            },\n            bottomBar = {",
    "top bar hairline")

# 4. drawer
rep("                    .fillMaxSize()\n                    .background(Color(0x99000000))\n                    .clickable(",
    "                    .fillMaxSize()\n                    .background(Color(0x66030812))\n                    .clickable(",
    "drawer scrim")
rep("                        .background(Color(0xFF070D18))\n                        .border(\n                            BorderStroke(1.dp, CardBorder),\n                            RoundedCornerShape(topEnd = 16.dp, bottomEnd = 16.dp)\n                        )",
    "                        .background(\n                            Brush.verticalGradient(\n                                listOf(Color(0xF2152238), Color(0xF20D1829))\n                            )\n                        )\n                        .border(\n                            BorderStroke(1.dp, Color.White.copy(alpha = 0.10f)),\n                            RoundedCornerShape(topEnd = 16.dp, bottomEnd = 16.dp)\n                        )",
    "drawer panel")

FILE.write_text(src, encoding="utf-8")
print("patched")
