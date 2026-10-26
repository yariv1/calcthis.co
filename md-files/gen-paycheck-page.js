const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates paycheck-calculator/index.html (SEO text and FAQ numbers are computed from the engine in assets/app.js).
   Run: node md-files/gen-paycheck-page.js   then   node build.js */
global.CalcThis = {};
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
const eng = app.slice(app.indexOf('/* PAY-ENGINE:START */'), app.indexOf('/* PAY-STATES:END */') + '/* PAY-STATES:END */'.length);
eval(eng);
const E = CalcThis.payEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const auto = nl(fs.readFileSync(ROOT + 'auto-loan-calculator/index.html', 'utf8'));
const hdr = auto.slice(auto.indexOf('<!--HEADER:START-->'), auto.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = auto.slice(auto.indexOf('<!--FOOTER:START-->'), auto.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = auto.slice(0, auto.indexOf('<script type="application/ld+json">'));

const m = (x) => (x < 0 ? '−' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m0 = (x) => (x < 0 ? '−' : '') + '$' + Math.abs(Math.round(x)).toLocaleString('en-US');
function pc(o) { return E.paycheck(o); }
function base(gross, ppy, extra) { return Object.assign({ gross, ppy, ytd: 0, fed: { w4: 'new', status: 'single' } }, extra || {}); }

// worked examples
const ex1 = pc(base(65000 / 26, 26));
const ex2 = pc(base(65000 / 26, 26, { state: { code: 'CA', status: 'single', allowances: 0 } }));
const ex3 = pc(base(65000 / 26, 26, { state: { code: 'NY', status: 'single', allowances: 0 } }));
const exM = pc(base(65000 / 26, 26, { fed: { w4: 'new', status: 'married' } }));
const ex401 = pc(base(65000 / 26, 26, { preTax: [{ amt: 65000 / 26 * 0.06, inc: true, fica: false, kind: '401k' }] }));
// 250k monthly — Social Security stops
let ssStop = -1, big = [];
for (let k = 0; k < 12; k++) { const q = pc(base(250000 / 12, 12, { ytd: 250000 / 12 * k })); big.push(q); if (ssStop < 0 && q.ss < 250000 / 12 * 0.062 - 0.005) ssStop = k; }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hourWeekly = 22 * 40, hourAnnual = hourWeekly * 52;
const exH = pc(base(hourAnnual / 52, 52));
const otWeekly = 22 * 40 + 22 * 1.5 * 5;
const exOT = pc(base(otWeekly, 52));

const liveCodes = Object.keys(E.STATES).filter((c) => E.STATES[c].method !== 'pending');
const NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
const liveWithTax = liveCodes.filter((c) => E.STATES[c].method !== 'none').map((c) => NAMES[c]).sort();
const noTax = liveCodes.filter((c) => E.STATES[c].method === 'none').map((c) => NAMES[c]).sort();
const listAnd = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const pending = Object.keys(NAMES).filter((c) => liveCodes.indexOf(c) < 0).map((c) => NAMES[c]).sort();
const nLive = liveCodes.length;

const faqs = [
  ['How is my paycheck calculated?', `Take-home pay = gross pay − before-tax deductions − federal income tax − Social Security − Medicare − state income tax − after-tax deductions. On a ${m0(65000)} salary paid bi-weekly (${m(65000 / 26)} gross) for a single filer in a state with no income tax, federal tax is ${m(ex1.fed)}, Social Security ${m(ex1.ss)} and Medicare ${m(ex1.med)}, so you take home ${m(ex1.net)} a paycheck (${m0(ex1.net * 26)} a year).`],
  ['How much is taken out of a $65,000 salary in California or New York?', `On the same ${m0(65000)} bi-weekly salary (single, no extra allowances), California withholds ${m(ex2.state)} in income tax plus ${m(ex2.programTotal)} of State Disability Insurance, leaving ${m(ex2.net)} a paycheck. New York withholds ${m(ex3.state)} in income tax plus ${m(ex3.programTotal)} of disability and paid family leave, leaving ${m(ex3.net)}. Pick your state to see yours.`],
  ['Does a 401(k) lower my paycheck taxes?', `A traditional 401(k) lowers your federal and most state income tax but not Social Security or Medicare. Putting 6% of the ${m0(65000)} salary (${m(65000 / 26 * 0.06)} a paycheck) into a 401(k) lowers take-home only from ${m(ex1.net)} to ${m(ex401.net)} — ${m(ex1.net - ex401.net)} less, because federal tax drops from ${m(ex1.fed)} to ${m(ex401.fed)}. Type “6%” in the 401(k) field under Go advanced to try it.`],
  ['When does Social Security tax stop?', `Social Security (6.2%) is withheld only on the first ${m0(E.SS_BASE)} of wages in 2026. On a ${m0(250000)} salary paid monthly you pay it through ${MONTHS[ssStop - 1]} and part of ${MONTHS[ssStop]}, then it stops and your take-home jumps — ${m(big[0].net)} in January versus ${m(big[11].net)} in December. The yearly chart under your result marks the paycheck where it stops.`],
  ['Does the calculator work for hourly pay and overtime?', `Yes — switch to Hourly. At $22 an hour for 40 hours a week your gross is ${m(hourWeekly)} a week (${m0(hourAnnual)} a year) and you take home ${m(exH.net)} a week as a single filer with no state tax. Under Go advanced, add overtime hours: 5 hours a week at 1.5× brings gross to ${m(otWeekly)} and take-home to ${m(exOT.net)}.`]
];

const jsonLdApp = {
  '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Paycheck Calculator', url: 'https://calcthis.co/paycheck-calculator/', applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Paycheck calculator for salary and hourly pay: federal income tax (2020+ and older W-4), Social Security, Medicare, state income tax, deductions and overtime, with a take-home breakdown and what-if comparison.'
};
const jsonLdFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };

const freqOpts = [['daily', 'Daily'], ['weekly', 'Weekly'], ['weekly53', 'Weekly (53 paychecks)'], ['biweekly', 'Bi-weekly'], ['biweekly27', 'Bi-weekly (27 paychecks)'], ['semimonthly', 'Semi-monthly'], ['monthly', 'Monthly'], ['quarterly', 'Quarterly'], ['semiannual', 'Semi-annually'], ['annual', 'Annually']];
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
function csel(id, val, label, opts) {
  return `<div class="csel" id="${id}" data-value="${val}">
              <button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="csel-val">${label}</span>
                ${chev}
              </button>
              <div class="csel-panel" role="listbox">
${opts.map((o) => `                <button type="button" class="csel-opt${o[0] === val ? ' on' : ''}" role="option" aria-selected="${o[0] === val}" data-value="${o[0]}">${o[1]}</button>`).join('\n')}
              </div>
            </div>`;
}
const fld = (id, label, unit, ph) => `<div class="fld"><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></div>`;
const chk = (id, text) => `<label class="dc-check" for="${id}"><input type="checkbox" id="${id}"><span>${text}</span></label>`;

const body = `<body class="p-loan p-pay">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">Gross to net, itemized</div>
    <h1>Paycheck Calculator</h1>
    <p>Enter your salary or hourly pay and see your <strong>take-home pay</strong> after <strong>federal income tax, Social Security, Medicare</strong> and your <strong>state tax</strong>. See where every dollar of each paycheck goes, how a raise or a 401(k) changes it, and your pay on every pay schedule at once.</p>
  </section>

  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your paycheck</h2>

        <div class="modeseg" id="pcModeSeg" role="group" aria-label="Pay type">
          <button class="on" type="button" data-v="salary">Salary</button>
          <button type="button" data-v="hourly">Hourly</button>
        </div>

        <div id="pcSalBox">
          <div class="fld"><label class="lab" for="pcGross">Pay <span class="unit">$</span></label><div class="inp"><input id="pcGross" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 65000"><span class="len-toggle" id="pcUnitSeg"><button type="button" class="on" data-v="year">per year</button><button type="button" data-v="period">per paycheck</button></span></div></div>
        </div>
        <div id="pcHourBox" style="display:none">
          <div class="ln-two">
            ${fld('pcRate', 'Hourly rate', '$', 'e.g. 22')}
            ${fld('pcHours', 'Hours per week', '', 'e.g. 40')}
          </div>
        </div>

        <div class="fld"><span class="lab">Pay frequency</span>${csel('pcFreq', 'biweekly', 'Bi-weekly', freqOpts)}</div>
        <div class="fld"><span class="lab">State</span><div class="csel" id="pcState" data-value="">
              <button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="csel-val">Federal taxes only</span>
                ${chev}
              </button>
              <div class="csel-panel" role="listbox"></div>
            </div></div>
        <div class="fld"><span class="lab">Filing status</span>${csel('pcStatus', 'single', 'Single or married filing separately', [['single', 'Single or married filing separately'], ['married', 'Married filing jointly'], ['hoh', 'Head of household']])}</div>

        <p class="add-note ln-hint" id="pcHint" style="display:none"></p>

        <div class="chips" aria-label="Try an example">
          <button type="button" id="pcEx">See an example: $65,000 a year, bi-weekly</button>
        </div>

        <div id="pcAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="fc-grp" style="margin-top:0">Federal Form W-4</div>
          <div class="fld"><span class="lab">Which W-4 form</span><span class="seg" id="pcW4Seg" role="group" aria-label="Form W-4 version"><button class="on" type="button" data-v="new">2020 or later</button><button type="button" data-v="old">2019 or earlier</button></span></div>
          <div id="pcW4New">
            ${chk('pcStep2', 'Step 2: two jobs, or spouse also works (box checked)')}
            ${fld('pcCredit', 'Step 3 dependents amount', '$', 'e.g. 2000')}
            <div class="ln-two">
              ${fld('pc4a', 'Step 4(a) other income', '$', 'e.g. 1000')}
              ${fld('pc4b', 'Step 4(b) deductions', '$', 'e.g. 5000')}
            </div>
            <p class="add-note" style="margin:-4px 0 12px">Steps 3, 4(a) and 4(b) are yearly amounts from your Form W-4.</p>
          </div>
          <div id="pcW4Old" style="display:none">
            ${fld('pcAllow', 'Allowances (line 5 of the old form)', '', 'e.g. 2')}
          </div>
          ${fld('pcFedExtra', 'Extra federal withholding', '$ per paycheck', 'e.g. 25')}

          <div id="pcStGrp">
            <div class="fc-grp">State withholding form</div>
            <div class="fld" id="pcStAllowFld"><label class="lab" id="pcStAllowLab" for="pcStAllow">Allowances <span class="unit">number</span></label><div class="inp"><input id="pcStAllow" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 2"></div></div>
            <div class="fld" id="pcStAllow2Fld"><label class="lab" id="pcStAllow2Lab" for="pcStAllow2">Additional allowances <span class="unit">number</span></label><div class="inp"><input id="pcStAllow2" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 1"></div></div>
            <div id="pcStExtraFld">${fld('pcStExtra', 'Extra state withholding', '$ per paycheck', 'e.g. 10')}</div>
          </div>

          <div class="fc-grp">Before-tax deductions <span style="text-transform:none;letter-spacing:0;font-weight:500">— type 6% for a share of pay</span></div>
          ${fld('pc401k', '401(k), 403(b) or 457 (traditional)', '$ or %', 'e.g. 200')}
          ${fld('pcHealth', 'Health, dental and vision insurance', '$ per paycheck', 'e.g. 150')}
          ${fld('pcHsa', 'HSA, FSA or commuter', '$ per paycheck', 'e.g. 50')}
          ${fld('pcPreOther', 'Other before-tax (income tax only)', '$ per paycheck', 'e.g. 25')}

          <div class="fc-grp">After-tax deductions</div>
          ${fld('pcRoth', 'Roth 401(k) or Roth IRA', '$ or %', 'e.g. 100')}
          ${fld('pcPostOther', 'Other after-tax (union dues, garnishment…)', '$ per paycheck', 'e.g. 30')}

          <div class="fc-grp">Year to date</div>
          ${fld('pcYtd', 'Gross pay already paid this year', '$ optional', 'e.g. 30000')}

          <div id="pcOtGrp" style="display:none">
            <div class="fc-grp">Overtime</div>
            <div class="ln-two">
              ${fld('pcOtHours', 'Overtime hours per week', '', 'e.g. 5')}
              ${fld('pcOtMult', 'Overtime pay rate', '× normal', 'e.g. 1.5')}
            </div>
          </div>

          <div class="fc-grp">Exemptions and rounding</div>
          ${chk('pcExFed', 'Exempt from federal income tax withholding')}
          ${chk('pcExSS', 'Exempt from Social Security')}
          ${chk('pcExMed', 'Exempt from Medicare')}
          <div id="pcExStateFld">${chk('pcExState', 'Exempt from state income tax withholding')}</div>
          ${chk('pcRound', 'Round federal withholding to the nearest dollar')}
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="pcAdvBtn" type="button">
            <span id="pcAdvBtnLab">Go advanced</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="pcResLab">Take-home pay</div>
          <div class="res-big" id="pcResBig">—</div>
          <div class="res-sub" id="pcResSub">Enter your pay to see your take-home pay.</div>
        </div>

        <div id="pcResults" style="display:none">
          <p class="res-tip adv-tip" id="pcTip"></p>
          <p class="res-tip adv-tip" id="pcStateNote" style="display:none"></p>

          <div class="fc-grp">Where each paycheck dollar goes</div>
          <div class="ln-bar" id="pcBar"></div>
          <div class="ln-leg" id="pcBarLeg"></div>

          <table class="dtable ln-terms" id="pcTable"></table>

          <div class="fc-grp">What if…</div>
          <div class="ln-two">
            ${fld('pcWiRaise', 'I get a raise of', '%', 'e.g. 5')}
            ${fld('pcWiK', 'I add to my 401(k)', '% of pay', 'e.g. 6')}
          </div>
          <p class="res-tip" id="pcWiOut">Type a raise or a 401(k) percentage to see how your take-home changes.</p>

          <div id="pcCapWrap" style="display:none">
            <div class="fc-grp">Your take-home through the year</div>
            <div class="ln-box" id="pcCapBox"></div>
            <div class="ln-leg" id="pcCapLeg"></div>
          </div>

          <div class="fc-grp">Your pay on every schedule</div>
          <table class="dtable ln-terms" id="pcFreq2"></table>

          <div class="fc-grp">Assumptions used</div>
          <ul class="pc-assume" id="pcAssume"></ul>

          <div id="pcCopyWrap" style="display:none"><button class="btn" id="pcCopy" type="button" style="margin-top:6px">Copy results</button></div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="pcMLab">Take-home pay</span>
    <div class="mbar-vals"><b id="pcMVal">—</b><span id="pcMDec"></span></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
      <a class="pill" href="/hours-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        Hours Calculator
      </a>
      <a class="pill" href="/percentage-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>
        Percentage Calculator
      </a>
      <a class="pill" href="/mortgage-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>
        Mortgage Calculator
      </a>
      <a class="pill" href="/loan-calculator/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/></svg>
        Loan Calculator
      </a>
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the paycheck calculator</h2>
        <p>Choose <strong>Salary</strong> or <strong>Hourly</strong>, type your pay, pick your <strong>pay frequency</strong>, <strong>state</strong> and <strong>filing status</strong>, and your take-home pay appears as you type. For a salary you can enter the yearly amount or the amount of one paycheck. Under <strong>Go advanced</strong> you can match your Form W-4 exactly, add 401(k), insurance and other deductions, enter year-to-date pay and exempt yourself from individual taxes.</p>
        <p>The result shows each paycheck dollar as a bar, an itemized table per paycheck and per year, what a raise or a bigger 401(k) would change, your take-home on all ten pay schedules, and a list of the assumptions behind the numbers.</p>

        <h2>How your paycheck is worked out</h2>
        <div class="formula">
          Take-home = gross − before-tax deductions − federal tax − Social Security − Medicare − state tax − after-tax deductions
          <small>2026 TAX RATES</small>
        </div>
        <p>On a <strong>${m0(65000)}</strong> salary paid bi-weekly (<strong>${m(65000 / 26)}</strong> gross) for a single filer with no state income tax: federal income tax <strong>${m(ex1.fed)}</strong>, Social Security <strong>${m(ex1.ss)}</strong>, Medicare <strong>${m(ex1.med)}</strong> — a take-home of <strong>${m(ex1.net)}</strong> a paycheck, or ${m0(ex1.net * 26)} a year.</p>

        <h2>Federal income tax and your W-4</h2>
        <p>Your employer withholds federal income tax from the IRS percentage method in Publication 15-T. It takes your paycheck, scales it to a year, subtracts the standard-deduction-style amount built into the W-4 (${m0(8600)} for most filers, ${m0(12900)} for married filing jointly), looks up the tax bracket and divides back to one paycheck. A married filer on the same salary has ${m(exM.fed)} withheld instead of ${m(ex1.fed)}. If your W-4 is from 2019 or earlier, switch to “2019 or earlier” under Go advanced and enter your allowances — each one is worth ${m0(4300)} of wages.</p>

        <h2>Social Security and Medicare</h2>
        <p>Social Security takes 6.2% of wages up to ${m0(E.SS_BASE)} in 2026 and Medicare takes 1.45% of everything, plus an extra 0.9% on wages above $200,000. On a ${m0(250000)} salary paid monthly, Social Security stops after ${MONTHS[ssStop - 1]} and part of ${MONTHS[ssStop]}, so take-home jumps from ${m(big[0].net)} in January to ${m(big[11].net)} in December. The chart under your result marks that paycheck.</p>
      </div>

      <div>
        <h2>State income tax</h2>
        <p>${listAnd(noTax)} have no state income tax on wages, so only federal tax and FICA apply${noTax.indexOf('Washington') >= 0 ? ' (Washington still has employee-paid paid-family-leave and long-term-care premiums, which the calculator includes)' : ''}. This calculator computes state withholding from each state’s official 2026 formula for <strong>${listAnd(liveWithTax)}</strong>. For the other states the result shows federal tax and FICA only and says so — it never guesses a state rate. We are adding more states as each official formula is checked: ${listAnd(pending)}.</p>
        <p>City, county and school-district taxes are not included.</p>

        <h2>Before-tax and after-tax deductions</h2>
        <p>A traditional 401(k) lowers your federal and most state income tax but not Social Security or Medicare. Health, dental and vision premiums and HSA or FSA contributions through payroll lower both. Roth contributions and union dues come out after tax and change nothing about your taxes. With 6% of the ${m0(65000)} salary going into a 401(k), take-home falls only ${m(ex1.net - ex401.net)} a paycheck because federal tax drops by ${m(ex1.fed - ex401.fed)}. Type <strong>6%</strong> instead of a dollar amount to enter a share of pay.</p>

        <h2>Hourly pay and overtime</h2>
        <p>Switch to Hourly, enter your rate and hours per week and pick how often you are paid. At $22 an hour for 40 hours your gross is ${m(hourWeekly)} a week. Under Go advanced, add overtime hours and the pay multiplier: 5 hours a week at 1.5× lifts gross to ${m(otWeekly)} and take-home to ${m(exOT.net)}.</p>

        <h2>What it does not include</h2>
        <p>This is an estimate of withholding for 2026, not payroll or tax advice. Your employer’s payroll system, local taxes, other withholdings and your final tax return can differ. Employer-paid taxes are not part of your paycheck.</p>

        <h2>Related tools</h2>
        <p>Working out pay from hours? Use the <a href="/hours-calculator/">Hours Calculator</a>. Planning a big purchase? Try the <a href="/mortgage-calculator/">Mortgage</a>, <a href="/loan-calculator/">Loan</a> or <a href="/auto-loan-calculator/">Auto Loan</a> calculators.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=170"></script>
<script>CalcThis.initPayCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;

const head = headTop
  .replace(/<title>[^<]*<\/title>/, '<title>Paycheck Calculator — Take-Home Pay After Taxes | CalcThis</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Free paycheck calculator for salary and hourly pay. See take-home pay after federal income tax, Social Security, Medicare and state tax, with 401(k) and other deductions, overtime, a what-if raise and every pay schedule.">')
  .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://calcthis.co/paycheck-calculator/">')
  .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="Paycheck Calculator — Take-Home Pay After Taxes">')
  .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="See your take-home pay after federal, Social Security, Medicare and state tax — salary or hourly, with deductions, overtime and a what-if raise.">')
  .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="https://calcthis.co/paycheck-calculator/">');
const out = head + '<script type="application/ld+json">\n' + JSON.stringify(jsonLdApp, null, 2) + '\n</script>\n<script type="application/ld+json">\n' + JSON.stringify(jsonLdFaq, null, 2) + '\n</script>\n</head>\n' + body;
fs.mkdirSync(ROOT + 'paycheck-calculator', { recursive: true });
fs.writeFileSync(ROOT + 'paycheck-calculator/index.html', out.replace(/\n/g, '\r\n'));
console.log('page written', out.length, 'live states', nLive, 'pending', pending.length);
console.log(JSON.stringify({ ex1: ex1.net, ex2: ex2.net, ex3: ex3.net, exM: exM.fed, ex401: ex401.net, ssStop, jan: big[0].net, dec: big[11].net, exH: exH.net, exOT: exOT.net }));
