#!/usr/bin/env python3
"""M2 (docs/UI_MOTION_PLAN.md): smooth, iOS-like bottom navigation pill. Replaces the AliveBottomNav block of
MainActivity.kt (marker "FloatingPillNav v1" -> "FloatingPillNav v2"). Look, colours, sizes, haptic and the
`onItemSelected` contract are unchanged; only the motion.

Cause of the flicker (read in the v1 code): five separate width animations (420 ms) recomposed the whole nav every frame,
the selected label ALSO animated its own width (expandHorizontally) on top of that, and the page switch ran 70 ms after the
tap, in the middle of the slide.

New: ONE spring (`pos`, the fractional index of the selected tab) drives the pill position, the pill width, every tab width
and the label opening. It is read only in the layout / draw phase, so the nav does not recompose per frame. The page switch
happens on the tap (a heavy page build lands before the glide starts, not inside it).
Every anchor must match exactly once or NOTHING is written. Safe to run twice."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
src = FILE.read_text(encoding="utf-8")
if "FloatingPillNav v2" in src:
    print("already patched, nothing to do")
    sys.exit(0)

START = "// FloatingPillNav v1\n"
END = "/**\n * Universal high-speed centered circular animated loader."
IMPORT_ANCHOR = "import androidx.compose.ui.unit.Dp\n"
for label, a in (("start", START), ("end", END), ("imports", IMPORT_ANCHOR)):
    n = src.count(a)
    if n != 1:
        print(f"ERROR: anchor '{label}' found {n} times (need 1); nothing written")
        sys.exit(1)
s = src.index(START)
e = src.index(END)
if not s < e:
    print("ERROR: anchors in the wrong order; nothing written")
    sys.exit(1)
old_block = src[s:e]
if "private fun AliveBottomNav(" not in old_block:
    print("ERROR: AliveBottomNav is not inside the replaced block; nothing written")
    sys.exit(1)

NEW = r'''// FloatingPillNav v2
private val NavTrackTop = Color(0xFF101C30)
private val NavTrackBottom = CardSurface

/** Extra width (in tab units) the selected tab gets so its label fits. 1.35 = same as v1 (2.35 : 1). */
private const val NAV_EXTRA_WEIGHT = 1.35f

/** Width weight of tab [i] while the selected position is [pos] (fractional). 1 + extra at the centre, 1 far away. */
private fun navTabWeight(i: Int, pos: Float): Float =
    1f + NAV_EXTRA_WEIGHT * (1f - kotlin.math.abs(pos - i)).coerceAtLeast(0f)

/**
 * Floating pill navigation (motion v2). One independent capsule track, a slim selection pill, icons only; the active
 * tab's label opens to the right of its icon. ONE spring clock (`pos`) drives everything, read only in the layout and
 * draw phases (no recomposition per frame).
 */
@Composable
private fun AliveBottomNav(
    items: List<BottomNavItem>,
    selectedIndex: Int,
    onItemSelected: (Int, BottomNavItem) -> Unit,
    modifier: Modifier = Modifier,
) {
    val view = LocalView.current
    val lastIndex = (items.size - 1).coerceAtLeast(0)
    val pos = remember { androidx.compose.animation.core.Animatable(selectedIndex.coerceIn(0, lastIndex).toFloat()) }
    LaunchedEffect(selectedIndex) {
        pos.animateTo(
            selectedIndex.coerceIn(0, lastIndex).toFloat(),
            spring(dampingRatio = 0.85f, stiffness = 420f)
        )
    }

    val trackShape = RoundedCornerShape(999.dp)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.navigationBars)
            .padding(horizontal = 24.dp, vertical = 10.dp)
    ) {
        Box(
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
            Layout(
                modifier = Modifier.fillMaxSize(),
                content = {
                    // child 0: the selection pill
                    Box(
                        modifier = Modifier
                            .clip(trackShape)
                            .background(
                                Brush.verticalGradient(
                                    listOf(Accent.copy(alpha = 0.26f), Accent.copy(alpha = 0.12f))
                                )
                            )
                            .border(BorderStroke(1.dp, Accent.copy(alpha = 0.6f)), trackShape)
                    )
                    // children 1..n: the tabs
                    items.forEachIndexed { index, item ->
                        val selected = selectedIndex == index
                        val interactionSource = remember(index) { MutableInteractionSource() }
                        val isPressed by interactionSource.collectIsPressedAsState()
                        val pressScale by animateFloatAsState(
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
                                .clip(trackShape)
                                .clickable(
                                    interactionSource = interactionSource,
                                    indication = null
                                ) {
                                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                    if (index != selectedIndex) onItemSelected(index, item)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.graphicsLayer {
                                    scaleX = pressScale
                                    scaleY = pressScale
                                }
                            ) {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.title,
                                    tint = tint,
                                    modifier = Modifier.size(22.dp)
                                )
                                // The label opens with the SAME clock: its width and fade follow `pos`.
                                Box(
                                    modifier = Modifier
                                        .clipToBounds()
                                        .layout { measurable, _ ->
                                            val placeable = measurable.measure(Constraints())
                                            val near = (1f - kotlin.math.abs(pos.value.coerceIn(0f, lastIndex.toFloat()) - index))
                                                .coerceAtLeast(0f)
                                            val w = (placeable.width * near).roundToInt()
                                            layout(w, placeable.height) { placeable.placeRelative(0, 0) }
                                        }
                                        .graphicsLayer {
                                            val near = (1f - kotlin.math.abs(pos.value.coerceIn(0f, lastIndex.toFloat()) - index))
                                                .coerceAtLeast(0f)
                                            alpha = ((near - 0.35f) / 0.65f).coerceIn(0f, 1f)
                                        }
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
            ) { measurables, constraints ->
                val n = measurables.size - 1
                val insetPx = 4.dp.roundToPx()
                val pillHeightPx = 40.dp.roundToPx()
                val trackW = constraints.maxWidth
                val trackH = constraints.maxHeight
                if (n <= 0) return@Layout layout(trackW, trackH) {}
                val innerPx = (trackW - insetPx * 2).coerceAtLeast(0)

                val p = pos.value.coerceIn(0f, (n - 1).coerceAtLeast(0).toFloat())
                val weights = FloatArray(n) { navTabWeight(it, p) }
                val total = weights.sum().coerceAtLeast(0.001f)
                val unit = innerPx / total

                // tab edges (rounded cumulative, so there are no 1 px gaps)
                val edges = IntArray(n + 1)
                var cum = 0f
                for (i in 0 until n) {
                    edges[i] = insetPx + (unit * cum).roundToInt()
                    cum += weights[i]
                }
                edges[n] = insetPx + innerPx

                // pill: slides from the slot of tab a to the slot of tab a + 1 on the same clock
                val a = kotlin.math.floor(p).toInt().coerceIn(0, (n - 2).coerceAtLeast(0))
                val t = p - a
                val nextW = if (a + 1 < n) weights[a + 1] else weights[a]
                var before = 0f
                for (j in 0 until a) before += weights[j]
                val pillLeft = insetPx + (unit * (before + t * weights[a])).roundToInt()
                val pillWidth = (unit * (weights[a] * (1f - t) + nextW * t)).roundToInt().coerceAtLeast(0)

                val pill = measurables[0].measure(Constraints.fixed(pillWidth, pillHeightPx))
                val tabs = (0 until n).map { i ->
                    measurables[i + 1].measure(Constraints.fixed((edges[i + 1] - edges[i]).coerceAtLeast(0), trackH))
                }
                layout(trackW, trackH) {
                    pill.placeRelative(pillLeft, (trackH - pillHeightPx) / 2)
                    tabs.forEachIndexed { i, tab -> tab.placeRelative(edges[i], 0) }
                }
            }
        }
    }
}

'''

NEW_IMPORTS = (
    "import androidx.compose.ui.draw.clipToBounds\n"
    "import androidx.compose.ui.graphics.graphicsLayer\n"
    "import androidx.compose.ui.layout.Layout\n"
    "import androidx.compose.ui.layout.layout\n"
    "import androidx.compose.ui.unit.Constraints\n"
    "import kotlin.math.roundToInt\n"
)
out = src[:s] + NEW + src[e:]
missing = "".join(line + "\n" for line in NEW_IMPORTS.splitlines() if (line + "\n") not in out)
out = out.replace(IMPORT_ANCHOR, missing + IMPORT_ANCHOR, 1)
FILE.write_text(out, encoding="utf-8")
print("patched: FloatingPillNav v2")
