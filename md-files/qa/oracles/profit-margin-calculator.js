/* ORACLE for profit-margin-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.salesEngine / marginEngine). The two typed values are solved as a 2x2 linear
   system in (cost c, revenue p) with Cramer's rule - cost: c = x; price: p = x; profit: p - c = x; margin g: p(1-g) - c = 0 - and the profit-and-loss steps, the what-if rows, the
   break-even and the margin ladder are recomputed here. Drives the real inputs and compares what the page DISPLAYS: boxes, headline, label, sub-line, sentence, from-line, bar key,
   step table, what-if table, ladder, break-even, every note - plus QA item 19 (every field reacts, prerequisite-empty cases), refusals, swaps, currencies, Clear fields. */
module.exports = async function (ctx) {
  let s = 20261109; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, fuzzy = 0, cmp = 0;
  const MINUS = '−';
  const rd = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const money = (x, sym, dec) => { if (x == null) return '—'; dec = dec == null ? 2 : dec; if (Math.abs(x) < Math.pow(10, -dec) / 2) x = 0; return (x < 0 ? MINUS : '') + sym + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  const pct = (x) => { if (x == null) return '—'; const r = rd(x, 2); return (r < 0 ? MINUS : '') + Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%'; };
  const pcn = (x) => { const r = rd(x, 2); return (r < 0 ? MINUS : '') + Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 2 }); };
  const plain = (x, dec) => { const r = rd(x, dec); return (r < 0 ? '-' : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: dec }); };
  const K = ['price', 'cost', 'profit', 'margin'], ID = { price: 'pmRev', cost: 'pmCogs', profit: 'pmProfit', margin: 'pmMargin' };
  const LAB = { price: 'Revenue', cost: 'Cost of goods sold', profit: 'Gross profit', margin: 'Gross margin' };
  const NM = { price: 'revenue', cost: 'cost of goods sold', profit: 'gross profit', margin: 'gross margin' };
  const AID = { opex: 'pmOpex', other: 'pmOther', fee: 'pmFee', int: 'pmInt', tax: 'pmTax' }, AK = Object.keys(AID);
  const same = (got, exp, tag) => {
    cmp++; if (got === exp) return true;
    const num = /-?\d[\d,]*\.?\d*/g, sk = (t) => t.replace(num, '#'), nu = (t) => (t.match(num) || []).map((x) => parseFloat(x.replace(/,/g, '')));
    if (sk(got) === sk(exp)) { const a = nu(got), b = nu(exp); if (a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 0.0101 * (Math.abs(b[i]) > 1e6 ? Math.abs(b[i]) / 1e6 : 1))) { fuzzy++; return true; } }
    fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false;
  };
  const orList = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1];
  /* the model: the two typed values as a 2x2 system */
  function model(typed) {
    const eq = (k, x) => k === 'cost' ? [1, 0, x] : k === 'price' ? [0, 1, x] : k === 'profit' ? [-1, 1, x] : [-1, 1 - x / 100, 0];
    const a = eq(typed[0][0], typed[0][1]), b = eq(typed[1][0], typed[1][1]), det = a[0] * b[1] - a[1] * b[0];
    if (Math.abs(det) < 1e-12) return null;
    let c = (a[2] * b[1] - a[1] * b[2]) / det, p = (a[0] * b[2] - a[2] * b[0]) / det;
    if (c < -1e-9 || p < -1e-9) return null;
    c = Math.max(0, c); p = Math.max(0, p); let pr = p - c; if (Math.abs(pr) < 1e-9 * Math.max(1, p, c)) pr = 0;
    const g = typed.find((x) => x[0] === 'margin');
    return { c, p, pr, mg: g ? g[1] : (p > 0 ? pr / p * 100 : null), mu: c > 0 ? pr / c * 100 : null };
  }
  /* profit and loss: written out step by step */
  function plFn(p, c, o) {
    const opex = o.opex || 0, other = o.other || 0, fee = o.fee || 0, it = o.int || 0, tx = o.tax || 0;
    const gp = p - c, fa = p * fee / 100, op = gp - opex - other - fa, pre = op - it, ta = pre > 0 ? pre * tx / 100 : 0, net = pre - ta;
    return { p, c, gp, fa, op, pre, ta, net, gm: p > 0 ? gp / p * 100 : null, om: p > 0 ? op / p * 100 : null, nm: p > 0 ? net / p * 100 : null };
  }
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};var v=function(i){return document.getElementById(i).value;};var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};var heads=function(i){return [].map.call(document.querySelectorAll("#"+i+" thead th"),function(c){return c.textContent;});};' +
    'return {box:{price:v("pmRev"),cost:v("pmCogs"),profit:v("pmProfit"),margin:v("pmMargin")},big:g("pmBig"),lab:g("pmLab"),sub:g("pmSub"),tip:g("pmTip"),from:g("pmFrom"),fromVis:vis("pmFrom"),body:vis("pmBody"),hint:vis("pmHint")?g("pmHint"):"",bars:g("pmBars"),barsVis:vis("pmBarsWrap"),pl:rows("pmPl"),plVis:vis("pmPlWrap"),wi:rows("pmWi"),wiHead:heads("pmWi"),wiVis:vis("pmWiWrap"),be:vis("pmBE")?g("pmBE"):"",lad:rows("pmLad"),ladHead:heads("pmLad"),ladNote:g("pmLadNote"),on:[].map.call(document.querySelectorAll("#pmLad tr.on"),function(r){return r.children[0].textContent;}),n:{opex:g("pmOpexNote"),other:g("pmOtherNote"),fee:g("pmFeeNote"),int:g("pmIntNote"),tax:g("pmTaxNote")},calc:[].map.call(document.querySelectorAll(".fld.pm-calc"),function(f){return f.querySelector("input").id;}),mlab:g("pmMLab"),mval:g("pmMVal"),u:[].map.call(document.querySelectorAll("#pmFields .fld .unit"),function(u){return u.textContent;}),au:[].map.call(document.querySelectorAll("#pmAdvIn .fld .unit"),function(u){return u.textContent;})};})())'));
  const advOpen = async (want) => { const o = (await ctx.eval('document.getElementById("pmAdvIn").style.display')) !== 'none'; if (o !== want) await ctx.click('pmAdvBtn'); };
  const clear = async () => { await ctx.fill(); for (const k of K) await ctx.set(ID[k], ''); };
  const typeVal = async (k, x) => ctx.set(ID[k], String(x));
  const MG = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];

  /* ---- 1. random pairs, with random extras ---- */
  const PAIRS = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== j) PAIRS.push([K[i], K[j]]);
  for (let i = 0; i < 330; i++) {
    const c0 = rd(0.5 + R() * 90000, 2), g0 = pick([-50, -20, -5, 2.5, 10, 12.5, 20, 25, 33, 40, 50, 60, 75, 90, 95]) + (R() < 0.3 ? 0.5 : 0);
    const p0 = c0 / (1 - g0 / 100), base = { cost: c0, price: rd(p0, 2), profit: rd(p0 - c0, 2), margin: g0 };
    if (Math.abs(base.profit) < 0.5 || base.price < 0.5) continue;
    const pair = pick(PAIRS), typed = pair.map((k) => [k, base[k]]), M = model(typed);
    if (!M) { fails.push('model could not solve ' + JSON.stringify(typed)); continue; }
    const adv = R() < 0.6; await clear();
    const o = { opex: null, other: null, fee: null, int: null, tax: null };
    if (adv) { await advOpen(true); if (R() < 0.6) o.opex = pick([1000, 2500.5, 10000, 50000]); if (R() < 0.5) o.other = pick([100, 250, 1000]); if (R() < 0.5) o.fee = pick([1.5, 2.9, 5, 30]); if (R() < 0.5) o.int = pick([50, 500, 2000]); if (R() < 0.5) o.tax = pick([7.5, 15, 25, 35]); }
    else await advOpen(false);
    for (const k of pair) await typeVal(k, base[k]);
    for (const k of AK) if (o[k] !== null) await ctx.set(AID[k], String(o[k]));
    runs++;
    const d = await read(), tag = JSON.stringify({ pair, typed: typed.map((x) => x[1]), o });
    if (!d.body) { fails.push('no result ' + tag + ' hint ' + d.hint); continue; }
    const sym = '$', fm = (x) => money(x, sym), val = { price: M.p, cost: M.c, profit: M.pr, margin: M.mg };
    const txt = { price: fm(M.p), cost: fm(M.c), profit: fm(M.pr), margin: pct(M.mg) };
    const any = AK.some((k) => o[k] !== null), P = plFn(M.p, M.c, o);
    K.forEach((k) => same(d.box[k], pair.indexOf(k) >= 0 ? String(base[k]) : plain(val[k], 2), 'box ' + k + ' ' + tag));
    const head = M.mg !== null ? 'margin' : 'profit';
    same(d.big, txt[head], 'headline ' + tag); same(d.lab, LAB[head], 'label ' + tag);
    same(d.sub, K.filter((k) => k !== head).map((k) => LAB[k] + ' ' + txt[k]).concat(['Markup ' + pct(M.mu)]).join(' · ') + (any ? ' · Net margin ' + pct(P.nm) : ''), 'sub ' + tag);
    same(d.from, 'From ' + NM[pair[0]] + ' and ' + NM[pair[1]] + '.', 'from ' + tag);
    let tip = M.pr > 0 ? 'Revenue of ' + fm(M.p) + ' against a cost of goods sold of ' + fm(M.c) + ' leaves a gross profit of ' + fm(M.pr) + ': a gross margin of ' + pct(M.mg) + ' and a markup of ' + pct(M.mu) + '.'
      : (M.pr === 0 ? 'Revenue of ' + fm(M.p) + ' just covers the cost of goods sold of ' + fm(M.c) + ': a gross margin of 0%.' : 'Revenue of ' + fm(M.p) + ' against a cost of goods sold of ' + fm(M.c) + ' is a gross loss of ' + fm(-M.pr) + ': a gross margin of ' + pct(M.mg) + ' and a markup of ' + pct(M.mu) + '.');
    if (any) tip += ' After the costs and tax you entered, the ' + (P.net < 0 ? 'net result is a loss of ' + fm(-P.net) : 'net profit is ' + fm(P.net)) + ': a net margin of ' + pct(P.nm) + '.';
    same(d.tip, tip, 'sentence ' + tag);
    same(d.mval, txt[head], 'floating bar value ' + tag); same(d.mlab, LAB[head], 'floating bar label ' + tag);
    const calcExp = K.filter((k) => pair.indexOf(k) < 0).map((k) => ID[k]).sort().join(','); if (d.calc.slice().sort().join(',') !== calcExp) fails.push('calculated marks ' + d.calc + ' expected ' + calcExp + ' ' + tag);
    /* the picture */
    if (!d.barsVis) fails.push('bars hidden ' + tag);
    else {
      const segs = [['Cost of goods sold', M.c]]; if (o.opex !== null) segs.push(['Operating expenses', o.opex]); if (o.other !== null || o.fee !== null) segs.push(['Other costs and fees', (o.other || 0) + P.fa]); if (o.int !== null) segs.push(['Interest', o.int]); if (o.tax !== null) segs.push(['Tax', P.ta]);
      const gain = any ? P.net : P.gp; if (gain > 0) segs.push([any ? 'Net profit' : 'Gross profit', gain]);
      let key = segs.filter((x) => x[1] > 0).map((x) => x[0] + ' ' + pct(x[1] / M.p * 100)).join(''); if (gain < 0) key += 'Revenue 100% ends here — the rest is a loss of ' + fm(-gain);
      same(d.bars.replace(/ /g, ''), key.replace(/ /g, ''), 'bar key ' + tag);
    }
    /* step table */
    const rows = []; const pr = (v) => pct(v / M.p * 100), add = (l, v) => rows.push([l, fm(v), pr(v)].join('|'));
    add('Revenue', M.p); add('Cost of goods sold', -M.c); add('Gross profit', P.gp);
    if (o.opex !== null) add('Operating expenses', -o.opex); if (o.other !== null) add('Other costs', -o.other); if (o.fee !== null) add('Fees ' + pcn(o.fee) + '%', -P.fa);
    if (o.opex !== null || o.other !== null || o.fee !== null) add('Operating profit', P.op);
    if (o.int !== null) add('Interest', -o.int); if (o.tax !== null) add('Tax ' + pcn(o.tax) + '%', -P.ta); if (any) add('Net profit', P.net);
    if (!d.plVis) fails.push('step table hidden ' + tag); else if (d.pl.length !== rows.length) fails.push('step rows ' + d.pl.length + ' vs ' + rows.length + ' ' + tag); else rows.forEach((r, q) => same(d.pl[q].join('|'), r, 'step row ' + q + ' ' + tag));
    /* what-if */
    if (!d.wiVis) fails.push('what-if hidden ' + tag);
    else {
      const wr = [['Today', M.p, M.c]].concat([10, 5, -5, -10].map((x) => ['Price ' + (x > 0 ? '+' : MINUS) + Math.abs(x) + '%', M.p * (1 + x / 100), M.c])).concat([10, 5, -5, -10].map((x) => ['Cost ' + (x > 0 ? '+' : MINUS) + Math.abs(x) + '%', M.p, M.c * (1 + x / 100)]));
      if (d.wiHead.join('|') !== 'If|Gross margin|Gross profit' + (any ? '|Net margin' : '')) fails.push('what-if head ' + d.wiHead.join('|') + ' ' + tag);
      if (d.wi.length !== wr.length) fails.push('what-if rows ' + d.wi.length + ' ' + tag);
      else wr.forEach((w, q) => { const r = plFn(w[1], w[2], o); same(d.wi[q].join('|'), [w[0], pct(r.gm), fm(r.gp)].concat(any ? [pct(r.nm)] : []).join('|'), 'what-if row ' + w[0] + ' ' + tag); });
    }
    /* break-even */
    const fixed = (o.opex || 0) + (o.other || 0) + (o.int || 0), ratio = 1 - M.c / M.p - (o.fee || 0) / 100;
    if (fixed > 0 && ratio > 1e-9) { const be = fixed / ratio; same(d.be, 'Break-even: your fixed costs (operating expenses, other costs and interest) are ' + fm(fixed) + '. If the cost of goods sold and fees grow with sales, you break even before tax at a revenue of ' + fm(be) + '. Your revenue is ' + pct(M.p / be * 100) + ' of that.', 'break-even ' + tag); }
    else if (d.be) fails.push('break-even shown without fixed costs or margin ' + tag + ' ' + d.be);
    /* ladder */
    const hasC = M.c > 0;
    if (d.ladHead.join('') !== (hasC ? 'MarginRevenue neededGross profitMarkup' : 'MarginMarkup')) fails.push('ladder head ' + d.ladHead.join('|') + ' ' + tag);
    if (d.lad.length !== MG.length) fails.push('ladder rows ' + d.lad.length + ' ' + tag);
    else MG.forEach((g, q) => { const pp = M.c / (1 - g / 100), mu = g / (100 - g) * 100; same(d.lad[q].join('|'), (hasC ? [g + '%', fm(pp), fm(pp - M.c), pct(mu)] : [g + '%', pct(mu)]).join('|'), 'ladder row ' + g + ' ' + tag); });
    /* notes */
    const of = (x) => ' — ' + pct(x / M.p * 100) + ' of revenue.';
    if (o.opex !== null) same(d.n.opex, 'Operating expenses of ' + fm(o.opex) + of(o.opex), 'opex note ' + tag);
    if (o.other !== null) same(d.n.other, 'Other costs of ' + fm(o.other) + of(o.other), 'other note ' + tag);
    if (o.fee !== null) same(d.n.fee, 'Fees of ' + pcn(o.fee) + '% of the revenue come to ' + fm(P.fa) + '.', 'fee note ' + tag);
    if (o.int !== null) same(d.n.int, 'Interest of ' + fm(o.int) + ' comes off before tax, leaving a profit before tax of ' + fm(P.pre) + '.', 'interest note ' + tag);
    if (o.tax !== null) same(d.n.tax, P.pre > 0 ? 'Tax of ' + pcn(o.tax) + '% on a profit before tax of ' + fm(P.pre) + ' is ' + fm(P.ta) + ', leaving a net profit of ' + fm(P.net) + '.' : 'There is no profit before tax, so no tax is due.', 'tax note ' + tag);
  }

  /* ---- 2. the margin ladder: a click on a row sets the margin ---- */
  for (let i = 0; i < 12; i++) {
    const c0 = rd(5 + R() * 9000, 2); await clear(); await advOpen(false); await typeVal('cost', c0); await typeVal('margin', pick([10, 25, 50]));
    const d = await read(), fm = (x) => money(x, '$');
    MG.forEach((g, q) => { const pp = c0 / (1 - g / 100), mu = g / (100 - g) * 100; same((d.lad[q] || []).join('|'), [g + '%', fm(pp), fm(pp - c0), pct(mu)].join('|'), 'margin ladder row ' + g); });
    const g = pick(MG); await ctx.eval('document.querySelectorAll("#pmLad tbody tr")[' + MG.indexOf(g) + '].click()');
    const d2 = await read(); runs++;
    same(d2.box.margin, String(g), 'ladder click sets the margin'); same(d2.from, 'From cost of goods sold and gross margin.', 'ladder click from-line'); same(d2.box.price, plain(c0 / (1 - g / 100), 2), 'ladder click revenue');
    if (d2.on.join() !== g + '%') fails.push('ladder highlight ' + d2.on + ' expected ' + g + '%');
  }

  /* ---- 3. a third value replaces the oldest; the cost of goods sold is never the one replaced ---- */
  for (let i = 0; i < 36; i++) {
    const c0 = rd(10 + R() * 5000, 2), g0 = pick([20, 40, 60]), p0 = c0 / (1 - g0 / 100), base = { cost: c0, price: rd(p0, 2), profit: rd(p0 - c0, 2), margin: g0 };
    const trio = pick([['cost', 'price', 'profit'], ['price', 'profit', 'cost'], ['profit', 'cost', 'price'], ['cost', 'price', 'margin'], ['price', 'cost', 'margin'], ['profit', 'price', 'margin'], ['margin', 'cost', 'profit']]); await clear(); await advOpen(false);
    for (const k of trio) await typeVal(k, base[k]); runs++;
    const pinned = trio[2] !== 'cost' && trio.indexOf('cost') >= 0 && trio.indexOf('cost') < 2, gone = pinned ? (trio[0] === 'cost' ? trio[1] : trio[0]) : trio[0], keep = trio.filter((x) => x !== gone);
    const d = await read(), M = model(keep.map((x) => [x, base[x]])), tag = JSON.stringify(trio);
    same(d.from, 'From ' + NM[keep[0]] + ' and ' + NM[keep[1]] + '. ' + (pinned ? 'The cost of goods sold stays, so ' : 'A third value replaces the oldest, so ') + NM[gone] + ' is now worked out.', 'third-value from-line ' + tag);
    if (M) same(d.box[gone], plain({ cost: M.c, price: M.p, profit: M.pr, margin: M.mg }[gone], 2), 'replaced box is now computed ' + tag);
  }
  let d;
  await clear(); await typeVal('cost', 100); await typeVal('price', 200); await typeVal('margin', 25); d = await read(); runs++;
  same(d.from, 'From cost of goods sold and gross margin. The cost of goods sold stays, so revenue is now worked out.', 'margin replaces revenue'); same(d.box.price, '133.33', 'price from cost + margin'); same(d.box.profit, '33.33', 'profit from cost + margin');
  await clear(); await typeVal('cost', 14.8); await typeVal('price', 18.3); await typeVal('profit', 5); d = await read(); runs++;
  same(d.box.cost, '14.8', 'profit edit keeps the cost'); same(d.box.price, '19.8', 'profit edit moves the revenue');
  /* clearing a field removes it from the pair */
  await clear(); await typeVal('cost', 100); await typeVal('margin', 25); await ctx.set('pmCogs', ''); d = await read(); runs++;
  same(d.box.price, '', 'revenue blank after clearing cost'); same(d.big, '33.33%', 'headline is the markup'); same(d.lab, 'Markup', 'label is Markup');
  same(d.from, 'You typed gross margin. The markup is worked out from it — add revenue, cost of goods sold or gross profit to get amounts.', 'lone margin from-line');
  same(d.sub, 'A 25% gross margin needs a 33.33% markup. Add revenue, cost of goods sold or gross profit to get amounts.', 'lone margin sub');
  same(d.tip, 'A 25% gross margin needs a 33.33% markup: the profit is 25% of the revenue but 33.33% of the cost of goods sold.', 'lone margin sentence');
  if (d.barsVis || d.plVis || d.wiVis) fails.push('picture, steps or what-if shown for a lone margin');
  if (d.lad.length !== MG.length || d.ladHead.join('') !== 'MarginMarkup') fails.push('lone margin ladder ' + d.ladHead.join('|')); if (d.on.join() !== '25%') fails.push('lone margin ladder highlight ' + d.on);
  await clear(); await typeVal('margin', -100); d = await read(); runs++; same(d.big, '−50%', 'lone -100 margin -> markup -50'); same(d.tip, 'A −100% gross margin needs a −50% markup: the profit is −100% of the revenue but −50% of the cost of goods sold.', 'lone -100 margin sentence');
  await clear(); await advOpen(true); await typeVal('price', 100); await typeVal('cost', 60); await ctx.set('pmOpex', '5'); await ctx.eval('document.getElementById("pmClear").click()'); d = await read(); runs++;
  if (d.body || d.big !== '—' || d.fromVis || d.hint || K.some((k) => d.box[k] !== '')) fails.push('Clear fields left something: ' + JSON.stringify([d.body, d.big, d.box])); if ((await ctx.eval('document.getElementById("pmOpex").value')) !== '') fails.push('Clear fields left the operating expenses box'); await advOpen(false);
  await clear(); d = await read(); if (d.body || d.big !== '—' || d.fromVis || d.hint) fails.push('start state not blank: ' + JSON.stringify([d.body, d.big, d.fromVis, d.hint])); same(d.sub, 'Type any two of revenue, cost of goods sold, gross profit or gross margin.', 'empty sub-line');
  for (const k of ['price', 'cost', 'profit']) { await clear(); await typeVal(k, 50); d = await read(); runs++; if (d.body || d.big !== '—') fails.push('lone ' + k + ' shows a result'); const rest = orList(K.filter((x) => x !== k).map((x) => NM[x])); same(d.sub, 'Type one more value: ' + rest + '.', 'lone ' + k + ' sub'); same(d.from, 'You typed ' + NM[k] + '. Type one more: ' + rest + '.', 'lone ' + k + ' from-line'); }

  /* ---- 4. refusals and junk: the pair stays valid, the hint sits under the field and says it is ignored ---- */
  const ign = (t) => /ignored for now/.test(t);
  const refuse = async (id, v, expect, label) => { await clear(); await typeVal('cost', 100); await typeVal('margin', 50); await ctx.set(id, v); const dd = await read(); runs++; if (!dd.hint || dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push(label + ': hint [' + dd.hint + '] expected to contain [' + expect + '] and "ignored for now"'); const where = await ctx.eval('(function(){var h=document.getElementById("pmHint"),p=h.previousElementSibling;return p&&p.querySelector("input")?p.querySelector("input").id:"";})()'); if (where !== id) fails.push(label + ': hint sits under ' + where + ' not ' + id); return dd; };
  await refuse('pmMargin', '100', 'Gross margin can’t reach 100%', 'margin 100'); await refuse('pmMargin', '150', 'Gross margin can’t reach 100%', 'margin 150');
  await refuse('pmCogs', '-5', 'Cost of goods sold can’t be negative', 'cost -5'); await refuse('pmRev', '-5', 'Revenue can’t be negative', 'revenue -5');
  await refuse('pmProfit', 'abc', 'Couldn’t read “abc” in Gross profit — type a number like 20000.', 'profit abc'); await refuse('pmCogs', '1e3', 'Couldn’t read “1e3” in Cost of goods sold', 'cost 1e3'); await refuse('pmRev', '5\'10', 'Couldn’t read', 'revenue 5 10');
  await refuse('pmRev', '1,2', 'Couldn’t read', 'revenue 1,2'); await refuse('pmProfit', '99999999999999', 'Gross profit is too large', 'profit huge');
  await clear(); await typeVal('cost', 100); await typeVal('margin', 50); const before = await read(); for (const v of ['-', '.', '+', '-.']) { await ctx.set('pmMargin', v); const dd = await read(); if (dd.big !== before.big || dd.hint) fails.push('partial "' + v + '" changed the result or showed a hint: ' + dd.big + ' ' + dd.hint); }
  await typeVal('margin', '-'); await typeVal('margin', '-2'); await typeVal('margin', '-25'); d = await read(); same(d.box.price, '80', 'margin -25 revenue'); same(d.tip, 'Revenue of $80.00 against a cost of goods sold of $100.00 is a gross loss of $20.00: a gross margin of −25% and a markup of −20%.', 'loss sentence');
  same(d.big, '−25%', 'loss headline: the margin');
  await clear(); await typeVal('cost', '$1,200.50'); await typeVal('margin', '25%'); d = await read(); runs++; same(d.box.price, '1,600.67', 'commas and symbols read: revenue'); same(d.big, '25%', 'commas headline is the margin');
  const contra = async (a, b, expect) => { await clear(); await typeVal(a[0], a[1]); await typeVal(b[0], b[1]); const dd = await read(); runs++; if (dd.body) fails.push('contradiction shown as a result ' + JSON.stringify([a, b])); if (dd.hint.indexOf(expect) < 0) fails.push('contradiction hint [' + dd.hint + '] expected [' + expect + '] ' + JSON.stringify([a, b])); };
  await contra(['cost', 50], ['profit', -80], 'A loss can’t be bigger than the cost of goods sold'); await contra(['price', 50], ['profit', 80], 'Gross profit can’t be more than the revenue');
  await contra(['profit', 20], ['margin', 0], 'A profit can’t come from a 0% margin'); await contra(['profit', 0], ['margin', 0], 'Zero profit at a 0% margin'); await contra(['profit', 20], ['margin', -10], 'A profit goes with a positive margin'); await contra(['profit', -20], ['margin', 10], 'A profit goes with a positive margin');
  await clear(); await typeVal('cost', 0); await typeVal('price', 80); d = await read(); runs++; same(d.tip, 'With no cost of goods sold the whole revenue of $80.00 is gross profit: a gross margin of 100%. A markup needs a cost above zero.', 'cost zero sentence'); same(d.box.margin, '100', 'cost zero margin 100'); same(d.big, '100%', 'cost zero headline'); same(d.sub, 'Revenue $80.00 · Cost of goods sold $0.00 · Gross profit $80.00 · Markup —', 'cost zero sub');
  await clear(); await typeVal('cost', 100); await typeVal('price', 0); d = await read(); runs++; same(d.tip, 'Revenue of $0.00 against a cost of goods sold of $100.00 is a gross loss of $100.00. A margin needs revenue above zero.', 'revenue zero sentence'); same(d.box.margin, '', 'revenue zero margin blank'); same(d.big, '−$100.00', 'revenue zero headline'); same(d.lab, 'Gross profit', 'revenue zero label'); same(d.sub, 'Revenue $0.00 · Cost of goods sold $100.00 · Gross margin — · Markup −100%', 'revenue zero sub');
  if (d.barsVis || d.plVis || d.wiVis) fails.push('picture shown at revenue zero');
  await clear(); await typeVal('cost', 100); await typeVal('price', 100); d = await read(); runs++; same(d.tip, 'Revenue of $100.00 just covers the cost of goods sold of $100.00: a gross margin of 0%.', 'break-even sentence'); same(d.box.margin, '0', 'break-even margin'); same(d.box.profit, '0', 'break-even profit');
  await clear(); await typeVal('cost', 0); await typeVal('price', 0); d = await read(); same(d.tip, 'Revenue and cost of goods sold are both zero, so there is no profit to measure.', 'both zero sentence');

  /* ---- 5. QA item 19: advanced fields react, also with their prerequisite empty ---- */
  await clear(); await advOpen(true);
  const PRE = 'Type two of the four boxes above first — then this applies.';
  for (const [id, key, v] of [['pmOpex', 'opex', '5000'], ['pmOther', 'other', '300'], ['pmFee', 'fee', '3'], ['pmInt', 'int', '200'], ['pmTax', 'tax', '25']]) { await ctx.set(id, v); d = await read(); same(d.n[key], PRE, key + ' without a pair'); await ctx.set(id, ''); }
  d = await read();
  same(d.n.opex, 'Rent, wages, advertising, software? Type the total for the same period as the revenue.', 'opex note empty'); same(d.n.other, 'Shipping, customer acquisition cost or other costs? Type the total for the same period.', 'other note empty');
  same(d.n.fee, 'Payment or platform fees, as a percent of the revenue? Type the rate.', 'fee note empty'); same(d.n.int, 'Interest on loans? Type the amount for the same period.', 'interest note empty'); same(d.n.tax, 'Income tax on the profit, as a percent? Type your rate.', 'tax note empty');
  for (const [id, v, expect] of [['pmOpex', '-5', 'Operating expenses can’t be negative'], ['pmOther', 'abc', 'Couldn’t read “abc” in Other costs'], ['pmFee', '101', 'Fees should be a percent from 0 to 100'], ['pmInt', '-1', 'Interest can’t be negative'], ['pmTax', 'x', 'Couldn’t read “x” in Tax rate'], ['pmTax', '-3', 'Tax rate should be a percent from 0 to 100']]) {
    await clear(); await advOpen(true); await typeVal('price', 50000); await typeVal('cost', 30000); await ctx.set(id, v); const dd = await read(); runs++;
    if (!dd.body) fails.push('bad advanced value ' + id + '=' + v + ' hid the result'); if (dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push('advanced hint ' + id + '=' + v + ' [' + dd.hint + ']');
    await ctx.set(id, '');
  }
  /* tax with no profit before tax; zero typed is typed */
  await clear(); await advOpen(true); await typeVal('price', 100); await typeVal('cost', 120); await ctx.set('pmTax', '25'); d = await read(); runs++; same(d.n.tax, 'There is no profit before tax, so no tax is due.', 'tax on a loss');
  await ctx.set('pmOpex', '0'); d = await read(); if (!d.plVis || d.pl.length !== 7) fails.push('opex 0 should add the operating rows; rows=' + d.pl.length);
  await clear(); await advOpen(true); await typeVal('price', 100); await typeVal('cost', 60); await ctx.set('pmOpex', '5'); await ctx.set('pmTax', '25'); await advOpen(false); d = await read();
  if (d.pl.length !== 3) fails.push('extras still counted after Go simple: ' + d.pl.length); if ((await ctx.eval('document.getElementById("pmOpex").value + document.getElementById("pmTax").value')) !== '') fails.push('Go simple did not clear the extras');

  /* ---- 6. currencies: symbol and decimals follow the selector, nothing is converted ---- */
  for (const [cur, sym, dec] of [['EUR', '€', 2], ['GBP', '£', 2], ['JPY', '¥', 0], ['USD', '$', 2], ['CHF', 'CHF', 2], ['INR', '₹', 2], ['SEK', 'kr', 2], ['ILS', '₪', 2]]) {
    await clear(); await advOpen(true); await ctx.set('pmCur', cur); await typeVal('cost', 1234.5); await typeVal('margin', 25); d = await read(); runs++;
    const p = 1234.5 / 0.75, fm = (x) => { let r = money(x, sym, dec); if (['EUR', 'SEK', 'ILS'].includes(cur)) r = r.replace(sym, '') + sym; return cur === 'CHF' ? r.replace('CHF', 'CHF ') : r; };
    const big = d.sub.split(' · ')[0].replace(/[\s  ]/g, ''), exp = ('Revenue' + fm(p)).replace(/[\s  ]/g, ''); if (big !== exp) fails.push('currency ' + cur + ' sub revenue [' + d.sub + '] expected [' + fm(p) + ']');
    if (d.box.price !== plain(p, dec)) fails.push('currency ' + cur + ' computed revenue box [' + d.box.price + '] expected [' + plain(p, dec) + ']');
    if (d.u[0].indexOf(sym) !== 0) fails.push('currency ' + cur + ' label unit [' + d.u[0] + '] should start with ' + sym);
    if (d.au[0].indexOf(sym) !== 0 || d.au[1].indexOf(sym) !== 0 || d.au[3].indexOf(sym) !== 0) fails.push('currency ' + cur + ' advanced label units ' + d.au.join('|'));
  }
  await ctx.set('pmCur', 'USD'); await advOpen(false);
  await clear(); await typeVal('price', 50000); await typeVal('cost', 30000); d = await read(); runs++;
  same(d.u.join('|'), '$ · what you sell for|$ · what it costs you|$ · calculated|% · calculated', 'unit labels');
  return { runs, fails: fails.slice(0, 25), note: 'fuzzy ties ' + fuzzy + ' of ' + cmp + ' comparisons' };
};
