# Open Questions & Clarifications Log

This file tracks questions or items requiring user confirmation regarding the native Android app migration from `website-reference/`.

## Status: No Blocking Questions
All items requested have been resolved directly using the source files in `website-reference/`:
- **Screen 1 (Packages)**: Headings, groups, and cards extracted from `src/data/packages.ts` and `src/components/PackagesCatalog.tsx`.
- **Screen 2 (Account)**: Schema, fields, and 3-step verification extracted from `src/components/account/ProfileCompletionPanel.tsx` and `src/app/account/page.tsx`.
- **Screen 3 (Settings)**: 6 sections, sound controls, font preview, and cloud sync extracted from `src/app/settings/page.tsx`.
- **Screen 4 (Learning)**: Header metrics, folio format, 8 study tool tiles, and curriculum cards extracted from `src/app/learning/LearningContent.tsx`.
- **Screen 5 (Guides)**: Full 45 universities extracted from `src/data/universities.ts` and JSON files; 26 departments extracted from `src/data/departments.ts`; Study Techniques and Campus Life extracted from `src/components/academy/`.
- **Screen 6 (Menu Drawer)**: Native pages for About, Contact form, FAQ, Privacy Policy, Terms of Service, and Notification Settings extracted from `src/app/about`, `src/app/contact`, `src/app/privacy`, `src/app/terms`.
- **Screen 7 (Link Audit)**: All deep-links mapped to existing Next.js routes or intercepted directly to native screens to prevent 404s.
- **Screen 8 (Offline Storage)**: Assets bundled in `assets/data/` and cached via `OfflineVault` and `WebCacheVault`.
