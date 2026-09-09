# CalcThis — Project Context

> **Self-maintenance rule:** At the end of every session, update this file:
> - Bump asset version
> - Add any new articles/calculators to the live lists
> - Update calculator roadmap (mark completed, reorder if needed)
> - Log what was shipped under "Last session"

---

## Project state

- **Asset version:** v70
- **Total pages:** 40
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

## Live calculators (26)

### Construction & Gardening (8)
Board Foot · Gravel · Sand · Topsoil · Mulch · Concrete · Flooring · Tile

### Health & Fitness (11)
Pace · Race Time Predictor · Heart Rate Zone · Zone 2 Heart Rate · BMI · Body Fat · TDEE · One Rep Max · Sleep · Macro · Peptide Reconstitution

### School & Grades (4)
Final Grade · GPA · Grade · Test Score

### Math & Numbers (3)
Ratio · Percentage · Age

---

## Last session (v70)

- Built and deployed **Age Calculator** (`/age-calculator/`) — `CalcThis.initAgeCalc` in app.js, `.p-age` block in style.css
- Exact age y/m/d + live seconds ticker · totals (months/weeks/days/hours) · born-weekday · next-birthday countdown · life-progress timeline SVG to next decade · 1,000- & 10,000-day milestones · advanced = age on any past/future date
- **Date picker: vanillajs-datepicker vendored** (`assets/datepicker.min.{js,css}`), themed to the DS (`.datepicker-*` block in style.css) — type OR pick, decade year grid, no spinner. Load `datepicker.min.css` BEFORE `style.css`. Reuse on future date calcs (Date / Pregnancy / Due Date). Page adds two `<link>`/`<script>` refs; only date calcs need them.
- Design system: **≥14px text-size floor** added; advanced-output `.res-tip` → 16px + `rgb(181,118,31)`
- Wired build.js, sitemap.xml, header/footer partials, homepage card + JSON-LD hasPart + prose count (25 → 26)
- **Deploy is now gated**: no `node build.js` + commit + push until the user previews in their own Chrome and says "deploy" (RULES in workflow-rules / working-rules / deploy-flow / deploy-checklist)

### Earlier this session (v68–v69)
- v68: BMI Calculator (`/bmi-calculator/`, `initBMICalc`, `.p-bmi`) — colour-coded BMI scale + marker, healthy weight range, advanced (target weight / BMI Prime / Ponderal Index)
- v69: BMI edge — interactive height×weight **BMI chart** (SVG, live dot, category bands + legend) + contextual "check body fat %" callout when BMI ≥ 25
- Added `.claude/launch.json` (`calcthis-static` — `python -m http.server 8123`) for served previews; RULES 8–9 + PRODUCT PHILOSOPHY in the skill files

---

## Calculator roadmap (priority order)

1. ~~BMI Calculator~~ — ✅ shipped v68–v69
2. ~~Age Calculator~~ — ✅ shipped v70
3. **Calorie Calculator** — distinct from TDEE, very high volume ← next
4. Pregnancy / Due Date Calculator — top-5 on every competitor (reuse the date picker)
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
