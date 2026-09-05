# CalcThis — Deploy Flow

Follow this at the end of every session, no exceptions.

---

## Steps
1. Deliver all file changes as a zip named `calcthis-vN.zip` (N = new asset version = `.assetver` + 1).
2. Present the zip for download via present_files.
3. Provide a Claude Code prompt that:
   - References `~/Downloads/calcthis-vN.zip`
   - Extracts to the repo root (overwrite existing files)
   - Commits with a descriptive message
   - Pushes to `main`

---

## Claude Code Prompt Template
```
Unzip ~/Downloads/calcthis-vN.zip into the repo root (overwrite existing files), then commit all changes with the message "[descriptive message]" and push to main.
```

---

## Notes
- Always increment N from the last known asset version (tracked in `.assetver`).
- The zip contains only changed/new files, not the entire repo.
- Commit message should clearly describe what changed this session.
- Deploy zip is updated after ANY fix and re-delivered alongside the previews.
