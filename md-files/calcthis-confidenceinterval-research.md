# Confidence interval calculator - research (2026-11-10)

Ahrefs (his numbers, roadmap v2 #8): `confidence interval calculator` >1000 Medium; `95 confidence interval calculator` >1000 Medium; 90 / 99 / two samples / sample size / TI-84 / Clopper-Pearson <100 = sections. One page: `/confidence-interval-calculator/` (Math & Numbers, chains after p-value). Reuse `CalcThis.pvalueEngine` (cdf, `inv` for z and t quantiles).

## Competitors (opened LIVE 2026-11-10)
- **calculator.net** (confidence-interval-calculator.html): mean only. Inputs: sample size n, sample mean, standard deviation (sigma or s), confidence level %. Always z (says s is fine for n > 30; no t). Result: interval, margin of error, shown as mean +- error, +- percent, [low - high]. Page text: formula, worked example, z-value table (70% to 99.999%). No chart.
- **Omnicalculator** (statistics/confidence-interval): two modes: population mean | population proportion. Mean: "What data do you have" = standard deviation | standard error; sample mean; SD (or SE); n; "I know the desired value of" = confidence level | z-score | right-tailed p-value. Proportion: sample proportion p-hat, n, same three choices. Outputs: confidence level, lower bound, upper bound, margin of error. Article: formula, by-hand steps, 99% worked example from a pasted dataset, time series note. No chart; z only (no t).
- **GraphPad QuickCalcs** (confinterval1): confidence interval of a proportion (numerator, denominator, 95% only) and of a COUNT (Poisson, number counted, 95%). No mean, no level choice, no chart.
- **Social Science Statistics** (confidenceinterval/tstat): single-sample CI using the t distribution from RAW DATA (shows mean, sum of squares, SD, CI with full steps; "when to use" = unknown SD, small n). Only the landing text was readable; the calculator form itself did not open in the pane (not verified beyond the description).
- **Statology**: calculator URL returned 404 (page gone), not usable as a reference.

## Every input / mode / output they have (parity list)
Inputs: n; sample mean; SD or SE (Omni); confidence level typed; z-score or right-tail p instead of level (Omni); mean vs proportion mode (Omni, GraphPad); proportion as p-hat (Omni) or numerator/denominator (GraphPad); Poisson count (GraphPad); raw data list (SocSci, Omni article); t vs z (SocSci t only, others z only).
Outputs: lower, upper, margin of error; +- percent form and bracket form (calculator.net); z-value table by level (calculator.net); worked steps with the numbers (SocSci, calculator.net, Omni); mean, sum of squares, SD from raw data (SocSci); formulas and a definition (all).

## Our page (build plan)
Default: "I have" = Summary numbers | Raw data list. Mean mode: mean, SD, n, level chips 90 / 95 / 99 + typed; "SD is" = From my sample (uses t) | Known for the whole population (uses z), default sample/t with a note when t and z differ. Proportion mode: successes out of n (or p-hat + n). Count mode (Poisson) under Go advanced. Results: lower, upper, margin of error, +-%, bracket form, standard error, critical value used (t or z, df), all with Copy; worked steps with the user's numbers.
Go advanced: SE instead of SD; z-score or right-tail p instead of level (Omni parity); proportion method Wald | Wilson | exact Clopper-Pearson; difference of two means / two proportions; decimals.

### Visual differentiator (no competitor draws anything)
Live bell curve of the sample mean with the central confidence area shaded and the interval marked on the number line, plus nested bars for 90 / 95 / 99% so the user sees how the interval widens as confidence rises (and the same interval at a larger n as a ghost bar).

### Functional differentiators (what each competitor lacks)
1. t and z side by side with the right one chosen automatically (calculator.net/Omni only z, SocSci only t); shows the difference it makes at small n.
2. "How many people do I need?": type the margin of error you want and get the sample size (competitors send you to a separate sample size page).
3. Proportion intervals with Wilson and exact methods (Omni = Wald only, GraphPad 95% only).
4. Paste raw data: mean, SD, n computed for you (Omni only in article text; SocSci only for t).
5. Every input visibly reacts (QA item 19): SD missing -> "type the standard deviation"; successes > n explained; n < 2 for t explained.

## Math / sources
Mean: x-bar +- crit * s / sqrt(n); crit = t(1 - alpha/2, n-1) for sample SD, z for known sigma. Proportion: Wald p +- z sqrt(p(1-p)/n); Wilson score interval; Clopper-Pearson from the beta quantiles; Poisson exact via chi-square quantiles. Standard textbook definitions; no health/legal claims. Anchors from live competitors: n 50, mean 20.6, SD 3.2, 95% z; n 100, mean 22.8, SD 2.7, 95% -> 22.8 +- 0.5292 (calculator.net); n 100, mean 3, SD 0.5 -> 2.902 to 3.098 (Omni); 99% dataset example mean 27.3, SD 17.9, n 36 (Omni). QA oracle = independent method (numerical quantile by bisection on an independent cdf, brute-force coverage check), >= 100 random runs.

## Not doing
Hypothesis tests (p-value page), effect size, ANOVA, regression CI; TI-84 key sequences (text only).

## SEO
Title <= 60 chars starting with the keyword, e.g. "Confidence Interval Calculator: Mean or Proportion". Sections for 90 / 95 / 99%, two samples, sample size, Clopper-Pearson. Cross-link p-value, standard deviation, percentage pages.
