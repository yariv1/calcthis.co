/* ORACLE for dilution-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.dilutionEngine). Strength families (mass in mg/L with % = g per 100 mL, molar in M, fold), volume units in mL (NIST), C1 V1 = C2 V2, the ratio reader
   (1:10, 2:30, 1 in 10, 10x, plain number by the choice), the three volumes to know, the volumes-used mode, extra volume, and every note, hint, table row, drawing attribute and the flask legend are rebuilt here and compared with what the page DISPLAYS
   (QA item 19: every field reacts). */
module.exports = async function (ctx) {
  let s = 20261122; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0;
  const SU = { pct: [10000, 'm', '%'], gl: [1000, 'm', 'g/L'], mgml: [1000, 'm', 'mg/mL'], mgl: [1, 'm', 'mg/L'], ppm: [1, 'm', 'ppm'], ugml: [1, 'm', 'µg/mL'], ugl: [0.001, 'm', 'µg/L'], ppb: [0.001, 'm', 'ppb'], M: [1, 'o', 'M'], mM: [1e-3, 'o', 'mM'], uM: [1e-6, 'o', 'µM'], nM: [1e-9, 'o', 'nM'], pM: [1e-12, 'o', 'pM'], fM: [1e-15, 'o', 'fM'], x: [1, 'x', '×'] };
  const FAMN = { m: 'mg/L', o: 'M', x: '×' };
  const VU = { ul: [0.001, 'µL', 'µL'], ml: [1, 'mL', 'mL'], l: [1000, 'L', 'L'], tsp: [4.92892159375, 'tsp', 'teaspoon (US)'], tbsp: [14.78676478125, 'tbsp', 'tablespoon (US)'], usfloz: [29.5735295625, 'US fl oz', 'US fl oz'], cup: [236.5882365, 'cups', 'US cup'], uspt: [473.176473, 'US pt', 'US pint'], usqt: [946.352946, 'US qt', 'US quart'], usgal: [3785.411784, 'US gal', 'US gallon'], ukfloz: [28.4130625, 'UK fl oz', 'UK fl oz'], ukpt: [568.26125, 'UK pt', 'UK pint'], ukgal: [4546.09, 'UK gal', 'UK gallon'] };
  const SIDS = Object.keys(SU), VIDS = Object.keys(VU), UT = ['ml', 'l', 'tsp', 'tbsp', 'usfloz', 'cup'], BATCH = [1, 2, 3, 4, 5, 9, 10, 19, 20, 49, 50, 99, 100];
  const grp = (t) => { const p = String(t).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); };
  const trz = (t) => t.indexOf('.') >= 0 ? t.replace(/0+$/, '').replace(/\.$/, '') : t;
  const sig = (x, n) => { if (!isFinite(x)) return '—'; if (x === 0) return '0'; const ax = Math.abs(x); if (ax < 1e-4 || ax >= 1e12) return String(parseFloat(x.toPrecision(n)).toExponential()).replace('e+', 'e'); const e = Math.floor(Math.log10(ax) + 1e-12), d = Math.max(0, Math.min(12, n - 1 - e)); return grp(trz(x.toFixed(d))); };
  const f = (x) => sig(x, 4), fm = (x, dec) => dec === 'a' ? sig(x, 4) : (isFinite(x) ? grp(x.toFixed(+dec)) : '—');
  const nm = (t) => { t = String(t).trim().replace(/\s/g, ''); if (!t) return null; if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, ''); else if (/^[+-]?\d*,\d+$/.test(t)) t = t.replace(',', '.'); else t = t.replace(/,/g, ''); if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN; return parseFloat(t); };
  const pos = (t) => { const n = nm(t); if (n === null) return { e: 1 }; if (isNaN(n) || n <= 0) return { b: 1 }; return { v: n }; };
  const rdS = (t, u) => { const r = pos(t); if (!r.v) return r; const b = r.v * SU[u][0]; if (b < 1e-18 || b > 1e18) return { b: 1 }; return { v: r.v, base: b, fam: SU[u][1] }; };
  const rdV = (t, u) => { const r = pos(t); if (!r.v) return r; const ml = r.v * VU[u][0]; if (ml < 1e-6 || ml > 1e9) return { b: 1 }; return { v: r.v, ml }; };
  const ratio = (text, rs) => {
    const t = String(text).trim().toLowerCase().replace(/×/g, 'x').replace(/\s+/g, ' '); if (!t) return { e: 1 };
    const N = '(\\d+\\.?\\d*|\\.\\d+)'; let m, F = null;
    if ((m = new RegExp('^' + N + ' ?: ?' + N + '$').exec(t))) { const a = parseFloat(m[1]), b = parseFloat(m[2]); if (a > 0 && b > 0) F = (a + b) / a; }
    else if ((m = new RegExp('^1 in ' + N + '$').exec(t))) F = parseFloat(m[1]);
    else if ((m = new RegExp('^' + N + ' ?(x|fold|times)$').exec(t))) F = parseFloat(m[1]);
    else if ((m = new RegExp('^' + N + '$').exec(t))) { const a = parseFloat(m[1]); if (a > 0) F = rs === 'f' ? a : 1 + a; }
    if (F === null || !isFinite(F) || F <= 1 || F > 1e9) return { b: 1 };
    return { F, r: F - 1 };
  };
  const rd = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(id){return [].map.call(document.querySelectorAll("#"+id+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'var head=function(id){return [].map.call(document.querySelectorAll("#"+id+" thead th"),function(c){return c.textContent.replace(/\\s+/g," ").trim();});};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none";};var svg=document.getElementById("dlFlaskSvg"),bd=document.querySelector("#dlBar .mm-band");' +
    'return {big:g("dlBig"),lab:g("dlLab"),sub:g("dlSub"),body:vis("dlBody"),tip:g("dlTip"),hint:vis("dlHint")?g("dlHint"):"",c1N:g("dlC1N"),c2N:g("dlC2N"),ratN:g("dlRatN"),vN:g("dlVN"),vcN:g("dlVcN"),vwN:g("dlVwN"),xN:g("dlXN"),legend:g("dlLegend"),' +
    'steps:[].map.call(document.querySelectorAll("#dlSteps li"),function(l){return l.textContent.trim();}),barCap:g("dlBarCap"),band:bd?parseFloat(bd.style.width):null,flask:svg?{vc:+svg.getAttribute("data-vc"),vw:+svg.getAttribute("data-vw"),hc:+svg.getAttribute("data-hc"),hw:+svg.getAttribute("data-hw")}:null,' +
    'eq:rows("dlEq"),units:rows("dlUnits"),batch:rows("dlBatch"),batchHead:head("dlBatch"),batchVis:vis("dlBatchWrap"),batchH:g("dlBatchH"),copy:g("dlCopyTxt"),mval:g("dlMVal"),mlab:g("dlMLab"),flaskLabel:svg?svg.getAttribute("aria-label"):""};})())'));
  const eq = (got, want, tag) => { if (JSON.stringify(got) !== JSON.stringify(want)) { fails.push(tag + ' got [' + JSON.stringify(got).slice(0, 320) + '] expected [' + JSON.stringify(want).slice(0, 320) + ']'); return false; } return true; };

  const C1P = ['10', '1', '5', '100', '0.5', 'abc', '', '0', '2,000', '1000000', '0.0000001', '50', '2'], C2P = ['1', '0.1', '5', '10', '20', '100', 'abc', '', '0', '0.001', '1000000000', '50', '2'];
  const RP = ['1:10', '1 in 10', '10x', '10×', '5', '1:3', '2:30', '1:0', '0', 'abc', '', '1 in 1', '1x', '10 fold', '1.5 times', '3:1', '1:100', '1,000', '4', '1 : 4'];
  const VP = ['1000', '500', '2.5', '0', 'abc', '', '1,000', '0.0000001', '2000000000', '5', '250'], VCP = ['100', '25', '0', 'abc', '', '0.5', '40'], VWP = ['900', '75', '0', 'abc', '', '1000000', '160'], XP = ['', '', '10', '0', '5', 'abc', '2000', '-1', '1000', '2.5'];
  for (let i = 0; i < 260; i++) {
    const how = pick(['str', 'str', 'rat', 'vol']), u1 = pick(R() < 0.7 ? ['pct', 'mgml', 'gl', 'ppm', 'M', 'mM', 'x'] : SIDS), u2 = pick(R() < 0.6 ? [u1, u1, 'ppm', 'mgl', 'uM', 'x'] : SIDS), rs = pick(['r', 'f']), vk = pick(['final', 'final', 'conc', 'water']);
    const vu = pick(R() < 0.6 ? ['ml', 'l', 'cup', 'usgal'] : VIDS), vcu = pick(R() < 0.6 ? ['ml', 'l'] : VIDS), vwu = pick(R() < 0.6 ? ['ml', 'l'] : VIDS), dec = pick(['a', 'a', '2', '3', '4']), adv = R() < 0.5;
    const c1 = pick(C1P), c2 = pick(C2P), rt = pick(RP), v = pick(VP), vc = pick(VCP), vw = pick(VWP), xx = pick(XP);
    await ctx.fill(); if (adv) await ctx.click('dlAdvBtn');
    await ctx.seg('dlHow', how); await ctx.seg('dlRs', rs); await ctx.set('dlU1', u1); await ctx.set('dlU2', u2); await ctx.set('dlVk', vk); await ctx.set('dlVu', vu); await ctx.set('dlVcu', vcu); await ctx.set('dlVwu', vwu);
    if (adv) { await ctx.seg('dlDec', dec); await ctx.set('dlX', xx); }
    await ctx.set('dlC1', c1); await ctx.set('dlC2', c2); await ctx.set('dlRat', rt); await ctx.set('dlV', v); await ctx.set('dlVc', vc); await ctx.set('dlVw', vw);
    const A = adv ? { dec, xx } : { dec: 'a', xx: '' };
    runs++; const tag = JSON.stringify({ how, u1, u2, rs, vk, vu, vcu, vwu, c1, c2, rt, v, vc, vw, adv, A });
    const g = await rd();
    const s1 = rdS(c1, u1), s2 = rdS(c2, u2), rr = ratio(rt, rs), vv = rdV(v, vu), vcc = rdV(vc, vcu), vww = rdV(vw, vwu), xr = nm(A.xx);
    const xEmpty = xr === null, xOk = xEmpty || !(isNaN(xr) || xr < 0 || xr > 1000), e = (!xEmpty && xOk) ? xr : 0, famOk = !!(s1.fam && s2.fam && s1.fam === s2.fam);
    const echo = (r) => 'That is ' + f(r.base) + ' ' + FAMN[r.fam];
    eq(g.c1N, s1.e ? (how === 'str' ? 'Type the strength of the concentrate you have, in the unit next to it.' : 'Optional. Type the strength of the concentrate to see the strength you end up with.') : (s1.b ? 'Use numbers only, for example 10 or 0.5.' : echo(s1)), 'c1 note ' + tag);
    eq(g.c2N, s2.e ? 'Type the strength you want to end up with, in the same kind of unit.' : (s2.b ? 'Use numbers only, for example 1 or 0.05.' : echo(s2) + (s1.base && famOk ? ' = ' + f(s2.base / s1.base * 100) + '% of the strength you have' : '')), 'c2 note ' + tag);
    eq(g.ratN, rr.e ? 'Type it as you read it: 1:10, 1 in 10, 10x, or a number read as the choice on the right.' : (rr.b ? 'Could not read that. Try 1:10, 1 in 10, 10x or a number above 0.' : '1 : ' + f(rr.r) + ' means 1 part concentrate + ' + f(rr.r) + ' parts water = ' + f(rr.F) + ' parts, a factor of ' + f(rr.F) + ' (1 in ' + f(rr.F) + ')'), 'ratio note ' + tag);
    const vt0 = (r, who) => r.e ? who : (r.b ? 'Use numbers only, for example 100 or 2.5.' : f(r.ml) + ' mL = ' + f(r.ml / 1000) + ' L = ' + f(r.ml / 29.5735295625) + ' US fl oz');
    eq(g.vN, vt0(vv, vk === 'final' ? 'Type how much of the diluted liquid you want to make.' : (vk === 'conc' ? 'Type how much concentrate you have.' : 'Type how much water you have.')), 'volume note ' + tag);
    eq(g.vcN, vt0(vcc, 'Type how much concentrate you used.'), 'concentrate note ' + tag); eq(g.vwN, vt0(vww, 'Type how much water you added.'), 'water note ' + tag);
    const xFinal = how !== 'vol' && vk === 'final'; let xN;
    if (xEmpty) xN = 'Optional. Make this much extra to cover what sticks to the container, in %.'; else if (!xOk) xN = 'Use a number of 0 or more, up to 1,000.'; else if (!xFinal) xN = 'The extra volume applies when you give the final volume.'; else if (!e) xN = 'The extra is 0%, so nothing is added.'; else if (vv.ml) xN = 'Includes ' + f(e) + '% extra: ' + f(vv.ml * (1 + e / 100) / VU[vu][0]) + ' ' + VU[vu][1] + ' made, ' + f(vv.ml / VU[vu][0]) + ' ' + VU[vu][1] + ' to use.'; else xN = 'Type the final volume first, then the extra is added to it.';
    eq(g.xN, xN, 'extra note ' + tag);
    /* required fields */
    let hard = null, empty = false, F, V, Vc, Vw;
    if (how === 'str') {
      if (s1.e) empty = true; else if (s1.b) hard = ['The strength you have should be a number above 0.']; else if (s2.e) empty = true; else if (s2.b) hard = ['The strength you need should be a number above 0.'];
      else if (!famOk) hard = ['The two strengths are in different kinds of units (mass, molar or ×). Use the same kind.']; else if (s2.base > s1.base) hard = ['The target is stronger than the concentrate. Adding water can only make it weaker.']; else if (s2.base === s1.base) hard = ['The target is the same as the concentrate, so there is nothing to dilute.'];
      else { F = s1.base / s2.base; if (F > 1e9) hard = ['That is a dilution of more than a billion times. Check the strengths and the units.']; }
    } else if (how === 'rat') { if (rr.e) empty = true; else if (rr.b) hard = ['Could not read the dilution. Try 1:10, 1 in 10, 10x or a number above 0.']; else F = rr.F; }
    if (!empty && !hard) {
      if (how === 'vol') { if (vcc.e) empty = true; else if (vcc.b) hard = ['The concentrate volume should be a number above 0 (up to 1,000,000,000 mL).']; else if (vww.e) empty = true; else if (vww.b) hard = ['The water volume should be a number above 0 (up to 1,000,000,000 mL).']; else { Vc = vcc.ml; Vw = vww.ml; V = Vc + Vw; F = V / Vc; } }
      else { if (vv.e) empty = true; else if (vv.b) hard = ['The volume should be a number above 0 (up to 1,000,000,000 mL).']; else if (vk === 'final') { V = vv.ml * (1 + e / 100); Vc = V / F; Vw = V - Vc; } else if (vk === 'conc') { Vc = vv.ml; V = Vc * F; Vw = V - Vc; } else { Vw = vv.ml; Vc = Vw / (F - 1); V = Vc * F; } }
    }
    if (empty || hard) {
      if (g.body) fails.push('result visible but should be hidden ' + tag); if (g.big !== '—') fails.push('headline ' + g.big + ' should be a dash ' + tag);
      if (hard) eq(g.hint, hard[0], 'hard hint ' + tag); else if (g.hint) fails.push('unexpected hint "' + g.hint + '" ' + tag);
      if (g.mval !== '—') fails.push('sticky ' + g.mval + ' ' + tag); continue;
    }
    if (!g.body) { fails.push('result hidden ' + tag); continue; }
    /* soft hints */
    const soft = []; if (how !== 'str' && s1.b) soft.push('Strength of the concentrate: use a number above 0. It is ignored for now.'); if (!xEmpty && !xOk) soft.push('Extra: use a number of 0 or more (up to 1,000). It is ignored for now.');
    eq(g.hint, soft.length ? soft[0] : '', 'soft hint ' + tag);
    const u = how === 'vol' ? vcu : vu, uf = VU[u][0], un = VU[u][1], r = F - 1, ok1 = how === 'str' ? s1 : (s1.v ? s1 : null), fs = ok1 ? ok1.v / F : null, fsTxt = fs ? f(fs) + ' ' + SU[u1][2] : '';
    const vt = (x) => fm(x / uf, A.dec) + ' ' + un; let big, sub, tip, lab;
    if (how === 'vol') { lab = 'Dilution made'; big = '1 : ' + f(r); sub = vt(Vc) + ' of concentrate + ' + vt(Vw) + ' of water = ' + vt(V) + ' · ' + f(F) + '× weaker'; tip = 'You made ' + vt(V) + ': ' + f(F) + ' times weaker than the concentrate' + (fs ? ', ' + fsTxt : '') + '.'; }
    else { lab = 'Concentrate to use'; big = vt(Vc); sub = '+ ' + vt(Vw) + ' of water = ' + vt(V) + ' · 1 : ' + f(r) + ' · ' + f(F) + '× weaker'; tip = 'Add ' + vt(Vc) + ' of the concentrate to ' + vt(Vw) + ' of water to make ' + vt(V) + (fs ? ' at ' + fsTxt : '') + '.'; }
    eq(g.big, big, 'headline ' + tag); eq(g.sub, sub, 'sub ' + tag); eq(g.lab, lab, 'label ' + tag); eq(g.tip, tip, 'tip ' + tag); eq(g.mval, big, 'sticky ' + tag); eq(g.mlab, lab, 'sticky label ' + tag);
    eq(g.legend, 'Concentrate ' + vt(Vc) + ' (' + f(100 / F) + '%)Water ' + vt(Vw) + ' (' + f(100 - 100 / F) + '%)', 'legend ' + tag);
    eq(g.barCap, 'The diluted liquid keeps ' + f(100 / F) + '% of the concentrate’s strength (' + f(F) + '× weaker).', 'bar caption ' + tag); if (Math.abs(g.band - 100 / F) > 0.001) fails.push('bar band ' + g.band + ' expected ' + (100 / F) + ' ' + tag);
    eq(g.steps, ['Put most of the water (' + vt(Vw) + ' in all) into a container that holds at least ' + vt(V) + '.', 'Add the ' + vt(Vc) + ' of concentrate to the water, slowly, stirring.', 'Top up with water to the ' + vt(V) + ' mark and stir well.'], 'steps ' + tag);
    const H = 136, hc = Vc / V * H; if (!g.flask || Math.abs(g.flask.hc - hc) > 0.006 || Math.abs(g.flask.hw - (H - hc)) > 0.006 || Math.abs(g.flask.vc - Vc) > Math.abs(Vc) * 1e-9 || Math.abs(g.flask.vw - Vw) > Math.abs(Vw) * 1e-9) fails.push('flask ' + JSON.stringify(g.flask) + ' expected hc ' + hc.toFixed(2) + ' ' + tag);
    eq(g.eq, [['Ratio (concentrate : water)', '1 : ' + f(r)], ['Dilution factor', f(F) + '× weaker (1 in ' + f(F) + ')'], ['Concentrate, share of the final volume', f(100 / F) + ' %'], ['Water, share of the final volume', f(100 - 100 / F) + ' %']], 'equivalents ' + tag);
    eq(g.units, UT.map((id) => [VU[id][2], fm(Vc / VU[id][0], A.dec) + ' + ' + fm(Vw / VU[id][0], A.dec) + ' = ' + fm(V / VU[id][0], A.dec)]), 'units ' + tag);
    if (how === 'vol') { if (g.batchVis) fails.push('batch shown in volumes mode ' + tag); }
    else {
      if (!g.batchVis) fails.push('batch hidden ' + tag);
      else { eq(g.batchH, 'The same ' + vt(V) + ' at other strengths (amounts in ' + un + ')', 'batch heading ' + tag); eq(g.batchHead, ['Ratio', 'Concentrate', 'Water'].concat(ok1 && ok1.v ? ['Strength (' + SU[u1][2] + ')'] : []), 'batch header ' + tag); eq(g.batch, BATCH.map((q) => { const row = ['1 : ' + q, fm(V / (1 + q) / uf, A.dec), fm(V * q / (1 + q) / uf, A.dec)]; if (ok1 && ok1.v) row.push(f(ok1.v / (1 + q))); return row; }), 'batch rows ' + tag); }
    }
    const cp = how === 'vol' ? vt(Vc) + ' of concentrate + ' + vt(Vw) + ' of water = ' + vt(V) + ' (1 : ' + f(r) + ')' : 'Mix ' + vt(Vc) + ' of concentrate with ' + vt(Vw) + ' of water = ' + vt(V) + ' (1 : ' + f(r) + (fs ? ', ' + fsTxt : '') + ')';
    eq(g.copy, cp + ' (calcthis.co/dilution-calculator/)', 'copy ' + tag);
  }

  /* ---------- batch rows switch to ratio mode, clear fields ---------- */
  await ctx.fill(); runs++; await ctx.eval('document.querySelector("#dlBatch tr[data-r=\\"9\\"]").click()');
  eq(JSON.parse(await ctx.eval('JSON.stringify({how:document.getElementById("dlHow").querySelector(".on").getAttribute("data-v"),rat:dlRat.value,big:dlBig.textContent})')), { how: 'rat', rat: '1:9', big: '100 mL' }, 'batch row sets the ratio');
  await ctx.click('dlClear'); eq(JSON.parse(await ctx.eval('JSON.stringify({c1:dlC1.value,c2:dlC2.value,rat:dlRat.value,v:dlV.value,big:dlBig.textContent})')), { c1: '', c2: '', rat: '', v: '', big: '—' }, 'clear fields');
  return { runs, fails };
};
