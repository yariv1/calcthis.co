# CalcThis — Design System: Reusable Components

Always use these exact patterns. Do not deviate or invent alternatives.

Also apply the product philosophy on every build:
- Research what everyone else does (99% do the same). Find the one thing we can do BETTER that gives real added value and brings users back.
- Prefer visual aids where relevant — let the user SEE the result (live bars, fills, visual feedback), not only a dry form. Outperform existing calculators.
- Do NOT overcomplicate or add things the user won't need. Value, not bloat.

---

## Go Advanced Button

ALWAYS use this exact pattern:

```html
<div class="add-row split" style="margin-top:6px">
  <span></span>
  <button class="advbtn" id="advBtn" type="button">
    <span id="advBtnLab">Go advanced</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
  </button>
</div>
```

**JS:** `advBtn.classList.toggle('open', advanced)` — CSS handles chevron rotation. Never add manual transform.
**Advanced panel:** sits ABOVE the button, hidden via `display:none`.

---

## Cross-links (.pill)

Placed outside the right card, below on mobile:

```html
<div class="pct-pills">  <!-- or page-appropriate wrapper -->
  <a class="pill" href="/calc-url/">
    <svg ...></svg>
    Calculator Name
  </a>
</div>
```

---

## Segmented Toggle (Mode Tabs)

Full-width `.modeseg`:

```html
<div class="modeseg" id="modeSeg" role="tablist">
  <button class="on" data-m="val1" role="tab" aria-selected="true">Label 1</button>
  <button data-m="val2" role="tab" aria-selected="false">Label 2</button>
</div>
```

### Scrollable tabs (4+ tabs, mobile)
Wrap `.modeseg` in a scroll container so ONLY the tab strip scrolls (never the card):

```html
<div class="pct-modeseg-wrap">
  <div class="pct-modeseg" id="modeSeg" role="tablist"> ... </div>
</div>
```
```css
.pct-modeseg-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;min-width:0;max-width:100%}
.pct-modeseg-wrap::-webkit-scrollbar{display:none}
.pct-modeseg{display:inline-flex;width:max-content;background:#F2EBDF;border:1px solid var(--line);border-radius:10px;padding:3px;gap:2px}
.pct-modeseg button{flex:none;padding:8px 16px;white-space:nowrap;...}
/* card + grid MUST allow shrink or the whole card scrolls: */
.p-PAGE .grid{min-width:0}
.p-PAGE .card.card-pad{min-width:0;max-width:100%}
@media(min-width:521px){.pct-modeseg-wrap{overflow-x:visible}.pct-modeseg{display:flex;width:100%}.pct-modeseg button{flex:1;text-align:center}}
```
On tab click: `btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})`.
A half-visible next tab is a deliberate "swipe for more" affordance — tune button padding to achieve it.
Each tab is a standalone mode with its own pane; do not nest one mode's inputs under another.

---

## Disabled Field
Wrap the entire `<label class="fld">` with an id, init `style="opacity:.4;pointer-events:none"`.
JS toggles opacity + pointer-events on the WRAPPER — never just the input.

---

## Select Field
Single `.sel` wrapper — never nest two:

```html
<label class="fld">
  <span class="lab">Label</span>
  <div class="sel"><select id="mySelect">...</select></div>
</label>
```

---

## CSS Variables (from :root — never guess, these are the set)
--paper #FBF8F3 · --card #FFFFFF · --ink #241A11 · --ink-soft #5B4C3B · --muted #8A7A66
--line #E7DECF · --amber #B5761F · --amber-deep #8F5C13 · --spruce #37503F · --spruce-soft #5A7361
--radius 14px

---

## Accessibility — Text on Colored Backgrounds

**Rule: always verify contrast before shipping. Failing AA (4.5:1) is a Google penalty risk.**

