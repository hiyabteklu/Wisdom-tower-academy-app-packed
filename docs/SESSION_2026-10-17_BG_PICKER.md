# SESSION 2026-10-17 BG_PICKER (continues docs/SESSION_2026-10-17_BG_FEEDBACK_1.md, problem 3)

Written and pushed, NOT compiled by me, CI NOT seen, NOT seen on a phone.

- `ui/theme/AppBackground.kt` (bfdce93d): `AppBackground.options` is now only Dark (Black) and BG 2 (Photo2). Default and fallback is Dark. A saved old choice (BG 1, BG 3, Blue) falls back to Dark. The enum entries stay (nothing deleted, other code may name them).
- `ui/settings/BackgroundSection.kt` (21cd6104): the 5 round swatches are replaced by one pill with two icon buttons (moon = Dark, image = BG 2). A highlight slides between them (spring, same feel as the other Settings animations). Uses `Icons.Filled.DarkMode` and `Icons.Filled.Image` (extended icons, same set as `Palette` already used here). If the build is red on an icon name, replace the icon in `iconFor`.
- No new text: the card title and the chosen name subtitle are unchanged.

STILL OPEN: S-DRAWER, S-LOADING (see BG_FEEDBACK_1).
