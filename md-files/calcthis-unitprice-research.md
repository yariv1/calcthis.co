# Unit price calculator - research (2026-11-09)

Ahrefs (his numbers): `unit price calculator` >1000 Easy (37 kws, all variants <100). One page: `/unit-price-calculator/`. Money & Finance / shopping.

## Competitors (opened LIVE)
- **Omni** (omnicalculator.com/everyday-life/unit-price): Type dropdown = Weight | Volume | Items | Items with weight | Items with volume. Exactly TWO options (A, B). Per option: weight/volume (own unit dropdown), cost (currency dropdown), unit price (currency / unit dropdown, can show in another unit). Result: "Which one is cheaper? You save X per unit". No chart, no ranking, no per-unit conversion table. Article: formula, bulk vs bottle, cans vs bottle, FAQ.
- **Inch Calculator**: tabs Items | Area | Length | Time | Volume | Weight. Item One, Quantity, Total Price, "Add Item" (any number), Calculate. Result = unit price per item. No winner, no savings, no chart. Formula + one conversion example.
- calculator.net and CalculatorSoup: no unit price page (404 on both).
- Small tools (search only, not opened): 2-6 products, ranked cheapest first.

## Input parity (every field they have)
Type of measure (weight, volume, items, items x weight, items x volume, area, length, time); quantity / weight / volume with unit choice; total cost; currency; unit price shown per chosen unit; number of options (Omni 2, Inch unlimited).

## Our page
Inputs: Compare = measure type (Weight, Volume, Count, Length, Area; Count also with size per item = "6 cans x 330 ml"), a row per product: name (optional), price, amount, unit (own unit per row, so 16 oz vs 1 lb works), optional count. Unlimited rows, start with 2, "Add product". Currency picker (`upCur`, same searchable csel as salary/markup; add to `checkPickerDesign`). Unit system toggle: US / Metric / both shown.

Result (headline): "Product B is the best buy: 12% cheaper per ounce", price per chosen unit for every row, you save per unit and on the amount you actually plan to buy.

### Visual differentiator
Horizontal price-per-unit bars, one per product, sorted cheapest first, best marked, shortest bar = best, with the % more than the best on every other bar (nobody draws it).

### Functional differentiators
1. Any number of products, ranked, with different units in different rows (oz vs lb vs g vs kg converted by us; shown in BOTH a per-ounce and a per-100 g style line).
2. "How much will you buy?" (optional): total cost of the amount you need from each product and what the best buy saves over the others (e.g. 3 lb of rice). Pack sizes rounded up to whole packs (you cannot buy 0.4 of a bag) with leftover shown.
3. Price per use/serving (optional servings per pack) - differentiator for food and detergent.
4. Click a row's unit price to switch every row to that unit (per oz / lb / 100 g / kg).
5. Hints for bad input: mixing weight and volume in different rows says so ("weight and volume cannot be compared without density"), a missing amount says which one.

Go advanced: sale price / coupon per row (percent or amount off, reuse the discount engine), tax per row, price per 100 g / per 100 ml / per sheet / per item switch, decimals.

## Sources
Conversions: exact definitions (1 lb = 453.59237 g, 1 oz = 28.349523125 g, 1 US gal = 3.785411784 L, 1 US fl oz = 29.5735295625 ml, 1 in = 25.4 mm, 1 ft = 0.3048 m). Reuse the existing unit converter factors in app.js. No health/legal claims, no unread sources.

## Not doing
Density-based weight<->volume comparison (unread densities), live store prices.

## Parity fix (2026-11-09, he asked "we cant fall short from our competitors")
Inch Calculator has a Time tab; the first draft dropped it. Added: measure type Time (second, minute, hour, day, week, month, year) so subscriptions, rentals and plans compare per month vs per year. Measure types now = Weight, Volume, Count (incl. count x size per item), Length, Area, Time = superset of Omni (5 modes) and Inch (6 tabs). Also adding a per-row currency option under Go advanced to match Omni's currency dropdown on every cost.
