const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /fiber-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.fiberEngine. Run: node md-files/gen-fiber-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['FIBER'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.fiberEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const t1 = (x) => E.trim(x, 1), g0 = (x) => E.trim(x, 0);

/* ---------- worked numbers ---------- */
const K2000 = 2000, T2000 = K2000 / 1000 * E.PERK, K2500 = 2500, T2500 = K2500 / 1000 * E.PERK;
const kEx = E.kcalFrom('f', 35, 165, 65, 1.55), tEx = kEx / 1000 * E.PERK;
const f1 = (id, sv) => E.fiberOf(id, sv, 0);
const DAY = [['oats', 1], ['banana', 1], ['lentils', 1], ['apple', 1], ['broccoli', 1], ['bread', 2]];
const dayRows = DAY.map((d) => { const f = E.byId(d[0]); return '<tr><td>' + f.name + '</td><td>' + d[1] + ' × ' + f.size + '</td><td>' + t1(f1(d[0], d[1])) + ' g</td></tr>'; }).join('');
const dayTotal = DAY.reduce((a, d) => a + f1(d[0], d[1]), 0);
const foodRows = E.FOODS.filter((f) => f.id !== 'own').map((f) => '<tr><td>' + f.name + '</td><td>' + f.size + '</td><td>' + t1(f.g * f.per100 / 100) + ' g</td></tr>').join('');
const foodTable = '<table class="dtable"><thead><tr><th>Food</th><th>One serving</th><th>Fiber</th></tr></thead><tbody>' + foodRows + '</tbody></table>';
const dayTable = '<table class="dtable"><thead><tr><th>Food</th><th>Amount</th><th>Fiber</th></tr></thead><tbody>' + dayRows + '</tbody><tfoot><tr><td colspan="2">Total</td><td>' + t1(dayTotal) + ' g</td></tr></tfoot></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Dahl WJ, Stewart ML, Position of the Academy of Nutrition and Dietetics: Health Implications of Dietary Fiber, J Acad Nutr Diet 2015;115:1861–1870 (abstract read via Europe PMC, 2026-11-07): the Adequate Intake for fiber is 14 g of total fiber per 1,000 kcal, or 25 g for adult women and 38 g for adult men; the mean intake in the United States is 17 g a day and only about 5% of people meet the Adequate Intake.</li>
          <li>Reynolds A, Mann J, Cummings J, Winter N, Mete E, Te Morenga L, Carbohydrate quality and human health: a series of systematic reviews and meta-analyses, Lancet 2019;393:434–445 (abstract read via Europe PMC): the risk reduction was greatest when daily fibre intake was between 25 g and 29 g, and people eating the most fibre had 15–30% lower all-cause and cardiovascular mortality and lower incidence of coronary heart disease, stroke, type 2 diabetes and colorectal cancer than those eating the least (observational data).</li>
          <li>Resting calories: Mifflin-St Jeor equation times your activity level, the same method as the <a href="/calorie-calculator/">calorie calculator</a>.</li>
          <li>Foods: USDA FoodData Central, SR Legacy (public API, read 2026-11-07), total dietary fiber per 100 g: apple raw with skin 2.4 g, banana 2.6, raspberries 6.5, pear 3.1, orange 2.4, avocado 6.7, broccoli cooked 3.3, carrot raw 2.8, lentils cooked 7.9, black beans cooked 8.7, chickpeas cooked 7.6, rolled oats dry 10.1, whole-wheat bread 6.0. The serving sizes are ours and typical; check the label of packaged food.</li>
          <li>Some tables list lower Adequate Intake figures from age 51. I did not read those, so this calculator shows only the adult values above.</li>
        </ul>
        <p><small>For information only, not medical advice. Fiber needs vary with your diet, digestion and any medical condition; ask a clinician if you have a bowel or digestive condition.</small></p>`;

const P = {
  slug: 'fiber-calculator', name: 'Fiber Calculator', menu: 'Fiber', body: 'p-bmr p-fb',
  title: 'Fiber Calculator — How Much Fiber Per Day by Calories',
  desc: 'Fiber calculator: your daily fiber in grams from your calories (14 g per 1,000 kcal) and the fixed 25 g / 38 g adult standard, with a food tally for today.',
  h1: 'Fiber Calculator', eyebrow: 'Fiber per day · from your calories · fixed standard · food tally',
  lead: `Enter your <strong>sex and age</strong> and see how much <strong>fiber</strong> you need a day. Add your calories to get the calorie-based target — at ${E.grp(K2000)} kcal that is <strong>${g0(T2000)} g</strong> — next to the fixed adult standard of ${E.FIX.f} g for women or ${E.FIX.m} g for men. Under <em>Go advanced</em> you can add what you ate today and see how many grams are still to go.`,
  schema: 'Free fiber calculator: daily fiber in grams from your calories (14 g per 1,000 kcal, Academy of Nutrition and Dietetics) and the fixed adult standard (25 g women, 38 g men), calories typed or worked out from height, weight and activity, and a food tally of common foods against your target.',
  llms: 'Free fiber calculator: daily fiber in grams from your calories (14 g per 1,000 kcal) and the fixed adult standard (25 g women, 38 g men) side by side, calories typed or worked out, and a food tally for today with grams still to go.',
  card: 'How much fiber you need a day from your calories, next to the fixed adult standard, with a food tally for today.',
  faqs: [
    ['How much fiber should I eat a day?', `The Academy of Nutrition and Dietetics gives an Adequate Intake of 14 g of fiber per 1,000 kcal, or ${E.FIX.f} g for adult women and ${E.FIX.m} g for adult men. At ${E.grp(K2000)} kcal a day the calorie-based figure is ${g0(T2000)} g; at ${E.grp(K2500)} kcal it is ${g0(T2500)} g. The calculator shows both and uses the calorie-based one as your target when you add your calories.`],
    ['How do I work out fiber from my calories?', `Multiply your calories by 14 and divide by 1,000: ${E.grp(K2000)} kcal × 14 ÷ 1,000 = ${g0(T2000)} g. If you do not know your calories, choose “Work out”, enter height, weight and activity, and the calculator estimates them with the Mifflin-St Jeor equation: a 35-year-old woman, 165 cm, 65 kg, moderately active comes to about ${E.grp(kEx)} kcal and ${g0(tEx)} g of fiber.`],
    ['How much fiber does the average person eat?', 'In the United States the mean intake is about 17 g a day and only about 5% of people meet the Adequate Intake, according to the Academy of Nutrition and Dietetics position paper. Most people therefore have a gap to close.'],
    ['Does the 25 g and 38 g standard change with age?', 'Some tables list lower figures from age 51. I could not read a primary source for those numbers, so this calculator shows only the adult values from the Academy position paper (25 g women, 38 g men) and the calorie-based target, which scales with how much you eat.'],
    ['Which foods are high in fiber?', `Per 100 g, USDA lists rolled oats (dry) at 10.1 g, black beans (cooked) at 8.7 g, lentils (cooked) at 7.9 g, chickpeas (cooked) at 7.6 g, avocado at 6.7 g and raspberries at 6.5 g. A sample day of ${DAY.map((d) => d[1] > 1 ? d[1] + ' × ' + E.byId(d[0]).name.toLowerCase() : E.byId(d[0]).name.toLowerCase()).join(', ')} comes to ${t1(dayTotal)} g.`],
    ['Is more fiber better?', 'In the 2019 Lancet analysis the risk reduction was greatest at 25–29 g a day, and people eating the most fibre had 15–30% lower risk of several diseases than those eating the least. These are observational links, not proof that fibre alone caused the difference, and the calculator’s numbers are intakes to aim for, not treatment.'],
    ['How do I use the food tally?', 'Open Go advanced, pick a food, type how much you ate in servings or grams and press Add food for the next. The result then shows the fiber you have had today, the share of your target and the grams still to go. For foods that are not listed, choose “My own food” and type the fiber from the label.'],
    ['Do I subtract fiber to get net carbs?', 'Net carbs are total carbohydrate minus fiber (and some sugar alcohols). The <a href="/net-carb-calculator/">net carb calculator</a> does the subtraction for a food label.']
  ],
  pills: [['/net-carb-calculator/', 'Net Carb Calculator', '<path d="M4 18l5-6 4 3 7-9"/>'], ['/calorie-calculator/', 'Calorie Calculator', '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>'], ['/macro-calculator/', 'Macro Calculator', '<path d="M3 12h4l2-5 4 10 2-5h6"/>'], ['/protein-intake-calculator/', 'Protein Intake Calculator', '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>']]
};

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;
const ACT = [[1.2, 'Sedentary — little or no exercise'], [1.375, 'Light — 1–3 days/week'], [1.55, 'Moderate — 3–5 days/week'], [1.725, 'Active — 6–7 days/week'], [1.9, 'Very active — hard training / physical job']];
const plus = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const box = (fid, label, id, ph, uid, u, btns, mode) => `<div class="fld"><span class="lab">${label}</span><div class="cf-box"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}" aria-label="${label}"><div class="seg cf-u" id="${uid}" data-u="${u}" role="group" aria-label="${label} unit">${btns.map((b) => `<button type="button"${b[0] === u ? ' class="on"' : ''} data-v="${b[0]}">${b[1]}</button>`).join('')}</div></div></div>`;

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
        ${seg('fbSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${tfld('fbAge', 'Age', 'years', 'e.g. 35', 'numeric')}
        ${seg('fbCal', 'Calories', [['type', 'Type them'], ['calc', 'Work out']], 'type')}
        <div id="fbKWrap">${tfld('fbK', 'Calories you eat per day', 'kcal · optional', 'e.g. 2000')}</div>
        <div id="fbCalcWrap" style="display:none">
          ${box('h', 'Height', 'fbH', 'e.g. 70 or 5\'10', 'fbHu', 'in', [['in', 'in'], ['cm', 'cm']], 'text')}
          ${box('w', 'Weight', 'fbW', 'e.g. 154', 'fbWu', 'lb', [['lb', 'lb'], ['kg', 'kg'], ['st', 'st']])}
          ${csel('fbAct', 1.55, 'Activity level', ACT)}
        </div>
        <div class="res-hint" id="fbHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="fbAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="bm-h">Track what you ate today</p>
          <div id="fbRows" class="cf-rows one"></div>
          <div class="add-row split" style="margin-top:10px"><button class="btn" id="fbAdd" type="button">${plus} Add food</button><button class="linkbtn" id="fbClear" type="button">Clear all</button></div>
          <div class="proj-sep"></div>
          ${tfld('fbPK', 'Fiber per 1,000 kcal I use', 'g · optional', 'e.g. 14')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="fbAdvBtn" type="button">
            <span id="fbAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Fiber you need a day</div>
          <div class="res-big"><span id="fbBig">—</span></div>
          <div class="res-sub" id="fbSub" data-empty="Enter your age.">Enter your age.</div>
        </div>
        <div id="fbBody" style="display:none">
          <p class="res-tip adv-tip" id="fbTip"></p>
          <p class="bm-h">Where you stand</p>
          <div id="fbBar"></div>
          <p class="bm-h">Your targets</p>
          <table class="dtable" id="fbTargets"></table>
          <div id="fbTallyWrap" style="display:none">
            <p class="bm-h">What you ate today</p>
            <table class="dtable" id="fbTally"></table>
          </div>
          <p class="cb-note">An estimate for healthy adults, not medical advice. Fiber in real food varies with the variety, the ripeness and the cooking.</p>
        </div>`;
  const left = `
        <h2>How to use the fiber calculator</h2>
        <p>Choose <strong>female or male</strong> and type your <strong>age</strong>. You get the fixed adult standard straight away. Add your <strong>daily calories</strong> — typed, or worked out from your height, weight and activity — to get the calorie-based target next to it.</p>
        <p>Open <strong>Go advanced</strong> to track what you ate today: pick a food, type how much in servings or grams, and see the grams still to go. You can also change the 14 g per 1,000 kcal if you follow another guideline.</p>

        <h2>The formula</h2>
        <div class="formula">
          fiber (g) = calories ÷ 1,000 × 14
          <small>THE ADEQUATE INTAKE OF 14 G OF FIBER PER 1,000 KCAL (ACADEMY OF NUTRITION AND DIETETICS)</small>
        </div>
        <p>${E.grp(K2000)} kcal → ${g0(T2000)} g · ${E.grp(K2500)} kcal → ${g0(T2500)} g. The fixed adult standard is ${E.FIX.f} g for women and ${E.FIX.m} g for men.</p>

        <h2>Fiber in common foods</h2>
        ${foodTable}
        <p>USDA values per 100 g multiplied by a typical serving; the serving sizes are ours.</p>`;
  const right = `
        <h2>How much fiber do I need?</h2>
        <p>The Academy of Nutrition and Dietetics gives 14 g per 1,000 kcal, or ${E.FIX.f} g for adult women and ${E.FIX.m} g for adult men. The average US adult eats about ${E.USAVG} g a day, and in the 2019 Lancet analysis the risk reduction was greatest at ${E.LO}–${E.HI} g a day.</p>

        <h2>A sample day</h2>
        ${dayTable}
        <p>That is ${t1(dayTotal)} g, against a calorie-based target of ${g0(T2000)} g at ${E.grp(K2000)} kcal.</p>
        <p>For the carbohydrate side of a food label, see the <a href="/net-carb-calculator/">net carb calculator</a>.</p>
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
    <span class="mbar-lab" id="fbMLab">Fiber a day</span>
    <div class="mbar-vals"><b id="fbMVal">—</b></div>
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
<script>CalcThis.initFiberCalc();</script>
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
const prev = { slug: 'caffeine-half-life-calculator', menu: 'Caffeine Half Life', name: 'Caffeine Half Life Calculator', llms: 'Caffeine Half Life Calculator' };
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
          <path d="M16 27V12" stroke="#37503F" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M16 18c-4 0-6-2-6-6 4 0 6 2 6 6zM16 14c0-4 2-6 6-6 0 4-2 6-6 6zM16 22c4 0 6-2 6-6-4 0-6 2-6 6z" stroke="#37503F" stroke-width="2.2" stroke-linejoin="round"/>
          <circle cx="16" cy="5" r="2" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — how much fiber you need a day from your calories, with the fixed adult standard and a food tally for today</span></li>\n');
    return h;
  });
}
