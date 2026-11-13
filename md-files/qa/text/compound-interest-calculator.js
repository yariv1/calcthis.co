/* FINAL GATE script for compound-interest-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, formula example, compounding table, simple-vs-compound example, deposits table, goal examples, rule of 72 table, tax and inflation, FAQ) is re-derived by DRIVING THE TOOL.
   extremes:   published constants ((1.05)^10, (1 + 0.05/12)^120, e^0.5, the annuity 100 a month at 5% for 10 years = 15,528.23), zero rate, a one-month term, 100 years, 1e12, a goal below the start (rate 0), and a time limit.
   visual:     the stacked growth chart is re-measured from the SVG: first / last x, the layers' heights against the numbers table, the dashed no-compounding line, the crossover marker year against the yearly table, the rate-range lines, text >= 11px rendered. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0; const t0 = Date.now();
  const num = (t) => { const q = String(t).replace(/[−]/g, '-').replace(/[$,]/g, '').match(/-?\d+\.?\d*/); return q ? parseFloat(q[0]) : NaN; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("icBig"),lab:g("icLab"),sub:g("icSub"),nums:rows("icNums"),cmp:rows("icCmp"),sc:rows("icSc"),sch:rows("icSch"),hint:g("icHint"),gn:g("icGNote")};})())'));
  const reset = async () => { const o = (await ctx.eval('document.getElementById("icAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('icAdvBtn'); await ctx.click('icClear'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const row = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  await ctx.eval('[].forEach.call(document.querySelectorAll("details"),function(d){d.open=true})');
  const C = (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' '), H = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const inText = (txt, str, tag) => { cats.textVsTool++; if (txt.indexOf(str) < 0) fails.push('text-vs-tool ' + tag + ': page text lacks the tool value [' + str + ']'); };
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const drive = async (o, solve) => { await reset(); if (solve) await ctx.set('icSolve', solve); await setAll(o); runs++; return read(); };
  const mny = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ======== 1. textVsTool ======== */
  const A = await drive({ icP: '10000', icR: '5', icY: '10' });
  const aBal = row(A.nums, 'Final balance')[1], aInt = row(A.nums, 'Total interest')[1];
  inText(H, 'grows to ' + aBal + ' in 10 years', 'lead balance'); inText(C, '= ' + aBal + ', which is ' + aInt + ' of interest', 'formula example');
  { /* compounding table */
    const names = { annual: 'Annually', semi: 'Semiannually', quarterly: 'Quarterly', monthly: 'Monthly', weekly: 'Weekly', daily: 'Daily', cont: 'Continuously' };
    const tabs = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.dtable"),function(t){return [].map.call(t.querySelectorAll("tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim();});});}))'));
    const ct = tabs.filter((t) => t[0] && t[0][0] === 'Compounded')[0], ex = tabs.filter((t) => t[0] && /Plus \$200 a month/.test(t[0][0]))[0], r72 = tabs.filter((t) => t[0] && t[0][0] === 'Yearly rate')[0];
    ok('textVsTool', !!ct && !!ex && !!r72, 'content tables not found');
    for (const c of ['annual', 'semi', 'quarterly', 'monthly', 'weekly', 'daily', 'cont']) { const st = await drive({ icP: '10000', icR: '5', icY: '10', icComp: c }); const cell = ct.filter((r) => r[0] === names[c])[0]; inText(cell ? cell[1] : '', row(st.nums, 'Final balance')[1], 'compounding table ' + c); }
    for (const [ix, y] of [[1, 10], [2, 20], [3, 30]]) { const st = await drive({ icP: '10000', icD: '200', icR: '6', icY: String(y) }); ok('textVsTool', Math.abs(num(ex[1][ix]) - num(row(st.nums, 'Total you put in')[1])) <= 0.5001, 'deposits table put in ' + y + ' cell ' + ex[1][ix]); ok('textVsTool', Math.abs(num(ex[2][ix]) - num(row(st.nums, 'Total interest')[1])) <= 0.5001, 'deposits table interest ' + y + ' cell ' + ex[2][ix]); ok('textVsTool', Math.abs(num(ex[3][ix]) - num(row(st.nums, 'Final balance')[1])) <= 0.5001, 'deposits table balance ' + y + ' cell ' + ex[3][ix]); }
    for (const rate of [2, 4, 6, 8, 10, 12]) { const st = await drive({ icP: '1000', icR: String(rate), icY: '1', icComp: 'annual' }); const rw = r72.filter((r) => r[0] === rate + '%')[0], dbl = row(st.nums, 'Doubling time of the starting amount'); ok('textVsTool', !!rw && Math.abs(num(rw[1]) - num(dbl[1].split(' years')[0])) < 0.0051, 'rule of 72 table exact ' + rate + ' cell ' + (rw && rw[1]) + ' tool ' + dbl[1]); ok('textVsTool', !!rw && Math.abs(num(rw[2]) - num(dbl[1].match(/rule of 72: ([\d.]+)/)[1])) < 0.0051, 'rule of 72 table rule ' + rate); }
  }
  { const st = await drive({ icP: '1000', icR: '10', icY: '2', icComp: 'annual' }); inText(C, 'earns ' + mny(num(row(st.nums, 'Same money without compounding')[1]) - 1000) + ' in interest with simple interest and ' + row(st.nums, 'Total interest')[1] + ' when compounded yearly', 'simple versus compound example'); inText(C, mny(1000) + ' at 10% for 2 years gives ' + row(st.nums, 'Same money without compounding')[1] + ' with simple interest and ' + row(st.nums, 'Final balance')[1], 'FAQ simple versus compound'); }
  { const st = await drive({ icP: '10000', icD: '200', icR: '6', icY: '20' }); inText(C, 'you have put in ' + row(st.nums, 'Total you put in')[1] + ' and the interest adds ' + row(st.nums, 'Total interest')[1], 'deposits paragraph'); inText(C, 'becomes ' + row(st.nums, 'Final balance')[1] + ' after 20 years: you put in ' + row(st.nums, 'Total you put in')[1] + ' and the interest adds ' + row(st.nums, 'Total interest')[1], 'FAQ monthly saving');
    const s0 = await drive({ icP: '10000', icR: '6', icY: '20' }); inText(C, 'would have grown to ' + row(s0.nums, 'Final balance')[1], 'deposits paragraph, no deposits'); }
  { const st = await drive({ icR: '5', icY: '20', icG: '100000' }, 'deposit'); inText(C, 'you need ' + st.big.split(' a ')[0] + ' a month (' + row(st.nums, 'Total you put in')[1] + ' put in, ' + row(st.nums, 'Total interest')[1] + ' interest)', 'goal example deposit'); inText(C, 'you need ' + st.big.split(' a ')[0] + ' a month: ' + row(st.nums, 'Total you put in')[1] + ' put in and ' + row(st.nums, 'Total interest')[1] + ' of interest', 'FAQ goal deposit'); }
  { const st = await drive({ icP: '50000', icD: '1000', icR: '7', icG: '1000000' }, 'years'); inText(C, 'pass ' + mny(1000000) + ' after ' + st.big, 'goal example time'); inText(C, 'you pass ' + mny(1000000) + ' after ' + st.big + '.', 'FAQ goal time'); }
  { const st = await drive({ icR: '5', icY: '10', icG: '50000' }, 'start'); inText(C, 'you need ' + st.big + ' today; the interest makes up the other ' + row(st.nums, 'Total interest')[1], 'FAQ starting amount'); }
  { await reset(); await ctx.set('icGoalKind', 'int'); await ctx.set('icSolve', 'deposit'); await setAll({ icR: '5', icY: '10', icG: '10000' }); const st = await read(); inText(C, 'you would save ' + st.big.split(' a ')[0] + ' a month: ' + row(st.nums, 'Total you put in')[1] + ' put in and ' + row(st.nums, 'Total interest')[1] + ' of interest', 'FAQ interest goal'); }
  { const st = await drive({ icP: '10000', icY: '10', icG: '20000' }, 'rate'); inText(C, 'you need about ' + st.big.replace(' a year', '') + ' a year', 'goal example rate'); }
  { const t = await drive({ icP: '10000', icR: '5', icY: '10', icTax: '20' }), a2 = await drive({ icP: '10000', icR: '5', icY: '10', icInf: '2.5' }); inText(C, 'becomes ' + row(A.nums, 'Final balance')[1] + ' with no tax and ' + row(t.nums, 'Final balance')[1] + ' with a 20% tax', 'tax example'); inText(C, row(A.nums, 'Final balance')[1] + ' in 10 years buys what ' + row(a2.nums, 'Buying power in today’s money')[1] + ' buys today', 'inflation example'); inText(C, row(t.nums, 'Final balance')[1] + ' instead of ' + row(A.nums, 'Final balance')[1], 'FAQ tax'); }
  { const dbl = row((await drive({ icP: '1000', icR: '6', icY: '1', icComp: 'annual' })).nums, 'Doubling time of the starting amount')[1].split(' years')[0]; inText(C, 'compounded yearly is ' + num(dbl).toFixed(2) + ' years', 'FAQ doubling'); }
  { const a = await drive({ icP: '10000', icR: '5', icY: '10', icComp: 'annual' }), b = await drive({ icP: '10000', icR: '5', icY: '10', icComp: 'daily' }); inText(C, row(a.nums, 'Final balance')[1] + ' compounded yearly, ' + row(A.nums, 'Final balance')[1] + ' monthly and ' + row(b.nums, 'Final balance')[1] + ' daily', 'FAQ compounding'); }

  /* ======== 2. extremes ======== */
  { const K = [[{ icP: '1000', icR: '5', icY: '10', icComp: 'annual' }, 1628.89], [{ icP: '1000', icR: '5', icY: '10', icComp: 'monthly' }, 1647.01], [{ icP: '1000', icR: '5', icY: '10', icComp: 'cont' }, 1648.72], [{ icP: '1000', icR: '5', icY: '10', icComp: 'daily' }, 1648.66], [{ icD: '100', icR: '5', icY: '10', icComp: 'monthly' }, 15528.23], [{ icP: '1', icR: '5', icY: '100', icComp: 'annual' }, 131.50]];
    for (const [o, v] of K) { const st = await drive(o); ok('extremes', Math.abs(num(st.big) - v) < 0.0051, 'published constant ' + JSON.stringify(o) + ' tool ' + st.big + ' vs ' + v); } }
  { let st = await drive({ icP: '1000', icD: '100', icR: '0', icY: '12 months' }); ok('extremes', st.big === '$2,200.00' && row(st.nums, 'Total interest')[1] === '$0.00' && !/NaN|Infinity/.test(JSON.stringify(st)), 'zero rate gives [' + st.big + '] interest [' + (row(st.nums, 'Total interest') || [])[1] + ']');
    st = await drive({ icP: '1000', icR: '12', icY: '1 month' }); ok('extremes', st.big === '$1,010.00', 'one month at 12% monthly gives [' + st.big + ']');
    st = await drive({ icP: '1000000000000', icR: '5', icY: '1', icComp: 'annual' }); ok('extremes', st.big === '$1,050,000,000,000.00', '1e12 at 5% gives [' + st.big + ']');
    st = await drive({ icP: '1000', icY: '5', icG: '900' }, 'rate'); ok('extremes', st.big === '0% a year', 'goal below the start needs [' + st.big + ']');
    st = await drive({ icP: '1000', icD: '1', icR: '5', icY: '100', icComp: 'annual' }); ok('extremes', !/NaN|Infinity|undefined/.test(JSON.stringify(st)) && st.sch.length === 32, '100 years table rows ' + st.sch.length);
    ok('extremes', Date.now() - t0 < 120000, 'the checks took ' + (Date.now() - t0) + 'ms'); }

  /* ======== 3. visual: the stacked chart re-measured from the SVG ======== */
  const MEAS = 'JSON.stringify((function(){var svg=document.querySelector("#icVis svg");if(!svg)return null;var T=[].map.call(svg.querySelectorAll("text"),function(t){return {t:t.textContent,x:+t.getAttribute("x"),y:+t.getAttribute("y"),fs:+t.getAttribute("font-size")};});var L=[].map.call(svg.querySelectorAll("line"),function(l){return {x1:+l.getAttribute("x1"),x2:+l.getAttribute("x2"),da:l.getAttribute("stroke-dasharray")||"",st:l.getAttribute("stroke")};});var P=[].map.call(svg.querySelectorAll("path"),function(p){return {d:p.getAttribute("d"),fill:p.getAttribute("fill"),stroke:p.getAttribute("stroke"),da:p.getAttribute("stroke-dasharray")||""};});var r=svg.getBoundingClientRect(),cr=svg.closest(".card").getBoundingClientRect();return {T:T,L:L,P:P,w:r.width,vw:svg.viewBox.baseVal.width,right:r.right,cright:cr.right};})())';
  const measure = async () => JSON.parse(await ctx.eval(MEAS));
  const pts = (d) => (d.match(/[ML]([\d.]+),([\d.]+)/g) || []).map((s) => { const m = s.match(/[ML]([\d.]+),([\d.]+)/); return [parseFloat(m[1]), parseFloat(m[2])]; });
  const CB = 140, PL = 46, PR = 272;
  const visualFor = async (tag, o, vr, months) => {
    const st = await drive(o); const m = await measure(); if (!m) { fails.push('visual ' + tag + ': no picture'); cats.visual += 6; return; }
    const bal = num(row(st.nums, 'Final balance')[1]), put = num(row(st.nums, 'Total you put in')[1]), P = num(row(st.nums, 'Starting amount')[1]), simple = num(row(st.nums, 'Same money without compounding')[1]);
    const amber = m.P.filter((p) => p.fill === '#D99A33')[0], green = m.P.filter((p) => p.fill === '#7A9A82')[0], dark = m.P.filter((p) => p.fill === '#37503F')[0];
    const ap = pts(amber.d), n = ap.length / 2, lowE = ap.slice(0, n), upE = ap.slice(n).reverse();
    ok('visual', Math.abs(lowE[0][0] - PL) < 0.2 && Math.abs(lowE[n - 1][0] - PR) < 0.2, tag + ' chart does not span from the first to the last x: ' + lowE[0][0] + ' to ' + lowE[n - 1][0]);
    const hOf = (y) => CB - y;
    const yl = m.T.filter((t) => t.x < PL && /^[\d.]+[KMB]?$/.test(t.t)).map((t) => { const k = /K$/.test(t.t) ? 1e3 : /M$/.test(t.t) ? 1e6 : /B$/.test(t.t) ? 1e9 : 1; return parseFloat(t.t) * k; }), top = Math.max.apply(null, yl), px = (v) => v / top * (CB - 16);
    ok('visual', top >= bal * 0.999 && top <= bal * 2.6, tag + ' y axis top ' + top + ' for a balance of ' + bal);
    ok('visual', Math.abs(hOf(upE[n - 1][1]) - px(bal)) < 0.16, tag + ' balance layer is ' + hOf(upE[n - 1][1]) + 'px high, expected ' + px(bal));
    ok('visual', Math.abs(hOf(lowE[n - 1][1]) - px(put)) < 0.16, tag + ' total put in is ' + hOf(lowE[n - 1][1]) + 'px high, expected ' + px(put));
    if (P > 0) { const dp = pts(dark.d), dn = dp.length / 2, dtop = dp.slice(dn).reverse(); ok('visual', Math.abs(hOf(dtop[dn - 1][1]) - px(P)) < 0.16, tag + ' starting-amount layer ' + hOf(dtop[dn - 1][1]) + 'px high, expected ' + px(P)); } else cats.visual++;
    const dash = m.P.filter((p) => p.da === '5 3')[0], dpts = pts(dash.d); ok('visual', Math.abs(hOf(dpts[dpts.length - 1][1]) - px(simple)) < 0.16, tag + ' no-compounding line ' + hOf(dpts[dpts.length - 1][1]) + 'px high, expected ' + px(simple));
    /* crossover marker */
    const yrs = st.sch.slice(1).map((r) => [num(r[0]), num(r[1]), num(r[2])]), T = months / 12;
    let cx = null; yrs.forEach((r) => { if (cx === null && r[1] > 0 && r[2] > r[1] && Number.isInteger(r[0]) && r[0] <= T) cx = r[0]; });
    const mk = m.L.filter((l) => l.da === '2 3' && l.st === '#241A11')[0]; if (cx !== null) ok('visual', !!mk && Math.abs(mk.x1 - (PL + cx / T * (PR - PL))) < 0.25, tag + ' crossover marker at ' + (mk && mk.x1) + ' expected year ' + cx); else if (yrs.length >= 30) cats.visual++; else ok('visual', !mk, tag + ' crossover marker drawn although interest never passes the deposits');
    const scale = m.w / m.vw; ok('visual', m.T.every((t) => t.fs * scale >= 11), tag + ' text smaller than 11px rendered (scale ' + scale.toFixed(2) + ')');
    ok('visual', m.right <= m.cright + 1, tag + ' picture pokes out of its card');
    if (vr) { const dots = m.P.filter((p) => p.da === '2 3'); ok('visual', dots.length === 2, tag + ' rate-range lines ' + dots.length); const sc = st.sc.slice(1).map((r) => num(r[1])); if (dots.length === 2) { const e0 = pts(dots[0].d), e1 = pts(dots[1].d); ok('visual', Math.abs(hOf(e0[e0.length - 1][1]) - px(sc[0])) < 0.16 && Math.abs(hOf(e1[e1.length - 1][1]) - px(sc[2])) < 0.16, tag + ' lower / higher rate lines do not match the table'); } }
  };
  await visualFor('start + deposits', { icP: '10000', icD: '200', icR: '6', icY: '20' }, false, 240);
  await visualFor('deposits only, 3 years', { icD: '500', icR: '4', icY: '3' }, false, 36);
  await visualFor('start only, range', { icP: '25000', icR: '7', icY: '15', icVar: '1' }, true, 180);
  await visualFor('short term', { icP: '5000', icD: '100', icR: '8', icY: '9 months' }, false, 9);
  await visualFor('long term, big numbers', { icP: '250000', icD: '2500', icR: '9', icY: '60', icInc: '3' }, false, 720);
  return { fails, cats, runs };
};
