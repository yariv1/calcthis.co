# Calories burned calculator — research (2026-11-05) — REPORT PENDING APPROVAL

Ahrefs (his screenshots): `calories burned calculator` >1000 Medium (883 kws); `calories burned walking calculator` >1000 Medium (36 kws); `calories burned running calculator` >1000 Medium (23 kws); treadmill / steps / stairmaster / daily >100.

## Competitors opened live
- **calculator.net**: 5 activity categories (Walking/Running/Cycling/Swimming 16, Gym 16, Training+Sports ~25, Outdoor 10, Home+Daily 12; ~80 activities), duration h+min, weight lb/kg (limited 80-350 lb), result = number only. Second tool: distance mode for walk/run/cycle (speed in 6 units or slow/moderate/fast/very fast). Formula time x MET x kg / 200. No age, sex, slope, picture, comparison.
- **Omnicalculator calories burned**: 38 activity groups (emoji list), weight kg/lb, time (h/min/s units), MET shown, outputs energy (kcal/J/kJ/cal), energy per hour, weight loss; mode "compare two activities".
- **Omnicalculator walking**: weight (kg/lb/st), sex, slope -5..+5 %, input any of steps / distance / time / speed, calories + weight lost (Margaria-based).
- **Omnicalculator running**: age, weight, resting heart rate, distance, grade, treadmill tick.
- (Verywell/Healthline/Harvard-chart style pages = static tables, not calculators.)

## Input floor (parity or better)
Activity list >= every calculator.net + Omni activity, weight lb/kg/st (wide range), duration h/min/s, distance + speed/pace in all units, slope -5..+5 (more), sex, age, resting HR (advanced), kcal/kJ, weight lost, compare two activities.

## Differentiators (proposed)
- **Visual:** ranked bar of ~15 activities for the SAME time and weight (what 30 min of each burns, yours highlighted) + food-equivalent strip (slice of pizza, banana ...) + gross vs net stacked bar (resting part vs extra).
- **Functional:** GROSS vs NET calories (competitors show gross, which overstates extra burn because you burn ~1 MET anyway); walking/running by ACSM equations with slope (more accurate than flat MET) and fill-in-any-two of distance / time / pace; reverse mode "how long to burn X kcal"; day tally of several activities with total + effect on weight / link to deficit calculator.

## Page structure proposal (SEO)
Hub `/calories-burned-calculator/` (all activities, compare, reverse, tally) + spokes `/calories-burned-walking-calculator/` and `/calories-burned-running-calculator/` (own head keywords, shared engine, like the average family). Treadmill/steps/stairmaster (>100 only): covered as modes/text, no own pages.

## Sources to verify at build
Compendium of Physical Activities (Ainsworth, 2011 + 2024 update) for METs; ACSM walking/running equations (already used in steps-to-miles).

## STATUS 2026-11-05 — BUILT, NOT DEPLOYED (awaiting his preview + "deploy")
- Approved "Approve all". 3 pages: `/calories-burned-calculator/` (hub: By activity (276 Compendium 2024 activities, typeahead `.st-ta`) + Walk or run), `/calories-burned-walking-calculator/`, `/calories-burned-running-calculator/`. Engine `CBURN-ENGINE` in app.js (block `CBURN:BEGIN/END` at the end), init `CalcThis.initCburnCalc(kind)` (`hub|walk|run`), ids `cb*`, CSS `.p-cb`, generator `md-files/gen-cburn-pages.js` (writes + registers everywhere).
- METs: read live from pacompendium.com (2024 Adult Compendium), all 276 values cross-checked by script against the site (3 name-mismatch false alarms verified by hand). Formula kcal/min = MET x 3.5 x kg / 200. Walk/run by speed + incline: ACSM equations. Personalised option = Mifflin-St Jeor resting rate x MET. Foods = USDA FDC SR Legacy per 100 g x portion.
- DROPPED (no verified source): heart-rate method (Keytel coefficients could not be confirmed), downhill ACSM term (no verified negative-grade coefficient; downhill walking/running only as Compendium list entries). calculator.net's own walking-by-distance number (218 kcal for 4 km/h x 5 km x 70 kg) is LOWER than ours (ACSM) — different method, not matched.
