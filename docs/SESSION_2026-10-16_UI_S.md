# SESSION 2026-10-16 UI_S: M5 written (screen push / pop for overlays)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_R.md` and `docs/UI_MOTION_PLAN.md`.

## Owner request
"Continue" after M4: next slice = M5, opening cards and screen pushes.

## Current motion (G3: live `MainActivity.kt` on `main`, read)
- Full-screen overlays are plain `if (state != null) { Screen(...) }` blocks in the main `Box`: study workspace (zIndex 18), guides / Other resources (15), competitions (17). Opening or closing them is a cut. Back handling is a separate imperative chain (lines ~1698 to 1715) that only clears the state; untouched.

## What was written
- NEW `ui/theme/WisdomPushLayer.kt`: `WisdomPushLayer(item, zIndexValue) { item -> ... }`. Opens with a 56 dp slide from the right plus fade (280 ms decelerate); closes with fade and slide back (220 ms), keeping the LAST item as content until gone, then removed as before. The screen below shows through the fade. `graphicsLayer` only; touches work from the first frame.
- NEW `scripts/patch_m5_screen_push.py`: changes only the opening line of the three blocks (workspace, guides, competitions) and the guides' `initialSlug` (now the layer's last slug, so it does not flip to the fallback while sliding out), plus one import (anchored on `MyApplicationTheme`, a different line from M3's import anchor, so M3 and M5 can both be open without a merge conflict).
- Tested on a copy of the real `MainActivity.kt`: patched once, second run "already patched", diff = 1 import + 5 changed lines, braces balanced. Kotlin checked by reading only (no compiler).

## Owner step (plain words)
GitHub > Actions > **Apply pending patches** > Run workflow > script `patch_m5_screen_push.py` > branch `m5-screen-push` > wait for green > open and close a study workspace, an Other resources guide and the trophy screen, also with the phone Back button > merge. M3 is a separate run (`patch_m3_tab_transition.py`).

## Not done / UNSURE
- NOT covered: notifications screen (its content depends on `notificationOpenId`, cleared on close, so it would jump while sliding out), drawer screens (own `when` + BackHandler), admin console, tool overlays and dialogs (M7), the package list to package detail swap inside the Packages tab, and reader screens.
- While a screen slides out (220 ms) it still sits on top and its own BackHandler (if any) is still active; harmless but unmeasured.
- Values are starting values; tune on the phone.

## Next
M6: hubs and lists (row stagger, gauge easing, check pop).
