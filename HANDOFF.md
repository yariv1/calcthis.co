# SESSION HANDOFF — read this FIRST, then CLAUDE.md hard rules

_Written 2026-10-05 at the end of the Fraction / Standard Deviation / Paint-research session.
The next session must start fully synced from this file + CLAUDE.md + the memory files. Do NOT
make the user re-explain anything in here._

## 1. Exactly where we are

- **Live site:** asset **v139**, **44 calculators**, **25 blog articles**, **77 pages**. `main` clean and pushed.
- **Last calculators shipped:** #21 Standard Deviation (v137), **#22 Paint (v139)**. All article-less on purpose (§3).
- **Next:** #23 Wallpaper (same area engine as Paint/Square Footage). Start with the Rule 8 research
  report (open every competitor live, list every input, visual AND functional differentiator), wait for approval.

## 2. What to do first in the next session

1. Reply in 2-3 lines: synced, v139 / 44 calcs, Wallpaper next.
2. Research Wallpaper per Rule 8, deliver a short report, wait for approval before any code.
3. Build → preview via the served site → deploy only on the user's explicit "deploy".

## 3. What matters NOW vs what does NOT

**Matters now (user priorities):**
- **Many calculators, fast** — "we need lots of them." SEO traffic is the guiding light. Work down
  the ranked backlog in `md-files/calcthis-calculator-roadmap.md` rows #22-29.
- Every research report needs a **visual AND a functional differentiator** (user's verbatim words
  are in CLAUDE.md + workflow Rule 8). Functional = easier to reach/understand the result, handy
  extra functions. Don't skip or cut corners on it.
