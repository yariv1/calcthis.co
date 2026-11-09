/* Independent re-implementation of the body recomposition maths (does NOT use CalcThis.recompEngine). Drives the real inputs and compares the DISPLAYED numbers:
   headline, sub-line, the three-goals table, the per-meal table, the ruler labels, the fat-to-lose rows, the Navy estimate - plus the QA item 19 notes (every field reacts, incl. prerequisite-empty cases). */
module.exports = async function (ctx) {
  let s = 424242; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tr = (x, d) => String(parseFloat((Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)));
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  const LB = 2.20462, ST = 6.35029, MINUS = '−';
  const fails = []; let runs = 0;
  const tbl = async (id) => JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#' + id + ' tr")].map(r=>[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())))'));
  const vis = async (id) => ctx.eval('document.getElementById("' + id + '").style.display !== "none"');
  const dur = (d) => d > 3650 ? 'more than 10 years' : (d < 14 ? Math.max(1, Math.ceil(d)) + (Math.ceil(d) === 1 ? ' day' : ' days') : Math.round(d / 7) + ' weeks');
  const navy = (male, h, w, n, hp) => { const l = (x) => Math.log(x) / Math.LN10; let b; if (male) { if (!(w - n > 0)) return null; b = 495 / (1.0324 - 0.19077 * l(w - n) + 0.15456 * l(h)) - 450; } else { if (!(w + hp - n > 0)) return null; b = 495 / (1.29579 - 0.35004 * l(w + hp - n) + 0.22100 * l(h)) - 450; } return Math.min(75, Math.max(1, b)); };
  const open = async (id) => (await ctx.eval('document.getElementById("' + id + '").style.display')) !== 'none';
  const wTxt = (kg, wu) => tr(wu === 'lb' ? kg * LB : (wu === 'st' ? kg / ST : kg), 1) + ' ' + wu;
  const ensure = async (panel, btn, want) => { const o = await open(panel); if (o !== want) await ctx.click(btn); };
  for (let i = 0; i < 260; i++) {
    const male = R() < 0.5, hu = pick(['in', 'cm']), wu = pick(['kg', 'lb', 'st']), f = pick([1.2, 1.375, 1.55, 1.725, 1.9]), focus = pick(['fat', 'both', 'muscle']), meals = pick([3, 4, 4, 5, 6]);
    const age = 15 + Math.round(R() * 70), cm = Math.round((145 + R() * 60) * 10) / 10, kg = Math.round((45 + R() * 90) * 10) / 10;
    const bf = pick([null, null, 12, 22, 30, 41]), maint = pick([null, null, null, 1400, 2200, 3400]), tbf = pick([null, null, 15, 20, 26]), ex = pick([null, null, null, 700, 2000, 5000, 14000]);
    const hv = hu === 'in' ? String(Math.round(cm / 2.54 * 100) / 100) : String(cm), hcm = hu === 'in' ? parseFloat(hv) * 2.54 : parseFloat(hv);
    const wv = wu === 'lb' ? String(Math.round(kg * LB * 10) / 10) : (wu === 'st' ? String(Math.round(kg / ST * 100) / 100) : String(kg));
    const wkg = wu === 'lb' ? parseFloat(wv) / LB : (wu === 'st' ? parseFloat(wv) * ST : parseFloat(wv));
    await ctx.fill();
    await ctx.seg('rcSex', male ? 'm' : 'f'); await ctx.seg('rcHu', hu); await ctx.seg('rcWu', wu); await ctx.seg('rcFocus', focus);
    await ctx.eval('document.getElementById("rcAct").value="' + f + '"');
    const adv = maint !== null || tbf !== null || ex !== null || meals !== 4, isOpen = await open('rcAdvIn');
    if (adv && !isOpen) await ctx.click('rcAdvBtn'); if (!adv && isOpen) await ctx.click('rcAdvBtn');
    if (adv) await ctx.seg('rcMeals', String(meals));
    await ctx.set('rcAge', String(age)); await ctx.set('rcH', hv); await ctx.set('rcW', wv);
    if (bf !== null) await ctx.set('rcBf', String(bf)); if (maint !== null) await ctx.set('rcMaint', String(maint)); if (tbf !== null) await ctx.set('rcTbf', String(tbf)); if (ex !== null) await ctx.set('rcEx', String(ex));
    const nm = adv ? meals : 4;
    let M; if (maint !== null) M = maint; else if (bf !== null) M = (370 + 21.6 * wkg * (1 - bf / 100)) * f; else M = (10 * wkg + 6.25 * hcm - 5 * age + (male ? 5 : -161)) * f;
    if (maint === null && ex !== null) M += ex / 7;
    const Mr = Math.round(M), fl = male ? 1500 : 1200, T = [400, 200, 0].map((d) => { const c = Math.min(Mr, Math.max(fl, Mr - d)); return { cal: c, cut: Mr - c }; });
    const cur = T[['fat', 'both', 'muscle'].indexOf(focus)], tag = JSON.stringify({ male, hu, wu, f, focus, hv, wv, age, bf, maint, tbf, ex, meals }); runs++;
    const big = await ctx.text('rcBig'), sub = await ctx.text('rcSub');
    if (big !== grp(cur.cal) + ' kcal') fails.push('headline ' + big + ' expected ' + grp(cur.cal) + ' ' + tag);
    if (sub.indexOf('You burn ' + grp(Mr) + ' kcal') !== 0) fails.push('sub-line ' + sub + ' ' + tag);
    const method = maint !== null ? 'your own number' : (bf !== null ? 'Katch-McArdle' : 'Mifflin-St Jeor');
    if (sub.indexOf(method) < 0) fails.push('method in sub-line ' + sub + ' expected ' + method + ' ' + tag);
    const cmp = await tbl('rcCmp'), rowOf = (lab) => cmp.filter((r) => r[0] === lab)[0];
    const P = 2.0 * wkg, F = 1.0 * wkg;
    T.forEach((t, k) => {
      const C = (t.cal - 4 * P - 9 * F) / 4;
      const exp = { 'Calories cut': t.cut > 0 ? MINUS + grp(t.cut) : '0', 'Calories': grp(t.cal), 'Protein': grp(P) + ' g', 'Carbs': grp(Math.max(0, C)) + ' g', 'Fat': grp(F) + ' g', 'Scale a week*': t.cut > 0 ? MINUS + (wu === 'kg' ? f2(t.cut * 7 / 7700) + ' kg' : f2(t.cut * 7 / 7700 * LB) + ' lb') : '0' };
      Object.keys(exp).forEach((lab) => { const r = rowOf(lab); if (!r || r[k + 1] !== exp[lab]) fails.push('table ' + lab + ' col ' + k + ' got ' + (r ? r[k + 1] : 'missing') + ' expected ' + exp[lab] + ' ' + tag); });
    });
    const mac = await tbl('rcMac'), C0 = (cur.cal - 4 * P - 9 * F) / 4, row2 = (lab) => mac.filter((r) => r[0].indexOf(lab) === 0)[0];
    const chk = (lab, day, meal) => { const r = row2(lab); if (!r || r[1] !== day || r[2] !== meal) fails.push('per-meal ' + lab + ' got ' + (r ? r[1] + '|' + r[2] : 'missing') + ' expected ' + day + '|' + meal + ' ' + tag); };
    chk('Calories', grp(cur.cal), grp(cur.cal / nm)); chk('Protein', grp(P) + ' g', grp(P / nm) + ' g'); chk('Fat', grp(F) + ' g', grp(F / nm) + ' g'); chk('Carbohydrate', grp(Math.max(0, C0)) + ' g', grp(Math.max(0, C0) / nm) + ' g');
    /* ruler: every label number is on the page */
    const rl = await ctx.text('rcRuler');
    [cur.cal, T[0].cal, T[1].cal, T[2].cal, Mr - 500, fl].forEach((v) => { if (rl.indexOf(grp(Math.max(0, v))) < 0) fails.push('ruler label ' + grp(v) + ' missing ' + tag); });
    /* fat to lose */
    const fatOn = await vis('rcFatWrap');
    if (bf !== null && tbf !== null && tbf < bf) {
      if (!fatOn) fails.push('fat to lose hidden ' + tag);
      else {
        const rows = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#rcFatRows .bf-cmp .v")].map(e=>e.textContent.replace(/\\s+/g," ").trim()))'));
        const L = wkg * (1 - bf / 100), Tw = L / (1 - tbf / 100), lose = wkg - Tw;
        const wk = (cut) => cut > 0 ? dur(lose * 7700 / cut) : '—';
        const exp = [wTxt(wkg - L, wu), wTxt(L, wu), wTxt(Tw, wu), wTxt(lose, wu), wk(T[0].cut), wk(T[1].cut), wk(T[2].cut)];
        exp.forEach((e, k) => { if (rows[k] !== e) fails.push('fat row ' + k + ' got ' + rows[k] + ' expected ' + e + ' ' + tag); });
      }
    } else if (fatOn) fails.push('fat to lose shown without a valid target ' + tag);
    /* QA item 19 notes */
    const bn = await ctx.text('rcBfNote'), mn = await ctx.text('rcMaintNote'), tn = await ctx.text('rcTbfNote');
    if (bf !== null && bn.indexOf(maint !== null ? 'Not used for the calories' : 'Katch-McArdle') < 0) fails.push('body fat note ' + bn + ' ' + tag);
    if (bf === null && bn !== '') fails.push('body fat note without a body fat ' + bn + ' ' + tag);
    if (maint !== null && mn.indexOf('Used instead of the estimate (the estimate would be ') !== 0) fails.push('maintenance note ' + mn + ' ' + tag);
    if (maint !== null) { const est = Math.round(bf !== null ? (370 + 21.6 * wkg * (1 - bf / 100)) * f : (10 * wkg + 6.25 * hcm - 5 * age + (male ? 5 : -161)) * f); if (mn.indexOf('would be ' + grp(est) + ' kcal') < 0) fails.push('maintenance note estimate ' + mn + ' expected ' + grp(est) + ' ' + tag); }
    if (tbf !== null && bf === null && tn.indexOf('Type your current body fat first') !== 0) fails.push('target note without body fat ' + tn + ' ' + tag);
    if (tbf !== null && bf !== null && tbf >= bf && tn.indexOf('is not below your current') < 0) fails.push('target note not below ' + tn + ' ' + tag);
  }
  /* ---- Navy estimate: values, wording, the Use button ---- */
  for (let i = 0; i < 40; i++) {
    const male = R() < 0.5, hu = pick(['in', 'cm']);
    const h = 150 + Math.round(R() * 40), wa = 60 + Math.round(R() * 50), ne = 28 + Math.round(R() * 14), hp = 80 + Math.round(R() * 35);
    const cv = (x) => hu === 'in' ? String(Math.round(x / 2.54 * 100) / 100) : String(x);
    await ctx.fill(); await ctx.seg('rcSex', male ? 'm' : 'f'); await ctx.seg('rcHu', hu);
    await ensure('rcEstIn', 'rcEstBtn', true);
    await ctx.set('rcH', cv(h)); await ctx.set('rcWa', cv(wa)); await ctx.set('rcNe', cv(ne)); if (!male) await ctx.set('rcHi', cv(hp));
    const k = hu === 'in' ? 2.54 : 1, hh = parseFloat(cv(h)) * k, ww = parseFloat(cv(wa)) * k, nn = parseFloat(cv(ne)) * k, pp = parseFloat(cv(hp)) * k;
    const v = navy(male, hh, ww, nn, pp), note = await ctx.text('rcEstNote'), tag = JSON.stringify({ male, hu, h, wa, ne, hp }); runs++;
    if (v === null) { if (note.indexOf('don’t work together') < 0) fails.push('estimate invalid note ' + note + ' ' + tag); continue; }
    if (v < 3 || v > 70) { if (note.indexOf('These measurements give ' + f1(v) + '% body fat') !== 0) fails.push('estimate out of range note ' + note + ' ' + tag); continue; }
    if (note.indexOf('Estimated body fat: ' + f1(v) + '%') !== 0) fails.push('estimate ' + note + ' expected ' + f1(v) + ' ' + tag);
    const useTxt = await ctx.text('rcUse'); if (useTxt !== 'Use ' + f1(v) + '%') fails.push('use button ' + useTxt + ' ' + tag);
    await ctx.click('rcUse'); const bfv = await ctx.eval('document.getElementById("rcBf").value'); if (bfv !== f1(v)) fails.push('use button value ' + bfv + ' ' + tag);
    const bn = await ctx.text('rcBfNote'); if (bn.indexOf('Katch-McArdle') < 0) fails.push('note after Use ' + bn + ' ' + tag);
  }
  /* ---- item 19: a field with its prerequisite empty says so ---- */
  await ctx.fill(); await ctx.set('rcW', ''); await ctx.set('rcBf', '22');
  let t = await ctx.text('rcBfNote'); if (t.indexOf('Type your weight first') !== 0) fails.push('body fat without weight: ' + t);
  let sb = await ctx.text('rcSub'); if (sb !== 'Still needed: weight.') fails.push('sub-line without weight: ' + sb);
  await ctx.fill(); await ctx.set('rcAge', ''); await ctx.set('rcH', ''); sb = await ctx.text('rcSub'); if (sb !== 'Still needed: age and height.') fails.push('sub-line without age and height: ' + sb);
  await ctx.set('rcW', ''); sb = await ctx.text('rcSub'); if (sb !== 'Still needed: weight, age and height.') fails.push('sub-line empty: ' + sb);
  await ctx.fill(); await ensure('rcAdvIn', 'rcAdvBtn', true); await ctx.set('rcW', ''); await ctx.set('rcMaint', '2200'); t = await ctx.text('rcMaintNote'); if (t.indexOf('Type your weight too') !== 0) fails.push('maintenance without weight: ' + t);
  await ctx.set('rcW', '154'); await ctx.set('rcAge', ''); await ctx.set('rcH', ''); t = await ctx.text('rcSub'); if (t.indexOf('You burn 2,200 kcal') !== 0) fails.push('own calories with no age/height: ' + t);
  t = await ctx.text('rcMaintNote'); if (t !== 'Used as given — age and height are not needed.') fails.push('maintenance note with no age/height: ' + t);
  await ctx.set('rcAge', 'abc'); const st1 = await ctx.eval('document.getElementById("rcBody").style.display'); if (st1 === 'none') fails.push('junk age hid the result while own calories are given');
  /* junk in the optional maintenance keeps the estimate */
  await ctx.fill(); await ensure('rcAdvIn', 'rcAdvBtn', true); await ctx.set('rcMaint', '5');
  const st2 = await ctx.eval('document.getElementById("rcBody").style.display'); if (st2 === 'none') fails.push('junk maintenance hid the result although age and height are valid');
  /* training days note, both sides of 3 */
  await ctx.fill(); await ensure('rcAdvIn', 'rcAdvBtn', true);
  for (const d of ['2', '3', '4', '6']) { await ctx.seg('rcDays', d); t = await ctx.text('rcDaysNote'); if (t.indexOf(d + ' strength sessions a week') !== 0) fails.push('days note ' + d + ': ' + t); if ((+d < 3) !== (t.indexOf('suggest at least 3') > 0)) fails.push('days note wording for ' + d + ': ' + t); }
  /* estimate notes: missing pieces named */
  await ctx.fill(); await ctx.seg('rcSex', 'm'); await ensure('rcEstIn', 'rcEstBtn', true); await ctx.set('rcH', '');
  t = await ctx.text('rcEstNote'); if (t.indexOf('Type your waist and neck') !== 0) fails.push('estimate empty note: ' + t);
  await ctx.set('rcWa', '34'); t = await ctx.text('rcEstNote'); if (t.indexOf('Still needed for the estimate: your height (above), your neck') !== 0) fails.push('estimate partial note: ' + t);
  /* health flags: each choice adds a clinician note and the field says what it did */
  await ctx.fill(); await ensure('rcAdvIn', 'rcAdvBtn', true);
  { const hn0 = await ctx.text('rcHealthNote'); if (hn0.indexOf('Pregnancy, breastfeeding, a GLP-1') !== 0) fails.push('health note default: ' + hn0); }
  for (const [v, w] of [['preg', 'Pregnancy changes'], ['bf', 'Breastfeeding raises'], ['glp', 'A GLP-1 medicine'], ['kid', 'Kidney disease can limit']]) { await ctx.set('rcHealth', v); const fl = await ctx.text('rcFlags'), hn = await ctx.text('rcHealthNote'); if (fl.indexOf(w) < 0) fails.push('health flag ' + v + ': ' + fl.slice(0, 80)); if (hn.indexOf('Ask a clinician or dietitian') < 0) fails.push('health note ' + v + ': ' + hn); }
  await ctx.set('rcHealth', 'none');
  /* training/rest days and expected muscle gain */
  for (const sex of ['m', 'f']) {
    await ctx.fill(); await ctx.seg('rcSex', sex); await ensure('rcAdvIn', 'rcAdvBtn', true); await ctx.set('rcMaint', '2600'); await ctx.seg('rcDays', '3');
    await ctx.click('rcK1');
    const cyc = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#rcCycle tbody tr")].map(r=>[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())))'));
    const avg = 2200, tr = Math.min(avg * 1.1, 2600), rest = (avg * 7 - tr * 3) / 4;
    if (cyc.length !== 3 || cyc[0][1] !== grp(tr) + ' kcal' || cyc[1][1] !== grp(rest) + ' kcal' || cyc[2][1] !== grp(avg) + ' kcal') fails.push('cycle ' + sex + ' ' + JSON.stringify(cyc) + ' expected ' + grp(tr) + ' / ' + grp(rest) + ' / ' + grp(avg));
    let pw = await ctx.eval('document.getElementById("rcPotWrap").style.display'); if (pw !== 'none') fails.push('potential shown before experience is set');
    const RT = sex === 'm' ? { beg: [0.75, 0.95], inter: [0.2, 0.45], adv: [0.08, 0.11] } : { beg: [0.38, 0.48], inter: [0.1, 0.23], adv: [0.04, 0.06] }, MO = 12 / 4.345, f1x = (x) => (Math.round(x * 10) / 10).toFixed(1);
    for (const v of ['beg', 'inter', 'adv']) {
      await ctx.set('rcExp', v);
      const rows = JSON.parse(await ctx.eval('JSON.stringify([...document.querySelectorAll("#rcPot tbody tr")].map(r=>[r.className,...[...r.children].map(c=>c.textContent.replace(/\\s+/g," ").trim())]))'));
      const k = ['beg', 'inter', 'adv'].indexOf(v), r = RT[v], want = f1x(r[0] * MO) + '\u2013' + f1x(r[1] * MO) + ' kg';
      if (rows.length !== 4 || rows[k][0] !== 'cur' || rows[k][3].indexOf(want) !== 0) fails.push('potential ' + sex + ' ' + v + ' ' + JSON.stringify(rows[k]) + ' expected ' + want);
    }
    await ctx.set('rcExp', 'none');
  }
  await ctx.seg('rcSex', 'f');
  return { runs, fails: fails.slice(0, 25) };
};
