# Session log 2026-10-12 AY: audit of every place that still opens a website page, patch P14

> Continues `docs/SESSION_2026-10-12_AX.md`. Repo is PUBLIC: no secrets.

- 2026-10-12 | OWNER REQUEST: "some buttons/links still lead me to webpages even though the app is almost all native. Locate and patch them."
- 2026-10-12 | NOTE: P13 (`patch_native_hub_routing.py`) is ALREADY in `main` (the marker `P13-native-hub-routing` is in `MainActivity.kt` handleGlobalNav). The owner's workflow run #13 failed with git exit code 128 on the first try; a later run evidently succeeded. Treat P13 as applied.

## AUDIT (read in `MainActivity.kt` on `main`, 2026-10-12): places that still open the website

1. **Sign in / Create account links** (`navigateTo`: URLs containing `/login`, `/signin`, `/signup`, `/register` opened the pop-up "Scholar Sign In" / "Create Scholar Account"; `handleGlobalNav` login branch did `navigateTo(fullUrl)` to the same pop-up). Reached from: the Learning screen sign-in button (`onNavigateToUrl("/login")`), website pages that redirect to /login, menu links. **FIXED by P14** (`scripts/patch_native_login_routes.py`, tested twice on a copy): both now close overlays and select the Account tab (native sign-in form).
2. **Notification bell** (top bar, `MainActivity.kt` about line 2037, S12-P2): opens the website page `/notifications` in the WebView. There is NO native notifications screen yet (`NotificationRepository` already loads the list natively). NOT patched: needs a new native screen (next task N12).
3. **Forgot password** (`AccountScreen.kt`, `onForgotPassword = { onNavigateToUrl("/forgot-password") }`): website page. No native flow exists. NOT patched (needs a Supabase reset-by-email call and a deep link back; owner decision).
4. **Courses outside the 4 native course shapes**: `contentScopePath` returns null for COC, UAT, GAT, Exit Exam and Entrance Questions, so `StudyWorkspaceScreen` calls `onOpenHub` and the hub opens as a website page. NOT patched: needs the real `scope_path` values of those hubs in `public.learning_resources` (plan note: "COC / UAT / GAT hub aliases not checked yet").
5. **Package "Unlock" / checkout** (`PackageDetailScreen` `onUnlock` opens "Package Checkout" in the pop-up): website by the owner's decision (purchases only on the website). Left on purpose; in free mode the button should not be shown.
6. **Learning `onOpenHub` fallback** (path that matches no catalog package) and **`tool=courses` (Curriculum Manager)** or any unknown `tool=`: website pop-up. Rare. NOT patched.
7. **`/orders`, `/cart`, `/checkout`**: website pop-ups (purchase side; left on purpose).
8. **Website redirects inside the hidden WebView**: any other path (for example `/academy/...` pages without a native screen) still falls to the last branch of `handleGlobalNav` and loads the website. The 3 hub tools (tutor, calculator, timer, planner, notebook, targets, status) are already native.
9. **External links**: two `Intent.ACTION_VIEW` calls (PDF / external URL in the WebView) open the system browser; left as is.

- 2026-10-12 | LEFT: owner runs the workflow for `patch_native_login_routes.py` (branch `fix/native-login-routes`), checks the build, merges, tests on the phone: Learning tab signed out > the sign-in button shows the NATIVE form in the Account tab (no website pop-up); a website page that redirects to /login also lands there. Then agent: N12 native notifications screen; check `scope_path` values for COC/UAT/GAT/Exit Exam/Entrance (Supabase read) and make those courses native.
- 2026-10-12 | NOTES/UNSURE: not compiled (cannot see CI). After P14, if a signed-IN student taps a sign-in link they land on the Account tab showing their card (harmless). The old pop-up code (`openToolOverlay`) is still used for checkout/orders/tools.
