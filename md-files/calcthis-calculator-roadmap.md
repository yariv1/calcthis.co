# CalcThis — Calculator Roadmap

---

## Strategy — cluster completion, not one-off keywords

The traffic play is **finishing tight topical clusters** so Google treats CalcThis as a
niche authority. We already own a strong Weight/Fitness cluster (BMI · Body Fat · Calorie ·
TDEE · Macro + articles). Next moves fill the obvious gaps in that cluster and open one new
high-volume vertical (Pregnancy), each sharing an audience and a component (the datepicker).

**Deliberately skipped** — basic/scientific calculator, mortgage, loan, compound interest.
Massive volume but unwinnable vs Google / Desmos / NerdWallet, and finance is not our lane.

⚠️ **AdSense-review timing:** Pregnancy/fertility is YMYL — needs careful, well-sourced,
cautious content or it can hurt a review. Ship Ideal Weight + Date first (safe); slot
Pregnancy + Ovulation immediately **after** AdSense approval.

---

## Next Builds (priority order)

| # | Calculator | Keyword Volume | Cluster | Complexity | Status |
|---|---|---|---|---|---|
| 1 | BMI Calculator | Massive — #1 health calc keyword | Weight | Simple | ✅ Shipped v68–v69 |
| 2 | Age Calculator | Very high for how simple it is | Date/Time | Trivial | ✅ Shipped v70 |
| 3 | Calorie Calculator | Very high — distinct from TDEE | Weight | Medium | ✅ Shipped v71 |
| 4 | Ideal Weight Calculator | Solid, ~3M/mo — completes the Weight cluster. | Weight | Simple | ✅ Shipped v78 |
| 5 | **Date Calculator** | High — days between / add-subtract dates, low competition, reuses datepicker, completes Date/Time cluster with Age. | Date/Time | Simple | ✅ Shipped v81 |
| 6 | **Water Intake Calculator** | ~3M/mo, simple — easy Health win. 33 ml/kg + activity/climate/pregnancy; differentiator = stacked contribution bar + morning/afternoon/evening glass illustration. | Health | Simple | ✅ Shipped v83 |
| 7 | **Time Calculator** | Elapsed time / free time card / weekly hours (Ahrefs Easy-KD terms) — rounds out Date/Time cluster. Differentiator = a live visual per mode (24h timeline / running tally / week-at-a-glance bar chart) vs. every competitor's bare table. | Date/Time | Medium | ✅ Shipped v85 |
| 8 | **Pregnancy / Due Date Calculator** | Very high, ~3M/mo — top-5 on every competitor, recurring weekly visits, reuses datepicker. Opens a new vertical. Build **after AdSense approval**. | Pregnancy | Medium | ⬜ |
| 9 | **Ovulation / Fertility Calculator** | ~3M/mo — same audience + component as Due Date, completes the Pregnancy cluster. | Pregnancy | Medium | ⬜ |
| 10 | **Tape Measure Fraction Calculator** | ~18,000/mo — winnable reframe of the unwinnable generic "fraction calculator". | Construction & Gardening | Medium | ✅ Shipped v87–v88 |
| 11 | **VO2 Max Calculator** | 40,000–90,000/mo — highest remaining volume of the researched candidates. | Health & Fitness | Medium | ✅ Shipped v89–v99 |
| 12 | **Steps-to-Miles Calculator** | Ahrefs-verified >10,000/mo, Easy KD, trending up — plus a long-tail cluster of "N steps to miles" variants. | Health & Fitness | Simple–Medium | ✅ Shipped v100 |

| 13 | **Protein Intake Calculator** | Ahrefs-verified >10,000/mo, **Easy** KD. | Health & Fitness | Simple–Medium | ✅ Shipped v103 |
| 14 | **Square Footage Calculator** | Ahrefs-verified >10,000/mo, Medium KD. | Construction & Gardening | Simple | ✅ Shipped v104 |
| 15 | **Stair Calculator** | Ahrefs-verified >10,000/mo, Medium KD. | Construction & Gardening | Medium | ✅ Shipped v106 |
| 16 | **Lean Body Mass Calculator** | Ahrefs-verified >1,000/mo, Medium KD. | Health & Fitness | Simple | ⬜ |
| 17 | **Waist-to-Hip Ratio Calculator** | Ahrefs-verified >1,000/mo, **Easy** KD. | Health & Fitness | Simple | ⬜ |

### Companion articles to build alongside
- Ideal Weight → "What's My Ideal Weight? Height, Frame, and the Formulas"
- Date → "How to Calculate the Number of Days Between Two Dates" — ✅ shipped v82
- Due Date → "How Is My Due Date Calculated?" + "How Many Weeks Pregnant Am I?"
- Ovulation → "When Am I Most Fertile? How to Calculate Your Ovulation Window"

