# SESSION 2026-10-16 UI_P: M2 written (bottom nav pill, motion v2)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_O.md` and `docs/UI_MOTION_PLAN.md`.

## Owner request
"Continue": next slice, M2 = the bottom navigation pill is not smooth / not iOS like / flickers (shape and design are good, keep them).

## Root cause (G3: live code read, `MainActivity.kt` as on `main` 2026-10-16, function `AliveBottomNav`, marker `FloatingPillNav v1`)
- VERIFIED in code: five separate `animateFloatAsState` width animations (420 ms) are read in composition, so the whole nav recomposes on every frame of the slide.
- VERIFIED: the selected label ALSO animates its own width (`AnimatedVisibility` + `expandHorizontally` 320 ms / `shrinkHorizontally` 240 ms) on top of the weight animation: two clocks changing the same width.
- VERIFIED: the tap sets `pending`, waits `delay(70)`, then calls `onItemSelected`, which sets `selectedIndex`; the page switch is a plain `if (selectedIndex == n)` per tab (lines ~3169 to 3300: Home, Learning, Packages, Account, Settings), so the new page is built from nothing in one frame, in the middle of the 420 ms slide.
- HYPOTHESIS: that heavy frame is the visible "flash"; the two width animations are the jitter. Not measured on a device.

## What was written
- NEW `scripts/patch_m2_nav_pill.py` (patch P-M2). Replaces the `AliveBottomNav` block (marker becomes `FloatingPillNav v2`) and adds 6 imports. Everything outside that function is untouched, including the call site (`resetOverlays(); stopNavigationLoading(...); selectedIndex = index`), back handling and `selectedIndex` ownership.
- ONE spring clock `pos` (damping 0.85, stiffness 420, a very small settle) = the fractional index of the selected tab. Pill position, pill width, every tab width and the label opening all derive from it in a custom `Layout`; `pos` is read only in the layout and draw phases, so the nav does not recompose per frame. Total width stays constant, so the pill glides continuously between slots.
- The label no longer uses `AnimatedVisibility`: its width and fade follow `pos` (it appears after 35% of the opening).
- The page switch now happens on the tap (no 70 ms delay), so the heavy page build lands BEFORE the glide starts. This is a hypothesis; if the glide still hitches, M3 (tab cross-fade) is the next lever.
- Unchanged: track (52 dp, gradient, border, cyan glow), pill look (40 dp, cyan gradient, 1 dp edge), icons 22 dp, label 12 sp, haptic, press-in 0.94, tint fade 260 ms, 2.35 : 1 widths, inset 4 dp, `onItemSelected` contract.

## Evidence
- Script run on a copy of the real file (253,612 bytes, read from `main`): patched once, second run says "already patched", braces balance (0), `AliveBottomNav` appears once, imports added once. No Kotlin compiler was available in my sandbox, so the Kotlin itself was checked by reading only (all used symbols and imports checked against the file). Per the owner rule, written code counts as done; a red build will be shown by the owner.
- `restore_mainactivity.py` keeps an existing valid `MainActivity.kt`, so no repack is needed (earlier nav patches did not repack either).

## Owner step (plain words)
GitHub > Actions > **Apply pending patches** > Run workflow > script `patch_m2_nav_pill.py` > branch `m2-nav-pill` > wait for green > try the 5 tabs slowly and fast > merge the pull request. Also waiting: `patch_m1_settings_accordion.py` (branch `m1-settings-motion`). Run M1 first and merge it, then M2 (both start from `main`; they touch different files).

## Left / next
- M3: tab content cross-fade (the `if (selectedIndex == n)` blocks), with state kept.
- UNSURE: the spring overshoot is clamped at the ends so the pill never leaves the track; if the settle feels too bouncy, raise `dampingRatio` in the script's `spring(...)`.
- Plan status table (`docs/UI_MOTION_PLAN.md` section 7) not edited: M1 and M2 are WRITTEN, waiting for the owner to apply the patches; the newest session logs are the truth.
- Competition board not edited (UI work).
