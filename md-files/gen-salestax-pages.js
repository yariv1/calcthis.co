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
    ['Is the result exact?', 'On a state page the result is exact for the cases the page lists, with the source and date shown. For a state without its own page yet, type your own combined rate — the calculator never guesses a local rate.']
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
        <div class="fld" id="stPlaceFld" style="display:none"><span class="lab">Where are you buying?</span><div class="st-ta"><div class="inp"><input id="stPlace" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="stPlaceList" placeholder="Type your city, e.g. Springfield"></div><div class="st-ta-list" id="stPlaceList" role="listbox" style="display:none"></div></div><p class="st-note st-pnote" id="stPlaceNote"></p></div>
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
const escA = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
function pageHtml(o) {
  const ld = [o.app, o.faq].concat(o.extraLd || []).map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
  const head = headFor(o).replace('<meta name="twitter:card" content="summary">', () => '<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="' + escA(o.ogTitle || o.title) + '">\n<meta name="twitter:description" content="' + escA(o.desc) + '">\n<meta property="og:site_name" content="CalcThis">\n<meta property="og:locale" content="en_US">');
  return head + ld + '</head>\n' + bodyFor(o);
}
function write(rel, html) { const dir = ROOT + rel.replace(/index\.html$/, ''); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(ROOT + rel, html.replace(/\n/g, '\r\n')); }

/* ---------- hub ---------- */
const hubF = hubFaqs();
const stateTable = '<div class="pc-tblwrap"><table class="dtable"><thead><tr><th>State</th><th>State rate</th><th>Average local</th><th>Highest local</th></tr></thead><tbody>' + all.filter((c) => !E.STATES[c].city).map((c) => { const s = E.STATES[c]; return '<tr><td>' + (s.live ? '<a href="/sales-tax-calculator/' + s.slug + '/">' + s.name + '</a>' : s.name) + '</td><td>' + pct(s.base) + '</td><td>' + (s.places ? 'varies by place' : (s.live ? 'none' : pct(s.avgLocal))) + '</td><td>' + (s.places ? pct(Math.round((s.places.baseHi - s.base) * 1000) / 1000) + (s.places.hubNote || '') : (s.live ? 'none' : pct(s.maxLocal))) + '</td></tr>'; }).join('') + '</tbody></table></div>';
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
        <p>Forty-five states charge a state sales tax and 38 allow cities, counties or districts to add their own. A state is added to the list only when its rules have been checked against official guidance. For any other state, type your own combined rate — the calculator never guesses a local rate. The table below lists every state’s rate.</p>
        <h2>States with their own calculator</h2>
        ${stateLinks()}
        <p>More states are added as each state’s rules are checked against its official guidance.</p>
        <p>Buying a car? Vehicle tax follows its own rules for trade-ins, rebates and doc fees — use the <a href="/car-sales-tax-calculator/">car sales tax calculator</a>.</p>
      </div>
      <div>
        <h2>Sales tax rates by state</h2>
        <p>State rates, the population-weighted average local rate and the highest local rate as of July 1, 2026 (Tax Foundation). On a state with its own page the local rate is exact: New Jersey has none, and ${(() => { const l = live.filter((c) => E.STATES[c].places).map((c) => E.STATES[c].name); return l.length > 1 ? l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1] : l[0]; })()} ${live.filter((c) => E.STATES[c].places).length > 1 ? 'are' : 'is'} looked up by place from the official table.</p>
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

/* ---------- states whose rate depends on the place (Missouri, Ohio): rates come from the official table in assets/data/<xx>-rates.json ---------- */
const PLACES = {};
function placeRows(c) { if (!PLACES[c]) PLACES[c] = JSON.parse(fs.readFileSync(ROOT + 'assets/data/' + c.toLowerCase() + '-rates.json', 'utf8')).map((r) => ({ label: r[0], sales: r[1], use: r[2], food: r[3], foodUse: r[4] })); return PLACES[c]; }
function placeBy(c, label) { const p = placeRows(c).find((x) => x.label === label); if (!p) throw new Error('place not found: ' + label); return p; }
function placeLike(c, prefix) { const p = placeRows(c).find((x) => x.label.indexOf(prefix) === 0); if (!p) throw new Error('place not found: ' + prefix); return p; }
const MO_CITIES = [['St. Louis', 'St. Louis (city)'], ['Kansas City (Jackson County)', 'Kansas City, Jackson County — Kansas City Zoological District'], ['Kansas City (Clay County)', 'Kansas City, Clay County — Kansas City Zoological District'], ['Kansas City (Platte County)', 'Kansas City, Platte County'], ['Kansas City (Cass County)', 'Kansas City, Cass County'], ['Springfield', 'Springfield, Greene County'], ['Columbia', 'Columbia, Boone County'], ['Independence', 'Independence, Jackson County — Kansas City Zoological District'], ['Lee’s Summit', "Lee's Summit, Jackson County — Kansas City Zoological District"], ['St. Joseph', 'St. Joseph, Buchanan County'], ['St. Charles', 'St. Charles, St. Charles County'], ['St. Peters', 'St. Peters, St. Charles County'], ['Jefferson City', 'Jefferson City, Cole County'], ['Joplin', 'Joplin, Jasper County'], ['Chesterfield', 'Chesterfield, St. Louis County'], ['Florissant', 'Florissant, St. Louis County'], ['Cape Girardeau', 'Cape Girardeau, Cape Girardeau County']];
const OH_PREFIXES = ['Franklin County', 'Cuyahoga County', 'Hamilton County', 'Lucas County', 'Summit County', 'Montgomery County', 'Stark County', 'Mahoning County', 'Butler County', 'Lorain County', 'Lake County', 'Warren County', 'Delaware County (', 'Licking County (', 'Clark County', 'Medina County', 'Greene County', 'Fairfield County ('];

const ar = (c, p, cat, amt, extra) => E.add(Object.assign({ state: c, items: [{ amt: amt || 100, cat: cat || 'general' }], ship: 0, place: p }, extra || {}));

function moFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const sp = placeBy(c, 'Springfield, Greene County'), kcj = placeBy(c, MO_CITIES[1][1]), kcc = placeBy(c, MO_CITIES[2][1]), kcp = placeBy(c, MO_CITIES[3][1]), kcs = placeBy(c, MO_CITIES[4][1]), sl = placeBy(c, 'St. Louis (city)'), col = placeBy(c, 'Columbia, Boone County');
  const spF = ar(c, sp, 'grocery'), slG = ar(c, sl), slF = ar(c, sl, 'grocery');
  const ship = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: sp }), shipC = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: sp, shipTaxed: true });
  const use = ar(c, sp, 'general', 3000, { paid: 0 }), use2 = ar(c, sp, 'general', 3000, { paid: 4 });
  const rev = E.reverse({ state: c, total: 108.1, cat: 'general', place: sp });
  return [
    [`What is the sales tax rate in ${n}?`, `${n}’s state sales tax rate is ${pct(s.base)}, and every city, county and district adds its own tax on top. In the October–December 2026 rate table the combined rate runs from ${pct(P.lo)} to ${pct(P.baseHi)} by city and county, and up to ${pct(P.hi)} inside some shopping-center districts. Springfield is ${pct(sp.sales)}, Columbia ${pct(col.sales)} and St. Louis city ${pct(sl.sales)}. Search your place in the calculator above for your exact rate.`],
    [`Why is ${n} sales tax different in every city?`, `Cities, counties and special districts can each add a local sales tax to the ${pct(s.base)} state rate, and the seller collects the combined rate for where the store is. Even one city can have several rates: Kansas City is ${pct(kcc.sales)} in Clay County, ${pct(kcj.sales)} in Jackson County, ${pct(kcp.sales)} in Platte County and ${pct(kcs.sales)} in Cass County. A $100 purchase costs ${m(ar(c, sp).total)} in Springfield but ${m(ar(c, sl).total)} in St. Louis city.`],
    [`Is food taxed in ${n}?`, `Yes, but at a lower rate. The state rate on food for home use is cut to 1.225%, and local taxes still apply, so groceries are taxed at the “food” rate listed for your place: ${pct(sp.food)} in Springfield (${m(spF.tax)} on $100) and ${pct(sl.food)} in St. Louis city (${m(slF.tax)} on $100). Restaurant food is taxed at the full rate, and so is all food at a seller whose prepared food is more than 80% of its sales.`],
    [`Is clothing taxed in ${n}?`, `Yes. Clothing is taxed at the full combined rate for your place — ${m(slG.tax)} on $100 in St. Louis city. The exception is the back-to-school sales tax holiday, from 12:01 a.m. on the first Friday in August through Sunday, when clothing of $100 or less is free of state and local sales tax.`],
    [`Are prescription drugs taxed in ${n}?`, `No. Prescription drugs, insulin and hearing aids are exempt. Over-the-counter medicine is taxable unless it is prescribed or bought by a person with a disability. Choose “Prescription” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `Not when the delivery charge is usual, customary and listed separately on the bill (RSMo 144.010; DOR letter ruling 8387, March 24, 2026). A combined “shipping and handling” charge is taxed in full. On a $100 item in Springfield with $10 shipping listed separately the tax is ${m(ship.tax)}; billed as one charge it is ${m(shipC.tax)}. Tick the box in the calculator for the combined case.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your combined rate. In Springfield (${pct(sp.sales)}) a total of $108.10 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax”, pick your place and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax at the state rate of ${pct(s.base)} plus the local use tax where you use the item. A $3,000 item bought for use in Springfield with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. A use tax return is required once your untaxed purchases pass $2,000 in a year. Enter the tax the seller charged under Go advanced.`]
  ];
}

function ohFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const fr = placeLike(c, 'Franklin County'), cu = placeLike(c, 'Cuyahoga County'), ha = placeLike(c, 'Hamilton County'), lu = placeLike(c, 'Lucas County'), su = placeLike(c, 'Summit County'), bu = placeLike(c, 'Butler County'), wa = placeLike(c, 'Warren County'), cota = placeLike(c, 'Licking County — Reynoldsburg');
  const shipT = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: fr }), shipX = E.add({ state: c, items: [{ amt: 100, cat: 'grocery' }], ship: 10, place: fr });
  const use = ar(c, fr, 'general', 3000, { paid: 0 }), use2 = ar(c, fr, 'general', 3000, { paid: 5 });
  const rev = E.reverse({ state: c, total: 108, cat: 'general', place: fr });
  return [
    [`What is the sales tax rate in ${n}?`, `${n}’s state sales tax rate is ${pct(s.base)} and every county adds its own tax, and some add a transit tax. In the October–December 2026 table the combined rate runs from ${pct(P.lo)} (Butler, Lorain, Stark and Wayne counties) to ${pct(P.baseHi)} (Cuyahoga and Franklin) — up to ${pct(P.hi)} in the Reynoldsburg part of Licking County. Hamilton County is ${pct(ha.sales)}, Lucas ${pct(lu.sales)} and Summit ${pct(su.sales)}. State law caps the combined rate at 8.75%. Search your county in the calculator above.`],
    [`Why is ${n} sales tax different in every county?`, `Counties and regional transit authorities can add tax in steps of 0.05%, so each county ends up with its own rate. A $100 purchase costs ${m(ar(c, fr).total)} in Franklin County (Columbus) but ${m(ar(c, bu).total)} in Butler County. Rates can only change on January 1, April 1, July 1 or October 1 — Warren County went from 6.75% to ${pct(wa.sales)} on October 1, 2026.`],
    [`Is food taxed in ${n}?`, `Food you eat off the premises is exempt, takeout included: a $100 grocery bill has $0.00 of tax. Soft drinks, alcohol, dietary supplements and tobacco are taxable even in a grocery store, and food eaten on the premises is taxable — $100 of restaurant food in Franklin County has ${m(ar(c, fr, 'prepared').tax)} of tax. Choose the item type in the calculator to see the difference.`],
    [`Is clothing taxed in ${n}?`, `Yes. Clothing is taxed at your county’s rate — ${m(ar(c, fr).tax)} on $100 in Franklin County. The exception is the back-to-school sales tax holiday: in 2026 it ran from Friday, August 7 to Sunday, August 9 and exempted clothing of $75 or less per item. The dates and limits are set each year.`],
    [`Are prescription drugs taxed in ${n}?`, `No. Prescription medicine and supplies, doctor-prescribed equipment and prescription glasses and contacts are exempt. Over-the-counter medicine, vitamins and supplements are taxable. Choose “Prescription” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `A delivery charge the seller adds is part of the price, so it is taxed with a taxable item and not taxed with an exempt one. On a $100 taxable item in Franklin County with $10 shipping the tax is ${m(shipT.tax)}; on $100 of exempt groceries it is ${m(shipX.tax)}. A mixed shipment is split by price or weight, and a carrier you pay directly is not taxed.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your county’s rate. In Franklin County (${pct(fr.sales)}) a total of $108.00 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax”, pick your county and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax at your county’s rate. A $3,000 item delivered to Franklin County with no tax charged means ${m(use.owed)} of use tax; if the seller charged 5% you still owe ${m(use2.owed)}. Enter the tax the seller charged under Go advanced.`]
  ];
}

