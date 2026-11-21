/* FINAL GATE script for dilution-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (worked examples, the ratio table for 1 litre, the meaning table, the FAQ answers) is re-derived by DRIVING THE TOOL and found in the page text.
   extremes:   published examples (LibreTexts 100 mL of 2.0 M made up to 500 mL = 0.40 M, 10% to 1%, 10 mM to 100 µM), ppm against percent, 1:1, the largest factor, the refusals (stronger target, same strength, mixed unit kinds), a gallon batch and a time limit.
   visual:     the flask is re-measured from the SVG (layer heights against the volumes, the tick labels, the final-volume label, text >= 11px rendered, inside its card), the strength bar and the legend from the DOM. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const rd = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};var hint=document.getElementById("dlHint");' +
    'var rows=function(id){return [].map.call(document.querySelectorAll("#"+id+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("dlBig"),sub:g("dlSub"),tip:g("dlTip"),hint:hint&&hint.style.display!=="none"?hint.textContent.trim():"",body:document.getElementById("dlBody").style.display!=="none",eq:rows("dlEq"),batch:rows("dlBatch"),legend:g("dlLegend")};})())'));
  const drive = async (o) => {
    await ctx.fill();
    if (o.how) await ctx.seg('dlHow', o.how); if (o.rs) await ctx.seg('dlRs', o.rs);
    for (const k of ['dlU1', 'dlU2', 'dlVk', 'dlVu', 'dlVcu', 'dlVwu']) if (o[k] !== undefined) await ctx.set(k, o[k]);
    for (const k of ['dlC1', 'dlC2', 'dlRat', 'dlV', 'dlVc', 'dlVw']) if (o[k] !== undefined) await ctx.set(k, o[k]);
    runs++; return rd();
  };
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' ');
  const inText = (str, tag) => { cats.textVsTool++; if (C.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const tables = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});}))'));
  const mlOf = (t) => t.replace(/ mL$/, '');
  const split = (sub) => { const m = sub.match(/^\+ (.+?) of water = (.+?) · 1 : (.+?) · (.+?)× weaker$/); return m ? { water: m[1], total: m[2], r: m[3], F: m[4] } : null; };

  /* ======== 1. textVsTool ======== */
  { const t = tables.filter((r) => r[0] && r[0][0] === 'Ratio' && r[0][1] === 'Concentrate' && r[0][3] === 'Strength left')[0]; ok('textVsTool', !!t, 'ratio table for 1 litre not found');
    if (t) for (let k = 1; k < t.length; k++) { const q = t[k][0].replace('1 : ', ''); const st = await drive({ how: 'rat', dlRat: '1:' + q, dlV: '1000' }); const sp = split(st.sub); ok('textVsTool', t[k][1] === st.big && !!sp && t[k][2] === sp.water, 'ratio table 1:' + q + ' page ' + t[k][1] + ' / ' + t[k][2] + ' tool ' + st.big + ' / ' + st.sub); const e3 = st.eq.filter((r) => /^Concentrate, share/.test(r[0]))[0]; ok('textVsTool', !!e3 && t[k][3] === e3[1].replace(/ %$/, ' %'), 'ratio table strength left ' + q + ' page ' + t[k][3] + ' tool ' + (e3 && e3[1])); } }
  { const a = await drive({ dlC1: '10', dlC2: '1', dlV: '1000' }), sa = split(a.sub); inText('the factor is 10, so ' + a.big + ' of concentrate and ' + sa.water + ' of water', 'worked example 10% to 1%'); inText('you need ' + mlOf(a.big) + ' mL of the 10% concentrate and ' + mlOf(sa.water) + ' mL of water', 'FAQ 10% to 1%'); }
  { const a = await drive({ dlU1: 'mM', dlU2: 'uM', dlC1: '10', dlC2: '100', dlV: '50' }), sa = split(a.sub); inText('the factor is 100, so ' + a.big + ' of stock and ' + sa.water + ' of diluent', 'worked example 10 mM to 100 µM'); inText('for 50 mL you need ' + mlOf(a.big) + ' mL of stock and ' + mlOf(sa.water) + ' mL of diluent', 'FAQ mM to µM'); }
  { const a = await drive({ how: 'rat', dlRat: '1:10', dlV: '500' }), sa = split(a.sub); inText('11 parts in all, so ' + a.big + ' of concentrate and ' + sa.water + ' of water', 'worked example 1:10 for 500 mL'); }
  { const a = await drive({ dlU1: 'M', dlU2: 'M', dlC1: '2', dlC2: '0.4', dlV: '500' }), sa = split(a.sub); inText(a.big + ' of stock and ' + sa.water + ' of water (the LibreTexts example)', 'worked example LibreTexts'); inText('you need ' + a.big + ' of stock and ' + sa.water + ' of water.', 'FAQ how to calculate'); }
  { const a = await drive({ how: 'rat', dlRat: '1:10', dlV: '1000' }), sa = split(a.sub), b = await drive({ how: 'rat', rs: 'f', dlRat: '10', dlV: '1000' }), sb = split(b.sub); inText('1 L at a 1:10 ratio: ' + mlOf(a.big) + ' mL of concentrate and ' + mlOf(sa.water) + ' mL of water', 'FAQ 1 litre at 1:10'); inText('For 1 in 10 (10×) it is ' + mlOf(b.big) + ' mL of concentrate and ' + mlOf(sb.water) + ' mL of water', 'FAQ 1 in 10'); const e3 = a.eq.filter((r) => /^Concentrate, share/.test(r[0]))[0]; inText('so the strength is ' + e3[1].replace(' %', '%') + ' of the concentrate', 'FAQ 1:10 strength'); }
  { const a = await drive({ dlU1: 'pct', dlU2: 'pct', dlC1: '99', dlC2: '70', dlV: '2000' }), sa = split(a.sub); inText('needs about ' + mlOf(a.big) + ' mL of the 99% and ' + mlOf(sa.water) + ' mL of water', 'FAQ alcohol example'); }

  /* ======== 2. extremes ======== */
  { const K = [[{ dlC1: '10', dlC2: '1', dlV: '1000' }, '100 mL'], [{ dlU1: 'M', dlU2: 'M', dlC1: '2', dlC2: '0.4', dlVk: 'conc', dlV: '100' }, '100 mL'], [{ dlU1: 'mM', dlU2: 'uM', dlC1: '10', dlC2: '100', dlV: '50' }, '0.5 mL'], [{ dlU1: 'pct', dlU2: 'ppm', dlC1: '1', dlC2: '100', dlV: '1000' }, '10 mL'], [{ how: 'rat', dlRat: '1:1', dlV: '1000' }, '500 mL'], [{ how: 'rat', dlRat: '10x', dlV: '1000' }, '100 mL'], [{ how: 'rat', dlRat: '1 in 4', dlV: '1000' }, '250 mL'], [{ how: 'rat', dlRat: '2:30', dlV: '1600' }, '100 mL'], [{ how: 'rat', dlRat: '1:3', dlVu: 'usgal', dlV: '1' }, '0.25 US gal']];
    for (const [o, want] of K) { const st = await drive(o); ok('extremes', st.big === want, 'published / exact value ' + JSON.stringify(o) + ' gives [' + st.big + '] expected [' + want + ']'); } }
  { let st = await drive({ dlU1: 'ppm', dlU2: 'pct', dlC1: '1000', dlC2: '0.01', dlV: '1000' }); ok('extremes', st.body && st.big === '100 mL', '1000 ppm to 0.01% is a factor of 10, [' + st.big + ']');
    st = await drive({ dlU1: 'pct', dlU2: 'pct', dlC1: '1000000000', dlC2: '1', dlV: '1000' }); ok('extremes', st.body && !/NaN|Infinity|undefined/.test(JSON.stringify(st)), 'a factor of exactly a billion is accepted [' + st.big + ']');
    st = await drive({ dlU1: 'pct', dlU2: 'pct', dlC1: '1000000001', dlC2: '1', dlV: '1000' }); ok('extremes', !st.body && /more than a billion times/.test(st.hint), 'a factor past a billion is refused [' + st.hint + ']');
    st = await drive({ dlC1: '1', dlC2: '10', dlV: '1000' }); ok('extremes', !st.body && /target is stronger than the concentrate/.test(st.hint), 'a stronger target is refused [' + st.hint + ']');
    st = await drive({ dlC1: '5', dlC2: '5', dlV: '1000' }); ok('extremes', !st.body && /nothing to dilute/.test(st.hint), 'the same strength is refused [' + st.hint + ']');
    st = await drive({ dlU1: 'pct', dlU2: 'mM', dlC1: '10', dlC2: '1', dlV: '1000' }); ok('extremes', !st.body && /different kinds of units/.test(st.hint), 'mixed unit kinds are refused [' + st.hint + ']');
    st = await drive({ how: 'rat', dlRat: '1 in 1', dlV: '1000' }); ok('extremes', !st.body && /Could not read the dilution/.test(st.hint), 'a factor of 1 is refused [' + st.hint + ']');
    st = await drive({ how: 'vol', dlVc: '100', dlVw: '900' }); ok('extremes', st.big === '1 : 9' && /10× weaker/.test(st.sub), 'volumes used 100 + 900 gives [' + st.big + '] ' + st.sub);
    st = await drive({ dlC1: '10', dlC2: '1', dlV: '0.000001' }); ok('extremes', st.body && !/NaN|Infinity|undefined/.test(JSON.stringify(st)), 'the smallest volume works [' + st.big + ']');
    ok('extremes', Date.now() - t0 < 150000, 'the checks took ' + (Date.now() - t0) + 'ms'); }

  /* ======== 3. visual: the flask and the bar re-measured ======== */
  const MEAS = 'JSON.stringify((function(){var svg=document.getElementById("dlFlaskSvg");if(!svg)return null;var T=[].map.call(svg.querySelectorAll("text"),function(t){return {t:t.textContent,fs:+t.getAttribute("font-size"),x:+t.getAttribute("x")};});var wc=document.getElementById("dlRectW"),cc=document.getElementById("dlRectC");var r=svg.getBoundingClientRect(),cr=svg.closest(".card").getBoundingClientRect();var bd=document.querySelector("#dlBar .mm-band");var lg=[].map.call(document.querySelectorAll("#dlLegend span"),function(s){return s.textContent.trim();});return {T:T,hw:+wc.getAttribute("height"),hc:+cc.getAttribute("height"),yw:+wc.getAttribute("y"),yc:+cc.getAttribute("y"),w:r.width,vw:svg.viewBox.baseVal.width,right:r.right,cright:cr.right,band:bd?parseFloat(bd.style.width):null,lg:lg};})())';
  const CASES = [{ o: { dlC1: '10', dlC2: '1', dlV: '1000' }, vc: 100, V: 1000, F: 10 }, { o: { how: 'rat', dlRat: '1:3', dlV: '400' }, vc: 100, V: 400, F: 4 }, { o: { how: 'rat', dlRat: '1:99', dlV: '1000' }, vc: 10, V: 1000, F: 100 }, { o: { how: 'rat', dlRat: '1:1', dlV: '250' }, vc: 125, V: 250, F: 2 }, { o: { dlU1: 'mM', dlU2: 'uM', dlC1: '10', dlC2: '100', dlV: '50' }, vc: 0.5, V: 50, F: 100 }, { o: { how: 'rat', dlRat: '1:9', dlVk: 'water', dlV: '900' }, vc: 100, V: 1000, F: 10 }];
  for (const cs of CASES) {
    await drive(cs.o); const m = JSON.parse(await ctx.eval(MEAS)), tag = JSON.stringify(cs.o);
    ok('visual', !!m, tag + ' no flask'); if (!m) { cats.visual += 6; continue; }
    const hc = cs.vc / cs.V * 136; ok('visual', Math.abs(m.hc - hc) < 0.006 && Math.abs(m.hw - (136 - hc)) < 0.006, tag + ' layer heights ' + m.hc + ' / ' + m.hw + ' expected ' + hc.toFixed(2) + ' / ' + (136 - hc).toFixed(2));
    ok('visual', Math.abs(m.yw - 28) < 0.01 && Math.abs(m.yc - (28 + m.hw)) < 0.01, tag + ' layers do not stack to the final mark: water y ' + m.yw + ' concentrate y ' + m.yc);
    const labs = m.T.filter((t) => t.x < 70).map((t) => t.t); ok('visual', labs.length === 5 && labs[0].length > 0, tag + ' tick labels ' + JSON.stringify(labs));
    const fl = m.T.filter((t) => t.x > 150)[0]; ok('visual', !!fl && /mL|L$/.test(fl.t), tag + ' final-volume label ' + (fl && fl.t));
    const sc = m.w / m.vw; ok('visual', m.T.every((t) => t.fs * sc >= 11), tag + ' flask text smaller than 11px rendered (scale ' + sc.toFixed(2) + ')'); ok('visual', m.right <= m.cright + 1, tag + ' flask pokes out of its card');
    ok('visual', Math.abs(m.band - 100 / cs.F) < 0.001, tag + ' strength bar ' + m.band + ' expected ' + (100 / cs.F)); ok('visual', m.lg.length === 2 && /^Concentrate/.test(m.lg[0]) && /^Water/.test(m.lg[1]), tag + ' legend ' + JSON.stringify(m.lg));
  }
  return { fails, cats, runs };
};
