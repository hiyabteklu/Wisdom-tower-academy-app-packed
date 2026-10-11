# Generic "Apply pending patches" workflow (owner pastes this once)

The chat tool cannot write files under `.github/workflows/`, so the owner replaces
`.github/workflows/apply-pending-patches.yml` with the text below ONE TIME. After that any agent only has to
push a script into `scripts/`, and the owner taps **Actions > Apply pending patches > Run workflow**, types the
script name and a new branch name, waits for the build on that branch, tests, then merges with a Pull request.

Difference to the old file: the script name and the branch name are typed in when you run it (before they were
fixed to `apply_pending_patches.py` and `fix/nav-bell-refresh`).

```yaml
name: Apply pending patches
on:
  workflow_dispatch:
    inputs:
      script:
        description: "File name inside scripts/ (example: patch_guides_screen.py)"
        required: true
        default: "patch_guides_screen.py"
      branch:
        description: "New branch name (example: fix/guides-screen)"
        required: true
        default: "fix/guides-screen"
permissions:
  contents: write
jobs:
  patch:
    runs-on: ubuntu-latest
    env:
      SCRIPT: ${{ inputs.script }}
      BRANCH: ${{ inputs.branch }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main
      - run: python3 "scripts/$SCRIPT"
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git checkout -b "$BRANCH"
          git add -A
          git commit -m "Patch $SCRIPT"
          git push --force origin "$BRANCH"
```

Order matters: the workflow starts from `main`. The earlier branch `fix/nav-bell-refresh` (navigation, bell, refresh)
is NOT in `main` yet, so merge that Pull request FIRST, then run this one, otherwise the two branches both change
different files and still merge fine, but you would test them separately.
