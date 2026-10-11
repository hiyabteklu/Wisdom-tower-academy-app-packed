# Wisdom Tower Academy - Native App Fidelity Audit (honest version)

**Rewritten:** 2026-10-11. The earlier version of this file claimed "100% match" for most screens, "real" success stories and scholarships, and streak/goal chips. Those claims were false or are now out of date, so they were removed.

**Source of truth:** `website-reference/` (read-only copy of the website).
**How to read this table:** "Compared" means a person or agent read the native file next to the website source. It does NOT mean the screen was run. A green CI build only proves the code compiles. Nothing here counts as tested until the owner has tried it on a phone.

| Area | Native file(s) | State | Notes |
|---|---|---|---|
| Home | `ui/home/HomeScreen.kt` | Compared 2026-10-11, matches | Same 8 programs (names, paths, order), hero, buttons, "Welcome back" / "New here?" line, "Open Learning" card and the 6 "Other resources". The website's stats, "Want digital services instead?" and final call-to-action sections are hidden in the app on purpose. Cosmetic: "Other resources" heading is left-aligned (website: centred). Not checked: Remedial cover picture. |
| Packages and package pages | `ui/packages/PackagesData.kt`, `PackageDetailScreen.kt`, `GpaCalculatorCard.kt` | Compared | Freshman and Remedial subject names, descriptions and order copied from the website data files; real counts; GPA calculator ported from the website. Open owner questions: the 12 package-card descriptions are shortened on purpose, and the 7 Remedial cover pictures are not in the app assets. |
| Learning | `ui/learning/LearningScreen.kt` | Compared | Invented chips (streak, goals, tested) and fake progress removed. Courses follow the website's rule for the student's academic level. Hub "Unlock" vs "Open" is drawn by the website page inside the WebView (needs a phone test). |
| Account and profile | `ui/account/AccountScreen.kt`, `data/auth/*` | Compared | Option lists and avatar preset ids copied from the website; invented enrollment card removed; profile saved to the same Supabase `profiles` row. Avatar on the native card is still a generic icon. Needs phone test. |
| Settings | `ui/settings/SettingsScreen.kt` | Compared 2026-10-11, close | Six sections, titles, subtitles, labels and options match; saving and password change call the real server. Gaps: several helper texts and placeholders from the website are missing; minute buttons read "15m" (website "15 min/day"); signed-out name "Guest Scholar" is invented (website sends signed-out users to login); avatar is a generic icon; sync message only claims the profile is synced (more honest than the website text). |
| Sign-in and sign-up | `ui/auth/NativeSignInScreen.kt`, `data/auth/SupabaseAuthClient.kt` | Written, compiles, NOT confirmed on a phone | Copy of the website login page design and texts. The old website pop-up is still the fallback when a web page redirects to `/login`. |
| Success Stories and Scholarships | `ui/guides/FreeResourcesLive.kt`, `GuidesScreen.kt` | Fixed | The old names, quotes and scholarships were invented (owner confirmed) and are gone. The tabs now show only items published in the admin panel (Supabase `free_resource_items`). Not done: item photos, scholarship subtitle, "Suggest a scholarship" button. |
| Universities and Departments | `ui/guides/GuidesData.kt`, `assets/data/*.json` | Not compared line by line | Bundled files look the right size against the website data; counts and wording were not checked. |
| Study Techniques and Campus Life | `GuidesScreen.kt` | Not re-checked | The old claim "word for word" was never verified in this audit. |
| Menu drawer (About, Contact, FAQ, Privacy, Terms) | `DrawerScreens.kt` | Not re-checked | The old claim of "100% match" is unverified. Compare each with its website page before trusting it. |
| Study workspace | `ui/study/StudyWorkspaceScreen.kt` | Cleaned | Invented tracker, score log and activity list removed. |
| Notifications | `NotificationRepository.kt` | Cleaned | No invented welcome message. No screen shows loading or error states yet. |
| Offline behaviour | `OfflineVault.kt`, `WebCacheVault.kt` | Not verified | Never tested offline on a phone. |

## Still to check, in order

1. Owner phone test (`HANDOFF.md` section 9), then fix what fails.
2. Universities and Departments data against `website-reference/src/data/`.
3. Study Techniques, Campus Life and the menu drawer texts against their website pages.
4. Settings helper texts and the "Guest Scholar" label (small, one file).
5. Item counts on hub cards, and any native Progress Tracker (needs the real Supabase `academic_results` data first; ask the owner).
