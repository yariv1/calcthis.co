# CalcThis — Blog Article Template

Every blog article is the same structure. Swap the content. Done.

---

## ⛔ RULE #0 — NEVER GUESS. EVER.

If ANY value is unknown — an image filename, a CSS value, a file structure, anything — **STOP immediately and ask for the answer.** Do not guess. Do not estimate. Do not reconstruct from memory. Guessing wastes the user's time and money and is completely unacceptable.

**If in doubt → STOP → ASK.**

---

## ⛔ RULE #0.5 — QA THE UNIT TOGGLE ON EVERY SINGLE ARTICLE. NO EXCEPTIONS.

This is mandatory for every article, every time, whether it ends up needing a toggle or not —
"this one obviously doesn't have units" is not an exemption, run the QA anyway:

1. Run the full Step 5.5 procedure below (Step A0 framing-unit check → Step A decide → Step B
   wrap → Step C verify, with a COMPLETE Imperial-word regex for this article's actual units)
   in order.
2. As part of Step C, run `node build.js` and confirm it completes with **zero** unit-toggle
   gate failures printed. The gate (built into `build.js`) refuses to write any file and stops
   the whole build if `.u` markup is broken — that's the mechanical backstop, but it only
   catches missing attributes and stray imperial words leaking into `data-met`. It does **not**
   catch whether a value should have been wrapped at all, or whether a conversion's numbers are
   actually correct — that's still on you to verify by hand per Step A/C.
3. Do this before Step 6 (sending preview links) on every article, not just ones that "seem to"
   involve measurements. Skipping the QA because a topic looks unit-free is exactly the kind of
   judgment call that has already gone wrong before.

---

## ⛔ IMAGE PROMPTS — WRITE THE ARTICLE, THEN (OR ALONGSIDE) GIVE IMAGE PROMPTS

**Workflow order (locked — do not deviate session to session):**
1. Write the article HTML.
2. Give the image prompts — either in parallel with step 1 or immediately after. Never later than this.
3. Give clickable localhost preview links for the article + blog hub (see Step 6 below — never sent files, never screenshots).
4. Apply any corrections the user asks for.
5. Deploy only after the user explicitly approves.

This replaced an earlier "images always first" rule — don't revert to that.

⛔ **Deliver ALL prompts in ONE message** — card, then hero, then each in-article, in that
order, in a single reply. Do NOT drip them one per turn or wait for the user between prompts,
even if the user's phrasing ("one at a time", "one by one") seems to ask for that — it means
"one prompt per image", not "one message per prompt". The user generates all the images from
that one message and drops the finished `.webp` files in together.

### ⛔ IMAGES MUST BE IN CONTEXT — NOT ATMOSPHERE

Every image has to depict something the article actually explains — a measurement being taken,
the specific method, the thing being calculated, a real worked scenario. **No generic mood /
lifestyle / "vibe" shots.** If the prompt could sit on any fitness or DIY blog, it's wrong —
rewrite it to show the article's actual subject.

### Every new article needs (minimum):

| Image | Purpose | Filename (v75+) | Dimensions | Export |
|---|---|---|---|---|
| **Card** | blog hub grid | `blog-{article}-card.webp` | **800 × 400 px** | WebP |
| **Hero** | top of the article | `blog-{article}-hero.webp` | **1400 × 520 px** (2.69:1) | WebP |
| **In-article ×1 (prefer 2–3)** | inside `.blog-content`, next to the section it illustrates | `blog-{article}-inArticle-1.webp`, `-inArticle-2`, … | **800 × 320 px** | WebP |

`{article}` = short kebab token for the article (`bmi`, `calories-lose-weight`, `exact-age`).
Add every filename to the registry in `calcthis-blog-hub.md` in the same step. Pre-v75
articles keep their legacy names — don't rename them.

The **user supplies every image already cropped to size and in WebP** — the prompt step just
gives them the brief + exact filename + target dimensions per image. No export-spec hand-wringing.

**Hero size — SETTLED: 1400 × 520 (2.69:1).** All 12 heroes use this ratio. The live
`.blog-hero-art` CSS renders the image at its natural ratio (`width:100%` + `img{height:auto}`,
no `aspect-ratio` lock), so supplying the WebP at 1400×520 gives 2.69:1 with no CSS change.
Hero `<img>` attrs are always `width="1400" height="520"`. Card stays 800×400, in-article 800×320.

### Exact output format — always this, every time

Give the user, in this order:
1. The **exact filenames** for card, hero, and each in-article image (copy from / add to the
   master registry in `calcthis-blog-hub.md` in the SAME step)
2. One prompt per image — card, then hero, then each in-article — each labelled with filename +
   pixel dimensions + export spec
3. For every in-article prompt, note **which section of the article it sits next to**
4. **End every prompt string with `Size: WxH.`** (e.g. `Size: 1400x520.`) — right inside the
   prompt text, after the negatives, so it survives a copy-paste into ChatGPT

### ChatGPT tip (always include this)
ChatGPT's widest format is **1792×1024 (landscape)**. Always tell the user to request landscape, then crop to the final ratio in any image editor.

### People / characters — when to include

| Category | People? | Notes |
|---|---|---|
| Health & Fitness | ✅ Yes | Show a real person doing the activity — running, lifting, stretching. Makes it feel human and editorial. |
| Construction & Gardening | ❌ Usually no | Aerial/landscape shots of materials work better. Exception: if the activity is inherently human (e.g. tiling), a person's hands are fine. |

### ⛔ RANDOMIZE who's in the image, EVERY article — never the same default person

Every prompt that includes a person must specify explicit, varied physical descriptors —
**age, ethnicity, skin tone, hair color/style, build** — chosen freshly per article, not
reused from the last one. This exists because the same "young fit woman in athletic wear"
kept showing up article after article, which reads as a stock-photo default, not a real
range of people.

- **Vary across articles, not within one.** The same person can recur across the 3–4 images
  *inside* a single article (continuity is fine and often better) — the rule is not to let
  the *next* article's session default back to the same look. Actively pick something
  different from recently-shipped articles: a different ethnicity, a different hair color,
  a different age band, a different build.
- **Clothing must match the actual scene, not a fitness-brand default.** Someone cooking in
  a kitchen wears normal clothes, not leggings and a sports bra. Someone at a desk wears
  normal clothes. Reserve athletic wear for a scene that is actually a workout — running,
  lifting, walking outdoors for exercise. Don't default to "fitness clothing" just because
  the article's topic is health-adjacent (protein, calories, TDEE) when the pictured scene
  itself is just a kitchen or a desk.
- **Be specific in the prompt**, not vague — e.g. "a Black woman in her 40s with short
  natural hair, wearing a plain grey t-shirt" beats "a woman." Specificity is what actually
  produces variation; a generic prompt regresses to the same stock-photo default every time.

### ⛔ RANDOMIZE the setting too, whenever the setting is relevant — not just the person

Same failure mode, different variable: kitchens (and other settings) kept coming out as the
same generic marble-counter, bright-white space article after article. Whenever the scene
has an environment worth describing (a kitchen, a home gym, an office, a yard), vary it
explicitly and specifically, the same way the person is varied:

- Describe **counter/surface material, cabinet or wall color, style/era, and any distinguishing
  detail** (a window over the sink, open shelving, a tiled backsplash, a farmhouse vs. a
  modern condo vs. a small apartment kitchen) — don't leave it generic and let it default to
  the same look.
- Vary it **across articles**, same as the person — a different kitchen style, a different
  home, a different level of tidiness/lived-in-ness, not the same marble-and-white-cabinet
  kitchen every time.
- Only apply this where the setting is actually relevant to the scene (a kitchen for a
  cooking/meal-prep shot, a gym for a workout shot). Don't force scene-setting detail into a
  close-up food shot or a construction material close-up where there's no room/backdrop in
  frame to begin with.

### Prompt structure — always include these elements
- **Scene** — what's happening, what's in frame
- **Subject** — person (age, gender, action) OR material/object
- **Lighting** — natural, golden hour, cinematic, studio, etc.
- **Composition** — wide, close-up, aerial, ground-level, subject position
- **Style** — photorealistic, editorial fitness photography, etc.
- **Negatives** — always end with: `No text, no overlays, no logos.`
- For header: add `Clean enough to have white text overlaid on it.`

### Example output format (copy this structure exactly)

```
**Image 1 — Article Card**
Filename: `blog-{article}-card.webp` | WebP 70–75%

> [prompt — shows the article's actual subject] … No text, no overlays, no logos. Size: 800x400.

---

**Image 2 — Article Hero**
Filename: `blog-{article}-hero.webp`
Size: 1400 × 520px (2.69:1) | WebP 70–75%

> [prompt]

---

**Image 3 — In-article: <which section>**
Filename: `blog-{article}-inArticle-N.webp`
Size: 800 × 320px | WebP

> [prompt — depicts exactly what that section explains]

---
(repeat Image 3 for each in-article image, 1–3 total)

💡 In ChatGPT: request **landscape** format (1792×1024), then crop to the target ratio.
```

### ⛔ MANDATORY — update registry when new images are named

The moment image filenames are decided, **immediately add them to the master registry in `calcthis-blog-hub.md`** under the correct section. Both card and header. This happens BEFORE any HTML is written. The hub registry and the article must always match.

### ❌ What never happens
- ❌ Giving prompts without exact filenames
- ❌ Giving prompts without exact pixel dimensions on each one
- ❌ Omitting the export spec (WebP, quality %)
- ❌ Omitting people for health/fitness articles
- ❌ Including people for construction/gardening articles (unless hands-only is appropriate)
- ❌ Forgetting the ChatGPT landscape tip
- ❌ Naming images without immediately updating the master registry in `calcthis-blog-hub.md`

---

## ⛔ FULL ARTICLE WORKFLOW — MANDATORY EVERY SINGLE SESSION — NO EXCEPTIONS

Every blog article session produces all changed files, previews, and a commit. No exceptions. No manual steps. No "add this yourself". Everything ships complete.

### Step 1 — Build the article
Create `blog/SLUG/index.html` using the template below.

### Step 2 — Update `blog/index.html` (THE HUB)
- Add the new `<a class="bcard">` inside the correct section's `<div class="blog-grid">`
- Add the new entry to the JSON-LD `"blogPost": []` array in the hub `<head>`
- Verify `<!--FOOTER:START-->` and `<!--HEADER:START-->` markers are still present

### Step 3 — Update `build.js`
Add to the PAGES array:
```js
{ file: 'blog/SLUG/index.html', slug: '/blog/SLUG/' },
```

### Step 4 — Update `sitemap.xml`
Add before `</urlset>`:
```xml
<url>
  <loc>https://calcthis.co/blog/SLUG/</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### Step 5 — Build both previews
Run the preview builder script for:
1. The new article → `preview-SLUG.html`
2. The hub → `preview-hub.html`

Run sanity checks on both.

### Step 5.5 — THE UNIT TOGGLE RULE — FINAL, NOT UP FOR REINTERPRETATION

This is the whole rule, in two sentences. Nothing below adds a new rule — it only makes these
two mechanically checkable so they can never again be reinterpreted, partially applied, or
quietly relaxed:

> 1. **The toggle appears only when the article has a genuine measurement to convert.** No
>    such measurement → the toggle is hidden. Full stop — not "usually hidden," not "hidden
>    unless there's an interesting example."
> 2. **If it appears, every measurement in the article switches correctly** between Imperial
>    and Metric when clicked. No exceptions, no leftover value from the other system, no
>    mismatched math sitting next to a converted number.

This has been broken three separate times on three different articles: no toggle when one was
needed, a toggle with only some values wrapped, and a toggle triggered by a single incidental
number that never should have counted as "a measurement to convert" in the first place. All
three are the same root failure — treating this as a judgment call instead of running the fixed
procedure below. **Never skip straight to writing `.u` spans. Run this procedure, in order,
every single article, with no shortcuts:**

**Step A0 — If the article's whole subject IS a unit (a "framing unit" article), the toggle
must rewrite the narrative, not just swap numbers.** Some articles aren't just "an article that
mentions some measurements" — the entire piece is framed around one specific unit as its
subject (e.g. "How Many Steps Are in a **Mile**?", a per-inch or per-foot pricing article). For
these, Metric mode must read as a genuinely different, self-consistent narrative in the OTHER
unit — not the Imperial narrative with numbers swapped underneath the same word. Concretely:
  - The **H1 and every heading/FAQ-summary** that names the framing unit must wrap it
    (`data-imp="Mile?" data-met="Kilometer?"`), so "How Many Steps Are in a Mile?" reads
    "...in a Kilometer?" in Metric — not stay "Mile?" with only the body numbers changing.
  - Every occurrence of the bare unit word in flowing prose ("...covers a mile", "steps per
    mile") gets wrapped too, even with no adjacent number.
  - **Any number expressed "per [framing unit]" must be recalculated for the other unit, not
    reused.** "2,250 steps per mile" is NOT "2,250 steps per kilometer" — a kilometer is
    shorter, so the correct data-met is the recomputed figure (steps-per-mile × 0.621371,
    or recompute from the underlying formula directly). Reusing the same number with a
    different unit word is a silent wrong-math bug, not a cosmetic one.
  - A "formula-internal constant" is only exempt (see Step A below) if restating it in the
    other unit would require a disclaimer. A conversion constant that's ITSELF just a
    unit-of-length fact (e.g. "63,360 ÷ stride in inches" = inches-per-mile) is NOT exempt —
    it converts cleanly to "1,000 ÷ stride in metres" and must be wrapped as a dual formula.
  - When computing a table of derived values across multiple rows (e.g. steps-per-mile by
    height), compute BOTH the imperial and metric outputs independently and precisely — don't
    eyeball round or reuse a rougher mental-math value. Use a script (Bash/node) for anything
    beyond trivial arithmetic; this caught three real rounding errors (2,558→2,557 etc.) the
    first time this was done by hand.
  - Found and fixed on `blog/how-many-steps-are-in-a-mile/` (2026-09-13) after shipping with
    the H1, every heading, and every "steps per mile" figure left as bare Imperial text next
    to a metric distance table — the user caught it, twice, in different spots. This is the
    same "leave part of it unconverted next to converted numbers" failure Rule 0.5 already
    bans; a framing-unit article is just the case where "part of it" is the article's own
    voice, not only a stray number.

**Step A-minus-one — RATE/RATIO quantities (per kg, per lb, g/kg, $/sqft, etc.) are
measurements too — they do NOT get a free pass.** A rate is still a standalone quantity the
reader takes away if the same rate is commonly stated in BOTH systems in real-world use —
not just a raw weight/length/volume. The test is not "is this a simple number," it's "would a
reader in the other system phrase this differently." Protein-per-bodyweight is the concrete
example: American fitness content commonly says "~1 g of protein per lb of bodyweight," while
the rest of the world says "~2.2 g per kg" — these are the SAME fact in two genuinely
different, both-real-world-used framings, exactly like inches vs. cm. `data-imp` must be the
lb-based (or otherwise imperial-native) framing and `data-met` the kg-based one — never the
same "g/kg" figure copy-pasted into both sides.
  - **Canonical reference — copy this exactly, don't reinvent:**
    `blog/how-many-calories-to-lose-weight/index.html` and
    `blog/how-to-calculate-your-macros/index.html` both already wrap every protein-ratio
    mention correctly: `data-imp="0.7–1 g per lb of bodyweight" data-met="1.6–2.2 g per kg of
    bodyweight"`, including inside worked-example table rows (`150 lb × 0.85 g/lb` ↔
    `68 kg × 1.9 g/kg`). Before writing a single `.u` span for a rate/ratio value, open one of
    these two files and match the pattern — do not derive it from scratch.
  - Found and fixed on `blog/how-much-protein-do-i-need/` (2026-09-14) — the article was
    written entirely in g/kg language with the toggle only wrapping a single incidental body
    weight example, while every protein-per-bodyweight ratio (the lede, the goal table, the
    worked examples, the age-adjustment numbers, the meal-spacing figure, every FAQ answer)
    stayed in g/kg regardless of which button was selected. The user caught it by noticing the
    article "talks in grams/kg no matter what the toggle shows" — this is the same failure as
    Step 0.5's core rule (part of the content stays in one system next to a toggle that implies
    everything converts), just applied to a rate instead of a raw measurement. The exact same
    correct pattern already existed in two older articles and was not reused — a Never-Invent
    violation as much as a unit-toggle one. **The live calculator this article supports had the
    identical bug** (`initProteinCalc` in `assets/app.js` only ever displayed "g/kg," even when
    the user's weight input was in lb) — when a rate/ratio bug is found in an article, always
    check the calculator it's paired with for the same gap; the two are not independent code
    paths and both need fixing.
  - Not every rate needs this — VO2 max (`ml/kg/min`) has no commonly-used alternate
    imperial framing anywhere, in the US or elsewhere, so it correctly stays unwrapped on
    `blog/what-is-vo2-max/`. The test is real-world usage in both systems, not "does this
    number have a /kg in it."

**Step A — Decide if the article needs a toggle at all.** Read the finished article and list
every number that has a unit. For each one, ask: *is this a standalone physical quantity the
reader is meant to take away* (a bag weight, a board length, a distance, a temperature, a
pressure) — or is it something else? These do **NOT** count toward needing a toggle, and must
NOT be wrapped in `.u`:
  - A number that only makes sense as part of a demonstrated formula/regression whose
    coefficients are calibrated to one specific unit (e.g. the Rockport walk-test formula's
    `0.0769 × weight in lb` — the constant itself is lb-specific). **The tell:** if converting
    it honestly requires a disclaimer like "the formula still uses lb internally" — that is
    proof the number is formula-internal, not a reader-facing measurement. Don't wrap it. Leave
    it as plain text, unconverted, in whichever unit the source formula uses.
  - A named protocol/distance that functions as a proper noun, not an adjustable quantity
    (a "1-mile walk test," a "5K," a "10K" — these are the test's name, not a value the reader
    would want re-expressed in another unit).
  - A heading, image `alt` text, or a calculator-CTA blurb naming the linked tool's real inputs.

  **If after this filter zero genuine standalone measurements remain, STOP — do not add a
  toggle, do not wrap anything, do not add a `.u` class anywhere in the file.** This is a valid,
  common, and completely acceptable outcome — most articles that mention a unit in passing do
  NOT need a toggle. Needing a disclaimer to make a conversion "work" is a sign you're about to
  break rule 1 above; walk away from wrapping that value instead.

  If one or more genuine standalone measurements survive the filter, proceed to Step B.

**Step B — Wrap every surviving measurement, exhaustively, the "topsoil" way.**
`blog/how-much-topsoil-do-i-need/index.html` is the canonical reference — open it and copy its
technique exactly:
- Wrap **every single instance** of every surviving measurement in `.u`, including ones inside
  a sentence demonstrating a calculation (topsoil wraps `30 × 20 × 0.33 ÷ 27 = 7.3 cubic yards`
  as ONE span with a fully separate, self-consistent metric-equivalent equation as `data-met`
  — never word-by-word substitution into a formula that would then be mathematically wrong).
- When a sentence or worked example can't be converted number-by-number without breaking the
  arithmetic, wrap the **whole clause** as one `.u` span with a completely rewritten,
  self-consistent alternate version in `data-met` — never leave part of it as bare imperial
  text next to converted numbers, and never leave a stray imperial word (e.g. "1 foot") sitting
  inside what's supposed to be the all-metric `data-met` string.
- There is no partial-coverage option. Once Step A says the article needs a toggle, every
  surviving measurement gets wrapped — not most of them.

**Step C — Verify mechanically, not by eye. Run all three checks before sending any preview:**

```bash
grep -c 'class="u"' blog/SLUG/index.html
```
- If Step A concluded "no toggle needed," this **must be exactly 0**. Any non-zero count means
  Step A was skipped or ignored — go back and remove the wraps.
- If Step A concluded "toggle needed," this **must be greater than 0**.

Then open the preview in the Browser tool and check the toggle's actual rendered state — not
just that the button exists in the DOM (`find` returns hidden elements too):

```js
getComputedStyle(document.getElementById('unitToggle')).display
```
- Must be `"none"` when Step A said no toggle, and must NOT be `"none"` when Step A said yes.

If a toggle is present, click "Metric" for real (`.click()` via `javascript_exec`, or the
`computer` tool) and run this against the live DOM:

```js
document.body.innerText.match(/\b\w*inch\w*\b|\bfoot\b|\bfeet\b|\bmile\w*\b|\byard\w*\b|\bpound\w*\b|\blb\w*\b/gi)
```
⛔ **This word list must cover every Imperial unit word the article actually uses — inch/foot/
feet is NOT enough.** The original version of this check only scanned for inch/foot/feet and
completely missed every "mile" left in the body of `how-many-steps-are-in-a-mile` (headings,
FAQ summaries, and multiple "steps per mile" figures) — the check "passed" while the article
was still full of unconverted Imperial text. Before running this, look at what units the
article actually discusses and make sure they're all in the regex (add `\bton\w*\b`,
`\bpsi\b`, etc. as needed) — don't paste the list above without checking it's complete for
THIS article.

