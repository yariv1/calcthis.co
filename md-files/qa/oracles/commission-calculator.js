/* ORACLE for commission-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.commissionEngine / salesEngine). Tier commissions are summed slice by slice in a plain loop,
   the take-home chain and every note are rebuilt here, and the goal ("sales needed") is found by BISECTION on whole cents inside each tier (a different route from the page's algebra).
   Drives the real inputs (including the dynamic tier and extra-sale rows by id) and compares what the page DISPLAYS, plus QA item 19 (every field reacts, prerequisite-empty cases),
   refusals, swaps, currencies, Clear fields. */
module.exports = async function (ctx) {
  let s = 20261111; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, fuzzy = 0, cmp = 0, skipped = 0;
  const MINUS = '−';
  const rd = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const money = (x, sym, dec) => { if (x == null) return '—'; dec = dec == null ? 2 : dec; if (Math.abs(x) < Math.pow(10, -dec) / 2) x = 0; return (x < 0 ? MINUS : '') + sym + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  const pcn = (x) => { const r = rd(x, 2); return (r < 0 ? MINUS : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: 2 }); };
  const pct = (x) => x == null ? '—' : pcn(x) + '%';
  const plain = (x, dec) => { const r = rd(x, dec); return (r < 0 ? '-' : '') + Math.abs(r === 0 ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: dec }); };
  const qn = (x) => (Math.round(x * 1000) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
  const fm = (x) => money(x, '$');
  const same = (got, exp, tag) => {
    cmp++; if (got === exp) return true;
    const num = /-?\d[\d,]*\.?\d*/g, sk = (t) => t.replace(num, '#'), nu = (t) => (t.match(num) || []).map((x) => parseFloat(x.replace(/,/g, '')));
    if (sk(got) === sk(exp)) { const a = nu(got), b = nu(exp); if (a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 0.0101 * (Math.abs(b[i]) > 1e6 ? Math.abs(b[i]) / 1e6 : 1))) { fuzzy++; return true; } }
    fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false;
  };
  const orList = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1];
  const NM = { sales: 'sales', rate: 'commission rate', comm: 'commission' }, ID = { sales: 'cmSales', rate: 'cmRate', comm: 'cmComm' }, K = ['sales', 'rate', 'comm'];
  const PRE = 'Type your sales and commission plan above first — then this applies.';
  const MULTS = [0.5, 0.75, 1, 1.25, 1.5, 2], ITEMS = [1, 5, 10, 25, 50, 100];

  /* ---- the maths, written out plainly ---- */
  const grossM = (S, tiers) => { let prev = 0, g = 0; for (const t of tiers) { if (S > prev) g += t.k === 'pct' ? t.v / 100 * (Math.min(S, t.to) - prev) : t.v; prev = t.to; if (prev === Infinity) break; } return g; };
  const grossW = (S, tiers) => { if (!(S > 0)) return 0; let prev = 0; for (const t of tiers) { if (S > prev && S <= t.to) return t.k === 'pct' ? t.v / 100 * S : t.v; prev = t.to; } return null; };
  const lastTo = (tiers) => tiers[tiers.length - 1].to;
  const covered = (tiers, S) => !(S > lastTo(tiers));
  const gOf = (plan, S, tiers) => plan === 'tier' ? grossM(S, tiers) : grossW(S, tiers);
  const val = (t) => t.k === 'pct' ? pcn(t.v) + '%' : fm(t.v) + ' flat';
  const rngOf = (from, t) => t.to === Infinity ? 'above ' + fm(from) : (from === 0 ? 'up to ' + fm(t.to) : fm(from) + ' to ' + fm(t.to));
  const froms = (tiers) => { let p = 0; return tiers.map((t) => { const f = p; p = t.to; return f; }); };
  const chainOf = (G, o) => { const mine = G * o.share / 100, feeA = mine * o.fee / 100, net = mine - feeA - o.fix; return { mine, company: G - mine, feeA, net, total: o.base + net }; };
  /* smallest whole-cent sales that reach `need`, by bisection inside each tier */
  const needT = (plan, tiers, need) => {
    if (need <= 1e-12) return 0; let prev = 0;
    for (const t of tiers) {
      const lo = Math.round(prev * 100), hi = t.to === Infinity ? 1e14 : Math.round(t.to * 100), g = (c) => gOf(plan, c / 100, tiers);
      if (hi > lo && g(hi) >= need - 1e-9) { let a = lo + 1, b = hi; while (a < b) { const m = Math.floor((a + b) / 2); if (g(m) >= need - 1e-9) b = m; else a = m + 1; } return a / 100; }
      prev = t.to; if (prev === Infinity) break;
    }
    return null;
  };

  /* ---- what the page should show for a spec: { plan, S (total), box, rate, tiers, items, per, ex: [], o: {base,share,fee,fix}, typed: {base,share,fee,fix}, who, T } ---- */
  function model(sp) {
    const o = Object.assign({}, sp.o), plan = sp.plan; let G;
    if (plan === 'pct') G = sp.S * sp.rate / 100; else if (plan === 'item') G = sp.items * sp.per; else { if (!covered(sp.tiers, sp.S)) return { uncovered: true }; G = gOf(plan, sp.S, sp.tiers); }
    const mine0 = G * o.share / 100, avail = mine0 - mine0 * o.fee / 100; let fixIgnored = false; if (o.fix > avail + 1e-9) { fixIgnored = true; o.fix = 0; }
    const hasDed = o.share < 100 || o.fee > 0 || o.fix > 0, ch = chainOf(G, o), eff = sp.S > 0 ? G / sp.S * 100 : null;
    const M = { G, o, hasDed, ch, eff, fixIgnored, plan }; const S = sp.S;
    /* headline, sub, tip */
    const parts = []; if (plan !== 'item') parts.push('Sales ' + fm(S));
    if (plan === 'pct') parts.push('Rate ' + pct(sp.rate)); else if (plan === 'item') parts.push('Items ' + qn(sp.items) + ' · ' + fm(sp.per) + ' each'); else if (eff != null) parts.push('Effective rate ' + pct(eff));
    if (hasDed) parts.push('Take-home ' + fm(ch.net)); if (o.base > 0) parts.push('Total pay ' + fm(ch.total));
    M.sub = parts.join(' · ');
    let tip; const fr = sp.tiers ? froms(sp.tiers) : [];
    if (plan === 'pct') tip = 'A ' + pcn(sp.rate) + '% commission on ' + fm(S) + ' is ' + fm(G) + '.';
    else if (plan === 'tier') tip = S > 0 ? 'Your ' + fm(S) + ' of sales earns ' + fm(G) + ', an effective rate of ' + pct(eff) + '.' : 'No sales, no commission.';
    else if (plan === 'whole') { let ix = -1; sp.tiers.forEach((t, i) => { if (ix < 0 && S > fr[i] && S <= t.to) ix = i; }); tip = S > 0 ? 'At ' + fm(S) + ' you reach the tier ' + rngOf(fr[ix], sp.tiers[ix]) + ', so all sales earn ' + val(sp.tiers[ix]) + ': ' + fm(G) + '.' : 'No sales, no commission.'; M.ix = ix; }
    else tip = qn(sp.items) + (sp.items === 1 ? ' item' : ' items') + ' at ' + fm(sp.per) + ' each earn ' + fm(G) + '.';
    if (hasDed) tip += ' After your share, fees and deduction you take home ' + fm(ch.net) + '.';
    if (o.base > 0) tip += ' With ' + fm(o.base) + ' base pay your total pay is ' + fm(ch.total) + '.';
    M.tip = tip;
    /* bars */
    M.barsVis = false; M.bars = '';
    if (plan === 'tier' && S > 0) { M.barsVis = true; sp.tiers.forEach((t, i) => { if (S > fr[i]) { const c = t.k === 'pct' ? t.v / 100 * (Math.min(S, t.to) - fr[i]) : t.v; M.bars += 'Tier ' + (i + 1) + ' · ' + val(t) + ' · ' + fm(c); } }); }
    else if ((plan === 'pct' || plan === 'whole') && S > 0 && G <= S + 1e-9) {
      M.barsVis = true; const rest = S - G, ps = hasDed ? [['You take home', ch.net], ['Company or agent share', ch.company], ['Fees and deduction', ch.feeA + o.fix], ['The rest of the sale', rest]] : [['Your commission', G], ['The rest of the sale', rest]];
      ps.forEach((p) => { if (p[1] > 0) M.bars += p[0] + ' ' + pct(p[1] / S * 100); });
    }
    /* step table */
    const st = [];
    if (plan === 'item') { st.push(['Items sold', qn(sp.items)]); st.push(['Per item', fm(sp.per)]); }
    else {
      st.push(['Sales', fm(S)]);
      if (plan === 'pct') st.push(['Commission ' + pcn(sp.rate) + '%', fm(G)]);
      else if (plan === 'tier') sp.tiers.forEach((t, i) => { if (S > fr[i]) st.push([fm(fr[i]) + ' to ' + fm(Math.min(S, t.to)) + ' · ' + val(t), fm(t.k === 'pct' ? t.v / 100 * (Math.min(S, t.to) - fr[i]) : t.v)]); });
      else if (S > 0) st.push(['Tier reached (' + rngOf(fr[M.ix], sp.tiers[M.ix]) + ')', val(sp.tiers[M.ix])]);
    }
    if (plan !== 'pct') st.push(['Commission', fm(G)]);
    if (hasDed) { if (o.share < 100) st.push(['Your share ' + pcn(o.share) + '%', fm(ch.mine)]); if (o.fee > 0) st.push(['Fees ' + pcn(o.fee) + '%', MINUS + fm(ch.feeA)]); if (o.fix > 0) st.push(['Fixed deduction', MINUS + fm(o.fix)]); st.push(['Take-home commission', fm(ch.net)]); }
    if (o.base > 0) { st.push(['Base pay', '+' + fm(o.base)]); st.push(['Total pay', fm(ch.total)]); }
    M.step = st.map((r) => r.join('|'));
    /* ladder */
    M.lad = []; M.ladHead = '';
    if (plan === 'item') { M.ladHead = 'Items soldCommission' + (hasDed ? 'You take home' : ''); ITEMS.forEach((x) => { const Gx = x * sp.per; M.lad.push([qn(x), fm(Gx)].concat(hasDed ? [fm(chainOf(Gx, o).net)] : []).join('|')); }); M.on = ITEMS.indexOf(sp.items) >= 0 ? qn(sp.items) : ''; }
    else if (S > 0) {
      M.ladHead = 'SalesCommission' + (hasDed ? 'You take home' : '');
      MULTS.forEach((m) => { const Sx = S * m, Gx = plan === 'pct' ? Sx * sp.rate / 100 : (covered(sp.tiers, Sx) ? gOf(plan, Sx, sp.tiers) : null); M.lad.push([fm(Sx), fm(Gx)].concat(hasDed ? [Gx == null ? '—' : fm(chainOf(Gx, o).net)] : []).join('|')); });
      M.on = fm(S);
    }
    return M;
  }
  const goalText = (sp, M, T) => {
    const o = M.o, k = o.share / 100 * (1 - o.fee / 100); if (!(k > 1e-12)) return 'With a share of 0% or fees of 100% nothing is left, so this goal can’t be reached.';
    const Gn = (T - o.base + o.fix) / k; if (Gn <= 1e-12) return 'Nothing to sell: ' + fm(T) + ' is already covered by your base pay.';
    if (sp.plan === 'pct') { if (!(sp.rate > 0)) return 'A rate of 0% never reaches your goal — type a higher rate.'; const Sg = Math.ceil(Gn / (sp.rate / 100) * 100 - 1e-7) / 100; return 'To take home ' + fm(T) + ' you need sales of ' + fm(Sg) + '.' + (Sg > sp.S + 0.004 ? ' That is ' + fm(Sg - sp.S) + ' more than your sales now.' : ' You are already there.'); }
    if (sp.plan === 'item') { if (!(sp.per > 0)) return 'A commission of ' + fm(0) + ' per item never reaches your goal.'; const N = Math.ceil(Gn / sp.per - 1e-9); return 'To take home ' + fm(T) + ' you need to sell ' + qn(N) + (N === 1 ? ' item' : ' items') + '.'; }
    const Sn = needT(sp.plan, sp.tiers, Gn); return Sn === null ? 'These tiers can’t reach ' + fm(T) + ' — change the tiers or the goal.' : 'To take home ' + fm(T) + ' you need sales of ' + fm(Sn) + '.' + (Sn > sp.S + 0.004 ? ' That is ' + fm(Sn - sp.S) + ' more than your sales now.' : ' You are already there.');
  };
  const advNotes = (sp, M) => {
    const o = M.o, t = sp.typed || {}, ch = M.ch, n = {};
    n.base = !t.base ? 'Do you get a base pay on top? Type it and it is added to your total pay.' : 'Base pay ' + fm(o.base) + ' + commission after deductions ' + fm(ch.net) + ' = total pay ' + fm(ch.total) + '.';
    n.share = !t.share ? 'Split with a company or agent? Type your share of the commission — blank means 100%.' : 'You keep ' + fm(ch.mine) + ' of the ' + fm(M.G) + ' commission; the other ' + fm(ch.company) + ' goes to the company or agent.';
    n.fee = !t.fee ? 'Fees taken from your share of the commission, as a percent. Blank means none.' : 'Fees of ' + pcn(o.fee) + '% take ' + fm(ch.feeA) + ' from your ' + fm(ch.mine) + '.';
    n.fix = !t.fix ? 'A draw or a flat expense taken from your commission. Blank means none.' : (M.fixIgnored ? 'Your commission after fees is too small for this deduction.' : 'A fixed deduction of ' + fm(o.fix) + ' leaves you ' + fm(ch.net) + '.');
    n.who = sp.plan === 'item' ? '' : (sp.who === 'buyer' ? 'If the buyer pays: the buyer pays ' + fm(sp.S + M.G) + ' in total (' + fm(sp.S) + ' sale + ' + fm(M.G) + ' commission).' : 'If the seller pays: the seller keeps ' + fm(sp.S - M.G) + ' of the ' + fm(sp.S) + ' sale.');
    const ex = sp.ex || []; n.more = !ex.length ? 'Sold more than once? Add each sale here and they are added to the sales above.' : 'Total sales ' + fm(sp.S) + ' = ' + fm(sp.S - ex.reduce((a, b) => a + b, 0)) + ' + ' + fm(ex.reduce((a, b) => a + b, 0)) + ' from ' + ex.length + ' extra ' + (ex.length === 1 ? 'sale' : 'sales') + '.';
    return n;
  };

  /* ---- reading the page ---- */
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};var v=function(i){return document.getElementById(i).value;};var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();}).join("|");});};var heads=function(i){return [].map.call(document.querySelectorAll("#"+i+" thead th"),function(c){return c.textContent;}).join("");};' +
    'var hh=document.getElementById("cmHint"),pp=hh.previousElementSibling,under="";if(pp){under=pp.querySelector&&pp.querySelector("input")&&pp.classList.contains("fld")?pp.querySelector("input").id:(pp.id||"");}' +
    'return {box:{sales:v("cmSales"),rate:v("cmRate"),comm:v("cmComm")},big:g("cmBig"),lab:g("cmLab"),sub:g("cmSub"),tip:g("cmTip"),tipVis:vis("cmTip"),gtip:g("cmGoalTip"),gtipVis:vis("cmGoalTip"),from:g("cmFrom"),fromVis:vis("cmFrom"),body:vis("cmBody"),hint:vis("cmHint")?g("cmHint"):"",under:under,bars:g("cmBars"),barsVis:vis("cmBarsWrap"),step:rows("cmStep"),stepVis:vis("cmStepWrap"),lad:rows("cmLad"),ladHead:heads("cmLad"),ladVis:vis("cmLadWrap"),on:[].map.call(document.querySelectorAll("#cmLad tr.on"),function(r){return r.children[0].textContent;}),' +
    'n:{more:g("cmMoreNote"),base:g("cmBaseNote"),share:g("cmShareNote"),fee:g("cmFeeNote"),fix:g("cmFixNote"),who:g("cmWhoNote"),goal:g("cmGoalNote"),tier:g("cmTierNote")},calc:[].map.call(document.querySelectorAll(".fld.cm-calc"),function(f){return f.querySelector("input").id;}),mlab:g("cmMLab"),mval:g("cmMVal"),u:["cmSales","cmRate","cmComm"].map(function(i){return document.getElementById(i).closest(".fld").querySelector(".unit").textContent;}),heads:[].map.call(document.querySelectorAll("#cmTiers .cm-th"),function(c){return c.textContent;}),tierCount:document.querySelectorAll("#cmTiers .cm-tier").length,moreCount:document.querySelectorAll("#cmMore .cm-more").length,whoVis:vis("cmWhoFld"),moreVis:vis("cmMoreWrap"),salesVis:vis("cmSalesFld"),pctVis:vis("cmPctBox"),tierVis:vis("cmTierBox"),itemVis:vis("cmItemBox")};})())'));
  const advOpen = async (want) => { const o = (await ctx.eval('document.getElementById("cmAdvIn").style.display')) !== 'none'; if (o !== want) await ctx.click('cmAdvBtn'); };
  const clear = async () => { await ctx.fill(); for (const k of K) await ctx.set(ID[k], ''); };
  const typeVal = async (k, x) => ctx.set(ID[k], String(x));
  const setAdv = async (o, typed) => { for (const [f, id] of [['base', 'cmBase'], ['share', 'cmShare'], ['fee', 'cmFee'], ['fix', 'cmFix']]) if (typed[f]) await ctx.set(id, String(o[f])); };
  const addExtras = async (ex) => { let i = 0; for (const e of ex) { i++; await ctx.click('cmMoreAdd'); await ctx.set('cmMr' + i, String(e)); } };
  const setTiers = async (plan, tiers) => {
    await ctx.set('cmPlan', plan);
    for (let n = 3; n < tiers.length; n++) await ctx.click('cmTierAdd');
    for (let i = 0; i < tiers.length; i++) { const t = tiers[i], n = i + 1; if (t.k === 'amt') await ctx.seg('cmTr' + n + 'k', 'amt'); await ctx.set('cmTr' + n + 'u', t.to === Infinity ? '' : String(t.to)); await ctx.set('cmTr' + n + 'v', String(t.v)); }
  };
  const randOpt = () => { const o = { base: 0, share: 100, fee: 0, fix: 0 }, typed = {}; if (R() < 0.35) { o.base = pick([100, 500, 1250.5]); typed.base = true; } if (R() < 0.4) { o.share = pick([50, 60, 70, 75, 85, 100]); typed.share = true; } if (R() < 0.3) { o.fee = pick([1, 2, 5, 10]); typed.fee = true; } if (R() < 0.3) { o.fix = pick([10, 50, 100, 400, 20000]); typed.fix = true; } return { o, typed }; };

  /* the full comparison for one scenario that should show a result */
  function check(d, sp, M, tag) {
    if (!d.body) { fails.push('no result ' + tag + ' hint ' + d.hint); return false; }
    same(d.big, fm(M.G), 'headline ' + tag); same(d.lab, 'Commission', 'label ' + tag); same(d.sub, M.sub, 'sub ' + tag); same(d.tip, M.tip, 'sentence ' + tag);
    same(d.mval, fm(M.G), 'floating bar value ' + tag); same(d.mlab, 'Commission', 'floating bar label ' + tag);
    if (d.barsVis !== M.barsVis) fails.push('bars visible ' + d.barsVis + ' expected ' + M.barsVis + ' ' + tag); else if (M.barsVis) same(d.bars.replace(/ /g, ''), M.bars.replace(/ /g, ''), 'bar key ' + tag);
    if (!d.stepVis) fails.push('step table hidden ' + tag); else if (d.step.length !== M.step.length) fails.push('step rows ' + JSON.stringify(d.step) + ' vs ' + JSON.stringify(M.step) + ' ' + tag); else M.step.forEach((r, q) => same(d.step[q], r, 'step row ' + q + ' ' + tag));
    if (M.lad.length) {
      if (!d.ladVis) fails.push('ladder hidden ' + tag); else { if (d.ladHead !== M.ladHead) fails.push('ladder head ' + d.ladHead + ' vs ' + M.ladHead + ' ' + tag); if (d.lad.length !== M.lad.length) fails.push('ladder rows ' + d.lad.length + ' ' + tag); else M.lad.forEach((r, q) => same(d.lad[q], r, 'ladder row ' + q + ' ' + tag)); if (M.on && d.on.join() !== M.on) fails.push('ladder highlight ' + d.on + ' expected ' + M.on + ' ' + tag); }
    } else if (d.ladVis) fails.push('ladder shown without sales ' + tag);
    const n = advNotes(sp, M); same(d.n.base, n.base, 'base note ' + tag); same(d.n.share, n.share, 'share note ' + tag); same(d.n.fee, n.fee, 'fee note ' + tag); same(d.n.fix, n.fix, 'fix note ' + tag); same(d.n.who, n.who, 'who note ' + tag);
    if (sp.plan !== 'item') same(d.n.more, n.more, 'more note ' + tag);
    const wantHint = M.fixIgnored ? 'Your fixed deduction of ' + fm(sp.o.fix) + ' is more than your commission after fees (' + fm(M.G * sp.o.share / 100 * (1 - sp.o.fee / 100)) + '). It is ignored for now.' : '';
    same(d.hint, wantHint, 'hint ' + tag); if (wantHint && d.under !== 'cmFix') fails.push('fix hint under ' + d.under + ' ' + tag);
    return true;
  }

  /* ---- 1. percent plan: random pairs, extras, advanced settings, who pays ---- */
  const RATES = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 10, 12.5, 20], PAIRS = [['sales', 'rate'], ['sales', 'comm'], ['rate', 'comm'], ['comm', 'sales'], ['rate', 'sales'], ['comm', 'rate']];
  for (let i = 0; i < 260; i++) {
    const nEx = pick([0, 0, 0, 1, 2]), ex = []; for (let q = 0; q < nEx; q++) ex.push(pick([100, 500, 1000, 2500]));
    const St = rd(pick([200, 1000, 5000, 20000, 50000, 120000, 300000]) + 100 * Math.floor(R() * 40), 2), r = pick(RATES), b = rd(St - ex.reduce((a, c) => a + c, 0), 2);
    if (!(b > 0)) { skipped++; continue; }
    const G = rd(St * r / 100, 2); if (Math.abs(G - St * r / 100) > 1e-9) { skipped++; continue; }
    const { o, typed } = randOpt(), who = R() < 0.4 ? 'buyer' : 'seller', pair = pick(PAIRS), base = { sales: b, rate: r, comm: G };
    const sp = { plan: 'pct', S: St, rate: r, ex, o, typed, who }, M = model(sp);
    await clear(); const adv = nEx > 0 || Object.keys(typed).length > 0 || R() < 0.3; await advOpen(adv); await addExtras(ex); await setAdv(o, typed); await ctx.seg('cmWho', who);
    for (const k of pair) await typeVal(k, base[k]);
    runs++; const d = await read(), tag = JSON.stringify({ pair, base, ex, o, typed, who });
    if (!check(d, sp, M, tag)) continue;
    const vals = { sales: b, rate: r, comm: G }; K.forEach((k) => same(d.box[k], pair.indexOf(k) >= 0 ? String(base[k]) : plain(vals[k], 2), 'box ' + k + ' ' + tag));
    same(d.from, 'From ' + NM[pair[0]] + ' and ' + NM[pair[1]] + '.', 'from ' + tag);
    const calcExp = K.filter((k) => pair.indexOf(k) < 0).map((k) => ID[k]).sort().join(','); if (d.calc.slice().sort().join(',') !== calcExp) fails.push('calculated marks ' + d.calc + ' expected ' + calcExp + ' ' + tag);
  }

  /* ---- 2. tiered plans (each slice / whole sale), percent and flat tiers, extras, advanced settings ---- */
  for (let i = 0; i < 230; i++) {
    const plan = pick(['tier', 'whole']), n = pick([1, 2, 3, 4]), tiers = []; let lim = 0;
    for (let q = 0; q < n; q++) { lim += pick([1000, 5000, 10000, 20000]); const k = R() < 0.3 ? 'amt' : 'pct'; tiers.push({ to: q === n - 1 && R() < 0.6 ? Infinity : lim, k, v: k === 'pct' ? pick([1, 2, 3, 5, 7.5, 10, 15]) : pick([50, 100, 250, 500]) }); }
    const top = lastTo(tiers), cap = top === Infinity ? 90000 : top, ex = R() < 0.25 ? [pick([100, 500, 1000])] : [];
    const St = rd(R() < 0.15 ? cap : (R() < 0.15 ? tiers[0].to : (R() < 0.1 ? 0 : Math.ceil(R() * cap / 100) * 100)), 2), b = rd(St - ex.reduce((a, c) => a + c, 0), 2);
    if (b < 0) { skipped++; continue; }
    if (!isFinite(St)) { skipped++; continue; }
    const { o, typed } = randOpt(), who = R() < 0.4 ? 'buyer' : 'seller', sp = { plan, S: St, tiers, ex, o, typed, who }, M = model(sp);
    await clear(); await advOpen(true); await addExtras(ex); await setAdv(o, typed); await ctx.seg('cmWho', who); await setTiers(plan, tiers); await ctx.set('cmSales', String(b));
    runs++; const d = await read(), tag = JSON.stringify({ plan, St, b, tiers: tiers.map((t) => [t.to === Infinity ? 'inf' : t.to, t.k, t.v]), ex, o, typed, who });
    if (M.uncovered) { fails.push('uncovered scenario generated ' + tag); continue; }
    check(d, sp, M, tag);
    same(d.box.sales, String(b), 'sales box kept ' + tag); if (d.fromVis) fails.push('from-line shown in a tiered plan ' + tag);
  }
  /* tier header lines */
  await clear(); await setTiers('tier', [{ to: 20000, k: 'pct', v: 3 }, { to: 25000, k: 'pct', v: 5 }, { to: Infinity, k: 'pct', v: 10 }]); let d = await read(); runs++;
  same(d.heads.join('|'), 'Tier 1 · from $0.00|Tier 2 · from $20,000.00|Tier 3 · from $25,000.00', 'tier headers');
  await ctx.set('cmTr1u', ''); d = await read(); same(d.heads.join('|'), 'Tier 1 · from $0.00|Tier 2 · from the limit above|Tier 3 · from $25,000.00', 'tier headers with an empty limit');

  /* ---- 3. flat amount per item ---- */
  for (let i = 0; i < 70; i++) {
    const items = pick([1, 2, 5, 12, 40, 100, 250, 3.5]), per = pick([5, 12.5, 25, 99.99, 0]), { o, typed } = randOpt(), sp = { plan: 'item', items, per, o, typed, S: 0, who: 'seller' }, M = model(sp);
    await clear(); await advOpen(true); await setAdv(o, typed); await ctx.set('cmPlan', 'item'); await ctx.set('cmItems', String(items)); await ctx.set('cmPer', String(per));
    runs++; d = await read(); const tag = JSON.stringify({ items, per, o, typed });
    if (check(d, sp, M, tag)) { if (d.salesVis || d.moreVis || d.whoVis) fails.push('sales box / extra sales / who pays shown in the item plan ' + tag); }
  }
  await clear(); await ctx.set('cmPlan', 'item'); d = await read(); runs++; same(d.sub, 'Type the items sold and the commission per item.', 'item plan empty sub'); if (d.body || d.big !== '—') fails.push('item plan shows a result when empty');
  await ctx.set('cmItems', '5'); d = await read(); same(d.sub, 'Type the commission per item.', 'item plan items only'); await ctx.set('cmItems', ''); await ctx.set('cmPer', '5'); d = await read(); same(d.sub, 'Type the items sold.', 'item plan per only');

  /* ---- 4. goal: sales / items needed (found by bisection in the oracle) ---- */
  for (let i = 0; i < 120; i++) {
    const kind = pick(['pct', 'pct', 'tier', 'whole', 'item']), { o, typed } = randOpt(); let sp, setup;
    const T = pick([500, 1000, 2500, 5000, 12000, 40000, 250]);
    if (kind === 'pct') { const St = pick([10000, 50000, 200000]), r = pick(RATES); sp = { plan: 'pct', S: St, rate: r, ex: [], o, typed, who: 'seller' }; setup = async () => { await typeVal('sales', St); await typeVal('rate', r); }; }
    else if (kind === 'item') { const items = pick([1, 10, 50]), per = pick([5, 25, 80]); sp = { plan: 'item', items, per, o, typed, S: 0, who: 'seller' }; setup = async () => { await ctx.set('cmPlan', 'item'); await ctx.set('cmItems', String(items)); await ctx.set('cmPer', String(per)); }; }
    else {
      const n = pick([2, 3, 4]), tiers = []; let lim = 0; for (let q = 0; q < n; q++) { lim += pick([5000, 10000, 20000]); const k = R() < 0.3 ? 'amt' : 'pct'; tiers.push({ to: q === n - 1 && R() < 0.7 ? Infinity : lim, k, v: k === 'pct' ? pick([2, 3, 5, 10]) : pick([100, 300]) }); }
      const St = pick([0, 1000, 8000, 15000]); sp = { plan: kind, S: St, tiers, ex: [], o, typed, who: 'seller' }; setup = async () => { await setTiers(kind, tiers); await ctx.set('cmSales', String(St)); };
    }
    const M = model(sp); if (M.uncovered) { skipped++; continue; }
    await clear(); await advOpen(true); await setAdv(o, typed); await setup(); await ctx.set('cmGoal', String(T)); runs++;
    d = await read(); const tag = JSON.stringify({ kind, T, sp: Object.assign({}, sp, { tiers: sp.tiers && sp.tiers.map((t) => [t.to === Infinity ? 'inf' : t.to, t.k, t.v]) }) }), want = goalText(sp, M, T);
    same(d.n.goal, want, 'goal note ' + tag); if (!d.body) fails.push('goal hid the result ' + tag); else same(d.gtip, want, 'goal sentence ' + tag);
  }
  /* goal prerequisites and notes */
  await clear(); await advOpen(true); d = await read(); runs++; same(d.n.goal, 'Want a target? Type what you want to take home and the sales needed appear.', 'goal note empty');
  await ctx.set('cmGoal', '5000'); d = await read(); same(d.n.goal, 'Type the commission rate first — then the sales needed appear.', 'goal without a rate'); if (d.gtipVis) fails.push('goal sentence shown without a result');
  await typeVal('rate', 3); d = await read(); same(d.n.goal, 'To take home $5,000.00 you need sales of $166,666.67.', 'goal from the typed rate only');
  await typeVal('sales', 50000); d = await read(); same(d.n.goal, 'To take home $5,000.00 you need sales of $166,666.67. That is $116,666.67 more than your sales now.', 'goal with sales'); same(d.gtip, d.n.goal, 'goal sentence');
  await ctx.set('cmGoal', '1000'); d = await read(); same(d.n.goal, 'To take home $1,000.00 you need sales of $33,333.34. You are already there.', 'goal already reached');
  await ctx.set('cmShare', '0'); d = await read(); same(d.n.goal, 'With a share of 0% or fees of 100% nothing is left, so this goal can’t be reached.', 'goal with a 0% share'); await ctx.set('cmShare', '');
  await ctx.set('cmRate', '0'); d = await read(); same(d.n.goal, 'A rate of 0% never reaches your goal — type a higher rate.', 'goal with a 0% rate');
  await clear(); await advOpen(true); await ctx.set('cmGoal', '800'); await ctx.set('cmBase', '1000'); await typeVal('sales', 1000); await typeVal('rate', 5); d = await read(); same(d.n.goal, 'Nothing to sell: $800.00 is already covered by your base pay.', 'goal covered by base pay');
  await clear(); await ctx.set('cmPlan', 'tier'); await ctx.set('cmGoal', '5000'); d = await read(); runs++; same(d.n.goal, 'Add your tiers first — then the sales needed appear.', 'goal without tiers');
  await setTiers('tier', [{ to: 20000, k: 'pct', v: 3 }, { to: 25000, k: 'pct', v: 5 }]); d = await read(); same(d.n.goal, 'These tiers can’t reach $5,000.00 — change the tiers or the goal.', 'goal beyond the tiers');
  await clear(); await ctx.set('cmPlan', 'item'); d = await read(); same(d.n.goal, 'Want a target? Type what you want to take home and the items needed appear.', 'goal note item empty'); await ctx.set('cmGoal', '5000'); d = await read(); same(d.n.goal, 'Type the commission per item first — then the items needed appear.', 'goal item without per');
  await ctx.set('cmPer', '0'); d = await read(); same(d.n.goal, 'A commission of $0.00 per item never reaches your goal.', 'goal item per 0');

  /* ---- 5. the ladder: a click on a row sets the sales ---- */
  for (let i = 0; i < 12; i++) {
    const St = pick([2000, 10000, 40000]), plan = pick(['pct', 'pct', 'tier']); await clear();
    if (plan === 'pct') { await typeVal('sales', St); await typeVal('rate', 5); } else { await setTiers('tier', [{ to: 5000, k: 'pct', v: 2 }, { to: Infinity, k: 'pct', v: 4 }]); await ctx.set('cmSales', String(St)); }
    const q = pick([0, 1, 3, 4, 5]); await ctx.eval('document.querySelectorAll("#cmLad tbody tr")[' + q + '].click()'); const d2 = await read(); runs++;
    same(d2.box.sales, String(St * MULTS[q]), 'ladder click sets the sales ' + plan); if (plan === 'pct') same(d2.from, 'From commission rate and sales.', 'ladder click from-line');
    if (d2.on.join() !== fm(St * MULTS[q])) fails.push('ladder highlight ' + d2.on + ' expected ' + fm(St * MULTS[q]));
  }
  await clear(); await ctx.set('cmPlan', 'item'); await ctx.set('cmItems', '3'); await ctx.set('cmPer', '20'); await ctx.eval('document.querySelectorAll("#cmLad tbody tr")[3].click()'); d = await read(); runs++; same(d.box.sales === '' ? await ctx.eval('document.getElementById("cmItems").value') : 'x', '25', 'ladder click sets the items'); same(d.big, '$500.00', 'item ladder click headline');

  /* ---- 6. a third value replaces the oldest; the sales are never the one replaced ---- */
  for (let i = 0; i < 36; i++) {
    const St = pick([5000, 20000, 80000]), r = pick([2, 3, 5, 10]), base = { sales: St, rate: r, comm: St * r / 100 };
    const trio = pick([['sales', 'rate', 'comm'], ['rate', 'comm', 'sales'], ['comm', 'sales', 'rate'], ['sales', 'comm', 'rate'], ['rate', 'sales', 'comm'], ['comm', 'rate', 'sales']]); await clear(); await advOpen(false);
    for (const k of trio) await typeVal(k, base[k]); runs++;
    const pinned = trio[2] !== 'sales' && trio.indexOf('sales') >= 0 && trio.indexOf('sales') < 2, gone = pinned ? (trio[0] === 'sales' ? trio[1] : trio[0]) : trio[0], keep = trio.filter((x) => x !== gone), d3 = await read(), tag = JSON.stringify(trio);
    same(d3.from, 'From ' + NM[keep[0]] + ' and ' + NM[keep[1]] + '. ' + (pinned ? 'The sales stay, so ' : 'A third value replaces the oldest, so ') + NM[gone] + ' is now worked out.', 'third-value from-line ' + tag);
    same(d3.box[gone], plain(base[gone], 2), 'replaced box is now computed ' + tag);
  }
  /* ---- 7. lone values, nothing typed, Clear fields, Go simple ---- */
  await clear(); d = await read(); if (d.body || d.big !== '—' || d.fromVis || d.hint) fails.push('start state not blank: ' + JSON.stringify([d.body, d.big, d.fromVis, d.hint])); same(d.sub, 'Type any two of sales, commission rate and commission.', 'empty sub-line');
  for (const k of K) { await clear(); await typeVal(k, 3); d = await read(); runs++; if (d.body || d.big !== '—') fails.push('lone ' + k + ' shows a result'); const rest = orList(K.filter((x) => x !== k).map((x) => NM[x])); same(d.sub, 'Type one more value: ' + rest + '.', 'lone ' + k + ' sub'); same(d.from, 'You typed ' + NM[k] + '. Type one more: ' + rest + '.', 'lone ' + k + ' from-line'); }
  await clear(); await advOpen(true); await typeVal('sales', 100); await typeVal('rate', 5); await addExtras([50]); await ctx.set('cmBase', '10'); await ctx.set('cmShare', '50'); await ctx.set('cmFee', '5'); await ctx.set('cmFix', '1'); await ctx.set('cmGoal', '99'); await ctx.click('cmClear'); d = await read(); runs++;
  if (d.body || d.big !== '—' || d.fromVis || d.hint || K.some((k) => d.box[k] !== '') || d.moreCount) fails.push('Clear fields left something: ' + JSON.stringify([d.body, d.big, d.box, d.moreCount]));
  if ((await ctx.eval('["cmBase","cmShare","cmFee","cmFix","cmGoal"].map(function(i){return document.getElementById(i).value;}).join("")')) !== '') fails.push('Clear fields left the advanced fields');
  await clear(); await advOpen(true); await typeVal('sales', 100); await typeVal('rate', 5); await ctx.set('cmBase', '10'); await ctx.set('cmShare', '50'); await addExtras([50]); await advOpen(false); d = await read(); runs++;
  if ((await ctx.eval('["cmBase","cmShare"].map(function(i){return document.getElementById(i).value;}).join("")')) !== '' || d.moreCount) fails.push('Go simple did not clear the extras'); same(d.big, '$5.00', 'headline after Go simple');
  /* plan switches keep the right controls visible */
  await clear(); for (const [p, a, b, c] of [['tier', 0, 1, 0], ['whole', 0, 1, 0], ['item', 0, 0, 1], ['pct', 1, 0, 0]]) { await ctx.set('cmPlan', p); const dd = await read(); runs++; if (dd.pctVis !== !!a || dd.tierVis !== !!b || dd.itemVis !== !!c) fails.push('plan ' + p + ' shows pct ' + dd.pctVis + ' tier ' + dd.tierVis + ' item ' + dd.itemVis); if (dd.salesVis !== (p !== 'item')) fails.push('plan ' + p + ' sales box visible ' + dd.salesVis); }

  /* ---- 8. refusals and junk: the plan stays valid, the hint sits under the field and says it is ignored ---- */
  const ign = (t) => /ignored for now/.test(t);
  const refuse = async (id, v, expect, label, where, body) => { await clear(); await typeVal('sales', 50000); await typeVal('rate', 3); await ctx.set(id, v); const dd = await read(); runs++; if (!dd.hint || dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push(label + ': hint [' + dd.hint + '] expected to contain [' + expect + '] and "ignored for now"'); if (dd.under !== (where || id)) fails.push(label + ': hint sits under ' + dd.under + ' not ' + (where || id)); if (body && !dd.body) fails.push(label + ' hid the result'); return dd; };
  await refuse('cmRate', '150', 'Commission rate should be a percent from 0 to 100', 'rate 150'); await refuse('cmRate', '-5', 'Commission rate should be a percent from 0 to 100', 'rate -5'); await refuse('cmSales', '-5', 'Sales can’t be negative', 'sales -5');
  await refuse('cmComm', 'abc', 'Couldn’t read “abc” in Commission — type a number like 1500.', 'comm abc', null, true); await refuse('cmComm', '1e3', 'Couldn’t read “1e3” in Commission', 'comm 1e3', null, true); await refuse('cmComm', '-1', 'Commission can’t be negative', 'comm -1', null, true); await refuse('cmSales', '99999999999999', 'Sales is too large', 'sales huge'); await refuse('cmSales', '1,2', 'Couldn’t read', 'sales 1,2');
  await clear(); await typeVal('sales', 50000); await typeVal('rate', 3); const before = await read(); for (const v of ['-', '.', '+', '-.']) { await ctx.set('cmRate', v); const dd = await read(); if (dd.big !== before.big || dd.hint) fails.push('partial "' + v + '" changed the result or showed a hint: ' + dd.big + ' ' + dd.hint); }
  const contra = async (typed, expect, label, where) => { await clear(); for (const x of typed) await typeVal(x[0], x[1]); const dd = await read(); runs++; if (dd.body) fails.push(label + ': shown as a result'); if (dd.hint.indexOf(expect) < 0) fails.push(label + ': hint [' + dd.hint + '] expected [' + expect + ']'); if (dd.under !== where) fails.push(label + ': hint under ' + dd.under + ' not ' + where); };
  await contra([['sales', 0], ['comm', 5]], 'With sales of 0 the commission rate can’t be worked out', 'sales 0 comm', 'cmSales'); await contra([['sales', 100], ['comm', 200]], 'The commission can’t be more than the sales — lower it.', 'comm > sales', 'cmComm');
  await contra([['rate', 0], ['comm', 5]], 'A commission rate of 0% can’t show the sales — type the sales instead.', 'rate 0 comm', 'cmRate'); await contra([['rate', 0], ['comm', 0]], 'A commission rate of 0% can’t show the sales', 'rate 0 comm 0', 'cmRate');
  /* extra sales larger than the total the values give: ignored with a hint */
  await clear(); await advOpen(true); await typeVal('rate', 3); await typeVal('comm', 300); await addExtras([15000]); d = await read(); runs++;
  same(d.hint, 'The extra sales are more than the total sales these values give. They are ignored for now.', 'extras over'); if (d.under !== 'cmMore') fails.push('extras hint under ' + d.under); if (!d.body) fails.push('extras over hid the result'); same(d.box.sales, '10000', 'extras ignored: sales box'); same(d.n.more, 'The extra sales are not applied while they don’t fit.', 'extras over note');
  /* zero sales, 100% rate, big values */
  await clear(); await typeVal('sales', 0); await typeVal('rate', 3); d = await read(); runs++; same(d.tip, 'A 3% commission on $0.00 is $0.00.', 'zero sales sentence'); same(d.big, '$0.00', 'zero sales headline'); if (d.barsVis || d.ladVis) fails.push('picture or ladder shown at zero sales');
  await clear(); await typeVal('sales', 80); await typeVal('rate', 100); d = await read(); runs++; same(d.big, '$80.00', '100% headline'); same(d.bars.replace(/ /g, ''), 'Yourcommission100%', '100% bar');
  await clear(); await typeVal('sales', '$1,200.50'); await typeVal('rate', '2.5%'); d = await read(); runs++; same(d.box.comm, '30.01', 'commas and symbols read: commission'); same(d.big, '$30.01', 'commas headline');
  /* tier errors: the result ends, the hint sits under the tiers */
  const tierErr = async (rows, sales, expect, label) => { await clear(); await ctx.set('cmPlan', 'tier'); for (let n = 3; n < rows.length; n++) await ctx.click('cmTierAdd'); for (let i = 0; i < rows.length; i++) { const r = rows[i], n = i + 1; if (r.k === 'amt') await ctx.seg('cmTr' + n + 'k', 'amt'); await ctx.set('cmTr' + n + 'u', r.u); await ctx.set('cmTr' + n + 'v', r.v); } if (sales !== null) await ctx.set('cmSales', String(sales)); const dd = await read(); runs++; if (dd.body) fails.push(label + ': shown as a result'); same(dd.hint, expect, label + ' hint'); if (dd.under !== 'cmTiers') fails.push(label + ': hint under ' + dd.under); };
  await tierErr([{ u: '20000', v: '' }, { u: '', v: '' }], 5000, 'Tier 1 needs a rate or an amount.', 'tier value missing');
  await tierErr([{ u: '20000', v: '150' }, { u: '', v: '' }], 5000, 'Tier 1 rate should be a percent from 0 to 100.', 'tier rate 150'); await tierErr([{ u: '20000', v: 'x' }, { u: '', v: '' }], 5000, 'Couldn’t read “x” in Tier 1 rate — type a number like 3.', 'tier rate junk');
  await tierErr([{ k: 'amt', u: '20000', v: '-3' }, { u: '', v: '' }], 5000, 'Tier 1 amount can’t be negative — type 0 or more.', 'tier amount negative'); await tierErr([{ u: '-5', v: '3' }, { u: '', v: '' }], 5000, 'Tier 1 limit can’t be negative — type 0 or more.', 'tier limit negative');
  await tierErr([{ u: '20000', v: '3' }, { u: '10000', v: '5' }], 5000, 'Tier 2 must go up to more than $20,000.00 (the limit of the tier before it).', 'tier order'); await tierErr([{ u: '0', v: '3' }, { u: '', v: '5' }], 5000, 'Tier 1 must go up to more than $0.00.', 'tier limit zero');
  await tierErr([{ u: '', v: '3' }, { u: '25000', v: '5' }], 5000, 'Tier 1 has no upper limit, so it must be the last tier — type an upper limit or remove the tiers after it.', 'tier no limit not last');
  await tierErr([{ u: '20000', v: '3' }, { u: '', v: '' }], 30000, 'Your sales of $30,000.00 are above the last tier’s limit of $20,000.00, and no tier covers the rest — leave the last “up to” empty or add a tier.', 'sales above the last tier');
  await clear(); await setTiers('tier', [{ to: 20000, k: 'pct', v: 3 }, { to: Infinity, k: 'pct', v: 5 }]); d = await read(); runs++; same(d.sub, 'Type your sales to see the commission.', 'tiers without sales');
  await clear(); await ctx.set('cmPlan', 'tier'); await ctx.set('cmSales', '5000'); d = await read(); runs++; same(d.sub, 'Add at least one tier: type an upper limit and a rate.', 'sales without tiers'); same(d.n.tier, 'Type an upper limit and a rate for each tier. Leave the last “up to” empty for no limit.', 'tier note without tiers');
  await ctx.set('cmTr1u', '20000'); await ctx.set('cmTr1v', '3'); d = await read(); same(d.n.tier, 'Each tier pays on the part of your sales inside it. Leave the last “up to” empty for no limit.', 'tier note (each slice)'); await ctx.set('cmPlan', 'whole'); d = await read(); same(d.n.tier, 'The tier your total sales reach decides the rate for all sales. Leave the last “up to” empty for no limit.', 'tier note (whole sale)');
  await ctx.set('cmSales', 'abc'); d = await read(); same(d.hint, 'Couldn’t read “abc” in Sales — type a number like 50000. It is ignored for now.', 'tier plan junk sales'); if (d.under !== 'cmSales') fails.push('sales hint under ' + d.under);
  /* item errors */
  const itemErr = async (id, v, expect, label) => { await clear(); await ctx.set('cmPlan', 'item'); await ctx.set('cmItems', '5'); await ctx.set('cmPer', '10'); await ctx.set(id, v); const dd = await read(); runs++; same(dd.hint, expect, label + ' hint'); if (dd.under !== id) fails.push(label + ': hint under ' + dd.under); if (dd.body) fails.push(label + ' shows a result'); };
  await itemErr('cmItems', '0', 'Items sold should be a number above 0 and up to 1,000,000,000.', 'items 0'); await itemErr('cmItems', 'abc', 'Couldn’t read “abc” in Items sold — type a number like 12.', 'items abc'); await itemErr('cmPer', '-1', 'Commission per item can’t be negative — type 0 or more.', 'per -1'); await itemErr('cmPer', 'x', 'Couldn’t read “x” in Commission per item — type a number like 25.', 'per x');
  /* advanced fields: a bad value is ignored with a hint under it, the result stays */
  for (const [id, v, expect] of [['cmBase', 'abc', 'Couldn’t read “abc” in Base pay — type a number like 500.'], ['cmBase', '-5', 'Base pay can’t be negative'], ['cmShare', '101', 'Your share should be a percent from 0 to 100.'], ['cmShare', 'x', 'Couldn’t read “x” in Your share'], ['cmFee', '-1', 'Fees should be a percent from 0 to 100.'], ['cmFee', '101', 'Fees should be a percent from 0 to 100.'], ['cmFix', '-5', 'Fixed deduction can’t be negative'], ['cmFix', 'x', 'Couldn’t read “x” in Fixed deduction'], ['cmGoal', 'x', 'Couldn’t read “x” in Take-home goal'], ['cmGoal', '-3', 'Take-home goal can’t be negative']]) {
    await clear(); await advOpen(true); await typeVal('sales', 50000); await typeVal('rate', 3); await ctx.set(id, v); const dd = await read(); runs++;
    if (!dd.body) fails.push('bad advanced value ' + id + '=' + v + ' hid the result'); if (dd.hint.indexOf(expect) < 0 || !ign(dd.hint)) fails.push('advanced hint ' + id + '=' + v + ' [' + dd.hint + ']'); if (dd.under !== id) fails.push('advanced hint ' + id + ' sits under ' + dd.under); same(dd.big, '$1,500.00', 'headline with bad ' + id); await ctx.set(id, '');
  }
  await clear(); await advOpen(true); await typeVal('sales', 1000); await typeVal('rate', 5); await ctx.set('cmFix', '60'); d = await read(); runs++; same(d.hint, 'Your fixed deduction of $60.00 is more than your commission after fees ($50.00). It is ignored for now.', 'fixed deduction too big'); if (!d.body) fails.push('fix too big hid the result'); same(d.n.fix, 'Your commission after fees is too small for this deduction.', 'fix too big note');
  /* extra sale row problems */
  await clear(); await advOpen(true); await typeVal('sales', 1000); await typeVal('rate', 5); await ctx.click('cmMoreAdd'); d = await read(); runs++; same(d.n.more, 'Type an amount for each extra sale.', 'extra row empty'); await ctx.set('cmMr1', 'abc'); d = await read(); same(d.hint, 'Couldn’t read “abc” in Extra sale 1 — type a number like 10000. It is ignored for now.', 'extra row junk'); if (d.under !== 'cmMore') fails.push('extra hint under ' + d.under); if (!d.body) fails.push('extra row junk hid the result');

  /* ---- 9. QA item 19: every field reacts, also with its prerequisite empty ---- */
  await clear(); await advOpen(true);
  for (const [id, key] of [['cmBase', 'base'], ['cmShare', 'share'], ['cmFee', 'fee'], ['cmFix', 'fix']]) { await ctx.set(id, '5'); d = await read(); same(d.n[key], PRE, key + ' without a plan'); await ctx.set(id, ''); }
  d = await read(); same(d.n.who, 'Type your sales and commission plan above first — then who pays is shown.', 'who pays without a result'); same(d.n.base, 'Do you get a base pay on top? Type it and it is added to your total pay.', 'base note empty'); same(d.n.more, 'Sold more than once? Add each sale here and they are added to the sales above.', 'more note empty');
  await ctx.click('cmMoreAdd'); await ctx.set('cmMr1', '1000'); d = await read(); same(d.n.more, 'Type your sales and commission plan above first — then the extra sales are added.', 'extra sale without a plan');
  await typeVal('sales', 5000); await typeVal('rate', 4); d = await read(); same(d.n.more, 'Total sales $6,000.00 = $5,000.00 + $1,000.00 from 1 extra sale.', 'extra sale added'); same(d.big, '$240.00', 'extra sale headline'); same(d.u[0], '$ · this sale', 'sales unit label with extras');

  /* ---- 10. currencies: symbol and decimals follow the selector, nothing is converted ---- */
  for (const [cur, sym, dec] of [['EUR', '€', 2], ['GBP', '£', 2], ['JPY', '¥', 0], ['USD', '$', 2], ['CHF', 'CHF', 2], ['INR', '₹', 2], ['SEK', 'kr', 2], ['ILS', '₪', 2]]) {
    await clear(); await ctx.set('cmCur', cur); await typeVal('sales', 1234.5); await typeVal('rate', 3); d = await read(); runs++;
    const f = 1234.5 * 3 / 100, fmc = (x) => { let r = money(x, sym, dec); if (['EUR', 'SEK', 'ILS'].includes(cur)) r = r.replace(sym, '') + sym; return cur === 'CHF' ? r.replace('CHF', 'CHF ') : r; };
    const bigT = d.big.replace(/[\s  ]/g, ''), exp = fmc(f).replace(/[\s  ]/g, ''); if (bigT !== exp) fails.push('currency ' + cur + ' headline [' + d.big + '] expected [' + fmc(f) + ']');
    if (d.box.comm !== plain(f, dec)) fails.push('currency ' + cur + ' computed commission box [' + d.box.comm + '] expected [' + plain(f, dec) + ']');
    if (d.u[0].indexOf(sym) !== 0) fails.push('currency ' + cur + ' label unit [' + d.u[0] + '] should start with ' + sym);
  }
  await ctx.set('cmCur', 'USD');
  await clear(); await typeVal('sales', 50000); await typeVal('rate', 3); d = await read(); runs++;
  same(d.u.join('|'), '$ · total sold|% · of sales|$ · calculated', 'unit labels');
  return { runs, fails: fails.slice(0, 25), note: 'fuzzy ties ' + fuzzy + ' of ' + cmp + ' comparisons; skipped ' + skipped };
};
