# SESSION 2026-10-15 AH (Claude chat): glass look and pill buttons for the competitions hub, Review button fix

Repo is PUBLIC: no secrets, no student names. Owner orders (2026-10-15, after the TEST 2 ranked run): (1) the score popup right after a ranked submit is fine; (2) review mode, the explanation and Explain with AI must stay closed until the timer (the contest window) ends; (3) fix the wrapped Review button; (4) no solid cards anywhere around the competition: glass, smooth iOS feel like Settings, Account and the sign-in forms; pill buttons, not squares; no bright-colour buttons.

## Done in this commit (`[~]` written, NOT compiled by me, CI NOT seen, not seen on a device)
- NEW `ui/competition/CompetitionGlass.kt`: `CompetitionPillButton(label, onClick, modifier, emphasized, enabled)`. Round ends, white 6% glass fill (soft cyan tint 14% with a cyan edge when emphasized), thin edge, soft press-in (`wisdomPressScale`), one line of text that never wraps. Uses only `WisdomGlassFillStrong` and `wisdomPressScale` from the theme (both read in `WisdomGlass.kt` / `WisdomComponents.kt`); the cyan is a private copy of the hub's own cyan so no theme name was guessed.
- `CompetitionsHubScreen.kt` (whole file resent, comments kept): the contest card is now `WisdomGlassCard` (corner 24dp) instead of a solid navy box; the card buttons are `CompetitionPillButton`, spread evenly across the row with equal weights, so Practice, Leaderboard and Review fit on one line (cause of the "Revie / w" wrap: three padded square buttons wider than the card, code read; hypothesis for the exact width on the owner's phone). Join, Resume, Practice and (on an ended contest) Leaderboard are emphasized; Review is plain. The old solid `CardButton`, `CardBg` and `DarkText` were removed.

## Item 2 (review and explanation closed until the window ends): NO change needed, evidence
- The Review button is drawn only on an ENDED contest (`CompetitionAction.VIEW_RESULT`), and the server RPC `competition_review` answers `review_not_open` before the window closes (contract file, read; not re-tested this session). The Explain with AI button is hidden while `ExamLockdown.active` (session N). Because the window is global, nobody can be inside a ranked exam after it ends. The owner will check on TEST 2 after 09:52 EAT.
- Side note (not changed): the ranked score popup (inside `competition_exam.html`) still says "Step-by-step solutions below will help you master every question" although no solutions show during a live contest. Offer: hide that line for ranked runs.

## NOT done yet (next slices, same style, one per chat)
1. Same glass and pill look for `CompetitionRulesScreen.kt` (red box, bright Start button), `CompetitionLeaderboardScreen.kt`, `CompetitionReviewScreen.kt`, `CompetitionPointsCard.kt`. Read each file first; use `CompetitionPillButton` and `WisdomGlassCard`.
2. The exam window page `competition_exam.html` keeps the hub exam window look the owner asked for ("exactly the same as my hubs"); its orange and green buttons are the hub's own. Change only if the owner says so.
3. The status board `docs/COMPETITION_STATUS.md` was not edited (very large file, resent whole). Add: session AF, AG, AH lines.
4. Delete the two TEST contests and their entries only when the owner says so.
