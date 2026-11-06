# Bulking / calorie surplus calculator research (2026-11-06) — Ahrefs `bulking calculator` >1000 Easy; `calorie surplus calculator` >1000 Hard (same intent = ONE page); `lean bulking calculator` <100 Easy; `calorie bulking calculator` <100 Medium

## Site check
- Nothing named bulking/surplus exists. Closest: /tdee-calculator/ (cut/maintain/bulk table + macro split), /calorie-calculator/ (goal-weight pace, mentions gain only in one sentence), /macro-calculator/ (goal gain = +300 kcal), /calorie-deficit-calculator/ (maintenance + energy engine, the mirror image), /protein-intake-calculator/, /bmr-calculator/ (`CalcThis.bmrEngine`: Mifflin, Katch, 5 site activity levels).
- Page = `/bulking-calculator/`, title/description must carry both phrases (bulking + calorie surplus).

## Competitors opened LIVE (2026-11-06)
- **ProteinCalc** (myproteincalc.com/bulking-calculator): sex, age, weight (kg/lb), height (cm only), activity (5), training experience (beginner/intermediate/advanced), optional custom surplus. Output: maintenance, lean vs moderate bulk, macros, "muscle gain projection" per month by experience (table 0.75-1.0 / 0.4-0.6 / 0.1-0.3 kg, no source cited). Mifflin-St Jeor. No visual.
- **Coachway** (coachway.io/tools/calorie-surplus-calculator): units lb/ft-in or kg/cm, sex, age, height, weight, activity (5), surplus size (lean +200 / standard +375 / aggressive +550), optional goal weight. Mifflin + factor 1.2-1.9, 7,700 kcal/kg -> weekly gain table, protein 1.6-2.2 g/kg, states total weight is not muscle, links recomp. Sales page for a coaching app. No visual.
- **GetHealthyCalculators lean bulk**: units, weight, height, age, sex, activity (5), experience, optional body fat; surplus by experience 300 / 200 / 150 kcal; protein 1.0 g/lb, fat 25%, carbs rest; lists references (names only). No visual.
- **Gravitus** (gravitus.com/tools/bulking-calculator): Basic vs Advanced mode (Katch-McArdle with body fat, "Aragon TDEE"), units, sex, weight, height, age, activity (5), weekly weight-gain goal (lb, recommended 0.25-0.5), fat % of calories (20-25), outputs calories + macros. Page text says Harris-Benedict and Mifflin in different places (inconsistent). No visual.
- Seen only as snippets (NOT opened): TrainerStudio (404 on guessed URL), Micron, calculator.net, Muscle Hacking, Prospre, Ripped Body, Heumin, Max Healthcare.

## Input union (parity list)
units (US / metric), sex, age, height, weight, activity (5 levels), training experience (3), custom surplus (kcal), weekly gain goal, goal weight, body fat % (optional, Katch), fat share, protein basis. We match ALL of these (Go advanced for the deeper ones).

## Sources READ (verified)
- **Iraki J, Fitschen P, Espinar S, Helms E. Nutrition Recommendations for Bodybuilders in the Off-Season: A Narrative Review. Sports 2019;7(7):154** (abstract via Europe PMC, PMC6680710): hyper-energetic diet ~10-20% above maintenance, target gain ~0.25-0.5% of body weight per week for novice/intermediate; advanced more conservative (no number); protein 1.6-2.2 g/kg/day, 0.40-0.55 g/kg per meal over 3-6 meals; fat 0.5-1.5 g/kg/day; carbohydrate >= 3-5 g/kg/day.
- **Helms ER, Spence AJ, Sousa C, et al. Effect of Small and Large Energy Surpluses on Strength, Muscle, and Skinfold Thickness in Resistance-Trained Individuals. Sports Med Open 2023;9:102** (abstract, PMC10620361): 17 completers, 8 weeks, maintenance vs 5% vs 15% surplus; faster body-mass gain (larger surplus) mainly raised fat gain (body-mass change predicted skinfold change, R2 0.49) rather than 1-RM or muscle thickness; small sample, 8 weeks, mixed experience.
- Competitor pages above (formulas Mifflin, factors, presets).
## NOT verified (flag or drop)
- Muscle-gain rates per month by experience (ProteinCalc, Lyle/Aragon models) — no primary source read -> DROP (do not project muscle kg). Surplus presets per experience (+150/+200/+300 etc.) — competitor choices, not studies -> use the Iraki 10-20% / 0.25-0.5% bw/week ranges instead. 7,700 kcal/kg rule — already used on our calorie deficit page; Coachway/GetHealthy flag it as a simplification; keep it flagged. Aragon TDEE, Helms 2014/Garthe/Aragon-Schoenfeld rate tables not read.

## Findings (how we beat them)
1. All four are inputs-in, numbers-out with no picture; none shows the gain over time. 2. They hard-code a kcal surplus per experience from no cited study; the one review I read gives a PERCENT of maintenance and a % body weight per week, so surplus scales with the person. 3. None says maintenance rises as you gain, so the same intake stops working; none shows what to eat in week 8. 4. ProteinCalc projects muscle kg with no source.

## Proposed differentiators (for approval)
VISUAL: live weight-projection curve (weeks on x, weight on y) from today to goal weight at the chosen pace, with the 0.25-0.5%/week band shaded, plus an energy bar (maintenance + surplus = target) like the deficit page.
FUNCTIONAL: (1) set the surplus any of 3 ways — pace (% body weight per week, default 0.25-0.5% band from Iraki), percent of maintenance (10-20%), or kcal — and see all three equivalents; (2) goal weight -> weeks/date to get there, with the projection using maintenance that RISES as weight rises (Mifflin recomputed each week) and a "calories to eat by week" ladder so the target keeps up; (3) macros from Iraki: protein g/kg, fat g/kg, carbs remainder with a >=3 g/kg check, per meal split (3-6 meals); (4) honest about fat vs muscle: no muscle-kg projection, shows the Helms 2023 finding that bigger surpluses mostly add fat; (5) "I already know my maintenance" input (like the deficit page) and optional body fat (Katch); (6) link to recomp/deficit pages for people who should not bulk.
INPUT PARITY: all rows in the union above; Go advanced = known maintenance, body fat, experience-conservative pace for advanced, macros per kg overrides, meals.
DROPPED unless sourced: muscle-per-month projection, per-experience kcal presets, aggressive "dirty bulk" preset.
