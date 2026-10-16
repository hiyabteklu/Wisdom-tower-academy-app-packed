# SESSION 2026-10-16 TUTOR_BG (chat, owner request)

Owner (words): "the Ai tutor background looks to solid color and ugly. Can I make custom background image for that in a little smooth blur... So texts overlays cleanly?, where to place the image".

NOTE: this is neither a competition stage nor an admin-redesign slice; it is an explicit one-off owner request (HANDOFF rule 11f: an improvement the owner explicitly requested).

## What changed (written, NOT compiled by me, CI NOT seen, NOT seen on a device) `[~]`
- `ui/study/NativeTutorScreen.kt` (whole file resent; only these changes): new private `loadTutorBackdrop(context)` that reads `assets/backgrounds/tutor_bg.jpg` (null when missing or unreadable); when it exists the screen draws it full screen (`ContentScale.Crop`) over `AtmosphereBackground` with a dark vertical scrim, makes the chat WebView transparent and adds the class `bgimg` to the page. New imports: `android.graphics.BitmapFactory`, `androidx.compose.foundation.Image`, `androidx.compose.ui.graphics.ImageBitmap`, `androidx.compose.ui.graphics.asImageBitmap`, `androidx.compose.ui.layout.ContentScale`. `TutorWebView` got a `transparent` parameter.
- `assets/notes/tutor.html` (whole file resent; only a CSS block added): rules under `html.bgimg` make the page transparent and give assistant bubbles and the Thinking pill a softer navy glass (78 percent, backdrop blur) so text stays readable.
- `assets/backgrounds/README.txt`: marks the folder where the picture goes.

## Safety
- No R.drawable reference, no new dependency, no forbidden file touched. With NO image in the folder nothing changes: same opaque dark page as before.
- The image itself is NOT in the repo yet (the chat tools cannot upload a binary file): the owner uploads `tutor_bg.jpg` to `app/src/main/assets/backgrounds/` on GitHub.

## Open (hypotheses)
- Transparent WebView over a Compose image: standard, but not tested on this app (PauseShellWhileShown untouched).
- Decoding the JPEG happens once per screen open on the main thread (about 100 KB file); fine on a normal phone, unmeasured.
