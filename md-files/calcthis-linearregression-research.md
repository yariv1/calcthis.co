# Linear regression calculator: research report (2026-11-24)

Ahrefs (his screenshot 2026-11-24): linear regression calculator >1000 Easy; simple linear regression calculator >100 Easy; multiple linear regression calculator <100 Medium; online linear regression calculator <100 Easy; linear regression calculator ti-84 <100; non linear regression calculator <100. ONE page `/linear-regression-calculator/` (simple = same intent). Math & Numbers, after correlation / t-test. Multiple regression = separate intent, <100, NOT built (needs his sign-off to stay out).

## Competitors opened LIVE 2026-11-24
- Omnicalculator `/statistics/linear-regression`: up to 30 x,y points typed in rows, precision, scatter + line, equation y = ax + b, R2, article. No SE, CI, p, prediction.
- Pearson.com: input as Pairs / Lists / Summary stats (n, x-bar, y-bar, Sxx, Syy, Sxy), step by step, scatter plot, residuals table, predict y from x AND x from y, extrapolation warning, 6 quick-pick examples. Result: line, r, R2.
- Social Science Statistics: two columns X, Y; equation, r, R2, predicted values and residuals (result seen only as description).
- Statistics by Jim: spreadsheet grid (300 rows, paste), variable names, Linear / Quadratic / Cubic, equation, model summary (R2, adjusted R2, S), ANOVA table (sequential for polynomials), coefficient p-values, scatter with fitted line, Print.
- Stats Kingdom (typed the example): equation, slope and intercept with SE and 95% CI, APA sentence, prediction table (CI and prediction interval, SE) for typed X values, fit plot with CI and PI bands, residual plot, ANOVA table, F, p, R2, r, Sres, x-intercept, t tests of slope and intercept, Shapiro-Wilk on residuals, outlier check, predicted vs actual, QQ plot, histogram, step by step, R code, Excel/CSV load, Last run, Copy, Example.
- MiniWebtool: X and Y lists, paste two columns, predict Y for X, decimals 2-12, 4 example sets, scatter, residual chart, standard error of estimate, SE of slope, sums of squares, steps, Embed, 3 free runs a day.
- GraphPad QuickCalcs: pasted X,Y table with labels; slope and intercept with CI, R2, "is the slope significantly non-zero" (F, df, P), equation, graph; assumptions checklist (linear, normal scatter, equal spread, independent observations).
- 404 or unusable: calculator.net, GigaCalculator.

## Parity list (match or exceed)
Inputs: paired rows / two columns / pairs pasted; summary statistics (n, means, Sxx, Syy, Sxy); variable labels; examples; model Linear / Quadratic / Cubic; decimals; predict y from x; predict x from y; several X at once with interval level; confidence level; 300 rows.
Outputs: equation; slope and intercept with SE, t, p and CI; r; R2; adjusted R2; S (residual SD); F, df, p; ANOVA table (sequential F for the curves); sums of squares; x-intercept; residuals table; predicted vs actual; scatter + line; confidence band; prediction band; residual plot; outlier check; assumptions checklist; extrapolation warning; steps; APA sentence; Copy.
Dropped (needs his sign-off, same as correlation): Excel/CSV file upload, PNG/PDF export, Print, last-run restore, R code, Embed/Share, QQ plot + histogram + Shapiro-Wilk (residual normality is shown by the residual plot and a skew note instead), multiple regression.

## Differentiators (none of the 7 has them)
Visual: the scatter in the user's own units with the line, a 95% band for the line AND a wider band for one new value, thin vertical residual sticks, and a toggle "Show squares" that draws each error as a real square (least squares made visible); ringed points that move the slope most, with the line drawn without each one (leave-one-out fan, same machinery as the correlation page); a small residual plot under it; a typed x draws a dot with its interval on the chart.
Functional: "Which point is steering this line?" table (slope and R2 with each pair left out, leverage, Cook's distance, flagged); predict BOTH ways with intervals (y from x and x from y) for a list of values, with an extrapolation warning; the slope in plain words with the user's own labels and units ("each extra hour of study adds 0.60 points, give or take 0.06"); fit options (through the origin, weights, curve) with a check whether the curve helps (F-test) instead of just offering it; "What would it take" (pairs needed for a significant slope, narrower interval, power) reusing the correlation engine; assumptions check in plain words (curved pattern, fan shape, skewed residuals, outliers); five sentence styles incl. APA with Copy.

## Sources (to READ before the build; none read yet today)
Wikipedia Simple linear regression, Cook's distance, Leverage (statistics), Polynomial regression; NIST/SEMATECH 4.1 (regression); formulas already read: Prediction interval (Wikipedia).
Anchors: Stats Kingdom example (n 13): Y = 1.4021 + 0.6021 X, SE slope 0.06245, CI [0.4646, 0.7395], R2 .8942, F(1,11) 92.9583, p 1.063e-6, Sres 2.603; prediction at 7 = 5.6166, CI [4.0066, 7.2265], PI [-0.3349, 11.5681].

## Engine plan
Extend `CalcThis.ccEngine` (`pearson`, `tp`, `leaveOne`, `predict`, `planF`) with `reg` (OLS up to degree 3 via normal equations, QR or Gram for stability), SE, CI, PI, hat values, Cook's D, sequential F. Oracle = independent BigInt-free closed form for the straight line plus a separate solver for the curves.
