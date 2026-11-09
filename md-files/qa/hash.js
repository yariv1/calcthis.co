/* Content hash of everything that decides whether a QA pass is still valid for a calculator page:
   the page html (header/footer/asset-version stripped, they change on every build), the page's own blocks in assets/app.js,
   the page's own css rules, the page fixture, and the QA harness itself. Used by run.js (to write) and build.js + the Stop hook (to check). */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const nl = (s) => s.replace(/\r\n/g, '\n');
function block(app, name) {
  const a = app.indexOf('/* ' + name + ':BEGIN */'), b = app.indexOf('/* ' + name + ':END */');
  if (a < 0 || b < 0) return '';
  return app.slice(a, b);
}
function pageHash(root, slug) {
  const fxFile = path.join(root, 'md-files/qa/fixtures/' + slug + '.json');
  if (!fs.existsSync(fxFile)) return null;
  const fx = JSON.parse(fs.readFileSync(fxFile, 'utf8'));
  let html = nl(fs.readFileSync(path.join(root, slug + '/index.html'), 'utf8'));
  html = html.slice(html.indexOf('<body'), html.lastIndexOf('</body>')); /* head metadata is re-stamped by build.js, the body is the calculator */
  html = html.replace(/<!--HEADER:START-->[\s\S]*?<!--HEADER:END-->/, '').replace(/<!--FOOTER:START-->[\s\S]*?<!--FOOTER:END-->/, '').replace(/\?v=\d+/g, '');
  const app = nl(fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8'));
  const css = nl(fs.readFileSync(path.join(root, 'assets/style.css'), 'utf8')).split('\n').filter((l) => l.indexOf('.' + fx.bodyClass + ' ') >= 0 || l.indexOf('.' + fx.bodyClass + '{') >= 0 || l.indexOf('.' + fx.bodyClass + ',') >= 0).join('\n');
  const blocks = (fx.blocks || []).map((n) => block(app, n)).join('\n');
  const harness = nl(fs.readFileSync(path.join(root, 'md-files/qa/page-harness.js'), 'utf8')) + nl(fs.readFileSync(path.join(root, 'md-files/qa/run.js'), 'utf8'));
  const oracleFile = path.join(root, 'md-files/qa/oracles/' + slug + '.js');
  const oracle = fs.existsSync(oracleFile) ? nl(fs.readFileSync(oracleFile, 'utf8')) : '';
  return { fixture: fx, hash: sha(html + '\u0001' + blocks + '\u0001' + css + '\u0001' + nl(fs.readFileSync(fxFile, 'utf8')) + '\u0001' + oracle + '\u0001' + sha(harness)) };
}
/* is a pass record present and still valid? -> { ok, why } */
function check(root, slug) {
  const par = require('./parity.js').check(root, slug);
  if (!par.ok) return par;
  const h = pageHash(root, slug);
  if (!h) return { ok: false, why: 'no fixture md-files/qa/fixtures/' + slug + '.json' };
  const rf = path.join(root, 'md-files/qa-passes/' + slug + '.json');
  if (!fs.existsSync(rf)) return { ok: false, why: 'no QA pass record - run: node md-files/qa/run.js ' + slug };
  let rec; try { rec = JSON.parse(fs.readFileSync(rf, 'utf8')); } catch (e) { return { ok: false, why: 'unreadable pass record' }; }
  if (!rec.pass) return { ok: false, why: 'the last QA run FAILED - run: node md-files/qa/run.js ' + slug };
  if (rec.hash !== h.hash) return { ok: false, why: 'the page, its code, css, fixture, oracle or the harness changed after the last QA pass - run: node md-files/qa/run.js ' + slug };
  const shots = (rec.shots || []);
  if (shots.length < 6 || shots.some((s) => !fs.existsSync(path.join(root, s)))) return { ok: false, why: 'screenshots missing - run: node md-files/qa/run.js ' + slug };
  return { ok: true, why: '' };
}
/* calculator pages that must be gated: in the sitemap, run a CalcThis.init*() and are not grandfathered in legacy.json */
function gated(root) {
  const legacy = JSON.parse(fs.readFileSync(path.join(root, 'md-files/qa/legacy.json'), 'utf8'));
  const sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const out = [];
  for (const m of sm.matchAll(/<loc>https:\/\/calcthis\.co\/([^<]*)\/<\/loc>/g)) {
    const slug = m[1]; if (!slug || legacy.indexOf(slug) >= 0) continue;
    const f = path.join(root, slug, 'index.html'); if (!fs.existsSync(f)) continue;
    if (/<script>\s*CalcThis\.init[A-Za-z]+\(/.test(fs.readFileSync(f, 'utf8'))) out.push(slug);
  }
  return out;
}
module.exports = { pageHash, check, gated, sha };
