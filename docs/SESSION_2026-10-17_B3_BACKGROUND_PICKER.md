# SESSION 2026-10-17 B3 BACKGROUND PICKER (chat, owner: "Continue")

Slice B3 of `docs/PLAN_SOLID_BACKGROUND_OPTIONS.md`. Written and pushed, NOT compiled by me, CI NOT seen, NOT seen on a device. One step is still for the owner: run the patch (below), because `SettingsScreen.kt` (70 KB) is too big to resend.

## What was pushed
- NEW `ui/settings/BackgroundSection.kt`: the "Background" card. Same glass card, header, animated chevron and smooth expand (`WisdomExpandable`) as the other Settings sections. Inside: 5 round swatches with their names (Midnight, Deep Ink, Navy, Twilight, Graphite), the chosen one ringed in cyan. Tapping calls `AppBackground.select(context, option)`: the whole app changes at once and the choice is saved. TalkBack: header is a button with "Expanded/Collapsed", swatches are radio buttons. Only texts used: the title "Background" and the 5 names (the subtitle shows the chosen name), per HANDOFF rule h.
- NEW `scripts/patch_b3_background_section.py`: inserts one list item `BackgroundSection()` in `SettingsScreen.kt` right before the "SECTION 5: Offline Data & Cloud Sync" item (so the card sits after Reading & Display). Tested here on a fixture copy: first run patched, second run "already patched". Not run on the real file yet.
- The new file compiles on its own even before the patch (it is simply not called yet), so `main` is not at risk.

## To finish B3 (owner)
GitHub > Actions > **Apply pending patches** > Run workflow > script `patch_b3_background_section.py`, new branch name e.g. `fix/b3-background-picker` > wait for the green build > install it > Settings > Background > tap each swatch > merge with a Pull request. If the Action says the anchor was found 0 or 2 times, copy the message to the next chat.

## Not done
- `docs/PENDING_PATCHES.md` has no row for this patch yet (file is 14 KB, not resent to save quota); this log is the record.
- B4: phone check of all 5 colours on Home, Learning, a note, a quiz, the AI Tutor and a competition exam; tune hex values on the owner's word. Plan questions 1 to 3 still open (delete `tutor_bg.jpg`? colours fine? whole app at once is what is built).

## Check on the phone (hypotheses)
- Tapping a swatch changes the page colour at once on Settings and on every tab after going back.
- The ring and the name move to the new choice; after closing and reopening the app the choice is still there.
- A note, quiz or tutor page opened after the change uses the new colour.
