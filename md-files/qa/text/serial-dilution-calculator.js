/* FINAL GATE script for serial-dilution-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, series table, common-series table, half-log, from-X-to-Y, plate-count example, error spread, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   closed-form anchors (Cn = C0 x (1/DF)^n, the lab manual plate count, transfer/total and ratio forms equal the fold form, from X to Y, own list, backwards plan 111 / 110 / 100 uL,
               replicates and loss, the smallest-pipette flag), n = 1 and n = 30, huge and tiny stocks, a time limit.
   visual:     the drawn tubes are re-measured from the SVG: one tube per step plus the stock, the concentration written on each tube and its colour strength, liquid level = volume made, the stock tube,
               rows wrap after 5 tubes, labels sit at their cells, the drawing is capped at 9 tubes, text size >= 11px as rendered. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const num = (t) => { const q = String(t).replace(/,/g, '').match(/-?\d+\.?\d*(e-?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("sdBig"),sub:g("sdSub"),tip:g("sdTip"),warn:g("sdWarn"),hint:g("sdHint"),tab:rows("sdTab"),nums:rows("sdNums"),cb:g("sdCb"),cbn:g("sdCbN"),flags:[].map.call(document.querySelectorAll("#sdTab tr.sd-flag"),function(r){return r.getAttribute("data-t");})};})())'));
  const reset = async () => { const o = (await ctx.eval('document.getElementById("sdAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('sdAdvBtn'); await ctx.click('sdClear'); await ctx.seg('sdMode', 'factor'); await ctx.seg('sdFt', 'fold'); await ctx.set('sdVu', 'ul'); await ctx.seg('sdFm', 'a'); await ctx.seg('sdPu', 'ul'); await ctx.set('sdUnit', 'cfuml'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const U = ' CFU/mL', strip = (x) => String(x).replace(U, '');
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const ser = async (stock, F, n, extra) => { await reset(); await setAll(Object.assign({ sdStock: String(stock), sdFactor: String(F), sdN: String(n) }, extra || {})); runs++; return read(); };
  const tubesOf = (st) => st.tab.slice(2).map((r) => strip(r[1]));

  /* ======== 1. textVsTool ======== */
  { const st = await ser(1000000, 10, 6, { sdVol: '100' }), td = (st.sub.match(/total dilution ([\d,]+)×/) || [])[1], conc = tubesOf(st);
    inText(H, 'For a stock of 1,000,000, a tenfold factor and 6 tubes, tube 6 is ' + strip(st.big) + ', a total dilution of ' + td + '×', 'lead');
    inText(C, 'a stock of 1,000,000 diluted 10-fold in 6 tubes gives ' + conc.join(', '), 'worked example tubes'); inText(C, 'the tubes are ' + conc.join(', '), 'FAQ tubes');
    inText(C, 'The last tube is ' + td + ' times weaker than the stock', 'FAQ total');
    const tbl = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))')), series = tbl.filter((t) => t[0] && t[0][0] === 'Tube')[0], fac = tbl.filter((t) => t[0] && t[0][0] === 'Factor per step')[0];
    ok('textVsTool', !!series && series.length === 7 && !!fac && fac.length === 5, 'series or factor table not found');
    for (let i = 1; i <= 6; i++) { const t = st.tab[i + 1], c = series[i]; inText(c[1], strip(t[1]), 'series table conc ' + i); ok('textVsTool', c[2] === t[2], 'series table pipette ' + i + ': page [' + c[2] + '] tool [' + t[2] + ']'); }
    const sn = row(st.nums, 'Stock needed in total')[1], dn = row(st.nums, 'Diluent needed in total')[1];
    inText(C, 'The whole series needs ' + sn + ' of stock and ' + dn + ' of diluent', 'series totals');
    { const m6 = st.tab[7][2].match(/^([\d.,]+ µL) of tube 5 \+ ([\d.,]+ µL) diluent = ([\d.,]+ µL)$/) || [], m5 = st.tab[6][2].match(/= ([\d.,]+ µL)$/) || [], m1 = st.tab[2][2].match(/= ([\d.,]+ µL)$/) || []; inText(C, 'tube 6 takes ' + m6[1] + ' and ' + m6[2] + ' of diluent', 'FAQ take and diluent'); inText(C, 'tube 5 makes ' + m5[1] + ' and tube 1 makes ' + m1[1] + '. The stock needed for the whole series is ' + sn, 'FAQ backwards'); }
    inText(C, 'To end with 100 µL in a tenfold series', 'FAQ volume'); }
  { const ftab = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))')).filter((t) => t[0] && t[0][0] === 'Factor per step')[0];
    for (const r of ftab.slice(1)) { const F = num(r[0]), st = await ser(1000000, F, 6), td = (st.sub.match(/total dilution ([\d,.e+-]+)×/) || [])[1]; inText(r[1], '1 : ' + (F - 1), 'factor table ratio ' + F); inText(r[2], strip(st.big), 'factor table last tube ' + F); inText(r[3], td + '×', 'factor table total ' + F); } }
  { const st = await ser(1000000, Math.sqrt(10), 4); inText(C, 'A half-log series uses a factor of √10 = 3.162: ' + tubesOf({ tab: st.tab }).join(', ') + ' for four tubes', 'half-log'); }
  { await reset(); await ctx.seg('sdMode', 'range'); await setAll({ sdStock: '1000', sdFrom: '1000', sdTo: '1', sdFactor: '10' }); runs++; const a = await read(); const nA = a.tab.length - 2; await ctx.set('sdFactor', ''); await ctx.set('sdN', '4'); runs++; const b = await read(), fx = (b.sub.match(/([\d.]+)× each step/) || [])[1];
    inText(C, 'With 1,000 to 1 and a factor of 10 you need ' + nA + ' tubes; with 4 tubes the factor is ' + fx, 'FAQ range'); inText(C, 'From 1,000 down to 1 with a factor of 10 takes ' + nA + ' tubes; with 4 tubes the factor is ' + fx, 'range section'); }
  { const st = await ser(1, 10, 6, { sdCnt: '32', sdPlate: '200' }); inText(C, '32 colonies from 200 µL of a 10−6 tube is ' + (st.cbn.match(/= ([\d,.]+) per mL in tube 6/) || [])[1] + ' per mL, so the original has ' + st.cb.replace(' per mL', '') + ' per mL', 'plate example');
    inText(C, '32 ÷ 0.2 = ' + (st.cbn.match(/= ([\d,.]+) per mL in tube 6/) || [])[1] + ' per mL', 'plate division'); inText(C, 'per mL in the original', 'plate original'); }
  { const st = await ser(1000000, 10, 6, { sdErr: '2' }), r = st.nums.filter((x) => x[0].indexOf('with ±2% per step') > 0)[0], m = (r && r[1].match(/worst case ±([\d.]+)%, typical ±([\d.]+)%/)) || [];
    inText(C, 'With 2% per step, 6 steps give about ±' + m[2] + '% for independent errors and at most ±' + m[1] + '%', 'error section'); inText(C, '6 steps give about ±' + m[2] + '% if the errors are independent and at most ±' + m[1] + '%', 'FAQ error'); }

  /* ======== 2. extremes ======== */
  { const st = await ser(1000000, 10, 6); ok('extremes', st.big === '1' + U && /total dilution 1,000,000×/.test(st.sub), 'tube 6 of a tenfold series from 1e6 should be 1, page says ' + st.big + ' ' + st.sub); }
  { const st = await ser(100, 2, 8); ok('extremes', st.big === '0.3906' + U, 'Cn = C0 x (1/DF)^n: 100 / 2^8 = 0.3906, page says ' + st.big); }
  { const st = await ser(1, 10, 6, { sdCnt: '32', sdPlate: '200', sdTubeN: '6' }); ok('extremes', st.cb === '160,000,000 per mL', 'lab manual example: 32 colonies, 200 uL of 10^-6 gives 1.6e8 per mL, page says ' + st.cb); }
  { await reset(); await ctx.seg('sdFt', 'tv'); await setAll({ sdStock: '1000000', sdT: '100', sdV: '1000', sdN: '6' }); runs++; const a = await read(), b = await ser(1000000, 10, 6); ok('extremes', a.big === b.big && a.sub === b.sub, 'transfer 100 into 1,000 total should equal a tenfold factor, page says ' + a.big + ' vs ' + b.big); }
  { await reset(); await ctx.seg('sdFt', 'ratio'); await setAll({ sdStock: '1000000', sdFactor: '9', sdN: '6' }); runs++; const a = await read(); ok('extremes', a.big === '1' + U, 'ratio 1:9 is a tenfold factor, last tube 1, page says ' + a.big); }
  { await reset(); await ctx.seg('sdMode', 'range'); await setAll({ sdStock: '1000', sdFrom: '1000', sdTo: '1', sdN: '4' }); runs++; const a = await read(); ok('extremes', tubesOf(a).join('|') === '1,000|100|10|1', 'from 1000 to 1 in 4 tubes is 1,000 100 10 1, page says ' + tubesOf(a).join(' ')); ok('extremes', /10× each step/.test(a.sub), 'from 1000 to 1 in 4 tubes is tenfold each, page says ' + a.sub); }
  { await reset(); await ctx.seg('sdMode', 'list'); await setAll({ sdStock: '1000000', sdList: '100000, 10000, 1000, 100, 10, 1' }); runs++; const a = await read(), b = await ser(1000000, 10, 6); ok('extremes', a.big === b.big && a.sub === b.sub, 'an own list equal to the tenfold series should give the same last tube, page says ' + a.sub + ' vs ' + b.sub); }
  { const st = await ser(1e30, 10, 30); ok('extremes', st.big === '1' + U && !/NaN|Infinity/.test(JSON.stringify(st)), '30 tubes of tenfold from 1e30 end at 1, page says ' + st.big); }
  { const st = await ser(500, 5, 1); ok('extremes', st.big === '100' + U && st.tab.length === 3, 'one tube is stock / factor = 100, page says ' + st.big); }
  { const st = await ser(1e30, 1e9, 3); ok('extremes', st.big === '1,000' + U, 'huge factor: 1e30 / (1e9)^3 = 1,000, page says ' + st.big); }
  { const st = await ser(1e-30, 1.000001, 30); ok('extremes', !/NaN|Infinity|undefined/.test(JSON.stringify(st)) && st.hint === '', 'tiny stock with a factor just above 1 should read sensibly, page says ' + st.big + ' ' + st.hint); }
  { const st = await ser(1000, 10, 3, { sdVol: '100' }); ok('extremes', /= 100 µL$/.test(st.tab[4][2]) && /= 110 µL$/.test(st.tab[3][2]) && /= 111 µL$/.test(st.tab[2][2]) && row(st.nums, 'Stock needed in total')[1] === '11.1 µL' && row(st.nums, 'Diluent needed in total')[1] === '288.9 µL', 'backwards plan for 100 uL in 3 tenfold tubes: 100, 110, 111 uL made, 11.1 uL of stock, 288.9 uL diluent, page says ' + JSON.stringify(st.tab.slice(2).map((r) => r[2])) + ' ' + JSON.stringify(row(st.nums, 'Stock needed in total'))); }
  { const st = await ser(1000, 10, 3, { sdVol: '100', sdRep: '3', sdLoss: '10' }); ok('extremes', /= 330 µL$/.test(st.tab[4][2]) && row(st.nums, 'Liquid each tube must give')[1] === '330 µL', '100 uL x 3 replicates + 10% loss = 330 uL, page says ' + st.tab[4][2]); }
  { const st = await ser(1000, 100, 3, { sdVol: '100', sdMin: '5' }); ok('extremes', st.flags.join(',') === '1,2,3' || st.flags.length > 0, 'a 100-fold step taking 1 uL is below a 5 uL minimum, flagged tubes: ' + st.flags.join(',')); ok('extremes', /below your smallest volume of 5 µL/.test(st.warn), 'the warning should name the 5 uL minimum, page says ' + st.warn); }
  ok('extremes', Date.now() - t0 < 150000, 'the whole check should run well inside the time limit, took ' + (Date.now() - t0) + ' ms');

  /* ======== 3. visual ======== */
  const geo = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var svg=document.querySelector("#sdTubes svg");if(!svg)return null;var vb=svg.viewBox.baseVal,sc=svg.getBoundingClientRect().width/vb.width;' +
    'return {sc:sc,vbw:vb.width,vbh:vb.height,liq:[].map.call(svg.querySelectorAll(".sd-liq"),function(r){return {k:+r.getAttribute("data-tube"),conc:+r.getAttribute("data-conc"),level:+r.getAttribute("data-level"),x:+r.getAttribute("x"),y:+r.getAttribute("y"),w:+r.getAttribute("width"),h:+r.getAttribute("height"),op:+r.getAttribute("fill-opacity")};}),' +
    'texts:[].map.call(svg.querySelectorAll("text"),function(t){return {x:+t.getAttribute("x"),y:+t.getAttribute("y"),t:t.textContent,fs:+t.getAttribute("font-size"),fill:t.getAttribute("fill")};}),arrows:svg.querySelectorAll("path[stroke=\\"#B5761F\\"]").length};})())'));
  { const st = await ser(1000000, 10, 6); const g = await geo(); ok('visual', !!g && g.liq.length === 7, 'six tubes plus the stock should be drawn, drawn ' + (g && g.liq.length));
    if (g) { const exp = [1e6, 1e5, 1e4, 1e3, 100, 10, 1];
      ok('visual', g.liq.every((l, i) => Math.abs(l.conc - exp[i]) / exp[i] < 1e-9), 'every tube should carry its own concentration');
      const ops = g.liq.slice(1).map((l) => l.op); ok('visual', ops.every((o, i) => i === 0 || o < ops[i - 1]), 'colour strength should fall tube by tube');
      ok('visual', ops.every((o, i) => Math.abs(o - (0.14 + 0.78 * Math.log(exp[i + 1] / 1) / Math.log(1e6 / 1))) < 0.002), 'colour strength should follow the log of the concentration between the last tube and the stock');
      ok('visual', Math.abs(g.liq[0].h - 0.8 * 54) < 0.05 && g.liq[1].level === 0.7, 'the stock tube is 80% full and tubes are 70% full without a volume');
      const labs = g.texts.filter((q) => q.fill === '#7A4D0F'); ok('visual', labs.length === 7 && labs.map((q) => q.t).join('|') === '1e6|1e5|1e4|1e3|1e2|1e1|1e0', 'the concentration is written above every tube (all shortened to powers of ten when one is too long), written ' + labs.map((q) => q.t).join('|'));
      const cx = labs.map((q) => q.x); ok('visual', cx.slice(0, 5).every((x, i) => Math.abs(x - (i * 52 + 26)) < 0.1), 'labels sit at the centre of their cells');
      ok('visual', g.vbh === 208 && g.arrows === 5, 'seven cells wrap onto two rows of 5 (height 208) with 5 arrows, got ' + g.vbh + ' / ' + g.arrows);
      const fs = Math.min.apply(null, g.texts.map((q) => q.fs * g.sc)); ok('visual', fs >= 11, 'tube text renders at ' + fs.toFixed(1) + 'px (needs >= 11px)');
      const rows2 = g.liq.filter((l) => l.k >= 5).every((l) => l.y > g.liq[0].y + 90); ok('visual', rows2, 'tubes 5 and 6 sit on the second row'); } }
  { await reset(); await setAll({ sdStock: '1000', sdFactor: '10', sdN: '3', sdVol: '100' }); runs++; const g = await geo(); ok('visual', !!g && g.liq.length === 4, 'three tubes plus the stock');
    if (g) { const mades = [111, 110, 100]; const mx = 111; ok('visual', g.liq.slice(1).every((l, i) => Math.abs(l.h - 54 * Math.max(0.12, mades[i] / mx)) < 0.06), 'liquid level should be the volume made over the largest volume (111, 110, 100 uL)'); ok('visual', g.liq[1].h > g.liq[3].h, 'the first tube holds more than the last'); ok('visual', g.liq.slice(1).every((l) => Math.abs(l.y + l.h - (g.liq[0].y + g.liq[0].h)) < 0.05), 'every liquid rests on the tube bottom'); } }
  { await reset(); await setAll({ sdStock: '1e6', sdFactor: '10', sdN: '12' }); runs++; const g = await geo(); ok('visual', !!g && g.liq.length === 10 && g.vbh === 208, 'a 12-tube series draws 9 tubes plus the stock on two rows, drew ' + (g && g.liq.length)); const cap = await ctx.eval('document.getElementById("sdTubesCap").textContent'); ok('visual', cap.indexOf('The first 9 tubes are drawn; all 12 are in the table') > 0, 'the caption should say the drawing is capped'); }
  { await reset(); await setAll({ sdStock: '1e6', sdFactor: '10', sdN: '3' }); runs++; const g = await geo(); ok('visual', !!g && g.vbh === 108 && g.arrows === 3, 'four cells fit one row (height 108) with 3 arrows, got ' + (g && g.vbh) + ' / ' + (g && g.arrows)); }
  return { fails, cats, runs };
};
