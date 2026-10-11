# STATUS.md — LIVE STATUS. EVERY AGENT UPDATES THIS FILE (and only this file, for status).

> Plan, rules and technical specs are in `HANDOFF.md` (read it first). This file holds everything that changes: owner decisions, the checklist, and the session log.
> It is deliberately small so updating it costs little quota. Append only; never delete history. Repo is PUBLIC: no secrets, no student/owner personal data.

---

## A. OWNER DECISIONS & RULES (append only, newest last)

- 2026-10-11 — The website is fully working with real users and is the source of truth. The app must use the same Supabase (login + data), Appwrite (storage), Vercel env/API and GitHub as the website.
- 2026-10-11 — "I wanted native app where I add content and modify content in the same place so web & app don't need separate maintenance."
- 2026-10-11 — Every design down to the 6 Learning Hub cards is **permanent**: Books, Short Notes, Flashcards, Question Banks, Exams, Life Savers. All thumbnails/UI are packed in the app on purpose (speed).
- 2026-10-11 — The website's login page design looks good: **mimic the website UI for all design work**; use the website design (login first, then cards/subjects/packages) in the native screens.
- 2026-10-11 — **No fabricated captions, descriptions, numbers or labels.** "The app is trying fake fabricated captions, descriptions etc. I don't want that." Every piece of text/data must come from the website source (`website-reference/` or live data). If unavailable, ask the owner; do not invent.
- 2026-10-11 — Real learning content (inside the 6 cards) needs a signed-in user, on the website too. The app must support real sign-in.
- 2026-10-11 — Every agent must read `HANDOFF.md` first and write what it did, what is left, and what the owner said. Owner's instruction to the agent: "continue yourself piece by piece, one task at a time."
- Standing rules from the brief: never edit the website repo from this repo unless the owner explicitly approves (write changes in `WEBSITE_CHANGES.md`); never put secrets in the app; keep the CI build green; keep the WebView shell as fallback.

## B. CHECKLIST (update in the same commit as the work)

Legend: `[x]` done and verified, `[~]` written but NOT yet compiled/tested, `[ ]` not started.

### Done
- [x] Old WebView app (legacy repo).
- [x] Native Compose screens exist (Home, Packages, Package detail, Learning with 6 hub cards, Account, Settings, Guides, Study workspace). Built by AI Studio, NOT verified against the real backend.
- [x] Thumbnails/images packed in assets.
- [x] Books/PDF/flashcards/notes/exams/question banks/AI tutor open via website handoff in the WebView.
- [x] 2026-10-11 `.env.example` SITE_URL fixed, `ARCHITECTURE.md` reconciled (`93271843`).
- [x] 2026-10-11 dead `/api/content/catalog` call removed, enrollments labelled placeholder (`6fc04a5c`).
- [x] 2026-10-11 `WEBSITE_CHANGES.md` written (`80a9cdf3`).
- [x] 2026-10-11 `HANDOFF.md`, `CLAUDE.md`, `AGENTS.md`, README pointer (`d29bc730`); this `STATUS.md` split out to keep updates cheap.

### Left (in order)
- [~] **S1. Diagnose in-app sign-in failure.** Partly done: sign-in pop-up = `openToolOverlay(url, "Scholar Sign In")` in `MainActivity.kt`, triggered for any URL containing `/login` or `/signin`. Overlay WebView internals NOT read yet (file is huge; use targeted search). Owner has not yet reported the "same account in phone Chrome" test. Low priority now: S2 bypasses this path.
- [ ] **S2. Native sign-in** (spec in `HANDOFF.md` section 6b), split into small tasks:
  - [~] **S2a** `data/auth/SupabaseAuthClient.kt`: direct Supabase sign-in / sign-up / refresh, website-identical phone/email mapping, plain-language errors. Commit `2fc29974`. NOT compiled or tested yet. First thing to check: CI build green.
  - [~] **S2b** `ui/auth/NativeSignInScreen.kt`: Compose screen copying the website login design and texts (Sign In / Create Account tabs, fields, notice box, cyan button, academic-level dropdown, terms checkbox). Written, NOT compiled or tested. Not wired anywhere yet (that is S2d). Takes `onSuccess(SupabaseAuthResult.Success)`; storing the session is S2c.
  - [~] **S2c** Secure session storage, auto refresh, `AuthStateManager` update, inject the FULL session JSON into the WebView localStorage (overwrite stale), fire `wta-auth-change`. Written, NOT compiled or tested: new `data/auth/SecureSessionStore.kt` (Android Keystore AES-GCM, no new library) and rewritten `AuthStateManager.kt` (new `applyNativeSession`, `refreshIfNeeded`; tokens no longer in plain SharedPreferences; old installs migrated once). Nothing calls `applyNativeSession` / `refreshIfNeeded` yet: that is S2d.
  - [ ] **S2d** Wire it in: Account screen sign-in/sign-up buttons and the `/login` interception in `MainActivity.kt` open the native screen; on success call `AuthStateManager.applyNativeSession(result, webView)` and close the screen (no page reload). Call `AuthStateManager.refreshIfNeeded(webView)` on app start/resume and before opening a hub. Keep the old web pop-up as fallback until tested.
