# SESSION 2026-10-17 B5 BACKGROUND REWORK (chat, owner: "5 flat dark colours, ugly, no difference. Make a slightly blue, a black, and image-like galaxy ones, smooth, low opacity")

Rework of B2/B3 of `docs/PLAN_SOLID_BACKGROUND_OPTIONS.md` after the owner saw the first build. Written and pushed, NOT compiled by me, CI NOT seen, NOT seen on a device.

## What changed
- The 5 options now really differ: **Midnight** (slightly blue, soft blue glow at the top, default), **Black** (pure black), **Galaxy** (violet, blue and magenta glows plus a very faint diagonal light sweep), **Nebula** (teal, blue and purple glows plus the sweep), **Dusk** (purple, pink and blue glows).
- They are NOT picture files: each is drawn from a few soft, blurred, low-opacity glows (radial gradients). No dots, no stars, no hard edges, no APK size. Strengths are 16 to 30 percent at the centre, fading to 0.
- `ui/theme/AppBackground.kt` (rewritten): `BackdropGlow`, the 5 options (name = saved choice; `Midnight` kept so an old save still works; the other old names fall back to Midnight), the `Modifier.appBackdrop(option?)` that draws a look, and the state holder (unchanged).
- `ui/theme/AppBackdrop.kt`: `color` is the option's plain base colour; for local WebView pages `clearPageBackground` injects the same glows as CSS (`radial-gradient`, `vmax` sizes, fixed to the screen) so notes, quiz, tutor and the other pages look like the native screens. Pages do not depend on what is drawn behind them.
- `ui/theme/WisdomComponents.kt`: only `AtmosphereBackground` changed (uses `appBackdrop()`); everything else copied unchanged.
- `ui/settings/BackgroundSection.kt`: each round swatch is now a small preview of its real look (52 dp), same ring and names.
- `tutor_bg.jpg` stays deleted.

## Not possible here
- Real photos: this chat cannot push picture files (the tool sends text only) and has no photo of its own. The glows imitate a smooth galaxy. If the owner still wants a real photo, add it to the repo by hand (GitHub > Add file > Upload) in `app/src/main/assets/backgrounds/` and ask the next chat to blur it and use it as one more option.

## Check on the phone (hypotheses)
- Settings > Background: 5 clearly different round previews; tapping one changes every screen at once and keeps after closing the app.
- Glass cards stay readable on Galaxy and Nebula (glow strength is low on purpose); if text looks weak somewhere, lower that glow's alpha in `AppBackground.kt` (one number per glow).
- A note, quiz and the AI Tutor show the same glows as the native screens. A page that has its own full-screen solid box inside its HTML would still show that box's colour.
- Very dark gradients can show faint banding on some screens; if it looks bad say so and the next chat can add a tiny texture.

## Still open
- The B3 patch (`scripts/patch_b3_background_section.py`) must be applied and merged if not already; then B4 tuning on the owner's word (which glow too strong or too weak).
