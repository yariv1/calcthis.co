const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /discount-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.salesEngine + CalcThis.discountEngine. Run: node md-files/gen-discount-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['SALES', 'DISCOUNT'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.salesEngine, D = CalcThis.discountEngine;
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

/* ---------- worked examples, all from the engines ---------- */
const A = D.solve([['orig', 120], ['pct', 20]], []);                         // 20% off 120
const ST = D.solve([['orig', 279], ['pct', 20]], [{ k: 'pct', v: 15 }]);      // calculator.net example: 20% then 15% on 279
const RV = D.solve([['orig', 120], ['final', 84]], []);                       // what percent off is 84 from 120
const OR = D.solve([['pct', 30], ['final', 84]], []);                         // original price from 30% off and 84
const TX = 8.5, taxA = A.f * TX / 100;
const T2 = D.solve([['orig', 100], ['pct', 20]], [{ k: 'pct', v: 10 }]);      // 20% then 10% = 28%
const offers = [{ t: 'pct', a: 30 }, { t: 'amt', a: 25 }, { t: 'bxgy', a: 2, b: 1 }];
const Q3 = D.autoQty(offers), pays = offers.map((of) => D.offerPay(100, Q3, of));
const lbl = ['30% off', money(25) + ' off', 'Buy 2 get 1 free'];
const tblEx = '<table class="dtable"><thead><tr><th>Example</th><th>Final price</th><th>You save</th></tr></thead><tbody>' +
  [['20% off ' + money(120), A], ['20% off then 15% off ' + money(279), ST], ['20% off then 10% off ' + money(100), T2]].map((x) => '<tr><td>' + x[0] + '</td><td>' + money(x[1].f) + '</td><td>' + money(x[1].s) + ' (' + pct(x[1].eff) + ')</td></tr>').join('') + '</tbody></table>';
const tblCmp = '<table class="dtable"><thead><tr><th>Offer on 3 items at ' + money(100) + '</th><th>You pay</th><th>You save</th></tr></thead><tbody>' + offers.map((of, i) => '<tr><td>' + lbl[i] + '</td><td>' + money(pays[i]) + '</td><td>' + money(100 * Q3 - pays[i]) + '</td></tr>').join('') + '</tbody></table>';
const lad = D.ladder(120, []);
const tblLad = '<table class="dtable"><thead><tr><th>Percent off</th><th>Final price</th><th>You save</th></tr></thead><tbody>' + lad.map((r) => '<tr><td>' + r.x + '%</td><td>' + money(r.f) + '</td><td>' + money(r.s) + '</td></tr>').join('') + '</tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The formulas — savings = price × percent ÷ 100, final price = price × (1 − percent ÷ 100), stacked discounts applied one after another, buy X get Y free and a percent off every 2nd or 3rd item — are the ones stated on the pages of calculator.net’s percent off calculator, Omnicalculator’s discount and percent off calculators, GigaCalculator’s discount calculator and miniwebtool’s discount calculator, all opened 2026-11-08. Everything else on this page is arithmetic done by the calculator itself, which you can check with the examples.</li>
          <li>Order used here: the first discount comes off the original price, each extra discount comes off the price left by the one before, and an amount off counts as it is typed. Sales tax is charged on the final price, or taken out of it when you choose “Included”. This is this page’s convention, not a tax rule; type the rate that applies to you.</li>
          <li>Compare deals treats an amount off as one coupon for the whole purchase, a percent off every 2nd or 3rd item as applying to items 2, 4, 6 … (or 3, 6, 9 …), and buy X get Y free as the first X items of every group of X + Y paid and the other Y free.</li>
          <li>The currency selector only changes the symbol and the number of decimals; nothing is converted.</li>
        </ul>
        <p><small>For information only. Check the shop’s own terms: some sales exclude items or cap the discount.</small></p>`;

const P = {
  slug: 'discount-calculator', name: 'Discount Calculator', menu: 'Discount', body: 'p-bmr p-dc',
  title: 'Discount Calculator — Percent Off, Sale Price & Savings',
  desc: 'Discount calculator: type any two of price, percent off, final price or saving, stack coupons, add tax and compare deals. Percent off made easy. Any currency.',
  h1: 'Discount Calculator', eyebrow: 'Percent off, sale price and savings · stack coupons · compare deals · any currency',
  lead: `Type any <strong>two</strong> of the <strong>original price</strong>, <strong>percent off</strong>, <strong>final price</strong> or what you <strong>save</strong> — the other two fill in. <strong>${pct(A.p)} off ${money(A.o)}</strong> is <strong>${money(A.f)}</strong>, a saving of ${money(A.s)}. Add a coupon on top and see the real total: <strong>${pct(20)} then ${pct(15)} off is ${pct(ST.eff)}, not 35%</strong>.`,
  schema: 'Free discount and percent off calculator: type any two of original price, percent off, final price and amount saved and get the rest, stack coupons and second sales with the true total discount, add sales tax or VAT, and compare deals such as 30% off, an amount off and buy 2 get 1 free to see which costs least. Works in any currency.',
  llms: 'Free discount and percent off calculator in any currency: any two of price, percent off, final price and saving fill the rest, stacked discounts with the true total percent, sales tax, and a comparison of deals (percent off, amount off, buy X get Y free, every 2nd item).',
  card: 'Percent off, sale price and savings from any two values, stacked coupons, tax, and a comparison of deals. Any currency.',
  faqs: [
    ['How do I calculate percent off?', 'Multiply the price by the percent off and divide by 100 to get the saving, then subtract it. ' + pct(A.p) + ' off ' + money(A.o) + ' saves ' + money(A.s) + ', so you pay ' + money(A.f) + '. In the calculator, type the original price and the percent off and the rest fills in.'],
    ['How do I find the discount percentage from the original and sale price?', 'Percent off = (original price − final price) ÷ original price × 100. A price that falls from ' + money(RV.o) + ' to ' + money(RV.f) + ' is ' + pct(RV.p) + ' off. In the calculator, type the original price and the final price and the percent off appears.'],
    ['How do I find the original price from the sale price and the percent off?', 'Divide the final price by (1 − percent off ÷ 100). A final price of ' + money(OR.f) + ' at ' + pct(OR.p) + ' off means an original price of ' + money(OR.o) + '. In the calculator, type the percent off and the final price.'],
    ['How do two discounts stack?', 'Each discount comes off the price left by the one before, so the percents do not simply add. ' + pct(20) + ' off ' + money(279) + ' leaves ' + money(279 * 0.8) + ', and a further ' + pct(15) + ' off that leaves ' + money(ST.f) + ': a total discount of ' + pct(ST.eff) + ', not 35%. Use “Add a discount” under the boxes for any number of coupons or sales.'],
    ['Is 20% off and then 10% off the same as 30% off?', 'No. ' + pct(20) + ' off then ' + pct(10) + ' off ' + money(100) + ' leaves ' + money(T2.f) + ', a total discount of ' + pct(T2.eff) + '. The order of two percent discounts does not change the result, but an amount off in between does.'],
    ['How is sales tax added to a discounted price?', 'The discount comes first and the tax is charged on the lower price. ' + money(A.f) + ' after a discount plus ' + pct(TX) + ' tax is ' + money(taxA) + ' of tax and ' + money(A.f + taxA) + ' to pay. If the shelf price already includes tax, choose “Included” and the calculator shows how much of the final price is tax.'],
    ['Which is better: 30% off, ' + money(25) + ' off or buy 2 get 1 free?', 'It depends on the price and how many items you buy, so the calculator compares them. On 3 items at ' + money(100) + ' each: 30% off costs ' + money(pays[0]) + ', ' + money(25) + ' off costs ' + money(pays[1]) + ' and buy 2 get 1 free costs ' + money(pays[2]) + ', so the free item wins here. Open Go advanced, add the offers under “Compare deals” and the best one is marked.'],
    ['What does 50% off every 2nd item mean?', 'The 2nd, 4th, 6th … item is half price and the others are full price. For 2 items at ' + money(100) + ' you pay ' + money(D.offerPay(100, 2, { t: 'n2', a: 50 })) + ', a saving of 25% overall. “Every 3rd item” works the same way with items 3, 6, 9 ….'],
    ['Can a discount be more than 100%?', 'No. 100% off is free, so the calculator accepts percents from 0 to 100, and an amount off can never be more than the price left.'],
    ['Does the currency selector convert my numbers?', 'No. It only changes the symbol and the decimals shown. Type your numbers in the currency you use.']
  ],
  pills: [['/markup-calculator/', 'Markup Calculator', '<path d="M4 17l6-6 4 4 6-8"/><path d="M15 7h5v5"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'], ['/percentage-change-calculator/', 'Percentage Change Calculator', '<path d="M4 17l6-6 4 4 6-8"/>'], ['/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>']]
};

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
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

  const curSel = `<div class="csel sl-cur" id="dcCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
  const input = `
        <div class="sl-head"><h2 class="card-h2">Your price</h2>${curSel}</div>
        <p class="dc-intro">Type any two of these four — the other two fill in. The original price stays put; any other third value replaces the one before it.</p>
        <div id="dcFields">
          ${tfld('dcOrig', 'Original price', '$ · before any discount', 'e.g. 120')}
          ${tfld('dcPct', 'Percent off', '% · first discount', 'e.g. 20')}
          ${tfld('dcFinal', 'Final price', '$ · after all discounts', 'e.g. 96')}
          ${tfld('dcSave', 'You save', '$ · in total', 'e.g. 24')}
          <div class="res-hint" id="dcHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        </div>
        <p class="av-note" id="dcFrom" style="display:none"></p>
        <p class="dc-sech">Another discount after it <span>· optional</span></p>
        <div id="dcRows" class="dc-rows"></div>
        <p class="av-note" id="dcRowsNote"></p>
        <div class="add-row"><button class="btn" id="dcRowAdd" type="button">${plus} Add a discount</button></div>
        <div id="dcAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${tfld('dcQty', 'Quantity', 'how many you buy · optional', 'e.g. 12')}
          <p class="av-note" id="dcQtyNote"></p>
          <div class="fld"><span class="lab">Tax is</span><div class="seg" id="dcTaxMode" role="group" aria-label="Tax is"><button class="on" type="button" data-v="add">On top</button><button type="button" data-v="incl">Included</button></div></div>
          ${tfld('dcTax', 'Sales tax / VAT', '% · optional', 'e.g. 8.5')}
          <p class="av-note" id="dcTaxNote"></p>
          <div class="proj-sep"></div>
          <p class="dc-sech">Compare deals <span>· optional</span></p>
          <div id="dcOffers" class="dc-rows"></div>
          <div class="add-row"><button class="btn" id="dcOffAdd" type="button">${plus} Add an offer</button></div>
          <div style="height:15px"></div>
          ${tfld('dcItems', 'Items you buy', 'for the comparison · optional', 'e.g. 3')}
          <p class="av-note" id="dcOffNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="dcClear" type="button">Clear fields</button>
          <button class="advbtn" id="dcAdvBtn" type="button">
            <span id="dcAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="dcLab">Answer</div>
          <div class="res-big"><span id="dcBig">—</span></div>
          <div class="res-sub" id="dcSub" data-empty="Type any two of original price, percent off, final price or amount saved.">Type any two of original price, percent off, final price or amount saved.</div>
        </div>
        <div id="dcBody" style="display:none">
          <p class="res-tip adv-tip" id="dcTip"></p>
          <div id="dcBarsWrap" style="display:none">
            <p class="bm-h">Where the price goes</p>
            <div id="dcBars"></div>
          </div>
          <div id="dcStepWrap" style="display:none">
            <p class="bm-h">Step by step</p>
            <table class="dtable" id="dcStep"></table>
          </div>
          <div id="dcCmpWrap" style="display:none">
            <p class="bm-h">Which deal is best?</p>
            <table class="dtable" id="dcCmp"></table>
            <p class="cb-note">An amount off counts as one coupon for the whole purchase. “Every 2nd item” discounts items 2, 4, 6 …; in every group of X + Y items, the first X are paid and the other Y are free.</p>
          </div>
          <div id="dcLadWrap">
            <p class="bm-h">Percent off ladder</p>
            <table class="dtable" id="dcLad"></table>
            <p class="cb-note" id="dcLadNote"></p>
          </div>
        </div>`;
  const left = `
        <h2>How to use the discount calculator</h2>
        <p>Type any <strong>two</strong> of the four boxes — <strong>original price</strong>, <strong>percent off</strong>, <strong>final price</strong> or <strong>you save</strong> — and the other two fill in. The line under the boxes says which two were used. Type a third value and it replaces the other one you typed, never the original price.</p>
        <p>Got a coupon on top of a sale? Press <strong>Add a discount</strong>: each extra discount (a percent or an amount) comes off the price left by the one before, and the page shows the true total discount. Open <strong>Go advanced</strong> for a quantity, sales tax or VAT (on top of the price or included in it) and <strong>Compare deals</strong>: add up to three offers — a percent off, an amount off, buy X get Y free or a percent off every 2nd or 3rd item — and the cheapest is marked.</p>

        <h2>The formulas</h2>
        <div class="formula">
          final price = price × (1 − percent off ÷ 100)
          <small>PERCENT OFF = (PRICE − FINAL PRICE) ÷ PRICE × 100</small>
        </div>
        <p>For two discounts: final price = price × (1 − first ÷ 100) × (1 − second ÷ 100). Examples, all worked out by this calculator:</p>
        ${tblEx}`;
  const right = `
        <h2>Why 20% off then 15% off is not 35% off</h2>
        <p>The second discount is taken from the price that is already reduced, so it is worth less than the first. ${pct(20)} off ${money(279)} leaves ${money(279 * 0.8)}; ${pct(15)} off that leaves ${money(ST.f)}, a total discount of ${pct(ST.eff)}. The bar and the table in the calculator show every step.</p>
        <h2>Which deal is best?</h2>
        <p>Percent off, an amount off and “buy 2 get 1 free” are hard to compare in your head. On 3 items at ${money(100)} each the calculator gives:</p>
        ${tblCmp}
        <h2>Common percents on ${money(120)}</h2>
        ${tblLad}

        <h2>Related tools</h2>
        <p>To work out a percentage of a number use the <a href="/percentage-calculator/">percentage calculator</a>, to see how much a price rose or fell the <a href="/percentage-change-calculator/">percentage change calculator</a>, to add tax to a price the <a href="/sales-tax-calculator/">sales tax calculator</a>, and to set a selling price from a cost the <a href="/markup-calculator/">markup calculator</a>.</p>
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
    <span class="mbar-lab" id="dcMLab">Answer</span>
    <div class="mbar-vals"><b id="dcMVal">—</b></div>
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
<script>CalcThis.initDiscountCalc();</script>
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
const prev = { slug: 'profit-margin-calculator', menu: 'Profit Margin', name: 'Profit Margin Calculator', llms: 'Profit Margin Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M5 6h12l10 10-10 10L5 16z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4" stroke-linejoin="round"/><circle cx="11" cy="11" r="2" fill="#37503F"/><path d="M14 20l5-5" stroke="#37503F" stroke-width="2" stroke-linecap="round"/></svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="/profit-margin-calculator/">', () => card + '    <a class="calc" href="/profit-margin-calculator/">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — percent off, sale price and savings; stack coupons, add tax, compare deals</span></li>\n');
    return h;
  });
}