Every match must be manually justified as one of the Step A exceptions (heading, alt text,
protocol name, calculator-CTA description) — anything else is a bug: fix it and re-run every
check in Step C from the top, not just the one that failed. For a framing-unit article (see
Step A0), also spot-check that headings/summaries actually reworded (not just that no bare
unit word survived) — e.g. confirm the H1 literally reads "...in a Kilometer?" in Metric, not
merely that "Mile" doesn't appear unwrapped elsewhere.

Only after all of Step C passes does Step 6 (send the clickable links) happen.

### Step 6 — Present previews for approval

⛔ **Always as clickable localhost links, never as sent/attached files, never as screenshots.**
Serve the two preview files on a local static server (start one on a free port if the
`calcthis-static` port is already in use by another session) and give plain markdown links
the user can click straight into their own Chrome, e.g.:
- `http://localhost:PORT/preview-SLUG.html`
- `http://localhost:PORT/preview-hub.html`

Do not use SendUserFile for these. Do not screenshot the Browser pane and paste that instead —
the user opens the real link in their own browser. This is the same for every future article,
not a one-off — don't revert to a different presentation method next session.

### Step 7 — After approval
- Run `node build.js` — verify all pages ✓
- Commit with message `Blog article: ARTICLE TITLE`
- Push to main
- Update `CLAUDE.md`

