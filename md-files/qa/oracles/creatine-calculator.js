/* Independent re-implementation of the creatine maths (does NOT use CalcThis.creatineEngine): loading 0.3 g/kg/day, maintenance 0.03 g/kg clamped 3-5 and rounded to 0.5,
   28-day totals, tub days / scoops / cost, plan-by-date start dates. Drives the real inputs and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 4242; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const tr = (x, d) => String(parseFloat((Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)));
  const g1 = (x) => tr(x, 1) + ' g', f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  const num = (t) => { t = String(t).trim(); if (!t) return null; if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN; return parseFloat(t); };
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const midnight = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const plus = (d, n) => { const r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return r; };
  const dt = (d) => d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
  const diffDays = (a, b) => Math.round((a.getTime() - b.getTime()) / 864e5);
  const fails = []; let runs = 0;
  const tbl = async (id) => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#' + id + ' tr")].map(r=>[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())))'));
  const vis = async (id) => ctx.eval('document.getElementById("' + id + '").style.display !== "none"');
  const dates = [['', null], ['25 December 2026', new Date(2026, 11, 25)], ['2027-02-01', new Date(2027, 1, 1)], ['1 January 2027', new Date(2027, 0, 1)], ['10 November 2026', new Date(2026, 10, 10)], ['5 Nov 2026', new Date(2026, 10, 5)], ['abc', 'bad'], ['31 February 2027', 'bad']];
  for (let i = 0; i < 300; i++) {
    const wu = pick(['lb', 'kg']), wraw = wu === 'lb' ? pick(['176', '154', '200', '66', '660', '65', '661', '100.5', 'abc', '0', '', '300']) : pick(['80', '70', '30', '300', '29', '301', '55.5', 'abc', '', '110']);
    const plan = pick(['load', 'load', 'skip', 'taking']), ld = pick(['5', '6', '7']), ds = pick(['3', '4', '5']);
    const mraw = pick(['', '', '3.5', '5', '8', '1', '11', 'abc', '2', '10']), dpick = pick(dates);
    const traw = pick(['', '', '500', '1000', '19', '10001', 'abc', '20', '250']), praw = pick(['', '25', '19.99', '0', '100001', 'abc']), sraw = pick(['', '5', '3.5', '0.4', '51', 'abc']);
    await ctx.fill();
    await ctx.seg('crWu', wu); await ctx.seg('crPlan', plan); await ctx.seg('crLd', ld); await ctx.seg('crDs', ds);
    await ctx.set('crM', mraw); await ctx.set('crDate', dpick[0]); await ctx.set('crTub', traw); await ctx.set('crPr', praw); await ctx.set('crSc', sraw);
    await ctx.set('crW', wraw);
    runs++; const tag = JSON.stringify({ wu, wraw, plan, ld, ds, mraw, d: dpick[0], traw, praw, sraw });
    const wn = num(wraw), kg = (wn !== null && !isNaN(wn) && wn > 0) ? (wu === 'lb' ? wn / 2.20462 : wn) : null, wOk = kg !== null && kg >= 30 && kg <= 300, big = await ctx.text('crBig');
    if (!wOk) { if (big !== '—') fails.push('invalid weight but headline ' + big + ' ' + tag); if (wraw !== '' && !(await ctx.text('crHint'))) fails.push('no hint for weight ' + wraw); continue; }
    const L = +ld, N = +ds, daily = Math.round(0.3 * kg), per = daily / N;
    let maint = Math.round(Math.min(5, Math.max(3, 0.03 * kg)) * 2) / 2;
    const mn = num(mraw); if (mn !== null && !isNaN(mn) && mn >= 2 && mn <= 10) maint = mn;
    const ebig = plan === 'load' ? g1(daily) : g1(maint);
    if (big !== ebig) { fails.push('headline ' + big + ' expected ' + ebig + ' ' + tag); continue; }
    const d1 = await ctx.text('crD1'), d2 = await ctx.text('crD2');
    if (d1 !== g1(daily) + ' a day for ' + L + ' days, then ' + g1(maint) + ' a day. Your stores fill in about a week.') fails.push('option 1 text "' + d1 + '" ' + tag);
    if (d2 !== g1(maint) + ' a day from day 1. It gets there more slowly, in about 28 days.') fails.push('option 2 text "' + d2 + '" ' + tag);
    const sub = await ctx.text('crSub'), esub = plan === 'load' ? 'a day for ' + L + ' days (' + N + ' × ' + g1(per) + '), then ' + g1(maint) + ' a day' : (plan === 'skip' ? 'a day from day 1 · stores are full in about 28 days' : 'a day, any time · your stores are already full');
    if (sub !== esub) fails.push('sub "' + sub + '" expected "' + esub + '" ' + tag);
    /* date */
    const tod = midnight(); let T = null, dateHint = false;
    if (plan !== 'taking' && dpick[0]) { if (dpick[1] === 'bad' || dpick[1].getTime() <= tod.getTime()) dateHint = true; else T = dpick[1]; }
    let feasible = false, startD = null;
    if (T) { const need = plan === 'load' ? L : 28, off = diffDays(T, tod) - need; if (off >= 0) { feasible = true; startD = plus(tod, off); } }
    /* schedule */
    const sched = await tbl('crSched'), head = ['When', 'Take'], rows = [];
    if (plan === 'load') { rows.push(['Days 1–' + L, N + ' × ' + g1(per) + ' = ' + g1(daily) + ' a day'], ['From day ' + (L + 1), g1(maint) + ' a day']); if (feasible) { head.push('Dates'); rows[0].push(dt(startD) + ' to ' + dt(plus(startD, L - 1))); rows[1].push('from ' + dt(plus(startD, L))); } }
    else { rows.push(['Every day', g1(maint) + ' a day']); if (feasible) { head.push('Dates'); rows[0].push('from ' + dt(startD)); } }
    const want = [head].concat(rows);
    if (JSON.stringify(sched) !== JSON.stringify(want)) fails.push('schedule ' + JSON.stringify(sched) + ' expected ' + JSON.stringify(want) + ' ' + tag);
    const flag = await ctx.text('crFlag'), flagVis = await vis('crFlag');
    if (T && !feasible) {
      const need = plan === 'load' ? L : 28, off = diffDays(T, tod) - need, e = 'To be full by ' + dt(T) + ' you would have had to start ' + (plan === 'load' ? 'loading' : 'the daily dose') + ' ' + (-off) + ' day' + (-off === 1 ? '' : 's') + ' ago. Starting today, your stores are full on ' + dt(plus(tod, need)) + '.';
      if (!flagVis || flag !== e) fails.push('flag "' + flag + '" expected "' + e + '" ' + tag);
    } else if (flagVis) fails.push('flag visible without reason ' + tag);
    /* compare + chart */
    const both = plan !== 'taking';
    if ((await vis('crCmpWrap')) !== both || (await vis('crChartWrap')) !== both) fails.push('compare/chart visibility ' + tag);
    if (both) {
      const cmp = await tbl('crCmp'), w2 = [['', 'With loading', 'Daily dose only'], ['Dose a day at the start', g1(daily), g1(maint)], ['Stores full after', L + ' days', '28 days'], ['Creatine in the first 28 days', g1(L * daily + (28 - L) * maint), g1(28 * maint)]];
      if (T) { const so = (n) => { const o = diffDays(T, tod) - n; return o >= 0 ? 'by ' + dt(plus(tod, o)) : 'too late — earliest ' + dt(plus(tod, n)); }; w2.push(['To be full by ' + dt(T) + ', start', so(L), so(28)]); }
      if (JSON.stringify(cmp) !== JSON.stringify(w2)) fails.push('compare ' + JSON.stringify(cmp) + ' expected ' + JSON.stringify(w2) + ' ' + tag);
      if (!(await ctx.eval('!!document.querySelector("#crChart svg path")'))) fails.push('no chart ' + tag);
    }
    /* tub */
    const tn = num(traw), tubOk = tn !== null && !isNaN(tn) && tn >= 20 && tn <= 10000, pn = num(praw), prOk = pn !== null && !isNaN(pn) && pn >= 0.01 && pn <= 100000, sn = num(sraw), scOk = sn !== null && !isNaN(sn) && sn >= 0.5 && sn <= 50;
    if ((await vis('crTubWrap')) !== tubOk) fails.push('tub visibility ' + tag);
    if (tubOk) {
      let days; if (plan === 'load') { const lt = L * daily; days = tn <= lt ? Math.floor(tn / daily) : L + Math.floor((tn - lt) / maint); } else days = Math.floor(tn / maint);
      const wt = [['Your tub (' + grp(tn) + ' g)', ''], ['This tub lasts', days + ' days' + (plan === 'load' ? ' (loading, then ' + g1(maint) + ' a day)' : ' at ' + g1(maint) + ' a day')]];
      if (scOk) { wt.push(['Scoops a day (' + tr(sn, 2) + ' g each)', tr(maint / sn, 2)]); if (plan === 'load') wt.push(['Scoops per loading dose', tr(per / sn, 2)]); }
      if (prOk) { const pg = pn / tn; wt.push(['Cost a day (maintenance)', f2(pg * maint)], ['Cost of 30 days (maintenance)', f2(pg * maint * 30)]); if (plan === 'load') wt.push(['Cost of the loading phase (' + L + ' days)', f2(pg * daily * L)]); }
      const tt = await tbl('crTubT');
      if (JSON.stringify(tt) !== JSON.stringify(wt)) fails.push('tub ' + JSON.stringify(tt) + ' expected ' + JSON.stringify(wt) + ' ' + tag);
    }
    /* hints for optional fields must keep the result */
    const hint = await ctx.text('crHint'); const wantHint = (mraw !== '' && (mn === null || isNaN(mn) || mn < 2 || mn > 10)) || dateHint || (traw !== '' && !tubOk) || (tubOk && praw !== '' && !prOk) || (tubOk && (praw === '' || prOk) && sraw !== '' && !scOk) || (traw === '' && (praw !== '' || sraw !== ''));
    if (wantHint && !hint) fails.push('missing hint ' + tag);
    if (!wantHint && hint) fails.push('unexpected hint "' + hint + '" ' + tag);
  }
  return { runs, fails };
};
