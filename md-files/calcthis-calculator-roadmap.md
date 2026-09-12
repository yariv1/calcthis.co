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

### Companion articles to build alongside
- Ideal Weight → "What's My Ideal Weight? Height, Frame, and the Formulas"
- Date → "How to Calculate the Number of Days Between Two Dates" — ✅ shipped v82
- Due Date → "How Is My Due Date Calculated?" + "How Many Weeks Pregnant Am I?"
- Ovulation → "When Am I Most Fertile? How to Calculate Your Ovulation Window"

---

## Already Live (31 calculators)

### Construction & Gardening (8)
- ✅ Board Foot
- ✅ Gravel
- ✅ Sand
- ✅ Topsoil
- ✅ Mulch
- ✅ Concrete
- ✅ Flooring
- ✅ Tile

### Health & Fitness (14)
- ✅ BMI
- ✅ Calorie
- ✅ Pace
- ✅ Race Time Predictor
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

Volume/KD are NotebookLM estimates, not Ahrefs-verified — spot-check in Ahrefs before
committing a full build, same as every other roadmap entry.

| Calculator | Keyword | Est. volume | Difficulty | Cluster | Differentiator |
|---|---|---|---|---|---|
| **Tape Measure Fraction Calculator** | `tape measure fraction calculator` | ~18,000/mo | Low–Medium (generic "fraction calculator" is unwinnable at 500k/mo — this is the winnable reframe of it) | Construction & Gardening | Live digital tape-measure ruler (1/16"/1/32") with an animated marker showing the exact tick as fractions are added/subtracted |
| **VO2 Max Calculator** | `vo2 max calculator` | 40,000–90,000/mo (protocol long-tails 2,400–8,000/mo, lower difficulty) | Moderate (low on protocol-specific long-tails) | Health & Fitness | Aerobic-fitness gauge (age/sex percentile) + race-time predictor bar (5K/10K/half/marathon) |
| **Steps-to-Miles / Calories Burned Walking** | `steps to miles calculator` | ~22,000–45,000/mo | Low–Medium | Health & Fitness | Distance-milestone progress bar (real-world landmark comparisons) + incline/speed calorie-burn curve |
| **ABSI (A Body Shape Index) Calculator** | `absi calculator` | ~4,800/mo | Extremely low (~8 exact-match competitors) | Health & Fitness (Weight cluster) | BMI-vs-ABSI visceral-risk 2D body-contour comparison |
| **RFM (Relative Fat Mass) Calculator** | `rfm calculator` | ~3,200/mo | Extremely low | Health & Fitness (Weight cluster) | Height-to-waist geometric ratio slider vs. DEXA/Navy-tape benchmarks |

**Crowded — ruled out:** Paint / Roofing / Fence / Deck (owned by Sherwin-Williams, Lowe's,
Benjamin Moore, big construction-affiliate sites); generic Tip / Discount / Unit Converter
(owned by calculator.net, Omnicalculator, Google's own inline results).

Not yet decided which ships next — weigh cluster fit (Tape Measure Fraction completes a
measurement-math gap in Construction; VO2 Max/ABSI/RFM extend Health & Fitness) against
volume vs. difficulty above.

## Parked Ideas (not prioritized yet)

- BMR Calculator — overlaps heavily with TDEE, may not be worth a standalone page
- Mortgage / Loan / Compound Interest — massive volume, unwinnable competition, opens a
  Finance category we'd have to defend. Not our lane.
- Basic / Scientific Calculator — ~25M/mo but can't out-rank Google's own + Desmos.
- Fraction Calculator — medium volume, math/school

---

## Notes

- Every new calculator title must be verified as a high-volume real search query before building.
- Slug must contain the full target keyword — no abbreviations.
- After each build: update header nav, footer, build.js, sitemap.xml, homepage if needed.
