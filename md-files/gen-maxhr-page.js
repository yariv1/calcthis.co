const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /max-heart-rate-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.mhEngine. Run: node md-files/gen-maxhr-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['MH'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.mhEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const r0 = (x) => Math.round(x);

/* ---------- worked examples ---------- */
const at = (age) => { const o = {}; E.all(age).forEach((x) => { o[x.id] = r0(x.v); }); return o; };
const X35 = at(35), X40 = at(40);
const ageRows = [20, 30, 40, 50, 60, 70, 80].map((a) => { const x = at(a); return '<tr><td>' + a + '</td><td>' + x.fox + '</td><td>' + x.tanaka + '</td><td>' + x.nes + '</td><td>' + x.gulati + '</td></tr>'; }).join('');
const spread35 = Math.max.apply(null, Object.keys(X35).map((k) => X35[k])) - Math.min.apply(null, Object.keys(X35).map((k) => X35[k]));

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Tanaka H, Monahan KD, Seals DR, <a href="https://pubmed.ncbi.nlm.nih.gov/11153730/" rel="noopener">Age-predicted maximal heart rate revisited</a>, J Am Coll Cardiol 2001;37:153–156 (abstract read via Europe PMC, 2026-11-06): a meta-analysis of 351 studies and 18,712 subjects gave HRmax = 208 − 0.7 × age; a laboratory study of 514 healthy subjects gave 209 − 0.7 × age; the line did not differ between men and women or with habitual activity.</li>
          <li>Gulati M et al., <a href="https://pubmed.ncbi.nlm.nih.gov/20585008/" rel="noopener">Heart rate response to exercise stress testing in asymptomatic women: the St. James Women Take Heart Project</a>, Circulation 2010;122:130–137 (abstract read via Europe PMC): in 5,437 asymptomatic women, mean peak heart rate = 206 − 0.88 × age.</li>
          <li>Nes BM et al., <a href="https://pubmed.ncbi.nlm.nih.gov/22376273/" rel="noopener">Age-predicted maximal heart rate in healthy subjects: the HUNT Fitness Study</a>, Scand J Med Sci Sports 2013;23:697–704 (abstract read via Europe PMC): in 3,320 healthy men and women, HRmax = 211 − 0.64 × age, standard error of the estimate 10.8 bpm, with no interaction with gender, physical activity, VO2max or BMI.</li>
          <li>NTNU CERG, <a href="https://www.ntnu.edu/cerg/hrmax" rel="noopener">Maximum Heart Rate Calculator</a> (read 2026-11-06): beta blockers reduce maximum heart rate; the 4×4 interval test for finding your real HRmax; 220 − age can underestimate HRmax by up to 40 beats per minute in seniors.</li>
          <li>Fox / Haskell (220 − age), Inbar (205.8 − 0.685 × age) and Oakland nonlinear (192 − 0.007 × age²): the constants are as published by Omnicalculator (opened 2026-11-06); the original papers were not read.</li>
        </ul>
        <p><small>For information only, not medical advice. Heart rate formulas are population averages. If you have a heart condition, take heart medicines or are unsure whether a maximal test is safe for you, talk to a clinician first.</small></p>`;

const P = {
  slug: 'max-heart-rate-calculator', name: 'Max Heart Rate Calculator', menu: 'Max Heart Rate',
  title: 'Max Heart Rate Calculator by Age — 6 Formulas Compared',
  desc: 'Max heart rate calculator by age: Tanaka, 220 − age, Nes, Gulati, Inbar and Oakland side by side, your measured max and heart rate at each percent of max.',
  h1: 'Max Heart Rate Calculator by Age', eyebrow: 'Six formulas side by side · your measured max · heart rate by percent · field test',
  lead: `Enter your <strong>age</strong> — you get your <strong>estimated maximum heart rate</strong> from six published formulas on one scale, not just one number. At 35 they give <strong>${Math.min.apply(null, Object.keys(X35).map((k) => X35[k]))}–${Math.max.apply(null, Object.keys(X35).map((k) => X35[k]))} bpm</strong>: Tanaka ${X35.tanaka}, 220 − age ${X35.fox}, Nes ${X35.nes}. Add a number you measured and see how far it sits from each.`,
  schema: 'Free max heart rate calculator by age: six formulas (Tanaka 208 − 0.7 × age, Fox 220 − age, Nes/HUNT 211 − 0.64 × age, Gulati for women, Inbar, Oakland) side by side on one bpm scale, your own measured max compared with them, a beta-blocker warning, heart rate at 50–100% of max and the 4×4 field test.',
  llms: 'Free max heart rate calculator by age: Tanaka, Fox 220-age, Nes (HUNT), Gulati (women), Inbar and Oakland side by side with the spread, your measured max, heart rate at 50-100% of max, beta-blocker warning and the 4x4 field test.',
  card: 'Max heart rate from age with six formulas side by side, your measured max compared and heart rate at each percent of max.',
  faqs: [
    ['How do I calculate my maximum heart rate?', `The best known rule is 220 − age (Fox / Haskell): at 40 that is ${X40.fox} bpm. The Tanaka formula, 208 − 0.7 × age, gives ${X40.tanaka} at 40 and the Nes (HUNT) formula, 211 − 0.64 × age, gives ${X40.nes}. The calculator shows all six at once and lets you pick the headline.`],
    ['Is 220 minus age accurate?', `It is a rough average. The Tanaka study found the equation had never been validated in a sample with enough older adults, and the NTNU HUNT team says it can underestimate HRmax by up to 40 beats per minute in seniors. At 35 the six formulas here differ by ${spread35} bpm, and the HUNT study put the standard error of an age formula at 10.8 bpm for any one person.`],
    ['Which max heart rate formula is best?', `Tanaka (208 − 0.7 × age) comes from a meta-analysis of 351 studies and was confirmed in 514 healthy adults, and Nes (211 − 0.64 × age) from 3,320 healthy adults; both found no difference between men and women. The calculator defaults to Tanaka. None of them replaces a measured value.`],
    ['What is the max heart rate for women?', `Tanaka and Nes both found no difference between men and women. The Gulati formula, 206 − 0.88 × age, was derived from 5,437 asymptomatic women: at 35 it gives ${X35.gulati} bpm against ${X35.tanaka} for Tanaka. Pick Female to see it marked as the women-specific row.`],
    ['How do I find my real max heart rate?', 'Use a maximal test. NTNU describes a 4×4 interval test: warm up until you sweat; do two 4-minute intervals hard enough that you are too short of breath to talk, with 3 minutes of active rest between; start a third interval and, two minutes in, push harder until you cannot continue. Your HRmax is the highest heart rate you reach. Without a monitor, hold two fingers to your neck for 30 seconds right after. Enter the number under Go advanced to compare it with the formulas.'],
    ['Do beta blockers change my max heart rate?', 'Yes. NTNU explains that beta blockers block adrenaline and so reduce maximum heart rate, by an amount that depends on the dose. The formulas come from healthy adults, so if you take beta blockers choose Yes — the calculator warns that its numbers are too high — and ask your clinician how to exercise.'],
    ['What heart rate is 70% or 85% of my max?', 'Multiply your max by the percent. The table under the result does it for 50% to 100% from your chosen formula, or from your measured max when you enter one. For named training zones, including Zone 2, use the <a href="/heart-rate-zone-calculator/">heart rate zone calculator</a>.'],
    ['Can my heart rate go above the formula’s number?', 'Yes. The formulas are averages for a group; in the HUNT study the standard error was 10.8 bpm, so many healthy people sit more than 10 bpm above or below. That is why the calculator shows a ±10.8 bpm band and lets you add your measured max.'],
    ['What is the difference between max heart rate and zones?', 'Max heart rate is one number: the highest rate your heart reaches. Zones divide the range below it, often as percents of max or with your resting heart rate. The <a href="/zone-2-heart-rate-calculator/">Zone 2 calculator</a> and the <a href="/heart-rate-zone-calculator/">heart rate zone calculator</a> take it from here.']
  ],
  pills: [['/heart-rate-zone-calculator/', 'Heart Rate Zone Calculator', '<path d="M3 12h4l2-5 4 10 2-5h6"/>'], ['/zone-2-heart-rate-calculator/', 'Zone 2 Heart Rate Calculator', '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>'], ['/vo2-max-calculator/', 'VO2 Max Calculator', '<path d="M4 18l5-6 4 3 7-9"/>'], ['/calories-burned-calculator/', 'Calories Burned Calculator', '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>']]
};

const tfld = (id, label, unit, ph, uid, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;
const fOpts = E.F.map((f) => [f.id, f.name + ' — ' + f.eq]);

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
        <h2 class="card-h2">About you</h2>
        ${seg('mhSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${tfld('mhAge', 'Age', 'years', 'e.g. 35', null, 'numeric')}
        ${csel('mhF', 'tanaka', 'Headline formula', fOpts)}
        ${seg('mhBeta', 'Taking beta blockers', [['n', 'No'], ['y', 'Yes']], 'n')}
        <div class="res-hint" id="mhHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="mhAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${tfld('mhM', 'Measured max heart rate', 'bpm · optional', 'e.g. 190', null, 'numeric')}
          <p class="av-note" style="margin:0 0 8px">From a maximal test (see the 4×4 test below). It is compared with the formulas and used for the percent table.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="mhAdvBtn" type="button">
            <span id="mhAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Estimated maximum heart rate</div>
          <div class="res-big"><span id="mhBig">—</span></div>
          <div class="res-sub" id="mhSub" data-empty="Enter your age.">Enter your age.</div>
        </div>
        <div id="mhBody" style="display:none">
          <p class="res-tip adv-tip" id="mhTip"></p>
          <div id="mhFlags"></div>
          <p class="bm-h">Every formula on one scale</p>
          <div id="mhBar"></div>
          <p class="av-note" style="margin-top:0">Dots are the formulas (amber = your headline). The shaded band is ±10.8 bpm, the standard error in the HUNT study.</p>
          <p class="bm-h">Formulas side by side</p>
          <div id="mhRows"></div>
          <p class="cb-note">Click a formula to make it the headline.</p>
          <p class="bm-h" id="mhPctLab">Heart rate at a percent of your max</p>
          <table class="dtable" id="mhPct"></table>
          <p class="cb-note">An estimate for adults, not medical advice. Formulas are averages: any one person can sit well above or below.</p>
        </div>`;

  const left = `
        <h2>How to use the max heart rate calculator</h2>
        <p>Pick <strong>female or male</strong>, enter your <strong>age</strong> and, if you take beta blockers, switch that to <strong>Yes</strong>. You get the six formulas side by side with the spread between them; click one to make it the headline, or choose it under <strong>Headline formula</strong>.</p>
        <p>Open <strong>Go advanced</strong> and type a max heart rate you measured to see how far it is from the headline and to base the percent table on your own number.</p>

        <h2>Max heart rate formulas</h2>
        <div class="formula">
          Tanaka: 208 − 0.7 × age · Fox: 220 − age · Nes (HUNT): 211 − 0.64 × age
          <small>GULATI (WOMEN): 206 − 0.88 × AGE · INBAR: 205.8 − 0.685 × AGE · OAKLAND: 192 − 0.007 × AGE²</small>
        </div>
        <p>At 35: Tanaka ${X35.tanaka}, Fox ${X35.fox}, Nes ${X35.nes}, Gulati ${X35.gulati}, Inbar ${X35.inbar}, Oakland ${X35.oakland} bpm — ${spread35} beats between the highest and the lowest.</p>

        <h2>Find your real max: the 4×4 test</h2>
        <ol>
          <li>Warm up thoroughly, until you sweat.</li>
          <li>Do two intervals of 4 minutes, hard enough that you are too short of breath to talk, with 3 minutes of active rest between them.</li>
          <li>Start a third interval and, two minutes in, increase your speed further and keep going until you are too exhausted to continue.</li>
          <li>Your HRmax is the highest heart rate you reach. No monitor? Hold two fingers to your neck for 30 seconds right after.</li>
        </ol>
        <p>This is NTNU’s description. Check with a clinician first if you have a heart condition, take heart medicines or are not sure a maximal test is safe for you.</p>`;
  const right = `
        <h2>Max heart rate by age</h2>
        <table class="dtable"><thead><tr><th>Age</th><th>Fox</th><th>Tanaka</th><th>Nes</th><th>Gulati</th></tr></thead><tbody>${ageRows}</tbody></table>
        <p>Beats a minute, rounded. Because 220 − age falls a full beat a year while Tanaka falls 0.7 and Nes 0.64, it is higher than both when you are young and lower than both when you are older; the lines cross somewhere between 25 and 40.</p>

        <h2>Beta blockers</h2>
        <p>NTNU explains that beta blockers block adrenaline and so reduce maximum heart rate, by an amount that depends on the dose. The formulas on this page come from healthy adults and do not apply to you if you take them — choose Yes above and ask your clinician how to exercise.</p>

        <h2>Why the formulas disagree</h2>
        <p>Each comes from a different group of people. Even the best of them is an average: in the HUNT study of 3,320 healthy adults the standard error of an age formula was 10.8 bpm, with no difference by gender, activity level, fitness or BMI. For the zones built on this number, see the <a href="/heart-rate-zone-calculator/">heart rate zone calculator</a>.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-mh">
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
    <span class="mbar-lab" id="mhMLab">Estimated max heart rate</span>
    <div class="mbar-vals"><b id="mhMVal">—</b></div>
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
<script>CalcThis.initMhCalc();</script>
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
const prevSlug = 'weight-loss-percentage-calculator', prevMenu = 'Weight Loss %', prevName = 'Weight Loss Percentage Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps2 + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[Weight Loss Percentage[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "/weight-loss-percentage-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/weight-loss-percentage-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M3 17h6l3-8 5 15 3-9h9" stroke="#37503F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="29" cy="15" r="2" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — estimated maximum heart rate from age with six formulas side by side, your measured max compared and heart rate at each percent of max</span></li>\n');
    return h;
  });
}
