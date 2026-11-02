# NYC take-home pay research (2026-11-02) — report delivered, awaiting approval

Demand (Ahrefs 2026-11-02): `take home pay calculator nyc` >1000 Medium (also `hourly to salary calculator nyc` <100). One page `/paycheck-calculator/new-york-city/`; the New York state page stays (different intent).

Competitors opened live: PaycheckCity NY (local = work address + city + ZIP + "Resident" checkbox + "Exempt from local tax"; state fields FILINGSTATUS, TOTALALLOWANCES, SDI + FLI checkboxes), SmartAsset NY (Location field, local allowances, local withholding, additional withholdings). Neither shows a state-vs-city split.

Official source: NYS-50-T-NYC (1/26), https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nyc.pdf, effective Jan 1 - Dec 31 2026 (downloaded and read; text in /tmp/nyc was scratch).
- Deduction + exemption allowance (Table A/B/C): annual single $5,000, married $5,500, +$1,000 per exemption (IT-2104 exemptions, same count as the state). Per period (single / married): daily 19.25 / 21.15, weekly 96.15 / 105.75, biweekly 192.30 / 211.50, semimonthly 208.35 / 229.15, monthly 416.70 / 458.30; per exemption daily 3.85, weekly 19.25 biweekly 38.50? (verify from Table C when building).
- Exact calculation schedule (single and married use the SAME rows), annual: 0-8,000 2.05%; 8,000-8,700 add 164 at 2.80%; 8,700-15,000 add 184 at 3.25%; 15,000-25,000 add 388 at 3.95%; 25,000-60,000 add 783 at 4.15%; 60,000+ add 2,236 at 4.25%. Per-period tables (weekly/biweekly/semimonthly/monthly/daily) are published on page 25-26.
- Official anchors (page 27): monthly $50,000 single 3 exemptions = $2,070.50; monthly married 3 ex = $2,068.73; weekly $400 single 3 ex = $6.11; semimonthly $5,000 single 1 ex = $188.80; daily $750 single 2 ex = $29.51; married weekly $400 4 ex = $5.17; semimonthly $5,000 married 3 ex = $184.37; daily married 2 ex = $29.43.
- Supplemental wages: NYC flat 4.25%. Not needed (no calculator handles bonus).
- NYC tax applies to NYC RESIDENTS only (commuters pay none). Yonkers is separate (NYS-50-T-Y) — not planned.
- MCTMT is employer-only.
