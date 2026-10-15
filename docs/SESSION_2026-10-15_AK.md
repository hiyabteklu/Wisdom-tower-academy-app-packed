# SESSION 2026-10-15 AK (Claude chat): leaderboard screen in the glass look

Repo is PUBLIC. Owner: read the handoff and status and continue; the pending item from session AJ was "leaderboard screen glass (still next), points card glass".

## Done (`[~]` written, NOT compiled by me, CI NOT seen, not seen on a device)
- `ui/competition/CompetitionLeaderboardScreen.kt` (whole file resent). Only the look changed; data, texts, ranks, decisions D/E/F/G and the server calls are untouched.
  - Solid navy (`LbCardBg`) is gone. Ranks 4 to 10 rows and the own-rank row use `WisdomGlassCard` (own row: soft cyan tint and cyan edge). The prize and points panel uses `WisdomGlassCard`.
  - The three trophy cards keep their podium layout, glowing trophy and medal-coloured rank chip, but sit on a light medal tint fading into the glass fill, with a thin medal-coloured edge (cyan, thicker, when it is the student's own card).
  - Back, Try again and the Ranks 4 to N toggle are now `CompetitionPillButton` (glass pills, Try again emphasized). The private solid `LbButton` was removed, with its unused `clickable` import.
- New imports used: `WisdomGlassBorder`, `WisdomGlassCard`, `WisdomGlassFill` (all exist in `ui/theme/WisdomGlass.kt`, read this session) and `widthIn`.

## Not done
- Points card in Account (`CompetitionPointsCard.kt`) is still the old solid look: next.
- The stage board in `docs/COMPETITION_STATUS.md` was not updated in this commit (the file is about 39 KB; same gap as session AJ).

## Notes and risks
- Hypothesis: on the glowing background the medal tint may look weaker than the old solid cards; if the owner wants stronger, raise the two `alpha` values of the card gradients (0.16 and 0.14) and the edge alpha 0.5.
- Owner phone check: open a finished contest's Leaderboard: top 3 cards, expand ranks 4 to 10, own row outside the top 10, Back and Try again.
