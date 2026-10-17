# SESSION 2026-10-17 APP BACKGROUND (chat, owner request)

Owner (words): "make all the apps background the tutor_bg.jpg that located in backgrounds (currently it's being used on the Ai tutor background. So make it the apps default background for all, reading notes, exams, etc...."

This is an explicit owner request (UI), done as one small slice. Written and pushed, NOT compiled by me, CI NOT seen, NOT seen on a device (owner rule 2026-10-16: pushed counts as done, report only what is genuinely not done).

## What changed
- NEW `ui/theme/AppBackdrop.kt`: decodes `assets/backgrounds/tutor_bg.jpg` once per process (down-sampled to about 1080 px wide when larger), returns null when the file is missing. Helpers for the WebView pages: `webViewColor(context)` (transparent when the picture exists) and `clearPageBackground(view)` (injects one CSS rule: html and body transparent, important flag).
- `ui/theme/WisdomComponents.kt`: `AtmosphereBackground` now draws the picture (crop) plus the same dark vertical scrim the AI Tutor used (0x66050A14 at the top, 0x99050A14 at the bottom). Without the picture it draws the old two glow orbs exactly as before. Every native screen and the app shell (MainActivity) already call `AtmosphereBackground`, so all of them get the picture with no per-screen change.
- WebView pages made see-through (`setBackgroundColor(AppBackdrop.webViewColor(ctx))` plus `AppBackdrop.clearPageBackground(view)` in `onPageFinished`): `NotesReaderScreen.kt` (notes), `FlashcardsScreen.kt`, `QuizExamScreen.kt` (hub question banks and exams), `CompetitionReviewView.kt`, `CompetitionExamScreen.kt`. The HTML files are NOT edited.
- `CompetitionExamScreen.kt` also got an `AtmosphereBackground` behind its WebView (it had none).
- `assets/backgrounds/README.txt` text updated.

## Not changed on purpose
- `NativeTutorScreen.kt`: it still draws its own copy of the picture and scrim on top of the shared one. Same look as before; a harmless duplicate. Cleanup (optional, later): remove its own Image and scrim and use `AppBackdrop.get(context)` for its `transparent` flag.
- `AdminConsoleScreen.kt` and the website WebViews in `MainActivity.kt` (hosted pages with their own solid dark colour #0A101D / #060B15): they are website pages, not local pages, so the picture does not show there.
- The notes loading cover in `NotesReaderScreen.kt` is still a solid dark box that fades out when the page is ready.
- `docs/COMPETITION_STATUS.md`: not edited (too long to resend); this file is the log.

## Things to check on the phone (hypotheses, not verified)
- Text stays readable on long notes and the exam page (scrim is the Tutor's: 40 percent top to 60 percent bottom). If notes are too busy, raise the two scrim values in `WisdomComponents.kt` (`BackdropScrimTop`, `BackdropScrimBottom`).
- A page that has its own full-screen solid box would still be opaque (only html and body are cleared). If any page looks like a dark slab, tell the agent which one.
- The picture file is 949 KB; the README advised under 300 KB. A smaller copy would save memory and APK size.
- Memory: the decoded picture (about 10 MB at 1080 x 2400) is kept for the life of the app process.
