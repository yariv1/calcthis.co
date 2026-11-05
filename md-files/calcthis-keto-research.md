# Keto + Net carb calculators — research (2026-11-05) — REPORT PENDING APPROVAL

Ahrefs (his screenshots, calcthis-ahrefs-2026-11.md): `keto calculator` >1000 Medium (290 kws); `net carb calculator` >1000 EASY; `carb calculator` >1000 Hard (skip as own page; keto page covers carb cap in text); carb for diabetics / weight loss >100 Easy.
Existing on site: macro calculator + blog "how to calculate your macros" only mention keto in passing (no keto or net-carb page).

## Competitors opened live (2026-11-05)
- **calculator.net**: no keto / net-carb page (404). Has only the generic carbohydrate-style tools.
- **Omnicalculator net carbs**: per serving OR per 100 g; USA/Canada yes/no (label convention); total carbs, fiber, sugar alcohol (g); optional "more specific sugar types"; servings consumed -> total net carbs + kcal from net carbs. Formula total - fiber - sugar alcohol/2. No picture, no daily limit.
- **Omnicalculator keto**: sex, height, weight (many units), age, activity (6 levels), calories (override), target weight, diet pace normal/strict (0.5/1 kg per week), editable fat/carb/protein % (default 70/5/25) -> grams + kcal. No picture.
- **InchCalculator net carb**: total carbs, fiber, sugar alcohol -> net. Formula text (erythritol exception, glycerin, USDA label policy). Tiny tool.
- **keto-calculator.ankerl.com** (best keto tool): sex, weight, height, birth date, activity (4 + custom kcal), body fat % (estimated), carbs default 25 g (20-50), protein min/chosen/max from lean mass, calorie deficit slider (fat is what is left), results kcal + g + %, food-comparison hints, share link / reddit post.
- **lowcarbspark keto macro calculator**: classic vs advanced, goal lose/maintain/gain, deficit or surplus, net carb choice, protein choice, email results.

## INPUT FLOOR (parity or better)
KETO: sex, age (or date of birth), height, weight with lb/kg/st, units, activity level, goal lose / maintain / gain, deficit or surplus size, daily net-carb cap choice (20 / 25 / 30 / 50 g + custom), protein choice (min / middle / max), body fat % (optional, Katch-McArdle), target weight, kcal override, editable percentages, results in g + kcal + %.
NET CARB: total carbs, fiber, sugar alcohol (g), per serving or per 100 g, servings eaten, US vs EU/other label convention, sugar alcohol by type, kcal from net carbs.

## DIFFERENTIATORS (proposed)
**Visual**
- KETO: stacked energy bar fat / protein / carbs with the carb cap marked; "your 20-50 g of carbs" bar showing where a day of carbs goes (vegetables / nuts / treat) as a budget; protein range bar min - chosen - max.
- NET CARB: bar for the food label: total carbs split into fiber / sugar alcohol that is not counted / net carbs that count, in the same colours.
**Functional**
- NET CARB: sugar alcohols by TYPE (erythritol etc. do not count, maltitol counts mostly) instead of one blunt "divide by 2"; shows the **conservative AND the optimistic net value side by side**; US vs EU label switch (EU labels already exclude fiber); per serving / per 100 g + servings; **a day tally** of foods eaten with a progress bar against the daily limit (20 / 25 / 50 g) and "carbs left today" — nobody offers this; plain-words note about diabetics (net carbs can understate insulin need).
- KETO: macros in one view with grams per meal (2-5 meals), carb cap presets with who each suits, protein from lean mass range, deficit target by date or pace, link to the calorie deficit calculator and the net carb page; Go advanced = body fat %, custom percentages, kcal override.

## PAGE STRUCTURE (SEO, one page per intent)
1. `/keto-calculator/` — daily keto macros (head `keto calculator`).
2. `/net-carb-calculator/` — label maths + day tally (head `net carb calculator`, Easy, highest chance of ranking). Cross-linked both ways and to macro, calorie deficit, TDEE, protein intake.
(`carb calculator` Hard = skip as page.) Shared engine in app.js (like average family).

## SOURCES TO VERIFY AT BUILD (named + dated, never guessed)
Mifflin-St Jeor (already in bmrEngine), Katch-McArdle; carb cap 20-50 g (ketogenic-diet reviews, e.g. Volek/Phinney, Evert 2019 ADA consensus); protein range g/kg lean mass (ISSN / ketogenic reviews); fiber not digested; sugar alcohol energy values per type (EU Regulation 1169/2011 Annex XIV: erythritol 0 kcal/g, polyols 2.4 kcal/g; FDA label guidance); USDA/FDA net-carb label policy; US vs EU labelling of fiber (FDA 21 CFR 101.9 vs EU 1169/2011). Any sugar-alcohol factor without a source gets dropped, as with Keytel in calories burned.
Health note on pages: keto is not for everyone (type 1 diabetes, pregnancy, kidney disease, medications) — consult a doctor; informational, not medical advice.

## STATUS 2026-11-05 — DEPLOYED v314 (commit 8e32f0b7)
- Approved "Approve all". Pages `/keto-calculator/` (ids `kz*`, init `CalcThis.initKetoCalc`, engine `KETO-ENGINE`) and `/net-carb-calculator/` (ids `nc*`, init `CalcThis.initNetCarbCalc`, engine `NETCARB-ENGINE`); block `KETO:BEGIN/END` at the end of app.js, CSS `.p-kz` at the end of style.css, generator `md-files/gen-keto-pages.js` (writes + registers everywhere, chained after calories-burned running).
- Verified sources: Volek et al., Nutrients 2021;13:3299 (20-50 g carbohydrate/day, protein 1.2-2.0 g/kg ideal/adjusted body weight, typically 1.2-1.5; PMC8537012 read live); Livesey, Nutr Res Rev 2003;16:163 (GI erythritol 0, xylitol 13, sorbitol 9, maltitol 35 — abstract read live); EU 1169/2011 Annex I + XIV (via legislation.gov.uk search results: carbohydrate includes polyols, fibre separate; 4 / 2.4 / 2 / erythritol 0 kcal/g); Mifflin, Katch-McArdle (bmrEngine), Devine IBW (formula from the site's ideal-weight calc, not re-read).
- DROPPED vs report (no verified source): food-group carb budget bar (vegetables/nuts/treat), protein by lean mass (only secondary sources), mannitol/lactitol/isomalt types (GI not confirmed from the abstract text; mannitol 0 / lactitol 6 / isomalt 9 appear in it but were not offered). "Other / mixed" = half (convention, cited as such).
- Fixed on the way: unit-switch no longer turns an invalid value into a plausible one (kzW/kzHt/kzTarget cleared when invalid; same fix applied to the live calories-burned weight field `cbW`).
