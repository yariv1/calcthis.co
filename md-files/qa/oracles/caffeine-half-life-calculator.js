/* Independent re-implementation of the caffeine half-life model (does NOT use CalcThis.cafEngine): amount left = dose x 0.5^(hours / half-life), summed over drinks.
   Per-serving mg re-derived from USDA per-100 g and serving weights. Drives the real inputs (typing the time digits, clicking AM/PM) and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 9191; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const ML = 29.5735, SERV = { coffee: [40, 8 * ML], espresso: [212, 1 * ML], instant: [26, 8 * ML], decaf: [1, 8 * ML], tea: [20, 8 * ML], green: [12, 8 * ML], cola: [9, 12 * ML], energy: [32, 16 * ML], choc: [80, 28.3495] };
  const mgOf = (d) => Math.round(SERV[d][0] * SERV[d][1] / 100);
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const t1 = (x) => String(parseFloat((Math.round(x * 10) / 10).toFixed(1)));
  const num = (t) => { t = String(t).trim(); if (!t) return null; if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN; return parseFloat(t); };
  const fails = []; let runs = 0;
  const clock = (min, c24) => { const m = ((Math.round(min) % 1440) + 1440) % 1440, h = Math.floor(m / 60), mi = m % 60, mm = (mi < 10 ? '0' : '') + mi; return c24 ? (h < 10 ? '0' : '') + h + ':' + mm : ((h % 12) || 12) + ':' + mm + ' ' + (h < 12 ? 'am' : 'pm'); };
  const dayWord = (min) => { const d = Math.floor(Math.round(min) / 1440); return d <= 0 ? '' : (d === 1 ? ' (next day)' : ' (' + d + ' days later)'); };
  const tbl = async (id) => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#' + id + ' tbody tr")].map(r=>[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())))'));
  const setAp = (fid, ap) => ctx.eval('document.querySelector("#' + fid + ' .ap-seg button[data-ap=\\"' + ap + '\\"]").click()');
  const servings = (x) => { const n = num(x.n); if (n === null) return null; if (isNaN(n) || n <= 0) return NaN; const sv = (x.u === 'm' && x.d !== 'own') ? n / SERV[x.d][1] : n; return (sv < 0.1 || sv > 50) ? NaN : sv; };
  const drinks = Object.keys(SERV), p2 = (n) => (n < 10 ? '0' : '') + n;
  const makeTime = (c24) => { const m = Math.floor(R() * 60); if (c24) { const h = Math.floor(R() * 24); return { typed: p2(h) + p2(m), min: h * 60 + m }; } const h12 = 1 + Math.floor(R() * 12), ap = pick(['am', 'pm']); return { typed: p2(h12) + p2(m), ap, min: (h12 % 12) * 60 + m + (ap === 'pm' ? 720 : 0) }; };
  for (let i = 0; i < 300; i++) {
    const c24 = R() < 0.3, hlk = pick(['typ', 'typ', 'smoke', 'own']), hlraw = pick(['6', '2.5', '12', '0', '30', 'abc', '']), hasBed = R() < 0.7, tarraw = pick(['', '', '25', '100', '0', 'x']);
    const nrows = pick([1, 1, 2, 3]), spec = [];
    for (let k = 0; k < nrows; k++) { const d = pick(drinks.concat(['own'])), u = d === 'own' ? 's' : pick(['s', 's', 'm']); spec.push({ d, u, n: pick(u === 's' ? ['1', '2', '0.5', '1.5', '3', 'abc', '60'] : ['250', '500', '100', '355', 'abc', '20000', '5']), own: pick(['80', '150', '12.5', '']), time: R() < 0.1 ? null : makeTime(c24) }); }
    spec[0].n = pick(spec[0].u === 's' ? ['1', '2', '0.5', '1.5', '3'] : ['250', '500', '355', '100']); if (spec[0].d === 'own') spec[0].own = pick(['80', '150', '12.5']); if (!spec[0].time) spec[0].time = makeTime(c24);
    const bed = hasBed ? (R() < 0.05 ? 'junk' : makeTime(c24)) : null;
    await ctx.fill();
    if (c24) await ctx.seg('chClk', '24');
    await ctx.set('chHLs', hlk); if (hlk === 'own') await ctx.set('chHLc', hlraw); await ctx.set('chTar', tarraw);
    for (let k = 0; k < nrows; k++) {
      if (k > 0) await ctx.click('chAdd'); const id = k + 1;
      await ctx.set('chD' + id, spec[k].d); if (spec[k].d !== 'own') await ctx.seg('chU' + id, spec[k].u); await ctx.set('chN' + id, spec[k].n); if (spec[k].d === 'own') await ctx.set('chM' + id, spec[k].own);
      if (spec[k].time) { await ctx.set('chTi' + id, spec[k].time.typed); if (!c24) await setAp('chT' + id, spec[k].time.ap); } else await ctx.set('chTi' + id, '');
    }
    if (bed === 'junk') await ctx.set('chBedIn', '99'); else if (bed) { await ctx.set('chBedIn', bed.typed); if (!c24) await setAp('chBed', bed.ap); } else await ctx.set('chBedIn', '');
    runs++; const tag = JSON.stringify({ c24, hlk, hlraw, spec, bed, tarraw });
    const doses = [];
    spec.forEach((x) => {
      const n = servings(x); if (n === null || isNaN(n)) return;
      let mg; if (x.d === 'own') { const m = num(x.own); if (m === null || isNaN(m) || m < 1 || m > 2000) return; mg = m; } else mg = mgOf(x.d);
      if (!x.time) return; doses.push({ t: x.time.min, mg: n * mg });
    });
    const big = await ctx.text('chBig');
    if (!doses.length) { if (big !== '—') fails.push('no valid drink but headline ' + big + ' ' + tag); continue; }
    let hl = hlk === 'smoke' ? 3.2 : 5; const hv = num(hlraw), hlOk = hv !== null && !isNaN(hv) && hv >= 1 && hv <= 24; if (hlk === 'own' && hlOk) hl = hv;
    const last = Math.max.apply(null, doses.map((d) => d.t)); let B = (bed && bed !== 'junk') ? bed.min : null, nextDay = false; if (B !== null && B < last) { B += 1440; nextDay = true; }
    const at = (m) => doses.reduce((a, d) => a + (m >= d.t ? d.mg * Math.pow(0.5, (m - d.t) / (hl * 60)) : 0), 0);
    let total = 0; doses.forEach((d) => { total += d.mg; });
    const ck = (m) => clock(m, c24) + dayWord(m), sub = await ctx.text('chSub'), hlt = t1(hl) + ' h';
    let ebig, esub;
    if (B !== null) { const left = at(B); ebig = grp(left) + ' mg'; esub = 'at ' + ck(B) + ' · ' + Math.round(left / total * 100) + '% of the ' + grp(total) + ' mg you had · half-life ' + hlt; }
    else { ebig = grp(at(last)) + ' mg'; esub = 'half of your last drink is gone by ' + ck(last + hl * 60) + ' · half-life ' + hlt + ' · add your bedtime for more'; }
    if (big !== ebig) fails.push('headline ' + big + ' expected ' + ebig + ' ' + tag);
    if (sub !== esub) fails.push('sub-line "' + sub + '" expected "' + esub + '" ' + tag);
    let lastMg = 0; doses.forEach((d) => { if (d.t === last) lastMg += d.mg; });
    const dec = await tbl('chDecay');
    [1, 2, 3, 4].forEach((k, j) => { if (!dec[j] || dec[j][1] !== grp(lastMg * Math.pow(0.5, k)) + ' mg' || dec[j][2] !== ck(last + hl * 60 * k)) fails.push('decay row ' + k + ' ' + JSON.stringify(dec[j]) + ' expected ' + grp(lastMg * Math.pow(0.5, k)) + ' mg ' + ck(last + hl * 60 * k) + ' ' + tag); });
    const byVis = await ctx.eval('document.getElementById("chByWrap").style.display !== "none"');
    if (byVis !== (B !== null)) fails.push('last-drink-by table visibility ' + byVis + ' ' + tag);
    if (B !== null) {
      const by = await tbl('chBy');
      [1, 2, 3].forEach((k, j) => { const tm = B - hl * 60 * k; if (!by[j] || by[j][1] !== ck(tm) || by[j][2] !== t1((B - tm) / 60) + ' h before bed') fails.push('by row ' + k + ' ' + JSON.stringify(by[j]) + ' expected ' + ck(tm) + ' ' + tag); });
      const tg = num(tarraw), tgOk = tg !== null && !isNaN(tg) && tg >= 1 && tg <= 3000;
      if (tgOk && tg < lastMg) { const tm = B - hl * 60 * Math.log(lastMg / tg) / Math.LN2; if (!by[3] || by[3][1] !== ck(tm)) fails.push('target row ' + JSON.stringify(by[3]) + ' expected ' + ck(tm) + ' ' + tag); }
      else if (tgOk && by.length !== 4) fails.push('target row missing ' + tag);
      else if (!tgOk && by.length !== 3) fails.push('unexpected target row ' + tag);
    }
    const hint = await ctx.text('chHint'); let want = false;
    spec.forEach((x) => { const n = servings(x); if (n === null) return; if (isNaN(n)) want = true; else if (x.d === 'own' && !(num(x.own) >= 1)) want = true; else if (!x.time) want = true; });
    if (hlk === 'own' && hlraw !== '' && !hlOk) want = true; if (bed === 'junk' || nextDay) want = true; if (tarraw !== '' && !(num(tarraw) >= 1 && num(tarraw) <= 3000)) want = true; { const t2 = num(tarraw); if (t2 !== null && !isNaN(t2) && t2 >= 1 && t2 <= 3000 && (bed === null || bed === 'junk')) want = true; }
    if (want !== !!hint) fails.push('hint ' + (hint ? '"' + hint + '"' : 'none') + ' but expected ' + (want ? 'one' : 'none') + ' ' + tag);
    const svgOk = await ctx.eval('!!document.querySelector("#chCurve svg path")'); if (!svgOk) fails.push('no curve drawn ' + tag);
  }
  /* explicit edges */
  await ctx.fill(); await ctx.set('chN1', '0'); if ((await ctx.text('chBig')) !== '—' || !(await ctx.text('chHint'))) fails.push('0 servings should explain');
  await ctx.fill(); await ctx.set('chTi1', ''); if ((await ctx.text('chBig')) !== '—' || !(await ctx.text('chHint'))) fails.push('missing time should explain');
  await ctx.fill(); await ctx.set('chBedIn', '1030'); await setAp('chBed', 'pm'); if ((await ctx.text('chBig')) !== '13 mg') fails.push('95 mg at 8 am, bed 10:30 pm, 5 h half-life expected 13 mg, got ' + (await ctx.text('chBig')));
  return { runs, fails: fails.slice(0, 25) };
};
