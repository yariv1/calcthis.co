/* ORACLE for linear-regression-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.lrEngine / ccEngine / pvalueEngine). Least squares by Gaussian elimination on the normal equations in a
   centred basis (weights scaled to an average of 1), raw-power coefficients by the binomial expansion, covariance from the inverse, t and F tail probabilities by Simpson integration and a Lentz continued
   fraction for the incomplete beta, critical t by bisection, leave-one-out by refitting from scratch without each point, Cook's distance from the textbook formula. Compared with what the page DISPLAYS
   (headline, sub line, coefficient / fit / ANOVA / curves / influence / prediction / inverse / what-would-it-take tables, tip, write-up, notes and hints) for lists and pairs entry, summary numbers,
   straight / quadratic / cubic, through the origin, weights, confidence level, decimals, names, predictions. */
module.exports = async function (ctx) {
  let s = 20261124; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  const lgam = (x) => { let sh = 0; while (x < 12) { sh += Math.log(x); x += 1; } const i = 1 / x; return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + i / 12 - i * i * i / 360 + Math.pow(i, 5) / 1260 - Math.pow(i, 7) / 1680 - sh; };
  const tpdf = (x, v) => Math.exp(lgam((v + 1) / 2) - lgam(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + x * x / v));
  const simpson = (f, a, b, n) => { if (n % 2) n++; const h = (b - a) / n; let t = f(a) + f(b); for (let i = 1; i < n; i++) t += f(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
  const tail = (t, v) => { if (t < 1) return 0.5 - simpson((x) => tpdf(x, v), 0, t, 2000); const C = lgam((v + 1) / 2) - lgam(v / 2) - 0.5 * Math.log(v * Math.PI); return simpson((y) => { if (y === 0) return v > 1 ? 0 : (v === 1 ? 1 / Math.PI : 0); return Math.exp(C - (v + 1) / 2 * Math.log(1 + 1 / (y * y * v)) - 2 * Math.log(y)); }, 0, 1 / t, 6000); };
  const pvT = (t, v) => { if (!isFinite(t)) return 0; return Math.min(1, 2 * tail(Math.abs(t), v)); };
  const critT = (alpha, v) => { const target = alpha / 2; let a = 0, b = 1; while (tail(b, v) > target) b *= 2; for (let i = 0; i < 70; i++) { const m = (a + b) / 2; if (tail(m, v) > target) a = m; else b = m; } return (a + b) / 2; };
  const PHI = (x) => { if (x > 8.3) return 1; if (x < -8.3) return 0; let term = x, sum = x, k = 0; while (Math.abs(term) > 1e-19 && k < 400) { k++; term *= x * x / (2 * k + 1); sum += term; } return 0.5 + sum * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); };
  const zUp = (a) => { let lo = 0, hi = 10; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (1 - PHI(m) > a) lo = m; else hi = m; } return (lo + hi) / 2; };
  const betacf = (a, b, x) => { const FP = 1e-300; let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FP) d = FP; d = 1 / d; let h = d; for (let m = 1; m <= 400; m++) { const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; h *= d * c; aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-16) break; } return h; };
  const betaI = (x, a, b) => { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(lgam(a + b) - lgam(a) - lgam(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b; };
  const pF = (f, d1, d2) => (f <= 0 ? 1 : betaI(d2 / (d2 + d1 * f), d2 / 2, d1 / 2));
  const gsolve = (A, B) => { const k = A.length, m = B[0].length, M = A.map((r, i) => r.concat(B[i])); for (let c = 0; c < k; c++) { let p = c; for (let r = c + 1; r < k; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; const tmp = M[c]; M[c] = M[p]; M[p] = tmp; for (let r = c + 1; r < k; r++) { const f = M[r][c] / M[c][c]; for (let j = c; j < k + m; j++) M[r][j] -= f * M[c][j]; } } const X = Array.from({ length: k }, () => new Array(m).fill(0)); for (let j = 0; j < m; j++) for (let i = k - 1; i >= 0; i--) { let t = M[i][k + j]; for (let q = i + 1; q < k; q++) t -= M[i][q] * X[q][j]; X[i][j] = t / M[i][i]; } return X; };
  const binom = (k, j) => { let r = 1; for (let i = 1; i <= j; i++) r = r * (k - j + i) / i; return r; };
  const ols = (x, y, deg, origin, w0) => {
    const n = x.length, W0 = w0 || x.map(() => 1), sw = W0.reduce((a, b) => a + b, 0), w = W0.map((v) => v * n / sw), c = origin ? 0 : x.reduce((a, b) => a + b, 0) / n, p = origin ? 1 : deg + 1, off = origin ? 1 : 0, u = x.map((v) => v - c);
    const A = [...Array(p)].map(() => new Array(p).fill(0)), b = new Array(p).fill(0), B = (i) => [...Array(p)].map((_, a) => Math.pow(u[i], off + a));
    for (let i = 0; i < n; i++) { const pv = B(i); for (let a = 0; a < p; a++) { b[a] += w[i] * y[i] * pv[a]; for (let q = 0; q < p; q++) A[a][q] += w[i] * pv[a] * pv[q]; } }
    const sol = gsolve(A, b.map((v) => [v])).map((r) => r[0]), I = [...Array(p)].map((_, i) => [...Array(p)].map((__, j) => (i === j ? 1 : 0))), inv = gsolve(A, I);
    const T = []; for (let j = 0; j <= deg; j++) { T.push([]); for (let a = 0; a < p; a++) { const k = off + a; T[j].push(j <= k ? binom(k, j) * Math.pow(-c, k - j) : 0); } }
    const co = T.map((row) => row.reduce((acc, t, a) => acc + t * sol[a], 0));
    const yh = x.map((v) => co.reduce((acc, cj, j) => acc + cj * Math.pow(v, j), 0)), e = y.map((v, i) => v - yh[i]);
    const sse = e.reduce((acc, v, i) => acc + w[i] * v * v, 0), df = n - p, s2 = sse / df, yb = origin ? 0 : y.reduce((acc, v, i) => acc + w[i] * v, 0) / n;
    const sst = y.reduce((acc, v, i) => acc + w[i] * (v - yb) * (v - yb), 0), r2 = 1 - sse / sst, dfR = origin ? 1 : p - 1, F = ((sst - sse) / dfR) / s2;
    const cov = T.map((rj) => T.map((rk) => { let t = 0; for (let a = 0; a < p; a++) for (let q = 0; q < p; q++) t += rj[a] * inv[a][q] * rk[q]; return s2 * t; }));
    const quad = (pv) => { let t = 0; for (let a = 0; a < p; a++) for (let q = 0; q < p; q++) t += pv[a] * inv[a][q] * pv[q]; return t; };
    const h = x.map((_, i) => w[i] * quad(B(i)));
    const D = x.map((_, i) => w[i] * e[i] * e[i] * h[i] / (p * s2 * (1 - h[i]) * (1 - h[i])));
    return { n, w, c, p, off, co, cov, yh, e, sse, df, s2, sst, r2, adj: origin ? 1 - (1 - r2) * n / df : 1 - (1 - r2) * (n - 1) / df, dfR, F, pF: pF(F, dfR, df), h, D, quad, pvAt: (xd) => [...Array(p)].map((_, a) => Math.pow(xd - c, off + a)) };
  };
  /* ---- formatting the way the page does ---- */
  const sg = (t) => String(t).replace('-', '−');
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return sg(t); };
  const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  const num = (t) => { t = String(t).replace(/−/g, '-').replace(/,/g, ''); const m = t.match(/^(-?[\d.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUP[c]).join(''), 10)); const q = t.match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 190) + '] lacks [' + sub + ']'); return false; } return true; };
  const hasNot = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) >= 0) fails.push(tag + ' text [' + String(txt).slice(0, 190) + '] should not contain [' + sub + ']'); };
  let DEC = null;
  const nr = (got, exp, tag) => { cmp++; const tol = DEC !== null ? 0.5 * Math.pow(10, -DEC) * 1.02 + 1e-9 * Math.abs(exp) : 2.2e-5 * Math.abs(exp) + 1e-11; if (got == null || !isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false; } return true; };
  const n4 = (got, exp, tag) => { cmp++; const d = DEC !== null ? DEC : 4, tol = 0.5 * Math.pow(10, -d) * 1.02 + 2e-6 * Math.abs(exp); if (got == null || !isFinite(got) || Math.abs(got - exp) > tol) fails.push(tag + ' got [' + got + '] expected [' + exp + '] (decimals ' + d + ')'); };
  const sig4 = (got, exp, tag) => { cmp++; const mag = Math.floor(Math.log10(Math.max(Math.abs(exp), 1e-300))), tol = 0.5 * Math.pow(10, mag - 3) * 1.06 + 1e-13; if (!isFinite(got) || Math.abs(got - exp) > tol) fails.push(tag + ' got [' + got + '] expected [' + exp + '] (4 significant digits)'); };
  const pIs = (txt, p, tag) => { cmp++; if (DEC !== null) { if (/^less than/.test(txt)) { if (p >= Math.pow(10, -DEC)) fails.push(tag + ' p [' + txt + '] but expected ' + p); } else { const g = num(txt); if (Math.abs(g - p) > 0.5 * Math.pow(10, -DEC) * 1.02 + 1e-12) fails.push(tag + ' p got [' + txt + '] expected ' + p); } return; } if (/^less than/.test(txt)) { if (p >= 1e-7) fails.push(tag + ' p [' + txt + '] but expected ' + p); return; } if (p < 1e-7) { if (!(num(txt) < 2e-7)) fails.push(tag + ' tiny p [' + txt + '] expected about ' + p); return; } sig4(num(txt), p, tag + ' p'); };
  const rng = (txt, lo, hi, tag) => { cmp++; const m = String(txt).replace(/−/g, '-').match(/(-?[0-9.]+(?:e[+-]?[0-9]+)?) to (-?[0-9.]+(?:e[+-]?[0-9]+)?)/i); const tol = DEC !== null ? 0.5 * Math.pow(10, -DEC) * 1.05 + 1e-9 : 2.2e-5 * Math.max(Math.abs(lo), Math.abs(hi)) + 1e-11; if (!m || Math.abs(parseFloat(m[1]) - lo) > tol || Math.abs(parseFloat(m[2]) - hi) > tol) fails.push(tag + ' interval [' + txt + '] expected [' + lo + ' to ' + hi + ']'); };
  const rowOf = (rows, label) => (rows.filter((r) => r[0].indexOf(label) === 0)[0] || null);
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("lrBig"),sub:g("lrSub"),tip:g("lrTip"),body:vis("lrBody"),hint:vis("lrHint")?g("lrHint"):"",coef:rows("lrCoef"),fit:rows("lrFit"),anova:rows("lrAnova"),curves:rows("lrCurves"),curvesVis:vis("lrCurvesWrap"),curvesKey:g("lrCurvesKey"),inf:rows("lrInf"),infVis:vis("lrInfWrap"),pred:rows("lrPred"),predVis:vis("lrPredWrap"),predKey:g("lrPredKey"),inv:rows("lrInv"),invVis:vis("lrInvWrap"),what:rows("lrWhat"),whatVis:vis("lrWhatWrap"),write:g("lrWrite"),check:g("lrCheckList"),pxN:g("lrPxNote"),pyN:g("lrPyNote"),confN:g("lrConfNote"),modelN:g("lrModelNote"),originN:g("lrOriginNote"),wN:g("lrWNote"),sumN:g("lrSumNote"),nameN:g("lrNameNote"),decN:g("lrDecNote"),xN:g("lrXNote"),yN:g("lrYNote"),pN:g("lrPNote"),entryN:g("lrEntryNote"),svg1:document.getElementById("lrVis").innerHTML.length,svg2:document.getElementById("lrRes").innerHTML.length,visKey:g("lrVisKey"),mlab:g("lrMLab"),mval:g("lrMVal"),originVis:vis("lrOriginW")};})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("lrAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('lrAdvBtn'); };
  const ALLS = ['lrX', 'lrY', 'lrP', 'lrW', 'lrConf', 'lrNameX', 'lrNameY', 'lrPx', 'lrPy', 'lrDec', 'lrSN', 'lrSMx', 'lrSMy', 'lrSSxx', 'lrSSyy', 'lrSSxy'];
  const reset = async (entry, model, origin) => { await ctx.click('lrClear'); await ctx.seg('lrEntry', entry || 'lists'); await ctx.seg('lrModel', String(model || 1)); await ctx.seg('lrOrigin', origin ? 'zero' : 'fit'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const gen = (n, kind) => { const x = [], y = [], dec = pick([0, 0, 1, 2]), sl = pick([-3, -1, -0.4, 0.5, 2, 6]), nz = pick([0.5, 2, 8, 30]); const seen = new Set(); for (let i = 0; i < n; i++) { let a; do { a = +(ri(-40, 120) / pick([1, 1, 4])).toFixed(dec); } while (seen.has(a)); seen.add(a); let b = sl * a + (R() - 0.5) * 2 * nz * pick([1, 1, 3]); if (kind === 'curve') b += 0.05 * a * a; if (kind === 'origin') b = Math.abs(sl) * Math.abs(a) * 1.5 + (R() - 0.5) * nz; y.push(+b.toFixed(dec + 1)); x.push(a); } return { x, y }; };
  const eqNums = (big) => (big.replace(/−/g, '-').split(' = ')[1] || '').match(/\d+\.?\d*(e[+-]?\d+)?/gi) || [];

  await advOpen();

  async function compare(o, tag) {
    runs++; DEC = o.dec === undefined ? null : o.dec;
    const deg = o.deg || 1, origin = !!o.origin && deg === 1, n = o.x.length, level = o.confV !== undefined ? o.confV : 0.95, alpha = 1 - level;
    await reset(o.entry, deg, origin);
    const inputs = { lrConf: o.conf !== undefined ? o.conf : '', lrDec: o.dec !== undefined ? String(o.dec) : '', lrNameX: o.nx || '', lrNameY: o.ny || '', lrPx: o.px || '', lrPy: o.py || '', lrW: o.w ? o.w.join(' ') : '' };
    if (o.entry === 'pairs') inputs.lrP = o.x.map((v, i) => v + ', ' + o.y[i]).join('\n'); else { inputs.lrX = o.x.join(pick([' ', ', ', '\n'])); inputs.lrY = o.y.join(' '); }
    await setAll(inputs);
    const st = await read(), nmx = o.nx || 'X', nmy = o.ny || 'Y';
    cmp++; if (!st.body) { fails.push(tag + ' no result for ' + JSON.stringify(o).slice(0, 160) + ' hint [' + st.hint + ']'); return; }
    const f = ols(o.x, o.y, deg, origin, o.w), rr = (v) => fx(v, DEC !== null ? DEC : 4), raw = (v) => (DEC !== null ? fx(v, DEC) : (v === 0 ? '0' : sg(String(Number(v.toPrecision(6))))));
    /* the headline equation */
    const bn = eqNums(st.big), exp = f.co.map((v, j) => ({ v: Math.abs(v), j })).filter((e) => !(origin && e.j === 0));
    cmp++; if (bn.length !== exp.length) fails.push(tag + ' headline numbers [' + st.big + '] expected ' + exp.length); else bn.forEach((g, i) => nr(parseFloat(g), exp[i].v, tag + ' headline coef ' + i));
    has(st.big, nmy + ' = ', tag + ' headline'); if (deg >= 2) has(st.big, nmx + '²', tag + ' headline');
    /* sub line */
    const r2m = st.sub.match(/R² = (-?[\d.]+)/); cmp++; if (!r2m) fails.push(tag + ' sub [' + st.sub + '] has no R²'); else n4(parseFloat(r2m[1]), f.r2, tag + ' sub R2');
    has(st.sub, 'n = ' + n, tag + ' sub n');
    const pm = st.sub.match(/p = (\S+(?: × 10\S+)?)/); cmp++; if (!pm) fails.push(tag + ' sub no p'); else pIs(pm[1].replace(/ ·$/, ''), f.pF, tag + ' sub');
    /* coefficient table */
    const crow = st.coef.slice(1); cmp++; if (crow.length !== deg + 1) fails.push(tag + ' coef rows ' + crow.length);
    const tc = critT(alpha, f.df);
    crow.forEach((r, j) => { if (origin && j === 0) { has(r[1], '0 (fixed)', tag + ' fixed'); return; } const se = Math.sqrt(f.cov[j][j]); nr(num(r[1]), f.co[j], tag + ' est' + j); nr(num(r[2]), se, tag + ' se' + j); n4(num(r[3]), f.co[j] / se, tag + ' t' + j); pIs(r[4], pvT(f.co[j] / se, f.df), tag + ' coef p' + j); rng(r[5], f.co[j] - tc * se, f.co[j] + tc * se, tag + ' ci' + j); });
    /* fit table */
    const fr = (l) => rowOf(st.fit, l); let q;
    if ((q = fr('R²'))) n4(num(q[1]), f.r2, tag + ' fit R2'); else fails.push(tag + ' fit lacks R²');
    if ((q = fr('Adjusted R²'))) n4(num(q[1]), f.adj, tag + ' adjR2'); else fails.push(tag + ' fit lacks adjusted');
    if ((q = fr('S ('))) nr(num(q[1]), Math.sqrt(f.s2), tag + ' S'); else fails.push(tag + ' fit lacks S');
    if ((q = fr('F-statistic'))) { n4(num(q[1]), f.F, tag + ' F'); has(q[0], '(' + f.dfR + ', ' + f.df + ' degrees', tag + ' F df'); } else fails.push(tag + ' fit lacks F');
    if ((q = fr('p-value of the whole fit'))) pIs(q[1], f.pF, tag + ' fit p'); else fails.push(tag + ' fit lacks p');
    if (deg === 1 && !origin && !o.w) { const cq = fr('Correlation r'); cmp++; if (!cq) fails.push(tag + ' no r'); else { const rexp = Math.sqrt(f.r2) * (f.co[1] < 0 ? -1 : 1); n4(num(cq[1]), rexp, tag + ' r'); } const xi = fr('X-intercept'); if (xi && f.co[1] !== 0) nr(num(xi[1]), -f.co[0] / f.co[1], tag + ' x-int'); }
    /* anova */
    const ar = st.anova; if (ar.length >= 4) { nr(num(ar[1][1]), f.sst - f.sse, tag + ' SSR'); nr(num(ar[2][1]), f.sse, tag + ' SSE'); nr(num(ar[3][1]), f.sst, tag + ' SST'); has(ar[1][2], String(f.dfR), tag + ' dfR'); has(ar[2][2], String(f.df), tag + ' dfE'); } else fails.push(tag + ' anova rows');
    /* curves */
    if (!origin && !o.w) { cmp++; if (!st.curvesVis) fails.push(tag + ' curves hidden'); else { let prev = ols(o.x, o.y, 1, false, null); const cr = st.curves.slice(1); for (let d = 1; d <= 3; d++) { if (n < d + 2) continue; const g = ols(o.x, o.y, d, false, null), row = cr[d - 1]; if (!row) { fails.push(tag + ' curves row ' + d); continue; } n4(num(row[1]), g.r2, tag + ' curve R2 ' + d); if (d > 1) { const Fx = (prev.sse - g.sse) / (g.sse / g.df); pIs(row[4], pF(Fx, 1, g.df), tag + ' curve p' + d); } prev = g; } } } else { cmp++; if (st.curvesVis) fails.push(tag + ' curves should be hidden with origin / weights'); }
    /* influence: the top point */
    cmp++; if (!st.infVis) fails.push(tag + ' influence hidden'); else {
      let top = 0; f.D.forEach((d, i) => { if (d > f.D[top]) top = i; }); const row = st.inf[1];
      if (!row) fails.push(tag + ' no influence row'); else { cmp++; if (!isFinite(f.D[top])) { /* leverage 1: skipped */ } else { cmp++; if (row[0] !== '#' + (top + 1)) { const alt = f.D.map((d, i) => ({ d, i })).filter((a) => Math.abs(a.d - f.D[top]) < 1e-6 * Math.abs(f.D[top]) + 1e-9); if (!alt.some((a) => row[0] === '#' + (a.i + 1))) fails.push(tag + ' top point ' + row[0] + ' expected #' + (top + 1)); } else {
        n4(num(row[3]), f.D[top], tag + ' Cook D');
        const x2 = o.x.filter((_, i) => i !== top), y2 = o.y.filter((_, i) => i !== top), w2 = o.w ? o.w.filter((_, i) => i !== top) : null, g = ols(x2, y2, deg, origin, w2);
        if (deg === 1) nr(num(row[4]), g.co[1], tag + ' slope without'); n4(num(row[5]), g.r2, tag + ' R2 without'); } } }
    }
    /* what would it take (straight line, normal, no weights) */
    if (deg === 1 && !origin) { cmp++; if (!st.whatVis) fails.push(tag + ' what hidden'); else if (st.what[0]) {
      nr(num(st.what[0][1].replace('±', '')), tc * Math.sqrt(f.cov[1][1]), tag + ' smallest slope');
      const r = Math.sqrt(f.r2) * (f.co[1] < 0 ? -1 : 1);
      if (Math.abs(r) < 1 && r !== 0) { let nn = 4; while (!(Math.abs(r) * Math.sqrt((nn - 2) / (1 - r * r)) > critT(0.05, nn - 2))) { nn++; if (nn > 4000) break; } const row = st.what[1][1]; if (/^Already/.test(row)) { if (!(pvT(f.co[1] / Math.sqrt(f.cov[1][1]), f.df) < alpha)) fails.push(tag + ' "already significant" but p>=alpha'); } else if (alpha === 0.05 && nn <= 4000) { cmp++; if (num(row) !== nn) fails.push(tag + ' pairs for p<alpha [' + row + '] expected ' + nn); }
        const pw = Math.max(4, Math.ceil(Math.pow((zUp(0.025) + zUp(0.2)) / Math.atanh(Math.abs(r)), 2) + 3 - 1e-9)); if (alpha === 0.05) { cmp++; if (num(st.what[2][1]) !== pw) fails.push(tag + ' pairs for power [' + st.what[2][1] + '] expected ' + pw); }
        const se1 = Math.sqrt(f.cov[1][1]), hw = tc * se1; let m = n; const okN = (k) => critT(alpha, k - 2) * se1 * Math.sqrt((n - 1) / (k - 1)) <= hw / 2; while (!okN(m) && m < 100000) m++; cmp++; if (n < 40 && num(st.what[3][1].replace(/,/g, '')) !== m) fails.push(tag + ' halve [' + st.what[3][1] + '] expected ' + m); } } }
    /* predictions */
    if (o.px) { const xs = o.px.split(/[,\s]+/).map(Number); cmp++; if (!st.predVis) fails.push(tag + ' predictions hidden'); else { xs.forEach((xd, i) => { const row = st.pred[i + 1]; if (!row) { fails.push(tag + ' pred row ' + i); return; } const yh = f.co.reduce((a, cj, j) => a + cj * Math.pow(xd, j), 0), qv = f.quad(f.pvAt(xd)), sm = Math.sqrt(f.s2 * qv), sn = Math.sqrt(f.s2 * (1 + qv)); nr(num(row[1]), yh, tag + ' pred y'); rng(row[2], yh - tc * sm, yh + tc * sm, tag + ' pred mean'); rng(row[3], yh - tc * sn, yh + tc * sn, tag + ' pred new'); const out = xd < Math.min(...o.x) || xd > Math.max(...o.x); cmp++; if (out !== /\*$/.test(row[0])) fails.push(tag + ' outside flag [' + row[0] + '] for ' + xd); }); } }
    else { cmp++; if (st.predVis) fails.push(tag + ' predictions visible without X'); has(st.pxN, 'Optional', tag + ' px note'); }
    if (o.py) { const ys = o.py.split(/[,\s]+/).map(Number); if (deg === 1 && f.co[1] !== 0) { cmp++; if (!st.invVis) fails.push(tag + ' inverse hidden'); else ys.forEach((yv, i) => { const row = st.inv[i + 1]; if (row) nr(num(row[1]), origin ? yv / f.co[1] : (yv - f.co[0]) / f.co[1], tag + ' inverse'); else fails.push(tag + ' inv row'); }); } else { cmp++; if (st.invVis) fails.push(tag + ' inverse visible for a curve'); has(st.pyN, 'straight-line', tag + ' py note'); } }
    else { cmp++; if (st.invVis) fails.push(tag + ' inverse visible without Y'); }
    /* tip + write-up + notes */
    if (deg === 1) { has(st.tip, 'Each extra 1 of “' + nmx + '” goes with ' + raw(Math.abs(f.co[1])) + (f.co[1] >= 0 ? ' more' : ' less'), tag + ' tip'); has(st.tip, 'give or take ' + raw(Math.sqrt(f.cov[1][1])), tag + ' tip se'); if (origin) has(st.tip, 'forced through (0, 0)', tag + ' tip origin'); if (!origin) hasNot(st.tip, 'forced through', tag + ' tip no origin'); }
    else has(st.tip, (deg === 2 ? 'quadratic' : 'cubic') + ' curve explains', tag + ' tip curve');
    if (deg === 1 && st.write) { const b = f.co[1], se = Math.sqrt(f.cov[1][1]); has(st.write, nmx, tag + ' write'); has(st.write, 'b = ' + (b < 0 ? '−' : '') + (Math.abs(b) >= 100 ? Math.abs(b).toFixed(1) : Math.abs(b).toFixed(2)), tag + ' write b'); const lvl = String(Math.round(level * 1000) / 10); has(st.write, lvl + '% CI', tag + ' write ci'); }
    has(st.modelN, deg === 1 ? 'straight line' : deg === 2 ? 'quadratic' : 'cubic', tag + ' model note'); cmp++; if ((deg === 1) !== st.originVis) fails.push(tag + ' origin control visibility');
    has(st.wN, o.w ? 'Weights read: ' + n : 'Optional', tag + ' weights note'); has(st.confN, o.conf !== undefined ? String(Math.round(level * 1000) / 10) + '% level' : 'Leave empty for 95%', tag + ' conf note');
    cmp++; if (st.svg1 < 500 || st.svg2 < 500) fails.push(tag + ' pictures empty');
    has(st.mval, 'R² ', tag + ' sticky bar'); has(st.mlab, deg === 1 ? 'Best-fit line' : 'Best-fit curve', tag + ' sticky label');
  }

  /* ---- 1. random data across models ---- */
  const KINDS = ['line', 'line', 'line', 'line', 'line', 'line', 'origin', 'origin', 'curve2', 'curve2', 'curve3', 'weights', 'weights'];
  for (let it = 0; it < 112; it++) {
    const kind = KINDS[it % KINDS.length], deg = kind === 'curve2' ? 2 : kind === 'curve3' ? 3 : 1, n = ri(deg + 3, deg === 1 ? 20 : 16), d = gen(n, kind === 'curve2' || kind === 'curve3' ? 'curve' : kind === 'origin' ? 'origin' : 'line');
    const o = { x: d.x, y: d.y, deg, origin: kind === 'origin', entry: pick(['lists', 'pairs']) };
    if (kind === 'weights') o.w = d.x.map(() => ri(1, 5));
    if (R() < 0.3) o.conf = pick(['90', '99', '60']), o.confV = parseFloat(o.conf) / 100;
    if (R() < 0.15) o.dec = pick([2, 3, 5]);
    if (R() < 0.15) { o.nx = 'Hours'; o.ny = 'Score'; }
    if (R() < 0.6) o.px = [pick([5, 12.5, -3]), pick([40, 100])].slice(0, ri(1, 2)).join(pick([', ', ' ']));
    if (R() < 0.35) o.py = String(pick([10, 55, 70, 0]));
    await compare(o, 'run ' + it);
  }
  /* ---- 2. reference data sets ---- */
  const H = { x: [1.47, 1.50, 1.52, 1.55, 1.57, 1.60, 1.63, 1.65, 1.68, 1.70, 1.73, 1.75, 1.78, 1.80, 1.83], y: [52.21, 53.12, 54.48, 55.84, 57.20, 58.57, 59.93, 61.29, 63.11, 64.47, 66.28, 68.10, 69.92, 72.19, 74.46] };
  await compare({ x: H.x, y: H.y, entry: 'lists', px: '1.6' }, 'wikipedia heights');
  await reset('lists', 1, false); await setAll({ lrX: H.x.join(' '), lrY: H.y.join(' ') }); { const st = await read(); cmp++; const q = st.coef[2]; if (!(Math.abs(num(q[1]) - 61.272) < 0.001 && Math.abs(num(q[2]) - 1.776) < 0.001 && /57\.4\d* to 65\.1/.test(q[5]) && Math.abs(num(st.coef[1][1]) + 39.062) < 0.001)) fails.push('Wikipedia anchor: slope 61.272 (SE 1.776, 57.4 to 65.1), intercept -39.062 expected, got ' + JSON.stringify(st.coef)); }
  /* ---- 3. summary numbers equal the data run ---- */
  { const d = gen(12, 'line'), f = ols(d.x, d.y, 1, false, null), mx = d.x.reduce((a, b) => a + b, 0) / 12, my = d.y.reduce((a, b) => a + b, 0) / 12; let sxx = 0, syy = 0, sxy = 0; d.x.forEach((v, i) => { sxx += (v - mx) * (v - mx); syy += (d.y[i] - my) * (d.y[i] - my); sxy += (v - mx) * (d.y[i] - my); });
    await reset('summary', 1, false); runs++; await setAll({ lrSN: '12', lrSMx: String(mx), lrSMy: String(my), lrSSxx: String(sxx), lrSSyy: String(syy), lrSSxy: String(sxy), lrPx: '3' }); DEC = null; const st = await read(); cmp++;
    if (!st.body) fails.push('summary: no result [' + st.hint + ']'); else { nr(num(st.coef[2][1]), f.co[1], 'summary slope'); nr(num(st.coef[1][1]), f.co[0], 'summary intercept'); n4(num(rowOf(st.fit, 'R²')[1]), f.r2, 'summary R2'); cmp++; if (st.svg1 > 0) fails.push('summary: a picture was drawn without points'); has(st.sumN, 'All six numbers read', 'summary note');
      const qv = f.quad(f.pvAt(3)), tc = critT(0.05, 10), yh = f.co[0] + f.co[1] * 3; rng(st.pred[1][3], yh - tc * Math.sqrt(f.s2 * (1 + qv)), yh + tc * Math.sqrt(f.s2 * (1 + qv)), 'summary prediction'); }
    await ctx.set('lrSSxy', ''); const s2 = await read(); cmp++; if (s2.body) fails.push('summary: result stays with Sxy empty'); has(s2.sumN, 'Still needed: Sxy', 'summary missing note');
    await ctx.set('lrSSxy', String(Math.sqrt(sxx * syy) * 1.5)); const s3 = await read(); cmp++; if (s3.body || !/Sxy cannot be larger/.test(s3.hint)) fails.push('summary: |Sxy| too big should end the result with a hint [' + s3.hint + ']'); }
  /* ---- 4. hints and fallbacks ---- */
  await reset('lists', 2, false); await setAll({ lrX: '1 2 3', lrY: '2 4 7' }); { const st = await read(); cmp++; if (!st.body || !/needs at least 4 pairs/.test(st.hint)) fails.push('quadratic with 3 pairs should fall back to a line with a hint [' + st.hint + ']'); }
  await reset('lists', 1, false); await setAll({ lrX: '1 2 3 4 5', lrY: '2 4 7 8 11', lrW: '1 2 3' }); { const st = await read(); cmp++; if (!st.body || !/Weights: 3 numbers for 5 pairs/.test(st.hint)) fails.push('weights count mismatch: result stays + hint [' + st.hint + ']'); }
  await setAll({ lrW: '' }); await setAll({ lrPx: '1 abc' }); { const st = await read(); cmp++; if (!st.body) fails.push('junk in a predict list must not end the result'); }
  await setAll({ lrPx: 'abc' }); { const st = await read(); cmp++; if (!st.body || !/Couldn’t find a number in the X values/.test(st.hint)) fails.push('predict junk hint [' + st.hint + ']'); }
  await setAll({ lrPx: '' }); await setAll({ lrX: '3 3 3 3 3', lrY: '1 2 3 4 5' }); { const st = await read(); cmp++; if (st.body || !/numbers are the same/.test(st.hint)) fails.push('all X equal: [' + st.hint + ']'); }
  await setAll({ lrX: '1 2 3 4 5', lrY: '7 7 7 7 7' }); { const st = await read(); cmp++; if (!st.body || !/Y is the same everywhere|same/.test(st.sub + st.tip)) fails.push('flat Y: [' + st.sub + '] [' + st.tip + ']'); }
  await setAll({ lrX: '1 2 3 4 5', lrY: '2 4 6 8 10' }); { const st = await read(); cmp++; if (!st.body) fails.push('perfect line must give a result [' + st.hint + ']'); else { has(st.big, '2 × X', 'perfect line equation'); } }
  await setAll({ lrX: '1 2', lrY: '3 4' }); { const st = await read(); cmp++; if (st.body || !/at least 3 pairs/.test(st.hint)) fails.push('two pairs: [' + st.hint + ']'); }
  return { runs, fails: fails.slice(0, 40), cmp };
};