- Quality gates the user keeps catching: **Go advanced must open a real visible panel above the
  button**; **result visible on mobile while typing (sticky `.mbar`)**; **start EMPTY (no demo
  values)**; **field spacing** is now global (nothing to do, don't touch).

**Does NOT matter now (do not raise, do not do):**
- **Blog articles are DEFERRED** (user decision 2026-10-05). Never write, propose or ask about an
  article after a calculator ships. Calculators awaiting a future article batch: **Fraction,
  Standard Deviation**.
- Dark mode (parked). Pregnancy/Ovulation calculators (parked until AdSense approval — ask once
  if it landed, otherwise ignore). The grade/gpa per-row `.csel` retrofit (low priority).
- Letter Grade Calculator and Cooking Measurement Calculator are dropped. Don't revisit.

## 3. The user, and how to behave (this has cost real time/money when broken)

- **ZERO narration.** No "now doing X" text between tool calls. A Stop hook
  (`.claude/hooks/check-narration.cjs`, wired in the gitignored `.claude/settings.local.json`)
  blocks the turn and flags every violation; it fired constantly this session. Only allowed text:
  a genuine question, or the one-or-two-line final summary. If the hook feedback arrives, answer it
  with one short line ("Confirmed — hook caught …") and carry on.
- **Terse replies.** Short, precise, no long blocks. Tables only for the research report.
- **Never invent**: copy existing patterns/live pages exactly; ask if unclear. **Never guess**.
- **Deploy is gated**: build + commit + push ONLY after the user says "deploy"/"ship it".
  "Looks good" is not deploy. After deploy: update CLAUDE.md, roadmap md, memory, commit docs.
- The user previews at `http://localhost:8123/<slug>/` (same PC) and `http://10.0.0.19:8123/<slug>/`
  (Wi-Fi). If "preview doesn't work", the `calcthis-static` server was stopped → `preview_start`.
- The user judges by screenshots and catches visual bugs fast — measure/verify in the browser, on
  mobile too, before presenting. Reply to questions directly; answer "did you…?" with proof.

## 4. Paint Calculator — SHIPPED v139 (kept for reference; research + approved build)

Ahrefs: `paint calculator` >1K Medium · `exterior paint calculator` >100 Easy · `paint calculator
square feet` >100 Medium · `sherwin williams paint calculator` >100 Medium · `paint calculator
12x14 room` >100 · interior / for walls / exterior / ceiling variants >100 Medium. Pairs with #23
Wallpaper (>1K Easy) — both Construction, same area engine.

**Competitors opened live:** Omnicalculator, Sherwin-Williams (Quick / Custom / Deck modes), Behr
(Interior / Exterior / Wood stain / Floor coatings), PaintColorHQ. Findings:
- Omni: room L×W×H (or wall area), door & window h/w/count, coats, editable paint efficiency, many units; one volume out.
- Sherwin-Williams Custom: per-wall width×height (ft+in), "surface has peak", texture (smooth/medium/extra coarse),
  baseboard, crown molding, windows, doorways/openings, trim, add wall, add ceiling, Interior/Exterior; 1 coat, fixed 400 sq ft/gal.
- Behr: imperial/metric, room size L×W, door & window counts, extras (touch-up, vaulted ceiling); output gallons+quarts per coat split walls/trims/doors/ceiling.
- PaintColorHQ: L, W, height, coats 1-3, doors, windows; 350 sq ft/gal; supplies checklist.
- **Nobody has any visual, a real buy-list with leftover/cost, multi-room totals, primer, or per-surface coats/coverage.**

**Built as approved (+ user fixes: room name label above its row, no invented "Walls" label, grey sub-text, paired fields side by side on mobile):**
- **Visual:** live room diagram — four walls laid flat + ceiling, doors/windows drawn and subtracted,
  per-wall areas, colour-coded by surface (walls/ceiling/trim). Reuse the Square Footage / Stair diagram technique.
- **Functional:** (1) real buy-list "2 gal + 1 qt, ~0.3 gal left over" + optional price per can → total cost;
  (2) per-surface paint (walls / ceiling / trim & doors each with own coats + coverage → one shopping line each);
  (3) **multi-room project total** with the sticky `.mbar` (reuse the flooring/gravel tally pattern, `_initAreaCore`);
  (4) auto coverage by texture + primer toggle (adds primer qty + extra-coat note); (5) waste buffer %.
- **Default view:** Units toggle; length, width, ceiling height; doors & windows by count (standard sizes
  assumed); coats 1/2/3 chips; "paint the ceiling" toggle.
- **Go advanced (real visible panel):** per-wall dimensions (accent walls/odd rooms), door & window sizes,
  texture, primer, baseboard + crown molding, coverage override, waste %, price per can, peak/gable.

**OPEN DECISIONS for the user (ask these, nothing else):**
1. Include an **Exterior mode** (Interior/Exterior on the same engine: wall rows + gable option + openings)?
   My recommendation: yes (S-W and Behr have it; Ahrefs `exterior paint calculator` >100 Easy).
2. OK to **drop** Sherwin-Williams' Deck mode and Behr's Wood-stain / Floor-coatings tabs (different
   products/coverage, not paint-the-room)? Recommendation: drop. (Touch-up = covered by leftover + waste
   buffer; vaulted ceiling = covered by the peak/gable option.)

## 5. How to build a calculator here (files to touch — all of them, every time)

Read first: `assets/style.css`, `assets/app.js`, `partials/header.html`, `partials/footer.html`,
`build.js`, `sitemap.xml`, one reference page; skill files in `md-files/` (design-system,
new-page-checklist, workflow-rules). Reference pages for patterns: Fraction (`fraction-calculator/`),
Standard Deviation, Grade Curve, Weighted Average, Square Footage (diagram), Flooring/Gravel (tally + `.mbar`).
1. `<slug>/index.html` (full-keyword slug; `<!--HEADER:START/END-->` and `<!--FOOTER:START/END-->` markers; JSON-LD WebApplication + FAQPage; `.related-calcs`; SEO content + 5 FAQs; `<body class="p-xxx">`; `CalcThis.initXxx({})`).
2. `assets/style.css` — a labelled `.p-xxx` block (never an inline `<style>`; no per-page `.fld` rule needed).
3. `assets/app.js` — `CalcThis.initXxx` before the "SITE FOOTER" accordion block.
4. `build.js` PAGES array · `partials/header.html` (Math col or Construction col) · `partials/footer.html`.
5. `index.html` (homepage): inline nav copy, card in the right `#grp-*` section, JSON-LD `hasPart`, the prose
   paragraph + the spelled-out count ("forty-three calculators in all" → next is forty-four), inline footer list.
6. `sitemap.xml` (multi-line `<url>` format with `<lastmod>`).
7. `node build.js` (bumps asset version, stamps header/footer; **it sometimes crashes after the IndexNow
   ping — just re-run it**; gates: unit-toggle, field-height, field-spacing).
8. Verify in the browser: math against known values, every mode, Go advanced opens a real panel, mobile
   (`resize_window` mobile, then reset to desktop), no console errors, empty start state.
9. Preview links → wait for "deploy" → build, `git add -A`, commit (with the Co-Authored-By trailer from the
   system reminder), `git push origin main` → update CLAUDE.md (counts, live list, "Last session"), roadmap md,
   memory (`calcthis-roadmap-status`), commit docs, push.

## 6. Environment gotchas (save yourself the debugging)

- Node edits with backticks/regex via `node -e "…"` in bash get mangled — **write a script file with the
  Write tool and run it**, or use the Edit tool.
- Browser pane: first screenshot often times out — **retry once**. Use a cache-bust query (`?v=N`) when
  reloading a page you just rebuilt. Tab ids change; use `seed`/the id returned by `preview_start`.
  `resize_window` mobile emulation must be reset with preset `desktop` afterwards.
- The first `node build.js` after edits sometimes prints only a Node version line (IndexNow network flake) —
  re-run; it succeeds.
- Python is not installed (use node). `$TEMP` may be unset in bash heredocs; use the scratchpad path.

## 7. Backlog (ranked, from `md-files/calcthis-calculator-roadmap.md`)

#22 Paint (NOW) · #23 Wallpaper · #24 Scientific Notation (>10K Medium) · #25 Recipe Converter (new Cooking
vertical) · lower priority: #26 Sales Tax, #27 Unit Converter, #28 Paycheck (YMYL tax tables), #29 Tip.
For every new calculator: Rule 8 research report (open every competitor live, list every input, propose a
visual AND a functional differentiator) → approval → build → preview → "deploy".
