# Markup calculator — research report (2026-11-07, NOT built, waiting for "Approve all")

Ahrefs (his, 2026-11-07): `markup calculator` >10,000 EASY (213 kws): margin markup >100 Medium; percent markup / margin to markup / percentage markup / retail markup >100 Easy; margin vs markup >100 Medium. One head phrase -> one page `/markup-calculator/`. First page of the sales cluster (markup, profit margin, percent off, discount, commission, unit price) — see `calcthis-roadmap-2026-11.md` §12.
Overlap on the site: percentage-change, sales-tax, tip, percentage calculators. No markup/margin page exists. Run `node md-files/dup-check.js` after building (expect low).

## Competitors opened LIVE (built-in browser, rendered page read 2026-11-07)
| Site | Inputs | Output / extras |
|---|---|---|
| Omni `/finance/markup` | Cost, Markup %, Revenue, Profit (fill any two) + currency selector (21) | the other two; long article (definition, margin vs markup, formula, "markup by industries" text); links to separate margin / markdown / VAT / sales-tax pages |
| calculator.net `/margin-calculator.html` | Cost, Revenue, Margin, Profit (any two) | Margin, Profit, **Markup** + one stacked bar (cost vs profit); also stock-margin and currency-margin calculators on the same page |
| CalculatorSoup `/markup-calculator.php` | Cost + Gross margin % only | Markup %, revenue (selling price), gross profit + formulas |
| GigaCalculator `/markup-calculator.php` | Cost + ONE of profit / revenue / markup | the remaining two + margin; copy buttons; guide |
| Corporate Finance Institute | selling price + cost (Excel template, no live tool) | markup amount and %; formula = (selling price - cost) / cost x 100 |
All five = numbers only. Nobody shows markup and margin side by side as a picture, nobody lets you type any two of the FIVE quantities (cost, selling price, profit, markup %, margin %), nobody shows a price ladder, and the markup-vs-margin confusion (every competitor's article has a section on it) is explained only in text.

## Inputs parity (competitor fields vs ours)
- **Kept (default view, 5 fields, type ANY two, the rest fill):** Cost, Selling price (revenue), Profit, Markup %, Margin % — the union of all five competitors.
- **Kept (Go advanced):** quantity (units -> totals), sales tax / VAT % on the price (Omni has it on a separate page), fees % (payment/platform fee off the price -> net profit), discount to give % (what is left of markup and margin after it; Omni has this on a separate markdown page).
- **Kept (his decision 2026-11-08: "currency selector is according to relevancy - totally relevant to the Markup calc, same for the profit margin - keep it!"):** currency selector, top-right of the card, display only (symbol/code on money fields and results), copied EXACTLY from the salary calculator's searchable `.csel` (154 ISO currencies, Popular group, type-to-filter, `#slCur` is the one allowed `data-search` csel in `checkPickerDesign`). Same selector goes on the profit margin page. Needs a second allowed id in `build.js` `checkPickerDesign` (e.g. `#mkCur`).
- **Dropped:** stock and currency "margin" calculators on calculator.net (different intent: trading margin); "markup by industry" benchmark text (Omni, no source cited -> not used).

## Differentiators
- **Visual:** two aligned bars for the SAME sale: the markup bar (cost = 100%, profit sticks out to the right as the markup %) and the margin bar (selling price = 100%, profit is the slice of it). One glance shows why a 50% markup is only a 33.3% margin — the confusion every competitor explains only in words. Plus a click-to-use ladder table.
- **Functional:** (1) any two of five quantities, the rest fill, with a line naming which two were used ("From cost and markup"); (2) typing a THIRD value replaces the oldest one, said in plain words (never silently); (3) a ladder of markups 10-100% (and the margin each gives) for your cost: click a row = that markup; (4) the reverse the other sites hide: "markup needed for margin X" is simply typing margin; (5) Go advanced: quantity totals, tax/VAT-inclusive price, fees -> net profit, discount -> remaining markup and margin; (6) loss in plain words when the price is below cost (negative markup).

## Formulas (all read, no study needed)
Profit = price - cost; Markup % = profit / cost x 100 (CFI, Omni, Soup); Margin % = profit / price x 100 (calculator.net, Omni); price = cost x (1 + markup/100) (Omni) = cost / (1 - margin/100) (CalculatorSoup); markup = margin / (100 - margin) x 100; margin = markup / (100 + markup) x 100. Undefined: cost = 0 (markup), margin >= 100% (needs cost <= 0): hints, never blank.

## Edge rules (QA)
- Any two of five, 10 pairs, all must give the same other three (round trip). Third value typed = oldest dropped. Cleared field = leaves the pair. Partial typing ("12.", "-") skipped quietly. Negative markup/margin allowed (loss); margin >= 100 refused with a hint; cost 0 refused for markup; huge values fine; thousands commas parsed.
- Every field visibly reacts (QA item 19): a lone field says what to type next ("Type one more value: cost, price, profit, markup or margin"); advanced fields without a price say "Type a cost and one more value first".

## Plan if approved
`/markup-calculator/`. Engine `SALES-ENGINE` (shared later by profit margin / percent off / discount / commission / unit price pages), init `initMarkupCalc` (ids `mk*`, block `MARKUP:BEGIN/END`), css `.p-mk`, generator `md-files/gen-markup-page.js` (chain after body-recomposition: prevSlug 'body-recomposition-calculator'), fixture + independent oracle (>=100 runs, all 10 pairs), `node md-files/qa/run.js markup-calculator` must print QA PASS, `audit-silent.js`, look at all 12 screenshots, text-vs-tool, no-ping registration audit, dup-check, preview. Title idea (<=60): "Markup Calculator — Markup %, Margin & Selling Price". Page 2 (profit margin) must differ in intent: margin from revenue and COGS/expenses (gross, operating, net), not a copy of this page (SEO: no duplicate content).
Open decision for him: none. Currency selector KEPT (2026-11-08). Still waiting for his explicit go-ahead to build.
