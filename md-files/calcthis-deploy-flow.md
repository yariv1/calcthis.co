# CalcThis — Deploy Flow

Follow this at the end of every session, no exceptions.

---

## Steps

1. Serve the preview (`calcthis-static` :8123) — verify it in the browser pane, give the user
   the localhost + LAN Chrome links.
2. **WAIT.** The user previews it themselves in Chrome. Do nothing until they explicitly say
   "deploy" / "push" / "ship it". "Looks good" on the pane is NOT that — they want to open it
   in their own browser first.
3. Only after the explicit go-ahead: `node build.js` (asset version bumps, all pages ✓, no
   warnings) → commit all changes with a descriptive message → push to `main`.
4. Update `CLAUDE.md` — bump version, log what shipped.

⚠️ `git push` to `main` IS the deploy (host auto-builds from main). Never push until step 2 is done.

---

## Commit message format

```
[type]: [descriptive message]
```

Examples:
- `New calculator: BMI Calculator`
- `Blog article: How to Calculate Your Body Fat Percentage`
- `Fix: BMI calculator mobile layout`

---

## Notes

- All file changes happen in place — no zip files, no extraction steps.
- Asset version is tracked in `.assetver` and bumped by `build.js`.
- Commit message should clearly describe what changed this session.
- After every new calculator or article: verify nav + footer skill files are current.
