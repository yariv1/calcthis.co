# Self-employment tax calculator: research report (2026-11-27, NOT built, waiting for approval)

Ahrefs (his screenshots, 2026-11-02, not re-checked): `self employment tax calculator` >1000 Medium (263 kws) · `self employed tax calculator` >1000 Medium (213) · `1099 tax calculator` >1000 Medium (157) · `1099 tax calculator with deductions` >1000 Easy · `freelance tax calculator` >100 Medium.
ONE page `/self-employment-tax-calculator/` (same calculation), Money & Finance. Title: "Self-Employment Tax Calculator 2026: 1099 Taxes". Cross-link paycheck, salary, overtime. No page on the site covers it today (grep of all index.html: 0 hits).

## Competitors opened LIVE 2026-11-27
1. Everlance `everlance.com/tax-calculator` (ran: TX, single, $60,000): filing status Single/Married; state typeahead; 1099 income + slider; Advanced: W-2 job yes/no, W-2 income, work miles, other business expenses. Output: percent of income owed, total, federal / state / SE breakdown. Result $15,554.50 (Keeper's table gives $12,037 total federal for the same case).
2. Keeper `keepertax.com/1099-tax-calculator` (ran: TX, single, $80,000): status (4), state (50 + DC), W-2 income, 1099 income; advanced: tuition, mortgage interest, traditional IRA, quarterly payments, W-2 withholding. Output: federal bill, state bill / refund, deduction estimate, line-by-line breakdown (half SE, AGI, standard deduction, QBI, taxable, income tax, SE tax), amount owed; tables by profit. SE $11,304, income tax $5,341.
3. fcalculator `fcalculator.com/self-employment-tax-calculator/` (default and $80,000 result read): income, expenses, SEP / solo 401(k), health insurance, status (4), children under 17, W-2 wages, wage withholding, state rate typed. Output: total, keep, SE, income tax, quarterly amount + dates, QBI, set aside %, step table, tax-vs-profit chart, where-it-goes chart, 1099 vs W-2, ways to pay less, per $1,000 set aside, Share, CSV, Print. $80,000: SE $11,303.64, income tax $5,343.83.
4. selfemployedcalc.com (home read, fields listed; quarterly page read): tax year 2026/2025, status (4), income, expenses, business miles, home office ft², state (50 + DC), W-2 wages, W-2 withholding, health insurance, SEP / solo 401(k), other above-the-line, itemized, specified service business tick. Output: take-home year + month, effective rate, breakdown, set aside, quarterly payment, copy, share link, reset, AI question box, forms walk-through, table by profit. Quarterly page: last year's tax and AGI, payments made, safe-harbor minimum vs full amount, four dated payments.
5. Jackson Hewitt SE calculator (page read, not typed): net business profit, farm profit, church employee income, W-2 wages; SE tax, column chart, report.
6. TaxAct SE calculator (ran $80,000): year 2026/2025, SE income, W-2 wages; SS, Medicare, total. Showed $12,240 = 15.3% of the full $80,000, without the 92.35% step in the IRS worksheet.
7. QuickBooks SE calculator (opened; my typed value did not register): one net income box; SE tax, Medicare, Social Security.
Not usable: TurboTax self-employed page (links only, no inputs on it); SmartAsset, NerdWallet, Omnicalculator addresses tried returned 404; Bankrate result labeled with 2016 tables (search result, not opened).

## Parity list (match or exceed)
Inputs: filing status (4); 1099 / business income; business expenses; business miles (both 2026 rates); home office ft²; other expenses; farm profit; church employee income; W-2 wages; W-2 federal withholding; estimated payments made; health insurance premiums; SEP / solo 401(k); traditional IRA; other above-the-line; mortgage interest + other itemized (one itemized box + mortgage helper); children under 17; specified service business; state (typeahead) or typed state rate; last year's tax and AGI.
Outputs: SE tax with Social Security / Medicare / Additional Medicare split; deductible half; AGI; standard or itemized; QBI deduction; taxable income; federal income tax; state estimate; total; owed after payments; take-home year + month; effective rate; set-aside percent; four dated payments; safe-harbor minimum; step table; where-it-goes picture; tax by profit table + chart; what a $1,000 expense saves; 1099 vs W-2; Copy.

## Dropped (needs his sign-off)
Tax year 2025; tuition / education credit; automatic state tax for CT, DE, DC, ID, KS, ME, MS, NM, ND, RI, SC, VT, WV (the site has no sourced rules for them: the user types a rate; the other 38 use the paycheck engine, labeled an estimate); CSV export, Print, share link; AI question box.

## Differentiators
Visual (not seen on the pages checked): a money waterfall from client payments to what you keep, plus a Social Security cap meter ($184,500) showing W-2 wages filling it first.
Functional (not seen on the pages checked): (1) backwards: type the take-home wanted -> income to bill a year / month / hour; (2) "this payment just arrived": type a client payment -> how much to set aside at the rate of the NEXT dollar, beside the average rate. Also built in, matched from competitors: quarterly safe harbor on the same page.

## Sources
Read 2026-11-27: IRS "Self-employment tax" page (15.3%, $184,500, Additional Medicare thresholds, $400); Form 1040-ES (2026) (pdftotext of the IRS PDF: SE tax worksheet, 2026 rate schedules, standard deduction $16,100 / $32,200 / $24,150, due dates Apr 15, Jun 15, Sep 15 2026, Jan 15 2027, $1,000 rule, 90% / 100% / 110%, QBI permanent + $400 minimum, tips / overtime notes); Rev. Proc. 2025-32 §.26 (QBI thresholds $201,750 / $201,775 / $403,500, phase-in top $276,750 / $276,775 / $553,500); Instructions for Schedule SE (2026), parts; Instructions for Form 8995 (2025 version, parts); IRS standard mileage rates (72.5¢ Jan-Jun, 76¢ Jul-Dec 2026); IRS simplified home office ($5 per ft², 300 ft² max).
To read before the build (unread = that input is dropped, with his sign-off): Form 8995-A (above the threshold); Form 7206 (health insurance limit); Pub. 560 (SEP / solo 401(k) limits); IRA deduction limits; child tax credit amount, phase-out and refundable part; Form 8959.
Not included: new tip deduction for self-employed tips (no checked page offers it); EITC and other credits.
Upkeep: new IRS figures every year.

## Built 2026-11-27 (approved: "Approve all")
All listed sources were read before the build (Form 8995-A and instructions, Form 7206 (2026), Pub. 560, IRA limits page, Schedule 8812 instructions, 26 U.S.C. 199A(i) and 24). Added after reopening competitors: a "Weighing a job offer?" box (salary + benefits + hours -> billing needed) and the saving from $1,000 more in the retirement plan. Not included (said on the page): earned income and other credits, tips / overtime / car loan / senior deductions, capital gains, alternative minimum tax. Yearly upkeep: figures in `SETAX-ENGINE`, then `node md-files/gen-setax-page.js`.

## Anchors
Single, $80,000 profit, no other income: net earnings $73,880.00; SE tax $11,303.64; half $5,651.82; AGI $74,348.18; before QBI $58,248.18; QBI $11,649.64; taxable $46,598.54; income tax $5,343.83; total federal $16,647.47 (unrounded steps).

## Engine plan (after "Approve all")
`SETAX-ENGINE` (`CalcThis.seEngine`, state estimate via `CalcThis.payEngine`), init `CalcThis.initSeTaxCalc` (ids `se*`), css `.p-se`, generator `md-files/gen-setax-page.js` (chains after ANOVA; register under Money & Finance). All gates; preview on request; deploy only on "Deploy".
