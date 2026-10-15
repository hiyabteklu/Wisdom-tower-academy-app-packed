#!/usr/bin/env python3
"""Appends the missing session-log lines (AU to R3-F) to the END of docs/COMPETITION_STATUS.md.
The board is too big to resend, so it is patched by script (HANDOFF rule 10). Appends only; safe to run twice."""
import sys
from pathlib import Path

FILE = Path("docs/COMPETITION_STATUS.md")
MARK = "session R3-F, board catch-up"

ADD = """- 2026-10-15 | Claude (chat, session R3-F, board catch-up) | The lines below were missing from this board (it stopped at session AT). They are written from the session files, NOT from memory; open the named file for details. Sessions with a file I did NOT summarize here: AU, AV, AW, AX, AY (Notifications v2 plan, app reads content R4, reader R5, database attempts, website routes R2; failed attempts table F1 to F5 in `docs/SESSION_2026-10-15_AY.md`), C9 (`docs/SESSION_2026-10-15_C9_security_check.md`, `docs/SESSION_2026-10-15_C9_leaderboard_fix.md`), C10-A to C10-D (`docs/SESSION_2026-10-15_C10_A.md` to `_D.md`; website admin flags commits `629567b` and `343f9a8`; R6 patch script written in C10-D). Live progress of Notifications v2 is in `docs/NOTIFICATIONS_V2_PLAN.md` section 8.
- 2026-10-15 | Claude (chat, session C10-E) | Notifications v2 R1 TESTED and APPLIED live: 19 of 19 rolled-back checks passed, then applied as migration `notifications_v2` (3 new columns on `scheduled_notifications`, 9 new functions, RLS on `notification_audiences`, no test rows left). A real send was NOT done. `docs/SESSION_2026-10-15_C10_E.md`.
- 2026-10-15 | Claude (chat, sessions R3-A to R3-E) | Website admin composer v2 written in the WEBSITE repo: path selector (`f6fe5cd`), block editor and gold preview (`c41934b`), composer shell (`394e5d8`), audience chips (`1ec5a0c`), schedule v2 and edit (`42ba977`); R2 routes `601db0a`. Per owner screenshots all are Ready on Vercel and app CI #464 to #473 are green. `[~]` never opened in a browser, no v2 row ever scheduled or sent. `docs/SESSION_2026-10-15_R3_A.md` to `_E.md`.
- 2026-10-15 | Claude (chat, session R3-F, board catch-up) | R6 patch (`/notifications?open=<id>` opens the reader) was APPLIED: bot commit `5e4fe00`, merged as PR #28 (`1598b13`); commit stats read, only `MainActivity.kt` +17 -1, diff not read, CI result NOT seen. Also corrected an accidental overwrite of `docs/NOTIFICATIONS_V2_PLAN.md` (restored in `c7c3731`). Next, in order: the owner reports the CI of the R6 merge; schedules one notice for 2 minutes ahead to a group that reaches only himself; R7 real-send test to his own user (needs his user id and OK); R8 cleanup; C9 and C10 remaining items. `docs/SESSION_2026-10-15_R3_F.md`.
"""

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do"); sys.exit(0)
if not src.endswith("\n"):
    src += "\n"
FILE.write_text(src + ADD, encoding="utf-8")
print("patched")
