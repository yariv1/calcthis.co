#!/usr/bin/env node
/* PREFLIGHT GATE (user hard rule, 2026-11-10: "what do we have to do for it to happen 100%"). The three checks that used to be hand-run commands are now one command and a gate:
     1. audit-silent  - every field visibly reacts (QA item 19): `node md-files/qa/audit-silent.js <slug>` must print ok
     2. duplicate content - the page's 8-word runs found in ANY other sitemap page must stay under 12% (one intent = one page, no thin duplicates)
     3. registration audit - a no-ping copy build + md-files/audit-registration.js: header, footer, homepage card + hasPart + about list, sitemap, build.js PAGES, llms.txt, seo-meta, canonical, title/description length, one h1
   Writes md-files/qa-passes/preflight/<slug>.json bound to the QA pass hash; hash.js check() (build.js, Stop hook, PreToolUse hook) refuses a gated calculator without a matching record.
   Usage: node md-files/qa/preflight.js <slug> [slug ...]      |      node md-files/qa/preflight.js --legacy   (grandfather the calculators that passed before this gate) */
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ROOT = path.resolve(__dirname, '../..') + '/';
const H = require('./hash.js');
const passHash = (slug) => { try { return JSON.parse(fs.readFileSync(ROOT + 'md-files/qa-passes/' + slug + '.json', 'utf8')).hash; } catch (e) { return null; } };
function words(slug) { let h = fs.readFileSync(ROOT + slug + '/index.html', 'utf8'); const i = h.indexOf('<section class="content">'), j = h.indexOf('<!--FOOTER:START-->'); h = h.slice(i < 0 ? 0 : i, j > 0 ? j : undefined); return h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean); }
const shingles = (w) => { const s = new Set(); for (let i = 0; i + 8 <= w.length; i++) s.add(w.slice(i, i + 8).join(' ')); return s; };
function dup(slug) {
  const mine = shingles(words(slug)); if (!mine.size) return { ok: false, why: 'page has no content section' };
  const sm = fs.readFileSync(ROOT + 'sitemap.xml', 'utf8'); let worst = { pct: 0, other: '' };
  for (const m of sm.matchAll(/<loc>https:\/\/calcthis\.co\/([^<]*)\/<\/loc>/g)) {
    const o = m[1]; if (!o || o === slug || !fs.existsSync(ROOT + o + '/index.html')) continue;
    const theirs = shingles(words(o)); let c = 0; mine.forEach((x) => { if (theirs.has(x)) c++; });
    const pct = c / mine.size * 100; if (pct > worst.pct) worst = { pct, other: o };
  }
  return { ok: worst.pct < 12, why: 'most overlap ' + worst.pct.toFixed(1) + '% with /' + worst.other + '/ (limit 12%)', pct: worst.pct };
}
function silent(slug) { const r = cp.spawnSync('node', ['md-files/qa/audit-silent.js', slug], { cwd: ROOT, encoding: 'utf8', timeout: 600000 }); const out = (r.stdout || '').trim(); return { ok: /^ok\b/m.test(out) && r.status === 0, why: out.split('\n').slice(0, 6).join(' | ') }; }
function registration(slugs) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'calcthis-pre-')), dst = path.join(tmp, 'c');
  try {
    fs.cpSync(ROOT, dst, { recursive: true, filter: (s) => !/[\\/]\.git([\\/]|$)/.test(s) });
    let b = fs.readFileSync(dst + '/build.js', 'utf8'); const a = b.indexOf('/* ===== INDEXNOW:START'), e = b.indexOf('/* ===== INDEXNOW:END ===== */');
    if (a < 0 || e < 0) return { ok: false, why: 'cannot strip the IndexNow ping from the copy build' };
    fs.writeFileSync(dst + '/build_noping.js', b.slice(0, a) + b.slice(e + '/* ===== INDEXNOW:END ===== */'.length));
    const bd = cp.spawnSync('node', ['build_noping.js'], { cwd: dst, encoding: 'utf8', timeout: 600000 });
    if (bd.status !== 0 || !/Stamped \d+ page/.test(bd.stdout || '')) return { ok: false, why: 'the copy build failed: ' + ((bd.stdout || '') + (bd.stderr || '')).split('\n').filter(Boolean).slice(-4).join(' | ') };
    const au = cp.spawnSync('node', ['md-files/audit-registration.js', '.'].concat(slugs), { cwd: dst, encoding: 'utf8', timeout: 600000 });
    const out = (au.stdout || '').trim(); return { ok: /AUDIT PASS/.test(out), why: out.split('\n').slice(-6).join(' | ') };
  } finally { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* locked */ } }
}
function check(root, slug) {
  const f = path.join(root, 'md-files/qa-passes/preflight/' + slug + '.json');
  if (!fs.existsSync(f)) return { ok: false, why: 'PREFLIGHT GATE: audit-silent + duplicate-content + registration audit not run - run: node md-files/qa/preflight.js ' + slug };
  let r, rec; try { r = JSON.parse(fs.readFileSync(f, 'utf8')); rec = JSON.parse(fs.readFileSync(path.join(root, 'md-files/qa-passes/' + slug + '.json'), 'utf8')); } catch (e) { return { ok: false, why: 'PREFLIGHT GATE: unreadable record for ' + slug }; }
  if (r.legacy) return { ok: true, why: '' };
  if (!r.pass) return { ok: false, why: 'PREFLIGHT GATE: the last preflight FAILED (' + (r.failed || []).join(', ') + ') - fix, then run: node md-files/qa/preflight.js ' + slug };
  if (r.hash !== rec.hash) return { ok: false, why: 'PREFLIGHT GATE: the page changed after its preflight - run: node md-files/qa/preflight.js ' + slug };
  return { ok: true, why: '' };
}
module.exports = { check };
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === '--legacy') {
    let n = 0; for (const slug of H.gated(ROOT)) { const f = ROOT + 'md-files/qa-passes/preflight/' + slug + '.json'; if (fs.existsSync(f)) continue; fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify({ slug, legacy: true, note: 'passed before the preflight gate existed (2026-11-10)' }, null, 1) + '\n'); n++; }
    console.log('grandfathered ' + n); process.exit(0);
  }
  if (!args.length) { console.log('usage: node md-files/qa/preflight.js <slug> [slug ...]'); process.exit(2); }
  const reg = registration(args); let bad = 0;
  for (const slug of args) {
    const res = { silent: silent(slug), duplicate: dup(slug), registration: reg }, failed = Object.keys(res).filter((k) => !res[k].ok);
    const rec = { slug, pass: !failed.length, failed, hash: passHash(slug), at: new Date().toISOString(), results: { silent: res.silent.why, duplicate: res.duplicate.why, registration: res.registration.why } };
    fs.mkdirSync(ROOT + 'md-files/qa-passes/preflight', { recursive: true }); fs.writeFileSync(ROOT + 'md-files/qa-passes/preflight/' + slug + '.json', JSON.stringify(rec, null, 1) + '\n');
    console.log((rec.pass ? 'PREFLIGHT PASS ' : 'PREFLIGHT FAIL ') + slug + '  | silent: ' + (res.silent.ok ? 'ok' : res.silent.why) + ' | duplicate: ' + res.duplicate.why + ' | registration: ' + (reg.ok ? 'AUDIT PASS' : reg.why));
    if (!rec.pass) bad++;
  }
  process.exit(bad ? 1 : 0);
}
