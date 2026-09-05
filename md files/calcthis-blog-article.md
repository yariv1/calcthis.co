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
      <a href="/blog/">Blog</a>
      <span class="bm-sep">·</span>
      <span class="blog-meta-cat">CATEGORY</span>
      <span class="bm-sep">·</span>
      <span>N min read</span>
    </div>

    <h1>ARTICLE TITLE</h1>
    <p class="blog-lede">LEDE PARAGRAPH</p>
  </div>

  <div class="blog-content">

    <!-- Article sections: h2, h3, p, formula, blog-stat, dtable, blog-diagram, blog-checklist, faq, calc-cta, blog-pills -->
    <!-- See gravel article for full working examples of each component -->

  </div><!-- /blog-content -->

<!--FOOTER:START-->
<!--FOOTER:END-->

</div><!-- /wrap -->

<script src="/assets/app.js?v=N"></script>
<script src="/feedback.js" defer></script>
</body>
</html>
```

---

## Available content components (copy from gravel article)

| Component | Class / Element | Notes |
|---|---|---|
| Formula box | `<div class="formula">` | Math equation + `<small>` label |
| Stat blocks | `<div class="blog-stat">` with `.stat-block` + `.stat-sep` | 2 stats side by side |
| Data table | `<table class="dtable">` | thead + tbody |
| SVG diagram | `<div class="blog-diagram"><svg ...>` | Full-width |
| CTA to calculator | `<a class="calc-cta" href="/CALC/">` | Always link to the related calc |
| Checklist | `<ul class="blog-checklist">` | `<li><strong>Heading.</strong> Text.</li>` |
| FAQ accordion | `<details class="faq"><summary>Q</summary><p>A</p></details>` | |
| Cross-link pills | `<div class="blog-pills"><a class="pill" href="...">` | 2–4 pills at the end |

---

## Checklist when adding a new article

- [ ] Create `blog/SLUG/index.html` using the template above
- [ ] Add `{ file: 'blog/SLUG/index.html', slug: '/blog/SLUG/' }` to `build.js` PAGES array
- [ ] Add `<url>` entry to `sitemap.xml`
- [ ] Add article card to `blog/index.html` hub
- [ ] Copy hero image to `assets/images/blog-IMAGE-NAME-article-header.webp`
- [ ] Run `node build.js` — all pages ✓, no warnings
- [ ] Zip and deploy

---

## CSS rules that make the hero work (do not touch)

```css
.blog-hero-art {
  width: 100%;
  aspect-ratio: 1400 / 520;   /* enforces height regardless of image dimensions */
  border-radius: var(--radius);
  overflow: hidden;
  margin: 24px 0 28px;
  display: block;
  line-height: 0;
}
.blog-hero-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;           /* fills the fixed container, crops if needed */
  display: block;
}
```
