# Amortization calculator research (2026-11-14) — /amortization-calculator/ (#12)

Ahrefs (his screenshots 2026-11-07): amortization calculator >100K Hard; loan amortization >10K Hard; mortgage amortization >10K Hard; with extra payments / car / auto loan / simple monthly >1000 Hard.
Reuses `CalcThis.loanEngine` (matches calculator.net to the cent). Money & Finance, currency picker `amCur` always top-right.

## Competitors opened LIVE 2026-11-14
Bankrate: blocked by a human-verification wall (not bypassed). NerdWallet: widget unreadable (not retried).

### calculator.net/amortization-calculator.html
Inputs: loan amount, loan term (years + months), interest rate, start month + year; checkbox "Optional: make extra payments": extra monthly (amount, start month/year), extra yearly (amount, month/year), extra one-time (amount, month/year), plus a "+ add" list of up to 10 extra one-time payments (xa1-10 with month/year).
Outputs: monthly pay, principal/interest split bar (66/34), total of N payments, total interest, chart (balance, interest, payment by year), Annual Schedule and Monthly Schedule tables (Year, Interest, Principal, Ending Balance), Print. With extras: shows payoff time + interest saved (extras block).
Text: what is amortization (loan vs accounting), schedule explanation.

### omnicalculator.com/finance/amortization
Inputs: loan amount + currency (21), term (months / years / years+months), interest rate, compounding frequency (yearly, semi-annual, quarterly, monthly, weekly, daily, continuous), payment frequency (yearly, semi-annual, quarterly, monthly, bi-weekly, weekly, daily), extra payment per period + currency.
Outputs: original periodic payment, total payment + total interest, with-extra plan (shorter term / saved interest), chart (principal balance, principal paid, interest paid), periodic or yearly balances table, share result.
Text: definition, formula, schedule explanation, extra payments section.

### mortgagecalculator.org/calcs/amortization.php
Inputs: purchase price, down payment ($ or %), loan amount, term (days / weeks / months / years), APR, payment frequency (daily, semi-weekly, weekly, biweekly, semi-monthly, monthly, bimonthly, quarterly, semi-annually, annually), loan date (month, day, year).
Outputs: payment amount, results panel (principal, rate, term, payment type, payment), inline schedule button, printable schedule, share results; local rates tables.

## Parity list (every input / output must be matched or exceeded)
Inputs: loan amount, term years+months (also weeks/days? -> term in years + months, plus a "term in" csel for days/weeks only if loanEngine supports it; otherwise dropped with his sign-off), interest rate, start date, compounding frequency (7), payment frequency (daily ... annually incl. bi-weekly, semi-monthly), extra payment per period, extra yearly, extra one-time (several, with dates), purchase price + down payment ($ / %), currency picker.
Outputs: payment, total paid, total interest, principal vs interest split bar, balance chart, annual schedule, monthly/per-payment schedule, interest saved + time saved with extras, print, share/copy, payoff date.

## Differentiators (proposed, ONE visual + ONE functional)
VISUAL: stacked bar of EVERY payment (principal vs interest) so the shift from mostly interest to mostly principal is seen at once, with the crossover payment marked ("from payment 153 more goes to principal than interest") and a draggable marker that reads out balance, interest paid so far and equity at that point. No checked competitor draws the split per payment (c.net: balance line; Omni: cumulative lines).
FUNCTIONAL: "Where am I now?" — type a payment number or a date (or the loan start) and get balance owed, principal + interest paid so far, interest still to pay, payments left, payoff date; plus a payoff-faster table (extra 50/100/250 per period -> months saved, interest saved, click a row to apply). Competitors need you to scroll a 360-row table for this.

## Sources
Formula/definition: to be READ before build (Wikipedia "Amortization calculator" / "Amortization schedule"); numbers from `loanEngine` (already verified to the cent vs calculator.net).
