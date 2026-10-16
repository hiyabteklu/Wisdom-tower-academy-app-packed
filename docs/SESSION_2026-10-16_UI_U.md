# SESSION 2026-10-16 UI_U: M7 written (drawer, top bar, notifications, splash handoff, dialogs)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_T.md` and `docs/UI_MOTION_PLAN.md`.

## Owner request
"Look at my GitHub projects (wisdom tower academy app packed), read the handoff and status, and continue M7."

## Current motion (G3: live code on `main`, read)
- Drawer (`MainActivity.kt`): one `AnimatedVisibility` fades the scrim AND the panel together (160 / 140 ms); the panel does not slide; rows (`DrawerCompactRow`) appear with the panel.
- Top bar: the title is a plain `Text` that switches between "Wisdom Tower Academy" and "Study Workspace" (only these two values exist, it does not change per tab); the bell shows a red dot with a plain `if`.
- Notifications screen: plain `if (showNotifications) { NotificationsScreen(...) }`, zIndex 17: opens and closes as a cut. Competitions already use `WisdomPushLayer`.
- Splash: `installSplashScreen()` with `setKeepOnScreenCondition`; no exit animation, so the system splash vanishes in one frame.
- Dialogs: `TimerControlDialog` (`MainActivity.kt`) and `ExitGuiltDialog` (`ExitGuiltDialog.kt`) use `Dialog { Surface }`, no enter motion.

## What was written
- NEW `ui/theme/WisdomOverlayMotion.kt`: `Modifier.wisdomStaggerIn(index)` (drawer rows: fade + 14 dp slide, 220 ms, 30 ms apart, starts 90 ms after open, replays on every open) and `Modifier.wisdomDialogEnter()` (scale 0.94 to 1 + fade, 200 ms). `graphicsLayer` only.
- `ExitGuiltDialog.kt` (resent whole, only the import and one modifier added): card uses `wisdomDialogEnter()`.
- NEW `scripts/patch_m7_overlays.py` for `MainActivity.kt` (18 exact-anchor edits, marker `M7-motion`):
  - drawer: panel slides in from the left (`animateEnterExit`, 260 / 200 ms) while the scrim fades on the same clock; rows get `index` (0 to 5 for the explicit rows, 6+ for Support and About) and stagger in;
  - top bar: title `Crossfade` (200 ms); bell dot is an `AnimatedVisibility` with a spring pop (it does not pop on app start, only when the unread state changes);
  - notifications: wrapped in `WisdomPushLayer(item = open id or "")`, so it slides in and out and keeps its content (list or reader) while leaving; back handling and state untouched;
  - splash: exit listener fades and grows the splash 6 percent over 260 ms, then removes it;
  - timer dialog: `wisdomDialogEnter()` on its card.

## Evidence
- Script tested on the REAL `MainActivity.kt` fetched from `main` (blob 26276b9, 4742 lines): patched once (18 edits), second run "already patched", diff read line by line, braces balanced. Every anchor matched exactly once.
- No Kotlin compiler in my sandbox: new code checked by reading only. Imports added by the script: `Crossfade`, `wisdomDialogEnter`, `wisdomStaggerIn`. `Spring`, `scaleIn`, `scaleOut`, `fadeIn`, `fadeOut`, `slideInHorizontally`, `slideOutHorizontally`, `FastOutSlowInEasing`, `tween` were already imported (checked). `animateEnterExit` is a member of `AnimatedVisibilityScope`, no import. Splash classes are written fully qualified.
- The GitHub connector was used; the cloud sandbox could not clone the repo (GitHub account not linked there), so nothing was run beyond the script test.

## Owner step (plain words)
GitHub > Actions > **Apply pending patches** > Run workflow > script `patch_m7_overlays.py` > branch `m7-overlay-motion` > wait for green > open and close the menu (panel slides, rows rise in), tap the bell and press Back, open the exit dialog (Back on Home) and the timer dialog, cold-start the app (splash fades) > merge. Until the Action runs, only the exit dialog motion is live; everything else works as before.

## Not done / UNSURE
- Trophy shimmer while a contest is live: NOT done (needs a live-contest signal in the top bar; not read yet).
- Title cross-fade covers only the two titles that exist; there is no per-tab title.
- Dialog CLOSE is still the platform's instant dismiss (a `Dialog` window cannot be animated out from inside it). Hub gate dialog and other dialogs in other files were NOT read, so not touched.
- Drawer screens (About, Contact, FAQ, Privacy, Terms) keep their own `when` block, not wrapped in a push layer (their back handling lives in that block); left for M11.
- While the notifications screen slides out (220 ms) it still sits on top; its refresh effect keeps running (harmless, unmeasured).
- The status table in `docs/UI_MOTION_PLAN.md` section 7 still says M1 to M11 NOT STARTED; it was not edited (the file is large, whole-file resend only). Treat this log and UI_O to UI_T as the real status: M1 to M7 written.
- Splash exit uses the explicit listener object because I could not confirm the interface is a `fun interface`; if the compiler complains about the splash block, remove those 12 lines.

## Next
M8: flashcards flip and swipe.