---

### What NEVER happens
- ❌ Telling the user to "add this manually" to any file
- ❌ Omitting `blog/index.html` from the changes
- ❌ Presenting previews without both article + hub
- ❌ Reconstructing `blog/index.html` from scratch — always read from disk

---

## REQUIRED FILES — every blog session

Read these from disk at session start:

1. `assets/style.css`
2. `assets/app.js`
3. `partials/header.html`
4. `partials/footer.html`
5. `build.js`
6. `sitemap.xml`
7. One existing blog article (structure reference)
8. `blog/index.html` — THE HUB — always read from disk, never reconstruct

Skill files: `calcthis-blog-article.md` + `calcthis-blog-hub.md`

If `blog/index.html` is missing or unreadable — **stop and report before building anything.**

---

---

## Hero image rule — NON-NEGOTIABLE

Every article hero image renders at **1400 × 520** — always.
This is enforced in CSS via `aspect-ratio: 1400/520` + `object-fit: cover` on `.blog-hero-art`.
It does not matter what the source image's actual pixel dimensions are.
**Never touch this CSS. Never add inline height or width overrides.**

Image file goes in: `assets/images/`
Naming convention: `blog-{article}-hero.webp`

---

## Full page structure (copy this, change the content)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-7WYH4X731J"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-7WYH4X731J');
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6832331505671007" crossorigin="anonymous"></script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARTICLE TITLE | CalcThis</title>
<link rel="canonical" href="https://calcthis.co/blog/SLUG/">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<meta name="theme-color" content="#B5761F">
<meta name="description" content="DESCRIPTION">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "ARTICLE TITLE",
  "url": "https://calcthis.co/blog/SLUG/",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "author": { "@type": "Organization", "name": "CalcThis", "url": "https://calcthis.co" },
  "publisher": { "@type": "Organization", "name": "CalcThis", "url": "https://calcthis.co" },
  "description": "DESCRIPTION",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://calcthis.co/blog/SLUG/" }
}
</script>
<link rel="stylesheet" href="/assets/style.css?v=N">
<style>
/* Lightbox — diagram click-to-enlarge */
.diagram-zoomable{cursor:zoom-in;position:relative}
.diagram-zoomable::after{content:"🔍 Click to enlarge";position:absolute;bottom:10px;right:14px;font-family:Inter,sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,.55);letter-spacing:.04em;pointer-events:none}
.dg-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out;animation:dg-in .18s ease}
@keyframes dg-in{from{opacity:0}to{opacity:1}}
.dg-overlay svg{max-width:min(96vw,1100px);max-height:85vh;border-radius:10px;box-shadow:0 8px 48px rgba(0,0,0,.6);cursor:zoom-out}
.dg-close{position:fixed;top:20px;right:24px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:20px;line-height:36px;text-align:center;cursor:pointer;z-index:10000;transition:background .15s}
.dg-close:hover{background:rgba(255,255,255,.22)}
/* Unit toggle — .blog-meta flex layout only. Visual style comes from .seg in style.css */
.blog-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
</style>
</head>
<body class="p-blog-post">
<div class="wrap">

