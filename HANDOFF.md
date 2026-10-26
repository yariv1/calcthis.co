# SESSION HANDOFF — read this FIRST, then CLAUDE.md hard rules

_Updated 2026-10-25 after Recipe Converter shipped (v144); written 2026-10-15 for the Paint / Wallpaper / Scientific Notation session (v137 → v142)._
_(Sections 0-2 below are current; deeper sections still describe the v142 workflow, which is unchanged.)
The next session must start FULLY synced from this file + CLAUDE.md + the memory files. The user
must NOT have to re-explain anything in here — that is the whole purpose of this file._

---

## 0. THE 60-SECOND VERSION (read this if nothing else)

- **Live:** asset **v159** · **51 calculators** · **25 blog articles** · **83 pages**. `main` is clean and
  pushed (last code commit `9b18285`). **Mortgage Calculator shipped v159. NEXT: Loan + Auto Loan on the same `CalcThis.loanEngine` (research already done for both, user approved; build Loan then Auto Loan, each with full QA rule items 1-14).**
  **TRIANGLE / PYTHAGOREAN — research report not started yet (no research, no code).** Ahrefs (2026-10-25): triangle >10K Hard x2; 30-60-90, 45-45-90, area of a triangle, isosceles, special right triangles >1K Easy; Pythagorean folded in. Rule 8: open EVERY competitor live in the Browser tool (calculator.net, CalculatorSoup, Omnicalculator, Symbolab/others), list every input/output, one visual + one functional differentiator (a live labelled triangle diagram is the obvious visual; solve-any-triangle from any 3 known values SSS/SAS/ASA/AAS/SSA incl. the ambiguous case is the obvious functional), at most 3 decisions with recommendations, then WAIT for approval.
  **First move next session: a 2-3 line "synced" reply (v159 / 51 calcs / next = Loan + Auto Loan), then do the research report. No recap.**
- **Also shipped 2026-10-25: BMR Calculator (v146).** Plan for the rest (user: build ALL the Hard high-traffic ones): Hours → Triangle/Pythagorean →
  Loan/Mortgage → Paycheck → Sales Tax → Unit Converter → Tip → Random Number — ranked in `md-files/calcthis-calculator-roadmap.md`. (Hours is done.) Nothing is half-built, nothing is waiting on the user.
- **Just finished (2026-10-25): #25 Recipe Converter** — new **Cooking & Kitchen** vertical (nav col 3, 5th footer pillar,
  homepage `#grp-cooking` + tab). Engine `CalcThis.recipeEngine` (pure, `RECIPE-ENGINE:START/END` in app.js) + `initRecipeCalc`.
  **NEXT:** no calculator is in progress — ask the user which of #26-29 (Sales Tax / Unit Converter / Paycheck / Tip, all
  lower priority) or a new idea; Rule 8 research report first. AdSense eval not re-requested yet (user, 2026-10-25) —
  Pregnancy/Ovulation stay parked; strategy = more calculators for traffic.
  **Final summary of every build must include: findings (how we beat competitors) + QA list + preview links.**
- (Below is the older v142 text — superseded by the two bullets above where they conflict.)
- **Just finished:** #22 Paint (v139), #23 Wallpaper (v140), #24 Scientific Notation (v142) — all deployed.
- **NEXT TASK:** **#25 Recipe Converter** (new "Cooking" vertical). Not started — no research, no code.
- **First move next session:** a 2–3 line "synced" reply (state + next task), then do the **Rule 8 research
  report** for Recipe Converter and **wait for approval**. Do not build before approval.
- **Three things that cost the user real time/money when broken** (details in §3):
  1. **ZERO narration** — text only for a genuine question or the one/two-line final summary.
  2. **Deep QA after every build, automatically, before any preview** — never wait to be asked; never claim "100%".
  3. **Never invent / never guess** — copy the existing pattern; ask if unclear.
- **Deploy only on the user's explicit word "deploy".**

---

## 1. Exactly where we are