- [ ] **S3. Learning Hub cards "Unlock" → "Open"** when signed in; tap opens the website hub with the session.
- [ ] **S4. Fake-content audit** (`HANDOFF.md` section 7).
- [ ] **S5. Website fix** `WEBSITE_CHANGES.md` section 1 (needs owner approval + Supabase "Confirm email" check), then sections 2 and 3.
- [ ] **S6. Real packages/enrollments source** (decide with owner).
- [ ] **S7. Real data for catalog/thumbnails/resources** via safe routes; no duplicated content.
- [ ] **S8. Replace the dead `fetchFullProfile` route call.**
- [ ] **S9. Resolve 4 vs 5 bottom tabs** (screenshot shows 5: Home, Learning, Packages, Account, Settings).
- [ ] **S10. Phone test round** (`HANDOFF.md` section 9).
- [ ] **S11. Play Store readiness** (`PLAY_STORE_CHECKLIST.md`).

## C. SESSION LOG (append only, newest last)

Format: `YYYY-MM-DD | agent/tool | DONE ... | LEFT ... | TEST ... | NOTES/UNSURE ...`

- 2026-10-09 | Claude (planning) + AI Studio Agent | DONE: brief written; Phases A0–D native screens, auth bridge, handoffs (see NATIVE_APP_BRIEF.md section 8) | NOTES: not verified against the real backend.
- 2026-10-11 | Claude (chat, owner on free plan) | DONE: reviewed both repos; fixes `93271843`, `6fc04a5c`, `80a9cdf3`; wrote HANDOFF.md (`d29bc730`); recorded owner decisions and verified findings | LEFT: S1 onwards | TEST: nothing new | NOTES/UNSURE: cause of in-app sign-in failure unknown; nothing was built or run.
- 2026-10-11 | Claude (chat, owner on free plan) | DONE: S2a `SupabaseAuthClient.kt` (`2fc29974`); read `docs/BUILD_PITFALLS.md`; confirmed from it that every key in `.env.example` becomes a `BuildConfig` field (so `BuildConfig.NEXT_PUBLIC_SUPABASE_URL` etc. are used); split live status into this file | LEFT: S2b next (login screen UI), then S2c, S2d | TEST: owner should check that the GitHub Action build is green after `2fc29974`; if red, copy the error to the next agent and log it in `docs/BUILD_PITFALLS.md` | NOTES/UNSURE: `SupabaseAuthClient` was not compiled. Sign-up calls the website route `/api/auth/register` exactly like the website does, but that route's code was not read; the sign-in path does not depend on it.
- 2026-10-11 | Claude (chat, owner on free plan) | DONE: S2b `ui/auth/NativeSignInScreen.kt` (commit id in the git log, message "S2b"): native copy of the website login page, with the website's texts, tabs, fields, notice box, cyan button, academic-level list (same 8 options) and terms checkbox; calls `SupabaseAuthClient.signIn/signUp`; shows loading text "Signing In..." / "Creating Account..." | LEFT: S2c (secure session storage, refresh, inject into WebView), then S2d (wire into Account screen and `/login` interception) | TEST: owner should check that the GitHub Action build is green after this commit; if red, copy the error to the next agent and log it in `docs/BUILD_PITFALLS.md`. The screen cannot be seen on a phone until S2d | NOTES/UNSURE: not compiled. (1) Wrong-password text is `SupabaseAuthClient`'s "Incorrect email/phone or password." because Supabase gives the same answer for unknown account and wrong password, so the website's separate "No account found" notice with a "Create a free account" link is not reproduced (hypothesis: that wording was the website bug in `WEBSITE_CHANGES.md` section 1 anyway). (2) "Terms of Service" / "Privacy Policy" / "Forgot password?" are callbacks (`onOpenTerms`, `onOpenPrivacy`, `onForgotPassword`) to be wired in S2d to `/terms`, `/privacy`, `/forgot-password`. (3) Added a small Close (X) button that is not on the website, so the screen can be dismissed as a pop-up; remove it if the owner dislikes it. (4) Only stable Compose APIs and Material icons that exist (`Email`, `Phone`, `Lock`, `Visibility`, `VisibilityOff`, `School`, `Check`, `Close`, `KeyboardArrowDown`, `AutoMirrored.ArrowForward`) were used.
- 2026-10-11 | Claude (chat, owner on free plan) | DONE: S2c: new `SecureSessionStore.kt` (tokens encrypted with an Android Keystore key, no new library, never logged); `AuthStateManager.kt` rewritten around it: stores the FULL Supabase session (with `expires_at`), `applyNativeSession(result, webView)`, `refreshIfNeeded(webView, force)` (refresh when under 2 min left, one refresh at a time, saves the new refresh token, signs out cleanly if Supabase rejects it), WebView injection now overwrites a stale or different-user web session but keeps a newer one, then fires `wta-auth-change`; old plain-text tokens are moved once into the encrypted store and deleted | LEFT: S2d (wire in: Account buttons, `/login` interception in `MainActivity.kt`, call `refreshIfNeeded` on start/resume), then S3 | TEST: owner should check that the GitHub Action build is green after this commit (S2a, S2b and S2c are all uncompiled together); if red, copy the error to the next agent and log it in `docs/BUILD_PITFALLS.md` | NOTES/UNSURE: not compiled. (1) `AuthStateManager` only changed in the parts listed; everything else (profile fetch, sign-out, student ID) was copied unchanged, so grep for any other reader of the old plain token keys `auth_access_token` / `auth_refresh_token` in `app/src` (none known). (2) If the Keystore save fails the student must sign in again after a restart; tokens are never written in plain text as a fallback. (3) A session with an empty token (old website fake local login) is kept as before but is NOT stored encrypted and cannot be refreshed. (4) The WebView's own token refresh is picked up through the existing bridge; the native refresh signs out only if our refresh token is still the one Supabase rejected.
