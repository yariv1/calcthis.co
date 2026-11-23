/* FINAL GATE script for correlation-coefficient-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, formula example, Spearman / Kendall sentence, single-point sentence, critical r table cells, check examples, plan numbers, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   hand-checked values (a 0.8 / 0.8 / 0.6 trio, a tied Kendall tau-b of 0.8), published critical r constants (df 1, 5, 10, 20, 30), perfect and zero correlation, 3 pairs, huge values, 1,000 and 5,000 pairs against a time limit,
               weights of 1, lists against pairs entry.
   visual:     the scatter is re-measured from the SVG: one dot per pair at the right place on the axis labels, the best-fit line with the printed slope, one leave-one-out line per point, rings for the flagged points,
               the gauge marker and interval bar at the printed values, zoom narrows the axes, text size >= 11px as rendered. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return t.replace('-', '−'); };
  const num = (t) => { const q = String(t).replace(/−/g, '-').replace(/,/g, '').match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("ccBig"),sub:g("ccSub"),tip:g("ccTip"),nums:rows("ccNums"),all:rows("ccAll"),loo:rows("ccLoo"),what:rows("ccWhat"),pred:rows("ccPred"),write:g("ccWrite"),hint:g("ccHint"),mval:g("ccMVal"),svg1:document.getElementById("ccVis").innerHTML.length,visKey:g("ccVisKey")};})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("ccAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('ccAdvBtn'); };
  const reset = async (entry, tl, head) => { await advOpen(); await ctx.click('ccClear'); await ctx.seg('ccEntry', entry || 'lists'); await ctx.seg('ccTail', tl || 'two'); await ctx.seg('ccHead', head || 'pearson'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0].indexOf(label) === 0)[0] || null);
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const XS = '1 2 3 4 5 6 7 8 9 10', YS = '52 55 61 58 70 72 69 80 85 60';
  const f2 = (t) => fx(num(t), 2), f4 = (t) => fx(num(t), 4);

  /* ======== 1. textVsTool ======== */
  { await reset('lists', 'two', 'pearson'); await setAll({ ccX: XS, ccY: YS, ccPx: '11' }); runs++; const st = await read();
    const r = row(st.nums, 'Pearson r')[1], p = row(st.nums, 'p-value, two-tailed')[1], t = row(st.nums, 't-score')[1], ci = row(st.nums, '95% interval for r')[1].split(' to '), r2 = row(st.nums, 'r² ')[1];
    const mean = row(st.nums, 'Mean of')[1].split(' / '), sl = row(st.nums, 'Slope / intercept')[1].split(' / '), cov = num(row(st.nums, 'Covariance')[1]);
    const l10 = st.loo.filter((x) => x[0] === '#10')[0];
    inText(H, 'r = ' + r + ', p = ' + p, 'lead r and p'); inText(H, '10 pairs give', 'lead n'); inText(H, 'leaving out pair #10 moves r to ' + l10[3], 'lead single point');
    inText(C, 'the means are ' + f2(mean[0]) + ' and ' + f2(mean[1]), 'formula means'); inText(C, 'Σ(x − x̄)(y − ȳ) = ' + f2(String(cov * 9)), 'formula sum of products');
    inText(C, 'so r = ' + r + ', r² = ' + r2 + ', t(8) = ' + f2(t) + ' and p = ' + p, 'formula r r2 t p'); inText(C, 'runs from ' + ci[0] + ' to ' + ci[1], 'formula interval');
    inText(C, 'Y = ' + f2(sl[1]) + ' + ' + f2(sl[0]) + ' × X', 'formula line');
    const pr = st.pred; inText(C, 'predicts ' + f2(pr[0][1]) + ' at X = 11 (95% prediction interval ' + f2(pr[2][1].split(' to ')[0]) + ' to ' + f2(pr[2][1].split(' to ')[1]) + ')', 'formula prediction');
    const v = row(st.all, 'Value'), pp = row(st.all, 'p-value');
    inText(C, 'Spearman’s ρ is ' + v[2] + ' (p = ' + pp[2] + ') and Kendall’s τ-b is ' + v[3] + ' (p = ' + pp[3] + ')', 'Spearman Kendall sentence');
    inText(C, 'removing pair #10 (X = 10, Y = 60) changes r from ' + r + ' to ' + l10[3] + ', a change of ' + l10[4].replace('+', ''), 'single point sentence');
    inText(C, 'for the 10 pairs above', 'reading interval n'); inText(C, ci[0] + ' to ' + ci[1] + ' for the 10 pairs above', 'reading interval');
    const crit = row(st.nums, 'Smallest |r|')[1]; inText(C, 'only a correlation beyond ±' + crit + ' is significant at 0.05', 'how many pairs crit');
    const w3 = row(st.what, 'Pairs needed for 80% power')[1].replace(' pairs', ''), pm = C.match(/that (\d+) pairs would already give p below 0\.05 and about (\d+) pairs would give 80% power/);
    ok('textVsTool', !!pm && pm[2] === w3, 'plan: text says ' + (pm && pm[2]) + ' pairs for 80% power, the tool says ' + w3);
    if (pm) { const rN = num(r); const rcAt = async (nn) => { const xs2 = [], ys2 = []; for (let i = 0; i < nn; i++) { xs2.push(i + 1); ys2.push((i * 7) % 11 + i * 0.3 + (i % 3)); } await reset('lists', 'two', 'pearson'); await setAll({ ccX: xs2.join(' '), ccY: ys2.join(' ') }); const s3 = await read(); return num(row(s3.nums, 'Smallest |r|')[1]); };
      const N = parseInt(pm[1], 10), cN = await rcAt(N), cM = await rcAt(N - 1); ok('textVsTool', cN < rN && cM >= rN, 'plan: with ' + N + ' pairs the smallest significant |r| is ' + cN + ' and with ' + (N - 1) + ' it is ' + cM + ', which should straddle r = ' + rN); }
    /* FAQ */
    inText(C, 'it gives r = ' + r, 'FAQ r'); inText(C, 'The example gives ' + r + ', called strong', 'FAQ strength'); inText(C, 'r² = ' + r2 + ', about ' + fx(num(r2) * 100, 1) + '%', 'FAQ r squared'); inText(C, 'Pearson is ' + v[1] + ' and Spearman ' + v[2], 'FAQ Pearson Spearman');
    inText(C, 'The example has p = ' + p, 'FAQ p'); inText(C, 'changes r from ' + r + ' to ' + l10[3], 'FAQ single point'); inText(C, '(' + crit + ' for 10 pairs at α = 0.05)', 'FAQ pairs crit');
  }
  { /* published-style check example: eight pairs from 52 to 86 */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1 2 3 4 5 6 7 8', ccY: '52 57 62 67 72 77 83 86' }); runs++; const st = await read();
    const r = row(st.nums, 'Pearson r')[1], t = row(st.nums, 't-score')[1], p = row(st.nums, 'p-value, two-tailed')[1];
    inText(C, 'r = ' + r + ', t = ' + t + ' and p = ' + p, 'sources check r t p'); inText(C, 'r = ' + r + ', t = ' + t + ' and a p-value of ' + p, 'check examples r t p');
  }
  { /* critical r table cells against the tool: n = df + 2 pairs with the level typed */
    for (const [df, a] of [[1, '0.05'], [4, '0.10'], [10, '0.05'], [20, '0.01'], [30, '0.05'], [100, '0.10']]) {
      const n = df + 2, xs = [], ys = []; for (let i = 0; i < n; i++) { xs.push(i + 1); ys.push((i * 7) % 11 + i * 0.3 + (i % 3)); }
      await reset('lists', 'two', 'pearson'); await setAll({ ccX: xs.join(' '), ccY: ys.join(' '), ccAlpha: a }); runs++; const st = await read(), cr = row(st.nums, 'Smallest |r|');
      const cell = fx(num(cr[1]), 3); const tbl = await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});}))');
      const rows = JSON.parse(tbl), want = rows.filter((x) => x[0] === String(df))[0], col = a === '0.10' ? 1 : a === '0.05' ? 2 : 3; ok('textVsTool', !!want && want[col] === cell, 'critical r table df ' + df + ' alpha ' + a + ': table says ' + (want && want[col]) + ', tool says ' + cell);
    }
  }

  /* ======== 2. extremes ======== */
  { /* hand-checked trio: r = 0.8, rho = 0.8, tau = 0.6 */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1 2 3 4 5', ccY: '2 1 4 3 5' }); runs++; const st = await read(), v = row(st.all, 'Value');
    ok('extremes', f4(v[1]) === '0.8000' && f4(v[2]) === '0.8000' && f4(v[3]) === '0.6000', 'x 1..5, y 2 1 4 3 5 should give 0.8, 0.8 and 0.6, page says ' + v.slice(1).join(' / '));
  }
  { /* tied Kendall tau-b = 0.8 */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1 2 2 3', ccY: '1 2 3 3' }); runs++; const st = await read(), v = row(st.all, 'Value');
    ok('extremes', f4(v[3]) === '0.8000', 'tied tau-b should be 0.8 (4 concordant of sqrt(5 * 5) pairs), page says ' + v[3]);
  }
  { /* perfect, zero */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1 2 3 4', ccY: '3 5 7 9' }); runs++; let st = await read(); ok('extremes', st.big === 'r = 1.0000' && !/NaN|Infinity|undefined/.test(JSON.stringify(st)), 'perfect line: ' + st.big);
    await setAll({ ccY: '9 7 5 3' }); st = await read(); ok('extremes', st.big === 'r = −1.0000', 'perfect negative: ' + st.big);
    await setAll({ ccX: '-5 -4 -3 -2 -1 0 1 2 3 4 5', ccY: '25 16 9 4 1 0 1 4 9 16 25' }); st = await read(); ok('extremes', st.big === 'r = 0.0000' && /No correlation/.test(st.sub), 'U shape: ' + st.big + ' / ' + st.sub);
  }
  { /* three pairs, interval needs four */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1 2 3', ccY: '2 4 7' }); runs++; const st = await read(); ok('extremes', /at least 4 pairs/.test(row(st.nums, '95% interval for r')[1]) && st.big !== '—', 'three pairs: ' + st.big);
  }
  { /* weights of 1 give Pearson; lists and pairs agree */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: XS, ccY: YS, ccW: '1 1 1 1 1 1 1 1 1 1' }); runs++; let st = await read(); ok('extremes', f4(row(st.nums, 'Weighted Pearson r')[1]) === f4(row(st.nums, 'Pearson r')[1]), 'weights of 1 should equal Pearson r');
    const lr = row(st.nums, 'Pearson r')[1]; await reset('pairs', 'two', 'pearson'); await setAll({ ccP: XS.split(' ').map((v, i) => v + ', ' + YS.split(' ')[i]).join('\n') }); st = await read(); ok('extremes', row(st.nums, 'Pearson r')[1] === lr, 'pairs entry should equal lists entry');
  }
  { /* leave-one-out: removing the odd point gives a perfect line */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1 2 3 4 10', ccY: '1 2 3 4 0' }); runs++; const st = await read(), l5 = st.loo.filter((x) => x[0] === '#5')[0]; ok('extremes', !!l5 && f4(l5[3]) === '1.0000', 'without the odd point r should be 1, page says ' + (l5 && l5[3]));
  }
  { /* published critical r constants through the tool (standard r tables) */
    for (const [df, a, want] of [[1, '0.05', 0.997], [5, '0.05', 0.754], [10, '0.05', 0.576], [20, '0.05', 0.423], [30, '0.01', 0.449]]) {
      const n = df + 2, xs = [], ys = []; for (let i = 0; i < n; i++) { xs.push(i + 1); ys.push((i * 5) % 13 + (i % 4)); }
      await reset('lists', 'two', 'pearson'); await setAll({ ccX: xs.join(' '), ccY: ys.join(' '), ccAlpha: a }); runs++; const st = await read(); ok('extremes', Math.abs(num(row(st.nums, 'Smallest |r|')[1]) - want) < 0.0006, 'critical r df=' + df + ' alpha=' + a + ' should be ' + want + ' (published r table), page says ' + row(st.nums, 'Smallest |r|')[1]);
    }
  }
  { /* huge values and large data against a time limit */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '1e9 -1e9 5e8 -5e8 2e8', ccY: '9e8 -9e8 4e8 -3e8 1e8' }); runs++; const st = await read(); ok('extremes', !/NaN|Infinity|undefined/.test(JSON.stringify(st)) && st.big !== '—', 'huge values: ' + st.big);
    let s2 = 7; const R = () => { s2 = (s2 * 1664525 + 1013904223) % 4294967296; return s2 / 4294967296; };
    for (const n of [1000, 5000]) { const xs = [], ys = []; for (let i = 0; i < n; i++) { const a = R() * 100; xs.push(a.toFixed(2)); ys.push((a * 0.5 + R() * 30).toFixed(2)); } await reset('lists', 'two', 'pearson'); const t1 = Date.now(); await setAll({ ccX: xs.join(' '), ccY: ys.join(' ') }); runs++; const st2 = await read(); ok('extremes', st2.big !== '—' && Date.now() - t1 < 25000, n + ' pairs: ' + st2.big + ' in ' + (Date.now() - t1) + ' ms'); }
  }
  ok('extremes', Date.now() - t0 < 600000, 'the text script took too long');

  /* ======== 3. visual ======== */
  const geo = async (id) => JSON.parse(await ctx.eval('JSON.stringify((function(){var svg=document.querySelector("#' + id + ' svg");if(!svg)return null;var vb=svg.viewBox.baseVal,sc=svg.getBoundingClientRect().width/vb.width;' +
    'return {sc:sc,texts:[].map.call(svg.querySelectorAll("text"),function(t){return {x:+t.getAttribute("x"),y:+t.getAttribute("y"),t:t.textContent,fs:+t.getAttribute("font-size")};}),' +
    'circles:[].map.call(svg.querySelectorAll("circle"),function(c){return {x:+c.getAttribute("cx"),y:+c.getAttribute("cy"),r:+c.getAttribute("r"),f:c.getAttribute("fill")};}),' +
    'lines:[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),x2:+l.getAttribute("x2"),y1:+l.getAttribute("y1"),y2:+l.getAttribute("y2"),s:l.getAttribute("stroke"),w:l.getAttribute("stroke-width")};}),' +
    'paths:[].map.call(svg.querySelectorAll("path"),function(p){return {d:p.getAttribute("d"),f:p.getAttribute("fill"),o:p.getAttribute("fill-opacity")};})};})())'));
  const isNum = (t) => /^[−-]?\d+(\.\d+)?$/.test(t);
  const xFit = (texts) => { const ts = texts.filter((q) => isNum(q.t) && Math.abs(q.y - 218) < 0.5).sort((a, b) => a.x - b.x); if (ts.length < 2) return null; const v0 = num(ts[0].t), v1 = num(ts[ts.length - 1].t), b = (ts[ts.length - 1].x - ts[0].x) / (v1 - v0); return { at: (v) => ts[0].x + (v - v0) * b, lo: v0, hi: v1, n: ts.length }; };
  const yFit = (texts) => { const ts = texts.filter((q) => isNum(q.t) && Math.abs(q.x - 41) < 0.5).sort((a, b) => a.y - b.y); if (ts.length < 2) return null; const v0 = num(ts[0].t), v1 = num(ts[ts.length - 1].t), b = (ts[ts.length - 1].y - ts[0].y) / (v1 - v0); return { at: (v) => ts[0].y - 4 + (v - v0) * b, n: ts.length }; };
  { /* the example scatter */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: XS, ccY: YS }); runs++; const g = await geo('ccVis'), st = await read(); const X = xFit(g.texts), Y = yFit(g.texts);
    ok('visual', !!X && !!Y, 'axis labels of the scatter could not be read');
    const xs = XS.split(' ').map(Number), ys = YS.split(' ').map(Number), dots = g.circles.filter((c) => c.r === 3.3);
    ok('visual', dots.length === 10, 'one dot per pair: ' + dots.length + ' dots for 10 pairs');
    const want = xs.map((v, i) => [X.at(v), Y.at(ys[i])]).sort((a, b) => a[0] - b[0]), got = dots.map((c) => [c.x, c.y]).sort((a, b) => a[0] - b[0]);
    ok('visual', want.every((w, i) => Math.abs(w[0] - got[i][0]) < 0.4 && Math.abs(w[1] - got[i][1]) < 0.4), 'dot positions do not match the data on the axis labels');
    const sl = num(row(st.nums, 'Slope / intercept')[1].split(' / ')[0]), ic = num(row(st.nums, 'Slope / intercept')[1].split(' / ')[1]);
    const ln = g.lines.filter((l) => l.s === '#241A11' && l.w === '1.8')[0]; ok('visual', !!ln, 'best-fit line missing');
    if (ln) { const gx1 = (ln.x1 - X.at(0)) / (X.at(1) - X.at(0)), gx2 = (ln.x2 - X.at(0)) / (X.at(1) - X.at(0)), gy1 = (ln.y1 - Y.at(0)) / (Y.at(1) - Y.at(0)), gy2 = (ln.y2 - Y.at(0)) / (Y.at(1) - Y.at(0)); ok('visual', Math.abs(gy1 - (ic + sl * gx1)) < 0.05 && Math.abs(gy2 - (ic + sl * gx2)) < 0.05, 'the best-fit line is not y = ' + ic + ' + ' + sl + ' x (ends read as ' + gy1.toFixed(2) + ' at ' + gx1.toFixed(2) + ' and ' + gy2.toFixed(2) + ' at ' + gx2.toFixed(2) + ')'); }
    const ghosts = g.lines.filter((l) => l.s === '#B9A98C' || l.s === '#B5761F'); ok('visual', ghosts.length === 10, 'one leave-one-out line per point: ' + ghosts.length);
    const rings = g.circles.filter((c) => c.f === 'none'); ok('visual', rings.length === 1, 'one ringed point expected (#10), found ' + rings.length);
    ok('visual', rings.length === 1 && Math.abs(rings[0].x - X.at(10)) < 0.4 && Math.abs(rings[0].y - Y.at(60)) < 0.4, 'the ring is not around the point (10, 60)');
    ok('visual', g.texts.some((q) => q.t === '#10'), 'the flagged point has no #10 label');
    ok('visual', g.paths.some((p) => p.o === '.16'), 'the amber band is missing');
    const minFs = Math.min.apply(null, g.texts.map((q) => q.fs * g.sc)); ok('visual', minFs >= 11, 'text in the scatter renders at ' + minFs.toFixed(1) + 'px (needs >= 11px)');
    /* gauge */
    const gg = await geo('ccGauge'), r = num(row(st.nums, 'Pearson r')[1]), ci = row(st.nums, '95% interval for r')[1].split(' to ').map(num);
    const ticks = gg.texts.filter((q) => isNum(q.t) && Math.abs(q.y - 64) < 0.5).sort((a, b) => a.x - b.x), gx = (v) => ticks[0].x + (v - num(ticks[0].t)) / (num(ticks[ticks.length - 1].t) - num(ticks[0].t)) * (ticks[ticks.length - 1].x - ticks[0].x);
    ok('visual', ticks.length === 5, 'gauge axis labels: ' + ticks.length);
    const tri = gg.paths.filter((p) => /^M[-\d.]+,22 L/.test(p.d))[0], tx = tri ? parseFloat(tri.d.match(/^M([-\d.]+),22 L([-\d.]+),22/)[1]) + 6 : NaN; ok('visual', Math.abs(tx - gx(r)) < 0.5, 'the gauge marker is not at r (' + tx.toFixed(1) + ' vs ' + gx(r).toFixed(1) + ')');
    const bar = gg.lines.filter((l) => l.w === '3' && l.y1 === l.y2)[0]; ok('visual', !!bar && Math.abs(bar.x1 - gx(ci[0])) < 0.6 && Math.abs(bar.x2 - gx(ci[1])) < 0.6, 'the interval bar does not span the printed interval');
    const gfs = Math.min.apply(null, gg.texts.map((q) => q.fs * gg.sc)); ok('visual', gfs >= 11, 'text in the gauge renders at ' + gfs.toFixed(1) + 'px (needs >= 11px)');
  }
  { /* no flagged point: no rings; negative correlation gauge marker left of zero */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: '2 4 6 8 10 12 14 16', ccY: '90 84 80 71 66 60 52 47' }); runs++; const g = await geo('ccVis'), st = await read(); ok('visual', g.circles.filter((c) => c.f === 'none').length === 0, 'a clean negative line should have no rings');
    const gg = await geo('ccGauge'), tri = gg.paths.filter((p) => /^M[-\d.]+,22 L/.test(p.d))[0], zero = gg.texts.filter((q) => q.t === '0' && Math.abs(q.y - 64) < 0.5)[0]; ok('visual', !!tri && !!zero && parseFloat(tri.d.match(/^M([-\d.]+),22/)[1]) + 6 < zero.x, 'a negative r should put the gauge marker left of 0');
    ok('visual', st.big.indexOf('−0.9') === 4 || /r = −0\.9/.test(st.big), 'negative headline [' + st.big + ']');
  }
  { /* zoom narrows the axes */
    await reset('lists', 'two', 'pearson'); await setAll({ ccX: XS, ccY: YS }); runs++; const g0 = await geo('ccVis'), X0 = xFit(g0.texts); await ctx.eval('document.getElementById("ccZoomIn").click()'); const g1 = await geo('ccVis'), X1 = xFit(g1.texts);
    ok('visual', !!X0 && !!X1 && (X1.hi - X1.lo) < (X0.hi - X0.lo), 'zoom in should narrow the X axis (' + (X0 && X0.lo) + '..' + (X0 && X0.hi) + ' -> ' + (X1 && X1.lo) + '..' + (X1 && X1.hi) + ')');
    await ctx.eval('document.getElementById("ccZoomOut").click()'); const g2 = await geo('ccVis'), X2 = xFit(g2.texts); ok('visual', !!X2 && X2.lo === X0.lo && X2.hi === X0.hi, 'zoom out should restore the axis');
  }
  return { fails, cats, runs };
};
