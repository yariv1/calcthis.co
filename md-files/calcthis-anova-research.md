# ANOVA calculator: research report (2026-11-27) - roadmap candidate

Ahrefs (from the project notes, not re-checked today): "anova calculator" >1000 Medium. ONE page `/anova-calculator/`, Math & Numbers stats cluster (p-value, t-test, chi square, confidence interval, z-score, correlation, regression). Title: "ANOVA Calculator: One-Way ANOVA with Tukey Test". Cross-link with t-test (two groups) and p-value (F value only). Dup-check before preview (limit 12%).
Optional Ahrefs check (separate pages only if they have real demand): two way anova calculator, one way anova calculator, tukey hsd calculator, kruskal wallis calculator, repeated measures anova calculator.

## Competitors opened LIVE 2026-11-27
1. Social Science Statistics (`/tests/anova/calculator/`, typed A 23,25,28,30,27 / B 31,33,35,29,34 / C 22,24,21,26,23): up to 10 groups, one box per group; group N, sum, mean, SS, grand mean; ANOVA table; F 19.3214, p .000177; verdict at .05; eta squared .763; APA (2 forms) / Chicago / plain with Copy; button to a separate Tukey test.
2. Stats Kingdom one-way (`180Anova1way.html`, ran its example): grid with group names, Excel paste, CSV / Excel upload, add / remove columns, example, last run, copy; alpha; rounding, outliers included / excluded, expected effect size (small / medium / large; f, f2, eta2) for a priori power. Output: APA sentence, F, p, df, eta2, f, a priori and post hoc power, residual normality p (Shapiro-Wilk), Levene p; per group n, mean, mean CI, SD, outliers, normality p; ANOVA table; hypotheses, acceptance region, effect size in words; Tukey / Tukey-Kramer (difference, SE, q, CI, critical difference, p) and difference matrix; F curve; assumption checks; power advice; R code; print.
3. Stats Kingdom two-way (ran its example): fixed / mixed / random / repeated models, with or without interaction, replicates; ANOVA table, power, effect sizes, Q-Q plot, boxplot, cell means.
4. Omnicalculator (typed A/B/C): group boxes appear as you go; F 19.321, p <.001; a "Details of ANOVA" section (contents not seen); article.
5. Statistics by Jim (ran its sample): stacked (value, group) or one box per group, variable names, classic or Welch, alpha .10/.05/.01, post hoc yes/no, print. Output: method, factor levels, ANOVA table, S, R-sq, adj, pred, group means with SD and CI, CI plot, Tukey (Games-Howell with Welch) with SE, CI, T, adjusted p and interval plot. Its text says both post hoc tests use a Sidak approximation.
6. MiniWebtool (typed A/B/C): one group per line or columns, names, alpha .01/.05/.10, 0-9 decimals, examples, 3 free runs a day. Output: ANOVA table, F, p, eta2 .76, omega2 .71 with size bands, group n / mean / SD / min / max / CI, two charts, Tukey-Kramer table, Levene W .23, Shapiro-Wilk per group, Welch F(2, 7.83) 20.53, Kruskal-Wallis H 10.46, APA sentence with Copy, hypotheses, decision, PDF / JPG, embed.
7. Pearson (ran its 3 examples): one-way (3-6 groups, labels, alpha), two-way (2-4 x 2-4, 2-5 replicates), Tukey from group means + n + within mean square + df, F critical value / p mode; F, p, F critical, ANOVA table, group n / mean / SD, mean bar chart, F curve, steps, Copy.
8. GoodCalculators (its prefilled data): add / delete groups; F, p; N, mean, SD, standard error; ANOVA table; formulas.
9. statpages.info (ran its sample): summary entry (name, n, mean, SD or SEM; up to 10 groups), confidence level; ANOVA table; Tukey with CI and p.
10. Daniel Soper (opened, not typed): summary entry n, mean, SD, up to 10 groups; ANOVA table, F, p.
Also opened: GraphPad "Post test calculator" (post tests from an existing ANOVA table; it says it does not run the ANOVA; not typed into).

## Parity list (match or exceed)
Inputs: groups with names (one box per group, 2-20); stacked paste (value + group) and column paste; summary mode (n, mean, SD or SEM); within mean square + df entry with means and n (Pearson Tukey); F value mode (df1, df2, F -> p, or alpha -> F critical); alpha with chips and own value; method classic / Welch; post hoc on / off and method; confidence level; outliers included / excluded; expected effect size (f, f2, eta2); decimals; examples.
Outputs: ANOVA table incl. total; F, p, df, F critical; verdict and hypotheses in words; group n, sum, mean, SD, standard error, SS, min, max, mean CI; grand mean; eta2, omega2, f with size words (only with a read source); S, R-sq, adjusted, predicted; Tukey-Kramer and Games-Howell (difference, SE, q, t, CI, critical difference, adjusted p) + matrix; Bonferroni; Welch ANOVA; Kruskal-Wallis; Levene; Shapiro-Wilk (residuals and per group); outlier flags; power (a priori + post hoc); group chart; F curve with rejection region; steps; APA + plain sentences with Copy.

