# Intermittent fasting calculator — research (2026-11-05) — REPORT PENDING APPROVAL

Ahrefs (his screenshots): `intermittent fasting calculator` >1000 EASY (35 kws). No existing CalcThis page mentions fasting (grep: 0 pages). One page per intent: `/intermittent-fasting-calculator/`; fasting-hours variants (`16/8 intermittent fasting calculator`, `fasting window`) = same page; `fasting calculator` (listed in his unchecked Diet phrases) would also land here.

## Competitors opened live (2026-11-05)
- **101planners.com** (strongest): 8 methods as cards (12:12, 14:10, 16:8, 18:6, 20:4, OMAD, 5:2, alternate-day) + Custom (10-23 h); anchor = last bite or first meal; 12/24-hour clock; coloured 24-h ring; hour-by-hour "what happens while you fast" timeline from the last bite; tabs Build my plan / Live timer / Help me pick; Copy / Start a fast / Print; optional "Add my details": units, sex, age, height, weight, goal weight, activity (5), goal lose/maintain/gain, pace gentle/steady/firm -> calories + protein + meal timings + weight projection; safety tick boxes (pregnant, under 18, disordered eating, diabetes/medication, underweight); table of every method.
- **fatcalc.com/if-calculator**: protocols 16:8, 18:6, 20:4, OMAD, 5:2, Extended fast 24-72 h, Custom; first-meal time picker (8 AM - 7 PM chips) -> windows + "key metabolic states" estimate; text on electrolytes / refeeding syndrome.
- Not reachable / not relevant: omnicalculator (404 for /health/intermittent-fasting), calculator.net has none, welltech (blog page), hacecuentas (redirected to a baking page). The rest of the search results are anonymous auto-generated pages with only "protocol + start time -> window".

## INPUT FLOOR (parity or better)
Protocols 12:12, 14:10, 16:8, 18:6, 20:4, OMAD, custom hours, 5:2, alternate-day, extended 24-72 h; anchor by last bite OR first meal (also wake-up/bedtime as helpers); 12/24-hour clock; optional body details (sex, age, height, weight, goal, activity, pace) -> calories + protein + meal times; safety questions; copy/print; live "where am I now".

## DIFFERENTIATORS (proposed)
**Visual:** 24-hour clock ring (eating arc vs fasting arc, meal marks, "now" hand) + a 7-day strip for 5:2 / alternate-day with the low days shaded + a ramp chart (window narrowing week by week).
**Functional (nobody offers all of these):**
1. Anchor by ANY of last bite / first meal / wake time + bedtime (e.g. "I wake 6:30, sleep 23:00, stop eating 3 h before bed" -> window), so the window is built around the day, not a guess.
2. **Ramp plan**: a week-by-week schedule from where you are now (e.g. 12:12) to the target (16:8) with the exact first/last meal time each week.
3. Meals placed inside the window with calories and protein per meal (from the deficit/macro engines we already own), and the same window shown for weekdays vs weekends (two schedules).
4. Live "where am I now": enter your last bite -> countdown to break-fast and the phase you are in.
5. Honest-evidence panel: what the trials found (time-restricted eating gave no extra weight loss over eating the same calories — Lowe 2020, Liu 2022), so people do not expect magic; safety tick boxes like 101planners (pregnant, under 18, eating disorder history, diabetes/medication, underweight) that change the result to a warning.
Default view stays minimal (protocol + one time); body details, ramp, weekend schedule behind Go advanced.

## SOURCES (verified vs NOT)
- Verified exists (secondary summaries only, full text NOT read yet): de Cabo & Mattson, NEJM 2019;381:2541 (3 regimens: alternate-day, 5:2, daily time-restricted feeding; metabolic switching); Liu et al., NEJM 2022;386:1495 (139 adults, 8-h TRE added to calorie restriction: 9.0% vs 7.2% weight loss, P=0.11); Lowe et al., JAMA Intern Med 2020;180:1491 (12-week 16:8 vs consistent meal timing, no extra weight loss).
- NOT verified (must read the full text at build or DROP): the hour-by-hour milestones (glycogen, "metabolic switch" at ~12-16 h, ketone levels), 5:2 calorie numbers (500/600 kcal), refeeding-syndrome threshold. Same rule as Keytel / food-group bar: no number without a source.

## STATUS 2026-11-05 — BUILT, NOT DEPLOYED (awaiting his preview + "deploy")
- Approved "Approve all". Page `/intermittent-fasting-calculator/` (ids `if*`, init `CalcThis.initFastCalc`, engine `FAST-ENGINE`, block `FASTING:BEGIN/END` at the end of app.js, CSS `.p-if`, generator `md-files/gen-fasting-page.js`, chained after net carb). Time fields = the Hours/Time calculator DS `.time-field`/`.ap-seg` + 12/24-hour switch; ring + ruler reuse the keto `_kzUtil.ruler`.
- Sources READ live: Anton 2018 PMC5783752 (12-36 h switch, 5:2 = no more than 500 calories two days/week, ADMF <25% energy, TRF typically 8-12 h); Lowe 2020 (PubMed 32986097: -0.94 vs -0.68 kg, between groups -0.26 kg P=.63); Liu 2022 (PubMed 35443107: -8.0 vs -6.3 kg, diff -1.8 kg, 95% CI -4.0 to 0.4, P=0.11).
- DROPPED (no verified source): hour-by-hour milestones beyond the 12-36 h range, ketone levels, electrolytes/refeeding thresholds, protein per meal (calories per meal only; link to the other calculators), non-consecutive-days rule for 5:2. Meals are spread evenly with a stated 45-minute meal (a schedule convention, not a health claim).
