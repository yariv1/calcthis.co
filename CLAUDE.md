# CalcThis — Project Context

> **Self-maintenance rule:** At the end of every session, update this file:
> - Bump asset version
> - Add any new articles/calculators to the live lists
> - Update calculator roadmap (mark completed, reorder if needed)
> - Log what was shipped under "Last session"

---

## Project state

- **Asset version:** v71
- **Total pages:** 41
- **Model:** Opus 4.6

---

## Live blog articles (11)

- How Much Gravel Do I Need for a Driveway?
- How Much Mulch Do I Need?
- How Much Topsoil Do I Need?
- How Much Concrete Do I Need?
- How Much Sand Do I Need?
- How Much Flooring Do I Need?
- How to Calculate Your Macros
- What Is Zone 2 Heart Rate?
- What Is One Rep Max? How to Calculate Your 1RM
- How to Calculate Your TDEE
- How to Calculate Your Body Fat Percentage

---

## Live calculators (27)

### Construction & Gardening (8)
Board Foot · Gravel · Sand · Topsoil · Mulch · Concrete · Flooring · Tile

### Health & Fitness (12)
Pace · Race Time Predictor · Heart Rate Zone · Zone 2 Heart Rate · BMI · Body Fat · Calorie · TDEE · One Rep Max · Sleep · Macro · Peptide Reconstitution

### School & Grades (4)
Final Grade · GPA · Grade · Test Score

### Math & Numbers (3)
Ratio · Percentage · Age

---

## Last session (v71)

- Built and deployed **Calorie Calculator** (`/calorie-calculator/`) — `CalcThis.initCalorieCalc` in app.js, `.p-calorie` block in style.css
- Goal-weight framing (distinct from TDEE calc): daily calorie target for a chosen pace (gentle/moderate/fast **clickable** `#paceTable`), explicit deficit, **projected weight-loss curve** SVG with 25/50/75/100% milestone dates + goal date, protein target, maintenance anchor
- Best practice: Mifflin-St Jeor (Katch-McArdle w/ body fat %), safety floors + flags (<1200 F / <1500 M, >1%/wk), 7700 kcal/kg adaptation caveat
- Advanced: **plan by target date** (reuses the vanillajs-datepicker), body fat %, full macro split
- **Female default**; unit default order = `localStorage['ct_units']` → `prefersImperial()` (regional) → metric. Only the Calorie calc writes/reads `ct_units` so far — retrofit BMI/TDEE/BodyFat later.
- `.pill` cross-links (TDEE / Macro / BMI / Body Fat) after the grid

### Also v71 — chart + pill fixes across the site
- **12px SVG-text floor** on the BMI + Age charts (were 9–10px); viewBoxes bumped (BMI 300→308, Age 64→84)
- Calorie pace table: error flag ("below safe min") drops below a **top-aligned** number, row grows — `#paceTable td{vertical-align:top}`, `.cal-warn{display:block}`
- `.pill` is now **underline-free + inline-flex** in the BASE rule (`display:inline-flex;gap:5px;text-decoration:none` + `a.pill:hover`); removed the redundant `.p-zone2 .pill` page override
- Skill files: cross-links now **required** (`.pill` row after the grid + a contextual inline link); 12px chart-text floor; `.pill` no-underline rule

### Earlier this session (v68–v70)
- v68–v69: BMI Calculator (`/bmi-calculator/`, `initBMICalc`, `.p-bmi`) — BMI scale + marker, healthy weight range, advanced (target weight / BMI Prime / Ponderal Index); + interactive height×weight **BMI chart** (SVG, live dot, bands + legend) + "check body fat %" callout when BMI ≥ 25
- v70: Age Calculator (`/age-calculator/`, `initAgeCalc`, `.p-age`) — exact age y/m/d + seconds ticker · totals · born-weekday · next-birthday countdown · life timeline SVG · day-milestones · advanced = age on any date. **Vendored vanillajs-datepicker** (`assets/datepicker.min.{js,css}`), themed via `.datepicker-*` in style.css — type OR pick, decade year grid. Load `datepicker.min.css` BEFORE `style.css`.
- `.claude/launch.json` (`calcthis-static` — `python -m http.server 8123`) for served previews; RULES 8–9 + PRODUCT PHILOSOPHY; ≥14px text floor; **deploy gated** on the user previewing in Chrome + saying "deploy"

---

## Calculator roadmap (priority order)

1. ~~BMI Calculator~~ — ✅ shipped v68–v69
2. ~~Age Calculator~~ — ✅ shipped v70
3. ~~Calorie Calculator~~ — ✅ shipped v71
4. **Pregnancy / Due Date Calculator** — top-5 on every competitor (reuse the date picker) ← next
5. Ideal Weight Calculator — complements BMI + Body Fat
6. Date Calculator — days between dates, utility tool (reuse the date picker)

---

## Skill files (in `md-files/`)

Read ALL relevant skill files before any build. They contain exact class names, structure patterns, and rules.

| File | Purpose |
|---|---|
| `md-files/calcthis-working-rules.md` | Behavior rules, session start protocol |
| `md-files/calcthis-workflow-rules.md` | Master workflow rules — overrides everything |
| `md-files/calcthis-new-page-checklist.md` | New calculator page structure + preview script |
| `md-files/calcthis-deploy-checklist.md` | Pre-deploy checklist |
| `md-files/calcthis-deploy-flow.md` | Deploy steps (direct commit, no zip) |
| `md-files/calcthis-nav-structure.md` | Exact header nav HTML |
| `md-files/calcthis-footer-structure.md` | Exact footer HTML |
| `md-files/calcthis-design-system.md` | Reusable components + CSS variables |
| `md-files/calcthis-calculator-roadmap.md` | Build priority list |
| `md-files/calcthis-blog-article.md` | Blog article template + workflow |
| `md-files/calcthis-blog-hub.md` | Blog hub structure + image registry |

---

## Required source files — read at session start

1. `assets/style.css`
2. `assets/app.js`
3. `partials/header.html`
4. `partials/footer.html`
5. `build.js`
6. `sitemap.xml`
7. One existing calculator or article page (structure reference)

**Read these from disk. Never guess class names, CSS variables, or structure.**

---

## Dark mode

Parked. Not an SEO factor. Estimated ~1 session when ready: sweep 52 hardcoded colors into variables, add pure neutral gray dark palette + toggle. Clean grays, no warm tones.
