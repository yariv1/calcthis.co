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
  { file: 'square-footage-calculator/index.html', slug: '/square-footage-calculator/' },
  { file: 'tape-measure-fraction-calculator/index.html', slug: '/tape-measure-fraction-calculator/' },
  { file: 'stair-calculator/index.html', slug: '/stair-calculator/' },
  { file: 'pace-calculator/index.html',        slug: '/pace-calculator/' },
  { file: 'race-time-predictor/index.html',    slug: '/race-time-predictor/' },
  { file: 'vo2-max-calculator/index.html',     slug: '/vo2-max-calculator/' },
  { file: 'heart-rate-zone-calculator/index.html', slug: '/heart-rate-zone-calculator/' },
  { file: 'zone-2-heart-rate-calculator/index.html', slug: '/zone-2-heart-rate-calculator/' },
  { file: 'bmi-calculator/index.html',         slug: '/bmi-calculator/' },
  { file: 'body-fat-calculator/index.html',    slug: '/body-fat-calculator/' },
  { file: 'ideal-weight-calculator/index.html', slug: '/ideal-weight-calculator/' },
  { file: 'lean-body-mass-calculator/index.html', slug: '/lean-body-mass-calculator/' },
  { file: 'waist-to-hip-ratio-calculator/index.html', slug: '/waist-to-hip-ratio-calculator/' },
  { file: 'calorie-calculator/index.html',      slug: '/calorie-calculator/' },
  { file: 'tdee-calculator/index.html',        slug: '/tdee-calculator/' },
  { file: 'one-rep-max-calculator/index.html', slug: '/one-rep-max-calculator/' },
  { file: 'sleep-calculator/index.html',       slug: '/sleep-calculator/' },
  { file: 'water-intake-calculator/index.html', slug: '/water-intake-calculator/' },
  { file: 'final-grade-calculator/index.html', slug: '/final-grade-calculator/' },
  { file: 'gpa-calculator/index.html',         slug: '/gpa-calculator/' },
  { file: 'grade-calculator/index.html',       slug: '/grade-calculator/' },
  { file: 'test-score-calculator/index.html', slug: '/test-score-calculator/' },
  { file: 'grade-curve-calculator/index.html', slug: '/grade-curve-calculator/' },
  // Legal & info pages
  { file: 'ratio-calculator/index.html', slug: '/ratio-calculator/' },
  { file: 'weighted-average-calculator/index.html', slug: '/weighted-average-calculator/' },
  { file: 'percentage-calculator/index.html', slug: '/percentage-calculator/' },
  { file: 'age-calculator/index.html',         slug: '/age-calculator/' },
  { file: 'date-calculator/index.html',        slug: '/date-calculator/' },
  { file: 'time-calculator/index.html',        slug: '/time-calculator/' },
  { file: 'macro-calculator/index.html',      slug: '/macro-calculator/' },
  { file: 'peptide-reconstitution-calculator/index.html', slug: '/peptide-reconstitution-calculator/' },
  { file: 'steps-to-miles-calculator/index.html', slug: '/steps-to-miles-calculator/' },
  { file: 'protein-intake-calculator/index.html', slug: '/protein-intake-calculator/' },
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
  { file: 'blog/how-many-steps-are-in-a-mile/index.html', slug: '/blog/how-many-steps-are-in-a-mile/' },
  { file: 'blog/how-much-protein-do-i-need/index.html', slug: '/blog/how-much-protein-do-i-need/' },
  { file: 'blog/how-to-calculate-square-footage/index.html', slug: '/blog/how-to-calculate-square-footage/' },
  { file: 'blog/how-to-calculate-stair-rise-and-run/index.html', slug: '/blog/how-to-calculate-stair-rise-and-run/' },
  { file: 'blog/what-is-lean-body-mass/index.html', slug: '/blog/what-is-lean-body-mass/' },
  { file: 'blog/what-is-waist-to-hip-ratio/index.html', slug: '/blog/what-is-waist-to-hip-ratio/' },
  { file: 'blog/what-is-a-weighted-average/index.html', slug: '/blog/what-is-a-weighted-average/' },
  { file: 'blog/how-to-curve-grades/index.html', slug: '/blog/how-to-curve-grades/' },
  { file: 'about/index.html',           slug: '/about/' },
  { file: 'contact/index.html',         slug: '/contact/' },
  { file: 'privacy-policy/index.html',  slug: '/privacy-policy/' },
  { file: 'terms-of-use/index.html',    slug: '/terms-of-use/' },
];

