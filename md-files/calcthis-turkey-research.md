# Turkey calculators — research + decisions (2026-10-28)

Pages: `/turkey-cooking-time-calculator/` + `/turkey-thawing-time-calculator/` — TWO pages (separate search intents/keywords, user rule "SEO & traffic first"), ONE engine (`CalcThis.turkeyEngine`, `CalcThis.initTurkeyCalc`, body `data-tk="cook|thaw"`, ids `tk*`, CSS `.p-turkey`). Generator: `md-files/gen-turkey-pages.js` (all SEO numbers computed from the engine).

**Source of every number:** USDA FSIS "Turkey Basics: Safe Cooking" (325 F, hours by weight, 165 F in thigh/wing/breast, preheating not necessary, stand 20 min) and "Turkey Basics: Safe Thawing" (fridge ~24 h per 4-5 lb, cold water ~30 min per lb, tables, >2 h on counter unsafe). fsis.usda.gov blocks curl/WebFetch (403) but loads in the Browser pane.

**Competitors opened live:** Omni (separate thaw + cook pages; cook: weight, cavity, doneness, speed), Inch Calculator (thaw only: lb/kg, fridge/cold water), Instacart (cook only: 4-24 lb whole numbers, stuffed, doneness). Butterball 404.

**Dropped vs competitor inputs (needs user sign-off — flag in report):** Omni/Instacart "doneness normal/well done" and Omni "slow/normal/fast" — no USDA basis; the USDA range (early end = start checking, late end = plan on) covers it. Oven-temperature adjustment (350/375 F) not built — USDA only gives 325 F; inventing a conversion was rejected.

**Differentiators:** dinner date+time -> backwards plan (thaw start, brine, oven in, check, out, serve), late flag when the fridge cannot finish (suggests cold water), fridge + cold water side by side, whole turkey or breast, kg/lb, guest-count size helper (1-1.5 lb per person, common guideline, not USDA), Thanksgiving/Christmas date chips.

**Update 2026-10-28 (parity round, user: "never fall short of competitors"):** added from USDA "Turkey: Alternate Routes to the Table" — electric roaster (same as oven), covered grill 15-18 min/lb (8-16 lb), smoker 20-30 (8-12), deep fryer 3-5 (8-12), microwave 9-10 (8-14), cook from frozen = +50% (unstuffed whole 8-24 lb, no oven bag). Partly stuffed = midpoint of USDA unstuffed/stuffed (Omni parity, flagged). Below 4 lb = labelled estimate (22.5 min/lb from the 4-6 lb breast row). Weight accepts lb, kg, oz, g and "15 lb 8 oz". Third page: **/turkey-size-calculator/** (Omni: adults, children 0.5 lb, leftovers x1.5; ours adds Go advanced portions/non-eaters, two-turkey split >24 lb, thaw + cook times for the size, one-click hand-off to the cooking page via ?w=&u=). Still dropped (no USDA basis): doneness normal/well, speed slow/fast, partially-thawed time.
