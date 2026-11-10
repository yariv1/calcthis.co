/* FINAL GATE script for confidence-interval-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, worked example, z and t tables, method tables, FAQ) is re-derived by DRIVING THE TOOL and must appear in that text.
   extremes:   smallest / largest / odd values against closed forms: Cauchy t (1 df) tan(pi p / 2), t with 2 df, exact x = 0 and x = n limits, Wilson with n = 1, Poisson k = 0 -ln(alpha/2), known z constants, plus a time limit.
   visual:     what is DRAWN (shaded area, interval lines, level bars, 4x data bar) re-measured from the SVG and compared with the numbers and with each other. */
module.exports = async function (ctx) {
  let s = 20261112; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0;
  const rd = (x, d) => { const t = x.toFixed(d); return /^-0(\.0*)?$/.test(t) ? t.slice(1) : t.replace('-', '−'); };
  const nums = (t) => (String(t).replace(/−/g, '-').match(/-?\d+\.?\d*(e[+-]?\d+)?/gi) || []).map(parseFloat);
  const clear = async (mode) => { const o = (await ctx.eval('document.getElementById("ciAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('ciAdvBtn'); await ctx.click('ciClear'); await ctx.seg('ciMode', mode || 'mean'); await ctx.seg('ciHave', 'sum'); await ctx.set('ciBy', 'level'); };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("ciBig"),lab:g("ciLab"),sub:g("ciSub"),nums:rows("ciNums"),meth:rows("ciMeth"),need:rows("ciNeed"),tnote:g("ciTargetNote"),main:g("ciMainNote"),hint:g("ciHint"),body:document.getElementById("ciBody").style.display!=="none"};})())'));
  const row = (rows, label) => (rows.filter((r) => r[0].indexOf(label) === 0)[0] || null);
  /* drive helpers: mean(m, sd, n, level, dec) and prop(x, n, method, level, dec) return the read state */
  const driveMean = async (m, sd, n, level, dec, extra) => { await clear('mean'); await ctx.set('ciMean', String(m)); await ctx.set('ciSd', String(sd)); await ctx.set('ciN', String(n)); if (level) await ctx.set('ciLevel', String(level)); if (dec !== undefined) await ctx.set('ciDec', String(dec)); if (extra) for (const k of Object.keys(extra)) await ctx.set(k, String(extra[k])); runs++; return read(); };
  const driveProp = async (x, n, method, level, dec) => { await clear('prop'); await ctx.set('ciMethod', method || 'wald'); await ctx.set('ciX', String(x)); await ctx.set('ciPn', String(n)); if (level) await ctx.set('ciLevel', String(level)); if (dec !== undefined) await ctx.set('ciDec', String(dec)); runs++; return read(); };
  const ivOf = (big) => { const q = nums(big.replace(' to ', ' ').replace(/%/g, '')); return q; };

  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };

  /* ======== 1. textVsTool ======== */
  { /* lead + formulas section: mean 22.8, s 2.7, n 100, 95% */
    const st = await driveMean(22.8, 2.7, 100, '', 6), iv = ivOf(st.big), se = row(st.nums, 'Standard error'), cr = row(st.nums, 'Critical value'), me = nums(row(st.nums, 'Margin of error')[1])[0];
    inText(H, rd(iv[0], 2) + ' to ' + rd(iv[1], 2), 'lead interval');
    inText(C, 'standard error of ' + rd(nums(se[1])[0], 4), 'formulas SE'); inText(C, 't = ' + rd(nums(cr[1])[0], 4), 'formulas t'); inText(C, 'a margin of error of ' + rd(me, 4), 'formulas ME'); inText(C, rd(iv[0], 2) + ' to ' + rd(iv[1], 2), 'formulas interval');
    const z = row(st.meth, 'z (normal)'), zq = ivOf(z[1]); inText(C, 'the margin is ' + rd((zq[1] - zq[0]) / 2, 4), 'formulas z margin'); inText(C, 'with z = ' + rd((await (async () => { const sg = await (async () => { await ctx.seg('ciSpread', 'sigma'); return read(); })(); return nums(row(sg.nums, 'Critical value')[1])[0]; })()), 4), 'formulas z value');
  }
  { /* z table by level */
    for (const [lv, lab] of [['80', '80%'], ['85', '85%'], ['90', '90%'], ['95', '95%'], ['98', '98%'], ['99', '99%'], ['99.9', '99.9%']]) {
      await clear('mean'); await ctx.seg('ciSpread', 'sigma'); await ctx.set('ciMean', '0'); await ctx.set('ciSd', '1'); await ctx.set('ciN', '1'); await ctx.set('ciLevel', lv); await ctx.set('ciDec', '6'); runs++;
      const st = await read(), z = nums(row(st.nums, 'Margin of error')[1])[0]; inText(C, lab + ' ' + rd(z, 3), 'z table ' + lab);
    }
  }
  { /* t table: df x level */
    const T = {};
    for (const df of [2, 5, 10, 20, 30, 60, 120]) { const r = []; for (const lv of ['90', '95', '99']) { await clear('mean'); await ctx.set('ciMean', '0'); await ctx.set('ciSd', '1'); await ctx.set('ciN', String(df + 1)); await ctx.set('ciLevel', lv); await ctx.set('ciDec', '6'); runs++; const st = await read(); r.push(rd(nums(row(st.nums, 'Margin of error')[1])[0] * Math.sqrt(df + 1), 3)); } T[df] = r; inText(C, df + ' ' + r.join(' '), 't table df ' + df); }
    const z = []; for (const lv of ['90', '95', '99']) { await clear('mean'); await ctx.seg('ciSpread', 'sigma'); await ctx.set('ciMean', '0'); await ctx.set('ciSd', '1'); await ctx.set('ciN', '1'); await ctx.set('ciLevel', lv); await ctx.set('ciDec', '6'); runs++; const st = await read(); z.push(rd(nums(row(st.nums, 'Margin of error')[1])[0], 3)); }
    inText(C, 'z (infinite) ' + z.join(' '), 't table z row');
  }
  { /* worked example B and FAQ 1 + 3: mean 20.6, s 3.2, n 50 at 90 / 95 / 99 */
    const out = {};
    for (const lv of ['90', '95', '99']) { const st = await driveMean(20.6, 3.2, 50, lv, 6); out[lv] = { iv: ivOf(st.big), me: nums(row(st.nums, 'Margin of error')[1])[0], se: nums(row(st.nums, 'Standard error')[1])[0], t: nums(row(st.nums, 'Critical value')[1])[0] }; }
    const b = out['95'];
    inText(C, 'standard error is ' + rd(b.se, 4), 'example SE'); inText(C, 'critical value is t = ' + rd(b.t, 4) + ' (49 degrees of freedom)', 'example t'); inText(C, 'margin of error is ' + rd(b.me, 4), 'example ME'); inText(C, 'interval is ' + rd(b.iv[0], 2) + ' to ' + rd(b.iv[1], 2), 'example interval');
    inText(C, 'At 90% it is ' + rd(out['90'].iv[0], 2) + ' to ' + rd(out['90'].iv[1], 2), 'example 90'); inText(C, 'at 99% it is ' + rd(out['99'].iv[0], 2) + ' to ' + rd(out['99'].iv[1], 2), 'example 99');
    inText(C, rd(b.me, 4) + ' as the margin of error at 95% and an interval of ' + rd(b.iv[0], 2) + ' to ' + rd(b.iv[1], 2), 'FAQ1'); inText(C, rd(out['90'].iv[0], 2) + ' to ' + rd(out['90'].iv[1], 2) + ' at 90% and ' + rd(out['99'].iv[0], 2) + ' to ' + rd(out['99'].iv[1], 2) + ' at 99%', 'FAQ3 intervals');
  }
  { /* z critical values quoted in FAQ 3 */
    const zs = [];
    for (const lv of ['90', '95', '99']) { await clear('mean'); await ctx.seg('ciSpread', 'sigma'); await ctx.set('ciMean', '0'); await ctx.set('ciSd', '1'); await ctx.set('ciN', '1'); await ctx.set('ciLevel', lv); await ctx.set('ciDec', '6'); runs++; const st = await read(); zs.push(rd(nums(row(st.nums, 'Margin of error')[1])[0], 3)); }
    inText(C, zs[0] + ' at 90%, ' + zs[1] + ' at 95% and ' + zs[2] + ' at 99%', 'FAQ3 z values');
  }
  { /* FAQ 4: t vs z margins for n = 100 */
    const st = await driveMean(22.8, 2.7, 100, '', 6), t = nums(row(st.nums, 'Margin of error')[1])[0], zr = ivOf(row(st.meth, 'z (normal)')[1]);
    inText(C, 'the two margins are ' + rd(t, 4) + ' (t) and ' + rd((zr[1] - zr[0]) / 2, 4) + ' (z)', 'FAQ4');
  }
  { /* proportion method tables and FAQ 5 */
    for (const [x, n, lab] of [[40, 100, '40 yes out of 100'], [3, 40, '3 yes out of 40']]) {
      const st = await driveProp(x, n, 'wald', '', 6), pc = (r) => { const q = ivOf(r[1]); return rd(q[0], 1) + '% to ' + rd(q[1], 1) + '%'; };
      inText(C, 'Normal approximation (Wald) ' + pc(row(st.meth, 'Normal approximation')), 'method table Wald ' + lab); inText(C, 'Wilson score ' + pc(row(st.meth, 'Wilson score')), 'method table Wilson ' + lab); inText(C, 'Exact (Clopper-Pearson) ' + pc(row(st.meth, 'Exact')), 'method table exact ' + lab);
      if (x === 40) { inText(C, pc(row(st.meth, 'Normal approximation')) + ' with the normal approximation', 'FAQ5 wald'); inText(C, pc(row(st.meth, 'Wilson score')) + ' with Wilson', 'FAQ5 wilson'); inText(C, pc(row(st.meth, 'Exact')) + ' with the exact method', 'FAQ5 exact'); }
      else { inText(C, pc(row(st.meth, 'Normal approximation')) + ' with the normal approximation', 'FAQ5 small wald'); inText(C, pc(row(st.meth, 'Wilson score')) + ' with Wilson', 'FAQ5 small wilson'); }
    }
  }
  { /* sample sizes in the text and FAQ 6 */
    const need = async (x, n, E, lv) => { await clear('prop'); await ctx.set('ciX', String(x)); await ctx.set('ciPn', String(n)); await ctx.set('ciTarget', String(E)); if (lv) await ctx.set('ciLevel', lv); runs++; const st = await read(), m = st.tnote.match(/At p̂ = 0\.5 \(the worst case\) it is ([\d,]+)\./); return m ? m[1] : st.tnote; };
    const a = await need(40, 100, 3), b = await need(40, 100, 5);
    inText(C, '±3 percentage points at 95% needs ' + a + ' people', 'FAQ6 3 points'); inText(C, '±5 points needs ' + b, 'FAQ6 5 points'); inText(C, '±3 percentage points at 95% needs ' + a + ' people in the worst case', 'sample size paragraph'); inText(C, '±5 points needs ' + b + '.', 'sample size paragraph 5');
    await clear('mean'); await ctx.set('ciMean', '50'); await ctx.set('ciSd', '15'); await ctx.set('ciN', '30'); await ctx.set('ciTarget', '2'); runs++; const st = await read(), mm = st.tnote.match(/at least ([\d,]+) people/);
    inText(C, 'a margin of ±2 needs ' + (mm ? mm[1] : '?') + ' people', 'FAQ6 mean');
  }
  { /* two groups: FAQ 7 */
    await clear('mean'); await ctx.set('ciMean', '52.3'); await ctx.set('ciSd', '4.5'); await ctx.set('ciN', '25'); await ctx.seg('ciGroups', 'two'); await ctx.set('ciMean2', '49.1'); await ctx.set('ciSd2', '5.1'); await ctx.set('ciN2', '25'); await ctx.set('ciDec', '6'); runs++;
    const st = await read(), iv = ivOf(st.big), est = nums(row(st.nums, 'Difference')[1])[0];
    inText(C, 'a difference of ' + rd(est, 2) + ' with a 95% interval of ' + rd(iv[0], 2) + ' to ' + rd(iv[1], 2), 'FAQ7');
  }
  { /* count: FAQ 10 */
    await clear('count'); await ctx.set('ciK', '10'); await ctx.set('ciDec', '6'); runs++;
    const st = await read(), iv = ivOf(st.big), nr = ivOf(row(st.meth, 'Normal approximation')[1]);
    inText(C, 'A count of 10 gives ' + rd(iv[0], 2) + ' to ' + rd(iv[1], 2) + ' at 95%', 'FAQ10 exact'); inText(C, 'k ± z√k would give ' + rd(nr[0], 2) + ' to ' + rd(nr[1], 2), 'FAQ10 normal');
  }

  /* ======== 2. extremes ======== */
  const ex = (cond, msg) => { cats.extremes++; if (!cond) fails.push('extremes ' + msg); };
  const close = (a, b, tol) => Math.abs(a - b) <= tol;
  { /* t with 1 df: crit = tan(pi * level / 2) */
    for (const lv of [0.8, 0.9, 0.95, 0.99]) { await clear('mean'); await ctx.set('ciMean', '0'); await ctx.set('ciSd', '1'); await ctx.set('ciN', '2'); await ctx.set('ciLevel', String(lv * 100)); await ctx.set('ciDec', '6'); runs++; const st = await read(), c = nums(row(st.nums, 'Critical value')[1])[0]; ex(close(c, Math.tan(Math.PI * lv / 2), 2e-4 * Math.tan(Math.PI * lv / 2)), 'Cauchy t (n = 2, level ' + lv + '): ' + c + ' vs ' + Math.tan(Math.PI * lv / 2)); }
    /* t with 2 df: crit = p sqrt(2 / (1 - p^2)) */
    for (const lv of [0.9, 0.95, 0.99]) { await clear('mean'); await ctx.set('ciMean', '0'); await ctx.set('ciSd', '1'); await ctx.set('ciN', '3'); await ctx.set('ciLevel', String(lv * 100)); await ctx.set('ciDec', '6'); runs++; const st = await read(), c = nums(row(st.nums, 'Critical value')[1])[0], e = lv * Math.sqrt(2 / (1 - lv * lv)); ex(close(c, e, 2e-4 * e), 't with 2 df, level ' + lv + ': ' + c + ' vs ' + e); }
  }
  { /* known z constants */
    for (const [lv, z] of [['90', 1.6448536], ['95', 1.9599640], ['99', 2.5758293], ['99.9', 3.2905267]]) { await clear('mean'); await ctx.seg('ciSpread', 'sigma'); await ctx.set('ciMean', '0'); await ctx.set('ciSd', '1'); await ctx.set('ciN', '1'); await ctx.set('ciLevel', lv); await ctx.set('ciDec', '7'); runs++; const st = await read(), c = nums(row(st.nums, 'Margin of error')[1])[0]; ex(close(c, z, 2e-6), 'z for ' + lv + '%: ' + c + ' vs ' + z); }
  }
  { /* exact limits: x = 0 -> upper = 1 - (a/2)^(1/n); x = n -> lower = (a/2)^(1/n); Wilson n = 1, x = 0 -> upper = z^2/(1+z^2); Wald p = 0.5 */
    let st = await driveProp(0, 10, 'exact', '', 6), q = ivOf(st.big); ex(close(q[0], 0, 1e-9) && close(q[1], 100 * (1 - Math.pow(0.025, 0.1)), 1e-3), 'exact 0 of 10: ' + st.big);
    st = await driveProp(10, 10, 'exact', '', 6); q = ivOf(st.big); ex(close(q[1], 100, 1e-9) && close(q[0], 100 * Math.pow(0.025, 0.1), 1e-3), 'exact 10 of 10: ' + st.big);
    st = await driveProp(0, 1, 'wilson', '', 6); q = ivOf(st.big); const z2 = 1.959964 * 1.959964; ex(close(q[0], 0, 1e-6) && close(q[1], 100 * z2 / (1 + z2), 2e-3), 'Wilson 0 of 1: ' + st.big);
    st = await driveProp(50, 100, 'wald', '', 6); q = ivOf(st.big); ex(close(q[0], 40.2002, 1e-3) && close(q[1], 59.7998, 1e-3), 'Wald 50 of 100: ' + st.big);
    st = await driveProp(50, 100, 'wilson', '', 6); q = ivOf(st.big); ex(close(q[0] + q[1], 100, 1e-6), 'Wilson 50 of 100 is symmetric: ' + st.big);
    st = await driveProp(3, 40, 'wald', '', 6); ex(st.body && !/NaN|undefined/.test(st.big) && ivOf(st.big)[0] >= 0, 'Wald 3 of 40 stays inside 0-100%: ' + st.big);
  }
  { /* Poisson k = 0: upper = -ln(a/2) */
    await clear('count'); await ctx.set('ciK', '0'); await ctx.set('ciDec', '6'); runs++; const st = await read(), q = ivOf(st.big); ex(close(q[0], 0, 1e-9) && close(q[1], -Math.log(0.025), 2e-4), 'Poisson 0: ' + st.big);
    await ctx.set('ciK', '1000000'); runs++; const t0 = Date.now(); const st2 = await read(); ex(st2.body && Date.now() - t0 < 5000 && !/NaN|Infinity/.test(st2.big), 'Poisson 1,000,000 renders: ' + st2.big);
  }
  { /* huge and tiny values, time limit */
    const t0 = Date.now(); let st = await driveMean('1e9', '1e9', '999999999', '', undefined); ex(st.body && !/NaN|Infinity|undefined/.test(st.big + st.sub) && Date.now() - t0 < 8000, 'huge mean/sd/n renders in time: ' + st.big + ' (' + (Date.now() - t0) + ' ms)');
    st = await driveMean('0', '0.0001', '2', '', undefined); ex(st.body && !/NaN|Infinity|undefined/.test(st.big), 'tiny sd renders: ' + st.big);
    st = await driveMean('-500', '25', '12', '99.9999', undefined); ex(st.body && st.big.indexOf('−') >= 0 && !/NaN|Infinity|undefined/.test(st.big), 'negative mean, level 99.9999%: ' + st.big);
    await clear('mean'); await ctx.seg('ciHave', 'list'); await ctx.set('ciList', Array.from({ length: 2000 }, (_, i) => String((i * 7919) % 1000)).join(', ')); runs++; st = await read(); ex(st.body && st.main.indexOf('n = 2000') >= 0, 'list of 2000 numbers: ' + st.main);
    st = await driveMean('10', '2', '100000000', '', undefined); ex(st.body && row(st.nums, 'Critical value')[1].indexOf('z =') === 0, 'n = 100,000,000 falls back to z (t and z agree): ' + (row(st.nums, 'Critical value') || [])[1]);
  }
  { /* margin of error always sits half way between the limits */
    for (let i = 0; i < 4; i++) { const m = rd(R() * 100, 2), sd = rd(R() * 20 + 1, 2), n = pick([3, 9, 40]); const st = await driveMean(m, sd, n, pick(['90', '95', '99']), 6), q = ivOf(st.big), me = nums(row(st.nums, 'Margin of error')[1])[0]; ex(close((q[1] - q[0]) / 2, me, 1e-5) && close((q[0] + q[1]) / 2, parseFloat(m), 1e-5), 'interval is mean ± margin (' + m + ',' + sd + ',' + n + '): ' + st.big); }
  }

  /* ======== 3. visual ======== */
  const svg = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var s=document.querySelector("#ciVis svg");if(!s)return null;var q=function(sel){return [].slice.call(s.querySelectorAll(sel));};' +
    'var vb=s.viewBox.baseVal,r=s.getBoundingClientRect(),lines=q("line");' +
    'var edge=lines.filter(function(l){return l.getAttribute("stroke")==="#37503F"&&l.getAttribute("stroke-width")==="1.6";}).map(function(l){return parseFloat(l.getAttribute("x1"));}).sort(function(a,b){return a-b;});' +
    'var est=lines.filter(function(l){return l.getAttribute("stroke")==="#8F5C13";}).map(function(l){return parseFloat(l.getAttribute("x1"));});' +
    'var bars=lines.filter(function(l){return l.getAttribute("stroke-width")==="8";}).map(function(l){return {x1:parseFloat(l.getAttribute("x1")),x2:parseFloat(l.getAttribute("x2")),on:l.getAttribute("stroke")==="#B5761F"};});' +
    'var gh=q("rect").map(function(x){return {x:parseFloat(x.getAttribute("x")),w:parseFloat(x.getAttribute("width"))};});' +
    'var area=q("path").filter(function(p){return p.getAttribute("fill")==="#B5761F";}).map(function(p){return p.getAttribute("d");})[0]||"";' +
    'var tx=q("text").map(function(t){return {t:t.textContent,fs:parseFloat(t.getAttribute("font-size")),x:parseFloat(t.getAttribute("x"))};});' +
    'return {edge:edge,est:est,bars:bars,gh:gh,area:area,tx:tx,vbw:vb.width,w:r.width,cw:s.parentNode.getBoundingClientRect().width,over:document.documentElement.scrollWidth>window.innerWidth,cwid:document.documentElement.clientWidth};})())'));
  const vis = (cond, msg) => { cats.visual++; if (!cond) fails.push('visual ' + msg); };
  const areaX = (d) => { const p = (d.match(/-?\d+\.?\d*,-?\d+\.?\d*/g) || []).map((x) => parseFloat(x.split(',')[0])); return [p[0], p[p.length - 1]]; };
  const cases = [];
  for (let i = 0; i < 5; i++) cases.push({ k: 'mean', m: rd(R() * 80, 2), sd: rd(R() * 12 + 1, 2), n: pick([4, 12, 30, 90]), lv: pick(['90', '95', '99']) });
  cases.push({ k: 'prop', x: 40, n: 100, lv: '95', method: 'wald' }, { k: 'prop', x: 7, n: 30, lv: '90', method: 'wilson' }, { k: 'prop', x: 3, n: 40, lv: '99', method: 'exact' }, { k: 'count', c: 12, lv: '95' });
  for (const cs of cases) {
    let st; const tag = '[' + JSON.stringify(cs) + '] ';
    if (cs.k === 'mean') st = await driveMean(cs.m, cs.sd, cs.n, cs.lv, 4); else if (cs.k === 'prop') st = await driveProp(cs.x, cs.n, cs.method, cs.lv, 2); else { await clear('count'); await ctx.set('ciK', String(cs.c)); await ctx.set('ciLevel', cs.lv); await ctx.set('ciDec', '3'); runs++; st = await read(); }
    const v = await svg(); if (!v) { vis(false, tag + 'no picture'); continue; }
    const on = v.bars.filter((b) => b.on)[0];
    vis(v.edge.length === 2 && on && close(on.x1, v.edge[0], 0.25) && close(on.x2, v.edge[1], 0.25), tag + 'chosen bar ends ' + JSON.stringify(on) + ' match the interval lines ' + v.edge);
    const ax = areaX(v.area); vis(close(ax[0], v.edge[0], 0.4) && close(ax[1], v.edge[1], 0.4), tag + 'shaded area ' + ax + ' spans the interval lines ' + v.edge);
    vis(v.est.length >= 1 && v.est[0] > v.edge[0] && v.est[0] < v.edge[1], tag + 'estimate line ' + v.est[0] + ' lies inside the interval');
    if (cs.k === 'mean') vis(close(v.est[0] - v.edge[0], v.edge[1] - v.est[0], 0.35), tag + 'mean interval is symmetric around the estimate line');
    const q = ivOf(st.big), lo = (v.tx.filter((t) => t.t.indexOf(String(Math.abs(q[0])).replace('.', '.').slice(0, 3)) >= 0).length > 0); vis(lo, tag + 'labels show the interval numbers (' + st.big + ') in ' + JSON.stringify(v.tx.map((t) => t.t)));
    vis(v.tx.every((t) => t.fs * v.w / v.vbw >= 11), tag + 'text smaller than 11px rendered: ' + v.tx.map((t) => (t.fs * v.w / v.vbw).toFixed(1)).join(','));
    vis(v.w <= v.cw + 1 && !v.over, tag + 'picture wider than its box or the page (' + v.w + ' vs ' + v.cw + ')');
    const g = v.gh[0]; vis(g && g.w < (v.edge[1] - v.edge[0]) && g.w > 0, tag + '4x data bar (' + (g && g.w) + ') should be narrower than the interval (' + (v.edge[1] - v.edge[0]) + ')');
  }
  { /* bar lengths scale like the numbers: 90 < 95 < 99, ratio equals the ratio of the printed widths */
    const w = {}, bl = {};
    for (const lv of ['90', '95', '99']) { const st = await driveMean(30, 6, 25, lv, 6), q = ivOf(st.big); w[lv] = q[1] - q[0]; const v = await svg(); const on = v.bars.filter((b) => b.on)[0]; bl[lv] = on.x2 - on.x1; }
    vis(bl['90'] < bl['95'] && bl['95'] < bl['99'], 'bars widen with the level: ' + JSON.stringify(bl));
    vis(close(bl['99'] / bl['90'], w['99'] / w['90'], 0.02 * w['99'] / w['90']), 'bar length ratio 99/90 (' + (bl['99'] / bl['90']).toFixed(3) + ') matches the numbers (' + (w['99'] / w['90']).toFixed(3) + ')');
    const st = await driveMean(30, 6, 25, '95', 6); const v = await svg(); const on = v.bars.filter((b) => b.on)[0], all = v.bars.length; vis(all === 3, 'three level bars for 90/95/99, got ' + all);
    await ctx.set('ciLevel', '97'); const v2 = await svg(); vis(v2.bars.length === 4 && v2.bars.filter((b) => b.on).length === 1, 'a typed 97% level adds a fourth bar and marks it: ' + v2.bars.length);
  }
  fails.unshift(); return { fails, cats, runs };
};
