# ADMIN_UI_V2_PLAN.md — every Admin Console screen in the home-grid design (LIVE TASK, owner order 2026-10-16)

> Repo is PUBLIC: no secrets, no student names or emails. Master copy lives in the APP repo (`docs/ADMIN_UI_V2_PLAN.md`); the WEBSITE repo (`hiyabteklu/Wisdom-tower-academy`) carries an identical copy. Keep both in step. This plan EXTENDS `docs/ADMIN_MOBILE_PLAN.md` (slices A0 to A17, layout work, done in code). Rules of `HANDOFF.md` section 0 still apply (inspect first, focused changes, no invented text, label guesses "hypothesis", CI green is enough to continue, one commit per slice, log first).

## 1. Owner order (2026-10-16, in the owner's words; never delete, only append)
Screenshots sent: the notification reader showing the gold title and the test notice (fine), and the new Admin home grid (3 stat tiles, 12 module tiles with gold icon chips, two quiet link pills).

"Anll vercel and github is green, and this is what things look like now. But as you said there is still problems left, the app scroll freezes on the Web view of this admin dashboard, also don't you think there is cropped out something on the top? or why things too close/overlapping/touching the top nav/header in the app, can't they have a little safe space. Also what you did here is fantastic. The admin dashboard you did great job only on the first page of the admin dashboard. But I need this kind of redesign in all of its layers, I mean when clicked, till the final destination also should be suitable for mobile. Same color plate and design language. Make the entire internal ui of the admin dashboard as cool as the image shown above. Push the plan and start execution."

Plain meaning: (a) fix the scroll freeze; (b) a little safe space under the app top bar, nothing touching or cut at the edge; (c) the home grid look (tiles, gold icon chips, big readable type, pills, dark glass cards) must continue in EVERY layer: section landing, lists, detail views, editors, confirm dialogs, toasts, empty states; (d) same colours and language everywhere.

## 2. Root-cause notes for the two bugs (code reading on 2026-10-16; NOT measured on a device)
Scroll freeze. Facts read in the website repo `main`:
- F8 (verified, code) `src/app/layout.tsx` wraps `/admin` in the whole student-site shell. `.site-atmosphere` is a `position: fixed; inset: 0` layer with three `filter: blur(90px)` glows (`globals.css` lines about 71 to 100). It is hidden only for the AI tutor (`wta-tutor-active`), not for the admin, and the admin root has an opaque `bg-wisdom-dark`, so the layer is painted and composited for nothing. HYPOTHESIS: on a mid-range phone this fixed blur stack costs frames while scrolling. Fix applied: `display: none` for `.site-atmosphere` inside the admin layout (zero visual change because it is fully covered).
- F9 (verified, code) `html { scroll-behavior: smooth }` is global (`globals.css` line 45) and the admin runs `window.scrollTo(0,0)` and the composer `scrollIntoView({behavior: "smooth"})`. HYPOTHESIS: smooth programmatic scrolling fights touch fling in WebView. Fix applied: `scroll-behavior: auto` inside the admin layout.
- F10 (verified, code) other always-on site components run on `/admin`: `GlobalFocusBar` (500 ms interval), `AuthProvider` (4 min), `OfflineSync` (60 s), `LiveRefresh`, `StructuralBackBridge`, `ServiceWorkerRegister`, `GlobalToolOverlay`. All are light; none is a proven cause. Not changed.
- F11 (hypothesis, NOT fixed here) Android WebView runs every WebView of the app in ONE renderer process, so the hidden main WebView beneath the admin may still run its injected scripts (A0 F4: 300 ms intervals, `innerText` observers) on the same main thread. Candidate fix (app repo, needs a patch script for `MainActivity.kt`): call `onPause()` on the MAIN WebView while the admin is open and `onResume()` when it closes (per-WebView; do NOT use `pauseTimers()`, it is global and would freeze the admin too). Slice U9.
- F12 (verified) `touch-action: pan-y` was added to the admin root in website commit `abbbdf5` (2026-10-15 evening). The owner's "freezes" report of 2026-10-16 was made with that build live. So pan-y is NOT the cure; if scroll still freezes after F8 and F9, remove it first (cheap A/B) before anything else.
- Not yet known: WHICH sections freeze. The owner is asked to name them after the next build (see section 8).

Top edge. The admin WebView is hosted between the app top bar and bottom navigation (`AdminConsoleScreen`, patch `ADMIN-host`). Its top edge is a hard clip: content scrolling up is cut flush against the bar, and at scroll 0 the first row sat 12 px below it. Fix (website only): a 14 px fixed fade at the top of the admin layout so rows dissolve instead of being cut, and 16 px of top padding on the home grid and on the section view (the section bar keeps its solid background).

