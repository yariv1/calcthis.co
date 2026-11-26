/* ORACLE for chi-square-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.chiEngine or pvalueEngine). Chi-square tail from the closed finite sums (even df: Poisson sum; odd df: erfc plus
   half-integer terms), erfc from its own series / continued fraction, critical values by bisection, Fisher, binomial and McNemar exact p-values by BigInt brute force over every table, power of the noncentral
   chi-square from X = (Z + sqrt(lambda))^2 + chi-square(df - 1) integrated with Simpson's rule, sample sizes checked as the smallest count that works. Compared with what the page DISPLAYS: headline, sub line,
   cell / cross / 2x2 / McNemar / effect / planning tables, the picture (segment widths and dashed lines), warnings, notes, hints, merges, write-up and steps, for typed, pasted and raw tables, goodness of fit
   with all four kinds of expected values, estimated parameters, the chi-square value mode, alpha, decimals and effect size. */
module.exports = async function (ctx) {
  let s = 20261126; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  /* ---------- maths ---------- */
  const erfc = (x) => { if (x < 0) return 2 - erfc(-x); if (x < 2.5) { let t = x, sum = x, n = 0; while (Math.abs(t) > 1e-18) { n++; t *= -x * x / n; sum += t / (2 * n + 1); } return 1 - 2 / Math.sqrt(Math.PI) * sum; } let f = 0; for (let n = 120; n >= 1; n--) f = n / 2 / (x + f); return Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f); };
  const Phi = (z) => 0.5 * erfc(-z / Math.SQRT2);
  const Q = (x, df) => {
    if (x <= 0) return 1;
    const h = x / 2, lh = Math.log(h);
    if (df % 2 === 0) { let lt = -h, sum = Math.exp(lt); for (let k = 1; k < df / 2; k++) { lt += lh - Math.log(k); sum += Math.exp(lt); } return Math.min(1, sum); }
    let sum = erfc(Math.sqrt(h)), lt = -h + 0.5 * lh - Math.log(0.5 * Math.sqrt(Math.PI));
    for (let k = 1; k <= (df - 1) / 2; k++) { sum += Math.exp(lt); lt += lh - Math.log(k + 0.5); }
    return Math.min(1, sum);
  };
  const critC = (a, df) => { let lo = 0, hi = 1; while (Q(hi, df) > a) hi *= 2; for (let i = 0; i < 90; i++) { const m = (lo + hi) / 2; if (Q(m, df) > a) lo = m; else hi = m; } return (lo + hi) / 2; };
  const phid = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  const power = (lam, df, c) => {
    const mu = Math.sqrt(lam), sc = Math.sqrt(c), out = Phi(-sc - mu) + (1 - Phi(sc - mu));
    if (df === 1) return out;
    let a = Math.asin(Math.max(-1, Math.min(1, (mu - 10) / sc))), b = Math.asin(Math.max(-1, Math.min(1, (mu + 10) / sc)));
    if (b <= a) return out;
    const n = 1200, st = (b - a) / n; let t = 0;
    for (let i = 0; i <= n; i++) { const th = a + i * st, co = Math.cos(th), v = phid(sc * Math.sin(th) - mu) * Q(c * co * co, df - 1) * sc * co; t += v * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2); }
    return Math.min(1, out + t * st / 3);
  };
  const choose = (n, k) => { if (k < 0 || k > n) return 0n; k = Math.min(k, n - k); let r = 1n; for (let i = 1; i <= k; i++) r = r * BigInt(n - k + i) / BigInt(i); return r; };
  const ratio = (a, b) => { if (a === 0n) return 0; const sh = BigInt(b.toString(2).length - a.toString(2).length + 60); return Number((a << sh) / b) / Math.pow(2, Number(sh)); };
  const exact = (terms, obsIx) => { const tot = terms.reduce((x, y) => x + y, 0n), o = terms[obsIx]; let two = 0n, le = 0n, ge = 0n; terms.forEach((t, i) => { if (t * 10000000n <= o * 10000001n) two += t; if (i <= obsIx) le += t; if (i >= obsIx) ge += t; }); return { two: ratio(two, tot), left: ratio(le, tot), right: ratio(ge, tot), obs: ratio(o, tot) }; };
  const fisher = (a, b, c, d) => { const r1 = a + b, r2 = c + d, c1 = a + c, lo = Math.max(0, c1 - r2), hi = Math.min(r1, c1), t = []; for (let x = lo; x <= hi; x++) t.push(choose(r1, x) * choose(r2, c1 - x)); return exact(t, a - lo); };
  const binomT = (k, n, wa, wb) => { const t = []; let pa = 1n; const pb = [1n]; for (let i = 1; i <= n; i++) pb.push(pb[i - 1] * BigInt(wb)); for (let x = 0; x <= n; x++) { t.push(choose(n, x) * pa * pb[n - x]); pa *= BigInt(wa); } return exact(t, k); };
  const tableCalc = (O) => {
    const Rn = O.length, C = O[0].length, rt = O.map((r) => r.reduce((a, b) => a + b, 0)), ct = O[0].map((_, j) => O.reduce((a, r) => a + r[j], 0)), n = rt.reduce((a, b) => a + b, 0);
    const E = O.map((r, i) => r.map((_, j) => rt[i] * ct[j] / n)), K = O.map((r, i) => r.map((v, j) => (v - E[i][j]) * (v - E[i][j]) / E[i][j])), Z = O.map((r, i) => r.map((v, j) => (v - E[i][j]) / Math.sqrt(E[i][j] * ((n - rt[i]) / n) * ((n - ct[j]) / n))));
    const chi = K.flat().reduce((a, b) => a + b, 0), df = (Rn - 1) * (C - 1), flat = E.flat();
    const yates = O.reduce((a, r, i) => a + r.reduce((b, v, j) => { const d = Math.max(0, Math.abs(v - E[i][j]) - 0.5); return b + d * d / E[i][j]; }, 0), 0);
    return { R: Rn, C, rt, ct, n, E, K, Z, chi, df, yates, w: Math.sqrt(chi / n), V: Math.sqrt(chi / n / (Math.min(Rn, C) - 1)), lt5: flat.filter((e) => e < 5).length, minE: Math.min(...flat), cells: Rn * C };
  };
  /* ---------- reading ---------- */
  const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  const num = (t) => { t = String(t).replace(/−/g, '-').replace(/,/g, ''); const m = t.match(/(-?[\d.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUP[c]).join(''), 10)); const q = t.match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) fails.push(tag + ' text [' + String(txt).slice(0, 200) + '] lacks [' + sub + ']'); };
  let DEC = null;
  const near = (txt, exp, tag, dflt) => { cmp++; const g = num(txt); let tol; if (DEC !== null) tol = 0.5 * Math.pow(10, -DEC) * 1.01; else if (dflt === 2) tol = Math.abs(exp) < 0.01 ? Math.abs(exp) * 0.051 + 1e-12 : 0.00501; else tol = Math.abs(exp) < 0.001 ? Math.abs(exp) * 6e-4 + 1e-12 : 0.0000501; tol += 1e-9 * Math.abs(exp); if (!(Math.abs(g - exp) <= tol)) fails.push(tag + ' got [' + txt + '] expected ' + exp); };
  const pIs = (txt, p, tag) => {
    cmp++; const t = String(txt);
    if (DEC !== null) { if (/less than|</.test(t)) { if (p >= Math.pow(10, -DEC)) fails.push(tag + ' p [' + t + '] expected ' + p); } else if (Math.abs(num(t) - p) > 0.5 * Math.pow(10, -DEC) * 1.01 + 1e-11) fails.push(tag + ' p [' + t + '] expected ' + p); return; }
    if (/less than|</.test(t)) { if (!(p < 1e-290)) fails.push(tag + ' p [' + t + '] expected ' + p); return; }
    const g = num(t), tol = p < 1e-4 ? p * 6e-4 : 0.5 * Math.pow(10, Math.floor(Math.log10(Math.max(p, 1e-300))) - 3) * 1.05 + 2e-12;
    if (p < 1e-12) { if (!(Math.abs(g - p) <= p * 2e-3)) fails.push(tag + ' tiny p [' + t + '] expected ' + p); } else if (!(Math.abs(g - p) <= tol)) fails.push(tag + ' p [' + t + '] expected ' + p);
  };
  const nearK = (txt, exp, tag) => { if (DEC !== null || Math.abs(exp) < 100) return near(txt, exp, tag); cmp++; const tol = Math.abs(exp) < 10000 ? 0.00501 : 0.501; if (!(Math.abs(num(txt) - exp) <= tol)) fails.push(tag + ' got [' + txt + '] expected ' + exp); };
  const afterP = (t) => { const m = String(t).match(/p (=|<) ([^·]+)/); return m ? (m[1] === '<' ? '< ' : '') + m[2].trim() : ''; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){var k=c.querySelector("small");return k?c.querySelector("b").textContent+"|"+k.textContent:c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'var segs=[].map.call(document.querySelectorAll("#xsVis .xs-row"),function(r){return {segs:[].map.call(r.querySelectorAll(".xs-seg"),function(x){return [parseFloat(x.style.width),x.className];}),marks:[].map.call(r.querySelectorAll(".xs-mark"),function(x){return parseFloat(x.style.left);})};});' +
    'var o={big:g("xsBig"),sub:g("xsSub"),tip:g("xsTip"),lab:g("xsLab"),body:vis("xsBody"),hint:vis("xsHint")?g("xsHint"):"",cells:rows("xsCells"),cross:rows("xsCross"),crossV:vis("xsCrossWrap"),two:rows("xsTwo"),twoV:vis("xsTwoWrap"),mc:rows("xsMc"),mcV:vis("xsMcWrap"),eff:rows("xsEff"),effV:vis("xsEffWrap"),pow:rows("xsPow"),powV:vis("xsPowWrap"),mergeV:vis("xsMergeWrap"),warn:vis("xsWarnWrap")?g("xsWarn"):"",write:g("xsWrite"),steps:g("xsSteps"),curve:g("xsCurve"),tcrit:(document.querySelector("#xsCurve .xs-tcrit")||{}).textContent||"",segs:segs,mlab:g("xsMLab"),mval:g("xsMVal"),check:g("xsCheck")};' +
    '["xsGridNote","xsFitNote","xsAlphaNote","xsWNote","xsDecNote","xsParamsNote","xsExpNote","xsPasteNote","xsRawNote","xsFitPNote","xsMergeNote","xsHeadNote","xsPairNote","xsNamesNote","xsNameKNote"].forEach(function(i){o[i]=g(i);});return o;})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("xsAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('xsAdvBtn'); };
  await advOpen();
  const reset = async (mode, entry) => { await ctx.click('xsClear'); await ctx.seg('xsMode', mode); await ctx.seg('xsEntry', mode === 'table' && entry ? entry : 'grid'); await ctx.seg('xsFEntry', mode === 'fit' && entry ? entry : 'rows'); await ctx.seg('xsPair', 'ind'); await ctx.seg('xsHead', 'pearson'); await ctx.seg('xsExp', 'eq'); };
  const bulk = (o) => ctx.eval('(function(o){Object.keys(o).forEach(function(k){__qa.set(k,String(o[k]));});return 1;})(' + JSON.stringify(o) + ')');
  const grid = async (O, rows, cols) => { for (let i = 2; i < O.length; i++) await ctx.click('xsAddRow'); for (let j = 2; j < O[0].length; j++) await ctx.click('xsAddCol'); const v = {}; O.forEach((r, i) => r.forEach((x, j) => { v['xsC' + (i + 1) + '_' + (j + 1)] = x; })); if (rows) rows.forEach((n, i) => { v['xsRN' + (i + 1)] = n; }); if (cols) cols.forEach((n, j) => { v['xsCN' + (j + 1)] = n; }); await bulk(v); };
  const options = () => { const o = {}; o.alpha = pick([null, null, null, '0.1', '0.01', '1%', '0.001', '0.2']); o.dec = pick([null, null, null, null, 2, 3, 6]); o.w = pick([null, null, '0.1', '0.3', '0.5', '0.8']); return o; };
  const applyOpt = async (o) => { await bulk({ xsAlpha: o.alpha === null ? '' : o.alpha, xsDec: o.dec === null ? '' : o.dec, xsW: o.w === null ? '' : o.w }); DEC = o.dec; return o.alpha === null ? 0.05 : /%/.test(o.alpha) ? parseFloat(o.alpha) / 100 : parseFloat(o.alpha); };
  const randTable = (Rn, C) => { const scale = pick([3, 8, 25, 60, 250]); for (;;) { const tilt = R() * 2; const O = [...Array(Rn)].map((_, i) => [...Array(C)].map((__, j) => ri(0, Math.round(scale * (1 + (i === j ? tilt : 0)))))); if (O.every((r) => r.some((v) => v > 0)) && O[0].every((_, j) => O.some((r) => r[j] > 0))) return O; } };

  const checkPow = (st, t, df, alpha, w, tag) => {
    const c = critC(alpha, df), rr = st.pow;
    near(rr[0][1], c, tag + ' crit'); has(rr[0][1], '(yours ', tag);
    const sizes = (txt, ww, kind, t2) => { const g = num(String(txt).replace(/^Already there with [\d,]+ \(from /, '')); cmp++; if (!(g >= 1)) { fails.push(t2 + ' no count in [' + txt + ']'); return; } if (kind === 'sig') { if (!(g * ww * ww > c * (1 - 1e-9) && (g - 1) * ww * ww <= c * (1 + 1e-9))) fails.push(t2 + ' count for p<alpha [' + txt + '] w ' + ww + ' crit ' + c); } else { const hi = power(g * ww * ww, df, c), lo = power(Math.max(0, g - 1) * ww * ww, df, c); if (!(hi >= 0.8 - 2e-6 && (lo < 0.8 + 2e-6))) fails.push(t2 + ' 80% count [' + txt + '] w ' + ww + ' gives ' + hi + ' / ' + lo); } };
    const pw = (txt, v, t2) => { cmp++; if (/over 99\.9%/.test(txt)) { if (!(v > 0.9989)) fails.push(t2 + ' power [' + txt + '] expected ' + v); } else if (!(Math.abs(num(txt) - v * 100) <= 0.0511)) fails.push(t2 + ' power [' + txt + '] expected ' + v * 100); };
    if (t.chi > 1e-9) { sizes(rr[1][1], t.w, 'sig', tag + ' sig'); pw(rr[2][1], power(t.n * t.w * t.w, df, c), tag + ' power'); sizes(rr[3][1], t.w, 'n80', tag + ' n80'); } else has(rr[1][1], 'Never', tag);
    if (w !== null) { cmp++; if (rr.length !== 6) fails.push(tag + ' own w rows missing'); else { const ww = parseFloat(w); pw(rr[4][1], power(t.n * ww * ww, df, c), tag + ' own power'); sizes(rr[5][1], ww, 'n80', tag + ' own n80'); pw((st.xsWNote.match(/power is (over 99\.9%|[\d.]+%)/) || [])[1] || '', power(t.n * ww * ww, df, c), tag + ' w note'); } } else { cmp++; if (rr.length !== 4) fails.push(tag + ' unexpected w rows'); }
  };
  const checkTable = async (O, rows, cols, opt, alpha, head, tag) => {
    const st = await read(), t = tableCalc(O), two = t.R === 2 && t.C === 2;
    cmp++; if (!st.body) { fails.push(tag + ' no result, hint [' + st.hint + '] ' + JSON.stringify(O)); return st; }
    const pP = Q(t.chi, t.df), pY = two ? Q(t.yates, 1) : null, f = two ? fisher(O[0][0], O[0][1], O[1][0], O[1][1]) : null;
    const hp = head === 'yates' ? pY : head === 'fisher' ? f.two : pP, hs = head === 'yates' ? t.yates : t.chi;
    if (head === 'fisher') pIs(afterP(st.big) || st.big.replace(/^p /, ''), f.two, tag + ' big fisher'); else { near(st.big.replace('χ² = ', ''), hs, tag + ' big'); has(st.sub, 'df = ' + t.df, tag + ' sub'); pIs(afterP(st.sub), hp, tag + ' sub p'); }
    has(st.sub, t.n.toLocaleString('en-US') + ' counts', tag + ' sub n');
    const sig = hp < alpha; cmp++; if (sig === /not significant/.test(st.sub)) fails.push(tag + ' significance wrong [' + st.sub + '] p ' + hp + ' alpha ' + alpha);
    has(st.mval, head === 'fisher' ? 'p ' : 'χ² ', tag + ' mbar');
    /* cells */
    const body = st.cells.slice(1);
    cmp++; if (body.length !== t.cells + 1) fails.push(tag + ' cell rows ' + body.length + ' expected ' + (t.cells + 1));
    else {
      let k = 0;
      for (let i = 0; i < t.R; i++) for (let j = 0; j < t.C; j++, k++) {
        const c = body[k]; if (t.cells > 30 && R() > 30 / t.cells) continue; const r = [c[0]].concat(c[1].split('|'), c.slice(2));
        has(r[0], rows[i] + ' · ' + cols[j], tag + ' cell label'); cmp++; if (num(r[1]) !== O[i][j]) fails.push(tag + ' cell observed ' + r[1] + ' vs ' + O[i][j]);
        near(r[2], t.E[i][j], tag + ' cell E', 2); nearK(r[3], t.K[i][j], tag + ' cell K'); const zt = two || true ? t.Z[i][j] : 0; cmp++; if (!(Math.abs(num(r[4].replace('+', '')) - zt) <= 0.5 * Math.pow(10, -(DEC !== null ? DEC : 2)) * 1.01 + 1e-9)) fails.push(tag + ' std diff ' + r[4] + ' vs ' + zt);
      }
      nearK(body[t.cells][2], t.chi, tag + ' total chi'); cmp++; if (num(body[t.cells][1].split('|')[0]) !== t.n) fails.push(tag + ' total n');
    }
    cmp++; if (st.crossV !== (t.C <= 4 && t.n < 100000)) fails.push(tag + ' cross table visibility');
    if (t.C <= 4 && st.crossV) { for (let i = 0; i < Math.min(t.R, 6); i++) for (let j = 0; j < t.C; j++) { const pr = st.cross[i + 1][j + 1].split('|'); cmp++; if (num(pr[0]) !== O[i][j]) fails.push(tag + ' cross observed'); near(pr[1], t.E[i][j], tag + ' cross E', 2); } cmp++; if (num(st.cross[t.R + 1][t.C + 1]) !== t.n) fails.push(tag + ' cross grand total'); }
    near(st.eff[0][1], t.w, tag + ' w'); near(st.eff[1][1], t.V, tag + ' V'); has(st.eff[0][1], t.w < 0.1 ? 'very small' : t.w < 0.3 ? 'small' : t.w < 0.5 ? 'medium' : 'large', tag + ' w word');
    if (two) { near(st.eff[2][1], t.w, tag + ' phi'); if (O[0][1] * O[1][0] > 0) near(st.eff[3][1], O[0][0] * O[1][1] / (O[0][1] * O[1][0]), tag + ' odds'); }
    cmp++; if (st.twoV !== two) fails.push(tag + ' 2x2 panel visibility');
    if (two) { near(st.two[1][1], t.chi, tag + ' two chi'); pIs(st.two[1][2], pP, tag + ' two p'); near(st.two[2][1], t.yates, tag + ' yates'); pIs(st.two[2][2], pY, tag + ' yates p'); pIs(st.two[3][2], f.two, tag + ' fisher two'); pIs(st.two[4][2], f.left, tag + ' fisher left'); pIs(st.two[5][2], f.right, tag + ' fisher right'); }
    const bad = two ? t.lt5 > 0 : (t.minE < 1 || t.lt5 / t.cells > 0.2 + 1e-12);
    if (t.lt5 === 0) has(st.warn, 'All expected counts are 5 or more', tag + ' warn'); else { has(st.warn, t.lt5 + ' of ' + t.cells + ' expected counts', tag + ' warn count'); cmp++; if (bad !== /may be wrong/.test(st.warn)) fails.push(tag + ' warning level wrong [' + st.warn + '] ' + t.lt5 + '/' + t.cells + ' min ' + t.minE); }
    cmp++; if (st.mergeV !== (t.R >= 3 || t.C >= 3 || /merged/.test(tag))) fails.push(tag + ' merge panel visibility');
    checkPow(st, t, t.df, alpha, opt.w, tag);
    has(st.curve, 'critical ', tag + ' curve'); near(st.tcrit.replace('critical ', ''), critC(alpha, t.df), tag + ' curve crit', 2);
    near((st.xsAlphaNote.match(/Critical value for df = \d+: ([^ ]+?)\.?$/) || [])[1] || '', critC(alpha, t.df), tag + ' alpha note crit');
    if (head !== 'fisher') { has(st.write, 'χ²(' + t.df + ', N = ' + t.n.toLocaleString('en-US') + ') = ' + hs.toFixed(2), tag + ' write'); } else has(st.write, 'Fisher', tag + ' write fisher');
    cmp++; const ap = st.write.match(/p (=|<) (1\.000|\.\d+)/); if (!ap) fails.push(tag + ' write p missing [' + st.write + ']'); else if (ap[1] === '<' ? !(hp < 0.001) : !(Math.abs(parseFloat(ap[2]) - hp) <= 0.000501)) fails.push(tag + ' write p ' + ap[0] + ' vs ' + hp);
    has(st.steps, '(rows − 1) × (columns − 1) = ' + (t.R - 1) + ' × ' + (t.C - 1) + ' = ' + t.df, tag + ' steps');
    has(st.check, 'p ' + (sig ? 'is below' : 'is not below'), tag + ' decision');
    /* picture */
    cmp++; if (st.segs.length !== t.R + 1) fails.push(tag + ' picture rows ' + st.segs.length); else {
      st.segs.slice(1).forEach((r, i) => { r.segs.forEach((g, j) => { cmp++; if (Math.abs(g[0] - O[i][j] / t.rt[i] * 100) > 0.002) fails.push(tag + ' segment width ' + g[0] + ' vs ' + O[i][j] / t.rt[i] * 100); const d = O[i][j] - t.E[i][j]; cmp++; if (Math.abs(d) > 1e-7 && g[1].indexOf(d > 0 ? ' more' : ' fewer') < 0) fails.push(tag + ' segment colour ' + g[1] + ' diff ' + d); if (Math.abs(d) > 1e-7 && Math.abs(Math.abs(t.Z[i][j]) - 2) > 1e-6) { cmp++; if ((g[1].indexOf('s2') >= 0) !== (Math.abs(t.Z[i][j]) >= 2)) fails.push(tag + ' strength ' + g[1] + ' z ' + t.Z[i][j]); } }); let cum = 0; r.marks.forEach((m, j) => { cum += t.ct[j] / t.n * 100; cmp++; if (Math.abs(m - cum) > 0.002) fails.push(tag + ' dashed line ' + m + ' vs ' + cum); }); cmp++; if (r.marks.length !== t.C - 1) fails.push(tag + ' mark count'); });
    }
    if (opt.dec !== null) has(st.xsDecNote, opt.dec + ' decimal', tag);
    return st;
  };

  /* ---------- typed grids ---------- */
  for (let it = 0; it < 56; it++) {
    const Rn = it % 3 === 0 ? 2 : ri(2, 5), C = it % 3 === 0 ? 2 : ri(2, 5), O = randTable(Rn, C), tag = 'grid#' + it;
    await reset('table'); const opt = options(), alpha = await applyOpt(opt);
    const named = R() < 0.5, rows = O.map((_, i) => named ? 'Row' + 'ABCDE'[i] : 'Row ' + (i + 1)), cols = O[0].map((_, j) => named ? 'Col' + 'VWXYZ'[j] : 'Column ' + (j + 1));
    await grid(O, named ? rows : null, named ? cols : null);
    let head = 'pearson'; if (Rn === 2 && C === 2) { head = pick(['pearson', 'yates', 'fisher']); await ctx.seg('xsHead', head); }
    runs++; await checkTable(O, rows, cols, opt, alpha, head, tag);
    /* merge and undo */
    if ((Rn >= 3 || C >= 3) && it % 2 === 0) {
      const axis = Rn >= 3 && (C < 3 || R() < 0.5) ? 'r' : 'c', len = axis === 'r' ? Rn : C, a = ri(0, len - 1); let b = ri(0, len - 1); if (b === a) b = (a + 1) % len;
      await ctx.seg('xsMAx', axis); await ctx.set('xsMA', String(a)); await ctx.eval('document.querySelector("#xsMB .csel-opt[data-value=\\"' + b + '\\"]").click()'); await ctx.eval('document.querySelector("#xsMA .csel-opt[data-value=\\"' + a + '\\"]").click()'); await ctx.click('xsMergeBtn');
      const lo = Math.min(a, b), hi = Math.max(a, b);
      let M = O.map((r) => r.slice()), mr = rows.slice(), mc = cols.slice();
      if (axis === 'r') { M[lo] = M[lo].map((v, j) => v + M[hi][j]); M.splice(hi, 1); mr[lo] = mr[lo] + ' + ' + mr[hi]; mr.splice(hi, 1); } else { M.forEach((r) => { r[lo] += r[hi]; r.splice(hi, 1); }); mc[lo] = mc[lo] + ' + ' + mc[hi]; mc.splice(hi, 1); }
      runs++; const st = await checkTable(M, mr, mc, opt, alpha, M.length === 2 && M[0].length === 2 ? 'pearson' : 'pearson', tag + ' merged ' + axis + a + b); if (M.length >= 3 || M[0].length >= 3) has(st.xsMergeNote, 'Merged so far', tag + ' merge note');
      await ctx.click('xsUndoBtn'); runs++; await checkTable(O, rows, cols, opt, alpha, 'pearson', tag + ' undone');
    }
  }
  /* ---------- pasted and raw tables ---------- */
  for (let it = 0; it < 22; it++) {
    const big = it % 5 === 0, Rn = big ? ri(8, 20) : ri(2, 6), C = big ? ri(6, 20) : ri(2, 7), O = randTable(Rn, C), tag = 'paste#' + it;
    await reset('table', 'paste'); const opt = options(), alpha = await applyOpt(opt);
    const sep = pick([', ', '\t', '; ', ' ']), named = R() < 0.6, head = named && R() < 0.8;
    const rows = O.map((_, i) => named ? 'r' + (i + 1) : 'Row ' + (i + 1)), cols = O[0].map((_, j) => head ? 'c' + String.fromCharCode(97 + j) : 'Column ' + (j + 1));
    const text = (head ? [(sep === ' ' ? '' : sep) + cols.join(sep)] : []).concat(O.map((r, i) => (named ? rows[i] + sep : '') + r.join(sep))).join('\n');
    await ctx.set('xsPaste', text);
    runs++; const st = await checkTable(O, rows, cols, opt, alpha, 'pearson', tag + ' ' + JSON.stringify(sep)); has(st.xsPasteNote, 'Read ' + Rn + ' rows and ' + C + ' columns', tag);
  }
  for (let it = 0; it < 10; it++) {
    const Rn = ri(2, 4), C = ri(2, 4), O = randTable(Rn, C).map((r) => r.map((v) => v % 9 + 1)), lines = [], tag = 'raw#' + it;
    for (let j = 0; j < C; j++) lines.push('g0, a' + j);
    O[0] = O[0].map((v) => v);
    for (let i = 0; i < Rn; i++) for (let j = 0; j < C; j++) { const times = i === 0 ? O[i][j] - 1 : O[i][j]; for (let k = 0; k < times; k++) lines.push(((j > 0 || k > 0) && R() < 0.3 ? 'G' : 'g') + i + pick([', ', '\t']) + 'a' + j); }
    const extra = ri(0, 2); for (let k = 0; k < extra; k++) lines.push('broken');
    await reset('table', 'raw'); const opt = options(), alpha = await applyOpt(opt);
    const useTab = R() < 0.5; await ctx.set('xsRaw', lines.map((l) => l.replace(/\t|, /, useTab ? '\t' : ', ')).join('\n'));
    runs++; const st = await checkTable(O, O.map((_, i) => 'g' + i), O[0].map((_, j) => 'a' + j), opt, alpha, 'pearson', tag); has(st.xsRawNote, 'counted', tag); if (extra) has(st.xsRawNote, extra + ' skipped', tag);
  }
  /* ---------- McNemar ---------- */
  for (let it = 0; it < 24; it++) {
    const sc = pick([6, 14, 60, 300]), O = [[ri(0, sc), ri(0, sc)], [ri(0, sc), ri(0, sc)]], tag = 'mc#' + it; if (it === 1) O[1][0] = O[0][1] = 7; if (O[0][1] + O[1][0] === 0) O[0][1] = 3;
    await reset('table'); const opt = options(), alpha = await applyOpt(opt); await ctx.seg('xsPair', 'mc'); await grid(O);
    runs++; const st = await read(); cmp++; if (!st.body) { fails.push(tag + ' no result ' + st.hint); continue; }
    const b = O[0][1], c = O[1][0], n = b + c, chi = (b - c) * (b - c) / n, cc = Math.max(0, Math.abs(b - c) - 1), chiC = cc * cc / n, e = binomT(Math.min(b, c), n, 1, 1), ex = b === c ? 1 : Math.min(1, 2 * e.left), mid = b === c ? 1 : ex - e.obs;
    near(st.big.replace('χ² = ', ''), chi, tag + ' big'); pIs(afterP(st.sub), Q(chi, 1), tag + ' p'); near(st.mc[1][1], chi, tag + ' chi'); near(st.mc[2][1], chiC, tag + ' corrected'); pIs(st.mc[2][2], Q(chiC, 1), tag + ' corrected p'); pIs(st.mc[3][2], ex, tag + ' exact'); pIs(st.mc[4][2], mid, tag + ' midp');
    has(st.write, 'χ²(1, N = ' + (O[0][0] + O[0][1] + O[1][0] + O[1][1]).toLocaleString('en-US') + ') = ' + chi.toFixed(2), tag + ' write'); has(st.lab, 'McNemar', tag); cmp++; if (st.twoV || st.effV || st.powV || st.crossV !== false) fails.push(tag + ' independent-table panels shown'); if (n < 25) has(st.tip, 'fewer than 25', tag + ' tip');
    cmp++; if (st.segs.length !== 2 || Math.abs(st.segs[0].segs[0][0] - b / Math.max(b, c, n / 2) * 100) > 0.002) fails.push(tag + ' picture ' + JSON.stringify(st.segs));
  }
  /* ---------- goodness of fit ---------- */
  for (let it = 0; it < 56; it++) {
    const paste = it % 4 === 3, k = paste ? ri(2, 14) : it % 5 === 0 ? 2 : ri(2, 7), mode = pick(['eq', 'pct', 'cnt', 'ratio']), tag = 'fit#' + it + ' ' + mode;
    const sc = k === 2 ? pick([10, 40, 120]) : pick([6, 30, 200]), O = [...Array(k)].map(() => ri(0, sc)); if (O.reduce((a, b) => a + b, 0) === 0) O[0] = 5;
    const n = O.reduce((a, b) => a + b, 0);
    let W = [], E;
    if (mode === 'eq') E = O.map(() => n / k);
    else if (mode === 'pct') { let left = 100; for (let i = 0; i < k - 1; i++) { const v = ri(1, Math.max(1, Math.floor(left / (k - i)) * 2 - 1)); const u = Math.min(v, left - (k - 1 - i)); W.push(u); left -= u; } W.push(left); E = W.map((w) => n * w / 100); }
    else { W = [...Array(k)].map(() => ri(1, 9)); if (mode === 'cnt') { const sw = W.reduce((a, b) => a + b, 0); W = W.map((w) => Math.round(n * w / sw * 100) / 100); const d = n - W.reduce((a, b) => a + b, 0); W[0] = Math.round((W[0] + d) * 100) / 100; if (W.some((w) => !(w > 0))) continue; } const sw = W.reduce((a, b) => a + b, 0); E = W.map((w) => n * w / sw); }
    await reset('fit', paste ? 'paste' : 'rows'); await ctx.seg('xsExp', mode); const opt = options(), alpha = await applyOpt(opt);
    const named = R() < 0.5, names = O.map((_, i) => named ? 'k' + String.fromCharCode(97 + i) : 'Group ' + (i + 1));
    if (paste) await ctx.set('xsFitP', O.map((v, i) => (named ? names[i] + ', ' : '') + v + (mode === 'eq' ? '' : ', ' + W[i])).join('\n'));
    else { for (let i = 3; i < k; i++) await ctx.click('xsAddCat'); if (k === 2) await ctx.click('xsDelCat'); const v = {}; O.forEach((x, i) => { v['xsFO' + (i + 1)] = x; if (named) v['xsFN' + (i + 1)] = names[i]; if (mode !== 'eq') v['xsFE' + (i + 1)] = W[i]; }); await bulk(v); }
    const params = k > 2 && R() < 0.3 ? ri(0, k - 2) : null; await ctx.set('xsParams', params === null ? '' : String(params));
    runs++; const st = await read(); cmp++; if (!st.body) { fails.push(tag + ' no result ' + st.hint + ' ' + JSON.stringify([O, W])); continue; }
    const K = O.map((v, i) => (v - E[i]) * (v - E[i]) / E[i]), chi = K.reduce((a, b) => a + b, 0), df = k - 1 - (params || 0), p = Q(chi, df), w = Math.sqrt(chi / n);
    near(st.big.replace('χ² = ', ''), chi, tag + ' big'); has(st.sub, 'df = ' + df, tag); pIs(afterP(st.sub), p, tag + ' p'); cmp++; if ((p < alpha) === /not significant/.test(st.sub)) fails.push(tag + ' significance');
    const body = st.cells.slice(1); cmp++; if (body.length !== k + 1) fails.push(tag + ' rows ' + body.length); else for (let i = 0; i < k; i++) { const r = [body[i][0]].concat(body[i][1].split('|'), body[i].slice(2)); has(r[0], names[i], tag); cmp++; if (num(r[1]) !== O[i]) fails.push(tag + ' obs'); near(r[2], E[i], tag + ' E', 2); nearK(r[3], K[i], tag + ' K'); const z = (O[i] - E[i]) / Math.sqrt(E[i] * (1 - E[i] / n)); cmp++; if (!(Math.abs(num(r[4].replace('+', '')) - z) <= 0.5 * Math.pow(10, -(DEC !== null ? DEC : 2)) * 1.01 + 1e-9)) fails.push(tag + ' std diff ' + r[4] + ' vs ' + z); }
    near(st.eff[0][1], w, tag + ' w'); has(st.xsParamsNote, '= ' + df + '.', tag + ' params note');
    const lt5 = E.filter((e) => e < 5 - 1e-9).length; if (lt5 === 0) has(st.warn, 'All expected counts', tag); else has(st.warn, lt5 + ' of ' + k + ' expected counts', tag);
    const binary = k === 2 && !params; cmp++; if (st.twoV !== binary) fails.push(tag + ' binomial panel');
    if (binary) { let wa, wb; if (mode === 'eq') { wa = 1; wb = 1; } else { wa = Math.round(W[0] * 100); wb = Math.round(W[1] * 100); } const bt = binomT(O[0], n, wa, wb); pIs(st.two[2][2], bt.two, tag + ' binom two'); pIs(st.two[3][2], bt.left, tag + ' binom left'); pIs(st.two[4][2], bt.right, tag + ' binom right'); }
    checkPow(st, { chi, w, n }, df, alpha, opt.w, tag);
    has(st.write, 'χ²(' + df + ', N = ' + n.toLocaleString('en-US') + ') = ' + chi.toFixed(2), tag + ' write');
    const max = Math.max(...O, ...E); cmp++; if (st.segs.length !== k) fails.push(tag + ' picture rows'); else st.segs.forEach((r, i) => { cmp++; if (Math.abs(r.segs[0][0] - O[i] / max * 100) > 0.002 || Math.abs(r.marks[0] - E[i] / max * 100) > 0.002) fails.push(tag + ' bar ' + JSON.stringify(r) + ' vs ' + O[i] / max * 100 + ' / ' + E[i] / max * 100); });
    if (k >= 3 && it % 3 === 0) {
      const a = ri(0, k - 2), b = k - 1; await ctx.eval('document.querySelector("#xsMA .csel-opt[data-value=\\"' + a + '\\"]").click()'); await ctx.eval('document.querySelector("#xsMB .csel-opt[data-value=\\"' + b + '\\"]").click()'); await ctx.click('xsMergeBtn');
      const O2 = O.slice(), E2 = E.slice(); O2[a] += O2[b]; E2[a] += E2[b]; O2.splice(b, 1); E2.splice(b, 1);
      const chi2 = O2.reduce((t, v, i) => t + (v - E2[i]) * (v - E2[i]) / E2[i], 0), par2 = (params || 0) > O2.length - 2 ? 0 : (params || 0), df2 = O2.length - 1 - par2;
      runs++; const m = await read(); near(m.big.replace('χ² = ', ''), chi2, tag + ' merged'); has(m.sub, 'df = ' + df2, tag + ' merged df'); await ctx.click('xsUndoBtn'); const u = await read(); near(u.big.replace('χ² = ', ''), chi, tag + ' undone');
    }
  }
  /* ---------- value mode ---------- */
  for (let it = 0; it < 40; it++) {
    const df = pick([1, 2, 3, 4, 5, 7, 10, 15, 24, 60, 199, 1000]), x = +(pick([R() * 3, R() * df * 2, df + 3 * Math.sqrt(2 * df) * R(), R() * 40]).toFixed(ri(0, 4))), tag = 'value#' + it + ' ' + x + '/' + df;
    await reset('value'); const opt = options(), alpha = await applyOpt(opt); await bulk({ xsChi: x, xsDf: df });
    runs++; const st = await read(); cmp++; if (!st.body) { fails.push(tag + ' no result'); continue; }
    const p = Q(x, df), c = critC(alpha, df); pIs(st.big.replace(/^p /, '').replace(/^= /, ''), p, tag + ' p'); has(st.sub, 'df = ' + df, tag); near((st.sub.match(/critical value ([^ ]+)/) || [])[1] || '', c, tag + ' crit'); cmp++; if ((p < alpha) === /not significant/.test(st.sub)) fails.push(tag + ' significance ' + st.sub); has(st.write, df === 1 || opt.dec !== null || true ? '' : '', tag); has(st.write, 'χ²(' + df + ') = ' + x.toFixed(2), tag + ' write');
  }
  /* ---------- hints ---------- */
  const hintCase = async (setup, want, bodyWanted, tag) => { await setup(); runs++; const st = await read(); has(st.hint, want, tag + ' hint'); cmp++; if (st.body !== bodyWanted) fails.push(tag + ' body ' + st.body + ' hint ' + st.hint); };
  const g22 = async (O, pre) => { await reset('table'); await applyOpt({ alpha: null, dec: null, w: null }); if (pre) await pre(); await grid(O); };
  await hintCase(() => g22([[5, ''], ['', '']]), 'Fill every count box', false, 'partial grid');
  await hintCase(() => g22([[5, '2.5'], [3, 4]]), 'whole count', false, 'decimal');
  await hintCase(() => g22([[5, '12%'], [3, 4]]), 'whole count', false, 'percent');
  await hintCase(() => g22([[5, -2], [3, 4]]), 'cannot be negative', false, 'negative');
  await hintCase(() => g22([[5, 'abc'], [3, 4]]), 'Couldn’t read', false, 'junk');
  await hintCase(() => g22([[5, '2000000000'], [3, 4]]), 'too large', false, 'huge');
  await hintCase(() => g22([[0, 0], [3, 4]]), 'has no counts', false, 'zero row');
  await hintCase(() => g22([[0, 6], [0, 4]]), 'Column “Column 1” has no counts', false, 'zero column');
  await hintCase(() => g22([[0, 0], [0, 0]]), 'All the counts are 0', false, 'all zero');
  await hintCase(() => g22([[9, 0], [0, 4]], () => ctx.seg('xsPair', 'mc')), 'Nobody changed', false, 'no change');
  for (const [id, v, w] of [['xsAlpha', '2', 'between 0 and 1'], ['xsAlpha', 'x', 'between 0 and 1'], ['xsDec', '2.5', 'from 0 to 10'], ['xsW', '0', 'above 0'], ['xsW', '50', 'above 0']]) await hintCase(async () => { await g22([[5, 6], [7, 8]]); await ctx.set(id, v); }, w, true, id + '=' + v);
  await hintCase(async () => { await reset('table', 'paste'); await ctx.set('xsPaste', 'a, 1, 2\nb, 3'); }, 'same number of counts', false, 'ragged');
  await hintCase(async () => { await reset('table', 'paste'); await ctx.set('xsPaste', '1 2 3'); }, 'at least 2 rows', false, 'one row');
  await hintCase(async () => { await reset('table', 'paste'); await ctx.set('xsPaste', [...Array(21)].map(() => '1 2').join('\n')); }, 'up to 20', false, '21 rows');
  await hintCase(async () => { await reset('table', 'raw'); await ctx.set('xsRaw', 'a, x\na, y'); }, 'at least 2 different', false, 'one answer');
  const fit3 = async (mode, o, e) => { await reset('fit'); await applyOpt({ alpha: null, dec: null, w: null }); await ctx.seg('xsExp', mode); const v = {}; o.forEach((x, i) => { v['xsFO' + (i + 1)] = x; }); if (e) e.forEach((x, i) => { v['xsFE' + (i + 1)] = x; }); await bulk(v); };
  await hintCase(() => fit3('pct', [5, 6, 7], [50, 30, 10]), 'add up to 90%', false, 'percent sum');
  await hintCase(() => fit3('cnt', [5, 6, 7], [6, 6, 7]), 'add up to 19 but the observed counts add up to 18', false, 'count sum');
  await hintCase(() => fit3('ratio', [5, 6, 7], [1, 0, 2]), 'above 0', false, 'ratio zero');
  await hintCase(() => fit3('eq', [5, '', 7]), 'Fill every', false, 'fit partial');
  await hintCase(() => fit3('eq', [0, 0, 0]), 'All the observed counts are 0', false, 'fit zero');
  await hintCase(async () => { await fit3('eq', [5, 6, 7]); await ctx.set('xsParams', '5'); }, 'ignored', true, 'params');
  await fit3('eq', [30, 18, '']); runs++; { const st = await read(); near(st.big.replace('χ² = ', ''), 3, 'empty last row'); has(st.xsExpNote, 'empty last row is not counted', 'empty last row note'); }
  await fit3('ratio', [10, 20, 30], ['1/6', '1/3', '1/2']); runs++; { const st = await read(); near(st.big.replace('χ² = ', ''), 0, 'fractions'); }
  await hintCase(async () => { await reset('value'); await ctx.set('xsChi', '3'); }, 'degrees of freedom too', false, 'df missing');
  for (let it = 0; it < 14; it++) { const df = ri(1, 80), a = pick(['', '0.1', '0.01', '0.001']); await reset('value'); await applyOpt({ alpha: a || null, dec: null, w: null }); await ctx.set('xsDf', df); runs++; const st = await read(); const c = critC(a ? parseFloat(a) : 0.05, df); near(st.big, c, 'critical only df ' + df); has(st.lab, 'critical value', 'critical label'); has(st.write, 'is ' + st.big, 'critical sentence'); near(st.tcrit.replace('critical ', ''), c, 'critical on curve', 2); cmp++; if (/your χ²/.test(st.curve) || !st.body) fails.push('critical only: statistic drawn or no body'); }
  await hintCase(async () => { await reset('value'); await bulk({ xsChi: '-3', xsDf: '2' }); }, '0 or more', false, 'chi negative');
  await hintCase(async () => { await reset('value'); await bulk({ xsChi: '3', xsDf: '2.5' }); }, 'whole number', false, 'df fraction');
  /* optional fields before their prerequisite exists */
  await reset('table'); await applyOpt({ alpha: null, dec: null, w: null }); await bulk({ xsCN1: 'North', xsNameR: 'region', xsW: '0.3' }); runs++; { const st = await read(); has(st.xsGridNote, 'once every count box is filled', 'grid names early'); has(st.xsNamesNote, 'once the counts are in', 'variable names early'); has(st.xsWNote, 'Type the counts first', 'effect size early'); }
  await reset('fit'); await applyOpt({ alpha: '0.01', dec: null, w: null }); await bulk({ xsFN1: 'Red', xsNameK: 'colours', xsParams: '1' }); runs++; { const st = await read(); has(st.xsFitNote, 'once the counts are filled in', 'fit names early'); has(st.xsNameKNote, 'once the counts are in', 'counted name early'); has(st.xsParamsNote, 'Used once the counts are in', 'params early'); has(st.xsAlphaNote, 'below 0.01 counts', 'alpha early'); }
  /* names and citation styles */
  await reset('table'); await applyOpt({ alpha: null, dec: null, w: null }); await grid([[20, 30], [40, 10]]); await bulk({ xsNameR: 'smoking', xsNameC: 'cough' }); runs++; { const st = await read(); has(st.write, 'association between smoking and cough', 'names'); has(st.check, 'smoking', 'names check'); has(st.xsNamesNote, 'smoking', 'names note'); }
  for (const [style, word] of [['chicago', 'The chi-square statistic is'], ['plain', 'link between smoking and cough'], ['apa', 'χ²(1, N = 100)']]) { await ctx.eval('document.querySelector("#xsCiteChips [data-v=' + style + ']").click()'); runs++; has((await read()).write, word, 'style ' + style); }
  return { runs, fails: fails.slice(0, 40), cmp };
};
