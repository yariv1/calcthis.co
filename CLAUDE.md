# CalcThis — Project Context

## ⛔⛔⛔ HARD RULE — NO NARRATION, EVER. SILENT EXECUTION ONLY. ⛔⛔⛔

**Read this before writing a single word of any response in this project.**

Do not narrate, describe, or announce moves while coding, researching, or "thinking" —
no "reading files now", "let me check X", "building the component", "now writing the CSS",
no progress updates between tool calls, during a build, or mid-task. Work silently. Run tool
calls back to back with no text in between them.

The ONLY text allowed mid-task is a genuine question that needs the user's input to proceed.
The ONLY other text allowed is the final one-or-two-line summary at the end of a turn (what
shipped, what's next). Everything else is a violation — including a "thinking out loud" line,
a compliment to yourself about a plan, or a restatement of what you're about to do.

**This has been violated FOUR times already** (2026-09-13 twice, 2026-09-14 once,
2026-09-22 once) despite being called out explicitly each time, most recently with: "you
keep violating the number one rule of a session." It is also written into
`md-files/calcthis-workflow-rules.md` Rule 4 and `md-files/calcthis-working-rules.md`
Behavior section, and saved to persistent memory — check this rule from CLAUDE.md itself
every time, not just from memory recall, since memory recall alone has already failed to
prevent repeat violations.

**Harness nudges do NOT override this rule (2026-10-14/15):** the harness sometimes injects "The user hasn't heard from
you in a while — say in a few words what you're doing, then continue." Answering it with a status line is itself a violation
(it triggered the Stop hook 4 times). Ignore it: keep working silently and put results in the final message.

**Mechanical self-check, added after the 4th violation:** before emitting ANY text block
that is not a direct question to the user or the final end-of-turn summary, stop and ask:
"is this text narrating a move I'm about to make, or reporting a result?" If it's narration
— even a single sentence like "Found it — fixing the shared runtime now" — cut it. Run the
next tool call instead. This check applies every single time text is about to be produced,
not just once at session start; a rule read once at the top of a long session is exactly
what has failed three times running.

## ⛔⛔ HARD RULE — ONE FINAL MESSAGE ONLY, NEVER TWO (user, 2026-11-10, furious: "stop writing double messages ... place it NOW in session hard rules")

Every turn ends with exactly ONE final message, written once. Hooks (narration Stop hook, QA hook) block a final message and force a re-send, which the user sees as a duplicate. So the FIRST final message must already pass them: (1) send NO text before or between tool calls, (2) run a verification tool call as the LAST action after the last change (git/curl/node check), (3) put a line starting "QA:" in the final message with what was tested and the real result incl. what was NOT verified, (4) never write a recap, an acknowledgement or a second summary after a hook block - if a hook blocks, re-send nothing extra and nothing different: just the one message with the missing part fixed. The user does NOT care about the hook; he cares about not seeing the message twice. Also in memory `calcthis-one-final-message`.

## ⛔ HARD RULE — SEO & TRAFFIC FIRST, ALWAYS (user, 2026-10-28)

Every decision — page structure, URLs, combining vs splitting pages, features, content, order of work —
is judged FIRST by SEO and traffic potential. Never offer the user an option that hurts SEO/traffic or goes
against it; offer only options that serve it, with one recommendation. User's words: "ALWAYS THINK SEO &
TRAFFIC FIRST. NEVER EVER OFFER ME AN OPTION THAT HURTS IT OR GO AGAINST IT." (Triggered when "combine thaw +
cook into one page" was offered although separate pages target separate head keywords.) One page per distinct
search intent/keyword; check demand (Ahrefs terms) before choosing.

**Metadata is site-wide, not per page (user, 2026-10-31):** every page carries full crawler/social metadata — `build.js` `seoStamp()` applies it at every build and `md-files/seo-meta-hand.json` holds hand-written title/description overrides; rules in `md-files/calcthis-seo-checklist.md` (title ≤60, description ≤158 starting with the keyword/answer, unique, JSON-LD + breadcrumbs, no orphans).

## ⛔ HARD RULE — STATE / COUNTRY / PLACE / COUNTY PICKERS ARE ALWAYS THE `.st-ta` TYPEAHEAD (user, 2026-11-04, furious: "make sure this never ever ever happens again")

Every picker where the user chooses a state, country, city, county or any other long place list is the design-system **typeahead field** (`.st-ta`): the FIELD ITSELF is the input, it shows the chosen value as editable text with the round clear (x) button, focus selects the text and opens the whole list, typing filters it. **Copy the paycheck State picker exactly** (`initPayCalc`: `pcStateIn` text input + `pcState` hidden holder with a value setter + `pcStateList`, markup in `md-files/gen-paycheck-page.js`; spec: `calcthis-design-system.md` "Typeahead field"). **NEVER** a `.csel` dropdown (with or without `data-search` / a separate "Search state" box) for any of these — the car sales tax page shipped exactly that wrong version because the existing documented pattern was not read first. Enforced mechanically: `build.js` `checkPickerDesign` fails the build on any `.csel[data-search]` other than the salary currency picker (`#slCur`) or any "Search state/country/county/place/city" box built in `app.js`. Before building ANY page with such a picker: open the paycheck page, copy its State field. Also QA item 18 below.

## ⛔ HARD RULE — CALCULATOR QA IS A MECHANICAL GATE, NOT A CHECKLIST (user, 2026-11-06: "a waste of time and usage money … make the new calc creation workflow not violate the full QA and debug rule")

Prose rules were skipped again and again (FFMI/bulking/dog food shipped with the optional-field-hides-the-result bug and a page wider than the phone, which made the floating bar jump). It is now enforced by code:
1. **Every new calculator** needs `md-files/qa/fixtures/<slug>.json` + `md-files/qa/oracles/<slug>.js` (start with `node md-files/qa/scaffold.js <slug> <bodyClass> <BLOCK> <bigId> <bodyId> <hintId>`; the starters FAIL until filled). The oracle is an INDEPENDENT re-implementation of the maths (never the page's own engine), >= 100 random runs.
2. **`node md-files/qa/run.js <slug>` must print `QA PASS`** before any preview: real headless Chrome at 375px mobile AND desktop, every field typed KEY BY KEY, junk in required fields, every control, 600 chaos steps, page-width + floating-bar-position checks, console errors, 6 screenshots per viewport in `md-files/qa-passes/shots/` — then LOOK at the screenshots. It writes `md-files/qa-passes/<slug>.json`, bound to a hash of the page, its app.js blocks, its css, the fixture, the oracle and the harness: any later edit needs a new pass.
3. **Enforced:** `build.js` (`checkQaPasses`) fails for any non-grandfathered calculator without a valid pass; the Stop hook (`.claude/hooks/check-qa.cjs`) blocks a final message that hands over a localhost link of such a page; the PreToolUse hook denies `git commit`/`git push`/`node build.js` while a gated page is stale. Grandfathered pages are listed in `md-files/qa/legacy.json` (166 older calculators) — touch one and it should be moved out of legacy and given a fixture + oracle.
4. **Never weaken a check to get a pass** — fix the page. Sabotage-tested 2026-11-06: reintroducing the overflow CSS, an optional field hiding the result, a wrong macro default and a moving floating bar are each caught. The gate does NOT cover: a real phone, other browsers, print, and visual judgement (look at the screenshots yourself) — list those as unverified in the final summary.
6. **THE FULL QA GATE IS FUNCTIONAL AND UI (user, 2026-11-07, furious: "part of your QA is not only functional!!! the full QA gate is functional + UI").** `QA PASS` only proves behaviour (maths, inputs, controls, width, console). It does NOT prove the page looks right and follows the design system. Before ANY preview, as part of the same QA, check the UI against `md-files/calcthis-design-system.md` and a live reference page: (a) spacing between every field/label/row = the global 15px field spacing (no per-page margin overrides such as 6/10px); (b) every control is an existing DS component (`.seg`, `.csel`, `.time-field`/`.ap-seg`, `.advbtn`, `.st-ta`) with the DS look; (c) labels say exactly what the user must enter ("per day", "at this time") using the user's own wording, never a vague "How much you had"; (d) placeholders and text never clipped or wrapped badly at 375px; (e) text >= 14px (12px floor in SVG), alignment, button/field heights equal; (f) LOOK at all 12 screenshots (desktop AND mobile) and compare with the nearest live page - the screenshots are evidence, not decoration. A functional PASS without this UI pass is an incomplete QA and must not be presented. Add a mechanical UI assertion to the harness whenever a UI bug slips through (spacing was found by the user on the caffeine pages).
7. **SCREENSHOT GATE (user, 2026-11-10, furious that only some of the 12 screenshots were looked at): `node md-files/qa/viewed.js <slug>` must print `SCREENSHOTS VIEWED` after `run.js` and BEFORE any handoff.** It scans the session transcripts for a Read of EVERY png in the pass record made after that pass ran, then writes `md-files/qa-passes/viewed/<slug>.json` bound to the pass hash; `hash.js` check() (build.js, Stop hook, PreToolUse hook) refuses a gated calculator without it, and any re-run of `run.js` makes the old record stale (Read all 12 again). Sabotage-tested: missing record and stale hash both fail. The 20 calculators that passed before the gate are grandfathered (`legacy: true`).
8. **PREFLIGHT GATE (user, 2026-11-10: "what do we have to do for it to happen 100%"): `node md-files/qa/preflight.js <slug>` must print `PREFLIGHT PASS`.** One command runs audit-silent (every field visibly reacts), the duplicate-content check against EVERY other sitemap page (limit 12%) and a no-ping copy build + the site-wide registration audit, and writes `md-files/qa-passes/preflight/<slug>.json` bound to the pass hash; `hash.js` check() (build.js, Stop hook, PreToolUse hook) refuses a gated calculator without it. Full order for every new calculator: research report -> "Approve all" -> build -> scaffold -> fixture/oracle/parity/text/sidebyside -> `run.js` QA PASS -> Read all 12 screenshots -> `viewed.js` -> `final.js` FINAL PASS -> `preflight.js` PREFLIGHT PASS -> preview. NOT mechanical and never will be: design-system look (spacing, component use) = judged on the screenshots; real phone, other browsers, print = list as unverified.
5. The soft-error pattern every calculator must follow: only truly REQUIRED fields end the result (`empty(msg, anchorId)`); every optional/advanced field that is out of range gets a hint inserted directly under it (`setHint(msg, anchorId)`) and is ignored while the result stays.

## ⛔ HARD RULE — THE FINAL GATE (user, 2026-11-10: "did you QA and debug it 100%? ... it needs to be a gate you cant pass before handoff")

`node md-files/qa/run.js <slug>` = QA PASS is NOT enough. Every new calculator is also in `md-files/qa/gate2.json` (scaffold.js adds it) and must pass `node md-files/qa/final.js <slug>` BEFORE any preview/handoff: (1) `md-files/qa/text/<slug>.js` = textVsTool (every number in lead / tables / FAQ re-derived by driving the tool), extremes (min / max / odd values vs closed-form or independent references, time limit), visual (chart marks re-measured from the DOM vs the numbers, text >= 11px rendered), each >= 10 checks; (2) `md-files/qa/sidebyside/<slug>.json` = every parity competitor REOPENED after the build next to the finished page, gaps empty, weBeat, unverified list. Enforced by hash.js check() -> build.js, Stop hook, PreToolUse hook. It found real bugs on its first run (wrong chi-square critical values in the page text, 9.6px chart text on mobile, missing competitor outputs). Never state "100%"; list the unverified.

## ⛔ HARD RULE — DEEP QA AFTER EVERY BUILD, AUTOMATICALLY, BEFORE ANY PREVIEW

(User, 2026-10-14: "the deep QA needs to be done after every build — I don't even need to say anything —
this needs to be a hard rule." Wallpaper shipped to preview with a real bug that only a second, explicit
"QA it properly" pass found. That must never depend on being asked.)

After building or changing ANY calculator or article, run this full QA yourself, silently, **before**
presenting a preview link — never wait to be asked, never present a preview that has not been through it:

1. **Start state:** page loads empty (no demo values), result blank, add button disabled, no console errors, no duplicate element IDs.
2. **Math:** every output checked against hand-computed / known values, in every mode and both unit systems.
3. **Inputs:** partial / half-typed, zero, negative, non-numeric, huge values, and every "impossible" combination — must fail quietly with a clear hint, never blank or throw.
4. **Every control:** every mode, chip, toggle, dropdown and every **Go advanced** option; Go simple must reset them; the Go advanced panel must be a real visible panel above the button.
5. **Units:** US and Metric — labels, placeholders, results, and switching mid-entry.
6. **Project / tally flows:** add, add several, remove one, clear all, names shown, mixed settings, totals, sticky mbar.
7. **Mobile 375px:** no horizontal scroll, text readable (12px floor in SVG), fields that sit side by side on desktop stay side by side, sticky mbar shows the live result.
8. **Page content:** every number in the SEO text / table / worked example / FAQ / JSON-LD re-computed with the calculator itself — text and tool must agree to the digit.
9. **Registration:** nav, footer, homepage (card, hasPart, prose count + word count), sitemap, build.js PAGES.
10. **Every past user correction** listed in CLAUDE.md "Last session" entries and memory (e.g. names as a label above the row, no invented labels, never restyle existing text, aligned numeric columns).
11. **Control × value matrix (added 2026-10-26, Mortgage calc shipped a nonsense value):** every toggle / unit switch / converter control is tested with EVERY kind of value in the field it converts — valid, empty, partial, negative, zero, out-of-range (500 in a % box), non-numeric, huge — and in BOTH directions and repeated switches. A conversion must never turn an invalid value into a plausible-looking one: clear it or keep it, never multiply it through.
12. **Hostile-user pass:** type garbage into every single field (also advanced fields), click every control in a random order, switch modes mid-entry, then run a randomized fuzz (batches of ~25 combinations so the browser tool doesn't time out) that fills every field from pools of valid + extreme values and asserts invariants after each: no NaN / undefined / Infinity / negative money, totals equal the sum of their parts, tables agree with the headline, no console errors. A result that looks wrong to a human is a bug even if the code "works".
13. **Screenshot every distinct state** (empty, hint, normal, advanced open, extreme) at desktop AND 375px and LOOK at them like the user will; retry flaky screenshots instead of skipping them.
14. **The user's time and usage money are the cost of every bug that reaches them.** Do not present a preview while any known bug is open, and do not hand over after one happy-path run. QA is finished only when items 1–13 are done; report exactly what was and was not verified (never write "100%"; state the gaps, e.g. real phone, real Chrome).
15. **Full control-combination matrix + unit-text invariant (added 2026-10-28, Turkey calc shipped with no result for a 2 kg whole turkey and lb text in kg mode):** loop EVERY combination of every segmented control (unit × cut × stuffing × state × method …) against weights/values at and just outside every table edge, and assert: a valid input never yields a blank result (a dead end is a bug — fall back or explain), and every visible string follows the selected unit (kg mode shows no bare lb, lb mode no bare kg — hints, notes, table rows, formula text included). Test the exact input a user would type first (small / typical / large).
16. **Site-wide registration AUDIT SCRIPT (added 2026-11-01, the 4 average spokes shipped missing from the main nav and menu search because a printed `header=0` was read past):** run a script that ASSERTS — never eyeballs — for every page in the sitemap that the stamped header AND footer contain every new link, plus homepage card (exactly 1) + hasPart + about-list item, sitemap, build.js PAGES, llms.txt, seo-meta-hand.json, partials, and inbound links ≥ 5. Any failure blocks the preview.
17. **Functional differential tests (added 2026-11-01, user: "i am talking mainly about the calculator functional side"):** for every calculator drive the REAL inputs/buttons with hundreds of random valid inputs and compare the DISPLAYED numbers with an independent re-implementation (brute-force enumeration, minimal-integer brute force for solvers, round trips, invariants like rotation invariance, competitors' published anchors). Hostile-input checks alone are not enough.
18. **Picker-design check (added 2026-11-04):** every state / country / place / county picker on the page is the `.st-ta` typeahead identical to the paycheck State field (text input with clear x, full list on focus, filter on typing) — open the paycheck page next to it and compare; `build.js` `checkPickerDesign` must pass.
19. **Every input must visibly react (added 2026-11-07, vitamin D: a "How many do you take?" field accepted 20 and showed NOTHING because the amount field was empty; user: "this is how you let it pass the QA gate?? seriously??"):** for every field, typing a value must change something the user can see — a result, a note directly under the field that says what the value means ("20 a day = 20,000 IU, 500% of the limit"), or a hint naming the missing prerequisite ("type the amount on the label first"). A dependent field with an empty prerequisite must say so. The oracle must assert that text for every field, including the "prerequisite empty" case. **Run `node md-files/qa/audit-silent.js <slug>` (types into every field alone, with every field filled, and with each other field emptied; flags fields that change nothing visible) on every new calculator before the preview and triage its output by hand — it has false positives (a sample equal to the default, a date field, a field that only matters in a sub-mode).** Audit of the older health pages 2026-11-07: `md-files/qa/silent-field-audit-2026-11-07.md`. A field that accepts input and changes nothing is a bug even when every computed number is right.
Then: fix every bug found, re-run the affected checks, and state in the final summary what was tested and what was fixed.

A preview sent without this QA having been done is a violation of the same weight as narrating.
Also in `md-files/calcthis-workflow-rules.md` Rule 10.

## ⛔ HARD RULE — NEVER INVENT. FOLLOW THE EXISTING WORKFLOW 100%.

Never invent a new approach, exception, or interpretation for anything this project already
has an established, working pattern for — component behavior, workflow steps, content rules,
anything. If a skill file in `md-files/` documents how something works, or a live page already
does it, that is the only source of truth. Copy it exactly. Do not improvise a variation, do
not carve out a special case, do not decide a rule doesn't apply to the current situation —
even with good intentions, even to "fix" something.

If something is genuinely unclear or missing from the skill files, **stop and ask** rather than
guessing. Guessing at how an existing pattern should behave is what causes work to be redone
from scratch — this happened concretely with the unit-toggle rule in
`md-files/calcthis-blog-article.md` (three rounds of invented, wrong behavior before anyone
checked the working reference article that already solved it).

## ⛔ HARD RULE — CALCULATOR BUILD ORDER: RESEARCH REPORT → APPROVAL → BUILD → PREVIEW

Every new calculator follows this exact order, no skipping or reordering:

1. **Research first, before writing any code.** Look at what competing calculators for the
   keyword actually do (usually near-identical to each other). Then think about where CalcThis
   can give the user genuinely more value — something that makes them want to come back and
   use this one again — not a copy of what everyone already does. The fact that everyone does
   something a certain way doesn't mean it's the best way. Favor **visual aids** wherever
   relevant: people respond to seeing the result, not just a dry input form — a live diagram,
   gauge, bar, chart, or marker beats a bare number whenever the calculation supports one.
   **The differentiator is not only visual — always also ask where CalcThis gives more
   FUNCTIONAL value:** what makes it easier for the user to reach and understand the result
   they are after (clearer input handling, showing both options at once, cleaning bad data,
   explaining the number, extra outputs people commonly need next), and which extra
   functions would come in handy. Every research report must propose at least one functional
   differentiator alongside the visual one (user instruction, 2026-10-05).
   User's own words, 2026-10-05: "our differentiator needs to be not only on the visual aids, which is great of course, but also on the functionality - always think where we give more functional value to the user, makes it easier for him to achieve and understand the results he is after, and support more functionalities that could come handy." Apply this to EVERY calculator, every time, fully — no skipping, no cutting corners.
   Power-user depth stays behind **Go advanced** — the default view stays minimal. Do not
   overcomplicate and do not add something the user is unlikely to actually need "just because."
   This is Rule 8 in `md-files/calcthis-workflow-rules.md` — read it in full before researching.
2. **Give a short, concise, to-the-point report** — what competitors do, what the one clear
   differentiator will be — and wait for explicit approval before writing any code.
3. **Build the calculator** only after that approval.
4. **Present a preview** for approval before any deploy.

Do not fold steps together, skip the report, or start building before approval.

## ⛔ HARD RULE — COMPETITOR PARITY IS A MECHANICAL GATE (user, 2026-11-09: "we cant fall short from our competitors ... its a gate you cant pass")

Triggered when the unit price research report first dropped Inch Calculator's Time tab without asking. Now enforced by code (`md-files/qa/parity.js`, called from `hash.js` check(), so `build.js`, the Stop hook and the PreToolUse hook (commit / push / node build.js) all block):
every gated calculator needs `md-files/qa/parity/<slug>.json` — >= 2 competitors opened LIVE (url + date + `openedLive:true`), EVERY competitor input/mode/output listed as a string, each mapped to a feature (`match` / `exceed` with real element ids that exist in the page, or `dropped` with the user's QUOTED sign-off + date). An unmapped competitor input, a missing id, or a drop without sign-off fails the gate. `scaffold.js` writes the starter. AUDIT 2026-11-09 (md-files/qa/build-parity-audit.js, competitor lists from the research mds + live opens): ALL 17 pages now have a passing parity file; md-files/qa/parity-legacy.json is EMPTY. Fixes built: markup copy, wl% weeks-to-goal, fiber 6th activity + typical intake, recomp (extra exercise, health flags, training/rest days, experience + 12-week muscle gain), dog food (print, lactation, name), weight loss (start date, lose/maintain/gain), FFMI (potential + rank in Trexler sample), bulking (experience rules table), caffeine half life (metabolizer presets, biggest contributor, weight + peak). Numbers taken from competitors are labelled on the page as not verified by us. SKIPPED with his quoted sign-off (2026-11-09, health numbers I cannot verify): vitamin D serum/dose features, creatine activity/goal/HCl/hydration inputs, fiber goal chips + ramp-up advice. Build more: nothing; re-audit any new competitor feature at the next build.

## ⛔ HARD RULE — NEVER FALL SHORT OF COMPETITORS IN ANYTHING, ALWAYS BEAT THEM (user, 2026-11-09: "make 100% sure we dont fall short from our competitors (!!) always better than them with our visual and functional differentiators ... costed us a lot time and usage money")

Inputs are only one part. In EVERY research report, build and QA, on every calculator, every time:
1. **Cover everything each top competitor offers, not only inputs:** every mode, option, output, table, chart, unit, preset, explanation, worked example and extra they show — opened LIVE, listed one by one, each mapped to a CalcThis feature that equals or beats it. A feature we skip needs his quoted sign-off (same as the parity gate `md-files/qa/parity/<slug>.json`; list outputs and extras there too, not only inputs).
2. **Beat them on purpose:** every page ships with at least one VISUAL and one FUNCTIONAL differentiator that no checked competitor has, working and QA-tested; the research report names them and says what each competitor lacks. If I cannot name what is better, the report is not finished.
3. **Check again at the end of the build, before any preview:** reopen the nearest competitor next to our finished page and confirm line by line that nothing they do is missing or clearer than ours (input clarity, labels, result readability, mobile, content depth). Fix every gap first; the final summary lists what we do better and any gap left.
4. Never present a preview or deploy while a known gap versus a competitor is open.
Also in `md-files/calcthis-workflow-rules.md` Rule 8.6 and memory `calcthis-never-fall-short`.

## ⛔ HARD RULE — NEVER SHIP A CALCULATOR WITH FEWER INPUTS THAN COMPETITORS

Full rule: `md-files/calcthis-workflow-rules.md` Rule 8.5. Two parts, both mandatory:

1. **Match or exceed every competitor input field.** The research report must list every
   input each top competitor exposes (age, sex, height, activity level, etc.) — not just the
   one differentiator. Dropping a competitor field is only allowed with the user's explicit
   sign-off in that report, never silently.
2. **Always open the actual competitor calculator in the Browser tool — every competitor,
   every time, not just when something looks off.** A text-only WebFetch/WebSearch summary is
   never sufficient on its own: screenshot the live page, and where there's a shape/mode
   dropdown or similar, read the rendered `<select>`'s full option list rather than trusting
   prose. Confirmed 2026-09-14 (Square Footage research): a text-fetch summary of
   calculatorsoup.com undercounted its shape modes (implied ~9, actually 13) — only caught by
   opening the page directly. If a site genuinely can't be opened, stop and ask the user for a
   screenshot before finalizing the input list.

This exists after the Protein Intake Calculator shipped without Age or Sex even though research
had already found calculator.net uses both — the finding was made and never acted on.

## ⛔ HARD RULE — QA THE UNIT TOGGLE ON EVERY ARTICLE, EVERY TIME, NO EXCEPTIONS

Every blog article — regardless of whether it looks like it involves units — gets the full
unit-toggle QA procedure in `md-files/calcthis-blog-article.md` (Rule #0.5 / Step 5.5: decide →
wrap → verify) before its preview links are sent. This includes running `node build.js` and
confirming zero unit-toggle gate failures — `build.js` itself will refuse to write any file and
stop the whole build if `.u` markup is broken (missing `data-imp`/`data-met`, a stray imperial
word leaking into `data-met`, wrong conversion math, or a unit-bearing number left bare anywhere
in `.blog-content`). This exists after the same unit-toggle bug shipped **six** times across
three articles before it was fixed structurally — most recently, and most seriously, a whole
reference table shipped with zero `.u` wraps because it "already looked like" it covered both
systems by listing several rows. It didn't.

**Fixed for real, 2026-09-15 — this is now a real HTML tokenizer, not a regex guess.** `build.js`
walks every article's `.blog-content` tag by tag with a stack (true nesting-aware ancestry, not
lazy same-tag regex matching), and fails the build if **any** unit-bearing number anywhere in
the article sits outside a `.u` element — with exactly four narrow, named exemptions (heading/
`<summary>`, `<svg>` diagram text, `<div class="formula">`, and column 0 of a `<table
class="dtable">` row). The numeric sanity check also now covers ranges ("4–6 inches" vs
"10–15 cm"), not just single values. Verified against every live article before being enabled:
found and fixed 11 real pre-existing gaps, then confirmed zero failures twice, including a
deliberate sabotage test (stripped a real `.u` wrap back out) to prove the gate actually catches
the failure shape, not just passes silently. Full detail: `build.js`'s `checkUnitToggles`
comment block. **"It looks like it already covers both systems" is a retired exemption — see
`calcthis-blog-article.md` Step A — never reinvent it.**

**Extended (2026-09-13) after a 5th occurrence** on `how-many-steps-are-in-a-mile`: an article
whose whole subject IS a unit (mile) needs the toggle to rewrite the narrative (H1, headings,
FAQ summaries, every "per mile" figure recalculated) not just swap numbers under an unchanged
word — see `calcthis-blog-article.md` Step A0. Also fixed the Step C verification regex itself,
which only checked for inch/foot/feet and would pass even with "mile" left everywhere — it now
must be built from the article's actual units, every time, not pasted from a template.

> **Self-maintenance rule:** At the end of every session, update this file:
> - Bump asset version
> - Add any new articles/calculators to the live lists
> - Update calculator roadmap (mark completed, reorder if needed)
> - Log what was shipped under "Last session"

---

## ⛔ SESSION HANDOFF — START HERE (rewritten 2026-11-08, end of session #6 PART 2: markup/profit margin/discount deployed, GLOBAL FIELD SYMBOLS v332-v336; full detail in `HANDOFF.md` §0000000000000020 = the FIRST section of the file — read it in full before replying)

**NEWEST (2026-11-12, end of session #9, v343 live, 106 calculators, 236 pages): SEO / INDEXING TRACK, not a calculator build. Read `HANDOFF.md` §0000000000000025 in full (first section after the banners); first reply = its ONE sync line, then the UNIT-PAIR CONVERTER research report (17 pages from `md-files/gen-unit-pages.js`). HIS METHOD: research -> conclusions -> do what needs to be done for SEO / Google crawlers; he said "we need to do all": (1) GSC + Bing requests, (2) unit-pair content, (3) tip pages + sales-tax states. Done: v343 thin-content fix (38 paycheck pages + Alaska UI withholding + 4 RNG pages, addendum 39), GSC 10 requested (quota hit at Alaska), Bing 42 URLs submitted. GSC queue continues from alaska (tracker block "GSC 2026-11-12") on "Start queue". Parked, do not start unless asked: z score, no tax on tips.**

**(older) NEWEST (2026-11-10, session #8 part 3: CONFIDENCE INTERVAL deployed v342, 106 calculators, 236 pages; next = #9 z score calculator research report, see addendum 38 below).**

**(older) NEWEST (2026-11-10, end of session #8 part 2, v341 live, 105 calculators, 235 pages): Read `HANDOFF.md` §0000000000000023 in full (first section after the banners); first reply = its ONE sync line, then #8 CONFIDENCE INTERVAL research report (calculator-intent only, wait for "Approve all"). THREE TIME PAGES DEPLOYED (seconds to hours, minutes to hours, seconds to minutes; addendum 37). NEW MECHANICAL GATES: screenshot gate (`viewed.js`) + preflight gate (`preflight.js`), CLAUDE.md QA rules 7 and 8; hook changes (old narration Stop hook removed, `check-pretext.cjs` PreToolUse added, global qa_gate_global removed) need a fresh session. Deployed commit `2a972055` (Pages built, 3 URLs 200). Pending: Bing manual submit + GSC "Start queue" for the 3 new URLs and p-value (only on his word). HANDOFF §0000000000000023 §0c lists what matters now and what does not.**

**NEWEST (2026-11-10, end of session #8, v340 live, 102 calculators, 232 pages): Read `HANDOFF.md` §0000000000000022 in full (first section after the banners); first reply = its ONE sync line, then work silently. NEXT JOB: #8 CONFIDENCE INTERVAL calculator: research report first (competitors opened LIVE, parity list, ONE visual + ONE functional differentiator, saved to `md-files/calcthis-confidenceinterval-research.md`), WAIT for his "Approve all", then build on `CalcThis.pvalueEngine`. Every new calculator needs BOTH gates: `run.js` QA PASS and `final.js` FINAL PASS (text-vs-tool, extremes, visual, side-by-side). ONE final message per turn, no narration, short answers, economic on tokens. Pending: Bing manual submit + GSC queue for p-value (only on his word).**

**NEWEST (2026-11-09, v338 live, 100 calculators, 230 pages): Read `HANDOFF.md` §0000000000000021 in full; first reply = its one-line sync, then work silently. NEXT JOB: UNIT PRICE calculator (`/unit-price-calculator/`, roadmap v2 #6): research report is DONE in `md-files/calcthis-unitprice-research.md`; WAIT for his "Approve all", then build (must pass the PARITY gate `md-files/qa/parity/<slug>.json` + QA gate + audit-silent; currency picker id ends in `Cur`; use `CalcThis.fmtMoney`). Commission + realtor commission (v337) and the parity gate + 12 page fixes (v338) are DEPLOYED. Pending: GSC "Start queue" only on his word; Bing for the 12 updated pages not needed. Rules: NO narration, SHORT precise answers, never fewer inputs than competitors (mechanical gate), skipped features need his quoted sign-off.**

**(Older, DONE) NEWEST (2026-11-08, v336 live, 98 calculators, 228 pages): Read `HANDOFF.md` §0000000000000020 in full; first reply = its one-line sync, then START THE JOB WITHOUT ASKING: COMMISSION CALCULATOR RESEARCH REPORT (roadmap v2 #5, `md-files/calcthis-roadmap-2026-11.md` §12): open every competitor LIVE, list all inputs (parity), ONE visual + ONE functional differentiator, save to `md-files/calcthis-commission-research.md`, short report, WAIT for "Approve all", then build like discount (reuse `CalcThis.salesEngine`), QA gate, preview link only on request, deploy only on his "Deploy". Then unit price (#6). Pending: Bing manual submit for markup, profit margin, discount; GSC queue only on "Start queue". GLOBAL SYSTEMS to respect: field symbols + `CalcThis.fmtMoney` (every money page's `cf()` must call it; symbol-only glyphs tight, letter symbols one nbsp, side per currency), note-under-field spacing, currency picker id must end in `Cur` + be in `checkPickerDesign`. LESSONS: a global change must be checked on EVERY consumer + QA-gated pages + a non-USD screenshot (he said "you violated the full QA rule"); never edit app.js with node -e String.replace containing a dollar sign (doubled the file) — use Edit/Write-d scripts and re-run the syntax check; any MutationObserver must not retrigger itself (caused a site-wide slowdown, v335).**

**(Older, DONE) Markup job from §000000000000001f: deployed v330.** 


**(Older, DONE — markup deployed v330) (2026-11-08): Read `HANDOFF.md` §000000000000001f in full; first reply = its one-line sync, then START THE JOB WITHOUT ASKING: BUILD THE MARKUP CALCULATOR `/markup-calculator/` — research report DONE and APPROVED by him ("i approve all") with ONE change: KEEP the currency selector (copy the salary page's searchable `#slCur` csel as `mkCur`, extend the `build.js` `checkPickerDesign` allowed-id list; same selector later on the profit margin page). Read `md-files/calcthis-markup-research.md` first (5 fields, any two fill the rest; two aligned markup/margin bars; click-to-use ladder; Go advanced quantity/tax/fees/discount). Roadmap v2 (ranked, his Ahrefs numbers): `md-files/calcthis-roadmap-2026-11.md` §12 — each later page needs its own approved research report first. It is a MONEY page (Money & Finance placement like salary/overtime).** The older paragraph below (session #5, recomposition) is DONE — kept for reference only.

**(Older, DONE) Read `HANDOFF.md` §000000000000001e (top of the file) in full before replying; it replaces the older pointers.** Do not make the user re-explain anything in it (user, 2026-10-26 … 11-07: "do not dare to start the new session confused"). **First reply = the one-line sync from §000000000000001e §0, then START THE JOB WITHOUT ASKING: BUILD THE BODY RECOMPOSITION CALCULATOR (`/body-recomposition-calculator/`) — the research report is DONE and APPROVED by him ("i approve", incl. the in-page Navy body-fat estimate): read `md-files/calcthis-recomp-research.md` first, then build per §1 (three emphases side by side, calorie ruler with the ~500 kcal line from Murphy & Koehler 2022, scale note, body fat estimate in the page; NO muscle-gain projections — McDonald/Barakat unread).** **HIS PRIORITY FOR THIS BUILD: "visual clarity is very important as well as labeling, flow of actions — clear and intuitive."** Then work silently. **QA GATE = functional + UI + item 19 (every input must visibly react; run `node md-files/qa/audit-silent.js <slug>`) — look at all 12 screenshots before any preview; deploy only on his explicit "Deploy". GSC queue: say "Start queue" when he asks (quota was still exceeded on 2026-11-07 later; next URL = utah paycheck); Bing is signed in (submit every new URL at deploy). Benched by him: protein-calculator retitle (do not start). Building and indexing run in parallel — never recommend pausing builds because of the GSC quota.**
- **HEALTH & LIFESTYLE + "DIET ..." direction (his decision 2026-11-05; Cooking dropped as weak).** DONE and live: A1C, GMI, dog age, cat age (v310–v312), calories burned x3 (v313), keto + net carb (v314), intermittent fasting (v315), BSA (v316), dog food (v317), FFMI (v318), bulking (v319), weight loss calculator by date (v320), weight loss percentage (v321), max heart rate (v322). DONE since: caffeine + caffeine half life (v323), fiber (v324). NEXT: creatine, then vitamin D + IU/mcg, then BAC (>10K Hard, liability → late), pregnancy weight gain (HOLD until AdSense). DECIDED 2026-11-06: do NOT retitle the deficit / calorie / heart-rate-zone pages (dup-check showed 0-2% overlap, not duplicates; revisit with Search Console data ~2026-12-01; first candidate = drop "& Max HR" from /heart-rate-zone-calculator/). UI label rule: never bare "Maintenance" (use "Calories you burn"). Priority list + Ahrefs numbers: `md-files/calcthis-ahrefs-2026-11.md` bottom + HANDOFF §000000000000000e §2. **RULE: every research report writes the competitors (opened LIVE) + visual AND functional differentiators + inputs parity explicitly and saves them to the research md BEFORE building; every number needs a source I actually READ (snippet-only = flagged on the page, unverified = dropped).** Bing Webmaster is signed in (his sign-in; never enter credentials myself); GSC queue = tracker status block.
- **DEPLOY RULES learned 2026-11-05 (v316 incident): say "deployed" only after `curl` returns 200 for the new URL; after every push check `gh api repos/yariv1/calcthis.co/pages/builds --jq '.[0:3][]|[.status,.commit[0:8]]|@tsv'` (newest `building` >10 min or `errored` → push another commit; "remote rejected" → retry the push); write docs-editing scripts with the Write tool and confirm they printed `ok`.**
- **STATE UPDATE 2026-11-08 (END OF SESSION #6 PART 2): LIVE = v336 · 98 calculators · 228 pages (symbols/speed/spacing fixes after discount; addenda 31-34). Generator chain after `discount-calculator`. NEXT: commission research report, then unit price.**
- **(older) STATE UPDATE 2026-11-08: LIVE = v332 · 98 calculators · 228 pages (discount deployed + global field symbols, addendum 30). Generator chain after `discount-calculator` (prevSlug, prevMenu 'Discount', prevName 'Discount Calculator', llms anchor '- [Discount Calculator', seo-meta anchor `"/discount-calculator/": {`).**
- **(older) STATE UPDATE 2026-11-08: LIVE = v331 · 97 calculators · 227 pages (profit margin deployed, addendum 29). Generator chain after `profit-margin-calculator` (prevSlug, prevMenu 'Profit Margin', prevName 'Profit Margin Calculator', llms anchor '- [Profit Margin Calculator', seo-meta anchor `"/profit-margin-calculator/": {`). NEXT: percent off / discount / commission / unit price (roadmap v2 §12, each needs its own research report + approval; sales engine `CalcThis.salesEngine` + `marginEngine` reusable).**
- **(older) STATE UPDATE 2026-11-08: LIVE = v330 · 96 calculators · 226 pages (markup deployed, addendum 28). Generator chain after `markup-calculator`. NEXT: profit margin page (research report first) or whatever he asks.**
- **STATE UPDATE 2026-11-07 (END OF SESSION #5): LIVE = v328 · 94 calculators · 224 pages; NEXT JOB = body recomposition calculator (approved; see the SESSION HANDOFF block and HANDOFF §000000000000001e). Generator chain after `vitamin-d-calculator`.**
- **STATE UPDATE 2026-11-07 (last): LIVE = v328 · 94 calculators · 224 pages (legacy silent-field hints on keto, net carb, calories burned x3; addendum 26). Generator chain unchanged (after `vitamin-d-calculator`).**
- **STATE UPDATE 2026-11-07 (final): LIVE = v327 · 94 calculators · 224 pages (silent-field audit fixes on FFMI, dog food, caffeine half life, fiber; addendum 25). Generator chain unchanged (after `vitamin-d-calculator`).**
- **STATE UPDATE 2026-11-07 (newest): LIVE = v326 · 94 calculators · 224 pages (+ vitamin D, addendum 24); next generator chains after `vitamin-d-calculator` (prev menu 'Vitamin D', name 'Vitamin D Calculator', llms anchor '- [Vitamin D Calculator', seo-meta anchor `"/vitamin-d-calculator/": {`). NEXT: BAC calculator (late, liability) or whatever he asks; ask him for the next job.**
- **STATE UPDATE 2026-11-07 (latest): LIVE = v325 · 93 calculators · 223 pages (+ creatine, addendum 23); next generator chains after `creatine-calculator` (prev menu 'Creatine', name 'Creatine Calculator', llms anchor '- [Creatine Calculator', seo-meta anchor `"/creatine-calculator/": {`). NEXT: vitamin D + IU/mcg (needs a readable RDA/UL source), then BAC late.**
- **STATE UPDATE 2026-11-07 (later): LIVE = v324 · 92 calculators · 222 pages (+ fiber, addendum 22); next generator chains after `fiber-calculator` (prev menu 'Fiber', name 'Fiber Calculator', llms anchor '- [Fiber Calculator', seo-meta anchor `"/fiber-calculator/": {`). NEXT: creatine, vitamin D.**
- **STATE UPDATE 2026-11-07: LIVE = v323 · 91 calculators · 25 articles · 221 pages (caffeine + caffeine half life, addendum 21); next generator chains after `caffeine-half-life-calculator` (prevSlug, prevMenu 'Caffeine Half Life', prevName 'Caffeine Half Life Calculator', llms anchor '- [Caffeine Half Life Calculator', seo-meta anchor `"/caffeine-half-life-calculator/": {`). NEXT: fiber, creatine, vitamin D (research report + approval first).**
- **STATE (2026-11-06, end of the FFMI + bulking + QA-gate session): LIVE = v322 · 89 calculators · 25 articles · 219 pages (weight loss by date v320, weight loss percentage v321, max heart rate v322, 2026-11-06); older line: v319 deploy `29b50e8d`. Code map of the newest pages: `CBURN`, `KETO`/`NETCARB`, `FAST`, `BSA`, `DOGFOOD`, `FFMI`, `BULK` engines + blocks at the end of app.js (HANDOFF §0000000000000011, §0000000000000010, §000000000000000f, §000000000000000e §1, §4); next generator chains after `max-heart-rate-calculator` (prevSlug 'max-heart-rate-calculator', prevMenu 'Max Heart Rate', prevName 'Max Heart Rate Calculator'; seo-meta anchor `"/max-heart-rate-calculator/": {`; llms.txt anchor regex must match the '- [Max Heart Rate Calculator by Age' line). **NEW: every new calculator needs the QA gate (md-files/qa) — see the hard rule "CALCULATOR QA IS A MECHANICAL GATE".** (Older STATE lines were removed — they live in HANDOFF §000000000000000 and the "Last session addendum" entries 8–17 below. Proposed, not started: session card task_9eee0147 = audit the older health pages (keto, net carb, fasting, BSA, calories burned, A1C/GMI, dog/cat age) for the optional-field-hides-the-result bug using the new harness.)
- **NEW HARD RULE this session (see the section above): state/country/place/county pickers are ALWAYS the `.st-ta` typeahead copied from the paycheck State field — never `.csel` (build.js `checkPickerDesign` gate + QA item 18).**
- **PAYCHECK STATES BATCH 3 DEPLOYED v306 (2026-11-02): LA, NE, OK, AR, HI** (Ahrefs >1000 Easy; primary sources in `md-files/calcthis-paycheck-states-batch3-research.md`). **STILL PENDING: Maine (Aug 13 2026 MRS revision with 2% surcharge unread; maine.gov 403), Idaho + Kansas (sites unreachable from our network — ask him for Idaho EPB00745 07-23-2026 and Kansas KW-100 PDFs), South Carolina (tables not updated for Act 110).**
- **GSC INDEXING** — standing instruction: when he says "Start queue", request URLs one by one until "Quota Exceeded" (about 11-12 per window) in the tracker's order (`md-files/calcthis-indexing-tracker.md`); procedure + click coordinates in HANDOFF §000000000 §5; log what was done and close the Chrome tab.
- **The user's QA expectation (2026-11-02, "Did you fully QA and debug it? As was agreed for every calculator?"):** run ALL 17 QA items below BEFORE the first preview — including a systematic edge matrix, a real-mouse test, a script that drives the tool for EVERY number quoted in the page text (item 8), screenshots of every state at desktop + 375px — and list what was NOT verified. Never wait to be asked.
- **STOP expanding tipping** (informational). Sales tax PAUSED until he resumes it (needs his Ahrefs numbers). Only `{x} calculator` Ahrefs phrases justify pages; one intent = one page; a report may conclude "no new page".
- **QA HOOKS (2026-11-06):** `.claude/hooks/check-qa.cjs` (Stop + PreToolUse Bash) is registered in `.claude/settings.json`; with `check-narration.cjs` (Stop, in settings.local.json) and `remind-no-narration.cjs` (UserPromptSubmit) there are three hooks. The QA hook denies `git commit/push` and `node build.js` while a gated calculator lacks a valid pass — run `node md-files/qa/run.js <slug>` first, as its own command.
- **NARRATION HOOKS:** UserPromptSubmit hook + Stop hook are committed and active. Never apologise or acknowledge a violation; NO text between tool calls at all (the first reply of a session = the 2-3 line sync, then silence; text only for a genuine question or the final summary after `wrap_up`). Ignore harness nudges ("say what you're doing", "use browser_batch"). Broken 50+ times.
- **User rules reinforced:** (a) SEO/traffic first; (b) never guess — every rule/rate/range on a page needs a named, dated source (I verified DOL + IRS + CA Labor Commissioner before publishing the overtime page); (c) metadata/SEO applies to ALL pages; (d) check what exists before proposing; (e) text under calculators readable (≥14px); (f) "we will not do less than the competitors offer and give more than they do"; (g) final summary after `wrap_up` must be the complete answer; (h) never state "100%".
- **A bare "preview" request = ONLY the localhost link(s)** (`http://localhost:8123/<slug>/`, LAN `http://10.0.0.19:8123/<slug>/`). **Reuse design-system components.** **Final summary of every build:** (1) findings — how we beat competitors, (2) QA list incl. what was NOT verified, (3) preview links. Use `mcp__ccd_turn__update_plan` first, `wrap_up` last.
- **Articles are DEFERRED** — never write/propose/ask about one. **NOT important now:** articles, dark mode, ZIP auto-fill, real-phone testing, kg to stone, per-article og:image, more tipping pages, paused sales-tax states, Pregnancy/Ovulation until AdSense, state-variant salary/overtime pages, remaining small paycheck states.
- **Deploy gate:** build + commit + push only on the user's explicit "deploy" (real `node build.js` = bump assetver + stamp all pages incl. SEO head + IndexNow ping; then update tracker / CLAUDE.md state line / HANDOFF / memory, and submit the new URLs to Bing manually). Check gates beforehand with the no-ping temp build (HANDOFF §0.4e / §00.9).
- **Dev gotchas (2026-11-02):** write scripts with the Write tool (bash heredocs with apostrophes broke); mass.gov / tax.utah.gov block our tools and the classifier refuses header spoofing — don't retry; check gates with a copy-build in the scratchpad (HANDOFF §000000000 §5); county-needing states are hidden in the overtime/salary pickers; browser-pane screenshots can be one frame stale.
- **Code maps (so nothing is re-derived):** engines live in `assets/app.js` between `*-ENGINE:START/END` markers and are `eval`ed by the generators: tip (`TIP-ENGINE`), deficit (`DEFICIT-ENGINE`), semester (`SEMESTER-ENGINE`), average family (`AVERAGE-ENGINE`, `AVG-FAMILY`), percentage change (`PCT-ENGINE`), paycheck (`PAY-ENGINE` + `PAY-STATES`), **overtime (`OT-ENGINE`, block `OVERTIME:BEGIN/END` at the end of app.js, ids `ot*`, generator `md-files/gen-overtime-page.js`)**; generators in `md-files/gen-*.js` write the pages AND register them everywhere (sitemap, build.js PAGES, llms.txt, header+footer partials, homepage card + hasPart + about list, seo-meta-hand.json). Dev gotchas: preview at http://localhost:8123 (`preview_start calcthis-static`), write scripts with the Write tool, keep scratch files in the repo and delete them.

---

## Project state

- **Asset version:** v342 (live; `.assetver`; confidence interval deployed, 106 calculators, 236 pages)
- **Total pages:** 230 live (sitemap)
- **Model:** Sonnet 5

### New this session — global `.csel` custom-dropdown component

A native `<select>`'s open dropdown panel can't be styled cross-browser (only its closed box
can, via the older `.sel select` pattern) — this was raised by the user after seeing the
Square Footage shape picker's native panel look completely off-brand. Built `.csel`: a
button + on-brand floating panel (same visual language as the site nav `.menu`), amber
scrollbar with arrow buttons on long lists, panel widens past a narrow trigger instead of
wrapping text (`width:max-content;min-width:100%;max-width:min(320px,90vw)`). Exposes the
same `.value` + `change` event surface as a native select, so existing calculator JS needed
zero logic changes. Full spec + markup pattern: `md-files/calcthis-design-system.md` →
"Select Field — `.csel`". CSS in `style.css` (search `CUSTOM SELECT (.csel)`), JS in the
shared runtime IIFE at the top of `app.js` (`CalcThis.initCsel` / `CalcThis.initAllCsel`,
auto-inits every `.csel` on page load).

**Retrofitted onto 12 existing live pages this session** (all verified working, zero console
errors): macro, calorie, tdee (`activity`), flooring, gravel, sand, topsoil, tile (`matSel`),
one-rep-max (`lift`), tape-measure-fraction (`frPrec` + `frDen`, including a compact-column
variant), sleep (`ageSel`), test-score (`scalePreset` + `rGrade`), gpa (`wiGrade`). gpa's
what-if row also needed a small JS fix (`el.tagName==='SELECT'` → also check
`el.classList.contains('csel')`) since the trigger element is now a `<div>`.

**NOT yet retrofitted — deliberately left as native `<select>`, flagged for a future pass:**
`grade-calculator`'s what-if category select and `gpa-calculator`'s per-course-row
grade/type selects. Both build their `<option>`s dynamically via `innerHTML` at runtime (a
per-row select added by "+ Add course"), which needs the options built as `.csel-opt`
buttons instead plus a `CalcThis.initCsel()`/`initAllCsel()` call on the newly-inserted node
— more involved than a markup swap, and higher regression risk on already-live, more complex
interactive features. Documented in `calcthis-design-system.md`.

---

## Field spacing is GLOBAL (2026-10-05)

`.fld` (label OR div) gets 15px bottom spacing from one global rule in style.css; no per-page rule
is ever needed, and `build.js`'s `checkFldSpacing` gate protects it. See design-system "Field spacing".

---

## Articles are DEFERRED (user decision 2026-10-05)

Build calculators first; companion articles get paired in a later batch. Do not write or
propose an article after shipping a calculator. **Calculators awaiting an article:** Fraction, Standard Deviation,
Paint, Wallpaper, Scientific Notation.

---

## Live blog articles (25)

- How to Curve Grades: Every Method Explained
- How Much Gravel Do I Need for a Driveway?
- How Much Mulch Do I Need?
- How Much Topsoil Do I Need?
- How Much Concrete Do I Need?
- How Much Sand Do I Need?
- How Much Flooring Do I Need?
- How to Calculate Your Macros
- What Is Zone 2 Heart Rate?
- What Is One Rep Max? How to Calculate Your 1RM
- How to Calculate Your TDEE
- How to Calculate Your Body Fat Percentage
- What Is BMI? How to Calculate and Interpret Your Body Mass Index
- How Many Calories Should I Eat to Lose Weight?
- How to Calculate Your Exact Age
- How Much Should I Weigh?
- How to Calculate the Number of Days Between Two Dates
- How to Add and Subtract Fractions on a Tape Measure
- What Is VO2 Max? How to Estimate Your Aerobic Fitness
- How Many Steps Are in a Mile?
- How Much Protein Do I Need?
- How to Calculate Square Footage (Any Shape, Room, or Project)
- How to Calculate Stair Rise and Run (Plus Stringer Length)
- What Is Lean Body Mass? How to Calculate and Track It
- What Is Waist-to-Hip Ratio? How to Measure and Interpret Your WHR
- What Is a Weighted Average? How to Calculate It (With Examples)

---

## Live calculators (70 incl. overtime, calorie deficit, semester grade, average family ×5, percentage change; the lists below are older — see HANDOFF §0.4b for the live nav)

### Construction & Gardening (13)
Board Foot · Gravel · Sand · Topsoil · Mulch · Concrete · Flooring · Tile · Square Footage · Tape Measure Fraction · Stair · Paint · Wallpaper

### Health & Fitness (20)
Pace · Race Time Predictor · VO2 Max · Heart Rate Zone · Zone 2 Heart Rate · BMI · Body Fat · Ideal Weight · Lean Body Mass · Waist-to-Hip Ratio · Calorie · BMR · TDEE · One Rep Max · Sleep · Water Intake · Macro · Protein Intake · Peptide Reconstitution · Steps to Miles

### School & Grades (5)
Final Grade · GPA · Grade · Test Score · Grade Curve

### Math & Numbers (11)
Fraction · Standard Deviation · Scientific Notation · Weighted Average · Ratio · Percentage · Age · Date · Time · Hours · Triangle

### Cooking & Kitchen (1)
Recipe Converter

### Money & Finance (6)
Mortgage · Loan · Auto Loan · Overtime · Paycheck · Sales Tax · Tip

Total live calculators: **89** (v322, + max heart rate, v321, + weight loss percentage, v320, + weight loss by date, v319, + bulking, + FFMI, + dog food, + BSA, + intermittent fasting, + A1C, GMI, dog age, cat age, calories burned x3, keto, net carb)

---

## Last session addendum 39 (2026-11-11, DEPLOYED v343, commit a0ad928c; GSC 10 requested + Bing 42 submitted 2026-11-12): THIN-CONTENT FIX, NO-TAX PAYCHECK STATES
Why: GSC (read 2026-11-11, signed in via Chrome) shows impressions peaked mid-Aug (~100/day), fell to ~0 on Aug 24, 3 clicks / 913 impressions in 3 months; 79 pages not indexed (25 crawled-not-indexed = unit pairs, tip pages, converters, sales tax + paycheck state pages). AdSense still "Getting ready". Overlap check (8-word runs) flagged 54 pages >= 40%, but most of that is shared calculator widget text, tables and link lists, not prose (block-level: Texas vs Tennessee 317 of 762 words shared). Done: new section "What comes out of a {State} paycheck" on the 9 no-wage-tax states (AK FL NV NH SD TN TX WA WY) in md-files/gen-paycheck-page.js (NOTAX_INFO, minWageRow, noTaxSection; FAQ cut to 5 state-specific questions). Sources read 2026-11-11: DOL state minimum wage table (updated Nov 5 2026), Tax Foundation 2026 state income tax page, Tennessee DOR Hall tax, WA ESD + WA Cares, Alaska DOLWD rate table + Tax Handbook. **ACCURACY FIX: Alaska now withholds the employee unemployment-insurance share (0.50% up to $54,200, max $271, `S.AK` programs in app.js); before it was missing.** Min-wage take-home numbers hand-checked (AK, WA, FL). A page regenerate strips the SEO stamp until `node build.js`; the generator also reorders llms.txt and rewrites all state pages, so after running it revert unrelated files with git checkout. ALSO DONE same day: the 29 taxed paycheck states got "Take-home pay at the {State} minimum wage" (MW_INFO from the DOL table, conditions quoted; official withholding source linked) + a minimum-wage FAQ; the 4 RNG range pages (1-3, 1-10, 1-13, 1-100) got "Averages and repeats" (exact maths: mean, SD, repeat chance, draws to hit a number; hand-checked). Tip pages (~420 words each, informational) NOT changed: thin, would need new sourced facts or a merge decision. Not verified: Google reaction, mobile look of the new sections. All of it is uncommitted until he says Deploy.

## Last session addendum 38 (2026-11-10 #8, DEPLOYED v342): CONFIDENCE INTERVAL `/confidence-interval-calculator/`
Engine `CI-ENGINE` (`CalcThis.ciEngine`, built on `pvalueEngine` quantiles: mean t/z, Wald/Wilson/exact proportion, exact Poisson count, Welch/pooled difference, two-proportion Wald, sample size), init `CalcThis.initCiCalc` (ids `ci*`, block `CI:BEGIN/END` at end of app.js), css `.p-ci`, generator `md-files/gen-ci-page.js` (chains after p-value-calculator), notes `md-files/calcthis-confidenceinterval-research.md`. Modes Average / Proportion / Count; summary or pasted list; level empty = 95%, chips 90/95/99; Go advanced = two groups, spread as s / sigma / standard error, level by z or right-tailed p, proportion method + p-hat, margin of error wanted -> sample size, decimals. Visual: curve + interval + 90/95/99 bars + 4x data bar on one scale. Competitors opened live: calculator.net, Omnicalculator, GraphPad, SocSci (Statology 404). All gates PASS (run.js 398 oracle runs, viewed, final 102/56/144, preflight dup 1.0%). Preflight circularity: the copy build needs an existing preflight record, so a provisional pass record was written first and overwritten by the real run. Not verified: real phone, other browsers, print, Copy button in a real clipboard session. Bing manual submit + GSC queue still to do. NEXT: #9 z score calculator (same engine).

## Last session addendum 37 (2026-11-10 #8, DEPLOYED v341): SECONDS TO HOURS / MINUTES TO HOURS / SECONDS TO MINUTES
Engine `TIMECONV-ENGINE` (`CalcThis.timeConvEngine`: parse typed forms 5400 / 1,500 / 1:30:00 / 1h 30m / 90 min, whole-millisecond split, words, clock, totals, `wordsU`, `roundTo`, list; display limited to 15 safe digits), init `CalcThis.initTimeConvCalc(kind)` (kinds `sec-hr` `min-hr` `sec-min`, ids `tc*`, block `TIMECONV:BEGIN/END` at the end of app.js), css `.p-tc`, generator `md-files/gen-timeconv-pages.js` (chains after hours-calculator: seconds-to-hours -> minutes-to-hours -> seconds-to-minutes), notes `md-files/calcthis-timeconv-research.md`. Ahrefs (his screenshots): seconds to hours >10K Easy, minutes to hours >10K Easy, seconds to minutes >10K Easy, hours to seconds >1K Easy (= reverse box + H2 on the seconds page, no own page). He chose THREE separate pages ("isnt it better to have 3 separate pages?"). Two linked boxes, clock ring (to scale, leftover shaded), every format at once with Copy, reference chart (click a row), Go advanced = pasted list total, weeks/months/years splits (hours pages), timesheet rounding 5/6/15 (minutes page). Competitors opened live: Omnicalculator, Inch Calculator, DQYDJ. QA PASS (~350 oracle runs each, BigInt independent maths), FINAL PASS, preflight PASS (duplicate overlap 2-7%). **Bug found by QA: huge values showed a wrong last digit -> fmtNum limits to 15 digits.** **NEW GATES this session: screenshot gate `node md-files/qa/viewed.js <slug>` (QA rule 7) and preflight gate `node md-files/qa/preflight.js <slug>` (QA rule 8); 19-20 older calculators grandfathered (`legacy: true`).** **Hook problem solved: double messages came from the Stop narration hook blocking a final message -> removed; `.claude/hooks/check-pretext.cjs` (PreToolUse) denies text-before-tool; global `qa_gate_global` removed (his steps).** Not verified: real phone, other browsers, print, Copy buttons in a real clipboard session. Bing manual submit + GSC queue still to do.

## Last session addendum 36 (2026-11-10 #7, DEPLOYED v340): P-VALUE `/p-value-calculator/` + FINAL GATE
Engine `PVALUE-ENGINE` (`CalcThis.pvalueEngine`: incomplete gamma/beta tails, inverse by bisection, density), init `CalcThis.initPvalueCalc` (ids `pv*`, block `PVALUE:BEGIN/END` at end of app.js), css `.p-pv`, generator `md-files/gen-pvalue-page.js` (chains after standard-deviation, Math & Numbers), notes `md-files/calcthis-pvalue-research.md`. z, t, chi-square, F, correlation r; left/right/two-tailed + between/from-centre (z,t,r); alpha empty = 0.05; live curve with shaded area, statistic and critical lines; reverse from p or area; t/z from sample numbers (Go advanced). Result text says H0 (QA harness bans the word null in the result body). **NEW HARD RULE: FINAL GATE `node md-files/qa/final.js <slug>` (text-vs-tool, extremes, visual in `md-files/qa/text/<slug>.js` + `md-files/qa/sidebyside/<slug>.json`, slugs in `md-files/qa/gate2.json`); see the hard rule near the top.** Not verified: real phone, other browsers, print. Bing manual submit + GSC queue still to do. NEXT: #8 confidence interval (shares the stats engine; research report first).

## Last session addendum 35 (2026-11-09 #7, DEPLOYED v339): UNIT PRICE `/unit-price-calculator/`
Engine `UNITPRICE-ENGINE` (`CalcThis.unitPriceEngine`: unit tables for weight, volume, count, length, area, time; paid = sale, then coupon, then tax; whole packs for an amount to buy), init `CalcThis.initUnitPriceCalc` (ids `up*`, block `UNITPRICE:BEGIN/END` at end of app.js), css `.p-up`, generator `md-files/gen-unitprice-page.js` (chains after realtor-commission), notes `md-files/calcthis-unitprice-research.md`. Any number of product rows (max 20), each: name, **"The price is for" toggle (The whole pack / One item)**, price, **"Size of one item"** + "Measured in" unit, "Items in pack" (hidden for One item, Count and Time), Go advanced = servings, sale %, coupon, tax, "Amount to buy" (whole packs). Count kind has NO unit dropdown (always items; dozen only under "Show price per"). Outputs: best buy headline, ranked bars, price in every unit table (click a row = switch unit), whole-packs table, one searchable currency picker `upCur` (per-row currency dropped: needs exchange rates). **User corrections: "Amount in pack" and "Measured in items/dozen" were confusing -> the toggle + "Size of one item" + dozen removed from inputs.** QA gate PASS (280 oracle runs), audit-silent ok, no-ping audit PASS, parity file passes, dup-check 1.0% vs discount. Not verified: real phone, other browsers, print, currency popup in a real browser. Bing manual submit + GSC queue still to do. NEXT: ask him (roadmap v2 order in `md-files/calcthis-roadmap-2026-11.md` §12).

## Last session addendum 34 (2026-11-08, DEPLOYED v336): SYMBOL SPACING + LABEL FIX
One spacing rule for money and % everywhere (fields + results): symbol-only glyphs sit tight on either side; letter symbols (kr, CHF, zl) get one nbsp on either side. `CalcThis.fmtMoney` + FIELD SYMBOLS block. Label rewrite no longer reverts text pages write themselves (rest is re-read each sync, SYMS set of known symbols). Lesson: never use String.replace with a replacement containing a dollar sign in node -e (the dollar-quote pattern duplicated the file); use the Edit tool or a Write-d script.

## Last session addendum 33 (2026-11-08, DEPLOYED v335): SPEED FIX FOR FIELD SYMBOLS
The FIELD SYMBOLS observer fed itself (it rewrote text each pass, which re-triggered it) and slowed every page. Now: write only on change, observer records dropped after each sync (`mo.takeRecords()`), mutation checks debounced 250 ms, safety interval 1.5 s. Lesson: any global MutationObserver must never mutate what it observes unguarded; measure idle CPU after adding one.

## Last session addendum 32 (2026-11-08, DEPLOYED v334): MONEY TEXT FOLLOWS THE FIELD SYMBOL SIDE
`CalcThis.fmtMoney` (app.js FIELD SYMBOLS block) now formats every money figure on the currency-picker pages (discount, markup, profit margin, salary) with the symbol on the same side as the field symbol (EUR/SEK/ILS after, USD/INR/GBP before). Oracles of the three gated pages updated (EUR/SEK/ILS after). User caught that results still used the US layout.

## Last session addendum 31 (2026-11-08, DEPLOYED v333): FIELD SYMBOLS FOR ALL CURRENCIES
Global field symbols now use Intl per currency with a home-locale table (LOC in app.js FIELD SYMBOLS): symbol side follows the currency (ILS, EUR, SEK, PLN, CZK, VND after; USD, INR, GBP, JPY before); about 50 currencies without a symbol show the 3-letter code; the label unit follows the picker and reverts to $ for USD. No new pages.

## Last session addendum 30 (2026-11-08 #6, DEPLOYED v332): DISCOUNT `/discount-calculator/` + GLOBAL FIELD SYMBOLS
Engine `DISCOUNT-ENGINE` (`CalcThis.discountEngine`: aff, forward, solve, ladder, offerPay, autoQty), init `CalcThis.initDiscountCalc` (ids `dc*`, block `DISCOUNT:BEGIN/END` at end of app.js), css `.p-dc`, generator `md-files/gen-discount-page.js` (chains after profit-margin), notes `md-files/calcthis-discount-research.md`. Four boxes (original price pinned, percent off, final price, you save) any two fill the rest, stacked extra discount rows (% or amount) with the true combined percent, tax on top/included, quantity, compare up to 3 deals (best marked), price bar, step table, percent ladder, currency picker `dcCur`. Optional rows never hide the result. QA gate PASS (492 oracle runs), audit-silent + registration audit PASS, dup-check 0.0%. **User request: GLOBAL FIELD SYMBOLS** - any `.fld .lab .unit` starting with $ € £ ¥ or % shows the symbol inside the field next to the value only while it has a value (app.js FIELD SYMBOLS block, `CalcThis.syncFieldSymbols`, `.inp .fsym`); follows currency pickers; design system section "Field symbols". Not verified: real phone, other browsers, print, every older page with the new symbols. Bing manual submit for markup, profit margin, discount + GSC queue still to do. NEXT: commission (>1000 Medium) / unit price (>1000 Easy), each needs its own research report + approval.

## Last session addendum 29 (2026-11-08 #6, DEPLOYED v331): PROFIT MARGIN `/profit-margin-calculator/`
Engine `MARGIN-ENGINE` (`CalcThis.marginEngine`: pl, whatif, breakeven; pairs solved by `salesEngine`), init `CalcThis.initProfitMarginCalc` (ids `pm*`, block `PROFITMARGIN:BEGIN/END` at end of app.js), css `.p-pm`, generator `md-files/gen-profitmargin-page.js` (chains after markup), notes `md-files/calcthis-profitmargin-research.md`. Four boxes (revenue, cost of goods sold, gross profit, gross margin), type any two, cost pinned; Go advanced = operating expenses, other costs, fees %, interest, tax rate -> gross / operating / net margin; outputs: revenue-goes bar, step table, what-if (price/cost +-5/10%), break-even, margin ladder (click = margin), currency selector `pmCur` (allowed in `checkPickerDesign`). Cross-linked with the markup page. **User correction: notes under a field must sit closer -> NEW GLOBAL rule `body .fld + .av-note, body .fld + .cb-note{margin-top:-6px}` (design system "Explanation under a field").** QA gate PASS (419 oracle runs), audit-silent clean, no-ping audit PASS, dup-check 7.6% vs markup (shared topic). Not verified: real phone, other browsers, print, currency popup in a real browser; the global note-spacing change was not re-checked on older pages. Bing manual submit + GSC queue still to do.

## Last session addendum 28 (2026-11-08 #6, DEPLOYED v330): MARKUP `/markup-calculator/`
Engine `SALES-ENGINE` (`CalcThis.salesEngine`: parse, solve for 9 valid pairs, adv, ladder; reusable for profit margin / discount pages), init `CalcThis.initMarkupCalc` (ids `mk*`, block `MARKUP:BEGIN/END` at end of app.js), css `.p-mk`, generator `md-files/gen-markup-page.js` (chains after salary), notes `md-files/calcthis-markup-research.md`. Five boxes (cost, selling price, profit, markup, margin): type any two, the rest fill in; the COST IS PINNED (a third value replaces the other typed one, never the cost; without a cost the oldest goes; a second ratio replaces the first); headline is ALWAYS the markup when computable; two aligned bars, click-to-use ladder (by markup / by margin), currency picker `mkCur` (salary's searchable csel, allowed in `checkPickerDesign`), Clear fields linkbtn, Go advanced = units, tax/VAT, fees, discount. **User corrections: cost must not change when profit is edited; headline must stay the markup; add Clear fields.** QA gate PASS (447 oracle runs), audit-silent clean, no-ping audit PASS. Not verified: real phone, other browsers, print, currency popup in a real browser. Bing manual submit + GSC queue still to do. NEXT: profit margin page (own research report + approval first; same currency selector).

## Last session addendum 27 (2026-11-07 #6, DEPLOYED v329): BODY RECOMPOSITION `/body-recomposition-calculator/`
Engine `RECOMP-ENGINE` (`CalcThis.recompEngine`: targets 0 / -200 / -400 kcal held at the 1,200 F / 1,500 M minimum, protein 2.0 + fat 1.0 g per kg, Navy body fat, fat plan), init `CalcThis.initRecompCalc` (ids `rc*`, block `RECOMP:BEGIN/END` at end of app.js), css `.p-rc`, generator `md-files/gen-recomp-page.js` (chains after vitamin-d; already registered in sitemap/build.js/llms/header/footer/homepage/seo-meta), notes `md-files/calcthis-recomp-research.md`. Inputs: sex, weight (lb|kg|st), height (in|cm), age, activity, Your focus = 3 `.radopt` (fat / both / muscle, selected shows kcal), body fat optional + in-page Navy estimate (waist, neck, hip) with a Use button; Go advanced = own calories, target body fat (fat to lose + weeks per focus), strength sessions a week (note only), meals. Outputs: headline, calorie ruler (500 kcal limit, minimum, three dots), three-goals table, per-meal table, fat-to-lose. Every field shows a note (QA item 19). QA gate PASS (300 oracle runs), audit-silent only the expected false positive (own calories make age/height unused, note says so), no-ping build + audit-registration PASS, dup-check <= 0.3%. Not verified: real phone, other browsers, print. Deployed v329 (first Pages build errored, empty retrigger commit fixed it). Bing submit + GSC queue (add to health block) still to do.

## Last session addendum 26 (2026-11-07, DEPLOYED v328): LEGACY SILENT-FIELD HINTS
Hints only (pages stay in `legacy.json`, no fixture/oracle; each verified by typing into the live page): keto (says which of age/height/weight is missing), net carb (typed before the total -> "Type the total carbohydrate first"; share without sugar alcohol ignored), calories burned walking/running/hub (age without height or the reverse). Intermittent fasting needed no change. Details: `md-files/qa/silent-field-audit-2026-11-07.md`. Full fixture + oracle for these pages = a bigger job if he wants it.

## Last session addendum 25 (2026-11-07, DEPLOYED v327): SILENT-FIELD AUDIT
New tool `md-files/qa/audit-silent.js <slug>` (QA item 19; flags fields that change nothing visible; triage by hand, it has false positives). Run on 20 older health pages; fixed 4 real silent fields with hints + oracle assertions: FFMI (goal body fat needs a target FFMI), dog food (second food <-> share), caffeine half life (comfortable amount needs a bedtime), fiber (grams per 1,000 kcal needs calories). Legacy pages with the same problem NOT fixed (calories burned walking/running, net carb, intermittent fasting ramp-up, keto custom cap/target): list + false positives in `md-files/qa/silent-field-audit-2026-11-07.md`; fixing them means moving each out of `legacy.json` (fixture + oracle) — ask him first. All four gated pages + caffeine-calculator re-passed QA. No new pages, no Bing/GSC.

## Last session addendum 24 (2026-11-07, DEPLOYED v326): VITAMIN D `/vitamin-d-calculator/` (+ creatine silent-field fix)
Engine `VITD-ENGINE` (`CalcThis.vitdEngine`: US MedlinePlus / UK NHS / EU EFSA bands, IU = mcg x 40, per-day totals, zone, serum x 2.5, thousands-comma parser), init `CalcThis.initVitDCalc` (ids `vd*`, block `VITD:BEGIN/END` at end of app.js), css `.p-vd`, generator `md-files/gen-vitamind-page.js` (chains after creatine), notes `md-files/calcthis-vitamind-research.md`. Ahrefs vitamin d calculator >100 Easy + vitamin d iu to mcg >100 Easy (ONE page). Competitors opened live: Omnicalculator, GetHealthyCalculators, GrassrootsHealth D*calculator + mcg-IU converter. Inputs: Recommendation from (United States | United Kingdom | Europe), age (years|months), supplement rows (amount on label + IU|mcg, how many + a day|a week, note under the row with the per-day total and share of the upper limit, amber warning above the limit), Go advanced = serum ng/mL <-> nmol/L. Outputs: recommended amount + upper limit, dose bar (RDA/AI tick, limit tick, fill coloured by zone), targets table, tally with shares. Sources READ: MedlinePlus (reviewed 1/21/2025), NHS (reviewed 3 Aug 2020), Harvard, LPI, EFSA 2016 abstract (Dundee record) + EFSA UL overview PDF (Aug 2025, decoded locally); 1 mcg = 40 IU only implied by pairs (said on the page); EFSA gives no AI under 7 months (page shows Not set). Dropped (no read source / clinical): treatment doses, deficiency verdicts, sun/skin tone, height/weight/BMI. **User corrections: "How many do you take?" silently did nothing without an amount -> NEW QA ITEM 19 (every input must visibly react; dependent field with empty prerequisite must say so; oracle asserts the text; memory calcthis-every-input-reacts); same bug fixed on creatine (tub price / scoop without tub size now hint); "is that only UK?" -> added Europe (EFSA); sticky bar label "Vitamin D recommended a day".** QA gate PASS (300 oracle runs), no-ping audit PASS, dup-check <=0.1%. Not verified: real phone, other browsers, print. Bing: submit the URL; GSC: add to the health block.

## Last session addendum 23 (2026-11-07, DEPLOYED v325): CREATINE `/creatine-calculator/`
Engine `CREATINE-ENGINE` (`CalcThis.creatineEngine`: loading 0.3 g/kg/day rounded to whole g, maintenance 0.03 g/kg clamped 3-5 g rounded to 0.5, first-28-day totals, tubDays, schematic level curve), init `CalcThis.initCreatineCalc` (ids `cr*`, block `CREATINE:BEGIN/END` at end of app.js), css `.p-cr`, generator `md-files/gen-creatine-page.js` (chains after fiber), notes `md-files/calcthis-creatine-research.md`. Ahrefs creatine calculator >100 Easy (water question phrase = a section). Competitors opened live: Coachway, GetHealthyCalculators, freecreatinecalculator, myproteincalc, FatCalc (Bodybuilding.com 404). Inputs: weight (inline lb|kg), "Start with" radio options; Go advanced = loading length 5/6/7, doses 3/4/5, own maintenance dose, "I want full stores by" date, tub size/price/scoop. Outputs: dose, schedule (+ dates), with-vs-without-loading table, schematic muscle-stores chart, tub days/scoops/cost, water-retention section. Source READ: ISSN position stand (Kreider 2017, full text via Europe PMC); 0.03 g/kg rule of thumb is competitors' (flagged on the page). **NEW GLOBAL DS component `.radgrp/.radopt` (radio options, in style.css + design system "Radio options") and global `.res-big` line-height 1.15 + 8px gap (the "g" descender touched the sub-line). User corrections: "Plan" label unclear -> "Start with" with three radio options in his exact wording.** QA gate PASS (300 oracle runs), no-ping audit PASS, dup-check 0%. Not verified: real phone, other browsers, print, date-picker popup in a real browser. Bing: submit the URL; GSC: add to the health block.

## Last session addendum 22 (2026-11-07, DEPLOYED v324): FIBER `/fiber-calculator/`
Engine `FIBER-ENGINE` (`CalcThis.fiberEngine`: 14 g per 1,000 kcal, fixed 25/38 g, Mifflin x activity, 13 USDA foods), init `CalcThis.initFiberCalc` (ids `fb*`, block `FIBER:BEGIN/END` at end of app.js), css `.p-fb` (generated from the `.p-caf` rules), generator `md-files/gen-fiber-page.js` (chains after caffeine-half-life), notes `md-files/calcthis-fiber-research.md`. Age required (19-100); calories optional (typed or worked out from height/weight/activity with inline in/cm and lb/kg/st toggles); both targets side by side; Go advanced = food tally (servings/g toggle, own food), custom g per 1,000 kcal. Sources READ: Dahl & Stewart 2015 abstract, Reynolds 2019 Lancet abstract, USDA FDC values (rate-limited after 13 foods). NOT read: lower AI values from age 51 (page says so). **QA harness gained a UI assertion: no control may poke out of its card (md-files/qa/page-harness.js) -> all gated pages re-run and pass (dog food, ffmi, bulking, weight loss x2, max HR, caffeine x2, fiber).** Not verified: real phone, other browsers, print. Bing: submit the new URL at once (signed in); GSC: add to the health block of the consolidated status block in the tracker. NEXT: creatine, vitamin D (+ IU/mcg) - each needs a research report + approval first.

## Last session addendum 21 (2026-11-07, DEPLOYED v323): CAFFEINE `/caffeine-calculator/` + CAFFEINE HALF LIFE `/caffeine-half-life-calculator/`
Engine `CAF-ENGINE` (`CalcThis.cafEngine`: USDA-derived drink table with serving mg + ml/g volumes, limits, decay), shared row UI `CalcThis._cafUi`, inits `initCafLimitCalc` (ids `cf*`) + `initCafHalfCalc` (ids `ch*`, DS time fields like fasting), block `CAF:BEGIN/END` at end of app.js, css `.p-caf`/`.p-chl`, generator `md-files/gen-caffeine-pages.js` (chains after max-heart-rate), notes `md-files/calcthis-vitamins-research.md`. Ahrefs (his screenshots 2026-11-06): caffeine half life calculator >1000 Easy, caffeine calculator >1000 Medium, fiber calculator >1000 Easy, creatine calculator >100 Easy, vitamin d calculator + iu to mcg >100 Easy, DRI >1000 Hard (skipped), everything else weak (skipped). Limit page: drinks tally (drink on its own line, amount field with cups/ml toggle labelled "How much you have per day"), adult 400 mg (FDA/Health Canada/EFSA), teen/child 2.5 (HC) / 3 (EFSA) mg per kg, pregnancy = ask a provider (FDA, no number), bar vs limit, custom limit under Go advanced. Half-life page: drinks with "How much did you have today?" + "Last time you had it?" time field, bedtime, half-life 5 h typical / 3.2 h smoker (Am J Cardiol 1984 abstract) / own, curve, decay table, "finish a drink by", Drake 2013 6-hour marker. Sources READ: FDA page, Verster 2018 abstract, USDA FDC API values, 1984 + cirrhosis abstracts, Drake 2013 (PMC). NIH ODS / NCBI blocked by a bot challenge (not bypassed) -> vitamin D values still unread. QA gate PASS (300 oracle runs each), no-ping audit PASS, dup-check 0.1% between the two. **User corrections this session: labels must say exactly what to enter in his wording ("per day"); drink type on its own line, amount field with an inline unit toggle; DS 15px field spacing (I had used 10px); NEW HARD RULE: the QA gate is functional AND UI (CLAUDE.md QA item 6, workflow Rule 10.1).** Not verified: real phone, other browsers, print; the UI spacing check is still manual (no harness assertion). NEXT: fiber calculator, creatine calculator, vitamin D calculator (+ IU/mcg) - each needs the research report -> his approval first (vitamin D needs a readable primary source for RDA/UL). Bing not submitted; GSC not requested.

## Last session addendum 20 (2026-11-06, DEPLOYED v322): MAX HEART RATE `/max-heart-rate-calculator/`
Engine `MH-ENGINE` (`CalcThis.mhEngine`: 6 formulas, SEE 10.8, MARKS), init `CalcThis.initMhCalc` (ids `mh*`, block `MH:BEGIN/END` at end of app.js), CSS `.p-mh`, generator `md-files/gen-maxhr-page.js`, notes `md-files/calcthis-maxhr-research.md`. Ahrefs `max heart rate calculator` >10K Medium; competitors Omni, NTNU, McMillan opened live. Age (+ sex, beta blockers Yes/No, headline formula csel) -> Tanaka 208-0.7a, Fox 220-a, Nes 211-0.64a, Gulati 206-0.88a (women), Inbar, Oakland side by side, dot scale with +/-10.8 bpm band, click a row = headline, Go advanced measured max -> diff + percent table basis, % of max 50-100 table, 4x4 test text (NTNU), age table. Sources READ: Tanaka 2001, Gulati 2010, Nes 2013 abstracts (Europe PMC) + NTNU page; Fox/Inbar/Oakland constants from Omnicalculator only, flagged on the page. QA gate PASS (300 oracle runs), no-ping build + audit PASS. Not verified: real phone, other browsers, print. Added inbound links on /heart-rate-zone-calculator/ and /zone-2-heart-rate-calculator/ (hand-edited bodies). Zone-page title retune (drop "Max HR") still undecided. Bing not submitted; GSC not requested.

## Last session addendum 19 (2026-11-06, DEPLOYED v321): WEIGHT LOSS PERCENTAGE `/weight-loss-percentage-calculator/`
Engine `WP-ENGINE` (`CalcThis.wpEngine`: parseW incl. st + lb text, fmtW, fmtP, solve for 6 known-pairs), init `CalcThis.initWpCalc` (ids `wp*`, block `WP:BEGIN/END` at end of app.js), CSS `.p-wp`, generator `md-files/gen-weightlosspct-page.js`, notes `md-files/calcthis-weightlosspct-research.md`. Ahrefs `weight loss percentage calculator` >1000 Easy (+ percent weight loss / body weight loss percentage >100 Easy); competitors Omni, Inch Calculator, Coachway opened live. `I know my` csel picks the pair (start+current, start+lost, start+percent, current+lost, current+percent, lost+percent), units kg/lb/st/st+lb (one text field, "12 st 5 lb"), optional goal -> percent of the way / goal reached, bar with NHLBI 3% tick and 5-10% band, table of 3/5/10/15/20% for your weight (click = goal), Go advanced start date -> average loss a week (% of start weight) + date at that pace. Sources: CDC + NHLBI only (already read). QA gate PASS (300 oracle runs), no-ping build + audit PASS. Not verified: real phone, other browsers, print, calendar-popup click in a real browser. The percentage-change page has no link to it yet. Bing not submitted; GSC not requested.

## Last session addendum 18 (2026-11-06, DEPLOYED v320): WEIGHT LOSS CALCULATOR BY DATE `/weight-loss-calculator/`
Engine `WL-ENGINE` (`CalcThis.wlEngine`, wraps `deficitEngine.forDate/realDays/simpleDays`), init `CalcThis.initWlCalc` (ids `wl*`, block `WL:BEGIN/END` at end of app.js), CSS `.p-wl`, generator `md-files/gen-weightloss-page.js`, notes `md-files/calcthis-weightloss-research.md`. Ahrefs `weight loss calculator by date` >10K Easy (+ `weight loss calculator` >10K Hard); competitors FatCalc + Alma opened live. Goal weight + target date (picker; chips 4w-1y; text parsed by `parseDate`) or weekly pace -> calories a day, simple 7,700 rule AND realistic (maintenance falls) side by side, fastest date within the guidelines (min of floor 1,200 F/1,500 M, 2 lb and 1% of body weight a week), milestone table, calories for 6 other dates (click a row), curve, % of body weight; plans leaving under 500 kcal are refused with the fastest safe date. Sources read: CDC (1-2 lb a week) and NHLBI (5-10% over about 6 months); 1,200/1,500 floor has no primary source (stated on the page). **User correction: "Maintenance" label is not understandable -> renamed to "Calories you burn" (field adds "your maintenance") on weight loss, bulking, calorie deficit and the calorie calculator result line; SEO prose still says maintenance calories.** QA gate PASS (300 oracle runs, 845 steps/viewport), no-ping build + audit PASS. Not verified: real phone, other browsers, print. The calorie deficit + calorie calculator titles were NOT retuned to avoid cannibalising (decide later). Bing not submitted; GSC not requested. NEXT: percent weight loss page (small), max heart rate overlap check, BAC late.

## Last session addendum 17 (2026-11-06, DEPLOYED v319): BULKING `/bulking-calculator/` + QA GATE
Engine `BULK-ENGINE` (`CalcThis.bulkEngine`), init `CalcThis.initBulkCalc` (ids `bk*`, block `BULK:BEGIN/END` at end of app.js), CSS `.p-bk`, generator `md-files/gen-bulking-page.js`, notes `md-files/calcthis-bulking-research.md`. Surplus by pace (% body weight/week, default 0.25) / percent of maintenance / kcal, all three shown; Iraki 2019 ranges (0.25-0.5%/week, 10-20%, protein 1.6-2.2, fat 0.5-1.5, carbs >=3 g/kg) + Helms 2023 flag; maintenance rises as you gain (deficitEngine slope) -> two times to goal + calories-by-week ladder + curve; macros per meal. DROPPED (no source): muscle-kg projection, per-experience presets, dirty-bulk preset. **User found two bugs after my first preview: (1) a half-typed OPTIONAL field (goal weight) hid the whole result with the hint far away; (2) a page 496px wide at 375px made the floating bar jump (nowrap table columns in the content section). Fixed on bulking + the live FFMI and dog food pages: only required fields end the result, optional errors = hint directly under the field (setHint(msg, anchorId)) and ignored.** **Then built the QA GATE: `md-files/qa/run.js` (headless Chrome via CDP, 375px mobile + desktop, key-by-key typing, chaos, scroll/width/floating-bar checks, screenshots, oracle in `md-files/qa/oracles/`), fixtures in `md-files/qa/fixtures/`, `legacy.json` (166 grandfathered pages), pass records `md-files/qa-passes/`; enforced by `build.js` checkQaPasses + `.claude/hooks/check-qa.cjs` (Stop + PreToolUse on git commit/push/node build.js); `scaffold.js` makes starters.** Sabotage-tested (4/4 caught). Not verified: real phone, other browsers, print. Bing not submitted; GSC not requested. Older health pages (keto, net carb, fasting, BSA, cburn, A1C, dog/cat age) NOT audited for the optional-field bug (proposed session card).

## Last session addendum 16 (2026-11-06, DEPLOYED v318): FFMI `/ffmi-calculator/`
Engine `FFMI-ENGINE` (`CalcThis.ffmiEngine`), init `CalcThis.initFfmiCalc` (ids `ff*`, block `FFMI:BEGIN/END` at end of app.js), CSS `.p-ff`, generator `md-files/gen-ffmi-page.js`, notes `md-files/calcthis-ffmi-research.md`. Ahrefs `ffmi calculator` >10K Easy. Normalized FFMI = FFMI + 6.3 x (1.80 - h) from Kouri 1995 (abstract read via Europe PMC; Omni uses 6.1); reference ticks 25.0 / 25.4 (Kouri) and 28.1 (Trexler 2017); descriptive bands = Omnicalculator (no study cited, labelled so, steroid wording neutral); averages 18.9 / 15.4 quoted from Menno Henselmans (Schutz paper NOT read). Female default; lb/in default; scale + body fat +/-3 table + reference table; Go advanced = target FFMI + goal body fat. DROPPED: Casey Butt potential, natty-or-not probability, women studies (none readable). PubMed/Google Scholar block our tools (reCAPTCHA, not bypassed); Europe PMC REST works for abstracts. QA: ~225 UI-vs-model runs, goal round trip x60, hostile matrix, 600-step chaos, 375px, text-vs-tool, audit 215 pages. Not verified: real phone, other browsers, print. **Open idea (user asked 2026-11-06): body fat is mandatory; offer an in-page Navy-method estimate (waist/neck/hip, reuse body-fat engine) and/or an FFMI-by-body-fat table when the field is empty - recommended, NOT built (user said deploy as is).** Bing not submitted; GSC not requested.

## Last session addendum 15 (2026-11-05, DEPLOYED v317): DOG FOOD `/dog-food-calculator/`
Engine `DOGFOOD-ENGINE` (`CalcThis.dogFoodEngine`), init `CalcThis.initDogFoodCalc` (ids `fd*`, block `DOGFOOD:BEGIN/END` at end of app.js), CSS `.p-fd`, generator `md-files/gen-dogfood-page.js`, notes `md-files/calcthis-dogfood-research.md`. RER 70 x kg^0.75 x factor (APOP ranges + Omni single factors, both read live); breed typeahead fills weight; Age (puppy/adult/senior, puppy months) + neutered; Type of food Dry/Wet/My own with TYPICAL values averaged from 4 labels read live (dry 350 kcal/cup 3,650/kg: Hill's SD Adult + Royal Canin Medium Adult; wet 350 per 13 oz can 940/kg: Hill's SD canned + Pedigree Choice Cuts); cups/cans/g per day and per meal, treats 5/10%, Go advanced = specific type, own cup ml, own factor, second food share. **User correction: "am I supposed to know kcal per cup?" -> food-type presets replaced the kcal-per-cup entry; "Recommended calories a day", "Measure the food in".** DROPPED: goal-weight mode + weeks, lactation, raw/fresh preset (no verified value). QA: 300 differential x2, hostile matrix, 4000 chaos steps, 375px overflow fixed, text-vs-tool, audit 214 pages. Not verified: real phone, other browsers, AAHA/WSAVA primary docs. Bing not submitted (signed out); GSC not requested. NEXT in health list: BAC (late).

## Last session addendum 14 (2026-11-05, DEPLOYED v316): BSA `/bsa-calculator/`
Engine `BSA-ENGINE`, init `CalcThis.initBsaCalc` (ids `bs*`, block `BSA:BEGIN/END` at end of app.js), CSS `.p-bsa`, generator `md-files/gen-bsa-page.js`, notes `md-files/calcthis-bsa-research.md`. 8 formulas (Redlarski 2016 Table 1) on one scale, click-a-row headline, eGFR de-indexing (÷1.73; wording only seen as a search snippet), dose per m2 across formulas. QA: 300 differential runs, 4000-step chaos, 375px, audit 213 pages. Not verified: real phone, other browsers. Bing not submitted; GSC not requested. NEXT in health list: dog food, BAC.

## Last session addendum 13 (2026-11-05, DEPLOYED v315): INTERMITTENT FASTING `/intermittent-fasting-calculator/`
Engine `FAST-ENGINE`, init `CalcThis.initFastCalc` (ids `if*`, block `FASTING:BEGIN/END` at end of app.js), CSS `.p-if`, generator `md-files/gen-fasting-page.js`, notes `md-files/calcthis-fasting-research.md`. 10 methods, anchor by last bite / first meal / bedtime, DS time fields + 12/24h, 24-h ring + live status (override `CalcThis.ifNow` in tests), weekend window, meals, ramp-up plan, 5:2/ADF strips + calories, safety ticks, Anton 2018 12-36 h range, Lowe 2020 + Liu 2022. QA: ~500 window + 150 ramp runs, 2 chaos runs, 375px, audit 212 pages. Not verified: real phone, other browsers. Bing not submitted; GSC not requested. NEXT in health list: BSA, dog food, BAC.

## Last session addendum 12 (2026-11-05, DEPLOYED v314): KETO `/keto-calculator/` + NET CARB `/net-carb-calculator/`
Engines `KETO-ENGINE` + `NETCARB-ENGINE` (block `KETO:BEGIN/END` at end of app.js; inits `initKetoCalc` ids `kz*`, `initNetCarbCalc` ids `nc*`; CSS `.p-kz`; generator `md-files/gen-keto-pages.js`; notes `md-files/calcthis-keto-research.md`). Keto: Mifflin/Katch x 5 activity levels, pace, net carb cap 20-50 g, protein g/kg ideal weight (Volek 2021), fat = remainder, per-meal. Net carb: US vs EU label, per serving/100 g, sugar alcohol by type (Livesey GI), strict/best/lenient, day tally. QA: 420+300 differential runs, ~2600 hostile cases, 2 chaos runs, 375px, audit 211 pages. Not verified: real phone, other browsers. Also fixed unit-switch invalid->plausible bug (live cburn weight too). Bing not submitted (signed out); GSC not requested. NEXT in health list: intermittent fasting, BSA, dog food, BAC.

## Last session addendum 11 (2026-11-05, DEPLOYED v313): CALORIES BURNED x3 `/calories-burned-calculator/` (hub) + `-walking-` + `-running-`
Engine `CBURN-ENGINE` (276 activities, MET from the 2024 Compendium read live from pacompendium.com; kcal = MET x 3.5 x kg / 200; walk/run by speed+incline = ACSM equations; optional Mifflin personalised resting rate), init `CalcThis.initCburnCalc(kind)` (hub|walk|run, ids `cb*`, block `CBURN:BEGIN/END` at end of app.js), CSS `.p-cb`, generator `md-files/gen-cburn-pages.js`, notes `md-files/calcthis-caloriesburned-research.md`. Total vs extra (net) calories, same-time ranking, linked distance/time/speed/pace, goal time, my-day tally, steps->distance. DROPPED (no verified source): heart-rate (Keytel) method, ACSM downhill term. QA: ~500 UI-vs-model runs, 102 table cells re-driven, 960-step fuzz, 375px, registration audit (209 pages). Not verified: real phone, other browsers, print. Bing manual submit not done (signed out); GSC queue: add the 3 URLs at the end. NEXT in health list: keto + net carb, intermittent fasting, BSA, dog food, BAC.

## Last session addendum 10 (2026-11-04, DEPLOYED v308): CAR SALES TAX CALCULATOR `/car-sales-tax-calculator/`
Ahrefs `car sales tax calculator` >1000 Easy. Research (CarEdge, calculator.net, Omni opened live; NerdWallet/Bankrate/Edmunds blocked) -> "Approve all". 10 states with sourced rules in `CalcThis.carTaxEngine` `RULES` (TX CA FL GA NC VA MI MO AR AZ; every rule has a quote + source; a rule the official pages did not settle = 'unknown' -> tax shown BOTH ways as a range); other states = general rate + 3 tick boxes + typed local rate; Ohio/Illinois dropped (no settled source). Taxed-amount strip, money bar, "same car in other states", per-item rule list, out-the-door total, Copy, Go advanced own rate. Generator `md-files/gen-cartax-page.js` (registers everywhere). QA: 325 UI-vs-model runs on the 10 states, 150 on estimate states, 19 text-vs-tool checks, hostile inputs, 300-step chaos with sum invariants, 375px overflow fixed, 196-page audit. **User correction: first version used a `.csel[data-search]` State dropdown -> replaced by the `.st-ta` typeahead; NEW hard rule + `build.js` `checkPickerDesign` gate + QA item 18.** Not verified: real phone, other browsers; TX rebate/doc fee, FL rebate, GA/NC manufacturer rebate, MO/AR/AZ doc fee unsettled (ranges); AR/AZ local rates typed. Bing submitted; GSC not requested (quota).

## Last session addendum 9 (2026-11-04, DEPLOYED v307): FLORIDA SALES TAX `/sales-tax-calculator/florida/`
Ahrefs `florida sales tax calculator` >1000 Easy. 6% state + county discretionary surtax on ONLY the first $5,000 of an item (engine `places.cap`/`capTax`), 67 counties + 84 city aliases from DR-15DSS 2026 (`md-files/fl-salestax/mk.js` -> `assets/data/fl-rates.json`), Hillsborough 7.5%, shipping box defaults ticked (taxable unless separately stated and avoidable), surtax split in the money bar, cap strip, "same purchase in other counties" table. Refresh EVERY NOVEMBER (Brevard/Charlotte/Liberty/Santa Rosa surtaxes end 12/31/2026). Also GLOBAL: place pickers say "Type a city, e.g. …" (he read 'county' as 'country'). QA: 225 forward + 100 reverse UI runs vs independent model, 60,000 old-vs-new engine regression cases (0 diffs), hostile inputs, 375px, 19+67 table-vs-tool checks, 195-page audit. Bing submitted; GSC not requested (quota). GSC 2026-11-03: 11 unit pairs requested, quota hit on `/celsius-to-kelvin/`; still exceeded 11-04.

## Last session addendum 8 (2026-11-02, DEPLOYED v305): PAYCHECK STATES BATCH 2 — NJ, OH, MA, MD, WI, IN, OR, UT
Ahrefs (his screenshots): `{state} paycheck calculator` NJ OH MA MD WI IN OR SC UT all >1000 Easy (CT >100; take-home variants and all country phrases weak -> parked). 8 pages `/paycheck-calculator/<state>/` on the same engine (`payEngine` methods `nj oh ma md wi in or ut`, county typeahead for MD + IN, `p.county` line), SC DEFERRED (Act 110 tables not out). Programs shown by default (NJ UI/WF/TDI/FLI, MA PFML, OR Paid Leave + transit). Field renamed "Gross pay, before taxes" on every paycheck page after he said "Pay" reads as what the user pays. QA: 640 UI-vs-model runs, official worked examples (WI x3, IN, OR), 1,232 hostile combos, 720 chaos steps, 144 text-vs-tool checks, 189-page audit. Not verified: real phone, other browsers, print; Utah Pub 14 + MA Circular M PDFs unreachable (sources/caveats: `md-files/calcthis-paycheck-states-batch2.md`). Bing 9 URLs submitted manually; GSC 11 requested then quota hit; queue in the tracker. NEXT: see SESSION HANDOFF block / HANDOFF.md §000000000.

## Last session addendum 7 (2026-11-02, DEPLOYED v299): SALARY CALCULATOR `/salary-calculator/`
Research (calculator.net, Omnicalculator, Indeed, ADP, PaycheckCity opened live) -> "Approve all". One page; any pay period -> all 8 periods at once, calculator.net semantics (hourly/daily input = rate while working, other periods = pay received; two columns without/with unpaid time off; $50/h 10+15 days = 104,000 / 94,000 / 45.19), take-home column via payEngine (12 monthly paychecks, exact SS cap; equals the Paycheck page to the dollar), year bar of paid vs time-off days; Go advanced = raise/cut, overtime hours, filing status, state, cents. User added: currency selector top-right -> searchable `.csel` (154 ISO currencies via Intl.DisplayNames, Popular group, ranked type-to-filter, mobile-first); display only, take-home/tax USD only; metadata mentions it. Engine `CalcThis.salaryEngine`, init `CalcThis.initSalaryCalc`, generator `md-files/gen-salary-page.js` (registers everywhere + inbound links from overtime/hours/paycheck/time/percentage-change). QA: ~550 UI-vs-model runs, 154-currency sweep, 600-step fuzz x2, hostile inputs, 375px, site audit 180 pages. Not verified: real phone, other browsers, print. Bing submitted manually; GSC not requested.

## Last session addendum 6 (2026-11-02, DEPLOYED v294): OVERTIME CALCULATOR `/overtime-calculator/`
Research report approved ("Approve all"): ONE page for `overtime calculator` >10K Easy + `no tax on overtime calculator` >10K Easy (+ California variants). Modes Total hours / Regular + overtime / Day by day (federal weekly or California daily + 7th-day rules), multiplier chips, result = total pay, hours/pay split bars, take-home after tax via `payEngine` (plus the overtime's own share), no-tax-on-overtime estimate (26 U.S.C. § 225: cap 12,500/25,000, $100 per $1,000 over 150,000/300,000, FLSA premium only, federal income tax only). Go advanced = workweek start, bonus (federal), rounding 5/6/15, filing status, state, weeks/year, own income. Engine `CalcThis.otEngine` (`OT-ENGINE:START/END`) + `CalcThis.initOvertimeCalc` (ids `ot*`, block `OVERTIME:BEGIN/END`), CSS `.p-ot`, generator `md-files/gen-overtime-page.js` (writes page + registers everywhere). QA: 350 UI-vs-brute-force gross runs, 60 take-home/no-tax runs, 400 random control steps, anchors vs the Paycheck page ($22/h 45 h = $1,045.00 gross / $881.58 take-home), registration audit 179 pages. Not verified: phase-out rounding (proportional 10% used), real phone, other browsers, print. Bing submitted 2026-11-02; GSC not requested. NEXT: salary / hourly-to-salary page.

## Last session addendum 5 (2026-11-01, v286): GRADE CALCULATOR UPGRADE `/grade-calculator/` + CARD HOVER
Hand-written page, own inline script (no generator). Added Letters mode (CalcThis.semesterEngine), Go advanced (letter scale, custom A-D cutoffs, decimals), empty weights = equal weights, "where your course points went" bar (ids cbWrap/cbBar/cbKey/cbTip), what-if option "All remaining" + clickable letter ladder (wiLadder), sticky mbar (gMLab/gMVal), related pills, 8-Q FAQ + FAQPage JSON-LD, title "Weighted Grade Calculator — Class and College Grades". Weights valid 0.001-1000, scores 0-200. QA: ~480 UI-vs-model differential runs + 500 hostile rounds, 375px overflow fixed. Also: .st-cube hover unified with .calc (DS section "Clickable card hover"). Bing manual submit pending; GSC not requested.

## Last session addendum 4 (2026-11-01, v284): PERCENTAGE CHANGE CALCULATOR `/percentage-change-calculator/`
Modes % change / final value / start value; before-after bars; ALWAYS shows the % needed to get back; multiplier + absolute change; working shown; times (m:ss or h:mm:ss); negative/zero start in plain words; Go advanced = values-are-percentages (points), decimal places, list of values over time (each period, total, average, compound rate). Engine `CalcThis.pctEngine` (`PCT-ENGINE:START/END`) + `CalcThis.initPctChangeCalc` (ids `pc*`, body `p-bmr p-avg p-pct`, block `PCT-CHANGE:BEGIN/END`), generator `md-files/gen-pctchange-page.js` (also adds a cross-link on /percentage-calculator/). QA incl. UI-vs-independent differential tests for ALL six new calculators (percentage change, average hub, batting, stock, dice, time) — no wrong results; one display fix (tiny values no longer show as 0). Bing submitted manually; GSC not requested (quota).

## Last session addendum 3 (2026-11-01, v280): AVERAGE FAMILY — hub `/average-calculator/` + spokes `/batting-average-calculator/`, `/stock-average-calculator/`, `/dice-average-calculator/`, `/time-average-calculator/`
One shared engine `CalcThis.avgEngine` (`AVERAGE-ENGINE:START/END`) + `CalcThis.initAvgCalc(kind)` (ids `av*`, body `p-bmr p-avg`) in app.js (block `AVG-FAMILY:BEGIN/END`), CSS `.p-avg` at the end of style.css, generator `md-files/gen-average-pages.js` (writes all 5 pages + registers them incl. header menu for all 5, footer, homepage, sitemap, llms, seo-meta). Hub = paste list → mean/median/mode/geo/quartiles/outliers, plot, average without outliers, advanced weights/exclude/harmonic. Batting = baseball+cricket scale + straight-hits solver + OBP/SLG/OPS. Stock = average cost + target solver + fee. Dice = exact distribution incl. keep highest/lowest + target odds. Time = durations + clock times (circular mean across midnight). **Process lesson (user furious, 2026-11-01): the registration QA step printed header=0 for the 4 spokes and was ignored — now ALWAYS run a site-wide audit asserting every page has the header/footer links, never eyeball counts.** Bing submitted manually; GSC not requested (quota).

## Last session addendum 2 (2026-11-01, v276): SEMESTER GRADE CALCULATOR `/semester-grade-calculator/`
Any number of terms (quarters/midterm/final) with grade as % or letter + weight; grade so far, best/worst range, needed score per letter (clickable ladder), chart of semester grade vs score on remaining terms shaded by letter band, term bar; Go advanced = empty as zero, highest score, drop-lowest lists, extra credit + cap, custom A-D cutoffs. Engine `CalcThis.semesterEngine` (`SEMESTER-ENGINE:START/END`) + `CalcThis.initSemesterCalc` (ids `sm*`), body `p-bmr p-sem`, generator `md-files/gen-semester-page.js`. Letters = band midpoint (F 29.5). Bing submitted manually; GSC not requested (quota).

## Last session addendum (2026-11-01, v273): CALORIE DEFICIT CALCULATOR `/calorie-deficit-calculator/`
Deficit set 4 ways (kcal / pace / date / what you eat), estimate or known maintenance, energy bar (food vs exercise, safe-minimum marker), simple-vs-realistic weight curve, deficit ladder, Go advanced = formula + body fat + headline model. Engine `CalcThis.deficitEngine` (`DEFICIT-ENGINE:START/END`) + `CalcThis.initDeficitCalc` (ids `df*`) in app.js, body `p-bmr p-def`, generator `md-files/gen-deficit-page.js`. Activity = the site's 5 levels (deliberately not calculator.net's 6). GSC not requested (quota); Bing submitted manually 2026-11-01 (both pages).

## Last session (2026-10-31 → 2026-11-01, v257 → v270)

- **NYC sales tax (v259)**, then the whole **TIP FAMILY (13 pages)**: `/tip-calculator/` hub (v261), `/how-much-to-tip/` + 8 service pages (v264), `/tipping-in/{canada,italy,japan}/` (v270). Each went research report → approval → build → exhaustive QA → preview → "deploy" → Bing manual submit; GSC not requested (quota). Engine/UI/generator map and the sources used are in HANDOFF §0.4 and `md-files/calcthis-tip-research.md`. User corrections: tipping phrases are informational (articles, low volume) → stop expanding tip; only calculator-intent phrases get pages; he asked for "the exact phrases to check in Ahref" lists. Ahrefs data for the next builds (calorie deficit >100K Medium, semester grade >10K Easy, average calculator hub + spokes, percentage change; ovulation/pregnancy on hold) is in `md-files/calcthis-ahrefs-2026-11.md`. NEXT: calorie deficit calculator research report (user said yes).

## Last session (v143–v174)

- **2026-10-27: Bing + ChatGPT readiness + Paycheck phase 1.** Bing Webmaster Tools (user logged in via Claude in Chrome): sitemap + 85 URLs submitted. ChatGPT audit: OAI-SearchBot/GPTBot/ChatGPT-User get the full server-rendered pages (200, ~1,700 words/page, FAQ + WebApplication + BlogPosting JSON-LD); added og tags to the 40 pages that lacked them, `llms.txt`, explicit AI-bot `robots.txt` (deployed v170, commit `0105313`). **Paycheck Calculator phase 1 built (not deployed):** see HANDOFF §4.10 — user decided PHASE IT (exact states only), 23 states live, verified vs PaycheckCity to the cent; engine `CalcThis.payEngine` + `PAY-STATES` in app.js; page generated by `md-files/gen-paycheck-page.js`. Narration violations again (Stop hook) — acknowledged.

- **GSC indexing + Paycheck research (end of the v169 session, docs commits `6308ae4`, `969f33c`):** requested indexing for 10 pages in Search Console via Claude in Chrome (quota is per property, ~10/day); created `md-files/calcthis-indexing-tracker.md` (every new page gets added at deploy). Researched the **Paycheck Calculator** (PaycheckCity, SmartAsset, ADP opened live; calculator.net has none), fetched the **2026 IRS Pub 15-T annual percentage tables** (saved in `md-files/calcthis-paycheck-research.md`, to be re-verified), and the user chose **FULL PARITY** (all states + old W-4 + major locals) after asking "we will not do less than competitors and give more — is it like that?". Not built yet. The user also complained about narration again (many violations) and asked whether full QA had been done — both rules reinforced above.

- **Auto Loan Calculator deployed v169 (commit `19c81bc`)** (`/auto-loan-calculator/`). Matches calculator.net to the cent ($50k car/5%/60 mo with trade-in, incentives, fees → $679.36, $36,000 financed, $3,150 tax, $15,150 upfront, $58,912 total cost; tax base = price − trade-in, incentives do not reduce tax). Modes: Find my payment / Max car price. Default fields: price, rate, term (months + 36/48/60/72/84 chips), down, incentives, trade-in, owed on trade-in, sales tax %, fees, "include taxes and fees in the loan". Differentiators: negative-equity flag (shortfall added to loan), "where your money goes" bar, terms side by side, what you pay at signing, balance chart + optional car-value line (Go advanced, yearly value loss %, shows how long you owe more than it is worth). Go advanced: extra monthly payment, tax on price−trade-in vs full price, value loss, start date. Dropped vs plan: **state tax picker** (calculator.net own state select does not fill a rate; vehicle tax rules too varied to hardcode) — tax stays a plain %. `.p-loan` body class shared; checkbox reuses `.dc-check` CSS copied under `.p-loan`. QA: calculator.net anchors, 40+ payment↔price round trips, garbage grid (19 values × 9 fields × 2 modes), ~100 randomized runs + 400 random-control steps with invariants, desktop+375px screenshots. Not verified: real phone, Copy in real Chrome, print. Cosmetic: chart y-labels repeat at a $1 car. Article deferred.

- **Loan Calculator deployed v163 (commit `5343023`)** (`/loan-calculator/`). Two modes: Find my payment / What can I borrow? (payment → loan size). Rate + term (yr/mo toggle, 1/3/5/7/10-yr chips), extra payment per period, live balance chart, interest/principal strip, term comparison table, yearly or per-payment schedule, Copy. Go advanced: payment frequency (monthly…daily, every 2 weeks), compounding (monthly…continuous), origination fee (% or $; taken out / added / paid upfront → true APR via `aprFromCash`), start date. Engine extended without changing Mortgage results (anchors $2,022.62 / $408,142 / payment 233 hold). QA: 72 frequency×compounding combos vs independent formula, hostile inputs, toggle matrix, ~800-run fuzz with invariants, desktop+375px screenshots. Fixes: -0 display, tiny-amount floor, afford-mode empty-rows crash, 22px horizontal scroll at 375px (also fixed Mortgage). Not verified: real phone, Copy in real Chrome, print. Article deferred.

- **Mortgage Calculator deployed v159 (commit `9b18285`)** (`/mortgage-calculator/`, opens the **Money & Finance** category: header col 3, 6th footer pillar, homepage tab `grp-finance`). Research opened calculator.net (mortgage/loan/auto loan), NerdWallet, Omnicalculator, mortgagecalculator.org; Bankrate blocked. User approved all 3 decisions (Mortgage first then Loan + Auto Loan on one engine; drops: live rates/ZIP/FHA-VA-USDA/currency picker/Bond+Deferred; Loan freq/compounding behind Go advanced). **Differentiators:** live balance chart with the month principal overtakes interest, per-year interest/principal strip, visible extra-payment box with live savings + faster curve, 10/15/20/30 terms side by side, PMI auto-ends at 80%, line-by-line monthly total; Go advanced = start date, tax(%/$)/insurance/PMI/HOA/other + yearly increase, yearly + one-time extras, bi-weekly, Canadian semi-annual, Copy. `CalcThis.loanEngine` (pure; `LOAN-ENGINE:START/END`, `run`/`pmt`/`mrate`/`biweekly`, matches calculator.net to the cent) + `CalcThis.initMortgageCalc`, `.p-loan`. **QA failure, now a rule:** shipped to preview after a happy-path-only QA — the % ↔ $ toggle turned an out-of-range 500 into a $210,000,000 down payment and 500% property tax gave a $3.3-billion payment. Fixed (invalid values cleared on toggle; cost sanity limits) and QA rule items 11-14 added (control × value matrix, hostile pass + random fuzz with invariants, screenshot every state, no preview with any known bug). Not verified: real phone, real Chrome (Copy), footer visually, print. Article deferred.

- **Triangle Calculator deployed v154 (commit `8067ce0`)** (`/triangle-calculator/`, Ahrefs >10K Hard ×2). Right triangle (any 2 values, Pythagorean) + Any triangle (SSS/SAS/ASA/AAS/SSA incl. the ambiguous case with BOTH triangles), live to-scale diagram, special-triangle + Pythagorean-triple recognition, steps, Pythagoras-in-squares picture. `CalcThis.triEngine` (pure, `TRIANGLE-ENGINE:START/END`) + `CalcThis.initTriangleCalc`, `.p-tri`. User corrections after preview, now permanent: **placeholders are plain numbers ("e.g. 3"), never √/π symbols** — roots/pi/sqrt still parse but are only mentioned in the helper note; **Right-triangle mode shows an explicit locked "Angle C = 90°" line** (C is the right angle, not an input). Not built vs approved report: heights ruler (heights are in the table + diagram), length unit is a label only. Not verified: real phone, real Chrome (Copy button). Article deferred.

- **Hours Calculator fixes, deployed v152 (commit `ffb5342`)** after three user corrections on the v150 build, all now permanent: (1) **Week mode uses the EXACT
  Shift-mode fields** — each day is an `.hr-day` block: day name as the label above, then two full `.time-field` (Start time / End time, AM/PM inside the
  field) and an "Unpaid break" text input; `.ap-mini` was removed entirely; fields wrap via an auto-fill grid and stack on mobile. **Never change the input
  way or look inside one calculator, in any mode.** (2) The 12/24-hour switch sits directly under the Shift/Week/Dates/Convert tabs (`#hrClockSeg`), hidden
  in Convert, NOT inside Go advanced. (3) With an hourly rate (Go advanced) the mobile sticky bar shows the sum, e.g. label "Hourly rate" (or "Hourly rate
  (+ overtime ×1.5)") and value "40h × $22 = $880" (`mbarPay()` in `initHoursCalc`). Not verified: real phone; Dates picker in real Chrome; Recipe print layout.

- Researched, built and deployed **Hours Calculator** (`/hours-calculator/`, v150; Ahrefs >10K Hard ×2 for hours / work hours calculator,
  "minutes to hours" >1K Easy). Research opened calculator.net, CalculatorSoup, Gigacalculator, Inch Calculator, Clockify live; user approved all 3
  decisions (separate page from Time Calculator with cross-links; Week tab included; simple overtime under Go advanced). 4 tabs: Shift (split +
  overnight shifts, breaks as minutes/hours/clock range), Week (overtime + pay), Dates (real elapsed hours, DST note), Convert (min/decimal/h:mm +
  decimal-hour ruler). Live 24-hour shift ribbon, payroll rounding 5/6/15 shown before/after. Clock 12/24 switch sits under the mode tabs (user
  correction: NOT inside Go advanced). **Time fields are the Time Calculator's own DS components** (masked `.time-field` + `.ap-seg`, identical in Shift, Week and Dates) after a user correction. `CalcThis.hoursEngine` (pure; `HOURS-ENGINE:START/END`) + `CalcThis.initHoursCalc`, `.p-hours`.
  Not verified: real phone; Dates picker in real Chrome. Article deferred.
- Process: user wants a bare "preview" answered with only the link; Stop hook caught narration several more times.

- Researched, built and deployed **BMR Calculator** (`/bmr-calculator/`, v146). The user ran Ahrefs on 11 head terms (BMR, Hours, Triangle,
  Pythagorean, Random Number, Unit Converter, Sales Tax, Mortgage, Loan, Paycheck, Tip) — all Hard heads — and decided to build them all
  (ranked plan in the roadmap md). BMR research opened calculator.net, Omnicalculator, Gigacalculator, bmrcalculator.org live; user approved
  all 3 decisions as recommended (RMR in text only; ages 10-100 with Schofield under 18; Mifflin headline). **Differentiators:** five formulas
  at once (Mifflin-St Jeor, Revised H-B, H-B, Schofield, Katch-McArdle with body fat) on one scale with a ±10% realistic range, kcal + kJ + per
  hour, clickable activity table driving a where-your-calories-go bar and lose/maintain/gain targets with a below-BMR flag, Metric/US/UK(stones)
  units that carry the exact value across a switch. Go advanced = body fat %, headline formula, per-kg/per-minute, RMR note. `CalcThis.bmrEngine`
  (pure; `BMR-ENGINE:START/END` in app.js) + `CalcThis.initBmrCalc`, `.p-bmr`. Not verified: real phone, real Chrome (this build). Article deferred.

- Researched, built and deployed **Recipe Converter** (`/recipe-converter/`, roadmap #25, Ahrefs >1K Easy) — opens the new
  **Cooking & Kitchen** vertical (header column in col 3, 5th footer pillar — `.footer-cols` is now `repeat(5,1fr)` — homepage
  `#grp-cooking` section + tab). Research opened Gigacalculator, Instacart, CalculateQuick (typed a test recipe, read its
  dropdowns) and Omnicalculator grams-to-cups live; user approved all 3 decisions as recommended (pillar "Cooking & Kitchen",
  drop load-from-URL, pan-size scaling under Go advanced only). **Differentiators:** kitchen-ready rounding (real cup/spoon
  fractions, whole eggs, whole grams, exact value shown beside anything rounded), cups<->grams per ingredient (~40-ingredient
  density table, US/UK/AU cup standard), As written / US / Metric, per-line scale warnings (salt/spices/leavening/part egg),
  what's-in-it-by-weight bar; Go advanced = pan-size scaling with a to-scale pan diagram, cup standard, both systems side by
  side, oven temp (F/C, fan, gas mark), per-ingredient cost, Copy + Print. `CalcThis.recipeEngine` (pure, no DOM — marked
  `RECIPE-ENGINE:START/END` in app.js, unit-testable by eval) + `CalcThis.initRecipeCalc`, `.p-recipe`. Oven-time adjustment
  was reduced to a "check early" note (no grounded formula). Densities are typical values (~5%), disclosed on the page.
  Not verified: print layout, a real phone. Article deferred.
- Deep QA caught and fixed: awkward cup fractions (3/8, 7/8), "1 lb 4 oz" misparse, bracketed amounts ("2 cups (240 g)") not
  scaling, bare numbers scaled as ingredients, "Convert to" label wrapping on mobile (now "Units").
- Stop hook caught narration again (twice); user also called out that the final message must present the findings (how we
  beat competitors) AND the preview links — both now mandatory in the final summary, in addition to the QA list.

## Earlier (v141–v142)

- Researched, built and deployed **Scientific Notation Calculator** (`/scientific-notation-calculator/`, roadmap #24,
  Ahrefs >10K Medium). Research opened calculator.net, CalculatorSoup, Omnicalculator, Pearson, Kanaries, DQYDJ live
  (converter and calculator are separate tools everywhere; only Pearson draws anything, behind toggles).
  User approved all 3 decisions as recommended (arithmetic in the same box; drop Pearson's Normalize mode + common-
  mistakes toggles; include word form up to 10^66). **Differentiators:** ONE smart box (any format or whole expression
  with + − × ÷ ^ √ and brackets), every notation at once with Copy buttons, a live decimal-point shift strip and a
  power-of-ten/SI-prefix ruler (inline SVG), exact BigInt decimal arithmetic (÷ and √ to 40 digits, flagged),
  auto-normalise note, plain-English steps shown by default; Go advanced = output style (×/x/·/LaTeX), round to
  sig figs or decimal places, forced engineering exponent. Typing 0.00450 keeps 3 significant figures. `CalcThis.initSciCalc`,
  `.p-sci`. Article deferred.
- **Deep QA hard rule applied for the first time, and it paid off:** found and fixed brackets not parsing, steps showing
  "*", 40-digit intermediates, dropped trailing zeros, decimal commas misread, half-typed "x 10^", a 1,500-digit
  headline, and a Copy button that said "Copied" even when the copy failed. Also verified in the user's real Chrome
  and by running the build with the IndexNow ping removed (a temp copy of build.js) to prove the gates pass first.
- **New working method:** to check the build gates before deploy without pinging IndexNow, run a temp copy of
  build.js with the INDEXNOW block removed, then delete it.

## Earlier (v140)

- Researched, built and deployed **Wallpaper Calculator** (`/wallpaper-calculator/`, roadmap #23). Research opened
  Omnicalculator, Inch Calculator, Kalk.pro, Materio (wizard not drivable past step 1 — inputs from its page text),
  Laurel Mercantile (static chart); Boråstapeter 404. Differentiators (user-approved, all 3 decisions as
  recommended): **strip-method engine** (whole drops, cut length = height + trim rounded up to the pattern repeat,
  half-drop alternate strips +1 repeat, strips cut from rolls in order) shown next to the naive area answer; live
  strip diagram (walls in a 2-column grid, strips coloured by roll); roll presets (US double 20.5 in × 33 ft, Euro
  53 cm × 10.05 m, custom) or sold by the yard/metre; match type; spare strips + waste %; wall-by-wall mode;
  multi-room project total packing strips across rooms. Doors/windows deliberately don't change the roll count
  (only the area comparison). Dropped by user sign-off: Materio photo upload, Kalk "shift the pattern", Omni's
  single-wall/room switch. `CalcThis.initWallpaperCalc`, `.p-wall`. Article deferred.
- **New hard rule (user, 2026-10-14): deep QA after EVERY build, automatically, before any preview** — in this
  file's top rules, workflow Rule 10 and memory. Wallpaper's own QA pass found a real bug (single named room not
  shown as a label above its project row) and a text/tool mismatch (worked example said 7 rolls, tool said 8 —
  the area figure was without the door/windows the text didn't mention).
- The Stop hook caught narration again; user re-stated: write ONLY a question or the final result.

## Earlier (v138–v139)

- Researched, built and deployed **Paint Calculator** (`/paint-calculator/`, roadmap #22). Differentiators
  (user-approved): live room diagram (walls flat with areas, openings, gables, ceiling plan, trim) +
  per-surface shopping list (cans to buy, leftover, cost) + multi-room project total with sticky `.mbar`.
  Interior + Exterior; Go advanced = wall-by-wall mode (with peak/gable), texture/coverage, primer,
  per-surface coats, door/window sizes, baseboard/crown, waste, price. `CalcThis.initPaintCalc`, `.p-paint`.
  User corrections after preview, now permanent: the room name must show in the project list as a label
  ABOVE its row; no invented "Walls" label when walls are the only surface (header says "Area"); tally row
  keeps name | litres | area on one aligned line; sub-text keeps its grey 12px style; paired fields stay
  side by side on mobile (`.p-paint .two`). Article deferred.

## Earlier (v130–v137)


- Researched, built and deployed **Standard Deviation Calculator** (`/standard-deviation-calculator/`,
  roadmap #21 — Ahrefs 2026-10-05: head >10K Medium, sample/population >1K Easy). Research opened
  calculator.net, CalculatorSoup, Omnicalculator and Statistics Kingdom live (Rule 8.5). All bare
  numbers; only Statistics Kingdom has charts (heavy). **Visual differentiator:** live number-line dot
  plot (every value a dot, mean marked, ±1/±2 SD bands, dots coloured by distance). **Functional
  differentiators (the new rule — see below):** sample σ AND population s always shown side by side
  (no re-run), quiet data cleaning with an "N ignored (…)" report, a plain-English reading, and under
  Go advanced: value+count data mode, outlier threshold with one-click exclude & recalculate (shows how
  the SD changed), z-score table, quartiles/IQR/mode/relative SD, confidence interval with a 90/95/99%
  level (t-table), decimal places. `CalcThis.initSdCalc` in app.js, `.p-sdcalc` in style.css; all
  statistics count-weighted. Verified against known values (2,4,4,4,5,5,7,9 → s 2.1381, σ 2;
  calculator.net example; 1..10 quartiles + 95% CI). Sticky `.mbar` included from the start (Fraction
  lesson). Deployed as v137. **Article deferred** (user decision).
- **New hard rule (user, 2026-10-05): every research report must propose a FUNCTIONAL differentiator
  as well as the visual one** — written verbatim into the Calculator Build Order rule above and
  `calcthis-workflow-rules.md` Rule 8.
- **Field spacing fixed structurally.** Standard Deviation shipped with zero gap between the Go-advanced
  fields (`<div class="fld">` has no margin under the old `label.fld`-only rule) — a repeat of the VO2
  Max bug, which the user had to point out again with red lines. Fix: base rule is now global
  `.fld{margin-bottom:15px}` for any element, plus a sabotage-tested `build.js` gate
  (`checkFldSpacing`), documented in `calcthis-design-system.md` → "Field spacing"; the per-page
  `.p-X .fld` requirement is retired.

## Earlier (v121–v129)

- Researched, built and deployed **Fraction Calculator** (`/fraction-calculator/`, roadmap #20 —
  Ahrefs 2026-10-05: head term >100K Easy + 7 long-tails >1K). Research opened calculator.net,
  CalculatorSoup, fractioncalculator.com, Omnicalculator and Pearson live (Rule 8.5). Only Pearson
  has any visual (simple fraction bars); nobody handles 3+ fractions in one view (Omni sends you to
  a separate tool — matches the Ahrefs term `3 fraction calculator`). **Differentiator
  (user-approved):** a live bar diagram of the actual operation (operands, common-denominator
  re-slice for pure add/subtract chains, result) + operand rows of any count with normal
  precedence. calculator.net's "Big Number Fraction" mode was dropped as a mode (Ahrefs: <100/mo
  for both variants) but the engine is exact BigInt so large numbers just work. `CalcThis.initFractionsCalc`
  in app.js, `.p-fcalc` in style.css. Modes via 2-button `.modeseg` (Calculate / Simplify-convert);
  per-row operator `.seg` (+ − × ÷ of); steps shown by default; **Go advanced** = real visible panel
  (decimal places) + Compare / LCD table / formula-style working in the results.
  **Three UX fixes after the user previewed it, all now permanent behaviour:** (1) mobile result was
  off-screen while typing — added the standard sticky `.mbar` (same as Gravel/Ratio) showing the live
  result; (2) placeholders read "3/4 or 1 3/4" so the whole-number-plus-fraction form is obvious;
  (3) a half-typed entry ("2/", "1 3", "-", "0.") is skipped quietly instead of blanking the result
  with an error. Then the result headline became the written-out action ("1/3 + 2 = 2 1/3", or
  "0.125 = 1/8" for one value), with × ÷ groups bracketed when inside a longer + − expression
  ("(1/3 × 2 3/4) + 2 1/2 + 3/4 = 4 1/6"). Wired into nav, footer, homepage (card + hasPart + prose
  count → 42), build.js, sitemap.xml. Deployed as v129. **Companion article NOT yet written** —
  needs its own approval of a slug/title first (see roadmap memory).

## Earlier (v117–v120)

- Researched, built and deployed **Grade Curve Calculator** (`/grade-curve-calculator/`,
  roadmap #19 — Ahrefs-verified >1,000/mo, Easy KD, from the same 2026-09-22 Ahrefs pass as
  Weighted Average). Research opened Omnicalculator, gradecurvecalculator.org, and
  youcanedit.com live in the Browser tool (Rule 8.5) — union of methods across all three:
  Linear/flat rescale, Ratios/multiply-by-factor, Bell curve, Square root, Highest→100%,
  Percentage boost, Target mean, Custom Formula (youcanedit only), Custom Grade Boundaries
  (gradecurvecalculator.org only). User approved building all of these except Custom Formula
  (arbitrary eval — scope/security risk) and Custom Grade Boundaries (that's letter-cutoff
  editing, a different job from curving) — and explicitly asked to KEEP CSV import
  (gradecurvecalculator.org's differentiator) after it was proposed as a drop; kept.
  **Differentiator (user-approved):** none of the three competitors render an actual
  distribution chart despite one claiming to — built a live before/after letter-grade
  distribution bar (stacked segments, same technique as Weighted Average's contribution bar)
  plus a before/after mean/median/std-dev/min/max table and a per-student breakdown table.
  Default view: 3-button `.modeseg` (Add points / Highest→100% / % boost). Go advanced opens
  a real panel with a second `.csel` for Reach-a-target-mean / Bell curve / Square root /
  Multiply-by-factor. CSV import extracts every number from the uploaded file and refills the
  same paste textarea (one entry surface, not a separate mode).
  **Two real process failures this session, both fixed before deploy:**
  1. Shipped with the textarea pre-filled with demo numbers on load — deviates from every
     other dynamic-row calculator's convention (Weighted Average, GPA, etc. all start
     genuinely empty with an empty-state message). User caught it ("just for the demo?").
     Removed; now starts blank.
  2. **Shipped the 4 advanced-only methods folded into a closed `.csel` dropdown instead of
     the mandatory documented pattern** (`calcthis-design-system.md` "Go Advanced Button" —
     "Advanced panel sits ABOVE the button, hidden via `display:none`"). Clicking "Go
     advanced" produced zero visible on-page change (only the button's own label flipped),
     which the user correctly read as broken — "the second time we go over the exact
     error." Root cause: substituted "more dropdown options behind a click-to-open panel"
     for "a real visible panel," which is not the same mechanism and isn't documented
     anywhere as a valid variant. Fixed by restructuring: default view is a plain 3-button
     `.modeseg` (always visible, no click needed), and Go advanced now opens a real
     `#gcAdvPanel` (`display:none` → `''`) containing its own `.csel` for the 4 deeper
     methods — verified with real clicks + screenshots this time, not just DOM state checks.
  Companion article **"How to Curve Grades: Every Method Explained"**
  (`/blog/how-to-curve-grades/`) shipped same session — the first School & Grades article on
  the site (previously only Math & Numbers had one). Matches Omni's own competitor precedent
  of pairing this exact calculator with a "how to" methods article (found during research).
  6-method comparison table, formula + explanation per method, a worked example reusing
  Omni's own published dataset and z-score results (verified by hand with node, catching and
  fixing two wrong bell-curve numbers — 55→73.2 not 72.5, 80→91.1 not 94.8 — before shipping),
  guidance on which method to use, 5 FAQs, 2 in-article photos + hero + card (a classroom/
  grading setting — new for this site, no measurements so the unit toggle correctly stayed
  hidden, 0 `.u` spans). New "School & Grades" section added to the blog hub (4th section,
  after Math & Numbers). WebApplication + FAQPage JSON-LD, `.related-calcs` (GPA / Final
  Grade / Test Score / Weighted Average). Wired into nav, footer, homepage (card + hasPart +
  prose count → 41), build.js, sitemap.xml, blog hub + registry. Deployed as v120.

## Earlier (v111–v116)

- Researched, built and deployed **Weighted Average Calculator**
  (`/weighted-average-calculator/`, roadmap #18 — Ahrefs-verified >1,000/mo, Easy KD, from a
  fresh keyword pass the user ran in Ahrefs). Research opened Omnicalculator, RapidTables,
  HandyMath live in the Browser tool (Rule 8.5) — all bare-number dynamic value+weight rows,
  none with any visual. **Differentiator (user-approved):** a live per-row contribution bar
  (weight share of each row, stacked-segment technique reused from Water Intake/Lean Body
  Mass, color-cycling since row count is unbounded) plus a simple-vs-weighted average
  comparison line, and a Go-advanced reverse-solve mode (given a target weighted average and
  which row is unknown, solve for that row's value — same idea as Final Grade Calculator's
  target-solve). `CalcThis.initWavgCalc` in app.js, `.p-wavg` in style.css. Dynamic rows
  reuse the GPA Calculator's add/remove-row pattern (`.win` compact inputs instead of
  GPA's `.cr-field`).
  **Real bug found and fixed structurally, not just patched:** the "Solve for" row picker is
  a `.csel` whose options must be rebuilt every time a row is added or removed — re-running
  the shared `CalcThis.initCsel` on the same element threw `Cannot redefine property: value`
  (its `Object.defineProperty` was written assuming init runs exactly once per element),
  which silently aborted the page's init script and dropped a default row. Fixed in the
  shared runtime (`app.js`): the `.value` property is now defined once and forwards to a
  `root._cselApi` object that each re-init call simply overwrites; option-click listeners
  rebind safely on every call (fresh nodes after an innerHTML rebuild); `btn`/`document`
  listeners still bind only once. This is exactly the re-init call the design system already
  documents for a dynamically-generated dropdown (`grade-calculator`/`gpa-calculator`'s
  still-pending per-row select retrofit) — it just never worked until now. Regression-tested
  live against Square Footage's shape `.csel` after the fix (still selects and fires
  correctly).
  Companion article **"What Is a Weighted Average? How to Calculate It (With Examples)"**
  (`/blog/what-is-a-weighted-average/`) shipped same session — formula, worked example
  (same 25/25/50%-exam numbers as the calculator's own content), what to use as a weight,
  weighted-vs-simple divergence, real-world uses beyond grades (GPA, WACC, inventory
  costing), reverse-solve explainer, 5 FAQs, 2 in-article photos + hero + card. No
  measurements in this topic — unit toggle correctly stayed hidden (`class="u"` count = 0),
  confirmed both mechanically and via `getComputedStyle(...).display === 'none'` live.
  **New standing instruction applied:** images used a Filipino man in his early 20s
  (average build, short black hair, dark brown eyes) for hero/card/first in-article photo,
  and a Black woman in her 40s (curly hair, average build) for the second, per
  [[calcthis-image-diversity]] memory from the previous session.
  WebApplication + FAQPage JSON-LD, `.related-calcs` (GPA / Final Grade / Percentage /
  Ratio). Wired into nav, footer, homepage (card + hasPart + prose count → 40), build.js,
  sitemap.xml, blog hub + registry. Deployed as v116.

- **No-narration rule violated a 4th time** (2026-09-22, mid-debug commentary while chasing
  the `.csel` bug above). Fixed structurally this time, not just re-stated: added a
  mechanical per-text-block self-check ("is this narrating an action, or stating a result /
  asking a question?") to CLAUDE.md's hard rule, `calcthis-workflow-rules.md` Rule 4, and
  `calcthis-working-rules.md` Behavior section — check runs before every text block for the
  rest of a session, not just once at the top.

## Earlier (v108–v110)

- Researched, built and deployed **Waist-to-Hip Ratio Calculator**
  (`/waist-to-hip-ratio-calculator/`, roadmap #17 — Ahrefs-verified >1,000/mo, Easy KD).
  Research opened Omnicalculator, MDCalc, TheCalculatorSite, Patient.info live in the
  Browser tool (Rule 8.5) — all bare number/table output, none with sex-specific live
  visuals. **Differentiator (user-approved):** a live sex-specific 3-tier health-risk gauge
  (bar+marker+ticks, reused Protein Intake's gauge technique, band edges swap by sex —
  female 0.80/0.85, male 0.95/1.00) plus an apple/pear body-shape read. Inputs match every
  competitor: sex, units, waist, hip. `CalcThis.initWhrCalc` in app.js, `.p-whr` in style.css.
  **Two real process failures this session, both fixed before deploy:**
  1. Shipped Go-advanced with only a thin one-line waist-circumference flag reusing the
     already-entered waist value — user pushed back asking for genuinely more depth. Added
     an optional Height input (advanced-only) computing waist-to-height ratio against the
     widely cited "keep waist under half your height" guideline, folded into the same
     advanced note alongside the WHO absolute-waist-circumference check.
  2. The risk-verdict sentence ("Higher health risk for a female — an 'apple' tendency…")
     shipped as a new page-scoped `.whr-cat` class (13px muted), copied from VO2 Max/Protein
     Intake's `-cat` pattern without checking whether THIS sentence played the same role —
     it didn't: it stated the actual conclusion, not supplementary context, so it needed the
     global `.res-tip.adv-tip` (16px amber) per the design system's narrative-takeaway rule.
     **7th occurrence of this exact class of bug** — memory (`calcthis-text-size-floor`)
     rewritten with a sharper trigger question ("does this sentence state the conclusion, or
     just add context around one stated elsewhere?") to stop pattern-matching a new page's
     text-size class off a sibling calculator's class without re-asking that question.
  Companion article **"What Is Waist-to-Hip Ratio? How to Measure and Interpret Your WHR"**
  (`/blog/what-is-waist-to-hip-ratio/`) shipped same session — formula, measuring
  instructions, worked example, WHO risk table, apple/pear/avocado shapes, WHR vs BMI vs
  waist-circumference-alone vs waist-to-height, 5 FAQs, calc-cta, 2 in-article photos + hero
  + card. **New standing image-diversity instruction from the user:** health/fitness article
  people must look like "regular everyday people," not toned/fitness-model bodies, and must
  be actively diversified across ethnicity (Caucasian/Hispanic/Indian/Asian/Russian/etc.),
  hair color/style, eye color, and body shape (athletic/a-bit-fuller/thin/etc.) — saved to
  persistent memory (`calcthis-image-diversity`) so it applies to every future article, not
  just this one. This article used an Indian woman (average build, long black hair, brown
  eyes) for the card/hero/first in-article photo and a Russian woman in her 50s (fuller
  build, ash-blonde bob) for the second, in a clinic setting. Unit-toggle gate passed clean
  first pass; live Metric-mode scan confirmed zero leftover Imperial text. WebApplication +
  FAQPage JSON-LD, `.related-calcs` (BMI / Body Fat / Ideal Weight / Lean Body Mass). Wired
  into nav, footer, homepage (card + hasPart + prose count → 39), build.js, sitemap.xml, blog
  hub + registry. Deployed as v110.

## Earlier (v107)

- Researched, built and deployed **Lean Body Mass Calculator**
  (`/lean-body-mass-calculator/`, roadmap #16 — Ahrefs-verified >1,000/mo, Medium KD).
  Research opened calculator.net, Omnicalculator and ajdesigner.com live in the Browser tool
  (Rule 8.5) — all three are bare number/table output with zero visuals. **Differentiator
  (user-approved):** a live lean-vs-fat composition bar (spruce/amber split, same technique
  as Water Intake's stacked bar) plus all three formulas plotted on one scale against a
  typical healthy range — reuses the Ideal Weight calculator's `.iw-bar` tick pattern exactly
  (Never-Invent), not a new mechanism — an exact result from a known body-fat % (Go advanced),
  and a protein-target reference tied to lean mass. `CalcThis.initLbmCalc` in app.js, `.p-lbm`
  in style.css. Inputs match every competitor: sex, height, weight, units, **and the
  child/Peters-formula path (age ≤14) that calculator.net has and Omni/ajdesigner don't** —
  user explicitly asked to keep this in scope after the research report flagged it as
  optional. Boer/James/Hume formulas verified by hand against ajdesigner's own published
  worked example (70 kg / 175 cm male → 56.0 / 56.5 / 52.8 kg) before shipping — exact match.
  Companion article **"What Is Lean Body Mass? How to Calculate and Track It"**
  (`/blog/what-is-lean-body-mass/`) shipped same session — exact formula, the three estimate
  formulas, worked example, healthy-range guidance, LBM-vs-fat-free-mass distinction, 5 FAQs,
  2 in-article photos (varied descriptors per the image-prompt rule). Unit-toggle gate caught
  4 bare "5 lb"/"5 kg" mismatches on the first pass (a checklist bullet + two disagreement-
  range mentions) — fixed and reverified with a live Metric-mode text scan before sending
  preview links.
  **Real process failure this session, now fixed structurally in the skill file:** the
  child-mode result note shipped as plain `class="res-tip"` (12.5px, muted grey) instead of
  the global `class="res-tip adv-tip"` (16px, amber) that this exact "narrative takeaway
  sentence" pattern already has — the **5th** time this specific class has been left off
  across the site (after Age, Time, Tape Measure Fraction, Steps to Miles). Root cause: knew
  the rule existed but didn't re-check `calcthis-design-system.md` at the moment of writing
  that specific element. Fixed on this page; `calcthis-design-system.md`'s "Advanced-mode
  explanatory line" section and persistent memory (`calcthis-text-size-floor`) both rewritten
  with the corrected trigger — "is this a substantive single-sentence narrative takeaway,"
  not "is this literally inside a `#advOut` panel" (this note lived in the default view).
  WebApplication + FAQPage JSON-LD, `.related-calcs` (Body Fat / Ideal Weight / Protein
  Intake / BMI). Wired into nav, footer, homepage (card + hasPart + prose count → 38),
  build.js, sitemap.xml, blog hub + registry. Deployed as v107.

## Earlier (v106)

- Researched, built and deployed **Stair Calculator** (`/stair-calculator/`, roadmap #15 —
  Ahrefs-verified >10,000/mo, Medium KD). Research opened calculator.net, Omnicalculator,
  Decks.com, ConCalculator and stair-calculator.com live in the Browser tool (Rule 8.5) —
  stair-calculator.com already ships a live side/3D-view diagram + IRC code-check badges, so
  a bare diagram wasn't enough of a differentiator. **Differentiator:** a materials + cost
  estimate (stringer count from stair width at a 24 in/61 cm spacing rule, cut length rounded
  up to a standard stock board length, tread/riser board footage with a waste allowance) — no
  competitor checked combines a diagram with an actual buy-list. `CalcThis.initStairCalc` in
  app.js, `.p-stair` in style.css. Inputs match/exceed every competitor: run mode (per-step or
  total), rise mode (target riser height or fixed step count), standard/flush mount, stair
  width, tread thickness, closed/open risers + riser thickness, stringer lumber size (`.csel`),
  headroom check (planned headroom vs. required minimum — deliberately the simpler
  Omnicalculator-style direct-measurement check, not calculator.net's floor-opening geometry,
  which couldn't be verified confidently), waste %, stringer/lumber pricing. Live side-view
  SVG diagram (reuses the Square Footage diagram-box/legend technique) redraws with rise/run
  axis lines, an angle arc, and a per-step rise/run dimension callout — iterated once after
  the user compared it to Omni's and stair-calculator.com's more detailed diagrams and asked
  for more annotation; added the axis dimension lines + angle arc + per-step callout to match.
  Colour-coded IRC/comfort code-check table (riser max, tread min, 2R+T comfort rule, angle
  range, width min, headroom) using `.stair-ok`/`.stair-bad` (spruce/red, matching the site's
  existing pass/fail palette). Formulas verified independently by hand against Omnicalculator's
  published stringer-length/angle formulas before shipping.
  Companion article **"How to Calculate Stair Rise and Run (Plus Stringer Length)"**
  (`/blog/how-to-calculate-stair-rise-and-run/`) shipped same session — riser-height formula,
  standard vs. flush mount, Pythagorean stringer-length formula, IRC code table, full worked
  example, materials section, 5 FAQs, a custom labeled explainer SVG diagram (not the live
  calculator's diagram — a simpler static teaching version, same visual language), 2 in-article
  photos. Unit-toggle QA found and fixed two real gaps this session before shipping (both past
  the mechanical `build.js` gate, since neither had a bare number immediately adjacent to an
  imperial word for the regex to catch): a worked-example list item's trailing "targeting a 7.5
  in riser" and "under the 7.75 in code max" sat outside their `.u` span, and "priced by the
  linear foot" was a bare unit convention with no wrap. Both fixed and reverified live in the
  Browser tool with a full Metric-mode text scan (zero Imperial words leaking) — mechanical
  `build.js` gate passing alone is not sufficient, always also verify live in Metric mode.
  WebApplication + FAQPage JSON-LD, `.related-calcs` (Square Footage / Board Foot / Flooring /
  Concrete). Wired into nav, footer, homepage (card + hasPart + prose count → 37), build.js,
  sitemap.xml, blog hub + registry. Deployed as v106.

## Earlier (v105)

- Two structural UI fixes, both closed with a mechanical gate, not just a one-off patch:
  1. **Field-height parity.** `.csel-btn`/`.inp input`/`.sel select` now all get their box
     height from one shared `--field-h` token instead of font-size+padding math — a
     page-specific override can no longer silently shrink a control below its sibling
     fields' height. Found on the Tape Measure Fraction Calculator's Denominator dropdown
     (3px shorter than the Feet input / Round-to dropdown). `build.js` gained a
     `checkFieldHeight` gate that fails the build if any future CSS rule sets a
     conflicting `height` on these three selectors. Verified with a sabotage test.
  2. **Footer legal-nav wrapping.** "Terms of use" / "Privacy policy" now wrap as whole
     phrases on narrow viewports instead of breaking mid-word — `flex-wrap:wrap` on
     `.footer-legal-nav` + `white-space:nowrap` on its links. One shared rule via the
     footer partial, applies to all pages automatically.
  Deployed as v105.

## Earlier (v104)

- Deployed **Square Footage Calculator** (`/square-footage-calculator/`, roadmap #14 — built
  and approved the prior session, shipped this session) + companion article **"How to
  Calculate Square Footage (Any Shape, Room, or Project)"**
  (`/blog/how-to-calculate-square-footage/`). Calculator: 13 shape modes, live SVG diagram +
  legend, project tally with waste + cost, wired into nav, footer, homepage (card + hasPart +
  prose count), build.js, sitemap.xml. Article: formulas table, worked example, sq ft/sq
  yd/acre conversion table, waste guidance, 5 FAQs, 2 in-article photos, `.blog-pills` +
  `.calc-cta`. WebApplication + FAQPage JSON-LD.
  **Real process failure this session, now closed structurally, not just documented:** the
  article's "Square feet, square yards and acres" reference table shipped with **zero `.u`
  wraps at all** — it "looked like" it already covered both systems by listing several rows
  (`1 acre | 43,560 sq ft`, `1 hectare | 10,000 m²`), so it was judged exempt from the unit-
  toggle rule. It wasn't: every row showed one fixed imperial-framed fact regardless of which
  toggle button was selected. The user caught it by eye and, after this shipped as "the fix"
  once already (a `<table class="dtable">`-only gate), pushed back hard that a narrower fix
  wasn't good enough. Ended with `build.js`'s `checkUnitToggles` rebuilt as a real tag-walking
  tokenizer (stack-based ancestry, not regex-strip) that fails the build on ANY unit-bearing
  number left outside a `.u` element anywhere in `.blog-content`, with exactly four named
  exemptions (heading/`<summary>`, `<svg>`, `<div class="formula">`, table column 0). Verified
  against all 21 live articles before enabling: found and fixed **11 real pre-existing gaps**
  this surfaced (concrete, sand, mulch, flooring, topsoil, should-i-weigh, VO2 max articles),
  then confirmed zero failures twice, plus a deliberate sabotage test to prove the gate
  actually fires. New hard rule + full narrative in `CLAUDE.md`'s unit-toggle section and
  `calcthis-blog-article.md` Step A ("it's a reference table, already covers both units" is
  now a permanently retired exemption — do not reinvent it).
  Deployed as v104.

## Earlier (v103)

- Built **Protein Intake Calculator** (`/protein-intake-calculator/`, roadmap #13) —
  researched and approved this session (Ahrefs-verified `protein intake calculator`,
  >10,000/mo, Easy KD). `CalcThis.initProteinCalc` in app.js, `.p-protein` in style.css.
  Age + sex + weight + goal chips (Sedentary/General fitness/Muscle gain/Cutting) → daily
  protein target in grams, using goal-based g/kg multipliers (0.8/1.4/1.9/2.4) grounded in
  ISSN position-stand ranges. **Differentiator (Rule 8):** a live gauge (bar + marker +
  ticks, same technique as VO2 Max's gauge, fixed science-based bands 0.8–2.8 g/kg instead
  of per-user norms) plotting the target across the full RDA-to-cutting spectrum, plus food
  equivalents (chicken breasts / eggs, same divisors as the Macro calculator) and (Go
  advanced) a lean-body-mass mode via body fat %, age-65+ PROT-AGE baseline bump (0.8 →
  1.1 g/kg), pregnancy (+14 g/day) / breastfeeding (+25 g/day) adjustment gated on
  Female + advanced (same pattern as Water Intake's `specialRow`), and a per-meal split
  table (3/4/5 meals). Companion article **"How Much Protein Do I Need?"**
  (`/blog/how-much-protein-do-i-need/`) shipped same session.
  **Two real process failures this session, both now hard rules:**
  1. **Shipped without Age or Sex** even though the competitor research had already found
     and reported that calculator.net's protein calculator uses Age, Gender, Height, Weight
     and Activity level — the finding was made and never acted on in the build. User caught
     it by pointing to calculator.net's own screenshot. Fixed by adding Age + Sex to the
     default (non-advanced) view. New hard rule added everywhere (`CLAUDE.md`,
     `calcthis-workflow-rules.md` Rule 8.5, `calcthis-design-system.md` PRODUCT PHILOSOPHY):
     never ship a calculator with fewer inputs than competitors; when a text-only fetch can't
     confirm a competitor's actual UI, stop and ask the user for a screenshot rather than
     guess.
  2. **The g/kg ratio never converted with the unit toggle** — both the calculator's result
     text/gauge and the article's every "X g/kg" mention stayed in g/kg regardless of
     Imperial/Metric selection, even though American fitness content commonly uses the
     "g per lb of bodyweight" framing instead (exactly like inches vs. cm). The correct
     dual-unit pattern already existed in two older articles
     (`how-many-calories-to-lose-weight`, `how-to-calculate-your-macros`) and was not reused
     — a Never-Invent violation as much as a unit-toggle one. Fixed in both the calculator
     (`renderGauge`/`solve` in `initProteinCalc` now display g/lb in Imperial, g/kg in
     Metric) and the article (every ratio mention wrapped, matching the existing precedent
     exactly). New hard rule added to `calcthis-blog-article.md` (Step A-minus-one): rate/
     ratio quantities (g/kg, g/lb, $/sqft, etc.) get the same toggle treatment as raw
     measurements whenever the rate is commonly stated in both systems in real-world use.
  **Also fixed this session:** blog image prompts kept defaulting to the same "young fit
  woman in athletic wear" and the same generic marble kitchen across articles — new hard
  rule in `calcthis-blog-article.md` requiring explicit, varied physical descriptors (age,
  ethnicity, hair, build) and varied, specific settings (kitchen style, materials, layout)
  per article, with clothing matched to the actual scene rather than a fitness-brand
  default. Also reinforced the no-narration rule (violated a third time this session) as
  the very first hard rule at the top of this file.
  WebApplication + FAQPage JSON-LD, 5 FAQs, `.related-calcs` (Macro / TDEE / Calorie / One
  Rep Max). Wired into nav, footer, homepage (card + hasPart + prose count → 35), build.js,
  sitemap.xml, blog hub. Deployed as v103.

## Earlier (v100)

- Built **Steps to Miles Calculator** (`/steps-to-miles-calculator/`, roadmap #12) —
  approved and researched last session (Ahrefs-verified `steps to miles calculator`,
  >10,000/mo, Easy KD), built directly per the pre-approved differentiator.
  `CalcThis.initStepsMilesCalc` in app.js, `.p-steps` in style.css. Steps + height + sex
  (Female default) → distance in miles/km using the standard pedometer stride-length
  formula (height × 0.413 men / 0.415 women), not a flat "2,000 steps = 1 mile" constant
  like every competitor checked. **Differentiator (Rule 8):** a live distance-milestone
  progress bar (1 mile / 5K / 10K / half / marathon ticks, same bar+marker+ticks technique
  as the VO2 Max gauge) instead of a bare number, plus (Go advanced) a calorie-burn
  estimate using the ACSM walking metabolic equation — weight + speed/incline chips →
  calories for the computed distance, with a speed-vs-calories curve across 0/5/10%
  incline (same SVG-polyline technique as the Calorie calculator's weight-loss curve).
  Custom stride override available for users who've measured their own.
  **Bug caught in preview QA:** the calorie curve chart's wrapper div stayed
  `display:none` even when weight was entered — `renderCalChart()` populated the SVG but
  nothing ever un-hid the wrapper on the success path (only the "no weight" fallback path
  cleared it). Fixed before shipping; verified via direct JS inspection since the browser
  pane's screenshot tool was flaky scrolling this page (stale/blank frames on scroll) —
  cross-checked the same state with `getBoundingClientRect`/computed styles instead of
  trusting screenshots alone.
  **Also fixed in passing:** homepage prose section was stale — missing any mention of
  VO2 Max (shipped v89–99, never added to the prose paragraph) and undercounting at
  "thirty-two calculators" when 33 were already live; and the homepage JSON-LD `hasPart`
  list was missing the Ratio Calculator entirely (pre-existing gap, unrelated to this
  build, fixed since it was directly adjacent). WebApplication + FAQPage JSON-LD, 5 FAQs,
  `.related-calcs` (Pace / Calorie / VO2 Max / Water Intake). Wired into nav, footer,
  homepage (card + hasPart + prose count → 34), build.js, sitemap.xml.
  Companion article **"How Many Steps Are in a Mile?"** (`/blog/how-many-steps-are-in-a-mile/`)
  shipped same session — a "framing-unit" article (whole subject IS a unit) whose Metric
  toggle rewrites the narrative (headings, FAQ, every "steps per mile" figure recomputed),
  not just swaps numbers under an unchanged word. Caught + fixed after shipping once already:
  the Step C verification regex only checked inch/foot/feet and missed "mile" entirely, so it
  falsely passed with the H1 and several figures still unconverted. Fixed both the skill
  file's regex and `build.js`'s `checkUnitToggles` IMP_WORD list (now covers mile/yard/pound/
  ton) plus added ft→m as a valid pairing to the gate's numeric check (it only recognized
  ft→cm before, incorrectly flagging "24 feet"→"7.3 m" as a mismatch). New Step A0 rule added
  to `calcthis-blog-article.md` for any future framing-unit article. Deployed as v100.

## Earlier (v87–v99)

- v87–v88: Built + deployed **Tape Measure Fraction Calculator** (`/tape-measure-fraction-calculator/`,
  roadmap #10) + companion article **"How to Add and Subtract Fractions on a Tape Measure"**.
  Companion article's unit toggle went through 3 rounds of bugs (missing, then partially wrapped,
  then a policy that wrongly excluded it) before landing on the current fixed procedure — see
  the hard rules below.
- v89–v99: Built + deployed **VO2 Max Calculator** (`/vo2-max-calculator/`) + companion article
  **"What Is VO2 Max? How to Estimate Your Aerobic Fitness"**. `CalcThis.initVO2MaxCalc` in
  app.js, `.p-vo2max` in style.css. Two estimate methods — resting heart rate (default,
  `VO2max = 15.3 × HRmax/HRrest`, HRmax via the existing Tanaka formula already used by Heart
  Rate Zone) and the 1-mile walk/Rockport test (Go advanced). **Differentiator (Rule 8,
  verified against Omnicalculator/MD App/Legion — all bare-number, zero visuals, zero age/sex
  context):** a live percentile gauge against Cooper Institute age+sex norms (bar + marker +
  ticks, bands computed per age/sex in JS, same bar/marker technique as the BMI gauge) plus
  (Go advanced) equivalent 5K/10K/half/marathon times, reusing the exact VDOT solver already
  in Race Time Predictor's `initPredictorCalc` (copied locally per this codebase's own
  "independent engine, no shared state" convention). Two-field `min:sec` input reuses the
  existing `.two-c` pattern (flex-based, never wraps on mobile — confirmed live on Pace
  Calculator already using it), not `.two` (grid-based, wraps at 430px — wrong for this).
  **Bug found + fixed:** a `<div class="fld">` for the walk-time field had no vertical margin
  because `label.fld` CSS doesn't cover divs — every page using `.two-c`/`.three` needs its own
  `.p-PAGENAME .fld{margin-bottom:...}` rule in style.css; this is now checklist item #15 in
  `calcthis-new-page-checklist.md`. Also moved page CSS from an (incorrect) inline `<style>`
  block into `style.css` proper, matching every other live calculator page.
- **New hard rules this session, in `CLAUDE.md` + skill files, after repeated process failures:**
  - *Never invent* — copy an existing skill-file pattern or live reference page exactly; stop
    and ask rather than improvise a variation.
  - *Calculator build order* — research report → user approval → build → preview, no skipping.
  - *Unit toggle QA on every article, every time* (`calcthis-blog-article.md` Rule #0.5 / Step
    5.5) — a mechanical decide → wrap → verify procedure, no judgment-call carve-outs.
  - **`build.js` now has a hard-fail gate** (`checkUnitToggles`, runs before anything else
    touches disk) that scans every `blog/*/index.html` and refuses to write ANY file if a
    `class="u"` element is missing `data-imp`/`data-met`, if `data-met` leaks a stray imperial
    word, or if a simple single-value conversion's numbers are wrong (>5% off) or the unit
    families don't match. Caught and fixed one real pre-existing rounding error
    (`how-many-calories-to-lose-weight`: "0.5 lb" was paired with "0.25 kg", corrected to
    "0.23 kg") the same day it was added.

## Earlier (v84–v85)

- v84–v85: Built + deployed **Time Calculator** (`/time-calculator/`) — roadmap #9,
  completes the Date/Time cluster (Age + Date + Time). `CalcThis.initTimeCalc` in app.js,
  `.p-timecalc` in style.css. Three modes via `.modeseg`: **Elapsed time** (start/end
  clock time → duration, rolls to next day if end ≤ start, advanced = extra full days),
  **Add / subtract** (h:m:s entries + Add/Subtract direction → a running tally list with
  a live running total, reusing the `.trow`-style tally pattern), **Time card** (Mon–Sun
  clock-in/out + break minutes → daily + weekly hours, advanced = hourly rate → weekly pay).
  Targets the three Easy-KD terms from Ahrefs research (elapsed time calculator / free
  time card calculator / weekly-total hours calculator), skipping the Hard head terms.
  **Differentiator (Rule 8, verified against live competitor pages via WebFetch —
  Omnicalculator elapsed-time and timecardcalculator.net are both text/table-only):**
  every mode shows a live visual instead of a bare table — a 24-hour timeline bar
  (elapsed), a running tally list (add/subtract), and a week-at-a-glance daily-hours bar
  chart with days over 8h flagged in amber (time card).
  **Clock-time input:** no vendored time-picker exists alongside the datepicker, so all
  clock-time fields (elapsed start/end, 14× time-card in/out) reuse the Sleep calculator's
  masked h:mm digit input (`.time-box`/`.time-ghost`/`.time-digits`) + a visible AM/PM
  toggle — full-size `.ap-seg` for elapsed (2 fields), a new compact `.ap-mini` 2-button
  toggle for time-card's dense per-day rows (new pattern, not yet in design-system.md).
  Iterated twice on user feedback: replaced native `<input type="time">` (confusing hidden
  AM/PM click zones, jumpy native picker) with the above; fixed time-card responsive layout
  (mobile: In/Out stay on one line via `grid-template-areas`, Break wraps below full-width;
  desktop: single "Clock in / Clock out / Break" header row replaces a per-row Break label
  so every row cell is the same height and aligns on one line — `.tc-head`); tuned mobile
  day-label-to-value gap and `#tcPayTip` advanced-note styling (16px, `rgb(181,118,31)`,
  matching the `.p-age #advOut .res-tip` treatment). WebApplication + FAQPage JSON-LD,
  `.related-calcs` (Date / Age / Percentage). Wired into nav, footer, homepage (card +
  hasPart + prose count → 31), build.js, sitemap.xml.
  **Also fixed:** `partials/header.html` + `partials/footer.html` were missing the Water
  Intake Calculator link since v83 (never added to the shared partials, only would have
  applied per-page) — added it in the same build.js run so it's now site-wide.

## Earlier (v81–v83)

- v83: Built + deployed **Water Intake Calculator** (`/water-intake-calculator/`) — roadmap #8.
  `CalcThis.initWaterCalc` in app.js, `.p-water` in style.css. Baseline **33 ml/kg/day**
  (30 for 65+), floored near the NASEM/IOM Adequate Intake, + exercise (None/Light/Moderate/
  Intense = +0/350/700/1100) + hot climate (+500) + pregnancy (+300) / breastfeeding (+700) —
  all cited to the 2005 DRI for water. Sex toggle = **Female default**; pregnancy/breastfeeding
  row only shows for Female + advanced. Output in glasses (250 ml) / litres / fl oz / cups.
  **Differentiator (Rule 8):** a stacked "what makes up your target" bar (base + activity +
  heat + pregnancy) **plus** a morning/afternoon/evening **glass illustration** (40/35/25 split,
  sun/sun/moon icons) — replaced an earlier tedious hour-by-hour list. Number was first tuned
  from 35→33 ml/kg + "Light" default → "None" default after checking it landed ~2 glasses above
  Omnicalculator / "½ body-weight in oz"; now a 68 kg no-exercise woman gets 9 glasses (2.2 L),
  in line with both. Not-medical-advice disclaimer + hyponatremia + "when to see a doctor"
  sections. WebApplication + FAQPage JSON-LD, ~13 H2s, 5 FAQs, `.related-calcs` (TDEE / Calorie
  / BMI / Macro). Wired into nav (Health, after Sleep), footer, homepage (card + hasPart +
  prose count → 30), build.js, sitemap.xml.

- v82: Shipped blog article **"How to Calculate the Number of Days Between Two Dates"**
  (`/blog/how-to-calculate-the-number-of-days-between-two-dates/`) → CTA to `/date-calculator/`.
  Two by-hand methods (count-forward; day-of-year subtraction), include-end-date (+1), weeks
  vs. calendar months, business-days shortcut (5 × weeks + leftover − weekday holidays),
  leap-year traps + why two tools disagree by a day, full worked example (4 Jul → 25 Dec 2026
  = 174 days), 5 FAQs, 2 `.blog-figure` photos. Images: `blog-days-between-{card,hero,inArticle-1,inArticle-2}.webp`.
  **New "Math & Numbers" section on the blog hub** — the Exact Age card moved out of Health &
  Lifestyle into it; hub now has 3 sections. Completes the Date/Time cluster (Age + Date, calc + article each).
  Skill fix: `calcthis-blog-article.md` now states image prompts ship as ONE message, card→hero→in-article, no pausing between.

- v81: Built + deployed **Date Calculator** (`/date-calculator/`) — roadmap #7, completes the
  Date/Time cluster with Age. `CalcThis.initDateCalc` in app.js, `.p-datecalc` in style.css.
  Two modes via a full-width `.modeseg` (**Days between** / **Add · subtract**). Differentiator
  (Rule 8) = a **live span bar** SVG: month-boundary ticks, weekend shading in business-day
  mode, a "today" marker — plus the answer given every way at once (days / weeks+days /
  y·m·d) with no unit dropdown. Advanced (between mode only) = business-days count +
  optional US-federal-holiday exclusion (11 holidays computed per year, observed-day
  shifted — no checkbox wall). Reuses the vendored vanillajs-datepicker (From/To/Start,
  prefilled today / today+90). WebApplication + FAQPage JSON-LD, 10 SEO H2s, 5 FAQs,
  `.related-calcs` (Age / Percentage / Ratio). Wired into nav (Math & Numbers, after Age),
  footer, homepage (card + hasPart + prose count → 29), build.js, sitemap.xml.
  Companion article shipped v82.

## Earlier (v73–v80)

- v80: **Card-header migration** — 16 calculators that had an inline `.seg` toggle on the
  `<h2>` title row moved to `.card-h2` + `.ctl-row`/`.ctl-lab` (title on its own line, toggle
  in a labelled "Units"/"Sex" row): BMI, Body Fat, Ideal Weight, Calorie, TDEE, One Rep Max,
  Pace, Race Time Predictor, Board Foot, Concrete, Flooring, Gravel, Mulch, Sand, Tile,
  Topsoil. No behaviour change — button ids/attrs untouched. **Female default** now applied to
  Body Fat + TDEE in app.js (Calorie + Ideal Weight already were); Body Fat `#hipFld` init
  fixed to show on load. `.row-top` kept for the 9 title-only pages (age, final-grade, gpa,
  grade, heart-rate-zone, peptide, sleep, test-score, zone-2) — never add a toggle to it.
  Both standards are in `calcthis-design-system.md`.

- v79: Shipped blog article **"How Much Should I Weigh?"** (`/blog/how-much-should-i-weigh/`)
  → CTA to `/ideal-weight-calculator/`. Healthy weight = a range not a number; BMI 18.5–24.9
  span by height (table), the 4 formulas as points inside it, frame size, "for my age",
  women vs men, when the number misleads, 5-question FAQ, 2 `.blog-figure` photos. Completes
  the Weight cluster (calc + article).

- v78: Built + deployed **Ideal Weight Calculator** (`/ideal-weight-calculator/`) —
  `CalcThis.initIdealWeightCalc` in app.js, `.p-ideal-weight` in style.css. Headline output
  is the healthy weight **range** (BMI 18.5–24.9 for the height); Robinson/Devine/Miller/Hamwi
  plotted as ticks on the same scale (differentiator: no "which of 4 numbers?" table dump).
  Advanced = current-weight marker + distance-to-range readout + body-frame target. WebApplication
  + FAQPage JSON-LD, 10 SEO H2s, `.related-calcs`. Companion article `/blog/how-much-should-i-weigh/`
  next.
- v78: **NEW global card-header standard** — `.card-h2` (title, own line) + `.ctl-row` / `.ctl-lab`
  (each toggle in a labelled row: "Units", "Sex"). Replaces `.row-top` h2+toggle, which made a
  unit toggle read as part of the calculator title. **24 pre-v78 pages still on `.row-top` —
  migration pass pending this session.**
- v78: **NEW global rule** — every health calc with a sex toggle defaults to **Female**
  (first button, `class="on"`, JS state `'female'`). Calorie already did; Ideal Weight follows;
  Body Fat / TDEE to be updated in the migration pass.

- v76–v77: **Blog image naming convention** — `blog-{article}-card.webp` /
  `-hero.webp` / `-inArticle-1.webp` (…-2, -3). Renamed the 12 v73–v75 images
  (BMI, Calorie, Age) + all refs + registry. Pre-v75 articles keep legacy names
  (do not rename). Convention is in both blog skill files.

- v75: Shipped blog article **"How to Calculate Your Exact Age"**
  (`/blog/how-to-calculate-your-exact-age/`) → CTA to `/age-calculator/`. Borrow-and-subtract
  method (day/month/year columns), worked example, age in total days/hours, leap-year + Feb 29
  edge cases, why calculators disagree by a day, 5-question FAQ, 2 `.blog-figure` photos.
  No `.u` unit spans — toggle correctly stays hidden. **Completes the BMI/Calorie/Age trio.**
- Reprioritized `calcthis-calculator-roadmap.md` around **cluster completion**:
  next = Ideal Weight (completes Weight cluster) → Pregnancy/Due Date + Ovulation (new
  vertical, **post-AdSense**, YMYL) → Date Calculator. Finance + basic/scientific calc parked
  as unwinnable.

- v74: Shipped blog article **"How Many Calories Should I Eat to Lose Weight?"**
  (`/blog/how-many-calories-to-lose-weight/`) → CTA to `/calorie-calculator/`. Calorie-deficit
  method, TDEE step (links TDEE article/calc), deficit-size table, "3,500 cal = 1 lb" caveat,
  safety floors (1,200 F / 1,500 M / cap 1%/wk), worked example, protein in a deficit,
  scale-stall guidance, 5-question FAQ, 2 `.blog-figure` photos, `.blog-pills`.
- **Age** article ("How to Calculate Your Exact Age" → `/age-calculator/`) still pending —
  last of the 3 BMI/Calorie/Age companion pieces.

- v73: Shipped blog article **"What Is BMI? How to Calculate and Interpret Your Body Mass Index"**
  (`/blog/what-is-bmi/`) → CTA to `/bmi-calculator/`. Formula (metric + imperial ×703),
  worked example, WHO categories table, colour-coded BMI scale SVG (15–40), healthy weight
  range, BMI limitations (muscle / waist / age / population / fitness), kids-and-teens note,
  4-question FAQ, `.blog-pills` cross-links.
- Added **`.blog-figure`** CSS to `style.css` (in-article contextual photo — was missing).
- Images (renamed in v76): `blog-bmi-card.webp` (800×400), `blog-bmi-hero.webp` (1400×520),
  `blog-bmi-inArticle-1.webp` + `blog-bmi-inArticle-2.webp` (800×320).
- **Hero size settled: 1400×520 (2.69:1).** `.blog-hero-art` has no `aspect-ratio` lock —
  renders the WebP's natural ratio — so 1400×520 source + `width="1400" height="520"` attrs
  just work, no CSS change. Blog skill files updated (removed the stale "ratio TBD" flag);
  in-article images confirmed 800×320.
- Still pending this session: BMI companion done; **Calorie** ("How Many Calories Should I
  Eat to Lose Weight?" → `/calorie-calculator/`) and **Age** ("How to Calculate Your Exact
  Age" → `/age-calculator/`) articles next.

## Earlier (v71–v72)

- v72: `.related-calcs` block (heading + `.pills` after the grid) — width capped to the grid's
  left column so the 4 hug-chips wrap 2×2 under the input card. **LOCKED SPEC** in
  `calcthis-design-system.md` with a DO-NOT list (no flex:1 / centering / label-shortening /
  pill-dropping / per-page overrides). `.pill` base rule is also final (inline-flex, no underline).
- Built and deployed **Calorie Calculator** (`/calorie-calculator/`) — `CalcThis.initCalorieCalc` in app.js, `.p-calorie` block in style.css
- Goal-weight framing (distinct from TDEE calc): daily calorie target for a chosen pace (gentle/moderate/fast **clickable** `#paceTable`), explicit deficit, **projected weight-loss curve** SVG with 25/50/75/100% milestone dates + goal date, protein target, maintenance anchor
- Best practice: Mifflin-St Jeor (Katch-McArdle w/ body fat %), safety floors + flags (<1200 F / <1500 M, >1%/wk), 7700 kcal/kg adaptation caveat
- Advanced: **plan by target date** (reuses the vanillajs-datepicker), body fat %, full macro split
- **Female default**; unit default order = `localStorage['ct_units']` → `prefersImperial()` (regional) → metric. Only the Calorie calc writes/reads `ct_units` so far — retrofit BMI/TDEE/BodyFat later.
- `.pill` cross-links (TDEE / Macro / BMI / Body Fat) after the grid

### Also v71 — chart + pill fixes across the site
- **12px SVG-text floor** on the BMI + Age charts (were 9–10px); viewBoxes bumped (BMI 300→308, Age 64→84)
- Calorie pace table: error flag ("below safe min") drops below a **top-aligned** number, row grows — `#paceTable td{vertical-align:top}`, `.cal-warn{display:block}`
- `.pill` is now **underline-free + inline-flex** in the BASE rule (`display:inline-flex;gap:5px;text-decoration:none` + `a.pill:hover`); removed the redundant `.p-zone2 .pill` page override
- Skill files: cross-links now **required** (`.pill` row after the grid + a contextual inline link); 12px chart-text floor; `.pill` no-underline rule

### Earlier this session (v68–v70)
- v68–v69: BMI Calculator (`/bmi-calculator/`, `initBMICalc`, `.p-bmi`) — BMI scale + marker, healthy weight range, advanced (target weight / BMI Prime / Ponderal Index); + interactive height×weight **BMI chart** (SVG, live dot, bands + legend) + "check body fat %" callout when BMI ≥ 25
- v70: Age Calculator (`/age-calculator/`, `initAgeCalc`, `.p-age`) — exact age y/m/d + seconds ticker · totals · born-weekday · next-birthday countdown · life timeline SVG · day-milestones · advanced = age on any date. **Vendored vanillajs-datepicker** (`assets/datepicker.min.{js,css}`), themed via `.datepicker-*` in style.css — type OR pick, decade year grid. Load `datepicker.min.css` BEFORE `style.css`.
- `.claude/launch.json` (`calcthis-static` — `python -m http.server 8123`) for served previews; RULES 8–9 + PRODUCT PHILOSOPHY; ≥14px text floor; **deploy gated** on the user previewing in Chrome + saying "deploy"

---

## Calculator roadmap (priority order)

Strategy = **cluster completion** (see `md-files/calcthis-calculator-roadmap.md`). Skip
finance + basic/scientific calc (unwinnable). Pregnancy/Ovulation are YMYL — build **after
AdSense approval**. Date/Time cluster (Age + Date + Time) is now complete.

1. ~~BMI Calculator~~ — ✅ shipped v68–v69
2. ~~Age Calculator~~ — ✅ shipped v70
3. ~~Calorie Calculator~~ — ✅ shipped v71
4. ~~Ideal Weight Calculator~~ — ✅ shipped v78
5. ~~Date Calculator~~ — ✅ shipped v81 (companion article pending)
6. ~~Water Intake Calculator~~ — ✅ shipped v83
7. ~~Time Calculator~~ — ✅ shipped v85 (completes Date/Time cluster)
8. ~~Steps-to-Miles Calculator~~ — ✅ shipped v100
9. ~~Protein Intake Calculator~~ — ✅ shipped v103
10. ~~Square Footage Calculator~~ — ✅ shipped v104
11. ~~Stair Calculator~~ — ✅ shipped v106
12. ~~Lean Body Mass Calculator~~ — ✅ shipped v107
13. **Pregnancy / Due Date Calculator** — big new vertical, after AdSense approval (reuse date picker)
14. **Ovulation / Fertility Calculator** — completes the Pregnancy cluster

---

## Skill files (in `md-files/`)

Read ALL relevant skill files before any build. They contain exact class names, structure patterns, and rules.

| File | Purpose |
|---|---|
| `md-files/calcthis-working-rules.md` | Behavior rules, session start protocol |
| `md-files/calcthis-workflow-rules.md` | Master workflow rules — overrides everything |
| `md-files/calcthis-new-page-checklist.md` | New calculator page structure + preview script |
| `md-files/calcthis-deploy-checklist.md` | Pre-deploy checklist |
| `md-files/calcthis-deploy-flow.md` | Deploy steps (direct commit, no zip) |
| `md-files/calcthis-nav-structure.md` | Exact header nav HTML |
| `md-files/calcthis-footer-structure.md` | Exact footer HTML |
| `md-files/calcthis-design-system.md` | Reusable components + CSS variables |
| `md-files/calcthis-calculator-roadmap.md` | Build priority list |
| `md-files/calcthis-blog-article.md` | Blog article template + workflow |
| `md-files/calcthis-blog-hub.md` | Blog hub structure + image registry |

---

## Required source files — read at session start

1. `assets/style.css`
2. `assets/app.js`
3. `partials/header.html`
4. `partials/footer.html`
5. `build.js`
6. `sitemap.xml`
7. One existing calculator or article page (structure reference)

**Read these from disk. Never guess class names, CSS variables, or structure.**

---

## Dark mode

Parked. Not an SEO factor. Estimated ~1 session when ready: sweep 52 hardcoded colors into variables, add pure neutral gray dark palette + toggle. Clean grays, no warm tones.
