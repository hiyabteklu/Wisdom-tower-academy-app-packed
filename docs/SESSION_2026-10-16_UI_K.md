# SESSION 2026-10-16 UI_K (U11): duplicate section bar removed, bottom sheet dim-only bug

> Repo is PUBLIC: no secrets, no student data. (UI_J already existed from another session; this file is UI_K.)

## Owner reports (2026-10-16, device screenshots, Free Resources and Course Content)
1. "No need for the opened item to tag on the header, it creates another header below our native app and wastes screen space" (all admin sections).
2. "I can't take any action: Add item, Edit etc. the screen dims and nothing happens, tap and the dim is gone." Works in a browser, fails in the app. Owner's reading: the pop-up appears outside the visible screen.

## What was pushed (website repo `hiyabteklu/Wisdom-tower-academy`, main)
- `eaa0e48` `src/app/admin/page.tsx`: the section bar (back chevron, gold chip, title, subtitle) is REMOVED. Section view is now only the panel. Unused `goHome`, `ChevronLeft`, `AdminChip`, `activeDef`, `subtitle` removed. Back: phone Back button (`AdminConsoleScreen` BackHandler calls `web.goBack()`) pops the pushed `/admin?tab=` entry and returns to the grid; `popstate` logic unchanged.
- `04892b3` `src/components/admin/ui.tsx` `AdminSheet`: (1) rendered with `createPortal` under `document.body`; (2) 120 ms after opening it measures its own panel and, if the panel is not inside the window with its bottom edge on the window bottom, switches the wrapper to `position: absolute` at the current scroll position with the window size ("rescue"); (3) `touch-none` on the backdrop; (4) TEMP-DEBUG line at the top of the dim: `win WxH vv WxH panel top/bottom/left/w/h ok|RESCUE`.

## Evidence and limits
- Read in full: `ui.tsx`, `page.tsx`, `layout.tsx`, `globals.css`, `ui-polish.css`, `ui-polish-scroll.css`, `FreeResourcesPanel.tsx`, `AdminConsoleScreen.kt`, `scripts/patch_admin_host.py`. Nothing in them creates a containing block for `position: fixed` (no transform, filter, contain, will-change) and the sheet markup is structurally correct. So the cause of the dim-only sheet is NOT proven: hypothesis only. Candidates: the panel is placed outside the visible area in the app WebView, or the WebView window height differs from what is visible.
- NOT built, NOT seen on a device. `[~]` until Vercel is green and the owner reports.

## Owner test and what to send back
Open Free Resources, tap Add story. If the sheet shows: done, tell Claude, then remove the TEMP-DEBUG line in `AdminSheet`. If only the dim shows: screenshot it; the grey line at the top gives the numbers (RESCUE means the panel was off-screen and was moved; ok means the panel is where a browser would put it and the problem is the app-side WebView size: next look at the call site in `MainActivity.kt`).

## Next
U10 regression pass; remove TEMP-DEBUG after the owner confirms.