<!--HEADER:START-->
<!--HEADER:END-->

  <div class="hero" style="padding:4px 0 0">
    <div class="blog-hero-art">
      <img src="/assets/images/blog-{article}-hero.webp"
           alt="ALT TEXT"
           width="1400" height="520" loading="eager">
    </div>

    <div class="blog-meta">
      <div class="bm-left">
        <a href="/blog/">Blog</a>
        <span class="bm-sep">·</span>
        <span class="blog-meta-cat">CATEGORY</span>
        <span class="bm-sep">·</span>
        <span>N min read</span>
      </div>
      <!-- Unit toggle: always in template, JS auto-shows only when page has .u spans, hidden otherwise -->
      <div class="seg" id="unitToggle" role="group" aria-label="Unit system" style="display:none">
        <button class="on" data-unit="imp" type="button" aria-pressed="true">Imperial</button>
        <button data-unit="met" type="button" aria-pressed="false">Metric</button>
      </div>
    </div>

    <h1>ARTICLE TITLE</h1>
    <p class="blog-lede">LEDE PARAGRAPH</p>
  </div>

  <div class="blog-content">

    <!-- Article sections: h2, h3, p, formula, blog-stat, dtable, blog-diagram, blog-checklist, faq, calc-cta, blog-pills -->
    <!-- Wrap every measurement in <span class="u" data-imp="4 inches" data-met="10 cm">4 inches</span> -->

  </div><!-- /blog-content -->

