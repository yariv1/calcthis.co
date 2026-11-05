const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /cat-age-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json) plus a cross-link from /dog-age-calculator/. Every number in the text comes from CalcThis.catAgeEngine.
   Run: node md-files/gen-catage-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* CATAGE-ENGINE:START */'), app.indexOf('/* CATAGE-ENGINE:END */')));
const E = CalcThis.catAgeEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const r0 = (x) => String(Math.round(x));
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const h = (a) => r0(E.human(a));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const rowsDef = [['3 months', 0.25], ['6 months', 0.5], ['1 year', 1], ['18 months', 1.5], ['2 years', 2]];
for (let y = 3; y <= 25; y++) rowsDef.push([y + ' years', y]);
const chartRows = rowsDef.map((r) => `<tr><td>${r[0]}</td><td>${h(r[1])}</td><td>${cap(E.stage(r[1]))}</td></tr>`).join('');
const slug = 'cat-age-calculator', url = 'https://calcthis.co/' + slug + '/';
const title = 'Cat Age Calculator — Cat Years to Human Years';
const desc = 'Cat age calculator: convert cat years and months to human years or back, see the life stage on a timeline, the next birthday and when your cat turns senior.';
const faqs = [
  ['How do I calculate my cat’s age in human years?', `Use the 15-9-4 rule: the first year of a cat’s life counts as 15 human years, the second adds 9 more (24 at age 2), and every year after that adds 4. A 5-year-old cat is ${h(5)}, a 10-year-old ${h(10)} and a 15-year-old ${h(15)} in human years. Enter the age above and the calculator does it, including months.`],
  ['Is one cat year really 7 human years?', `No. The “×7” rule is wrong at both ends: a 1-year-old cat is about 15 in human terms (not 7) and a 10-year-old cat is about ${h(10)} (not 70). The calculator shows the ×7 figure beside the real one so you can see the gap.`],
  ['How old is a 6-month-old cat in human years?', `About ${h(0.5)}, and a 3-month-old kitten about ${h(0.25)}. Kittens grow fastest early on, which is why the calculator uses the published early-life points (3 months = 4, 6 months = 10, 12 months = 15, 18 months = 21) instead of a straight line from zero.`],
  ['How old is a 1-year-old or 2-year-old cat in human years?', `A 1-year-old cat is about ${h(1)} and a 2-year-old about ${h(2)} (15 + 9). After that, each year adds 4: a 3-year-old is ${h(3)} and a 4-year-old ${h(4)}.`],
  ['What are the life stages of a cat?', 'The AAHA/AAFP 2021 Feline Life Stage Guidelines use four age-based stages: kitten (birth to 1 year), young adult (1 to 6 years), mature adult (7 to 10 years) and senior (over 10 years). Cats 15 and over are often called geriatric, a term from the older six-stage guidelines. The calculator names your cat’s stage and shows how long until the next one.'],
  ['When is a cat considered a senior?', `After 10 years of age — a cat of 11 is about ${h(11)} in human years. The calculator shows how long your cat has until then, and for a cat already past 10 it says so.`],
  ['Can I convert a human age to cat years?', `Yes. Switch to “Human → cat” at the top and enter the human age. A 60-year-old equivalent is about ${(function () { const c = E.cat(60); return Math.floor(c) + ' years'; })()}, an 11-year-old cat; the calculator also shows the ×7 comparison.`],
  ['How do I work out my cat’s age from a birthday?', 'Open Go advanced and pick or type the date of birth; the age in years and months fills in. For an adopted cat with an unknown birthday, type the age the vet estimated instead.'],
  ['How accurate is a cat age calculator?', 'It is an estimate. The 15-9-4 chart is the one used by pet-care organisations and vets, but cats vary with breed, health and lifestyle, and I could not find a single primary table behind it — the sources used are listed on this page. The life stages come from the AAHA/AAFP guidelines.']
];
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Cat Age Calculator', url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free cat age calculator: convert cat years and months to human years or human years to cat years using the 15-9-4 rule with real kitten milestones, with the AAHA/AAFP life stage on a timeline, the next birthday, the time to senior age and a date-of-birth input.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Cat Age Calculator', item: url }] };
const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
const head = headTop
  .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
  .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
  .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
  .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
  .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
  .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">')
  .replace(/<meta name="twitter:title" content="[^"]*">/, () => '<meta name="twitter:title" content="' + esc(title) + '">')
  .replace(/<meta name="twitter:description" content="[^"]*">/, () => '<meta name="twitter:description" content="' + esc(desc) + '">');
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const tfld = (id, label, unit, ph) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></label>`;

const body = `<body class="p-bmr p-avg p-dog p-cat">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">Cat years · human years · life stage</div>
    <h1>Cat Age Calculator</h1>
    <p>Enter your cat’s <strong>age in years and months</strong> to see their age in human years and their <strong>life stage</strong>. A 10-year-old cat is <strong>${h(10)}</strong> in human years, not 70 — and a 6-month-old kitten is already about <strong>${h(0.5)}</strong>.</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your cat</h2>
        <div class="modeseg" id="cgMode" role="group" aria-label="Convert" style="grid-template-columns:1fr 1fr;margin-bottom:14px"><button class="on" type="button" data-v="cat">Cat → human</button><button type="button" data-v="human">Human → cat</button></div>
        <div id="cgCatIn"><div class="dg-two">${tfld('cgY', 'Cat’s age', 'years', 'e.g. 7')}${tfld('cgM', 'and', 'months', 'e.g. 3')}</div></div>
        <div id="cgHumanIn" style="display:none">${tfld('cgH', 'Human age', 'years', 'e.g. 60')}</div>
        <div class="res-hint" id="cgHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="cgAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="cgDobWrap"><label class="fld" for="cgDob"><span class="lab">Date of birth <span class="unit">fills in the age</span></span><div class="inp"><input id="cgDob" type="text" inputmode="numeric" autocomplete="off" placeholder="e.g. 15 June 2019"></div></label></div>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="cgAdvBtn" type="button">
            <span id="cgAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="cgResLab">Human-year equivalent</div>
          <div class="res-big"><span id="cgBig">—</span></div>
          <div class="res-sub" id="cgSub" data-empty="Enter your cat’s age.">Enter your cat’s age.</div>
        </div>
        <div id="cgBody" style="display:none">
          <p class="res-tip adv-tip" id="cgTip"></p>
          <p class="bm-h">Life stages</p>
          <div id="cgScale"></div>
          <div class="proj-sep"></div>
          <table class="dtable" id="cgRows"></table>
          <p class="a1-note">An estimate — every cat ages differently. Not veterinary advice.</p>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="cgMLab">Human years</span>
    <div class="mbar-vals"><b id="cgMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${pill('/dog-age-calculator/', 'Dog Age Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
