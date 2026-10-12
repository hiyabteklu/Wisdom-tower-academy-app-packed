# Session 2026-10-12 BG - audit: what still opens a website page

Based on main at commit 32db664 (merge of PR #13). Read-only audit, NO code changed.
Build state of main after #12/#13 unknown to the agent (no Actions access); owner phone test not done.

## A. Intentional (owner decision, keep)
1. `/checkout` -> `openToolOverlay(..., "Package Checkout")` in `navigateTo`.
2. `/orders` and `/cart` -> `openToolOverlay(..., "Order History & Verification")`.
3. PackageDetailScreen `onUnlock` -> website checkout pop-up (purchases happen on website only).
4. External links (other hosts, tg:, tel:, mailto:) -> system `Intent.ACTION_VIEW`. PDFs -> `openOrDownloadPdf`.

## B. Website fallbacks that could be made native / removed (candidates for N11)
1. `navigateTo`: `/learning?tool=...` for tools not intercepted natively (e.g. `tool=courses` "Curriculum Manager", unknown tools) -> `openToolOverlay` website pop-up.
2. `navigateTo` last line: generic `wv.loadUrl(targetUrl)` into hidden WebView for any unmatched path.
3. `handleGlobalNav` end: unmatched paths -> `activeStudyUrl = fullUrl; navigateTo(fullUrl, 1)` or `navigateTo(fullUrl, tabIndexForUrl(...))`.
4. Learning screen `onOpenTool` builds a website URL then calls `navigateTo` (works only because interceptors catch known tools).
5. Learning screen `onOpenHub` falls back to website when no catalog package matches.
6. Study workspace `onOpenHub` (~line 3194): sets `activeStudyUrl = hubUrl; navigateTo(hubUrl, 1)` for hubs with no native handling (Life Savers/Videos with no rows, scope paths where `contentScopePath` is null).
7. AccountScreen line ~179 `onForgotPassword` -> `/forgot-password` (parameter retained but unused; native ForgotPasswordScreen is shown). Harmless, can be removed.

## C. Proposed final step (needs owner approval before any code)
New patch script (suggested name `scripts/patch_remove_website_fallback.py`, branch `fix/remove-website-fallback`), anchored, safe to run twice, tested on a copy:
- B1/B2/B3/B5/B6: replace silent website loading with a native "Not available in the app yet" screen/message with a Back button.
- Keep section A exactly as is.
- Keep legacy WebView code in the file (unused) until the owner phone-tests; delete later.
Risk: any hub/tool not yet native becomes a dead end instead of a website page. Content gaps (COC/UAT/GAT/Exit/Entrance/Remedial rows, videos, life savers) must be filled or accepted first.

## D. Before calling the app "fully native"
- Confirm CI green on main; phone-test sign-in, bell, Learning -> hub -> PDF/flashcards/quiz.
- Confirm Supabase SMTP saved with Resend key; test Forgot password end to end (code length 6 vs 8 unverified).
- Content gaps above; N9b (ownership when free mode off); Play Store blockers (account deletion route/page on website, privacy page update per WEBSITE_CHANGES.md 4-5, 12 testers x 14 days, store assets, signing).
