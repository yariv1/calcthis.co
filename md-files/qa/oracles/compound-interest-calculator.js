/* ORACLE for compound-interest-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.icEngine).
   The page walks the deposits one by one with a growth factor per period; this oracle instead sums each deposit separately, deposit k x G(T - s_k), where G is the textbook growth over t years,
   (1 + r/n)^(n t) or e^(r t), and s_k is the time of the deposit. The goal solvers are checked by plugging the displayed answer back in (round trip) and, for the time, by the minimal-month test.
   Compared with what the page DISPLAYS: headline, label, sub line, numbers table, compounding table, rate-range table, withdrawals, yearly table, notes and hints. */
module.exports = async function (ctx) {
  let s = 20261113; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  const NS = { annual: 1, semi: 2, quarterly: 4, monthly: 12, weekly: 52, daily: 365 }, DM = { weekly: 52, biweekly: 26, monthly: 12, quarterly: 4, yearly: 1 };
  const CN = { annual: 'annually', semi: 'semiannually', quarterly: 'quarterly', monthly: 'monthly', weekly: 'weekly', daily: 'daily', cont: 'continuously' };
  const CT = { annual: 'once a year', semi: '2 times a year', quarterly: '4 times a year', monthly: '12 times a year', weekly: '52 times a year', daily: '365 times a year', cont: 'continuously' };
  const DU = { weekly: 'week', biweekly: '2 weeks', monthly: 'month', quarterly: 'quarter', yearly: 'year' };
  const DL = { weekly: 'Weekly deposit', biweekly: 'Deposit every 2 weeks', monthly: 'Monthly deposit', quarterly: 'Quarterly deposit', yearly: 'Yearly deposit' };
  const Gf = (r, c, t) => (c === 'cont' ? Math.exp(r * t) : Math.pow(1 + r / NS[c], NS[c] * t));
  const FV = (o) => {
    const m = DM[o.dep], T = o.mo / 12, N = Math.floor(T * m + 1e-9); let tot = o.P * Gf(o.r, o.comp, T), put = o.P, si = o.P * o.r * T, dep = 0;
    for (let k = 1; k <= N; k++) { const Dk = o.D * Math.pow(1 + o.inc, Math.floor((k - 1) / m)), sk = o.begin ? (k - 1) / m : k / m; tot += Dk * Gf(o.r, o.comp, T - sk); put += Dk; dep += Dk; si += Dk * o.r * (T - sk); }
    return { bal: tot, put, dep, int: tot - put, simple: put + si, intP: o.P * (Gf(o.r, o.comp, T) - 1), N };
  };
  const money = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fn = (x) => String(Math.round(x * 1e6) / 1e6);
  const fp = (x) => fn(Math.round(x * 1e4) / 1e4) + '%';
  const ytxt = (mo) => { const y = Math.floor(mo / 12), m = mo % 12, a = []; if (y) a.push(y + (y === 1 ? ' year' : ' years')); if (m) a.push(m + (m === 1 ? ' month' : ' months')); return a.join(' ') || '0 months'; };
  const num = (t) => { const q = String(t).replace(/[−]/g, '-').replace(/[$,]/g, '').match(/-?\d+\.?\d*/); return q ? parseFloat(q[0]) : NaN; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 170) + '] lacks [' + sub + ']'); return false; } return true; };
  const near = (got, exp, tol, tag) => { cmp++; if (!isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false; } return true; };
  const cents = (got, exp, tag) => near(got, exp, 0.0051 + 1e-10 * Math.abs(exp), tag);
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("icBig"),lab:g("icLab"),sub:g("icSub"),tip:g("icTip"),body:vis("icBody"),hint:vis("icHint")?g("icHint"):"",nums:rows("icNums"),cmp:rows("icCmp"),sc:rows("icSc"),wd:g("icWd"),sch:rows("icSch"),schKey:g("icSchKey"),steps:g("icSteps"),pn:g("icPNote"),dn:g("icDNote"),rn:g("icRNote"),yn:g("icYNote"),cn:g("icCompNote"),gn:g("icGNote"),depn:g("icDepNote"),tmn:g("icTimingNote"),incn:g("icIncNote"),taxn:g("icTaxNote"),infn:g("icInfNote"),varn:g("icVarNote"),wn:g("icWNote"),dlab:g("icDLab"),glab:g("icGLab"),dvis:vis("icDW"),pvis:vis("icPW"),rvis:vis("icRW"),yvis:vis("icYW"),svg:document.getElementById("icVis").innerHTML.length,vkey:g("icVisKey"),mlab:g("icMLab"),mval:g("icMVal"),wvis:vis("icWdWrap"),scvis:vis("icScWrap")};})())'));
  const advOpen = async () => { const o = (await ctx.eval('document.getElementById("icAdvIn").style.display')) !== 'none'; if (!o) await ctx.click('icAdvBtn'); };
  const reset = async () => { await ctx.click('icClear'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const rowOf = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const yStr = (mo) => pick([mo % 12 === 0 ? String(mo / 12) : (mo + ' months'), Math.floor(mo / 12) + 'y ' + (mo % 12) + 'm', mo + ' months']);
  await advOpen();

  /* ---- 1. forward: final balance and everything around it ---- */
  for (let i = 0; i < 90; i++) {
    runs++; await reset();
    const P = R() < 0.2 ? 0 : Math.round(R() * 5e4 * (R() < 0.3 ? 5 : 1)), D = R() < 0.2 ? 0 : Math.round(R() * 2000 * 100) / 100, rate = Math.round(R() * 15 * 100) / 100, mo = ri(1, R() < 0.4 ? 60 : 360);
    if (P === 0 && D === 0) { i--; runs--; continue; }
    const comp = pick(['annual', 'semi', 'quarterly', 'monthly', 'weekly', 'daily', 'cont']), dep = pick(['weekly', 'biweekly', 'monthly', 'monthly', 'quarterly', 'yearly']), begin = R() < 0.3, inc = R() < 0.3 ? ri(1, 8) : 0, tax = R() < 0.3 ? ri(1, 40) : 0, inf = R() < 0.3 ? ri(1, 9) / 2 : 0, vr = R() < 0.25 ? ri(1, 4) / 2 : 0, W = R() < 0.25 ? ri(1, 30) * 100 : 0;
    const o = { icComp: comp, icDep: dep, icR: String(rate), icY: yStr(mo) }; if (P) o.icP = String(P); if (D) o.icD = String(D); if (inc) o.icInc = String(inc); if (tax) o.icTax = String(tax); if (inf) o.icInf = String(inf); if (vr) o.icVar = String(vr); if (W) o.icW = String(W);
    await ctx.seg('icTiming', begin ? 'begin' : 'end'); await setAll(o);
    const st = await read(), tag = 'fwd P=' + P + ' D=' + D + ' r=' + rate + ' mo=' + mo + ' ' + comp + '/' + dep + (begin ? ' begin' : '') + (inc ? ' inc' + inc : '') + (tax ? ' tax' + tax : '');
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); continue; }
    const r = rate / 100 * (1 - tax / 100), base = { P, D, r, comp, dep, begin, inc: inc / 100, mo }, f = FV(base);
    cents(num(st.big), f.bal, tag + ' headline'); has(st.lab, 'Balance after ' + ytxt(mo), tag + ' label');
    { const ms = st.sub.match(/You put in (\$[\d,.]+) · interest adds (\$[\d,.]+)/); if (ms) { cents(num(ms[1]), f.put, tag + ' sub put'); cents(num(ms[2]), f.int, tag + ' sub interest'); } else fails.push(tag + ' sub text [' + st.sub + ']'); }
    const nr = (l) => { const x = rowOf(st.nums, l); if (!x) fails.push(tag + ' no row ' + l); return x; };
    let x;
    if ((x = nr('Final balance'))) cents(num(x[1]), f.bal, tag + ' final'); if ((x = nr('Starting amount'))) cents(num(x[1]), P, tag + ' start'); if ((x = nr('Deposits added'))) cents(num(x[1]), f.dep, tag + ' deposits');
    if ((x = nr('Total you put in'))) cents(num(x[1]), f.put, tag + ' put'); if ((x = nr('Total interest'))) cents(num(x[1]), f.int, tag + ' interest');
    if ((x = nr('Interest on the starting amount'))) cents(num(x[1]), f.intP, tag + ' interest on P'); if ((x = nr('Interest on the deposits'))) cents(num(x[1]), f.int - f.intP, tag + ' interest on D');
    if ((x = nr('Same money without compounding'))) cents(num(x[1]), f.simple, tag + ' simple');
    if ((x = nr('Effective yearly rate'))) near(num(x[1]), Math.round((Gf(r, comp, 1) - 1) * 100 * 1e4) / 1e4, 6e-5, tag + ' effective rate');
    if (inf && (x = nr('Buying power in today’s money'))) cents(num(x[1]), f.bal / Math.pow(1 + inf / 100, mo / 12), tag + ' buying power');
    if (tax && (x = nr('Interest rate after tax'))) near(num(x[1]), rate * (1 - tax / 100), 6e-5, tag + ' rate after tax');
    if (r > 0) { x = rowOf(st.nums, 'Doubling time of the starting amount'); if (x) { const dbl = Math.log(2) / Math.log(Gf(r, comp, 1)); near(num(x[1]), Math.round(dbl * 100) / 100, 0.0051, tag + ' doubling'); has(x[1], 'rule of 72: ' + fn(Math.round(72 / (r * 100) * 100) / 100), tag + ' rule of 72'); } else fails.push(tag + ' no doubling row'); }
    /* compounding table */
    ['annual', 'semi', 'quarterly', 'monthly', 'weekly', 'daily', 'cont'].forEach((c, ix) => { const q = FV(Object.assign({}, base, { comp: c })); const rw = st.cmp[ix + 1]; if (!rw) { fails.push(tag + ' compounding table row ' + ix + ' missing'); return; } has(rw[0], CN[c], tag + ' cmp name'); cents(num(rw[1]), q.bal, tag + ' cmp ' + c); if (ix) { cents(num(rw[2]), q.bal - FV(Object.assign({}, base, { comp: 'annual' })).bal, tag + ' cmp diff ' + c); has(rw[2], '+', tag + ' cmp plus sign'); } });
    /* rate range */
    if (vr) { const lr = Math.max(0, rate - vr) / 100, hr = (rate + vr) / 100; [[lr, 1], [rate / 100, 2], [hr, 3]].forEach((q) => { const w = FV(Object.assign({}, base, { r: q[0] * (1 - tax / 100) })), rw = st.sc[q[1]]; if (!rw) { fails.push(tag + ' scenario row missing'); return; } near(num(rw[1]), w.bal, 0.5001 + 1e-10 * Math.abs(w.bal), tag + ' scenario bal ' + q[1]); near(num(rw[2]), w.int, 0.5001 + 1e-10 * Math.abs(w.int), tag + ' scenario int ' + q[1]); }); }
    else { cmp++; if (st.scvis) fails.push(tag + ' scenario table visible without a range'); }
    /* withdrawals */
    if (W) { const g12 = Gf(r, comp, 1 / 12); let B = f.bal, n = 0, broke = false; while (n < 1200) { B = B * g12 - W; if (B < 0) { broke = true; break; } n++; } const mw = 'Taking out ' + money(W) + ' a month, '; if (broke) { if (n === 0) has(st.wd, 'The first withdrawal of ' + money(W) + ' is more than the balance', tag + ' withdrawal'); else has(st.wd, mw + 'the money pays in full for ' + ytxt(n) + '.', tag + ' withdrawal'); } else { const mn = st.wd.match(/never runs out: after 100 years (\$[\d,.]+) is still left/); has(st.wd, mw + 'the money never runs out', tag + ' withdrawal'); if (mn) near(num(mn[1]), B, 1e-9 * Math.abs(B) + 0.02, tag + ' left after 100 years'); else fails.push(tag + ' withdrawal text [' + st.wd + ']'); } } else { cmp++; if (st.wvis) fails.push(tag + ' withdrawal block visible without a withdrawal'); }
    /* yearly table */
    { const m = DM[dep], T = mo / 12; const years = []; for (let y = 1; y <= Math.floor(T + 1e-9); y++) years.push(y); if (T - Math.floor(T + 1e-9) > 1e-9 || !years.length) years.push(T); const shown = years.length > 30 ? years.slice(0, 30).concat(years.slice(-1)) : years;
      cmp++; if (st.sch.length !== shown.length + 1) fails.push(tag + ' yearly table rows ' + (st.sch.length - 1) + ' expected ' + shown.length);
      let prevBal = P; const allBal = {}; allBal[0] = P;
      const balAt = (y) => FV(Object.assign({}, base, { mo: Math.round(y * 12) })).bal;
      shown.forEach((y, ix) => { const rw = st.sch[ix + 1]; if (!rw) return; const b = (Math.round(y * 12) === mo) ? f.bal : balAt(y); const pb = (ix === 0 || years.indexOf(y) === 0) ? P : balAt(years[years.indexOf(y) - 1]); const k0 = Math.floor((years.indexOf(y) > 0 ? years[years.indexOf(y) - 1] : 0) * m + 1e-9), k1 = Math.floor(y * m + 1e-9); let dy = 0; for (let k = k0 + 1; k <= k1; k++) dy += D * Math.pow(1 + inc / 100, Math.floor((k - 1) / m)); const wh = (got, exp, tg) => near(got, exp, 0.5001 + 1e-10 * Math.abs(exp), tg); wh(num(rw[3]), b, tag + ' table balance y' + y); wh(num(rw[1]), dy, tag + ' table deposits y' + y); wh(num(rw[2]), b - pb - dy, tag + ' table interest y' + y); }); }
    /* notes */
    has(st.yn, 'A total of ' + (mo === 1 ? '1 month' : mo + ' months') + (mo >= 12 ? ' (' + ytxt(mo) + ').' : '.'), tag + ' time note');
    has(st.rn, fp(rate) + ' a year compounded ' + CN[comp] + ' is an effective ' + fp((Gf(rate / 100, comp, 1) - 1) * 100) + ' a year' + (tax ? ' before tax' : '') + '.', tag + ' rate note');
    has(st.cn, 'Interest is added ' + CT[comp], tag + ' compounding note'); has(st.dlab, DL[dep], tag + ' deposit label');
    if (D) has(st.dn, 'You add ' + money(D) + ' every ' + DU[dep] + ', ' + money(f.dep) + ' in total over ' + ytxt(mo) + '.', tag + ' deposit note'); else has(st.dn, 'Optional. What you add regularly', tag + ' empty deposit note');
    if (P) has(st.pn, 'You start with ' + money(P) + '.', tag + ' start note'); else has(st.pn, 'Optional. The money you already have', tag + ' empty start note');
    has(st.tmn, begin ? 'at the start of its period' : 'at the end of its period', tag + ' timing note');
    if (inc) has(st.incn, 'Each year your deposit is ' + fp(inc) + ' higher', tag + ' increase note');
    if (tax) has(st.taxn, 'you keep ' + fp(100 - tax) + ' of it', tag + ' tax note');
    if (inf) has(st.infn, 'prices rise ' + fp(inf) + ' a year', tag + ' inflation note');
    if (vr) has(st.varn, 'a rate ' + fn(vr) + ' points lower and higher', tag + ' range note');
    cmp++; if (!st.svg || st.svg < 800) fails.push(tag + ' no picture');
    cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push(tag + ' bad text in result');
    cmp++; if (st.mval !== st.big || st.mlab !== 'Final balance') fails.push(tag + ' sticky bar [' + st.mlab + '|' + st.mval + ']');
  }

  /* ---- 2. goal in balance mode: when is it reached ---- */
  for (let i = 0; i < 12; i++) {
    runs++; await reset(); const P = ri(1, 20) * 1000, D = ri(0, 8) * 100, rate = ri(1, 12), mo = ri(12, 180), comp = pick(['monthly', 'annual', 'daily']);
    const f = FV({ P, D, r: rate / 100, comp, dep: 'monthly', begin: false, inc: 0, mo }), goal = Math.round(f.bal * pick([0.5, 0.9, 1.0, 1.5, 3, 40]));
    await setAll({ icComp: comp, icP: String(P), icR: String(rate), icY: String(mo / 12), icG: String(goal) }); if (D) await ctx.set('icD', String(D));
    const st = await read(), tag = 'goal P=' + P + ' D=' + D + ' r=' + rate + ' mo=' + mo + ' goal=' + goal;
    let want = null; for (let m2 = 1; m2 <= 1200; m2++) { if (FV({ P, D, r: rate / 100, comp, dep: 'monthly', begin: false, inc: 0, mo: m2 }).bal >= goal) { want = m2; break; } }
    has(st.gn, want ? 'You reach ' + money(goal) + ' after ' + ytxt(want) + '.' : 'don’t reach ' + money(goal) + ' within 100 years', tag + ' goal note');
    const rw = rowOf(st.nums, 'Goal ' + money(goal)); if (rw) has(rw[1], want ? 'reached after ' + ytxt(want) : 'not within 100 years', tag + ' goal row'); else fails.push(tag + ' no goal row');
  }

  /* ---- 3. solve for the deposit / the starting amount / the time / the rate (round trips against the oracle), goal = balance or interest ---- */
  for (let i = 0; i < 60; i++) {
    runs++; await reset(); const kind = pick(['deposit', 'deposit', 'start', 'years', 'rate']), gk = R() < 0.3 ? 'int' : 'bal', rate = ri(1, 12) + (R() < 0.5 ? 0.5 : 0), mo = ri(12, 300), comp = pick(['monthly', 'annual', 'quarterly', 'weekly']), dep = pick(['monthly', 'monthly', 'weekly', 'yearly']), begin = R() < 0.25, inc = R() < 0.2 ? ri(1, 5) : 0, tax = R() < 0.2 ? ri(5, 30) : 0;
    const P = kind === 'start' ? ri(1, 30) * 1000 + 13 : (R() < 0.4 ? 0 : ri(1, 30) * 1000), D0 = kind === 'deposit' ? ri(1, 15) * 50 + 7 : (kind === 'start' ? ri(0, 6) * 100 : ri(1, 10) * 100), r = rate / 100 * (1 - tax / 100);
    const full = (over) => FV(Object.assign({ P, D: D0, r, comp, dep, begin, inc: inc / 100, mo }, over)), met = (f) => (gk === 'int' ? f.int : f.bal);
    if ((kind === 'years' || kind === 'rate') && P === 0 && D0 === 0) continue;
    const goal = Math.round(met(full({})) * 100) / 100; await ctx.seg('icTiming', begin ? 'begin' : 'end'); await ctx.set('icSolve', kind); await advOpen(); await ctx.set('icGoalKind', gk);
    const o = { icComp: comp, icDep: dep, icG: String(goal) }; if (P && kind !== 'start') o.icP = String(P); if (inc) o.icInc = String(inc); if (tax) o.icTax = String(tax);
    if (kind === 'deposit' || kind === 'start') { o.icR = String(rate); o.icY = String(mo) + ' months'; if (kind === 'start' && D0) o.icD = String(D0); } else if (kind === 'years') { o.icR = String(rate); o.icD = String(D0); } else { o.icY = String(mo) + ' months'; o.icD = String(D0); }
    await setAll(o); const st = await read(), tag = 'solve ' + kind + ' (' + gk + ') P=' + P + ' D0=' + D0 + ' r=' + rate + ' mo=' + mo + ' ' + comp + '/' + dep + (begin ? ' begin' : '') + (inc ? ' inc' + inc : '') + (tax ? ' tax' + tax : '') + ' goal=' + goal;
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); continue; }
    const gt = gk === 'int' ? 'earn ' + money(goal) + ' in interest' : 'reach ' + money(goal);
    cmp++; if (kind === 'deposit' && st.dvis) fails.push(tag + ' deposit box should be hidden'); if (kind === 'start' && st.pvis) fails.push(tag + ' starting amount box should be hidden'); if (kind === 'rate' && st.rvis) fails.push(tag + ' rate box should be hidden'); if (kind === 'years' && st.yvis) fails.push(tag + ' time box should be hidden');
    has(st.glab, gk === 'int' ? 'Interest I want to earn' : 'Amount I want', tag + ' goal label');
    if (kind === 'deposit') { const D = num(st.big); has(st.big, ' a ' + DU[dep], tag + ' unit'); const slope = met(full({ D: D0 + 1 })) - met(full({ D: D0 })), got = met(FV({ P, D, r, comp, dep, begin, inc: inc / 100, mo })); near(got, goal, 0.0051 * slope + 0.01, tag + ' round trip'); has(st.lab, 'Deposit needed to ' + gt, tag + ' label'); }
    else if (kind === 'start') { const Pd = num(st.big), slope = met(full({ P: P + 1 })) - met(full({ P })), got = met(FV({ P: Pd, D: D0, r, comp, dep, begin, inc: inc / 100, mo })); near(got, goal, 0.0051 * slope + 0.01, tag + ' round trip'); has(st.lab, 'Starting amount needed to ' + gt, tag + ' label'); }
    else if (kind === 'years') { const m = st.big.match(/(?:(\d+) years?)?(?: ?(\d+) months?)?$/), y = m && m[1] ? parseInt(m[1], 10) : 0, mm = m && m[2] ? parseInt(m[2], 10) : 0, M = y * 12 + mm, f1 = met(FV({ P, D: D0, r, comp, dep, begin, inc: inc / 100, mo: M })), f0 = M > 1 ? met(FV({ P, D: D0, r, comp, dep, begin, inc: inc / 100, mo: M - 1 })) : -1; cmp++; if (!(f1 >= goal - 1e-6) || !(f0 < goal)) fails.push(tag + ' time ' + st.big + ' (' + M + ' months) is not the first to reach the goal: ' + f1 + ' / ' + f0 + ' vs ' + goal); has(st.lab, 'Time needed to ' + gt, tag + ' label'); }
    else { const rr = num(st.big) / 100 * (1 - tax / 100); const d = 1e-5, sl = (met(FV({ P, D: D0, r: rr + d, comp, dep, begin, inc: inc / 100, mo })) - met(FV({ P, D: D0, r: rr - d, comp, dep, begin, inc: inc / 100, mo }))) / (2 * d), got = met(FV({ P, D: D0, r: rr, comp, dep, begin, inc: inc / 100, mo })); near(got, goal, 0.5e-4 / 100 * (1 - tax / 100) * Math.abs(sl) * 1.05 + 0.01, tag + ' round trip'); has(st.lab, 'Rate needed to ' + gt, tag + ' label'); }
    cmp++; if (/NaN|undefined|Infinity|null/.test(JSON.stringify(st))) fails.push(tag + ' bad text');
  }

  /* ---- 4. hints and notes: every field reacts ---- */
  const hintCase = async (o, expect, body, tag, solve) => { runs++; await reset(); if (solve) await ctx.set('icSolve', solve); await setAll(o); const st = await read(); if (expect) has(st.hint, expect, tag + ' hint'); cmp++; if (!!st.body !== body) fails.push(tag + ' result visible=' + st.body + ' expected ' + body + ' (hint ' + st.hint + ')'); return st; };
  const T = { icP: '10000', icD: '200', icR: '6', icY: '10' };
  await hintCase(Object.assign({}, T, { icR: '-1' }), 'The interest rate can’t be negative', false, 'rate negative');
  await hintCase(Object.assign({}, T, { icR: '2000' }), 'must be at most 100%', false, 'rate too big');
  await hintCase(Object.assign({}, T, { icR: 'abc' }), 'Couldn’t read “abc” in the interest rate', false, 'rate junk');
  await hintCase(Object.assign({}, T, { icY: '0' }), 'The time must be at least 1 month', false, 'time zero');
  await hintCase(Object.assign({}, T, { icY: '101' }), 'The time must be at most 100 years', false, 'time 101 years');
  await hintCase(Object.assign({}, T, { icY: 'soon' }), 'Couldn’t read “soon” in the time', false, 'time junk');
  await hintCase(Object.assign({}, T, { icP: 'abc' }), 'It is ignored for now', true, 'start junk ignored');
  await hintCase(Object.assign({}, T, { icP: '-5' }), 'can’t be negative', true, 'start negative ignored');
  await hintCase(Object.assign({}, T, { icD: '-5' }), 'It is ignored for now', true, 'deposit negative ignored');
  await hintCase(Object.assign({}, T, { icG: 'abc' }), 'It is ignored for now', true, 'goal junk ignored');
  await hintCase({ icR: '6', icY: '10', icP: 'abc' }, 'It is ignored for now', false, 'start junk and nothing else');
  await hintCase(Object.assign({}, T, { icTax: '100' }), 'must be below 100%', true, 'tax 100 ignored');
  await hintCase(Object.assign({}, T, { icInc: '-1' }), 'can’t be negative', true, 'increase negative ignored');
  await hintCase(Object.assign({}, T, { icVar: '0' }), 'must be above 0', true, 'range zero ignored');
  await hintCase(Object.assign({}, T, { icW: '-3' }), 'must be above 0', true, 'withdrawal negative ignored');
  let st = await hintCase({ icR: '5', icY: '20' }, '', false, 'goal missing in deposit mode', 'deposit'); has(st.sub, 'Type the amount you want to see the result.', 'deposit mode asks for the goal');
  st = await hintCase({ icR: '5', icY: '10' }, '', false, 'goal missing in start mode', 'start'); has(st.sub, 'Type the amount you want to see the result.', 'start mode asks for the goal');
  st = await hintCase({ icR: '5', icG: '1000' }, '', false, 'start or deposit missing in time mode', 'years'); has(st.sub, 'a starting amount or a deposit', 'time mode asks for start or deposit');
  st = await hintCase({ icP: '1000', icR: '0', icG: '5000' }, '', true, 'unreachable time', 'years'); cmp++; if (st.big !== 'Over 100 years') fails.push('unreachable time shows [' + st.big + ']'); has(st.sub, 'Even after 100 years you would have $1,000.00, short of $5,000.00', 'unreachable time sub');
  st = await hintCase({ icP: '1000', icY: '1', icG: '1000000000' }, '', true, 'unreachable rate', 'rate'); cmp++; if (st.big !== 'More than 100% a year') fails.push('unreachable rate shows [' + st.big + ']'); has(st.sub, 'Even at 100% a year you would have', 'unreachable rate sub');
  st = await hintCase({}, '', false, 'empty start'); has(st.sub, 'Type the interest rate, the time and a starting amount or a deposit', 'empty sub'); has(st.rn, 'Type the yearly interest rate', 'empty rate note'); has(st.yn, 'Type years (10)', 'empty time note'); has(st.gn, 'Optional. Type an amount to see when you reach it.', 'empty goal note'); has(st.wn, 'Optional. A monthly amount you take out after saving', 'empty withdrawal note'); has(st.taxn, 'Optional. The tax you pay on the interest', 'empty tax note'); has(st.infn, 'Optional. Prices rising', 'empty inflation note'); has(st.varn, 'Optional. Add or subtract', 'empty range note'); has(st.incn, 'Optional. Raise the deposit every year', 'empty increase note');
  runs++; { await reset(); await setAll({ icP: '1,000.50', icR: '5%', icY: '2.5' }); const s2 = await read(); cmp++; if (!s2.body) fails.push('commas, percent sign and decimal years not accepted: ' + s2.hint); else has(s2.yn, 'A total of 30 months', 'decimal years = 30 months'); }
  runs++; { await reset(); await setAll({ icP: '$2,000', icR: '5', icY: '1 year 3 months' }); const s2 = await read(); cmp++; if (!s2.body) fails.push('dollar sign / "1 year 3 months" not accepted: ' + s2.hint); else has(s2.yn, 'A total of 15 months', '1 year 3 months = 15'); }
  /* solve modes show the right fields */
  runs++; { await reset(); await ctx.set('icSolve', 'deposit'); const s2 = await read(); cmp++; if (s2.dvis) fails.push('deposit box visible in deposit mode'); has(s2.glab, 'Amount I want', 'goal label in deposit mode'); await ctx.set('icSolve', 'balance'); const s3 = await read(); cmp++; if (!s3.dvis || !s3.rvis || !s3.yvis) fails.push('boxes not all back in balance mode'); has(s3.glab, 'Goal · optional', 'goal label in balance mode'); }
  /* clear resets everything */
  runs++; { await reset(); await setAll(Object.assign({}, T, { icInc: '3', icTax: '10', icW: '500' })); await ctx.set('icSolve', 'rate'); await ctx.click('icClear'); const vals = []; for (const id of ['icP', 'icD', 'icR', 'icY', 'icG', 'icInc', 'icTax', 'icInf', 'icVar', 'icW']) vals.push(await ctx.val(id)); const sv = await ctx.val('icSolve'), gkv = await ctx.val('icGoalKind'); const s2 = await read(); cmp++; if (vals.some((v) => v !== '') || sv !== 'balance' || gkv !== 'bal' || s2.body) fails.push('clear did not reset: ' + JSON.stringify(vals) + ' ' + sv); }
  /* currency: symbol follows the picker, nothing is converted */
  runs++; { await reset(); await setAll({ icP: '1000', icR: '5', icY: '1' }); await ctx.set('icCur', 'EUR'); const s2 = await read(); const e1 = FV({ P: 1000, D: 0, r: 0.05, comp: 'monthly', dep: 'monthly', begin: false, inc: 0, mo: 12 }).bal; cmp++; if (!/€/.test(s2.big) && !/EUR/.test(s2.big)) fails.push('euro headline has no euro sign: ' + s2.big); near(num(s2.big.replace('€', '')), e1, 0.011, 'euro amount unchanged'); await ctx.set('icCur', 'USD'); }
  return { runs, fails: fails.slice(0, 60), compared: cmp };
};
