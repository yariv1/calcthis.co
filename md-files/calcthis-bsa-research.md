# BSA calculator — research (2026-11-05) — REPORT PENDING APPROVAL

Ahrefs (his screenshots, calcthis-ahrefs-2026-11.md): `bsa calculator` >1000 EASY (121 kws); `mosteller` / `dubois` variants >100 Easy -> ONE page `/bsa-calculator/`. No existing CalcThis page mentions BSA (grep: 0).

## Competitors opened live (2026-11-05)
- **Omnicalculator /health/bsa**: weight kg/lb/st, height cm/m/in/ft/ft+in/m+cm, result m² or ft²; Du Bois headline, "Additional BSA calculations" = Fujimoto, Gehan & George, Haycock, Mosteller; text on average BSA by age (infant 0.25, 2 y 0.5, 10 y 1.14, women 1.6, men 1.9 — unsourced), 1.73 m² reference, chemo-dosing critique.
- **fitnessvolt.com/body-surface-area-calculator**: US/Metric, sex (only Schlich uses it), height ft+in / cm, weight lb / kg, "formula to show first", ONE example result then a table of eight formulas (Mosteller, Du Bois, Haycock, Gehan & George, Boyd, Takahira, Fujimoto, Schlich) in m² and ft² with the spread (e.g. 1.77-1.87 m², highest 6% above lowest).
- calculator.net has no BSA page (404). MDCalc BSA page redirects to an ideal-weight page (not reachable). The R package `admiral` (CRAN) documents the same formulas.

## INPUT FLOOR (parity or better)
Height cm / m / in / ft+in; weight kg / lb / st; sex (Schlich); formulas Mosteller, Du Bois, Haycock, Gehan & George, Boyd, Fujimoto, Takahira, Schlich; results m² and ft²; choose which formula is the headline.

## DIFFERENTIATORS (proposed)
**Visual:** all formulas as dots on ONE m² scale with the min-max band, the % spread, your chosen headline marked and the 1.73 m² reference line (same ruler technique as the keto/ideal-weight pages) — nobody draws it; competitors give a table.
**Functional:**
1. All formulas at once, click a row to make it the headline (Mosteller by default); each with a one-line "who it was built for" note ONLY where verified (Haycock: validated in infants, children and adults; Schlich: separate male/female equations, 188 subjects).
2. **eGFR de-indexing** (Go advanced): enter the lab's eGFR in mL/min/1.73 m² -> actual mL/min = eGFR x BSA / 1.73 (Australian Prescriber / NPS; needed for drug dosing in large or small people). No competitor does it.
3. **Dose from BSA** (Go advanced): dose per m² x BSA = total dose, plain arithmetic with a clear "follow your protocol" note; ASCO 2012 (Griggs, J Clin Oncol 30:1553): full weight-based dosing with actual body weight in obese adults — read the guideline at build or drop the note.
4. Children and infants supported (weights from 0.5 kg), units carried across switches, ft² output, bedridden/estimate helpers NOT included.
Default view: height + weight (+ sex) -> headline + the spread; everything else behind Go advanced.

## SOURCES (verified vs NOT)
- VERIFIED live: Redlarski G et al., Sci Rep 2016;6:27966, Table 1 (W kg, H cm): Du Bois 0.007184 W^0.425 H^0.725; Takahira 0.007246 W^0.425 H^0.725; Boyd 0.0003207 H^0.3 (1000 W)^(0.7285 - 0.0188 log10(1000 W)); Fujimoto 0.008883 W^0.444 H^0.663; Gehan & George 0.0235 W^0.51456 H^0.42246; Haycock 0.024265 W^0.5378 H^0.3964; Mosteller sqrt(W H / 3600); Schlich men 0.000579479 W^0.38 H^1.24, women 0.000975482 W^0.46 H^1.08. The CRAN `admiral` page agrees on all but Takahira (0.007241 vs 0.007246: a 0.07% difference, under 0.001 m²) — use the Sci Rep value and say so.
- Verified to exist (references in Redlarski): Mosteller NEJM 1987;317:1098; Haycock J Pediatr 1978;93:62 ("validated in infants, children and adults"); Schlich 188 subjects.
- NOT verified yet (read at build or DROP): de-indexing text (secondary: Australian Prescriber/NPS), ASCO guideline wording, "Du Bois reads low under 0.7 m²" and "Fujimoto from 201 Japanese people" (fitnessvolt claims), average BSA by age (Omni, unsourced).

## STATUS 2026-11-05 — BUILT, NOT DEPLOYED (awaiting his preview + "deploy")
- Approved "Approve all". Page `/bsa-calculator/` (ids `bs*`, init `CalcThis.initBsaCalc`, engine `BSA-ENGINE`, block `BSA:BEGIN/END` at the end of app.js, CSS `.p-bsa`, generator `md-files/gen-bsa-page.js`, chained after intermittent fasting).
- Verified live: all coefficients (Redlarski 2016 Table 1); Haycock = 81 subjects premature infants to adults (PubMed 650346 via search); ASCO 2012 actual-body-weight guidance (read on ASCO Post). eGFR de-indexing: wording seen ONLY as a quoted search snippet from Australian Prescriber (the nps.org.au page returned an error, PMC mirror blocked) — flagged on the page.
- DROPPED (no verified source): "Du Bois reads low under 0.7 m²", Fujimoto "201 Japanese people / ages 6+", Omni's average BSA by age, "most protocols round to 2 decimals". Reference line 1.73 m² only drawn when inside the scale.
