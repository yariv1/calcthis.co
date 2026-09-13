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
  { file: 'tape-measure-fraction-calculator/index.html', slug: '/tape-measure-fraction-calculator/' },
  { file: 'pace-calculator/index.html',        slug: '/pace-calculator/' },
  { file: 'race-time-predictor/index.html',    slug: '/race-time-predictor/' },
  { file: 'vo2-max-calculator/index.html',     slug: '/vo2-max-calculator/' },
  { file: 'heart-rate-zone-calculator/index.html', slug: '/heart-rate-zone-calculator/' },
  { file: 'zone-2-heart-rate-calculator/index.html', slug: '/zone-2-heart-rate-calculator/' },
  { file: 'bmi-calculator/index.html',         slug: '/bmi-calculator/' },
  { file: 'body-fat-calculator/index.html',    slug: '/body-fat-calculator/' },
  { file: 'ideal-weight-calculator/index.html', slug: '/ideal-weight-calculator/' },
  { file: 'calorie-calculator/index.html',      slug: '/calorie-calculator/' },
  { file: 'tdee-calculator/index.html',        slug: '/tdee-calculator/' },
  { file: 'one-rep-max-calculator/index.html', slug: '/one-rep-max-calculator/' },
  { file: 'sleep-calculator/index.html',       slug: '/sleep-calculator/' },
  { file: 'water-intake-calculator/index.html', slug: '/water-intake-calculator/' },
  { file: 'final-grade-calculator/index.html', slug: '/final-grade-calculator/' },
  { file: 'gpa-calculator/index.html',         slug: '/gpa-calculator/' },
  { file: 'grade-calculator/index.html',       slug: '/grade-calculator/' },
  { file: 'test-score-calculator/index.html', slug: '/test-score-calculator/' },
  // Legal & info pages
  { file: 'ratio-calculator/index.html', slug: '/ratio-calculator/' },
  { file: 'percentage-calculator/index.html', slug: '/percentage-calculator/' },
  { file: 'age-calculator/index.html',         slug: '/age-calculator/' },
  { file: 'date-calculator/index.html',        slug: '/date-calculator/' },
  { file: 'time-calculator/index.html',        slug: '/time-calculator/' },
  { file: 'macro-calculator/index.html',      slug: '/macro-calculator/' },
  { file: 'peptide-reconstitution-calculator/index.html', slug: '/peptide-reconstitution-calculator/' },
  { file: 'blog/index.html',            slug: '/blog/' },
  { file: 'blog/how-much-gravel-do-i-need-for-a-driveway/index.html', slug: '/blog/how-much-gravel-do-i-need-for-a-driveway/' },
  { file: 'blog/how-much-mulch-do-i-need/index.html', slug: '/blog/how-much-mulch-do-i-need/' },
  { file: 'blog/how-much-topsoil-do-i-need/index.html', slug: '/blog/how-much-topsoil-do-i-need/' },
  { file: 'blog/how-much-concrete-do-i-need/index.html', slug: '/blog/how-much-concrete-do-i-need/' },
  { file: 'blog/how-much-sand-do-i-need/index.html', slug: '/blog/how-much-sand-do-i-need/' },
  { file: 'blog/how-much-flooring-do-i-need/index.html', slug: '/blog/how-much-flooring-do-i-need/' },
  { file: 'blog/how-to-calculate-your-macros/index.html', slug: '/blog/how-to-calculate-your-macros/' },
  { file: 'blog/what-is-zone-2-heart-rate/index.html',   slug: '/blog/what-is-zone-2-heart-rate/' },
  { file: 'blog/what-is-one-rep-max/index.html',         slug: '/blog/what-is-one-rep-max/' },
  { file: 'blog/how-to-calculate-your-tdee/index.html',  slug: '/blog/how-to-calculate-your-tdee/' },
  { file: 'blog/how-to-calculate-your-body-fat-percentage/index.html', slug: '/blog/how-to-calculate-your-body-fat-percentage/' },
  { file: 'blog/what-is-bmi/index.html', slug: '/blog/what-is-bmi/' },
  { file: 'blog/how-many-calories-to-lose-weight/index.html', slug: '/blog/how-many-calories-to-lose-weight/' },
  { file: 'blog/how-to-calculate-your-exact-age/index.html', slug: '/blog/how-to-calculate-your-exact-age/' },
  { file: 'blog/how-much-should-i-weigh/index.html', slug: '/blog/how-much-should-i-weigh/' },
  { file: 'blog/how-to-calculate-the-number-of-days-between-two-dates/index.html', slug: '/blog/how-to-calculate-the-number-of-days-between-two-dates/' },
  { file: 'blog/how-to-add-fractions-on-a-tape-measure/index.html', slug: '/blog/how-to-add-fractions-on-a-tape-measure/' },
  { file: 'blog/what-is-vo2-max/index.html', slug: '/blog/what-is-vo2-max/' },
  { file: 'about/index.html',           slug: '/about/' },
  { file: 'contact/index.html',         slug: '/contact/' },
  { file: 'privacy-policy/index.html',  slug: '/privacy-policy/' },
  { file: 'terms-of-use/index.html',    slug: '/terms-of-use/' },
];

