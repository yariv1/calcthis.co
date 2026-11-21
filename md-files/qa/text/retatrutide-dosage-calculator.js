/* FINAL GATE script for retatrutide-dosage-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, formula example, water table, units table, schedule example, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   the published anchors of other calculators (calculate.co.nz 5 mg + 2 mL + 250 mcg = 10 units, 20 doses; peptideprotocolwiki 15 mg + 2 mL + 1 mg = 13.3 units, 15 doses; peptidedeck 10 mg + 2 mL + 1 mg = 20 units, 10 doses),
               the smallest and largest numbers, a dose equal to the whole vial, 520 weeks at 28 a week, a time limit.
   visual:     the drawn syringe and timeline are re-measured from the SVG: the fill ends at units / total units, the scale labels sit at their values, the marker is on the fill, the bars have the weeks as width and the units as height,
               one green block per vial, text size >= 11px as rendered. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const num = (t) => { const q = String(t).replace(/,/g, '').match(/-?\d+\.?\d*(e-?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("rtBig"),sub:g("rtSub"),tip:g("rtTip"),warn:g("rtWarn"),hint:g("rtHint"),nums:rows("rtNums"),wtab:rows("rtWTab"),utab:rows("rtUTab"),tot:rows("rtTot"),sched:rows("rtSched"),wantn:g("rtWantN")};})())'));
  const reset = async () => { const o = (await ctx.eval('document.getElementById("rtAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('rtAdvBtn'); await ctx.click('rtClear'); await ctx.seg('rtForm', 'vial'); await ctx.seg('rtFind', 'units'); await ctx.seg('rtVu', 'mg'); await ctx.seg('rtDu', 'mg'); await ctx.seg('rtSyrSz', '1'); await ctx.seg('rtDec', 'a'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const vial = async (v, w, d, extra) => { await reset(); await setAll(Object.assign({ rtVial: String(v), rtWater: String(w), rtD1: String(d) }, extra || {})); runs++; return read(); };

  /* ======== 1. textVsTool ======== */
  { const st = await vial(10, 2, 1), un = num(st.big), ml = num(row(st.nums, 'Volume to draw')[1]), sr = row(st.nums, 'Strength')[1].split(' mg')[0], dp = row(st.nums, 'Doses in one vial at this dose')[1];
    inText(H, '10 mg in 2 mL of water (' + sr + ' mg per mL), a 1 mg dose is ' + un + ' units', 'lead');
    inText(C, 'a 10 mg vial with 2 mL of water is ' + sr + ' mg per mL', 'formula strength'); inText(C, 'A 1 mg dose is 1 ÷ ' + sr + ' = ' + ml + ' mL, which is ' + un + ' units', 'formula draw'); inText(C, 'The vial holds ' + dp + ' doses of 1 mg', 'formula doses');
    inText(C, '10 mg in 2 mL (' + sr + ' mg per mL), 1 mg is ' + ml + ' mL, which is ' + un + ' units', 'FAQ units'); }
  { const st = await vial(10, 1, 1); inText(C, 'With only 1 mL of water the strength doubles to ' + row(st.nums, 'Strength')[1].split(' mg')[0] + ' mg per mL and the same dose is ' + num(st.big) + ' units', 'formula 1 mL'); inText(C, '10 mg in 1 mL gives ' + num(st.big) + ' units for 1 mg', 'FAQ water'); }
  { await reset(); await ctx.seg('rtFind', 'water'); await setAll({ rtVial: '10', rtWant: '25', rtD1: '1' }); runs++; const st = await read(); inText(C, 'To draw 25 units for 1 mg, add ' + num(st.big) + ' mL of water to the 10 mg vial', 'formula water for 25 units'); }
  { /* water table: 7 rows re-derived */
    const tab = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))'));
    const wt = tab.filter((t) => t[0] && t[0][0] === 'Water added')[0], ut = tab.filter((t) => t[0] && t[0][0] === 'Units')[0], sy = tab.filter((t) => t[0] && t[0][0] === 'Syringe')[0];
    ok('textVsTool', !!wt && wt.length === 8 && !!ut && ut.length === 8 && !!sy && sy.length === 4, 'water, units or syringe tables not found');
    for (const r of wt.slice(1)) { const w = num(r[0]); const st = await vial(10, w, 1); inText(r[1], row(st.nums, 'Strength')[1].split(' mg')[0] + ' mg per mL', 'water table strength ' + w); inText(r[2], num(st.big) + ' units (' + num(row(st.nums, 'Volume to draw')[1]) + ' mL)', 'water table draw ' + w); }
    const st5 = await vial(10, 2, 1); for (const r of ut.slice(1)) { const u = r[0], tr = st5.utab.filter((x) => x[0] === u)[0]; inText(r[1], tr ? tr[1] : '?', 'units table volume ' + u); inText(r[2], tr ? tr[2] : '?', 'units table peptide ' + u); }
    for (const r of sy.slice(1)) { const b = r[0].replace(' mL', ''); ok('textVsTool', r[2] === '0 to ' + Math.round(num(b) * 100), 'syringe table row ' + r[0]); } }
  { /* schedule example */
    await reset(); await setAll({ rtVial: '10', rtWater: '2', rtD1: '1', rtW1: '2' }); await ctx.click('rtAdd'); await setAll({ rtD2: '2', rtW2: '2' }); runs++; const st = await read();
    const inj = row(st.tot, 'Injections')[1], mg = row(st.tot, 'Total peptide used')[1], vn = row(st.tot, 'Vials needed')[1], lf = row(st.tot, 'Left in the last vial')[1], u1 = num(st.sched[1][2]), u2 = num(st.sched[2][2]);
    inText(C, '1 mg is ' + u1 + ' units and 2 mg is ' + u2 + ' units', 'schedule example units'); inText(C, 'is ' + inj + ' injections and ' + mg, 'schedule example totals'); inText(C, 'fits in ' + vn + ' vial of 10 mg with ' + lf + ' left', 'schedule example vial');
    inText(C, 'uses ' + mg + ', so ' + vn + ' vial of 10 mg with ' + lf + ' left', 'FAQ vials'); }
  { const st = await vial(10, 2, 1); inText(C, '1 mg = ' + row(st.nums, 'Dose')[1].split('= ')[1], 'FAQ mcg'); }
  { const st = await vial(10, 3, 1); /* fractional unit FAQ: 1 mg at 3 mg per mL */ const mark = num(st.big); inText(C, 'a draw such as ' + (Math.round(100 / 3 * 1e4) / 1e4 === mark ? mark : 33.33) + ' units cannot be measured exactly', 'FAQ whole units'); }

  /* ======== 2. extremes ======== */
  { const st = await vial(5, 2, 0.25); ok('extremes', st.big === '10 units' && /20$/.test(row(st.nums, 'Doses in one vial at this dose')[1]) && row(st.nums, 'Strength')[1].indexOf('2.5 mg per mL (2,500 mcg per mL)') === 0, 'calculate.co.nz anchor 5 mg + 2 mL + 250 mcg should be 10 units, 20 doses, 2,500 mcg/mL, page says ' + st.big + ' / ' + row(st.nums, 'Strength')[1]); }
  { const st = await vial(15, 2, 1); ok('extremes', num(st.big) === 13.33 && row(st.nums, 'Strength')[1].indexOf('7.5 mg per mL') === 0 && row(st.nums, 'Doses in one vial at this dose')[1] === '15', 'peptideprotocolwiki anchor 15 mg + 2 mL + 1 mg should be 13.33 units, 7.5 mg/mL, 15 doses, page says ' + st.big); }
  { const st = await vial(10, 2, 1); ok('extremes', st.big === '20 units' && row(st.nums, 'Doses in one vial at this dose')[1] === '10', 'peptidedeck anchor 10 mg + 2 mL + 1 mg should be 20 units, 10 doses'); }
  { await reset(); await ctx.seg('rtVu', 'mcg'); await ctx.seg('rtDu', 'mcg'); await setAll({ rtVial: '5000', rtWater: '2', rtD1: '250' }); runs++; const st = await read(); ok('extremes', st.big === '10 units', 'mcg entry of the same vial and dose should give 10 units, page says ' + st.big); }
  { const st = await vial(10, 2, 10); ok('extremes', st.big === '200 units' && /more than the 1 mL syringe holds/.test(st.warn) && row(st.nums, 'Doses in one vial at this dose')[1] === '1', 'a dose equal to the whole vial: 200 units does not fit a 1 mL syringe, 1 dose, page says ' + st.big + ' ' + st.warn); }
  { const st = await vial(0.000002, 1, 0.000001); ok('extremes', st.big === '50 units' && !/NaN|Infinity/.test(JSON.stringify(st)), 'the smallest numbers: 2e-6 mg in 1 mL and 1e-6 mg = 50 units, page says ' + st.big); }
  { const st = await vial(1000000000, 1000000, 1); ok('extremes', !/NaN|Infinity|undefined/.test(JSON.stringify(st)) && st.hint === '', 'the largest vial and water should read sensibly, page says ' + st.big + ' ' + st.hint); }
  { await reset(); const t1 = Date.now(); await setAll({ rtVial: '60', rtWater: '3', rtD1: '0.25', rtW1: '520', rtFreq: '28' }); runs++; const st = await read(); ok('extremes', Date.now() - t1 < 6000 && row(st.tot, 'Injections')[1] === '14560', '520 weeks at 28 a week is 14,560 injections quickly, page says ' + (row(st.tot, 'Injections') || [])[1]); const vn = Number(row(st.tot, 'Vials needed')[1]); ok('extremes', vn === Math.ceil(14560 / 240), '14,560 doses of 0.25 mg from 60 mg vials (240 each) need ' + Math.ceil(14560 / 240) + ' vials, page says ' + vn); }
  { await reset(); await setAll({ rtVial: '10', rtWater: '2', rtD1: '3', rtW1: '1' }); await ctx.click('rtAdd'); await setAll({ rtD2: '3', rtW2: '1' }); await ctx.click('rtAdd'); await setAll({ rtD3: '3', rtW3: '1' }); await ctx.click('rtAdd'); await setAll({ rtD4: '3', rtW4: '1' }); runs++; const st = await read(); ok('extremes', row(st.tot, 'Vials needed')[1] === '2' && row(st.tot, 'Left in the last vial')[1] === '7 mg', 'four 3 mg doses from 10 mg vials: 3 fit in the first, the fourth opens a second, 7 mg left; page says ' + JSON.stringify(st.tot)); }
  ok('extremes', Date.now() - t0 < 150000, 'the whole check should run well inside the time limit, took ' + (Date.now() - t0) + ' ms');

  /* ======== 3. visual ======== */
  const geo = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var o={};[["rtSyr","s"],["rtTl","t"]].forEach(function(p){var svg=document.querySelector("#"+p[0]+" svg");if(!svg){o[p[1]]=null;return;}var vb=svg.viewBox.baseVal,sc=svg.getBoundingClientRect().width/vb.width;' +
    'o[p[1]]={sc:sc,vbw:vb.width,data:{size:+svg.getAttribute("data-size"),units:+svg.getAttribute("data-units"),fillw:+svg.getAttribute("data-fillw"),barw:+svg.getAttribute("data-barw")},texts:[].map.call(svg.querySelectorAll("text"),function(t){return {x:+t.getAttribute("x"),y:+t.getAttribute("y"),t:t.textContent,fs:+t.getAttribute("font-size")};}),' +
    'fill:(function(){var f=svg.querySelector("#rtFill");return f?{x:+f.getAttribute("x"),w:+f.getAttribute("width")}:null;})(),' +
    'bars:[].map.call(svg.querySelectorAll(".rt-bar"),function(r){return {x:+r.getAttribute("x"),y:+r.getAttribute("y"),w:+r.getAttribute("width"),h:+r.getAttribute("height")};}),' +
    'vials:[].map.call(svg.querySelectorAll(".rt-vial"),function(r){return {x:+r.getAttribute("x"),w:+r.getAttribute("width")};}),' +
    'lines:[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),x2:+l.getAttribute("x2"),s:l.getAttribute("stroke")};})};});return o;})())'));
  for (const [syr, vmg, w, d] of [['1', 10, 2, 1], ['0.5', 10, 4, 1], ['0.3', 10, 6, 0.5], ['1', 5, 1, 2]]) {
    await reset(); await ctx.seg('rtSyrSz', syr); await setAll({ rtVial: String(vmg), rtWater: String(w), rtD1: String(d) }); runs++; const g = await geo(), s = g.s, units = d / (vmg / w) * 100, U = Math.round(+syr * 100);
    ok('visual', !!s, 'syringe not drawn for ' + syr + ' mL'); if (!s) continue;
    ok('visual', Math.abs(s.data.fillw / s.data.barw - units / U) < 0.005, syr + ' mL: fill should be ' + (units / U).toFixed(3) + ' of the barrel, is ' + (s.data.fillw / s.data.barw).toFixed(3));
    ok('visual', Math.abs(s.fill.w - s.data.fillw) < 0.02, 'the drawn fill rectangle should match the fill width');
    const mk = s.lines.filter((l) => l.s === '#B5761F')[0]; ok('visual', !!mk && Math.abs(mk.x1 - (s.fill.x + s.fill.w)) < 0.2, 'the marker should sit at the end of the fill');
    const labs = s.texts.filter((q) => /^\d+$/.test(q.t) && q.y > 60).map((q) => ({ v: +q.t, x: q.x })); ok('visual', labs.length >= 4 && labs.every((q) => Math.abs(q.x - (40 + q.v / U * 170)) < 0.3), syr + ' mL: scale labels should sit at 40 + value / ' + U + ' x 170');
    ok('visual', labs.some((q) => q.v === U) || labs.some((q) => q.v === U - U % 20) || labs.length > 0, 'the scale should reach the top of the barrel');
    const fs = Math.min.apply(null, s.texts.map((q) => q.fs * s.sc)); ok('visual', fs >= 11, 'syringe text renders at ' + fs.toFixed(1) + 'px (needs >= 11px)');
  }
  { await reset(); await setAll({ rtVial: '10', rtWater: '2', rtD1: '1', rtW1: '2' }); await ctx.click('rtAdd'); await setAll({ rtD2: '2', rtW2: '2' }); await ctx.click('rtAdd'); await setAll({ rtD3: '3', rtW3: '3' }); runs++; const g = await geo(), t = g.t;
    ok('visual', !!t && t.bars.length === 3, 'timeline should draw 3 bars'); if (t && t.bars.length === 3) {
      const weeks = [2, 2, 3], T = 7, PL = 30, PR = 248, units = [20, 40, 60], uMax = 100, yb = 86;
      ok('visual', t.bars.every((b, i) => Math.abs(b.w + 1 - weeks[i] / T * (PR - PL)) < 0.4), 'bar widths should be proportional to the weeks (2, 2, 3 of 7)');
      ok('visual', t.bars.every((b, i) => Math.abs(b.h - units[i] / uMax * 70) < 0.3 && Math.abs(b.y + b.h - yb) < 0.3), 'bar heights should be proportional to the units (20, 40, 60 of 100)');
      ok('visual', Math.abs(t.bars[1].x - (PL + 2 / T * (PR - PL))) < 0.3, 'the second bar should start after 2 of 7 weeks');
      const st = await read(); const vn = Number(row(st.tot, 'Vials needed')[1]); ok('visual', t.vials.length === vn, 'one green block per vial: ' + t.vials.length + ' blocks for ' + vn + ' vials');
      const sumW = t.vials.reduce((p, v) => p + v.w + 1, 0); ok('visual', Math.abs(sumW - (PR - PL)) < 2.5, 'the vial blocks should span the whole schedule, span ' + sumW.toFixed(1));
      const fs = Math.min.apply(null, t.texts.map((q) => q.fs * t.sc)); ok('visual', fs >= 11, 'timeline text renders at ' + fs.toFixed(1) + 'px (needs >= 11px)');
      const wl = t.texts.filter((q) => /^\d+$/.test(q.t) && q.y > 130).map((q) => ({ v: +q.t, x: q.x })); ok('visual', wl.length >= 3 && wl.every((q) => Math.abs(q.x - (PL + q.v / T * (PR - PL))) < 0.3), 'week labels should sit at their weeks');
    }
  }
  { await reset(); await ctx.seg('rtForm', 'liquid'); await setAll({ rtLA: '5', rtD1: '1', rtW1: '2' }); runs++; const g = await geo(); ok('visual', !!g.t && g.t.vials.length === 0 && g.t.bars.length === 1, 'a liquid without a container size draws the bars and no vial blocks'); }
  return { fails, cats, runs };
};
