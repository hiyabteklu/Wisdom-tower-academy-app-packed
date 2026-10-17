# PLAN: chosen background on EVERY screen (remaining areas) - 2026-10-17

READ THIS FIRST in the next chat. Owner rule, said twice: NO EXCEPTIONS. The chosen background (Dark, BG 1-3, Blue) must show behind every screen, tool, form, page, the drawer and the bottom navigation track. Owner uses a phone only (no computer), limit of the free plan is near, so every slice must be small and written down.

## Step 0 (owner, 1 minute, nothing else works before it)
GitHub > repo Wisdom-tower-academy-app-packed > Actions > Apply pending patches > Run workflow: script `patch_backdrop_all.py`, branch `claude/backdrop-all`. Then ask Claude to check the branch (get_file_contents with ref) and open the pull request when the build is green. It runs `patch_backdrop_everywhere.py` first (MainActivity overlay fills, Theme.kt, WisdomTabLayer.kt, WebView colours) and turns the tool panels and form fields into glass. Not compiled, not run yet.

## What the owner showed (screenshots 2026-10-17, 5:39 to 5:41) and the plan per area

### A. Notes reader (Chapter 1 Vector Analysis page): flat navy
- Files: `ui/study/NotesReaderScreen.kt`, `assets/notes/*.html`, overlay in `MainActivity.kt` (Study workspace, zIndex 18, `.background(WisdomNavy)`).
- Cause 1: the MainActivity overlay fill (fixed by Step 0). Cause 2: the page picture is a CSS `url(file:///android_asset/...)` in `AppBackground.cssBackground`; a WebView page that was not loaded from a file:// origin may not be allowed to read it, so only the plain colour shows (hypothesis, strong).
- Fix (slice BG1, ONE small file, fixes A, C, D, E and the competition pages at once): in `ui/theme/AppBackdrop.kt` make `webViewColor(context)` return `android.graphics.Color.TRANSPARENT`, and make `clearPageBackground(view)` inject only `html{background:transparent !important}body{background:transparent !important}` (no picture url, no glows). The picture is then drawn natively by `AtmosphereBackground` behind the transparent WebView. Check that each WebView screen has `AtmosphereBackground` behind it (Notes, Flashcards, Quiz, Competition exam/review, Tutor have it per docs/SESSION_2026-10-17_APP_BACKGROUND.md); if one does not, add `AtmosphereBackground(modifier = Modifier.fillMaxSize())` as the first child of its Box.

### B. Drawer (hamburger menu: Tools, Support & About): panel is almost solid navy
- File: `MainActivity.kt` (drawer panel). From `docs/SESSION_2026-10-13_F.md`: panel is a gradient `0xF2152238` to `0xF20D1829` (95 percent opaque) with a white 10 percent edge, scrim `0x66030812`.
- Fix (slice BG2, patch script, MainActivity is 261 KB so never resend it): new script `scripts/patch_backdrop_drawer.py` replacing those two colours with `0x33152238` and `0x330D1829` (about 20 percent) so the picture shows through, keep the edge, keep item rows (they are already glass). Optional: lighter scrim `0x33030812`.

### C. Quiz / exam page (question card, number pills, Prev / Next bar, Submit Exam) and practice mode (Right Away / After Finish)
- Files: `assets/notes/quiz.html`, `assets/notes/competition_exam.html`, `ui/study/QuizExamScreen.kt`.
- After BG1 the page background shows the picture, but the page CSS also paints solid navy cards (`#111A33` style fills), a solid darker bar behind Prev / Next, and a solid top counter bar.
- Fix (slice BG3): in the two HTML files change the card, option, number-pill, counter-bar and bottom-bar backgrounds to `rgba(255,255,255,0.04)` (options 0.05), keep borders, keep the selected / correct / wrong colours, remove the solid strip behind the bottom buttons (make it `transparent`). Search the CSS for the hex fills (`#0f172a`, `#111a33`, `#0a101d`, `#0b1329`) and replace only background declarations. Do not touch text colours. HTML files are small enough to resend or to patch with a python script.

### D. Flashcards (counter chips, big card, Previous / Next / Again / Learning / Known buttons)
- Files: `assets/notes/flashcards.html` (name to confirm), `ui/study/FlashcardsScreen.kt`.
- Same recipe as C (slice BG4): card gradient fill and the dark buttons become glass; Known stays the green button.

### E. AI Tutor (top pill with back / sessions / plus / bin, headline, suggestion chips, input pill, send button)
- Files: `ui/study/NativeTutorScreen.kt` (native top pill and input pill may carry solid fills), `assets/notes/tutor.html` (page).
- After BG1 the page is transparent. Remaining solid parts: native top pill (looks `0xFF0C1626`-like) and input row, and the page chips. Slice BG5: replace those fills with glass (`Color.White.copy(alpha = 0.05f)` native, `rgba(255,255,255,0.05)` in CSS). The old `html.bgimg` rules in tutor.html (assistant bubbles as navy glass 78 percent with blur) can be reused for assistant bubbles; make them about 40 percent so the picture shows.

### F. Bottom navigation track ("slider road") ruins the design
- File: `MainActivity.kt`, composable `AliveBottomNav` (the rounded capsule behind the five icons and the sliding pill). The track is dark navy and looks solid on every screenshot.
- Intended by `scripts/patch_glass_nav.py` (P20): track = see-through white 5 percent capsule, no hairline, no outline; pill 46 dp with cyan edge. Check whether P20 was ever run (look for `P20` or `pending` in `AliveBottomNav`). If not run: run it first. If run and the track is still solid: slice BG6 = new script `scripts/patch_backdrop_nav.py` that finds the track Box in `AliveBottomNav` and sets its fill to `Color.White.copy(alpha = 0.06f)` (or `Color.Transparent`) with a 1 dp `Color.White.copy(alpha = 0.10f)` edge, so the picture shows through the whole bar. Keep the selected pill as it is (cyan edge, soft teal fill).
- Also check the strip behind the nav (Scaffold bottom bar container): it must be `Color.Transparent`.

### G. Everything else, one pass at the end (slice BG7)
- Dialogs and drop-down menus (`0xFF0F1829`, `0xFF111B2E`, `0xFF0B1528`), `PdfReaderScreen` page badge, `HubGateDialog`: owner said no exceptions, so make them about 70 percent opaque glass (not fully clear, text must stay readable). Do this last and only after the owner sees BG1 to BG6 on the phone.
- Re-search the whole `ui/` folder for `0xFF0` navy fills and for `.background(Color(0xFF` to catch leftovers; list them in this file.

## Order of work (one slice per chat)
Step 0 (owner runs the patch) > BG1 (AppBackdrop.kt, the biggest win) > BG6 (bottom nav) > BG2 (drawer) > BG3 / BG4 / BG5 (HTML pages and tutor) > BG7 (dialogs, leftovers).

## Rules for the next Claude
- Never resend MainActivity.kt (261 KB): use a patch script in `scripts/` and tell the owner to run Actions > Apply pending patches; then verify the branch with `get_file_contents` using `ref`.
- Small files (AppBackdrop.kt, tutor.html, quiz.html) may be edited directly on main.
- Nothing here has been compiled or seen on the phone. If the build is red the owner pastes the line starting with `e: file:///`.
- Glass strength is one number per area (0.04 cards, 0.06 fields, 0.05 nav); raise it if text is hard to read on a bright picture.
