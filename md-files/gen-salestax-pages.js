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
const stateTable = '<div class="pc-tblwrap"><table class="dtable"><thead><tr><th>State</th><th>State rate</th><th>Average local</th><th>Highest local</th></tr></thead><tbody>' + all.map((c) => { const s = E.STATES[c]; return '<tr><td>' + (s.live ? '<a href="/sales-tax-calculator/' + s.slug + '/">' + s.name + '</a>' : s.name) + '</td><td>' + pct(s.base) + '</td><td>' + (s.places ? 'varies by place' : (s.live ? 'none' : pct(s.avgLocal))) + '</td><td>' + (s.places ? pct(Math.round((s.places.baseHi - s.base) * 1000) / 1000) + (s.places.hubNote || '') : (s.live ? 'none' : pct(s.maxLocal))) + '</td></tr>'; }).join('') + '</tbody></table></div>';
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

const PF = {
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

/* ---------- state pages ---------- */
live.forEach((c) => {
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
