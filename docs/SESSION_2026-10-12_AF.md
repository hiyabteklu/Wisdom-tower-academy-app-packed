# Session log 2026-10-12 AF: NEXT STEPS (read this first, then session AE and AD)

> Written because the owner's chat quota ran out. Repo is PUBLIC: no secrets. Details of what was done: `docs/SESSION_2026-10-12_AE.md`. Owner's original 7-problem list: `docs/SESSION_2026-10-12_AD.md`.

## State
- Done, NOT yet tested on a phone: F1 (scroll freeze guess, `ShellPause.kt`), F2 flashcards (3D flip, centered text, Previous/Next, Again/Learning/Known), F3 confetti (`richtext.js`), F4 download buttons + instant open (`LearningContentRepository.kt`, `HubItemListScreen.kt`).
- Kotlin changes since `023dbe65` have NOT been compiled (CI result unknown from chat). FIRST ask the owner to check GitHub > Actions is green after commit `1958b2f1`; if red, read the error and fix before anything else; log it in `docs/BUILD_PITFALLS.md`.

## Next steps, in order
1. **Owner phone test of F1 to F4** (checklists are in session AE). If vertical scroll is STILL stuck in Short Notes / Question Banks: try the second hypothesis (session AE note 3): `overflow-x: auto` blocks (`.katex-display`, `pre`, `.scroll-x` in `richtext.css`) capturing touches; also read `quiz.html` for touch handlers and the host of `StudyWorkspaceScreen` in `MainActivity.kt` (huge: use targeted search, patch script rule 10).
2. **F5 fonts and sizes** (owner problem 5): the whole app uses the system font and many texts are 10.5 to 12 sp. Pick one readable font packed in the app (bundle the font file under `res/font`, no network), set it in `ui/theme/Type.kt`, raise the smallest sizes (screens such as `GuidesScreen.kt`, `HubItemListScreen.kt` sublines, notes/quiz/flashcards pages use `-apple-system, Roboto`: switch them to the same font through `@font-face` in `assets/notes/`). Check the font license (free, e.g. OFL) and keep CI green. One screen per commit.
3. **F6 native AI tutor** (problem 2): `ui/study/NativeTutorScreen.kt` exists and opens from the Learning tab, but the owner still sees the website overlay from some other entry point. Find every entry (Home, drawer, bottom bar, `/ai` links, `openToolOverlay` in `MainActivity.kt`) and route them to the native screen; then a design pass.
4. **F7 native Planner, Calculator, Timer** (problem 1): port from the website components (search `website-reference/` for planner / calculator / timer), same design and logic, not a redesign. Learning tab Study Tools dock (`ui/learning/LearningScreen.kt`) currently sends them to the web pop-up through `onOpenTool`.
5. **F4 leftovers**: download button inside the viewers, "Download all in this hub", a way to delete downloads; confetti on a high score in the result card.
6. Older LEFT items still open (see `STATUS.md` and session AC): P6 / P5 patches, N9b, N11, S9 to S11, owner questions in `HANDOFF.md` section 8.

## Owner decisions to remember
- "Known" (not "Know") on flashcards was the owner's wording; change back if they prefer the website text.
- Owner rule: never say "file too big for my tools": use a patch script (`docs/EDITING_LARGE_FILES.md`).
