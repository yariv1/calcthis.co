# CalcThis — Deploy Checklist

Run through this before committing any build. No exceptions.

- [ ] New folder + `index.html` created
- [ ] `build.js` PAGES array entry added `{ file: 'SLUG/index.html', slug: '/SLUG/' }`
- [ ] `partials/header.html` nav link added (correct column)
- [ ] `partials/footer.html` link added (correct pillar)
- [ ] Homepage `index.html` — calc card + JSON-LD `hasPart` entry + prose count bumped
- [ ] `sitemap.xml` — new `<url>` entry added
- [ ] `node build.js` — asset version bumps +1, all pages ✓, no warnings
- [ ] No leftover temp files in repo
- [ ] Preview approved by user
- [ ] Commit with descriptive message, push to main
- [ ] `CLAUDE.md` updated (version, new calc/article logged)
- [ ] Nav + footer skill files updated to reflect new calculator
