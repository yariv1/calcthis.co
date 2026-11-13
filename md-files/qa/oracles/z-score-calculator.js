/* ORACLE for z-score-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.zsEngine / pvalueEngine).
   Phi(z) = 1/2 +- integral of the density (composite Simpson, 400 panels per unit); the inverse by bisection on that integral; list means / SDs re-typed from the textbook.
   Compared with what the page DISPLAYS (headline, label, sub line, tip, numbers table, areas table, steps, notes, hints, sticky bar) for forward z, solving the missing box
   from a typed z / percentile / confidence level, z-only, two scores, sample mean, between two z-scores and a pasted list. */
module.exports = async function (ctx) {
  let s = 20261113; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  const dz = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  const simpson = (f, a, b, n) => { if (n % 2) n++; const h = (b - a) / n; let t = f(a) + f(b); for (let i = 1; i < n; i++) t += f(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
  const half = (z) => simpson(dz, 0, Math.abs(z), Math.max(200, Math.ceil(Math.abs(z) * 400)));
  const lower = (z) => (z >= 0 ? 0.5 + half(z) : 0.5 - half(-z));
  const upper = (z) => (z >= 0 ? 0.5 - half(z) : 0.5 + half(-z));
  const invL = (p) => { let a = -9, b = 9; for (let i = 0; i < 64; i++) { const m = (a + b) / 2; if (lower(m) < p) a = m; else b = m; } const z = (a + b) / 2; return Math.abs(z) < 1e-9 ? 0 : z; };
  const areas = (z) => { const a = Math.abs(z), t = upper(a); return { left: lower(z), right: upper(z), zero: 0.5 - t, between: 1 - 2 * t, two: 2 * t }; };
  const sg = (t) => String(t).replace('-', '−');
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return sg(t); };
  const fn = (x) => sg(String(Math.round(x * 1e6) / 1e6));
  const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  const num = (t) => { t = String(t).replace(/−/g, '-'); const m = t.match(/^(-?[\d.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUP[c]).join(''), 10)); const q = t.match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 150) + '] lacks [' + sub + ']'); return false; } return true; };
  const near = (got, exp, d, tag) => { cmp++; const tol = 0.5 * Math.pow(10, -d) * 1.02 + 1e-9 * Math.abs(exp); if (got == null || !isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + '] (decimals ' + d + ')'); return false; } return true; };
  const sig4 = (got, exp, tag) => { cmp++; const mag = Math.floor(Math.log10(Math.max(Math.abs(exp), 1e-300))), tol = 0.5 * Math.pow(10, mag - 3) * 1.03 + 1e-12; if (!isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + '] (4 significant digits)'); return false; } return true; };
  const pctOf = (p, d) => { const v = p * 100, e = 0.5 * Math.pow(10, -d); if (p > 0 && v < e) return '<' + fx(Math.pow(10, -d), d) + '%'; if (p < 1 && v > 100 - e) return '>' + fx(100 - Math.pow(10, -d), d) + '%'; return fx(v, d) + '%'; };
  const pctIs = (txt, p, d, tag) => { cmp++; const e = pctOf(p, d), v = num(txt), ev = num(e); if (/^[<>]/.test(e) || /^[<>]/.test(txt)) { if (txt.charAt(0) !== e.charAt(0)) fails.push(tag + ' percent [' + txt + '] expected [' + e + ']'); return; } if (!isFinite(v) || Math.abs(v - ev) > 0.5 * Math.pow(10, -d) * 1.02 + 1e-9) fails.push(tag + ' percent [' + txt + '] expected [' + e + ']'); };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("zsBig"),lab:g("zsLab"),sub:g("zsSub"),tip:g("zsTip"),body:vis("zsBody"),hint:vis("zsHint")?g("zsHint"):"",nums:rows("zsNums"),prob:rows("zsProb"),probVis:vis("zsProbWrap"),steps:g("zsSteps"),main:g("zsMainNote"),znote:g("zsZNote"),nnote:g("zsNNote"),cnote:g("zsConfNote"),bnote:g("zsBetweenNote"),lnote:g("zsListNote"),dnote:g("zsDecNote"),lsum:g("zsListSum"),ltab:rows("zsListTab"),lkey:g("zsListKey"),lvis:vis("zsListWrap"),vis:vis("zsVisWrap"),svg:document.getElementById("zsVis").innerHTML.length,vkey:g("zsVisKey"),mlab:g("zsMLab"),mval:g("zsMVal"),copy:g("zsCopyTxt")};})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("zsAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('zsAdvBtn'); };
  const ALL = ['zsX', 'zsMean', 'zsSd', 'zsX2', 'zsMean2', 'zsSd2', 'zsZ', 'zsPct', 'zsN', 'zsConf', 'zsZ1', 'zsZ2', 'zsDec'];
  const reset = async (mode) => { await ctx.click('zsClear'); await ctx.seg('zsMode', mode || 'one'); await ctx.seg('zsListKind', 'pop'); await ctx.set('zsList', ''); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const rowOf = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  await advOpen();

  /* ---- 1. forward z from score, mean, standard deviation (with n and decimals sometimes) ---- */
  for (let i = 0; i < 90; i++) {
    runs++; await reset('one');
    const m = Math.round((R() * 250 - 50) * 100) / 100, sd = Math.round((0.5 + R() * 40) * 100) / 100, zt = (R() * 9 - 4.5), n = R() < 0.25 ? ri(1, 400) : 0, dec = R() < 0.2 ? ri(0, 6) : null;
    const k = n ? 1 / Math.sqrt(n) : 1, x = Math.round((m + zt * sd * k) * 100) / 100, z = (x - m) / (sd * k);
    if (Math.abs(z) > 5) { i--; runs--; continue; }
    const o = { zsX: String(x), zsMean: String(m), zsSd: String(sd) }; if (n) o.zsN = String(n); if (dec !== null) o.zsDec = String(dec); await setAll(o);
    const st = await read(), tag = 'fwd x=' + x + ' m=' + m + ' s=' + sd + (n ? ' n=' + n : '') + (dec !== null ? ' dec=' + dec : '');
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); continue; }
    const dh = dec !== null ? dec : 2, dt = dec !== null ? dec : 4, pd = dec !== null ? dec : 2, A = areas(z);
    has(st.big, 'z = ' + fx(z, dh), tag + ' headline');
    has(st.lab, n ? 'z-score of the sample mean' : 'z-score', tag + ' label');
    const zr = rowOf(st.nums, 'z-score'); if (zr) near(num(zr[1]), z, dt, tag + ' table z'); else fails.push(tag + ' no z row');
    const labels = ['Below z — percentile, P(Z < z)', 'Above z, P(Z > z)', 'Between the mean and z', 'Between −|z| and |z| (two-tailed confidence level)', 'Outside −|z| and |z| (both tails)'], vals = [A.left, A.right, A.zero, A.between, A.two];
    labels.forEach((lb, ix) => { const r = rowOf(st.prob, lb); if (!r) { fails.push(tag + ' no areas row ' + lb); return; } sig4(num(r[1]), vals[ix], tag + ' ' + lb + ' probability'); pctIs(r[2], vals[ix], pd, tag + ' ' + lb); });
    has(st.sub, 'Higher than ' + pctOf(A.left, pd) + ' of ' + (n ? 'sample means of this size' : 'the group'), tag + ' sub');
    has(st.tip, pctOf(A.right, pd) + ' score higher', tag + ' tip above'); has(st.tip, pctOf(A.two, pd), tag + ' tip two-tailed');
    has(st.mval, fx(z, dh), tag + ' sticky bar'); has(st.mval, pctOf(A.left, pd), tag + ' sticky bar percentile');
    const xr = rowOf(st.nums, n ? 'Sample mean (x̄)' : 'Score (x)'); if (xr) has(xr[1], dec !== null ? fx(x, dec) : fn(x), tag + ' score row'); else fails.push(tag + ' no score row');
    if (n) { const se = rowOf(st.nums, 'Standard error (σ ÷ √n)'); if (se) has(se[1], dec !== null ? fx(sd * k, dec) : fn(sd * k), tag + ' SE row'); else fails.push(tag + ' no SE row'); has(st.nnote, 'standard error σ ÷ √' + n, tag + ' n note'); }
    cmp++; if (!st.vis || st.svg < 500) fails.push(tag + ' no picture');
    cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push(tag + ' bad text in result');
    has(st.steps, 'Percentile: P(Z < ' + fx(z, dt) + ')', tag + ' steps');
  }

  /* ---- 2. solve the missing box from a typed z / percentile / confidence level ---- */
  const ZS = [1.5, -2, 0.25, 2.33, -0.8, 3.1, -3.4, 1, 0.5, -1.25];
  for (let i = 0; i < 60; i++) {
    runs++; await reset('one');
    const m = Math.round((R() * 150 - 30) * 10) / 10, sd = Math.round((1 + R() * 30) * 10) / 10, n = R() < 0.2 ? ri(2, 200) : 0, k = n ? 1 / Math.sqrt(n) : 1, src = pick(['z', 'z', 'pct', 'conf']), miss = pick(['x', 'm', 's']);
    let z, zbox; if (src === 'z') { z = pick(ZS); zbox = { zsZ: String(z) }; } else if (src === 'pct') { const p = pick([2.5, 16, 30, 50, 70, 84, 97.5, 99, 0.5]); z = invL(p / 100); zbox = { zsPct: String(p) }; } else { const c = pick([80, 90, 95, 99, 99.9, 50]); z = invL(1 - (1 - c / 100) / 2); zbox = { zsConf: String(c) }; }
    if (Math.abs(z) < 1e-9) z = 0;
    const x = m + z * sd * k; const o = Object.assign({}, zbox); if (n) o.zsN = String(n);
    if (miss !== 'x') o.zsX = String(Math.round(x * 1e4) / 1e4); if (miss !== 'm') o.zsMean = String(m); if (miss !== 's') o.zsSd = String(sd);
    let xe = x, me = m, se = sd; const xt = Math.round(x * 1e4) / 1e4;
    if (miss === 'x') xe = x; if (miss === 'm') { me = xt - z * sd * k; } if (miss === 's') { if (z === 0) { /* z of 0: expected hint */ } else se = (xt - m) / (z * k); }
    if (miss === 's' && (z === 0 || !(se > 0))) { await setAll(o); const st0 = await read(); cmp++; if (st0.body || !/(spread can’t be worked out|negative standard deviation)/.test(st0.hint)) fails.push('solve s z=' + z + ' expected a hint, got [' + st0.big + '] [' + st0.hint + ']'); continue; }
    if (src === 'pct' && (miss === 'x' || miss === 'm') ) { /* fine */ }
    await setAll(o); const st = await read(), tag = 'solve ' + miss + ' via ' + src + ' z=' + z.toFixed(4) + ' m=' + m + ' s=' + sd + (n ? ' n=' + n : '');
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); continue; }
    const want = miss === 'x' ? xe : miss === 'm' ? me : se, got = num(st.big);
    cmp++; if (!isFinite(got) || Math.abs(got - want) > 6e-7 + 1e-8 * Math.abs(want)) fails.push(tag + ' solved value got [' + st.big + '] expected [' + want + ']');
    has(st.lab, (miss === 'x' ? 'Your score' : miss === 'm' ? 'The mean' : 'The standard deviation') + ' for z = ' + fx(z, 2), tag + ' label');
    const zr = rowOf(st.nums, 'z-score'); if (zr) near(num(zr[1]), z, 4, tag + ' table z'); else fails.push(tag + ' no z row');
    const A = areas(z), r1 = rowOf(st.prob, 'Below z — percentile, P(Z < z)'); if (r1) pctIs(r1[2], A.left, 2, tag + ' percentile');
    has(st.main, 'is worked out from the other two boxes and your ' + (src === 'z' ? 'z-score' : src === 'pct' ? 'percentile' : 'confidence level'), tag + ' main note');
    cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push(tag + ' bad text in result');
  }

  /* ---- 3. z only (z, percentile or confidence level typed, nothing else) ---- */
  for (let i = 0; i < 20; i++) {
    runs++; await reset('one'); const src = pick(['z', 'pct', 'conf']); let z, o, tag;
    if (src === 'z') { z = Math.round((R() * 8 - 4) * 100) / 100; o = { zsZ: String(z) }; } else if (src === 'pct') { const p = pick([0.1, 1, 5, 10, 25, 50, 75, 90, 95, 99, 99.9]); z = invL(p / 100); o = { zsPct: String(p) }; } else { const c = pick([80, 90, 95, 98, 99, 99.9]); z = invL(1 - (1 - c / 100) / 2); o = { zsConf: String(c) }; }
    tag = 'zonly ' + JSON.stringify(o); await setAll(o); const st = await read();
    if (!st.body) { fails.push(tag + ' no result (hint ' + st.hint + ')'); continue; }
    has(st.big, 'z = ' + fx(z, 2), tag + ' headline'); const zr = rowOf(st.nums, 'z-score'); if (zr) near(num(zr[1]), z, 4, tag + ' table z'); else fails.push(tag + ' no z row');
    cmp++; if (st.nums.length !== 1) fails.push(tag + ' numbers table should hold only the z-score, has ' + st.nums.length + ' rows');
    const A = areas(z); [['Below z — percentile, P(Z < z)', A.left], ['Above z, P(Z > z)', A.right], ['Between −|z| and |z| (two-tailed confidence level)', A.between]].forEach((q) => { const r = rowOf(st.prob, q[0]); if (r) pctIs(r[2], q[1], 2, tag + ' ' + q[0]); else fails.push(tag + ' no row ' + q[0]); });
    has(st.main, 'Only a z-score is given', tag + ' main note');
  }

  /* ---- 4. two scores ---- */
  for (let i = 0; i < 25; i++) {
    runs++; await reset('two');
    const t = () => { const m = Math.round((R() * 600) * 10) / 10, sd = Math.round((1 + R() * 120) * 10) / 10, z = Math.round((R() * 6 - 3) * 100) / 100; return { m, sd, x: Math.round((m + z * sd) * 10) / 10 }; };
    const a = t(), b = R() < 0.1 ? Object.assign({}, a) : t(), za = (a.x - a.m) / a.sd, zb = (b.x - b.m) / b.sd;
    await setAll({ zsX: String(a.x), zsMean: String(a.m), zsSd: String(a.sd), zsX2: String(b.x), zsMean2: String(b.m), zsSd2: String(b.sd) });
    const st = await read(), tag = 'two A=' + JSON.stringify(a) + ' B=' + JSON.stringify(b);
    if (!st.body) { fails.push(tag + ' no result (hint ' + st.hint + ')'); continue; }
    const d = za - zb; has(st.big, Math.abs(d) < 1e-9 ? 'Same z-score' : d > 0 ? 'Score A is higher' : 'Score B is higher', tag + ' headline');
    has(st.sub, 'z = ' + fx(za, 2) + ' (A) vs ' + fx(zb, 2) + ' (B)', tag + ' sub');
    const zr = rowOf(st.nums, 'z-score'); if (zr) { near(num(zr[1]), za, 4, tag + ' zA'); near(num(zr[2]), zb, 4, tag + ' zB'); } else fails.push(tag + ' no z row');
    const pr = rowOf(st.nums, 'Higher than (percentile)'); if (pr) { pctIs(pr[1], areas(za).left, 2, tag + ' pA'); pctIs(pr[2], areas(zb).left, 2, tag + ' pB'); } else fails.push(tag + ' no percentile row');
    cmp++; if (st.probVis) fails.push(tag + ' areas table should be hidden in compare mode');
    cmp++; if (!st.vis || st.svg < 500) fails.push(tag + ' no picture');
  }

  /* ---- 5. between two z-scores ---- */
  for (let i = 0; i < 12; i++) {
    runs++; await reset('one'); const z1 = Math.round((R() * 8 - 4) * 100) / 100, z2 = Math.round((R() * 8 - 4) * 100) / 100;
    await setAll({ zsZ1: String(z1), zsZ2: String(z2) }); const st = await read(), tag = 'between ' + z1 + ',' + z2;
    const p = Math.abs(lower(z2) - lower(z1)); has(st.bnote, 'Between z = ' + fx(z1, 2) + ' and z = ' + fx(z2, 2) + ' lies ', tag + ' note'); const m = st.bnote.match(/lies (\S+) of the group \(probability ([^)]+)\)/);
    if (m) { pctIs(m[1], p, 2, tag + ' percent'); sig4(num(m[2]), p, tag + ' probability'); } else fails.push(tag + ' cannot read note [' + st.bnote + ']');
  }

  /* ---- 6. a pasted list ---- */
  for (let i = 0; i < 14; i++) {
    runs++; await reset('one'); const n = ri(2, 70), vals = []; for (let j = 0; j < n; j++) vals.push(Math.round((R() * 200 - 40) * 10) / 10); const pop = R() < 0.5;
    if (new Set(vals).size < 2) { i--; runs--; continue; }
    await ctx.seg('zsListKind', pop ? 'pop' : 'sample'); await ctx.set('zsList', vals.join(pick([', ', ' ', '\n', '; '])));
    const st = await read(), tag = 'list n=' + n + (pop ? ' pop' : ' sample');
    const mean = vals.reduce((p, c) => p + c, 0) / n, ss = vals.reduce((p, c) => p + (c - mean) * (c - mean), 0), sd = Math.sqrt(ss / (pop ? n : n - 1));
    cmp++; if (!st.lvis) { fails.push(tag + ' list not shown'); continue; }
    has(st.lsum, n + ' values · mean ' + fn(mean) + ' · standard deviation ' + fn(sd) + ' (' + (pop ? 'population, ÷ n' : 'sample, ÷ n − 1') + ')', tag + ' summary');
    const body = st.ltab.slice(1); cmp++; if (body.length !== Math.min(50, n)) fails.push(tag + ' table rows ' + body.length + ' expected ' + Math.min(50, n));
    body.forEach((r, ix) => { near(num(r[0]), vals[ix], 6, tag + ' value ' + ix); near(num(r[1]), (vals[ix] - mean) / sd, 4, tag + ' z row ' + ix); const az = Math.abs((vals[ix] - mean) / sd); cmp++; const want = az > 3 ? 'beyond ±3' : az > 2 ? 'beyond ±2' : ''; if (r[2] !== want) fails.push(tag + ' flag row ' + ix + ' [' + r[2] + '] expected [' + want + ']'); });
    const f2 = vals.filter((v) => Math.abs((v - mean) / sd) > 2).length; has(st.lkey, f2 ? f2 + ' of ' + n + ' values are more than 2 standard deviations' : 'No value is more than 2 standard deviations', tag + ' key');
    has(st.big, n + ' z-scores', tag + ' headline when no score is typed'); has(st.lnote, n + ' numbers read', tag + ' note');
  }
  /* use list as mean and spread */
  { runs++; await reset('one'); await ctx.set('zsList', '10 20 30 40'); await ctx.click('zsListUse'); const mv = await ctx.val('zsMean'), sv = await ctx.val('zsSd'); cmp++; if (mv !== '25' || Math.abs(parseFloat(sv) - Math.sqrt(125)) > 1e-5) fails.push('list use button put mean [' + mv + '] sd [' + sv + '] expected 25 and 11.18034'); }

  /* ---- 7. every field reacts: hints and notes ---- */
  const hintCase = async (setup, expectHint, expectBody, tag, expectNote) => { runs++; await reset('one'); await setAll(setup); const st = await read(); has(st.hint, expectHint, tag + ' hint'); cmp++; if (!!st.body !== expectBody) fails.push(tag + ' result visible=' + st.body + ' expected ' + expectBody); if (expectNote) has(st[expectNote[0]], expectNote[1], tag + ' note'); };
  const T = { zsX: '85', zsMean: '75', zsSd: '10' };
  await hintCase({ zsX: '85', zsMean: '75', zsSd: '0' }, 'The standard deviation must be above 0.', false, 'sd zero');
  await hintCase({ zsX: 'abc', zsMean: '75', zsSd: '10' }, 'Couldn’t read “abc” in the score', false, 'junk score');
  await hintCase({ zsX: '-', zsMean: '75', zsSd: '10' }, 'Keep typing', false, 'partial score');
  await hintCase(Object.assign({}, T, { zsPct: '100' }), 'The percentile must be above 0 and below 100', true, 'pct 100 ignored');
  await hintCase(Object.assign({}, T, { zsPct: '0' }), 'It is ignored for now', true, 'pct 0 ignored');
  await hintCase(Object.assign({}, T, { zsN: '0' }), 'must be a whole number of at least 1', true, 'n zero ignored');
  await hintCase(Object.assign({}, T, { zsN: '2.5' }), 'must be a whole number', true, 'n fraction ignored');
  await hintCase(Object.assign({}, T, { zsConf: '100' }), 'should be above 0% and below 100%', true, 'conf 100 ignored');
  await hintCase(Object.assign({}, T, { zsDec: '11' }), 'Decimal places should be a whole number from 0 to 10', true, 'dec 11 ignored');
  await hintCase(Object.assign({}, T, { zsZ1: 'q' }), 'Couldn’t read “q” in the first z-score', true, 'z1 junk ignored');
  await hintCase({ zsZ: '1.5', zsMean: '75', zsSd: '10' , zsX: ''}, '', true, 'solve ok');
  await hintCase({ zsZ: '0', zsX: '85', zsMean: '75' }, 'spread can’t be worked out', false, 'z zero for spread');
  await hintCase({ zsZ: '1.5', zsX: '60', zsMean: '75' }, 'negative standard deviation', false, 'negative spread');
  await hintCase({ zsZ: 'abc' }, 'Couldn’t read “abc” in the z-score', false, 'z junk, nothing else');
  await hintCase(Object.assign({}, T, { zsZ: 'abc' }), 'It is ignored for now', true, 'z junk, trio complete');
  /* notes */
  await hintCase({}, '', false, 'empty start', ['main', 'Type your score, the mean and the standard deviation']);
  runs++; { await reset('one'); await setAll({ zsMean: '75' }); const st = await read(); has(st.main, 'Type your score and the standard deviation', 'one box typed main note'); }
  runs++; { await reset('one'); await setAll({ zsMean: '75', zsZ: '1' }); const st = await read(); has(st.main, 'Type one more of score, mean and standard deviation to go with your z-score', 'z with one box main note'); }
  runs++; { await reset('one'); await setAll(Object.assign({}, T)); const st = await read(); has(st.znote, 'Type either one with two of the three boxes above', 'z note default'); has(st.nnote, 'Optional. Type n if', 'n note default'); has(st.cnote, 'Optional. Type a two-tailed confidence level', 'conf note default'); has(st.bnote, 'Optional. Type two z-scores', 'between note default'); has(st.lnote, 'Optional. Paste numbers', 'list note default'); has(st.dnote, 'Leave empty for automatic', 'decimals note default'); }
  runs++; { await reset('one'); await setAll(Object.assign({}, T, { zsZ: '2' })); const st = await read(); has(st.znote, 'z is worked out from them and this z-score is not used', 'z with full trio'); has(st.big, 'z = 1.00', 'full trio wins over typed z'); }
  runs++; { await reset('one'); await setAll(Object.assign({}, T, { zsPct: '90' })); const st = await read(); has(st.znote, 'this percentile is not used', 'pct with full trio'); }
  runs++; { await reset('one'); await setAll({ zsZ: '1', zsPct: '90', zsMean: '75', zsSd: '10' }); const st = await read(); has(st.znote, 'Using the z-score you typed (the percentile is ignored)', 'z beats pct'); has(st.big, '85', 'z beats pct value'); }
  runs++; { await reset('one'); await setAll({ zsPct: '0.5' }); const st = await read(); has(st.znote, 'Percentile 0.5 means the 0.5th percentile (0.5%), not 50%', 'pct below 1 note'); }
  runs++; { await reset('one'); await setAll({ zsConf: '95' }); const st = await read(); has(st.cnote, 'A 95% two-tailed level has a critical z of ±1.96', 'conf note'); has(st.cnote, 'used as your z-score because no z-score or percentile is typed', 'conf used note'); has(st.big, 'z = 1.96', 'conf only headline'); }
  runs++; { await reset('one'); await setAll(Object.assign({}, T, { zsConf: '99' })); const st = await read(); has(st.cnote, '±2.5758', 'conf shown with trio'); has(st.big, 'z = 1.00', 'conf does not change the trio z'); }
  runs++; { await reset('one'); await setAll({ zsZ1: '-1' }); const st = await read(); has(st.bnote, 'Type the other z-score too', 'between one typed'); }
  runs++; { await reset('one'); await ctx.set('zsList', '5'); let st = await read(); has(st.lnote, 'Type at least 2 numbers', 'list one number'); await ctx.set('zsList', 'abc'); st = await read(); has(st.lnote, 'Couldn’t find a number', 'list junk'); await ctx.set('zsList', '3 3 3'); st = await read(); has(st.lnote, 'All 3 numbers are the same', 'list all same'); await ctx.set('zsList', '1 2 x 3'); st = await read(); has(st.lnote, '1 item that is not a number left out', 'list junk item'); }
  runs++; { await reset('one'); await setAll(Object.assign({}, T, { zsDec: '3' })); const st = await read(); has(st.dnote, 'Numbers are shown with 3 decimal places', 'decimals note'); has(st.big, 'z = 1.000', 'decimals headline'); }
  runs++; { await reset('two'); await setAll({ zsX: '85' }); const st = await read(); has(st.main, 'to compare the two scores', 'two empty note'); has(st.main, 'mean A', 'two note names missing field'); }
  runs++; { await reset('one'); await setAll(Object.assign({}, T)); await ctx.click('zsClear'); const vals = []; for (const id of ALL) vals.push(await ctx.val(id)); const st = await read(); cmp++; if (vals.some((v) => v !== '') || st.body) fails.push('clear did not empty everything: ' + JSON.stringify(vals)); }
  /* percentile display rules for extreme z */
  runs++; { await reset('one'); await setAll({ zsZ: '4.5' }); const st = await read(); const r = rowOf(st.prob, 'Above z, P(Z > z)'); cmp++; if (!r || !/^</.test(r[2])) fails.push('extreme z=4.5 tail percent should start with <, got ' + JSON.stringify(r)); const A = areas(4.5); if (r) sig4(num(r[1]), A.right, 'extreme z=4.5 tail probability'); }
  runs++; { await reset('one'); await setAll({ zsZ: '-4.5' }); const st = await read(); const r = rowOf(st.prob, 'Below z — percentile, P(Z < z)'); cmp++; if (!r || !/^</.test(r[2])) fails.push('extreme z=-4.5 percentile should start with <, got ' + JSON.stringify(r)); }
  return { runs, fails: fails.slice(0, 60), compared: cmp };
};
