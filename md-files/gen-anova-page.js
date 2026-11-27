const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /anova-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.anovaEngine. Run: node md-files/gen-anova-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE', 'ANOVA'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const A = CalcThis.anovaEngine, PV = CalcThis.pvalueEngine;
const f4 = (x) => { let s = x.toFixed(4); return s.replace(/0+$/, '').replace(/\.$/, ''); };
const f2 = (x) => x.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
const p = (x) => PV.fp(x, null);
const NAMES = ['Method A', 'Method B', 'Method C'];
const G = [[23, 25, 28, 30, 27], [31, 33, 35, 29, 34], [22, 24, 21, 26, 23]];
const S = G.map(A.describe), C = A.classic(S), W = A.welch(S), K = A.kruskal(G), L = A.levene(G);
const resid = [].concat(...G.map((g, i) => g.map((v) => v - S[i].mean))), SW = A.shapiro(resid);
const T = A.pairs('tukey', S, 0.05, 0.95, C, K);
const crit = A.fCrit(0.05, C.dfb, C.dfw);
const q312 = A.qCrit(0.05, 3, 12);
const plan = A.plan(S.map((s) => s.mean), C.msw, 0.05);
const n80 = (f, k) => A.n80(f, k, 0.05);
const df1s = [1, 2, 3, 4, 5, 6], df2s = [5, 8, 10, 12, 15, 20, 30, 40, 60, 120];

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The Tukey intervals and the studentized range follow the NIST/SEMATECH e-Handbook, section 7.4.7.1, and the distribution function in the Wikipedia article “Studentized range distribution”, computed here by numerical integration (read 2026-11-27). The handbook’s example value, q = 4.65 for 5 means and 10 degrees of freedom, is reproduced.</li>
          <li>Welch’s ANOVA (weights n ÷ variance, adjusted grand mean and small-sample correction) follows the pingouin welch_anova reference code; Games-Howell follows the PMCMRplus documentation of gamesHowellTest (read 2026-11-27).</li>
          <li>The Kruskal-Wallis H with the tie correction follows the Wikipedia article “Kruskal–Wallis test”; Dunn’s comparisons follow the scikit-posthocs code and the PMCMRplus documentation, with the Bonferroni adjustment Dunn proposed (read 2026-11-27).</li>
          <li>Levene’s test around the group medians follows the NIST/SEMATECH e-Handbook, section 1.3.5.10. The Shapiro-Wilk test is algorithm AS R94 (Royston 1995) as distributed with SciPy 1.11 (read 2026-11-27).</li>
          <li>The guide of at least 15 values per group for 2 to 9 groups and 20 for 10 to 12 before relying on ANOVA with data that do not look normal is from Minitab’s “Data considerations for One-Way ANOVA”; this page uses 20 above 12 groups too (read 2026-11-27). Choosing the test from checks on the same data is a rule of thumb, not a law.</li>
          <li>Eta squared and omega squared follow the Wikipedia article “Effect size”; Cohen’s f of 0.10, 0.25 and 0.40 for small, medium and large is from the CASRAI guide “Effect size: eta squared”. Power uses the noncentral F distribution with noncentrality f² × N, as in the Wikipedia article “Noncentral F-distribution” (read 2026-11-27).</li>
          <li>The feature set was compared with the ANOVA tools of Social Science Statistics, Stats Kingdom, Omnicalculator, Statistics by Jim, MiniWebtool, Pearson.com, GoodCalculators, StatPages and Daniel Soper, all opened on 2026-11-27.</li>
        </ul>
        <p><small>For information only. Check the assumptions of the method and your own data before drawing conclusions.</small></p>`;

const P = {
  slug: 'anova-calculator', name: 'ANOVA Calculator', menu: 'ANOVA', body: 'p-bmr p-cc p-an',
  title: 'ANOVA Calculator: One-Way ANOVA with Tukey Test',
  desc: 'ANOVA calculator for one-way ANOVA: F, p-value, ANOVA table, Tukey and Games-Howell pairs, Welch, Kruskal-Wallis, checks and a picture of your groups.',
  h1: 'ANOVA Calculator', eyebrow: 'One-way ANOVA · Welch · Kruskal-Wallis · post hoc tests',
  lead: `Type or paste the <strong>values of each group</strong> and get <strong>F, the p-value</strong>, the ANOVA table and a picture of <strong>which groups differ</strong>. For the example of three teaching methods with five scores each the result is <strong>F = ${f4(C.F)} with ${C.dfb} and ${C.dfw} degrees of freedom, p = ${p(C.p)}</strong>.`,
  schema: 'Free ANOVA calculator: one-way ANOVA from raw values or summary numbers for up to 20 groups, with ANOVA table, F, p-value, F critical value, Welch ANOVA, Kruskal-Wallis test, Tukey, Games-Howell, Bonferroni and Dunn comparisons, grouping letters, Levene and Shapiro-Wilk checks, effect sizes, power, leave-one-group-out and a ready-to-copy sentence.',
  llms: 'Free ANOVA calculator: one-way ANOVA, Welch and Kruskal-Wallis with Tukey, Games-Howell and Dunn comparisons, assumption checks, effect size, power and a picture of which groups differ.',
  card: 'Compare the averages of several groups, see which ones differ and whether the test you chose changes the answer.',
  faqs: [
    ['What is ANOVA?', 'ANOVA (analysis of variance) tests whether the averages of several groups differ by more than chance would produce. It compares the spread between the group averages with the spread of the values inside the groups. Their ratio is the F statistic.'],
    ['When should I use ANOVA instead of a t-test?', 'Use ANOVA when you compare three or more groups. Running a t-test on every pair raises the chance of a false alarm. With two groups the classic ANOVA and the equal-variance t-test give the same p-value.'],
    ['How do I read the F value and p-value?', 'A larger F means the group averages are further apart compared with the noise inside the groups. A p-value below your significance level, usually 0.05, says at least one average differs. In the example F = ' + f4(C.F) + ' and p = ' + p(C.p) + '.'],
    ['Which groups are different?', 'ANOVA alone does not say. A post hoc test compares each pair while keeping the overall false alarm rate in check. In the example Tukey gives p = ' + p(T[0].p) + ' for A and B, ' + p(T[1].p) + ' for A and C and ' + p(T[2].p) + ' for B and C, so B stands apart from the other two.'],
    ['What do the letters on the picture mean?', 'Groups that share a letter are not shown to differ. Groups with no letter in common are significantly different. In the example Method B has the letter a, and Methods A and C share the letter b.'],
    ['What are the assumptions of one-way ANOVA?', 'Each value comes from a separate subject, the values in every group are roughly normal, and the groups have similar spread. The page checks the last two with Shapiro-Wilk and Levene. Independence has to come from how you collected the data.'],
    ['What if the spreads are unequal?', 'Use Welch’s ANOVA, which does not assume equal variances, followed by Games-Howell comparisons. The page recommends it when Levene’s test finds a difference in spread.'],
    ['What if my data are not normal?', 'With small groups that clearly depart from normality, the Kruskal-Wallis test works on ranks. In larger groups, at least 15 values each for up to 9 groups, ANOVA copes well with moderate departures.'],
    ['Can I run ANOVA with only means and standard deviations?', 'Yes. Choose Summary and type each group’s size, average and standard deviation or standard error. The classic and Welch tests and the pair comparisons work; the normality, spread and rank tests need the raw values.'],
    ['What is eta squared?', 'The share of all the variation that lies between the groups: between-groups sum of squares divided by the total. In the example it is ' + f4(C.eta2) + '. Cohen’s f turns it into √(η² ÷ (1 − η²)), here ' + f4(C.f) + '.'],
    ['How many values do I need per group?', 'It depends on the effect you want to detect. With three groups and α = 0.05, 80% power needs about ' + n80(0.1, 3) + ' values per group for a small effect (f = 0.1), ' + n80(0.25, 3) + ' for a medium one (0.25) and ' + n80(0.4, 3) + ' for a large one (0.4).'],
    ['I only have F and the degrees of freedom. Can I get the p-value?', 'Yes. Choose F value and type the two degrees of freedom and F. For F = 4.5 with 2 and 12 degrees of freedom p = ' + p(A.fRight(4.5, 2, 12)) + '. Leave F empty to get the critical value, ' + f4(crit) + ' at 0.05.'],
    ['Does this calculator do two-way ANOVA?', 'No. This page handles one factor: groups that differ in one way. Designs with two factors, or the same subjects measured repeatedly, need a different analysis.']
  ],
  pills: [['/t-test-calculator/', 'T-Test Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'], ['/p-value-calculator/', 'P-Value Calculator', '<path d="M3 24c4 0 6-16 13-16s9 16 13 16"/><path d="M3 24h26"/>'], ['/chi-square-calculator/', 'Chi Square Calculator', '<path d="M4 4h16v16H4zM4 12h16M12 4v16"/>'], ['/standard-deviation-calculator/', 'Standard Deviation Calculator', '<path d="M3 12h18M6 7v10M18 7v10"/>']]
};

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, pth) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pth}</svg>\n        ${label}\n      </a>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkSeg = (id, label, opts, def) => `<div class="fld"><span class="lab">${label}</span><div class="seg cc-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;
const ta = (id, label, ph) => `<div class="fld"><label class="lab" for="${id}">${label}</label><textarea class="cc-ta" id="${id}" placeholder="${ph}" aria-label="${label}" rows="7" spellcheck="false"></textarea></div>`;
const chips = (id, label, opts) => `<div class="chips" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>`;
const csel = (id, label, opts) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${opts[0][0]}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}"><span class="csel-val">${opts[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt" role="option" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
const sec = (id, head, inner, headId) => `          <div id="${id}" style="display:none">
            <p class="bm-h"${headId ? ' id="' + headId + '"' : ''}>${head}</p>
${inner}
          </div>`;