// ---- MANDATORY unit-toggle gate — runs before anything else touches disk ----
// Enforces md-files/calcthis-blog-article.md Step 5.5 / Rule #0.5. This exists because
// the same mistake shipped repeatedly before anyone thought to check it in tooling
// instead of by hand. Checks, on every class="u" element in blog/*/index.html:
//   1. Both data-imp and data-met are present.
//   2. data-met never carries a leftover imperial word ("inch"/"foot"/"feet") unless
//      data-imp/data-met are a deliberately identical stated constant (e.g. "1 inch"
//      = "1 inch" next to "2.54 cm" = "2.54 cm").
//   3. For simple single-number/single-unit pairs (not ranges or compound feet+inches
//      values, which are too ambiguous to auto-check), the metric number is actually
//      the correct conversion of the imperial number (>5% off = fail), and the unit
//      families match (imperial length can't pair with a metric mass, etc).
// Any violation stops the ENTIRE build — no pages are stamped, no version bump, no
// IndexNow ping — until it's fixed. This is deliberately not a warning. It does NOT
// (and cannot) verify whether a value should have been wrapped in the first place —
// that judgment call is still Step A in the skill file, done by hand, every article.
(function checkUnitToggles() {
  const blogDir = path.join(ROOT, 'blog');
  if (!fs.existsSync(blogDir)) return;
  const failures = [];
  const IMP_WORD = /\b(inch|inches|foot|feet)\b/i;
  const TAG_RE = /<[a-zA-Z][\w-]*\b[^>]*\bclass=["'][^"']*\bu\b[^"']*["'][^>]*>/g;
  const ATTR_RE = /(data-imp|data-met)=(?:"([^"]*)"|'([^']*)')/g;

  for (const slug of fs.readdirSync(blogDir)) {
    const fp = path.join(blogDir, slug, 'index.html');
    if (!fs.existsSync(fp)) continue;
    const html = fs.readFileSync(fp, 'utf8');
    const rel = 'blog/' + slug + '/index.html';
    let m;
    while ((m = TAG_RE.exec(html))) {
      const tag = m[0];
      const attrs = {};
      let a;
      ATTR_RE.lastIndex = 0;
      while ((a = ATTR_RE.exec(tag))) attrs[a[1]] = a[2] !== undefined ? a[2] : a[3];
      if (!('data-imp' in attrs) || !('data-met' in attrs)) {
        failures.push(rel + ': a class="u" element is missing data-imp or data-met -> ' + tag.slice(0, 120));
        continue;
      }
      // A data-imp/data-met pair that's deliberately identical (a stated universal
      // conversion constant, e.g. "1 inch" = "1 inch" alongside "2.54 cm" = "2.54 cm")
      // is correct and intentionally non-toggling — only flag when they DIFFER and
      // the metric side still carries an imperial word, which means a real leftover.
      if (attrs['data-imp'] !== attrs['data-met'] && IMP_WORD.test(attrs['data-met'])) {
        failures.push(rel + ': data-met contains an imperial word ("inch"/"foot"/"feet") -> data-met="' + attrs['data-met'].slice(0, 140) + '"');
      }
      // Numeric sanity check — only for the SIMPLE case (one number, one recognized
      // unit, on each side). Ranges, feet+inches combos, and multi-value strings are
      // too ambiguous to safely auto-verify and are skipped here (still require the
      // manual Step A/C review) rather than risk a false failure on legitimate content.
      if (attrs['data-imp'] !== attrs['data-met']) {
        const impM = attrs['data-imp'].trim().match(/^~?\s*([\d.]+)\s*(in|inch|inches|ft|foot|feet|lb|lbs|pound|pounds|mi|mile|miles|yd|yards?)\.?$/i);
        const metM = attrs['data-met'].trim().match(/^~?\s*([\d.]+)\s*(cm|mm|km|kg|g|m|metres?|meters?)\.?$/i);
        if (impM && metM) {
          const FACTORS = { in: 2.54, inch: 2.54, inches: 2.54, ft: 30.48, foot: 30.48, feet: 30.48,
            lb: 0.453592, lbs: 0.453592, pound: 0.453592, pounds: 0.453592,
            mi: 1.609344, mile: 1.609344, miles: 1.609344, yd: 0.9144, yard: 0.9144, yards: 0.9144 };
          const TARGET_UNIT = { in: 'cm', inch: 'cm', inches: 'cm', ft: 'cm', foot: 'cm', feet: 'cm',
            lb: 'kg', lbs: 'kg', pound: 'kg', pounds: 'kg',
            mi: 'km', mile: 'km', miles: 'km', yd: 'm', yard: 'm', yards: 'm' };
          const impUnit = impM[2].toLowerCase(), metUnit = metM[2].toLowerCase().replace(/s$/, '').replace(/^metre|^meter/, 'm');
          const impVal = parseFloat(impM[1]), metVal = parseFloat(metM[1]);
          const factor = FACTORS[impUnit];
          let expectedUnit = TARGET_UNIT[impUnit];
          if (factor && expectedUnit) {
            let expected = impVal * factor;
            let actualMetUnit = metUnit;
            // allow cm<->mm when the expected unit is cm (e.g. small values reasonably shown in mm)
            if (expectedUnit === 'cm' && actualMetUnit === 'mm') expected *= 10;
            if (expectedUnit === 'm' && actualMetUnit === 'km') expected /= 1000;
            else if (expectedUnit !== actualMetUnit && !(expectedUnit === 'cm' && actualMetUnit === 'mm')) {
              // unit family mismatch entirely (e.g. lb paired with cm) — flag regardless of number
              failures.push(rel + ': unit family mismatch -> data-imp="' + attrs['data-imp'] + '" data-met="' + attrs['data-met'] + '"');
            }
            if (expected) {
              const pctOff = Math.abs(expected - metVal) / expected;
              if (pctOff > 0.05) {
                failures.push(rel + ': conversion looks wrong (off by ' + (pctOff * 100).toFixed(1) + '%) -> data-imp="' + attrs['data-imp'] + '" data-met="' + attrs['data-met'] + '" (expected ~' + expected.toFixed(2) + ' ' + actualMetUnit + ')');
              }
            }
          }
        }
      }
    }
  }

  if (failures.length) {
    console.error('\n⛔ UNIT TOGGLE GATE FAILED — build stopped, nothing was written.\n');
    failures.forEach(function (f) { console.error('  - ' + f); });
    console.error('\nSee md-files/calcthis-blog-article.md → Step 5.5. Fix every line above, then re-run node build.js.\n');
    process.exit(1);
  }
})();

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
