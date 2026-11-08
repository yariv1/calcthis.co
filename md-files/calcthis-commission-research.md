# Commission calculator — research report (2026-11-08, NOT built, waiting for his approval)

Ahrefs (his): `commission calculator` >1000 Medium (681 kws); `realtor commission calculator` >1000 Easy; real estate commission >100 Easy; real estate agent >100 Medium; sales commission >100 Medium (roadmap v2 §12 #5).
SERP check (web search 2026-11-08): `commission calculator` = Planetcalc, Yotpo, Omni, GigaCalculator, calculator.net, Good Calculators, miniwebtool (generic sales tools). `realtor commission calculator` = Houwzer, Omni real-estate, Inch Calculator, RentSpree, Clever, RealEstateWitch, brokerage blogs (a different set, seller/home-sale intent) -> TWO intents, TWO pages, one shared engine.

## Competitors opened LIVE (built-in browser, 2026-11-08)
| Site | Inputs | Output / extras |
|---|---|---|
| calculator.net `/commission-calculator.html` | Simple: Sales price, Commission rate, Commission (any two). Tiered: sales price, "base commission? Yes/No", "varies with price? Yes/No", tier table From / To / % and/or $ (8 rows) | the missing value; tiered total; text on commission-only, base salary + commission, tiered (20,000 x 3% + 5,000 x 5% + 2,000 x 10% = 1,050) |
| Omni `/finance/commission` | Sale price (currency, 21), Commission %, Commission amount (any two) | "Sale price ± commission" (seller pays = price minus commission, buyer pays = price plus commission) |
| Omni `/finance/real-estate-commission` | House price, Commission %, Commission amount, currency | Owner receives; text 4%-6% |
| Inch `/real-estate-commission-calculator/` | Sale price, Commission rate, Closing costs % | Amount to seller, commission, closing costs; text: 5-6% typical (Redfin), BLS median agent ~$48K |
| GigaCalculator `/commission-calculator.php` | Mode (Sales commission / Realtor commission), Sales, Commission rate (or commission amount -> rate) | amount or rate; realtor mode: who pays (seller / buyer / both) |
| Yotpo `/tools/commission-calculator/` | Currency, Global fee %, Fixed deduction, list of sale items (description, amount, rate %) + "Add Sale Item" | Total sales, gross commission, fees, fixed deduction, NET commission |
Houwzer (blog, brokerage marketing, 5.7% default, savings vs flat fee) and RentSpree / Clever (blog posts) read as ads, not tools.
Nobody shows tiered commission as a picture, nobody combines multiple sales + tiers + base + split in one view, and no tool shows "what I take home" after the agent/broker split, fees and draw.

## Inputs parity (union)
- Sales price, commission rate, commission amount (any two) — calculator.net, Omni, Giga, planetcalc.
- Tiered table (From / To / % or $ per tier), base amount, "varies with price" — calculator.net.
- Several sales as rows (description, amount, rate) — Yotpo; global fee %, fixed deduction (draw / expense) — Yotpo.
- Who pays: seller (price minus commission) / buyer (price plus commission) — Omni, Giga.
- Real estate: closing costs % — Inch; owner receives — Omni; typical rate text 4-6%.
- Currency selector — Omni (his rule: copy `mkCur` as `cmCur`).
- Dropped (needs his sign-off, none proposed): none.

## Differentiators
- **Visual:** a "where the sale price goes" bar for the sale (or a tier ladder bar for the tiered plan): each tier a stripe with its rate and the commission earned in it, marker for "you are here", so "10% above $25,000 means only the part above" is seen, not read.
- **Functional (1):** ONE page, five plan types as chips: Flat % / Base + % / Tiered (marginal) / Tiered (whole amount at the reached tier) / Per-unit flat $; plus any-two-of-three for the flat plan (price, rate, amount).
- **Functional (2):** multiple sales as rows, base + total, fees %, fixed deduction, a SPLIT (company/agent share %, e.g. 70/30) -> "your take-home commission" next to gross; and a reverse goal: "I want to earn $X -> sales needed" (solved through the tiers).
- Click-to-use ladder: sales volumes 25% / 50% / 100% / 150% of your target with commission at each; plain words for tier gaps / overlaps / rate over 100%.

## Realtor page (separate, same engine; `/realtor-commission-calculator/`)
Home price, total commission %, split listing / buyer's agent (50/50 default typed by the user, not asserted), who pays (seller / buyer / both, Giga), agent's brokerage split (typed %), closing costs % (Inch), mortgage payoff -> net proceeds bar, "what each 0.5% costs on your price" ladder. No invented state averages (no readable primary source); the 4-6% range quoted with Omni/Redfin named as the source, labelled secondary.

## Formulas (arithmetic, no source risk)
commission = sales x rate/100; rate = commission / sales x 100; marginal tiers: sum over tiers of (min(sales, to) - from) x rate; whole-amount tiers: sales x rate of the reached tier; base: base + commission; net = gross x (1 - fee%) - fixed; take-home share = net x split%; sales needed = inverse of the (piecewise-linear) tier function, solved per tier. Undefined: sales 0 (rate), rate > 100%, overlapping tiers -> hint, never blank.

## Edge rules / QA
Any two of three round trip; tier gaps/overlaps hinted; blank "To" = no upper limit; optional rows (base, fees, split, goal) never hide the result; every field visibly reacts (QA item 19); oracle = independent brute-force over tiers, goal solver checked by forward round trip.

## Plan if approved
`/commission-calculator/` (title idea <=60: "Commission Calculator — Sales, Tiered & Split Commission"), then `/realtor-commission-calculator/`. Engine `COMMISSION-ENGINE` (reuse `salesEngine.parse`), init `initCommissionCalc` (ids `cm*`, block `COMMISSION:BEGIN/END`), css `.p-cm`, generators `gen-commission-page.js` (chain after discount) and `gen-realtor-page.js`. Cross-link with discount, markup, profit margin, percentage, salary, overtime, sales tax.
Open decision for him: build the realtor page in the same pass (recommended: SERPs differ, Ahrefs >1000 Easy) or after the main page.
