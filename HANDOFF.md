# SESSION HANDOFF — read this FIRST, then CLAUDE.md hard rules

> **UPDATE 2026-10-26 (late): Loan Calculator SHIPPED v163 (commit 5343023, 52 calcs, 84 pages). NEXT = Auto Loan Calculator on the same `loanEngine` (engine now also has `prate, runP, borrowable, aprFromCash`; UI in `CalcThis.initLoanCalc`, ids `ln*`, shares `.p-loan`). Everything below that says "next = Loan" is stale; read it as Auto Loan.**

_Rewritten 2026-10-26 at the end of the Triangle + Mortgage session (v154 → v159). Everything below is current.
The next session must start FULLY synced from this file + CLAUDE.md + the memory files. The user must NOT have to
re-explain anything in here — that is the whole purpose of this file. (User, 2026-10-26: "do not dare to start the new
session confused … a smooth and seamless continuation without me explaining again and again.")_

---

## 0. THE 60-SECOND VERSION (read this if nothing else)

- **Live:** asset **v163** · **52 calculators** · **25 blog articles** · **84 pages**. `main` clean and pushed
  (last code commit `5343023` Loan Calculator v163, shipped after this handoff was written; docs commits after it). Nothing is half-built. Nothing is waiting on the user.
- **Shipped this session:** **Triangle Calculator** (v154) and **Mortgage Calculator** (v159 — opens the new
  **Money & Finance** category). Earlier this week: Recipe Converter (v144), BMR (v146), Hours (v150, fixes v152).
- **NEXT TASK: Loan Calculator, then Auto Loan Calculator — both on the SAME engine `CalcThis.loanEngine`** (already in
  `assets/app.js`). The user approved the research report (Mortgage first, then Loan + Auto Loan as thinner pages on
  the same engine; drops and Go-advanced split listed in §4). **The research findings are saved in §4 — do NOT redo the
  research from scratch**, but I told the user "each with its own approval", so the flow is: short Rule-8 plan for
  the Loan page (what is new vs Mortgage; ≤3 decisions with recommendations) → wait for "approved" → build → full QA
  (items 1-14, §3.2) → preview → "deploy".
- **First move next session:** a **2-3 line "synced" reply** (v159 / 51 calcs / next = Loan Calculator), then the
  short Loan plan. No recap of this file.
- **After Loan + Auto Loan** (user decided 2026-10-25 to build ALL the Hard high-traffic ones, taking the Easy
  long-tails): **Paycheck** (fetch current IRS tables first) → **Sales Tax** → **Unit Converter** → **Tip** →
  **Random Number Generator**. Ranked plan: `md-files/calcthis-calculator-roadmap.md`.
- **The 5 rules that cost the user time/money when broken (details §3):**
  1. **ZERO narration** (violated ~5 more times this session; the Stop hook catches it).
  2. **QA/debug EXHAUSTIVELY after every build, before any preview** — the Mortgage calc reached preview with a
     happy-path-only QA and the user found a nonsense value in seconds. New QA items 11-14 (§3.2) exist because of it.
  3. **Never invent / never guess** — copy existing patterns.
  4. **Deploy only on the user's explicit word "deploy".**
  5. **Terse replies; final summary = findings + QA list (incl. what was NOT verified) + preview links.**

---

## 1. Exactly where we are

| Item | State |
|---|---|
| Asset version | **v159** (`.assetver`), pages stamped `?v=159` |
| Calculators live | **51** (Construction 13 · Health 20 · School 5 · Math 11 incl. Hours + Triangle · Cooking 1 · **Money & Finance 1 = Mortgage**) |
| Blog articles | **25** (none since v110ish — articles are deferred) |
| Pages in sitemap | **83** |
| Git | `main`, clean, pushed. Last code commit `9b18285` (Mortgage v159). Later commits are docs only |
| Preview server | `calcthis-static` (`python -m http.server 8123`) via `preview_start`. **It dies between turns sometimes** — if `navigate` says "navigation denied/failed" or the user says preview doesn't work, run `preview_start {name:"calcthis-static"}` again |
| Hook | `.claude/hooks/check-narration.cjs` wired in gitignored `.claude/settings.local.json` — blocks narration |

### What was built this session
- **Triangle Calculator** `/triangle-calculator/` (v154) — Right triangle (any 2 values, Pythagorean) + Any triangle
  (SSS/SAS/ASA/AAS/SSA incl. the ambiguous case showing BOTH triangles), live to-scale diagram, special-triangle +
  Pythagorean-triple recognition, steps, "Pythagoras in squares". `CalcThis.triEngine` (pure, `TRIANGLE-ENGINE:START/END`)
  + `CalcThis.initTriangleCalc`, `.p-tri`. User corrections after preview (now permanent): **placeholders are plain
  numbers ("e.g. 3"), never √/π symbols** (roots/pi/sqrt still parse but are only explained in the helper note);
  **Right-triangle mode shows an explicit locked line "Angle C = 90° — the right angle, always fixed…"** (the user asked
  "what if I want to change angle C?"). Not built vs the approved report: heights ruler (heights are in the table + diagram);
  length unit is a label only.
- **Mortgage Calculator** `/mortgage-calculator/` (v159) — see §4 for the full inventory + engine API. First calculator of
  **Money & Finance** (header col 3, 6th footer pillar `repeat(6,1fr)`, homepage tab `data-cat="finance"` + `#grp-finance`).
- Docs/rules: QA items 11-14 added to CLAUDE.md + workflow Rule 10 + memory `calcthis-deep-qa-hard-rule`.

---

## 2. What to do first in the next session (in this order)

1. **Read** this file, then CLAUDE.md (top hard rules), then the memory index. Do NOT start work before.
2. **Reply in 2-3 lines only:** synced · v159 / 51 calculators · next = Loan Calculator (then Auto Loan). No recap.
3. **Loan Calculator plan (short, ≤3 decisions, recommendations given) — WAIT for approval** (§4 has everything researched):
   - It is the Mortgage page minus the home-specific parts, plus the extra frequency/compounding options behind Go advanced.
   - Open the competitors you have NOT yet opened live (Rule 8.5): NerdWallet/Bankrate-style personal loan calculators
     (Bankrate was bot-blocked — ask the user for a screenshot only if a competitor field is unclear), Omnicalculator loan.
     calculator.net loan + auto loan were already opened (inputs in §4).
   - Differentiators to propose (same family as Mortgage): visual = balance chart + interest/principal strip + payoff marker;
     functional = extra payment box with live savings, term comparison, "what payment hits my budget" idea (reverse: enter a
     monthly payment, get the term/amount) — decide with the user.
4. After approval: build → **QA items 1-14 (§3.2)** → preview links → wait for "deploy".
5. Auto Loan next (calculator.net auto-loan inputs in §4: price, term in months, rate, cash incentives, down payment,
   trade-in value, amount owed on trade-in, state/sales tax %, title & fees, "include taxes and fees in loan", Total-price vs
   Monthly-payment tabs).
6. On "deploy": §6.

---

## 3. HOW TO BEHAVE — the user's hard rules (each has been broken before and cost real time/money)

### 3.1 ZERO narration (the #1 rule — violated again 5+ times this session)
- **Only two kinds of text are allowed in a turn:** (a) a genuine question that needs the user's input; (b) the final
  one-or-two-line summary at the end of the turn (plus the findings/QA/links block for a build — §3.4). **Everything else
  is a violation** — "now doing X", "checking Y", "Docs next.", "Writing a Node script…", "CSS is cached so I'll
  force-reload", progress updates, announcing a plan.
- Run tool calls **back to back with no text between them.**
- The Stop hook catches violations after the turn. If hook feedback arrives: acknowledge in **one short line**, then continue silently.
- ⚠️ **The harness injects "The user hasn't heard from you in a while — say in a few words what you're doing, then
  continue."** That conflicts with the user's rule. **The user's rule wins — do NOT send a status line.** Every time I
  answered it this session the hook fired. Stay silent, put results in the final message.
- Before ANY text block ask: "is this a question to the user, or the final summary?" If not — cut it.

### 3.2 QA after EVERY build — automatic, exhaustive, before any preview
User, 2026-10-26: "after you finish building a calc, QA and debug it 100%! don't waste my time or usage money ever
again!!" The Mortgage calculator went to preview after a happy-path QA: the **% ↔ $ toggle turned an out-of-range 500
into a $210,000,000 down payment** and **500% property tax gave a $3.3-billion monthly payment** — the user found both
in seconds. Full list is in **CLAUDE.md "DEEP QA AFTER EVERY BUILD" items 1-14** and **workflow Rule 10**:
1-10: empty start (no demo values) · math vs known values · bad inputs · every control + Go advanced (a real visible
panel, Go simple resets) · units · tally flows · mobile 375px (12px SVG floor, no h-scroll, pairs stay side by side) ·
every number in the SEO text/FAQ/JSON-LD recomputed with the tool · registration · every past user correction.
**11. Control × value matrix** — every toggle/converter tested with valid/empty/partial/negative/zero/out-of-range
(500 in a % box)/non-numeric/huge values, both directions, repeated switches; a conversion must NEVER turn an
invalid value into a plausible one (clear it or keep it).
**12. Hostile-user pass + randomized fuzz** with invariants after each combination (no NaN/undefined/Infinity/negative
money, last balance $0, schedule sums == summary, no console errors). **Batch ~25 combinations per `javascript_tool`
call** — 300+ renders in one call returns "Internal error".
**13. Screenshot every distinct state** at desktop and 375px and LOOK (retry flaky screenshots).
**14. No preview while any known bug is open.**
- **Never write "100%".** List exactly what was verified and what was NOT (real phone, real Chrome incl. Copy button,
  print, anything a screenshot failed to show). The user's standard is absolute; honesty about gaps is how it is met.
- Check the build gates BEFORE deploy without pinging IndexNow (§6).

### 3.3 Never invent, never guess
Copy the existing pattern/live reference page exactly (Mortgage = freshest for finance, Triangle/Hours/Paint for others).
If unclear, **stop and ask**. Never change an existing element's colour/weight/size while restructuring. **Grep the design
system + nearest live page for any input widget BEFORE building** (the `.len-toggle` % / $ switch inside an `.inp` already
existed and was reused for the down payment/property tax).

### 3.4 Process rules
- **Calculator build order:** research report → approval → build → QA (§3.2) → preview → "deploy". Never fold steps.
- **Every research report needs a visual AND a functional differentiator**; ≤3 decisions, each with a recommendation.
- **Never ship fewer inputs than competitors** (Rule 8.5); dropping any needs the user's sign-off in the report.
- **A bare "preview" request = ONLY the localhost link, nothing else.**
- **Final message of every build contains:** (1) findings — how we differ from/beat competitors, (2) the QA list incl. what
  was NOT verified, (3) preview links `http://localhost:8123/<slug>/` + `http://10.0.0.19:8123/<slug>/`.
- **Deploy is gated:** build + commit + push ONLY on the user's explicit "deploy". "Looks good" ≠ deploy.
- **Terse replies.** Tables only for research reports.
- **Articles are DEFERRED** (since 2026-10-05): never write, propose or ask. Calculators with no article (awaiting a
  future batch): Fraction, Standard Deviation, Paint, Wallpaper, Scientific Notation, Recipe Converter, BMR, Hours,
  Triangle, Mortgage.
- Use `mcp__ccd_turn__update_plan` as the first call of a task turn and `wrap_up` at the end (app requirement).

### 3.5 Concrete UI corrections the user made (permanent — check every new calculator against them)
- A user-entered **name must be visible** in lists as a **label ABOVE its row**; never invent labels; numeric columns on
  one aligned line; sub-text keeps grey 12px weight 500; **paired fields stay side by side on mobile**.
- **Go advanced must open a real visible panel above the button**; Go simple resets everything.
- **Sticky `.mbar`** shows the live result on mobile; **start EMPTY** (an "example" chip that fills the form on click is fine);
  field spacing is global (`.fld{margin-bottom:15px}` — never add per-page).
- Narrative-takeaway sentences get `.res-tip.adv-tip` (16px amber) at authoring time; context-only notes get plain `.res-tip`.
- 12px floor for SVG text (at 375px the rendered size must be ≥12 → use font-size 13 in a 300-wide viewBox); ≥14px body text.
- **Placeholders are plain numbers ("e.g. 400000"), never symbols or jargon** (Triangle). If a field accepts extra syntax,
  say so in the helper note, not the placeholder.
- **If a mode fixes a value (right triangle: C = 90°), show it explicitly** instead of hiding the field.
- **Never change the input way/look inside one calculator between modes** (Hours week mode lesson). Time fields = the
  Time Calculator's `.time-field`/`.ap-seg`, never an invented AM/PM selector.
- Hint messages name the field and give an example of a valid value for THAT field.

---

## 4. The Loan / Auto Loan work — everything already researched and decided

### 4.1 The Mortgage page that exists (copy its patterns)
Files: `mortgage-calculator/index.html` (page — copy it; the generator script was temporary and is gone), `assets/app.js`
(search `LOAN-ENGINE:START` and `CalcThis.initMortgageCalc`), `assets/style.css` (`FINANCE · MORTGAGE CALCULATOR (body.p-loan)`
block — **reuse the `.p-loan` body class on the Loan and Auto Loan pages**), registration in `partials/*`, `build.js`, `sitemap.xml`, `index.html`.
- **Default view:** Home price · Down payment (`.len-toggle` % / $ inside the input, exact value carried across a switch
  ONLY when valid) · Interest rate + Loan term side by side (`.ln-two` grid, never wraps) · 10/15/20/30-year chips ·
  "Extra payment per month" · one "See an example" chip. Result card: big monthly payment, two `.res-tip.adv-tip`
  takeaways (first-payment split + year principal overtakes interest; extra-payment savings), PMI note, **balance chart**
  (SVG 300×190, base curve + extra-payment curve + crossover marker), **per-year interest-vs-principal strip** (SVG
  300×84, dashed 50% line), lifetime principal/interest bar, summary `.dtable`, line-by-line monthly cost table + bar
  (only when costs entered), **term comparison table** (10/15/20/30 + the current term, current row `tr.cur`),
  Amortization schedule with Yearly/Monthly `.seg`, sticky `.mbar`.
- **Go advanced (real panel above the button):** start month (`.csel`) + year · property tax (% or $/yr) · insurance · PMI
  (% of loan/yr, auto-ends at 80% of price) · HOA ($/mo) · other costs · costs-rise-per-year % · yearly extra (+ month
  `.csel`) · one-time extra (+ month + year) · compounding seg Monthly (US/UK) / Semi-annual (Canada) · results: bi-weekly
  table + Copy results. Go simple clears all of it.
- **Validation (keep for the loan pages):** price ≤ 1e9; rate 0-30; term >0 and ≤50 years; down % < 100 / $ < price;
  extra ≥ 0; one-time extra must fall within the loan; tax % ≤ 100; PMI ≤ 10; cost growth ≤ 50; any yearly cost ≤ price.
  Half-typed (`.`, `-`) stays quiet; garbage → "Can’t read “Field” yet — type a plain number like <example for that field>."
  The % ↔ $ toggle **clears** the field if the value can't convert sensibly (the user's bug).
