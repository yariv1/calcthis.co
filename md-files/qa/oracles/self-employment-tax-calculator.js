/* ORACLE for self-employment-tax-calculator: an INDEPENDENT re-implementation (never CalcThis.seEngine / payEngine). Typed from IRS Form 1040-ES (2026) rate
   schedules written as bracket widths, Schedule SE, Form 8995-A, 26 USC 199A(i), Form 7206 (2026), Pub. 560, Schedule 8812; state checks use only the
   flat formulas PA 3.07%, IL 4.95%, NC (annual less standard deduction x 4.09%, each month rounded to whole dollars), the nine no-wage-tax states and typed
   rates. The other state formulas are covered by the paycheck pages' own QA. Compared with what the page DISPLAYS over random runs. */
module.exports = async function (ctx) {
  let seed = 20261128; const R = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)], ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const fails = []; let runs = 0, cmp = 0;
  const bad = (m) => { if (fails.length < 60) fails.push(m); };
  const near = (got, exp, tag, tol) => { cmp++; if (!(Math.abs(got - exp) <= (tol === undefined ? 0.0101 : tol))) bad(tag + ' got ' + got + ' expected ' + exp.toFixed(4)); };
  const money = (t) => { const s = String(t).replace(/,/g, ''); const m = s.match(/(−|-)?\+?\$([\d.]+)/); return m ? (m[1] ? -1 : 1) * parseFloat(m[2]) : NaN; };
  const allMoney = (t) => (String(t).replace(/,/g, '').match(/(−|-)?\$[\d.]+/g) || []).map(money);

  /* ---------- own 2026 federal maths ---------- */
  const WIDTH = { single: [12400, 38000, 55300, 96075, 54450, 384375], mfj: [24800, 76000, 110600, 192150, 108900, 256250], mfs: [12400, 38000, 55300, 96075, 54450, 128125], hoh: [17700, 49750, 38250, 96050, 54450, 384400] };
  const PCT = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  const incomeTaxOf = (st, x) => { let t = 0, left = Math.max(0, x); const w = WIDTH[st]; for (let i = 0; i < 7 && left > 0; i++) { const part = i < w.length ? Math.min(left, w[i]) : left; t += part * PCT[i]; left -= part; } return t; };
  const STD = { single: 16100, mfs: 16100, mfj: 32200, hoh: 24150 };
  const NONE = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'], TYPED = ['CT', 'DE', 'DC', 'ID', 'KS', 'ME', 'MS', 'NM', 'ND', 'RI', 'SC', 'VT', 'WV'];
  const stateOf = (i, agi) => {
    const a = Math.max(0, agi), c = i.state;
    if (!c) return { known: false, tax: 0 };
    if (NONE.includes(c)) return { known: true, tax: 0 };
    if (TYPED.includes(c)) return { known: i.stRate > 0, tax: i.stRate > 0 ? a * i.stRate / 100 : 0 };
    if (c === 'PA') return { known: true, tax: a * 0.0307 };
    if (c === 'IL') return { known: true, tax: a * 0.0495 };
    if (c === 'NC') { const sd = i.status === 'hoh' ? 19125 : 12750; return { known: true, tax: a > 0 ? 12 * Math.floor(Math.max(0, a / 12 * 12 - sd) * 0.0409 / 12 + 0.5) : 0 }; }
    throw new Error('oracle has no formula for ' + c);
  };
  const calc = (i) => {
    const n = (v) => v || 0, st = i.status;
    const miles = n(i.m1) * 0.725 + n(i.m2) * 0.76;
    const home = Math.max(0, Math.min(5 * Math.min(n(i.sqft), 300), n(i.income) - n(i.expenses) - miles));
    const profit = n(i.income) - n(i.expenses) - miles - home, biz = profit + n(i.farm), w = n(i.wages), ch = n(i.church);
    let c4 = biz > 0 ? biz * 0.9235 : 0; if (c4 < 400) c4 = 0; let c5 = ch * 0.9235; if (c5 < 100) c5 = 0;
    const base = c4 + c5, ssBase = Math.max(0, Math.min(base, 184500 - w)), ss = ssBase * 0.124, med = base * 0.029, se = ss + med, half = se / 2;
    const halfBiz = base > 0 ? half * (c4 / base) : 0, comp = Math.max(0, biz - halfBiz);
    const D = Math.min(24500, comp), C = i.age === '50' || i.age === '64' ? 8000 : i.age === '60' ? 11250 : 0;
    let rmax;
    if (i.retType === 'solo') { const emp = Math.max(0, Math.min(0.2 * comp, 72000 - D, (comp - D) / 2)); const def = Math.min(D, comp - emp); const cu = Math.max(0, Math.min(C, comp - emp - def)); rmax = emp + def + cu; } else rmax = Math.min(0.2 * comp, 72000);
    const ret = Math.min(n(i.retAmt), rmax), health = Math.min(n(i.premiums), Math.max(0, comp - ret));
    const iraMax = Math.min(i.age === 'u50' || !i.age ? 7500 : 8600, comp + w), ira = Math.min(n(i.ira), iraMax), other = n(i.otherAdj);
    const total = w + biz + ch, agi = total - half - ret - health - ira - other;
    const itemized = n(i.mortgage) + n(i.itemized), ded = itemized > STD[st] ? itemized : STD[st], ti = Math.max(0, agi - ded);
    const qbi = biz > 0 ? Math.max(0, biz - halfBiz - health - ret) : 0;
    const thr = st === 'mfj' ? 403500 : st === 'mfs' ? 201775 : 201750, range = st === 'mfj' ? 150000 : 75000;
    const p = Math.max(0, Math.min(1, (ti - thr) / range));
    let q = 0.2 * qbi; if (p > 0) q = i.sstb ? q * (1 - p) * (1 - p) : q - q * p;
    q = Math.min(q, 0.2 * ti); if (qbi >= 1000 && !(i.sstb && p === 1)) q = Math.max(q, 400); if (ti <= 0) q = 0;
    const taxable = Math.max(0, ti - q), it = incomeTaxOf(st, taxable);
    const aThr = st === 'mfj' ? 250000 : st === 'mfs' ? 125000 : 200000;
    const addlSe = 0.009 * Math.max(0, base - Math.max(0, aThr - w)), addlW = 0.009 * Math.max(0, w - aThr), held = 0.009 * Math.max(0, w - 200000);
    const kids = n(i.kids); let nonref = 0, refund = 0, credit = 0;
    if (kids) {
      const lim = st === 'mfj' ? 400000 : 200000; let over = agi - lim, steps = 0; while (over > 0) { steps++; over -= 1000; }
      credit = Math.max(0, 2200 * kids - 50 * steps); nonref = Math.min(credit, it);
      const cap = Math.min(credit - nonref, 1700 * kids), earned = Math.max(0, total - half), a15 = 0.15 * Math.max(0, earned - 2500);
      refund = Math.min(cap, a15); if (kids >= 3 && a15 < cap) refund = Math.min(cap, Math.max(a15, 0.062 * Math.min(w, 184500) + 0.0145 * w + half));
    }
    const fed = it - nonref + se + addlSe + addlW - refund, s = stateOf(i, agi), all = fed + s.tax;
    const fica = 0.062 * Math.min(w, 184500) + 0.0145 * w, keep = total - fica - all, withheld = n(i.withheld) + held;
    return { miles, home, profit, biz, base, ssBase, ss, med, se, half, ret, rmax, health, ira, agi, ded, ti, q, taxable, it, nonref, refund, credit, addlSe, addlW, fed, st: s, all, keep, fica, withheld, owed: fed - withheld - n(i.estPaid), total };
  };

  /* ---------- drive the page ---------- */
  const openA = () => ctx.eval('(function(){var a=document.getElementById("seAdvBtn");if(!/Go simple/.test(a.textContent))a.click();return 1})()');
  const IDS = { expenses: 'seExpenses', m1: 'seM1', m2: 'seM2', sqft: 'seSqft', wages: 'seWages', withheld: 'seWithheld', farm: 'seFarm', church: 'seChurch', premiums: 'sePrem', retAmt: 'seRet', ira: 'seIra', otherAdj: 'seOther', mortgage: 'seMort', itemized: 'seItem', kids: 'seKids', estPaid: 'sePaid', lastTax: 'seLastTax', lastAgi: 'seLastAgi' };
  await ctx.fill();
  await ctx.eval('(function(){var a=document.getElementById("seAdvBtn");if(!/Go simple/.test(a.textContent))a.click();return 1})()');
  await ctx.eval('CalcThis.seNow=new Date(2026,10,27);1');
  const READ = 'JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():""};var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim()})})};' +
    'var o={job:g("seJobOut"),jobt:rows("seJobTbl"),lab:g("seLab"),big:g("seBig"),sub:g("seSub"),tip:g("seTip"),body:document.getElementById("seBody").style.display!=="none",p:g("sePOut"),ptbl:rows("sePTbl"),steps:rows("seSteps"),qtr:rows("seQtr"),qk:g("seQtrKey"),need:rows("seNeed"),w2:rows("seW2"),w2k:g("seW2Key"),stepk:g("seStepKey"),w2v:document.getElementById("seW2Wrap").style.display!=="none",tab:rows("seTab"),flow:[].map.call(document.querySelectorAll("#seFlow .se-row"),function(e){return [e.querySelector(".se-k").textContent,+e.getAttribute("data-v"),e.querySelector(".se-v").textContent]}),cap:[].map.call(document.querySelectorAll("#seCap .se-meter i"),function(e){return [e.className,+e.getAttribute("data-v")]}),capk:g("seCapKey"),copy:g("seCopyTxt"),mval:g("seMVal"),county:document.getElementById("seCountyFld").style.display!=="none",rate:document.getElementById("seRateFld").style.display!=="none",hint:document.getElementById("seHint").style.display!=="none"?g("seHint"):""};' +
    '["seIncomeNote","seExpNote","seM1Note","seM2Note","seSqftNote","seWagesNote","seRetNote","seRetTypeNote","sePremNote","seIraNote","seKidsNote","seMortNote","seStatusNote","seStateNote","sePaidNote","seTargetNote","seHoursNote"].forEach(function(i){o[i]=g(i)});return o})())';
  const read = async () => JSON.parse(await ctx.eval(READ));
  const money0 = (v) => { const x = Math.round(v); return x; };
  const fills = (rows) => rows.filter((r) => /estimate/.test(r[0])).length;
  const apply = async (i) => {
    const js = [];
    const set = (id, v) => js.push('__qa.set(' + JSON.stringify(id) + ',' + JSON.stringify(String(v)) + ')');
    js.push('__qa.seg("seMode",' + JSON.stringify(i.mode) + ')', '__qa.seg("seRetType",' + JSON.stringify(i.retType) + ')', '__qa.seg("seSstb",' + JSON.stringify(i.sstb ? 'yes' : 'no') + ')', '__qa.seg("sePer",' + JSON.stringify(i.per || 'year') + ')');
    set('seStatus', i.status); set('seAge', i.age); set('seState', i.state);
    if (i.state === 'PA' || !i.state || true) set('seStRate', i.stRate > 0 ? i.stRate : '');
    Object.keys(IDS).forEach((k) => set(IDS[k], i[k] === undefined ? '' : i[k]));
    set('seIncome', i.mode === 'tax' ? i.income : ''); set('seTarget', i.mode === 'need' ? i.target : ''); set('seHours', i.hours === undefined ? '' : i.hours); set('seP', i.pay === undefined ? '' : i.pay); set('seJob', i.job === undefined ? '' : i.job); set('seJobBen', i.jobBen === undefined ? '' : i.jobBen); set('seJobHrs', i.jobHrs === undefined ? '' : i.jobHrs);
    await ctx.eval(js.join(';') + ';1');
  };
  const money2 = () => pick([0, ri(100, 3000), ri(3000, 90000), ri(90000, 320000), ri(320000, 900000)]) + (R() < 0.2 ? 0.37 : 0);
  const gen = (k) => {
    const i = { mode: k % 5 === 4 ? 'need' : 'tax', status: pick(['single', 'mfj', 'hoh', 'mfs']), age: pick(['u50', '50', '60', '64']), retType: pick(['sep', 'solo']), sstb: R() < 0.25, state: pick(['', '', 'TX', 'FL', 'WA', 'PA', 'IL', 'NC', 'CT', 'VT', 'DC']), income: pick([ri(0, 600), ri(600, 60000), ri(60000, 250000), ri(180000, 320000), ri(300000, 900000), ri(1, 5000000)]) + (R() < 0.2 ? 0.55 : 0) };
    const some = (key, v, pr) => { if (R() < (pr || 0.3)) i[key] = v(); };
    some('expenses', () => ri(0, Math.max(1, Math.round(i.income * 0.6))), 0.55);
    some('m1', () => ri(0, 20000)); some('m2', () => ri(0, 20000)); some('sqft', () => ri(0, 600));
    some('wages', money2); some('withheld', () => ri(0, 60000), 0.2); some('farm', () => ri(-30000, 60000), 0.15); some('church', () => ri(0, 3000), 0.1);
    some('premiums', () => ri(0, 40000)); some('retAmt', () => ri(0, 100000)); some('ira', () => ri(0, 15000), 0.2); some('otherAdj', () => ri(0, 8000), 0.15);
    some('mortgage', () => ri(0, 40000), 0.2); some('itemized', () => ri(0, 40000), 0.2); some('kids', () => pick([1, 2, 3, 4, 6]), 0.35); some('estPaid', () => ri(0, 30000), 0.2);
    if (R() < 0.35) { i.lastTax = pick([0, ri(1, 5000), ri(5000, 90000)]); if (R() < 0.6) i.lastAgi = ri(20000, 400000); }
    if (TYPED.includes(i.state) && R() < 0.8) i.stRate = pick([1, 2.5, 4.75, 8, 12.25, 20]);
    if (i.mode === 'need') { i.per = pick(['year', 'month']); i.target = i.per === 'month' ? ri(200, 30000) : ri(1000, 600000); if (R() < 0.6) i.hours = ri(100, 4000); }
    if (R() < 0.5) i.pay = ri(1, 40000);
    if (R() < 0.4) { i.job = ri(15000, 300000); if (R() < 0.5) i.jobBen = ri(0, 30000); if (R() < 0.6) i.jobHrs = ri(200, 3000); }
    return i;
  };
  const FIXED = [
    { mode: 'tax', status: 'single', age: 'u50', retType: 'sep', sstb: false, state: '', income: 80000 },
    { mode: 'tax', status: 'single', age: 'u50', retType: 'sep', sstb: false, state: '', income: 433 },
    { mode: 'tax', status: 'single', age: 'u50', retType: 'sep', sstb: false, state: '', income: 434 },
    { mode: 'tax', status: 'single', age: 'u50', retType: 'sep', sstb: false, state: '', income: 200000, wages: 184500 },
    { mode: 'tax', status: 'single', age: 'u50', retType: 'sep', sstb: true, state: '', income: 400000 },
    { mode: 'tax', status: 'mfj', age: '60', retType: 'solo', sstb: false, state: 'TX', income: 50000, retAmt: 99999, kids: 3 },
    { mode: 'tax', status: 'mfj', age: 'u50', retType: 'sep', sstb: false, state: '', income: 20000, kids: 4, wages: 15000 },
    { mode: 'tax', status: 'hoh', age: '50', retType: 'solo', sstb: false, state: 'NC', income: 30000, premiums: 50000, ira: 9999 },
    { mode: 'tax', status: 'mfs', age: 'u50', retType: 'sep', sstb: false, state: 'PA', income: 260000, lastTax: 40000, lastAgi: 80000 },
    { mode: 'need', per: 'year', status: 'single', age: 'u50', retType: 'sep', sstb: false, state: '', target: 60000, hours: 1000 }
  ];
  const now = new Date(2026, 10, 27);
  for (let k = 0; k < 170; k++) {
    const i = k < FIXED.length ? Object.assign({}, FIXED[k]) : gen(k);
    await apply(i);
    const o = await read(); runs++;
    const tag = 'run' + k + ' ' + JSON.stringify(i);
    if (i.mode === 'tax' && !i.income && !i.farm && !i.church) { if (i.income === 0) { /* 0 is a valid income */ } }
    if (!o.body) { bad(tag + ' no result: ' + o.sub); continue; }
    let inp = Object.assign({}, i);
    if (i.mode === 'need') {
      const target = i.target * (i.per === 'month' ? 12 : 1);
      const income = money(o.big); inp.income = income;
      const at = calc(inp);
      /* the shown income reaches the target, and a dollar less does not (tax tables allow small steps) */
      cmp++; if (!(at.keep >= target - 0.6)) bad(tag + ' need ' + income + ' keeps ' + at.keep.toFixed(2) + ' < ' + target);
      const zero = calc(Object.assign({}, inp, { income: 0 }));
      if (income > 0) { cmp++; const below = calc(Object.assign({}, inp, { income: Math.max(0, income - 60) })).keep; if (!(below < target + 0.01 || at.keep - target < 60)) bad(tag + ' need ' + income + ' not minimal: ' + below.toFixed(2)); }
      else { cmp++; if (!(zero.keep >= target - 0.01)) bad(tag + ' says 0 needed but keeps ' + zero.keep); }
      near(money(o.need[0] && o.need[0][1]), income, tag + ' need year'); near(money(o.need[1][1]), income / 12, tag + ' need month');
      if (i.hours) { const h = o.need.find((r) => /billable hour/.test(r[0])); near(money(h && h[1]), income / i.hours, tag + ' hourly'); }
    }
    const e = calc(inp);
    if (i.mode === 'tax') { near(money(o.big), e.se, tag + ' SE headline'); const m = allMoney(o.sub); near(m[0], e.all, tag + ' total'); near(m[1], e.keep, tag + ' keep'); near(m[2], e.keep / 12, tag + ' month'); }
    else { const m = allMoney(o.sub); near(m[m.length - 2], e.se, tag + ' sub SE', 0.02); near(m[m.length - 1], e.all, tag + ' sub all', 0.02); }
    if (o.mval !== o.big) bad(tag + ' sticky bar ' + o.mval + ' vs ' + o.big);
    const row = (name) => { const r = o.steps.find((x) => x[0].indexOf(name) === 0); return r ? money(r[1]) : null; };
    near(row('Business profit'), e.biz, tag + ' profit');
    near(row('Net earnings'), e.base > 0 || e.biz > 0 ? (e.biz * 0.9235 >= 400 ? e.biz * 0.9235 : 0) : 0, tag + ' net');
    { const r = o.steps.find((x) => x[0].indexOf('Social Security 12.4%') === 0); near(money(r[1]), e.ss, tag + ' ss'); const r2 = o.steps.find((x) => x[0].indexOf('Medicare 2.9%') === 0); near(money(r2[1]), e.med, tag + ' med'); }
    near(row('Self-employment tax'), e.se, tag + ' se');
    near(row('Half of self-employment'), -e.half, tag + ' half');
    near(row('Adjusted gross income'), e.agi, tag + ' agi');
    near(row(e.ded > STD[i.status] ? 'Itemized deductions' : 'Standard deduction'), -e.ded, tag + ' deduction');
    near(row('Qualified business income'), -e.q, tag + ' qbi');
    near(row('Taxable income'), e.taxable, tag + ' taxable');
    near(row('Federal income tax'), e.it, tag + ' income tax');
    if (e.nonref > 0.004) near(row('Child tax credit'), -e.nonref, tag + ' ctc');
    if (e.refund > 0.004) near(row('Refundable child credit'), -e.refund, tag + ' actc');
    if (e.addlSe + e.addlW > 0.006) near(row('Extra 0.9% Medicare'), e.addlSe + e.addlW, tag + ' addl');
    if (e.ret > 0.004) near(row(i.retType === 'solo' ? 'Solo 401(k)' : 'SEP-IRA'), -e.ret, tag + ' ret');
    if (e.health > 0.004) near(row('Health insurance'), -e.health, tag + ' health');
    if (e.ira > 0.004) near(row('IRA deduction'), -e.ira, tag + ' ira');
    near(row('Federal total'), e.fed, tag + ' fed total');
    near(row('All taxes'), e.all, tag + ' all');
    near(row(e.owed >= 0 ? 'Federal tax still to pay' : 'Federal refund'), Math.abs(e.owed), tag + ' owed');
    if (i.state) { const r = o.steps.find((x) => x[0].indexOf('State tax') === 0); if (e.st.known) near(money(r && r[1]), e.st.tax, tag + ' state'); else { cmp++; if (!r || !/not included/.test(r[1])) bad(tag + ' unknown state row'); } }
    /* waterfall sums to what you keep and the meter parts add up */
    { const parts = o.flow.slice(0, -1), end = o.flow[o.flow.length - 1]; near(parts.reduce((a, r) => a + r[1], 0), e.keep, tag + ' flow sum', 0.05); near(end[1], e.keep, tag + ' flow end'); parts.forEach((r) => near(money(r[2]), r[1], tag + ' flow label ' + r[0])); }
    { const sum = (cls) => o.cap.filter((c) => c[0] === cls).reduce((a, c) => a + c[1], 0); near(sum('se-m-ss'), e.ssBase, tag + ' meter under'); near(sum('se-m-over'), e.base - e.ssBase > 0.001 ? e.base - e.ssBase : 0, tag + ' meter over'); near(sum('se-m-w2'), Math.min(i.wages || 0, 184500), tag + ' meter w2'); }
    /* quarterly */
    {
      const hi = i.lastTax !== undefined && i.lastAgi !== undefined && i.lastAgi > (i.status === 'mfs' ? 75000 : 150000);
      const prior = i.lastTax === undefined ? null : i.lastTax * (hi ? 1.1 : 1), now90 = 0.9 * Math.max(0, e.fed), req = prior === null ? now90 : Math.min(now90, prior);
      const short = e.fed - e.withheld, via = Math.max(0, req - e.withheld), none = i.lastTax === 0 || short < 1000 || via <= 0;
      const each = none ? 0 : via / 4, full = Math.max(0, short) / 4;
      cmp++; if (o.qtr.length !== 5) bad(tag + ' quarterly rows ' + o.qtr.length);
      else { for (let r = 1; r <= 4; r++) { near(money(o.qtr[r][1]), each, tag + ' q min ' + r); near(money(o.qtr[r][2]), full, tag + ' q full ' + r); } if (!/passed/.test(o.qtr[3][0]) || !/next/.test(o.qtr[4][0])) bad(tag + ' due date status ' + o.qtr[3][0] + ' / ' + o.qtr[4][0]); }
      if (!none) { const due = Math.max(0, via - (i.estPaid || 0)); const m = o.qk.match(/Still due by January 15, 2027: (\$[\d,.]+)/); near(money(m && m[1]), due, tag + ' due next'); }
      else { cmp++; if (!/no estimated payments|already covers|under \$1,000/.test(o.qk)) bad(tag + ' no-payment reason missing: ' + o.qk); }
    }
    /* a payment that just arrived */
    if (i.pay) { const e2 = calc(Object.assign({}, inp, { income: inp.income + i.pay })); const set = e2.all - e.all; const m = allMoney(o.p); near(m[0], set, tag + ' set aside', 0.02); near(m[1], i.pay - set, tag + ' keep of payment', 0.02); }
    else { cmp++; if (!/Type a payment/.test(o.p)) bad(tag + ' payment prompt ' + o.p); }
    /* a job offer: the billing shown must leave the job's take-home plus its benefits */
    if (i.job) {
      const jobRow = calc(Object.assign({}, inp, { income: 0, expenses: 0, m1: 0, m2: 0, sqft: 0, farm: 0, church: 0, retAmt: 0, premiums: 0, wages: (inp.wages || 0) + i.job })), target = jobRow.keep + (i.jobBen || 0);
      const row0 = o.jobt.find((r) => r[0] === 'Billing needed a year');
      if (!row0) bad(tag + ' job result missing ' + o.job);
      else { const bill = money(row0[1]), at = calc(Object.assign({}, inp, { income: bill })); cmp++; if (!(at.keep >= target - 0.6 && (bill === 0 || at.keep - target < 60))) bad(tag + ' job bill ' + bill + ' keeps ' + at.keep.toFixed(2) + ' target ' + target.toFixed(2)); near(money(o.jobt[0][1]), jobRow.keep, tag + ' job take-home'); if (i.jobHrs) near(money(o.jobt.find((r) => r[0] === 'A billable hour')[1]), bill / i.jobHrs, tag + ' job hourly'); }
    } else { cmp++; if (!/Type a salary/.test(o.job)) bad(tag + ' job prompt ' + o.job); }
    /* what $1,000 more in the retirement plan saves */
    if (e.rmax - e.ret >= 1000) { const more = e.all - calc(Object.assign({}, inp, { retAmt: e.ret + 1000 })).all; const mm = o.stepk.match(/in your (?:solo 401\(k\)|SEP-IRA) would save about (\$[\d,.]+)/); if (more > 0.005) near(money(mm && mm[1]), more, tag + ' retirement saving', 0.02); }
    /* same take-home as a salary */
    if (o.w2v) { const sal = money((o.w2k.match(/Extra W-2 pay of (\$[\d,.]+)/) || [])[1]); const w = calc(Object.assign({}, inp, { income: 0, expenses: 0, m1: 0, m2: 0, sqft: 0, farm: 0, church: 0, retAmt: 0, premiums: 0, wages: (inp.wages || 0) + sal })); cmp++; if (!(Math.abs(w.keep - e.keep) < 60)) bad(tag + ' salary ' + sal + ' keeps ' + w.keep.toFixed(2) + ' vs ' + e.keep.toFixed(2)); near(money(o.w2[o.w2.length - 1][1]), e.keep, tag + ' w2 own keep'); }
    else { cmp++; if (e.biz + (i.church || 0) > 0) { const w0 = calc(Object.assign({}, inp, { income: 0, expenses: 0, m1: 0, m2: 0, sqft: 0, farm: 0, church: 0, retAmt: 0, premiums: 0 })); if (!(w0.keep >= e.keep - 0.01)) bad(tag + ' salary comparison hidden'); } }
    /* tax by profit table: every row */
    for (let r = 1; r < o.tab.length; r++) { const p = money(o.tab[r][0]); const none = { income: 0, expenses: 0, m1: 0, m2: 0, sqft: 0, farm: 0, church: 0 }; const t = calc(Object.assign({}, inp, none, { income: p })), b0 = calc(Object.assign({}, inp, none, { retAmt: 0, premiums: 0 })), add = t.all - b0.all; const exact = 0.51; near(money(o.tab[r][1]), t.se, tag + ' tab se ' + p, exact); near(money(o.tab[r][2]), add, tag + ' tab tax ' + p, exact); near(money(o.tab[r][3]), p - add, tag + ' tab keep ' + p, exact); cmp++; if (!(Math.abs(parseFloat(o.tab[r][4].replace('−', '-')) - add / p * 100) <= 0.0501)) bad(tag + ' tab share ' + o.tab[r][4] + ' ' + add / p); }
    /* notes react */
    if (i.expenses > 0) near(money(o.seExpNote), Math.max(0, calc(Object.assign({}, inp, { expenses: 0 })).all - e.all), tag + ' expense saving note', 0.02);
    else if (i.expenses === 0 && !/No expenses/.test(o.seExpNote)) bad(tag + ' expense note ' + o.seExpNote);
    if (i.m1 !== undefined) near(money(o.seM1Note.split('=')[1]), i.m1 * 0.725, tag + ' m1 note');
    if (i.sqft !== undefined) near(money(o.seSqftNote), e.home, tag + ' sqft note');
    if (i.retAmt !== undefined) near(money(o.seRetNote), e.ret, tag + ' ret note');
    near(money(o.seRetTypeNote), e.rmax, tag + ' ret max note');
    if (i.premiums !== undefined) near(money(o.sePremNote), e.health, tag + ' prem note');
    if (i.ira !== undefined) near(money(o.seIraNote), e.ira, tag + ' ira note');
    if (i.kids !== undefined) near(money(o.seKidsNote), e.nonref + e.refund, tag + ' kids note');
    if (o.county) bad(tag + ' county field shown'); if (o.rate !== TYPED.includes(i.state)) bad(tag + ' rate field ' + o.rate);
    if (fails.length > 40) break;
  }
  /* month by month: the yearly box adds the months, empty ones count as nothing or the average, each month shows its set-aside */
  await ctx.fill();
  await ctx.click('seMoBtn');
  { const o = await read(); cmp++; runs++; if ((await ctx.val('seIncome')) !== '92000') bad('opening the months changed the typed total'); void o; }
  const MRD = 'JSON.stringify({inc:document.getElementById("seIncome").value,ro:document.getElementById("seIncome").readOnly,note:document.getElementById("seMoNote").textContent,vis:document.getElementById("seMonWrap").style.display!=="none"&&document.getElementById("seBody").style.display!=="none",rows:[].map.call(document.querySelectorAll("#seMonT tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.trim()})}),hint:document.getElementById("seHint").style.display!=="none"?document.getElementById("seHint").textContent:""})';
  for (let k = 0; k < 60; k++) {
    const fill = pick(['zero', 'avg']), exp = pick([0, ri(0, 20000)]), vals = [];
    for (let m = 0; m < 12; m++) vals.push(R() < pick([0.15, 0.6, 0.95]) ? pick([0, ri(1, 30000), ri(1, 30000) + 0.25]) : null);
    await ctx.eval(vals.map((v, m) => '__qa.set("seMo' + (m + 1) + '",' + JSON.stringify(v === null ? '' : String(v)) + ')').join(';') + ';__qa.set("seExpenses","' + exp + '");__qa.seg("seMoFill","' + fill + '");1');
    const q = JSON.parse(await ctx.eval(MRD)), o = await read(); runs++;
    const typed = vals.filter((v) => v !== null), sum = typed.reduce((a, b) => a + b, 0), tag = 'months ' + k + ' ' + fill + ' ' + JSON.stringify(vals);
    if (!typed.length) { cmp++; if (!(q.inc === '92000' && !q.ro && !q.vis)) bad(tag + ' with no month the typed total must return: ' + q.inc); continue; }
    const total = Math.round((fill === 'avg' ? sum / typed.length * 12 : sum) * 100) / 100;
    near(Number(q.inc), total, tag + ' yearly box', 0.001); cmp++; if (!q.ro) bad(tag + ' yearly box not locked');
    near(allMoney(q.note)[0], sum, tag + ' note sum', 0.006);
    const e = calc({ status: 'single', age: 'u50', retType: 'sep', state: '', income: total, expenses: exp }), b0 = calc({ status: 'single', age: 'u50', retType: 'sep', state: '', income: 0 });
    near(money(o.big), e.se, tag + ' SE headline');
    const rate = total > 0 ? (e.all - b0.all) / total : 0;
    const want = []; vals.forEach((v) => { if (v !== null) want.push(v); else if (fill === 'avg') want.push(sum / typed.length); });
    cmp++; if (q.rows.length !== want.length + 1) { bad(tag + ' rows ' + q.rows.length + ' expected ' + (want.length + 1)); continue; }
    want.forEach((v, r) => { near(money(q.rows[r][1]), v, tag + ' paid row ' + r, 0.006); near(money(q.rows[r][2]), v * rate, tag + ' set aside row ' + r, 0.0101); near(money(q.rows[r][3]), v - v * rate, tag + ' left row ' + r, 0.0101); });
    near(money(q.rows[want.length][2]), total * rate, tag + ' year set aside', 0.02);
    if (fills(q.rows) !== (fill === 'avg' ? 12 - typed.length : 0)) bad(tag + ' estimate marks');
    cmp++;
  }
  await ctx.eval('[1,2,3,4,5,6,7,8,9,10,11,12].forEach(function(m){__qa.set("seMo"+m,"")});__qa.set("seMo4","abc");1');
  { const q = JSON.parse(await ctx.eval(MRD)); runs++; cmp++; if (!(q.inc === '92000' && /April/.test(q.hint) && /left out/.test(q.hint))) bad('bad month: ' + q.inc + ' ' + q.hint); }
  await ctx.set('seMo4', '-5'); { const q = JSON.parse(await ctx.eval(MRD)); runs++; cmp++; if (!/cannot be negative/.test(q.hint)) bad('negative month ' + q.hint); }
  await ctx.seg('seMoFill', 'avg'); await ctx.set('seMo4', '10000'); { const q = JSON.parse(await ctx.eval(MRD)); runs++; cmp++; if (q.inc !== '120000') bad('one month filled with the average should give twelve of them: ' + q.inc); }
  await ctx.seg('seMoFill', 'zero'); await ctx.click('seMoBtn'); { const q = JSON.parse(await ctx.eval(MRD)); runs++; cmp++; if (!(q.inc === '10000' && !q.ro && !q.vis)) bad('closing must keep the total editable: ' + q.inc + ' ' + q.ro); }
  await ctx.set('seIncome', '50000'); await ctx.click('seMoBtn'); { const q = JSON.parse(await ctx.eval(MRD)); runs++; cmp++; if (q.inc !== '10000') bad('reopening applies the months again: ' + q.inc); }
  await ctx.set('seMo4', ''); { const q = JSON.parse(await ctx.eval(MRD)); runs++; cmp++; if (q.inc !== '50000') bad('clearing the months returns the typed total: ' + q.inc); }
  await ctx.click('seClear'); { const q = JSON.parse(await ctx.eval(MRD)); runs++; cmp++; if (!(q.inc === '' && !q.ro && (await ctx.eval('document.getElementById("seMoIn").style.display')) === 'none')) bad('Clear fields closes the months'); }

  /* currency: amounts typed and shown in the chosen currency at the typed rate, tax worked out in dollars, IRS payments in dollars */
  const lnum = (t) => { const s = String(t).replace(/[\u00a0 ]/g, ''); const m = s.match(/(−|-)?[^\d−-]*?([\d][\d,]*(?:\.\d+)?)/); return m ? (m[1] ? -1 : 1) * parseFloat(m[2].replace(/,/g, '')) : NaN; };
  const CUR = 'JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():""};var rows=function(i){return [].map.call(document.querySelectorAll("#"+i+" tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim()})})};var u=function(i){return document.getElementById(i).closest(".fld").querySelector(".unit").textContent};return {big:g("seBig"),sub:g("seSub"),body:document.getElementById("seBody").style.display!=="none",rate:document.getElementById("seFxW").style.display!=="none",lab:g("seFxLab"),steps:rows("seSteps"),qtr:rows("seQtr"),p:g("sePOut"),mon:rows("seMonT"),job:rows("seJobTbl"),tab:rows("seTab"),uInc:u("seIncome"),uExp:u("seExpenses"),uTax:u("seLastTax"),uPaid:u("sePaid"),hint:document.getElementById("seHint").style.display!=="none"?g("seHint"):"",need:rows("seNeed")}})())';
  const cur = async () => JSON.parse(await ctx.eval(CUR));
  await ctx.fill(); await openA();
  const CODES = ['EUR', 'GBP', 'JPY', 'INR', 'CHF', 'SEK', 'ILS', 'CAD'];
  for (let k = 0; k < 40; k++) {
    const code = pick(CODES), rate = code === 'JPY' ? pick([0.0064, 0.0071]) : code === 'INR' ? 0.0119 : pick([0.27, 0.73, 1.0, 1.0837, 1.27, 1.9]), dec = code === 'JPY' ? 0 : 2, scale = code === 'JPY' ? 150 : code === 'INR' ? 80 : 1;
    const L = { income: ri(1000, 300000) * scale, expenses: ri(0, 40000) * scale, premiums: R() < 0.4 ? ri(0, 9000) * scale : 0, wages: R() < 0.3 ? ri(0, 250000) * scale : 0, pay: ri(100, 9000) * scale, job: ri(30000, 200000) * scale };
    const st = pick(['single', 'mfj']), lastTax = R() < 0.3 ? ri(0, 40000) : undefined, tag = 'cur ' + k + ' ' + code + ' ' + rate + ' ' + JSON.stringify(L);
    await ctx.eval('__qa.seg("seMode","tax");__qa.set("seCur","' + code + '");1');
    if (k % 7 === 0) { await ctx.eval('__qa.set("seFx","");1'); const e0 = await cur(); runs++; cmp++; if (e0.body || !e0.rate || e0.lab !== '1 ' + code + ' in US dollars') bad(tag + ' without a rate there must be no result ' + e0.sub); }
    await ctx.eval([['seFx', rate], ['seStatus', st], ['seIncome', L.income], ['seExpenses', L.expenses], ['sePrem', L.premiums || ''], ['seWages', L.wages || ''], ['seLastTax', lastTax === undefined ? '' : lastTax], ['seP', L.pay], ['seJob', L.job]].map((x) => '__qa.set("' + x[0] + '",' + JSON.stringify(String(x[1])) + ')').join(';') + ';1');
    const o = await cur(); runs++;
    const inp = { status: st, age: 'u50', retType: 'sep', state: '', income: L.income * rate, expenses: L.expenses * rate, premiums: L.premiums * rate, wages: L.wages * rate, lastTax }, e = calc(inp);
    const tol = (x) => Math.max(dec ? 0.0101 : 0.51, Math.abs(x) * 1e-9);
    const shown = (t, usdVal, name) => near(lnum(t), usdVal / rate, tag + ' ' + name, tol(usdVal / rate));
    if (!o.body) { bad(tag + ' no result ' + o.sub); continue; }
    shown(o.big, e.se, 'headline');
    near(money((o.sub.match(/\$[\d,.]+/) || [''])[0]), e.se, tag + ' dollar figure');
    const row = (n) => { const r = o.steps.find((x) => x[0].indexOf(n) === 0); return r ? r[1] : ''; };
    shown(row('Business profit'), e.biz, 'profit'); shown(row('Taxable income'), e.taxable, 'taxable'); shown(row('Federal total'), e.fed, 'fed');
    /* quarterly in dollars */
    const prior = lastTax === undefined ? null : lastTax, req = prior === null ? 0.9 * Math.max(0, e.fed) : Math.min(0.9 * Math.max(0, e.fed), prior), none = lastTax === 0 || e.fed - e.withheld < 1000 || req - e.withheld <= 0;
    near(money(o.qtr[4][1]), none ? 0 : (req - e.withheld) / 4, tag + ' quarter min usd'); near(money(o.qtr[4][2]), Math.max(0, e.fed - e.withheld) / 4, tag + ' quarter full usd');
    cmp++; if (!/^\$/.test(o.qtr[4][1])) bad(tag + ' quarterly not in dollars ' + o.qtr[4][1]);
    const e2 = calc(Object.assign({}, inp, { income: inp.income + L.pay * rate })), set = e2.all - e.all;
    const pm = o.p.match(/Set aside (.+?) and keep (.+?)\. It/); if (!pm) bad(tag + ' payment text ' + o.p); else { shown(pm[1], set, 'set aside'); shown(pm[2], L.pay * rate - set, 'keep'); }
    const bill = o.job.find((r) => r[0] === 'Billing needed a year'); if (!bill) bad(tag + ' job rows'); else { const jr = calc(Object.assign({}, inp, { income: 0, expenses: 0, premiums: 0, wages: inp.wages + L.job * rate })); const at = calc(Object.assign({}, inp, { income: lnum(bill[1]) * rate })); cmp++; if (!(at.keep >= jr.keep - 1.5 && at.keep - jr.keep < 80)) bad(tag + ' job bill keeps ' + at.keep + ' wants ' + jr.keep); }
    cmp++; if (!(o.uInc !== '$' || code === 'CAD')) bad(tag + ' income unit ' + o.uInc);
    cmp++; if (!(o.uTax === 'USD' && o.uPaid === 'USD')) bad(tag + ' tax return units ' + o.uTax + ' ' + o.uPaid);
    /* need mode in the chosen currency */
    if (k % 4 === 0) { const target = ri(5000, 150000) * scale; await ctx.eval('__qa.seg("seMode","need");__qa.seg("sePer","year");__qa.set("seTarget","' + target + '");1'); const n = await cur(); runs++; const billL = lnum(n.big); const at = calc(Object.assign({}, inp, { income: billL * rate })); cmp++; if (!(at.keep >= target * rate - 1.5)) bad(tag + ' need keeps ' + at.keep + ' wants ' + target * rate); }
  }
  await ctx.eval('__qa.seg("seMode","tax");__qa.set("seCur","EUR");__qa.set("seFx","0");1'); { const o = await cur(); runs++; cmp++; if (o.body || !/above 0/.test(o.hint)) bad('rate 0: ' + o.hint); }
  await ctx.set('seFx', 'abc'); { const o = await cur(); runs++; cmp++; if (o.body || !/plain number/.test(o.hint)) bad('rate abc: ' + o.hint); }
  await ctx.set('seFx', '1.2'); await ctx.set('seCur', 'GBP'); { const o = await cur(); runs++; cmp++; if (o.body || (await ctx.val('seFx')) !== '') bad('changing currency must clear the rate'); }
  await ctx.set('seCur', 'USD'); await ctx.set('seIncome', '92000'); await ctx.set('seExpenses', '12000'); { const o = await cur(); runs++; cmp++; if (!(o.body && !o.rate && o.uTax === '$' && /^\$/.test(o.big))) bad('back to dollars ' + o.big + ' ' + o.uTax); }

  /* half-typed, zero and bad values */
  await ctx.fill();
  const hostile = async (id, v, re) => { await ctx.set(id, v); const o = await read(); cmp++; runs++; if (!re.test(o.hint + ' | ' + o.sub + ' | ' + o.big)) bad('hostile ' + id + '=' + v + ' -> ' + o.hint + ' / ' + o.sub + ' / ' + o.big); };
  await hostile('seIncome', '-5', /cannot be negative/);
  await hostile('seIncome', 'abc', /plain number/);
  await hostile('seIncome', '.', /Finish typing|Finish the number/);
  await hostile('seIncome', '1000000001', /no more than/);
  await hostile('seIncome', '0', /\$0\.00/);
  await ctx.set('seIncome', '92000');
  await hostile('seExpenses', '-1', /left out for now/);
  await hostile('seExpenses', '200000', /\$0\.00/);
  await ctx.set('seExpenses', '12000');
  /* state with a county and New York City: shown, finite and above the no-county or state-only figure */
  const taxOf = async () => { const o = await read(); const r = o.steps.find((x) => x[0].indexOf('State tax') === 0); return { o, t: r ? money(r[1]) : NaN }; };
  await ctx.set('seState', 'IN'); const a = await taxOf(); runs++; cmp++; if (!a.o.county || !(a.t > 0)) bad('Indiana county field / tax ' + a.t);
  await ctx.set('seCounty', 'Marion County'); const b = await taxOf(); runs++; cmp++; if (!(b.t > a.t)) bad('Indiana county tax not added ' + a.t + ' ' + b.t);
  await ctx.set('seCounty', ''); await ctx.set('seState', 'NY'); const c = await taxOf(); await ctx.set('seState', 'NYC'); const d = await taxOf(); runs += 2; cmp++; if (!(d.t > c.t && c.t > 0)) bad('NYC tax not above NY ' + c.t + ' ' + d.t);
  for (const code of ['AL', 'AZ', 'AR', 'CA', 'CO', 'GA', 'HI', 'IA', 'KY', 'LA', 'MD', 'MA', 'MI', 'MN', 'MO', 'MT', 'NE', 'NJ', 'OH', 'OK', 'OR', 'UT', 'VA', 'WI']) { await ctx.set('seState', code); const q = await taxOf(); runs++; cmp++; if (!(q.t > 0 && q.t < 92000 * 0.13)) bad('state ' + code + ' tax implausible ' + q.t); }
  await ctx.eval('delete CalcThis.seNow;1');
  void now; void money0;
  return { runs, fails, compared: cmp };
};
