const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /overtime-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json) plus cross-links from /hours-calculator/ and /paycheck-calculator/. Every number in the text comes from CalcThis.otEngine / payEngine.
   Run: node md-files/gen-overtime-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* PAY-ENGINE:START */'), app.indexOf('/* PAY-ENGINE:END */')));
eval(app.slice(app.indexOf('/* PAY-STATES:START */'), app.indexOf('/* PAY-STATES:END */')));
eval(app.slice(app.indexOf('/* OT-ENGINE:START */'), app.indexOf('/* OT-ENGINE:END */')));
const E = CalcThis.otEngine, PE = CalcThis.payEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const m2 = (x) => '$' + (Math.round(x * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m0 = (x) => '$' + Math.round(x).toLocaleString('en-US');
const hh = (x) => String(Math.round(x * 100) / 100);

/* ---------- worked examples ---------- */
const RATE = 22;
const h1 = E.split({ mode: 'total', total: 48, after: null }), p1 = E.pay(RATE, 1.5, 0, h1);
const th1 = E.takeHome({ gross: p1.gross, base: p1.base, status: 'single', state: '' }, PE);
const keep1 = th1.a.net - th1.b.net;
const q1 = E.qualified(RATE, 1.5, 0, h1), nt1 = E.noTax(q1, 52, 'single', p1.gross, 0, PE);
const dayEx = [9, 10, 8, 13, 8, 0, 0];
const hCA = E.split({ mode: 'day', days: dayEx, rule: 'ca' }), pCA = E.pay(RATE, 1.5, 0, hCA);
const hFed = E.split({ mode: 'day', days: dayEx, rule: 'fed', after: null }), pFed = E.pay(RATE, 1.5, 0, hFed);
const seven = [8, 8, 8, 8, 8, 8, 10], h7 = E.split({ mode: 'day', days: seven, rule: 'ca' }), p7 = E.pay(RATE, 1.5, 0, h7);
const hBon = E.split({ mode: 'total', total: 48, after: null }), pBon = E.pay(RATE, 1.5, 200, hBon);
const hDbl = E.split({ mode: 'total', total: 48, after: null }), pDbl = E.pay(RATE, 2, 0, hDbl);
const tx = E.takeHome({ gross: p1.gross, base: p1.base, status: 'single', state: 'TX' }, PE);
const ca = E.takeHome({ gross: p1.gross, base: p1.base, status: 'single', state: 'CA' }, PE);
const ntHigh = E.noTax(E.qualified(60, 1.5, 0, E.split({ mode: 'total', total: 60, after: null })), 52, 'single', 60 * 40 + 60 * 20 * 1.5, 0, PE);
const hCap = E.split({ mode: 'total', total: 70, after: null }), pCap = E.pay(45, 1.5, 0, hCap), ntCap = E.noTax(E.qualified(45, 1.5, 0, hCap), 52, 'married', pCap.gross, 0, PE);

const faqs = [
  ['How do you calculate overtime pay?', `Multiply your hourly rate by the overtime multiplier (1.5 for time and a half) and by the number of overtime hours, then add your regular pay. At ${m2(RATE)} an hour and ${hh(h1.total)} hours in a week: ${hh(h1.reg)} × ${m2(RATE)} = ${m2(p1.reg)} regular, plus ${hh(h1.ot)} × ${m2(RATE * 1.5)} = ${m2(p1.ot)} overtime, for a total of ${m2(p1.gross)}.`],
  ['What is time and a half, and what is double time?', `Time and a half means overtime hours pay 1.5 times your regular hourly rate (${m2(RATE)} becomes ${m2(RATE * 1.5)}); double time pays 2 times (${m2(RATE * 2)}). Federal law requires time and a half for hours over 40 in a workweek for covered, non-exempt employees; double time comes from state law (such as California), a contract or an employer policy. Choose the multiplier at the top of the calculator, or use the 1.5, 2 and 2.5 buttons.`],
  ['How is overtime calculated in California?', `California counts overtime by the day as well as the week: 1.5 times your regular rate after 8 hours in a day (up to 12), 2 times after 12 hours, and on the seventh consecutive day of the workweek 1.5 times for the first 8 hours and 2 times after that. Hours over 40 regular hours in a week are paid at 1.5 times as well. For ${dayEx.join(', ')} hours Monday to Friday at ${m2(RATE)}, the calculator's California rule gives ${hh(hCA.reg)} regular, ${hh(hCA.ot)} overtime and ${hh(hCA.dt)} double-time hours (${m2(pCA.gross)}), while the federal weekly rule gives ${hh(hFed.reg)} regular and ${hh(hFed.ot)} overtime hours (${m2(pFed.gross)}). Source: California Labor Commissioner's Office.`],
  ['Is overtime taxed more than regular pay?', `No. Overtime is taxed like the rest of your wages. It can look like a bigger bite because payroll withholds as if every paycheck were as large as that week's, so a big overtime check is withheld at a higher rate than usual — but the tax you actually owe for the year depends on your total income, and any over-withholding comes back as a refund. In the example, ${m2(p1.otAmt)} of overtime pay leaves you about ${m2(keep1)} after federal tax, Social Security and Medicare (no state tax).`],
  ['What is the no tax on overtime deduction?', `For tax years 2025 through 2028 you can deduct the overtime premium that federal law requires — generally the "half" in time and a half — up to ${m0(E.CAP.single)} a year (${m0(E.CAP.married)} if you file jointly). The deduction is reduced by $100 for every $1,000 your modified adjusted gross income is over ${m0(E.THR.single)} (${m0(E.THR.married)} joint), and it is available whether you itemize or take the standard deduction. Married people must file jointly. In the example, ${hh(h1.ot)} overtime hours a week at ${m2(RATE)} is a ${m2(q1)} premium a week, ${m0(nt1.annual)} over a year, and about ${m0(nt1.saving)} less federal income tax. Sources: IRS and 26 U.S.C. § 225.`],
  ['Does the no tax on overtime deduction cover Social Security, Medicare and state tax?', `No. It lowers federal income tax only, so Social Security and Medicare tax are still taken from the full overtime check. The calculator shows the federal saving and does not change state tax, because states treat the deduction differently — check your state's rules.`],
  ['Is a bonus included when overtime is calculated?', `Yes, a non-discretionary bonus (one promised for hours, production or staying) is part of your regular rate, so overtime is owed on it too. The federal method divides the bonus by the total hours worked in the week and pays half of that extra rate for each overtime hour. A ${m0(200)} bonus in the ${hh(h1.total)}-hour example adds ${m2(pBon.bonusPrem)} of overtime on top of the bonus itself (total pay ${m2(pBon.gross)}). Enter the bonus under Go advanced. California computes some bonuses differently, so the bonus box is for the federal rule.`],
  ['How many hours before overtime starts?', `Under federal law overtime starts after 40 hours in a workweek for covered employees; some states and employers use a daily limit or a lower weekly one. The calculator's "Overtime starts after" box defaults to 40 and can be changed, and the day-by-day mode applies California's daily rules. A few other states have their own rules; check your state labor department. Employees classified as exempt are not entitled to overtime.`]
];
const title = 'Overtime Calculator — Pay, Take-Home & No Tax on Overtime';
const desc = 'Free overtime calculator: your hourly rate and hours give overtime pay, take-home after tax, California daily rules and the no-tax-on-overtime deduction.';
if (title.length > 60 || desc.length > 158) { console.error('SEO length fail', title.length, desc.length); process.exit(1); }
const url = 'https://calcthis.co/overtime-calculator/';
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
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Overtime Calculator', url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Overtime calculator: overtime pay from your hourly rate and hours (total, regular plus overtime, or day by day with the federal weekly rule or California daily and seventh-day rules), a pay-split picture, take-home pay after federal, state and payroll tax, and the no-tax-on-overtime deduction estimate.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Overtime Calculator', item: url }] };
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
const wsOpts = [['0', 'Sunday'], ['1', 'Monday'], ['2', 'Tuesday'], ['3', 'Wednesday'], ['4', 'Thursday'], ['5', 'Friday'], ['6', 'Saturday']];
const dayFlds = [0, 1, 2, 3, 4, 5, 6].map((i) => `<label class="fld" for="otD${i}"><span class="lab" id="otDL${i}">Day ${i + 1}</span><div class="inp"><input id="otD${i}" type="text" inputmode="decimal" autocomplete="off" placeholder="0"></div></label>`);
const dayGrid = [0, 2, 4].map((i) => `<div class="two">${dayFlds[i]}${dayFlds[i + 1]}</div>`).join('\n          ') + `\n          <div class="two">${dayFlds[6]}</div>`;

