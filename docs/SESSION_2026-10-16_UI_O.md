# SESSION 2026-10-16 UI_O: M1 written (motion kit + Settings accordions)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_N.md` and `docs/UI_MOTION_PLAN.md`.

## Owner request
"Continue" (after the plan was pushed): start execution with the first slice, M1.

## Root cause (G3, verified in code before the change)
`SettingsAccordionCard` in `SettingsScreen.kt` showed the body with a plain `if (isExpanded)`; the chevron never rotated; the three chip groups (study minutes, study window, font size) switched colours in one frame.

## What was written
- NEW `app/src/main/java/com/wisdomtower/academy/ui/theme/WisdomMotion.kt`: `WisdomMotion` (values), `WisdomExpandable` (expand + fade 280 ms, quicker close 220 / 160 ms: the approved sign-in motion), `wisdomAnimatedColor` (240 ms colour glide). New file, imports checked, no new dependency.
- NEW `scripts/patch_m1_settings_accordion.py` (patch P-M1). `SettingsScreen.kt` is 67 KB, over the 30 KB resend limit, so it is changed by script (`docs/EDITING_LARGE_FILES.md`). Changes: the body uses `WisdomExpandable`; chevron rotates 180 degrees (spring 0.8 / 400) and turns cyan while open; the card edge turns cyan (40%) while open; chips fade between selected and idle colours. No text, size or layout changes.
- The script writes nothing unless every anchor matches the expected count (12 edits, 6 groups of chips counted). Tested on a fixture copy of the anchor lines, run twice (second run says already patched). NOT run on the real file by me: I have no checkout. The anchors were copied from the real file as read on 2026-10-16.

## Owner step (plain words)
GitHub > Actions > **Apply pending patches** > Run workflow > script `scripts/patch_m1_settings_accordion.py` > new branch name `m1-settings-motion` > wait for green > open Settings and try every card > merge the pull request. Until this is merged, Settings does not change.

## Left for later slices (not in M1)
- Press-in feedback on the plain `.clickable` boxes in Settings (Edit Profile, Save, Sync, Update Password, volume Reset).
- `MySubjectsSection.kt` and `AccountDeletionSection.kt` open / close (not read yet; read them at the start of M1b or M6).
- The ToggleRow switch is the stock Material switch (already animates).

## UNSURE
- Hypothesis: the header ripple stays as is. If the card edge colour change feels too strong, lower the 0.4 alpha in the patch.
- `AnimatedVisibility` inside a `LazyColumn` item changes the item height; Compose handles this, but check on the phone that opening the last card (Security) keeps the Update Password button visible; if not, the next slice adds `bringIntoView`.
- Competition board not edited (UI work).
