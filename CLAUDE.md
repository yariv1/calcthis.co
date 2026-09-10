# CalcThis — Project Context

> **Self-maintenance rule:** At the end of every session, update this file:
> - Bump asset version
> - Add any new articles/calculators to the live lists
> - Update calculator roadmap (mark completed, reorder if needed)
> - Log what was shipped under "Last session"

---

## Project state

- **Asset version:** v81
- **Total pages:** 47
- **Model:** Opus 4.6

---

## Live blog articles (15)

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
- What Is BMI? How to Calculate and Interpret Your Body Mass Index
- How Many Calories Should I Eat to Lose Weight?
- How to Calculate Your Exact Age
- How Much Should I Weigh?

---

## Live calculators (29)

### Construction & Gardening (8)
Board Foot · Gravel · Sand · Topsoil · Mulch · Concrete · Flooring · Tile

### Health & Fitness (13)
Pace · Race Time Predictor · Heart Rate Zone · Zone 2 Heart Rate · BMI · Body Fat · Ideal Weight · Calorie · TDEE · One Rep Max · Sleep · Macro · Peptide Reconstitution

### School & Grades (4)
Final Grade · GPA · Grade · Test Score

### Math & Numbers (4)
Ratio · Percentage · Age · Date

Total live calculators: **29**

---

## Last session (v81)

- v81: Built + deployed **Date Calculator** (`/date-calculator/`) — roadmap #7, completes the
  Date/Time cluster with Age. `CalcThis.initDateCalc` in app.js, `.p-datecalc` in style.css.
  Two modes via a full-width `.modeseg` (**Days between** / **Add · subtract**). Differentiator
  (Rule 8) = a **live span bar** SVG: month-boundary ticks, weekend shading in business-day
  mode, a "today" marker — plus the answer given every way at once (days / weeks+days /
  y·m·d) with no unit dropdown. Advanced (between mode only) = business-days count +
  optional US-federal-holiday exclusion (11 holidays computed per year, observed-day
  shifted — no checkbox wall). Reuses the vendored vanillajs-datepicker (From/To/Start,
  prefilled today / today+90). WebApplication + FAQPage JSON-LD, 10 SEO H2s, 5 FAQs,
  `.related-calcs` (Age / Percentage / Ratio). Wired into nav (Math & Numbers, after Age),
  footer, homepage (card + hasPart + prose count → 29), build.js, sitemap.xml.
  Companion article "How to Calculate the Number of Days Between Two Dates" still to build.

## Earlier (v73–v80)

- v80: **Card-header migration** — 16 calculators that had an inline `.seg` toggle on the
  `<h2>` title row moved to `.card-h2` + `.ctl-row`/`.ctl-lab` (title on its own line, toggle
  in a labelled "Units"/"Sex" row): BMI, Body Fat, Ideal Weight, Calorie, TDEE, One Rep Max,
  Pace, Race Time Predictor, Board Foot, Concrete, Flooring, Gravel, Mulch, Sand, Tile,
  Topsoil. No behaviour change — button ids/attrs untouched. **Female default** now applied to
  Body Fat + TDEE in app.js (Calorie + Ideal Weight already were); Body Fat `#hipFld` init
  fixed to show on load. `.row-top` kept for the 9 title-only pages (age, final-grade, gpa,
  grade, heart-rate-zone, peptide, sleep, test-score, zone-2) — never add a toggle to it.
  Both standards are in `calcthis-design-system.md`.

- v79: Shipped blog article **"How Much Should I Weigh?"** (`/blog/how-much-should-i-weigh/`)
  → CTA to `/ideal-weight-calculator/`. Healthy weight = a range not a number; BMI 18.5–24.9
  span by height (table), the 4 formulas as points inside it, frame size, "for my age",
  women vs men, when the number misleads, 5-question FAQ, 2 `.blog-figure` photos. Completes
  the Weight cluster (calc + article).

- v78: Built + deployed **Ideal Weight Calculator** (`/ideal-weight-calculator/`) —
  `CalcThis.initIdealWeightCalc` in app.js, `.p-ideal-weight` in style.css. Headline output
  is the healthy weight **range** (BMI 18.5–24.9 for the height); Robinson/Devine/Miller/Hamwi
  plotted as ticks on the same scale (differentiator: no "which of 4 numbers?" table dump).
  Advanced = current-weight marker + distance-to-range readout + body-frame target. WebApplication
  + FAQPage JSON-LD, 10 SEO H2s, `.related-calcs`. Companion article `/blog/how-much-should-i-weigh/`
  next.
- v78: **NEW global card-header standard** — `.card-h2` (title, own line) + `.ctl-row` / `.ctl-lab`
  (each toggle in a labelled row: "Units", "Sex"). Replaces `.row-top` h2+toggle, which made a
  unit toggle read as part of the calculator title. **24 pre-v78 pages still on `.row-top` —
  migration pass pending this session.**
