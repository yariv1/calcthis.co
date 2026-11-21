/* ORACLE for retatrutide-dosage-calculator: an INDEPENDENT re-implementation of the arithmetic (never CalcThis.retaEngine): strength = vial / water, volume = dose / strength, units = mL x 100,
   water for a wanted draw, the vial-by-vial allocation of a multi-step schedule (greedy, a new vial opens when the rest cannot cover the next dose), whole-unit rounding, syringe fit.
   Compared with what the page DISPLAYS (headline, label, sub, tip, warnings, numbers / steps / totals / water tables, notes, hints, sticky bar) for powder vials (mg and mcg), water mode,
   ready liquid with a container, steps with weeks, injections a week and the three syringe sizes. */
module.exports = async function (ctx) {
  let s = 20261122; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  /* formatting: 4 significant digits (decimals = 3 - floor(log10)), trailing zeros dropped, thousands commas */
  const f4 = (x) => { if (x === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(x)) + 1e-12), d = Math.max(0, Math.min(12, 3 - e)); let t = x.toFixed(d); if (t.indexOf('.') >= 0) t = t.replace(/0+$/, '').replace(/\.$/, ''); const p = t.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); };
  const fd = (x, dec) => dec === 'a' ? f4(x) : (() => { const t = x.toFixed(+dec).split('.'); t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return t.join('.'); })();
  const num = (t) => { const q = String(t).replace(/,/g, '').match(/-?\d+\.?\d*(e-?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 190) + '] lacks [' + sub + ']'); return false; } return true; };
  const eq = (a, b, tag) => { cmp++; if (a !== b) fails.push(tag + ' got [' + a + '] expected [' + b + ']'); };
  const rowOf = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("rtBig"),lab:g("rtLab"),sub:g("rtSub"),tip:g("rtTip"),body:vis("rtBody"),hint:vis("rtHint")?g("rtHint"):"",warn:g("rtWarn"),nums:rows("rtNums"),wtab:rows("rtWTab"),wvis:vis("rtWTabWrap"),sched:rows("rtSched"),schedVis:vis("rtSchedWrap"),tot:rows("rtTot"),tlVis:vis("rtTlWrap"),tlSvg:document.getElementById("rtTl").innerHTML.length,syrVis:vis("rtSyrWrap"),syrSvg:document.getElementById("rtSyr").innerHTML.length,utab:rows("rtUTab"),mlab:g("rtMLab"),mval:g("rtMVal"),copy:g("rtCopyTxt"),vn:g("rtVialN"),wn:g("rtWaterN"),ln:g("rtLN"),ltn:g("rtLTotN"),fn:g("rtFreqN"),wantn:g("rtWantN"),ipn:g("rtIpmN"),kgn:g("rtKgN"),r1:g("rtRN1"),r2:g("rtRN2"),r3:g("rtRN3")};})())'));
  const ALL = ['rtVial', 'rtWater', 'rtLA', 'rtLP', 'rtLTot', 'rtWant', 'rtFreq', 'rtKg', 'rtWt'];
  const reset = async (form) => { await ctx.click('rtClear'); await ctx.seg('rtForm', form || 'vial'); await ctx.seg('rtFind', 'units'); await ctx.seg('rtVu', 'mg'); await ctx.seg('rtLu', 'mg'); await ctx.seg('rtDu', 'mg'); await ctx.seg('rtSyrSz', '1'); await ctx.seg('rtDec', 'a'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("rtAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('rtAdvBtn'); };
  const cleanTxt = (st) => { cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push('bad text in result: ' + st.big); };
  await advOpen();
  /* independent plan */
  const planO = (steps, pw, vial) => { const vials = []; let rem = 0, cur = null, inj = 0, mg = 0, T = 0; steps.forEach((st) => { const n = Math.floor(st.w * pw + 1e-9); if (!(n > 0)) return; T += st.w; for (let j = 0; j < n; j++) { if (vial) { if (!cur || rem + 1e-9 < st.d) { cur = { left: 0 }; vials.push(cur); rem = vial; } rem -= st.d; cur.left = rem; } mg += st.d; inj++; } }); return { vials, inj, mg, T }; };
  const SZ = ['1', '0.5', '0.3'];

  /* ---- 1. powder vial, units, with steps and weeks ---- */
  for (let i = 0; i < 90; i++) {
    runs++; await reset('vial');
    const vu = pick(['mg', 'mg', 'mcg']), du = pick(['mg', 'mg', 'mcg']), vialMg = pick([5, 10, 15, 20, 30, 60, 2.5, 7.5, 12]), water = pick([1, 1.5, 2, 2.5, 3, 4, 5, 0.5, 3.3]);
    const conc = vialMg / water, nSteps = pick([1, 1, 2, 3]), pw = pick([1, 1, 2, 3, 3.5, 7]), syr = pick(SZ), dec = pick(['a', 'a', '1', '2', '3']);
    const steps = []; for (let k = 0; k < nSteps; k++) { const dmg = Math.round(pick([0.25, 0.5, 1, 1.5, 2, 2.5, 4, 0.1, 3]) * 1e4) / 1e4; if (dmg > vialMg) { k--; continue; } steps.push({ d: dmg, w: pick([1, 2, 4, 0.5, 6, 12, 3]) }); }
    await ctx.seg('rtVu', vu); await ctx.seg('rtDu', du); await ctx.seg('rtSyrSz', syr); await ctx.seg('rtDec', dec);
    const o = { rtVial: String(vu === 'mg' ? vialMg : vialMg * 1000), rtWater: String(water) }; if (pw !== 1 || R() < 0.3) o.rtFreq = String(pw);
    await setAll(o);
    for (let k = 0; k < nSteps; k++) { if (k > 0) await ctx.click('rtAdd'); await ctx.set('rtD' + (k + 1), String(du === 'mg' ? steps[k].d : Math.round(steps[k].d * 1000 * 1e6) / 1e6)); if (R() < 0.85) await ctx.set('rtW' + (k + 1), String(steps[k].w)); else steps[k].w = 0; }
    const st = await read(), tag = 'vial ' + vialMg + vu + ' ' + water + 'mL steps ' + JSON.stringify(steps) + ' pw=' + pw + ' syr=' + syr + ' dec=' + dec;
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); continue; }
    cleanTxt(st);
    const s1 = steps[0], ml = s1.d / conc, units = ml * 100, B = +syr, fits = ml <= B + 1e-9;
    eq(st.big, fd(units, dec) + ' units', tag + ' headline'); has(st.sub, fd(ml, dec) + ' mL · ' + fd(s1.d, dec) + ' mg at ' + fd(conc, dec) + ' mg per mL', tag + ' sub');
    has(st.lab, nSteps > 1 ? 'Draw for step 1' : 'Syringe units for your dose', tag + ' label'); has(st.mval, fd(units, dec) + ' units', tag + ' sticky');
    const strengthRow = rowOf(st.nums, 'Strength'); if (strengthRow) has(strengthRow[1], fd(conc, dec) + ' mg per mL (' + fd(conc * 1000, dec) + ' mcg per mL)', tag + ' strength row'); else fails.push(tag + ' no strength row');
    const vr = rowOf(st.nums, 'Peptide in the vial'); if (vr) has(vr[1], fd(vialMg, dec) + ' mg (' + fd(vialMg * 1000, dec) + ' mcg)', tag + ' vial row');
    const pv = Math.floor(vialMg / s1.d + 1e-9), rpv = rowOf(st.nums, 'Doses in one vial at this dose'); if (rpv) eq(rpv[1], String(pv), tag + ' doses per vial'); else fails.push(tag + ' no doses row');
    const rw = rowOf(st.nums, 'Weeks one vial lasts at ' + f4(pw) + ' a week'); if (rw) eq(rw[1], pv ? fd(pv / pw, dec) : '0', tag + ' weeks per vial'); else fails.push(tag + ' no weeks row');
    /* warnings */
    if (!fits) has(st.warn, 'needs ' + f4(ml) + ' mL, more than the ' + f4(B) + ' mL syringe holds', tag + ' fit warning'); else if (units < 1) has(st.warn, 'under 1 unit', tag + ' tiny warning'); else if (Math.abs(Math.round(units) - units) / units > 0.005) has(st.warn, 'closest whole unit is ' + Math.round(units), tag + ' whole-unit warning'); else { cmp++; if (/the draw is|closest whole unit/.test(st.warn.split('Step')[0] || '') && nSteps === 1) fails.push(tag + ' unexpected warning ' + st.warn); }
    cmp++; if (fits && (!st.syrVis || st.syrSvg < 500)) fails.push(tag + ' syringe not drawn'); if (!fits) { cmp++; if (st.syrVis) fails.push(tag + ' syringe shown although the dose does not fit'); }
    /* water table */
    const wrow = st.wtab.filter((r) => r[0] === f4(water) + ' mL')[0]; cmp++; if (!wrow) fails.push(tag + ' water table lacks the water used'); else { has(wrow[1], fd(conc, dec) + ' mg/mL', tag + ' water row strength'); has(wrow[2], fd(units, dec) + ' units', tag + ' water row draw'); }
    /* schedule and vials */
    const good = steps.filter((x) => x.d <= vialMg), withW = good.filter((x) => x.w > 0 && Math.floor(x.w * pw + 1e-9) > 0), pl = withW.length ? planO(withW, pw, vialMg) : null;
    if (pl) {
      cmp++; if (!st.tlVis || st.tlSvg < 800) fails.push(tag + ' timeline missing');
      const t1 = rowOf(st.tot, 'Total weeks'), t2 = rowOf(st.tot, 'Injections'), t3 = rowOf(st.tot, 'Total peptide used'), t4 = rowOf(st.tot, 'Vials needed'), t5 = rowOf(st.tot, 'Left in the last vial');
      if (t1) eq(t1[1], f4(pl.T), tag + ' total weeks'); else fails.push(tag + ' no total weeks'); if (t2) eq(t2[1], String(pl.inj), tag + ' injections'); else fails.push(tag + ' no injections row');
      if (t3) eq(t3[1], fd(pl.mg, dec) + ' mg', tag + ' mg used'); else fails.push(tag + ' no mg used'); if (t4) eq(t4[1], String(pl.vials.length), tag + ' vials needed'); else fails.push(tag + ' no vials row');
      if (t5) eq(t5[1], fd(pl.vials[pl.vials.length - 1].left, dec) + ' mg', tag + ' left'); else fails.push(tag + ' no left row');
    } else { cmp++; if (st.tlVis) fails.push(tag + ' timeline should be hidden without weeks'); }
    if (nSteps > 1) { const body = st.sched.slice(1); cmp++; if (body.length !== nSteps) fails.push(tag + ' steps table rows ' + body.length); else body.forEach((r, k) => { const dd = steps[k].d, u = dd / conc * 100; has(r[1], fd(du === 'mg' ? dd : dd * 1000, dec) + ' ' + du, tag + ' step ' + (k + 1) + ' dose'); has(r[2], fd(u, dec) + ' units', tag + ' step ' + (k + 1) + ' draw'); eq(r[3], steps[k].w ? f4(steps[k].w) : '—', tag + ' step ' + (k + 1) + ' weeks'); }); }
    /* units reference */
    const u10 = st.utab.filter((r) => r[0] === '10')[0]; if (u10) { has(u10[1], fd(0.1, dec) + ' mL', tag + ' units table mL'); has(u10[2], fd(0.1 * conc, dec) + ' mg', tag + ' units table mg'); } else fails.push(tag + ' no 10-unit row');
  }

  /* ---- 2. water mode ---- */
  for (let i = 0; i < 30; i++) {
    runs++; await reset('vial'); await ctx.seg('rtFind', 'water'); const vialMg = pick([5, 10, 15, 20, 30, 60, 3]), dose = pick([0.25, 0.5, 1, 2, 4, 0.1]), want = pick([5, 10, 20, 25, 30, 40, 12.5, 7]);
    if (dose > vialMg) { i--; runs--; continue; }
    await setAll({ rtVial: String(vialMg), rtWant: String(want), rtD1: String(dose) });
    const st = await read(), tag = 'water mode vial=' + vialMg + ' dose=' + dose + ' want=' + want;
    if (!st.body) { fails.push(tag + ' no result (hint ' + st.hint + ')'); continue; }
    const water = vialMg * want / (100 * dose), conc = vialMg / water;
    eq(st.big, f4(water) + ' mL', tag + ' headline'); has(st.lab, 'Water to add for ' + f4(want) + ' units', tag + ' label'); has(st.sub, 'Strength ' + f4(conc) + ' mg per mL', tag + ' sub'); has(st.wantn, 'add ' + f4(water) + ' mL of water', tag + ' note');
    has(st.mlab, 'Water to add', tag + ' sticky label'); const nrow = rowOf(st.nums, 'Syringe units'); if (nrow) has(nrow[1], f4(want) + ' units', tag + ' units row (round trip)');
    cleanTxt(st);
  }
  /* ---- 3. ready liquid with a container ---- */
  for (let i = 0; i < 30; i++) {
    runs++; await reset('liquid'); const lu = pick(['mg', 'mcg']), amt = pick([2.5, 5, 10, 20, 1.5]), per = pick([1, 2, 0.5, 3, null]), dose = pick([0.25, 0.5, 1, 2, 0.1]), cont = pick([null, 3, 10, 2, 1.5]), pw = pick([1, 2, 1]);
    const conc = amt / (per || 1); if (dose > (cont ? conc * cont : Infinity)) { i--; runs--; continue; }
    await ctx.seg('rtLu', lu); const o = { rtLA: String(lu === 'mg' ? amt : amt * 1000), rtD1: String(dose), rtW1: String(pick([2, 4, 6])) }; if (per) o.rtLP = String(per); if (cont) o.rtLTot = String(cont); if (pw !== 1) o.rtFreq = String(pw); await setAll(o);
    const st = await read(), tag = 'liquid ' + amt + lu + '/' + per + ' dose=' + dose + ' cont=' + cont + ' pw=' + pw;
    if (!st.body) { fails.push(tag + ' no result (hint ' + st.hint + ')'); continue; }
    const units = dose / conc * 100; eq(st.big, f4(units) + ' units', tag + ' headline'); has(st.ln, f4(amt) + ' mg in ' + f4(per || 1) + ' mL = ' + f4(conc) + ' mg per mL', tag + ' strength note');
    const w = Number(o.rtW1), pl = planO([{ d: dose, w }], pw, cont ? conc * cont : 0);
    if (cont && pl.inj > 0) { const t4 = rowOf(st.tot, 'Containers needed'); if (t4) eq(t4[1], String(pl.vials.length), tag + ' containers'); else fails.push(tag + ' no containers row'); const rd = rowOf(st.nums, 'Doses in one container at this dose'); if (rd) eq(rd[1], String(Math.floor(conc * cont / dose + 1e-9)), tag + ' doses per container'); else fails.push(tag + ' no doses row'); }
    else { const rd = rowOf(st.nums, 'Doses in a container'); cmp++; if (cont) fails.push(tag + ' expected container rows'); else if (!rd) fails.push(tag + ' no container hint row'); }
    cmp++; if (st.wvis) fails.push(tag + ' water table must be hidden for a ready liquid');
    cleanTxt(st);
  }
  /* ---- 4. hints and notes: every field reacts ---- */
  const hintCase = async (form, setup, expectHint, expectBody, tag, after) => { runs++; await reset(form); if (after) await after(); await setAll(setup); const st = await read(); if (expectHint) has(st.hint, expectHint, tag + ' hint'); cmp++; if (!!st.body !== expectBody) fails.push(tag + ' result visible=' + st.body + ' expected ' + expectBody + ' (hint ' + st.hint + ')'); return st; };
  await hintCase('vial', { rtVial: 'abc', rtWater: '2', rtD1: '1' }, 'amount in the vial', false, 'vial junk');
  await hintCase('vial', { rtVial: '10', rtWater: '0', rtD1: '1' }, 'water should be a number above 0', false, 'water zero');
  await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '-1' }, 'dose in step 1', false, 'dose negative');
  await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '11' }, 'more than the whole vial', false, 'dose above vial');
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2' }, '', false, 'no dose yet'); has(st.r1, 'Type the dose for one injection', 'no dose note'); has(st.vn, '10 mg = 10,000 mcg', 'vial note'); has(st.wn, '5 mg per mL', 'water note'); }
  { const st = await hintCase('vial', { rtWater: '2' }, '', false, 'water only'); has(st.wn, 'Type the amount in the vial first', 'water without vial note'); }
  { const st = await hintCase('vial', { rtVial: '10' }, '', false, 'vial only'); has(st.wn, 'to see the strength', 'vial without water note'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '1', rtFreq: '99' }, 'ignored for now', true, 'frequency 99'); has(st.fn, 'Use a number above 0 and up to 28', 'frequency note'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '1', rtFreq: '3.5' }, '', true, 'frequency 3.5'); has(st.fn, '3.5 injections a week = one every 2 days', 'frequency 3.5 note'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '1', rtW1: 'x' }, 'weeks should be a number', true, 'weeks junk'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '1', rtW1: '600' }, 'up to 520', true, 'weeks 600'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '1' }, '', true, 'step 2 note', async () => {}); await ctx.click('rtAdd'); const st2 = await read(); has(st2.r2, 'Optional. Type the dose and the number of weeks', 'step 2 empty note'); await ctx.set('rtW2', '3'); const st3 = await read(); has(st3.r2, 'Type the dose for step 2 too', 'step 2 weeks without dose'); await ctx.set('rtD2', 'zz'); const st4 = await read(); has(st4.hint, 'Step 2', 'step 2 junk hint'); cmp++; if (!st4.body) fails.push('a junk second step should not hide the result'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '0.001' }, '', true, 'tiny dose'); has(st.warn, 'under 1 unit', 'tiny dose warning'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '5', rtD1: '5' }, '', true, 'dose needs more than syringe'); has(st.warn, 'needs 2.5 mL, more than the 1 mL syringe holds', 'big draw warning'); has(st.warn, 'With at most 2 mL of water', 'big draw water suggestion'); }
  { const st = await hintCase('vial', { rtVial: '7', rtWater: '2', rtD1: '1' }, '', true, 'fractional unit'); has(st.warn, 'closest whole unit is 29', 'fractional unit warning'); has(st.warn, '1.5% more than the dose', 'fractional unit error'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '2', rtKg: '0.05', rtWt: '80' }, '', true, 'weight dose'); has(st.kgn, '0.05 mg per kg × 80 kg = 4 mg', 'weight dose note'); await ctx.click('rtKgUse'); const stb = await read(); eq(stb.big, '80 units', 'weight dose used (4 mg at 5 mg/mL)'); }
  { const st = await hintCase('vial', { rtVial: '10', rtWater: '2', rtD1: '1', rtKg: '0.05' }, '', true, 'kg without weight'); has(st.kgn, 'Type the body weight too', 'kg only note'); }
  { const st = await hintCase('liquid', { rtLA: '5', rtLP: 'abc', rtD1: '1' }, 'ignored for now', true, 'label volume junk'); has(st.ln, 'ignored for now, so 1 mL is used', 'label volume note'); }
  { const st = await hintCase('liquid', { rtLP: '2' }, '', false, 'volume without amount'); has(st.ln, 'Type the amount on the label first', 'label volume first note'); }
  { const st = await hintCase('liquid', { rtLA: '5', rtD1: '1', rtLTot: 'x' }, 'ignored for now', true, 'container junk'); }
  { const st = await hintCase('vial', { rtVial: '10', rtD1: '1', rtWant: '25' }, '', true, 'water mode full', async () => { await ctx.seg('rtFind', 'water'); }); }
  { const st = await hintCase('vial', { rtVial: '10', rtD1: '1' }, '', false, 'water mode empty want', async () => { await ctx.seg('rtFind', 'water'); }); has(st.wantn, 'Type how many units you want to draw', 'want empty note'); }
  { const st = await hintCase('vial', { rtVial: '10', rtD1: '1', rtWant: '0' }, 'units to draw should be a number above 0', false, 'want zero', async () => { await ctx.seg('rtFind', 'water'); }); }
  { const st = await hintCase('vial', { rtWant: '25' }, '', false, 'units wanted alone', async () => { await ctx.seg('rtFind', 'water'); }); has(st.wantn, 'Type the vial and the dose in step 1 too', 'want alone note'); }
  { const st = await hintCase('vial', { rtKg: '0.05' }, '', false, 'kg alone'); has(st.kgn, 'Type the body weight too', 'kg alone note'); }
  { const st = await hintCase('vial', { rtWt: '80' }, '', false, 'weight alone'); has(st.kgn, 'Type the dose per kg too', 'weight alone note'); }
  /* extremes stay readable */
  { const st = await hintCase('vial', { rtVial: '1000000000', rtWater: '0.001', rtD1: '1000000' }, '', false, 'out-of-range strength'); cleanTxt(st); }
  { const st = await hintCase('vial', { rtVial: '0.000002', rtWater: '1', rtD1: '0.000001' }, '', true, 'smallest numbers'); cleanTxt(st); }
  /* vial in IU with the label's IU per mg */
  for (let i = 0; i < 20; i++) {
    runs++; await reset('vial'); await ctx.seg('rtVu', 'iu'); const iuV = pick([30, 15, 60, 45, 10]), ipm = pick([3, 1.5, 2, 6]), water = pick([1, 2, 3]), dose = pick([0.5, 1, 0.25]), mgV = iuV / ipm;
    if (dose > mgV) { i--; runs--; continue; }
    await setAll({ rtVial: String(iuV), rtIpm: String(ipm), rtWater: String(water), rtD1: String(dose) }); const st = await read(), tag = 'IU vial ' + iuV + ' IU at ' + ipm + ' IU/mg water ' + water + ' dose ' + dose;
    if (!st.body) { fails.push(tag + ' no result (hint ' + st.hint + ')'); continue; }
    eq(st.big, f4(dose / (mgV / water) * 100) + ' units', tag + ' headline'); has(st.vn, f4(iuV) + ' IU = ' + f4(mgV) + ' mg', tag + ' vial note'); has(st.ipn, f4(ipm) + ' IU per mg', tag + ' ipm note'); const vr = rowOf(st.nums, 'Peptide in the vial'); if (vr) has(vr[1], f4(mgV) + ' mg', tag + ' vial row'); cleanTxt(st);
  }
  { const st = await hintCase('vial', { rtVial: '30', rtWater: '2', rtD1: '1' }, '', false, 'IU without IU per mg', async () => { await ctx.seg('rtVu', 'iu'); }); has(st.ipn, 'Type that number from your label', 'IU per mg empty note'); has(st.vn, 'Type the IU per mg printed on the label', 'IU vial note'); has(st.wn, 'Type the IU per mg from the label first', 'IU water note'); }
  { const st = await hintCase('vial', { rtVial: '30', rtIpm: '0', rtWater: '2', rtD1: '1' }, 'IU per mg should be a number above 0', false, 'IU per mg zero', async () => { await ctx.seg('rtVu', 'iu'); }); }
  /* unit toggle converts the number, keeps junk */
  { runs++; await reset('vial'); await setAll({ rtVial: '10', rtWater: '2', rtD1: '1' }); await ctx.seg('rtVu', 'mcg'); eq(await ctx.val('rtVial'), '10000', 'vial mg -> mcg'); await ctx.seg('rtDu', 'mcg'); eq(await ctx.val('rtD1'), '1000', 'dose mg -> mcg'); const st = await read(); eq(st.big, '20 units', 'same result after converting both units'); await ctx.set('rtVial', 'abc'); await ctx.seg('rtVu', 'mg'); eq(await ctx.val('rtVial'), 'abc', 'junk kept while toggling'); }
  /* clear and the click-to-use rows */
  { runs++; await reset('vial'); await setAll({ rtVial: '10', rtWater: '2', rtD1: '1' }); await ctx.eval('document.querySelector("#rtWTab tr[data-w=\\"1\\"]").click()'); eq(await ctx.val('rtWater'), '1', 'clicking a water row sets the water'); const st = await read(); eq(st.big, '10 units', 'result after clicking the 1 mL row'); await ctx.click('rtClear'); const st2 = await read(); cmp++; if (st2.body || st2.big !== '—') fails.push('Clear fields should empty the result'); }
  return { runs, fails: fails.slice(0, 60), comparisons: cmp };
};
