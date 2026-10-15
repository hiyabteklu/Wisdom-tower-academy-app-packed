# SESSION 2026-10-15 ADMIN-A: admin entry in the native app (patch written, NOT applied)

Owner order (2026-10-15, chat): "admin dashboard on the app". Owner screenshots of the installed app: the Account tab (native) has no Admin button.

## Root cause (code read, verified)
- The installed app is THIS repo (native Compose). The website's `/admin` page (12 tabs, in the website repo) is not reachable from it.
- `ui/account/AccountScreen.kt` says in its header: "Not ported: the website's Admin button (shown only for admin e-mails)." It was left out on purpose in an earlier session, never added later.
- The website shows its Admin button by comparing the e-mail with a list (`src/lib/admin.ts`). The app must NOT copy e-mails into this public repo (HANDOFF rule), so the app asks the database instead: `private.is_admin()` already exists and is used by every admin RPC.

## What was written (pushed to main; nothing in `app/` changed yet)
1. `docs/sql/am_i_admin.sql`: new function `public.am_i_admin()` returning a boolean. NOT applied to the live project.
2. `scripts/patch_admin_entry.py` (marker `ADMIN-entry`): creates `data/admin/AdminAccess.kt` and `ui/account/AdminEntryButton.kt`, adds one item above the profile panel in `AccountScreen.kt` (Log Out stays last, owner rule 2026-10-13), and in `MainActivity.navigateTo` makes a link ending in `/admin` open the existing overlay `openToolOverlay(url, "Admin Console")`. The overlay WebView already injects the signed-in session (`AuthStateManager.injectSessionIntoWebView`), so the website page should find the login.

## Evidence
- Script run twice on copies of the real `AccountScreen.kt` (53 KB) and `MainActivity.kt` (252 KB) read from `main` (commit `a58cf34`): first run "patched", second run "already patched"; diffs show only the intended 5 and 5 added lines. Anchors each matched exactly once.
- Names checked by reading source: `AuthStateManager.currentUser: StateFlow<AuthUser?>`, `AuthUser.id: String`, `refreshIfNeeded(webView = null, force = false)` (suspend), the RPC call pattern copied from `CompetitionRepository`, `Icons.Filled.Shield` is already imported in `AccountScreen.kt`.

## NOT verified (hypotheses)
- Not compiled. CI on the patch branch decides.
- The SQL was not run. `private.is_admin()` returning boolean is assumed from its use in policies.
- Not seen on a device. Unknown: whether the website `/admin` page looks right inside the overlay (it adds `?overlay=1&app=1`), and whether the website hides its own header there.
- FLAG_SECURE blocks screenshots in the overlay (existing behavior).
- I did not check which older patches are still unapplied.

## Owner steps, in this order
1. Supabase > SQL Editor > paste `docs/sql/am_i_admin.sql` > Run. (Until this is done the button simply never shows.)
2. GitHub > Actions > Apply pending patches > Run workflow: script `patch_admin_entry.py`, branch `feature/admin-entry`.
3. Wait for the build on that branch to go green. If red, paste the error to an agent.
4. Install that build, sign in with the admin account, Account tab: purple "Admin Console" button above the profile panel. Tap it: the admin console opens. Sign in with a student account: no button.
5. Merge with a Pull request.

## Left
- Phone check of the admin pages inside the overlay (Push Broadcasts, Competitions).
- If the overlay looks cramped, a later slice can add a website-side style for `wta-tool-overlay` on `/admin`.
