# SEO checklist — every page, every build (written 2026-10-31, user: "fully optimized to SEO, all the metadata, for ALL pages")

**Applied automatically by `build.js` → `seoStamp()` on every page in `PAGES` (idempotent, runs at every build):**
- `og:site_name`, `og:locale`, `og:image` (+ 1200×630 size/alt → `/assets/og-default.png`), `twitter:card=summary_large_image`, `twitter:title/description/image`.
- Title: the ` | CalcThis` suffix is dropped when the title is over 60 characters (search results cut it anyway).
- Meta description: if over 160 characters it is cut to whole sentences (console warns if it had to cut mid-sentence — then write a proper one).
- `BreadcrumbList` JSON-LD for any page without one (blog: Home > Blog > article; others: Home > page). About/Contact/Terms/Privacy get an `AboutPage`/`ContactPage`/`WebPage` JSON-LD.
- **Overrides:** `md-files/seo-meta-hand.json` `{ "/slug/": { "t": title, "d": description } }` wins over whatever a page or generator wrote (applied every build). Use it for hand-written pages.

**Rules for new pages (write them right the first time):**
1. `<title>` ≤ 60 chars, head keyword FIRST ("California Sales Tax Calculator & Rates by City 2026"), brand last or omitted.
2. Meta description 120–158 chars, starts with the main keyword / the concrete answer (e.g. "1 cm = 0.3937 in."), unique per page (never boilerplate with only a name swapped).
3. One `<h1>`; H2s that repeat the searched phrases (rate, by county, how to, formula, FAQ).
4. JSON-LD: `WebApplication` (calculators) or `BlogPosting` (articles) + `FAQPage` + `BreadcrumbList`; `dateModified`.
5. Canonical = its own URL; page in `sitemap.xml`, `llms.txt`, `build.js` PAGES, nav/footer/hub links (no orphans).
6. Images: `alt`, `width`, `height`. Internal links must exist (audit finds broken ones).
7. After deploy: IndexNow ping is automatic; request indexing in GSC (`calcthis-indexing-tracker.md`).

**Audit script idea (re-create if needed):** walk every `index.html`, check title/description length + duplicates, canonical = own URL, og/twitter tags, JSON-LD parses, one H1, in sitemap, no orphans, no broken internal links, img alt/width/height. Last full audit 2026-10-31: all clean except the `/zone-2-calculator/` redirect stub (intentional) and a few 66-char titles that are only long because of `&amp;`.
**Not done:** per-article `og:image` (all pages share the default card); lastmod in sitemap is the generation date, not tracked per page.
