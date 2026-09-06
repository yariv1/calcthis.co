# CalcThis — Blog Hub (`blog/index.html`)

---

## ⛔ MASTER IMAGE REGISTRY — EXACT FILENAMES — NEVER GUESS

Every card and header image filename is listed here. When building or editing `blog/index.html`, use **only** these exact filenames. If a new article is added, add its image names here immediately. No exceptions.

### Construction & Gardening

| Article | Card image (`assets/images/`) | Header image (`assets/images/`) |
|---|---|---|
| How Much Gravel Do I Need for a Driveway? | `blog-gravel-driveway-article-card.webp` | `blog-gravel-driveway-article-header.webp` |
| How Much Mulch Do I Need? | `blog-mulch-calculator-article-card.webp` | `blog-mulch-calculator-article-header.webp` |
| How Much Topsoil Do I Need? | `blog-topsoil-calculator-article-card.webp` | `blog-topsoil-calculator-article-header.webp` |
| How Much Concrete Do I Need? | `blog-concrete-article-card.webp` | `blog-concrete-article-header.webp` |
| How Much Sand Do I Need? | `blog-sand-calculator-article-card.webp` | `blog-sand-article-header.webp` |

### Health & Lifestyle

| Article | Card image (`assets/images/`) | Header image (`assets/images/`) |
|---|---|---|
| How to Calculate Your Macros | `blog-macros-calculator-article-card.webp` | `blog-macros-article-header.webp` |
| What Is Zone 2 Heart Rate? | `blog-zone2-heart-rate-article-card.webp` | `blog-zone2-heart-rate-article-header.webp` |
| What Is One Rep Max? | `blog-one-rep-max-article-card.webp` | `blog-one-rep-max-article-header.webp` |

### Rules
- ❌ Never guess a filename. If it's not in this table, stop and check the actual file.
- ✅ When adding a new article, add both image filenames to this table **before** writing any HTML.
- ✅ This table is the single source of truth. The hub `<img src>` must always match exactly.

---

## ⛔ SECTION SPACING & "MORE GUIDES" RULE — MANDATORY — NEVER SKIP

Every section gets a `<p class="blog-coming">` after its grid. The FIRST section's `.blog-coming` overrides the bottom padding to 0 so the 38px margin on the next section head is exact. The LAST section's `.blog-coming` keeps the default CSS (48px bottom padding for page-end spacing).

```html
<!-- FIRST section — no margin-top needed (hero provides the gap) -->
<p class="blog-sec-head">Construction &amp; Gardening</p>
<div class="blog-grid">
  <!-- cards -->
</div>
<p class="blog-coming" style="padding:4px 0 0">More guides on the way.</p>

<!-- EVERY SUBSEQUENT section — always margin-top:38px on the section head -->
<p class="blog-sec-head" style="margin-top:38px">Health &amp; Lifestyle</p>
<div class="blog-grid">
  <!-- cards -->
</div>
<p class="blog-coming">More guides on the way.</p>  ← LAST section: no inline style, keeps 48px bottom padding

<!-- If a third section is ever added: -->
<p class="blog-sec-head" style="margin-top:38px">New Section</p>
<div class="blog-grid">
  <!-- cards -->
</div>
<p class="blog-coming">More guides on the way.</p>
```

**Rules:**
- ✅ Every section grid is followed immediately by `<p class="blog-coming">More guides on the way.</p>`
- ✅ All section heads after the first get `style="margin-top:38px"`
- ✅ Between-section `.blog-coming` elements get `style="padding:4px 0 0"` — no bottom padding
- ✅ Only the LAST `.blog-coming` on the page keeps default CSS (no inline style)
- ❌ Never put a single `.blog-coming` at the end of the entire page — one per section

---

---

## File location
`blog/index.html`

---

## Card image specs
- **Location:** `assets/images/` — already in the repo, never needs to be copied
- **Dimensions:** 800 × 400px
- **Format:** `.webp`
- **Naming:** `blog-{topic}-article-card.webp`
- **Examples:**
  - `blog-gravel-driveway-article-card.webp`
  - `blog-mulch-calculator-article-card.webp`

