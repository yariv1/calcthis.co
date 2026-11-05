const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /dog-age-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json). Every number in the text comes from CalcThis.dogAgeEngine. Run: node md-files/gen-dogage-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* DOGAGE-ENGINE:START */'), app.indexOf('/* DOGAGE-ENGINE:END */')));
const E = CalcThis.dogAgeEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const r0 = (x) => String(Math.round(x));
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const cm = (c, a) => r0(E.chart(c, a)), uc = (a) => r0(E.ucsd(a));

const chartRows = []; for (let y = 1; y <= 20; y++) chartRows.push(`<tr><td>${y}</td><td>${cm('small', y)}</td><td>${cm('medium', y)}</td><td>${cm('large', y)}</td><td>${y <= 16 ? cm('giant', y) : '–'}</td></tr>`);
const slug = 'dog-age-calculator', url = 'https://calcthis.co/' + slug + '/';
const title = 'Dog Age Calculator — Dog Years to Human Years';
const desc = 'Dog age calculator: convert dog years to human years by size or breed with three methods, a curve, senior age and next birthday — or human age to dog age.';
const av5 = E.avma(5), av10 = E.avma(10);
const faqs = [
  ['How do I calculate my dog’s age in human years?', `Use a size-based chart rather than multiplying by 7. The first year of a dog’s life counts as about 15 human years and the second as about 9 more (24 at age 2); after that each year adds roughly 4 to 7 human years depending on size. A 10-year-old dog is about ${cm('small', 10)} in human years if small, ${cm('medium', 10)} if medium, ${cm('large', 10)} if large and ${cm('giant', 10)} if giant. Enter the age and size above and the calculator does it, and also shows the UCSD formula and the AVMA rule.`],
  ['Is one dog year really 7 human years?', `No. The “×7” rule is a rough average that is wrong at both ends: a 1-year-old dog is closer to 15 in human terms (not 7) and a 10-year-old small dog is about ${cm('small', 10)} (not 70). The calculator shows the ×7 figure next to the real ones so you can see the gap.`],
  ['Does my dog’s size change the answer?', `Yes — large and giant dogs age faster after the first two years. At 10 years a small dog is about ${cm('small', 10)}, a medium dog ${cm('medium', 10)}, a large dog ${cm('large', 10)} and a giant dog ${cm('giant', 10)} human years. Pick a size button, type a weight (the chart uses up to 20 lb small, 21–50 medium, 51–90 large, over 90 giant) or choose a breed.`],
  ['What is the UCSD dog age formula?', `Researchers at UC San Diego measured DNA methylation in 104 Labrador retrievers aged 0 to 16 years and compared it with human methylation. Their formula is human age = 16 × ln(dog age) + 31, which gives ${uc(5)} for a 5-year-old and ${uc(10)} for a 10-year-old. It was fitted on Labradors only, so for other breeds it is an estimate; the calculator shows it beside the size chart.`],
  ['How old is a 1-year-old dog in human years?', `About 15 on the size chart and the AVMA rule; the UCSD formula says ${uc(1)}. A 2-year-old is about 24 on the chart and ${uc(2)} on the UCSD formula, which is why the two methods are shown together.`],
  ['When is a dog considered a senior?', 'The AVMA, using AKC data, puts senior age at about 8–11 years for small dogs, 8–10 for medium, 8–9 for large and 6–7 for giant breeds. The calculator shows the senior window on the curve and how long until your dog reaches it.'],
  ['How do I work out my dog’s age from a birthday?', 'Open Go advanced and pick or type the date of birth; the age in years and months fills in. If you adopted a dog and only know the approximate age, type the years and months instead.'],
  ['Can I convert a human age to dog years?', `Yes. Switch to “Human → dog” at the top and enter the human age. A medium dog is ${cm('medium', 5)} in human years at 5 and ${cm('medium', 10)} at 10, so a 60-year-old equivalent is a 10-year-old medium dog; the calculator reads the chart in reverse.`],
  ['How accurate is a dog age calculator?', 'Every calculator is an estimate: breed, genetics and health change how a dog ages, the size charts are averages, and the UCSD formula comes from one breed. That is why this one shows three methods side by side instead of one number.']
];
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Dog Age Calculator', url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Free dog age calculator: convert dog years to human years by size, weight or breed using the AAHA size chart, the AVMA rule and the UCSD epigenetic formula side by side, with a human-versus-dog-age curve, senior age, next-birthday milestone, date-of-birth input and human-to-dog conversion.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Dog Age Calculator', item: url }] };
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
const tfld = (id, label, unit, ph, extra) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (extra || '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></label>`;

const body = `<body class="p-bmr p-avg p-dog">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">Dog years · human years · three methods</div>
    <h1>Dog Age Calculator</h1>
    <p>Enter your dog’s <strong>age and size</strong> to see their age in human years — by the <strong>size chart</strong>, the <strong>AVMA rule</strong> and the new <strong>UC San Diego formula</strong>, side by side. A 10-year-old medium dog is <strong>${cm('medium', 10)}</strong> in human years, not 70.</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your dog</h2>
        <div class="modeseg" id="dgMode" role="group" aria-label="Convert" style="grid-template-columns:1fr 1fr;margin-bottom:14px"><button class="on" type="button" data-v="dog">Dog → human</button><button type="button" data-v="human">Human → dog</button></div>
        <div class="ctl-row"><span class="ctl-lab">Weight units</span><div class="seg" id="dgUnit" role="group" aria-label="Weight units"><button class="on" type="button" data-v="lb">lb</button><button type="button" data-v="kg">kg</button></div></div>
        <div id="dgDogIn"><div class="dg-two">${tfld('dgY', 'Dog’s age', 'years', 'e.g. 7')}${tfld('dgM', 'and', 'months', 'e.g. 3')}</div></div>
        <div id="dgHumanIn" style="display:none">${tfld('dgH', 'Human age', 'years', 'e.g. 60')}</div>
        <span class="lab" style="display:block;font-size:13.5px;font-weight:500;color:var(--ink-soft);margin-bottom:6px">Size</span>
        <div class="chips" id="dgChips" style="margin-top:0;margin-bottom:12px"><button type="button" data-v="small">Small</button><button type="button" data-v="medium" class="on">Medium</button><button type="button" data-v="large">Large</button><button type="button" data-v="giant">Giant</button></div>
        <div class="fld"><span class="lab">Breed <span class="unit">optional</span></span><div class="st-ta"><div class="inp"><input id="dgBreedIn" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="dgBreedList" aria-label="Breed" placeholder="Type a breed to set the size"><input id="dgBreed" type="hidden" value=""></div><div class="st-ta-list" id="dgBreedList" role="listbox" style="display:none"></div></div></div>
        ${tfld('dgW', 'Or your dog’s weight', 'lb', 'e.g. 45', ' id="dgWUnit"')}
        <p class="av-note" id="dgSizeNote"></p>
        <div class="res-hint" id="dgHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="dgAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="dgDobWrap"><label class="fld" for="dgDob"><span class="lab">Date of birth <span class="unit">fills in the age</span></span><div class="inp"><input id="dgDob" type="text" inputmode="numeric" autocomplete="off" placeholder="e.g. 15 June 2019"></div></label></div>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="dgAdvBtn" type="button">
            <span id="dgAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="dgResLab">Human-year equivalent</div>
          <div class="res-big"><span id="dgBig">—</span></div>
          <div class="res-sub" id="dgSub" data-empty="Enter your dog’s age.">Enter your dog’s age.</div>
        </div>
        <div id="dgBody" style="display:none">
          <p class="res-tip adv-tip" id="dgTip"></p>
          <p class="bm-h">Dog years against human years</p>
          <div id="dgChart"></div>
          <div class="proj-sep"></div>
          <table class="dtable" id="dgRows"></table>
          <p class="a1-note">An estimate — every dog ages differently. Not veterinary advice.</p>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="dgMLab">Human years</span>
    <div class="mbar-vals"><b id="dgMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${pill('/age-calculator/', 'Age Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
${pill('/date-calculator/', 'Date Calculator', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>')}
${pill('/water-intake-calculator/', 'Water Intake Calculator', '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>')}
${pill('/calorie-calculator/', 'Calorie Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the dog age calculator</h2>
        <p>Type your dog’s <strong>age</strong> in years and months — or, under Go advanced, a <strong>date of birth</strong>. Then tell the calculator the <strong>size</strong>: tap Small, Medium, Large or Giant, type a <strong>weight</strong>, or pick a <strong>breed</strong> (the breed sets the size from its typical adult weight). If you pick nothing, a medium dog is assumed and the calculator says so.</p>
        <p>You get the age in human years from the size chart, the AVMA rule and the UCSD formula side by side, a <strong>curve</strong> with your dog marked on it and the senior window shaded, the age on the <strong>next birthday</strong>, and the senior age for that size. Switch to <strong>Human → dog</strong> to work the other way.</p>

        <h2>Three ways to convert dog years</h2>
        <table class="dtable">
          <thead><tr><th>Method</th><th>5 years</th><th>10 years</th></tr></thead>
          <tbody>
            <tr><td>Size chart, medium dog (AAHA)</td><td>${cm('medium', 5)}</td><td>${cm('medium', 10)}</td></tr>
            <tr><td>AVMA rule (15, +9, then about 4–5 a year)</td><td>${r0(av5.lo)}–${r0(av5.hi)}</td><td>${r0(av10.lo)}–${r0(av10.hi)}</td></tr>
            <tr><td>UCSD formula, 16 ln(age) + 31</td><td>${uc(5)}</td><td>${uc(10)}</td></tr>
            <tr><td>Old “×7” rule</td><td>35</td><td>70</td></tr>
          </tbody>
        </table>
        <p>The first two come from veterinary guidance and give nearly the same answer for a medium dog. The UCSD formula is higher in the early years because it comes from DNA methylation, not from a chart. The ×7 rule is shown only to make the point that it is wrong.</p>

        <h2>The UCSD epigenetic formula</h2>
        <div class="formula">
          human age = 16 × ln(dog age) + 31
          <small>UC SAN DIEGO · WANG ET AL., CELL SYSTEMS 2020</small>
        </div>
        <p>It was fitted on 104 Labrador retrievers from 0 to 16 years old, so it is an estimate for other breeds. It only works from about two months of age (below that the formula gives zero or less).</p>
      </div>

      <div>
        <h2>Dog years to human years by size</h2>
        <p>Dogs age quickly in the first two years and then more slowly — and larger dogs age faster after that. Size is by adult weight: small up to 20 lb (9 kg), medium 21–50 lb, large 51–90 lb, giant over 90 lb (41 kg).</p>
        <table class="dtable">
          <thead><tr><th>Dog age</th><th>Small</th><th>Medium</th><th>Large</th><th>Giant</th></tr></thead>
          <tbody>${chartRows.join('')}</tbody>
        </table>
        <h2>When is a dog a senior?</h2>
        <p>About <strong>8–11 years</strong> for a small dog, <strong>8–10</strong> medium, <strong>8–9</strong> large and <strong>6–7</strong> giant. The calculator shades that window on the curve.</p>

        <h2>Sources</h2>
        <ul>
          <li><a href="https://www.chewy.com/education/dog/general/dog-years-to-human-years" rel="noopener">Chewy, Dog years to human years</a> (updated 12 February 2026) — the AAHA size chart, the AVMA first-two-years rule and the senior ages by size (AVMA, from AKC data).</li>
          <li>Wang T et al., <a href="https://www.cell.com/cell-systems/pdf/S2405-4712(20)30203-9.pdf" rel="noopener">Quantitative translation of dog-to-human aging by conserved remodeling of the DNA methylome</a>, Cell Systems 2020;11:176 — the formula, 104 Labradors.</li>
          <li>Breed sizes: typical adult weights from the breed standards (AKC, FCI, The Kennel Club) as summarized on each breed’s Wikipedia page, retrieved 5 November 2026; used only to pick a size.</li>
        </ul>
        <p><small>Charts are averages and sources differ slightly (the Old Farmer’s Almanac’s giant column, for example, starts at 12 and 22). For your own dog’s health, ask your vet.</small></p>
        <p>To work out a person’s exact age, use the <a href="/age-calculator/">age calculator</a>; to count days between two dates, the <a href="/date-calculator/">date calculator</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/datepicker.min.js"></script>
<script src="/assets/app.js?v=310"></script>
<script>CalcThis.initDogAgeCalc();</script>
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
edit('build.js', (s) => s.includes("slug: '" + S + "'") ? s : s.replace("  { file: 'steps-to-miles-calculator/index.html', slug: '/steps-to-miles-calculator/' },\n", (mm) => mm + "  { file: '" + slug + "/index.html', slug: '" + S + "' },\n"));
edit('llms.txt', (lt) => lt.includes(S) ? lt : lt.replace(/(- \[Steps to Miles Calculator[^\n]*\n)/, (mm) => mm + '- [' + title + '](' + url + '): Free dog age calculator: dog years to human years by size, weight or breed using the AAHA size chart, the AVMA rule and the UCSD formula side by side, with a curve, senior age, next birthday and human-to-dog conversion.\n'));
edit('partials/header.html', (s) => s.includes(S) ? s : s.replace('          <a href="/steps-to-miles-calculator/">Steps to Miles</a>\n', (mm) => mm + '          <a href="' + S + '">Dog Age</a>\n'));
edit('partials/footer.html', (s) => s.includes(S) ? s : s.replace('          <li><a href="/steps-to-miles-calculator/">Steps to Miles Calculator</a></li>\n', (mm) => mm + '          <li><a href="' + S + '">Dog Age Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + S + '"') ? s : s.replace('  "/steps-to-miles-calculator/": {', () => '  "' + S + '": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/steps-to-miles-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Dog Age Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Steps to Miles Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Dog Age Calculator", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Dog Age Calculator</h3>')) {
    const card = `    <a class="calc" href="${S}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="19" r="8" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5"/>
          <circle cx="7.5" cy="12" r="2.6" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><circle cx="24.5" cy="12" r="2.6" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/>
          <circle cx="12" cy="7" r="2.6" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><circle cx="20" cy="7" r="2.6" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/>
        </svg>
      </span>
      <h3>Dog Age Calculator</h3>
      <p>Dog years to human years by size, weight or breed — the size chart, the AVMA rule and the UCSD formula side by side, with a curve, senior age, next birthday and human-to-dog conversion.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('    <a class="calc" href="/steps-to-miles-calculator/">', () => card + '    <a class="calc" href="/steps-to-miles-calculator/">');
  }
  if (!h.includes('<a href="' + S + '">Dog age</a><span>')) h = h.replace(/(          <li><a href="\/steps-to-miles-calculator\/">Steps to miles<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="' + S + '">Dog age</a><span> — dog years to human years, three methods</span></li>\n');
  return h;
});
