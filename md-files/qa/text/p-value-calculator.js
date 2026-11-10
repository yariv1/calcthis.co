/* FINAL GATE script for p-value-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, tables, FAQ, worked examples) is re-derived by DRIVING THE TOOL and must appear in that text.
   extremes:   smallest / largest / odd values against closed-form or independent references (Cauchy t, chi-square 2 df, F with 2 df, Mills ratio, Wilson-Hilferty, ...), plus a time limit.
   visual:     what is DRAWN (marker, critical lines, shaded areas) re-measured from the SVG and compared with the numbers. */
module.exports = async function (ctx) {
  let s = 20261110; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0;
  const TAILID = { two: 'pvTail2', left: 'pvTailL', right: 'pvTailR' };
  const SUPM = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  const pnum = (t) => { const m = String(t).match(/^(\d[\d.]*) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUPM[c]).join(''), 10)); const v = parseFloat(t); return isNaN(v) ? null : v; };
  const rdn = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const clear = async () => { const o = (await ctx.eval('document.getElementById("pvAdvIn").style.display')) !== 'none'; if (o) await ctx.click('pvAdvBtn'); await ctx.fill(); await ctx.set('pvDf', ''); await ctx.set('pvVal', ''); await ctx.set('pvAlpha', ''); await ctx.set('pvDec', ''); await ctx.set('pvRev', ''); };
  const state = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var tr=[].map.call(document.querySelectorAll("#pvTails tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});' +
    'return {big:g("pvBig"),tails:tr,key:g("pvCurveKey"),valNote:g("pvValNote"),revNote:g("pvRevNote"),t0:performance.now()};})())'));
  const drive = async (stat, f, tail, alpha, dec) => {
    await clear(); await ctx.set('pvStat', stat); for (const k of Object.keys(f)) await ctx.set(k, String(f[k]));
    if (tail) await ctx.click(TAILID[tail]); if (alpha !== undefined) await ctx.set('pvAlpha', String(alpha));
    if (dec !== undefined) { await ctx.click('pvAdvBtn'); await ctx.set('pvDec', String(dec)); }
    runs++; return state();
  };
  const content = async () => (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' ');
  const hero = async () => (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const nums = (t) => (String(t).replace(/−/g, '-').match(/-?\d+\.?\d*(e[+-]?\d+)?/gi) || []).map(parseFloat);

  /* ======== 1. textVsTool ======== */
  const C = await content(), H = await hero();
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  /* worked-example table: 5 rows x 3 tails */
  const EX = [['t', { pvVal: '2.1', pvDf: '20' }, 't = 2.1, df = 20'], ['z', { pvVal: '1.96' }, 'z = 1.96'], ['z', { pvVal: '-1.5' }, 'z = −1.5'], ['chi', { pvVal: '3.84', pvDf: '1' }, 'χ² = 3.84, df = 1'], ['f', { pvVal: '4.96', pvDf1: '1', pvDf2: '10' }, 'F = 4.96, df = 1 and 10']];
  for (const [st, f, label] of EX) {
    const g = await drive(st, f, 'two'); const row = await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});}))');
    const rows = JSON.parse(row).filter((r) => r[0] === label)[0];
    if (!rows) { cats.textVsTool++; fails.push('text-vs-tool: example row [' + label + '] not found in the page text'); continue; }
    const by = {}; g.tails.forEach((t) => { by[t[0]] = t[1]; });
    [['Left-tailed', 1], ['Right-tailed', 2], ['Two-tailed', 3]].forEach(([k, ix]) => { cats.textVsTool++; if (rows[ix] !== by[k]) fails.push('text-vs-tool example [' + label + '] ' + k + ': text ' + rows[ix] + ' vs tool ' + by[k]); });
  }
  /* lead + FAQ + worked example numbers */
  { const a = await drive('t', { pvVal: '2.1', pvDf: '20' }, 'two'); inText(H, a.big, 'lead t=2.1 two-tailed'); const b = await drive('z', { pvVal: '1.96' }, 'two'); inText(H, b.big, 'lead z=1.96 two-tailed'); inText(C, a.big, 'worked example t two'); const a2 = await drive('t', { pvVal: '2.1', pvDf: '20' }, 'right'); inText(C, a2.big, 'worked example t right'); }
  const FAQ = (await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll("details.faq"),function(d){return d.textContent.replace(/\\s+/g," ").trim();}))')); const faqs = JSON.parse(FAQ).join(' ');
  { const a = await drive('t', { pvVal: '2.3', pvDf: '11' }, 'two'); inText(faqs, a.big, 'FAQ t=2.3 df 11 two'); const z = await drive('z', { pvVal: '1.96' }, 'right'); inText(faqs, z.big, 'FAQ z 1.96 right'); const z2 = await drive('z', { pvVal: '1.96' }, 'two'); inText(faqs, z2.big, 'FAQ z 1.96 two'); const zl = await drive('z', { pvVal: '-1.5' }, 'left'); inText(faqs, zl.big, 'FAQ z -1.5 left');
    const c = await drive('chi', { pvVal: '3.84', pvDf: '1' }, 'right'); inText(faqs, c.big, 'FAQ chi right'); const f = await drive('f', { pvVal: '4.96', pvDf1: '1', pvDf2: '10' }, 'right'); inText(faqs, f.big, 'FAQ F right');
    const r = await drive('r', { pvVal: '0.45', pvN: '25' }, 'two'); const tt = nums(r.valNote.match(/gives t = (-?[\d.]+)/)[1])[0]; inText(faqs, String(rdn(tt, 3)), 'FAQ r=0.45 t'); inText(faqs, r.big, 'FAQ r two-tailed p'); inText(C, r.big, 'worked example r p');
    const z10 = await drive('z', { pvVal: '10' }, 'two'); inText(faqs, z10.big, 'FAQ z=10'); const rv = await drive('z', {}, 'two'); await ctx.click('pvAdvBtn'); await ctx.set('pvRev', '0.05'); const rv2 = await state(); inText(faqs, String(nums(rv2.revNote.split(' needs a ')[1])[0]), 'FAQ reverse z 0.05 = 1.96'); }
  /* critical-value table vs the tool's own critical values (curve key) */
  { const tbl = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))')).filter((t) => /critical/.test(JSON.stringify(t[0])) || t.some((r) => /degrees of freedom/.test(r[0]) && /±/.test(r[1] || '')))[0] || [];
    if (!tbl.length) { cats.textVsTool++; fails.push('text-vs-tool: critical value table not found'); }
    for (const r of tbl) {
      const m = r[0].match(/^(z|t|chi-square)(?:, (\d+) degrees? of freedom)?/); if (!m) { cats.textVsTool++; fails.push('text-vs-tool crit row unreadable ' + r[0]); continue; }
      const st = m[1] === 'chi-square' ? 'chi' : m[1], f = st === 'z' ? { pvVal: '1' } : { pvVal: '1', pvDf: m[2] };
      const two = await drive(st, f, 'two', '0.05'); const right = await drive(st, f, 'right', '0.05');
      const tn = nums(two.key.slice(two.key.lastIndexOf(': ') + 1)), rn = nums(right.key.slice(right.key.lastIndexOf(': ') + 1));
      const tw = nums(r[1]), want = st === 'chi' ? [tn[0], tn[1]] : [Math.abs(tn[1])];
      cats.textVsTool++; if (tw.length !== want.length || tw.some((x, j) => Math.abs(Math.abs(x) - want[j]) > 6e-4)) fails.push('text-vs-tool crit [' + r[0] + '] two-tailed: text ' + r[1] + ' vs tool ' + JSON.stringify(tn));
      cats.textVsTool++; if (Math.abs(parseFloat(r[2]) - rn[0]) > 6e-4) fails.push('text-vs-tool crit [' + r[0] + '] right: text ' + r[2] + ' vs tool ' + rn[0]);
    } }
  /* the "which statistic" help and the 0.05 default claim */
  { cats.textVsTool++; if (!/0\.05 is used if you leave it empty/.test(C)) fails.push('text-vs-tool: how-to text no longer says what an empty alpha does'); const g = await drive('z', { pvVal: '1.96' }, 'two'); cats.textVsTool++; if (g.key.indexOf('α = 0.05') < 0) fails.push('text-vs-tool: empty alpha is not 0.05 in the tool'); }

  /* ======== 2. extremes against closed forms ======== */
  const t0 = Date.now();
  const lg = (x) => { let sh = 0; while (x < 12) { sh += Math.log(x); x += 1; } const x2 = x * x; return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + 1 / (12 * x) - 1 / (360 * x * x2) + 1 / (1260 * x * x2 * x2) - sh; };
  const erfc = (x) => { /* series for small, continued fraction for large */ if (x < 0) return 2 - erfc(-x); if (x < 2.5) { let sum = x, term = x, n = 0; while (Math.abs(term) > 1e-17 * Math.abs(sum) && n < 400) { n++; term *= -x * x / n; sum += term / (2 * n + 1); } return 1 - 2 / Math.sqrt(Math.PI) * sum; } let f = 0; for (let k = 80; k >= 1; k--) f = k / 2 / (x + f); return Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f); };
  const Phi = (z) => 0.5 * erfc(-z / Math.SQRT2);
  const expectP = async (tag, got, exp, rel, abs) => { cats.extremes++; const v = pnum(got); if (v === null || !isFinite(v) || Math.abs(v - exp) > Math.max((rel === undefined ? 1.2e-3 : rel) * Math.abs(exp), abs === undefined ? 1e-12 : abs)) fails.push('extreme ' + tag + ': page ' + got + ' expected ' + exp); };
  for (const x of [0.1, 1, 10, 100, 1000, 1e6]) { const g = await drive('t', { pvVal: x, pvDf: 1 }, 'two'); await expectP('Cauchy t df=1 x=' + x, g.big, 1 - 2 / Math.PI * Math.atan(x), 1.5e-3, 1e-12); }
  for (const x of [0.5, 3, 30, 300]) { const g = await drive('t', { pvVal: x, pvDf: 2 }, 'two'); await expectP('t df=2 x=' + x, g.big, 1 - x / Math.sqrt(x * x + 2)); }
  for (const x of [0.01, 5, 30, 100]) { const g = await drive('chi', { pvVal: x, pvDf: 2 }, 'right'); await expectP('chi df=2 x=' + x, g.big, Math.exp(-x / 2)); }
  for (const x of [0.05, 1, 10, 50]) { const g = await drive('chi', { pvVal: x, pvDf: 1 }, 'right'); await expectP('chi df=1 x=' + x, g.big, erfc(Math.sqrt(x / 2))); }
  for (const [d2, x] of [[1, 0.5], [2, 3], [3, 20], [5, 3], [50, 20]]) { const g = await drive('f', { pvVal: x, pvDf1: 2, pvDf2: d2 }, 'right'); await expectP('F(2,' + d2 + ') x=' + x, g.big, Math.pow(d2 / (2 * x + d2), d2 / 2)); }
  for (const [d1, x] of [[1, 0.5], [3, 3], [8, 20]]) { const g = await drive('f', { pvVal: x, pvDf1: d1, pvDf2: 2 }, 'left'); await expectP('F(' + d1 + ',2) left x=' + x, g.big, Math.pow(d1 * x / (d1 * x + 2), d1 / 2)); }
  for (const z of [0, 1e-6, 5, 8, 20, 36]) { const g = await drive('z', { pvVal: z }, 'two'); const e = z === 0 ? 1 : (z < 8 ? 2 * Phi(-z) : 2 * Math.exp(-z * z / 2) / (z * Math.sqrt(2 * Math.PI)) * (1 - 1 / (z * z) + 3 / Math.pow(z, 4) - 15 / Math.pow(z, 6))); await expectP('z=' + z + ' two-tailed', g.big, e, 1.5e-3, 1e-12); }
  { const g = await drive('z', { pvVal: '1e6' }, 'two'); cats.extremes++; if (!/less than 1 × 10⁻³⁰⁰/.test(g.big)) fails.push('extreme z=1e6 should say less than 1 × 10⁻³⁰⁰, got ' + g.big); const g0 = await drive('chi', { pvVal: '0', pvDf: '3' }, 'right'); await expectP('chi=0 right', g0.big, 1); const f0 = await drive('f', { pvVal: '0', pvDf1: '3', pvDf2: '4' }, 'right'); await expectP('F=0 right', f0.big, 1); const zz = await drive('z', { pvVal: '0' }, 'left'); await expectP('z=0 left', zz.big, 0.5); }
  /* large df: normal-corrected t, Wilson-Hilferty chi-square, ln F normal */
  { const g = await drive('t', { pvVal: '1.96', pvDf: '1000000' }, 'two'); const v = 1.96, nu = 1e6, zc = v * (1 - 1 / (4 * nu)) / Math.sqrt(1 + v * v / (2 * nu)); await expectP('t df=1e6', g.big, 2 * Phi(-zc), 1e-3);
    const c = await drive('chi', { pvVal: '100000', pvDf: '100000' }, 'right'); const k = 1e5, wh = (Math.pow(100000 / k, 1 / 3) - (1 - 2 / (9 * k))) / Math.sqrt(2 / (9 * k)); await expectP('chi df=1e5 x=df', c.big, 1 - Phi(wh), 0, 2e-3);
    const c2 = await drive('chi', { pvVal: '1000000', pvDf: '1000000' }, 'two'); const k2 = 1e6, wh2 = (1 - (1 - 2 / (9 * k2))) / Math.sqrt(2 / (9 * k2)); await expectP('chi df=1e6 x=df two-tailed', c2.big, Math.min(1, 2 * Math.min(Phi(wh2), 1 - Phi(wh2))), 0, 3e-3);
    const f = await drive('f', { pvVal: '1.01', pvDf1: '100000', pvDf2: '100000' }, 'right'); await expectP('F(1e5,1e5) x=1.01', f.big, 1 - Phi(Math.log(1.01) / (2 / Math.sqrt(1e5))), 0, 3e-3); }
  /* df below 1 and tiny / huge alpha; reference = own integration for chi df 0.5 */
  { const simpson = (fn, a, b, n) => { const h = (b - a) / n; let t = fn(a) + fn(b); for (let i = 1; i < n; i++) t += fn(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
    const dens = (k, x) => x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - lg(k / 2));
    const cdf = (k, x) => simpson((sv) => sv === 0 ? 0 : dens(k, x * Math.pow(sv, 4)) * 4 * x * Math.pow(sv, 3), 0, 1, 8000);
    for (const [k, x] of [[0.5, 0.3], [0.5, 2], [0.8, 1], [1.5, 3]]) { const g = await drive('chi', { pvVal: x, pvDf: k }, 'right'); await expectP('chi df=' + k + ' x=' + x, g.big, 1 - cdf(k, x), 1.5e-3, 1e-9); }
    const z = await drive('z', { pvVal: '1' }, 'two', '1e-10'); cats.extremes++; { const cr = nums(z.key.slice(z.key.lastIndexOf(': ') + 1)); if (Math.abs(Math.abs(cr[1]) - 6.4670) > 2e-3) fails.push('extreme z alpha 1e-10 critical value ' + JSON.stringify(cr) + ' expected about 6.467'); }
    const z2 = await drive('z', { pvVal: '1' }, 'two', '0.999'); cats.extremes++; { const cr = nums(z2.key.slice(z2.key.lastIndexOf(': ') + 1)); if (Math.abs(Math.abs(cr[1]) - 0.0012533) > 2e-4) fails.push('extreme z alpha 0.999 critical value ' + JSON.stringify(cr)); } }
  { cats.extremes++; const dt = Date.now() - t0; if (dt > 120000) fails.push('extreme runs took ' + dt + ' ms - too slow'); const t1 = Date.now(); await drive('chi', { pvVal: '1000000', pvDf: '1000000' }, 'two', '0.05'); const one = Date.now() - t1; cats.extremes++; if (one > 4000) fails.push('one render at df=1,000,000 took ' + one + ' ms (limit 4000)'); }
  { /* paste-style typing: thousands commas, percent alpha, exponent notation */ const a = await drive('z', { pvVal: '1.96' }, 'two', '5%'); cats.extremes++; if (a.key.indexOf('α = 0.05') < 0) fails.push('extreme: alpha typed as 5% not read as 0.05'); const b = await drive('chi', { pvVal: '1,000', pvDf: '999' }, 'right'); cats.extremes++; if (!(pnum(b.big) > 0.4 && pnum(b.big) < 0.5)) fails.push('extreme: 1,000 with commas not read, big=' + b.big); const c = await drive('z', { pvVal: '1.96e0' }, 'two'); cats.extremes++; if (pnum(c.big) === null || Math.abs(pnum(c.big) - 0.04999579) > 1e-4) fails.push('extreme: 1.96e0 not read, big=' + c.big); }

  /* ======== 3. visual: what is drawn ======== */
  const svg = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var s=document.querySelector("#pvCurve svg");if(!s)return null;var q=function(sel){return [].slice.call(s.querySelectorAll(sel));};' +
    'var vb=s.viewBox.baseVal;var r=s.getBoundingClientRect();var lines=q("line");var mk=lines.filter(function(l){return l.getAttribute("stroke")==="#8F5C13";}).map(function(l){return parseFloat(l.getAttribute("x1"));});var cr=lines.filter(function(l){return l.getAttribute("stroke")==="#37503F";}).map(function(l){return parseFloat(l.getAttribute("x1"));});' +
    'var sh=q("path").filter(function(p){return p.getAttribute("fill")==="#B5761F";}).map(function(p){return p.getAttribute("d");});var cv=q("path").filter(function(p){return p.getAttribute("stroke")==="#241A11";}).map(function(p){return p.getAttribute("d");})[0]||"";' +
    'var tx=q("text").map(function(t){return {t:t.textContent,fs:parseFloat(t.getAttribute("font-size")),x:parseFloat(t.getAttribute("x"))};});' +
    'return {mk:mk,cr:cr,sh:sh,cv:cv,tx:tx,vbw:vb.width,w:r.width,cw:s.parentNode.getBoundingClientRect().width,over:document.documentElement.scrollWidth>window.innerWidth};})())'));
  const pts = (d) => (d.match(/-?\d+\.?\d*,-?\d+\.?\d*/g) || []).map((p) => p.split(',').map(parseFloat));
  const area = (poly, ax) => { let a = 0; for (let i = 1; i < poly.length; i++) a += (poly[i][0] - poly[i - 1][0]) * ((ax - poly[i][1]) + (ax - poly[i - 1][1])) / 2; return Math.abs(a); };
  const AX = 132;
  for (let i = 0; i < 48; i++) {
    const stat = pick(['z', 't', 'chi', 'f']), tail = pick(['two', 'left', 'right']); let f = {}, tag;
    if (stat === 'z') f = { pvVal: rdn((R() - 0.5) * 7, 2) }; else if (stat === 't') f = { pvVal: rdn((R() - 0.5) * 7, 2), pvDf: pick([10, 15, 30, 60]) }; else if (stat === 'chi') f = { pvVal: rdn(R() * 25 + 0.5, 2), pvDf: pick([4, 6, 10, 15]) }; else f = { pvVal: rdn(R() * 6 + 0.2, 2), pvDf1: pick([4, 6, 10]), pvDf2: pick([10, 20, 40]) };
    const alpha = pick([0.05, 0.01, 0.1, 0.2]); tag = '[' + stat + ' ' + JSON.stringify(f) + ' ' + tail + ' a=' + alpha + '] ';
    const g = await drive(stat, f, tail, alpha), v = await svg(); const p = pnum(tail === 'two' ? g.tails[0][1] : tail === 'left' ? g.tails[1][1] : g.tails[2][1]);
    if (!v || v.mk.length !== 1) { cats.visual++; fails.push('visual ' + tag + 'marker count ' + (v ? v.mk.length : 'no svg')); continue; }
    const mk = v.mk[0]; cats.visual++;
    const wantSh = tail === 'two' ? 2 : 1; if (v.sh.length !== wantSh) fails.push('visual ' + tag + 'shaded areas ' + v.sh.length + ' expected ' + wantSh);
    cats.visual++; const wantCr = tail === 'two' ? 2 : 1; if (v.cr.length !== wantCr) fails.push('visual ' + tag + 'critical lines ' + v.cr.length + ' expected ' + wantCr);
    /* marker beyond the critical line <=> p <= alpha */
    if (v.cr.length === wantCr) { cats.visual++; const sig = p <= alpha; let beyond; const cr = v.cr.slice().sort((a, b) => a - b);
      if (tail === 'right') beyond = mk >= cr[0]; else if (tail === 'left') beyond = mk <= cr[0]; else beyond = mk <= cr[0] || mk >= cr[1];
      if (Math.abs(p - alpha) > 0.003 && beyond !== sig) fails.push('visual ' + tag + 'marker ' + (beyond ? 'beyond' : 'inside') + ' the critical line(s) but p ' + p + (sig ? ' <= ' : ' > ') + alpha); }
    /* a shaded area starts or ends exactly at the marker */
    cats.visual++; { const ok = v.sh.some((d) => { const q = pts(d); return Math.abs(q[0][0] - mk) < 0.3 || Math.abs(q[q.length - 1][0] - mk) < 0.3; }); if (!ok) fails.push('visual ' + tag + 'no shaded area touches the marker at x=' + mk); }
    /* area under the shading / area under the curve ~ p (plotted range holds >= 99% of the mass for these df) */
    cats.visual++; { const total = area(pts(v.cv), AX), sh = v.sh.reduce((a, d) => a + area(pts(d), AX), 0), ratio = sh / total; if (Math.abs(ratio - p) > 0.025) fails.push('visual ' + tag + 'shaded area share ' + rdn(ratio, 4) + ' vs p ' + p); }
    cats.visual++; { const key = nums(g.key.slice(g.key.lastIndexOf(': ') + 1)); const lab = v.tx.filter((t) => /^[−-]?\d/.test(t.t)).map((t) => parseFloat(t.t.replace('−', '-'))); if (key.length !== v.cr.length || key.some((k, j) => lab.indexOf(k) < 0)) fails.push('visual ' + tag + 'critical labels ' + JSON.stringify(lab) + ' vs critical values ' + JSON.stringify(key)); }
    cats.visual++; if (v.tx.some((t) => t.fs < 12)) fails.push('visual ' + tag + 'chart text below 12px in viewBox units');
    cats.visual++; if (v.vbw && v.w > 0 && (v.w / v.vbw) * 12 < 11) fails.push('visual ' + tag + 'chart text renders at ' + rdn(v.w / v.vbw * 12, 1) + 'px (< 11px)');
    cats.visual++; if (v.over || v.w > v.cw + 1) fails.push('visual ' + tag + 'chart or page overflows (svg ' + v.w + ' in ' + v.cw + ')');
  }
  { /* statistic far off the chart stays on the chart with an arrow */ const g = await drive('z', { pvVal: '250' }, 'two', '0.05'); const v = await svg(); cats.visual++; if (!v || v.mk.length !== 1 || v.mk[0] < 0 || v.mk[0] > 340) fails.push('visual z=250 marker off the chart'); else if (!v.tx.some((t) => /→/.test(t.t))) fails.push('visual z=250 has no off-chart arrow'); }
  return { fails, cats, runs };
};