const MN_CITIES = [['Minneapolis', 'City of Minneapolis'], ['St. Paul', 'City of St. Paul'], ['Rochester', 'City of Rochester'], ['Duluth', 'City of Duluth'], ['Bloomington', 'City of Bloomington'], ['Brooklyn Park', 'Brooklyn Park — Hennepin County'], ['Plymouth', 'Plymouth — Hennepin County'], ['Maple Grove', 'City of Maple Grove'], ['Woodbury', 'City of Woodbury'], ['Eagan', 'Eagan — Dakota County'], ['Golden Valley', 'City of Golden Valley'], ['St. Cloud (Stearns County)', 'St. Cloud — Stearns County'], ['Mankato', 'City of Mankato'], ['Moorhead', 'City of Moorhead'], ['Winona', 'Winona — Winona County'], ['Bemidji', 'City of Bemidji'], ['Owatonna', 'Owatonna — Steele County']];

function mnFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const mp = placeBy(c, 'City of Minneapolis'), sp = placeBy(c, 'City of St. Paul'), ro = placeBy(c, 'City of Rochester'), du = placeBy(c, 'City of Duluth'), gv = placeBy(c, 'City of Golden Valley'), ow = placeBy(c, 'Owatonna — Steele County'), els = placeBy(c, 'Anywhere else in Minnesota — not listed in the DOR guide');
  const shipT = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: mp }), shipX = E.add({ state: c, items: [{ amt: 100, cat: 'grocery' }], ship: 10, place: mp });
  const use = ar(c, mp, 'general', 3000, { paid: 0 }), use2 = ar(c, mp, 'general', 3000, { paid: 4 });
  const rev = E.reverse({ state: c, total: 109.03, cat: 'general', place: mp });
  return [
    [`What is the sales tax rate in ${n}?`, `${n}’s state sales tax rate is ${pct(s.base)}, and cities, counties and transit areas add their own. In the Department of Revenue’s October–December 2026 guide the combined rate runs from ${pct(P.lo)} (no local tax) to ${pct(P.hi)} in St. Paul. Minneapolis is ${pct(mp.sales)}, Rochester ${pct(ro.sales)}, Duluth ${pct(du.sales)} and Owatonna ${pct(ow.sales)}. Search your city in the calculator above for your exact rate.`],
    [`Why is ${n} sales tax different in every city?`, `The ${pct(s.base)} state rate is topped up by a county or transit tax (often 0.5%), a city tax in some cities and, in the seven Twin Cities metro counties, 1% for housing and transportation. A $100 purchase costs ${m(ar(c, mp).total)} in Minneapolis, ${m(ar(c, sp).total)} in St. Paul and ${m(ar(c, ro).total)} in Rochester. Golden Valley is ${pct(gv.sales)}, the highest rate in the metro outside St. Paul. Rates can change on January 1, April 1, July 1 or October 1.`],
    [`Is food taxed in ${n}?`, `Groceries are exempt: a $100 grocery bill has $0.00 of tax. Candy, soft drinks, alcohol, prepared food, dietary supplements and food from vending machines are taxable, so a $100 restaurant meal in Minneapolis has ${m(ar(c, mp, 'prepared').tax)} of tax. Some places add a food and beverage tax on restaurants on top of that — Minneapolis downtown, Mankato, Marshall, North Mankato, Detroit Lakes, Proctor, St. Cloud and the Giants Ridge area — and the calculator lists your place’s extras under the search box.`],
    [`Is clothing taxed in ${n}?`, `No. General-use clothing is exempt at any price: ${m(ar(c, mp, 'clothing').tax)} of tax on $100 of clothing. The exemption does not cover fur clothing, clothing accessories such as handbags, jewelry and nonprescription sunglasses, sports or recreational equipment, or protective equipment — those are taxed at your place’s rate (${m(ar(c, mp).tax)} on $100 in Minneapolis).`],
    [`Are prescription drugs taxed in ${n}?`, `No. Prescription drugs and over-the-counter drugs with a Drug Facts panel or active-ingredient list are exempt. Vitamins, minerals and other dietary supplements are taxable. Choose “Medicine” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `A delivery charge from the seller follows the item: taxed with a taxable item, not taxed with an exempt one. On a $100 taxable item in Minneapolis with $10 shipping the tax is ${m(shipT.tax)}; on $100 of exempt groceries it is ${m(shipX.tax)}. A mixed shipment is split by price or weight, and a carrier you pay directly is not taxed. A separate 50-cent retail delivery fee can apply to qualifying deliveries of $100 or more; it is not part of the sales tax.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your combined rate. In Minneapolis (${pct(mp.sales)}) a total of $109.03 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax”, pick your city and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax at the combined rate for where you use the item. A $3,000 item used in Minneapolis with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the tax the seller charged under Go advanced.`],
    [`What if my city is not in the Department of Revenue list?`, `The Department of Revenue guide lists only places that have a local sales tax, so the calculator offers “Anywhere else in Minnesota” at the ${pct(s.base)} state rate (${m(ar(c, els).total)} on $100). If you are unsure, check your address in the department’s own Sales Tax Rate Calculator.`]
  ];
}

const CA_CITIES = [['Los Angeles', 'Los Angeles'], ['San Diego', 'San Diego'], ['San Jose', 'San Jose'], ['San Francisco', 'San Francisco'], ['Fresno', 'Fresno'], ['Sacramento', 'Sacramento'], ['Long Beach', 'Long Beach'], ['Oakland', 'Oakland'], ['Bakersfield', 'Bakersfield'], ['Anaheim', 'Anaheim'], ['Irvine', 'Irvine'], ['Riverside', 'Riverside'], ['Santa Monica', 'Santa Monica'], ['Pasadena', 'Pasadena'], ['Lancaster', 'Lancaster'], ['Palmdale', 'Palmdale']];

function caFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const la = placeBy(c, CA_CITIES[0][1]), sd = placeBy(c, CA_CITIES[1][1]), sj = placeBy(c, CA_CITIES[2][1]), sf = placeBy(c, CA_CITIES[3][1]), sa = placeBy(c, CA_CITIES[5][1]), lb = placeBy(c, CA_CITIES[6][1]), pd = placeBy(c, CA_CITIES[15][1]);
  const shipT = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: la }), shipC = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: la, shipTaxed: true });
  const use = ar(c, la, 'general', 3000, { paid: 0 }), use2 = ar(c, la, 'general', 3000, { paid: 4 });
  const rev = E.reverse({ state: c, total: 110.25, cat: 'general', place: la });
  return [
    [`What is the sales tax rate in ${n}?`, `${n}’s statewide sales tax rate is ${pct(s.base)}, and most cities and counties add district taxes of 0.10% to 2.00% on top. In the CDTFA’s October 1, 2026 table the combined rate runs from ${pct(P.lo)} to ${pct(P.baseHi)} (Lancaster and Palmdale). Los Angeles is ${pct(la.sales)}, San Francisco ${pct(sf.sales)}, San Diego ${pct(sd.sales)}, San Jose ${pct(sj.sales)} and Sacramento ${pct(sa.sales)}. Search your city in the calculator above for your rate.`],
    [`What is the ${n} sales tax made of?`, `The ${pct(s.base)} base is 6% state tax plus 1.25% local tax (0.25% for county transportation and 1% for city or county operations). Voter-approved district taxes are added on top, so a $100 purchase costs ${m(ar(c, sd).total)} in San Diego, ${m(ar(c, la).total)} in Los Angeles and ${m(ar(c, lb).total)} in Long Beach. A place can have more than one district tax.`],
    [`Is food taxed in ${n}?`, `Groceries are exempt — a $100 grocery bill has $0.00 of tax, and candy, juice and noncarbonated bottled water count as groceries. Hot prepared food and restaurant meals are taxable whether eaten there or taken away: $100 of restaurant food in Los Angeles has ${m(ar(c, la, 'prepared').tax)} of tax. Carbonated drinks and alcohol bought in a store are taxable too (${m(ar(c, la, 'soda').tax)} on $100). Choose the item type to see the difference.`],
    [`Is clothing taxed in ${n}?`, `Yes. ${n} has no clothing exemption, so clothing and shoes are taxed at your place’s rate — ${m(ar(c, la).tax)} on $100 in Los Angeles and ${m(ar(c, sd).tax)} in San Diego.`],
    [`Are prescription drugs taxed in ${n}?`, `No. Medicine dispensed on a prescription and certain medical devices are exempt. Over-the-counter medicine is taxable. Choose “Prescription” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `Not when the charge is listed separately on the bill and covers the actual cost of carrier, mail or the seller’s own delivery after the sale (CDTFA Regulation 1628). On a $100 item in Los Angeles with $10 shipping listed separately the tax is ${m(shipT.tax)}; billed as one shipping-and-handling charge it is ${m(shipC.tax)}, because only the actual shipping part can be left out. Tick the box in the calculator for the combined case.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your combined rate. In Los Angeles (${pct(la.sales)}) a total of $110.25 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax”, pick your city and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax at the combined rate for where you use the item. A $3,000 item used in Los Angeles with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the tax the seller charged under Go advanced.`],
    [`Can I find my exact ${n} rate from a ZIP code?`, `Not reliably. The CDTFA says district tax areas can cut across a city, so a ZIP code or mailing address does not always give the right rate. This calculator uses the rate the CDTFA lists for your city or county, and the CDTFA’s find-a-rate-by-address tool gives the exact rate for one address. Palmdale, for example, is ${pct(pd.sales)}.`],
    [`What sales tax do I pay on a car in ${n}?`, `Vehicles are taxed at the rate of the place where they will be registered, not where they are bought. Pick that place in the calculator — for a $30,000 car registered in Los Angeles the tax is ${m(ar(c, la, 'general', 30000).tax)}. Registration fees and other charges are separate.`]
  ];
}

const TX_CITIES = [['Houston', 'Houston (Harris Co)'], ['Dallas', 'Dallas (Dallas Co)'], ['Austin', 'Austin (Travis Co)'], ['San Antonio', 'San Antonio (Bexar Co)'], ['Fort Worth', 'Fort Worth (Tarrant Co)'], ['El Paso', 'El Paso'], ['Arlington', 'Arlington (Tarrant Co)'], ['Plano', 'Plano (Collin Co)'], ['Corpus Christi', 'Corpus Christi (Nueces Co)'], ['Lubbock', 'Lubbock'], ['Laredo', 'Laredo'], ['Irving', 'Irving (Dallas Co)'], ['Garland', 'Garland (Dallas Co)'], ['Frisco', 'Frisco (Collin Co)'], ['McKinney', 'McKinney (Collin Co)'], ['Amarillo', 'Amarillo (Potter Co)'], ['Waco', 'Waco'], ['Ackerly (small town)', 'Ackerly'], ['Acton (small town)', 'Acton'], ['Ace (small town)', 'Ace']];

function txFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const hou = placeBy(c, TX_CITIES[0][1]), dal = placeBy(c, TX_CITIES[1][1]), aus = placeBy(c, TX_CITIES[2][1]), sa = placeBy(c, TX_CITIES[3][1]), ace = placeBy(c, 'Ace');
  const shipT = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: aus }), shipX = E.add({ state: c, items: [{ amt: 100, cat: 'grocery' }], ship: 10, place: aus });
  const use = ar(c, aus, 'general', 3000, { paid: 0 }), use2 = ar(c, aus, 'general', 3000, { paid: 4 });
  const rev = E.reverse({ state: c, total: 108.25, cat: 'general', place: aus });
  const sofa = E.add({ state: c, items: [{ amt: 500, cat: 'general' }], ship: 50, place: aus });
  return [
    [`What is the sales tax rate in ${n}?`, `${n}’s state sales tax rate is ${pct(s.base)} and cities, counties, transit authorities and special districts add up to 2%, so the combined rate is capped at ${pct(P.hi)}. In the Comptroller’s October 2026 table the combined rate runs from ${pct(P.lo)} to ${pct(P.hi)}: Houston, Dallas, Austin and San Antonio are all ${pct(hou.sales)}, while a small town such as Ace is ${pct(ace.sales)}. Search your city in the calculator above for your rate.`],
    [`Why does ${n} sales tax differ from town to town?`, `Each place adds its own pieces to the ${pct(s.base)} state rate — a city tax (up to 2%), a county tax, a transit authority or a special district — and the total can never go above ${pct(P.hi)}. A $100 purchase costs ${m(ar(c, aus).total)} in Austin but ${m(ar(c, ace).total)} in Ace. A city that spans several counties is listed once for each county where the pieces differ.`],
    [`Is food taxed in ${n}?`, `Basic groceries are exempt: a $100 grocery bill has $0.00 of tax, and water, milk and juice drinks with more than 50% juice are exempt too. Candy and gum, soft drinks and individual-size snacks (under 2.5 ounces) are taxable even in a grocery store — ${m(ar(c, aus, 'candy').tax)} on $100 in Austin. Restaurant food is taxable: ${m(ar(c, aus, 'prepared').tax)} on $100. Choose the item type in the calculator to see the difference.`],
    [`Is clothing taxed in ${n}?`, `Yes. Clothing is taxed at your place’s rate — ${m(ar(c, aus).tax)} on $100 in Austin. The exception is the annual sales tax holiday in August, when most clothing and footwear sold for under $100 is tax free; the next one is August 6–8, 2027.`],
    [`Are prescription and over-the-counter drugs taxed in ${n}?`, `No. Prescription drugs and over-the-counter medicine with an FDA Drug Facts label are exempt. A drug without a Drug Facts label is exempt only when a physician prescribes or dispenses it. Choose “Medicine” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `Delivery and shipping charges connected with a taxable item are taxable, and charges on an exempt item are not. A $500 item with $50 delivery in Austin is taxed on $550 — ${m(sofa.tax)} of tax. On a $100 taxable item with $10 shipping the tax is ${m(shipT.tax)}; on $100 of exempt groceries with $10 shipping it is ${m(shipX.tax)}.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your combined rate. In Austin (${pct(aus.sales)}) a total of $108.25 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax”, pick your city and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax: ${pct(s.base)} state plus up to 2% local use tax, depending on where you use the item, less any sales tax you already paid to another state. A $3,000 item used in Austin with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the tax the seller charged under Go advanced.`],
    [`Which local rate applies to an order shipped to me in ${n}?`, `It depends on where the seller received and filled the order. A seller with a Texas place of business generally charges its own location’s local rate; if the order was filled from a Texas location that is not a place of business, or from outside Texas, the ship-to address decides. For in-person purchases it is the rate where you buy. The Comptroller’s Local Sales and Use Tax Collection publication (94-105) has the full table.`],
    [`What sales tax do I pay on a car in ${n}?`, `Motor vehicles pay the state motor vehicle sales tax of 6.25% to the county tax office, and local sales taxes are not charged on them. The calculator does not compute vehicle tax.`]
  ];
}

const FL_COUNTIES = ['Miami-Dade County', 'Broward County', 'Palm Beach County', 'Hillsborough County', 'Orange County', 'Pinellas County', 'Duval County', 'Lee County', 'Polk County', 'Brevard County', 'Volusia County', 'Pasco County', 'Sarasota County', 'Seminole County', 'Leon County', 'Alachua County', 'Collier County', 'Citrus County', 'Hamilton County'];
function flFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const or = placeBy(c, 'Orange County'), md = placeBy(c, 'Miami-Dade County'), hi = placeBy(c, 'Hillsborough County'), du = placeBy(c, 'Duval County'), co = placeBy(c, 'Collier County'), ha = placeBy(c, 'Hamilton County');
  const big = ar(c, md, 'general', 20000), flat = Math.round(20000 * md.sales) / 100;
  const meal = ar(c, or, 'prepared', 100), shipT = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: or, shipTaxed: true }), shipN = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: or, shipTaxed: false });
  const rev = E.reverse({ state: c, total: 106.5, cat: 'general', place: or }), revBig = E.reverse({ state: c, total: big.total, cat: 'general', place: md });
  const use = ar(c, or, 'general', 3000, { paid: 0 }), use2 = ar(c, or, 'general', 3000, { paid: 4 });
  return [
    [`What is the sales tax rate in ${n}?`, `${n}’s state sales tax rate is ${pct(s.base)} and each county can add a discretionary sales surtax of 0.5% to 2%, so the combined rate runs from ${pct(P.lo)} to ${pct(P.hi)}. In the Department of Revenue’s 2026 list Orange County (Orlando) is ${pct(or.sales)}, Miami-Dade ${pct(md.sales)}, Hillsborough (Tampa) ${pct(hi.sales)}, Duval (Jacksonville) ${pct(du.sales)}, Collier ${pct(co.sales)} and Hamilton ${pct(ha.sales)}. Florida has no city sales taxes. Search your county or city in the calculator above.`],
    [`What is the $5,000 limit on the county surtax?`, `The county surtax applies only to the first $5,000 of the sale of a single item, while the ${pct(s.base)} state tax applies to the whole price. On a $20,000 item in Miami-Dade County (${pct(md.sales)}) the tax is ${m(big.tax)} — 6% of $20,000 plus 1% of $5,000 — not ${m(flat)}. The limit applies per item, not per shopping cart, and does not apply to services, admissions or short-term rentals.`],
    [`Is food taxed in ${n}?`, `Groceries are exempt — meat, dairy, produce, bread, drinking water, coffee, vitamins and food supplements carry no sales tax. Candy, fruit drinks labeled “ade”, “beverage” or “drink”, ice cream novelties and ready-to-eat sandwiches are taxable, and so are restaurant meals: $100 of restaurant food in Orange County has ${m(meal.tax)} of tax. Choose the item type in the calculator to see the difference.`],
    [`Is clothing taxed in ${n}?`, `Yes. Clothing is taxed at the full rate for your county. The exception is the annual back-to-school sales tax holiday — in 2026 it ran from July 20 to August 20 and exempted clothing, shoes and bags of $100 or less per item, school supplies of $50 or less and computers of $1,500 or less for home use. The dates are set each year.`],
    [`Are prescription and over-the-counter drugs taxed in ${n}?`, `Medicine dispensed on a prescription is exempt. The Department of Revenue also lists common household remedies that are exempt with or without a prescription, such as pain relievers, antacids, cough and cold items and first aid supplies, plus insulin, test kits and prescription glasses. Cosmetics and toiletries stay taxable even with medicinal ingredients. Choose “Medicine” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `Delivery charges are taxed with a taxable item unless they are listed separately on the bill and you can avoid them, for example by picking the item up or using your own carrier. On a $100 item in Orange County with $10 shipping the tax is ${m(shipT.tax)} when the delivery is required by the seller and ${m(shipN.tax)} when it is avoidable and listed separately. Untick the shipping box in the calculator for the avoidable case.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your county’s rate when the item costs $5,000 or less. In Orange County (${pct(or.sales)}) a total of $106.50 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Above $5,000 the surtax stops, so the calculator works it out in two steps: a total of ${m(big.total)} in Miami-Dade County is ${m(revBig.pre)} before tax. Switch the calculator to “Remove tax”, pick your county and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax at the same rate: 6% plus the surtax of the county where you use the item, with the same $5,000 limit. A $3,000 item delivered to Orange County with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Out-of-state sellers with more than $100,000 of taxable Florida sales in the prior year must collect Florida tax. Enter the tax the seller charged under Go advanced.`],
    [`Which county’s rate do I pay in ${n}?`, `The county where the item is delivered or handed to you. For a motor vehicle or a mobile home it is the county of the buyer’s home address, so pick the buyer’s county in the calculator. The calculator does not work out vehicle tax or tourist taxes on hotel stays.`]
  ];
}

