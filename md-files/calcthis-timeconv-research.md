# Time conversion pages - research (2026-11-10)

Ahrefs (his screenshots): `seconds to hours` >10K Easy (1,493 kws; 86400, 7200 >1K; 43200, 14400, 10000, 3600, 36000, 21600 >100), `minutes to hours` >10K Easy (5,281 kws; 150, 180, 300, 1000, 115, 360 minutes to hours >1K; `minutes to hours converter`, `convert minutes to hours` >1K), `seconds to minutes` >10K Easy (3,256 kws; 300, 3600, 900, 1000, 500, 90, 1200, 1800 seconds to minutes >1K), `hours to seconds` >1K Easy (301 kws; 3/24/12/5/8/4/10/6 hours to seconds >100).
DECISION (his question, accepted): THREE separate pages, one per head keyword, one shared engine. `hours to seconds` = reverse mode + section on the seconds-to-hours page (too small for its own page).
Pages: `/seconds-to-hours-calculator/`, `/minutes-to-hours-calculator/`, `/seconds-to-minutes-calculator/` (Math & Numbers / Time group next to Time + Hours calculators).

## Competitors (opened LIVE 2026-11-10)
- **Omni** (omnicalculator.com/conversion/seconds-to-hours-converter, 717 helpful votes): linked boxes Seconds <-> Hours, plus a "Time" mixed box with a unit dropdown (seconds, minutes, hours, min/sec, hrs/min, hrs/min/sec). Example 7,260 s = 2.0167 h = 2 h 1 min. FAQ: seconds in an hour / day / week / 30-day month, 1,920 s = 0.533 h. Links to hours-to-seconds, minutes-to-seconds, seconds-to-minutes, time unit converter.
- **Inch Calculator** (inchcalculator.com/convert/second-to-hour, minute-to-hour, second-to-minute): one value box, direction switch (swap), result decimal AND "1 hr 30 min" (h/min/s) form, formula, step-by-step method for h:m:s, "what is a second / hour", conversion table (seconds: 1, 100 ... 86,400, 100,000; minutes: 1 ... 10,000 incl 1,440), links to other time units (centuries ... nanoseconds).
- **DQYDJ** (dqydj.com/seconds-to-hours-calculator, minutes-to-hours, seconds-to-minutes): one box + Calculate button, outputs decimal and "mixed" (hours + remainder). Plain, links to 15 other time pairs.
- **Search snippets only (not opened, not used for parity)**: OnTheClock / Harvest / Engineering Toolbox / CalculatorSoup minutes-to-decimal pages (payroll decimal hours: h + m/60, 7.5 h is 7:30 not 7:50, rounding to 2-4 decimals, 8.75 -> 8 h 45 min).

## Parity list (every input / output / extra they have)
Inputs: one value in the source unit (all); reverse direction hours->seconds etc. (Inch swap, Omni linked boxes); linked two-way boxes (Omni); mixed unit "Time" box (Omni); direction links.
Outputs: decimal result (all); mixed result h/min/s (Inch, DQYDJ, Omni); formula (Inch); step-by-step method (Inch); worked example (Omni, Inch); conversion table (Inch); FAQ: seconds per hour/day/week/month (Omni); what-is-a-unit text (Inch); links to sibling time converters (all). Nothing dropped.

## Our build (shared by the three pages)
ONE smart value box in the page's own unit (default view minimal), result = decimal in the target unit as the big line + sub-line in plain words ("2 hours 1 minute 0 seconds"). Linked boxes so the reverse works without a switch: typing in the target box fills the source (covers `hours to seconds`). Result table "every format at once": decimal (up to 6 places, rounded to 2 for payroll shown beside), h:mm:ss clock form, words, total in the other units (seconds / minutes / hours / days). Copy on each line. Formula + worked step line always visible. Reference table of the searched numbers (the Ahrefs list per page), each row clickable = fills the box. Sections: how many seconds in a day / week / month, hours to seconds, common mistake (7.5 h = 7:30).

### Visual differentiator (none of the three has one)
"Clock ring": a ring that shows the value on a real clock face of the target unit (seconds-to-hours: the hour; minutes-to-hours: the hour; seconds-to-minutes: the minute), whole units as a count of full rings ("2 full hours") and the remainder as a shaded wedge with its h:m:s label, drawn to scale from the typed value. All three competitors show text only.

### Functional differentiators
1. Paste a list (Go advanced, one value per line, or comma separated; also h:mm:ss values) -> every line converted + a TOTAL in all formats (timestamps, split times, logs; competitors take one value at a time).
2. Accepts any typed format in the box: 5400, 5,400, 1.5, 1:30:00, 1h 30m, "90 min" (units understood, wrong unit gets a hint) - competitors accept a bare number only.
3. Two-way linked boxes + all units at once (Omni has two boxes only); mixed result always shown (Inch/DQYDJ/Omni have it).
4. Minutes-to-hours page extra: payroll rounding (nearest 5 / 6 / 15 minutes, hours.2 decimals, same rule as the Hours calculator) shown beside the exact value, plus the "7.5 hours is 7:30 not 7:50" check.
5. Every input visibly reacts (QA item 19): empty, junk, negative (shown as negative duration / hint), huge (> 1e12), decimals, unit text mismatches.

## Math / sources
Exact: 1 h = 60 min = 3,600 s; 1 day = 86,400 s (definition of the day as 24 h; SI second per BIPM, quoted by Inch Calculator). Decimal division with exact integer remainder for the mixed form (no float drift: seconds are integers or decimals handled by BigInt-safe scaling). Oracle = independent integer maths + brute force on random values. Nothing health/legal, no unread numbers.

## SEO
Titles <= 60 chars starting with the keyword (e.g. "Seconds to Hours Calculator: Convert s to h:m:s"). Each page own head keyword + its long-tail numbers as table rows/H2s. Cross-links between the three, to Hours calculator (Convert tab), Time calculator, Unit converter. Hours-to-seconds as H2 + reverse box on the seconds-to-hours page.
Dup check (md-files/dup-check.js) to run after the build: the three pages share structure but differ in title/H1/table/FAQ numbers; keep unique text.

## Not doing
Weeks / months / years pages (not checked in Ahrefs; DQYDJ has them: ask him to check `days to hours`, `hours to minutes`, `minutes to seconds`, `hours to days` if he wants more pages queued). A new page for `hours to seconds` (301 kws, section instead).
