const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /linear-regression-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.lrEngine. Run: node md-files/gen-linearregression-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE', 'CI', 'TTEST', 'CORR', 'REG'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const L = CalcThis.lrEngine, PV = CalcThis.pvalueEngine, E = CalcThis.ccEngine;
const fx = (x, d) => { const s = x.toFixed(d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s.replace('-', '−'); };
const f2 = (x) => fx(x, 2), f3 = (x) => fx(x, 3), f4 = (x) => fx(x, 4);
const pfmt = (p) => PV.fp(p, null);
const H = { x: [1.47, 1.50, 1.52, 1.55, 1.57, 1.60, 1.63, 1.65, 1.68, 1.70, 1.73, 1.75, 1.78, 1.80, 1.83], y: [52.21, 53.12, 54.48, 55.84, 57.20, 58.57, 59.93, 61.29, 63.11, 64.47, 66.28, 68.10, 69.92, 72.19, 74.46] };
const S = { x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], y: [52, 55, 61, 58, 70, 72, 69, 80, 85, 60] };
const fh = L.fit(H.x, H.y, { deg: 1 }), ch = L.ci(fh, 0.95), ph = fh.pred(1.6, 0.95), cvh = L.curves(H.x, H.y, null), rH = Math.sqrt(fh.r2);
const fs1 = L.fit(S.x, S.y, { deg: 1 }), cs1 = L.ci(fs1, 0.95), ps1 = fs1.pred(11, 0.95);
let top = 0; fs1.D.forEach((d, i) => { if (d > fs1.D[top]) top = i; });
const dcut = PV.inv('f', { d1: 2, d2: fs1.df }, 0.5, 'R');
const pl1 = E.plan(Math.sqrt(fs1.r2), 0.05, 'two');
const f0 = L.fit(S.x, S.y, { deg: 1, origin: true });
const fq = L.fit(S.x, S.y, { deg: 2 });
const tcrit13 = PV.inv('t', { df: 13 }, 0.025, 'R');

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Slope = Sxy ÷ Sxx, intercept = ȳ − slope × x̄, the standard error of the slope and the interval estimate ± t* × standard error with n − 2 degrees of freedom follow the Wikipedia article “Simple linear regression”, read on 2026-11-24. Its worked example (15 heights and masses of American women aged 30–39) gives slope 61.272, intercept −39.062 and intervals −45.4 to −32.7 and 57.4 to 65.1; this calculator gives ${f3(fh.co[1])}, ${f3(fh.co[0])}, ${f2(ch[0].lo)} to ${f2(ch[0].hi)} and ${f2(ch[1].lo)} to ${f2(ch[1].hi)}.</li>
          <li>The interval for the line and the prediction interval for one new point (s² × (1 ÷ n + (x − x̄)² ÷ Sxx), and the same with 1 added for one new point) follow the Wikipedia article “Prediction interval” (read 2026-11-23); for curves the same form is used with (XᵀX)⁻¹.</li>
          <li>Cook’s distance D = e² ÷ (p × s²) × h ÷ (1 − h)², and the cut-off at the median of F(p, n − p) (close to 1, with the note that opinions differ), follow the Wikipedia article “Cook’s distance” (read 2026-11-24). A leverage above 2p ÷ n marks a high-leverage point, following “Leverage (statistics)” (read 2026-11-24). A standardized error beyond ±2 is a common rule of thumb and is labelled so.</li>
          <li>Check: the 13-pair example that Stats Kingdom loads with its Example button (read on 2026-11-24) gives the same equation Ŷ = 1.4021 + 0.6021 X, slope interval 0.4646 to 0.7395, F(1, 11) = 92.96 and p = 0.000001063 as this page, and the same numbers for a prediction at X = 7 (5.6166, interval of the line 4.0066 to 7.2265, prediction interval −0.3349 to 11.5681).</li>
          <li>The feature set was compared with the regression tools of Omnicalculator, Pearson.com, Social Science Statistics, Statistics by Jim, Stats Kingdom, MiniWebtool and GraphPad, all opened on 2026-11-24. Probabilities come from the t and F distributions of this site’s p-value calculator. Pairs needed for 80% power use the Fisher z approximation on the correlation and are labelled approximate. Weights are used as relative weights in weighted least squares (scaled to an average of 1); through the origin, R² is measured against zero, not against the mean.</li>
        </ul>
        <p><small>For information only. Check the assumptions of the method and your own data before drawing conclusions.</small></p>`;

const P = {
  slug: 'linear-regression-calculator', name: 'Linear Regression Calculator', menu: 'Linear Regression', body: 'p-bmr p-cc p-lr',
  title: 'Linear Regression Calculator: Line, R², Prediction',
  desc: 'Linear regression calculator: paste X and Y for the best-fit line, R², p-value, intervals, predictions, and the points that steer the line.',
  h1: 'Linear Regression Calculator', eyebrow: 'Best-fit line · R² · prediction · see which points steer the line',
  lead: `Paste your <strong>X and Y numbers</strong> (or one pair per line, or just the summary sums) and get the <strong>best-fit line</strong> with its slope and intercept, standard errors, intervals, <strong>R², p-value</strong> and predictions with intervals, drawn on your own data with the errors shown as real squares. For the example below, ${S.x.length} pairs give <strong>Ŷ = ${f2(fs1.co[0])} + ${f2(fs1.co[1])} X, R² = ${f4(fs1.r2)}</strong>. The table of single points shows that pair #${top + 1} steers the line most.`,
  schema: 'Free linear regression calculator: least squares line (or quadratic and cubic curve, or through the origin) from pasted X and Y numbers, pairs or summary statistics, with slope and intercept, standard errors, intervals, R squared, adjusted R squared, F test and ANOVA, predictions in both directions, residual plot, influence of single points and a ready-to-copy sentence.',
  llms: 'Free linear regression calculator: best-fit line from X and Y numbers; slope, intercept, intervals, R², p-value, predictions, residual plot and the points that steer the line.',
  card: 'The best-fit line from your X and Y numbers, with R², intervals, predictions and the points that steer the line.',
  faqs: [
    ['What is linear regression?', 'Linear regression finds the straight line that best describes how Y changes with X. “Best” means the line with the smallest total of squared errors, the vertical distances from each point to the line. The result is an equation Y = a + b X: a is the intercept and b the slope.'],
    ['How do I calculate a linear regression?', 'Paste the X numbers and the Y numbers, or one pair per line. The calculator finds the slope b = Sxy ÷ Sxx and the intercept a = ȳ − b × x̄. For the example on this page it gives Ŷ = ' + f4(fs1.co[0]) + ' + ' + f4(fs1.co[1]) + ' X.'],
    ['What does the slope mean?', 'The slope is how much Y changes, on average, for each extra 1 of X. In the example each extra 1 of X goes with ' + f2(fs1.co[1]) + ' more Y, give or take ' + f2(fs1.rows[1].se) + ' (95% interval ' + f2(cs1[1].lo) + ' to ' + f2(cs1[1].hi) + ').'],
    ['What does R² mean?', 'R² is the share of the variation in Y that the line accounts for. The example has R² = ' + f4(fs1.r2) + ', about ' + fx(fs1.r2 * 100, 1) + '%. It describes the fit of the line, not cause and effect, and it can only rise when you add curve terms: use adjusted R² (' + f4(fs1.adj) + ' here) to compare models.'],
    ['How do I predict a value from the line?', 'Type one or more X values under “Predict Y”. You get the predicted Y with the interval for the line (the average Y at that X) and the wider interval for one new point. In the example, X = 11 gives ' + f2(ps1.y) + ' (new-point interval ' + f2(ps1.pLo) + ' to ' + f2(ps1.pHi) + '). Values outside your X range are flagged because the line may not hold there.'],
    ['Can I find X from a Y value?', 'Yes. Type a Y value under “Predict X” and the calculator turns the straight line around: X = (Y − intercept) ÷ slope. That is not the same as fitting X on Y, which gives a different line unless the points sit exactly on a line.'],
    ['Straight line, quadratic or cubic?', 'The “Does a curve help?” table compares the three on your data with R², adjusted R² and an F test of each extra term. For the 15 heights and masses used by Wikipedia the straight line gives R² = ' + f4(fh.r2) + ', and the quadratic term is significant (p = ' + pfmt(cvh[1].p) + '): the points bend a little. Choose Curve under Go advanced to fit it.'],
    ['Which points steer my line?', 'The “Which points are steering the line?” table shows, for the points with the largest Cook’s distance, the slope and R² you would get without each one. In the example, leaving out pair #' + (top + 1) + ' (X = ' + S.x[top] + ', Y = ' + S.y[top] + ') moves the slope from ' + f3(fs1.co[1]) + ' to ' + f3(fs1.looCo[top][1]) + '.'],
    ['What is “through the origin”?', 'It forces the line through (0, 0), so the intercept is 0. It suits cases where Y must be 0 when X is 0, such as a calibration with no blank. R² is then measured against zero rather than the mean, so it is not comparable with the normal R². In the example the through-zero slope is ' + f3(f0.co[1]) + ' against ' + f3(fs1.co[1]) + '.'],
    ['How many pairs do I need?', 'The “What would it take?” table gives the smallest slope that would be significant with your pairs, and how many pairs would be needed for p below 0.05 or 80% power if the correlation stayed the same. In the example, about ' + pl1.sig + ' pairs already give p below 0.05 if r stays at ' + f4(Math.sqrt(fs1.r2)) + '.'],
    ['Can I use summary numbers instead of the data?', 'Yes. Choose “Summary numbers” and type n, the two means, Sxx, Syy and Sxy. You get the line, standard errors, intervals, R², F test and predictions, but no picture because there are no points.']
  ],
  pills: [['/correlation-coefficient-calculator/', 'Correlation Coefficient Calculator', '<path d="M4 28V4M4 28h24"/><path d="M7 25L27 7"/>'], ['/t-test-calculator/', 'T-Test Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'], ['/p-value-calculator/', 'P-Value Calculator', '<path d="M3 24c4 0 6-16 13-16s9 16 13 16"/><path d="M3 24h26"/>'], ['/standard-deviation-calculator/', 'Standard Deviation Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>']]
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
        ${mkSeg('lrEntry', 'How will you enter the data?', [['lists', 'Two lists'], ['pairs', 'Pairs'], ['summary', 'Summary']], 'lists')}
        <p class="av-note" id="lrEntryNote"></p>
        <div id="lrListsW">
          ${ta('lrX', 'lrXLab', 'Numbers for “X”', 'e.g. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10')}
          ${note('lrXNote')}
          ${ta('lrY', 'lrYLab', 'Numbers for “Y”', 'e.g. 52, 55, 61, 58, 70, 72, 69, 80, 85, 60')}
          ${note('lrYNote')}
        </div>
        <div id="lrPairsW" style="display:none">
          ${ta('lrP', 'lrPLab', 'Pairs, one per line', 'e.g.\n1, 52\n2, 55\n3, 61')}
          ${note('lrPNote')}
        </div>
        <div id="lrSumW" style="display:none">
          <div class="cc-two">${tfld('lrSN', 'Number of pairs (n)', '', 'e.g. 15', 'numeric')}${tfld('lrSMx', 'Mean of X', '', 'e.g. 1.65')}</div>
          <div class="cc-two">${tfld('lrSMy', 'Mean of Y', '', 'e.g. 62.08')}${tfld('lrSSxx', 'Sxx = Σ(x − x̄)²', '', 'e.g. 0.2')}</div>
          <div class="cc-two">${tfld('lrSSyy', 'Syy = Σ(y − ȳ)²', '', 'e.g. 690')}${tfld('lrSSxy', 'Sxy = Σ(x − x̄)(y − ȳ)', '', 'e.g. 12')}</div>
          ${note('lrSumNote')}
        </div>
        <div id="lrExW">
          <p class="zs-sech" style="margin-top:4px">Try an example</p>
          <div class="chips" id="lrExChips" role="group" aria-label="Example data"><button type="button" data-v="study">Study hours</button><button type="button" data-v="height">Height and mass</button><button type="button" data-v="negative">Negative</button><button type="button" data-v="none">No pattern</button><button type="button" data-v="outlier">One outlier</button><button type="button" data-v="curve">U-shape</button></div>
        </div>
        ${tfld('lrConf', 'Confidence level', '% · optional', 'e.g. 95')}
        <div class="chips" id="lrConfChips" role="group" aria-label="Common confidence levels"><button type="button" data-v="90">90%</button><button type="button" data-v="95">95%</button><button type="button" data-v="99">99%</button></div>
        ${note('lrConfNote')}
        <p class="zs-sech">Predict <span>· optional</span></p>
        ${tfld('lrPx', 'Predict Y for these X values', '', 'e.g. 11, 12, 13', 'text')}
        ${note('lrPxNote')}
        ${tfld('lrPy', 'Find the X for this Y value', '', 'e.g. 70', 'text')}
        ${note('lrPyNote')}
        <div class="res-hint" id="lrHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="lrAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${mkSeg('lrModel', 'Shape of the fit', [['1', 'Straight line'], ['2', 'Quadratic curve'], ['3', 'Cubic curve']], '1')}
          ${note('lrModelNote')}
          <div id="lrOriginW">
            ${mkSeg('lrOrigin', 'The line crosses the Y axis…', [['fit', 'Where the data say'], ['zero', 'At zero']], 'fit')}
            ${note('lrOriginNote')}
          </div>
          <p class="zs-sech">Weights <span>· optional</span></p>
          ${ta('lrW', 'lrWLab', 'One weight per pair', 'e.g. 1, 1, 2, 1, 3, 1, 1, 2, 1, 1')}
          ${note('lrWNote')}
          <p class="zs-sech">Variable names <span>· optional</span></p>
          <div class="cc-two">${tfld('lrNameX', 'Name of X', '', 'e.g. Hours studied', 'text')}${tfld('lrNameY', 'Name of Y', '', 'e.g. Exam score', 'text')}</div>
          ${note('lrNameNote')}
          <p class="zs-sech">Display <span>· optional</span></p>
          ${tfld('lrDec', 'Decimal places', '', 'e.g. 3', 'numeric')}
          ${note('lrDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="lrClear" type="button">Clear fields</button>
          <button class="advbtn" id="lrAdvBtn" type="button">
            <span id="lrAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="lrLab">Best-fit line</div>
          <div class="res-big"><span id="lrBig">—</span></div>
          <div class="res-sub" id="lrSub" data-empty="Type the X and Y numbers to see the best-fit line, R², the p-value and a picture of your data.">Type the X and Y numbers to see the best-fit line, R², the p-value and a picture of your data.</div>
        </div>
        <div id="lrBody" style="display:none">
          <p class="res-tip adv-tip" id="lrTip"></p>
          <div id="lrVisWrap" style="display:none">
            <p class="bm-h">Your data, the best-fit line and the points that steer it</p>
            <div class="cc-vis" id="lrVis"></div>
            <div class="cc-tools"><button class="linkbtn" id="lrSqBtn" type="button">Show squares</button><button class="linkbtn" id="lrZoomIn" type="button">Zoom in</button><button class="linkbtn" id="lrZoomOut" type="button">Zoom out</button></div>
            <p class="cb-note" id="lrVisKey"></p>
          </div>
          <div id="lrResWrap" style="display:none">
            <p class="bm-h">The errors along X (residuals)</p>
            <div class="cc-vis" id="lrRes"></div>
            <p class="cb-note" id="lrResKey"></p>
          </div>
          <div id="lrCoefWrap" style="display:none">
            <p class="bm-h">The coefficients</p>
            <div class="cc-tbl"><table class="dtable" id="lrCoef"></table></div>
            <p class="cb-note" id="lrCoefKey"></p>
          </div>
          <div id="lrFitWrap" style="display:none">
            <p class="bm-h">How well it fits <button class="linkbtn" type="button" data-copy="lrCopyTxt" style="margin-left:8px">Copy result</button><button class="linkbtn" type="button" data-copy="lrCsvTxt" style="margin-left:8px">Copy as CSV</button></p>
            <div class="cc-tbl"><table class="dtable" id="lrFit"></table></div>
            <div class="cc-tbl"><table class="dtable" id="lrAnova"></table></div>
            <div id="lrCopyTxt" style="display:none"></div>
            <div id="lrCsvTxt" style="display:none"></div>
          </div>
          <div id="lrCurvesWrap" style="display:none">
            <p class="bm-h">Does a curve help?</p>
            <div class="cc-tbl"><table class="dtable" id="lrCurves"></table></div>
            <p class="cb-note" id="lrCurvesKey"></p>
          </div>
          <div id="lrInfWrap" style="display:none">
            <p class="bm-h">Which points are steering the line?</p>
            <div class="cc-tbl"><table class="dtable" id="lrInf"></table></div>
            <p class="cb-note" id="lrInfKey"></p>
          </div>
          <div id="lrPredWrap" style="display:none">
            <p class="bm-h">Predicting Y from X</p>
            <div class="cc-tbl"><table class="dtable" id="lrPred"></table></div>
            <p class="cb-note" id="lrPredKey"></p>
          </div>
          <div id="lrInvWrap" style="display:none">
            <p class="bm-h">Finding X from Y</p>
            <div class="cc-tbl"><table class="dtable" id="lrInv"></table></div>
            <p class="cb-note" id="lrInvKey"></p>
          </div>
          <div id="lrWhatWrap" style="display:none">
            <p class="bm-h">What would it take?</p>
            <div class="cc-tbl"><table class="dtable" id="lrWhat"></table></div>
            <p class="cb-note" id="lrWhatKey"></p>
          </div>
          <div id="lrCheckWrap" style="display:none">
            <p class="bm-h">Is a straight line appropriate here?</p>
            <ul class="cc-steps" id="lrCheckList"></ul>
          </div>
          <details class="faq" id="lrTabWrap" style="display:none"><summary>Show the table of errors</summary>
            <div class="cc-tbl"><table class="dtable" id="lrTab"></table></div>
          </details>
          <div id="lrWriteWrap" style="display:none">
            <p class="bm-h">Write it up <button class="linkbtn" type="button" data-copy="lrWrite" style="margin-left:8px">Copy sentence</button></p>
            <div class="chips" id="lrCiteChips" role="group" aria-label="Sentence style"><button type="button" data-v="sentence" class="on">Sentence</button><button type="button" data-v="paren">APA (parenthetical)</button><button type="button" data-v="narr">APA (narrative)</button><button type="button" data-v="chicago">Chicago</button><button type="button" data-v="plain">Plain English</button></div>
            <p class="cc-write" id="lrWrite"></p>
          </div>
          <div id="lrStepsWrap" style="display:none">
            <p class="bm-h">How it is worked out</p>
            <ol class="cc-steps" id="lrSteps"></ol>
          </div>
        </div>`;
  const left = `
        <h2>How to use the linear regression calculator</h2>
        <p>Paste the <strong>X numbers</strong> in the first box and the <strong>Y numbers</strong> in the second (a column from Excel works), or switch to one pair per line, or to the summary numbers if all you have are n, the means and the sums of squares. The line, its intervals, R² and a picture of your data appear as you type. Type X values under “Predict” to get Y with its interval, or a Y value to find the X.</p>
        <p>Go advanced to fit a quadratic or cubic curve, force the line through zero, give each pair a weight, or name the variables. Use “Show squares” on the picture to see the squared errors the line makes as small as possible.</p>

        <h2 id="lrFormulas">The linear regression formula</h2>
        <div class="formula">
          Y = a + b X &nbsp; with &nbsp; b = Sxy ÷ Sxx &nbsp; and &nbsp; a = ȳ − b × x̄
          <small>LEAST SQUARES LINE · Sxx = Σ(x − x̄)² · Sxy = Σ(x − x̄)(y − ȳ) · t = b ÷ (standard error of b) WITH n − 2 DEGREES OF FREEDOM</small>
        </div>
        <p>Worked out with this calculator for the ${H.x.length} heights (m) and masses (kg) in the Wikipedia article on simple linear regression: slope ${f3(fh.co[1])}, intercept ${f3(fh.co[0])}, standard errors ${f3(fh.rows[1].se)} and ${f3(fh.rows[0].se)}, 95% intervals ${f2(ch[1].lo)} to ${f2(ch[1].hi)} for the slope and ${f2(ch[0].lo)} to ${f2(ch[0].hi)} for the intercept, r = ${f4(rH)}, R² = ${f4(fh.r2)}, F(1, ${fh.df}) = ${f2(fh.F)} and p = ${pfmt(fh.pF)}. A woman 1.60 m tall is predicted to weigh ${f2(ph.y)} kg (one-new-point interval ${f2(ph.pLo)} to ${f2(ph.pHi)} kg).</p>
        <h2 id="lrCurve">Straight line or curve?</h2>
        <p>For the same 15 pairs the quadratic fit raises R² from ${f4(cvh[0].r2)} to ${f4(cvh[1].r2)} and its extra term is significant (p = ${pfmt(cvh[1].p)}), while the cubic term is not (p = ${pfmt(cvh[2].p)}): the points bend a little, as the Wikipedia article on ordinary least squares notes for this data set. The “Does a curve help?” table runs this comparison on your data every time.</p>
        <h2>Which points are steering the line?</h2>
        <p>A single extreme pair can tilt a line. The calculator computes Cook’s distance and the fit without each point. In the study example, pair #${top + 1} (X = ${S.x[top]}, Y = ${S.y[top]}) has a Cook’s distance of ${f2(fs1.D[top])}, above the cut-off ${f2(dcut)}, and leaving it out moves the slope from ${f3(fs1.co[1])} to ${f3(fs1.looCo[top][1])} and R² from ${f4(fs1.r2)} to ${f4(fs1.looR2[top])}.</p>`;
  const right = `
        <h2 id="lrReading">Reading the result</h2>
        <p>The <strong>slope</strong> is the average change in Y per 1 of X; its <strong>p-value</strong> tests whether it differs from 0 and, for a straight line, equals the p-value of the whole fit. <strong>R²</strong> is the share of the variation in Y the line explains; <strong>adjusted R²</strong> corrects it for the number of terms. <strong>S</strong> is the typical size of an error in Y units, so a prediction is usually within about 2 S of the line. The two intervals for a prediction differ: the narrow one is for the average Y at that X, the wide one for one new observation.</p>
        <h2>Through the origin and weights</h2>
        <p>Forcing the line through (0, 0) changes the study example’s slope from ${f3(fs1.co[1])} to ${f3(f0.co[1])}. R² is then measured against zero, not the mean, so it is higher and not comparable. Weights make pairs with a larger weight count more, as when each point stands for a different number of people.</p>
        <h2>Quadratic fit on the study data</h2>
        <p>Fitting a quadratic curve to the study numbers gives Y = ${f2(fq.co[0])} + ${f2(fq.co[1])} X ${fq.co[2] < 0 ? '−' : '+'} ${f3(Math.abs(fq.co[2]))} X², with R² = ${f4(fq.r2)} against ${f4(fs1.r2)} for the line.</p>
        <h2>How many pairs do I need?</h2>
        <p>For the 15-pair example the smallest slope that would be significant at 0.05 is ±${f3(tcrit13 * fh.rows[1].se)}; yours is ${f3(fh.co[1])}. Keeping r at ${f4(Math.sqrt(fs1.r2))}, the study example reaches p below 0.05 with ${pl1.sig} pairs and about ${pl1.pow} pairs give 80% power (approximate, Fisher z).</p>

        <h2>Related tools</h2>
        <p>To measure how closely two variables move together use the <a href="/correlation-coefficient-calculator/">correlation coefficient calculator</a>; to compare two groups the <a href="/t-test-calculator/">t-test calculator</a>; to turn a statistic into a p-value the <a href="/p-value-calculator/">p-value calculator</a>; and to find a spread the <a href="/standard-deviation-calculator/">standard deviation calculator</a>.</p>
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
    <span class="mbar-lab" id="lrMLab">Best-fit line</span>
    <div class="mbar-vals"><b id="lrMVal">—</b></div>
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

    <h2 id="lrFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initRegCalc();</script>
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
const prev = { slug: 'correlation-coefficient-calculator', menu: 'Correlation Coefficient', name: 'Correlation Coefficient Calculator', llms: 'Correlation Coefficient Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M4 28V4" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M4 28h24" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="23" r="2" fill="#8F5C13"/><circle cx="14" cy="20" r="2" fill="#8F5C13"/><circle cx="19" cy="14" r="2" fill="#8F5C13"/><circle cx="24" cy="10" r="2" fill="#8F5C13"/><path d="M6 26L28 7" stroke="#37503F" stroke-width="1.6" fill="none"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — the best-fit line from your X and Y numbers, with R², intervals, predictions and the points that steer the line</span></li>\n');
    return h;
  });
}