const PF = {
  FL: {
    unit: 'county', sampleLabel: 'Orange County', sampleName: 'Orange County', faqs: flFaqs,
    cityRows: () => FL_COUNTIES.map((x) => [x, placeBy('FL', x)]), cityHead: 'Florida sales tax rate by county', cityLead: 'County',
    extra: (s, P) => { const rows = placeRows('FL').filter((x) => / County$/.test(x.label) && x.label.indexOf(' — ') < 0).map((x) => '<tr><td>' + x.label + '</td><td>' + (x.sales > s.base ? pct(Math.round((x.sales - s.base) * 1000) / 1000) : 'None') + '</td><td>' + pct(x.sales) + '</td></tr>').join(''); return '<h2>County surtax rates, all 67 counties</h2><p>The total discretionary sales surtax for each county from the Department of Revenue’s 2026 form, and the combined rate with the 6% state tax. The surtax applies to the first $5,000 of each item.</p><div class="pc-tblwrap"><table class="dtable"><thead><tr><th>County</th><th>County surtax</th><th>Combined rate</th></tr></thead><tbody>' + rows + '</tbody></table></div>'; },
    heroP: (s, P, a) => `${s.name} charges a ${pct(s.base)} state sales tax and <strong>each county adds a surtax of up to 2%</strong> on the first $5,000 of an item — combined rates run from ${pct(P.lo)} to ${pct(P.hi)}. Search your county or city to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Orange County (Orlando) with <strong>${m(a.tax)}</strong> of tax.`,
    glance: (s, P) => `<p>${s.name}’s state rate is <strong>${pct(s.base)}</strong>. There are no city sales taxes: the local part is the county’s discretionary sales surtax, 0.5% to 2%, charged where the item is delivered or handed to you. In the Department of Revenue’s 2026 list the combined rate runs from <strong>${pct(P.lo)}</strong> (Citrus and Collier counties) to <strong>${pct(P.hi)}</strong> (Hamilton County). The surtax applies only to the <strong>first $5,000</strong> of a single item, so a big purchase costs less than the county rate suggests.</p>
        <p>Orlando (Orange County) is ${pct(placeBy('FL', 'Orange County').sales)}, Miami ${pct(placeBy('FL', 'Miami-Dade County').sales)}, Tampa ${pct(placeBy('FL', 'Hillsborough County').sales)} and Jacksonville ${pct(placeBy('FL', 'Duval County').sales)}. Groceries and medicine are exempt but clothing is not, so the calculator looks up your county, your item type and the $5,000 limit instead of guessing.</p>`,
    cityNote: (s, P) => `County rates from the Florida Department of Revenue’s 2026 surtax form (DR-15DSS, R. 11/25), added to the 6% state rate. Search the calculator for any of the 67 counties or ${P.n - 67} larger cities — the city names are only there to help you find the county, and the rate is always the county’s. The Department publishes a new list every November.`,
    shipLine: (c, s, p) => `On a $100 item in Orange County with $10 shipping the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: true }).tax)} when the seller requires delivery and ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: false }).tax)} when it is avoidable and listed separately.`,
    use: 'Search your county or city, pick where the item is delivered, add one item or several, choose what each one is and add shipping.',
    title: (s) => s.name + ' Sales Tax Calculator 2026 — ' + pct(s.base) + ' + County Surtax | CalcThis',
    desc: (s) => s.name + ' sales tax calculator by county: ' + pct(s.base) + ' state plus county surtax on the first $5,000 of an item, official 2026 rates, groceries and Rx exempt.',
    ogTitle: (s) => s.name + ' Sales Tax Calculator 2026 — by County', source: 'Florida Department of Revenue', sampleOf: 'in Orange County'
  },
  MO: {
    unit: 'city', sampleLabel: 'Springfield, Greene County', sampleName: 'Springfield', faqs: moFaqs,
    cityRows: () => MO_CITIES.map((x) => [x[0], placeBy('MO', x[1])]), cityHead: 'Sales tax by city', cityLead: 'Place',
    heroP: (s, P, a) => `${s.name} charges a ${pct(s.base)} state sales tax and <strong>every city, county and district adds its own</strong> — combined rates run from ${pct(P.lo)} to ${pct(P.baseHi)}. Search your city to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Springfield with <strong>${m(a.tax)}</strong> of tax.`,
    glance: (s, P) => `<p>${s.name}’s state rate is <strong>${pct(s.base)}</strong>. Cities, counties and special districts add their own tax, and the seller collects the combined rate for the store’s location. In the October–December 2026 table the combined rate runs from <strong>${pct(P.lo)}</strong> to <strong>${pct(P.baseHi)}</strong> by city and county, and up to <strong>${pct(P.hi)}</strong> inside some Community Improvement Districts and Transportation Development Districts. Local rates change in January, April, July and October.</p>
        <p>Even one city can have several rates — Kansas City is ${pct(placeBy('MO', MO_CITIES[2][1]).sales)} in Clay County, ${pct(placeBy('MO', MO_CITIES[1][1]).sales)} in Jackson County, ${pct(placeBy('MO', MO_CITIES[3][1]).sales)} in Platte County and ${pct(placeBy('MO', MO_CITIES[4][1]).sales)} in Cass County — so the calculator looks up your exact place instead of guessing.</p>`,
    cityNote: (s, P) => `City and county rates from the Missouri Department of Revenue table for October–December 2026, including any district the DOR lists for the whole place. Search the calculator for any of the ${P.n.toLocaleString('en-US')} places and districts in the table.`,
    shipLine: (c, s, p) => `On a $100 item in Springfield with $10 shipping listed separately the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p }).tax)}; billed as one shipping-and-handling charge it is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: true }).tax)}.`,
    use: 'Search your city or county, pick the line that matches where the seller is, add one item or several, choose what each one is and add shipping.',
    title: (s) => s.name + ' Sales Tax Calculator 2026 — ' + pct(s.base) + ' + Local, by City | CalcThis',
    desc: (s) => s.name + ' sales tax calculator by city and county: ' + pct(s.base) + ' state plus local, official Oct–Dec 2026 rates, reduced food rate, Rx exempt, shipping rule.',
    ogTitle: (s) => s.name + ' Sales Tax Calculator 2026 — by City', source: 'Missouri Department of Revenue', sampleOf: 'in Springfield'
  },
  OH: {
    unit: 'county', sampleLabel: 'Franklin County', sampleName: 'Franklin County', faqs: ohFaqs,
    cityRows: () => OH_PREFIXES.map((x) => { const p = placeLike('OH', x); return [p.label, p]; }), cityHead: 'Sales tax by county', cityLead: 'County',
    heroP: (s, P, a) => `${s.name} charges a ${pct(s.base)} state sales tax and <strong>every county adds its own</strong> — combined rates run from ${pct(P.lo)} to ${pct(P.baseHi)}. Search your county or city to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Franklin County (Columbus) with <strong>${m(a.tax)}</strong> of tax.`,
    glance: (s, P) => `<p>${s.name}’s state rate is <strong>${pct(s.base)}</strong>. Every county adds its own tax and some add a transit tax, and the rate that applies depends on where the sale is sourced — usually the county where you receive the item. In the October 1 – December 31, 2026 table the combined rate runs from <strong>${pct(P.lo)}</strong> to <strong>${pct(P.baseHi)}</strong> by county, and up to <strong>${pct(P.hi)}</strong> in the Reynoldsburg part of Licking County. State law caps the combined rate at 8.75%, and rates can only change on January 1, April 1, July 1 or October 1.</p>
        <p>A few city areas on a transit line pay a different rate from the rest of their county — the parts of Columbus, Dublin, Westerville and Reynoldsburg in Delaware, Fairfield, Licking and Union counties (COTA) and the part of Rossford in Wood County (TARTA) — so they are listed as separate lines in the search.</p>`,
    cityNote: (s, P) => `County rates from the Ohio Department of Taxation table for October 1 – December 31, 2026. The city names in brackets are only there to help you find your county — the rate is always the county’s. Search the calculator for any of the ${P.n} county and transit-area rates in the table.`,
    shipLine: (c, s, p) => `On a $100 taxable item in Franklin County with $10 shipping the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p }).tax)}; on $100 of exempt groceries with $10 shipping it is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'grocery' }], ship: 10, place: p }).tax)}.`,
    use: 'Search your county or city, pick where you receive the item, add one item or several, choose what each one is and add shipping.',
    title: (s) => s.name + ' Sales Tax Calculator 2026 — ' + pct(s.base) + ' + County Rates | CalcThis',
    desc: (s) => s.name + ' sales tax calculator by county: ' + pct(s.base) + ' state plus county and transit, official Oct–Dec 2026 rates, groceries and Rx exempt, shipping rule.',
    ogTitle: (s) => s.name + ' Sales Tax Calculator 2026 — by County', source: 'Ohio Department of Taxation', sampleOf: 'in Franklin County'
  }
  ,
  MN: {
    unit: 'city', sampleLabel: 'City of Minneapolis', sampleName: 'Minneapolis', faqs: mnFaqs,
    cityRows: () => MN_CITIES.map((x) => [x[0], placeBy('MN', x[1])]), cityHead: 'Sales tax by city', cityLead: 'City',
    heroP: (s, P, a) => `${s.name} charges a ${pct(s.base)} state sales tax and <strong>cities, counties and transit areas add their own</strong> — combined rates run from ${pct(P.lo)} to ${pct(P.baseHi)}. Search your city to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Minneapolis with <strong>${m(a.tax)}</strong> of tax.`,
    glance: (s, P) => `<p>${s.name}’s state rate is <strong>${pct(s.base)}</strong>. Local taxes are added on top: a county or transit tax (often 0.5%), a city tax in some cities, and 1% for housing and transportation in the seven Twin Cities metro counties. In the Department of Revenue’s October–December 2026 guide the combined rate runs from <strong>${pct(P.lo)}</strong> to <strong>${pct(P.baseHi)}</strong> (St. Paul). Local rates change in January, April, July and October.</p>
        <p>Groceries, general clothing and medicine are exempt, so only part of a typical shopping trip is taxed. Minneapolis is ${pct(placeBy('MN', 'City of Minneapolis').sales)}, St. Paul ${pct(placeBy('MN', 'City of St. Paul').sales)}, Rochester ${pct(placeBy('MN', 'City of Rochester').sales)} and Duluth ${pct(placeBy('MN', 'City of Duluth').sales)} — so the calculator looks up your exact place instead of guessing.</p>`,
    cityNote: (s, P) => `Combined state and local rates from the Minnesota Department of Revenue guide for October–December 2026. Special local taxes (restaurant, entertainment, lodging) are not in these rates — your place’s extras are listed under the search box. Search the calculator for any of the ${P.n.toLocaleString('en-US')} cities, counties and townships in the guide.`,
    shipLine: (c, s, p) => `On a $100 taxable item in Minneapolis with $10 shipping the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p }).tax)}; on $100 of exempt groceries with $10 shipping it is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'grocery' }], ship: 10, place: p }).tax)}.`,
    use: 'Search your city, pick the line that matches where the seller is, add one item or several, choose what each one is and add shipping.',
    title: (s) => s.name + ' Sales Tax Calculator 2026 — ' + pct(s.base) + ' + Local, by City | CalcThis',
    desc: (s) => s.name + ' sales tax calculator by city: ' + pct(s.base) + ' state plus local, official Oct–Dec 2026 rates, groceries, clothing and medicine exempt, shipping rule.',
    ogTitle: (s) => s.name + ' Sales Tax Calculator 2026 — by City', source: 'Minnesota Department of Revenue', sampleOf: 'in Minneapolis'
  }
  ,
  CA: {
    unit: 'city', sampleLabel: 'Los Angeles', sampleName: 'Los Angeles', faqs: caFaqs,
    cityRows: () => CA_CITIES.map((x) => [x[0], placeBy('CA', x[1])]), cityHead: 'California sales tax rate by city', cityLead: 'City',
    extra: (s, P) => { const rows = placeRows('CA').filter((x) => /County$/.test(x.label) || /\(unincorporated areas\)$/.test(x.label)).map((x) => '<tr><td>' + x.label.replace(' (unincorporated areas)', '') + '</td><td>' + pct(x.sales) + '</td></tr>').join(''); return '<h2>California sales tax rate by county</h2><p>The rate for the unincorporated areas of each county, from the CDTFA table. A city inside a county can have a different rate — search your city in the calculator.</p><div class="pc-tblwrap"><table class="dtable"><thead><tr><th>County</th><th>Unincorporated areas</th></tr></thead><tbody>' + rows + '</tbody></table></div>'; },
    heroP: (s, P, a) => `${s.name} charges a ${pct(s.base)} statewide sales tax and <strong>cities and counties add district taxes</strong> — combined rates run from ${pct(P.lo)} to ${pct(P.baseHi)}. Search your city to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Los Angeles with <strong>${m(a.tax)}</strong> of tax.`,
    glance: (s, P) => `<p>${s.name}’s base rate is <strong>${pct(s.base)}</strong> — 6% state plus 1.25% local — and cities and counties add voter-approved district taxes of 0.10% to 2.00%, so the rate you pay depends on where the sale happens. In the CDTFA’s October 1, 2026 table the combined rate runs from <strong>${pct(P.lo)}</strong> to <strong>${pct(P.baseHi)}</strong>. District taxes start on the first day of a calendar quarter.</p>
        <p>Los Angeles is ${pct(placeBy('CA', CA_CITIES[0][1]).sales)}, San Francisco ${pct(placeBy('CA', CA_CITIES[3][1]).sales)}, San Diego ${pct(placeBy('CA', CA_CITIES[1][1]).sales)} and Sacramento ${pct(placeBy('CA', CA_CITIES[5][1]).sales)}. Groceries and prescriptions are exempt, but clothing is not — so the calculator looks up your place and item type instead of guessing.</p>`,
    cityNote: (s, P) => `Combined rates from the California Department of Tax and Fee Administration table effective October 1, 2026. District tax areas can cut across a city, so use the CDTFA address lookup for an exact address. Search the calculator for any of the ${P.n.toLocaleString('en-US')} cities and counties in the table.`,
    shipLine: (c, s, p) => `On a $100 item in Los Angeles with $10 shipping listed separately the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p }).tax)}; billed as one shipping-and-handling charge it is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: true }).tax)}.`,
    use: 'Search your city or county, pick the line that matches where the sale happens, add one item or several, choose what each one is and add shipping.',
    title: (s) => s.name + ' Sales Tax Calculator &amp; Rates by City 2026 | CalcThis',
    desc: (s) => s.name + ' sales tax rates by city and county (' + pct(s.base) + ' to 11.75%, CDTFA Oct 2026) plus a free calculator: add or remove tax, groceries exempt, shipping rule.',
    ogTitle: (s) => s.name + ' Sales Tax Calculator & Rates by City 2026', source: 'California Department of Tax and Fee Administration', sampleOf: 'in Los Angeles'
  }
  ,
  TX: {
    unit: 'city', sampleLabel: 'Austin (Travis Co)', sampleName: 'Austin', faqs: txFaqs,
    cityRows: () => TX_CITIES.map((x) => [x[0], placeBy('TX', x[1])]), cityHead: 'Texas sales tax rate by city', cityLead: 'City',
    heroP: (s, P, a) => `${s.name} charges a ${pct(s.base)} state sales tax and <strong>cities, counties and districts add up to 2%</strong> — combined rates run from ${pct(P.lo)} to ${pct(P.hi)}. Search your city to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Austin with <strong>${m(a.tax)}</strong> of tax.`,
    glance: (s, P) => `<p>${s.name}’s state rate is <strong>${pct(s.base)}</strong>. Cities, counties, transit authorities and special districts add up to 2% on top, so the combined rate is capped at <strong>${pct(P.hi)}</strong>. In the Comptroller’s October 2026 table the combined rate runs from <strong>${pct(P.lo)}</strong> to <strong>${pct(P.hi)}</strong> — 8.25% in most big cities and 6.75% in many small towns. Local rates can change in January, April, July and October.</p>
        <p>Houston, Dallas, Austin and San Antonio are all ${pct(placeBy('TX', TX_CITIES[0][1]).sales)}. Groceries, water, milk and medicine are exempt, but candy, soft drinks, restaurant food and clothing are taxed — so the calculator looks up your place and item type instead of guessing.</p>`,
    cityNote: (s, P) => `Combined rates from the Texas Comptroller table for October 2026. Search the calculator for any of the ${P.n.toLocaleString('en-US')} places in the table; a city that spans several counties is listed once per county when its pieces differ.`,
    shipLine: (c, s, p) => `On a $100 taxable item in Austin with $10 shipping the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p }).tax)}; on $100 of exempt groceries with $10 shipping it is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'grocery' }], ship: 10, place: p }).tax)}.`,
    use: 'Search your city, pick the line that matches where the sale happens, add one item or several, choose what each one is and add shipping.',
    title: (s) => s.name + ' Sales Tax Calculator & Rates by City 2026 | CalcThis',
    desc: (s) => s.name + ' sales tax rates by city (' + pct(s.base) + ' state, up to 8.25% combined, Comptroller Oct 2026) plus a free calculator: groceries exempt, candy taxed, shipping rule.',
    ogTitle: (s) => s.name + ' Sales Tax Calculator & Rates by City 2026', source: 'Texas Comptroller of Public Accounts', sampleOf: 'in Austin'
  }
};

