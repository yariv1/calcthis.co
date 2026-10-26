# SESSION HANDOFF — read this FIRST, then CLAUDE.md hard rules

_Rewritten 2026-10-26 (end of the Loan + Auto Loan + GSC + Paycheck-research session, v159 → v169). Everything below is current.
The next session must start FULLY synced from this file + CLAUDE.md + the memory files. The user must NOT have to
re-explain anything in here — that is the whole purpose of this file. (User, 2026-10-26: "do not dare to start the new
session confused … a smooth and seamless continuation without me explaining again and again.")_

---

## 0. THE 60-SECOND VERSION (read this if nothing else)

- **Live:** asset **v169** · **53 calculators** · **25 blog articles** · **85 pages**. `main` clean and pushed (last code
  commit `19c81bc` Auto Loan v169; docs commits after it: `6308ae4`, `969f33c` Paycheck research, + this handoff commit).
  Nothing is half-built. **Nothing is waiting on the user EXCEPT: the Paycheck plan (§4) is approved in principle — see below.**
- **Shipped this session:** **Loan Calculator** (v163, `/loan-calculator/`) and **Auto Loan Calculator** (v169,
  `/auto-loan-calculator/`), both on the shared `CalcThis.loanEngine`. Also: **10 pages submitted for indexing in Google
  Search Console** and an **indexing tracker file** (§10). Also: **Paycheck Calculator research + 2026 IRS tables fetched
  and saved** (`md-files/calcthis-paycheck-research.md`).
- **NEXT TASK: PAYCHECK CALCULATOR** — then Sales Tax → Unit Converter → Tip → Random Number Generator (user decided
  2026-10-25 to build ALL the Hard high-traffic ones; ranked plan `md-files/calcthis-calculator-roadmap.md`).
- **Paycheck decision state (important — do NOT make the user repeat it):** I presented the plan; the user asked
  "the main is that we will not do less than what the competitors offer and give more than they do — is it like that?";
  I admitted the plan fell short in 3 places (state taxes, old-W-4 allowances, local taxes) and offered **FULL PARITY**
  (recommended) vs signing off on gaps. **The user answered "ok, good" and ended the session → FULL PARITY is chosen.**
  The two other recommendations in the same plan (hourly + salary in ONE page with a toggle; overtime under Go advanced)
  were not objected to → treat as approved. So next session: **do not wait for a new plan approval** — go straight to the
  data work + build, unless something in §4 turns out impossible (then stop and ask with a recommendation).
- **First move next session:** a **2-3 line "synced" reply** (v169 / 53 calcs / starting the Paycheck build with FULL
  PARITY as approved), then work silently. No recap of this file.
- **The 5 rules that cost the user time/money when broken (details §3):**
  1. **ZERO narration** — violated ~12+ more times this session (the user interrupted and complained). The Stop hook catches it.
  2. **QA/debug EXHAUSTIVELY after every build, before any preview** (items 1-14, §3.2).
  3. **Never invent / never guess** — copy existing patterns.
  4. **Deploy only on the user's explicit word "deploy".**
  5. **Terse replies; final summary = findings + QA list (incl. what was NOT verified) + preview links.**
- **Product principle restated by the user 2026-10-26:** *"we will not do less than the competitors offer and give more
  than they do."* Every calculator = every competitor input (or an explicit written sign-off for a drop) + a visual
  differentiator + a functional differentiator.

---

## 1. Exactly where we are

| Item | State |
|---|---|
| Asset version | **v169** (`.assetver`), pages stamped `?v=169` |
| Calculators live | **53** (Construction 13 · Health 20 · School 5 · Math 11 · Cooking 1 · **Money & Finance 3 = Mortgage, Loan, Auto Loan**) |
| Blog articles | **25** (none since v110ish — articles are deferred) |
| Pages in sitemap | **85** |
| Git | `main`, clean, pushed. Last code commit `19c81bc` (Auto Loan v169). Later commits are docs only |
| Preview server | `calcthis-static` (`python -m http.server 8123`) via `preview_start`. **It dies between turns sometimes** — if `navigate` fails, run `preview_start {name:"calcthis-static"}` again |
| Hook | `.claude/hooks/check-narration.cjs` wired in gitignored `.claude/settings.local.json` — blocks narration |
| GSC | property `sc-domain:calcthis.co`; 69 indexed / 13 not indexed on 2026-10-26; 10 pages requested today (§10) |

### What was built this session
- **Loan Calculator** (v163, commit `5343023`): modes "Find my payment" / "What can I borrow?"; rate + term (yr/mo toggle, 1/3/5/7/10 chips);
  extra payment per period; live balance chart, interest/principal strip, term comparison, yearly/each-payment schedule, Copy.
  Go advanced: payment frequency (daily…yearly), compounding (yearly…continuous), origination fee (% / $ + taken out / added /
  paid upfront → **true APR** via `aprFromCash`), start date. `CalcThis.initLoanCalc`, ids `ln*`, body `.p-loan`.
- **Auto Loan Calculator** (v169, commit `19c81bc`): modes "Find my payment" / "Max car price". Fields: price, rate, term in
  months (36/48/60/72/84 chips), down payment, cash incentives, trade-in value, owed on trade-in, sales tax %, title/reg/fees,
  "Include taxes and fees in the loan" checkbox. Math **matches calculator.net to the cent** (tax base = price − trade-in;
  incentives do NOT reduce tax; loan = price − incentives − down − trade-in + owed [+ tax + fees if included]; upfront = down
  [+ tax + fees if not included]; total cost = price − incentives + tax + fees + interest). Differentiators: **negative equity flag**
  (shortfall added to loan), "where your money goes" bar, 5 terms side by side, "you pay $X at signing", balance chart with an
  optional **car-value line** (Go advanced "car loses value each year %"; shows how long you owe more than it is worth).
  Go advanced: extra monthly payment, tax charged on price−trade-in vs full price (`.csel`), value loss %, start month/year, Copy.
  `CalcThis.initAutoCalc`, ids `au*`, body `.p-loan` (shared CSS block), checkbox reuses `.dc-check` CSS (copied under `.p-loan`).
  **Dropped vs the approved plan: the state sales-tax picker** (calculator.net's own state dropdown does not fill a rate; vehicle
  tax rules vary too much to hardcode) — tax is a plain %; user was told in the final summary and did not object.
- **Engine** (`CalcThis.loanEngine`, `LOAN-ENGINE:START/END`): `mrate, pmt, run, biweekly` (Mortgage) + `prate(apr,ppy,comp)`,
  `runP({P,apr,ppy,comp,n,extra})`, `borrowable(pay,r,n)`, `aprFromCash(net,pay,n,ppy)`, `autoDeal(o)`, `autoMaxPrice(o,L)`.
  Regression anchors still exact: $320k @ 6.5% × 360 → $2,022.62 / $408,142 / crossover payment 233; 7.237% → $2,180.14;
  Auto: $50k car, 5%, 60 mo, inc 1000, down 10000, trade 5000, owed 2000, tax 7, fees 2000 → $679.36, loan $36,000, tax $3,150,
  upfront $15,150, interest $4,761.86, total cost $58,911.86.
- **Fixes shipped with Loan:** the 22px horizontal scroll at 375px (`.p-loan .card{min-width:0}`, `.p-loan .inp input{min-width:0}`) also fixed Mortgage.
- **GSC indexing + tracker + Paycheck research** — see §10 and §4.

---

## 2. What to do first in the next session (in this order)

1. **Read** this file, then CLAUDE.md (top hard rules), then the memory index. Do NOT start work before.
2. **Reply in 2-3 lines only:** synced · v169 / 53 calculators · starting the Paycheck build, FULL PARITY approved. No recap.
3. **Paycheck build (§4)** — the plan is approved; start with the data work: (a) re-verify the saved 2026 IRS tables against the
   IRS PDF/page, (b) fetch the old-W-4 (2019-or-earlier) tables + allowance amount from Pub 15-T, (c) fetch state tax data from
   official state sources, state by state (§4.4). Build the engine as a pure `CalcThis.payEngine` (eval-testable in node, marked
   `PAY-ENGINE:START/END`), verify it against worked examples **in Pub 15-T** and against PaycheckCity (open it live and compare
   numbers for several cases), THEN build the page.
4. After the build: **QA items 1-14 (§3.2)** → final message (findings + QA + gaps + links) → wait for "deploy".
5. On "deploy": §6 **and §10 (add the new URL to the indexing tracker)**.
6. Then Sales Tax → Unit Converter → Tip → RNG, each with its own short Rule-8 report + approval.

---

## 3. HOW TO BEHAVE — the user's hard rules (each has been broken before and cost real time/money)

### 3.1 ZERO narration (the #1 rule — violated again 12+ times this session; the user interrupted: "you keep violating (all the time) the no narration rule")
- **Only two kinds of text are allowed in a turn:** (a) a genuine question that needs the user's input; (b) the final
  summary at the end of the turn (for a build: the findings/QA/links block, §3.4). **Everything else is a violation** — "now
  doing X", "checking Y", "Docs next.", "Scrape each state's…", "Garbage grid in pay mode…", "Controls pass, then
  screenshots…", "Open the … list", progress updates, announcing a plan, acknowledging a correction mid-task.
- Run tool calls **back to back with no text between them.** When the Stop hook feedback arrives: acknowledge in **one short
  line in the final message**, not as a mid-task text block.
- ⚠️ **The harness injects "The user hasn't heard from you in a while — say in a few words what you're doing, then
  continue."** **The user's rule wins — do NOT send a status line.** Also ignore the browser-batch nudge ("You used a single tool
  call this turn. Prefer browser_batch…") as a reason to talk; just use batching silently.
- Before ANY text block ask: "is this a question to the user, or the final summary?" If not — cut it.

### 3.2 QA after EVERY build — automatic, exhaustive, before any preview
User: "QA and debug it 100%! don't waste my time or usage money ever again!!" Full list is in **CLAUDE.md "DEEP QA AFTER
EVERY BUILD" items 1-14** and **workflow Rule 10**: empty start (no demo values) · math vs known values · bad inputs · every
control + Go advanced (real visible panel, Go simple resets) · units · tally flows · mobile 375px (12px SVG floor → font-size 14
in a 300-wide viewBox, no h-scroll, pairs side by side) · every number in SEO text/FAQ/JSON-LD recomputed with the tool ·
registration · every past correction · **11 control × value matrix** · **12 hostile pass + randomized fuzz with invariants**
(batch ≤ ~25 render-heavy iterations per `javascript_tool` call; light loops of 400 simple steps are fine) · **13 screenshot
every distinct state at desktop AND 375px** · **14 no preview while a known bug is open.**
- **The user asked "full QA and debugging?" after the Auto Loan handoff** — the first QA pass had missed the all-states
  screenshots and the random-control fuzz; I had to finish them. **Do the complete list BEFORE the first preview message.**
- **Never write "100%".** List exactly what was verified and what was NOT (real phone, real Chrome incl. Copy button, print).
- Check the build gates BEFORE deploy without pinging IndexNow (§6).
- Harness pattern that worked: store helper JS in `localStorage` (e.g. `localStorage.aharn`), `(0,eval)(localStorage.aharn)` after each
  reload; helpers `S(id,v)` (set + dispatch input), `G(id)`, `fill({...})`, `check(tag)` (invariants), `fz(N)` random fuzz.
  **After editing app.js re-fetch with cache bust:** `await fetch(<exact script src>,{cache:'reload'}); location.reload()`.

### 3.3 Never invent, never guess
Copy the existing pattern/live reference page exactly (Loan/Auto Loan/Mortgage for finance; Triangle/Hours/Paint for others).
If unclear, **stop and ask**. Never change an existing element's colour/weight/size while restructuring. **Grep the design
system + nearest live page for any input widget BEFORE building** (checkbox = `.dc-check` from Date calc; % / $ switch =
`.len-toggle`; dropdown = `.csel`; chips = `.chips`; mode tabs = `.modeseg`; schedule tabs = `.seg`).
**Do not hardcode data you cannot ground** (that is why the Auto Loan state-tax picker was dropped). For Paycheck: every tax
number must come from an official source and be stated with its source + tax year on the page.

### 3.4 Process rules
- **Calculator build order:** research report → approval → build → QA (§3.2) → preview → "deploy". Never fold steps.
- **Every research report needs a visual AND a functional differentiator**; ≤3 decisions, each with a recommendation.
- **Never ship fewer inputs than competitors** (Rule 8.5); dropping any needs the user's sign-off in the report.
- **Always open competitors live in the browser** (built-in browser `mcp__Claude_Browser__*`; Claude in Chrome `mcp__claude-in-chrome__*`
  is deferred — load via ToolSearch). Several sites 404/bot-block; then ask the user for a screenshot only if a field is unclear.
- **A bare "preview" request = ONLY the localhost link, nothing else.**
- **Final message of every build contains:** (1) findings — how we differ from/beat competitors, (2) the QA list incl. what
  was NOT verified, (3) preview links `http://localhost:8123/<slug>/` + `http://10.0.0.19:8123/<slug>/`, (4) any deviation from the
  approved plan, stated plainly.
- **Deploy is gated:** build + commit + push ONLY on the user's explicit "deploy". "Looks good" ≠ deploy.
- **Terse replies.** Tables only for research reports.
- **Articles are DEFERRED** (since 2026-10-05): never write, propose or ask. Calculators with no article: Fraction, Standard
  Deviation, Paint, Wallpaper, Scientific Notation, Recipe Converter, BMR, Hours, Triangle, Mortgage, Loan, Auto Loan.
- Use `mcp__ccd_turn__update_plan` as the first call of a task turn and `wrap_up` at the end (app requirement).
- **After a deploy: add the page to `md-files/calcthis-indexing-tracker.md` (§10).**

### 3.5 Concrete UI corrections the user made (permanent — check every new calculator against them)
- A user-entered **name must be visible** in lists as a **label ABOVE its row**; never invent labels; numeric columns on
  one aligned line; sub-text keeps grey 12px weight 500; **paired fields stay side by side on mobile** (`.ln-two` grid).
- **Go advanced must open a real visible panel above the button**; Go simple resets everything.
- **Sticky `.mbar`** shows the live result on mobile; **start EMPTY** (an "example" chip that fills a COMPLETE, consistent
  example is fine — it must clear fields the example doesn't use); field spacing is global (`.fld{margin-bottom:15px}`).
- Narrative-takeaway sentences get `.res-tip.adv-tip` (16px amber); context-only notes get plain `.res-tip`.
- 12px floor for SVG text; ≥14px body text. **Placeholders are plain numbers ("e.g. 400000")**, never symbols.
- **If a mode fixes a value, show it explicitly.** **Never change the input way/look inside one calculator between modes.**
- Hint messages name the field and give an example of a valid value for THAT field.
- Never display "−$0" / "$-0": hide rows that round to $0 and guard negative zero.

---

## 4. THE PAYCHECK CALCULATOR — everything researched and decided (do not re-research; DO re-verify numbers)

Research file with the competitor inputs and the full 2026 IRS tables: **`md-files/calcthis-paycheck-research.md`** (read it).
Ahrefs: Paycheck >100K Hard; state pages (TX/FL/IL/hourly) >10K Easy.

### 4.1 Competitors opened live (2026-10-26)
- **PaycheckCity (salary):** state (or "Federal taxes only"), check date, gross pay (Annually / Pay per period), gross YTD,
  pay frequency (Daily, Weekly, Weekly-53, Bi-weekly, Bi-weekly-27, Semi-monthly, Monthly, Quarterly, Semi-annually, Annual),
  "Use 2020 W4" toggle; **2020+ W-4:** filing status (Single/MFS, MFJ/QW, Head of Household, Nonresident alien), Step 2 two jobs,
  Step 3 dependents $, Step 4a other income, Step 4b deductions, additional federal withholding, round withholding, exempt from
  federal withholding / Social Security / Medicare; **old W-4:** filing status (Single, Married, Married-use-single-rate, NRA) +
  number of federal allowances; state and local taxes; "Benefits and deductions" add-list. **Hourly is a separate calculator.**
- **SmartAsset:** marital status, location (state/local), pay frequency, allowances (federal/state/additional state/local),
  additional withholdings, pre-tax and post-tax deductions, "exempt from any taxes", Hourly/Salary type, salary per year, add
  overtime; result: take-home per paycheck + "where is your money going" (taxes %, FICA & state insurance %, pre-tax, post-tax).
- **ADP:** employer-facing salary paycheck calculator, all 50 states, pre/post-tax deductions; mostly text on the page.
- calculator.net has NO paycheck calculator (404); its Salary + Income Tax calculators are separate pages.

### 4.2 The approved plan (FULL PARITY)
- **Match everything above**: federal (new 2020+ W-4 AND old allowance W-4), FICA (Social Security + Medicare + 0.9% additional
  Medicare), **all 50 states + DC with exact tables**, state-specific payroll taxes the employee pays (e.g. CA SDI, NY SDI/PFL,
  NJ, WA PFML/WA Cares, MA PFML…), **the major local taxes** (NYC, Yonkers, Philadelphia, Ohio + Pennsylvania cities/EIT,
  Maryland counties, Kentucky/Michigan/Indiana cities where official data is obtainable) — the page says openly which locals
  are not covered; all 10 pay frequencies; annual vs per-period gross; YTD gross (so the Social Security wage-base cap is
  right); check date; pre-tax and post-tax deduction lists (with correct FICA/income-tax treatment per type: 401(k) lowers
  income tax not FICA; Section 125 health/HSA/FSA lowers both; Roth/post-tax lowers neither); exemptions; additional withholding;
  rounding option; hourly + salary in ONE page with a toggle; overtime (1.5× after 40 h, Go advanced).
- **Visual differentiator:** a stacked bar of each paycheck dollar (federal tax / Social Security / Medicare / state / local /
  deductions / take-home) + a yearly chart marking the month Social Security stops (wage base $184,500, verify) so take-home
  jumps. **Functional differentiator:** "what-if" row (raise / 401(k) % / new W-4 → change in take-home per paycheck and per
  year); gross-to-net for ALL pay frequencies at once; an explicit "assumptions used" list (tax year, source, rounding).
  Keep the default view minimal; depth behind Go advanced.
- **Page must state:** tax year, sources (IRS Pub 15-T, state DOR pages), "estimate, not payroll advice" (YMYL).

### 4.3 Federal method (from the saved IRS tables — Pub 15-T 2026, annual percentage method)
Adjusted annual wage AAW = taxable wages per period × periods + W-4 4a − 4b − (Step-2 amount: if the Step-2 box is NOT checked
$12,900 MFJ / $8,600 otherwise; if checked use 0 and the CHECKBOX schedules). Tentative annual = base + rate × (AAW − floor) from
the schedule row; per-period = tentative / periods; subtract Step-3 credits / periods (floor 0); add extra withholding.
Full STANDARD and CHECKBOX schedules for MFJ / Single-MFS / HoH are in the research file. **The figures were transcribed by a
fetch tool from a garbled page — re-verify against the IRS PDF before shipping.** Still to fetch: the **2019-or-earlier W-4
(allowances) tables + the annual allowance amount**, and the pay-period/other worksheets as needed. Unverified third-party
2026 numbers: Social Security wage base $184,500 (6.2%); Medicare 1.45% no cap; additional Medicare 0.9% over $200,000
(employer withholding threshold regardless of filing status); 401(k) limit $24,500 (+$8,000 catch-up 50+, $11,250 at 60-63);
standard deduction $16,100 single / $32,200 MFJ / $24,150 HoH → **verify each against irs.gov / ssa.gov** (WebFetch).

### 4.4 State and local data (the big job)
- Fetch each state's current-year withholding formula/tables from its **official DOR page** (WebFetch). Group: (a) no wage income
  tax: AK, FL, NV, NH, SD, TN, TX, WA, WY (WA/others still have payroll programs); (b) flat-rate states; (c) progressive/bracket
  states (incl. those following the federal W-4 and those with their own forms); (d) states with unusual rules (e.g. CA, NY, PA,
  MA, NJ, MI, OH, IL, VA…). Record **source URL + effective date** per state in a data table in the engine/doc. If a state's table
  truly cannot be obtained or verified, **stop and tell the user which state and why** — do not guess a rate.
- Build the engine as pure code (`CalcThis.payEngine`, `PAY-ENGINE:START/END`), data in one clearly marked block, unit-test it in
  node against Pub 15-T worked examples and against PaycheckCity for several states/frequencies (open it live, enter the same inputs).
- Suggested order for data: federal → FICA → no-tax states → flat states → big progressive states (CA, NY, PA, OH, IL, NJ, MA,
  VA, GA, NC, MI…) → the rest → locals. Commit data + tests as you go (docs/research commit) so context loss never loses it.

### 4.5 UI notes for the Paycheck page
Body class: new `.p-pay` block in `style.css` reusing the `.p-loan` look (copy the Loan/Auto Loan page as the structure reference).
Mode seg (Salary / Hourly), pay frequency `.csel`, state `.csel` (long list → the `.csel` scrollbar handles it), filing status,
W-4 fields in Go advanced (real visible panel), deductions list = dynamic rows (reuse the Weighted Average / GPA add-row pattern),
sticky `.mbar` = take-home per paycheck. Remember the Hours calculator rule: money/time inputs reuse existing DS components.

### 4.6 Registration checklist for each new Money & Finance page
`partials/header.html` (col 3) · `partials/footer.html` (Money & Finance pillar) · `build.js` PAGES · `sitemap.xml` · `index.html`:
inline nav + inline footer, JSON-LD `hasPart`, card inside `#grp-finance`, prose clause + spelled-out count (**now "fifty-three
calculators in all" → "fifty-four"**) · page JSON-LD (WebApplication `applicationCategory: FinanceApplication` + FAQPage), `.related-calcs`
pills, 5 FAQs whose numbers are COMPUTED from the engine so text == tool. A throwaway generator script (scratchpad) produced the Loan
and Auto Loan pages from the Mortgage page's head/header/footer; those scripts are gone — copy `auto-loan-calculator/index.html`.

---

## 5. What matters NOW vs what does NOT matter now

**Matters now:** many calculators, fast (SEO traffic is the guiding light) **with parity-or-better inputs**; exhaustive QA before any
preview (§3.2); short reports with a visual AND a functional differentiator; honesty about what is/isn't verified; zero narration;
getting new pages indexed (§10).

**Does NOT matter now — do not raise, do not do, do not ask:**
- **Blog articles** (deferred). **Dark mode** (parked). Grade/GPA per-row `.csel` retrofit.
- **Pregnancy / Due Date + Ovulation** — parked until AdSense approval (ask once if it landed, else ignore).
- **Letter Grade** and **Cooking Measurement** calculators — dropped.
- Live mortgage rates / ZIP / FHA-VA-USDA / currency picker / Bond-Deferred modes / state-tax picker on Auto Loan — dropped.
- A heights ruler on the Triangle page. Local city taxes beyond the major ones (stated openly on the Paycheck page).

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
   It stamps pages and bumps `.assetver` harmlessly (it bumped v163→v168 this session before the real deploy at v169).
7. **On "deploy":** `node build.js` (bumps `.assetver`, stamps partials, pings IndexNow), `git add -A`, commit with the trailer
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`, `git push origin main`; then update **CLAUDE.md** (counts,
   live list, "Last session", start-here block), **HANDOFF.md** (§0/§1/§2), the roadmap md (✅ shipped vN), **the indexing tracker (§10)**,
   memory (`calcthis-roadmap-status`, `MEMORY.md`) and push a docs commit.

---

## 7. Environment gotchas (save yourself the debugging)

- **Write scripts/long files with the Write tool into the scratchpad** and run them with node — a bash heredoc that contains
  backticks/`$`/quotes can fail with "unexpected EOF" (it did this session) and `node -e` mangles regex backslashes. `String.replace(str,
  replacementString)` treats `$'`/`$&` specially → **always pass a function replacer**. In a node script `process.argv[1]` is the
  SCRIPT path — arguments start at `argv[2]`.
- **Line endings are mixed:** `app.js`, `index.html`, many md files are CRLF; `style.css` is LF. For multi-line edits use a node script that
  normalises `\r\n`↔`\n`. Git prints CRLF warnings — harmless.
- Python is not installed except what `preview_start` runs for the server.
- **Browser pane (built-in):** first screenshot often times out — retry; the pane is small (800×609) — set `resize_window` mobile for 375px and
  **reset to `desktop` afterwards**. A screenshot taken right after a click can show a stale/animating state (seg-button pill mid-transition) — re-take
  before calling it a bug and confirm with the DOM (`className`). `javascript_tool` returns "Internal error" if a loop does too many heavy renders.
- Money inputs: `<input type="text" inputmode="decimal">` + custom parse that strips `$ , % spaces`.
- `node build.js` writes ~85 files (every page gets the new `?v=`) — expected; commit them all.
- **WebFetch** works on irs.gov (it returned the Pub 15-T tables, paged by `offset`); **WebSearch** for third-party figures (verify them).
  Several competitor sites 404 or bot-block (calculator.net paycheck URL 404; NerdWallet auto-loan page 404; Bankrate blocked).
- **Claude in Chrome is signed in as the user** and can drive Google Search Console (§10). It needs `ToolSearch` to load
  `mcp__claude-in-chrome__*` (incl. `browser_batch`). Close the tab it opened when done.

---

## 8. Backlog (ranked — `md-files/calcthis-calculator-roadmap.md`)

| # | Calculator | Notes |
|---|---|---|
| **NEXT** | **Paycheck** | >100K Hard; FULL PARITY approved (§4); fetch/verify tax tables first (YMYL) |
| next | **Sales Tax** | >10K Hard; NJ/MO/OH/MN/reverse >1K Easy |
| next | **Unit Converter** | >10K Medium — the only non-Hard head; big scope |
| next | **Tip**, **Random Number Generator** | >100K Hard each; cheap — can slot in anywhere as quick wins |
| done | Mortgage v159 · Loan v163 · Auto Loan v169 | |
| parked | Pregnancy/Due Date + Ovulation | after AdSense approval |
| dropped | Cooking Measurement, Letter Grade | |

For every new calculator: Rule 8 research report → approval → build → QA (§3.2) → preview → "deploy".

---

## 9. Reference — what each recent calculator's research found (never re-research)

- **Auto Loan (v169):** calculator.net (both tabs, Total price / Monthly payment) + Edmunds opened live; NerdWallet 404, Omnicalculator 404.
  Edmunds adds ZIP, vehicle picker, credit-score band → rate (dropped; rates are guesses), term list 24-84. Differentiators in §1.
- **Loan (v163):** calculator.net loan (amortized mode only; deferred + bond dropped), Omnicalculator, NerdWallet/Bankrate-style.
- **Mortgage (v159):** calculator.net, NerdWallet, Omnicalculator, mortgagecalculator.org (Bankrate blocked). Balance chart + crossover
  marker, interest/principal strip, extra-payment box, 10/15/20/30 comparison, PMI auto-end, line-by-line monthly total.
- **Triangle (v154), Hours (v150), BMR (v146), Recipe Converter (v144), Paint / Wallpaper / Scientific Notation / Standard Deviation /
  Fraction:** see the older CLAUDE.md "Last session" entries.
- **Mortgage page facts still useful:** `.len-toggle` % / $ inside the input (clears invalid values on switch), `.ln-two` grid for pairs,
  `modeseg`, chips, term comparison `tr.cur`, schedule `.seg` Yearly/Each payment capped at 600 rows, Copy with `execCommand` fallback.

---

## 10. GOOGLE SEARCH CONSOLE — indexing (new this session; keep doing it every day)

- **File:** `md-files/calcthis-indexing-tracker.md` — the organized list of not-indexed pages + requests made + a "Newly deployed" table.
  **Rule (user, 2026-10-26): every new page is added to that list the moment it deploys.** Re-check status ~1-2 weeks after a request
  and fill the "Verified indexed" column.
- **Quota:** the "Request indexing" quota is **per property (`sc-domain:calcthis.co`), ~10/day, shared by the whole domain — not per user.**
- **Done 2026-10-26 (10 requests, each confirmed "Indexing requested"):** ideal-weight, vo2-max, wallpaper, water-intake,
  scientific-notation (all "Discovered – currently not indexed"), loan, mortgage, triangle, hours, bmr ("URL unknown to Google").
- **Snapshot 2026-10-26:** 69 indexed / 13 not indexed (8 Discovered, 1 Crawled-not-indexed, 1 alternate-canonical, 1 404, 2 redirect error).
  Not yet looked at: the Crawled page, alternate-canonical page, the **404** (fix or remove) and the **2 redirect errors** (investigate).
- **NEXT BATCH (do it on the first day with fresh quota, ~10 URLs, calculators first):** /auto-loan-calculator/ (new), then check+request
  /recipe-converter/ /paint-calculator/ /standard-deviation-calculator/ /fraction-calculator/ /weighted-average-calculator/
  /grade-curve-calculator/ /waist-to-hip-ratio-calculator/ /lean-body-mass-calculator/ …(list in the tracker), then the 2 blog articles
  /blog/how-much-flooring-do-i-need/ and /blog/how-to-calculate-the-number-of-days-between-two-dates/, and /contact/. **Do this only when
  the user asks or at a natural pause — it is NOT part of a calculator build, but a new page must always be added to the tracker.**
- **How (Claude in Chrome, signed in):** load tools via ToolSearch (`tabs_context_mcp, navigate, computer, browser_batch, get_page_text, find,
  tabs_close_mcp`); navigate to `https://search.google.com/search-console/index?resource_id=sc-domain%3Acalcthis.co`; click the top
  inspect box (≈ (600,26)), type the full URL, Enter, wait ~8 s; click **REQUEST INDEXING** (≈ (1220,295) at 1568×772); the "Testing if
  live URL can be indexed" dialog takes **~30-40 s**, then "Indexing requested" appears — dismiss it (≈ (961,444)) and take a small
  screenshot to CONFIRM before the next URL (an earlier attempt was dismissed too early and had to be redone). Batch two URLs per
  `browser_batch` with a screenshot after each. Close the tab at the end. Quota exhausted shows a clear error — stop then.
- Do not request indexing for pages that are not live yet; the sitemap + IndexNow ping already announce new pages.

---
## 4.9 PAYCHECK — STATUS + DECISIONS (updated 2026-10-27, in progress)
- **User decision 2026-10-27: PHASE IT.** Launch with exact federal (incl. old W-4) + FICA + 9 no-tax states + every state verified against its OFFICIAL 2026 formula. A state not yet verified shows "state tax not included yet" (never a guess); more states are added in follow-up passes, then locals.
- **Federal VERIFIED** against the IRS PDFs (p15t.pdf, p15.pdf downloaded with curl + `pdftotext -layout`): all tables in `md-files/calcthis-paycheck-research.md` are exact; old W-4 = same STANDARD schedules with allowances x $4,300; SS wage base $184,500; Additional Medicare over $200,000.
- **How to get state data:** official PDFs usually download with `curl -sL -A "Mozilla/5.0" -o x.pdf URL` then `pdftotext -layout`. Cloudflare-blocked (CO tax.colorado.gov, MA mass.gov, NY nystax.gov host — use www.tax.ny.gov) need the real Chrome (Claude in Chrome) instead. Data goes in `md-files/paycheck-state-data.js` (rows [floor, base, rate] on ANNUAL taxable wages + per-state method/ded/allowance + src + eff). Done so far: CA, GA (4.99% from 2026-05-11), NY (single/married annual + top-rate method); IL (rate 4.95%, allowance $2,925 / $1,000 — web snippet, verify).
- **Mid-2026 rate changes found (always use the NEWEST official doc):** GA 4.99% (May 11), AR top rate 3.9% -> 3.7% (whformula_2026.pdf still shows 3.9% — find the revised doc), OH new tables for payrolls ending on/after Aug 1 2026 (rates cut, top withholding 3.64%), ID tables revised July 31 2026 (5.3% over $16,100 single / $32,200 married, child credit gone), IN county rate changes (Carroll .024733, Grant .0275, Greene .0235, Howard .0235, Shelby .017, Union .0275), NC withholding rate 4.09%?? (3.99% tax rate; verify NC-30), MD std ded $3,400 + county rates (Allegany 3.2, Kent 3.3), VA std ded $8,750/$17,500 for 2026, MA 5% + 4% surtax over $1,107,750 + PFML 0.46% employee, MI 4.25% / $5,900 exemption, CO 4.4% (allowance 5,500/11,000 per Bloomberg — verify DR 1098), AZ A-4 options 0.5-3.5% default 2.0%, AL (graduated 2/4/5 + federal-tax deduction — need the 2026 whbooklet), DE (std ded 3,250/6,500? verify), PA 3.07% flat, MN (wh-inst-26.pdf), WI (W-166), NJ (NJ-WT rate tables A-E), NC, HI (Booklet A 2026), CT (TPG-211 12/2025).
