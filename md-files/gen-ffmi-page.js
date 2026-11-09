const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /ffmi-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.ffmiEngine. Run: node md-files/gen-ffmi-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* FFMI-ENGINE:START */'), app.indexOf('/* FFMI-ENGINE:END */')));
const E = CalcThis.ffmiEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked numbers ---------- */
const A = E.calc(75, 180, 22);          // Omnicalculator's own worked example
const B = E.calc(90, 190, 12);
const bandA = E.band('m', A.norm), bandB = E.band('m', B.norm);
const Bhi = E.calc(90, 190, 15), Blo = E.calc(90, 190, 9);
const need22 = E.needFfm(22, 180), need25 = E.needFfm(25, 180);
const rngTxt = (b, i) => i === 0 ? 'under ' + b[1] : (b[1] >= 90 ? 'over ' + b[0] : b[0] + '–' + b[1]);
const bandRows = E.BANDS.m.map((b, i) => '<tr><td>' + b[2] + '</td><td>' + rngTxt(b, i) + '</td><td>' + rngTxt(E.BANDS.f[i], i) + '</td></tr>').join('');
const heights = [165, 175, 185, 195], masses = [55, 65, 75, 85];
const grid = heights.map((h) => '<tr><td>' + h + ' cm</td>' + masses.map((m) => '<td>' + f1(E.calc(m / 0.9, h, 10).norm) + '</td>').join('') + '</tr>').join('');
const refRows = E.REFS.m.map((r) => '<tr><td>' + r[1] + ' <small>' + r[2] + '</small></td><td>' + f1(r[0]) + '</td></tr>').join('');
const d20 = Math.abs(0.2 * (1.8 - 2.0)), d16 = Math.abs(0.2 * (1.8 - 1.6));

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Kouri EM, Pope HG, Katz DL, Oliva P, <a href="https://pubmed.ncbi.nlm.nih.gov/7496846/" rel="noopener">Fat-free mass index in users and nonusers of anabolic-androgenic steroids</a>, Clinical Journal of Sport Medicine 1995;5:223–228 (abstract read via Europe PMC, 2026-11-06): FFMI = fat-free body mass in kg ÷ height in metres squared, normalized to a 1.80 m man with a correction of 6.3 × (1.80 − height in m); in 157 male athletes the normalized FFMI of non-users reached a limit of 25.0, 20 Mr. America winners from 1939–1959 averaged 25.4, and many steroid users exceeded 25, some 30. The authors call the findings preliminary.</li>
          <li>Trexler ET et al., <a href="https://pubmed.ncbi.nlm.nih.gov/27930454/" rel="noopener">Fat-Free Mass Index in NCAA Division I and II Collegiate American Football Players</a>, Journal of Strength and Conditioning Research 2017;31(10):2719–2727 (abstract read via Europe PMC): 235 players, DEXA, FFMI normalized to 180 cm; 26.4% were above 25, the mean was 23.7 ± 2.1, the 97.5th percentile was 28.1 and the maximum 31.7. Drug use was not tested in that study as far as the abstract says.</li>
          <li><a href="https://www.omnicalculator.com/health/ffmi" rel="noopener">Omnicalculator FFMI calculator</a> (opened 2026-11-06): the descriptive bands for men and women used on this page — it cites no study for them — and a normalization constant of 6.1, which differs from the 6.3 in Kouri’s paper. <a href="https://ffmicalculator.org" rel="noopener">ffmicalculator.org</a> uses 6.3.</li>
          <li><a href="https://mennohenselmans.com/ffmi-calculator/" rel="noopener">Menno Henselmans’ FFMI calculator</a> (opened 2026-11-06): the average values of 18.9 for men and 15.4 for women, which he attributes to Schutz et al. 2002 (that paper was not opened).</li>
        </ul>
        <p><small>For information only, not medical advice. FFMI depends on a body-fat estimate that can be several points off, and no study sets a hard natural limit.</small></p>`;

const P = {
  slug: 'ffmi-calculator', name: 'FFMI Calculator', menu: 'FFMI',
  title: 'FFMI Calculator — Fat-Free Mass Index & Normalized FFMI',
  desc: 'FFMI calculator: your fat-free mass index and normalized FFMI from height, weight and body fat, on a scale with the 25 reference and a body-fat error range.',
  h1: 'FFMI Calculator', eyebrow: 'Fat-free mass index · normalized FFMI · scale with reference points · body-fat error range · target FFMI',
  lead: `Enter your <strong>height</strong>, <strong>weight</strong> and <strong>body fat %</strong> — you get your <strong>FFMI</strong> and your <strong>normalized FFMI</strong> (adjusted to 1.80 m) on a scale with the reference points from the studies. A man of 180 cm and 75 kg with 22% body fat has an FFMI of <strong>${f1(A.ffmi)}</strong>, ${bandA.label.toLowerCase()} on the usual bands.`,
  schema: 'Free FFMI calculator: fat-free mass index and normalized FFMI (Kouri 1995, 6.3 constant) from height, weight and body fat %, kg/lb/st and cm/in/m, on a scale with the 25.0 reference and 28.1 football percentile, a range for body fat error of 3 points, and a target FFMI mode.',
  llms: 'Free FFMI calculator: fat-free mass index and normalized FFMI from height, weight and body fat, on a scale with reference points from Kouri 1995 and Trexler 2017, with a body-fat error range and a target FFMI mode.',
  card: 'Fat-free mass index and normalized FFMI from height, weight and body fat, on a scale with reference points, a body-fat error range and a target FFMI.',
  faqs: [
    ['What is FFMI?', 'FFMI, the fat-free mass index, is your fat-free mass in kilograms divided by your height in metres squared. Fat-free mass is everything that is not fat: muscle, bone, organs and water. Unlike BMI, FFMI separates fat from the rest, so extra muscle raises it while extra fat does not. It was used in Kouri et al. (1995) to compare athletes of different heights.'],
    ['How do I calculate FFMI?', `Fat-free mass = weight × (1 − body fat %). FFMI = fat-free mass ÷ height². For 75 kg, 180 cm and 22% body fat: fat-free mass = 75 × 0.78 = ${f1(A.ffm)} kg; FFMI = ${f1(A.ffm)} ÷ 1.80² = ${f1(A.ffmi)}. At exactly 1.80 m the normalized FFMI is the same, ${f1(A.norm)}. A man of 190 cm, 90 kg and 12% body fat has ${f1(B.ffm)} kg of fat-free mass, an FFMI of ${f1(B.ffmi)} and a normalized FFMI of ${f1(B.norm)}.`],
    ['What is normalized FFMI, and why 6.3?', `Fat-free mass grows faster than height squared, so taller people score higher. Kouri et al. added a correction of 6.3 × (1.80 − height in m) to put everyone on the scale of a 1.80 m man. Another calculator uses 6.1; the difference is only ${f2(d16)} of an FFMI point at 1.60 m and ${f2(d20)} at 2.00 m, but this page uses the 6.3 from the paper. For ${B.cm} cm: ${f1(B.ffmi)} + 6.3 × (1.80 − 1.90) = ${f1(B.norm)}.`],
    ['What is a good FFMI?', `On Omnicalculator’s bands, which cite no study, a man is below average under 18, average at 18–20, above average at 20–22, excellent at 22–23 and superior at 23–26. For women the bands are shifted down: average 15–17, above average 17–18, excellent 18–19 and superior 19–21.5. The reference averages quoted on Menno Henselmans’ page are 18.9 for men and 15.4 for women. The bands describe a typical range; they are not a health target.`],
    ['Is 25 the natural limit of FFMI?', 'Not as a hard ceiling. Kouri et al. (1995) found that the normalized FFMI of non-users among 157 male athletes reached a limit of 25.0, and Mr. America winners from before the steroid era averaged 25.4; the authors called this preliminary. A later study of 235 American college football players (Trexler 2017) found 26.4% above 25, a 97.5th percentile of 28.1 and a maximum of 31.7, although that abstract does not say the players were drug tested. A value above 25 is unusual in the drug-free samples, not proof of anything about one person.'],
    ['What FFMI do women have?', 'Women carry less fat-free mass per height squared, so their scale sits lower; the average quoted on Menno Henselmans’ page is 15.4 against 18.9 for men, and Omnicalculator’s bands run about 3 points lower. The 25.0, 25.4 and 28.1 reference points come from male athletes and are not shown for women. I did not find a women’s study I could read, so the calculator gives women the bands and the average only.'],
    ['How accurate is an FFMI calculation?', `Only as accurate as the body-fat percentage you enter. Skinfolds, bioimpedance scales and DEXA can differ by several points. Try it: 90 kg at 190 cm gives a normalized FFMI of ${f1(B.norm)} at 12% body fat, ${f1(Blo.norm)} at 9% and ${f1(Bhi.norm)} at 15%. The calculator shows this ±3 point range for your own numbers.`],
    ['What is the difference between FFMI and BMI?', `BMI divides total weight by height squared, so muscle and fat count the same. FFMI divides only the fat-free part, which is why a muscular person can have an “overweight” BMI and a normal body fat. For the 190 cm, 90 kg man above BMI is ${f1(90 / (1.9 * 1.9))}; FFMI is ${f1(B.ffmi)}. See the <a href="/bmi-calculator/">BMI calculator</a> and the <a href="/body-fat-calculator/">body fat calculator</a> for the body-fat figure you need.`],
    ['How much fat-free mass is a target FFMI?', `Under Go advanced enter a target normalized FFMI. At 180 cm a normalized FFMI of 22 needs ${f1(need22)} kg of fat-free mass and 25 needs ${f1(need25)} kg. The calculator subtracts what you have and shows what is left to add, and the body weight that would give at your body fat or one you choose. It makes no claim about how long that takes.`]
  ],
  pills: [['/body-fat-calculator/', 'Body Fat Calculator', '<path d="M12 3c4 2 7 5 7 9a7 7 0 0 1-14 0c0-4 3-7 7-9z"/>'], ['/lean-body-mass-calculator/', 'Lean Body Mass Calculator', '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z"/>'], ['/bmi-calculator/', 'BMI Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'], ['/protein-intake-calculator/', 'Protein Intake Calculator', '<path d="M12 21s-7-4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10z"/>']]
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
        <h2 class="card-h2">Your body</h2>
        ${seg('ffSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${seg('ffHU', 'Height units', [['cm', 'cm'], ['in', 'inches'], ['m', 'm']], 'in')}
        ${tfld('ffH', 'Height', 'inches or 5\'10', 'e.g. 70 or 5\'10', 'ffHL', 'text')}
        ${seg('ffWU', 'Weight units', [['kg', 'kg'], ['lb', 'lb'], ['st', 'st']], 'lb')}
        ${tfld('ffW', 'Weight', 'lb', 'e.g. 165', 'ffWL')}
        ${tfld('ffBf', 'Body fat', '%', 'e.g. 15')}
        <p class="av-note" style="margin:0 0 8px">Don’t know your body fat? Use the <a href="/body-fat-calculator/">body fat calculator</a>. It is the weakest number here, so the results show what a 3-point error does.</p>
        <div class="res-hint" id="ffHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="ffAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="cb-two">${tfld('ffT', 'Target FFMI', 'normalized', 'e.g. 22')}${tfld('ffGb', 'Body fat at goal', '% · optional', 'e.g. 12')}</div>
          <p class="av-note" style="margin:0 0 8px">Shows the fat-free mass that FFMI needs at your height, what you would add, and the body weight that gives at your body fat or the one you choose.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="ffAdvBtn" type="button">
            <span id="ffAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Normalized FFMI</div>
          <div class="res-big"><span id="ffBig">—</span></div>
          <div class="res-sub" id="ffSub" data-empty="Enter your height, weight and body fat.">Enter your height, weight and body fat.</div>
        </div>
        <div id="ffBody" style="display:none">
          <p class="res-tip adv-tip" id="ffTip"></p>
          <p class="bm-h">Where you are on the scale</p>
          <div id="ffScale"></div>
          <table class="dtable" id="ffNums"></table>
          <p class="bm-h">If your body fat is off by 3 points</p>
          <table class="dtable" id="ffErr"></table>
          <p class="bm-h">Reference points</p>
          <table class="dtable" id="ffRef"></table>
          <p class="cb-note" id="ffRefNote" style="display:none">The 25.0, 25.4 and 28.1 reference points come from studies of male athletes, so they are not shown for women.</p>
          <p class="bm-h">Your natural potential at your height</p>
          <table class="dtable" id="ffPot"></table>
          <p class="cb-note" id="ffOdds"></p>
          <div id="ffAdvBox" style="display:none"><p class="bm-h">Your target</p><table class="dtable" id="ffAdv"></table></div>
          <p class="cb-note">The bands are Omnicalculator’s, which cite no study; the references come from the papers listed below. An estimate for adults, not medical advice.</p>
        </div>`;

  const left = `
        <h2>How to use the FFMI calculator</h2>
        <p>Pick <strong>male or female</strong>, enter your <strong>height</strong> (centimetres, inches or 5'10, metres) and <strong>weight</strong> (kg, lb or stones) and your <strong>body fat percentage</strong>. The headline is your <strong>normalized FFMI</strong>; the scale shows where it falls on the usual bands, the table below it shows the raw FFMI, your fat-free mass and fat mass in kg and lb, and a second table shows what a 3-point error in your body fat would do.</p>
        <p>Open <strong>Go advanced</strong> and type a <strong>target FFMI</strong> to see the fat-free mass it needs at your height, how much you would have to add, and the body weight that gives.</p>

        <h2>The FFMI formula</h2>
        <div class="formula">
          Fat-free mass = weight × (1 − body fat %) · FFMI = fat-free mass (kg) ÷ height (m)²
          <small>NORMALIZED FFMI = FFMI + 6.3 × (1.80 − HEIGHT IN M) · KOURI 1995</small>
        </div>
        <p>For a 180 cm, 75 kg man with 22% body fat: fat-free mass = <strong>${f1(A.ffm)} kg</strong>, FFMI = <strong>${f1(A.ffmi)}</strong>, normalized FFMI = <strong>${f1(A.norm)}</strong> (the same, because he is exactly 1.80 m tall).</p>
        <h2>FFMI bands</h2>
        <table class="dtable"><thead><tr><th>Band (Omnicalculator)</th><th>Men</th><th>Women</th></tr></thead><tbody>${bandRows}</tbody></table>
        <p>The last two bands are named “rare in drug-free samples” here because the bands cite no study; the research below shows values above 25 do occur in some drug-free athletes.</p>`;
  const right = `
        <h2>Normalized FFMI by height and fat-free mass</h2>
        <table class="dtable"><thead><tr><th>Height</th>${masses.map((m) => '<th>' + m + ' kg</th>').join('')}</tr></thead><tbody>${grid}</tbody></table>
        <p>Columns are fat-free mass; a person of that fat-free mass at 10% body fat weighs about ${masses.map((m) => Math.round(m / 0.9)).join(', ')} kg. Taller people need more fat-free mass for the same score.</p>

        <h2>Reference points from the research</h2>
        <table class="dtable"><thead><tr><th>Reference (men)</th><th>FFMI</th></tr></thead><tbody>${refRows}</tbody></table>
        <p>These are normalized values from athletes, not targets. Kouri et al. called their 25.0 limit preliminary, and the football players in Trexler et al. went well beyond it.</p>

        <h2>Don’t trust a single body-fat number</h2>
        <p>FFMI depends on a body-fat estimate that skinfolds, scales and DEXA can get several points wrong. A man of 190 cm and 90 kg scores ${f1(Blo.norm)} at 9% body fat and ${f1(Bhi.norm)} at 15% — a ${f1(Bhi.norm - Blo.norm)}-point spread from the estimate alone, which is why the calculator shows the ±3 point range.</p>
        <p>See also the <a href="/lean-body-mass-calculator/">lean body mass calculator</a> and the <a href="/bmi-calculator/">BMI calculator</a>.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-ff">
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
    <span class="mbar-lab" id="ffMLab">Normalized FFMI</span>
    <div class="mbar-vals"><b id="ffMVal">—</b></div>
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
<script>CalcThis.initFfmiCalc();</script>
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
const prevSlug = 'dog-food-calculator', prevMenu = 'Dog Food', prevName = 'Dog Food Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s) => s.includes("slug: '" + slug + "'") ? s : s.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <a href="' + ps + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <li><a href="' + ps + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + slug + '"') ? s : s.replace('  "/dog-food-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/dog-food-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M4 12v8M8 9v14M24 9v14M28 12v8M8 16h16" stroke="#37503F" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="16" cy="16" r="2.2" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — fat-free mass index and normalized FFMI from height, weight and body fat, with reference points and a target FFMI</span></li>\n');
    return h;
  });
}
