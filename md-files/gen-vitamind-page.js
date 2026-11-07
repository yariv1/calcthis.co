const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /vitamin-d-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.vitdEngine. Run: node md-files/gen-vitamind-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['VITD'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.vitdEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const plus = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

/* ---------- worked numbers ---------- */
const mcgOf = (iu) => E.nt(iu / E.PER);
const CONV = [100, 200, 400, 600, 800, 1000, 2000, 4000, 5000, 10000, 50000];
const convRows = CONV.map((iu) => '<tr><td>' + E.grp(iu) + ' IU</td><td>' + mcgOf(iu) + ' mcg</td></tr>').join('');
const convTable = '<table class="dtable"><thead><tr><th>IU</th><th>mcg</th></tr></thead><tbody>' + convRows + '</tbody></table>';
const rg = (r) => r[0] === r[1] ? E.grp(r[0]) : E.grp(r[0]) + '–' + E.grp(r[1]);
const rgm = (r) => r[0] === r[1] ? E.nt(r[0]) : E.nt(r[0]) + '–' + E.nt(r[1]);
const tbl = (std) => '<table class="dtable"><thead><tr><th>Age</th><th>' + (std === 'eu' ? 'Adequate intake a day' : 'Recommended a day') + '</th><th>Upper limit a day</th></tr></thead><tbody>' + E.BANDS[std].map((b) => '<tr><td>' + b.name + '</td><td>' + (b.rda ? rg(b.rda.iu) + ' IU (' + rgm(b.rda.mcg) + ' mcg)' : 'not set') + '</td><td>' + E.grp(b.ul.iu) + ' IU (' + b.ul.mcg + ' mcg)</td></tr>').join('') + '</tbody></table>';
const WEEK = 50000, WDAY = WEEK / 7;

const SRC = `<h2>Sources</h2>
        <ul>
          <li>US recommended amounts and upper limits: MedlinePlus (US National Library of Medicine), Vitamin D, reviewed 21 January 2025 (read 2026-11-07): adequate intake 400 IU (10 mcg) from birth to 12 months; RDA 600 IU (15 mcg) from 1 to 70 years, in pregnancy and while breastfeeding; 800 IU (20 mcg) over 70; upper limits 1,000 IU (25 mcg) at 0–6 months, 1,500 IU (38 mcg) at 7–12 months, 2,500 IU (63 mcg) at 1–3 years, 3,000 IU (75 mcg) at 4–8 years and 4,000 IU (100 mcg) from 9 years. The mcg values for the upper limits are rounded in the source. The same RDA values appear on the Harvard T.H. Chan Nutrition Source (last reviewed March 2023) and the Linus Pauling Institute micronutrient page.</li>
          <li>UK advice: NHS, Vitamin D (reviewed 3 August 2020, read 2026-11-07): 10 micrograms (400 IU) a day for children from 1 year and adults; 8.5–10 micrograms for babies up to 1 year; do not take more than 100 micrograms (4,000 IU) a day from age 11, 50 micrograms (2,000 IU) at ages 1–10 and 25 micrograms (1,000 IU) under 12 months. The IU for the baby range (340–400) is worked out here with the same factor.</li>
          <li>EU values: EFSA (European Food Safety Authority). Adequate intakes from the EFSA scientific opinion on dietary reference values for vitamin D (2016; abstract read on the University of Dundee repository record, 2026-11-07): 15 µg a day for adults and for children aged 1–17, 10 µg a day for infants aged 7–11 months, and 15 µg a day in pregnancy and lactation; EFSA sets no adequate intake for younger infants in that abstract. Upper limits from the EFSA overview of tolerable upper intake levels (version 1.1, August 2025, citing the EFSA NDA Panel 2018 and 2023 opinions; read 2026-11-07): 25 µg a day at 0–6 months, 35 µg at 7–11 months, 50 µg at 1–10 years and 100 µg from 11 years, in adults, pregnancy and lactation. The EFSA topic page confirms the 100 µg adult limit was kept in August 2023. The IU for EU values are worked out here with the factor of 40.</li>
          <li>IU and mcg: the pages above always list the two together (10 mcg = 400 IU, 15 mcg = 600 IU, 20 mcg = 800 IU, 25 mcg = 1,000 IU, 100 mcg = 4,000 IU), which is a factor of 40. No page I could open states the rule in words, so the factor is implied by those pairs; the US FDA guidance page returned an error and the NIH Office of Dietary Supplements site refused the request.</li>
          <li>Blood level units: 1 ng/mL = 2.5 nmol/L, from the pairs 20 ng/mL = 50 nmol/L (Omnicalculator) and 40–60 ng/mL = 100–150 nmol/L (GrassrootsHealth), both read 2026-11-07. This is a unit conversion only; the page gives no verdict on a level.</li>
          <li>Not on this page because I found no source I could read: treatment or loading doses, what counts as deficient, sunshine and skin-tone estimates, and the vitamin D in foods.</li>
        </ul>
        <p><small>For information only, not medical advice. The upper limit is the highest daily intake not expected to cause harm in most people; do not change a prescribed dose without asking the clinician who prescribed it.</small></p>`;

const P = {
  slug: 'vitamin-d-calculator', name: 'Vitamin D Calculator', menu: 'Vitamin D', body: 'p-bmr p-vd',
  title: 'Vitamin D Calculator — IU to mcg, RDA and Upper Limit',
  desc: 'Vitamin D calculator: recommended amount and upper limit by age (US, UK, EU), IU to mcg both ways, and a total of every supplement you take.',
  h1: 'Vitamin D Calculator', eyebrow: 'Vitamin D per day · IU to mcg · upper limit · your supplements added up',
  lead: `Type your <strong>age</strong> and see how much <strong>vitamin D</strong> is recommended a day — <strong>600 IU (15 mcg)</strong> for most adults in the US, <strong>10 mcg (400 IU)</strong> in the UK, <strong>15 mcg</strong> in the EU — and the <strong>upper limit</strong>. Then add the supplements you take: the calculator converts <strong>IU to mcg</strong> both ways, adds them up (even a weekly capsule) and shows where you stand.`,
  schema: 'Free vitamin D calculator: recommended daily amount and upper limit by age from MedlinePlus (US), the NHS (UK) and EFSA (EU), IU to mcg conversion both ways (1 mcg = 40 IU), several supplements added up per day or per week, and a blood level unit converter (ng/mL and nmol/L).',
  llms: 'Free vitamin D calculator: recommended amount and upper limit by age (US, UK and EU), IU to mcg both ways, several supplements added up per day or per week against the upper limit, and ng/mL to nmol/L.',
  card: 'Vitamin D recommended amount and upper limit by age, IU to mcg both ways, and every supplement you take added up.',
  faqs: [
    ['How many IU is 1 mcg of vitamin D?', `1 mcg of vitamin D is 40 IU, so IU ÷ 40 = mcg and mcg × 40 = IU. ${E.grp(1000)} IU = ${mcgOf(1000)} mcg, ${E.grp(2000)} IU = ${mcgOf(2000)} mcg and ${E.grp(5000)} IU = ${mcgOf(5000)} mcg. The official pages list the two together (for example 600 IU (15 mcg)), which is a factor of 40.`],
    ['How much vitamin D do I need a day?', 'MedlinePlus lists 600 IU (15 mcg) a day for ages 1 to 70, 800 IU (20 mcg) over 70, and 400 IU (10 mcg) for babies. The NHS advises 10 micrograms (400 IU) a day from age 1. EFSA sets an adequate intake of 15 micrograms (600 IU) a day for adults and children from 1 to 17. The calculator shows the one you choose for your age.'],
    ['What is the upper limit for vitamin D?', 'For ages 9 and over the upper limit is 4,000 IU (100 mcg) a day in the US; the NHS gives the same 100 micrograms from age 11, 50 micrograms (2,000 IU) at ages 1–10 and 25 micrograms (1,000 IU) under 12 months, and EFSA gives 100 micrograms from age 11, 50 micrograms at ages 1–10, 35 micrograms at 7–11 months and 25 micrograms under 7 months. It is the highest daily amount not expected to cause harm in most people.'],
    ['Is 5,000 IU of vitamin D too much?', `5,000 IU is ${mcgOf(5000)} mcg, above the 4,000 IU (100 mcg) upper limit for ages 9 and over. If a doctor prescribed it, follow that advice; if you chose it yourself, ask a clinician. The calculator shows the share of the upper limit for what you take.`],
    ['How do I convert a weekly vitamin D dose to a daily amount?', `Divide by 7. A ${E.grp(WEEK)} IU capsule once a week is ${E.grp(WDAY)} IU (${E.nt(WDAY / E.PER, 1)} mcg) a day on average. Choose “a week” next to how many you take and the calculator does it, then compares the daily average with the upper limit. The upper limit is a daily figure, so ask your clinician about a prescribed weekly dose.`],
    ['What is the difference between IU and mcg?', 'IU (international units) and mcg (micrograms) are two ways to write the same amount of vitamin D: IU is based on biological effect and mcg on weight. Labels in the US now list micrograms, often with IU in brackets.'],
    ['How do I convert ng/mL to nmol/L?', `Multiply ng/mL by 2.5: 20 ng/mL = 50 nmol/L and 40 ng/mL = 100 nmol/L. Open Go advanced to convert a blood test result either way. The page does not say what a level means; ask your clinician.`],
    ['Should I take a vitamin D supplement?', 'The NHS advises everyone to consider 10 micrograms a day in autumn and winter, and all year for people who rarely go outdoors, cover most of their skin outdoors or have dark skin. That is UK advice; ask a clinician what suits you.']
  ],
  pills: [['/creatine-calculator/', 'Creatine Calculator', '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>'], ['/fiber-calculator/', 'Fiber Calculator', '<path d="M12 21V8M12 14c-3 0-5-2-5-5 3 0 5 2 5 5zM12 12c0-3 2-5 5-5 0 3-2 5-5 5z"/>'], ['/caffeine-calculator/', 'Caffeine Calculator', '<path d="M5 9h11v5a5 5 0 0 1-5 5 5 5 0 0 1-6-5V9zM16 10h2a2 2 0 0 1 0 4h-2"/>'], ['/protein-intake-calculator/', 'Protein Intake Calculator', '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>']]
};

const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const box = (label, id, ph, uid, u, btns) => `<div class="fld"><span class="lab">${label}</span><div class="cf-box"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" aria-label="${label}"><div class="seg cf-u" id="${uid}" data-u="${u}" role="group" aria-label="${label} unit">${btns.map((b) => `<button type="button"${b[0] === u ? ' class="on"' : ''} data-v="${b[0]}">${b[1]}</button>`).join('')}</div></div></div>`;
const ms = (id, label, opts, on) => '<div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">' + label + '</span><div class="modeseg" id="' + id + '" role="group" aria-label="' + label + '">' + opts.map((o) => '<button' + (o[0] === on ? ' class="on"' : '') + ' type="button" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div></div>';

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
        ${ms('vdStd', 'Recommendation from', [['us', 'United States'], ['uk', 'United Kingdom'], ['eu', 'Europe']], 'us')}
        ${box('Age', 'vdAge', 'e.g. 35', 'vdAu', 'y', [['y', 'years'], ['m', 'months']])}
        <div class="res-hint" id="vdHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div class="proj-sep"></div>
        <p class="bm-h">What you take</p>
        <div id="vdRows" class="cf-rows one"></div>
        <div class="add-row split" style="margin-top:10px"><button class="btn" id="vdAdd" type="button">${plus} Add supplement</button><button class="linkbtn" id="vdClear" type="button">Clear all</button></div>
        <div id="vdAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="bm-h">Blood test unit converter</p>
          ${box('Vitamin D blood level', 'vdS', 'e.g. 30', 'vdSu', 'ng', [['ng', 'ng/mL'], ['nmol', 'nmol/L']])}
          <p class="vd-out" id="vdSOut" style="display:none"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="vdAdvBtn" type="button">
            <span id="vdAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Vitamin D recommended a day</div>
          <div class="res-big"><span id="vdBig">—</span></div>
          <div class="res-sub" id="vdSub" data-empty="Enter your age.">Enter your age.</div>
        </div>
        <div id="vdBody" style="display:none">
          <p class="res-tip adv-tip" id="vdTip"></p>
          <p class="bm-h">Where you stand</p>
          <div id="vdBar"></div>
          <p class="bm-h">Your targets</p>
          <table class="dtable" id="vdTargets"></table>
          <div id="vdTallyWrap" style="display:none">
            <p class="bm-h">What you take</p>
            <table class="dtable" id="vdTally"></table>
          </div>
          <p class="cb-note">For information only, not medical advice. The recommended amount is the same in pregnancy and while breastfeeding (600 IU / 15 mcg in the US, 10 mcg in the UK, 15 mcg in the EU); ask your clinician about your own dose.</p>
        </div>`;
  const left = `
        <h2>How to use the vitamin D calculator</h2>
        <p>Choose the <strong>US, UK or European</strong> recommendation and type your <strong>age</strong>. You get the recommended amount and the upper limit at once, in IU and in mcg.</p>
        <p>Then add what you take: type the <strong>amount on the label</strong> for one capsule, drop or tablet, pick <strong>IU or mcg</strong>, and say <strong>how many you take a day or a week</strong>. Add as many supplements as you like; the calculator adds them up and shows the share of the recommended amount and of the upper limit.</p>
        <p>Under <strong>Go advanced</strong> you can convert a blood test result between ng/mL and nmol/L.</p>

        <h2>IU to mcg</h2>
        <div class="formula">
          mcg = IU ÷ 40 · IU = mcg × 40
          <small>1 MCG OF VITAMIN D = 40 IU</small>
        </div>
        ${convTable}
        <p>The 40 comes from the way official pages pair the two units; see the sources.</p>`;
  const right = `
        <h2>How much vitamin D do I need?</h2>
        <p>The US recommended amounts and upper limits by age (MedlinePlus):</p>
        ${tbl('us')}
        <p>The NHS advice in the UK:</p>
        ${tbl('uk')}
        <p>The EFSA values in the EU:</p>
        ${tbl('eu')}

        <h2>Weekly capsules</h2>
        <p>A ${E.grp(WEEK)} IU capsule once a week averages ${E.grp(WDAY)} IU (${E.nt(WDAY / E.PER, 1)} mcg) a day. Choose “a week” in the calculator and it divides by 7 for you.</p>
        <p>More nutrition tools: the <a href="/creatine-calculator/">creatine calculator</a>, the <a href="/fiber-calculator/">fiber calculator</a> and the <a href="/protein-intake-calculator/">protein intake calculator</a>.</p>
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
    <span class="mbar-lab" id="vdMLab">Vitamin D recommended a day</span>
    <div class="mbar-vals"><b id="vdMVal">—</b></div>
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
<script>CalcThis.initVitDCalc();</script>
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
const prev = { slug: 'creatine-calculator', menu: 'Creatine', name: 'Creatine Calculator', llms: 'Creatine Calculator' };
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
          <circle cx="16" cy="16" r="5.5" stroke="#37503F" stroke-width="2.4"/>
          <path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" stroke="#B5761F" stroke-width="2.2" stroke-linecap="round"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — vitamin D recommended amount and upper limit by age, IU to mcg both ways, and every supplement you take added up</span></li>\n');
    return h;
  });
}
