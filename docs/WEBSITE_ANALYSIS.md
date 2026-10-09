# WEBSITE_ANALYSIS.md — Wisdom Tower Academy

> **Phase A0 Deliverable** — Comprehensive map of the live website codebase (`hiyabteklu/Wisdom-tower-academy`)
> to native Jetpack Compose implementation in `Wisdom-tower-academy-app-packed`.
> Source of truth: `website-reference/` snapshot.

---

## 1. Architectural Boundary (Native vs. Website Handoff)

| Capability / Section | Host | Rationale |
|---|---|---|
| **App Chrome** (Status bar, Top bar, Menu, Bottom Nav) | **Native Compose** | Immediate touch feedback, no web header/footer overhead, zero flicker. |
| **Home Screen** (`/`) | **Native Compose** | Instant app launch, hero, pathways grid, resource hubs without waiting for web network. |
| **Academy / Packages Hub** (`/academy`, `/packages`) | **Native Compose** | Structured card grids, fast package browsing, cached metadata. |
| **Package Landing Pages** (`/academy/[pkg]`) | **Native Compose** | Header, curriculum description, features list, pricing, syllabus overview. |
| **Learning Suite Landing** (`/learning`) | **Native Compose (Shell)** | Fast course/subject selector & study mode hub. |
| **Learning Material Readers** (PDFs, Notes, Flashcards, Practice Exams) | **Website (WebView)** | Rich markdown, LaTeX/KaTeX math equations, interactive answer submission, study timers. |
| **"Explain with AI" & Tutor** | **Website (WebView / API)** | Server-side Groq/Gemini execution with secret keys on Vercel backend. |
| **Checkout, Orders, Bank Transfer Proof** | **Website (WebView)** | File upload to Supabase storage, order verification, banking instructions. |
| **Account & Settings** (`/account`, `/settings`) | **Native Compose (Shell)** | Instant profile card, offline storage stats, native toggles, deep links. |
| **Notifications Feed** (`/notifications`) | **Native Compose + Web fallback** | Quick order status & package announcement feed. |
| **Free Guides** (Success Stories, Campus Life, etc.) | **Native Compose** | Static card & article readers. |

---

## 2. Website Route Matrix & Analysis

### 2.1 Route: Home (`/`)
- **Website Source:** `website-reference/src/app/page.tsx`
- **Key Components:**
  - `src/components/home/LandingPage.tsx`
  - `src/components/home/LandingPathways.tsx`
  - `src/components/home/InfinityCard.tsx` (`hide-on-app`)
  - `src/components/home/LandingPage.tsx:StatsSlider` (`hide-on-app`)
  - `src/components/PartnershipPath.tsx` (`hide-on-app`)
- **Data Files:**
  - `src/data/packages.ts` (all program metadata & packageImages)
  - `src/data/special-packages.ts` (ECE Engineering)
- **Image Assets:**
  - Hero image: `public/images/home/academy.jpg`
  - Pathways:
    - ECE: `public/images/special-packages/ece.jpg`
    - Freshman: `public/images/packages/freshman_00241b.jpeg`
    - Grade 9–12: `public/images/packages/grade-9-12_9842aa.jpeg`
    - COC: `public/images/packages/coc_e44a09.jpeg`
    - UAT: `public/images/packages/uat_56b257.jpeg`
    - GAT: `public/images/packages/gat_46ddb1.jpeg`
    - Exit Exam: `public/images/packages/exit-exam_c32a43.jpeg`
    - Remedial: `public/images/packages/remedial.jpg`
- **Styles & CSS Classes:**
  - `.site-atmosphere`, `.atm-base`, `.atm-glow`
  - `.card-modern`, `.btn-primary`, `.btn-secondary`, `.btn-open`
  - Gradient accent: `linear-gradient(135deg, #22e0ff 0%, #38bdf8 50%, #818cf8 100%)`
- **Sections Shown on Native Home (Order):**
  1. Hero with animated gradient text "Wisdom **Tower** Academy", primary action "Enter Academy →", auth action "My Learning" / "Sign in", welcome status line.
  2. Full-width Welcome card (`academy.jpg`), 16:9 on mobile, dark gradient overlay with "Open Learning →" pill badge.
  3. Program Cards Grid (2 columns on mobile, 16:10 top image, title + small "Open →" button).
  4. "Other resources" grid (2 columns, icon box + title + subtle arrow).
- **Sections Hidden on Native Home (`hide-on-app`):**
  - Stats slider (`30K+ Users`, `10+ Partners`, `70+ Services`)
  - Infinity card ("Always here")
  - "Want digital services instead?" cross-link
  - Final footer CTA and partnership banner

---

### 2.2 Route: Academy Pathways Hub (`/academy`) & Packages (`/packages`)
- **Website Source:** `website-reference/src/app/academy/page.tsx`, `website-reference/src/app/packages/page.tsx`
- **Key Components:**
  - `src/components/academy/PathwayGrid.tsx`
  - `src/components/packages/PackageCard.tsx`
- **Data Files:**
  - `src/data/packages.ts` (`academyPackages`)
  - `src/data/special-packages.ts`
- **Image Assets:**
  - `public/images/packages/*`
  - Bank logos: `public/images/banks/*` (Telebirr, CBE Birr, Awash, Dashen, etc.)
- **Styles & CSS Classes:**
  - `.card-modern`, `.badge-accent`, `.price-tag`
