#!/usr/bin/env python3
"""T9 follow-up "Other resources": (1) bold text everywhere on the guide pages, (2) the tab pills get ONE sliding pill
(spring, changes colour) like the Sign In / Create Account switch, (3) the page height animates when a tab changes.
Only look and motion; no sentence changes. Every anchor must match EXACTLY ONCE or NOTHING is written. Safe to run twice."""
import re
import sys
from pathlib import Path

GUIDES = Path("app/src/main/java/com/wisdomtower/academy/ui/guides/GuidesScreen.kt")
STATE = Path("app/src/main/java/com/wisdomtower/academy/ui/guides/FreeResourcesStateCard.kt")


def rep(src, old, new, label):
    n = src.count(old)
    if n != 1:
        print(f"ERROR: anchor '{label}' found {n} times (need exactly 1); nothing written")
        sys.exit(1)
    return src.replace(old, new)


NEW_IMPORTS = (
    "import androidx.compose.foundation.ScrollState\n"
    "import androidx.compose.foundation.horizontalScroll\n"
    "import androidx.compose.foundation.layout.offset\n"
    "import androidx.compose.foundation.rememberScrollState\n"
    "import androidx.compose.runtime.mutableStateMapOf\n"
    "import androidx.compose.ui.layout.onGloballyPositioned\n"
    "import androidx.compose.ui.layout.positionInParent\n"
    "import androidx.compose.ui.platform.LocalDensity\n"
    "import androidx.compose.ui.unit.IntOffset\n"
    "import kotlin.math.roundToInt\n"
)

TAB_ROW = '''/**
 * Tab row with ONE glass pill that slides (spring) from tab to tab and changes colour, like the Sign In / Create
 * Account switch. The row scrolls sideways when the tabs are wider than the screen; the chosen tab is brought into view.
 */
@Composable
private fun GuideTabRow(activeSlug: String, scroll: ScrollState, onSelect: (String) -> Unit) {
    val density = LocalDensity.current
    val xs = remember { mutableStateMapOf<String, Float>() }
    val ws = remember { mutableStateMapOf<String, Float>() }
    val hs = remember { mutableStateMapOf<String, Float>() }
    val targetX = xs[activeSlug]
    val targetW = ws[activeSlug]
    val targetH = hs[activeSlug]
    val slide = spring<Float>(dampingRatio = 0.72f, stiffness = 380f)
    val indX by animateFloatAsState(targetValue = targetX ?: 0f, animationSpec = slide, label = "guideTabX")
    val indW by animateFloatAsState(targetValue = targetW ?: 0f, animationSpec = slide, label = "guideTabW")
    val accent = GUIDE_TABS.firstOrNull { it.slug == activeSlug }?.accentColor ?: WisdomCyan
    val indColor by animateColorAsState(targetValue = accent, animationSpec = tween(260), label = "guideTabAccent")

    LaunchedEffect(activeSlug, targetX) {
        if (targetX != null) {
            scroll.animateScrollTo((targetX - with(density) { 28.dp.toPx() }).toInt().coerceAtLeast(0))
        }
    }

    Box(modifier = Modifier.fillMaxWidth().horizontalScroll(scroll)) {
        if (targetW != null && targetH != null) {
            Box(
                modifier = Modifier
                    .offset { IntOffset(indX.roundToInt(), 0) }
                    .width(with(density) { indW.toDp() })
                    .height(with(density) { targetH.toDp() })
                    .clip(CircleShape)
                    .background(indColor.copy(alpha = 0.22f))
                    .border(BorderStroke(1.5.dp, indColor), CircleShape)
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            GUIDE_TABS.forEach { tab ->
                val selected = activeSlug == tab.slug
                val fill by animateColorAsState(
                    targetValue = if (selected) Color.Transparent else WisdomGlassFillStrong,
                    animationSpec = tween(240),
                    label = "guideTabFill"
                )
                val edge by animateColorAsState(
                    targetValue = if (selected) Color.Transparent else WisdomBorderWhite,
                    animationSpec = tween(240),
                    label = "guideTabEdge2"
                )
                val foreground by animateColorAsState(
                    targetValue = if (selected) tab.accentColor else GuideSoftColor,
                    animationSpec = tween(240),
                    label = "guideTabFg2"
                )
                Box(
                    modifier = Modifier.onGloballyPositioned { c ->
                        val x = c.positionInParent().x
                        val w = c.size.width.toFloat()
                        val h = c.size.height.toFloat()
                        if (xs[tab.slug] != x) xs[tab.slug] = x
                        if (ws[tab.slug] != w) ws[tab.slug] = w
                        if (hs[tab.slug] != h) hs[tab.slug] = h
                    }
                ) {
                    Row(
                        modifier = Modifier
                            .softClickable { onSelect(tab.slug) }
                            .clip(CircleShape)
                            .background(fill)
                            .border(BorderStroke(1.5.dp, edge), CircleShape)
                            .padding(horizontal = 18.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = guideIcon(tab.slug),
                            contentDescription = null,
                            tint = foreground,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = tab.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = foreground,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}

'''