<!--FOOTER:START-->
<!--FOOTER:END-->

</div><!-- /wrap -->

<script src="/assets/app.js?v=N"></script>
<script src="/feedback.js" defer></script>
<script>
/* Lightbox — runs on any .diagram-zoomable */
(function(){
  document.querySelectorAll('.diagram-zoomable').forEach(function(wrap){
    wrap.addEventListener('click',function(){
      var svg=wrap.querySelector('svg'); if(!svg)return;
      var ov=document.createElement('div'); ov.className='dg-overlay';
      var btn=document.createElement('button'); btn.className='dg-close'; btn.innerHTML='&times;'; btn.setAttribute('aria-label','Close');
      var clone=svg.cloneNode(true);
      ov.appendChild(btn); ov.appendChild(clone); document.body.appendChild(ov); document.body.style.overflow='hidden';
      function close(){document.body.removeChild(ov);document.body.style.overflow='';}
      ov.addEventListener('click',function(e){if(e.target===ov||e.target===clone)close();});
      btn.addEventListener('click',close);
      document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);}});
    });
  });
})();
/* Unit toggle — persists choice in localStorage */
(function(){
  var S='calcthis-units';
  var cur=localStorage.getItem(S)||'imp';
  function apply(u){
    cur=u; try{localStorage.setItem(S,u);}catch(e){}
    document.querySelectorAll('.u').forEach(function(el){ el.textContent=el.dataset[u]||el.dataset.imp; });
    document.querySelectorAll('.blog-meta .seg button').forEach(function(btn){
      var on=btn.dataset.unit===u; btn.classList.toggle('on',on); btn.setAttribute('aria-pressed',String(on));
    });
  }
  document.querySelectorAll('.blog-meta .seg button').forEach(function(btn){
    btn.addEventListener('click',function(){apply(btn.dataset.unit);});
  });
  apply(cur);
})();
</script>
</body>
</html>
```

---

## Unit toggle — measurement markup

Every measurement in the article body that differs between Imperial and Metric MUST be wrapped:

```html
<span class="u" data-imp="4 inches" data-met="10 cm">4 inches</span>
<span class="u" data-imp="6 ft" data-met="1.8 m">6 ft</span>
<span class="u" data-imp="1.4 yd³" data-met="1.1 m³">1.4 yd³</span>
<span class="u" data-imp="3,000 PSI" data-met="21 MPa">3,000 PSI</span>
```

The JS reads `data-imp` / `data-met` and swaps `textContent` on toggle.
`localStorage` key `calcthis-units` persists the choice across all articles.

**Common conversions:**

| Imperial | Metric |
|---|---|
| 1 inch | 2.54 cm |
| 1 foot | 0.3 m |
| 1 yard | 0.91 m |
| 1 cubic yard | 0.76 m³ |
| 1 short ton | 0.91 metric tonne |
| 60 lb bag | 27 kg bag |
| 80 lb bag | 36 kg bag |
| 1 cubic foot | 28 L |
| 2,500 PSI | 17 MPa |
| 3,000 PSI | 21 MPa |
| 4,000 PSI | 28 MPa |
| 5,000 PSI | 35 MPa |

---

## SVG cross-section diagrams — MANDATORY rules

### viewBox and rect width — NON-NEGOTIABLE

**Always use `viewBox="0 0 740 HEIGHT"`** — the extra 40px right of the 700px content area gives padding for the measurement brackets. **All rects and divider lines MUST extend to `width="740"`** (not 700). Failure = transparent strip on the right, broken corners.

```html
<div class="blog-diagram diagram-zoomable" title="Click to enlarge">
  <svg viewBox="0 0 740 230" xmlns="http://www.w3.org/2000/svg" aria-label="DESCRIPTION">
    <!-- Every rect: width="740" -->
    <rect x="0" y="175" width="740" height="55" fill="#3A1E0A"/>
    <rect x="0" y="80"  width="740" height="95" fill="#7A4E25"/>
    <rect x="0" y="0"   width="740" height="80" fill="#8E9396"/>
    <!-- Every divider line: x2="740" -->
    <line x1="0" y1="80"  x2="740" y2="80"  stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>
    <line x1="0" y1="175" x2="740" y2="175" stroke="rgba(255,255,255,.15)" stroke-width="1.5"/>
  </svg>
