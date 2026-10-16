# SESSION 2026-10-16 UI_AD: M11 slice 5 (drawer screens entrance motion)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AC.md`. Owner said: "Continue".

## Inspected first (and a change of method)
UI_Z listed the drawer screens as a patch-script job on `MainActivity.kt`. I could not read the `MainActivity.kt` drawer block (253 KB; code search shows only fragments) and could not test a patch script on the real file from this chat, so I did NOT write one. The five screens are drawn by `ui/drawer/DrawerScreens.kt` (46 KB, read whole): About, Contact, FAQ, Privacy and Terms are all `LazyColumn` pages with `item(key = ...)` cards. Entrance motion can live in that file, so no `MainActivity.kt` change is needed. NOT done by this slice: a screen push / pop transition when a drawer screen opens or closes (that lives in the `MainActivity.kt` chain; needs a patch script, left open).

## Changed (one file, whole file resent)
`DrawerScreens.kt`: import of `wisdomReveal`; one header comment paragraph; `.wisdomReveal(key, index)` added to:
- `DrawerHeaderBar` (shared by all five screens, key includes the title);
- About: hero (1), trusted line (2), paradigm (3), horizon and ecosystem cards (0, they rise when scrolled into view), and every `AboutTextCard` (pillars, continuum, features; key from the card title, index 0);
- Contact: intro (1) and the form column (2). The send button, fields and logic are unchanged;
- FAQ: the card (1);
- Privacy and Terms (`LegalDocumentScreen`): intro (1), summary (2), and every section card (key from screen title plus section number, index 0).
All texts, colours, layout and logic are unchanged (strings copied from the file as read; the special characters were kept).

## Evidence and limits
`[~]` Code read only. NOT compiled, CI NOT seen, not seen on a device. Risk to watch if CI is red: a typo from the whole-file resend (look for the first `e: file:///` line). Same `wisdomReveal(key, index)` call shape as UI_AA to UI_AC.

## M11 status (for `docs/UI_MOTION_PLAN.md` section 7; plan file not resent)
Slices: UI_Z `707a8a8`, UI_AA `c7ca038`, UI_AB `7de9a2a`, UI_AC `cee276a`, UI_AD (this commit). Still open: drawer screen push / pop (patch script), trophy shimmer while a contest is live, dialogs in other files, phone check of Home / Learning / Packages.

## Phone check
Menu > About Us: header, then the hero, trust line and next card rise in one after another; scroll down: each card rises once as it arrives. Same for Contact, FAQ, Privacy Policy, Terms of Service. Contact: typing, topic dropdown and Send work as before. Reopening a screen in the same app session: no replay.
