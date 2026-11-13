const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /z-score-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.zsEngine. Run: node md-files/gen-zscore-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE', 'CI', 'ZSCORE'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const E = CalcThis.zsEngine;
const fx = (x, d) => { const s = x.toFixed(d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s.replace('-', '−'); };
const f2 = (x) => fx(x, 2), f4 = (x) => fx(x, 4), f3 = (x) => fx(x, 3);
const pc = (p) => fx(p * 100, 2) + '%';
const A = { x: 85, m: 75, s: 10 }, zA = E.zOf(A.x, A.m, A.s, 1), pA = E.probs(zA);
const B = { x: 640, m: 500, s: 100 }, zB = E.zOf(B.x, B.m, B.s, 1), pB = E.probs(zB);
const S4 = { x: 62, m: 58.75, s: 7.854 }; const zS4 = E.zOf(S4.x, S4.m, S4.s, 1), pS4 = E.probs(zS4);
const N1 = { x: 76, m: 75, s: 10, n: 36 }, zN = E.zOf(N1.x, N1.m, N1.s, 1 / Math.sqrt(N1.n)), pN = E.probs(zN);
const z2 = E.probs(2), z3 = E.probs(3), z1 = E.probs(1);
const z95 = E.zOfP(0.95);
const tblPct = '<table class="dtable"><thead><tr><th>Percentile</th><th>z-score</th></tr></thead><tbody>' + [1, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5].map((p) => '<tr><td>' + p + (p === 1 ? 'st' : 'th') + '</td><td>' + f4(E.zOfP(p / 100)) + '</td></tr>').join('') + '</tbody></table>';
const tblConf = '<table class="dtable"><thead><tr><th>Confidence level</th><th>Two-tailed z</th><th>One-tailed z</th></tr></thead><tbody>' + [80, 90, 95, 98, 99, 99.9].map((c) => '<tr><td>' + c + '%</td><td>±' + f4(E.zCrit(c / 100)) + '</td><td>' + f4(E.zOfP(c / 100)) + '</td></tr>').join('') + '</tbody></table>';
const zRows = []; for (let i = 0; i <= 34; i++) { const z0 = i / 10, cells = []; for (let j = 0; j <= 9; j++) cells.push('<td>' + E.probs(z0 + j / 100).left.toFixed(4) + '</td>'); zRows.push('<tr><td>' + z0.toFixed(1) + '</td>' + cells.join('') + '</tr>'); }
const tblZ = '<div class="zs-tbl"><table class="dtable zs-ztab" id="zsZTable"><thead><tr><th>z</th>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => '<th>0.0' + j + '</th>').join('') + '</tr></thead><tbody>' + zRows.join('') + '</tbody></table></div>';
const tblBands = '<table class="dtable"><thead><tr><th>Distance from the mean</th><th>Share of the group</th></tr></thead><tbody>' + [1, 2, 3].map((k) => '<tr><td>within ' + k + ' standard deviation' + (k > 1 ? 's' : '') + '</td><td>' + pc(E.between(-k, k)) + '</td></tr>').join('') + '</tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The z-score z = (x − μ) ÷ σ and the shares of a normal population within 1, 2 and 3 standard deviations (68.27%, 95.45%, 99.73%) are given in the NIST/SEMATECH e-Handbook of Statistical Methods, section 6.5.1 (“What do we mean by ‘Normal’ data?”); the standard normal distribution (mean 0, standard deviation 1) is defined in section 1.3.6.6.1 of the same handbook. Both pages read on 2026-11-13.</li>
          <li>The feature set was compared with the z-score calculators of calculator.net, Omnicalculator, CalculatorSoup, GigaCalculator, 8gwifi and Statistics By Jim, all opened on 2026-11-13. Probabilities come from the normal distribution function of this site's p-value calculator, checked against an independent calculation and against published z-table values.</li>
          <li>Scales such as IQ or SAT scores are not converted here, because no source for their conventions was read.</li>
        </ul>
        <p><small>For information only. Check your own data and assumptions before drawing conclusions.</small></p>`;

const P = {
  slug: 'z-score-calculator', name: 'Z-Score Calculator', menu: 'Z Score', body: 'p-bmr p-zs',
  title: 'Z-Score Calculator: Score, Percentile & Probability',
  desc: 'Z-score calculator: find the z-score of a value from the mean and standard deviation, or work back from a z-score or percentile. Compare two scores.',
  h1: 'Z-Score Calculator', eyebrow: 'Score, percentile and probability · compare two scores · live bell curve',
  lead: `Type a <strong>score, the mean and the standard deviation</strong> and get the <strong>z-score</strong>, the percentile and the areas under the curve, drawn on a bell curve with your own units. A score of <strong>${A.x}</strong> on a test with a mean of <strong>${A.m}</strong> and a standard deviation of <strong>${A.s}</strong> has a z-score of <strong>${f2(zA)}</strong>, higher than <strong>${pc(pA.left)}</strong> of the group. Know the z-score or percentile instead? Type it with two of the three boxes and the third is worked out. Or compare two scores from different tests.`,
  schema: 'Free z-score calculator: the z-score of a value from the mean and standard deviation, the percentile and the areas under the normal curve, the score, mean or standard deviation from a z-score or percentile, the z-score of a sample mean, a comparison of two scores from different scales, the critical z-score for a confidence level, the area between two z-scores, and z-scores for a pasted list, with a live bell curve in z-scores and in your own units.',
  llms: 'Free z-score calculator: z-score from a score, mean and standard deviation; percentile and probabilities; work backwards from a z-score or percentile; compare two scores on different scales; sample mean; list of numbers; live bell curve.',
  card: 'Z-score of any value, its percentile and probabilities, or go back from a z-score. Compare two scores on a live bell curve.',
  faqs: [
    ['How do I calculate a z-score?', 'Subtract the mean from your score and divide by the standard deviation: z = (x − μ) ÷ σ. For a score of ' + A.x + ' with a mean of ' + A.m + ' and a standard deviation of ' + A.s + ', z = (' + A.x + ' − ' + A.m + ') ÷ ' + A.s + ' = ' + f2(zA) + '.'],
    ['What does a z-score tell me?', 'How many standard deviations a value is above (positive) or below (negative) the mean. A z-score of 0 is exactly the mean. A z-score of ' + f2(zA) + ' means one standard deviation above it, which is higher than ' + pc(pA.left) + ' of a normal group.'],
    ['How do I turn a z-score into a percentile?', 'The percentile is the area under the standard normal curve to the left of z. Type the z-score in the calculator and read “Below z” in the areas table: z = ' + f2(zA) + ' gives ' + pc(pA.left) + ', so about ' + pc(pA.right) + ' score higher. The z table on this page lists the same areas.'],
    ['How do I find the z-score for a percentile?', 'Type the percentile in the Percentile box. The 95th percentile has z = ' + f4(z95) + ', the 50th has z = 0 and the 5th has z = ' + f4(E.zOfP(0.05)) + '. The percentile table on this page lists more.'],
    ['What z-score do I need for 90%, 95% or 99% confidence?', 'The two-tailed critical z-scores are ±' + f4(E.zCrit(0.90)) + ' for 90%, ±' + f4(E.zCrit(0.95)) + ' for 95% and ±' + f4(E.zCrit(0.99)) + ' for 99%. In Go advanced, type a confidence level to get its critical z-score; the table on this page lists more levels, one-tailed too.'],
    ['How do I compare scores from different tests?', 'Switch to “Compare two” and type each score with its own mean and standard deviation. A ' + A.x + ' on a test with mean ' + A.m + ' and standard deviation ' + A.s + ' has z = ' + f2(zA) + '; a ' + B.x + ' on a test with mean ' + B.m + ' and standard deviation ' + B.s + ' has z = ' + f2(zB) + '. The second is the better result compared with its group (' + pc(pB.left) + ' vs ' + pc(pA.left) + ').'],
    ['What is the z-score of a sample mean?', 'Go advanced and type the sample size n: the standard error σ ÷ √n replaces σ. A sample of ' + N1.n + ' people with a mean of ' + N1.x + ', when the population mean is ' + N1.m + ' and σ = ' + N1.s + ', gives z = (' + N1.x + ' − ' + N1.m + ') ÷ (' + N1.s + ' ÷ √' + N1.n + ') = ' + f2(zN) + '.'],
    ['How do I find the score, mean or standard deviation from a z-score?', 'Type the z-score (or a percentile) and any two of the score, mean and standard deviation: the empty box is worked out. For example z = ' + f2(zA) + ', mean ' + A.m + ' and standard deviation ' + A.s + ' give a score of ' + (A.m + zA * A.s) + ' (x = μ + z × σ).'],
    ['Is a z-score above 2 or 3 unusual?', 'For a bell-shaped group, ' + pc(1 - z2.between) + ' of values lie more than 2 standard deviations from the mean (either side) and ' + pc(z3.two) + ' lie more than 3 away. The calculator shows the exact share outside your own z-score, so you can judge for yourself.'],
    ['Can I get a z-score for every number in a list?', 'Yes. Go advanced, paste the numbers separated by commas, spaces or new lines, and a table shows each value’s z-score and marks those beyond ±2 and ±3. Choose population (÷ n) or sample (÷ n − 1) for the standard deviation, and use the mean and spread above to score a new value.'],
    ['What is the difference between a z-score and a p-value?', 'A z-score says how far a value is from the mean in standard deviations. A p-value is the probability of a result at least that extreme. The areas table turns your z-score into one-tailed and two-tailed probabilities; for tests of a hypothesis use the <a href="/p-value-calculator/">p-value calculator</a>.']
  ],
  pills: [['/p-value-calculator/', 'P-Value Calculator', '<path d="M3 24c4 0 6-16 13-16s9 16 13 16"/><path d="M3 24h26"/>'], ['/confidence-interval-calculator/', 'Confidence Interval Calculator', '<path d="M4 16h24M4 11v10M28 11v10"/>'], ['/standard-deviation-calculator/', 'Standard Deviation Calculator', '<path d="M3 18c3 0 4-12 9-12s6 12 9 12"/><path d="M12 6v14"/>'], ['/average-calculator/', 'Average Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>']]
};

const tfld = (id, label, unit, ph, mode, labId) => `<label class="fld" for="${id}"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkSeg = (id, label, opts, def) => `<div class="fld"><span class="lab">${label}</span><div class="seg zs-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;

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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const input = `
        <h2 class="card-h2">Your score</h2>
        ${mkSeg('zsMode', 'What do you want to do?', [['one', 'One z-score'], ['two', 'Compare two']], 'one')}
        ${tfld('zsX', 'Your score (x)', '', 'e.g. 85', 'decimal', 'zsXLab')}
        <div class="zs-two">${tfld('zsMean', 'Mean of the group', '', 'e.g. 75', 'decimal', 'zsMeanLab')}${tfld('zsSd', 'Standard deviation', '', 'e.g. 10', 'decimal', 'zsSdLab')}</div>
        <div id="zsBW" style="display:none">
          ${tfld('zsX2', 'Score B', '', 'e.g. 640')}
          <div class="zs-two">${tfld('zsMean2', 'Mean for B', '', 'e.g. 500')}${tfld('zsSd2', 'Std. deviation for B', '', 'e.g. 100')}</div>
        </div>
        ${note('zsMainNote')}
        <div id="zsZW">
          <p class="zs-sech">Or use a z-score or percentile <span>· optional</span></p>
          <div class="zs-two">${tfld('zsZ', 'z-score', '', 'e.g. 1.5')}${tfld('zsPct', 'Percentile', '%', 'e.g. 84')}</div>
          ${note('zsZNote')}
        </div>
        <div class="res-hint" id="zsHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="zsAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="zsNW">
          <p class="zs-sech">Score is the average of a sample <span>· optional</span></p>
          ${tfld('zsN', 'Sample size (n)', '', 'e.g. 36', 'numeric')}
          ${note('zsNNote')}
          </div>
          <div id="zsConfW">
          <p class="zs-sech">Critical z-score for a confidence level <span>· optional</span></p>
          ${tfld('zsConf', 'Two-tailed confidence level', '%', 'e.g. 95')}
          ${note('zsConfNote')}
          </div>
          <p class="zs-sech">Share of the group between two z-scores <span>· optional</span></p>
          <div class="zs-two">${tfld('zsZ1', 'From z-score', '', 'e.g. -1')}${tfld('zsZ2', 'To z-score', '', 'e.g. 1')}</div>
          ${note('zsBetweenNote')}
          <p class="zs-sech">Z-scores for a list of numbers <span>· optional</span></p>
          <div class="fld"><label class="lab" for="zsList">Your numbers</label><textarea class="zs-ta" id="zsList" placeholder="e.g. 62, 70, 55, 81, 48, 66&#10;or paste a column from Excel" aria-label="Your numbers" spellcheck="false"></textarea></div>
          ${mkSeg('zsListKind', 'Standard deviation of the list', [['pop', 'Population (÷ n)'], ['sample', 'Sample (÷ n − 1)']], 'pop')}
          ${note('zsListNote')}
          <p class="zs-sech">Display <span>· optional</span></p>
          ${tfld('zsDec', 'Decimal places', '', 'e.g. 3', 'numeric')}
          ${note('zsDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="zsClear" type="button">Clear fields</button>
          <button class="advbtn" id="zsAdvBtn" type="button">
            <span id="zsAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="zsLab">z-score</div>
          <div class="res-big"><span id="zsBig">—</span></div>
          <div class="res-sub" id="zsSub" data-empty="Type a score, the mean and the standard deviation to see the z-score.">Type a score, the mean and the standard deviation to see the z-score.</div>
        </div>
        <div id="zsBody" style="display:none">
          <p class="res-tip adv-tip" id="zsTip"></p>
          <div id="zsVisWrap" style="display:none">
            <p class="bm-h">Where it sits on the bell curve</p>
            <div class="zs-vis" id="zsVis"></div>
            <p class="cb-note" id="zsVisKey"></p>
          </div>
          <div id="zsNumsWrap">
            <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="zsCopyTxt" style="margin-left:8px">Copy result</button></p>
            <table class="dtable" id="zsNums"></table>
            <div id="zsCopyTxt" style="display:none"></div>
          </div>
          <div id="zsProbWrap" style="display:none">
            <p class="bm-h">Areas under the curve</p>
            <table class="dtable" id="zsProb"></table>
          </div>
          <div id="zsListWrap" style="display:none">
            <p class="bm-h">Z-scores for your list</p>
            <p class="zs-listsum" id="zsListSum"></p>
            <div class="zs-tbl"><table class="dtable" id="zsListTab"></table></div>
            <p class="cb-note" id="zsListKey"></p>
            <button class="linkbtn" id="zsListUse" type="button">Use this mean and spread in the boxes</button>
          </div>
          <div id="zsStepsWrap">
            <p class="bm-h">How it is worked out</p>
            <ol class="zs-steps" id="zsSteps"></ol>
          </div>
        </div>`;
  const left = `
        <h2>How to use the z-score calculator</h2>
        <p>Type your <strong>score</strong>, the <strong>mean</strong> of the group and its <strong>standard deviation</strong>: the z-score, the percentile and the areas under the curve appear at once, with a bell curve that shows your score on both the z scale and your own scale. Already know the z-score or the percentile? Type it in its box together with two of the three boxes above, and the missing one (score, mean or standard deviation) is worked out.</p>
        <p>Choose <strong>Compare two</strong> to see which of two results is better compared with its own group, even when they come from different tests. Go advanced for the z-score of a sample mean, the critical z-score for a confidence level, the share of the group between two z-scores, and a z-score for every number in a pasted list.</p>

        <h2 id="zsFormulas">The formula</h2>
        <div class="formula">
          z = (x − μ) ÷ σ
          <small>SAMPLE MEAN OF n VALUES: z = (x̄ − μ) ÷ (σ ÷ √n) · SCORE FROM z: x = μ + z × σ</small>
        </div>
        <p>x is the value, μ the mean and σ the standard deviation. A positive z-score is above the mean, a negative one below it, and 0 is the mean itself. Worked out with this calculator: x = ${A.x}, μ = ${A.m}, σ = ${A.s} gives z = ${f4(zA)}; the area to its left is ${f4(pA.left)}, so ${pc(pA.left)} of the group scores lower and ${pc(pA.right)} higher.</p>
        <h2>The standard normal table (area to the left of z)</h2>
        <p>Find the row for z to one decimal and the column for the second decimal. Positive z only: for a negative z, the area to the left is 1 minus the table value for the same positive z.</p>
        ${tblZ}`;
  const right = `
        <h2>Percentile to z-score</h2>
        ${tblPct}
        <h2>Critical z-scores by confidence level</h2>
        <p>The two-tailed z-score leaves half of the remaining probability in each tail; the one-tailed z-score puts all of it in one tail.</p>
        ${tblConf}
        <h2>How much of a group lies near the mean?</h2>
        <p>For a bell-shaped group the share within a given distance of the mean is fixed:</p>
        ${tblBands}
        <p>So a z-score beyond 2 is further out than ${pc(z2.between)} of the group, and beyond 3 further out than ${pc(z3.between)}.</p>
        <h2>Compare scores from different tests</h2>
        <p>Raw scores from different scales cannot be compared directly. Turn each into a z-score first: ${A.x} on a test with mean ${A.m} and standard deviation ${A.s} has z = ${f2(zA)}, while ${B.x} on a test with mean ${B.m} and standard deviation ${B.s} has z = ${f2(zB)}. The second is higher than ${pc(pB.left)} of its group, the first than ${pc(pA.left)} of its group, so the second is the better result.</p>
        <h2>Z-score of a sample mean</h2>
        <p>When the score is the average of n values, divide the standard deviation by √n first. A sample of ${N1.n} with a mean of ${N1.x}, a population mean of ${N1.m} and σ = ${N1.s} has a standard error of ${f4(N1.s / Math.sqrt(N1.n))} and z = ${f2(zN)}, higher than ${pc(pN.left)} of sample means.</p>

        <h2>Related tools</h2>
        <p>To turn a z-score into a test result use the <a href="/p-value-calculator/">p-value calculator</a>; for an interval around a mean the <a href="/confidence-interval-calculator/">confidence interval calculator</a>; to find the spread of your data the <a href="/standard-deviation-calculator/">standard deviation calculator</a>; and to average a list the <a href="/average-calculator/">average calculator</a>.</p>
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
    <span class="mbar-lab" id="zsMLab">z-score</span>
    <div class="mbar-vals"><b id="zsMVal">—</b></div>
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
<script>CalcThis.initZscoreCalc();</script>
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
const prev = { slug: 'confidence-interval-calculator', menu: 'Confidence Interval', name: 'Confidence Interval Calculator', llms: 'Confidence Interval Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("(  \\{ file: '" + prev.slug + "/index\\.html',[^\\n]*\\n)"), (mm) => mm + "  { file: '" + P.slug + "/index.html',          slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms.replace(/ /g, '[ ]') + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M3 24c4 0 6-16 13-16s9 16 13 16" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M3 24h26" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M21 24V12" stroke="#37503F" stroke-width="2" stroke-linecap="round"/></svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="' + ps2 + '">', () => card + '    <a class="calc" href="' + ps2 + '">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — z-score of any value from the mean and standard deviation, its percentile and probabilities, or back from a z-score, with two scores compared on a live bell curve</span></li>\n');
    return h;
  });
}