${pill('/age-calculator/', 'Age Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
${pill('/date-calculator/', 'Date Calculator', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>')}
${pill('/water-intake-calculator/', 'Water Intake Calculator', '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the cat age calculator</h2>
        <p>Type your cat’s <strong>age</strong> in years and months — or, under Go advanced, a <strong>date of birth</strong>. You get the age in human years, the <strong>life stage</strong>, a <strong>timeline</strong> with your cat marked on it, the age on the <strong>next birthday</strong> and how long until your cat is a <strong>senior</strong>. Switch to <strong>Human → cat</strong> to work the other way.</p>

        <h2>The 15-9-4 rule</h2>
        <div class="formula">
          1st year = 15 · 2nd year = +9 · every year after = +4
          <small>CAT YEARS TO HUMAN YEARS</small>
        </div>
        <p>So 2 years is <strong>${h(2)}</strong>, 5 years is <strong>${h(5)}</strong> (24 + 3 × 4), 10 years is <strong>${h(10)}</strong> and 15 years is <strong>${h(15)}</strong>. For kittens the calculator uses the published early-life points — 3 months is ${h(0.25)}, 6 months ${h(0.5)}, 12 months ${h(1)} and 18 months ${h(1.5)} — with straight lines between them.</p>

        <h2>Cat life stages</h2>
        <table class="dtable">
          <thead><tr><th>Stage</th><th>Cat age</th><th>Human years</th></tr></thead>
          <tbody>
            <tr><td>Kitten</td><td>birth to 1 year</td><td>0–${h(1)}</td></tr>
            <tr><td>Young adult</td><td>1 to 6 years</td><td>${h(1)}–${h(6)}</td></tr>
            <tr><td>Mature adult</td><td>7 to 10 years</td><td>${h(7)}–${h(10)}</td></tr>
            <tr><td>Senior</td><td>over 10 years</td><td>${h(11)}+</td></tr>
          </tbody>
        </table>
        <p>These are the four age-based stages of the AAHA/AAFP 2021 Feline Life Stage Guidelines. Cats of 15 and over are often called <strong>geriatric</strong> — a label from the older six-stage guidelines.</p>
      </div>

      <div>
        <h2>Cat years to human years chart</h2>
        <table class="dtable">
          <thead><tr><th>Cat age</th><th>Human years</th><th>Life stage</th></tr></thead>
          <tbody>${chartRows}</tbody>
        </table>

        <h2>Sources</h2>
        <ul>
          <li>AAHA/AAFP, <a href="https://www.aaha.org/resources/2021-aaha-aafp-feline-life-stage-guidelines/summary-7/" rel="noopener">2021 Feline Life Stage Guidelines</a> — the four age-based stages.</li>
          <li><a href="https://www.iams.com/cat/cat-articles/calculating-your-pets-age-cat-years" rel="noopener">IAMS, Calculating your pet’s age in cat years</a> — the 15-9-4 rule and the early-life points (3, 6, 12 and 18 months). The Old Farmer’s Almanac and Omni Calculator publish the same yearly chart.</li>
        </ul>
        <p><small>I could not find one primary table behind the human-year chart, so treat it as the common pet-care convention. For your own cat’s health, ask your vet.</small></p>
        <p>For a dog, use the <a href="/dog-age-calculator/">dog age calculator</a>; to find a person’s exact age, the <a href="/age-calculator/">age calculator</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/datepicker.min.js"></script>
<script src="/assets/app.js?v=311"></script>
<script>CalcThis.initCatAgeCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const dir = ROOT + slug + '/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head.replace('<link rel="stylesheet" href="/assets/style.css', '<link rel="stylesheet" href="/assets/datepicker.min.css">\n<link rel="stylesheet" href="/assets/style.css') + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s = fs.readFileSync(fl, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fl, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const S = '/' + slug + '/';
edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '" + S + "'") ? s : s.replace("  { file: 'dog-age-calculator/index.html', slug: '/dog-age-calculator/' },\n", (mm) => mm + "  { file: '" + slug + "/index.html', slug: '" + S + "' },\n"));
edit('llms.txt', (lt) => lt.includes(S) ? lt : lt.replace(/(- \[Dog Age Calculator[^\n]*\n)/, (mm) => mm + '- [' + title + '](' + url + '): Free cat age calculator: cat years and months to human years (or back) with the 15-9-4 rule and real kitten milestones, the AAHA/AAFP life stage on a timeline, next birthday and time to senior.\n'));
edit('partials/header.html', (s) => s.includes(S) ? s : s.replace('          <a href="/dog-age-calculator/">Dog Age</a>\n', (mm) => mm + '          <a href="' + S + '">Cat Age</a>\n'));
edit('partials/footer.html', (s) => s.includes(S) ? s : s.replace('          <li><a href="/dog-age-calculator/">Dog Age Calculator</a></li>\n', (mm) => mm + '          <li><a href="' + S + '">Cat Age Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + S + '"') ? s : s.replace('  "/dog-age-calculator/": {', () => '  "' + S + '": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/dog-age-calculator/": {'));
edit('index.html', (hm) => {
  if (!hm.includes('"name": "Cat Age Calculator"')) hm = hm.replace(/(        \{ "@type": "WebApplication", "name": "Dog Age Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Cat Age Calculator", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!hm.includes('<h3>Cat Age Calculator</h3>')) {
    const card = `    <a class="calc" href="${S}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M7 14l-1-9 7 5h6l7-5-1 9c1 2 1 4 1 5 0 5-4 8-10 8S6 24 6 19c0-1 0-3 1-5z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="12.5" cy="18" r="1.3" fill="#37503F"/><circle cx="19.5" cy="18" r="1.3" fill="#37503F"/>
        </svg>
      </span>
      <h3>Cat Age Calculator</h3>
      <p>Cat years and months to human years (or back) with real kitten milestones, the AAHA/AAFP life stage on a timeline, the age on the next birthday and the time until your cat is a senior.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    hm = hm.replace('    <a class="calc" href="/steps-to-miles-calculator/">', () => card + '    <a class="calc" href="/steps-to-miles-calculator/">');
  }
  if (!hm.includes('<a href="' + S + '">Cat age</a><span>')) hm = hm.replace(/(          <li><a href="\/dog-age-calculator\/">Dog age<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="' + S + '">Cat age</a><span> — cat years to human years and life stage</span></li>\n');
  return hm;
});
