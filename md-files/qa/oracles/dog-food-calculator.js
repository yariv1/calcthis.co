/* Independent re-implementation of the dog food maths (RER = 70 x kg^0.75, factors from APOP / Omnicalculator) - does NOT use CalcThis.dogFoodEngine. */
module.exports = async function (ctx) {
  let s = 4242; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const FR = { '⅛': 1 / 8, '¼': 2 / 8, '⅜': 3 / 8, '½': 4 / 8, '⅝': 5 / 8, '¾': 6 / 8, '⅞': 7 / 8 };
  const parseAmt = (t) => { const m = t.match(/^(\d+)?\s*([⅛¼⅜½⅝¾⅞])?/); return (m[1] ? parseInt(m[1], 10) : 0) + (m[2] ? FR[m[2]] : 0); };
  const fails = []; let runs = 0;
  for (let i = 0; i < 220; i++) {
    const wu = pick(['kg', 'lb']), kg = Math.round((1 + R() * 90) * 10) / 10, wv = wu === 'lb' ? String(Math.round(kg * 2.20462 * 10) / 10) : String(kg), wkg = wu === 'lb' ? parseFloat(wv) / 2.20462 : parseFloat(wv);
    const age = pick(['adult', 'adult', 'senior', 'puppy']), neu = pick(['y', 'n']), ft = pick(['dry', 'wet']), tr = pick(['0', '5', '10']), meals = pick(['1', '2', '3', '4']), pm = pick(['', '', '2', '5', '12']);
    await ctx.fill(); await ctx.seg('fdWU', wu); await ctx.seg('fdAgeSeg', age); if (age === 'adult') await ctx.seg('fdNeu', neu); await ctx.seg('fdFT', ft); await ctx.seg('fdTr', tr); await ctx.seg('fdMeals', meals);
    await ctx.set('fdW', wv); if (age === 'puppy') await ctx.set('fdAge', pm);
    const f = age === 'senior' ? 1.1 : (age === 'puppy' ? (pm !== '' && parseFloat(pm) < 4 ? 3.0 : 2.0) : (neu === 'y' ? 1.6 : 1.8));
    const mer = 70 * Math.pow(wkg, 0.75) * f, tag = JSON.stringify({ wu, wv, age, neu, ft, tr, meals, pm }); runs++;
    const big = await ctx.text('fdBig'); if (big !== grp(mer) + ' kcal') fails.push('headline ' + big + ' expected ' + grp(mer) + ' ' + tag);
    const food = mer * (1 - parseInt(tr, 10) / 100), per = ft === 'dry' ? 350 : 350;
    const row = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#fdFeed tbody tr")].map(r=>[...r.children].map(c=>c.firstChild?c.firstChild.textContent:"")))'));
    if (!row.length) { fails.push('no feeding row ' + tag); continue; }
    const eighth = (q) => Math.round(q * 8) / 8, day = parseAmt(row[0][1]), meal = parseAmt(row[0][2]);
    if (Math.abs(day - eighth(food / per)) > 0.01 && !(food / per < 0.0625)) fails.push('amount a day ' + row[0][1] + ' expected ' + eighth(food / per) + ' ' + tag);
    if (Math.abs(meal - eighth(food / per / parseInt(meals, 10))) > 0.01 && !(food / per / parseInt(meals, 10) < 0.0625)) fails.push('amount per meal ' + row[0][2] + ' expected ' + eighth(food / per / parseInt(meals, 10)) + ' ' + tag);
  }
  return { runs, fails: fails.slice(0, 25) };
};
