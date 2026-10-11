# Session log 2026-10-12 AD: OWNER PHONE TEST REPORT (7 problems) and fix plan

> Copy this entry into `STATUS.md` section A/C when a tool that can append to that 38 KB file is available. Repo is PUBLIC: no secrets.
> READ THIS BEFORE ANY OTHER WORK: it is the owner's current priority list (2026-10-12), above the older LEFT items.

## Owner report, 2026-10-12, after testing the app on the phone (in the owner's words, shortened only for typos)

1. **Planner, calculator, timer** should be in the app, not web based. Make them native, but take the design as it is from the references (website), so no need to start from scratch with a poor design and logic.
2. **AI tutor** also has no native amazing screen, it is still in that awkward overlay web.
3. **Scroll freezes most of the time (fundamental problem)**, especially in notes, question bank etc. Tapping and swiping cards horizontally works, but vertical scroll sticks totally: one scroll works, then 6 more attempts never move, even when the note is still at the start.
4. **Explicit download button on all learning content** (exam, book, note, flashcards, question bank...), even if small. Not on the hub card but on the real content (items are saved by chapter etc.). Each needs a clean download button, a download progress indicator (HUD) and a proper premium feel. Opening material should be instant; now it just spins and the owner cannot tell whether the network or the app is at fault.
5. **Font**: the whole app uses the system default font; texts are awkwardly tiny and the font is bad. Needs an amazing, more readable font through the entire app.
6. **Question banks do not show the confetti effect** on a correct answer. Why?
7. **Flashcards are not proper**: need a 3D flip effect, clean Next / Previous buttons, Learning / Again / Known ratings, and the text must be centered with balanced weight. Now the text sits in the first 2-3 lines and the big card is empty below.

Owner instruction: "Document these first, then start fixing."

## Known code facts (from earlier sessions, to save the next agent time)
- Item 1: the Study Tools dock on the Learning tab (`ui/learning/LearningScreen.kt`) sends every tile except "AI Tutor" to the website pop-up through `onOpenTool` (session X). Website references for the three tools must be located under `website-reference/` (search for planner / calculator / timer components) and ported, not redesigned.
- Item 2: the native tutor exists (`ui/study/NativeTutorScreen.kt`, opened from the Learning tab AI Tutor tile since `71cf1d25`). The owner still sees the web overlay, so some OTHER entry point (Home, drawer, bottom bar, `/ai` links in `MainActivity.kt` `openToolOverlay`) still opens the website. Find every entry point. Also the owner calls the screen not "amazing": design pass needed.
- Item 3: notes and quiz pages are local WebViews (`assets/notes/index.html`, `quiz.html`, `flashcards.html`) hosted by `NotesReaderScreen.kt`, `QuizExamScreen.kt`, `FlashcardsScreen.kt`. Hypothesis (unproven): vertical touch is stolen by the Compose parent (scroll/pager/gesture modifier around the AndroidView) or the page's scroll listener/bridge calls (session Y progress reporting) block the main thread; horizontal swipes work because they are handled by the page/pager.
- Item 5: fonts are in `ui/theme/Type.kt`; sizes in screens are mostly 10.5 to 12 sp (see `GuidesScreen.kt`), which is the "tiny text" problem.
- Items 6 and 7: confetti and haptics were explicitly NOT ported in N5 (see `NATIVE_CONTENT_PLAN.md` N5); flashcards are in `assets/notes/flashcards.html` + `FlashcardsScreen.kt` (N3).

## Fix order (decided by this agent; scroll first because it makes every other test impossible)
F1 scroll freeze (item 3) -> F2 flashcards (7) -> F3 confetti (6) -> F4 download buttons + progress + instant open (4) -> F5 fonts and sizes (5) -> F6 native tutor entry points and design (2) -> F7 native planner / calculator / timer (1). One step per commit; log each below.

## Progress log (append below)
- 2026-10-12 | Claude (chat) | DONE: this report documented | LEFT: F1 to F7 | NOTES: nothing built yet.
