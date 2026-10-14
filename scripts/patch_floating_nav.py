#!/usr/bin/env python3
"""Floating pill bottom nav (owner request 2026-10-14).

- Track: independent horizontal capsule in the app palette (CardSurface + cyan hairline), floats with a soft glow
- Sliding selection pill: slim horizontal capsule (like phone volume/brightness sliders), not a rounded square
- Labels hidden; the active tab's label expands to the right of its icon
- Track is shorter (52dp) so the nav uses less vertical space
Idempotent: safe to run twice.
"""
import sys

PATH = "app/src/main/java/com/wisdomtower/academy/MainActivity.kt"
src = open(PATH, encoding="utf-8").read()

if "FloatingPillNav v1" in src:
    print("already patched")
    sys.exit(0)

START = "private val NavGlassTrack = "
END = "/**\n * Universal high-speed centered circular animated loader."
s = src.find(START)
e = src.find(END)
assert s != -1 and e != -1 and s < e, "anchors not found"

NEW = r'''// FloatingPillNav v1
private val NavTrackTop = Color(0xFF101C30)
private val NavTrackBottom = CardSurface

/**
 * Floating pill navigation. One independent capsule track in the app palette (no bar or band behind it),
 * a slim sliding selection pill, icons only. The active tab's label expands to the right of its icon.
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

    val slide = androidx.compose.animation.core.CubicBezierEasing(0.22f, 1f, 0.36f, 1f)
    // The active tab is wider so its label fits; the pill follows the same animated widths.
    val weights = items.indices.map { i ->
        animateFloatAsState(
            targetValue = if (i == targetIndex) 2.35f else 1f,
            animationSpec = tween(420, easing = slide),
            label = "navWeight$i"
        ).value
    }

    val trackShape = RoundedCornerShape(999.dp)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.navigationBars)
            .padding(horizontal = 24.dp, vertical = 10.dp)
    ) {
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .shadow(
                    elevation = 14.dp,
                    shape = trackShape,
                    ambientColor = Accent.copy(alpha = 0.25f),
                    spotColor = Accent.copy(alpha = 0.25f)
                )
                .clip(trackShape)
                .background(Brush.verticalGradient(listOf(NavTrackTop, NavTrackBottom)))
                .border(BorderStroke(1.dp, CardBorder), trackShape)
        ) {
            val inset = 4.dp
            val inner = maxWidth - inset * 2
            val total = weights.sum().coerceAtLeast(0.001f)
            val widths = weights.map { inner * (it / total) }
            val pillLeft = inset + widths.take(targetIndex).fold(0.dp) { a, b -> a + b }

            Box(
                modifier = Modifier
                    .offset(x = pillLeft)
                    .width(widths.getOrElse(targetIndex) { 0.dp })
                    .height(40.dp)
                    .align(Alignment.CenterStart)
                    .clip(trackShape)
                    .background(
                        Brush.verticalGradient(
                            listOf(Accent.copy(alpha = 0.26f), Accent.copy(alpha = 0.12f))
                        )
                    )
                    .border(BorderStroke(1.dp, Accent.copy(alpha = 0.6f)), trackShape)
            )

            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = inset),
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
                    val tint by animateColorAsState(
                        targetValue = if (selected) Accent else Muted,
                        animationSpec = tween(260),
                        label = "tabTint"
                    )

                    Box(
                        modifier = Modifier
                            .weight(weights[index].coerceAtLeast(0.01f))
                            .fillMaxHeight()
                            .clip(trackShape)
                            .clickable(
                                interactionSource = interactionSource,
                                indication = null
                            ) {
                                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                if (index != targetIndex) pending = index
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.scale(contentScale)
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.title,
                                tint = tint,
                                modifier = Modifier.size(22.dp)
                            )
                            AnimatedVisibility(
                                visible = selected,
                                enter = fadeIn(tween(220, delayMillis = 120)) + expandHorizontally(tween(320)),
                                exit = fadeOut(tween(90)) + shrinkHorizontally(tween(240))
                            ) {
                                Text(
                                    text = item.title,
                                    color = tint,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    maxLines = 1,
                                    softWrap = false,
                                    modifier = Modifier.padding(start = 6.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

'''

out = src[:s] + NEW + src[e:]

# imports (only the ones missing)
need = ["import androidx.compose.ui.draw.shadow"]
anchor = "import kotlinx.coroutines.delay"
add = "".join(i + "\n" for i in need if i not in out)
assert anchor in out
out = out.replace(anchor, add + anchor, 1)

open(PATH, "w", encoding="utf-8").write(out)
print("patched floating nav")
