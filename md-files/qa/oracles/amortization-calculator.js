/* ORACLE for amortization-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.amEngine / loanEngine).
   It re-derives, from the typed inputs only: the payment A = P r / (1 - (1+r)^-n) with r from the compounding rule ((1 + effective yearly rate)^(1/ppy) - 1), the schedule row by row (interest = balance x r,
   extras from every payment / a yearly extra in the first payment of a calendar month / one-time payments by payment number, month-year or date), payment dates with its own calendar code, the crossover payment,
   the yearly table, the payment-by-payment table, the slider point table, the pay-faster table and every note under every field. Compared with what the page DISPLAYS. */
module.exports = async function (ctx) {
  let s = 20261114; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  const PPY = { monthly: 12, biweekly: 26, semimonthly: 24, weekly: 52, quarterly: 4, semi: 2, annual: 1, bimonthly: 6, daily: 365, semiweekly: 104 };
  const PAYLAB = { monthly: 'Monthly payment', biweekly: 'Payment every 2 weeks', semimonthly: 'Payment twice a month', weekly: 'Weekly payment', quarterly: 'Quarterly payment', semi: 'Payment every 6 months', annual: 'Yearly payment', bimonthly: 'Payment every 2 months', daily: 'Daily payment', semiweekly: 'Payment twice a week' };
  const NAME = { monthly: 'monthly', biweekly: 'every 2 weeks', semimonthly: 'twice a month', weekly: 'weekly', quarterly: 'quarterly', semi: 'every 6 months', annual: 'yearly', bimonthly: 'every 2 months', daily: 'daily', semiweekly: 'twice a week' };
  const EACH = { monthly: 'month', biweekly: '2 weeks', semimonthly: 'half month', weekly: 'week', quarterly: 'quarter', semi: '6 months', annual: 'year', bimonthly: '2 months', daily: 'day', semiweekly: 'half week' };
  const CV = { annual: 1, semi: 2, quarterly: 4, monthly: 12, weekly: 52, daily: 365, cont: 'c' };
  const COMPN = { annual: 'once a year', semi: '2 times a year', quarterly: '4 times a year', monthly: '12 times a year', weekly: '52 times a year', daily: '365 times a year', cont: 'continuously' };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MONF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  /* own calendar: a date is {y, m (1-12), d}; arithmetic through days since 1970 */
  const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0, dimo = (y, m) => [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  const toDays = (t) => Math.round(Date.UTC(t.y, t.m - 1, t.d) / 86400000), fromDays = (n) => { const q = new Date(n * 86400000); return { y: q.getUTCFullYear(), m: q.getUTCMonth() + 1, d: q.getUTCDate() }; };
  const addMo = (t, k) => { const idx = t.y * 12 + (t.m - 1) + k, y = Math.floor(idx / 12), m = idx - y * 12 + 1; return { y, m, d: Math.min(t.d, dimo(y, m)) }; };
  const addDay = (t, k) => fromDays(toDays(t) + k);
  const dateOf = (t, key, k) => {
    switch (key) {
      case 'monthly': return addMo(t, k); case 'bimonthly': return addMo(t, 2 * k); case 'quarterly': return addMo(t, 3 * k); case 'semi': return addMo(t, 6 * k); case 'annual': return addMo(t, 12 * k);
      case 'semimonthly': return k % 2 === 0 ? addMo(t, k / 2) : addDay(addMo(t, (k - 1) / 2), 15);
      case 'biweekly': return addDay(t, 14 * k); case 'weekly': return addDay(t, 7 * k); case 'daily': return addDay(t, k); default: return addDay(t, Math.round(3.5 * k));
    }
  };
  const dtxt = (t) => t.d + ' ' + MON[t.m - 1] + ' ' + t.y, cmpD = (a, b) => toDays(a) - toDays(b);
  const today = () => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; };
  /* the schedule: the definition of an amortizing loan, written out */
  const sim = (o) => {
    const ppy = PPY[o.key], a = o.apr / 100; let eff;
    if (o.comp === 'same') eff = null; else eff = o.comp === 'c' ? Math.exp(a) - 1 : Math.pow(1 + a / o.comp, o.comp) - 1;
    const r = o.comp === 'same' || o.comp === ppy ? a / ppy : Math.pow(1 + eff, 1 / ppy) - 1;
    const pay = r === 0 ? o.P / o.n : o.P * r / (1 - Math.pow(1 + r, -o.n));
    let bal = o.P, k = 0, tot = 0, cross = 0, lastYM = -1; const rows = [];
    while (bal > 0.005 && k < o.n) {
      k++; const start = bal, intr = start * r, sp = pay - intr, xo = k >= (o.xFrom || 1); let ex = xo ? (o.extra || 0) : 0;
      if (o.yAmt && xo) { const t = dateOf(o.start, o.key, k), ym = t.y * 12 + t.m - 1; if (t.m - 1 === o.yMonth && ym !== lastYM) { ex += o.yAmt; lastYM = ym; } }
      if (o.ones && o.ones[k]) ex += o.ones[k];
      let pr = sp + ex; if (pr >= start - 0.005 || k === o.n) pr = start;
      bal = start - pr; if (!cross && sp > intr) cross = k; tot += intr;
      rows.push({ k, intr, pr, bal: bal < 0.005 ? 0 : bal });
    }
    return { pay, r, rows, count: k, totInt: tot, totPaid: tot + o.P, cross, eff };
  };
  const money = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), m0 = (x) => '$' + Math.round(Math.abs(x)).toLocaleString('en-US');
  const fn = (x) => String(Math.round(x * 1e6) / 1e6), fp = (x) => fn(Math.round(x * 1e4) / 1e4) + '%', fp1 = (x) => fn(Math.round(x * 10) / 10) + '%';
  const yt = (mo) => { const y = Math.floor(mo / 12), m = mo % 12, a = []; if (y) a.push(y + (y === 1 ? ' year' : ' years')); if (m) a.push(m + (m === 1 ? ' month' : ' months')); return a.join(' ') || '0 months'; };
  const dur = (count, ppy) => { const mo = Math.round(count * 12 / ppy); return mo < 1 ? count + (count === 1 ? ' payment' : ' payments') : yt(mo); };
  const num = (t) => { const q = String(t).replace(/[−]/g, '-').replace(/[$,]/g, '').match(/-?\d+\.?\d*/); return q ? parseFloat(q[0]) : NaN; };
  const pl = (n) => n.toLocaleString('en-US') + (n === 1 ? ' payment' : ' payments');
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + String(txt).slice(0, 190) + '] lacks [' + sub + ']'); return false; } return true; };
  const eq = (txt, exp, tag) => { cmp++; if (String(txt) !== String(exp)) { fails.push(tag + ' got [' + String(txt).slice(0, 190) + '] expected [' + exp + ']'); return false; } return true; };
  const near = (got, exp, tol, tag) => { cmp++; if (!isFinite(got) || Math.abs(got - exp) > tol) { fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false; } return true; };
  const cents = (got, exp, tag) => near(got, exp, 0.0051 + 1e-9 * Math.abs(exp), tag);
  const whole = (got, exp, tag) => near(got, Math.abs(exp) < 0.5 ? 0 : exp, 0.5001 + 1e-9 * Math.abs(exp), tag);
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});};' +
    'return {big:g("amBig"),lab:g("amLab"),sub:g("amSub"),tip:g("amTip"),body:vis("amBody"),hint:vis("amHint")?g("amHint"):"",nums:rows("amNums"),fast:rows("amFast"),sch:rows("amSch"),pt:rows("amPoint"),schKey:g("amSchKey"),ptKey:g("amPointKey"),steps:g("amSteps"),split:g("amSplit"),' +
    'pn:g("amPNote"),rn:g("amRNote"),tn:g("amTNote"),xn:g("amXNote"),prn:g("amPriceNote"),dn:g("amDownNote"),fn:g("amFreqNote"),cn:g("amCompNote"),stn:g("amStartNote"),yan:g("amYANote"),atn:g("amAtNote"),xsn:g("amXSNote"),mlab:g("amMLab"),mval:g("amMVal"),svg:document.getElementById("amVis").innerHTML.length,slide:document.getElementById("amSlide").value,smax:document.getElementById("amSlide").max,more:vis("amMore"),' +
    'ones:[].map.call(document.querySelectorAll("#amOnes .am-one"),function(d){var i=d.id.slice(5);return {i:i,n:g("amON"+i)};})};})())'));
  const row = (rows, label) => (rows.filter((r) => r[0] === label)[0] || null);
  const reset = async () => { await ctx.click('amClear'); };
  const setAll = async (o) => { for (const k of Object.keys(o)) await ctx.set(k, o[k]); };
  const parseStart = (txt) => { const m = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/.exec(txt); return { y: +m[3], m: MON.indexOf(m[2]) + 1, d: +m[1] }; };

  for (let i = 0; i < 130; i++) {
    runs++; await reset();
    const key = pick(['monthly', 'monthly', 'monthly', 'biweekly', 'semimonthly', 'weekly', 'quarterly', 'semi', 'annual', 'bimonthly', 'daily', 'semiweekly']), ppy = PPY[key];
    const useDerived = R() < 0.15; let P = ri(1, R() < 0.5 ? 300 : 1500) * 1000 + (R() < 0.3 ? ri(0, 99) : 0), price = 0, downTxt = '', down = 0;
    const rate = R() < 0.07 ? 0 : Math.round(R() * 14 * 100) / 100 + 0.01;
    /* term: whole years, or months; keep the number of payments modest */
    let yrs, termTxt; const maxY = Math.max(1, Math.floor(2500 / ppy));
    if (R() < 0.35) { const mo = ri(1, Math.min(120, maxY * 12)); yrs = mo / 12; termTxt = mo === 1 ? '1 month' : mo + ' months'; } else { const y = ri(1, Math.min(35, maxY)); yrs = y; termTxt = String(y); }
    if (R() < 0.15) { const w = ri(1, Math.max(1, Math.min(300, Math.floor(maxY * 52)))); yrs = w * 7 / 365; termTxt = w + ' weeks'; }
    const n = Math.max(1, Math.round(yrs * ppy)); if (n > 2500) { i--; runs--; continue; }
    const comp = R() < 0.35 ? pick(['annual', 'semi', 'quarterly', 'monthly', 'weekly', 'daily', 'cont']) : 'same';
    const extra = R() < 0.4 ? ri(1, 600) : 0, yAmt = R() < 0.25 ? ri(2, 40) * 100 : 0, yM = ri(0, 11);
    const startTyped = R() < 0.5, st0 = startTyped ? { y: ri(2024, 2029), m: ri(1, 12), d: pick([1, 5, 15, 28, 29, 30, 31]) } : today();
    if (startTyped && st0.d > dimo(st0.y, st0.m)) st0.d = dimo(st0.y, st0.m);
    const o = { amFreq: key, amComp: comp, amR: String(rate), amT: termTxt };
    if (useDerived) { price = ri(100, 900) * 1000; const pct = R() < 0.5; if (pct) { const p = ri(5, 40); downTxt = p + '%'; down = price * p / 100; } else { down = ri(0, 8) * 10000; downTxt = down ? String(down) : ''; } P = price - down; o.amPrice = String(price); if (downTxt) o.amDown = downTxt; if (P <= 0) { i--; runs--; continue; } }
    else o.amP = String(P);
    if (extra) o.amX = String(extra); if (yAmt) { o.amYA = String(yAmt); o.amYM = String(yM); } if (startTyped) o.amStart = dtxt(st0);
    let xk = 1, xsTxt = '';
    if ((extra || yAmt) && R() < 0.3) { const kind = pick(['num', 'pmt', 'month', 'date']), kk = ri(1, n); if (kind === 'num') { xsTxt = String(kk); xk = kk; } else if (kind === 'pmt') { xsTxt = pick(['payment ', '#', 'pmt ']) + kk; xk = kk; } else { const dd = dateOf(st0, key, kk); let target; if (kind === 'month') { xsTxt = MON[dd.m - 1] + ' ' + dd.y; target = { y: dd.y, m: dd.m, d: 1 }; } else { xsTxt = dtxt(dd); target = dd; } xk = null; for (let j = 1; j <= n; j++) if (cmpD(dateOf(st0, key, j), target) >= 0) { xk = j; break; } } o.amXS = xsTxt; }
    await setAll(o);
    /* one-time extra payments */
    const ones = {}, oneRows = [];
    const nOnes = R() < 0.3 ? ri(1, 3) : 0;
    for (let q = 0; q < nOnes; q++) {
      await ctx.click('amAddOne'); const id = await ctx.eval('(function(){var a=document.querySelectorAll("#amOnes .am-one");return a[a.length-1].id.slice(5)})()'); const amt = ri(1, 50) * 100, kind = pick(['num', 'pmt', 'month', 'date']), kk = ri(1, n);
      let w, ek;
      if (kind === 'num') { w = String(kk); ek = kk; } else if (kind === 'pmt') { w = pick(['payment ', '#', 'pmt ']) + kk; ek = kk; }
      else { const dd = dateOf(st0, key, kk); let target; if (kind === 'month') { w = MON[dd.m - 1] + ' ' + dd.y; target = { y: dd.y, m: dd.m, d: 1 }; } else { w = dtxt(dd); target = dd; } ek = null; for (let j = 1; j <= n; j++) if (cmpD(dateOf(st0, key, j), target) >= 0) { ek = j; break; } }
      await ctx.set('amOA' + id, String(amt)); await ctx.set('amOW' + id, w); ones[ek] = (ones[ek] || 0) + amt; oneRows.push({ id, amt, ek, w });
    }
    const st = await read();
    const startDate = st0, hasExtra = !!(extra || yAmt || Object.keys(ones).length);
    const base = { P, apr: rate, key, comp: comp === 'same' ? 'same' : CV[comp], n, start: startDate, yMonth: yM };
    const plan = Object.assign({}, base, { extra, yAmt, ones, xFrom: xk }), exp = sim(plan), exp0 = hasExtra ? sim(Object.assign({}, base, { extra: 0, yAmt: 0, ones: {} })) : exp;
    const tag = 'run' + i + ' ' + key + ' P=' + P + ' r=' + rate + ' n=' + n + ' comp=' + comp + (extra ? ' x' + extra : '') + (yAmt ? ' ya' + yAmt + '/m' + yM : '') + (nOnes ? ' ones' + nOnes : '') + (useDerived ? ' derived' : '') + (startTyped ? ' start' + dtxt(st0) : '');
    if (!st.body) { fails.push(tag + ' no result (hint: ' + st.hint + ')'); continue; }
    const dt = (k) => dateOf(startDate, key, k), N = exp.count;
    /* headline, label, sub */
    cents(num(st.big), exp.pay, tag + ' headline'); eq(st.lab, PAYLAB[key], tag + ' label'); eq(st.mlab, PAYLAB[key], tag + ' sticky label'); eq(st.mval, st.big, tag + ' sticky value');
    if (!hasExtra) eq(st.sub, 'Total of ' + pl(N) + ' ' + money(exp.totPaid) + ' · interest ' + money(exp.totInt), tag + ' sub');
    else { const sv = exp0.totInt - exp.totInt, ms = Math.round((exp0.count - exp.count) * 12 / ppy); const mm = /^Paid off in (.+) \((.+) payments?\) · interest (\$[\d,.]+)(?: · saves (\$[\d,.]+)(?: and (.+))?)?$/.exec(st.sub); if (!mm) fails.push(tag + ' sub text [' + st.sub + ']'); else { eq(mm[1], dur(N, ppy), tag + ' sub duration'); eq(mm[2], N.toLocaleString('en-US'), tag + ' sub count'); cents(num(mm[3]), exp.totInt, tag + ' sub interest'); if (sv > 0.005) { cents(num(mm[4]), sv, tag + ' sub saved'); if (ms > 0) eq(mm[5], yt(ms), tag + ' sub months saved'); } } }
    /* tip */
    { const share = exp.totInt / exp.totPaid * 100; let want = 'Interest is ' + fp1(share) + ' of everything you pay back.'; if (exp.cross > 1 && exp.r > 0) want += ' From payment ' + exp.cross + ' (' + dtxt(dt(exp.cross)) + ') more of each payment goes to principal than to interest.'; else if (exp.r === 0) want += ' At 0% every payment is all principal.'; eq(st.tip, want, tag + ' tip'); }
    /* numbers table */
    const nr = (l) => { const x = row(st.nums, l); if (!x) fails.push(tag + ' no row ' + l); return x; }; let x;
    if ((x = nr(PAYLAB[key]))) cents(num(x[1]), exp.pay, tag + ' row pay');
    if ((x = nr('Number of payments'))) eq(x[1], N.toLocaleString('en-US') + (hasExtra && exp0.count !== N ? ' (without extras: ' + exp0.count.toLocaleString('en-US') + ')' : ''), tag + ' row count');
    if ((x = nr('Loan amount'))) cents(num(x[1]), P, tag + ' row loan'); if ((x = nr('Total interest'))) cents(num(x[1]), exp.totInt, tag + ' row interest'); if ((x = nr('Total you pay'))) cents(num(x[1]), exp.totPaid, tag + ' row total');
    if ((x = nr('Interest as a share of what you pay'))) eq(x[1], fp1(exp.totInt / exp.totPaid * 100), tag + ' row share');
    if ((x = nr('First payment'))) eq(x[1], dtxt(dt(1)), tag + ' row first date'); if ((x = nr('Last payment'))) eq(x[1], dtxt(dt(N)), tag + ' row last date');
    if ((x = nr('Interest in the first payment'))) cents(num(x[1]), exp.rows[0].intr, tag + ' row first interest'); if ((x = nr('Interest in the last payment'))) cents(num(x[1]), exp.rows[N - 1].intr, tag + ' row last interest');
    if (hasExtra) { if ((x = nr('Interest saved by your extra payments'))) cents(num(x[1]), exp0.totInt - exp.totInt, tag + ' row saved'); if ((x = nr('Time saved'))) eq(x[1], exp0.count > N ? dur(exp0.count - N, ppy) + ' (' + pl(exp0.count - N) + ')' : 'none', tag + ' row time saved'); } else { cmp++; if (row(st.nums, 'Time saved')) fails.push(tag + ' savings rows shown without extras'); }
    /* principal + interest = total; split bar */
    { const w = (exp.totPaid - exp.totInt) / exp.totPaid * 100; has(st.split, 'Principal ' + money(P) + ' (' + fp1(w) + ')', tag + ' split principal'); has(st.split, 'Interest ' + money(exp.totInt) + ' (' + fp1(100 - w) + ')', tag + ' split interest'); }
    /* yearly table */
    { const yrsN = Math.ceil(N / ppy); cmp++; if (st.sch.length !== yrsN + 1) fails.push(tag + ' yearly rows ' + (st.sch.length - 1) + ' expected ' + yrsN);
      for (let y = 1; y <= yrsN && y <= 40; y++) { const rw = st.sch[y]; if (!rw) break; let ii = 0, pp = 0, bb = 0; exp.rows.forEach((r) => { if (Math.ceil(r.k / ppy) === y) { ii += r.intr; pp += r.pr; bb = r.bal; } }); eq(rw[0], y, tag + ' year label ' + y); whole(num(rw[1]), ii, tag + ' year ' + y + ' interest'); whole(num(rw[2]), pp, tag + ' year ' + y + ' principal'); whole(num(rw[3]), bb, tag + ' year ' + y + ' balance'); }
      const last = st.sch[st.sch.length - 1]; if (last) whole(num(last[3]), 0, tag + ' last balance'); }
    /* slider point table: default position, then a chosen one */
    const k0 = exp.cross > 1 && exp.r > 0 && exp.cross <= N ? exp.cross : Math.max(1, Math.ceil(N / 2));
    const cumAt = (k) => { let ci = 0, cp = 0; for (let j = 0; j < k; j++) { ci += exp.rows[j].intr; cp += exp.rows[j].pr; } return { ci, cp }; };
    const checkPoint = async (kk, label, stx) => {
      const c = cumAt(kk), left = N - kk, rw = (l) => row(stx.pt, l); let y2;
      eq((y2 = rw('Payment')) ? y2[1] : '', kk + ' of ' + N + ' · ' + dtxt(dt(kk)), tag + ' ' + label + ' payment'); if ((y2 = rw('Balance still owed'))) cents(num(y2[1]), exp.rows[kk - 1].bal, tag + ' ' + label + ' balance');
      if ((y2 = rw('Principal paid so far'))) { cents(num(y2[1]), c.cp, tag + ' ' + label + ' principal paid'); has(y2[1], '(' + fp1(c.cp / P * 100) + ' of the loan)', tag + ' ' + label + ' principal share'); } if ((y2 = rw('Interest paid so far'))) cents(num(y2[1]), c.ci, tag + ' ' + label + ' interest paid');
      if ((y2 = rw('Interest still to pay'))) cents(num(y2[1]), exp.totInt - c.ci, tag + ' ' + label + ' interest left'); eq((y2 = rw('Payments left')) ? y2[1] : '', left + (left ? ' · last on ' + dtxt(dt(N)) : ''), tag + ' ' + label + ' payments left');
      if (price) { if ((y2 = rw('Your equity (price − balance)'))) cents(num(y2[1]), price - exp.rows[kk - 1].bal, tag + ' ' + label + ' equity'); }
    };
    eq(st.slide, k0, tag + ' default slider'); await checkPoint(k0, 'default', st);
    if (N > 1) {
      const kk = ri(1, N); await ctx.set('amSlide', String(kk)); const s2 = await read(); eq(s2.slide, kk, tag + ' slider moved'); await checkPoint(kk, 'slider', s2);
      /* typed point */
      const typed = pick([String(ri(1, N)), 'payment ' + ri(1, N)]); await ctx.set('amAt', typed); const s3 = await read(), tk = +(/\d+/.exec(typed)[0]); eq(s3.slide, tk, tag + ' typed point slider'); await checkPoint(tk, 'typed', s3); has(s3.atn, 'Showing payment ' + tk + ' of ' + N + ' (' + dtxt(dt(tk)) + ').', tag + ' typed note');
      await ctx.set('amAt', String(N + 5)); const s4 = await read(); has(s4.atn, 'The loan has only ' + N + ' payments', tag + ' beyond-last note'); await ctx.set('amAt', 'Mar 2099'); const s5 = await read(); has(s5.atn, 'after the last payment', tag + ' after-last note'); await ctx.set('amAt', '');
    }
    /* pay-it-faster table */
    { const f = st.fast; eq(f[1] ? f[1][0] : '', 'None', tag + ' fast none label'); eq(f[1] ? f[1][1] : '', dur(exp0.count, ppy), tag + ' fast none duration');
      let ix = 2; if (hasExtra) { const y3 = f[2]; eq(y3 ? y3[1] : '', dur(N, ppy), tag + ' fast plan duration'); if (y3) whole(num(y3[2]), exp0.totInt - exp.totInt, tag + ' fast plan saved'); ix = 3; }
      cmp++; if (f.length - ix < 2) fails.push(tag + ' fast table has ' + (f.length - ix) + ' preset rows');
      for (; ix < f.length; ix++) { const rw = f[ix], v = num(rw[0]); const q = sim(Object.assign({}, base, { extra: v, yAmt, ones, xFrom: xk })); eq(rw[1], dur(q.count, ppy), tag + ' fast row ' + rw[0] + ' duration'); if (exp0.count > q.count) has(rw[2], dur(exp0.count - q.count, ppy) + ' sooner', tag + ' fast row ' + rw[0] + ' sooner'); else cmp++, rw[2].indexOf('sooner') >= 0 && fails.push(tag + ' fast row ' + rw[0] + ' shows sooner without a saving'); whole(num(rw[2]), exp0.totInt - q.totInt, tag + ' fast row ' + rw[0] + ' saved'); const ratio = v / exp.pay; cmp++; if (!(ratio >= 0.05 && ratio <= 1.6)) fails.push(tag + ' fast preset ' + v + ' not near a fraction of the payment ' + exp.pay); } }
    /* payment-by-payment table */
    if (N <= 400 || i % 5 === 0) { await ctx.seg('amSchSeg', 'pay'); const sp = await read(); const lim = Math.min(120, N); cmp++; if (sp.sch.length !== lim + 1) fails.push(tag + ' payment table rows ' + (sp.sch.length - 1) + ' expected ' + lim);
      for (const j of [1, 2, Math.ceil(lim / 2), lim]) { const rw = sp.sch[j]; if (!rw) continue; const e = exp.rows[j - 1]; eq(rw[0], j + ' · ' + dtxt(dt(j)), tag + ' pay-table label ' + j); cents(num(rw[1]), e.intr, tag + ' pay-table interest ' + j); cents(num(rw[2]), e.pr, tag + ' pay-table principal ' + j); cents(num(rw[3]), e.bal, tag + ' pay-table balance ' + j); }
      cmp++; if (sp.more !== (N > 120)) fails.push(tag + ' show-more visibility ' + sp.more + ' for ' + N); await ctx.seg('amSchSeg', 'year'); }
    /* notes under every field */
    const typedP = !useDerived;
    if (typedP) { has(st.pn, 'You borrow ' + money(P) + '.', tag + ' loan note'); if (price) { /* never */ } } else eq(st.pn, 'Empty, so the loan is the price minus the down payment: ' + money(P) + '.', tag + ' derived loan note');
    eq(st.rn, fp(rate) + ' a year, charged ' + (comp === 'same' ? 'every ' + EACH[key] + ': ' + fp(rate) + ' ÷ ' + ppy + ' = ' + fp(rate / ppy) + ' per payment.' : COMPN[comp] + '.'), tag + ' rate note');
    eq(st.tn, 'That is ' + pl(n) + ' (' + NAME[key] + ').', tag + ' term note'); eq(st.fn, 'You pay ' + NAME[key] + ': ' + ppy + (ppy === 1 ? ' payment' : ' payments') + ' a year.', tag + ' frequency note');
    if (comp === 'same') eq(st.cn, 'Interest is added as often as you pay, the usual way for loans.', tag + ' compounding note'); else { const a = rate / 100, eff = comp === 'cont' ? Math.exp(a) - 1 : Math.pow(1 + a / CV[comp], CV[comp]) - 1; eq(st.cn, 'Interest is added ' + COMPN[comp] + '; the effective yearly rate is ' + fp(eff * 100) + '.', tag + ' compounding note'); }
    if (extra) eq(st.xn, 'You pay ' + money(extra) + ' extra with every payment, on top of ' + money(exp.pay) + '.', tag + ' extra note'); else eq(st.xn, 'Optional. Pay a bit more each time to finish earlier and save interest.', tag + ' empty extra note');
    if (startTyped) eq(st.stn, 'The loan starts on ' + dtxt(startDate) + '; your first payment is on ' + dtxt(dt(1)) + '.', tag + ' start note'); else eq(st.stn, 'Empty = today (' + dtxt(startDate) + '). Your first payment is one period later, on ' + dtxt(dt(1)) + '.', tag + ' empty start note');
    if (yAmt) eq(st.yan, 'You pay ' + money(yAmt) + ' extra once a year, with the first payment in ' + MONF[yM] + '.', tag + ' yearly note'); else eq(st.yan, 'Optional. A bonus or tax refund you put on the loan once a year.', tag + ' empty yearly note');
    if (useDerived) { eq(st.prn, 'Price ' + money(price) + (downTxt ? ' minus the down payment ' + money(down) : '') + ' = loan ' + money(P) + '.', tag + ' price note'); if (downTxt) eq(st.dn, 'Down payment ' + money(down) + ' (' + (/%$/.test(downTxt) ? fp(parseFloat(downTxt)) : fp1(down / price * 100)) + ' of the price).', tag + ' down note'); }
    eq(st.xsn, xsTxt ? 'The extra payments start at payment ' + xk + ' (' + dtxt(dt(xk)) + ').' : 'Optional. Start the extra payments later: a payment number or a month and year (Mar 2030). Empty means from the first payment.', tag + ' extra-start note');
    oneRows.forEach((q) => { const rw = st.ones.filter((z) => z.i === q.id)[0]; if (!rw) { fails.push(tag + ' one-time row ' + q.id + ' missing'); return; } eq(rw.n, money(q.amt) + ' extra at payment ' + q.ek + ' (' + dtxt(dt(q.ek)) + ').', tag + ' one-time note for "' + q.w + '"'); });
    cmp++; if (!(st.svg > 200)) fails.push(tag + ' no chart');
    has(st.steps, money(exp.pay), tag + ' steps payment');
  }

  /* ---- anchors: calculator.net numbers and published values ---- */
  runs++; await reset(); await setAll({ amP: '200000', amR: '6', amT: '15' }); { const st = await read(); eq(st.big, '$1,687.71', 'anchor calculator.net payment'); has(st.sub, '$303,788.46', 'anchor total'); has(st.sub, '$103,788.46', 'anchor interest'); const y1 = st.sch[1], y15 = st.sch[15]; eq(y1.join('|'), '1|$11,769|$8,483|$191,517', 'anchor year 1'); eq(y15.join('|'), '15|$643|$19,609|$0', 'anchor year 15'); }
  runs++; await reset(); await setAll({ amP: '12000', amR: '0', amT: '24 months' }); { const st = await read(); eq(st.big, '$500.00', 'anchor 0% payment'); has(st.tip, 'At 0% every payment is all principal.', 'anchor 0% tip'); has(st.sub, '$12,000.00', 'anchor 0% total'); }
  runs++; await reset(); await setAll({ amP: '1000', amR: '12', amT: '1' }); { const st = await read(); eq(st.big, '$88.85', 'anchor 1000 at 12% for 1 year'); has(st.sub, '$66.19', 'anchor interest 1000/12%/1y'); }
  /* ---- hostile / required / soft messages ---- */
  runs++; await reset(); await setAll({ amP: '200000', amR: '6', amT: 'abc' }); { const st = await read(); cmp++; if (st.body) fails.push('junk term still shows a result'); has(st.hint, 'Couldn’t read “abc” in the term', 'junk term hint'); }
  runs++; await reset(); await setAll({ amP: '200000', amR: '150', amT: '15' }); { const st = await read(); cmp++; if (st.body) fails.push('rate 150 shows a result'); has(st.hint, 'must be at most 100%', 'rate 150 hint'); }
  runs++; await reset(); await setAll({ amP: '200000', amR: '6', amT: '15', amX: 'zz' }); { const st = await read(); cmp++; if (!st.body) fails.push('junk extra hid the result'); has(st.hint, 'ignored', 'junk extra hint'); eq(st.big, '$1,687.71', 'junk extra ignored'); }
  runs++; await reset(); await setAll({ amP: '200000', amR: '6', amT: '15', amAt: 'banana' }); { const st = await read(); cmp++; if (!st.body) fails.push('junk look-at hid the result'); has(st.atn, 'Couldn’t read “banana”', 'junk look-at note'); }
  runs++; await reset(); await setAll({ amAt: '12' }); { const st = await read(); has(st.atn, 'Type the loan amount, rate and term first', 'look-at without a loan note'); }
  runs++; await reset(); await setAll({ amXS: '12' }); { const st = await read(); has(st.xsn, 'Type the loan amount, rate and term first', 'extra-start without a loan note'); }
  runs++; await reset(); await setAll({ amP: '200000', amR: '6', amT: '15', amX: '100', amXS: '999' }); { const st = await read(); has(st.xsn, 'The loan has only 180 payments, so no extra payment is made.', 'extra-start beyond the last payment'); has(st.sub, 'Paid off in 15 years (180 payments)', 'extra-start beyond the last payment keeps 180 payments'); }
  runs++; await reset(); if ((await ctx.eval('document.getElementById("amAdvIn").style.display')) === 'none') await ctx.click('amAdvBtn'); await setAll({ amP: '200000', amR: '6', amT: '15', amX: '100', amXS: 'soon' }); { const st = await read(); cmp++; if (!st.body) fails.push('junk extra-start hid the result'); has(st.hint, 'ignored', 'junk extra-start hint'); }
  runs++; await reset(); await setAll({ amX: '50' }); { const st = await read(); has(st.xn, 'Type the loan details to see the effect.', 'extra without a loan note'); }
  runs++; await reset(); await setAll({ amDown: '20%' }); { const st = await read(); has(st.dn, 'Type the price first.', 'down without price note'); }
  runs++; await reset(); if ((await ctx.eval('document.getElementById("amAdvIn").style.display')) === 'none') await ctx.click('amAdvBtn'); await setAll({ amPrice: '300000', amDown: '300000', amR: '5', amT: '10' }); { const st = await read(); cmp++; if (st.body) fails.push('down = price still shows a result'); has(st.hint, 'nothing to borrow', 'down = price hint'); }
  runs++; await reset(); await setAll({ amP: '5000', amR: '5', amT: '101' }); { const st = await read(); has(st.hint, 'at most 100 years', '101-year term hint'); }
  return { runs, fails, cmp };
};
