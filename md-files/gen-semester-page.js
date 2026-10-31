const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /semester-grade-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json). Every number in the text comes from CalcThis.semesterEngine, so text and tool agree. Run: node md-files/gen-semester-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* SEMESTER-ENGINE:START */'), app.indexOf('/* SEMESTER-ENGINE:END */')));
const E = CalcThis.semesterEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const r1 = (x) => String(Math.round(x * 10) / 10);
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

/* ---------- worked examples ---------- */
const std = E.scale('std'), pm = E.scale('pm');
const W = [40, 40, 20];
const mk = (g, w) => g.map((x, i) => ({ g: x == null ? NaN : x, w: w[i] }));
const ex = E.totals(mk([78, 85, null], W), 100, 0);              // two quarters in, final to come
const need = (T) => E.need(ex, T);
const nA = need(90), nB = need(80), nC = need(70), nD = need(60);
const full = E.totals(mk([78, 85, 80], W), 100, 0);
const fullL = E.letterOf(full.soFar, std);
const exLetters = E.totals(mk([E.letterMid('B+'), E.letterMid('A-'), null], W), 100, 0);
const cell = (x) => x <= 0 ? 'Secured' : (x > 100 ? 'Out of reach' : r1(x) + '%');
const ladderRows = std.filter((s) => s.min > 0).map((s) => '<tr><td>' + s.l + '</td><td>' + s.min + '%</td><td>' + cell(need(s.min)) + '</td></tr>').join('');
const dropEx = E.parseGrade('88, 92, 75', 'pct', 1);
const noDrop = E.parseGrade('88, 92, 75', 'pct', 0);

