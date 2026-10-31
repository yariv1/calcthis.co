const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Tip phase 2: /how-much-to-tip/ (guide hub with the tip calculator) + /how-much-to-tip/<service>/ for hairdresser, barber, tattoo-artist,
   massage-therapist, dog-groomer, uber-driver (percent services: the hub's calculator card preloaded with the service) and movers, valet
   (flat-dollar widget). Every number in the text comes from CalcThis.tipEngine. Tipping ranges are customs: each page names its sources.
   Run AFTER md-files/gen-tip-page.js (it reuses the calculator card of the generated /tip-calculator/ page): node md-files/gen-howmuch-pages.js, then node build.js. */
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
const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
const pct = (x) => String(Math.round(x * 100) / 100) + '%';
const fld = (id, label, unit, ph) => `<div class="fld"><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></div>`;
const c = (bill, p) => E.calc({ bill, tax: 0, pct: p, people: 1, base: 'total', round: 'none', items: null });
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- sources (all read 2026-10-31) ---------- */
const S = {
  ally: { t: 'Ally — How Much Should You Tip? (August 18, 2026)', u: 'https://www.ally.com/stories/spend/how-much-to-tip-guide/' },
  nw: { t: 'NerdWallet — How Much Do You Tip a Hairdresser? (updated October 8, 2025)', u: 'https://www.nerdwallet.com/finance/learn/how-much-to-tip-hairdresser' },
  wkmg: { t: 'WKMG News 6 — How much should you be tipping for services? (2018, updated 2019; etiquette expert Jacqueline Whitmore)', u: 'https://www.clickorlando.com/news/how-much-should-you-be-tipping-for-services' },
  uber: { t: 'Uber — Tipping', u: 'https://www.uber.com/us/en/ride/how-it-works/tips/' },
  calc: { t: 'Calculator.net — Tip Calculator', u: 'https://www.calculator.net/tip-calculator.html' }
};
const srcHtml = (ids) => '<p class="st-src">Sources: ' + ids.map((k) => '<a href="' + S[k].u + '" rel="noopener">' + S[k].t + '</a>').join(' · ') + '. Tipping is a custom, not a rule: amounts vary by place and service, and the guides disagree a little.</p>';
const priceRows = (prices, lo, hi, unit) => prices.map((b) => '<tr><td>' + m0(b) + '</td><td>' + m(c(b, lo).tip) + '</td><td>' + m(c(b, hi).tip) + '</td></tr>').join('');
const priceTable = (prices, lo, hi, what) => `<div class="pc-tblwrap"><table class="dtable"><thead><tr><th>${what}</th><th>${lo}% tip</th><th>${hi}% tip</th></tr></thead><tbody>${priceRows(prices, lo, hi)}</tbody></table></div>`;

/* ---------- the services ---------- */
const SERVICES = [
  {
    slug: 'hairdresser', svc: 'hairdresser', name: 'Hairdresser', lo: 15, hi: 20, usual: 20, prices: [30, 50, 75, 100, 150, 200], priceHead: 'Service price', src: ['ally', 'nw'],
    title: 'How Much to Tip a Hairdresser: 15%–20% + Calculator',
    answer: 'Tip a hairdresser <strong>15% to 20%</strong> of the service price. 20% is the usual standard.',
    body: () => [
      `<h2>How much to tip a hairdresser</h2>`,
      `<p>Etiquette experts and salon professionals asked by NerdWallet mostly suggest 15% to 20%, depending on the service and how happy you are with it. Ally gives the same 15% to 20% of the service cost. NerdWallet calls 20% the usual standard, and it is the easiest to work out: find 10% and double it. On a ${m(60)} cut that is ${m(c(60, 20).tip)}.</p>`,
      `<h2>When to tip more or less</h2>`,
      `<p>For styles that rely on the stylist’s creativity and expertise — hand-painted highlights, corrective coloring and hair extensions are the examples given — NerdWallet’s salon expert suggests tipping a little more than 20% if you can afford it. For simpler styles, tipping closer to 15% is acceptable. For many stylists, tips are a significant part of their earnings.</p>`
    ],
    faqs: () => [
      ['How much should I tip my hairdresser?', `15% to 20% of the service price is the usual range, and 20% is the standard NerdWallet describes. On a ${m(100)} service that is ${m(c(100, 15).tip)} to ${m(c(100, 20).tip)}.`],
      ['How much is a 20% tip on a haircut?', `On ${m(50)} it is ${m(c(50, 20).tip)}; on ${m(75)}, ${m(c(75, 20).tip)}; on ${m(150)}, ${m(c(150, 20).tip)}. To work it out in your head, move the decimal point one place left for 10% and double it.`],
      ['Should I tip more for color or extensions?', 'NerdWallet’s salon expert says it is worth tipping a little more than 20% for styles that rely on the stylist’s creativity and expertise, such as hand-painted highlights, corrective coloring and hair extensions, if you can afford it.'],
      ['Is the tip the same for a massage?', 'Yes, 15% to 20% is also the usual range for a massage therapist, according to NerdWallet and Ally.']
    ],
    related: ['barber', 'massage-therapist']
  },
  {
    slug: 'barber', svc: 'barber', name: 'Barber', lo: 15, hi: 25, usual: 20, prices: [20, 25, 30, 40, 50, 75], priceHead: 'Haircut price', src: ['ally', 'nw', 'wkmg'],
    title: 'How Much to Tip a Barber: 15%–25% + Calculator',
    answer: 'Tip a barber <strong>15% to 25%</strong> of the service price. 20% is typical.',
    body: () => [
      `<h2>How much to tip a barber</h2>`,
      `<p>Ally puts the range at 15% to 25% of the service cost. An etiquette expert quoted by WKMG News 6 (2018) gives 20%. On a ${m(30)} haircut, 15% is ${m(c(30, 15).tip)}, 20% is ${m(c(30, 20).tip)} and 25% is ${m(c(30, 25).tip)}.</p>`,
      `<h2>Routine cut or something special</h2>`,
      `<p>NerdWallet’s salon expert says it is acceptable to tip closer to 15% for simpler styles, like a routine barber cut. Go toward the top of the range for a longer or more detailed service.</p>`
    ],
    faqs: () => [
      ['How much should I tip a barber?', `15% to 25% of the service price. A ${m(30)} cut is ${m(c(30, 15).tip)} to ${m(c(30, 25).tip)} in tips, with ${m(c(30, 20).tip)} at the typical 20%.`],
      ['How much is 20% on a $40 haircut?', `${m(c(40, 20).tip)}, which makes ${m(c(40, 20).total)} in total. At 15% it is ${m(c(40, 15).tip)} and at 25% ${m(c(40, 25).tip)}.`],
      ['Do I tip less for a simple cut?', 'NerdWallet’s salon expert says it is acceptable to tip closer to 15% for simpler styles, like a routine barber cut.'],
      ['Is a barber tipped the same as a hairdresser?', 'The ranges are close. Ally lists 15% to 20% for a hairdresser and 15% to 25% for a barber.']
    ],
    related: ['hairdresser', 'massage-therapist']
  },
  {
    slug: 'tattoo-artist', svc: 'tattoo', name: 'Tattoo artist', lo: 15, hi: 25, usual: 20, prices: [100, 200, 300, 500, 800, 1000], priceHead: 'Tattoo price', src: ['ally'],
    title: 'How Much to Tip a Tattoo Artist: 15%–25% + Calculator',
    answer: 'Tip a tattoo artist <strong>15% to 25%</strong> of the tattoo price.',
    body: () => [
      `<h2>How much to tip a tattoo artist</h2>`,
      `<p>Ally lists 15% to 25% of the service cost for a tattoo artist. On a ${m(300)} tattoo that is ${m(c(300, 15).tip)} at 15%, ${m(c(300, 20).tip)} at 20% and ${m(c(300, 25).tip)} at 25%. Only one major guide covers tattoo artists, and the other pages that repeat the range add little, so treat it as the customary range rather than a rule.</p>`,
      `<h2>Working it out on a bigger piece</h2>`,
      `<p>The tip is a percentage of the tattoo price, so large pieces add up quickly: on ${m(1000)} the range is ${m(c(1000, 15).tip)} to ${m(c(1000, 25).tip)}. The table below shows common prices.</p>`
    ],
    faqs: () => [
      ['How much should I tip a tattoo artist?', `15% to 25% of the tattoo price, according to Ally. On ${m(200)} that is ${m(c(200, 15).tip)} to ${m(c(200, 25).tip)}.`],
      ['How much is a 20% tip on a $500 tattoo?', `${m(c(500, 20).tip)}. At 15% it is ${m(c(500, 15).tip)} and at 25% ${m(c(500, 25).tip)}.`],
      ['Is there a standard tattoo tip?', 'There is no rule. Ally lists 15% to 25% of the service cost, which is the range used here.']
    ],
    related: ['barber', 'hairdresser']
  },
  {
    slug: 'massage-therapist', svc: 'massage', name: 'Massage therapist', lo: 15, hi: 20, usual: 20, prices: [60, 80, 100, 120, 150, 200], priceHead: 'Massage price', src: ['ally', 'nw', 'wkmg'],
    title: 'How Much to Tip a Massage Therapist: 15%–20% + Calculator',
    answer: 'Tip a massage therapist <strong>15% to 20%</strong> of the service price.',
    body: () => [
      `<h2>How much to tip a massage therapist</h2>`,
      `<p>Ally and NerdWallet both give 15% to 20% of the service cost for a massage therapist, the same range as for a hairdresser. An etiquette expert quoted by WKMG News 6 (2018) agrees. On a ${m(100)} massage that is ${m(c(100, 15).tip)} to ${m(c(100, 20).tip)}.</p>`,
      `<h2>Easy math</h2>`,
      `<p>For 20%, find 10% by moving the decimal point one place left and double it: a ${m(90)} massage has ${m(c(90, 10).tip)} at 10%, so ${m(c(90, 20).tip)} at 20%.</p>`
    ],
    faqs: () => [
      ['How much should I tip a massage therapist?', `15% to 20% of the service price. On a ${m(120)} massage that is ${m(c(120, 15).tip)} to ${m(c(120, 20).tip)}.`],
      ['How much is a 20% tip on a $90 massage?', `${m(c(90, 20).tip)}, for ${m(c(90, 20).total)} in total.`],
      ['Is it the same as tipping a hairdresser?', 'Yes. NerdWallet says the 15% to 20% rule for a hairdresser is also how much to tip a massage therapist.']
    ],
    related: ['hairdresser', 'dog-groomer']
  },
  {
    slug: 'dog-groomer', svc: 'groomer', name: 'Dog groomer', lo: 15, hi: 20, usual: 20, prices: [40, 60, 80, 100, 150, 200], priceHead: 'Grooming price', src: ['ally', 'wkmg'],
    title: 'How Much to Tip a Dog Groomer: 15%–20% + Calculator',
    answer: 'Tip a dog groomer <strong>15% to 20%</strong> of the grooming price.',
    body: () => [
      `<h2>How much to tip a dog groomer</h2>`,
      `<p>Ally gives 15% to 20% of the service cost for a dog groomer. An etiquette expert quoted by WKMG News 6 (2018) gives 20% for a mobile groomer. On an ${m(80)} groom that is ${m(c(80, 15).tip)} at 15% and ${m(c(80, 20).tip)} at 20%.</p>`
    ],
    faqs: () => [
      ['How much should I tip a dog groomer?', `15% to 20% of the grooming price. On ${m(100)} that is ${m(c(100, 15).tip)} to ${m(c(100, 20).tip)}.`],
      ['How much do I tip a mobile dog groomer?', `The etiquette expert quoted by WKMG News 6 (2018) gives 20% for a mobile groomer: ${m(c(120, 20).tip)} on ${m(120)}.`],
      ['How much is 20% on an $80 groom?', `${m(c(80, 20).tip)}, for ${m(c(80, 20).total)} in total.`]
    ],
    related: ['massage-therapist', 'hairdresser']
  },
  {
    slug: 'uber-driver', svc: 'rideshare', name: 'Uber driver', lo: 10, hi: 20, usual: 15, prices: [10, 15, 20, 30, 50, 100], priceHead: 'Fare', src: ['ally', 'uber', 'wkmg'],
    title: 'How Much to Tip an Uber Driver: 10%–20% + Calculator',
    answer: 'Tip an Uber driver <strong>10% to 20%</strong> of the fare. Tipping is optional.',
    body: () => [
      `<h2>How much to tip an Uber driver</h2>`,
      `<p>Ally gives 10% to 20% of the fare, tipped in the app. An etiquette expert quoted by WKMG News 6 (2018) gives 15%. On a ${m(25)} fare that is ${m(c(25, 10).tip)} at 10%, ${m(c(25, 15).tip)} at 15% and ${m(c(25, 20).tip)} at 20%. Uber itself does not suggest an amount.</p>`,
      `<h2>How tipping works on Uber</h2>`,
      `<p>Uber says tipping is optional and drivers are free to accept or decline tips. You can tip in the app after rating your driver or give cash, and up to 30 days after the trip, in the app, on riders.uber.com or from the emailed receipt. Tips go directly to the driver and Uber takes no fees on them.</p>`
    ],
    faqs: () => [
      ['How much should I tip an Uber driver?', `Ally gives 10% to 20% of the fare: ${m(c(25, 10).tip)} to ${m(c(25, 20).tip)} on a ${m(25)} ride. The 2018 WKMG News 6 guidance gives 15% (${m(c(25, 15).tip)}).`],
      ['Do you have to tip on Uber?', 'No. Uber says tipping is optional and drivers are free to accept or decline tips.'],
      ['Can I tip after the ride?', 'Yes. Uber lets you tip up to 30 days after the trip, in the app, on riders.uber.com or from your emailed receipt.'],
      ['Does the driver get the whole tip?', 'Yes. Uber says tips go directly to the driver and Uber takes no fees on them.'],
      ['How much is a 15% tip on a $40 fare?', `${m(c(40, 15).tip)}, so ${m(c(40, 15).total)} in total.`]
    ],
    related: ['valet', 'hairdresser']
  },
  {
    slug: 'movers', flat: 'movers', name: 'Movers', title: 'How Much to Tip Movers: $20–$50 Each per Day + Calculator', src: ['ally', 'wkmg'],
    answer: 'Tip movers <strong>$20 to $50 per mover per day</strong>, in cash.',
    body: () => [
      `<h2>How much to tip movers</h2>`,
      `<p>Ally gives $20 to $50 per mover per day, paid in cash to each worker. Skip it if the moving company prohibits tips. For a crew of 3 for one day that is ${m(60)} at the low end and ${m(150)} at the high end. A longer move multiplies it: 4 movers for 2 days at $30 each is ${m(E.flat({ svc: 'movers', units: 4, times: 2, per: 30 }).total)}.</p>`,
      `<h2>Older, lower guidance</h2>`,
      `<p>An etiquette expert quoted by WKMG News 6 (2018, updated 2019) gives $10 for a few items and up to $25 per person for a full-house move. That guidance is older, and the amounts may be out of date.</p>`
    ],
    faqs: () => [
      ['How much should I tip movers?', `$20 to $50 per mover per day, according to Ally, in cash to each worker. For 3 movers for one day that is ${m(60)} to ${m(150)}.`],
      ['Do I tip each mover?', 'Yes. Ally says to tip per mover and pay each worker in cash. Skip the tip if the company prohibits it.'],
      ['How much do I tip for a two-day move?', `The amount is per mover per day, so double it. 4 movers for 2 days at $30 each is ${m(E.flat({ svc: 'movers', units: 4, times: 2, per: 30 }).total)}.`],
      ['Is there lower guidance?', 'Yes, older guidance from 2018 gives $10 for a few items and up to $25 per person for a full-house move. The calculator shows where your tip falls against the $20 to $50 range.']
    ],
    related: ['valet', 'uber-driver']
  },
  {
    slug: 'valet', flat: 'valet', name: 'Valet', title: 'How Much to Tip a Valet: $2–$10 + Calculator', src: ['ally', 'wkmg'],
    answer: 'Tip a valet <strong>$2 to $10</strong>, in cash when your car is returned.',
    body: () => [
      `<h2>How much to tip a valet</h2>`,
      `<p>Ally gives $2 to $10, paid in cash when your vehicle is returned. An etiquette expert quoted by WKMG News 6 (2018, updated 2019) gives $2 to $5 for parking valet, and $1 per bag, or $2 if a bag is extra heavy, for a bellman or airport valet. The older amounts may be out of date.</p>`
    ],
    faqs: () => [
      ['How much should I tip a valet?', 'Ally gives $2 to $10, paid in cash when your vehicle is returned.'],
      ['When do I tip the valet?', 'When the car is returned to you, according to Ally.'],
      ['Is $5 enough?', 'Yes. $5 is within Ally’s $2 to $10 range and the older $2 to $5 guidance from WKMG News 6 (2018).']
    ],
    related: ['movers', 'uber-driver']
  }
];
const bySlug = {}; SERVICES.forEach((s) => { bySlug[s.slug] = s; });

/* ---------- shared page pieces ---------- */
const pill = (href, label, svg) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>\n        ${label}\n      </a>`;
const pills = `    <div class="pills">
${pill('/tip-calculator/', 'Tip Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/>')}
${pill('/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
${pill('/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 15l6-6"/>')}
${pill('/ratio-calculator/', 'Ratio Calculator', '<path d="M5 8h14M5 16h14"/>')}
    </div>`;
const jsonApp = (name, url, desc) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name, url, applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: desc, dateModified: new Date().toISOString().slice(0, 10), inLanguage: 'en-US', isAccessibleForFree: true, applicationSubCategory: 'Tip calculator', isPartOf: { '@type': 'WebSite', name: 'CalcThis', url: 'https://calcthis.co/' } });
const jsonFaq = (f) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) });
function crumbs(list) { return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: x[1] })) }; }
function head(title, desc, url) {
  return headTop
    .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">');
}
function flatCard(s) {
  const F = E.FLAT[s.flat], mv = s.flat === 'movers';
  return `  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your tip</h2>
${mv ? '        ' + fld('tfUnits', 'Number of movers', '', 'e.g. 3') + '\n' : ''}        ${fld('tfTimes', mv ? 'Number of days' : 'Number of visits', '', 'e.g. 1')}
        ${fld('tfPer', 'Tip ' + F.per, '$', 'e.g. ' + F.def)}
        <div class="chips" id="tfChips" aria-label="Common amounts" style="margin-top:-6px;margin-bottom:15px">${F.chips.map((p) => '<button type="button" data-p="' + p + '">$' + p + '</button>').join('')}</div>
        <p class="add-note ln-hint" id="tfHint" style="display:none"></p>
        <div class="chips" aria-label="Try an example">
          <button type="button" id="tfEx">See an example: ${mv ? '3 movers, 1 day, $' + F.def + ' each' : '1 visit, $' + F.def}</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="tfResLab">Total tip</div>
          <div class="res-big" id="tfBig">—</div>
          <div class="res-sub" id="tfSub">${mv ? 'Enter the number of movers and days.' : 'Enter the number of visits.'}</div>
        </div>
        <div id="tfResults" style="display:none">
          <p class="res-tip adv-tip" id="tfTip"></p>
          <table class="dtable ln-terms" id="tfTable"></table>
          <div id="tfExtra"></div>
          <div><button class="btn" id="tfCopy" type="button" style="margin-top:6px">Copy results</button></div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="tfMLab">Total tip</span>
    <div class="mbar-vals"><b id="tfMVal">—</b><span id="tfMDec"></span></div>
  </div>
`;
}
function page(o) {
  const ld = [o.app, o.faq, o.crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
  const flat = o.flat ? ` data-flat="${o.flat}"` : '', svc = o.svc ? ` data-svc="${o.svc}"` : '';
  const body = `<body class="p-loan p-stax p-tip"${svc}${flat}>
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
<script>CalcThis.${o.flat ? 'initTipFlat' : 'initTipCalc'}();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + o.rel; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head(o.title, o.desc, o.url) + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
}
const faqHtml = (f, what) => `    <h2 style="margin-top:36px">Common questions about ${what}</h2>\n` + f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n');
const meta = {};

/* ---------- service pages ---------- */
SERVICES.forEach((s) => {
  const url = 'https://calcthis.co/how-much-to-tip/' + s.slug + '/', f = s.faqs(), name = s.name.toLowerCase();
  const sib = s.related.map((k) => '<li><a href="/how-much-to-tip/' + k + '/">How much to tip ' + (bySlug[k].name.toLowerCase() === 'movers' ? 'movers' : 'a ' + bySlug[k].name.toLowerCase()).replace('a uber driver', 'an Uber driver').replace('a valet', 'a valet') + '</a></li>').join('');
  let left, ex;
  if (s.flat) {
    const F = E.FLAT[s.flat];
    left = s.body().join('\n        ') + `\n        <h2>Tip at a glance</h2>\n        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>${s.flat === 'movers' ? 'Crew' : 'Visits'}</th><th>Low ($${F.lo})</th><th>High ($${F.hi})</th></tr></thead><tbody>${(s.flat === 'movers' ? [[2, 1], [3, 1], [4, 1], [3, 2], [4, 2]] : [[1, 1], [2, 1], [3, 1], [5, 1]]).map((x) => { const r = E.flat({ svc: s.flat, units: s.flat === 'movers' ? x[0] : 1, times: s.flat === 'movers' ? x[1] : x[0], per: F.def }); return '<tr><td>' + (s.flat === 'movers' ? x[0] + ' movers, ' + x[1] + (x[1] === 1 ? ' day' : ' days') : x[0] + (x[0] === 1 ? ' visit' : ' visits')) + '</td><td>' + m(r.low) + '</td><td>' + m(r.high) + '</td></tr>'; }).join('')}</tbody></table></div>`;
    ex = s.flat === 'movers' ? `${m(E.flat({ svc: 'movers', units: 3, times: 1, per: 30 }).total)} for 3 movers for a day at $30 each` : `${m(5)} for one visit`;
  } else {
    left = s.body().join('\n        ') + `\n        <h2>${s.name} tip on common prices</h2>\n        ` + priceTable(s.prices, s.lo, s.hi, s.priceHead) + `\n        <p>Tips are rounded to the cent. The tip is on the price of the service; add it to the price for the total.</p>`;
    ex = `${m(c(s.prices[3], s.usual).tip)} at ${s.usual}% on ${m(s.prices[3])}`;
  }
  const hero = `  <section class="hero">
    <div class="eyebrow">Tip guide · 2026</div>
    <h1>How Much to Tip ${s.flat === 'movers' ? 'Movers' : (s.flat === 'valet' ? 'a Valet' : (s.slug === 'uber-driver' ? 'an Uber Driver' : 'a ' + s.name))}</h1>
    <p>${s.answer} ${s.flat ? 'Enter the crew and days or the number of visits below.' : 'Enter the price below to see the tip in dollars.'}</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        ${left}
      </div>
      <div>
        <h2>Where these amounts come from</h2>
        ${srcHtml(s.src)}
        <h2>Use the calculator</h2>
        <p>${s.flat ? 'Type the number of ' + (s.flat === 'movers' ? 'movers and days' : 'visits') + ', pick an amount or type your own, and the calculator shows your total against the low and high end of the range.' : 'Type the price of the service and pick a tip %. The calculator shows the tip at the low and high end of the usual range, your own tip, and the tip at every common percentage. Under <strong>Go advanced</strong> you can round the tip up, split it between people or tip before tax.'} For other services, see the <a href="/how-much-to-tip/">tipping guide by service</a> or the <a href="/tip-calculator/">tip calculator</a>.</p>
        <h2>More tip guides</h2>
        <ul class="st-otherlist">${sib}<li><a href="/how-much-to-tip/">How much to tip: every service</a></li><li><a href="/tip-calculator/">Tip calculator: split the bill, tip on tax or total</a></li></ul>
      </div>
    </div>

${faqHtml(f, name === 'movers' ? 'tipping movers' : 'tipping a ' + name.replace(/^uber driver$/, 'driver'))}
  </section>`;
  const title = s.title, desc = s.answer.replace(/<[^>]+>/g, '') + ' ' + (s.flat ? 'Calculator for your crew and days.' : 'Calculator for your bill.');
  meta['/how-much-to-tip/' + s.slug + '/'] = { t: title, d: desc.length > 158 ? desc.slice(0, 155).replace(/\s+\S*$/, '') + '…' : desc };
  page({ rel: 'how-much-to-tip/' + s.slug + '/', title, desc: meta['/how-much-to-tip/' + s.slug + '/'].d, url, svc: s.svc, flat: s.flat, hero, card: s.flat ? flatCard(s) : calcSeg, content,
    app: jsonApp('Tip Calculator — ' + s.name, url, 'How much to tip ' + name + ': ' + s.answer.replace(/<[^>]+>/g, '') + ' Calculator.'), faq: jsonFaq(f),
    crumbs: crumbs([['CalcThis', 'https://calcthis.co/'], ['How Much to Tip', 'https://calcthis.co/how-much-to-tip/'], [s.name, url]]) });
  console.log(s.slug, title.length, meta['/how-much-to-tip/' + s.slug + '/'].d.length);
});

/* ---------- hub: /how-much-to-tip/ ---------- */
const hubRows = [
  ['Restaurants and bartenders', '15%–20%', 'Calculator.net', '/tip-calculator/'], ['Food delivery', '15%–20%, depending on distance and order size', 'Calculator.net', null], ['Taxi or limo drivers', '15%–20%', 'Calculator.net, Ally', null],
  ['Uber or Lyft driver', '10%–20% (optional)', 'Ally, Uber', '/how-much-to-tip/uber-driver/'], ['Hairdresser', '15%–20%', 'Ally, NerdWallet', '/how-much-to-tip/hairdresser/'], ['Barber', '15%–25%', 'Ally', '/how-much-to-tip/barber/'],
  ['Tattoo artist', '15%–25%', 'Ally', '/how-much-to-tip/tattoo-artist/'], ['Massage therapist', '15%–20%', 'Ally, NerdWallet', '/how-much-to-tip/massage-therapist/'], ['Dog groomer', '15%–20%', 'Ally', '/how-much-to-tip/dog-groomer/'],
  ['Nail and other salon services', '10%–20%', 'Calculator.net', null], ['Movers', '$20–$50 per mover per day, in cash', 'Ally', '/how-much-to-tip/movers/'], ['Valet', '$2–$10, in cash when the car is returned', 'Ally', '/how-much-to-tip/valet/'],
  ['Hotel room service', 'Usually already in the price; if not, 15%–20%', 'Calculator.net', null], ['Hotel housekeeping', 'Not expected; $1–$2 per person per night', 'Calculator.net', null], ['Shuttle drivers and parking attendants', '$1–$3', 'Calculator.net', null], ['Tour guides', '$1–$5, depending on the length of the tour', 'Calculator.net', null],
  ['Plumbers, cleaners and other home services', 'Not expected; or $5, $10 or $20 each', 'Calculator.net', null]
].map((r) => '<tr><td>' + (r[3] ? '<a href="' + r[3] + '">' + r[0] + '</a>' : r[0]) + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('');
const hf = [
  ['How much should I tip?', `It depends on the service. 15% to 20% of the price is typical for restaurants, hairdressers, massage therapists and dog groomers; barbers and tattoo artists are 15% to 25%; movers are $20 to $50 per mover per day; a valet is $2 to $10. Pick the service in the calculator above to see the usual range for your bill.`],
  ['How do I calculate a tip?', `Multiply the price by the tip percentage. 10% is the price with the decimal point moved one place left, 20% is that doubled. On ${m(60)}, 10% is ${m(c(60, 10).tip)}, 15% is ${m(c(60, 15).tip)} and 20% is ${m(c(60, 20).tip)}.`],
  ['Is tipping required?', 'No. Tipping is a custom, not a rule, and amounts vary by place and service. Uber, for example, says tipping is optional and drivers are free to accept or decline tips.'],
  ['Should I tip before or after tax?', `Both are common. On a ${m(108)} bill with ${m(8)} of tax, a 20% tip is ${m(E.calc({ bill: 108, tax: 8, pct: 20, base: 'pre' }).tip)} before tax and ${m(E.calc({ bill: 108, tax: 8, pct: 20, base: 'total' }).tip)} on the total. The tip calculator shows both side by side when you enter the tax.`],
  ['How much do I tip for a $100 service?', `At 15% it is ${m(c(100, 15).tip)}, at 18% ${m(c(100, 18).tip)}, at 20% ${m(c(100, 20).tip)} and at 25% ${m(c(100, 25).tip)}.`]
];
{
  const url = 'https://calcthis.co/how-much-to-tip/';
  const title = 'How Much to Tip: Tip Guide by Service + Calculator', desc = 'How much to tip: 15%–20% for restaurants, hair and massage, $20–$50 per mover per day, $2–$10 for a valet. Pick the service and see the tip for your bill.';
  meta['/how-much-to-tip/'] = { t: title, d: desc };
  const hero = `  <section class="hero">
    <div class="eyebrow">Tip guide · 2026</div>
    <h1>How Much to Tip</h1>
    <p>Typical tips by service: <strong>15% to 20%</strong> of the price for restaurants, hairdressers, massage therapists and dog groomers; <strong>$20 to $50</strong> per mover per day; <strong>$2 to $10</strong> for a valet. Pick the service below and enter the bill.</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How much to tip by service</h2>
        <div class="pc-tblwrap"><table class="dtable st-cattbl"><thead><tr><th>Service</th><th>Typical tip</th><th>Source</th></tr></thead><tbody>${hubRows}</tbody></table></div>
        ${srcHtml(['ally', 'nw', 'uber', 'calc'])}
      </div>
      <div>
        <h2>How to use this guide</h2>
        <p>Find the service in the table for the usual range, or pick it in the calculator to see the tip in dollars for your bill: the low end, your own tip and the high end. Click a service for its own guide with the sources and a table of common prices.</p>
        <h2>Percent or a flat amount?</h2>
        <p>Most services are a percentage of the price of the service. Movers and valets are flat amounts: $20 to $50 per mover per day, and $2 to $10 per visit. For splitting a restaurant bill, tipping on the pre-tax amount or rounding up, use the <a href="/tip-calculator/">tip calculator</a>.</p>
        <p>Where the guides disagree the ranges differ a little, and older guidance can be lower. Amounts are customs for the U.S. and Canada, not rules.</p>
      </div>
    </div>

${faqHtml(hf, 'tipping')}
  </section>`;
  page({ rel: 'how-much-to-tip/', title, desc, url, hero, card: calcSeg, content, app: jsonApp('How Much to Tip Calculator', url, 'Tip guide by service with a calculator: typical tip ranges for restaurants, hairdressers, barbers, tattoo artists, massage therapists, dog groomers, Uber drivers, movers and valets.'), faq: jsonFaq(hf),
    crumbs: crumbs([['CalcThis', 'https://calcthis.co/'], ['How Much to Tip', url]]) });
  console.log('hub', title.length, desc.length);
}

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const slugs = ['/how-much-to-tip/'].concat(SERVICES.map((s) => '/how-much-to-tip/' + s.slug + '/'));
edit('sitemap.xml', (sm) => { let add = ''; slugs.forEach((u) => { if (!sm.includes('<loc>https://calcthis.co' + u + '</loc>')) add += '  <url>\n    <loc>https://calcthis.co' + u + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' + (u === '/how-much-to-tip/' ? '0.7' : '0.6') + '</priority>\n  </url>\n'; }); return add ? sm.replace('</urlset>', () => add + '</urlset>') : sm; });
edit('build.js', (s) => { let add = ''; slugs.forEach((u) => { const file = u.slice(1) + 'index.html'; if (!s.includes("file: '" + file + "'")) add += "  { file: '" + file + "', slug: '" + u + "' },\n"; }); return add ? s.replace("  { file: 'tip-calculator/index.html',   slug: '/tip-calculator/' },\n", (mm) => mm + add) : s; });
edit('llms.txt', (lt) => lt.includes('/how-much-to-tip/') ? lt : lt.replace(/(- \[Tip Calculator[^\n]*\n)/, (mm) => mm + '- [How Much to Tip: Tip Guide by Service + Calculator](https://calcthis.co/how-much-to-tip/): typical tips for restaurants, hairdressers, barbers, tattoo artists, massage therapists, dog groomers, Uber drivers, movers and valets, with the sources and a calculator. Each service has its own page under /how-much-to-tip/.\n'));
edit('partials/header.html', (s) => s.includes('/how-much-to-tip/') ? s : s.replace('          <a href="/tip-calculator/">Tip</a>\n', (mm) => mm + '          <a href="/how-much-to-tip/">How Much to Tip</a>\n'));
edit('partials/footer.html', (s) => s.includes('/how-much-to-tip/') ? s : s.replace('          <li><a href="/tip-calculator/">Tip Calculator</a></li>\n', (mm) => mm + '          <li><a href="/how-much-to-tip/">How Much to Tip</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => { const j = JSON.parse(s); let ch = false; Object.keys(meta).forEach((k) => { if (!j[k] || j[k].t !== meta[k].t || j[k].d !== meta[k].d) { j[k] = meta[k]; ch = true; } }); return ch ? JSON.stringify(j, null, 2) + '\n' : s; });
