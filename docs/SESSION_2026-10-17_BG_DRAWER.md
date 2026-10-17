# SESSION 2026-10-17 BG_DRAWER (continues docs/SESSION_2026-10-17_BG_FEEDBACK_1.md, problem 4 drawer)

Script written and tested on a copy of MainActivity.kt (3 edits, safe to run twice). NOT RUN yet, NOT compiled, NOT seen on a phone.

- Cause (code read): the drawer panel in `MainActivity.kt` is a custom Box with a gradient `Color(0x66152238) -> Color(0x660D1829)` (40 percent), under a dim of `0x66030812`. It is not a Material pop-up, so Theme.kt did not reach it.
- `scripts/patch_backdrop_readability.py` (2204f82d): drawer gradient to 85 percent (0xD9), dim behind it to 55 percent (0x8C), bottom nav glass track white 6 to 9 percent. Marker BG-READ.
- OWNER STEP: Actions > Apply pending patches > script `patch_backdrop_readability.py`. Then Claude checks the branch and opens the PR when the build is green.
- Glass strengths now in step: web 8 percent, card tokens 52 percent, nav 9 percent, pop-ups 82 / 75 percent, drawer 85 percent.

STILL OPEN: S-LOADING (black while loading, flat Packages loading panel).
