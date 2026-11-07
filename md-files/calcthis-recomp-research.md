# Body recomposition calculator — research report (2026-11-07, NOT built, waiting for "Approve all")

Ahrefs (his, 2026-11-07): `body recomposition calculator` >1000 Easy (16 kws; female / free / best / macros / calories / male / female weight loss all <100). One head phrase. Page: `/body-recomposition-calculator/`.
Overlap on the site: macro, calorie, TDEE, calorie deficit, bulking, protein-intake, FFMI, body fat. Run `node md-files/dup-check.js` after building (expect low: it is a goal-specific page, not a generic macro calc).

## Competitors opened LIVE (built-in browser, rendered inputs read)
| Site | Inputs | Output / extras |
|---|---|---|
| Fitness Volt `/body-recomposition-calculator/` (PT + nutritionist fact check) | weight, height, age, sex, activity (5), emphasis (lose fat -400 / both -200 / build muscle at maintenance), weight-training days (3-6), meals (3-6), "anything that changes your needs" (pregnant, breastfeeding, GLP-1, kidney disease), optional body fat | training-day and rest-day calories + macros, protein flat every day, per-meal table, BMR / maintenance / deficit / floor (1.2 x BMR or 1,500) rows; cites a 2022 meta-analysis (~500 kcal deficit) |
| FatCalc `/body-recomp-calculator` | sex, age, body fat %, height, weight, training experience (4), activity, goal (recomp / lean bulk / cut) | "recomposition potential", calorie + protein recommendation, 12-week projection from McDonald's muscle-gain model + Barakat 2020 / Ribeiro 2019 citations |
| Bony to Beastly `/body-recomposition-calorie-calculator/` | units, weight, body fat %, lifestyle (3), workouts (4), weight change (slight deficit / none / slight surplus) | calories + macros; Cunningham RMR from body fat (no age/height/sex by design) |
| Healthy Eater `/body-recomposition-calculator` | age, sex, weight, height, formula (normal / lean mass + body fat), exercise, extra weekly calories burned, goal (more fat loss / even / more muscle) | calories + macros per day or per meal, training-day advice, 3 x 30 min lifting plan |
| Coachway `/tools/body-recomposition-calculator/` | weight (lb/kg), current body fat, TARGET body fat, activity (4) | maintenance calories (Katch-McArdle), protein 1 g/lb, lean / fat mass split, fat to lose, "6-12 months" timeline (fat to lose / 0.25-0.5 lb a week), -150 kcal trim |
All five = calories + macros (+ a text timeline). Nobody shows the research ceiling visually, nobody shows the three goals side by side, none draws calories against maintenance.

## Inputs parity (competitor fields vs ours)
- **Kept (default view):** weight (lb/kg/st), height, age, sex, activity level, emphasis (three presets), body fat % optional (Katch-McArdle when given, like our other pages).
- **Kept (Go advanced):** training days a week (>=3 note), meals a day, own calories (known maintenance), target body fat -> fat to lose.
- **Dropped, needs his sign-off:** training experience / "recomposition potential" and muscle-gain projections (FatCalc, McDonald model: I could not read McDonald's primary page, secondary sources contradict each other on year two/three numbers -> unsourced = dropped); training-day vs rest-day calorie cycling (Fitness Volt, Healthy Eater: no source I read); lifestyle health flags (pregnant / GLP-1 / kidney) -> replaced by a plain "ask a clinician" note, no numbers.

## Differentiators
- **Visual:** a calorie ruler: your maintenance, your three recomp targets, the ~500 kcal-below-maintenance line where lean-mass gains stopped in the 2022 meta-analysis (Murphy & Koehler), and the safe-minimum floor; your chosen target is the marker.
- **Functional:** (1) all three emphases side by side (fat focus / both / muscle focus): calories, protein, carbs, fat, per-meal, expected scale change a week — no re-run; (2) the scale warning: at -200 kcal the scale barely moves (simple 7,700 kcal / kg rule, said to ignore muscle gain), so the page names waist / photos / strength as the measures (qualitative, no number); (3) Go advanced: known maintenance, target body fat -> fat mass to lose; (4) per-meal split.

## Sources — READ (2026-11-07)
- Murphy C, Koehler K, Energy deficiency impairs resistance training gains in lean mass but not strength: a meta-analysis and meta-regression, Scand J Med Sci Sports 2022;32(1):125-137 (abstract via Europe PMC): an energy deficit of ~500 kcal/day prevented gains in lean mass; lean-mass gains were impaired in the deficit group vs control (effect size -0.57, p = 0.02) while strength gains were comparable; people lifting to preserve lean mass during weight loss should avoid deficits >500 kcal/day.
- Ribeiro AS et al., Effects of different dietary energy intake following resistance training on muscle mass and body fat in bodybuilders: a pilot study, J Hum Kinet 2019;70:125-134 (abstract via Europe PMC): 11 male bodybuilders, 4 weeks, higher intake (~67.5 kcal/kg/day) vs moderate (~50.1): body fat +7.4% vs +0.8%; muscle mass +2.7% vs +1.1% (pilot, n = 11, men, bodybuilders: flagged).
- From our own sourced engines (already read in earlier builds): Mifflin-St Jeor + activity (calorie page), Katch-McArdle with body fat, 7,700 kcal per kg, the 1,200 F / 1,500 M calorie floor (no primary source, stated), protein 1.6-2.2 g/kg (Iraki 2019 bulking review, read) and fat >= 0.5 g/kg.
- NOT read: Barakat et al. 2020 (Strength Cond J) — Europe PMC has no record, so the "possible in trained lifters" claim is NOT used; McDonald's muscle-gain model (primary page 404, secondaries disagree); any training/rest-day cycling evidence.
- Page disclaimer: for information only; pregnancy, breastfeeding, GLP-1 or kidney disease -> ask a clinician (no numbers).

## Plan if approved
`/body-recomposition-calculator/` — engine `RECOMP-ENGINE` (reuses deficitEngine/macros from the existing engines where they are pure), init `initRecompCalc` (ids `rc*`), css `.p-rc`, generator `md-files/gen-recomp-page.js` (chain after vitamin-d-calculator), fixture + independent oracle (>=100 runs), QA gate PASS, audit-silent run, UI check at 375px + all 12 screenshots, dup-check, preview. Title idea (<=60): "Body Recomposition Calculator — Calories & Protein to Lose Fat and Gain Muscle" (trim to fit).
