/* FINAL GATE script for anova-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, worked example tables and sentences, pair table, F critical table, test comparison, sample size table, FAQ, sources) is re-derived by DRIVING THE TOOL.
   extremes:   published anchors (standard F table, studentized range values, competitor example outputs read 2026-11-27), zero and enormous F, extreme degrees of freedom, huge and tiny values, 20 groups and
               5,000 values per group against a time limit, two groups against the t-test identity.
   visual:     the picture is re-measured from the DOM (dot, tick and interval positions in pixels against the data, row order, letters, shaded rows, labels not clipped or overlapping, text size as rendered),
               the pair strip and its zero line, the curve lines against the axis numbers, and the selected buttons against the panels shown. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const num = (t) => { const s = String(t).replace(/−/g, '-').replace(/,/g, ''); const m = s.match(/(-?[\d.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt([...m[2]].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c) >= 0 ? '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c) : '-').join(''), 10)); const q = s.match(/-?\d+\.?\d*(e[+-]?\d+)?/i); return q ? parseFloat(q[0]) : NaN; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){var s=c.querySelector("small");if(!s)return c.textContent.replace(/\\s+/g," ").trim();var k=c.cloneNode(true);k.querySelector("small").remove();return k.textContent.trim()+"|"+s.textContent.trim();});});};' +
    'var o={big:g("anBig"),sub:g("anSub"),tip:g("anTip"),lab:g("anLab"),hint:g("anHint"),why:g("anWhy"),write:g("anWrite")};["anTests","anTable","anSumT","anPairs","anFull","anLoo","anPow","anEffT","anChk"].forEach(function(i){o[i]=rows(i);});["anAlphaNote","anEffNote","anVisKey","anTableKey","anDiffKey"].forEach(function(i){o[i]=g(i);});return o;})())'));
  const bulk = (o) => ctx.eval('(function(o){Object.keys(o).forEach(function(k){__qa.set(k,String(o[k]));});return 1;})(' + JSON.stringify(o) + ')');
  const reset = async (mode, entry) => { await ctx.click('anClear'); if ((await ctx.eval('document.getElementById("anAdvIn").style.display')) === 'none') await ctx.click('anAdvBtn'); await ctx.seg('anMode', mode); await ctx.seg('anEntry', entry || 'boxes'); await ctx.seg('anSpread', 'sd'); await ctx.seg('anMethod', 'auto'); await ctx.seg('anOut', 'keep'); await ctx.seg('anEffType', 'f'); await ctx.set('anPost', 'auto'); };
  const groups = async (G, extra) => { await reset('raw'); for (let i = 3; i < G.length; i++) await ctx.click('anAddG'); if (G.length === 2) await ctx.click('anDelG'); const v = {}; G.forEach((g, i) => { v['anGV' + (i + 1)] = g.join(' '); }); Object.assign(v, extra || {}); await bulk(v); runs++; return read(); };
  const fval = async (d1, d2, F, alpha) => { await reset('f'); await bulk({ anAlpha: alpha === undefined ? '' : alpha, anDf1: d1, anDf2: d2, anFv: F === undefined ? '' : F }); runs++; return read(); };
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const ex = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.an-ex"),function(t){return [].map.call(t.querySelectorAll("tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))'));
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const near = (cat, got, exp, tol, msg) => ok(cat, isFinite(got) && Math.abs(got - exp) <= tol, msg + ' (got ' + got + ', expected ' + exp + ')');
  const pOf = (sub) => ((sub.match(/p (?:=|<) ([^·]+)/) || [])[1] || '').trim();
  const G = ex[0].map((r) => r[1].split(', ').map(Number)), G3 = [G[0], G[1], G[2]];

  /* ======== 1. textVsTool ======== */
  if (!ctx.mobile) {
    const st = await groups(G3); const F = st.big.replace('F = ', ''), p = pOf(st.sub);
    inText(H, 'F = ' + F + ' with 2 and 12 degrees of freedom, p = ' + p, 'lead');
    ex[0].forEach((r, i) => { const s = st.anSumT[i + 1]; ok('textVsTool', num(r[2]) === num(s[2]) && num(r[3]) === num(s[3]), 'example group ' + i + ' ' + r.join(' / ') + ' tool ' + s.join(' / ')); });
    [[0, [1, 2, 3, 4]], [1, [1, 2, 3]], [2, [1, 2]]].forEach(([row, cols]) => cols.forEach((c) => near('textVsTool', num(ex[1][row][c]), num(st.anTable[row + 1][c]), 0.00006, 'ANOVA table ' + row + ',' + c)));
    ok('textVsTool', C.indexOf('critical value ' + st.anTableKey.match(/is ([\d.]+)\./)[1]) >= 0, 'critical value sentence');
    inText(C, 'F = ' + F + ' is above the critical value', 'F sentence'); inText(C, 'and the p-value is ' + p, 'p sentence');
    inText(C, 'Eta squared is ' + st.anEffT[0][1].split(' ')[0] + ', omega squared ' + st.anEffT[1][1] + ' and Cohen’s f ' + st.anEffT[2][1].split(' ')[0], 'effect sizes');
    near('textVsTool', num((C.match(/The grand mean is ([\d.]+)\./) || [])[1]), 27.4, 0.00001, 'grand mean');
    ex[2].forEach((r, i) => { const q = st.anPairs[i + 1]; near('textVsTool', num(r[1]), num(q[1]), 0.006, 'pair diff ' + i); const a = r[2].split(' to '), b = q[2].split(' to '); near('textVsTool', num(a[0]), num(b[0]), 0.006, 'pair low'); near('textVsTool', num(a[1]), num(b[1]), 0.006, 'pair high'); near('textVsTool', num(r[3]), num(q[3].replace(' *', '')), Math.max(0.00006 * num(r[3]), 1e-6), 'pair p'); });
    inText(C, 'at least ' + st.anPow[0][1] + ' to count', 'smallest difference'); inText(C, 'A and C differ by 3.4, less than that', 'A C sentence'); inText(C, 'studentized range value is 3.7729', 'range value');
    near('textVsTool', num(st.anPow[0][1]), 3.7729 * Math.sqrt(5.6 / 5), 0.006, 'range value reproduces the smallest difference');
    inText(C, 'Tukey gives p = ' + st.anPairs[1][3].replace(' *', '') + ' for A and B, ' + st.anPairs[2][3].replace(' *', '') + ' for A and C and ' + st.anPairs[3][3].replace(' *', '') + ' for B and C', 'FAQ pairs');
    inText(C, 'In the example F = ' + F + ' and p = ' + p, 'FAQ F'); inText(C, 'In the example it is ' + st.anEffT[0][1].split(' ')[0], 'FAQ eta'); inText(C, 'here ' + st.anEffT[2][1].split(' ')[0], 'FAQ f');
    const letters = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll("#anVis .an-gr"),function(g){return [+g.getAttribute("data-g"),g.querySelector(".an-let").textContent]}))')); const L = {}; letters.forEach((x) => { L[x[0]] = x[1]; });
    ok('textVsTool', L[1] === 'a' && L[0] === 'b' && L[2] === 'b', 'letters sentence: B = a, A and C = b, got ' + JSON.stringify(L));
    const t = st.anTests; inText(C, 'F = ' + F + ' (p = ' + p + '), F = ' + t[2][1].split('|')[0].replace('F ', '') + ' with 2 and ' + t[2][1].match(/and ([\d.]+)/)[1] + ' degrees of freedom (p = ' + t[2][2].split('|')[0] + ') and H = ' + t[3][1].split('|')[0].replace('H ', '') + ' (p = ' + t[3][2].split('|')[0] + ')', 'three tests sentence');
    inText(C, 'Levene’s test gives p = ' + st.anChk[2][1].split('|')[1].replace('p = ', '') + ' and Shapiro-Wilk p = ' + st.anChk[1][1].split('|')[1].replace('p = ', ''), 'checks sentence'); ok('textVsTool', /One-way ANOVA \(recommended here\)/.test(st.lab), 'classic recommended as the text says');
    inText(C, 'so ' + st.anPow[3][1] + ' values per group would already give 80% power', 'plan sentence');
    /* F table */
    const df1 = [1, 2, 3, 4, 5, 6];
    for (const r of ex[3]) for (let j = 0; j < df1.length; j++) { const s = await fval(df1[j], +r[0]); near('textVsTool', num(r[j + 1]), num(s.big), 0.0051, 'F table df ' + df1[j] + ',' + r[0]); }
    /* sample sizes: three groups of two values, expected effect f */
    for (const r of ex[4]) { const k = +r[0]; const data = [...Array(k)].map((_, i) => [10 + i, 12 + i]); for (const [j, f] of [[1, '0.1'], [2, '0.25'], [3, '0.4']]) { const s = await groups(data, { anEff: f }); ok('textVsTool', s.anPow[5][1] === r[j], 'sample size k ' + k + ' f ' + f + ': text ' + r[j] + ' tool ' + s.anPow[5][1]); if (k === 3) inText(C, f === '0.1' ? 'about ' + s.anPow[5][1] + ' values per group for a small effect' : f === '0.25' ? s.anPow[5][1] + ' for a medium one' : s.anPow[5][1] + ' for a large one', 'FAQ sample size ' + f); } }
    const f1 = await fval(2, 12, 4.5); inText(C, 'For F = 4.5 with 2 and 12 degrees of freedom p = ' + f1.big.replace('p = ', ''), 'FAQ F p'); inText(C, 'get the critical value, ' + f1.sub.match(/critical F ([\d.]+)/)[1] + ' at 0.05', 'FAQ critical');
    near('textVsTool', num(await ctx.eval('String(CalcThis.anovaEngine.qCrit(0.05,5,10))')), 4.65, 0.0051, 'handbook q for 5 means and 10 df'); inText(C, 'q = 4.65 for 5 means and 10 degrees of freedom', 'sources q');
    inText(C, 'at least 15 values per group for 2 to 9 groups and 20 for 10 to 12', 'sources guide'); inText(C, 'Cohen’s f of 0.10, 0.25 and 0.40', 'sources f');
    ok('textVsTool', num(ex[0][0][2]) === 26.6 && num(ex[0][1][2]) === 32.4, 'example averages');
  }

  /* ======== 2. extremes ======== */
  if (!ctx.mobile) {
    for (const [d1, d2, a, v] of [[1, 1, '', 161.4476], [1, 10, '', 4.9646], [2, 12, '0.01', 6.9266], [5, 5, '', 5.0503], [3, 20, '0.001', 8.0984], [10, 100, '', 1.9267]]) { const s = await fval(d1, d2, undefined, a); near('extremes', num(s.big), v, 0.0011, 'standard F table ' + d1 + ',' + d2 + ' ' + a); }
    let s = await fval(2, 12, 0); ok('extremes', s.big === 'p = 1', 'F 0 gives p 1: ' + s.big);
    s = await fval(2, 12, 999999999); ok('extremes', /10⁻|less than/.test(s.big), 'enormous F: ' + s.big);
    s = await fval(100000, 10000000, 1); near('extremes', num(s.big), 0.5, 0.01, 'huge df');
    s = await fval(1, 1, 161.4476); near('extremes', num(s.big), 0.05, 0.00001, 'F(1,1) at the table value');
    s = await groups([[1, 2, 3, 4, 5], [3, 5, 4, 8, 9]]); const F2 = num(s.big.replace('F = ', '')); { const a = [1, 2, 3, 4, 5], b = [3, 5, 4, 8, 9], m = (x) => x.reduce((p, q) => p + q) / x.length, ss = (x) => x.reduce((p, q) => p + (q - m(x)) ** 2, 0), t = (m(a) - m(b)) / Math.sqrt((ss(a) + ss(b)) / 8 * (2 / 5)); near('extremes', F2, t * t, 0.0001, 'two groups: F = t squared'); near('extremes', num(s.anPairs[1][3].replace(' *', '')), num(pOf(s.sub)), 0.0002, 'two groups: Tukey p equals ANOVA p'); }
    s = await groups([[100000001, 100000002, 100000003], [100000004, 100000005, 100000006]]); near('extremes', num(s.big.replace('F = ', '')), 13.5, 0.0001, 'large offset keeps precision');
    s = await groups([[0.000001, 0.000002, 0.000003], [0.000004, 0.000005, 0.000006]]); near('extremes', num(s.big.replace('F = ', '')), 13.5, 0.0001, 'tiny values');
    s = await groups([[1, 2, 3], [1, 2, 3]]); ok('extremes', s.big === 'F = 0.0000' && /p = 1 /.test(s.sub), 'identical groups: ' + s.big + ' ' + s.sub);
    s = await groups([[1, 1.0001, 1], [900000000, 900000001, 900000000]]); ok('extremes', /F = /.test(s.big) && !/NaN|Infinity/.test(s.big + s.sub + JSON.stringify(s.anPow)), 'enormous effect: ' + s.big);
    s = await groups([[-5, -7, -9], [-1, -2, -3]]); ok('extremes', s.anSumT[1][2] === '−7' && s.anSumT[2][2] === '−2', 'negative values');
    s = await groups([[3, 4], [8, 9]]); ok('extremes', /needs 3 values/.test(JSON.stringify(s.anChk)), 'two values per group: no per-group normality');
    /* published competitor outputs */
    s = await groups([[14, 15, 13, 18, 16, 12], [12, 10, 11, 13, 9, 14], [20, 18, 19, 22, 21, 17], [15, 17, 16, 18, 19, 20]]); near('extremes', num(s.big.replace('F = ', '')), 19.18, 0.0051, 'Jim sample F'); near('extremes', num(s.anEffT[3][1]), 1.9472, 0.00006, 'Jim S'); near('extremes', num(s.anEffT[5][1]), 70.33, 0.051, 'Jim adjusted R2'); near('extremes', num(s.anEffT[6][1]), 62.85, 0.051, 'Jim predicted R2');
    s = await groups([[23, 25, 28, 30, 27], [31, 33, 35, 29, 34], [22, 24, 21, 26, 23]]); [[-9.79, -1.81], [-0.59, 7.39], [5.21, 13.19]].forEach((v, i) => { const iv = s.anPairs[i + 1][2].split(' to '); near('extremes', num(iv[0]), v[0], 0.0051, 'published Tukey low'); near('extremes', num(iv[1]), v[1], 0.0051, 'published Tukey high'); });
    /* size and time */
    { const G20 = [...Array(20)].map((_, i) => [...Array(30)].map((__, j) => (i * 7 + j * 13) % 23 + i)); const s0 = Date.now(); s = await groups(G20); const dt = Date.now() - s0; ok('extremes', s.anPairs.length === 191 && dt < 12000, '20 groups: ' + s.anPairs.length + ' rows in ' + dt + ' ms'); await ctx.seg('anMethod', 'welch'); const s1 = Date.now(); s = await read(); await ctx.set('anPost', 'games'); const dt2 = Date.now() - s1; ok('extremes', dt2 < 6000, 'Games-Howell on 20 groups in ' + dt2 + ' ms'); }
    { const big = [...Array(3)].map((_, i) => [...Array(5000)].map((__, j) => (j * 37 + i * 11) % 101 + i)); const s0 = Date.now(); s = await groups(big); const dt = Date.now() - s0; ok('extremes', /15,000 values in 3 groups/.test(s.sub) && dt < 8000, '15,000 values in ' + dt + ' ms: ' + s.sub); ok('extremes', /not tested above/.test(s.why) || /Shapiro/.test(s.why), 'large sample explanation: ' + s.why); }
    s = await groups([[...Array(5001)].map((_, i) => i), [1, 2, 3]]); ok('extremes', /up to 5,000 per group/.test(s.hint) && s.big === '—', 'over the limit: ' + s.hint);
  }

  /* ======== 3. visual ======== */
  const geo = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var o={},sv=document.querySelector("#anVis svg"),r=sv.getBoundingClientRect();o.scale=r.width/sv.viewBox.baseVal.width;o.lo=+document.getElementById("anVis").getAttribute("data-lo");o.hi=+document.getElementById("anVis").getAttribute("data-hi");o.l=r.left;o.rows=[].map.call(sv.querySelectorAll(".an-gr"),function(g){var q=function(s){var e=g.querySelector(s);return e?e.getBoundingClientRect():null;},m=q(".an-mean"),c=q(".an-ci"),n=g.querySelector(".an-nm").getBoundingClientRect(),lt=g.querySelector(".an-let"),b=g.querySelector(".an-bg").getBoundingClientRect();return {box:q(".an-box")?[q(".an-box").left-r.left,q(".an-box").right-r.left]:null,g:+g.getAttribute("data-g"),on:g.classList.contains("on"),bg:getComputedStyle(g.querySelector(".an-bg")).fill,top:b.top,bottom:b.bottom,mean:m?(m.left+m.right)/2-r.left:null,ci:c?[c.left-r.left,c.right-r.left]:null,dots:[].map.call(g.querySelectorAll(".an-dot"),function(d){var z=d.getBoundingClientRect();return [(z.left+z.right)/2-r.left,z.top,z.bottom];}),nameR:n.right,nameFs:parseFloat(getComputedStyle(g.querySelector(".an-nm")).fontSize)*r.width/sv.viewBox.baseVal.width,mvFs:parseFloat(getComputedStyle(g.querySelector(".an-mv")).fontSize)*r.width/sv.viewBox.baseVal.width,letL:lt?lt.getBoundingClientRect().left:99999,letters:lt?lt.textContent:""};});' +
    'o.tax=[].map.call(sv.querySelectorAll(".an-tax"),function(t){var q=t.getBoundingClientRect();return [t.textContent,q.left-r.left,q.right-r.left,parseFloat(getComputedStyle(t).fontSize)*r.width/sv.viewBox.baseVal.width];});o.w=r.width;' +
    'var d=document.querySelector("#anDiff svg");if(d){var rd=d.getBoundingClientRect(),f=function(s){var e=d.querySelector(s).getBoundingClientRect();return [e.left-rd.left,e.right-rd.left];};o.diff={w:rd.width,lo:+document.getElementById("anDiff").getAttribute("data-lo"),hi:+document.getElementById("anDiff").getAttribute("data-hi"),zero:f(".an-zero"),ci:f(".an-dci"),pt:f(".an-dpt"),sig:d.querySelector(".an-dci").classList.contains("sig")};}' +
    'var cv=document.querySelector("#anCurve svg");if(cv){var rc=cv.getBoundingClientRect(),a=function(s){var e=cv.querySelector(s);return e?e.getAttribute("d"):"";};o.curve={crit:a(".an-crit"),stat:a(".an-stat"),rej:a(".an-rej"),axis:[].map.call(cv.querySelectorAll(".an-tax"),function(t){return t.textContent;}),tstat:(cv.querySelector(".an-tstat")||{}).textContent,fs:[].map.call(cv.querySelectorAll("text"),function(t){return parseFloat(getComputedStyle(t).fontSize)*rc.width/cv.viewBox.baseVal.width;}),boxes:[].map.call(cv.querySelectorAll("text"),function(t){var q=t.getBoundingClientRect();return [q.left-rc.left,q.right-rc.left,q.top-rc.top,q.bottom-rc.top,rc.width];})};}' +
    'o.small=[].map.call(document.querySelectorAll("#anBody p,#anBody td,#anBody th,#anBody li,#anBody small"),function(e){return e.getClientRects().length?parseFloat(getComputedStyle(e).fontSize):99;}).filter(function(v){return v<12;}).length;o.over=[].filter.call(document.querySelectorAll("#anBody table"),function(t){return t.getClientRects().length&&t.getBoundingClientRect().right>t.closest(".card").getBoundingClientRect().right+1;}).length;return o;})())'));
  const cases = [[[23, 25, 28, 30, 27], [31, 33, 35, 29, 34], [22, 24, 21, 26, 23]], [[2, 3, 3, 4, 4, 5, 21], [6, 7, 7, 8, 9, 9, 40], [3, 3, 4, 5, 5, 6, 7]], [[10, 11, 12], [30, 33, 36], [10.5, 11.5, 13], [50, 49, 51], [12, 13, 11]], [[1000000.5, 1000001, 999999], [1000004, 1000005, 1000003.5]]];
  for (const D of cases) {
    const st = await groups(D); await sleep(60); const g = await geo(); const kw = /Kruskal/.test(st.lab), X = (v) => (8 + (v - g.lo) / (g.hi - g.lo) * 344) * g.scale;
    ok('visual', g.rows.length === D.length, 'one row per group');
    let prevBottom = 0;
    g.rows.forEach((r) => { const v = D[r.g].slice().sort((a, b) => a - b), mean = v.reduce((a, b) => a + b, 0) / v.length, med = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
      near('visual', r.mean, X(kw ? med : mean), 1, 'centre tick pixel group ' + r.g);
      near('visual', Math.min(...r.dots.map((d) => d[0])), X(v[0]), 1, 'smallest dot'); near('visual', Math.max(...r.dots.map((d) => d[0])), X(v[v.length - 1]), 1, 'largest dot');
      { const Q = (p) => { const h = (v.length - 1) * p, l = Math.floor(h); return l + 1 < v.length ? v[l] + (h - l) * (v[l + 1] - v[l]) : v[l]; }; near('visual', r.box[0], X(Q(0.25)), 1.5, 'box left'); near('visual', r.box[1], X(Q(0.75)), 1.5, 'box right'); }
      ok('visual', r.dots.every((d) => d[1] >= r.top - 0.5 && d[2] <= r.bottom + 0.5), 'dots inside their row'); ok('visual', r.top >= prevBottom - 0.5, 'rows do not overlap'); prevBottom = r.bottom;
      if (!kw) { const row = st.anSumT[r.g + 1][4].split(' to '); near('visual', r.ci[0], X(num(row[0])), 1.5, 'interval left'); near('visual', r.ci[1], X(num(row[1])), 1.5, 'interval right'); } else ok('visual', r.ci === null, 'no interval bar for ranks');
      ok('visual', r.nameR < r.letL - 2, 'name does not run into the letters'); ok('visual', r.nameFs >= 11 && r.mvFs >= 11, 'row text ' + r.nameFs.toFixed(1) + ' / ' + r.mvFs.toFixed(1)); ok('visual', r.letters.length > 0, 'letters drawn'); });
    ok('visual', g.rows.filter((r) => r.on).length === 2 && g.rows.every((r) => r.on === (r.bg === 'rgb(251, 235, 198)')), 'two shaded rows');
    const k = g.rows.filter((r) => r.on).map((r) => r.g).sort((a, b) => a - b); ok('visual', st.anDiffKey.indexOf('Group ' + (k[0] + 1) + ' minus Group ' + (k[1] + 1)) >= 0, 'shaded rows are the picked pair: ' + st.anDiffKey);
    g.tax.forEach((t) => { ok('visual', t[1] >= -1 && t[2] <= g.w + 1 && t[3] >= 11, 'axis label inside and readable ' + t.join(',')); });
    ok('visual', g.tax[0][2] < g.tax[1][1] && g.tax[1][2] < g.tax[2][1], 'axis labels apart');
    const d = g.diff, XD = (v) => (8 + (v - d.lo) / (d.hi - d.lo) * 344) * d.w / 360, m = st.anDiffKey.match(/difference(?: in average rank)? ([^,]+), [\d.]+% interval (.+?) to (.+?) \(/);
    near('visual', (d.zero[0] + d.zero[1]) / 2, XD(0), 1, 'zero line'); near('visual', (d.pt[0] + d.pt[1]) / 2, XD(num(m[1])), 1.2, 'difference dot'); ok('visual', Math.abs(d.ci[0] - XD(num(m[2]))) < 6 && Math.abs(d.ci[1] - XD(num(m[3]))) < 6, 'difference bar ends');
    ok('visual', d.sig === /significantly different/.test(st.anDiffKey) && (!d.sig || d.zero[0] < d.ci[0] || d.zero[1] > d.ci[1]), 'significant bar does not cross zero');
    const c = g.curve, xmax = num(c.axis[1]), XC = (v) => 10 + v / xmax * 340, cx = num(c.crit.replace('M', '')), sx = num(c.stat.replace('M', '')), stat = num(st.big.replace(/^[FH] = /, '')), crit = num(c.tstat && st.anTableKey ? (await ctx.eval('document.querySelector("#anCurve .an-tcrit").textContent')).replace('critical ', '') : '0');
    near('visual', cx, XC(crit), 340 / xmax * 0.011 + 0.3, 'critical line'); if (/→/.test(c.tstat)) near('visual', sx, 350, 0.2, 'far statistic at the edge'); else near('visual', sx, XC(stat), 340 / xmax * 0.006 + 0.3, 'statistic line');
    ok('visual', (stat > crit) === (sx > cx), 'statistic on the correct side'); near('visual', num(c.rej.replace('M', '')), cx, 0.2, 'shading starts at the critical value');
    c.fs.forEach((f) => ok('visual', f >= 11, 'curve text ' + f.toFixed(2) + 'px'));
    c.boxes.forEach((b) => ok('visual', b[0] >= -1 && b[1] <= b[4] + 1, 'curve label inside ' + b.join(',')));
    for (let a = 0; a < c.boxes.length; a++) for (let b = a + 1; b < c.boxes.length; b++) { const A = c.boxes[a], B = c.boxes[b]; ok('visual', !(A[0] < B[1] - 1 && B[0] < A[1] - 1 && A[2] < B[3] - 2 && B[2] < A[3] - 2), 'curve labels overlap ' + A.join(',') + ' | ' + B.join(',')); }
    ok('visual', g.small === 0, 'text under 12px: ' + g.small); ok('visual', g.over === 0, 'table wider than the card: ' + g.over);
  }
  /* long names and many groups stay inside the card */
  { await reset('raw'); for (let i = 3; i < 9; i++) await ctx.click('anAddG'); const v = {}; for (let i = 1; i <= 9; i++) { v['anGN' + i] = 'Very long treatment ' + i; v['anGV' + i] = [i * 1000000 + 1, i * 1000000 + 7, i * 1000003].join(' '); } await bulk(v); await ctx.eval('[].forEach.call(document.querySelectorAll("#anBody details"),function(d){d.open=true;d.dispatchEvent(new Event("toggle"))})'); await sleep(150); const g = await geo(); ok('visual', g.over === 0, 'long names: tables inside the card (' + g.over + ')'); const names = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll("#anSumT tbody td:first-child"),function(t){return t.textContent}))')); ok('visual', new Set(names).size === 9, 'shortened names stay different: ' + names.join(' | ')); ok('visual', await ctx.eval('document.documentElement.scrollWidth<=document.documentElement.clientWidth+1'), 'page not wider than the screen'); }
  for (const [mode, entry, shown, hidden] of [['raw', 'boxes', 'anBoxesW', 'anSumW'], ['raw', 'cols', 'anColsW', 'anBoxesW'], ['raw', 'stack', 'anStackW', 'anColsW'], ['sum', 'boxes', 'anSumW', 'anRawW'], ['f', 'boxes', 'anFW', 'anSumW']]) {
    await reset(mode, entry); await sleep(200); const s = JSON.parse(await ctx.eval('JSON.stringify({a:!!document.getElementById("' + shown + '").getClientRects().length,b:!!document.getElementById("' + hidden + '").getClientRects().length,m:document.querySelector("#anMode .on").getAttribute("data-v"),e:document.querySelector("#anEntry .on").getAttribute("data-v")})'));
    ok('visual', s.a && !s.b && s.m === mode && s.e === entry, 'buttons match panels ' + mode + ' ' + entry + ' ' + JSON.stringify(s)); }
  ok('extremes', Date.now() - t0 < 280000, 'whole script under the limit');
  return { fails: fails.slice(0, 40), cats, runs };
};
