# SESSION HANDOFF — read this FIRST, then CLAUDE.md hard rules

_Rewritten 2026-10-31 at the end of the unit-converter-pairs + California + Texas + site-wide-SEO session (v248 → v257). §0 (0.1–0.4e) is current and authoritative; 0.5–0.7 and §1+ are older reference (still valid unless §0 contradicts them; §1 table and §2 are SUPERSEDED). The next session must start FULLY synced from this file + CLAUDE.md + memory. The user must NOT have to re-explain anything ("do not dare to start the new session confused … smooth and seamless continuation")._

---

## 0. THE 60-SECOND VERSION (end of the 2026-10-31 session)

### 0.1 WHAT TO DO FIRST IN THE NEXT SESSION
1. Read this file, CLAUDE.md top rules, memory index. Reply **2-3 lines only**: "synced · live v261 / 61 calcs / 158 pages · NYC sales tax + Tip hub DEPLOYED; next: tip phase 2 (/how-much-to-tip/ hub + 8 service pages, see md-files/calcthis-tip-research.md), Ahrefs state list, GSC queue (NYC + tip first)". **Do not ask anything answered below. Do not recap. Do not re-research anything marked DONE.**
2. **Start the NYC SALES TAX research report NOW** (the user's last working message was "next in sales tax?" → I proposed New York City → the user said "ok - first, [write the handoff]" — i.e. NYC is the next job, no further approval needed to START RESEARCH; building still needs approval of the report). Details in 0.2.
3. **Google Search Console indexing queue** — the user said "make sure the request indexing list is updated all the time and be ready with the next ones; index more". GSC said "Quota Exceeded" on 2026-10-31 ~15:30 (user: "quota should open again in a few hours"). When the user says go (or at the start of the session if it is a new day), request the next ~10 from the queue (0.3) — see 0.6 how-to. Keep `md-files/calcthis-indexing-tracker.md` LIVE QUEUE updated at every deploy and every request session. **Bing:** each deploy auto-pings IndexNow (all sitemap URLs); ALSO submit every new URL manually in Bing Webmaster Tools right after each deploy (30 URLs + Texas were submitted 2026-10-31; nothing pending for Bing).

### 0.2 THE NEXT SALES-TAX JOBS (user's strict process: research report → approval → build → exhaustive QA → preview link only → wait for "deploy")
**A. New York City (queue #7, Ahrefs >1K Hard; it is a CITY page, not a statewide NY page): `/sales-tax-calculator/new-york-city/`.** Not started. Research with OFFICIAL sources (NY Dept. of Taxation and Finance publications + NYC): expected combined rate 8.875% = 4% state + 4.5% NYC + 0.375% MCTD (VERIFY on the official pages, do not trust memory). Verify: clothing/footwear exemption (under $110 per item exempt from state + city, MCTD treatment), groceries exempt, restaurant/prepared food, hotel/occupancy, delivery/shipping rule, use tax, parking/other special taxes. Open competitors live (calculator.net, Omni NYC if it exists, Avalara NYC; salestaxhandbook is Cloudflare-blocked). Report must list every competitor input + a visual AND a functional differentiator. A flat city rate = the NJ-style page (zones/cats), NOT the place-typeahead pattern (check if borough/district variants exist; there is no per-place table). Template pages: NJ (flat) in `md-files/gen-salestax-pages.js` (`faqsFor`/FACTS), California/Texas/MN (place typeahead).
**B. After NYC — "all other states":** the order must come from the user's Ahrefs data ("{state} sales tax calculator" volumes). I only have volumes for states already built. **Ask the user ONCE for an Ahrefs screenshot/export** (candidates: Florida, Illinois, Washington, Pennsylvania, Georgia, Arizona, Colorado, North Carolina, Virginia, Michigan, Indiana…). Do not rank by guess.
**Sales-tax state status (all LIVE): New Jersey, Missouri, Ohio, Minnesota, California (v256), Texas (v257) + hub.** How-to-add-a-state + every state's facts: `md-files/calcthis-salestax-research.md` (read the CA and TX sections: data sources, parsers, rules, QA).

### 0.3 THE INDEXING QUEUE (copy of the tracker's LIVE QUEUE — the tracker file is the source of truth, update it)
**Google, in this order (~10/day, quota per property):** 1 `/random-number-generator-1-3/` (UNCONFIRMED earlier) · 2 `/speed-converter/` (UNCONFIRMED — GSC shows "Crawled – currently not indexed", last crawl Oct 27) · 3 `/px-to-rem-converter/` · 4 `/sales-tax-calculator/california/` · 5 `/sales-tax-calculator/texas/` · 4b `/sales-tax-calculator/new-york-city/` (NEW v259) · 6-10 `/cm-to-inches/ /kg-to-lbs/ /celsius-to-fahrenheit/ /mm-to-inches/ /grams-to-ounces/` · then `/ml-to-oz/ /cups-to-grams/ /feet-to-inches/ /mb-to-gb/ /yards-to-meters/ /liters-to-quarts/ /celsius-to-kelvin/ /knots-to-mph/ /kb-to-mb/ /cups-to-tablespoons/ /tablespoons-to-teaspoons/ /acres-to-sq-ft/ /tablespoons-to-ml/` · then the 10 paycheck states `/paycheck-calculator/<state>/` (alaska iowa kentucky missouri montana nevada new-hampshire south-dakota tennessee wyoming).
**Already requested in GSC 2026-10-31 (confirmed):** `/random-number-generator/` + `-1-100 -wheel -no-repeats -1-10 -1-13`, `/data-storage-converter/`, `/cooking-converter/`. Earlier days: see tracker tables. After requesting: update the tracker; re-check status 1–2 weeks later and fill the "Verified indexed" column.
**Bing (done):** 2026-10-29 RNG 7 + unit pages; 2026-10-31 15:28 — 30 URLs (California, px-to-rem, all 18 pair pages, 10 paycheck states); Texas submitted after its deploy. Every deploy: IndexNow auto (all 156 URLs, HTTP 200) + manual Bing submit of the new URL(s).

### 0.4 WHAT WAS SHIPPED IN THIS SESSION (all deployed; `main` pushed; last code commit `eed4b21c` Texas, then `ca927644` tracker; live asset **v259** (NYC sales tax deployed after this: S.NYC city record, per-item $110 clothing test, generator writeCity))
- **Unit-converter PAIR pages (v249–v251), ALL 18 DONE** — one page per pair + its reverse: batch 1 cm-to-inches, kg-to-lbs, celsius-to-fahrenheit, mm-to-inches, grams-to-ounces, ml-to-oz; batch 2 mb-to-gb, kb-to-mb, cups-to-grams (ingredient picker, flour default, `data-ing`), feet-to-inches, yards-to-meters, liters-to-quarts, celsius-to-kelvin, knots-to-mph, cups-to-tablespoons; batch 3 tablespoons-to-teaspoons, acres-to-sq-ft, tablespoons-to-ml. Generator `md-files/gen-unit-pages.js` (`PAIRS`, `writePair`); body attrs `data-from/data-to/data-ex/data-ing` honoured by `CalcThis.initUnitConverter`; chips `data-val`; category pages got a "Popular conversions" list. Each page: answer one-liner, chips, common-values tables both directions (numbers from the engine), FAQ + JSON-LD. `kg to stone` was dropped by the user (volume <100).
- **California sales tax (v256):** `/sales-tax-calculator/california/`, 541 official CDTFA places (xlsx effective Oct 1 2026), data `assets/data/ca-rates.json` built by `md-files/ca-salestax/mk.py` (labels = plain city name; county rows "X County" / "X (unincorporated areas)"), cats general/grocery/prepared/soda/drugs, shipping default untaxed + "billed as one charge" box, county table, 10 FAQs. **Refresh quarterly** (new xlsx from cdtfa.ca.gov/taxes-and-fees/…).
- **SITE-WIDE SEO METADATA (v256) — user said it must apply to ALL pages, not only California.** `build.js` `seoStamp()` runs on every page at every build (idempotent): og:site_name/locale/image (+size/alt, `/assets/og-default.png` 1200×630 branded card), twitter:card summary_large_image + title/description/image, title suffix " | CalcThis" dropped when >60 chars, description cut to whole sentences if >160, BreadcrumbList for pages without one (blog: Home > Blog > article), AboutPage/ContactPage/WebPage JSON-LD for about/contact/terms/privacy. Hand-written overrides: `md-files/seo-meta-hand.json` ({"/slug/": {"t","d"}}) applied every build — 82+ pages (all calculators, 23 blog posts, home, hubs). Generators were fixed too (unit pair descriptions now start with the answer "1 cm = 0.3937007874 in."; sales-tax descriptions shortened; California/Texas titles "X Sales Tax Calculator & Rates by City 2026"). Checklist + rules: `md-files/calcthis-seo-checklist.md` (title ≤60 keyword first, description ≤158 starting with the keyword/answer and unique, JSON-LD + breadcrumbs, no orphans). Final audit: clean except the intentional `/zone-2-calculator/` redirect stub; 3 titles are 66 chars only because "&amp;" counts as 5. **Not done:** per-article og:image (all pages share the default card); sitemap lastmod = generation date.
- **Texas sales tax (v257):** `/sales-tax-calculator/texas/`, 2,535 places from the Texas Comptroller October 2026 table (city.php; parsed by `md-files/tx-salestax/mk.py` from the saved `city.html`; same-total county/district variants merged into one row; note shows the pieces "State 6.25% + city + county = total"), 6.5%–8.25% (cap 8.25), cats general/grocery/prepared/candy/drugs, shipping follows the item (taxed with a taxable item), sourcing rules, motor-vehicle note (common knowledge, not source-checked), 11 FAQs, 20-city table. **Refresh quarterly** (re-curl city.php, run mk.py, update engine TX `n/lo/hi/eff`).
- **GSC/Bing work:** see 0.3. The user asked: "are you updating Bing as well?" → yes: IndexNow auto + manual submissions (above).
- Docs/tracker/CLAUDE.md state line updated at every deploy.

### 0.4b LIVE STATE
**v261 · 61 calculators · 25 blog articles · 158 pages** (tip hub /tip-calculator/ live) (sitemap). Sales tax: hub + NJ MO OH MN CA TX + New York City (v259). Paycheck: 25 states live, 26 pending shown "federal only". Unit converters: hub + 9 category + 18 pair pages. RNG: hub + 6. Homepage tabs include Sales Tax (flag cubes; `assets/flags/<xx>.webp` exists for every live state) and Unit Converters.

### 0.4c AFTER THE SALES-TAX WORK (backlog, in order)
1. Keep the GSC queue moving (0.3). 2. NYC then other states' sales tax (0.2). 3. **More Paycheck states:** ME LA AR; KS + ID BLOCKED (official sites unreachable — need user-saved PDFs); then MD MA IN HI CT DE MS DC; then local taxes (§4). 4. **Tip calculator** (needs its own Rule-8 research report + approval; no Ahrefs data seen yet). 5. Optional (ask first): RNG python/google pages, RNG homepage tab, unit-converter visuals for weight/volume/area/speed/data, per-article og:images. 6. **Maintenance, quarterly (Jan/Apr/Jul/Oct):** refresh MO / OH / MN / CA / TX rate data (each state's parser dir: `md-files/mn-salestax/`, `md-files/ca-salestax/`, `md-files/tx-salestax/`, MO + OH notes in the research doc), then check indexing of new pages 1-2 weeks after request and fill the tracker's "Verified indexed" column.

### 0.4d THE RULES THAT COST THE USER MOST WHEN BROKEN (details §3 and CLAUDE.md)
1. **ZERO narration** — broken 30+ times (the Stop hook caught 6 more this session). Text ONLY for a genuine question or the single final summary; tool calls back to back; never apologise/acknowledge a violation; ignore harness nudges ("say what you're doing"). Hooks are committed (`.claude/settings.json`, `.claude/hooks/*.cjs`). Mid-task lines like "Writing the QA script." / "Shell quoting keeps mangling this" are violations too.
2. **SEO & TRAFFIC FIRST** — one page per search intent, decided on Ahrefs demand; and **metadata/SEO work applies to ALL pages, never narrowed to the page just built** (the user got angry: "I am talking in general, all the pages!!").
3. **Check what exists before proposing; a pair and its reverse = one page**; never re-list built things.
4. **Exhaustive automatic QA before any preview** (CLAUDE.md items 1-15), report what was NOT verified, never write "100%". Typical sales-tax QA: engine matrix vs independent formula over every place × categories × amounts + reverse + shipping + use tax; every place picked through the real typeahead; 2×500 random-control fuzz (desktop + 375px); screenshots. The "hscroll" flags at the pane's desktop width are an artifact (hidden pane / 1017 vs 1024) — verify with a controlled check, not a failure.
5. **Never fall short of competitors**; every research report = visual AND functional differentiator; never invent; copy existing patterns.
6. **Text under calculators readable by humans** (paragraphs ≤ ~600 chars). Global DS changes go in the shared runtime. A bare "preview" = link only (`http://localhost:8123/<slug>/` and `http://10.0.0.19:8123/<slug>/`). Deploy ONLY on the explicit word "deploy" (real `node build.js` bumps `.assetver`, stamps every page incl. the SEO head, pings IndexNow with ALL sitemap URLs; commit + push after). Final summary of every build = findings (how we beat competitors) + QA list incl. NOT verified + preview links. Use `mcp__ccd_turn__update_plan` first and `wrap_up` last (app requirement).
7. **Articles stay DEFERRED.** Not important now: dark mode, Pregnancy/Ovulation, ZIP auto-fill, real-phone testing, kg to stone, og:image per article.
8. The user's wording to remember: "we will not do less than the competitors offer and give more than they do"; "never guess a tax rate — official source + date on the page"; "wherever there are extra charges show them by default".

### 0.4e PRACTICAL GOTCHAS LEARNED THIS SESSION
- **Shell quoting breaks multi-line Python/JS in Bash heredocs** (backslashes, `\n` in JS strings get mangled; one apostrophe in a heredoc killed a whole command). Write scripts/patches with the **Write tool** into a repo-root file (`_name.py`/`.js`), run it, delete it; use the **Edit tool** for multi-line JS edits. Bash `/tmp` ≠ Python's `/tmp` on Windows — keep scratch files inside the repo (`md-files/<state>-salestax/`, root `_*.js`) and delete them afterwards.
- **No-ping build for local stamping/gate check:** `node -e` strips the `INDEXNOW:START…END` block of build.js into `_build_noping.js`, run it, delete it (it still bumps `.assetver` and restamps pages — fine; the real deploy build does the same + pings).
- Preview server `calcthis-static` (port 8123) dies between turns → `preview_start` again. Browser-pane screenshots are flaky (stale frames); wake with a first screenshot, retry; `javascript_tool` + `fetch('/_qa_x.js',{cache:'reload'})` + `(0,eval)` pattern for big QA scripts (delete the file afterwards).
- **Claude in Chrome (GSC/Bing):** load tools with ToolSearch (tabs_context_mcp, navigate, computer, browser_batch, tabs_close_mcp…). **≤3 URLs per browser_batch** (4 timed out). Always screenshot after "Request indexing" — "Indexing requested" = ok; "Quota Exceeded" = stop. **Bing:** the Submit URLs dialog sometimes does not open on the first click — click (1244,70), wait, screenshot to confirm the dialog before typing; a stray click at (1518,744) with no dialog selects a row instead of submitting.
- Python + pdfplumber + openpyxl + PIL are installed. WebFetch/WebSearch exist (load via ToolSearch select:WebSearch,WebFetch); comptroller/cdtfa HTML + xlsx download fine with curl `-A "Mozilla/5.0"` (follow redirects `-L`; cdtfa.ca.gov without www).
- Known pre-existing (not ours): ~8px footer overflow at the pane's desktop width on every page.

---

## 0.5 SALES TAX — DEPLOYED (hub + NJ v212, MO v224, OH v233, MN v235, CA v256, TX v257 — CA/TX details in 0.4 above and the research doc)
- Pattern: hub + `/sales-tax-calculator/<state>/`. Generator `md-files/gen-salestax-pages.js`, then `node build.js`. Engine `CalcThis.saleTaxEngine`, UI `CalcThis.initSalesTaxCalc` (app.js). States with local rates use the **place typeahead** (data JSON in `assets/data/`, flag `places` in the state config; MN row format `[label, sales, use, food, foodUse, note]`, the 6th element is a per-place note shown under the field). Full research, rules, code map, "Add a state", queue: `md-files/calcthis-salestax-research.md`.
- QA used: category × zone × amount matrix vs an independent formula, every place picked through the real typeahead, random-control fuzz, hub sweep, desktop + 375px screenshots. Not verified: real phone, real Chrome Copy, print, ZIP auto-fill (not built).
- All four state pages + hub are in GSC + Bing.

## 0.6 HOW TO REQUEST INDEXING (proven this session, Claude in Chrome — load tools with ToolSearch first: tabs_context_mcp, navigate, computer, browser_batch, get_page_text, find, tabs_close_mcp, tabs_create_mcp)
- **GSC:** navigate `https://search.google.com/search-console/index?resource_id=sc-domain%3Acalcthis.co`; click inspect box (600,26); type the full URL; Enter; wait ~9 s; click **REQUEST INDEXING at (1240,295)** (1568×772 frame); wait ~30 s (three 10 s waits); screenshot must show "Indexing requested"; dismiss at (961,444). Two URLs per `browser_batch`. "Quota Exceeded" = stop for the day.
- **Bing:** `https://www.bing.com/webmasters/submiturl?siteUrl=https%3A%2F%2Fcalcthis.co%2F`; click **Submit URLs (1242,69)**; click the text area (1300,250); type many URLs separated by newlines (quota 100/day); click **Submit (1518,744)**; the list shows them as "Today". Close the tab at the end.
- After requesting: update the tracker, CLAUDE.md state line, HANDOFF, memory.

## 0.7 TESTING HARNESS NOTES (so QA is fast next time)
- Static preview: `mcp__Claude_Browser__preview_start` name `calcthis-static` (python http.server 8123); it dies between turns sometimes → just start it again. Links: `http://localhost:8123/<slug>/` and `http://10.0.0.19:8123/<slug>/`.
- Big in-browser QA scripts: copy them to the repo root temporarily (e.g. `_qa-full.js`), run `const code = await (await fetch('/_qa-full.js',{cache:'reload'})).text(); await (0,eval)(code)` after each `navigate`, and **delete the file afterwards**. After editing app.js/style.css re-fetch with `{cache:'reload'}` then reload. A csel option click: `[...g(id).querySelectorAll('.csel-opt')].find(b=>b.getAttribute('data-value')===v).click()`; place typeahead pick = dispatch `mousedown` on the option; focus events do not fire in the unfocused pane → dispatch `new FocusEvent('focusin',{bubbles:true})` manually.
- Gate check without pinging IndexNow: the no-ping temp copy of build.js (§6 one-liner). The real `node build.js` at deploy bumps `.assetver`, stamps partials and pings IndexNow with ALL sitemap URLs.
- Known pre-existing (not ours, unchanged): ~8px footer overflow at the pane's desktop width on every page.
- Python + pdfplumber is available (`pip install pdfplumber` worked) for PDF rate tables; WebFetch is blocked by Akamai/Cloudflare on several official sites (MN DOR pages, convertunits, salestaxhandbook) but PDFs download with curl.

## 1. Exactly where we are (OLD 2026-10-29 snapshot — SUPERSEDED by §0.4b: live is now v257 · 60 calcs · 156 pages)

| Item | State |
|---|---|
| Asset version | **v241** (`.assetver`) |
| Calculators live | **59** (Sales Tax = 1 + 4 state pages; Paycheck = 1 + 25 state pages; Unit Converter = 1 hub + 9 converter pages counted as 1) |
| Pages in sitemap | **129** |
| Paycheck | 25 states live, 26 pending shown "· federal only" (§4.10-4.11) |
| Git | `main` clean and pushed |
| GSC | property `sc-domain:calcthis.co`; quota ≈10/day per property; 4 unit-converter pages + 10 paycheck state pages still to request |
| Bing | quota 100/day, signed in via Google; everything submitted |

Turkey calculators (v204) are reference only: `md-files/calcthis-turkey-research.md`, `md-files/gen-turkey-pages.js`; do NOT re-research.

---

## 2. What to do first in the next session (OLD — SUPERSEDED by §0.1)
1. Read this file, CLAUDE.md top rules, memory index. 2. Reply **2-3 lines only**: synced · v241 / 59 calcs / 129 pages · unit converters + Minnesota live · next = the 4 pending GSC requests, then pair pages (ask for the Ahrefs screenshots: cm to inches, kg to lbs, celsius to fahrenheit, px to rem, cups to grams, mb to gb) unless the user says otherwise. 3. Work silently; on any new calculator/state: research (official source opened live, every competitor input listed) → approval → build → full QA → preview link → wait for "deploy" → deploy gate (§6) + tracker (§10).

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
- Hub `/unit-converter/` + 9 category pages (length, weight, volume, temperature, area, speed, data-storage, cooking, px-to-rem). Engine `CalcThis.unitEngine` + `CalcThis.initUnitConverter` (app.js), generator `md-files/gen-unit-pages.js`, notes `md-files/calcthis-unit-converter-research.md`. **NEXT:** GSC request for speed/data-storage/cooking/px-to-rem converters (quota hit 2026-10-29; Bing done), then PAIR pages (cm-to-inches, kg-to-lbs, celsius-to-fahrenheit, px-to-rem, cups-to-grams, mb-to-gb…) once the user sends Ahrefs screenshots; add visuals for weight/volume/area/speed/data later.
- Same session: homepage "about" cards (`md-files/gen-home-about.js`), homepage tab scroll arrows, GLOBAL clear-X in text fields, readable-paragraph rule (all in design system). Sales Tax Minnesota is live and indexed.
