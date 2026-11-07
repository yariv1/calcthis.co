# Fiber calculator research (2026-11-07) — report for approval, NOTHING built

Ahrefs (his screenshots 2026-11-06): fiber calculator >1000 Easy; fiber calculator food >100 (N/A); daily / for weight loss / app / dietary / how much fiber calculator <100 Easy. One intent -> ONE page `/fiber-calculator/` (the variants are the same intent). No fiber page exists on the site (sitemap: 0 hits).

## Competitors opened LIVE (built-in browser, 2026-11-07)
- Omnicalculator /health/fiber: sex, height (cm/m/in/ft), weight (kg/lb/st), age, activity factor (6 levels) -> recommended daily calories -> "Fiber per day, recommended optimum" (g, unit switch). Bare numbers, no visual. "Based on 1 source".
- Coachway /tools/fiber-intake-calculator: sex, age, daily calories (optional), "what you are eating for" (general health / weight loss / gut health: text only, no number changes); shows BOTH the 14 g/1,000 kcal result and the fixed standard (25 g women / 38 g men; Coachway says 21 / 30 from age 51 — not verified by me), typical intake 15-17 g, a "what 28 g looks like" food list (approximate per-food values), ramp-up advice.
- Tate & Lyle (UK): 8-question food-frequency quiz -> low / medium / high fibre diet (no gram target).
- Lose It and Everyday Health: guessed URLs returned 404, NOT opened (Google snippets only).

## Inputs parity (never fewer)
Omni: sex, height, weight, age, activity, (calories derived) -> we match all and let him type known calories instead. Coachway: sex, age, calories -> matched. Coachway's "goal" chips change no number -> dropped unless he wants them (needs his sign-off). Tate & Lyle food-frequency quiz -> replaced by a food tally in grams (more useful).

## Proposed differentiators
- Visual: a "build your day" bar: target in grams with the foods you add stacking up toward it (same stacked-bar technique as the caffeine page), plus the 14 g/1,000 kcal ruler beside the fixed 25/38 g marks.
- Functional: both accepted targets side by side (calorie-based from our own calorie engine OR typed calories, and fixed by age/sex); a day tally from ~15 common foods (each value read live from USDA FoodData Central at build time, same method as caffeine) with "grams still to go" and which foods close the gap; a ramp-up plan (add ~5 g a week) — ramp-up text only if a source is read, else dropped.

## Sources
READ: Dahl WJ, Stewart ML, Position of the Academy of Nutrition and Dietetics: Health Implications of Dietary Fiber, J Acad Nutr Diet 2015;115:1861 (abstract, Europe PMC): Adequate Intake 14 g total fiber per 1,000 kcal, or 25 g women and 38 g men; mean US intake 17 g/day; about 5% meet the AI. Reynolds A et al., Lancet 2019;393:434 (abstract): risk reduction greatest at 25-29 g/day; 15-30% lower all-cause/CVD mortality, CHD, stroke, type 2 diabetes, colorectal cancer for highest vs lowest fibre consumers.
NOT READ (to be read before build or dropped): the 21 g / 30 g values for age 51+ (only Coachway says so); DRI primary tables (NIH ODS / NCBI blocked); per-food fiber values (USDA FDC API at build); any ramp-up / water advice; weight-loss claims.

## Page plan (if approved)
Inputs default view: sex (Female default), age, calories (typed OR from height + weight + activity via the existing calorie engine, lb/in default). Result: grams a day (calorie-based 14 g/1,000 kcal, headline) + fixed AI (25 / 38) + typical US intake 17 g for context, bar + day tally. Go advanced: own calories source, custom g/1,000 kcal. YMYL: "for information only"; no medical claims; people with GI conditions ask a clinician (only as disclaimer).
