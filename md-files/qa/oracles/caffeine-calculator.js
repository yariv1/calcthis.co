/* Independent re-implementation of the caffeine tally and limits (does NOT use CalcThis.cafEngine). The per-serving mg values are re-derived here
   from the USDA per-100 g figures and serving weights, not copied from the page. Drives the real inputs (amount typed in servings or in ml/g) and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 4242; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const ML = 29.5735, SERV = { coffee: [40, 8 * ML], espresso: [212, 1 * ML], instant: [26, 8 * ML], decaf: [1, 8 * ML], tea: [20, 8 * ML], green: [12, 8 * ML], cola: [9, 12 * ML], energy: [32, 16 * ML], choc: [80, 28.3495] };
  const mgOf = (d) => Math.round(SERV[d][0] * SERV[d][1] / 100);
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const t1 = (x) => String(parseFloat((Math.round(x * 10) / 10).toFixed(1))), t2 = (x) => String(parseFloat((Math.round(x * 100) / 100).toFixed(2)));
  const fails = []; let runs = 0;
  const num = (t) => { t = String(t).trim(); if (!t) return null; if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN; return parseFloat(t); };
  const tbl = async (id, part) => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#' + id + ' ' + part + ' tr")].map(r=>[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())))'));
  const drinks = Object.keys(SERV);
  /* servings from what was typed: null = empty, NaN = bad, else a number of servings */
  const servings = (x) => { const n = num(x.n); if (n === null) return null; if (isNaN(n) || n <= 0) return NaN; const sv = (x.u === 'm' && x.d !== 'own') ? n / SERV[x.d][1] : n; return (sv < 0.1 || sv > 50) ? NaN : sv; };
  for (let i = 0; i < 300; i++) {
    const who = pick(['a', 'a', 't', 'p']), wu = pick(['lb', 'kg']), wraw = pick(['', '', '150', '70.5', '99', '55', 'abc', '2', '700', '35']), lraw = pick(['', '', '', '300', '50', '0', 'x', '4000']);
    const nrows = pick([1, 1, 2, 3]), spec = [];
    for (let k = 0; k < nrows; k++) {
      const d = pick(drinks.concat(['own'])), u = d === 'own' ? 's' : pick(['s', 's', 'm']);
      spec.push({ d, u, n: pick(u === 's' ? ['1', '2', '0.5', '3', '1.5', '4', '10', 'abc', '0', '60'] : ['250', '500', '100', '355', '0', 'abc', '20000', '5', '30']), own: pick(['80', '150', '12.5', '', 'abc', '3000']) });
    }
    spec[0].n = pick(spec[0].u === 's' ? ['1', '2', '0.5', '3', '1.5', '4', '10', '1', '2'] : ['250', '500', '355', '100', '240']);
    if (spec[0].d === 'own') spec[0].own = pick(['80', '150', '12.5']);
    await ctx.fill();
    await ctx.set('cfWho', who); await ctx.seg('cfWu', wu); await ctx.set('cfW', wraw); await ctx.set('cfLim', lraw);
    for (let k = 0; k < nrows; k++) {
      if (k > 0) await ctx.click('cfAdd'); const id = k + 1;
      await ctx.set('cfD' + id, spec[k].d); if (spec[k].d !== 'own') await ctx.seg('cfU' + id, spec[k].u);
      await ctx.set('cfN' + id, spec[k].n); if (spec[k].d === 'own') await ctx.set('cfM' + id, spec[k].own);
    }
    runs++; const tag = JSON.stringify({ who, wu, wraw, lraw, spec });
    const items = [];
    spec.forEach((x) => {
      const sv = servings(x); if (sv === null || isNaN(sv)) return;
      let mg; if (x.d === 'own') { const m = num(x.own); if (m === null || isNaN(m) || m < 1 || m > 2000) return; mg = m; } else mg = mgOf(x.d);
      items.push({ n: sv, mg });
    });
    const big = await ctx.text('cfBig');
    if (!items.length) { if (big !== '—') fails.push('no valid row but headline ' + big + ' ' + tag); continue; }
    let total = 0; items.forEach((x) => { total += x.n * x.mg; });
    if (big !== grp(total) + ' mg') { fails.push('headline ' + big + ' expected ' + grp(total) + ' mg ' + tag); continue; }
    const wn = num(wraw), kg = (wn !== null && !isNaN(wn) && wn > 0) ? (wu === 'lb' ? wn / 2.20462 : wn) : null, kgOk = kg !== null && kg >= 5 && kg <= 300;
    const ln = num(lraw), lOk = ln !== null && !isNaN(ln) && ln >= 1 && ln <= 3000 && ln > 0;
    let L = null, lab = '';
    if (lOk) { L = ln; lab = 'your ' + grp(L) + ' mg limit'; } else if (who === 'a') { L = 400; lab = 'the 400 mg daily limit'; } else if (who === 't' && kgOk) { L = 2.5 * kg; lab = 'the ' + grp(L) + ' mg limit for your weight'; }
    const cups = total / 95, sub = await ctx.text('cfSub');
    let exp = '= ' + t1(cups) + (Math.abs(cups - 1) < 0.05 ? ' cup' : ' cups') + ' of brewed coffee';
    if (L) exp += ' · ' + Math.round(total / L * 100) + '% of ' + lab; else if (who === 'p') exp += ' · ask your health care provider about a limit'; else exp += ' · add body weight to see the limit';
    if (sub !== exp) fails.push('sub-line "' + sub + '" expected "' + exp + '" ' + tag);
    const body = await tbl('cfTable', 'tbody'), foot = await tbl('cfTable', 'tfoot');
    if (body.length !== items.length) fails.push('table rows ' + body.length + ' expected ' + items.length + ' ' + tag);
    else items.forEach((x, k) => { if (body[k][1] !== t2(x.n) + ' × ' + t1(x.mg) + ' mg' || body[k][2] !== grp(x.n * x.mg) + ' mg') fails.push('table row ' + k + ' ' + JSON.stringify(body[k]) + ' ' + tag); });
    if (!foot[0] || foot[0][1] !== grp(total) + ' mg') fails.push('table total ' + JSON.stringify(foot) + ' ' + tag);
    const lim = await tbl('cfLimits', 'tbody'), on = await ctx.eval('JSON.stringify([...document.querySelectorAll("#cfLimits tr.on td:first-child")].map(e=>e.textContent))');
    if (JSON.parse(on)[0] !== { a: 'Healthy adult', t: 'Teen or child', p: 'Pregnant or breastfeeding' }[who]) fails.push('highlighted limits row ' + on + ' ' + tag);
    if (who === 't' && kgOk && lim[1][1].indexOf(grp(2.5 * kg) + ' mg (HC)') < 0) fails.push('teen limits row ' + lim[1][1] + ' ' + tag);
    const kgTxt = await ctx.text('cfKg'), kgVis = await ctx.eval('document.getElementById("cfKg").style.display !== "none"');
    if (kgOk !== kgVis || (kgOk && kgTxt.indexOf('That is ' + t1(total / kg) + ' mg per kg') !== 0)) fails.push('per-kg line "' + kgTxt + '" ' + tag);
    const hint = await ctx.text('cfHint'), want = [];
    spec.forEach((x) => { const sv = servings(x); if (sv !== null && isNaN(sv)) want.push('how much'); });
    if (wraw !== '' && !kgOk) want.push('Weight should be between'); if (lraw !== '' && !lOk) want.push('Your own limit');
    if (want.length === 0 && hint && hint.indexOf('mg in one serving') < 0) fails.push('unexpected hint "' + hint + '" ' + tag);
    if (want.length && !hint) fails.push('missing hint for ' + want.join(',') + ' ' + tag);
  }
  /* explicit edges */
  await ctx.fill(); await ctx.set('cfN1', '0'); if ((await ctx.text('cfBig')) !== '—' || !(await ctx.text('cfHint'))) fails.push('0 servings should explain');
  await ctx.set('cfN1', '51'); if ((await ctx.text('cfBig')) !== '—') fails.push('51 servings should be refused');
  await ctx.set('cfN1', '4.2'); if ((await ctx.text('cfBig')) !== '399 mg') fails.push('4.2 cups of coffee expected 399 mg, got ' + (await ctx.text('cfBig')));
  /* unit switch converts a valid amount and never turns junk into a plausible one */
  await ctx.fill(); await ctx.set('cfN1', '2'); await ctx.seg('cfU1', 'm'); if ((await ctx.eval('document.getElementById("cfN1").value')) !== '473') fails.push('2 cups to ml expected 473, got ' + (await ctx.eval('document.getElementById("cfN1").value')));
  await ctx.seg('cfU1', 's'); if ((await ctx.eval('document.getElementById("cfN1").value')) !== '2') fails.push('473 ml back to cups expected 2');
  await ctx.set('cfN1', 'abc'); await ctx.seg('cfU1', 'm'); if ((await ctx.eval('document.getElementById("cfN1").value')) !== 'abc') fails.push('junk changed on unit switch');
  return { runs, fails: fails.slice(0, 25) };
};
