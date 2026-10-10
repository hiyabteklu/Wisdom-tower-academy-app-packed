# Native Android App Migration & Fidelity Progress Log

Last Updated: 2026-10-10

## Overview & Execution Plan

We have aligned the native Android app with the official website reference (`website-reference/`).
Working screen-by-screen in exact order:

- [x] **Screen 1: Packages Tab** (`ui/packages/PackagesScreen.kt`, `PackagesData.kt`) [DONE]
  - Title: "Academy packages"
  - 3 Section headings: "Grades 9–12", "Other branches", "Special packages"
  - Cards: 16:9 aspect ratio image, package name, "Start Learning" button with MenuBook icon
  - Removed: search box, filter chips, descriptions on cards, "Explore" button

- [x] **Screen 2: Account Screen** (`ui/account/AccountScreen.kt`) [DONE]
  - Redirect guest to `/login` (show sign-in CTA matching website)
  - Display Digital Student ID Card (`StudentIdCard`) for signed-in users with golden crown if completed
  - Floating pill control bar (Folio + copy, Your status, Learning Hub, Preferences, Log Out)
  - Scholar Profile Verification panel with:
    - Completion gauge (0–100%) and verified crown badge
    - Step 1: Character Avatar & Legal Identity (presets + first/last name)
    - Step 2: Academic Curriculum, Track & Institution (education level, stream, school/university, region)
    - Step 3: Contact Phone & Target Exam (phone, target exam)
    - Save Profile Changes button saving to live state and SharedPreferences
  - Removed: "Student Command Center", "Active Course Access" fake passes, guest ID card

- [x] **Screen 3: Settings Screen** (`ui/settings/SettingsScreen.kt`) [DONE]
  - Header card with avatar, verified badge, academic level, "Edit Profile" and "Account" buttons
  - 6 In-place accordion sections matching website:
    1. Study Goals & Target Milestones (daily minutes, target exam, target score, preferred study window, Save Study Goals)
    2. Notifications & Study Alerts (daily study reminder, exam updates, weekly performance digest)
    3. Game Sound (sound effects toggle, volume slider with 50% reset)
    4. Reading & Display (compact/standard/large font sizes, typography sample preview)
    5. Offline Data & Cloud Sync (storage size, sync to cloud button)
    6. Security (change password form: new password, confirm, update password)

- [x] **Screen 4: Learning Screen** (`ui/learning/LearningScreen.kt`) [DONE]
  - Top header: user avatar initial, name, folio (`WTA-XXXX`), email, streak days (1d Streak), goal % (100% Goals), tested count (0 Tested)
  - Guest scholar banner with Sign In & Create Account CTAs if signed out
  - 8 Study Tools tiles: Timer, Planner, Targets, Notebook, Calculator, AI Tutor, Your status, Courses
  - Curriculum section: enrolled courses cards with 16:9 images, course titles, and "Start Learning" buttons

- [x] **Screen 5: Static Guides & Editorial** (`ui/guides/GuidesScreen.kt`, `GuidesData.kt`) [DONE]
  - Word-for-word copy from `website-reference` with no shortened or invented placeholder texts:
    - **Study Techniques**: Header, "Why the usual routine disappoints", 01 Active Recall, 02 Spacing Your Review, 03 Practice Testing, 04 Mixing Related Topics, 4 Everyday Habits (Blurting, Plain Language, Notes into Cues, Protected Focus Blocks), and 5 What to Drop Immediately traps.
    - **Campus Life Field Guide**: Header, 01 Friends & Social Life, 02 Energy & Pressure Management, 03 Lectures & Classroom Time (with 15-Minute Same-Day Payoff), 04 Places, Study Groups & Faculty, and 6 Simple Weekly Reflection Checks.
    - **Universities Directory**: All 45 Ethiopian Universities loaded from `assets/data/universities.json` with search, region filter chips, campuses, elevation, distance from Addis, strengths, what to expect on campus, and official web links.
    - **Department Field Guides**: All 26 Undergraduate Departments loaded from `assets/data/departments.json` with categories, duration, about, core courses, careers, job market reality, pros, and cons.
    - **Success Stories**: Real students (Kalkidan Mengistu, Bereket Tesfaye, Selamawit Girma, Natnael Tadesse, Meron Hailu) with achievement badges, quote cards, and expandable details.
    - **Scholarships**: Real opportunities (Mastercard Foundation, Ethiopian MoE Excellence Grant, DAAD, Türkiye Bursları) with deadline badges, eligibility notes, and official links.

- [x] **Screen 6: Menu Drawer** (`ui/drawer/DrawerScreens.kt`, `MainActivity.kt`) [DONE]
  - Dedicated native Compose screens matching website text:
    - **About Academy**: Vision, 4 Pedagogical Pillars, 4-tier Academic Continuum, and impact metrics.
    - **Contact & Support**: Real native form with Full Name, Email, Topic dropdown, Message multiline text field, and submission state.
    - **FAQ**: Real expandable questions covering offline caching, curriculum alignment, 6 learning hubs, Ethiopian GPA scale, and payment verification.
    - **Privacy Policy**: Full institutional privacy policy charter, 4 academic privacy guarantees, and data stewardship sections.
    - **Terms of Service**: Full terms of service & academic agreement with core academic compact.
    - **Notification Settings**: Dedicated native settings modal dialog controlling study reminders, timers, and alerts.

- [x] **Screen 7: Link Audit & 404 Prevention** (`MainActivity.kt`) [DONE]
  - Built `handleGlobalNav` unified router intercepting all deep-links:
    - Checks for `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/scholarships`, `/study-techniques`, `/campus-life`, `/universities`, `/departments`, `/success-stories`, and routes directly to their native screens.
    - Zero navigation to broken paths or "Page Not Found".

- [x] **Screen 8: Offline Storage & Cache Verification** (`OfflineVault.kt`, `WebCacheVault.kt`) [DONE]
  - Bundled `universities.json`, `departments.json`, `free_resources_snapshot.json` in `app/src/main/assets/data/`.
  - Offline vault and web cache intercepts guarantee full navigation across tabs, guides, and learning hubs without internet.

- [x] **Audit Documentation Rewrite** (`docs/FIDELITY_AUDIT.md`) [DONE]
  - Rewritten with genuine, transparent fidelity audit scores.
