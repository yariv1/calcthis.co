# Correlation coefficient calculator: research report (2026-11-23)

Ahrefs (his screenshot 2026-11-23): correlation coefficient calculator >1000 Medium; linear correlation coefficient calculator >1000 Medium; pearson correlation coefficient calculator >100 Easy; sample correlation coefficient calculator <100 Medium; pearson's correlation coefficient calculator <100 Easy; correlation coefficient calculator excel / ti 84 / online <100. ONE page `/correlation-coefficient-calculator/` (one intent). Body Math & Numbers, next to p-value / t-test / z-score. No medical-section fit.

## Competitors opened LIVE 2026-11-23
- Omnicalculator `/statistics/correlation`: Pearson / Spearman / Kendall / Matthews (MCC), up to 30 points typed in x1,y1 rows, "Show calculation details", strength words (Evans 1996), no chart.
- GigaCalculator `correlation-coefficient-calculator.php`: Pearson / Spearman / Kendall, pasted x,y columns, optional third column of weights (weighted Pearson), confidence level, z score, p-value, two-sided and one-sided CI bounds, regression equation. No chart.
- Pearson.com calculator: paired rows or two columns, x and y labels, scatterplot + best-fit line, descriptive stats, significance test, Spearman, r², "Is Pearson appropriate?" check, outlier and leverage warning, calculation table, student wording, steps, causation note, 11 quick-pick examples.
- correlationcoefficientcalculator.org: Pearson / Spearman / Kendall / point-biserial, editable table with Add rows, Upload CSV/XLSX, Example, Share, interactive scatter with zoom, correlation meter with strength badge, data health check (sample size, skew, linearity), residual plot, r, r², p, t, df, 95% and 99% CI, auto interpretation, export CSV/PNG/PDF, step by step.
- Social Science Statistics: two boxes X and Y (3+ pairs), significance level 0.01 / 0.05 / 0.10, Calculate. (Result not read: shows after calculating.)
- Stats Kingdom: Pearson or Spearman, spreadsheet-style grid with paste / Excel / CSV file load, more options, Copy, Last run, "with solution". (Result not read.)
- 404 (not usable): calculator.net, Statology, GraphPad, CalculatorSoup, Inch Calculator.

## Parity list (every input / output must be matched or exceeded)
Inputs: paired data pasted as rows or two columns; typed table; variable labels; confidence level; significance level; method Pearson / Spearman / Kendall; point-biserial; weights column; examples; Excel/CSV upload; correlation matrix; Matthews (MCC); calculation steps.
Outputs: r, r², n, t, df, p (two-sided, one-sided), z, CI (two-sided and one-sided), regression equation, scatter + line, residual plot, strength words, assumptions check, outlier warning, copy / export.

## Differentiators (neither exists at any competitor)
- VISUAL: scatter in the user's own units with the best-fit line, a 95% band around the line, and a faint ghost line for every "leave one point out" so you see which dot drives r; plus an r gauge that draws the confidence interval as a bar on the -1 to +1 scale.
- FUNCTIONAL: "Which point is carrying this?" table: r with each point removed, flags any point that changes r by more than 0.1; Pearson, Spearman and Kendall side by side (no choosing first), with a plain recommendation when they disagree (curve, outlier); "What would it take": people needed to detect your r at 80% power and the smallest r that is significant with your n; predict y from a typed x with the prediction interval.

## Proposed drops (need his quoted sign-off, "Approve all" counts only if listed here)
Excel/CSV file upload (paste from Excel covers it), PNG/PDF export (Copy result instead), correlation matrix of 3+ variables (different intent, later spoke), Matthews/MCC (2x2 binary table, different input), residual plot (replaced by the leave-one-out view; can add behind Go advanced if he wants it).

## Sources to READ before building
NIST/SEMATECH e-Handbook sections on correlation (1.3.5.x / 4.1.x) and Fisher z interval; Evans 1996 labels are from Omnicalculator only (flag if used). Existing engines: `CalcThis.pvalueEngine`, `CalcThis.ciEngine`, `CalcThis.ttEngine` (power).
