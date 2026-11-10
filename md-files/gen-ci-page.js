const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /confidence-interval-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.ciEngine. Run: node md-files/gen-ci-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE', 'CI'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const E = CalcThis.ciEngine;
const fx = (x, d) => { const s = x.toFixed(d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s.replace('-', '−'); };
const f4 = (x) => fx(x, 4), f2 = (x) => fx(x, 2), f3 = (x) => fx(x, 3);
const pc = (x, d) => fx(x * 100, d === undefined ? 1 : d) + '%';
const A = { n: 100, m: 22.8, s: 2.7 };
const At = E.mean(A.m, A.s, A.n, true, 0.95), Az = E.mean(A.m, A.s, A.n, false, 0.95);
const B = { n: 50, m: 20.6, s: 3.2 };
const Bt = E.mean(B.m, B.s, B.n, true, 0.95);
const Bs = [0.90, 0.95, 0.99].map((l) => E.mean(B.m, B.s, B.n, true, l));
const P1 = { x: 40, n: 100 };
const Pw = E.prop(P1.x, P1.n, 'wald', 0.95), Pi = E.prop(P1.x, P1.n, 'wilson', 0.95), Px = E.prop(P1.x, P1.n, 'exact', 0.95);
const P2 = { x: 3, n: 40 };
const Qw = E.prop(P2.x, P2.n, 'wald', 0.95), Qi = E.prop(P2.x, P2.n, 'wilson', 0.95), Qx = E.prop(P2.x, P2.n, 'exact', 0.95);
const K = E.poisson(10, 0.95), Kn = E.poissonNormal(10, 0.95);
const D1 = { m1: 52.3, s1: 4.5, n1: 25, m2: 49.1, s2: 5.1, n2: 25 };
const Dw = E.diffMeans({ m: D1.m1, se: D1.s1 / 5, n: D1.n1, s: D1.s1 }, { m: D1.m2, se: D1.s2 / 5, n: D1.n2, s: D1.s2 }, 'welch', 0.95);
const Dp = E.diffProps(55, 120, 40, 100, 0.95);
const N1 = E.needMean(15, 2, 0.95), N2 = E.needProp(0.5, 0.03, 0.95), N3 = E.needProp(0.5, 0.05, 0.95);
const Ln = [[0.80, '80%'], [0.85, '85%'], [0.90, '90%'], [0.95, '95%'], [0.98, '98%'], [0.99, '99%'], [0.999, '99.9%']];
const tblZ = '<table class="dtable" id="ciZTable"><thead><tr><th>Confidence level</th><th>z critical value</th></tr></thead><tbody>' + Ln.map((l) => '<tr><td>' + l[1] + '</td><td>' + f3(E.zc(l[0])) + '</td></tr>').join('') + '</tbody></table>';
const tblT = '<table class="dtable"><thead><tr><th>Degrees of freedom</th><th>90%</th><th>95%</th><th>99%</th></tr></thead><tbody>' + [2, 5, 10, 20, 30, 60, 120].map((d) => '<tr><td>' + d + '</td>' + [0.9, 0.95, 0.99].map((l) => '<td>' + f3(E.tc(l, d)) + '</td>').join('') + '</tr>').join('') + '<tr><td>z (infinite)</td>' + [0.9, 0.95, 0.99].map((l) => '<td>' + f3(E.zc(l)) + '</td>').join('') + '</tr></tbody></table>';
const tblM = '<table class="dtable"><thead><tr><th>Method (40 yes out of 100, 95%)</th><th>Interval</th></tr></thead><tbody>' +
  '<tr><td>Normal approximation (Wald)</td><td>' + pc(Pw.lo) + ' to ' + pc(Pw.hi) + '</td></tr><tr><td>Wilson score</td><td>' + pc(Pi.lo) + ' to ' + pc(Pi.hi) + '</td></tr><tr><td>Exact (Clopper-Pearson)</td><td>' + pc(Px.lo) + ' to ' + pc(Px.hi) + '</td></tr></tbody></table>';
const tblM2 = '<table class="dtable"><thead><tr><th>Method (3 yes out of 40, 95%)</th><th>Interval</th></tr></thead><tbody>' +
  '<tr><td>Normal approximation (Wald)</td><td>' + pc(Qw.lo) + ' to ' + pc(Qw.hi) + '</td></tr><tr><td>Wilson score</td><td>' + pc(Qi.lo) + ' to ' + pc(Qi.hi) + '</td></tr><tr><td>Exact (Clopper-Pearson)</td><td>' + pc(Qx.lo) + ' to ' + pc(Qx.hi) + '</td></tr></tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The mean interval x̄ ± critical value × s/√n, the 95% z value 1.960 and the z table by level are the ones shown by calculator.net's and Omnicalculator's confidence interval calculators; the proportion interval p̂ ± z√(p̂(1 − p̂)/n) is Omnicalculator's; GraphPad QuickCalcs gives exact intervals for a proportion and a Poisson count. All opened on 2026-11-10.</li>
          <li>The t distribution is used when the standard deviation comes from your sample, the normal (z) distribution when the population standard deviation is known — the usual textbook rule; calculators that always use z are close for large samples (the table above shows the gap). Wilson, Clopper-Pearson and the exact Poisson interval are standard methods, checked against an independent calculation. Quantiles come from the t, normal, beta and chi-square distributions.</li>
          <li>A confidence level describes the method, not one interval: it is the share of intervals built this way that would contain the true value if you repeated the study many times.</li>
        </ul>
        <p><small>For information only. Check your own study design before drawing conclusions.</small></p>`;

const P = {
  slug: 'confidence-interval-calculator', name: 'Confidence Interval Calculator', menu: 'Confidence Interval', body: 'p-bmr p-ci',
  title: 'Confidence Interval Calculator: Mean, Proportion, Count',
  desc: 'Confidence interval calculator: get the 90%, 95% or 99% interval for a mean, proportion or count, with t or z, a live curve and the sample size you need.',
  h1: 'Confidence Interval Calculator', eyebrow: 'For a mean, proportion or count · 90, 95 or 99% · live curve',
  lead: `Type your <strong>sample mean, standard deviation and sample size</strong> (or a list of numbers, a number of yes answers, or a count) and get the <strong>confidence interval</strong> with the margin of error and a picture of it. A mean of <strong>${A.m}</strong> with a standard deviation of <strong>${A.s}</strong> from <strong>${A.n}</strong> people gives a 95% interval of <strong>${f2(At.lo)} to ${f2(At.hi)}</strong>. Choose 90%, 95% or 99%, see how much more data would narrow it, and what sample size you need for a margin of error you want.`,
  schema: 'Free confidence interval calculator: the confidence interval and margin of error for a mean (t or z), a proportion (normal approximation, Wilson or exact), a Poisson count, and the difference between two means or two proportions; a live curve with the interval shaded and the interval at 90, 95 and 99%; raw data list; the level from a z-score or p-value; and the sample size needed for a target margin of error.',
  llms: 'Free confidence interval calculator: interval and margin of error for a mean (t or z), a proportion (Wald, Wilson, exact) or a count, differences of two groups, live curve, 90/95/99% levels and the sample size for a target margin of error.',
  card: 'Confidence interval for a mean, proportion or count at 90, 95 or 99%, with t or z, a live curve and the sample size you need.',
  faqs: [
    ['How do I calculate a confidence interval?', 'For a mean, take the sample mean, divide the standard deviation by √n to get the standard error, multiply it by the critical value for your confidence level (t or z), then add and subtract that margin of error. A mean of ' + B.m + ', a standard deviation of ' + B.s + ' and n = ' + B.n + ' gives ' + f4(Bt.me) + ' as the margin of error at 95% and an interval of ' + f2(Bt.lo) + ' to ' + f2(Bt.hi) + '.'],
    ['What does a 95% confidence interval mean?', 'If you repeated the study many times and built an interval each time, about 95 of every 100 of those intervals would contain the true value. It does not mean there is a 95% chance that this one interval contains it — the true value is fixed, the interval is what varies.'],
    ['How do I find a 90% or 99% confidence interval?', 'Tap the 90 or 99 chip (or type the level). The critical z value grows with the level: ' + f3(E.zc(0.90)) + ' at 90%, ' + f3(E.zc(0.95)) + ' at 95% and ' + f3(E.zc(0.99)) + ' at 99%, so the same data give a wider interval. For the mean above: ' + f2(Bs[0].lo) + ' to ' + f2(Bs[0].hi) + ' at 90% and ' + f2(Bs[2].lo) + ' to ' + f2(Bs[2].hi) + ' at 99%.'],
    ['Should I use t or z?', 'Use t when the standard deviation comes from your sample (almost always), and z when the population standard deviation is known. The calculator picks t for a sample standard deviation and shows the z answer in a second row; with n = ' + A.n + ' the two margins are ' + f4(At.me) + ' (t) and ' + f4(Az.me) + ' (z), and they converge as n grows.'],
    ['How do I get a confidence interval for a proportion?', 'Switch to Proportion and type the number of yes answers and the sample size. ' + P1.x + ' yes out of ' + P1.n + ' gives ' + pc(Pw.lo) + ' to ' + pc(Pw.hi) + ' with the normal approximation, ' + pc(Pi.lo) + ' to ' + pc(Pi.hi) + ' with Wilson and ' + pc(Px.lo) + ' to ' + pc(Px.hi) + ' with the exact method. For small samples or proportions near 0% or 100% prefer Wilson or exact: ' + P2.x + ' out of ' + P2.n + ' gives ' + pc(Qw.lo) + ' to ' + pc(Qw.hi) + ' with the normal approximation (which would reach below 0%) but ' + pc(Qi.lo) + ' to ' + pc(Qi.hi) + ' with Wilson.'],
    ['How big a sample do I need for a margin of error?', 'Go advanced and type the margin of error you want. For a proportion, ±3 percentage points at 95% needs ' + N2.toLocaleString('en-US') + ' people in the worst case (p̂ = 50%), and ±5 points needs ' + N3.toLocaleString('en-US') + '. For a mean with a standard deviation of 15, a margin of ±2 needs ' + N1 + ' people.'],
    ['How do I get an interval for the difference between two groups?', 'Go advanced and choose Two groups, then type group 2. For two means the Welch method (no equal-variance assumption) is used: ' + D1.m1 + ' (s = ' + D1.s1 + ', n = ' + D1.n1 + ') against ' + D1.m2 + ' (s = ' + D1.s2 + ', n = ' + D1.n2 + ') gives a difference of ' + f2(Dw.est) + ' with a 95% interval of ' + f2(Dw.lo) + ' to ' + f2(Dw.hi) + '. If the interval includes 0 the data do not rule out no difference.'],
    ['What if I only have the raw numbers?', 'Choose “List of numbers” and paste them separated by commas, spaces or new lines. The calculator works out n, the mean and the sample standard deviation, and uses the t distribution.'],
    ['What if I know the standard error, a z-score or a p-value instead?', 'Go advanced: pick “Standard error” under how the spread is known, and set the confidence level from a z-score (for example 1.96) or a right-tailed p-value (0.025) instead of a percentage.'],
    ['Can I get a confidence interval for a count?', 'Yes. Choose Count and type the number you counted: the exact Poisson interval for the average count is shown. A count of 10 gives ' + f2(K.lo) + ' to ' + f2(K.hi) + ' at 95%, while the normal approximation k ± z√k would give ' + f2(Kn.lo) + ' to ' + f2(Kn.hi) + '.']
  ],
  pills: [['/p-value-calculator/', 'P-Value Calculator', '<path d="M3 24c4 0 6-16 13-16s9 16 13 16"/><path d="M3 24h26"/>'], ['/standard-deviation-calculator/', 'Standard Deviation Calculator', '<path d="M3 18c3 0 4-12 9-12s6 12 9 12"/><path d="M12 6v14"/>'], ['/average-calculator/', 'Average Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>']]
};

const tfld = (id, label, unit, ph, mode, labId) => `<label class="fld" for="${id}"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const mkCs = (id, label, opts, defKey) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${defKey}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => o[0] === defKey)[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${o[0] === defKey ? ' on' : ''}" role="option" aria-selected="${o[0] === defKey}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkSeg = (id, label, opts, def) => `<div class="fld"><span class="lab">${label}</span><div class="seg ci-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;

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
        <h2 class="card-h2">Your sample</h2>
        ${mkSeg('ciMode', 'What do you want an interval for?', [['mean', 'Average'], ['prop', 'Proportion'], ['count', 'Count']], 'mean')}
        <div id="ciMeanW">
          <div id="ciHaveW">${mkSeg('ciHave', 'I have', [['sum', 'Summary'], ['list', 'A list']], 'sum')}</div>
          <div id="ciSumW">
            ${tfld('ciMean', 'Sample mean (average)', '', 'e.g. 20.6')}
            <div class="ci-two">${tfld('ciSd', 'Standard deviation (s)', '', 'e.g. 3.2', 'decimal', 'ciSdLab')}${tfld('ciN', 'Sample size (n)', '', 'e.g. 50', 'numeric', 'ciNLab')}</div>
          </div>
          <div id="ciListW" style="display:none"><div class="fld"><label class="lab" for="ciList">Your numbers</label><textarea class="ci-ta" id="ciList" placeholder="e.g. 21, 13, 11, 14, 52, 23&#10;or paste a column from Excel" aria-label="Your numbers" spellcheck="false"></textarea></div></div>
        </div>
        <div id="ciPropW" style="display:none"><div class="ci-two">${tfld('ciX', 'Number of yes answers', '', 'e.g. 40', 'numeric')}${tfld('ciPn', 'Sample size (n)', '', 'e.g. 100', 'numeric')}</div></div>
        <div id="ciCountW" style="display:none">${tfld('ciK', 'Number counted', '', 'e.g. 12', 'numeric')}</div>
        ${note('ciMainNote')}
        ${tfld('ciLevel', 'Confidence level', '%', 'e.g. 95')}
        <div class="chips" id="ciChips" role="group" aria-label="Common confidence levels"><button type="button" data-v="90">90%</button><button type="button" data-v="95">95%</button><button type="button" data-v="99">99%</button></div>
        ${note('ciLevelNote')}
        <div class="res-hint" id="ciHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="ciAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="ciSecGroups">
          <p class="ci-sech">Compare two groups <span>· optional</span></p>
          <div id="ciGroupsW">${mkSeg('ciGroups', 'Groups', [['one', 'One group'], ['two', 'Two groups']], 'one')}</div>
          ${note('ciGroupNote')}
          <div id="ciG2MeanW" style="display:none">${tfld('ciMean2', 'Group 2 mean', '', 'e.g. 19.8')}<div class="ci-two">${tfld('ciSd2', 'Group 2 standard deviation', '', 'e.g. 3.4', 'decimal', 'ciSd2Lab')}${tfld('ciN2', 'Group 2 size', '', 'e.g. 40', 'numeric')}</div></div>
          <div id="ciG2PropW" style="display:none"><div class="ci-two">${tfld('ciX2', 'Group 2 yes answers', '', 'e.g. 55', 'numeric')}${tfld('ciPn2', 'Group 2 size', '', 'e.g. 120', 'numeric')}</div></div>
          </div>
          <div id="ciSecSpread">
          <p class="ci-sech">How your spread is known <span>· optional</span></p>
          <div id="ciSpreadW">${mkSeg('ciSpread', 'The spread you typed is', [['s', 'Sample'], ['sigma', 'Population'], ['se', 'Std. error']], 's')}</div>
          ${note('ciSpreadNote')}
          </div>
          <p class="ci-sech">Set the level another way <span>· optional</span></p>
          ${mkCs('ciBy', 'Set the level by', [['level', 'Confidence level'], ['z', 'z-score'], ['p', 'Right-tailed p-value']], 'level')}
          <div id="ciByValW" style="display:none">${tfld('ciByVal', 'z-score', '', 'e.g. 1.96', 'decimal', 'ciByValLab')}</div>
          ${note('ciByNote')}
          <div id="ciSecProp">
          <p class="ci-sech">Proportion options <span>· optional</span></p>
          <div id="ciMethodW">${mkCs('ciMethod', 'Method', [['wald', 'Normal approximation (Wald)'], ['wilson', 'Wilson score'], ['exact', 'Exact (Clopper-Pearson)']], 'wald')}</div>
          ${note('ciMethodNote')}
          <div id="ciPhatW">${tfld('ciPhat', 'Sample proportion instead of yes answers', '', 'e.g. 0.4 or 40%')}</div>
          ${note('ciPhatNote')}
          </div>
          <p class="ci-sech">How many people do I need? <span>· optional</span></p>
          ${tfld('ciTarget', 'Margin of error I want', '', 'e.g. 0.5', 'decimal', 'ciTargetLab')}
          ${note('ciTargetNote')}
          <p class="ci-sech">Display <span>· optional</span></p>
          ${tfld('ciDec', 'Decimal places', '', 'e.g. 4', 'numeric')}
          ${note('ciDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="ciClear" type="button">Clear fields</button>
          <button class="advbtn" id="ciAdvBtn" type="button">
            <span id="ciAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="ciLab">Confidence interval</div>
          <div class="res-big"><span id="ciBig">—</span></div>
          <div class="res-sub" id="ciSub" data-empty="Type your sample to see the confidence interval.">Type your sample to see the confidence interval.</div>
        </div>
        <div id="ciBody" style="display:none">
          <p class="res-tip adv-tip" id="ciTip"></p>
          <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="ciCopyTxt" style="margin-left:8px">Copy result</button></p>
          <table class="dtable" id="ciNums"></table>
          <div id="ciCopyTxt" style="display:none"></div>
          <div id="ciVisWrap" style="display:none">
            <p class="bm-h">Where the true value likely sits</p>
            <div class="ci-vis" id="ciVis"></div>
            <p class="cb-note" id="ciVisKey"></p>
          </div>
          <div id="ciMethWrap" style="display:none">
            <p class="bm-h">Same data, other methods</p>
            <table class="dtable" id="ciMeth"></table>
            <p class="cb-note" id="ciMethNote"></p>
          </div>
          <div id="ciNeedWrap" style="display:none">
            <p class="bm-h">What more data would give you</p>
            <table class="dtable" id="ciNeed"></table>
            <p class="cb-note" id="ciNeedKey"></p>
          </div>
          <p class="bm-h">How it is worked out</p>
          <ol class="ci-steps" id="ciSteps"></ol>
        </div>`;
  const left = `
        <h2>How to use the confidence interval calculator</h2>
        <p>Choose what you want an interval for: an <strong>average</strong> (type the sample mean, standard deviation and sample size, or paste a list of numbers), a <strong>proportion</strong> (the number of yes answers and the sample size) or a <strong>count</strong> (the number you counted). Leave the confidence level empty for 95%, type your own, or tap 90% or 99%.</p>
        <p>The result gives the interval, the margin of error, the critical value used and every step. The picture shows the curve of the estimate with your interval shaded, the same interval at 90, 95 and 99%, and what 4 times as much data would give. Go advanced to compare two groups, give a standard error instead of a standard deviation, set the level from a z-score or p-value, pick a proportion method, or find the sample size for a margin of error you want.</p>

        <h2 id="ciFormulas">The formulas</h2>
        <div class="formula">
          interval = estimate ± critical value × standard error
          <small>MEAN: x̄ ± t × s ÷ √n · PROPORTION: p̂ ± z × √(p̂(1 − p̂) ÷ n)</small>
        </div>
        <p>The critical value comes from the t distribution (n − 1 degrees of freedom) when the standard deviation is from a sample, or the normal z distribution when the population standard deviation is known. Worked out with this calculator: a mean of ${A.m}, s = ${A.s}, n = ${A.n} gives a standard error of ${f4(At.se)}, t = ${f4(At.c)}, a margin of error of ${f4(At.me)} and a 95% interval of ${f2(At.lo)} to ${f2(At.hi)}; with z = ${f4(Az.c)} the margin is ${f4(Az.me)}.</p>
        <h2>z critical values by confidence level</h2>
        ${tblZ}
        <h2>t critical values</h2>
        <p>With a small sample the t value is larger than z, which widens the interval.</p>
        ${tblT}`;
  const right = `
        <h2>Three proportion methods</h2>
        <p>The normal approximation (Wald) is the textbook formula but is too narrow for small samples and proportions near 0% or 100%. Wilson score and the exact Clopper-Pearson interval do better. For ${P1.x} yes out of ${P1.n}:</p>
        ${tblM}
        <p>For a small sample the normal approximation can fail outright:</p>
        ${tblM2}
        <h2>How wide should the interval be?</h2>
        <p>The margin of error shrinks with the square root of the sample size: four times as many people halves it. The “What more data would give you” table shows 2, 4 and 10 times your sample, and Go advanced finds the sample size for a margin you pick: ±3 percentage points at 95% needs ${N2.toLocaleString('en-US')} people in the worst case, ±5 points needs ${N3.toLocaleString('en-US')}.</p>
        <h2>Worked example</h2>
        <p>A sample of ${B.n} measurements has a mean of ${B.m} and a standard deviation of ${B.s}. The standard error is ${f4(Bt.se)}, the 95% critical value is t = ${f4(Bt.c)} (${B.n - 1} degrees of freedom), the margin of error is ${f4(Bt.me)}, and the interval is ${f2(Bt.lo)} to ${f2(Bt.hi)}. At 90% it is ${f2(Bs[0].lo)} to ${f2(Bs[0].hi)}; at 99% it is ${f2(Bs[2].lo)} to ${f2(Bs[2].hi)}.</p>

        <h2>Related tools</h2>
        <p>To test a result against a hypothesis use the <a href="/p-value-calculator/">p-value calculator</a>; for the spread of your data the <a href="/standard-deviation-calculator/">standard deviation calculator</a>; to average a list the <a href="/average-calculator/">average calculator</a>; and for percentages the <a href="/percentage-calculator/">percentage calculator</a>.</p>
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
    <span class="mbar-lab" id="ciMLab">Confidence interval</span>
    <div class="mbar-vals"><b id="ciMVal">—</b></div>
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
<script>CalcThis.initCiCalc();</script>
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
const prev = { slug: 'p-value-calculator', menu: 'P-Value', name: 'P-Value Calculator', llms: 'P-Value Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M3 24c4 0 6-16 13-16s9 16 13 16" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M3 24h26" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M10 24V14M22 24V14" stroke="#37503F" stroke-width="2" stroke-linecap="round"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — confidence interval for a mean, proportion or count at 90, 95 or 99%, with t or z, a live curve and the sample size you need</span></li>\n');
    return h;
  });
}