| Background | Safe text color | Notes |
|---|---|---|
| `var(--spruce)` `#37503F` | `#CAE7D3` or lighter | Never use mid-green like `#7FA88C` — fails AA badly |
| `var(--amber)` `#B5761F` | `#fff` or `#FBF8F3` | |
| `var(--amber-deep)` `#8F5C13` | `#fff` | |
| `var(--card)` `#FFFFFF` | `var(--ink)` or `var(--ink-soft)` | Always fine |
| `var(--paper)` `#FBF8F3` | `var(--ink)` or `var(--ink-soft)` | Always fine |

**VIOLATION** if any non-white/non-ink text appears on a colored background without a contrast check.

---

## Blog — Global Components

**Style recommendation:** move all `.blog-*` and `.calc-cta` CSS into `style.css` so it isn't repeated in every article's `<style>` block. Until then, copy the CSS blocks below into each new page's `<style>`.

### Body classes
- Hub page: `<body class="p-blog">`
- Article page: `<body class="p-blog-post">`

---

### Blog Hub — Section Head

Amber-underlined section divider above each category's card row.

```html
<p class="blog-sec-head">Construction</p>
```

```css
.blog-sec-head {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.blog-sec-head::after { content: ""; flex: 1; height: 1px; background: var(--line); }
```

---

### Blog Hub — Article Card Grid

3-col → 2-col → 1-col. Each card is a full `<a>` tag (no nested links).

```html
<div class="blog-grid">
  <a class="bcard" href="/blog/SLUG/">
    <div class="bcard-img">
      <!-- SVG card art (see Card Image SVG below) -->
    </div>
    <div class="bcard-body">
      <div class="bcard-tag">Category Name</div>
      <div class="bcard-title">Article Title Here</div>
      <div class="bcard-excerpt">One or two sentences. What the reader will learn or walk away with.</div>
      <div class="bcard-read">
        Read guide
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </div>
    </div>
  </a>
</div>

<p class="blog-coming">More guides on the way.</p>
```

```css
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin: 0 0 14px;
}
@media(max-width:820px) { .blog-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width:520px) { .blog-grid { grid-template-columns: 1fr; } }

.bcard {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.bcard:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(36,26,17,.06), 0 20px 48px rgba(36,26,17,.12);
  border-color: #DFD2BC;
}
.bcard-img {
  height: 168px;
  display: block;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.bcard-img svg { display: block; width: 100%; height: 100%; }
.bcard-body {
  padding: 18px 22px 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.bcard-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: var(--amber-deep);
  margin-bottom: 7px;
}
.bcard-title {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.22;
  letter-spacing: -.01em;
  color: var(--ink);
  margin-bottom: 10px;
}
.bcard-excerpt {
  font-size: 13.5px;
  color: var(--ink-soft);
  line-height: 1.55;
  flex: 1;
  margin-bottom: 16px;
}
.bcard-read {
  font-size: 13px;
  font-weight: 600;
  color: var(--amber-deep);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.bcard:hover .bcard-read svg { transform: translateX(3px); }
.bcard-read svg { transition: transform .14s ease; }

.blog-coming {
  font-size: 14px;
  color: var(--muted);
  font-style: italic;
  padding: 4px 0 48px;
}
```

---

### Card Image SVG — Conventions

Every card image is an inline SVG in `.bcard-img`. **No external image files** — art is brand-colored SVG, loads instantly, scales perfectly.

**Shell (always the same):**
```html
<div class="bcard-img">
  <svg viewBox="0 0 480 168" xmlns="http://www.w3.org/2000/svg"
       preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <!-- content here -->
  </svg>
</div>
```

**Category background gradients:**

| Category | Gradient |
|---|---|
| Construction | `#1A2B20 → #2D4633` (dark spruce) |
| Health & Fitness | `#1A2028 → #2D3346` (dark slate) |
| School & Grades | `#201A28 → #33264A` (dark plum) |
| Math & Numbers | `#201A18 → #382820` (dark ink) |

