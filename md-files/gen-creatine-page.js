const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /creatine-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.creatineEngine. Run: node md-files/gen-creatine-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['CREATINE'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.creatineEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const t1 = (x) => E.trim(x, 1);

/* ---------- worked numbers ---------- */
const KG = 80, D80 = E.loadDaily(KG), P80 = D80 / 4, M80 = E.maintFor(KG), F80 = E.first28(KG, 7, M80), S80 = E.SKIP * M80;
const WROWS = [50, 60, 70, 80, 90, 100, 110].map((k) => '<tr><td>' + k + ' kg (' + Math.round(k * E.LB) + ' lb)</td><td>' + t1(E.loadDaily(k)) + ' g</td><td>' + t1(E.loadDaily(k) / 4) + ' g</td><td>' + t1(E.maintFor(k)) + ' g</td></tr>').join('');
const wTable = '<table class="dtable"><thead><tr><th>Body weight</th><th>Loading a day</th><th>Per dose (4 a day)</th><th>Maintenance</th></tr></thead><tbody>' + WROWS + '</tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Kreider RB, Kalman DS, Antonio J, et al., International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine, J Int Soc Sports Nutr 2017;14:18 (full text read via Europe PMC, 2026-11-07): a normal diet with 1–2 g a day of creatine leaves muscle creatine about 60–80% saturated; the most effective way to raise stores is 5 g of creatine monohydrate (approximately 0.3 g/kg body weight) four times a day for 5–7 days; once stores are full they are maintained with 3–5 g a day, although larger athletes may need 5–10 g a day; an alternative is 3 g a day for 28 days, a gradual increase; stores take 4–6 weeks to return to baseline after stopping; loading can retain about 0.5–1.0 L of fluid, in proportion to the weight gained; up to 30 g a day for 5 years was safe and well tolerated in healthy people; carbohydrate or carbohydrate with protein promoted more consistent creatine retention.</li>
          <li>The 0.03 g per kg a day maintenance rule of thumb is used by other creatine calculators; it is not in the position stand text I read. This calculator applies it only as a starting point, held between 3 and 5 g, and lets you type your own dose.</li>
          <li>The ISSN text prints the loading dose as 5 g (approximately 0.3 g/kg) four times a day; four doses of 5 g make 20 g a day, about 0.3 g per kg a day for a 70 kg person, so this page uses 0.3 g per kg per day like other creatine calculators.</li>
          <li>The chart is a schematic: it starts at 70%, the middle of the 60–80% diet range, and rises in a straight line to full at day 5–7 (loading) or day 28 (3 g a day). Real curves differ between people.</li>
          <li>Not used because I found no source I could read: doses for kidney disease, pregnancy or children, creatine hydrochloride, and any change of dose with activity, goal or body fat.</li>
        </ul>
        <p><small>For information only, not medical advice. Anyone with kidney disease, who is pregnant or breastfeeding, or who takes medication should ask a clinician before using a supplement.</small></p>`;

const P = {
  slug: 'creatine-calculator', name: 'Creatine Calculator', menu: 'Creatine', body: 'p-bmr p-cr',
  title: 'Creatine Calculator — Loading and Daily Dose by Weight',
  desc: 'Creatine calculator: your loading dose and daily maintenance dose by body weight (ISSN), load vs skip loading, a plan by date and your tub cost.',
  h1: 'Creatine Calculator', eyebrow: 'Loading dose · daily dose · plan by date · tub cost',
  lead: `Enter your <strong>body weight</strong> and see how much <strong>creatine</strong> to take. A person of ${KG} kg loads with <strong>${t1(D80)} g a day</strong> for 5–7 days, then takes <strong>${t1(M80)} g a day</strong>, or skips loading and takes ${t1(M80)} g from day 1. Under <em>Go advanced</em> you can plan back from a date and work out what your tub costs.`,
  schema: 'Free creatine calculator: loading dose (0.3 g per kg a day for 5–7 days) and daily maintenance dose (3–5 g) by body weight from the ISSN position stand, load first or skip loading side by side with a muscle-stores chart, a plan by date, and tub, scoop and cost lines.',
  llms: 'Free creatine calculator: loading dose and daily maintenance dose by body weight (ISSN position stand), loading versus no loading with a stores chart, a plan back from a date, and tub, scoop and cost lines.',
  card: 'Your creatine loading dose and daily dose by weight, loading versus skipping, a plan by date and your tub cost.',
  faqs: [
    ['How much creatine should I take per day?', `The ISSN position stand says stores are maintained with 3–5 g of creatine monohydrate a day once they are full, and larger athletes may need 5–10 g. For ${KG} kg this calculator gives ${t1(M80)} g a day.`],
    ['How much creatine per kg of body weight?', `Loading uses about ${E.LOADK} g per kg a day for 5–7 days: ${t1(D80)} g a day at ${KG} kg, split into four doses of ${t1(P80)} g. For maintenance many calculators use ${E.MAINTK} g per kg; the calculator holds that between ${E.MMIN} and ${E.MMAX} g, so ${KG} kg gets ${t1(M80)} g, and you can type your own dose under Go advanced.`],
    ['Do I need to load creatine?', `No. Loading fills muscle stores in 5–7 days. Taking ${t1(M80)} g a day from day 1 raises them gradually over about ${E.SKIP} days, with less effect on training until they are full. The calculator shows both side by side: ${t1(F80)} g in the first ${E.SKIP} days with a 7-day load, ${t1(S80)} g without.`],
    ['How long does creatine take to work?', `About 5–7 days with a loading phase and about ${E.SKIP} days at 3 g a day, according to the ISSN position stand. If you need to be full by a date, enter it under Go advanced to see when to start.`],
    ['How much water should I drink on creatine?', 'The position stand reports that loading can retain about 0.5–1.0 L of fluid, in proportion to the weight gained. The text I read gives no extra water target, so this page does not invent one; for a general daily target use the <a href="/water-intake-calculator/">water intake calculator</a>.'],
    ['Does creatine cause water weight?', 'Yes, a little at first: the ISSN position stand reports short-term fluid retention of about 0.5–1.0 L during loading, in proportion to the weight gained. That is water in the muscle, not fat.'],
    ['Is creatine safe?', 'In the position stand, up to 30 g a day for 5 years was safe and well tolerated in healthy people, and collegiate football players taking 5–10 g a day for 21 months showed no clinically significant change in kidney markers. People with kidney disease, who are pregnant or breastfeeding, or who take medication should ask a clinician; this page gives no dose for them.'],
    ['When should I take creatine?', 'The position stand reports that taking creatine with carbohydrate, or carbohydrate and protein, promoted more consistent retention. I found no read source for a best time of day, so take it when you will remember.'],
    ['What happens when I stop taking creatine?', 'Muscle creatine takes 4–6 weeks to return to baseline, and the position stand found no evidence that your own creatine production falls below baseline afterwards.']
  ],
  pills: [['/protein-intake-calculator/', 'Protein Intake Calculator', '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>'], ['/water-intake-calculator/', 'Water Intake Calculator', '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'], ['/macro-calculator/', 'Macro Calculator', '<path d="M3 12h4l2-5 4 10 2-5h6"/>'], ['/one-rep-max-calculator/', 'One Rep Max Calculator', '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>']]
};

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const box = (label, id, ph, uid, u, btns) => `<div class="fld"><span class="lab">${label}</span><div class="cf-box"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" aria-label="${label}"><div class="seg cf-u" id="${uid}" data-u="${u}" role="group" aria-label="${label} unit">${btns.map((b) => `<button type="button"${b[0] === u ? ' class="on"' : ''} data-v="${b[0]}">${b[1]}</button>`).join('')}</div></div></div>`;

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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'HealthApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const input = `
        <h2 class="card-h2">Your details</h2>
        ${box('Body weight', 'crW', 'e.g. 176', 'crWu', 'lb', [['lb', 'lb'], ['kg', 'kg']])}
        <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Start with</span><div class="radgrp" id="crPlan" role="radiogroup" aria-label="Start with"><button class="radopt on" type="button" role="radio" aria-checked="true" data-v="load"><i class="rd"></i><span class="t"><b>A loading week</b><span class="d" id="crD1">A higher dose for 5–7 days, then the daily dose. Your stores fill in about a week.</span></span></button><button class="radopt" type="button" role="radio" aria-checked="false" data-v="skip"><i class="rd"></i><span class="t"><b>Daily dose only</b><span class="d" id="crD2">The daily dose from day 1. It gets there more slowly, in about 28 days.</span></span></button><button class="radopt" type="button" role="radio" aria-checked="false" data-v="taking"><i class="rd"></i><span class="t"><b>Already taking it</b><span class="d" id="crD3">Shows only the daily dose.</span></span></button></div></div>
        <div class="res-hint" id="crHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="crAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Loading length</span><div class="modeseg" id="crLd" role="group" aria-label="Loading length"><button type="button" data-v="5">5 days</button><button type="button" data-v="6">6 days</button><button class="on" type="button" data-v="7">7 days</button></div></div>
          <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Doses a day while loading</span><div class="modeseg" id="crDs" role="group" aria-label="Doses a day while loading"><button type="button" data-v="3">3 doses</button><button class="on" type="button" data-v="4">4 doses</button><button type="button" data-v="5">5 doses</button></div></div>
          ${tfld('crM', 'Maintenance dose I use', 'g a day · optional', 'e.g. 5')}
          <div class="proj-sep"></div>
          <label class="fld" for="crDate"><span class="lab">I want full stores by <span class="unit">date · optional</span></span><div class="inp"><input id="crDate" type="text" autocomplete="off" placeholder="Pick a date"></div></label>
          <div class="proj-sep"></div>
          <p class="bm-h">Your tub</p>
          ${tfld('crTub', 'Tub size', 'g · optional', 'e.g. 500')}
          ${tfld('crPr', 'Tub price', 'your currency · optional', 'e.g. 25')}
          ${tfld('crSc', 'Scoop size', 'g · optional', 'e.g. 5')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="crAdvBtn" type="button">
            <span id="crAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Creatine you take a day</div>
          <div class="res-big"><span id="crBig">—</span></div>
          <div class="res-sub" id="crSub" data-empty="Enter your body weight.">Enter your body weight.</div>
        </div>
        <div id="crBody" style="display:none">
          <p class="res-tip adv-tip" id="crTip"></p>
          <p class="bm-h">Your plan</p>
          <p class="cr-flag" id="crFlag" style="display:none"></p>
          <table class="dtable" id="crSched"></table>
          <div id="crCmpWrap">
            <p class="bm-h">With or without a loading week</p>
            <table class="dtable" id="crCmp"></table>
          </div>
          <div id="crChartWrap">
            <p class="bm-h">Muscle creatine stores (schematic)</p>
            <div id="crChart"></div>
            <div class="bm-key"><span><i class="cr-ky ld"></i>With loading</span><span><i class="cr-ky sk"></i>Daily dose only</span><span><i class="cr-ky no"></i>No creatine</span></div>
            <p class="cb-note">Starts at 70%, the middle of the 60–80% a normal diet gives. The straight lines are a simplification between the sourced points: full after 5–7 days of loading or about 28 days at 3 g a day.</p>
          </div>
          <div id="crTubWrap" style="display:none">
            <p class="bm-h">Your tub</p>
            <table class="dtable" id="crTubT"></table>
          </div>
          <p class="cb-note">For information only, not medical advice. Loading can retain about 0.5–1.0 L of water in the muscle for a while; that is not fat.</p>
        </div>`;
  const left = `
        <h2>How to use the creatine calculator</h2>
        <p>Type your <strong>body weight</strong> and choose how to start: <strong>a loading week</strong> (a higher dose for 5–7 days, then the daily dose), <strong>daily dose only</strong> (the daily dose from day 1, slower) or <strong>already taking it</strong>. You get the dose, the schedule, the two routes side by side and a chart of how muscle stores fill.</p>
        <p>Open <strong>Go advanced</strong> to change the loading length and doses a day, type your own maintenance dose, pick the date you want full stores by, or enter your tub size, price and scoop to see how long it lasts and what it costs.</p>

        <h2>The numbers</h2>
        <div class="formula">
          loading = 0.3 g × body weight (kg) a day for 5–7 days, to the whole gram
          <small>MAINTENANCE: 3–5 G A DAY ONCE STORES ARE FULL (ISSN)</small>
        </div>
        <p>${KG} kg → ${t1(D80)} g a day, four doses of ${t1(P80)} g, then ${t1(M80)} g a day. In the first ${E.SKIP} days that is ${t1(F80)} g with a 7-day load or ${t1(S80)} g without.</p>

        <h2>Creatine dose by body weight</h2>
        ${wTable}
        <p>Loading at 0.3 g per kg a day for 5–7 days; maintenance at 0.03 g per kg a day, held between 3 and 5 g and rounded to 0.5 g.</p>`;
  const right = `
        <h2>How much creatine should I take?</h2>
        <p>The ISSN position stand describes loading (about 0.3 g per kg a day, as four doses, for 5–7 days) and maintenance (3–5 g a day, 5–10 g for larger athletes). Taking 3 g a day for ${E.SKIP} days reaches full stores more slowly.</p>

        <h2>Creatine and water</h2>
        <p>Creatine holds a little water in the muscle. The position stand reports about 0.5–1.0 L of short-term fluid retention during loading, in proportion to the weight gained. It gives no extra water target, so neither does this page; for a general daily amount see the <a href="/water-intake-calculator/">water intake calculator</a>.</p>

        <h2>Pair it with protein and training</h2>
        <p>Creatine works with training. For a daily protein target use the <a href="/protein-intake-calculator/">protein intake calculator</a>, and for the full split the <a href="/macro-calculator/">macro calculator</a>.</p>
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
    <span class="mbar-lab" id="crMLab">Creatine a day</span>
    <div class="mbar-vals"><b id="crMVal">—</b></div>
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

<script src="/assets/datepicker.min.js"></script>
<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initCreatineCalc();</script>
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
const prev = { slug: 'fiber-calculator', menu: 'Fiber', name: 'Fiber Calculator', llms: 'Fiber Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace("  { file: '" + prev.slug + "/index.html', slug: '" + ps2 + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M5 12v8M9 9v14M23 9v14M27 12v8M9 16h14" stroke="#37503F" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="16" cy="6" r="2" fill="#B5761F"/>
        </svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="/steps-to-miles-calculator/">', () => card + '    <a class="calc" href="/steps-to-miles-calculator/">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — your creatine loading dose and daily dose by body weight, loading versus skipping, a plan by date and your tub cost</span></li>\n');
    return h;
  });
}