</div>
```

### Text — brightness and size

Use these exact values. The design system defaults were too dim:

| Layer | Fill opacity | font-size |
|---|---|---|
| Top layer label | `rgba(255,255,255,.95)` | `13` |
| Middle layer label | `rgba(255,255,255,.88)` | `13` |
| Bottom layer label | `rgba(255,255,255,.75)` | `13` |
| Bracket lines | `rgba(255,255,255,.6)` / `.5` | — |
| Bracket numbers | `rgba(255,255,255,.9)` / `.8` | `13` |

`letter-spacing=".06em"` · `font-weight="700"` · `font-family="Inter,sans-serif"`

### Measurement brackets — inset position

Bracket lines at **x=656**, tick marks at **x=650/662**, label text at **x=666**. Never at x=670/680 — they clip against the right edge.

```svg
<line x1="656" y1="1"  x2="656" y2="79" stroke="rgba(255,255,255,.6)" stroke-width="1"/>
<line x1="650" y1="1"  x2="662" y2="1"  stroke="rgba(255,255,255,.6)" stroke-width="1"/>
<line x1="650" y1="79" x2="662" y2="79" stroke="rgba(255,255,255,.6)" stroke-width="1"/>
<text x="666" y="44" fill="rgba(255,255,255,.9)" font-family="Inter,sans-serif" font-size="13" font-weight="700">4–6"</text>
```

---

## Preview builder script — MANDATORY exact version

Run this Python script to generate a standalone styled preview. Every step is required:

```python
import re

