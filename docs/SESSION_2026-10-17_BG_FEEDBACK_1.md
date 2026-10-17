# SESSION 2026-10-17 BG_FEEDBACK_1 (owner phone test after PR #59). READ with docs/PLAN_BACKDROP_REMAINING.md

Written and pushed, NOT compiled by me, CI NOT seen, NOT seen on a phone. Two screenshots: drawer open (text of the cards behind it mixes with the drawer text) and the Packages tab while loading (flat solid dark panel with the spinner between the top bar and bottom nav).

## Owner words (2026-10-17)
1. "it blinks the solid color on every click, every swipe left or right in flashcards, every next or click answer on exams... Literally on every click it blinks."
2. "sometimes it comes later, in loading it's black, especially on notes, exams, flashcards, etc. In bottom navigation it's good, no blink in transitions"
3. "remove the other options, keep the dark and BG_2, and make them two icons clickable smooth pill."
4. "on overlays and pop ups, texts are overlapping with background or what's beneath, so either dim slightly the background or increase the opacity on the overlay or pop ups (slightly, not huge difference), example the drawer, the clock setting and any other sections and pop ups that appear over content, be careful for readability"
5. "the glass like design is good, but increase the value slightly, cuz currently the background is also glass like texture, they are being invisible. Not huge difference, but increase the value everywhere similarly."

## DONE this session
- Problem 1 (hypothesis for cause, see KDoc in `AppBackdrop.kt`): the glass script re-ran 120 ms after a class change (new or changed panels painted solid meanwhile) and a page background transition made the measured colour wrong and faded solid to glass. Fix `AppBackdrop.kt` (c4b11e8e): script now runs inside the MutationObserver callback (before the next paint) and finishes background transitions before measuring and after applying.
- Problem 5: glass in web pages 5 to 8 percent (`AppBackdrop.kt`); night card tokens and card gradient 40 to 52 percent (`Color.kt`, 0d212957).
- Problem 4 (part): `Theme.kt` (d6740866) pop-up navy 70 to 82 percent, low 60 to 75, chip 20 to 25. Covers default dialogs, menus, clock, date picker, sheets.

## NOT DONE (next slices, one per chat)
- **S-DRAWER (problem 4, the drawer in the screenshot)**: the drawer panel is drawn inside `MainActivity.kt` (rows from `overflowMenuLinks`, "About Academy"), it is much more see-through than the theme pop-ups. Needs a patch script: find the drawer panel `background(` colour (search `Color(0x` near the drawer, `ModalDrawerSheet` was NOT found by code search, so it is a custom panel), raise it to about 85 percent, optionally add a slight dim scrim behind it. Also the bottom-nav glass 6 percent to about 9 percent (patch script `patch_backdrop_nav_names.py` already merged; edit the literal). Keep glass strengths in step: web 8, tokens 52, nav 9.
- **S-LOADING (problem 2)**: the black comes before `onPageFinished` (the page's own navy shows until the script runs) and from native loading panels: the Packages loading screen is a flat solid dark panel. Plan: (a) in the 6 WebView screens (NotesReaderScreen, FlashcardsScreen, QuizExamScreen, NativeTutorScreen, CompetitionExamScreen, CompetitionReviewView) hide the WebView (alpha 0) until the glass script has run, then fade it in, the backdrop shows meanwhile; (b) find the Packages and other native loading boxes with a solid fill and make them transparent. Do not touch HTML files.
- **S-BGPICKER (problem 3)**: keep only the Dark option and BG_2 in `ui/theme/AppBackground.kt` and `ui/settings/BackgroundSection.kt`; show two small icon buttons inside one smooth pill (animated selected highlight, like the bottom nav pill); an old saved choice of a removed option must fall back to Dark. Read both files first (not read yet; names from docs/SESSION_2026-10-17_B5_BACKGROUND_REWORK.md, the options may have been renamed since).
- Phone check after the CI is green: flashcard swipe, exam next/answer, notes open, drawer, clock pop-up.
