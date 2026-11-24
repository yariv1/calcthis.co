/* FINAL GATE script for linear-regression-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, the Wikipedia worked example, curve comparison, single-point sentence, through-origin and quadratic sentences, plan numbers, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   published anchors (Wikipedia heights and masses; Stats Kingdom 13-pair example incl. predictions), exact perfect line, through-origin hand value, exact parabola, huge and tiny values, negative X, 2,000 pairs against a time limit,
               lists against pairs against summary numbers.
   visual:     the scatter is re-measured from the SVG: one dot per pair at the right place on the axis labels, the fitted path through the printed equation, band and two dashed prediction lines, the ring + label + fit-without-it
               line for the steering point, squares with side = error, the residual plot dot heights, zoom narrows the axes, text size >= 11px as rendered. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return t.replace('-', '−'); };
  const num = (t) => { const q = String(t).replace(/−/g, '-').replace(/,/g, '').match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("lrBig"),sub:g("lrSub"),tip:g("lrTip"),coef:rows("lrCoef"),fit:rows("lrFit"),curves:rows("lrCurves"),inf:rows("lrInf"),pred:rows("lrPred"),what:rows("lrWhat"),inv:rows("lrInv"),write:g("lrWrite"),hint:g("lrHint"),mval:g("lrMVal"),svg1:document.getElementById("lrVis").innerHTML.length,visKey:g("lrVisKey")};})())'));
  const reset = async (entry, model, origin) => { await ctx.click('lrClear'); await ctx.seg('lrEntry', entry || 'lists'); await ctx.seg('lrModel', String(model || 1)); await ctx.seg('lrOrigin', origin ? 'zero' : 'fit'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0].indexOf(label) === 0)[0] || null);
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const near = (cat, got, exp, tol, msg) => ok(cat, isFinite(got) && Math.abs(got - exp) <= tol, msg + ' (got ' + got + ', expected ' + exp + ')');
  const XS = '1 2 3 4 5 6 7 8 9 10', YS = '52 55 61 58 70 72 69 80 85 60';
  const HX = '1.47 1.50 1.52 1.55 1.57 1.60 1.63 1.65 1.68 1.70 1.73 1.75 1.78 1.80 1.83', HY = '52.21 53.12 54.48 55.84 57.20 58.57 59.93 61.29 63.11 64.47 66.28 68.10 69.92 72.19 74.46';
  const f2 = (t) => fx(num(t), 2), f3 = (t) => fx(num(t), 3), f4 = (t) => fx(num(t), 4);
  const cell = (r, i) => r[i];

  /* ======== 1. textVsTool ======== */
  { await reset('lists', 1, false); await setAll({ lrX: XS, lrY: YS, lrPx: '11' }); runs++; const st = await read();
    const a = st.coef[1][1], b = st.coef[2][1], se = st.coef[2][2], ci = st.coef[2][5].split(' to '), r2 = row(st.fit, 'R²')[1], adj = row(st.fit, 'Adjusted')[1], p = st.coef[2][4];
    inText(H, 'Ŷ = ' + f2(a) + ' + ' + f2(b) + ' X, R² = ' + r2, 'lead line and R2'); inText(H, '10 pairs give', 'lead n');
    const top = st.inf[1]; inText(H, 'pair ' + top[0] + ' steers the line most', 'lead steering point');
    const pr = st.pred[1]; inText(C, 'Which points', 'section exists');
    inText(C, 'pair ' + top[0] + ' (X = ' + (top[0] === '#10' ? '10, Y = 60' : '?') + ') has a Cook’s distance of ' + f2(top[3]) + ', above the cut-off', 'single point sentence D');
    inText(C, 'moves the slope from ' + f3(b) + ' to ' + f3(top[4]) + ' and R² from ' + r2 + ' to ' + top[5], 'single point slope and R2');
    const faq = C; inText(faq, 'it gives Ŷ = ' + fx(num(a), 4) + ' + ' + fx(num(b), 4) + ' X', 'FAQ equation'); inText(faq, 'each extra 1 of X goes with ' + f2(b) + ' more Y, give or take ' + f2(se) + ' (95% interval ' + f2(ci[0]) + ' to ' + f2(ci[1]) + ')', 'FAQ slope');
    inText(faq, 'R² = ' + r2 + ', about ' + fx(num(r2) * 100, 1) + '%', 'FAQ R2'); inText(faq, 'adjusted R² (' + adj + ' here)', 'FAQ adjusted');
    inText(faq, 'X = 11 gives ' + f2(pr[1]) + ' (new-point interval ' + f2(pr[3].split(' to ')[0]) + ' to ' + f2(pr[3].split(' to ')[1]) + ')', 'FAQ prediction');
    const plan = row(st.what, 'Pairs needed for p below α')[1], m = faq.match(/about (\d+) pairs already give p below 0\.05 if r stays at ([\d.]+)/);
    ok('textVsTool', !!m && (/^Already/.test(plan) ? parseInt(m[1], 10) <= 10 : parseInt(m[1], 10) === num(plan)), 'plan: text says ' + (m && m[1]) + ' pairs, the tool says [' + plan + ']');
    const w3 = row(st.what, 'Pairs needed for 80% power')[1].replace(' pairs', ''), pm = C.match(/reaches p below 0\.05 with (\d+) pairs and about (\d+) pairs give 80% power/);
    ok('textVsTool', !!pm && pm[2] === w3, 'plan right column: text says ' + (pm && pm[2]) + ' for 80% power, the tool says ' + w3);
    ok('textVsTool', C.indexOf('smallest slope that would be significant at 0.05 is ±') >= 0, 'the smallest-slope sentence exists');
  }
  { /* the Wikipedia example */
    await reset('lists', 1, false); await setAll({ lrX: HX, lrY: HY, lrPx: '1.6' }); runs++; const st = await read();
    const a = st.coef[1], b = st.coef[2], r = row(st.fit, 'Correlation r')[1], r2 = row(st.fit, 'R²')[1], F = row(st.fit, 'F-statistic')[1], pf = row(st.fit, 'p-value of the whole fit')[1], pr = st.pred[1];
    inText(C, 'slope ' + f3(b[1]) + ', intercept ' + f3(a[1]) + ', standard errors ' + f3(b[2]) + ' and ' + f3(a[2]), 'worked example slope, intercept, SE');
    inText(C, '95% intervals ' + f2(b[5].split(' to ')[0]) + ' to ' + f2(b[5].split(' to ')[1]) + ' for the slope and ' + f2(a[5].split(' to ')[0]) + ' to ' + f2(a[5].split(' to ')[1]) + ' for the intercept', 'worked example intervals');
    inText(C, 'r = ' + r + ', R² = ' + r2 + ', F(1, 13) = ' + f2(F) + ' and p = ' + pf, 'worked example r R2 F p');
    inText(C, 'predicted to weigh ' + f2(pr[1]) + ' kg (one-new-point interval ' + f2(pr[3].split(' to ')[0]) + ' to ' + f2(pr[3].split(' to ')[1]) + ' kg)', 'worked example prediction');
    inText(C, 'this calculator gives ' + f3(b[1]) + ', ' + f3(a[1]) + ', ' + f2(a[5].split(' to ')[0]) + ' to ' + f2(a[5].split(' to ')[1]) + ' and ' + f2(b[5].split(' to ')[0]) + ' to ' + f2(b[5].split(' to ')[1]), 'sources Wikipedia numbers');
    const cv = st.curves; const q = row(cv, 'Quadratic'), cu = row(cv, 'Cubic'), li = row(cv, 'Straight line');
    inText(C, 'raises R² from ' + li[1] + ' to ' + q[1] + ' and its extra term is significant (p = ' + q[4] + '), while the cubic term is not (p = ' + cu[4] + ')', 'curve comparison');
    inText(C, 'the straight line gives R² = ' + r2 + ', and the quadratic term is significant (p = ' + q[4] + ')', 'FAQ curve');
    inText(C, 'is ±' + f3(st.what[0][1].replace('±', '').split(' ')[0]) + '; yours is ' + f3(b[1]), 'smallest slope sentence');
  }
  { /* through zero and quadratic on the study numbers */
    await reset('lists', 1, true); await setAll({ lrX: XS, lrY: YS }); runs++; let st = await read(); const s0 = st.coef[2][1];
    inText(C, 'changes the study example’s slope from ', 'origin sentence'); inText(C, 'to ' + f3(s0) + '. R² is then measured', 'origin slope'); inText(C, 'the through-zero slope is ' + f3(s0), 'FAQ origin');
    await reset('lists', 2, false); await setAll({ lrX: XS, lrY: YS }); runs++; st = await read(); const c = st.coef, r2q = row(st.fit, 'R²')[1];
    inText(C, 'gives Y = ' + f2(c[1][1]) + ' + ' + f2(c[2][1]) + ' X ' + (num(c[3][1]) < 0 ? '−' : '+') + ' ' + f3(String(Math.abs(num(c[3][1])))) + ' X², with R² = ' + r2q, 'quadratic example');
  }

  /* ======== 2. extremes ======== */
  { await reset('lists', 1, false); await setAll({ lrX: HX, lrY: HY }); const st = await read(); near('extremes', num(st.coef[2][1]), 61.272, 0.001, 'Wikipedia slope 61.272'); near('extremes', num(st.coef[1][1]), -39.062, 0.001, 'Wikipedia intercept -39.062'); near('extremes', num(st.coef[2][2]), Math.sqrt(3.1539), 0.0005, 'Wikipedia slope SE sqrt(3.1539)'); near('extremes', num(st.coef[1][2]), Math.sqrt(8.63185), 0.0005, 'Wikipedia intercept SE sqrt(8.63185)'); near('extremes', num(row(st.fit, 'Correlation r')[1]), 0.9946, 0.00005, 'Wikipedia r 0.9946'); }
  { const SX = '9.8 3.8 6 0.9 5.4 1.4 16.2 19.5 2.1 0.94 43.8 3.9 1.7', SY = '7.6 11 2.4 0.49 4.7 1.4 12.2 10.8 3.27 2.16 28.3 2 1.41';
    await reset('lists', 1, false); await setAll({ lrX: SX, lrY: SY, lrPx: '7, 11, 30, 50' }); runs++; const st = await read(), b = st.coef[2];
    near('extremes', num(st.coef[1][1]), 1.4021, 0.00005, 'Stats Kingdom intercept'); near('extremes', num(b[1]), 0.6021, 0.00005, 'Stats Kingdom slope'); near('extremes', num(b[2]), 0.06245, 0.000005, 'Stats Kingdom slope SE'); near('extremes', num(b[5].split(' to ')[0]), 0.4646, 0.00005, 'Stats Kingdom slope CI low'); near('extremes', num(b[5].split(' to ')[1]), 0.7395, 0.00005, 'Stats Kingdom slope CI high');
    near('extremes', num(row(st.fit, 'R²')[1]), 0.8942, 0.00005, 'Stats Kingdom R2'); near('extremes', num(row(st.fit, 'F-statistic')[1]), 92.9583, 0.00005, 'Stats Kingdom F');
    const p7 = st.pred[1], p11 = st.pred[2], p30 = st.pred[3]; near('extremes', num(p7[1]), 5.6166, 0.00005, 'SK prediction at 7'); near('extremes', num(p7[2].split(' to ')[0]), 4.0066, 0.0001, 'SK interval of line low at 7'); near('extremes', num(p7[3].split(' to ')[0]), -0.3349, 0.0001, 'SK prediction interval low at 7'); near('extremes', num(p7[3].split(' to ')[1]), 11.5681, 0.0001, 'SK prediction interval high at 7');
    near('extremes', num(p11[1]), 8.0248, 0.0001, 'SK prediction at 11'); near('extremes', num(p11[3].split(' to ')[1]), 13.9779, 0.0001, 'SK prediction interval high at 11'); near('extremes', num(p30[1]), 19.4642, 0.0001, 'SK prediction at 30'); ok('extremes', /\*$/.test(st.pred[4][0]) && !/\*$/.test(p30[0]) && !/\*$/.test(p7[0]), 'outside-range star only on 50'); }
  { await reset('lists', 1, false); await setAll({ lrX: '1 2 3 4 5', lrY: '3 5 7 9 11' }); const st = await read(); ok('extremes', /Y = 1 \+ 2 × X/.test(st.big), 'perfect line equation [' + st.big + ']'); near('extremes', num(row(st.fit, 'R²')[1]), 1, 1e-9, 'perfect line R2'); }
  { await reset('lists', 1, true); await setAll({ lrX: '1 2 3 4 5 6', lrY: '2.1 3.9 6.2 7.8 10.1 12.2' }); const st = await read(); const sxy = 1 * 2.1 + 2 * 3.9 + 3 * 6.2 + 4 * 7.8 + 5 * 10.1 + 6 * 12.2, sxx = 91; near('extremes', num(st.coef[2][1]), sxy / sxx, 1e-4, 'through-origin slope = Sxy/Sxx by hand'); }
  { await reset('lists', 2, false); await setAll({ lrX: '-5 -4 -3 -2 -1 0 1 2 3 4 5', lrY: '25 16 9 4 1 0 1 4 9 16 25' }); const st = await read(); near('extremes', num(st.coef[3][1]), 1, 1e-6, 'exact parabola X² coefficient'); near('extremes', num(row(st.fit, 'R²')[1]), 1, 1e-9, 'exact parabola R2'); }
  { await reset('lists', 1, false); await setAll({ lrX: '100000000 200000000 300000000 400000000', lrY: '1 2 3 4.5' }); const st = await read(); ok('extremes', st.hint === '' && /X/.test(st.big), 'huge X values: [' + st.big + '] hint [' + st.hint + ']'); near('extremes', num(st.coef[2][1]), 1.15e-8 * 1, 1e-9, 'huge X slope'); }
  { await reset('lists', 1, false); await setAll({ lrX: '-3 -2 -1 0 1 2', lrY: '-4.1 -2.9 -1.2 0.1 1.1 2.2' }); const st = await read(); near('extremes', num(st.coef[2][1]), 1.28, 0.001, 'negative X slope'); }
  { const xs = [], ys = []; for (let i = 0; i < 2000; i++) { xs.push(i); ys.push(0.5 * i + ((i * 37) % 11)); } const t1 = Date.now(); await reset('lists', 1, false); await setAll({ lrX: xs.join(' '), lrY: ys.join(' ') }); const st = await read(); ok('extremes', Date.now() - t1 < 20000 && st.hint === '' && /X/.test(st.big), '2,000 pairs took ' + (Date.now() - t1) + ' ms'); near('extremes', num(st.coef[2][1]), 0.5, 0.01, '2,000 pairs slope'); }
  { await reset('lists', 1, false); await setAll({ lrX: XS, lrY: YS }); const a = await read(); await reset('pairs', 1, false); await setAll({ lrP: XS.split(' ').map((v, i) => v + ', ' + YS.split(' ')[i]).join('\n') }); const b = await read(); ok('extremes', a.big === b.big && a.sub === b.sub, 'lists and pairs entry give different results [' + a.big + '] [' + b.big + ']'); }
  ok('extremes', Date.now() - t0 < 600000, 'the text script took too long');

  /* ======== 3. visual ======== */
  const geo = async (id) => JSON.parse(await ctx.eval('JSON.stringify((function(){var svg=document.querySelector("#' + id + ' svg");if(!svg)return null;var vb=svg.viewBox.baseVal,sc=svg.getBoundingClientRect().width/vb.width;' +
    'return {sc:sc,texts:[].map.call(svg.querySelectorAll("text"),function(t){return {x:+t.getAttribute("x"),y:+t.getAttribute("y"),t:t.textContent,fs:+t.getAttribute("font-size")};}),' +
    'circles:[].map.call(svg.querySelectorAll("circle"),function(c){return {x:+c.getAttribute("cx"),y:+c.getAttribute("cy"),r:+c.getAttribute("r"),f:c.getAttribute("fill")};}),' +
    'rects:[].map.call(svg.querySelectorAll("rect"),function(c){return {x:+c.getAttribute("x"),y:+c.getAttribute("y"),w:+c.getAttribute("width"),h:+c.getAttribute("height"),o:c.getAttribute("fill-opacity"),tr:c.getAttribute("transform")};}),' +
    'lines:[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),x2:+l.getAttribute("x2"),y1:+l.getAttribute("y1"),y2:+l.getAttribute("y2"),s:l.getAttribute("stroke"),w:l.getAttribute("stroke-width")};}),' +
    'paths:[].map.call(svg.querySelectorAll("path"),function(p){return {d:p.getAttribute("d"),f:p.getAttribute("fill"),o:p.getAttribute("fill-opacity"),s:p.getAttribute("stroke"),w:p.getAttribute("stroke-width"),da:p.getAttribute("stroke-dasharray")};})};})())'));
  const isNum = (t) => /^[−-]?\d+(\.\d+)?$/.test(t);
  const xFit = (texts) => { const ts = texts.filter((q) => isNum(q.t) && Math.abs(q.y - 218) < 0.5).sort((a, b) => a.x - b.x); if (ts.length < 2) return null; const v0 = num(ts[0].t), v1 = num(ts[ts.length - 1].t), b = (ts[ts.length - 1].x - ts[0].x) / (v1 - v0); return { at: (v) => ts[0].x + (v - v0) * b, inv: (px) => v0 + (px - ts[0].x) / b, lo: v0, hi: v1 }; };
  const yFit = (texts) => { const ts = texts.filter((q) => isNum(q.t) && Math.abs(q.x - 41) < 0.5).sort((a, b) => a.y - b.y); if (ts.length < 2) return null; const v0 = num(ts[0].t), v1 = num(ts[ts.length - 1].t), b = (ts[ts.length - 1].y - ts[0].y) / (v1 - v0); return { at: (v) => ts[0].y - 4 + (v - v0) * b, inv: (py) => v0 + (py + 4 - ts[0].y) / b }; };
  const pts = (d) => { const o = [], re = /([ML])([-\d.]+),([-\d.]+)/g; let m; while ((m = re.exec(d))) o.push([parseFloat(m[2]), parseFloat(m[3])]); return o; };
  { await reset('lists', 1, false); await setAll({ lrX: XS, lrY: YS, lrPx: '5, 11' }); runs++; const g = await geo('lrVis'), st = await read(); const X = xFit(g.texts), Y = yFit(g.texts);
    ok('visual', !!X && !!Y, 'axis labels of the scatter could not be read');
    const xs = XS.split(' ').map(Number), ys = YS.split(' ').map(Number), dots = g.circles.filter((c) => c.r === 3.3);
    ok('visual', dots.length === 10, 'one dot per pair: ' + dots.length + ' dots for 10 pairs');
    const want = xs.map((v, i) => [X.at(v), Y.at(ys[i])]).sort((a, b) => a[0] - b[0]), got = dots.map((c) => [c.x, c.y]).sort((a, b) => a[0] - b[0]);
    ok('visual', want.every((w, i) => Math.abs(w[0] - got[i][0]) < 0.4 && Math.abs(w[1] - got[i][1]) < 0.4), 'dot positions do not match the data on the axis labels');
    const b = num(st.coef[2][1]), a = num(st.coef[1][1]);
    const fitP = g.paths.filter((p) => p.s === '#241A11' && p.w === '1.8')[0]; ok('visual', !!fitP, 'fitted path missing');
    if (fitP) { const P = pts(fitP.d); ok('visual', P.length > 10 && P.every((q) => Math.abs(Y.inv(q[1]) - (a + b * X.inv(q[0]))) < 0.06), 'the fitted path is not y = ' + a + ' + ' + b + ' x'); }
    ok('visual', g.paths.some((p) => p.o === '.16'), 'the amber band is missing'); ok('visual', g.paths.filter((p) => p.da === '4 3').length === 2, 'two dashed prediction lines expected, found ' + g.paths.filter((p) => p.da === '4 3').length);
    const rings = g.circles.filter((c) => c.f === 'none'); ok('visual', rings.length === 1 && Math.abs(rings[0].x - X.at(10)) < 0.4 && Math.abs(rings[0].y - Y.at(60)) < 0.4, 'one ring around the point (10, 60) expected, found ' + rings.length);
    ok('visual', g.texts.some((q) => q.t === '#10'), 'the steering point has no #10 label'); const looP = g.paths.filter((p) => p.s === '#B5761F' && p.f === 'none' && p.w === '1' && !p.da); ok('visual', looP.length === 1, 'one fit-without-it line expected, found ' + looP.length);
    if (looP.length === 1) { const P = pts(looP[0].d), without = await (async () => { const xs2 = xs.slice(0, 9), ys2 = ys.slice(0, 9); const n = 9, mx = xs2.reduce((s, v) => s + v, 0) / n, my = ys2.reduce((s, v) => s + v, 0) / n; let sxy = 0, sxx = 0; xs2.forEach((v, i) => { sxy += (v - mx) * (ys2[i] - my); sxx += (v - mx) * (v - mx); }); return { b: sxy / sxx, a: my - sxy / sxx * mx }; })(); ok('visual', P.every((q) => Math.abs(Y.inv(q[1]) - (without.a + without.b * X.inv(q[0]))) < 0.06), 'the thin line is not the fit without pair #10'); }
    const dia = g.rects.filter((r) => r.tr && /rotate/.test(r.tr)); ok('visual', dia.length === 2, 'two predicted diamonds expected, found ' + dia.length);
    const stk = g.lines.filter((l) => l.s === '#B9A98C'); ok('visual', stk.length === 10, 'one residual stick per pair: ' + stk.length);
    const minFs = Math.min.apply(null, g.texts.map((q) => q.fs * g.sc)); ok('visual', minFs >= 11, 'text in the scatter renders at ' + minFs.toFixed(1) + 'px (needs >= 11px)');
    /* squares */
    await ctx.eval('document.getElementById("lrSqBtn").click()'); const g2 = await geo('lrVis'), sq = g2.rects.filter((r) => r.o === '.13'); ok('visual', sq.length === 10, 'ten squares expected, found ' + sq.length);
    ok('visual', sq.every((r) => Math.abs(r.w - r.h) < 0.11), 'the squares are not square'); const hs = sq.map((r) => r.h).sort((p, q) => p - q), eh = xs.map((v, i) => Math.abs(Y.at(ys[i]) - Y.at(a + b * v))).sort((p, q) => p - q); ok('visual', hs.every((h, i) => Math.abs(h - eh[i]) < 0.15), 'square sides do not equal the errors of the points');
    ok('visual', g2.lines.filter((l) => l.s === '#B9A98C').length === 0, 'residual sticks should be replaced by squares'); await ctx.eval('document.getElementById("lrSqBtn").click()');
    /* residual plot */
    const gr = await geo('lrRes'), zero = gr.lines.filter((l) => l.s === '#241A11')[0], dash = gr.lines.filter((l) => l.s === '#B5761F'), rd = gr.circles.filter((c) => c.r === 3.2), sd = num(row(st.fit, 'S (')[1]);
    ok('visual', !!zero && dash.length === 2 && rd.length === 10, 'residual plot: zero line, two ±S lines and 10 dots expected');
    if (zero && dash.length === 2 && rd.length === 10) { const upper = dash.map((l) => l.y1).sort((p, q) => p - q)[0], scaleY = (zero.y1 - upper) / sd; const rdS = rd.slice().sort((p, q) => p.x - q.x); ok('visual', rdS.every((c, i) => Math.abs((zero.y1 - c.y) / scaleY - (ys[i] - (a + b * xs[i]))) < 0.05 * Math.max(1, sd)), 'residual dots are not at the errors of the points'); }
    const rfs = Math.min.apply(null, gr.texts.map((q) => q.fs * gr.sc)); ok('visual', rfs >= 11, 'text in the residual plot renders at ' + rfs.toFixed(1) + 'px (needs >= 11px)');
  }
  { /* quadratic fit path */
    await reset('lists', 2, false); await setAll({ lrX: '-5 -4 -3 -2 -1 0 1 2 3 4 5', lrY: '26 15 10 3 2 1 0 5 8 17 24' }); runs++; const g = await geo('lrVis'), st = await read(), X = xFit(g.texts), Y = yFit(g.texts);
    const c0 = num(st.coef[1][1]), c1 = num(st.coef[2][1]), c2 = num(st.coef[3][1]), fitP = g.paths.filter((p) => p.s === '#241A11' && p.w === '1.8')[0];
    ok('visual', !!X && !!Y && !!fitP && pts(fitP.d).every((q) => { const xv = X.inv(q[0]); return Math.abs(Y.inv(q[1]) - (c0 + c1 * xv + c2 * xv * xv)) < 0.15; }), 'the curve path is not the printed quadratic');
  }
  { /* zoom */
    await reset('lists', 1, false); await setAll({ lrX: XS, lrY: YS }); const g0 = await geo('lrVis'), X0 = xFit(g0.texts); await ctx.eval('document.getElementById("lrZoomIn").click()'); const g1 = await geo('lrVis'), X1 = xFit(g1.texts);
    ok('visual', !!X0 && !!X1 && (X1.hi - X1.lo) < (X0.hi - X0.lo), 'zoom in should narrow the X axis'); await ctx.eval('document.getElementById("lrZoomOut").click()'); const g2 = await geo('lrVis'), X2 = xFit(g2.texts); ok('visual', !!X2 && X2.lo === X0.lo && X2.hi === X0.hi, 'zoom out should restore the axis');
  }
  return { fails, cats, runs };
};
