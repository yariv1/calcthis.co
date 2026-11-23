/* ORACLE for correlation-coefficient-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.ccEngine / pvalueEngine / ciEngine / ttEngine).
   t tail probabilities by composite Simpson over a Stirling-series log-gamma density; critical values by bisection; the normal cdf by its power series; ranks by counting; Kendall tau-b by brute force with the tie terms
   typed from the textbook; leave-one-out by recomputing r from scratch for every point; least squares and prediction intervals from the textbook formulas; Fisher intervals with Math.atanh / Math.tanh.
   Compared with what the page DISPLAYS (headline, sub line, tip, numbers / side-by-side / leave-one-out / what-would-it-take / prediction tables, write-up sentence, notes, hints, sticky bar) for lists and pairs entry,
   the three tails, alpha, confidence level, decimals, names, weights, the three headline coefficients and a prediction. */
module.exports = async function (ctx) {
  let s = 20261123; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  /* ---- maths ---- */
  const lgam = (x) => { let sh = 0; while (x < 12) { sh += Math.log(x); x += 1; } const i = 1 / x; return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + i / 12 - i * i * i / 360 + Math.pow(i, 5) / 1260 - Math.pow(i, 7) / 1680 - sh; };
  const tpdf = (x, v) => Math.exp(lgam((v + 1) / 2) - lgam(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + x * x / v));
  const simpson = (f, a, b, n) => { if (n % 2) n++; const h = (b - a) / n; let t = f(a) + f(b); for (let i = 1; i < n; i++) t += f(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
  const tail = (t, v) => { if (t < 1) return 0.5 - simpson((x) => tpdf(x, v), 0, t, 2000); const C = lgam((v + 1) / 2) - lgam(v / 2) - 0.5 * Math.log(v * Math.PI); return simpson((y) => { if (y === 0) return v > 1 ? 0 : (v === 1 ? 1 / Math.PI : 0); return Math.exp(C - (v + 1) / 2 * Math.log(1 + 1 / (y * y * v)) - 2 * Math.log(y)); }, 0, 1 / t, 6000); };
  const pvT = (t, v) => { if (!isFinite(t)) return { left: t > 0 ? 1 : 0, right: t > 0 ? 0 : 1, two: 0 }; const a = Math.abs(t), q = tail(a, v), two = Math.min(1, 2 * q); return { left: t >= 0 ? 1 - q : q, right: t >= 0 ? q : 1 - q, two }; };
  const critT = (alpha, v, tl) => { const target = tl === 'two' ? alpha / 2 : alpha; let a = 0, b = 1; while (tail(b, v) > target) b *= 2; for (let i = 0; i < 70; i++) { const m = (a + b) / 2; if (tail(m, v) > target) a = m; else b = m; } return (a + b) / 2; };
  const PHI = (x) => { if (x > 8.3) return 1; if (x < -8.3) return 0; let term = x, sum = x, k = 0; while (Math.abs(term) > 1e-19 && k < 400) { k++; term *= x * x / (2 * k + 1); sum += term; } return 0.5 + sum * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); };
  const zUp = (a) => { let lo = 0, hi = 10; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (1 - PHI(m) > a) lo = m; else hi = m; } return (lo + hi) / 2; };
  const mean = (a) => a.reduce((p, c) => p + c, 0) / a.length;
  const sumsOf = (x, y) => { const n = x.length; let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0; for (let i = 0; i < n; i++) { sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; syy += y[i] * y[i]; sxy += x[i] * y[i]; } return { n, sx, sy, sxx, syy, sxy, cxx: sxx - sx * sx / n, cyy: syy - sy * sy / n, cxy: sxy - sx * sy / n }; };
  const rOf = (x, y) => { const q = sumsOf(x, y); if (!(q.cxx > 1e-9 && q.cyy > 1e-9)) return null; return Math.max(-1, Math.min(1, q.cxy / Math.sqrt(q.cxx * q.cyy))); };
  const ranks = (v) => v.map((a) => { let less = 0, eq = 0; v.forEach((b) => { if (b < a) less++; else if (b === a) eq++; }); return less + (eq + 1) / 2; });
  const kendallO = (x, y) => { const n = x.length; let nc = 0, nd = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const s2 = Math.sign(x[i] - x[j]) * Math.sign(y[i] - y[j]); if (s2 > 0) nc++; else if (s2 < 0) nd++; }
    const grp = (v) => { const m = new Map(); v.forEach((a) => m.set(a, (m.get(a) || 0) + 1)); return [...m.values()].filter((c) => c > 1); };
    const tg = grp(x), ug = grp(y), n0 = n * (n - 1) / 2, n1 = tg.reduce((p, t) => p + t * (t - 1) / 2, 0), n2 = ug.reduce((p, u) => p + u * (u - 1) / 2, 0);
    const v0 = n * (n - 1) * (2 * n + 5), vt = tg.reduce((p, t) => p + t * (t - 1) * (2 * t + 5), 0), vu = ug.reduce((p, u) => p + u * (u - 1) * (2 * u + 5), 0);
    const v1 = tg.reduce((p, t) => p + t * (t - 1), 0) * ug.reduce((p, u) => p + u * (u - 1), 0) / (2 * n * (n - 1)), v2 = tg.reduce((p, t) => p + t * (t - 1) * (t - 2), 0) * ug.reduce((p, u) => p + u * (u - 1) * (u - 2), 0) / (9 * n * (n - 1) * (n - 2));
    const v = (v0 - vt - vu) / 18 + v1 + v2, tau = (nc - nd) / Math.sqrt((n0 - n1) * (n0 - n2)), z = (nc - nd) / Math.sqrt(v), q = 1 - PHI(Math.abs(z)); return { tau, z, two: Math.min(1, 2 * q), right: z >= 0 ? q : 1 - q, left: z >= 0 ? 1 - q : q }; };
  const zOf = (rv, rh, n) => { const z = (1 - rv * rv <= 1e-15) ? (rv > 0 ? Infinity : -Infinity) : (Math.atanh(rv) - Math.atanh(rh)) * Math.sqrt(n - 3); if (!isFinite(z)) return { z, p: { left: z > 0 ? 1 : 0, right: z > 0 ? 0 : 1, two: 0 } }; const q = 1 - PHI(Math.abs(z)); return { z, p: { left: z >= 0 ? 1 - q : q, right: z >= 0 ? q : 1 - q, two: Math.min(1, 2 * q) } }; };
  const tTest = (r, n) => { const d = 1 - r * r, t = d <= 1e-15 ? (r > 0 ? Infinity : -Infinity) : r * Math.sqrt((n - 2) / d); return { t, df: n - 2, p: pvT(t, n - 2) }; };
  const pTl = (p, tl) => (tl === 'gt' ? p.right : tl === 'lt' ? p.left : p.two);
  const fisherCI = (r, n, level, k) => { if (n < 4) return null; if (1 - r * r <= 1e-15) return { lo: r, hi: r, exact: true }; const z = Math.atanh(r), se = Math.sqrt(k / (n - 3)), c = zUp((1 - level) / 2); return { lo: Math.tanh(z - c * se), hi: Math.tanh(z + c * se), z: z / se, f: z }; };
  const rcritO = (n, alpha, tl) => { const t = critT(alpha, n - 2, tl), v = n - 2; return t / Math.sqrt(t * t + v); };
  const firstN = (pred) => { if (pred(4)) return 4; let lo = 4, hi = 8; while (!pred(hi)) { lo = hi; hi *= 2; if (hi > 20000) return Infinity; } while (hi - lo > 1) { const m = Math.floor((lo + hi) / 2); if (pred(m)) hi = m; else lo = m; } return hi; };
  const planZ = (r, rh, alpha, tl) => { const eff = Math.atanh(r) - Math.atanh(rh), ok = tl === 'two' ? eff !== 0 : (tl === 'gt' ? eff > 0 : eff < 0); if (!ok || Math.abs(r) >= 1) return { sig: null, pow: null }; const za = zUp(tl === 'two' ? alpha / 2 : alpha), zb = zUp(0.2), a = Math.abs(eff); return { sig: firstN((n) => a * Math.sqrt(n - 3) > za), pow: Math.max(4, Math.ceil(Math.pow((za + zb) / a, 2) + 3 - 1e-9)) }; };
  const powO = (rho, rh, n, alpha, tl) => { const d = (Math.atanh(rho) - Math.atanh(rh)) * Math.sqrt(n - 3), za = zUp(tl === 'two' ? alpha / 2 : alpha); const p = tl === 'gt' ? PHI(d - za) : tl === 'lt' ? PHI(-d - za) : PHI(d - za) + PHI(-d - za); return Math.max(0, Math.min(1, p)); };
  const sigPlan = (r, alpha, tl) => { const ok = tl === 'two' ? r !== 0 : (tl === 'gt' ? r > 0 : r < 0); if (!ok || Math.abs(r) >= 1) return { sig: null, pow: null }; const za = zUp(tl === 'two' ? alpha / 2 : alpha), zb = zUp(0.2), f = Math.abs(Math.atanh(r));
    return { sig: firstN((n) => { const t = tTest(r, n).t, c = critT(alpha, n - 2, tl); return tl === 'lt' ? t < -c : tl === 'gt' ? t > c : Math.abs(t) > c; }), pow: Math.max(4, Math.ceil(Math.pow((za + zb) / f, 2) + 3 - 1e-9)) }; };
  /* ---- formatting like the page ---- */
  const sg = (t) => String(t).replace('-', '−');
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return sg(t); };
  const fn = (x) => sg(String(Math.round(x * 1e6) / 1e6));
  const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  const num = (t) => { t = String(t).replace(/−/g, '-').replace(/,/g, ''); const m = t.match(/^(-?[\d.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUP[c]).join(''), 10)); const q = t.match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 170) + '] lacks [' + sub + ']'); return false; } return true; };
  const near = (got, exp, d, tag) => { cmp++; const tol = 0.5 * Math.pow(10, -d) * 1.02 + 5e-6 * Math.abs(exp); if (got == null || !isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + '] (decimals ' + d + ')'); return false; } return true; };
  const sig4 = (got, exp, tag) => { cmp++; const mag = Math.floor(Math.log10(Math.max(Math.abs(exp), 1e-300))), tol = 0.5 * Math.pow(10, mag - 3) * 1.06 + 1e-13; if (!isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + '] (4 significant digits)'); return false; } return true; };
  const pIs = (txt, p, dec, tag) => { cmp++; if (dec !== null) { if (/^less than/.test(txt)) { if (p >= Math.pow(10, -dec)) fails.push(tag + ' p [' + txt + '] but expected ' + p); } else near(num(txt), p, dec, tag + ' p'); return; } if (/^less than/.test(txt)) { if (p >= 1e-7) fails.push(tag + ' p [' + txt + '] but expected ' + p); return; } if (p < 1e-7) { if (!(num(txt) < 2e-7)) fails.push(tag + ' tiny p [' + txt + '] expected about ' + p); return; } sig4(num(txt), p, tag + ' p'); };
  const rng = (txt, lo, hi, d, tag) => { cmp++; const m = String(txt).replace(/−/g, '-').match(/(-?[0-9.]+(?:e[+-]?[0-9]+)?)(?: to |, )(-?[0-9.]+(?:e[+-]?[0-9]+)?)/i); const tol = 0.5 * Math.pow(10, -d) * 1.05 + 5e-5 * Math.max(Math.abs(lo), Math.abs(hi)); if (!m || Math.abs(parseFloat(m[1]) - lo) > tol || Math.abs(parseFloat(m[2]) - hi) > tol) fails.push(tag + ' interval [' + txt + '] expected [' + lo + ' to ' + hi + ']'); };
  const rowOf = (rows, label) => (rows.filter((r) => r[0].indexOf(label) === 0)[0] || null);
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("ccBig"),lab:g("ccLab"),sub:g("ccSub"),tip:g("ccTip"),body:vis("ccBody"),hint:vis("ccHint")?g("ccHint"):"",nums:rows("ccNums"),all:rows("ccAll"),loo:rows("ccLoo"),looVis:vis("ccLooWrap"),looKey:g("ccLooKey"),what:rows("ccWhat"),pred:rows("ccPred"),predVis:vis("ccPredWrap"),predKey:g("ccPredKey"),write:g("ccWrite"),check:g("ccCheckList"),dev:rows("ccDev"),allNote:g("ccAllNote"),svg1:document.getElementById("ccVis").innerHTML.length,svg2:document.getElementById("ccGauge").innerHTML.length,visKey:g("ccVisKey"),gaugeKey:g("ccGaugeKey"),rho0N:g("ccRho0Note"),xN:g("ccXNote"),yN:g("ccYNote"),pN:g("ccPNote"),entryN:g("ccEntryNote"),alphaN:g("ccAlphaNote"),tailN:g("ccTailNote"),headN:g("ccHeadNote"),confN:g("ccConfNote"),nameN:g("ccNameNote"),wN:g("ccWNote"),pxN:g("ccPxNote"),decN:g("ccDecNote"),mlab:g("ccMLab"),mval:g("ccMVal"),copy:g("ccCopyTxt"),csv:g("ccCsvTxt"),tailLab:g("ccTailLab"),xLab:g("ccXLab"),yLab:g("ccYLab")};})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("ccAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('ccAdvBtn'); };
  const ALLS = ['ccX', 'ccY', 'ccP', 'ccW', 'ccAlpha', 'ccConf', 'ccRho0', 'ccNameX', 'ccNameY', 'ccPx', 'ccDec'];
  const reset = async (entry, tl, head) => { await ctx.click('ccClear'); await ctx.seg('ccEntry', entry || 'lists'); await ctx.seg('ccTail', tl || 'two'); await ctx.seg('ccHead', head || 'pearson'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const strength = (r) => { const a = Math.abs(r); return a >= 0.8 ? 'very strong' : a >= 0.6 ? 'strong' : a >= 0.4 ? 'moderate' : a >= 0.2 ? 'weak' : 'very weak'; };
  const dirW = (r) => (r > 0 ? 'positive' : r < 0 ? 'negative' : 'no');
  const chance = (p) => (p >= 0.01 ? 'about ' + Math.round(p * 100) + ' times in 100' : p >= 0.001 ? 'about ' + Math.round(p * 1000) + ' times in 1,000' : 'fewer than 1 time in 1,000');
  const gen = (n, kind) => { const x = [], y = []; const dec = pick([0, 0, 1, 2]), sl = pick([-3, -1, -0.4, 0, 0.5, 2, 6]), nz = pick([0.5, 2, 8, 30]); for (let i = 0; i < n; i++) { let a = kind === 'ties' ? ri(1, 5) : +(ri(-50, 150) / pick([1, 1, 4])).toFixed(dec), b = +(sl * a + (R() - 0.5) * 2 * nz * pick([1, 1, 3])).toFixed(dec); if (kind === 'ties') b = ri(1, 4); x.push(a); y.push(b); } return { x, y }; };

  await advOpen();

  /* ---- one full comparison of everything the page shows ---- */
  async function compare(o, tag) {
    runs++; if (o.rho0 !== undefined) o.rho0V = parseFloat(o.rho0);
    await reset(o.entry, o.tail, o.head);
    const pairsTxt = o.x.map((v, i) => v + ', ' + o.y[i]).join('\n');
    const inputs = { ccAlpha: o.alpha !== undefined ? o.alpha : '', ccConf: o.conf !== undefined ? o.conf : '', ccRho0: o.rho0 !== undefined ? o.rho0 : '', ccDec: o.dec !== undefined ? String(o.dec) : '', ccNameX: o.nx || '', ccNameY: o.ny || '', ccPx: o.px !== undefined ? o.px : '', ccW: o.w || '' };
    if (o.entry === 'pairs') inputs.ccP = pairsTxt; else { inputs.ccX = o.x.join(pick([' ', ', ', '\n'])); inputs.ccY = o.y.join(' '); }
    await setAll(inputs);
    const st = await read(), n = o.x.length, tl = o.tail || 'two', dec = o.dec === undefined ? null : o.dec;
    const alpha = o.alphaV !== undefined ? o.alphaV : 0.05, level = o.confV !== undefined ? o.confV : 1 - alpha;
    const rr = (v) => fx(v, dec !== null ? dec : 4), raw = (v) => (dec !== null ? fx(v, dec) : fn(v));
    const r = rOf(o.x, o.y);
    if (r === null) { if (st.body) fails.push(tag + ': constant data should not give a result'); return; }
    if (!st.body) { fails.push(tag + ': no result for valid data [' + st.hint + ']'); return; }
    const rho0e = (o.rho0V && n >= 4) ? o.rho0V : 0, zm = rho0e !== 0, tt = tTest(r, n), zz = n >= 4 ? zOf(r, rho0e, n) : null, pe = zm ? pTl(zz.p, tl) : pTl(tt.p, tl), rho = rOf(ranks(o.x), ranks(o.y)), tts = tTest(rho, n), ps = pTl(tts.p, tl), ke = kendallO(o.x, o.y), pk = pTl(ke, tl);
    const head = o.head || 'pearson', H = head === 'spearman' ? { r: rho, p: ps } : head === 'kendall' ? { r: ke.tau, p: pk } : { r, p: pe }, sym = head === 'spearman' ? 'ρ' : head === 'kendall' ? 'τ' : 'r';
    has(st.big, sym + ' = ' + rr(H.r), tag + ' headline');
    has(st.sub, (H.r === 0 ? 'No' : strength(H.r) + ' ' + dirW(H.r)) + ' correlation', tag + ' sub strength'); has(st.sub, 'n = ' + n, tag + ' sub n');
    { const m = st.sub.match(/p = (.+?) · n/); if (!m) fails.push(tag + ' sub p missing'); else pIs(m[1], H.p, dec, tag + ' sub'); }
    has(st.tip, (H.p < alpha ? 'statistically significant' : 'not statistically significant') + ' at α = ' + fn(alpha), tag + ' tip decision');
    has(st.tip, (H.p < alpha ? 'only ' : '') + chance(H.p), tag + ' tip chance'); if (head === 'pearson' && zm) has(st.tip, 'far from ' + fn(rho0e), tag + ' tip rho0');
    has(st.mval, rr(H.r), tag + ' sticky value');
    /* numbers table */
    const f = (() => { const q = sumsOf(o.x, o.y), mx = q.sx / n, my = q.sy / n; return { mx, my, sdx: Math.sqrt(q.cxx / (n - 1)), sdy: Math.sqrt(q.cyy / (n - 1)), cov: q.cxy / (n - 1), slope: q.cxy / q.cxx, icpt: my - q.cxy / q.cxx * mx, se: n > 2 ? Math.sqrt(Math.max(0, q.cyy - q.cxy * q.cxy / q.cxx) / (n - 2)) : null, q }; })();
    { const rw = rowOf(st.nums, 'Pearson r'); if (!rw) fails.push(tag + ' no Pearson row'); else near(num(rw[1]), r, dec !== null ? dec : 4, tag + ' Pearson r'); }
    { const rw = rowOf(st.nums, 'r² '); if (rw) near(num(rw[1]), r * r, dec !== null ? dec : 4, tag + ' r²'); else fails.push(tag + ' no r² row'); }
    { const rw = rowOf(st.nums, 't-score'); if (rw) near(num(rw[1]), tt.t, dec !== null ? dec : 4, tag + ' t'); has(rw ? rw[0] : '', 'n − 2 = ' + (n - 2), tag + ' df'); }
    { const a = rowOf(st.nums, 'p-value, two-tailed'), b = rowOf(st.nums, 'p-value, right-tailed'), c = rowOf(st.nums, 'p-value, left-tailed'); const PVx = zm ? zz.p : tt.p; pIs(a[1], PVx.two, dec, tag + ' p two'); pIs(b[1], PVx.right, dec, tag + ' p right'); pIs(c[1], PVx.left, dec, tag + ' p left'); has((tl === 'two' ? a : tl === 'gt' ? b : c)[0], '(used)', tag + ' used p'); }
    if (zz) { if (zm) { const rw = rowOf(st.nums, 'z-score against'); if (!rw) fails.push(tag + ' no z row'); else near(num(rw[1]), zz.z, dec !== null ? dec : 4, tag + ' z against rho0'); } else { const rw = rowOf(st.nums, 'p-value, Fisher z test'); if (!rw) fails.push(tag + ' no Fisher z p row'); else pIs(rw[1], pTl(zz.p, tl), dec, tag + ' Fisher p'); } }
    { const rw = rowOf(st.nums, 'Decision at'); if (!rw) fails.push(tag + ' no decision row'); else { has(rw[1], pe < alpha ? 'Reject H₀' : 'Do not reject H₀', tag + ' decision'); has(rw[1], 'ρ = ' + fn(rho0e), tag + ' decision rho'); } }
    { const rw = rowOf(st.nums, 'Acceptance region'); if (!rw) fails.push(tag + ' no acceptance row'); else { let lo, hi; if (!zm) { const rc = rcritO(n, alpha, tl); lo = tl === 'gt' ? -Infinity : -rc; hi = tl === 'lt' ? Infinity : rc; } else { const c = zUp(tl === 'two' ? alpha / 2 : alpha) / Math.sqrt(n - 3), F0 = Math.atanh(rho0e); lo = tl === 'gt' ? -Infinity : Math.tanh(F0 - c); hi = tl === 'lt' ? Infinity : Math.tanh(F0 + c); }
        has(rw[0], 'ρ = ' + fn(rho0e), tag + ' acceptance label'); if (lo === -Infinity) { has(rw[1], 'r up to', tag + ' acc up to'); near(num(rw[1].replace('r up to', '')), hi, dec !== null ? dec : 4, tag + ' acc hi'); } else if (hi === Infinity) { has(rw[1], 'or higher', tag + ' acc or higher'); near(num(rw[1].replace('r of', '')), lo, dec !== null ? dec : 4, tag + ' acc lo'); } else rng(rw[1], lo, hi, dec !== null ? dec : 4, tag + ' acc'); } }
    if (!zm) { const rw = rowOf(st.nums, 'Critical t at'); if (!rw) fails.push(tag + ' no critical t row'); else near(num(rw[1]), (tl === 'lt' ? -1 : 1) * critT(alpha, n - 2, tl), dec !== null ? dec : 4, tag + ' critical t'); } else { cmp++; if (rowOf(st.nums, 'Critical t at')) fails.push(tag + ' critical t row shown while testing against rho0'); }
    const ci = fisherCI(r, n, level, 1);
    { const rw = rowOf(st.nums, fn(level * 100) + '% interval for r'); if (!rw) fails.push(tag + ' no interval row'); else if (ci) { if (ci.exact) has(rw[1], 'exactly', tag + ' exact'); else rng(rw[1], ci.lo, ci.hi, dec !== null ? dec : 4, tag + ' CI'); } else has(rw[1], 'at least 4 pairs', tag + ' CI n<4'); }
    if (ci && !ci.exact) { const rw = rowOf(st.nums, 'Fisher z-score'); near(num(rw[1]), ci.z, dec !== null ? dec : 4, tag + ' Fisher z'); if (level > 0.5) { const o1 = fisherCI(r, n, 2 * level - 1, 1), lo = rowOf(st.nums, 'One-sided lower bound'), hi = rowOf(st.nums, 'One-sided upper bound'); near(num(lo[1]), o1.lo, dec !== null ? dec : 4, tag + ' one-sided lo'); near(num(hi[1]), o1.hi, dec !== null ? dec : 4, tag + ' one-sided hi'); } }
    if (!zm) { const rw = rowOf(st.nums, 'Smallest |r|'); near(num(rw[1]), rcritO(n, alpha, tl), dec !== null ? dec : 4, tag + ' crit r'); } else { cmp++; if (rowOf(st.nums, 'Smallest |r|')) fails.push(tag + ' smallest r row shown while testing against rho0'); }
    { const rw = rowOf(st.nums, 'Covariance'); near(num(rw[1]), f.cov, dec !== null ? dec : 6, tag + ' cov'); }
    { const rw = rowOf(st.nums, 'Mean of'); const m = rw[1].split(' / '); near(num(m[0]), f.mx, dec !== null ? dec : 6, tag + ' mean x'); near(num(m[1]), f.my, dec !== null ? dec : 6, tag + ' mean y'); }
    { const rw = rowOf(st.nums, 'Standard deviation of'); const m = rw[1].split(' / '); near(num(m[0]), f.sdx, dec !== null ? dec : 6, tag + ' sd x'); near(num(m[1]), f.sdy, dec !== null ? dec : 6, tag + ' sd y'); }
    { const rw = rowOf(st.nums, 'Slope / intercept'); const m = rw[1].split(' / '); near(num(m[0]), f.slope, dec !== null ? dec : 6, tag + ' slope'); near(num(m[1]), f.icpt, dec !== null ? dec : 6, tag + ' intercept'); }
    if (f.se !== null) { const rw = rowOf(st.nums, 'Standard error of the estimate'); near(num(rw[1]), f.se, dec !== null ? dec : 6, tag + ' se est'); }
    /* weights */
    if (o.w) { const wv = o.w.split(/\s+/).map(Number), sw = wv.reduce((p, c) => p + c, 0); let mxw = 0, myw = 0; o.x.forEach((v, i) => { mxw += wv[i] * v; myw += wv[i] * o.y[i]; }); mxw /= sw; myw /= sw; let a = 0, b = 0, c = 0; o.x.forEach((v, i) => { a += wv[i] * (v - mxw) * (o.y[i] - myw); b += wv[i] * (v - mxw) * (v - mxw); c += wv[i] * (o.y[i] - myw) * (o.y[i] - myw); }); const rw = rowOf(st.nums, 'Weighted Pearson r'); if (!rw) fails.push(tag + ' no weighted row'); else near(num(rw[1]), a / Math.sqrt(b * c), dec !== null ? dec : 4, tag + ' weighted r'); has(st.wN, 'Weights read: ' + n, tag + ' weights note'); }
    else { cmp++; if (rowOf(st.nums, 'Weighted Pearson r')) fails.push(tag + ' weighted row without weights'); }
    /* side by side */
    { const v = rowOf(st.all, 'Value'), pr = rowOf(st.all, 'p-value'); near(num(v[1]), r, dec !== null ? dec : 4, tag + ' all pearson'); near(num(v[2]), rho, dec !== null ? dec : 4, tag + ' all spearman'); near(num(v[3]), ke.tau, dec !== null ? dec : 4, tag + ' all kendall');
      pIs(pr[1], pe, dec, tag + ' all p pearson'); pIs(pr[2], ps, dec, tag + ' all p spearman'); pIs(pr[3], pk, dec, tag + ' all p kendall');
      const sgf = rowOf(st.all, 'Significant'); has(sgf[1], pe < alpha ? 'Yes' : 'No', tag + ' sig pearson'); has(sgf[2], ps < alpha ? 'Yes' : 'No', tag + ' sig spearman'); has(sgf[3], pk < alpha ? 'Yes' : 'No', tag + ' sig kendall');
      const ic = rowOf(st.all, fn(level * 100) + '% interval'), cs = fisherCI(rho, n, level, 1.06); if (cs && !cs.exact) rng(ic[2], cs.lo, cs.hi, dec !== null ? dec : 4, tag + ' spearman CI'); }
    has(st.allNote, Math.abs(r - rho) > 0.1 ? 'differ by' : 'are close', tag + ' agree note');
    /* leave one out */
    if (n >= 4) {
      const loo = o.x.map((_, i) => rOf(o.x.filter((__, j) => j !== i), o.y.filter((__, j) => j !== i))), dr = loo.map((v) => (v === null ? null : v - r)), cand = dr.map((v, i) => i).filter((i) => dr[i] !== null).sort((a, b) => Math.abs(dr[b]) - Math.abs(dr[a]));
      const body = st.loo.slice(1, -0 || undefined).filter((row) => /^#\d+$/.test(row[0])); const want = Math.min(8, cand.length);
      cmp++; if (body.length !== want) fails.push(tag + ' loo rows ' + body.length + ' expected ' + want);
      body.forEach((row) => { const k = parseInt(row[0].slice(1), 10) - 1; near(num(row[3]), loo[k], dec !== null ? dec : 4, tag + ' loo r #' + (k + 1)); near(num(row[4]), dr[k], dec !== null ? dec : 4, tag + ' loo change #' + (k + 1)); });
      if (body.length === want && want > 0) { const minShown = Math.min(...body.map((row) => Math.abs(dr[parseInt(row[0].slice(1), 10) - 1]))), maxOther = cand.slice(want).reduce((p, i) => Math.max(p, Math.abs(dr[i])), 0); cmp++; if (minShown + 1e-9 < maxOther) fails.push(tag + ' loo does not show the most influential points'); }
      const nf = dr.filter((v) => v !== null && Math.abs(v) > 0.1).length; has(st.looKey, nf ? nf + (nf === 1 ? ' point changes' : ' points change') : 'No single point changes r by more than 0.1', tag + ' loo flag count');
    } else { cmp++; if (st.looVis) fails.push(tag + ' loo shown with n<4'); }
    /* what would it take */
    { const w1 = st.what[0], w2 = st.what[1], w3 = st.what[2]; const m = zm ? [0, 0, 0] : w1[1].match(/^(-?[\d.]+) \(you have (-?[\d.]+)\)/); if (zm) has(w1[1], '(you have ' + rr(r) + ')', tag + ' what row 1 rho0'); else if (!m) fails.push(tag + ' what row 1 [' + w1[1] + ']'); if (!zm && m) { near(parseFloat(m[1]), rcritO(n, alpha, tl), dec !== null ? dec : 4, tag + ' what crit'); near(parseFloat(m[2]), Math.abs(r), dec !== null ? dec : 4, tag + ' what have'); }
      const pl = zm ? planZ(r, rho0e, alpha, tl) : sigPlan(r, alpha, tl);
      if (pl.sig === null) { has(w2[1], 'Never', tag + ' plan sig never'); has(w3[1], 'Never', tag + ' plan pow never'); }
      else { if (pe < alpha) has(w2[1], 'Already significant', tag + ' plan already'); else has(w2[1], (pl.sig === Infinity ? 'more than 10,000,000' : pl.sig.toLocaleString('en-US')) + ' pairs', tag + ' plan sig'); has(w3[1], (Math.abs(r) >= 1 ? 'Any 4 pairs' : pl.pow.toLocaleString('en-US') + ' pairs'), tag + ' plan pow'); }
      if (n >= 4) [0.1, 0.3, 0.5].forEach((e, k) => { const rw = st.what[3 + k]; if (!rw) { fails.push(tag + ' no power row ' + e); return; } has(rw[0], 'true correlation of ' + (tl === 'lt' ? '−' : '') + e, tag + ' power label'); near(num(rw[1]), powO(tl === 'lt' ? -e : e, rho0e, n, alpha, tl) * 100, 1, tag + ' power ' + e); }); }
    /* prediction */
    if (o.px !== undefined && !isNaN(parseFloat(o.px)) && n > 2) {
      const px = parseFloat(o.px), tc = critT(1 - level, n - 2, 'two'), yh = f.icpt + f.slope * px, qq = (px - f.mx) * (px - f.mx) / f.q.cxx, mm = tc * f.se * Math.sqrt(1 / n + qq), pm = tc * f.se * Math.sqrt(1 + 1 / n + qq);
      cmp++; if (!st.predVis) fails.push(tag + ' prediction hidden'); else { near(num(st.pred[0][1]), yh, dec !== null ? dec : 6, tag + ' pred y'); rng(st.pred[1][1], yh - mm, yh + mm, dec !== null ? dec : 6, tag + ' pred mean CI'); rng(st.pred[2][1], yh - pm, yh + pm, dec !== null ? dec : 6, tag + ' pred interval'); const out = px < Math.min(...o.x) || px > Math.max(...o.x); has(st.predKey, out ? 'outside the X values' : 'The interval for the line is narrower', tag + ' pred key'); }
    } else { cmp++; if (st.predVis) fails.push(tag + ' prediction shown without an X value'); }
    /* write-up sentence */
    { const apaN = (v) => { const sv = Math.abs(v).toFixed(2).replace(/^0\./, '.'); return (v < 0 && sv !== '.00' ? '−' : '') + sv; };
      if (head === 'pearson') has(st.write, 'r(' + (n - 2) + ') = ' + apaN(r), tag + ' apa r'); else if (head === 'spearman') has(st.write, 'rₛ(' + (n - 2) + ') = ' + apaN(rho), tag + ' apa rs'); else has(st.write, 'τ = ' + apaN(ke.tau), tag + ' apa tau'); }
    /* notes, copy, calculation table, picture */
    has(st.xN, o.entry === 'pairs' ? '' : n + ' numbers read', tag + ' x note'); if (o.entry === 'pairs') has(st.pN, n + ' pairs read', tag + ' pairs note');
    has(st.copy, big(head, H.r, rr), tag + ' copy text');
    cmp++; if ((st.csv.match(/","/g) || []).length < 8 || !/^"/.test(st.csv)) fails.push(tag + ' csv text');
    cmp++; { const dv = st.dev.filter((row) => /^#\d+$/.test(row[0])); if (dv.length !== Math.min(50, n)) fails.push(tag + ' calc table rows ' + dv.length); else if (dv[0]) near(num(dv[0][3]), (o.x[0] - f.mx) * (o.y[0] - f.my), dec !== null ? dec : 6, tag + ' calc table first product'); }
    has(st.check, 'Sample size: ' + n + ' pairs', tag + ' check sample'); cmp++; if (!(st.svg1 > 800 && st.svg2 > 400)) fails.push(tag + ' pictures missing');
    has(st.tailN, tl === 'two' ? 'Two-tailed' : tl === 'gt' ? 'One-tailed (right)' : 'One-tailed (left)', tag + ' tail note');
    has(st.alphaN, o.alpha !== undefined && o.alphaV !== undefined ? 'below ' + fn(alpha) : 'Leave empty for 0.05', tag + ' alpha note');
    if (o.conf !== undefined && o.confV !== undefined) has(st.confN, fn(level * 100) + '% level', tag + ' conf note');
    if (o.rho0 !== undefined && o.rho0V) { if (n >= 4) has(st.rho0N, 'tested against ρ₀ = ' + fn(o.rho0V), tag + ' rho0 note'); else has(st.hint, 'at least 4 pairs', tag + ' rho0 hint'); }
    if (o.nx) { has(st.xLab, o.nx, tag + ' x label'); has(st.nameN, 'names are used', tag + ' name note'); }
    if (o.px !== undefined && !isNaN(parseFloat(o.px))) has(st.pxN, 'Predicting', tag + ' px note');
    if (dec !== null) has(st.decN, dec + ' decimal places', tag + ' dec note');
  }
  const big = (h, v, rr) => (h === 'spearman' ? 'Spearman rank correlation (ρ): ρ = ' : h === 'kendall' ? 'Kendall rank correlation (τ-b): τ = ' : 'Pearson correlation coefficient (r): r = ') + rr(v);

  /* ---- random runs (>= 100) ---- */
  const ALPHAS = [[undefined, undefined], ['0.05', 0.05], ['0.1', 0.1], ['5%', 0.05], ['0.01', 0.01], ['0.2', 0.2]], CONFS = [[undefined, undefined], ['95', 0.95], ['99', 0.99], ['60', 0.6], ['90', 0.9]];
  for (let k = 0; k < 120; k++) {
    const kind = k % 7 === 0 ? 'ties' : 'plain', n = pick([3, 4, 5, 6, 8, 10, 15, 25, 40, ri(3, 60)]), d = gen(n, kind), a = pick(ALPHAS), c = pick(CONFS), w = k % 9 === 0 ? d.x.map(() => ri(1, 5)).join(' ') : '';
    await compare({ entry: k % 5 === 0 ? 'pairs' : 'lists', tail: pick(['two', 'two', 'gt', 'lt']), head: pick(['pearson', 'pearson', 'spearman', 'kendall']), x: d.x, y: d.y, alpha: a[0], alphaV: a[1], conf: c[0], confV: c[1], dec: pick([undefined, undefined, 0, 2, 3, 6]), nx: k % 4 === 0 ? 'Hours' : '', ny: k % 4 === 0 ? 'Score' : '', px: k % 3 === 0 ? pick(['0', '5.5', '12', '-4']) : undefined, w, rho0: k % 4 === 1 ? pick(['0.3', '-0.5', '0.8', '0']) : undefined }, 'run' + k);
  }

  /* ---- hints, notes and edge cases ---- */
  const hintCase = async (inp, expect, ok, tag, setup) => { runs++; await reset((setup && setup.entry) || 'lists', 'two', 'pearson'); await setAll(inp); const st = await read(); cmp++; if (ok !== st.body) fails.push(tag + ': result visible=' + st.body + ' expected ' + ok + ' [' + st.hint + ']'); if (expect) has(st.hint + ' ' + st.xN + ' ' + st.yN + ' ' + st.pN + ' ' + st.wN + ' ' + st.pxN, expect, tag + ' hint'); return st; };
  await hintCase({}, '', false, 'empty');
  await hintCase({ ccX: '1 2 3 4' }, 'Type the', false, 'only X typed');
  await hintCase({ ccX: '1 2', ccY: '3 4' }, 'at least 3 pairs', false, 'two pairs');
  await hintCase({ ccX: '1 2 3', ccY: '3 4' }, 'every X needs a Y', false, 'length mismatch');
  await hintCase({ ccX: '4 4 4 4', ccY: '1 2 3 4' }, 'All the X numbers are the same', false, 'constant X');
  await hintCase({ ccX: '1 2 3 4', ccY: '5 5 5 5' }, 'All the Y numbers are the same', false, 'constant Y');
  await hintCase({ ccX: 'abc', ccY: '1 2 3' }, 'Couldn’t find a number', false, 'junk X');
  { const st = await hintCase({ ccX: '1 2 3 4 5 abc', ccY: '5 7 8 9' }, '', false, 'junk item in X leaves length mismatch'); has(st.hint, 'every X needs a Y', 'junk length'); }
  { const st = await hintCase({ ccX: '1 2 3 4 5 x', ccY: '5 7 8 9 12' }, '', true, 'junk item skipped when counts match'); cmp++; if (!/1 item that is not a number left out/.test(st.xN)) fails.push('junk note [' + st.xN + ']'); }
  await hintCase({ ccP: '1, 2' }, 'at least 3 pairs', false, 'pairs one line', { entry: 'pairs' });
  await hintCase({ ccP: 'x, y\n1, 2\n2, 4\n3, 5\n4, 9' }, '', true, 'pairs with header', { entry: 'pairs' });
  { const st = await hintCase({ ccP: 'x, y\n1, 2\n2, 4\n3, 5\n4, 9' }, '', true, 'pairs header count', { entry: 'pairs' }); has(st.pN, '1 line that is not a pair left out', 'pairs header note'); }
  await hintCase({ ccP: 'hello' }, 'Couldn’t find a pair', false, 'pairs junk', { entry: 'pairs' });
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccAlpha: 'abc' }, 'Couldn’t read', true, 'alpha junk');
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccAlpha: '2' }, 'between 0 and 1', true, 'alpha out of range');
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccConf: '150' }, 'below 100%', true, 'conf too high');
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccDec: '12' }, 'from 0 to 10', true, 'dec out of range');
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccRho0: 'abc' }, 'Couldn’t read', true, 'rho0 junk');
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccRho0: '1.5' }, 'between −1 and 1', true, 'rho0 out of range');
  await hintCase({ ccX: '1 2 3', ccY: '2 4 7', ccRho0: '0.3' }, 'at least 4 pairs', true, 'rho0 with 3 pairs');
  { const st = await hintCase({ ccRho0: '0.3' }, '', false, 'rho0 without data'); has(st.rho0N, 'tested against', 'rho0 note without data'); }
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccW: '1 2 3' }, 'one weight per pair', true, 'weights wrong length');
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccW: '0 0 0 0 0' }, 'add up to more than 0', true, 'weights zero');
  await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccPx: 'zz' }, 'Couldn’t read', true, 'px junk');
  { const st = await hintCase({ ccPx: '7', ccW: '1 2 3' }, '', false, 'px and weights without data'); has(st.pxN, 'Type your data first', 'px prerequisite note'); has(st.wN, 'Type your numbers first', 'weights prerequisite note'); }
  { const st = await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6', ccPx: '50' }, '', true, 'px outside'); has(st.pxN, 'outside your data', 'px outside note'); }
  { const st = await hintCase({ ccX: '1 2 3', ccY: '2 4 7' }, '', true, 'three pairs'); has(st.nums.filter((r) => /interval for r/.test(r[0]))[0][1], 'at least 4 pairs', 'n=3 interval'); cmp++; if (st.looVis) fails.push('loo should be hidden for 3 pairs'); }
  { const st = await hintCase({ ccX: '1 2 3 4 5', ccY: '2 4 6 8 10' }, '', true, 'perfect line'); has(st.big, '1.0000', 'perfect r'); has(st.nums.filter((r) => /^t-score/.test(r[0]))[0][1], '∞', 'perfect t'); has(st.nums.filter((r) => /interval for r/.test(r[0]))[0][1], 'exactly 1.0000', 'perfect interval'); cmp++; if (/NaN|Infinity|undefined/.test(JSON.stringify(st))) fails.push('perfect line: bad text'); }
  { const st = await hintCase({ ccX: '1 2 3 4 5', ccY: '10 8 6 4 2' }, '', true, 'perfect negative'); has(st.big, '−1.0000', 'perfect negative r'); }
  { const st = await hintCase({ ccX: '-5 -4 -3 -2 -1 0 1 2 3 4 5', ccY: '25 16 9 4 1 0 1 4 9 16 25' }, '', true, 'U shape'); has(st.big, '0.0000', 'U-shape r'); has(st.sub, 'No correlation', 'U-shape sub'); cmp++; if (/NaN|Infinity|undefined/.test(JSON.stringify(st))) fails.push('U shape: bad text'); }
  { const st = await hintCase({ ccX: '1e9 -1e9 5e8 -5e8 2e8', ccY: '9e8 -9e8 4e8 -3e8 1e8' }, '', true, 'huge values'); cmp++; if (/NaN|Infinity|undefined/.test(JSON.stringify(st))) fails.push('huge values: bad text'); }
  { const big5 = []; for (let i = 0; i < 5001; i++) big5.push(i); const st = await hintCase({ ccX: big5.join(' '), ccY: big5.join(' ') }, 'up to 5000', false, '5001 pairs'); }
  { const sizes = [3, 200]; for (const n of sizes) { const d = gen(n, 'plain'); const t0 = Date.now(); await hintCase({ ccX: d.x.join(' '), ccY: d.y.join(' ') }, '', true, 'size ' + n); cmp++; if (Date.now() - t0 > 20000) fails.push('size ' + n + ' too slow'); } }
  /* clear and mode switches keep the page sane */
  runs++; await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1 2 3 4 5', ccY: '2 4 5 4 6' }); await ctx.seg('ccEntry', 'pairs'); { const st = await read(); cmp++; if (st.body) fails.push('switching to pairs entry with an empty pairs box should hide the result'); } await ctx.seg('ccEntry', 'lists'); { const st = await read(); cmp++; if (!st.body) fails.push('switching back should restore the result'); }
  runs++; await ctx.click('ccClear'); { const st = await read(); cmp++; if (st.body || st.big !== '—') fails.push('Clear fields should empty the result'); }
  /* example chips, zoom */
  runs++; await ctx.eval('document.querySelector("#ccExChips button[data-v=study]").click()'); { const st = await read(); cmp++; if (!st.body) fails.push('example chip should fill the data'); has(st.big, 'r = 0.6967', 'study example r'); }
  runs++; await ctx.eval('document.getElementById("ccZoomIn").click()'); { const st = await read(); has(st.visKey, 'Zoomed in 2×', 'zoom note'); } await ctx.eval('document.getElementById("ccZoomOut").click()'); { const st = await read(); cmp++; if (/Zoomed in/.test(st.visKey)) fails.push('zoom out should clear the note'); }
  return { runs, fails: fails.slice(0, 60), comparisons: cmp };
};