const faqs = [
  ['How do I calculate my semester grade?', `Multiply each term's grade by its weight, add the results and divide by the total weight. With a quarter 1 grade of 78% and a quarter 2 grade of 85% (each worth 40%) and a final exam of 80% (worth 20%), the semester grade is (78 × 40 + 85 × 40 + 80 × 20) ÷ 100 = ${r1(full.soFar)}%, a ${fullL}.`],
  ['What do I need on the final exam to get an A?', `It depends on your grades so far and the final's weight. With 78% and 85% in two quarters worth 40% each, an A (90%) would need ${r1(nA)}% on a final worth 20% — ${nA > 100 ? 'out of reach, since even 100% leaves you at ' + r1(ex.best) + '%' : 'within reach'}. A B (80%) needs ${r1(nB)}%, a C (70%) needs ${r1(nC)}%, and a D (60%) is ${nD <= 0 ? 'already secured' : 'needs ' + r1(nD) + '%'}. The calculator shows every letter at once.`],
  ['How do I find my semester grade if I only have some terms graded?', `Leave the unfinished terms blank. The calculator shows your grade so far (${r1(ex.soFar)}% in the example), the lowest and highest the semester can end on (${r1(ex.worst)}% to ${r1(ex.best)}%), and what you need on the rest. Under Go advanced you can choose to count empty terms as zero instead.`],
  ['Do the weights have to add up to 100?', `No. The calculator scales whatever you enter to 100%, so weights of 2, 2 and 1 work the same as 40, 40 and 20. It tells you when your weights do not add up to 100 so you can check them.`],
  ['Can I use letter grades?', `Yes — switch “Grades as” to Letters. A letter counts as the middle of its band in the plus/minus table (for example B+ is ${E.letterMid('B+')}% and A- is ${E.letterMid('A-')}%, F is ${E.letterMid('F')}%), so a B+ and an A- in two equally weighted terms give ${r1((E.letterMid('B+') + E.letterMid('A-')) / 2)}%. Type percentages for exact results.`],
  ['How do I drop the lowest score?', `Under Go advanced, set “Drop the lowest” to 1 (or more) and type a term's scores as a list such as 88, 92, 75. The calculator drops the lowest score${dropEx.dropped ? '' : 's'} and averages the rest: ${r1(noDrop.v)}% without a drop, ${r1(dropEx.v)}% with one.`],
  ['What if I have extra credit?', `Under Go advanced, enter the extra-credit percentage points and an optional cap. They are added to the semester grade after the weighted average, so 2 points of extra credit turns an ${r1(full.soFar)}% into ${r1(full.soFar + 2)}%.`],
  ['How is this different from the final grade calculator?', `The final grade calculator answers one question — what score do I need on one exam. This page works with the whole semester: any number of terms, the grade so far, the best and worst the semester can end on and the score you need for every letter at once. For one exam, use the <a href="/final-grade-calculator/">final grade calculator</a>; for a course split into homework, quizzes and tests, the <a href="/grade-calculator/">grade calculator</a>.`]
];
const title = 'Semester Grade Calculator — Grade So Far & What You Need';
const desc = 'Free semester grade calculator: enter quarters, midterm and final with weights to see your grade so far and the score you need on the rest for every letter.';
const url = 'https://calcthis.co/semester-grade-calculator/';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const head = headTop
  .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
  .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
  .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
  .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
  .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
  .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">')
  .replace(/<meta name="twitter:title" content="[^"]*">/, () => '<meta name="twitter:title" content="' + esc(title) + '">')
  .replace(/<meta name="twitter:description" content="[^"]*">/, () => '<meta name="twitter:description" content="' + esc(desc) + '">');
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Semester Grade Calculator', url, applicationCategory: 'EducationApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Semester grade calculator: enter any number of terms (quarters, midterm, final) with a grade as a percentage or a letter and a weight, and see your grade so far, the lowest and highest the semester can end on, and the score you need on the remaining terms for every letter grade, with a chart shaded by letter band.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Semester Grade Calculator', item: url }] };
const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const fld = (id, label, unit, ph, extra) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="number" inputmode="decimal" step="any" placeholder="${ph}"${extra || ''}></div></label>`;

const body = `<body class="p-bmr p-sem">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">Quarters · midterm · final</div>
    <h1>Semester Grade Calculator</h1>
    <p>Enter each term's <strong>grade and weight</strong> and see your <strong>grade so far</strong>, the lowest and highest the semester can end on, and the <strong>score you need on the rest for every letter</strong> at once. Quarters of 78% and 85% (40% each) put you at <strong>${r1(ex.soFar)}%</strong> before the final.</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your terms</h2>

        <div class="ctl-row">
          <span class="ctl-lab">Grades as</span>
          <div class="seg" id="smModeSeg" role="group" aria-label="Grades as">
            <button class="on" type="button" data-v="pct">Percent</button>
            <button type="button" data-v="let">Letters</button>
          </div>
        </div>
        <div class="ctl-row">
          <span class="ctl-lab">Letter scale</span>
          <div class="seg" id="smScaleSeg" role="group" aria-label="Letter scale">
            <button class="on" type="button" data-v="std">A 90 · B 80</button>
            <button type="button" data-v="pm">Plus / minus</button>
          </div>
        </div>

        <span class="sm-lab">Layout</span>
        <div class="chips" id="smPre">
          <button type="button" class="on" data-v="q">Quarters + final</button>
          <button type="button" data-v="m">Midterm + final</button>
          <button type="button" data-v="t">Three terms</button>
        </div>

        <div class="sm-head"><span>Term</span><span>Grade</span><span>Weight %</span><span></span></div>
        <div id="smRows"></div>

        <div class="add-row" style="margin-top:10px">
          <button class="btn" id="smAdd" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
            Add term
          </button>
        </div>
        <p class="sm-note" id="smWNote" style="display:none"></p>
        <p class="sm-note">Leave a grade blank for a term still to come — the calculator shows what you need on it.</p>

        <div class="proj-sep"></div>
        <label class="fld" for="smTarget" style="margin-bottom:0">
          <span class="lab">Target semester grade <span class="unit">% · optional</span></span>
          <div class="inp"><input id="smTarget" type="number" inputmode="decimal" step="any" placeholder="e.g. 90"></div>
        </label>
        <div class="chips" id="smTChips" style="margin-top:8px"></div>

        <div class="res-hint" id="smHint" style="display:none;text-align:left;margin:4px 0 8px"></div>

        <div id="smAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="ctl-row" style="display:block;margin-bottom:12px">
            <span class="ctl-lab" style="display:block;margin-bottom:6px">Empty terms count as</span>
            <div class="modeseg" id="smZeroSeg" role="group" aria-label="Empty terms count as" style="grid-template-columns:1fr 1fr">
              <button class="on" type="button" data-v="ignore">Not graded yet</button>
              <button type="button" data-v="zero">Zero</button>
            </div>
          </div>
          <div class="two">
            ${fld('smMax', 'Highest score', '%', '100')}
            <div id="smDropWrap">${fld('smDrop', 'Drop lowest', 'count', '0', ' min="0" max="10"')}</div>
          </div>
          <div class="two">
            ${fld('smEc', 'Extra credit', 'points', '0')}
            ${fld('smEcCap', 'Credit cap', 'points', 'none')}
          </div>
          <div id="smCustomWrap">
            <span class="sm-lab">Custom cutoffs <span style="color:var(--muted);font-weight:500">(blank = standard)</span></span>
            <div class="two">
              ${fld('smCA', 'A from', '%', '90')}
              ${fld('smCB', 'B from', '%', '80')}
            </div>
            <div class="two">
              ${fld('smCC', 'C from', '%', '70')}
              ${fld('smCD', 'D from', '%', '60', ' style="margin-bottom:0"')}
            </div>
          </div>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="smAdvBtn" type="button">
            <span id="smAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="smResLab">Your semester grade</div>
          <div class="res-big"><span id="smBig">—</span> <span id="smBadge"></span></div>
          <div class="res-sub" id="smSub">Enter a grade and a weight for at least one term.</div>
        </div>

        <div id="smBody" style="display:none">
          <p class="res-tip adv-tip" id="smTip"></p>
          <div id="smFlags"></div>

          <p class="bm-h">Your semester, term by term</p>
          <div class="sm-bar" id="smBar"></div>
          <div class="sm-key" id="smKey"></div>

          <div id="smChartWrap" style="display:none">
            <p class="bm-h" style="margin-top:18px">What the rest of the semester decides</p>
            <p class="sm-note" id="smChartCap" style="margin-top:-6px"></p>
            <div id="smChart"></div>
            <p class="sm-note">The line is your semester grade at each score; the shaded bands are the letter grades. The dot is your target.</p>
          </div>

          <div id="smLadderWrap" style="display:none">
            <div class="proj-sep"></div>
            <div class="tally-head"><h3>What you need for each grade</h3></div>
            <p class="add-note" style="text-align:left;margin:-6px 0 6px">Tap a row to use it as your target.</p>
            <table class="dtable bm-act" id="smLadder"></table>
          </div>

          <div id="smAdvOut" style="display:none"></div>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="smMLab">Semester grade</span>
    <div class="mbar-vals"><b id="smMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More school calculators that may interest you</p>
    <div class="pills">
