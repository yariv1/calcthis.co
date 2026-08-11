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

const HDR_RE = /<!--HEADER:START-->[\s\S]*?<!--HEADER:END-->/;
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

  // 2. cache-bust
  html = html.replace(ASSET_RE, '$1?v=' + ver);

  fs.writeFileSync(fp, html);
  changed++;
  console.log('  \u2713 ' + p.file + '  (current=' + p.slug + ')');
}

console.log('\nStamped ' + changed + ' page(s) at asset v=' + ver + (warned ? ('  [' + warned + ' warning(s)]') : ''));
