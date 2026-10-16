# BUILD PITFALL found in M7 (2026-10-16, run #540 failed, `MainActivity.kt:2169`)

**Error:** `fun RowScope.AnimatedVisibility(...) cannot be called in this context with an implicit receiver. Use an explicit receiver if necessary.`

**Cause:** the notification bell dot lives in `IconButton { Box { ... } }`, which is lexically inside the top bar `Row`. Inside the inner `Box` (BoxScope) the compiler resolves `AnimatedVisibility` to the `RowScope` version from the outer `Row`, and two layout scopes (`@LayoutScopeMarker`) may not be mixed through an implicit receiver. The timer chip further up compiles because it sits directly in the `Row`.

**Fix (patch_m7b_bell_dot.py):** no `AnimatedVisibility` there; the dot is a `Box` whose scale comes from `animateFloatAsState(spring)` and is applied with `graphicsLayer`.

**DO NOT:** never call `AnimatedVisibility` (or any `RowScope` / `ColumnScope` extension) inside a `Box` / `IconButton` lambda that is nested in a `Row` / `Column`. Use `animate*AsState` + `graphicsLayer`, or hoist the call to the Row / Column level. (Merge this entry into `docs/BUILD_PITFALLS.md`.)

The original `scripts/patch_m7_overlays.py` still contains the old bell-dot edit; on a clean tree run `patch_m7_overlays.py` and then `patch_m7b_bell_dot.py`.
