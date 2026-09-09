# CalcThis — Working Rules

Read and apply at the start of every CalcThis session, no exceptions.

---

## Behavior

* NO narration when coding. Silent execution. Text ONLY for a question or decision needing input.
* Concise, short, tight bullets. Copy-paste-ready commands.
* CONFIRM before adding anything not explicitly asked.
* Own mistakes plainly. No deflection.

---

## Session Start — MANDATORY (VIOLATION if skipped)

Before ANY work, read these files from disk and confirm they are loaded:

1. `assets/style.css`
2. `assets/app.js`
3. `partials/header.html`
4. `partials/footer.html`
5. `build.js`
6. One existing working calculator page (structure reference)

**If any file is missing or unreadable — STOP. Report the issue immediately. Proceeding without them is a SERIOUS VIOLATION.**

If there is ANY additional file needed to make the build 100% accurate, read it. Not reading it is a SERIOUS VIOLATION.

These files are the single source of truth. Never guess class names. Never guess CSS variables. Never guess structure. Always read from the actual files.

---

## New Page Builds

Read `calcthis-new-page-checklist.md` before writing any code.
It contains every class name, structure pattern, and the exact preview build script.

## Previews — DEFAULT: served, not a file

At the end of every build, deliver the preview BOTH ways:

1. **In the browser pane here** — `preview_start` with `name: "calcthis-static"` (from `.claude/launch.json`,
   runs `python -m http.server 8123` at repo root), then `navigate` the pane to
   `http://localhost:8123/<slug>/` and confirm it renders + the calculator works.
2. **Chrome links for the user**, in the final message:
   * Same PC: `http://localhost:8123/<slug>/`
   * Same Wi-Fi (other device): `http://<LAN-IP>:8123/<slug>/` — get the IP with `ipconfig | grep IPv4`.
   * Note the server only lives while the session does; a firewall prompt may need allowing Python.
* The served page renders fully BEFORE `node build.js` (header/footer already inline; build.js only stamps
  `class="current"` + bumps the asset version). No inlining, no file to download.
* Deliverables: new calc page (+ the homepage when it changed).
* RULE #1: never deliver/ship before a full styled preview is approved.

### Fallback only — self-contained HTML file

Use the Python inline script from the checklist skill ONLY if the local server can't run
(no Python, port taken, etc.). If a preview is ever functional-only (no real CSS), SAY SO — never let the user guess.
Inline rules for that fallback: header/footer HTML inline between the markers · favicon `/assets/...` -> `https://calcthis.co/assets/...` ·
`<link ... style.css?v=N>` -> `<style>{css}</style>` (AS-IS, no dedent) · strip the AdSense `pagead2` script (JS-blocks on file://) ·
`app.js?v=N` -> `<script>{app_js}</script>` (before the page script) · remove `feedback.js`.

## Deploy — gated on an explicit go-ahead

* `git push` to `main` IS the live deploy (host auto-builds from main).
* NEVER run `node build.js` + commit + push until the user has previewed in their own
  Chrome AND explicitly said "deploy" / "push" / "ship it". Preview "looks good" ≠ deploy.
* On the go-ahead: `node build.js` (version +1, all pages ✓, no warnings) → commit
  (descriptive message) → push to main.
* After the push: update `CLAUDE.md` + nav / footer / roadmap skill files.

## SEO — URL Slugs
* Slugs MUST contain the full target keyword, no exceptions.
* Never shorten a slug for brevity — crawlers can't rank what isn't in the URL.
* Before writing any slug, check: does it contain every word a user would search?
* ✅ /zone-2-heart-rate-calculator/  ✗ /zone-2-calculator/
* ✅ /heart-rate-zone-calculator/    ✗ /hr-zone-calc/
* If a slug ships wrong: rename immediately while the URL has no crawl history.
  A page live > 24 hrs needs a 301 redirect added to _redirects alongside the rename.
