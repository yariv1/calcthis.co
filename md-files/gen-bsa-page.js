const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /bsa-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.bsaEngine. Run: node md-files/gen-bsa-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* BSA-ENGINE:START */'), app.indexOf('/* BSA-ENGINE:END */')));
const E = CalcThis.bsaEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked numbers ---------- */
const S = [['Woman', 165, 60, false], ['Man', 180, 80, true], ['Child, 120 cm, 22 kg', 120, 22, false], ['Infant, 50 cm, 3.5 kg', 50, 3.5, false]];
const ex = S.map((s) => ({ n: s[0], H: s[1], W: s[2], male: s[3], r: E.all(s[2], s[1], s[3]) }));
const by = (r, id) => r.rows.filter((x) => x.id === id)[0].m2;
const exTbl = ex.map((e) => '<tr><td>' + (e.n.indexOf(',') < 0 ? e.n + ', ' + e.H + ' cm, ' + e.W + ' kg' : e.n) + '</td><td>' + f2(by(e.r, 'mosteller')) + '</td><td>' + f2(by(e.r, 'dubois')) + '</td><td>' + f2(by(e.r, 'haycock')) + '</td><td>' + f2(e.r.min) + '–' + f2(e.r.max) + '</td></tr>').join('');
const fTbl = E.FORMS.map((f) => '<tr><td>' + f.name + ' (' + f.year + ')</td><td>' + f.form + '</td></tr>').join('');
const A = ex[0].r, B = ex[1].r, Cc = ex[2].r;
const mosA = by(A, 'mosteller'), dbA = by(A, 'dubois');
const Omni = E.all(60, 170, false);

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Redlarski G, Palkowski A, Krawczuk M, <a href="https://www.nature.com/articles/srep27966" rel="noopener">Body surface area formulae: an alarming ambiguity</a>, Scientific Reports 2016;6:27966, Table 1 — every formula above (weight in kg, height in cm). The Takahira coefficient is 0.007246 there; the R package <em>admiral</em> lists 0.007241, a difference of 0.07% (under 0.001 m²).</li>
          <li>Mosteller RD, Simplified calculation of body-surface area, New England Journal of Medicine 1987;317:1098. Haycock GB, Schwartz GJ, Wisotsky DH, <a href="https://pubmed.ncbi.nlm.nih.gov/650346/" rel="noopener">Geometric method for measuring body surface area: a height-weight formula validated in infants, children, and adults</a>, Journal of Pediatrics 1978;93:62 — 81 subjects from premature infants to adults.</li>
          <li>Australian Prescriber, <em>How to adjust drug doses in chronic kidney disease</em> — the eGFR can be de-indexed to mL/min by multiplying it by the body surface area and dividing by 1.73 (the page returned an error when I opened it; the wording is as quoted in search results).</li>
          <li>Griggs JJ et al., Appropriate chemotherapy dosing for obese adult patients with cancer: ASCO clinical practice guideline, Journal of Clinical Oncology 2012;30:1553, as summarised by <a href="https://ascopost.com/issues/may-15-2012/asco-issues-new-guideline-on-chemotherapy-dosing-for-obese-patients/" rel="noopener">The ASCO Post</a> — doses of cytotoxic chemotherapy for obese adults should use actual body weight; some drugs (vincristine, bleomycin, carboplatin) are dosed differently.</li>
        </ul>
        <p><small>For information only, not medical advice. This calculator does not replace your clinic’s dosing protocol, which sets the formula, the rounding and any cap.</small></p>`;

const P = {
  slug: 'bsa-calculator', name: 'BSA Calculator', menu: 'BSA',
  title: 'BSA Calculator — Body Surface Area, Mosteller & Du Bois',
  desc: 'BSA calculator: body surface area by Mosteller, Du Bois, Haycock and five more formulas side by side in m² and sq ft, plus eGFR in mL/min and dose per m².',
  h1: 'BSA Calculator', eyebrow: 'Body surface area · 8 formulas side by side · m² and sq ft · eGFR and dose per m²',
  lead: `Enter your <strong>height</strong> and <strong>weight</strong> — you get your <strong>body surface area</strong> by the Mosteller formula and by seven others on one scale, so you can see how much the choice of formula matters. A woman of 165 cm and 60 kg has a BSA of <strong>${f2(mosA)} m²</strong> (Mosteller) or <strong>${f2(dbA)} m²</strong> (Du Bois).`,
  schema: 'Free BSA calculator: body surface area in m² and sq ft by Mosteller, Du Bois, Haycock, Gehan & George, Boyd, Fujimoto, Takahira and Schlich side by side on one scale, kg/lb/st and cm/in/m, infants to adults, plus eGFR converted to mL/min and a dose per m² calculation.',
  llms: 'Free BSA calculator: body surface area by Mosteller, Du Bois, Haycock, Gehan & George, Boyd, Fujimoto, Takahira and Schlich in m² and sq ft, with the spread between formulas, eGFR in mL/min and dose per m².',
  card: 'Body surface area by eight formulas side by side — Mosteller, Du Bois, Haycock and more — in m² and sq ft, with eGFR in mL/min and dose per m².',
  faqs: [
    ['What is body surface area (BSA)?', 'Body surface area is the total area of the skin, in square metres, estimated from height and weight. It is used in medicine to scale some drug doses, to index measurements such as kidney function to body size, and in burn care to describe the burned fraction (Redlarski 2016 lists burns, liver-volume indexing and drug dosing among its uses). It says nothing about how much of your weight is fat or muscle.'],
    ['How do I calculate BSA?', `Mosteller: BSA (m²) = √(height in cm × weight in kg ÷ 3,600). For 170 cm and 60 kg: 170 × 60 = 10,200; ÷ 3,600 = 2.83; square root = ${f2(Omni.rows[0].m2)} m². Du Bois: 0.007184 × weight^0.425 × height^0.725 gives ${f2(Omni.rows[1].m2)} m² for the same person. The calculator does it for eight formulas at once, in kg or lb or st and cm or inches or metres.`],
    ['Which BSA formula is the most accurate?', `There is no single best one — the formulas were fitted on different groups of people and disagree. For the woman of 165 cm and 60 kg they range from ${f2(A.min)} to ${f2(A.max)} m² (${f1(A.spread)}% apart), for the man of 180 cm and 80 kg from ${f2(B.min)} to ${f2(B.max)} m² (${f1(B.spread)}%), and for a 120 cm, 22 kg child from ${f2(Cc.min)} to ${f2(Cc.max)} m² (${f1(Cc.spread)}%). A 2016 comparison of 25 formulae in Scientific Reports called the ambiguity alarming. Use the formula your clinic, study or protocol specifies.`],
    ['Which formula is used for children and infants?', 'Haycock (1978) was fitted on 81 subjects from premature infants to adults, so it is the usual choice across that whole range. The calculator accepts weights from 0.5 kg and heights from 30 cm, shows every formula, and lets you make Haycock the headline by clicking its row. For babies and small children the formulas can differ a lot — check which one your protocol names.'],
    ['What is a normal BSA?', 'There is no “normal” to aim for; BSA just describes body size. The figure 1.73 m² is the reference body surface area used to index kidney function: eGFR is reported in mL/min per 1.73 m². The scale on the calculator marks 1.73 m² so you can see where you sit against it.'],
    ['How do I convert eGFR to mL/min with my BSA?', `Under Go advanced enter the eGFR your lab reported (mL/min/1.73 m²). The calculator multiplies it by your BSA and divides by 1.73 — de-indexing it to mL/min, as in Australian Prescriber. For an eGFR of 60 and a BSA of ${f2(mosA)} m² that is ${Math.round(60 * mosA / 1.73)} mL/min. The result depends on the BSA formula you pick; clinical decisions belong with your doctor or pharmacist.`],
    ['How do I calculate a dose from BSA?', `Multiply the dose per m² by the BSA: 100 mg/m² for a BSA of ${f2(mosA)} m² is ${Math.round(100 * mosA)} mg. Under Go advanced the calculator also shows the dose across all eight formulas, because the choice of formula can change the dose by up to ${f1(A.spread)}% for the same person. It uses the unrounded BSA. Your protocol sets the formula, the rounding and any cap, so use it only to check arithmetic.`],
    ['Should chemotherapy be dosed by actual weight in obesity?', 'ASCO’s 2012 guideline (Griggs et al.) says doses of cytotoxic chemotherapy for obese adults should be based on actual body weight, with no cap or adjusted weight, for most drugs; a few (vincristine, bleomycin, carboplatin) are dosed differently. That is guidance for clinicians, not something this calculator applies — it does not cap or adjust the BSA.'],
    ['Is BSA the same as BMI?', 'No. BMI is weight divided by height squared, a screening number for weight relative to height. BSA estimates the area of the skin and is used for dosing and for indexing physiological measurements. Both use only height and weight — see the <a href="/bmi-calculator/">BMI calculator</a>.']
  ],
  pills: [['/bmi-calculator/', 'BMI Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'], ['/ideal-weight-calculator/', 'Ideal Weight Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/body-fat-calculator/', 'Body Fat Calculator', '<path d="M12 3c4 2 7 5 7 9a7 7 0 0 1-14 0c0-4 3-7 7-9z"/>'], ['/lean-body-mass-calculator/', 'Lean Body Mass Calculator', '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z"/>']]
};

const tfld = (id, label, unit, ph, uid, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;

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
        <h2 class="card-h2">Your size</h2>
        ${seg('bsSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${seg('bsHU', 'Height units', [['cm', 'cm'], ['in', 'inches'], ['m', 'm']], 'cm')}
        ${tfld('bsH', 'Height', 'cm', 'e.g. 170', 'bsHL', 'text')}
        ${seg('bsWU', 'Weight units', [['kg', 'kg'], ['lb', 'lb'], ['st', 'st']], 'kg')}
        ${tfld('bsW', 'Weight', 'kg', 'e.g. 70', 'bsWL')}
        <p class="av-note" style="margin:0 0 8px">Sex only changes the Schlich formula. Weights from 0.5 kg and heights from 30 cm work, for infants and children.</p>
        <div class="res-hint" id="bsHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="bsAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${tfld('bsEgfr', 'eGFR from your lab', 'mL/min/1.73 m²', 'e.g. 60')}
          <div class="cb-two">${tfld('bsDose', 'Dose per m²', '', 'e.g. 100')}${tfld('bsDoseU', 'Unit', 'optional', 'e.g. mg', null, 'text')}</div>
          <p class="av-note" style="margin:0 0 8px">eGFR is converted to mL/min with your BSA (÷ 1.73). The dose is multiplied by the unrounded BSA and shown across all eight formulas.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="bsAdvBtn" type="button">
            <span id="bsAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Body surface area</div>
          <div class="res-big"><span id="bsBig">—</span></div>
          <div class="res-sub" id="bsSub" data-empty="Enter your height and weight.">Enter your height and weight.</div>
        </div>
        <div id="bsBody" style="display:none">
          <p class="res-tip adv-tip" id="bsTip"></p>
          <p class="bm-h">Where the eight formulas fall</p>
          <div id="bsRule"></div>
          <table class="dtable" id="bsRows"></table>
          <div id="bsAdvBox" style="display:none"><p class="bm-h">Your numbers</p><table class="dtable" id="bsAdv"></table></div>
          <p class="cb-note">An estimate from height and weight — not medical advice. Your clinic’s protocol sets the formula and the rounding.</p>
        </div>`;

  const left = `
        <h2>How to use the BSA calculator</h2>
        <p>Enter your <strong>height</strong> and <strong>weight</strong> in the units you have — centimetres, inches (or 5'10) or metres; kilograms, pounds or stones. The headline is the <strong>Mosteller</strong> formula; the scale below it shows where the other seven fall, and the table gives each in m² and square feet. <strong>Click any row</strong> to make that formula the headline.</p>
        <p>Open <strong>Go advanced</strong> to convert an <strong>eGFR</strong> to mL/min or to multiply a <strong>dose per m²</strong> by your BSA.</p>

        <h2>The BSA formulas</h2>
        <div class="formula">
          Mosteller: BSA (m²) = √(height cm × weight kg ÷ 3,600)
          <small>W IN KG, H IN CM · THE OTHERS ARE POWER LAWS OF W AND H</small>
        </div>
        <table class="dtable"><thead><tr><th>Formula</th><th>BSA in m²</th></tr></thead><tbody>${fTbl}</tbody></table>
        <p>For 170 cm and 60 kg: Mosteller √(170 × 60 ÷ 3,600) = <strong>${f2(Omni.rows[0].m2)} m²</strong>, Du Bois <strong>${f2(Omni.rows[1].m2)} m²</strong>, Haycock <strong>${f2(Omni.rows[2].m2)} m²</strong>.</p>`;
  const right = `
        <h2>BSA examples by formula</h2>
        <table class="dtable"><thead><tr><th>Person</th><th>Mosteller</th><th>Du Bois</th><th>Haycock</th><th>All eight</th></tr></thead><tbody>${exTbl}</tbody></table>
        <p>All figures in m². The formulas were fitted on different groups of people, so they never agree exactly — a 2016 comparison of 25 formulae called the ambiguity alarming (Redlarski). The wider the spread, the more the formula choice matters; for infants and children it is largest.</p>

        <h2>What BSA is used for</h2>
        <p>Body surface area scales some drug doses, indexes kidney function to body size (eGFR is reported per 1.73 m²) and describes burns. Because it comes from height and weight alone, it does not tell fat from muscle. For other body measures see the <a href="/bmi-calculator/">BMI</a> and <a href="/body-fat-calculator/">body fat</a> calculators.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-bsa">
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
    <span class="mbar-lab" id="bsMLab">Body surface area</span>
    <div class="mbar-vals"><b id="bsMVal">—</b></div>
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
<script>CalcThis.initBsaCalc();</script>
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
function edit(rel, fn) { const fl = ROOT + rel; let s = fs.readFileSync(fl, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fl, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
const prevSlug = 'intermittent-fasting-calculator', prevMenu = 'Intermittent Fasting', prevName = 'Intermittent Fasting Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s) => s.includes("slug: '" + slug + "'") ? s : s.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <a href="' + ps + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <li><a href="' + ps + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + slug + '"') ? s : s.replace('  "/dog-age-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/dog-age-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M16 4c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5zM9 28c0-6 3-10 7-10s7 4 7 10" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M5 8v20M27 8v20" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — body surface area by eight formulas, with eGFR in mL/min and dose per m²</span></li>\n');
    return h;
  });
}
