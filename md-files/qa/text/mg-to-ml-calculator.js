/* FINAL GATE script for mg-to-ml-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (formula examples, the mg-to-mL table at common strengths, the label table, the liquid density table, the label-reading examples, the FAQ) is re-derived by DRIVING THE TOOL and found in the page text.
   extremes:   published examples (50 mg at 20 mg per mL = 2.5 mL, 100 mg of water = 0.1 mL, 150 mg at 20 mg per mL = 7.5 mL), float ties (0.3 mg at 0.1 mg per mL = 3 mL), 1 g = 1,000 mg = 1,000,000 mcg, the smallest and the largest accepted values, a volume past the
               largest syringe, spoon fractions and a time limit.
   visual:     the syringe is re-measured from the SVG (fill width against volume / size, the amber marker at the end of the fill, the label, the last tick, text >= 11px rendered, inside its card) and the bottle ruler from the DOM (band and marker position, labels = volume x strength). */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const rd = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var hint=document.getElementById("mmHint");return {big:g("mmBig"),sub:g("mmSub"),tip:g("mmTip"),sn:g("mmSn"),doseN:g("mmDoseN"),hint:hint&&hint.style.display!=="none"?hint.textContent.trim():"",warn:[].map.call(document.querySelectorAll("#mmWarn .mm-warn"),function(e){return e.textContent.trim();}),body:document.getElementById("mmBody").style.display!=="none"};})())'));
  const drive = async (o) => {
    await ctx.fill();
    if (o.mode) await ctx.seg('mmMode', o.mode); if (o.du) await ctx.seg('mmDu', o.du); if (o.su) await ctx.seg('mmSu', o.su); if (o.pre) await ctx.set('mmPre', o.pre);
    if (o.sa !== undefined) await ctx.set('mmSa', o.sa); if (o.sp !== undefined) await ctx.set('mmSp', o.sp); if (o.vol !== undefined) await ctx.set('mmVol', o.vol); if (o.dose !== undefined) await ctx.set('mmDose', o.dose);
    runs++; return rd();
  };
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const tables = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});}))'));
  const mL = (t) => t.big.replace(/ mL$/, '');

  /* ======== 1. textVsTool ======== */
  { const a = await drive({ dose: '500', sa: '250', sp: '' }); inText(C, '500 mg ÷ 250 mg per mL = ' + a.big, 'three-variable table, dose and strength');
    const b = await drive({ mode: 'mlmg', vol: '5', sa: '100', sp: '' }); inText(C, '5 mL × 100 mg per mL = ' + b.big.replace(' mg', '') + ' mg', 'three-variable table, volume and strength');
    const c = await drive({ mode: 'strength', dose: '200', vol: '10' }); inText(C, '200 mg ÷ 10 mL = ' + c.big.replace(' per mL', '') + ' per mL', 'three-variable table, strength'); }
  { /* mg to mL table at common strengths: every cell */
    const t = tables.filter((r) => r[0] && r[0][0] === 'Dose' && /^[0-9]/.test(r[0][1] || ''))[0]; ok('textVsTool', !!t, 'common strengths table not found');
    if (t) { const S = t[0].slice(1).map((h) => parseFloat(h)); for (let r = 1; r < t.length; r++) { const dose = t[r][0].replace(' mg', ''); for (let k = 0; k < S.length; k++) { const st = await drive({ dose, sa: String(S[k]), sp: '' }); ok('textVsTool', t[r][k + 1] + ' mL' === st.big, 'table ' + dose + ' mg at ' + S[k] + ' mg per mL: page ' + t[r][k + 1] + ' tool ' + st.big); } } } }
  { /* label table: every strength */
    const t = tables.filter((r) => r[0] && r[0][0] === 'Product' && r[0][1] === 'Label')[0]; ok('textVsTool', !!t, 'label table not found');
    const ids = ['apap160', 'ibu100', 'ibu50', 'dph12', 'cet5', 'amx125', 'amx200', 'amx250', 'amx400', 'azi100', 'azi200', 'cfd125', 'cfd250', 'cph125', 'cph250', 'tc100', 'tc200'];
    if (t) for (let r = 1; r < t.length; r++) { await ctx.fill(); await ctx.set('mmPre', ids[r - 1]); runs++; const sn = (await rd()).sn; const m = sn.match(/= ([\d.,e-]+) mg per mL/); ok('textVsTool', !!m && t[r][2] === m[1] + ' mg per mL', 'label row ' + t[r][0] + ': page ' + t[r][2] + ' tool ' + sn); const lab = sn.match(/^([\d.,]+) mg in ([\d.,]+) mL/); ok('textVsTool', !!lab && t[r][1] === lab[1] + ' mg per ' + lab[2] + ' mL', 'label row text ' + t[r][1] + ' tool ' + sn); } }
  { /* liquid table */
    const t = tables.filter((r) => r[0] && r[0][0] === 'Liquid' && r[0][1] === 'Density')[0]; ok('textVsTool', !!t, 'liquid table not found');
    const ids = ['water', 'milk', 'olive', 'canola', 'honey'];
    if (t) for (let r = 1; r < t.length; r++) { const st = await drive({ pre: ids[r - 1], dose: '1000' }); ok('textVsTool', t[r][2] === st.big.replace(' mL', '') + ' mL per 1,000 mg', 'liquid ' + t[r][0] + ' page ' + t[r][2] + ' tool ' + st.big); const dn = st.sn.match(/= ([\d.,]+) mg per mL/); ok('textVsTool', !!dn && t[r][1] === dn[1] + ' mg per mL', 'liquid density ' + t[r][0] + ' page ' + t[r][1] + ' tool ' + st.sn); } }
  { const h = await drive({ pre: 'honey', dose: '1000' }), m250 = await drive({ dose: '1000', sa: '250', sp: '' }); inText(C, '1,000 mg of honey is ' + h.big + ' and 1,000 mg of a 250 mg per mL medicine is ' + m250.big, 'strength matters paragraph'); }
  { const a = await drive({ dose: '50', sa: '100', sp: '5' }), l1 = await drive({ mode: 'strength', dose: '100', vol: '5' }), l2 = await drive({ mode: 'strength', dose: '50', vol: '1.25' }), l3 = await drive({ mode: 'strength', dose: '250', vol: '5' });
    inText(C, 'a dose that is ' + a.big + ' of one bottle', 'label paragraph dose'); inText(C, '250 ÷ 5 = ' + l3.big, 'label reading 250 / 5'); inText(C, '“100 mg/5 mL” is ' + l1.big + ' and “50 mg/1.25 mL” is ' + l2.big, 'label reading examples'); }
  /* FAQ: 10 mg, 2.5 mg, 50 mg, 500 mg at a list of strengths */
  { const parts = []; for (const s of [1, 5, 10, 20, 50, 100]) parts.push(mL(await drive({ dose: '10', sa: String(s), sp: '' })) + ' mL at ' + s + ' mg per mL'); const w = await drive({ pre: 'water', dose: '10' }); inText(C, '10 mg is ' + parts.slice(0, 5).join(', ') + ' and ' + parts[5], 'FAQ 10 mg'); inText(C, 'For water it is ' + w.big, 'FAQ 10 mg water'); }
  { const parts = []; for (const s of [1, 5, 10, 20, 50]) parts.push(mL(await drive({ dose: '2.5', sa: String(s), sp: '' })) + ' mL at ' + s + ' mg per mL'); inText(C, parts.slice(0, 4).join(', ') + ' and ' + parts[4], 'FAQ 2.5 mg'); }
  { const parts = []; for (const s of [10, 20, 50, 100, 250]) parts.push(mL(await drive({ dose: '50', sa: String(s), sp: '' })) + ' mL at ' + s + ' mg per mL'); const ib = await drive({ dose: '50', pre: 'ibu100' }); inText(C, parts.slice(0, 4).join(', ') + ' and ' + parts[4], 'FAQ 50 mg'); inText(C, 'children’s ibuprofen at 20 mg per mL (100 mg in 5 mL) is ' + ib.big, 'FAQ 50 mg ibuprofen'); }
  { const a = await drive({ dose: '500', sa: '100', sp: '' }), b = await drive({ dose: '500', sa: '250', sp: '' }), c = await drive({ dose: '500', pre: 'amx250' }), d = await drive({ pre: 'water', dose: '500' }), e = await drive({ dose: '500', sa: '1', sp: '' });
    inText(C, a.big + ' at 100 mg per mL, ' + b.big + ' at 250 mg per mL, ' + c.big + ' at 50 mg per mL (250 mg in 5 mL) and ' + d.big + ' for water', 'FAQ 500 mg'); inText(C, 'At 1 mg per mL it would be ' + e.big, 'FAQ 500 mg at 1'); }
  { const a = await drive({ du: 'mcg', dose: '500', sa: '1', sp: '' }); inText(C, '500 mcg is ' + a.doseN.match(/= ([\d.,]+) mg/)[1] + ' mg, which is ' + a.big + ' at 1 mg per mL', 'FAQ mcg'); }
  { const a = await drive({ dose: '50', sa: '20', sp: '' }); inText(C, '50 mg at 20 mg per mL is ' + a.big, 'FAQ how to convert'); }

  /* ======== 2. extremes ======== */
  { const K = [[{ dose: '50', sa: '20', sp: '' }, '2.5 mL'], [{ pre: 'water', dose: '100' }, '0.1 mL'], [{ dose: '150', sa: '20', sp: '' }, '7.5 mL'], [{ dose: '4', sa: '2', sp: '' }, '2 mL'], [{ dose: '0.3', sa: '0.1', sp: '' }, '3 mL'], [{ du: 'mcg', dose: '1000000', sa: '1000', sp: '' }, '1 mL'], [{ du: 'g', dose: '1', sa: '1000', sp: '' }, '1 mL'], [{ dose: '500', sa: '250', sp: '' }, '2 mL'], [{ dose: '125', sa: '250', sp: '5' }, '2.5 mL'], [{ dose: '1', sa: '0.000001', sp: '' }, '1,000,000 mL']];
    for (const [o, want] of K) { const st = await drive(o); ok('extremes', st.big === want, 'published / exact value ' + JSON.stringify(o) + ' gives [' + st.big + '] expected [' + want + ']'); } }
  { let st = await drive({ dose: '0.000001', sa: '10000000', sp: '' }); ok('extremes', st.big === '1e-13 mL' && !/NaN|Infinity|undefined/.test(JSON.stringify(st)), 'smallest dose at the largest strength [' + st.big + ']');
    st = await drive({ dose: '1000000000', sa: '0.000001', sp: '' }); ok('extremes', st.big === '1e15 mL' && st.warn.some((w) => /more than 1 litre/.test(w)), 'largest dose at the smallest strength [' + st.big + '] ' + JSON.stringify(st.warn));
    st = await drive({ dose: '1000000001', sa: '50', sp: '' }); ok('extremes', !st.body && /up to 1,000,000,000 mg/.test(st.hint), 'a dose past the limit is refused with a hint [' + st.hint + ']');
    st = await drive({ dose: '0.0000009', sa: '50', sp: '' }); ok('extremes', !st.body && /dose should be a number above 0/.test(st.hint), 'a dose below the limit is refused [' + st.hint + ']');
    st = await drive({ dose: '3000', sa: '50', sp: '' }); ok('extremes', st.big === '60 mL' && !(await ctx.eval('!!document.getElementById("mmSyrSvg") && document.getElementById("mmSyrSvg").getAttribute("data-size")==="60" ? false : true')), 'a 60 mL dose uses the 60 mL syringe [' + st.big + ']');
    st = await drive({ dose: '3050', sa: '50', sp: '' }); ok('extremes', st.big === '61 mL' && !(await ctx.eval('!!document.getElementById("mmSyrSvg")')) && st.warn.some((w) => /more than 60 mL/.test(w)), 'past the largest syringe no syringe is drawn and a warning shows [' + st.big + ']');
    st = await drive({ dose: '12.5', sa: '10', sp: '' }); ok('extremes', /\(¼ tsp\)/.test(st.tip), 'spoon fraction quarter [' + st.tip + ']');
    st = await drive({ dose: '187.5', sa: '10', sp: '' }); ok('extremes', /\(3¾ tsp\)/.test(st.tip), 'spoon fraction 3¾ [' + st.tip + ']');
    st = await drive({ dose: '5', sa: '1000', sp: '' }); ok('extremes', st.warn.some((w) => /under 0.1 mL/.test(w)), 'a tiny volume warns [' + JSON.stringify(st.warn) + ']');
    ok('extremes', Date.now() - t0 < 150000, 'the checks took ' + (Date.now() - t0) + 'ms'); }

  /* ======== 3. visual: the syringe and the bottle ruler re-measured ======== */
  const MEAS = 'JSON.stringify((function(){var svg=document.getElementById("mmSyrSvg");if(!svg)return null;var fill=document.getElementById("mmFill"),T=[].map.call(svg.querySelectorAll("text"),function(t){return {t:t.textContent,x:+t.getAttribute("x"),fs:+t.getAttribute("font-size"),a:t.getAttribute("text-anchor")};}),L=[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),x2:+l.getAttribute("x2"),da:l.getAttribute("stroke-dasharray")||"",sw:+l.getAttribute("stroke-width")};});var r=svg.getBoundingClientRect(),cr=svg.closest(".card").getBoundingClientRect();return {size:+svg.getAttribute("data-size"),fw:+fill.getAttribute("width"),fx:+fill.getAttribute("x"),T:T,L:L,w:r.width,vw:svg.viewBox.baseVal.width,right:r.right,cright:cr.right};})())';
  const RULE = 'JSON.stringify((function(){var band=document.querySelector("#mmRule .mm-band"),mk=document.querySelector("#mmRule .mm-mk"),ls=[].map.call(document.querySelectorAll("#mmRule .mm-rule-l span"),function(s){return {b:s.querySelector("b").textContent,t:s.textContent.replace(s.querySelector("b").textContent,"").trim(),left:parseFloat(s.style.left)};});var rr=document.querySelector("#mmRule .mm-rule").getBoundingClientRect(),cr=document.querySelector("#mmRule").closest(".card").getBoundingClientRect();return {band:parseFloat(band.style.width),mk:parseFloat(mk.style.left),ls:ls,right:rr.right,cright:cr.right};})())';
  const sizeOf = (v) => [1, 3, 5, 10, 20, 60].filter((z) => z >= v - 1e-12)[0];
  const CASES = [{ o: { dose: '125', sa: '250', sp: '5' }, v: 2.5, s: 50 }, { o: { dose: '50', sa: '50', sp: '' }, v: 1, s: 50 }, { o: { dose: '200', sa: '20', sp: '' }, v: 10, s: 20 }, { o: { dose: '7.5', sa: '10', sp: '' }, v: 0.75, s: 10 }, { o: { pre: 'apap160', dose: '240' }, v: 7.5, s: 32 }, { o: { dose: '1', sa: '1', sp: '' }, v: 1, s: 1 }, { o: { dose: '300', sa: '5', sp: '' }, v: 60, s: 5 }];
  for (const cs of CASES) {
    await drive(cs.o); const m = JSON.parse(await ctx.eval(MEAS)), z = sizeOf(cs.v), tag = JSON.stringify(cs.o);
    ok('visual', !!m && m.size === z, tag + ' syringe size ' + (m && m.size) + ' expected ' + z); if (!m) { cats.visual += 5; continue; }
    ok('visual', Math.abs(m.fw - cs.v / z * 218) < 0.02, tag + ' fill width ' + m.fw + ' expected ' + (cs.v / z * 218).toFixed(2));
    const mk = m.L.filter((l) => l.da === '3,2.5' && l.sw === 2)[0]; ok('visual', !!mk && Math.abs(mk.x1 - (m.fx + m.fw)) < 0.06, tag + ' amber marker at ' + (mk && mk.x1) + ' expected ' + (m.fx + m.fw).toFixed(2));
    const lab = m.T.filter((t) => /mL$/.test(t.t))[0]; ok('visual', !!lab && lab.t.replace(/ mL$/, '') === String(parseFloat(cs.v.toPrecision(4))), tag + ' syringe label ' + (lab && lab.t));
    const last = m.T.filter((t) => !/mL$/.test(t.t)).map((t) => parseFloat(t.t)).sort((a, b) => b - a)[0]; ok('visual', last <= z && last >= z * 0.8, tag + ' last tick label ' + last + ' for a ' + z + ' mL syringe');
    const sc = m.w / m.vw; ok('visual', m.T.every((t) => t.fs * sc >= 11), tag + ' syringe text smaller than 11px rendered (scale ' + sc.toFixed(2) + ')'); ok('visual', m.right <= m.cright + 1, tag + ' syringe pokes out of its card');
    const rl = JSON.parse(await ctx.eval(RULE)), step = rl.ls.length > 1 ? rl.ls : [], mx = parseFloat(rl.ls[rl.ls.length - 1].b);
    ok('visual', Math.abs(rl.band - cs.v / mx * 100) < 0.05 && Math.abs(rl.mk - rl.band) < 0.001, tag + ' ruler band ' + rl.band + ' marker ' + rl.mk + ' expected ' + (cs.v / mx * 100).toFixed(3));
    ok('visual', rl.ls.every((l) => Math.abs(parseFloat(l.t) - parseFloat(l.b) * cs.s) < 0.011 * Math.max(1, parseFloat(l.t))), tag + ' ruler labels are not volume x ' + cs.s + ': ' + JSON.stringify(rl.ls.slice(0, 3))); ok('visual', rl.ls.length <= 4 && rl.right <= rl.cright + 1, tag + ' ruler labels ' + rl.ls.length + ' or pokes out of its card');
  }
  return { fails, cats, runs };
};
