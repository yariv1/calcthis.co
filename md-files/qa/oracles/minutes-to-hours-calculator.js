/* ORACLE for minutes-to-hours-calculator: an INDEPENDENT re-implementation of the maths (never CalcThis.timeConvEngine): every typed time is turned into whole MILLISECONDS with BigInt, and every displayed
   figure (both boxes, headline, label, words, formula line, clock form, every total, the 'Read as' note, the list total, the rounding row) is re-derived with exact BigInt division
   (round half up; exact ties accept either neighbour). Drives the real boxes with plain numbers, thousands commas, decimals, h:mm:ss, m:ss, unit words, and typing in either box;
   plus QA item 19 (every field reacts, prerequisite-empty cases), refusals, the list, rounding, Clear and Go simple. */
const CFG = {"kind":"min-hr","src":"m","tgt":"h","ring":"h","two":"hm","sn":"Minutes","tn":"Hours","round":true,"fillA":"90","ref":"tcRef","cases":[{"a":"90","region":"hero","want":["dec","words"]},{"a":"150","region":"hero","want":["dec","words"]},{"a":"150","region":"content","want":["dec","words","clock"]},{"a":"525","region":"content","want":["dec"]},{"a":"90","region":"faq","want":["dec"]},{"a":"150","region":"faq","want":["dec","words","clock"]},{"a":"180","region":"faq","want":["dec","clock"]},{"a":"300","region":"faq","want":["dec","clock"]},{"a":"1000","region":"faq","want":["dec","words","clock"]},{"a":"115","region":"faq","want":["dec","words","clock"]},{"a":"510","region":"faq","want":["dec"]},{"a":"470","region":"faq","want":["dec"]}],"lists":[{"text":"45\n90\n1:30","region":"faq","want":["src","dec"]}],"rounds":[{"a":"100","step":15,"regions":["faq","content"]}],"competitors":["Inch Calculator","DQYDJ","Omnicalculator"],"urls":["https://www.inchcalculator.com/convert/minute-to-hour/","https://dqydj.com/minutes-to-hours-calculator/","https://www.omnicalculator.com/conversion/minutes-to-hours-converter"],"names":["minutes","hours"]};
module.exports = async function (ctx) {
  let s = 20261110; const R = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, ri = (a, b) => a + Math.floor(R() * (b - a + 1)), pick = (a) => a[Math.floor(R() * a.length)];
  const fails = []; let runs = 0, cmp = 0;
  const MS = { s: 1000n, m: 60000n, h: 3600000n, d: 86400000n };
  const SEC = { s: 1n, m: 60n, h: 3600n, d: 86400n };
  const NM = { s: ['second', 'seconds'], m: ['minute', 'minutes'], h: ['hour', 'hours'], d: ['day', 'days'] };
  const SRC = CFG.src, TGT = CFG.tgt, RING = CFG.ring, TWO = CFG.two;
  const grp = (t) => t.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  /* exact decimal text of num/den to d places (half up), trailing zeros dropped, commas; ties accept both neighbours; tiny non-zero values show as x.xxe-n */
  function dec(num, den, d) {
    const tinyOk = d >= 6; const il = (num / den).toString().length; if (il + d > 15) d = Math.max(0, 15 - il);
    const sc = 10n ** BigInt(d), n = num * sc, q0 = n / den, r = n % den, tie = 2n * r === den, up = 2n * r >= den, q = up ? q0 + 1n : q0;
    const mk = (qq) => { const ip = qq / sc, fp = (qq % sc).toString().padStart(d, '0').replace(/0+$/, ''); return grp(ip.toString()) + (fp ? '.' + fp : ''); };
    if (q === 0n && num > 0n && tinyOk) return { tiny: true, val: Number(num) / Number(den), alts: [] };
    return { alts: tie ? [mk(q), mk(q - 1n)] : [mk(q)], tiny: false };
  }
  const D6 = (ms, unit) => dec(ms, MS[unit], 6), D2 = (ms, unit) => dec(ms, MS[unit], 2);
  const okStr = (got, f) => f.tiny ? /^\d\.\d{2}e-\d+$/.test(got) && Math.abs(parseFloat(got) / f.val - 1) < 0.01 : f.alts.indexOf(got) >= 0;
  const same = (tag, got, exp) => { cmp++; if (got !== exp) fails.push(tag + ' got [' + got + '] expected [' + exp + ']'); };
  const samef = (tag, got, f) => { cmp++; if (!okStr(got, f)) fails.push(tag + ' got [' + got + '] expected [' + (f.tiny ? '~' + f.val.toExponential(2) : f.alts.join(' or ')) + ']'); };
  const pad2 = (n) => (n < 10n ? '0' : '') + n;
  const fmtMs = (rem) => { const ip = rem / 1000n, fp = (rem % 1000n).toString().padStart(3, '0').replace(/0+$/, ''); return ip.toString() + (fp ? '.' + fp : ''); };
  const words = (ms, top) => {
    let h = 0n, m, rem;
    if (top === 'm') { m = ms / 60000n; rem = ms % 60000n; } else { h = ms / 3600000n; const r = ms % 3600000n; m = r / 60000n; rem = r % 60000n; }
    const p = []; if (h) p.push(grp(h.toString()) + ' ' + (h === 1n ? 'hour' : 'hours')); if (m) p.push(grp(m.toString()) + ' ' + (m === 1n ? 'minute' : 'minutes')); if (rem) p.push(fmtMs(rem) + ' ' + (rem === 1000n ? 'second' : 'seconds'));
    return p.length ? p.join(' ') : '0 seconds';
  };
  const clock = (ms, top) => {
    let a, m, rem; if (top === 'm') { a = null; m = ms / 60000n; rem = ms % 60000n; } else { a = ms / 3600000n; const r = ms % 3600000n; m = r / 60000n; rem = r % 60000n; }
    const si = rem / 1000n, fr = (rem % 1000n).toString().padStart(3, '0').replace(/0+$/, ''), f = fr ? '.' + fr : '';
    return top === 'm' ? m.toString() + ':' + pad2(si) + f : a.toString() + ':' + pad2(m) + ':' + pad2(si) + f;
  };
  const ratio = grp((MS[TGT] / MS[SRC]).toString());
  const uw = (u, one) => NM[u][one ? 0 : 1];
  const CAPMS = 1000000000000n * 1000n;
  const MSG = { neg: 'A time cannot be negative. Type zero or more.', nu: 'Not understood yet. Try 5400, 1:30:00 or 1h 30m.', big: 'That is too large. Keep it under 1,000,000,000,000 seconds.', hms: 'In h:mm:ss the minutes and seconds must be below 60.', ms: 'In m:ss the seconds must be below 60.', hm: 'In h:mm the minutes must be below 60.' };

  const T = (id) => ctx.text(id);
  const reset = async () => { await ctx.fill(); };
  const stateOf = async () => ({ big: await T('tcBig'), lab: await T('tcLab'), sub: await T('tcSub'), tip: await T('tcTip'), note: await T('tcNote'), hintVis: (await ctx.eval('document.getElementById("tcHint").style.display')) !== 'none', hint: await T('tcHint'), bodyVis: (await ctx.eval('document.getElementById("tcBody").style.display')) !== 'none', A: await ctx.val('tcA'), B: await ctx.val('tcB') });

  /* what the page must show for a total of `ms` milliseconds */
  async function expectAll(tag, ms, typedIn, readNote) {
    const st = await stateOf();
    if (!st.bodyVis) { fails.push(tag + ' result hidden for a valid time'); return; }
    const fT = D6(ms, TGT), fS = D6(ms, SRC);
    const bigNum = fT.tiny ? null : fT.alts[0];
    if (fT.tiny) { cmp++; if (!/^\d\.\d{2}e-\d+ (hours|minutes)$/.test(st.big)) fails.push(tag + ' tiny headline got [' + st.big + ']'); }
    else if (fT.alts.length === 1) same(tag + ' headline', st.big, bigNum + ' ' + (bigNum === '1' ? NM[TGT][0] : NM[TGT][1]));
    else samef(tag + ' headline', st.big.replace(/ (hour|hours|minute|minutes)$/, ''), fT);
    same(tag + ' label', st.lab, CFG.tn);
    same(tag + ' words', st.sub, words(ms, RING));
    if (!fT.tiny && fT.alts.length === 1 && !fS.tiny && fS.alts.length === 1) same(tag + ' formula line', st.tip, fS.alts[0] + ' ' + (fS.alts[0] === '1' ? NM[SRC][0] : NM[SRC][1]) + ' ÷ ' + ratio + ' = ' + st.big);
    samef(tag + ' decimal row', await T('tcFdec'), fT);
    samef(tag + ' 2 places row', await T('tcF2dp'), D2(ms, TGT));
    same(tag + ' clock row', await T('tcFclock'), clock(ms, RING));
    same(tag + ' words row', await T('tcFwords'), words(ms, RING));
    for (const u of ['s', 'm', 'h', 'd']) { if (u === TGT) continue; samef(tag + ' total in ' + u, await T({ s: 'tcFsec', m: 'tcFmin', h: 'tcFhr', d: 'tcFday' }[u]), D6(ms, u)); }
    if (typedIn === 'A') samef(tag + ' box B', st.B, fT); else if (typedIn === 'B') samef(tag + ' box A', st.A, fS);
    if (readNote !== undefined) same(tag + ' read-as note', st.note, readNote);
    if (st.hintVis) fails.push(tag + ' a hint shows next to a valid time: ' + st.hint);
    /* the ring: shaded share and whole count */
    const unitMs = RING === 'h' ? 3600000n : 60000n, whole = ms / unitMs, rem = ms % unitMs;
    const ringState = JSON.parse(await ctx.eval('JSON.stringify((function(){var a=document.getElementById("tcArc"),w=document.getElementById("tcWhole");return {frac:a?parseFloat(a.getAttribute("data-frac")):null,whole:w?w.textContent:""};})())'));
    cmp++; if (ringState.whole !== grp(whole.toString())) fails.push(tag + ' ring whole count got [' + ringState.whole + '] expected [' + grp(whole.toString()) + ']');
    cmp++; if (ringState.frac === null || Math.abs(ringState.frac - Number(rem) / Number(unitMs)) > 1e-9) fails.push(tag + ' ring shaded share got ' + ringState.frac + ' expected ' + Number(rem) / Number(unitMs));
  }

  /* ---------- typed-value generators: each returns { typed, ms, read } ---------- */
  const secsPer = (u) => Number(SEC[u]);
  function genPlain(unit) {
    const ip = pick([0, 1, 2, 5, 9, 10, 15, 30, 45, 59, 60, 61, 90, 100, 119, 120, 150, 180, 300, 360, 500, 900, 1000, 1200, 1800, 3599, 3600, 3601, 5400, 7200, 7260, 10000, 14400, 21600, 36000, 43200, 86399, 86400, 86401, 604800, 999999, 1000000, 99999999, ri(0, 100000), ri(0, 1000000000), ri(0, 3000), ri(0, 60)]);
    const dp = pick([0, 0, 0, 0, 1, 2, 3]); let frac = ''; for (let i = 0; i < dp; i++) frac += ri(0, 9); if (frac && /^0+$/.test(frac) && R() < 0.5) frac = frac.slice(0, -1) + '5';
    const v1000 = BigInt(ip) * 1000n + (frac ? BigInt(frac.padEnd(3, '0')) : 0n);
    let typed = String(ip) + (frac ? '.' + frac : ''); if (ip >= 1000 && !frac && R() < 0.4) typed = grp(String(ip));
    const ms = v1000 * BigInt(secsPer(unit));
    const vs = dec(v1000, 1000n, 6).alts[0], read = 'Read as ' + vs + ' ' + (vs === '1' ? NM[unit][0] : NM[unit][1]);
    return { typed, ms, read, big: ms > CAPMS };
  }
  function genClock3() {
    const h = pick([0, 1, 2, 5, 12, 24, 99, ri(0, 9999)]), m = ri(0, 59), sc = ri(0, 59), half = R() < 0.15 ? '.5' : '';
    const typed = h + ':' + pad2(BigInt(m)) + ':' + pad2(BigInt(sc)) + half, ms = (BigInt(h) * 3600n + BigInt(m) * 60n + BigInt(sc)) * 1000n + (half ? 500n : 0n);
    return { typed, ms, read: 'Read as ' + words(ms, TWO === 'ms' ? 'm' : 'h') };
  }
  function genClock2() {
    const a = pick([0, 1, 2, 5, 12, 90, ri(0, 5000)]), b = ri(0, 59), typed = a + ':' + (R() < 0.5 ? pad2(BigInt(b)) : String(b));
    const ms = TWO === 'ms' ? (BigInt(a) * 60n + BigInt(b)) * 1000n : (BigInt(a) * 3600n + BigInt(b) * 60n) * 1000n;
    return { typed, ms, read: 'Read as ' + words(ms, TWO === 'ms' ? 'm' : 'h') };
  }
  function genUnits() {
    const toks = [], nu = ri(1, 3), used = {}; let tot = 0n;
    const forms = { h: ['h', 'hr', 'hrs', 'hour', 'hours'], m: ['m', 'min', 'mins', 'minute', 'minutes'], s: ['s', 'sec', 'secs', 'second', 'seconds'], d: ['d', 'day', 'days'] };
    const order = ['d', 'h', 'm', 's'];
    for (const u of order) { if (toks.length >= nu || used[u]) continue; if (R() < 0.6) { const n = ri(0, 59); used[u] = 1; toks.push(n + (R() < 0.5 ? '' : ' ') + pick(forms[u])); tot += BigInt(n) * SEC[u]; } }
    if (!toks.length) { toks.push('5 min'); tot = 300n; }
    const typed = toks.join(R() < 0.5 ? ' ' : ' and '), ms = tot * 1000n;
    return { typed, ms, read: 'Read as ' + words(ms, 'h') };
  }
  const genAny = () => { const k = R(); return k < 0.45 ? genPlain(SRC) : k < 0.6 ? genClock3() : k < 0.75 ? genClock2() : genUnits(); };

  /* ---------- 1. typing in box A: any form ---------- */
  for (let i = 0; i < 160; i++) {
    const g = genAny(); if (g.ms > CAPMS) continue;
    await reset(); await ctx.set('tcA', g.typed); runs++;
    await expectAll('A "' + g.typed + '"', g.ms, 'A', g.read);
  }
  /* ---------- 2. typing in box B (target unit), plain decimals ---------- */
  for (let i = 0; i < 70; i++) {
    const g = genPlain(TGT); if (g.ms > CAPMS) continue;
    await reset(); await ctx.set('tcB', g.typed); runs++;
    await expectAll('B "' + g.typed + '"', g.ms, 'B', g.read);
  }
  /* ---------- 3. refusals (hint, no result, other box empty) ---------- */
  const refusals = [['-5', MSG.neg], ['-0.5', MSG.neg], ['abc', MSG.nu], ['1e3', MSG.nu], ['1:30 pm', MSG.nu], ['5 apples', MSG.nu], ['.', MSG.nu], ['1:75:00', MSG.hms], ['1:30:75', MSG.hms], [TWO === 'ms' ? '1:75' : '1:75', TWO === 'ms' ? MSG.ms : MSG.hm], ['99999999999999', MSG.big], ['１２', MSG.nu]];
  for (const [t, msg] of refusals) {
    for (const box of ['tcA', 'tcB']) {
      await reset(); await ctx.set(box, t); runs++; const st = await stateOf();
      cmp++; if (st.bodyVis || st.big !== '—') fails.push('refusal ' + box + '=' + t + ' left a result: ' + st.big);
      if (box === 'tcA') { cmp++; if (!st.hintVis || st.hint !== msg) fails.push('refusal ' + box + '=' + t + ' hint [' + st.hint + '] expected [' + msg + ']'); }
      else { cmp++; if (!st.hintVis) fails.push('refusal ' + box + '=' + t + ' shows no hint'); }
      cmp++; if ((box === 'tcA' ? st.B : st.A) !== '') fails.push('refusal ' + box + '=' + t + ' left the other box filled: ' + (box === 'tcA' ? st.B : st.A));
    }
  }
  /* cap edge: exactly 1,000,000,000,000 seconds is fine, one second more is refused */
  { const unitsAtCap = SRC === 's' ? 1000000000000n : SRC === 'm' ? 16666666666n : 0n;
    if (unitsAtCap) { await reset(); await ctx.set('tcA', unitsAtCap.toString()); runs++; await expectAll('cap-ok ' + unitsAtCap, unitsAtCap * BigInt(secsPer(SRC)) * 1000n, 'A'); await reset(); await ctx.set('tcA', (unitsAtCap + 1n).toString()); runs++; const st = await stateOf(); cmp++; if (SRC === 's' ? st.hint !== MSG.big : st.hint !== MSG.big) fails.push('cap+1 hint [' + st.hint + ']'); } }
  /* ---------- 4. every field reacts / prerequisite cases (QA item 19) ---------- */
  { await reset(); let st = await stateOf(); await ctx.set('tcA', ''); runs++; st = await stateOf();
    cmp++; if (st.bodyVis || st.big !== '—' || st.B !== '' || st.hintVis) fails.push('emptying A did not clear the result and B');
    same('guide note when empty', st.note, 'Type in either box and the other fills in. You can also type 1:30:00 or 1h 30m.');
    await ctx.set('tcB', '2'); runs++; st = await stateOf(); cmp++; if (!st.bodyVis || st.A === '') fails.push('typing in B did not fill A');
    await ctx.set('tcB', ''); runs++; st = await stateOf(); cmp++; if (st.bodyVis || st.A !== '') fails.push('emptying B did not clear A');
    await ctx.click('tcClear'); runs++; }
  /* ---------- 5. the list ---------- */
  const lineOf = () => { const k = R(); return k < 0.5 ? genPlain(SRC) : k < 0.7 ? genClock3() : k < 0.85 ? genClock2() : genUnits(); };
  for (let i = 0; i < 45; i++) {
    const n = ri(1, 8), lines = [], good = []; let tot = 0n;
    for (let j = 0; j < n; j++) { if (R() < 0.18) { lines.push(pick(['abc', '1:99', '5 apples', '-3', '', '  '])); good.push(null); continue; } const g = lineOf(); lines.push(g.typed); good.push(g); tot += g.ms; }
    const okN = good.filter(Boolean).length, badN = lines.filter((l, k) => l.trim() !== '' && good[k] === null).length;
    const sep = pick(['\n', '\n', ';', ', ']);
    await reset(); const withA = R() < 0.3; await ctx.set('tcA', withA ? '5400' : '');
    await ctx.set('tcList', lines.join(sep)); runs++; const st = await stateOf();
    if (okN === 0) { cmp++; const nb = lines.filter((l) => l.trim() !== '').length; same('list none valid note', await T('tcListNote'), nb ? 'None of the lines could be read yet. Try 5400, 1:30:00 or 1h 30m.' : 'One value per line, or separated by semicolons. Each can be 5400, 1:30:00 or 1h 30m.'); continue; }
    const fT = D6(tot, TGT), shown = st.big.replace(/ (hour|hours|minute|minutes)$/, '');
    samef('list total ' + JSON.stringify(lines), shown, fT);
    same('list label', st.lab, 'Total of ' + okN + (okN === 1 ? ' value' : ' values')); same('list words', st.sub, words(tot, RING));
    same('list note', await T('tcListNote'), okN + (okN === 1 ? ' value' : ' values') + ' read; the total is shown on the right.' + (badN ? ' ' + badN + (badN === 1 ? ' line' : ' lines') + ' could not be read and ' + (badN === 1 ? 'is' : 'are') + ' ignored.' : ''));
    same('list main note', st.note, 'Showing the total of the list in Go advanced.' + (withA ? ' The two boxes above are ignored while the list is shown.' : ''));
    const rows = await ctx.eval('document.querySelectorAll("#tcBatch tbody tr").length'); cmp++; if (rows !== lines.filter((l) => l.trim() !== '').length + 1) fails.push('list batch rows ' + rows);
    same('list clock row', await T('tcFclock'), clock(tot, RING));
    await ctx.set('tcList', ''); const st2 = await stateOf(); cmp++; if (withA ? (!st2.bodyVis || st2.hintVis) : st2.bodyVis) fails.push('clearing the list gave the wrong state (A typed: ' + withA + ')');
  }
  /* list with a broken box: ignored hint */
  { await reset(); await ctx.set('tcList', '5400\n7200'); await ctx.set('tcA', 'abc'); runs++; const st = await stateOf(); cmp++; if (!st.bodyVis || !st.hintVis || !/ignored/.test(st.hint)) fails.push('broken box next to a list: hint [' + st.hint + '] body ' + st.bodyVis); await ctx.set('tcList', ''); }
  /* ---------- 6. rounding row (minutes page) ---------- */
  if (CFG.round) {
    await reset(); await ctx.set('tcA', ''); await ctx.set('tcRound', '15'); runs++; { cmp++; same('round note before a value', await T('tcRoundNote'), 'Type a time in either box first.'); }
    for (let i = 0; i < 30; i++) {
      const g = genAny(); if (g.ms > CAPMS) continue; const step = pick([5, 6, 15]);
      await reset(); await ctx.set('tcA', g.typed); await ctx.set('tcRound', String(step)); runs++;
      const stepMs = BigInt(step) * 60000n, RS = (2n * g.ms + stepMs) / (2n * stepMs) * stepMs, vis = (await ctx.eval('document.getElementById("tcFrRow").style.display')) !== 'none';
      cmp++; if (!vis) fails.push('rounding row hidden for step ' + step);
      same('round label ' + step, await T('tcFrL'), 'Rounded to the nearest ' + step + ' minutes');
      const fr = D6(RS, 'h'); const got = await T('tcFr'); const m = got.match(/^(.*) hours \((.*)\)$/);
      cmp++; if (!m) fails.push('rounding value shape [' + got + ']'); else { samef('round decimal', m[1], fr); same('round clock', m[2], clock(RS, 'h')); }
      await ctx.set('tcRound', '0'); const vis2 = (await ctx.eval('document.getElementById("tcFrRow").style.display')) !== 'none'; cmp++; if (vis2) fails.push('rounding row still shown after No rounding');
    }
    await reset();
  }
  /* ---------- 7. Go advanced toggle clears the list ---------- */
  { await reset(); await ctx.click('tcAdvBtn'); await ctx.set('tcList', '5400'); await ctx.click('tcAdvBtn'); runs++; const v = await ctx.val('tcList'); cmp++; if (v !== '') fails.push('Go simple did not clear the list'); const a = (await ctx.eval('document.getElementById("tcAdvIn").style.display')); cmp++; if (a !== 'none') fails.push('advanced panel still open after Go simple'); }
  /* ---------- 8. More time units (hours pages, shown under Go advanced) ---------- */
  if (TGT === 'h') {
    const NAMEU = { y: ['year', 'years'], mo: ['month', 'months'], w: ['week', 'weeks'], d: ['day', 'days'], h: ['hour', 'hours'], m: ['minute', 'minutes'] };
    const MSX = { w: 604800000n, mo: 2592000000n, y: 31536000000n, d: 86400000n, h: 3600000n, m: 60000n };
    const wu = (ms, units) => { let rem = ms; const p = []; for (const u of units) { if (u === 's') { if (rem) p.push(fmtMs(rem) + ' ' + (rem === 1000n ? 'second' : 'seconds')); continue; } const n = rem / MSX[u]; rem -= n * MSX[u]; if (n) p.push(grp(n.toString()) + ' ' + NAMEU[u][n === 1n ? 0 : 1]); } return p.length ? p.join(' ') : '0 seconds'; };
    const plainMs = (typed) => { const parts = typed.replace(/,/g, "").split("."); const v1000 = BigInt(parts[0]) * 1000n + (parts[1] ? BigInt(parts[1].padEnd(3, "0")) : 0n); return v1000 * BigInt(secsPer(SRC)); };
    await reset(); const hid0 = (await ctx.eval('document.getElementById("tcMoreWrap").style.display')) === 'none'; cmp++; if (!hid0) fails.push('more units shown before Go advanced');
    await ctx.click('tcAdvBtn');
    for (let i = 0; i < 40; i++) {
      const g = i < 6 ? { typed: pick(['0', '86400', '90061.5', '8640000', '31536000', '100000000']), ms: 0n } : genAny(); let ms = g.ms;
      if (i < 6) { const p = plainMs(g.typed); ms = p; }
      if (ms > CAPMS) continue;
      await reset(); await ctx.set('tcA', g.typed); runs++;
      const vis = (await ctx.eval('document.getElementById("tcMoreWrap").style.display')) !== 'none'; cmp++; if (!vis) fails.push('more units hidden under Go advanced');
      for (const [id, u] of [['tcFwk', 'w'], ['tcFmo', 'mo'], ['tcFyr', 'y']]) { const f = dec(ms, MSX[u], 6); samef('more ' + id + ' for ' + g.typed, await T(id), f); }
      same('more days words for ' + g.typed, await T('tcFdhm'), wu(ms, ['d', 'h', 'm', 's']));
      same('more weeks words for ' + g.typed, await T('tcFwdh'), wu(ms, ['w', 'd', 'h', 'm', 's']));
      same('more years words for ' + g.typed, await T('tcFymd'), wu(ms, ['y', 'mo', 'd', 'h', 'm', 's']));
    }
    await ctx.click('tcAdvBtn'); await reset(); const hid1 = (await ctx.eval('document.getElementById("tcMoreWrap").style.display')) === 'none'; cmp++; if (!hid1) fails.push('more units still shown after Go simple');
  }
  /* a 500-line list is fast and the 501st line is dropped */
  { await reset(); const lines = []; for (let i = 0; i < 520; i++) lines.push(String(i + 1)); const t0 = Date.now(); await ctx.set('tcList', lines.join('\n')); runs++; const dt = Date.now() - t0; cmp++; if (dt > 3000) fails.push('a 520-line list took ' + dt + ' ms'); const note = await T('tcListNote'); cmp++; if (!/Only the first 500 lines are used/.test(note)) fails.push('long list note [' + note + ']'); await ctx.set('tcList', ''); }
  await reset();
  return { runs, fails: fails.slice(0, 40), compared: cmp };
};
