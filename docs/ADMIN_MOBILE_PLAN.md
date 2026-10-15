# ADMIN_MOBILE_PLAN.md — Admin Console redesign for the phone (LIVE TASK, owner order 2026-10-15)

> Repo is PUBLIC: no secrets, no student names or emails. Written in a planning-only session: NO code was changed. Everything marked `[verified]` was read in the code on `main` of the named repo; everything marked `[hypothesis]` was NOT proven and must be checked first (HANDOFF rule 11g: root cause before fix).
> The website half of this plan has a matching file in the WEBSITE repo: `hiyabteklu/Wisdom-tower-academy` -> `docs/ADMIN_MOBILE_PLAN.md` and `AGENTS.md`. This file (app repo) is the master; keep both in step.

## 0. Where this sits in the project
The owner ordered this task on 2026-10-15 while the competition stages (C1 to C10) are live. It RUNS IN PARALLEL with them and the owner's order overrides the 'competition only' wording in `HANDOFF.md`. Do not touch archived tasks. Do one slice per chat (free quota, `docs/AGENT_QUOTA_PROTOCOL.md`), push in ONE commit with the status table below and a `docs/SESSION_*.md` log.

## 1. Owner order (2026-10-15, in the owner's words; never delete, only append)
Screenshot sent: the in-app Admin Console, a dark page with a native title bar (X, 'Admin Console', red Close button), a 'Filter admin sections...' box, the line 'All 10 modules operational', a horizontal row of tabs cut off at the right edge ('Competitio...'), and a Content library card with four tall rows (Grades 9-12, Entrance Questions, Freshman, Special packages, each tagged APPWRITE).

1. "the admin dashboard in mobile view is terrible, it should be like the desktop view but in the mobile screen. I hate thin long verticals"
2. "redisign the ui to be suitable for our mobile view. No one is using admin dashboard in Website. So make it feel it was mode for the mobile."
3. "No horizontal long scrolling to find the categories (content, notification, etc.., make them fit in Mobile screen, compact ui and vertical scrolling only. Cuz the horizontal scrolling is what freeze the web view always in the app"
4. "Currently you can't even scroll reliably, it's freezing, so resolve any conflicting behaviors with the app. It should scroll smoothly."
5. "Currently it looks awkward overlay, why the apps bottom and top navigation disappeared, and it is just being cropped out the small texts etc..."
6. "Make the ui similar to the app and plan this in details on the repo (app and web) so any agent won't miss either"

Plain meaning: (a) a mobile-first admin that looks like a dashboard (modules visible at a glance), not a long thin stack; (b) built for the phone only, the desktop layout is not a goal; (c) the section list must fit the screen, vertical scrolling only, ZERO horizontal scrolling anywhere in the admin; (d) smooth, reliable scrolling in the app's WebView; (e) the app's own top bar and bottom navigation stay visible and nothing is cropped; (f) same look as the rest of the app.

## 2. What the code says today `[verified]` (read on 2026-10-15)
App repo (`MainActivity.kt` is about 245 KB: use targeted search, never read it whole):
- The Admin Console is NOT a native screen. It is the website page `/admin` shown in the in-app overlay: `openToolOverlay(targetUrl, "Admin Console")` in `MainActivity.kt` (marker `ADMIN-entry`, from `scripts/patch_admin_entry.py`, session `docs/SESSION_2026-10-15_ADMIN_A.md`). The entry is the purple 'Admin Console' button on the Account screen (`ui/account/AdminEntryButton.kt`, shown only when `public.am_i_admin()` is true) and a notification link ending in `/admin`.
- An overlay is why the app's top bar and bottom navigation are not visible and why there is a second title bar with its own X and Close (two close controls).
- The competition screens already solved the same problem: since session X (`docs/SESSION_2026-10-15_X.md`) `CompetitionFullScreen` in `ui/competition/CompetitionRulesScreen.kt` is a plain Box between the top bar and the bottom navigation (no Dialog). Copy that pattern.

