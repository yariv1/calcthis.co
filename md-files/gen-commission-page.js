const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /commission-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.salesEngine + CalcThis.commissionEngine. Run: node md-files/gen-commission-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['SALES', 'COMMISSION'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const C = CalcThis.commissionEngine;
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
const TIERS = [{ to: 20000, k: 'pct', v: 3 }, { to: 25000, k: 'pct', v: 5 }, { to: Infinity, k: 'pct', v: 10 }];
const sgM = C.segs(TIERS, false), sgW = C.segs(TIERS, true);
const S1 = 27000, GM = C.gross(sgM, S1), GW = C.gross(sgW, S1);
const FLAT = 200000 * 3 / 100;
const BASE = 500 + 25000 * 1.5 / 100;
const O = { base: 0, share: 70, fee: 2, fix: 0 }, CH = C.chain(6000, O);
const GOAL = Math.ceil(5000 / 0.03 * 100 - 1e-7) / 100;
const ITEMS = 12 * 25;
const tblEx = '<table class="dtable"><thead><tr><th>Plan</th><th>Sales</th><th>Commission</th></tr></thead><tbody>' + [
  ['3% of sales', money(200000), money(FLAT)],
  ['$500 base + 1.5% of sales', money(25000), money(BASE)],
  ['Tiers 3% / 5% / 10%, each slice at its rate', money(S1), money(GM)],
  ['Tiers 3% / 5% / 10%, whole sale at the reached rate', money(S1), money(GW)],
  ['$25 per item, 12 items', '12 items', money(ITEMS)]
].map((r) => '<tr><td>' + r.join('</td><td>') + '</td></tr>').join('') + '</tbody></table>';
const tblTier = '<table class="dtable"><thead><tr><th>Slice of the ' + money(S1) + '</th><th>Rate</th><th>Commission</th></tr></thead><tbody>' + sgM.map((s) => '<tr><td>' + money(s.from) + ' to ' + money(Math.min(S1, s.to)) + '</td><td>' + pct(s.v) + '</td><td>' + money(C.slice(s, S1)) + '</td></tr>').join('') + '<tr><td><strong>Total</strong></td><td></td><td><strong>' + money(GM) + '</strong></td></tr></tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The formulas — commission = sales × rate ÷ 100, the rate = commission ÷ sales × 100, a base amount added to the commission, tiered commission where each slice of sales earns its own rate (20,000 × 3% + 5,000 × 5% + 2,000 × 10% = 1,050), a percent taken from the seller's proceeds or added on top for the buyer, and fees and a fixed deduction taken from the gross commission — are the ones stated on the pages of calculator.net's commission and tiered commission calculators, Omnicalculator's commission calculator, Inch Calculator's real estate commission calculator, GigaCalculator's commission calculator and Yotpo's commission calculator, all opened 2026-11-08. Everything else on this page is arithmetic done by the calculator itself, which you can check with the examples.</li>
          <li>Conventions used here, which are this page's choice and not a rule: a tier covers the sales above its start up to and including its “up to” limit; a flat-amount tier pays its full amount once your sales are above its start; your share is taken first, then fees as a percent of your share, then the fixed deduction, and base pay is added at the end and is never split. No commission rate is quoted as normal for any industry — type the rate in your own agreement.</li>
          <li>The currency selector only changes the symbol and the number of decimals; nothing is converted.</li>
        </ul>
        <p><small>For information only. Your pay plan or contract decides what you are actually paid.</small></p>`;

const P = {
  slug: 'commission-calculator', name: 'Commission Calculator', menu: 'Commission', body: 'p-bmr p-cm',
  title: 'Commission Calculator — Sales, Tiered & Split Commission',
  desc: 'Commission calculator: any two of sales, rate and commission, tiered and per-item plans, base pay, split, fees, take-home and sales needed. Any currency.',
  h1: 'Commission Calculator', eyebrow: 'Sales commission, tiered plans and your take-home · the sales you need for a goal · any currency',
  lead: `Type any <strong>two</strong> of the <strong>sales</strong>, the <strong>commission rate</strong> or the <strong>commission</strong> — the third fills in. <strong>${pct(3)} of ${money(200000)}</strong> is <strong>${money(FLAT)}</strong>. Pick a tiered plan to see each slice of your sales earn its own rate, add a base pay, a split and fees to see what you take home, and type a goal to see the sales you need.`,
  schema: 'Free commission calculator: type any two of sales, commission rate and commission for the third; tiered plans where each slice of sales earns its own rate or the reached tier pays on all sales; a flat amount per item; several sales added up; base pay, your share of a split, fees and a fixed deduction to see your take-home; who pays (seller or buyer); and the sales you need to reach a take-home goal. Works in any currency.',
  llms: 'Free commission calculator in any currency: any two of sales, rate and commission fill the third, tiered plans (each slice or whole sale), flat amount per item, base pay, split, fees, take-home, who pays and the sales needed for a goal.',
  card: 'Commission from sales and rate, tiered and per-item plans, base pay, split and fees, and the sales you need for a goal. Any currency.',
  faqs: [
    ['How do I calculate commission?', 'Multiply the sales by the commission rate and divide by 100. ' + pct(3) + ' of ' + money(200000) + ' is ' + money(FLAT) + '. In the calculator, type the sales and the rate and the commission fills in.'],
    ['How do I find the commission rate?', 'Commission rate = commission ÷ sales × 100. A commission of ' + money(1500) + ' on ' + money(50000) + ' of sales is ' + pct(3) + '. Type the sales and the commission and the rate appears.'],
    ['How does a tiered commission work?', 'Each slice of your sales earns the rate of the tier it falls in. With ' + pct(3) + ' up to ' + money(20000) + ', ' + pct(5) + ' from there to ' + money(25000) + ' and ' + pct(10) + ' above, sales of ' + money(S1) + ' earn ' + money(GM) + ': only the ' + money(2000) + ' above ' + money(25000) + ' earns ' + pct(10) + '. Choose “Tiered — each slice at its own rate”, type the limits and rates and the bar shows every slice.'],
    ['What if the whole sale is paid at the rate of the tier I reach?', 'Some plans pay one rate on all your sales, decided by the tier your total reaches. The same ' + money(S1) + ' of sales then earns ' + pct(10) + ' of everything, which is ' + money(GW) + '. Choose “Tiered — whole sale at the reached rate” to compare the two plans on the same sales.'],
    ['How do I add a base salary to commission?', 'Open Go advanced and type the base pay. It is added after the commission and any deductions: ' + money(500) + ' base plus ' + pct(1.5) + ' of ' + money(25000) + ' is ' + money(BASE) + ' in total pay.'],
    ['How do I work out my take-home after a split and fees?', 'Open Go advanced. Type your share of the commission, the fees as a percent of your share and any fixed deduction. A ' + money(6000) + ' commission with a ' + pct(70) + ' share and ' + pct(2) + ' fees leaves you ' + money(CH.net) + ' (' + money(CH.mine) + ' share, ' + money(CH.feeA) + ' fees).'],
    ['How much do I need to sell to earn a goal?', 'Type the amount you want to take home under “Take-home goal” in Go advanced. At ' + pct(3) + ' with nothing else deducted, ' + money(5000) + ' takes ' + money(GOAL) + ' of sales. With tiers, the calculator finds the smallest sales that reach the goal.'],
    ['Who pays the commission, the seller or the buyer?', 'Usually the seller: the commission comes out of the price, so the seller keeps the price minus the commission. Sometimes the buyer pays it on top, so the buyer pays the price plus the commission. Choose which in Go advanced and the page shows both totals.'],
    ['Can I add several sales together?', 'Yes. Open Go advanced and use “More sales” to add up to six extra sales; they are added to the sales above and the tiers, if you use them, work on the total.'],
    ['Does the currency selector convert my numbers?', 'No. It only changes the symbol and the decimals shown. Type your numbers in the currency you use.']
  ],
  pills: [['/discount-calculator/', 'Discount Calculator', '<path d="M5 6h12l10 10-10 10L5 16z" transform="scale(.75)"/><circle cx="9" cy="9" r="1.5"/>'], ['/markup-calculator/', 'Markup Calculator', '<path d="M4 17l6-6 4 4 6-8"/><path d="M15 7h5v5"/>'], ['/salary-calculator/', 'Salary Calculator', '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>']]
};

const tfld = (id, label, unit, ph, mode, extra) => `<label class="fld"${extra || ''} for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const plus = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const PLANS = [['pct', 'Percent of sales'], ['tier', 'Tiered — each slice at its own rate'], ['whole', 'Tiered — whole sale at the reached rate'], ['item', 'Flat amount per item sold']];

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

  const curSel = `<div class="csel sl-cur" id="cmCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
  const planSel = `<div class="fld"><span class="lab">Commission plan</span><div class="csel" id="cmPlan" data-value="pct" aria-label="Commission plan"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${PLANS[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${PLANS.map((o, i) => `<button type="button" class="csel-opt${i === 0 ? ' on' : ''}" role="option" aria-selected="${i === 0}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
  const input = `
        <div class="sl-head"><h2 class="card-h2">Your sale</h2>${curSel}</div>
        ${planSel}
        <div id="cmFields">
          ${tfld('cmSales', 'Sales', '$ · total sold', 'e.g. 50000', 'decimal', ' id="cmSalesFld"')}
          <div id="cmPctBox">
            ${tfld('cmRate', 'Commission rate', '% · of sales', 'e.g. 3')}
            ${tfld('cmComm', 'Commission', '$ · you earn', 'e.g. 1500')}
          </div>
          <div id="cmTierBox" style="display:none">
            <p class="cm-sech">Your tiers</p>
            <div id="cmTiers"></div>
            <div class="add-row"><button class="btn" id="cmTierAdd" type="button">${plus} Add a tier</button></div>
            <p class="av-note" id="cmTierNote"></p>
          </div>
          <div id="cmItemBox" style="display:none">
            ${tfld('cmItems', 'Items sold', 'how many', 'e.g. 12')}
            ${tfld('cmPer', 'Commission per item', '$ · each', 'e.g. 25')}
          </div>
          <div class="res-hint" id="cmHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        </div>
        <p class="av-note" id="cmFrom" style="display:none"></p>
        <div id="cmAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="cmMoreWrap">
            <p class="cm-sech">More sales <span>· optional</span></p>
            <div id="cmMore"></div>
            <div class="add-row"><button class="btn" id="cmMoreAdd" type="button">${plus} Add another sale</button></div>
            <p class="av-note" id="cmMoreNote"></p>
          </div>
          <div class="proj-sep"></div>
          ${tfld('cmBase', 'Base pay', '$ · added on top · optional', 'e.g. 500')}
          <p class="av-note" id="cmBaseNote"></p>
          ${tfld('cmShare', 'Your share', '% · of the commission · optional', 'e.g. 70')}
          <p class="av-note" id="cmShareNote"></p>
          ${tfld('cmFee', 'Fees', '% · of your share · optional', 'e.g. 2')}
          <p class="av-note" id="cmFeeNote"></p>
          ${tfld('cmFix', 'Fixed deduction', '$ · draw or expense · optional', 'e.g. 100')}
          <p class="av-note" id="cmFixNote"></p>
          <div class="fld" id="cmWhoFld"><span class="lab">Who pays the commission</span><div class="seg" id="cmWho" role="group" aria-label="Who pays the commission"><button class="on" type="button" data-v="seller">Seller</button><button type="button" data-v="buyer">Buyer</button></div></div>
          <p class="av-note" id="cmWhoNote"></p>
          <div class="proj-sep"></div>
          ${tfld('cmGoal', 'Take-home goal', '$ · total pay you want · optional', 'e.g. 5000')}
          <p class="av-note" id="cmGoalNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="cmClear" type="button">Clear fields</button>
          <button class="advbtn" id="cmAdvBtn" type="button">
            <span id="cmAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="cmLab">Commission</div>
          <div class="res-big"><span id="cmBig">—</span></div>
          <div class="res-sub" id="cmSub">Type any two of sales, commission rate and commission.</div>
        </div>
        <div id="cmBody" style="display:none">
          <p class="res-tip adv-tip" id="cmTip"></p>
          <p class="res-tip adv-tip" id="cmGoalTip" style="display:none"></p>
          <div id="cmBarsWrap" style="display:none">
            <p class="bm-h">Where your sales go</p>
            <div id="cmBars"></div>
          </div>
          <div id="cmStepWrap" style="display:none">
            <p class="bm-h">From sales to take-home</p>
            <table class="dtable" id="cmStep"></table>
          </div>
          <div id="cmLadWrap" style="display:none">
            <p class="bm-h">What other sales would earn</p>
            <table class="dtable" id="cmLad"></table>
            <p class="cb-note" id="cmLadNote"></p>
          </div>
        </div>`;
  const left = `
        <h2>How to use the commission calculator</h2>
        <p>With <strong>Percent of sales</strong> selected, type any <strong>two</strong> of the three boxes — <strong>sales</strong>, <strong>commission rate</strong> or <strong>commission</strong> — and the third fills in. The line under the boxes says which two were used. Type a third value and it replaces the oldest one, never the sales.</p>
        <p>Paid on tiers? Choose <strong>Tiered — each slice at its own rate</strong> (each slice of your sales earns the rate of its tier) or <strong>Tiered — whole sale at the reached rate</strong> (the tier your total reaches sets the rate for all of it), type each tier's limit and a percent or a flat amount, and the bar shows every slice. <strong>Flat amount per item sold</strong> multiplies the items by your amount.</p>
        <p>Open <strong>Go advanced</strong> to add more sales, a base pay, your share of a split, fees, a fixed deduction, who pays the commission and a take-home goal — the sales you need to reach it.</p>

        <h2>The formulas</h2>
        <div class="formula">
          commission = sales × commission rate ÷ 100
          <small>RATE = COMMISSION ÷ SALES × 100</small>
        </div>
        <p>With a base pay: total pay = base + commission. Tiered, each slice: commission = Σ (sales inside the tier × its rate). Examples, all worked out by this calculator:</p>
        ${tblEx}`;
  const right = `
        <h2>Tiered commission, slice by slice</h2>
        <p>With ${pct(3)} up to ${money(20000)}, ${pct(5)} from ${money(20000)} to ${money(25000)} and ${pct(10)} above ${money(25000)}, sales of ${money(S1)} earn ${money(GM)}. Only the ${money(2000)} above ${money(25000)} earns ${pct(10)}:</p>
        ${tblTier}
        <p>If the same plan paid the rate of the tier you reach on all sales, the ${money(S1)} would earn ${pct(10)} of everything: ${money(GW)}. Plans differ in this, so check your agreement and compare both in the calculator.</p>
        <h2>From commission to take-home</h2>
        <p>Your pay is often less than the commission. A ${money(6000)} commission with a ${pct(70)} share, ${pct(2)} fees and no other deduction leaves ${money(CH.net)}: ${money(CH.mine)} after the split minus ${money(CH.feeA)} in fees. Add a base pay and the total pay shows next to it.</p>
        <h2>How much do I need to sell?</h2>
        <p>Type what you want to take home. At ${pct(3)} with nothing deducted, ${money(5000)} takes ${money(GOAL)} of sales. For tiers the calculator searches your tiers for the smallest sales that reach the goal.</p>

        <h2>Related tools</h2>
        <p>To take a percent off a price use the <a href="/discount-calculator/">discount calculator</a>, to set a selling price from a cost the <a href="/markup-calculator/">markup calculator</a>, to turn an hourly rate into a yearly pay the <a href="/salary-calculator/">salary calculator</a>, to work out a percentage of a number the <a href="/percentage-calculator/">percentage calculator</a>, and for a home sale the <a href="/realtor-commission-calculator/">realtor commission calculator</a>.</p>
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
    <span class="mbar-lab" id="cmMLab">Commission</span>
    <div class="mbar-vals"><b id="cmMVal">—</b></div>
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
<script>CalcThis.initCommissionCalc();</script>
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
const prev = { slug: 'discount-calculator', menu: 'Discount', name: 'Discount Calculator', llms: 'Discount Calculator' };
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — sales commission, tiered plans, split and fees, take-home and the sales you need</span></li>\n');
    return h;
  });
}
