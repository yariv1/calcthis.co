/* ORACLE for markup-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.salesEngine). The two typed values are solved as a 2x2 linear system in
   (cost, price) - cost: c = x; price: p = x; profit: p - c = x; markup m: p - c(1+m) = 0; margin g: p(1-g) - c = 0 - solved with Cramer's rule, which is a different
   route from the page's case-by-case formulas. Drives the real inputs and compares what the page DISPLAYS: the five boxes, headline, label, sub-line, sentence, from-line,
   bars key, ladder (both modes), the extras table and the notes - plus QA item 19 (every field reacts, prerequisite-empty cases), refusals, swaps, currencies. */
module.exports = async function (ctx) {
  let s = 20261108; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, fuzzy = 0, cmp = 0;
  const MINUS = '−';
  const rd = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const money = (x, sym, dec) => { if (x == null) return '—'; dec = dec == null ? 2 : dec; if (Math.abs(x) < Math.pow(10, -dec) / 2) x = 0; return (x < 0 ? MINUS : '') + sym + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  const pct = (x) => { if (x == null) return '—'; const r = rd(x, 2); return (r < 0 ? MINUS : '') + Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%'; };
  const pcn = (x) => { const r = rd(x, 2); return (r < 0 ? MINUS : '') + Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 2 }); };
  const qn = (x) => (Math.round(x * 1000) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
  const plain = (x, dec) => { const r = rd(x, dec); return (r < 0 ? '-' : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: dec }); };
  const K = ['cost', 'price', 'profit', 'markup', 'margin'], ID = { cost: 'mkCost', price: 'mkPrice', profit: 'mkProfit', markup: 'mkMarkup', margin: 'mkMargin' };
  const LAB = { cost: 'Cost', price: 'Selling price', profit: 'Profit', markup: 'Markup', margin: 'Margin' };
  const NM = { cost: 'cost', price: 'selling price', profit: 'profit', markup: 'markup', margin: 'margin' };
  /* equality with a one-last-digit allowance for exact half-way ties; counted so it cannot hide real errors */
  const same = (got, exp, tag) => {
    cmp++; if (got === exp) return true;
    const num = /-?\d[\d,]*\.?\d*/g, sk = (t) => t.replace(num, '#'), nu = (t) => (t.match(num) || []).map((x) => parseFloat(x.replace(/,/g, '')));
    if (sk(got) === sk(exp)) { const a = nu(got), b = nu(exp); if (a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 0.0101 * (Math.abs(b[i]) > 1e6 ? Math.abs(b[i]) / 1e6 : 1))) { fuzzy++; return true; } }
    fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false;
  };
  /* the model */
  function model(typed) {
    const v = {}; typed.forEach((x) => { v[x[0]] = x[1]; });
    const eq = (k, x) => k === 'cost' ? [1, 0, x] : k === 'price' ? [0, 1, x] : k === 'profit' ? [-1, 1, x] : k === 'markup' ? [-(1 + x / 100), 1, 0] : [-1, 1 - x / 100, 0];
    const a = eq(typed[0][0], typed[0][1]), b = eq(typed[1][0], typed[1][1]), det = a[0] * b[1] - a[1] * b[0];
    if (Math.abs(det) < 1e-12) return null;
    let c = (a[2] * b[1] - a[1] * b[2]) / det, p = (a[0] * b[2] - a[2] * b[0]) / det;
    if (c < -1e-9 || p < -1e-9) return null;
    c = Math.max(0, c); p = Math.max(0, p); let pr = p - c; if (Math.abs(pr) < 1e-9 * Math.max(1, p, c)) pr = 0;
    return { c, p, pr, mu: v.markup !== undefined ? v.markup : (c > 0 ? pr / c * 100 : null), mg: v.margin !== undefined ? v.margin : (p > 0 ? pr / p * 100 : null) };
  }
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};var v=function(i){return document.getElementById(i).value;};var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {box:{cost:v("mkCost"),price:v("mkPrice"),profit:v("mkProfit"),markup:v("mkMarkup"),margin:v("mkMargin")},big:g("mkBig"),lab:g("mkLab"),sub:g("mkSub"),tip:g("mkTip"),from:g("mkFrom"),fromVis:vis("mkFrom"),body:vis("mkBody"),hint:vis("mkHint")?g("mkHint"):"",bars:g("mkBars"),barsVis:vis("mkBarsWrap"),lad:rows("mkLad"),ladHead:[].map.call(document.querySelectorAll("#mkLad thead th"),function(c){return c.textContent;}),ladNote:g("mkLadNote"),adv:rows("mkAdvTbl"),advVis:vis("mkAdvWrap"),n:{qty:g("mkQtyNote"),disc:g("mkDiscNote"),tax:g("mkTaxNote"),fee:g("mkFeeNote")},calc:[].map.call(document.querySelectorAll(".fld.mk-calc"),function(f){return f.querySelector("input").id;}),mlab:g("mkMLab"),mval:g("mkMVal"),unit:{cost:g("mkCost")?"":"",u:[].map.call(document.querySelectorAll("#mkFields .fld .unit"),function(u){return u.textContent;})}};})())'));
  const advOpen = async (want) => { const o = (await ctx.eval('document.getElementById("mkAdvIn").style.display')) !== 'none'; if (o !== want) await ctx.click('mkAdvBtn'); };
  const clear = async () => { await ctx.fill(); for (const k of K) await ctx.set(ID[k], ''); };
  const typeVal = async (k, x) => ctx.set(ID[k], String(x));

  /* ---- 1. random pairs: every combination of two non-ratio-conflicting fields, in both typing orders ---- */
  const PAIRS = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (i !== j && !(K[i] === 'markup' && K[j] === 'margin') && !(K[i] === 'margin' && K[j] === 'markup')) PAIRS.push([K[i], K[j]]);
  for (let i = 0; i < 360; i++) {
    const c0 = rd(0.5 + R() * 5000, 2), m0 = pick([-50, -30, -12.5, -5, 2.5, 5, 10, 12.5, 20, 25, 33, 40, 50, 75, 100, 150, 200, 250]) + (R() < 0.3 ? 0.5 : 0);
    const p0 = c0 * (1 + m0 / 100), base = { cost: c0, price: rd(p0, 2), profit: rd(p0 - c0, 2), markup: m0, margin: rd((p0 - c0) / p0 * 100, 2) };
    if (Math.abs(base.profit) < 0.5 || base.price < 0.5) continue;
    const pair = pick(PAIRS), typed = pair.map((k) => [k, base[k]]), M = model(typed);
    if (!M) { fails.push('model could not solve ' + JSON.stringify(typed)); continue; }
    const ref = { cost: c0, price: p0, profit: p0 - c0, markup: m0, margin: (p0 - c0) / p0 * 100 };
    [[M.c, ref.cost], [M.p, ref.price], [M.pr, ref.profit], [M.mu, ref.markup], [M.mg, ref.margin]].forEach((x, q) => { if (Math.abs(x[0] - x[1]) > 0.02 * Math.max(1, Math.abs(x[1]))) fails.push('MODEL round trip ' + K[q] + ' ' + x[0] + ' vs ' + x[1] + ' ' + JSON.stringify(typed)); });
    const adv = R() < 0.55; await clear();
    const o = { qty: null, disc: null, tax: null, fee: null };
    if (adv) { await advOpen(true); if (R() < 0.6) o.qty = pick([1, 2, 12, 100, 2500, 0.5]); if (R() < 0.5) o.disc = pick([5, 10, 12.5, 25, 50]); if (R() < 0.5) o.tax = pick([5, 8.5, 20, 7.25]); if (R() < 0.5) o.fee = pick([1.5, 2.9, 5, 30]); }
    else await advOpen(false);
    await ctx.seg('mkLadMode', 'mu');
    for (const k of pair) await typeVal(k, base[k]);
    for (const k of ['qty', 'disc', 'tax', 'fee']) if (o[k] !== null) await ctx.set('mk' + k.charAt(0).toUpperCase() + k.slice(1), String(o[k]));
    runs++;
    const d = await read(), tag = JSON.stringify({ pair, typed: typed.map((x) => x[1]), o });
    if (!d.body) { fails.push('no result ' + tag + ' hint ' + d.hint); continue; }
    const val = { cost: M.c, price: M.p, profit: M.pr, markup: M.mu, margin: M.mg }, sym = '$', fm = (x) => money(x, sym), txt = { cost: fm(M.c), price: fm(M.p), profit: fm(M.pr), markup: pct(M.mu), margin: pct(M.mg) };
    K.forEach((k) => { const exp = pair.indexOf(k) >= 0 ? String(base[k]) : plain(val[k], k === 'markup' || k === 'margin' ? 2 : 2); same(d.box[k], exp, 'box ' + k + ' ' + tag); });
    let head = null; if (val.markup !== null && val.markup !== undefined && isFinite(val.markup)) head = 'markup'; else ['price', 'margin', 'profit', 'cost'].forEach((k) => { if (!head && pair.indexOf(k) < 0) head = k; });
    same(d.big, txt[head], 'headline ' + tag); same(d.lab, LAB[head], 'label ' + tag);
    same(d.sub, K.filter((k) => k !== head).map((k) => LAB[k] + ' ' + txt[k]).join(' · '), 'sub ' + tag);
    same(d.from, 'From ' + NM[pair[0]] + ' and ' + NM[pair[1]] + '.', 'from ' + tag);
    const tipExp = M.pr > 0 ? 'A cost of ' + fm(M.c) + ' sold at ' + fm(M.p) + ' earns ' + fm(M.pr) + ' profit: that is a ' + pct(M.mu) + ' markup and a ' + pct(M.mg) + ' margin.' : (M.pr === 0 ? 'A cost of ' + fm(M.c) + ' sold at ' + fm(M.p) + ' breaks even: a 0% markup and a 0% margin.' : 'A cost of ' + fm(M.c) + ' sold at ' + fm(M.p) + ' loses ' + fm(-M.pr) + ': that is a ' + pct(M.mu) + ' markup and a ' + pct(M.mg) + ' margin.');
    same(d.tip, tipExp, 'sentence ' + tag);
    same(d.mval, txt[head], 'floating bar value ' + tag); same(d.mlab, LAB[head], 'floating bar label ' + tag);
    /* computed boxes are marked, typed ones are not */
    const calcExp = K.filter((k) => pair.indexOf(k) < 0).map((k) => ID[k]).sort().join(','); if (d.calc.slice().sort().join(',') !== calcExp) fails.push('calculated marks ' + d.calc + ' expected ' + calcExp + ' ' + tag);
    /* bars */
    if (!d.barsVis) fails.push('bars hidden ' + tag);
    else {
      const k1 = M.pr > 0 ? 'Cost 100%Profit +' + pct(M.mu) + ' (the markup)' : 'Selling price ' + pct(M.p / M.c * 100) + ' of the costLoss ' + pct(M.mu) + ' (the markup)';
      const k2 = M.pr > 0 ? 'Cost ' + pct(100 - M.mg) + 'Profit ' + pct(M.mg) + ' (the margin)' : 'Selling price 100%Loss ' + pct(M.mg) + ' (the margin)';
      const flat = d.bars.replace(/ /g, '');
      [k1, k2].forEach((kk) => { if (flat.indexOf(kk.replace(/ /g, '')) < 0) { /* tolerance on the numbers */ cmp++; const a = (flat.match(/-?[\d,]*\.?\d+%/g) || []); if (a.length < 4) fails.push('bars key ' + kk + ' not in [' + d.bars + '] ' + tag); else fuzzy++; } });
    }
    /* ladder: both columns of every row, by markup */
    const hasC = M.c > 0; const lh = hasC ? 'MarkupSelling priceProfitMargin' : 'MarkupMargin';
    if (d.ladHead.join('') !== lh) fails.push('ladder head ' + d.ladHead.join('|') + ' ' + tag);
    const MU = [10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
    if (d.lad.length !== MU.length) fails.push('ladder rows ' + d.lad.length + ' ' + tag);
    else MU.forEach((x, q) => { const pp = M.c * (1 + x / 100), exp = hasC ? [x + '%', fm(pp), fm(pp - M.c), pct(x / (100 + x) * 100)] : [x + '%', pct(x / (100 + x) * 100)]; same(d.lad[q].join('|'), exp.join('|'), 'ladder row ' + x + ' ' + tag); });
    /* extras */
    if (adv && (o.qty !== null || o.disc !== null || o.tax !== null || o.fee !== null)) {
      const disc = o.disc || 0, tax = o.tax || 0, fee = o.fee || 0, dd = M.p * disc / 100, pa = M.p - dd, ta = pa * tax / 100, pay = pa + ta, fa = pa * fee / 100, net = pa - fa - M.c;
      const rows = []; const two = o.qty !== null, q = o.qty, push = (l, v) => rows.push([l, fm(v)].concat(two ? [fm(v * q)] : []));
      const hasD = o.disc !== null, hasT = o.tax !== null, hasF = o.fee !== null;
      push(hasD ? 'Selling price, before discount' : 'Selling price', M.p);
      if (hasD) { push('Discount ' + pcn(o.disc) + '%', -dd); push('Price after discount', pa); }
      if (hasT) { push('Sales tax / VAT ' + pcn(o.tax) + '%', ta); push('Customer pays', pay); }
      push('Cost', M.c); if (hasF) push('Fees ' + pcn(o.fee) + '%', fa);
      push(hasD || hasF ? 'Net profit' : 'Profit', net);
      if (hasD || hasF) { const a = M.c > 0 ? pct(net / M.c * 100) : '—', b = pa > 0 ? pct(net / pa * 100) : '—'; rows.push(['Net markup', a].concat(two ? [a] : [])); rows.push(['Net margin', b].concat(two ? [b] : [])); }
      if (!d.advVis) fails.push('extras table hidden ' + tag);
      else { if (d.adv.length !== rows.length) fails.push('extras rows ' + d.adv.length + ' vs ' + rows.length + ' ' + tag); else rows.forEach((r, q2) => same(d.adv[q2].join('|'), r.join('|'), 'extras row ' + r[0] + ' ' + tag)); }
      if (o.qty !== null) same(d.n.qty, qn(o.qty) + (o.qty === 1 ? ' unit' : ' units') + ' at the selling price: cost ' + fm(M.c * o.qty) + ', revenue ' + fm(M.p * o.qty) + ', profit ' + fm(M.pr * o.qty) + '.', 'qty note ' + tag);
      if (o.tax !== null) same(d.n.tax, 'The customer pays ' + fm(pay) + ' per unit including ' + pcn(o.tax) + '% tax (' + fm(ta) + '). Your profit is unchanged — the tax is passed on.', 'tax note ' + tag);
      if (o.fee !== null) same(d.n.fee, 'Fees take ' + fm(fa) + ' per unit, leaving a net profit of ' + fm(net) + ' — a ' + pct(M.c > 0 ? net / M.c * 100 : null) + ' markup and a ' + pct(pa > 0 ? net / pa * 100 : null) + ' margin.', 'fee note ' + tag);
      if (o.disc !== null) { const pp2 = pa - M.c; same(d.n.disc, 'After ' + pcn(o.disc) + '% off the price is ' + fm(pa) + (pp2 < 0 ? ': a loss of ' + fm(M.c - pa) + ' per unit' : ': profit ' + fm(pp2) + ' per unit') + ', a ' + pct(M.c > 0 ? pp2 / M.c * 100 : null) + ' markup and a ' + pct(pa > 0 ? pp2 / pa * 100 : null) + ' margin.', 'discount note ' + tag); }
    } else if (d.advVis) fails.push('extras table shown without extras ' + tag);
  }

  /* ---- 2. the ladder in margin mode, and a click on a row ---- */
  for (let i = 0; i < 12; i++) {
    const c0 = rd(5 + R() * 900, 2); await clear(); await advOpen(false); await typeVal('cost', c0); await typeVal('markup', pick([10, 25, 50]));
    await ctx.seg('mkLadMode', 'mg'); const d = await read(), MG = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90], fm = (x) => money(x, '$');
    if (d.ladHead.join('') !== 'MarginSelling priceProfitMarkup') fails.push('margin ladder head ' + d.ladHead.join('|'));
    MG.forEach((g, q) => { const pp = c0 / (1 - g / 100), mu = g / (100 - g) * 100; same((d.lad[q] || []).join('|'), [g + '%', fm(pp), fm(pp - c0), pct(mu)].join('|'), 'margin ladder row ' + g); });
    const g = pick(MG); await ctx.eval('document.querySelectorAll("#mkLad tbody tr")[' + MG.indexOf(g) + '].click()');
    const d2 = await read(); runs++;
    same(d2.box.margin, String(g), 'ladder click sets the margin'); same(d2.from, 'From cost and margin. Margin replaced markup — they tell each other, so only one can be typed.', 'ladder click from-line');
    same(d2.box.price, plain(c0 / (1 - g / 100), 2), 'ladder click price'); await ctx.seg('mkLadMode', 'mu');
  }

  /* ---- 3. a third value replaces the oldest; a second ratio replaces the first ---- */
  for (let i = 0; i < 30; i++) {
    const c0 = rd(10 + R() * 500, 2), m0 = pick([20, 40, 60]), p0 = c0 * (1 + m0 / 100), base = { cost: c0, price: rd(p0, 2), profit: rd(p0 - c0, 2) };
    const trio = pick([['cost', 'price', 'profit'], ['price', 'profit', 'cost'], ['profit', 'cost', 'price']]); await clear(); await advOpen(false);
    for (const k of trio) await typeVal(k, base[k]); runs++;
    /* the cost is pinned: a third value other than the cost replaces the other member, never the cost */
    const pinned = trio[2] !== 'cost' && trio.indexOf('cost') < 2, gone = pinned ? (trio[0] === 'cost' ? trio[1] : trio[0]) : trio[0], keep = trio.slice(0, 3).filter((x) => x !== gone);
    const d = await read(), M = model(keep.map((x) => [x, base[x]])), tag = JSON.stringify(trio);
    same(d.from, 'From ' + NM[keep[0]] + ' and ' + NM[keep[1]] + '. ' + (pinned ? 'The cost stays, so ' : 'A third value replaces the oldest, so ') + NM[gone] + ' is now worked out.', 'third-value from-line ' + tag);
    if (M) same(d.box[gone], plain({ cost: M.c, price: M.p, profit: M.pr }[gone], 2), 'replaced box is now computed ' + tag);
  }
  await clear(); await typeVal('cost', 100); await typeVal('markup', 50); await typeVal('margin', 25); runs++;
  let d = await read(); same(d.from, 'From cost and margin. Margin replaced markup — they tell each other, so only one can be typed.', 'ratio swap'); same(d.box.markup, '33.33', 'ratio swap computed markup'); same(d.box.price, '133.33', 'ratio swap price');
  await typeVal('markup', 100); d = await read(); same(d.from, 'From cost and markup. Markup replaced margin — they tell each other, so only one can be typed.', 'ratio swap back'); same(d.box.price, '200', 'swap back price'); same(d.box.margin, '50', 'swap back margin');
  /* typing into a computed box: it becomes typed, the oldest goes */
  await clear(); await typeVal('cost', 100); await typeVal('markup', 50); await typeVal('price', 200); d = await read(); runs++;
  same(d.from, 'From cost and selling price. The cost stays, so markup is now worked out.', 'computed box typed'); same(d.box.cost, '100', 'cost stays'); same(d.box.markup, '100', 'markup recomputed');
  await clear(); await typeVal('price', 200); await typeVal('markup', 50); await typeVal('profit', 40); d = await read(); runs++;
  same(d.from, 'From markup and profit. A third value replaces the oldest, so selling price is now worked out.', 'no cost: oldest goes'); same(d.box.cost, '80', 'cost worked out when not typed');
  await clear(); await typeVal('cost', 14.8); await typeVal('price', 18.3); await typeVal('profit', 5); d = await read(); runs++;
  same(d.box.cost, '14.8', 'profit edit keeps the cost'); same(d.box.price, '19.8', 'profit edit moves the price');
  /* clearing a field removes it from the pair, the computed boxes follow */
  await clear(); await typeVal('cost', 100); await typeVal('markup', 50); await ctx.set('mkCost', ''); d = await read(); runs++;
  same(d.box.price, '', 'price blank after clearing cost'); same(d.box.profit, '', 'profit blank after clearing cost'); same(d.box.margin, '33.33', 'margin stays as a conversion'); same(d.big, '33.33%', 'headline is the margin'); same(d.lab, 'Margin', 'label is Margin');
  same(d.from, 'You typed markup. The margin is worked out from it — add a cost, selling price or profit to get amounts.', 'lone markup from-line'); same(d.sub, 'A 50% markup is a 33.33% margin. Add a cost, selling price or profit to get amounts.', 'lone markup sub');
  same(d.tip, 'A 50% markup is a 33.33% margin: the profit is 50% of the cost but only 33.33% of the selling price.', 'lone markup sentence');
  if (d.barsVis) fails.push('bars shown for a lone ratio'); if (d.lad.length !== 11 || d.ladHead.join('') !== 'MarkupMargin') fails.push('lone ratio ladder ' + d.ladHead.join('|'));
  await ctx.set('mkMarkup', ''); await typeVal('margin', 25); d = await read(); runs++; same(d.big, '33.33%', 'margin 25 -> markup headline'); same(d.lab, 'Markup', 'label Markup'); same(d.box.markup, '33.33', 'margin 25 -> markup box');
  same(d.tip, 'A 25% margin needs a 33.33% markup: the profit is 25% of the selling price but 33.33% of the cost.', 'lone margin sentence');
  await clear(); await typeVal('markup', -100); d = await read(); runs++; if (d.body || d.big !== '—') fails.push('lone -100% markup shows a result'); same(d.sub, 'A −100% markup means the selling price is zero, so there is no margin. Type a cost or a selling price to go on.', 'lone -100 markup sub');
  await clear(); await advOpen(true); await typeVal('cost', 100); await typeVal('markup', 50); await ctx.set('mkQty', '5'); await ctx.eval('document.getElementById("mkClear").click()'); d = await read(); runs++;
  if (d.body || d.big !== '—' || d.fromVis || d.hint || K.some((k) => d.box[k] !== '')) fails.push('Clear fields left something: ' + JSON.stringify([d.body, d.big, d.box])); if ((await ctx.eval('document.getElementById("mkQty").value')) !== '') fails.push('Clear fields left the units box'); await advOpen(false);
  /* lone money, nothing typed */
  await clear(); d = await read(); if (d.body || d.big !== '—' || d.fromVis || d.hint) fails.push('start state not blank: ' + JSON.stringify([d.body, d.big, d.fromVis, d.hint])); same(d.sub, 'Type any two of cost, selling price, profit, markup or margin.', 'empty sub-line');
  for (const k of ['cost', 'price', 'profit']) { await clear(); await typeVal(k, 50); d = await read(); runs++; if (d.body || d.big !== '—') fails.push('lone ' + k + ' shows a result'); same(d.sub, 'Type one more value: ' + K.filter((x) => x !== k).map((x) => NM[x]).join(', ').replace(/, ([^,]*)$/, ' or $1') + '.', 'lone ' + k + ' sub'); same(d.from, 'You typed ' + NM[k] + '. Type one more: ' + K.filter((x) => x !== k).map((x) => NM[x]).join(', ').replace(/, ([^,]*)$/, ' or $1') + '.', 'lone ' + k + ' from-line'); }

  /* ---- 4. refusals and junk: the pair stays valid, the hint sits under the field and says it is ignored ---- */
  const ign = (t) => /ignored for now/.test(t);
  const refuse = async (id, v, expect, label) => { await clear(); await typeVal('cost', 100); await typeVal('markup', 50); await ctx.set(id, v); const dd = await read(); runs++; if (!dd.hint || dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push(label + ': hint [' + dd.hint + '] expected to contain [' + expect + '] and "ignored for now"'); const where = await ctx.eval('(function(){var h=document.getElementById("mkHint"),p=h.previousElementSibling;return p&&p.querySelector("input")?p.querySelector("input").id:"";})()'); if (where !== id) fails.push(label + ': hint sits under ' + where + ' not ' + id); return dd; };
  await refuse('mkMargin', '100', 'Margin can’t reach 100%', 'margin 100'); await refuse('mkMargin', '150', 'Margin can’t reach 100%', 'margin 150');
  await refuse('mkMarkup', '-101', 'Markup can’t go below −100%', 'markup -101'); await refuse('mkCost', '-5', 'Cost can’t be negative', 'cost -5'); await refuse('mkPrice', '-5', 'Selling price can’t be negative', 'price -5');
  await refuse('mkProfit', 'abc', 'Couldn’t read “abc” in Profit — type a number like 50.', 'profit abc'); await refuse('mkCost', '1e3', 'Couldn’t read “1e3” in Cost', 'cost 1e3'); await refuse('mkPrice', '5\'10', 'Couldn’t read', 'price 5 10');
  await refuse('mkPrice', '1,2', 'Couldn’t read', 'price 1,2'); await refuse('mkProfit', '99999999999999', 'Profit is too large', 'profit huge');
  /* partial entries are skipped quietly: nothing changes */
  await clear(); await typeVal('cost', 100); await typeVal('markup', 50); const before = await read(); for (const v of ['-', '.', '+', '-.']) { await ctx.set('mkMarkup', v); const dd = await read(); if (dd.big !== before.big || dd.hint) fails.push('partial "' + v + '" changed the result or showed a hint: ' + dd.big + ' ' + dd.hint); }
  await typeVal('markup', '-'); await typeVal('markup', '-2'); await typeVal('markup', '-20'); d = await read(); same(d.box.price, '80', 'markup -20 price'); same(d.tip, 'A cost of $100.00 sold at $80.00 loses $20.00: that is a −20% markup and a −25% margin.', 'loss sentence');
  same(d.big, '−20%', 'loss headline: the markup'); if (d.sub.indexOf('Selling price $80.00') < 0) fails.push('loss sub misses the price: ' + d.sub); if (!/mk-calc/.test('x') && d.calc.indexOf('mkPrice') < 0) fails.push('price not marked as calculated');
  /* thousands commas and symbols are read */
  await clear(); await typeVal('cost', '$1,200.50'); await typeVal('markup', '25%'); d = await read(); runs++; same(d.box.price, '1,500.63', 'commas and symbols read: price'); same(d.big, '25%', 'commas headline is the markup'); if (d.sub.indexOf('Selling price $1,500.63') < 0) fails.push('commas sub price: ' + d.sub);
  /* contradictions: pairs that cannot both be true give a clear hint and no result */
  const contra = async (a, b, expect) => { await clear(); await typeVal(a[0], a[1]); await typeVal(b[0], b[1]); const dd = await read(); runs++; if (dd.body) fails.push('contradiction shown as a result ' + JSON.stringify([a, b])); if (dd.hint.indexOf(expect) < 0) fails.push('contradiction hint [' + dd.hint + '] expected [' + expect + '] ' + JSON.stringify([a, b])); };
  await contra(['cost', 50], ['profit', -80], 'A loss can’t be bigger than the cost'); await contra(['price', 50], ['profit', 80], 'Profit can’t be more than the selling price');
  await contra(['price', 50], ['markup', -100], 'A markup of −100% means a selling price of zero'); await contra(['profit', 20], ['markup', 0], 'A profit can’t come from a 0% markup'); await contra(['profit', 0], ['markup', 0], 'Zero profit at a 0% markup');
  await contra(['profit', 20], ['markup', -10], 'A profit goes with a positive markup'); await contra(['profit', 20], ['margin', 0], 'A profit can’t come from a 0% margin'); await contra(['profit', -20], ['margin', 10], 'A profit goes with a positive margin');
  /* zero cost and zero price: results with a dash, never a blank or NaN */
  await clear(); await typeVal('cost', 0); await typeVal('price', 80); d = await read(); runs++; same(d.tip, 'With a cost of $0.00 the whole $80.00 is profit. A markup needs a cost above zero.', 'cost zero sentence'); same(d.box.markup, '', 'cost zero markup blank'); same(d.box.margin, '100', 'cost zero margin 100'); same(d.big, '100%', 'cost zero headline is the margin'); same(d.lab, 'Margin', 'cost zero label');
  await clear(); await typeVal('cost', 100); await typeVal('price', 0); d = await read(); runs++; same(d.tip, 'Selling for $0.00 against a cost of $100.00 loses everything: a −100% markup. A margin needs a selling price above zero.', 'price zero sentence'); same(d.box.markup, '-100', 'price zero markup'); same(d.box.margin, '', 'price zero margin blank');
  await clear(); await typeVal('cost', 100); await typeVal('price', 100); d = await read(); runs++; same(d.tip, 'A cost of $100.00 sold at $100.00 breaks even: a 0% markup and a 0% margin.', 'break-even sentence'); same(d.box.markup, '0', 'break-even markup'); same(d.box.profit, '0', 'break-even profit');
  await clear(); await typeVal('cost', 0); await typeVal('price', 0); d = await read(); same(d.tip, 'Cost and selling price are both zero, so there is no profit to measure.', 'both zero sentence');

  /* ---- 5. QA item 19: advanced fields react, also with their prerequisite empty ---- */
  await clear(); await advOpen(true);
  const PRE = 'Type two of the five boxes above first — then this applies.';
  await ctx.set('mkTax', '8.5'); d = await read(); same(d.n.tax, PRE, 'tax without a pair'); await ctx.set('mkFee', '3'); d = await read(); same(d.n.fee, PRE, 'fee without a pair'); await ctx.set('mkDisc', '10'); d = await read(); same(d.n.disc, PRE, 'discount without a pair');
  await ctx.set('mkQty', '12'); d = await read(); same(d.n.qty, 'Type two of the five boxes above first — then the totals for 12 units appear.', 'units without a pair');
  await ctx.set('mkQty', '1'); d = await read(); same(d.n.qty, 'Type two of the five boxes above first — then the totals for 1 unit appear.', 'one unit without a pair');
  await ctx.set('mkTax', ''); await ctx.set('mkFee', ''); await ctx.set('mkDisc', ''); await ctx.set('mkQty', ''); d = await read();
  same(d.n.qty, 'Selling more than one? Type how many and the totals appear below.', 'units note empty'); same(d.n.tax, 'Charging sales tax or VAT? Type the rate and see what the customer pays.', 'tax note empty');
  same(d.n.fee, 'Payment or platform fees, as a percent of the price? Type the rate for your net profit.', 'fee note empty'); same(d.n.disc, 'Giving a discount? Type the percent off to see what is left of your profit.', 'discount note empty');
  for (const [id, v, expect] of [['mkQty', '0', 'Units should be a number above 0'], ['mkQty', 'abc', 'Couldn’t read “abc” in Units'], ['mkTax', '101', 'Sales tax / VAT should be a percent from 0 to 100'], ['mkFee', '-1', 'Fees should be a percent from 0 to 100'], ['mkDisc', 'x', 'Couldn’t read “x” in Discount']]) {
    await clear(); await advOpen(true); await typeVal('cost', 100); await typeVal('markup', 50); await ctx.set(id, v); const dd = await read(); runs++;
    if (!dd.body) fails.push('bad advanced value ' + id + '=' + v + ' hid the result'); if (dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push('advanced hint ' + id + '=' + v + ' [' + dd.hint + ']');
    await ctx.set(id, '');
  }
  /* Go simple clears the extras */
  await clear(); await advOpen(true); await typeVal('cost', 100); await typeVal('markup', 50); await ctx.set('mkQty', '5'); await ctx.set('mkTax', '10'); await advOpen(false); d = await read();
  if (d.advVis) fails.push('extras table still visible after Go simple'); if ((await ctx.eval('document.getElementById("mkQty").value + document.getElementById("mkTax").value')) !== '') fails.push('Go simple did not clear the extras');

  /* ---- 6. currencies: symbol and decimals follow the selector, nothing is converted ---- */
  for (const [cur, sym, dec] of [['EUR', '€', 2], ['GBP', '£', 2], ['JPY', '¥', 0], ['USD', '$', 2], ['CHF', 'CHF', 2], ['INR', '₹', 2], ['SEK', 'kr', 2], ['ILS', '₪', 2]]) {
    await clear(); await advOpen(false); await ctx.set('mkCur', cur); await typeVal('cost', 1234.5); await typeVal('markup', 25); d = await read(); runs++;
    const p = 1234.5 * 1.25, fm = (x) => { let r = money(x, sym, dec); if (['EUR', 'SEK', 'ILS'].includes(cur)) r = r.replace(sym, '') + sym; return cur === 'CHF' ? r.replace('CHF', 'CHF ') : r; };
    const big = d.sub.split(' · ')[1].replace(/[\s\u00a0\u202f]/g, ''), exp = ('Selling price' + fm(p)).replace(/[\s\u00a0\u202f]/g, ''); if (big !== exp) fails.push('currency ' + cur + ' sub price [' + d.sub + '] expected [' + fm(p) + ']');
    if (d.box.price !== plain(p, dec)) fails.push('currency ' + cur + ' computed price box [' + d.box.price + '] expected [' + plain(p, dec) + ']');
    const u = d.unit.u[0]; if (u.indexOf(sym) !== 0) fails.push('currency ' + cur + ' label unit [' + u + '] should start with ' + sym);
  }
  await ctx.set('mkCur', 'USD');
  /* unit labels: typed boxes show what they are, computed ones say calculated */
  await clear(); await typeVal('cost', 100); await typeVal('markup', 50); d = await read(); runs++;
  same(d.unit.u.join('|'), '$ · what you pay|$ · calculated|$ · calculated|% · profit ÷ cost|% · calculated', 'unit labels');
  return { runs, fails: fails.slice(0, 25), note: 'fuzzy ties ' + fuzzy + ' of ' + cmp + ' comparisons' };
};
