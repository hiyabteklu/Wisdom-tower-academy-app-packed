#!/usr/bin/env python3
"""S13 patch for GuidesScreen.kt (too big for the chat tool to resend whole).

Every edit is an exact find-and-replace; each anchor must match EXACTLY ONCE in the file, otherwise
nothing is written and the script exits with an error (so a wrong guess can never half-apply).
Re-running is safe: the marker comment S13-GUIDES stops a second run.

What it does (all texts copied from website-reference/src/app/academy/{success-stories,scholarships}/page.tsx):
  - loading / error / empty message cards for the Success Stories and Scholarships tabs
  - removes the two header sentences that are not website text (shows the owner's page subtitle instead)
  - scholarship tips card shows the website intro (admin text or the website default)
  - hides empty parts (byline, provider, amount, deadline, level, country) instead of printing blanks
  - the fixed numbers in the University / Department headers and search hints now count the real lists
"""
import pathlib
import sys

PATH = pathlib.Path("app/src/main/java/com/wisdomtower/academy/ui/guides/GuidesScreen.kt")
MARKER = "S13-GUIDES"

EDITS = []


def edit(name, old, new):
    EDITS.append((name, old, new))


# 1. Stories header: the sentence is not website text; show the owner's page subtitle only if there is one.
edit(
    "stories-subtitle",
    r'''                Text(
                    text = "Students share how deliberate practice, active recall, and closed-book testing changed their scores and entrance results across Ethiopia.",
                    fontSize = 12.sp,
                    color = WisdomMuted,
                    lineHeight = 16.sp
                )
''',
    r'''                if (FreeResourcesLive.storiesSubtitle.isNotBlank()) {
                    Text(
                        text = FreeResourcesLive.storiesSubtitle,
                        fontSize = 12.sp,
                        color = WisdomMuted,
                        lineHeight = 16.sp
                    )
                }
''',
)

# 2. Stories: loading / error / empty states before the list.
edit(
    "stories-states",
    r'''        stories.forEach { story ->
            SuccessStoryCardItem(story = story)
        }
''',
    r'''        if (stories.isEmpty()) {
            if (!FreeResourcesLive.loaded) {
                FreeResourcesStateCard(null, "Loading…")
            } else if (FreeResourcesLive.storiesFailed) {
                FreeResourcesStateCard(null, "Could not load stories. Unable to load items right now.")
            } else {
                FreeResourcesStateCard("No stories yet", "Published stories will appear here.")
            }
        }
        stories.forEach { story ->
            SuccessStoryCardItem(story = story)
        }
''',
)

# 3. Story byline: website joins the non-empty parts with " · ".
edit(
    "story-byline",
    r'''Text("${story.name} • ${story.program} • ${story.year}", fontSize = 11.sp, color = WisdomMuted)''',
    r'''val byline = listOf(story.name, story.program, story.year).filter { it.isNotBlank() }.joinToString(" · ")
                    if (byline.isNotEmpty()) {
                        Text(byline, fontSize = 11.sp, color = WisdomMuted)
                    }''',
)

# 4. Scholarships header: website default subtitle unless the owner wrote one.
edit(
    "scholarships-subtitle",
    r'''text = "Funding options and how to prepare strong applications: local awards, national schemes, and international programs accepting Ethiopian applicants.",''',
    r'''text = FreeResourcesLive.scholarshipsSubtitle.ifBlank { "Funding options and how to prepare strong applications." },''',
)

# 5. Tips card: website intro (admin text or website default).
edit(
    "scholarships-intro",
    r'''text = "• Read eligibility notes carefully: many awards are limited by grade, field, gender, or need.\n• Start early. Strong applications need transcripts, recommendations, and a clear personal statement.\n• Keep a simple tracker of deadlines, required documents, and status.\n• Prefer official sites and verified partners.\n• Always verify deadlines and requirements on the official page.",''',
    r'''text = FreeResourcesLive.scholarshipsIntro.ifBlank { SCHOLARSHIP_DEFAULT_INTRO },''',
)