- v78: **NEW global rule** — every health calc with a sex toggle defaults to **Female**
  (first button, `class="on"`, JS state `'female'`). Calorie already did; Ideal Weight follows;
  Body Fat / TDEE to be updated in the migration pass.

- v76–v77: **Blog image naming convention** — `blog-{article}-card.webp` /
  `-hero.webp` / `-inArticle-1.webp` (…-2, -3). Renamed the 12 v73–v75 images
  (BMI, Calorie, Age) + all refs + registry. Pre-v75 articles keep legacy names
  (do not rename). Convention is in both blog skill files.

- v75: Shipped blog article **"How to Calculate Your Exact Age"**
  (`/blog/how-to-calculate-your-exact-age/`) → CTA to `/age-calculator/`. Borrow-and-subtract
  method (day/month/year columns), worked example, age in total days/hours, leap-year + Feb 29
  edge cases, why calculators disagree by a day, 5-question FAQ, 2 `.blog-figure` photos.
  No `.u` unit spans — toggle correctly stays hidden. **Completes the BMI/Calorie/Age trio.**
- Reprioritized `calcthis-calculator-roadmap.md` around **cluster completion**:
  next = Ideal Weight (completes Weight cluster) → Pregnancy/Due Date + Ovulation (new
  vertical, **post-AdSense**, YMYL) → Date Calculator. Finance + basic/scientific calc parked
  as unwinnable.

- v74: Shipped blog article **"How Many Calories Should I Eat to Lose Weight?"**
  (`/blog/how-many-calories-to-lose-weight/`) → CTA to `/calorie-calculator/`. Calorie-deficit
  method, TDEE step (links TDEE article/calc), deficit-size table, "3,500 cal = 1 lb" caveat,
  safety floors (1,200 F / 1,500 M / cap 1%/wk), worked example, protein in a deficit,
  scale-stall guidance, 5-question FAQ, 2 `.blog-figure` photos, `.blog-pills`.
- **Age** article ("How to Calculate Your Exact Age" → `/age-calculator/`) still pending —
  last of the 3 BMI/Calorie/Age companion pieces.

- v73: Shipped blog article **"What Is BMI? How to Calculate and Interpret Your Body Mass Index"**
  (`/blog/what-is-bmi/`) → CTA to `/bmi-calculator/`. Formula (metric + imperial ×703),
  worked example, WHO categories table, colour-coded BMI scale SVG (15–40), healthy weight
  range, BMI limitations (muscle / waist / age / population / fitness), kids-and-teens note,
  4-question FAQ, `.blog-pills` cross-links.
- Added **`.blog-figure`** CSS to `style.css` (in-article contextual photo — was missing).
- Images (renamed in v76): `blog-bmi-card.webp` (800×400), `blog-bmi-hero.webp` (1400×520),
  `blog-bmi-inArticle-1.webp` + `blog-bmi-inArticle-2.webp` (800×320).
- **Hero size settled: 1400×520 (2.69:1).** `.blog-hero-art` has no `aspect-ratio` lock —
  renders the WebP's natural ratio — so 1400×520 source + `width="1400" height="520"` attrs
  just work, no CSS change. Blog skill files updated (removed the stale "ratio TBD" flag);
  in-article images confirmed 800×320.
- Still pending this session: BMI companion done; **Calorie** ("How Many Calories Should I
  Eat to Lose Weight?" → `/calorie-calculator/`) and **Age** ("How to Calculate Your Exact
  Age" → `/age-calculator/`) articles next.

## Earlier (v71–v72)

- v72: `.related-calcs` block (heading + `.pills` after the grid) — width capped to the grid's
  left column so the 4 hug-chips wrap 2×2 under the input card. **LOCKED SPEC** in
  `calcthis-design-system.md` with a DO-NOT list (no flex:1 / centering / label-shortening /
  pill-dropping / per-page overrides). `.pill` base rule is also final (inline-flex, no underline).
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

Strategy = **cluster completion** (see `md-files/calcthis-calculator-roadmap.md`). Skip
finance + basic/scientific calc (unwinnable). Pregnancy/Ovulation are YMYL — build **after
AdSense approval**; Date was the next non-blocked build and is now shipped.

1. ~~BMI Calculator~~ — ✅ shipped v68–v69
2. ~~Age Calculator~~ — ✅ shipped v70
3. ~~Calorie Calculator~~ — ✅ shipped v71
4. ~~Ideal Weight Calculator~~ — ✅ shipped v78
5. ~~Date Calculator~~ — ✅ shipped v81 (companion article pending)
6. **Pregnancy / Due Date Calculator** — big new vertical, after AdSense approval (reuse date picker)
7. **Ovulation / Fertility Calculator** — completes the Pregnancy cluster
8. Water Intake · 9. Time Calculator

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
