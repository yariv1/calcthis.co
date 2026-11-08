/* ORACLE for discount-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.discountEngine / salesEngine). The price after the first discount and each extra discount is
   computed forward step by step; pairs of the four boxes are solved by BISECTION on that forward function (a different route from the page's affine algebra); the offer comparison,
   the ladder, the tax lines and every note are rebuilt here. Drives the real inputs (including the dynamic rows by id) and compares what the page DISPLAYS, plus QA item 19
   (every field reacts, prerequisite-empty cases), refusals, swaps, currencies, Clear fields. */
module.exports = async function (ctx) {
  let s = 20261110; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, fuzzy = 0, cmp = 0, skipped = 0;
  const MINUS = '−';
  const rd = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const money = (x, sym, dec) => { if (x == null) return '—'; dec = dec == null ? 2 : dec; if (Math.abs(x) < Math.pow(10, -dec) / 2) x = 0; return (x < 0 ? MINUS : '') + sym + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  const pcn = (x) => { const r = rd(x, 2); return (r < 0 ? MINUS : '') + Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 2 }); };
  const pct = (x) => x == null ? '—' : pcn(x) + '%';
  const plain = (x, dec) => { const r = rd(x, dec); return (r < 0 ? '-' : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: dec }); };
  const qn = (x) => (Math.round(x * 1000) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
  const fm = (x) => money(x, '$');
  const K = ['orig', 'pct', 'final', 'save'], ID = { orig: 'dcOrig', pct: 'dcPct', final: 'dcFinal', save: 'dcSave' };
  const NM = { orig: 'original price', pct: 'percent off', final: 'final price', save: 'amount saved' };
  const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
  const same = (got, exp, tag) => {
    cmp++; if (got === exp) return true;
    const num = /-?\d[\d,]*\.?\d*/g, sk = (t) => t.replace(num, '#'), nu = (t) => (t.match(num) || []).map((x) => parseFloat(x.replace(/,/g, '')));
    if (sk(got) === sk(exp)) { const a = nu(got), b = nu(exp); if (a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 0.0101 * (Math.abs(b[i]) > 1e6 ? Math.abs(b[i]) / 1e6 : 1))) { fuzzy++; return true; } }
    fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false;
  };
  const orList = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1];
  /* forward, step by step, with no clamping; valid() says whether every amount off fits in the price left */
  const fwd = (o, p, rows) => { let x = o * (1 - p / 100); const steps = [{ k: 'pct', v: p, amt: o - x, after: x }]; for (const r of rows) { const a = r.k === 'pct' ? x * r.v / 100 : r.v; steps.push({ k: r.k, v: r.v, amt: a, before: x, after: x - a }); x -= a; } return { f: x, steps }; };
  const validFwd = (F) => F.steps.every((st) => st.k !== 'amt' || st.amt <= st.before + 1e-9 * Math.max(1, st.before));
  const bisect = (g, lo, hi, target, inc) => { for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2, gv = g(mid); if ((gv < target) === inc) lo = mid; else hi = mid; } return (lo + hi) / 2; };
  function model(typed, rows) {
    const v = {}; typed.forEach((x) => { v[x[0]] = x[1]; });
    let o, p;
    if (v.orig !== undefined && v.pct !== undefined) { o = v.orig; p = v.pct; }
    else if (v.orig !== undefined) {
      o = v.orig; const fin = v.final !== undefined ? v.final : o - v.save; if (!(o > 0)) return null;
      const fHi = fwd(o, 0, rows).f, fLo = fwd(o, 100, rows).f; if (fin > fHi + 1e-9 || fin < fLo - 1e-9) return null;
      p = bisect((q) => fwd(o, q, rows).f, 0, 100, fin, false);
    } else if (v.pct !== undefined && v.final !== undefined) {
      p = v.pct; if (p >= 100) return null; let hi = 1; while (fwd(hi, p, rows).f < v.final && hi < 1e13) hi *= 2;
      o = bisect((q) => fwd(q, p, rows).f, 0, hi, v.final, true);
    } else if (v.pct !== undefined && v.save !== undefined) {
      p = v.pct; const h = (q) => q - fwd(q, p, rows).f; let hi = 1; while (h(hi) < v.save && hi < 1e13) hi *= 2; if (h(0) > v.save + 1e-9) return null;
      o = bisect(h, 0, hi, v.save, true);
    } else { o = v.final + v.save; if (!(o > 0)) return null; const fin = v.final, fHi = fwd(o, 0, rows).f, fLo = fwd(o, 100, rows).f; if (fin > fHi + 1e-9 || fin < fLo - 1e-9) return null; p = bisect((q) => fwd(o, q, rows).f, 0, 100, fin, false); }
    const F = fwd(o, p, rows); if (!validFwd(F)) return null;
    let sv = o - F.f; if (Math.abs(sv) < 1e-9 * Math.max(1, o)) sv = 0;
    return { o, p, f: F.f, s: sv, steps: F.steps, eff: o > 0 ? sv / o * 100 : null };
  }
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};var v=function(i){return document.getElementById(i).value;};var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};var heads=function(i){return [].map.call(document.querySelectorAll("#"+i+" thead th"),function(c){return c.textContent;});};' +
    'return {box:{orig:v("dcOrig"),pct:v("dcPct"),final:v("dcFinal"),save:v("dcSave")},big:g("dcBig"),lab:g("dcLab"),sub:g("dcSub"),tip:g("dcTip"),from:g("dcFrom"),fromVis:vis("dcFrom"),body:vis("dcBody"),hint:vis("dcHint")?g("dcHint"):"",bars:g("dcBars"),barsVis:vis("dcBarsWrap"),step:rows("dcStep"),stepVis:vis("dcStepWrap"),cmp:rows("dcCmp"),cmpVis:vis("dcCmpWrap"),lad:rows("dcLad"),ladHead:heads("dcLad"),ladNote:g("dcLadNote"),ladVis:vis("dcLadWrap"),on:[].map.call(document.querySelectorAll("#dcLad tr.on"),function(r){return r.children[0].textContent;}),n:{rows:g("dcRowsNote"),qty:g("dcQtyNote"),tax:g("dcTaxNote"),off:g("dcOffNote")},calc:[].map.call(document.querySelectorAll(".fld.dc-calc"),function(f){return f.querySelector("input").id;}),mlab:g("dcMLab"),mval:g("dcMVal"),u:[].map.call(document.querySelectorAll("#dcFields .fld .unit"),function(u){return u.textContent;}),rowCount:document.querySelectorAll("#dcRows .dc-row").length,offCount:document.querySelectorAll("#dcOffers .dc-row").length};})())'));
  const advOpen = async (want) => { const o = (await ctx.eval('document.getElementById("dcAdvIn").style.display')) !== 'none'; if (o !== want) await ctx.click('dcAdvBtn'); };
  const clear = async () => { await ctx.fill(); for (const k of K) await ctx.set(ID[k], ''); };
  const typeVal = async (k, x) => ctx.set(ID[k], String(x));
  const addRows = async (rows) => { let i = 0; for (const r of rows) { i++; await ctx.click('dcRowAdd'); if (r.k === 'amt') await ctx.set('dcRs' + i + 'k', 'amt'); await ctx.set('dcRs' + i + 'a', String(r.v)); } };
  const PCTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70];
  const PAIRS = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== j) PAIRS.push([K[i], K[j]]);

  /* ---- 1. random pairs with 0-3 extra discounts, tax and quantity ---- */
  for (let i = 0; i < 330; i++) {
    const o0 = rd(100 + R() * 4900, 2), p0 = pick([5, 10, 12.5, 15, 20, 25, 30, 33, 40, 50, 60]), nr = pick([0, 0, 1, 2, 3]), rows = [];
    for (let q = 0; q < nr; q++) rows.push(R() < 0.6 ? { k: 'pct', v: pick([5, 10, 15, 25]) } : { k: 'amt', v: pick([2.5, 5, 10]) });
    const F = fwd(o0, p0, rows); if (!validFwd(F)) { skipped++; continue; }
    const base = { orig: o0, pct: p0, final: rd(F.f, 2), save: rd(o0 - F.f, 2) }, pair = pick(PAIRS), typed = pair.map((k) => [k, base[k]]), M = model(typed, rows);
    if (!M) { skipped++; continue; }
    await clear();
    const adv = R() < 0.5, o2 = { qty: null, tax: null }, mode = R() < 0.4 ? 'incl' : 'add';
    if (adv) { await advOpen(true); if (R() < 0.6) o2.qty = pick([1, 2, 12, 100, 0.5]); if (R() < 0.6) { o2.tax = pick([5, 8.5, 20, 7.25]); await ctx.seg('dcTaxMode', mode); } } else await advOpen(false);
    await addRows(rows);
    for (const k of pair) await typeVal(k, base[k]);
    if (o2.qty !== null) await ctx.set('dcQty', String(o2.qty)); if (o2.tax !== null) await ctx.set('dcTax', String(o2.tax));
    runs++;
    const d = await read(), tag = JSON.stringify({ pair, typed: typed.map((x) => x[1]), rows, o2, mode });
    if (!d.body) { fails.push('no result ' + tag + ' hint ' + d.hint); continue; }
    const val = { orig: M.o, pct: M.p, final: M.f, save: M.s };
    K.forEach((k) => same(d.box[k], pair.indexOf(k) >= 0 ? String(base[k]) : plain(val[k], 2), 'box ' + k + ' ' + tag));
    const ta = o2.tax !== null ? M.f * o2.tax / 100 : 0, ti = o2.tax !== null ? M.f - M.f / (1 + o2.tax / 100) : 0;
    same(d.big, fm(M.f), 'headline ' + tag); same(d.lab, 'Final price', 'label ' + tag);
    same(d.sub, 'Original price ' + fm(M.o) + ' · Percent off ' + pct(M.p) + ' · You save ' + fm(M.s) + (rows.length ? ' · Total discount ' + pct(M.eff) : '') + (o2.tax !== null ? (mode === 'add' ? ' · With tax ' + fm(M.f + ta) : ' · Includes tax ' + fm(ti)) : ''), 'sub ' + tag);
    same(d.from, 'From ' + NM[pair[0]] + ' and ' + NM[pair[1]] + '.', 'from ' + tag);
    const allPct = rows.every((r) => r.k === 'pct'), sum = M.p + rows.reduce((a, r) => a + (r.k === 'pct' ? r.v : 0), 0);
    same(d.tip, !rows.length ? 'A ' + pcn(M.p) + '% discount on ' + fm(M.o) + ' saves ' + fm(M.s) + ': you pay ' + fm(M.f) + '.' : 'Your discounts together take ' + fm(M.s) + ' off ' + fm(M.o) + ': a total discount of ' + pct(M.eff) + (allPct && sum - M.eff > 1e-9 ? ', not the ' + pct(sum) + ' you get by adding the percents' : '') + '. You pay ' + fm(M.f) + '.', 'sentence ' + tag);
    same(d.mval, fm(M.f), 'floating bar value ' + tag); same(d.mlab, 'Final price', 'floating bar label ' + tag);
    const calcExp = K.filter((k) => pair.indexOf(k) < 0).map((k) => ID[k]).sort().join(','); if (d.calc.slice().sort().join(',') !== calcExp) fails.push('calculated marks ' + d.calc + ' expected ' + calcExp + ' ' + tag);
    /* picture */
    if (!d.barsVis) fails.push('bars hidden ' + tag);
    else {
      let key = M.f > 0 ? 'You pay ' + pct(M.f / M.o * 100) : ''; const n = M.steps.length;
      M.steps.forEach((st, q) => { if (st.amt > 0) key += (n > 1 ? ORD[q] + ' discount' : 'Discount') + ' (' + (st.k === 'pct' ? pcn(st.v) + '% off' : fm(st.v) + ' off') + ') ' + pct(st.amt / M.o * 100); });
      same(d.bars.replace(/ /g, ''), key.replace(/ /g, ''), 'bar key ' + tag);
    }
    /* step table */
    const sr = [['Original price', '', fm(M.o)]]; M.steps.forEach((st) => sr.push([st.k === 'pct' ? pcn(st.v) + '% off' : fm(st.v) + ' off', MINUS + fm(st.amt), fm(st.after)])); sr.push(['Final price', '', fm(M.f)]);
    if (o2.tax !== null) { if (mode === 'add') { sr.push(['Sales tax ' + pcn(o2.tax) + '%', '+' + fm(ta), fm(M.f + ta)]); sr.push(['You pay', '', fm(M.f + ta)]); } else { sr.push(['Tax included (' + pcn(o2.tax) + '%)', fm(ti), '']); sr.push(['Price before tax', '', fm(M.f - ti)]); } }
    if (!d.stepVis) fails.push('step table hidden ' + tag); else if (d.step.length !== sr.length) fails.push('step rows ' + d.step.length + ' vs ' + sr.length + ' ' + tag); else sr.forEach((r, q) => same(d.step[q].join('|'), r.join('|'), 'step row ' + q + ' ' + tag));
    /* ladder */
    if (!d.ladVis) fails.push('ladder hidden ' + tag);
    else {
      if (d.ladHead.join('') !== 'Percent offFinal priceYou save') fails.push('ladder head ' + d.ladHead.join('|') + ' ' + tag);
      if (d.lad.length !== PCTS.length) fails.push('ladder rows ' + d.lad.length + ' ' + tag);
      else PCTS.forEach((x, q) => { const L = fwd(M.o, x, rows); same(d.lad[q].join('|'), validFwd(L) ? [x + '%', fm(L.f), fm(M.o - L.f)].join('|') : [x + '%', '—', '—'].join('|'), 'ladder row ' + x + ' ' + tag); });
    }
    /* notes */
    same(d.n.rows, rows.length ? 'Applied one after another, each on the price left by the one before.' : 'Got a coupon or a second sale? Add it here — it comes off the price after the first discount.', 'rows note ' + tag);
    if (o2.qty !== null) same(d.n.qty, 'For ' + qn(o2.qty) + (o2.qty === 1 ? ' item' : ' items') + ': original ' + fm(M.o * o2.qty) + ', you save ' + fm(M.s * o2.qty) + ', you pay ' + fm(M.f * o2.qty) + (o2.tax !== null && mode === 'add' ? ', ' + fm(M.f * (1 + o2.tax / 100) * o2.qty) + ' with tax' : '') + '.', 'qty note ' + tag);
    if (o2.tax !== null) same(d.n.tax, mode === 'add' ? 'Sales tax of ' + pcn(o2.tax) + '% on the final price is ' + fm(ta) + ', so you pay ' + fm(M.f + ta) + '.' : 'With ' + pcn(o2.tax) + '% tax already in the price, your final price holds ' + fm(ti) + ' of tax (price before tax ' + fm(M.f / (1 + o2.tax / 100)) + ').', 'tax note ' + tag);
  }

  /* ---- 2. compare deals ---- */
  const offerLabel = (of) => of.t === 'pct' ? pcn(of.a) + '% off' : of.t === 'amt' ? fm(of.a) + ' off' : of.t === 'bxgy' ? 'Buy ' + qn(of.a) + ' get ' + qn(of.b) + ' free' : pcn(of.a) + '% off every ' + (of.t === 'n2' ? '2nd' : '3rd') + ' item';
  const payOf = (P, q, of) => { const tot = P * q; if (of.t === 'pct') return tot * (1 - of.a / 100); if (of.t === 'amt') return of.a > tot + 1e-9 * Math.max(1, tot) ? null : Math.max(0, tot - of.a); if (of.t === 'bxgy') { let paid = 0; for (let i = 1; i <= q; i++) if (((i - 1) % (of.a + of.b)) < of.a) paid++; return paid * P; } const N = of.t === 'n2' ? 2 : 3; let t2 = 0; for (let i = 1; i <= q; i++) t2 += i % N === 0 ? P * (1 - of.a / 100) : P; return t2; };
  for (let i = 0; i < 70; i++) {
    const P0 = rd(20 + R() * 500, 2), n = pick([1, 2, 3]), offs = [];
    for (let q = 0; q < n; q++) { const t = pick(['pct', 'amt', 'bxgy', 'n2', 'n3', 'pct']); offs.push(t === 'pct' ? { t, a: pick([10, 20, 30, 50]) } : t === 'amt' ? { t, a: pick([5, 10, 25, 40]) } : t === 'bxgy' ? (() => { const g = pick([[1, 1], [2, 1], [3, 1], [3, 2], [4, 1]]); return { t, a: g[0], b: g[1] }; })() : { t, a: pick([25, 50]) }); }
    const items = R() < 0.4 ? pick([1, 2, 3, 4, 6, 12]) : null;
    await clear(); await advOpen(true); await typeVal('orig', P0); if (R() < 0.5) await typeVal('pct', 10);
    let m = 0; for (const of of offs) { m++; await ctx.click('dcOffAdd'); await ctx.set('dcOf' + m + 'k', of.t); await ctx.set('dcOf' + m + 'a', String(of.a)); if (of.t === 'bxgy') await ctx.set('dcOf' + m + 'b', String(of.b)); }
    if (items !== null) await ctx.set('dcItems', String(items));
    runs++; const d = await read(), tag = JSON.stringify({ P0, offs, items });
    let Q = items; if (Q === null) { Q = 1; offs.forEach((of) => { const sz = of.t === 'bxgy' ? of.a + of.b : of.t === 'n2' ? 2 : of.t === 'n3' ? 3 : 1; if (sz > Q) Q = sz; }); }
    const tot = P0 * Q, res = offs.map((of) => ({ of, pay: payOf(P0, Q, of) })); let best = null; res.forEach((x) => { if (x.pay !== null && (best === null || x.pay < best - 1e-9)) best = x.pay; });
    if (!d.cmpVis) { fails.push('compare table hidden ' + tag); continue; }
    const rowsE = res.map((x) => { if (x.pay === null) return [offerLabel(x.of), '—', '—', '—']; const isB = Math.abs(x.pay - best) < 1e-9 * Math.max(1, tot); return [offerLabel(x.of) + (isB && res.length > 1 ? ' Best deal' : ''), fm(x.pay), fm(tot - x.pay), tot > 0 ? pct((tot - x.pay) / tot * 100) : '—']; });
    if (d.cmp.length !== rowsE.length) fails.push('compare rows ' + d.cmp.length + ' vs ' + rowsE.length + ' ' + tag); else rowsE.forEach((r, q) => same(d.cmp[q].join('|'), r.join('|'), 'compare row ' + q + ' ' + tag));
    same(d.n.off, 'Compared on ' + qn(Q) + (Q === 1 ? ' item' : ' items') + (items !== null ? '' : (Q > 1 ? ' — the largest bundle among your offers —' : '')) + ' at ' + fm(P0) + ' each.', 'compare note ' + tag);
  }
  /* an amount off bigger than the total: the row shows dashes and does not win */
  await clear(); await advOpen(true); await typeVal('orig', 20); await ctx.click('dcOffAdd'); await ctx.set('dcOf1a', '10'); await ctx.click('dcOffAdd'); await ctx.set('dcOf2k', 'amt'); await ctx.set('dcOf2a', '50'); let d = await read(); runs++;
  same(d.cmp.map((r) => r.join('|')).join('#'), '10% off Best deal|$18.00|$2.00|10%#$50.00 off|—|—|—', 'amount off over the total');
  await clear(); await advOpen(true); await ctx.click('dcOffAdd'); await ctx.set('dcOf1a', '30'); d = await read(); runs++; same(d.n.off, 'Type the original price above first — then the offers are compared.', 'offers without a price'); if (d.cmpVis) fails.push('compare table shown without a price');
  await clear(); await advOpen(true); d = await read(); same(d.n.off, 'Not sure which deal is best? Add up to three offers — 30% off, $25 off, buy 2 get 1 free — and see which costs least.', 'offers note empty');
  await ctx.click('dcOffAdd'); d = await read(); same(d.n.off, 'Type a value for each offer.', 'offers note with an empty row'); await ctx.set('dcItems', '4'); d = await read(); same(d.n.off, 'The offers will be compared on 4 items. Type a value for each offer.', 'items with an empty offer row'); await ctx.eval('document.querySelector("#dcOffers .x").click()'); d = await read(); same(d.n.off, 'The offers will be compared on 4 items. Add an offer above to compare them.', 'items without offers'); await ctx.set('dcItems', '1'); d = await read(); same(d.n.off, 'The offers will be compared on 1 item. Add an offer above to compare them.', 'one item without offers'); await ctx.set('dcItems', '');
  /* orig only + offers: the table shows while the headline stays blank */
  await clear(); await advOpen(true); await typeVal('orig', 100); await ctx.click('dcOffAdd'); await ctx.set('dcOf1a', '25'); d = await read(); runs++; if (!d.body || !d.cmpVis || d.ladVis || d.big !== '—') fails.push('orig + offer: body ' + d.body + ' cmp ' + d.cmpVis + ' ladder ' + d.ladVis + ' big ' + d.big);

  /* ---- 3. the ladder: a click on a row sets the percent off ---- */
  for (let i = 0; i < 10; i++) {
    const o0 = rd(20 + R() * 900, 2); await clear(); await advOpen(false); await typeVal('orig', o0); await typeVal('pct', pick([10, 25, 50]));
    const g = pick(PCTS); await ctx.eval('document.querySelectorAll("#dcLad tbody tr")[' + PCTS.indexOf(g) + '].click()'); const d2 = await read(); runs++;
    same(d2.box.pct, String(g), 'ladder click sets the percent'); same(d2.from, 'From original price and percent off.', 'ladder click from-line'); same(d2.box.final, plain(o0 * (1 - g / 100), 2), 'ladder click final');
    if (d2.on.join() !== g + '%') fails.push('ladder highlight ' + d2.on + ' expected ' + g + '%');
  }

  /* ---- 4. a third value replaces the oldest; the original price is never the one replaced ---- */
  for (let i = 0; i < 36; i++) {
    const o0 = rd(50 + R() * 900, 2), p0 = pick([10, 20, 30, 40]), base = { orig: o0, pct: p0, final: rd(o0 * (1 - p0 / 100), 2), save: rd(o0 * p0 / 100, 2) };
    const trio = pick([['orig', 'pct', 'final'], ['pct', 'final', 'orig'], ['final', 'orig', 'save'], ['orig', 'final', 'save'], ['pct', 'orig', 'save'], ['final', 'save', 'pct'], ['save', 'pct', 'final']]); await clear(); await advOpen(false);
    for (const k of trio) await typeVal(k, base[k]); runs++;
    const pinned = trio[2] !== 'orig' && trio.indexOf('orig') >= 0 && trio.indexOf('orig') < 2, gone = pinned ? (trio[0] === 'orig' ? trio[1] : trio[0]) : trio[0], keep = trio.filter((x) => x !== gone);
    const d3 = await read(), M = model(keep.map((x) => [x, base[x]]), []), tag = JSON.stringify(trio);
    same(d3.from, 'From ' + NM[keep[0]] + ' and ' + NM[keep[1]] + '. ' + (pinned ? 'The original price stays, so ' : 'A third value replaces the oldest, so ') + NM[gone] + ' is now worked out.', 'third-value from-line ' + tag);
    if (M) same(d3.box[gone], plain({ orig: M.o, pct: M.p, final: M.f, save: M.s }[gone], 2), 'replaced box is now computed ' + tag);
  }
  /* ---- 5. lone percent, nothing typed, one value, Clear fields ---- */
  await clear(); await typeVal('pct', 20); d = await read(); runs++; same(d.big, '20%', 'lone pct headline'); same(d.lab, 'Total discount', 'lone pct label');
  same(d.sub, 'You pay 80% of the price. Type the original price to get amounts.', 'lone pct sub'); same(d.tip, 'A 20% discount takes 20% off the price: you pay 80% of it.', 'lone pct sentence');
  same(d.from, 'You typed percent off. Type the original price, final price or amount saved to get amounts.', 'lone pct from-line'); if (d.barsVis || d.stepVis) fails.push('picture shown for a lone percent');
  if (d.ladHead.join('') !== 'Percent off' || d.lad.length !== PCTS.length || d.on.join() !== '20%') fails.push('lone pct ladder ' + d.ladHead.join('|') + ' ' + d.on);
  await ctx.click('dcRowAdd'); await ctx.set('dcRs1a', '10'); d = await read(); runs++; same(d.big, '28%', 'lone pct with a 10% row: total'); same(d.sub, 'You pay 72% of the price. Type the original price to get amounts.', 'lone pct row sub'); same(d.tip, 'Your discounts together take 28% off the price: you pay 72% of it.', 'lone pct row sentence');
  await ctx.set('dcRs1k', 'amt'); await ctx.set('dcRs1a', '5'); d = await read(); runs++; if (d.body || d.big !== '—') fails.push('lone pct with an amount row shows a result'); same(d.sub, 'Type one more value: original price, final price or amount saved.', 'lone pct amount row sub');
  await clear(); await advOpen(true); await typeVal('orig', 100); await typeVal('pct', 20); await ctx.click('dcRowAdd'); await ctx.set('dcRs1a', '5'); await ctx.set('dcQty', '3'); await ctx.set('dcTax', '8'); await ctx.click('dcOffAdd'); await ctx.set('dcOf1a', '10'); await ctx.eval('document.getElementById("dcClear").click()'); d = await read(); runs++;
  if (d.body || d.big !== '—' || d.fromVis || d.hint || K.some((k) => d.box[k] !== '') || d.rowCount || d.offCount) fails.push('Clear fields left something: ' + JSON.stringify([d.body, d.big, d.box, d.rowCount, d.offCount]));
  if ((await ctx.eval('document.getElementById("dcQty").value + document.getElementById("dcTax").value')) !== '') fails.push('Clear fields left the quantity or tax'); await advOpen(false);
  await clear(); d = await read(); if (d.body || d.big !== '—' || d.fromVis || d.hint) fails.push('start state not blank: ' + JSON.stringify([d.body, d.big, d.fromVis, d.hint])); same(d.sub, 'Type any two of original price, percent off, final price or amount saved.', 'empty sub-line');
  for (const k of ['orig', 'final', 'save']) { await clear(); await typeVal(k, 50); d = await read(); runs++; if (d.body || d.big !== '—') fails.push('lone ' + k + ' shows a result'); const rest = orList(K.filter((x) => x !== k).map((x) => NM[x])); same(d.sub, 'Type one more value: ' + rest + '.', 'lone ' + k + ' sub'); same(d.from, 'You typed ' + NM[k] + '. Type one more: ' + rest + '.', 'lone ' + k + ' from-line'); }

  /* ---- 6. refusals and junk: the pair stays valid, the hint sits under the field and says it is ignored ---- */
  const ign = (t) => /ignored for now/.test(t);
  const under = async () => ctx.eval('(function(){var h=document.getElementById("dcHint"),p=h.previousElementSibling;if(!p)return "";if(p.querySelector&&p.querySelector("input")&&p.classList.contains("fld"))return p.querySelector("input").id;return p.id||"";})()');
  const refuse = async (id, v, expect, label, where) => { await clear(); await typeVal('orig', 100); await typeVal('pct', 20); await ctx.set(id, v); const dd = await read(); runs++; if (!dd.hint || dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push(label + ': hint [' + dd.hint + '] expected to contain [' + expect + '] and "ignored for now"'); const w = await under(); if (w !== (where || id)) fails.push(label + ': hint sits under ' + w + ' not ' + (where || id)); return dd; };
  await refuse('dcPct', '150', 'Percent off should be a percent from 0 to 100', 'pct 150'); await refuse('dcPct', '-5', 'Percent off should be a percent from 0 to 100', 'pct -5'); await refuse('dcOrig', '-5', 'Original price can’t be negative', 'orig -5');
  await refuse('dcFinal', 'abc', 'Couldn’t read “abc” in Final price — type a number like 84.', 'final abc'); await refuse('dcSave', '1e3', 'Couldn’t read “1e3” in You save', 'save 1e3'); await refuse('dcSave', '-1', 'You save can’t be negative', 'save -1'); await refuse('dcOrig', '99999999999999', 'Original price is too large', 'orig huge'); await refuse('dcOrig', '1,2', 'Couldn’t read', 'orig 1,2');
  await clear(); await typeVal('orig', 100); await typeVal('pct', 20); const before = await read(); for (const v of ['-', '.', '+', '-.']) { await ctx.set('dcPct', v); const dd = await read(); if (dd.big !== before.big || dd.hint) fails.push('partial "' + v + '" changed the result or showed a hint: ' + dd.big + ' ' + dd.hint); }
  const rowRefuse = async (kind, v, expect, label) => { await clear(); await typeVal('orig', 100); await typeVal('pct', 20); await ctx.click('dcRowAdd'); if (kind === 'amt') await ctx.set('dcRs1k', 'amt'); await ctx.set('dcRs1a', v); const dd = await read(); runs++; if (!dd.body) fails.push(label + ' hid the result'); if (dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push(label + ': hint [' + dd.hint + ']'); if ((await under()) !== 'dcRows') fails.push(label + ': hint not under the rows'); };
  await rowRefuse('pct', '101', '2nd discount should be a percent from 0 to 100', 'row pct 101'); await rowRefuse('pct', 'x', 'Couldn’t read “x” in 2nd discount — type a number like 15.', 'row pct junk'); await rowRefuse('amt', 'abc', 'Couldn’t read “abc” in 2nd discount — type a number like 10.', 'row amt junk'); await rowRefuse('amt', '-3', '2nd discount can’t be negative', 'row amt neg');
  await clear(); await advOpen(true); await ctx.click('dcOffAdd'); await ctx.set('dcOf1k', 'bxgy'); await ctx.set('dcOf1a', '2.5'); await ctx.set('dcOf1b', '1'); d = await read(); if (d.hint.indexOf('Offer 1 should be a whole number, 1 or more.') < 0 || !ign(d.hint)) fails.push('bxgy 2.5 hint [' + d.hint + ']'); if ((await under()) !== 'dcOffers') fails.push('offer hint not under the offers');
  for (const [id, v, expect] of [['dcQty', '0', 'Quantity should be a number above 0'], ['dcQty', 'abc', 'Couldn’t read “abc” in Quantity'], ['dcTax', '101', 'Sales tax / VAT should be a percent from 0 to 100'], ['dcTax', 'x', 'Couldn’t read “x” in Sales tax / VAT'], ['dcItems', '2.5', 'Items you buy should be a whole number, 1 or more.'], ['dcItems', '0', 'Items you buy should be a number above 0']]) {
    await clear(); await advOpen(true); await typeVal('orig', 100); await typeVal('pct', 20); await ctx.set(id, v); const dd = await read(); runs++;
    if (!dd.body) fails.push('bad advanced value ' + id + '=' + v + ' hid the result'); if (dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push('advanced hint ' + id + '=' + v + ' [' + dd.hint + ']'); await ctx.set(id, '');
  }
  const contra = async (typed, rows, expect, label) => { await clear(); await addRows(rows); for (const x of typed) await typeVal(x[0], x[1]); const dd = await read(); runs++; if (rows.length) { if (!dd.body) fails.push(label + ': the optional rows hid the result'); if (dd.hint.indexOf(expect) < 0 || dd.hint.indexOf('The extra discounts are ignored for now.') < 0) fails.push(label + ': hint [' + dd.hint + '] expected [' + expect + '] and the ignored note'); if ((await under()) !== 'dcRows') fails.push(label + ': hint not under the rows'); same(dd.n.rows, 'The extra discounts are not applied while they don’t fit.', label + ' rows note'); } else { if (dd.body) fails.push(label + ': shown as a result'); if (dd.hint.indexOf(expect) < 0) fails.push(label + ': hint [' + dd.hint + '] expected [' + expect + ']'); } };
  await contra([['orig', 100], ['final', 150]], [], 'After your extra discounts the final price can’t be higher than the original price', 'final > orig'); await contra([['orig', 100], ['save', 150]], [], 'You can’t save more than the original price', 'save > orig');
  await contra([['orig', 0], ['final', 5]], [], 'With an original price of 0 the percent off can’t be worked out', 'orig 0 final'); await contra([['pct', 100], ['final', 50]], [], '100% off leaves nothing', 'pct 100 final'); await contra([['pct', 0], ['save', 20]], [], 'A 0% first discount can’t show the original price', 'pct 0 save');
  await contra([['pct', 20], ['save', 5]], [{ k: 'amt', v: 10 }], 'The amount saved is less than the amounts off you added', 'save below the amounts off'); await contra([['orig', 50], ['pct', 10]], [{ k: 'amt', v: 100 }], 'The $100.00 off is more than the $45.00 left after the earlier discounts', 'amount over the price left');
  await contra([['orig', 100], ['final', 0]], [{ k: 'pct', v: 100 }], 'A 100% extra discount makes the final price zero', 'flat');
  /* zero price and 100% off */
  await clear(); await typeVal('orig', 0); await typeVal('pct', 20); d = await read(); runs++; same(d.tip, 'An original price of $0.00 leaves nothing to discount.', 'zero price sentence'); same(d.big, '$0.00', 'zero price headline'); if (d.barsVis || d.stepVis) fails.push('picture shown at a zero price');
  await clear(); await typeVal('orig', 80); await typeVal('pct', 100); d = await read(); runs++; same(d.tip, 'The discounts take the whole price off $80.00: you pay nothing.', '100% sentence'); same(d.box.final, '0', '100% final'); same(d.box.save, '80', '100% save');
  await clear(); await typeVal('orig', '$1,200.50'); await typeVal('pct', '25%'); d = await read(); runs++; same(d.box.final, '900.38', 'commas and symbols read: final'); same(d.big, '$900.38', 'commas headline');

  /* ---- 7. QA item 19: every field reacts, also with its prerequisite empty ---- */
  await clear(); await advOpen(true); const PRE = 'Type two of the four boxes above first — then this applies.';
  await ctx.set('dcTax', '8.5'); d = await read(); same(d.n.tax, PRE, 'tax without a pair'); await ctx.set('dcQty', '12'); d = await read(); same(d.n.qty, 'Type two of the four boxes above first — then the totals for 12 items appear.', 'quantity without a pair'); await ctx.set('dcQty', '1'); d = await read(); same(d.n.qty, 'Type two of the four boxes above first — then the totals for 1 item appear.', 'one item without a pair');
  await ctx.set('dcTax', ''); await ctx.set('dcQty', ''); d = await read(); same(d.n.qty, 'Buying more than one? Type how many and the totals appear.', 'quantity note empty'); same(d.n.tax, 'Tax is added on top of the final price. Type the rate to see what you pay.', 'tax note empty (added)');
  await ctx.seg('dcTaxMode', 'incl'); d = await read(); same(d.n.tax, 'The price already includes tax. Type the rate to see how much of it is tax.', 'tax note empty (included)'); await ctx.seg('dcTaxMode', 'add');
  await ctx.click('dcRowAdd'); d = await read(); same(d.n.rows, 'Type a percent or an amount for each extra discount.', 'rows note with an empty row'); await ctx.set('dcRs1a', '10'); d = await read(); same(d.n.rows, 'Type two of the four boxes above first — then the extra discounts apply.', 'rows note without a pair');
  await clear(); await advOpen(true); await typeVal('orig', 100); await typeVal('pct', 20); await ctx.set('dcQty', '5'); await ctx.set('dcTax', '10'); await advOpen(false); d = await read();
  if ((await ctx.eval('document.getElementById("dcQty").value + document.getElementById("dcTax").value')) !== '') fails.push('Go simple did not clear the extras'); if (d.step.length !== 3) fails.push('tax rows still counted after Go simple: ' + d.step.length);

  /* ---- 8. currencies: symbol and decimals follow the selector, nothing is converted ---- */
  for (const [cur, sym, dec] of [['EUR', '€', 2], ['GBP', '£', 2], ['JPY', '¥', 0], ['USD', '$', 2], ['CHF', 'CHF', 2], ['INR', '₹', 2], ['SEK', 'kr', 2], ['ILS', '₪', 2]]) {
    await clear(); await ctx.set('dcCur', cur); await typeVal('orig', 1234.5); await typeVal('pct', 20); d = await read(); runs++;
    const f = 1234.5 * 0.8, fmc = (x) => { let r = money(x, sym, dec); if (['EUR', 'SEK', 'ILS'].includes(cur)) r = r.replace(sym, '') + sym; return cur === 'CHF' ? r.replace('CHF', 'CHF ') : r; };
    const bigT = d.big.replace(/[\s  ]/g, ''), exp = fmc(f).replace(/[\s  ]/g, ''); if (bigT !== exp) fails.push('currency ' + cur + ' headline [' + d.big + '] expected [' + fmc(f) + ']');
    if (d.box.final !== plain(f, dec)) fails.push('currency ' + cur + ' computed final box [' + d.box.final + '] expected [' + plain(f, dec) + ']');
    if (d.u[0].indexOf(sym) !== 0) fails.push('currency ' + cur + ' label unit [' + d.u[0] + '] should start with ' + sym);
  }
  await ctx.set('dcCur', 'USD');
  await clear(); await typeVal('orig', 120); await typeVal('pct', 20); d = await read(); runs++;
  same(d.u.join('|'), '$ · before any discount|% · first discount|$ · calculated|$ · calculated', 'unit labels');
  return { runs, fails: fails.slice(0, 25), note: 'fuzzy ties ' + fuzzy + ' of ' + cmp + ' comparisons; skipped ' + skipped };
};
