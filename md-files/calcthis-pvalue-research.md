# P value calculator - research (2026-11-10)

Ahrefs (his numbers, roadmap v2 section 8): `p value calculator` >1000 Medium (633 kws), `p value calculator from t` >1000 Medium; chi square / t test / from z / t value to p / z score to p all <100 (= sections, not pages). One page: `/p-value-calculator/`. Math & Numbers (stats cluster hub: #8 confidence interval, #9 z score share the engine).

## Competitors (opened LIVE 2026-11-10)
- **Omni** (omnicalculator.com/statistics/p-value, 1,242 helpful votes): "What do you know?" dropdown = Z-score | t-score | chi-square score | F-score. Value field, degrees of freedom (t, chi-square; F has two), significance level alpha (default 0.05), "Type of p-value" three radio options (two-tailed / left-tailed / right-tailed), checkbox "I don't know which score I need" (text explanation of each distribution only). Result = the p-value only. Static example picture of a two-tailed area, NOT drawn from the user's numbers. Article: definition, formulas, interpretation, by-hand steps, z / t / chi-square / F examples, FAQ. Links to a separate hypothesis testing calculator.
- **calculator.net** (p-value-calculator.html): z-score ONLY (normal distribution). Any one of six boxes can be typed and the others fill in: Z, P(x<Z) left, P(x>Z) right, P(0 to Z) from centre, P(-Z<x<Z) between, P(x<-Z or x>Z) two tails. So it also goes backwards (p -> z). No t, chi-square, F, no alpha, no verdict, no chart.
- **GraphPad QuickCalcs** (graphpad.com/quickcalcs/pvalue1): five separate mini-forms: z; t + DF; F + DFn + DFd; r + DF; chi-square + DF. TWO-TAILED ONLY (stated on the page). Long explanatory text (what a P value is, correct vs incorrect interpretations, z/t/F/r/chi-square explainers). No chart.
- **Social Science Statistics** (one page per distribution): t + df -> one-tailed and two-tailed p (t = 2.1, df = 20 -> 0.024309 and 0.048618, six decimals); z page (z -> p values). No chart, no verdict.
- **Statology** (t-score-p-value-calculator): t + df, one-tailed / two-tailed buttons, alpha chips 0.01 / 0.05 / 0.10, result "P-value: 0.08088" + "NOT SIGNIFICANT at p < 0.05" verdict, example (t = 2.3, df = 11, two-tailed -> 0.04203), FAQ. One page per distribution.

## Every input / mode / output they have (parity list)
Inputs: z; t + df; chi-square + df; F + df1 + df2; correlation r + df (GraphPad); alpha (Omni field, Statology chips); tail left / right / two-tailed (Omni, Statology one/two, calculator.net all five areas); p -> z reverse (calculator.net); "which score do I need" helper (Omni).
Outputs: the p-value; one-tail + two-tail together (SocSci); left, right, centre, between, two-tail areas (calculator.net); significant / not significant verdict at alpha (Statology); worked example; formulas by tail; interpretation guide; by-hand steps; a list of correct vs wrong ways to say a P value (GraphPad); picture of the tail area (Omni, static).
Everything above is covered by the build plan below. Nothing dropped.

## Our page
Statistic (csel "Test statistic"): z | t | chi-square | F | correlation r (n typed, df = n - 2 shown). Value field, df field(s) labelled with what they are ("Degrees of freedom (sample size - 1)", F: "Numerator df", "Denominator df"), alpha (default 0.05, chips 0.01 / 0.05 / 0.10 + typed), tail = three `.radopt` options in plain words (two-tailed "different from", left "lower than", right "higher than"). Default view minimal.

Result headline: the p-value for the chosen tail, then a plain-words verdict at alpha ("p is below 0.05: reject the null hypothesis" / "not enough evidence to reject it"; never "accept H0", never "probability the result is due to chance"). All three tails shown at once in a small table (left, right, two-tailed) - no re-run. Tiny values in scientific notation (3.2e-12), never "0".

### Visual differentiator (no competitor draws it)
Live curve of the chosen distribution (z, t with the df shape, chi-square, F), the user's statistic marked on the axis, the tail area(s) SHADED for the chosen tail (that shaded area IS the p-value), plus the critical value line(s) for alpha so the user sees whether the statistic is past the line. Omni only has one static example picture; calculator.net, GraphPad, SocSci, Statology have no picture at all.

### Functional differentiators (what each competitor lacks)
1. One page, five statistics, all tails at once with a verdict (GraphPad two-tailed only; calculator.net z only; Omni/Statology one tail at a time and Statology t only).
2. Reverse for every distribution: type a p-value (or use alpha) and get the critical value / test statistic (calculator.net only does z).
3. Go advanced "I don't have the statistic yet": t from sample mean, hypothesized mean, standard deviation and n (one-sample), two-sample (means, SDs, n each), z from the same; so the p-value is one step from raw summary numbers (Omni sends you to another calculator). SCOPE CHECK: needs his approval; if he says no, drop it and keep 1, 2, 4.
4. Degrees-of-freedom help under the field ("one-sample t: n - 1; two-sample: n1 + n2 - 2; chi-square goodness of fit: categories - 1") and a "which statistic do I have?" short table (Omni's checkbox, but a real answer by test name: t-test -> t, ANOVA -> F, chi-square test -> chi-square, correlation -> r, z-test -> z).
5. Every input visibly reacts (QA item 19): df missing -> "type the degrees of freedom first"; df must be a positive number; F needs both; r must be between -1 and 1; chi-square and F cannot be negative; decimal df allowed for t (Welch).

## Math / sources
Exact: p from the cumulative distribution (regularised incomplete beta for t and F, regularised incomplete gamma for chi-square, error function for z); correlation r -> t = r * sqrt(df / (1 - r^2)) with df = n - 2. Standard definitions (any statistics text); nothing health/legal. Anchors to test against (live competitors): t = 2.1, df = 20 -> 0.024309 one-tailed / 0.048618 two-tailed (SocSci); t = 2.3, df = 11 two-tailed -> 0.04203 (Statology); z = 1.96 two-tailed -> 0.0500 (standard). QA oracle = independent method (numerical integration of the density, NOT the page's incomplete-beta code), >= 100 random runs across all five statistics, tails and extreme df (1, 2, 1000, non-integer).

## SEO
Title <= 60 characters starting with the keyword, e.g. "P-Value Calculator: From Z, t, Chi-Square or F Score". Sections for the <100 variants (p value from t, from z, chi-square, t-test, z score to p). One page. Cross-link to #8 confidence interval and #9 z score when they exist, and to standard deviation / percentage pages.

## Not doing
Hypothesis tests that start from raw data lists (t-test / ANOVA calculators are separate intents, would need their own Ahrefs check); effect size and power (not asked, not checked).

## More calculators worth researching (no Ahrefs numbers yet)
Roadmap v2 section 6 still has UNCHECKED phrases (sections 8-11 only cover compound interest, amortization, retirement, no tax on tips, p value, income tax, percent off, confidence interval, amps to watts, house affordability, markup, discount, z score, bmi for kids, time zone, margin, profit margin, sale price, commission, unit price). Still to send through Ahrefs: sample size, significant figures, exponent, square root, log, quadratic formula, gcf, lcm, circumference, slope, pythagorean theorem, probability, permutation and combination calculator; inflation, interest, savings, investment, roi, cagr, 401k, roth ira, debt payoff, credit card payoff, student loan, down payment, refinance, rent vs buy, dti calculator; tax refund, tax bracket, capital gains, car loan interest deduction, social security, child tax credit; mpg, fuel cost, car lease; roofing, drywall, brick, deck, fence, paver, btu; carbohydrate, healthy weight, waist to height ratio, army body fat, acft, gfr, puppy weight; business days, days until, day of the week, shoe size, bra size, ring size, pizza, coffee ratio, ap score, sat score, word counter, password generator.
New candidates not in that list (check in Ahrefs, stats cluster extras): t test calculator, chi square calculator, anova calculator, correlation coefficient calculator, margin of error calculator, binomial probability calculator, normal distribution calculator, standard error calculator, cohen's d / effect size calculator, percent error calculator, break even calculator, rule of 72 calculator, kwh / electricity cost calculator, cost per mile / mileage reimbursement calculator.
