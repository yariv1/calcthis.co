const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /correlation-coefficient-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.ccEngine. Run: node md-files/gen-correlation-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE', 'CI', 'TTEST', 'CORR'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const E = CalcThis.ccEngine, PV = CalcThis.pvalueEngine;
const fx = (x, d) => { const s = x.toFixed(d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s.replace('-', '−'); };
const f2 = (x) => fx(x, 2), f3 = (x) => fx(x, 3), f4 = (x) => fx(x, 4);
const pfmt = (p) => PV.fp(p, null);
const strength = (r) => { const a = Math.abs(r); return a >= 0.8 ? 'very strong' : a >= 0.6 ? 'strong' : a >= 0.4 ? 'moderate' : a >= 0.2 ? 'weak' : 'very weak'; };
const EX = { x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], y: [52, 55, 61, 58, 70, 72, 69, 80, 85, 60] };
const f = E.pearson(EX.x, EX.y), tt = E.test(f.r, 10), ci = E.fisher(f.r, 10, 0.95, 1), sp = E.spearman(EX.x, EX.y), ke = E.kendall(EX.x, EX.y), spT = E.test(sp.rho, 10);
const loo = E.leaveOne(EX.x, EX.y), drs = loo.r.map((v) => v - f.r);
let top = 0; drs.forEach((v, i) => { if (Math.abs(v) > Math.abs(drs[top])) top = i; });
const plan = E.plan(f.r, 0.05, 'two'), rc = E.rcrit(10, 0.05, 'two');
const C1 = { x: [1, 2, 3, 4, 5, 6, 7, 8], y: [52, 57, 62, 67, 72, 77, 83, 86] }, c1 = E.pearson(C1.x, C1.y), c1t = E.test(c1.r, 8), c1ci = E.fisher(c1.r, 8, 0.95, 1);
const WK = E.fisher(0.7, 50, 0.95, 1);
const pr = E.predict(f, 11, 0.95);
const crRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 60, 100].map((df) => '<tr><td>' + df + '</td>' + [0.10, 0.05, 0.01].map((a) => '<td>' + f3(E.rcrit(df + 2, a, 'two')) + '</td>').join('') + '</tr>').join('');
const tblCrit = '<table class="dtable"><thead><tr><th>Degrees of freedom (n − 2)</th><th>α = 0.10</th><th>α = 0.05</th><th>α = 0.01</th></tr></thead><tbody>' + crRows + '</tbody></table>';
const tblStr = '<table class="dtable"><thead><tr><th>|r|</th><th>Word used here</th></tr></thead><tbody><tr><td>0.8 to 1.0</td><td>very strong</td></tr><tr><td>0.6 to 0.8</td><td>strong</td></tr><tr><td>0.4 to 0.6</td><td>moderate</td></tr><tr><td>0.2 to 0.4</td><td>weak</td></tr><tr><td>0 to 0.2</td><td>very weak</td></tr></tbody></table>';
const tblWhich = '<table class="dtable"><thead><tr><th>Your data</th><th>Coefficient</th></tr></thead><tbody>' +
  '<tr><td>Two measured numbers, points roughly along a straight line</td><td>Pearson r</td></tr>' +
  '<tr><td>A curved but steady rise or fall, ranks, or a few extreme points</td><td>Spearman ρ</td></tr>' +
  '<tr><td>Few pairs, or many repeated values</td><td>Kendall τ-b</td></tr>' +
  '<tr><td>One of the two variables has only two values (0 and 1)</td><td>Pearson r is the point-biserial correlation</td></tr>' +
  '<tr><td>Three or more variables at once</td><td>A table of pairwise correlations (not on this page)</td></tr></tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The t statistic r × √((n − 2) ÷ (1 − r²)) with n − 2 degrees of freedom, the Fisher transformation artanh r with standard error 1 ÷ √(n − 3) and the interval tanh(artanh r ± z × SE) follow the Wikipedia article “Pearson correlation coefficient”, read on 2026-11-23. Its worked example (r = 0.7, n = 50, 95% interval 0.5237 to 0.8188) is reproduced by this calculator: ${f4(WK.lo)} to ${f4(WK.hi)}.</li>
          <li>Spearman’s ρ is the Pearson r of the ranks; its p-value uses the t approximation and its interval the Fisher transformation with the variance factor 1.06, as in the Wikipedia article “Spearman’s rank correlation coefficient” (read 2026-11-23). Kendall’s τ-b and its normal approximation with the tie terms follow the article “Kendall rank correlation coefficient” (read 2026-11-23).</li>
          <li>The interval for the line and the prediction interval for one new point follow the simple-regression formulas in the Wikipedia article “Prediction interval” (read 2026-11-23). Probabilities come from the t and normal distributions of this site’s p-value calculator.</li>
          <li>Check: for the eight pairs X = ${C1.x.join(', ')} and Y = ${C1.y.join(', ')} this calculator gives r = ${f4(c1.r)}, t = ${f4(c1t.t)} and p = ${pfmt(c1t.pv.two)}; correlationcoefficientcalculator.org showed the same r, t and p for those numbers on 2026-11-23.</li>
          <li>The feature set was compared with the correlation tools of Omnicalculator, GigaCalculator, Pearson.com, correlationcoefficientcalculator.org, Social Science Statistics and Stats Kingdom, all opened on 2026-11-23. The words very weak to very strong follow the scale Omnicalculator attributes to Evans (1996); that original was not read, so treat the words as a rough guide. The number of pairs for 80% power uses the Fisher z approximation and is labelled approximate.</li>
        </ul>
        <p><small>For information only. Check the assumptions of the method and your own data before drawing conclusions.</small></p>`;

const P = {
  slug: 'correlation-coefficient-calculator', name: 'Correlation Coefficient Calculator', menu: 'Correlation Coefficient', body: 'p-bmr p-cc',
  title: 'Correlation Coefficient Calculator: Pearson, Spearman',
  desc: 'Correlation coefficient calculator: paste X and Y for Pearson r, Spearman and Kendall, p-value, interval, best-fit line and the point driving r.',
  h1: 'Correlation Coefficient Calculator', eyebrow: 'Pearson · Spearman · Kendall · see which point carries the correlation',
  lead: `Paste your <strong>X and Y numbers</strong> (or one pair per line) and get the <strong>correlation coefficient</strong> with its p-value and interval, the <strong>Pearson, Spearman and Kendall values side by side</strong> and a picture of your own data with the best-fit line. For the example below, ${EX.x.length} pairs give <strong>r = ${f4(f.r)}, p = ${pfmt(tt.pv.two)}</strong>: a ${strength(f.r)} positive correlation. The table of single points shows that leaving out pair #${top + 1} moves r to ${f4(loo.r[top])}.`,
  schema: 'Free correlation coefficient calculator: Pearson (linear) r, Spearman rho and Kendall tau-b from pasted X and Y numbers or pairs, with the t-score, p-value, confidence interval, r squared, best-fit line, a scatter plot with a band and leave-one-out lines, which points carry the correlation, the pairs needed, a prediction from the line, weights and a ready-to-copy sentence.',
  llms: 'Free correlation coefficient calculator: Pearson, Spearman and Kendall from X and Y numbers; p-value, interval, best-fit line, scatter plot, the points that carry the correlation and how many pairs it would take.',
  card: 'Pearson, Spearman and Kendall side by side from your X and Y numbers, with a picture of your data and the point that drives r.',
  faqs: [
    ['What is a correlation coefficient?', 'A correlation coefficient is a number between −1 and +1 that measures how closely two variables move together. +1 means they rise together in a perfect straight line, −1 means one falls exactly as the other rises, and 0 means no straight-line relationship.'],
    ['How do I calculate the correlation coefficient?', 'Paste the X numbers and the Y numbers (or one pair per line). The calculator finds the means, multiplies each pair of deviations and divides by the spread of both variables: r = Σ(x − x̄)(y − ȳ) ÷ √(Σ(x − x̄)² Σ(y − ȳ)²). For the example on this page it gives r = ' + f4(f.r) + '.'],
    ['What is the linear correlation coefficient?', 'It is Pearson’s r, the coefficient that measures how well a straight line fits the points. Spearman’s ρ and Kendall’s τ measure ranks instead and also pick up curved relationships that keep rising or falling.'],
    ['Is my correlation strong?', 'A common reading is very weak below 0.2, weak 0.2 to 0.4, moderate 0.4 to 0.6, strong 0.6 to 0.8 and very strong above 0.8, applied to |r|. What counts as strong depends on the field, so look at the interval and the picture too. The example gives ' + f4(f.r) + ', called ' + strength(f.r) + '.'],
    ['What does r² mean?', 'r² is r multiplied by itself. It is the share of the variation in Y that a straight line through X accounts for. The example has r² = ' + f4(f.r * f.r) + ', about ' + fx(f.r * f.r * 100, 1) + '%. It describes the fit, not cause and effect.'],
    ['Pearson, Spearman or Kendall?', 'Use Pearson for measured numbers that follow a straight line. Use Spearman when the relationship is curved but steady, or a few extreme points matter. Use Kendall with few pairs or many repeated values. This page shows all three, so you can see when they disagree: in the example Pearson is ' + f4(f.r) + ' and Spearman ' + f4(sp.rho) + '.'],
    ['How do I read the p-value?', 'The p-value is the probability of a correlation at least as far from 0 as yours if the two variables were really unrelated. Below your significance level α (usually 0.05) the result is called statistically significant. The example has p = ' + pfmt(tt.pv.two) + '.'],
    ['Does correlation mean causation?', 'No. Two variables can move together because one causes the other, because a third thing drives both, or by chance. The correlation only describes how they move together.'],
    ['Which point is carrying my correlation?', 'The “Which point is carrying this?” table shows r with each pair left out. A pair whose removal changes r by more than 0.1 is flagged and ringed in the picture. In the example, leaving out pair #' + (top + 1) + ' changes r from ' + f4(f.r) + ' to ' + f4(loo.r[top]) + '.'],
    ['How many pairs do I need?', 'The “What would it take” table gives the smallest r that would be significant with your number of pairs (' + f4(rc) + ' for 10 pairs at α = 0.05) and how many pairs would be needed to reach p below α or 80% power if r stayed the same. With very few pairs, a large r can still be chance.'],
    ['Can I paste from Excel?', 'Yes. Copy the X column into the first box and the Y column into the second, or switch to “Pairs, one per line” and paste both columns together. Header lines and blank rows are skipped.']
  ],
  pills: [['/t-test-calculator/', 'T-Test Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'], ['/p-value-calculator/', 'P-Value Calculator', '<path d="M3 24c4 0 6-16 13-16s9 16 13 16"/><path d="M3 24h26"/>'], ['/confidence-interval-calculator/', 'Confidence Interval Calculator', '<path d="M4 16h24M4 11v10M28 11v10"/>'], ['/standard-deviation-calculator/', 'Standard Deviation Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>']]
};

