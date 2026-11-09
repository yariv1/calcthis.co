const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /markup-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.salesEngine. Run: node md-files/gen-markup-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['SALES'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.salesEngine;
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
const A = E.solve([['cost', 100], ['markup', 50]]);            // 100 + 50% markup
const B = E.solve([['cost', 80], ['price', 100]]);             // 80 -> 100
const C = E.solve([['price', 100], ['margin', 40]]);           // 40% margin on 100
const D = E.solve([['cost', 100], ['price', 80]]);             // loss
const LONE = E.solve([['margin', 25]]);                        // 25% margin -> markup
const lad = E.ladder(0, 'mu');
const tbl = '<table class="dtable"><thead><tr><th>Markup</th><th>Margin</th></tr></thead><tbody>' + lad.map((r) => '<tr><td>' + r.x + '%</td><td>' + pct(r.mg) + '</td></tr>').join('') + '</tbody></table>';
const tbl2 = '<table class="dtable"><thead><tr><th>Example</th><th>Selling price</th><th>Markup</th><th>Margin</th></tr></thead><tbody>' +
  [['Cost $100, markup 50%', A], ['Cost $80, sold at $100', B], ['Sold at $100, margin 40%', C], ['Cost $100, sold at $80', D]].map((x) => '<tr><td>' + x[0] + '</td><td>' + money(x[1].p) + '</td><td>' + pct(x[1].mu) + '</td><td>' + pct(x[1].mg) + '</td></tr>').join('') + '</tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The formulas are the ones stated on the pages of Corporate Finance Institute (markup = (selling price − cost) ÷ cost × 100), Omnicalculator’s markup calculator (selling price = cost × (1 + markup)), CalculatorSoup (selling price = cost ÷ (1 − margin)) and calculator.net’s margin calculator (margin = profit ÷ revenue); all four opened 2026-11-07. Everything else on this page is arithmetic done by the calculator itself, which you can check with the examples.</li>
          <li>Discount, sales tax and fees (under Go advanced) are applied in this order: the discount comes off the selling price first, then tax and fees are charged on the discounted price. That is this page’s own convention, not a rule from a source. Tax and VAT are passed on to the customer, so they never change your profit.</li>
          <li>The currency selector only changes the symbol and the number of decimals; nothing is converted.</li>
          <li>Not used because I found no source for them: “typical markup” or “good margin” benchmarks by industry.</li>
        </ul>
        <p><small>For information only. Check your own costs, taxes and fees before you set a price.</small></p>`;

const P = {
  slug: 'markup-calculator', name: 'Markup Calculator', menu: 'Markup', body: 'p-bmr p-mk',
  title: 'Markup Calculator — Markup %, Margin & Selling Price',
  desc: 'Markup calculator: type any two of cost, selling price, profit, markup or margin and get the rest, with markup and margin shown side by side. Any currency.',
  h1: 'Markup Calculator', eyebrow: 'Cost, selling price, profit, markup and margin · type any two · any currency',
  lead: `Type any <strong>two</strong> of <strong>cost</strong>, <strong>selling price</strong>, <strong>profit</strong>, <strong>markup</strong> and <strong>margin</strong> — the other three fill in, and two bars show why a <strong>${pct(A.mu)} markup is only a ${pct(A.mg)} margin</strong>. A cost of <strong>${money(A.c)}</strong> with a ${pct(A.mu)} markup sells at <strong>${money(A.p)}</strong>.`,
  schema: 'Free markup calculator: type any two of cost, selling price, profit, markup percent and margin percent and get the other three, with markup and margin shown side by side on one bar, a markup-to-margin ladder you can click, and units, sales tax or VAT, fees and discount under Go advanced. Works in any currency.',
  llms: 'Free markup calculator in any currency: type any two of cost, selling price, profit, markup and margin and get the rest, markup and margin side by side, a clickable markup and margin ladder, plus units, tax or VAT, fees and discount.',
  card: 'Type any two of cost, price, profit, markup or margin and get the rest, with markup and margin shown side by side. Any currency.',
  faqs: [
    ['What is markup?', 'Markup is the profit on a sale as a percentage of what the item cost you. If you pay ' + money(A.c) + ' and sell at ' + money(A.p) + ', the profit is ' + money(A.pr) + ', which is a ' + pct(A.mu) + ' markup.'],
    ['What is the markup formula?', 'Markup % = (selling price − cost) ÷ cost × 100. The other way round, selling price = cost × (1 + markup ÷ 100). For a cost of ' + money(A.c) + ' and a ' + pct(A.mu) + ' markup, the selling price is ' + money(A.p) + '.'],
    ['How do I calculate the selling price from cost and markup?', 'Multiply the cost by 1 plus the markup as a decimal. A cost of ' + money(A.c) + ' with a ' + pct(A.mu) + ' markup gives ' + money(A.c) + ' × 1.5 = ' + money(A.p) + '. In the calculator, type the cost and the markup and the selling price fills in.'],
    ['What is the difference between markup and margin?', 'Both measure the same profit, but markup divides it by the cost and margin divides it by the selling price. On a sale at ' + money(A.p) + ' with a ' + money(A.c) + ' cost the profit is ' + money(A.pr) + ': ' + pct(A.mu) + ' of the cost (markup) but only ' + pct(A.mg) + ' of the selling price (margin). For any profit the margin is the smaller number.'],
    ['How do I convert margin to markup?', 'Markup % = margin ÷ (100 − margin) × 100. A ' + pct(LONE.mg) + ' margin is a ' + pct(LONE.mu) + ' markup. In the calculator, type only the margin and the markup appears; type only the markup and you get the margin.'],
    ['How do I convert markup to margin?', 'Margin % = markup ÷ (100 + markup) × 100. A ' + pct(A.mu) + ' markup is a ' + pct(A.mg) + ' margin, and a 100% markup is a 50% margin.'],
    ['Can a markup be more than 100%?', 'Yes. A markup of 100% doubles the cost, and a markup of 200% triples it. Margin can never reach 100%, because that would need a cost of zero, so the calculator does not accept it.'],
    ['What if I sell below cost?', 'The markup and margin turn negative. A cost of ' + money(D.c) + ' sold at ' + money(D.p) + ' loses ' + money(-D.pr) + ': a ' + pct(D.mu) + ' markup and a ' + pct(D.mg) + ' margin. The calculator allows negative values, and the bars show the loss in red.'],
    ['Do sales tax, VAT and fees change my markup?', 'Sales tax and VAT are paid by the customer and passed on, so they do not change your profit; the calculator shows what the customer pays. Fees and discounts do reduce your profit: under Go advanced, type them in and the table shows your net profit, net markup and net margin. The discount comes off first, then tax and fees are charged on the discounted price.'],
    ['Does the currency selector convert my numbers?', 'No. It only changes the symbol and the decimals shown. Type your numbers in the currency you use.']
  ],
  pills: [['/profit-margin-calculator/', 'Profit Margin Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 12V3M12 12l7 6"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'], ['/percentage-change-calculator/', 'Percentage Change Calculator', '<path d="M4 17l6-6 4 4 6-8"/>'], ['/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/ratio-calculator/', 'Ratio Calculator', '<path d="M5 9h14M5 15h14"/>']]
};

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
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

  const curSel = `<div class="csel sl-cur" id="mkCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
  const input = `
        <div class="sl-head"><h2 class="card-h2">Your numbers</h2>${curSel}</div>
        <p class="mk-intro">Type any two of these five — the other three fill in. The cost stays put; any other third value replaces the one before it.</p>
        <div id="mkFields">
          ${tfld('mkCost', 'Cost', '$ · what you pay', 'e.g. 100')}
          ${tfld('mkPrice', 'Selling price', '$ · what they pay', 'e.g. 150')}
          ${tfld('mkProfit', 'Profit', '$ · price − cost', 'e.g. 50')}
          ${tfld('mkMarkup', 'Markup', '% · profit ÷ cost', 'e.g. 50')}
          ${tfld('mkMargin', 'Margin', '% · profit ÷ price', 'e.g. 33.3')}
          <div class="res-hint" id="mkHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        </div>
        <p class="av-note" id="mkFrom" style="display:none"></p>
        <div id="mkAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${tfld('mkQty', 'Units', 'how many you sell · optional', 'e.g. 100')}
          <p class="av-note" id="mkQtyNote"></p>
          ${tfld('mkDisc', 'Discount', '% off the price · optional', 'e.g. 10')}
          <p class="av-note" id="mkDiscNote"></p>
          ${tfld('mkTax', 'Sales tax / VAT', '% on the price · optional', 'e.g. 8.5')}
          <p class="av-note" id="mkTaxNote"></p>
          ${tfld('mkFee', 'Fees', '% of the price · optional', 'e.g. 2.9')}
          <p class="av-note" id="mkFeeNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="mkClear" type="button">Clear fields</button>
          <button class="advbtn" id="mkAdvBtn" type="button">
            <span id="mkAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="mkLab">Answer</div>
          <div class="res-big"><span id="mkBig">—</span></div>
          <div class="res-sub" id="mkSub" data-empty="Type any two of cost, selling price, profit, markup or margin.">Type any two of cost, selling price, profit, markup or margin.</div>
        </div>
        <div id="mkBody" style="display:none">
          <p class="res-tip adv-tip" id="mkTip"></p>
          <div id="mkBarsWrap" style="display:none">
            <p class="bm-h">The same sale, two percentages</p>
            <div id="mkBars"></div>
          </div>
          <div class="mk-lad-head"><p class="bm-h">Markup and margin ladder</p><div class="seg" id="mkLadMode" role="group" aria-label="Ladder by"><button class="on" type="button" data-v="mu">By markup</button><button type="button" data-v="mg">By margin</button></div></div>
          <table class="dtable" id="mkLad"></table>
          <p class="cb-note" id="mkLadNote"></p>
          <div id="mkAdvWrap" style="display:none">
            <p class="bm-h">In practice, with your extras</p>
            <table class="dtable" id="mkAdvTbl"></table>
            <p class="cb-note">The discount comes off first; tax and fees are charged on the discounted price. Tax is passed on to the customer, so it does not change your profit.</p>
          </div>
          <p class="cb-note">Markup divides the profit by the cost; margin divides the same profit by the selling price. That is why the margin is always the smaller number for a profit.</p>
          <button class="btn" id="mkCopy" type="button" data-copy="mkBig,mkSub,mkTip" style="margin-top:6px">Copy results</button>
        </div>`;
  const left = `
        <h2>How to use the markup calculator</h2>
        <p>Type any <strong>two</strong> of the five boxes — <strong>cost</strong>, <strong>selling price</strong>, <strong>profit</strong>, <strong>markup</strong> or <strong>margin</strong> — and the other three fill in. The line under the boxes says which two were used. Type a third value and it replaces the other one you typed, never the cost, so changing the profit, markup or margin moves the selling price.</p>
        <p>Only a markup or a margin? Type just that one and you get the other (margin to markup, or markup to margin). Click any row of the ladder to use that markup or margin. Open <strong>Go advanced</strong> for units, a discount, sales tax or VAT and fees; the table shows your net profit.</p>

        <h2>The formulas</h2>
        <div class="formula">
          markup % = (price − cost) ÷ cost × 100
          <small>MARGIN % = (PRICE − COST) ÷ PRICE × 100</small>
        </div>
        <p>To go the other way: selling price = cost × (1 + markup ÷ 100), or cost ÷ (1 − margin ÷ 100).</p>
        <p>Examples, all worked out by this calculator:</p>
        ${tbl2}`;
  const right = `
        <h2>Markup versus margin</h2>
        <p>Markup and margin describe the same profit with a different base. A cost of ${money(A.c)} sold at ${money(A.p)} earns ${money(A.pr)}: that is ${pct(A.mu)} of the cost (the markup) but ${pct(A.mg)} of the selling price (the margin). Mixing them up is the usual mistake: a 50% margin needs a 100% markup, not 50%.</p>
        <h2>Markup to margin</h2>
        ${tbl}

        <h2>Related tools</h2>
        <p>To turn a cost and your other costs into gross, operating and net margin use the <a href="/profit-margin-calculator/">profit margin calculator</a>, to work out a percentage of a number use the <a href="/percentage-calculator/">percentage calculator</a>, to see how much a price rose or fell the <a href="/percentage-change-calculator/">percentage change calculator</a>, and to add tax to a price the <a href="/sales-tax-calculator/">sales tax calculator</a>.</p>
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
    <span class="mbar-lab" id="mkMLab">Answer</span>
    <div class="mbar-vals"><b id="mkMVal">—</b></div>
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
<script>CalcThis.initMarkupCalc();</script>
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
const prev = { slug: 'salary-calculator', menu: 'Salary', name: 'Salary Calculator', llms: 'Salary Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><rect x="4" y="18" width="7" height="9" rx="1.5" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><rect x="14" y="12" width="7" height="15" rx="1.5" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M6 11l8-6 6 3 7-5" stroke="#37503F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="/salary-calculator/">', () => card + '    <a class="calc" href="/salary-calculator/">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — cost, price, profit, markup and margin: type any two, get the rest</span></li>\n');
    return h;
  });
}