with open('blog/SLUG/index.html', 'r') as f: preview = f.read()
with open('assets/style.css', 'r') as f: site_css = f.read()
with open('assets/app.js', 'r') as f: app_js = f.read()
with open('partials/header.html', 'r') as f: header_html = f.read()
with open('partials/footer.html', 'r') as f: footer_html = f.read()

preview = re.sub(r'<!--HEADER:START-->.*?<!--HEADER:END-->', '<!--HEADER:START-->\n'+header_html+'\n<!--HEADER:END-->', preview, flags=re.DOTALL)
preview = re.sub(r'<!--FOOTER:START-->.*?<!--FOOTER:END-->', '<!--FOOTER:START-->\n'+footer_html+'\n<!--FOOTER:END-->', preview, flags=re.DOTALL)
preview = preview.replace('href="/assets/favicon.svg"', 'href="https://calcthis.co/assets/favicon.svg"')
preview = preview.replace('src="/assets/favicon.svg"',  'src="https://calcthis.co/assets/favicon.svg"')
preview = re.sub(r'<script async src="https://pagead2[^"]*"[^>]*></script>\n?', '', preview)
# CRITICAL: regex matches ANY ?v= value (N, 55, 56, any number) — never use string replace
preview = re.sub(r'<link rel="stylesheet" href="/assets/style\.css\?v=[^"]+">',  lambda m: '<style>\n'+site_css+'\n</style>', preview)
preview = re.sub(r'<script src="/assets/app\.js\?v=[^"]+"></script>', lambda m: '<script>\n'+app_js+'\n</script>', preview)
preview = re.sub(r'\n?<script src="/feedback\.js"[^>]*></script>', '', preview)

