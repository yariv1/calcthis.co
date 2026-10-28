const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /sales-tax-calculator/ (hub) and every live state page (/sales-tax-calculator/<slug>/), and registers them
   (sitemap, llms.txt, header/footer partials, homepage card + hasPart + count). SEO text and FAQ numbers are computed from the
   engine in assets/app.js. Run: node md-files/gen-salestax-pages.js   then   node build.js
   Adding a state = add its record (cats, zones, shipNote, others, src, slug, live:true) to CalcThis.saleTaxEngine in app.js, add
   its facts to FACTS below, run this script. */
global.CalcThis = {};
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
eval(app.slice(app.indexOf('/* SALESTAX-ENGINE:START */'), app.indexOf('/* SALESTAX-ENGINE:END */')));
const E = CalcThis.saleTaxEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const auto = nl(fs.readFileSync(ROOT + 'auto-loan-calculator/index.html', 'utf8'));
const hdr = auto.slice(auto.indexOf('<!--HEADER:START-->'), auto.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = auto.slice(auto.indexOf('<!--FOOTER:START-->'), auto.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = auto.slice(0, auto.indexOf('<script type="application/ld+json">'));

const m = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
const pct = (x) => String(Math.round(x * 10000) / 10000) + '%';
const live = Object.keys(E.STATES).filter((c) => E.STATES[c].live).sort((a, b) => (E.STATES[a].name < E.STATES[b].name ? -1 : 1));
const all = Object.keys(E.STATES).sort((a, b) => (E.STATES[a].name < E.STATES[b].name ? -1 : 1));
const stateLinks = (except) => '<ul class="pc-statelist">' + live.filter((c) => c !== except).map((c) => '<li><a href="/sales-tax-calculator/' + E.STATES[c].slug + '/">' + E.STATES[c].name + ' Sales Tax Calculator</a></li>').join('') + '</ul>';

const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const cselEmpty = (id) => `<div class="csel" id="${id}" data-value=""><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val"></span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const fld = (id, label, unit, ph) => `<div class="fld"><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></div>`;

/* ---------- numbers used in the text (all from the engine) ---------- */
function tax(code, amt, cat, extra) { return E.add(Object.assign({ state: code, items: [{ amt, cat: cat || 'general' }], ship: 0, zone: 'std' }, extra || {})); }

const FACTS = {
  NJ: {
    intro: 'New Jersey charges one statewide sales tax of 6.625% on most goods and some services. There is no city or county sales tax, so the rate is the same in Newark, Princeton and Cape May — with a few special exceptions listed below.'
  }
};

function faqsFor(code) {
  const s = E.STATES[code], n = s.name;
  const a100 = tax(code, 100), a1000 = tax(code, 1000), r = E.reverse({ state: code, total: 106.63, cat: 'general', zone: 'std' });
  const ship = E.add({ state: code, items: [{ amt: 100, cat: 'general' }], ship: 10, zone: 'std' });
  const mix = E.add({ state: code, items: [{ amt: 100, cat: 'general' }, { amt: 50, cat: 'clothing' }], ship: 10, zone: 'std' });
  const use = E.add({ state: code, items: [{ amt: 3000, cat: 'general' }], ship: 50, zone: 'std', paid: 0 });
  const use2 = E.add({ state: code, items: [{ amt: 4000, cat: 'general' }], ship: 0, zone: 'std', paid: 5.5 });
  const half = E.add({ state: code, items: [{ amt: 100, cat: 'general' }], zone: 'salem' });
  return [
    [`What is the sales tax rate in ${n}?`, `${n} has a statewide sales tax rate of ${pct(s.base)}. There is no city or county sales tax, so the same rate applies everywhere in the state, except for the reduced Urban Enterprise Zone and Salem County rate of 3.3125%, the 2% Cape May tourism tax in the Wildwoods and the Atlantic City luxury tax. On a $100 purchase the tax is ${m(a100.tax)} and the total is ${m(a100.total)}; on $1,000 it is ${m(a1000.tax)}, for ${m(a1000.total)}.`],
    [`Is clothing taxed in ${n}?`, `No. Clothing and footwear for human use are exempt from ${n} sales tax at any price. The exemption does not cover fur clothing, accessories, or sports, recreational or protective equipment, which are taxable.`],
    [`Are groceries taxed in ${n}?`, `Most food bought in a grocery store is exempt. Candy, soft drinks, alcohol and tobacco are taxable, and so is prepared food — food heated by the seller, combined by the seller or sold with utensils, such as restaurant meals. Choose the item type in the calculator to see the difference.`],
    [`Is shipping taxed in ${n}?`, `It depends on what you bought. Delivery charges are taxed when the item is taxable and are not taxed when the item is exempt, such as clothing. On a $100 taxable item with $10 shipping the tax is ${m(ship.tax)}, for a total of ${m(ship.total)}. If one shipment mixes taxable and exempt items, the delivery charge is split by price: add $100 of goods and $50 of clothing with $10 shipping and the tax is ${m(mix.tax)}.`],
    [`How do I work out the price before tax from a total in ${n}?`, `Divide the total by 1.06625. A total of $106.63 comes from a price of ${m(r.pre)} plus ${m(r.tax)} of tax. Switch the calculator to “Remove tax” to do it for any amount.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe 6.625% use tax on the price plus delivery. A $3,000 pool table with $50 shipping and no tax charged means ${m(use.owed)} of use tax. If the seller charged a lower rate than ${n}’s, you owe the difference: a $4,000 desk bought with 5.5% tax paid elsewhere leaves ${m(use2.owed)}. Enter the rate the seller charged under Go advanced.`],
    [`What is the sales tax in Salem County or an Urban Enterprise Zone?`, `Certain in-person sales by qualified sellers are taxed at half the rate, 3.3125%. A $100 item in Salem County has ${m(half.tax)} of tax. Online and mail-order sales, services, prepared food, alcohol and motor vehicles do not get the reduced rate in Salem County.`]
  ];
}

function hubFaqs() {
  const nj = tax('NJ', 100), r = E.range('TX', 100), rev = E.reverse({ total: 108.25, own: 8.25 });
  return [
    ['How do I calculate sales tax?', `Multiply the price by the sales tax rate and add the result to the price. At 8.25% a $100 purchase has ${m(100 * 0.0825)} of tax and costs ${m(108.25)}. In New Jersey, which charges 6.625%, $100 plus tax is ${m(nj.total)}.`],
    ['How do I take sales tax out of a total?', `Divide the total by 1 plus the rate. A $108.25 total at 8.25% is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Use the “Remove tax” tab and enter the total you paid.`],
    ['How do I find the sales tax rate from two prices?', 'Subtract the price before tax from the price after tax, divide by the price before tax and multiply by 100. A purchase that costs $100 before tax and $108.25 after tax was taxed at 8.25%. The “Find the rate” tab does it for you and compares the result with the state’s own rate.'],
    ['Why does the total depend on where I live?', `Most states add a state rate, and many allow cities and counties to add their own. Texas, for example, charges 6.25% at the state level and allows up to 2% more, so $100 costs between ${m(r.lo)} and ${m(r.hi)}. New Jersey has no local sales tax at all. Pick your state to see its rate and, for states with their own page, the exact rules.`],
    ['Which states have no sales tax?', 'Alaska, Delaware, Montana, New Hampshire and Oregon have no statewide sales tax. Alaska is the only one that allows local sales taxes. All other states and the District of Columbia have one.'],
    ['Is the result exact?', 'On a state page the result is exact for the cases the page lists, with the source and date shown. On other states the calculator uses the state rate only and shows the highest local add-on as a range — it never guesses your local rate. You can always type your own combined rate.']
  ];
}

const jsonApp = (name, url, desc) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name, url, applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: desc });
const jsonFaq = (f) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) });

function srcHtml(code) { const s = E.STATES[code]; return '<p class="st-src">Sources: ' + s.src.map((x) => '<a href="' + x.u + '" rel="noopener">' + x.t + '</a>').join(' · ') + '. Rate in effect as of ' + s.eff + '.</p>'; }

function bodyFor(o) {
  return `<body class="p-loan p-stax"${o.bodyAttr || ''}>
<div class="wrap">

${hdr}

${o.hero}

  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your purchase</h2>

        <div class="modeseg" id="stModeSeg" role="group" aria-label="What to calculate">
          <button class="on" type="button" data-v="add">Add tax</button>
          <button type="button" data-v="rev">Remove tax</button>
          <button type="button" data-v="find">Find the rate</button>
        </div>

        <div class="fld"><span class="lab">State</span>${cselEmpty('stState')}</div>
        <div id="stRateFld">${fld('stRate', 'Sales tax rate', '%', 'e.g. 8.25')}</div>

        <div id="stAddBox">
          <div id="stItems"></div>
          <div class="st-addwrap"><button type="button" class="st-add" id="stAddItem">+ Add another item</button></div>
          ${fld('stShip', 'Shipping or delivery', '$ optional', 'e.g. 7.50')}
          <p class="st-note" id="stShipNote" style="display:none"></p>
          <label class="dc-check" id="stShipTaxFld" for="stShipTaxed" style="display:none"><input type="checkbox" id="stShipTaxed"><span>My state charges sales tax on shipping</span></label>
        </div>

        <div id="stRevBox" style="display:none">
          ${fld('stTotal', 'Total paid, tax included', '$', 'e.g. 106.63')}
          <div class="fld" id="stRevCatFld" style="display:none"><span class="lab">Type</span>${cselEmpty('stRevCat')}</div>
        </div>

        <div id="stFindBox" style="display:none">
          <div class="ln-two">
            ${fld('stBefore', 'Price before tax', '$', 'e.g. 100')}
            ${fld('stAfter', 'Price after tax', '$', 'e.g. 108.25')}
          </div>
        </div>

        <div class="fld" id="stZoneFld" style="display:none"><span class="lab">Where are you buying?</span>${cselEmpty('stZone')}</div>

        <p class="add-note ln-hint" id="stHint" style="display:none"></p>

        <div class="chips" aria-label="Try an example">
          <button type="button" id="stEx">See an example: a $100 purchase</button>
        </div>

        <div id="stAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="stOwnFld" style="display:none">${fld('stOwn', 'Use my own rate', '% on taxable items', 'e.g. 6.625')}</div>
          <div id="stPaidFld">${fld('stPaid', 'Sales tax the seller already charged', '% — bought online or out of state', 'e.g. 4')}</div>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="stAdvBtn" type="button">
            <span id="stAdvBtnLab">Go advanced</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="stResLab">Total with tax</div>
          <div class="res-big" id="stBig">—</div>
          <div class="res-sub" id="stSub">Enter an item price to see the tax.</div>
        </div>

        <div id="stResults" style="display:none">
          <p class="res-tip adv-tip" id="stTip"></p>
          <div class="fc-grp">Where your money goes</div>
          <div id="stBar"></div>
          <div class="ln-leg" id="stBarLeg"></div>
          <table class="dtable ln-terms" id="stTable"></table>
          <div id="stExtra"></div>
          <div id="stCopyWrap" style="display:none"><button class="btn" id="stCopy" type="button" style="margin-top:6px">Copy results</button></div>
        </div>

        <div id="stOther" style="display:none">
          <div class="proj-sep"></div>
          <div class="fc-grp" id="stOtherH">Other taxes and fees</div>
          <ul class="st-otherlist" id="stOtherList"></ul>
          ${o.srcHtml || ''}
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="stMLab">Total with tax</span>
    <div class="mbar-vals"><b id="stMVal">—</b><span id="stMDec"></span></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
      <a class="pill" href="/percentage-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>
        Percentage Calculator
      </a>
      <a class="pill" href="/paycheck-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/></svg>
        Paycheck Calculator
      </a>
      <a class="pill" href="/auto-loan-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17l1.5-5A2 2 0 0 1 8.4 10.6h7.2a2 2 0 0 1 1.9 1.4L19 17z"/><circle cx="8" cy="17.5" r="1.5"/><circle cx="16" cy="17.5" r="1.5"/></svg>
        Auto Loan Calculator
      </a>
      <a class="pill" href="/mortgage-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>
        Mortgage Calculator
      </a>
    </div>
  </div>

${o.content}

${ftr}

</div>

<script src="/assets/app.js?v=204"></script>
<script>CalcThis.initSalesTaxCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
}

const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
function headFor(o) {
  return headTop
    .replace(/<title>[^<]*<\/title>/, () => '<title>' + o.title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(o.desc) + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + o.url + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(o.ogTitle || o.title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(o.ogDesc || o.desc) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + o.url + '">');
}
function pageHtml(o) {
  const ld = [o.app, o.faq].concat(o.extraLd || []).map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
  return headFor(o) + ld + '</head>\n' + bodyFor(o);
}
function write(rel, html) { const dir = ROOT + rel.replace(/index\.html$/, ''); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(ROOT + rel, html.replace(/\n/g, '\r\n')); }

/* ---------- hub ---------- */
const hubF = hubFaqs();
const stateTable = '<div class="pc-tblwrap"><table class="dtable"><thead><tr><th>State</th><th>State rate</th><th>Average local</th><th>Highest local</th></tr></thead><tbody>' + all.map((c) => { const s = E.STATES[c]; return '<tr><td>' + (s.live ? '<a href="/sales-tax-calculator/' + s.slug + '/">' + s.name + '</a>' : s.name) + '</td><td>' + pct(s.base) + '</td><td>' + (s.live ? 'none' : pct(s.avgLocal)) + '</td><td>' + (s.live ? 'none' : pct(s.maxLocal)) + '</td></tr>'; }).join('') + '</tbody></table></div>';
const hubContent = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the sales tax calculator</h2>
        <p>Pick your <strong>state</strong>, type the price and the total appears with the tax split out. Add as many items as you like, add shipping, and on a state with its own page choose the type of item — groceries, clothing and medicine, for example, can be exempt. Use <strong>Remove tax</strong> to find the price before tax from a total, and <strong>Find the rate</strong> to work out the rate from a price before and after tax.</p>
        <p>The state page shows every extra that can apply in that state — special zones, local taxes and fees — instead of leaving you to find out at the register.</p>
        <h2>The sales tax formula</h2>
        <div class="formula">
          Total = price × (1 + rate ÷ 100)
          <small>REVERSE: PRICE = TOTAL ÷ (1 + RATE ÷ 100)</small>
        </div>
        <p>At 8.25%, a $100 purchase has ${m(8.25)} of tax and costs ${m(108.25)}. Going the other way, a ${m(108.25)} total is ${m(100)} before tax.</p>
        <h2>State rate plus local rate</h2>
        <p>Forty-five states charge a state sales tax and 38 allow cities, counties or districts to add their own. For a state without its own page, the calculator uses the state rate and shows the highest local add-on as a range — it never guesses your local rate. Type your own combined rate to get a single number.</p>
        <h2>States with their own calculator</h2>
        ${stateLinks()}
        <p>More states are added as each state’s rules are checked against its official guidance.</p>
      </div>
      <div>
        <h2>Sales tax rates by state</h2>
        <p>State rates, the population-weighted average local rate and the highest local rate as of July 1, 2026 (Tax Foundation). New Jersey has no local sales tax; its reduced-rate zones are explained on its own page.</p>
        ${stateTable}
        <p class="st-src">Source: <a href="${E.SRC_TF}" rel="noopener">Tax Foundation — 2026 sales tax rates, midyear update</a>. Alaska, Delaware, Montana, New Hampshire and Oregon have no statewide sales tax; Alaska allows local sales taxes.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${hubF.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
write('sales-tax-calculator/index.html', pageHtml({
  title: 'Sales Tax Calculator — Add, Remove or Find the Rate by State | CalcThis',
  desc: 'Free sales tax calculator: add tax to a price, take it out of a total or find the rate. Pick your state for its rate, exempt items, shipping rule and special zones, with every state’s rate listed.',
  ogTitle: 'Sales Tax Calculator — Add, Remove or Find the Rate',
  ogDesc: 'Add sales tax, remove it from a total, or find the rate — by state, with exempt items, shipping and special zones shown.',
  url: 'https://calcthis.co/sales-tax-calculator/',
  app: jsonApp('Sales Tax Calculator', 'https://calcthis.co/sales-tax-calculator/', 'Sales tax calculator: add tax to a price, remove it from a total or find the rate, by state, with exempt items, shipping and special zones.'),
  faq: jsonFaq(hubF),
  hero: `  <section class="hero">
    <div class="eyebrow">Add it, remove it, or find the rate</div>
    <h1>Sales Tax Calculator</h1>
    <p>Add <strong>sales tax</strong> to a price, take it out of a total, or find the rate from two prices. Pick your state to see its rate — and on a state page, what is exempt, how shipping is taxed and every special zone or fee.</p>
  </section>`,
  content: hubContent
}));

/* ---------- state pages ---------- */
live.forEach((c) => {
  const s = E.STATES[c], n = s.name, url = 'https://calcthis.co/sales-tax-calculator/' + s.slug + '/', f = faqsFor(c);
  const a100 = tax(c, 100);
  const amounts = [10, 25, 50, 100, 250, 500, 1000, 5000];
  const amtRows = amounts.map((a) => { const t = tax(c, a); return '<tr><td>' + m0(a) + '</td><td>' + m(t.tax) + '</td><td>' + m(t.total) + '</td></tr>'; }).join('');
  const catRows = s.cats.map((k) => '<tr><td>' + (k.long || k.label) + '</td><td>' + (k.taxable ? 'Taxable' : 'Exempt') + '</td><td>' + k.note + '</td></tr>').join('');
  const hero = `  <section class="hero">
    <div class="eyebrow">${n} · 2026 rates</div>
    <h1>${n} Sales Tax Calculator</h1>
    <p>${FACTS[c].intro} A <strong>$100</strong> purchase costs <strong>${m(a100.total)}</strong> with <strong>${m(a100.tax)}</strong> of tax.</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>${n} sales tax at a glance</h2>
        <p>${n}’s statewide rate is <strong>${pct(s.base)}</strong>. On <strong>$100</strong> that is <strong>${m(a100.tax)}</strong> of tax, for a total of <strong>${m(a100.total)}</strong>. The rate comes from the ${n} Division of Taxation and the Tax Foundation’s July 1, 2026 table.</p>
        <h2>What is taxed and what is exempt</h2>
        <p>Pick the item type in the calculator and the exempt items are shown without tax:</p>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Item type</th><th>Sales tax</th><th>Details</th></tr></thead><tbody>${catRows}</tbody></table></div>
        <h2>Shipping and delivery</h2>
        <p>${s.shipNote} On a $100 taxable item with $10 shipping the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, zone: 'std' }).tax)}.</p>
        <h2>Sales tax on common amounts</h2>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Price</th><th>Sales tax</th><th>Total</th></tr></thead><tbody>${amtRows}</tbody></table></div>
        <p>General goods at ${pct(s.base)}, rounded to the cent.</p>
      </div>
      <div>
        <h2>Special zones, local taxes and fees</h2>
        <ul class="st-otherlist">${s.others.map((x) => '<li><b>' + x.t + '.</b> ' + x.d + '</li>').join('')}</ul>
        <h2>Use the ${n} calculator</h2>
        <p>The state is already set to <strong>${n}</strong>. Add one item or several, choose what each one is, add shipping and pick where you are buying. <strong>Remove tax</strong> works out the price before tax from a total, and <strong>Find the rate</strong> compares a price before and after tax with ${n}’s rate. Under <strong>Go advanced</strong> you can use your own rate or work out the use tax on something bought online.</p>
        <p>This is an estimate based on the state’s published rules — the register can differ by a cent, and the seller’s own system decides what is taxable.</p>
        <h2>Other states</h2>
        ${stateLinks(c)}
        <p>For any other state, the <a href="/sales-tax-calculator/">main sales tax calculator</a> uses the state rate and shows the highest local add-on.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions about ${n} sales tax</h2>
${f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' },
    { '@type': 'ListItem', position: 2, name: 'Sales Tax Calculator', item: 'https://calcthis.co/sales-tax-calculator/' },
    { '@type': 'ListItem', position: 3, name: n, item: url }] };
  write('sales-tax-calculator/' + s.slug + '/index.html', pageHtml({
    title: n + ' Sales Tax Calculator 2026 — ' + pct(s.base) + ' Rate, Exempt Items | CalcThis',
    desc: n + ' sales tax calculator: ' + pct(s.base) + ' statewide, no local tax. $100 is ' + m(a100.total) + ' with tax. Clothing and groceries exempt, shipping rule, Salem County and UEZ rates, reverse calculation.',
    ogTitle: n + ' Sales Tax Calculator 2026', url,
    app: Object.assign(jsonApp(n + ' Sales Tax Calculator', url, n + ' sales tax calculator: add tax, remove tax or find the rate, with exempt items, shipping and special zones.'), { dateModified: new Date().toISOString().slice(0, 10) }),
    faq: jsonFaq(f), extraLd: [crumbs], hero, content, bodyAttr: ' data-state="' + c + '"', srcHtml: srcHtml(c)
  }));
});
console.log('pages written: hub +', live.length, 'state');

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const slugs = ['/sales-tax-calculator/'].concat(live.map((c) => '/sales-tax-calculator/' + E.STATES[c].slug + '/'));
edit('sitemap.xml', (sm) => {
  const today = new Date().toISOString().slice(0, 10); let add = '';
  slugs.forEach((u) => { if (!sm.includes('<loc>https://calcthis.co' + u + '</loc>')) add += '  <url>\n    <loc>https://calcthis.co' + u + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' + (u === '/sales-tax-calculator/' ? '0.8' : '0.7') + '</priority>\n  </url>\n'; });
  return add ? sm.replace('</urlset>', () => add + '</urlset>') : sm;
});
edit('build.js', (s) => {
  let add = '';
  slugs.forEach((u) => { const file = u.slice(1) + 'index.html'; if (!s.includes("file: '" + file + "'")) add += "  { file: '" + file + "', slug: '" + u + "' },\n"; });
  return add ? s.replace("  { file: 'paycheck-calculator/index.html',   slug: '/paycheck-calculator/' },\n", (mm) => mm + add) : s;
});
edit('llms.txt', (lt) => {
  lt = lt.replace(/\n## Sales tax calculators\n[\s\S]*?(?=\n## |$)/, '');
  return lt.trimEnd() + '\n\n## Sales tax calculators\n- [Sales Tax Calculator](https://calcthis.co/sales-tax-calculator/): add sales tax, remove it from a total or find the rate; state rates for every state.\n' + live.map((c) => '- [' + E.STATES[c].name + ' Sales Tax Calculator](https://calcthis.co/sales-tax-calculator/' + E.STATES[c].slug + '/): ' + E.STATES[c].name + ' sales tax with exempt items, shipping rule and special zones.').join('\n') + '\n';
});
edit('partials/header.html', (s) => {
  if (s.includes('/sales-tax-calculator/')) return s.replace(/(<!--STAXNAV:START-->)[\s\S]*?(<!--STAXNAV:END-->)/, (mm, a, b) => a + '\n          <a href="/sales-tax-calculator/">Sales Tax</a>\n' + live.map((c) => '          <a href="/sales-tax-calculator/' + E.STATES[c].slug + '/">' + E.STATES[c].name + ' Sales Tax</a>').join('\n') + '\n          ' + b);
  return s.replace('          <a href="/auto-loan-calculator/">Auto Loan</a>\n', (mm) => mm + '          <!--STAXNAV:START-->\n          <a href="/sales-tax-calculator/">Sales Tax</a>\n' + live.map((c) => '          <a href="/sales-tax-calculator/' + E.STATES[c].slug + '/">' + E.STATES[c].name + ' Sales Tax</a>').join('\n') + '\n          <!--STAXNAV:END-->\n');
});
edit('partials/footer.html', (s) => {
  const block = '          <!--STAXFOOT:START-->\n          <li><a href="/sales-tax-calculator/">Sales Tax Calculator</a></li>\n' + live.map((c) => '          <li><a href="/sales-tax-calculator/' + E.STATES[c].slug + '/">' + E.STATES[c].name + ' Sales Tax Calculator</a></li>').join('\n') + '\n          <!--STAXFOOT:END-->\n';
  if (s.includes('<!--STAXFOOT:START-->')) return s.replace(/          <!--STAXFOOT:START-->[\s\S]*?<!--STAXFOOT:END-->\n/, () => block);
  return s.replace('          <li><a href="/auto-loan-calculator/">Auto Loan Calculator</a></li>\n', (mm) => mm + block);
});
edit('index.html', (h) => {
  if (!h.includes('"name": "Sales Tax Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Paycheck Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Sales Tax Calculator", "url": "https://calcthis.co/sales-tax-calculator/", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Sales Tax Calculator</h3>')) {
    const card = `    <a class="calc" href="/sales-tax-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="4" width="20" height="24" rx="2.5" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/>
          <path d="M11 20l10-9" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="2" fill="#B5761F"/><circle cx="20" cy="20" r="2" fill="#B5761F"/>
        </svg>
      </span>
      <h3>Sales Tax Calculator</h3>
      <p>Add sales tax to a price, take it out of a total, or find the rate — by state, with exempt items like groceries and clothing, the shipping rule, special zones and local add-ons shown instead of hidden. New Jersey has its own page with every rule.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('  </div>\n  </section>\n\n  <section id="grp-paycheck"', () => card + '  </div>\n  </section>\n\n  <section id="grp-paycheck"');
  }
  return h;
});
