/* ORACLE for realtor-commission-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.realtorEngine / commissionEngine / salesEngine). Pairs of home price / rate / commission are typed
   through the real inputs and the shown values, the "what you keep" table, the agents' table, the rate ladder, the bar and every note are rebuilt here. Also QA item 19 (every field reacts, prerequisite-empty
   cases), refusals, swaps, currencies, Clear fields. */
module.exports = async function (ctx) {
  let s = 20261112; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, fuzzy = 0, cmp = 0, skipped = 0;
  const MINUS = '−';
  const rd = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const money = (x, sym, dec) => { if (x == null) return '—'; dec = dec == null ? 2 : dec; if (Math.abs(x) < Math.pow(10, -dec) / 2) x = 0; return (x < 0 ? MINUS : '') + sym + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  const pcn = (x) => { const r = rd(x, 2); return (r < 0 ? MINUS : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: 2 }); };
  const pct = (x) => x == null ? '—' : pcn(x) + '%';
  const plain = (x, dec) => { const r = rd(x, dec); return (r < 0 ? '-' : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: dec }); };
  const fm = (x) => money(x, '$');
  const same = (got, exp, tag) => {
    cmp++; if (got === exp) return true;
    const num = /-?\d[\d,]*\.?\d*/g, sk = (t) => t.replace(num, '#'), nu = (t) => (t.match(num) || []).map((x) => parseFloat(x.replace(/,/g, '')));
    if (sk(got) === sk(exp)) { const a = nu(got), b = nu(exp); if (a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 0.0101 * (Math.abs(b[i]) > 1e6 ? Math.abs(b[i]) / 1e6 : 1))) { fuzzy++; return true; } }
    fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false;
  };
  const orList = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1];
  const NM = { sales: 'home price', rate: 'commission rate', comm: 'commission' }, ID = { sales: 'rtPrice', rate: 'rtRate', comm: 'rtComm' }, K = ['sales', 'rate', 'comm'];
  const PRE = 'Type your home price and commission above first — then this applies.';
  const RATES = [1, 2, 3, 4, 5, 6, 7];

  /* the maths, written out plainly */
  function model(sp) {
    const P = sp.P, r = sp.rate, C = P * r / 100, f = sp.who === 'seller' ? 1 : (sp.who === 'buyer' ? 0 : (sp.sp == null ? 50 : sp.sp) / 100);
    const Cs = C * f, Cb = C - Cs, Cc = P * sp.close / 100, net = P - Cs - Cc - sp.pay, M = { C, Cs, Cb, Cc, net, buyerTotal: P + Cb };
    M.sub = 'Price ' + fm(P) + ' · Rate ' + pct(r) + ' · You keep ' + fm(net);
    M.tip = 'A ' + pcn(r) + '% commission on a ' + fm(P) + ' home is ' + fm(C) + '.' + (sp.who === 'seller' ? ' You pay it out of the sale.' : (sp.who === 'buyer' ? ' The buyer pays it on top of the price: ' + fm(P + C) + ' in total.' : ' You pay ' + fm(Cs) + ' of it and the buyer pays ' + fm(Cb) + '.')) + (net < 0 ? ' The costs and the mortgage payoff are more than the price: you would need ' + fm(-net) + ' more to close.' : '');
    M.barsVis = P > 0 && net >= 0; M.bars = ''; if (M.barsVis) [['You keep', net], ['Commission you pay', Cs], ['Closing costs', Cc], ['Mortgage payoff', sp.pay]].forEach((p) => { if (p[1] > 0) M.bars += p[0] + ' ' + pct(p[1] / P * 100); });
    const st = [['Home price', fm(P)], ['Commission you pay', MINUS + fm(Cs)]]; if (sp.close > 0) st.push(['Closing costs ' + pcn(sp.close) + '%', MINUS + fm(Cc)]); if (sp.pay > 0) st.push(['Mortgage payoff', MINUS + fm(sp.pay)]); st.push(['You keep', fm(net)]); if (Cb > 0) st.push(['Buyer pays in total', fm(M.buyerTotal)]);
    M.step = st.map((x) => x.join('|'));
    M.ag = []; if (sp.ls != null) { const l1 = C * sp.ls / 100, l2 = C - l1; M.ag = [['Listing agent (' + pcn(sp.ls) + '%)', fm(l1)].concat(sp.bk != null ? [fm(l1 * sp.bk / 100)] : []).join('|'), ['Buyer’s agent (' + pcn(100 - sp.ls) + '%)', fm(l2)].concat(sp.bk != null ? [fm(l2 * sp.bk / 100)] : []).join('|')]; M.agHead = 'Commission' + (sp.bk != null ? 'After brokerage split' : ''); }
    M.lad = RATES.map((x) => { const Cx = P * x / 100, Csx = Cx * f; return [x + '%', fm(Cx), fm(P - Csx - Cc - sp.pay)].join('|'); });
    return M;
  }
  const notes = (sp, M) => {
    const n = {}, t = sp.typed || {};
    n.who = sp.who === 'seller' ? 'The seller pays: ' + fm(M.C) + ' comes out of the sale, so the buyer pays ' + fm(sp.P) + ' in total.' : (sp.who === 'buyer' ? 'The buyer pays: ' + fm(M.C) + ' is added on top, so the buyer pays ' + fm(sp.P + M.C) + ' in total.' : 'Shared: the seller pays ' + fm(M.Cs) + ' and the buyer pays ' + fm(M.Cb) + ', so the buyer pays ' + fm(M.buyerTotal) + ' in total.');
    n.sp = !t.sp ? 'Type the seller’s share of the commission as a percent. Blank means half each.' : 'The seller pays ' + fm(M.Cs) + ' and the buyer pays ' + fm(M.Cb) + '.';
    n.list = sp.ls == null ? 'The listing agent’s share of the commission, as a percent — the buyer’s agent gets the rest.' : 'The listing agent gets ' + fm(M.C * sp.ls / 100) + ' and the buyer’s agent ' + fm(M.C - M.C * sp.ls / 100) + '.';
    n.brok = sp.bk == null ? 'What an agent keeps of their commission after the brokerage split, as a percent.' : (sp.ls != null ? 'The listing agent keeps ' + fm(M.C * sp.ls / 100 * sp.bk / 100) + ' and the buyer’s agent ' + fm((M.C - M.C * sp.ls / 100) * sp.bk / 100) + ' after the brokerage split.' : 'An agent keeps ' + fm(M.C * sp.bk / 100) + ' of the whole ' + fm(M.C) + ' commission after the brokerage split.');
    n.close = !t.close ? 'Other costs you pay when you sell, as a percent of the price. Blank means none.' : 'Closing costs of ' + pcn(sp.close) + '% are ' + fm(M.Cc) + '.';
    n.pay = !t.pay ? 'What you still owe on the mortgage — it is paid from the sale. Blank means none.' : 'The mortgage payoff of ' + fm(sp.pay) + ' comes out of the sale.';
    return n;
  };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};var v=function(i){return document.getElementById(i).value;};var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();}).join("|");});};var heads=function(i){return [].map.call(document.querySelectorAll("#"+i+" thead th"),function(c){return c.textContent;}).join("");};' +
    'var hh=document.getElementById("rtHint"),pp=hh.previousElementSibling,under="";if(pp){under=pp.querySelector&&pp.querySelector("input")&&pp.classList.contains("fld")?pp.querySelector("input").id:(pp.id||"");}' +
    'return {box:{sales:v("rtPrice"),rate:v("rtRate"),comm:v("rtComm")},big:g("rtBig"),lab:g("rtLab"),sub:g("rtSub"),tip:g("rtTip"),from:g("rtFrom"),fromVis:vis("rtFrom"),body:vis("rtBody"),hint:vis("rtHint")?g("rtHint"):"",under:under,bars:g("rtBars"),barsVis:vis("rtBarsWrap"),step:rows("rtStep"),ag:rows("rtAg"),agHead:heads("rtAg"),agVis:vis("rtAgWrap"),lad:rows("rtLad"),ladHead:heads("rtLad"),ladVis:vis("rtLadWrap"),on:[].map.call(document.querySelectorAll("#rtLad tr.on"),function(r){return r.children[0].textContent;}),' +
    'n:{who:g("rtWhoNote"),sp:g("rtSpNote"),list:g("rtListNote"),brok:g("rtBrokNote"),close:g("rtCloseNote"),pay:g("rtPayNote")},calc:[].map.call(document.querySelectorAll(".fld.cm-calc"),function(f){return f.querySelector("input").id;}),mlab:g("rtMLab"),mval:g("rtMVal"),u:["rtPrice","rtRate","rtComm"].map(function(i){return document.getElementById(i).closest(".fld").querySelector(".unit").textContent;}),spVis:vis("rtSharedFld")};})())'));
  const advOpen = async (want) => { const o = (await ctx.eval('document.getElementById("rtAdvIn").style.display')) !== 'none'; if (o !== want) await ctx.click('rtAdvBtn'); };
  const clear = async () => { await ctx.fill(); for (const k of K) await ctx.set(ID[k], ''); };
  const typeVal = async (k, x) => ctx.set(ID[k], String(x));
  const PAIRS = [['sales', 'rate'], ['sales', 'comm'], ['rate', 'comm'], ['comm', 'sales'], ['rate', 'sales'], ['comm', 'rate']];

  /* ---- 1. random pairs, who pays, shares, closing costs, payoff ---- */
  for (let i = 0; i < 260; i++) {
    const P = pick([150000, 275000, 300000, 420000, 650000, 1200000]) + 1000 * Math.floor(R() * 30), r = pick([1, 2, 2.5, 3, 4, 5, 5.5, 6, 7]), C = rd(P * r / 100, 2);
    if (Math.abs(C - P * r / 100) > 1e-9) { skipped++; continue; }
    const who = pick(['seller', 'seller', 'buyer', 'shared']), spv = R() < 0.5 ? pick([25, 40, 50, 75]) : null, ls = R() < 0.5 ? pick([40, 50, 60]) : null, bk = R() < 0.5 ? pick([60, 70, 80, 100]) : null, close = R() < 0.5 ? pick([1, 2, 3.5]) : 0, pay = R() < 0.5 ? pick([50000, 150000, 400000, 2000000]) : 0;
    const typed = { sp: who === 'shared' && spv != null, close: close > 0, pay: pay > 0 }, sp = { P, rate: r, who, sp: who === 'shared' ? spv : null, ls, bk, close, pay, typed }, M = model(sp), pair = pick(PAIRS), base = { sales: P, rate: r, comm: C };
    await clear(); await advOpen(true); await ctx.seg('rtWho', who); if (who === 'shared' && spv != null) await ctx.set('rtSp', String(spv)); if (ls != null) await ctx.set('rtList', String(ls)); if (bk != null) await ctx.set('rtBrok', String(bk)); if (close) await ctx.set('rtClose', String(close)); if (pay) await ctx.set('rtPay', String(pay));
    for (const k of pair) await typeVal(k, base[k]);
    runs++; const d = await read(), tag = JSON.stringify({ pair, base, who, spv, ls, bk, close, pay });
    if (!d.body) { fails.push('no result ' + tag + ' hint ' + d.hint); continue; }
    same(d.big, fm(M.C), 'headline ' + tag); same(d.lab, 'Commission', 'label ' + tag); same(d.sub, M.sub, 'sub ' + tag); same(d.tip, M.tip, 'sentence ' + tag); same(d.mval, fm(M.C), 'floating bar ' + tag);
    same(d.from, 'From ' + NM[pair[0]] + ' and ' + NM[pair[1]] + '.', 'from ' + tag);
    K.forEach((k) => same(d.box[k], pair.indexOf(k) >= 0 ? String(base[k]) : plain(base[k], 2), 'box ' + k + ' ' + tag));
    const calcExp = K.filter((k) => pair.indexOf(k) < 0).map((k) => ID[k]).sort().join(','); if (d.calc.slice().sort().join(',') !== calcExp) fails.push('calculated marks ' + d.calc + ' expected ' + calcExp + ' ' + tag);
    if (d.barsVis !== M.barsVis) fails.push('bars visible ' + d.barsVis + ' expected ' + M.barsVis + ' ' + tag); else if (M.barsVis) same(d.bars.replace(/ /g, ''), M.bars.replace(/ /g, ''), 'bar key ' + tag);
    if (d.step.length !== M.step.length) fails.push('step rows ' + JSON.stringify(d.step) + ' vs ' + JSON.stringify(M.step) + ' ' + tag); else M.step.forEach((x, q) => same(d.step[q], x, 'step row ' + q + ' ' + tag));
    if (M.ag.length) { if (!d.agVis) fails.push('agents table hidden ' + tag); else { if (d.agHead !== M.agHead) fails.push('agents head ' + d.agHead + ' vs ' + M.agHead + ' ' + tag); M.ag.forEach((x, q) => same(d.ag[q], x, 'agent row ' + q + ' ' + tag)); } } else if (d.agVis) fails.push('agents table shown without a listing share ' + tag);
    if (!d.ladVis) fails.push('ladder hidden ' + tag); else { if (d.ladHead !== 'Commission rateCommissionYou keep') fails.push('ladder head ' + d.ladHead); M.lad.forEach((x, q) => same(d.lad[q], x, 'ladder row ' + q + ' ' + tag)); if (pair.indexOf('rate') >= 0 && RATES.indexOf(r) >= 0 && d.on.join() !== r + '%') fails.push('ladder highlight ' + d.on + ' expected ' + r + '% ' + tag); }
    const n = notes(sp, M); same(d.n.who, n.who, 'who note ' + tag); same(d.n.list, n.list, 'list note ' + tag); same(d.n.brok, n.brok, 'brok note ' + tag); same(d.n.close, n.close, 'close note ' + tag); same(d.n.pay, n.pay, 'pay note ' + tag); if (who === 'shared') same(d.n.sp, n.sp, 'sp note ' + tag);
    if (d.spVis !== (who === 'shared')) fails.push('seller share field visible ' + d.spVis + ' for ' + who);
    if (d.hint) fails.push('unexpected hint [' + d.hint + '] ' + tag);
  }

  /* ---- 2. ladder click sets the rate; third value; lone states; Clear fields ---- */
  for (let i = 0; i < 10; i++) {
    const P = pick([200000, 450000]), g = pick(RATES); await clear(); await typeVal('sales', P); await typeVal('rate', 3); await ctx.eval('document.querySelectorAll("#rtLad tbody tr")[' + RATES.indexOf(g) + '].click()'); const d2 = await read(); runs++;
    same(d2.box.rate, String(g), 'ladder click sets the rate'); same(d2.from, 'From home price and commission rate.', 'ladder click from-line'); same(d2.box.comm, plain(P * g / 100, 2), 'ladder click commission'); if (d2.on.join() !== g + '%') fails.push('ladder highlight ' + d2.on);
  }
  for (let i = 0; i < 30; i++) {
    const P = pick([250000, 500000]), r = pick([3, 5, 6]), base = { sales: P, rate: r, comm: P * r / 100 };
    const trio = pick([['sales', 'rate', 'comm'], ['rate', 'comm', 'sales'], ['comm', 'sales', 'rate'], ['sales', 'comm', 'rate'], ['rate', 'sales', 'comm'], ['comm', 'rate', 'sales']]); await clear(); await advOpen(false);
    for (const k of trio) await typeVal(k, base[k]); runs++;
    const pinned = trio[2] !== 'sales' && trio.indexOf('sales') >= 0 && trio.indexOf('sales') < 2, gone = pinned ? (trio[0] === 'sales' ? trio[1] : trio[0]) : trio[0], keep = trio.filter((x) => x !== gone), d3 = await read(), tag = JSON.stringify(trio);
    same(d3.from, 'From ' + NM[keep[0]] + ' and ' + NM[keep[1]] + '. ' + (pinned ? 'The home price stays, so ' : 'A third value replaces the oldest, so ') + NM[gone] + ' is now worked out.', 'third-value from-line ' + tag); same(d3.box[gone], plain(base[gone], 2), 'replaced box is now computed ' + tag);
  }
  await clear(); let d = await read(); if (d.body || d.big !== '—' || d.fromVis || d.hint) fails.push('start state not blank'); same(d.sub, 'Type any two of home price, commission rate and commission.', 'empty sub-line');
  for (const k of K) { await clear(); await typeVal(k, 3); d = await read(); runs++; if (d.body || d.big !== '—') fails.push('lone ' + k + ' shows a result'); const rest = orList(K.filter((x) => x !== k).map((x) => NM[x])); same(d.sub, 'Type one more value: ' + rest + '.', 'lone ' + k + ' sub'); same(d.from, 'You typed ' + NM[k] + '. Type one more: ' + rest + '.', 'lone ' + k + ' from-line'); }
  await clear(); await advOpen(true); await typeVal('sales', 300000); await typeVal('rate', 6); await ctx.seg('rtWho', 'shared'); await ctx.set('rtSp', '40'); await ctx.set('rtList', '50'); await ctx.set('rtBrok', '70'); await ctx.set('rtClose', '2'); await ctx.set('rtPay', '1000'); await ctx.click('rtClear'); d = await read(); runs++;
  if (d.body || d.big !== '—' || d.hint || K.some((k) => d.box[k] !== '')) fails.push('Clear fields left something'); if ((await ctx.eval('["rtSp","rtList","rtBrok","rtClose","rtPay"].map(function(i){return document.getElementById(i).value;}).join("")')) !== '') fails.push('Clear fields left the advanced fields');
  await clear(); await advOpen(true); await typeVal('sales', 300000); await typeVal('rate', 6); await ctx.seg('rtWho', 'buyer'); await ctx.set('rtClose', '2'); await advOpen(false); d = await read(); runs++;
  if ((await ctx.eval('document.getElementById("rtClose").value')) !== '') fails.push('Go simple did not clear the extras'); same(d.tip, 'A 6% commission on a $300,000.00 home is $18,000.00. You pay it out of the sale.', 'Go simple resets who pays to the seller');

  /* ---- 3. refusals and junk ---- */
  const ign = (t) => /ignored for now/.test(t);
  const refuse = async (id, v, expect, label, body) => { await clear(); await typeVal('sales', 300000); await typeVal('rate', 6); await ctx.set(id, v); const dd = await read(); runs++; if (!dd.hint || dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push(label + ': hint [' + dd.hint + '] expected to contain [' + expect + '] and "ignored for now"'); if (dd.under !== id) fails.push(label + ': hint sits under ' + dd.under + ' not ' + id); if (body && !dd.body) fails.push(label + ' hid the result'); };
  await refuse('rtRate', '150', 'Commission rate should be a percent from 0 to 100', 'rate 150'); await refuse('rtRate', '-5', 'Commission rate should be a percent from 0 to 100', 'rate -5'); await refuse('rtPrice', '-5', 'Home price can’t be negative', 'price -5');
  await refuse('rtComm', 'abc', 'Couldn’t read “abc” in Commission — type a number like 18000.', 'comm abc', true); await refuse('rtComm', '1e3', 'Couldn’t read “1e3” in Commission', 'comm 1e3', true); await refuse('rtPrice', '99999999999999', 'Home price is too large', 'price huge');
  await clear(); await typeVal('sales', 300000); await typeVal('rate', 6); const before = await read(); for (const v of ['-', '.', '+', '-.']) { await ctx.set('rtRate', v); const dd = await read(); if (dd.big !== before.big || dd.hint) fails.push('partial "' + v + '" changed the result or showed a hint'); }
  const contra = async (typed, expect, label, where) => { await clear(); for (const x of typed) await typeVal(x[0], x[1]); const dd = await read(); runs++; if (dd.body) fails.push(label + ': shown as a result'); if (dd.hint.indexOf(expect) < 0) fails.push(label + ': hint [' + dd.hint + '] expected [' + expect + ']'); if (dd.under !== where) fails.push(label + ': hint under ' + dd.under + ' not ' + where); };
  await contra([['sales', 0], ['comm', 5]], 'With a home price of 0 the commission rate can’t be worked out', 'price 0 comm', 'rtPrice'); await contra([['sales', 100], ['comm', 200]], 'The commission can’t be more than the home price — lower it.', 'comm > price', 'rtComm'); await contra([['rate', 0], ['comm', 5]], 'A commission rate of 0% can’t show the home price — type the home price instead.', 'rate 0 comm', 'rtRate');
  for (const [id, v, expect] of [['rtSp', 'abc', 'Couldn’t read “abc” in Seller’s share — type a number like 50.'], ['rtSp', '101', 'Seller’s share should be a percent from 0 to 100.'], ['rtList', '-1', 'Listing agent’s share should be a percent from 0 to 100.'], ['rtBrok', '101', 'Agent’s split should be a percent from 0 to 100.'], ['rtClose', 'x', 'Couldn’t read “x” in Closing costs'], ['rtClose', '101', 'Closing costs should be a percent from 0 to 100.'], ['rtPay', '-5', 'Mortgage payoff can’t be negative'], ['rtPay', 'x', 'Couldn’t read “x” in Mortgage payoff']]) {
    await clear(); await advOpen(true); await ctx.seg('rtWho', 'shared'); await typeVal('sales', 300000); await typeVal('rate', 6); await ctx.set(id, v); const dd = await read(); runs++;
    if (!dd.body) fails.push('bad advanced value ' + id + '=' + v + ' hid the result'); if (dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push('advanced hint ' + id + '=' + v + ' [' + dd.hint + ']'); if (dd.under !== id) fails.push('advanced hint ' + id + ' sits under ' + dd.under); same(dd.big, '$18,000.00', 'headline with bad ' + id); await ctx.set(id, '');
  }
  /* costs above the price: the page says what is missing */
  await clear(); await advOpen(true); await typeVal('sales', 100000); await typeVal('rate', 6); await ctx.set('rtPay', '99000'); d = await read(); runs++; same(d.tip, 'A 6% commission on a $100,000.00 home is $6,000.00. You pay it out of the sale. The costs and the mortgage payoff are more than the price: you would need $5,000.00 more to close.', 'costs above the price'); if (d.barsVis) fails.push('bar shown when the costs are more than the price'); same(d.sub, 'Price $100,000.00 · Rate 6% · You keep −$5,000.00', 'negative net sub');
  await clear(); await typeVal('sales', 0); await typeVal('rate', 6); d = await read(); runs++; same(d.big, '$0.00', 'zero price headline'); if (d.barsVis || d.ladVis) fails.push('picture shown at a zero price');

  /* ---- 4. QA item 19: every field reacts, also with its prerequisite empty ---- */
  await clear(); await advOpen(true);
  for (const [id, key] of [['rtList', 'list'], ['rtBrok', 'brok'], ['rtClose', 'close'], ['rtPay', 'pay']]) { await ctx.set(id, '5'); d = await read(); same(d.n[key], PRE, key + ' without a price'); await ctx.set(id, ''); }
  d = await read(); same(d.n.who, 'Type your home price and commission above first — then who pays is shown.', 'who pays without a result'); same(d.n.list, 'The listing agent’s share of the commission, as a percent — the buyer’s agent gets the rest.', 'list note empty'); same(d.n.brok, 'What an agent keeps of their commission after the brokerage split, as a percent.', 'brok note empty');
  await ctx.seg('rtWho', 'shared'); await ctx.set('rtSp', '30'); d = await read(); same(d.n.sp, PRE, 'seller share without a result'); await ctx.set('rtSp', ''); d = await read(); same(d.n.sp, 'Type the seller’s share of the commission as a percent. Blank means half each.', 'seller share note empty'); await ctx.seg('rtWho', 'seller');

  /* ---- 5. currencies ---- */
  for (const [cur, sym, dec] of [['EUR', '€', 2], ['GBP', '£', 2], ['JPY', '¥', 0], ['USD', '$', 2], ['CHF', 'CHF', 2], ['INR', '₹', 2], ['SEK', 'kr', 2], ['ILS', '₪', 2]]) {
    await clear(); await ctx.set('rtCur', cur); await typeVal('sales', 301234.5); await typeVal('rate', 3); d = await read(); runs++;
    const f = 301234.5 * 3 / 100, fmc = (x) => { let r = money(x, sym, dec); if (['EUR', 'SEK', 'ILS'].includes(cur)) r = r.replace(sym, '') + sym; return cur === 'CHF' ? r.replace('CHF', 'CHF ') : r; };
    const bigT = d.big.replace(/[\s  ]/g, ''), exp = fmc(f).replace(/[\s  ]/g, ''); if (bigT !== exp) fails.push('currency ' + cur + ' headline [' + d.big + '] expected [' + fmc(f) + ']');
    if (d.box.comm !== plain(f, dec)) fails.push('currency ' + cur + ' computed commission box [' + d.box.comm + '] expected [' + plain(f, dec) + ']'); if (d.u[0].indexOf(sym) !== 0) fails.push('currency ' + cur + ' label unit [' + d.u[0] + '] should start with ' + sym);
  }
  await ctx.set('rtCur', 'USD'); await clear(); await typeVal('sales', 300000); await typeVal('rate', 6); d = await read(); runs++; same(d.u.join('|'), '$ · what it sells for|% · of the price|$ · calculated', 'unit labels');
  return { runs, fails: fails.slice(0, 25), note: 'fuzzy ties ' + fuzzy + ' of ' + cmp + ' comparisons; skipped ' + skipped };
};
