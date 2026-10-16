# SESSION 2026-10-16 UI_T: M6 written (hubs and lists: row entrance, eased progress, check pop)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_S.md` and `docs/UI_MOTION_PLAN.md`.

## Owner request
"Continue" after M5: next slice = M6, hubs and item lists.

## Current motion (G3: live code on `main`, read)
- Hub cards on the workspace screen already get the M4 entrance (they use `openGrid`).
- `HubItemListScreen.kt`: rows are plain `WisdomGlassCard`s in a `LazyColumn` (no entrance); the thin bar under a downloading row is `fillMaxWidth(progress)` (jumps with every update); loading is a bare `CircularProgressIndicator`.
- `DownloadGauge.kt`: the arc is drawn straight from `progress`; the green check simply appears.

## What was written
- `ui/study/DownloadGauge.kt` (whole file resent, signatures unchanged, so `HubItemListScreen` and `PdfReaderScreen` callers are untouched): the circular arc eases (250 ms) to the real value (the percent text still shows the real number); the check mark pops with a short spring (0.55 to 1) ONLY when a download that was seen running has just finished (rows already saved when the list opens do not pop).
- NEW `scripts/patch_m6_hub_rows.py` for `HubItemListScreen.kt` (22 KB, patched with exact anchors instead of resending): each row is wrapped in `Modifier.wisdomReveal("hub_<hub>_<id>", index)` (once per session, first 8 staggered), the thin bar eases to the real value, plus 3 imports. Only the lines named are changed.

## Evidence
- The script was tested on a SYNTHETIC file holding the real anchor lines (copied from the file as read on `main`), not on the real file: patched once, second run "already patched", output read. Anchors are refused unless they match exactly once, braces are checked, so a mismatch writes nothing.
- No Kotlin compiler in my sandbox. Read-checked: new imports in `DownloadGauge.kt` (`Animatable`, `animateFloatAsState`, `spring`, `tween`, `LaunchedEffect`, `getValue`, `mutableStateOf`, `remember`, `setValue`, `graphicsLayer`); inside `graphicsLayer { }` only `scaleX` / `scaleY` are used.
- The gauge change is plain Kotlin on `main` and needs no owner action; the list rows need the Action below. Until the Action runs, rows have no entrance but everything works as before.

## Owner step (plain words)
GitHub > Actions > **Apply pending patches** > Run workflow > script `patch_m6_hub_rows.py` > branch `m6-hub-rows` > wait for green > open a hub list (notes, books), start a download, watch the bar and the check mark > merge. Waiting runs from before: `patch_m3_tab_transition.py`, `patch_m5_screen_push.py`.

## Not done / UNSURE
- Loading spinner to content cross-fade: NOT done (the spinner is replaced by the rows, which now rise in).
- Progress bars and rings elsewhere (Learning course progress, Account gauge) are NOT touched: not read yet.
- The first frame of a check pop may show the full-size check for one frame before the spring starts (the effect runs after composition). Unmeasured.
- Rows deeper than the 8th appear with no stagger delay (by design).

## Next
M7: drawer, top bar, notifications, splash handoff, dialogs.
