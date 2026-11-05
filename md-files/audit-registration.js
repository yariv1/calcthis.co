// Registration AUDIT for a no-ping copy build (CLAUDE.md QA item 16, HANDOFF section 000000000000000e).
// Usage: copy the repo (minus .git) into a scratch dir, strip the INDEXNOW block from build.js into build_noping.js, run it, then:
//   node md-files/audit-registration.js <copy-dir> slug1 slug2 ...      (e.g. node audit-registration.js . bsa-calculator)
// Prints AUDIT PASS or the failures. Title/description length failures on ~30 OLD pages are pre-existing; only the NEW slugs are length-checked (title <=60 after &amp; decoding, desc <=158).
const fs = require('fs'), path = require('path');
const R = path.resolve(process.argv[2] || '.') + '/';
const NEW = process.argv.slice(3);
if (!NEW.length) { console.log('give the new slugs: node audit-registration.js <dir> slug ...'); process.exit(1); }
const sm = fs.readFileSync(R + 'sitemap.xml', 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
let fails = [];
const F = (m) => fails.push(m);
console.log('sitemap urls', urls.length);
const titles = {}, descs = {};
urls.forEach((u) => {
  const p = u.replace('https://calcthis.co', '');
  const file = R + p.replace(/^\//, '') + (p.endsWith('/') ? 'index.html' : '');
  if (!fs.existsSync(file)) { F('missing file ' + p); return; }
  const h = fs.readFileSync(file, 'utf8');
  const hdr = h.slice(h.indexOf('<!--HEADER:START-->'), h.indexOf('<!--HEADER:END-->'));
  const ftr = h.slice(h.indexOf('<!--FOOTER:START-->'), h.indexOf('<!--FOOTER:END-->'));
  if (p === '/') return;
  NEW.forEach((n) => { if (!hdr.includes('href="/' + n + '/"')) F('header missing ' + n + ' on ' + p); if (!ftr.includes('href="/' + n + '/"')) F('footer missing ' + n + ' on ' + p); });
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1], d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (NEW.some((n) => p === '/' + n + '/')) { const tt = (t || '').replace(/&amp;/g, '&'); if (!t || tt.length > 60) F('title ' + p + ' ' + (t || '').length); if (!d || d.length > 158) F('desc ' + p + ' ' + (d || '').length); }
  titles[t] = (titles[t] || 0) + 1; descs[d] = (descs[d] || 0) + 1;
  if ((h.match(/<h1[ >]/g) || []).length !== 1) F('h1 count ' + p);
  if (!h.includes('<link rel="canonical" href="https://calcthis.co' + p + '"')) F('canonical ' + p);
});
Object.keys(titles).forEach((t) => { if (titles[t] > 1) F('dup title ' + t); });
Object.keys(descs).forEach((t) => { if (descs[t] > 1) F('dup desc ' + t); });
const home = fs.readFileSync(R + 'index.html', 'utf8');
const build = fs.readFileSync(R + 'build.js', 'utf8'), llms = fs.readFileSync(R + 'llms.txt', 'utf8'), seo = fs.readFileSync(R + 'md-files/seo-meta-hand.json', 'utf8');
NEW.forEach((n) => {
  const s = '/' + n + '/';
  const cards = (home.match(new RegExp('<a class="calc" href="' + s + '"', 'g')) || []).length;
  if (cards !== 1) F('home card x' + cards + ' ' + n);
  if (!home.includes('"url": "https://calcthis.co' + s + '"')) F('hasPart ' + n);
  if (!home.includes('<a href="' + s + '">')) F('about/other link ' + n);
  if (!sm.includes('<loc>https://calcthis.co' + s + '</loc>')) F('sitemap ' + n);
  if (!build.includes("slug: '" + s + "'")) F('build PAGES ' + n);
  if (!llms.includes(s)) F('llms ' + n);
  if (!seo.includes('"' + s + '"')) F('seo-meta ' + n);
  const h = fs.readFileSync(R + n + '/index.html', 'utf8');
  const lds = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1])['@type']; } catch (e) { return 'PARSEERR'; } });
  ['WebApplication', 'FAQPage', 'BreadcrumbList'].forEach((t) => { if (!lds.includes(t)) F('jsonld ' + t + ' ' + n); });
  if (lds.includes('PARSEERR')) F('jsonld parse ' + n);
  let inb = 0; urls.forEach((u) => { const p = u.replace('https://calcthis.co', ''); if (p === s) return; const file = R + p.replace(/^\//, '') + (p.endsWith('/') ? 'index.html' : ''); if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('href="' + s + '"')) inb++; });
  if (inb < 5) F('inbound ' + inb + ' ' + n);
  console.log(n, 'cards', cards, 'inbound', inb, 'ld', lds.join(','));
  if (!/og:title/.test(h) || !/twitter:title/.test(h)) F('og/twitter ' + n);
});
console.log(fails.length ? 'FAILS\n' + fails.slice(0, 30).join('\n') : 'AUDIT PASS');
