#!/usr/bin/env node
/* SCREENSHOT GATE (user hard rule, 2026-11-10: "LOOK at all the screenshots ... a gate you cannot pass the handoff without").
   `node md-files/qa/run.js <slug>` writes 12 screenshots. This script proves they were actually LOOKED AT: it scans the Claude Code session transcripts for Read calls on
   every one of the pass record's screenshot files made AFTER that pass ran, and only then writes md-files/qa-passes/viewed/<slug>.json bound to the pass hash.
   hash.js check() (-> build.js, the Stop hook, the PreToolUse hook) refuses any gated calculator without a matching viewed record.
   Usage: node md-files/qa/viewed.js <slug>        (after Reading all 12 png files in md-files/qa-passes/shots/)
          node md-files/qa/viewed.js --legacy        (one-time: grandfather the calculators that passed before this gate existed) */
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '../..') + '/';
const base = (p) => String(p || '').replace(/\\/g, '/').split('/').pop();
function transcriptFiles() {
  const out = [], root = path.join(os.homedir(), '.claude', 'projects');
  let dirs = []; try { dirs = fs.readdirSync(root); } catch (e) { return out; }
  const me = path.basename(ROOT.replace(/\/$/, '')).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const d of dirs) { if (d.toLowerCase().replace(/[^a-z0-9]/g, '').indexOf(me) < 0) continue; const dp = path.join(root, d); let fl = []; try { fl = fs.readdirSync(dp); } catch (e) { continue; } for (const f of fl) if (f.endsWith('.jsonl')) out.push(path.join(dp, f)); }
  return out;
}
/* -> Set of shot basenames that were Read at/after `since` (ISO) */
function viewedSet(slug, since) {
  const seen = new Set();
  for (const f of transcriptFiles()) {
    let txt; try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    for (const line of txt.split('\n')) {
      if (line.indexOf('/shots/' + slug) < 0 && line.indexOf('\\\\shots\\\\' + slug) < 0 && line.indexOf('shots') < 0) continue;
      let e; try { e = JSON.parse(line); } catch (x) { continue; }
      if (!(e.type === 'assistant' && e.message && Array.isArray(e.message.content))) continue;
      if (e.timestamp && since && e.timestamp < since) continue;
      for (const b of e.message.content) if (b.type === 'tool_use' && b.name === 'Read' && b.input && /\.png$/i.test(b.input.file_path || '')) seen.add(base(b.input.file_path));
    }
  }
  return seen;
}
function record(slug) {
  const rf = path.join(ROOT, 'md-files/qa-passes/' + slug + '.json'); if (!fs.existsSync(rf)) return { ok: false, why: 'no QA pass record for ' + slug };
  const rec = JSON.parse(fs.readFileSync(rf, 'utf8')); if (!rec.pass) return { ok: false, why: 'the QA pass for ' + slug + ' failed' };
  const want = (rec.shots || []).map(base), seen = viewedSet(slug, rec.at), missing = want.filter((w) => !seen.has(w));
  if (!want.length) return { ok: false, why: 'the pass record lists no screenshots' };
  if (missing.length) return { ok: false, why: 'NOT looked at yet (' + missing.length + ' of ' + want.length + '): ' + missing.join(', ') };
  const vf = path.join(ROOT, 'md-files/qa-passes/viewed/' + slug + '.json'); fs.mkdirSync(path.dirname(vf), { recursive: true });
  fs.writeFileSync(vf, JSON.stringify({ slug, hash: rec.hash, shots: want, at: new Date().toISOString() }, null, 1) + '\n');
  return { ok: true, n: want.length };
}
/* used by hash.js check(): is there a viewed record bound to the current pass hash? */
function check(root, slug) {
  const vf = path.join(root, 'md-files/qa-passes/viewed/' + slug + '.json');
  if (!fs.existsSync(vf)) return { ok: false, why: 'SCREENSHOT GATE: no record that all 12 screenshots were looked at - Read every png of ' + slug + ' in md-files/qa-passes/shots/, then run: node md-files/qa/viewed.js ' + slug };
  let v, rec; try { v = JSON.parse(fs.readFileSync(vf, 'utf8')); rec = JSON.parse(fs.readFileSync(path.join(root, 'md-files/qa-passes/' + slug + '.json'), 'utf8')); } catch (e) { return { ok: false, why: 'SCREENSHOT GATE: unreadable record for ' + slug }; }
  if (v.legacy) return { ok: true, why: '' };
  if (v.hash !== rec.hash) return { ok: false, why: 'SCREENSHOT GATE: the page changed after its screenshots were looked at - Read all 12 new screenshots of ' + slug + ', then run: node md-files/qa/viewed.js ' + slug };
  return { ok: true, why: '' };
}
module.exports = { check, viewedSet, record };
if (require.main === module) {
  const a = process.argv[2];
  if (a === '--legacy') {
    const H = require('./hash.js'); let n = 0;
    for (const slug of H.gated(ROOT)) { const vf = path.join(ROOT, 'md-files/qa-passes/viewed/' + slug + '.json'); if (fs.existsSync(vf)) continue; fs.mkdirSync(path.dirname(vf), { recursive: true }); fs.writeFileSync(vf, JSON.stringify({ slug, legacy: true, note: 'passed before the screenshot gate existed (2026-11-10)', at: new Date().toISOString() }, null, 1) + '\n'); n++; }
    console.log('grandfathered ' + n + ' calculators'); process.exit(0);
  }
  if (!a) { console.log('usage: node md-files/qa/viewed.js <slug>'); process.exit(2); }
  const r = record(a);
  if (r.ok) console.log('SCREENSHOTS VIEWED ' + a + ' (' + r.n + ' of ' + r.n + ')'); else { console.log('SCREENSHOT GATE FAIL ' + a + ': ' + r.why); process.exit(1); }
}