- **IDs** use prefix `ln` (lnPrice, lnDown, lnDownSeg, lnRate, lnTerm, lnTermChips, lnExtra, lnEx, lnAdvBtn, lnAdvIn,
  lnStartM/Y, lnTax, lnTaxSeg, lnIns, lnPmi, lnHoa, lnOther, lnGrow, lnYAmt, lnYM, lnOAmt, lnOM, lnOY, lnCompSeg,
  lnResLab/Big/Sub, lnResults, lnTip, lnSave, lnPmiNote, lnChart, lnChartLeg, lnStrip, lnLife, lnLifeLeg, lnSum, lnCostWrap,
  lnCostBar, lnCostTbl, lnCostNote, lnTerms, lnBiWrap, lnBiTbl, lnBiNote, lnCopy, lnSchedSeg, lnSched, lnSchedNote, lnMLab/MVal/MDec).
  For a new page either reuse a prefix per page (`ln`/`al`) and a new `CalcThis.initLoanCalc`/`initAutoLoanCalc`, or factor
  shared rendering out — **do not break `initMortgageCalc`**; re-run its checks after touching the engine.

### 4.2 Engine API (`CalcThis.loanEngine`, pure, no DOM, `LOAN-ENGINE:START/END` — eval-testable in node)
- `mrate(apr%, comp)` monthly rate; `comp` `'us'` (apr/12) or `'semi'` (Canadian semi-annual: (1+apr/200)^(1/6)−1).
- `pmt(P, r, n)` payment (r = 0 → P/n).
- `run({P, apr, n(months), comp, extra, yAmt, yMonth, oAmt, oAt, startMonth})` → `{pay, r, rows[{k,start,intr,sp,pr,pay,bal}], count, totInt, totPaid, cross}`
  (`sp` = scheduled principal, `pr` = principal incl. extras, `cross` = first payment where principal > interest).
