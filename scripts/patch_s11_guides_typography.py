#!/usr/bin/env python3
"""S11 (owner request 2026-10-17): calmer text inside the "Other resources" pages (Study Techniques, Success Stories,
Campus Life, Universities, Departments, Scholarships). The icon grid on Home and the transitions are NOT touched.

Problem: body text was 16 sp BOLD (about 18 sp after the app-wide 12 percent lift) and titles were Black / ExtraBold at
22 to 30 sp, so only a few lines fit on screen. Now: body 14 sp regular (22 sp lines), card titles 19 sp Bold,
hero 24 sp Bold, section titles 18 sp Bold, small box titles 15 sp Bold, labels 11 to 13 sp SemiBold / Bold.
ONLY sizes, line heights and weights change. Every sentence, icon, colour and animation stays the same.

Files: ui/guides/GuidesScreen.kt and ui/guides/FreeResourcesStateCard.kt.
Safe to run twice (marker S11-guides-type in GuidesScreen.kt). If any anchor is not found the exact number of times,
NOTHING is written.
"""
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy/ui/guides")
GS = BASE / "GuidesScreen.kt"
FR = BASE / "FreeResourcesStateCard.kt"
MARK = "S11-guides-type"

gs = GS.read_text(encoding="utf-8")
fr = FR.read_text(encoding="utf-8")
if MARK in gs:
    print("already patched, nothing to do")
    sys.exit(0)

errors = []


def swap(s, name, old, new, count=1):
    n = s.count(old)
    if n != count:
        errors.append(f"{name}: anchor found {n} times (need exactly {count})")
        return s
    return s.replace(old, new)


# ---- GuidesScreen.kt ----
gs = swap(gs, "body style",
"""    fontFamily = PlusJakartaSansFontFamily,
    fontWeight = FontWeight.Bold,
    fontSize = 16.sp,
    lineHeight = 26.sp,
    color = GuideBodyColor""",
"""    fontFamily = PlusJakartaSansFontFamily, // S11-guides-type
    fontWeight = FontWeight.Normal,
    fontSize = 14.sp,
    lineHeight = 22.sp,
    color = GuideBodyColor""")

gs = swap(gs, "quote style",
"""    fontStyle = FontStyle.Italic,
    fontWeight = FontWeight.Bold,
    fontSize = 19.sp,
    lineHeight = 28.sp,""",
"""    fontStyle = FontStyle.Italic,
    fontWeight = FontWeight.Medium,
    fontSize = 16.sp,
    lineHeight = 24.sp,""")

gs = swap(gs, "page title",
"""                        fontSize = 26.sp,
                        lineHeight = 31.sp,
                        fontWeight = FontWeight.Black,""",
"""                        fontSize = 22.sp,
                        lineHeight = 27.sp,
                        fontWeight = FontWeight.Bold,""")

gs = swap(gs, "tab row text",
"""                            text = tab.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,""",
"""                            text = tab.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,""")

gs = swap(gs, "tab pill text",
"""            text = tab.title,
            fontSize = 15.sp,
            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.Bold,""",
"""            text = tab.title,
            fontSize = 14.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.SemiBold,""")

gs = swap(gs, "hero title",
"""            fontWeight = FontWeight.Black,
            fontSize = 30.sp,
            lineHeight = 36.sp,""",
"""            fontWeight = FontWeight.Bold,
            fontSize = 24.sp,
            lineHeight = 30.sp,""")

gs = swap(gs, "section title row",
"""            fontWeight = FontWeight.ExtraBold,
            fontSize = 22.sp,
            lineHeight = 27.sp,""",
"""            fontWeight = FontWeight.Bold,
            fontSize = 18.sp,
            lineHeight = 23.sp,""")

gs = swap(gs, "pill tag",
"""            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = 0.8.sp,
            color = color""",
"""            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp,
            color = color""")

gs = swap(gs, "fact badge",
"""Text(text = label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GuideSoftColor)""",
"""Text(text = label, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = GuideSoftColor)""")

gs = swap(gs, "info box title",
"""                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                lineHeight = 23.sp,
                color = accent,""",
"""                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                lineHeight = 20.sp,
                color = accent,""")

gs = swap(gs, "accordion title",
"""                fontFamily = PlusJakartaSansFontFamily,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                lineHeight = 23.sp,
                color = Color.White,""",
"""                fontFamily = PlusJakartaSansFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                lineHeight = 20.sp,
                color = Color.White,""")

gs = swap(gs, "expand pill",
"""Text(text = label, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = accent)""",
"""Text(text = label, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = accent)""")

