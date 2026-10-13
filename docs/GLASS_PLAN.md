# Glass look plan (owner request 2026-10-13)

**Owner rules (2026-10-13):** agents continue to the next area without waiting for phone tests; the owner tests when
done and reports problems. Do not write test steps as requirements in the repo.

Reference: the **Targets** screen (`NativeTargetsScreen.kt`). Cards there are see-through: white 4% fill, white 8% edge,
so the glow of `AtmosphereBackground` shows through. Before this plan the rest of the app used `WisdomModernCard` /
`0xFF111B2E` at 80-96% opacity, which is almost solid, so it looked flat.

Tokens and the shared card live in `ui/theme/WisdomGlass.kt` (`WisdomGlassCard`, `WisdomGlassFill`, `WisdomGlassFillStrong`,
`WisdomGlassFillQuiet`, `WisdomGlassBorder`). Dialogs and dropdown menus stay opaque (they must stay readable).

Areas (one at a time):

1. **Hub lists** + round back button. `HubItemListScreen.kt`. Written.
2. **Tools**: Learning screen tool cards. `LearningScreen.kt` written (`f8e5b618`); `StudyWorkspaceScreen.kt` not confirmed.
3. **Packages and courses**: `OpenCard.kt` and the round back button in `PackageDetailScreen.kt`. Written. `GpaCalculatorCard.kt` inner panels: written in area 8 (`53ebdaa6`).
4. **Account, Settings, drawer, notifications**: Notifications written (`16beca75`). Settings, drawer pages and Account follow area 5's default switch; `scripts/patch_glass_area4.py` (P18) is now only needed for the round back button of the drawer pages (it also renames the card token, harmless). Logs: `docs/SESSION_2026-10-13_A.md`, `_B.md`.
5. **Guides + Home + default switch**: DONE by switching the default of `WisdomModernCard` itself (and `WisdomSecondaryButton`) to glass in `WisdomComponents.kt` (`0daf86da`). Every screen that still calls them (Guides, Home, Settings, Drawer pages, Account, resource cards, GPA card) is now glass; explicit accent `borderColor` arguments are kept. Panels drawn by hand with hard-coded dark colours (not through this card) are NOT covered; find them per screen in the next pass.
6. **Inside the tools**: notebook, planner, timer, status, tutor, calculator, flashcards, quiz panels. AUDITED 2026-10-13 (`docs/SESSION_2026-10-13_D.md`, corrected in `_E.md`): Notebook, Status and Targets use a near-solid outer panel (`0xFF0C1626` / `StPanelBg` at 85%) with glass rows and pills inside; Calculator, Planner and Timer outer panels are fully solid (`0xFF0A1122`, `0xFF0F172A`). Making the outer panels see-through would be MORE than the Targets reference: OWNER DECISION needed; how to do it (patch script) is in the `_D` log. Dialogs, WebView backgrounds and the PDF page badge stay opaque.
7. **Glow orbs** in `AtmosphereBackground`: DONE [~] (`e984d681`, `WisdomComponents.kt`). The blur was clipped to its square box (hard rectangles) and does nothing on Android 11 and older; now two radial gradients that fade to transparent. Strength `peakAlpha` 0.11 / 0.08 is an estimate; tweak after the owner sees it.
8. Hand-drawn dark panels outside the shared card: `GuidesScreen.kt` written as P19 (`scripts/patch_glass_guides.py`, not yet run); `ui/study/*` searched (see area 6); `ui/home`, `ui/settings`, `ui/learning`, `ui/packages`, `ui/account`, `ui/auth`, `ui/notifications` searched 2026-10-13 (`docs/SESSION_2026-10-13_E.md`): only the GPA panels needed a change (done). Remaining unchecked: `MainActivity.kt` drawer and bottom bar (needs a patch script) and one small panel `0xFF0F1829` in `AccountScreen.kt`.
