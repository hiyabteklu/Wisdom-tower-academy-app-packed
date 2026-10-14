# Handoff: "Other resources" iOS redesign shows NO visible change in the app

Date: 2026-10-14
Repo: hiyabteklu/Wisdom-tower-academy-app-packed (PUBLIC: no secrets, no personal data in this file)
Branch with the work: `ui/other-resources-ios` (5 commits after main `374b6c4`, NOT merged)
Session log on the branch: `docs/SESSION_2026-10-14_resources_ios.md`

## Problem (owner report)
The owner installed an app build and sees NO difference in the Other resources section. "Something has to be gone wrong."

## What the owner asked for (unchanged)
- iOS-like feel: pill buttons, soft touch, the login/sign-up expand and retract motion. The second screenshot of the phone control centre is only the reference for how round the buttons should be, NOT the colour palette.
- Other resources: bigger fonts, heavy titles and subtitles, native icons as bullets and section markers, another level of animation, transition and expansion, better colouring, "amazing to read".
- The owner wants to SEE it working in the app.

## What is known (facts)
1. The code is pushed on branch `ui/other-resources-ios`: `FreeResourcesStateCard.kt`, `GuidesScreen.kt`, `WisdomComponents.kt`, `HomeScreen.kt`, plus the session log. Per the log it was pushed 2026-10-13 23:23 to 23:28 UTC.
2. Per the log, the branch was NEVER compiled by CI and NEVER run on a device. The code was only read, not built.
3. The owner's screenshot of the app Home (taken 2026-10-14, file name `Screenshot_20261014-021410`, phone clock 2:12) shows the OLD design: small titles, small arrows, "Department s Guide" and "Scholarship s Guide" wrapping badly, no big tinted tiles, and the bottom Home/Learning/Packages bar.
4. The branch is not merged to `main`, and no pull request is confirmed.

## Hypotheses (NOT verified, in order of likelihood)
H1. The installed APK was built from `main` (or an older commit), not from `ui/other-resources-ios`. The CI workflow "Build Production AAB & APK" builds whatever branch is chosen in "Run workflow"; if it ran on `main`, or was never run, the old design is expected.
H2. Timing: the screenshot was taken at about 02:14 phone time. If the phone is on East Africa Time (UTC+3, the control-centre screenshot shows Ethio telecom), that is about 23:14 UTC on 2026-10-13, which is BEFORE the commits were pushed (23:23 to 23:28 UTC). So that screenshot may simply predate the work. Verify the phone timezone and when the installed build was made.
H3. The new APK did not replace the old app (install failed, or an older artifact was installed, or a lower version code was refused).
H4. The CI run on the branch failed (red) because the code was never compiled (for example an unresolved icon such as `Bedtime`, `Bolt`, `Groups`, `ThumbUp`, `Work`, `WbSunny`, `Book`), so no new APK exists and the owner kept using the old one.
H5. Home or the guide pages render through a different path than the edited files (an older route, a cached or WebView screen, or a different composable). Not checked.

## Not yet done / what the next agent must do FIRST
1. Do not write more UI code before answering this: which commit is the installed APK built from?
2. Check GitHub Actions for runs of "Build Production AAB & APK": which branch, which commit SHA, green or red, and when. Read the red lines if any.
3. If no green run exists on `ui/other-resources-ios`: run it on that branch (owner step: Actions > Build Production AAB & APK > Run workflow > choose branch `ui/other-resources-ios` > Run), and fix any compile error first.
4. If a green run exists: confirm the installed build is that artifact (`Wisdom-tower-academy-APK`) and its version code is not lower than the installed one; owner may need to uninstall first (ask before suggesting data loss).
5. If the new APK is installed and still shows the old design: trace the route from Home to `HomeScreen.kt` and from a tile to `GuidesScreen.kt` (H5).
6. Only after the owner SEES the change on the phone: merge, then consider other screens (still on old text sizes).

## Rules from the project (keep)
- G4: every sentence on the guide pages stays exactly as in the current file; only look, sizes, icons and motion change.
- G1: forbidden files untouched (`.env.example`, Gradle, workflows, manifest, `MainActivity.kt`).
- Repo is public: no secrets, no personal data.

## Honest status
Code written: yes. Compiled: no. Seen on a device: no. Cause of "no difference": unknown; H1 and H2 are the first things to check.
