/* Independent re-implementation of the vitamin D maths (does NOT use CalcThis.vitdEngine): MedlinePlus (US) and NHS (UK) bands, IU = mcg x 40, per-day totals, shares, zone, serum x 2.5.
   Drives the real inputs (including the inline unit toggles and several supplement rows) and compares the DISPLAYED numbers. */
module.exports = async function (ctx) {
  let s = 8675309; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const tr = (x, d) => String(parseFloat((Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)));
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const nt = (n, d) => { const p = tr(n, d == null ? 3 : d).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); };
  const num = (t) => { t = String(t).trim(); if (!t) return null; if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, ''); if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN; return parseFloat(t); };
  const US = [
    ['0–6 months', true, [400, 400], [10, 10], 1000, 25], ['7–12 months', true, [400, 400], [10, 10], 1500, 38], ['1–3 years', false, [600, 600], [15, 15], 2500, 63],
    ['4–8 years', false, [600, 600], [15, 15], 3000, 75], ['9–70 years', false, [600, 600], [15, 15], 4000, 100], ['over 70 years', false, [800, 800], [20, 20], 4000, 100]];
  const UK = [['under 1 year', false, [340, 400], [8.5, 10], 1000, 25], ['1–10 years', false, [400, 400], [10, 10], 2000, 50], ['11 years and over', false, [400, 400], [10, 10], 4000, 100]];
  const EU = [['0–6 months', false, null, null, 1000, 25], ['7–11 months', false, [400, 400], [10, 10], 1400, 35], ['1–10 years', false, [600, 600], [15, 15], 2000, 50], ['11–17 years', false, [600, 600], [15, 15], 4000, 100], ['18 years and over', false, [600, 600], [15, 15], 4000, 100]];
  const rg = (r) => r[0] === r[1] ? grp(r[0]) : grp(r[0]) + '–' + grp(r[1]);
  const rgm = (r) => r[0] === r[1] ? nt(r[0]) : nt(r[0]) + '–' + nt(r[1]);
  const fails = []; let runs = 0;
  const tbl = async (id) => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#' + id + ' tr")].map(r=>[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())))'));
  const vis = async (id) => ctx.eval('document.getElementById("' + id + '").style.display !== "none"');
  const AGES_Y = ['35', '0', '1', '3', '3.9', '4', '8', '9', '10', '11', '18', '70', '70.5', '71', '120', '121', 'abc', '-1', '0.5', '65'];
  const AGES_M = ['0', '3', '6', '6.5', '7', '11', '11.9', '12', '24', '47', '48', '100', '1440', '1441', 'abc'];
  for (let i = 0; i < 300; i++) {
    const std = pick(['us', 'uk', 'eu']), au = pick(['y', 'y', 'm']), ageRaw = au === 'y' ? pick(AGES_Y) : pick(AGES_M);
    const nrows = pick([0, 1, 1, 2, 3]), spec = [];
    for (let k = 0; k < nrows; k++) { const unit = pick(['iu', 'iu', 'mcg']), per = pick(['d', 'd', 'w']); spec.push({ unit, per, a: pick(unit === 'iu' ? ['1000', '5000', '600', '2.5', '50,000', '0', 'abc', '5000001', '400', '25000'] : ['25', '10', '125', '0.05', '0', 'abc', '125001', '1.5', '100']), c: pick(['', '', '1', '2', '3', '0.5', '0', '1001', 'abc', '7']) }); }
    const sraw = pick(['', '', '30', '75', '0', '501', 'abc', '20.5', '100']), su = pick(['ng', 'nmol']);
    await ctx.fill();
    await ctx.seg('vdStd', std); await ctx.seg('vdAu', au); await ctx.seg('vdSu', su);
    for (let k = 0; k < nrows; k++) { if (k > 0) await ctx.click('vdAdd'); const id = k + 1; await ctx.seg('vdU' + id, spec[k].unit); await ctx.seg('vdP' + id, spec[k].per); await ctx.set('vdA' + id, spec[k].a); await ctx.set('vdC' + id, spec[k].c); }
    await ctx.set('vdS', sraw); await ctx.set('vdAge', ageRaw);
    runs++; const tag = JSON.stringify({ std, au, ageRaw, spec, sraw, su });
    const an = num(ageRaw), ageOk = an !== null && !isNaN(an) && an >= 0 && an <= (au === 'y' ? 120 : 1440), big = await ctx.text('vdBig');
    if (!ageOk) { if (big !== '—') fails.push('invalid age but headline ' + big + ' ' + tag); if (ageRaw !== '' && !(await ctx.text('vdHint'))) fails.push('no hint for age ' + ageRaw); continue; }
    const m = au === 'y' ? an * 12 : an; let bi;
    if (std === 'us') { if (m < 7) bi = 0; else if (m < 12) bi = 1; else { const y = Math.floor(m / 12); bi = y <= 3 ? 2 : (y <= 8 ? 3 : (y <= 70 ? 4 : 5)); } } else if (std === 'uk') { if (m < 12) bi = 0; else { const y = Math.floor(m / 12); bi = y <= 10 ? 1 : 2; } } else { if (m < 7) bi = 0; else if (m < 12) bi = 1; else { const y = Math.floor(m / 12); bi = y <= 10 ? 2 : (y <= 17 ? 3 : 4); } }
    const b = (std === 'us' ? US : (std === 'uk' ? UK : EU))[bi], name = b[0], ai = b[1], rdaIU = b[2], rdaM = b[3], ulIU = b[4], ulM = b[5], hi = rdaIU ? rdaIU[1] : 0;
    const ebig = rdaIU ? rg(rdaIU) + ' IU' : 'Not set';
    if (big !== ebig) { fails.push('headline ' + big + ' expected ' + ebig + ' ' + tag); continue; }
    const lab = std === 'uk' ? 'NHS advice' : (std === 'eu' ? 'EFSA adequate intake' : (ai ? 'adequate intake' : 'RDA')), sub = await ctx.text('vdSub'), esub = rdaIU ? rgm(rdaM) + ' mcg a day · ' + lab + ', ' + name + ' (' + ({ us: 'US', uk: 'UK', eu: 'EU' }[std]) + ')' : 'EFSA sets no adequate intake for ' + name + ' (EU)';
    if (sub !== esub) fails.push('sub "' + sub + '" expected "' + esub + '" ' + tag);
    /* supplements */
    const items = []; let hint = false, total = 0;
    spec.forEach((x, k) => {
      const n = num(x.a); if (n === null) { if (num(x.c) !== null) hint = true; return; }
      const iu = (n !== null && !isNaN(n) && n > 0) ? (x.unit === 'mcg' ? n * 40 : n) : null;
      if (iu === null || iu < 0.1 || iu > 5000000) { hint = true; return; }
      const cn = num(x.c); let cnt = 1; if (cn !== null) { if (isNaN(cn) || cn < 0.01 || cn > 1000) hint = true; else cnt = cn; }
      const pd = iu * cnt / (x.per === 'w' ? 7 : 1); items.push({ k: k + 1, n, unit: x.unit, cnt, per: x.per, pd }); total += pd;
    });
    for (let k = 0; k < spec.length; k++) {
      const x = spec[k], n = num(x.a), cn = num(x.c), note = await ctx.eval('(function(){var e=document.querySelector(\'.cf-row[data-rid="' + (k + 1) + '"] .cf-note\');return e?e.textContent.replace(/\\s+/g," ").trim()+"|"+e.className:""})()'), parts = note.split('|');
      let want, warn = false;
      if (n === null) want = cn !== null ? 'Type the amount on the label first, then the number you take counts.' : 'Type the amount the label gives for one capsule, drop or tablet. 1 mcg = 40 IU.';
      else { const iu = (!isNaN(n) && n > 0) ? (x.unit === 'mcg' ? n * 40 : n) : null;
        if (iu === null || iu < 0.1 || iu > 5000000) want = '1 mcg = 40 IU.';
        else { const cnt = (cn !== null && !isNaN(cn) && cn >= 0.01 && cn <= 1000) ? cn : 1, pd = iu * cnt / (x.per === 'w' ? 7 : 1);
          want = nt(n) + ' ' + (x.unit === 'iu' ? 'IU' : 'mcg') + ' = ' + (x.unit === 'iu' ? nt(n / 40) + ' mcg' : nt(n * 40) + ' IU') + ' each · ' + nt(cnt) + ' a ' + (x.per === 'w' ? 'week' : 'day') + ' = ' + grp(pd) + ' IU (' + nt(pd / 40, 1) + ' mcg) a day · ' + Math.round(pd / ulIU * 100) + '% of the upper limit' + (pd > ulIU ? ' — above the limit' : ''); warn = pd > ulIU; } }
      if (parts[0] !== want) fails.push('row ' + (k + 1) + ' note "' + parts[0] + '" expected "' + want + '" ' + tag);
      if ((parts[1] || '').indexOf('vd-warn') >= 0 !== warn) fails.push('row ' + (k + 1) + ' warn class ' + parts[1] + ' expected ' + warn + ' ' + tag);
    }
    const sn = num(sraw), sOk = sn !== null && !isNaN(sn) && sn > 0 && sn <= (su === 'ng' ? 500 : 1250); if (sraw !== '' && !sOk) hint = true;
    const hintTxt = await ctx.text('vdHint');
    if (hint && !hintTxt) fails.push('missing hint ' + tag); if (!hint && hintTxt) fails.push('unexpected hint "' + hintTxt + '" ' + tag);
    /* serum */
    const sout = await ctx.text('vdSOut'), sexp = sOk ? (su === 'ng' ? nt(sn, 2) + ' ng/mL = ' + nt(sn * 2.5, 2) + ' nmol/L' : nt(sn, 2) + ' nmol/L = ' + nt(sn / 2.5, 2) + ' ng/mL') : '';
    if (sout !== sexp) fails.push('serum "' + sout + '" expected "' + sexp + '" ' + tag);
    /* targets */
    const tg = await tbl('vdTargets'), wt = [['Level', 'IU a day', 'mcg a day'], [std === 'uk' ? 'Recommended (NHS)' : (std === 'eu' ? 'Adequate intake (EFSA)' : (ai ? 'Adequate intake (AI)' : 'Recommended (RDA)')), rdaIU ? rg(rdaIU) : 'not set', rdaIU ? rgm(rdaM) : 'not set'], ['Upper limit (UL)', grp(ulIU), String(ulM)]];
    if (JSON.stringify(tg) !== JSON.stringify(wt)) fails.push('targets ' + JSON.stringify(tg) + ' expected ' + JSON.stringify(wt) + ' ' + tag);
    /* tally + tip + bar */
    const wrapVis = await vis('vdTallyWrap'); if (wrapVis !== (items.length > 0)) fails.push('tally visibility ' + tag);
    let tip = 'The upper limit for ' + name + ' is ' + grp(ulIU) + ' IU (' + ulM + ' mcg) a day.' + (rdaIU ? ' 1 mcg = 40 IU, so ' + grp(hi) + ' IU = ' + nt(hi / 40) + ' mcg.' : ''), zn = null;
    if (items.length) {
      zn = total < hi ? 'below' : (total <= ulIU ? 'within' : 'above');
      tip = 'You take ' + grp(total) + ' IU (' + nt(total / 40, 1) + ' mcg) a day: ' + (rdaIU ? Math.round(total / hi * 100) + '% of the ' + (std === 'uk' ? 'NHS amount' : (std === 'eu' ? 'adequate intake' : (ai ? 'adequate intake' : 'RDA'))) + ' and ' : '') + Math.round(total / ulIU * 100) + '% of the upper limit.' + (!rdaIU && zn === 'within' ? ' That is within the upper limit.' : zn === 'below' ? ' That is below the recommended amount.' : (zn === 'within' ? ' That is between the recommended amount and the upper limit.' : ' That is above the upper limit. Ask a clinician, especially if a doctor prescribed it.'));
      const rows = items.map((x) => ['Supplement ' + x.k + ': ' + nt(x.n) + ' ' + (x.unit === 'iu' ? 'IU' : 'mcg') + ' × ' + nt(x.cnt) + ' a ' + (x.per === 'w' ? 'week' : 'day'), grp(x.pd), nt(x.pd / 40, 1)]);
      const wtl = [['What you take', 'IU a day', 'mcg a day']].concat(rows, [['Total a day', grp(total), nt(total / 40, 1)]].concat(rdaIU ? [['Share of the recommended amount', Math.round(total / hi * 100) + '%']] : [], [['Share of the upper limit', Math.round(total / ulIU * 100) + '%']]));
      const tl = await tbl('vdTally'); if (JSON.stringify(tl) !== JSON.stringify(wtl)) fails.push('tally ' + JSON.stringify(tl) + ' expected ' + JSON.stringify(wtl) + ' ' + tag);
      const zc = await ctx.eval('(function(){var e=document.querySelector("#vdBar .cf-seg");return e?e.className:""})()'); if (zc.indexOf('vd-z-' + zn) < 0) fails.push('bar zone "' + zc + '" expected ' + zn + ' ' + tag);
    } else if (await ctx.eval('!!document.querySelector("#vdBar .cf-seg")')) fails.push('bar fill without a total ' + tag);
    const tp = await ctx.text('vdTip'); if (tp !== tip) fails.push('tip "' + tp + '" expected "' + tip + '" ' + tag);
  }
  return { runs, fails };
};
