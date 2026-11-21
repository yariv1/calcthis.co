# mg to ml calculator: research report (2026-11-21), NOT built, waiting for his "Approve all"

## Demand (his Ahrefs screenshots 2026-11-21)
- `mg to ml` >10,000 Easy (bare phrase, no "calculator": people expect Google to show the tool)
- `mg to ml conversion`, `mg to ml drug conversion`, `mg to ml calculator`, `10 mg to ml`, `2.5 mg to ml`, `1 mg to ml`, `50 mg to ml`: all >1,000 Easy; `500 mg to ml` >100; `convert mg to ml calculator` >100
- One page, titled and built as "mg to ml" (converter first). Value-specific phrases = a clickable table on the same page, no own pages (one intent = one page).

## Competitors opened LIVE 2026-11-21 (Omnicalculator, CalculateQuick, Inch Calculator, Calculator.academy)
Every input / mode / output they show:
- **Omnicalculator** (omnicalculator.com/conversion/mg-to-ml, updated Sep 28 2026): liquid select (Water, Milk, Cooking oil, Medications, Other); medication list (Acetaminophen 10 mg/mL, Amoxicillin 400 mg/5 mL, Benadryl oral 12.5 mg/5 mL, Benadryl injection 50 mg/mL, Cetirizine 1 mg/mL, Ibuprofen oral 100 mg/5 mL and 50 mg/1.25 mL, Ibuprofen injection x2, Morphine 20 mg/mL, Testosterone 200 mg/mL, Custom); concentration units (mg/mL, g/L, mg/L, ug/L, ug/mL); dose units (ug, mg, g); volume units (mm3, cm3, mL, L, US fl oz, UK fl oz, tbsp, tsp, cc); works both ways; share, reload, clear; formula text, water 1000 mg/mL, milk 1035, oil 916; doctor disclaimer. No picture.
- **CalculateQuick**: concentration box (label) + chips 1/5/10/50 mg/mL; two linked fields mg and mL, rounded + exact value; decimals 0/2/3/4; recent conversions history; formula, cite, embed, share; teaspoon equivalent under the result; three-variable table (dose+conc -> volume, volume+conc -> dose, dose+volume -> concentration); label-reading text (250 mg/5 ml = 50 mg/ml); common liquid medicine table; household measures (1 tsp = 5 ml, 1 tbsp = 15 ml); water/oil/ethanol/honey densities; worked examples (ibuprofen, amoxicillin, lorazepam IV); mg/mcg/g explanation. No picture.
- **Inch Calculator**: direction tabs; "Substance or Liquid" dropdown with ~110 items (17 medicine labels incl. acetaminophen x4, amoxicillin x3, azithromycin x2, cefdinir x2, cephalexin x2, ibuprofen x2, Benadryl; plus foods, flours, spices); weight in mg; result in mL; density formula (g/mL x 1000); table of 22 mg values x 5 substances; chemistry/cooking text; references. No picture.
- **Calculator.academy** (mg-to-ml-calculator-2, updated Oct 20 2026): "Solve for" = Mass to mL / Stated mg/kg to mL / mL to mass / Concentration; basis = Product label strength or Non-medicine density; label format = mg per mL or mg per stated mL; dose units mg / mcg / g; optional settings (nearest syringe mark); density table (14 substances); label-strength example table; definition text; FAQ. No picture.

## What nobody does (our differentiators)
- **Visual:** a to-scale syringe drawing (same technique as our peptide page syringe) with the dose filled to the exact mark and the nearest readable mark flagged; auto-picks 1 / 3 / 5 / 10 mL size; for oral doses a measuring spoon / dosing cup strip (tsp, tbsp). Plus the label drawn as a strength bar ("250 mg in 5 mL = 50 mg per mL"). None of the four draws anything.
- **Functional:** (1) type the label the way it is printed ("250 mg per 5 mL"), no mental division; (2) any two of dose, volume, concentration give the third (CalculateQuick has the table only; Calculator.academy has modes, no live linking); (3) mcg / mg / g confusion guard: always echo "500 mcg = 0.5 mg"; (4) warns when the volume is too small to measure (<0.1 mL oral) or larger than the syringe, and shows the nearest readable mark; (5) clickable table "1, 2.5, 5, 10, 50, 500 mg to ml" at common strengths, which captures the long-tail phrases; (6) doses per bottle and days a bottle lasts (Go advanced).
- Parity with competitors: both directions, all dose / volume units incl. tsp, tbsp, cc, fl oz; concentration in mg/mL, g/L, ug/mL, mg per N mL; density mode for water, milk, oils, syrups (named densities); decimals + exact value; common-medicine label table. Any dropped feature needs his quoted sign-off.

## Rules for the build (medication = highest care)
- Every concentration preset must come from a product label I have READ (DailyMed or the maker). Competitors' lists are not a source; unverified rows are dropped.
- No recommended doses anywhere. Arithmetic only. Clear note: check the label and ask a pharmacist.
- Sources to read before building: DailyMed labels for the presets, FDA guidance on dosing devices and the 2011 infant acetaminophen concentration change (CalculateQuick claim, unverified), NIST for 1 tsp = 5 mL and density values.
- Menu: new group "Medication & Dosage" (mg to ml, later peptide reconstitution, dilution, dosage). Not buried in the 40-item Health column.
- Gate order: run.js, viewed.js, final.js, preflight.js, parity file, then preview. Overlap check vs the peptide page (same syringe idea) with dup-check.
