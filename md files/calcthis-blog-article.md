# CalcThis — Blog Article Template

Every blog article is the same structure. Swap the content. Done.

---

## Hero image rule — NON-NEGOTIABLE

Every article hero image renders at **1400 × 520** — always.
This is enforced in CSS via `aspect-ratio: 1400/520` + `object-fit: cover` on `.blog-hero-art`.
It does not matter what the source image's actual pixel dimensions are.
**Never touch this CSS. Never add inline height or width overrides.**

Image file goes in: `assets/images/`
Naming convention: `blog-{topic}-article-header.webp`

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
      <img src="/assets/images/blog-IMAGE-NAME-article-header.webp"
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
- CSS regex (not string replace): uploaded files may have any version number — `?v=N`, `?v=55`, `?v=56`, etc.
- style.css inlined as-is: transforming it breaks all styles
- app.js before page script: order must match source

---

## Available content components (copy from concrete article)

| Component | Class / Element | Notes |
|---|---|---|
| Formula box | `<div class="formula">` | Math equation + `<small>` label |
| Stat blocks | `<div class="blog-stat">` with `.stat-block` + `.stat-sep` | 2 stats side by side |
| Data table | `<table class="dtable">` | thead + tbody |
| SVG diagram | `<div class="blog-diagram diagram-zoomable" title="Click to enlarge">` | Always zoomable, always 740-wide viewBox |
| CTA to calculator | `<a class="calc-cta" href="/CALC/">` | Always link to the related calc |
| Checklist | `<ul class="blog-checklist">` | `<li><strong>Heading.</strong> Text.</li>` |
| FAQ accordion | `<details class="faq"><summary>Q</summary><p>A</p></details>` | |
| Cross-link pills | `<div class="blog-pills"><a class="pill" href="...">` | 2–4 pills at the end |
| Unit-swappable value | `<span class="u" data-imp="X" data-met="Y">X</span>` | Wrap every measurement |

---

## Checklist when adding a new article

- [ ] Create `blog/SLUG/index.html` using the template above
- [ ] Add `{ file: 'blog/SLUG/index.html', slug: '/blog/SLUG/' }` to `build.js` PAGES array
- [ ] Add `<url>` entry to `sitemap.xml`
- [ ] Add article card to `blog/index.html` hub
- [ ] Copy hero image to `assets/images/blog-IMAGE-NAME-article-header.webp`
- [ ] Wrap all measurements in `<span class="u" data-imp="..." data-met="...">` 
- [ ] Run preview builder script above — verify styled, toggle works, diagrams zoom
- [ ] Approve preview → zip → deploy

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
