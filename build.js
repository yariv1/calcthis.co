#!/usr/bin/env node
/* CalcThis static stamp — run before every deploy.
 *
 * What it does (output stays 100% static HTML, no runtime injection):
 *   1. Injects partials/header.html into every page between the markers
 *        <!--HEADER:START-->  ...  <!--HEADER:END-->
 *      and marks the current page's nav link with class="current".
 *   2. Bumps a shared cache-bust version and rewrites every
 *        /assets/style.css?v=N  and  /assets/app.js?v=N
 *      so browsers pick up CSS/JS changes immediately.
 *
 * Run from the repo root:  node build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// slug = the page's canonical path; used to mark the current nav link.
const PAGES = [
  { file: 'index.html',                        slug: '/' },
  { file: 'board-foot-calculator/index.html',  slug: '/board-foot-calculator/' },
  { file: 'gravel-calculator/index.html',      slug: '/gravel-calculator/' },
  { file: 'sand-calculator/index.html',        slug: '/sand-calculator/' },
  { file: 'topsoil-calculator/index.html',     slug: '/topsoil-calculator/' },
  { file: 'mulch-calculator/index.html',       slug: '/mulch-calculator/' },
  { file: 'concrete-calculator/index.html',    slug: '/concrete-calculator/' },
  { file: 'flooring-calculator/index.html',    slug: '/flooring-calculator/' },
  { file: 'tile-calculator/index.html',        slug: '/tile-calculator/' },
  { file: 'pace-calculator/index.html',        slug: '/pace-calculator/' },
  { file: 'race-time-predictor/index.html',    slug: '/race-time-predictor/' },
  { file: 'heart-rate-zone-calculator/index.html', slug: '/heart-rate-zone-calculator/' },
  { file: 'body-fat-calculator/index.html',    slug: '/body-fat-calculator/' },
  { file: 'tdee-calculator/index.html',        slug: '/tdee-calculator/' },
  { file: 'one-rep-max-calculator/index.html', slug: '/one-rep-max-calculator/' },
  { file: 'sleep-calculator/index.html',       slug: '/sleep-calculator/' },
  { file: 'final-grade-calculator/index.html', slug: '/final-grade-calculator/' },
  { file: 'gpa-calculator/index.html',         slug: '/gpa-calculator/' },
  { file: 'grade-calculator/index.html',       slug: '/grade-calculator/' },
  { file: 'test-score-calculator/index.html', slug: '/test-score-calculator/' },
  // Legal & info pages
  { file: 'ratio-calculator/index.html', slug: '/ratio-calculator/' },
  { file: 'percentage-calculator/index.html', slug: '/percentage-calculator/' },
  { file: 'macro-calculator/index.html',      slug: '/macro-calculator/' },
  { file: 'about/index.html',           slug: '/about/' },
  { file: 'privacy-policy/index.html',  slug: '/privacy-policy/' },
  { file: 'terms-of-use/index.html',    slug: '/terms-of-use/' },
];

// ---- bump shared asset version ----
const verFile = path.join(ROOT, '.assetver');
let ver = 1;
try { ver = parseInt(fs.readFileSync(verFile, 'utf8').trim(), 10) || 1; } catch (e) {}
ver += 1;
fs.writeFileSync(verFile, String(ver));

// ---- load + prepare header partial ----
const headerRaw = fs.readFileSync(path.join(ROOT, 'partials', 'header.html'), 'utf8');

function headerFor(slug) {
  // add class="current" to the <a> whose href === slug (exact match)
  return headerRaw.replace(
    new RegExp('(<a href="' + slug.replace(/[/]/g, '\\/') + '")(>)'),
    '$1 class="current"$2'
  );
}

// ---- load footer partial ----
const footerRaw = fs.readFileSync(path.join(ROOT, 'partials', 'footer.html'), 'utf8');

const HDR_RE = /<!--HEADER:START-->[\s\S]*?<!--HEADER:END-->/;
const FTR_RE = /<!--FOOTER:START-->[\s\S]*?<!--FOOTER:END-->/;
const ASSET_RE = /(\/assets\/(?:style\.css|app\.js))(\?v=\d+)?/g;

let changed = 0, warned = 0;
for (const p of PAGES) {
  const fp = path.join(ROOT, p.file);
  let html;
  try { html = fs.readFileSync(fp, 'utf8'); }
  catch (e) { console.warn('  ! missing: ' + p.file); warned++; continue; }

  // 1. header
  if (HDR_RE.test(html)) {
    const block = '<!--HEADER:START-->\n' + headerFor(p.slug) + '  <!--HEADER:END-->';
    html = html.replace(HDR_RE, block);
  } else {
    console.warn('  ! no HEADER markers in ' + p.file + ' (skipped header stamp)');
    warned++;
  }

  // 2. footer
  if (FTR_RE.test(html)) {
    const block = '<!--FOOTER:START-->\n' + footerRaw + '<!--FOOTER:END-->';
    html = html.replace(FTR_RE, block);
  } else {
    console.warn('  ! no FOOTER markers in ' + p.file + ' (skipped footer stamp)');
    warned++;
  }

  // 3. cache-bust
  html = html.replace(ASSET_RE, '$1?v=' + ver);

  fs.writeFileSync(fp, html);
  changed++;
  console.log('  \u2713 ' + p.file + '  (current=' + p.slug + ')');
}

console.log('\nStamped ' + changed + ' page(s) at asset v=' + ver + (warned ? ('  [' + warned + ' warning(s)]') : ''));


/* ===== INDEXNOW:START ===== auto-submit all sitemap URLs to IndexNow (Bing/Yandex) ===== */
(function () {
  try {
    var fs = require('fs'), https = require('https');
    var KEY = '80b8eca625ef5ad5e2c6eead557eb625';
    var HOST = 'calcthis.co';
    var sm = fs.readFileSync('sitemap.xml', 'utf8');
    var urls = (sm.match(/<loc>([^<]+)<\/loc>/g) || []).map(function (m) {
      return m.replace(/<\/?loc>/g, '').trim();
    });
    if (!urls.length) { console.log('IndexNow: no <loc> URLs in sitemap.xml - skipped.'); return; }
    var payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: 'https://' + HOST + '/' + KEY + '.txt',
      urlList: urls
    });
    var req = https.request({
      hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(payload) }
    }, function (res) { console.log('IndexNow: submitted ' + urls.length + ' URLs -> HTTP ' + res.statusCode); res.resume(); });
    req.on('error', function (e) { console.log('IndexNow: skipped (network) - ' + e.message); });
    req.write(payload); req.end();
  } catch (e) { console.log('IndexNow: skipped - ' + e.message); }
})();
/* ===== INDEXNOW:END ===== */
