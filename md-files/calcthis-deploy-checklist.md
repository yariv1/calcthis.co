# CalcThis — Deploy Checklist

Run through this before committing any build. No exceptions.

- [ ] New folder + `index.html` created
- [ ] `build.js` PAGES array entry added `{ file: 'SLUG/index.html', slug: '/SLUG/' }`
- [ ] `partials/header.html` nav link added (correct column)
- [ ] `partials/footer.html` link added (correct pillar)
- [ ] Homepage `index.html` — calc card + JSON-LD `hasPart` entry + prose count bumped
- [ ] `sitemap.xml` — new `<url>` entry added
- [ ] No leftover temp files in repo
- [ ] Preview served (`calcthis-static` :8123), verified in pane, Chrome links given to user
- [ ] **User previewed in their own Chrome and explicitly said "deploy" / "push"** (not just "looks good")
- [ ] `node build.js` — asset version bumps +1, all pages ✓, no warnings
- [ ] Commit with descriptive message, push to main  ← this is the live deploy
- [ ] `CLAUDE.md` updated (version, new calc/article logged)
- [ ] Nav + footer skill files updated to reflect new calculator
