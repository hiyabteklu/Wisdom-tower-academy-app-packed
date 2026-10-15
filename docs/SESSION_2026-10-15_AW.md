# SESSION 2026-10-15 AW: Notifications v2, slice R5

**Owner order:** continue `docs/NOTIFICATIONS_V2_PLAN.md` (R4 was pushed in session AV, commit a439912).

## Done in this commit
- NEW `ui/notifications/NotificationReaderScreen.kt`: full-screen reading view that opens INSIDE the notifications section. Category pill + date, then the blocks: title (strong gold), subtitle (softer gold), paragraph and callout with bold (bright white) and highlight (gold background, dark text), bullets (gold dots), divider (gold gradient line). Back arrow and the phone Back button (BackHandler) return to the list. Rows with no blocks (every row today) show title + body in the same style.
- `ui/notifications/NotificationsScreen.kt` (whole file resent; the original design, glass rows, guest notice, skeleton, error box and empty state are unchanged):
  - filters now All / Material Releases / Announcements / Contests;
  - tap rules: announcement (and old general/payment rows) opens the reader in place; contest always opens `/competitions` (trophy screen); material goes to its url;
  - new optional parameter `openId: String? = null` so a push can open the reader for one notification (wired in slice R6, caller unchanged for now);
  - opening the reader marks the notification read; row preview text limited to 3 lines.
- Gold colour = `0xFFFCD34D`, the amber-300 the Announcement icon already used in this screen. No new theme token, no new dependency, no new host. Icons used (`EmojiEvents`, `Info`, `MenuBook`, `ArrowBack`) are already used elsewhere in `app/src`; `BackHandler` is already used in other screens.

## Evidence
- Code only. **[~] written, not compiled.** CI result NOT yet seen (R4 commit a439912 is also unbuilt: if CI is red, read the error first, both commits touch only notification files). Not tested on a device.
- BUILD_PITFALLS checked: every Modifier extension imported; no composable called inside a LazyColumn scope; no trailing lambda on a function whose last parameter is not the lambda; no web icon names.

## Behaviour changes the owner will notice
- An old announcement (type admin, general or payment) no longer jumps to the Learning page: it opens a reading view. This is the owner's order of 2026-10-15.
- Old rows that had a special url (for example a payment notice) no longer navigate from this list. HYPOTHESIS: acceptable, only 2 general rows exist live and none are payment.

## Left
- R6: `MainActivity.kt` patch script (push tap opens `/notifications?open=<id>`; passes `openId`), owner runs the Action.
- R1, R2, R3: database migration, website API and the new admin composer (these create the content and contest rows that this screen can show).
- Still NOT written into the plan progress table or the stage board (kept commits small): add rows for R4 `[~]` and R5 `[~]` in `docs/NOTIFICATIONS_V2_PLAN.md` section 8 and `docs/COMPETITION_STATUS.md`.

## Owner: what to check
- Wait for CI green on the latest commit. Then open Notifications: tap an announcement, it should open full screen, Back returns to the list.
