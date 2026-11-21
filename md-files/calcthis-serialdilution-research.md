# Serial dilution calculator: research report (2026-11-22, session #15), NOT built, waiting for his "Approve all"

## Demand (his Ahrefs screenshots 2026-11-21, dilution research)
`serial dilution calculator` >1000 Easy. Related: `cell dilution calculator` >100 Easy (covered by cells/mL, CFU/mL units + plate-count back-calculation), `solution dilution calculator` >1000 Easy (already served by the live dilution page). ONE page `/serial-dilution-calculator/` in Medication & Lab, after Dilution. Own intent: a series of equal steps and the volumes to pipette, not a single C1V1.

## Competitors opened LIVE 2026-11-22 (7)
1. **Omnicalculator serial dilution**: method Dilution factor | Concentration range; number of dilutions; dilution factor (X:1); starting solution concentration (M to yoctomolar); volume left for each dilution; volume per use; number of uses per dilution; error type (percentage or volume) + percentage error; minimum volume required; outputs starting volume needed, stock concentration, volume of stock required, volume of diluent to add; 22 volume units; share / reload / clear; text on how to do serial dilutions with examples.
2. **AAT Bioquest planner**: method initial concentration + factor | concentration range; stock name, diluent name; stock concentration (uM); initial concentration (cannot exceed stock); dilution factor; final volume of each dilution (uL); number of dilutions; number of replicates; produces a protocol (tube / well list); advice to prepare extra volume for pipetting loss; citation (MLA, APA, BibTeX).
3. **Calculate.co.nz dilution series**: stock concentration, dilution factor, number of steps; final concentration, total dilution, concentration at every step; formula text.
4. **ConductScience planner**: Fold dilution (auto) | custom concentrations; stock concentration with units (M, mM, uM, nM, pM, mg/mL, ug/mL, ng/mL, cells/mL, CFU/mL, PFU/mL, x fold); total volume per tube (uL); presets 1:2 (8 steps), 1:3 (6), 1:10 (6), half-log (1:sqrt 10), 1:5 (6), custom; simple C1V1 = C2V2 box; transfer and diluent volumes with pipetting-accuracy warnings; ready-to-print protocol; download for a lab notebook; text on error compounding and mixing.
5. **Easy Unit Converter**: initial concentration (M, mM, uM, mg/mL, ug/mL), dilution factor (1:X), number of steps, final volume per tube (mL, uL, L); concentration at each step, transfer and diluent volumes; how-to text (Cn = C0 x (1/DF)^n).
6. **dilution.phage.org (Abedon)**: Dilution Planner (goal: deliver to a plate | reduce liquid titer, starting titer pfu/mL or cfu/mL with scientific notation, target, how to get there, 5 steps), Titer from Plate Count back-calculation, exponents / scientific notation / significant figures tabs, citation DOI.
7. **Pearson serial dilution**: initial concentration (label-only unit), dilution per step as factor D | ratio 1:x | transfer / final volume, number of steps, include step 0, step-by-step working, results table, decay curve, final-concentration gauge, significant figures and scientific notation toggles, quick picks.
Not opened: Sigma-Aldrich (403 earlier), Grinnell PDFs (spam).

## Parity list (to map in `md-files/qa/parity/<slug>.json`)
Inputs: stock concentration with units (M to yM ladder, mg/mL, ug/mL, ng/mL, %, cells/mL, CFU/mL, PFU/mL, x); starting (first tube) concentration separate from the stock; dilution factor as factor / 1:X / X:1 / transfer + final volume; number of steps; method concentration range (from X to Y); final volume per tube; volume used per use and number of uses; replicates; pipetting loss / error percentage; minimum volume; stock / diluent names; presets 1:2, 1:3, 1:5, 1:10, half-log; custom list of concentrations; C1V1 single-step box; step 0 toggle; sig figs and scientific notation; plate delivery goal; titer from plate count.
Outputs: concentration at every step; total dilution; transfer and diluent volume per tube; stock volume for the first tube; total stock and diluent needed; protocol list; tube / well labels; pipetting accuracy warning; decay curve and gauge (Pearson); plate-count titer; formulas, worked examples, how-to text; share / copy / print / citation.
Drop candidates needing his quoted sign-off (none dropped yet): cite formats (MLA / APA / BibTeX), lab notebook download, sign-up style sharing; the "Exponents / Scientific notation / Significant figures" teaching tabs (our scientific notation page exists; link instead).

## Differentiators (none of the seven has them)
**Visual (one):** the series DRAWN: a row of tubes (or a 96-well plate row view) to scale, each tube's liquid level = its volume and its colour strength = its concentration (fading by the factor), concentration written on every tube, curved transfer arrows with the volume moved ("transfer 100 uL"), the stock tube at the left, and the "waste/assay use" tick. Pearson draws only a decay curve and gauge; the rest nothing.
**Functional (main):** (1) three ways to define the series that all fill the same table: factor + steps, "from X down to Y" (page finds the factor or the steps), or your own list of concentrations; (2) a volume planner that works BACKWARDS from the last tube: type how much you need in each tube and how much each assay use takes, and the page works out how much each tube must hold (so the transfer after it is covered) plus the stock needed in total, with extra for pipetting loss typed as a percent; (3) a smallest-volume-I-can-pipette box that flags every transfer below it and suggests the factor or the intermediate step that would fix it (arithmetic only, no invented pipette limits); (4) error compounding note: each step's percent error multiplies (user types the error of their pipette; page shows the spread of the last tube); (5) plate-count back-calculation under Go advanced (count / (dilution x volume plated)) so one page covers plan and count back (cell dilution phrase).
Result headline = the concentration of the last tube (or the factor when solving from X to Y); sticky bar shows it.

## Behaviour (design-system rules)
Reuse the dilution page patterns (unit toggles, notes under fields, sticky bar, hint under field), required fields only stock, factor and steps (or X to Y); every field visibly reacts (QA 19); empty start; text >= 14px, SVG text >= 12px; 375px no horizontal scroll; at most 12 tubes drawn (more are listed in the table); concentration units as labels + the SI-prefix ladder converts only within the same kind.

## Sources (READ before build; unread = dropped)
Definition of a serial dilution and the Cn = C0 x (1/DF)^n rule: a textbook source (LibreTexts or OpenStax Microbiology, to read). Plate-count titer formula and countable plate range: OpenStax Microbiology or a university lab manual (to read; the 30 to 300 colonies rule only if the source states it). Pipetting error: no number from competitors is copied; the page takes the user's own percent. Competitor lines (extra volume for pipetting loss, mixing between transfers) quoted only as "other calculators advise", unless a source is read.

## Decisions for him
1. Menu: Medication & Lab, after Dilution (recommended). 
2. Plate-count back-calculation inside this page under Go advanced (recommended: serves "cell dilution calculator", parity with phage.org).
3. Drop MLA / APA / BibTeX citation, notebook download and the maths teaching tabs (recommended).
Overlap: dilution page has a ratio batch table, no series; dup-check against dilution (limit 12%) and cross-links both ways.

## Not verified here
Volumes beyond his screenshots; which competitor ranks first; plate-count and pipetting claims (sources still to read).
