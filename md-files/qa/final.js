#!/usr/bin/env node
/* THE FINAL GATE (user hard rule, 2026-11-10: "did you QA and debug it 100%? ... the full QA and debug needs to be a gate you cant pass before handoff").
   `run.js` proves behaviour (maths vs oracle, inputs, controls, width). It does NOT prove: extreme inputs, that every number written in the page text equals what the tool shows,
   that the drawing matches the numbers, or that the finished page was compared with the competitors AFTER the build. This gate does, for every slug listed in md-files/qa/gate2.json
   (scaffold.js adds new calculators automatically):
     1. md-files/qa/text/<slug>.js  - runs in the real page (mobile + desktop context like the oracle) and returns { fails, cats: { textVsTool, extremes, visual }, } with each category >= 5 checks and 0 fails.
        textVsTool = every number quoted in the page text (lead, tables, FAQ, worked examples) re-derived by DRIVING THE TOOL and found in the page text;
        extremes   = the smallest / largest / odd values each field accepts, against an independent reference;
        visual     = what is DRAWN (chart marks, bars, positions) re-measured from the DOM and compared with the numbers.
     2. md-files/qa/sidebyside/<slug>.json - after the build, every parity competitor reopened next to the finished page: { date, competitors: [{ name, url, reopenedAfterBuild: true, gaps: [] }],
        weBeat: [..], gapsLeft: [], unverified: [ "real phone", ... ] } - date not older than the page file, gapsLeft empty, unverified non-empty (say what was NOT checked).
   Writes md-files/qa-passes/final/<slug>.json bound to the QA pass hash + the text script hash. build.js, the Stop hook and the PreToolUse hook (via hash.check) refuse to ship without it.
   Usage: node md-files/qa/final.js <slug> */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..') + '/';
const sha = (s) => require('crypto').createHash('sha1').update(s).digest('hex').slice(0, 16);

function gate2(root) { try { return JSON.parse(fs.readFileSync(path.join(root, 'md-files/qa/gate2.json'), 'utf8')); } catch (e) { return []; } }
function sidebyside(root, slug) {
  const f = path.join(root, 'md-files/qa/sidebyside/' + slug + '.json');
  if (!fs.existsSync(f)) return { ok: false, why: 'FINAL GATE: no md-files/qa/sidebyside/' + slug + '.json - reopen EVERY parity competitor next to the finished page and record it' };
  let s; try { s = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return { ok: false, why: 'FINAL GATE: unreadable sidebyside file' }; }
  const bad = (m) => ({ ok: false, why: 'FINAL GATE (sidebyside): ' + m });
  let par; try { par = JSON.parse(fs.readFileSync(path.join(root, 'md-files/qa/parity/' + slug + '.json'), 'utf8')); } catch (e) { return bad('parity file missing'); }
  const names = (par.competitors || []).map((c) => c.name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || '')) return bad('needs a date');
  const pf = path.join(root, slug + '/index.html'); const pd = fs.statSync(pf).mtime.toISOString().slice(0, 10);
  if (s.date < pd) return bad('dated ' + s.date + ' but the page changed on ' + pd + ' - reopen the competitors again after the last change');
  const got = Array.isArray(s.competitors) ? s.competitors : [];
  for (const n of names) { const c = got.filter((x) => x.name === n)[0]; if (!c) return bad('competitor "' + n + '" (from the parity file) was not compared'); if (c.reopenedAfterBuild !== true) return bad('"' + n + '" must be reopened AFTER the build (reopenedAfterBuild:true)'); if (!Array.isArray(c.gaps)) return bad('"' + n + '" needs a gaps array (empty when none)'); if (c.gaps.length) return bad('"' + n + '" still has gaps: ' + c.gaps.join(' | ')); }
  if (!Array.isArray(s.weBeat) || s.weBeat.length < 2) return bad('weBeat must list what we do better (>= 2, incl. one visual and one functional)');
  if (Array.isArray(s.gapsLeft) && s.gapsLeft.length) return bad('gapsLeft is not empty: ' + s.gapsLeft.join(' | '));
  if (!Array.isArray(s.unverified) || !s.unverified.length) return bad('unverified must list what was NOT verified (real phone, other browsers, print ...) - never "nothing"');
  return { ok: true, why: '' };
}
function check(root, slug) {
  if (gate2(root).indexOf(slug) < 0) return { ok: true, why: '' };
  const tf = path.join(root, 'md-files/qa/text/' + slug + '.js');
  if (!fs.existsSync(tf)) return { ok: false, why: 'FINAL GATE: no md-files/qa/text/' + slug + '.js (text-vs-tool, extremes, visual checks) - then run: node md-files/qa/final.js ' + slug };
  const rf = path.join(root, 'md-files/qa-passes/final/' + slug + '.json');
  if (!fs.existsSync(rf)) return { ok: false, why: 'FINAL GATE: not run - node md-files/qa/final.js ' + slug };
  let rec; try { rec = JSON.parse(fs.readFileSync(rf, 'utf8')); } catch (e) { return { ok: false, why: 'FINAL GATE: unreadable record' }; }
  if (!rec.pass) return { ok: false, why: 'FINAL GATE: the last run FAILED - node md-files/qa/final.js ' + slug };
  const H = require('./hash.js'); const h = H.pageHash(root, slug);
  let pass; try { pass = JSON.parse(fs.readFileSync(path.join(root, 'md-files/qa-passes/' + slug + '.json'), 'utf8')); } catch (e) { pass = null; }
  if (!pass || rec.passHash !== pass.hash || !h || rec.passHash !== h.hash) return { ok: false, why: 'FINAL GATE: the page / QA pass changed after the final gate - node md-files/qa/final.js ' + slug };
  if (rec.scriptHash !== sha(fs.readFileSync(tf, 'utf8').replace(/\r\n/g, '\n'))) return { ok: false, why: 'FINAL GATE: the text/extremes/visual script changed - node md-files/qa/final.js ' + slug };
  return sidebyside(root, slug);
}
module.exports = { check, gate2, sidebyside };

