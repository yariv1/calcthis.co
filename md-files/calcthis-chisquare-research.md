# Chi square calculator: research report (2026-11-25)

Ahrefs (his screenshot 2026-11-24): "chi square calculator" >1000 Hard (spelling without the dash). ONE page `/chi-square-calculator/`, Math & Numbers (stats cluster: p-value, t-test, confidence interval, z-score, correlation, regression). Title: "Chi Square Calculator: Independence and Goodness of Fit". The existing p-value page takes a chi-square value only; this page takes the counts. Cross-link both ways.
Optional Ahrefs check later (separate pages only if they have real demand): chi square test calculator, chi square goodness of fit calculator, fisher exact test calculator, mcnemar test calculator.

## Competitors opened LIVE 2026-11-25
- Omnicalculator `/statistics/chi-square`: observed and expected value fields, chi-square. Goodness of fit only; no p-value field seen; article. Opened, not typed into.
- Social Science Statistics (table up to 5x5; typed 20,30,50 / 30,40,30): observed, expected, components, chi2 8.4286, df 2, p .014783, Cramer's V .2053 with strength word, verdict at .05, sentence in APA (2 forms) / Chicago / plain with Copy. Goodness-of-fit page (typed die example): O/E/(O-E)^2/E table, chi2 4.2, df 5, p .520995, "parameters estimated" field.
- GraphPad QuickCalcs: goodness of fit up to 20 labelled categories (typed): chi2 4.200, df 5, P .5210, verdict, data table with expected percent. 2x2 page: row and column labels, Fisher exact (default) / chi-square / chi-square with Yates, one or two tails (typed 20,10 / 30,40: Fisher two-tailed .0486).
- Statistics by Jim: independence only, up to 5x5, row and column labels, table with counts, expected and contributions, chi2, df, p, APA sentence (per its page text; table builder not driven).
- GigaCalculator (typed): independence / goodness of fit, paste any size, expected as proportions in column 2; result only chi2 8.428571, p .014783, df 2.
- Pearson.com: goodness of fit (2-8 categories) / independence / critical value and p mode; alpha .10 .05 .01; expected blank = equal or proportions; quick examples; advertises curve with rejection region, contribution heatmap and steps. **Result is behind a sign-in** (seen live), so its output was not seen.
- MiniWebtool (typed): independence up to 10x10 / goodness of fit (counts, proportions, percent, ratio, blank = equal), alpha .10-.001, decimals 2-10, examples; chi2, p, df, V with gauge, hypotheses, observed / expected / contribution tables with highlight, contribution bars, 9 steps, PDF/JPG, embed. 3 free runs a day.
- Stats Kingdom `310GoodnessChi.html` (ran 2x2 20,30 / 30,40: chi2 .09796, p .7543): goodness of fit + binomial / independence + Fisher / McNemar + mid-p; labels, raw-data entry, Excel paste, expected counts or probabilities, parameters estimated, continuity correction, effect size input, simulation, decimals; expected table with warnings (at least 1 everywhere, at least 5 in 80%), chi2 terms, p, phi, V, power, distribution chart with rejection region, written interpretation, R code, steps.
- Unusable: statskingdom.com/chi-square-test-calculator.html (404).

## Parity list (match or exceed)
Inputs: two-way table typed or pasted (with row / column names), raw list of paired answers; goodness of fit with category names, observed, expected as counts / percent / proportions / ratio / blank = equal, parameters estimated; chi2 + df -> p and critical value; alpha with chips; decimals; examples; Yates on/off; one or two tails (Fisher); McNemar (same people measured twice); effect size w for power.
Outputs: chi2, df, p, critical value, verdict, hypotheses in words; observed / expected / contribution tables with totals; contribution heatmap and bars; expected-count warnings; Cramer's V, phi, Cohen's w; Fisher exact (2x2), Yates, binomial exact (2 categories), McNemar chi-square, corrected, exact and mid-p; power; chi-square curve with rejection region; steps; APA / Chicago / plain sentences with Copy.
Dropped (needs his sign-off): Monte Carlo simulation, R code, Excel/CSV file upload, PDF/JPG download, Share / Embed, Print, last-run restore, tables above 20x20 (GigaCalculator accepts any size).

## Differentiators (none seen on the 8)
Visual: "Where the difference comes from": for a table, a picture with each row as a bar split into its column shares (bar thickness = row size), a dashed line where the split would be if nothing differed, each piece coloured MORE or FEWER than expected and stronger the further out; for goodness of fit, observed bars against expected markers in the same colours. Competitors checked show numbers or contribution highlighting without direction.
Functional: (1) plain-words reading with the user's names and percentages and the cells beyond +-2 adjusted residual (rule of thumb, labelled); (2) small expected counts handled on the page: Fisher and Yates side by side for 2x2, and for bigger tables or lists "merge two rows / columns / categories" with undo; (3) "What would it take": total count needed at the same shares for p below alpha, power now, count for 80% power; (4) paste a raw two-column list and the table builds itself; no sign-in, no daily limit.

## Sources READ 2026-11-25
Wikipedia: Pearson's chi-squared test (statistic, df for fit with fitted parameters, independence, homogeneity), Cramer's V, Fisher's exact test (two-sided = sum of tables with probability <= observed, as in R), McNemar's test (statistic, corrected, exact, mid-p), Yates's correction (0.5), Effect size (Cohen's omega formula; table small .10, medium .30, large .50), Noncentral chi-squared distribution (use in power). CASRAI "Standardized Residuals" (adjusted residual formula; about +-2 unusual, +-3 very unusual). Penn State STAT 504 pages returned 404, not used.
Read 2026-11-26 before the build: noncentrality = N * w^2 (pingouin power_chi2 documentation), Wikipedia "Binomial test" and "McNemar's test" (examples reproduced on the page).

## Anchors
20,30,50 / 30,40,30: chi2 8.4286, df 2, p .014783, V .2053. Die 8,12,9,14,11,6: chi2 4.2, df 5, p .520995. 20,10 / 30,40: Fisher two-tailed .0486. 20,30 / 30,40: chi2 .09796, p .7543.

## Engine plan
New `CalcThis.chiEngine` on `pvalueEngine` (chi-square tail and inverse), log-factorials for Fisher and exact binomial, noncentral chi-square by Poisson mixture. QA oracle independent (numerical integration of the density, BigInt hypergeometric brute force).
