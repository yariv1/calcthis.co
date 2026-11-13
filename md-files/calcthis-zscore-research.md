# Z-Score Calculator: research report (2026-11-13, session #10) — roadmap v2 #9

Ahrefs (his numbers, roadmap §12): `z score calculator` >1000 Medium (621 kws); variants all <100 (altman, normal distribution, p value to z, percentile to z, critical z) = sections, not pages. "Altman z-score" is a different intent (bankruptcy score): NOT covered, no page. ONE page `/z-score-calculator/` in Math & Numbers, built on `CalcThis.pvalueEngine` (normal cdf + inverse already exist). Cross-link p-value + confidence interval + standard deviation pages. Overlap risk: p-value page already does z -> p; this page must be about standardizing a score, not hypothesis tests (dup-check before preview, limit 12%).

## Competitors opened LIVE 2026-11-13 (6)
1. **calculator.net** (z-score-calculator.html): (a) raw x + population mean + population SD -> z; (b) converter, type any ONE of six boxes: z, P(x<Z), P(x>Z), P(0 to Z), P(-Z<x<Z), P(x<-Z or x>Z); (c) probability between two z (left/right bound, diagram); z-table (0 to 4.0, 0.01 steps) with how-to-read text; formula text; related: standard deviation calculator. No chart on the main tool, no list input.
2. **Omnicalculator** (statistics/z-score): fields x, mean, SD, z — fill any three, the fourth is solved; "Show p-values": left-tailed, right-tailed, two-tailed p, two-tailed confidence level; worked example (4 test scores), z table explanation, six-sigma section (99.7%, 3.4 defects per million), FAQs; links z-test, t-test, t statistic calculators.
3. **CalculatorSoup**: three input modes: data point(s) (several x at once, one z each), sample mean + sample size (z of a mean, SE = sigma/sqrt n), a pasted data sample (comma/space/newline). Shows the applicable formula, accepted-format table.
4. **GigaCalculator**: tabs "Z score & P from score" and "Z from probability" (critical z); precision selector; outputs probabilities above/below/between/outside (one- and two-tailed); chart of the Z distribution with key quantiles; z table; worked examples; sources list ("based on 5 sources").
5. **8gwifi**: four modes Score->Z, Z->Prob, Pctl->Z, Z->Score; result z, percentile, left tail, right tail; normal-curve chart; calculation steps; plain-English line (1 SD above the mean, 84.13th percentile, "somewhat unusual"); presets (SAT, IQ, 95% CI, top 5%); Copy LaTeX, Share, Download PNG.
6. **Statistics By Jim**: two tools: x/mean/SD -> z with graph shading left area; z -> five probability regions each with a small shaded graph.
Also opened: SocSci Statistics (bare x / mean / SD -> z only). Not opened: Statology, Inch Calculator (search results only). Not verified: what Google ranks top today.

## Parity list (every competitor input / output; each must be matched or beaten; a drop needs his quoted sign-off)
Inputs: raw score x (one or several); population mean; population SD; z (to solve backwards); sample mean + sample size n (z of a mean); pasted data list; percentile (-> z); probability (-> z, critical z); two z bounds; precision/decimals.
Outputs: z; percentile / "better than X%"; P(left), P(right), P(0 to z), P(between -z and z), P(two tails), two-tailed confidence level; probability between two z; critical z for a given probability or confidence; raw score from z (x = mu + z*sigma); normal curve with shaded area; z-table; steps; plain-English reading; formula; worked example; FAQ; Copy.
Drop candidates (need his sign-off, none dropped yet): PNG download (8gwifi only; we offer Copy of the result text instead), LaTeX copy, six-sigma section (only if a source is read), Omni embed/reviewer extras.

## Differentiators (none of the six has them)
**Visual (one):** a bell curve with TWO axes: the z scale AND the user's own units under it, so 85 sits at z = 1 on a curve labelled 55/65/75/85/95 for mean 75, SD 10; shaded "better than 84%" area, +-1/2/3 SD bands with the 68/95/99.7 shares; two scores = two markers on the same standardized curve. Competitors show only the z axis.
**Functional (main):** "Compare two scores on different scales" (e.g. 85 on a test with mean 75 SD 10 vs 640 on a test with mean 500 SD 100: which is better, by how many SD, which percentile) — the core real use of a z score and absent from all six. Plus: any-one-missing solve in one set of boxes (Omni parity, extended to percentile), plain-English reading ("better than 84% of the group, 1 SD above average, typical/unusual").
**Go advanced (power depth; default view stays minimal):** pasted data list -> mean, SD (sample or population toggle), z for every value in a table, flags |z| > 2 and > 3 (CalculatorSoup parity plus outlier flags); z of a sample mean with n (SE); two-tailed confidence level / critical z table (90, 95, 99, 99.9); equivalents on other scales (T-score 50/10, IQ-style 100/15, SAT-style 500/100) only if a source is read at build time, else dropped; decimals.
Result headline = the z-score; sticky mobile bar shows live z + percentile.

## Behaviour (design-system rules)
Labels in his wording ("Your score", "Average of the group (mean)", "Spread (standard deviation)"); empty start, no demo values; SD must be > 0 (hint, never blank); optional fields never hide the result; every field visibly reacts (QA item 19); text >= 14px; 375px no horizontal scroll; existing DS components only (`.seg`, `.csel`, `.advbtn`).

## Sources (READ before build; unread = dropped)
Areas 68.27 / 95.45 / 99.73 and standard-score definition: NIST/SEMATECH e-Handbook of Statistical Methods (to read). Z-table values computed by the engine, checked against an independent erf implementation and calculator.net's published cells (1.00 -> 0.34134, 1.96 -> 0.47500). IQ / T / SAT scale conventions need a readable source; none read yet.

## Build plan (after "Approve all")
Engine `ZSCORE-ENGINE` on `pvalueEngine`; init `CalcThis.initZscoreCalc` (ids `zs*`, block `ZSCORE:BEGIN/END`), css `.p-zs`, generator `md-files/gen-zscore-page.js` (chains after confidence-interval-calculator). Gates: scaffold -> fixture + oracle (independent maths, >= 100 runs) + parity json + text + sidebyside -> `run.js` QA PASS -> Read all screenshots -> `viewed.js` -> `final.js` -> `preflight.js` -> preview link only -> his "Deploy".
Not verified in this report: SERP ranking; Omni p-value field names read from labels, results not typed.
