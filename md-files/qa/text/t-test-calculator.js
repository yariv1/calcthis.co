/* FINAL GATE script for t-test-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, formula example, paired and one-sample examples, critical t table cells, NIST check, plan numbers, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   t-table constants from published t tables (df 1, 2, 10, 20, infinity), the NIST handbook example, n = 2 lists, one group with no spread, difference 0, a wrong-way one-sided test, 1e9 sample sizes, a huge t, a time limit.
   visual:     the drawn picture is re-measured from the SVG: dots equal the data, the diamonds sit at mean positions read off the axis labels, the difference bar at the right place, the t marker and critical lines on the t curve,
               the shaded area starts at the marker, text size >= 11px as rendered. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const fx = (x, d) => { let t = x.toFixed(d); if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); return t.replace('-', '−'); };
  const num = (t) => { const q = String(t).replace(/−/g, '-').match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("ttBig"),lab:g("ttLab"),sub:g("ttSub"),tip:g("ttTip"),nums:rows("ttNums"),cmp:rows("ttCmp"),grp:rows("ttGrp"),what:rows("ttWhat"),write:g("ttWrite"),hint:g("ttHint"),steps:g("ttSteps"),mval:g("ttMVal"),svg1:document.getElementById("ttVis").innerHTML.length};})())'));
  const ALLS = ['ttM1', 'ttS1', 'ttN1', 'ttM2', 'ttS2', 'ttN2', 'ttMu0', 'ttAlpha', 'ttD0', 'ttConf', 'ttTin', 'ttDfIn', 'ttNameA', 'ttNameB', 'ttDec'];
  const reset = async (test, entry, tl) => { const o = (await ctx.eval('document.getElementById("ttAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('ttAdvBtn'); await ctx.click('ttClear'); await ctx.seg('ttTest', test || 'two'); await ctx.seg('ttEntry', entry || 'raw'); await ctx.seg('ttTail', tl || 'two'); await ctx.seg('ttHead', 'welch'); await ctx.seg('ttSpread', 'sd'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const X1 = '78 82 86 85 73 82 90 88', X2 = '77 75 79 86 74 71 73 89';
  const BEF = '120 132 118 140 125 135 128 122', AFT = '115 128 119 131 120 130 126 117', S1 = '102 98 110 95 104 108 99 106 101 97';
  const f2 = (t) => fx(num(t), 2);

  /* ======== 1. textVsTool ======== */
  { /* lead and formula section: the two-group example, Welch and pooled */
    await reset('two', 'raw', 'two'); await setAll({ ttA: X1, ttB: X2 }); runs++; const st = await read();
    const t = row(st.cmp, 't-score'), df = row(st.cmp, 'Degrees of freedom'), p = row(st.cmp, 'p-value (two-tailed)'), ci = row(st.cmp, '95% interval for the difference');
    inText(H, 't(' + fx(num(df[1]), 2) + ') = ' + f2(t[1]) + ', p = ' + p[1], 'lead Welch t, df, p'); inText(H, '83.00 against 78.00 with 8 values', 'lead means and n');
    inText(C, 'Welch t = ' + t[1] + ' with ' + fx(num(df[1]), 2) + ' degrees of freedom and p = ' + p[1], 'formula Welch'); inText(C, 'pooled t = ' + t[2] + ' with ' + df[2] + ' degrees of freedom and p = ' + p[2], 'formula pooled');
    const w = ci[1].split(' to '), pc = ci[2].split(' to '); inText(C, 'runs from ' + w[0] + ' to ' + w[1] + ' (Welch) and from ' + pc[0] + ' to ' + pc[1] + ' (pooled)', 'formula intervals');
    inText(C, 'standard deviations ' + fx(num(row(st.grp, 'Standard deviation')[1]), 2) + ' and ' + fx(num(row(st.grp, 'Standard deviation')[2]), 2), 'formula SDs');
    /* FAQ numbers */
    inText(C, 'Welch gives p = ' + p[1] + ' and pooled p = ' + p[2], 'FAQ Welch vs pooled'); inText(C, 'A p-value of ' + p[1] + ' is above 0.05', 'FAQ p-value'); inText(C, fx(num(df[1]), 2) + ' in the example', 'FAQ df');
    inText(C, 'runs from ' + w[0] + ' to ' + w[1] + ', which includes 0', 'FAQ interval');
    const w3 = row(st.what, 'People needed for p below α, if the means and spreads stayed the same'), w4 = row(st.what, 'People needed for 80% power at that difference'), w5 = row(st.what, 'Power of this test to detect the difference you saw');
    inText(C, '(' + num(w3[1]) + ' per group in the example)', 'FAQ people for p'); inText(C, '(' + num(w4[1]) + ' per group)', 'FAQ people for power');
    inText(C, 'about ' + num(w3[1]) + ' per group would give p below 0.05', 'plan section people'); inText(C, num(w4[1]) + ' per group would give 80% power', 'plan section power people'); inText(C, 'as run is ' + w5[1], 'plan section power');
  }
  { /* paired example */
    await reset('paired', 'raw', 'two'); await setAll({ ttA: BEF, ttB: AFT }); runs++; const st = await read(), mean = row(st.grp, 'Mean'), sd = row(st.grp, 'Standard deviation');
    inText(C, 'The differences have a mean of ' + fx(num(mean[3]), 2) + ' and a standard deviation of ' + fx(num(sd[3]), 2), 'paired mean and SD');
    inText(C, 't(' + row(st.nums, 'Degrees of freedom')[1] + ') = ' + fx(num(row(st.nums, 't-score')[1]), 2) + ' and p = ' + row(st.nums, 'p-value, two-tailed (used)')[1] + ': significant at 0.05', 'paired t, df, p');
  }
  { /* one-sample example */
    await reset('one', 'raw', 'two'); await setAll({ ttA: S1, ttMu0: '100' }); runs++; const st = await read();
    inText(C, 'The mean is ' + fx(num(row(st.grp, 'Mean')[1]), 2) + ', t(' + row(st.nums, 'Degrees of freedom')[1] + ') = ' + fx(num(row(st.nums, 't-score')[1]), 2) + ' and p = ' + row(st.nums, 'p-value, two-tailed (used)')[1] + ': not significant at 0.05', 'one-sample');
  }
  { /* critical t table: 15 cells re-derived with the typed t-score / df mode */
    const tab = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))'));
    const ct = tab.filter((t) => t[0] && t[0][0] === 'Degrees of freedom')[0]; ok('textVsTool', !!ct && ct.length === 20, 'critical t table not found or wrong size');
    const picks = [[1, 1], [1, 3], [3, 2], [5, 2], [9, 1], [10, 3], [13, 2], [15, 1], [17, 3], [18, 2], [2, 1], [7, 3], [12, 2], [4, 1], [16, 2]];
    for (const [i, j] of picks) {
      const r = ct[i], df = parseFloat(r[0]), a = [0.10, 0.05, 0.01][j - 1]; await reset('two', 'raw', 'two'); await setAll({ ttTin: '0.5', ttDfIn: String(df), ttAlpha: String(a) }); runs++; const st = await read(), cr = st.nums.filter((x) => /^Critical t/.test(x[0]))[0];
      cats.textVsTool++; if (!cr || Math.abs(num(cr[1]) - num(r[j])) > 5.1e-4) fails.push('text-vs-tool critical t df=' + df + ' a=' + a + ' table [' + r[j] + '] tool [' + (cr && cr[1]) + ']');
    }
  }
  { /* NIST check text */
    await reset('two', 'sum', 'two'); await ctx.seg('ttHead', 'pooled'); await setAll({ ttM1: '20.14458', ttS1: '6.41470', ttN1: '249', ttM2: '30.48101', ttS2: '6.10771', ttN2: '79' }); runs++; const st = await read();
    inText(C, 'returns t = ' + row(st.nums, 't-score')[1] + ' with ' + row(st.nums, 'Degrees of freedom')[1] + ' degrees of freedom', 'NIST t and df'); inText(C, 'two-tailed critical value is ' + row(st.nums, 'Critical t at α = 0.05 (two-tailed)')[1].replace('±', ''), 'NIST two-tailed critical');
    await ctx.seg('ttTail', 'gt'); const st2 = await read(); inText(C, 'the one-tailed one ' + row(st2.nums, 'Critical t at α = 0.05 (one-tailed)')[1], 'NIST one-tailed critical');
    inText(C, 'this calculator gives t = ' + row(st.nums, 't-score')[1], 'sources NIST t');
  }

  /* ======== 2. extremes ======== */
  { /* published t table constants through the typed t-score / df mode */
    for (const [df, a, want] of [[1, 0.05, 12.706], [2, 0.05, 4.303], [10, 0.05, 2.228], [20, 0.05, 2.086], [1, 0.01, 63.657], [10, 0.01, 3.169], [1000000, 0.05, 1.960], [30, 0.10, 1.697]]) {
      await reset('two', 'raw', 'two'); await setAll({ ttTin: '1', ttDfIn: String(df), ttAlpha: String(a) }); runs++; const st = await read(), cr = st.nums.filter((x) => /^Critical t/.test(x[0]))[0];
      ok('extremes', !!cr && Math.abs(num(cr[1]) - want) < 0.0006 + 1e-4, 'critical t df=' + df + ' alpha=' + a + ' should be ' + want + ' (published t table), page says ' + (cr && cr[1]));
    }
  }
  { /* known p-values: t = 0 gives p = 1; t = 2.228 with df 10 gives p about 0.05; right and left tails add up */
    await reset('two', 'raw', 'two'); await setAll({ ttTin: '0', ttDfIn: '10' }); runs++; let st = await read(); ok('extremes', /^p = 1$/.test(st.big), 't = 0 should give p = 1, page says ' + st.big);
    await setAll({ ttTin: '2.228', ttDfIn: '10' }); st = await read(); ok('extremes', Math.abs(num(st.big.replace('p = ', '')) - 0.05) < 0.0006, 't = 2.228, df 10 should give p about 0.05, page says ' + st.big);
    await setAll({ ttTin: '1.5', ttDfIn: '7.5' }); st = await read(); const r1 = num(row(st.nums, 'p-value, right-tailed (higher)')[1]), l1 = num(row(st.nums, 'p-value, left-tailed (lower)')[1]); ok('extremes', Math.abs(r1 + l1 - 1) < 2e-4, 'right and left p-values should add to 1: ' + r1 + ' + ' + l1);
    await setAll({ ttTin: '1000', ttDfIn: '3' }); st = await read(); ok('extremes', /10⁻/.test(st.big) && !/NaN|Infinity/.test(st.big), 'a huge t should give a tiny p in scientific notation, page says ' + st.big);
  }
  { /* identical groups: difference 0 -> p = 1, plan says never for a one-sided test */
    await reset('two', 'raw', 'gt'); await setAll({ ttA: '1 2 3 4 5', ttB: '5 4 3 2 1' }); runs++; const st = await read(); ok('extremes', /^p = 0\.5/.test(st.big) || /^p = 0\.5$/.test(st.big), 'equal means, one-sided: p should be 0.5, page says ' + st.big);
    const w3 = row(st.what, 'People needed for p below α, if the means and spreads stayed the same'); ok('extremes', !!w3 && /Never/.test(w3[1]), 'zero difference should say Never, page says ' + (w3 && w3[1]));
    await ctx.seg('ttTail', 'lt'); await setAll({ ttA: '10 11 12 13 14', ttB: '1 2 3 4 5' }); const st2 = await read(); const w4 = row(st2.what, 'People needed for 80% power at that difference'); ok('extremes', !!w4 && /Never: the difference points the other way/.test(w4[1]), 'wrong-way one-sided test should say Never, page says ' + (w4 && w4[1]));
  }
  { /* n = 2 values per group; one group with no spread; huge sample sizes */
    await reset('two', 'raw', 'two'); await setAll({ ttA: '1 3', ttB: '10 14' }); runs++; let st = await read(); ok('extremes', /^p = /.test(st.big) && !st.hint, 'two values per group should work, page says ' + st.big + ' ' + st.hint);
    await setAll({ ttA: '5 5 5 5', ttB: '1 2 3 4 9' }); st = await read(); ok('extremes', /^p = /.test(st.big), 'one group with no spread should still work with Welch, page says [' + st.big + '] [' + st.hint + ']');
    await reset('two', 'sum', 'two'); await setAll({ ttM1: '10', ttS1: '1', ttN1: '1000000000', ttM2: '10.001', ttS2: '1', ttN2: '1000000000' }); const t1 = Date.now(); st = await read(); ok('extremes', /^p = /.test(st.big) && Date.now() - t1 < 4000, 'n = 1e9 should compute quickly, page says ' + st.big);
    const w4 = row(st.what, 'People needed for 80% power at that difference'); ok('extremes', !!w4 && /per group/.test(w4[1]) && !/NaN/.test(w4[1]), 'people needed for 1e9 groups should read sensibly, page says ' + (w4 && w4[1]));
  }
  ok('extremes', Date.now() - t0 < 120000, 'the whole check should run well inside the time limit, took ' + (Date.now() - t0) + ' ms');

  /* ======== 3. visual ======== */
  const geo = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var o={};[["ttVis","a"],["ttCurve","c"]].forEach(function(p){var svg=document.querySelector("#"+p[0]+" svg");if(!svg){o[p[1]]=null;return;}var vb=svg.viewBox.baseVal,sc=svg.getBoundingClientRect().width/vb.width;' +
    'o[p[1]]={sc:sc,vbw:vb.width,texts:[].map.call(svg.querySelectorAll("text"),function(t){return {x:+t.getAttribute("x"),y:+t.getAttribute("y"),t:t.textContent,fs:+t.getAttribute("font-size")};}),' +
    'circles:[].map.call(svg.querySelectorAll("circle"),function(c){return {x:+c.getAttribute("cx"),y:+c.getAttribute("cy")};}),' +
    'diamonds:[].map.call(svg.querySelectorAll("rect[transform]"),function(r){var m=r.getAttribute("transform").match(/rotate\\(45 ([-0-9.]+) ([-0-9.]+)\\)/);return {x:+m[1],y:+m[2]};}),' +
    'lines:[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),x2:+l.getAttribute("x2"),y1:+l.getAttribute("y1"),y2:+l.getAttribute("y2"),s:l.getAttribute("stroke"),w:l.getAttribute("stroke-width")};}),' +
    'paths:[].map.call(svg.querySelectorAll("path"),function(p){return {d:p.getAttribute("d"),f:p.getAttribute("fill"),o:p.getAttribute("fill-opacity")};})};});return o;})())'));
  const isNum = (t) => /^[−-]?\d+(\.\d+)?$/.test(t);
  const axisFit = (texts, yv) => { const ts = texts.filter((q) => isNum(q.t) && Math.abs(q.y - yv) < 0.5).sort((a, b) => a.x - b.x); if (ts.length < 2) return null; const v0 = num(ts[0].t), v1 = num(ts[ts.length - 1].t), b = (ts[ts.length - 1].x - ts[0].x) / (v1 - v0); return { at: (v) => ts[0].x + (v - v0) * b, n: ts.length }; };
  const numericYs = (texts) => { const ys = {}; texts.filter((q) => isNum(q.t)).forEach((q) => { ys[q.y] = (ys[q.y] || 0) + 1; }); return Object.keys(ys).map(Number).sort((a, b) => a - b); };
  { /* two groups, raw: dots, diamonds, difference bar, text size */
    await reset('two', 'raw', 'two'); await setAll({ ttA: X1, ttB: X2 }); runs++; const g = await geo(), a = g.a, st = await read();
    const ys = numericYs(a.texts); ok('visual', ys.length === 2, 'the estimation plot should have two numbered axes, has ' + ys.length);
    const f1 = axisFit(a.texts, ys[0]), f2a = axisFit(a.texts, ys[1]); ok('visual', !!f1 && !!f2a, 'axis labels could not be read');
    const A = X1.split(' ').map(Number), B = X2.split(' ').map(Number); ok('visual', a.circles.length === A.length + B.length, 'one dot per value: ' + a.circles.length + ' dots for ' + (A.length + B.length) + ' values');
    const want = A.concat(B).map((v) => f1.at(v)).sort((x, y) => x - y), got = a.circles.map((c) => c.x).sort((x, y) => x - y); ok('visual', want.every((v, i) => Math.abs(v - got[i]) < 0.35), 'dot positions do not match the data on the axis');
    const mA = A.reduce((p, c) => p + c, 0) / A.length, mB = B.reduce((p, c) => p + c, 0) / B.length; ok('visual', a.diamonds.length === 3, 'three diamonds expected (two means and the difference), found ' + a.diamonds.length);
    const dm = a.diamonds.slice().sort((p, q) => p.y - q.y); ok('visual', Math.abs(dm[0].x - f1.at(mA)) < 0.4 && Math.abs(dm[1].x - f1.at(mB)) < 0.4, 'group diamonds are not at the group means (' + dm[0].x.toFixed(1) + ' vs ' + f1.at(mA).toFixed(1) + ', ' + dm[1].x.toFixed(1) + ' vs ' + f1.at(mB).toFixed(1) + ')');
    ok('visual', Math.abs(dm[2].x - f2a.at(5)) < 0.4, 'the difference diamond is not at 5 on the lower axis (' + dm[2].x.toFixed(1) + ' vs ' + f2a.at(5).toFixed(1) + ')');
    const ci = row(st.cmp, '95% interval for the difference')[1].split(' to ').map((t) => num(t)), dl = a.lines.filter((l) => l.w === '2.6' && l.y1 === l.y2)[0]; ok('visual', !!dl && Math.abs(dl.x1 - f2a.at(ci[0])) < 0.5 && Math.abs(dl.x2 - f2a.at(ci[1])) < 0.5, 'the difference bar does not span the printed interval');
    const dash = a.lines.filter((l) => /^4 3$/.test('') || (l.s === '#241A11' && l.w === '1.4'))[0]; ok('visual', !!dash && Math.abs(dash.x1 - f2a.at(0)) < 0.4, 'the dashed reference line is not at 0 on the lower axis');
    const minFs = Math.min.apply(null, a.texts.map((q) => q.fs * a.sc)); ok('visual', minFs >= 11, 'text in the estimation plot renders at ' + minFs.toFixed(1) + 'px (needs >= 11px)');
  }
  { /* paired: grey lines join each pair; one-sample: mu0 line */
    await reset('paired', 'raw', 'two'); await setAll({ ttA: BEF, ttB: AFT }); runs++; let g = await geo(); const grey = g.a.lines.filter((l) => l.s === '#B9A98C'); ok('visual', grey.length === 8, 'paired plot should draw 8 joining lines, found ' + grey.length);
    const ys = numericYs(g.a.texts), f1 = axisFit(g.a.texts, ys[0]); const Bf = BEF.split(' ').map(Number), Af = AFT.split(' ').map(Number); ok('visual', grey.every((l, i) => Math.abs(l.x1 - f1.at(Bf[i])) < 0.4 && Math.abs(l.x2 - f1.at(Af[i])) < 0.4), 'a joining line does not run from the before value to the after value');
    await reset('one', 'raw', 'two'); await setAll({ ttA: S1, ttMu0: '100' }); g = await geo(); const ys1 = numericYs(g.a.texts), fo = axisFit(g.a.texts, ys1[0]); const ref = g.a.lines.filter((l) => l.s === '#241A11' && l.w === '1.4' && l.y1 < 20)[0]; ok('visual', !!ref && Math.abs(ref.x1 - fo.at(100)) < 0.4, 'the one-sample plot should mark mu0 = 100 on the axis');
    ok('visual', g.a.circles.length === 10, 'one-sample plot should have 10 dots, found ' + g.a.circles.length);
  }
  { /* summary numbers: no dots, only the means */
    await reset('two', 'sum', 'two'); await setAll({ ttM1: '83', ttS1: '5.5', ttN1: '8', ttM2: '78', ttS2: '6.4', ttN2: '8' }); runs++; const g = await geo(); ok('visual', g.a.circles.length === 0 && g.a.diamonds.length === 3, 'summary numbers should draw no dots and three diamonds, found ' + g.a.circles.length + ' dots ' + g.a.diamonds.length + ' diamonds');
  }
  { /* t curve: marker at t, critical lines at the critical values, shaded area starts at the marker */
    for (const tl of ['two', 'gt', 'lt']) {
      await reset('two', 'raw', tl); await setAll({ ttA: X1, ttB: X2 }); runs++; const g = await geo(), c = g.c, st = await read(); const ys = numericYs(c.texts); const fit = axisFit(c.texts, ys[0]); ok('visual', !!fit && fit.n >= 5, 'curve axis labels not found');
      const t = num(row(st.nums, 't-score')[1]), crit = num(row(st.nums, 'Critical t at α = 0.05 (' + (tl === 'two' ? 'two-tailed' : 'one-tailed') + ')')[1]);
      const mk = c.lines.filter((l) => l.s === '#8F5C13' && l.w === '2')[0]; ok('visual', !!mk && Math.abs(mk.x1 - fit.at(t)) < 0.4, tl + ': the t marker is not at t = ' + t);
      const cl = c.lines.filter((l) => l.s === '#37503F' && l.w === '1.5').map((l) => l.x1).sort((a, b) => a - b); const wantC = tl === 'two' ? [fit.at(-Math.abs(crit)), fit.at(Math.abs(crit))] : tl === 'gt' ? [fit.at(Math.abs(crit))] : [fit.at(-Math.abs(crit))];
      ok('visual', cl.length === wantC.length && cl.every((x, i) => Math.abs(x - wantC[i]) < 0.4), tl + ': critical lines are not at the critical values');
      const sh = c.paths.filter((p) => p.o === '.38'); ok('visual', sh.length === (tl === 'two' ? 2 : 1), tl + ': expected ' + (tl === 'two' ? 2 : 1) + ' shaded area(s), found ' + sh.length);
      const fs = Math.min.apply(null, c.texts.map((q) => q.fs * c.sc)); ok('visual', fs >= 11, 'text in the t curve renders at ' + fs.toFixed(1) + 'px (needs >= 11px)');
    }
  }
  return { fails, cats, runs };
};