function writePlaceState(c) {
  const s = E.STATES[c], n = s.name, P = s.places, F = PF[c], url = 'https://calcthis.co/sales-tax-calculator/' + s.slug + '/', f = F.faqs(c);
  const sp = placeLike(c, F.sampleLabel), a100 = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 0, place: sp });
  const cityRows = F.cityRows().map((x) => { const p = x[1], t = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 0, place: p }); return '<tr><td>' + x[0] + '</td><td>' + pct(p.sales) + '</td>' + (P.noFood ? '' : '<td>' + pct(p.food) + '</td>') + '<td>' + m(t.tax) + '</td></tr>'; }).join('');
  const cityTh = '<th>' + F.cityLead + '</th><th>' + (P.noFood ? 'Rate' : 'Most goods') + '</th>' + (P.noFood ? '' : '<th>Groceries</th>') + '<th>Tax on $100</th>';
  const catRows = s.cats.map((k) => '<tr><td>' + (k.long || k.label) + '</td><td>' + (k.taxable ? 'Taxable' : 'Exempt') + '</td><td>' + k.note + '</td></tr>').join('');
  const hero = `  <section class="hero">
    <div class="eyebrow">${n} · 2026 rates by ${F.unit}</div>
    <h1>${n} Sales Tax Calculator</h1>
    <p>${F.heroP(s, P, a100)}</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>${n} sales tax at a glance</h2>
        ${F.glance(s, P)}
        <h2>What is taxed and what is exempt</h2>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Item type</th><th>Sales tax</th><th>Details</th></tr></thead><tbody>${catRows}</tbody></table></div>
        <h2>Shipping and delivery</h2>
        <p>${s.shipNote} ${F.shipLine(c, s, sp)}</p>
        <h2>${F.cityHead}</h2>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr>${cityTh}</tr></thead><tbody>${cityRows}</tbody></table></div>
        <p>${F.cityNote(s, P)}</p>
        ${F.extra ? F.extra(s, P) : ''}
      </div>
      <div>
        <h2>Local taxes, special districts and fees</h2>
        <ul class="st-otherlist">${s.others.map((x) => '<li><b>' + x.t + '.</b> ' + x.d + '</li>').join('')}</ul>
        <h2>Use the ${n} calculator</h2>
        <p>The state is already set to <strong>${n}</strong>. ${F.use} <strong>Remove tax</strong> works out the price before tax from a total, and <strong>Find the rate</strong> compares a price before and after tax with ${n}’s combined rates. Under <strong>Go advanced</strong> you can use your own rate or work out the use tax on something bought online.</p>
        <p>This is an estimate based on the ${F.source}’s published rates — the register can differ by a cent, and the seller’s own system decides what is taxable.</p>
        <h2>Other states</h2>
        ${stateLinks(c)}
        <p>For any other state, the <a href="/sales-tax-calculator/">main sales tax calculator</a> uses your own combined rate.</p>
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
    title: F.title(s), desc: F.desc(s), ogTitle: F.ogTitle(s), url,
    app: Object.assign(jsonApp(n + ' Sales Tax Calculator', url, n + ' sales tax calculator by ' + F.unit + ': add tax, remove tax or find the rate, with the exact local rate, exempt items and delivery rule.'), { dateModified: new Date().toISOString().slice(0, 10), inLanguage: 'en-US', isAccessibleForFree: true, applicationSubCategory: 'Sales tax calculator', areaServed: { '@type': 'AdministrativeArea', name: n }, isPartOf: { '@type': 'WebSite', name: 'CalcThis', url: 'https://calcthis.co/' }, featureList: ['Add sales tax to a price', 'Remove sales tax from a total', 'Find the sales tax rate', 'Rates for ' + P.n.toLocaleString('en-US') + ' places from the official ' + F.source + ' table', 'Exempt and taxable item types', 'Shipping and delivery rule', 'Use tax on online purchases'] }),
    faq: jsonFaq(f), extraLd: [crumbs], hero, content, bodyAttr: ' data-state="' + c + '"', srcHtml: srcHtml(c)
  }));
}

/* ---------- New York City (a city page: one flat rate, per-item $110 clothing line) ---------- */
function writeCity(c) {
  const s = E.STATES[c], n = s.name, url = 'https://calcthis.co/sales-tax-calculator/' + s.slug + '/';
  const ad = (items, ship, extra) => E.add(Object.assign({ state: c, items, ship: ship || 0 }, extra || {}));
  const a100 = ad([{ amt: 100, cat: 'general' }]), a1000 = ad([{ amt: 1000, cat: 'general' }]);
  const jk109 = ad([{ amt: 109.99, cat: 'clothing' }]), jk110 = ad([{ amt: 110, cat: 'clothing' }]), five = ad([{ amt: 60, cat: 'clothing' }, { amt: 60, cat: 'clothing' }, { amt: 60, cat: 'clothing' }, { amt: 60, cat: 'clothing' }, { amt: 60, cat: 'clothing' }]);
  const shipT = ad([{ amt: 100, cat: 'general' }], 10), shipX = ad([{ amt: 100, cat: 'grocery' }], 10), mix = ad([{ amt: 100, cat: 'general' }, { amt: 50, cat: 'clothing' }], 10);
  const rev = E.reverse({ state: c, total: 108.88, cat: 'general' }), gap = E.reverse({ state: c, total: 115, cat: 'clothing' });
  const meal = ad([{ amt: 40, cat: 'prepared' }]), park = ad([{ amt: 50, cat: 'parking' }]), parkR = ad([{ amt: 50, cat: 'parkres' }]), cut = ad([{ amt: 60, cat: 'service' }]);
  const use = ad([{ amt: 3000, cat: 'general' }], 50, { paid: 0 }), use2 = ad([{ amt: 4000, cat: 'general' }], 0, { paid: 5.5 });
  const sp = (cat) => s.split;
  const f = [
    ['What is the sales tax rate in New York City?', `${pct(s.base)} in all five boroughs — Manhattan, Brooklyn, Queens, the Bronx and Staten Island. It is 4% New York State, 4.5% New York City and 0.375% for the Metropolitan Commuter Transportation District (MCTD). On a $100 purchase the tax is ${m(a100.tax)} and the total is ${m(a100.total)}; on $1,000 it is ${m(a1000.tax)}, for ${m(a1000.total)}.`],
    ['Is clothing taxed in NYC?', `Only when a single item costs $110 or more. Clothing and footwear under $110 per item or pair are exempt from the state, city and MCTD tax. The test is per item: five shirts at $60 each cost $300 with ${m(five.tax)} of tax, but one $110 jacket costs ${m(jk110.total)}, because the full ${pct(s.base)} (${m(jk110.tax)}) applies to the whole price. A $109.99 item has ${m(jk109.tax)} of tax. Jewelry, watches, costumes, rented formalwear, athletic equipment and protective gear are not exempt.`],
    ['Are groceries taxed in New York City?', 'No. Food, food products, dietary foods and health supplements sold for home use are exempt. Candy, soft drinks, alcohol, fruit drinks with less than 70% juice, sandwiches and heated food are taxable, and so are restaurant meals. Choose the item type in the calculator to see the difference.'],
    ['How much is the tax on a restaurant meal in NYC?', `Restaurant food and drink are taxed at the full ${pct(s.base)}. A $40 meal has ${m(meal.tax)} of tax and costs ${m(meal.total)} before any tip.`],
    ['Is shipping taxed in New York City?', `Shipping, handling and delivery charged by the seller on a taxable item are taxable: a $100 item with $10 shipping has ${m(shipT.tax)} of tax. Shipping on an exempt item is not taxed (${m(shipX.tax)} on $100 of groceries with $10 shipping). In a mixed shipment the charge is split by price: $100 of goods and $50 of clothing under $110 with $10 shipping has ${m(mix.tax)} of tax. If you arrange delivery yourself and pay the carrier directly, the carrier’s charge is not taxed.`],
    ['How do I take sales tax out of a total in NYC?', `Divide the total by 1.08875. A total of $108.88 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax” to do it for any amount. For clothing there is a gap: no clothing purchase can total between $110.00 and ${m(E.add({ state: c, items: [{ amt: 110, cat: 'clothing' }] }).total)}, because an item under $110 has no tax and an item at $110 or more costs at least ${m(jk110.total)}.`],
    ['What is the sales tax on parking in NYC?', `Parking, garaging or storing a vehicle in Manhattan pays 10.375% plus an 8% surtax, 18.375%: ${m(park.tax)} of tax on a $50 garage fee. A Manhattan resident with a Manhattan-registered vehicle who qualifies pays 10.375%: ${m(parkR.tax)} on $50.`],
    ['Are haircuts, massages and gym memberships taxed in NYC?', `The city taxes these services at 4.5% on the service itself, with no New York State tax: a $60 haircut has ${m(cut.tax)} of tax. Products you buy there, such as shampoo, pay the full ${pct(s.base)}.`],
    ['Do I owe New York tax on things I buy online?', `Yes, when the seller does not charge New York tax you owe use tax at the rate where you use the item. A $3,000 item with $50 shipping and no tax charged means ${m(use.owed)} of use tax. A credit may be available for tax you paid to another state: with a $4,000 purchase and 5.5% paid elsewhere the calculator shows ${m(use2.owed)} still owed. Enter the rate the seller charged under Go advanced.`]
  ];
  const catRows = s.cats.map((k) => '<tr><td>' + (k.long || k.label) + '</td><td>' + (k.under != null ? 'Exempt under $110' : (typeof k.rate === 'number' ? pct(k.rate) : (k.taxable ? 'Taxable' : 'Exempt'))) + '</td><td>' + k.note + '</td></tr>').join('');
  const amtRows = [10, 25, 50, 100, 250, 500, 1000, 5000].map((a) => { const t = ad([{ amt: a, cat: 'general' }]); return '<tr><td>' + m0(a) + '</td><td>' + m(t.tax) + '</td><td>' + m(t.total) + '</td></tr>'; }).join('');
  const clRows = [50, 99.99, 109.99, 110, 150, 250].map((a) => { const t = ad([{ amt: a, cat: 'clothing' }]); return '<tr><td>' + m(a) + '</td><td>' + (t.tax > 0 ? m(t.tax) : 'No tax') + '</td><td>' + m(t.total) + '</td></tr>'; }).join('');
  const hero = `  <section class="hero">
    <div class="eyebrow">New York City · 2026 rates</div>
    <h1>New York City Sales Tax Calculator</h1>
    <p>New York City charges <strong>${pct(s.base)}</strong> sales tax in all five boroughs, and clothing under <strong>$110</strong> an item is exempt. A <strong>$100</strong> purchase costs <strong>${m(a100.total)}</strong> with <strong>${m(a100.tax)}</strong> of tax.</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>NYC sales tax at a glance</h2>
        <p>The combined rate is <strong>${pct(s.base)}</strong>: 4% New York State, 4.5% New York City and 0.375% for the Metropolitan Commuter Transportation District (MCTD). It is the same in Manhattan, Brooklyn, Queens, the Bronx and Staten Island. On <strong>$100</strong> that is <strong>${m(a100.tax)}</strong> of tax, for a total of <strong>${m(a100.total)}</strong>.</p>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Part of the rate</th><th>Rate</th><th>Tax on $100</th></tr></thead><tbody><tr><td>New York State</td><td>4%</td><td>$4.00</td></tr><tr><td>New York City</td><td>4.5%</td><td>$4.50</td></tr><tr><td>MCTD surcharge</td><td>0.375%</td><td>$0.38</td></tr><tr><td><strong>Total</strong></td><td><strong>${pct(s.base)}</strong></td><td><strong>${m(a100.tax)}</strong></td></tr></tbody></table></div>
        <h2>The $110 clothing rule</h2>
        <p>Clothing and footwear that cost less than $110 <strong>per item or pair</strong> are exempt from all three parts of the tax. The test is the price of each item, not the total of the purchase. Cross the line and the full tax applies to the whole price of that item.</p>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Item price</th><th>Sales tax</th><th>Total</th></tr></thead><tbody>${clRows}</tbody></table></div>
        <h2>What is taxed and what is exempt</h2>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Item type</th><th>Sales tax</th><th>Details</th></tr></thead><tbody>${catRows}</tbody></table></div>
        <h2>Shipping and delivery</h2>
        <p>${s.shipNote} On a $100 taxable item with $10 shipping the tax is ${m(shipT.tax)}.</p>
        <h2>Sales tax on common amounts</h2>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Price</th><th>Sales tax</th><th>Total</th></tr></thead><tbody>${amtRows}</tbody></table></div>
        <p>General goods at ${pct(s.base)}, rounded to the cent.</p>
      </div>
      <div>
        <h2>Other taxes and special rates</h2>
        <ul class="st-otherlist">${s.others.map((x) => '<li><b>' + x.t + '.</b> ' + x.d + '</li>').join('')}</ul>
        <h2>Use the NYC calculator</h2>
        <p>The city is already set to <strong>${n}</strong>. Add one item or several, choose what each one is and add shipping. Clothing is tested item by item against the $110 line. <strong>Remove tax</strong> works out the price before tax from a total, and <strong>Find the rate</strong> compares a price before and after tax with the ${pct(s.base)} rate. Under <strong>Go advanced</strong> you can use your own rate or work out the use tax on something bought online.</p>
        <p>This is an estimate based on the published New York State and New York City rules — the register can differ by a cent, and the seller’s own system decides what is taxable.</p>
        <h2>Other places</h2>
        ${stateLinks(c)}
        <p>For any other state, the <a href="/sales-tax-calculator/">main sales tax calculator</a> uses the state rate or your own combined rate.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions about NYC sales tax</h2>
${f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' },
    { '@type': 'ListItem', position: 2, name: 'Sales Tax Calculator', item: 'https://calcthis.co/sales-tax-calculator/' },
    { '@type': 'ListItem', position: 3, name: n, item: url }] };
  write('sales-tax-calculator/' + s.slug + '/index.html', pageHtml({
    title: 'NYC Sales Tax Calculator 2026 — 8.875% & $110 Clothing Rule',
    desc: 'NYC sales tax calculator: 8.875% in all five boroughs. $100 is ' + m(a100.total) + ' with tax. Clothing under $110 an item is exempt, groceries exempt, shipping rule.',
    ogTitle: 'NYC Sales Tax Calculator 2026 — 8.875% & $110 Clothing Rule', url,
    app: Object.assign(jsonApp('New York City Sales Tax Calculator', url, 'NYC sales tax calculator: add tax, remove tax or find the rate at 8.875%, with the $110 clothing rule tested item by item, exempt items and the delivery rule.'), { dateModified: new Date().toISOString().slice(0, 10), inLanguage: 'en-US', isAccessibleForFree: true, applicationSubCategory: 'Sales tax calculator', areaServed: { '@type': 'City', name: 'New York City' }, isPartOf: { '@type': 'WebSite', name: 'CalcThis', url: 'https://calcthis.co/' }, featureList: ['Add sales tax to a price', 'Remove sales tax from a total', 'Find the sales tax rate', 'Clothing under $110 tested per item', 'Where the 8.875% goes: state, city, MCTD', 'Parking and service rates', 'Shipping and delivery rule', 'Use tax on online purchases'] }),
    faq: jsonFaq(f), extraLd: [crumbs], hero, content, bodyAttr: ' data-state="' + c + '"', srcHtml: srcHtml(c)
  }));
}