const body = `<body class="p-bmr p-avg p-ot">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">Pay · take-home · no tax on overtime</div>
    <h1>Overtime Calculator</h1>
    <p>Enter your <strong>hourly rate and hours</strong> to see your overtime pay, the week's total and what you keep after tax. Type total hours, regular plus overtime hours, or <strong>each day</strong> — with the federal weekly rule or <strong>California's daily rules</strong>. At ${m2(RATE)} an hour, ${hh(h1.total)} hours is <strong>${m2(p1.gross)}</strong>, and the overtime part qualifies for the <strong>no-tax-on-overtime</strong> deduction.</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your pay and hours</h2>
        <div class="modeseg" id="otModeSeg" role="group" aria-label="How to enter hours" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:14px"><button class="on" type="button" data-v="total">Total hours</button><button type="button" data-v="split">Regular + overtime</button><button type="button" data-v="day">Day by day</button></div>
        ${tfld('otRate', 'Hourly rate', '$', 'e.g. 22')}
        <div id="otTotalWrap">${tfld('otTotal', 'Hours worked this week', 'hours', 'e.g. 48')}</div>
        <div id="otSplitWrap" style="display:none"><div class="two">${tfld('otReg', 'Regular hours', 'hours', 'e.g. 40')}${tfld('otOT', 'Overtime hours', 'hours', 'e.g. 8')}</div></div>
        <div id="otDayWrap" style="display:none">
          <div class="ctl-row" style="display:block;margin-bottom:12px"><span class="ctl-lab" style="display:block;margin-bottom:6px">Overtime rule</span><div class="modeseg" id="otRuleSeg" role="group" aria-label="Overtime rule" style="grid-template-columns:1fr 1fr"><button class="on" type="button" data-v="fed">Federal (weekly)</button><button type="button" data-v="ca">California (daily)</button></div></div>
          ${dayGrid}
          <p class="av-note" id="otDayNote"></p>
        </div>
        <div id="otAfterWrap">${tfld('otAfter', 'Overtime starts after', 'hours a week', '40')}</div>
        <div id="otMultWrap">
          ${tfld('otMult', 'Overtime multiplier', '×', '1.5', ' style="margin-bottom:0"')}
          <div class="chips" id="otChips"><button type="button" data-v="1.5">1.5× time and a half</button><button type="button" data-v="2">2× double time</button><button type="button" data-v="2.5">2.5×</button></div>
        </div>
        <p class="av-note" id="otCaMult" style="display:none">California sets the rates: 1.5× for daily overtime and weekly overtime, 2× for double time.</p>
        <p class="av-note" id="otFormatNote">Hours can be decimals (8.5) or h:mm (8:30).</p>
        <div class="res-hint" id="otHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="otAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="otWsWrap" class="fld" style="display:none"><span class="lab">Workweek starts on</span>${csel('otWeekStart', '1', 'Monday', wsOpts)}</div>
          <div id="otBonusWrap">${tfld('otBonus', 'Bonus or extra pay this week', '$', 'e.g. 200')}</div>
          <div class="fld"><span class="lab">Round hours to the nearest</span><div class="modeseg" id="otRoundSeg" role="group" aria-label="Round hours" style="grid-template-columns:repeat(4,1fr)"><button class="on" type="button" data-v="0">Off</button><button type="button" data-v="5">5 min</button><button type="button" data-v="6">6 min</button><button type="button" data-v="15">15 min</button></div></div>
          <div class="fld"><span class="lab">Filing status</span><div class="modeseg" id="otFileSeg" role="group" aria-label="Filing status" style="grid-template-columns:repeat(3,1fr)"><button class="on" type="button" data-v="single">Single</button><button type="button" data-v="married">Married, joint</button><button type="button" data-v="hoh">Head of household</button></div></div>
          <div class="fld"><span class="lab">State income tax</span><div class="csel" id="otState" data-value="">
              <button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="csel-val">Federal taxes only</span>
                ${chev}
              </button>
              <div class="csel-panel" role="listbox"></div>
            </div></div>
          ${tfld('otWeeks', 'Weeks a year you work like this', 'weeks', '52')}
          ${tfld('otMagi', 'Your yearly income (for the overtime deduction)', '$', 'e.g. 60000')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="otAdvBtn" type="button">
            <span id="otAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab">Total pay this week</div>
          <div class="res-big"><span id="otBig">—</span></div>
          <div class="res-sub" id="otSub" data-empty="Enter your hourly rate and the hours you worked.">Enter your hourly rate and the hours you worked.</div>
        </div>
        <div id="otBody" style="display:none">
          <p class="res-tip adv-tip" id="otTip"></p>
          <p class="bm-h">Hours and pay</p>
          <div id="otViz"></div>
          <table class="dtable" id="otPayTbl"></table>
          <div class="proj-sep"></div>
          <p class="bm-h">Take-home after tax</p>
          <table class="dtable" id="otTakeTbl"></table>
          <p class="av-note" id="otTakeNote"></p>
          <table class="dtable ot-per" id="otPerTbl"></table>
          <div class="proj-sep"></div>
          <p class="bm-h">No tax on overtime (2025–2028)</p>
          <table class="dtable" id="otNoTaxTbl"></table>
          <p class="av-note" id="otNoTaxNote"></p>
          <div class="proj-sep"></div>
          <p class="bm-h">The working</p>
          <ul class="ot-steps" id="otSteps"></ul>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="otMLab">Total pay this week</span>
    <div class="mbar-vals"><b id="otMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${pill('/hours-calculator/', 'Hours Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
${pill('/paycheck-calculator/', 'Paycheck Calculator', '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>')}
${pill('/time-calculator/', 'Time Calculator', '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 3h6"/>')}
${pill('/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the overtime calculator</h2>
        <p>Enter your <strong>hourly rate</strong>, then choose how to give the hours. <strong>Total hours</strong> works out the overtime for you from the hours after which it starts (40 a week unless you change it). <strong>Regular + overtime</strong> takes the two numbers as you have them on a pay stub. <strong>Day by day</strong> takes each day's hours and applies the federal weekly rule or California's daily rules.</p>
        <p>Pick the multiplier — 1.5 for time and a half, 2 for double time, or your own — and you get the total pay, a picture of how the hours and the pay split, the take-home after tax, and what the no-tax-on-overtime deduction could save you. Open <strong>Go advanced</strong> to add your state and filing status, a bonus, rounding to 5, 6 or 15 minutes, and the weeks you work like this.</p>

        <h2>The overtime pay formula</h2>
        <div class="formula">
          Total pay = regular hours × rate + overtime hours × rate × multiplier
          <small>TIME AND A HALF = 1.5 · DOUBLE TIME = 2</small>
        </div>
        <p>At ${m2(RATE)} an hour and ${hh(h1.total)} hours in the week: regular ${hh(h1.reg)} × ${m2(RATE)} = <strong>${m2(p1.reg)}</strong>; overtime ${hh(h1.ot)} × (${m2(RATE)} × 1.5) = ${hh(h1.ot)} × ${m2(RATE * 1.5)} = <strong>${m2(p1.ot)}</strong>; total <strong>${m2(p1.gross)}</strong>. At double time the same week is <strong>${m2(pDbl.gross)}</strong>.</p>

        <h2>Federal overtime: the 40-hour rule</h2>
        <p>The federal Fair Labor Standards Act requires overtime pay at not less than time and a half the regular rate for hours over 40 in a workweek, for covered employees. Some employees are exempt from the rule, and your employer may pay more than the minimum. A workweek is a fixed, regularly recurring period of 168 hours — seven consecutive 24-hour periods — that can start on any day, and hours are never averaged over two weeks. Source: <a href="https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay" rel="noopener">U.S. Department of Labor, Fact Sheet #23</a> (revised October 2019).</p>

        <h2>California overtime: daily, weekly and the seventh day</h2>
        <p>California adds daily rules: 1.5× the regular rate after 8 hours in a day up to 12, 2× after 12, and on the seventh consecutive day of the workweek 1.5× for the first 8 hours and 2× after that. The calculator applies them in <strong>Day by day</strong> with the California rule, and counts hours over 40 regular hours a week at 1.5× as well.</p>
        <table class="dtable">
          <thead><tr><th>Hours worked</th><th>Federal</th><th>California</th></tr></thead>
          <tbody>
            <tr><td>Up to 8 in a day</td><td>Regular</td><td>Regular</td></tr>
            <tr><td>8 to 12 in a day</td><td>Regular until 40 a week</td><td>1.5×</td></tr>
            <tr><td>Over 12 in a day</td><td>Regular until 40 a week</td><td>2×</td></tr>
            <tr><td>Over 40 in a week</td><td>1.5×</td><td>1.5×</td></tr>
            <tr><td>Seventh day, first 8 hours</td><td>Regular until 40 a week</td><td>1.5×</td></tr>
            <tr><td>Seventh day, past 8 hours</td><td>Regular until 40 a week</td><td>2×</td></tr>
          </tbody>
        </table>
        <p>Example at ${m2(RATE)} an hour — ${dayEx.slice(0, 5).join(', ')} hours Monday to Friday: California pays ${hh(hCA.reg)} regular + ${hh(hCA.ot)} at 1.5× + ${hh(hCA.dt)} at 2× = <strong>${m2(pCA.gross)}</strong>; the federal weekly rule pays ${hh(hFed.reg)} regular + ${hh(hFed.ot)} at 1.5× = <strong>${m2(pFed.gross)}</strong>. Working eight hours six days and ten on the seventh gives ${hh(h7.reg)} regular + ${hh(h7.ot)} at 1.5× + ${hh(h7.dt)} at 2× = <strong>${m2(p7.gross)}</strong> in California. Source: <a href="https://www.dir.ca.gov/dlse/faq_overtime.htm" rel="noopener">California Labor Commissioner's Office</a>. Other states with their own daily rules are not built in — check your state labor department.</p>
      </div>

      <div>
        <h2>Take-home pay on overtime</h2>
        <p>The take-home table runs the week's check through the same federal and state withholding as our <a href="/paycheck-calculator/">paycheck calculator</a>, with and without the overtime, so you see what the extra hours add after tax. For the ${hh(h1.total)}-hour example that is ${m2(p1.gross)} of pay and ${m2(th1.a.net)} take-home as a single filer with federal tax only — ${m2(keep1)} of the ${m2(p1.otAmt)} overtime pay (${Math.round(keep1 / p1.otAmt * 100)}%). With Texas (no state income tax) it is ${m2(tx.a.net)}, and with California withholding ${m2(ca.a.net)}.</p>
        <p>Overtime is not taxed at a special rate. Payroll treats a big week's check as if every paycheck were that large, so withholding can be higher than the tax you owe for the year; the difference comes back when you file.</p>

        <h2>The no tax on overtime deduction</h2>
        <p>For tax years <strong>2025 through 2028</strong> you can deduct the overtime pay that is more than your regular rate and that federal law requires — in time and a half, the extra half. The most you can deduct is <strong>${m0(E.CAP.single)}</strong> a year (<strong>${m0(E.CAP.married)}</strong> on a joint return), reduced by $100 for each $1,000 of modified adjusted gross income over <strong>${m0(E.THR.single)}</strong> (${m0(E.THR.married)} joint). You need a valid Social Security number, married people must file jointly, and you can take it with the standard deduction or itemizing.</p>
        <table class="dtable">
          <thead><tr><th>Example</th><th>Deduction</th><th>Federal tax saved</th></tr></thead>
          <tbody>
            <tr><td>${m2(RATE)} an hour, ${hh(h1.total)} hours a week, single, 52 weeks</td><td>${m0(nt1.ded)}</td><td>${m0(nt1.saving)}</td></tr>
            <tr><td>$60.00 an hour, 60 hours a week, single, 52 weeks</td><td>${m0(ntHigh.ded)}</td><td>${m0(ntHigh.saving)}</td></tr>
            <tr><td>$45.00 an hour, 70 hours a week, married filing jointly, 52 weeks</td><td>${m0(ntCap.ded)}</td><td>${m0(ntCap.saving)}</td></tr>
          </tbody>
        </table>
        <p>It lowers <strong>federal income tax only</strong>: Social Security and Medicare are still taken from the whole check, and state tax is not changed here. The estimate takes your income as this week's pay × the weeks you enter unless you type your own, and uses the 2026 standard deduction and tax brackets. You claim it on Schedule 1-A; for 2025 employers did not have to show it separately on your W-2, and the IRS explains how to work it out from your pay records. Sources: <a href="https://www.irs.gov/newsroom/what-to-know-about-the-no-tax-on-overtime-deduction" rel="noopener">IRS: What to know about the No Tax on Overtime deduction</a> (March 5, 2026) and <a href="https://www.law.cornell.edu/uscode/text/26/225" rel="noopener">26 U.S.C. § 225</a>.</p>

        <h2>Bonuses and the regular rate</h2>
        <p>A non-discretionary bonus counts as part of your regular rate, so overtime is owed on it. Under Go advanced, the bonus is divided by the week's total hours and half of that extra rate is paid for each overtime hour: ${m0(200)} in the ${hh(h1.total)}-hour example adds ${m2(pBon.bonusPrem)}. Use the <a href="/hours-calculator/">hours calculator</a> to total shifts and breaks first, and the <a href="/percentage-calculator/">percentage calculator</a> for a raise. For a yearly, monthly or hourly figure and take-home pay, use the <a href="/salary-calculator/">salary calculator</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=286"></script>
<script>CalcThis.initOvertimeCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const dir = ROOT + 'overtime-calculator/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '/overtime-calculator/'") ? s : s.replace("  { file: 'hours-calculator/index.html',       slug: '/hours-calculator/' },\n", (mm) => mm + "  { file: 'overtime-calculator/index.html',    slug: '/overtime-calculator/' },\n"));
edit('llms.txt', (lt) => lt.includes('/overtime-calculator/') ? lt : lt.replace(/(- \[Hours Calculator[^\n]*\n)/, (mm) => mm + '- [' + title + '](' + url + '): Free overtime calculator: overtime pay from hourly rate and hours (total, regular plus overtime or day by day with the federal weekly rule or California daily rules), take-home pay after tax, and the no-tax-on-overtime deduction estimate.\n'));
edit('partials/header.html', (s) => s.includes('/overtime-calculator/') ? s : s.replace('          <!--STAXNAV:START-->\n', (mm) => '          <a href="/overtime-calculator/">Overtime</a>\n' + mm));
edit('partials/footer.html', (s) => s.includes('/overtime-calculator/') ? s : s.replace('          <!--STAXFOOT:START-->\n', (mm) => '          <li><a href="/overtime-calculator/">Overtime Calculator</a></li>\n' + mm));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"/overtime-calculator/"') ? s : s.replace('  "/hours-calculator/": {', () => '  "/overtime-calculator/": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/hours-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Overtime Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Hours Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Overtime Calculator", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Overtime Calculator</h3>')) {
    const card = `    <a class="calc" href="/overtime-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="17" r="11" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M16 11v6l4 2.5" stroke="#37503F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 4h6" stroke="#8F5C13" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      <h3>Overtime Calculator</h3>
      <p>Overtime pay from your hourly rate and hours — total, regular plus overtime, or day by day with California's daily rules — with take-home after tax and the no-tax-on-overtime deduction.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('    <a class="calc" href="/tip-calculator/">', () => card + '    <a class="calc" href="/tip-calculator/">');
  }
  if (!h.includes('<a href="/overtime-calculator/">Overtime</a><span>')) h = h.replace(/(          <li><a href="\/paycheck-calculator\/">Paycheck<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="/overtime-calculator/">Overtime</a><span> — pay, take-home and no tax on overtime</span></li>\n');
  return h;
});
edit('hours-calculator/index.html', (h) => h.includes('/overtime-calculator/') ? h : h.replace('Overtime rules differ by employer and location, so check yours.</p>', () => 'Overtime rules differ by employer and location, so check yours. For overtime pay with take-home after tax, California daily rules and the no-tax-on-overtime deduction, use the <a href="/overtime-calculator/">overtime calculator</a>.</p>'));
edit('paycheck-calculator/index.html', (h) => h.includes('/overtime-calculator/') ? h : h.replace('brings gross to $1,045.00 and take-home to $881.58.</p></details>', () => 'brings gross to $1,045.00 and take-home to $881.58. For overtime pay by the day, California daily rules and the no-tax-on-overtime deduction, use the <a href="/overtime-calculator/">overtime calculator</a>.</p></details>'));
