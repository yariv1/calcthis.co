const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /realtor-commission-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.salesEngine + CalcThis.commissionEngine + CalcThis.realtorEngine. Run: node md-files/gen-realtor-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['SALES', 'COMMISSION', 'REALTOR'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const RE = CalcThis.realtorEngine;
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
const OA = RE.outcome(300000, 6, 'seller', null, 0, 0);          // 6% of 300,000 = 18,000 (Inch Calculator's example)
const OB = RE.outcome(300000, 6, 'seller', null, 2, 150000);     // closing costs 2%, payoff 150,000
const OC = RE.outcome(300000, 6, 'shared', null, 0, 0);          // shared, blank = half
const OD = RE.outcome(300000, 6, 'buyer', null, 0, 0);
const half = OA.C * 50 / 100, kept = half * 70 / 100;
const tblEx = '<table class="dtable"><thead><tr><th>Who pays the ' + pct(6) + ' on ' + money(300000) + '</th><th>Seller pays</th><th>Buyer pays in total</th></tr></thead><tbody>' + [
  ['The seller', money(OA.Cs), money(300000 + OA.Cb)],
  ['The buyer', money(OD.Cs), money(OD.buyerTotal)],
  ['Shared, half each', money(OC.Cs), money(OC.buyerTotal)]
].map((r) => '<tr><td>' + r.join('</td><td>') + '</td></tr>').join('') + '</tbody></table>';
const tblKeep = '<table class="dtable"><thead><tr><th>You sell for ' + money(300000) + '</th><th>Amount</th></tr></thead><tbody>' + [
  ['Commission (' + pct(6) + ')', '−' + money(OB.Cs)], ['Closing costs (' + pct(2) + ')', '−' + money(OB.Cc)], ['Mortgage payoff', '−' + money(150000)], ['<strong>You keep</strong>', '<strong>' + money(OB.net) + '</strong>']
].map((r) => '<tr><td>' + r.join('</td><td>') + '</td></tr>').join('') + '</tbody></table>';
const tblLad = '<table class="dtable"><thead><tr><th>Commission rate</th><th>Commission</th><th>You keep</th></tr></thead><tbody>' + RE.RATES.map((x) => { const o = RE.outcome(300000, x, 'seller', null, 0, 0); return '<tr><td>' + x + '%</td><td>' + money(o.C) + '</td><td>' + money(o.net) + '</td></tr>'; }).join('') + '</tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The formula — commission = sale price × commission rate, usually paid by the seller and taken out of the sale at closing, with the commission shared between the listing agent and the buyer's agent — is the one stated on the pages of Omnicalculator's real estate commission calculator (opened 2026-11-08), Inch Calculator's real estate commission calculator (6% of ${money(300000)} is ${money(18000)}; closing costs as a percent of the price; amount to the seller) and GigaCalculator's commission calculator (who pays: seller, buyer or both), all opened 2026-11-08. Everything else on this page is arithmetic done by the calculator itself, which you can check with the examples.</li>
          <li>The rates people quote are not a rule: Omnicalculator says commissions most often fall between 4% and 6% of the sale price and Inch Calculator cites 5% to 6% (attributed to Redfin). These are secondary sources, read on those pages, and this calculator does not assume any rate — type the rate in your own listing agreement.</li>
          <li>Conventions used here, which are this page's choice and not a rule: with “Shared” the seller pays the percent you type and a blank means half each; closing costs are a percent of the price; the listing agent's share and the brokerage split are only the percents you type; you keep the price minus your part of the commission, the closing costs and the mortgage payoff, before any other cost of selling.</li>
          <li>The currency selector only changes the symbol and the number of decimals; nothing is converted.</li>
        </ul>
        <p><small>For information only. Your listing agreement and closing statement show what you will actually pay.</small></p>`;

const P = {
  slug: 'realtor-commission-calculator', name: 'Realtor Commission Calculator', menu: 'Realtor Commission', body: 'p-bmr p-cm p-rt',
  title: 'Realtor Commission Calculator — Net Proceeds & Agent Split',
  desc: 'Realtor commission calculator: any two of home price, rate and commission, who pays, the agents’ split, closing costs and mortgage payoff for what you keep.',
  h1: 'Realtor Commission Calculator', eyebrow: 'Real estate commission and what you keep · who pays · agent split · any currency',
  lead: `Type any <strong>two</strong> of the <strong>home price</strong>, the <strong>commission rate</strong> or the <strong>commission</strong> — the third fills in. <strong>${pct(6)} of ${money(300000)}</strong> is <strong>${money(OA.C)}</strong>. Open Go advanced to choose who pays, split it between the agents, add closing costs and the mortgage payoff, and see what you keep.`,
  schema: 'Free realtor and real estate commission calculator: type any two of home price, commission rate and commission for the third; who pays (seller, buyer or shared); the listing and buyer’s agent split and an agent’s brokerage split; closing costs and mortgage payoff for the amount the seller keeps. Works in any currency.',
  llms: 'Free realtor and real estate commission calculator in any currency: any two of home price, rate and commission fill the third, who pays, agent split, closing costs, mortgage payoff and what the seller keeps.',
  card: 'Real estate commission from the home price and rate, who pays, the agents’ split, closing costs and what you keep after the mortgage.',
  faqs: [
    ['How do I calculate a realtor commission?', 'Multiply the home price by the commission rate and divide by 100. ' + pct(6) + ' of ' + money(300000) + ' is ' + money(OA.C) + '. In the calculator, type the home price and the rate and the commission fills in.'],
    ['How much do realtors charge?', 'The rate is negotiable and set in your listing agreement. Omnicalculator says most commissions fall between 4% and 6% of the sale price and Inch Calculator cites 5% to 6% (attributed to Redfin); the calculator assumes no rate, so type yours and compare other rates in the table.'],
    ['Who pays the real estate commission?', 'Usually the seller: it is taken out of the sale at closing, so the buyer pays only the price. Choose “Buyer” in Go advanced to see the commission added on top, or “Shared” to split it. On ' + money(300000) + ' at ' + pct(6) + ' a shared commission is ' + money(OC.Cs) + ' for the seller and ' + money(OC.Cb) + ' for the buyer.'],
    ['How is the commission split between the agents?', 'The commission is divided between the listing agent and the buyer’s agent. Type the listing agent’s share in Go advanced: at 50% a ' + money(OA.C) + ' commission is ' + money(half) + ' for each agent. Your agreement sets the real split.'],
    ['How much does an agent keep after the brokerage split?', 'Type the percent the agent keeps. If an agent’s side of ' + money(half) + ' is split ' + pct(70) + ', the agent keeps ' + money(kept) + '.'],
    ['How much will I keep after commission, closing costs and my mortgage?', 'Take the sale price, subtract your part of the commission, the closing costs and the mortgage payoff. Selling for ' + money(300000) + ' with a ' + pct(6) + ' commission, ' + pct(2) + ' closing costs and a ' + money(150000) + ' payoff leaves ' + money(OB.net) + '.'],
    ['What does each 1% of commission cost?', '1% of the price. On a ' + money(300000) + ' home each 1% is ' + money(3000) + ', so the difference between 5% and 6% is ' + money(3000) + '. The table in the calculator shows the commission and what you keep for 1% to 7%.'],
    ['Does the currency selector convert my numbers?', 'No. It only changes the symbol and the decimals shown. Type your numbers in the currency you use.']
  ],
  pills: [['/commission-calculator/', 'Commission Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 16l8-8"/>'], ['/mortgage-calculator/', 'Mortgage Calculator', '<path d="M3 11l9-7 9 7"/><path d="M5 10v9h14v-9"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'], ['/discount-calculator/', 'Discount Calculator', '<path d="M4 17l6-6 4 4 6-8"/>']]
};

const tfld = (id, label, unit, ph, extra) => `<label class="fld"${extra || ''} for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></label>`;
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

  const curSel = `<div class="csel sl-cur" id="rtCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
  const input = `
        <div class="sl-head"><h2 class="card-h2">The sale</h2>${curSel}</div>
        <div id="rtFields">
          ${tfld('rtPrice', 'Home price', '$ · what it sells for', 'e.g. 300000')}
          ${tfld('rtRate', 'Commission rate', '% · of the price', 'e.g. 6')}
          ${tfld('rtComm', 'Commission', '$ · in total', 'e.g. 18000')}
          <div class="res-hint" id="rtHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        </div>
        <p class="av-note" id="rtFrom" style="display:none"></p>
        <div id="rtAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="fld"><span class="lab">Who pays the commission</span><div class="seg" id="rtWho" role="group" aria-label="Who pays the commission"><button class="on" type="button" data-v="seller">Seller</button><button type="button" data-v="buyer">Buyer</button><button type="button" data-v="shared">Shared</button></div></div>
          <p class="av-note" id="rtWhoNote"></p>
          <div id="rtSharedFld" style="display:none">
            ${tfld('rtSp', 'Seller’s share', '% · of the commission · optional', 'e.g. 50')}
            <p class="av-note" id="rtSpNote"></p>
          </div>
          ${tfld('rtList', 'Listing agent’s share', '% · of the commission · optional', 'e.g. 50')}
          <p class="av-note" id="rtListNote"></p>
          ${tfld('rtBrok', 'Agent’s split', '% · the agent keeps · optional', 'e.g. 70')}
          <p class="av-note" id="rtBrokNote"></p>
          <div class="proj-sep"></div>
          ${tfld('rtClose', 'Closing costs', '% · of the price · optional', 'e.g. 2')}
          <p class="av-note" id="rtCloseNote"></p>
          ${tfld('rtPay', 'Mortgage payoff', '$ · still owed · optional', 'e.g. 150000')}
          <p class="av-note" id="rtPayNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="rtClear" type="button">Clear fields</button>
          <button class="advbtn" id="rtAdvBtn" type="button">
            <span id="rtAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="rtLab">Commission</div>
          <div class="res-big"><span id="rtBig">—</span></div>
          <div class="res-sub" id="rtSub">Type any two of home price, commission rate and commission.</div>
        </div>
        <div id="rtBody" style="display:none">
          <p class="res-tip adv-tip" id="rtTip"></p>
          <div id="rtBarsWrap" style="display:none">
            <p class="bm-h">Where the sale price goes</p>
            <div id="rtBars"></div>
          </div>
          <div id="rtStepWrap">
            <p class="bm-h">What you keep</p>
            <table class="dtable" id="rtStep"></table>
          </div>
          <div id="rtAgWrap" style="display:none">
            <p class="bm-h">Who gets the commission</p>
            <table class="dtable" id="rtAg"></table>
          </div>
          <div id="rtLadWrap" style="display:none">
            <p class="bm-h">What other commission rates cost</p>
            <table class="dtable" id="rtLad"></table>
            <p class="cb-note" id="rtLadNote"></p>
          </div>
        </div>`;
  const left = `
        <h2>How to use the realtor commission calculator</h2>
        <p>Type any <strong>two</strong> of the three boxes — <strong>home price</strong>, <strong>commission rate</strong> or <strong>commission</strong> — and the third fills in. The line under the boxes says which two were used. Type a third value and it replaces the oldest one, never the home price.</p>
        <p>Open <strong>Go advanced</strong> to choose <strong>who pays</strong> (the seller, the buyer or shared), to split the commission between the <strong>listing agent</strong> and the <strong>buyer’s agent</strong>, to see what an agent keeps after the <strong>brokerage split</strong>, and to add <strong>closing costs</strong> and the <strong>mortgage payoff</strong> — the table then shows what you keep.</p>

        <h2>The formula</h2>
        <div class="formula">
          commission = home price × commission rate ÷ 100
          <small>YOU KEEP = PRICE − YOUR PART OF THE COMMISSION − CLOSING COSTS − MORTGAGE PAYOFF</small>
        </div>
        <p>Who pays changes only who the money comes from. Examples, all worked out by this calculator:</p>
        ${tblEx}`;
  const right = `
        <h2>What you keep after commission, costs and mortgage</h2>
        <p>The commission is not the only thing that leaves the sale. Selling for ${money(300000)} with a ${pct(6)} commission, ${pct(2)} closing costs and a ${money(150000)} payoff:</p>
        ${tblKeep}
        <h2>What each commission rate costs</h2>
        <p>Every 1% of commission on a ${money(300000)} home is ${money(3000)}. The calculator shows 1% to 7% side by side for your price:</p>
        ${tblLad}

        <h2>Related tools</h2>
        <p>For a sales commission with tiers, a base pay or a take-home goal use the <a href="/commission-calculator/">commission calculator</a>, to see the monthly cost of a home loan the <a href="/mortgage-calculator/">mortgage calculator</a>, and to work out a percentage of a number the <a href="/percentage-calculator/">percentage calculator</a>.</p>
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
    <span class="mbar-lab" id="rtMLab">Commission</span>
    <div class="mbar-vals"><b id="rtMVal">—</b></div>
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
<script>CalcThis.initRealtorCalc();</script>
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
const prev = { slug: 'commission-calculator', menu: 'Commission', name: 'Commission Calculator', llms: 'Commission Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M5 15L16 6l11 9" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 14v11h16V14" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4" stroke-linejoin="round"/><path d="M13 22l6-6" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><circle cx="13.5" cy="17" r="1.5" fill="#37503F"/><circle cx="18.5" cy="22" r="1.5" fill="#37503F"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — real estate commission, who pays, agent split, closing costs and what you keep</span></li>\n');
    return h;
  });
}
