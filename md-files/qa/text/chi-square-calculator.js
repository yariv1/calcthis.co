/* FINAL GATE script for chi-square-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, worked example table and sentences, die / ratio / coin examples, the critical value table, the 2x2, McNemar and power sections, the sample size table, FAQ and sources)
               is re-derived by DRIVING THE TOOL and found in the page text.
   extremes:   published anchors (standard chi-square table values, the tea tasting Fisher table, the McNemar article examples, pingouin power examples), zero and enormous statistics, huge counts, a 20 x 20 table against a
               time limit, very large degrees of freedom, smallest possible tables.
   visual:     the picture is re-measured from the DOM (segment widths in pixels, bar thickness by row size, dashed lines, colours by direction and strength, labels not clipped), the curve's critical and statistic lines
               against the printed axis numbers, heat shading, text size as rendered, and the selected buttons against the panels shown. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const num = (t) => { const q = String(t).replace(/−/g, '-').replace(/,/g, '').match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){var k=c.querySelector("small");return k?c.querySelector("b").textContent+"|"+k.textContent:c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'var o={big:g("xsBig"),sub:g("xsSub"),tip:g("xsTip"),hint:g("xsHint"),cells:rows("xsCells"),two:rows("xsTwo"),mc:rows("xsMc"),eff:rows("xsEff"),pow:rows("xsPow"),warn:g("xsWarn"),write:g("xsWrite")};["xsAlphaNote","xsWNote","xsHeadNote"].forEach(function(i){o[i]=g(i);});return o;})())'));
  const bulk = (o) => ctx.eval('(function(o){Object.keys(o).forEach(function(k){__qa.set(k,String(o[k]));});return 1;})(' + JSON.stringify(o) + ')');
  const reset = async (mode, entry) => { await ctx.click('xsClear'); await ctx.seg('xsMode', mode); await ctx.seg('xsEntry', mode === 'table' && entry ? entry : 'grid'); await ctx.seg('xsFEntry', mode === 'fit' && entry ? entry : 'rows'); await ctx.seg('xsPair', 'ind'); await ctx.seg('xsHead', 'pearson'); await ctx.seg('xsExp', 'eq'); };
  const adv = async () => { if ((await ctx.eval('document.getElementById("xsAdvIn").style.display')) === 'none') await ctx.click('xsAdvBtn'); };
  const table = async (O, w) => { await reset('table', 'paste'); await adv(); await bulk({ xsW: w === undefined ? '' : w, xsAlpha: '', xsDec: '' }); await ctx.set('xsPaste', O.map((r) => r.join(' ')).join('\n')); runs++; return read(); };
  const pair = async (O) => { await ctx.click('xsClear'); await ctx.seg('xsMode', 'table'); await ctx.seg('xsEntry', 'grid'); await ctx.seg('xsPair', 'mc'); await bulk({ xsC1_1: O[0][0], xsC1_2: O[0][1], xsC2_1: O[1][0], xsC2_2: O[1][1] }); runs++; return read(); };
  const fit = async (obs, exp) => { await reset('fit', 'paste'); await adv(); await bulk({ xsW: '', xsAlpha: '', xsDec: '', xsParams: '' }); await ctx.seg('xsExp', exp ? 'ratio' : 'eq'); await ctx.set('xsFitP', obs.map((v, i) => 'c' + i + ', ' + v + (exp ? ', ' + exp[i] : '')).join('\n')); runs++; return read(); };
  const value = async (x, df, alpha) => { await reset('value'); await bulk({ xsAlpha: alpha === undefined ? '' : alpha, xsDec: '', xsChi: x, xsDf: df }); runs++; return read(); };
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const exTables = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.xs-ex"),function(t){return [].map.call(t.querySelectorAll("tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))'));
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const near = (cat, got, exp, tol, msg) => ok(cat, isFinite(got) && Math.abs(got - exp) <= tol, msg + ' (got ' + got + ', expected ' + exp + ')');
  const pOf = (sub) => (sub.match(/p (?:=|<) ([^·]+)/) || [])[1].trim();
  const lastNum = (t) => (String(t).match(/-?[\d.]+(?= *$)/) || [])[0];

  /* ======== 1. textVsTool ======== */
  const L = [[20, 30, 50], [30, 40, 30]];
  { const st = await table(L); const chi = st.big.replace('χ² = ', ''), p = pOf(st.sub);
    inText(H, 'χ² = ' + chi + ', 2 degrees of freedom, p = ' + p, 'lead');
    inText(C, 'χ² = ' + chi + ' with 2 degrees of freedom. The p-value is ' + p, 'worked example sentence');
    st.cells.slice(1, 7).forEach((r, i) => { const t = exTables[0][i], oe = r[1].split('|'); ok('textVsTool', t[1] === oe[0] && t[2] === oe[1] && t[3] === r[2], 'example row ' + i + ' text ' + t.join(' / ') + ' tool ' + oe.join(' / ') + ' / ' + r[2]); });
    inText(C, 'Cramér’s V is ' + st.eff[1][1], 'V'); const mid = num(st.cells[2][2]) + num(st.cells[5][2]); const mt = num((C.match(/the middle one adds ([\d.]+)/) || [])[1]); near('textVsTool', mt, mid, 0.00011, 'middle column contribution');
    inText(C, 'In the example the first box is 100 × 50 ÷ 200 = ' + st.cells[1][1].split('|')[1], 'FAQ expected');
    inText(C, 'The example has p = ' + p, 'FAQ p'); const w = st.eff[0][1].replace(/ \(.*/, ''), word = st.eff[0][1].replace(/.*\((.*)\)/, '$1'); inText(C, 'In the example w = ' + w + ', a ' + word + ' effect', 'FAQ w'); inText(C, 'In the worked example w = ' + w, 'power section w');
    const pw = st.pow[2][1], n80 = st.pow[3][1]; inText(C, 'would reach p below 0.05 ' + pw + ' of the time and ' + n80 + ' counts would give 80% power', 'power section'); }
  { const st = await value(1, 2); inText(C, 'the critical value at 0.05 is ' + st.xsAlphaNote.match(/df = 2: ([\d.]+)\./)[1], 'critical in example'); }
  { const st = await fit([8, 12, 9, 14, 11, 6]); inText(C, 'Each face is expected ' + st.cells[1][1].split('|')[1] + ' times, so χ² = ' + st.big.replace('χ² = ', '') + ' with 5 degrees of freedom and p = ' + pOf(st.sub), 'die'); }
  { const st = await fit([315, 108, 101, 32], [9, 3, 3, 1]); inText(C, 'χ² = ' + st.big.replace('χ² = ', '') + ' with 3 degrees of freedom and p = ' + pOf(st.sub), 'ratio'); }
  { const st = await fit([62, 38]); inText(C, 'χ² = ' + st.big.replace('χ² = ', '') + ' and p = ' + pOf(st.sub) + '; the exact binomial test gives ' + st.two[2][2], 'coin'); }
  { const dfs = exTables[1].map((r) => +r[0]), alphas = ['0.1', '0.05', '0.01', '0.001'];
    for (let i = 0; i < dfs.length; i++) for (let j = 0; j < 4; j++) { const st = await value(1, dfs[i], alphas[j]); const m = st.xsAlphaNote.match(/: ([\d.]+)\.$/); near('textVsTool', parseFloat(exTables[1][i][j + 1]), m ? parseFloat(m[1]) : NaN, 0.00056, 'critical table df ' + dfs[i] + ' alpha ' + alphas[j]); } }
  { const a = await table([[20, 10], [30, 40]]); const s1 = a.two[1][2] + ' (Pearson), ' + a.two[2][2] + ' (Yates) and ' + a.two[3][2] + ' (Fisher, two-sided)'; inText(C, 'For the 2×2 table 20, 10 and 30, 40 the three p-values are ' + s1, 'small counts'); inText(C, 'the p-values are ' + s1, 'FAQ 2x2');
    const b = await table([[20, 30], [30, 40]]); inText(C, 'For 20, 30 and 30, 40 they are ' + b.two[1][2] + ', ' + b.two[2][2] + ' and ' + b.two[3][2], 'second 2x2'); }
  { const m = await pair([[101, 121], [59, 33]]); inText(C, 'only the 180 who changed are tested: χ² = (121 − 59)² ÷ 180 = ' + m.big.replace('χ² = ', '') + ', p = ' + pOf(m.sub), 'McNemar section'); inText(C, 'gives 21.35 there and ' + m.big.replace('χ² = ', '') + ' here', 'sources McNemar 1'); ok('textVsTool', m.sub.indexOf('180 changed') >= 0, '180 changed');
    const m2 = await pair([[59, 6], [16, 80]]); inText(C, 'this page gives ' + num(m2.mc[3][2]).toFixed(3) + ' and ' + num(m2.mc[2][1]).toFixed(2), 'sources McNemar 2'); }
  { const dfT = { 1: [[1, 2], [3, 4]], 2: [[1, 2, 3], [3, 4, 5]], 3: [[1, 2, 3, 4], [4, 3, 2, 1]], 4: [[1, 2, 3], [3, 4, 5], [5, 6, 7]], 6: [[1, 2, 3, 4], [3, 4, 5, 6], [5, 6, 7, 8]] }, ws = ['0.1', '0.3', '0.5'], got = {};
    for (const r of exTables[2]) for (let j = 0; j < 3; j++) { const st = await table(dfT[+r[0]], ws[j]); const v = st.pow[5][1].replace(/,/g, ''); got[r[0] + ws[j]] = v; ok('textVsTool', r[j + 1].replace(/,/g, '') === v, 'sample size table df ' + r[0] + ' w ' + ws[j] + ': text ' + r[j + 1] + ' tool ' + v); }
    inText(C, 'you need about ' + got['10.1'] + ' counts for a small effect (w = 0.1), ' + got['10.3'] + ' for a medium one (0.3) and ' + got['10.5'] + ' for a large one (0.5)', 'FAQ sample size');
    const h = await table([[25, 25], [25, 25]], '0.3'); inText(C, 'a medium effect (w = 0.3) has ' + h.pow[4][1] + ' power', '100 counts power');
    const q = await table([[5, 5], [5, 5]], '0.3'); ok('textVsTool', C.indexOf('power 0.2687 for w = 0.3, 20 counts') >= 0, 'pingouin sentence'); near('textVsTool', num(q.pow[4][1]), 26.87, 0.051, 'pingouin power on the tool');
    const t3 = await table(dfT[3], '0.3'); near('textVsTool', num(t3.pow[5][1]), Math.ceil(121.1396), 0, 'pingouin sample size on the tool'); inText(C, '121.14 counts for 3 degrees of freedom', 'pingouin n sentence'); }
  { const st = await value(3.84, 1); inText(C, 'χ² = 3.84 with 1 degree of freedom gives p = ' + st.big.replace(/^p = /, ''), 'FAQ value'); }
  inText(C, 'a 2×3 table has 2', 'FAQ df'); inText(C, 'with about ±2 unusual and ±3 very unusual', 'residual rule');

  /* ======== 2. extremes ======== */
  { const std = [[1, '0.05', 3.841], [1, '0.01', 6.635], [5, '0.01', 15.086], [10, '0.001', 29.588], [30, '0.05', 43.773], [100, '0.05', 124.342]];
    for (const [d, a, v] of std) { const st = await value(1, d, a); near('extremes', parseFloat((st.xsAlphaNote.match(/: ([\d.]+)\.$/) || [])[1]), v, 0.0011, 'standard table df ' + d + ' alpha ' + a); }
    let st = await value(0, 1); ok('extremes', st.big === 'p = 1', 'chi 0 gives p 1: ' + st.big);
    st = await value(999999999, 1); ok('extremes', /10⁻³⁰⁰/.test(st.big + st.sub), 'enormous chi: ' + st.big);
    st = await value(100000, 100000); near('extremes', num(st.big.replace('p = ', '')), 0.4994, 0.0006, 'df 100000');
    st = await value(3.841458820694124, 1); near('extremes', num(st.big.replace('p = ', '')), 0.05, 0.00001, '3.8415 df 1');
    st = await table([[10, 20], [30, 60]]); ok('extremes', st.big === 'χ² = 0.0000' && /p = 1 /.test(st.sub), 'exact independence: ' + st.big + ' ' + st.sub);
    st = await table([[1000000000, 0], [0, 1000000000]]); near('extremes', num(st.big.replace('χ² = ', '')), 2000000000, 1, 'two billion counts'); ok('extremes', /10⁻³⁰⁰/.test(st.sub), 'p underflow ' + st.sub); ok('extremes', st.two.length === 3, 'no Fisher above ten million: ' + st.two.length);
    st = await table([[999999999, 999999999], [999999999, 999999999]]); ok('extremes', st.big === 'χ² = 0.0000', 'huge equal table ' + st.big);
    await adv(); await ctx.seg('xsHead', 'fisher'); st = await read(); ok('extremes', st.big === 'χ² = 0.0000' && /not worked out/.test(st.xsHeadNote), 'Fisher head with huge totals falls back: ' + st.big + ' / ' + st.xsHeadNote); await ctx.seg('xsHead', 'pearson');
    st = await table([[3, 1], [1, 3]]); near('extremes', num(st.two[3][2]), 0.4857, 0.0001, 'tea tasting two-sided'); near('extremes', num(st.two[5][2]), 0.2429, 0.0001, 'tea tasting one-sided');
    st = await table([[1, 0], [0, 1]]); ok('extremes', st.two[3][2] === '1' && st.two[5][2] === '0.5', 'smallest table Fisher ' + st.two[3][2] + ' ' + st.two[5][2]);
    st = await table([[2500000, 2400000], [2400000, 2500000]]); ok('extremes', /less than|10⁻/.test(st.two[3][2]), 'large Fisher ' + st.two[3][2]);
    st = await table([[2500000, 2499000], [2499000, 2500000]]); near('extremes', num(st.two[3][2]), num(st.two[2][2]), 0.002, 'large Fisher agrees with Yates');
    let m = await pair([[0, 1], [0, 0]]); ok('extremes', m.mc[3][2] === '1' && m.mc[4][2] === '0.5', 'one change: exact 1, mid-p 0.5: ' + m.mc[3][2] + ' ' + m.mc[4][2]);
    m = await pair([[59, 6], [16, 80]]); near('extremes', num(m.mc[3][2]), 0.053, 0.0006, 'article exact p'); near('extremes', num(m.mc[2][2]), 0.055, 0.0006, 'article corrected p');
    st = await fit([0, 10]); near('extremes', num(st.two[2][2]), 2 / 1024, 0.0000006, 'binomial 0 of 10');
    st = await fit(Array(20).fill(7)); ok('extremes', st.big === 'χ² = 0.0000' && /df = 19/.test(st.sub), '20 equal categories ' + st.big + ' ' + st.sub);
    const O = [...Array(20)].map((_, i) => [...Array(20)].map((__, j) => 5 + (i * 13 + j * 7) % 23)); const s0 = Date.now(); st = await table(O); const dt = Date.now() - s0; ok('extremes', dt < 2500, '20 x 20 table time ' + dt + ' ms');
    const rt = O.map((r) => r.reduce((a, b) => a + b, 0)), ct = O[0].map((_, j) => O.reduce((a, r) => a + r[j], 0)), n = rt.reduce((a, b) => a + b, 0); let chi = 0; O.forEach((r, i) => r.forEach((v, j) => { const e = rt[i] * ct[j] / n; chi += (v - e) * (v - e) / e; })); near('extremes', num(st.big.replace('χ² = ', '')), chi, 0.0001, '20 x 20 chi'); ok('extremes', /df = 361/.test(st.sub) && st.cells.length === 402, '20 x 20 rows ' + st.cells.length);
    st = await value(3, 1, '0.000001'); near('extremes', parseFloat((st.xsAlphaNote.match(/: ([\d.]+)\.$/) || [])[1]), 23.9281, 0.0005, 'alpha one in a million'); }

  /* ======== 3. visual ======== */
  const geo = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var rows=[].map.call(document.querySelectorAll("#xsVis .xs-row"),function(r){var bar=r.querySelector(".xs-bar"),b=bar.getBoundingClientRect();return {h:b.height,w:b.width,l:b.left,segs:[].map.call(bar.querySelectorAll(".xs-seg"),function(s){var q=s.getBoundingClientRect(),m=s.querySelector("em");return {w:q.width,x:q.left-b.left,cls:s.className,bg:getComputedStyle(s).backgroundColor,em:m?m.getBoundingClientRect().width:0,fs:m?parseFloat(getComputedStyle(m).fontSize):99};}),marks:[].map.call(bar.querySelectorAll(".xs-mark"),function(m){return m.getBoundingClientRect().left+1-b.left;})};});' +
    'var sv=document.querySelector("#xsCurve svg"),o={rows:rows};if(sv){var r=sv.getBoundingClientRect(),vb=sv.viewBox.baseVal;o.scale=r.width/vb.width;var d=function(c){var e=sv.querySelector(c);return e?e.getAttribute("d"):"";};o.crit=d(".xs-crit");o.stat=d(".xs-stat");o.rej=d(".xs-rej");o.axis=[].map.call(sv.querySelectorAll(".xs-tax"),function(t){return t.textContent;});o.tstat=(sv.querySelector(".xs-tstat")||{}).textContent;o.fs=[].map.call(sv.querySelectorAll("text"),function(t){return parseFloat(getComputedStyle(t).fontSize)*r.width/vb.width;});o.boxes=[].map.call(sv.querySelectorAll("text"),function(t){var q=t.getBoundingClientRect();return [q.left-r.left,q.right-r.left,q.top-r.top,q.bottom-r.top,r.width];});}' +
    'o.heat=[].map.call(document.querySelectorAll("#xsCells tbody tr"),function(tr){var c=tr.children[2];return c?[c.className,c.textContent]:null;});o.small=[].map.call(document.querySelectorAll("#xsBody p,#xsBody td,#xsBody th,#xsBody li,#xsBody .xs-rtxt span,#xsBody small"),function(e){return e.getClientRects().length?parseFloat(getComputedStyle(e).fontSize):99;}).filter(function(v){return v<12;}).length;return o;})())'));
  const cases = [[[20, 30, 50], [30, 40, 30]], [[5, 40], [60, 7], [22, 21]], [[100, 3, 9, 4], [10, 12, 14, 16]], [[12, 9, 2], [10, 14, 1], [3, 2, 1]]];
  for (const O of cases) {
    await table(O); await sleep(60); const g = await geo();
    const rt = O.map((r) => r.reduce((a, b) => a + b, 0)), ct = O[0].map((_, j) => O.reduce((a, r) => a + r[j], 0)), n = rt.reduce((a, b) => a + b, 0), maxR = Math.max(...rt);
    ok('visual', g.rows.length === O.length + 1, 'rows drawn');
    g.rows.slice(1).forEach((r, i) => {
      near('visual', r.h, Math.round(18 + 26 * rt[i] / maxR), 0.6, 'bar thickness follows row size');
      let x = 0;
      r.segs.forEach((s, j) => { near('visual', s.w, O[i][j] / rt[i] * r.w, 0.8, 'segment pixels ' + i + ',' + j); near('visual', s.x, x, 1.2, 'segment position'); x += O[i][j] / rt[i] * r.w; const e = rt[i] * ct[j] / n, z = (O[i][j] - e) / Math.sqrt(e * (1 - rt[i] / n) * (1 - ct[j] / n)); const rgb = (s.bg.match(/\d+/g) || []).map(Number); ok('visual', O[i][j] > e ? rgb[0] > rgb[2] : rgb[2] > rgb[0], 'colour direction ' + s.bg); const lum = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11; ok('visual', Math.abs(z) >= 2 ? lum < 130 : lum > 150, 'colour strength z ' + z + ' ' + s.bg); ok('visual', s.em <= s.w + 0.5, 'label clipped in segment ' + s.em + ' > ' + s.w); ok('visual', s.fs >= 12, 'label size'); });
      let cum = 0; r.marks.forEach((m, j) => { cum += ct[j] / n; near('visual', m, cum * r.w, 1.2, 'dashed line pixel'); });
    });
    g.rows[0].segs.forEach((s, j) => { near('visual', s.w, ct[j] / n * g.rows[0].w, 0.8, 'reference bar'); ok('visual', s.em <= s.w + 0.5, 'reference label clipped'); });
    /* curve */
    const xmin = num(g.axis[0]), xmax = num(g.axis[1]), X = (v) => 10 + (v - xmin) / (xmax - xmin) * 340, cx = num(g.crit.replace('M', '')), sx = num(g.stat.replace('M', ''));
    const st = await read(), df = (O.length - 1) * (O[0].length - 1), crit = parseFloat((st.xsAlphaNote.match(/: ([\d.]+)\.$/) || [])[1]), chi = num(st.big.replace('χ² = ', '')); const tol = 340 / (xmax - xmin) * 0.51 + 0.2;
    near('visual', cx, X(crit), tol, 'critical line x df ' + df); if (/→/.test(g.tstat)) near('visual', sx, 350, 0.2, 'far statistic at the edge'); else near('visual', sx, X(chi), tol, 'statistic line x');
    ok('visual', (chi > crit) === (sx > cx), 'statistic on the correct side of critical'); near('visual', num(g.rej.replace('M', '')), cx, 0.2, 'shading starts at the critical value');
    g.fs.forEach((f) => ok('visual', f >= 11, 'curve text ' + f.toFixed(2) + 'px'));
    g.boxes.forEach((b) => ok('visual', b[0] >= -1 && b[1] <= b[4] + 1, 'curve label outside the picture ' + b.join(',')));
    for (let a = 0; a < g.boxes.length; a++) for (let b = a + 1; b < g.boxes.length; b++) { const A = g.boxes[a], B = g.boxes[b]; ok('visual', !(A[0] < B[1] - 1 && B[0] < A[1] - 1 && A[2] < B[3] - 2 && B[2] < A[3] - 2), 'curve labels overlap ' + A.join(',') + ' | ' + B.join(',')); }
    const ks = g.heat.slice(0, -1).filter(Boolean).map((h) => [parseInt((h[0].match(/xs-h(\d)/) || [0, 0])[1], 10), num(h[1])]); const mx = Math.max(...ks.map((k) => k[1])); ks.forEach((k) => ok('visual', k[1] < 0.00006 || Math.abs(k[0] - Math.max(1, Math.ceil(k[1] / mx * 4))) <= (Math.abs(k[1] / mx * 4 - Math.round(k[1] / mx * 4)) < 0.001 ? 1 : 0), 'heat level ' + k.join(' of ') + ' max ' + mx));
    ok('visual', g.small === 0, 'text under 12px: ' + g.small);
  }
  { await fit([5, 30, 12, 13]); await sleep(60); const g = await geo(); const O = [5, 30, 12, 13], max = 30; g.rows.forEach((r, i) => { near('visual', r.segs[0].w, O[i] / max * r.w, 0.8, 'fit bar pixels'); near('visual', r.marks[0], 15 / max * r.w, 1.2, 'expected marker'); }); }
  for (const [mode, entry, shown, hidden] of [['table', 'grid', 'xsGridW', 'xsRawW'], ['table', 'raw', 'xsRawW', 'xsGridW'], ['table', 'paste', 'xsPasteW', 'xsGridW'], ['fit', 'paste', 'xsFitPW', 'xsTabW'], ['value', null, 'xsValW', 'xsFitW']]) {
    await reset(mode, entry); await sleep(250); const s = JSON.parse(await ctx.eval('JSON.stringify({a:!!document.getElementById("' + shown + '").getClientRects().length,b:!!document.getElementById("' + hidden + '").getClientRects().length,m:document.querySelector("#xsMode .on").getAttribute("data-v"),e:document.querySelector("#xsEntry .on").getAttribute("data-v"),f:document.querySelector("#xsFEntry .on").getAttribute("data-v")})'));
    ok('visual', s.a && !s.b && s.m === mode && (mode !== 'table' || s.e === entry) && (mode !== 'fit' || s.f === entry), 'buttons match panels ' + mode + ' ' + entry + ' ' + JSON.stringify(s)); }
  ok('extremes', Date.now() - t0 < 240000, 'whole script under 4 minutes');
  return { fails: fails.slice(0, 40), cats, runs };
};
