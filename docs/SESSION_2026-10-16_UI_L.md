# SESSION 2026-10-16 UI_L: Account profile card reduced to the completion gauge

> Repo is PUBLIC: no secrets, no student data.

## Owner report (2026-10-16, device screenshot of the Account tab)
"This card is awkward and out of our premium feel app we made, it uses emoji, it's awkward, make it Only the completion gauge, no emoji, no big card, no clutter."

## What was changed (one file: `app/src/main/java/com/wisdomtower/academy/ui/account/AccountScreen.kt`, whole file resent)
- `MyProfileHero` (the big gold glass card) is GONE, with everything in it: the "MY PROFILE" title, the avatar disc with its icon inside the ring, the vector crown, the name, the "Verified" pill, the "Golden Scholar Crown active" / "Avatar, academic track..." lines, the "x of 7 steps complete" line and the 7 checklist chips.
- NEW `ProfileCompletionGauge(score)`: just the ring on the page background (no card, no border, no fill), the real percent in the middle and a small "COMPLETE" label under it. Cyan while incomplete; at 100% the ring turns gold with the soft glow it already had. Same Canvas method and same score rules as before (website `ProfileCompletionPanel.tsx`), same 900 ms fill animation. Ring 128 dp, stroke 8 dp.
- Removed now-unused code: `PremiumCrown`, `ChecklistChip`, `ProfileGauge`, `initialsOf`, the `GoldEdge` colour, the `displayName` / `selectedPreset` / `milestones` locals in `MyProfilePanel`, and the `fallbackName` parameter of `MyProfilePanel` (its only caller was updated). Imports that only those used were removed (infinite transition, `Path`, `clipPath`, `CornerRadius`, `StrokeJoin`, `Shield`, `TextOverflow`, `offset`).
- NOT touched: the three step cards (their Filled / Required / Incomplete badges now carry the "what is missing" information the chips used to show), the avatar picker (the avatar is still chosen in step 1), Save, Log Out, the points card, the Admin Console button, all data and score logic.

## Evidence and limits
- `[~]` WRITTEN, NOT compiled by me, CI NOT seen, not seen on a device. I checked every removed import against the remaining file by reading it (BUILD_PITFALLS rule on Modifier imports); a missed one would show as `e: file:///` unresolved reference or only as an unused-import warning.
- Decision for the owner (not asked, my choice): the avatar no longer shows at the top; if he wants it back it can be a small disc inside the ring, but he asked for ONLY the gauge.
- The competition board (`docs/COMPETITION_STATUS.md`) was not edited: this is a UI change, not a competition stage.

## Next
Owner: report the CI result of this commit; if red, paste the line that starts with `e: file:///`. Then phone-check the Account tab (ring fills, percent correct, gold at 100%, nothing cut off).
