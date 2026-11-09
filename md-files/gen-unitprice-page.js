const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /unit-price-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.unitPriceEngine. Run: node md-files/gen-unitprice-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['SALES', 'UNITPRICE'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const money = (x) => (x < 0 ? '−' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (x) => { const r = Math.round(x * 100) / 100; return (r < 0 ? '−' : '') + Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%'; };

/* ---------- worked examples, all from the engine ---------- */
const X = CalcThis.unitPriceEngine;
const fm = (x) => money(x);
const fu = (x) => (x < 0 ? '−' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: x >= 1 ? 2 : x >= 0.1 ? 3 : 4, maximumFractionDigits: x >= 1 ? 2 : x >= 0.1 ? 3 : 4 });
const A = X.line('weight', { price: 3.99, amt: 16, unit: 'oz' }), B = X.line('weight', { price: 5.49, amt: 24, unit: 'oz' });
const aOz = X.perOf('weight', 'oz', A.ub), bOz = X.perOf('weight', 'oz', B.ub), aLb = X.perOf('weight', 'lb', A.ub), bLb = X.perOf('weight', 'lb', B.ub);
const CHEAP = (1 - bOz / aOz) * 100, MORE = (aOz / bOz - 1) * 100;
const NEED = 32, PL = X.plan([A, B], NEED * 28.349523125);
const C6 = X.line('volume', { price: 4.20, amt: 330, unit: 'ml', cnt: 6 }), C12 = X.line('volume', { price: 7.80, amt: 330, unit: 'ml', cnt: 12 });
const c6 = X.perOf('volume', 'ml100', C6.ub), c12 = X.perOf('volume', 'ml100', C12.ub);
const SALE = X.line('weight', { price: 8, pct: 25, off: 1, tax: 0, amt: 2, unit: 'lb' });
const SAL = X.paid(8, 25, 1, 0);
const pc1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%';
const tblEx = '<table class="dtable"><thead><tr><th>Product</th><th>Price and size</th><th>Per oz</th><th>Per lb</th></tr></thead><tbody>' +
  '<tr><td>Product A</td><td>' + fm(3.99) + ' for 16 oz</td><td>' + fu(aOz) + '</td><td>' + fm(aLb) + '</td></tr>' +
  '<tr><td><strong>Product B</strong></td><td>' + fm(5.49) + ' for 24 oz</td><td><strong>' + fu(bOz) + '</strong></td><td><strong>' + fm(bLb) + '</strong></td></tr></tbody></table>';
const tblPlan = '<table class="dtable"><thead><tr><th>For ' + NEED + ' oz (2 lb)</th><th>Packs</th><th>You pay</th><th>Left over</th></tr></thead><tbody>' +
  '<tr><td>Product A</td><td>' + PL[0].packs + '</td><td>' + fm(PL[0].pay) + '</td><td>' + (PL[0].left / 28.349523125) + ' oz</td></tr>' +
  '<tr><td>Product B</td><td>' + PL[1].packs + '</td><td>' + fm(PL[1].pay) + '</td><td>' + (Math.round(PL[1].left / 28.349523125 * 1000) / 1000) + ' oz</td></tr></tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The formula — unit price = price ÷ amount, shown per the unit you choose, with several products compared on the same unit — is the one used by Omnicalculator's unit price calculator (five measure types: weight, volume, items, items with weight, items with volume) and Inch Calculator's unit price calculator (items, area, length, time, volume, weight, any number of products), both opened on 2026-11-09. Ranking the products, the percent difference, whole packs and the sale, coupon and tax lines are this page's arithmetic, which you can check with the examples.</li>
          <li>Conversions are exact definitions: 1 pound = 453.59237 grams, 1 ounce = 28.349523125 grams, 1 US gallon = 3,785.411784 millilitres, 1 US fluid ounce = 29.5735295625 millilitres, 1 inch = 25.4 millimetres, 1 foot = 0.3048 metres. For time this page uses a 365-day year and a month of one twelfth of it.</li>
          <li>Order of the price lines on this page is its own convention: the sale percent comes off first, then the coupon, then sales tax is added. Stores differ, so type the price you actually pay if yours works another way.</li>
          <li>The currency selector only changes the symbol and the number of decimals; nothing is converted, so type every price in the same currency.</li>
        </ul>
        <p><small>For information only. Check the shelf label: a smaller pack can cost less in total even when its unit price is higher.</small></p>`;

const P = {
  slug: 'unit-price-calculator', name: 'Unit Price Calculator', menu: 'Unit Price', body: 'p-bmr p-up',
  title: 'Unit Price Calculator — Compare Price per Ounce, lb & More',
  desc: 'Unit price calculator: compare any number of products by price per ounce, lb, gram, litre or item, find the best buy and the whole packs you need.',
  h1: 'Unit Price Calculator', eyebrow: 'Best buy per ounce, pound, gram, litre or item · any number of products · any currency',
  lead: `Type the <strong>price</strong> and the <strong>amount</strong> of each pack and see the <strong>price per unit</strong> of every product, ranked cheapest first. <strong>${fm(3.99)} for 16 oz</strong> is <strong>${fu(aOz)} per oz</strong>; <strong>${fm(5.49)} for 24 oz</strong> is <strong>${fu(bOz)} per oz</strong>, ${pc1(CHEAP)} cheaper. Go advanced to see the cost of whole packs for the amount you need, price per serving, sales and tax.`,
  schema: 'Free unit price calculator: price per ounce, pound, gram, kilogram, litre, item, foot, square foot or month for any number of products with a different unit in every row; the best buy ranked cheapest first with the percent difference; count x size packs such as 6 cans of 330 ml; the cost of whole packs for the amount you plan to buy; price per serving; sale, coupon and tax lines. Works in any currency.',
  llms: 'Free unit price calculator in any currency: compare any number of products by price per ounce, pound, gram, litre, item, foot, area or month, ranked cheapest first, whole packs for the amount you need, price per serving, sale, coupon and tax.',
  card: 'Price per ounce, pound, litre, item or month for any number of products, the best buy ranked, whole packs for the amount you need. Any currency.',
  faqs: [
    ['How do I calculate the unit price?', 'Divide the price by the amount in the pack. ' + fm(3.99) + ' for 16 oz is ' + fu(aOz) + ' per ounce, or ' + fm(aLb) + ' per pound. In the calculator, type the price and the amount, pick the unit, and the price per unit appears.'],
    ['How do I compare two products with different sizes or units?', 'Type each one in its own row with its own unit — one in ounces and the other in pounds or grams works — and the calculator converts them to the same unit. ' + fm(5.49) + ' for 24 oz costs ' + fu(bOz) + ' per ounce, so it is ' + pc1(CHEAP) + ' cheaper per ounce than ' + fm(3.99) + ' for 16 oz (' + fu(aOz) + ').'],
    ['Can I compare more than two products?', 'Yes. Add as many products as you like, up to twenty. They are ranked cheapest first, and each bar shows how much more than the best buy it costs.'],
    ['Is the lowest unit price always the cheapest thing to buy?', 'Not always. Packs come in whole units. If you need 2 lb (32 oz), two 16 oz packs of Product A cost ' + fm(PL[0].pay) + ' with nothing left over, while Product B, which has the lower price per ounce, needs two 24 oz packs for ' + fm(PL[1].pay) + ' and leaves 16 oz unused. Type the amount you will buy in Go advanced to see this.'],
    ['How do I compare packs such as 6 cans against 12 cans?', 'Choose Volume, type the size of one can (330 ml) and the number of cans in “Items in the pack”. ' + fm(4.20) + ' for 6 × 330 ml is ' + fu(c6) + ' per 100 ml; ' + fm(7.80) + ' for 12 × 330 ml is ' + fu(c12) + ' per 100 ml.'],
    ['How do I include a sale, a coupon or sales tax?', 'Open Go advanced. Type the sale percent, a coupon amount and the sales tax in the product’s row. The sale comes off first, then the coupon, then tax is added: ' + fm(8) + ' with 25% off and a ' + fm(1) + ' coupon is ' + fm(SAL) + '.'],
    ['Can it work out the price per serving?', 'Yes. In Go advanced type the servings in the pack and each bar shows the price per serving next to the price per unit.'],
    ['Can I compare subscriptions or rentals?', 'Yes. Choose Time and type the length of each plan in days, weeks, months or years to see the price per month, week or day. A month is one twelfth of a 365-day year.'],
    ['Does the currency selector convert my prices?', 'No. It only changes the symbol and the decimals shown. Type every price in the same currency.']
  ],
  pills: [['/discount-calculator/', 'Discount Calculator', '<path d="M5 6h12l10 10-10 10L5 16z" transform="scale(.75)"/><circle cx="9" cy="9" r="1.5"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'], ['/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/unit-converter/', 'Unit Converter', '<path d="M7 4v16M4 17l3 3 3-3M17 20V4m-3 3l3-3 3 3"/>']]
};

const tfld = (id, label, unit, ph, mode, extra) => `<label class="fld"${extra || ''} for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const plus = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

function build() {
  if (P.title.length > 60) throw new Error('title too long ' + P.title.length);
  if (P.desc.length > 158) throw new Error('desc too long ' + P.desc.length);
  const url = 'https://calcthis.co/' + P.slug + '/';
  const head = headTop
    .replace(/<title>[^<]*<\/title>/, () => '<title>' + P.title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(P.desc) + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(P.title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(P.desc) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">')
    .replace(/<meta name="twitter:title" content="[^"]*">/, () => '<meta name="twitter:title" content="' + esc(P.title) + '">')
    .replace(/<meta name="twitter:description" content="[^"]*">/, () => '<meta name="twitter:description" content="' + esc(P.desc) + '">');
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const curSel = `<div class="csel sl-cur" id="upCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
  const KINDS = [['weight', 'Weight'], ['volume', 'Volume'], ['count', 'Count'], ['length', 'Length'], ['area', 'Area'], ['time', 'Time']];
  const kindSel = `<div class="fld"><span class="lab">Compare by</span><div class="csel" id="upKind" data-value="weight" aria-label="Compare by"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">Weight</span>${chev}</button><div class="csel-panel" role="listbox">${KINDS.map((o, i) => `<button type="button" class="csel-opt${i === 0 ? ' on' : ''}" role="option" aria-selected="${i === 0}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
  const mkCs = (id, label, def, defLab) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${def}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${defLab}</span>${chev}</button><div class="csel-panel" role="listbox"></div></div></div>`;
  const input = `
        <div class="sl-head"><h2 class="card-h2">Your products</h2>${curSel}</div>
        ${kindSel}
        <p class="av-note" id="upKindNote"></p>
        ${mkCs('upPer', 'Show price per', 'oz', 'oz')}
        <div id="upRows"></div>
        <div class="add-row"><button class="btn" id="upAdd" type="button">${plus} Add a product</button></div>
        <div class="res-hint" id="upHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="upAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="up-sech">How much will you buy? <span>· optional</span></p>
          <div class="up-two">${tfld('upNeed', 'Amount to buy', '', 'e.g. 32')}${mkCs('upNeedU', 'In', 'oz', 'oz')}</div>
          <p class="av-note" id="upNeedNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="upClear" type="button">Clear fields</button>
          <button class="advbtn" id="upAdvBtn" type="button">
            <span id="upAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="upLab">Best buy</div>
          <div class="res-big"><span id="upBig">—</span></div>
          <div class="res-sub" id="upSub" data-empty="Type a price and an amount for each product.">Type a price and an amount for each product.</div>
        </div>
        <div id="upBody" style="display:none">
          <p class="res-tip adv-tip" id="upTip"></p>
          <div id="upBarsWrap" style="display:none">
            <p class="bm-h" id="upBarsHead">Price per unit, cheapest first</p>
            <div id="upBars"></div>
          </div>
          <div id="upPlanWrap" style="display:none">
            <p class="bm-h" id="upPlanHead">Whole packs for the amount you need</p>
            <table class="dtable" id="upPlan"></table>
            <p class="cb-note" id="upPlanNote"></p>
          </div>
          <div id="upUnitsWrap" style="display:none">
            <p class="bm-h">The best buy in every unit</p>
            <table class="dtable" id="upUnits"></table>
            <p class="cb-note">Click a row to show every price in that unit.</p>
          </div>
        </div>`;
  const left = `
        <h2>How to use the unit price calculator</h2>
        <p>Choose what the packs are measured in under <strong>Compare by</strong> — weight, volume, count, length, area or time. For each product type its <strong>price</strong> and the <strong>amount in one pack</strong>, and pick the unit that pack uses: one row can be in ounces and the next in kilograms, the calculator converts. The line under each product shows its price per unit; the result ranks every product cheapest first and shows how much more each of the others costs than the best buy.</p>
        <p>Buying cans or bottles? Type the size of <strong>one</strong> can and put the number of cans in <strong>Items in the pack</strong>: 6 cans of 330 ml is 1,980 ml. Keep <strong>The price is for: The whole pack</strong> when the price covers all the cans, or choose <strong>One item</strong> when the label shows the price of a single can. <strong>Show price per</strong> picks the unit of the answer, and clicking a row of “The best buy in every unit” switches the whole page to that unit.</p>
        <p>Open <strong>Go advanced</strong> to add servings, a sale percent, a coupon and sales tax to each product, and to type how much you plan to buy — the calculator then rounds up to whole packs and shows what each product really costs for that amount.</p>

        <h2>The formulas</h2>
        <div class="formula">
          unit price = price ÷ (amount × items in the pack)
          <small>PRICE PER CHOSEN UNIT = UNIT PRICE × SIZE OF THAT UNIT</small>
        </div>
        <p>With a sale: price paid = (price × (1 − sale ÷ 100) − coupon) × (1 + tax ÷ 100). Two products from the same example, worked out by this calculator:</p>
        ${tblEx}`;
  const right = `
        <h2>The lowest unit price is not always the cheapest purchase</h2>
        <p>Packs are whole. If you need 2 lb (32 oz), two 16 oz packs of Product A cost ${fm(PL[0].pay)} and nothing is left, while Product B — ${pc1(CHEAP)} cheaper per ounce — needs two 24 oz packs for ${fm(PL[1].pay)} and leaves 16 oz you may not use. Type the amount you will buy and the calculator shows this for every product:</p>
        ${tblPlan}
        <h2>Cans, bottles and multipacks</h2>
        <p>Choose Volume, type 330 ml as the size and the number of cans as the items in the pack. ${fm(4.20)} for 6 cans is ${fu(c6)} per 100 ml; ${fm(7.80)} for 12 cans is ${fu(c12)} per 100 ml, so the bigger pack is cheaper per 100 ml.</p>
        <h2>Sales, coupons and subscriptions</h2>
        <p>Under Go advanced the price paid includes the sale, the coupon and tax: a ${fm(8)} pack with 25% off and a ${fm(1)} coupon costs ${fm(SAL)}. Choose Time to compare plans per month, week or day.</p>

        <h2>Related tools</h2>
        <p>To work out a percent off a price use the <a href="/discount-calculator/">discount calculator</a>, to find the tax on a purchase the <a href="/sales-tax-calculator/">sales tax calculator</a>, to turn one number into a percentage of another the <a href="/percentage-calculator/">percentage calculator</a>, and to convert between ounces, grams, litres and more the <a href="/unit-converter/">unit converter</a>.</p>
        ${SRC}`;

  const body = `<body class="${P.body}">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">${P.eyebrow}</div>
    <h1>${P.h1}</h1>
    <p>${P.lead}</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">${input}
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">${result}
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="upMLab">Best buy</span>
    <div class="mbar-vals"><b id="upMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${P.pills.map((p) => pill(p[0], p[1], p[2])).join('\n')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>${left}
      </div>

      <div>${right}
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initUnitPriceCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log(P.slug, 'written; title', P.title.length, 'desc', P.desc.length);
}
build();

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s2 = fs.readFileSync(fl, 'utf8'); const crlf = s2.includes('\r\n'); s2 = s2.replace(/\r\n/g, '\n'); const o = s2; s2 = fn(s2); if (s2 !== o) { fs.writeFileSync(fl, crlf ? s2.replace(/\n/g, '\r\n') : s2); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
const prev = { slug: 'realtor-commission-calculator', menu: 'Realtor Commission', name: 'Realtor Commission Calculator', llms: 'Realtor Commission Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("(  \\{ file: '" + prev.slug + "/index\\.html',[^\\n]*\\n)"), (mm) => mm + "  { file: '" + P.slug + "/index.html',          slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "FinanceApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M11 21l10-10" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1.8" fill="#37503F"/><circle cx="20" cy="20" r="1.8" fill="#37503F"/></svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="' + ps2 + '">', () => card + '    <a class="calc" href="' + ps2 + '">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — price per ounce, litre or item, the best buy ranked, whole packs and price per serving</span></li>\n');
    return h;
  });
}
