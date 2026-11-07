# Creatine calculator — research report (2026-11-07, NOT built, waiting for "Approve all")

Ahrefs (his, 2026-11-06): `creatine calculator` >100 Easy (variants for men / women / by weight / loading phase / 0.1 g per kg all <100). The ">1000 Easy" row "how much water should i drink on creatine calculator" is a question phrase -> a section on the page, not a page. One page: `/creatine-calculator/`.
Overlap: no creatine page on the site (checked vitamins research); closest = protein-intake, water-intake, macro. Run `node md-files/dup-check.js` after building.

## Competitors opened LIVE (built-in browser, rendered inputs read)
| Site | Inputs on the page | Output / extras |
|---|---|---|
| Coachway `/tools/creatine-dosage-calculator/` | Units (lb/kg), body weight, loading approach (skip loading / load then maintain) | maintenance 3 g (0.03 g/kg floored at 3, cap 5), loading 0.3 g/kg in 4 servings, days to saturation, lookup table by weight, ChatGPT prompt for coaches |
| GetHealthyCalculators `/creatine-calculator` | Imperial/Metric, body weight, protocol phase (loading / skip loading / maintenance only), checkbox "already taking creatine" | dose + saturation timeline + monthly cost (~$0.05/g), cites ISSN + Hultman 1996 |
| freecreatinecalculator.com | kg/lb weight, activity level (5), primary goal (5 incl. vegan/vegetarian, cognitive), creatine type (monohydrate / HCl), phase focus (auto / loading only / maintenance only), body fat % (optional), live results | 7-day loading plan, hydration target, share |
| myproteincalc.com `/creatine-calculator` | kg/lb weight, protocol (no loading / loading) | loading vs no-load comparison, worked example, timing |
| FatCalc `/creatine-calculator` | Imperial/Metric, body weight, phase (loading / maintenance) | ISSN text, 4-5 doses ~4 h apart |
| Bodybuilding.com tool | URL 404 (page removed) — not usable | (<120 lb 3 g, 121-200 5 g, >200 8 g seen only in a SERP snippet; NOT used) |

All of them = a bare number (or text). Nobody draws saturation over time, nobody plans to a date, nobody does the tub/cost math with the user's own tub.

## Inputs parity (competitor fields vs ours)
- Weight + kg/lb, loading vs skip loading, maintenance-only / "already taking": **kept** (default view).
- Cost per month (GetHealthyCalculators): **kept**, as a tub calculator under Go advanced (own tub size + price).
- Activity level, goal, creatine type (HCl), body fat %, vegan: **dropped, needs his sign-off** — the ISSN position stand (read) gives no dose that depends on them (dose is body weight only; HCl and other forms have no dose in a source I read; vegetarian baseline is lower per Fig. 4 but no dose). Inventing multipliers = guessing. A line on the page says creatine monohydrate is dosed by body weight.

## Differentiators
- **Visual:** live "muscle creatine stores" curve over days: load-then-maintain vs straight daily dose vs no creatine, with the 60-80% saturated diet starting point, the 5-7 day and 28-day markers, and the 4-6 week return to baseline after stopping. Curve SHAPE between the sourced points is schematic (said on the chart).
- **Functional:** (1) "Be saturated by …" date: pick the date (a competition, trip, training block) -> start date for loading and for the 3 g/day route; (2) tub math: tub grams + price + grams per scoop -> days it lasts, scoops per day, cost per day/month, reorder date; (3) the day-by-day loading schedule (4 doses) as a table, then the switch day; (4) short-term water retention answered as a section (ISSN: ~0.5-1.0 L, about the acute weight gain) = the ">1000" question phrase, no invented litre target.
- Go advanced: maintenance 3 / 5 / 5-10 g, loading length 5-7 days, doses per day, tub + cost + start/target date.

## Sources — READ (Europe PMC full text PMC5469049, ISSN position stand, Kreider et al., J Int Soc Sports Nutr 2017;14:18)
- Normal diet 1-2 g/day -> muscle creatine ~60-80% saturated; supplementing raises muscle creatine/PCr by 20-40%.
- Most effective: 5 g creatine monohydrate (approximately 0.3 g/kg body weight) four times daily for 5-7 days. (Printed wording is ambiguous per dose vs per day; 4 x 5 g = 20 g/day = ~0.3 g/kg/day for ~70 kg, so the page uses 0.3 g/kg per DAY like every competitor and says so.)
- Maintenance once saturated: 3-5 g/day; larger athletes may need 5-10 g/day.
- Alternative: 3 g/day for 28 days = gradual rise, less performance effect until saturated.
- After stopping: 4-6 weeks to return to baseline; no evidence of lowered natural synthesis.
- Carbohydrate or carb + protein with creatine -> more consistent retention.
- Fluid retention on loading ~0.5-1.0 L, proportional to acute weight gain.
- Safety: up to 30 g/day for 5 years safe and well tolerated in healthy individuals; 5-10 g/day for 21 months no clinically significant change in renal markers (collegiate football players); habitual ~3 g/day suggested over a lifetime.
- Competitor-quoted, NOT read by me: Hall & Trojian 2013 "loading not required" (FatCalc quote), Hultman 1996 (cited inside ISSN, source 7).
- NOT used (no read source): any kidney-disease dose, pregnancy dose, children dose, HCl dose, activity/goal multipliers, hydration litres.
- Page disclaimer: for information only, not medical advice; people with kidney disease, pregnant, on medication -> ask a clinician (Coachway/GHC wording; no number given).

## Plan if approved
Engine `CREATINE-ENGINE` + init `initCreatineCalc` (ids `cr*`), css `.p-cr`, generator `md-files/gen-creatine-page.js` (chain after fiber-calculator), QA fixture + independent oracle, QA gate PASS, UI check at 375px, preview link only.
