# Games Roadmap — Wisdom Tower Academy

## Live Games

### 1. Tower Defense of Knowledge
- **Status**: Live / MVP Phase 1 & 2
- **Location**: Website (Next.js App Router: `/games/tower-defense` & `/academy/exit-exam/tower-defense`)
- **Question source**: Exams section only (`hub: "exams"`, past matriculation papers, model exit exams, and timed drills). **Never question banks**.
- **Goal**: Survival / wave defense study game. Academic questions transform into marching adversaries advancing toward the Knowledge Citadel. Correct responses eliminate enemies with combo multipliers and particle bursts. Timeouts and misses inflict core damage while displaying complete pedagogical step-by-step mathematical solutions.
- **Key rules**:
  - Starting Tower Health: 5
  - Base Time Per Question: 25s (scaling tighter on later waves)
  - Wave Progression: Exponentially advancing waves with Scout (Fast), Standard (Basic), and Armored Boss enemies.
  - Multiplier Combos: 2x at 3 in a row, 3x at 5, 4x at 8.
  - Power-Ups: Chronos Stasis (Freeze timer/march for 12s), Logic Filter (50/50 removes 2 wrong options), Fortify Core (+1 Heart), Tactical Deflection (Skip).
  - Choice Fair Shuffle: Runtime choice permutation with correct index remapping, except when choices include "all of the above", "none of the above", "both A and B", etc.
  - Missed Questions Review: Complete breakdown list populated after each run with full KaTeX LaTeX derivations.
- **Offline**: Fully offline-capable once the page or exam track has loaded or cached (powered by client-side WebCache / `offlineStore.ts`).

---

### 2. Tower Climb
- **Status**: Live / MVP Phase 1 & 2
- **Location**: Website (Next.js App Router: `/games/tower-climb` & `/academy/tower-climb`)
- **Question source**: Question Banks only (`hub: "question-banks"`, chapter quizzes). **Never Exams**.
- **Concept**: Vertical course towers where one floor = one chapter. Students climb upward by solving chapter questions alongside their wise scholarly owl mascot who carries an illuminated golden lantern.
- **What Phase 1 & 2 Include**:
  - 8 questions per floor, 3 hearts, 20 seconds per question.
  - Boss Floors every 5th floor: 12 cumulative questions, 4 hearts, no power-ups, distinct milestone styling.
  - Five distinct atmospheric zones:
    1. Stone Foundation (Floors 1–10)
    2. Library Hall (Floors 11–20)
    3. Clockwork Gallery (Floors 21–30)
    4. Observatory (Floors 31–40)
    5. Sky Crown (Floors 41+)
  - Solution Sheet: Slides up on mistakes with full KaTeX LaTeX derivations and a "Got it, continue climb" button.
  - Review Attic: Spaced remediation queue for missed questions with mastery tracking.
  - Daily Climb: 8-question mixed daily trial with flame streak tracking and bonus XP.
  - Gating Resilience: Stable vertical tower layout with `ENFORCE_PAYWALL` flag (default false) and `isFloorUnlocked` logic; floors always render clearly without disappearing.
  - Sound & Haptics: Connected to existing Web Audio synthesizer and device vibration APIs with mute controls.
  - Auto-scroll and "Jump to Me" position tracking on the vertical map.
- **What is planned for Phase 3**:
  - Cosmic owl skins and lantern cosmetic variations.
  - Friend ascent ghost markers on the vertical tower axis.
  - Course completion diplomas.

---

## Rules for future agents
- **Tower Defense = Exams questions only** (Past papers, model exit exams, national entrance exams).
- **Tower Climb = Question Banks questions only** (Chapter practice questions, topical drills).
- **Both games live on the website** (Next.js App Router).
- **Android app remains WebView + light native chrome**; no native game engines in Kotlin/Compose.
- **Always document progress in this file** when starting or finishing any phase.
