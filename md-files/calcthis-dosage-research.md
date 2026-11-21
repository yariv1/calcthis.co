# Dosage calculators: research report (2026-11-22, session #15), NOT built, waiting for his "Approve all"

## Demand (his Ahrefs screenshots 2026-11-21, HANDOFF 2a)
retatrutide dosage calculator >10K Easy; dosage calculator >1K Medium; peptide dosage calculator >1K Medium; tirzepatide / tesamorelin / BPC-157 / PT-141 / ivermectin dosage >1K each; semaglutide dosage and iv drip rate >100 only.

## What the searches show (WebSearch + pages opened LIVE 2026-11-22)
- Every "retatrutide / peptide dosage calculator" is the SAME arithmetic our `/peptide-reconstitution-calculator/` already does: concentration = vial mg / diluent mL, draw mL = dose / concentration, units = mL x 100 (U-100), doses per vial. The retatrutide pages add a drug name, vial presets (5 / 10 / 15 / 20 / 30 / 60 mg) and a titration ladder (1-2 mg stepping to 4 / 8 / 12 mg every 4 weeks) taken from community reports or the phase 2 trial.
- Retatrutide is investigational (phase 3), not FDA approved; there is no product label. Several competitors are vendors (discount codes, "shop retatrutide").
- tirzepatide / semaglutide have approved pens with fixed doses; their "dosage" intent is "what dose", which we must not answer.

## Competitors opened live (every input / mode / output)
1. **Omnicalculator peptide calculator** (health/peptide-dosage): vial capacity (mcg / mg / oz), bacteriostatic water mL, dose (mcg / mg / g), "pull the syringe to ... units", total amount of peptide, optional weight-based dose (weight + dose per kg -> daily dose), unit converters on every field, share result, educational text, 3 sources, FDA peptide definition, research-use warning.
2. **Omnicalculator dosage calculator** (health/dosage): weight (kg / lb), dose per kg (8 mass units incl. grains, drachms), frequency (once a day ... every hour), resulting dose, liquid medicine concentration (6 units), liquid dose in mL, mm3, cm3, fl oz US/UK, cups, tbsp, tsp; text on dosage forms and formulas.
3. **thepeptidecatalog.com retatrutide**: vial 10 / 30 / 60 mg, BAC water 1 / 1.5 / 2 / 3 mL, dose 500 mcg / 1 / 2 mg or typed; draw units, concentration, draw volume, doses per vial and weeks; popular setups with usage counts; "documented protocols" table (starter, standard, advanced); cost calculator and vendor comparison links.
4. **peptideprotocolwiki.com retatrutide**: vial in mg or IU, mode dose -> syringe units or dose + units -> water volume, 10 presets (BPC-157, semaglutide, tirzepatide, ipamorelin, CJC-1295, TB-500 ...), syringe size 0.3 / 0.5 / 1 mL, vial mg 5 / 10 / 15, water 1-5 mL, dose chips, concentration, "pull to X units" on a scale drawing, doses per vial, dosing frequency, 1 mL vs 2 mL table, syringe reference table, community protocols (0.5-4 mg weekly ...), email gate for the supply plan.
5. **peptidedeck.com retatrutide**: simple dose or titration schedule; target maintenance dose 4 / 8 / 12 mg; speed 4 or 6 weeks per step; current week; vial 5 / 10 / 20 / 30 mg; water 1 / 2 / 3 mL; volume, IU on U-100, weeks per vial, to-scale 1 mL syringe, full schedule table with volume and IU per week, over-1-mL warning, vendor discount code.
6. **glp3planner.com retatrutide**: dose-schedule builder (tiers: weeks, dose, days of week), half-life (6 days) drug-level chart and steady state estimate, standard dosage chart (2 / 4 / 8 / 12 mg), login to save.
7. **calculate.co.nz peptide**: vial mg, diluent mL, amount (mcg / mg), syringe U-100 / U-50 / U-30, concentration, volume, reading in units, amounts per vial, total in vial, fits-in-barrel check, worked example, arithmetic-only disclaimer.
8. **peptiq.io dosage**: concentration (mcg/mL) + target dose -> units; links to chart, shelf life table, app.
Not opened / blocked: Rite Aid, Bodybuilding.com pages (search results only), seekpeptides and other blog posts.

