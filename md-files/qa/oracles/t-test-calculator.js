/* ORACLE for t-test-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.ttEngine / pvalueEngine / ciEngine).
   t density from a Stirling-series log-gamma; tail probabilities by composite Simpson (upper tail through the substitution y = 1/x, so tiny p-values keep their digits); critical values by bisection;
   normal cdf by its power series; the noncentral t by Simpson over the chi-square density; people-needed searches with their own predicates. Means / SDs / skewness / quartiles are re-typed from the textbook.
   Compared with what the page DISPLAYS (headline, label, sub, tip, numbers / side-by-side / group / what-would-it-take tables, write-up sentence, steps, notes, hints, sticky bar) for two groups (raw and summary),
   paired, one sample, a typed t-score, tails, alpha, confidence level, tested difference, decimals, names and the SEM option. */
module.exports = async function (ctx) {
  let s = 20261122; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  /* ---- maths ---- */
  const lgam = (x) => { let sh = 0; while (x < 12) { sh += Math.log(x); x += 1; } const i = 1 / x; return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + i / 12 - i * i * i / 360 + Math.pow(i, 5) / 1260 - Math.pow(i, 7) / 1680 - sh; };
  const tpdf = (x, v) => Math.exp(lgam((v + 1) / 2) - lgam(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + x * x / v));
  const simpson = (f, a, b, n) => { if (n % 2) n++; const h = (b - a) / n; let t = f(a) + f(b); for (let i = 1; i < n; i++) t += f(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
  const tail = (t, v) => { /* P(T > t) for t >= 0 */
    if (t < 1) return 0.5 - simpson((x) => tpdf(x, v), 0, t, 2000);
    const C = lgam((v + 1) / 2) - lgam(v / 2) - 0.5 * Math.log(v * Math.PI);
    return simpson((y) => { if (y === 0) return v > 1 ? 0 : (v === 1 ? 1 / Math.PI : 0); return Math.exp(C - (v + 1) / 2 * Math.log(1 + 1 / (y * y * v)) - 2 * Math.log(y)); }, 0, 1 / t, 6000);
  };
  const pv = (t, v) => { const a = Math.abs(t), q = tail(a, v), two = Math.min(1, 2 * q); return { left: t >= 0 ? 1 - q : q, right: t >= 0 ? q : 1 - q, two }; };
  const critOf = (alpha, v, tl) => { const target = tl === 'two' ? alpha / 2 : alpha; let a = 0, b = 1; while (tail(b, v) > target) b *= 2; for (let i = 0; i < 70; i++) { const m = (a + b) / 2; if (tail(m, v) > target) a = m; else b = m; } return (a + b) / 2; };
  const PHI = (x) => { if (x > 8.3) return 1; if (x < -8.3) return 0; let term = x, sum = x, k = 0; while (Math.abs(term) > 1e-19 && k < 400) { k++; term *= x * x / (2 * k + 1); sum += term; } return 0.5 + sum * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); };
  const nctc = (x, v, dl) => { const sd = Math.sqrt(2 * v), lo = Math.max(1e-9, v - 14 * sd), hi = v + 14 * sd + 40, lc = -(v / 2) * Math.LN2 - lgam(v / 2); return simpson((u) => Math.exp(lc + (v / 2 - 1) * Math.log(u) - u / 2) * PHI(x * Math.sqrt(u / v) - dl), lo, hi, 2400); };
  const power = (tl, alpha, v, dl) => { const c = critOf(alpha, v, tl); let p; if (tl === 'gt') p = 1 - nctc(c, v, dl); else if (tl === 'lt') p = nctc(-c, v, dl); else p = 1 - nctc(c, v, dl) + nctc(-c, v, dl); return Math.max(0, Math.min(1, p)); };
  const firstN = (pred) => { if (pred(2)) return 2; let lo = 2, hi = 4; while (!pred(hi)) { lo = hi; hi *= 2; if (hi > 20000) return Infinity; } while (hi - lo > 1) { const m = Math.floor((lo + hi) / 2); if (pred(m)) hi = m; else lo = m; } return hi; };
  const mean = (a) => a.reduce((p, c) => p + c, 0) / a.length;
  const sdOf = (a) => { const m = mean(a); return Math.sqrt(a.reduce((p, c) => p + (c - m) * (c - m), 0) / (a.length - 1)); };
  const quart = (a, p) => { const s2 = a.slice().sort((x, y) => x - y), h = (s2.length - 1) * p, l = Math.floor(h); return l + 1 < s2.length ? s2[l] + (h - l) * (s2[l + 1] - s2[l]) : s2[l]; };
  const skew = (a) => { const n = a.length; if (n < 3) return null; const m = mean(a), sd = sdOf(a); if (!(sd > 0)) return null; return n / ((n - 1) * (n - 2)) * a.reduce((p, c) => p + Math.pow((c - m) / sd, 3), 0); };
  const outl = (a) => { const q1 = quart(a, 0.25), q3 = quart(a, 0.75), i = q3 - q1; return a.filter((v) => v < q1 - 1.5 * i || v > q3 + 1.5 * i).length; };
  /* ---- formatting like the page ---- */
  const sg = (t) => String(t).replace('-', '−');
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return sg(t); };
  const fn = (x) => sg(String(Math.round(x * 1e6) / 1e6));
  const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  const num = (t) => { t = String(t).replace(/−/g, '-').replace(/,/g, ''); const m = t.match(/^(-?[\d.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUP[c]).join(''), 10)); const q = t.match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 170) + '] lacks [' + sub + ']'); return false; } return true; };
  const near = (got, exp, d, tag) => { cmp++; const tol = 0.5 * Math.pow(10, -d) * 1.02 + 5e-6 * Math.abs(exp); if (got == null || !isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + '] (decimals ' + d + ')'); return false; } return true; };
  const sig4 = (got, exp, tag) => { cmp++; const mag = Math.floor(Math.log10(Math.max(Math.abs(exp), 1e-300))), tol = 0.5 * Math.pow(10, mag - 3) * 1.06 + 1e-13; if (!isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + '] (4 significant digits)'); return false; } return true; };
  const pIs = (txt, p, dec, tag) => { cmp++; if (dec !== null) { if (/^less than/.test(txt)) { if (p >= Math.pow(10, -dec)) fails.push(tag + ' p [' + txt + '] but expected ' + p); } else near(num(txt), p, dec, tag + ' p'); return; } if (p < 1e-7) { if (!(num(txt) < 2e-7)) fails.push(tag + ' tiny p [' + txt + '] expected about ' + p); return; } sig4(num(txt), p, tag + ' p'); };
  const rng = (txt, lo, hi, d, tag) => { cmp++; const m = String(txt).replace(/−/g, '-').match(/(-?[0-9.]+(?:e[+-]?[0-9]+)?)(?: to |, )(-?[0-9.]+(?:e[+-]?[0-9]+)?)/i); const tol = 0.5 * Math.pow(10, -d) * 1.05 + 5e-5 * Math.max(Math.abs(lo), Math.abs(hi)); if (!m || Math.abs(parseFloat(m[1]) - lo) > tol || Math.abs(parseFloat(m[2]) - hi) > tol) fails.push(tag + ' interval [' + txt + '] expected [' + lo + ' to ' + hi + ']'); };
  const rowOf = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("ttBig"),lab:g("ttLab"),sub:g("ttSub"),tip:g("ttTip"),body:vis("ttBody"),hint:vis("ttHint")?g("ttHint"):"",nums:rows("ttNums"),cmp:rows("ttCmp"),cmpVis:vis("ttCmpWrap"),cmpNote:g("ttCmpNote"),grp:rows("ttGrp"),dev:rows("ttDev"),devVis:vis("ttDevWrap"),what:rows("ttWhat"),write:g("ttWrite"),steps:g("ttSteps"),svg1:document.getElementById("ttVis").innerHTML.length,svg2:document.getElementById("ttCurve").innerHTML.length,vis1:vis("ttVisWrap"),vis2:vis("ttCurveWrap"),visKey:g("ttVisKey"),anote:g("ttANote"),bnote:g("ttBNote"),mu:g("ttMuNote"),s1n:g("ttSum1Note"),s2n:g("ttSum2Note"),alphaN:g("ttAlphaNote"),tailN:g("ttTailNote"),headN:g("ttHeadNote"),d0N:g("ttD0Note"),confN:g("ttConfNote"),spN:g("ttSpreadNote"),tN:g("ttTNote"),decN:g("ttDecNote"),nameN:g("ttNameNote"),mlab:g("ttMLab"),mval:g("ttMVal"),copy:g("ttCopyTxt"),tailLab:g("ttTailLab"),aLab:g("ttALab"),bLab:g("ttBLab")};})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("ttAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('ttAdvBtn'); };
  const ALLS = ['ttM1', 'ttS1', 'ttN1', 'ttM2', 'ttS2', 'ttN2', 'ttMu0', 'ttAlpha', 'ttD0', 'ttConf', 'ttTin', 'ttDfIn', 'ttNameA', 'ttNameB', 'ttDec'];
  const reset = async (test, entry, tl) => { await ctx.click('ttClear'); await ctx.seg('ttTest', test || 'two'); await ctx.seg('ttEntry', entry || 'raw'); await ctx.seg('ttTail', tl || 'two'); await ctx.seg('ttHead', 'welch'); await ctx.seg('ttSpread', 'sd'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const gen = (n, m, sd) => { let a; do { a = []; for (let i = 0; i < n; i++) { let g = 0; for (let k = 0; k < 6; k++) g += R(); g = (g - 3) * 1.4142; a.push(Math.round((m + g * sd) * 10) / 10); } } while (new Set(a).size < 2); return a; };
  const lst = (a) => a.join(pick([', ', ' ', '\n', '; ']));
  await advOpen();

  /* what the page should show for a test, computed independently. o: { kind, A:{m,s,n}, B, d0, tail, alpha, conf, dec } */
  const model = (o) => {
    const A = o.A, B = o.B; let diff, se, df, sp = null, sdv;
    if (o.kind === 'one' || o.kind === 'paired') { diff = A.m; se = A.s / Math.sqrt(A.n); df = A.n - 1; sdv = A.s; }
    else {
      diff = A.m - B.m; const v1 = A.s * A.s / A.n, v2 = B.s * B.s / B.n; sp = Math.sqrt(((A.n - 1) * A.s * A.s + (B.n - 1) * B.s * B.s) / (A.n + B.n - 2)); sdv = sp;
      if (o.kind === 'pooled') { se = sp * Math.sqrt(1 / A.n + 1 / B.n); df = A.n + B.n - 2; } else { se = Math.sqrt(v1 + v2); df = Math.pow(v1 + v2, 2) / ((v1 > 0 ? v1 * v1 / (A.n - 1) : 0) + (v2 > 0 ? v2 * v2 / (B.n - 1) : 0)); }
    }
    const t = (diff - o.d0) / se, P = pv(t, df), p = o.tail === 'gt' ? P.right : o.tail === 'lt' ? P.left : P.two, c = critOf(o.alpha, df, o.tail), cc = critOf(1 - o.conf, df, 'two'), me = cc * se;
    return { diff, se, df, t, P, p, sig: p < o.alpha, crit: c, cc, me, lo: diff - me, hi: diff + me, sdv, cohen: sdv > 0 ? (diff - (o.kind === 'one' ? o.d0 : 0)) / sdv : null, minD: c * se };
  };
  const planOf = (o, M) => {
    const eff = M.diff - o.d0, ok = o.tail === 'two' ? eff !== 0 : (o.tail === 'gt' ? eff > 0 : eff < 0); if (!ok) return { sig: null, pow: null };
    const two = o.kind === 'welch' || o.kind === 'pooled', se = (n) => two ? Math.sqrt((o.A.s * o.A.s + o.B.s * o.B.s) / n) : o.A.s / Math.sqrt(n), dfn = (n) => two ? 2 * n - 2 : n - 1;
    const sigAt = (n) => { const t = eff / se(n), c = critOf(o.alpha, dfn(n), o.tail); return o.tail === 'lt' ? t < -c : o.tail === 'gt' ? t > c : Math.abs(t) > c; };
    const powAt = (n) => power(o.tail, o.alpha, dfn(n), eff / se(n)) >= 0.8;
    return { sig: firstN(sigAt), pow: firstN(powAt) };
  };
  const tailName = (t) => t === 'two' ? 'two-tailed' : t === 'gt' ? 'right-tailed (higher)' : 'left-tailed (lower)';
  const testName = (k) => k === 'welch' ? 'Welch two-sample t-test' : k === 'pooled' ? 'Pooled two-sample t-test' : k === 'paired' ? 'Paired t-test' : 'One-sample t-test';
  const apaP = (p) => p < 0.001 ? '< .001' : '= ' + p.toFixed(3).replace(/^0\./, '.');

  /* verify everything the page shows for a test result */
  const check = (st, o, M, tag, plan) => {
    const dec = o.dec, d4 = dec !== null ? dec : 4, d2 = dec !== null ? dec : 2, dfI = Math.abs(M.df - Math.round(M.df)) < 1e-9;
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); return; }
    cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push(tag + ' bad text in result');
    const pm = st.big.match(/^p = (.+)$/); if (!pm) fails.push(tag + ' headline [' + st.big + ']'); else pIs(pm[1], M.p, dec, tag + ' headline');
    has(st.lab, testName(o.kind).toUpperCase() === st.lab ? st.lab : testName(o.kind), tag + ' label'); has(st.lab, tailName(o.tail), tag + ' label tail');
    has(st.sub, (M.sig ? 'Significant' : 'Not significant') + ' at α = ' + fn(o.alpha), tag + ' sub decision');
    const sm = st.sub.match(/t\(([^)]+)\) = (\S+)/); if (sm) { near(num(sm[2]), M.t, d2, tag + ' sub t'); near(num(sm[1]), M.df, 2, tag + ' sub df'); } else fails.push(tag + ' sub [' + st.sub + ']');
    has(st.mval, (M.sig ? 'significant' : 'not significant'), tag + ' sticky'); has(st.mval, ' · ', tag + ' sticky bar');
    has(st.tip, (M.sig ? 'That is statistically significant' : 'That is not statistically significant') + ' at α = ' + fn(o.alpha), tag + ' tip');
    rng(st.tip.slice(st.tip.indexOf('runs from') + 9, st.tip.indexOf(' and ', st.tip.indexOf('runs from'))), M.lo, M.hi, d2, tag + ' tip CI'); has(st.tip, (o.d0 >= M.lo && o.d0 <= M.hi ? ' and includes ' : ' and does not include ') + fn(o.d0), tag + ' tip includes');
    /* numbers table */
    const lbl = (o.kind === 'one' ? 'Mean (x̄)' : o.kind === 'paired' ? 'Mean difference' : 'Difference of the means (“' + o.nA + '” − “' + o.nB + '”)');
    const rt = rowOf(st.nums, 't-score'), rd = rowOf(st.nums, 'Degrees of freedom'); if (rt) near(num(rt[1]), M.t, d4, tag + ' t'); else fails.push(tag + ' no t row'); if (rd) { if (dfI) has(rd[1], String(Math.round(M.df)), tag + ' df'); else near(num(rd[1]), M.df, d4, tag + ' df'); } else fails.push(tag + ' no df row');
    [['two', 'p-value, two-tailed', M.P.two], ['gt', 'p-value, right-tailed (higher)', M.P.right], ['lt', 'p-value, left-tailed (lower)', M.P.left]].forEach((q) => { const r = rowOf(st.nums, q[1] + (o.tail === q[0] ? ' (used)' : '')); if (r) pIs(r[1], q[2], dec, tag + ' ' + q[1]); else fails.push(tag + ' no row ' + q[1]); });
    const rdf = rowOf(st.nums, lbl); if (rdf) { cmp++; const want = dec !== null ? fx(M.diff, dec) : fn(M.diff); if (rdf[1] !== want) fails.push(tag + ' ' + lbl + ' [' + rdf[1] + '] expected [' + want + ']'); } else fails.push(tag + ' no row ' + lbl);
    const rse = rowOf(st.nums, 'Standard error'); if (rse) near(num(rse[1]), M.se, d4, tag + ' SE'); else fails.push(tag + ' no SE row');
    const rci = rowOf(st.nums, fn(o.conf * 100) + '% confidence interval'); if (rci) rng(rci[1], M.lo, M.hi, d2, tag + ' CI'); else fails.push(tag + ' no CI row');
    const rcr = rowOf(st.nums, 'Critical t at α = ' + fn(o.alpha) + ' (' + (o.tail === 'two' ? 'two-tailed' : 'one-tailed') + ')'); if (rcr) { has(rcr[1], (o.tail === 'two' ? '±' : o.tail === 'lt' ? '−' : '') + fx(M.crit, d4).replace('−', ''), tag + ' critical'); } else fails.push(tag + ' no critical row');
    const rcd = rowOf(st.nums, 'Cohen’s d (effect size)'); if (rcd && M.cohen !== null) near(num(rcd[1]), M.cohen, d4, tag + ' d'); else fails.push(tag + ' no d row');
    const rdc = rowOf(st.nums, 'Decision at α = ' + fn(o.alpha)); if (rdc) has(rdc[1], M.sig ? 'Reject H₀: significant' : 'Do not reject H₀: not significant', tag + ' decision'); else fails.push(tag + ' no decision row');
    if (o.kind === 'welch' || o.kind === 'pooled') { const rp = rowOf(st.nums, 'Pooled standard deviation'); if (rp) near(num(rp[1]), M.sdv, d4, tag + ' pooled SD'); else fails.push(tag + ' no pooled SD row'); }
    /* side by side */
    if (o.kind === 'welch' || o.kind === 'pooled') {
      cmp++; if (!st.cmpVis) fails.push(tag + ' side-by-side hidden');
      const W = model(Object.assign({}, o, { kind: 'welch' })), Pp = model(Object.assign({}, o, { kind: 'pooled' }));
      const c1 = rowOf(st.cmp, 't-score'), c2 = rowOf(st.cmp, 'Degrees of freedom'), c3 = rowOf(st.cmp, 'p-value (' + tailName(o.tail) + ')'), c6 = rowOf(st.cmp, 'Significant at α = ' + fn(o.alpha) + '?');
      if (c1) { near(num(c1[1]), W.t, d4, tag + ' cmp welch t'); near(num(c1[2]), Pp.t, d4, tag + ' cmp pooled t'); } else fails.push(tag + ' no cmp t');
      if (c2) { near(num(c2[1]), W.df, d4, tag + ' cmp welch df'); near(num(c2[2]), Pp.df, d4, tag + ' cmp pooled df'); } else fails.push(tag + ' no cmp df');
      if (c3) { pIs(c3[1], W.p, dec, tag + ' cmp welch p'); pIs(c3[2], Pp.p, dec, tag + ' cmp pooled p'); } else fails.push(tag + ' no cmp p');
      if (c6) { has(c6[1], W.sig ? 'Yes' : 'No', tag + ' cmp welch sig'); has(c6[2], Pp.sig ? 'Yes' : 'No', tag + ' cmp pooled sig'); } else fails.push(tag + ' no cmp sig');
      const ci = rowOf(st.cmp, fn(o.conf * 100) + '% interval for the difference'); if (ci) { rng(ci[1], W.lo, W.hi, d2, tag + ' cmp welch CI'); rng(ci[2], Pp.lo, Pp.hi, d2, tag + ' cmp pooled CI'); } else fails.push(tag + ' no cmp CI');
      has(st.cmpNote, W.sig === Pp.sig ? 'Both tests reach the same conclusion' : 'The two tests disagree', tag + ' cmp note');
    } else { cmp++; if (st.cmpVis) fails.push(tag + ' side-by-side should be hidden for ' + o.kind); }
    /* what would it take */
    const w1 = st.what[0], w2 = st.what[1], w3 = st.what[2], w4 = st.what[3];
    if (w1) { has(w1[1], (o.tail === 'two' ? ' either side of ' : o.tail === 'gt' ? ' above ' : ' below ') + fn(o.d0), tag + ' min difference side'); near(num(w1[1].replace(/^more than /, '')), M.minD, d4, tag + ' min difference'); } else fails.push(tag + ' no what rows');
    if (w3 && plan) { const pw = power(o.tail, o.alpha, M.df, (M.diff - o.d0) / M.se); cmp++; const got = num(w3[1]); if (!(Math.abs(got - pw * 100) < 0.12)) fails.push(tag + ' power got [' + w3[1] + '] expected [' + (pw * 100).toFixed(1) + '%]'); }
    if (w2 && plan) { const exp = plan.sig === null ? 'Never: the difference points the other way' : M.sig ? 'Already significant with your numbers' : plan.sig === Infinity ? 'more than 10,000,000' : plan.sig.toLocaleString('en-US'); has(w2[1], exp, tag + ' people for p<alpha'); }
    if (w4 && plan) { const exp = plan.pow === null ? 'Never: the difference points the other way' : plan.pow === Infinity ? 'more than 10,000,000' : plan.pow.toLocaleString('en-US'); has(w4[1], exp, tag + ' people for 80% power'); }
    /* write-up and steps */
    has(st.write, 't(' + (dfI ? String(Math.round(M.df)) : fx(M.df, 2)) + ') = ' + fx(M.t, 2) + ', p ' + apaP(M.p), tag + ' APA'); has(st.write, o.kind === 'one' ? (M.sig ? 'differs significantly' : 'does not differ significantly') : (M.sig ? 'a significant' : 'no significant'), tag + ' APA decision'); rng(st.write.slice(st.write.indexOf('CI [') + 4, st.write.length - 1), M.lo, M.hi, 2, tag + ' APA CI');
    has(st.steps, '= ' + fx(M.t, d4) + '.', tag + ' steps t'); has(st.steps, M.sig ? 'p < α' : 'p ≥ α', tag + ' steps compare');
    cmp++; if (!st.vis1 || st.svg1 < 800 || !st.vis2 || st.svg2 < 800) fails.push(tag + ' pictures missing');
  };
  const grpCheck = (st, cols, raw, tag, dec) => {
    const d4 = dec !== null ? dec : 4; const hdr = st.grp[0].slice(1); cmp++; if (hdr.length !== cols.length) { fails.push(tag + ' group table has ' + hdr.length + ' columns, expected ' + cols.length); return; }
    cols.forEach((c, i) => {
      const g = (lab) => { const r = rowOf(st.grp, lab); return r ? r[i + 1] : null; };
      const n = g('Number of values (n)'); cmp++; if (n !== String(c.n)) fails.push(tag + ' col' + i + ' n [' + n + '] expected [' + c.n + ']');
      const mm = g('Mean'); cmp++; const wantM = dec !== null ? fx(c.m, dec) : fn(c.m); if (mm !== wantM) fails.push(tag + ' col' + i + ' mean [' + mm + '] expected [' + wantM + ']');
      near(num(g('Standard deviation')), c.s, d4, tag + ' col' + i + ' sd'); near(num(g('Standard error of the mean')), c.s / Math.sqrt(c.n), d4, tag + ' col' + i + ' sem'); near(num(g('Variance')), c.s * c.s, d4, tag + ' col' + i + ' var');
      if (raw) { near(num(g('Sum of squares')), c.s * c.s * (c.n - 1), d4, tag + ' col' + i + ' SS'); near(num(g('Smallest')), Math.min.apply(null, c.v), dec !== null ? dec : 6, tag + ' col' + i + ' min'); near(num(g('Largest')), Math.max.apply(null, c.v), dec !== null ? dec : 6, tag + ' col' + i + ' max'); const sk = skew(c.v), sv = g('Skewness'); cmp++; if (sk === null) { if (sv !== '—') fails.push(tag + ' col' + i + ' skew [' + sv + '] expected —'); } else near(num(sv), sk, d4, tag + ' col' + i + ' skew'); const ou = g('Outliers (beyond 1.5 × IQR)'); cmp++; const wo = outl(c.v) ? String(outl(c.v)) : 'none'; if (ou !== wo) fails.push(tag + ' col' + i + ' outliers [' + ou + '] expected [' + wo + ']'); }
    });
  };
  const dsc = (v) => ({ n: v.length, m: mean(v), s: sdOf(v), v });
  const alphaPool = [['', 0.05], ['0.05', 0.05], ['0.01', 0.01], ['0.10', 0.1], ['5%', 0.05], ['0.2', 0.2], ['1%', 0.01]];

  /* ---- 1. two groups, raw data, Welch and pooled headline, tails, alpha, tested difference, confidence level, decimals ---- */
  for (let i = 0; i < 70; i++) {
    runs++; const tl = pick(['two', 'two', 'gt', 'lt']), head = pick(['welch', 'welch', 'pooled']); await reset('two', 'raw', tl); await ctx.seg('ttHead', head);
    const n1 = ri(2, 26), n2 = ri(2, 26), m1 = Math.round(R() * 100) / 2, sd1 = 1 + R() * 14, m2 = m1 + (R() - 0.35) * sd1 * 2, sd2 = sd1 * (0.5 + R() * 1.6);
    const a = gen(n1, m1, sd1), b = gen(n2, m2, sd2), al = pick(alphaPool), cf = R() < 0.25 ? pick([90, 99, 80, 95]) : null, d0 = R() < 0.25 ? pick([2, -1, 0.5, 3]) : 0, dec = R() < 0.2 ? ri(0, 6) : null;
    const nA = R() < 0.15 ? 'Control' : null, nB = nA ? 'Treated' : null;
    const o0 = { ttA: lst(a), ttB: lst(b), ttAlpha: al[0] }; if (cf !== null) o0.ttConf = String(cf); if (d0) o0.ttD0 = String(d0); if (dec !== null) o0.ttDec = String(dec); if (nA) { o0.ttNameA = nA; o0.ttNameB = nB; }
    await setAll(o0);
    const A = dsc(a), B = dsc(b), o = { kind: head, A, B, d0, tail: tl, alpha: al[1], conf: cf !== null ? cf / 100 : 1 - al[1], dec, nA: nA || 'Group 1', nB: nB || 'Group 2' };
    if (!(A.s > 0) && !(B.s > 0)) { i--; runs--; continue; }
    const M = model(o); if (Math.abs(M.t) > 7) { i--; runs--; continue; }
    const st = await read(), tag = 'two raw ' + head + ' ' + tl + ' n=' + n1 + '/' + n2 + ' a=' + al[0] + ' cf=' + cf + ' d0=' + d0 + ' dec=' + dec;
    check(st, o, M, tag, (i % 3 === 0) ? planOf(o, M) : null);
    grpCheck(st, [dsc(a), dsc(b)], true, tag, dec);
    { cmp++; const rowsA = st.dev.filter((r) => r.length === 3 && /^-?[0-9.]+$/.test(r[0].replace(/−/g, '-'))); const nShown = Math.min(50, n1) + Math.min(50, n2); if (!st.devVis || rowsA.length !== nShown) fails.push(tag + ' deviation table rows ' + rowsA.length + ' expected ' + nShown);
      else { const mA = mean(a); near(num(rowsA[0][1]), a[0] - mA, dec !== null ? dec : 4, tag + ' dev diff'); near(num(rowsA[0][2]), (a[0] - mA) * (a[0] - mA), dec !== null ? dec : 4, tag + ' dev squared'); const ssr = st.dev.filter((r) => r[0] === 'Sum of squares'); if (ssr.length !== 2) fails.push(tag + ' deviation table sums ' + ssr.length); else near(num(ssr[0][1]), a.reduce((p2, c2) => p2 + (c2 - mA) * (c2 - mA), 0), dec !== null ? dec : 4, tag + ' dev SS'); } }
    has(st.anote, n1 + ' numbers read', tag + ' note A'); has(st.bnote, n2 + ' numbers read', tag + ' note B');
    if (nA) { has(st.aLab, nA, tag + ' label A'); has(st.tailLab, nA, tag + ' tail label'); }
  }

  /* ---- 2. paired, raw ---- */
  for (let i = 0; i < 25; i++) {
    runs++; const tl = pick(['two', 'gt', 'lt']); await reset('paired', 'raw', tl); const n = ri(3, 25), base = gen(n, 60 + R() * 40, 8 + R() * 8), eff = (R() - 0.3) * 6, sdn = 1 + R() * 5, noise = gen(n, 0, sdn), b = base.map((v, k) => Math.round((v - eff + noise[k]) * 10) / 10), a = base;
    const al = pick(alphaPool), d0 = R() < 0.2 ? pick([1, -2, 0.5]) : 0; const o0 = { ttA: lst(a), ttB: lst(b), ttAlpha: al[0] }; if (d0) o0.ttD0 = String(d0); await setAll(o0);
    const diffs = a.map((v, k) => Math.round((v - b[k]) * 1e9) / 1e9), D = dsc(diffs); if (!(D.s > 0)) { i--; runs--; continue; }
    const o = { kind: 'paired', A: D, d0, tail: tl, alpha: al[1], conf: 1 - al[1], dec: null, nA: 'Before', nB: 'After' }, M = model(o); if (Math.abs(M.t) > 7) { i--; runs--; continue; }
    const st = await read(), tag = 'paired ' + tl + ' n=' + n + ' a=' + al[0] + ' d0=' + d0;
    check(st, o, M, tag, (i % 3 === 0 && n >= 4) ? planOf(o, M) : null);
    grpCheck(st, [dsc(a), dsc(b), { n: D.n, m: D.m, s: D.s, v: diffs }], true, tag, null);
  }
  /* ---- 3. one sample, raw ---- */
  for (let i = 0; i < 25; i++) {
    runs++; const tl = pick(['two', 'gt', 'lt']); await reset('one', 'raw', tl); const n = ri(3, 30), mu = Math.round(R() * 200) / 2, a = gen(n, mu + (R() - 0.4) * 6, 2 + R() * 8), al = pick(alphaPool);
    await setAll({ ttA: lst(a), ttMu0: String(mu), ttAlpha: al[0] });
    const A = dsc(a), o = { kind: 'one', A, d0: mu, tail: tl, alpha: al[1], conf: 1 - al[1], dec: null, nA: 'Your group', nB: '' }, M = model(o); if (Math.abs(M.t) > 7) { i--; runs--; continue; }
    const st = await read(), tag = 'one ' + tl + ' n=' + n + ' mu=' + mu + ' a=' + al[0];
    check(st, o, M, tag, (i % 3 === 0 && n >= 4) ? planOf(o, M) : null); grpCheck(st, [A], true, tag, null);
    has(st.mu, 'different from ' + fn(mu), tag + ' mu note');
  }
  /* ---- 4. summary numbers: two groups (SD and SEM), paired, one sample ---- */
  for (let i = 0; i < 50; i++) {
    runs++; const kind = pick(['two', 'two', 'paired', 'one']), tl = pick(['two', 'two', 'gt', 'lt']), sem = R() < 0.25; await reset(kind, 'sum', tl); const head = kind === 'two' ? pick(['welch', 'pooled']) : kind; if (kind === 'two') await ctx.seg('ttHead', head);
    if (sem) await ctx.seg('ttSpread', 'sem');
    const mk = () => ({ m: Math.round((R() * 120 - 20) * 100) / 100, s: Math.round((0.5 + R() * 20) * 100) / 100, n: ri(2, 300) }); const A = mk(), B = mk(); if (kind === 'two') B.m = A.m + (R() - 0.5) * A.s * 0.8; B.m = Math.round(B.m * 100) / 100;
    const al = pick(alphaPool), mu = Math.round(R() * 100) / 2;
    const shown = (g) => sem ? String(Math.round(g.s / Math.sqrt(g.n) * 1e6) / 1e6) : String(g.s);
    const o0 = { ttM1: String(A.m), ttS1: shown(A), ttN1: String(A.n), ttAlpha: al[0] }; if (kind === 'two') Object.assign(o0, { ttM2: String(B.m), ttS2: shown(B), ttN2: String(B.n) }); if (kind === 'one') o0.ttMu0 = String(mu);
    await setAll(o0);
    const eff = (g) => sem ? { m: g.m, s: Math.round(g.s / Math.sqrt(g.n) * 1e6) / 1e6 * Math.sqrt(g.n), n: g.n } : g, A2 = eff(A), B2 = eff(B);
    const o = { kind: head, A: A2, B: kind === 'two' ? B2 : null, d0: kind === 'one' ? mu : 0, tail: tl, alpha: al[1], conf: 1 - al[1], dec: null, nA: kind === 'paired' ? 'Before' : kind === 'one' ? 'Your group' : 'Group 1', nB: kind === 'paired' ? 'After' : 'Group 2' }, M = model(o);
    const st = await read(), tag = 'sum ' + kind + (kind === 'two' ? ' ' + head : '') + ' ' + tl + (sem ? ' sem' : '') + ' A=' + JSON.stringify(A) + (kind === 'two' ? ' B=' + JSON.stringify(B) : '');
    if (Math.abs(M.t) > 7 || M.df < 1.5 || !isFinite(M.t)) { if (st.body) cmp++; continue; }
    check(st, o, M, tag, null);
    has(st.s1n, 'n = ' + A.n, tag + ' summary note');
    if (kind === 'two') grpCheck(st, [{ n: A.n, m: A2.m, s: A2.s }, { n: B.n, m: B2.m, s: B2.s }], false, tag, null);
    cmp++; if (!/No individual values/.test(st.visKey)) fails.push(tag + ' picture key should explain that only averages are drawn');
  }
  /* ---- 5. only a t-score and degrees of freedom ---- */
  for (let i = 0; i < 24; i++) {
    runs++; const tl = pick(['two', 'gt', 'lt']); await reset('two', 'raw', tl); const t = Math.round((R() * 8 - 4) * 100) / 100, v = pick([1, 2, 5, 9, 14, 30, 60, 120, 500, 2.5, 13.7156]), al = pick(alphaPool);
    await setAll({ ttTin: String(t), ttDfIn: String(v), ttAlpha: al[0] });
    const st = await read(), tag = 'tonly t=' + t + ' df=' + v + ' ' + tl + ' a=' + al[0];
    if (!st.body) { fails.push(tag + ' no result (hint ' + st.hint + ')'); continue; }
    const P = pv(t, v), p = tl === 'gt' ? P.right : tl === 'lt' ? P.left : P.two, c = critOf(al[1], v, tl);
    const pm = st.big.match(/^p = (.+)$/); if (pm) pIs(pm[1], p, null, tag + ' headline'); else fails.push(tag + ' headline [' + st.big + ']');
    has(st.lab, 't-score and degrees of freedom', tag + ' label'); has(st.sub, (p < al[1] ? 'Significant' : 'Not significant') + ' at α = ' + fn(al[1]), tag + ' sub');
    const r1 = rowOf(st.nums, 'Critical t at α = ' + fn(al[1]) + ' (' + (tl === 'two' ? 'two-tailed' : 'one-tailed') + ')'); if (r1) has(r1[1], (tl === 'two' ? '±' : tl === 'lt' ? '−' : '') + c.toFixed(4), tag + ' critical'); else fails.push(tag + ' no critical row');
    [['two', 'p-value, two-tailed', P.two], ['gt', 'p-value, right-tailed (higher)', P.right], ['lt', 'p-value, left-tailed (lower)', P.left]].forEach((q) => { const r = rowOf(st.nums, q[1] + (tl === q[0] ? ' (used)' : '')); if (r) pIs(r[1], q[2], null, tag + ' ' + q[1]); else fails.push(tag + ' no row ' + q[1]); });
    has(st.write, 't(' + (Math.abs(v - Math.round(v)) < 1e-9 ? String(v) : v.toFixed(2)) + ') = ' + fx(t, 2) + ', p ' + apaP(p), tag + ' write'); cmp++; if (!st.vis2 || st.vis1) fails.push(tag + ' picture visibility (curve only)');
  }

  /* ---- 6. hints and notes: every field reacts ---- */
  const hintCase = async (setup, expectHint, expectBody, tag, extra) => { runs++; await reset(extra && extra.test || 'two', extra && extra.entry || 'raw', 'two'); await setAll(setup); const st = await read(); if (expectHint) has(st.hint, expectHint, tag + ' hint'); cmp++; if (!!st.body !== expectBody) fails.push(tag + ' result visible=' + st.body + ' expected ' + expectBody); return st; };
  const TA = '78 82 86 85 73 82 90 88', TB = '77 75 79 86 74 71 73 89';
  await hintCase({ ttA: '5', ttB: TB }, 'needs at least 2 numbers', false, 'one number in group 1');
  await hintCase({ ttA: TA, ttB: 'abc' }, 'Couldn’t find a number', false, 'junk in group 2');
  { const st = await hintCase({ ttA: TA }, '', false, 'only group 1', {}); has(st.bnote, 'The second group', 'only group 1 note'); has(st.anote, '8 numbers read', 'only group 1 note A'); }
  await hintCase({ ttA: '5 5 5 5', ttB: '3 3 3' }, 'no spread to test with', false, 'no spread at all');
  await hintCase({ ttA: TA, ttB: TB + ' x y' }, '', true, 'junk tokens are left out', {});
  { const st = await hintCase({ ttA: TA, ttB: TB + ' x y' }, '', true, 'junk note', {}); has(st.bnote, '2 items that are not numbers left out', 'junk note B'); }
  { const st = await hintCase({ ttA: TA, ttB: TB, ttAlpha: '1.5' }, 'ignored for now', true, 'alpha 1.5'); has(st.hint, 'between 0 and 1', 'alpha hint'); has(st.sub, 'α = 0.05', 'alpha falls back to 0.05'); }
  { const st = await hintCase({ ttA: TA, ttB: TB, ttAlpha: 'abc' }, 'ignored for now', true, 'alpha junk'); }
  await hintCase({ ttA: TA, ttB: TB, ttConf: '150' }, 'ignored for now', true, 'confidence 150');
  await hintCase({ ttA: TA, ttB: TB, ttD0: 'zz' }, 'ignored for now', true, 'd0 junk');
  await hintCase({ ttA: TA, ttB: TB, ttDec: '99' }, 'ignored for now', true, 'decimals 99');
  await hintCase({ ttA: TA, ttB: TB, ttTin: '2', ttDfIn: '-4' }, 'ignored for now', true, 'df negative');
  { const st = await hintCase({ ttA: TA, ttB: TB, ttTin: '2.1', ttDfIn: '14' }, '', true, 'data win over t and df', {}); has(st.tN, 'not used', 'data win note'); }
  { const st = await hintCase({ ttA: TA, ttB: TB, ttConf: '99' }, '', true, 'conf note', {}); has(st.confN, '99%', 'conf note'); has(st.sub, 'α = 0.05', 'alpha unchanged by confidence'); }
  { const st = await hintCase({ ttA: TA, ttB: TB, ttD0: '2' }, '', true, 'd0 note', {}); has(st.d0N, 'different from 2', 'd0 note'); has(st.tip, 'includes 2', 'd0 in tip'); }
  { const st = await hintCase({ ttA: TA, ttB: TB, ttDec: '3' }, '', true, 'dec note', {}); has(st.decN, '3 decimal places', 'dec note'); }
  { const st = await hintCase({ ttA: TA, ttB: TB, ttNameA: 'Control', ttNameB: 'Treated' }, '', true, 'names', {}); has(st.nameN, 'The names are used', 'names note'); has(st.write, 'Control', 'names in write-up'); has(st.aLab, 'Control', 'names in label'); }
  { const st = await hintCase({ ttTin: '2.1' }, '', false, 'only t', {}); has(st.tN, 'Type the degrees of freedom too', 'only t note'); }
  { const st = await hintCase({ ttDfIn: '14' }, '', false, 'only df', {}); has(st.tN, 'Type the t-score too', 'only df note'); }
  /* paired mismatch, one-sample without mu0, summary errors */
  await hintCase({ ttA: TA, ttB: '1 2 3' }, 'a paired test needs the same number', false, 'paired mismatch', { test: 'paired' });
  { const st = await hintCase({ ttA: TA }, '', false, 'one-sample without mu0', { test: 'one' }); has(st.mu, 'Type the number your group is compared with', 'mu note'); }
  await hintCase({ ttA: '4 4 4 4', ttMu0: '3' }, 'no spread to test with', false, 'one-sample no spread', { test: 'one' });
  await hintCase({ ttA: '4 4 4 4', ttB: '3 3 3 3' }, 'no spread to test with', false, 'paired identical differences', { test: 'paired' });
  { const st = await hintCase({ ttM1: '83', ttS1: '5.5' }, '', false, 'summary missing n', { entry: 'sum' }); has(st.s1n, 'the number of values', 'summary note'); }
  await hintCase({ ttM1: '83', ttS1: '0', ttN1: '8', ttM2: '78', ttS2: '6', ttN2: '8' }, 'must be above 0', false, 'sd zero', { entry: 'sum' });
  await hintCase({ ttM1: '83', ttS1: '5', ttN1: '1', ttM2: '78', ttS2: '6', ttN2: '8' }, 'at least 2', false, 'n one', { entry: 'sum' });
  await hintCase({ ttM1: '83', ttS1: '5', ttN1: '2.5', ttM2: '78', ttS2: '6', ttN2: '8' }, 'whole number', false, 'n fractional', { entry: 'sum' });
  await hintCase({ ttM1: '83', ttS1: '5', ttN1: '8', ttM2: '78', ttS2: 'x', ttN2: '8' }, 'Couldn’t read', false, 'sd junk', { entry: 'sum' });
  { const st = await hintCase({ ttM1: '83', ttS1: '5', ttN1: '8', ttM2: '78', ttS2: '6', ttN2: '8' }, '', true, 'summary ok', { entry: 'sum' }); has(st.s2n, 'n = 8', 'summary note 2'); }
  /* extreme values stay readable */
  { const st = await hintCase({ ttM1: '1e9', ttS1: '1', ttN1: '5', ttM2: '-1e9', ttS2: '1', ttN2: '5' }, '', true, 'extreme means', { entry: 'sum' }); cmp++; if (/NaN|Infinity|undefined/.test(JSON.stringify(st))) fails.push('extreme means: bad text'); }
  { const st = await hintCase({ ttM1: '10', ttS1: '1', ttN1: '1000000000', ttM2: '10.001', ttS2: '1', ttN2: '1000000000' }, '', true, 'huge n', { entry: 'sum' }); cmp++; if (/NaN|Infinity|undefined/.test(JSON.stringify(st))) fails.push('huge n: bad text'); }
  /* clear and switching modes keep the page sane */
  runs++; await reset('two', 'raw', 'two'); await setAll({ ttA: TA, ttB: TB }); await ctx.seg('ttTest', 'one'); { const st = await read(); cmp++; if (st.body) fails.push('switching to one-sample without mu0 should hide the result'); } await ctx.seg('ttTest', 'two'); { const st = await read(); cmp++; if (!st.body) fails.push('switching back should restore the result'); }
  runs++; await ctx.click('ttClear'); { const st = await read(); cmp++; if (st.body || st.big !== '—') fails.push('Clear fields should empty the result'); }
  return { runs, fails: fails.slice(0, 60), comparisons: cmp };
};
