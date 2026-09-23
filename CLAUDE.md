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

**Mechanical self-check, added after the 4th violation:** before emitting ANY text block
that is not a direct question to the user or the final end-of-turn summary, stop and ask:
"is this text narrating a move I'm about to make, or reporting a result?" If it's narration
— even a single sentence like "Found it — fixing the shared runtime now" — cut it. Run the
next tool call instead. This check applies every single time text is about to be produced,
not just once at session start; a rule read once at the top of a long session is exactly
what has failed three times running.

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
   Power-user depth stays behind **Go advanced** — the default view stays minimal. Do not
   overcomplicate and do not add something the user is unlikely to actually need "just because."
   This is Rule 8 in `md-files/calcthis-workflow-rules.md` — read it in full before researching.
2. **Give a short, concise, to-the-point report** — what competitors do, what the one clear
   differentiator will be — and wait for explicit approval before writing any code.
3. **Build the calculator** only after that approval.
4. **Present a preview** for approval before any deploy.

Do not fold steps together, skip the report, or start building before approval.

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

## Project state

- **Asset version:** v116 (bumped, `node build.js` run and deployed this session)
- **Total pages:** 72 live
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

## Live blog articles (24)

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

## Live calculators (40)

### Construction & Gardening (11)
Board Foot · Gravel · Sand · Topsoil · Mulch · Concrete · Flooring · Tile · Square Footage · Tape Measure Fraction · Stair

### Health & Fitness (19)
Pace · Race Time Predictor · VO2 Max · Heart Rate Zone · Zone 2 Heart Rate · BMI · Body Fat · Ideal Weight · Lean Body Mass · Waist-to-Hip Ratio · Calorie · TDEE · One Rep Max · Sleep · Water Intake · Macro · Protein Intake · Peptide Reconstitution · Steps to Miles

### School & Grades (4)
Final Grade · GPA · Grade · Test Score

### Math & Numbers (6)
Weighted Average · Ratio · Percentage · Age · Date · Time

Total live calculators: **40**

---

## Last session (v111–v116)

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
