# CalcThis — Deploy Flow

Follow this at the end of every session, no exceptions.

---

## Steps

1. Run `node build.js` — confirm asset version bumps, all pages ✓, no warnings.
2. Present preview file(s) for user approval.
3. After approval: commit all changes with a descriptive message, push to `main`.
4. Update `CLAUDE.md` — bump version, log what shipped.

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
