const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /p-value-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.pvalueEngine. Run: node md-files/gen-pvalue-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const X = CalcThis.pvalueEngine;
const fp = (p) => X.fp(p);
const r3 = (x) => String(Math.round(x * 1000) / 1000);
const T1 = X.pvals('t', { df: 20 }, 2.1), Z1 = X.pvals('z', {}, 1.96), C1 = X.pvals('chi', { df: 1 }, 3.84), F1 = X.pvals('f', { d1: 1, d2: 10 }, 4.96);
const RT = X.rToT(0.45, 25), R1 = X.pvals('t', { df: RT.df }, RT.t);
const ZL = X.pvals('z', {}, -1.5);
const crit = (k, P, a, tail) => X.inv(k, P, a, tail || 'R');
const tblCrit = '<table class="dtable"><thead><tr><th>Test (α = 0.05)</th><th>Two-tailed critical value</th><th>Right-tailed critical value</th></tr></thead><tbody>' +
  '<tr><td>z (normal)</td><td>±' + r3(crit('z', {}, 0.025)) + '</td><td>' + r3(crit('z', {}, 0.05)) + '</td></tr>' +
  [5, 10, 20, 30, 60, 120].map((d) => '<tr><td>t, ' + d + ' degrees of freedom</td><td>±' + r3(crit('t', { df: d }, 0.025)) + '</td><td>' + r3(crit('t', { df: d }, 0.05)) + '</td></tr>').join('') +
  [1, 2, 3, 5, 10].map((d) => '<tr><td>chi-square, ' + d + ' degree' + (d > 1 ? 's' : '') + ' of freedom</td><td>' + r3(crit('chi', { df: d }, 0.025, 'L')) + ' and ' + r3(crit('chi', { df: d }, 0.025)) + '</td><td>' + r3(crit('chi', { df: d }, 0.05)) + '</td></tr>').join('') +
  '</tbody></table>';
const tblWhich = '<table class="dtable"><thead><tr><th>Your test</th><th>Statistic</th><th>Degrees of freedom</th></tr></thead><tbody>' +
  '<tr><td>z-test (known population standard deviation, or a large sample)</td><td>z</td><td>none</td></tr>' +
  '<tr><td>t-test: one sample, paired, or two samples</td><td>t</td><td>n − 1, or n₁ + n₂ − 2</td></tr>' +
  '<tr><td>Chi-square test: goodness of fit, independence</td><td>χ²</td><td>categories − 1, or (rows − 1) × (columns − 1)</td></tr>' +
  '<tr><td>ANOVA, comparing two variances, regression F</td><td>F</td><td>numerator and denominator</td></tr>' +
  '<tr><td>Correlation</td><td>r (with n)</td><td>n − 2</td></tr></tbody></table>';
