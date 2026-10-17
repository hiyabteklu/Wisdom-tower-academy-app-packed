# PLAN 2026-10-17: SOLID BACKGROUND OPTIONS + SETTING (replaces the picture background)

Owner (words): "The app looked cluttered with the stars and dotes in the background, drop that image completely and use clean solid background color that fits our Color plate and that will make good contrast with our glass like transparent designs. Make 5 options and build a setting to customize them. NB, I'm free tier user and limit is near, so push plan first, so we'll continue."

Status: PLAN ONLY. Nothing below is coded yet. One slice per chat (docs/AGENT_QUOTA_PROTOCOL.md). Start with B1.

## Why
The picture (tutor_bg.jpg, made the default in docs/SESSION_2026-10-17_APP_BACKGROUND.md, commits 0eb0423 and a60581f) looks cluttered behind the glass cards. The owner wants it gone everywhere, including the AI Tutor, and a clean solid colour instead, with 5 choices the student can pick in Settings.

## Current state (verified in code on 2026-10-17)
- `ui/theme/AppBackdrop.kt` (new, from the last session): decodes the picture, `webViewColor(context)` (transparent when picture exists), `clearPageBackground(view)` (injects html/body transparent).
- `ui/theme/WisdomComponents.kt`: `AtmosphereBackground` draws picture + scrim, else the old two glow orbs on `WisdomBackground`. Every screen and the shell (MainActivity) call it.
- WebView pages that call AppBackdrop: `NotesReaderScreen.kt`, `FlashcardsScreen.kt`, `QuizExamScreen.kt`, `CompetitionExamScreen.kt` (also draws AtmosphereBackground now), `CompetitionReviewView.kt`. HTML pages have `html, body { background: #0a101d }` and are not edited.
- `NativeTutorScreen.kt` still draws its OWN picture + scrim (`loadTutorBackdrop`) and makes its WebView transparent (class `bgimg` in tutor.html). It must be cleaned too.
- Hosted website WebViews (Admin Console #0A101D, shell website pages #060B15) are website pages: untouched.

## Design
Solid colour only. No picture, no orbs, no stars. Colours are PROPOSALS taken from the existing dark navy family (page #0A101D, shell bar #060B15, card gradient #131F38 / #0E172A / #0A101D, accents cyan and purple); the owner may change the hex values after seeing them. Glass cards (white 4 percent fill, white 8 percent edge) need a dark, low-saturation base, so all 5 stay dark.

| # | Name (proposal) | Hex | Note |
|---|---|---|---|
| 1 | Midnight (DEFAULT) | #0A101D | today's page colour in the HTML pages and WebViews, no visual jump |
| 2 | Deep Ink | #060B15 | the app bar colour, darkest, best glass contrast |
| 3 | Navy | #0E172A | middle of the card gradient, a touch lighter |
| 4 | Twilight | #121A33 | navy with a little indigo, ties to the purple accent |
| 5 | Graphite | #0C1116 | neutral near-black with a cool tint, no blue |

Open choice for the owner: whether to also allow a very subtle top glow. Default answer: NO (owner said clean).

## Slices (do in order, one per chat, push each in one commit, log in a docs/SESSION_*.md)
- **B1 Drop the picture, solid default.** `AtmosphereBackground` = `Box(background(solid colour))`, no orbs, no Image. Use Midnight for now. Remove picture use from `NativeTutorScreen.kt` (delete `loadTutorBackdrop`, the Image and scrim Box, the `transparent` param and the `bgimg` JS; the tutor WebView colour becomes the solid colour; `tutor.html` `html.bgimg` rules become unused, leave them). Keep `AppBackdrop.kt` but make it colour based (see B2) or leave the file and stop calling the picture decode. Do NOT delete the jpg or README (rule 13: no deleting files/assets without an owner order; the owner said "drop that image completely", so ask once whether deleting `tutor_bg.jpg` is wanted; until then it stays unused in assets, 949 KB of APK size).
- **B2 One colour source + 5 options.** New `ui/theme/AppBackground.kt`: enum of the 5 options (name, colour), the chosen one saved in SharedPreferences (key e.g. `wt_app_background`, default Midnight), exposed as a Compose state so every `AtmosphereBackground` recomposes at once. Replace `AppBackdrop.webViewColor` and `clearPageBackground` with the chosen colour: WebView native colour = chosen colour, and `onPageFinished` injects `html,body{background:<hex> !important}` (the 5 local pages keep their own CSS otherwise). The 5 WebView files already call these two helpers, so only the helper bodies change.
- **B3 Settings UI.** In `ui/settings/SettingsScreen.kt` add an "Appearance" row/section "Background" with 5 round swatches + names, the selected one ringed; tapping applies instantly and saves. Follow the Settings accordion/glass look already there; no invented text beyond the 5 names and the section title (HANDOFF rule h). Read `SettingsScreen.kt` size first (if over about 30 KB use a patch script, docs/EDITING_LARGE_FILES.md).
- **B4 Phone check + tune.** Owner looks at all 5 on: Home, Learning, a note, a quiz, the AI Tutor, a competition exam. Adjust hex values on the owner's word.

## Rules that apply
HANDOFF section 0 rules 11 to 13: focused change, no new dependencies, no deleting files, forbidden files untouched (`.github/`, gradle files, manifest, website-reference, branding). Pitfalls: every Modifier extension needs its own import; no trailing lambda before a defaulted parameter.

## Owner questions (only these are new)
1. Delete `tutor_bg.jpg` from the repo (saves 949 KB) or just stop using it?
2. Are the 5 proposed colours fine to start, or do you want different names or looks (e.g. one lighter, one with a purple tint)?
3. Should the choice apply to the whole app at once (planned) or per screen? (Planned: whole app.)
