const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Tip phase 3: /tipping-in/canada/ (tip card + province picker), /tipping-in/italy/ (restaurant bill: coperto + servizio), /tipping-in/japan/ ("should I tip here?").
   Numbers in the text come from CalcThis.tipEngine; customs are sourced and dated on each page. Run AFTER gen-tip-page.js (reuses the generated tip card):
   node md-files/gen-tipping-in-pages.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* TIP-ENGINE:START */'), app.indexOf('/* TIP-ENGINE:END */')));
const E = CalcThis.tipEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const auto = nl(fs.readFileSync(ROOT + 'auto-loan-calculator/index.html', 'utf8'));
const hdr = auto.slice(auto.indexOf('<!--HEADER:START-->'), auto.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = auto.slice(auto.indexOf('<!--FOOTER:START-->'), auto.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = auto.slice(0, auto.indexOf('<script type="application/ld+json">'));
const hubHtml = nl(fs.readFileSync(ROOT + 'tip-calculator/index.html', 'utf8'));
const calcSeg = hubHtml.slice(hubHtml.indexOf('  <div class="grid">'), hubHtml.indexOf('  <div class="related-calcs">'));
const m = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eur = (x) => '€' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (x) => String(Math.round(x * 1000) / 1000) + '%';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const csel = (id) => `<div class="csel" id="${id}" data-value=""><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val"></span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const fld = (id, label, unit, ph) => `<div class="fld"><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></div>`;
const c = (bill, p, o) => E.calc(Object.assign({ bill, tax: 0, pct: p, people: 1, base: 'total', round: 'none', items: null }, o || {}));

const S = {
  jnto: { t: 'Japan National Tourism Organization (JNTO) — Tipping', u: 'https://www.japan.travel/en/plan/tipping-in-japan/' },
  ta: { t: 'TravelAwaits — Tipping in Italy (Catherine Ann Lombard, April 1, 2023)', u: 'https://www.travelawaits.com/2874123/tipping-in-italy-guide/' },
  calc: { t: 'Calculator.net — Tip Calculator (U.S. and Canada)', u: 'https://www.calculator.net/tip-calculator.html' },
  rc: { t: 'Research Co. — Little Consensus as Canadians Ponder Where and How Much to Tip (December 30, 2022; 1,000 adults, margin of error ±3.1 points)', u: 'https://researchco.ca/2022/12/30/tipping-canada/' },
  cra: { t: 'Canada Revenue Agency — GST/HST calculator (and rates) (modified April 1, 2025)', u: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate/calculator.html' }
};
const srcHtml = (ids, extra) => '<p class="st-src">Sources: ' + ids.map((k) => '<a href="' + S[k].u + '" rel="noopener">' + S[k].t + '</a>').join(' · ') + '. ' + (extra || '') + 'Tipping is a custom, not a rule.</p>';
const pill = (href, label, svg) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>\n        ${label}\n      </a>`;
const pills = `    <div class="pills">
${pill('/tip-calculator/', 'Tip Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/>')}
${pill('/how-much-to-tip/', 'How Much to Tip', '<path d="M5 12h14M13 6l6 6-6 6"/>')}
${pill('/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
${pill('/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 15l6-6"/>')}
    </div>`;
const jsonApp = (name, url, desc) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name, url, applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: desc, dateModified: new Date().toISOString().slice(0, 10), inLanguage: 'en-US', isAccessibleForFree: true, applicationSubCategory: 'Tip guide', isPartOf: { '@type': 'WebSite', name: 'CalcThis', url: 'https://calcthis.co/' } });
const jsonFaq = (f) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) });
const crumbs = (list) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: x[1] })) });
function head(title, desc, url) {
  return headTop
    .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">');
}
function page(o) {
  const ld = [o.app, o.faq, o.crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
  const body = `<body class="p-loan p-stax p-tip"${o.attrs || ''}>
<div class="wrap">

${hdr}

${o.hero}

${o.card}
  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
${pills}
  </div>

${o.content}

${ftr}

</div>

<script src="/assets/app.js?v=204"></script>
<script>CalcThis.${o.init}();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + 'tipping-in/' + o.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head(o.title, o.desc, o.url) + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
}
const faqHtml = (f, what) => `    <h2 style="margin-top:36px">Common questions about ${what}</h2>\n` + f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n');
const more = (self) => '<ul class="st-otherlist">' + [['canada', 'Tipping in Canada'], ['italy', 'Tipping in Italy'], ['japan', 'Tipping in Japan']].filter((x) => x[0] !== self).map((x) => '<li><a href="/tipping-in/' + x[0] + '/">' + x[1] + '</a></li>').join('') + '<li><a href="/how-much-to-tip/">How much to tip: every service</a></li><li><a href="/tip-calculator/">Tip calculator: split the bill, tip on tax or total</a></li></ul>';
const meta = {};

/* ================= CANADA ================= */
{
  const url = 'https://calcthis.co/tipping-in/canada/', title = 'Tipping in Canada: How Much to Tip + Tax Calculator';
  const on = E.province('ON'), qc = E.province('QC'), bc = E.province('BC'), ab = E.province('AB');
  const meal = (p, base) => { const t = E.r2(100 * p.rate / 100); return { tax: t, total: E.r2(100 + t), tipPre: c(100, 18).tip, tipTot: c(E.r2(100 + t), 18).tip }; };
  const provRows = E.PROVINCES.map((p) => { const r = meal(p); return '<tr><td>' + p.name + '</td><td>' + p.label + '</td><td>' + m(r.total) + '</td><td>' + m(r.tipPre) + '</td><td>' + m(r.tipTot) + '</td></tr>'; }).join('');
  const f = [
    ['How much do you tip in Canada?', `15% to 20% of the bill is the typical range at restaurants and bars, according to Calculator.net’s table for the U.S. and Canada. In a December 2022 Research Co. survey of 1,000 Canadian adults, 41% said 15% to 19% was an acceptable tip for good service at a busy sit-down restaurant and 19% said 20% or more. On a ${m(100)} bill, 15% is ${m(c(100, 15).tip)}, 18% is ${m(c(100, 18).tip)} and 20% is ${m(c(100, 20).tip)}.`],
    ['Do you tip before or after tax in Canada?', `Both are common. In Ontario, where the HST is 13%, a ${m(100)} meal costs ${m(meal(on).total)} with tax; an 18% tip is ${m(meal(on).tipPre)} on the pre-tax price and ${m(meal(on).tipTot)} on the total — ${m(E.r2(meal(on).tipTot - meal(on).tipPre))} more. The calculator picks the tax from your province and shows both.`],
    ['What is the sales tax in Canada?', `It depends on the province. Alberta, the territories and Yukon charge 5% GST; Ontario is 13% HST; Nova Scotia is 14% HST since April 1, 2025; New Brunswick, Newfoundland and Labrador and Prince Edward Island are 15% HST; British Columbia and Manitoba add 7% PST to the 5% GST, Saskatchewan 6% and Quebec 9.975%. The table above lists every province, from the Canada Revenue Agency.`],
    ['How much do you tip for food delivery in Canada?', 'In the Research Co. survey, 40% of Canadians said a tip of 10% to 14% is acceptable for delivery and 11% said it is acceptable to skip it. Calculator.net lists 15% to 20% for food delivery in the U.S. and Canada, depending on distance and order size.'],
    ['Do you tip for takeout in Canada?', 'Often not: 54% of respondents in the Research Co. survey said a tip is not necessary for takeout pickup.'],
    ['Is the tax on a restaurant bill the same as the rate in the table?', 'Not always. The table shows each province’s general rate; some provinces tax restaurant meals and alcohol differently. For an exact split, type the tax from your receipt under Go advanced in the calculator.']
  ];
  const calcCanada = calcSeg.replace('<div class="fld"><span class="lab">What are you tipping?</span>', () => `<div class="fld"><span class="lab">Province or territory</span>${csel('tpProv')}</div>\n        <p class="st-note" id="tpProvNote" style="margin-top:-8px"></p>\n\n        <div class="fld"><span class="lab">What are you tipping?</span>`);
  const hero = `  <section class="hero">
    <div class="eyebrow">Tipping guide · Canada</div>
    <h1>Tipping in Canada</h1>
    <p>Tip <strong>15% to 20%</strong> of the bill at restaurants and bars in Canada. Pick your province below and the calculator takes the tax out of the bill and shows the tip before tax and on the total.</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How much to tip in Canada</h2>
        <p>Calculator.net lists 15% to 20% for restaurants and bartenders, 15% to 20% for food delivery, 10% to 20% for hairstylists, barbers, nail services and massage, and 15% to 20% for taxi and limo drivers in the U.S. and Canada. See <a href="/how-much-to-tip/">how much to tip by service</a> for more.</p>
        <h2>What Canadians say is acceptable</h2>
        <p>Research Co. asked 1,000 Canadian adults (December 10 to 12, 2022; margin of error ±3.1 points) what is an acceptable tip at a busy sit-down restaurant:</p>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Service</th><th>10%–14%</th><th>15%–19%</th><th>20% or more</th></tr></thead><tbody><tr><td>Exceptional</td><td>—</td><td>34%</td><td>34%</td></tr><tr><td>Good</td><td>—</td><td>41%</td><td>19%</td></tr><tr><td>Average</td><td>41%</td><td>28%</td><td>—</td></tr></tbody></table></div>
        <p>For delivery, 40% said 10% to 14% is acceptable and 11% said no tip is fine. For takeout pickup, 54% said a tip is not necessary. A dash means the survey did not report that figure.</p>
      </div>
      <div>
        <h2>Sales tax by province</h2>
        <p>The tax is on the bill, so the base you tip on matters. A ${m(100)} meal before tax, with an 18% tip:</p>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Province</th><th>Tax</th><th>Total</th><th>Tip pre-tax</th><th>Tip on total</th></tr></thead><tbody>${provRows}</tbody></table></div>
        <p>These are the general rates; some provinces tax restaurant meals and alcohol differently, so use the tax on your receipt to be exact.</p>
        ${srcHtml(['calc', 'rc', 'cra'])}
        <h2>More tipping guides</h2>
        ${more('canada')}
      </div>
    </div>

${faqHtml(f, 'tipping in Canada')}
  </section>`;
  const desc = 'Tip 15%–20% at restaurants in Canada. Pick your province: the calculator takes out the tax and shows the tip before tax and on the total.';
  meta['/tipping-in/canada/'] = { t: title, d: desc };
  page({ slug: 'canada', title, desc, url, attrs: ' data-svc="restaurant"', init: 'initTipCalc', hero, card: calcCanada, content, app: jsonApp('Tipping in Canada — Tip Calculator by Province', url, 'Tipping in Canada: typical tips and a tip calculator that takes the provincial sales tax out of the bill.'), faq: jsonFaq(f), crumbs: crumbs([['CalcThis', 'https://calcthis.co/'], ['How Much to Tip', 'https://calcthis.co/how-much-to-tip/'], ['Tipping in Canada', url]]) });
  console.log('canada', title.length, desc.length);
}

/* ================= ITALY ================= */
{
  const url = 'https://calcthis.co/tipping-in/italy/', title = 'Tipping in Italy: Servizio, Coperto & How Much to Tip';
  const r = E.italy({ bill: 86.4, people: 4, coperto: 2, servizio: false });
  const f = [
    ['Do you tip in Italy?', 'Tipping is uncommon in Italy; it is mainly for special service. Check the bill first: a service charge (servizio) of about 15% to 20% is often included, and the cover charge (coperto) is not a tip.'],
    ['What is coperto?', 'Coperto is a cover charge of about €1 to €3 per person for the table and bread service, listed on the menu. It is not a tip and usually goes to the restaurant. Some places also charge a separate pane (bread) fee of €1 to €2.'],
    ['What is servizio?', 'Servizio is a service charge, typically about 15% to 20% of the bill, mostly in tourist areas. If it is on the bill, extra tipping is only needed for exceptional service.'],
    ['How much do you tip at a restaurant in Italy if there is no servizio?', `Optional. Rounding up is common for a good meal. On a ${eur(86.4)} bill for four with ${eur(2)} coperto each, rounding up to the next €5 means paying ${eur(r.rounds[1].total)}, a ${eur(r.rounds[1].tip)} tip (${eur(r.rounds[1].each)} each); to the next €10, ${eur(r.rounds[2].total)}.`],
    ['Do you tip in bars and cafes in Italy?', 'If you stand at the bar there is no service fee; sitting down includes service in the bill. For great service, round up to the nearest €1. Tip jars usually take €0.10 to €0.50.'],
    ['Do you tip taxi drivers and hotel staff in Italy?', 'Tipping a taxi driver is not expected; consider €1 per bag if the driver helps with luggage. Hotel porters get about €1 per bag, concierges €5 to €10 for significant help, and cleaning staff about €2 per day.'],
    ['How much do you tip a tour guide in Italy?', 'For a guide you enjoyed, consider €5 for a half-day tour or €10 for a full day. Volunteer guides on free tours can get €5 to €10.']
  ];
  const card = `  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your restaurant bill</h2>
        ${fld('tiBill', 'Total on the bill', '€', 'e.g. 86.40')}
        ${fld('tiPeople', 'Number of people', 'optional', 'e.g. 4')}
        ${fld('tiCoperto', 'Coperto', '€ per person', 'e.g. 2')}
        <label class="dc-check" for="tiServizio"><input type="checkbox" id="tiServizio"><span>Servizio (service charge) is already on the bill</span></label>
        <p class="add-note ln-hint" id="tiHint" style="display:none"></p>
        <div class="chips" aria-label="Try an example">
          <button type="button" id="tiEx">See an example: €86.40 bill, 4 people, €2 coperto</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="tiResLab">Round-up tip (to €5)</div>
          <div class="res-big" id="tiBig">—</div>
          <div class="res-sub" id="tiSub">Enter the total on the bill.</div>
        </div>
        <div id="tiResults" style="display:none">
          <p class="res-tip adv-tip" id="tiTip"></p>
          <table class="dtable ln-terms" id="tiTable"></table>
          <div id="tiExtra"></div>
          <div><button class="btn" id="tiCopy" type="button" style="margin-top:6px">Copy results</button></div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="tiMLab">Round-up tip (to €5)</span>
    <div class="mbar-vals"><b id="tiMVal">—</b><span id="tiMDec"></span></div>
  </div>
`;
  const tbl = [['Restaurants', 'Coperto €1–€3 per person is not a tip. Servizio of about 15%–20% is often included; if not, round up for a good meal'], ['Bars and cafes', 'Standing at the bar: no service fee. Sitting down: service is in the bill. Round up to the nearest €1 for great service; tip jars €0.10–€0.50'], ['Taxis', 'Not expected; €1 per bag if the driver helps with luggage'], ['Hotel porters', 'About €1 per bag'], ['Hotel concierge', '€5–€10 for significant help'], ['Hotel cleaning staff', 'About €2 per day'], ['Hairdressers, barbers, massage', 'Service is included; €2–€5 for a special experience'], ['Tour guides', '€5 for a half-day tour, €10 for a full day; €5–€10 for a free-tour volunteer guide']].map((x) => '<tr><td>' + x[0] + '</td><td>' + x[1] + '</td></tr>').join('');
  const hero = `  <section class="hero">
    <div class="eyebrow">Tipping guide · Italy</div>
    <h1>Tipping in Italy</h1>
    <p>Tipping is <strong>not expected</strong> in Italy. Check the bill for <strong>servizio</strong> (a service charge) first — and remember that <strong>coperto</strong>, the cover charge, is not a tip. Enter your bill below to see both and what rounding up would cost.</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>Coperto and servizio</h2>
        <p><strong>Coperto</strong> is a cover charge of about €1 to €3 per person. <strong>Servizio</strong> is a service charge of about 15% to 20%, mostly in tourist areas; if it is on your bill, you do not need to add a tip. If it is not, a tip is optional and rounding up is common for a good meal. Tips are left in cash.</p>
        <p>Example: a ${eur(86.4)} bill for four with ${eur(2)} coperto each includes ${eur(r.coperto)} of coperto and ${eur(r.food)} of food and drink. Rounding up to the next €5 is ${eur(r.rounds[1].total)}, a ${eur(r.rounds[1].tip)} tip.</p>
        <h2>Who to tip in Italy</h2>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Who</th><th>Typical tip</th></tr></thead><tbody>${tbl}</tbody></table></div>
      </div>
      <div>
        <h2>Where these amounts come from</h2>
        ${srcHtml(['ta'], 'No official Italian tourism source was found, so this is one travel guide’s guidance: other guides may differ a little. ')}
        <h2>More tipping guides</h2>
        ${more('italy')}
      </div>
    </div>

${faqHtml(f, 'tipping in Italy')}
  </section>`;
  const desc = 'Tipping in Italy is not expected: check the bill for servizio, and coperto is not a tip. Enter your bill to see what rounding up costs.';
  meta['/tipping-in/italy/'] = { t: title, d: desc };
  page({ slug: 'italy', title, desc, url, init: 'initTipItaly', hero, card, content, app: jsonApp('Tipping in Italy — Restaurant Bill Tool', url, 'Tipping in Italy: coperto and servizio explained, with a restaurant bill tool that shows what rounding up costs.'), faq: jsonFaq(f), crumbs: crumbs([['CalcThis', 'https://calcthis.co/'], ['How Much to Tip', 'https://calcthis.co/how-much-to-tip/'], ['Tipping in Italy', url]]) });
  console.log('italy', title.length, desc.length);
}

/* ================= JAPAN ================= */
{
  const url = 'https://calcthis.co/tipping-in/japan/', title = 'Tipping in Japan: Is It Expected? JNTO Guidance';
  const f = [
    ['Do you tip in Japan?', 'No. Japan’s national tourism organization (JNTO) says tipping is generally not expected, and that it is not common to tip in bars, cafes, restaurants, taxis and hotels.'],
    ['Should I tip in restaurants in Japan?', 'No. It is not common to tip in restaurants in Japan, according to JNTO.'],
    ['Do you tip taxi drivers in Japan?', 'No. JNTO lists taxis among the services where tipping is not common.'],
    ['Do you tip hotel staff in Japan?', 'No. JNTO lists hotels among the services where tipping is not common.'],
    ['Is there any time you tip in Japan?', 'JNTO says a private guide or interpreter who is accustomed to overseas practices may accept a tip as a gesture of gratitude. Tipping is still not expected. It describes a custom called kokorozuke (“coming from the heart”) that applies in some situations.'],
    ['How do I give a tip in Japan if I want to?', 'JNTO says it is customary to put it in an envelope and give it discreetly. Small envelopes are sold at convenience stores, stationery stores and 100 yen stores.']
  ];
  const card = `  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Should I tip here?</h2>
        <div class="fld"><span class="lab">Where are you?</span>${csel('tjPlace')}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="tjResLab">Should you tip?</div>
          <div class="res-big" id="tjBig">—</div>
          <div class="res-sub" id="tjSub">Pick where you are to see whether to tip.</div>
        </div>
        <div id="tjResults" style="display:none">
          <p class="res-tip adv-tip" id="tjTip"></p>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="tjMLab">Should you tip?</span>
    <div class="mbar-vals"><b id="tjMVal">—</b><span id="tjMDec"></span></div>
  </div>
`;
  const tbl = [['Restaurants', 'Not common'], ['Bars and cafes', 'Not common'], ['Taxis', 'Not common'], ['Hotels', 'Not common'], ['Private guide or interpreter', 'Not expected; may accept a tip as a gesture of gratitude if accustomed to overseas practices']].map((x) => '<tr><td>' + x[0] + '</td><td>' + x[1] + '</td></tr>').join('');
  const hero = `  <section class="hero">
    <div class="eyebrow">Tipping guide · Japan</div>
    <h1>Tipping in Japan</h1>
    <p><strong>Tipping is not expected in Japan.</strong> Japan’s national tourism organization says it is not common to tip in bars, cafes, restaurants, taxis and hotels. Pick where you are below.</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>Do you tip in Japan?</h2>
        <p>No. According to the Japan National Tourism Organization (JNTO), tipping is generally not expected, and it is not common to tip for services such as those provided in bars, cafes, restaurants, taxis and hotels. There is no tip to calculate: pay the price on the bill.</p>
        <h2>The exceptions</h2>
        <p>A private guide or interpreter who is accustomed to overseas practices may accept a tip as a gesture of gratitude, though tipping is still not expected. JNTO describes a custom called <strong>kokorozuke</strong> (“coming from the heart”) that applies in some situations.</p>
        <h2>How to give a tip</h2>
        <p>If you do choose to tip, JNTO says it is customary to put it in an envelope and give it discreetly. Small envelopes are sold at convenience stores, stationery stores and 100 yen stores.</p>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Where</th><th>Tip</th></tr></thead><tbody>${tbl}</tbody></table></div>
      </div>
      <div>
        <h2>Where this comes from</h2>
        ${srcHtml(['jnto'], 'The JNTO page has no date. ')}
        <h2>More tipping guides</h2>
        ${more('japan')}
      </div>
    </div>

${faqHtml(f, 'tipping in Japan')}
  </section>`;
  const desc = 'Tipping is not expected in Japan: not common in restaurants, bars, cafes, taxis or hotels, says JNTO. Pick where you are to see what to do.';
  meta['/tipping-in/japan/'] = { t: title, d: desc };
  page({ slug: 'japan', title, desc, url, init: 'initTipJapan', hero, card, content, app: jsonApp('Tipping in Japan — Should I Tip Here?', url, 'Tipping in Japan: not expected in restaurants, bars, cafes, taxis or hotels, with the JNTO guidance and the envelope custom.'), faq: jsonFaq(f), crumbs: crumbs([['CalcThis', 'https://calcthis.co/'], ['How Much to Tip', 'https://calcthis.co/how-much-to-tip/'], ['Tipping in Japan', url]]) });
  console.log('japan', title.length, desc.length);
}

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const slugs = ['/tipping-in/canada/', '/tipping-in/italy/', '/tipping-in/japan/'];
edit('sitemap.xml', (sm) => { let add = ''; slugs.forEach((u) => { if (!sm.includes('<loc>https://calcthis.co' + u + '</loc>')) add += '  <url>\n    <loc>https://calcthis.co' + u + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n'; }); return add ? sm.replace('</urlset>', () => add + '</urlset>') : sm; });
edit('build.js', (s) => { let add = ''; slugs.forEach((u) => { const file = u.slice(1) + 'index.html'; if (!s.includes("file: '" + file + "'")) add += "  { file: '" + file + "', slug: '" + u + "' },\n"; }); return add ? s.replace("  { file: 'how-much-to-tip/valet/index.html', slug: '/how-much-to-tip/valet/' },\n", (mm) => mm + add) : s; });
edit('llms.txt', (lt) => lt.includes('/tipping-in/') ? lt : lt.replace(/(- \[How Much to Tip[^\n]*\n)/, (mm) => mm + '- [Tipping in Canada](https://calcthis.co/tipping-in/canada/), [Tipping in Italy](https://calcthis.co/tipping-in/italy/) and [Tipping in Japan](https://calcthis.co/tipping-in/japan/): how tipping works in each country, with the sources, a Canadian tip calculator that splits out provincial tax, an Italian restaurant-bill tool (coperto and servizio) and the Japanese guidance that tipping is not expected.\n'));
edit('md-files/seo-meta-hand.json', (s) => { const j = JSON.parse(s); let ch = false; Object.keys(meta).forEach((k) => { if (!j[k] || j[k].t !== meta[k].t || j[k].d !== meta[k].d) { j[k] = meta[k]; ch = true; } }); return ch ? JSON.stringify(j, null, 2) + '\n' : s; });
