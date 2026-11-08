# Profit margin calculator — research report (2026-11-08, NOT built, waiting for his approval)

Ahrefs (his): `profit margin calculator` >10K Medium, `margin calculator` >10K Medium, `gross margin calculator` >1000 Medium. SERP check (web search 2026-11-08): both head phrases return the SAME sites (CalculatorSoup, Xero, Omni, Shopify, Rows) -> ONE page `/profit-margin-calculator/`, gross margin is a section + title word, not a second page.
Site overlap: `/markup-calculator/` (live v330) already solves cost / price / profit / markup % / margin % for ONE sale. Page 2 must NOT be a copy: it is the BUSINESS view (revenue, COGS, operating costs, net) with three margins. Run `node md-files/dup-check.js` after building.

## Competitors opened LIVE (built-in browser, 2026-11-08)
| Site | Inputs | Output / extras |
|---|---|---|
| calculator.net `/margin-calculator.html` | Cost, Revenue, Margin, Profit (any two) | Margin, Profit, Markup + one cost-vs-profit bar; also stock + currency margin calculators on the page |
| Omni `/finance/margin` | Cost, Margin, Revenue, Profit (any two) + currency (21) | the rest; text on margin vs markup; separate pages for VAT/sales tax/discount margin |
| Omni `/finance/gross-margin` | Revenue, COGS -> gross profit, gross margin | numbers only; links to net / operating margin pages (separate) |
| CalculatorSoup `/profit-margin-calculator.php` | Cost, Revenue | net margin, net profit, profit % (= markup) |
| Shopify `/tools/profit-margin-calculator` | Cost per item, markup slider 0-300%, Advanced: shipping, customer acquisition cost | margin + profit per item; FAQ incl. discount and CAC |
| Xero `/us/calculators/margin-calculator/` | Sales, cost | one gross margin %; table "markup needed for the margin you want" |
| businessinitiative.org | Revenue, COGS, operating expenses | gross margin, net margin, net profit (numbers) |
All = numbers (one has a single bar). Nobody draws where each dollar of revenue goes, nobody shows gross + operating + net side by side with the money, nobody does the target-margin reverse and the price/cost sensitivity together.

## Inputs parity (union of competitors)
- **Default view:** Revenue (selling price), Cost of goods sold, Profit, Margin % — type ANY two, the rest fill (calculator.net / Omni) — and the result always shows gross margin, gross profit AND the markup (calculator.net).
- **Business view (Go advanced or second row "Other costs"):** operating expenses (rent, wages, ads, software), other costs (shipping, customer acquisition cost like Shopify, payment fees %), interest and tax -> operating margin, net margin, net profit (businessinitiative / Omni net-margin).
- Currency selector (his rule): copy `mkCur` exactly as on the markup page.
- Dropped: stock-trading and currency-exchange margin calculators (different intent).

## Differentiators
- **Visual:** a "where every $1 of revenue goes" waterfall bar: revenue 100% -> cost of goods -> gross profit -> operating costs -> other -> net profit, each segment labelled with money and % of revenue; gross / operating / net margin marked on it. One picture instead of three numbers.
- **Functional:** (1) any two of revenue / cost / profit / margin fill the rest incl. markup (reuse `SALES-ENGINE`); (2) target margin reverse: "to keep X% margin the price must be …" and "cost may be at most …" (Xero + Omni hide this in tables); (3) what-if strip: price up 5/10%, cost up 5/10% -> new margin and profit (sensitivity Shopify only hints at); (4) break-even revenue from fixed + variable costs under Go advanced; (5) loss in plain words.

## Formulas (read, standard)
Gross profit = revenue - COGS; gross margin % = gross profit / revenue; operating profit = gross profit - operating expenses; operating margin = operating profit / revenue; net profit = operating profit - other costs - interest - tax; net margin = net profit / revenue; markup = profit / cost; price for target margin = cost / (1 - margin). No study/source risk. Undefined: revenue 0, margin >= 100%: hints, never blank.

## Edge rules / QA
Same pair logic and "every input must react" (item 19) as markup; optional advanced fields never hide the result (soft hints); picker = `mkCur` clone (add allowed id to `checkPickerDesign`); QA gate fixture + independent oracle; audit-silent.

## Plan if approved
`/profit-margin-calculator/`, engine reuse `CalcThis.salesEngine` + new waterfall helper, init `initProfitMarginCalc` (ids `pm*`, block `PROFITMARGIN:BEGIN/END`), css `.p-pm`, generator `md-files/gen-profitmargin-page.js` (chain after markup-calculator: prevSlug 'markup-calculator'), cross-links with markup page both ways. Title idea (<=60): "Profit Margin Calculator — Gross, Net & Margin %".
Open decision for him: none blocking. Opened but not read in detail: Shopify advanced panel (shipping + CAC seen only).