/* ---------- North Carolina + Virginia (county / locality tables; groceries have their own reduced rate) ---------- */
const NC_COUNTIES = ['Mecklenburg County (Charlotte)', 'Wake County (Raleigh)', 'Durham County (Durham)', 'Orange County', 'Guilford County (Greensboro)', 'Forsyth County (Winston-Salem)', 'Cumberland County (Fayetteville)', 'Buncombe County (Asheville)', 'New Hanover County (Wilmington)', 'Pitt County (Greenville)', 'Gaston County (Gastonia)', 'Onslow County (Jacksonville)'];
function ncFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const mk = placeLike(c, 'Mecklenburg County'), wk = placeLike(c, 'Wake County'), gu = placeLike(c, 'Guilford County'), du = placeLike(c, 'Durham County'), fo = placeLike(c, 'Forsyth County');
  const shipT = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: wk, shipTaxed: true }), shipN = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: wk, shipTaxed: false });
  const use = ar(c, wk, 'general', 3000, { paid: 0 }), use2 = ar(c, wk, 'general', 3000, { paid: 4 });
  const rev = E.reverse({ state: c, total: 107.25, cat: 'general', place: wk });
  return [
    [`What is the sales tax rate in ${n}?`, `${n}’s state rate is ${pct(s.base)} and every county adds its own local tax, so the combined rate in the Department of Revenue’s table effective July 1, 2026 runs from ${pct(P.lo)} to ${pct(P.hi)}. Wake County (Raleigh) is ${pct(wk.sales)}, Durham ${pct(du.sales)}, Guilford (Greensboro) ${pct(gu.sales)}, Forsyth (Winston-Salem) ${pct(fo.sales)} and Mecklenburg (Charlotte) ${pct(mk.sales)}. Search your city or county in the calculator above.`],
    [`Why did the sales tax in Charlotte go up to ${pct(mk.sales)}?`, `Mecklenburg County levied an additional 1% local sales and use tax effective July 1, 2026, taking the combined rate from 7.25% to ${pct(mk.sales)}. A $100 purchase now costs ${m(ar(c, mk).total)} instead of $107.25. The additional 1% does not apply to qualifying food, which stays at 2%.`],
    [`Is food taxed in ${n}?`, `Qualifying food pays only a 2% local rate — the state, transit and other local rates do not apply — so a $100 grocery bill has ${m(ar(c, wk, 'grocery').tax)} of tax in every county, Charlotte included. Candy, soft drinks, prepared food, dietary supplements, vending-machine food and alcohol are not qualifying food and pay the full county rate: ${m(ar(c, wk, 'prepared').tax)} on $100 of restaurant food in Wake County. Choose the item type in the calculator to see the difference.`],
    [`Is clothing taxed in ${n}?`, `The Department of Revenue pages we used list no clothing exemption, so clothing is calculated at your county’s full rate — ${m(ar(c, wk).tax)} on $100 in Wake County.`],
    [`Are prescription drugs taxed in ${n}?`, `No. Drugs that federal law lets only a prescription dispense, over-the-counter drugs sold on a prescription, and insulin are exempt. Other over-the-counter medicine is taxable. Choose “Prescription” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `Under the Department’s taxability matrix a transportation or shipping charge listed separately on the invoice is not taxed, while handling, crating and packing are taxable, and a charge that is combined or not listed separately is taxed with the sale. On a $100 item in Wake County with $10 shipping the tax is ${m(shipN.tax)} when the shipping is listed separately and ${m(shipT.tax)} when it is billed with handling. Tick the shipping box in the calculator for the second case.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your county’s rate. In Wake County (${pct(wk.sales)}) a total of $107.25 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax”, pick your county and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax at the rate of the county where you use the item. A $3,000 item used in Wake County with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the tax the seller charged under Go advanced.`],
    [`Do restaurants charge more than the ${n} sales tax rate?`, `Sometimes. The Department’s rates do not include prepared-meal taxes that some local governments impose and administer themselves, so check the receipt for a separate prepared-meal tax.`]
  ];
}
const VA_LOCALITIES = ['Richmond City', 'Virginia Beach City', 'Norfolk City', 'Arlington County', 'Alexandria City', 'Fairfax County', 'Loudoun County', 'Prince William County', 'Chesapeake City', 'Henrico County', 'Roanoke City', 'Williamsburg City', 'Charlottesville City', 'Lynchburg City'];
function vaFaqs(c) {
  const s = E.STATES[c], n = s.name, P = s.places;
  const ri = placeLike(c, 'Richmond City'), ro = placeLike(c, 'Roanoke City'), wb = placeLike(c, 'Williamsburg City');
  const shipT = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: ri, shipTaxed: true }), shipN = E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: ri, shipTaxed: false });
  const use = ar(c, ri, 'general', 3000, { paid: 0 }), use2 = ar(c, ri, 'general', 3000, { paid: 4 });
  const rev = E.reverse({ state: c, total: 106, cat: 'general', place: ri });
  return [
    [`What is the sales tax rate in ${n}?`, `Most of ${n} pays ${pct(P.lo)}. Northern Virginia, Hampton Roads and Central Virginia pay 6% (Richmond, Virginia Beach, Norfolk, Arlington and Fairfax among them), eight localities pay 6.3% (Charlotte, Gloucester, Halifax, Henry, Northampton, Patrick and Pittsylvania counties and Danville) and James City County, York County and Williamsburg pay 7%. Roanoke is ${pct(ro.sales)}. Search your locality in the calculator above.`],
    [`Why is the ${n} rate 6% in some places and 5.3% in others?`, `Northern Virginia, Hampton Roads and Central Virginia add a 0.7% regional tax, taking the combined rate from ${pct(P.lo)} to 6%. A $100 purchase costs ${m(ar(c, ro).total)} in Roanoke and ${m(ar(c, ri).total)} in Richmond. The Historic Triangle (James City County, York County and Williamsburg) adds a further 1%: ${m(ar(c, wb).total)} in Williamsburg.`],
    [`Is food taxed in ${n}?`, `Food for home consumption pays a reduced 1% rate everywhere in ${n}, with no regional or additional local tax, so a $100 grocery bill has ${m(ar(c, ri, 'grocery').tax)} of tax in any locality. Alcohol, tobacco and prepared hot food for immediate consumption do not qualify and pay the full rate: ${m(ar(c, ri, 'prepared').tax)} on $100 of restaurant food in Richmond. Feminine hygiene and nondurable incontinence products get the same 1% rate.`],
    [`Is clothing taxed in ${n}?`, `The Virginia Tax pages we used list no clothing exemption, so clothing is calculated at your locality’s full rate — ${m(ar(c, ri).tax)} on $100 in Richmond and ${m(ar(c, ro).tax)} in Roanoke.`],
    [`Are prescription and over-the-counter drugs taxed in ${n}?`, `No. Prescription drugs and nonprescription drugs and medicines are exempt, but dietary supplements and vitamins sold as such are taxable. Choose “Medicine” as the item type to see the tax removed.`],
    [`Is shipping taxed in ${n}?`, `A transportation or delivery charge listed separately on the invoice is not taxed. A combined “shipping and handling” charge is taxable even when it is on its own line, and so is a charge not listed separately. On a $100 item in Richmond with $10 shipping the tax is ${m(shipN.tax)} when the shipping is listed separately and ${m(shipT.tax)} when it is billed with handling. Tick the shipping box for the second case.`],
    [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1 plus your locality’s rate. In Richmond (${pct(ri.sales)}) a total of $106.00 is ${m(rev.pre)} before tax, with ${m(rev.tax)} of tax inside it. Switch the calculator to “Remove tax”, pick your locality and enter the total.`],
    [`Do I owe ${n} tax on things I buy online?`, `Yes, when the seller does not charge ${n} tax you owe use tax at the rate of the locality where you use the item. A $3,000 item used in Richmond with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the tax the seller charged under Go advanced.`],
    [`What sales tax do I pay on a car in ${n}?`, `Motor vehicles, aircraft and watercraft are taxed at different rates (through the DMV for vehicles), so the calculator does not compute vehicle tax.`]
  ];
}
PF.NC = {
  unit: 'county', sampleLabel: 'Wake County', sampleName: 'Wake County', faqs: ncFaqs,
  cityRows: () => NC_COUNTIES.map((x) => { const p = placeLike('NC', x); return [p.label, p]; }), cityHead: 'North Carolina sales tax by county', cityLead: 'County',
  heroP: (s, P, a) => `${s.name} charges a ${pct(s.base)} state sales tax and <strong>every county adds its own</strong> — combined rates run from ${pct(P.lo)} to ${pct(P.baseHi)}, and groceries pay only <strong>2%</strong>. Search your county or city to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Wake County (Raleigh) with <strong>${m(a.tax)}</strong> of tax.`,
  glance: (s, P) => `<p>${s.name}’s state rate is <strong>${pct(s.base)}</strong>. Every county adds a local tax and four add a 0.5% transit tax, and the rate that applies is the rate of the county where the sale is made. In the Department of Revenue’s table effective July 1, 2026 the combined rate runs from <strong>${pct(P.lo)}</strong> to <strong>${pct(P.baseHi)}</strong> (Mecklenburg County, which added 1% on July 1, 2026).</p>
        <p>Qualifying food is taxed differently: a flat <strong>2%</strong> local rate and no state, transit or other local tax, so groceries cost the same in every county. Wake County (Raleigh) is ${pct(placeLike('NC', 'Wake County').sales)}, Durham ${pct(placeLike('NC', 'Durham County').sales)}, Guilford (Greensboro) ${pct(placeLike('NC', 'Guilford County').sales)} and Mecklenburg (Charlotte) ${pct(placeLike('NC', 'Mecklenburg County').sales)}.</p>`,
  cityNote: (s, P) => `County rates from the North Carolina Department of Revenue table effective July 1, 2026. The city names in brackets are only there to help you find your county — the rate is always the county’s. Search the calculator for any of the ${P.n} counties.`,
  shipLine: (c, s, p) => `On a $100 item in Wake County with $10 shipping the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: false }).tax)} when the shipping is listed separately and ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: true }).tax)} when it is billed with handling.`,
  use: 'Search your county or city, pick where the sale is made, add one item or several, choose what each one is and add shipping.',
  title: (s) => s.name + ' Sales Tax Calculator 2026 — By County',
  desc: (s) => s.name + ' sales tax calculator by county: official July 2026 rates, 4.75% state plus local, groceries at 2%, Mecklenburg 8.25%, prescriptions exempt.',
  ogTitle: (s) => s.name + ' Sales Tax Calculator 2026 — by County', source: 'North Carolina Department of Revenue', sampleOf: 'in Wake County'
};
PF.VA = {
  unit: 'locality', sampleLabel: 'Richmond City', sampleName: 'Richmond', faqs: vaFaqs,
  cityRows: () => VA_LOCALITIES.map((x) => { const p = placeLike('VA', x); return [p.label, p]; }), cityHead: 'Virginia sales tax by city and county', cityLead: 'Locality',
  heroP: (s, P, a) => `${s.name} charges <strong>${pct(P.lo)} in most places, 6% in Northern Virginia, Hampton Roads and Central Virginia and up to ${pct(P.baseHi)}</strong>, and groceries pay only <strong>1%</strong>. Search your city or county to see yours: on <strong>$100</strong> it is <strong>${m(a.total)}</strong> in Richmond with <strong>${m(a.tax)}</strong> of tax.`,
  glance: (s, P) => `<p>${s.name}’s rate depends on the locality: <strong>${pct(P.lo)}</strong> in most places, <strong>6%</strong> in Northern Virginia, Hampton Roads and Central Virginia (a 0.7% regional tax), <strong>6.3%</strong> in eight localities that added 1% and <strong>${pct(P.baseHi)}</strong> in James City County, York County and Williamsburg. The rate that applies is the one for the locality where the sale is made.</p>
        <p>Food for home consumption and essential personal hygiene products pay a reduced <strong>1%</strong> rate everywhere. Richmond is ${pct(placeLike('VA', 'Richmond City').sales)}, Virginia Beach ${pct(placeLike('VA', 'Virginia Beach City').sales)}, Fairfax County ${pct(placeLike('VA', 'Fairfax County').sales)} and Roanoke ${pct(placeLike('VA', 'Roanoke City').sales)}, so the calculator looks up your exact locality instead of guessing.</p>`,
  cityNote: (s, P) => `Rates from the Virginia Tax rate sheet for January 2026 to the present, which lists all ${P.n} counties and independent cities. Towns are part of their county, so pick the county (the common town names are shown in brackets).`,
  shipLine: (c, s, p) => `On a $100 item in Richmond with $10 shipping the tax is ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: false }).tax)} when the shipping is listed separately and ${m(E.add({ state: c, items: [{ amt: 100, cat: 'general' }], ship: 10, place: p, shipTaxed: true }).tax)} when it is billed as shipping and handling.`,
  use: 'Search your city or county, pick where the sale is made, add one item or several, choose what each one is and add shipping.',
  title: (s) => s.name + ' Sales Tax Calculator 2026 — By Locality, 1% Food',
  desc: (s) => s.name + ' sales tax calculator by city and county: 5.3% base, 6% regional, 7% Historic Triangle, official 2026 rates, groceries at 1%, medicine exempt.',
  ogTitle: (s) => s.name + ' Sales Tax Calculator 2026 — by Locality', source: 'Virginia Tax', sampleOf: 'in Richmond'
};

