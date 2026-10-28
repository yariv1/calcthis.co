# Turkey calculators — research + decisions (2026-10-28)

Pages: `/turkey-cooking-time-calculator/` + `/turkey-thawing-time-calculator/` — TWO pages (separate search intents/keywords, user rule "SEO & traffic first"), ONE engine (`CalcThis.turkeyEngine`, `CalcThis.initTurkeyCalc`, body `data-tk="cook|thaw"`, ids `tk*`, CSS `.p-turkey`). Generator: `md-files/gen-turkey-pages.js` (all SEO numbers computed from the engine).

**Source of every number:** USDA FSIS "Turkey Basics: Safe Cooking" (325 F, hours by weight, 165 F in thigh/wing/breast, preheating not necessary, stand 20 min) and "Turkey Basics: Safe Thawing" (fridge ~24 h per 4-5 lb, cold water ~30 min per lb, tables, >2 h on counter unsafe). fsis.usda.gov blocks curl/WebFetch (403) but loads in the Browser pane.

**Competitors opened live:** Omni (separate thaw + cook pages; cook: weight, cavity, doneness, speed), Inch Calculator (thaw only: lb/kg, fridge/cold water), Instacart (cook only: 4-24 lb whole numbers, stuffed, doneness). Butterball 404.

**Dropped vs competitor inputs (needs user sign-off — flag in report):** Omni/Instacart "doneness normal/well done" and Omni "slow/normal/fast" — no USDA basis; the USDA range (early end = start checking, late end = plan on) covers it. Oven-temperature adjustment (350/375 F) not built — USDA only gives 325 F; inventing a conversion was rejected.

**Differentiators:** dinner date+time -> backwards plan (thaw start, brine, oven in, check, out, serve), late flag when the fridge cannot finish (suggests cold water), fridge + cold water side by side, whole turkey or breast, kg/lb, guest-count size helper (1-1.5 lb per person, common guideline, not USDA), Thanksgiving/Christmas date chips.