const tb = (id, keyId) => `            <div class="cc-tbl"><table class="dtable" id="${id}"></table></div>${keyId ? `\n            <p class="cb-note" id="${keyId}"></p>` : ''}`;

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
        <h2 class="card-h2">Your groups</h2>
        ${mkSeg('anMode', 'What do you have?', [['raw', 'Raw values'], ['sum', 'Summary'], ['f', 'F value']], 'raw')}
        ${note('anModeNote')}
        <div id="anRawW">
          ${mkSeg('anEntry', 'How will you enter the values?', [['boxes', 'Boxes'], ['cols', 'Columns'], ['stack', 'Stacked']], 'boxes')}
          <div id="anBoxesW">
            <div id="anGroups"></div>
            <div class="cc-tools"><button class="linkbtn" id="anAddG" type="button">+ Add group</button><button class="linkbtn" id="anDelG" type="button">− Remove last group</button></div>
          </div>
          <div id="anColsW" style="display:none">
            ${ta('anCols', 'Paste a table: one column per group', 'e.g.\nA, B, C\n23, 31, 22\n25, 33, 24\n28, 35, 21')}
            ${note('anColsNote')}
          </div>
          <div id="anStackW" style="display:none">
            ${ta('anStack', 'One line per value: value, group', 'e.g.\n23, A\n31, B\n22, C\n25, A')}
            ${note('anStackNote')}
          </div>
        </div>
        <div id="anSumW" style="display:none">
          ${mkSeg('anSpread', 'The spread you have is the', [['sd', 'Standard deviation'], ['sem', 'Standard error']], 'sd')}
          <div class="an-sumw">
            <div class="an-sum" id="anSum"></div>
            <div class="cc-tools"><button class="linkbtn" id="anAddS" type="button">+ Add group</button><button class="linkbtn" id="anDelS" type="button">− Remove last group</button></div>
          </div>
        </div>
        <div id="anFW" style="display:none">
          <div class="cc-two">${tfld('anDf1', 'df between groups', '', 'e.g. 2', 'numeric')}${tfld('anDf2', 'df within groups', '', 'e.g. 12')}</div>
          ${tfld('anFv', 'F value', 'optional', 'e.g. 4.5')}
        </div>
        <div id="anExW">
          <p class="zs-sech" style="margin-top:6px">Try an example</p>
          <div class="chips" id="anExChips" role="group" aria-label="Example data"><button type="button" data-v="methods">Three methods</button><button type="button" data-v="feed">Four feeds</button><button type="button" data-v="spread">Uneven spread</button><button type="button" data-v="skew" id="anExSkewW">Skewed, small</button></div>
        </div>
        ${tfld('anAlpha', 'Significance level α', 'optional', 'e.g. 0.05')}
        ${chips('anAlphaChips', 'Common significance levels', [['0.1', '0.10'], ['0.05', '0.05'], ['0.01', '0.01'], ['0.001', '0.001']])}
        ${note('anAlphaNote')}
        <div class="res-hint" id="anHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="anAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="anMethodW">
            ${mkSeg('anMethod', 'Which test gives the headline?', [['auto', 'Auto'], ['classic', 'Classic'], ['welch', 'Welch'], ['kw', 'Kruskal']], 'auto')}
            ${note('anMethodNote')}
          </div>
          <div id="anPostW">
            ${csel('anPost', 'Pair comparisons (post hoc)', [['auto', 'Match the test'], ['tukey', 'Tukey'], ['games', 'Games-Howell'], ['bonf', 'Bonferroni'], ['dunn', 'Dunn'], ['none', 'None']])}
            ${note('anPostNote')}
          </div>
          <div id="anOutW">
            ${mkSeg('anOut', 'Outliers', [['keep', 'Keep them'], ['drop', 'Leave them out']], 'keep')}
            ${note('anOutNote')}
          </div>
          <div id="anGivenW" style="display:none">
            <p class="zs-sech">Only have the within mean square? <span>· optional</span></p>
            <div class="cc-two">${tfld('anMsw', 'Within mean square', '', 'e.g. 5.6')}${tfld('anDfw', 'Within df', '', 'e.g. 12')}</div>
            ${note('anGivenNote')}
          </div>
          <div id="anConfW">
            ${tfld('anConf', 'Confidence level for intervals', 'optional, %', 'e.g. 95')}
            ${note('anConfNote')}
          </div>
          <div id="anEffW">
            ${mkSeg('anEffType', 'Expected effect size is given as', [['f', 'Cohen’s f'], ['f2', 'f²'], ['eta', 'η²']], 'f')}
            ${tfld('anEff', 'Expected effect size to plan for', 'optional', 'e.g. 0.25')}
            ${chips('anEffChips', 'Common effect sizes', [['0.1', 'Small 0.10'], ['0.25', 'Medium 0.25'], ['0.4', 'Large 0.40']])}
            ${note('anEffNote')}
          </div>
          ${tfld('anDec', 'Decimal places', 'optional', 'e.g. 3', 'numeric')}
          ${note('anDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="anClear" type="button">Clear fields</button>
          <button class="advbtn" id="anAdvBtn" type="button">
            <span id="anAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const empty = 'Type the values of at least two groups to see F, the p-value, which groups differ and a picture of your data.';
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="anLab">One-way ANOVA</div>
          <div class="res-big"><span id="anBig">—</span></div>
          <div class="res-sub" id="anSub" data-empty="${empty}" data-emptyf="Type both degrees of freedom to see the critical F, and your F to see its p-value.">${empty}</div>
        </div>
        <div id="anBody" style="display:none">
          <p class="res-tip adv-tip" id="anTip"></p>
          <p class="av-note" id="anWhy"></p>
${sec('anVisWrap', 'Which groups differ', '            <div class="cc-vis" id="anVis"></div>\n            <p class="cb-note" id="anVisKey"></p>', 'anVisH')}
${sec('anPairsWrap', 'Pair by pair', `            <div class="cc-vis" id="anDiff"></div>
            <p class="cb-note" id="anDiffKey"></p>
${tb('anPairs', 'anPairsKey')}
            <details class="faq"><summary>Standard errors and test statistics</summary>
${tb('anFull')}
            </details>
            <details class="faq" id="anMatrixW"><summary>Difference matrix</summary>
${tb('anMatrix')}
            </details>`, 'anPairsH')}
${sec('anTestsWrap', 'The tests side by side', tb('anTests', 'anTestsKey'))}
${sec('anTableWrap', 'ANOVA table', tb('anTable', 'anTableKey'))}
${sec('anGroupsWrap', 'Group by group', `${tb('anSumT', 'anSumKey')}
            <details class="faq"><summary>Totals, variances, quartiles and ranges</summary>
${tb('anSumF')}
${tb('anSumR')}
            </details>`)}
${sec('anLooWrap', 'Which group drives it?', tb('anLoo', 'anLooKey'))}
${sec('anPowWrap', 'What would it take?', tb('anPow', 'anPowKey'))}
${sec('anEffWrap', 'How big is the effect?', tb('anEffT', 'anEffKey'))}
${sec('anCheckWrap', 'Assumption checks', tb('anChk', 'anChkKey'))}
${sec('anCurveWrap', 'The F curve', '            <div class="cc-vis" id="anCurve"></div>\n            <p class="cb-note" id="anCurveKey"></p>', 'anCurveH')}
${sec('anHypWrap', 'What is being tested', '            <ul class="cc-steps" id="anHyp"></ul>')}
          <div id="anWriteWrap" style="display:none">
            <p class="bm-h">Write it up <button class="linkbtn" type="button" data-copy="anWrite" style="margin-left:8px">Copy sentence</button></p>
            <div class="chips" id="anCiteChips" role="group" aria-label="Sentence style"><button type="button" data-v="apa" class="on">APA</button><button type="button" data-v="plain">Plain English</button></div>
            <p class="cc-write" id="anWrite"></p>
          </div>
          <div id="anCopyWrap" style="display:none">
            <div class="cc-tools"><button class="linkbtn" type="button" data-copy="anCopyTxt">Copy result</button><button class="linkbtn" type="button" data-copy="anCsvTxt">Copy tables as CSV</button></div>
            <div id="anCopyTxt" style="display:none"></div>
            <div id="anCsvTxt" style="display:none"></div>
          </div>
${sec('anStepsWrap', 'How it is worked out', '            <ol class="cc-steps" id="anSteps"></ol>')}
        </div>`;
  const critRows = df2s.map((d) => `<tr><td>${d}</td>${df1s.map((a) => '<td>' + A.fCrit(0.05, a, d).toFixed(2) + '</td>').join('')}</tr>`).join('');
  const left = `
        <h2>How to use the ANOVA calculator</h2>
        <p>Put each group’s values in its own box, separated by commas, spaces or new lines, or paste a table from a spreadsheet: one column per group, or two columns holding the value and the group name. The result updates as you type. With only sizes, averages and standard deviations, choose <strong>Summary</strong>.</p>
        <p>The page picks the test from your data and says why. Under <strong>Go advanced</strong> you can choose the test and the pair comparisons yourself, leave outliers out, set the confidence level, plan for an expected effect and set the decimal places.</p>

        <h2 id="anFormulas">The one-way ANOVA formula</h2>
        <div class="formula">
          F = MS between ÷ MS within
          <small>MS between = Σ n × (group mean − grand mean)² ÷ (k − 1) · MS within = Σ (value − its group mean)² ÷ (N − k) · k = number of groups · N = number of values</small>
        </div>

        <h2 id="anExample">Worked example: three teaching methods</h2>
        <table class="dtable an-ex">
          <thead><tr><th>Group</th><th>Scores</th><th>Average</th><th>SD</th></tr></thead>
          <tbody>${G.map((g, i) => '<tr><td>' + NAMES[i] + '</td><td>' + g.join(', ') + '</td><td>' + f2(S[i].mean) + '</td><td>' + f2(S[i].sd) + '</td></tr>').join('')}</tbody>
        </table>
        <table class="dtable an-ex">
          <thead><tr><th>Source</th><th>Sum of squares</th><th>df</th><th>Mean square</th><th>F</th></tr></thead>
          <tbody><tr><td>Between groups</td><td>${f4(C.ssb)}</td><td>${C.dfb}</td><td>${f4(C.msb)}</td><td>${f4(C.F)}</td></tr><tr><td>Within groups</td><td>${f4(C.ssw)}</td><td>${C.dfw}</td><td>${f4(C.msw)}</td><td></td></tr><tr><td>Total</td><td>${f4(C.sst)}</td><td>${C.dfb + C.dfw}</td><td></td><td></td></tr></tbody>
        </table>
        <p>The grand mean is ${f4(C.grand)}. F = ${f4(C.F)} is above the critical value ${f4(crit)}, and the p-value is ${p(C.p)}: at least one method gives a different average. Eta squared is ${f4(C.eta2)}, omega squared ${f4(C.omega2)} and Cohen’s f ${f4(C.f)}.</p>

        <h2 id="anPairsEx">Which methods differ: Tukey</h2>
        <table class="dtable an-ex">
          <thead><tr><th>Pair</th><th>Difference</th><th>95% interval</th><th>p</th></tr></thead>
          <tbody>${T.map((q) => '<tr><td>' + 'ABC'[q.i] + ' vs ' + 'ABC'[q.j] + '</td><td>' + f2(q.diff) + '</td><td>' + f2(q.diff - q.half) + ' to ' + f2(q.diff + q.half) + '</td><td>' + p(q.p) + '</td></tr>').join('')}</tbody>
        </table>
        <p>With three groups and ${C.dfw} degrees of freedom the studentized range value is ${f4(q312)}, so two of these averages must differ by at least ${f2(T[0].need)} to count. A and C differ by ${f2(Math.abs(T[1].diff))}, less than that.</p>

        <h2 id="anCritical">F critical values at 0.05</h2>
        <p>An F above the value is significant at 0.05. Columns are the between-groups degrees of freedom, rows the within-groups ones. For other values choose “F value” and leave F empty.</p>
        <table class="dtable an-ex">
          <thead><tr><th>df</th>${df1s.map((d) => '<th>' + d + '</th>').join('')}</tr></thead>
          <tbody>${critRows}</tbody>
        </table>`;
  const right = `
        <h2 id="anWhich">Classic, Welch or Kruskal-Wallis?</h2>
        <p>The classic ANOVA assumes similar spread in every group and roughly normal values. Welch’s version drops the equal-spread assumption. Kruskal-Wallis replaces the values with their ranks. For the teaching example the three give F = ${f4(C.F)} (p = ${p(C.p)}), F = ${f4(W.F)} with ${W.df1} and ${f2(W.df2)} degrees of freedom (p = ${p(W.p)}) and H = ${f4(K.H)} (p = ${p(K.p)}). Levene’s test gives p = ${p(L.p)} and Shapiro-Wilk p = ${p(SW.p)}, so the classic test is recommended.</p>

        <h2 id="anPost2">Post hoc tests</h2>
        <p><strong>Tukey</strong> compares every pair with the pooled spread and suits the classic ANOVA. <strong>Games-Howell</strong> uses each pair’s own spread and goes with Welch. <strong>Dunn</strong> compares average ranks after Kruskal-Wallis. <strong>Bonferroni</strong> multiplies each t-test p-value by the number of pairs and is the most cautious and simplest of them.</p>

        <h2 id="anLetters">Reading the picture</h2>
        <p>Each group sits on the same scale: every value as a dot, a box around the middle half of the values with a line at the median, the average as a tick and its interval as a bar. Letters summarise the comparisons: two groups with a letter in common are not shown to differ. Pick a pair in the table to see its difference and interval against zero. The page also reruns the test without each group in turn, so you can see whether one group carries the result.</p>

        <h2 id="anPower">Effect size and sample size</h2>
        <p>Cohen’s f measures how far apart the group averages are compared with the spread inside them. In the teaching example it is very large, so ${plan.n80} values per group would already give 80% power at those averages. Effects seen in small studies tend to shrink, so plan with the smallest effect that matters.</p>
        <table class="dtable an-ex">
          <thead><tr><th>Groups</th><th>f = 0.10</th><th>f = 0.25</th><th>f = 0.40</th></tr></thead>
          <tbody>${[2, 3, 4, 5, 6].map((k) => '<tr><td>' + k + '</td><td>' + n80(0.1, k) + '</td><td>' + n80(0.25, k) + '</td><td>' + n80(0.4, k) + '</td></tr>').join('')}</tbody>
        </table>
        <p>Values per group needed for 80% power at α = 0.05.</p>

        <h2>Related tools</h2>
        <p>For two groups use the <a href="/t-test-calculator/">t-test calculator</a>; to turn another statistic into a probability the <a href="/p-value-calculator/">p-value calculator</a>; for counts in categories the <a href="/chi-square-calculator/">chi square calculator</a>; and for the spread of one list the <a href="/standard-deviation-calculator/">standard deviation calculator</a>.</p>
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
    <span class="mbar-lab" id="anMLab">ANOVA</span>
    <div class="mbar-vals"><b id="anMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${P.pills.map((q) => pill(q[0], q[1], q[2])).join('\n')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>${left}
      </div>

      <div>${right}
      </div>
    </div>

    <h2 id="anFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initAnovaCalc();</script>
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
const prev = { slug: 'chi-square-calculator', menu: 'Chi Square', name: 'Chi Square Calculator', llms: 'Chi Square Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M5 27h22" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M8 13v9M16 6v9M24 16v8" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="17.5" r="3.2" fill="#8F5C13"/><circle cx="16" cy="10.5" r="3.2" fill="#8F5C13"/><circle cx="24" cy="20" r="3.2" fill="#8F5C13"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — compare several groups, see which differ and whether the choice of test changes the answer</span></li>\n');
    return h;
  });
}