Website repo `src/app/admin/page.tsx` (12 tabs, one client component):
- Own sticky `<header>` with `backdrop-blur-md`, an `animate-pulse` dot, a back arrow, 'Live Academy', 'Supabase' and 'Logout' buttons (double header next to the native bar).
- The tab ribbon is `overflow-x-auto` with an inner `flex min-w-max` row: this is the long horizontal scroller (owner point 3). The filter box above it is the 'Filter admin sections...' field.
- The workspace is wrapped in a `rounded-3xl ... backdrop-blur-sm` section: a second blur layer.
- The text 'All 10 modules operational' is HARD-CODED and wrong (there are 12 tabs) and is not a real health check. Under the fake-content rule (HANDOFF section 7, rule 11h) it must be removed or replaced by something real.
- Every tab tap runs `router.replace(...)` plus `history.replaceState` plus a localStorage write (Next navigation inside a WebView on each tap).
- Admin access is decided by `isAdminEmail(u.email)` (an email list in the website code), while the database uses `private.is_admin()`; the app button uses `am_i_admin()`. Three checks, not one (already noted in `docs/SESSION_2026-10-15_AT.md`). Not part of this task unless it blocks the redesign.
- Panels (`src/components/admin/`, bytes): Competitions 33.6k, Database Hub 29.5k, Users 28.0k, Free Resources 24.8k, Analytics (Overview) 23.1k, Notification composer v2 21.1k, Payments 20.7k, Content 18.1k, Locks 13.9k, Catalog 13.7k, Access Grants 10.4k, Audience picker 9.9k, Notification block editor 10.1k, Notifications 9.1k, Scheduled notifications 9.1k, Inquiries 5.0k. NONE of the panel files were read in this session: whether they contain wide tables or horizontal scrollers is UNKNOWN until each is audited.

## 3. Hypotheses to check BEFORE any fix `[hypothesis]` (owner points 3, 4, 5)
Write the finding of each check into the session log as VERIFIED or REJECTED.
- H1 Freeze from horizontal scrolling: the tab ribbon (and any wide table) scrolls sideways inside a WebView whose parent also reacts to horizontal drags (drawer edge swipe, pager or tab swipe, pull-to-refresh, back-swipe). The two gesture handlers fight. Check: how the overlay container handles touch (`pointerInput`, `nestedScroll`, `AndroidView` wrapper, `requestDisallowInterceptTouchEvent`).
- H2 Nested scrolling: the WebView sits inside another vertical scroller (Compose `verticalScroll`, `LazyColumn`, `NestedScrollView`) so there are two vertical scrollers. Check the overlay's layout tree.
- H3 GPU cost: two `backdrop-filter` blur layers plus a sticky blurred header plus `animate-pulse` repaint on every scroll frame in a WebView (worse inside a Compose overlay with its own layer). Check by removing them in the redesign and comparing; do not assume.
- H4 Injected JS/CSS: the app injects scripts and styles into website pages (session injection, hide website header and footer). It may hide or crop the admin page's own `<header>` and other elements, or run a MutationObserver on every DOM change. Find what is injected for the overlay (search `evaluateJavascript`, `injectSessionIntoWebView`, `addJavascriptInterface`, style-injection strings in `MainActivity.kt` and `assets/`). This probably explains 'cropped small text'.
- H5 The overlay uses a different WebView configuration than the main one (layer type, overscroll mode, viewport meta, text zoom, `useWideViewPort`/`loadWithOverviewMode`) which would explain tiny text and cropping. Check the WebView settings block of the overlay.
- H6 Window insets: the overlay is full screen without status-bar and navigation-bar insets applied, so content is cropped at the edges.

## 4. Target design (decided in this plan; change only with the owner's OK)
Phone only. Same look as the app: dark navy, glass cards like `WisdomGlassCard`, pill-shaped buttons, big readable type, rounded iOS-like shapes. Take colours and sizes from `ui/theme/Color.kt`, `Type.kt` and `WisdomComponents.kt` in this repo (read them; do not invent a palette).