## Dropped (needs his sign-off)
Two-way ANOVA and repeated / mixed / random models, with their Q-Q plot (a different search and data shape: own page later if Ahrefs shows demand); CSV / Excel file upload (paste covers it); R code; Print; PDF / JPG download; Share / Embed; last-run restore; Chicago sentence; more than 20 groups (GoodCalculators and Omni show no limit; not tested).

## Differentiators (not seen in the outputs read on any of them)
Visual: "Which groups differ": every value as a dot per group on one axis in the user's units, mean and interval per group, and grouping letters (groups sharing a letter are not significantly apart); click a pair to see its difference and interval against zero.
Functional: (1) the page picks the test: assumption checks, then classic / Welch / Kruskal-Wallis side by side with one recommendation and the matching post hoc (Tukey-Kramer or Games-Howell), saying whether the conclusion changes; (2) "Which group drives it": F and p with each group left out; (3) "What would it take": people per group for p below alpha and for 80% power at these means and spread, and the smallest pair difference detectable now. No sign-in, no daily limit. Studentized range computed numerically, not by a Sidak approximation.

## How the functional differentiators work
Page order: verdict + recommended test, picture, pairs, which group drives it, what would it take. All shown by default; method override in Go advanced.
1. Picks the test. Every data change runs Shapiro-Wilk on the residuals, Levene (median) and the outlier fence, plus classic, Welch and Kruskal-Wallis. Rule (labelled as our rule of thumb): normality rejected in small groups -> Kruskal-Wallis; else unequal spread -> Welch; else classic (small-group cutoff needs a read source). Pairs follow the test: Tukey-Kramer / Games-Howell / Dunn (added 2026-11-27, source to read). A line says whether the three agree at alpha. Summary-number mode has no raw values: classic and Welch only, and the page says why.
2. Which group drives it (3+ groups): rerun the shown test without each group in turn; table of statistic, p and verdict; flag a group whose removal flips it. Labelled exploratory, not a substitute for the pair tests.
3. What would it take: assume the measured means and spread and equal group sizes; smallest n per group with p below alpha, and with 80% power (noncentral F); note that measured effects tend to make this optimistic. Smallest detectable pair difference = Tukey half-width (anchor A/B/C: 3.99, so A-C 3.4 is not significant). Classic test only, labelled.

## Built 2026-11-27 (approved: "Approve all")
Changes against the plan: when Levene finds unequal spread, normality is judged group by group (0.05 shared across groups), because pooled leftovers look non-normal for that reason alone; small-group cutoff = Minitab data considerations (15 per group for 2-9 groups, 20 above); a quartile box was added to the picture and variance and quartiles to the group table (found when reopening MiniWebtool). Formula sources listed below as "to read" were all read before the build (see the Sources list on the page).

## Sources
Read 2026-11-27 (partly): NIST/SEMATECH 7.4.7.1 Tukey's method; NIST 1.3.5.10 Levene test; Wikipedia Kruskal-Wallis (method) and Shapiro-Wilk (definition); PMCMRplus gamesHowellTest documentation; SciPy 1.11 `swilk.f` (algorithm AS R94, header).
To read before the build (unread = dropped, with his sign-off): Welch ANOVA formula, studentized range distribution computation, eta2 / omega2 / f and their size bands, noncentral F power, rest of AS R94.

## Anchors
A/B/C above: SS 216.4 / 67.2, F 19.3214, p .000177, eta2 .763; Tukey A-B -5.8 (-9.79 to -1.81), A-C 3.4 (-0.59 to 7.39), B-C 9.2 (5.21 to 13.19); Welch F(2, 7.83) 20.53; Kruskal-Wallis H 10.46; Levene W .23.
Stats Kingdom example (1,2,3,3,4,4,4,4,5,5,6,6,7 / 1,1,1,2,2,2,3,4,5,6,7,8 / 8,8,8,8,8,4,4,12,12): F(2,31) 11.0293, p .0002412, eta2 .4157, f .8435, Levene p .4817, residual Shapiro p .3701, Tukey p .7603 / .001569 / .000316.
Statistics by Jim sample: F 19.18, S 1.9472, R-sq 74.20, adj 70.33, pred 62.85. Pearson: q critical 3.7729 (3 groups, 12 df).

## Engine plan (after "Approve all")
`ANOVA-ENGINE` (`CalcThis.anovaEngine` on `pvalueEngine` F and chi-square tails; studentized range by numerical integration), init `CalcThis.initAnovaCalc` (ids `an*`), css `.p-an`, generator `md-files/gen-anova-page.js` (chains after chi square). All gates; preview on request; deploy only on "Deploy".
