const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /weight-loss-percentage-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.wpEngine. Run: node md-files/gen-weightlosspct-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['WP'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.wpEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const LB = 2.20462;

/* ---------- worked examples ---------- */
const A = E.solve('sc', 200 / LB, 180 / LB), B = E.solve('sc', 90, 84), Cc = E.solve('sp', 90, 5), Dd = E.solve('cp', 180 / LB, 10);
const lbRows = [150, 175, 200, 225, 250].map((w) => '<tr><td>' + w + ' lb (' + f1(w / LB) + ' kg)</td>' + [5, 10, 15, 20].map((p) => '<td>' + f1(w * p / 100) + ' lb<small>to ' + f1(w * (1 - p / 100)) + ' lb</small></td>').join('') + '</tr>').join('');

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Centers for Disease Control and Prevention, <a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html" rel="noopener">Steps for Losing Weight</a> (updated 2025-01-17, read 2026-11-06): people who lose weight at a gradual, steady pace — about 1 to 2 pounds a week — are more likely to keep it off; a 5% weight reduction for a person who weighs 200 pounds is 10 pounds, which can lower the risk of some chronic diseases.</li>
          <li>National Heart, Lung, and Blood Institute, <a href="https://www.nhlbi.nih.gov/health/heart-healthy-living/healthy-weight" rel="noopener">Aim for a Healthy Weight</a> (updated 2025-12-11, read 2026-11-06): for people with overweight or obesity, health professionals recommend losing 5% to 10% of initial weight over about 6 months; a loss of 3% to 5% of current weight can lower triglycerides and blood glucose, and more than that can improve blood pressure and cholesterol.</li>
          <li>Competitor pages opened 2026-11-06 for their inputs: Omnicalculator (any two of past weight, current weight, weight lost and percent; kg, lb, st and st + lb), Inch Calculator (initial and current weight) and Coachway (optional goal and timeframe).</li>
          <li>The formula, (starting weight − current weight) ÷ starting weight × 100, is plain arithmetic and the same on every page above.</li>
        </ul>
        <p><small>For information only, not medical advice. The percentages above are guidance for people with overweight or obesity; talk to a clinician about what is right for you.</small></p>`;

const P = {
  slug: 'weight-loss-percentage-calculator', name: 'Weight Loss Percentage Calculator', menu: 'Weight Loss %',
  title: 'Weight Loss Percentage Calculator — % of Body Weight Lost',
  desc: 'Weight loss percentage calculator: enter your starting and current weight for the percent of body weight lost, the way to your goal and what 5% or 10% means.',
  h1: 'Weight Loss Percentage Calculator', eyebrow: 'Percent of body weight lost · any two values · progress to goal · what 5% or 10% means',
  lead: `Enter your <strong>starting weight</strong> and your <strong>current weight</strong> — you get the <strong>percent of your body weight lost</strong>, the weight lost and how far you are toward your goal. Going from <strong>200 lb to 180 lb</strong> is <strong>${E.fmtP(A.P)}</strong>; from 90 kg to 84 kg it is ${E.fmtP(B.P)}. Know the percent instead? It finds the weight for you.`,
  schema: 'Free weight loss percentage calculator: percent of body weight lost from a starting and a current weight (or any two of starting weight, current weight, weight lost and percent), in kg, lb, st or st + lb, with progress toward a goal weight, a table of what 3% to 20% means for your weight, and an optional average loss per week.',
  llms: 'Free weight loss percentage calculator: percent of body weight lost from any two of starting weight, current weight, weight lost and percent (kg, lb, st, st + lb), progress to a goal, what 3-20% means for your weight, average loss per week.',
  card: 'Percent of body weight lost from any two values, with progress to your goal and what 3% to 20% means for your weight.',
  faqs: [
    ['How do I calculate weight loss percentage?', `Subtract your current weight from your starting weight, divide by the starting weight and multiply by 100. For 200 lb to 180 lb: (200 − 180) ÷ 200 × 100 = <strong>${E.fmtP(A.P)}</strong>. For 90 kg to 84 kg: 6 ÷ 90 × 100 = ${E.fmtP(B.P)}. The unit cancels, so it is the same in kg, lb or stones.`],
    ['What is a good weight loss percentage?', 'For people with overweight or obesity, NHLBI says health professionals recommend losing 5% to 10% of initial weight over about 6 months, and that a loss of 3% to 5% can lower triglycerides and blood glucose; losing more than that can improve blood pressure and cholesterol. The CDC gives an example: 5% of 200 pounds is 10 pounds. Whether a percentage is right for you depends on your health, so ask your clinician.'],
    ['How much is 5%, 10% or 20% of my body weight?', `Multiply your weight by the percent: 5% of 200 lb is 10 lb (the CDC’s example), 10% is 20 lb and 20% is 40 lb. The calculator lists 3%, 5%, 10%, 15% and 20% for your own starting weight, and a click on a row sets it as your goal.`],
    ['How do I find my weight after losing a percentage?', `Starting weight × (1 − percent ÷ 100). For 90 kg and a 5% loss: 90 × 0.95 = ${E.trim(Cc.C, 1)} kg, which is ${E.trim(Cc.L, 1)} kg lost. In the calculator choose “Starting weight and percent lost”.`],
    ['How do I find my starting weight from my current weight and a percentage?', `Current weight ÷ (1 − percent ÷ 100). If you now weigh 180 lb after losing 10%: 180 ÷ 0.9 = ${E.trim(Dd.S * LB, 1)} lb. In the calculator choose “Current weight and percent lost”.`],
    ['Why divide by the starting weight, not the current weight?', 'The percentage tells you how much of where you began you have lost, so the starting weight is the base. 200 lb to 180 lb is 20 ÷ 200 = 10% lost. Dividing by 180 would give 11.1%, which is the percentage you would have to gain back to return to 200 lb — a different question.'],
    ['What is the difference between percent of body weight and percent of my goal?', 'Percent of body weight is how much of your starting weight you lost. Percent of your goal is how much of the weight you planned to lose you have lost: starting at 200 lb with a goal of 160 lb, losing 20 lb is 10% of your body weight but 50% of the way to your goal. Add a goal weight and the calculator shows both.'],
    ['How fast is it safe to lose weight?', 'The CDC says people who lose weight at a gradual, steady pace — about 1 to 2 pounds (0.45–0.9 kg) a week — are more likely to keep it off. Under Go advanced, enter the date you started and the calculator shows your average loss per week and as a percent of your starting weight.'],
    ['Is this the same as a percentage change calculator?', 'The arithmetic is the same percent decrease, but this page is built for body weight: it takes pounds, kilograms and stones, solves from any two values and shows progress to a goal. For any other before-and-after number use the <a href="/percentage-change-calculator/">percentage change calculator</a>.'],
    ['How do I plan the calories or the date for a percentage?', 'Use the <a href="/weight-loss-calculator/">weight loss calculator by date</a>: it turns a goal weight and a date into calories a day and shows the fastest safe date. The <a href="/calorie-deficit-calculator/">calorie deficit calculator</a> starts from a deficit instead.'],
    ['How do I enter stones and pounds?', 'Choose “st + lb” and type a weight like <strong>12 st 5 lb</strong> (or 12 5, or 12st5). A single number is read as stones.']
  ],
  pills: [['/weight-loss-calculator/', 'Weight Loss Calculator', '<path d="M12 5v14M6 13l6 6 6-6"/>'], ['/percentage-change-calculator/', 'Percentage Change Calculator', '<path d="M5 19L19 5M7 8a1.5 1.5 0 1 0 0-.01M17 17a1.5 1.5 0 1 0 0-.01"/>'], ['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'], ['/bmi-calculator/', 'BMI Calculator', '<path d="M12 4v16M5 9l7-5 7 5"/>']]
};

const tfld = (id, label, unit, ph, uid, mode, labId) => `<label class="fld" for="${id}"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;
const knowOpts = [['sc', 'Starting and current weight'], ['sl', 'Starting weight and weight lost'], ['sp', 'Starting weight and percent lost'], ['cl', 'Current weight and weight lost'], ['cp', 'Current weight and percent lost'], ['lp', 'Weight lost and percent lost']];

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
        <h2 class="card-h2">Your weights</h2>
        ${seg('wpUnit', 'Weight units', [['kg', 'kg'], ['lb', 'lb'], ['st', 'st'], ['stlb', 'st + lb']], 'lb')}
        ${csel('wpKnow', 'sc', 'I know my', knowOpts)}
        ${tfld('wpA', 'Starting weight', 'lb', 'e.g. 200', 'wpAU', 'text', 'wpALab')}
        ${tfld('wpB', 'Current weight', 'lb', 'e.g. 180', 'wpBU', 'text', 'wpBLab')}
        <p class="av-note" style="margin:0 0 8px">In st + lb, type like 12 st 5 lb.</p>
        <div class="proj-sep"></div>
        ${tfld('wpG', 'Goal weight', 'lb · optional', 'e.g. 180', 'wpGU', 'text')}
        <div class="res-hint" id="wpHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="wpAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <label class="fld" for="wpD"><span class="lab">Starting date <span class="unit">optional</span></span><div class="inp"><input id="wpD" type="text" autocomplete="off" placeholder="Pick a date"></div></label>
          <label class="fld" for="wpT"><span class="lab">Weeks to reach your goal <span class="unit">optional</span></span><div class="inp"><input id="wpT" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 12"></div></label>
          <p class="av-note" style="margin:0 0 8px">With a starting date you get your average loss per week, as a percent of your starting weight, and the date you reach a goal at that pace.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="wpAdvBtn" type="button">
            <span id="wpAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Body weight lost</div>
          <div class="res-big"><span id="wpBig">—</span></div>
          <div class="res-sub" id="wpSub" data-empty="Enter two of your weights.">Enter two of your weights.</div>
        </div>
        <div id="wpBody" style="display:none">
          <p class="res-tip adv-tip" id="wpTip"></p>
          <div id="wpFlags"></div>
          <div id="wpRows"></div>
          <p class="bm-h">Where you are against the NHLBI marks</p>
          <div id="wpBar"></div>
          <p class="av-note" style="margin-top:0">The shaded band is the 5% to 10% of starting weight NHLBI gives; the dark tick is 3%.</p>
          <p class="bm-h">What 3% to 20% means for your weight</p>
          <table class="dtable" id="wpTable"></table>
          <p class="cb-note">Click a row to use it as your goal weight.</p>
          <p class="cb-note">An estimate for adults, not medical advice. Scale weight moves with water and meals, so read the trend over several weeks.</p>
        </div>`;

  const left = `
        <h2>How to use the weight loss percentage calculator</h2>
        <p>Pick your <strong>weight units</strong> (kg, lb, stones, or stones and pounds), then type your <strong>starting weight</strong> and your <strong>current weight</strong>. Know different numbers? Change <strong>I know my</strong> to starting weight and percent, current weight and percent, or any other pair, and the calculator finds the rest.</p>
        <p>Add a <strong>goal weight</strong> to see how far along you are, or open <strong>Go advanced</strong> and add the date you started for your average loss per week.</p>

        <h2>The weight loss percentage formula</h2>
        <div class="formula">
          Percent lost = (starting weight − current weight) ÷ starting weight × 100
          <small>WEIGHT LOST = STARTING WEIGHT − CURRENT WEIGHT</small>
        </div>
        <p>From 200 lb to 180 lb: 200 − 180 = 20 lb lost, and 20 ÷ 200 × 100 = <strong>${E.fmtP(A.P)}</strong>. From 90 kg to 84 kg: 6 ÷ 90 × 100 = <strong>${E.fmtP(B.P)}</strong>. The unit cancels, so kilograms, pounds and stones all give the same percent.</p>

        <h2>What counts as a good percentage?</h2>
        <ul>
          <li><strong>3% to 5%.</strong> NHLBI reports that a loss of 3% to 5% of current weight can lower triglycerides and blood glucose.</li>
          <li><strong>5% to 10% over about 6 months.</strong> What health professionals recommend for people with overweight or obesity, per NHLBI. The CDC’s example: 5% of 200 pounds is 10 pounds.</li>
          <li><strong>1 to 2 pounds a week.</strong> The gradual pace the CDC links with keeping weight off.</li>
        </ul>`;
  const right = `
        <h2>5%, 10%, 15% and 20% by starting weight</h2>
        <table class="dtable"><thead><tr><th>Starting weight</th><th>5%</th><th>10%</th><th>15%</th><th>20%</th></tr></thead><tbody>${lbRows}</tbody></table>
        <p>Each cell shows the pounds lost and the weight you would reach. For any other weight, type it into the calculator above.</p>

        <h2>Percent of body weight or percent of goal?</h2>
        <p>Percent of body weight compares you with where you started, so it is fair across different body sizes. Percent of your goal compares you with the weight you planned to lose: from 200 lb with a goal of 160 lb, losing 20 lb is 10% of your body weight but 50% of the way. With a goal weight entered, the calculator shows both. To plan calories or a date, use the <a href="/weight-loss-calculator/">weight loss calculator by date</a>.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-wp">
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
    <span class="mbar-lab" id="wpMLab">Body weight lost</span>
    <div class="mbar-vals"><b id="wpMVal">—</b></div>
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
<script>CalcThis.initWpCalc();</script>
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
const prevSlug = 'weight-loss-calculator', prevMenu = 'Weight Loss', prevName = 'Weight Loss Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps2 + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName.replace('Calculator', '[^\\n]*') + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "/weight-loss-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/weight-loss-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M8 24L24 8" stroke="#37503F" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="10" cy="11" r="2.4" stroke="#37503F" stroke-width="2.2"/>
          <circle cx="22" cy="21" r="2.4" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — percent of body weight lost from any two of starting weight, current weight, weight lost and percent, with progress to a goal</span></li>\n');
    return h;
  });
}
