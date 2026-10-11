# EDITING LARGE FILES: read this before you say "I can't push this file"

> Owner rule (2026-10-11): an agent must NEVER stop at "the file is too big for my tools". There is a tested method. Use it.

## What the real limit is
There is no file-size limit on the repo. The chat/GitHub tools can only REPLACE a whole file (no line edit, no append). For a small file that is fine. For a huge file (`MainActivity.kt` is about 245 KB, `STATUS.md` about 38 KB) retyping everything costs a huge amount of output and one typo can break the build. So big files are edited with a **patch script** that a GitHub Action runs, not by retyping.

## Which method
| File | Method |
|---|---|
| Small or medium (up to about 30 KB, e.g. `HomeScreen.kt`, `PackagesData.kt`, `build.gradle.kts`) | Resend the whole file with `push_files` / `create_or_update_file`. Copy it exactly, change only what is needed. |
| Big (`MainActivity.kt`, `STATUS.md`, anything that does not fit comfortably) | **Patch script** (steps below). |
| `.github/workflows/*` | The chat tool gets 403. Give the owner the text; the owner pastes it on the GitHub web page (see `docs/APPLY_PATCHES_WORKFLOW.md`). |
| `STATUS.md` cannot be appended | Write a new `docs/SESSION_*.md` entry, or use a patch script that appends text to `STATUS.md`. |

## Patch-script method, step by step
1. **Read the big file.** `get_file_contents` may answer "too large, stored at /mnt/user-data/tool_results/...json". Then in the bash tool: `d=json.load(open(path)); open('/home/claude/File.kt','w').write(d[1]['text'])` (the second item holds the file text). Use `grep -n` and `sed -n A,Bp` to read only the part you need.
2. **Write a Python script** in `scripts/<what_it_does>.py` that edits the file by EXACT anchors (template below). Rules: each anchor must match exactly once, otherwise stop with an error and change nothing; the script must be safe to run twice (check a marker first); only standard library; no secrets.
3. **Test it on a copy** in the bash tool (copy the file into the same relative path in a temp folder, run the script twice, look at the changed lines). Never push an untested script.
4. **Push the script** to `scripts/` on `main` (a small new file: always possible).
5. **Log it in `docs/PENDING_PATCHES.md`**: patch number (P5, P6...), what it fixes, cause, script name, suggested branch name, how to test. Add the same in your `docs/SESSION_*.md` log.
6. **Tell the owner in plain words**: GitHub > Actions > **Apply pending patches** > Run workflow > script name + a new branch name > wait for the build on that branch to go green > test on the phone > merge with a Pull request. (If the workflow file is not installed yet, `docs/APPLY_PATCHES_WORKFLOW.md` has the text to paste once.)
7. After the owner merges, mark the patch as applied in `docs/PENDING_PATCHES.md` (check with `grep` on the file in `main`, do not guess).

## Script template
```python
#!/usr/bin/env python3
"""What this patch does and why (one paragraph)."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
ANCHOR = "    exact line(s) copied from the file, with indentation\n"
MARK = "a short text that exists only after the patch"
ADD = "    the new line(s)\n"

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do"); sys.exit(0)
n = src.count(ANCHOR)
if n != 1:
    print(f"ERROR: anchor found {n} times (need exactly 1); file not changed"); sys.exit(1)
FILE.write_text(src.replace(ANCHOR, ANCHOR + ADD), encoding="utf-8")   # or ADD + ANCHOR, or a plain replacement
print("patched")
```
For several edits in one script, repeat the check-and-replace block per edit and write the file once at the end; if ANY anchor fails, change nothing.

## Existing scripts
- `scripts/apply_pending_patches.py`: P1 to P3 (hub opening, bell, refresh). Already applied in `main` (verified 2026-10-11 by grep).
- `scripts/patch_ece_root_route.py`: P5, ECE root path opens the native ECE screen (not yet applied when written).
- `scripts/restore_mainactivity.py`: run by the build, keeps a valid `MainActivity.kt` on disk.

## Longer term
The owner chose to split `MainActivity.kt` into several files (plan in `docs/PENDING_PATCHES.md` section B: JS constants to `WebScripts.kt`, bottom nav and dialogs to `ShellComponents.kt`, then cut `MainScreen`). Splitting is also done with patch scripts, one step per commit with a green build in between.