**Category watermark (always top-left):**
```svg
<text x="16" y="26" fill="rgba(255,255,255,.32)"
  font-family="Inter,sans-serif" font-size="10"
  font-weight="700" letter-spacing=".12em">CATEGORY NAME</text>
```

**Amber gravel/accent dot palette** (for Construction category):
`#B5761F` · `#C8832A` · `#8F5C13` · `#D49035`

**Measurement brackets** (use for any measurement-themed article):
```svg
<line x1="X1" y1="Y1" x2="X1" y2="Y2" stroke="rgba(181,118,31,.45)" stroke-width="1"/>
<line x1="X1m" y1="Y1" x2="X1p" y2="Y1" stroke="rgba(181,118,31,.45)" stroke-width="1"/>
<line x1="X1m" y1="Y2" x2="X1p" y2="Y2" stroke="rgba(181,118,31,.45)" stroke-width="1"/>
<text fill="rgba(181,118,31,.65)" font-family="Inter,sans-serif" font-size="11" font-weight="600">Label</text>
```

---

### Article Page — Hero Art Banner

Full-width SVG illustration directly below the header, before the H1. Height: 260px. Always has `aria-label` describing the illustration.

```html
<div class="blog-hero-art">
  <svg viewBox="0 0 700 260" xmlns="http://www.w3.org/2000/svg"
       aria-label="Description of what is illustrated">
    <!-- illustration -->
  </svg>
</div>
```

```css
.blog-hero-art {
  width: 100%;
  border-radius: var(--radius);
  overflow: hidden;
  margin: 24px 0 28px;
  display: block;
  line-height: 0;
}
.blog-hero-art svg { display: block; width: 100%; }
```

---

### Article Page — Meta Row + Back Link

```html
<a class="blog-back" href="/blog/">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6"/>
  </svg>
  Blog
</a>

<div class="blog-meta">
  <a href="/blog/">Blog</a>
  <span class="bm-sep">·</span>
  <span class="eyebrow" style="font-size:11px;letter-spacing:.07em">Category</span>
  <span class="bm-sep">·</span>
  <span>Month D, YYYY</span>
  <span class="bm-sep">·</span>
  <span>N min read</span>
</div>
```

```css
.blog-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--muted);
  text-decoration: none;
  margin-bottom: 4px;
  transition: color .12s;
}
.blog-back:hover { color: var(--amber-deep); }

.blog-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.blog-meta .bm-sep { opacity: .5; }
.blog-meta a { color: var(--amber-deep); text-decoration: none; font-weight: 600; }
.blog-meta a:hover { text-decoration: underline; }
```

---

### Article Page — Lede Paragraph

First paragraph of every article. Larger, lighter weight than body copy.

```html
<p class="blog-lede">One or two sentences. Sets up why the reader is here and what they'll get.</p>
```

```css
.blog-lede {
  font-size: 18px;
  line-height: 1.68;
  color: var(--ink-soft);
  max-width: 640px;
  margin: 0 0 6px;
  font-weight: 400;
}
```

---

### Article Page — Content Body

All article body text lives in `.blog-content`. Reuses existing site classes freely: `.formula`, `.faq`, `.dtable`, `.pill`, `.eyebrow`.

```html
<div class="blog-content">
  <h2>Section heading</h2>
  <h3>Sub-heading</h3>
  <p>Body copy…</p>
  <ul><li>…</li></ul>
</div>
```

```css
.blog-content {
  max-width: 700px;
  margin: 40px 0 64px;
}
.blog-content h2 {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -.01em;
  color: var(--ink);
  margin: 52px 0 14px;
  line-height: 1.15;
}
.blog-content h2:first-child { margin-top: 0; }
.blog-content h3 {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  font-weight: 600;
  color: var(--ink);
  margin: 32px 0 10px;
  line-height: 1.2;
}
.blog-content p {
  font-size: 16px;
  line-height: 1.8;
  color: var(--ink-soft);
  margin-bottom: 18px;
}
.blog-content ul, .blog-content ol {
  font-size: 16px;
  line-height: 1.8;
  color: var(--ink-soft);
  margin: 0 0 18px 22px;
}
.blog-content li { margin-bottom: 6px; }
.blog-content strong { color: var(--ink); font-weight: 600; }
.blog-content a { color: var(--amber-deep); text-decoration: underline; text-underline-offset: 2px; }
.blog-content a:hover { color: var(--amber); }
```

