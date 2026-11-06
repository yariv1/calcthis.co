/* Independent re-implementation of the bulking calculator's maths (does NOT use CalcThis.bulkEngine). Drives the real inputs and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 12345; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fails = []; let runs = 0;
  for (let i = 0; i < 260; i++) {
    const sex = pick(['f', 'm']), hu = pick(['cm', 'in', 'm']), wu = pick(['kg', 'lb', 'st']), kind = pick(['pace', 'pct', 'kcal']), main = pick(['est', 'known', 'est']), f = pick([1.2, 1.375, 1.55, 1.725, 1.9]);
    const age = 15 + Math.round(R() * 70), cm = Math.round((140 + R() * 80) * 10) / 10, kg = Math.round((40 + R() * 100) * 10) / 10, bf = pick([null, null, 12, 20, 30]);
    const hv = hu === 'in' ? String(Math.round(cm / 2.54 * 100) / 100) : (hu === 'm' ? String(Math.round(cm) / 100) : String(cm));
    const hcm = hu === 'in' ? parseFloat(hv) * 2.54 : (hu === 'm' ? parseFloat(hv) * 100 : cm);
    const wv = wu === 'lb' ? String(Math.round(kg * 2.20462 * 10) / 10) : (wu === 'st' ? String(Math.round(kg / 6.35029 * 100) / 100) : String(kg));
    const wkg = wu === 'lb' ? parseFloat(wv) / 2.20462 : (wu === 'st' ? parseFloat(wv) * 6.35029 : parseFloat(wv));
    const sval = kind === 'pace' ? pick(['', '0.25', '0.4', '0.5', '0.8', '1.5']) : (kind === 'pct' ? pick(['', '10', '15', '20', '35']) : pick(['', '250', '400', '800']));
    await ctx.fill();
    await ctx.seg('bkSex', sex); await ctx.seg('bkWU', wu); await ctx.seg('bkHU', hu); await ctx.seg('bkKind', kind); await ctx.seg('bkMain', main);
    await ctx.eval('document.getElementById("bkAct").value="' + f + '"');
    const adv = bf !== null; const open = await ctx.eval('document.getElementById("bkAdvIn").style.display');
    if (adv && open === 'none') await ctx.click('bkAdvBtn'); if (!adv && open !== 'none') await ctx.click('bkAdvBtn');
    await ctx.set('bkAge', String(age)); await ctx.set('bkH', hv); await ctx.set('bkW', wv); await ctx.set('bkS', sval);
    if (adv) await ctx.set('bkBf', String(bf));
    let mt = null; if (main === 'known') { mt = 1500 + Math.round(R() * 2500); await ctx.set('bkMaint', String(mt)); }
    let out0, slope;
    if (main === 'known') { out0 = mt; slope = 14; } else if (adv) { out0 = (370 + 21.6 * wkg * (1 - bf / 100)) * f; slope = 21.6 * (1 - bf / 100) * f; } else { out0 = (10 * wkg + 6.25 * hcm - 5 * age + (sex === 'm' ? 5 : -161)) * f; slope = 10 * f; }
    const dv = sval === '' ? { pace: 0.25, pct: 10, kcal: 250 }[kind] : parseFloat(sval);
    const S = kind === 'pace' ? dv / 100 * wkg * 7700 / 7 : (kind === 'pct' ? out0 * dv / 100 : dv);
    const big = await ctx.text('bkBig'), sub = await ctx.text('bkSub'), lad = await ctx.eval('document.querySelector("#bkLadder tbody tr").textContent'), mac = await ctx.text('bkMac');
    const tag = JSON.stringify({ sex, hu, wu, kind, main, hv, wv, sval, f, age, bf, mt }); runs++;
    if (big !== grp(out0 + S) + ' kcal') fails.push('headline ' + big + ' expected ' + grp(out0 + S) + ' ' + tag);
    if (sub.indexOf('Maintenance ' + grp(out0)) < 0 || sub.indexOf('+' + grp(S) + ' kcal') < 0) fails.push('sub-line ' + sub + ' ' + tag);
    if (lad.indexOf(grp(out0 + S) + ' kcal') < 0) fails.push('ladder week 0 ' + lad + ' ' + tag);
    const P = 1.8 * wkg, Fa = 1.0 * wkg, C = ((out0 + S) - 4 * P - 9 * Fa) / 4;
    if (mac.indexOf(grp(P) + ' g') < 0) fails.push('protein grams ' + tag);
    if (C > 0 && mac.indexOf(grp(C) + ' g') < 0) fails.push('carb grams ' + grp(C) + ' ' + tag);
    /* goal weight: time to goal, both models */
    if (i % 3 === 0 && main !== 'known' || i % 3 === 0) {
      const g = Math.round(wkg + 2 + R() * 20), gv = wu === 'lb' ? String(Math.round(g * 2.20462)) : (wu === 'st' ? String(Math.round(g / 6.35029 * 100) / 100) : String(g));
      const gkg = wu === 'lb' ? parseFloat(gv) / 2.20462 : (wu === 'st' ? parseFloat(gv) * 6.35029 : parseFloat(gv));
      await ctx.set('bkG', gv);
      if (gkg > wkg) {
        const rows = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#bkGoalRows .bf-cmp .v")].map(e=>e.firstChild.textContent))'));
        const sd = (gkg - wkg) * 7700 / S, wi = wkg + S / slope, rd = gkg < wi ? -(7700 / slope) * Math.log((wi - gkg) / (wi - wkg)) : null;
        const dur = (d) => d > 3650 ? 'more than 10 years' : (d < 14 ? Math.max(1, Math.ceil(d)) + (Math.ceil(d) === 1 ? ' day' : ' days') : Math.round(d / 7) + ' weeks');
        if (rows[0] !== dur(sd)) fails.push('simple time ' + rows[0] + ' expected ' + dur(sd) + ' ' + tag);
        if (rd === null ? rows[1].indexOf('levels off at') !== 0 : rows[1] !== dur(rd)) fails.push('realistic time ' + rows[1] + ' expected ' + (rd === null ? 'levels off' : dur(rd)) + ' ' + tag);
      }
    }
  }
  return { runs, fails: fails.slice(0, 25) };
};