${pill('/final-grade-calculator/', 'Final Grade Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>')}
${pill('/grade-calculator/', 'Grade Calculator', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>')}
${pill('/gpa-calculator/', 'GPA Calculator', '<path d="M12 3l9 5-9 5-9-5 9-5zM3 8v6c0 2 4 4 9 4s9-2 9-4V8"/>')}
${pill('/weighted-average-calculator/', 'Weighted Average Calculator', '<circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the semester grade calculator</h2>
        <p>Pick a <strong>layout</strong> (quarters + final, midterm + final or three terms) or add your own terms. For each one enter the <strong>grade</strong> — a percentage, or a letter if you switch to Letters — and its <strong>weight</strong>. Leave the grade blank for any term you have not had yet.</p>
        <p>The big number is your <strong>grade so far</strong>. Below it you get the lowest and highest the semester can end on, the <strong>score you need on the rest for every letter</strong>, and a chart that shows your semester grade at every possible score. Type a <strong>target grade</strong>, or tap a letter, to focus the answer on it.</p>

        <h2>The semester grade formula</h2>
        <div class="formula">
          Semester grade = Σ (grade × weight) ÷ Σ weights
          <small>EACH TERM'S GRADE TIMES ITS SHARE OF THE SEMESTER</small>
        </div>
        <p>Two quarters of 78% and 85%, each worth 40%, with the final (20%) still to come: (78 × 40 + 85 × 40) ÷ 80 = <strong>${r1(ex.soFar)}%</strong> so far. If the final is 80%, the semester grade is (78 × 40 + 85 × 40 + 80 × 20) ÷ 100 = <strong>${r1(full.soFar)}%</strong>, a ${fullL}.</p>

        <h2>What you need on the final</h2>
        <p>To finish on a target grade <em>T</em>, the score needed on the remaining term is (T × total weight − points so far) ÷ remaining weight. For the example:</p>
        <table class="dtable">
          <thead><tr><th>Grade</th><th>Semester needs</th><th>Needed on the final</th></tr></thead>
          <tbody>${ladderRows}</tbody>
        </table>
        <p>A is out of reach here: even 100% on the final tops out at ${r1(ex.best)}%. The calculator shows this table, and the chart behind it, for your own numbers.</p>
      </div>

      <div>
        <h2>Percent or letters?</h2>
        <p>Percentages give exact results. If you only have letters, the calculator converts each one to the <strong>middle of its band</strong> in the plus/minus scale (A+ ${E.letterMid('A+')}%, A ${E.letterMid('A')}%, A- ${E.letterMid('A-')}%, B+ ${E.letterMid('B+')}%, and so on down to F at ${E.letterMid('F')}%). Two equally weighted terms of B+ and A- come to ${r1((E.letterMid('B+') + E.letterMid('A-')) / 2)}%.</p>

        <h2>Letter scales</h2>
        <table class="dtable">
          <thead><tr><th>Scale</th><th>Cutoffs</th></tr></thead>
          <tbody>
            <tr><td>Standard</td><td>A 90 · B 80 · C 70 · D 60</td></tr>
            <tr><td>Plus / minus</td><td>${pm.filter((s) => s.min > 0).map((s) => s.l + ' ' + s.min).join(' · ')}</td></tr>
          </tbody>
        </table>
        <p>Your school may use different cutoffs. Under <strong>Go advanced</strong> you can set your own A, B, C and D.</p>

        <h2>Empty terms, extra credit and dropped scores</h2>
        <ul>
          <li><strong>Empty terms.</strong> By default a blank term is "not graded yet" and left out of your grade so far. Choose <strong>Zero</strong> to see the grade if it stays empty.</li>
          <li><strong>Extra credit.</strong> Added to the semester grade after the weighted average, with an optional cap.</li>
          <li><strong>Drop the lowest.</strong> Type a term's scores as a list (88, 92, 75) and drop the lowest one or more: ${r1(noDrop.v)}% becomes ${r1(dropEx.v)}% with one dropped.</li>
          <li><strong>Highest score.</strong> If a term can go above 100%, raise this so the needed scores and the chart use the right ceiling.</li>
        </ul>
        <p>For a course split into homework, quizzes and exams use the <a href="/grade-calculator/">grade calculator</a>; for one exam, the <a href="/final-grade-calculator/">final grade calculator</a>; for your GPA across courses, the <a href="/gpa-calculator/">GPA calculator</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=270"></script>
<script>CalcThis.initSemesterCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const dir = ROOT + 'semester-grade-calculator/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '/semester-grade-calculator/'") ? s : s.replace("  { file: 'grade-calculator/index.html',       slug: '/grade-calculator/' },\n", (mm) => mm + "  { file: 'semester-grade-calculator/index.html', slug: '/semester-grade-calculator/' },\n"));
edit('llms.txt', (lt) => lt.includes('/semester-grade-calculator/') ? lt : lt.replace(/(- \[Grade Curve Calculator[^\n]*\n)/, (mm) => mm + '- [Semester Grade Calculator — Grade So Far & What You Need](' + url + '): Free semester grade calculator: enter quarters, midterm and final with weights, as percentages or letters, to see your grade so far, the lowest and highest the semester can end on, and the score you need on the remaining terms for every letter.\n'));
edit('partials/header.html', (s) => s.includes('/semester-grade-calculator/') ? s : s.replace('          <a href="/grade-calculator/">Grade</a>\n', (mm) => mm + '          <a href="/semester-grade-calculator/">Semester Grade</a>\n'));
edit('partials/footer.html', (s) => s.includes('/semester-grade-calculator/') ? s : s.replace('          <li><a href="/grade-calculator/">Grade Calculator</a></li>\n', (mm) => mm + '          <li><a href="/semester-grade-calculator/">Semester Grade Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"/semester-grade-calculator/"') ? s : s.replace('  "/grade-curve-calculator/": {', () => '  "/semester-grade-calculator/": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/grade-curve-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Semester Grade Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Grade Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Semester Grade Calculator", "url": "' + url + '", "applicationCategory": "EducationApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Semester Grade Calculator</h3>')) {
    const card = `    <a class="calc" href="/semester-grade-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="5" width="20" height="22" rx="3" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/>
          <path d="M10 11h12M10 16h12M10 21h7" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </span>
      <h3>Semester Grade Calculator</h3>
      <p>Enter your quarters, midterm and final with weights to see your grade so far, the best and worst the semester can end on, and the score you need on the rest for every letter grade.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('    <a class="calc" href="/test-score-calculator/">', () => card + '    <a class="calc" href="/test-score-calculator/">');
  }
  if (!h.includes('<a href="/semester-grade-calculator/">Semester grade</a><span>')) h = h.replace(/(          <li><a href="\/grade-calculator\/">Grade<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="/semester-grade-calculator/">Semester grade</a><span> — grade so far and what you need on the rest</span></li>\n');
  return h;
});
