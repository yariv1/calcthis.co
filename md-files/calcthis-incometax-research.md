# Income tax calculator: research + decided plan (2026-11-28). NOT built yet. NEXT = build.

This file is the single source for the build. It replaces the earlier drafts completely.

## 1. His decisions (2026-11-28, his words)
- "Tax year 2025 - does it cost us a lot to keep it? why - someone wants to recalculate the tax he has/had to pay in order to be more sure"
- Alternative minimum tax: "not sure i know what is the alternative tax"
- Credits: "not sure about typing amount instead, since maybe each one of theses expenses types has different tax deduction that can be claimed against it - worth checking it. we can give the option to \"add expanse\", select from a dropdown list - that can be great. we can literally be an authority on this one, if we make really efficient and straightforward for the user (!)."
- Rare items: "whatever i added on the third point refers to this one as well"
- States: "can you research which are the most requested / search ones for this purpose? states i mean - i'd start with these two" and then, after the demand numbers: "ok, Texas and California it is. we will keep adding as we go. before we start," (followed by the session handoff request).

Approval note: he did not type "Approve all". The message above came after the updated plan (section 2) and is treated as the go-ahead to build it. Do not ask again.

## 2. The decided plan
- Pages: `/income-tax-calculator/`, `/income-tax-calculator/texas/`, `/income-tax-calculator/california/`, all in one release, Money & Finance. More states later "as we go": make the generator data-driven (one entry per state).
- Tax years 2025 AND 2026 (second set of IRS figures; every test runs for both).
- Alternative minimum tax is calculated.
- "+ Add an expense or tax": a button with a searchable list. Each choice asks only what its rule needs. Each row shows what it SAVES in dollars, or why it saves nothing (income too high, over the limit, expired, not allowed that year). Items named so far: child care, college (education), retirement saving, home energy, marketplace health insurance, foreign tax, student loan, medical, charity, household employee tax, drilling costs, home buyer repayment, military reservist expenses, earned income credit questions, combat pay. The rest of the parity list's deductions and adjustments belong in the same list or in the main fields, whichever is clearer.
- Rare items: drilling costs, home buyer repayment and reservist expenses are amounts the user enters, with a plain explanation; household employment tax is computed; the earned income credit questions and combat pay are asked as questions.
- Home energy credits: Form 1040-ES (2026) lists them (and the clean vehicle credits) as expired for 2026, so they apply to 2025 only.
- Said to him as limits: the health insurance and foreign tax credits need figures from the user's tax documents; unusual cases may not be exact; this is a large build; ask him before leaving anything out.

## 3. Demand
Ahrefs (his screenshots 2026-11-07, not re-checked): `income tax calculator` >100K Hard (8,537 keywords) · `federal income tax calculator` >10K Hard · `income tax calculator nevada` >1000 Easy · `texas income tax calculator` >1000 Medium · `california` >1000 Hard · `nyc` >1000 Hard · `2025` >1000 Hard.

Google Trends, US, past 12 months, "<state> income tax calculator", read 2026-11-28 (relative values, California = 55.8 in every batch): California 55.8 · Texas 26.5 · Florida 21.5 · New York 19.4 · NYC 15.7 · Washington 11.5 (may include Washington DC) · Illinois 9.7 · Georgia 8.9 · Virginia 8.6 · Ohio 7.8 · Colorado 6.9 · Oregon 6.1 · Michigan 4.5 · Maryland 4.2 · Massachusetts 4.1 · Arizona 3.4 · Tennessee 2.5 · Indiana 2.5 · Missouri 2.3 · North Carolina 2.0 · Minnesota 2.0 · Utah 1.9 · New Jersey 1.8 · Pennsylvania 1.7 · Wisconsin 1.3 · all others below 1 (Nevada 0.1). Google autocomplete suggests "by state", then California first among states.

Ahrefs and Trends disagree about Nevada. He chose Texas + California knowing this. Order for later states: use his numbers, with the list above as the second signal.