---

## Already Live (34 calculators)

### Construction & Gardening (9)
- ✅ Board Foot
- ✅ Gravel
- ✅ Sand
- ✅ Topsoil
- ✅ Mulch
- ✅ Concrete
- ✅ Flooring
- ✅ Tile
- ✅ Tape Measure Fraction

### Health & Fitness (15)
- ✅ BMI
- ✅ Calorie
- ✅ Pace
- ✅ Race Time Predictor
- ✅ VO2 Max
- ✅ Heart Rate Zone
- ✅ Zone 2 Heart Rate
- ✅ Body Fat
- ✅ Ideal Weight
- ✅ TDEE
- ✅ One Rep Max
- ✅ Sleep
- ✅ Water Intake
- ✅ Macro
- ✅ Peptide Reconstitution
- ✅ Steps to Miles

### School & Grades (4)
- ✅ Final Grade
- ✅ GPA
- ✅ Grade
- ✅ Test Score

### Math & Numbers (5)
- ✅ Ratio
- ✅ Percentage
- ✅ Age
- ✅ Date
- ✅ Time

---

## Candidates under research (post-Time-Calculator) — NotebookLM pass, 2026-09-12

Tape Measure Fraction Calculator and VO2 Max Calculator (both were in this list) have shipped —
moved to Next Builds #10–11 above.

**Ahrefs-verified, 2026-09-13** (replaces the earlier NotebookLM estimates below):

| Calculator | Keyword | Ahrefs volume | Ahrefs KD | Cluster | Differentiator |
|---|---|---|---|---|---|
| **Steps-to-Miles Calculator** | `steps to miles calculator` | **>10,000/mo**, trending up (updated 6 days ago), 127 related keywords incl. `14,000/7,000/10,000 steps to miles calculator` long-tails | **Easy** | Health & Fitness | Distance-milestone progress bar (real-world landmark comparisons) + incline/speed calorie-burn curve |
| ABSI (A Body Shape Index) Calculator | `absi calculator` | <100/mo (only 4 related keywords total) | Easy | Health & Fitness (Weight cluster) | — not worth building at this volume, park it |
| RFM (Relative Fat Mass) Calculator | `rfm calculator` | >100/mo (only 14 related keywords, rest <100) | Easy | Health & Fitness (Weight cluster) | — negligible volume, park it |

**Decision: Steps-to-Miles Calculator ships next** (#12) — by far the best volume of the three,
Easy KD, and a whole long-tail cluster of "N steps to miles" variants to pick up alongside the
head term. ABSI and RFM moved to Parked Ideas below — real volume is too low to justify a build
right now.

**Crowded — ruled out:** Paint / Roofing / Fence / Deck (owned by Sherwin-Williams, Lowe's,
Benjamin Moore, big construction-affiliate sites); generic Tip / Discount / Unit Converter
(owned by calculator.net, Omnicalculator, Google's own inline results).

**Ahrefs-verified, 2026-09-14** (user ran these directly in their own Ahrefs account):

| Calculator | Ahrefs volume | Ahrefs KD | Cluster |
|---|---|---|---|
| **Protein Intake Calculator** | >10,000/mo | **Easy** | Health & Fitness |
| **Square Footage Calculator** | >10,000/mo | Medium | Construction & Gardening |
| **Stair Calculator** | >10,000/mo | Medium | Construction & Gardening |
| Lean Body Mass Calculator | >1,000/mo | Medium | Health & Fitness |
| Waist-to-Hip Ratio Calculator | >1,000/mo | **Easy** | Health & Fitness |

Added to Next Builds as #13–17 (ranked by volume, then KD). All five are candidates — none
built or approved yet. Best volume+KD combo is **Protein Intake Calculator** (>10,000/mo,
Easy) — recommend researching that one first per Rule 8.

## Parked Ideas (not prioritized yet)

- BMR Calculator — overlaps heavily with TDEE, may not be worth a standalone page
- Mortgage / Loan / Compound Interest — massive volume, unwinnable competition, opens a
  Finance category we'd have to defend. Not our lane.
- Basic / Scientific Calculator — ~25M/mo but can't out-rank Google's own + Desmos.
- Fraction Calculator — medium volume, math/school
- ABSI (A Body Shape Index) Calculator — Ahrefs-verified <100/mo, not worth building
- RFM (Relative Fat Mass) Calculator — Ahrefs-verified >100/mo but still negligible, not worth building

---

## Notes

- Every new calculator title must be verified as a high-volume real search query before building.
- Slug must contain the full target keyword — no abbreviations.
- After each build: update header nav, footer, build.js, sitemap.xml, homepage if needed.
