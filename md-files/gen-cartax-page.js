const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Writes /car-sales-tax-calculator/ and registers it everywhere (sitemap, build.js PAGES, llms.txt, header + footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json, inbound links). Every number in the text comes from CalcThis.carTaxEngine in assets/app.js.  Run: node md-files/gen-cartax-page.js  then  node build.js */
global.CalcThis = {};
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
eval(app.slice(app.indexOf('/* SALESTAX-ENGINE:START */'), app.indexOf('/* SALESTAX-ENGINE:END */')));
eval(app.slice(app.indexOf('/* CARTAX-ENGINE:START */'), app.indexOf('/* CARTAX-ENGINE:END */')));
const E = CalcThis.carTaxEngine, SE = CalcThis.saleTaxEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const auto = nl(fs.readFileSync(ROOT + 'auto-loan-calculator/index.html', 'utf8'));
const hdr = auto.slice(auto.indexOf('<!--HEADER:START-->'), auto.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = auto.slice(auto.indexOf('<!--FOOTER:START-->'), auto.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = auto.slice(0, auto.indexOf('<script type="application/ld+json">'));
const m = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (x) => String(Math.round(x * 10000) / 10000) + '%';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const fld = (id, label, unit, ph) => `<div class="fld"><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></div>`;

/* ---------- numbers for the text (all from the engine) ---------- */
const base = { price: 30000, trade: 10000, rebate: 0, doc: 0, gov: 0, place: null, local: 0, own: null, used: false, assume: {} };
const tx = (s, extra) => E.compute(Object.assign({}, base, { state: s }, extra || {}));
const T = (s, extra) => { const r = tx(s, extra); return r.hi.tax; };
const cmp = ['NC', 'MI', 'VA', 'TX', 'GA'].map((c) => [E.stateName(c), T(c)]).sort((a, b) => a[1] - b[1]);
const txLo = tx('TX', { rebate: 1000, doc: 500 });
const miBig = tx('MI', { price: 40000, trade: 20000 });
const vaRebate = tx('VA', { price: 30000, trade: 10000, rebate: 1000 });
const caP = { sales: 9.5, label: 'a city at 9.5%' };
const ca = tx('CA', { place: caP });
const flP = { sales: 7 }, fl = tx('FL', { place: flP, price: 20000, trade: 0 }), flFlat = 20000 * 0.07;
const vaMin = tx('VA', { price: 1000, trade: 0 });
const arNew = tx('AR', { price: 30000, trade: 10000, local: 3 }), arUsed = tx('AR', { price: 8000, trade: 0, local: 3, used: true }), arUsedFlat = tx('AR', { price: 8000, trade: 0, local: 3, used: false });
const ny = tx('NY', { assume: { trade: true } }), nyNo = tx('NY', { assume: { trade: false } });

const faqs = [
  ['How is car sales tax calculated?', `Take the taxed amount — usually the price plus any taxed dealer fee, less whatever your state lets you subtract — and multiply it by the vehicle tax rate. Each state decides what comes off: a trade-in, a manufacturer rebate and the dealer doc fee are treated differently from state to state. On a $30,000 car with a $10,000 trade-in the tax is ${m(T('NC'))} in North Carolina, ${m(T('MI'))} in Michigan, ${m(T('VA'))} in Virginia, ${m(T('TX'))} in Texas and ${m(T('GA'))} in Georgia.`],
  ['Does a trade-in lower the sales tax on a car?', `In most states it does, but not everywhere. Texas, Florida, Georgia (dealer sales), North Carolina, Missouri, Arkansas and Arizona take the trade-in off the taxed amount. Michigan does too, up to $12,000 in 2026. California and Virginia do not: on the same $30,000 car with a $10,000 trade-in Virginia still taxes the full $30,000, so the tax is ${m(T('VA'))} instead of ${m(30000 * 0.0415 - 10000 * 0.0415)}.`],
  ['Are manufacturer rebates taxed?', `It depends on the state. In Virginia the price is taken after rebates and incentives, so a $1,000 rebate on a $30,000 car with a $10,000 trade-in lowers the tax from ${m(T('VA'))} to ${m(vaRebate.hi.tax)}. California, Michigan and Arkansas keep the rebate in the taxed amount, and Missouri and Arizona let it reduce the tax. For Texas, Florida, Georgia and North Carolina the official pages we read do not settle it, so the calculator shows the tax both ways instead of guessing.`],
  ['Is the dealer doc fee taxed?', `In California, Florida, Georgia, North Carolina, Virginia and Michigan the doc fee is part of the taxed price. For Texas, Missouri, Arkansas and Arizona the official pages we read do not say, so the calculator shows both results: on a $30,000 car with a $10,000 trade-in, a $500 doc fee and a $1,000 rebate the Texas tax is between ${m(txLo.lo.tax)} and ${m(txLo.hi.tax)}.`],
  ['Do I pay tax where I buy the car or where I live?', 'Where you register it, in the states we have checked: Missouri adds the local tax of the city or county where you live, Florida uses the county of your address on the title, and California uses the rate of the place where the vehicle is registered. Texas collects the 6.25% motor vehicle tax through your county tax office. Florida, for example, charges its own tax on a vehicle bought elsewhere and then titled there, with credit for tax already paid to the other state, so buying in a lower-tax state does not simply avoid it.'],
  ['Is the title and registration fee taxed?', 'The calculator adds title and registration fees to your total but does not tax them. Florida’s Department of Revenue states that fees mandated by state law for titling, licensing or registering a vehicle are not subject to tax; check the other states’ rules for your own bill.'],
  ['How much is the minimum vehicle tax in Virginia?', `Virginia charges 4.15% of the gross sales price and its Department of Motor Vehicles says the amount due is based on the price or $75, whichever is greater. On a $1,000 vehicle that is ${m(vaMin.hi.tax)} rather than ${m(1000 * 0.0415)}.`],
  ['What about Florida’s county surtax?', `Florida adds your county’s surtax to the 6% state tax on only the first $5,000 of the price. On a $20,000 car in a county at 7% in total the tax is ${m(fl.hi.tax)}, not ${m(flFlat)}. Pick your county or city and the calculator applies the limit.`],
  ['What if my state is not on your list?', `The calculator uses the state’s general sales tax rate and lets you choose whether the trade-in comes off, whether a rebate comes off and whether the doc fee is taxed — because we have not checked that state’s vehicle rules yet. In New York at ${pct(SE.STATES.NY.base)} the same $30,000 car with a $10,000 trade-in is taxed ${m(ny.hi.tax)} if the trade-in comes off and ${m(nyNo.hi.tax)} if it does not. Add your local tax rate for a fuller estimate, and confirm the rules with your state.`]
];

const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Car Sales Tax Calculator', url: 'https://calcthis.co/car-sales-tax-calculator/', applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Car sales tax calculator: vehicle price, trade-in, manufacturer rebate and doc fee give the tax under each state’s own rules, with the rules shown in plain words and the same car compared across states.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
const url = 'https://calcthis.co/car-sales-tax-calculator/';
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Car Sales Tax Calculator', item: url }] };
const title = 'Car Sales Tax Calculator 2026 — Trade-In Rules by State';
const desc = 'Car sales tax calculator: price, trade-in, rebate and doc fee under official rules for 10 states. California and Virginia tax the full price.';

const rows = E.VERIFIED.map((c) => {
  const r = E.RULES[c];
  const rate = r.kind === 'place' ? (c === 'FL' ? '6% + county surtax (first $5,000)' : 'by place') : (r.local === 'typed' ? pct(r.rate) + ' + local' : pct(r.rate) + (r.minTax ? ', $75 minimum' : ''));
  const tradeT = r.trade === 'none' ? 'No credit' : (r.trade === 'cap' ? 'Up to ' + m(r.tradeCap).replace('.00', '') : 'Full credit');
  const rebT = r.rebate === 'reduces' ? 'Reduces the tax' : (r.rebate === 'taxed' ? 'Taxed' : 'Not confirmed');
  const docT = r.doc === 'taxed' ? 'Taxed' : (r.doc === 'untaxed' ? 'Not taxed' : 'Not confirmed');
  return '<tr><td>' + r.name + '</td><td>' + rate + '</td><td>' + tradeT + '</td><td>' + rebT + '</td><td>' + docT + '</td></tr>';
}).join('');
const srcAll = E.VERIFIED.map((c) => '<li><b>' + E.RULES[c].name + ':</b> ' + E.RULES[c].src.map((x) => '<a href="' + x.u + '" rel="noopener">' + x.t + '</a>').join(' · ') + '</li>').join('');
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const hero = `  <section class="hero">
    <div class="eyebrow">Price, trade-in, rebate and fees · state by state</div>
    <h1>Car Sales Tax Calculator</h1>
    <p>Car sales tax depends on <strong>what your state lets you subtract</strong>. On a <strong>$30,000</strong> car with a <strong>$10,000</strong> trade-in the tax is <strong>${m(cmp[0][1])}</strong> in ${cmp[0][0]} but <strong>${m(cmp[cmp.length - 1][1])}</strong> in ${cmp[cmp.length - 1][0]}. Pick your state and see the tax with its own trade-in, rebate and doc fee rules.</p>
  </section>`;
const body = `<body class="p-loan p-stax p-car">
<div class="wrap">

${hdr}

${hero}

  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your car purchase</h2>

        <div class="fld"><span class="lab">State where you register it</span><div class="st-ta"><div class="inp"><input id="ctStateIn" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="ctStateList" aria-label="State" placeholder="Type to pick your state"><input id="ctState" type="hidden" value=""></div><div class="st-ta-list" id="ctStateList" role="listbox" style="display:none"></div></div></div>
        <p class="st-note" id="ctEstNote" style="display:none"></p>
        <div class="fld" id="ctPlaceFld" style="display:none"><span class="lab">Where is it registered?</span><div class="st-ta"><div class="inp"><input id="ctPlace" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="ctPlaceList" placeholder="Type a city, e.g. Orlando"></div><div class="st-ta-list" id="ctPlaceList" role="listbox" style="display:none"></div></div><p class="st-note st-pnote" id="ctPlaceNote"></p></div>

        <div class="ln-two">
          ${fld('ctPrice', 'Vehicle price', '$', 'e.g. 30000')}
          ${fld('ctTrade', 'Trade-in value', '$ optional', 'e.g. 10000')}
        </div>
        <div class="ln-two">
          ${fld('ctRebate', 'Manufacturer rebate', '$ optional', 'e.g. 1000')}
          ${fld('ctDoc', 'Dealer doc fee', '$ optional', 'e.g. 500')}
        </div>
        ${fld('ctGov', 'Title and registration fees', '$ optional', 'e.g. 250')}
        <p class="st-note" style="margin-top:-6px">Enter the price after any dealer discount. Title and registration fees are added to your total but not taxed.</p>

        <div class="fld" id="ctUsedFld" style="display:none"><span class="lab">Vehicle</span><div class="seg" id="ctUsedSeg" role="group" aria-label="New or used"><button type="button" class="on" data-v="new">New</button><button type="button" data-v="used">Used</button></div></div>
        <div id="ctLocalFld" style="display:none">${fld('ctLocal', '<span id="ctLocalLab">Local tax rate (city + county)</span>', '% optional', 'e.g. 2.5')}</div>
        <div id="ctAssume" style="display:none">
          <div class="fc-grp">Rules in your state — set them yourself</div>
          <label class="dc-check" for="ctAsTrade"><input type="checkbox" id="ctAsTrade"><span>A trade-in comes off the taxed price</span></label>
          <label class="dc-check" for="ctAsRebate"><input type="checkbox" id="ctAsRebate"><span>A manufacturer rebate comes off the taxed price</span></label>
          <label class="dc-check" for="ctAsDoc"><input type="checkbox" id="ctAsDoc"><span>The dealer doc fee is taxed</span></label>
        </div>

        <p class="add-note ln-hint" id="ctHint" style="display:none"></p>

        <div class="chips" aria-label="Try an example">
          <button type="button" id="ctEx">See an example: a $30,000 car with a $10,000 trade-in</button>
        </div>

        <div id="ctAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="ctOwnFld" style="display:none">${fld('ctOwn', 'Use my own combined rate', '% on the taxed amount', 'e.g. 7.25')}</div>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="ctAdvBtn" type="button">
            <span id="ctAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="ctResLab">Sales tax</div>
          <div class="res-big" id="ctBig">—</div>
          <div class="res-sub" id="ctSub">Pick your state to see its vehicle tax rules.</div>
        </div>

        <div id="ctResults" style="display:none">
          <p class="res-tip adv-tip" id="ctTip"></p>
          <div class="fc-grp">Where your money goes</div>
          <div id="ctBar"></div>
          <div class="ln-leg" id="ctBarLeg"></div>
          <table class="dtable ln-terms" id="ctTable"></table>
          <div id="ctExtra"></div>
          <div id="ctRule" style="display:none"></div>
          <div id="ctCopyWrap" style="display:none"><button class="btn" id="ctCopy" type="button" style="margin-top:6px">Copy results</button></div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="ctMLab">Sales tax</span>
    <div class="mbar-vals"><b id="ctMVal">—</b><span id="ctMDec"></span></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${pill('/auto-loan-calculator/', 'Auto Loan Calculator', '<path d="M5 17l1.5-5A2 2 0 0 1 8.4 10.6h7.2a2 2 0 0 1 1.9 1.4L19 17z"/><circle cx="8" cy="17.5" r="1.5"/><circle cx="16" cy="17.5" r="1.5"/>')}
${pill('/sales-tax-calculator/', 'Sales Tax Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
${pill('/loan-calculator/', 'Loan Calculator', '<rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/>')}
${pill('/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>Car sales tax at a glance</h2>
        <p>Vehicle tax is not the same as the sales tax on a shirt. Most states tax the <strong>price you pay for the car</strong>, but each state has its own answer to three questions: does the <strong>trade-in</strong> come off the taxed price, does a <strong>manufacturer rebate</strong>, and is the <strong>dealer doc fee</strong> taxed? The answers change the bill by hundreds of dollars.</p>
        <p>On a $30,000 car with a $10,000 trade-in, no rebate and no fees: ${cmp.map((x) => x[0] + ' ' + m(x[1])).join(', ')}. North Carolina’s 3% is the lowest rate here, and Virginia is high for its 4.15% rate because the trade-in does not lower the taxed amount.</p>
        <h2>How the tax is worked out</h2>
        <div class="formula">
          Tax = (price + taxed fees − trade-in − rebate) × rate
          <small>EACH STATE DECIDES WHICH OF THE LAST THREE COUNT</small>
        </div>
        <ul class="st-otherlist">
          <li><b>1.</b> Start with the price after any dealer discount.</li>
          <li><b>2.</b> Add the dealer doc fee if your state taxes it.</li>
          <li><b>3.</b> Subtract the trade-in if your state gives a credit, and the rebate if it lets rebates reduce the price.</li>
          <li><b>4.</b> Multiply by the state rate, plus the local rate where there is one.</li>
        </ul>
        <h2>Rules in the ten states we have checked</h2>
        <p>Each row comes from the state’s own pages, listed below. “Not confirmed” means the pages we read do not settle it, so the calculator shows the tax with and without it rather than guessing.</p>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>State</th><th>Rate</th><th>Trade-in</th><th>Manufacturer rebate</th><th>Doc fee</th></tr></thead><tbody>${rows}</tbody></table></div>
        <h2>Other states</h2>
        <p>For a state not in the table the calculator uses its general sales tax rate and three tick boxes — whether a trade-in comes off, whether a rebate comes off and whether the doc fee is taxed. It never assumes the answer. The result is an estimate, so check it against your state’s motor vehicle tax page. More states are added as their rules are checked against official pages.</p>
      </div>
      <div>
        <h2>Use the car sales tax calculator</h2>
        <p>Pick the state where you will register the car. Where the rate depends on the place (California, Florida and Missouri) type your city or county. Enter the price and, if you have them, the trade-in value, any manufacturer rebate, the dealer doc fee and the title and registration fees. The result shows the tax, how your taxed amount was built, what you pay in total and how your state treats each item.</p>
        <p>The comparison lists the same car in the other states that have one statewide vehicle rate, using each state’s own rules. Under <strong>Go advanced</strong> you can use your own combined rate.</p>
        <p>This is an estimate based on the state pages listed below. The tax collected when you title the car depends on the exact paperwork — the price on the bill of sale, how the trade-in and rebate are shown, and any local tax.</p>
        <h2>Sources</h2>
        <ul class="st-otherlist">${srcAll}</ul>
        <p class="st-src">Georgia’s tax is a title tax on the vehicle’s value rather than a sales tax; for a new vehicle that value is the greater of the price or the state’s assessment-manual value.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions about car sales tax</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=307"></script>
<script>CalcThis.initCarTaxCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const head = headTop
  .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
  .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
  .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
  .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
  .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
  .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">')
  .replace('<meta name="twitter:card" content="summary">', () => '<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="' + esc(title) + '">\n<meta name="twitter:description" content="' + esc(desc) + '">\n<meta property="og:site_name" content="CalcThis">\n<meta property="og:locale" content="en_US">');
const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
const dir = ROOT + 'car-sales-tax-calculator/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '/car-sales-tax-calculator/'") ? s : s.replace("  { file: 'auto-loan-calculator/index.html',   slug: '/auto-loan-calculator/' },\n", (mm) => mm + "  { file: 'car-sales-tax-calculator/index.html', slug: '/car-sales-tax-calculator/' },\n"));
edit('llms.txt', (lt) => lt.includes('/car-sales-tax-calculator/') ? lt : lt.replace(/(- \[Auto Loan Calculator[^\n]*\n)/, (mm) => mm + '- [' + title + '](' + url + '): Free car sales tax calculator: price, trade-in, manufacturer rebate and doc fee give the tax under each state’s own rules (official rules for 10 states), the rules in plain words and the same car compared across states.\n'));
edit('partials/header.html', (s) => s.includes('/car-sales-tax-calculator/') ? s : s.replace('          <a href="/auto-loan-calculator/">Auto Loan</a>\n', (mm) => mm + '          <a href="/car-sales-tax-calculator/">Car Sales Tax</a>\n'));
edit('partials/footer.html', (s) => s.includes('/car-sales-tax-calculator/') ? s : s.replace('          <li><a href="/auto-loan-calculator/">Auto Loan Calculator</a></li>\n', (mm) => mm + '          <li><a href="/car-sales-tax-calculator/">Car Sales Tax Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"/car-sales-tax-calculator/"') ? s : s.replace('  "/sales-tax-calculator/": {', () => '  "/car-sales-tax-calculator/": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/sales-tax-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Car Sales Tax Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Overtime Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Car Sales Tax Calculator", "url": "' + url + '", "applicationCategory": "FinanceApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Car Sales Tax Calculator</h3>')) {
    const card = `    <a class="calc" href="/car-sales-tax-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M5 20l2-7a2.5 2.5 0 0 1 2.4-1.8h13.2A2.5 2.5 0 0 1 25 13l2 7z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4" stroke-linejoin="round"/><circle cx="10" cy="22" r="2.2" fill="#B5761F"/><circle cx="22" cy="22" r="2.2" fill="#B5761F"/><path d="M12 17l8-4" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      <h3>Car Sales Tax Calculator</h3>
      <p>Price, trade-in, manufacturer rebate and doc fee give the tax under your state's own rules — official rules for ten states, the rules in plain words and the same car compared across states.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('    <a class="calc" href="/tip-calculator/">', () => card + '    <a class="calc" href="/tip-calculator/">');
  }
  if (!h.includes('<a href="/car-sales-tax-calculator/">Car Sales Tax</a><span>')) h = h.replace(/(          <li><a href="\/overtime-calculator\/">Overtime<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="/car-sales-tax-calculator/">Car Sales Tax</a><span> — tax with your state’s trade-in, rebate and fee rules</span></li>\n');
  return h;
});
edit('auto-loan-calculator/index.html', (h) => h.includes('/car-sales-tax-calculator/') ? h : h.replace('if your state gives no trade-in credit.</p>', () => 'if your state gives no trade-in credit. For your state’s actual trade-in, rebate and doc-fee rules, use the <a href="/car-sales-tax-calculator/">car sales tax calculator</a>.</p>'));