## Parity list (to map in `md-files/qa/parity/<slug>.json` at build)
Inputs: vial amount in mg / mcg / IU; diluent mL; dose in mcg / mg / g; syringe U-100 / U-50 / U-30 and 0.3 / 0.5 / 1 mL; weight-based dose (weight + dose per kg); frequency; vial and water chips; typed values; mode "dose + units -> water volume".
Outputs: concentration; draw volume; units on the syringe; doses per vial; weeks per vial; total in vial; fits-in-barrel check; over-1-mL warning; to-scale syringe; 1 mL vs 2 mL water comparison table; syringe units-to-mL reference; schedule table with volume and units per step; vials needed; worked example; share / copy.
Features that REQUIRE his quoted sign-off to drop (they give or imply doses): titration ladders and "documented / popular protocols" (community or trial doses), preset doses for named drugs, half-life drug-level chart, vendor links and discount codes, email-gated plans, saved schedules (login).

## Rules (his, unchanged): arithmetic only; NO recommended doses; every number from a label or primary source I read; never a protocol. A retatrutide page would show NO dose of its own.

## Proposed build (needs his decisions)
ONE page `/retatrutide-dosage-calculator/` in Medication & Lab, built on the peptide reconstitution engine ideas (copy, do not edit the live page).
- **Visual differentiator:** the to-scale syringe (peptide page already has it) plus a timeline of the user's OWN schedule: a bar per step showing units to draw, with the vial emptying across the weeks and the week each new vial is opened. No competitor draws the vial.
- **Functional differentiator:** "Your schedule" builder where the USER types each step (weeks and dose they were given by their prescriber or pharmacy); the page computes concentration, units per step, a warning when a step exceeds the syringe, doses and weeks per vial, vials needed for the whole plan and the leftover. Competitors hard-code the ladder; we compute the user's own. Also: unit-confusion guard (mcg vs mg echo), "ready-made vial / pharmacy label" mode (type the printed mg/mL, no water step), U-100/U-50/U-30 + 0.3/0.5/1 mL, over-volume warnings, 1 mL vs 2 mL water table.
- Titration ladders, protocols, half-life chart, vendors, login: DROPPED (needs his sign-off, recommended: yes drop).

## Conclusions for the other phrases
- `peptide dosage calculator` (>1K Medium): same intent as the existing reconstitution page. Recommend retitling that page ("Peptide Dosage Calculator: Reconstitution & Syringe Units") instead of a new page; his decision (title change on a live page, check Search Console first).
- BPC-157 / tesamorelin / PT-141 dosage: same arithmetic, no new facts we may state -> per-compound pages would be thin duplicates of the same tool (we just fixed thin content). NOT recommended; compound names can be mentioned as text on the peptide page.
- ivermectin dosage (>1K): weight-based dosing of a drug with approved uses and misuse harm; the tool would invite self-dosing. NOT recommended.
- tirzepatide / semaglutide dosage: approved pens, "what dose" intent: NOT recommended.
- `dosage calculator` (>1K Medium): Omni's mg/kg + liquid concentration tool. Our mg to mL page already covers dose from mg/kg x weight and liquid volume; a separate page would duplicate it. Recommend NOT a new page; maybe a "dose from weight" wording section on mg to mL.

## Risks to decide before building
1. **AdSense / policy:** retatrutide is unapproved; many results are vendors selling "research" product. A page that helps people self-inject it could count against the AdSense review (earliest Dec 15) and Google Ads policy on unapproved pharmaceuticals. Our wording would be arithmetic-only with a plain statement that it is investigational and not approved, but the topic itself carries the risk. Recommendation: build it with the strict rules and let him veto at preview; or hold it until after the AdSense decision. His call.
2. Sources still to READ before build: Lilly / ClinicalTrials.gov / a journal abstract for "investigational, not approved"; NIST or a pharmacy source for U-100 syringe definition (1 unit = 0.01 mL, already used on the peptide page); no dose numbers needed.
3. Overlap with the peptide reconstitution page: dup-check limit 12%; cross-link both ways.

## Not verified here
Search volumes beyond his screenshots; which competitor ranks first today; whether Google treats unapproved-drug calculators differently for AdSense (not checked).