with open('preview.html', 'w') as f: f.write(preview)
```

**Why each step is mandatory:**
- AdSense strip: blocks page script on `file://`, calculator won't work
- CSS regex (not string replace): files may have any version number — `?v=N`, `?v=55`, `?v=56`, etc.
- style.css inlined as-is: transforming it breaks all styles
- app.js before page script: order must match source

---

## Available content components

| Component | Class / Element | Notes |
|---|---|---|
| Formula box | `<div class="formula">` | Math equation + `<small>` label |
| Stat blocks | `<div class="blog-stat">` with `.stat-block` + `.stat-sep` | 2 stats side by side |
| Data table | `<table class="dtable">` | thead + tbody |
| SVG diagram | `<div class="blog-diagram diagram-zoomable" title="Click to enlarge">` | Always zoomable, always 740-wide viewBox |
| **In-article photo** | `<figure class="blog-figure">` | Contextual `.webp`, 1–3 per article — see below |
| CTA to calculator | See exact HTML below | Always use full card structure — never a bare link |
| Checklist | `<ul class="blog-checklist">` | `<li><strong>Heading.</strong> Text.</li>` |
| FAQ accordion | `<details class="faq"><summary>Q</summary><p>A</p></details>` | |
| Cross-link pills | `<div class="blog-pills"><a class="pill" href="...">` | 2–4 pills at the end |
| Unit-swappable value | `<span class="u" data-imp="X" data-met="Y">X</span>` | Wrap every measurement |

## In-article photo — `.blog-figure`

Place each in-article image inside `.blog-content`, directly after the paragraph of the section
it illustrates. Optional caption.

```html
<figure class="blog-figure">
  <img src="/assets/images/blog-{article}-inArticle-1.webp" alt="DESCRIPTIVE ALT — what is happening"
       width="800" height="320" loading="lazy">
  <figcaption>One line tying the image to the point being made.</figcaption>
</figure>
```

CSS — **does not exist yet, add to style.css during the build** (near the other `.blog-*` rules):

```css
  .blog-figure{margin:28px 0;max-width:700px}
  .blog-figure img{width:100%;height:auto;border-radius:12px;display:block}
  .blog-figure figcaption{font-size:13px;color:var(--muted);margin-top:8px;line-height:1.5}
```

---

## Calculator CTA — EXACT HTML (never use a bare link)

```html
<a class="calc-cta" href="/CALC-SLUG/">
  <div class="calc-cta-text">
    <div class="calc-cta-label">Free Tool</div>
    <div class="calc-cta-title">CALCULATOR NAME</div>
    <div class="calc-cta-sub">ONE OR TWO SENTENCES — what it calculates and what the output includes.</div>
  </div>
  <span class="calc-cta-btn">
    Calculate now
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  </span>
</a>
```

## Unit toggle — show logic (MANDATORY in page script)

The toggle div starts `style="display:none"`. The page script MUST reveal it when `.u` spans exist. Add this block BEFORE the button click listeners:

```javascript
if(document.querySelectorAll('.u').length){
  var tog=document.getElementById('unitToggle');
  if(tog) tog.style.display='';
}
```

## Formula strong color fix (MANDATORY in `<style>` block)

`.blog-content strong` sets `color: var(--ink)` which overrides formula text on dark background. Always include:

```css
.formula strong{color:inherit}
```

---

## Checklist when adding a new article

- [ ] Image prompts FIRST — card + hero + 1–3 in-article, all in-context (not atmosphere); add every filename to the `calcthis-blog-hub.md` registry in the same step
- [ ] Hero is 1400×520 (2.69:1); card 800×400; in-article 800×320 — no ratio question needed
- [ ] Create `blog/SLUG/index.html` using the template above
- [ ] Add `{ file: 'blog/SLUG/index.html', slug: '/blog/SLUG/' }` to `build.js` PAGES array
- [ ] Add `<url>` entry to `sitemap.xml`
- [ ] Add article card to `blog/index.html` hub + JSON-LD `blogPost` entry
- [ ] Hero image `assets/images/blog-{article}-hero.webp` + `blog-{article}-card.webp` + `blog-{article}-inArticle-1.webp` (…-2, …-3)
- [ ] Add `.blog-figure` CSS to style.css if not already there
- [ ] Wrap all measurements in `<span class="u" data-imp="..." data-met="...">`
- [ ] `.related-calcs`-style cross-link: the article ends with `.blog-pills` + a `.calc-cta` to the calculator it explains
- [ ] Run preview builder script — verify styled, toggle works, diagrams zoom, images load
- [ ] Approve preview → commit → push to main → update CLAUDE.md

---

## CSS rules that make the hero work (do not touch)

```css
.blog-hero-art {
  width: 100%;
  aspect-ratio: 1400 / 520;
  border-radius: var(--radius);
  overflow: hidden;
  margin: 24px 0 28px;
  display: block;
  line-height: 0;
}
.blog-hero-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```
