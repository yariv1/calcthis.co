# CalcThis — Working Rules

Read and apply at the start of every CalcThis session, no exceptions.

\---

## Behavior

* NO narration when coding. Silent execution. Text ONLY for a question or decision needing input.
* Concise, short, tight bullets. Copy-paste-ready commands.
* CONFIRM before adding anything not explicitly asked.
* Own mistakes plainly. No deflection.

\---

## Session Start — MANDATORY (VIOLATION if skipped)

Before ANY work, confirm these 6 files are uploaded and in session:

1. `assets/style.css`
2. `assets/app.js`
3. `partials/header.html`
4. `partials/footer.html`
5. `build.js`
6. One existing working calculator page

**If any file is missing — STOP. Ask for it immediately. Proceeding without them is a SERIOUS VIOLATION.**

If there is ANY additional file needed to make the build 100% accurate, asking for it is mandatory. Not asking is a SERIOUS VIOLATION.

These files are the single source of truth. Never guess class names. Never guess CSS variables. Never guess structure. Always read from the actual files.

Note: if style.css or app.js ever "changed" it's because WE changed them here — we are the developer. There is no external drift. Whatever we ship is the source of truth.

\---

## New Page Builds

Read `calcthis-new-page-checklist` before writing any code.
It contains every class name, structure pattern, and the exact preview build script.

## Previews

* Preview = standalone self-contained HTML file (CSS + app.js inlined, fonts from Google CDN).
* Deliverables: new calc page preview (+ homepage preview when the homepage changed).
* Both delivered via `present\_files`.
* ALWAYS tell the user when a preview is functional-only (no real CSS) — never let them guess.
* RULE #1: never deliver/ship before a full styled HTML preview is approved.
* Run the exact Python preview script from the checklist skill — never improvise it.

## Preview Builder Rules

* Replace `<!--HEADER:START-->...<!--HEADER:END-->` with real header HTML inline
* Replace `<!--FOOTER:START-->...<!--FOOTER:END-->` with real footer HTML inline
* Fix favicon/asset paths: `/assets/favicon.svg` -> `https://calcthis.co/assets/favicon.svg`
* Replace `<link rel="stylesheet" href="/assets/style.css?v=N">` with `<style>{css}</style>` — inline style.css AS-IS, no dedent, no transformation
* Strip AdSense `<script async src="https://pagead2...">` — it JS-blocks on file:// and breaks the page
* Replace `<script src="/assets/app.js?v=N"></script>` with `<script>{app\_js}</script>` (keep order: app.js before page script)
* Remove `<script src="/feedback.js" defer></script>`

## Deploy

* Zip as `calcthis-vN.zip` (N = `.assetver` + 1), present for download
* CC prompt always includes commit message and push to main
* Update nav + footer skill files after every new calculator added


## SEO — URL Slugs
* \- Slugs MUST contain the full target keyword, no exceptions.
* \- Never shorten a slug for brevity — crawlers can't rank what isn't in the URL.
* \- Before writing any slug, check: does it contain every word a user would search?
* \- ✅ /zone-2-heart-rate-calculator/  ✗ /zone-2-calculator/
* \- ✅ /heart-rate-zone-calculator/    ✗ /hr-zone-calc/
* \- If a slug ships wrong: rename immediately while the URL has no crawl history.
* &#x20; A page live > 24 hrs needs a 301 redirect added to \_redirects alongside the rename.

