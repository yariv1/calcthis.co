/* Duplicate-content check between calculator pages (added 2026-11-06 after the user asked "will Google see these as page duplication?").
   Usage: node md-files/dup-check.js slugA slugB [slugC slugD ...]   (compares pairs: A-B, C-D, ...)
   Measures how much of each page's VISIBLE CONTENT (from <section class="content"> up to the footer; header/footer excluded because every page shares them)
   appears word for word as 8-word runs in the other page. Result 2026-11-06 for the new health pages vs the older ones: 0-2% (the only 8-10% pair was
   weight-loss vs weight-loss-percentage = the shared CDC/NHLBI source citations, fine). Rule of thumb: under ~10% = distinct pages; run it for every new page that overlaps a topic. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
const txt = (slug) => {
  let h = fs.readFileSync(ROOT + slug + '/index.html', 'utf8');
  const i = h.indexOf('<section class="content">'), j = h.indexOf('<!--FOOTER:START-->');
  h = h.slice(i < 0 ? 0 : i, j > 0 ? j : undefined);
  return h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
};
const shingles = (w, n) => { const s = new Set(); for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' ')); return s; };
const args = process.argv.slice(2);
if (args.length < 2) { console.log('usage: node md-files/dup-check.js slugA slugB [slugC slugD ...]'); process.exit(2); }
for (let k = 0; k + 1 < args.length; k += 2) {
  const A = shingles(txt(args[k]), 8), B = shingles(txt(args[k + 1]), 8); let c = 0; A.forEach((x) => { if (B.has(x)) c++; });
  console.log(args[k] + ' vs ' + args[k + 1] + ' -> ' + (c / A.size * 100).toFixed(1) + '% of ' + args[k] + ' | ' + (c / B.size * 100).toFixed(1) + '% of ' + args[k + 1]);
}
