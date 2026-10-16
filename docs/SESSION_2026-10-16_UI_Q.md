# SESSION 2026-10-16 UI_Q: M3 written (tab change transition)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_P.md` and `docs/UI_MOTION_PLAN.md`.

## Owner request
"Read the handoff and status ... and continue to M3." M3 = tab change transition (`docs/UI_MOTION_PLAN.md` section 6).

## Where things stood (read, not assumed)
- M1 (Settings accordions) merged as PR #32, M2 (nav pill v2) merged as PR #33 (newest `main` commit `446d97c`, 2026-10-16 11:09 EAT). The `AliveBottomNav` on `main` carries the marker `FloatingPillNav v2`. CI result of those merges NOT seen from chat.
- `docs/UI_MOTION_PLAN.md` section 7 still says "M1 to M11 NOT STARTED": it is stale (not edited here, same as in UI_P). The session logs are the truth: M1, M2 and M3 are written.

## Current motion (G3: live `MainActivity.kt` on `main`, read)
- The five tabs are five separate `if (selectedIndex == n) { ...Screen(...) }` blocks in one `Box` (lines ~3175 to 3310: Home 0, Learning 1 (only while `activeStudyUrl == null`), Packages 2, Account 3, Settings 4), each with `.background(WisdomNavy)` and `.zIndex(10f)`. A tab change removes the old screen and builds the new one in the same frame: a cut. VERIFIED by reading; the "flash" is the cut plus the heavy build (hypothesis, not measured).
- No `AnimatedContent` or `rememberSaveableStateHolder` exists in the file. A tab's state is dropped when you leave it (today's behaviour).

## What was written (one commit)
- NEW `app/src/main/java/com/wisdomtower/academy/ui/theme/WisdomTabLayer.kt`: `WisdomTabLayer(tab, selectedIndex, active, content)`. One layer per tab. The selected tab fades in (210 ms, starts after 60 ms, rises 10 dp); the tab just left stays composed 90 ms and fades out, then is removed as before. An opaque `WisdomNavy` backdrop stays behind the fading content (the WebView can never show through). Incoming layer is drawn on top (zIndex 11 vs 10), so it takes touches from the first frame. Animation goes through `graphicsLayer` (alpha, translationY) read in the draw phase: no recomposition per frame. It never writes `selectedIndex`.
- NEW `scripts/patch_m3_tab_transition.py`: replaces ONLY the opening line of the five blocks (`if (selectedIndex == n) {` becomes `WisdomTabLayer(tab = n, selectedIndex = selectedIndex) {`; Learning also gets `active = activeStudyUrl == null`) and adds one import. The closing braces now close the lambda, so the screens inside are untouched. Every anchor must match once, each block must still be followed by the expected screen call, brace balance is checked, safe to run twice.
- Learning tab rule kept: when a hub page opens (`activeStudyUrl` set) its native screen disappears at once with no fade, so the WebView is not covered.

## Evidence
- Script run on a copy of the real `MainActivity.kt` (256,797 chars read from `main`): patched once, second run says "already patched", diff = 1 import + 5 changed lines, brace balance unchanged (0 and 0). `selectedIndex` is `Int` (`rememberSaveable { mutableIntStateOf(0) }`), `activeStudyUrl` is `String?`.
- No Kotlin compiler in my sandbox: the Kotlin was checked by reading only (imports of the new file listed one by one; `WisdomNavy` is in the same package, `Color.kt`; inside `graphicsLayer { }` the local is named `fade` on purpose, because `alpha` there is the layer's own property). Per the owner rule, written code counts as done; a red build will be shown by the owner.

## Owner step (plain words)
GitHub > Actions > **Apply pending patches** > Run workflow > script `patch_m3_tab_transition.py` (file name only, no `scripts/`) > branch `m3-tab-transition` > wait for green > try the 5 tabs slowly and fast, then go back and forth quickly > merge the pull request. M1 and M2 are already merged.

## Not done / UNSURE
- Tab state is NOT kept per tab (the plan said "state kept, hypothesis"). Keeping it would change behaviour (scroll positions, open forms would survive a tab switch), so it was left out on purpose; say so if you want it.
- Timing (90 ms out, 60 ms delay, 210 ms in, 10 dp rise) is the plan's starting value; tune on the phone. If the incoming tab still hitches on its first frame, the cost is the page build itself, not the fade.
- The phone's "Remove animations" setting was not verified (plan hypothesis 5).
- Plan status table not edited (see above). Competition board not edited (UI work).

## Next
M4: entrance choreography (`wisdomReveal`) on Home, Packages, Learning.
