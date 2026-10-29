# SESSION HANDOFF — read this FIRST, then CLAUDE.md hard rules

_Rewritten 2026-10-29 (end of the Sales Tax session, v204 → v235, plus the no-narration hook work). §0-§2 are current and authoritative; §3 onward is older reference (still valid unless §0-§2 contradicts it). The next session must start FULLY synced from this file + CLAUDE.md + memory. The user must NOT have to re-explain anything ("do not dare to start the new session confused … smooth and seamless continuation")._

---

## 0. THE 60-SECOND VERSION

- **Live:** asset **v241** · **59 calculators** · **25 blog articles** · **129 pages** (sitemap count). `main`: Minnesota deploy commit `dd16244` + docs commit. **Uncommitted (intentional, not yet committed — commit them with the user's OK):** `.claude/hooks/check-narration.cjs` (modified), `.claude/hooks/remind-no-narration.cjs` (new), `.claude/settings.json` (new, registers the UserPromptSubmit hook). **Nothing half-built. Nothing waiting on the user.**
- **Shipped this session (all deployed + indexed in GSC and Bing 2026-10-28):** Sales Tax hub `/sales-tax-calculator/` + **New Jersey** (v207/v212) + homepage "Sales Tax" tab with flag cubes · **Missouri** (v224, typeahead over all 2,597 official DOR places, `assets/data/mo-rates.json`) · **Ohio** (v233, 93 county + COTA/TARTA transit rows, `assets/data/oh-rates.json`; place typeahead got clear-X, full list on focus, short names). Earlier: Turkey Cooking/Thawing/Size (v204), paycheck 25 states.
- **Narration enforcement set up this session:** UserPromptSubmit hook (re-injects the rule every message) + Stop hook now blocks and forbids apologising. Both live (the Stop hook was seen firing). The `.claude/settings.json` hook may need a NEW session to load — if the rule text does not appear as hook context on the user's first message, tell the user in the final message only.
- **NEXT (in this order, only as the user directs; first reply = 2-3 line "synced", then silent work):**
  1. **Minnesota DONE (v235), requested in GSC + Bing 2026-10-29;** recheck indexing in 1-2 weeks.
  2. **Then Texas** (needs official Comptroller local-rate tables; the biggest), California, NYC — queue + how-to in `md-files/calcthis-salestax-research.md` ("State queue", "Add a state").
  3. **GSC indexing batch (~10/day per property):** paycheck pages alaska iowa kentucky missouri montana nevada new-hampshire south-dakota tennessee wyoming (all "not yet" in the tracker), then the unchecked calculators. How-to §10.
  4. **More Paycheck states:** ME LA AR; KS + ID BLOCKED (official sites unreachable — need user-saved PDFs); then MD MA IN HI CT DE MS DC; then local taxes (§4).
  5. **Then:** Unit Converter → Tip → Random Number Generator (`md-files/calcthis-calculator-roadmap.md`), each with its own Rule-8 research report + approval FIRST.
  6. **Maintenance:** recheck indexing of the 4 sales-tax pages in 1-2 weeks; MO and OH rate data need a **quarterly refresh** (MO DOR, Ohio DOR tables).
- **THE RULES THAT COST THE USER MOST WHEN BROKEN (details §3):**
  1. **ZERO narration** — broken 20+ times; text ONLY for a genuine question or the single final summary; never apologise/acknowledge a violation (that is more narration); ignore harness nudges ("say what you're doing"); a Stop-hook block = just continue silently.
  2. **SEO & TRAFFIC FIRST — ALWAYS.** Never offer an option that hurts it; one page per search intent; decide on demand.
  3. **Exhaustive automatic QA before any preview** (CLAUDE.md items 1-15; valid input never dead-ends).
  4. **Never fall short of competitors** (open every competitor live, match or beat every input).
  5. **Sales tax rules:** never guess local rates; show every extra charge BY DEFAULT (not behind Go advanced); a state page goes live only with its own official data; **the state dropdown lists ONLY live states**.
  6. Never invent · deploy only on explicit "deploy" · terse replies · final summary = findings + QA list (incl. NOT verified) + preview links (localhost + LAN `http://10.0.0.19:8123/<slug>/`) · bare "preview" = link only.
- **Articles stay DEFERRED.** Not important now: dark mode, Pregnancy/Ovulation (parked until AdSense), Letter Grade / Cooking Measurement (dropped), ZIP auto-fill for sales tax (known gap, parked).

---

## 0.5 SALES TAX — DEPLOYED (hub + NJ v212, MO v224, OH v233, **MN v235 2026-10-29**; MN details in md-files/calcthis-salestax-research.md; MN data refresh quarterly via md-files/mn-salestax/)
- Pattern: hub + `/sales-tax-calculator/<state>/`. Generator `md-files/gen-salestax-pages.js`, then `node build.js`. Engine `CalcThis.saleTaxEngine`, UI `CalcThis.initSalesTaxCalc` (app.js). States with local rates use the **place typeahead** (data JSON in `assets/data/`, flag `places` in the state config; Ohio has `short: true`, `noFood: true`). Full research, rules, code map, "Add a state", state queue and the MO/OH specifics: `md-files/calcthis-salestax-research.md`.
- QA used: cat × zone × amount matrix vs independent formula, garbage grid, random-control fuzz, all-states hub sweep, desktop + 375px screenshots. Not verified: real phone, real Chrome Copy, print, ZIP auto-fill (not built).
- Indexing: hub + NJ + MO + OH requested in GSC and Bing 2026-10-28 (tracker updated, commit `659a954`).

## 1. Exactly where we are

| Item | State |
|---|---|
| Asset version | **v241** (`.assetver`) |
| Calculators live | **58** (Sales Tax = 1 calculator + 3 state pages; Paycheck = 1 calculator + 25 state pages) |
| Pages in sitemap | **118** |
| Paycheck | 25 states live, 26 pending shown "· federal only" (§4.10-4.11) |
| Git | `main` at `659a954`, pushed; only the 3 `.claude` hook files uncommitted |
| Preview server | `calcthis-static` (`python -m http.server 8123`) via `preview_start`; dies between turns sometimes → re-run `preview_start` |
| GSC | property `sc-domain:calcthis.co`; quota ≈10/day per property; Bing quota 100/day, sign in via Google |

Turkey calculators (v204) are reference only: `md-files/calcthis-turkey-research.md`, `md-files/gen-turkey-pages.js`; do NOT re-research.

---

## 2. What to do first in the next session
1. Read this file, CLAUDE.md top rules, memory index. 2. Reply 2-3 lines: synced · v235 / 58 calcs / 119 pages · MN sales tax live; next = request MN indexing, then Texas (or the GSC paycheck batch) unless the user says otherwise. 3. Work silently; on any new calculator/state: research (official source opened live, every competitor input listed) → approval → build → full QA → preview link → wait for "deploy" → deploy gate (§6) + add URLs to the tracker (§10).

---

_(Older sections below. §0-§2 above override anything contradictory, e.g. the old "v169 / 53 calculators / next = Paycheck build" statements.)_


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
## 4.11 PAYCHECK STATE PAGES (2026-10-27, local v181 — NOT deployed)
- **Why:** one page cannot rank for "ohio paycheck calculator" etc. (Ahrefs 2026-10-27: AR HI ID IN KS LA ME MD MA MO MT >1,000/mo Easy; CT DE MS >100; DC <100). Competitors (PaycheckCity) have one URL per state. So every LIVE state gets its own indexable page `/paycheck-calculator/<state-slug>/` (same calculator, state preselected via `<body data-state="XX">` read in `initPayCalc`), unique content (how the state's withholding works, 4 worked examples, 5 FAQs, local-tax note, links to the other states), own title/description/canonical, WebApplication + FAQPage + BreadcrumbList JSON-LD, sitemap entries, llms.txt section, IndexNow at deploy. States not yet computed get NO page (never advertise what the tool cannot do).
- **How it is built:** everything comes from `node md-files/gen-paycheck-page.js` (reads the engine from assets/app.js; writes the main page + all state pages, adds sitemap URLs and the llms.txt "Paycheck calculators by state" section, idempotent). `build.js` picks up every `paycheck-calculator/*/index.html` automatically. **Adding a state = add it to PAY-STATES in app.js + SLUG/FACT/FORM/LOCALS entries in the generator + run the generator + build.** Every number in the state text is computed from the engine (verified: 100 numbers across 25 pages equal the UI).
- **Nav + footer (2026-10-27):** a 4th menu column and a 7th footer pillar "Paycheck Calculators" (All states + every live state) live in partials/header.html and partials/footer.html between <!--PAYNAV--> / <!--PAYFOOT--> markers; the generator rewrites them on every run (so a new state appears in the nav automatically). Menu breakpoints: 4 cols, 2 cols <=880px, 1 col <=520px; footer 7 columns.
- **State dropdown = navigation (2026-10-27):** choosing a state in the calculator's State dropdown goes to that state's page (live states have `slug` in PAY-STATES; "Federal only" and pending states go to the main page with that state selected + the banner). The whole form (pay, frequency, status, deductions, advanced open, W-4 mode...) is carried over via sessionStorage `pcForm` (15 s expiry) and restored on load. Test hook: `window.__pcNoNav=true` disables the navigation so fuzz tests can switch states.
- **Homepage tab (2026-10-27):** a "Paycheck Calculators" tab (`#grp-paycheck`) with one cube per live state (flag + name) + an "All states" cube; generated between <!--PAYCUBES--> markers in index.html by the generator. Flags are 60x40 webp in `assets/flags/xx.webp` (source flagcdn.com/us-xx.svg rasterised through a browser canvas — they are 1-2 KB each). **A new live state needs its flag file** (download https://flagcdn.com/us-<xx>.svg, draw to a 60x40 canvas in the Browser pane, toDataURL('image/webp',0.8), save to assets/flags/<XX lowercase>.webp) — otherwise its cube shows a broken image.
- **Nav/footer redesign (2026-10-27, local v187):** menu panel is wider on phones (full width minus 12px gutters) and has a typeahead search box (`#menuSearch`, logic in the shared runtime at the top of app.js: indexes every menu link, token AND-match, Enter opens first result, arrows move, Esc clears; autofocus on desktop only). Footer is now rows of sections in a 3-column grid at content width (1040px) like Best Buy; the Paycheck section spans the full width with its links in 3 columns; phones keep the accordion. **SEO anchor text:** every state link everywhere (menu, footer, main-page list, state-page list) reads "<State> Paycheck Calculator"; homepage cubes show the state + "Paycheck Calculator" and the flag alt text says it too.
- **QA done:** all 25 pages (titles unique, canonical, one H1, JSON-LD parses, no broken internal links, in sitemap), UI vs text numbers (100 checks), fuzz on a state page, 375px no overflow (examples table scrolls inside its wrapper), found+fixed an AZ default-percentage bug (Go simple used 0% instead of 2%).
- **At deploy:** run `node build.js` (pings IndexNow with all URLs), add the 25 URLs to `md-files/calcthis-indexing-tracker.md`, request Google indexing ~10/day by demand order (MO MT first as new, then the biggest live states), update counts (111 pages, 54 calculators).

---
## 4.10 PAYCHECK — DEPLOYED v175 (2026-10-27, commit 62f275d) — read this first for Paycheck
- **State:** `/paycheck-calculator/` is built, registered everywhere (header/footer partials, build.js PAGES, sitemap, homepage card/hasPart/prose "fifty-four") and passed full QA locally (asset v174, nothing pushed). The user was shown the preview in the final message of the 2026-10-27 session; **deploy only on "deploy"** (then add the URL to `md-files/calcthis-indexing-tracker.md`, update CLAUDE.md/roadmap/memory: 54 calculators, 86 pages).
- **Code:** `assets/app.js` blocks `PAY-ENGINE:START/END` + `PAY-STATES:START/END` (pure engine + ALL state data, single source of truth) and `CalcThis.initPayCalc`; CSS `.p-pay` at the end of `style.css` (body class `p-loan p-pay`); page HTML is GENERATED by `node md-files/gen-paycheck-page.js` (SEO text + FAQ numbers computed from the engine so text == tool) then `node build.js`.
- **Verified:** federal (new + old W-4, Step 2, credits, 4a/4b, married/HoH), FICA, SS cap crossing and Additional Medicare all match **PaycheckCity to the cent** in 7 scenarios; each live state matches PaycheckCity at $65,000 bi-weekly single (CA, NY incl. SDI/PFL, GA, IL, MI, NC, VA, MN incl. PFML, AL, AZ incl. A-4 %, CO incl. FAMLI, KY, IA incl. allowance/filing variants, WA programs). Official worked examples in the PDFs also match.
- **LIVE states (25, MO + MT added 2026-10-27 local v176 — Ahrefs order: MO KS ID MT ME LA AR (all >1,000/mo Easy) then MD MA IN HI, then CT DE MS, DC last):** no-tax AK FL NV NH SD TN TX WY, WA (+ PFML 1.13% x 71.43%, WA Cares 0.58%); with tax: CA (Method B, SDI 1.3%), NY (annual schedules + top-rate method, SDI $0.60/wk cap, PFL 0.432%), GA 4.99%, IL 4.95%, MI 4.25%, NC 4.09%, VA, MN, AL (formula incl. federal-tax deduction), PA 3.07% + 0.07% UC, AZ (A-4 %), CO 4.4% (+FAMLI 0.44%), KY 3.5%, IA 3.8%, MT (MW-4 tables from the Nov-2025 Employer Guide: 0/4.7/5.65%, rounded UP; matches PaycheckCity S/M/H at $65k + $30k), MO (annual table 0-4.7%, std ded 16,100/32,200 married/24,150 HoH, rounded to dollar; matches PaycheckCity S/M/H at $65k and $30k). **PENDING (26, shown as "· federal only" in the dropdown + a banner):** AR CT DC DE HI ID IN KS LA MA MD ME MS NE NJ NM ND OH OK OR RI SC UT VT WV WI.
- **Research already done for pending states (do not redo; re-check numbers):** AR top rate cut 3.9->3.7% mid-2026 (formula PDF whformula_2026.pdf still 3.9%: find the revised doc); LA 3.09% withholding rate on (annual - std deduction 12,875 single / 25,750 MFJ-HoH, May-2026 amendment changed amounts) and PaycheckCity's default applies NO deduction; UT 4.45% from June 1 2026, allowance credit $485/$970 with phase-out (1.3% of wages above $9,348/$18,696); SC WH-1603F: 6% top, $5,000 per allowance, std deduction 10% (max $7,500) when >=1 allowance, brackets 0-3,640 0%, 3% to 18,230, then 6% (+possible Act 110 change: check PaycheckCity); MS 4% on wages above a $10,000 zero bracket + std deduction ($2,300 single) — PaycheckCity single = (wages - 12,300) x 4%; MO std deductions 16,100/32,200/24,150 + new table; OK 2026 brackets 0 / 2.5 / 3.5 / 4.5% and $1,000 allowance; ID 5.3% over 16,100 single / 32,200 married (July 31 2026 tables); IN 2.95% + county rates (92 counties; Carroll .024733 Grant .0275 Greene .0235 Howard .0235 Shelby .017 Union .0275); OH new tables for payrolls ending on/after Aug 1 2026; MD std ded $3,400 + county local rates (Allegany 3.2, Kent 3.3); MA 5% + 4% surtax over $1,107,750 + PFML 0.46%; NJ rate tables A-E are in a separate NJ-WT PDF (not found yet); HI Booklet A 2026; CT TPG-211 12/2025; DE, DC, WI W-166, OR, ME, MT, NE, NM, ND, RI, VT, WV, KS not researched yet.
- **How to add a state (proven):** (1) get the official publication: `curl -sL -A "Mozilla/5.0" -o x.pdf URL` works for many; for Cloudflare/Akamai-blocked sites use the **WebFetch tool on the PDF URL — it saves the binary PDF under `~/.claude/projects/.../tool-results/webfetch-*.pdf`**; then `pdftotext -layout x.pdf x.txt`. (2) add the record to `PAY-STATES` (methods: none / flatann / ann / pct / ia / ca / ny / al — add a new method in `METHODS` only if needed) with `src` = the official URL, and payroll programs if the employee pays any. (3) if it uses allowances/exemptions add its labels to `SFIELDS` in `initPayCalc`. (4) verify against PaycheckCity: the harness is described below. (5) `node md-files/gen-paycheck-page.js`, build gates (no-ping copy), re-run QA, update this list.
- **PaycheckCity harness gotchas:** the form values PERSIST between page loads (reset every field each run or results are polluted); field ids: `grossPay grossPayYTD payFrequency w42020 federalFilingStatusType2020 federalFilingStatusType federalAllowances twoJobs2020 dependents2020 otherIncome2020 deductions2020 additionalFederalWithholding` and state fields `stateInfo.parms.*`; set values with the native setter + input/change events, click `button[type=submit]`, wait for `/result` (sometimes needs a retry/longer wait). URL pattern `/calculator/salary/<state-slug>` (e.g. new-york). PaycheckCity rounds some states to the dollar (CO) — ours shows cents.
- **Gaps vs competitors that need the user's sign-off (say so in the next summary):** no **check date** field (tables are 2026 only), no **nonresident-alien** filing status, no **local taxes** (city/county/school), 28 states pending, no "Weekly-53"-style special year handling beyond using 53/27 periods, hourly pay is weekly-hours based (hours per week x 52/periods).
- **QA done (items 1-13):** empty start, garbage grid (23 values x 18 fields), 8 fuzz batches x25 at desktop and 12 x25 at 375px with invariants (sum of parts == take-home, per-year column, bar = 100%, headline == sticky bar, no NaN, no overflow), control x value matrix (state change clears allowances, Go simple resets, W-4 old/new, exempt flags, per-paycheck unit), page numbers recomputed through the UI, mobile 375 screenshots. **Not verified:** real phone, real Chrome (Copy button), print, tablet 768 shows an 8px footer overflow that is PRE-EXISTING on every page (Auto Loan too).

---
## 4.9 PAYCHECK — STATUS + DECISIONS (updated 2026-10-27, in progress)
- **User decision 2026-10-27: PHASE IT.** Launch with exact federal (incl. old W-4) + FICA + 9 no-tax states + every state verified against its OFFICIAL 2026 formula. A state not yet verified shows "state tax not included yet" (never a guess); more states are added in follow-up passes, then locals.
- **Federal VERIFIED** against the IRS PDFs (p15t.pdf, p15.pdf downloaded with curl + `pdftotext -layout`): all tables in `md-files/calcthis-paycheck-research.md` are exact; old W-4 = same STANDARD schedules with allowances x $4,300; SS wage base $184,500; Additional Medicare over $200,000.
- **How to get state data:** official PDFs usually download with `curl -sL -A "Mozilla/5.0" -o x.pdf URL` then `pdftotext -layout`. Cloudflare-blocked (CO tax.colorado.gov, MA mass.gov, NY nystax.gov host — use www.tax.ny.gov) need the real Chrome (Claude in Chrome) instead. Data goes in `md-files/paycheck-state-data.js` (rows [floor, base, rate] on ANNUAL taxable wages + per-state method/ded/allowance + src + eff). Done so far: CA, GA (4.99% from 2026-05-11), NY (single/married annual + top-rate method); IL (rate 4.95%, allowance $2,925 / $1,000 — web snippet, verify).
- **Mid-2026 rate changes found (always use the NEWEST official doc):** GA 4.99% (May 11), AR top rate 3.9% -> 3.7% (whformula_2026.pdf still shows 3.9% — find the revised doc), OH new tables for payrolls ending on/after Aug 1 2026 (rates cut, top withholding 3.64%), ID tables revised July 31 2026 (5.3% over $16,100 single / $32,200 married, child credit gone), IN county rate changes (Carroll .024733, Grant .0275, Greene .0235, Howard .0235, Shelby .017, Union .0275), NC withholding rate 4.09%?? (3.99% tax rate; verify NC-30), MD std ded $3,400 + county rates (Allegany 3.2, Kent 3.3), VA std ded $8,750/$17,500 for 2026, MA 5% + 4% surtax over $1,107,750 + PFML 0.46% employee, MI 4.25% / $5,900 exemption, CO 4.4% (allowance 5,500/11,000 per Bloomberg — verify DR 1098), AZ A-4 options 0.5-3.5% default 2.0%, AL (graduated 2/4/5 + federal-tax deduction — need the 2026 whbooklet), DE (std ded 3,250/6,500? verify), PA 3.07% flat, MN (wh-inst-26.pdf), WI (W-166), NJ (NJ-WT rate tables A-E), NC, HI (Booklet A 2026), CT (TPG-211 12/2025).

- **BLOCKER 2026-10-27:** ksrevenue.gov (Kansas) and tax.idaho.gov are UNREACHABLE from this PC (curl, WebFetch and the user's Chrome all time out / ECONNREFUSED); the Kansas admin.ks.gov circular 25-P-004 URL 404s. Kansas/Idaho need the official PDF saved by the user into the project (e.g. md-files/sources/) or another route. Secondary-source facts (do NOT ship from them): KS 5.2%/5.58%, $9,160 personal allowance, $2,320 per extra allowance; ID 5.3% over $16,100 single / $32,200 married, child credit gone.

---
## 0.6 UNIT CONVERTER — DEPLOYED v241 (2026-10-29, commit 7ce0c67)
- Hub `/unit-converter/` + 9 category pages (length, weight, volume, temperature, area, speed, data-storage, cooking, px-to-rem). Engine `CalcThis.unitEngine` + `CalcThis.initUnitConverter` (app.js), generator `md-files/gen-unit-pages.js`, notes `md-files/calcthis-unit-converter-research.md`. **NEXT:** request indexing (GSC + Bing, tracker), then PAIR pages (cm-to-inches, kg-to-lbs, celsius-to-fahrenheit, px-to-rem, cups-to-grams, mb-to-gb…) once the user sends Ahrefs screenshots; add visuals for weight/volume/area/speed/data later.
- Same session: homepage "about" cards (`md-files/gen-home-about.js`), homepage tab scroll arrows, GLOBAL clear-X in text fields, readable-paragraph rule (all in design system). Sales Tax Minnesota is live and indexed.
