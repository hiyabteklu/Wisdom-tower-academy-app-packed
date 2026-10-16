# SESSION 2026-10-16 UI_R: M4 written (card entrance on every card grid)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_Q.md` and `docs/UI_MOTION_PLAN.md`.

## Owner request
"Continue" after M3: next slice = M4, entrance choreography (cards appear, staggered).

## Current motion (G3: live code on `main`, read)
- `OpenCard.kt` holds the ONE card and `openGrid(prefix, list, card)` (two cards per row, `LazyListScope` items keyed `<prefix>_row_<n>`). It is used by Home (`programs`), Packages (`grades`, `branches`), Package detail (`freshman`, `ece_semesters`), Learning (`curriculum`) and the study workspace (`hubs`). No entrance animation: rows compose in one frame. VERIFIED by reading.
- Home's "Other resources" tiles (`ResourceTile` in `HomeScreen.kt`) already have their own approved entrance (delay 60 ms per tile, 420 ms). Left untouched.

## What was written
- NEW `ui/theme/WisdomReveal.kt`: `@Composable Modifier.wisdomReveal(key, index)`. Fade 0 to 1, rise 24 dp, scale 0.96 to 1, 320 ms ease-out, first 8 items 45 ms apart. Plays once per key per app session (a session-wide key set), so scrolling back, changing tabs or recomposing never replays it. `graphicsLayer` only (no recomposition per frame); touches work from the first frame.
- `ui/packages/OpenCard.kt` (whole file resent; ONLY changes: one import and `.wisdomReveal("${prefix}_row_$rowIndex", rowIndex)` on the row modifier in `openGrid`). Because every grid uses `openGrid`, Home, Packages, Package detail, Learning and the hub lists all get the entrance from this one line.

## Evidence
- Code read only. No Kotlin compiler in my sandbox. Imports of the new file checked one by one; inside `graphicsLayer { }` the names `alpha`, `scaleX`, `scaleY`, `translationY` are the layer's own properties (as intended). Per the owner rule, written code counts as done; a red build will be shown by the owner.
- No owner action needed: this is plain Kotlin on `main` (no patch script). M3 is separate and still needs its Action run.

## Not done / UNSURE
- Hero line and the "Open Learning" card at the top of Home are NOT revealed separately (they are not in `openGrid`; `HomeScreen.kt` would need a patch). Left for a later slice if wanted.
- The study workspace grid uses the same prefix (`hubs`) for every package, so its entrance plays once per app session, not once per package. Say so if you want it to replay for each package.
- With M3 the new tab itself fades in over ~270 ms, so the first cards' entrance overlaps with it on a first visit. Tune on the phone.
- Scroll-depth effect (`wisdomScrollDepth`) not written (optional in the plan).
- Plan status table (section 7) still stale; the session logs are the truth: M1, M2, M3, M4 written.

## Next
M5: opening cards and screen pushes (package to detail to hub to reader).
