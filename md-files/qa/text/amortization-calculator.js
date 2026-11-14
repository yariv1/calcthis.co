/* FINAL GATE script for amortization-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, formula example, first-six-payments table, terms table, extra payments table, one-time payment, frequency table, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   closed-form values (1000 at 12% for a year = 88.85, 0% = loan / n, one payment, 100% rate, 100 years, 1e12, an extra bigger than the loan, daily for 100 years under a time limit).
   visual:     the stacked chart is re-measured from the SVG: layer heights at the first and last payment against the numbers table, the marker x against the slider, the crossover line against the tip, the split bar widths,
               the sticky bar, tables inside the card, rendered text >= 11px. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0;
  const num = (t) => { const q = String(t).replace(/[−]/g, '-').replace(/[$,]/g, '').match(/-?\d+\.?\d*/); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("amBig"),sub:g("amSub"),tip:g("amTip"),nums:rows("amNums"),pt:rows("amPoint"),ptKey:g("amPointKey"),sch:rows("amSch"),fast:rows("amFast"),hint:g("amHint"),mval:g("amMVal")};})())'));
  const reset = async () => { await ctx.click('amClear'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const drive = async (o) => { await reset(); await setAll(o); runs++; return read(); };
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const mny = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const m0 = (x) => '$' + Math.round(Math.abs(x)).toLocaleString('en-US');
  const NI = (r, l) => { const x = row(r, l); return x ? x[1] : ''; };

  /* ======== 1. textVsTool ======== */
  const A = await drive({ amP: '200000', amR: '6', amT: '15' });
  inText(H, mny(200000) + ' at 6% over 15 years is ' + A.big + ' a month and ' + NI(A.nums, 'Total interest') + ' of interest', 'lead');
  inText(C, 'so A = ' + A.big, 'formula example');
  { await ctx.set('amSlide', '1'); const p1 = await read(); const ik = /In this payment (\$[\d,.]+) is interest and (\$[\d,.]+) reduces/.exec(p1.ptKey);
    ok('textVsTool', !!ik, 'slider key text not found [' + p1.ptKey + ']'); if (ik) inText(C, 'the first payment is ' + ik[1] + ' interest and ' + ik[2] + ' principal', 'FAQ first payment split'); }
  const B = await drive({ amP: '300000', amR: '6.5', amT: '30' });
  inText(C, 'the payment is ' + B.big, 'FAQ payment 300k'); inText(C, 'the first payment of ' + B.big + ' is ' + NI(B.nums, 'Interest in the first payment') + ' interest', 'FAQ first payment interest');
  { const cr = /From payment (\d+)/.exec(B.tip); ok('textVsTool', !!cr, 'crossover not in the tip [' + B.tip + ']'); if (cr) { inText(C, 'From payment ' + cr[1] + ' more of each payment goes to principal', 'FAQ crossover'); inText(C, 'From payment ' + cr[1] + ' the principal part is the larger one', 'schedule paragraph crossover'); } }
  { /* first six payments table */
    await ctx.seg('amSchSeg', 'pay'); const sp = await read(); await ctx.seg('amSchSeg', 'year');
    const tabs = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))'));
    const first = tabs.filter((t) => t[0] && t[0][0] === 'Payment')[0], terms = tabs.filter((t) => t[0] && t[0][0] === 'Term')[0], extra = tabs.filter((t) => t[0] && t[0][0] === 'Extra each month')[0], freq = tabs.filter((t) => t[0] && t[0][0] === 'You pay')[0];
    ok('textVsTool', !!first && !!terms && !!extra && !!freq, 'content tables not found');
    for (let k = 1; k <= 6; k++) { const live = sp.sch[k], tx = first[k]; ok('textVsTool', live && tx && Math.abs(num(live[1]) - num(tx[1])) < 0.0051 && Math.abs(num(live[2]) - num(tx[2])) < 0.0051 && Math.abs(num(live[3]) - num(tx[3])) < 0.0051, 'first-six table row ' + k + ' text ' + (tx && tx.join('|')) + ' vs tool ' + (live && live.join('|'))); }
    for (const [ix, y] of [[1, 15], [2, 20], [3, 25], [4, 30]]) { const st = await drive({ amP: '300000', amR: '6.5', amT: String(y) }); const rw = terms[ix]; ok('textVsTool', rw && Math.abs(num(rw[1]) - num(st.big)) < 0.0051 && Math.abs(num(rw[2]) - num(NI(st.nums, 'Total interest'))) < 0.51, 'terms table ' + y + ' years text ' + (rw && rw.join('|')) + ' tool ' + st.big + ' / ' + NI(st.nums, 'Total interest')); if (y === 15) { inText(C, 'costs ' + st.big + ' a month and ' + m0(num(NI(st.nums, 'Total interest'))) + ' of interest over 15 years', 'FAQ 15 vs 30'); } }
    const s30 = await drive({ amP: '300000', amR: '6.5', amT: '30' }); inText(C, 'against ' + s30.big + ' and ' + m0(num(NI(s30.nums, 'Total interest'))) + ' over 30 years', 'FAQ 30-year');
    for (const [ix, v] of [[2, 100], [3, 200], [4, 500]]) { const st = await drive({ amP: '300000', amR: '6.5', amT: '30', amX: String(v) }); const rw = extra[ix], dur = /^Paid off in (.+?) \(/.exec(st.sub); ok('textVsTool', rw && dur && rw[1] === dur[1] && Math.abs(num(rw[2]) - num(NI(st.nums, 'Interest saved by your extra payments'))) < 0.51, 'extra table +' + v + ' text ' + (rw && rw.join('|')) + ' tool ' + st.sub + ' / ' + NI(st.nums, 'Interest saved by your extra payments')); if (v === 200) { inText(C, 'pays it off in ' + dur[1] + ' instead of 30 years and saves ' + m0(num(NI(st.nums, 'Interest saved by your extra payments'))) + ' of interest', 'FAQ extra 200'); } }
    { const st = await drive({ amP: '300000', amR: '6.5', amT: '30' }); await ctx.click('amAddOne'); const id = await ctx.eval('(function(){var a=document.querySelectorAll("#amOnes .am-one");return a[a.length-1].id.slice(5)})()'); await ctx.set('amOA' + id, '10000'); await ctx.set('amOW' + id, 'payment 12'); const so = await read(); const sv = num(NI(so.nums, 'Interest saved by your extra payments')), dur = /^Paid off in (.+?) \(/.exec(so.sub);
      inText(C, 'saves ' + m0(sv) + ' of interest and shortens the loan to ' + dur[1], 'one-time example'); inText(C, 'saves ' + m0(sv) + ' of interest.', 'FAQ one-time'); }
    for (const [ix, k] of [[1, 'monthly'], [2, 'semimonthly'], [3, 'biweekly'], [4, 'weekly'], [5, 'quarterly'], [6, 'annual']]) { const st = await drive({ amP: '300000', amR: '6.5', amT: '30', amFreq: k }); const rw = freq[ix]; ok('textVsTool', rw && Math.abs(num(rw[1]) - num(st.big)) < 0.0051 && Math.abs(num(rw[2]) - num(NI(st.nums, 'Total interest'))) < 0.51, 'frequency table ' + k + ' text ' + (rw && rw.join('|')) + ' tool ' + st.big + ' / ' + NI(st.nums, 'Total interest')); if (k === 'monthly') inText(C, 'costs ' + m0(num(NI(st.nums, 'Total interest'))) + ' of interest paid monthly', 'FAQ monthly total'); if (k === 'biweekly') inText(C, m0(num(NI(st.nums, 'Total interest'))) + ' paid every two weeks', 'FAQ biweekly total'); } }
  { for (const [k, y] of [[60, '5'], [120, '10'], [180, '15']]) { await drive({ amP: '300000', amR: '6.5', amT: '30' }); await ctx.set('amSlide', String(k)); const p = await read(); inText(C, (y === '5' ? 'After 5 years on the ' + mny(300000) + ' loan at 6.5% over 30 years you still owe ' : y === '10' ? 'after 10 years ' : 'after 15 years ') + NI(p.pt, 'Balance still owed'), 'FAQ balance after ' + y + ' years'); } }
  { const z = await drive({ amP: '12000', amR: '0', amT: '24 months' }); inText(C, mny(12000) + ' over 24 months is ' + z.big + ' a month with no interest', 'FAQ 0%'); }

  /* ======== 2. extremes ======== */
  const cf = (P, r, n) => (r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)));
  { let st = await drive({ amP: '1000', amR: '12', amT: '1' }); ok('extremes', Math.abs(num(st.big) - cf(1000, 0.01, 12)) < 0.0051 && Math.abs(num(NI(st.nums, 'Total interest')) - (cf(1000, 0.01, 12) * 12 - 1000)) < 0.0101, '1000 at 12% for a year gives ' + st.big);
    st = await drive({ amP: '200000', amR: '6', amT: '15' }); ok('extremes', st.big === '$1,687.71' && NI(st.nums, 'Total interest') === '$103,788.46', 'calculator.net anchor gives ' + st.big);
    st = await drive({ amP: '12000', amR: '0', amT: '24 months' }); ok('extremes', st.big === '$500.00' && NI(st.nums, 'Total interest') === '$0.00' && !/NaN|Infinity/.test(JSON.stringify(st)), '0% gives ' + st.big);
    st = await drive({ amP: '1000', amR: '12', amT: '1 month' }); ok('extremes', st.big === '$1,010.00' && /Total of 1 payment /.test(st.sub), 'one payment gives ' + st.big + ' / ' + st.sub);
    st = await drive({ amP: '1000000000000', amR: '6', amT: '30' }); ok('extremes', Math.abs(num(st.big) - cf(1e12, 0.005, 360)) < 0.01 + 1e-9 * cf(1e12, 0.005, 360), '1e12 loan gives ' + st.big);
    st = await drive({ amP: '5000', amR: '100', amT: '5' }); ok('extremes', Math.abs(num(st.big) - cf(5000, 100 / 1200, 60)) < 0.0051, '100% rate gives ' + st.big);
    st = await drive({ amP: '200000', amR: '6', amT: '100' }); ok('extremes', Math.abs(num(st.big) - cf(200000, 0.005, 1200)) < 0.0051 && /Total of 1,200 payments/.test(st.sub), '100 years gives ' + st.big + ' / ' + st.sub);
    st = await drive({ amP: '1000', amR: '5', amT: '2', amX: '5000' }); ok('extremes', /Paid off in 1 month \(1 payment\)/.test(st.sub) && NI(st.nums, 'Number of payments').indexOf('1 (without extras: 24)') === 0, 'extra bigger than the loan gives ' + st.sub + ' / ' + NI(st.nums, 'Number of payments'));
    st = await drive({ amP: '5000', amR: '0.01', amT: '3' }); ok('extremes', Math.abs(num(st.big) - cf(5000, 0.0001 / 12, 36)) < 0.0051, '0.01% rate gives ' + st.big);
    const t0 = Date.now(); st = await drive({ amP: '300000', amR: '6', amT: '100', amFreq: 'daily' }); const dt = Date.now() - t0;
    ok('extremes', Math.abs(num(st.big) - cf(300000, 0.06 / 365, 36500)) < 0.0051 && /Total of 36,500 payments/.test(st.sub) && dt < 15000, 'daily for 100 years (36,500 payments) gives ' + st.big + ' in ' + dt + ' ms');
    st = await drive({ amP: '200000', amR: '6', amT: '15', amFreq: 'biweekly' }); ok('extremes', Math.abs(num(st.big) - cf(200000, 0.06 / 26, 390)) < 0.0051, 'biweekly 15 years gives ' + st.big);
    st = await drive({ amP: '200000', amR: '6', amT: '15', amFreq: 'monthly', amComp: 'cont' }); { const r = Math.pow(Math.exp(0.06), 1 / 12) - 1; ok('extremes', Math.abs(num(st.big) - cf(200000, r, 180)) < 0.0051, 'continuous compounding gives ' + st.big); } }

  /* ======== 3. visual ======== */
  await drive({ amP: '300000', amR: '6.5', amT: '30' });
  const geo = JSON.parse(await ctx.eval('JSON.stringify((function(){var svg=document.querySelector("#amVis svg");if(!svg)return null;var paths=[].map.call(svg.querySelectorAll("path"),function(p){return {fill:p.getAttribute("fill"),d:p.getAttribute("d")};});' +
    'var lines=[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),y1:+l.getAttribute("y1"),x2:+l.getAttribute("x2"),y2:+l.getAttribute("y2"),sw:l.getAttribute("stroke-width"),da:l.getAttribute("stroke-dasharray")};});' +
    'var texts=[].map.call(svg.querySelectorAll("text"),function(t){return {t:t.textContent,fs:+t.getAttribute("font-size")};});var sc=svg.getBoundingClientRect().width/280;var card=svg.closest(".card").getBoundingClientRect();var sr=svg.getBoundingClientRect();' +
    'var barP=document.querySelector("#amSplit .am-p"),barI=document.querySelector("#amSplit .am-i");var mb=document.getElementById("mbar");' +
    'var tables=[].map.call(document.querySelectorAll(".card table"),function(t){var r=t.getBoundingClientRect(),c=t.closest(".card").getBoundingClientRect();return {id:t.id,right:r.right,cardRight:c.right,w:r.width};});' +
    'return {paths:paths,lines:lines,texts:texts,scale:sc,svgRight:sr.right,cardRight:card.right,pw:barP?parseFloat(barP.style.width):null,iw:barI?parseFloat(barI.style.width):null,mval:document.getElementById("amMVal").textContent,big:document.getElementById("amBig").textContent,tables:tables,slideMin:+document.getElementById("amSlide").min,slideMax:+document.getElementById("amSlide").max,slideVal:+document.getElementById("amSlide").value};})())'));
  const st = await read();
  ok('visual', !!geo && geo.paths.length >= 2, 'chart paths missing');
  const pts = (d) => d.replace(/Z$/, '').split('L').map((q) => q.replace(/^M/, '').split(',').map(Number));
  const prin = geo.paths.filter((p) => p.fill === '#37503F')[0], inte = geo.paths.filter((p) => p.fill === '#D99A33')[0], CB = 140;
  const pay = num(st.big), i1 = num(NI(st.nums, 'Interest in the first payment')), iN = num(NI(st.nums, 'Interest in the last payment'));
  { const P = pts(prin.d), I = pts(inte.d), hp = P.length / 2, hi = I.length / 2;
    const pr1 = P[P.length - 1], top1 = I[I.length - 1], prN = P[hp], topN = I[hi];
    ok('visual', Math.abs((CB - pr1[1]) / (CB - top1[1]) - (pay - i1) / pay) < 0.004, 'principal share of the first payment on the chart ' + ((CB - pr1[1]) / (CB - top1[1])) + ' vs ' + ((pay - i1) / pay));
    ok('visual', Math.abs((CB - prN[1]) / (CB - topN[1]) - (pay - iN) / pay) < 0.01, 'principal share of the last payment on the chart ' + ((CB - prN[1]) / (CB - topN[1])) + ' vs ' + ((pay - iN) / pay));
    ok('visual', Math.abs(P[0][0] - 46) < 0.06 && Math.abs(P[hp - 1][0] - 272) < 0.06, 'chart spans x 46 to 272, got ' + P[0][0] + ' to ' + P[hp - 1][0]); }
  { const mk = geo.lines.filter((l) => l.sw === '2')[0], N = 360; const x = 46 + (geo.slideVal - 1) / (N - 1) * 226; ok('visual', !!mk && Math.abs(mk.x1 - x) < 0.06, 'marker x ' + (mk && mk.x1) + ' vs slider ' + geo.slideVal + ' expected ' + x);
    ok('visual', geo.slideMin === 1 && geo.slideMax === 360, 'slider range ' + geo.slideMin + '..' + geo.slideMax);
    const cr = /From payment (\d+)/.exec(st.tip), dl = geo.lines.filter((l) => l.da === '2 3')[0]; ok('visual', !!cr && !!dl && Math.abs(dl.x1 - (46 + (+cr[1] - 1) / (N - 1) * 226)) < 0.06, 'crossover line x ' + (dl && dl.x1) + ' vs payment ' + (cr && cr[1])); }
  { const pt = (num(NI(st.nums, 'Loan amount'))) / num(NI(st.nums, 'Total you pay')) * 100; ok('visual', Math.abs(geo.pw - Math.round(pt * 100) / 100) < 0.011 && Math.abs(geo.pw + geo.iw - 100) < 0.011, 'split bar widths ' + geo.pw + ' / ' + geo.iw + ' vs ' + pt); }
  ok('visual', geo.texts.length >= 5 && geo.texts.every((t) => t.fs * geo.scale >= 11), 'chart text under 11px rendered: ' + geo.texts.map((t) => t.fs * geo.scale).join(','));
  ok('visual', geo.svgRight <= geo.cardRight + 1, 'chart pokes out of the card');
  ok('visual', geo.tables.every((t) => t.right <= t.cardRight + 1), 'a table is wider than its card: ' + JSON.stringify(geo.tables.filter((t) => t.right > t.cardRight + 1)));
  ok('visual', geo.mval === geo.big, 'sticky bar value ' + geo.mval + ' vs headline ' + geo.big);
  { await ctx.seg('amSchSeg', 'pay'); const g2 = JSON.parse(await ctx.eval('JSON.stringify((function(){var t=document.getElementById("amSch").getBoundingClientRect(),c=document.getElementById("amSch").closest(".card").getBoundingClientRect(),w=document.getElementById("amSch").closest(".am-tbl");return {r:t.right,c:c.right,sw:w.scrollWidth,cw:w.clientWidth};})())')); ok('visual', g2.r <= g2.c + 1, 'payment-by-payment table wider than the card ' + JSON.stringify(g2)); await ctx.seg('amSchSeg', 'year'); }
  { const sizes = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll("#amBody td,#amBody th,#amBody p,#amBody li"),function(e){return parseFloat(getComputedStyle(e).fontSize);}))')); ok('visual', sizes.length > 20 && Math.min.apply(null, sizes) >= 12.5, 'smallest rendered text in the result ' + Math.min.apply(null, sizes) + 'px'); }
  return { fails, cats, runs };
};