gs = swap(gs, "link pill",
"""Text(text = label, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = foreground)""",
"""Text(text = label, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = foreground)""")

gs = swap(gs, "search text style",
"""            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        ),""",
"""            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = Color.White
        ),""")

gs = swap(gs, "search placeholder",
"""Text(placeholder, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = GuideSoftColor)""",
"""Text(placeholder, fontSize = 13.sp, fontWeight = FontWeight.Normal, color = GuideSoftColor)""")

gs = swap(gs, "filter chip",
"""            text = label,
            fontSize = 15.sp,
            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.Bold,
            color = foreground,""",
"""            text = label,
            fontSize = 14.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            color = foreground,""")

gs = swap(gs, "empty note title",
"""                fontWeight = FontWeight.ExtraBold,
                fontSize = 20.sp,
                lineHeight = 25.sp,""",
"""                fontWeight = FontWeight.Bold,
                fontSize = 17.sp,
                lineHeight = 22.sp,""")

gs = swap(gs, "technique highlight",
"""                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                lineHeight = 27.sp,
                color = Color.White,
                modifier = Modifier.weight(1f)""",
"""                fontWeight = FontWeight.SemiBold,
                fontSize = 15.sp,
                lineHeight = 23.sp,
                color = Color.White,
                modifier = Modifier.weight(1f)""")

gs = swap(gs, "step number",
"""                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = accentColor""",
"""                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = accentColor""")

gs = swap(gs, "step category",
"""                text = category.uppercase(),
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,""",
"""                text = category.uppercase(),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,""")

gs = swap(gs, "step title",
"""                fontSize = 24.sp,
                lineHeight = 29.sp,
                fontWeight = FontWeight.Black,
                color = Color.White""",
"""                fontSize = 20.sp,
                lineHeight = 25.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White""")

gs = swap(gs, "story achievement label",
"""                            text = "ACHIEVEMENT",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,""",
"""                            text = "ACHIEVEMENT",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,""")

gs = swap(gs, "story achievement title",
"""                            fontSize = 24.sp,
                            lineHeight = 29.sp,
                            fontWeight = FontWeight.Black,""",
"""                            fontSize = 19.sp,
                            lineHeight = 24.sp,
                            fontWeight = FontWeight.Bold,""")

gs = swap(gs, "story byline",
"""                                fontSize = 15.sp,
                                lineHeight = 21.sp,
                                fontWeight = FontWeight.Bold,
                                color = GuideSoftColor""",
"""                                fontSize = 13.sp,
                                lineHeight = 19.sp,
                                fontWeight = FontWeight.Medium,
                                color = GuideSoftColor""")

gs = swap(gs, "campus subtitle",
"""                fontWeight = FontWeight.Bold,
                fontSize = 19.sp,
                lineHeight = 26.sp,""",
"""                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp,
                lineHeight = 23.sp,""")

gs = swap(gs, "featured label",
"""                        text = "FEATURED",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,""",
"""                        text = "FEATURED",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,""")

gs = swap(gs, "university / department / scholarship card titles",
"""                fontSize = 23.sp,
                lineHeight = 28.sp,
                fontWeight = FontWeight.Black,""",
"""                fontSize = 19.sp,
                lineHeight = 24.sp,
                fontWeight = FontWeight.Bold,""", count=3)

gs = swap(gs, "university location",
"""Text(text = uni.location, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = GuideSoftColor)""",
"""Text(text = uni.location, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = GuideSoftColor)""")

gs = swap(gs, "scholarship provider line",
"""                    fontSize = 17.sp,
                    lineHeight = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = WisdomAccentRose""",
"""                    fontSize = 15.sp,
                    lineHeight = 21.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WisdomAccentRose""")

# ---- FreeResourcesStateCard.kt ----
fr = swap(fr, "state card heading",
"""                    fontSize = 20.sp,
                    lineHeight = 25.sp,
                    fontWeight = FontWeight.ExtraBold,""",
"""                    fontSize = 17.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight.Bold,""")
fr = swap(fr, "state card message",
"""                fontSize = 16.sp,
                lineHeight = 25.sp,
                fontWeight = FontWeight.Bold,""",
"""                fontSize = 14.sp,
                lineHeight = 22.sp,
                fontWeight = FontWeight.Normal,""")

if errors:
    print("ERROR, nothing written:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
GS.write_text(gs, encoding="utf-8")
FR.write_text(fr, encoding="utf-8")
print("patched: GuidesScreen.kt, FreeResourcesStateCard.kt")