if (require.main === module) (async () => {
  const slug = process.argv[2]; if (!slug) { console.log('usage: node md-files/qa/final.js <slug>'); process.exit(2); }
  const R = require('./run.js'); const H = require('./hash.js');
  const tf = path.join(ROOT, 'md-files/qa/text/' + slug + '.js');
  if (!fs.existsSync(tf)) { console.log('FINAL FAIL: write md-files/qa/text/' + slug + '.js first'); process.exit(1); }
  const g = gate2(ROOT); if (g.indexOf(slug) < 0) { g.push(slug); fs.writeFileSync(path.join(ROOT, 'md-files/qa/gate2.json'), JSON.stringify(g, null, 1) + '\n'); }
  const pass = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'md-files/qa-passes/' + slug + '.json'), 'utf8')); } catch (e) { return null; } })();
  const h = H.pageHash(ROOT, slug);
  if (!pass || !pass.pass || !h || pass.hash !== h.hash) { console.log('FINAL FAIL: run a fresh  node md-files/qa/run.js ' + slug + '  first (QA PASS bound to the current page)'); process.exit(1); }
  const harness = fs.readFileSync(ROOT + 'md-files/qa/page-harness.js', 'utf8');
  const { srv, port } = await R.serve(), ch = await R.launch(); const c = ch.c; const fails = []; const cats = {}; let runs = 0;
  try {
    for (const mobile of [false, true]) {
      await R.viewport(c, mobile); await R.load(c, 'http://127.0.0.1:' + port + '/' + slug + '/');
      await c.eval(harness); await c.eval('__qa.init(' + JSON.stringify(h.fixture) + ',' + mobile + ')');
      const ctx = { mobile, set: (id, v) => c.eval('__qa.set(' + JSON.stringify(id) + ',' + JSON.stringify(String(v)) + ')'), seg: (id, v) => c.eval('__qa.seg(' + JSON.stringify(id) + ',' + JSON.stringify(String(v)) + ')'), text: (id) => c.eval('__qa.text(' + JSON.stringify(id) + ')'), val: (id) => c.eval('__qa.val(' + JSON.stringify(id) + ')'), click: (id) => c.eval('__qa.click(' + JSON.stringify(id) + ')'), eval: (e) => c.eval(e), fill: () => c.eval('__qa.fillReset()'), pageText: async () => c.eval('document.body.innerText'), pageHtml: async () => c.eval('document.documentElement.outerHTML') };
      let r; try { delete require.cache[require.resolve(tf)]; r = await require(tf)(ctx); } catch (e) { r = { fails: ['text script threw: ' + e.message], cats: {}, runs: 0 }; }
      (r.fails || []).forEach((f) => fails.push((mobile ? 'mobile ' : 'desktop ') + f)); runs += r.runs || 0;
      Object.keys(r.cats || {}).forEach((k) => { cats[k] = (cats[k] || 0) + r.cats[k]; });
      if (!mobile) { /* the content checks are viewport independent; mobile re-runs only the visual category */ }
    }
  } finally { try { ch.proc.kill(); } catch (e) { /* gone */ } srv.close(); try { fs.rmSync(ch.dir, { recursive: true, force: true }); } catch (e) { /* locked */ } }
  ['textVsTool', 'extremes', 'visual'].forEach((k) => { if (!(cats[k] >= 10)) fails.push('category "' + k + '" has only ' + (cats[k] || 0) + ' checks (needs >= 10 over both viewports)'); });
  const sb = sidebyside(ROOT, slug); if (!sb.ok) fails.push(sb.why);
  const rec = { slug, pass: fails.length === 0, at: new Date().toISOString(), passHash: pass.hash, scriptHash: sha(fs.readFileSync(tf, 'utf8').replace(/\r\n/g, '\n')), cats, runs, fails: fails.slice(0, 50) };
  fs.mkdirSync(path.join(ROOT, 'md-files/qa-passes/final'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'md-files/qa-passes/final/' + slug + '.json'), JSON.stringify(rec, null, 1));
  console.log((rec.pass ? 'FINAL PASS ' : 'FINAL FAIL ') + slug + '  checks ' + JSON.stringify(cats) + ', runs ' + runs);
  fails.slice(0, 40).forEach((f) => console.log('   - ' + f)); if (fails.length > 40) console.log('   ... ' + (fails.length - 40) + ' more');
  process.exit(rec.pass ? 0 : 1);
})().catch((e) => { console.error('final gate error: ' + e.message); process.exit(2); });