- **Native Implementation:**
  - Tabbed or filterable list: High School (G9-G12), University (Freshman, ECE), Entrance/Exams (UAT, GAT, Exit, COC, Remedial).
  - Price pills (e.g. `250 ETB`, `350 ETB`), features bullets, "Explore Program →".

---

### 2.3 Route: Package Landing Pages (`/academy/[id]`)
- **Website Source:**
  - `/academy/freshman/page.tsx`
  - `/academy/grades/page.tsx` & `/academy/grades/[grade]/page.tsx`
  - `/academy/coc/page.tsx`
  - `/academy/uat/page.tsx`
  - `/academy/gat/page.tsx`
  - `/academy/exit-exam/page.tsx`
  - `/academy/remedial/page.tsx`
  - `/academy/special-packages/electrical-computer-engineering/page.tsx`
- **Content Structure:**
  - Package Hero (Badge, Title, Subtitle, Pricing / Enrollment Status)
  - Included Courses Grid (Course titles, department categories, semester tags)
  - Feature highlights ("Official Textbooks", "Chapter Summaries", "Question Banks", "Mock Exams", "Explain with AI")
  - Primary CTA ("Unlock Package" / "Continue Studying")
- **Native Implementation:**
  - Native scrolling overview screen.
  - Tapping "Unlock" opens WebView `/checkout?package={id}`.
  - Tapping a course/study hub opens the study material in WebView with session retained.

---

### 2.4 Route: Learning Suite Hub (`/learning`)
- **Website Source:** `website-reference/src/app/learning/page.tsx`
- **Key Components:**
  - `src/components/learning/LearningNav.tsx`
  - `src/components/learning/SubjectCard.tsx`
  - Study tool launchers (Calculator, Flashcard deck, Notes, Exams, AI Tutor)
- **Native Implementation:**
  - Quick-access study dashboard: Enrolled packages, recently opened subjects, tool shortcuts.
  - Tapping any specific study unit hands off smoothly to the alive WebView without page reload.

---

### 2.5 Route: Account (`/account`) & Settings (`/settings`)
- **Website Source:**
  - `website-reference/src/app/account/page.tsx`
  - `website-reference/src/app/settings/page.tsx`
- **Native Implementation:**
  - User identity badge (Name, Email, Student ID)
  - Active Package Unlocks (Freshman, G12, ECE, etc.)
  - Offline PDF Vault manager (View stored books, storage used, clear cache)
  - App Settings (Theme, Push notifications toggle via FCM, version info)
  - Help & Legal links (About, FAQ, Contact, Privacy, Terms)

---

### 2.6 Route: Free Resources / Guides (`/academy/*`)
- **Website Source:**
  - `/academy/success-stories`
  - `/academy/study-techniques`
  - `/academy/campus-life`
  - `/academy/universities`
  - `/academy/departments`
  - `/academy/scholarships`
- **Icons & Accents:**
  - Success Stories: `Trophy`, Amber (`#f59e0b`)
  - Study Techniques: `Lightbulb`, Cyan (`#22e0ff`)
  - Campus Life: `Trees`, Sky (`#38bdf8`)
  - Universities Directory: `Building2`, Violet (`#8b5cf6`)
  - Departments Guide: `Library`, Orange (`#f97316`)
  - Scholarships Guide: `GraduationCap`, Rose (`#f43f5e`)
- **Native Implementation:**
  - Clean card lists and guide viewers natively rendered with Material 3.

---

## 3. Design Tokens & Styling Mapping

| Web Token (CSS / Tailwind) | Web Value | Jetpack Compose Equivalent |
|---|---|---|
| `--background` / `wisdom-dark` | `#070c16` | `WisdomDark` (`0xFF070C16`) |
| `wisdom-navy` | `#0a1220` / `#060B15` | `WisdomNavy` (`0xFF060B15`) |
| `--card` / `wisdom-card` | `#1c283c` | `WisdomCard` (`0xFF1C283C`) |
| `card-surface-dark` | `rgba(22, 33, 52, 0.95)` | `WisdomCardSurface` (`0xF0162134`) |
| `--cyan` / `wisdom-cyan` | `#22e0ff` | `WisdomCyan` (`0xFF22E0FF`) |
| `cyan-dark` | `#00c4e6` | `WisdomCyanDark` (`0xFF00C4E6`) |
| `--wt-muted` / `wisdom-muted` | `#aab6c8` | `WisdomMuted` (`0xFFAAB6C8`) |
| `--foreground` | `#f4f7fb` | `WisdomTextPrimary` (`0xFFF4F7FB`) |
| Card Border Subtle | `rgba(255, 255, 255, 0.09)` | `WisdomBorderSubtle` (`0x17FFFFFF`) |
| Card Border Accent | `rgba(34, 224, 255, 0.35)` | `WisdomBorderCyan` (`0x5922E0FF`) |
| Font Display | `Outfit`, bold/black | `OutfitFontFamily` (SansSerif 700/800) |
| Font Body | `Plus Jakarta Sans`, 400/500/600 | `BodyFontFamily` (SansSerif 400/500/600) |
| `.btn-primary` | Pill/Rounded 12dp, Cyan gradient, dark text | `WisdomPrimaryButton` |
| `.btn-secondary` | Rounded 12dp, navy surface, border, cyan/amber accent | `WisdomSecondaryButton` |
| `.btn-open` | Compact pill (8dp px-3 py-1), cyan text, semi-translucent | `WisdomOpenButton` |
| `.card-modern` | Rounded 16dp, border 1dp, subtle top specular sheen | `WisdomModernCard` |
