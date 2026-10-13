# Session log 2026-10-14 resources_ios: "Other resources" iOS-style redesign (Home tiles + 6 guide pages)

> Repo is PUBLIC: no secrets, no personal data. Branch `ui/other-resources-ios` (NOT merged to `main`). NOT compiled, NOT run on a device.

IN PROGRESS: owner request "Other resources section" (not one of T1 to T6; recorded as T9 in `docs/UI_POLISH_TASKS.md` section 4).

## Owner words (2026-10-14, copied as written, shortened only for typos)
- "continue improving the iOS like feel ui, pill like buttons, soft touch (I liked the animation on the login/sign up page, the way it expands and retracts). The mobile ui shown is how the buttons should round, it's not our color plate."
- "Now improve the other resources section. Currently it's poor, tiny text font. Make the titles (the subtitles) use heavy (large) fonts in all the texts of the other resources section. Use proper native icons in all the body texts (as bullets or section markers), another level of animation, transition and expansion. Increase font sizes, proper coloring. Make the entire section amazing to read."

## Plan (written before the code)
1. Read: HANDOFF section 0, UI_POLISH_TASKS (G1 to G9), BUILD_PITFALLS, `GuidesScreen.kt`, `HomeScreen.kt`, `WisdomComponents.kt`, `Type.kt`, `NativeSignInScreen.kt` (source of the motion language).
2. Files to change (all small or medium, resent whole, none forbidden by G1): `ui/guides/GuidesScreen.kt`, `ui/guides/FreeResourcesStateCard.kt`, `ui/home/HomeScreen.kt`, `ui/theme/WisdomComponents.kt`.
3. G4: every sentence on the guide pages stays exactly as it is in the current file (audited against the website on 2026-10-11). Only the look, sizes, icons and motion change.
