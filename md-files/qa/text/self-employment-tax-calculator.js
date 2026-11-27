/* FINAL GATE script for self-employment-tax-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page content (lead, worked example, both profit tables, bracket table, deduction and retirement text, FAQ) re-derived by DRIVING THE TOOL.
   extremes:   floors and caps ($400 net earnings, $108.28 church income, Social Security limit, 300 sq ft, retirement, insurance and IRA caps, 20 children, $1 billion) against closed forms typed here.
   visual:     the waterfall bars, the Social Security meter and the tax-share bars re-measured from the DOM against the numbers; selected buttons and visible fields; rendered text size. */
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0;
  const money = (t) => { const m = String(t).replace(/,/g, '').match(/(−|-)?\+?\$([\d.]+)/); return m ? (m[1] ? -1 : 1) * parseFloat(m[2]) : NaN; };
  const allM = (t) => (String(t).replace(/,/g, '').match(/(−|-)?\$[\d.]+/g) || []).map(money);
  const m2 = (x) => (x < 0 ? '−$' : '$') + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
  const ok = (cat, cond, msg) => { cats[cat]++; if (!cond) fails.push(cat + ': ' + msg); };
  const near = (cat, got, exp, tol, msg) => ok(cat, isFinite(got) && Math.abs(got - exp) <= tol, msg + ' (got ' + got + ', expected ' + exp + ')');
  await ctx.eval('CalcThis.seNow=new Date(2026,10,27);1');
  const READ = 'JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():""};var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim()})})};var o={big:g("seBig"),sub:g("seSub"),tip:g("seTip"),steps:rows("seSteps"),qtr:rows("seQtr"),w2k:g("seW2Key"),stepk:g("seStepKey"),need:rows("seNeed"),tab:rows("seTab"),p:g("sePOut"),hint:g("seHint"),body:document.getElementById("seBody").style.display!=="none"};["seStatusNote","seSstbNote","seRetTypeNote","seAgeNote","seRetNote","seIraNote","sePremNote","seSqftNote","seKidsNote","seM1Note","seM2Note","seChurchNote","seWagesNote","seRateNote"].forEach(function(i){o[i]=g(i)});return o})())';
  const read = async () => JSON.parse(await ctx.eval(READ));
  const openAdv = () => ctx.eval('(function(){var a=document.getElementById("seAdvBtn");if(!/Go simple/.test(a.textContent))a.click();return 1})()');
  const go = async (o) => {
    await ctx.click('seClear'); await openAdv(); await ctx.seg('seMode', o.mode || 'tax'); await ctx.seg('sePer', 'year'); await ctx.seg('seRetType', o.retType || 'sep'); await ctx.seg('seSstb', o.sstb || 'no');
    const set = Object.keys(o).filter((k) => k.slice(0, 2) === 'se');
    if (set.length) await ctx.eval(set.map((k) => '__qa.set(' + JSON.stringify(k) + ',' + JSON.stringify(String(o[k])) + ')').join(';') + ';1');
    runs++; return read();
  };
  const row = (o, name) => { const r = o.steps.find((x) => x[0].indexOf(name) === 0); return r ? r[1] : ''; };
  const rows = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll(".content table.se-ex-t"),function(t){return [].map.call(t.querySelectorAll("tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim()})})}))'));
  const C = (await ctx.eval('[].forEach.call(document.querySelectorAll("details.faq"),function(d){d.open=true});document.querySelector(".content").innerText')).replace(/\s+/g, ' '), Hh = (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ');
  const has = (txt, s, tag) => ok('textVsTool', txt.indexOf(s) >= 0, tag + ': page text lacks [' + s + ']');

  /* ======== 1. text vs tool ======== */
  if (!ctx.mobile) {
    const X = await go({ seIncome: 80000 });
    has(Hh, X.big, 'lead SE'); has(Hh, row(X, 'Federal income tax'), 'lead income tax');
    const [ex, tS, tJ, br] = rows;
    const want = [['Net earnings', row(X, 'Net earnings')], ['Social Security', row(X, 'Social Security 12.4%')], ['Medicare', row(X, 'Medicare 2.9%')], ['Self-employment tax', row(X, 'Self-employment tax')], ['Half', row(X, 'Half of self').replace('−', '')], ['Adjusted', row(X, 'Adjusted gross')], ['Standard', row(X, 'Standard deduction').replace('−', '').replace('.00', '')], ['Business', row(X, 'Qualified business').replace('−', '')], ['Taxable', row(X, 'Taxable income')], ['Federal income tax', row(X, 'Federal income tax')], ['Federal total', row(X, 'Federal total')], ['Each quarter', X.qtr[4][2]]];
    want.forEach((w, i) => ok('textVsTool', ex[i] && ex[i][1] === w[1], 'worked example ' + w[0] + ' text ' + (ex[i] && ex[i][1]) + ' tool ' + w[1]));
    for (const [tbl, st] of [[tS, 'single'], [tJ, 'mfj']]) for (const r of tbl) {
      const profit = money(r[0]), o = await go({ seIncome: profit, seStatus: st });
      const se = money(row(o, 'Self-employment tax')), fed = money(row(o, 'Federal total'));
      near('textVsTool', money(r[1]), se, 0.5, st + ' ' + profit + ' SE'); near('textVsTool', money(r[2]), fed - se, 0.5, st + ' ' + profit + ' income tax'); near('textVsTool', money(r[3]), fed, 0.5, st + ' ' + profit + ' total'); near('textVsTool', parseFloat(r[4]), fed / profit * 100, 0.0501, st + ' ' + profit + ' share');
    }
    const J = await go({ seIncome: 80000, seStatus: 'mfj' }); has(C, 'federal total is ' + row(J, 'Federal total'), 'married example');
    const X2 = await go({ seIncome: 80000 });
    const sal = X2.w2k.match(/Extra W-2 pay of (\$[\d,.]+)/)[1]; has(C, 'salary of about ' + sal, 'salary equivalent');
    has(C, 'adds ' + (X2.tip.match(/the (\$[\d,.]+) of tax/) || [])[1] + ' of tax, ' + (X2.tip.match(/Set aside ([\d.]+%)/) || [])[1] + ' of every payment', 'set-aside FAQ');
    has(C, 'net earnings and ' + X2.big + ' of tax', 'how FAQ'); has(C, 'is ' + row(X2, 'Net earnings') + ' of net earnings', 'how FAQ earnings');
    const save = X2.stepk.match(/save about (\$[\d,.]+)/)[1]; has(C, 'saves about ' + save, 'expense FAQ');
    has(C, row(X2, 'Half of self').replace('−', '') + ' in the example', 'half FAQ');
    const sep = await go({ seIncome: 80000, seRet: 10000 }); has(C, 'from ' + row(X2, 'Federal total') + ' to ' + row(sep, 'Federal total'), 'SEP FAQ'); has(C, 'stays ' + sep.big, 'SEP FAQ SE');
    const w = await go({ seIncome: 40000, seWages: 160000 }); has(C, 'only ' + (row(w, 'Social Security 12.4%') ? w.steps.find((x) => x[0].indexOf('Social Security 12.4%') === 0)[0].match(/on (\$[\d,.]+)/)[1] : '?') + ' of self-employment earnings', 'W-2 FAQ');
    const need = await go({ mode: 'need', seTarget: 60000 }); has(C, 'about ' + need.big + ' of profit', 'need FAQ');
    /* brackets: the top bracket shown by the tool just above and below each edge */
    for (const r of br) { const lo = money(r[1]); if (!(lo > 0)) continue; const target = lo + 2000; const o = await go({ seWages: Math.round(target + 16100), seIncome: 0 }); ok('textVsTool', row(o, 'Taxable income') === m2(target) && o.steps.some((x) => x[0] === 'Federal income tax (top bracket ' + r[0] + ')'), 'bracket ' + r[0] + ' at ' + target + ' shows ' + row(o, 'Taxable income')); }
    for (const [st, label] of [['single', 'single or married filing separately'], ['mfj', 'married filing jointly'], ['hoh', 'head of household']]) { const o = await go({ seIncome: 1000, seStatus: st }); const d = o.seStatusNote.match(/\$[\d,]+/)[0]; has(C, d + ' ' + label, 'standard deduction ' + st); }
    for (const [st, k] of [['single', 'of taxable income ('], ['mfj', 'married filing jointly)']]) { const o = await go({ seIncome: 1000, seStatus: st }); const t = o.seSstbNote.match(/\$[\d,]+/)[0]; has(C, t + ' ' + (st === 'single' ? 'of taxable income' : 'married filing jointly'), 'QBI threshold ' + st + ' ' + k); }
    const big = await go({ seIncome: 900000 }); has(C, 'to ' + m0(money(big.seRetTypeNote)), 'SEP cap'); has(C, '$7,500', 'IRA text'); ok('textVsTool', /\$7,500/.test(big.seAgeNote), 'IRA limit note ' + big.seAgeNote);
    const o50 = await go({ seIncome: 900000, seAge: '50', retType: 'solo' }); ok('textVsTool', o50.seAgeNote.indexOf('$8,600') >= 0 && C.indexOf('$8,600') >= 0, 'IRA 50 ' + o50.seAgeNote); ok('textVsTool', o50.seAgeNote.indexOf('$8,000') >= 0 && C.indexOf('$8,000') >= 0, 'catch-up 50');
    near('textVsTool', money(o50.seRetTypeNote), 80000, 0.01, 'solo 401k at 50 = 72,000 + 8,000');
    const o60 = await go({ seIncome: 900000, seAge: '60', retType: 'solo' }); ok('textVsTool', C.indexOf('$11,250') >= 0, '11,250 text'); near('textVsTool', money(o60.seRetTypeNote), 83250, 0.01, 'solo 401k 60 to 63');
    const small = await go({ seIncome: 30000, retType: 'solo' }); const comp = 30000 - 30000 * 0.9235 * 0.153 / 2; near('textVsTool', money(small.seRetTypeNote), Math.min(24500, comp) + Math.min(0.2 * comp, (comp - Math.min(24500, comp)) / 2), 0.02, 'solo $24,500 deferral'); has(C, '$24,500', 'deferral text');
    const mi = await go({ seIncome: 50000, seM1: 1000, seM2: 1000, seSqft: 300 }); near('textVsTool', money(mi.seM1Note.split('=')[1]), 725, 0.001, '72.5 cents'); near('textVsTool', money(mi.seM2Note.split('=')[1]), 760, 0.001, '76 cents'); near('textVsTool', money(mi.seSqftNote), 1500, 0.001, '$5 x 300'); has(C, '72.5¢', 'mile text'); has(C, '76¢', 'mile text 2'); has(C, '$5 a square foot', 'office text');
    const dates = (await go({ seIncome: 80000 })).qtr.slice(1).map((r) => r[0].replace(/ ?(passed|next)$/, '')); ['April 15', 'June 15', 'September 15', 'January 15'].forEach((d, i) => ok('textVsTool', dates[i].indexOf(d.slice(0, 3)) === 0 && C.indexOf(d) >= 0, 'due date ' + d + ' tool ' + dates[i]));
    const ss = await go({ seIncome: 900000 }); ok('textVsTool', ss.steps.some((x) => x[0] === 'Social Security 12.4% on $184,500.00') && C.indexOf('$184,500') >= 0, 'wage base');
    const q400 = await go({ seIncome: 433 }); ok('textVsTool', q400.big === '$0.00' && C.indexOf('$400 or more') >= 0, '$400 floor');
  }

  /* ======== 2. extremes against closed forms ======== */
  if (!ctx.mobile) {
    const SE = (p) => { const n = p * 0.9235; return n < 400 ? 0 : Math.min(n, 184500) * 0.124 + n * 0.029; };
    for (const p of [0, 1, 433, 433.14, 434, 199783.43, 199783.44, 250000, 1000000000]) { const o = await go({ seIncome: p }); near('extremes', money(o.big), SE(p), 0.0101, 'SE at profit ' + p); }
    { const o = await go({ seIncome: 100000, seWages: 184500 }); near('extremes', money(o.big), 92350 * 0.029, 0.0101, 'wages at the limit leave Medicare only'); }
    { const a = await go({ seChurch: 108.27 }); near('extremes', money(a.big), 0, 0.001, 'church 108.27'); const b = await go({ seChurch: 108.29 }); near('extremes', money(b.big), 108.29 * 0.9235 * 0.153, 0.0101, 'church 108.29'); }
    { const o = await go({ seIncome: 50000, seFarm: -60000, seWages: 40000 }); near('extremes', money(o.big), 0, 0.001, 'farm loss removes SE tax'); near('extremes', money(row(o, 'Adjusted gross income')), 30000, 0.0101, 'loss offsets wages'); }
    { const a = await go({ seIncome: 50000, seSqft: 300 }), b = await go({ seIncome: 50000, seSqft: 100000 }); ok('extremes', a.big === b.big && /limit is 300/.test(b.seSqftNote), 'office over 300 sq ft'); const c = await go({ seIncome: 1000, seExpenses: 800, seSqft: 300 }); near('extremes', money(c.seSqftNote), 200, 0.001, 'office cannot create a loss'); }
    { const o = await go({ seIncome: 100000, seRet: 999999999, sePrem: 999999999, seIra: 999999999 }); const half = SE(100000) / 2, comp = 100000 - half, ret = 0.2 * comp; near('extremes', money(o.seRetNote), ret, 0.0101, 'SEP capped'); near('extremes', money(o.sePremNote), comp - ret, 0.0101, 'insurance capped'); near('extremes', money(o.seIraNote), 7500, 0.001, 'IRA capped'); near('extremes', money(row(o, 'Adjusted gross income')), 100000 - half - ret - (comp - ret) - 7500, 0.0101, 'AGI with capped entries'); }
    { const o = await go({ seIncome: 60000, seKids: 20 }); near('extremes', money(o.seKidsNote), (() => { const half = SE(60000) / 2, earned = 60000 - half; const agi = earned, ti = agi - 16100 - 0.2 * Math.min(agi, agi - 16100), it = 1240 + 0.12 * (ti - 12400); const credit = 44000, nonref = Math.min(credit, it), cap = Math.min(credit - nonref, 34000); return nonref + Math.min(cap, Math.max(0.15 * (earned - 2500), half)); })(), 0.02, '20 children'); }
    { const o = await go({ mode: 'need', seTarget: 999999999 }); ok('extremes', o.body && isFinite(money(o.big)) && money(o.big) > 999999999, 'huge take-home target ' + o.big); const z = await go({ mode: 'need', seTarget: 1 }); near('extremes', money(z.big), 1 / (1 - 0), 0.01, 'one dollar target'); }
    { await go({ seIncome: 50000 }); await ctx.eval('__qa.set("seState","CT");1'); await ctx.set('seStRate', '20'); const o = await read(); near('extremes', money(row(o, 'State tax')), money(row(o, 'Adjusted gross income')) * 0.2, 0.0101, 'typed 20%'); await ctx.set('seStRate', '0'); const z = await read(); ok('extremes', /not included/.test(row(z, 'State tax')), 'typed 0 leaves state out ' + row(z, 'State tax')); await ctx.set('seStRate', '20.01'); const b = await read(); ok('extremes', /20%/.test(b.hint), 'rate above 20 refused'); }
    { const t0 = Date.now(); for (let i = 0; i < 25; i++) await ctx.set('seIncome', String(1000000 + i)); ok('extremes', Date.now() - t0 < 15000, '25 recalculations took ' + (Date.now() - t0) + ' ms'); }
  }

  /* ======== 3. visual ======== */
  const VIS = 'JSON.stringify((function(){var box=function(e){var r=e.getBoundingClientRect();return {l:r.left,w:r.width,r:r.right,h:r.height,t:r.top}};return {flow:[].map.call(document.querySelectorAll("#seFlow .se-row"),function(e){return {v:+e.getAttribute("data-v"),k:e.className,track:box(e.querySelector(".se-track")),bar:box(e.querySelector(".se-track i")),cls:e.querySelector(".se-track i").className}}),meter:box(document.querySelector("#seCap .se-meter")),segs:[].map.call(document.querySelectorAll("#seCap .se-meter i"),function(i){return {c:i.className,v:+i.getAttribute("data-v"),b:box(i)}}),line:box(document.querySelector("#seCap .se-meter b")),lab:box(document.querySelector("#seCap .se-mlab span")),leg:document.querySelectorAll("#seCap .se-leg li").length,mini:[].map.call(document.querySelectorAll("#seTab tbody tr"),function(r){var i=r.querySelector(".se-mini i");return {share:r.lastChild.textContent,w:box(i).w,full:box(i.parentNode).w}}),fonts:[].map.call(document.querySelectorAll("#seBody *"),function(e){return [].some.call(e.childNodes,function(n){return n.nodeType===3&&n.textContent.trim()})&&e.getClientRects().length?parseFloat(getComputedStyle(e).fontSize):99}),next:[].map.call(document.querySelectorAll("#seQtr tbody tr"),function(r){return [r.className,getComputedStyle(r.cells[1]).backgroundColor]}),over:[].some.call(document.querySelectorAll("#seBody table,#seBody .se-row,#seBody .se-meter"),function(e){var c=e.closest(".card").getBoundingClientRect();return e.getBoundingClientRect().right>c.right+1})}})())';
  const states = [
    { seIncome: 92000, seExpenses: 12000 },
    { seIncome: 140000, seExpenses: 12000, seWages: 150000, seKids: 3, seState: 'MD' },
    { seIncome: 300000, seWages: 250000, seState: 'PA' },
    { seIncome: 5000, seExpenses: 9000, seWages: 30000 }
  ];
  for (const s of states) {
    await go(s); const v = JSON.parse(await ctx.eval(VIS));
    let run = 0, lo = 0, hi = 0; const spans = [];
    v.flow.slice(0, -1).forEach((f) => { const a = run; run += f.v; spans.push([a, run]); lo = Math.min(lo, run); hi = Math.max(hi, run, a); });
    spans.push([0, v.flow[v.flow.length - 1].v]); lo = Math.min(lo, spans[spans.length - 1][1]);
    const span = hi - lo || 1;
    v.flow.forEach((f, i) => { const a = Math.min(spans[i][0], spans[i][1]), b = Math.max(spans[i][0], spans[i][1]); near('visual', f.bar.l - f.track.l, (a - lo) / span * f.track.w, 1.2, 'waterfall start row ' + i); near('visual', f.bar.w, Math.max(2, (b - a) / span * f.track.w), 1.2, 'waterfall width row ' + i); });
    near('visual', run, v.flow[v.flow.length - 1].v, 0.05, 'waterfall ends at what you keep');
    const w2 = s.seWages || 0, miles = 0; void miles;
    const dom = v.meter.w / ((v.line.r - v.meter.l) / 184500);
    ok('visual', v.segs.every((g) => g.v > 0) && v.leg === v.segs.length, 'meter legend count ' + v.leg + ' vs ' + v.segs.length);
    v.segs.forEach((g) => near('visual', g.b.w, g.v / dom * v.meter.w, 1.5, 'meter segment ' + g.c));
    ok('visual', dom >= 184500 * 1.14, 'meter domain ' + dom);
    if (w2 > 0) near('visual', v.segs[0].b.l - v.meter.l, 0, 1, 'wages start the meter');
    near('visual', v.lab.r, v.line.r, 3, 'limit label sits at the line'); ok('visual', v.lab.l >= v.meter.l - 1, 'limit label inside the card');
    v.mini.forEach((q, i) => { const pc = parseFloat(q.share.replace('−', '-')); near('visual', q.w, Math.max(0, Math.min(100, pc * 2)) / 100 * q.full, 1.5, 'share bar row ' + i); });
    ok('visual', Math.min.apply(null, v.fonts) >= 12, 'text under 12px: ' + Math.min.apply(null, v.fonts));
    ok('visual', v.next[3][0] === 'cc-flag' && v.next[3][1] !== v.next[0][1], 'the next due date is highlighted ' + JSON.stringify(v.next));
    ok('visual', !v.over, 'a result block pokes out of its card');
  }
  for (const [mode, income, target] of [['tax', true, false], ['need', false, true]]) {
    await ctx.seg('seMode', mode);
    const q = JSON.parse(await ctx.eval('JSON.stringify({on:[].map.call(document.querySelectorAll("#seMode button.on"),function(b){return b.getAttribute("data-v")}),i:!!document.getElementById("seIncome").offsetParent,t:!!document.getElementById("seTarget").offsetParent})'));
    ok('visual', q.on.join() === mode && q.i === income && q.t === target, 'mode ' + mode + ' shows its own fields ' + JSON.stringify(q));
  }
  await ctx.eval('delete CalcThis.seNow;1');
  return { fails, cats, runs };
};