- `biweekly(P, apr, pay)` → `{periods, months, interest}` (half payment every 2 weeks, interest apr/26).
- **Engine is MONTHLY ONLY.** The Loan page needs other payment frequencies + compounding → extend the engine
  generically (periods per year, per-period rate from the compounding rule) **without changing Mortgage results**.
  **Regression anchors (must stay exact):** $320,000 @ 7.237% × 360 → $2,180.14 / interest $464,851.55 (matches calculator.net);
  $320,000 @ 6.5% × 360 → $2,022.62 / interest $408,142 / principal overtakes interest at payment 233 (year 20);
  15-year $2,787.54 / $181,758; $200 extra → 281 payments, saves $105,429; 0% rate → P/n; semi-annual 6.5% → $2,004.49;
  $380,000 @ 6.5% PMI ends from payment 125 (balance ≤ $320,000 after payment 124).

### 4.3 Competitor research (Rule 8/8.5 — already done for this family, 2026-10-26)
- **calculator.net Mortgage:** home price, down payment (% or $), loan term (years), rate, start date; taxes & costs
  (property tax, home insurance, PMI, HOA, other; each % or $); More Options: annual cost increases, extra monthly/yearly/
  one-time payments, "show biweekly payback results". Results: monthly pay, total, donut, amortization annual/monthly + chart.
