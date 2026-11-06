/* Independent re-implementation of the FFMI maths (Kouri 1995, constant 6.3) - does NOT use CalcThis.ffmiEngine. */
module.exports = async function (ctx) {
  let s = 777; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
  const bandM = [[18, 'Below average'], [20, 'Average'], [22, 'Above average'], [23, 'Excellent'], [26, 'Superior'], [28, 'Rare in drug-free samples'], [1e9, 'Very rare in drug-free samples']];
  const bandF = [[15, 'Below average'], [17, 'Average'], [18, 'Above average'], [19, 'Excellent'], [21.5, 'Superior'], [25, 'Rare in drug-free samples'], [1e9, 'Very rare in drug-free samples']];
  const band = (sex, v) => (sex === 'm' ? bandM : bandF).filter((b) => v < b[0])[0][1];
  const fails = []; let runs = 0;
  for (let i = 0; i < 260; i++) {
    const sex = pick(['f', 'm']), hu = pick(['cm', 'in', 'm']), wu = pick(['kg', 'lb', 'st']);
    const cm = Math.round((125 + R() * 120) * 10) / 10, kg = Math.round((35 + R() * 200) * 10) / 10, bf = Math.round((2 + R() * 58) * 10) / 10;
    const hv = hu === 'in' ? String(Math.round(cm / 2.54 * 100) / 100) : (hu === 'm' ? String(Math.round(cm) / 100) : String(cm));
    const hcm = hu === 'in' ? parseFloat(hv) * 2.54 : (hu === 'm' ? parseFloat(hv) * 100 : cm);
    const wv = wu === 'lb' ? String(Math.round(kg * 2.20462 * 10) / 10) : (wu === 'st' ? String(Math.round(kg / 6.35029 * 100) / 100) : String(kg));
    const wkg = wu === 'lb' ? parseFloat(wv) / 2.20462 : (wu === 'st' ? parseFloat(wv) * 6.35029 : parseFloat(wv));
    if (hcm < 120 || hcm > 250 || wkg < 30 || wkg > 300) continue;
    await ctx.fill(); await ctx.seg('ffSex', sex); await ctx.seg('ffHU', hu); await ctx.seg('ffWU', wu);
    await ctx.set('ffH', hv); await ctx.set('ffW', wv); await ctx.set('ffBf', String(bf)); runs++;
    const h = hcm / 100, ffm = wkg * (1 - bf / 100), ffmi = ffm / (h * h), norm = ffmi + 6.3 * (1.8 - h), tag = JSON.stringify({ sex, hu, wu, hv, wv, bf });
    const big = await ctx.text('ffBig'), sub = await ctx.text('ffSub'), nums = await ctx.text('ffNums');
    if (big !== f1(norm)) fails.push('normalized ' + big + ' expected ' + f1(norm) + ' ' + tag);
    if (sub.indexOf('FFMI ' + f1(ffmi)) !== 0 || sub.indexOf(band(sex, norm)) < 0) fails.push('sub-line ' + sub + ' expected FFMI ' + f1(ffmi) + ' / ' + band(sex, norm) + ' ' + tag);
    const mm = nums.match(/Fat-free mass([\d.]+) kg · ([\d.]+) lb/);
    if (!mm || Math.abs(parseFloat(mm[1]) - ffm) > 0.051 || Math.abs(parseFloat(mm[2]) - ffm * 2.20462) > 0.051) fails.push('fat-free mass ' + (mm ? mm[1] + '/' + mm[2] : nums.slice(0, 40)) + ' expected ' + f1(ffm) + ' ' + tag);
    const hiOk = bf + 3 <= 60;
    if (hiOk) { const n2 = wkg * (1 - (bf + 3) / 100) / (h * h) + 6.3 * (1.8 - h); const row = await ctx.eval('document.querySelector("#ffErr tbody tr").textContent'); if (row.indexOf(f1(n2)) < 0) fails.push('+3 point row ' + row + ' expected ' + f1(n2) + ' ' + tag); }
    if (i % 4 === 0) { /* target FFMI: needed fat-free mass round-trips */
      const open = await ctx.eval('document.getElementById("ffAdvIn").style.display'); if (open === 'none') await ctx.click('ffAdvBtn');
      const t = Math.round((12 + R() * 20) * 10) / 10; await ctx.set('ffT', String(t));
      const m = (await ctx.text('ffAdv')).match(/Fat-free mass needed([\d.]+) kg/);
      if (!m) fails.push('no target row for ' + t + ' ' + tag); else { const need = parseFloat(m[1]), back = need / (h * h) + 6.3 * (1.8 - h); if (Math.abs(back - t) > 0.05 / (h * h) + 0.01) fails.push('target ' + t + ' round trip ' + back + ' ' + tag); }
      await ctx.set('ffT', '');
    }
  }
  return { runs, fails: fails.slice(0, 25) };
};