/* ---------- one-rate pages: Michigan (state), Los Angeles, Chicago, Las Vegas (cities) ---------- */
const fa = (c, items, ship, extra) => E.add(Object.assign({ state: c, items: items, ship: ship || 0 }, extra || {}));
const one = (c, cat, amt, ship, extra) => fa(c, [{ amt: amt || 100, cat: cat || 'general' }], ship, extra);
const FLAT = {
  MI: {
    word: 'state', source: 'Michigan Department of Treasury', eyebrow: 'Michigan · 2026 rates',
    title: (s) => 'Michigan Sales Tax Calculator 2026 — 6% Rate, Exempt Items',
    desc: (s, a) => 'Michigan sales tax calculator: 6% statewide, no local tax. $100 is ' + m(a.total) + ' with tax. Groceries and prescriptions exempt, prepared food taxed, delivery rule.',
    hero: (s, a) => `Michigan charges <strong>6%</strong> sales tax everywhere — cities and counties may not add their own — so <strong>$100</strong> costs <strong>${m(a.total)}</strong> with <strong>${m(a.tax)}</strong> of tax. Groceries are exempt, restaurant food is not.`,
    glance: (s, a) => `<p>Michigan’s sales tax is <strong>6%</strong> and the Department of Treasury says Michigan does not allow city or local units to impose a sales tax, so the rate is the same in Detroit, Grand Rapids, Lansing and Ann Arbor. On <strong>$100</strong> that is <strong>${m(a.tax)}</strong> of tax, for a total of <strong>${m(a.total)}</strong>.</p><p>What changes the bill is the type of item: food for home consumption and prescription drugs are exempt, prepared food is taxed, and delivery charges are not taxed when they are itemized separately on the invoice.</p>`,
    shipLine: (c) => `On a $100 item with $10 delivery the tax is ${m(one(c, 'general', 100, 10, { shipTaxed: false }).tax)} when the delivery is itemized separately on the bill and ${m(one(c, 'general', 100, 10, { shipTaxed: true }).tax)} when it is not.`,
    crumbName: 'Michigan', areaType: 'State',
    faqs: (c) => {
      const s = E.STATES[c], n = s.name, a100 = one(c), a1000 = one(c, 'general', 1000), r = E.reverse({ state: c, total: 106, cat: 'general' });
      const meal = one(c, 'prepared', 40), shipS = one(c, 'general', 3000, 150, { shipTaxed: false }), shipC = one(c, 'general', 3000, 150, { shipTaxed: true });
      const use = one(c, 'general', 3000, 50, { paid: 0 }), use2 = one(c, 'general', 4000, 0, { paid: 5.5 });
      return [
        [`What is the sales tax rate in ${n}?`, `${n}’s sales tax rate is ${pct(s.base)} statewide. The Department of Treasury says Michigan does not allow city or local units to impose a sales tax, so there is no local rate. On a $100 purchase the tax is ${m(a100.tax)} and the total is ${m(a100.total)}; on $1,000 it is ${m(a1000.tax)}, for ${m(a1000.total)}.`],
        [`Are groceries taxed in ${n}?`, `No. The ${n} Constitution bars a tax on food for human consumption except prepared food, so groceries are exempt — a $100 grocery bill has $0.00 of tax. Prepared food is taxable: food sold hot or heated by the seller, two or more ingredients mixed or combined by the seller for sale as one item, and food sold with eating utensils the seller provides. A $40 restaurant meal has ${m(meal.tax)} of tax and costs ${m(meal.total)} before any tip.`],
        [`Is clothing taxed in ${n}?`, `The Treasury pages we used list no clothing exemption, so clothing is calculated as general merchandise at 6% — ${m(one(c, 'general', 100).tax)} on $100.`],
        [`Are prescription drugs and period products taxed in ${n}?`, `Drugs that can only be dispensed on a prescription, and over-the-counter drugs sold on a prescription, are exempt; other over-the-counter medicine is taxable. Feminine hygiene products — tampons, panty liners, menstrual cups and sanitary napkins — have been exempt since February 3, 2022. Choose the item type in the calculator to see the tax removed.`],
        [`Is shipping or delivery taxed in ${n}?`, `Since April 26, 2023 most delivery and installation charges are not taxed when the seller itemizes them separately on the invoice and keeps records that show how the tax was worked out. Treasury’s own example is a $3,000 refrigerator with a $150 delivery fee: tax is only ${m(shipS.tax)} (6% of $3,000). If the delivery is not itemized separately it is part of the price and taxed — ${m(shipC.tax)} on the same sale. Tick the box in the calculator for that case.`],
        [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1.06. A total of $106.00 is ${m(r.pre)} before tax, with ${m(r.tax)} of tax inside it. Switch the calculator to “Remove tax” to do it for any amount.`],
        [`Do I owe ${n} tax on things I buy online?`, `Yes. Use tax of 6% is due on taxable items brought into ${n} or bought from out-of-state sellers that did not collect tax, with credit for tax paid to another state. A $3,000 item with $50 shipping and no tax charged means ${m(use.owed)} of use tax; a $4,000 item bought with 5.5% tax paid elsewhere leaves ${m(use2.owed)}. Enter the rate the seller charged under Go advanced.`],
        [`Is the sales tax on electricity and heating fuel different in ${n}?`, `Yes. Electricity, natural or artificial gas and home heating fuels for residential use are taxed at 4%, not 6%. The calculator uses the 6% rate for everything else.`]
      ];
    }
  },
  LAX: {
    word: 'city', source: 'California Department of Tax and Fee Administration', eyebrow: 'Los Angeles · 2026 rates',
    title: (s) => 'Los Angeles Sales Tax Calculator 2026 — 10.25% Rate',
    desc: (s, a) => 'Los Angeles sales tax calculator: 10.25% from October 1, 2026. $100 is ' + m(a.total) + ' with tax. Groceries and prescriptions exempt, clothing taxed, shipping rule.',
    hero: (s, a) => `The sales tax rate in the City of Los Angeles is <strong>10.25%</strong> since October 1, 2026, so <strong>$100</strong> costs <strong>${m(a.total)}</strong> with <strong>${m(a.tax)}</strong> of tax. Groceries are exempt; clothing is not.`,
    glance: (s, a) => `<p>The California Department of Tax and Fee Administration lists the City of Los Angeles and Los Angeles County at <strong>10.25%</strong> in its table effective October 1, 2026: the 7.25% statewide base plus 3% of voter-approved district taxes. On <strong>$100</strong> that is <strong>${m(a.tax)}</strong> of tax, for a total of <strong>${m(a.total)}</strong>.</p><p>Rates follow the address of the sale, so a store in a neighbouring city can charge more: Santa Monica and Culver City are 11.25%, Long Beach, Pasadena, Burbank and Glendale 11%, Inglewood 10.75% and Beverly Hills 10.25%. The <a href="/sales-tax-calculator/california/">California sales tax calculator</a> lists every city.</p>`,
    shipLine: (c) => `On a $100 item with $10 shipping listed separately the tax is ${m(one(c, 'general', 100, 10, { shipTaxed: false }).tax)}; billed as one shipping-and-handling charge it is ${m(one(c, 'general', 100, 10, { shipTaxed: true }).tax)}.`,
    extra: (s) => { const rows = [['Los Angeles', 'Los Angeles'], ['Santa Monica', 'Santa Monica'], ['Culver City', 'Culver City'], ['Long Beach', 'Long Beach'], ['Pasadena', 'Pasadena'], ['Burbank', 'Burbank'], ['Glendale', 'Glendale'], ['Inglewood', 'Inglewood'], ['Beverly Hills', 'Beverly Hills']].map((x) => { const p = placeBy('CA', x[1]); return '<tr><td>' + x[0] + '</td><td>' + pct(p.sales) + '</td><td>' + m(p.sales) + '</td></tr>'; }).join(''); return '<h2>Sales tax in Los Angeles and nearby cities</h2><div class="pc-tblwrap"><table class="dtable"><thead><tr><th>City</th><th>Rate</th><th>Tax on $100</th></tr></thead><tbody>' + rows + '</tbody></table></div><p>Rates from the CDTFA table effective October 1, 2026. Your exact rate depends on the address where the sale is made.</p>'; },
    crumbName: 'Los Angeles', areaType: 'City',
    faqs: (c) => {
      const s = E.STATES[c], n = s.name, a100 = one(c), a1000 = one(c, 'general', 1000), r = E.reverse({ state: c, total: 110.25, cat: 'general' });
      const meal = one(c, 'prepared', 40), soda = one(c, 'soda', 100), shipS = one(c, 'general', 100, 10, { shipTaxed: false }), shipC = one(c, 'general', 100, 10, { shipTaxed: true });
      const use = one(c, 'general', 3000, 0, { paid: 0 }), use2 = one(c, 'general', 3000, 0, { paid: 4 }), car = one(c, 'general', 30000);
      return [
        [`What is the sales tax rate in ${n}?`, `${pct(s.base)} in the City of Los Angeles since October 1, 2026, according to the California Department of Tax and Fee Administration (CDTFA). It is the 7.25% statewide base plus 3% of district taxes. On a $100 purchase the tax is ${m(a100.tax)} and the total is ${m(a100.total)}; on $1,000 it is ${m(a1000.tax)}, for ${m(a1000.total)}.`],
        [`Is the Los Angeles sales tax 9.75% or 10.25%?`, `The CDTFA table effective October 1, 2026 lists the City of Los Angeles and Los Angeles County at 10.25%. Some websites still show the earlier 9.75%, so check the date of the rate they quote.`],
        [`Why is the sales tax different in Santa Monica or Long Beach?`, `Each city can have its own district taxes on top of the 7.25% base. In the same CDTFA table Santa Monica and Culver City are 11.25% and Long Beach, Pasadena, Burbank and Glendale are 11%, so $100 costs $111.25 in Santa Monica and ${m(a100.total)} in the City of Los Angeles. The rate follows the address of the sale.`],
        [`Are groceries taxed in ${n}?`, `Groceries are exempt — a $100 grocery bill has $0.00 of tax, and candy, juice and noncarbonated bottled water count as groceries. Hot prepared food and restaurant meals are taxable whether eaten there or taken away: a $40 meal has ${m(meal.tax)} of tax. Carbonated drinks and alcohol bought in a store are taxable too (${m(soda.tax)} on $100).`],
        [`Is clothing taxed in ${n}?`, `Yes. California has no clothing exemption, so clothing and shoes are taxed at ${pct(s.base)} — ${m(a100.tax)} on $100.`],
        [`Is shipping taxed in ${n}?`, `Not when the charge is listed separately on the bill and covers the actual cost of carrier, mail or the seller’s own delivery after the sale (CDTFA Regulation 1628). On a $100 item with $10 shipping listed separately the tax is ${m(shipS.tax)}; billed as one shipping-and-handling charge it is ${m(shipC.tax)}, because only the actual shipping part can be left out. Tick the box in the calculator for the combined case.`],
        [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1.1025. A total of $110.25 is ${m(r.pre)} before tax, with ${m(r.tax)} of tax inside it. Switch the calculator to “Remove tax” to do it for any amount.`],
        [`Do I owe tax on things I buy online?`, `Yes, when the seller does not charge California tax you owe use tax at the rate where you use the item. A $3,000 item used in Los Angeles with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the rate the seller charged under Go advanced.`],
        [`What sales tax do I pay on a car in ${n}?`, `Vehicles are taxed at the rate of the place where they will be registered, not where they are bought. For a $30,000 car registered in the City of Los Angeles the tax at ${pct(s.base)} is ${m(car.tax)}. Registration fees are separate. The <a href="/car-sales-tax-calculator/">car sales tax calculator</a> applies California’s trade-in and rebate rules.`]
      ];
    }
  },
  CHI: {
    word: 'city', source: 'Illinois Department of Revenue', eyebrow: 'Chicago · 2026 rates',
    title: (s) => 'Chicago Sales Tax Calculator 2026 — 10.5% Rate',
    desc: (s, a) => 'Chicago sales tax calculator: 10.5% since August 1, 2026. $100 is ' + m(a.total) + ' with tax. Groceries 1.5%, medicine 2.5%, official Illinois rates.',
    hero: (s, a) => `The sales tax rate in Chicago is <strong>10.5%</strong> since August 1, 2026, so <strong>$100</strong> costs <strong>${m(a.total)}</strong> with <strong>${m(a.tax)}</strong> of tax. Groceries pay <strong>1.5%</strong> and medicine <strong>2.5%</strong>.`,
    glance: (s, a) => `<p>The Illinois Department of Revenue’s rate file lists Chicago at <strong>10.5%</strong> on general merchandise from August 1, 2026 (it was 10.25% until July 31, 2026). On <strong>$100</strong> that is <strong>${m(a.tax)}</strong> of tax, for a total of <strong>${m(a.total)}</strong>.</p><p>Chicago does not tax everything at the full rate. Groceries pay <strong>${pct(E.cat(s, 'grocery').rate)}</strong> and drugs and medical items <strong>${pct(E.cat(s, 'drugs').rate)}</strong>, while candy, soft drinks, alcohol and restaurant food pay the full rate. Many websites still show 10.25%.</p>`,
    shipLine: (c) => `On a $100 item with $10 shipping listed separately the tax is ${m(one(c, 'general', 100, 10, { shipTaxed: false }).tax)}; when the shipping is not listed separately it is ${m(one(c, 'general', 100, 10, { shipTaxed: true }).tax)}.`,
    crumbName: 'Chicago', areaType: 'City',
    faqs: (c) => {
      const s = E.STATES[c], n = s.name, a100 = one(c), a1000 = one(c, 'general', 1000), r = E.reverse({ state: c, total: 110.5, cat: 'general' });
      const gro = one(c, 'grocery', 100), drug = one(c, 'drugs', 100), candy = one(c, 'candy', 100), meal = one(c, 'prepared', 40);
      const shipS = one(c, 'general', 100, 10, { shipTaxed: false }), shipC = one(c, 'general', 100, 10, { shipTaxed: true });
      const use = one(c, 'general', 3000, 0, { paid: 0 }), use2 = one(c, 'general', 3000, 0, { paid: 4 });
      return [
        [`What is the sales tax rate in ${n}?`, `${pct(s.base)} on most goods since August 1, 2026, according to the Illinois Department of Revenue’s rate file; it was 10.25% until July 31, 2026. On a $100 purchase the tax is ${m(a100.tax)} and the total is ${m(a100.total)}; on $1,000 it is ${m(a1000.tax)}, for ${m(a1000.total)}.`],
        [`Is the Chicago sales tax 10.25% or 10.5%?`, `It is 10.5% for sales from August 1, 2026. The Illinois Department of Revenue file shows 10.25% as the rate that ended on July 31, 2026, and many websites have not updated yet. A store in a special taxing district can charge another rate; the department’s MyTax Illinois Tax Rate Finder gives the exact rate for one address.`],
        [`Are groceries taxed in ${n}?`, `Yes, at a lower rate. Illinois ended its 1% state tax on groceries on January 1, 2026, but Chicago keeps a local grocery tax: the department’s grocery file lists ${pct(E.cat(s, 'grocery').rate)} from August 1, 2026 (1.25% before). A $100 grocery bill has ${m(gro.tax)} of tax. Candy, soft drinks, alcohol and food prepared for immediate consumption are not groceries and pay the full ${pct(s.base)}: ${m(candy.tax)} on $100 of candy and soda, ${m(meal.tax)} on a $40 restaurant meal.`],
        [`What is the sales tax on medicine in ${n}?`, `Illinois taxes drugs and medical items at a lower “Drug & Medical” rate than general merchandise: ${pct(E.cat(s, 'drugs').rate)} in Chicago, or ${m(drug.tax)} on $100.`],
        [`Is clothing taxed in ${n}?`, `Yes. Illinois has no clothing exemption, so clothing is taxed at the full ${pct(s.base)} — ${m(a100.tax)} on $100.`],
        [`Is shipping taxed in ${n}?`, `A delivery charge is part of the price when it is inseparable from the sale, for example when it is not listed separately on the bill; a delivery charge listed separately for a delivery the buyer chose is generally not taxed. On a $100 item with $10 shipping listed separately the tax is ${m(shipS.tax)}; when the shipping is not listed separately it is ${m(shipC.tax)}. Tick the box in the calculator for the second case and ask the store if you are unsure.`],
        [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1.105. A total of $110.50 is ${m(r.pre)} before tax, with ${m(r.tax)} of tax inside it. Switch the calculator to “Remove tax” to do it for any amount.`],
        [`Do I owe tax on things I buy online?`, `Yes, when the seller does not charge Illinois tax you owe use tax at the rate where you use the item. A $3,000 item used in Chicago with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the rate the seller charged under Go advanced.`],
        [`Does Chicago charge any other taxes?`, `Chicago also charges its own restaurant and beverage taxes, which are not part of the sales tax rate used here. Check the City of Chicago Department of Finance for those.`]
      ];
    }
  },
  LVS: {
    word: 'city', source: 'Nevada Department of Taxation', eyebrow: 'Las Vegas · 2026 rates',
    title: (s) => 'Las Vegas Sales Tax Calculator 2026 — 8.375% Rate',
    desc: (s, a) => 'Las Vegas sales tax calculator: 8.375% across Clark County. $100 is ' + m(a.total) + ' with tax. Groceries exempt, clothing taxed, shipping and delivery rule.',
    hero: (s, a) => `The sales tax rate in Las Vegas is <strong>8.375%</strong>, the same across Clark County, so <strong>$100</strong> costs <strong>${m(a.total)}</strong> with <strong>${m(a.tax)}</strong> of tax. Unprepared groceries are exempt; clothing is not.`,
    glance: (s, a) => `<p>The Nevada Department of Taxation lists Clark County at <strong>8.375%</strong>: the 6.85% statewide minimum plus 1.525% of Clark County taxes. Las Vegas, Henderson, North Las Vegas and the rest of the county pay the same rate, and no city adds its own sales tax. On <strong>$100</strong> that is <strong>${m(a.tax)}</strong> of tax, for a total of <strong>${m(a.total)}</strong>.</p><p>The calculator also shows what is exempt (unprepared food, certain medicines, feminine hygiene products) and what is not (clothing, restaurant food, handling charges).</p>`,
    shipLine: (c) => `On a $100 item with $10 shipping listed separately the tax is ${m(one(c, 'general', 100, 10, { shipTaxed: false }).tax)}; billed as shipping and handling it is ${m(one(c, 'general', 100, 10, { shipTaxed: true }).tax)}.`,
    extra: (s) => { return '<h2>What the 8.375% is made of</h2><p>Nevada’s Components of Sales Tax table lists a 6.85% statewide minimum and, for Clark County, infrastructure (0.25%), flood control (0.25%), regional transportation (0.25%), the Southern Nevada Water Authority (0.25%), a regional transportation increase (0.3%), police support (0.1%) and police officers (0.125%): <strong>1.525%</strong> of county taxes. Together that is ' + pct(s.base) + '.</p>'; },
    crumbName: 'Las Vegas', areaType: 'City',
    faqs: (c) => {
      const s = E.STATES[c], n = s.name, a100 = one(c), a1000 = one(c, 'general', 1000), r = E.reverse({ state: c, total: 108.38, cat: 'general' });
      const meal = one(c, 'prepared', 40), shipS = one(c, 'general', 100, 10, { shipTaxed: false }), shipC = one(c, 'general', 100, 10, { shipTaxed: true });
      const use = one(c, 'general', 3000, 0, { paid: 0 }), use2 = one(c, 'general', 3000, 0, { paid: 4 });
      return [
        [`What is the sales tax rate in ${n}?`, `${pct(s.base)}. The Nevada Department of Taxation’s rate sheet for Clark County is 8.375%, made of the 6.85% statewide minimum plus 1.525% of Clark County taxes, and no city adds its own. On a $100 purchase the tax is ${m(a100.tax)} and the total is ${m(a100.total)}; on $1,000 it is ${m(a1000.tax)}, for ${m(a1000.total)}.`],
        [`Is the sales tax the same in Henderson and North Las Vegas?`, `Yes. The 8.375% rate applies across Clark County, so Las Vegas, Henderson, North Las Vegas and the rest of the county pay the same sales tax. Washoe County (Reno) has its own rate sheet at 8.265%.`],
        [`Are groceries taxed in ${n}?`, `Unprepared food for human consumption is exempt (NRS 372.284), so a $100 grocery bill has $0.00 of tax. Alcoholic beverages, pet food, tonics and vitamins, and prepared food intended for immediate consumption are taxable: a $40 restaurant meal has ${m(meal.tax)} of tax and costs ${m(meal.total)} before any tip.`],
        [`Is clothing taxed in ${n}?`, `Yes. Clothing is on the Department of Taxation’s list of taxable items and Nevada has no clothing exemption, so clothing is taxed at ${pct(s.base)} — ${m(a100.tax)} on $100.`],
        [`Is medicine taxed in ${n}?`, `Medicine is exempt only under the prescription, health care provider or hospital conditions in NRS 372.283, which also exempts prosthetic devices, ostomy supplies and feminine hygiene products. Other medicine is taxable.`],
        [`Is shipping taxed in ${n}?`, `A charge for transportation, shipping or postage that is listed separately on the invoice is not taxed. Handling, crating, packing and preparation charges are taxable even when listed separately, and so is a delivery charge that is not listed separately (Tax Bulletin SUT 15-0002). On a $100 item with $10 shipping listed separately the tax is ${m(shipS.tax)}; billed as shipping and handling it is ${m(shipC.tax)}. Tick the box in the calculator for the combined case.`],
        [`How do I take sales tax out of a total in ${n}?`, `Divide the total by 1.08375. A total of $108.38 is ${m(r.pre)} before tax, with ${m(r.tax)} of tax inside it. Switch the calculator to “Remove tax” to do it for any amount.`],
        [`Do I owe tax on things I buy online?`, `Yes, when the seller does not charge Nevada tax you owe use tax at the rate where you use the item. A $3,000 item used in Las Vegas with no tax charged means ${m(use.owed)} of use tax; if the seller charged 4% you still owe ${m(use2.owed)}. Enter the rate the seller charged under Go advanced.`],
        [`Do hotels, shows and casinos charge more than the sales tax?`, `Yes. Room taxes, live entertainment tax and casino taxes are separate from the sales tax and are not included in the 8.375% used here.`]
      ];
    }
  }
};
function writeFlat(c) {
  const s = E.STATES[c], n = s.name, F = FLAT[c], url = 'https://calcthis.co/sales-tax-calculator/' + s.slug + '/', f = F.faqs(c);
  const a100 = one(c), grp = F.word === 'city' ? 'city' : 'state';
  const catRows = s.cats.map((k) => { const t = one(c, k.id, 100); return '<tr><td>' + (k.long || k.label) + '</td><td>' + (k.taxable ? (typeof k.rate === 'number' ? pct(k.rate) : pct(s.base)) : 'Exempt') + '</td><td>' + (k.taxable ? m(t.tax) : '$0.00') + '</td><td>' + k.note + '</td></tr>'; }).join('');
  const amtRows = [10, 25, 50, 100, 250, 500, 1000, 5000].map((a) => { const t = one(c, 'general', a); return '<tr><td>' + m0(a) + '</td><td>' + m(t.tax) + '</td><td>' + m(t.total) + '</td></tr>'; }).join('');
  const hero = `  <section class="hero">
    <div class="eyebrow">${F.eyebrow}</div>
    <h1>${n} Sales Tax Calculator</h1>
    <p>${F.hero(s, a100)}</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>${n} sales tax at a glance</h2>
        ${F.glance(s, a100)}
        <h2>What is taxed and what is exempt</h2>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Item type</th><th>Rate</th><th>Tax on $100</th><th>Details</th></tr></thead><tbody>${catRows}</tbody></table></div>
        <h2>Shipping and delivery</h2>
        <p>${s.shipNote} ${F.shipLine(c)}</p>
        <h2>Sales tax on common amounts</h2>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Price</th><th>Sales tax</th><th>Total</th></tr></thead><tbody>${amtRows}</tbody></table></div>
        <p>General goods at ${pct(s.base)}, rounded to the cent.</p>
        ${F.extra ? F.extra(s) : ''}
      </div>
      <div>
        <h2>Other taxes and special rates</h2>
        <ul class="st-otherlist">${s.others.map((x) => '<li><b>' + x.t + '.</b> ' + x.d + '</li>').join('')}</ul>
        <h2>Use the ${n} calculator</h2>
        <p>The ${grp} is already set to <strong>${n}</strong>. Add one item or several, choose what each one is and add shipping. <strong>Remove tax</strong> works out the price before tax from a total, and <strong>Find the rate</strong> compares a price before and after tax with the ${pct(s.base)} rate. Under <strong>Go advanced</strong> you can use your own rate or work out the use tax on something bought online.</p>
        <p>This is an estimate based on the ${F.source}’s published rates and rules — the register can differ by a cent, and the seller’s own system decides what is taxable.</p>
        <h2>Other places</h2>
        ${stateLinks(c)}
        <p>For any other state, the <a href="/sales-tax-calculator/">main sales tax calculator</a> uses the state rate or your own combined rate.</p>
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
    title: F.title(s), desc: F.desc(s, a100), ogTitle: F.title(s), url,
    app: Object.assign(jsonApp(n + ' Sales Tax Calculator', url, n + ' sales tax calculator: add tax, remove tax or find the rate at ' + pct(s.base) + ', with exempt items, shipping and delivery rule.'), { dateModified: new Date().toISOString().slice(0, 10), inLanguage: 'en-US', isAccessibleForFree: true, applicationSubCategory: 'Sales tax calculator', areaServed: { '@type': F.areaType === 'City' ? 'City' : 'State', name: n }, isPartOf: { '@type': 'WebSite', name: 'CalcThis', url: 'https://calcthis.co/' }, featureList: ['Add sales tax to a price', 'Remove sales tax from a total', 'Find the sales tax rate', 'Exempt and taxable item types', 'Shipping and delivery rule', 'Use tax on online purchases'] }),
    faq: jsonFaq(f), extraLd: [crumbs], hero, content, bodyAttr: ' data-state="' + c + '"', srcHtml: srcHtml(c)
  }));
}

/* ---------- state pages ---------- */
live.forEach((c) => {
  if (FLAT[c]) { writeFlat(c); return; }
  if (E.STATES[c].city) { writeCity(c); return; }
  if (E.STATES[c].places) { writePlaceState(c); return; }
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
    desc: n + ' sales tax calculator: ' + pct(s.base) + ' statewide, no local tax. $100 is ' + m(a100.total) + ' with tax. Clothing and groceries exempt, shipping rule, UEZ rates.',
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

// ---------------- homepage: "Sales Tax" tab with one cube (flag) per live state (same as the Paycheck tab) ----------------
edit('index.html', (h) => {
  const allIco = '<svg width="30" height="30" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="2.5" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M11 20l10-9" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="#B5761F"/><circle cx="20" cy="20" r="2" fill="#B5761F"/></svg>';
  const cubes = '<!--STAXCUBES:START-->\n    <div class="st-cubes">\n      <a class="st-cube st-all" href="/sales-tax-calculator/"><span class="st-ico" aria-hidden="true">' + allIco + '</span><span class="st-name">All states</span><span class="st-sub">Sales Tax Calculator</span></a>\n'
    + live.map((c) => '      <a class="st-cube" href="/sales-tax-calculator/' + E.STATES[c].slug + '/"><img src="/assets/flags/' + c.toLowerCase() + '.webp" width="60" height="40" alt="' + E.STATES[c].name + ' sales tax calculator — flag of ' + E.STATES[c].name + '" loading="lazy"><span class="st-name">' + E.STATES[c].name + '</span><span class="st-sub">Sales Tax Calculator</span></a>').join('\n')
    + '\n    </div>\n    <!--STAXCUBES:END-->';
  if (h.includes('<!--STAXCUBES:START-->')) return h.replace(/<!--STAXCUBES:START-->[\s\S]*?<!--STAXCUBES:END-->/, () => cubes);
  h = h.replace(/(<button class="cat-tab" type="button" data-cat="paycheck"[^>]*>[^<]*<br>[^<]*<\/button>)/, (m) => m + '\n    <button class="cat-tab" type="button" data-cat="salestax" role="tab" aria-selected="false">Sales<br>Tax</button>');
  const a = h.indexOf('<section id="grp-paycheck"'); const b = h.indexOf('</section>', a) + '</section>'.length;
  const sec = '\n\n  <section id="grp-salestax" class="cat-grp cat-grp--hidden" aria-label="Sales tax calculators by state">\n    <p class="st-lead">Pick your state for a sales tax calculator with its own rules — exempt items, shipping, special zones and local add-ons shown, not hidden.</p>\n    ' + cubes + '\n  </section>';
  h = h.slice(0, b) + sec + h.slice(b);
  return h.replace("paycheck:document.getElementById('grp-paycheck')", () => "paycheck:document.getElementById('grp-paycheck'),salestax:document.getElementById('grp-salestax')");
});