# 6. Scholarships: loading / error / empty states before the list.
edit(
    "scholarships-states",
    r'''        scholarships.forEach { sch ->
            ScholarshipCardItem(sch = sch)
        }
''',
    r'''        if (scholarships.isEmpty()) {
            if (!FreeResourcesLive.loaded) {
                FreeResourcesStateCard(null, "Loading scholarships…")
            } else if (FreeResourcesLive.scholarshipsFailed) {
                FreeResourcesStateCard(null, "Could not load scholarships: Unable to load items right now.")
            } else {
                FreeResourcesStateCard(
                    null,
                    "Individual scholarship cards will appear here as we publish them. Use the guide above while preparing applications."
                )
            }
        }
        scholarships.forEach { sch ->
            ScholarshipCardItem(sch = sch)
        }
''',
)

# 7. Scholarship card: hide empty provider / amount (website shows "provider · amount" only when present).
edit(
    "scholarship-provider",
    r'''Text(sch.provider.uppercase(), fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)''',
    r'''if (sch.provider.isNotBlank()) {
                        Text(sch.provider.uppercase(), fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = WisdomAccentRose)
                    }''',
)
edit(
    "scholarship-amount",
    r'''Text(sch.amount, fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = WisdomAccentEmerald)''',
    r'''if (sch.amount.isNotBlank()) {
                        Text(sch.amount, fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = WisdomAccentEmerald)
                    }''',
)

# 8. Badges: website hides empty deadline / level / country.
edit(
    "scholarship-badges",
    r'''                FactBadge(label = "Deadline: ${sch.deadline}")
                FactBadge(label = sch.level)
                FactBadge(label = sch.country)
''',
    r'''                if (sch.deadline.isNotBlank()) FactBadge(label = "Deadline: ${sch.deadline}")
                if (sch.level.isNotBlank()) FactBadge(label = sch.level)
                if (sch.country.isNotBlank()) FactBadge(label = sch.country)
''',
)

# 9. Fixed numbers -> real list sizes.
edit(
    "uni-badge",
    r'''Text("45 INSTITUTIONS", fontSize = 10.sp''',
    r'''Text("${universities.size} INSTITUTIONS", fontSize = 10.sp''',
)
edit(
    "uni-search",
    r'''placeholder = { Text("Search 45 universities by name or city…"''',
    r'''placeholder = { Text("Search ${universities.size} universities by name or city…"''',
)
edit(
    "dept-badge",
    r'''Text("26 UNDERGRADUATE FIELDS", fontSize = 10.sp''',
    r'''Text("${departments.size} UNDERGRADUATE FIELDS", fontSize = 10.sp''',
)
edit(
    "dept-search",
    r'''placeholder = { Text("Search 26 departments by title, career…"''',
    r'''placeholder = { Text("Search ${departments.size} departments by title, career…"''',
)


def main():
    text = PATH.read_text(encoding="utf-8").replace("\r\n", "\n")
    if MARKER in text:
        print("already applied, nothing to do")
        return 0
    for name, old, _ in EDITS:
        n = text.count(old)
        if n != 1:
            print(f"ERROR: anchor '{name}' found {n} times, expected exactly 1. Nothing was written.")
            return 1
    for name, old, new in EDITS:
        text = text.replace(old, new, 1)
    head = "package com.wisdomtower.academy.ui.guides\n"
    if head not in text:
        print("ERROR: package line not found. Nothing was written.")
        return 1
    text = text.replace(head, head + "\n// " + MARKER + ": patched by scripts/patch_guides_screen.py (see docs/HANDOVER.md)\n", 1)
    PATH.write_text(text, encoding="utf-8")
    print(f"OK: {len(EDITS)} edits applied to {PATH}")
    return 0


sys.exit(main())
