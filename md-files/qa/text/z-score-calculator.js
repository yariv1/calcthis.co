/* FINAL GATE script for z-score-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, formula example, z table cells, percentile table, critical z table, bands table, comparison and sample-mean examples, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   z = 0, +-1e9, a spread of 1e-9, known constants (Phi(1), Phi(1.96), z for 97.5%, 99.5%, 99.9%, 1e-5, 1 - 1e-6 from the published tables of the normal distribution), two-number lists, and a time limit.
   visual:     the drawn curve is re-measured from the SVG: tick positions are linear in z, the marker sits at the right place, the shaded area ends at the marker, the bands are symmetrical and 1:2:3, the own-units labels equal mean + z x SD, text size >= 11px rendered. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  let s = 20261113; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return t.replace('-', '−'); };
  const num = (t) => { const q = String(t).replace(/−/g, '-').match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("zsBig"),sub:g("zsSub"),tip:g("zsTip"),nums:rows("zsNums"),prob:rows("zsProb"),cnote:g("zsConfNote"),bnote:g("zsBetweenNote"),lsum:g("zsListSum"),ltab:rows("zsListTab"),main:g("zsMainNote"),hint:g("zsHint")};})())'));
  const reset = async (mode) => { const o = (await ctx.eval('document.getElementById("zsAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('zsAdvBtn'); await ctx.click('zsClear'); await ctx.seg('zsMode', mode || 'one'); await ctx.seg('zsListKind', 'pop'); await ctx.set('zsList', ''); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const LEFT = 'Below z — percentile, P(Z < z)', RIGHT = 'Above z, P(Z > z)', BETW = 'Between −|z| and |z| (two-tailed confidence level)';
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const leftOf = async (z) => { await reset('one'); await ctx.set('zsZ', String(z)); runs++; const st = await read(); return num(row(st.prob, LEFT)[1]); };

  /* ======== 1. textVsTool ======== */
  { /* lead + formula section: 85, 75, 10 */
    await reset('one'); await setAll({ zsX: '85', zsMean: '75', zsSd: '10' }); runs++; const st = await read(), zr = row(st.nums, 'z-score')[1], l = row(st.prob, LEFT), r = row(st.prob, RIGHT);
    inText(H, 'z-score of ' + fx(num(zr), 2), 'lead z'); inText(H, 'higher than ' + l[2] + ' of the group', 'lead percentile');
    inText(C, 'gives z = ' + zr, 'formula z'); inText(C, 'the area to its left is ' + l[1], 'formula area'); inText(C, l[2] + ' of the group scores lower and ' + r[2] + ' higher', 'formula shares');
  }
  { /* z table: 12 random cells re-read from the tool */
    const tab = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll("#zsZTable tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});}))'));
    ok('textVsTool', tab.length === 35 && tab[0].length === 11, 'z table should have 35 rows of 11 cells, has ' + tab.length + ' x ' + (tab[0] || []).length);
    const picks = [[0, 0], [10, 0], [19, 6], [34, 9], [1, 5], [3, 3], [29, 9]]; for (let i = 0; i < 6; i++) picks.push([Math.floor(R() * 35), Math.floor(R() * 10)]);
    for (const [i, j] of picks) { const z = Math.round((i / 10 + j / 100) * 100) / 100, got = await leftOf(z), cell = parseFloat(tab[i][j + 1]); cats.textVsTool++; if (Math.abs(got - cell) > 5.1e-5) fails.push('text-vs-tool z table z=' + z + ' cell ' + cell + ' tool ' + got); }
  }
  { /* percentile table */
    const tab = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))'));
    const pt = tab.filter((t) => t[0] && t[0][0] === 'Percentile')[0], ct = tab.filter((t) => t[0] && t[0][0] === 'Confidence level')[0], bt = tab.filter((t) => t[0] && t[0][0] === 'Distance from the mean')[0];
    ok('textVsTool', !!pt && !!ct && !!bt, 'percentile, critical z and bands tables not found');
    for (const r of pt.slice(1)) { const p = parseFloat(r[0]); await reset('one'); await ctx.set('zsPct', String(p)); runs++; const st = await read(); inText(r[1], fx(num(row(st.nums, 'z-score')[1]), 4), 'percentile ' + p + ' z'); }
    for (const r of ct.slice(1)) { const c = parseFloat(r[0]); await reset('one'); await ctx.set('zsConf', String(c)); runs++; const st = await read(); inText(r[1], '±' + st.cnote.match(/critical z of ±([\d.]+)/)[1], 'two-tailed z for ' + c + '%'); await reset('one'); await ctx.set('zsPct', String(c)); runs++; const st2 = await read(); inText(r[2], fx(num(row(st2.nums, 'z-score')[1]), 4), 'one-tailed z for ' + c + '%'); }
    for (let k = 1; k <= 3; k++) { await reset('one'); await setAll({ zsZ1: String(-k), zsZ2: String(k) }); runs++; const st = await read(), pc = st.bnote.match(/lies (\S+) of the group/)[1]; inText(bt[k][1], pc, 'band ' + k); }
  }
  { /* comparison example 85 (75, 10) vs 640 (500, 100) */
    await reset('two'); await setAll({ zsX: '85', zsMean: '75', zsSd: '10', zsX2: '640', zsMean2: '500', zsSd2: '100' }); runs++; const st = await read(), zr = row(st.nums, 'z-score'), pr = row(st.nums, 'Higher than (percentile)');
    inText(C, 'has z = ' + fx(num(zr[1]), 2) + ', while', 'compare A z'); inText(C, 'has z = ' + fx(num(zr[2]), 2) + '. The second is higher than ' + pr[2] + ' of its group, the first than ' + pr[1], 'compare B z + percentiles');
  }
  { /* sample mean example: 76 vs 75, sd 10, n 36 */
    await reset('one'); await setAll({ zsX: '76', zsMean: '75', zsSd: '10', zsN: '36' }); runs++; const st = await read();
    inText(C, 'standard error of ' + fx(num(row(st.nums, 'Standard error (σ ÷ √n)')[1]), 4), 'sample mean SE'); inText(C, 'z = ' + fx(num(row(st.nums, 'z-score')[1]), 2) + ', higher than ' + row(st.prob, LEFT)[2] + ' of sample means', 'sample mean z');
  }
  { /* FAQ numbers */
    for (const [p, lab] of [[95, 'The 95th percentile has z = '], [5, 'the 5th has z = ']]) { await reset('one'); await ctx.set('zsPct', String(p)); runs++; const st = await read(); inText(C, lab + fx(num(row(st.nums, 'z-score')[1]), 4), 'FAQ percentile ' + p); }
    for (const c of [90, 95, 99]) { await reset('one'); await ctx.set('zsConf', String(c)); runs++; const st = await read(); inText(C, '±' + st.cnote.match(/critical z of ±([\d.]+)/)[1] + ' for ' + c + '%', 'FAQ conf ' + c); }
    await reset('one'); await setAll({ zsZ1: '-2', zsZ2: '2' }); runs++; let st = await read(); const m2 = st.bnote.match(/lies (\S+) of the group/)[1]; await reset('one'); await ctx.set('zsZ', '2'); runs++; st = await read(); inText(C, row(st.prob, 'Outside −|z| and |z| (both tails)')[2] + ' of values lie more than 2', 'FAQ beyond 2');
    await reset('one'); await ctx.set('zsZ', '3'); runs++; st = await read(); inText(C, row(st.prob, 'Outside −|z| and |z| (both tails)')[2] + ' lie more than 3', 'FAQ beyond 3'); inText(C, 'further out than ' + row(st.prob, BETW)[2] + '.', 'bands sentence 3');
    await reset('one'); await setAll({ zsZ: '1', zsMean: '75', zsSd: '10' }); runs++; st = await read(); inText(C, 'give a score of ' + st.big, 'FAQ solve score');
    ok('textVsTool', m2.length > 0, 'band 2 read');
  }

  /* ======== 2. extremes ======== */
  { /* known constants of the normal distribution */
    const K = [[1, 0.8413447], [1.96, 0.9750021], [-1.96, 0.0249979], [3, 0.9986501], [0, 0.5]];
    for (const [z, p] of K) { const got = await leftOf(z); cats.extremes++; const mag = Math.floor(Math.log10(p)); if (Math.abs(got - p) > 0.5 * Math.pow(10, mag - 3) * 1.03) fails.push('extremes Phi(' + z + ') tool ' + got + ' vs ' + p + ' (4 significant digits)'); }
    const Q = [[97.5, 1.959964], [99.5, 2.575829], [95, 1.644854], [99.9, 3.090232], [0.001, -4.264891], [99.9999, 4.753424], [50, 0]];
    for (const [pc, z] of Q) { await reset('one'); await ctx.set('zsPct', String(pc)); runs++; const st = await read(), got = num(row(st.nums, 'z-score')[1]); cats.extremes++; if (Math.abs(got - z) > 6e-5) fails.push('extremes z for ' + pc + '% tool ' + got + ' vs ' + z); }
  }
  { /* z = 0, huge z, tiny spread, negative */
    await reset('one'); await setAll({ zsX: '75', zsMean: '75', zsSd: '10' }); runs++; let st = await read(); ok('extremes', st.big === 'z = 0.00' && /exactly at the mean/.test(st.sub) && row(st.prob, LEFT)[2] === '50.00%', 'z = 0 shows [' + st.big + '] [' + st.sub + ']');
    const t1 = Date.now(); await reset('one'); await setAll({ zsX: '1000000000', zsMean: '0', zsSd: '1' }); runs++; st = await read(); ok('extremes', st.big === 'z = 1000000000.00' && !/NaN|undefined|Infinity/.test(JSON.stringify(st)) && row(st.prob, LEFT)[2] === '>99.99%', 'z = 1e9 shows [' + st.big + '] [' + (row(st.prob, LEFT) || []).join('|') + ']');
    await reset('one'); await setAll({ zsX: '1', zsMean: '0', zsSd: '0.000000001' }); runs++; st = await read(); ok('extremes', /^z = 1000000000\.00$/.test(st.big), 'tiny spread shows [' + st.big + ']');
    await reset('one'); await setAll({ zsX: '-1000000000', zsMean: '0', zsSd: '1' }); runs++; st = await read(); ok('extremes', st.big === 'z = −1000000000.00' && row(st.prob, LEFT)[2] === '<0.01%', 'z = -1e9 shows [' + st.big + '] [' + (row(st.prob, LEFT) || []).join('|') + ']');
    ok('extremes', Date.now() - t1 < 6000, 'the huge-z cases took ' + (Date.now() - t1) + 'ms');
  }
  { /* lists of two numbers */
    await reset('one'); await ctx.set('zsList', '0 2'); runs++; let st = await read(); ok('extremes', st.ltab.length === 3 && Math.abs(num(st.ltab[1][1]) + 1) < 1e-4 && Math.abs(num(st.ltab[2][1]) - 1) < 1e-4, 'population list 0, 2 should give z = -1 and 1: ' + JSON.stringify(st.ltab));
    await ctx.seg('zsListKind', 'sample'); st = await read(); ok('extremes', Math.abs(num(st.ltab[2][1]) - Math.SQRT1_2) < 1e-4, 'sample list 0, 2 should give z = 0.7071: ' + JSON.stringify(st.ltab));
    await reset('one'); await setAll({ zsX: '5', zsMean: '5', zsSd: '1', zsN: '1' }); runs++; st = await read(); ok('extremes', st.big === 'z = 0.00', 'n = 1 same score as mean shows [' + st.big + ']');
  }

  /* ======== 3. visual: what is drawn, re-measured from the SVG ======== */
  const MEAS = 'JSON.stringify((function(){var svg=document.querySelector("#zsVis svg");if(!svg)return null;var T=[].map.call(svg.querySelectorAll("text"),function(t){return {t:t.textContent,x:+t.getAttribute("x"),y:+t.getAttribute("y"),fs:+t.getAttribute("font-size")};});var L=[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),x2:+l.getAttribute("x2"),sw:+l.getAttribute("stroke-width"),da:l.getAttribute("stroke-dasharray")||""};});var P=[].map.call(svg.querySelectorAll("path"),function(p){return {d:p.getAttribute("d"),fo:p.getAttribute("fill-opacity")||""};});var r=svg.getBoundingClientRect(),cr=svg.closest(".card").getBoundingClientRect();return {T:T,L:L,P:P,w:r.width,vw:svg.viewBox.baseVal.width,right:r.right,cright:cr.right};})())';
  const measure = async () => JSON.parse(await ctx.eval(MEAS));
  const ticksOf = (m) => m.T.filter((t) => t.y === 138 && /^[−\d.]+$/.test(t.t)).map((t) => ({ z: parseFloat(t.t.replace('−', '-')), x: t.x }));
  const fit = (tk) => { const a = tk[0], b = tk[tk.length - 1], sl = (b.x - a.x) / (b.z - a.z); return { at: (z) => a.x + (z - a.z) * sl, sl, dev: Math.max.apply(null, tk.map((t) => Math.abs(a.x + (t.z - a.z) * sl - t.x))) }; };
  const visualFor = async (tag, setup, zs, mean, sd, k) => {
    await reset('one'); await setAll(setup); runs++; const m = await measure(); if (!m) { fails.push('visual ' + tag + ': no picture'); cats.visual += 5; return; }
    const tk = ticksOf(m), f = fit(tk);
    ok('visual', tk.length >= 3 && f.dev < 0.2, tag + ' z ticks not linear / too few: ' + tk.length + ' dev ' + f.dev);
    const mk = m.L.filter((l) => l.da === '3 3')[0]; ok('visual', !!mk && Math.abs(mk.x1 - f.at(zs)) < 0.3, tag + ' marker x ' + (mk && mk.x1) + ' vs z position ' + f.at(zs));
    const area = m.P.filter((p) => p.fo === '.34')[0], lastL = area && area.d.match(/L([\d.]+),[\d.]+Z$/); ok('visual', !!lastL && Math.abs(parseFloat(lastL[1]) - f.at(zs)) < 0.3, tag + ' shaded area ends at ' + (lastL && lastL[1]) + ' but the marker is at ' + f.at(zs));
    const bands = m.L.filter((l) => l.sw === 8).sort((a, b) => (a.x2 - a.x1) - (b.x2 - b.x1)); ok('visual', bands.length === 3 && [1, 2, 3].every((b, i) => Math.abs(bands[i].x1 - f.at(-b)) < 0.3 && Math.abs(bands[i].x2 - f.at(b)) < 0.3), tag + ' bands are not at ±1, ±2, ±3 SD');
    if (mean !== null) { const raws = m.T.filter((t) => t.y === 154 && t.t !== 'score'); ok('visual', raws.length === tk.length && raws.every((r, i) => r.t === String(Number((mean + tk[i].z * sd * k).toFixed(Math.max(0, Math.min(6, 2 - Math.floor(Math.log10(sd * k) + 1e-9)))))).replace('-', '−')), tag + ' own-units labels differ from mean + z x SD: ' + raws.map((r) => r.t).join(',')); } else cats.visual++;
    const scale = m.w / m.vw; ok('visual', m.T.every((t) => t.fs * scale >= 11), tag + ' text smaller than 11px rendered (scale ' + scale.toFixed(2) + ')');
    ok('visual', m.right <= m.cright + 1, tag + ' picture pokes out of its card');
  };
  await visualFor('85/75/10', { zsX: '85', zsMean: '75', zsSd: '10' }, 1, 75, 10, 1);
  await visualFor('far left', { zsX: '30', zsMean: '75', zsSd: '10' }, -4.5, 75, 10, 1);
  await visualFor('big numbers', { zsX: '123456', zsMean: '100000', zsSd: '12345' }, (123456 - 100000) / 12345, 100000, 12345, 1);
  await visualFor('sample mean', { zsX: '76', zsMean: '75', zsSd: '10', zsN: '36' }, 0.6, 75, 10, 1 / 6);
  await visualFor('z only', { zsZ: '2.5' }, 2.5, null, 0, 1);
  { /* two scores: both markers */
    await reset('two'); await setAll({ zsX: '85', zsMean: '75', zsSd: '10', zsX2: '640', zsMean2: '500', zsSd2: '100' }); runs++; const m = await measure(), tk = ticksOf(m), f = fit(tk), mk = m.L.filter((l) => l.da === '3 3').map((l) => l.x1);
    ok('visual', mk.length === 2 && Math.abs(mk[0] - f.at(1)) < 0.3 && Math.abs(mk[1] - f.at(1.4)) < 0.3, 'two scores: markers at ' + mk.join(',') + ' expected ' + f.at(1) + ' and ' + f.at(1.4));
    ok('visual', m.T.some((t) => t.t === 'A: z = 1.00') && m.T.some((t) => t.t === 'B: z = 1.40'), 'two scores: marker labels missing');
    ok('visual', m.P.filter((p) => p.fo === '.34').length === 0, 'two scores: no area should be shaded');
  }
  return { fails, cats, runs };
};
