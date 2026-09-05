# CalcThis — New Page Checklist + Design System

## MANDATORY FIRST STEP — FILE UPLOADS
**Before writing a single line of code, confirm all 6 files are in session.**
**If ANY are missing — STOP and ask for them. Not asking is a SERIOUS VIOLATION.**
**If any OTHER file is needed for a 100% accurate build — ask for it. Not asking is a SERIOUS VIOLATION.**

Required files:
1. `assets/style.css` — source of truth for ALL class names and CSS variables
2. `assets/app.js` — shared runtime
3. `partials/header.html` — exact header HTML
4. `partials/footer.html` — exact footer HTML
5. `build.js` — how assets are processed
6. One existing working calculator page — structure reference (e.g. `race-time-predictor/index.html`)

**Never guess class names. Never guess CSS variables. Always read from the actual files.**

---

## STEP 1 — READ EXISTING PAGE FIRST
Before writing HTML, open an existing working page and extract:
- Exact `<head>` order
- Exact body structure
- Exact class names on `.fld`, `.card`, `.grid`, `.modeseg`, `.advbtn`, `.pill`
- Exact GA tag ID (`G-7WYH4X731J`)
- Exact AdSense snippet (`ca-pub-6832331505671007`)

---

## STEP 2 — HEAD (exact order, no deviation)

```html
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
<title>PAGE TITLE | CalcThis</title>
<link rel="canonical" href="https://calcthis.co/SLUG/">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<meta name="theme-color" content="#B5761F">
<meta name="description" content="...">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">{ ... }</script>
<link rel="stylesheet" href="/assets/style.css?v=N">
<style>
/* PAGE-SPECIFIC CSS ONLY HERE */
</style>
```

---

## STEP 3 — BODY STRUCTURE (exact pattern)

```html
<body class="p-PAGENAME">
<div class="wrap">
<!--HEADER:START-->
<!--HEADER:END-->

  <div class="hero">
    <div class="eyebrow">Category Name</div>
    <h1>Calculator Name</h1>
    <p>Subtitle.</p>
  </div>

  <div class="grid">
    <div class="card card-pad">
      <!-- INPUTS -->
    </div>
    <div class="card">
      <!-- RESULTS -->
    </div>
  </div>

  <!-- CROSS-LINKS (.pill) -->
  <!-- SEO CONTENT -->

</div><!-- /wrap -->

<!--FOOTER:START-->
<!--FOOTER:END-->

<script src="/assets/app.js?v=N"></script>
<script>
/* PAGE SCRIPT */
</script>
<script src="/feedback.js" defer></script>
</body>
```

CRITICAL: ALL content (hero, grid, cross-links, SEO) is inside `<div class="wrap">`.
Footer is OUTSIDE the wrap. No `<main>` tag — it does not exist in this codebase.

---

## VERIFIED CLASS NAMES / PATTERNS
- Field wrapper: `<label class="fld">` (NOT `<div class="fld">`) — wrong element = wrong spacing
- Cards: `.card` and `.card.card-pad`
- Grid: `.grid` (2-col desktop, 1-col mobile)
- Mode tabs: `.modeseg` (grid, full-width segmented)
- Cross-links: `.pill` — never custom classes
- Advanced panel: ABOVE the `.advbtn`, hidden via `display:none` (NOT the `hidden` attribute)

---

## PREVIEW BUILD SCRIPT (run exactly, never improvise)

```python
import re
# load: page html, style.css (site_css), app.js, header.html, footer.html
preview = re.sub(r'<!--HEADER:START-->.*?<!--HEADER:END-->', '<!--HEADER:START-->\n'+header_html+'\n<!--HEADER:END-->', preview, flags=re.DOTALL)
preview = re.sub(r'<!--FOOTER:START-->.*?<!--FOOTER:END-->', '<!--FOOTER:START-->\n'+footer_html+'\n<!--FOOTER:END-->', preview, flags=re.DOTALL)
preview = preview.replace('href="/assets/favicon.svg"', 'href="https://calcthis.co/assets/favicon.svg"')
preview = preview.replace('src="/assets/favicon.svg"', 'src="https://calcthis.co/assets/favicon.svg"')
preview = re.sub(r'<script async src="https://pagead2[^"]*"[^>]*></script>\n', '', preview)  # strip AdSense
preview = preview.replace('<link rel="stylesheet" href="/assets/style.css?v=N">', '<style>\n'+site_css+'\n</style>')  # inline as-is
preview = preview.replace('<script src="/assets/app.js?v=N"></script>', '<script>\n'+app_js+'\n</script>')
preview = re.sub(r'\n<script src="/feedback\.js"[^>]*></script>', '', preview)
```

Why each step is mandatory:
- AdSense strip: without it, JS errors block the entire page script — calculator won't work
- style.css as-is: it's a valid CSS partial — transforming/dedenting breaks all styles
- app.js before page script: order must match source or functions are undefined

---

## AFTER CREATING THE FILE
1. Provide a full styled HTML preview (RULE #1 — never ship before approved preview)
2. Add page to `PAGES` array in `build.js` — `{ file: 'SLUG/index.html', slug: '/SLUG/' }`
3. Add nav link in `partials/header.html` (correct column)
4. Add footer link in `partials/footer.html` (correct pillar)
5. Homepage `index.html` — calc card + JSON-LD `hasPart` + prose count bump
6. Add URL to `sitemap.xml`
7. `node build.js` via CC -> commit -> push
8. Update nav + footer skill files

---

## VIOLATIONS — must never happen
1. Starting a build without all 6 files confirmed in session
2. Not asking for an additional file needed for an accurate build
3. Using class names not verified from the actual `style.css`
4. Using `<main>` tag — does not exist in this codebase
5. Putting content outside `<div class="wrap">`
6. Putting `<!--FOOTER:START-->` inside `</div><!-- /wrap -->`
7. Using `hidden` attribute on advPanel instead of `display:none`
8. Putting advPanel below the advbtn instead of above it
9. Inventing custom CSS classes instead of using existing ones
10. Not stripping AdSense from preview
11. Transforming or dedenting style.css before inlining
12. Shipping/delivering before a full styled preview is approved
13. Letting the user believe a functional-only preview is the real styled result
14. Asking the user to fix things caused by wrong class names or structure
