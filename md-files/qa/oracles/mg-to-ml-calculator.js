/* ORACLE for mg-to-ml-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.mgmlEngine). Mass units in mg, volume units in mL (NIST: US fl oz 29.5735295625 mL; UK fl oz 4.54609 L / 160;
   medicine teaspoon 5 mL, tablespoon 15 mL), dose / volume / strength solving in the three modes, every displayed note, table row, warning, drawing attribute and the optional-field hints are rebuilt here
   and compared with what the page DISPLAYS (QA item 19 = every field reacts, including the prerequisite-empty cases). Also unit-toggle conversions, presets, chips and the saved list. */
module.exports = async function (ctx) {
  let s = 20261121; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, cmp = 0;
  const MASS = { mcg: 0.001, mg: 1, g: 1000 };
  const VF = { ml: 1, cc: 1, l: 1000, mm3: 0.001, tsp: 5, tbsp: 15, usfloz: 29.5735295625, ukfloz: 28.4130625 /* = 4546.09 mL / 160, written out because the float quotient is 28.413062500000002 */ };
  const VN = { ml: 'mL', cc: 'cc', l: 'L', mm3: 'mm³', tsp: 'tsp', tbsp: 'tbsp', usfloz: 'US fl oz', ukfloz: 'UK fl oz' };
  const VL = { ml: 'milliliters (mL)', cc: 'cubic centimeters (cc, cm³)', l: 'liters (L)', mm3: 'cubic millimeters (mm³)', tsp: 'teaspoons (5 mL)', tbsp: 'tablespoons (15 mL)', usfloz: 'US fluid ounces', ukfloz: 'UK fluid ounces' };
  const VIDS = Object.keys(VF), SIZES = [1, 3, 5, 10, 20, 60];
  const grp = (t) => { const p = String(t).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); };
  const trz = (t) => t.indexOf('.') >= 0 ? t.replace(/0+$/, '').replace(/\.$/, '') : t;
  const sig = (x, n) => {
    if (!isFinite(x)) return '—'; if (x === 0) return '0'; const ax = Math.abs(x);
    if (ax < 1e-4 || ax >= 1e12) return String(parseFloat(x.toPrecision(n)).toExponential()).replace('e+', 'e');
    const e = Math.floor(Math.log10(ax) + 1e-12), d = Math.max(0, Math.min(12, n - 1 - e)); return grp(trz(x.toFixed(d)));
  };
  const f = (x) => sig(x, 4), ex = (x) => sig(x, 8);
  const fm = (x, dec) => dec === 'a' ? sig(x, 4) : (isFinite(x) ? grp(x.toFixed(+dec)) : '—');
  const nm = (t) => { t = String(t).trim().replace(/\s/g, ''); if (!t) return null; if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, ''); else if (/^[+-]?\d*,\d+$/.test(t)) t = t.replace(',', '.'); else t = t.replace(/,/g, ''); if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN; return parseFloat(t); };
  const pos = (t) => { const n = nm(t); if (n === null) return { e: 1 }; if (isNaN(n) || n <= 0) return { b: 1 }; return { v: n }; };
  const spoon = (tsp) => { const q = Math.round(tsp * 4); if (Math.abs(tsp * 4 - q) > 0.02 || q <= 0 || q > 24) return ''; const w = Math.floor(q / 4), r = q % 4; return (w ? w : '') + ['', '¼', '½', '¾'][r] + ' tsp'; };
  const nice = (vol) => { const st = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 100000]; for (const x of st) { const c = Math.ceil(vol / x - 1e-9); if (c <= 2) return { step: x, mx: (Math.max(1, c) + 1) * x }; } return { step: vol, mx: vol * 1.25 }; };
  const sizeFor = (vol, want) => { if (vol > 60) return null; for (const z of SIZES) if (z >= vol - 1e-12 && (want === 'a' || z >= +want)) return z; return null; };
  const tr = (x, d) => String(parseFloat((Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)));
  const rd = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(id){return [].map.call(document.querySelectorAll("#"+id+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none";};' +
    'var svg=document.getElementById("mmSyrSvg"), rl=document.querySelectorAll("#mmRule .mm-rule-l span"), bd=document.querySelector("#mmRule .mm-band");' +
    'return {big:g("mmBig"),lab:g("mmLab"),sub:g("mmSub"),body:vis("mmBody"),tip:g("mmTip"),hint:vis("mmHint")?g("mmHint"):"",doseN:g("mmDoseN"),volN:g("mmVolN"),sn:g("mmSn"),markN:g("mmMarkN"),botN:g("mmBotN"),dpdN:g("mmDpdN"),' +
    'warn:[].map.call(document.querySelectorAll("#mmWarn .mm-warn"),function(e){return e.textContent.trim();}),syrVis:vis("mmSyrWrap"),syr:svg?{size:+svg.getAttribute("data-size"),vol:+svg.getAttribute("data-vol"),fw:+svg.getAttribute("data-fillw"),bw:+svg.getAttribute("data-barw")}:null,' +
    'kgN:g("mmKgN"),kgUse:vis("mmKgUse")?g("mmKgUse"):"",syrCap:g("mmSyrCap"),ruleCap:g("mmRuleCap"),rule:[].map.call(rl,function(e){return e.textContent.trim()+"|"+e.className;}),band:bd?parseFloat(bd.style.width):null,' +
    'units:rows("mmUnits"),mass:rows("mmMass"),strU:rows("mmStrU"),tab:rows("mmTab"),tabH:g("mmTabH"),tabVis:vis("mmTabWrap"),copy:g("mmCopyTxt"),mlab:g("mmMLab"),mval:g("mmMVal")};})())'));
  const eq = (got, want, tag) => { cmp++; if (JSON.stringify(got) !== JSON.stringify(want)) { fails.push(tag + ' got [' + JSON.stringify(got).slice(0, 300) + '] expected [' + JSON.stringify(want).slice(0, 300) + ']'); return false; } return true; };

  /* ---------- 1. random scenarios ---------- */
  const DOSE = ['50', '125', '500', '2.5', '0.25', '1,500', '10', '0', 'abc', '-3', '', '1000000000000', '0.0000001', '7.5', '2,5'];
  const VOL = ['2.5', '5', '0.5', '10', '100', '0.05', '0', 'abc', '', '1,000', '0.0000001', '2000000', '15', '0.1', '7.25'];
  const SA = ['250', '160', '50', '12.5', '100', '1000', '0', 'abc', '', '0.5', '2', '5', '20000000', '0.0000001'];
  const SP = ['5', '1.25', '1', '', '', '0', 'abc', '0.5', '100', '2.5'];
  const MK = ['', '', '0.1', '0.05', '0.2', '0', 'abc', '0.5', '1', '101'];
  const BT = ['', '', '100', '473', '0', 'abc', '2.5', '100001'];
  const DP = ['', '', '2', '3', '0', 'abc', '1001', '0.5'];
  const SZ = ['a', 'a', '1', '3', '5', '10', '20', '60'];
  const KG = ['', '', '10', '0.5', '0', 'abc', '2000000', '15', '2,5'], WT = ['', '', '20', '44', '0', 'abc', '1001', '70', '0.0001'];
  for (let i = 0; i < 220; i++) {
    const mode = pick(['mgml', 'mgml', 'mlmg', 'strength']), du = pick(['mcg', 'mg', 'mg', 'g']), vu = pick(VIDS), su = pick(['mcg', 'mg', 'mg', 'g']), spu = pick(['ml', 'ml', 'l']), ru = pick(VIDS), dec = pick(['a', 'a', '2', '3', '4']), syr = pick(SZ);
    const dose = pick(DOSE), vol = pick(VOL), sa = pick(SA), sp = pick(SP), mk = pick(MK), bt = pick(BT), dp = pick(DP), adv = R() < 0.6, kg = pick(KG), wt = pick(WT), wu = pick(['kg', 'kg', 'lb']);
    await ctx.fill();
    if (adv) await ctx.click('mmAdvBtn');
    await ctx.seg('mmMode', mode); await ctx.seg('mmDu', du); await ctx.seg('mmSu', su); await ctx.seg('mmSpu', spu); await ctx.set('mmVu', vu);
    if (adv) { await ctx.set('mmRu', ru); await ctx.seg('mmDec', dec); await ctx.set('mmSyrSz', syr); await ctx.set('mmMark', mk); await ctx.set('mmBot', bt); await ctx.set('mmDpd', dp); await ctx.seg('mmWu', wu); await ctx.set('mmKg', kg); await ctx.set('mmWt', wt); }
    await ctx.set('mmSa', sa); await ctx.set('mmSp', sp); await ctx.set('mmVol', vol); await ctx.set('mmDose', dose);
    const A = adv ? { ru, dec, syr, mk, bt, dp, kg, wt, wu } : { ru: 'ml', dec: 'a', syr: 'a', mk: '', bt: '', dp: '', kg: '', wt: '', wu: 'kg' };
    runs++; const tag = JSON.stringify({ mode, du, vu, su, spu, dose, vol, sa, sp, adv, A });
    const g = await rd();
    /* expectations */
    const dr = pos(dose), vr = pos(vol); let doseMg = null, volMl = null;
    if (dr.v) { doseMg = dr.v * MASS[du]; if (doseMg < 1e-6 || doseMg > 1e9) { dr.b = 1; dr.v = null; doseMg = null; } }
    if (vr.v) { volMl = vr.v * VF[vu]; if (volMl < 1e-6 || volMl > 1e6) { vr.b = 1; vr.v = null; volMl = null; } }
    const a = pos(sa), p = pos(sp); let sr; /* strength */
    if (a.e) sr = { empty: 1, pTyped: !p.e }; else if (a.b) sr = { bad: 'a' }; else { const amg = a.v * MASS[su]; if (p.e) sr = { amg, per: 1 }; else if (p.b) sr = { badP: 1, amg, per: 1 }; else sr = { amg, per: p.v * (spu === 'l' ? 1000 : 1) }; if (sr.amg !== undefined) { sr.s = sr.amg / sr.per; if (sr.s < 1e-6 || sr.s > 1e7) { if (sr.badP) sr.rangeP = 1; else sr = { bad: 'range' }; } } }
    /* notes */
    eq(g.doseN, dr.e ? 'Type the dose in mcg, mg or g. It is shown in all three units here.' : (dr.b ? 'Use numbers only, for example 50 or 0.25.' : f(doseMg / 0.001) + ' mcg = ' + f(doseMg) + ' mg = ' + f(doseMg / 1000) + ' g'), 'dose note ' + tag);
    eq(g.volN, vr.e ? 'Type the amount of liquid. 5 mL = 1 teaspoon, 15 mL = 1 tablespoon.' : (vr.b ? 'Use numbers only, for example 2.5 or 10.' : f(volMl) + ' mL = ' + f(volMl / 5) + ' tsp = ' + f(volMl / 15) + ' tbsp'), 'vol note ' + tag);
    let wsn; if (sr.empty) wsn = sr.pTyped ? 'Type the amount on the label first, then the volume counts.' : 'Type the label the way it is printed, for example 250 mg in 5 mL. Leave the volume empty for “per 1 mL”.'; else if (sr.bad === 'a') wsn = 'Use numbers only, for example 250.'; else if (sr.bad === 'range') wsn = 'That strength is outside 0.000001 to 10,000,000 mg per mL.'; else if (sr.badP) wsn = 'The volume should be a number above 0. It is ignored for now, so 1 mL is used.'; else wsn = f(sr.amg) + ' mg in ' + f(sr.per) + ' mL = ' + f(sr.s) + ' mg per mL (' + f(sr.s * 1000) + ' mcg per mL, ' + f(sr.s / 10) + '% w/v)';
    eq(g.sn, wsn, 'strength note ' + tag);
    /* required fields and the hard hints */
    let hard = null, empty = false;
    const need = (c, m) => { if (!empty && !hard) { if (c === 'e') empty = true; else hard = m; } };
    if (mode === 'mgml' || mode === 'strength') { if (dr.e) empty = true; else if (dr.b) hard = 'The dose should be a number above 0 (up to 1,000,000,000 mg).'; }
    if (!empty && !hard && (mode === 'mlmg' || mode === 'strength')) { if (vr.e) empty = true; else if (vr.b) hard = 'The volume should be a number above 0 (up to 1,000,000 mL).'; }
    if (!empty && !hard && mode !== 'strength') { if (sr.empty) empty = true; else if (sr.bad === 'a') hard = 'The strength amount should be a number above 0.'; else if (sr.bad === 'range' || sr.rangeP) hard = 'The strength should be between 0.000001 and 10,000,000 mg per mL. Check the amount and the volume.'; }
    let vol_, mg_, str_;
    if (!empty && !hard) {
      if (mode === 'mgml') { str_ = sr.s; mg_ = doseMg; vol_ = doseMg / sr.s; } else if (mode === 'mlmg') { str_ = sr.s; vol_ = volMl; mg_ = volMl * sr.s; } else { vol_ = volMl; mg_ = doseMg; str_ = doseMg / volMl; if (str_ < 1e-6 || str_ > 1e7) hard = 'That dose and volume give a strength outside 0.000001 to 10,000,000 mg per mL. Check the units.'; }
    }
    /* optional-field notes (always shown, with vol only when a result is shown) */
    const volForAdv = (!empty && !hard) ? vol_ : null;
    const m = pos(A.mk), b = pos(A.bt), d = pos(A.dp); const soft = [];
    if (sr.badP) soft.push('Label volume: use a number above 0. It is ignored for now, so “per 1 mL” is used.');
    let step = null, bottle = null, dpd = null, markN, botN, dpdN;
    if (m.e) markN = 'Optional. Type the gap between two marks on your syringe, in mL, to see the nearest mark.'; else if (m.b || m.v > 100) { markN = 'Use a number above 0 for the gap between marks.'; soft.push('Marks every: use a number above 0 (in mL). It is ignored for now.'); } else { step = m.v; markN = mode === 'mgml' ? 'Marks every ' + f(m.v) + ' mL: the nearest mark is shown under the result.' : 'The nearest mark is shown when you convert mg to mL.'; }
    if (b.e) { botN = d.e ? 'Optional. Type the bottle size in mL to see how many doses it holds.' : 'Type the bottle size first, then the doses a day count.'; if (!d.e) soft.push('Doses a day: type the bottle size first. It is ignored for now.'); }
    else if (b.b || b.v > 100000) { botN = 'Use a number above 0 for the bottle size in mL.'; soft.push('Bottle size: use a number above 0 (in mL). It is ignored for now.'); }
    else { bottle = b.v; botN = volForAdv ? 'A bottle of ' + f(b.v) + ' mL holds ' + f(b.v / volForAdv) + ' doses of ' + f(volForAdv) + ' mL.' : 'Needs a dose or a volume first.'; }
    if (d.e) dpdN = 'Optional. How many doses you give each day.'; else if (d.b || d.v > 1000) { dpdN = 'Use a number above 0.'; soft.push('Doses a day: use a number above 0. It is ignored for now.'); } else if (bottle) { dpd = d.v; dpdN = volForAdv ? f(d.v) + ' a day: ' + f(bottle / volForAdv / d.v) + ' days per bottle.' : 'Needs a dose or a volume first.'; } else dpdN = 'Type the bottle size first.';
    const kk = pos(A.kg), ww = pos(A.wt), wkg = ww.v ? ww.v * (A.wu === 'lb' ? 0.45359237 : 1) : 0, dz = kk.v && wkg ? kk.v * wkg : 0; let kgN, kgUse = '';
    if (kk.e && ww.e) kgN = 'Optional. Type the dose per kg of body weight and the body weight to work out the dose in mg.';
    else if (kk.b || ww.b || (kk.v && kk.v > 1e6) || (ww.v && ww.v > 1000) || (dz && (dz < 1e-6 || dz > 1e9))) { kgN = 'Use numbers above 0 for the dose per kg and the body weight.'; soft.push('Dose from body weight: use numbers above 0. It is ignored for now.'); }
    else if (kk.e) kgN = 'Type the dose per kg too.'; else if (ww.e) kgN = 'Type the body weight too.';
    else { kgN = f(kk.v) + ' mg per kg × ' + f(wkg) + ' kg = ' + f(dz) + ' mg'; kgUse = 'Use ' + f(dz) + ' mg as the dose'; }
    eq(g.kgN, kgN, 'body weight note ' + tag); eq(g.kgUse, kgUse, 'use button ' + tag);
    /* with no result the advanced notes were computed once with vol = null; with a result they were recomputed with it */
    eq(g.markN, markN, 'mark note ' + tag); eq(g.botN, botN, 'bottle note ' + tag); eq(g.dpdN, dpdN, 'doses note ' + tag);
    if (empty || hard) {
      if (g.body) fails.push('result visible but should be hidden ' + tag); if (g.big !== '—') fails.push('headline ' + g.big + ' should be a dash ' + tag);
      if (hard) eq(g.hint, hard, 'hard hint ' + tag); else if (g.hint) fails.push('unexpected hint "' + g.hint + '" ' + tag);
      if (g.mval !== '—') fails.push('sticky value ' + g.mval + ' ' + tag);
      continue;
    }
    /* visible result */
    if (!g.body) { fails.push('result hidden ' + tag); continue; }
    const mgTxt = f(mg_) + ' mg', dunit = du, tsp = vol_ / 5, sp_ = spoon(tsp);
    let big, sub, lab, tip, cp;
    if (mode === 'mgml') { big = fm(vol_ / VF[A.ru], A.dec) + ' ' + VN[A.ru]; sub = f(mg_ / MASS[du]) + ' ' + dunit + ' ÷ ' + f(str_) + ' mg per mL'; lab = 'Volume to measure'; tip = 'Measure ' + fm(vol_, A.dec) + ' mL (' + (sp_ || f(tsp) + ' tsp') + ') of the liquid: that is ' + mgTxt + ' at ' + f(str_) + ' mg per mL.'; cp = f(mg_ / MASS[du]) + ' ' + dunit + ' at ' + f(str_) + ' mg per mL = ' + fm(vol_, A.dec) + ' mL'; }
    else if (mode === 'mlmg') { big = fm(mg_, A.dec) + ' mg'; sub = f(vol_ / VF[vu]) + ' ' + VN[vu] + ' × ' + f(str_) + ' mg per mL'; lab = 'Amount of medicine'; tip = f(vol_) + ' mL of a liquid at ' + f(str_) + ' mg per mL holds ' + mgTxt + ' (' + f(mg_ / 0.001) + ' mcg).'; cp = f(vol_) + ' mL at ' + f(str_) + ' mg per mL = ' + fm(mg_, A.dec) + ' mg'; }
    else { big = fm(str_, A.dec) + ' mg per mL'; sub = f(mg_) + ' mg in ' + f(vol_) + ' mL = ' + f(str_ * 5) + ' mg per 5 mL'; lab = 'Strength'; tip = mgTxt + ' in ' + f(vol_) + ' mL is ' + f(str_) + ' mg per mL, the same as ' + f(str_ * 5) + ' mg per 5 mL.'; cp = f(mg_) + ' mg in ' + f(vol_) + ' mL = ' + fm(str_, A.dec) + ' mg per mL'; }
    /* vol display uses vTxt for mgml sub of mlmg: VOL name; check display of large exponent values separately through eq */
    eq(g.big, big, 'headline ' + tag); eq(g.sub, sub, 'sub ' + tag); eq(g.lab, lab, 'label ' + tag); eq(g.tip, tip, 'tip ' + tag); eq(g.copy, cp + ' (calcthis.co/mg-to-ml-calculator/)', 'copy text ' + tag); eq(g.mval, big, 'sticky ' + tag); eq(g.mlab, lab, 'sticky label ' + tag);
    /* warnings */
    const warn = [];
    if (vol_ < 0.1 && vol_ >= 1e-9 && mode !== 'strength') warn.push('This is under 0.1 mL. Check that your syringe has marks this fine, or ask a pharmacist.');
    if (vol_ > 1000) warn.push('This is more than 1 litre. Check the strength and the units.'); else if (vol_ > 60) warn.push('This is more than 60 mL, more than the largest syringe drawn here. Check the strength and the dose.');
    if (step && mode === 'mgml') { const k = Math.round(vol_ / step), mk = Math.round(k * step * 1e9) / 1e9, del = mk * str_, pct = (del - mg_) / mg_ * 100; if (mk <= 0) warn.push('The dose is less than one mark (' + f(step) + ' mL) on your syringe. Ask a pharmacist for a finer syringe.'); else warn.push('On a syringe with marks every ' + f(step) + ' mL, the nearest mark is ' + f(mk) + ' mL = ' + f(del) + ' mg (' + (Math.abs(pct) < 0.05 ? 'exactly the dose' : f(Math.abs(pct)) + '% ' + (pct > 0 ? 'more' : 'less') + ' than the dose') + ').'); }
    eq(g.warn, warn, 'warnings ' + tag);
    /* syringe */
    const wantN = A.syr === 'a' ? 'a' : +A.syr, size = sizeFor(vol_, wantN);
    if (vol_ >= 1e-9 && size) { if (!g.syrVis || !g.syr) fails.push('syringe missing ' + tag); else { eq(g.syr.size, size, 'syringe size ' + tag); if (Math.abs(g.syr.fw - Math.min(1, vol_ / size) * 218) > 0.02) fails.push('fill width ' + g.syr.fw + ' expected ' + (Math.min(1, vol_ / size) * 218).toFixed(2) + ' ' + tag); eq(g.syrCap, 'A ' + size + ' mL syringe, drawn to scale and filled to ' + f(vol_) + ' mL. Schematic: real syringes have their own marks, so read the marks on yours.', 'syringe caption ' + tag); } }
    else if (g.syrVis) fails.push('syringe shown but should not ' + tag);
    if (A.syr !== 'a' && size && size !== +A.syr) soft.push('The ' + A.syr + ' mL syringe size is ignored for now: the volume is ' + f(vol_) + ' mL, so a ' + size + ' mL syringe is drawn.');
    eq(g.hint, soft.length ? soft[0] : '', 'soft hint ' + tag);
    /* rule */
    const nz = nice(vol_), labs = []; for (let k = 0; k * nz.step <= nz.mx + 1e-9; k++) { const v = k * nz.step; labs.push(f(v) + ' mL' + f(v * str_) + ' mg|' + (k === 0 ? 'f' : (k * nz.step >= nz.mx - 1e-9 ? 'l' : ''))); }
    eq(g.rule, labs, 'rule labels ' + tag); if (Math.abs(g.band - Math.min(100, vol_ / nz.mx * 100)) > 0.01) fails.push('rule band ' + g.band + ' ' + tag);
    eq(g.ruleCap, 'Every mL of this liquid holds ' + f(str_) + ' mg, so ' + mgTxt + ' is ' + f(vol_) + ' mL.', 'rule caption ' + tag);
    /* tables */
    const amt = (x) => { const r = fm(x, A.dec), e = ex(x); return r + (e !== r ? 'exact ' + e : ''); };
    eq(g.units, VIDS.map((v) => [VL[v], amt(vol_ / VF[v])]), 'units ' + tag);
    eq(g.mass, [['micrograms (mcg)', amt(mg_ / 0.001)], ['milligrams (mg)', amt(mg_)], ['grams (g)', amt(mg_ / 1000)]], 'mass ' + tag);
    eq(g.strU, [['mg per mL', str_], ['mg per 5 mL', str_ * 5], ['mg per tsp (5 mL)', str_ * 5], ['mg per tbsp (15 mL)', str_ * 15], ['mcg per mL', str_ * 1000], ['g per L (same as mg per mL)', str_], ['mg per L', str_ * 1000], ['% (g per 100 mL)', str_ / 10]].map((r) => [r[0], fm(r[1], A.dec)]), 'strength table ' + tag);
    if (mode === 'strength') { if (g.tabVis) fails.push('table shown in strength mode ' + tag); }
    else {
      if (!g.tabVis) fails.push('table hidden ' + tag);
      else if (mode === 'mgml') { eq(g.tabH, 'mg to mL at ' + f(str_) + ' mg per mL', 'table heading ' + tag); eq(g.tab, [1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000].map((x) => [f(x) + ' mg', fm(x / str_, A.dec) + ' mL']), 'dose table ' + tag); }
      else { eq(g.tabH, 'mL to mg at ' + f(str_) + ' mg per mL', 'table heading ' + tag); eq(g.tab, [0.1, 0.25, 0.5, 1, 1.25, 2, 2.5, 5, 10, 15].map((x) => [f(x) + ' mL', fm(x * str_, A.dec) + ' mg']), 'volume table ' + tag); }
    }
  }

  /* ---------- 2. unit toggles convert valid numbers and leave bad ones ---------- */
  await ctx.fill(); await ctx.set('mmDose', '50'); await ctx.seg('mmDu', 'mcg'); eq(await ctx.eval('document.getElementById("mmDose").value'), '50000', 'mg to mcg'); await ctx.seg('mmDu', 'g'); eq(await ctx.eval('document.getElementById("mmDose").value'), '0.05', 'mcg to g'); runs++;
  await ctx.fill(); await ctx.set('mmDose', 'abc'); await ctx.seg('mmDu', 'mcg'); eq(await ctx.eval('document.getElementById("mmDose").value'), 'abc', 'bad stays'); await ctx.fill(); await ctx.set('mmDose', ''); await ctx.seg('mmDu', 'g'); eq(await ctx.eval('document.getElementById("mmDose").value'), '', 'empty stays'); runs++;
  await ctx.fill(); await ctx.set('mmSp', '5'); await ctx.seg('mmSpu', 'l'); eq(await ctx.eval('document.getElementById("mmSp").value'), '0.005', 'mL to L'); await ctx.seg('mmSpu', 'ml'); eq(await ctx.eval('document.getElementById("mmSp").value'), '5', 'L to mL'); runs++;
  await ctx.fill(); await ctx.set('mmVol', '10'); await ctx.set('mmVu', 'tsp'); eq(await ctx.eval('document.getElementById("mmVol").value'), '2', 'mL to tsp'); await ctx.set('mmVu', 'tbsp'); eq(await ctx.eval('document.getElementById("mmVol").value'), '0.666666667', 'tsp to tbsp'); runs++;
  await ctx.fill(); await ctx.set('mmSa', '250'); await ctx.seg('mmSu', 'g'); eq(await ctx.eval('document.getElementById("mmSa").value'), '0.25', 'strength mg to g'); runs++;

  await ctx.fill(); await ctx.set('mmKg', '10'); await ctx.set('mmWt', '20'); await ctx.seg('mmMode', 'mlmg'); await ctx.click('mmKgUse'); runs++;
  eq(JSON.parse(await ctx.eval('JSON.stringify({d:document.getElementById("mmDose").value,m:document.getElementById("mmMode").querySelector(".on").getAttribute("data-v"),b:document.getElementById("mmBig").textContent})')), { d: '200', m: 'mgml', b: '4 mL' }, 'use body-weight dose');
  await ctx.set('mmWt', '44'); await ctx.seg('mmWu', 'lb'); eq(await ctx.eval('document.getElementById("mmWt").value'), tr(44 / 0.45359237, 9), 'kg to lb on weight'); await ctx.seg('mmWu', 'kg'); eq(await ctx.eval('document.getElementById("mmWt").value'), '44', 'lb back to kg'); runs++;

  /* ---------- 3. presets and chips fill the label, editing the label clears the preset ---------- */
  const PRE = [['apap160', 160, 5], ['ibu100', 100, 5], ['ibu50', 50, 1.25], ['dph12', 12.5, 5], ['cet5', 5, 5], ['amx250', 250, 5], ['tc200', 200, 1], ['water', 1000, 1], ['honey', 1432.9, 1], ['milk', 1031.3, 1], ['flour', 507.2, 1], ['butter', 958.6, 1]];
  for (const [id, aa, pp] of PRE) {
    await ctx.fill(); await ctx.set('mmPre', id); runs++;
    const v = JSON.parse(await ctx.eval('JSON.stringify({a:document.getElementById("mmSa").value,p:document.getElementById("mmSp").value,pre:document.getElementById("mmPre").value})'));
    eq(v, { a: String(aa), p: pp === 1 ? '' : String(pp), pre: id }, 'preset ' + id);
    await ctx.set('mmSa', String(aa) + '1'); eq(await ctx.eval('document.getElementById("mmPre").value'), '', 'preset cleared after edit ' + id);
  }
  /* the label picker is the DS typeahead: full list on focus, typing filters, a click fills the label, emptying the text clears the pick, no match says so */
  await ctx.fill(); runs++;
  const TA = JSON.parse(await ctx.eval('(function(){var i=document.getElementById("mmPreIn"),l=document.getElementById("mmPreList");i.dispatchEvent(new Event("focus"));var all=l.querySelectorAll(".st-ta-opt").length,open=l.style.display!=="none";i.value="amox";i.dispatchEvent(new Event("input",{bubbles:true}));var f=[].map.call(l.querySelectorAll(".st-ta-opt"),function(b){return b.textContent.replace(/\\s+/g," ").trim();});return JSON.stringify({all:all,open:open,f:f});})()'));
  eq(TA.open, true, 'typeahead opens on focus'); eq(TA.all >= 55, true, 'typeahead lists every label and liquid (' + TA.all + ')');
  eq(TA.f, ['Amoxicillin125 mg per 5 mL', 'Amoxicillin200 mg per 5 mL', 'Amoxicillin250 mg per 5 mL', 'Amoxicillin400 mg per 5 mL'], 'typing amox filters');
  await ctx.eval('document.querySelector("#mmPreList .st-ta-opt").dispatchEvent(new MouseEvent("mousedown",{bubbles:true}))');
  eq(JSON.parse(await ctx.eval('JSON.stringify({a:mmSa.value,p:mmSp.value,pre:mmPre.value,t:mmPreIn.value})')), { a: '125', p: '5', pre: 'amx125', t: 'Amoxicillin · 125 mg per 5 mL' }, 'typeahead pick fills the label');
  await ctx.eval('(function(){var i=document.getElementById("mmPreIn");i.value="";i.dispatchEvent(new Event("input",{bubbles:true}));})()'); eq(await ctx.eval('mmPre.value'), '', 'emptying the text clears the pick');
  await ctx.eval('(function(){var i=document.getElementById("mmPreIn");i.value="zzz";i.dispatchEvent(new Event("input",{bubbles:true}));})()'); eq(await ctx.eval('!!document.querySelector("#mmPreList .st-ta-none")'), true, 'no match message');
  await ctx.eval('(function(){var i=document.getElementById("mmPreIn");i.value="12.5";i.dispatchEvent(new Event("input",{bubbles:true}));})()'); eq(await ctx.eval('document.querySelectorAll("#mmPreList .st-ta-opt").length >= 1'), true, 'typing a strength finds labels');
  await ctx.fill(); await ctx.eval('document.querySelector("#mmChips [data-v=\\"50\\"]").click()'); runs++;
  eq(JSON.parse(await ctx.eval('JSON.stringify({a:document.getElementById("mmSa").value,p:document.getElementById("mmSp").value})')), { a: '50', p: '' }, 'chip 50');

  /* ---------- 4. the saved list: add, add several, reload, remove, clear ---------- */
  await ctx.fill(); await ctx.click('mmSave'); runs++; const L = async () => JSON.parse(await ctx.eval('JSON.stringify({vis:document.getElementById("mmListWrap").style.display!=="none",rows:[].map.call(document.querySelectorAll("#mmList .mm-li-t"),function(e){return e.textContent.trim();})})'));
  eq((await L()).rows.length, 1, 'save adds one');
  await ctx.set('mmDose', '100'); await ctx.click('mmSave'); eq((await L()).rows, ['100 mg at 50 mg per mL = 2 mL', '50 mg at 50 mg per mL = 1 mL'], 'saved rows newest first');
  await ctx.eval('document.querySelector("#mmList .mm-li-t[data-i=\\"1\\"]").click()'); eq(await ctx.eval('document.getElementById("mmDose").value'), '50', 'reload a saved row'); eq(await ctx.text('mmBig'), '1 mL', 'reloaded result');
  await ctx.eval('document.querySelector("#mmList [data-x=\\"0\\"]").click()'); eq((await L()).rows.length, 1, 'remove one');
  await ctx.click('mmListClear'); eq((await L()).vis, false, 'clear list hides it');
  return { runs, fails };
};
