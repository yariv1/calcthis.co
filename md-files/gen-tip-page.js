const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /tip-calculator/ (the hub) and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json). Every number in the text comes from CalcThis.tipEngine, so text and tool agree to the cent. Run: node md-files/gen-tip-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* TIP-ENGINE:START */'), app.indexOf('/* TIP-ENGINE:END */')));
const E = CalcThis.tipEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const auto = nl(fs.readFileSync(ROOT + 'auto-loan-calculator/index.html', 'utf8'));
const hdr = auto.slice(auto.indexOf('<!--HEADER:START-->'), auto.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = auto.slice(auto.indexOf('<!--FOOTER:START-->'), auto.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = auto.slice(0, auto.indexOf('<script type="application/ld+json">'));
const m = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
const pct = (x) => String(Math.round(x * 100) / 100) + '%';
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const csel = (id) => `<div class="csel" id="${id}" data-value=""><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val"></span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const fld = (id, label, unit, ph, extra) => `<div class="fld"${extra || ''}><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></div>`;

/* ---------- numbers used in the text (all from the engine) ---------- */
const c = (bill, p, o) => E.calc(Object.assign({ bill, tax: 0, pct: p, people: 1, base: 'total', round: 'none', items: null }, o || {}));
const ex = c(86.4, 18, { people: 4 });
const t10 = c(86.4, 10), t15 = c(86.4, 15), t20 = c(86.4, 20), t18 = c(86.4, 18), t25 = c(86.4, 25);
const withTax = { pre: c(108, 20, { tax: 8, base: 'pre' }), tot: c(108, 20, { tax: 8, base: 'total' }) };
const rnd = c(86.4, 18, { round: 'tip' }), rndT = c(86.4, 18, { round: 'total' }), rndP = c(86.4, 18, { people: 4, round: 'person' });
const un = c(100, 20, { items: [32, 18.5, 49.5] });
const rv = E.reverse({ bill: 86.4, paid: 102 });
const bills = [10, 20, 30, 40, 50, 60, 75, 100, 150, 200];
const chart = bills.map((b) => '<tr><td>' + m0(b) + '</td>' + [15, 18, 20, 25].map((p) => '<td>' + m(c(b, p).tip) + '</td>').join('') + '</tr>').join('');
const svcRows = [
  ['Restaurants and bartenders', '15%–20%'], ['Food delivery', '15%–20%, depending on distance and order size'], ['Hotel room service', 'Usually already in the price; if not, 15%–20%'],
  ['Hotel housekeeping', 'Not expected; $1–$2 per person per night'], ['Hairstylists, barbers and nail services', '10%–20% (Calculator.net); newer guides say 15%–20% for hairdressers and 15%–25% for barbers'], ['Massage', '10%–20% (Calculator.net); 15%–20% (Ally, NerdWallet)'],
  ['Taxi or limo drivers', '15%–20%'], ['Shuttle drivers and parking attendants', '$1–$3'], ['Tour guides', '$1–$5, depending on the length of the tour'],
  ['Movers and furniture or appliance delivery', 'Not expected; or $5, $10 or $20 each'], ['Plumbers, cleaners and other home services', 'Not expected; or $5, $10 or $20 each']
].map((r) => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('');

const faqs = [
  ['How much should I tip at a restaurant?', `In the U.S. a tip of 15% to 20% of the bill is typical at restaurants and bars. On a ${m(86.4)} bill that is ${m(t15.tip)} at 15%, ${m(t18.tip)} at 18% and ${m(t20.tip)} at 20%. Tipping is voluntary and customs differ by country; the calculator shows the tip at every common percentage at once.`],
  ['How do I calculate a 15% tip in my head?', `Work out 10% by moving the decimal point one place to the left, then add half of that. For a ${m(86.4)} bill, 10% is ${m(t10.tip)}, half of that is ${m(E.r2(t10.tip / 2))}, so 15% is about ${m(t15.tip)}.`],
  ['How do I calculate a 20% tip in my head?', `Work out 10% and double it. On ${m(86.4)}, 10% is ${m(t10.tip)}, so 20% is ${m(t20.tip)}. For 18%, take 20% and subtract a tenth of it (${m(t20.tip)} minus ${m(E.r2(t20.tip / 10))}) to get about ${m(t18.tip)}.`],
  ['Do you tip on the total with tax or before tax?', `Both are common. Tipping on the pre-tax amount is the traditional way; tipping on the total is simpler and a little more generous. On a ${m(108)} bill that includes ${m(8)} of tax, a 20% tip is ${m(withTax.pre.tip)} before tax and ${m(withTax.tot.tip)} on the total — ${m(E.r2(withTax.tot.tip - withTax.pre.tip))} more. Enter the tax under Go advanced and the calculator shows both side by side.`],
  ['How do I split a bill and the tip between people?', `Add the tip to the bill and divide by the number of people. A ${m(86.4)} bill with an 18% tip is ${m(ex.total)}, so four people pay ${m(ex.shares[0])} each. When the total does not divide into whole cents the shares differ by a cent — here three people pay ${m(ex.shares[0])} and one pays ${m(ex.shares[3])} — and the calculator makes them add up exactly. To split by what each person ordered, tick “Split unevenly” under Go advanced: on a ${m(100)} bill with a 20% tip, a person who ordered ${m(32)} of ${m(100)} pays ${m(un.shares[0])}.`],
  ['How do I find out what percent I tipped?', `Switch the calculator to “What % did I tip?”, enter the bill and the total you paid. If the bill was ${m(86.4)} and you paid ${m(102)}, the tip was ${m(rv.tip)}, which is ${pct(rv.pct)} of the bill.`],
  ['Should I round the tip up?', `Rounding up is a common shortcut. An 18% tip on ${m(86.4)} is ${m(rnd.tipRaw)}; rounded up to a whole dollar it is ${m(rnd.tip)}, which is really ${pct(rnd.effPct)}. Rounding the whole total up to ${m(rndT.total)} gives a ${m(rndT.tip)} tip (${pct(rndT.effPct)}). The calculator always rounds up and shows the real percentage you end up tipping.`],
  ['How much do I tip for delivery, a haircut or a taxi?', 'The table above lists typical amounts for the common services. Delivery, hairstylists, barbers, massage and taxi drivers are usually 10% to 20%; hotel housekeeping, shuttle drivers and tour guides are usually a few dollars. These are customs, not rules, and they vary by country and place.']
];
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Tip Calculator', url: 'https://calcthis.co/tip-calculator/', applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Tip calculator: tip, total and each person’s share from the bill and a tip percentage. Tip before or after tax, round up, split evenly or by what each person ordered, or find the percentage you tipped.', dateModified: new Date().toISOString().slice(0, 10), inLanguage: 'en-US', isAccessibleForFree: true, applicationSubCategory: 'Tip calculator', isPartOf: { '@type': 'WebSite', name: 'CalcThis', url: 'https://calcthis.co/' }, featureList: ['Tip, total and per-person share', 'Tip on the total or before tax', 'Round the tip or total up and see the real percentage', 'Split evenly (pennies handled) or by what each person ordered', 'The tip at every common percentage', 'What percent did I tip?'] };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Tip Calculator', item: 'https://calcthis.co/tip-calculator/' }] };

const title = 'Tip Calculator — Split the Bill, Tip on Tax or Total';
const desc = 'Tip calculator: enter the bill, pick a tip % and see the tip, total and each person’s share. ' + m(86.4) + ' at 18% is ' + m(t18.tip) + '. Split evenly or by order.';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const url = 'https://calcthis.co/tip-calculator/';
const head = headTop
  .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
  .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
  .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
  .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
  .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
  .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">');
const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

const hero = `  <section class="hero">
    <div class="eyebrow">Tip calculator · split the bill</div>
    <h1>Tip Calculator</h1>
    <p>Enter the bill, pick a <strong>tip %</strong> and see the tip, the total and what each person pays. A <strong>${m(86.4)}</strong> bill at 18% is <strong>${m(t18.tip)}</strong> of tip and <strong>${m(ex.total)}</strong> in total — <strong>${m(ex.shares[0])}</strong> each between four.</p>
  </section>`;

const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to calculate a tip</h2>
        <p>Multiply the bill by the tip percentage, then add the result to the bill. A 20% tip on ${m(86.4)} is ${m(t20.tip)}, so the total is ${m(t20.total)}.</p>
        <div class="formula">
          Tip = bill × tip % ÷ 100
          <small>TOTAL = BILL + TIP</small>
        </div>
        <p>In your head: 10% is the bill with the decimal point moved one place left (${m(t10.tip)} on ${m(86.4)}). 15% is 10% plus half of it (${m(t15.tip)}). 20% is 10% doubled (${m(t20.tip)}). 25% is a quarter of the bill (${m(t25.tip)}).</p>
        <h2>Tip chart: 15%, 18%, 20% and 25%</h2>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Bill</th><th>15% tip</th><th>18% tip</th><th>20% tip</th><th>25% tip</th></tr></thead><tbody>${chart}</tbody></table></div>
        <p>Tips are rounded to the cent. Add the tip to the bill for the total.</p>
        <h2>Tip before tax or on the total?</h2>
        <p>Both are common. Tipping on the pre-tax amount is the traditional way; tipping on the total is simpler and a little more generous. On a ${m(108)} bill that includes ${m(8)} of tax, a 20% tip is <strong>${m(withTax.pre.tip)}</strong> before tax and <strong>${m(withTax.tot.tip)}</strong> on the total. Under <strong>Go advanced</strong> enter the tax and the calculator shows both.</p>
        <h2>Splitting the bill</h2>
        <p>Choose the number of people and the calculator divides the total, including the tip, and shows what each person pays. When the total does not divide into whole cents the shares differ by a cent, and they always add up exactly: ${m(ex.total)} between four is ${m(ex.shares[0])}, ${m(ex.shares[1])}, ${m(ex.shares[2])} and ${m(ex.shares[3])}.</p>
        <p>To split by what each person ordered, tick <strong>Split unevenly</strong> under Go advanced and enter each person’s amount. Everyone pays their share of the bill and the tip: ${m(32)} of a ${m(100)} bill with a 20% tip is ${m(un.shares[0])}.</p>
      </div>
      <div>
        <h2>How much to tip by service</h2>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Service</th><th>Typical tip</th></tr></thead><tbody>${svcRows}</tbody></table></div>
        <p class="st-src">Typical amounts for the U.S. and Canada as listed by <a href="https://www.calculator.net/tip-calculator.html" rel="noopener">Calculator.net</a> (read October 31, 2026). Tipping is voluntary and customs vary by country, place and service; some restaurants add a service charge to the bill.</p>
        <h2>What percent did I tip?</h2>
        <p>Switch to <strong>What % did I tip?</strong>, enter the bill and the total you paid. A ${m(86.4)} bill paid with ${m(102)} means a ${m(rv.tip)} tip, or ${pct(rv.pct)}.</p>
        <h2>Rounding the tip</h2>
        <p>Under Go advanced you can round the tip, the total or each person’s share <strong>up</strong> to a whole dollar. The calculator shows the real percentage you end up tipping: an 18% tip on ${m(86.4)} (${m(rnd.tipRaw)}) rounded up to ${m(rnd.tip)} is ${pct(rnd.effPct)}.</p>
        <h2>Use the calculator</h2>
        <p>Type the bill with tax included, pick what you are tipping for to see the usual range, choose a tip % and the number of people. The tip at every common percentage is listed below the result, so you can compare 15%, 18%, 20% and 25% without retyping. Under <strong>Go advanced</strong> you can enter the tax, tip before or after it, round up, split unevenly or change the currency symbol.</p>
        <p>This is a calculator, not advice on what to tip: tipping customs are not rules.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions about tipping</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;

const pill = (href, label, svg) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>\n        ${label}\n      </a>`;
const body = `<body class="p-loan p-stax p-tip">
<div class="wrap">

${hdr}

${hero}

  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your bill</h2>

        <div class="modeseg" id="tpModeSeg" role="group" aria-label="What to calculate">
          <button class="on" type="button" data-v="tip">Tip &amp; split</button>
          <button type="button" data-v="rev">What % did I tip?</button>
        </div>

        <div class="fld"><label class="lab" for="tpBill" id="tpBillLab">Bill, tax included <span class="unit tp-symlab">$</span></label><div class="inp"><input id="tpBill" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 86.40"></div></div>

        <div id="tpRevBox" style="display:none">
          ${fld('tpPaid', 'Total you paid, tip included', '<span class="tp-symlab">$</span>', 'e.g. 102')}
        </div>

        <div class="fld"><span class="lab">What are you tipping?</span>${csel('tpService')}</div>

        <div id="tpTipBox">
          ${fld('tpPct', 'Tip', '%', 'e.g. 18')}
          <div class="chips" id="tpPctChips" aria-label="Common tip percentages" style="margin-top:-6px;margin-bottom:6px"></div>
          <p class="st-note" id="tpRange" style="margin-top:8px"></p>

          <div id="tpPeopleFld">
            ${fld('tpPeople', 'Number of people', 'to split between', 'e.g. 4')}
            <div class="chips" id="tpPeopleChips" aria-label="Number of people" style="margin-top:-6px;margin-bottom:15px">
              <button type="button" data-n="1">1</button><button type="button" data-n="2">2</button><button type="button" data-n="3">3</button><button type="button" data-n="4">4</button><button type="button" data-n="5">5</button><button type="button" data-n="6">6</button>
            </div>
          </div>

          <div id="tpUnevenBox" style="display:none">
            <div id="tpRows"></div>
            <div class="st-addwrap"><button type="button" class="st-add" id="tpAddRow">+ Add another person</button></div>
          </div>
        </div>

        <p class="add-note ln-hint" id="tpHint" style="display:none"></p>

        <div class="chips" aria-label="Try an example">
          <button type="button" id="tpEx">See an example: $86.40 bill, 18% tip, 4 people</button>
        </div>

        <div id="tpAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${fld('tpTax', 'Tax included in the bill', '<span class="tp-symlab">$</span> optional', 'e.g. 7.35')}
          <div class="fld"><span class="lab">Tip on</span>
            <div class="modeseg" id="tpBaseSeg" role="group" aria-label="What the tip is based on"><button class="on" type="button" data-v="total">The total bill</button><button type="button" data-v="pre">Before tax</button></div>
          </div>
          <div class="fld"><span class="lab">Rounding</span>${csel('tpRound')}</div>
          <label class="dc-check" for="tpUneven"><input type="checkbox" id="tpUneven"><span>Split unevenly, by what each person ordered</span></label>
          <div class="fld"><span class="lab">Currency symbol</span>${csel('tpSym')}</div>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="tpAdvBtn" type="button">
            <span id="tpAdvBtnLab">Go advanced</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="tpResLab">Total with tip</div>
          <div class="res-big" id="tpBig">—</div>
          <div class="res-sub" id="tpSub">Enter the bill to see the tip.</div>
        </div>

        <div id="tpResults" style="display:none">
          <p class="res-tip adv-tip" id="tpTip"></p>
          <div class="fc-grp">Where your money goes</div>
          <div id="tpBar"></div>
          <div class="ln-leg" id="tpBarLeg"></div>
          <table class="dtable ln-terms" id="tpTable"></table>
          <div id="tpExtra"></div>
          <div id="tpCopyWrap" style="display:none"><button class="btn" id="tpCopy" type="button" style="margin-top:6px">Copy results</button></div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="tpMLab">Total with tip</span>
    <div class="mbar-vals"><b id="tpMVal">—</b><span id="tpMDec"></span></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${pill('/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
${pill('/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 15l6-6"/>')}
${pill('/ratio-calculator/', 'Ratio Calculator', '<path d="M5 8h14M5 16h14"/>')}
${pill('/paycheck-calculator/', 'Paycheck Calculator', '<rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/>')}
    </div>
  </div>

${content}

${ftr}

</div>

<script src="/assets/app.js?v=204"></script>
<script>CalcThis.initTipCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const dir = ROOT + 'tip-calculator/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
edit('sitemap.xml', (sm) => sm.includes('<loc>https://calcthis.co/tip-calculator/</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>https://calcthis.co/tip-calculator/</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '/tip-calculator/'") ? s : s.replace("  { file: 'auto-loan-calculator/index.html',   slug: '/auto-loan-calculator/' },\n", (mm) => mm + "  { file: 'tip-calculator/index.html',   slug: '/tip-calculator/' },\n"));
edit('llms.txt', (lt) => lt.includes('/tip-calculator/') ? lt : lt.replace(/(- \[Auto Loan Calculator[^\n]*\n)/, (mm) => mm + '- [Tip Calculator — Split the Bill, Tip on Tax or Total](https://calcthis.co/tip-calculator/): Free tip calculator. Enter the bill, pick a tip percentage and see the tip, the total and each person’s share; tip before or after tax, round up, split evenly or by what each person ordered, or work out what percent you tipped.\n'));
edit('partials/header.html', (s) => s.includes('/tip-calculator/') ? s : s.replace('          <!--STAXNAV:END-->\n', (mm) => mm + '          <a href="/tip-calculator/">Tip</a>\n'));
edit('partials/footer.html', (s) => s.includes('/tip-calculator/') ? s : s.replace('          <!--STAXFOOT:END-->\n', (mm) => mm + '          <li><a href="/tip-calculator/">Tip Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"/tip-calculator/"') ? s : s.replace('  "/auto-loan-calculator/": {', () => '  "/tip-calculator/": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/auto-loan-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Tip Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Sales Tax Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Tip Calculator", "url": "https://calcthis.co/tip-calculator/", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Tip Calculator</h3>')) {
    const card = `    <a class="calc" href="/tip-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/>
          <path d="M16 9v14M19.5 12.5c-.7-1-1.9-1.5-3.5-1.5-1.9 0-3.1.9-3.1 2.3 0 3.3 6.8 1.6 6.8 5 0 1.4-1.3 2.4-3.3 2.4-1.7 0-2.9-.6-3.7-1.7" stroke="#37503F" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <h3>Tip Calculator</h3>
      <p>The tip, the total and each person’s share from the bill and a tip %. See every common percentage at once, tip before or after tax, round up and see the real percentage, split evenly or by what each person ordered, or find the percent you tipped.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('  </div>\n  </section>\n\n  <section id="grp-paycheck"', () => card + '  </div>\n  </section>\n\n  <section id="grp-paycheck"');
  }
  if (!h.includes('<a href="/tip-calculator/">Tip</a><span>')) h = h.replace('          <li><a href="/sales-tax-calculator/">Sales tax</a><span> — by state, with exempt items and local rates</span></li>\n', (mm) => mm + '          <li><a href="/tip-calculator/">Tip</a><span> — split the bill, tip before or after tax</span></li>\n');
  return h;
});
