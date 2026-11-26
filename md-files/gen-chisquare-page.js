const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /chi-square-calculator/ and registers it under Math & Numbers (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.chiEngine. Run: node md-files/gen-chisquare-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PVALUE', 'CHI'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const C = CalcThis.chiEngine, PV = CalcThis.pvalueEngine;
const f2 = (x) => x.toFixed(2), f4 = (x) => x.toFixed(4);
const tr = (x, d) => { let s = x.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const p = (x) => PV.fp(x, null);
const lv = C.table([[20, 30, 50], [30, 40, 30]]);
const die = C.fit([8, 12, 9, 14, 11, 6], [10, 10, 10, 10, 10, 10], 0);
const pea = C.fit([315, 108, 101, 32], [9, 3, 3, 1].map((w) => 556 * w / 16), 0);
const trt = C.table([[20, 10], [30, 40]]);
const trt2 = C.table([[20, 30], [30, 40]]);
const mc = C.mcnemar(121, 59), mc2 = C.mcnemar(6, 16);
const coin = C.fit([62, 38], [50, 50], 0);
const planLv = C.plan(lv.w, lv.n, lv.df, 0.05);
const planM = C.plan(0.3, 100, 1, 0.05);
const n80 = (w, df) => C.plan(w, 100, df, 0.05).n80;
const crit = (a, df) => C.crit(a, df);
const dfs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30], alphas = [0.1, 0.05, 0.01, 0.001];

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The statistic Σ(O − E)² ÷ E, the degrees of freedom (categories − 1 − estimated parameters, or (rows − 1) × (columns − 1)), the expected counts and the rule of 5 or more in all boxes of a 2×2 table and in 80% of the boxes of larger tables, with none at 0, follow the Wikipedia article “Pearson’s chi-squared test” (read 2026-11-25).</li>
          <li>Yates’s correction of 0.5 follows “Yates’s correction for continuity”; here it never takes off more than the difference itself. Fisher’s two-sided p-value adds every table with the same totals whose probability is no larger than that of yours, as described in “Fisher’s exact test”. The exact test for two categories follows “Binomial test” (read 2026-11-26).</li>
          <li>McNemar’s statistic, the corrected version, the exact and mid-p values and the guide of 25 changes follow “McNemar’s test”. Its first example (101, 121, 59, 33) gives 21.35 there and ${f4(mc.chi)} here; its second (59, 6, 16, 80) gives an exact p of 0.053 and a corrected χ² of 3.68, and this page gives ${tr(mc2.exact, 3)} and ${f2(mc2.chiC)} (read 2026-11-26).</li>
          <li>The standardized difference of a box is the adjusted residual (O − E) ÷ √(E × (1 − row share) × (1 − column share)), with about ±2 unusual and ±3 very unusual, from the CASRAI guide “Standardized Residuals” (read 2026-11-25). For a single list the same idea uses (O − E) ÷ √(E × (1 − expected share)).</li>
          <li>Cramér’s V and Cohen’s w (small 0.1, medium 0.3, large 0.5) follow “Cramér’s V” and “Effect size” (read 2026-11-25). Power uses the noncentral chi-square distribution with noncentrality N × w², as in the pingouin documentation of power_chi2, whose examples (power 0.2687 for w = 0.3, 20 counts, 1 degree of freedom; 121.14 counts for 3 degrees of freedom and 80% power) this calculator reproduces (read 2026-11-26).</li>
          <li>The feature set was compared with the chi-square tools of Omnicalculator, Social Science Statistics, GraphPad QuickCalcs, Statistics by Jim, GigaCalculator, Pearson.com, MiniWebtool and Stats Kingdom, all opened on 2026-11-25.</li>
        </ul>
        <p><small>For information only. Check the assumptions of the method and your own data before drawing conclusions.</small></p>`;

const P = {
  slug: 'chi-square-calculator', name: 'Chi Square Calculator', menu: 'Chi Square', body: 'p-bmr p-cc p-chi',
  title: 'Chi Square Calculator: Independence and Goodness of Fit',
  desc: 'Chi square calculator for two-way tables and goodness of fit: χ², p-value, expected counts, Fisher, Yates, McNemar, effect size and a picture.',
  h1: 'Chi Square Calculator', eyebrow: 'Two-way table · goodness of fit · Fisher, Yates and McNemar',
  lead: `Type your <strong>counts</strong> into the table (or paste them, or paste the raw answers) and get <strong>χ², the p-value</strong>, the expected counts and a picture of <strong>where the difference comes from</strong>. For the example of two groups with three answers (20, 30, 50 and 30, 40, 30) the result is <strong>χ² = ${f4(lv.chi)}, ${lv.df} degrees of freedom, p = ${p(lv.p)}</strong>.`,
  schema: 'Free chi square calculator: test of independence for two-way tables up to 20 by 20 and goodness of fit test for up to 20 categories, with p-value, critical value, expected counts, contributions, standardized differences, Fisher exact test, Yates correction, McNemar test, exact binomial test, effect size, power and a ready-to-copy sentence.',
  llms: 'Free chi square calculator: test of independence and goodness of fit; p-value, expected counts, Fisher, Yates, McNemar, effect size, power and a picture of which counts differ.',
  card: 'Test a two-way table or a list of counts, with p-value, expected counts and a picture of where the difference comes from.',
  faqs: [
    ['What is a chi-square test?', 'It compares counts you observed with the counts you would expect if there were nothing going on. The statistic χ² adds up (observed − expected)² ÷ expected over every box. The larger it is for its degrees of freedom, the smaller the p-value.'],
    ['What is the difference between independence and goodness of fit?', 'Independence takes a two-way table, such as group by answer, and asks whether the two are related. Goodness of fit takes one list of counts, such as the faces of a die, and asks whether they match shares you state in advance.'],
    ['How do I calculate expected counts?', 'In a table, expected = row total × column total ÷ grand total. In the example the first box is ' + lv.rt[0] + ' × ' + lv.ct[0] + ' ÷ ' + lv.n + ' = ' + tr(lv.E[0][0], 2) + '. In a goodness-of-fit test, expected = total × expected share.'],
    ['How many degrees of freedom are there?', 'For a table it is (rows − 1) × (columns − 1), so a 2×3 table has ' + lv.df + '. For goodness of fit it is the number of categories − 1, less one for each parameter you estimated from the same data.'],
    ['What p-value is significant?', 'The usual line is 0.05: a p-value below it counts as significant. You can type another level. The example has p = ' + p(lv.p) + ', below 0.05, so the two rows split differently by more than chance usually produces.'],
    ['Can I use percentages instead of counts?', 'No. The test depends on how many people or items there are: the same percentages from 20 and from 2,000 observations give very different results. Convert percentages back to counts first. Percentages are fine as expected shares in a goodness-of-fit test.'],
    ['What if an expected count is below 5?', 'The chi-square p-value becomes unreliable when expected counts are small. For a 2×2 table use Fisher’s exact test, which this page shows next to it; for two categories use the exact binomial test; for bigger tables, merge groups that belong together or collect more data.'],
    ['When should I use Fisher’s exact test or Yates’s correction?', 'Both apply to 2×2 tables. Fisher’s test is exact and suits small counts. Yates’s correction lowers χ² to allow for counts being whole numbers and is more cautious. For the table 20, 10 and 30, 40 the p-values are ' + p(trt.p) + ' (Pearson), ' + p(trt.yates.p) + ' (Yates) and ' + p(trt.fisher.two) + ' (Fisher, two-sided).'],
    ['When do I need McNemar’s test?', 'Use it when the same people were measured twice with a yes or no answer, such as before and after. Only the people who changed enter the test: χ² = (b − c)² ÷ (b + c). Fill a 2×2 table and choose “Same people twice”.'],
    ['Does a large χ² mean a strong effect?', 'No. χ² grows with the number of counts. Cramér’s V and Cohen’s w describe the size of the effect. In the example w = ' + f4(lv.w) + ', a ' + C.strength(lv.w) + ' effect by Cohen’s guide.'],
    ['How many observations do I need?', 'That depends on the effect you want to be able to detect. For 80% power at α = 0.05 with 1 degree of freedom you need about ' + n80(0.1, 1) + ' counts for a small effect (w = 0.1), ' + n80(0.3, 1) + ' for a medium one (0.3) and ' + n80(0.5, 1) + ' for a large one (0.5).'],
    ['I only have the χ² value. Can I get the p-value?', 'Yes. Choose “χ² value”, type the statistic and the degrees of freedom, and the p-value, the critical value and the curve appear. For example χ² = 3.84 with 1 degree of freedom gives p = ' + p(C.pRight(3.84, 1)) + '. With only the degrees of freedom typed, the critical value is shown.']
  ],
  pills: [['/p-value-calculator/', 'P-Value Calculator', '<path d="M3 24c4 0 6-16 13-16s9 16 13 16"/><path d="M3 24h26"/>'], ['/t-test-calculator/', 'T-Test Calculator', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'], ['/confidence-interval-calculator/', 'Confidence Interval Calculator', '<path d="M3 12h18M6 7v10M18 7v10"/>'], ['/correlation-coefficient-calculator/', 'Correlation Coefficient Calculator', '<path d="M4 28V4M4 28h24"/><path d="M7 25L27 7"/>']]
};

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, pth) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pth}</svg>\n        ${label}\n      </a>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkSeg = (id, label, opts, def) => `<div class="fld"><span class="lab">${label}</span><div class="seg cc-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;
const ta = (id, label, ph) => `<div class="fld"><label class="lab" for="${id}">${label}</label><textarea class="cc-ta" id="${id}" placeholder="${ph}" aria-label="${label}" spellcheck="false"></textarea></div>`;
const chips = (id, label, opts) => `<div class="chips" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>`;
const csel = (id, label) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}"><span class="csel-val">—</span>${chev}</button><div class="csel-panel" role="listbox"><button type="button" class="csel-opt" role="option" data-value="0">—</button></div></div></div>`;
const sec = (id, head, inner, headId) => `          <div id="${id}" style="display:none">
            <p class="bm-h"${headId ? ' id="' + headId + '"' : ''}>${head}</p>
${inner}
          </div>`;