---

## Exact card HTML — copy this for every new article

```html
<a class="bcard" href="/blog/ARTICLE-SLUG/">
  <div class="bcard-img">
    <img
      src="/assets/images/blog-TOPIC-article-card.webp"
      alt="ALT TEXT"
      width="800"
      height="400"
      loading="lazy"
      style="width:100%;height:100%;object-fit:cover;display:block"
    >
  </div>
  <div class="bcard-body">
    <div class="bcard-tag">CATEGORY</div>
    <div class="bcard-title">ARTICLE TITLE</div>
    <div class="bcard-excerpt">One or two sentences — what the reader gets from this article.</div>
    <div class="bcard-read">
      Read guide
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </div>
  </div>
</a>
```

**Fields to fill:**
- `ARTICLE-SLUG` → full URL slug, e.g. `how-much-mulch-do-i-need`
- `blog-TOPIC-article-card.webp` → exact card image filename
- `ALT TEXT` → descriptive alt text for the card image
- `CATEGORY` → e.g. `Construction`, `Gardening`, `Health`
- `ARTICLE TITLE` → same as the article `<h1>`
- `bcard-excerpt` → 1–2 sentence summary

---

## Exact topic section structure

Each topic group has a section heading + a `blog-grid` div containing the cards.
New articles in an existing section go INSIDE its `blog-grid`, after the last card.
New sections go BELOW all existing sections, before `<p class="blog-coming">`.

```html
<p class="blog-sec-head">SECTION NAME</p>

<div class="blog-grid">

  <!-- cards go here -->

</div>
```

**Current sections (in order):**
1. `Construction &amp; Gardening`

**When adding a new section:** use `&amp;` for `&` in section names. Place it below all existing sections, above `<p class="blog-coming">More guides on the way.</p>`.

---

## JSON-LD — add an entry for every new article

Located in `<head>`. Add inside the `"blogPost": [ ]` array:

```json
{
  "@type": "BlogPosting",
  "headline": "ARTICLE TITLE",
  "url": "https://calcthis.co/blog/ARTICLE-SLUG/",
  "datePublished": "YYYY-MM-DD",
  "author": { "@type": "Organization", "name": "CalcThis" }
}
```

---

## CRITICAL — FOOTER and HEADER markers in blog/index.html

`blog/index.html` must always contain both markers for `build.js` to stamp the footer:

```html
<!--FOOTER:START-->
<!--FOOTER:END-->
```

**Never remove or overwrite `<!--FOOTER:START-->`** when editing this file. Every str_replace that touches content near the footer must include the marker in both `old_str` and `new_str`. If `build.js` warns "no FOOTER markers in blog/index.html", this marker was accidentally dropped — restore it immediately before committing.

Same rule applies to `<!--HEADER:START-->` / `<!--HEADER:END-->`.

---

## Checklist when adding a new article card

- [ ] Card image exists at `assets/images/blog-TOPIC-article-card.webp` (800×400)
- [ ] Card HTML added inside the correct `blog-grid` (existing section) or new section added below existing ones
- [ ] Both `<!--FOOTER:START-->` and `<!--FOOTER:END-->` markers still present in file after edits
- [ ] Both `<!--HEADER:START-->` and `<!--HEADER:END-->` markers still present in file after edits
- [ ] JSON-LD `blogPost` array updated with new entry
- [ ] `blog/index.html` saved and included in the deploy zip
- [ ] `node build.js` run after zip extraction

---

## Full current hub structure (for reference)

```
<div class="hero"> — page title + subtitle
<p class="blog-sec-head"> — "Construction & Gardening"
<div class="blog-grid">
  <a class="bcard"> — gravel article
  <a class="bcard"> — mulch article
</div>
<p class="blog-coming"> — "More guides on the way."
<!--FOOTER:START-->
```
