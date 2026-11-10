/* ORACLE for confidence-interval-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.ciEngine / pvalueEngine).
   t and z critical values: bisection on a NUMERICALLY INTEGRATED density (composite Simpson, Stirling log-gamma) instead of the page's incomplete beta/gamma.
   Exact proportion interval (Clopper-Pearson): bisection on DIRECT BINOMIAL SUMS. Exact Poisson interval: bisection on DIRECT POISSON SUMS. Wilson / Wald / Welch / pooled re-typed from the textbook.
   Compared with what the page DISPLAYS (headline, label, numbers table, methods table, more-data table, notes, hints) over every mode, spread, group count, level source and method. */
module.exports = async function (ctx) {
  let s = 20261111; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, cmp = 0;
  const lg = (x) => { let sh = 0; while (x < 12) { sh += Math.log(x); x += 1; } const x2 = x * x; return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + 1 / (12 * x) - 1 / (360 * x * x2) + 1 / (1260 * x * x2 * x2) - 1 / (1680 * x * x2 * x2 * x2) - sh; };
  const dt = (df, x) => Math.exp(lg((df + 1) / 2) - lg(df / 2)) / Math.sqrt(df * Math.PI) * Math.pow(1 + x * x / df, -(df + 1) / 2);
  const dz = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  const simpson = (f, a, b, n) => { if (n % 2) n++; const h = (b - a) / n; let t = f(a) + f(b); for (let i = 1; i < n; i++) t += f(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
  const cache = {};
  const crit = (level, df) => {
    const useZ = !df || df > 1e6, key = (useZ ? 'z' : df) + '|' + level; if (cache[key] !== undefined) return cache[key];
    const f = useZ ? dz : (x) => dt(df, x); let a = 0, b = 2000;
    for (let i = 0; i < 62; i++) { const m = (a + b) / 2, area = 2 * simpson(f, 0, m, Math.max(1500, Math.ceil(m * 60))); if (area < level) a = m; else b = m; }
    return (cache[key] = (a + b) / 2);
  };
  const lbin = (n, i) => lg(n + 1) - lg(i + 1) - lg(n - i + 1);
  const binTailGE = (n, x, p) => { let t = 0; for (let i = x; i <= n; i++) t += Math.exp(lbin(n, i) + (i ? i * Math.log(p) : 0) + (n - i ? (n - i) * Math.log(1 - p) : 0)); return t; };
  const binTailLE = (n, x, p) => { let t = 0; for (let i = 0; i <= x; i++) t += Math.exp(lbin(n, i) + (i ? i * Math.log(p) : 0) + (n - i ? (n - i) * Math.log(1 - p) : 0)); return t; };
  const cp = (x, n, level) => {
    const al = 1 - level; let lo = 0, hi = 1;
    if (x > 0) { let a = 0, b = 1; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (binTailGE(n, x, m) < al / 2) a = m; else b = m; } lo = (a + b) / 2; }
    if (x < n) { let a = 0, b = 1; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (binTailLE(n, x, m) > al / 2) a = m; else b = m; } hi = (a + b) / 2; }
    return [lo, hi];
  };
  const poiLE = (k, l) => { let t = 0; for (let i = 0; i <= k; i++) t += Math.exp(-l + i * Math.log(l) - lg(i + 1)); return t; };
  const poi = (k, level) => {
    const al = 1 - level; let lo = 0, hi;
    if (k > 0) { let a = 0, b = k + 12 * Math.sqrt(k) + 40; for (let i = 0; i < 70; i++) { const m = (a + b) / 2; if (1 - poiLE(k - 1, m) < al / 2) a = m; else b = m; } lo = (a + b) / 2; }
    { let a = 0, b = k + 12 * Math.sqrt(k) + 40; for (let i = 0; i < 70; i++) { const m = (a + b) / 2; if (poiLE(k, m) > al / 2) a = m; else b = m; } hi = (a + b) / 2; }
    return [lo, hi];
  };
  const fnumT = (x) => String(Math.round(x * 1e6) / 1e6);
  const dFor = (me) => Math.max(0, Math.min(10, 3 - Math.floor(Math.log10(me) + 1e-9)));
  const nearPow = (me) => { const l = Math.log10(me); return Math.abs(l - Math.round(l)) < 2e-4; };
  const nums = (t) => (String(t).replace(/−/g, '-').match(/-?\d+\.?\d*(e[+-]?\d+)?/gi) || []).map(parseFloat);
  const decs = (t) => { const m = String(t).replace(/−/g, '-').match(/-?\d+\.(\d+)/); return m ? m[1].length : 0; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 140) + '] lacks [' + sub + ']'); return false; } return true; };
  const near = (got, exp, d, tag) => { cmp++; const tol = 0.5 * Math.pow(10, -d) * 1.02 + 1e-9 * Math.abs(exp); if (got == null || !isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + '] (decimals ' + d + ')'); return false; } return true; };
  const rel = (got, exp, tag, r) => { cmp++; if (got == null || !isFinite(got) || Math.abs(got - exp) > Math.max((r || 2e-4) * Math.abs(exp), 1e-9)) { fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false; } return true; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("ciBig"),lab:g("ciLab"),sub:g("ciSub"),tip:g("ciTip"),body:vis("ciBody"),hint:vis("ciHint")?g("ciHint"):"",nums:rows("ciNums"),meth:rows("ciMeth"),need:rows("ciNeed"),steps:g("ciSteps"),main:g("ciMainNote"),lnote:g("ciLevelNote"),gnote:g("ciGroupNote"),snote:g("ciSpreadNote"),bynote:g("ciByNote"),mnote:g("ciMethodNote"),pnote:g("ciPhatNote"),tnote:g("ciTargetNote"),dnote:g("ciDecNote"),vis:vis("ciVisWrap"),svg:document.getElementById("ciVis").innerHTML.length,mbar:g("ciMVal")};})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("ciAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('ciAdvBtn'); };
  const clear = async (mode) => { await ctx.click('ciClear'); await ctx.seg('ciMode', mode || 'mean'); await ctx.seg('ciHave', 'sum'); await ctx.set('ciBy', 'level'); };
  const ALLIDS = ['ciMean', 'ciSd', 'ciN', 'ciX', 'ciPn', 'ciK', 'ciLevel', 'ciMean2', 'ciSd2', 'ciN2', 'ciX2', 'ciPn2', 'ciByVal', 'ciPhat', 'ciTarget', 'ciDec'];
  const LEVELS = [['', 0.95], ['95', 0.95], ['90', 0.90], ['99', 0.99], ['80', 0.80], ['99.9', 0.999], ['97.5', 0.975], ['0.9', 0.90], ['85%', 0.85], ['50', 0.50]];
  const lvTxt = (l) => String(Math.round(l * 1e8) / 1e6);
  const tail = (txt) => txt;
  await advOpen();

  /* interval from the headline: [lo, hi] and the decimals shown */
  const bigIv = (big) => { const m = big.replace(/−/g, '-').match(/^(-?\d[\d.]*)%? to (-?\d[\d.]*)%?$/); return m ? [parseFloat(m[1]), parseFloat(m[2]), decs(big.split(' to ')[0])] : null; };
  const check = (st, tag, expLo, expHi, k, expMe, level, kindText) => {
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); return null; }
    const iv = bigIv(st.big); if (!iv) { fails.push(tag + ' cannot read headline [' + st.big + ']'); return null; }
    const dE = dFor(expMe * k); const dG = iv[2];
    if (dG !== dE && !nearPow(expMe * k)) fails.push(tag + ' decimals shown ' + dG + ', expected ' + dE + ' (margin ' + expMe * k + ')');
    near(iv[0], expLo * k, dG, tag + ' lower'); near(iv[1], expHi * k, dG, tag + ' upper');
    has(st.lab, lvTxt(level) + '% confidence interval for ' + kindText, tag + ' label');
    cmp++; if (st.mbar !== st.big) fails.push(tag + ' sticky bar [' + st.mbar + '] differs from headline');
    cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push(tag + ' bad text in result');
    return dG;
  };
  const rowOf = (rows, label) => (rows.filter((r) => r[0] === label || r[0].indexOf(label) === 0)[0] || null);

  /* ---- 1. mean from summary numbers (sample s -> t) ---- */
  for (let i = 0; i < 110; i++) {
    const n = pick([2, 3, 4, 5, 8, 10, 15, 25, 30, 50, 100, 400, 1000]), m = Math.round((R() * 200 - 50) * 100) / 100, sd = Math.round((R() * 30 + 0.2) * 100) / 100, lv = pick(LEVELS);
    await clear('mean'); await ctx.set('ciMean', String(m)); await ctx.set('ciSd', String(sd)); await ctx.set('ciN', String(n)); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++;
    const c = crit(lv[1], n - 1), se = sd / Math.sqrt(n), me = c * se, tag = '[mean ' + m + ' sd ' + sd + ' n ' + n + ' lvl ' + lv[0] + ']';
    const d = check(st, tag, m - me, m + me, 1, me, lv[1], 'the mean'); if (d === null) continue;
    const nm = rowOf(st.nums, 'Standard error'); if (nm) near(nums(nm[1])[0], se, decs(nm[1]), tag + ' SE'); else fails.push(tag + ' no SE row');
    const cr = rowOf(st.nums, 'Critical value'); if (cr) { rel(nums(cr[1])[0], c, tag + ' critical', 3e-4); has(cr[1], 't = ', tag + ' crit kind'); } else fails.push(tag + ' no critical row');
    const mr = rowOf(st.nums, 'Margin of error'); if (mr) near(nums(mr[1])[0], me, d, tag + ' ME row'); else fails.push(tag + ' no ME row');
    const pr = rowOf(st.nums, 'Margin of error as a percentage'); if (m !== 0) { if (pr) near(nums(pr[1])[0], Math.abs(me / m) * 100, 2, tag + ' ME %'); else fails.push(tag + ' no ME % row'); }
    const zr = st.meth.filter((r) => r[0].indexOf('z (normal)') === 0)[0], tr = st.meth.filter((r) => r[0].indexOf('t distribution') === 0)[0];
    if (zr && tr) { const zc = crit(lv[1], 0), z = nums(zr[1].replace(' to ', ' ')); near(z[0], m - zc * se, d, tag + ' z lower'); near(z[1], m + zc * se, d, tag + ' z upper'); const t2 = nums(tr[1].replace(' to ', ' ')); near(t2[0], m - me, d, tag + ' t row lower'); } else fails.push(tag + ' methods table incomplete: ' + JSON.stringify(st.meth));
    [2, 4, 10].forEach((mu) => { const rw = st.need.filter((r) => r[0].indexOf('(' + mu + '×)') >= 0)[0]; if (!rw) { fails.push(tag + ' no ' + mu + '× row'); return; } const me2 = crit(lv[1], n * mu - 1) * sd / Math.sqrt(n * mu); near(nums(rw[1])[0], me2, d, tag + ' ' + mu + '× margin'); const iv2 = nums(rw[2].replace(' to ', ' ')); near(iv2[0], m - me2, d, tag + ' ' + mu + '× lower'); });
    has(st.main, 'degrees of freedom', tag + ' main note'); has(st.lnote, lv[0] ? lvTxt(lv[1]) + '% confidence' : 'No level typed, so 95%', tag + ' level note');
    has(st.steps, 'Interval = ', tag + ' steps'); cmp++; if (!st.vis || st.svg < 800) fails.push(tag + ' picture missing');
  }

  /* ---- 2. mean from a pasted list ---- */
  for (let i = 0; i < 30; i++) {
    const n = pick([2, 3, 5, 8, 12, 20]), vals = []; for (let j = 0; j < n; j++) vals.push(Math.round((R() * 100 - 20) * 10) / 10);
    await clear('mean'); await ctx.seg('ciHave', 'list'); await ctx.set('ciList', vals.join(pick([', ', ' ', '\n', '; '])));
    const lv = pick(LEVELS); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++;
    const mean = vals.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1)), tag = '[list ' + vals.join('|') + ' lvl ' + lv[0] + ']';
    if (sd === 0) continue;
    const me = crit(lv[1], n - 1) * sd / Math.sqrt(n);
    check(st, tag, mean - me, mean + me, 1, me, lv[1], 'the mean'); has(st.main, 'n = ' + n, tag + ' list note');
  }
  { await clear('mean'); await ctx.seg('ciHave', 'list'); await ctx.set('ciList', '5'); let st = await read(); runs++; cmp++; if (st.body || st.hint.indexOf('at least 2') < 0) fails.push('[list of one] expected the hint, got ' + JSON.stringify([st.body, st.hint]));
    await ctx.set('ciList', 'a, b'); st = await read(); runs++; cmp++; if (st.body || st.hint.indexOf('number') < 0) fails.push('[junk list] expected hint, got ' + st.hint);
    await ctx.set('ciList', '1, 2, x, 3'); st = await read(); runs++; has(st.main, '1 item that is not a number', '[list junk]'); await ctx.seg('ciHave', 'sum'); }

  /* ---- 3. known sigma (z) and standard error ---- */
  for (let i = 0; i < 25; i++) {
    const n = pick([1, 2, 5, 10, 30, 100]), m = Math.round(R() * 100) / 10, sd = Math.round((R() * 20 + 0.3) * 100) / 100, lv = pick(LEVELS);
    await clear('mean'); await ctx.seg('ciSpread', 'sigma'); await ctx.set('ciMean', String(m)); await ctx.set('ciSd', String(sd)); await ctx.set('ciN', String(n)); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++; const se = sd / Math.sqrt(n), me = crit(lv[1], 0) * se, tag = '[sigma ' + m + ' ' + sd + ' n ' + n + ' lvl ' + lv[0] + ']';
    check(st, tag, m - me, m + me, 1, me, lv[1], 'the mean'); const cr = rowOf(st.nums, 'Critical value'); if (cr) has(cr[1], 'z = ', tag + ' z label'); has(st.main, 'normal (z) distribution', tag + ' note');
  }
  for (let i = 0; i < 20; i++) {
    const withN = R() < 0.6, n = pick([2, 5, 10, 30, 100]), m = Math.round(R() * 100) / 10, se0 = Math.round((R() * 5 + 0.1) * 100) / 100, lv = pick(LEVELS);
    await clear('mean'); await ctx.seg('ciSpread', 'se'); await ctx.set('ciMean', String(m)); await ctx.set('ciSd', String(se0)); if (withN) await ctx.set('ciN', String(n)); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++; const me = crit(lv[1], withN ? n - 1 : 0) * se0, tag = '[se ' + m + ' ' + se0 + (withN ? ' n ' + n : ' no n') + ' lvl ' + lv[0] + ']';
    check(st, tag, m - me, m + me, 1, me, lv[1], 'the mean'); const sr = rowOf(st.nums, 'Standard error'); if (sr) near(nums(sr[1])[0], se0, decs(sr[1]), tag + ' SE row'); has(st.main, withN ? 't distribution' : 'No sample size typed', tag + ' note');
  }

  /* ---- 4. two means ---- */
  for (let i = 0; i < 25; i++) {
    const n1 = pick([3, 5, 10, 25, 60]), n2 = pick([3, 6, 12, 25, 80]), m1 = Math.round(R() * 500) / 10, m2 = Math.round(R() * 500) / 10, s1 = Math.round((R() * 9 + 0.5) * 10) / 10, s2 = Math.round((R() * 9 + 0.5) * 10) / 10, lv = pick(LEVELS);
    await clear('mean'); await ctx.set('ciMean', String(m1)); await ctx.set('ciSd', String(s1)); await ctx.set('ciN', String(n1)); await ctx.seg('ciGroups', 'two');
    await ctx.set('ciMean2', String(m2)); await ctx.set('ciSd2', String(s2)); await ctx.set('ciN2', String(n2)); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++;
    const v1 = s1 * s1 / n1, v2 = s2 * s2 / n2, df = Math.pow(v1 + v2, 2) / (v1 * v1 / (n1 - 1) + v2 * v2 / (n2 - 1)), se = Math.sqrt(v1 + v2), d0 = m1 - m2, me = crit(lv[1], df) * se, tag = '[2 means ' + [m1, s1, n1, m2, s2, n2, lv[0]].join('|') + ']';
    check(st, tag, d0 - me, d0 + me, 1, me, lv[1], 'the difference between the means');
    const sp2 = ((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2), mep = crit(lv[1], n1 + n2 - 2) * Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    const pr = st.meth.filter((r) => r[0].indexOf('Pooled') === 0)[0], zr = st.meth.filter((r) => r[0].indexOf('z (normal)') === 0)[0];
    const dd = bigIv(st.big) ? bigIv(st.big)[2] : 2;
    if (pr) { const q = nums(pr[1].replace(' to ', ' ')); near(q[0], d0 - mep, dd, tag + ' pooled lower'); near(q[1], d0 + mep, dd, tag + ' pooled upper'); } else fails.push(tag + ' no pooled row');
    if (zr) { const q = nums(zr[1].replace(' to ', ' ')), mez = crit(lv[1], 0) * se; near(q[0], d0 - mez, dd, tag + ' z lower'); } else fails.push(tag + ' no z row');
    has(st.tip, d0 - me <= 0 && d0 + me >= 0 ? 'includes 0' : 'does not include 0', tag + ' tip');
  }
  { await clear('mean'); await ctx.set('ciMean', '5'); await ctx.set('ciSd', '2'); await ctx.set('ciN', '10'); await ctx.seg('ciGroups', 'two'); let st = await read(); runs++; has(st.gnote, 'Type group 2', '[g2 empty]'); cmp++; if (!st.body) fails.push('[g2 empty] group 1 should still show');
    await ctx.set('ciMean2', '4'); st = await read(); runs++; has(st.gnote, 'not complete', '[g2 partial]'); cmp++; if (!st.body) fails.push('[g2 partial] group 1 should still show'); await ctx.seg('ciGroups', 'one'); }

  /* ---- 5. one proportion, all three methods ---- */
  for (let i = 0; i < 70; i++) {
    const n = pick([1, 2, 5, 10, 20, 40, 60, 100, 150]), x = pick([0, 1, Math.floor(R() * (n + 1)), Math.floor(R() * (n + 1)), n, Math.max(0, n - 1)]), xx = Math.min(x, n), lv = pick(LEVELS), method = pick(['wald', 'wilson', 'exact']);
    await clear('prop'); await ctx.set('ciMethod', method); await ctx.set('ciX', String(xx)); await ctx.set('ciPn', String(n)); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++;
    const p = xx / n, z = crit(lv[1], 0), z2 = z * z;
    const wald = [Math.max(0, p - z * Math.sqrt(p * (1 - p) / n)), Math.min(1, p + z * Math.sqrt(p * (1 - p) / n))];
    const den = 1 + z2 / n, ctr = (p + z2 / (2 * n)) / den, hf = z / den * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)), wil = [Math.max(0, ctr - hf), Math.min(1, ctr + hf)], ex = cp(xx, n, lv[1]);
    const iv = { wald: wald, wilson: wil, exact: ex }[method], me = (iv[1] - iv[0]) / 2, tag = '[prop ' + xx + '/' + n + ' ' + method + ' lvl ' + lv[0] + ']';
    if (!(me > 0)) continue;
    const d = check(st, tag, iv[0], iv[1], 100, me, lv[1], 'the proportion'); if (d === null) continue;
    ['wald', 'wilson', 'exact'].forEach((mm) => { const nm = { wald: 'Normal approximation', wilson: 'Wilson score', exact: 'Exact' }[mm], rw = st.meth.filter((r) => r[0].indexOf(nm) === 0)[0]; if (!rw) { fails.push(tag + ' no ' + mm + ' row'); return; } const q = nums(rw[1].replace(' to ', ' ').replace(/%/g, '')), e2 = { wald: wald, wilson: wil, exact: ex }[mm]; const dd = decs(rw[1].split(' to ')[0]); near(q[0], e2[0] * 100, dd, tag + ' ' + mm + ' row lower'); near(q[1], e2[1] * 100, dd, tag + ' ' + mm + ' row upper'); });
    has(st.main, 'p̂ = ' + xx + ' ÷ ' + n, tag + ' note');
  }
  { await clear('prop'); await ctx.set('ciX', '120'); await ctx.set('ciPn', '100'); let st = await read(); runs++; cmp++; if (st.body || st.hint.indexOf('can’t be bigger') < 0) fails.push('[x>n] expected hint, got ' + st.hint);
    await ctx.set('ciX', ''); await ctx.set('ciPn', '100'); await ctx.set('ciPhat', '40%'); st = await read(); runs++; has(st.pnote, 'p̂ × n = 40', '[phat note]'); const pw = st.big; cmp++; if (!st.body) fails.push('[phat] no result');
    await ctx.set('ciX', '40'); st = await read(); runs++; cmp++; if (st.big !== pw) fails.push('[phat vs x] ' + st.big + ' vs ' + pw); has(st.pnote, 'ignored', '[phat ignored]'); }

  /* ---- 6. two proportions ---- */
  for (let i = 0; i < 25; i++) {
    const n1 = pick([10, 30, 80, 150]), n2 = pick([10, 40, 100, 200]), x1 = Math.floor(R() * (n1 + 1)), x2 = Math.floor(R() * (n2 + 1)), lv = pick(LEVELS);
    await clear('prop'); await ctx.set('ciX', String(x1)); await ctx.set('ciPn', String(n1)); await ctx.seg('ciGroups', 'two'); await ctx.set('ciX2', String(x2)); await ctx.set('ciPn2', String(n2)); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++; const p1 = x1 / n1, p2 = x2 / n2, se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2), me = crit(lv[1], 0) * se, tag = '[2 props ' + [x1, n1, x2, n2, lv[0]].join('|') + ']';
    if (!(me > 0)) continue; check(st, tag, p1 - p2 - me, p1 - p2 + me, 100, me, lv[1], 'the difference between the proportions');
  }

  /* ---- 7. count (exact Poisson) ---- */
  for (let i = 0; i < 35; i++) {
    const k = pick([0, 1, 2, 3, 5, 10, 25, 60, 150, 400]), lv = pick(LEVELS);
    await clear('count'); await ctx.set('ciK', String(k)); if (lv[0]) await ctx.set('ciLevel', lv[0]);
    const st = await read(); runs++; const iv = poi(k, lv[1]), me = (iv[1] - iv[0]) / 2, tag = '[count ' + k + ' lvl ' + lv[0] + ']';
    check(st, tag, iv[0], iv[1], 1, me, lv[1], 'the count');
    if (k > 0) { const nr = st.meth.filter((r) => r[0].indexOf('Normal approximation') === 0)[0]; if (nr) { const q = nums(nr[1].replace(' to ', ' ')), mz = crit(lv[1], 0) * Math.sqrt(k); near(q[0], k - mz, decs(nr[1].split(' to ')[0]), tag + ' normal row lower'); } else fails.push(tag + ' no normal row'); }
    const ex = st.need.filter((r) => r[0].indexOf('4× as long') === 0)[0]; if (ex) { const i4 = poi(k * 4, lv[1]); const q = nums(ex[2].replace(' to ', ' ')); near(q[0], i4[0] / 4, decs(ex[2].split(' to ')[0]), tag + ' 4× lower'); } else fails.push(tag + ' no 4× row');
  }

  /* ---- 8. level from a z-score or a right-tailed p ---- */
  const zcdfHi = (z) => simpson(dz, z, z + 40, Math.max(4000, Math.ceil(z * 200)));
  for (let i = 0; i < 16; i++) {
    const useZ = i % 2 === 0; await clear('mean'); await ctx.set('ciMean', '10'); await ctx.set('ciSd', '2'); await ctx.set('ciN', '30'); await ctx.set('ciBy', useZ ? 'z' : 'p');
    const v = useZ ? pick([1.2, 1.645, 1.96, 2.576, 3]) : pick([0.2, 0.05, 0.025, 0.005]); await ctx.set('ciByVal', String(v));
    const st = await read(); runs++; const level = useZ ? 1 - 2 * zcdfHi(v) : 1 - 2 * v, tag = '[level by ' + (useZ ? 'z ' : 'p ') + v + ']';
    const c = crit(Math.round(level * 1e8) / 1e8, 29), me = c * 2 / Math.sqrt(30);
    check(st, tag, 10 - me, 10 + me, 1, me, level, 'the mean'); has(st.lnote, 'level comes from the', tag + ' note');
  }

  /* ---- 9. margin of error wanted -> sample size ---- */
  for (let i = 0; i < 16; i++) {
    const isP = i % 2 === 0, lv = pick(LEVELS); await clear(isP ? 'prop' : 'mean');
    let need, E, tag;
    if (isP) { const x = pick([40, 10, 25]), n = 100; await ctx.set('ciX', String(x)); await ctx.set('ciPn', String(n)); E = pick([2, 3, 5]); await ctx.set('ciTarget', String(E)); if (lv[0]) await ctx.set('ciLevel', lv[0]); const z = crit(lv[1], 0), p = x / n; need = Math.ceil(z * z * p * (1 - p) / ((E / 100) * (E / 100)) - 1e-9); tag = '[target prop ' + x + '/' + n + ' E ' + E + ' lvl ' + lv[0] + ']'; }
    else { const sd = pick([5, 12, 3.5]); await ctx.set('ciMean', '50'); await ctx.set('ciSd', String(sd)); await ctx.set('ciN', '30'); E = pick([0.5, 1, 2]); await ctx.set('ciTarget', String(E)); if (lv[0]) await ctx.set('ciLevel', lv[0]); const z = crit(lv[1], 0); need = Math.ceil(Math.pow(z * sd / E, 2) - 1e-9); tag = '[target mean sd ' + sd + ' E ' + E + ' lvl ' + lv[0] + ']'; }
    const st = await read(); runs++; has(st.tnote, 'at least ' + need.toLocaleString('en-US') + ' people', tag + ' note');
    const rw = st.need.filter((r) => r[0].indexOf('(target)') >= 0)[0]; cmp++; if (!rw || nums(rw[0])[0] !== need) fails.push(tag + ' table row ' + JSON.stringify(rw) + ' expected n ' + need);
  }

  /* ---- 10. QA item 19: every field reacts, refusal texts ---- */
  { await clear('mean'); await ctx.set('ciSd', '3'); let st = await read(); runs++; has(st.main, 'Type the sample mean', '[sd alone]'); cmp++; if (st.body) fails.push('[sd alone] result shown');
    await ctx.set('ciMean', '5'); await ctx.set('ciN', '20'); st = await read(); has(st.lnote, 'No level typed', '[default level note]');
    await ctx.set('ciLevel', 'abc'); st = await read(); runs++; has(st.hint, 'ignored for now', '[level junk]'); cmp++; if (!st.body) fails.push('[level junk] result hidden');
    await ctx.set('ciLevel', '1'); st = await read(); runs++; has(st.hint, 'could mean 1% or 100%', '[level 1]');
    await ctx.set('ciLevel', '100'); st = await read(); runs++; has(st.hint, 'below 100%', '[level 100]');
    await ctx.set('ciLevel', '95'); await ctx.set('ciDec', '2'); st = await read(); runs++; has(st.dnote, '2 decimal places', '[dec note]'); const iv = bigIv(st.big); cmp++; if (!iv || iv[2] !== 2) fails.push('[dec 2] headline ' + st.big);
    await ctx.set('ciDec', '99'); st = await read(); runs++; has(st.hint, 'ignored for now', '[dec bad]'); await ctx.set('ciDec', '');
    await ctx.set('ciTarget', '1'); st = await read(); runs++; has(st.tnote, 'at least', '[target note]'); await ctx.set('ciTarget', '-1'); st = await read(); runs++; has(st.hint, 'ignored for now', '[target bad]'); await ctx.set('ciTarget', '');
    await ctx.set('ciBy', 'z'); st = await read(); runs++; has(st.bynote, 'Type the z-score', '[by z, empty]'); await ctx.set('ciByVal', '99'); st = await read(); runs++; has(st.hint, 'ignored for now', '[by z bad]'); await ctx.set('ciBy', 'level');
    await clear('prop'); await ctx.set('ciPn', '50'); st = await read(); runs++; cmp++; if (st.body) fails.push('[prop, x missing] result shown'); has(st.main, 'Type the number of yes answers', '[prop prerequisite]');
    await clear('count'); await ctx.set('ciK', '2000000'); st = await read(); runs++; cmp++; if (st.body || st.hint.indexOf('1,000,000') < 0) fails.push('[count too large] ' + st.hint);
    await clear('mean'); await ctx.set('ciMean', '5'); await ctx.set('ciSd', '3'); await ctx.set('ciN', '1'); st = await read(); runs++; cmp++; if (st.body || st.hint.indexOf('at least 2') < 0) fails.push('[n=1] ' + st.hint);
    await ctx.set('ciN', '12.5'); st = await read(); runs++; cmp++; if (st.body || st.hint.indexOf('whole number') < 0) fails.push('[n=12.5] ' + st.hint);
    await ctx.set('ciN', '5'); await ctx.set('ciMean', '5'); await ctx.set('ciSd', '1'); st = await read(); runs++; cmp++; if (!st.body) fails.push('[recover] no result'); }
  /* a result at the extremes must not break */
  for (const ex of [['1e9', '1e9', '1e9'], ['0', '0.0001', '2'], ['-1000000', '999999', '3']]) { await clear('mean'); await ctx.set('ciMean', ex[0]); await ctx.set('ciSd', ex[1]); await ctx.set('ciN', ex[2]); const st = await read(); runs++; cmp++; if (!st.body || /NaN|Infinity|undefined/.test(JSON.stringify(st))) fails.push('[extreme ' + ex.join('|') + '] ' + JSON.stringify([st.body, st.hint, st.big])); }
  await clear('mean');
  fails.unshift('(oracle info: ' + runs + ' runs, ' + cmp + ' comparisons)'); fails.shift();
  return { runs, fails };
};
