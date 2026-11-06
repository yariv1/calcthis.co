# Weight loss calculator (by date) — research (2026-11-06)

Ahrefs: `weight loss calculator by date` >10K Easy; `weight loss calculator` >10K Hard; `protein weight loss calculator` >1000 Medium.
Existing coverage: /calorie-deficit-calculator/ (Date mode, deficit-first intent) and /calorie-calculator/ (goal weight + pace table). Neither title/H1 says "weight loss". Decision (user, "Yes, build it"): ONE dedicated page /weight-loss-calculator/ = "what do I eat to reach goal weight X by date Y"; retune the other two to avoid cannibalising.

## Competitors opened LIVE
- FatCalc /bwp: Lose/Maintain/Gain, sex, age, activity (1.4-2.3), imperial/metric, height, start weight, goal weight, start date, target date. NIH (Hall) model. Floor 1,200 F / 1,500 M: moves the date. No visuals.
- Alma /calculate/timeline: Plan by goal date or weekly pace, lb/kg, current/goal weight, start date, goal date. Weekly pace + slower-timeline comparison.
- Google SERP (read, not opened): iCliniq, Calorix, FitCraft, forsuccess.today, levelupgym — small single-purpose tools.

## Inputs parity
sex, age, height (cm/in/m), activity (5 levels), weight units (kg/lb/st), current weight, goal weight, target date (picker), plan by date OR pace, "I know my maintenance". Start date: covered by the milestone table (weight on dates along the plan) rather than an extra start-date field.

## Differentiators
Visual: weight-over-time chart (simple vs realistic curve) to the target date, eat/deficit bar, milestone table by date.
Functional: (1) "Fastest safe date" always shown (min of eating floor and 1% of body weight a week) — not a bare error when the date is too aggressive; (2) calories for six target dates side by side (4/8/12/16/26/52 weeks); (3) simple 7,700 rule AND realistic (maintenance falls as you lose) eating numbers shown together; (4) plan by pace with the date it gives; (5) % of body weight lost row (links to the percent weight loss page).

## Sources READ
- CDC "Steps for Losing Weight" (cdc.gov/healthy-weight-growth/losing-weight/index.html, updated 2025-01-17): gradual steady pace of about 1 to 2 pounds a week is more likely to be kept off; a 5% reduction for a 200 lb person is 10 lb and can lower risk of some chronic diseases; "20 pounds in 2 weeks" called unrealistic.
- NHLBI "Aim for a Healthy Weight" (nhlbi.nih.gov/health/heart-healthy-living/healthy-weight, updated 2025-12-11): for people with overweight or obesity, professionals recommend losing 5% to 10% of initial weight over about 6 months; 3-5% lowers triglycerides and glucose.
- 1,200 / 1,500 kcal floor: NOT from a primary source I read — same floors as FatCalc and our calorie deficit page; the page says "commonly used minimums".
- Energy model: 7,700 kcal/kg + maintenance slope from CalcThis.deficitEngine (same as deficit page).