SWITCHER_OLD = '''            item(key = "switcher_row") {
                LazyRow(
                    state = tabState,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(GUIDE_TABS) { tab ->
                        GuideTabPill(
                            tab = tab,
                            selected = activeSlug == tab.slug,
                            onClick = { activeSlug = tab.slug }
                        )
                    }
                }
            }
'''
SWITCHER_NEW = '''            item(key = "switcher_row") {
                GuideTabRow(activeSlug = activeSlug, scroll = tabScroll, onSelect = { activeSlug = it })
            }
'''

g = GUIDES.read_text(encoding="utf-8")
if "private fun GuideTabRow(" in g:
    print("GuidesScreen.kt already patched")
else:
    g = rep(g, "import androidx.compose.foundation.BorderStroke\n", NEW_IMPORTS + "import androidx.compose.foundation.BorderStroke\n", "imports")
    g = rep(g, "    val tabState = rememberLazyListState()\n", "    val tabScroll = rememberScrollState()\n", "tabState")
    g = rep(
        g,
        "        val index = GUIDE_TABS.indexOfFirst { it.slug == activeSlug }\n"
        "        if (index >= 0) tabState.animateScrollToItem(maxOf(index - 1, 0))\n",
        "",
        "tab scroll effect",
    )
    g = rep(g, SWITCHER_OLD, SWITCHER_NEW, "switcher_row")
    g = rep(
        g,
        "                AnimatedContent(\n                    targetState = activeSlug,\n",
        "                AnimatedContent(\n                    modifier = Modifier.animateContentSize(animationSpec = spring(dampingRatio = 0.85f, stiffness = 300f)),\n                    targetState = activeSlug,\n",
        "AnimatedContent",
    )
    g = rep(
        g,
        "/** Tab as an iOS style pill: icon + label, colours glide between selected and not selected. */\n",
        TAB_ROW + "/** Tab as an iOS style pill: icon + label, colours glide between selected and not selected. */\n",
        "tab pill doc",
    )
    g = rep(
        g,
        "            fontSize = 16.sp,\n            color = Color.White\n        ),\n        placeholder = { Text(placeholder, fontSize = 15.sp, color = GuideSoftColor) },\n",
        "            fontSize = 16.sp,\n            fontWeight = FontWeight.Bold,\n            color = Color.White\n        ),\n        placeholder = { Text(placeholder, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = GuideSoftColor) },\n",
        "search field",
    )
    # Bold everywhere: no light weights left in this file (the owner asked for bold, not only titles).
    g = re.sub(r"FontWeight\.(Normal|Medium|SemiBold)\b", "FontWeight.Bold", g)
    GUIDES.write_text(g, encoding="utf-8")
    print("GuidesScreen.kt patched")

s = STATE.read_text(encoding="utf-8")
if "fontWeight = FontWeight.Bold,\n                color = Color(0xFFCBD5E1)" in s:
    print("FreeResourcesStateCard.kt already patched")
else:
    s = rep(
        s,
        "                lineHeight = 25.sp,\n                color = Color(0xFFCBD5E1)\n",
        "                lineHeight = 25.sp,\n                fontWeight = FontWeight.Bold,\n                color = Color(0xFFCBD5E1)\n",
        "state card message",
    )
    STATE.write_text(s, encoding="utf-8")
    print("FreeResourcesStateCard.kt patched")