### 4.1 Structure: dashboard grid + section view, no tab ribbon
- **Home (default view of /admin):** a compact header strip with REAL counts only (scholars, pending payments, new inquiries; these three counts are already fetched by the page) and below it a **grid of module tiles**: 3 columns on phones 360 dp and wider (icon on top, label under it, max 2 lines, small count badge where one exists), 2 columns below 340 dp. 12 tiles = 4 rows, so every module is visible without scrolling much. A small search icon (not a wide input) toggles the filter field. This is the 'desktop dashboard fitted to a phone' the owner asked for.
- **Section view:** tapping a tile opens that panel full width. A slim sticky row: back chevron (returns to the grid), section title, optional one action button. No horizontal ribbon, no second header.
- **Footer of the home grid:** a quiet row with 'Live Academy', 'Supabase dashboard' (these two were in the old header). 'Logout' stays in the Account screen (do not duplicate; sign out of the app account is the app's job).
- Remove 'All 10 modules operational'. If a status line is wanted later it must come from a real check.
- Keep deep links: `/admin?tab=<id>` and the aliases in `page.tsx` must still work (notifications, push links and the competition checklist use them). Opening `?tab=` goes straight to that section; Back returns to the grid.

### 4.2 Rules for every panel (no exceptions)
1. **Zero horizontal scrolling.** No `overflow-x-auto` strips, no `min-w-max`, no wide tables. Tables become stacked cards (title row, then two-column label/value pairs). Filter or status chips use `flex-wrap`, a segmented control or a select, never a scrolling row. Long ids and urls wrap or truncate with ellipsis.
2. **Compact, not thin-and-long.** Prefer 2-column field pairs for short fields, collapsible groups for rarely used fields, and cards that show the key facts in 3 to 4 lines. No full-width rows that hold only one short label.
3. **One vertical scroller only**: the page scrolls, nothing nested scrolls except short bounded lists (max-height with `overscroll-behavior: contain`) and only where unavoidable.
4. **Performance:** no `backdrop-filter`, no `animate-*` loops, no large box-shadows on scrolling content, no sticky element with blur. Use solid or semi-solid fills (glass look via colour and border, not blur).
5. **Readable:** body text at least 14 px, labels at least 12 px, touch targets at least 44 px high, pill buttons. Nothing smaller than 11 px.
6. **Safe area:** respect `env(safe-area-inset-*)`; the page needs no extra bottom padding for the app's navigation once the app hosts it between the bars (section 5), but keep 16 px of bottom breathing room.
7. **No invented text, numbers or statuses** (HANDOFF section 7).
8. Keep all behaviour and admin permissions exactly as they are: this is a layout redesign, not a feature or security change.

### 4.3 Global CSS guard (website, one small block)
Add to the admin layout only (not the student pages): `html, body { overflow-x: hidden; }` as a safety net AFTER the real overflow causes are fixed (never as the fix), `touch-action: pan-y` on the admin root, `overscroll-behavior-y: contain`, `-webkit-tap-highlight-color: transparent`, `word-break: break-word` on cards.

## 5. App-side plan (this repo)
1. **Host the admin WebView between the app's top bar and bottom navigation** exactly like `CompetitionFullScreen` (session X pattern), instead of `openToolOverlay(..., "Admin Console")`. One native top bar only (the app's own, title 'Admin Console', one back/close control). Remove the duplicate X plus red Close pair. Back button: if the page is inside a section go back to the grid (the website exposes this through browser history or a tiny JS bridge call; decide in slice A3 after reading how other hosted pages do it), otherwise leave the admin.
2. **Single vertical scroller:** the WebView must not sit inside any Compose scroller. Disable drawer/tab swipe and pull-to-refresh gestures over the admin area. Check and set overscroll mode, nested-scroll behaviour and hardware acceleration (no software layer type) on THIS WebView; make its settings match the main WebView where tiny or cropped text was seen (H5).
3. **Do not inject anything extra** into the admin page: it is already mobile-first and has no website header or footer to hide. If the shared injection hides elements by tag name, scope it so the admin page is not touched (H4).
4. **Insets:** apply status-bar and navigation-bar insets to the container, not to the page (H6).
5. `MainActivity.kt` is huge: use a patch script in `scripts/` (HANDOFF rule 10, `docs/EDITING_LARGE_FILES.md`), log it in the session file, tell the owner to run Actions > Apply pending patches. New Kotlin goes into a NEW small file (for example `ui/admin/AdminConsoleScreen.kt`), with one call site in `MainActivity.kt`.
6. Respect the forbidden-files list (HANDOFF rule 12): no edits to Gradle files, manifest, `.github/`, `.env.example`, `website-reference/**`, branding. `website-reference/` is a read-only snapshot refreshed by the Action 'Sync website reference'; the REAL website edits go to the website repo.

