/* Independent re-implementation of the weight loss percentage calculator's maths (does NOT use CalcThis.wpEngine). Drives the real inputs and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 424242; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const LB = 2.20462, ST = 6.35029;
  const trim = (x, d) => String(parseFloat((Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)));
  const fmtP = (p) => (Math.abs(p) < 1 ? Math.round(p * 100) / 100 : Math.round(p * 10) / 10).toFixed(Math.abs(p) < 1 ? 2 : 1) + '%';
  const fmtW = (kg, u) => { if (u === 'kg') return trim(kg, 1) + ' kg'; if (u === 'lb') return trim(kg * LB, 1) + ' lb'; if (u === 'st') return trim(kg / ST, 2) + ' st'; const tl = kg * LB; let st = Math.floor(tl / 14 + 1e-9), l = Math.round((tl - st * 14) * 10) / 10; if (l >= 14) { st += 1; l = 0; } return st === 0 ? trim(l, 1) + ' lb' : st + ' st ' + trim(l, 1) + ' lb'; };
  const MONF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const text = (kg, u) => { if (u === 'kg') return String(Math.round(kg * 100) / 100); if (u === 'lb') return String(Math.round(kg * LB * 10) / 10); if (u === 'st') return String(Math.round(kg / ST * 100) / 100); const tl = Math.round(kg * LB * 10) / 10, st = Math.floor(tl / 14), l = Math.round((tl - st * 14) * 10) / 10; return st + ' st ' + l + ' lb'; };
  const back = (t, u) => { if (u === 'kg') return parseFloat(t); if (u === 'lb') return parseFloat(t) / LB; if (u === 'st') return parseFloat(t) * ST; const m = /^(\d+) st ([\d.]+) lb$/.exec(t); return (parseInt(m[1], 10) * 14 + parseFloat(m[2])) / LB; };
  const fails = []; let runs = 0, errs = 0;
  const rowsOf = async () => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#wpRows .bf-cmp")].map(e=>[e.querySelector(".k").textContent.replace(/\\s+/g," ").trim(),e.querySelector(".v").textContent.replace(/\\s+/g," ").trim()]))'));
  const find = (rows, start) => { const r = rows.filter((x) => x[0].indexOf(start) === 0)[0]; return r ? r[1] : null; };
  const KNOW = ['sc', 'sl', 'sp', 'cl', 'cp', 'lp'];
  for (let i = 0; i < 300; i++) {
    const u = pick(['kg', 'lb', 'st', 'stlb']), mode = pick(KNOW);
    const S0 = 45 + R() * 150, P0 = 1 + R() * 29, L0 = S0 * P0 / 100, C0 = S0 - L0;
    const pt = (p) => String(Math.round(p * 10) / 10);
    let ta, tb;
    if (mode === 'sc') { ta = text(S0, u); tb = text(C0, u); } else if (mode === 'sl') { ta = text(S0, u); tb = text(L0, u); } else if (mode === 'sp') { ta = text(S0, u); tb = pt(P0); }
    else if (mode === 'cl') { ta = text(C0, u); tb = text(L0, u); } else if (mode === 'cp') { ta = text(C0, u); tb = pt(P0); } else { ta = text(L0, u); tb = pt(P0); }
    const wv = (t, k) => k === 'p' ? parseFloat(t) : back(t, u);
    const kinds = { sc: ['w', 'w'], sl: ['w', 'w'], sp: ['w', 'p'], cl: ['w', 'w'], cp: ['w', 'p'], lp: ['w', 'p'] }[mode];
    const a = wv(ta, kinds[0]), b = wv(tb, kinds[1]);
    let S, C, L, P;
    if (mode === 'sc') { S = a; C = b; L = S - C; P = L / S * 100; } else if (mode === 'sl') { S = a; L = b; C = S - L; P = L / S * 100; } else if (mode === 'sp') { S = a; P = b; L = S * P / 100; C = S - L; }
    else if (mode === 'cl') { C = a; L = b; S = C + L; P = L / S * 100; } else if (mode === 'cp') { C = a; P = b; S = C / (1 - P / 100); L = S - C; } else { L = a; P = b; S = L / (P / 100); C = S - L; }
    await ctx.fill();
    await ctx.seg('wpUnit', u); await ctx.set('wpKnow', mode);
    const adv = R() < 0.25; const open = await ctx.eval('document.getElementById("wpAdvIn").style.display');
    if (adv && open === 'none') await ctx.click('wpAdvBtn'); if (!adv && open !== 'none') await ctx.click('wpAdvBtn');
    await ctx.set('wpA', ta); await ctx.set('wpB', tb);
    const tag = JSON.stringify({ u, mode, ta, tb }); runs++;
    if (S < 30 || S > 300 || C < 30 || C > 300 || L <= 0 || C > S) { errs++; const big = await ctx.text('wpBig'), hint = await ctx.text('wpHint'); if (big !== '—' || !hint) fails.push('expected an explained error ' + big + ' | ' + hint + ' ' + tag); continue; }
    const big = await ctx.text('wpBig'); if (big !== fmtP(P)) fails.push('headline ' + big + ' expected ' + fmtP(P) + ' ' + tag);
    const rows = await rowsOf();
    [['Starting weight', fmtW(S, u)], ['Current weight', fmtW(C, u)], ['Weight lost', fmtW(L, u)], ['Percent lost', fmtP(P)]].forEach((x) => { const v = find(rows, x[0]); if (v === null || v.indexOf(x[1]) !== 0) fails.push(x[0] + ' row ' + v + ' expected ' + x[1] + ' ' + tag); });
    const trs = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#wpTable tbody tr")].map(r=>[r.children[0].textContent,r.children[1].textContent,r.children[2].textContent]))'));
    if (trs.length !== 5) fails.push('table rows ' + trs.length + ' ' + tag);
    [3, 5, 10, 15, 20].forEach((pc, k) => { const l = S * pc / 100; if (!trs[k] || trs[k][0] !== pc + '%' || trs[k][1] !== fmtW(l, u) || trs[k][2] !== fmtW(S - l, u)) fails.push('table ' + pc + '% ' + JSON.stringify(trs[k]) + ' expected ' + fmtW(l, u) + ' / ' + fmtW(S - l, u) + ' ' + tag); });
    if (R() < 0.4) {
      const gk = C - (1 + R() * 0.7 * (C - 30)), gt = text(gk, u), G = back(gt, u);
      await ctx.set('wpG', gt);
      if (G >= 30 && G < S) {
        const rows2 = await rowsOf(), done = L / (S - G) * 100, want = done >= 100 ? 'goal reached' : (Math.round(done * 10) / 10).toFixed(1) + '%', v = find(rows2, 'Of the way to your goal');
        if (find(rows2, 'Goal weight') === null || find(rows2, 'Goal weight').indexOf(fmtW(G, u)) !== 0) fails.push('goal row ' + find(rows2, 'Goal weight') + ' ' + tag);
        if (v === null || v.indexOf(want) !== 0) fails.push('of the way ' + v + ' expected ' + want + ' ' + tag);
      }
    }
    if (adv) {
      const days = 7 + Math.round(R() * 200), d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - days);
      await ctx.set('wpD', d.getDate() + ' ' + MONF[d.getMonth()] + ' ' + d.getFullYear());
      const rows3 = await rowsOf(), v = find(rows3, 'Average loss a week'), pu = u === 'kg' ? 'kg' : 'lb', wk = L / (days / 7), wkd = pu === 'kg' ? wk : wk * LB;
      if (v === null || v.indexOf((Math.round(wkd * 100) / 100).toFixed(2) + ' ' + pu) !== 0) fails.push('average a week ' + v + ' expected ' + (Math.round(wkd * 100) / 100).toFixed(2) + ' ' + pu + ' ' + tag);
      if (v !== null && v.indexOf((Math.round(wk / S * 10000) / 100).toFixed(2) + '% of your starting weight a week') < 0) fails.push('percent a week ' + v + ' ' + tag);
    }
  }
  return { runs, fails: fails.slice(0, 25), errs };
};
