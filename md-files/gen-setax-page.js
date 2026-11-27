const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /self-employment-tax-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials,
   homepage card + hasPart + about list, seo-meta-hand.json). Every number in the text comes from CalcThis.seEngine.
   Run: node md-files/gen-setax-page.js, then node build.js. Yearly upkeep: new IRS figures in SETAX-ENGINE, then re-run. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['PAY-ENGINE', 'PAY-STATES', 'SETAX-ENGINE'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + ':START */'), app.indexOf('/* ' + k + ':END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const E = CalcThis.seEngine;
const m = (x) => (x < 0 ? '−$' : '$') + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
const pc = (x) => (Math.round(x * 1000) / 10) + '%';
const base = { status: 'single', income: 80000 };
const X = E.compute(base), BX = E.business(base, X);
const Q = E.quarterly({}, X, new Date(2026, 0, 5));
const PROFITS = [20000, 40000, 60000, 80000, 100000, 150000, 200000, 300000];
const S = E.table({ status: 'single' }, PROFITS), J = E.table({ status: 'mfj' }, PROFITS);
const J80 = E.compute({ status: 'mfj', income: 80000 });
const W = E.compute({ status: 'single', income: 40000, wages: 160000 });
const NEED = E.needed({ status: 'single' }, 60000), EQ = E.salaryEquivalent(base, X), JOB = E.jobMatch({ status: 'single' }, 100000, 0);
const SEP = E.compute({ status: 'single', income: 80000, retAmt: 10000 });
const SAVE = E.expenseSaving(base, 1000);

const SRC = `<h2>Sources</h2>
        <ul>
          <li>IRS Form 1040-ES (2026): the self-employment tax and deduction worksheet, the 2026 tax rate schedules, standard deduction amounts, the $184,500 Social Security limit, payment due dates, the $1,000 rule and the 90%, 100% and 110% safe-harbor tests (read 2026-11-27).</li>
          <li>IRS page “Self-employment tax (Social Security and Medicare taxes)” and the 2026 Instructions for Schedule SE: the 15.3% rate, the $400 and $108.28 floors and the 0.9% Additional Medicare Tax thresholds (read 2026-11-27).</li>
          <li>IRS Rev. Proc. 2025-32, section .26, for the 2026 business income deduction thresholds; Form 8995-A and its instructions for the phase-in; 26 U.S.C. § 199A(i) for the $400 minimum (read 2026-11-27).</li>
          <li>IRS Form 7206 (2026) for the health insurance limit; Publication 560 for SEP and solo 401(k) limits; IRS “IRA contribution limits”; Schedule 8812 instructions and 26 U.S.C. § 24 for the child tax credit (read 2026-11-27).</li>
          <li>IRS standard mileage rates for 2026 (72.5¢ to June 30, 76¢ from July 1) and the simplified home office method, $5 a square foot up to 300 (read 2026-11-27).</li>
          <li>State tax uses the paycheck withholding formulas of 38 states (sources on each <a href="/paycheck-calculator/">paycheck calculator</a> page) applied to the year’s income. It is an estimate, not a state tax return.</li>
          <li>The feature set was compared with the calculators of Keeper, Everlance, fcalculator, selfemployedcalc, Jackson Hewitt, TaxAct and QuickBooks, opened on 2026-11-27.</li>
        </ul>
        <p><small>An estimate for planning, not tax advice. Not included: the earned income credit, other credits, the deductions for tips, overtime, car loan interest and people 65 or older, capital gains and the alternative minimum tax.</small></p>`;

const P = {
  slug: 'self-employment-tax-calculator', name: 'Self-Employment Tax Calculator', menu: 'Self-Employment Tax', body: 'p-bmr p-cc p-se',
  title: 'Self-Employment Tax Calculator 2026: 1099 Taxes',
  desc: 'Self-employment tax calculator for 2026: 1099 and freelance income, deductions, federal and state tax, quarterly payments and the income you need.',
  h1: 'Self-Employment Tax Calculator', eyebrow: '2026 · 1099 · freelance · quarterly payments',
  lead: `Type what your clients paid you and get your <strong>2026 self-employment tax</strong>, income tax, what you keep and what to pay each quarter. A single person with <strong>${m0(X.income)}</strong> of profit and no other income owes <strong>${m(X.se)}</strong> of self-employment tax and <strong>${m(X.incomeTax)}</strong> of federal income tax.`,
  schema: 'Free self-employment tax calculator for 2026: 1099, freelance and business income, expenses, mileage and home office, W-2 job, health insurance and retirement deductions, child tax credit, state tax estimate, quarterly estimated payments with safe harbor, the income needed for a target take-home pay and the set-aside for each new payment.',
  llms: 'Free 2026 self-employment tax calculator for 1099 and freelance income: Social Security and Medicare, federal and state tax, deductions, quarterly payments, income needed for a take-home target and what to set aside from each payment.',
  card: '1099 and freelance taxes for 2026: what you owe, what to set aside and what to pay each quarter.',
  faqs: [
    ['What is self-employment tax?', 'It is Social Security and Medicare for people who work for themselves: 12.4% for Social Security and 2.9% for Medicare, 15.3% together, on 92.35% of net profit. Income tax comes on top of it.'],
    ['How is self-employment tax calculated?', 'Take your profit, multiply by 92.35%, then apply 15.3%. On ' + m0(X.income) + ' of profit that is ' + m(X.seParts.businessBase) + ' of net earnings and ' + m(X.se) + ' of tax.'],
    ['Do I pay it on small amounts?', 'Self-employment tax applies when net earnings are $400 or more. This is true whether or not a client sends you a form.'],
    ['How much should I set aside from each payment?', 'It depends on your income, filing status and state. For a single person with ' + m0(X.income) + ' of profit and federal tax only, the business adds ' + m(BX.extra) + ' of tax, ' + pc(BX.onIncome) + ' of every payment. The “A payment just arrived” box works it out for one payment at your next-dollar rate.'],
    ['When are 2026 estimated taxes due?', 'April 15, June 15 and September 15, 2026, and January 15, 2027. The January payment is not needed if you file and pay in full by February 1, 2027.'],
    ['How much must I pay to avoid a penalty?', 'Generally the smaller of 90% of your 2026 tax or 100% of your 2025 tax, counting withholding. The 100% becomes 110% if your 2025 adjusted gross income was over $150,000 ($75,000 married filing separately). No payments are needed if you expect to owe under $1,000.'],
    ['What if I also have a W-2 job?', 'Your wages use up the $184,500 Social Security limit first. With $160,000 of wages and $40,000 of profit, only ' + m(W.seParts.ssBase) + ' of self-employment earnings pay the 12.4% part.'],
    ['Do business expenses lower the tax?', 'Yes, both self-employment and income tax. In the ' + m0(X.income) + ' example an extra $1,000 of expense saves about ' + m(SAVE) + '.'],
    ['Does a SEP-IRA or solo 401(k) lower self-employment tax?', 'No. It lowers income tax. Putting ' + m0(10000) + ' into a SEP-IRA in the example cuts federal tax from ' + m(X.fedTotal) + ' to ' + m(SEP.fedTotal) + ', while self-employment tax stays ' + m(SEP.se) + '.'],
    ['Can I deduct half of self-employment tax?', 'Yes. Half of it comes off your income before income tax, ' + m(X.half) + ' in the example. It does not reduce the self-employment tax itself.'],
    ['How much do I need to bill to take home a certain amount?', 'Choose “Income I need”. To keep $60,000 a year with federal tax only, a single person needs about ' + m(NEED.income) + ' of profit.'],
    ['What should I bill to match a salaried job?', 'Type the salary under “Weighing a job offer?”. With federal tax only, a single person needs about ' + m(JOB.income) + ' of billing to match a $100,000 salary before benefits.'],
    ['What if my clients pay me in another currency?', 'Choose the currency at the top of the calculator and type how many US dollars one unit is worth. Your amounts are converted at that rate, the US tax is worked out in dollars, and the quarterly payments are shown in dollars. The page does not look up exchange rates.'],
    ['Which states are included?', 'Thirty-eight states are estimated from their paycheck withholding formulas. For Connecticut, Delaware, the District of Columbia, Idaho, Kansas, Maine, Mississippi, New Mexico, North Dakota, Rhode Island, South Carolina, Vermont and West Virginia you type your effective rate.']
  ],
  pills: [['/paycheck-calculator/', 'Paycheck Calculator', '<path d="M4 6h16v12H4zM4 10h16"/>'], ['/overtime-calculator/', 'Overtime Calculator', '<path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2"/>'], ['/salary-calculator/', 'Salary Calculator', '<path d="M12 3v18M16 7H10a3 3 0 000 6h4a3 3 0 010 6H8"/>'], ['/profit-margin-calculator/', 'Profit Margin Calculator', '<path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7"/>']]
};

const tfld = (id, label, unit, ph, note, mode) => `<div class="fld"><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></div>${note ? `<p class="av-note" id="${note}" style="display:none"></p>` : ''}`;
const note = (id) => `<p class="av-note" id="${id}" style="display:none"></p>`;
const mkSeg = (id, label, opts, def) => `<div class="fld"><span class="lab">${label}</span><div class="seg cc-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, label, opts) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${opts[0][0]}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}"><span class="csel-val">${opts[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o, i) => `<button type="button" class="csel-opt${i ? '' : ' on'}" role="option" aria-selected="${i ? 'false' : 'true'}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
const ta = (hid, inId, list, label, ph, labId) => `<div class="fld"><span class="lab"${labId ? ' id="' + labId + '"' : ''}>${label}</span><div class="st-ta"><div class="inp"><input id="${inId}" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="${list}" aria-label="${label}" placeholder="${ph}"><input id="${hid}" type="hidden" value=""></div><div class="st-ta-list" id="${list}" role="listbox" style="display:none"></div></div></div>`;
const grp = (t) => `<p class="zs-sech">${t}</p>`;
const sec = (id, head, inner) => `          <div id="${id}">
            <p class="bm-h">${head}</p>
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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthBoxes = [0, 2, 4, 6, 8, 10].map((i) => '<div class="cc-two">' + tfld('seMo' + (i + 1), MN[i], '$', 'e.g. 7,500') + tfld('seMo' + (i + 2), MN[i + 1], '$', 'e.g. 7,500') + '</div>').join('\n            ');
  const input = `
        <div class="sl-head"><h2 class="card-h2">Your 2026 income</h2><div class="csel sl-cur" id="seCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div></div>
        <div id="seFxW" style="display:none">
          <div class="fld"><label class="lab" for="seFx"><span id="seFxLab">1 EUR in US dollars</span> <span class="unit">USD</span></label><div class="inp"><input id="seFx" type="text" inputmode="decimal" autocomplete="off" placeholder="type the exchange rate"></div></div>
          ${note('seFxNote')}
        </div>
        ${mkSeg('seMode', 'What do you want to know?', [['tax', 'My tax'], ['need', 'Income I need']], 'tax')}
        ${csel('seStatus', 'Filing status', [['single', 'Single'], ['mfj', 'Married filing jointly'], ['hoh', 'Head of household'], ['mfs', 'Married filing separately']])}
        ${note('seStatusNote')}
        <div id="seIncomeW">
          ${tfld('seIncome', 'What clients paid you in 2026', '$', 'e.g. 92,000', 'seIncomeNote')}
          <p class="se-mlink"><button class="linkbtn" id="seMoBtn" type="button" aria-expanded="false">Add it up month by month</button></p>
          <div id="seMoIn" style="display:none">
            ${monthBoxes}
            ${mkSeg('seMoFill', 'Months left empty', [['zero', 'Count as nothing'], ['avg', 'Use my average']], 'zero')}
            ${note('seMoNote')}
          </div>
        </div>
        <div id="seNeedW" style="display:none">
          ${tfld('seTarget', 'Take-home pay you want', '$', 'e.g. 60,000', 'seTargetNote')}
          ${mkSeg('sePer', 'That amount is', [['year', 'Per year'], ['month', 'Per month']], 'year')}
          ${tfld('seHours', 'Hours you can bill a year', 'optional', 'e.g. 1200', 'seHoursNote')}
        </div>
        ${tfld('seExpenses', 'Business expenses', '$', 'e.g. 12,000', 'seExpNote')}
        ${ta('seState', 'seStateIn', 'seStateList', 'State', 'Type to pick a state')}
        ${note('seStateNote')}
        <div id="seCountyFld" style="display:none">
          ${ta('seCounty', 'seCountyIn', 'seCountyList', 'County', 'Type your county', 'seCountyLab')}
          ${note('seCountyNote')}
        </div>
        <div id="seRateFld" style="display:none">
          ${tfld('seStRate', 'Your state tax rate', '%', 'e.g. 4.5', 'seRateNote')}
        </div>
        <div class="res-hint" id="seHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="seAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${grp('Car and home office')}
          ${tfld('seM1', 'Business miles, January to June', 'optional', 'e.g. 3,000', 'seM1Note')}
          ${tfld('seM2', 'Business miles, July to December', 'optional', 'e.g. 3,000', 'seM2Note')}
          ${tfld('seSqft', 'Home office size', 'sq ft', 'e.g. 150', 'seSqftNote')}
          ${grp('A job and other income')}
          ${tfld('seWages', 'W-2 wages from a job', '$', 'e.g. 40,000', 'seWagesNote')}
          ${tfld('seWithheld', 'Federal tax withheld from that pay', '$', 'e.g. 4,000', 'seWithNote')}
          ${tfld('seFarm', 'Farm profit or loss', '$', 'e.g. 5,000', 'seFarmNote')}
          ${tfld('seChurch', 'Church employee income', '$', 'e.g. 2,000', 'seChurchNote')}
          ${grp('Insurance and retirement')}
          ${tfld('sePrem', 'Health insurance premiums you pay', '$', 'e.g. 4,800', 'sePremNote')}
          ${csel('seAge', 'Your age at the end of 2026', [['u50', 'Under 50'], ['50', '50 to 59'], ['60', '60 to 63'], ['64', '64 or older']])}
          ${note('seAgeNote')}
          ${mkSeg('seRetType', 'Your self-employed retirement plan', [['sep', 'SEP-IRA'], ['solo', 'Solo 401(k)']], 'sep')}
          ${note('seRetTypeNote')}
          ${tfld('seRet', 'Contribution to that plan', '$', 'e.g. 5,000', 'seRetNote')}
          ${tfld('seIra', 'Traditional IRA you can deduct', '$', 'e.g. 3,000', 'seIraNote')}
          ${tfld('seOther', 'Other deductions before adjusted gross income', '$', 'e.g. 1,000', 'seOtherNote')}
          ${grp('Your tax return')}
          ${tfld('seMort', 'Mortgage interest', '$', 'e.g. 9,000', 'seMortNote')}
          ${tfld('seItem', 'Other itemized deductions', '$', 'e.g. 5,000', 'seItemNote')}
          ${tfld('seKids', 'Children under 17', 'optional', 'e.g. 2', 'seKidsNote', 'numeric')}
          ${mkSeg('seSstb', 'Health, law, consulting or similar service business?', [['no', 'No'], ['yes', 'Yes']], 'no')}
          ${note('seSstbNote')}
          ${grp('Estimated payments')}
          ${tfld('sePaid', 'Estimated payments made for 2026', '$', 'e.g. 3,000', 'sePaidNote')}
          ${tfld('seLastTax', 'Total tax on your 2025 return', '$', 'e.g. 9,000', 'seLastTaxNote')}
          ${tfld('seLastAgi', 'Your 2025 adjusted gross income', '$', 'e.g. 70,000', 'seLastAgiNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="seClear" type="button">Clear fields</button>
          <button class="advbtn" id="seAdvBtn" type="button">
            <span id="seAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
        <p class="se-ex"><button class="linkbtn" id="seEx" type="button">See an example</button></p>`;
  const empty = 'Type what your clients paid you to see your self-employment tax.';
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="seLab">Self-employment tax for 2026</div>
          <div class="res-big"><span id="seBig">—</span></div>
          <div class="res-sub" id="seSub">${empty}</div>
        </div>
        <div id="seBody" style="display:none">
          <p class="res-tip adv-tip" id="seTip"></p>
          <div id="seNeedWrap" style="display:none">
            <p class="bm-h">What you need to bill</p>
${tb('seNeed')}
          </div>
${sec('seFlowWrap', 'Where your money goes', '            <div id="seFlow"></div>\n            <p class="cb-note" id="seFlowKey"></p>')}
${sec('seCapWrap', 'The Social Security limit', '            <div id="seCap"></div>\n            <p class="cb-note" id="seCapKey"></p>')}
${sec('seMonWrap', 'Month by month', tb('seMonT', 'seMonKey'))}
${sec('sePayWrap', 'A payment just arrived', `            ${tfld('seP', 'Amount a client just paid you', '$', 'e.g. 2,500')}
            <p class="av-note" id="sePOut"></p>
${tb('sePTbl')}`)}
${sec('seQtrWrap', 'Quarterly estimated payments', tb('seQtr', 'seQtrKey'))}
${sec('seStepWrap', 'Line by line', tb('seSteps', 'seStepKey'))}
${sec('seW2Wrap', 'The same money as a salary', tb('seW2', 'seW2Key'))}
${sec('seJobWrap', 'Weighing a job offer?', `            ${tfld('seJob', 'Salary the job pays', '$', 'e.g. 100,000')}
            ${tfld('seJobBen', 'Yearly value of its benefits', '$', 'e.g. 10,000')}
            ${tfld('seJobHrs', 'Hours you would bill a year', 'optional', 'e.g. 1,500')}
            <p class="av-note" id="seJobOut"></p>
${tb('seJobTbl')}`)}
${sec('seTabWrap', 'Tax by profit', tb('seTab', 'seTabKey'))}
          <div class="cc-tools"><button class="linkbtn" type="button" data-copy="seCopyTxt">Copy result</button></div>
          <div id="seCopyTxt" style="display:none;white-space:pre-line"></div>
          <p class="bm-h">How it is worked out</p>
          <ol class="cc-steps" id="seHow"></ol>
        </div>`;
  const row = (x) => '<tr><td>' + m0(x.profit) + '</td><td>' + m0(x.se) + '</td><td>' + m0(x.fed - x.se) + '</td><td>' + m0(x.fed) + '</td><td>' + pc(x.rate) + '</td></tr>';
  const rateRows = (st) => E.RATES[st].map((r, i, a) => '<tr><td>' + pc(r[2]) + '</td><td>' + m0(r[0]) + (a[i + 1] ? ' to ' + m0(a[i + 1][0]) : ' and up') + '</td></tr>').join('');
  const left = `
        <h2>How to use the self-employment tax calculator</h2>
        <p>Type what your clients paid you and your business expenses. The result updates as you type: self-employment tax, federal income tax, what you keep and the four estimated payments. Pick a state to add its tax. Paid in another currency? Choose it at the top and type its value in US dollars: the tax is worked out in dollars and shown in both. If you know your payments by month, choose <strong>Add it up month by month</strong>: the months fill the yearly total, empty months can use your average, and each month shows what to set aside. To work backwards, choose <strong>Income I need</strong> and type the take-home pay you want.</p>
        <p>Under <strong>Go advanced</strong> add mileage and a home office, a W-2 job, health insurance, retirement contributions, itemized deductions, children, and last year’s tax for the penalty-free amount.</p>

        <h2 id="seFormula">The 2026 self-employment tax formula</h2>
        <div class="formula">
          SE tax = profit × 92.35% × 15.3%
          <small>12.4% Social Security stops at $184,500 of wages and earnings combined · 2.9% Medicare has no limit · extra 0.9% Medicare above $200,000 ($250,000 married filing jointly)</small>
        </div>

        <h2 id="seExample">Worked example: ${m0(X.income)} of profit, single</h2>
        <table class="dtable se-ex-t">
          <thead><tr><th>Step</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>Net earnings: profit × 92.35%</td><td>${m(X.seParts.businessBase)}</td></tr>
            <tr><td>Social Security 12.4%</td><td>${m(X.ss)}</td></tr>
            <tr><td>Medicare 2.9%</td><td>${m(X.med)}</td></tr>
            <tr><td>Self-employment tax</td><td>${m(X.se)}</td></tr>
            <tr><td>Half of it, deducted</td><td>${m(X.half)}</td></tr>
            <tr><td>Adjusted gross income</td><td>${m(X.agi)}</td></tr>
            <tr><td>Standard deduction</td><td>${m0(X.std)}</td></tr>
            <tr><td>Business income deduction</td><td>${m(X.qbid)}</td></tr>
            <tr><td>Taxable income</td><td>${m(X.taxable)}</td></tr>
            <tr><td>Federal income tax</td><td>${m(X.incomeTax)}</td></tr>
            <tr><td>Federal total</td><td>${m(X.fedTotal)}</td></tr>
            <tr><td>Each quarter, to stay fully paid</td><td>${m(Q.full)}</td></tr>
          </tbody>
        </table>
        <p>For a married couple filing jointly with the same profit and no other income, the federal total is ${m(J80.fedTotal)}. A W-2 salary of about ${m(EQ.salary)} would leave a single person the same take-home as this profit, before employer benefits.</p>

        <h2 id="seByProfit">Federal tax on self-employment profit, single</h2>
        <table class="dtable se-ex-t">
          <thead><tr><th>Profit</th><th>SE tax</th><th>Income tax</th><th>Total</th><th>Share</th></tr></thead>
          <tbody>${S.map(row).join('')}</tbody>
        </table>
        <p>Federal tax only, standard deduction, no other income, credits or retirement contributions.</p>

        <h2 id="seByProfitJ">Married filing jointly, one earner</h2>
        <table class="dtable se-ex-t">
          <thead><tr><th>Profit</th><th>SE tax</th><th>Income tax</th><th>Total</th><th>Share</th></tr></thead>
          <tbody>${J.map(row).join('')}</tbody>
        </table>`;
  const right = `
        <h2 id="seDed">Deductions for the self-employed</h2>
        <p><strong>Business expenses</strong> come off before both taxes. Driving counts at 72.5¢ a mile from January to June 2026 and 76¢ from July; a home office can use $5 a square foot for up to 300. <strong>Half of the self-employment tax</strong>, <strong>health insurance premiums</strong> and <strong>retirement contributions</strong> come off income before income tax.</p>
        <p>The <strong>qualified business income deduction</strong> removes up to 20% of business profit from taxable income. It starts to shrink above ${m0(E.QBI_THR.single)} of taxable income (${m0(E.QBI_THR.mfj)} married filing jointly) for a business without employees or property, and from 2026 it is at least $400 when qualified business income is $1,000 or more.</p>

        <h2 id="seRetire">Retirement limits for 2026</h2>
        <p>A SEP-IRA takes up to 20% of profit after half the self-employment tax, to $72,000. A solo 401(k) adds a $24,500 deferral of your own (plus $8,000 from age 50, or $11,250 at 60 to 63). A traditional IRA is limited to $7,500, or $8,600 from age 50, and may not be fully deductible if you also have a retirement plan.</p>

        <h2 id="seRates">2026 tax brackets, single</h2>
        <table class="dtable se-ex-t">
          <thead><tr><th>Rate</th><th>Taxable income</th></tr></thead>
          <tbody>${rateRows('single')}</tbody>
        </table>
        <p>Standard deduction: ${m0(E.STD.single)} single or married filing separately, ${m0(E.STD.mfj)} married filing jointly, ${m0(E.STD.hoh)} head of household.</p>

        <h2 id="seQuarter">Quarterly estimated payments</h2>
        <p>Nobody withholds tax from 1099 income, so you usually pay it in four parts: April 15, June 15, September 15, 2026 and January 15, 2027. If your wages already withhold enough, you may owe nothing extra.</p>

        <h2>Related tools</h2>
        <p>For a job with withholding use the <a href="/paycheck-calculator/">paycheck calculator</a>; for extra hours the <a href="/overtime-calculator/">overtime calculator</a>; to convert hourly pay the <a href="/salary-calculator/">salary calculator</a>; and for pricing your work the <a href="/profit-margin-calculator/">profit margin calculator</a>.</p>
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
    <span class="mbar-lab" id="seMLab">SE tax</span>
    <div class="mbar-vals"><b id="seMVal">—</b></div>
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

    <h2 id="seFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initSeTaxCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log(P.slug, 'written; title', P.title.length, 'desc', P.desc.length);
}
function pill(href, label, pth) { return `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pth}</svg>\n        ${label}\n      </a>`; }
build();

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s2 = fs.readFileSync(fl, 'utf8'); const crlf = s2.includes('\r\n'); s2 = s2.replace(/\r\n/g, '\n'); const o = s2; s2 = fn(s2); if (s2 !== o) { fs.writeFileSync(fl, crlf ? s2.replace(/\n/g, '\r\n') : s2); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
const prev = { slug: 'amortization-calculator', menu: 'Amortization', name: 'Amortization Calculator', llms: 'Amortization Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("(  \\{ file: '" + prev.slug + "/index\\.html',[^\\n]*\\n)"), (mm) => mm + "  { file: '" + P.slug + "/index.html',          slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms.replace(/ /g, '[ ]') + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace(new RegExp('( *<li><a href="' + ps2.replace(/\//g, '\\/') + '">[^<]*</a></li>\\n)'), (mm) => mm + mm.replace(ps2, slug).replace(/>[^<]*<\/a>/, '>' + P.name + '</a>')));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "FinanceApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M5 27h22" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><rect x="6" y="6" width="5" height="21" rx="1" fill="#37503F"/><rect x="13.5" y="12" width="5" height="9" rx="1" fill="#B5761F"/><rect x="21" y="17" width="5" height="10" rx="1" fill="#8F5C13"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^<]*</a><span>[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — 1099 and freelance taxes for 2026, what to set aside and quarterly payments</span></li>\n');
    return h;
  });
}
