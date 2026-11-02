const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /salary-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json) plus cross-links from /overtime-calculator/, /hours-calculator/ and /paycheck-calculator/. Every number in the text comes from
   CalcThis.salaryEngine / payEngine. Run: node md-files/gen-salary-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* PAY-ENGINE:START */'), app.indexOf('/* PAY-ENGINE:END */')));
eval(app.slice(app.indexOf('/* PAY-STATES:START */'), app.indexOf('/* PAY-STATES:END */')));
eval(app.slice(app.indexOf('/* SALARY-ENGINE:START */'), app.indexOf('/* SALARY-ENGINE:END */')));
const E = CalcThis.salaryEngine, PE = CalcThis.payEngine;
const CURN = E.CURRENCIES.length;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const m2 = (x) => '$' + (Math.round(x * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
const mm = (x) => (Math.abs(x) >= 1000 ? m0(x) : m2(x));
const n2 = (x) => String(Math.round(x * 100) / 100);

/* ---------- worked examples ---------- */
const std = { hpw: 40, dpw: 5, off: 0 };
const cv = (amount, unit, o) => E.convert(Object.assign({ amount, unit }, std, o || {}));
const R = (c, k) => c.rows.find((r) => r.k === k);
const a25 = cv(25, 'hour');
const a50 = cv(50, 'hour', { off: 25 });                 // calculator.net's published example (10 holidays + 15 vacation days)
const y75 = cv(75000, 'year');
const b4k = cv(4000, 'biweek');
const w1200 = cv(1200, 'week');
const mo5k = cv(5000, 'month');
const d200 = cv(200, 'day');
const t75 = E.takeHome(PE, 75000, 'single', ''), t75tx = E.takeHome(PE, 75000, 'single', 'TX'), t75ca = E.takeHome(PE, 75000, 'single', 'CA');
const raise = E.takeHome(PE, 75000 * 1.05, 'single', '');
const otc = cv(25, 'hour'); const otp = E.overtime(otc, 5, 1.5);
const chart = [12, 15, 18, 20, 25, 30, 40, 50].map((h) => cv(h, 'hour'));

const faqs = [
  ['How do I convert an hourly wage to a yearly salary?', `Multiply the hourly rate by the hours you work in a week and by 52. At ${m2(25)} an hour for ${std.hpw} hours a week that is ${m2(25)} × ${std.hpw} × 52 = ${m0(a25.annUn)} a year. If some holidays or vacation days are unpaid, take those days out first: the calculator shows both figures side by side.`],
  ['How do I convert a salary to an hourly rate?', `Divide the yearly salary by the hours worked in a year — ${E.convert({ amount: 1, unit: 'year', hpw: 40, dpw: 5, off: 0 }).hours.toLocaleString('en-US')} for a 40-hour week (40 × 52). A ${m0(75000)} salary is ${m0(75000)} ÷ ${std.hpw * 52} = ${m2(R(y75, 'hour').adj)} an hour. Type the salary with the period set to Yearly and the hourly figure is the headline.`],
  ['What is the difference between bi-weekly and semi-monthly pay?', `Bi-weekly means every two weeks, so there are 26 paychecks a year; semi-monthly means twice a month, so there are 24. The same yearly salary therefore gives a bigger bi-weekly check: ${m0(75000)} a year is ${m2(R(y75, 'biweek').adj)} bi-weekly or ${m2(R(y75, 'semimonth').adj)} semi-monthly. In a year with 26 bi-weekly pay dates, two months have three paychecks.`],
  ['How do holidays and vacation days change the result?', `The calculator gives two columns. "Without time off" assumes every working day is paid. "With time off" takes the holidays and vacation days you enter out as unpaid days. At ${m2(50)} an hour with 10 holidays and 15 vacation days, ${m0(a50.annUn)} becomes ${m0(a50.annAdj)} a year, which is ${m2(R(a50, 'hour').adj)} an hour over the whole year. If your time off is paid, as it is for most salaried jobs, use the "without time off" column.`],
  ['How many working hours and days are in a year?', `With a 5-day, 40-hour week there are 5 × 52 = ${std.dpw * 52} working days and 40 × 52 = ${std.hpw * 52} working hours before any time off. Subtract holidays and vacation days (each day is ${n2(std.hpw / std.dpw)} hours) to get the days you are actually paid for. Both the hours and the days a week are editable.`],
  ['How do I calculate take-home pay from a salary?', `Turn on the take-home column: it runs the pay through the same 2026 federal withholding, Social Security and Medicare as our <a href="/paycheck-calculator/">paycheck calculator</a>, with a state if you choose one under Go advanced. For ${m0(75000)} a year as a single filer with federal tax only the yearly take-home is ${m0(t75.net)} (${Math.round(t75.net / 75000 * 100)}% kept); in Texas, which has no state income tax, it is the same ${m0(t75tx.net)}, and with California withholding it is ${m0(t75ca.net)}. It is an estimate: your W-4, pre-tax deductions and local taxes change it.`],
  ['How do I see what a raise is worth?', `Open Go advanced and enter the raise as a percent (or a negative number for a cut). The calculator shows hourly, monthly and yearly pay before and after, and the take-home change. A 5% raise on ${m0(75000)} is ${m0(75000 * 0.05)} more a year before tax and about ${m0(raise.net - t75.net)} more after federal tax and payroll tax.`],
  ['Can I use a currency other than US dollars?', `Yes. Pick your currency at the top right of the calculator and start typing its name or code (euro, GBP, rupee, ₹) — about ${CURN} currencies are included, with the most common ones (US, Canadian and Australian dollars, euro, pound, rupee, yen, yuan, Swiss franc, peso, real) listed first. The amounts are shown with that currency's symbol and nothing is converted, so type your pay in your own currency. The hourly, daily, weekly, bi-weekly, semi-monthly, monthly, quarterly and yearly figures work for any currency; the take-home column uses US federal and state tax rules, so it is shown for US dollars only.`],
  ['Does this salary calculator include overtime?', `Yes, under Go advanced: enter the extra hours you work each week and the multiplier (1.5 for time and a half). At ${m2(25)} an hour, 5 overtime hours a week at 1.5× add ${m0(otp)} over a 52-week year. For exact overtime rules, day-by-day California pay and the no-tax-on-overtime deduction use the <a href="/overtime-calculator/">overtime calculator</a>.`]
];
const title = 'Salary Calculator: Hourly to Annual, Monthly & Take-Home';
const desc = 'Free salary calculator: turn hourly, weekly, monthly or yearly pay into every other period in any currency, with unpaid time off, US take-home and raises.';
if (title.length > 60 || desc.length > 158) { console.error('SEO length fail', title.length, desc.length); process.exit(1); }
const url = 'https://calcthis.co/salary-calculator/';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const head = headTop
  .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
  .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
  .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
  .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
  .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
  .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">')
  .replace(/<meta name="twitter:title" content="[^"]*">/, () => '<meta name="twitter:title" content="' + esc(title) + '">')
  .replace(/<meta name="twitter:description" content="[^"]*">/, () => '<meta name="twitter:description" content="' + esc(desc) + '">');
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Salary Calculator', url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Salary calculator in any currency (USD, EUR, GBP, CAD, AUD, INR and ' + (CURN - 6) + ' more): enter pay as hourly, daily, weekly, bi-weekly, semi-monthly, monthly, quarterly or yearly and see every other period at once, with and without unpaid holidays and vacation, US take-home pay after tax, a raise comparison and overtime.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Salary Calculator', item: url }] };
const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const tfld = (id, label, unit, ph, extra) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"${extra || ''}></div></label>`;
const csel = (id, val, label, opts) => `<div class="csel" id="${id}" data-value="${val}">
              <button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="csel-val">${label}</span>
                ${chev}
              </button>
              <div class="csel-panel" role="listbox">
${opts.map((o) => `                <button type="button" class="csel-opt${o[0] === val ? ' on' : ''}" role="option" aria-selected="${o[0] === val}" data-value="${o[0]}">${o[1]}</button>`).join('\n')}
              </div>
            </div>`;