Titles in the same style: "Income Tax Calculator 2026: Federal Tax & Refund", "Texas Income Tax Calculator 2026", "California Income Tax Calculator 2026" (limits: title 60, description 158). Overlap: the paycheck pages answer per-paycheck withholding; these answer the yearly return and refund. Texas has no state wage income tax, so its page has the same federal maths as the hub and needs its own sourced Texas text; run the duplicate check (limit 12%) against the hub, the California page and the Texas and California paycheck pages.

## 4. Competitors opened LIVE 2026-11-28
1. calculator.net `/tax-calculator.html` (ran $80,000 single; its default year was 2025: tax $9,049, standard deduction $15,750). Inputs: status (5, including qualified widow), dependents 0-16 and 17+, year 2026 / 2025, age, W-2 wages, federal / state / local withheld, Medicare wages (both spouses), business income, estimated tax paid, Social Security income, interest, ordinary and qualified dividends, passive income, short and long capital gains, other income, state + local rate, tips, overtime, car loan interest, IRA, real estate tax, mortgage interest, donations, student loan interest, child care, tuition (4 students), other deductibles. Outputs: owed / refund, total income, deductions, taxable income, regular tax, AMT, NIIT, credits, total tax, marginal rate, prepayments.
2. NerdWallet tax calculator ("Show advanced" showed no further fields): year, status (4), gross income, age, standard / itemized, withheld. Outputs: refund / owed, breakdown, effective and marginal rate. $100,000 single 2026: $13,169.88.
3. AARP 1040 calculator (labels read), about 80 fields: status, dependent filer, child and other dependents, wages and Medicare wages (both), interest (taxable, exempt), dividends, state refunds, alimony, business (both), capital gains, other gains, IRA and pension distributions, rentals, farm, unemployment, Social Security, other; adjustments (educator, HSA, SEP, health insurance, early withdrawal, alimony paid, IRA, student loan, other); itemized (medical, taxes, interest, gifts cash / non-cash), force itemizing; QBI, tips, overtime, car loan; AMT adjustments, typed credit amounts (foreign, child care, education, saver's, energy, other), other taxes, withholding, estimated and other payments, premium credit, EIC children, combat pay, age, residency. Outputs: summary, column graph, report.
4. SmartAsset Nevada (ran $80,000: federal $9,049, FICA $6,120, still on 2025) and Texas (only the title and the year 2025 read). Nevada inputs: income, location, status (4), standard / itemized, 401(k), IRA, credits, dependent deductions, other pre-tax. Outputs: federal, FICA, state, local, take-home, marginal and effective rates.
5. talent.com Nevada: salary, pay period, state. Outputs: Social Security, Medicare, federal, net, marginal and average rate, amounts per period, table of salaries, state ranking.
- TurboTax TaxCaster and H&R Block: question wizards; only the first questions seen, not in the parity list.

STILL TO OPEN before building (parity gate needs them live): California pages (SmartAsset California, the Franchise Tax Board's own calculator, talent.com California, calculator.net with California) and a full run of the Texas pages (SmartAsset Texas, talent.com Texas).

## 5. Parity list (match or exceed)
Inputs: status (4 + surviving spouse), dependent filer, age (both), children under 17, other dependents; pay per year / month / paycheck; wages and Medicare wages (both); federal, state, local withheld; estimated and other payments; business and farm income (both); interest, tax-exempt interest, ordinary and qualified dividends, short and long gains, other gains, rentals / passive, IRA and pension distributions, unemployment, Social Security, state refunds, alimony received, other; 401(k), HSA, IRA, SEP, health insurance, student loan, educator, early withdrawal, alimony paid, other adjustments; standard or itemized (medical, state / local taxes, mortgage interest, gifts); tips, overtime, car loan interest, senior deduction; QBI; every credit calculated through "+ Add an expense or tax"; state (typeahead; estimate or typed rate); currency picker with typed rate.
Outputs: refund or owed, total income, adjusted gross income, deductions, taxable income, ordinary and capital-gains tax, alternative minimum tax, child and other-dependent credit, earned income credit, each other credit, self-employment tax, extra Medicare, investment income tax, FICA, state tax estimate, take-home per year and per period, marginal and effective rate, step table, picture, tables by income, Copy.

## 6. Differentiators (not seen on the pages read)
- Visual: a bracket staircase. Your taxable income poured into the 10% to 37% steps, gains stacked on top at 0 / 15 / 20%, with a marker for the next dollar.
- Functional: (1) "+ Add an expense or tax" that shows what each item saves or why it saves nothing (the main one); (2) refund planner: how much more or less to withhold per remaining paycheck to end at the refund you want; (3) "what moves my tax": the effect of $1,000 more pay, 401(k) or IRA, and the distance to the next or lower bracket; (4) married joint against separate, side by side.
- Also: current-year figures (SmartAsset still showed 2025).

## 7. Sources
Read (2026-11-27 and 28):
- Form 1040-ES (2026): rate schedules; standard deduction single / married separate $16,100, joint $32,200, head of household $24,150; extra for age 65 or blind $2,050 unmarried, $1,650 married; dependent: greater of $1,350 or earned income + $450; refundable child credit $1,700; QBI including the $400 minimum; tips up to $25,000, overtime up to $12,500 / $25,000, car loan interest up to $10,000, senior deduction $6,000, each with income limits; state and local tax cap $40,000 ($20,000 married separate), reduced above $500,000 of income but not below $10,000; expired 2026 credits (home energy, clean energy, clean vehicles); child care rate up to 50%; 2026 premium tax credit changes; charity for non-itemizers $1,000 / $2,000; itemized limit 5.4%.
- Rev. Proc. 2025-32: QBI thresholds; capital gain breakpoints (joint $98,900 / $613,700, married separate $49,450 / $306,850, head of household $66,200 / $579,600; single not noted here, read it again); earned income credit table (earned income amount $8,680 no children, $13,020 one, $18,290 two or three+).
- Schedule 8812 instructions (2025) and 26 U.S.C. § 24; IRS IRA limits; Pub. 560 (2025, with 2026 limits); Schedule SE instructions; Forms 8995-A and 7206.

To read BEFORE coding the matching item (unread = ask him before dropping it):
- Schedule 1-A instructions (tips / overtime / car / senior phase-outs); Pub. 915 (Social Security); Form 8960 (investment income tax); Form 6251 (alternative minimum tax); the rest of Rev. Proc. 2025-32.
- Each credit's instructions: 2441 (child care), 8863 (education), 8880 (saver's), 5695 (home energy, 2025), 8962 (premium), 1116 (foreign tax), credit for other dependents, student loan and HSA limits, Schedule H (household employee), and whatever each other list item needs.
- All 2025 figures.
- California: Franchise Tax Board rate schedules, standard deduction, exemption credits and the extra 1% above $1 million, for 2025 and for whatever FTB has published for 2026. Check this early: if the 2026 annual figures are not published, say so on the page and to him.
- Texas: official source for having no state personal income tax, plus any Texas facts used in the page text.

## 8. Engine plan
- `ITAX-ENGINE` (`CalcThis.itEngine`) reusing the 2026 tables in `CalcThis.seEngine`; init `CalcThis.initIncomeTaxCalc` (ids `it*`), css `.p-it`, app.js block `ITAX:BEGIN/END`, generator `md-files/gen-incometax-page.js` (chains after `self-employment-tax-calculator`, menu 'Self-Employment Tax').
- State tax: `CalcThis.payEngine` holds 2026 WITHHOLDING formulas (California = EDD method B). That is not the yearly California return: California on this page needs the Franchise Tax Board rules. For other states in the hub's state picker, the 2026 estimate comes from payEngine (label it an estimate; 13 states need a typed rate); 2025 state estimates have no figures yet: use a typed rate unless sourced figures are added, and tell him.
- From the start: currency picker `itCur` top right of the card (add to `checkPickerDesign` in build.js; typed exchange rate; tax worked out in USD; copy the self-employment page); pay by year / month / paycheck, plus month-by-month entry where people know monthly amounts; state picker = `.st-ta` typeahead; 15px field spacing including after notes; no placeholder cut off at 375px; every field visibly reacts.
- All gates for all three pages; preview http://localhost:8200/ ; deploy only on "Deploy".
