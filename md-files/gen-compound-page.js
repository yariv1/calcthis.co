const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /compound-interest-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.icEngine. Run: node md-files/gen-compound-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['COMPOUND'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const E = CalcThis.icEngine;
const fx = (x, d) => { const s = x.toFixed(d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s.replace('-', '−'); };
const money = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct4 = (x) => fx(Math.round(x * 1e4) / 1e4, 4).replace(/0+$/, '').replace(/\.$/, '') + '%';
const base = (o) => Object.assign({ P: 0, D: 0, rate: 0.05, tax: 0, comp: 'monthly', dep: 'monthly', begin: false, inc: 0, months: 120 }, o);
const A = E.calc(base({ P: 10000 }));
const Acomp = ['annual', 'semi', 'quarterly', 'monthly', 'weekly', 'daily', 'cont'].map((c) => ({ c, bal: E.calc(base({ P: 10000, comp: c })).bal }));
const B = E.calc(base({ P: 10000, D: 200, rate: 0.06, months: 240 }));
const Bn = E.calc(base({ P: 10000, D: 0, rate: 0.06, months: 240 }));
const dN = E.solveD(base({ rate: 0.05, months: 240 }), 100000, 'bal');
const dCheck = E.calc(base({ rate: 0.05, months: 240, D: dN }));
const yM = E.solveMonths(base({ P: 50000, D: 1000, rate: 0.07 }), 1000000, 'bal');
const pN = E.solveP(base({ rate: 0.05, months: 120 }), 50000, 'bal');
const pCheck = E.calc(base({ P: pN, rate: 0.05, months: 120 }));
const dI = E.solveD(base({ rate: 0.05, months: 120 }), 10000, 'int');
const dICheck = E.calc(base({ D: dI, rate: 0.05, months: 120 }));
const yCheck = E.calc(base({ P: 50000, D: 1000, rate: 0.07, months: yM }));
const rR = E.solveRate(base({ P: 10000, months: 120 }), 20000, 'bal');
const S1 = E.calc(base({ P: 1000, rate: 0.10, comp: 'annual', months: 24 }));
const tax = E.calc(base({ P: 10000, rate: 0.05, tax: 0.2 }));
const inf = A.bal / Math.pow(1.025, 10);
const yearsTxt = (mo) => { const y = Math.floor(mo / 12), m = mo % 12, a = []; if (y) a.push(y + (y === 1 ? ' year' : ' years')); if (m) a.push(m + (m === 1 ? ' month' : ' months')); return a.join(' '); };
const compName = { annual: 'Annually', semi: 'Semiannually', quarterly: 'Quarterly', monthly: 'Monthly', weekly: 'Weekly', daily: 'Daily', cont: 'Continuously' };
const tblComp = '<div class="ic-tbl"><table class="dtable"><thead><tr><th>Compounded</th><th>Balance after 10 years</th><th>More than yearly</th></tr></thead><tbody>' + Acomp.map((r, i) => '<tr><td>' + compName[r.c] + '</td><td>' + money(r.bal) + '</td><td>' + (i ? money(r.bal - Acomp[0].bal) : '—') + '</td></tr>').join('') + '</tbody></table></div>';
const tblR72 = '<div class="ic-tbl"><table class="dtable"><thead><tr><th>Yearly rate</th><th>Exact doubling time</th><th>Rule of 72</th></tr></thead><tbody>' + [2, 4, 6, 8, 10, 12].map((r) => '<tr><td>' + r + '%</td><td>' + fx(E.doubling(r / 100, 'annual'), 2) + ' years</td><td>' + fx(72 / r, 2) + ' years</td></tr>').join('') + '</tbody></table></div>';
const tblEx = '<div class="ic-tbl"><table class="dtable"><thead><tr><th>Plus $200 a month</th><th>10 years</th><th>20 years</th><th>30 years</th></tr></thead><tbody>' + (() => { const r = [10, 20, 30].map((y) => E.calc(base({ P: 10000, D: 200, rate: 0.06, months: y * 12 }))); const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US'); return '<tr><td>You put in</td>' + r.map((q) => '<td>' + m0(q.put) + '</td>').join('') + '</tr><tr><td>Interest</td>' + r.map((q) => '<td>' + m0(q.int) + '</td>').join('') + '</tr><tr><td>Balance</td>' + r.map((q) => '<td>' + m0(q.bal) + '</td>').join('') + '</tr>'; })() + '</tbody></table></div>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The formulas A = P(1 + r/n)^(nt), continuous compounding P × e^(rt), the future value of regular deposits and the rule of 72 (attributed to Luca Pacioli, 1494) are given in the Wikipedia article “Compound interest”, read on 2026-11-13.</li>
          <li>The feature set was compared with the compound interest calculators of calculator.net (interest calculator), Omnicalculator, Investor.gov (SEC), CalculatorSoup and Inch Calculator, all opened on 2026-11-13. Bankrate could not be opened (human-verification wall) and NerdWallet's calculator could not be read, so neither was compared.</li>
          <li>Model used here: interest compounds at the effective rate for the chosen frequency, deposits are made at the end (or start) of each period, tax is taken from the interest as it is earned, inflation is a constant yearly rate, and withdrawals are monthly. Real returns change from year to year; every result is an illustration based on the numbers you type, not a prediction or advice.</li>
        </ul>
        <p><small>For information only. Not investment, tax or financial advice. Rates of return are not guaranteed.</small></p>`;

const P = {
  slug: 'compound-interest-calculator', name: 'Compound Interest Calculator', menu: 'Compound Interest', body: 'p-bmr p-ic',
  title: 'Compound Interest Calculator: Growth, Deposits & Goals',
  desc: 'Compound interest calculator: see how savings grow with deposits, solve the deposit, time or rate for a goal, and compare compounding, in any currency.',
  h1: 'Compound Interest Calculator', eyebrow: 'Growth · regular deposits · goal solver · any currency',
  lead: `Type a <strong>starting amount, a monthly deposit, the interest rate and the time</strong> and see what your money grows to, with a chart that splits it into what you put in and the interest on top. <strong>${money(10000)}</strong> at <strong>5%</strong> compounded monthly grows to <strong>${money(A.bal)}</strong> in <strong>10 years</strong>. Or pick what to find instead: the <strong>monthly deposit</strong>, the <strong>time</strong> or the <strong>rate</strong> you need to reach an amount you want.`,
  schema: 'Free compound interest calculator: the final balance of a starting amount with regular deposits at any compounding frequency, the deposit, time or rate needed to reach a goal, a layered growth chart with the interest on top and the same money without compounding, every compounding frequency side by side, tax on interest, inflation, a lower and higher rate, yearly increase of deposits, withdrawals, and a yearly schedule, in any currency.',
  llms: 'Free compound interest calculator in any currency: growth with deposits, solve the deposit, time or rate you need for a goal, layered growth chart, compounding frequencies compared, tax, inflation, withdrawals and a yearly schedule.',
  card: 'Compound interest with regular deposits in any currency. Solve the deposit, time or rate you need for a goal, and see growth on a layered chart.',
  faqs: [
    ['How do I calculate compound interest?', 'Multiply the amount by (1 + rate ÷ n) raised to n × years, where n is how many times a year the interest is added: A = P × (1 + r ÷ n)^(n × t). ' + money(10000) + ' at 5% compounded monthly for 10 years is ' + money(10000) + ' × (1 + 0.05 ÷ 12)^120 = ' + money(A.bal) + '. Regular deposits are added the same way and grow too, which the calculator does for you.'],
    ['What is the difference between simple and compound interest?', 'Simple interest is paid only on the original amount; compound interest is also paid on the interest already earned. ' + money(1000) + ' at 10% for 2 years gives ' + money(S1.simple) + ' with simple interest and ' + money(S1.bal) + ' compounded yearly. The chart shows the same money without compounding as a dashed line.'],
    ['How much will I have if I save a set amount every month?', 'Type the starting amount, the monthly deposit, the rate and the years. ' + money(10000) + ' plus ' + money(200) + ' a month at 6% compounded monthly becomes ' + money(B.bal) + ' after 20 years: you put in ' + money(B.put) + ' and the interest adds ' + money(B.int) + '.'],
    ['How much do I need to save each month to reach a goal?', 'Choose “Deposit needed” under What do you want to find, type the amount you want, the rate and the years. To reach ' + money(100000) + ' in 20 years at 5% compounded monthly from nothing you need ' + money(dN) + ' a month: ' + money(dCheck.put) + ' put in and ' + money(dCheck.int) + ' of interest.'],
    ['How long will it take to reach a goal?', 'Choose “Time needed”. Starting with ' + money(50000) + ' and adding ' + money(1000) + ' a month at 7% compounded monthly, you pass ' + money(1000000) + ' after ' + yearsTxt(yM) + '.'],
    ['How much do I need to start with to reach a goal?', 'Choose “Starting amount needed”, type the amount you want, the rate and the years. To have ' + money(50000) + ' in 10 years at 5% compounded monthly, with no deposits, you need ' + money(pN) + ' today; the interest makes up the other ' + money(pCheck.int > 0 ? 50000 - pN : 0) + '.'],
    ['How much do I need to save to earn a set amount of interest?', 'Open Go advanced and set “The amount I want is” to the interest earned. To earn ' + money(10000) + ' of interest in 10 years at 5% compounded monthly you would save ' + money(dI) + ' a month: ' + money(dICheck.put) + ' put in and ' + money(dICheck.int) + ' of interest.'],
    ['What rate do I need to reach a goal?', 'Choose “Rate needed”. To turn ' + money(10000) + ' into ' + money(20000) + ' in 10 years with monthly compounding you need about ' + pct4(rR * 100) + ' a year.'],
    ['Does compounding more often make a big difference?', 'It helps a little: ' + money(10000) + ' at 5% for 10 years gives ' + money(Acomp[0].bal) + ' compounded yearly, ' + money(Acomp[3].bal) + ' monthly and ' + money(Acomp[5].bal) + ' daily. The table under the result compares all frequencies for your own numbers.'],
    ['How long does it take to double my money?', 'The rule of 72 divides 72 by the yearly rate: at 6% about 12 years. The exact figure at 6% compounded yearly is ' + fx(E.doubling(0.06, 'annual'), 2) + ' years. The result table shows both for your rate.'],
    ['How do taxes and inflation change the result?', 'In Go advanced, type the tax on interest and the inflation rate. Tax is taken from the interest as it is earned, so 5% with a 20% tax grows like 4%: ' + money(10000) + ' becomes ' + money(tax.bal) + ' instead of ' + money(A.bal) + ' in 10 years. Inflation of 2.5% means ' + money(A.bal) + ' will buy what ' + money(inf) + ' buys today.'],
    ['Can I see how long my money lasts when I take it out?', 'Yes. Go advanced and type a monthly withdrawal. After the saving years the calculator takes that amount out every month and shows how long the money pays in full, or that it never runs out when the interest covers the withdrawals.'],
    ['Does the calculator work in my currency?', 'Choose your currency at the top right of the calculator: the amounts show in it with the symbol on the usual side. Nothing is converted, only the display changes.']
  ],
  pills: [['/loan-calculator/', 'Loan Calculator', '<path d="M4 8h24M4 16h24M4 24h14"/>'], ['/mortgage-calculator/', 'Mortgage Calculator', '<path d="M4 16L16 5l12 11M8 14v13h16V14"/>'], ['/percentage-change-calculator/', 'Percentage Change Calculator', '<path d="M5 22l7-7 5 5 10-12"/>'], ['/salary-calculator/', 'Salary Calculator', '<rect x="4" y="9" width="24" height="14" rx="2"/><circle cx="16" cy="16" r="3"/>']]
};

const tfld = (id, label, unit, ph, mode, labId) => `<label class="fld" for="${id}"><span class="lab">${labId ? '<span id="' + labId + '">' + label + '</span>' : label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkCs = (id, label, opts, defKey) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${defKey}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => o[0] === defKey)[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${o[0] === defKey ? ' on' : ''}" role="option" aria-selected="${o[0] === defKey}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
const mkSeg = (id, label, opts, def) => `<div class="fld"><span class="lab">${label}</span><div class="seg ic-seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" data-v="${o[0]}"${o[0] === def ? ' class="on"' : ''}>${o[1]}</button>`).join('')}</div></div>`;
const curSel = `<div class="csel sl-cur" id="icCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;

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

  const input = `
        <div class="sl-head"><h2 class="card-h2">Your savings</h2>${curSel}</div>
        ${mkCs('icSolve', 'What do you want to find?', [['balance', 'Final balance'], ['deposit', 'Deposit needed'], ['start', 'Starting amount needed'], ['years', 'Time needed'], ['rate', 'Rate needed']], 'balance')}
        <div class="ic-two" id="ic2a"><div id="icPW">${tfld('icP', 'Starting amount', '$', 'e.g. 5,000')}</div><div id="icDW">${tfld('icD', 'Monthly deposit', '$', 'e.g. 200', 'decimal', 'icDLab')}</div></div>
        ${note('icPNote')}
        ${note('icDNote')}
        <div class="ic-two" id="ic2b"><div id="icRW">${tfld('icR', 'Interest rate', '%', 'e.g. 5')}</div><div id="icYW">${tfld('icY', 'Time', '', 'e.g. 10 or 18 months', 'text', 'icYLab')}</div></div>
        ${note('icRNote')}
        ${note('icYNote')}
        ${mkCs('icComp', 'Interest is added', [['annual', 'Annually'], ['semi', 'Semiannually'], ['quarterly', 'Quarterly'], ['monthly', 'Monthly'], ['weekly', 'Weekly'], ['daily', 'Daily'], ['cont', 'Continuously']], 'monthly')}
        ${note('icCompNote')}
        ${tfld('icG', 'Goal · optional', '$', 'e.g. 100,000', 'decimal', 'icGLab')}
        ${note('icGNote')}
        <div class="res-hint" id="icHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="icAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="ic-sech">What your goal means <span>· optional</span></p>
          ${mkCs('icGoalKind', 'The amount I want is', [['bal', 'The final balance'], ['int', 'The interest earned']], 'bal')}
          ${note('icGoalKindNote')}
          <p class="ic-sech">How you deposit <span>· optional</span></p>
          ${mkCs('icDep', 'Deposit', [['weekly', 'Every week'], ['biweekly', 'Every 2 weeks'], ['monthly', 'Every month'], ['quarterly', 'Every quarter'], ['yearly', 'Every year']], 'monthly')}
          ${note('icDepNote')}
          ${mkSeg('icTiming', 'Each deposit is made', [['end', 'End of period'], ['begin', 'Start of period']], 'end')}
          ${note('icTimingNote')}
          ${tfld('icInc', 'Deposit grows each year by', '%', 'e.g. 3')}
          ${note('icIncNote')}
          <p class="ic-sech">Tax and prices <span>· optional</span></p>
          ${tfld('icTax', 'Tax on the interest', '%', 'e.g. 20')}
          ${note('icTaxNote')}
          ${tfld('icInf', 'Inflation a year', '%', 'e.g. 2.5')}
          ${note('icInfNote')}
          <p class="ic-sech">Lower and higher rate <span>· optional</span></p>
          ${tfld('icVar', 'Rate range, plus and minus', 'percentage points', 'e.g. 1')}
          ${note('icVarNote')}
          <p class="ic-sech">Taking money out later <span>· optional</span></p>
          ${tfld('icW', 'Withdrawal a month after saving', '$', 'e.g. 1,500')}
          ${note('icWNote')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="icClear" type="button">Clear fields</button>
          <button class="advbtn" id="icAdvBtn" type="button">
            <span id="icAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="icLab">Final balance</div>
          <div class="res-big"><span id="icBig">—</span></div>
          <div class="res-sub" id="icSub" data-empty="Type the interest rate, the time and a starting amount or a deposit to see the result.">Type the interest rate, the time and a starting amount or a deposit to see the result.</div>
        </div>
        <div id="icBody" style="display:none">
          <p class="res-tip adv-tip" id="icTip"></p>
          <div id="icVisWrap" style="display:none">
            <p class="bm-h">How your money grows</p>
            <div class="ic-vis" id="icVis"></div>
            <p class="cb-note" id="icVisKey"></p>
          </div>
          <div id="icNumsWrap">
            <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="icCopyTxt" style="margin-left:8px">Copy result</button></p>
            <table class="dtable" id="icNums"></table>
            <div id="icCopyTxt" style="display:none"></div>
          </div>
          <div id="icScWrap" style="display:none">
            <p class="bm-h">A lower and a higher rate</p>
            <table class="dtable" id="icSc"></table>
          </div>
          <div id="icCmpWrap" style="display:none">
            <p class="bm-h">Same numbers, other compounding</p>
            <table class="dtable" id="icCmp"></table>
          </div>
          <div id="icWdWrap" style="display:none">
            <p class="bm-h">Taking money out</p>
            <table class="dtable" id="icWd"></table>
          </div>
          <div id="icSchWrap" style="display:none">
            <p class="bm-h">Year by year</p>
            <div class="ic-tbl"><table class="dtable" id="icSch"></table></div>
            <p class="cb-note" id="icSchKey"></p>
          </div>
          <div id="icStepsWrap" style="display:none">
            <p class="bm-h">How it is worked out</p>
            <ol class="ic-steps" id="icSteps"></ol>
          </div>
        </div>`;
  const left = `
        <h2>How to use the compound interest calculator</h2>
        <p>Type your <strong>starting amount</strong>, a regular <strong>deposit</strong>, the yearly <strong>interest rate</strong> and the <strong>time</strong> (years, months, or both like 5y 6m) and choose how often the interest is added. The result shows the balance, how much you put in and how much the interest adds, with a chart that stacks them and a dashed line for the same money without compounding.</p>
        <p>Under <strong>What do you want to find?</strong> choose <em>Deposit needed</em>, <em>Starting amount needed</em>, <em>Time needed</em> or <em>Rate needed</em>, type the amount you want (or the interest you want to earn), and the hidden box is solved for you. Go advanced for deposits every week or year, deposits at the start of the period, a deposit that grows with your pay, tax on the interest, inflation, a lower and a higher rate, and money taken out later.</p>
        <h2 id="icFormulas">The formula</h2>
        <div class="formula">
          A = P × (1 + r ÷ n)^(n × t)
          <small>CONTINUOUS: A = P × e^(r × t) · EFFECTIVE YEARLY RATE: (1 + r ÷ n)^n − 1</small>
        </div>
        <p>P is the amount you start with, r the yearly rate as a decimal, n the number of times a year interest is added and t the years. ${money(10000)} at 5% compounded monthly for 10 years: ${money(10000)} × (1 + 0.05 ÷ 12)^120 = ${money(A.bal)}, which is ${money(A.int)} of interest. Regular deposits grow the same way, each for the time it stays invested.</p>
        <h2>Does compounding more often matter?</h2>
        <p>A little. The same ${money(10000)} at 5% for 10 years, by how often the interest is added:</p>
        ${tblComp}
        <h2>Simple interest versus compound interest</h2>
        <p>Simple interest is paid only on the original amount. ${money(1000)} at 10% for 2 years earns ${money(S1.simple - 1000)} in interest with simple interest and ${money(S1.int)} when compounded yearly: the second year's interest is paid on the first year's interest too. The longer the time, the bigger the gap, which is why the chart draws the money without compounding as a dashed line.</p>`;
  const right = `
        <h2>What regular deposits add</h2>
        <p>Starting with ${money(10000)} and adding ${money(200)} a month at 6% compounded monthly:</p>
        ${tblEx}
        <p>After 20 years you have put in ${money(B.put)} and the interest adds ${money(B.int)}. The ${money(10000)} alone, with no deposits, would have grown to ${money(Bn.bal)}.</p>
        <h2>Reaching a goal</h2>
        <p>To reach ${money(100000)} in 20 years at 5% compounded monthly, starting from nothing, you need ${money(dN)} a month (${money(dCheck.put)} put in, ${money(dCheck.int)} interest). Starting with ${money(50000)} and adding ${money(1000)} a month at 7%, you pass ${money(1000000)} after ${yearsTxt(yM)}. To turn ${money(10000)} into ${money(20000)} in 10 years you need about ${pct4(rR * 100)} a year. Choose what to find at the top of the calculator and type the goal.</p>
        <h2>The rule of 72</h2>
        <p>Dividing 72 by the yearly rate estimates the years it takes to double your money. The rule is attributed to Luca Pacioli (1494). Against the exact answer for yearly compounding:</p>
        ${tblR72}
        <h2>Tax and inflation</h2>
        <p>If the interest is taxed as it is earned, only part of it grows. ${money(10000)} at 5% for 10 years becomes ${money(A.bal)} with no tax and ${money(tax.bal)} with a 20% tax on the interest. Inflation shrinks what the money buys: with prices rising 2.5% a year, ${money(A.bal)} in 10 years buys what ${money(inf)} buys today.</p>
        <h2>Related tools</h2>
        <p>To see what a loan costs use the <a href="/loan-calculator/">loan calculator</a>; for a home loan the <a href="/mortgage-calculator/">mortgage calculator</a>; for growth between two numbers the <a href="/percentage-change-calculator/">percentage change calculator</a>; and for what you earn the <a href="/salary-calculator/">salary calculator</a>.</p>
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
    <span class="mbar-lab" id="icMLab">Final balance</span>
    <div class="mbar-vals"><b id="icMVal">—</b></div>
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
<script>CalcThis.initCompoundCalc();</script>
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
const prev = { slug: 'unit-price-calculator', menu: 'Unit Price', name: 'Unit Price Calculator', llms: 'Unit Price Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("(  \\{ file: '" + prev.slug + "/index\\.html',[^\\n]*\\n)"), (mm) => mm + "  { file: '" + P.slug + "/index.html',          slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "FinanceApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M4 26c6 0 8-4 12-9s7-8 12-9" fill="none" stroke="#8F5C13" stroke-width="2" stroke-linecap="round"/><path d="M4 26h24" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M10 26v-5M16 26v-9M22 26v-14" stroke="#37503F" stroke-width="2" stroke-linecap="round"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — how savings grow with regular deposits, and the deposit, time or rate you need to reach a goal, in any currency</span></li>\n');
    return h;
  });
}