const tfld = (id, label, unit, ph, mode, labId) => `<label class="fld" for="${id}"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkSeg = (id, label, opts, def, labId) => `<div class="fld"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}</span><div class="seg cc-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;
const ta = (id, labId, label, ph) => `<div class="fld"><label class="lab" id="${labId}" for="${id}">${label}</label><textarea class="cc-ta" id="${id}" placeholder="${ph}" aria-label="${label}" spellcheck="false"></textarea></div>`;

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
        <h2 class="card-h2">Your data</h2>
        ${mkSeg('ccEntry', 'How will you enter the data?', [['lists', 'Two lists'], ['pairs', 'Pairs, one per line']], 'lists')}
        <p class="av-note" id="ccEntryNote"></p>
        <div id="ccListsW">
          ${ta('ccX', 'ccXLab', 'Numbers for “X”', 'e.g. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10')}
          ${note('ccXNote')}
          ${ta('ccY', 'ccYLab', 'Numbers for “Y”', 'e.g. 52, 55, 61, 58, 70, 72, 69, 80, 85, 60')}
          ${note('ccYNote')}
        </div>
        <div id="ccPairsW" style="display:none">
          ${ta('ccP', 'ccPLab', 'Pairs, one per line', 'e.g.\n1, 52\n2, 55\n3, 61')}
          ${note('ccPNote')}
        </div>
        <p class="zs-sech" style="margin-top:4px">Try an example</p>
        <div class="chips" id="ccExChips" role="group" aria-label="Example data"><button type="button" data-v="study">Study hours</button><button type="button" data-v="negative">Negative</button><button type="button" data-v="none">No pattern</button><button type="button" data-v="outlier">One outlier</button><button type="button" data-v="curve">U-shape</button><button type="button" data-v="perfect">Perfect line</button></div>
        ${mkSeg('ccTail', 'The relationship is…', [['two', 'Any (not zero)'], ['gt', 'Positive'], ['lt', 'Negative']], 'two', 'ccTailLab')}
        ${note('ccTailNote')}
        ${tfld('ccAlpha', 'Significance level (α)', '· optional', 'e.g. 0.05')}
        <div class="chips" id="ccAlphaChips" role="group" aria-label="Common significance levels"><button type="button" data-v="0.10">0.10</button><button type="button" data-v="0.05">0.05</button><button type="button" data-v="0.01">0.01</button></div>
        ${note('ccAlphaNote')}
        <div class="res-hint" id="ccHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="ccAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${mkSeg('ccHead', 'Coefficient shown in the headline', [['pearson', 'Pearson'], ['spearman', 'Spearman'], ['kendall', 'Kendall']], 'pearson')}
          ${note('ccHeadNote')}
          <p class="zs-sech">Confidence interval <span>· optional</span></p>
          ${tfld('ccConf', 'Confidence level', '%', 'e.g. 95')}
          ${note('ccConfNote')}
          <p class="zs-sech">Test against a correlation other than 0 <span>· optional</span></p>
          ${tfld('ccRho0', 'Correlation to test against (ρ₀)', '', 'e.g. 0.3')}
          ${note('ccRho0Note')}
          <p class="zs-sech">Variable names <span>· optional</span></p>
          <div class="cc-two">${tfld('ccNameX', 'Name of X', '', 'e.g. Hours studied', 'text')}${tfld('ccNameY', 'Name of Y', '', 'e.g. Exam score', 'text')}</div>
          ${note('ccNameNote')}
          <p class="zs-sech">Weights <span>· optional</span></p>
          ${ta('ccW', 'ccWLab', 'One weight per pair', 'e.g. 1, 1, 2, 1, 3, 1, 1, 2, 1, 1')}
          ${note('ccWNote')}
          <p class="zs-sech">Predict Y from X <span>· optional</span></p>
          ${tfld('ccPx', 'X value', '', 'e.g. 11')}
          ${note('ccPxNote')}
          <p class="zs-sech">Display <span>· optional</span></p>
          ${tfld('ccDec', 'Decimal places', '', 'e.g. 3', 'numeric')}
          ${note('ccDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="ccClear" type="button">Clear fields</button>
          <button class="advbtn" id="ccAdvBtn" type="button">
            <span id="ccAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="ccLab">Pearson correlation coefficient (r)</div>
          <div class="res-big"><span id="ccBig">—</span></div>
          <div class="res-sub" id="ccSub" data-empty="Type the X and Y numbers to see the correlation coefficient, its p-value and a picture of your data.">Type the X and Y numbers to see the correlation coefficient, its p-value and a picture of your data.</div>
        </div>
        <div id="ccBody" style="display:none">
          <p class="res-tip adv-tip" id="ccTip"></p>
          <div id="ccVisWrap" style="display:none">
            <p class="bm-h">Your data, the best-fit line and the points that carry it</p>
            <div class="cc-vis" id="ccVis"></div>
            <div class="cc-tools"><button class="linkbtn" id="ccZoomIn" type="button">Zoom in</button><button class="linkbtn" id="ccZoomOut" type="button">Zoom out</button></div>
            <p class="cb-note" id="ccVisKey"></p>
          </div>
          <div id="ccGaugeWrap" style="display:none">
            <p class="bm-h">Where the correlation sits</p>
            <div class="cc-vis" id="ccGauge"></div>
            <p class="cb-note" id="ccGaugeKey"></p>
          </div>
          <div id="ccAllWrap" style="display:none">
            <p class="bm-h">Pearson, Spearman and Kendall, side by side</p>
            <div class="cc-tbl"><table class="dtable" id="ccAll"></table></div>
            <p class="cb-note" id="ccAllNote"></p>
          </div>
          <div id="ccCheckWrap" style="display:none">
            <p class="bm-h">Is Pearson appropriate for this data?</p>
            <ul class="cc-steps" id="ccCheckList"></ul>
          </div>
          <div id="ccLooWrap" style="display:none">
            <p class="bm-h">Which point is carrying this?</p>
            <div class="cc-tbl"><table class="dtable" id="ccLoo"></table></div>
            <p class="cb-note" id="ccLooKey"></p>
          </div>
          <div id="ccNumsWrap" style="display:none">
            <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="ccCopyTxt" style="margin-left:8px">Copy result</button><button class="linkbtn" type="button" data-copy="ccCsvTxt" style="margin-left:8px">Copy as CSV</button></p>
            <div class="cc-tbl"><table class="dtable" id="ccNums"></table></div>
            <div id="ccCopyTxt" style="display:none"></div>
            <div id="ccCsvTxt" style="display:none"></div>
          </div>
          <details class="faq" id="ccDevWrap" style="display:none"><summary>Show the calculation table</summary>
            <div class="cc-tbl"><table class="dtable" id="ccSums"></table></div>
            <div class="cc-tbl"><table class="dtable" id="ccDev"></table></div>
          </details>
          <div id="ccWhatWrap" style="display:none">
            <p class="bm-h">What would it take?</p>
            <div class="cc-tbl"><table class="dtable" id="ccWhat"></table></div>
            <p class="cb-note" id="ccWhatKey"></p>
          </div>
          <div id="ccPredWrap" style="display:none">
            <p class="bm-h">Predicting Y from X</p>
            <div class="cc-tbl"><table class="dtable" id="ccPred"></table></div>
            <p class="cb-note" id="ccPredKey"></p>
          </div>
          <div id="ccWriteWrap" style="display:none">
            <p class="bm-h">Write it up <button class="linkbtn" type="button" data-copy="ccWrite" style="margin-left:8px">Copy sentence</button></p>
            <div class="chips" id="ccCiteChips" role="group" aria-label="Sentence style"><button type="button" data-v="sentence" class="on">Sentence</button><button type="button" data-v="paren">APA (parenthetical)</button><button type="button" data-v="narr">APA (narrative)</button><button type="button" data-v="chicago">Chicago</button><button type="button" data-v="plain">Plain English</button></div>
            <p class="cc-write" id="ccWrite"></p>
          </div>
          <div id="ccStepsWrap" style="display:none">
            <p class="bm-h">How it is worked out</p>
            <ol class="cc-steps" id="ccSteps"></ol>
          </div>
        </div>`;
  const left = `
        <h2>How to use the correlation coefficient calculator</h2>
        <p>Paste the <strong>X numbers</strong> in the first box and the <strong>Y numbers</strong> in the second (a column from Excel works), or switch to one pair per line. The correlation coefficient, its p-value and a picture of your data appear as you type. Pick “Positive” or “Negative” for a one-tailed test and leave the significance level empty for 0.05.</p>
        <p>Go advanced to choose Spearman or Kendall for the headline, change the confidence level, name the variables, add a weight for each pair (for a weighted Pearson r) or type an X value to predict Y from the line with its interval.</p>

        <h2 id="ccFormulas">The correlation coefficient formula</h2>
        <div class="formula">
          r = Σ(x − x̄)(y − ȳ) ÷ √( Σ(x − x̄)² × Σ(y − ȳ)² )
          <small>PEARSON (LINEAR) CORRELATION COEFFICIENT · t = r × √((n − 2) ÷ (1 − r²)) WITH n − 2 DEGREES OF FREEDOM</small>
        </div>
        <p>Worked out with this calculator for ${EX.x.length} pairs (X = ${EX.x.join(', ')}; Y = ${EX.y.join(', ')}): the means are ${f2(f.mx)} and ${f2(f.my)}, Σ(x − x̄)(y − ȳ) = ${f2(f.sxy)}, Σ(x − x̄)² = ${f2(f.sxx)} and Σ(y − ȳ)² = ${f2(f.syy)}, so r = ${f4(f.r)}, r² = ${f4(f.r * f.r)}, t(${tt.df}) = ${f2(tt.t)} and p = ${pfmt(tt.pv.two)}. The 95% interval for r through the Fisher transformation runs from ${f4(ci.lo)} to ${f4(ci.hi)}. The best-fit line is Y = ${f2(f.icpt)} + ${f2(f.slope)} × X, which predicts ${f2(pr.y)} at X = 11 (95% prediction interval ${f2(pr.pLo)} to ${f2(pr.pHi)}).</p>
        <h2 id="ccWhich">Pearson, Spearman or Kendall?</h2>
        ${tblWhich}
        <p>For the same example Spearman’s ρ is ${f4(sp.rho)} (p = ${pfmt(spT.pv.two)}) and Kendall’s τ-b is ${f4(ke.tau)} (p = ${pfmt(ke.pv.two)}).</p>
        <h2>Which point is carrying the correlation?</h2>
        <p>A single extreme pair can create or hide a correlation. The calculator recomputes r with each pair left out. In the example, removing pair #${top + 1} (X = ${EX.x[top]}, Y = ${EX.y[top]}) changes r from ${f4(f.r)} to ${f4(loo.r[top])}, a change of ${f4(drs[top])}: that one point matters much more than any other.</p>`;
  const right = `
        <h2>Critical values of r</h2>
        <p>A correlation further from 0 than the critical value for your degrees of freedom (n − 2) is significant at that level. Two-tailed values; for a one-tailed test use the column of twice the level (for example the α = 0.10 column for a one-tailed test at 0.05).</p>
        ${tblCrit}
        <h2 id="ccReading">Reading the result</h2>
        <p>The <strong>coefficient</strong> runs from −1 to +1: the sign gives the direction, the size the strength. The <strong>p-value</strong> is the probability of a correlation at least this far from 0 if the two variables were really unrelated; below your significance level it is called significant. The <strong>interval</strong> shows the values of the true correlation the data are consistent with. With few pairs it is wide: ${f4(ci.lo)} to ${f4(ci.hi)} for the ${EX.x.length} pairs above.</p>
        <p>The words on this page follow this rough scale for |r|:</p>
        ${tblStr}
        <h2>Check against published examples</h2>
        <p>The Wikipedia article on the Pearson coefficient gives r = 0.7 with 50 pairs a 95% interval of 0.5237 to 0.8188; this calculator’s interval for the same numbers is ${f4(WK.lo)} to ${f4(WK.hi)}. For eight pairs rising from 52 to 86, this page and correlationcoefficientcalculator.org both report r = ${f4(c1.r)}, t = ${f4(c1t.t)} and a p-value of ${pfmt(c1t.pv.two)}.</p>
        <h2>How many pairs do I need?</h2>
        <p>With ${EX.x.length} pairs, only a correlation beyond ±${f4(rc)} is significant at 0.05. Keeping r at ${f4(f.r)}, the calculator reports that ${plan.sig} pairs would already give p below 0.05 and about ${plan.pow} pairs would give 80% power (approximate, Fisher z).</p>

        <h2>Related tools</h2>
        <p>To compare two groups use the <a href="/t-test-calculator/">t-test calculator</a>; to turn any statistic into a p-value the <a href="/p-value-calculator/">p-value calculator</a>; for an interval around a mean the <a href="/confidence-interval-calculator/">confidence interval calculator</a>; and to find a spread the <a href="/standard-deviation-calculator/">standard deviation calculator</a>.</p>
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
    <span class="mbar-lab" id="ccMLab">Pearson r</span>
    <div class="mbar-vals"><b id="ccMVal">—</b></div>
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

    <h2 id="ccFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initCorrCalc();</script>
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
const prev = { slug: 't-test-calculator', menu: 'T-Test', name: 'T-Test Calculator', llms: 'T-Test Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M4 28V4" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M4 28h24" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="22" r="2" fill="#8F5C13"/><circle cx="15" cy="17" r="2" fill="#8F5C13"/><circle cx="19" cy="19" r="2" fill="#8F5C13"/><circle cx="24" cy="10" r="2" fill="#8F5C13"/><path d="M7 25L27 7" stroke="#37503F" stroke-width="1.4" fill="none"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — Pearson, Spearman and Kendall from your X and Y numbers, with a picture of your data and the point that carries the correlation</span></li>\n');
    return h;
  });
}
