# Session log 2026-10-14 resources_ios: "Other resources" iOS-style redesign (Home tiles + 6 guide pages)

> Repo is PUBLIC: no secrets, no personal data. Branch `ui/other-resources-ios`. NOT compiled by CI, NOT run on a device. Status of the code: `[~]` written, not compiled or tested.

Task name: T9 (owner request "Other resources section", not one of T1 to T6). NOTE: the first version of this log said it was recorded as T9 in `docs/UI_POLISH_TASKS.md` section 4. That was NOT done (correction, 2026-10-14). This log is the T9 record until `docs/UI_POLISH_TASKS.md` is next rewritten.

## Owner words (2026-10-14, copied as written, shortened only for typos)
- "continue improving the iOS like feel ui, pill like buttons, soft touch (I liked the animation on the login/sign up page, the way it expands and retracts). The mobile ui shown is how the buttons should round, it's not our color plate."
- "Now improve the other resources section. Currently it's poor, tiny text font. Make the titles (the subtitles) use heavy (large) fonts in all the texts of the other resources section. Use proper native icons in all the body texts (as bullets or section markers), another level of animation, transition and expansion. Increase font sizes, proper coloring. Make the entire section amazing to read."
- Later the same day: the goal is to SEE it working in the app (not a description of it).

## Plan (written before the code)
1. Read: HANDOFF section 0, UI_POLISH_TASKS (G1 to G9), BUILD_PITFALLS, `GuidesScreen.kt`, `HomeScreen.kt`, `WisdomComponents.kt`, `Type.kt`, `NativeSignInScreen.kt` (source of the motion language).
2. Files to change (all small or medium, resent whole, none forbidden by G1): `ui/guides/GuidesScreen.kt`, `ui/guides/FreeResourcesStateCard.kt`, `ui/home/HomeScreen.kt`, `ui/theme/WisdomComponents.kt`.
3. G4: every sentence on the guide pages stays exactly as it is in the current file (audited against the website on 2026-10-11). Only the look, sizes, icons and motion change.

## What is on this branch (5 commits after main `374b6c4`, all pushed 2026-10-13 23:23 to 23:28 UTC)
- `eed6f30` this log.
- `5e5495d` `FreeResourcesStateCard.kt`: heading 20 sp heavy, message 16 sp.
- `d1c6cd9` `GuidesScreen.kt` (whole file): page title 26 sp Black; hero title 30 sp Black with accent glow and round icon tile; card titles 22 sp ExtraBold; body 16 sp on 26 sp lines, light slate; pill tabs with icon and colour glide; round icon tiles on every section title; native icon bullets (check, warning, block, star, lightbulb, thumb up, work, book) instead of text dots; accordion rows with a turning chevron and spring expand + fade; "More / Less / Read full story" pills; staggered rise-in of every block; soft press-in (scale 0.96, spring 0.6 / 500) on every tappable pill; tab content cross-fades and slides. All sentences unchanged.
- `65f4604` `WisdomComponents.kt`: `WisdomPrimaryButton`, `WisdomSecondaryButton`, `WisdomOpenButton` are now pill shaped with the same soft press-in; tappable `WisdomModernCard` presses in (0.975). New helper `Modifier.wisdomPressScale`. No function was removed or renamed (compared with main).
- `1453b0a` `HomeScreen.kt`: "Other resources" heading 26 sp Black; six tiles are big rounded tiles tinted with each guide's colour, 52 dp round icon, round arrow, 18 sp ExtraBold title (two lines reserved), staggered rise-in, press-in.

## Review done in session 2026-10-14 (code read only, no build possible)
- Read the whole pushed `GuidesScreen.kt` (84,938 bytes, complete, not truncated), `GuidesData.kt`, `FreeResourcesLive.kt`, `FreeResourcesStateCard.kt`, and compared `WisdomComponents.kt` with main.
- Checked: every symbol used exists (`GUIDE_TABS`, `GuideTab.accentColor`, `UNIVERSITIES_SUBTITLE`, `SCHOLARSHIP_DEFAULT_INTRO`, `FreeResourcesLive.*`, `UniversityDetail` and `DepartmentDetail` fields, `OpenCard.kt` and `EntranceData.kt` in `ui/packages`); every `Modifier.xxx` has its import; icons used are the ones already used elsewhere in the app or standard Material (core or extended); no `rememberRipple`; no `@Composable` call inside a `LazyColumn` builder (all inside `item { }`); no trailing lambda on a function whose last parameter is not the lambda.
- Found NO compile error by reading. This is NOT proof: only the CI build is proof.
- Forbidden files (G1): none touched. `.env.example`, Gradle, workflows, manifest, `MainActivity.kt` untouched.

## What is left
- Run CI on this branch and fix anything red (see "Owner steps").
- Owner phone test, then merge to `main`.
- Not done (not requested yet): other screens still use their old text sizes.

## Owner steps (no coding)
1. GitHub > Actions > "Build Production AAB & APK" > Run workflow > choose branch `ui/other-resources-ios` > Run. When green, download artifact `Wisdom-tower-academy-APK` and install it. (Main stays untouched.)
2. Phone checklist: Home > Other resources: 6 big tiles, big titles, tap each (it presses in softly). Each guide page: big titles, icon bullets, accordions open and close smoothly, tabs glide, nothing blinks. Then the regression list in HANDOFF section 9 for Home.
3. If it looks right: merge the pull request. If CI is red: send the red lines (or say "CI red") and the next agent fixes them first.

## UNSURE / hypotheses
- Hypothesis: all 6 tiles fit on small phones with 18 sp titles; "Universities Directory" and "Departments Guide" may wrap to two lines (two lines are reserved on purpose).
- Hypothesis: `Icons.Filled.Bedtime`, `Bolt`, `Groups`, `Block`, `Work`, `WbSunny`, `ThumbUp`, `Book` exist in the material-icons-extended build used by the app; only CI can confirm. If one is unresolved, replace it with an icon already used in the app (for example `Icons.Filled.Star`).
- Not verified: the animation feel on a real phone.
