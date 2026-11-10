/* FINAL GATE script for seconds-to-hours-calculator (md-files/qa/final.js).
   textVsTool: every number written in the page CONTENT (lead, worked example, FAQ, the reference tables, the facts list) is re-derived by DRIVING THE TOOL and must appear in that text / row.
   extremes:   zero, one millisecond-scale values, minute/hour boundaries, the 1e12-second cap, exact round trips, and a time limit - against exact BigInt arithmetic.
   visual:     what is DRAWN (ring share, whole count, text size, tick labels, copy buttons, table fit, sticky bar, list table) re-measured from the DOM and compared with the numbers. */
const CFG = {"kind":"sec-hr","src":"s","tgt":"h","ring":"h","two":"hm","sn":"Seconds","tn":"Hours","round":false,"fillA":"5400","ref":"tcRef","cases":[{"a":"5400","region":"hero","want":["dec","words"]},{"a":"86400","region":"hero","want":["dec"]},{"a":"7260","region":"content","want":["dec","words","clock","src"]},{"a":"5400","region":"faq","want":["dec","src"]},{"a":"86400","region":"faq","want":["dec","clock"]},{"a":"7200","region":"faq","want":["dec","clock"]},{"a":"7260","region":"faq","want":["dec","words","clock"]},{"box":"tcB","a":"3","region":"faq","want":["src"]}],"lists":[{"text":"5400\n7200\n1:30:00","region":"faq","want":["src","dec"]}],"facts":[{"b":"24"},{"b":"168"},{"b":"720"},{"b":"8760"}],"competitors":["Omnicalculator","Inch Calculator","DQYDJ"],"urls":["https://www.omnicalculator.com/conversion/seconds-to-hours-converter","https://www.inchcalculator.com/convert/second-to-hour/","https://dqydj.com/seconds-to-hours-calculator/"],"names":["seconds","hours"]};
module.exports = async function (ctx) {
  const fails = [], cats = { textVsTool: 0, extremes: 0, visual: 0 }; let runs = 0;
  const MS = { s: 1000n, m: 60000n, h: 3600000n, d: 86400000n };
  const SEC = { s: 1n, m: 60n, h: 3600n, d: 86400n };
  const SRC = CFG.src, TGT = CFG.tgt, RING = CFG.ring;
  const grp = (t) => t.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dec6 = (ms, unit) => { const il = (ms / MS[unit]).toString().length; const dd = Math.min(6, Math.max(0, 15 - il)); const sc = 10n ** BigInt(dd), n = ms * sc, q0 = n / MS[unit], r = n % MS[unit], q = 2n * r >= MS[unit] ? q0 + 1n : q0; const ip = q / sc, fp = dd ? (q % sc).toString().padStart(dd, '0').replace(/0+$/, '') : ''; return { s: grp(ip.toString()) + (fp ? '.' + fp : ''), zero: q === 0n }; };
  const pad2 = (n) => (n < 10n ? '0' : '') + n;
  const fmtMs = (rem) => { const ip = rem / 1000n, fp = (rem % 1000n).toString().padStart(3, '0').replace(/0+$/, ''); return ip.toString() + (fp ? '.' + fp : ''); };
  const words = (ms, top) => { let h = 0n, m, rem; if (top === 'm') { m = ms / 60000n; rem = ms % 60000n; } else { h = ms / 3600000n; const r = ms % 3600000n; m = r / 60000n; rem = r % 60000n; } const p = []; if (h) p.push(grp(h.toString()) + ' ' + (h === 1n ? 'hour' : 'hours')); if (m) p.push(grp(m.toString()) + ' ' + (m === 1n ? 'minute' : 'minutes')); if (rem) p.push(fmtMs(rem) + ' ' + (rem === 1000n ? 'second' : 'seconds')); return p.length ? p.join(' ') : '0 seconds'; };
  const clock = (ms, top) => { let a = 0n, m, rem; if (top === 'm') { m = ms / 60000n; rem = ms % 60000n; } else { a = ms / 3600000n; const r = ms % 3600000n; m = r / 60000n; rem = r % 60000n; } const si = rem / 1000n, fr = (rem % 1000n).toString().padStart(3, '0').replace(/0+$/, ''), f = fr ? '.' + fr : ''; return top === 'm' ? m.toString() + ':' + pad2(si) + f : a.toString() + ':' + pad2(m) + ':' + pad2(si) + f; };
  const T = (id) => ctx.text(id);
  const SRCID = { s: 'tcFsec', m: 'tcFmin', h: 'tcFhr', d: 'tcFday' };
  const region = async (name) => name === 'hero' ? (await ctx.eval('document.querySelector(".hero").innerText')).replace(/\s+/g, ' ')
    : name === 'faq' ? (await ctx.eval('[].map.call(document.querySelectorAll("details.faq"),function(d){return d.textContent;}).join(" ")')).replace(/\s+/g, ' ')
    : (await ctx.eval('document.querySelector(".content").innerText')).replace(/\s+/g, ' ');
  const tool = async (box, v) => { await ctx.fill(); await ctx.set('tcA', ''); await ctx.set(box, v); runs++; return { dec: await T('tcFdec'), clock: await T('tcFclock'), words: await T('tcFwords'), src: await T(SRCID[SRC]), big: await T('tcBig'), sub: await T('tcSub') }; };
  const has = (cat, txt, str, tag) => { cats[cat]++; if (txt.indexOf(str) < 0) fails.push(cat + ' ' + tag + ': page text lacks the tool value [' + str + ']'); };

  /* ======== 1. textVsTool ======== */
  const regions = { hero: await region('hero'), faq: await region('faq'), content: await region('content') };
  for (const c of CFG.cases) {
    const t = await tool(c.box || 'tcA', c.a);
    for (const w of c.want) has('textVsTool', regions[c.region], t[w], c.region + ' [' + c.a + '] ' + w);
  }
  for (const l of CFG.lists) {
    await ctx.fill(); await ctx.set('tcA', ''); await ctx.set('tcList', l.text); runs++;
    const t = { dec: await T('tcFdec'), src: await T(SRCID[SRC]), words: await T('tcFwords') };
    for (const w of l.want) has('textVsTool', regions[l.region], t[w], l.region + ' list ' + w);
    await ctx.set('tcList', '');
  }
  for (const r of (CFG.rounds || [])) {
    await ctx.fill(); await ctx.set('tcA', ''); await ctx.set('tcA', r.a); await ctx.set('tcRound', String(r.step)); runs++;
    const got = await T('tcFr'), m = got.match(/^(.*) hours \(/); const hrs = m ? m[1] : '', mins = String(Math.round(parseFloat(hrs) * 60));
    for (const reg of r.regions) { has('textVsTool', regions[reg], hrs, reg + ' rounded ' + r.a + ' step ' + r.step + ' hours'); has('textVsTool', regions[reg], mins, reg + ' rounded ' + r.a + ' step ' + r.step + ' minutes'); }
    await ctx.set('tcRound', '0');
  }
  /* every reference / hours-to-seconds table row, against the tool (type the row's value, compare each cell by its column title) */
  const tables = JSON.parse(await ctx.eval('JSON.stringify([].map.call(document.querySelectorAll("table.tc-ref"),function(t){return {head:[].map.call(t.querySelectorAll("thead th"),function(h){return h.textContent.trim();}),rows:[].map.call(t.querySelectorAll("tbody tr"),function(r){return {v:r.getAttribute("data-v"),cells:[].map.call(r.children,function(c){return c.textContent.trim();})};})};}))'));
  for (const tb of tables) {
    for (const row of tb.rows) {
      const t = await tool('tcA', row.v); const bySrc = t.src;
      tb.head.forEach((h, i) => {
        let exp = null;
        if (/^(Hours:min:sec|Minutes:seconds)$/.test(h)) exp = t.clock;
        else if (h === CFG.sn) exp = bySrc;
        else if (h === CFG.tn || /^Decimal hours$/.test(h)) exp = t.dec;
        if (exp === null) { fails.push('textVsTool table column [' + h + '] has no tool counterpart'); cats.textVsTool++; return; }
        cats.textVsTool++; if (row.cells[i] !== exp) fails.push('textVsTool table [' + tb.head.join('|') + '] value ' + row.v + ' column ' + h + ': text ' + row.cells[i] + ' vs tool ' + exp);
      });
    }
  }
  /* the stated day / week / month / year seconds (hours page) */
  if (CFG.facts) for (const f of CFG.facts) { const t = await tool('tcB', f.b); has('textVsTool', regions.content + ' ' + regions.faq, t.src, 'fact ' + f.b + ' ' + TGT); }

  /* ======== 2. extremes ======== */
  const ex = async (box, typed, ms, tag) => {
    const t = await tool(box, typed); const ut = box === 'tcA' ? SRC : TGT;
    cats.extremes++; const e0 = dec6(ms, TGT), e1 = e0.s; if (e0.zero && ms > 0n) { if (!/e-/.test(t.dec)) fails.push('extremes ' + tag + ' tiny value should show as an exponent, got ' + t.dec); } else if (t.dec !== e1) fails.push('extremes ' + tag + ' decimal got ' + t.dec + ' expected ' + e1);
    cats.extremes++; if (t.words !== words(ms, RING)) fails.push('extremes ' + tag + ' words got [' + t.words + '] expected [' + words(ms, RING) + ']');
    cats.extremes++; if (t.clock !== clock(ms, RING)) fails.push('extremes ' + tag + ' clock got [' + t.clock + '] expected [' + clock(ms, RING) + ']');
  };
  const per = (u) => BigInt(SEC[u]) * 1000n;
  await ex('tcA', '0', 0n, 'zero');
  await ex('tcA', '1', per(SRC), 'one unit');
  await ex('tcA', '59', 59n * per(SRC), '59');
  await ex('tcA', '60', 60n * per(SRC), '60');
  await ex('tcA', '61', 61n * per(SRC), '61');
  await ex('tcA', '3599', 3599n * per(SRC), '3599');
  await ex('tcA', '3600', 3600n * per(SRC), '3600');
  await ex('tcA', '3601', 3601n * per(SRC), '3601');
  await ex('tcA', '86400', 86400n * per(SRC), '86400');
  await ex('tcA', '999,999,999', 999999999n * per(SRC), '999,999,999 with commas');
  await ex('tcA', '0.001', per(SRC) / 1000n, '0.001');
  await ex('tcA', '1:00:00', 3600000n, '1:00:00');
  await ex('tcA', SRC === 's' ? '1000000000000' : '16666666666', (SRC === 's' ? 1000000000000n : 16666666666n) * per(SRC), 'cap edge');
  await ex('tcB', '2.5', 25n * MS[TGT] / 10n, 'B 2.5');
  await ex('tcB', '0.25', 25n * MS[TGT] / 100n, 'B 0.25');
  /* exact round trips: type in B, read A, type A back, B returns */
  for (const v of ['0.5', '1.25', '3', '12.75', '100']) {
    await ctx.fill(); await ctx.set('tcA', ''); await ctx.set('tcB', v); runs++; const a = await ctx.val('tcA'); await ctx.set('tcB', ''); await ctx.set('tcA', a); runs++; const b = await ctx.val('tcB');
    cats.extremes++; if (parseFloat(b.replace(/,/g, '')) !== parseFloat(v)) fails.push('extremes round trip ' + v + ' -> ' + a + ' -> ' + b);
  }
  { const t0 = Date.now(); const lines = []; for (let i = 1; i <= 500; i++) lines.push(String(i * 7)); await ctx.fill(); await ctx.set('tcList', lines.join('\n')); const dt = Date.now() - t0; cats.extremes++; if (dt > 3000) fails.push('extremes time limit: 500-line list took ' + dt + ' ms'); let tot = 0n; for (let i = 1; i <= 500; i++) tot += BigInt(i * 7) * per(SRC); cats.extremes++; const got = await T('tcFdec'); if (got !== dec6(tot, TGT).s) fails.push('extremes 500-line total got ' + got + ' expected ' + dec6(tot, TGT).s); await ctx.set('tcList', ''); }

  /* ======== 3. visual ======== */
  const ringOf = async () => JSON.parse(await ctx.eval('JSON.stringify((function(){var a=document.getElementById("tcArc"),w=document.getElementById("tcWhole"),svg=document.getElementById("tcRing");var da=a&&a.getAttribute("stroke-dasharray")?a.getAttribute("stroke-dasharray").split(" ").map(parseFloat):null;var sc=svg.getBoundingClientRect().width/280;var tx=[].map.call(svg.querySelectorAll("text"),function(t){return {t:t.textContent,px:parseFloat(getComputedStyle(t).fontSize)*sc};});return {frac:a?parseFloat(a.getAttribute("data-frac")):null,c:a?parseFloat(a.getAttribute("data-c")):null,da:da,whole:w?w.textContent:"",texts:tx,cap:document.getElementById("tcRingCap").textContent};})())'));
  const unitMs = RING === 'h' ? 3600000n : 60000n;
  for (const typed of ['1', '90', '3600', '5400', '7260', '10000', '86400', '1000', '45', '999999']) {
    const ms = BigInt(Math.round(parseFloat(typed) * 1000)) * BigInt(SEC[SRC]); await tool('tcA', typed); const r = await ringOf(), rem = ms % unitMs, want = Number(rem) / Number(unitMs);
    cats.visual++; if (Math.abs(r.frac - want) > 1e-9) fails.push('visual ring share for ' + typed + ': drawn ' + r.frac + ' expected ' + want);
    cats.visual++; if (r.da && Math.abs(r.da[0] / r.c - want) > 1e-5) fails.push('visual ring dash length for ' + typed + ': ' + (r.da[0] / r.c) + ' vs ' + want);
    cats.visual++; if (r.whole !== grp((ms / unitMs).toString())) fails.push('visual ring whole count for ' + typed + ': ' + r.whole);
    if (rem > 0n) { cats.visual++; if (r.cap.indexOf(words(rem, 'h')) < 0) fails.push('visual caption for ' + typed + ' lacks [' + words(rem, 'h') + ']: ' + r.cap); }
    const small = r.texts.filter((x) => x.px < 11); cats.visual++; if (small.length) fails.push('visual ring text under 11px rendered: ' + small.map((x) => x.t + '=' + x.px.toFixed(1)).join(', '));
    const ticks = r.texts.map((x) => x.t); cats.visual++; if (['0', '15', '30', '45'].some((k) => ticks.indexOf(k) < 0)) fails.push('visual ring tick labels missing: ' + ticks.join(','));
  }
  { await tool('tcA', '5400'); const o = JSON.parse(await ctx.eval('JSON.stringify((function(){var card=document.querySelectorAll(".card")[1].getBoundingClientRect(),t=document.getElementById("tcFormats").getBoundingClientRect(),rows=document.querySelectorAll("#tcFormats tbody tr"),vis=[].filter.call(rows,function(r){return r.style.display!=="none";}),btn=document.querySelectorAll("#tcFormats .tc-cp"),empty=[].filter.call(vis,function(r){return !r.children[1].textContent.trim();}).length;return {fit:t.right<=card.right+1&&t.left>=card.left-1,rows:vis.length,btns:[].filter.call(btn,function(b){return b.closest("tr").style.display!=="none";}).length,empty:empty,mbar:document.getElementById("tcMVal")?document.getElementById("tcMVal").textContent:"",big:document.getElementById("tcBig").textContent};})())'));
    cats.visual++; if (!o.fit) fails.push('visual formats table pokes out of the card');
    cats.visual++; if (o.rows !== o.btns) fails.push('visual copy buttons ' + o.btns + ' vs rows ' + o.rows);
    cats.visual++; if (o.empty) fails.push('visual ' + o.empty + ' empty value cells in the formats table');
    cats.visual++; if (o.mbar !== o.big) fails.push('visual sticky bar [' + o.mbar + '] differs from the headline [' + o.big + ']'); }
  { await ctx.fill(); await ctx.set('tcA', ''); await ctx.set('tcList', '5400\n7200\n1:30:00'); runs++; const o = JSON.parse(await ctx.eval('JSON.stringify((function(){var rows=document.querySelectorAll("#tcBatch tbody tr"),last=rows[rows.length-1];return {n:rows.length,tot:last.children[1].textContent,card:document.querySelectorAll(".card")[1].getBoundingClientRect().right,tr:document.getElementById("tcBatch").getBoundingClientRect().right};})())'));
    cats.visual++; if (o.n !== 4) fails.push('visual list table rows ' + o.n); cats.visual++; if (o.tot !== await T('tcFdec')) fails.push('visual list total cell [' + o.tot + '] vs tool [' + await T('tcFdec') + ']'); cats.visual++; if (o.tr > o.card + 1) fails.push('visual list table pokes out of the card'); await ctx.set('tcList', ''); }
  { for (const tb of tables.slice(0, 1)) { const v = tb.rows[Math.min(2, tb.rows.length - 1)].v; await ctx.fill(); await ctx.set('tcA', ''); await ctx.eval('document.querySelector(\'table.tc-ref tr[data-v="' + v + '"]\').click()'); const a = await ctx.val('tcA'); cats.visual++; if (a !== v) fails.push('visual reference row click filled [' + a + '] instead of [' + v + ']'); cats.visual++; if ((await T('tcBig')) === '—') fails.push('visual reference row click left no result'); } }
  await ctx.fill();
  return { fails: fails.slice(0, 40), cats, runs };
};
