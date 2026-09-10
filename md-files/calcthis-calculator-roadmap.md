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
| 6 | **Pregnancy / Due Date Calculator** | Very high, ~3M/mo — top-5 on every competitor, recurring weekly visits, reuses datepicker. Opens a new vertical. Build **after AdSense approval**. | Pregnancy | Medium | ⬜ |
| 7 | **Ovulation / Fertility Calculator** | ~3M/mo — same audience + component as Due Date, completes the Pregnancy cluster. | Pregnancy | Medium | ⬜ |
| 8 | Water Intake Calculator | ~3M/mo, simple — easy Health win, shallower content ceiling | Weight-adjacent | Simple | ⬜ |
| 9 | Time Calculator | Medium, utility — rounds out Date/Time | Date/Time | Simple | ⬜ |

### Companion articles to build alongside
- Ideal Weight → "What's My Ideal Weight? Height, Frame, and the Formulas"
- Date → "How to Calculate the Number of Days Between Two Dates" — ✅ shipped v82
- Due Date → "How Is My Due Date Calculated?" + "How Many Weeks Pregnant Am I?"
- Ovulation → "When Am I Most Fertile? How to Calculate Your Ovulation Window"

---

## Already Live (29 calculators)

### Construction & Gardening (8)
- ✅ Board Foot
- ✅ Gravel
- ✅ Sand
- ✅ Topsoil
- ✅ Mulch
- ✅ Concrete
- ✅ Flooring
- ✅ Tile

### Health & Fitness (12)
- ✅ BMI
- ✅ Calorie
- ✅ Pace
- ✅ Race Time Predictor
- ✅ Heart Rate Zone
- ✅ Zone 2 Heart Rate
- ✅ Body Fat
- ✅ TDEE
- ✅ One Rep Max
- ✅ Sleep
- ✅ Macro
- ✅ Peptide Reconstitution

### School & Grades (4)
- ✅ Final Grade
- ✅ GPA
- ✅ Grade
- ✅ Test Score

### Math & Numbers (4)
- ✅ Ratio
- ✅ Percentage
- ✅ Age
- ✅ Date

---

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
