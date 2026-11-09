/* COMPETITOR PARITY GATE (user hard rule, 2026-11-09: "we cant fall short from our competitors ... its a gate you cant pass").
   Every gated calculator needs md-files/qa/parity/<slug>.json (unless grandfathered in md-files/qa/parity-legacy.json):
   {
     "slug": "...",
     "research": "md-files/calcthis-xxx-research.md",            // must exist
     "competitors": [ { "name": "Omni", "url": "https://...", "openedLive": true, "date": "YYYY-MM-DD",
                        "inputs": ["every input / mode / output the competitor page has, one string each"] } ],   // >= 2 (or exactly 1 + "onlyOneExists": "why")
     "features": [ { "covers": ["exact strings from competitors[].inputs"], "status": "match" | "exceed" | "dropped",
                     "ids": ["element ids in the page that implement it"],        // match/exceed: each id must exist in the page html
                     "signoff": { "quote": "the user's own words in chat", "date": "YYYY-MM-DD" } } ]   // dropped: REQUIRED
   }
   Mechanical rules: competitors opened live (not search snippets); EVERY competitor input is covered by a feature; match/exceed features
   point at real ids in the page; a dropped feature needs the user's quoted sign-off. This is checked by hash.js check() -> build.js,
   the Stop hook (preview links) and the PreToolUse hook (git commit / push / node build.js). Never weaken it - fix the page or ask him. */
const fs = require('fs'), path = require('path');
function check(root, slug, ignoreLegacy) {
  let legacy = []; try { legacy = JSON.parse(fs.readFileSync(path.join(root, 'md-files/qa/parity-legacy.json'), 'utf8')); } catch (e) { /* none */ }
  if (!ignoreLegacy && legacy.indexOf(slug) >= 0) return { ok: true, why: '' };
  const f = path.join(root, 'md-files/qa/parity/' + slug + '.json');
  const fix = ' (see md-files/qa/parity.js: open every competitor LIVE, list every input, map each to a feature on the page, no drops without his quoted sign-off)';
  if (!fs.existsSync(f)) return { ok: false, why: 'COMPETITOR PARITY: no md-files/qa/parity/' + slug + '.json' + fix };
  let p; try { p = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return { ok: false, why: 'COMPETITOR PARITY: unreadable parity file' }; }
  const bad = (m) => ({ ok: false, why: 'COMPETITOR PARITY: ' + m + fix });
  if (!p.research || !fs.existsSync(path.join(root, p.research))) return bad('"research" must point at the saved research md');
  const comps = Array.isArray(p.competitors) ? p.competitors : [];
  if (comps.length < 2 && !(comps.length === 1 && String(p.onlyOneExists || '').length > 20)) return bad('need >= 2 competitors opened live (or 1 + "onlyOneExists" reason)');
  const all = [];
  for (const c of comps) {
    if (!c.name || !/^https?:\/\//.test(c.url || '') || c.openedLive !== true || !/^\d{4}-\d{2}-\d{2}$/.test(c.date || '')) return bad('competitor "' + (c.name || '?') + '" needs name, url, openedLive:true, date');
    if (!Array.isArray(c.inputs) || !c.inputs.length) return bad('competitor "' + c.name + '" has no inputs listed');
    c.inputs.forEach((i) => all.push(c.name + ': ' + i));
  }
  let html = ''; try { html = fs.readFileSync(path.join(root, slug + '/index.html'), 'utf8'); } catch (e) { return bad('page html missing'); }
  const covered = new Set(), feats = Array.isArray(p.features) ? p.features : [];
  for (const ft of feats) {
    if (!Array.isArray(ft.covers) || !ft.covers.length) return bad('a feature has no "covers"');
    if (['match', 'exceed', 'dropped'].indexOf(ft.status) < 0) return bad('feature status must be match, exceed or dropped');
    if (ft.status === 'dropped') {
      const s = ft.signoff || {};
      if (String(s.quote || '').length < 8 || !/^\d{4}-\d{2}-\d{2}$/.test(s.date || '')) return bad('DROPPED without his quoted sign-off: ' + ft.covers.join(' | '));
    } else {
      if (!Array.isArray(ft.ids) || !ft.ids.length) return bad('"' + ft.covers[0] + '" is marked ' + ft.status + ' but names no page ids');
      for (const id of ft.ids) if (html.indexOf('id="' + id + '"') < 0) return bad('id "' + id + '" (for "' + ft.covers[0] + '") is not in the page');
    }
    ft.covers.forEach((c) => covered.add(c));
  }
  const missing = all.filter((a) => !covered.has(a));
  if (missing.length) return bad('competitor inputs with NO feature mapped (' + missing.length + '): ' + missing.slice(0, 6).join(' || ') + (missing.length > 6 ? ' ...' : ''));
  return { ok: true, why: '' };
}
module.exports = { check };
