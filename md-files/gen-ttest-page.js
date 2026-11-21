const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /t-test-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.ttEngine. Run: node md-files/gen-ttest-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE', 'CI', 'TTEST'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const E = CalcThis.ttEngine, PV = CalcThis.pvalueEngine;
const fx = (x, d) => { const s = x.toFixed(d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s.replace('-', '−'); };
const f2 = (x) => fx(x, 2), f3 = (x) => fx(x, 3), f4 = (x) => fx(x, 4);
const X1 = [78, 82, 86, 85, 73, 82, 90, 88], X2 = [77, 75, 79, 86, 74, 71, 73, 89];
const dA = E.describe(X1), dB = E.describe(X2);
const W = E.run('welch', dA, dB, 0), PO = E.run('pooled', dA, dB, 0);
const wp = E.pvals(W.t, W.df).two, pp = E.pvals(PO.t, PO.df).two, wci = E.ci(W, 0.95), pci = E.ci(PO, 0.95);
const N1 = { m: 20.14458, s: 6.41470, n: 249 }, N2 = { m: 30.48101, s: 6.10771, n: 79 };
const NP = E.run('pooled', N1, N2, 0), nCrit2 = E.crit(0.05, NP.df, 'two'), nCrit1 = E.crit(0.05, NP.df, 'gt');
const BEF = [120, 132, 118, 140, 125, 135, 128, 122], AFT = [115, 128, 119, 131, 120, 130, 126, 117];
const pd = BEF.map((v, i) => v - AFT[i]), dP = E.describe(pd), PD = E.run('paired', dP, null, 0), pdp = E.pvals(PD.t, PD.df).two;
const S1 = [102, 98, 110, 95, 104, 108, 99, 106, 101, 97], dS = E.describe(S1), O1 = E.run('one', dS, null, 100), o1p = E.pvals(O1.t, O1.df).two;
const plan = E.plan({ two: true, diff: W.diff, d0: 0, s1: dA.s, s2: dB.s, tail: 'two', alpha: 0.05 });
const powObs = E.power('two', 0.05, W.df, W.diff / W.se);
const pfmt = (p) => PV.fp(p, null);
const ctRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 60, 120].map((df) => '<tr><td>' + df + '</td>' + [0.10, 0.05, 0.01].map((a) => '<td>' + f3(E.crit(a, df, 'two')) + '</td>').join('') + '</tr>').join('') + '<tr><td>∞ (normal curve)</td>' + [0.10, 0.05, 0.01].map((a) => '<td>' + f3(PV.inv('z', {}, a / 2, 'R')) + '</td>').join('') + '</tr>';
const tblCrit = '<table class="dtable"><thead><tr><th>Degrees of freedom</th><th>α = 0.10</th><th>α = 0.05</th><th>α = 0.01</th></tr></thead><tbody>' + ctRows + '</tbody></table>';
const tblWhich = '<table class="dtable"><thead><tr><th>Your data</th><th>Test</th></tr></thead><tbody>' +
  '<tr><td>One group, compared with a known number (a target, a standard, a claim)</td><td>One-sample t-test</td></tr>' +
  '<tr><td>The same people or things measured twice (before and after, left and right)</td><td>Paired t-test</td></tr>' +
  '<tr><td>Two separate groups, spreads clearly different or unknown</td><td>Welch two-sample t-test</td></tr>' +
  '<tr><td>Two separate groups with the same spread</td><td>Pooled two-sample t-test (Welch gives almost the same answer)</td></tr>' +
  '<tr><td>Three or more groups</td><td>Not a t-test: use analysis of variance</td></tr></tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The one-sample, paired and two-sample t statistics, the pooled formula, the Welch–Satterthwaite degrees of freedom, the threshold form of the null hypothesis (a difference of d₀) and the critical regions for the two-tailed and one-tailed alternatives follow the NIST/SEMATECH e-Handbook of Statistical Methods, section 1.3.5.3 “Two-Sample t-Test for Equal Means”. The interval estimate x̄ ± t × s ÷ √N with N − 1 degrees of freedom follows section 1.3.5.2 “Confidence Limits for the Mean”. Both pages read on 2026-11-22.</li>
          <li>Check: with the handbook’s miles-per-gallon summary (US cars n = ${N1.n}, mean ${N1.m}, standard deviation ${N1.s}; Japanese cars n = ${N2.n}, mean ${N2.m}, standard deviation ${N2.s}) this calculator gives t = ${f4(NP.t)} with ${NP.df} degrees of freedom, and critical values ${f4(nCrit2)} (two-tailed) and ${f4(nCrit1)} (one-tailed), the values printed in the handbook.</li>
          <li>The feature set was compared with the t-test tools of Omnicalculator, GraphPad QuickCalcs, Social Science Statistics and Stats Kingdom, all opened on 2026-11-22. The statements about assumptions (independent values, roughly bell-shaped data) follow the descriptions on those pages. Probabilities come from the t distribution of this site’s p-value calculator. Power uses the noncentral t distribution, computed numerically.</li>
          <li>No rule-of-thumb labels (small, medium, large) are attached to Cohen’s d, because no primary source for them was read.</li>
        </ul>
        <p><small>For information only. Check the assumptions of the test and your own data before drawing conclusions.</small></p>`;

const P = {
  slug: 't-test-calculator', name: 'T-Test Calculator', menu: 'T-Test', body: 'p-bmr p-tt',
  title: 'T-Test Calculator: One-Sample, Two-Sample & Paired',
  desc: 'T-test calculator: paste your numbers or type means, SDs and n. Welch and pooled side by side, p-value, confidence interval, effect size and power.',
  h1: 'T-Test Calculator', eyebrow: 'One sample · two groups · paired · live picture of your data',
  lead: `Paste the numbers of <strong>two groups</strong> (or type their means, standard deviations and sizes) and get the <strong>p-value</strong>, the <strong>confidence interval of the difference</strong> and the effect size, with the <strong>Welch and pooled tests side by side</strong>. For the example below, ${f2(dA.m)} against ${f2(dB.m)} with ${dA.n} values in each group gives <strong>t(${f2(W.df)}) = ${f2(W.t)}, p = ${pfmt(wp)}</strong>: not significant at 0.05. You also see your data drawn as dots, the difference with its interval, and how many more people it would take.`,
  schema: 'Free t-test calculator: one-sample, paired and two-sample (Welch and pooled) t-tests from pasted numbers or from means, standard deviations and sample sizes, with the t-score, degrees of freedom, p-value for two-tailed or one-tailed tests, confidence interval of the difference, Cohen\'s d, power, the number of people needed, a picture of the data and the t curve, steps and a ready-to-copy sentence.',
  llms: 'Free t-test calculator: one-sample, paired, Welch and pooled two-sample t-tests from numbers or summary statistics; p-value, confidence interval, effect size, power and people needed; picture of the data.',
  card: 'Compare two groups, before and after, or one group with a number. Welch and pooled side by side, with a picture of your data.',
  faqs: [
    ['What is a t-test?', 'A t-test checks whether an average differs from a number, or whether two averages differ, by comparing the gap with the amount of random variation expected from the sample sizes. The result is a t-score and a p-value.'],
    ['Which t-test should I use?', 'Use a one-sample t-test to compare one group with a known number, a paired t-test for the same people measured twice, and a two-sample t-test for two separate groups. When unsure about two groups, choose Welch: it does not assume equal variances. This page shows Welch and pooled together.'],
    ['What is the difference between Welch and pooled?', 'The pooled test assumes both groups have the same variance and uses one combined spread, with n₁ + n₂ − 2 degrees of freedom. Welch uses each group’s own variance and the Welch–Satterthwaite degrees of freedom. For the example on this page, Welch gives p = ' + pfmt(wp) + ' and pooled p = ' + pfmt(pp) + '.'],
    ['How do I read the p-value?', 'The p-value is the probability of a result at least as extreme as yours if there were really no difference. If it is below your significance level α (usually 0.05), the result is called statistically significant. A p-value of ' + pfmt(wp) + ' is above 0.05, so the example is not significant.'],
    ['One-tailed or two-tailed?', 'Use two-tailed to test for a difference in either direction. Use one-tailed (higher or lower) only when you decided before looking at the data that only one direction matters. The one-tailed p-value is half the two-tailed one when the difference points the chosen way.'],
    ['What do the degrees of freedom mean?', 'For one sample and paired tests they are n − 1. For the pooled two-sample test n₁ + n₂ − 2. For Welch they are a formula that is usually not a whole number: ' + f2(W.df) + ' in the example.'],
    ['What does the confidence interval tell me?', 'It is a range of differences the data are consistent with. For the example it runs from ' + f2(wci.lo) + ' to ' + f2(wci.hi) + ', which includes 0, matching the non-significant p-value. If an interval does not include the tested value, the result is significant at the matching level.'],
    ['How many people do I need?', 'The “What would it take” table shows how many people per group would give p below α if the means and spreads stayed the same (' + plan.sig + ' per group in the example), and how many are needed for 80% power at the difference you saw (' + plan.pow + ' per group). It is a planning guide, not proof of anything.'],
    ['What are the assumptions of a t-test?', 'The values are independent and the data are roughly bell-shaped, especially with small samples. Check the dots in the picture for outliers; the tables flag values beyond 1.5 × the interquartile range. With very small samples and strong outliers, other tests may fit better.'],
    ['Can I use summary numbers instead of the data?', 'Yes. Choose “Use summary numbers” and type the mean, standard deviation and number of values of each group. In Go advanced you can type the standard error instead of the standard deviation, or just a t-score and degrees of freedom to get the p-value.']
  ],
  pills: [['/p-value-calculator/', 'P-Value Calculator', '<path d="M3 24c4 0 6-16 13-16s9 16 13 16"/><path d="M3 24h26"/>'], ['/confidence-interval-calculator/', 'Confidence Interval Calculator', '<path d="M4 16h24M4 11v10M28 11v10"/>'], ['/z-score-calculator/', 'Z-Score Calculator', '<path d="M3 18c3 0 4-12 9-12s6 12 9 12"/><path d="M12 6v14"/>'], ['/standard-deviation-calculator/', 'Standard Deviation Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>']]
};

const tfld = (id, label, unit, ph, mode, labId) => `<label class="fld" for="${id}"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkSeg = (id, label, opts, def, labId) => `<div class="fld"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}</span><div class="seg tt-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;
const ta = (id, labId, label, ph) => `<div class="fld"><label class="lab" id="${labId}" for="${id}">${label}</label><textarea class="tt-ta" id="${id}" placeholder="${ph}" aria-label="${label}" spellcheck="false"></textarea></div>`;
const three = (a, b, c) => `<div class="tt-three">${a}${b}${c}</div>`;

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
        ${mkSeg('ttTest', 'What do you want to compare?', [['two', 'Two groups'], ['paired', 'Paired'], ['one', 'One group']], 'two')}
        <p class="av-note" id="ttTestNote"></p>
        ${mkSeg('ttEntry', 'How will you enter the data?', [['raw', 'Type the numbers'], ['sum', 'Use summary numbers']], 'raw')}
        <div id="ttRawW">
          ${ta('ttA', 'ttALab', 'Numbers for “Group 1”', 'e.g. 78, 82, 86, 85, 73, 82, 90, 88')}
          ${note('ttANote')}
          <div id="ttBRaw">
          ${ta('ttB', 'ttBLab', 'Numbers for “Group 2”', 'e.g. 77, 75, 79, 86, 74, 71, 73, 89')}
          ${note('ttBNote')}
          </div>
        </div>
        <div id="ttSumW" style="display:none">
          <p class="zs-sech" id="ttSum1H">Group 1</p>
          ${three(tfld('ttM1', 'Mean', '', 'e.g. 83', 'decimal', 'ttM1Lab'), tfld('ttS1', 'Standard deviation', '', 'e.g. 5.5', 'decimal', 'ttS1Lab'), tfld('ttN1', 'Number of values', '', 'e.g. 8', 'numeric', 'ttN1Lab'))}
          ${note('ttSum1Note')}
          <div id="ttSum2">
            <p class="zs-sech" id="ttSum2H">Group 2</p>
            ${three(tfld('ttM2', 'Mean', '', 'e.g. 78'), tfld('ttS2', 'Standard deviation', '', 'e.g. 6.4', 'decimal', 'ttS2Lab'), tfld('ttN2', 'Number of values', '', 'e.g. 8', 'numeric'))}
            ${note('ttSum2Note')}
          </div>
        </div>
        <div id="ttMu0W" style="display:none">
          ${tfld('ttMu0', 'Compare the mean with (μ₀)', '', 'e.g. 100')}
          ${note('ttMuNote')}
        </div>
        ${mkSeg('ttTail', '“Group 1” is…', [['two', 'Different'], ['gt', 'Higher'], ['lt', 'Lower']], 'two', 'ttTailLab')}
        ${note('ttTailNote')}
        ${tfld('ttAlpha', 'Significance level (α)', '· optional', 'e.g. 0.05')}
        <div class="chips" id="ttAlphaChips" role="group" aria-label="Common significance levels"><button type="button" data-v="0.10">0.10</button><button type="button" data-v="0.05">0.05</button><button type="button" data-v="0.01">0.01</button></div>
        ${note('ttAlphaNote')}
        <div class="res-hint" id="ttHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="ttAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="ttHeadW">
          ${mkSeg('ttHead', 'Test shown in the headline', [['welch', 'Welch (recommended)'], ['pooled', 'Pooled (equal variances)']], 'welch')}
          ${note('ttHeadNote')}
          </div>
          <div id="ttSpreadW" style="display:none">
          ${mkSeg('ttSpread', 'The spread you have is the', [['sd', 'Standard deviation'], ['sem', 'Standard error']], 'sd')}
          ${note('ttSpreadNote')}
          </div>
          <div id="ttD0W">
          <p class="zs-sech">Test against a difference other than 0 <span>· optional</span></p>
          ${tfld('ttD0', 'Difference to test against', '', 'e.g. 2')}
          ${note('ttD0Note')}
          </div>
          <p class="zs-sech">Confidence interval <span>· optional</span></p>
          ${tfld('ttConf', 'Confidence level', '%', 'e.g. 95')}
          ${note('ttConfNote')}
          <p class="zs-sech">Group names <span>· optional</span></p>
          <div class="tt-two">${tfld('ttNameA', 'Name of group 1', '', 'e.g. Control', 'text')}${tfld('ttNameB', 'Name of group 2', '', 'e.g. Treatment', 'text')}</div>
          ${note('ttNameNote')}
          <p class="zs-sech">Only have a t-score? <span>· optional</span></p>
          <div class="tt-two">${tfld('ttTin', 't-score', '', 'e.g. 2.1')}${tfld('ttDfIn', 'Degrees of freedom', '', 'e.g. 14')}</div>
          ${note('ttTNote')}
          <p class="zs-sech">Display <span>· optional</span></p>
          ${tfld('ttDec', 'Decimal places', '', 'e.g. 3', 'numeric')}
          ${note('ttDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="ttClear" type="button">Clear fields</button>
          <button class="advbtn" id="ttAdvBtn" type="button">
            <span id="ttAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="ttLab">p-value</div>
          <div class="res-big"><span id="ttBig">—</span></div>
          <div class="res-sub" id="ttSub" data-empty="Type the numbers of your groups to see the p-value, the interval and a picture of your data.">Type the numbers of your groups to see the p-value, the interval and a picture of your data.</div>
        </div>
        <div id="ttBody" style="display:none">
          <p class="res-tip adv-tip" id="ttTip"></p>
          <div id="ttVisWrap" style="display:none">
            <p class="bm-h">Your data and the difference</p>
            <div class="tt-vis" id="ttVis"></div>
            <p class="cb-note" id="ttVisKey"></p>
          </div>
          <div id="ttCurveWrap" style="display:none">
            <p class="bm-h">Where your t-score falls</p>
            <div class="tt-vis" id="ttCurve"></div>
            <p class="cb-note" id="ttCurveKey"></p>
          </div>
          <div id="ttCmpWrap" style="display:none">
            <p class="bm-h">Welch and pooled, side by side</p>
            <div class="tt-tbl"><table class="dtable" id="ttCmp"></table></div>
            <p class="cb-note" id="ttCmpNote"></p>
          </div>
          <div id="ttNumsWrap" style="display:none">
            <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="ttCopyTxt" style="margin-left:8px">Copy result</button></p>
            <div class="tt-tbl"><table class="dtable" id="ttNums"></table></div>
            <div id="ttCopyTxt" style="display:none"></div>
          </div>
          <div id="ttGrpWrap" style="display:none">
            <p class="bm-h">About each group</p>
            <div class="tt-tbl"><table class="dtable" id="ttGrp"></table></div>
            <p class="cb-note" id="ttGrpKey"></p>
          </div>
          <details class="faq" id="ttDevWrap" style="display:none"><summary>Show each value’s difference from its mean</summary>
            <div class="tt-tbl"><table class="dtable" id="ttDev"></table></div>
          </details>
          <div id="ttWhatWrap" style="display:none">
            <p class="bm-h">What would it take?</p>
            <div class="tt-tbl"><table class="dtable" id="ttWhat"></table></div>
            <p class="cb-note" id="ttWhatKey"></p>
          </div>
          <div id="ttWriteWrap" style="display:none">
            <p class="bm-h">Write it up <button class="linkbtn" type="button" data-copy="ttWrite" style="margin-left:8px">Copy sentence</button></p>
            <p class="tt-write" id="ttWrite"></p>
          </div>
          <div id="ttStepsWrap" style="display:none">
            <p class="bm-h">How it is worked out</p>
            <ol class="tt-steps" id="ttSteps"></ol>
          </div>
        </div>`;
  const left = `
        <h2>How to use the t-test calculator</h2>
        <p>Choose what you are comparing: <strong>two groups</strong>, the <strong>same people before and after</strong>, or <strong>one group against a number</strong>. Paste the numbers of each group (a column from Excel works), or switch to summary numbers and type the mean, standard deviation and number of values. The p-value, the confidence interval and a picture of your data appear as you type.</p>
        <p>Pick “Different”, “Higher” or “Lower” for a two-tailed or one-tailed test and leave the significance level empty for 0.05. Go advanced to test against a difference other than 0, change the confidence level, name your groups, type the standard error instead of the standard deviation, or type just a t-score and degrees of freedom.</p>

        <h2 id="ttFormulas">The formulas</h2>
        <div class="formula">
          t = (x̄ − μ₀) ÷ (s ÷ √n)
          <small>PAIRED: THE SAME WITH THE DIFFERENCES · TWO GROUPS (WELCH): t = (x̄₁ − x̄₂ − d₀) ÷ √(s₁² ÷ n₁ + s₂² ÷ n₂)</small>
        </div>
        <p>For the pooled test, replace the square root by sₚ × √(1 ÷ n₁ + 1 ÷ n₂), where sₚ² = ((n₁ − 1)s₁² + (n₂ − 1)s₂²) ÷ (n₁ + n₂ − 2). Worked out with this calculator for ${dA.n} values in each group (means ${f2(dA.m)} and ${f2(dB.m)}, standard deviations ${f2(dA.s)} and ${f2(dB.s)}): Welch t = ${f4(W.t)} with ${f2(W.df)} degrees of freedom and p = ${pfmt(wp)}; pooled t = ${f4(PO.t)} with ${PO.df} degrees of freedom and p = ${pfmt(pp)}. The 95% interval for the difference of ${f2(W.diff)} runs from ${f2(wci.lo)} to ${f2(wci.hi)} (Welch) and from ${f2(pci.lo)} to ${f2(pci.hi)} (pooled).</p>
        <h2 id="ttWhich">Which t-test should I use?</h2>
        ${tblWhich}
        <h2>Paired and one-sample examples</h2>
        <p><strong>Paired:</strong> blood pressure before (${BEF.join(', ')}) and after (${AFT.join(', ')}) for ${BEF.length} people. The differences have a mean of ${f2(dP.m)} and a standard deviation of ${f2(dP.s)}, so t(${PD.df}) = ${f2(PD.t)} and p = ${pfmt(pdp)}: significant at 0.05.</p>
        <p><strong>One sample:</strong> ${S1.length} measurements (${S1.join(', ')}) compared with a target of 100. The mean is ${f2(dS.m)}, t(${O1.df}) = ${f2(O1.t)} and p = ${pfmt(o1p)}: not significant at 0.05.</p>`;
  const right = `
        <h2>Critical t-values</h2>
        <p>A t-score beyond the critical value for your degrees of freedom is significant at that level. Two-tailed values; for a one-tailed test use the column of twice the level (for example the α = 0.10 column for a one-tailed test at 0.05).</p>
        ${tblCrit}
        <h2 id="ttReading">Reading the result</h2>
        <p>The <strong>p-value</strong> is the probability of a difference at least as large as yours if there were really none. Compare it with your significance level α: below it, the result is called significant. The <strong>confidence interval</strong> shows the range of differences the data are consistent with; if it includes 0 (or the value you test against), the result is not significant at the matching level. <strong>Cohen’s d</strong> divides the difference by the spread, so it shows how big the difference is compared with the variation, not just whether it is detectable. A significant result with a tiny d can be unimportant; a non-significant result from a small sample can still hide a real difference, which is what the “What would it take?” table helps you judge.</p>
        <h2>Check against a published example</h2>
        <p>The NIST/SEMATECH handbook compares the fuel economy of ${N1.n} US cars (mean ${N1.m}, standard deviation ${N1.s}) with ${N2.n} Japanese cars (mean ${N2.m}, standard deviation ${N2.s}) using the pooled test. This calculator, given those summary numbers, returns t = ${f4(NP.t)} with ${NP.df} degrees of freedom; the two-tailed critical value is ${f4(nCrit2)} and the one-tailed one ${f4(nCrit1)}, so the means are different at the 0.05 level.</p>
        <h2>How many people do I need?</h2>
        <p>With the example data above (${dA.n} per group), the calculator reports that about ${plan.sig} per group would give p below 0.05 if the means and standard deviations stayed the same, and ${plan.pow} per group would give 80% power to detect the observed difference. The power of the test as run is ${fx(powObs * 100, 1)}%.</p>

        <h2>Related tools</h2>
        <p>To turn any t-score into a p-value or find critical values use the <a href="/p-value-calculator/">p-value calculator</a>; for an interval around one mean the <a href="/confidence-interval-calculator/">confidence interval calculator</a>; to standardise a value the <a href="/z-score-calculator/">z-score calculator</a>; and to find a spread the <a href="/standard-deviation-calculator/">standard deviation calculator</a>.</p>
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
    <span class="mbar-lab" id="ttMLab">p-value</span>
    <div class="mbar-vals"><b id="ttMVal">—</b></div>
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

    <h2 id="ttFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initTtestCalc();</script>
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
const prev = { slug: 'z-score-calculator', menu: 'Z Score', name: 'Z-Score Calculator', llms: 'Z-Score Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M3 24c4 0 6-16 13-16s9 16 13 16" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M3 24h26" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M9 24c3 0 4-10 9-10s6 10 9 10" stroke="#37503F" stroke-width="1.4" fill="none"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — compare two groups, before and after, or one group with a number: p-value, interval, effect size and a picture of your data</span></li>\n');
    return h;
  });
}