const tb = (id, keyId) => `            <div class="cc-tbl"><table class="dtable" id="${id}"></table></div>\n            <p class="cb-note" id="${keyId}"></p>`;

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
        <h2 class="card-h2">Your counts</h2>
        ${mkSeg('xsMode', 'What do you want to test?', [['table', 'Two-way table'], ['fit', 'Goodness of fit'], ['value', 'χ² value']], 'table')}
        ${note('xsModeNote')}
        <div id="xsTabW">
          ${mkSeg('xsEntry', 'How will you enter the table?', [['grid', 'Type it'], ['paste', 'Paste it'], ['raw', 'Raw answers']], 'grid')}
          <div id="xsGridW">
            <div class="fld xs-gridw"><span class="lab">Counts <span class="unit">names are optional</span></span>
              <div class="xs-grid" id="xsGrid"></div>
              <div class="cc-tools"><button class="linkbtn" id="xsAddRow" type="button">+ Row</button><button class="linkbtn" id="xsDelRow" type="button">− Row</button><button class="linkbtn" id="xsAddCol" type="button">+ Column</button><button class="linkbtn" id="xsDelCol" type="button">− Column</button></div>
            </div>
            ${note('xsGridNote')}
          </div>
          <div id="xsPasteW" style="display:none">
            ${ta('xsPaste', 'Paste the table: one row per line', 'e.g.\n, Low, Medium, High\nGroup A, 20, 30, 50\nGroup B, 30, 40, 30')}
            ${note('xsPasteNote')}
          </div>
          <div id="xsRawW" style="display:none">
            ${ta('xsRaw', 'One line per person: first answer, second answer', 'e.g.\nWoman, Yes\nMan, No\nWoman, Yes')}
            ${note('xsRawNote')}
          </div>
          <div id="xsPairW" style="display:none">
            ${mkSeg('xsPair', 'Who is in the 2×2 table?', [['ind', 'Counted once each'], ['mc', 'Same people twice']], 'ind')}
            ${note('xsPairNote')}
          </div>
        </div>
        <div id="xsFitW" style="display:none">
          ${mkSeg('xsExp', 'What do you expect?', [['eq', 'Equal shares'], ['pct', 'Percent'], ['cnt', 'Counts'], ['ratio', 'Ratio']], 'eq')}
          ${note('xsExpNote')}
          ${mkSeg('xsFEntry', 'How will you enter the counts?', [['rows', 'Type them'], ['paste', 'Paste a list']], 'rows')}
          <div id="xsFitRowsW">
            <div class="fld xs-gridw">
              <div class="xs-grid" id="xsFit"></div>
              <div class="cc-tools"><button class="linkbtn" id="xsAddCat" type="button">+ Category</button><button class="linkbtn" id="xsDelCat" type="button">− Category</button></div>
            </div>
            ${note('xsFitNote')}
          </div>
          <div id="xsFitPW" style="display:none">
            ${ta('xsFitP', 'One category per line', 'e.g.\nRed, 18\nBlue, 30')}
            ${note('xsFitPNote')}
          </div>
        </div>
        <div id="xsValW" style="display:none">
          <div class="cc-two">${tfld('xsChi', 'χ² value', '', 'e.g. 8.43')}${tfld('xsDf', 'Degrees of freedom', '', 'e.g. 2', 'numeric')}</div>
        </div>
        <div id="xsExW">
          <p class="zs-sech" style="margin-top:4px">Try an example</p>
          <div id="xsExT">${chips('xsExTChips', 'Example tables', [['levels', 'Two groups'], ['treat', '2×2 treatment'], ['paired', 'Before and after'], ['small', 'Small counts']])}</div>
          <div id="xsExF" style="display:none">${chips('xsExFChips', 'Example lists', [['die', 'Die rolls'], ['pea', 'Ratio 9:3:3:1'], ['coin', 'Coin toss'], ['market', 'Market shares']])}</div>
        </div>
        ${tfld('xsAlpha', 'Significance level α', 'optional', 'e.g. 0.05')}
        ${chips('xsAlphaChips', 'Common significance levels', [['0.1', '0.10'], ['0.05', '0.05'], ['0.01', '0.01'], ['0.001', '0.001']])}
        ${note('xsAlphaNote')}
        <div class="res-hint" id="xsHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="xsAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="xsHeadW" style="display:none">
            ${mkSeg('xsHead', 'Headline test for a 2×2 table', [['pearson', 'Pearson'], ['yates', 'Yates'], ['fisher', 'Fisher']], 'pearson')}
            ${note('xsHeadNote')}
          </div>
          <div id="xsTNamesW">
            <p class="zs-sech">Variable names <span>· optional</span></p>
            <div class="cc-two">${tfld('xsNameR', 'The rows are…', '', 'e.g. group', 'text')}${tfld('xsNameC', 'The columns are…', '', 'e.g. answer', 'text')}</div>
            ${note('xsNamesNote')}
          </div>
          <div id="xsFAdvW" style="display:none">
            ${tfld('xsNameK', 'What is being counted', 'optional', 'e.g. die faces', 'text')}
            ${note('xsNameKNote')}
            ${tfld('xsParams', 'Parameters estimated from these counts', 'optional', 'e.g. 1', 'numeric')}
            ${note('xsParamsNote')}
          </div>
          <div id="xsWW">
            ${tfld('xsW', 'Effect size w to plan for', 'optional', 'e.g. 0.3')}
            ${chips('xsWChips', 'Common effect sizes', [['0.1', 'Small 0.1'], ['0.3', 'Medium 0.3'], ['0.5', 'Large 0.5']])}
            ${note('xsWNote')}
          </div>
          ${tfld('xsDec', 'Decimal places', 'optional', 'e.g. 3', 'numeric')}
          ${note('xsDecNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="xsClear" type="button">Clear fields</button>
          <button class="advbtn" id="xsAdvBtn" type="button">
            <span id="xsAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="xsLab">Chi-square test of independence</div>
          <div class="res-big"><span id="xsBig">—</span></div>
          <div class="res-sub" id="xsSub" data-empty="Type your counts to see χ², the p-value, the expected counts and a picture of where the difference comes from.">Type your counts to see χ², the p-value, the expected counts and a picture of where the difference comes from.</div>
        </div>
        <div id="xsBody" style="display:none">
          <p class="res-tip adv-tip" id="xsTip"></p>
${sec('xsVisWrap', 'Where the difference comes from', '            <div class="cc-vis" id="xsVis"></div>\n            <p class="cb-note" id="xsVisKey"></p>', 'xsVisH')}
          <div id="xsWarnWrap" style="display:none"><p class="xs-warn" id="xsWarn"></p></div>
${sec('xsTwoWrap', 'Which p-value for a 2×2 table?', tb('xsTwo', 'xsTwoKey'), 'xsTwoH')}
${sec('xsMcWrap', 'McNemar’s test, all versions', tb('xsMc', 'xsMcKey'))}
${sec('xsMergeWrap', 'Merge small groups', `            <div id="xsMAxW">${mkSeg('xsMAx', 'Merge two…', [['r', 'Rows'], ['c', 'Columns']], 'r')}</div>
            <div id="xsMPick"><div class="cc-two">${csel('xsMA', 'This group')}${csel('xsMB', 'With this group')}</div></div>
            <div class="cc-tools"><button class="linkbtn" id="xsMergeBtn" type="button">Merge them</button><button class="linkbtn" id="xsUndoBtn" type="button">Undo last merge</button></div>
            <p class="cb-note" id="xsMergeNote"></p>`)}
${sec('xsCrossWrap', 'Observed and expected counts', tb('xsCross', 'xsCrossKey'))}
          <details class="faq" id="xsCellWrap" style="display:none" open><summary>Cell by cell</summary>
${tb('xsCells', 'xsCellKey')}
          </details>
${sec('xsEffWrap', 'How big is the effect?', tb('xsEff', 'xsEffKey'))}
${sec('xsPowWrap', 'What would it take?', tb('xsPow', 'xsPowKey'))}
${sec('xsCurveWrap', 'The chi-square curve', '            <div class="cc-vis" id="xsCurve"></div>\n            <p class="cb-note" id="xsCurveKey"></p>')}
${sec('xsCheckWrap', 'What is being tested', '            <ul class="cc-steps" id="xsCheck"></ul>')}
          <div id="xsWriteWrap" style="display:none">
            <p class="bm-h">Write it up <button class="linkbtn" type="button" data-copy="xsWrite" style="margin-left:8px">Copy sentence</button></p>
            <div class="chips" id="xsCiteChips" role="group" aria-label="Sentence style"><button type="button" data-v="apa" class="on">APA</button><button type="button" data-v="chicago">Chicago</button><button type="button" data-v="plain">Plain English</button></div>
            <p class="cc-write" id="xsWrite"></p>
          </div>
          <div id="xsCopyWrap" style="display:none">
            <div class="cc-tools"><button class="linkbtn" type="button" data-copy="xsCopyTxt">Copy result</button><button class="linkbtn" type="button" data-copy="xsCsvTxt">Copy table as CSV</button></div>
            <div id="xsCopyTxt" style="display:none"></div>
            <div id="xsCsvTxt" style="display:none"></div>
          </div>
${sec('xsStepsWrap', 'How it is worked out', '            <ol class="cc-steps" id="xsSteps"></ol>')}
        </div>`;
  const critRows = dfs.map((d) => `<tr><td>${d}</td>${alphas.map((a) => '<td>' + crit(a, d).toFixed(3) + '</td>').join('')}</tr>`).join('');
  const left = `
        <h2>How to use the chi square calculator</h2>
        <p>Pick <strong>Two-way table</strong> to ask whether two things are related, or <strong>Goodness of fit</strong> to ask whether one list of counts matches what you expect. Type a count in each box (add rows and columns as needed), paste a table from a spreadsheet, or paste one line of raw answers per person and the table builds itself. The result updates as you type.</p>
        <p>Under <strong>Go advanced</strong> you can name the variables, choose the headline test for a 2×2 table, allow for parameters estimated from the data, plan for an effect size and set the decimal places.</p>

        <h2 id="xsFormulas">The chi square formula</h2>
        <div class="formula">
          χ² = Σ (O − E)² ÷ E
          <small>O = observed count · E = expected count · TABLE: E = row total × column total ÷ grand total, df = (rows − 1) × (columns − 1) · LIST: E = total × expected share, df = categories − 1</small>
        </div>

        <h2 id="xsExample">Worked example: two groups, three answers</h2>
        <table class="dtable xs-ex">
          <thead><tr><th>Box</th><th>Observed</th><th>Expected</th><th>(O − E)² ÷ E</th></tr></thead>
          <tbody>${['A low', 'A medium', 'A high', 'B low', 'B medium', 'B high'].map((n, k) => { const i = Math.floor(k / 3), j = k % 3; return '<tr><td>' + n + '</td><td>' + lv.O[i][j] + '</td><td>' + tr(lv.E[i][j], 2) + '</td><td>' + f4(lv.K[i][j]) + '</td></tr>'; }).join('')}</tbody>
        </table>
        <p>The contributions add up to χ² = ${f4(lv.chi)} with ${lv.df} degrees of freedom. The p-value is ${p(lv.p)} and the critical value at 0.05 is ${f4(crit(0.05, 2))}. Cramér’s V is ${f4(lv.V)}. The two outer columns carry almost all of the difference; the middle one adds ${f4(lv.K[0][1] + lv.K[1][1])}.</p>

        <h2 id="xsFit2">Goodness of fit examples</h2>
        <p>A die rolled 60 times shows 8, 12, 9, 14, 11 and 6. Each face is expected ${die.E[0]} times, so χ² = ${f4(die.chi)} with ${die.df} degrees of freedom and p = ${p(die.p)}: nothing unusual for a fair die.</p>
        <p>Counts of 315, 108, 101 and 32 tested against a 9:3:3:1 ratio give χ² = ${f4(pea.chi)} with ${pea.df} degrees of freedom and p = ${p(pea.p)}, a very close fit. A coin showing 62 heads in 100 tosses gives χ² = ${f4(coin.chi)} and p = ${p(coin.p)}; the exact binomial test gives ${p(coin.binom.two)}.</p>

        <h2 id="xsCritical">Chi-square critical values</h2>
        <p>A statistic above the value in the table is significant at that level. For other degrees of freedom or levels, choose “χ² value” and type only the degrees of freedom.</p>
        <table class="dtable xs-ex">
          <thead><tr><th>df</th><th>0.10</th><th>0.05</th><th>0.01</th><th>0.001</th></tr></thead>
          <tbody>${critRows}</tbody>
        </table>`;
  const right = `
        <h2 id="xsReading">Where the difference comes from</h2>
        <p>One χ² number does not say which counts are unusual. The picture on this page does: each row of the table becomes a bar split into its columns, with dashed lines showing where the pieces would end if nothing differed. Amber pieces hold more counts than expected and blue pieces fewer, with stronger colour further from expected. The cell table gives each box its contribution and its standardized difference; beyond ±2 is unusual.</p>

        <h2 id="xsSmall">Small counts: Fisher, Yates and merging</h2>
        <p>The chi-square p-value is an approximation. A common rule asks for expected counts of at least 5 in every box of a 2×2 table, and in at least 80% of the boxes of a bigger one with none below 1. For the 2×2 table 20, 10 and 30, 40 the three p-values are ${p(trt.p)} (Pearson), ${p(trt.yates.p)} (Yates) and ${p(trt.fisher.two)} (Fisher, two-sided). For 20, 30 and 30, 40 they are ${p(trt2.p)}, ${p(trt2.yates.p)} and ${p(trt2.fisher.two)}.</p>
        <p>In a bigger table you can merge two rows, columns or categories on the page and undo it. Merge only groups that mean something together, and choose them before looking at which choice gives the p-value you like.</p>

        <h2 id="xsMcNemar">The same people twice: McNemar</h2>
        <p>If 314 patients are checked before and after a treatment and 101 are positive both times, 121 go from positive to negative, 59 from negative to positive and 33 are negative both times, only the ${mc.b + mc.c} who changed are tested: χ² = (121 − 59)² ÷ 180 = ${f4(mc.chi)}, p = ${p(mc.p)}. With fewer than 25 changes the exact or mid-p value is the better choice.</p>

        <h2 id="xsPower">Effect size and sample size</h2>
        <p>Cohen’s w = √(χ² ÷ N) measures the size of a difference independently of the number of counts. In the worked example w = ${f4(lv.w)}; if the true shares were exactly those, a new study of ${lv.n} counts would reach p below 0.05 ${tr(planLv.power * 100, 1)}% of the time and ${planLv.n80} counts would give 80% power. With 100 counts and 1 degree of freedom, a medium effect (w = 0.3) has ${tr(planM.power * 100, 1)}% power.</p>
        <table class="dtable xs-ex">
          <thead><tr><th>df</th><th>w = 0.1</th><th>w = 0.3</th><th>w = 0.5</th></tr></thead>
          <tbody>${[1, 2, 3, 4, 6].map((d) => '<tr><td>' + d + '</td><td>' + n80(0.1, d) + '</td><td>' + n80(0.3, d) + '</td><td>' + n80(0.5, d) + '</td></tr>').join('')}</tbody>
        </table>
        <p>Counts needed for 80% power at α = 0.05.</p>

        <h2>Related tools</h2>
        <p>To turn any statistic into a probability use the <a href="/p-value-calculator/">p-value calculator</a>; to compare two averages the <a href="/t-test-calculator/">t-test calculator</a>; for the uncertainty of a proportion the <a href="/confidence-interval-calculator/">confidence interval calculator</a>; and for two number variables the <a href="/correlation-coefficient-calculator/">correlation coefficient calculator</a>.</p>
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
    <span class="mbar-lab" id="xsMLab">Chi-square</span>
    <div class="mbar-vals"><b id="xsMVal">—</b></div>
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

    <h2 id="xsFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initChiCalc();</script>
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
const prev = { slug: 'linear-regression-calculator', menu: 'Linear Regression', name: 'Linear Regression Calculator', llms: 'Linear Regression Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><rect x="4" y="5" width="24" height="22" rx="2" stroke="#37503F" stroke-width="2"/><path d="M4 16h24M16 5v22" stroke="#37503F" stroke-width="2"/><rect x="6.5" y="7.5" width="7" height="6" fill="#8F5C13"/><rect x="18.5" y="18.5" width="7" height="6" fill="#8F5C13"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — a two-way table or a list of counts, with the p-value, expected counts and a picture of where the difference comes from</span></li>\n');
    return h;
  });
}
