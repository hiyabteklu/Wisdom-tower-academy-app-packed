# Glass look plan (owner request 2026-10-13)

Reference: the **Targets** screen (`NativeTargetsScreen.kt`). Cards there are see-through: white 4% fill, white 8% edge,
so the glow of `AtmosphereBackground` shows through. The rest of the app uses `WisdomModernCard` / `0xFF111B2E` at
80-96% opacity, which is almost solid, so it looks flat.

Tokens and the shared card live in `ui/theme/WisdomGlass.kt` (`WisdomGlassCard`, `WisdomGlassFill`, `WisdomGlassFillStrong`,
`WisdomGlassFillQuiet`, `WisdomGlassBorder`). Dialogs and dropdown menus stay opaque (they must stay readable).

One area per step, each step checked on the phone before the next:

1. **Hub lists** (books, notes, flashcards, question banks, exams listings) + round back button. `HubItemListScreen.kt`. [~]
2. **Tools**: the tool cards on the Learning screen and the study workspace. `LearningScreen.kt`, `StudyWorkspaceScreen.kt`. [~] (Learning screen done in `f8e5b618`; `StudyWorkspaceScreen.kt` not confirmed.)
3. **Packages and courses**: package, semester and course cards, the card body of `OpenCard`. `OpenCard.kt` (one card for every package, subject, semester, course, entrance stream/subject/year) and the round back button in `PackageDetailScreen.kt`. [~] Not done in this area: `GpaCalculatorCard.kt` (Freshman page), left for a later step.
4. **Account, Settings, drawer, notifications**.
5. **Guides + Home**: success stories, universities, departments, scholarships, resource cards. (Then switch the
   default of `WisdomModernCard` itself to glass so any card not yet touched follows.)
6. **Inside the tools**: notebook, planner, timer, status, tutor, calculator, flashcards, quiz panels.
7. Optional: the glow orbs in `AtmosphereBackground` show as hard-edged rectangles on some phones (visible in the
   screenshots); soften them so the glass shows a smooth glow.

Legend: [~] written, not tested on a phone.