## 3. Design language (read from the home grid in `src/app/admin/page.tsx`; do not invent a palette)
- Page: `bg-wisdom-dark` (`#0a101c`). Cards: `rounded-2xl border border-white/10 bg-wisdom-card` (`#1c283c`). Muted text `text-wisdom-muted`. No `backdrop-filter`, no animation loops, no big shadows.
- Icon chip: `h-10 w-10 rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300` (GOLD accent). Cyan stays for the primary action pill and for links.
- Tile (navigation inside a section): same card, icon chip on top, 13 px semibold label, optional count badge top right.
- Pills: `min-h-[44px] rounded-full`, ghost = `border-white/10 bg-wisdom-card text-wisdom-muted`, primary = `bg-cyan-500 text-wisdom-dark font-bold`, gold = `border-amber-400/30 bg-amber-500/15 text-amber-200`, danger = `border-rose-400/30 bg-rose-500/15 text-rose-200`.
- Badges: `rounded-full border px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums` with tone (neutral, gold, cyan, green, red).
- Type: titles 16 to 18 px bold, body 14 px, labels 12 px, nothing under 11 px. Touch targets at least 44 px.
- Editors and confirmations are BOTTOM SHEETS (rounded top corners, dim backdrop WITHOUT blur, internal vertical scroll with `overscroll-behavior: contain`), not centred pop-ups. Toasts are one slim glass bar at the bottom.
- Safe space: 16 px side gutters, 16 px under the app bar at scroll 0, 24 px at the bottom.

## 4. The shared kit (one file, used by every panel): `src/components/admin/ui.tsx`
`AdminPageHeader`, `AdminCard`, `AdminStat` and `AdminStatRow`, `AdminTile` and `AdminTileGrid`, `AdminRow` (tappable record card: leading chip or avatar, title, meta lines, badge, chevron), `AdminPill`, `AdminChips` (wrapping filter group), `AdminSearch`, `AdminField` with `AdminInput` / `AdminTextarea` / `AdminSelect`, `AdminSheet` (bottom sheet), `AdminBadge`, `AdminEmpty`, `AdminToast`, `AdminKeyValue`, `AdminSkeleton` (static bars, no pulse). Rules for the kit and for every panel: no `<header>`, `<footer>` or `<nav>` elements (the app-mode CSS in `globals.css` hides `header` and `footer`), no raw `'` `"` `>` `}` characters in JSX text (ESLint `react/no-unescaped-entities` fails the Vercel build), no `animate-*`, no `backdrop-*`, no `overflow-x-*`, no `min-w-[` wider than the screen.

## 5. Slices (each pushed alone; log each in the status list at the bottom)
| Slice | Repo | What |
|---|---|---|
| U0 | website | Shell fixes F8, F9 and the top fade (admin `layout.tsx`); plan pushed to both repos |
| U1 | website | The kit `ui.tsx` |
| U2 | website | `page.tsx`: home grid keeps its look; section view gets the new bar (icon chip, title, optional subtitle), top padding, section content directly on the page (no extra box-in-a-box) |
| U3 | website | Overview (`AnalyticsPanel`): stat tiles, chart cards, activity rows |
| U4 | website | Push Broadcasts: `NotificationsPanel` landing as tiles (Compose, Scheduled, History), `NotificationComposerV2`, `NotificationBlockEditor`, `NotificationAudiencePicker`, `ScheduledNotificationsPanel` |
| U5 | website | Competitions (`CompetitionsAdminPanel`, `EntryFlagsInfo`) |
| U6 | website | Scholars and Users (`UsersPanel`) incl. the inspect and edit sheets |
| U7 | website | Payments (`PaymentsPanel`, `src/app/admin/payments/page.tsx`) incl. receipt and reject sheets |
| U8 | website | Access Grants, Content Locks, Pricing and Catalog |
| U9 | app + website | Course Content, Free Resources, Inquiries, Database Hub; app side F11 patch if the owner still sees freezes |
| U10 | both | Regression pass (section 7) and the owner's phone test |

Per panel the same three layers are converted, down to the last screen: (1) landing: header, stat tiles, filter chips, search; (2) records: `AdminRow` cards with the gold chip, status badge, one-line meta; (3) detail and edit: `AdminSheet` with grouped fields, pill actions, confirm sheet for destructive actions. Behaviour, data calls, permissions and texts are NOT changed (layout slice only, like A5 to A16).

## 6. Working rules for this task
- npm cannot reach its registry from the chat sandbox, so a real `next build` is not possible there. Gate before every push: the shim type check described in `docs/SESSION_2026-10-16_UI_A.md` (syntax, unknown names, unused imports, kit prop mismatches) plus a grep audit for the forbidden patterns in section 4. Vercel is the real compiler: read its result before trusting a slice. If Vercel is red, fix first.
- Do not edit `src/app/globals.css` (student pages share it); put admin-only CSS in `src/app/admin/layout.tsx`.
- Edit panels with whole-file resend only after reading the whole file; keep every handler, state variable and Supabase call exactly as it was.

## 7. Acceptance checklist (owner's phone)
1. Open Admin Console: a visible gap under the app top bar; scrolling up, rows fade at the top edge instead of being cut.
2. Scroll for 30 seconds in Overview, Scholars and Users, Payments and Push Broadcasts: no freeze, no stuck scroll.
3. Every module opens in the same language as the home grid (gold icon chips, dark cards, pills); no plain white-on-dark forms left.
4. Open at least one editor and one destructive action in three modules: they appear as bottom sheets and can be closed with the Back button.
5. No sideways movement anywhere; text at least 14 px for body.
6. Deep links still work: `/admin?tab=competitions`, `/admin?tab=notifications`.

## 8. Questions for the owner (after the next build)
- Which sections freeze, and does it happen at once or after some scrolling? (Decides whether F11 needs the app patch.)
- Is the new top gap enough, or should it be bigger?

## Status (append only; newest last)
- 2026-10-16 | Claude (chat) | Plan written in both repos; U0 started | NOTES: root-cause notes F8 to F12 are code reading only.