// ---- MANDATORY unit-toggle gate — runs before anything else touches disk ----
// Enforces md-files/calcthis-blog-article.md Step 5.5 / Rule #0.5. This exists because
// the same mistake shipped repeatedly before anyone thought to check it in tooling
// instead of by hand — most recently 2026-09-15, when a whole reference table
// ("1 acre | 43,560 sq ft") shipped with zero .u wraps because it "looked like" it
// already covered both systems by listing several rows. It didn't: every row showed
// one fixed fact regardless of which toggle button was selected.
//
// This is a real tokenizer, not a flat regex strip. It walks blog-content tag by tag
// with a stack, so nesting (a table inside a list, a span inside a stat block, whatever
// future markup shape) is handled by true ancestry, not by hoping a lazy regex matches
// the right closing tag. It checks TWO separate things:
//
//   A. Every class="u" element (any tag) has both data-imp and data-met, data-met never
//      leaks a bare imperial word, and — for simple single-number values AND numeric
//      ranges ("4-6 inches") — the metric side is actually the correct conversion
//      (single value: >5% off fails; range: >25% off fails, since round-number ranges
//      are routinely restated as round numbers on both sides, e.g. "5-10 lb" / "2-5 kg").
//   B. Every unit-bearing number ANYWHERE in .blog-content is inside a .u element,
//      UNLESS it sits in one of exactly four structural positions — the only ones
//      Step A in the skill file allows to stay bare:
//        1. A heading (h1-h4) or <summary> (FAQ question) naming a unit without it
//           being a converted value.
//        2. Inside an <svg> — diagram label text is laid out by fixed x/y coordinates;
//           swapping it via JS would break the diagram, and this codebase has never
//           toggled diagram text.
//        3. Inside <div class="formula"> — formula-internal constants (Step A #1).
//        4. Column 0 of a <table class="dtable"> row — the row's label/unit name
//           (e.g. "1 acre"), not a converted value (Step A #2, proper-noun-like).
//
// Verified against every live article before being enabled (2026-09-15): found and
// fixed 11 genuine pre-existing gaps this way, then re-ran until it hit zero failures
// on the whole site, twice, including a deliberate sabotage test (stripped a real .u
// wrap back out of the square-footage table) to confirm the tokenizer actually catches
// the failure shape it's meant to catch, not just pass silently.
//
// Any violation stops the ENTIRE build — no pages are stamped, no version bump, no
// IndexNow ping — until it's fixed. This is deliberately not a warning. It does NOT
// (and cannot) verify whether a value should have been wrapped in the first place —
// that judgment call is still Step A in the skill file, done by hand, every article.
(function checkUnitToggles() {
  const blogDir = path.join(ROOT, 'blog');
  if (!fs.existsSync(blogDir)) return;
  const failures = [];
  const IMP_WORD = /\b(inch|inches|foot|feet|mile|miles|yard|yards|pound|pounds|lb|lbs|ton|tons)\b/i;
  const SPAN_RE = /<[a-zA-Z][\w-]*\b[^>]*\bclass=["'][^"']*\bu\b[^"']*["'][^>]*>/g;
  const ATTR_RE = /(data-imp|data-met)=(?:"([^"]*)"|'([^']*)')/g;
  const UNIT_RE = /\d[\d,.]*\s*(?:sq\s?ft|square\s+f(?:oot|eet)|ft²|feet|foot|inch(?:es)?|yards?|acres?|miles?|lbs?|pounds?|tons?|psi|sq\s?yd|cubic\s+yards?|yd³|m²|sq\s?m(?:etre|eter)?s?|square\s+met(?:re|er)s?|cm|mm|km|kg|hectares?|m³|cubic\s+met(?:re|er)s?)\b/gi;
  const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
  const TOKEN_RE = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+/g;
  const TAGNAME_RE = /^<\/?([a-zA-Z][\w-]*)/;
  const CLASS_RE = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/;
  const FACTORS = { in: 2.54, inch: 2.54, inches: 2.54, ft: 30.48, foot: 30.48, feet: 30.48,
    lb: 0.453592, lbs: 0.453592, pound: 0.453592, pounds: 0.453592,
    mi: 1.609344, mile: 1.609344, miles: 1.609344, yd: 0.9144, yard: 0.9144, yards: 0.9144 };
  const TARGET_UNIT = { in: 'cm', inch: 'cm', inches: 'cm', ft: 'cm', foot: 'cm', feet: 'cm',
    lb: 'kg', lbs: 'kg', pound: 'kg', pounds: 'kg',
    mi: 'km', mile: 'km', miles: 'km', yd: 'm', yard: 'm', yards: 'm' };

  function hasClass(tagText, cls) {
    const m = CLASS_RE.exec(tagText);
    if (!m) return false;
    const val = m[1] !== undefined ? m[1] : m[2];
    return new RegExp('\\b' + cls + '\\b').test(val);
  }

  // Walks `body` (the .blog-content inner HTML) and returns every unit-bearing number
  // that is NOT inside one of: a .u-class element, <div class="formula">, <svg>, h1-h4,
  // <summary>, or table-column-0 — the exhaustive exemption list documented above.
  function findBareUnitText(body) {
    const tokens = body.match(TOKEN_RE) || [];
    const stack = [];
    let inDtable = 0, cellIndexInRow = -1;
    const hits = [];
    for (const tok of tokens) {
      if (tok[0] !== '<') {
        if (!stack.some(function (s) { return s.exempt; })) {
          UNIT_RE.lastIndex = 0;
          let m;
          while ((m = UNIT_RE.exec(tok))) hits.push(m[0]);
        }
        continue;
      }
      if (tok.slice(0, 4) === '<!--') continue;
      const isClose = tok[1] === '/';
      const nameM = TAGNAME_RE.exec(tok);
      const name = nameM ? nameM[1].toLowerCase() : '';
      const selfClose = /\/>\s*$/.test(tok) || VOID_TAGS.has(name);
      if (isClose) {
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].name === name) { stack.length = i; break; }
        }
        if (name === 'table' && inDtable > 0) inDtable--;
        if (name === 'tr') cellIndexInRow = -1;
      } else {
        let exempt = false;
        if (hasClass(tok, 'u')) exempt = true;
        if (name === 'div' && hasClass(tok, 'formula')) exempt = true;
        if (name === 'svg') exempt = true;
        if (/^h[1-4]$/.test(name)) exempt = true;
        if (name === 'summary') exempt = true;
        if (name === 'table' && hasClass(tok, 'dtable')) inDtable++;
        if (name === 'tr' && inDtable > 0) cellIndexInRow = 0;
        if ((name === 'td' || name === 'th') && inDtable > 0 && cellIndexInRow >= 0) {
          if (cellIndexInRow === 0) exempt = true;
          cellIndexInRow++;
        }
        if (!selfClose) stack.push({ name: name, exempt: exempt });
      }
    }
    return hits;
  }

  function checkOneNumber(impVal, impUnit, metVal, metUnit, label, rel, dataImp, dataMet, tolerance) {
    const factor = FACTORS[impUnit];
    let expectedUnit = TARGET_UNIT[impUnit];
    if (!factor || !expectedUnit) return;
    let expected = impVal * factor;
    let actualMetUnit = metUnit;
    if (expectedUnit === 'cm' && actualMetUnit === 'mm') expected *= 10;
    if (expectedUnit === 'm' && actualMetUnit === 'km') expected /= 1000;
    if (expectedUnit === 'cm' && actualMetUnit === 'm') { expected /= 100; }
    else if (expectedUnit !== actualMetUnit && !(expectedUnit === 'cm' && actualMetUnit === 'mm')) {
      failures.push(rel + ': unit family mismatch' + label + ' -> data-imp="' + dataImp + '" data-met="' + dataMet + '"');
      return;
    }
    const pctOff = Math.abs(expected - metVal) / expected;
    if (pctOff > tolerance) {
      failures.push(rel + ': conversion looks wrong' + label + ' (off by ' + (pctOff * 100).toFixed(1) + '%) -> data-imp="' + dataImp + '" data-met="' + dataMet + '" (expected ~' + expected.toFixed(2) + ' ' + actualMetUnit + ')');
    }
  }

  function checkNumericPair(dataImp, dataMet, rel) {
    const impM = dataImp.trim().match(/^~?\s*([\d.]+)\s*(in|inch|inches|ft|foot|feet|lb|lbs|pound|pounds|mi|mile|miles|yd|yards?)\.?$/i);
    const metM = dataMet.trim().match(/^~?\s*([\d.]+)\s*(cm|mm|km|kg|g|m|metres?|meters?)\.?$/i);
    if (impM && metM) {
      const impUnit = impM[2].toLowerCase();
      const metUnit = metM[2].toLowerCase().replace(/s$/, '').replace(/^metre|^meter/, 'm');
      checkOneNumber(parseFloat(impM[1]), impUnit, parseFloat(metM[1]), metUnit, '', rel, dataImp, dataMet, 0.05);
      return;
    }
    // range: "4-6 inches" vs "10-15 cm" — both endpoints checked independently, wider
    // 25% tolerance since ranges are routinely restated as round numbers on both sides.
    const rangeImpM = dataImp.trim().match(/^~?\s*([\d.]+)\s*[-–]\s*([\d.]+)\s*(in|inch|inches|ft|foot|feet|lb|lbs|pound|pounds|mi|mile|miles|yd|yards?)\+?\.?$/i);
    const rangeMetM = dataMet.trim().match(/^~?\s*([\d.]+)\s*[-–]\s*([\d.]+)\s*(cm|mm|km|kg|g|m|metres?|meters?)\+?\.?$/i);
    if (rangeImpM && rangeMetM) {
      const impUnit = rangeImpM[3].toLowerCase();
      const metUnit = rangeMetM[3].toLowerCase().replace(/s$/, '').replace(/^metre|^meter/, 'm');
      checkOneNumber(parseFloat(rangeImpM[1]), impUnit, parseFloat(rangeMetM[1]), metUnit, ' (range low)', rel, dataImp, dataMet, 0.25);
      checkOneNumber(parseFloat(rangeImpM[2]), impUnit, parseFloat(rangeMetM[2]), metUnit, ' (range high)', rel, dataImp, dataMet, 0.25);
    }
    // otherwise: too ambiguous (compound ft+in, multi-clause sentences) — skip, same as always
  }

  for (const slug of fs.readdirSync(blogDir)) {
    const fp = path.join(blogDir, slug, 'index.html');
    if (!fs.existsSync(fp)) continue;
    const html = fs.readFileSync(fp, 'utf8');
    const rel = 'blog/' + slug + '/index.html';
    let m;
    SPAN_RE.lastIndex = 0;
    while ((m = SPAN_RE.exec(html))) {
      const tag = m[0];
      const attrs = {};
      let a;
      ATTR_RE.lastIndex = 0;
      while ((a = ATTR_RE.exec(tag))) attrs[a[1]] = a[2] !== undefined ? a[2] : a[3];
      if (!('data-imp' in attrs) || !('data-met' in attrs)) {
        failures.push(rel + ': a class="u" element is missing data-imp or data-met -> ' + tag.slice(0, 120));
        continue;
      }
      if (attrs['data-imp'] !== attrs['data-met'] && IMP_WORD.test(attrs['data-met'])) {
        failures.push(rel + ': data-met contains an imperial word ("inch"/"foot"/"feet") -> data-met="' + attrs['data-met'].slice(0, 140) + '"');
      }
      if (attrs['data-imp'] !== attrs['data-met']) {
        checkNumericPair(attrs['data-imp'], attrs['data-met'], rel);
      }
    }

    const contentMatch = html.match(/<div class="blog-content">([\s\S]*?)<\/div><!-- \/blog-content -->/);
    if (contentMatch) {
      findBareUnitText(contentMatch[1]).forEach(function (hit) {
        failures.push(rel + ': unit-bearing number left outside any class="u" element -> "' + hit + '" (wrap it in .u — see calcthis-blog-article.md Step A; "it looks exempt" is not a valid reason to skip this)');
      });
    }
  }

  if (failures.length) {
    console.error('\n⛔ UNIT TOGGLE GATE FAILED — build stopped, nothing was written.\n');
    failures.forEach(function (f) { console.error('  - ' + f); });
    console.error('\nSee md-files/calcthis-blog-article.md → Step 5.5. Fix every line above, then re-run node build.js.\n');
    process.exit(1);
  }
})();

