const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /amortization-calculator/ and registers it under Money & Finance (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.amEngine (built on loanEngine). Run: node md-files/gen-amort-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['LOAN', 'AMORT'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));

const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked examples, all from the engine ---------- */
const E = CalcThis.amEngine;
const money = (x) => '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
const S0 = new Date(2027, 0, 1);
const mk = (o) => E.run(Object.assign({ P: 300000, apr: 6.5, key: 'monthly', comp: 'same', n: 360, extra: 0, yAmt: 0, yMonth: 0, start: S0, ones: {} }, o));
const A = mk({ P: 200000, apr: 6, n: 180 });
const B = mk({}), B15 = mk({ n: 180 }), B20 = mk({ n: 240 }), B25 = mk({ n: 300 });
const Bx = mk({ extra: 200 });
const Bone = mk({ ones: { 12: 10000 } });
const yrsTxt = (months) => { const y = Math.floor(months / 12), mo = months % 12, a = []; if (y) a.push(y + (y === 1 ? ' year' : ' years')); if (mo) a.push(mo + (mo === 1 ? ' month' : ' months')); return a.join(' '); };
const durTxt = (count, ppy) => yrsTxt(Math.round(count * 12 / ppy));
const bal = (res, k) => res.rows[k - 1].bal;
const tblFirst = '<div class="am-tbl"><table class="dtable"><thead><tr><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>' + B.rows.slice(0, 6).map((r) => '<tr><td>' + r.k + '</td><td>' + money(r.intr) + '</td><td>' + money(r.pr) + '</td><td>' + money(r.bal) + '</td></tr>').join('') + '</tbody></table></div>';
const tblTerms = '<div class="am-tbl"><table class="dtable"><thead><tr><th>Term</th><th>Payment</th><th>Total interest</th></tr></thead><tbody>' + [[15, B15], [20, B20], [25, B25], [30, B]].map((q) => '<tr><td>' + q[0] + ' years</td><td>' + money(q[1].pay) + '</td><td>' + m0(q[1].totInt) + '</td></tr>').join('') + '</tbody></table></div>';
const FREQ = ['monthly', 'semimonthly', 'biweekly', 'weekly', 'quarterly', 'annual'];
const fr = FREQ.map((k) => ({ k, per: E.PER[k], res: mk({ key: k, n: Math.round(30 * E.PER[k].ppy) }) }));
const tblFreq = '<div class="am-tbl"><table class="dtable"><thead><tr><th>You pay</th><th>Payment</th><th>Total interest</th></tr></thead><tbody>' + fr.map((q) => '<tr><td>' + q.per.name + '</td><td>' + money(q.res.pay) + '</td><td>' + m0(q.res.totInt) + '</td></tr>').join('') + '</tbody></table></div>';
const tblExtra = '<div class="am-tbl"><table class="dtable"><thead><tr><th>Extra each month</th><th>Paid off in</th><th>Interest saved</th></tr></thead><tbody><tr><td>None</td><td>' + durTxt(B.count, 12) + '</td><td>—</td></tr>' + [100, 200, 500].map((v) => { const q = mk({ extra: v }); return '<tr><td>' + m0(v) + '</td><td>' + durTxt(q.count, 12) + '</td><td>' + m0(B.totInt - q.totInt) + '</td></tr>'; }).join('') + '</tbody></table></div>';
const zr = mk({ P: 12000, apr: 0, n: 24 });
const crossTxt = B.cross;
const bal5 = bal(B, 60), bal10 = bal(B, 120), bal15 = bal(B, 180);

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The payment formula A = P × i ÷ (1 − (1 + i)^−n), the rule that the first payment falls one full period after the loan starts, A = P ÷ n at 0% and the derivation of the balance after each payment are given in the Wikipedia article “Amortization calculator”, read on 2026-11-14.</li>
          <li>The feature set was compared with the amortization calculators of calculator.net, Omnicalculator and mortgagecalculator.org, all opened on 2026-11-14. Bankrate could not be opened (human-verification wall) and NerdWallet's calculator could not be read, so neither was compared.</li>
          <li>Model used here: interest is charged on the balance still owed at the start of each payment period; with a compounding frequency other than your payment frequency the yearly rate is turned into an equal rate per payment; extra payments reduce the balance right after the interest of that payment is taken; the last payment is whatever is left. Fees, taxes, insurance, adjustable rates and rounding by a lender can change real figures by a few cents or more, so check the figures against your loan documents.</li>
        </ul>
        <p><small>For information only. Not financial advice.</small></p>`;

const P = {
  slug: 'amortization-calculator', name: 'Amortization Calculator', menu: 'Amortization', body: 'p-bmr p-am',
  title: 'Amortization Calculator: Schedule & Extra Payments',
  desc: 'Amortization calculator: payment, interest and balance of every payment, with extra payments, any frequency and a slider for where you stand. Any currency.',
  h1: 'Amortization Calculator', eyebrow: 'Schedule · extra payments · where you stand · any currency',
  lead: `Type the <strong>loan amount, interest rate and term</strong> and see the payment and the whole schedule: how much of <em>every</em> payment is interest and how much pays down the loan. <strong>${money(200000)}</strong> at <strong>6%</strong> over <strong>15 years</strong> is <strong>${money(A.pay)}</strong> a month and <strong>${money(A.totInt)}</strong> of interest. Drag the slider to see the balance at any payment, and try extra payments to see how much sooner you are done.`,
  schema: 'Free amortization calculator: the payment of a fixed-rate loan, a chart that splits every payment into principal and interest, a slider that shows the balance, interest paid and interest still to pay at any payment, the effect of extra payments (every payment, every year or one time) with time and interest saved, ten payment frequencies, seven compounding options, a yearly and a payment-by-payment schedule, and a price and down payment option, in any currency.',
  llms: 'Free amortization calculator in any currency: payment, schedule, chart of principal vs interest for every payment, slider for the balance at any payment, extra payments with time and interest saved, any payment frequency.',
  card: 'Amortization schedule in any currency: every payment split into interest and principal, a slider for the balance at any point, and what extra payments save.',
  faqs: [
    ['What is an amortization schedule?', 'It is a table of every payment on a loan that is paid off in equal instalments. Each row shows how much of the payment is interest, how much reduces the loan and what balance is left. For ' + money(200000) + ' at 6% over 15 years the payment is ' + money(A.pay) + ' and the first payment is ' + money(A.rows[0].intr) + ' interest and ' + money(A.rows[0].pr) + ' principal.'],
    ['How do I calculate an amortized loan payment?', 'Use A = P × i ÷ (1 − (1 + i)^−n), where P is the loan, i the interest rate for one payment period and n the number of payments. For ' + money(300000) + ' at 6.5% over 30 years, i = 6.5% ÷ 12 and n = 360, so the payment is ' + money(B.pay) + '. At 0% the payment is simply the loan divided by the number of payments.'],
    ['Why is so much of my first payment interest?', 'Interest is charged on the balance still owed, which is largest at the start. On ' + money(300000) + ' at 6.5% the first payment of ' + money(B.pay) + ' is ' + money(B.rows[0].intr) + ' interest and only ' + money(B.rows[0].pr) + ' principal. From payment ' + crossTxt + ' more of each payment goes to principal than to interest.'],
    ['How much do I still owe after a few years?', 'Drag the slider or type a payment number, a month and year or a date. After 5 years on the ' + money(300000) + ' loan at 6.5% over 30 years you still owe ' + money(bal5) + ', after 10 years ' + money(bal10) + ' and after 15 years ' + money(bal15) + '.'],
    ['How do extra payments change an amortization schedule?', 'An extra payment goes straight to the balance, so the next interest is charged on less. Adding ' + money(200) + ' a month to the ' + money(300000) + ' loan at 6.5% pays it off in ' + durTxt(Bx.count, 12) + ' instead of 30 years and saves ' + m0(B.totInt - Bx.totInt) + ' of interest. You can add an extra amount to every payment, once a year, or as one-time payments on a date.'],
    ['Can I make a one-time extra payment?', 'Yes. Open Go advanced, add a one-time payment and type the amount and when: a month and year like Mar 2030, a date, or a payment number like 24. A single ' + money(10000) + ' payment at payment 12 on the same loan saves ' + m0(B.totInt - Bone.totInt) + ' of interest.'],
    ['Does paying every two weeks or every week change the schedule?', 'Yes. The payment is worked out for the frequency you choose, with the same term: ' + money(300000) + ' at 6.5% over 30 years costs ' + m0(fr[0].res.totInt) + ' of interest paid monthly and ' + m0(fr[2].res.totInt) + ' paid every two weeks (26 smaller payments a year). To test paying half the monthly payment every two weeks, which makes one extra monthly payment a year, keep the frequency on monthly and type half the monthly payment as the yearly extra.'],
    ['What is the difference between a 15-year and a 30-year loan?', 'The shorter loan has a higher payment but far less interest: ' + money(300000) + ' at 6.5% costs ' + money(B15.pay) + ' a month and ' + m0(B15.totInt) + ' of interest over 15 years, against ' + money(B.pay) + ' and ' + m0(B.totInt) + ' over 30 years.'],
    ['Can I use it for a mortgage or a car loan?', 'Yes, for any loan with a fixed rate and equal payments: mortgage, auto loan, personal or student loan. Under Go advanced you can type the price and down payment instead of the loan amount. Taxes, insurance and fees are not included; use the mortgage or auto loan calculator for those.'],
    ['Does the calculator work at 0% interest?', 'Yes. At 0% every payment is all principal: ' + money(12000) + ' over 24 months is ' + money(zr.pay) + ' a month with no interest.'],
    ['Does the calculator work in my currency?', 'Choose your currency at the top right of the calculator: the amounts show in it with the symbol on the usual side. Nothing is converted, only the display changes.']
  ],
  pills: [['/loan-calculator/', 'Loan Calculator', '<path d="M4 8h24M4 16h24M4 24h14"/>'], ['/mortgage-calculator/', 'Mortgage Calculator', '<path d="M4 16L16 5l12 11M8 14v13h16V14"/>'], ['/auto-loan-calculator/', 'Auto Loan Calculator', '<path d="M5 20l2-8h18l2 8M5 20v5h4v-3h14v3h4v-5"/>'], ['/compound-interest-calculator/', 'Compound Interest Calculator', '<path d="M4 26c6 0 8-4 12-9s7-8 12-9"/>']]
};

const tfld = (id, label, unit, ph, mode, labId) => `<label class="fld" for="${id}"><span class="lab">${labId ? '<span id="' + labId + '">' + label + '</span>' : label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const note = (id) => `<p class="av-note" id="${id}"></p>`;
const mkCs = (id, label, opts, defKey) => `<div class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${defKey}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => o[0] === defKey)[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${o[0] === defKey ? ' on' : ''}" role="option" aria-selected="${o[0] === defKey}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></div>`;
const curSel = `<div class="csel sl-cur" id="amCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const FOPT = [['monthly', 'Every month'], ['semimonthly', 'Twice a month'], ['biweekly', 'Every 2 weeks'], ['weekly', 'Every week'], ['bimonthly', 'Every 2 months'], ['quarterly', 'Every quarter'], ['semi', 'Every 6 months'], ['annual', 'Every year'], ['daily', 'Every day'], ['semiweekly', 'Twice a week']];
const COPT = [['same', 'As often as I pay'], ['annual', 'Annually'], ['semi', 'Semiannually'], ['quarterly', 'Quarterly'], ['monthly', 'Monthly'], ['weekly', 'Weekly'], ['daily', 'Daily'], ['cont', 'Continuously']];
const MOPT = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => [String(i), m]);

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
        <div class="sl-head"><h2 class="card-h2">Your loan</h2>${curSel}</div>
        ${tfld('amP', 'Loan amount', '$', 'e.g. 200,000')}
        ${note('amPNote')}
        <div class="am-two" id="am2a"><div>${tfld('amR', 'Interest rate', '%', 'e.g. 6')}</div><div>${tfld('amT', 'Term', '', 'e.g. 15 or 18 months', 'text')}</div></div>
        ${note('amRNote')}
        ${note('amTNote')}
        ${tfld('amX', 'Extra payment · optional', '$', 'e.g. 100')}
        ${note('amXNote')}
        ${tfld('amAt', 'Look at one point in the loan · optional', '', 'e.g. 60 or Mar 2030', 'text')}
        ${note('amAtNote')}
        <div class="res-hint" id="amHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="amAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="am-sech">Price and down payment <span>· optional</span></p>
          ${tfld('amPrice', 'Price of what you buy', '$', 'e.g. 300,000')}
          ${note('amPriceNote')}
          ${tfld('amDown', 'Down payment', '', 'e.g. 20% or 60,000', 'text')}
          ${note('amDownNote')}
          <p class="am-sech">How you pay <span>· optional</span></p>
          ${mkCs('amFreq', 'You pay', FOPT, 'monthly')}
          ${note('amFreqNote')}
          ${mkCs('amComp', 'Interest is added', COPT, 'same')}
          ${note('amCompNote')}
          <label class="fld" for="amStart"><span class="lab">Loan start date</span><div class="inp"><input id="amStart" type="text" autocomplete="off" placeholder="Today"></div></label>
          ${note('amStartNote')}
          <p class="am-sech">More extra payments <span>· optional</span></p>
          ${tfld('amXS', 'Extra payments start', '', 'e.g. 24 or Mar 2030', 'text')}
          ${note('amXSNote')}
          <div class="am-two"><div>${tfld('amYA', 'Extra once a year', '$', 'e.g. 2,000')}</div><div>${mkCs('amYM', 'In the month of', MOPT, '0')}</div></div>
          ${note('amYANote')}
          <div id="amOnes"></div>
          ${note('amOnesNote')}
          <button type="button" class="linkbtn" id="amAddOne">+ Add a one-time extra payment</button>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="amClear" type="button">Clear fields</button>
          <button class="advbtn" id="amAdvBtn" type="button">
            <span id="amAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="amLab">Monthly payment</div>
          <div class="res-big"><span id="amBig">—</span></div>
          <div class="res-sub" id="amSub" data-empty="Type the loan amount, the interest rate and the term to see the payment and the whole schedule.">Type the loan amount, the interest rate and the term to see the payment and the whole schedule.</div>
        </div>
        <div id="amBody" style="display:none">
          <p class="res-tip adv-tip" id="amTip"></p>
          <div id="amSplit"></div>
          <div id="amVisWrap" style="display:none">
            <p class="bm-h">Every payment: interest and principal</p>
            <div class="am-vis" id="amVis"></div>
            <input class="am-range" id="amSlide" type="range" min="1" max="2" step="1" value="1" aria-label="Payment number to look at">
            <p class="cb-note" id="amPointKey"></p>
            <table class="dtable" id="amPoint"></table>
          </div>
          <div id="amNumsWrap">
            <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="amCopyTxt" style="margin-left:8px">Copy result</button><button class="linkbtn" type="button" id="amPrint" style="margin-left:8px">Print</button></p>
            <table class="dtable" id="amNums"></table>
            <div id="amCopyTxt" style="display:none"></div>
          </div>
          <div id="amFastWrap" style="display:none">
            <p class="bm-h">Pay it off faster</p>
            <table class="dtable" id="amFast"></table>
            <p class="cb-note" id="amFastKey"></p>
          </div>
          <div id="amSchWrap" style="display:none">
            <p class="bm-h">Amortization schedule</p>
            <div class="seg am-seg" id="amSchSeg" role="group" aria-label="Schedule view"><button type="button" data-v="year" class="on">By year</button><button type="button" data-v="pay">Every payment</button></div>
            <div class="am-tbl"><table class="dtable" id="amSch"></table></div>
            <button type="button" class="linkbtn am-more" id="amMore" style="display:none">Show more payments</button>
            <p class="cb-note" id="amSchKey"></p>
          </div>
          <div id="amStepsWrap" style="display:none">
            <p class="bm-h">How it is worked out</p>
            <ol class="am-steps" id="amSteps"></ol>
          </div>
        </div>`;
  const left = `
        <h2>How to use the amortization calculator</h2>
        <p>Type the <strong>loan amount</strong>, the yearly <strong>interest rate</strong> and the <strong>term</strong> (years, months, or both like 5y 6m; weeks and days work too). The result shows the payment, the total interest and a chart that stacks every payment into the part that is interest and the part that reduces the loan. Drag the slider under the chart, or type a payment number, a month and year or a date in <em>Look at one point in the loan</em>, to see the balance, the interest paid so far and the interest still to pay at that point.</p>
        <p>Type an <strong>extra payment</strong> to see how much sooner the loan is done and how much interest you save, or click a row of the <em>Pay it off faster</em> table. Go advanced for the price and down payment, how often you pay (ten options, daily to yearly), how often the interest is added, the loan start date, an extra amount once a year and one-time extra payments on a date.</p>
        <h2 id="amFormulas">The formula</h2>
        <div class="formula">
          A = P × i ÷ (1 − (1 + i)^−n)
          <small>BALANCE AFTER A PAYMENT = BALANCE × (1 + i) − A</small>
        </div>
        <p>A is the payment, P the loan, i the interest rate for one payment period (the yearly rate divided by the payments in a year) and n the number of payments. The first payment is due one full period after the loan starts. ${money(200000)} at 6% for 15 years: i = 6% ÷ 12 = 0.5% and n = 180, so A = ${money(A.pay)}. At 0% the payment is just P ÷ n.</p>
        <h2>What a schedule shows</h2>
        <p>Each payment is the same, but its parts change. The first six payments of ${money(300000)} at 6.5% over 30 years:</p>
        ${tblFirst}
        <p>The interest in the first payment is the balance times the rate for one period: ${money(300000)} × 6.5% ÷ 12 = ${money(B.rows[0].intr)}. The rest of the ${money(B.pay)}, ${money(B.rows[0].pr)}, reduces the loan, so next month's interest is a little smaller and the principal part a little bigger. From payment ${crossTxt} the principal part is the larger one.</p>`;
  const right = `
        <h2>A shorter term costs less interest</h2>
        <p>The same ${money(300000)} at 6.5%, by term:</p>
        ${tblTerms}
        <h2>What extra payments do</h2>
        <p>Extra money goes straight to the balance, so the next interest is charged on less. On the ${money(300000)} loan at 6.5% over 30 years:</p>
        ${tblExtra}
        <p>A one-time ${money(10000)} extra payment at payment 12 saves ${m0(B.totInt - Bone.totInt)} of interest and shortens the loan to ${durTxt(Bone.count, 12)}.</p>
        <h2>Paying more often</h2>
        <p>The payment is worked out for the frequency you pick, with the same term. ${money(300000)} at 6.5% over 30 years:</p>
        ${tblFreq}
        <p>Paying every two weeks with a payment calculated for 26 payments a year is not the same as paying half the monthly payment every two weeks, which makes one extra monthly payment a year. To test that, keep the frequency on monthly and type half the monthly payment as the extra once a year.</p>
        <h2>Related tools</h2>
        <p>For a loan with a payment frequency, fees and an affordability mode use the <a href="/loan-calculator/">loan calculator</a>; for a home loan with taxes and insurance the <a href="/mortgage-calculator/">mortgage calculator</a>; for a car the <a href="/auto-loan-calculator/">auto loan calculator</a>; and to see how savings grow instead, the <a href="/compound-interest-calculator/">compound interest calculator</a>.</p>
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
    <span class="mbar-lab" id="amMLab">Monthly payment</span>
    <div class="mbar-vals"><b id="amMVal">—</b></div>
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
<script>CalcThis.initAmortCalc();</script>
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
const prev = { slug: 'compound-interest-calculator', menu: 'Compound Interest', name: 'Compound Interest Calculator', llms: 'Compound Interest Calculator' };
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
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M5 6h22M5 12h22M5 18h14" stroke="#37503F" stroke-width="2" stroke-linecap="round"/><path d="M5 26c6 0 12-2 22-8" fill="none" stroke="#8F5C13" stroke-width="2" stroke-linecap="round"/></svg>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — every payment of a loan split into interest and principal, the balance at any point, and what extra payments save, in any currency</span></li>\n');
    return h;
  });
}