- **NerdWallet:** home price, ZIP, down payment, term buttons 30/20/15/10, rate (national avg / best / enter own), edit taxes/
  insurance/HOA, PMI only when <20% down; monthly payment + donut, payoff date, amortization.
- **Omnicalculator:** home value, down payment (% and amount), loan amount, rate, term (months/years), **interest
  calculation method (monthly US/UK, semi-annual Canada)**, **payment frequency (monthly, semi-monthly, bi-weekly,
  accelerated bi-weekly, weekly, accelerated weekly)**, first day, currency picker (21), PMI, further specs.
- **mortgagecalculator.org:** home value, down payment, loan amount, rate, term, start month/year, property tax, PMI, home
  insurance, HOA, loan type (Conventional/FHA/VA/USDA), buy/refi, balance-over-time stacked chart. **Bankrate blocked (bot check).**
- **calculator.net Loan Calculator:** modes **Amortized loan** (amount, term years + months, rate, **compound: annually (APY),
  semi-annually, quarterly, monthly (APR), semi-monthly, biweekly, weekly, daily, continuously**, **pay back: every day/week/
  2 weeks/half month/month/quarter/6 months/year**), **Deferred payment loan**, **Bond** (the last two were DROPPED by the
  user). Results: payment, total of N payments, total interest, principal/interest pie, amortization table.
