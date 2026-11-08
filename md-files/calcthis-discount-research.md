# Discount / percent off calculator — research report (2026-11-08, NOT built, waiting for his approval)

Ahrefs (his): `percent off calculator` >10K Medium; `discount calculator` >10K Medium; percentage discount >1000 Medium, double/triple discount, with tax (roadmap v2 §12 #3-4).
SERP check (web search 2026-11-08): both head phrases return the SAME sites (Omni, GigaCalculator, miniwebtool, easyunitconverter, vedantu, geeksforgeeks) -> ONE page `/discount-calculator/`; "percent off" goes in the title and H1 line. Omni itself keeps two pages but they are near-identical tools.
Site overlap: `/percentage-calculator/`, `/percentage-change-calculator/` (percent decrease), `/sales-tax-calculator/`, `/markup-calculator/` (discount under Go advanced there is the seller's view). This page is the SHOPPER's view (price after discount, what you save). Run `node md-files/dup-check.js` after building.

## Competitors opened LIVE (built-in browser, 2026-11-08)
| Site | Inputs | Output / extras |
|---|---|---|
| calculator.net `/percent-off-calculator.html` | Original price, Percent off, Final price, Saved (any two) + "stackable additional discount? Yes/No" | the rest; text explains 20% then 15% = 32% not 35% |
| Omni `/finance/discount` | Deal type dropdown (10): % off, % off on 2nd product, % off on 3rd product, fixed amount off, 2 for 1, 3 for 2, 4 for 3, double discount, triple discount, on multiple units; original price, discount, tax included Yes/No; currency (21) | After discount, You pay, You're saving; long text; links to margin / markdown / unit price |
| Omni `/finance/percent-off` | Original price, percent off, "add second stackable percent off", sales tax | final price, savings; Black Friday text |
| GigaCalculator `/discount-calculator.php` | type (% off, % off second / third product, fixed amount, 2 for 1, 3 for 2), original price, discount | final price + savings; long guide |
| miniwebtool `/discount-calculator/` | mode (Simple, Stacked, Buy X Get Y Free), quantity, type (% or fixed), value, optional sales tax %, presets 20/25/30/50%, 20%+10%, B1G1, B2G1 | pie chart (pay vs save) + receipt-style steps; tax on the discounted price |
Search results also show tool-only pages with the same thin set. Nobody compares two offers side by side ("30% off vs $25 off vs buy 2 get 1"), nobody shows the effective total percent across any number of stacked discounts as a picture, and tax handling differs (Omni tax-included toggle vs miniwebtool tax after).

## Inputs parity (union of competitors)
- **Default view (type any two, the rest fill):** Original price, Percent off, Final price, You save (calculator.net) — original price pinned like the cost on markup/profit margin pages.
- **Stacked discounts (default, below the boxes):** "Add another discount" rows (any number, each % off or amount off, applied one after another) — covers double / triple discount, coupon on a sale (calculator.net, Omni, miniwebtool). Shows the EFFECTIVE total percent ("20% then 15% = 32%, not 35%").
- **Deals (Go advanced):** Buy X get Y free (2 for 1, 3 for 2, 4 for 3, B1G1 = X, Y typed), % off the 2nd / 3rd item (Omni, Giga), quantity (Omni "multiple units", miniwebtool), sales tax % applied to the discounted price OR prices already include tax (Omni toggle), per-item price.
- Currency selector (his rule): copy `mkCur` as `dcCur`, add the id to `checkPickerDesign`.
- Dropped: "Black Friday" text, Omni's separate markdown / VAT pages (VAT = tax % field), history/psychology essays.

## Differentiators
- **Visual:** a price bar: original price at 100%, each discount a stripe taken off in order, final price what is left, with the effective total discount % labelled — the 20% + 15% = 32% picture nobody draws.
- **Functional:** (1) any two of the four fill the rest incl. reverse ("what percent off is $84 from $120?"); (2) stacked rows in any number, mixing % and amount off; (3) compare deals: up to three offers on the same price (30% off / $25 off / buy 2 get 1 / 20% + 10%), marking the best one — answers the real question behind most searches; (4) click-to-use ladder of common percents (5-70%) with the final price for your price; (5) tax before/after, quantity totals; (6) plain words when the discount exceeds the price or is 100%.

## Formulas (arithmetic, no source risk)
Savings = price x pct / 100; final = price - savings = price x (1 - pct/100); pct = (price - final) / price x 100; stacked: final = price x (1-p1)(1-p2)...; effective = 1 - product; amount off after a % discount comes off the reduced price (order = typed order, said on the page); buy X get Y free: pay for X of every X+Y items -> effective discount = Y / (X+Y); nth item % off: pct off only each nth item. Tax = rate x discounted price (tax-included prices: divide out the tax first). Undefined: price 0 (percent), discount > 100%: hints, never blank.
Sources for the page: the formulas as stated on calculator.net / Omni / GigaCalculator / miniwebtool (opened 2026-11-08); no benchmarks, no tax-law claims (tax rate is typed by the user).

## Edge rules / QA
Any two of four, all pairs round trip; third value replaces the oldest but never the original price; stacked rows add/remove/clear; amount off larger than the price refused with a hint; discount >= 100% refused; optional fields never hide the result; every field visibly reacts (QA item 19); deals compare ranks correctly (oracle brute force).

## Plan if approved
`/discount-calculator/` (title idea <=60: "Discount Calculator — Percent Off, Sale Price & Savings"). Engine `DISCOUNT-ENGINE` (+ reuse `salesEngine.parse`), init `initDiscountCalc` (ids `dc*`, block `DISCOUNT:BEGIN/END`), css `.p-dc`, generator `md-files/gen-discount-page.js` (chain after profit-margin: prevSlug 'profit-margin-calculator', prevMenu 'Profit Margin', prevName 'Profit Margin Calculator'), fixture + independent oracle, QA gate, audits, preview, deploy on his "Deploy". Cross-link with markup, percentage-change, sales-tax pages. Commission + unit price stay separate pages (different intent).
Open decision for him: none blocking.
