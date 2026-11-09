/* Independent re-implementation of the fiber maths (does NOT use CalcThis.fiberEngine): 14 g per 1,000 kcal, fixed 25/38 g, Mifflin-St Jeor x activity, and the food tally from
   USDA per-100 g values and typical serving weights. Drives the real inputs (including the inline unit toggles) and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 31337; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const FOOD = { apple: [2.4, 180], banana: [2.6, 120], raspberry: [6.5, 100], pear: [3.1, 180], orange: [2.4, 130], avocado: [6.7, 100], broccoli: [3.3, 90], carrot: [2.8, 60], lentils: [7.9, 100], beans: [8.7, 90], chickpeas: [7.6, 80], oats: [10.1, 40], bread: [6.0, 30] };
  const NAME = { apple: 'Apple, with skin', banana: 'Banana', raspberry: 'Raspberries', pear: 'Pear', orange: 'Orange', avocado: 'Avocado', broccoli: 'Broccoli, cooked', carrot: 'Carrot, raw', lentils: 'Lentils, cooked', beans: 'Black beans, cooked', chickpeas: 'Chickpeas, cooked', oats: 'Rolled oats, dry', bread: 'Whole-wheat bread', own: 'My own food' };
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tr = (x, d) => String(parseFloat((Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)));
  const num = (t) => { t = String(t).trim(); if (!t) return null; if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN; return parseFloat(t); };
  const inch = (t) => { t = String(t).trim(); if (!t) return null; const m = t.match(/^(\d+)\s*'\s*(\d+(?:\.\d+)?)?$/); if (m) return parseInt(m[1], 10) * 12 + (m[2] ? parseFloat(m[2]) : 0); return num(t); };
  const fails = []; let runs = 0;
  const tbl = async (id, part) => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#' + id + ' ' + part + ' tr")].map(r=>[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())))'));
  const foods = Object.keys(FOOD);
  const amt = (x) => { const n = num(x.n); if (n === null) return null; if (isNaN(n) || n <= 0) return NaN; const sv = (x.u === 'g' && x.f !== 'own') ? n / FOOD[x.f][1] : n; return (sv < 0.1 || sv > 50) ? NaN : sv; };
  for (let i = 0; i < 300; i++) {
    const sex = pick(['f', 'm']), ageRaw = pick(['35', '19', '100', '51', '67', '18', '101', 'abc', '0', '42.7']), mode = pick(['type', 'type', 'calc']);
    const kraw = pick(['', '2000', '1500', '2500', '800', '8000', '799', 'abc', '3200']), hu = pick(['in', 'cm']), wu = pick(['lb', 'kg', 'st']);
    const hraw = hu === 'in' ? pick(['', '70', '5\'10', '5\'', '64', '38', '99', 'abc']) : pick(['', '178', '165', '99', '251', 'abc']);
    const wraw = wu === 'lb' ? pick(['', '154', '200', '65', '661']) : (wu === 'kg' ? pick(['', '70', '95', '29', '301']) : pick(['', '11', '14.5', '4', '48']));
    const act = pick(['1.2', '1.375', '1.465', '1.55', '1.725', '1.9']), pk = pick(['', '', '14', '12.5', '20', '4', '31', 'x']);
    const nrows = pick([0, 0, 1, 2, 3]), spec = [];
    for (let k = 0; k < nrows; k++) { const f = pick(foods.concat(['own'])), u = f === 'own' ? 's' : pick(['s', 's', 'g']); spec.push({ f, u, n: pick(u === 's' ? ['1', '2', '0.5', '1.5', '3', 'abc', '60', '0'] : ['100', '150', '30', '250', 'abc', '20000', '5']), own: pick(['3', '5.5', '0.5', '', 'abc', '101']) }); }
    await ctx.fill();
    await ctx.seg('fbSex', sex); await ctx.set('fbAge', ageRaw);
    if (mode === 'calc') { await ctx.seg('fbCal', 'calc'); await ctx.seg('fbHu', hu); await ctx.seg('fbWu', wu); await ctx.set('fbH', hraw); await ctx.set('fbW', wraw); await ctx.set('fbAct', act); } else await ctx.set('fbK', kraw);
    await ctx.set('fbPK', pk);
    for (let k = 0; k < nrows; k++) {
      if (k > 0) await ctx.click('fbAdd'); const id = k + 1;
      await ctx.set('fbF' + id, spec[k].f); if (spec[k].f !== 'own') await ctx.seg('fbU' + id, spec[k].u);
      await ctx.set('fbN' + id, spec[k].n); if (spec[k].f === 'own') await ctx.set('fbM' + id, spec[k].own);
    }
    runs++; const tag = JSON.stringify({ sex, ageRaw, mode, kraw, hu, hraw, wu, wraw, act, pk, spec });
    const an = num(ageRaw), ageOk = an !== null && !isNaN(an) && an >= 19 && an <= 100, big = await ctx.text('fbBig');
    if (!ageOk) { if (big !== '—') fails.push('invalid age but headline ' + big + ' ' + tag); if (ageRaw !== '' && !(await ctx.text('fbHint'))) fails.push('no hint for age ' + ageRaw); continue; }
    const age = Math.floor(an); let kcal = null;
    if (mode === 'type') { const k = num(kraw); if (k !== null && !isNaN(k) && k >= 800 && k <= 8000) kcal = k; }
    else {
      const h = hu === 'in' ? inch(hraw) : num(hraw), cm = (h !== null && !isNaN(h) && h > 0) ? (hu === 'in' ? h * 2.54 : h) : null, hOk = cm !== null && cm >= 100 && cm <= 250;
      const w = num(wraw), kg = (w !== null && !isNaN(w) && w > 0) ? (wu === 'lb' ? w / 2.20462 : (wu === 'st' ? w * 6.35029 : w)) : null, wOk = kg !== null && kg >= 30 && kg <= 300;
      if (hOk && wOk) kcal = (10 * kg + 6.25 * cm - 5 * age + (sex === 'm' ? 5 : -161)) * parseFloat(act);
    }
    const pkn = num(pk), perK = (pkn !== null && !isNaN(pkn) && pkn >= 5 && pkn <= 30) ? pkn : 14, fixed = sex === 'f' ? 25 : 38;
    const calT = kcal !== null ? kcal / 1000 * perK : null, T = calT !== null ? calT : fixed;
    if (big !== Math.round(T) + ' g') { fails.push('headline ' + big + ' expected ' + Math.round(T) + ' g ' + tag); continue; }
    const sub = await ctx.text('fbSub'), esub = calT !== null ? tr(perK, 1) + ' g per 1,000 kcal × ' + grp(kcal) + ' kcal · the fixed adult standard is ' + fixed + ' g' : 'the fixed adult standard for ' + (sex === 'f' ? 'women' : 'men') + ' · add your calories for the calorie-based target';
    if (sub !== esub) fails.push('sub-line "' + sub + '" expected "' + esub + '" ' + tag);
    const items = [];
    spec.forEach((x) => {
      const sv = amt(x); if (sv === null || isNaN(sv)) return;
      let fib; if (x.f === 'own') { const m = num(x.own); if (m === null || isNaN(m) || m < 0.1 || m > 100) return; fib = sv * m; } else fib = sv * FOOD[x.f][1] * FOOD[x.f][0] / 100;
      items.push({ name: NAME[x.f], sv, fib });
    });
    const tgt = await tbl('fbTargets', 'tbody'), want = [];
    if (calT !== null) want.push([tr(perK, 1) + ' g per 1,000 kcal (your calories)', Math.round(calT) + ' g']);
    want.push(['Fixed adult standard, ' + (sex === 'f' ? 'women' : 'men'), fixed + ' g'], ['Average US adult', '17 g'], ['Intake linked to the biggest risk reduction', '25–29 g']);
    if (JSON.stringify(tgt) !== JSON.stringify(want)) fails.push('targets table ' + JSON.stringify(tgt) + ' expected ' + JSON.stringify(want) + ' ' + tag);
    const wrapVis = await ctx.eval('document.getElementById("fbTallyWrap").style.display !== "none"');
    if (wrapVis !== (items.length > 0)) fails.push('tally visibility ' + wrapVis + ' ' + tag);
    if (items.length) {
      let total = 0; items.forEach((x) => { total += x.fib; });
      const body = await tbl('fbTally', 'tbody'), foot = await tbl('fbTally', 'tfoot');
      items.forEach((x, k) => { if (!body[k] || body[k][0] !== x.name || body[k][1] !== tr(x.sv, 2) + ' serving' + (x.sv === 1 ? '' : 's') || body[k][2] !== tr(x.fib, 1) + ' g') fails.push('tally row ' + k + ' ' + JSON.stringify(body[k]) + ' expected ' + x.name + ' ' + tr(x.sv, 2) + ' ' + tr(x.fib, 1) + ' ' + tag); });
      if (body.length !== items.length) fails.push('tally rows ' + body.length + ' expected ' + items.length + ' ' + tag);
      if (!foot[0] || foot[0][1] !== tr(total, 1) + ' g' || !foot[1] || foot[1][0] !== (total >= T ? 'Over your target by' : 'Still to go') || foot[1][1] !== tr(Math.abs(T - total), 1) + ' g') fails.push('tally footer ' + JSON.stringify(foot) + ' expected total ' + tr(total, 1) + ' ' + tag);
      const tip = await ctx.text('fbTip'), etip = 'You have had ' + tr(total, 1) + ' g of fiber today, ' + Math.round(total / T * 100) + '% of your ' + Math.round(T) + ' g' + (total >= T ? ' — you have reached it.' : ' — ' + tr(T - total, 1) + ' g still to go.');
      if (tip !== etip) fails.push('tip "' + tip + '" expected "' + etip + '" ' + tag);
    }
    const hint = await ctx.text('fbHint'); let hw = false;
    if (mode === 'type' && kraw !== '' && kcal === null) hw = true;
    if (mode === 'calc') { const h = hu === 'in' ? inch(hraw) : num(hraw), cm = (h !== null && !isNaN(h) && h > 0) ? (hu === 'in' ? h * 2.54 : h) : null; if (hraw !== '' && !(cm !== null && cm >= 100 && cm <= 250)) hw = true; else { const w = num(wraw), kg = (w !== null && !isNaN(w) && w > 0) ? (wu === 'lb' ? w / 2.20462 : (wu === 'st' ? w * 6.35029 : w)) : null; if (wraw !== '' && !(kg !== null && kg >= 30 && kg <= 300)) hw = true; } }
    if (pk !== '' && !(pkn !== null && !isNaN(pkn) && pkn >= 5 && pkn <= 30)) hw = true; if (pkn !== null && !isNaN(pkn) && pkn >= 5 && pkn <= 30 && kcal === null) hw = true;
    spec.forEach((x) => { const sv = amt(x); if (sv === null) return; if (isNaN(sv)) hw = true; else if (x.f === 'own') { const m = num(x.own); if (m === null || isNaN(m) || m < 0.1 || m > 100) hw = true; } });
    if (hw !== !!hint) fails.push('hint ' + (hint ? '"' + hint + '"' : 'none') + ' but expected ' + (hw ? 'one' : 'none') + ' ' + tag);
  }
  /* explicit edges */
  await ctx.fill(); await ctx.set('fbAge', '18'); if ((await ctx.text('fbBig')) !== '—' || !(await ctx.text('fbHint'))) fails.push('age 18 should explain');
  await ctx.set('fbAge', '35'); if ((await ctx.text('fbBig')) !== '25 g') fails.push('female 35 without calories expected the fixed 25 g, got ' + (await ctx.text('fbBig')));
  await ctx.set('fbK', '2000'); if ((await ctx.text('fbBig')) !== '28 g') fails.push('2000 kcal expected 28 g, got ' + (await ctx.text('fbBig')));
  /* unit switch converts a valid amount and never turns junk into a plausible one */
  await ctx.fill(); await ctx.seg('fbCal', 'calc'); await ctx.seg('fbWu', 'lb'); await ctx.set('fbW', '154'); await ctx.seg('fbWu', 'kg');
  if ((await ctx.eval('document.getElementById("fbW").value')) !== '69.9') fails.push('154 lb to kg expected 69.9, got ' + (await ctx.eval('document.getElementById("fbW").value')));
  await ctx.set('fbW', 'abc'); await ctx.seg('fbWu', 'st'); if ((await ctx.eval('document.getElementById("fbW").value')) !== 'abc') fails.push('junk weight changed on unit switch');
  await ctx.fill(); await ctx.set('fbF1', 'oats'); await ctx.seg('fbU1', 's'); await ctx.set('fbN1', '2'); await ctx.seg('fbU1', 'g'); if ((await ctx.eval('document.getElementById("fbN1").value')) !== '80') fails.push('2 servings of oats to g expected 80');
  return { runs, fails: fails.slice(0, 25) };
};