const tblEx = '<table class="dtable"><thead><tr><th>Statistic</th><th>Left-tailed</th><th>Right-tailed</th><th>Two-tailed</th></tr></thead><tbody>' +
  '<tr><td>t = 2.1, df = 20</td><td>' + fp(T1.left) + '</td><td>' + fp(T1.right) + '</td><td>' + fp(T1.two) + '</td></tr>' +
  '<tr><td>z = 1.96</td><td>' + fp(Z1.left) + '</td><td>' + fp(Z1.right) + '</td><td>' + fp(Z1.two) + '</td></tr>' +
  '<tr><td>z = −1.5</td><td>' + fp(ZL.left) + '</td><td>' + fp(ZL.right) + '</td><td>' + fp(ZL.two) + '</td></tr>' +
  '<tr><td>χ² = 3.84, df = 1</td><td>' + fp(C1.left) + '</td><td>' + fp(C1.right) + '</td><td>' + fp(C1.two) + '</td></tr>' +
  '<tr><td>F = 4.96, df = 1 and 10</td><td>' + fp(F1.left) + '</td><td>' + fp(F1.right) + '</td><td>' + fp(F1.two) + '</td></tr></tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The definition — the p-value is the probability, assuming the null hypothesis is true, of a test statistic at least as extreme as the one observed — and the two-tailed rule p = 2 × min(left tail, right tail) are the standard ones used by Omnicalculator's p-value calculator, GraphPad QuickCalcs, calculator.net, Social Science Statistics and Statology, all opened on 2026-11-10.</li>
          <li>The tails come from the cumulative distribution functions of the normal, t, chi-square and F distributions (regularised incomplete gamma and beta functions). For a correlation, t = r × √(df ÷ (1 − r²)) with df = n − 2. Checked against published values such as t = 2.1 with 20 degrees of freedom → two-tailed p = 0.048618.</li>
          <li>The 0.05 level is a convention, not a law; pick your α before you look at the data. Statistical significance does not measure how large or important an effect is.</li>
        </ul>
        <p><small>For information only. Check your own study design before drawing conclusions.</small></p>`;

const P = {
  slug: 'p-value-calculator', name: 'P-Value Calculator', menu: 'P-Value', body: 'p-bmr p-pv',
  title: 'P-Value Calculator: From Z, t, Chi-Square or F Score',
  desc: 'P value calculator: get the p-value from a z, t, chi-square, F or r statistic for any tail, with a live curve, the critical value and a plain verdict.',
  h1: 'P-Value Calculator', eyebrow: 'From z, t, chi-square, F or correlation · all three tails · live curve',
  lead: `Pick your <strong>test statistic</strong>, type its value (and the <strong>degrees of freedom</strong> if it has them) and see the <strong>p-value</strong> with the tail area drawn on the curve. <strong>t = 2.1 with 20 degrees of freedom</strong> gives a two-tailed p-value of <strong>${fp(T1.two)}</strong>; <strong>z = 1.96</strong> gives <strong>${fp(Z1.two)}</strong>. Left, right and two-tailed values are shown together, with the critical value and whether the result is significant at your α.`,
  schema: 'Free p-value calculator: the p-value from a z-score, t-score, chi-square, F-score or correlation coefficient for a left-tailed, right-tailed or two-tailed test; a live curve with the p-value area shaded and the critical value marked; all three tails at once; a verdict at your significance level; the statistic from a p-value; and the t or z statistic from sample means and standard deviations.',
  llms: 'Free p-value calculator: p-value from a z, t, chi-square, F or correlation statistic for any tail, live curve with the p-value area shaded, critical values, a verdict at your significance level, the statistic from a p-value, and t or z from sample numbers.',
  card: 'P-value from a z, t, chi-square, F or r statistic, all three tails, a live curve with the area shaded, critical values and a plain verdict.',
  faqs: [
    ['How do I find a p-value from a test statistic?', 'Pick the statistic (z, t, chi-square, F or r), type its value and, if it has them, the degrees of freedom, then choose the tail. For t = 2.1 with 20 degrees of freedom the two-tailed p-value is ' + fp(T1.two) + ' and the right-tailed one is ' + fp(T1.right) + '.'],
    ['What is a p-value?', 'The p-value is the probability, if the null hypothesis were true, of getting a test statistic at least as extreme as the one you observed. A small p-value means your result would be unusual under the null hypothesis. It is not the probability that the null hypothesis is true.'],
    ['What is the difference between a one-tailed and a two-tailed p-value?', 'A two-tailed test looks for a difference in either direction and counts both tails of the curve; a right-tailed test asks whether the value is higher than the reference, a left-tailed one whether it is lower. For the symmetric z and t distributions the two-tailed p-value is twice the smaller tail: z = 1.96 gives ' + fp(Z1.right) + ' in the right tail and ' + fp(Z1.two) + ' for two tails.'],
    ['What p-value is statistically significant?', 'Compare it with the significance level α you chose before the test. If p ≤ α you reject the null hypothesis. 0.05 is the most common choice, and 0.01 and 0.10 are also used, but none of them is a law of nature.'],
    ['How do I find the p-value from a t-score?', 'Choose t-score, type the t value and the degrees of freedom (n − 1 for one sample or a paired test, n₁ + n₂ − 2 for two samples with equal variance). t = 2.3 with 11 degrees of freedom gives a two-tailed p-value of ' + fp(X.pvals('t', { df: 11 }, 2.3).two) + '.'],
    ['How do I find the p-value from a z-score?', 'Choose z-score and type it; no degrees of freedom are needed. z = 1.96 gives ' + fp(Z1.two) + ' for a two-tailed test, and z = −1.5 gives ' + fp(ZL.left) + ' in the left tail.'],
    ['How do I find the p-value for a chi-square test or an F test?', 'Choose chi-square or F, type the value and the degrees of freedom (F needs two: numerator and denominator). These tests almost always use the right tail: χ² = 3.84 with 1 degree of freedom gives ' + fp(C1.right) + ', and F = 4.96 with 1 and 10 degrees of freedom gives ' + fp(F1.right) + '.'],
    ['Can I get the p-value from a correlation coefficient?', 'Yes. Choose correlation r and type r and the number of pairs n. The calculator turns r into t = r × √(df ÷ (1 − r²)) with df = n − 2: r = 0.45 with n = 25 gives t = ' + r3(RT.t) + ' and a two-tailed p-value of ' + fp(R1.two) + '.'],
    ['Can I find the test statistic from a p-value?', 'Yes. Go advanced and type the p-value in “Find the statistic from a p-value”: you get the z, t, chi-square, F or r that produces it for the tail you chose. A two-tailed p-value of 0.05 with z gives ±' + r3(crit('z', {}, 0.025)) + '.'],
    ['Can a p-value be exactly 0?', 'In practice no. Very large statistics give extremely small p-values, which this calculator shows in scientific notation such as ' + fp(X.pvals('z', {}, 10).two) + ' for z = 10, rather than rounding to 0.']
  ],
  pills: [['/standard-deviation-calculator/', 'Standard Deviation Calculator', '<path d="M3 18c3 0 4-12 9-12s6 12 9 12"/><path d="M12 6v14"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'], ['/average-calculator/', 'Average Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'], ['/ratio-calculator/', 'Ratio Calculator', '<path d="M4 7h7M4 17h7M15 7h5M15 17h5M8 4v6M8 14v6"/>']]
};

const tfld = (id, label, unit, ph, mode, val, labId) => `<label class="fld" for="${id}"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"${val ? ' value="' + val + '"' : ''}></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const mkCs = (id, label, opts, defKey) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${defKey}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => o[0] === defKey)[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${o[0] === defKey ? ' on' : ''}" role="option" aria-selected="${o[0] === defKey}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;

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

  const STAT = [['z', 'z-score (normal)'], ['t', 't-score'], ['chi', 'Chi-square (χ²)'], ['f', 'F-score'], ['r', 'Correlation r']];
  const BUILD = [['t1', 'One-sample t-test'], ['z1', 'One-sample z-test'], ['t2', 'Two-sample t-test']];
  const rad = (id, v, on, t, d) => `<button class="radopt${on ? ' on' : ''}" type="button" role="radio" aria-checked="${on}" id="${id}" data-v="${v}"><i class="rd"></i><span class="t"><b>${t}</b><span class="d">${d}</span></span></button>`;
  const input = `
        <h2 class="card-h2">Your test result</h2>
        ${mkCs('pvStat', 'What do you have?', STAT, 'z')}
        ${tfld('pvVal', 'z-score', '', 'e.g. 1.96', 'decimal', '', 'pvValLab')}
        ${note('pvValNote')}
        <div id="pvDfW" style="display:none">${tfld('pvDf', 'Degrees of freedom', '', 'e.g. 20')}${note('pvDfNote')}</div>
        <div class="pv-two"><div id="pvDf1W" style="display:none">${tfld('pvDf1', 'Numerator df', '', 'e.g. 4')}</div><div id="pvDf2W" style="display:none">${tfld('pvDf2', 'Denominator df', '', 'e.g. 20')}</div></div>
        ${note('pvFNote')}
        <div id="pvNW" style="display:none">${tfld('pvN', 'Sample size (n)', 'pairs', 'e.g. 25')}${note('pvNNote')}</div>
        ${tfld('pvAlpha', 'Significance level', 'α', 'e.g. 0.05', 'decimal')}
        ${note('pvAlphaNote')}
        <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:8px">Type of p-value</span>
          <div class="radgrp" id="pvTail" role="radiogroup" aria-label="Type of p-value">${rad('pvTail2', 'two', true, 'Two-tailed', 'Different from the reference, in either direction.')}${rad('pvTailL', 'left', false, 'Left-tailed', 'Lower than the reference.')}${rad('pvTailR', 'right', false, 'Right-tailed', 'Higher than the reference.')}</div>
        </div>
        ${note('pvTailNote')}
        <div class="res-hint" id="pvHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="pvAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="pv-sech">Find the statistic from a p-value <span>· optional</span></p>
          ${mkCs('pvRevKind', 'What the number measures', [['tail', 'The tail I chose above'], ['between', 'Between −x and x'], ['centre', 'From the centre to x']], 'tail')}
          ${tfld('pvRev', 'p-value or area', '', 'e.g. 0.03')}
          ${note('pvRevNote')}
          <p class="pv-sech">Work out the statistic from sample numbers <span>· optional</span></p>
          ${mkCs('pvBuild', 'Test', BUILD, 't1')}
          ${tfld('pvM1', 'Sample mean', '', 'e.g. 52.3', 'decimal', '', 'pvM1Lab')}
          <div class="pv-two">${tfld('pvS1', 'Sample standard deviation (s)', '', 'e.g. 4.5', 'decimal', '', 'pvS1Lab')}${tfld('pvN1', 'Sample size (n)', '', 'e.g. 25', 'numeric', '', 'pvN1Lab')}</div>
          <div id="pvM0W">${tfld('pvM0', 'Value to compare with (the null mean)', '', 'e.g. 50', 'decimal', '', 'pvM0Lab')}</div>
          <div id="pvM2W" style="display:none">${tfld('pvM2', 'Group 2 mean', '', 'e.g. 49.1', 'decimal', '', 'pvM2Lab')}</div>
          <div class="pv-two"><div id="pvS2W" style="display:none">${tfld('pvS2', 'Group 2 standard deviation', '', 'e.g. 5.1', 'decimal', '', 'pvS2Lab')}</div><div id="pvN2W" style="display:none">${tfld('pvN2', 'Group 2 size', '', 'e.g. 25', 'numeric', '', 'pvN2Lab')}</div></div>
          <div class="fld" id="pvPoolW" style="display:none"><span class="lab">Variances</span><div class="seg pv-seg" role="group" aria-label="Variances"><button class="on" type="button" data-v="welch">Not equal (Welch)</button><button type="button" data-v="pooled">Equal (pooled)</button></div></div>
          ${note('pvBuildNote')}
          <div class="pv-usew"><button class="btn" id="pvUse" type="button" style="display:none">Use this statistic above</button></div>
          <p class="pv-sech">Display <span>· optional</span></p>
          ${tfld('pvDec', 'Decimal places', '', 'e.g. 4', 'numeric')}
          ${note('pvDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="pvClear" type="button">Clear fields</button>
          <button class="advbtn" id="pvAdvBtn" type="button">
            <span id="pvAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="pvLab">p-value</div>
          <div class="res-big"><span id="pvBig">—</span></div>
          <div class="res-sub" id="pvSub" data-empty="Type your test result to see the p-value.">Type your test result to see the p-value.</div>
        </div>
        <div id="pvBody" style="display:none">
          <p class="res-tip adv-tip" id="pvTip"></p>
          <div id="pvCurveWrap" style="display:none">
            <p class="bm-h">Where your result sits on the curve</p>
            <div class="pv-curve" id="pvCurve"></div>
            <p class="cb-note" id="pvCurveKey"></p>
          </div>
          <div id="pvTailsWrap" style="display:none">
            <p class="bm-h">All three tails at once</p>
            <table class="dtable" id="pvTails"></table>
            <p class="cb-note">Click a row to use that tail.</p>
          </div>
        </div>`;
  const left = `
        <h2>How to use the p-value calculator</h2>
        <p>Choose the <strong>statistic your test gave you</strong> — z, t, chi-square, F, or a correlation r — and type its value. t, chi-square, F and r also need <strong>degrees of freedom</strong> (or the sample size for r); the note under each field says where to find them. Type your <strong>significance level α</strong> (0.05 is used if you leave it empty) and choose the <strong>type of p-value</strong>: two-tailed for any difference, left-tailed for “lower than”, right-tailed for “higher than”.</p>
        <p>The result shows the p-value for that tail, whether it is at or below α, and a curve of the distribution with your statistic marked and the p-value area shaded. The table under it gives the left, right and two-tailed p-values at once; click a row to switch tails. Go advanced to turn a p-value (or an area between −x and x, or from the centre to x, for z, t and r) back into a statistic, or to work out t or z from sample means and standard deviations.</p>

        <h2>Which statistic do I have?</h2>
        ${tblWhich}

        <h2>The formulas</h2>
        <div class="formula">
          left tail = P(X ≤ x) · right tail = P(X ≥ x) · two tails = 2 × min(left, right)
          <small>THE P-VALUE IS THE TAIL AREA UNDER THE CURVE OF THE NULL DISTRIBUTION</small>
        </div>
        <p>For a correlation, t = r × √(df ÷ (1 − r²)) with df = n − 2. From sample numbers: one-sample t = (x̄ − μ₀) ÷ (s ÷ √n) with n − 1 degrees of freedom; two-sample Welch t = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂). Values worked out by this calculator:</p>
        ${tblEx}`;
  const right = `
        <h2>How to read the p-value</h2>
        <p>If the p-value is at or below your significance level α, the result is statistically significant and you reject the null hypothesis; if it is above α you do not have enough evidence to reject it. Rejecting or not rejecting says nothing about how big or useful the effect is, and a p-value above α does not prove the null hypothesis true. Choose α before you look at the data.</p>
        <h2>Critical values at α = 0.05</h2>
        <p>A statistic past the critical value gives a p-value below α. The calculator marks these lines on the curve for your α.</p>
        ${tblCrit}
        <h2>Worked example</h2>
        <p>A t-test gives t = 2.1 with 20 degrees of freedom. Two-tailed: p = ${fp(T1.two)}, below 0.05, so the difference is significant at the 5% level. Right-tailed: p = ${fp(T1.right)}. For r = 0.45 from 25 pairs, t = ${r3(RT.t)} with ${RT.df} degrees of freedom and a two-tailed p-value of ${fp(R1.two)}.</p>

        <h2>Related tools</h2>
        <p>For the spread of your data use the <a href="/standard-deviation-calculator/">standard deviation calculator</a>, to average a list of numbers the <a href="/average-calculator/">average calculator</a>, and for percentages the <a href="/percentage-calculator/">percentage calculator</a>.</p>
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
    <span class="mbar-lab" id="pvMLab">p-value</span>
    <div class="mbar-vals"><b id="pvMVal">—</b></div>
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
<script>CalcThis.initPvalueCalc();</script>
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
const prev = { slug: 'standard-deviation-calculator', menu: 'Standard Deviation', name: 'Standard Deviation Calculator', llms: 'Standard Deviation Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("(  \\{ file: '" + prev.slug + "/index\\.html',[^\\n]*\\n)"), (mm) => mm + "  { file: '" + P.slug + "/index.html',          slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M3 24c4 0 6-16 13-16s9 16 13 16" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M3 24h26" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M20 24c2-4 3-9 4.5-12" stroke="#37503F" stroke-width="2" stroke-linecap="round"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — p-value from a z, t, chi-square, F or r statistic, all three tails, a live curve and critical values</span></li>\n');
    return h;
  });
}