**Typography hierarchy:**
- `h2` — Fraunces 26px / 600 — major sections
- `h3` — Fraunces 19px / 600 — sub-sections within an h2
- `p` — Inter 16px / 400 / line-height 1.8
- `strong` — Inter 16px / 600 / `var(--ink)` (never colored)

---

### Stat Callout

Amber-bordered highlight for key numbers. Supports 1–3 stat blocks. **Always `align-items:flex-start`** — top-align regardless of label length.

```html
<div class="blog-stat">
  <div class="stat-block">
    <div class="stat-num">4"</div>
    <div class="stat-label">Standard depth for a single-layer driveway</div>
  </div>
  <div class="stat-sep"></div>
  <div class="stat-block">
    <div class="stat-num">10%</div>
    <div class="stat-label">Extra to order for settling and waste</div>
  </div>
</div>
```

```css
.blog-stat {
  background: #F3EADA;
  border-left: 3px solid var(--amber);
  border-radius: 0 12px 12px 0;
  padding: 20px 24px;
  margin: 28px 0;
  display: flex;
  gap: 28px;
  align-items: flex-start;   /* CRITICAL — top-align always */
  flex-wrap: wrap;
}
.stat-block { display: flex; flex-direction: column; }
.stat-num {
  font-family: 'Fraunces', serif;
  font-size: 42px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -.02em;
}
.stat-label {
  font-size: 13px;
  color: var(--ink-soft);
  font-weight: 500;
  margin-top: 4px;
  max-width: 16ch;
  line-height: 1.4;
}
.stat-sep {
  width: 1px;
  background: var(--line);
  flex-shrink: 0;
  align-self: stretch;
}
@media(max-width:520px) { .stat-sep { display: none; } }
```

---

### Inline Diagram Zone

Wrapper for any inline SVG diagram within the article body. Same border-radius treatment as hero art.

```html
<div class="blog-diagram">
  <svg viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg"
       aria-label="Description of diagram">
    <!-- layers, labels, brackets -->
  </svg>
</div>
```

```css
.blog-diagram {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin: 32px 0;
  display: block;
  line-height: 0;
}
.blog-diagram svg { display: block; width: 100%; }
```

**Cross-section diagrams — layer color palette:**

| Layer | Fill | Label text |
|---|---|---|
| Surface gravel | `#B5761F` | `rgba(255,255,255,.72)` |
| Base / compacted | `#7A4E25` | `rgba(255,255,255,.55)` |
| Subgrade / earth | `#3A1E0A` | `rgba(255,255,255,.38)` |

Dividers between layers: `stroke="rgba(255,255,255,.22)" stroke-width="1.5"`
Measurement brackets (right side): `stroke="rgba(255,255,255,.35)" stroke-width="1"`
Label font: `Inter, sans-serif` · `font-size="11"` · `font-weight="700"` · `letter-spacing=".07em"`

---

### Calculator CTA Card

Spruce-background block linking to the relevant calculator. Always the single strongest CTA on the page. Placed after the main content, before the checklist or FAQ.

**Accessibility: never use mid-tone green on spruce. Label and subtitle must use `#CAE7D3` or lighter.**

```html
<a class="calc-cta" href="/CALCULATOR-SLUG/">
  <div class="calc-cta-text">
    <div class="calc-cta-label">Free tool</div>
    <div class="calc-cta-title">Calculator Name</div>
    <div class="calc-cta-sub">One line describing what it calculates and what the user gets.</div>
  </div>
  <div class="calc-cta-btn">
    Calculate now
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  </div>
</a>
```

