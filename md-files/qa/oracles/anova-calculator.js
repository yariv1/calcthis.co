/* ORACLE for anova-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.anovaEngine or pvalueEngine). Normal tail from its own erfc series / continued fraction, F and t tails by tanh-sinh
   integration of the beta density, chi-square tails from finite sums, the studentized range by trapezoid rules (its own step sizes and variable), quantiles by bisection, power of the noncentral F by integrating the
   Poisson-mixture noncentral chi-square over the chi-square of the denominator, sample sizes checked as the smallest that works, grouping letters checked by their defining property. Shapiro-Wilk is checked against
   published values (Stats Kingdom and MiniWebtool outputs read 2026-11-27) and its shift / scale invariance. Compared with what the page DISPLAYS. */
module.exports = async function (ctx) {
  let seed = 20261127; const R = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  const bad = (m) => { if (fails.length < 60) fails.push(m); };
  /* ---------- maths ---------- */
  const erfc = (x) => { if (x < 0) return 2 - erfc(-x); if (x < 2.2) { let t = x, sum = x, n = 0; while (Math.abs(t) > 1e-17) { n++; t *= -x * x / n; sum += t / (2 * n + 1); } return 1 - 2 / Math.sqrt(Math.PI) * sum; } let f = 0; for (let n = 90; n >= 1; n--) f = n / 2 / (x + f); return Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f); };
  const Phi = (z) => 0.5 * erfc(-z / Math.SQRT2);
  const lgam = (x) => { let s = 0; while (x < 12) { s -= Math.log(x); x += 1; } const i = 1 / x, i2 = i * i; return s + (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + i * (1 / 12 - i2 * (1 / 360 - i2 * (1 / 1260 - i2 / 1680))); };
  /* integral of t^(a-1) (1-t)^(b-1) / B(a,b) from 0 to z */
  const ibeta = (z, a, b) => {
    if (z <= 0) return 0; if (z >= 1) return 1;
    if (z > (a + 1) / (a + b + 2)) return 1 - ibeta(1 - z, b, a);
    const lB = lgam(a) + lgam(b) - lgam(a + b), h = 1 / 64; let s = 0;
    for (let k = -340; k <= 340; k++) {
      const u = k * h, sh = Math.PI / 2 * Math.sinh(u), x = 1 / (1 + Math.exp(-2 * sh)), t = z * x; if (t <= 0 || t >= 1) continue;
      const w = Math.PI / 2 * Math.cosh(u) / (2 * Math.cosh(sh) * Math.cosh(sh));
      const v = Math.exp((a - 1) * Math.log(t) + (b - 1) * Math.log1p(-t) - lB); s += v * w;
    }
    return Math.min(1, s * h * z);
  };
  const fTail = (x, d1, d2) => x <= 0 ? 1 : ibeta(d2 / (d2 + d1 * x), d2 / 2, d1 / 2);
  const tTail2 = (t, v) => ibeta(v / (v + t * t), v / 2, 0.5);
  const solve = (f, target, hi0) => { let lo = 0, hi = hi0 || 1; while (f(hi) > target && hi < 1e12) hi *= 2; for (let i = 0; i < 70 && hi - lo > 1e-9 * (1 + hi); i++) { const m = (lo + hi) / 2; if (f(m) > target) lo = m; else hi = m; } return (lo + hi) / 2; };
  const fCrit = (a, d1, d2) => solve((x) => fTail(x, d1, d2), a);
  const tCrit = (a2, v) => solve((x) => tTail2(x, v), a2);
  const chiQ = (x, df) => { if (x <= 0) return 1; const h = x / 2, lh = Math.log(h); if (df % 2 === 0) { let lt = -h, sum = Math.exp(lt); for (let k = 1; k < df / 2; k++) { lt += lh - Math.log(k); sum += Math.exp(lt); } return Math.min(1, sum); } let sum = erfc(Math.sqrt(h)), lt = -h + 0.5 * lh - Math.log(0.5 * Math.sqrt(Math.PI)); for (let k = 1; k <= (df - 1) / 2; k++) { sum += Math.exp(lt); lt += lh - Math.log(k + 0.5); } return Math.min(1, sum); };
  const Tc = {};
  const rangeT = (w, k) => { let s = 0; const h = 0.22; for (let z = -9; z <= 9 + w; z += h) s += Math.exp(-z * z / 2) * Math.pow(Math.max(0, Phi(z) - Phi(z - w)), k - 1); return Math.max(0, 1 - k * s * h / Math.sqrt(2 * Math.PI)); };
  const rangeC = (w, k) => { const key = k + '|' + Math.round(w * 50); if (Tc[key] === undefined) Tc[key] = rangeT(Math.round(w * 50) / 50, k); return Tc[key]; };
  const rangeI = (w, k) => { if (w >= 14) return 0; const st = 0.02, i = Math.floor(w / st), u = w / st - i; const y = (n) => rangeC(Math.abs(n) * st, k); const a = y(i - 1), b = y(i), c = y(i + 1), d = y(i + 2); return b + 0.5 * u * (c - a + u * (2 * a - 5 * b + 4 * c - d + u * (3 * (b - c) + d - a))); };
  const qTail = (q, k, v) => {
    const lc = Math.log(2) + v / 2 * Math.log(v / 2) - lgam(v / 2), sd = 1 / Math.sqrt(2 * v);
    const lo = Math.max(-40, Math.min(-9 * sd, Math.log(1 / (1 + q)) - 40 / v)), hi = Math.max(9 * sd, v < 30 ? 3.2 : 0), n = Math.min(2400, Math.ceil((hi - lo) / Math.min(0.04, sd / 3))), h = (hi - lo) / n; let s = 0;
    for (let i = 0; i <= n; i++) { const u = lo + i * h, x = Math.exp(u), dens = Math.exp(lc + v * u - v * x * x / 2); if (dens < 1e-18) continue; s += dens * rangeI(q * x, k) * (i === 0 || i === n ? 0.5 : 1); }
    return Math.min(1, s * h);
  };
  const qMemo = {}; const qCrit = (a, k, v) => { const key = a + '|' + k + '|' + v; if (qMemo[key] === undefined) qMemo[key] = solve((x) => qTail(x, k, v), a, 8); return qMemo[key]; };
  const ncPow = (f, k, N, alpha, d2) => {
    d2 = d2 || N - k; const d1 = k - 1, lam = f * f * N, c = fCrit(alpha, d1, d2);
    if (lam > 900) return 1;
    const half = lam / 2, J = Math.ceil(half + 12 * Math.sqrt(half + 1) + 20), w = []; let lt = -half; for (let j = 0; j <= J; j++) { w.push(Math.exp(lt)); lt += Math.log(half || 1e-300) - Math.log(j + 1); }
    const sd = Math.sqrt(2 / d2), lo = Math.min(-9 * sd, -40 / d2 * 2), hi = Math.max(9 * sd, d2 < 30 ? 3.2 : 0), n = 700, h = (hi - lo) / n; let s = 0;
    for (let i = 0; i <= n; i++) {
      const u = lo + i * h, x = d2 * Math.exp(u), ld = (d2 / 2) * Math.log(x) - x / 2 - d2 / 2 * Math.log(2) - lgam(d2 / 2); const dens = Math.exp(ld); if (dens < 1e-14) continue;
      const t = c * d1 * x / d2; let q = 0, base = chiQ(t, d1), term = Math.exp(-t / 2 + (d1 / 2) * Math.log(t / 2) - lgam(d1 / 2 + 1));
      for (let j = 0; j <= J; j++) { q += w[j] * Math.min(1, base); base += term; term *= (t / 2) / (d1 / 2 + j + 1); }
      s += dens * q * (i === 0 || i === n ? 0.5 : 1);
    }
    return Math.min(1, s * h);
  };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const sortd = (a) => a.slice().sort((x, y) => x - y);
  const quant = (s, p) => { const h = (s.length - 1) * p, l = Math.floor(h); return l + 1 < s.length ? s[l] + (h - l) * (s[l + 1] - s[l]) : s[l]; };
  const desc = (x) => { const n = x.length, m = sum(x) / n, s = sortd(x), ss = s[0] === s[n - 1] ? 0 : sum(x.map((v) => v * v)) - n * m * m, ss2 = s[0] === s[n - 1] ? 0 : sum(x.map((v) => (v - m) * (v - m))), v = ss2 / (n - 1); return { n, mean: s[0] === s[n - 1] ? s[0] : m, ss: ss2, v, sd: Math.sqrt(v), total: sum(x), min: s[0], max: s[n - 1], median: quant(s, 0.5), alt: ss }; };
  const anova = (S, given) => { const k = S.length, N = sum(S.map((s) => s.n)), grand = sum(S.map((s) => s.n * s.mean)) / N, ssb = sum(S.map((s) => s.n * (s.mean - grand) ** 2)), dfw = given ? given.df : N - k, ssw = given ? given.msw * dfw : sum(S.map((s) => s.ss)), msw = ssw / dfw, msb = ssb / (k - 1), F = msb / msw; return { k, N, grand, ssb, ssw, sst: ssb + ssw, dfb: k - 1, dfw, msb, msw, F, p: fTail(F, k - 1, dfw), eta: ssb / (ssb + ssw), omega: Math.max(0, (ssb - (k - 1) * msw) / (ssb + ssw + msw)), f: Math.sqrt(ssb / ssw), adj: 1 - msw / ((ssb + ssw) / (N - 1)), pred: given ? null : Math.max(0, 1 - sum(S.map((s) => (s.n / (s.n - 1)) ** 2 * s.ss)) / (ssb + ssw)) }; };
  const welch = (S) => { if (S.some((s) => !(s.v > 0))) return null; const k = S.length, w = S.map((s) => s.n / s.v), Wt = sum(w), gm = sum(S.map((s, i) => w[i] * s.mean)) / Wt, A = sum(S.map((s, i) => w[i] * (s.mean - gm) ** 2)) / (k - 1), B = sum(S.map((s, i) => (1 - w[i] / Wt) ** 2 / (s.n - 1))), F = A / (1 + 2 * (k - 2) / (k * k - 1) * B), d2 = (k * k - 1) / (3 * B); return { F, d1: k - 1, d2, p: fTail(F, k - 1, d2), grand: gm }; };
  const ranks = (G) => { const all = [].concat(...G.map((g, i) => g.map((v) => [v, i]))); const N = all.length; const mr = G.map(() => 0); let tie = 0, ssr = 0; const vals = all.map((a) => a[0]); all.forEach(([v, i]) => { const less = vals.filter((x) => x < v).length, eq = vals.filter((x) => x === v).length, r = less + (eq + 1) / 2; mr[i] += r / G[i].length; ssr += (r - (N + 1) / 2) ** 2; tie += (eq * eq - 1); }); return { N, mr, ssr, T: tie / (12 * (N - 1)) }; };
  const kruskal = (G) => { const q = ranks(G); if (!(q.ssr > 1e-9)) return null; const H = (q.N - 1) * sum(G.map((g, i) => g.length * (q.mr[i] - (q.N + 1) / 2) ** 2)) / q.ssr; return Object.assign(q, { H, df: G.length - 1, p: chiQ(H, G.length - 1) }); };
  const levene = (G) => { const Z = G.map((g) => { const m = quant(sortd(g), 0.5); return desc(g.map((v) => Math.abs(v - m))); }); const a = anova(Z); return a.msw > 1e-24 ? a : null; };
  const fences = (x) => { if (x.length < 4) return { keep: x, out: [] }; const s = sortd(x), q1 = quant(s, 0.25), q3 = quant(s, 0.75), d = 1.5 * (q3 - q1); return { keep: x.filter((v) => v >= q1 - d && v <= q3 + d), out: x.filter((v) => v < q1 - d || v > q3 + d) }; };
  const pairsOf = (how, S, alpha, conf, C, K) => { const k = S.length, m = k * (k - 1) / 2, out = []; for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) { const a = S[i], b = S[j], o = { i, j, diff: how === 'dunn' ? K.mr[i] - K.mr[j] : a.mean - b.mean }; const D = Math.abs(o.diff); if (how === 'tukey') { const se = Math.sqrt(C.msw * (1 / a.n + 1 / b.n) / 2); o.p = qTail(D / se, k, C.dfw); o.half = qCrit(1 - conf, k, C.dfw) * se; o.need = qCrit(alpha, k, C.dfw) * se; o.stat = D / se; } else if (how === 'games') { const va = a.v / a.n, vb = b.v / b.n, df = (va + vb) ** 2 / (va * va / (a.n - 1) + vb * vb / (b.n - 1)), se = Math.sqrt((va + vb) / 2); o.p = qTail(D / se, k, df); o.half = qCrit(1 - conf, k, df) * se; o.need = qCrit(alpha, k, df) * se; o.stat = D / se; } else if (how === 'bonf') { const se = Math.sqrt(C.msw * (1 / a.n + 1 / b.n)); o.p = Math.min(1, m * tTail2(D / se, C.dfw)); o.half = tCrit((1 - conf) / m, C.dfw) * se; o.need = tCrit(alpha / m, C.dfw) * se; o.stat = D / se; } else { const se = Math.sqrt((K.N * (K.N + 1) / 12 - K.T) * (1 / a.n + 1 / b.n)); o.p = Math.min(1, m * erfc(D / se / Math.SQRT2)); const z = (pp) => solve((x) => erfc(x / Math.SQRT2), pp); o.half = z((1 - conf) / m) * se; o.need = z(alpha / m) * se; o.stat = D / se; } o.sig = o.p < alpha; out.push(o); } return out; };

  /* ---------- reading the page ---------- */
  const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  const num = (t) => { t = String(t).replace(/−/g, '-').replace(/,/g, ''); const m = t.match(/(-?[\d.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUP[c]).join(''), 10)); const q = t.match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, s, tag) => { cmp++; if (String(txt).indexOf(s) < 0) bad(tag + ' text [' + String(txt).slice(0, 220) + '] lacks [' + s + ']'); };
  let DEC = null;
  const tolOf = (exp, kind) => { if (DEC !== null) return 0.5 * Math.pow(10, -DEC) * 1.01 + 1e-6 * Math.abs(exp) + 1e-9; if (kind === 2) return (Math.abs(exp) < 0.01 ? Math.abs(exp) * 0.051 : 0.00505) + 1e-6 * Math.abs(exp) + 1e-9; return (Math.abs(exp) < 0.001 ? Math.abs(exp) * 6e-4 : 0.0000505) + 1e-6 * Math.abs(exp) + 1e-9; };
  const near = (txt, exp, tag, kind) => { cmp++; const g = num(txt); if (!(Math.abs(g - exp) <= tolOf(exp, kind))) bad(tag + ' got [' + txt + '] expected ' + exp); };
  const pIs = (txt, p, tag) => {
    cmp++; const t = String(txt).replace(/^p (=|(?=<))\s*/, '');
    if (/10⁻¹²/.test(t) && /less than|</.test(t)) { if (!(p < 1.001e-12)) bad(tag + ' p [' + txt + '] expected ' + p); return; }
    if (/<|less than/.test(t)) { const lim = num(t.replace(/less than|<|p/g, '')); if (!(p < lim * 1.02 || (DEC !== null && p < Math.pow(10, -DEC)))) bad(tag + ' p [' + txt + '] expected ' + p); return; }
    if (/10⁻¹²/.test(t) && /less than|</.test(t)) { if (!(p < 1.001e-12)) bad(tag + ' p [' + txt + '] expected ' + p); return; }
    const g = num(t);
    if (DEC !== null) { if (!(Math.abs(g - p) <= 0.5 * Math.pow(10, -DEC) * 1.01 + 2e-6 * p + 1e-9)) bad(tag + ' p [' + txt + '] expected ' + p); return; }
    const tol = p < 1e-4 ? p * 3e-3 + 2e-10 : 0.5 * Math.pow(10, Math.floor(Math.log10(Math.max(p, 1e-300))) - 3) * 1.08 + 3e-6 * p;
    if (!(Math.abs(g - p) <= tol)) bad(tag + ' p [' + txt + '] expected ' + p);
  };
  const READ = 'JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){var s=c.querySelector("small");if(!s)return c.textContent.replace(/\\s+/g," ").trim();var k=c.cloneNode(true);k.querySelector("small").remove();return k.textContent.trim()+"|"+s.textContent.trim();});});};' +
    'var o={big:g("anBig"),sub:g("anSub"),lab:g("anLab"),tip:g("anTip"),why:g("anWhy"),body:vis("anBody"),hint:vis("anHint")?g("anHint"):"",mval:g("anMVal"),write:g("anWrite"),steps:g("anSteps"),hyp:g("anHyp"),curve:g("anCurve"),tcrit:(document.querySelector("#anCurve .an-tcrit")||{}).textContent||""};' +
    '["anTests","anTable","anSumT","anSumF","anSumR","anPairs","anFull","anLoo","anPow","anEffT","anChk","anMatrix"].forEach(function(i){o[i]=rows(i);o[i+"V"]=vis(i+"")});' +
    '["anVisWrap","anPairsWrap","anTestsWrap","anTableWrap","anLooWrap","anPowWrap","anEffWrap","anCheckWrap","anCurveWrap"].forEach(function(i){o[i]=vis(i);});' +
    '["anAlphaNote","anEffNote","anDecNote","anConfNote","anOutNote","anPostNote","anMethodNote","anGivenNote","anGI1","anGI3","anColsNote","anStackNote","anSumKey","anLooKey","anVisKey","anDiffKey","anModeNote","anAnovaKey","anTableKey","anChkKey"].forEach(function(i){o[i]=g(i);});' +
    'var sv=document.querySelector("#anVis svg");o.lo=parseFloat(document.getElementById("anVis").getAttribute("data-lo"));o.hi=parseFloat(document.getElementById("anVis").getAttribute("data-hi"));' +
    'o.groups=sv?[].map.call(sv.querySelectorAll(".an-gr"),function(x){var m=x.querySelector(".an-mean"),c=x.querySelector(".an-ci"),l=x.querySelector(".an-let");return {g:+x.getAttribute("data-g"),name:x.querySelector(".an-nm").firstChild.textContent.trim(),mv:x.querySelector(".an-mv").textContent,letters:l?l.textContent:"",mean:m?parseFloat(m.getAttribute("d").slice(1)):null,ci:c?c.getAttribute("d"):"",dots:[].map.call(x.querySelectorAll(".an-dot"),function(d){return +d.getAttribute("cx");})};}):[];return o;})())';
  const read = async () => JSON.parse(await ctx.eval(READ));
  const bulk = (o) => ctx.eval('(function(o){Object.keys(o).forEach(function(k){__qa.set(k,String(o[k]));});return 1;})(' + JSON.stringify(o) + ')');
  const advOpen = async () => { if ((await ctx.eval('document.getElementById("anAdvIn").style.display')) === 'none') await ctx.click('anAdvBtn'); };
  const reset = async (mode, entry) => { await ctx.click('anClear'); await advOpen(); await ctx.seg('anMode', mode); await ctx.seg('anEntry', entry || 'boxes'); await ctx.seg('anSpread', 'sd'); await ctx.seg('anMethod', 'auto'); await ctx.seg('anOut', 'keep'); await ctx.seg('anEffType', 'f'); await ctx.set('anPost', 'auto'); DEC = null; };
  const letterName = (k) => 'abcdefghij'[k];

  /* ---------- one full comparison of a groups result ---------- */
  const check = async (o, tag) => {
    const st = await read();
    cmp++; if (!st.body) { bad(tag + ' no result, hint [' + st.hint + ']'); return st; }
    const { names, G, S, alpha, conf, given, method, post, effF } = o, k = S.length;
    const C = anova(S, given), W = given ? null : welch(S), K = G ? kruskal(G) : null, L = G ? levene(G) : null;
    const pCell = (c) => String(c).split('|')[1] || '';
    const swP = G && st.anChk.length > 1 && /all groups together/.test(st.anChk[1][0]) ? num(pCell(st.anChk[1][1]).replace(/less than|</g, '')) : null;
    const minN = Math.min(...S.map((s) => s.n)), lim = k <= 9 ? 15 : 20, uneven = !!(L && L.p < 0.05);
    const perGroup = st.anChk.filter((r) => /^Normality: /.test(r[0])).map((r) => /\d/.test(pCell(r[1])) ? num(pCell(r[1]).replace(/less than|</g, '')) : null).filter((v) => v !== null);
    const doubt = uneven ? perGroup.some((v) => v < 0.05 / k) : swP !== null && swP < 0.05;
    let rec = 'classic'; if (G && doubt && minN < lim && K) rec = 'kw'; else if (uneven && W) rec = 'welch';
    let m = method === 'auto' ? rec : method; if ((m === 'welch' && !W) || (m === 'kw' && !K)) m = 'classic';
    const res = m === 'welch' ? { s: W.F, d1: W.d1, d2: W.d2, p: W.p, sym: 'F' } : m === 'kw' ? { s: K.H, d1: K.df, d2: null, p: K.p, sym: 'H' } : { s: C.F, d1: C.dfb, d2: C.dfw, p: C.p, sym: 'F' };
    const sig = res.p < alpha;
    has(st.big, res.sym + ' = ', tag + ' symbol'); near(st.big.replace(/^[FH] = /, ''), res.s, tag + ' headline ' + m);
    has(st.sub, res.d2 === null ? 'df ' + res.d1 + ' ·' : 'df ' + res.d1 + ' and ', tag + ' sub df'); if (res.d2 !== null) { cmp++; const d2t = num((st.sub.match(/df \d+ and ([\d.]+)/) || [])[1] || ''); if (!(Math.abs(d2t - res.d2) <= 0.0051)) bad(tag + ' sub df2 ' + d2t + ' expected ' + res.d2); }
    pIs((st.sub.match(/p (?:=|<)[^·]+/) || [''])[0], res.p, tag + ' sub'); has(st.sub, C.N.toLocaleString('en-US') + ' values in ' + k + ' groups', tag + ' sub n'); cmp++; if (sig === /not significant/.test(st.sub)) bad(tag + ' significance [' + st.sub + '] p ' + res.p);
    has(st.lab, m === 'classic' ? 'One-way ANOVA' : m === 'welch' ? 'Welch ANOVA' : 'Kruskal-Wallis', tag + ' label'); if (method === 'auto' && G) has(st.lab, '(recommended here)', tag + ' recommended label');
    has(st.why, rec === 'kw' ? 'Kruskal-Wallis test is recommended' : rec === 'welch' ? 'Welch’s test, which does not assume equal spread, is recommended' : G ? 'classic one-way ANOVA is recommended' : 'summary numbers', tag + ' recommendation ' + rec);
    const three = [['classic', C.p], ['welch', W && W.p], ['kw', K && K.p]].filter((x) => x[1] !== null && x[1] !== undefined);
    if (three.length > 1) { const v = three.map((x) => x[1] < alpha); has(st.why, v.every((x) => x === v[0]) ? 'agree: ' + (v[0] ? 'significant.' : 'not significant.') : 'The tests disagree', tag + ' agreement'); }
    /* tests table */
    cmp++; if (st.anTests.length !== three.length + 1) bad(tag + ' tests rows ' + st.anTests.length + ' vs ' + three.length); else three.forEach((x, i) => { const row = st.anTests[i + 1], q = x[0] === 'classic' ? C.F : x[0] === 'welch' ? W.F : K.H; near(row[1].split('|')[0].replace(/^[FH] /, ''), q, tag + ' tests ' + x[0]); pIs(row[2].split('|')[0], x[1], tag + ' tests p ' + x[0]); });
    /* ANOVA table */
    const T = st.anTable; near(T[1][1], C.ssb, tag + ' ssb'); near(T[1][3], C.msb, tag + ' msb'); near(T[1][4], C.F, tag + ' F'); near(T[2][1], C.ssw, tag + ' ssw'); near(T[2][2], C.dfw, tag + ' dfw', 2); near(T[2][3], C.msw, tag + ' msw'); near(T[3][1], C.sst, tag + ' sst'); cmp++; if (num(T[1][2]) !== C.dfb) bad(tag + ' dfb');
    near((st.anTableKey.match(/critical F at α = [\d.e-]+ is ([^ ]+?)\.?(?: This|$)/) || [])[1] || '', fCrit(alpha, C.dfb, C.dfw), tag + ' crit F');
    /* groups */
    S.forEach((s, i) => { const r = st.anSumT[i + 1], q = st.anSumF[i + 1]; cmp++; if (num(r[1]) !== s.n) bad(tag + ' n ' + r[1]); near(r[2], s.mean, tag + ' mean', 2); if (!given) near(r[3], s.sd, tag + ' sd', 2);
      const df = m === 'classic' || given ? C.dfw : s.n - 1, se = m === 'classic' || given ? Math.sqrt(C.msw / s.n) : Math.sqrt(s.v / s.n), h = tCrit(1 - conf, df) * se, iv = r[4].split(' to '); near(iv[0], s.mean - h, tag + ' ci low ' + m, 2); near(iv[1], s.mean + h, tag + ' ci high', 2); o.ci = o.ci || []; o.ci[i] = [s.mean - h, s.mean + h];
      near(q[1], s.total === undefined ? s.n * s.mean : s.total, tag + ' total', 2); if (!given) { near(q[2], Math.sqrt(s.v / s.n), tag + ' se'); near(q[3], s.v, tag + ' variance', 2); near(q[4], s.ss, tag + ' ss', 2); } if (G) { const z = st.anSumR[i + 1]; near(z[1], s.min, tag + ' min', 2); near(z[5], s.max, tag + ' max', 2); near(z[3], s.median, tag + ' median', 2); const so = sortd(G[i]); near(z[2], quant(so, 0.25), tag + ' q1', 2); near(z[4], quant(so, 0.75), tag + ' q3', 2); } });
    near((st.anSumKey.match(/grand mean\): ([^ ]+?)\.(?: |$)/) || [])[1] || '', C.grand, tag + ' grand mean');
    /* pairs + letters */
    let how = post === 'auto' ? (m === 'welch' ? 'games' : m === 'kw' ? 'dunn' : 'tukey') : post;
    if (how === 'dunn' && !K) how = 'tukey'; if (how === 'games' && (given || S.some((s) => !(s.v > 0)))) how = 'tukey';
    let pr = null;
    if (how === 'none') { cmp++; if (st.anPairsWrap) bad(tag + ' pairs shown with none'); cmp++; if (st.groups.some((g) => g.letters)) bad(tag + ' letters with none'); }
    else {
      pr = pairsOf(how, S, alpha, conf, C, K);
      cmp++; if (st.anPairs.length !== pr.length + 1) bad(tag + ' pair rows ' + st.anPairs.length); else pr.forEach((q, ix) => { const r = st.anPairs[ix + 1]; has(r[0], ' vs ', tag); near(r[1], q.diff, tag + ' ' + how + ' diff', 2); const iv = r[2].split(' to '); const t2 = Math.max(0.0051, Math.abs(q.half) * 3e-5) + (DEC !== null ? 0.5 * Math.pow(10, -DEC) : 0); cmp += 2; if (!(Math.abs(num(iv[0]) - (q.diff - q.half)) <= t2) || !(Math.abs(num(iv[1]) - (q.diff + q.half)) <= t2)) bad(tag + ' ' + how + ' interval [' + r[2] + '] expected ' + (q.diff - q.half) + ' to ' + (q.diff + q.half)); const pt = r[3].replace(' *', ''); if (q.p < 1e-4 && DEC === null) { cmp++; if (!/< 0.0001/.test(pt)) bad(tag + ' small pair p ' + pt + ' ' + q.p); } else { cmp++; const g = num(pt); const tol = DEC !== null ? 0.5 * Math.pow(10, -DEC) * 1.01 + 2e-5 : 0.5 * Math.pow(10, Math.floor(Math.log10(q.p)) - 3) * 1.1 + 2e-5 * q.p; if (/<|less than/.test(pt) ? !(q.p < g + 2e-5) : !(Math.abs(g - q.p) <= tol)) bad(tag + ' ' + how + ' pair p [' + pt + '] expected ' + q.p); } cmp++; if (Math.abs(q.p - alpha) > 2e-5 && / \*/.test(r[3]) !== q.sig) bad(tag + ' star ' + r[3] + ' p ' + q.p); const f = st.anFull[ix + 1]; near(f[4], q.need, tag + ' ' + how + ' need', 2); near(f[2], q.stat, tag + ' ' + how + ' stat', 2); });
      const g = st.groups; cmp++; if (g.length !== k) bad(tag + ' picture groups'); else pr.forEach((q) => { if (Math.abs(q.p - alpha) < 2e-5) return; const a = g.find((x) => x.g === q.i).letters, b = g.find((x) => x.g === q.j).letters, share = [...a].some((c) => b.indexOf(c) >= 0); cmp++; if (!a || !b || share === q.sig) bad(tag + ' letters ' + a + ' / ' + b + ' for pair p ' + q.p + ' sig ' + q.sig); });
      const sg = pr.filter((q) => q.sig); if (!sg.length) has(st.tip, sig ? 'No single pair' : 'No pair differs', tag + ' tip no pair'); else has(st.tip, 'Different pairs', tag + ' tip pairs');
      has(st.anDiffKey, sg.length ? '' : 'not shown to be different', tag);
    }
    /* picture */
    const key = (i) => how === 'dunn' && K && how !== 'none' ? K.mr[i] : S[i].mean, X = (v) => 8 + (v - st.lo) / (st.hi - st.lo) * 344;
    st.groups.forEach((g, r) => { const s = S[g.g]; if (r) { cmp++; if (key(g.g) > key(st.groups[r - 1].g) + 1e-9) bad(tag + ' picture order'); } has(names[g.g], g.name.replace('…', ''), tag + ' picture name'); cmp++; if (Math.abs(g.mean - X(m === 'kw' ? s.median : s.mean)) > 0.02) bad(tag + ' picture tick ' + g.mean + ' vs ' + X(m === 'kw' ? s.median : s.mean)); if (m !== 'kw') { const a = g.ci.slice(1).split('H'); cmp++; if (Math.abs(parseFloat(a[0]) - X(o.ci[g.g][0])) > 0.05 || Math.abs(parseFloat(a[1]) - X(o.ci[g.g][1])) > 0.05) bad(tag + ' picture interval ' + g.ci); } if (G) { const vals = G[g.g]; cmp++; if (g.dots.length !== Math.min(150, vals.length)) bad(tag + ' dots ' + g.dots.length); else { const mn = Math.min(...g.dots), mx = Math.max(...g.dots); cmp++; if (Math.abs(mn - X(s.min)) > 0.02 || Math.abs(mx - X(s.max)) > 0.02) bad(tag + ' dot range'); if (vals.length <= 150) { cmp++; if (Math.abs(sum(g.dots) - sum(vals.map(X))) > 0.01 * vals.length) bad(tag + ' dot places'); } } cmp++; if (s.min < st.lo || s.max > st.hi) bad(tag + ' value outside scale'); } });
    /* leave one out */
    cmp++; if (st.anLooWrap !== (k >= 3)) bad(tag + ' loo visibility');
    if (k >= 3) names.forEach((n, i) => { const r = st.anLoo[i + 1]; const S2 = S.filter((_, j) => j !== i), G2 = G && G.filter((_, j) => j !== i); const q = m === 'kw' ? (() => { const z = kruskal(G2); return z && { s: z.H, p: z.p }; })() : m === 'welch' ? (() => { const z = welch(S2); return z && { s: z.F, p: z.p }; })() : (() => { const z = anova(S2, given && { msw: given.msw, df: given.df - (S[i].n - 1) }); return z.msw > 1e-12 && z.dfw > 0 ? { s: z.F, p: z.p } : null; })(); has(r[0], n.slice(0, 10), tag + ' loo name'); if (!q) { has(r[3], 'cannot run', tag + ' loo'); return; } near(r[1].replace(/^[FH] /, ''), q.s, tag + ' loo stat ' + m, 2); pIs(r[2], q.p, tag + ' loo p'); cmp++; if (((q.p < alpha) !== sig) !== /verdict changes/.test(r[3])) bad(tag + ' loo flip ' + r[3] + ' p ' + q.p); });
    /* planning */
    const P = st.anPow; const tk = how === 'tukey' && pr ? pr : pairsOf('tukey', S, alpha, conf, C, K), needs = tk.map((q) => q.need); const nd = P[0][1].replace(' by pair', '').split(' to '); near(nd[0], Math.min(...needs), tag + ' need low', 2); if (nd[1]) near(nd[1], Math.max(...needs), tag + ' need high', 2);
    const gm = sum(S.map((s) => s.mean)) / k, ssm = sum(S.map((s) => (s.mean - gm) ** 2)), f = Math.sqrt(ssm / k / C.msw);
    if (f > 1e-9 && /^[\d,]+$/.test(P[1][1])) { const n = num(P[1][1]); const ok = (nn) => nn * ssm / (k - 1) / C.msw > fCrit(alpha, k - 1, k * (nn - 1)) * (1 - 1e-7); cmp++; if (!ok(n) || (n > 2 && nn1(n))) bad(tag + ' n for significance ' + n); function nn1(x) { return (x - 1) * ssm / (k - 1) / C.msw > fCrit(alpha, k - 1, k * (x - 2)) * (1 + 1e-7); } }
    const pw = (txt, v, t2) => { cmp++; if (/over 99\.9%/.test(txt)) { if (!(v > 0.9989)) bad(t2 + ' power [' + txt + '] ' + v); } else if (!(Math.abs(num(txt) - v * 100) <= 0.08)) bad(t2 + ' power [' + txt + '] expected ' + v * 100); };
    if (C.f > 1e-9) pw(P[2][1], ncPow(C.f, k, C.N, alpha, C.dfw), tag + ' observed');
    const n80ok = (txt, ff, t2) => { if (!/^[\d,]+$/.test(txt)) return; const n = num(txt); if (n > 3000) return; cmp++; const hiP = ncPow(ff, k, k * n, alpha), loP = n > 2 ? ncPow(ff, k, k * (n - 1), alpha) : 0; if (!(hiP >= 0.8 - 2e-4 && loP < 0.8 + 2e-4)) bad(t2 + ' 80% n ' + n + ' gives ' + hiP + ' / ' + loP); };
    if (f > 1e-9) n80ok(P[3][1], f, tag);
    if (effF !== null) { cmp++; if (P.length !== 6) bad(tag + ' expected effect rows'); else { pw(P[4][1], ncPow(effF, k, C.N, alpha, C.dfw), tag + ' expected'); n80ok(P[5][1], effF, tag + ' expected'); pw((st.anEffNote.match(/values is (over 99\.9%|[\d.]+%)/) || [])[1] || '', ncPow(effF, k, C.N, alpha, C.dfw), tag + ' effect note'); } } else { cmp++; if (P.length !== 4) bad(tag + ' unexpected effect rows'); }
    /* effects */
    const E = st.anEffT.filter((r) => r[0] !== 'Note'); near(E[0][1], C.eta, tag + ' eta'); near(E[1][1], C.omega, tag + ' omega'); near(E[2][1], C.f, tag + ' f'); near(E[3][1], Math.sqrt(C.msw), tag + ' S'); cmp += 2; if (Math.abs(num(E[4][1]) - C.eta * 100) > 0.051) bad(tag + ' R2'); if (Math.abs(num(E[5][1]) - C.adj * 100) > 0.051) bad(tag + ' adj'); if (!given) { cmp++; if (Math.abs(num(E[6][1]) - C.pred * 100) > 0.051) bad(tag + ' pred ' + E[6][1] + ' vs ' + C.pred * 100); }
    has(E[2][1], C.f < 0.1 ? 'below small' : C.f < 0.25 ? 'small' : C.f < 0.4 ? 'medium' : 'large', tag + ' f word');
    /* checks */
    cmp++; if (st.anCheckWrap !== !!G) bad(tag + ' check visibility');
    if (G && L) { const row = st.anChk.find((r) => /Levene/.test(r[0])); cmp++; if (!row) bad(tag + ' no Levene row'); else { near(row[1].split('|')[0].replace(/^W /, ''), L.F, tag + ' Levene'); pIs(row[1].split('|')[1], L.p, tag + ' Levene p'); } }
    /* curve, write-up, steps */
    const cr = m === 'kw' ? solve((x) => chiQ(x, res.d1), alpha) : fCrit(alpha, res.d1, res.d2); near(st.tcrit.replace('critical ', ''), cr, tag + ' curve critical', 2);
    has(st.write, (m === 'kw' ? 'H(' : 'F(') + res.d1, tag + ' write'); has(st.write, res.s.toFixed(2), tag + ' write stat'); has(st.hyp, 'p ' + (sig ? 'is below' : 'is not below'), tag + ' decision'); has(st.steps, m === 'kw' ? 'Rank all' : m === 'welch' ? 'Weight of each group' : 'Grand mean', tag + ' steps');
    if (!given) near((st.anAlphaNote.match(/Critical F \(classic\): ([^ ]+?)\.?$/) || [])[1] || '', fCrit(alpha, C.dfb, C.dfw), tag + ' alpha note');
    return st;
  };

  /* ---------- random data ---------- */
  const randGroups = (k, nmin, nmax) => { const dec = pick([0, 0, 1, 2]), base = pick([0, 10, 100, -50, 1000]), sc = pick([1, 5, 25]), shift = pick([0, 0.3, 1, 3]), skew = R() < 0.2, het = R() < 0.25; for (;;) { const G = [...Array(k)].map((_, i) => { const n = ri(nmin, nmax), mu = base + (R() - 0.5) * 2 * shift * sc, s = sc * (het && i === 0 ? 5 : 1); return [...Array(n)].map(() => +(mu + s * (skew ? -Math.log(1 - R() * 0.999) : (R() + R() + R() - 1.5) * 1.6)).toFixed(dec)); }); if (G.some((g) => Math.min(...g) !== Math.max(...g))) return G; } };
  const options = async (allowEff) => { const o = { alpha: pick(['', '', '', '0.1', '0.01', '1%', '0.001', '0.2']), conf: pick(['', '', '', '90', '99', '0.9']), eff: allowEff ? pick(['', '', '0.1', '0.25', '0.5', '0.9']) : '', dec: pick(['', '', '', '', '2', '3', '6']) }; o.efft = o.eff ? pick(['f', 'f2', 'eta']) : 'f'; await ctx.seg('anEffType', o.efft); await bulk({ anAlpha: o.alpha, anConf: o.conf, anEff: o.eff, anDec: o.dec }); const alpha = o.alpha === '' ? 0.05 : /%/.test(o.alpha) ? parseFloat(o.alpha) / 100 : +o.alpha, conf = o.conf === '' ? 1 - alpha : +o.conf > 1 ? +o.conf / 100 : +o.conf; DEC = o.dec === '' ? null : +o.dec; const e = +o.eff; return { alpha, conf, effF: o.eff === '' ? null : o.efft === 'f' ? e : o.efft === 'f2' ? Math.sqrt(e) : Math.sqrt(e / (1 - e)) }; };

  await advOpen();
  /* ---------- raw data, all three ways of typing ---------- */
  for (let it = 0; it < 78; it++) {
    const entry = it % 6 === 4 ? 'cols' : it % 6 === 5 ? 'stack' : 'boxes', k = it % 11 === 0 ? ri(7, 10) : it % 4 === 0 ? 2 : ri(3, 5), G0 = randGroups(k, it % 5 === 0 ? 2 : 4, it % 13 === 0 ? 40 : it % 9 === 0 ? 3 : 12), tag = 'raw#' + it + ' ' + entry;
    await reset('raw', entry);
    const o = await options(true), named = R() < 0.6, names = G0.map((_, i) => named ? 'Team ' + letterName(i) : 'Group ' + (i + 1));
    if (entry === 'boxes') { for (let i = 3; i < k; i++) await ctx.click('anAddG'); if (k === 2) await ctx.click('anDelG'); const v = {}; G0.forEach((g, i) => { v['anGV' + (i + 1)] = g.join(pick([', ', ' ', ',', '\n', '; '])); if (named) v['anGN' + (i + 1)] = names[i]; }); await bulk(v); }
    else if (entry === 'cols') { const sep = pick([', ', '\t', '; ']), len = Math.max(...G0.map((g) => g.length)), lines = named ? [names.join(sep)] : []; for (let r = 0; r < len; r++) lines.push(G0.map((g) => g[r] === undefined ? '' : g[r]).join(sep)); await ctx.set('anCols', lines.join('\n')); }
    else { const sep = pick([', ', '\t', '; ']), first = R() < 0.5, lines = []; G0.forEach((g, i) => g.forEach((v) => lines.push(first ? v + sep + names[i] : names[i] + sep + v))); await ctx.set('anStack', lines.join('\n')); }
    const method = it % 3 === 0 ? pick(['classic', 'welch', 'kw']) : 'auto', post = it % 4 === 1 ? pick(['tukey', 'games', 'bonf', 'dunn', 'none']) : 'auto', drop = it % 7 === 3;
    await ctx.seg('anMethod', method); await ctx.set('anPost', post); await ctx.seg('anOut', drop ? 'drop' : 'keep');
    const G = drop ? G0.map((g) => fences(g).keep) : G0;
    if (G.some((g) => g.length < 2) || G.every((g) => Math.min(...g) === Math.max(...g))) continue;
    runs++; const st = await check({ names, G, S: G.map(desc), alpha: o.alpha, conf: o.conf, given: null, method, post, effF: o.effF }, tag);
    if (drop) has(st.anOutNote, G.some((g, i) => g.length !== G0[i].length) ? 'Left out' : 'No value is far enough', tag + ' outlier note');
    if (entry !== 'boxes') has(entry === 'cols' ? st.anColsNote : st.anStackNote, 'Read ' + k + ' groups', tag + ' read note');
    /* click another pair */
    if (st.anPairs.length > 3 && it % 5 === 1) { const ix = ri(0, st.anPairs.length - 2); await ctx.eval('document.querySelectorAll("#anPairs tr[data-i] .an-pk")[' + ix + '].click()'); const s2 = await read(); runs++; has(s2.anDiffKey, s2.anPairs[ix + 1][1], 'picked pair ' + tag); const nm = st.anPairs[ix + 1][0].split(' vs '); has(s2.anDiffKey, nm[0].replace('…', ''), 'picked pair name ' + tag); }
  }
  /* ---------- summary numbers, with and without a typed mean square ---------- */
  for (let it = 0; it < 30; it++) {
    const k = ri(2, 6), tag = 'sum#' + it, sem = it % 3 === 1, given = it % 4 === 2;
    await reset('sum'); await ctx.seg('anSpread', sem ? 'sem' : 'sd'); const o = await options(true);
    for (let i = 3; i < k; i++) await ctx.click('anAddS'); if (k === 2) await ctx.click('anDelS');
    const v = {}, S = [], names = [], base = pick([5, 80, -20]);
    for (let i = 0; i < k; i++) { const n = ri(2, 60), mean = +(base + R() * 8).toFixed(2), spread = +(R() * 5 + 0.2).toFixed(3), sd = sem ? spread * Math.sqrt(n) : spread; v['anSC' + (i + 1)] = n; v['anSM' + (i + 1)] = mean; v['anSS' + (i + 1)] = given ? '' : spread; names.push('Group ' + (i + 1)); S.push({ n, mean, v: given ? NaN : sd * sd, sd: given ? NaN : sd, ss: given ? 0 : sd * sd * (n - 1) }); }
    let gv = null; if (given) { const msw = +(R() * 20 + 0.5).toFixed(3), own = R() < 0.5, df = own ? ri(5, 200) : sum(S.map((s) => s.n)) - k; v.anMsw = msw; v.anDfw = own ? df : ''; gv = { msw, df }; }
    await bulk(v);
    const method = it % 3 === 0 ? pick(['classic', 'welch', 'kw']) : 'auto', post = it % 4 === 1 ? pick(['tukey', 'games', 'bonf', 'dunn', 'none']) : 'auto';
    await ctx.seg('anMethod', method); await ctx.set('anPost', post);
    runs++; const st = await check({ names, G: null, S, alpha: o.alpha, conf: o.conf, given: gv, method, post, effF: o.effF }, tag); if (given) has(st.anGivenNote, 'is used instead', tag);
    if ((method === 'kw' || (method === 'welch' && given)) && st.body) has(st.hint, 'shown for now', tag + ' fallback hint');
  }
  /* ---------- F value ---------- */
  for (let it = 0; it < 36; it++) {
    const d1 = pick([1, 2, 3, 4, 6, 10, 25, 100]), d2 = pick([1, 2, 5, 12, 30, 60, 500, 10000]), x = it % 6 === 5 ? null : +(pick([R() * 2, R() * 8, R() * 40])).toFixed(ri(0, 3)), tag = 'F#' + it + ' ' + x + '/' + d1 + '/' + d2;
    await reset('f'); const o = await options(false); await bulk({ anDf1: d1, anDf2: d2, anFv: x === null ? '' : x });
    runs++; const st = await read(); cmp++; if (!st.body) { bad(tag + ' no result ' + st.hint); continue; }
    const cr = fCrit(o.alpha, d1, d2);
    if (x === null) { near(st.big, cr, tag + ' critical'); has(st.lab, 'F critical value', tag); has(st.write, 'The critical value of F', tag); }
    else { const p = fTail(x, d1, d2); pIs(st.big, p, tag + ' p'); near((st.sub.match(/critical F ([^ ]+)/) || [])[1] || '', cr, tag + ' critical'); cmp++; if ((p < o.alpha) === /not significant/.test(st.sub)) bad(tag + ' significance ' + st.sub); has(st.write, 'F(' + d1 + ', ' + d2 + ') = ' + x.toFixed(2), tag + ' write'); }
    near(st.tcrit.replace('critical ', ''), cr, tag + ' curve', 2); cmp++; if (st.anPowWrap || st.anTableWrap || st.anVisWrap) bad(tag + ' group panels shown');
  }
  /* ---------- published values (Shapiro-Wilk, Levene, Welch, Kruskal-Wallis, Tukey) and invariance ---------- */
  const typed = async (G) => { await reset('raw'); for (let i = 3; i < G.length; i++) await ctx.click('anAddG'); const v = {}; G.forEach((g, i) => { v['anGV' + (i + 1)] = g.join(' '); }); await bulk(v); runs++; return read(); };
  const SK = [[1, 2, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7], [1, 1, 1, 2, 2, 2, 3, 4, 5, 6, 7, 8], [8, 8, 8, 8, 8, 4, 4, 12, 12]];
  { const st = await typed(SK); const row = (re) => st.anChk.find((r) => re.test(r[0]));
    const pc = (r) => r[1].split('|')[1], wc = (r) => r[1].split('|')[0].replace('W ', ''); pIs(pc(row(/all groups together/)), 0.3701, 'published residual Shapiro'); has(st.big, '11.0293', 'published F'); pIs((st.sub.match(/p = [^·]+/) || [''])[0], 0.0002412, 'published p'); near(pc(row(/Group 1/)).replace('p = ', ''), 0.9065, 'published group 1', 4); near(pc(row(/Group 2/)).replace('p = ', ''), 0.096, 'published group 2 p', 2); near(pc(row(/Group 3/)).replace('p = ', ''), 0.04885, 'published group 3 p', 2); near(pc(row(/Levene/)).replace('p = ', ''), 0.4817, 'published Levene');
    near(st.anPairs[1][3].replace(' *', ''), 0.7603, 'published Tukey 1-2'); near(st.anPairs[2][3].replace(' *', ''), 0.001569, 'published Tukey 1-3'); near(st.anPairs[3][3].replace(' *', ''), 0.000316, 'published Tukey 2-3', 4); near(st.anPow[2][1], 99.1, 'published power', 2);
    const st2 = await typed(SK.map((g) => g.map((v) => v * 3 + 100))); cmp++; if (JSON.stringify(st2.anChk.map((r) => r.slice(1))) !== JSON.stringify(st.anChk.map((r) => r.slice(1))) || st2.big !== st.big) bad('shift / scale invariance'); }
  { const st = await typed([[23, 25, 28, 30, 27], [31, 33, 35, 29, 34], [22, 24, 21, 26, 23]]); const sw = st.anChk.filter((r) => /^Normality: /.test(r[0])); [[0.99, 0.98], [0.96, 0.79], [0.98, 0.93]].forEach((e, i) => { cmp++; if (Math.abs(num(sw[i][1].split('|')[0].replace('W ', '')) - e[0]) > 0.0051 || Math.abs(num(sw[i][1].split('|')[1].replace('p = ', '')) - e[1]) > 0.0051) bad('published Shapiro group ' + i + ' ' + sw[i].join(' ')); }); has(st.anTests[2][1], '20.53', 'published Welch'); has(st.anTests[3][1], '10.46', 'published Kruskal-Wallis'); has(st.big, '19.3214', 'published F'); }
  /* three tests of one skewed set pick the rank test; an uneven one picks Welch */
  { const st = await typed([[2, 3, 3, 4, 4, 5, 21], [6, 7, 7, 8, 9, 9, 40], [3, 3, 4, 5, 5, 6, 7]]); has(st.lab, 'Kruskal-Wallis test (recommended here)', 'skewed picks rank test'); const st2 = await typed([[50, 51, 49, 50, 52, 48, 51, 50], [55, 68, 41, 72, 38, 66, 49, 59], [47, 46, 48, 47, 49, 45, 48, 46]]); has(st2.lab, 'Welch ANOVA (recommended here)', 'uneven picks Welch'); }
  /* ---------- hints and notes ---------- */
  const hintCase = async (setup, want, bodyWanted, tag) => { await setup(); runs++; const st = await read(); has(st.hint, want, tag + ' hint'); cmp++; if (st.body !== bodyWanted) bad(tag + ' body ' + st.body + ' hint ' + st.hint); return st; };
  const two = async (a, b, c) => { await reset('raw'); await bulk({ anGV1: a, anGV2: b, anGV3: c || '' }); };
  await hintCase(() => two('5 6 7', ''), 'second group', false, 'one group');
  await hintCase(() => two('5 6 7', '4'), 'at least 2 values', false, 'single value');
  await hintCase(() => two('5 6 x7', '4 5'), 'Couldn’t read “x7”', false, 'junk');
  await hintCase(() => two('5 6 2000000000', '4 5'), 'too large', false, 'huge');
  await hintCase(() => two('5 5 5', '4 4 4'), 'no spread inside', false, 'constant groups');
  await hintCase(() => two('5 5 5', '5 5 5'), 'Every value is the same', false, 'all same');
  { await two('5 6 7 -', '4 5 6'); runs++; const st = await read(); cmp++; if (!st.body || st.hint) bad('half-typed last value ' + st.hint); }
  { await two('1,5 2,5', '4 5 6'); runs++; const st = await read(); has(st.anGI1, '4 values', 'commas separate values'); }
  for (const [id, v, w] of [['anAlpha', '2', 'between 0.000001 and 1'], ['anDec', '2.5', 'from 0 to 10'], ['anConf', '20', '50% to 99.99%'], ['anEff', '-1', 'above 0']]) await hintCase(async () => { await two('5 6 7', '8 9 12'); await ctx.set(id, v); }, w, true, id + '=' + v);
  await hintCase(async () => { await two('5 6 7', '8 9 12'); await ctx.seg('anEffType', 'eta'); await ctx.set('anEff', '1'); }, 'below 1', true, 'eta 1');
  await hintCase(async () => { await reset('raw', 'cols'); await ctx.set('anCols', 'A, B\n1, x\n2, 3'); }, 'couldn’t read', false, 'columns junk');
  await hintCase(async () => { await reset('raw', 'cols'); await ctx.set('anCols', [...Array(21)].map((_, i) => i).join(', ') + '\n' + [...Array(21)].map((_, i) => i + 2).join(', ')); }, 'up to 20', false, '21 columns');
  await hintCase(async () => { await reset('raw', 'stack'); await ctx.set('anStack', [...Array(22)].map((_, i) => i + ', g' + i).join('\n')); }, 'more than 20 groups', false, '22 groups');
  { await reset('raw', 'stack'); await ctx.set('anStack', '5, A\n6, A\n7, B\n9, B\nbroken'); runs++; const st = await read(); has(st.anStackNote, '1 line was skipped', 'skipped line'); }
  const sm = async (o) => { await reset('sum'); await bulk(o); };
  await hintCase(() => sm({ anSC1: 5, anSM1: 3, anSS1: 1 }), 'Fill every box', false, 'summary partial');
  await hintCase(() => sm({ anSC1: 1, anSM1: 3, anSS1: 1, anSC2: 5, anSM2: 4, anSS2: 1 }), 'from 2 to 1,000,000', false, 'n one');
  await hintCase(() => sm({ anSC1: 5, anSM1: 3, anSS1: -1, anSC2: 5, anSM2: 4, anSS2: 1 }), '0 or more', false, 'negative sd');
  await hintCase(() => sm({ anSC1: 5, anSM1: 3, anSS1: 0, anSC2: 5, anSM2: 4, anSS2: 0 }), 'no spread', false, 'zero sd');
  await hintCase(async () => { await sm({ anSC1: 5, anSM1: 3, anSS1: 1, anSC2: 5, anSM2: 4, anSS2: 1 }); await ctx.set('anMsw', '-2'); }, 'above 0', true, 'bad mean square');
  { await sm({ anSC1: 5, anSM1: 3, anSS1: 1, anSC2: 5, anSM2: 4, anSS2: 1 }); await ctx.set('anDfw', '9'); runs++; const st = await read(); has(st.anGivenNote, 'Type the within mean square too', 'df without mean square'); }
  { await sm({ anSN1: 'North' }); runs++; const st = await read(); cmp++; if (st.body) bad('name only gives result'); }
  const fm = async (o) => { await reset('f'); await bulk(o); };
  await hintCase(() => fm({ anDf1: 2 }), 'both degrees of freedom', false, 'df2 missing');
  await hintCase(() => fm({ anDf1: 2.5, anDf2: 10 }), 'whole number', false, 'df1 fraction');
  await hintCase(() => fm({ anDf1: 2, anDf2: 0 }), 'from 1 to', false, 'df2 zero');
  await hintCase(() => fm({ anDf1: 2, anDf2: 12, anFv: -3 }), 'ignored for now', true, 'negative F');
  /* names typed before values, effect size before groups */
  await reset('raw'); await bulk({ anGN1: 'North', anEff: '0.3', anAlpha: '0.01' }); runs++; { const st = await read(); has(st.anGI1, 'Type this group’s values', 'name early'); has(st.anEffNote, 'Type the groups first', 'effect early'); has(st.anAlphaNote, 'below 0.01 counts', 'alpha early'); cmp++; if (st.body) bad('early body'); }
  /* examples, citation style, go simple */
  for (const ex of ['methods', 'feed', 'spread', 'skew']) for (const entry of ['boxes', 'cols', 'stack']) { await reset('raw', entry); await ctx.eval('document.querySelector("#anExChips [data-v=' + ex + ']").click()'); runs++; const st = await read(); cmp++; if (!st.body) bad('example ' + ex + ' ' + entry + ' ' + st.hint); }
  await reset('sum'); await ctx.eval('document.querySelector("#anExChips [data-v=methods]").click()'); runs++; has((await read()).big, 'F = 19.32', 'summary example');
  await two('23 25 28 30 27', '31 33 35 29 34', '22 24 21 26 23'); await ctx.eval('document.querySelector("#anCiteChips [data-v=plain]").click()'); runs++; has((await read()).write, 'The groups really do differ', 'plain style'); await ctx.eval('document.querySelector("#anCiteChips [data-v=apa]").click()'); has((await read()).write, 'A one-way ANOVA showed', 'apa style');
  await ctx.seg('anMethod', 'kw'); await ctx.set('anPost', 'bonf'); await ctx.set('anDec', '2'); await ctx.click('anAdvBtn'); runs++; { const st = await read(); has(st.big, 'F = 19.3214', 'go simple resets'); has(st.anPairsWrap ? 'yes' : 'no', 'yes', 'pairs back'); } await advOpen(); has((await read()).anPostNote, 'Follows the test', 'post reset');
  return { runs, fails: fails.slice(0, 40), cmp };
};