## 6. Slices (one per chat, in this order; log each in the status table)
| Slice | Repo | What | Done when |
|---|---|---|---|
| A0 | app (read-only) | Root-cause audit: answer H1 to H6 by reading the overlay code (`openToolOverlay`, its WebView settings, touch handling, injected JS/CSS) and the website admin page. Write findings as VERIFIED / REJECTED with the file and the lines. No code. | findings logged in `docs/SESSION_*.md` and in section 3 here |
| A1 | website | New admin shell in `src/app/admin/page.tsx` only: home grid, section view with back chevron, no ribbon, no own header, no blur or pulse, remove the fake status line, keep `?tab=` deep links and badges and admin gate untouched. Panels stay as they are. | CI/Vercel build green; tab ribbon gone; every tab reachable by tap |
| A2 | website | Admin-only global guard (4.3) and, if A0 proves it, fixes for the measured scroll problem. | no horizontal overflow on the shell at 320, 360 and 412 px wide |
| A3 | app | Host the admin page between the bars (section 5 items 1, 4, 5): new `AdminConsoleScreen.kt`, patch script for the call site, single top bar, back handling. | build green; top bar and bottom nav visible with the admin open |
| A4 | app | Scroll and gesture fixes proven by A0 (section 5 items 2, 3). | owner confirms smooth scrolling (device report) |
| A5 to A16 | website | One panel per slice, converting tables to cards and removing horizontal scrollers, in this order (most used first): A5 Competitions, A6 Notifications (Push Broadcasts + composer v2 + scheduled), A7 Users, A8 Payments, A9 Overview (Analytics), A10 Content (the Academy folders list: Grades 9 to 12, Entrance Questions, Freshman, Special packages, as in the owner's screenshot: make it a compact 2-column grid of folder cards, not 4 tall rows), A11 Free Resources, A12 Locks, A13 Catalog, A14 Access Grants, A15 Inquiries, A16 Database Hub. Each slice first audits the file for `overflow-x`, `min-w-`, `<table`, `backdrop-`, `animate-`. | the panel passes the section 4.2 checklist |
| A17 | both | Regression pass: section 7 checklist, deep links, competition admin checklist still works, owner phone test. | owner report |

Status (append only; newest last):
- 2026-10-15 | Claude (chat, planning session) | Plan written in both repos. No code changed. A0 is next.

## 7. Acceptance checklist (owner's phone, after A4 and again after A17)
1. Open Account > Admin Console: the app's top bar and bottom navigation are still visible; only ONE title bar; nothing cut off at the edges.
2. The first screen shows all modules as a grid; no sideways scrolling anywhere; the filter does not need a wide field.
3. Tap each module: it opens full width; the back chevron returns to the grid; the phone Back button behaves the same.
4. Scroll up and down for 30 seconds in three modules (a long list, a form, the competitions screen): no freeze, no jumping, no stuck scroll.
5. Try dragging sideways on any screen: the page does not move sideways.
6. Small text is readable (body at least 14 px); buttons are easy to hit.
7. Deep links still work: `/admin?tab=competitions`, `/admin?tab=notifications`.
8. Student accounts still do not see the Admin Console button; non-admins still cannot use `/admin`.

## 8. Rules that matter here (copied from HANDOFF so nobody misses them)
Inspect before changing; focused changes; no redesign of anything outside this task; label guesses 'hypothesis'; code stays `[~]` until CI is green and the owner has tested; never write secrets, emails or student names; do not delete or rename existing files; ask the owner only what is new; log first, then everything else; push to `main` in one commit per slice (CI builds only pushes to `main`).