// ---- MANDATORY field-height gate — runs before anything else touches disk ----
// Enforces md-files/calcthis-design-system.md "Any .csel-btn override — height MUST match".
// `.inp input`, `.csel-btn`, and `.sel select` (every text field, custom dropdown, and native
// select on the site) all get their box height from one shared token, `var(--field-h)` in
// `:root` — never from font-size + padding math. This is a structural fix, not a guideline:
// because height comes from an explicit `height:var(--field-h)` declaration, no page-specific
// font-size or padding override can ever shrink or grow the control's height, even by accident
// — only an explicit `height:` re-declaration in style.css could, and this gate forbids that.
//
// Found 2026-09-15 on `tape-measure-fraction-calculator`: a page-specific `.csel-btn` override
// dropped `font-size` from 16px to 14px to fit a narrow column, which (before this fix) shrank
// the button's line-height and therefore its total height 3px below the sibling Feet/Inches
// inputs and the Round-to dropdown — a visible misalignment the user caught from a screenshot.
// The one-off fix (drop the font-size override) closed that single instance; this gate closes
// the whole failure class by making height structurally independent of font-size/padding.
(function checkFieldHeight() {
  const cssPath = path.join(ROOT, 'assets', 'style.css');
  if (!fs.existsSync(cssPath)) return;
  const css = fs.readFileSync(cssPath, 'utf8');
  const RULE_RE = /([^{}]+)\{([^{}]*)\}/g;
  const TARGET_RE = /(^|[\s,>+~])(\.inp\s+input|\.csel-btn|\.sel\s+select)(\b|$)/;
  const failures = [];
  let m;
  while ((m = RULE_RE.exec(css))) {
    const selector = m[1].trim();
    const body = m[2];
    if (!TARGET_RE.test(selector)) continue;
    const heightM = /height\s*:\s*([^;]+)/.exec(body);
    if (heightM && heightM[1].trim() !== 'var(--field-h)') {
      failures.push('style.css: "' + selector + '" sets height:' + heightM[1].trim() + ' — every .inp input / .csel-btn / .sel select rule must use height:var(--field-h), or not declare height at all. See calcthis-design-system.md.');
    }
  }
  if (failures.length) {
    console.error('\n⛔ FIELD-HEIGHT GATE FAILED — build stopped, nothing was written.\n');
    failures.forEach(function (f) { console.error('  - ' + f); });
    console.error('\nFix every line above, then re-run node build.js.\n');
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
