# SESSION 2026-10-16 UI_AI: M11 slice 9, drawer screens push / pop (patch script)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AH.md`. Owner said: continue (default choice named in UI_AH: the drawer push / pop).

## Step 1: what the code really does (read from `main`, G3)
- `PR #39` (`patch_m11_dialogs.py`) is merged (`9d92cee`), so slice 8 is applied.
- `MainActivity.kt` (live, read whole): the drawer screens are one block, `if (activeDrawerScreen != null) { BackHandler(enabled = true) { activeDrawerScreen = null }; when (activeDrawerScreen) { "about" -> AboutScreen(...) ... "terms" -> TermsScreen(...) } }`, each screen at `zIndex(25f)`. No motion on open or close: the screen appears and vanishes in one frame. M5 left it out on purpose; the notifications screen got `WisdomPushLayer` in M7.
- `WisdomPushLayer` and its import already exist in `MainActivity.kt`. The five screens already have their own entrance (`wisdomReveal`, slice 5); that stays.

## Changed (written and pushed; NOT applied, NOT compiled)
New `scripts/patch_m11_drawer_push.py`, one anchor. The `BackHandler` stays in its own `if (activeDrawerScreen != null)` (Back is intercepted only while a drawer screen is open, as before). The `when` moves inside `WisdomPushLayer(item = activeDrawerScreen, zIndexValue = 25f) { drawerScreenNow -> when (drawerScreenNow) { ... } }`. State, who sets it, the T1 back order and the five screens are untouched. Tested on a copy of the live file: patched once, second run prints "already patched", brace balance unchanged, only the 4 lines around the block differ.

## Risks (hypotheses, not proven)
- During the 220 ms slide-out the screen is still drawn but its `BackHandler` is already gone, so a second Back press in that window goes to the next handler (the screen below). Same behavior as the other push layers.
- `when` without `else` as last expression of a `Unit` lambda: should compile (it is a statement there). If CI complains, add `else -> Unit`.
- Status table of `docs/UI_MOTION_PLAN.md` section 7 NOT updated in this commit (file is 20 KB and only whole-file resend is possible); M11 row still says drawer push / pop is open. Correction line: slice 9 = this patch.

## Owner: run this
Actions > Apply pending patches > Run workflow: script `patch_m11_drawer_push.py`, branch `fix/m11-drawer-push`. Wait for the build on that branch, test, merge the Pull request.
Test on the phone: open the drawer, tap About, Contact, FAQ, Privacy, Terms one by one: each slides in from the right and fades in; Back (phone button or arrow) slides it out. Open one while a study workspace is open: it still opens above it.

## Next
M11 slice 10: trophy shimmer while a contest is live (needs a live-contest signal in the top bar; read the top bar code first), then the phone check of Home / Learning / Packages closes M11.
