# CalcThis — Blog Hub (`blog/index.html`)

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

## Checklist when adding a new article card

- [ ] Card image exists at `assets/images/blog-TOPIC-article-card.webp` (800×400)
- [ ] Card HTML added inside the correct `blog-grid` (existing section) or new section added below existing ones
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
