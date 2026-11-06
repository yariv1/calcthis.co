/* Independent re-implementation of the weight loss calculator's maths (does NOT use CalcThis.wlEngine / deficitEngine). Drives the real inputs and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 987654; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  const trim = (x, d) => String(parseFloat((Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)));
  const MONF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dur = (d) => d > 3650 ? 'more than 10 years' : (d < 14 ? Math.max(1, Math.ceil(d)) + (Math.ceil(d) === 1 ? ' day' : ' days') : Math.round(d / 7) + ' weeks');
  const inDays = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const KG = 7700, LB = 2.20462, ST = 6.35029;
  const fails = []; let runs = 0, invalid = 0;
  const rowsOf = async () => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#wlRows .bf-cmp")].map(e=>[e.querySelector(".k").textContent.replace(/\\s+/g," ").trim(),e.querySelector(".v").textContent.replace(/\\s+/g," ").trim()]))'));
  const find = (rows, start) => { const r = rows.filter((x) => x[0].indexOf(start) === 0)[0]; return r ? r[1] : null; };
  for (let i = 0; i < 300; i++) {
    const sex = pick(['f', 'm']), hu = pick(['cm', 'in', 'm']), wu = pick(['kg', 'lb', 'st']), plan = pick(['date', 'date', 'pace']), model = pick(['simple', 'simple', 'real']), main = pick(['est', 'est', 'known']), f = pick([1.2, 1.375, 1.55, 1.725, 1.9]);
    const age = 18 + Math.round(R() * 60), cm = Math.round((150 + R() * 45) * 10) / 10, kg = Math.round((55 + R() * 70) * 10) / 10, bf = (main === 'est' && R() < 0.2) ? pick([15, 25, 35]) : null;
    const hv = hu === 'in' ? String(Math.round(cm / 2.54 * 100) / 100) : (hu === 'm' ? String(Math.round(cm) / 100) : String(cm));
    const hcm = hu === 'in' ? parseFloat(hv) * 2.54 : (hu === 'm' ? parseFloat(hv) * 100 : cm);
    const conv = (k) => wu === 'lb' ? String(Math.round(k * LB * 10) / 10) : (wu === 'st' ? String(Math.round(k / ST * 100) / 100) : String(k));
    const back = (v) => wu === 'lb' ? parseFloat(v) / LB : (wu === 'st' ? parseFloat(v) * ST : parseFloat(v));
    const wv = conv(kg), W = back(wv);
    const lossFrac = 0.03 + R() * 0.25, gv = conv(Math.round(kg * (1 - lossFrac) * 10) / 10), G = back(gv);
    const hasG = plan === 'date' ? true : R() < 0.6;
    const days = 20 + Math.round(R() * 500);
    const pu = wu === 'kg' ? 'kg' : 'lb', pv = pick(['0.3', '0.5', '0.75', '1', '1.5']), pace = plan === 'pace' ? pick([pv, '']) : '';
    await ctx.fill();
    await ctx.seg('wlSex', sex); await ctx.seg('wlWU', wu); await ctx.seg('wlHU', hu); await ctx.seg('wlMain', main); await ctx.seg('wlPlan', plan); await ctx.seg('wlModel', model);
    await ctx.eval('document.getElementById("wlAct").value="' + f + '"');
    const adv = bf !== null; const open = await ctx.eval('document.getElementById("wlAdvIn").style.display');
    if (adv && open === 'none') await ctx.click('wlAdvBtn'); if (!adv && open !== 'none') await ctx.click('wlAdvBtn');
    await ctx.seg('wlModel', model);
    await ctx.set('wlAge', String(age)); await ctx.set('wlH', hv); await ctx.set('wlW', wv); await ctx.set('wlG', hasG ? gv : '');
    if (adv) await ctx.set('wlBf', String(bf));
    let mt = null; if (main === 'known') { mt = 1500 + Math.round(R() * 1800); await ctx.set('wlMaint', String(mt)); }
    let out0, slope;
    if (main === 'known') { out0 = mt; slope = 14; } else if (adv) { out0 = (370 + 21.6 * W * (1 - bf / 100)) * f; slope = 21.6 * (1 - bf / 100) * f; } else { out0 = (10 * W + 6.25 * hcm - 5 * age + (sex === 'm' ? 5 : -161)) * f; slope = 10 * f; }
    const male = sex === 'm', floor = male ? 1500 : 1200;
    const tag = JSON.stringify({ sex, hu, wu, plan, model, main, hv, wv, gv: hasG ? gv : '', f, age, bf, mt, days, pace });
    runs++;
    let Dd, I;
    if (plan === 'date') {
      const d = inDays(days), ds = pick(['full', 'full', 'iso', 'us', 'short']);
      const txt = ds === 'iso' ? d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() : (ds === 'us' ? (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() : (ds === 'short' ? d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear() : d.getDate() + ' ' + MONF[d.getMonth()] + ' ' + d.getFullYear()));
      await ctx.set('wlDate', txt);
      const simple = (W - G) * KG / days, e = Math.exp(-slope * days / KG), wInf = (G - W * e) / (1 - e), real = slope * (W - wInf);
      Dd = model === 'real' ? real : simple; I = out0 - Dd;
      const big = await ctx.text('wlBig');
      if (!(I >= 500) || Dd >= out0) { invalid++; const hint = await ctx.text('wlHint'); if (big !== '—' || hint.indexOf('you would need a deficit') < 0) fails.push('impossible date should explain ' + big + ' | ' + hint + ' ' + tag); continue; }
      if (big !== grp(I) + ' kcal') fails.push('headline ' + big + ' expected ' + grp(I) + ' ' + tag);
      const rows = await rowsOf();
      const eat = find(rows, 'Eat a day'), def = find(rows, 'Deficit a day'), sim = find(rows, 'Simple 7,700 rule'), rea = find(rows, 'Realistic: eat');
      if (eat !== grp(I) + ' kcal') fails.push('eat row ' + eat + ' ' + tag);
      if (def !== grp(Dd) + ' kcal') fails.push('deficit row ' + def + ' ' + tag);
      if (sim === null || sim.indexOf(grp(out0 - simple) + ' kcal') !== 0) fails.push('simple row ' + sim + ' expected ' + grp(out0 - simple) + ' ' + tag);
      if (rea === null || rea.indexOf(grp(out0 - real) + ' kcal') !== 0) fails.push('realistic row ' + rea + ' expected ' + grp(out0 - real) + ' ' + tag);
      const wk = find(rows, 'Loss a week'), kgw = Dd * 7 / KG, pd = pu === 'kg' ? kgw : kgw * LB;
      if (wk === null || wk.indexOf(f2(pd) + ' ' + pu) !== 0) fails.push('loss a week ' + wk + ' expected ' + f2(pd) + ' ' + pu + ' ' + tag);
      const tl = find(rows, 'Weight to lose'), lose = W - G, dispL = wu === 'lb' ? lose * LB : (wu === 'st' ? lose / ST : lose);
      if (tl === null || tl.indexOf(trim(dispL, 1) + ' ' + wu) !== 0 || tl.indexOf(f1(lose / W * 100) + '% of your body weight') < 0) fails.push('weight to lose ' + tl + ' expected ' + trim(dispL, 1) + ' ' + wu + ' / ' + f1(lose / W * 100) + '% ' + tag);
      /* fastest date within the guidelines */
      const dS = Math.min(out0 - floor, Math.min(0.907185, 0.01 * W) * KG / 7), fk = find(rows, 'Fastest date within the guidelines');
      if (dS > 0) {
        const sd = lose * KG / dS, w0 = W - dS / slope, rd = G > w0 ? -(KG / slope) * Math.log((G - w0) / (W - w0)) : null, ed = model === 'real' ? rd : sd;
        const want = ed == null ? 'levels off first' : dur(ed);
        if (fk === null || fk.indexOf(want) !== 0) fails.push('fastest date ' + fk + ' expected ' + want + ' ' + tag);
      } else if (fk === null || fk.indexOf('none') !== 0) fails.push('fastest date none ' + fk + ' ' + tag);
      /* calories for other target dates (6 rows) */
      const trs = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#wlByDate tbody tr")].map(r=>[r.children[1].textContent.replace(/\\s+/g," ").trim(),r.getAttribute("data-d")]))'));
      if (trs.length !== 6) fails.push('by-date table rows ' + trs.length + ' ' + tag);
      trs.forEach((t) => {
        const dd = +t[1], sI = out0 - (W - G) * KG / dd, e2 = Math.exp(-slope * dd / KG), wI = (G - W * e2) / (1 - e2), rI = out0 - slope * (W - wI), I2 = model === 'real' ? rI : sI, D2 = out0 - I2;
        const ok = I2 >= 500 && D2 < out0;
        if (ok ? t[0].indexOf(grp(I2) + ' kcal') !== 0 : t[0].indexOf('—') !== 0) fails.push('by-date ' + dd + ' days ' + t[0] + ' expected ' + (ok ? grp(I2) : '—') + ' ' + tag);
      });
    } else {
      await ctx.set('wlPace', pace);
      const defKg = pu === 'kg' ? 0.5 : 1 / LB, kgw = pace === '' ? defKg : (pu === 'kg' ? parseFloat(pace) : parseFloat(pace) / LB);
      Dd = kgw * KG / 7; I = out0 - Dd;
      const big = await ctx.text('wlBig');
      if (kgw > 0.02 * W + 1e-9 || out0 - Dd < 500) continue;
      if (big !== grp(I) + ' kcal') fails.push('pace headline ' + big + ' expected ' + grp(I) + ' ' + tag);
      const rows = await rowsOf(), wk = find(rows, 'Loss a week'), pd = pu === 'kg' ? kgw : kgw * LB;
      if (wk === null || wk.indexOf(f2(pd) + ' ' + pu) !== 0) fails.push('pace loss a week ' + wk + ' expected ' + f2(pd) + ' ' + tag);
      if (hasG && G < W) {
        const sd = (W - G) * KG / Dd, wi = W - Dd / slope, rd = G > wi ? -(KG / slope) * Math.log((G - wi) / (W - wi)) : null;
        const ts = find(rows, 'Time to'), tr = rows.filter((x) => x[0].indexOf('realistic') > 0)[0];
        if (ts === null || ts.indexOf(dur(sd)) !== 0) fails.push('pace time simple ' + ts + ' expected ' + dur(sd) + ' ' + tag);
        if (!tr || (rd === null ? tr[1].indexOf('levels off at') !== 0 : tr[1].indexOf(dur(rd)) !== 0)) fails.push('pace time realistic ' + (tr && tr[1]) + ' expected ' + (rd === null ? 'levels off' : dur(rd)) + ' ' + tag);
      }
    }
  }
  /* explicit edge: a date in the past, today, and text that is not a date */
  await ctx.fill();
  await ctx.set('wlDate', '1 January 2020'); if ((await ctx.text('wlBig')) !== '—' || (await ctx.text('wlHint')).indexOf('after today') < 0) fails.push('past date should ask for a later date');
  await ctx.set('wlDate', '31 February 2030'); if ((await ctx.text('wlBig')) !== '—' || (await ctx.text('wlHint')).indexOf('like 25 December 2026') < 0) fails.push('31 February should be rejected');
  return { runs, fails: fails.slice(0, 25), invalid };
};
