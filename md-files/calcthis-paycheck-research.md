# Paycheck Calculator — research (2026-10-26). Reference only; plan not yet approved.

## Competitors opened live
- **PaycheckCity (salary):** state (federal-only option), check date, gross pay (annual / per period), YTD gross, pay frequency (daily, weekly, weekly-53, bi-weekly, bi-weekly-27, semi-monthly, monthly, quarterly, semi-annual, annual), W-4 2020 fields (filing status incl. HoH + nonresident alien, Step 2 two jobs, Step 3 dependents $, Step 4a other income, 4b deductions, additional withholding, round withholding, exempt federal / Social Security / Medicare), state + local taxes, benefits & deductions list. Hourly = separate calculator.
- **SmartAsset:** marital status, location, pay frequency, allowances (federal/state/additional state/local), additional withholdings, pre-tax and post-tax deductions, exempt from any taxes, hourly vs salary, overtime; result = take-home + where-your-money-goes list (taxes %, FICA %, pre/post-tax deductions).
- **ADP:** employer-facing salary paycheck calculator, all 50 states, pre/post-tax deductions. Page is mostly text.
- calculator.net has no paycheck calculator page (404); its Salary + Income Tax calculators are separate.

## 2026 federal figures (IRS Pub 15-T, fetched from irs.gov/publications/p15t) — annual percentage method
Adjusted annual wage = wages x periods + W-4 4a - 4b - step2 amount (STEP 2 NOT checked: $12,900 MFJ, $8,600 otherwise; checked = use checkbox schedules and 0).
Tentative annual = base + rate x (AAW - floor); per period = /periods; minus step-3 credits / periods (floor 0); plus extra withholding.
STANDARD schedules (rows: floor | base | rate):
- MFJ: 0|0|0% ; 19,300|0|10% ; 44,100|2,480|12% ; 120,100|11,600|22% ; 230,700|35,932|24% ; 422,850|82,048|32% ; 531,750|116,896|35% ; 788,000|206,583.50|37%
- Single/MFS: 0|0|0% ; 7,500|0|10% ; 19,900|1,240|12% ; 57,900|5,800|22% ; 113,200|17,966|24% ; 209,275|41,024|32% ; 263,725|58,448|35% ; 648,100|192,979.25|37%
- HoH: 0|0|0% ; 15,550|0|10% ; 33,250|1,770|12% ; 83,000|7,740|22% ; 121,250|16,155|24% ; 217,300|39,207|32% ; 271,750|56,631|35% ; 656,150|191,171|37%
STEP-2-CHECKBOX schedules:
- MFJ: 0|0|0% ; 16,100|0|10% ; 28,500|1,240|12% ; 66,500|5,800|22% ; 121,800|17,966|24% ; 217,875|41,024|32% ; 272,325|58,448|35% ; 400,450|103,291.75|37%
- Single/MFS: 0|0|0% ; 8,050|0|10% ; 14,250|620|12% ; 33,250|2,900|22% ; 60,900|8,983|24% ; 108,938|20,512|32% ; 136,163|29,224|35% ; 328,350|96,489.63|37%
- HoH: 0|0|0% ; 12,075|0|10% ; 20,925|885|12% ; 45,800|3,870|22% ; 64,925|8,077.50|24% ; 112,950|19,603.50|32% ; 140,175|28,315.50|35% ; 332,375|95,585.50|37%
Source note: figures transcribed by a fetch tool from the IRS page (garbled layout) — re-verify against the IRS PDF before shipping.
Other 2026 numbers (third-party search, VERIFY): Social Security wage base $184,500 (6.2%); Medicare 1.45% no cap; additional Medicare 0.9% on wages over $200,000 (withholding threshold); 401(k) deferral limit $24,500, catch-up 50+ $8,000, 60-63 $11,250; standard deduction $16,100 single / $32,200 MFJ / $24,150 HoH.

## Open questions for the plan
State income tax scope (50 states + DC x tables), local taxes, hourly vs salary in one page, overtime, pre/post-tax deductions.