| Item | State |
|---|---|
| Asset version | **v142** (`.assetver`), pages stamped `?v=142` |
| Calculators live | **46** (Construction 13 · Health 19 · School 5 · Math 9) |
| Blog articles live | **25** (no new article this session — articles are deferred) |
| Pages in sitemap | **79** |
| Git | `main`, clean, pushed. Last code commit `2839ea4` (Scientific Notation), last docs commit `0df1401` |
| Preview server | `calcthis-static` (`python -m http.server 8123`) via `preview_start` — if the user says "preview doesn't work", restart it |
| Roadmap | #22, #23, #24 ✅ · **#25 Recipe Converter ⬜ (NEXT)** · #26–29 lower priority |

**Shipped this session (all deployed on the user's explicit "deploy"):**
- **#22 Paint Calculator** `/paint-calculator/` (v139) — `CalcThis.initPaintCalc`, `.p-paint`. Interior + Exterior; live room
  diagram; per-surface shopping list (cans to buy + leftover + cost); multi-room project total; wall-by-wall mode with
  gable/peak; texture/coverage, primer, per-surface coats, door/window sizes, baseboard/crown, waste, price.
- **#23 Wallpaper Calculator** `/wallpaper-calculator/` (v140) — `CalcThis.initWallpaperCalc`, `.p-wall`. **Strip method**
  (whole drops: cut length = height + trim rounded up to the pattern repeat; half-drop alternate strips +1 repeat; strips cut
  from rolls in order), shown next to the naive "by area" answer; live strip diagram coloured by roll (walls in a 2-column
  grid); roll presets (US double 20.5 in × 33 ft, Euro 53 cm × 10.05 m, custom) or sold by the yard/metre; match type;
  spare strips + waste %; wall-by-wall; multi-room project total packs strips across rooms. **Doors/windows deliberately
  do NOT change the roll count** (only the area comparison) — the page explains it. Default trim allowance 4 in makes
  results read higher than competitors (3 strips per double roll on 8 ft walls) — documented on the page.
- **#24 Scientific Notation Calculator** `/scientific-notation-calculator/` (v142) — `CalcThis.initSciCalc`, `.p-sci`.
  ONE smart box (any format or whole expression with + − × ÷ ^ √ and brackets), every notation at once with Copy buttons,
  live decimal-point shift strip + power-of-ten/SI ruler (inline SVG), exact BigInt decimal arithmetic (÷ and √ to 40 digits,
  flagged "rounded"), auto-normalise note, plain-English steps shown by default; Go advanced = output style (× / x / · /
  LaTeX), round to sig figs or decimal places, forced engineering exponent. Typing `0.00450` keeps 3 significant figures.
- **New hard rule (user, 2026-10-14): DEEP QA AFTER EVERY BUILD, AUTOMATICALLY** — see §3 and CLAUDE.md.

---

## 2. What to do first in the next session (in this order)

1. **Read** this file, then CLAUDE.md (top hard rules + "Last session"), then the memory index. Do NOT start work before.
2. **Reply in 2–3 lines only:** synced · v142 / 46 calculators · next is #25 Recipe Converter, starting with the research
   report. No long recap, no re-listing of this file.
3. **Do the Rule 8 research report for Recipe Converter** (`md-files/calcthis-workflow-rules.md` Rule 8 + 8.5 — read both
   in full first):
   - Roadmap data: Ahrefs **>1K, Easy** (129 keywords total — small). Opens a **new Cooking vertical** (new nav column,
     new footer pillar, new homepage `#grp-*` section + category tab, later a "Cooking" blog hub section) — don't ask the
     user about it; propose it inside the report as part of the plan (name the pillar, e.g. "Cooking & Kitchen"), since a
     new vertical touches header/footer/homepage tabs/`build.js`.
   - Open **every** top competitor live in the Browser tool (screenshot, read every dropdown/option list — never a
     text-only summary). List **every input and output** of each.
   - Propose **one visual AND one functional differentiator** (the user's rule — verbatim wording in CLAUDE.md).
     Power-user depth goes behind **Go advanced**; the default view stays minimal.
   - **Report format the user approves quickly:** a short table of competitors (inputs / outputs / visual), the gap, the
     visual differentiator, the functional differentiators, the proposed default view + Go-advanced list, and
     **at most 3 decisions at the end**, each with a recommendation. The user answers "approved, all as recommended".
   - **Wait for explicit approval before any code.**
4. After approval: build → **deep QA (automatic, §3.2)** → serve preview → give links → wait for "deploy".
5. On "deploy": see §6 (build + commit + push + docs).

---

## 3. HOW TO BEHAVE — the user's hard rules (each has been broken before and cost real time/money)

### 3.1 ZERO narration (the #1 rule — violated 4+ times, again this session)
- **Only two kinds of text are allowed in a turn:** (a) a genuine question that needs the user's input; (b) the final
  one-or-two-line summary at the end of the turn. **Everything else is a violation** — "now doing X", "checking Y",
  "building Z", progress updates, announcing a plan, "pushed, now the docs".
- Run tool calls **back to back with no text between them.**
- A **Stop hook** (`.claude/hooks/check-narration.cjs`, wired in the gitignored `.claude/settings.local.json`) catches
  every violation after the turn and blocks it. If hook feedback arrives: acknowledge in **one short line** ("Confirmed —
  hook caught …"), then continue silently.
- ⚠️ **The harness sometimes injects a system message like "The user hasn't heard from you in a while — say in a few
  words what you're doing, then continue."** That message **conflicts** with the user's rule. **The user's rule wins —
  do NOT send a status line in response to it.** (Doing so is exactly what triggered the hook this session, 4 times.)
  Stay silent, keep working, put results in the final message.
- Before ANY text block, ask: "is this a question to the user, or the final summary?" If not — cut it.

### 3.2 DEEP QA after EVERY build — automatic, before any preview (hard rule 2026-10-14)
The user: "the deep QA needs to be done after every build — I don't even need to say anything — this needs to be a hard
rule." Wallpaper reached preview with a real bug that only a second explicit "QA it properly" pass found.
Full checklist is in **CLAUDE.md ("DEEP QA AFTER EVERY BUILD")** and **workflow Rule 10**. In short, silently verify:
1. empty start (no demo values), blank result, add-button disabled, no console errors, no duplicate IDs;
2. math vs hand-computed/known values, every mode, both unit systems;
3. bad inputs: partial/half-typed, zero, negative, non-numeric, huge, impossible combos → quiet clear hint, never blank/throw;
4. **every** control + every Go-advanced option; Go simple resets them; panel is a real visible panel above the button;
5. US + Metric labels/placeholders/results, switching mid-entry;
6. project/tally flows (add several, remove one, clear all, names shown, totals, sticky `.mbar`);
7. mobile 375px: no horizontal scroll, text readable (12px SVG floor), pairs that are side-by-side on desktop stay so;
8. **every number in the SEO text / tables / worked example / FAQ / JSON-LD re-computed with the tool itself** (Wallpaper
   shipped "7 rolls" in the text vs 8 in the tool until QA caught it);
9. registration: nav, footer, homepage (card, hasPart, prose count + spelled-out word), sitemap, `build.js` PAGES;
10. every past user correction (§3.5).
Then fix, re-run, and state in the final summary **what was tested and what was fixed**.
- **Never say "100% bug-free".** The user's reliability standard is absolute, so be exact: list what was verified and
  what was NOT (e.g. "not tested on a real phone"). The user: *"we can't deploy something that is not 100% bug free — this
  is our reliability."* → do the full QA, then report honestly. (When the user asked "100% QA and debugged?" a second QA
  pass found 5 more bugs — so keep hunting with hostile inputs until a pass finds nothing.)
- Extra verification the user liked: **test in the user's real Chrome** (§7), and **run the build gates before deploy
  without pinging IndexNow** (§6). A "Copied" label that fired even when the copy failed was found only by real-Chrome testing.

### 3.3 Never invent, never guess
Copy the existing pattern/live reference page exactly (Paint/Wallpaper/Standard Deviation/Fraction are the freshest
references). If something is unclear or missing from the skill files, **stop and ask**. Do not change an existing
element's colour/weight/size while restructuring something else (user: "why did you change font color & weight? make it
as it was before").

### 3.4 Process rules
- **Calculator build order:** research report → approval → build → deep QA → preview → "deploy". Never fold steps together.
- **Never ship fewer inputs than competitors** (Rule 8.5) — list every competitor input in the report; dropping any needs
  the user's sign-off in the report.
- **Deploy is gated:** build + commit + push **only** after the user says "deploy" / "ship it". "Looks good" ≠ deploy.
- **Terse replies.** Short and precise. Tables only for the research report. Answer "did you…?" with proof.
- **Articles are DEFERRED** (since 2026-10-05): never write, propose, or ask about an article after shipping a calculator.
- The user previews at `http://localhost:8123/<slug>/` (same PC) and `http://10.0.0.19:8123/<slug>/` (Wi-Fi).
  Final message gives these links + "Reply 'deploy' when you're happy with it."

### 3.5 Concrete UI corrections the user made this session (permanent — check every new calculator against them)
- A user-entered **name must be visible** in lists/tallies, shown as a **label ABOVE its row** (pattern exists in the
  Flooring/Gravel tally; for single-named-room project tables: a label row above the data row).
- **Never invent labels** the user didn't specify (Paint had a "Walls" label; now the first column says "Area" when walls
  are the only surface; "Walls/Ceiling/Trim & doors/Primer" appear only when the user picked more than walls).
- Keep numeric columns **on one aligned line**; tally rows keep `name | quantity | area | ✕` as before.
- Sub-text keeps its grey 12px weight-500 style (`.pt-sub`) — don't restyle it to bold/black.
- **Paired fields stay side by side on mobile** (override the global `.two` 430px stack with `.p-xxx .two{grid-template-columns:1fr 1fr}`).
- **Go advanced must open a real visible panel above the button** (display:none → ''), resetting on "Go simple".
- **Sticky `.mbar`** shows the live result on mobile; **start EMPTY** (example chips that fill the box on click are fine,
  pre-filled demo values are not); field spacing is global (`.fld{margin-bottom:15px}` — don't touch).
- Narrative-takeaway sentences get `.res-tip.adv-tip` (16px amber) at authoring time (violated 7× before).
- 12px floor for SVG text; ≥14px for body/data text.

---

## 4. What matters NOW vs what does NOT matter now

**Matters now (user priorities):**
- **Many calculators, fast** — "we need lots of them." SEO traffic is the guiding light. Work down the ranked backlog
  (`md-files/calcthis-calculator-roadmap.md`): **#25 Recipe Converter next**, then #26–29 (lower priority).
- Every research report needs a **visual AND functional differentiator** — don't skip or cut corners.
- **Reliability**: deep QA every build; honesty about what is/isn't verified.
- Speed of the user's decision loop: short reports, ≤3 decisions, recommendations given.

**Does NOT matter now — do not raise, do not do, do not ask:**
- **Blog articles** (deferred). Calculators awaiting a future article batch: **Fraction, Standard Deviation, Paint,
  Wallpaper, Scientific Notation**. Never propose one.
- Dark mode (parked). The grade/gpa per-row `.csel` retrofit (low priority).
- **Pregnancy / Due Date + Ovulation calculators** — parked until AdSense approval (ask the user **once** if it landed,
  otherwise ignore).
- **Letter Grade Calculator** and **Cooking Measurement Calculator** — dropped. Don't revisit.
- Finance verticals (#26 Sales Tax, #28 Paycheck, #29 Tip) and #27 Unit Converter are **lower priority** — only after #25.

---

## 5. Open items / known limitations (nothing blocking)

- **New calculators were QA'd in the built-in browser (375px emulation) + the user's real Chrome (desktop) — none on a real
  phone.** Say so honestly in QA summaries.
- Wallpaper: default 4 in trim allowance → higher roll counts than competitors that skip trim (explained on-page).
- Paint/Wallpaper/Sci Notation have **no companion article** (deferred).
- Pregnancy/Ovulation: ask once whether AdSense approval landed.
- The Browser pane's screenshot tool is flaky (see §7) — rely on DOM/JS checks plus a retried screenshot.

---

## 6. How to build and ship a calculator here (files to touch — all of them, every time)

Read first: `assets/style.css`, `assets/app.js`, `partials/header.html`, `partials/footer.html`, `build.js`, `sitemap.xml`,
one reference page; skill files in `md-files/` (design-system, new-page-checklist, workflow-rules). Freshest reference
pages/engines: **Paint** (`paint-calculator/`, `initPaintCalc` — diagram + shopping list + tally + mbar), **Wallpaper**
(`initWallpaperCalc`), **Scientific Notation** (`initSciCalc` — BigInt decimals + expression parser + inline-SVG pictures),
**Standard Deviation** / **Fraction** (Go advanced + mbar), Square Footage (diagram), Flooring/Gravel (tally).

1. `<slug>/index.html` (full-keyword slug; `<!--HEADER:START/END-->` + `<!--FOOTER:START/END-->` markers; JSON-LD
   WebApplication + FAQPage; `.related-calcs` (2–4 pills); SEO content + 5 FAQs; `<body class="p-xxx">`; init call).
2. `assets/style.css` — a labelled `.p-xxx` block (never an inline `<style>`; **no** per-page `.fld` rule).
3. `assets/app.js` — `CalcThis.initXxx` inserted **before** the "SITE FOOTER — mobile accordion" comment block.
4. `build.js` PAGES array · `partials/header.html` (right column) · `partials/footer.html` (right pillar).
5. `index.html` (homepage): inline nav copy, card in the right `#grp-*` section, JSON-LD `hasPart`, the prose paragraph
   clause + the spelled-out count (currently **"forty-six calculators in all"** → next is "forty-seven"; the construction
   sentence says "thirteen" — bump only if adding a Construction calc), inline footer list.
6. `sitemap.xml` (multi-line `<url>` with `<lastmod>`).
7. **Deep QA (§3.2)** → serve preview → links → wait for "deploy".
8. **On "deploy":** `node build.js` (bumps `.assetver`, stamps header/footer, pings IndexNow — it sometimes prints only a
   Node version line after the ping flake: just re-run), then `git add -A`, commit (end with the
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` trailer from the system reminder), `git push origin main`,
   then update **CLAUDE.md** (counts, live list, "Last session", start-here block), **HANDOFF.md**, the roadmap md
   (mark ✅ shipped vN), memory (`calcthis-roadmap-status`, `MEMORY.md` index) and push a docs commit.
- **Verify the build gates BEFORE deploy without pinging IndexNow** (the ping submits ALL sitemap URLs, including a
  not-yet-live page): make a temp copy of `build.js` with the `/* ===== INDEXNOW:START … INDEXNOW:END ===== */` block
  removed (e.g. `_build_noping.js`), run it, then **delete it**. It stamps pages and bumps `.assetver` harmlessly; the
  real `node build.js` at deploy bumps once more.
- A **new vertical** (like Cooking) also needs: a nav column + footer pillar (check `md-files/calcthis-nav-structure.md`
  / `calcthis-footer-structure.md`), a homepage `#grp-*` section + category tab (see how `grp-math` is wired in the bottom
  script of `index.html`), and a footer-accordion check on mobile.

---

## 7. Environment gotchas (save yourself the debugging)

- **Shell scripts with backticks/regex via `node -e "…"` or bash heredocs get mangled** — write script files with the
  **Write tool** into the scratchpad dir and run them with node. `String.replace(str, replacementString)` treats `$'`,
  `$&` etc. specially — **always pass a function replacer** (`()=>text`).
- **Line endings are mixed:** `app.js`, `index.html`, many md files are CRLF; `style.css` is LF. Edit scripts must handle
  both (normalise `\n`↔`\r\n` when matching/inserting) or they silently "miss". `git` prints CRLF warnings — harmless.
- Python is not installed (use node).
- **Browser pane:** the first screenshot often times out — **retry (sometimes twice)**. **Stale JS/CSS:** the page loads
  `app.js?v=N` from cache even after the file changed → run
  `await fetch('/assets/app.js?v=<current>',{cache:'reload'}); await fetch('/assets/style.css?v=<current>',{cache:'reload'}); location.reload()`
  (use the **exact** `?v=` the page references) before re-testing. Tab id is `seed` (or the id from `preview_start`).
  `resize_window` mobile emulation **must be reset** with preset `desktop` afterwards. If the pane can't navigate to
  localhost, run `preview_start` `calcthis-static` again.
- **Drive tests with JS** (`javascript_tool`): set input `.value` + dispatch `input` events, read DOM output, run big
  case tables and compare with hand-computed expected values; also `read_console_messages` (onlyErrors).
- **Real Chrome** (the user's own browser) is available via the `mcp__claude-in-chrome__*` tools (deferred — load them
  with ToolSearch `select:mcp__claude-in-chrome__list_connected_browsers,mcp__claude-in-chrome__tabs_context_mcp,
  mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__computer,
  mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp`).
  Use `tabs_context_mcp{createIfEmpty:true}`, navigate to `http://localhost:8123/<slug>/`, test with real clicks/typing
  (real user gestures — e.g. clipboard works only with a real click, not a JS `.click()`), then **close the tab you opened**.
- `node build.js` writes ~79 files (all pages get the new `?v=`) — expected; commit them all.
- Co-Authored-By trailer text comes from the system reminder (currently `Claude Sonnet 5.5`).

---

## 8. Backlog (ranked — `md-files/calcthis-calculator-roadmap.md`)

| # | Calculator | Notes |
|---|---|---|
| **25** | **Recipe Converter** | **NEXT.** >1K Easy (129 keywords, small). Opens a Cooking vertical. |
| 26 | Sales Tax | >10K but Hard; needs per-state/local data. Lower priority. |
| 27 | Unit Converter | Head >10K Easy but variants Hard; Google answers inline; big scope. Lower priority. |
| 28 | Paycheck | YMYL tax tables, high risk. Lower priority. |
| 29 | Tip | Head Hard, Google inline. Lowest. |
| — | Pregnancy/Due Date + Ovulation | Parked until AdSense approval. |
| — | Dropped | Cooking Measurement, Letter Grade. |

For every new calculator: Rule 8 research report (open every competitor live, list every input, propose a visual AND a
functional differentiator) → approval → build → **deep QA** → preview → "deploy".

---

## 9. Reference — what each shipped calculator's research found (so you never re-research)

- **Paint (#22):** Omnicalculator, Sherwin-Williams (Quick/Custom/Deck), Behr (Interior/Exterior/Wood stain/Floor), PaintColorHQ.
  Nobody had a visual, a real buy-list with leftover/cost, multi-room totals, primer, or per-surface coats. User approved
  Exterior mode; dropped Deck/Stain/Floor tabs.
- **Wallpaper (#23):** Omnicalculator (project type, L/W/H, doors/windows, roll L/W, repeat, price), Inch Calculator (L/W/H +
  per-field units, sq ft per roll, price), Kalk.pro (room vs walls mode, doors/windows, roll W/L, repeat, alignment reserve,
  side overlap, shift pattern, price), Materio (5-step wizard: photo upload → walls → openings → specs with match types
  straight/half-drop/multi-drop/panel/free + by-the-yard → strip layout + spare strips), Laurel Mercantile (static chart),
  Boråstapeter (404). User dropped Materio photo upload, Kalk "shift the pattern", Omni's single-wall/room switch.
- **Scientific Notation (#24):** calculator.net (converter + X/Y arithmetic with 7 ops), CalculatorSoup (all formats + SI
  prefix + word form + order of magnitude), Omnicalculator (one box + sig figs), Pearson (5 modes, steps, decimal-move
  visual behind toggles), Kanaries (all formats + sig figs + steps), DQYDJ (direction toggle). User approved: arithmetic in
  the same box; drop Pearson's Normalize mode + common-mistakes toggles; include word form up to 10^66.