- **calculator.net Auto Loan:** tabs Total Price / Monthly Payment; auto price, loan term (months), interest rate, cash
  incentives, down payment, trade-in value, amount owed on trade-in, your state, sales tax %, title/registration/other fees,
  "include taxes and fees in loan"; results monthly pay, total loan amount, sale tax, upfront payment, total of N payments,
  total interest, total cost (price + interest + tax + fees), loan breakdown pie, amortization annual/monthly + chart.
- **User decisions (approved 2026-10-26):** (1) Mortgage first, then Loan and Auto Loan on the same engine, each approved
  in turn; (2) DROPPED: live mortgage rates, ZIP lookup, FHA/VA/USDA selector, currency picker (use `$`), Bond + Deferred
  modes; (3) Loan page: payment frequency (daily…yearly) and the full compounding list live behind **Go advanced** only.
- Ahrefs (from the roadmap): Loan >100K Hard, Mortgage >1M Hard, Auto Loan Hard high-traffic.

### 4.4 Registration checklist for each new Money & Finance page
`partials/header.html` (col 3, under "Money & Finance") · `partials/footer.html` (Money & Finance pillar) · `build.js` PAGES ·
`sitemap.xml` · `index.html`: inline nav + inline footer, JSON-LD `hasPart`, card inside `#grp-finance`, prose clause + the
spelled-out count (now **"fifty-one calculators in all"** → "fifty-two" for Loan) · generate the page with correct
JSON-LD (WebApplication `applicationCategory: FinanceApplication` + FAQPage), `.related-calcs` pills, 5 FAQs whose numbers
are COMPUTED from the engine (not typed) so text == tool.

