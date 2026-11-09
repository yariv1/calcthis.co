/* ORACLE for unit-price-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.unitPriceEngine). Every unit is typed here in SI units (kg, litre, metre,
   square metre, day) from the exact definitions; prices, per-unit prices, ranking, percent differences, whole packs and leftovers are rebuilt here and compared with what the page
   DISPLAYS (row notes, headline, bars, plan table, unit table), over 6 measure types, random units, counts, sale / coupon / tax, servings and needs. Also QA item 19 (every field
   reacts, prerequisite-empty cases) and the refusal texts. */
module.exports = async function (ctx) {
  let s = 20261109; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, fuzzy = 0, cmp = 0;
  const T = {
    weight: { row: { g: 0.001, kg: 1, oz: 0.028349523125, lb: 0.45359237 }, per: { oz: 0.028349523125, lb: 0.45359237, g100: 0.1, kg: 1 }, map: { g: 'g100', kg: 'kg', oz: 'oz', lb: 'lb' }, rd: 'oz', pd: 'oz' },
    volume: { row: { ml: 0.001, L: 1, floz: 0.0295735295625, cup: 0.2365882365, pint: 0.473176473, quart: 0.946352946, gal: 3.785411784 }, per: { floz: 0.0295735295625, ml100: 0.1, L: 1, gal: 3.785411784 }, map: { ml: 'ml100', L: 'L', floz: 'floz', cup: 'floz', pint: 'floz', quart: 'L', gal: 'gal' }, rd: 'floz' },
    count: { row: { item: 1, dozen: 12 }, per: { item: 1, dozen: 12, item100: 100 }, map: { item: 'item', dozen: 'dozen' }, rd: 'item' },
    length: { row: { cm: 0.01, m: 1, 'in': 0.0254, ft: 0.3048, yd: 0.9144 }, per: { ft: 0.3048, m: 1, yd: 0.9144, ft100: 30.48 }, map: { cm: 'm', m: 'm', 'in': 'ft', ft: 'ft', yd: 'yd' }, rd: 'ft' },
    area: { row: { sqcm: 1e-4, sqm: 1, sqin: 0.0254 * 0.0254, sqft: 0.3048 * 0.3048, sqyd: 0.9144 * 0.9144 }, per: { sqft: 0.3048 * 0.3048, sqm: 1, sqyd: 0.9144 * 0.9144 }, map: { sqcm: 'sqm', sqm: 'sqm', sqin: 'sqft', sqft: 'sqft', sqyd: 'sqyd' }, rd: 'sqft' },
    time: { row: { min: 1 / 1440, hour: 1 / 24, day: 1, week: 7, month: 365 / 12, year: 365 }, per: { hour: 1 / 24, day: 1, week: 7, month: 365 / 12, year: 365 }, map: { min: 'hour', hour: 'hour', day: 'day', week: 'week', month: 'month', year: 'year' }, rd: 'month' }
  };
  const RL = { g: 'g', kg: 'kg', oz: 'oz', lb: 'lb', ml: 'ml', L: 'L', floz: 'fl oz', cup: 'cup', pint: 'pint', quart: 'quart', gal: 'gallon', item: 'items', dozen: 'dozen', cm: 'cm', m: 'm', 'in': 'in', ft: 'ft', yd: 'yd', sqcm: 'sq cm', sqm: 'sq m', sqin: 'sq in', sqft: 'sq ft', sqyd: 'sq yd', min: 'minute', hour: 'hour', day: 'day', week: 'week', month: 'month', year: 'year' };
  const PL = { oz: 'oz', lb: 'lb', g100: '100 g', kg: 'kg', floz: 'fl oz', ml100: '100 ml', L: 'L', gal: 'gallon', item: 'item', dozen: 'dozen', item100: '100 items', ft: 'ft', m: 'm', yd: 'yd', ft100: '100 ft', sqft: 'sq ft', sqm: 'sq m', sqyd: 'sq yd', hour: 'hour', day: 'day', week: 'week', month: 'month', year: 'year' };
  const KINDS = Object.keys(T), LET = 'ABCDEFGHIJKLMNOPQRST';
  const rd = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const money = (x, d) => (x < 0 ? '−' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fm = (x) => money(x, 2);
  const fu = (x) => { const a = Math.abs(x); let d = 2; if (a < 100) d = a >= 1 ? 2 : a >= 0.1 ? 3 : 4; return money(x, d); };
  const pc = (x) => { const r = Math.round(x * 10) / 10; return (r < 0 ? '−' : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: 1 }); };
  const qn = (x) => (Math.round(x * 1000) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
  const same = (got, exp, tag) => {
    cmp++; if (got === exp) return true;
    const num = /-?\d[\d,]*\.?\d*/g, sk = (t) => t.replace(num, '#'), nu = (t) => (t.match(num) || []).map((x) => x.replace(/,/g, ''));
    if (sk(got) === sk(exp)) { const a = nu(got), b = nu(exp); if (a.length === b.length && a.every((v, i) => { const dec = (b[i].split('.')[1] || '').length; return Math.abs(parseFloat(v) - parseFloat(b[i])) <= 1.01 * Math.pow(10, -dec) + 1e-12; })) { fuzzy++; return true; } }
    fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false;
  };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var rows=[].map.call(document.querySelectorAll("#upRows .up-row"),function(r){var n=r.getAttribute("data-n");return {n:n,note:g("upRn"+n),title:r.querySelector(".up-t").textContent.trim()};});' +
    'var bars=[].map.call(document.querySelectorAll("#upBars .up-brow"),function(r){return [r.querySelector(".up-bn").textContent.replace(/\\s+/g," ").trim(),r.querySelector(".up-bp").textContent.trim(),r.querySelector(".up-bv").textContent.replace(/\\s+/g," ").trim()];});' +
    'var tr=function(id){return [].map.call(document.querySelectorAll("#"+id+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'return {rows:rows,bars:bars,plan:tr("upPlan"),units:tr("upUnits"),big:g("upBig"),lab:g("upLab"),sub:g("upSub"),tip:g("upTip"),body:vis("upBody"),hint:vis("upHint")?g("upHint"):"",needNote:g("upNeedNote"),planNote:g("upPlanNote"),per:document.getElementById("upPer").value,kindNote:g("upKindNote"),mval:g("upMVal"),mlab:g("upMLab"),plv:vis("upPlanWrap"),barv:vis("upBarsWrap")};})())'));
  const advOpen = async (want) => { const o = (await ctx.eval('document.getElementById("upAdvIn").style.display')) !== 'none'; if (o !== want) await ctx.click('upAdvBtn'); };
  const clear = async () => { await ctx.fill(); await ctx.set('upPrice1', ''); await ctx.set('upAmt1', ''); await ctx.set('upPrice2', ''); await ctx.set('upAmt2', ''); };

  /* ---- 1. random scenarios: 2-4 products, any measure ---- */
  for (let i = 0; i < 260; i++) {
    const kind = pick(KINDS), TK = T[kind], rowUnits = kind === 'count' ? ['item'] : Object.keys(TK.row), nrows = pick([2, 2, 3, 4]);
    await clear(); await advOpen(false);
    const adv = R() < 0.55; if (adv) await advOpen(true);
    await ctx.set('upKind', kind);
    const rows = [];
    for (let r = 1; r <= nrows; r++) {
      if (r > 2) await ctx.click('upAdd');
      const o = { n: r, name: R() < 0.4 ? pick(['Brand X', 'Store brand', 'Tom & Jerry', 'Big pack']) : '', price: rd(3 + R() * 57, 2), amt: pick([0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32, 48, 64, 100, 250, 330, 500, 750, 1000]), unit: pick(rowUnits) };
      if (kind !== 'count' && kind !== 'time' && R() < 0.35) o.cnt = pick([2, 3, 4, 6, 12, 24]);
      if (kind !== 'count' && kind !== 'time' && R() < 0.3) o.item = true;
      if (adv) { if (R() < 0.5) o.srv = pick([2, 4, 8, 10, 2.5, 30]); if (R() < 0.35) o.pct = pick([10, 20, 25]); if (R() < 0.3) o.off = pick([0.25, 0.5, 1]); if (R() < 0.3) o.tax = pick([5, 8.5, 20]); }
      rows.push(o);
      if (o.name) await ctx.set('upName' + r, o.name);
      await ctx.set('upUnit' + r, o.unit); await ctx.set('upPrice' + r, String(o.price)); await ctx.set('upAmt' + r, String(o.amt));
      if (o.cnt) await ctx.set('upCnt' + r, String(o.cnt));
      if (o.item) { await ctx.click('upBasisItem' + r); o.cnt = 0; }
      if (o.srv) await ctx.set('upSrv' + r, String(o.srv)); if (o.pct) await ctx.set('upPct' + r, String(o.pct)); if (o.off) await ctx.set('upOff' + r, String(o.off)); if (o.tax) await ctx.set('upTax' + r, String(o.tax));
    }
    let perK = TK.map[rows[0].unit];
    if (R() < 0.3) { perK = pick(Object.keys(TK.per)); await ctx.set('upPer', perK); }
    let need = null, needU = TK.rd;
    if (adv && R() < 0.6) { need = pick([1, 2, 5, 16, 32, 40, 100, 0.5]); if (R() < 0.4) { needU = pick(rowUnits); await ctx.set('upNeedU', needU); } await ctx.set('upNeed', String(need)); }
    const E = rows.map((o) => {
      const afterSale = o.price * (1 - (o.pct || 0) / 100) - (o.off || 0), eff = afterSale * (1 + (o.tax || 0) / 100), base = o.amt * TK.row[o.unit] * (o.cnt || 1);
      return { o, eff, base, ub: eff / base, name: o.name || 'Product ' + LET.charAt(o.n - 1) };
    });
    const D = await read(); runs++;
    const pf = TK.per[perK], pl = PL[perK], tag = '[' + kind + ' #' + i + ' ' + perK + '] ';
    if (D.per !== perK) fails.push(tag + 'per unit is ' + D.per + ', expected ' + perK);
    E.forEach((e, ix) => {
      const o = e.o, amtT = (o.cnt && o.cnt > 1 ? qn(o.cnt) + ' × ' : '') + qn(o.amt) + ' ' + RL[o.unit];
      const parts = [o.pct ? 'the sale' : '', o.off ? 'the coupon' : '', o.tax ? 'tax' : ''].filter(Boolean);
      const exp = e.name + ': ' + fm(o.price) + ' for ' + amtT + (parts.length ? ' (' + fm(e.eff) + ' after ' + parts.join(' and ') + ')' : '') + ' = ' + fu(e.ub * pf) + ' per ' + pl + (o.srv ? ' · ' + fu(e.eff / o.srv) + ' per serving' : '') + '.';
      same(D.rows[ix].note, exp, tag + 'row ' + o.n + ' note');
      if (D.rows[ix].title !== e.name) fails.push(tag + 'row title [' + D.rows[ix].title + '] expected [' + e.name + ']');
    });
    const sorted = E.slice().sort((a, b) => a.ub - b.ub), best = sorted[0], worst = sorted[sorted.length - 1];
    if (!D.body) { fails.push(tag + 'no result'); continue; }
    same(D.big, best.name, tag + 'headline');
    const cheap = (1 - best.ub / worst.ub) * 100;
    same(D.sub, fu(best.ub * pf) + ' per ' + pl + ' · ' + pc(cheap) + '% cheaper than ' + (nrows === 2 ? worst.name : 'the most expensive') + ' (' + fu(worst.ub * pf) + ')', tag + 'sub');
    same(D.tip, best.name + ' is the best buy at ' + fu(best.ub * pf) + ' per ' + pl + ', ' + pc(cheap) + '% cheaper than ' + worst.name + ' at ' + fu(worst.ub * pf) + ' per ' + pl + ' (' + worst.name + ' costs ' + pc((worst.ub / best.ub - 1) * 100) + '% more).', tag + 'tip');
    if (D.mval !== D.big) fails.push(tag + 'sticky bar shows ' + D.mval);
    if (D.bars.length !== nrows) fails.push(tag + 'bars ' + D.bars.length);
    else sorted.forEach((e, k) => {
      const isB = k === 0, b = D.bars[k];
      same(b[0], e.name + (isB ? ' Best buy' : ''), tag + 'bar ' + k + ' name'); same(b[1], fu(e.ub * pf) + ' per ' + pl, tag + 'bar ' + k + ' price');
      same(b[2], (isB ? 'Lowest price per ' + pl : pc((e.ub / best.ub - 1) * 100) + '% more than the best') + (e.o.srv ? ' · ' + fu(e.eff / e.o.srv) + ' per serving' : ''), tag + 'bar ' + k + ' text');
    });
    /* the same prices in every unit */
    const uk = Object.keys(TK.per);
    if (D.units.length !== uk.length) fails.push(tag + 'unit rows ' + D.units.length);
    else uk.forEach((k, ix) => { same(D.units[ix].join('|'), PL[k] + '|' + fu(best.ub * TK.per[k]) + '|' + fu(worst.ub * TK.per[k]), tag + 'unit row ' + k); });
    /* whole packs for the amount needed */
    if (need != null) {
      const nb = need * TK.row[needU], P = E.map((e, ix) => { const packs = Math.max(1, Math.ceil(nb / e.base - 1e-9)); return { e, ix, packs, pay: packs * e.eff, left: (packs * e.base - nb) / TK.row[needU] }; }).sort((a, b) => a.pay - b.pay || a.ix - b.ix);
      const bp = P[0].pay;
      if (!D.plv) fails.push(tag + 'plan table hidden'); else if (D.plan.length !== nrows) fails.push(tag + 'plan rows ' + D.plan.length);
      else P.forEach((p, k) => same(D.plan[k].join('|'), p.e.name + (Math.abs(p.pay - bp) < 1e-9 * Math.max(1, bp) && nrows > 1 ? ' Cheapest' : '') + '|' + qn(p.packs) + '|' + fm(p.pay) + '|' + qn(p.left) + ' ' + RL[needU], tag + 'plan row ' + k));
      same(D.needNote, 'For ' + qn(need) + ' ' + RL[needU] + ': ' + nrows + ' products compared, whole packs rounded up.', tag + 'need note');
    }
    if (D.hint) fails.push(tag + 'unexpected hint [' + D.hint + ']');
  }

  /* ---- 2. one product only: its unit price, a prompt for the second ---- */
  for (let i = 0; i < 12; i++) {
    await clear(); await ctx.set('upKind', 'weight'); await ctx.set('upUnit1', 'lb');
    const p = rd(2 + R() * 20, 2), a = pick([1, 2, 3, 5]); await ctx.set('upPrice1', String(p)); await ctx.set('upAmt1', String(a)); const D = await read(); runs++;
    same(D.lab, 'Price per lb', 'one: label'); same(D.big, fu(p / a), 'one: big'); same(D.sub, 'Product A: ' + fm(p) + ' for ' + qn(a) + ' lb. Add a second product to compare.', 'one: sub');
    if (D.barv) fails.push('one: bars shown for a single product');
  }

  /* ---- 3. QA item 19: every field reacts, with the prerequisite empty ---- */
  await clear(); await ctx.set('upKind', 'weight'); await ctx.set('upUnit1', 'oz');
  let D = await read();
  same(D.rows[0].note, 'Product A: Type the price of the pack and the size of one item to see its price per oz.', 'empty row note');
  await ctx.set('upName1', 'Rice'); D = await read(); same(D.rows[0].note, 'Rice: Type the price of the pack and the size of one item to see its price per oz.', 'name reacts');
  await ctx.set('upPrice1', '3.99'); D = await read(); same(D.rows[0].note, 'Rice: Type the size of one item to see its price per oz.', 'price alone');
  await ctx.set('upPrice1', ''); await ctx.set('upAmt1', '16'); D = await read(); same(D.rows[0].note, 'Rice: Type the price of the pack to see its price per oz.', 'amount alone');
  await ctx.set('upCnt1', '6'); D = await read(); same(D.rows[0].note, 'Rice: Type the price of the pack to see its price per oz. 6 items in the pack will multiply the amount.', 'count with price empty still says what is missing');
  await ctx.click('upBasisItem1'); D = await read(); same(D.rows[0].note, 'Rice: Type the price of one item to see its price per oz.', 'one item: price missing, items-in-pack ignored');
  await ctx.set('upPrice1', '2'); D = await read(); same(D.rows[0].note, 'Rice: $2.00 for 16 oz = $0.125 per oz.', 'one item: count ignored');
  await ctx.click('upBasisPack1'); D = await read(); same(D.rows[0].note, 'Rice: $2.00 for 6 × 16 oz = $0.0208 per oz.', 'back to whole pack: count used again'); await ctx.set('upPrice1', '');
  await advOpen(true); await ctx.set('upNeed', '32'); D = await read();
  same(D.needNote, 'Type a price and an amount for a product first — then the cost of 32 oz appears.', 'need without a ready product');
  await ctx.set('upNeed', ''); D = await read(); same(D.needNote, 'Type a product’s price and amount first, then how much you plan to buy.', 'need empty, no product');
  await ctx.set('upPrice1', '6'); D = await read(); same(D.needNote, 'Type how much you plan to buy and the cost of whole packs of each product appears below.', 'need empty, product ready');
  same(D.rows[0].note, 'Rice: $6.00 for 6 × 16 oz = $0.0625 per oz.', 'count multiplies the amount');
  /* refusals: row 1 refused, row 2 stays the result */
  await clear(); await ctx.set('upUnit1', 'oz'); await ctx.set('upUnit2', 'oz'); await ctx.set('upPrice2', '5'); await ctx.set('upAmt2', '10');
  const bad = [['upPrice1', 'abc', 'Couldn’t read “abc” in Product A: price — type a number like 3.99. It is ignored for now.'], ['upPrice1', '-4', 'Product A: price can’t be negative — type 0 or more. It is ignored for now.'], ['upPrice1', '0', 'Product A: price should be above 0 — a free pack has no price to compare. It is ignored for now.'], ['upPrice1', '5000000000000', 'Product A: price is too large — keep it under 1,000,000,000,000. It is ignored for now.']];
  for (const [id, v, msg] of bad) { await ctx.set('upPrice1', v); await ctx.set('upAmt1', '8'); D = await read(); runs++; if (!D.hint) fails.push('no hint for price ' + v); else same(D.hint, msg, 'refusal ' + v); if (!D.body) fails.push('result lost for bad price ' + v); }
  await ctx.set('upPrice1', '4'); await ctx.set('upAmt1', '0'); D = await read(); if (!D.hint || !/size of one item should be a number above 0/.test(D.hint)) fails.push('amount 0 hint: ' + D.hint);
  await ctx.set('upAmt1', '8'); await advOpen(true);
  await ctx.set('upPct1', '150'); D = await read(); if (!/the sale percent should be a percent from 0 to 100\. It is ignored for now\./.test(D.hint) || !D.body) fails.push('sale 150 hint: ' + D.hint);
  await ctx.set('upPct1', ''); await ctx.set('upOff1', '4'); D = await read(); if (!/take the whole price off — they are ignored for now\./.test(D.hint) || !D.body) fails.push('coupon too big hint: ' + D.hint);
  await ctx.set('upOff1', ''); await ctx.set('upCnt1', '2.5'); D = await read(); if (!/items in the pack should be a whole number, 1 or more\./.test(D.hint) || !D.body) fails.push('count 2.5 hint: ' + D.hint);
  await ctx.set('upCnt1', ''); await ctx.set('upNeed', '-3'); D = await read(); if (!/Amount to buy should be a number above 0/.test(D.hint) || !D.body) fails.push('need -3 hint: ' + D.hint);
  await ctx.set('upNeed', ''); await ctx.set('upSrv1', '0'); D = await read(); if (!/servings in the pack should be a number above 0/.test(D.hint) || !D.body) fails.push('servings 0 hint: ' + D.hint);
  await ctx.set('upSrv1', ''); await ctx.set('upTax1', '120'); D = await read(); if (!/the sales tax should be a percent from 0 to 100/.test(D.hint) || !D.body) fails.push('tax 120 hint: ' + D.hint);
  await ctx.set('upTax1', ''); D = await read(); if (D.hint) fails.push('hint stays after the bad value was cleared: ' + D.hint);
  /* ties and a currency */
  await clear(); await ctx.set('upUnit1', 'oz'); await ctx.set('upUnit2', 'lb'); await ctx.set('upPrice1', '1'); await ctx.set('upAmt1', '16'); await ctx.set('upPrice2', '1'); await ctx.set('upAmt2', '1'); D = await read();
  same(D.big, 'All the same', 'tie headline'); same(D.sub, 'Every product costs $0.0625 per oz.'.replace('$0.0625', fu(1 / 16)), 'tie sub'); runs++;
  await ctx.set('upCur', 'EUR'); await ctx.set('upPrice1', '3.99'); await ctx.set('upAmt1', '16'); await ctx.set('upPrice2', '5.49'); await ctx.set('upAmt2', '24'); await ctx.set('upUnit2', 'oz'); D = await read(); runs++;
  if (!/0,229|0\.229/.test(D.sub) || !/€/.test(D.sub)) fails.push('EUR display: ' + D.sub); else if (!/0\.229€|0\.229 €/.test(D.sub)) fails.push('EUR symbol side: ' + D.sub);
  await ctx.set('upCur', 'JPY'); await ctx.set('upPrice1', '399'); await ctx.set('upAmt1', '16'); await ctx.set('upPrice2', '549'); await ctx.set('upAmt2', '24'); D = await read(); runs++;
  if (!/¥24\.9/.test(D.sub + D.bars.join(' '))) fails.push('JPY unit price decimals: ' + D.sub + ' | ' + D.bars.join(' / '));
  await ctx.set('upCur', 'USD');
  /* switching the measure resets units and the per unit */
  await clear(); await ctx.set('upKind', 'volume'); D = await read(); same(D.per, 'floz', 'volume default per'); await ctx.set('upKind', 'time'); D = await read(); same(D.per, 'month', 'time default per');
  /* Clear fields leaves two empty products */
  await ctx.click('upClear'); D = await read(); if (D.rows.length !== 2 || D.body) fails.push('Clear fields: ' + D.rows.length + ' rows, body ' + D.body);
  /* the unit table row switches the page */
  await clear(); await ctx.set('upKind', 'weight'); await ctx.set('upUnit1', 'oz'); await ctx.set('upUnit2', 'oz'); await ctx.set('upPrice1', '3.99'); await ctx.set('upAmt1', '16'); await ctx.set('upPrice2', '5.49'); await ctx.set('upAmt2', '24');
  await ctx.eval('document.querySelector("#upUnits tr[data-v=kg]").click()'); D = await read(); same(D.per, 'kg', 'unit row click switches the unit'); runs++;
  await ctx.set('upUnit1', 'lb'); D = await read(); same(D.per, 'kg', 'a picked unit stays when a row unit changes');
  return { runs, fails: fails.concat(fuzzy > runs * 4 ? ['too many fuzzy comparisons: ' + fuzzy + ' of ' + cmp] : []) };
};
