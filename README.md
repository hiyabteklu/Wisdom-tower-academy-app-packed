# Wisdom Tower Academy — Android App

> **AI agents: read [HANDOFF.md](HANDOFF.md) FIRST.** It has the plan, what is done, what is left, and the owner's decisions. Update it before you stop.

Android app for [Wisdom Tower Academy](https://www.wisdom-tower-academy.live). Native Compose screens beside a WebView shell, using the same Supabase / Appwrite backend as the website.

Then read [NATIVE_APP_BRIEF.md](NATIVE_APP_BRIEF.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

## What this app is

- Native Compose screens (Home, Packages, Learning, Account, Settings, Guides) plus a WebView host for learning content
- Fixed top bar: menu · "Wisdom Tower Academy" · notifications
- Notification bell opens **`/notifications` only** (not Settings / Account)
- Clean status-bar area (no overlap with clock/battery)
- Bottom nav: see `HANDOFF.md` section 5 (S9, tab count open)
- Offline PDF vault + FLAG_SECURE
- Built by GitHub Actions

## Build locally

```bash
./gradlew assembleDebug
```

## Build via GitHub Actions

Push to `main` **or** run the workflow from the **Actions** tab (see `.github/workflows/`), open the successful run, and download the artifact.

Website content updates appear in the app automatically. Only native chrome / offline vault changes need a new APK.
