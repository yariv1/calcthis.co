/* PAY-ENGINE:START */
CalcThis.payEngine = (function () {
  var YEAR = 2026;
  var PPY = { daily: 260, weekly: 52, weekly53: 53, biweekly: 26, biweekly27: 27, semimonthly: 24, monthly: 12, quarterly: 4, semiannual: 2, annual: 1 };
  var SS_RATE = 0.062, SS_BASE = 184500, MED_RATE = 0.0145, ADDL_RATE = 0.009, ADDL_THR = 200000;
  var ALLOWANCE_OLD = 4300, STEP2_MFJ = 12900, STEP2_OTHER = 8600;
  // IRS Pub 15-T (2026), annual percentage method, checked against the IRS PDF. Rows: [floor, base, rate].
  var STD = {
    married: [[0, 0, 0], [19300, 0, .10], [44100, 2480, .12], [120100, 11600, .22], [230700, 35932, .24], [422850, 82048, .32], [531750, 116896, .35], [788000, 206583.50, .37]],
    single: [[0, 0, 0], [7500, 0, .10], [19900, 1240, .12], [57900, 5800, .22], [113200, 17966, .24], [209275, 41024, .32], [263725, 58448, .35], [648100, 192979.25, .37]],
    hoh: [[0, 0, 0], [15550, 0, .10], [33250, 1770, .12], [83000, 7740, .22], [121250, 16155, .24], [217300, 39207, .32], [271750, 56631, .35], [656150, 191171, .37]]
  };
  var CHK = {
    married: [[0, 0, 0], [16100, 0, .10], [28500, 1240, .12], [66500, 5800, .22], [121800, 17966, .24], [217875, 41024, .32], [272325, 58448, .35], [400450, 103291.75, .37]],
    single: [[0, 0, 0], [8050, 0, .10], [14250, 620, .12], [33250, 2900, .22], [60900, 8983, .24], [108938, 20512, .32], [136163, 29224, .35], [328350, 96489.63, .37]],
    hoh: [[0, 0, 0], [12075, 0, .10], [20925, 885, .12], [45800, 3870, .22], [64925, 8077.50, .24], [112950, 19603.50, .32], [140175, 28315.50, .35], [332375, 95585.50, .37]]
  };
  function tab(rows, x) {
    if (!(x > 0)) return 0;
    var r = rows[0];
    for (var i = 1; i < rows.length; i++) if (x >= rows[i][0]) r = rows[i]; else break;
    return r[1] + r[2] * (x - r[0]);
  }
  function whole(x) { return Math.floor(x + 0.5); }
  function num(v) { v = +v; return isFinite(v) ? v : 0; }

  // Federal income tax withheld for one pay period (Pub 15-T Worksheet 1A).
  function federal(o) {
    var ppy = o.ppy, annual = o.wages * ppy, aaw, rows, st = o.status;
    if (o.w4 === 'old') {
      aaw = annual - num(o.allowances) * ALLOWANCE_OLD;
      rows = STD[st === 'married' ? 'married' : 'single'];
    } else {
      var s2 = o.step2 ? 0 : (st === 'married' ? STEP2_MFJ : STEP2_OTHER);
      aaw = annual + num(o.other4a) - (num(o.ded4b) + s2);
      rows = (o.step2 ? CHK : STD)[st];
    }
    if (aaw < 0) aaw = 0;
    var tent = tab(rows, aaw) / ppy;
    var cr = o.w4 === 'old' ? 0 : num(o.credit) / ppy;
    var t = Math.max(0, tent - cr);
    return { aaw: aaw, tentative: tent, tax: t + num(o.extra) };
  }

  // Social Security / Medicare for one pay period. ytd = gross wages already paid this year (before this check).
  function fica(o) {
    var w = o.wages, ytd = o.ytd || 0, ss = 0, med = 0, add = 0;
    if (!o.exemptSS) ss = Math.max(0, Math.min(w, SS_BASE - ytd)) * SS_RATE;
    if (!o.exemptMed) {
      med = w * MED_RATE;
      add = Math.max(0, ytd + w - Math.max(ytd, ADDL_THR)) * ADDL_RATE;
    }
    return { ss: ss, med: med, addl: add };
  }

  // ---------- State income tax ----------
  // Every record is copied from the official state publication named in src (see md-files/paycheck-state-data.js).
  var STATES = {};
  var METHODS = {
    none: function () { return { tax: 0 }; },
    // annualize, subtract standard deduction + dependents/allowances, flat rate
    flatann: function (S, o) {
      var a = o.wages * o.ppy, sd = S.stdDed ? (S.stdDed[o.status] || 0) : 0;
      var ded = sd + (S.dep || 0) * num(o.allowances) + (S.allow2 || 0) * num(o.allowances2);
      var t = Math.max(0, a - ded) * S.rate / o.ppy;
      if (S.roundWhole) t = whole(t);
      return { tax: t };
    },
    // annualize, subtract standard deduction + per-allowance amount, progressive rows
    ann: function (S, o) {
      var a = o.wages * o.ppy, sd = S.stdDed ? (S.stdDed[o.status] || 0) : 0;
      var ded = sd + (S.allow || 0) * num(o.allowances) + (S.allow2 || 0) * num(o.allowances2);
      var rows = S.tab[o.status === 'married' ? 'married' : 'single'];
      return { tax: Math.max(0, tab(rows, Math.max(0, a - ded))) / o.ppy };
    },
    ca: function (S, o) {
      var a = o.wages * o.ppy, st = o.status, al = num(o.allowances), ex = num(o.allowances2);
      var key = st === 'hoh' ? 'hoh' : (st === 'married' ? (al >= 2 ? 'married2' : 'married0') : 'single');
      if (a <= S.lowIncome[key]) return { tax: 0 };
      var tx = Math.max(0, a - ex * S.estDed - S.stdDed[key]);
      var tb = st === 'hoh' ? 'hoh' : (st === 'married' ? 'married' : 'single');
      return { tax: Math.max(0, tab(S.tab[tb], tx) - al * S.credit) / o.ppy };
    },
    ny: function (S, o) {
      var a = o.wages * o.ppy, st = o.status === 'married' ? 'married' : 'single';
      var net = a - (S.ded[st] + S.exemption * num(o.allowances));
      if (net <= 0) return { tax: 0 };
      var T = S.top[st], t;
      if (net >= T.from) { var rr = T.rows[0]; for (var i = 0; i < T.rows.length; i++) if (net >= T.rows[i][0]) rr = T.rows[i]; t = net * rr[1]; }
      else t = tab(S.tab[st], net);
      return { tax: t / o.ppy };
    },
    // Alabama: Form A-4 exemption code (S / M / H) + dependents; the annual federal tax withheld is deducted
    al: function (S, o) {
      var gi = o.wages * o.ppy, st = o.status, ceil = Math.ceil;
      var sd;
      if (st === 'married') sd = gi <= 25999 ? 8500 : (gi < 35500 ? 8500 - 175 * ceil((gi - 25999) / 500) : 5000);
      else if (st === 'hoh') sd = gi <= 25999 ? 5200 : (gi < 35500 ? 5200 - 135 * ceil((gi - 25999) / 500) : 2500);
      else sd = gi <= 25999 ? 3000 : (gi < 35500 ? 3000 - 25 * ceil((gi - 25999) / 500) : 2500);
      var pe = st === 'married' || st === 'hoh' ? 3000 : 1500;
      var dp = gi <= 50000 ? 1000 : (gi <= 100000 ? 500 : 300);
      var taxable = gi - sd - o.fedTax * o.ppy - pe - dp * num(o.allowances);
      if (taxable <= 0) return { tax: 0 };
      var t = st === 'married' ? Math.min(taxable, 1000) * .02 + Math.max(0, Math.min(taxable, 6000) - 1000) * .04 + Math.max(0, taxable - 6000) * .05
        : Math.min(taxable, 500) * .02 + Math.max(0, Math.min(taxable, 3000) - 500) * .04 + Math.max(0, taxable - 3000) * .05;
      return { tax: t / o.ppy };
    }
  };
  function stateTax(code, o) {
    var S = STATES[code];
    if (!S || S.method === 'pending') return null;
    return METHODS[S.method](S, o);
  }
  // Employee-paid state payroll programs: rate on wages up to an annual wage base, using year-to-date wages.
  function programs(code, wages, ytd, ppy) {
    var S = STATES[code], out = [];
    if (!S || !S.programs) return out;
    for (var i = 0; i < S.programs.length; i++) {
      var p = S.programs[i], base = p.base || 1e12;
      var w = Math.max(0, Math.min(ytd + wages, base) - Math.min(ytd, base));
      var amt = w * p.rate;
      if (p.capAnnual) amt = Math.min(amt, p.capAnnual / ppy);   // e.g. NY disability: 0.5% of wages, at most $0.60 a week
      out.push({ name: p.name, amt: amt });
    }
    return out;
  }

  // ---------- Whole paycheck ----------
  // inp: { gross, ppy, ytd, preTax:[{amt, inc, fica, kind}], postTax:[{amt}], fed:{...}, ficaX:{exemptSS, exemptMed}, state:{code, status, allowances, allowances2, extra, exempt}, roundFed }
  function paycheck(inp) {
    var ppy = inp.ppy, g = num(inp.gross), i, pre = inp.preTax || [], post = inp.postTax || [];
    var preInc = 0, preFica = 0, preAll = 0;
    for (i = 0; i < pre.length; i++) {
      var a = num(pre[i].amt); preAll += a;
      if (pre[i].inc !== false) preInc += a;
      if (pre[i].fica) preFica += a;
    }
    var incWages = Math.max(0, g - preInc), ficaWages = Math.max(0, g - preFica);
    var fx = inp.fed || {};
    var fedR = fx.exempt ? { tax: 0, aaw: 0, tentative: 0 } : federal({
      wages: incWages, ppy: ppy, w4: fx.w4 || 'new', status: fx.status || 'single', step2: !!fx.step2, credit: fx.credit,
      other4a: fx.other4a, ded4b: fx.ded4b, extra: fx.extra, allowances: fx.allowances
    });
    var fedTax = inp.roundFed ? whole(fedR.tax) : fedR.tax;
    var fc = fica({ wages: ficaWages, ytd: inp.ytd, exemptSS: inp.ficaX && inp.ficaX.exemptSS, exemptMed: inp.ficaX && inp.ficaX.exemptMed });
    var st = inp.state || {}, stateAmt = 0, stateKnown = true, progs = [];
    if (st.code) {
      var S = STATES[st.code], stW = Math.max(0, g - preStateInc(pre, S));
      var r = stateTax(st.code, { wages: stW, ppy: ppy, status: st.status || fx.status || 'single', allowances: st.allowances, allowances2: st.allowances2, fedTax: fedTax });
      if (r === null) stateKnown = false;
      else if (!st.exempt) stateAmt = r.tax + num(st.extra);
      if (r !== null) progs = programs(st.code, ficaWages, inp.ytd || 0, ppy);
    }
    var progAll = 0; for (i = 0; i < progs.length; i++) progAll += progs[i].amt;
    var postAll = 0; for (i = 0; i < post.length; i++) postAll += num(post[i].amt);
    var net = g - preAll - fedTax - fc.ss - fc.med - fc.addl - stateAmt - progAll - postAll;
    return { gross: g, preTax: preAll, fed: fedTax, ss: fc.ss, med: fc.med, addl: fc.addl, state: stateAmt, programs: progs, programTotal: progAll, stateKnown: stateKnown, post: postAll, net: net, aaw: fedR.aaw, incWages: incWages, ficaWages: ficaWages };
  }
  function preStateInc(pre, S) {
    var s = 0;
    for (var i = 0; i < pre.length; i++) {
      if (pre[i].inc === false) continue;
      if (S && S.taxes401k && pre[i].kind === '401k') continue;
      s += num(pre[i].amt);
    }
    return s;
  }

  return { YEAR: YEAR, PPY: PPY, SS_BASE: SS_BASE, STD: STD, CHK: CHK, tab: tab, federal: federal, fica: fica, paycheck: paycheck, STATES: STATES, METHODS: METHODS, stateTax: stateTax, programs: programs, whole: whole };
})();
/* PAY-ENGINE:END */
/* PAY-STATES:START */
(function (S) {
  function none(n, extra) { var o = { name: n, method: 'none', src: 'No state tax on wages' }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  S.AK = none('Alaska'); S.FL = none('Florida'); S.NV = none('Nevada'); S.NH = none('New Hampshire'); S.SD = none('South Dakota');
  S.TN = none('Tennessee'); S.TX = none('Texas'); S.WY = none('Wyoming');
  S.WA = none('Washington', { programs: [{ name: 'WA Paid Family & Medical Leave', rate: .0113 * .7143, base: 184500 }, { name: 'WA Cares Fund', rate: .0058 }] });
  S.CA = { name: 'California', method: 'ca', src: 'https://edd.ca.gov/siteassets/files/pdf_pub_ctr/26methb.pdf', stdDed: { single: 5706, married0: 5706, married2: 11412, hoh: 11412 },
    lowIncome: { single: 18896, married0: 18896, married2: 37791, hoh: 37791 }, credit: 168.30, estDed: 1000,
    tab: {
      single: [[0, 0, .011], [11079, 121.87, .022], [26264, 455.94, .044], [41452, 1124.21, .066], [57542, 2186.15, .088], [72724, 3522.17, .1023], [371479, 34084.81, .1133], [445771, 42502.09, .1243], [742953, 79441.81, .1353], [1000000, 114220.27, .1463]],
      married: [[0, 0, .011], [22158, 243.74, .022], [52528, 911.88, .044], [82904, 2248.42, .066], [115084, 4372.30, .088], [145448, 7044.33, .1023], [742958, 68169.60, .1133], [891542, 85004.17, .1243], [1000000, 98485.50, .1353], [1485906, 164228.58, .1463]],
      hoh: [[0, 0, .011], [22173, 243.90, .022], [52530, 911.75, .044], [67716, 1579.93, .066], [83805, 2641.80, .088], [98990, 3978.08, .1023], [505208, 45534.18, .1133], [606251, 56982.35, .1243], [1000000, 105925.35, .1353], [1010417, 107334.77, .1463]]
    }, programs: [{ name: 'CA State Disability Insurance', rate: .013 }] };
  S.GA = { name: 'Georgia', method: 'flatann', src: 'https://dor.georgia.gov/document/document/2026-employers-tax-guide-updated-june-2026/download', rate: .0499, stdDed: { married: 30000, single: 15000, hoh: 15000 }, dep: 5000 };
  S.NY = { name: 'New York', method: 'ny', src: 'https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nys.pdf', ded: { single: 7400, married: 7950 }, exemption: 1000,
    tab: {
      single: [[0, 0, .039], [8500, 332, .044], [11700, 472, .0515], [13900, 586, .054], [80650, 4190, .059], [96800, 5143, .0703], [107650, 5906, .0753], [157650, 9673, .064], [215400, 13369, .1144], [265400, 19091, .0735]],
      married: [[0, 0, .039], [8500, 332, .044], [11700, 472, .0515], [13900, 586, .054], [80650, 4190, .059], [96800, 5143, .0657], [107650, 5855, .0707], [157650, 9388, .0801], [211550, 13708, .064], [323200, 20854, .1349], [373200, 27600, .0735], [1077550, 79369, .0765]]
    },
    top: { single: { from: 1077550, rows: [[1077550, .1045], [5000000, .111], [25000000, .117]] }, married: { from: 2155350, rows: [[2155350, .1045], [5000000, .111], [25000000, .117]] } },
    programs: [{ name: 'NY State Disability (SDI)', rate: .005, capAnnual: 31.20 }, { name: 'NY Paid Family Leave', rate: .00432, base: 95350 }] };
  S.IL = { name: 'Illinois', method: 'flatann', src: 'https://tax.illinois.gov/forms/withholding/currentyear/il-700-t-withholding-guide-tables.html', rate: .0495, dep: 2925, allow2: 1000 };
  S.MI = { name: 'Michigan', method: 'flatann', src: 'https://www.michigan.gov/taxes/business-taxes/withholding/calendar-year-tax-information', rate: .0425, dep: 5900 };
  S.NC = { name: 'North Carolina', method: 'flatann', src: 'https://www.ncdor.gov/income-tax-withholding-tables-and-instructions-employers/open', rate: .0409, stdDed: { single: 12750, married: 12750, hoh: 19125 }, dep: 2500, roundWhole: true };
  S.VA = { name: 'Virginia', method: 'ann', src: 'https://www.tax.virginia.gov/sites/default/files/vatax-pdf/employer-withholding-instructions.pdf', stdDed: { single: 8750, married: 8750, hoh: 8750 }, allow: 930,
    tab: { single: [[0, 0, .02], [3000, 60, .03], [5000, 120, .05], [17000, 720, .0575]], married: [[0, 0, .02], [3000, 60, .03], [5000, 120, .05], [17000, 720, .0575]] } };
  S.MN = { name: 'Minnesota', method: 'ann', programs: [{ name: 'MN Paid Leave', rate: .0044, base: 184500 }], src: 'https://www.revenue.state.mn.us/sites/default/files/2025-12/wh-inst-26.pdf', allow: 5300,
    tab: { single: [[0, 0, 0], [4700, 0, .0535], [38010, 1782.09, .068], [114130, 6958.25, .0785], [207850, 14315.27, .0985]], married: [[0, 0, 0], [14700, 0, .0535], [63400, 2605.45, .068], [208180, 12450.49, .0785], [352630, 23789.82, .0985]] } };
  S.AL = { name: 'Alabama', method: 'al', src: 'https://revenue.alabama.gov/wp-content/uploads/2026/01/whbooklet_0126.pdf' };
  S.PA = { name: 'Pennsylvania', method: 'flatann', src: 'https://www.pa.gov/agencies/revenue', rate: .0307, taxes401k: true };
})(CalcThis.payEngine.STATES);
/* PAY-STATES:END */
