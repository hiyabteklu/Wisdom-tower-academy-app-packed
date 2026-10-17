# SESSION 2026-10-17 B6 GALAXY PHOTO, BLURRED (chat, owner uploaded a Milky Way photo: "dots disturb in scrolling, vivid pattern disturbs reading, white dots overlap white text. Smoothen it by blur")

Written and pushed, NOT compiled by me, CI NOT seen, NOT seen on a device.

## What was done
- The photo (1446 x 2576) was processed in this chat: shrunk, **median filter** (removes every star), shrunk again to **108 x 192 px**, gaussian blur, then calmed: brightest pixel capped (about 36% luminance, so white text keeps strong contrast) and the vividness lowered. Result: only a soft blue Milky Way glow, no dots, no sharp pattern. I looked at the result before pushing.
- It is about **1.2 KB**, so it is stored as text in the new `ui/theme/BackdropPhotos.kt` (`GALAXY_BACKDROP_BASE64`). The chat GitHub tool cannot upload picture files, and a file this small does not need to be one. No picture file is added to the repo or the APK.
- `ui/theme/AppBackground.kt`: option **Galaxy** is now this blurred photo (before it was drawn from glows). It is decoded once and stretched over the screen ("cover") with high-quality smoothing, which keeps it soft and avoids any shimmer while scrolling. WebView pages (notes, quiz, tutor ...) get the same picture as a CSS background (data URI, fixed to the screen). The Settings swatch shows it too.
- Other options unchanged: Midnight (blue), Black, Nebula, Dusk.

## Check on the phone (hypotheses)
- Galaxy: soft blue glow with a lighter diagonal band, no dots; white text clearly readable on cards and notes; scrolling a note shows no moving dots.
- If it is too dark or too faint, the next chat can rebuild it brighter (the processing is a few lines; `k` in the script sets the strength). If a page's CSS has its own full-screen solid box it would still hide the picture there.
- Very soft gradients on dark can show faint banding on some screens; say so if you see it.

## Not done
- The original photo itself is not stored in the repo. If wanted, upload it by hand to `app/src/main/assets/backgrounds/`.
- B3 patch for the Settings card must be applied and merged (see `docs/SESSION_2026-10-17_B3_BACKGROUND_PICKER.md`) if it is not yet.
