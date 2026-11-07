# Vitamin D calculator (+ IU to mcg) — research report (2026-11-07, NOT built, waiting for "Approve all")

Ahrefs (his, 2026-11-06): `vitamin d calculator` >100 Easy; `vitamin d iu to mcg` >100 Easy (+ "conversion" >100); `vitamin d3 calculator` <100 Easy. Decision on file: ONE page `/vitamin-d-calculator/` with IU <-> mcg built in (title carries both phrases).
Overlap: no vitamin / supplement page on the site except creatine, caffeine, fiber (dup-check after building); the unit-converter family has no vitamin D IU pair.

## Competitors opened LIVE (built-in browser, rendered inputs read)
| Site | Inputs | Output |
|---|---|---|
| Omnicalculator `/health/vitamin-d` | Age (yrs/wks/mos/yrs+mos), "Do you know your serum level?" No/Yes, height, weight -> BMI (serum level when Yes) | Endocrine Society style: "adults 18-50 at least 600 IU"; "1500-2000 IU may be needed to raise the blood level above 30 ng/ml"; deficiency <20 ng/mL (50 nmol/L), insufficiency 21-29 |
| GetHealthyCalculators `/vitamin-d-calculator` | kg/lb weight, "I know my blood level (ng/mL)", target level (default 50), skin tone Fitzpatrick 1-6, minutes of midday sun | maintenance 1,000-4,000 IU by weight bands, correction = deficit x kg x 100 IU spread over 8 weeks, sun adjustment (no primary source shown) |
| GrassrootsHealth D*calculator `/dcalculator/` | serum known Yes/No, weight lb/kg, current supplement amount IU/mcg, current serum ng/ml or nmol/L, desired serum (panel: 40-60 ng/ml = 100-150 nmol/L) | dose to reach target (their model; references only) |
| GrassrootsHealth `/mcg-iu-converter/` | value, direction mcg->IU / IU->mcg | one number, no context |
Nobody: shows RDA and upper limit side by side by age, totals several supplements against the limit, handles weekly capsules, or offers a UK standard.

## Inputs parity
- Age: **kept** (age bands). Pregnancy/breastfeeding: **kept** (RDA same, flag).
- Current supplement amount IU/mcg (GrassrootsHealth): **kept**, as a tally of several supplements.
- Serum level units ng/mL <-> nmol/L: **kept as a plain unit converter** (x2.5, both pairs read live: 20 ng/mL = 50 nmol/L Omni; 40-60 ng/mL = 100-150 nmol/L GrassrootsHealth). No verdict.
- Height / weight / BMI, serum-based dosing, target level, skin tone, sun minutes: **dropped, needs his sign-off** — they all output a clinical treatment dose. The Endocrine Society numbers (600 IU / 1500-2000 IU / 30 ng/mL) were read only second-hand (Omnicalculator); I read the guideline abstract only (no numbers); GetHealthyCalculators' formula and sun table have no source; GrassrootsHealth's model is not readable. Unsourced = dropped; clinical dose = liability.

## Differentiators
- **Visual:** a dose scale bar: your total per day as a filled bar against a RDA tick and an upper-limit (UL) tick, zones in DS colours: below the RDA / between RDA and UL / above the UL. Neutral wording, never "deficient"; above the UL = "ask a clinician".
- **Functional:** (1) IU <-> mcg live in the amount field (inline IU | mcg toggle shows the other unit); (2) several supplements added together (drops + multivitamin + capsule) against the UL; (3) per day | per week toggle (a 50,000 IU weekly capsule = average per day); (4) US (IOM via NLM MedlinePlus) | UK (NHS) standard toggle; (5) serum ng/mL <-> nmol/L converter under Go advanced; (6) conversion table 400 / 600 / 800 / 1,000 / 2,000 / 4,000 IU.

## Sources — READ (2026-11-07)
- MedlinePlus (NLM) vitamin D page, reviewed 1/21/2025 (editorial update 08/12/2025), reviewers David C. Dugdale MD et al.: RDA/AI: 0-12 months 400 IU (10 mcg) AI; 1-13 y 600 IU (15 mcg); 14-18 y 600 (15); 19-70 y 600 (15); over 70 y 800 IU (20 mcg); pregnancy + breastfeeding 600 IU (15 mcg). UL: 0-6 months 1,000 IU (25 mcg); 7-12 months 1,500 IU (38 mcg); 1-3 y 2,500 IU (63 mcg); 4-8 y 3,000 IU (75 mcg); 9+ y 4,000 IU (100 mcg). BHOF 800-1,000 IU for age 50+ (mention only).
- Linus Pauling Institute RDA table (first 100k characters read): same RDA values, 10 mcg = 400 IU etc.; RDA set 2010 by FNB/IOM; UL section not read. Harvard Nutrition Source (last reviewed March 2023): RDA 600 IU (15 mcg), 800 IU (20 mcg) over 70, UL 4,000 IU (100 mcg) for 9+.
- NHS (reviewed 3 August 2020): 10 mcg (400 IU) a day for children from 1 year and adults; babies 8.5-10 mcg; supplement from autumn and winter, all year for at-risk groups; upper limit 100 mcg (4,000 IU) adults, pregnant/breastfeeding, older people and ages 11-17; 50 mcg (2,000 IU) ages 1-10; 25 mcg (1,000 IU) under 12 months.
- Conversion 1 mcg = 40 IU: stated as a rule only by secondary pages (Natural Medicines chart citing the FDA guidance, search snippets); every read official page pairs 10 mcg = 400 IU, 15 = 600, 20 = 800, 25 = 1,000, 50 = 2,000, 100 = 4,000 (all exactly x40). FDA guidance page itself returned 404; NIH ODS 403 and NCBI bot challenge (not bypassed). The page says the factor is implied by the pairs.
- Endocrine Society 2011 guideline abstract (Europe PMC): recommends supplementation and 25(OH)D testing for at-risk people; no numbers in the abstract -> nothing from it is shown as a number.
- NOT used: any treatment/loading dose, deficiency thresholds as verdicts, sun/skin-tone synthesis numbers, food amounts (ODS blocked).

## Plan if approved
`/vitamin-d-calculator/` — engine `VITD-ENGINE` + init `initVitDCalc` (ids `vd*`), css `.p-vd`, generator `md-files/gen-vitamind-page.js` (chain after creatine-calculator), QA fixture + independent oracle, QA gate, UI check, preview. Title idea: "Vitamin D Calculator — IU to mcg, RDA and Upper Limit" (<=60).
