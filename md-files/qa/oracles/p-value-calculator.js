/* ORACLE for p-value-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.pvalueEngine). Here the distribution functions are rebuilt by NUMERICAL INTEGRATION
   of the density (composite Simpson, Stirling-series log-gamma) instead of the page's incomplete gamma / beta functions; critical values by bisection on that integral. Compared with
   what the page DISPLAYS (headline, label, verdict, three-tail table, critical values on the curve key, reverse note, built statistic) over z, t, chi-square, F and r, every tail,
   random alpha and decimals; plus the QA item 19 messages (every field reacts, prerequisite-empty cases) and the refusal texts. */
module.exports = async function (ctx) {
  let s = 20261110; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, cmp = 0;
  /* ---- own maths ---- */
  const lg = (x) => { let sh = 0; while (x < 12) { sh += Math.log(x); x += 1; } const x2 = x * x; return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + 1 / (12 * x) - 1 / (360 * x * x2) + 1 / (1260 * x * x2 * x2) - 1 / (1680 * x * x2 * x2 * x2) - sh; };
  const dens = (k, P, x) => {
    if (k === 'z') return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
    if (k === 't') return Math.exp(lg((P.df + 1) / 2) - lg(P.df / 2)) / Math.sqrt(P.df * Math.PI) * Math.pow(1 + x * x / P.df, -(P.df + 1) / 2);
    if (x <= 0) return 0;
    if (k === 'chi') return Math.exp((P.df / 2 - 1) * Math.log(x) - x / 2 - (P.df / 2) * Math.log(2) - lg(P.df / 2));
    return Math.exp(lg((P.d1 + P.d2) / 2) - lg(P.d1 / 2) - lg(P.d2 / 2) + (P.d1 / 2) * Math.log(P.d1 / P.d2) + (P.d1 / 2 - 1) * Math.log(x) - ((P.d1 + P.d2) / 2) * Math.log(1 + P.d1 * x / P.d2));
  };
  const simpson = (f, a, b, n) => { if (n % 2) n++; const h = (b - a) / n; let t = f(a) + f(b); for (let i = 1; i < n; i++) t += f(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
  const lo = (k, P, x) => {
    if (k === 'z' || k === 't') { const a = Math.abs(x), half = a === 0 ? 0 : simpson((u) => dens(k, P, u), 0, a, Math.max(2000, Math.ceil(a * 40))); return x >= 0 ? 0.5 + half : 0.5 - half; }
    if (x <= 0) return 0;
    const g = (sv) => sv === 0 ? 0 : dens(k, P, x * Math.pow(sv, 4)) * 4 * x * Math.pow(sv, 3);
    return Math.min(1, simpson(g, 0, 1, Math.max(6000, Math.ceil(x * 20))));
  };
  const pv = (k, P, x) => { const l = lo(k, P, x), h = 1 - l; return { left: l, right: h, two: Math.min(1, 2 * Math.min(l, h)) }; };
  const inv = (k, P, prob, tail) => {
    const f = (x) => (tail === 'R' ? 1 - lo(k, P, x) : lo(k, P, x)), sym = k === 'z' || k === 't';
    let a = sym ? -1000 : 0, b = sym ? 1000 : 5000;
    for (let i = 0; i < 70; i++) { const m = (a + b) / 2, fm = f(m); if (tail === 'R' ? fm > prob : fm < prob) a = m; else b = m; }
    return (a + b) / 2;
  };
  const rd = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  const fa = (x) => String(Math.round(x * 1e6) / 1e6);
  const SUPM = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  const pnum = (t) => { const m = String(t).match(/^(\d[\d.]*) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/); if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2].split('').map((c) => SUPM[c]).join(''), 10)); const v = parseFloat(t); return isNaN(v) ? null : v; };
  const nums = (t) => (String(t).replace(/−/g, '-').match(/-?\d+\.?\d*(e[+-]?\d+)?/gi) || []).map(parseFloat);
  const near = (got, exp, tag, rel, abs) => { cmp++; if (got == null || !isFinite(got) || Math.abs(got - exp) > Math.max((rel === undefined ? 1.2e-3 : rel) * Math.abs(exp), abs === undefined ? 1e-9 : abs)) { fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); return false; } return true; };
  const has = (txt, sub, tag) => { cmp++; if (String(txt).indexOf(sub) < 0) { fails.push(tag + ' text [' + txt + '] lacks [' + sub + ']'); return false; } return true; };
  const read = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var g=function(i){var e=document.getElementById(i);return e?e.textContent.replace(/\\s+/g," ").trim():"";};' +
    'var vis=function(i){var e=document.getElementById(i);return !!e&&e.style.display!=="none"&&e.getClientRects().length>0;};' +
    'var tr=[].map.call(document.querySelectorAll("#pvTails tbody tr"),function(r){return [].map.call(r.children,function(c){return c.textContent.replace(/\\s+/g," ").trim();});});' +
    'return {big:g("pvBig"),lab:g("pvLab"),sub:g("pvSub"),tip:g("pvTip"),body:vis("pvBody"),hint:vis("pvHint")?g("pvHint"):"",tails:tr,key:g("pvCurveKey"),curve:vis("pvCurveWrap"),valNote:g("pvValNote"),dfNote:g("pvDfNote"),fNote:g("pvFNote"),nNote:g("pvNNote"),aNote:g("pvAlphaNote"),tNote:g("pvTailNote"),revNote:g("pvRevNote"),buildNote:g("pvBuildNote"),decNote:g("pvDecNote"),mval:g("pvMVal"),valV:document.getElementById("pvVal").value,dfV:document.getElementById("pvDf").value,use:vis("pvUse"),useTxt:g("pvUse")};})())'));
  const advOpen = async (want) => { const o = (await ctx.eval('document.getElementById("pvAdvIn").style.display')) !== 'none'; if (o !== want) await ctx.click('pvAdvBtn'); };
  const clear = async () => { await advOpen(false); await ctx.fill(); await ctx.set('pvDf', ''); await ctx.set('pvVal', ''); await ctx.set('pvAlpha', ''); await ctx.set('pvDec', ''); await ctx.set('pvRev', ''); };
  const bad = (st) => /NaN|undefined|Infinity/.test(JSON.stringify(st));

  /* ---- 1. random runs: every statistic, every tail ---- */
  const TAILID = { two: 'pvTail2', left: 'pvTailL', right: 'pvTailR' }, TAILL = { two: 'two-tailed', left: 'left-tailed', right: 'right-tailed' };
  for (let i = 0; i < 230; i++) {
    const stat = pick(['z', 't', 't', 'chi', 'chi', 'f', 'r']), tail = pick(['two', 'left', 'right']);
    let k = stat === 'r' ? 't' : stat, P = {}, x, typed, n;
    for (let tries = 0; tries < 60; tries++) {
      if (stat === 'z') { x = rd((R() - 0.5) * 9, 2); typed = String(x); P = {}; }
      else if (stat === 't') { P = { df: pick([1, 2, 3, 5, 8, 10, 15, 20, 30, 60, 120, 5.5, 14.7]) }; x = rd((R() - 0.5) * 9, 2); typed = String(x); }
      else if (stat === 'chi') { P = { df: pick([1, 2, 3, 4, 5, 8, 10, 20, 50, 100, 7.5]) }; x = rd(R() * P.df * 2.2 + 0.05, 2); typed = String(x); }
      else if (stat === 'f') { P = { d1: pick([1, 2, 3, 4, 5, 8, 12]), d2: pick([4, 5, 8, 10, 20, 40, 120]) }; x = rd(R() * 8 + 0.05, 2); typed = String(x); }
      else { n = pick([4, 5, 8, 10, 15, 25, 40, 100]); const r = rd((R() - 0.5) * 1.8, 2); typed = String(r); const t = r * Math.sqrt((n - 2) / (1 - r * r)); P = { df: n - 2 }; x = t; }
      if (stat === 'r' && Math.abs(Number(typed)) >= 1) continue;
      const e = pv(k, P, x), pp = e[tail]; if (pp > 2e-6 && pp < 1 - 2e-6) break;
    }
    const e = pv(k, P, x), exp = e[tail];
    const alphaT = pick(['0.05', '0.05', '0.01', '5%', '0.1', '0.2', '']), alpha = alphaT === '' ? 0.05 : alphaT.endsWith('%') ? parseFloat(alphaT) / 100 : parseFloat(alphaT);
    const dec = R() < 0.2 ? pick([2, 4, 6]) : null;
    await clear(); await ctx.set('pvStat', stat);
    if (stat === 't' || stat === 'chi') await ctx.set('pvDf', String(P.df)); if (stat === 'f') { await ctx.set('pvDf1', String(P.d1)); await ctx.set('pvDf2', String(P.d2)); } if (stat === 'r') await ctx.set('pvN', String(n));
    await ctx.set('pvVal', typed); await ctx.click(TAILID[tail]); await ctx.set('pvAlpha', alphaT);
    if (dec !== null) { await advOpen(true); await ctx.set('pvDec', String(dec)); }
    const g = await read(); runs++;
    const tag = '[run ' + i + ' ' + stat + ' ' + typed + ' ' + JSON.stringify(P) + (stat === 'r' ? ' n=' + n : '') + ' ' + tail + ' a=' + alphaT + ' dec=' + dec + '] ';
    if (bad(g)) fails.push(tag + 'NaN/undefined/Infinity on the page');
    if (!g.body || !g.curve) { fails.push(tag + 'no result body'); continue; }
    if (dec !== null) { const want = exp.toFixed(dec), got = g.big; const gv = parseFloat(got); if (/less than/.test(got)) { if (!(exp < Math.pow(10, -dec))) fails.push(tag + 'dec shows less-than for p ' + exp); } else if (Math.abs(gv - parseFloat(want)) > 1.01 * Math.pow(10, -dec)) fails.push(tag + 'dec big got [' + got + '] want [' + want + ']'); cmp++; }
    else near(pnum(g.big), exp, tag + 'big');
    has(g.lab, 'p-value, ' + TAILL[tail], tag + 'lab');
    if (k === 'z' || k === 't') { const r3 = g.tails[3], r4 = g.tails[4]; if (!r3 || !r4) fails.push(tag + 'missing between / centre rows'); else if (dec === null) { near(pnum(r3[1]), 1 - e.two, tag + 'between row', 1.2e-3, 1e-9); near(pnum(r4[1]), (1 - e.two) / 2, tag + 'centre row', 1.2e-3, 1e-9); } } else { cmp++; if (g.tails.length !== 3) fails.push(tag + 'chi/F must not show between / centre rows'); }
    ['two', 'left', 'right'].forEach((t, ix) => { const row = g.tails[ix]; if (!row) { fails.push(tag + 'missing tail row ' + t); return; } if (dec === null) near(pnum(row[1]), e[t], tag + 'row ' + t); if (Math.abs(e[t] - alpha) > 1e-6) { cmp++; const want = e[t] <= alpha ? 'Significant' : 'Not significant'; if (row[2] !== want) fails.push(tag + 'row ' + t + ' verdict [' + row[2] + '] want [' + want + ']'); } });
    {
      if (Math.abs(exp - alpha) > 1e-6) { cmp++; const want = exp <= alpha ? 'At or below α = ' + fa(alpha) : 'Above α = ' + fa(alpha); if (g.sub.indexOf(want) !== 0) fails.push(tag + 'sub [' + g.sub + '] want start [' + want + ']'); }
      const cr = tail === 'right' ? [inv(k, P, alpha, 'R')] : tail === 'left' ? [inv(k, P, alpha, 'L')] : [inv(k, P, alpha / 2, 'L'), inv(k, P, alpha / 2, 'R')];
      const got = nums(g.key.slice(g.key.lastIndexOf(': ') + 1)); cmp++;
      if (got.length !== cr.length) fails.push(tag + 'crit count got ' + JSON.stringify(got) + ' expected ' + JSON.stringify(cr)); else cr.forEach((c, j) => near(got[j], c, tag + 'crit ' + j, 2e-4, 2e-4));
    }
    if (!g.valNote) fails.push(tag + 'empty value note');
    if (g.mval !== g.big) fails.push(tag + 'mbar [' + g.mval + '] <> headline [' + g.big + ']');
  }

  /* ---- 2. published anchors ---- */
  const anch = async (stat, setf, tail, want, tag) => { await clear(); await ctx.set('pvStat', stat); for (const [id, v] of setf) await ctx.set(id, v); await ctx.click(TAILID[tail]); runs++; near(pnum((await read()).big), want, 'anchor ' + tag, 1.5e-3, 1e-12); };
  await anch('t', [['pvVal', '2.1'], ['pvDf', '20']], 'two', 0.048618, 't 2.1 df 20 two (SocSci)');
  await anch('t', [['pvVal', '2.1'], ['pvDf', '20']], 'right', 0.024309, 't 2.1 df 20 one (SocSci)');
  await anch('t', [['pvVal', '2.3'], ['pvDf', '11']], 'two', 0.04203, 't 2.3 df 11 (Statology)');
  await anch('z', [['pvVal', '1.96']], 'two', 0.04999579, 'z 1.96');
  await anch('z', [['pvVal', '10']], 'two', 1.523971e-23, 'z 10');
  await anch('chi', [['pvVal', '3.841459'], ['pvDf', '1']], 'right', 0.05, 'chi 3.841459 df 1');
  await anch('f', [['pvVal', '4.9646'], ['pvDf1', '1'], ['pvDf2', '10']], 'right', 0.05, 'F 4.9646 1,10');
  await anch('z', [['pvVal', '-1.5']], 'left', 0.0668072, 'z -1.5 left');
  { await clear(); await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '50'); const g = await read(); runs++; if (!/less than 1 × 10⁻³⁰⁰|× 10⁻/.test(g.big)) fails.push('z 50 should be scientific notation, got [' + g.big + ']'); if (/^0$/.test(g.big)) fails.push('z 50 shows 0'); }

  /* ---- 3. tail defaults and switching ---- */
  { await clear(); await ctx.set('pvStat', 'chi'); let g = await read(); has(g.lab + g.tNote, 'right', 'chi default tail'); await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); g = await read(); has(g.lab, 'two-tailed', 'z default tail'); await ctx.set('pvStat', 'f'); await ctx.set('pvVal', '3'); await ctx.set('pvDf1', '3'); await ctx.set('pvDf2', '12'); g = await read(); has(g.lab, 'right-tailed', 'F default tail'); runs++; }

  /* ---- 4. reverse: p-value -> statistic ---- */
  for (let i = 0; i < 40; i++) {
    const stat = pick(['z', 't', 'chi', 'f', 'r']), tail = pick(['two', 'left', 'right']), p = pick([0.001, 0.01, 0.025, 0.03, 0.05, 0.1, 0.2, 0.37, 0.8]);
    const k = stat === 'r' ? 't' : stat; let P = {}, n;
    if (stat === 't' || stat === 'chi') P = { df: pick([1, 2, 5, 10, 20, 60]) }; if (stat === 'f') P = { d1: pick([1, 3, 5]), d2: pick([5, 10, 40]) }; if (stat === 'r') { n = pick([5, 12, 30]); P = { df: n - 2 }; }
    await clear(); await ctx.set('pvStat', stat); if (stat === 't' || stat === 'chi') await ctx.set('pvDf', String(P.df)); if (stat === 'f') { await ctx.set('pvDf1', String(P.d1)); await ctx.set('pvDf2', String(P.d2)); } if (stat === 'r') await ctx.set('pvN', String(n));
    await ctx.click(TAILID[tail]); await advOpen(true); await ctx.set('pvRev', String(p)); const g = await read(); runs++;
    const tag = '[rev ' + stat + ' ' + tail + ' p=' + p + ' ' + JSON.stringify(P) + '] ';
    const conv = (t) => stat === 'r' ? t / Math.sqrt(t * t + P.df) : t;
    let exp; const sym = k === 'z' || k === 't';
    if (tail === 'right') exp = [conv(inv(k, P, p, 'R'))]; else if (tail === 'left') exp = [conv(inv(k, P, p, 'L'))]; else if (sym) exp = [conv(inv(k, P, p / 2, 'R'))]; else exp = [conv(inv(k, P, p / 2, 'L')), conv(inv(k, P, p / 2, 'R'))];
    const seg = g.revNote.slice(g.revNote.indexOf(' needs a ')), got = nums(seg.replace(/^ needs a [^0-9±−-]*/, '').replace(/\(.*$/, ''));
    if (got.length < exp.length) fails.push(tag + 'reverse note [' + g.revNote + '] expected ' + JSON.stringify(exp)); else exp.forEach((v, j) => near(got[j], v, tag + 'rev ' + j, 3e-4, 3e-4));
  }

  /* ---- 4b. reverse from an area between -x and x / from the centre ---- */
  for (let i = 0; i < 24; i++) {
    const stat = pick(['z', 't', 'r']), kind = pick(['between', 'centre']), p = kind === 'between' ? pick([0.5, 0.9, 0.95, 0.99, 0.3]) : pick([0.25, 0.45, 0.475, 0.495, 0.1]); const k = stat === 'r' ? 't' : stat; let P = {}, n;
    if (stat === 't') P = { df: pick([2, 5, 10, 30]) }; if (stat === 'r') { n = pick([5, 12, 30]); P = { df: n - 2 }; }
    await clear(); await ctx.set('pvStat', stat); if (stat === 't') await ctx.set('pvDf', String(P.df)); if (stat === 'r') await ctx.set('pvN', String(n));
    await advOpen(true); await ctx.set('pvRevKind', kind); await ctx.set('pvRev', String(p)); const g = await read(); runs++;
    const p2 = kind === 'between' ? 1 - p : 1 - 2 * p; let ex = inv(k, P, p2 / 2, 'R'); if (stat === 'r') ex = ex / Math.sqrt(ex * ex + P.df);
    const got = nums(g.revNote.slice(g.revNote.indexOf(' needs a ')).replace(/^ needs a [^0-9±−-]*/, '')); const tag = '[rev-' + kind + ' ' + stat + ' p=' + p + ' ' + JSON.stringify(P) + '] ';
    if (!got.length) fails.push(tag + 'note [' + g.revNote + ']'); else near(got[0], ex, tag + 'x', 3e-4, 3e-4);
  }

  /* ---- 5. statistic from sample numbers ---- */
  for (let i = 0; i < 30; i++) {
    const kind = pick(['t1', 'z1', 't2', 'tp']); const o = { m1: rd(R() * 100 - 20, 1), s1: rd(R() * 10 + 0.5, 1), n1: pick([2, 5, 10, 25, 60]), m0: rd(R() * 100 - 20, 1), m2: rd(R() * 100 - 20, 1), s2: rd(R() * 10 + 0.5, 1), n2: pick([2, 6, 12, 30]) };
    let st, df, kk;
    if (kind === 't1' || kind === 'z1') { st = (o.m1 - o.m0) / (o.s1 / Math.sqrt(o.n1)); df = o.n1 - 1; kk = kind === 'z1' ? 'z' : 't'; if (kind === 'z1' && o.n1 < 1) continue; }
    else if (kind === 'tp') { const sp2 = ((o.n1 - 1) * o.s1 * o.s1 + (o.n2 - 1) * o.s2 * o.s2) / (o.n1 + o.n2 - 2); st = (o.m1 - o.m2) / Math.sqrt(sp2 * (1 / o.n1 + 1 / o.n2)); df = o.n1 + o.n2 - 2; kk = 't'; }
    else { const a = o.s1 * o.s1 / o.n1, b = o.s2 * o.s2 / o.n2; st = (o.m1 - o.m2) / Math.sqrt(a + b); df = Math.pow(a + b, 2) / (a * a / (o.n1 - 1) + b * b / (o.n2 - 1)); kk = 't'; }
    await clear(); await advOpen(true); await ctx.set('pvBuild', kind === 'tp' ? 't2' : kind); if (kind === 'tp') await ctx.click('pvPoolW'); else if (kind === 't2') { /* welch is default */ }
    if (kind === 'tp') await ctx.eval('document.querySelector("#pvPoolW button[data-v=pooled]").click()'); else await ctx.eval('document.querySelector("#pvPoolW button[data-v=welch]").click()');
    await ctx.set('pvM1', String(o.m1)); await ctx.set('pvS1', String(o.s1)); await ctx.set('pvN1', String(o.n1));
    if (kind === 't1' || kind === 'z1') await ctx.set('pvM0', String(o.m0)); else { await ctx.set('pvM2', String(o.m2)); await ctx.set('pvS2', String(o.s2)); await ctx.set('pvN2', String(o.n2)); }
    const g = await read(); runs++; const tag = '[build ' + kind + ' ' + JSON.stringify(o) + '] ';
    const got = nums(g.buildNote.replace(/^.*? gives /, ''));
    near(got[0], st, tag + 'stat', 2e-4, 2e-4); if (kk === 't') near(got[1], df, tag + 'df', 2e-4, 2e-4);
    if (!g.use) fails.push(tag + 'no use button');
    await ctx.click('pvUse'); const g2 = await read();
    near(parseFloat(g2.valV), st, tag + 'used value', 1e-5, 1e-5);
    if (kk === 't') near(parseFloat(g2.dfV), df, tag + 'used df', 1e-4, 1e-4);
    const e2 = pv(kk, kk === 't' ? { df: parseFloat(g2.dfV) } : {}, parseFloat(g2.valV)); if (e2.two > 2e-6) near(pnum(g2.big), e2.two, tag + 'p after use');
  }

  /* ---- 6. QA item 19: every field reacts; hostile inputs ---- */
  const T = async (name, setup, check) => { await clear(); await setup(); const g = await read(); runs++; if (bad(g)) fails.push(name + ': NaN/undefined/Infinity on page'); check(g, name); };
  await T('t value empty', async () => { await ctx.set('pvStat', 't'); await ctx.set('pvDf', '20'); }, (g, n) => { has(g.valNote, 'Type the t-score', n); if (g.body) fails.push(n + ': body shown'); });
  await T('t df empty', async () => { await ctx.set('pvStat', 't'); await ctx.set('pvVal', '2.1'); }, (g, n) => { has(g.dfNote, 'Type the degrees of freedom', n); has(g.valNote, 'degrees of freedom', n); if (g.body) fails.push(n + ': body shown'); });
  await T('value junk', async () => { await ctx.set('pvVal', 'abc'); }, (g, n) => { has(g.hint, 'Couldn’t read “abc”', n); if (g.body) fails.push(n + ': body shown'); });
  await T('value half typed', async () => { await ctx.set('pvVal', '-'); }, (g, n) => { has(g.hint, 'Keep typing', n); if (g.body) fails.push(n + ': body shown'); });
  await T('chi negative', async () => { await ctx.set('pvStat', 'chi'); await ctx.set('pvVal', '-1'); await ctx.set('pvDf', '3'); }, (g, n) => { has(g.hint, 'can’t be negative', n); });
  await T('F negative', async () => { await ctx.set('pvStat', 'f'); await ctx.set('pvVal', '-2'); await ctx.set('pvDf1', '3'); await ctx.set('pvDf2', '5'); }, (g, n) => { has(g.hint, 'can’t be negative', n); });
  await T('F one df only', async () => { await ctx.set('pvStat', 'f'); await ctx.set('pvVal', '3'); await ctx.set('pvDf1', '3'); }, (g, n) => { has(g.fNote, 'Type both', n); has(g.valNote, 'denominator', n); });
  await T('r = 1', async () => { await ctx.set('pvStat', 'r'); await ctx.set('pvVal', '1'); await ctx.set('pvN', '20'); }, (g, n) => { has(g.hint, 'between −1 and 1', n); });
  await T('r n too small', async () => { await ctx.set('pvStat', 'r'); await ctx.set('pvVal', '0.5'); await ctx.set('pvN', '2'); }, (g, n) => { has(g.hint, 'at least 3', n); });
  await T('r n empty', async () => { await ctx.set('pvStat', 'r'); await ctx.set('pvVal', '0.5'); }, (g, n) => { has(g.nNote, 'Type the number of pairs', n); });
  await T('df zero', async () => { await ctx.set('pvStat', 't'); await ctx.set('pvVal', '1'); await ctx.set('pvDf', '0'); }, (g, n) => { has(g.hint, 'above 0', n); });
  await T('df huge', async () => { await ctx.set('pvStat', 't'); await ctx.set('pvVal', '1'); await ctx.set('pvDf', '99999999'); }, (g, n) => { has(g.hint, 'too large', n); });
  await T('value huge', async () => { await ctx.set('pvVal', '99999999999'); }, (g, n) => { has(g.hint, 'too large', n); });
  await T('alpha junk', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await ctx.set('pvAlpha', 'abc'); }, (g, n) => { has(g.hint, 'significance level', n); has(g.sub, 'α = 0.05', n); if (!g.body) fails.push(n + ': soft error hid the result'); });
  await T('alpha 2', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await ctx.set('pvAlpha', '2'); }, (g, n) => { has(g.hint, 'between 0 and 1', n); if (!g.body) fails.push(n + ': soft error hid the result'); });
  await T('alpha empty', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await ctx.set('pvAlpha', ''); }, (g, n) => { has(g.aNote, 'No level typed', n); has(g.sub, 'α = 0.05', n); if (!g.body) fails.push(n + ': empty alpha hid the result'); });
  await T('alpha half typed', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await ctx.set('pvAlpha', '0.'); }, (g, n) => { if (!g.body) fails.push(n + ': half-typed alpha hid the result'); });
  await T('decimals 20', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await advOpen(true); await ctx.set('pvDec', '20'); }, (g, n) => { has(g.hint, 'Decimal places', n); if (!g.body) fails.push(n + ': soft error hid the result'); });
  await T('decimals 3', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await advOpen(true); await ctx.set('pvDec', '3'); }, (g, n) => { has(g.decNote, '3 decimal places', n); has(g.big, '0.050', n); });
  await T('rev junk', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await advOpen(true); await ctx.set('pvRev', 'abc'); }, (g, n) => { has(g.hint, 'p-value', n); if (!g.body) fails.push(n + ': soft error hid the result'); });
  await T('rev 0', async () => { await ctx.set('pvStat', 'z'); await ctx.set('pvVal', '1.96'); await advOpen(true); await ctx.set('pvRev', '0'); }, (g, n) => { has(g.hint, 'above 0', n); });
  await T('rev without df', async () => { await ctx.set('pvStat', 't'); await advOpen(true); await ctx.set('pvRev', '0.03'); }, (g, n) => { has(g.revNote, 'degrees of freedom', n); });
  await T('rev empty', async () => { await advOpen(true); }, (g, n) => { has(g.revNote, 'Type a p-value', n); });
  await T('build empty', async () => { await advOpen(true); }, (g, n) => { has(g.buildNote, 'Type your sample numbers', n); });
  await T('build partial', async () => { await advOpen(true); await ctx.set('pvM1', '5'); }, (g, n) => { has(g.buildNote, 'Still needed', n); });
  await T('build sd zero', async () => { await advOpen(true); await ctx.set('pvBuild', 't1'); await ctx.set('pvM1', '5'); await ctx.set('pvS1', '0'); await ctx.set('pvN1', '10'); await ctx.set('pvM0', '4'); }, (g, n) => { has(g.hint, 'above 0', n); });
  await T('build n 1 for t', async () => { await advOpen(true); await ctx.set('pvBuild', 't1'); await ctx.set('pvM1', '5'); await ctx.set('pvS1', '2'); await ctx.set('pvN1', '1'); await ctx.set('pvM0', '4'); }, (g, n) => { has(g.hint, 'at least 2', n); });

  await T('rev between 1', async () => { await ctx.set('pvStat', 'z'); await advOpen(true); await ctx.set('pvRevKind', 'between'); await ctx.set('pvRev', '1'); }, (g, n) => { has(g.hint, 'below 1', n); });
  await T('rev centre 0.6', async () => { await ctx.set('pvStat', 'z'); await advOpen(true); await ctx.set('pvRevKind', 'centre'); await ctx.set('pvRev', '0.6'); }, (g, n) => { has(g.hint, 'below 0.5', n); });
  await T('rev between on chi', async () => { await ctx.set('pvStat', 'chi'); await ctx.set('pvDf', '3'); await advOpen(true); await ctx.set('pvRevKind', 'between'); await ctx.set('pvRev', '0.9'); }, (g, n) => { has(g.revNote, 'symmetric', n); });

  /* ---- 7. hostile fuzz: random stat / tail / junk, invariants only ---- */
  const JUNK = ['', '-', '.', 'abc', '1e999', '-0', '0', '1e-300', '99999', '1,000', '5%', '0.0.1', ' 2.5 ', '+3', '１２', '1e', '1e-'];
  for (let i = 0; i < 90; i++) {
    await clear(); await advOpen(R() < 0.5);
    await ctx.set('pvStat', pick(['z', 't', 'chi', 'f', 'r'])); await ctx.click(TAILID[pick(['two', 'left', 'right'])]);
    for (const id of ['pvVal', 'pvDf', 'pvDf1', 'pvDf2', 'pvN', 'pvAlpha', 'pvDec', 'pvRev', 'pvM1', 'pvS1', 'pvN1', 'pvM0']) if (R() < 0.55) await ctx.set(id, pick(JUNK.concat(['2.1', '20', '0.05', '4', '10'])));
    const g = await read(); runs++;
    if (bad(g)) fails.push('[fuzz ' + i + '] NaN/undefined/Infinity: ' + JSON.stringify(g).slice(0, 300));
    if (g.body && (g.big === '—' || g.big === '')) fails.push('[fuzz ' + i + '] body shown with empty headline');
    if (!g.body && g.big !== '—') fails.push('[fuzz ' + i + '] result hidden but headline [' + g.big + ']');
    if (g.body) { const p = pnum(g.big); if (p !== null && (p < 0 || p > 1)) fails.push('[fuzz ' + i + '] p outside 0..1 [' + g.big + ']'); }
  }
  return { runs, fails };
};
