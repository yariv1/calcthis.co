/* Independent re-implementation of the max heart rate formulas (does NOT use CalcThis.mhEngine). Drives the real inputs and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 777; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const FM = { tanaka: (a) => 208 - 0.7 * a, fox: (a) => 220 - a, nes: (a) => 211 - 0.64 * a, gulati: (a) => 206 - 0.88 * a, inbar: (a) => 205.8 - 0.685 * a, oakland: (a) => 192 - 0.007 * a * a };
  const fails = []; let runs = 0;
  const rowsOf = async () => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#mhRows .bf-cmp")].map(e=>[e.getAttribute("data-f"),e.querySelector(".k").textContent.replace(/\\s+/g," ").trim(),e.querySelector(".v").textContent.replace(/\\s+/g," ").trim()]))'));
  for (let i = 0; i < 300; i++) {
    const age = 15 + Math.round(R() * 85), f = pick(Object.keys(FM)), sex = pick(['f', 'm']), beta = pick(['n', 'y']), mraw = pick(['', '', '', String(120 + Math.round(R() * 90)), 'abc', '99', '231']);
    await ctx.fill();
    await ctx.seg('mhSex', sex); await ctx.seg('mhBeta', beta); await ctx.set('mhF', f);
    const open = await ctx.eval('document.getElementById("mhAdvIn").style.display');
    if (mraw !== '' && open === 'none') await ctx.click('mhAdvBtn'); if (mraw === '' && open !== 'none') await ctx.click('mhAdvBtn');
    await ctx.set('mhAge', String(age)); await ctx.set('mhM', mraw);
    runs++; const tag = JSON.stringify({ age, f, sex, beta, mraw });
    const H = Math.round(FM[f](age)), big = await ctx.text('mhBig');
    if (big !== H + ' bpm') fails.push('headline ' + big + ' expected ' + H + ' ' + tag);
    const rows = await rowsOf();
    Object.keys(FM).forEach((k) => { const r = rows.filter((x) => x[0] === k)[0]; if (!r || r[2] !== Math.round(FM[k](age)) + ' bpm') fails.push(k + ' row ' + (r && r[2]) + ' expected ' + Math.round(FM[k](age)) + ' ' + tag); });
    const vals = Object.keys(FM).map((k) => Math.round(FM[k](age))), lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), sub = await ctx.text('mhSub');
    if (sub.indexOf('formulas range ' + lo + '–' + hi + ' bpm') < 0) fails.push('range in sub-line ' + sub + ' ' + tag);
    const mv = parseFloat(mraw), validM = mraw !== '' && !isNaN(mv) && mv >= 100 && mv <= 230;
    const basis = validM ? Math.round(mv) : H;
    const trs = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#mhPct tbody tr")].map(r=>[r.children[0].textContent,r.children[1].textContent]))'));
    [50, 60, 70, 80, 85, 90, 95, 100].forEach((pc, k) => { if (!trs[k] || trs[k][0] !== pc + '%' || trs[k][1] !== Math.round(basis * pc / 100) + ' bpm') fails.push('percent row ' + pc + ' ' + JSON.stringify(trs[k]) + ' expected ' + Math.round(basis * pc / 100) + ' ' + tag); });
    const meas = rows.filter((x) => x[1].indexOf('Your measured max') === 0)[0];
    if (validM) { const d = Math.round(mv) - H; if (!meas || meas[2] !== Math.round(mv) + ' bpm' || (d === 0 ? meas[1].indexOf('the same as') < 0 : meas[1].indexOf(Math.abs(d) + ' bpm ' + (d > 0 ? 'above' : 'below')) < 0)) fails.push('measured row ' + JSON.stringify(meas) + ' ' + tag); }
    else if (meas) fails.push('measured row shown for an invalid value ' + tag);
    const flags = await ctx.text('mhFlags');
    if ((beta === 'y') !== (flags.indexOf('Beta blockers lower') >= 0)) fails.push('beta-blocker flag ' + flags + ' ' + tag);
    if ((sex === 'm' && f === 'gulati') !== (flags.indexOf('derived from women') >= 0)) fails.push('gulati flag ' + flags + ' ' + tag);
  }
  /* explicit edges */
  await ctx.fill(); await ctx.set('mhAge', '14'); if ((await ctx.text('mhBig')) !== '—' || !(await ctx.text('mhHint'))) fails.push('age 14 should explain');
  await ctx.set('mhAge', '101'); if ((await ctx.text('mhBig')) !== '—' || !(await ctx.text('mhHint'))) fails.push('age 101 should explain');
  return { runs, fails: fails.slice(0, 25) };
};
