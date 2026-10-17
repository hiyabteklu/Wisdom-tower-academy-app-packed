# Session: background on every screen

Owner request: the chosen background (Dark, BG 1-3, Blue) must show on every screen, no exceptions.

Cause: many screens paint their own solid navy (`.background(WisdomNavy)`, `Color(0xFF060B15)`) on top of the app backdrop, and the WebViews force `#060B15`.

Fix: `scripts/patch_backdrop_everywhere.py` (idempotent) swaps those fills for `Modifier.appBackdrop()` in MainActivity.kt, Theme.kt and WisdomTabLayer.kt, and makes WebViews and injected website CSS transparent.

Not changed on purpose: the first cold-start splash loader stays solid.

Run: Actions > Apply pending patches > script `patch_backdrop_everywhere.py`, branch `claude/backdrop-everywhere-apply`.
Not built or run by the author. Website pages with their own opaque panels may still hide the backdrop in places.
