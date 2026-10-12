# Session log 2026-10-12 BH: U2 (premium native AI Tutor), step 1 = what exists today

> Continues `docs/SESSION_2026-10-12_BG.md`. Repo is PUBLIC: no secrets. NO application code was changed in this session.

- 2026-10-12 | Claude (chat, owner on free plan) | Owner picked U2 from `STATUS.md` B1 ("U2: premium AI Tutor"). First step per B1: read the current native tutor code and write down what exists BEFORE proposing a design.

## Read (all on `main` at `0f0e0369`)
`docs/SESSION_2026-10-12_X.md` (N10 tutor wiring), `ui/study/NativeTutorScreen.kt`, `assets/notes/tutor.html`, `website-reference/src/components/learning/AiTutor.tsx`. NOT read in this pass: `AiTutorRepository.kt`, `TutorSessionStore.kt` (known only from log X), `richtext.js`, `MainActivity.kt`.

## What exists (verified by reading code; not compiled or run by the agent; the owner reported the planned work tested on his device on 2026-10-12)
1. **Entry points**: `NativeTutorScreen` is called from ONE place, `LearningScreen.kt` (the "AI Tutor" tile of the Study Tools dock, state `tutorOpen`). No other caller was found by code search. So the drawer/menu and the course pages do not open the native tutor (this is the U1 problem, kept separate). `courseContext` is never passed (always null).
2. **Structure**: Compose shell + a local WebView page. Compose draws the toolbar, the "Chats" panel and the composer; the message list is `assets/notes/tutor.html` (shared KaTeX renderer). The app pushes the whole chat as JSON with `evaluateJavascript` (at most about every 80 ms while streaming); the page redraws only messages that changed. Page to app: `WTBridge.onSend` (chip/example tapped) and `WTBridge.onCopy`.
3. **Network**: streams the website route `/api/ai/tutor` (no keys in the app), events chunk / suggestions / done / failed. Calm "high demand" message with 3 chips if nothing arrived; "(Response stopped ...)" note if cut mid-answer; "Stop" works. Texts are copied from `AiTutor.tsx`.
4. **Chats**: several chats kept on the phone (`TutorSessionStore`, 50 newest), title from the first question (36 characters), list with "Study Chats", delete, "Clear All Past Chats", "+ Start New Chat". They do not sync with the website.
5. **Toolbar** (one row): back button, pill "Chats N", chat title, pill "+ New", small trash icon (32 dp) that clears the current chat WITHOUT a confirmation.
6. **Composer**: single-line `OutlinedTextField` (`singleLine = true`), IME action Send, 52 dp send box, amber "Stop" box while busy, `imePadding()`.
7. **Message look**: user bubble cyan-blue gradient; answer bubble dark card with border; timestamp; "Copy" text button that turns into "Copied" for 2 s; follow-up chips with a star, max 3; "Thinking" pill with bouncing dots; welcome screen with title, one line and 3 example chips.

## Gaps against "premium native" (observations; ranking is a suggestion, not a decision)
- A. **Single-line composer**: a long question or formula scrolls sideways in one line; nothing wraps (`singleLine = true`).
- B. **Toolbar is crowded and has small touch targets** (11 to 12 sp text, 32 dp trash); the destructive "clear chat" sits right next to "+ New" with no confirmation (hypothesis: accidental taps).
- C. **No avatar** for the tutor on the welcome screen and answers (the website shows `animation.gif`; the file `animation.gif` exists in the repo root, whether it is in the app assets was NOT checked). No user avatar either (the website has one).
- D. **No "jump to latest" button** and no visible scroll position cue; the page auto-scrolls only when the reader is near the bottom (within 140 px).
- E. **No retry**: after the calm error message the student has to tap a chip or retype (the chip "Try asking again" sends that text as a new question, hypothesis: not a true retry of the failed question).
- F. **History opens as a full panel** that replaces the chat (the website uses a side sheet). Works, but feels like leaving the screen.
- G. **Performance (hypothesis, not measured)**: every push serialises the WHOLE chat to JSON and each streamed chunk re-renders the whole last answer through KaTeX; long chats or long answers may stutter or flicker on a weak phone.
- H. **No course context**: opened from inside a course, the tutor cannot know the course (depends on U1 and a native entry).
- I. **Copy only**: no share, no copy of the question, no "regenerate".
- J. Status of the code itself: the header says "NOT compiled, NOT tested"; that comment is out of date versus the owner's 2026-10-12 report, but the agent has no proof either way.

## Proposed order for the owner to choose from (NO code until the owner picks; keep the approved design language; no invented text)
1. Composer: multi-line field growing up to about 4 lines, bigger send/stop buttons.
2. Toolbar: Back + title + Chats + New; "Clear chat" moved behind a confirmation.
3. Avatar and message polish (only with assets/texts that already exist on the website).
4. "Jump to latest" button and a real retry for a failed answer.
5. Chats list as a bottom sheet / side panel over the chat instead of replacing it.
6. Performance pass only if the owner feels lag (measure first).
7. Course context: wait for U1.

LEFT: owner chooses which of 1 to 7 (or other wishes); then one small change per commit; `NativeTutorScreen.kt` is about 25 KB and can be resent whole; `tutor.html` is small. Re-run `HANDOFF.md` section 9 phone checklist (Learning tab > AI Tutor) after any change.
TEST: nothing new this session.
UNSURE: items A to J are from reading code only; no screenshots from the device were seen.
