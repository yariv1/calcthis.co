# CalcThis — Deploy Checklist

Run through this before delivering any build. No exceptions.

- [ ] New folder + `index.html` created
- [ ] `build.js` PAGES array entry added `{ file: 'SLUG/index.html', slug: '/SLUG/' }`
- [ ] `partials/header.html` nav link added (correct column)
- [ ] `partials/footer.html` link added (correct pillar)
- [ ] Homepage `index.html` — calc card + JSON-LD `hasPart` entry + prose count bumped
- [ ] `sitemap.xml` — new `<url>` entry added
- [ ] `node build.js` — asset version bumps +1, all pages ✓, no warnings
- [ ] No leftover `DEPLOY_*.txt` files in repo
- [ ] Zip as `calcthis-vN.zip`, presented for download, CC prompt provided
- [ ] CC prompt includes commit message + push to main
- [ ] nav + footer skill files updated to reflect new calculator