```css
.calc-cta {
  background: var(--spruce);
  border-radius: var(--radius);
  padding: 26px 28px;
  margin: 52px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  transition: background .15s;
}
.calc-cta:hover { background: #2D4235; }
.calc-cta-text { flex: 1; min-width: 0; }
.calc-cta-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: #CAE7D3;              /* ← accessibility-safe on spruce */
  margin-bottom: 6px;
}
.calc-cta-title {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 5px;
}
.calc-cta-sub {
  font-size: 14px;
  color: #CAE7D3;              /* ← accessibility-safe on spruce */
}
.calc-cta-btn {
  flex: none;
  background: #fff;
  color: var(--spruce);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  border: 0;
  border-radius: 10px;
  padding: 13px 22px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  transition: background .12s, color .12s;
}
.calc-cta:hover .calc-cta-btn { background: #EAF0EC; }
@media(max-width:560px) {
  .calc-cta { flex-direction: column; align-items: flex-start; }
  .calc-cta-btn { align-self: stretch; justify-content: center; }
}
```

---

### Pre-order / Action Checklist

Custom checkbox list. Used for "before you order" or "step by step" content where visual checkbox affordance adds value.

```html
<ul class="blog-checklist">
  <li><strong>Bold lead-in.</strong> Supporting sentence explaining what to do and why.</li>
  <li><strong>Another item.</strong> Keep each item actionable — one clear task per bullet.</li>
</ul>
```

```css
.blog-checklist {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
}
.blog-checklist li {
  font-size: 16px;
  line-height: 1.7;
  color: var(--ink-soft);
  padding: 10px 0 10px 36px;
  border-bottom: 1px solid var(--line);
  position: relative;
}
.blog-checklist li:last-child { border-bottom: none; }
.blog-checklist li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 14px;
  width: 18px;
  height: 18px;
  border: 2px solid var(--line);
  border-radius: 5px;
  background: #FCFAF6;
}
```

---

### Cross-links at Article Bottom

Reuses existing `.pill` class. Wrap in `.blog-pills`.

```html
<div class="blog-pills">
  <a class="pill" href="/related-calculator/">Calculator Name</a>
  <a class="pill" href="/another-calculator/">Another Calculator</a>
</div>
```

```css
.blog-pills { display: flex; flex-wrap: wrap; gap: 9px; margin: 40px 0 0; }
```

---

### JSON-LD — Blog Hub

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "CalcThis Blog",
  "url": "https://calcthis.co/blog/",
  "description": "Practical guides on construction, health, and everyday calculations.",
  "publisher": { "@type": "Organization", "name": "CalcThis", "url": "https://calcthis.co" },
  "blogPost": [
    {
      "@type": "BlogPosting",
      "headline": "Article Title",
      "url": "https://calcthis.co/blog/SLUG/",
      "datePublished": "YYYY-MM-DD",
      "author": { "@type": "Organization", "name": "CalcThis" }
    }
  ]
}
```

**Add one `blogPost` entry per article when a new post ships.**

---

### JSON-LD — Article Page

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article Title",
  "url": "https://calcthis.co/blog/SLUG/",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "author": { "@type": "Organization", "name": "CalcThis", "url": "https://calcthis.co" },
  "publisher": { "@type": "Organization", "name": "CalcThis", "url": "https://calcthis.co" },
  "description": "Meta description text.",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://calcthis.co/blog/SLUG/" }
}
```

---

### New Article Page — Checklist

1. Folder: `blog/SLUG/index.html`
2. `build.js` PAGES entry: `{ file: 'blog/SLUG/index.html', slug: '/blog/SLUG/' }`
3. `partials/header.html` — no change needed (Blog link already in nav)
4. Add `<a>` card to `blog/index.html` blog grid
5. Add `blogPost` entry to `blog/index.html` JSON-LD
6. `sitemap.xml` — add `<url>` entry
7. Preview → approve → zip → deploy