---

## 5. What matters NOW vs what does NOT matter now

**Matters now:** many calculators, fast (SEO traffic is the guiding light); exhaustive QA before any preview (§3.2);
short reports with a visual AND a functional differentiator; honesty about what is/isn't verified; zero narration.

**Does NOT matter now — do not raise, do not do, do not ask:**
- **Blog articles** (deferred; list in §3.4). **Dark mode** (parked). Grade/GPA per-row `.csel` retrofit.
- **Pregnancy / Due Date + Ovulation** — parked until AdSense approval (ask once if it landed, else ignore).
- **Letter Grade** and **Cooking Measurement** calculators — dropped.
- Live mortgage rates / ZIP / FHA-VA-USDA / currency picker / Bond-Deferred modes — dropped by the user (§4.3).
- A heights ruler on the Triangle page (not built, user didn't ask again).

---

## 6. How to build and ship a calculator here (files to touch — all of them, every time)

Read first: `assets/style.css`, `assets/app.js`, `partials/header.html`, `partials/footer.html`, `build.js`, `sitemap.xml`,
one reference page; skill files in `md-files/` (design-system, new-page-checklist, workflow-rules).

1. `<slug>/index.html` — header/footer markers (`<!--HEADER:START/END-->`, `<!--FOOTER:START/END-->`; `build.js` re-stamps
   them), JSON-LD, `.related-calcs`, SEO text + 5 FAQs, `<body class="p-xxx">`, init call at the bottom.
2. `assets/style.css` — a labelled `.p-xxx` block (LF file; no inline `<style>`; no per-page `.fld` rule).
3. `assets/app.js` — `CalcThis.initXxx` inserted **before** the "SITE FOOTER — mobile accordion" comment block (CRLF file).
4. `build.js` PAGES · `partials/header.html` · `partials/footer.html` · `index.html` (nav, card, hasPart, prose, footer) · `sitemap.xml`.
5. **QA (§3.2)** → serve preview → links → wait for "deploy".
6. **Check the build gates without pinging IndexNow** (the ping submits ALL sitemap URLs). Run from the repo root:
   ```bash
   node -e "const fs=require('fs');let s=fs.readFileSync('build.js','utf8');const a=s.indexOf('/* ===== INDEXNOW:START'),b=s.indexOf('/* ===== INDEXNOW:END ===== */')+'/* ===== INDEXNOW:END ===== */'.length;fs.writeFileSync('_build_noping.js',s.slice(0,a)+s.slice(b));" && node _build_noping.js | tail -3; rm -f _build_noping.js
   ```
   It stamps pages and bumps `.assetver` harmlessly (it bumped v155→v158 this session before the real deploy at v159).
7. **On "deploy":** `node build.js` (bumps `.assetver`, stamps partials, pings IndexNow), `git add -A`, commit with the trailer
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`, `git push origin main`; then update **CLAUDE.md** (counts,
   live list, "Last session", start-here block), **HANDOFF.md** (§0/§1/§2), the roadmap md (✅ shipped vN), memory
   (`calcthis-roadmap-status`, `MEMORY.md`) and push a docs commit.

---

## 7. Environment gotchas (save yourself the debugging)

- **Write scripts with the Write tool into the scratchpad** and run them with node — `node -e` / heredocs mangle backticks and
  regex backslashes. `String.replace(str, replacementString)` treats `$'`/`$&` specially → **always pass a function replacer**.
- **Line endings are mixed:** `app.js`, `index.html`, many md files are CRLF; `style.css` is LF. The `Edit` tool works with
  single-line `old_string`s on CRLF files; for multi-line edits use a node script that normalises `\r\n`↔`\n`. Git prints CRLF warnings — harmless.
- Python is not installed except what `preview_start` runs for the server (use node for scripts).
- **Browser pane:** the first screenshot often times out — retry; screenshots can be stale after a scroll. **Stale JS/CSS:** the page
  loads `app.js?v=N` from cache → run `await fetch('/assets/app.js?v=<exact current v>',{cache:'reload'}); await fetch('/assets/style.css?v=<same>',{cache:'reload'}); location.reload()`
  — the `?v=` must be the **exact** one the page references (it bumps every build run). Reset `resize_window` to `desktop`
  afterwards. **`javascript_tool` returns "Internal error" if a loop does too many renders — batch ≤ ~25 render-heavy iterations.**
- **Drive tests with JS**: set `.value` + dispatch `input` events (or change `.csel` `.value` + dispatch `change`), read DOM output, run
  case tables vs hand-computed values; `read_console_messages` (onlyErrors).
- **Real Chrome** (`mcp__claude-in-chrome__*`, deferred — load via ToolSearch) is available for real-click tests (clipboard needs a real
  click). Not used for Triangle/Mortgage — still listed as "not verified" in their summaries.
- Money inputs: `<input type="text" inputmode="decimal">` + custom parse that strips `$ , % spaces` (keeps decimals reliable).
- `node build.js` writes ~83 files (every page gets the new `?v=`) — expected; commit them all.

---

## 8. Backlog (ranked — `md-files/calcthis-calculator-roadmap.md`)

| # | Calculator | Notes |
|---|---|---|
| **NEXT** | **Loan Calculator** then **Auto Loan Calculator** | same `loanEngine`; research in §4; Loan >100K Hard |
| next | **Paycheck** | >100K Hard; state pages (TX/FL/IL/hourly) >10K Easy; **fetch current IRS tables first** (YMYL) |
| next | **Sales Tax** | >10K Hard; NJ/MO/OH/MN/reverse >1K Easy |
| next | **Unit Converter** | >10K Medium — the only non-Hard head; big scope |
| next | **Tip**, **Random Number Generator** | >100K Hard each; cheap — can slot in anywhere as quick wins |
| parked | Pregnancy/Due Date + Ovulation | after AdSense approval |
| dropped | Cooking Measurement, Letter Grade | |

For every new calculator: Rule 8 research report → approval → build → QA (§3.2) → preview → "deploy".

---

## 9. Reference — what each recent calculator's research found (never re-research)

- **Triangle (v154):** calculator.net, CalculatorSoup, Omnicalculator, Symbolab-type tools — number-only outputs; only a few draw
  anything. We: live to-scale diagram, both triangles of the ambiguous SSA case, special/triple recognition, steps, squares picture.
  User approved all 3 decisions as recommended. Ahrefs: triangle >10K Hard ×2; 30-60-90, 45-45-90, area, isosceles >1K Easy.
- **Mortgage (v159):** §4.3. Differentiators: balance chart + crossover marker, interest/principal strip, visible extra-payment
  box with live savings, 10/15/20/30 comparison, PMI auto-end, line-by-line monthly total.
- **Hours (v150):** calculator.net, CalculatorSoup, Gigacalculator, Inch Calculator, Clockify. 4 tabs Shift/Week/Dates/Convert.
- **BMR (v146):** calculator.net, Omnicalculator, Gigacalculator, bmrcalculator.org; five formulas at once.
- **Recipe Converter (v144):** Gigacalculator, Instacart, CalculateQuick, Omnicalculator; opened the Cooking vertical.
- **Paint / Wallpaper / Scientific Notation / Standard Deviation / Fraction:** see the older CLAUDE.md "Last session" entries.