const unitOpts = [['hour', 'Hour'], ['day', 'Day'], ['week', 'Week'], ['biweek', 'Bi-week'], ['semimonth', 'Semi-month'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year']];

const body = `<body class="p-bmr p-avg p-ot p-sal">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">Hourly · weekly · monthly · yearly · any currency</div>
    <h1>Salary Calculator</h1>
    <p>Type your pay in <strong>any period</strong> — hourly, daily, weekly, bi-weekly, semi-monthly, monthly, quarterly or yearly — and see <strong>every other period at once</strong>, with and without unpaid holidays and vacation, in <strong>any currency</strong>, plus the <strong>US take-home after tax</strong>. At ${m2(25)} an hour, a ${std.hpw}-hour week is <strong>${m0(a25.annUn)} a year</strong>; a ${m0(75000)} salary is <strong>${m2(R(y75, 'hour').adj)} an hour</strong>.</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <div class="sl-head"><h2 class="card-h2">Your pay</h2><div class="csel sl-cur" id="slCur" data-value="USD" data-search="1" aria-label="Currency"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">USD</span>${chev}</button><div class="csel-panel" role="listbox"></div></div></div>
        <div class="two">${tfld('slAmt', 'Pay amount', '<span id="slSym">$</span>', 'e.g. 25 or 62,400')}<div class="fld"><span class="lab">Per</span>${csel('slUnit', 'hour', 'Hour', unitOpts)}</div></div>
        <div class="two">${tfld('slHpw', 'Hours per week', '', '40')}${tfld('slDpw', 'Days per week', '', '5')}</div>
        <div class="two">${tfld('slHol', 'Holidays a year', '', '0')}${tfld('slVac', 'Vacation days a year', '', '0')}</div>
        <p class="av-note" id="slNote">Holidays and vacation days are counted as unpaid in the “with time off” column; leave them empty if you don’t want that.</p>
        <div class="res-hint" id="slHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="slAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${tfld('slRaise', 'Raise or cut', '%', 'e.g. 5 or -3')}
          <div class="two">${tfld('slOTh', 'Overtime hours a week', '', 'e.g. 5')}${tfld('slMult', 'Overtime multiplier', '×', '1.5')}</div>
          <div id="slTaxIn">
          <div class="fld"><span class="lab">Filing status</span><div class="modeseg" id="slFileSeg" role="group" aria-label="Filing status" style="grid-template-columns:repeat(3,1fr)"><button class="on" type="button" data-v="single">Single</button><button type="button" data-v="married">Married, joint</button><button type="button" data-v="hoh">Head of household</button></div></div>
          <div class="fld"><span class="lab">State income tax</span><div class="csel" id="slState" data-value="">
              <button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="csel-val">Federal taxes only</span>
                ${chev}
              </button>
              <div class="csel-panel" role="listbox"></div>
            </div></div>
          </div>
          <div class="fld"><span class="lab">Show cents on every figure</span><div class="modeseg" id="slCentsSeg" role="group" aria-label="Show cents" style="grid-template-columns:1fr 1fr"><button class="on" type="button" data-v="0">Off</button><button type="button" data-v="1">On</button></div></div>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="slAdvBtn" type="button">
            <span id="slAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="slBigLab">Yearly pay</div>
          <div class="res-big"><span id="slBig">—</span></div>
          <div class="res-sub" id="slSub" data-empty="Enter your pay and choose the period it is paid for.">Enter your pay and choose the period it is paid for.</div>
        </div>
        <div id="slBody" style="display:none">
          <p class="res-tip adv-tip" id="slTip"></p>
          <div id="slViz"></div>
          <p class="bm-h">Every pay period</p>
          <table class="dtable ot-per" id="slTbl"></table>
          <p class="av-note" id="slTblNote"></p>
          <div id="slTakeWrap">
          <div class="proj-sep"></div>
          <p class="bm-h">Yearly take-home after tax</p>
          <table class="dtable" id="slTakeTbl"></table>
          </div>
          <div id="slRaiseWrap" style="display:none">
            <div class="proj-sep"></div>
            <p class="bm-h">What the raise or cut does</p>
            <table class="dtable ot-per" id="slRaiseTbl"></table>
          </div>
          <div id="slOtWrap" style="display:none">
            <div class="proj-sep"></div>
            <p class="bm-h">With overtime</p>
            <table class="dtable" id="slOtTbl"></table>
          </div>
          <div class="proj-sep"></div>
          <p class="bm-h">The working</p>
          <ul class="ot-steps" id="slSteps"></ul>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="slMLab">Yearly pay</span>
    <div class="mbar-vals"><b id="slMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${pill('/paycheck-calculator/', 'Paycheck Calculator', '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>')}
${pill('/overtime-calculator/', 'Overtime Calculator', '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 3h6"/>')}
${pill('/hours-calculator/', 'Hours Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
${pill('/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the salary calculator</h2>
        <p>Choose your <strong>currency</strong> at the top right (US dollars by default), type your <strong>pay amount</strong> and choose the period it is paid for — hour, day, week, bi-week, semi-month, month, quarter or year. The results show the same pay for every other period at once, so there is no direction to pick: hourly to salary, salary to hourly, weekly to monthly and bi-weekly to yearly are all the same box.</p>
        <p>Set your <strong>hours per week</strong> and <strong>days per week</strong> (40 and 5 if you leave them empty). Add the <strong>holidays</strong> and <strong>vacation days</strong> you don't get paid for to see a second column with them taken out. Open <strong>Go advanced</strong> for a raise or cut, overtime hours, your filing status and state, and to show cents. The take-home column and the tax settings are for US dollars; every other figure works in all ${CURN} currencies.</p>

        <h2>Hourly to salary: the formula</h2>
        <div class="formula">
          Yearly pay = hourly rate × hours per week × 52
          <small>HOURLY RATE = YEARLY PAY ÷ (HOURS PER WEEK × 52)</small>
        </div>
        <p>${m2(25)} an hour × ${std.hpw} hours × 52 weeks = <strong>${m0(a25.annUn)}</strong> a year, ${m0(R(a25, 'month').adj)} a month, ${m2(R(a25, 'biweek').adj)} every two weeks and ${m2(R(a25, 'week').adj)} a week. Going the other way, ${m0(75000)} ÷ ${std.hpw * 52} hours = <strong>${m2(R(y75, 'hour').adj)} an hour</strong>.</p>
        <table class="dtable">
          <thead><tr><th>Hourly rate</th><th>Weekly</th><th>Monthly</th><th>Yearly</th></tr></thead>
          <tbody>
${chart.map((c) => `            <tr><td>${m2(c.rows[0].un)}</td><td>${mm(R(c, 'week').un)}</td><td>${mm(R(c, 'month').un)}</td><td>${mm(R(c, 'year').un)}</td></tr>`).join('\n')}
          </tbody>
        </table>
        <p>The table is for a ${std.hpw}-hour, ${std.dpw}-day week with every working day paid. Change the hours or days, or add unpaid time off, in the calculator.</p>

        <h2>Pay periods: weekly, bi-weekly, semi-monthly, monthly</h2>
        <p>There are <strong>52 weekly</strong> paychecks in a year, <strong>26 bi-weekly</strong> (every two weeks), <strong>24 semi-monthly</strong> (twice a month) and <strong>12 monthly</strong>. The yearly pay is the same, but the check size differs: ${m0(75000)} a year is ${m2(R(y75, 'week').adj)} a week, ${m2(R(y75, 'biweek').adj)} bi-weekly, ${m2(R(y75, 'semimonth').adj)} semi-monthly and ${m2(R(y75, 'month').adj)} a month. A ${m2(4000)} bi-weekly paycheck is ${m0(b4k.annAdj)} a year; a ${m2(1200)} weekly one is ${m0(w1200.annAdj)}; ${m0(5000)} a month is ${m0(mo5k.annAdj)}; and ${m0(200)} a day over a ${std.dpw}-day week is ${m0(d200.annAdj)}.</p>
      </div>

      <div>
        <h2>Holidays, vacation and unpaid time off</h2>
        <p>Hourly workers are usually paid only for the days they work, so each unpaid holiday or vacation day takes ${m2(25 * std.hpw / std.dpw)} out of a year at ${m2(25)} an hour and ${std.hpw / std.dpw} hours a day. The calculator's two columns show both sides: <strong>without time off</strong> (every working day paid) and <strong>with time off</strong> (the days you enter are unpaid). A worked example: ${m2(50)} an hour, 40 hours, 5 days, with 10 holidays and 15 vacation days is ${m0(a50.annUn)} without time off and <strong>${m0(a50.annAdj)}</strong> with it — ${m2(R(a50, 'hour').adj)} an hour over the whole year.</p>
        <p>If your holidays and vacation are paid, as they are for most salaried jobs, leave them empty or use the first column: a salary already includes them.</p>

        <h2>From salary to take-home pay</h2>
        <p>The take-home column runs the yearly pay through the same 2026 federal income tax withholding, Social Security and Medicare as our <a href="/paycheck-calculator/">paycheck calculator</a>, with the Social Security wage limit applied exactly across 12 monthly paychecks. For ${m0(75000)} as a single filer with federal tax only that leaves <strong>${m0(t75.net)}</strong> a year (${m0(t75.net / 12)} a month); with California withholding it is ${m0(t75ca.net)}. Choose a state, and your filing status, under Go advanced. For exact paychecks with your W-4, deductions and any state, use the paycheck calculator or a <a href="/paycheck-calculator/">state page</a>.</p>

        <h2>What a raise is worth</h2>
        <p>Enter a percent under Go advanced to compare before and after. A 5% raise on ${m0(75000)} adds ${m0(75000 * 0.05)} a year before tax — about ${m0(raise.net - t75.net)} after federal and payroll tax — and lifts the hourly figure from ${m2(R(y75, 'hour').adj)} to ${m2(R(y75, 'hour').adj * 1.05)}. For other percentages and the reverse (what percent is the change) use the <a href="/percentage-calculator/">percentage calculator</a>.</p>

        <h2>Overtime on top of your salary</h2>
        <p>Hourly staff who work extra hours can add them under Go advanced: ${m2(25)} an hour with 5 overtime hours a week at time and a half adds ${m0(otp)} over a 52-week year. Overtime rules, California's daily overtime and the no-tax-on-overtime deduction are in the <a href="/overtime-calculator/">overtime calculator</a>; the <a href="/hours-calculator/">hours calculator</a> totals shifts and breaks first.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=294"></script>
<script>CalcThis.initSalaryCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const dir = ROOT + 'salary-calculator/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '/salary-calculator/'") ? s : s.replace("  { file: 'overtime-calculator/index.html',    slug: '/overtime-calculator/' },\n", (x) => x + "  { file: 'salary-calculator/index.html',      slug: '/salary-calculator/' },\n"));
edit('llms.txt', (lt) => lt.includes('/salary-calculator/') ? lt : lt.replace(/(- \[Overtime Calculator[^\n]*\n)/, (x) => x + '- [' + title + '](' + url + '): Free salary calculator: pay in any period (hourly, daily, weekly, bi-weekly, semi-monthly, monthly, quarterly, yearly) converted to every other, with and without unpaid holidays and vacation, take-home after tax, a raise comparison and overtime.\n'));
edit('partials/header.html', (s) => s.includes('/salary-calculator/') ? s : s.replace('          <a href="/overtime-calculator/">Overtime</a>\n', (x) => x + '          <a href="/salary-calculator/">Salary</a>\n'));
edit('partials/footer.html', (s) => s.includes('/salary-calculator/') ? s : s.replace('          <li><a href="/overtime-calculator/">Overtime Calculator</a></li>\n', (x) => x + '          <li><a href="/salary-calculator/">Salary Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"/salary-calculator/"') ? s : s.replace('  "/hours-calculator/": {', () => '  "/salary-calculator/": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/hours-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Salary Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Overtime Calculator"[^\n]*\n)/, (x) => x + '        { "@type": "WebApplication", "name": "Salary Calculator", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Salary Calculator</h3>')) {
    const card = `    <a class="calc" href="/salary-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><rect x="4" y="9" width="24" height="15" rx="3" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><circle cx="16" cy="16.5" r="3.4" stroke="#37503F" stroke-width="1.6"/><path d="M8 13v7M24 13v7" stroke="#8F5C13" stroke-width="1.4" stroke-linecap="round"/></svg>
      </span>
      <h3>Salary Calculator</h3>
      <p>Convert pay between hourly, weekly, monthly and yearly in one box — with unpaid holidays and vacation, take-home after tax, a raise comparison and overtime.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('    <a class="calc" href="/overtime-calculator/">', () => card + '    <a class="calc" href="/overtime-calculator/">');
  }
  if (!h.includes('<a href="/salary-calculator/">Salary</a><span>')) h = h.replace(/(          <li><a href="\/overtime-calculator\/">Overtime<\/a><span>[^\n]*\n)/, (x) => x + '          <li><a href="/salary-calculator/">Salary</a><span> — hourly to yearly, monthly and take-home</span></li>\n');
  return h;
});
const linkOT = ' For a yearly, monthly or hourly figure and take-home pay, use the <a href="/salary-calculator/">salary calculator</a>.';
edit('overtime-calculator/index.html', (h) => h.includes('salary calculator</a>') ? h : h.replace('for a raise.</p>', () => 'for a raise.' + linkOT + '</p>'));
edit('md-files/gen-overtime-page.js', (h) => h.includes('/salary-calculator/') ? h : h.replace('for a raise.</p>', () => 'for a raise.' + linkOT + '</p>'));
edit('hours-calculator/index.html', (h) => h.includes('salary calculator</a>') ? h : h.replace('use the <a href="/overtime-calculator/">overtime calculator</a>.</p>', () => 'use the <a href="/overtime-calculator/">overtime calculator</a>; to turn an hourly rate into a yearly or monthly salary use the <a href="/salary-calculator/">salary calculator</a>.</p>'));
edit('paycheck-calculator/index.html', (h) => h.includes('salary calculator</a>') ? h : h.replace('use the <a href="/overtime-calculator/">overtime calculator</a>.</p></details>', () => 'use the <a href="/overtime-calculator/">overtime calculator</a>. To convert an hourly rate to a salary, or pay between weekly, bi-weekly and monthly, use the <a href="/salary-calculator/">salary calculator</a>.</p></details>'));
edit('percentage-change-calculator/index.html', (h) => h.includes('salary calculator</a>') ? h : h.replace('the <a href="/average-calculator/">average calculator</a>.</p>', () => 'the <a href="/average-calculator/">average calculator</a>; to see what a pay raise does to hourly, monthly and yearly pay, the <a href="/salary-calculator/">salary calculator</a>.</p>'));
edit('md-files/gen-pctchange-page.js', (h) => h.includes('salary calculator</a>') ? h : h.replace('the <a href="/average-calculator/">average calculator</a>.</p>', () => 'the <a href="/average-calculator/">average calculator</a>; to see what a pay raise does to hourly, monthly and yearly pay, the <a href="/salary-calculator/">salary calculator</a>.</p>'));
edit('time-calculator/index.html', (h) => h.includes('salary calculator</a>') ? h : h.replace('overtime rules vary by employer and jurisdiction.</p>', () => 'overtime rules vary by employer and jurisdiction. To turn an hourly rate into a weekly, monthly or yearly salary, use the <a href="/salary-calculator/">salary calculator</a>.</p>'));
/* keep the registered metadata in sync with the page (idempotent) */
const llmsLine = '- [' + title + '](' + url + '): Free salary calculator in any currency: pay in any period (hourly, daily, weekly, bi-weekly, semi-monthly, monthly, quarterly, yearly) converted to every other, with and without unpaid holidays and vacation, US take-home after tax, a raise comparison and overtime.\n';
edit('llms.txt', (lt) => lt.replace(/- \[[^\n]*\]\(https:\/\/calcthis\.co\/salary-calculator\/\)[^\n]*\n/, () => llmsLine));
edit('md-files/seo-meta-hand.json', (s) => s.replace(/("\/salary-calculator\/": \{\n\s+"t": [^\n]*\n\s+"d": )[^\n]*/, (m, p) => p + JSON.stringify(desc)));
edit('index.html', (h) => h.replace(/(<h3>Salary Calculator<\/h3>\s*<p>)[^<]*(<\/p>)/, (m, p, q) => p + 'Convert pay between hourly, weekly, monthly and yearly in one box, in any currency — with unpaid holidays and vacation, US take-home after tax, a raise comparison and overtime.' + q));
