const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /profit-margin-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.salesEngine + CalcThis.marginEngine. Run: node md-files/gen-profitmargin-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['SALES', 'MARGIN'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.salesEngine, M = CalcThis.marginEngine;
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
const A = E.solve([['price', 50000], ['cost', 30000]]);             // the example business
const X = { opex: 10000, other: 1000, fee: 2.9, int: 500, tax: 25 };
const PA = M.pl(A.p, A.c, X), P0 = M.pl(A.p, A.c, {});
const B = E.solve([['price', 100], ['margin', 40]]);                  // 40% margin on 100
const C = E.solve([['cost', 60], ['margin', 40]]);                    // cost 60 at a 40% margin
const D = E.solve([['price', 80], ['cost', 100]]);                    // loss
const LONE = E.solve([['margin', 25]]);
const W = M.whatif(A.p, A.c, {});
const be = M.breakeven(A.p, A.c, X);
const tbl = '<table class="dtable"><thead><tr><th>Margin</th><th>Markup</th></tr></thead><tbody>' + E.ladder(0, 'mg').map((r) => '<tr><td>' + r.x + '%</td><td>' + pct(r.mu) + '</td></tr>').join('') + '</tbody></table>';
const row = (l, v, strong) => '<tr' + (strong ? '' : '') + '><td>' + l + '</td><td>' + money(v) + '</td><td>' + pct(v / A.p * 100) + '</td></tr>';
const tblPl = '<table class="dtable"><thead><tr><th></th><th>Amount</th><th>% of revenue</th></tr></thead><tbody>' +
  row('Revenue', A.p) + row('Cost of goods sold', -A.c) + row('Gross profit', PA.gp) + row('Operating expenses', -X.opex) + row('Other costs', -X.other) + row('Fees ' + X.fee + '%', -PA.feeA) + row('Operating profit', PA.op) + row('Interest', -X.int) + row('Tax ' + X.tax + '%', -PA.taxA) + row('Net profit', PA.net) + '</tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Gross profit = revenue − cost of goods sold and gross margin = gross profit ÷ revenue are the formulas stated on the pages of Omnicalculator (gross margin and margin calculators), calculator.net’s margin calculator, CalculatorSoup’s profit margin calculator and Xero’s gross margin calculator; net margin as the share of revenue left after all costs and expenses is how businessinitiative.org’s profit margin calculator describes it. All opened 2026-11-08.</li>
          <li>Operating profit here = gross profit − operating expenses − other costs − fees, and fees are a percent of revenue. Profit before tax = operating profit − interest; tax = your rate × profit before tax (nothing when there is no profit); net profit = profit before tax − tax. Those steps are this page’s convention for turning the typed amounts into three margins; check them against your own accounts.</li>
          <li>Break-even assumes your operating expenses, other costs and interest stay the same however much you sell, while the cost of goods sold and fees grow in step with revenue, and ignores tax. Real businesses are rarely that tidy; treat it as a guide.</li>
          <li>The currency selector only changes the symbol and the number of decimals; nothing is converted.</li>
          <li>Not used because I found no source for them: “good profit margin” benchmarks by industry.</li>
        </ul>
        <p><small>For information only. Check your own figures and ask an accountant before you act on them.</small></p>`;

const P = {
  slug: 'profit-margin-calculator', name: 'Profit Margin Calculator', menu: 'Profit Margin', body: 'p-bmr p-pm',
  title: 'Profit Margin Calculator — Gross, Net & Margin %',
  desc: 'Profit margin calculator: type revenue and cost, add your other costs, and get gross, operating and net margin and profit. Any currency.',
  h1: 'Profit Margin Calculator', eyebrow: 'Revenue, cost, gross profit and margin · gross, operating and net · any currency',
  lead: `Type any <strong>two</strong> of <strong>revenue</strong>, <strong>cost of goods sold</strong>, <strong>gross profit</strong> and <strong>gross margin</strong> — the other two fill in, with a picture of where your revenue goes. Revenue of <strong>${money(A.p)}</strong> against a cost of <strong>${money(A.c)}</strong> is a <strong>${pct(A.mg)} gross margin</strong>. Open Go advanced for operating costs, interest and tax to get your <strong>net margin</strong>.`,
  schema: 'Free profit margin calculator: type any two of revenue, cost of goods sold, gross profit and gross margin and get the rest, plus gross, operating and net margin once you add operating expenses, other costs, fees, interest and tax. Shows where your revenue goes in one bar, what happens if price or cost moves, the revenue a margin needs and your break-even revenue. Works in any currency.',
  llms: 'Free profit margin calculator in any currency: gross, operating and net margin from revenue, cost of goods sold and your other costs, a picture of where revenue goes, price and cost what-ifs, the revenue a margin needs and break-even revenue.',
  card: 'Revenue, cost and costs in, gross, operating and net margin out, with a picture of where your revenue goes. Any currency.',
  faqs: [
    ['What is profit margin?', 'Profit margin is the share of your revenue that is left as profit. With revenue of ' + money(A.p) + ' and a cost of goods sold of ' + money(A.c) + ', the gross profit is ' + money(A.gp === undefined ? A.pr : A.pr) + ', which is a ' + pct(A.mg) + ' gross margin.'],
    ['What is the profit margin formula?', 'Gross margin % = (revenue − cost of goods sold) ÷ revenue × 100. For revenue of ' + money(A.p) + ' and a cost of ' + money(A.c) + ' that is ' + money(A.pr) + ' ÷ ' + money(A.p) + ' = ' + pct(A.mg) + '. In the calculator, type the revenue and the cost and the margin fills in.'],
    ['What is the difference between gross, operating and net margin?', 'They use the same revenue but subtract more each time. Gross margin takes off only the cost of goods sold (' + pct(PA.gm) + ' in the example). Operating margin also takes off operating expenses, other costs and fees (' + pct(PA.om) + '). Net margin also takes off interest and tax (' + pct(PA.nm) + ').'],
    ['How do I calculate the price I need for a target margin?', 'Revenue = cost ÷ (1 − margin ÷ 100). A cost of ' + money(C.c) + ' at a ' + pct(C.mg) + ' margin needs revenue of ' + money(C.p) + '. In the calculator, type the cost of goods sold and the margin you want and the revenue fills in; the ladder lists the revenue for ten common margins.'],
    ['What is the difference between margin and markup?', 'Both measure the same profit, but margin divides it by revenue and markup divides it by the cost. A cost of ' + money(A.c) + ' sold at ' + money(A.p) + ' is a ' + pct(A.mg) + ' margin and a ' + pct(A.mu) + ' markup. A ' + pct(LONE.mg) + ' margin needs a ' + pct(LONE.mu) + ' markup. The markup calculator on this site works the other way round.'],
    ['Can a profit margin be negative?', 'Yes. If the cost is higher than the revenue you make a loss and the margin is negative: a cost of ' + money(D.c) + ' sold at ' + money(D.p) + ' loses ' + money(-D.pr) + ', a ' + pct(D.mg) + ' margin. The bar then shows where the revenue runs out. A margin can never reach 100%, because that would need a cost of zero, so the calculator does not accept it.'],
    ['How do operating expenses, interest and tax change the margin?', 'Type them under Go advanced and the table shows each step. In the example, ' + money(X.opex) + ' of operating expenses, ' + money(X.other) + ' of other costs, ' + X.fee + '% fees, ' + money(X.int) + ' of interest and ' + X.tax + '% tax turn a ' + money(PA.gp) + ' gross profit into a net profit of ' + money(PA.net) + ': a net margin of ' + pct(PA.nm) + '.'],
    ['What is break-even revenue?', 'It is the revenue at which you stop losing money. If your fixed costs (operating expenses, other costs and interest) are ' + money(be.fixed) + ' and each ' + '$1' + ' of revenue leaves ' + pct(be.ratio * 100) + ' after the cost of goods sold and fees, you break even at ' + money(be.be) + ' before tax. The calculator shows it when you type your fixed costs.'],
    ['Does the currency selector convert my numbers?', 'No. It only changes the symbol and the decimals shown. Type your numbers in the currency you use.']
  ],
  pills: [['/markup-calculator/', 'Markup Calculator', '<path d="M4 17l6-6 4 4 6-8"/><path d="M15 7h5v5"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'], ['/percentage-change-calculator/', 'Percentage Change Calculator', '<path d="M4 17l6-6 4 4 6-8"/>'], ['/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>']]
};

const tfld = (id, label, unit, ph, mode, data) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (data ? ' data-d="' + data + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;

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

  const curSel = `<div class="csel sl-cur" id="pmCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
  const input = `
        <div class="sl-head"><h2 class="card-h2">Your numbers</h2>${curSel}</div>
        <p class="pm-intro">Type any two of these four — the other two fill in. The cost of goods sold stays put; any other third value replaces the one before it.</p>
        <div id="pmFields">
          ${tfld('pmRev', 'Revenue', '$ · what you sell for', 'e.g. 50000')}
          ${tfld('pmCogs', 'Cost of goods sold', '$ · what it costs you', 'e.g. 30000')}
          ${tfld('pmProfit', 'Gross profit', '$ · revenue − cost', 'e.g. 20000')}
          ${tfld('pmMargin', 'Gross margin', '% · profit ÷ revenue', 'e.g. 40')}
          <div class="res-hint" id="pmHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        </div>
        <p class="av-note" id="pmFrom" style="display:none"></p>
        <div id="pmAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${tfld('pmOpex', 'Operating expenses', '$ · optional', 'e.g. 10000', 'decimal', 'optional')}
          <p class="av-note" id="pmOpexNote"></p>
          ${tfld('pmOther', 'Other costs', '$ · optional', 'e.g. 1000', 'decimal', 'optional')}
          <p class="av-note" id="pmOtherNote"></p>
          ${tfld('pmFee', 'Fees', '% of the revenue · optional', 'e.g. 2.9')}
          <p class="av-note" id="pmFeeNote"></p>
          ${tfld('pmInt', 'Interest', '$ · optional', 'e.g. 500', 'decimal', 'optional')}
          <p class="av-note" id="pmIntNote"></p>
          ${tfld('pmTax', 'Tax rate', '% on the profit · optional', 'e.g. 25')}
          <p class="av-note" id="pmTaxNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="pmClear" type="button">Clear fields</button>
          <button class="advbtn" id="pmAdvBtn" type="button">
            <span id="pmAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="pmLab">Answer</div>
          <div class="res-big"><span id="pmBig">—</span></div>
          <div class="res-sub" id="pmSub" data-empty="Type any two of revenue, cost of goods sold, gross profit or gross margin.">Type any two of revenue, cost of goods sold, gross profit or gross margin.</div>
        </div>
        <div id="pmBody" style="display:none">
          <p class="res-tip adv-tip" id="pmTip"></p>
          <div id="pmBarsWrap" style="display:none">
            <p class="bm-h">Where your revenue goes</p>
            <div id="pmBars"></div>
          </div>
          <div id="pmPlWrap" style="display:none">
            <p class="bm-h">Step by step</p>
            <table class="dtable" id="pmPl"></table>
            <p class="cb-note" id="pmBE" style="display:none"></p>
          </div>
          <div id="pmWiWrap" style="display:none">
            <p class="bm-h">What if the price or the cost changes?</p>
            <table class="dtable" id="pmWi"></table>
            <p class="cb-note">Price and cost move by the percent shown; every other figure stays as you typed it.</p>
          </div>
          <div class="pm-lad-head"><p class="bm-h">Margin ladder</p></div>
          <table class="dtable" id="pmLad"></table>
          <p class="cb-note" id="pmLadNote"></p>
          <p class="cb-note">Margin divides the profit by the revenue; markup divides the same profit by the cost. That is why the margin is always the smaller number for a profit.</p>
        </div>`;
  const left = `
        <h2>How to use the profit margin calculator</h2>
        <p>Type any <strong>two</strong> of the four boxes — <strong>revenue</strong>, <strong>cost of goods sold</strong>, <strong>gross profit</strong> or <strong>gross margin</strong> — and the other two fill in; the markup is shown with the answer. The line under the boxes says which two were used. Type a third value and it replaces the other one you typed, never the cost of goods sold, so changing the margin or the profit moves the revenue.</p>
        <p>Need the price for a margin you want? Type the cost of goods sold and the margin, and the revenue appears; click a row of the ladder to try another margin. Open <strong>Go advanced</strong> to add operating expenses, other costs, fees, interest and a tax rate: the picture and the table then show your gross, operating and net margin, and the break-even revenue.</p>

        <h2>The formulas</h2>
        <div class="formula">
          gross margin % = (revenue − cost of goods sold) ÷ revenue × 100
          <small>NET MARGIN % = NET PROFIT ÷ REVENUE × 100</small>
        </div>
        <p>To go the other way: revenue = cost of goods sold ÷ (1 − margin ÷ 100). Example, worked out by this calculator:</p>
        <p>Revenue ${money(A.p)}, cost of goods sold ${money(A.c)}, operating expenses ${money(X.opex)}, other costs ${money(X.other)}, fees ${X.fee}%, interest ${money(X.int)}, tax ${X.tax}%:</p>
        ${tblPl}`;
  const right = `
        <h2>Gross, operating and net margin</h2>
        <p>The three margins use the same revenue but subtract more costs each time. <strong>Gross margin</strong> counts only the cost of goods sold: ${pct(PA.gm)} in the example. <strong>Operating margin</strong> also counts operating expenses, other costs and fees: ${pct(PA.om)}. <strong>Net margin</strong> also counts interest and tax: ${pct(PA.nm)}. A business can have a healthy gross margin and a thin net margin, which is why the bar and the table show every step.</p>
        <h2>Margin versus markup</h2>
        <p>Margin and markup describe the same profit with a different base. Revenue of ${money(A.p)} on a cost of ${money(A.c)} is a ${pct(A.mg)} margin but a ${pct(A.mu)} markup. A 50% margin needs a 100% markup, not 50%. The <a href="/markup-calculator/">markup calculator</a> goes the other way: type the cost and the markup you want and get the selling price.</p>
        ${tbl}
        <h2>What if the price or cost changes?</h2>
        <p>A 10% higher price moves the example’s gross margin from ${pct(W[0].r.gm)} to ${pct(W[1].r.gm)}; a 10% higher cost drops it to ${pct(W[5].r.gm)}. The calculator shows all eight cases for your own numbers.</p>

        <h2>Related tools</h2>
        <p>To set a selling price from a cost use the <a href="/markup-calculator/">markup calculator</a>, to work out a percentage of a number the <a href="/percentage-calculator/">percentage calculator</a>, to see how much a figure rose or fell the <a href="/percentage-change-calculator/">percentage change calculator</a>, and to add tax to a price the <a href="/sales-tax-calculator/">sales tax calculator</a>.</p>
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
    <span class="mbar-lab" id="pmMLab">Answer</span>
    <div class="mbar-vals"><b id="pmMVal">—</b></div>
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
<script>CalcThis.initProfitMarginCalc();</script>
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
const prev = { slug: 'markup-calculator', menu: 'Markup', name: 'Markup Calculator', llms: 'Markup Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M16 16V5a11 11 0 0 1 9.5 16.5z" fill="#37503F" opacity=".85"/><path d="M16 16l9.5 5.5" stroke="#8F5C13" stroke-width="1.4"/></svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="/markup-calculator/">', () => card + '    <a class="calc" href="/markup-calculator/">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — revenue, cost and your other costs: gross, operating and net margin</span></li>\n');
    return h;
  });
}
