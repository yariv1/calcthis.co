/* ORACLE for serial-dilution-calculator: an INDEPENDENT re-implementation of the arithmetic (never CalcThis.sdEngine): tube k = first / factor^(k-1), the factor from a fold / ratio 1:X / transfer over total,
   a series from X down to Y (factor from the tube count, or tubes counted by a loop), a typed list, the backwards volume plan (made, take, diluent), the smallest-pipette flag, the error spread,
   and the plate-count back-calculation. Compared with what the page DISPLAYS (headline, label, sub, tip, warnings, tube table, numbers table, notes, hints, sticky bar, steps) for
   random stocks, units, factors, tube counts and volumes in every mode. */
module.exports = async function (ctx) {
  let s = 20261123; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0; const ipow = (b, e) => { let p = 1; for (let k = 0; k < e; k++) p *= b; return p; };
  const grp = (t) => { const p = String(t).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); };
  const trz = (t) => t.indexOf('.') >= 0 ? t.replace(/0+$/, '').replace(/\.$/, '') : t;
  const sig = (x, p) => { p = p || 4; if (!isFinite(x)) return '—'; if (x === 0) return '0'; const ax = Math.abs(x); if (ax < 1e-4 || ax >= 1e9) return String(parseFloat(x.toPrecision(p)).toExponential()).replace('e+', 'e'); const e = Math.floor(Math.log(ax) / Math.LN10 + 1e-12), d = Math.max(0, Math.min(12, p - 1 - e)); return grp(trz(x.toFixed(d))); };
  const sci = (x, p) => (!isFinite(x) || x === 0) ? sig(x, p) : String(parseFloat(x.toPrecision(p || 4)).toExponential()).replace('e+', 'e');
  const VF = { nl: 0.001, ul: 1, ml: 1000, cl: 10000, l: 1e6, mm3: 1, cm3: 1000, dm3: 1e6, m3: 1e9, in3: 16387.064, ft3: 28316846.592, yd3: 764554857.984, usgal: 3785411.784, ukgal: 4546090, usfloz: 29573.5295625, ukfloz: 28413.0625, cup: 236588.2365, tbsp: 15000, tsp: 5000, usqt: 946352.946, ukqt: 1136522.5, uspt: 473176.473, ukpt: 568261.25 }, VL = { nl: 'nL', ul: 'µL', ml: 'mL', cl: 'cL', l: 'L', mm3: 'mm³', cm3: 'cm³', dm3: 'dm³', m3: 'm³', in3: 'cu in', ft3: 'cu ft', yd3: 'cu yd', usgal: 'US gal', ukgal: 'UK gal', usfloz: 'US fl oz', ukfloz: 'UK fl oz', cup: 'US cups', tbsp: 'tbsp (15 mL)', tsp: 'tsp (5 mL)', usqt: 'US qt', ukqt: 'UK qt', uspt: 'US pt', ukpt: 'UK pt' };
  const UL = { aM: 'aM', zM: 'zM', yM: 'yM', M: 'M', mM: 'mM', uM: 'µM', nM: 'nM', pM: 'pM', fM: 'fM', mgml: 'mg/mL', ugml: 'µg/mL', ngml: 'ng/mL', pct: '%', cellsml: 'cells/mL', cfuml: 'CFU/mL', pfuml: 'PFU/mL', x: '× (fold)' };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 220) + '] lacks [' + sub + ']'); return false; } return true; };
  const eq = (a, b, tag) => { cmp++; if (a !== b) fails.push(tag + ' got [' + a + '] expected [' + b + ']'); };
  const rowOf = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("sdBig"),lab:g("sdLab"),sub:g("sdSub"),tip:g("sdTip"),body:vis("sdBody"),hint:vis("sdHint")?g("sdHint"):"",warn:g("sdWarn"),tab:rows("sdTab"),nums:rows("sdNums"),flags:[].map.call(document.querySelectorAll("#sdTab tr.sd-flag"),function(r){return r.getAttribute("data-t");}),' +
    'cb:g("sdCb"),cbvis:vis("sdCbWrap"),steps:[].map.call(document.querySelectorAll("#sdSteps li"),function(l){return l.textContent.replace(/\\s+/g," ").trim();}),mval:g("sdMVal"),mlab:g("sdMLab"),copy:g("sdCopyTxt"),' +
    'stockn:g("sdStockN"),c1n:g("sdC1N"),nmn:g("sdNmN"),facn:g("sdFacN"),nn:g("sdNN"),rngn:g("sdRngN"),listn:g("sdListN"),firstn:g("sdFirstN"),voln:g("sdVolN"),repn:g("sdRepN"),lossn:g("sdLossN"),minn:g("sdMinN"),errn:g("sdErrN"),cbn:g("sdCbN"),tuben:g("sdTubeNN"),tubes:document.querySelectorAll("#sdTubes .sd-liq").length};})())'));
  const reset = async (o) => { o = o || {}; await ctx.click('sdClear'); await ctx.seg('sdMode', 'factor'); await ctx.seg('sdFt', 'fold'); await ctx.set('sdVu', 'ul'); await ctx.seg('sdFm', 'a'); await ctx.seg('sdSg', '4'); await ctx.seg('sdEt', 'p'); await ctx.seg('sdPu', 'ul'); await ctx.set('sdUnit', o.unit || 'cfuml'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("sdAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('sdAdvBtn'); };
  const cleanTxt = (st) => { cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push('bad text in result: ' + st.big); };
  await advOpen();

  /* independent series + plan from a scenario */
  const build = (q) => {
    let c = [], F = q.F;
    if (q.mode === 'list') c = q.list.slice();
    else if (q.mode === 'range') {
      let n = q.n;
      if (n) F = Math.pow(q.from / q.to, 1 / (n - 1)); else { n = 1; let v = q.from; while (v > q.to * (1 + 1e-9)) { v /= F; n++; } }
      for (let i = 0; i < n; i++) c.push(q.from / ipow(F, i)); c[n - 1] = q.to;
    } else { const c1 = q.first ? q.first : q.stock / F; for (let i = 0; i < q.n; i++) c.push(c1 / ipow(F, i)); }
    const n = c.length, ratios = c.map((x, i) => (i === 0 ? q.stock : c[i - 1]) / x), mul = VF[q.vu];
    const need = q.vol ? q.vol * mul * (q.rep || 1) * (1 + (q.loss || 0) / 100) : 0; let pl = null;
    if (need) { const made = new Array(n); made[n - 1] = need; for (let i = n - 2; i >= 0; i--) made[i] = need + made[i + 1] / ratios[i + 1]; pl = made.map((m, i) => ({ made: m, take: m / ratios[i], dil: m - m / ratios[i] })); }
    return { c, n, ratios, mul, need, pl, F };
  };
  const check = async (q, tag) => {
    const st = await read(), B = build(q), fm = q.fm === 's' ? (x) => sci(x, q.sg) : (x) => sig(x, q.sg), CF = (x) => fm(x) + ' ' + UL[q.unit], A = sig, VU = VL[q.vu], V = (ul) => A(ul / VF[q.vu]) + ' ' + VU;
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); return null; }
    cleanTxt(st); const { c, n, ratios, pl, need } = B, totalDil = q.stock / c[n - 1];
    eq(st.big, CF(c[n - 1]), tag + ' headline'); eq(st.lab, 'Concentration of tube ' + n, tag + ' label'); eq(st.mval, CF(c[n - 1]), tag + ' sticky'); eq(st.mlab, 'Tube ' + n, tag + ' sticky label');
    const dr = ratios.filter((r) => r > 1 + 1e-12), uni = dr.every((r) => Math.abs(r - dr[0]) <= 1e-9 * dr[0]);
    eq(st.sub, n + ' tube' + (n === 1 ? '' : 's') + ' · ' + (!dr.length ? 'no dilution step' : uni ? A(dr[0]) + '× each step' : 'steps of ' + A(Math.min.apply(null, dr)) + ' to ' + A(Math.max.apply(null, dr)) + '×') + ' · total dilution ' + A(totalDil) + '×', tag + ' sub');
    has(st.tip, 'From ' + CF(q.stock), tag + ' tip stock'); has(st.tip, 'The last tube is ' + A(totalDil) + ' times weaker than the stock', tag + ' tip total');
    if (pl) has(st.tip, 'the whole series needs ' + V(pl[0].take) + ' of stock', tag + ' tip stock needed');
    /* tube table */
    const body = st.tab.filter((r, i) => i > 0); eq(body.length, n + 1, tag + ' table rows');
    if (body.length === n + 1) {
      eq(body[0][0], 'Stock', tag + ' stock row'); eq(body[0][1], CF(q.stock), tag + ' stock row conc');
      for (let i = 0; i < n; i++) {
        const r = body[i + 1], stk = ratios[i] <= 1 + 1e-12;
        eq(r[0], String(i + 1), tag + ' tube ' + (i + 1) + ' number'); eq(r[1], CF(c[i]), tag + ' tube ' + (i + 1) + ' conc');
        if (pl) eq(r[2], stk ? V(pl[i].made) + ' of stock, no diluent' : V(pl[i].take) + ' of ' + (i === 0 ? 'stock' : 'tube ' + i) + ' + ' + V(pl[i].dil) + ' diluent = ' + V(pl[i].made), tag + ' tube ' + (i + 1) + ' pipette');
        else eq(r[2], stk ? 'the stock' : A(ratios[i]) + '× weaker', tag + ' tube ' + (i + 1) + ' step');
      }
    }
    /* numbers */
    const rn = (l) => rowOf(st.nums, l);
    { const r = rn('Tubes'); if (r) eq(r[1], String(n), tag + ' tubes row'); else fails.push(tag + ' no Tubes row'); }
    { const r = rn('Total dilution of the last tube'); if (r) eq(r[1], A(totalDil) + '×', tag + ' total dilution row'); else fails.push(tag + ' no total row'); }
    { const r = rn('Last tube'); if (r) eq(r[1], CF(c[n - 1]), tag + ' last tube row'); else fails.push(tag + ' no last tube row'); }
    if (pl) {
      const r1 = rn('Stock needed in total'), r2 = rn('Diluent needed in total'), r3 = rn('Liquid each tube must give');
      if (r1) eq(r1[1], V(pl[0].take), tag + ' stock total'); else fails.push(tag + ' no stock total row');
      if (r2) eq(r2[1], V(pl.reduce((a, p, i) => a + (ratios[i] > 1 + 1e-12 ? 0 : 0) + p.dil, 0)), tag + ' diluent total'); else fails.push(tag + ' no diluent total row');
      if (r3) eq(r3[1], V(need), tag + ' need row'); else fails.push(tag + ' no need row');
    } else { cmp++; if (rn('Stock needed in total')) fails.push(tag + ' stock total shown without a volume'); }
    if (q.err) { const steps = ratios.filter((r) => r > 1 + 1e-12).length, r = st.nums.filter((x) => x[0].indexOf('Concentration of tube ' + n + ' with ±') === 0)[0]; if (r) { has(r[0], '±' + A(q.err) + '% per step', tag + ' err label'); eq(r[1], steps ? 'worst case ±' + A(steps * q.err) + '%, typical ±' + A(Math.sqrt(steps) * q.err) + '% (independent errors)' : 'no dilution step: the stock itself', tag + ' err value'); } else fails.push(tag + ' no error row'); }
    /* flagged transfers */
    if (pl && q.min) { const exp = []; for (let i = 0; i < n; i++) if (ratios[i] > 1 + 1e-12 && pl[i].take < q.min * B.mul - 1e-12) exp.push(String(i + 1)); eq(st.flags.join(','), exp.join(','), tag + ' flagged tubes'); if (exp.length) has(st.warn, 'below your smallest volume of ' + A(q.min) + ' ' + VU, tag + ' warning'); else eq(st.warn, '', tag + ' no warning'); }
    else { eq(st.flags.length, 0, tag + ' no flags'); eq(st.warn, '', tag + ' no warn text'); }
    /* steps and copy */
    has(st.steps[0] || '', q.first ? 'Tube 1 starts at ' + CF(q.first) : q.mode !== 'factor' ? 'Tube 1 is ' + CF(c[0]) : 'stock ÷ factor = ' + A(q.stock) + ' ÷ ' + A(B.F) + ' = ' + A(c[0]), tag + ' step 1');
    has(st.steps.join(' '), 'Total dilution of the last tube = stock ÷ last tube = ' + A(q.stock) + ' ÷ ' + A(c[n - 1]) + ' = ' + A(totalDil) + '×', tag + ' total step');
    has(st.copy, 'last tube ' + CF(c[n - 1]) + ' (' + A(totalDil) + '× total)', tag + ' copy');
    eq(st.tubes, Math.min(n, 9) + 1, tag + ' drawn tubes');
    return st;
  };
  const num = (v) => parseFloat(String(v));

  /* ---- A. factor mode, three ways to give the factor ---- */
  for (let i = 0; i < 70; i++) {
    runs++; const unit = pick(Object.keys(UL)); await reset({ unit });
    const stock = pick([1e9, 1e6, 250, 0.05, 7500, 12345, 3e-6, 100, 5e8]), ft = pick(['fold', 'fold', 'ratio', 'tv']), n = pick([1, 2, 3, 6, 8, 12, 5, 30]);
    let F, typed = {}; if (ft === 'fold') { F = pick([2, 3, 5, 10, 2.5, 100, 1.5, 4]); typed.sdFactor = String(F); } else if (ft === 'ratio') { const X = pick([1, 4, 9, 2, 19, 99]); F = X + 1; typed.sdFactor = String(X); } else { const T = pick([100, 10, 1, 50, 20]), Vt = T * pick([2, 5, 10, 3]); F = Vt / T; typed.sdT = String(T); typed.sdV = String(Vt); }
    const vu = pick(['ul', 'ul', 'ml', 'l', 'nl', 'cup', 'usgal', 'tsp', 'cm3', 'ukfloz']), fm = pick(['a', 'a', 's']), sg = pick([4, 4, 4, 3, 5, 6]), q = { mode: 'factor', unit, stock, F, n, vu, fm, sg };
    if (ft === 'tv') { /* the unit switch converts typed T / V, so set the unit first */ }
    await ctx.set('sdVu', vu); await ctx.seg('sdFt', ft); await ctx.seg('sdFm', fm); await ctx.seg('sdSg', String(sg));
    await setAll(Object.assign({ sdStock: String(stock), sdN: String(n) }, typed));
    if (R() < 0.25) { const first = pick([stock, stock / 10, stock / 4, stock / F]); q.first = first; await ctx.set('sdFirst', String(first)); }
    if (R() < 0.7) { q.vol = pick([100, 50, 500, 0.5, 2000, 25]); await ctx.set('sdVol', String(q.vol)); if (R() < 0.5) { q.rep = pick([2, 3, 10]); await ctx.set('sdRep', String(q.rep)); } if (R() < 0.5) { q.loss = pick([10, 5, 25, 0.5]); await ctx.set('sdLoss', String(q.loss)); } if (R() < 0.5) { q.min = pick([5, 10, 0.5, 100, 1]); await ctx.set('sdMin', String(q.min)); } }
    if (R() < 0.4) { q.err = pick([2, 5, 0.5, 10]); await ctx.set('sdErr', String(q.err)); }
    q.first = q.first ? num(q.first) : 0;
    await check(q, 'factor ' + ft + ' stock ' + stock + ' F ' + F + ' n ' + n + ' unit ' + unit + ' vu ' + vu + ' ' + JSON.stringify({ first: q.first, vol: q.vol, rep: q.rep, loss: q.loss, min: q.min, err: q.err }));
  }
  /* ---- B. from X down to Y ---- */
  for (let i = 0; i < 30; i++) {
    runs++; await reset({}); await ctx.seg('sdMode', 'range');
    const stock = 1e6, from = pick([1000, 100000, 250, 5000, 1e6]), to = pick([1, 10, 0.5, 0.01]); if (!(to < from)) { i--; runs--; continue; }
    const useN = R() < 0.5, q = { mode: 'range', unit: 'cfuml', stock, from, to, vu: 'ul', fm: 'a' }; const o = { sdStock: String(stock), sdFrom: String(from), sdTo: String(to) };
    if (useN) { q.n = pick([2, 3, 4, 6, 9]); o.sdN = String(q.n); } else { q.F = pick([10, 2, 3, 5, 4]); o.sdFactor = String(q.F); const nn = (() => { let n = 1, v = from; while (v > to * (1 + 1e-9)) { v /= q.F; n++; } return n; })(); if (nn > 30) { i--; runs--; continue; } }
    await setAll(o); if (R() < 0.5) { q.vol = pick([100, 50]); await ctx.set('sdVol', String(q.vol)); }
    await check(q, 'range ' + JSON.stringify({ from, to, n: q.n, F: q.F, vol: q.vol }));
  }
  /* ---- C. own list ---- */
  for (let i = 0; i < 20; i++) {
    runs++; await reset({}); await ctx.seg('sdMode', 'list');
    const stock = 1e6, k = pick([1, 2, 3, 5, 8]); let v = pick([1e6, 5e5, 1000, 640]); const list = []; for (let j = 0; j < k; j++) { list.push(v); v = v / pick([2, 10, 3.3, 5, 4]); }
    const q = { mode: 'list', unit: 'cfuml', stock, list, vu: 'ul', fm: 'a' }; await setAll({ sdStock: String(stock), sdList: pick([list.join(', '), list.join(' '), list.join('\n')]) });
    if (R() < 0.5) { q.vol = pick([100, 40]); await ctx.set('sdVol', String(q.vol)); }
    await check(q, 'list ' + list.join(','));
  }
  /* ---- D. count back from a plate ---- */
  for (let i = 0; i < 20; i++) {
    runs++; await reset({}); const stock = pick([1e9, 5e8, 1e10]), F = pick([10, 2, 5]), n = pick([4, 6, 8]), pu = pick(['ul', 'ml']);
    await ctx.seg('sdPu', pu); await setAll({ sdStock: String(stock), sdFactor: String(F), sdN: String(n) });
    const cnt = pick([32, 250, 5, 450, 120]), pv = pu === 'ul' ? pick([100, 200, 50, 10]) : pick([0.1, 0.2, 1]), t = pick([0, n, 1, Math.ceil(n / 2)]);
    await setAll({ sdCnt: String(cnt), sdPlate: String(pv) }); if (t) await ctx.set('sdTubeN', String(t));
    const st = await read(), tube = t || n, ct = stock / F / ipow(F, tube - 1), pMl = pv / (pu === 'ml' ? 1 : 1000), ti = cnt / pMl * (stock / ct), tag = 'count ' + JSON.stringify({ stock, F, n, cnt, pv, pu, t });
    if (!st.body) { fails.push(tag + ' no result'); continue; } cmp++; if (!st.cbvis) fails.push(tag + ' count result hidden');
    eq(st.cb, sig(ti) + ' per mL', tag + ' original'); has(st.cbn, sig(cnt) + ' counted ÷ ' + sig(pMl) + ' mL = ' + sig(cnt / pMl) + ' per mL in tube ' + tube, tag + ' note');
    has(st.cbn, 'so the original has ' + sig(ti) + ' per mL', tag + ' note original'); has(st.cbn, cnt >= 30 && cnt <= 300 ? 'A count of 30 to 300 is the range' : 'so this plate may be too sparse or too crowded', tag + ' note range');
  }
  /* ---- E. notes, hints and every field reacting ---- */
  const hintCase = async (setup, ex, tag) => { await reset({}); await setAll(setup.o || {}); if (setup.mode) await ctx.seg('sdMode', setup.mode); if (setup.o2) await setAll(setup.o2); const st = await read(); runs++;
    if (ex.body !== undefined) eq(st.body, ex.body, tag + ' result shown'); if (ex.hint) has(st.hint, ex.hint, tag + ' hint'); else if (ex.hint === '') eq(st.hint, '', tag + ' no hint'); for (const k of Object.keys(ex.n || {})) has(st[k], ex.n[k], tag + ' ' + k); cleanTxt(st); return st; };
  await hintCase({}, { body: false, n: { stockn: 'Type the concentration of your stock' } }, 'empty');
  await hintCase({ o: { sdStock: '1e9' } }, { body: false, n: { facn: 'Type the dilution factor', nn: 'Type how many tubes' } }, 'stock only');
  await hintCase({ o: { sdFactor: '10', sdN: '6' } }, { body: false, n: { stockn: 'Type the concentration of your stock' } }, 'no stock');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10' } }, { body: false, n: { nn: 'Type how many tubes' } }, 'no tubes');
  await hintCase({ o: { sdStock: '1e9', sdN: '6' } }, { body: false, n: { facn: 'Type the dilution factor' } }, 'no factor');
  await hintCase({ o: { sdStock: 'abc', sdFactor: '10', sdN: '6' } }, { body: false, hint: 'stock concentration should be a number above 0', n: { stockn: 'Use a number above 0' } }, 'stock junk');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '1', sdN: '6' } }, { body: false, hint: 'must be above 1', n: { facn: 'type a factor above 1' } }, 'factor 1');
  await hintCase({ o: { sdStock: '1e9', sdFactor: 'x', sdN: '6' } }, { body: false, hint: 'dilution factor should be a number above 0' }, 'factor junk');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '31' } }, { body: false, hint: 'whole number from 1 to 30' }, 'tubes 31');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '2.5' } }, { body: false, hint: 'whole number from 1 to 30' }, 'tubes 2.5');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdFirst: '2e9' } }, { body: false, hint: 'cannot be stronger than the stock' }, 'first above stock');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdFirst: 'z' } }, { body: true, hint: 'First tube: use a number above 0', n: { firstn: 'Use a number above 0' } }, 'first junk');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdVol: 'z' } }, { body: true, hint: 'Volume needed: use a number above 0' }, 'vol junk');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdRep: '2.5', sdVol: '100' } }, { body: true, hint: 'Replicates: use a whole number' }, 'rep 2.5');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdLoss: '-3' } }, { body: true, hint: 'Pipetting loss: use a number above 0' }, 'loss neg');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdMin: '0' } }, { body: true, hint: 'Smallest volume: use a number above 0' }, 'min zero');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdErr: '500' } }, { body: true, hint: 'Pipetting error: use a number above 0 and up to 100' }, 'err 500');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdCnt: 'q' } }, { body: true, hint: 'Count: use a number above 0' }, 'count junk');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdCnt: '30' } }, { body: true, n: { cbn: 'Type the volume plated too' } }, 'count only');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdPlate: '100' } }, { body: true, n: { cbn: 'Type the count too' } }, 'plate only');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdCnt: '30', sdPlate: '100', sdTubeN: '9' } }, { body: true, hint: 'Tube plated: use a whole number from 1 to 6' }, 'tube 9');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6' } }, { body: true, n: { voln: 'Optional. Type how much liquid each tube must give', cbn: 'Optional. After plating' } }, 'optional notes empty');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdVol: '100', sdMin: '5' } }, { body: true, n: { minn: 'Transfers below 5 µL are flagged' } }, 'min note');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdMin: '5' } }, { body: true, n: { minn: 'needs the volume above' } }, 'min without volume');
  await hintCase({ o: { sdStock: '1e9', sdFactor: '10', sdN: '6', sdLoss: '10' } }, { body: true, n: { lossn: 'needs the volume above' } }, 'loss without volume');
  await hintCase({ mode: 'range', o2: { sdStock: '1e6', sdFrom: '1000' } }, { body: false, n: { rngn: 'Type the concentration of the first tube and the one you want' } }, 'range partial');
  await hintCase({ mode: 'range', o2: { sdStock: '1e6', sdFrom: '1', sdTo: '1000', sdN: '4' } }, { body: false, hint: 'last tube must be weaker than the first' }, 'range reversed');
  await hintCase({ mode: 'range', o2: { sdStock: '1e6', sdFrom: '1000', sdTo: '1' } }, { body: false, n: { facn: 'Optional here', nn: 'Optional here' } }, 'range without factor or tubes');
  await hintCase({ mode: 'range', o2: { sdStock: '1e6', sdFrom: '1000', sdTo: '1', sdN: '1' } }, { body: false, hint: 'at least 2 tubes' }, 'range one tube');
  await hintCase({ mode: 'range', o2: { sdStock: '1e6', sdFrom: '1e9', sdTo: '1', sdN: '4' } }, { body: false, hint: 'cannot be stronger than the stock' }, 'range above stock');
  await hintCase({ mode: 'range', o2: { sdStock: '1e6', sdFrom: '1e9', sdTo: '1e-9', sdFactor: '1.2' } }, { body: false }, 'range too many tubes');
  await hintCase({ mode: 'list', o2: { sdStock: '1e6', sdList: '1000, 100, 100' } }, { body: false, hint: 'Each concentration must be weaker than the one before (tube 3' }, 'list repeated');
  await hintCase({ mode: 'list', o2: { sdStock: '1e6', sdList: '1e9, 100' } }, { body: false, hint: 'cannot be stronger than the stock' }, 'list above stock');
  await hintCase({ mode: 'list', o2: { sdStock: '1e6', sdList: 'abc' } }, { body: false, hint: 'Couldn’t find a number above 0' }, 'list junk');
  await hintCase({ mode: 'list', o2: { sdStock: '1e6', sdList: '1000, x, 10' } }, { body: true, n: { listn: '2 concentrations read, 1 item that is not a number left out' } }, 'list with junk item');
  await hintCase({ o: { sdStock: '1e6', sdN: '4' }, o2: {} }, { body: false }, 'tv before choosing');
  { runs++; await reset({}); await ctx.seg('sdFt', 'tv'); await setAll({ sdStock: '1e6', sdT: '100', sdN: '4' }); const st = await read(); has(st.facn, 'Type the total volume too', 'tv no total note'); eq(st.body, false, 'tv no total result'); }
  { runs++; await reset({}); await ctx.seg('sdFt', 'tv'); await setAll({ sdStock: '1e6', sdT: '1000', sdV: '100', sdN: '4' }); const st = await read(); has(st.facn, 'The transfer must be smaller than the total volume', 'tv reversed note'); eq(st.body, false, 'tv reversed result'); }
  { runs++; await reset({}); await ctx.seg('sdFt', 'tv'); await setAll({ sdStock: '1e6', sdT: '100', sdV: '1000', sdN: '4' }); const st = await read(); has(st.facn, '100 µL into 1,000 µL total = a factor of 10 (1 part + 9 parts diluent)', 'tv note'); eq(st.body, true, 'tv result'); }
  { runs++; await reset({}); await ctx.seg('sdFt', 'ratio'); await setAll({ sdStock: '1e6', sdFactor: '9', sdN: '4' }); const st = await read(); has(st.facn, '1 : 9 means 1 part + 9 parts diluent = a factor of 10', 'ratio note'); }

  /* ---- G. new features: significant digits, volume error, single dilution, names, plate expectation, example, half-log ---- */
  { runs++; await reset({}); await setAll({ sdStock: '1234567', sdFactor: '10', sdN: '3' }); await ctx.seg('sdSg', '6'); const st = await read(); eq(st.big, sig(1234.567, 6) + ' CFU/mL', 'six significant digits'); await ctx.seg('sdSg', '3'); const s3 = await read(); eq(s3.big, sig(1234.567, 3) + ' CFU/mL', 'three significant digits'); }
  { runs++; await reset({}); await setAll({ sdStock: '1234567', sdFactor: '10', sdN: '3' }); await ctx.seg('sdFm', 's'); await ctx.seg('sdSg', '5'); const st = await read(); eq(st.big, sci(1234.567, 5) + ' CFU/mL', 'scientific with five digits'); }
  /* volume error: relative error of a step = error / volume taken */
  for (let i = 0; i < 12; i++) {
    runs++; await reset({}); const F = pick([10, 2, 5]), n = pick([3, 4, 6]), vol = pick([100, 200, 50]), e = pick([0.5, 1, 2]);
    await ctx.seg('sdEt', 'v'); await setAll({ sdStock: '1000000', sdFactor: String(F), sdN: String(n), sdVol: String(vol), sdErr: String(e) });
    const st = await read(), B = build({ mode: 'factor', stock: 1e6, F, n, vu: 'ul', vol }), takes = B.pl.map((p) => p.take); let sum = 0, sq = 0; B.ratios.forEach((r, k) => { if (r > 1 + 1e-12) { const rel = e / takes[k] * 100; sum += rel; sq += rel * rel; } });
    const r = st.nums.filter((x) => x[0].indexOf('Concentration of tube ' + n + ' with ±' + sig(e) + ' µL per transfer') === 0)[0], tag = 'volume error F ' + F + ' n ' + n + ' vol ' + vol + ' e ' + e;
    if (r) eq(r[1], 'worst case ±' + sig(sum) + '%, typical ±' + sig(Math.sqrt(sq)) + '% (independent errors)', tag); else fails.push(tag + ' no row');
  }
  { runs++; await reset({}); await ctx.seg('sdEt', 'v'); await setAll({ sdStock: '1000000', sdFactor: '10', sdN: '3', sdErr: '1' }); const st = await read(); has(st.errn, 'needs the volume above', 'volume error without volume note'); eq(st.nums.filter((x) => x[0].indexOf('with ±') > 0).length, 0, 'no error row without a volume'); }
  { runs++; await reset({}); await ctx.seg('sdEt', 'v'); await ctx.set('sdErr', '2'); await ctx.seg('sdEt', 'p'); eq(await ctx.val('sdErr'), '', 'switching error type clears the box'); }
  /* single dilution */
  { runs++; await reset({}); await setAll({ sdStock: '1000', sdC2: '10', sdV2: '500' }); const st = await read(); has(st.c1n, 'Take 5 µL of the stock and add 495 µL of diluent to make 500 µL at 10 CFU/mL (a factor of 100).', 'C1V1 note'); }
  { runs++; await reset({}); await setAll({ sdStock: '1000', sdC2: '2000', sdV2: '500' }); const st = await read(); has(st.c1n, 'cannot be stronger than the stock', 'C1V1 target above stock'); }
  { runs++; await reset({}); await setAll({ sdC2: '10', sdV2: '500' }); const st = await read(); has(st.c1n, 'Type the stock concentration first', 'C1V1 without stock'); }
  { runs++; await reset({}); await setAll({ sdStock: '1000', sdC2: '10' }); const st = await read(); has(st.c1n, 'Type the final volume too', 'C1V1 without volume'); }
  { runs++; await reset({}); await setAll({ sdStock: '1000', sdC2: 'q', sdFactor: '10', sdN: '3' }); const st = await read(); has(st.hint, 'Concentration you want: use a number above 0', 'C1V1 junk hint'); eq(st.body, true, 'C1V1 junk keeps the result'); }
  { runs++; await reset({}); await ctx.set('sdVu', 'ml'); await setAll({ sdStock: '1000', sdC2: '10', sdV2: '2' }); const st = await read(); has(st.c1n, 'Take 0.02 mL of the stock and add 1.98 mL of diluent to make 2 mL', 'C1V1 in mL'); }
  /* names in the copied protocol */
  { runs++; await reset({}); await setAll({ sdStock: '1000000', sdFactor: '10', sdN: '3', sdVol: '100', sdSN: 'culture', sdDN: 'saline' }); const st = await read(); has(st.nmn, 'The copied protocol says “culture” and “saline”.', 'names note'); has(st.copy, 'of culture + ', 'copy stock name'); has(st.copy, ' saline = ', 'copy diluent name'); has(st.copy, 'of tube 1 + ', 'copy tube name'); }
  { runs++; await reset({}); await setAll({ sdStock: '1000000', sdFactor: '10', sdN: '3', sdSN: 'culture' }); const st = await read(); has(st.nmn, 'The copied protocol says “culture” and “diluent”.', 'one name note'); }
  /* plate expectation: tubes between 30 and 300 */
  for (let i = 0; i < 10; i++) {
    runs++; await reset({}); const stock = pick([1e9, 5e8, 2e10]), F = pick([10, 2, 5]), n = pick([6, 8, 10]), pv = pick([100, 200, 50, 10]);
    await setAll({ sdStock: String(stock), sdFactor: String(F), sdN: String(n), sdPlate: String(pv) }); const st = await read(), B = build({ mode: 'factor', stock, F, n, vu: 'ul' }), hit = [];
    B.c.forEach((c, k) => { const ex = c * pv / 1000; if (ex >= 30 && ex <= 300) hit.push('tube ' + (k + 1) + ' (' + sig(ex) + ')'); });
    const r = st.nums.filter((x) => x[0].indexOf('Countable tubes (30 to 300) on a ' + sig(pv) + ' µL plate') === 0)[0], tag = 'plate expectation ' + JSON.stringify({ stock, F, n, pv });
    if (r) eq(r[1], hit.length ? hit.join(', ') : 'no tube lands between 30 and 300', tag); else fails.push(tag + ' no row');
  }
  { runs++; await reset({}); await ctx.set('sdUnit', 'mgml'); await setAll({ sdStock: '1000', sdFactor: '10', sdN: '3', sdPlate: '100' }); const st = await read(); eq(st.nums.filter((x) => x[0].indexOf('Countable tubes') === 0).length, 0, 'no plate row for a mass concentration'); }
  /* example button and the half-log preset */
  { runs++; await reset({}); await ctx.click('sdEx'); const st = await read(); eq(st.big, '1,000 CFU/mL', 'example headline'); eq(await ctx.val('sdStock'), '1000000000', 'example stock'); eq(await ctx.val('sdVol'), '100', 'example volume'); }
  { runs++; await reset({}); await ctx.eval('document.querySelector("#sdPre button[data-n=\\"6\\"][data-f=\\"3.16227766\\"]").click()'); eq(await ctx.val('sdFactor'), '3.16227766', 'half-log factor'); await ctx.set('sdStock', '1000000'); const st = await read(); eq(st.big, sig(1e6 / Math.pow(3.16227766, 6)) + ' CFU/mL', 'half-log result'); has(st.sub, '3.162× each step', 'half-log step'); }
  { runs++; await reset({}); await setAll({ sdStock: '1000000', sdFactor: '10', sdN: '3' }); await ctx.click('sdAdvBtn'); await ctx.click('sdAdvBtn'); await ctx.seg('sdSg', '6'); await ctx.click('sdClear'); await setAll({ sdStock: '1234567', sdFactor: '10', sdN: '3' }); eq((await read()).big, sig(1234.567) + ' CFU/mL', 'clear resets the significant digits'); }
  { runs++; await reset({}); await setAll({ sdCnt: '32' }); const st = await read(); eq(st.body, false, 'count alone has no result'); has(st.cbn, 'Set up the series first', 'count alone note'); await ctx.set('sdTubeN', '3'); const s2 = await read(); has(s2.tuben, 'Needs the series above first', 'tube alone note'); }
  /* ---- F. controls ---- */
  { runs++; await reset({}); await setAll({ sdStock: '1e6', sdFactor: '10', sdN: '6', sdVol: '100', sdMin: '5', sdT: '' }); await ctx.set('sdVu', 'ml'); eq(await ctx.val('sdVol'), '0.1', 'vol ul -> ml'); eq(await ctx.val('sdMin'), '0.005', 'min ul -> ml'); await ctx.set('sdVu', 'ul'); eq(await ctx.val('sdVol'), '100', 'vol ml -> ul'); await ctx.set('sdVol', 'junk'); await ctx.set('sdVu', 'ml'); eq(await ctx.val('sdVol'), 'junk', 'junk volume kept on unit switch'); }
  { runs++; await reset({}); await ctx.click('sdPre'); await ctx.eval('document.querySelector("#sdPre button[data-f=\\"3\\"]").click()'); eq(await ctx.val('sdFactor'), '3', 'preset factor'); eq(await ctx.val('sdN'), '6', 'preset tubes'); await ctx.set('sdStock', '1e6'); const st = await read(); eq(st.big, sig(1e6 / Math.pow(3, 6)) + ' CFU/mL', 'preset result'); }
  { runs++; await reset({}); await setAll({ sdStock: '1e6', sdFactor: '10', sdN: '6', sdVol: '100' }); await ctx.click('sdClear'); eq(await ctx.val('sdStock'), '', 'clear stock'); eq(await ctx.val('sdVol'), '', 'clear volume'); const st = await read(); eq(st.body, false, 'clear hides the result'); eq(st.big, '—', 'clear headline'); }
  { runs++; await reset({}); await setAll({ sdStock: '1e6', sdFactor: '10', sdN: '6' }); const a = await read(); await ctx.eval('document.getElementById("sdAdvBtn").click()'); await ctx.eval('document.getElementById("sdAdvBtn").click()'); const b = await read(); eq(a.big, b.big, 'advanced toggle keeps result'); }
  { runs++; await reset({}); await setAll({ sdStock: '1e6', sdFactor: '10', sdN: '6' }); await ctx.set('sdUnit', 'uM'); const st = await read(); eq(st.big, '1 µM', 'unit label change'); has(st.tip, '1,000,000 µM', 'unit in tip'); }
  { runs++; await reset({}); await setAll({ sdStock: '1e6', sdFactor: '10', sdN: '12' }); const st = await read(); eq(st.tubes, 10, 'tubes drawn are capped at 9 plus the stock'); has(await ctx.eval('document.getElementById("sdTubesCap").textContent'), 'The first 9 tubes are drawn; all 12 are in the table', 'cap note'); }
  /* extremes stay readable */
  { runs++; await reset({}); await setAll({ sdStock: '1e30', sdFactor: '1000000000', sdN: '30' }); cleanTxt(await read()); }
  { runs++; await reset({}); await setAll({ sdStock: '1e-30', sdFactor: '1.000001', sdN: '30' }); cleanTxt(await read()); }
  return { runs, fails: fails.slice(0, 60), comparisons: cmp };
};
