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

const HERO_MAIN = `  <section class="hero">
    <div class="eyebrow">Gross to net, itemized</div>
    <h1>Paycheck Calculator</h1>
    <p>Enter your salary or hourly pay and see your <strong>take-home pay</strong> after <strong>federal income tax, Social Security, Medicare</strong> and your <strong>state tax</strong>. See where every dollar of each paycheck goes, how a raise or a 401(k) changes it, and your pay on every pay schedule at once.</p>
  </section>`;
const CONTENT_MAIN = `  <section class="content">
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
  </section>`;
function bodyFor(o) { return `<body class="p-loan p-pay"${o.bodyAttr || ''}>
<div class="wrap">

${hdr}

${o.hero}

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

${o.content}

${ftr}

</div>

<script src="/assets/app.js?v=170"></script>
<script>CalcThis.initPayCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`; }

// ---------------- page assembly ----------------
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
function headFor(o) {
  return headTop
    .replace(/<title>[^<]*<\/title>/, () => '<title>' + o.title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(o.desc) + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + o.url + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(o.ogTitle || o.title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(o.ogDesc || o.desc) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + o.url + '">');
}
function pageHtml(o) {
  const ld = [o.app, o.faq].concat(o.extraLd || []).map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
  return headFor(o) + ld + '</head>\n' + bodyFor(o);
}
function write(rel, html) {
  const dir = ROOT + rel.replace(/index\.html$/, '');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ROOT + rel, html.replace(/\n/g, '\r\n'));
}

// ---------------- main page: add the by-state link list ----------------
const SLUG = {}; liveCodes.forEach((c) => { if (E.STATES[c].slug) SLUG[c] = E.STATES[c].slug; });
const liveSorted = liveCodes.filter((c) => SLUG[c]).sort((a, b) => (NAMES[a] < NAMES[b] ? -1 : 1));
const stateLinks = (except) => liveSorted.filter((c) => c !== except).map((c) => '<a href="/paycheck-calculator/' + SLUG[c] + '/">' + NAMES[c] + '</a>').join(' · ');
const byState = '\n    <h2 style="margin-top:36px">Paycheck calculator by state</h2>\n    <p class="pc-states">' + stateLinks() + '</p>\n';
const contentMain = CONTENT_MAIN.replace('\n    <h2 style="margin-top:36px">Common questions</h2>', () => byState + '\n    <h2 style="margin-top:36px">Common questions</h2>');

write('paycheck-calculator/index.html', pageHtml({
  title: 'Paycheck Calculator — Take-Home Pay After Taxes | CalcThis',
  desc: 'Free paycheck calculator for salary and hourly pay. See take-home pay after federal income tax, Social Security, Medicare and state tax, with 401(k) and other deductions, overtime, a what-if raise and every pay schedule.',
  ogTitle: 'Paycheck Calculator — Take-Home Pay After Taxes',
  ogDesc: 'See your take-home pay after federal, Social Security, Medicare and state tax — salary or hourly, with deductions, overtime and a what-if raise.',
  url: 'https://calcthis.co/paycheck-calculator/', app: jsonLdApp, faq: jsonLdFaq, hero: HERO_MAIN, content: contentMain
}));
console.log('main page written; live states', nLive, 'pending', pending.length);

// ---------------- state pages ----------------
const FORM = { AL: 'Form A-4', AZ: 'Form A-4', CA: 'Form DE 4', CO: 'Form DR 0004 (optional — without it your federal W-4 is used)', GA: 'Form G-4', IA: 'the IA W-4', IL: 'Form IL-W-4', KY: 'Form K-4', MI: 'Form MI-W4', MN: 'Form W-4MN', MO: 'Form MO W-4', MT: 'Form MW-4', NC: 'Form NC-4', NY: 'Form IT-2104', PA: '', VA: 'Form VA-4' };
const LOCALS = {
  NY: 'New York City and Yonkers residents also pay a local income tax, which this calculator does not include.',
  PA: 'Most Pennsylvania workers also pay a local earned income tax (commonly about 1%) and Philadelphia has its own wage tax; none of these are included here.',
  MI: 'Detroit and some other Michigan cities charge a city income tax, which is not included here.',
  MO: 'St. Louis and Kansas City charge a 1% earnings tax, which is not included here.',
  KY: 'Many Kentucky cities and counties charge an occupational license tax, which is not included here.',
  AL: 'Some Alabama cities and counties charge an occupational tax, which is not included here.',
  CO: 'Denver and a few other Colorado cities charge an occupational privilege tax, which is not included here.'
};
function programsText(S) {
  if (!S.programs || !S.programs.length) return '';
  return S.programs.map((p) => p.name).join(' and ');
}
function fact(c) {
  const S = E.STATES[c], n = NAMES[c];
  const prog = programsText(S);
  switch (c) {
    case 'GA': return 'Georgia withholds a flat 4.99% of annual wages above a standard deduction of $15,000 ($30,000 for married filing jointly), minus $5,000 for each dependent claimed on Form G-4.';
    case 'IL': return 'Illinois withholds a flat 4.95% after subtracting $2,925 for each basic allowance and $1,000 for each additional allowance claimed on Form IL-W-4.';
    case 'MI': return 'Michigan withholds a flat 4.25% after subtracting $5,900 for each exemption claimed on Form MI-W4. There is no standard deduction.';
    case 'NC': return 'North Carolina withholds 4.09% (the 3.99% income tax rate plus 0.1%) of annual wages above a $12,750 standard deduction ($19,125 for head of household), minus $2,500 for each allowance, rounded to the whole dollar.';
    case 'PA': return 'Pennsylvania taxes wages at a flat 3.07% with no standard deduction and no allowances, and employees also pay 0.07% of gross wages toward unemployment compensation. Unlike most states, Pennsylvania does not exempt 401(k) contributions from state income tax.';
    case 'CO': return 'Colorado withholds a flat 4.4% of annual wages above an allowance of $5,500 ($11,000 for married filing jointly), and employees also pay 0.44% of wages toward the state paid family and medical leave program (FAMLI) up to the Social Security wage limit.';
    case 'KY': return 'Kentucky withholds a flat 3.5% of annual wages above a $3,360 standard deduction.';
    case 'IA': return 'Iowa withholds a flat 3.8% of annual wages above $13,000 ($19,500 for head of household, $26,000 for married filing jointly with a spouse who has no earned income), less the allowance amount from the IA W-4.';
    case 'AZ': return 'Arizona withholds the percentage you choose on Form A-4 — 0%, 0.5%, 1%, 1.5%, 2%, 2.5%, 3% or 3.5% of your gross pay — and uses 2.0% if you have not filed one.';
    case 'CA': return 'California uses graduated rates from 1.1% to 14.63% (EDD Method B) after a standard deduction of $5,706 ($11,412 for head of household or married with two or more allowances), less a $168.30 credit for each allowance on Form DE 4. Employees also pay State Disability Insurance of 1.3% of all wages with no wage limit.';
    case 'NY': return 'New York uses graduated annual schedules starting at 3.9% after a $7,400 deduction ($7,950 if married) plus $1,000 for each exemption on Form IT-2104. Employees also pay State Disability Insurance (0.5%, capped at $0.60 a week) and Paid Family Leave (0.432% up to a yearly maximum).';
    case 'VA': return 'Virginia withholds 2%, 3%, 5% and 5.75% on annual wages above an $8,750 standard deduction and $930 for each exemption on Form VA-4.';
    case 'MN': return 'Minnesota withholds 5.35%, 6.8%, 7.85% and 9.85% after subtracting $5,300 for each allowance on Form W-4MN, using separate single and married tables. Employees also pay 0.44% toward Minnesota Paid Leave up to the Social Security wage limit.';
    case 'AL': return 'Alabama withholds 2%, 4% and 5% after a standard deduction that phases down with income, a personal exemption, dependent amounts and — uniquely — the federal income tax already withheld from the paycheck.';
    case 'MO': return 'Missouri withholds 0% up to $1,348 of taxable wages rising to 4.7% above $9,436, after a standard deduction of $16,100 ($24,150 for head of household, $32,200 for married with a spouse who does not work), rounded to the whole dollar.';
    case 'MT': return 'Montana withholds 4.7% on wages above the standard deduction ($16,100 single, $24,150 head of household, $32,200 married with one earner) and 5.65% on wages above $63,600, $95,400 or $127,200 respectively, rounded up to the next dollar.';
    case 'WA': return 'Washington has no state income tax, but employees pay for the state’s Paid Family & Medical Leave program (about 0.81% of wages up to the Social Security limit) and the WA Cares long-term-care fund (0.58% of all wages).';
    default: return n + ' does not tax wages, so your paycheck has only federal income tax, Social Security and Medicare.';
  }
}
function stateExamples(c) {
  const S = E.STATES[c], rows = [];
  [[40000, 'single'], [65000, 'single'], [100000, 'single'], [65000, 'married']].forEach(([a, st]) => {
    const inp = base(a / 26, 26, { fed: { w4: 'new', status: st }, state: { code: c, status: st, allowances: c === 'AZ' ? null : 0, allowances2: 0 } });
    const p = pc(inp);
    rows.push({ a, st, gross: a / 26, fed: p.fed, ss: p.ss, med: p.med + p.addl, state: p.state, prog: p.programTotal, net: p.net });
  });
  return rows;
}
function stateFaqs(c) {
  const n = NAMES[c], S = E.STATES[c], ex = stateExamples(c), e65 = ex[1], none = S.method === 'none', prog = programsText(S);
  const f = [];
  f.push([`How much is taken out of a $65,000 salary in ${n}?`,
    `On a ${m0(65000)} salary paid bi-weekly (${m(65000 / 26)} gross) for a single filer with no allowances, ${n} ${none && !prog ? 'withholds no state income tax' : 'withholds ' + m(e65.state) + ' of state income tax' + (e65.prog > 0 ? ' plus ' + m(e65.prog) + ' of ' + prog : '')}, federal income tax is ${m(e65.fed)}, Social Security ${m(e65.ss)} and Medicare ${m(e65.med)}. Take-home pay is ${m(e65.net)} a paycheck, about ${m0(e65.net * 26)} a year.`]);
  f.push([`Does ${n} tax paychecks differently for married workers?`,
    `Federal withholding does, and ${none ? n + ' has no state income tax to change' : n + ' uses its own married tables or deductions'}. For a ${m0(65000)} salary paid bi-weekly, a married filer in ${n} takes home ${m(ex[3].net)} a paycheck versus ${m(e65.net)} for a single filer.`]);
  f.push([`Which form do I fill out for ${n} withholding?`,
    FORM[c] ? `${n} uses ${FORM[c]}. Under Go advanced the calculator asks for the same details, so your result matches what your employer would withhold.` : (none ? `${n} has no state income tax form because it does not tax wages — only your federal Form W-4 matters.` : `${n} withholding is a flat rate with no state allowance form — only your federal Form W-4 matters for federal tax.`)]);
  f.push([`Does this ${n} calculator include local taxes?`, (LOCALS[c] || 'City, county and school-district taxes are not included.') + ' State and federal figures follow the 2026 official withholding methods.']);
  f.push([`What is my take-home pay on $40,000 or $100,000 in ${n}?`,
    `Single filer, paid bi-weekly: ${m0(40000)} a year gives ${m(ex[0].net)} a paycheck; ${m0(100000)} a year gives ${m(ex[2].net)} a paycheck.`]);
  return f;
}
function stateContent(c, faqs2) {
  const n = NAMES[c], S = E.STATES[c], ex = stateExamples(c);
  const rowsHtml = ex.map((r) => `<tr><td>${m0(r.a)}${r.st === 'single' ? '' : ' married'}</td><td>${m(r.fed)}</td><td>${m(r.ss + r.med)}</td><td>${S.method === 'none' && !r.prog ? '$0.00' : m(r.state + r.prog)}</td><td>${m(r.net)}</td></tr>`).join('');
  return `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How ${n} paycheck tax works</h2>
        <p>${fact(c)}</p>
        <p>${LOCALS[c] || 'City, county and school-district taxes are not included.'}</p>
        <h2>${n} paycheck examples</h2>
        <p>Single filer unless marked, paid bi-weekly in 2026, no extra withholding, no deductions:</p>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Pay</th><th>Federal</th><th>FICA</th><th>${n}</th><th>Net pay</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
        <p>FICA is Social Security plus Medicare.</p>
      </div>
      <div>
        <h2>Use the ${n} calculator</h2>
        <p>The state is already set to <strong>${n}</strong> above. Enter your salary or hourly rate, your pay frequency and filing status, and the result appears as you type. Under <strong>Go advanced</strong> you can match your Form W-4 (new or 2019-or-earlier), add 401(k), insurance and other deductions, enter year-to-date pay and add overtime.</p>
        <p>You also get a bar showing where each paycheck dollar goes, a what-if for a raise or a bigger 401(k), and your pay on all ten schedules. This is an estimate of withholding, not payroll or tax advice.</p>
        <h2>Other states</h2>
        <p class="pc-states">${stateLinks(c)}</p>
        <p>More states are being added as each official formula is checked. For any other state, the <a href="/paycheck-calculator/">main paycheck calculator</a> shows federal tax and FICA.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions about ${n} paychecks</h2>
${faqs2.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
}
let nState = 0;
liveSorted.forEach((c) => {
  const n = NAMES[c], url = 'https://calcthis.co/paycheck-calculator/' + SLUG[c] + '/', f2 = stateFaqs(c), e65 = stateExamples(c)[1];
  const app = Object.assign({}, jsonLdApp, { name: n + ' Paycheck Calculator', url, description: n + ' paycheck calculator for salary and hourly pay: federal income tax, Social Security, Medicare' + (E.STATES[c].method === 'none' ? '' : ', ' + n + ' state tax') + ', deductions and overtime.' });
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f2.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' },
    { '@type': 'ListItem', position: 2, name: 'Paycheck Calculator', item: 'https://calcthis.co/paycheck-calculator/' },
    { '@type': 'ListItem', position: 3, name: n, item: url }] };
  const hero = `  <section class="hero">
    <div class="eyebrow">${n} · 2026 tax rates</div>
    <h1>${n} Paycheck Calculator</h1>
    <p>See your <strong>${n} take-home pay</strong> after <strong>federal income tax, Social Security, Medicare</strong>${E.STATES[c].method === 'none' ? (E.STATES[c].programs ? ' and the state’s employee-paid programs' : ' — ' + n + ' has no state income tax') : ' and <strong>' + n + ' state tax</strong>'}. On a ${m0(65000)} salary paid bi-weekly a single filer takes home about <strong>${m(e65.net)}</strong> a paycheck.</p>
  </section>`;
  write('paycheck-calculator/' + SLUG[c] + '/index.html', pageHtml({
    title: n + ' Paycheck Calculator 2026 — Take-Home Pay After Tax | CalcThis',
    desc: 'Free ' + n + ' paycheck calculator. Salary or hourly take-home pay after federal tax, Social Security, Medicare' + (E.STATES[c].method === 'none' ? '' : ' and ' + n + ' state tax') + ', with 401(k) deductions, overtime and every pay schedule.',
    ogTitle: n + ' Paycheck Calculator 2026', url, app, faq, extraLd: [crumbs], hero, content: stateContent(c, f2), bodyAttr: ' data-state="' + c + '"'
  }));
  nState++;
});
console.log('state pages written', nState);

// ---------------- sitemap (idempotent) ----------------
(function () {
  const f = ROOT + 'sitemap.xml'; let sm = fs.readFileSync(f, 'utf8'); const crlf = sm.includes('\r\n'); sm = sm.replace(/\r\n/g, '\n');
  const today = new Date().toISOString().slice(0, 10); let add = '';
  liveSorted.forEach((c) => { const u = 'https://calcthis.co/paycheck-calculator/' + SLUG[c] + '/'; if (!sm.includes('<loc>' + u + '</loc>')) add += '  <url>\n    <loc>' + u + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n'; });
  if (add) { sm = sm.replace('</urlset>', () => add + '</urlset>'); fs.writeFileSync(f, crlf ? sm.replace(/\n/g, '\r\n') : sm); console.log('sitemap: added', (add.match(/<url>/g) || []).length); }
  // llms.txt: keep a "Paycheck calculators by state" section current
  const lf = ROOT + 'llms.txt'; let lt = fs.readFileSync(lf, 'utf8'); const lcrlf = lt.includes('\r\n'); lt = lt.replace(/\r\n/g, '\n');
  lt = lt.replace(/\n## Paycheck calculators by state\n[\s\S]*?(?=\n## |$)/, '');
  lt = lt.trimEnd() + '\n\n## Paycheck calculators by state\n' + liveSorted.map((c) => '- [' + NAMES[c] + ' Paycheck Calculator](https://calcthis.co/paycheck-calculator/' + SLUG[c] + '/): take-home pay after federal tax, FICA' + (E.STATES[c].method === 'none' ? '' : ' and ' + NAMES[c] + ' state tax') + '.').join('\n') + '\n';
  fs.writeFileSync(lf, lcrlf ? lt.replace(/\n/g, '\r\n') : lt);
})();
console.log(JSON.stringify({ ex1: ex1.net, ex2: ex2.net, ex3: ex3.net, exM: exM.fed, ex401: ex401.net, ssStop, jan: big[0].net, dec: big[11].net, exH: exH.net, exOT: exOT.net }));

// ---------------- nav + footer: "Paycheck Calculators" section (partials) ----------------
(function () {
  function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('partial updated', rel); } }
  const hdrLinks = '          <a href="/paycheck-calculator/">All states (federal + FICA)</a>\n' + liveSorted.map((c) => '          <a href="/paycheck-calculator/' + SLUG[c] + '/">' + NAMES[c] + '</a>').join('\n') + '\n';
  const hdrBlock = '<!--PAYNAV:START-->\n        <div class="menu-col">\n          <span class="menu-col-head">Paycheck Calculators</span>\n' + hdrLinks + '        </div>\n        <!--PAYNAV:END-->';
  edit('partials/header.html', (s) => {
    if (s.includes('<!--PAYNAV:START-->')) return s.replace(/<!--PAYNAV:START-->[\s\S]*?<!--PAYNAV:END-->/, () => hdrBlock);
    s = s.replace('          <a href="/paycheck-calculator/">Paycheck</a>\n        </div>\n', () => '        </div>\n        ' + hdrBlock + '\n');
    return s;
  });
  const ftrLinks = '          <li><a href="/paycheck-calculator/">All states</a></li>\n' + liveSorted.map((c) => '          <li><a href="/paycheck-calculator/' + SLUG[c] + '/">' + NAMES[c] + '</a></li>').join('\n') + '\n';
  const ftrBlock = '<!--PAYFOOT:START-->\n      <div class="footer-col">\n        <button class="footer-col-btn" aria-expanded="false" type="button">\n          <span class="fttl"><span class="ft1">Paycheck</span> <span class="ft2">Calculators</span></span>\n          <svg class="footer-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>\n        </button>\n        <ul class="footer-links">\n' + ftrLinks + '        </ul>\n      </div>\n      <!--PAYFOOT:END-->';
  edit('partials/footer.html', (s) => {
    if (s.includes('<!--PAYFOOT:START-->')) return s.replace(/<!--PAYFOOT:START-->[\s\S]*?<!--PAYFOOT:END-->/, () => ftrBlock);
    s = s.replace('          <li><a href="/paycheck-calculator/">Paycheck Calculator</a></li>\n        </ul>\n      </div>\n', () => '        </ul>\n      </div>\n\n      ' + ftrBlock + '\n');
    return s;
  });
  edit('assets/style.css', (s) => {
    if (s.includes('/* PAYNAV */')) return s;
    s = s.replace('.menu-cols{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 4px;min-width:560px}', () => '.menu-cols{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0 4px;min-width:760px}');
    s = s.replace('  @media(max-width:520px){\n    .menu-cols{grid-template-columns:1fr;min-width:220px}', () => '  /* PAYNAV */\n  @media(max-width:880px){.menu-cols{grid-template-columns:1fr 1fr;min-width:440px}}\n  @media(max-width:520px){\n    .menu-cols{grid-template-columns:1fr;min-width:220px}');
    s = s.replace('    grid-template-columns:repeat(6,1fr);\n    gap:24px;\n    max-width:1040px;', () => '    grid-template-columns:repeat(7,1fr);\n    gap:18px;\n    max-width:1120px;');
    return s;
  });
})();

// ---------------- homepage: "Paycheck" tab with one cube (flag) per live state ----------------
(function () {
  const f = ROOT + 'index.html'; let h = fs.readFileSync(f, 'utf8'); const crlf = h.includes('\r\n'); h = h.replace(/\r\n/g, '\n'); const o = h;
  const allIco = '<svg width="30" height="30" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="2.5" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><circle cx="16" cy="16" r="3.6" fill="#B5761F"/><path d="M8 12h3M21 20h3" stroke="#37503F" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const cubes = '<!--PAYCUBES:START-->\n    <div class="st-cubes">\n      <a class="st-cube st-all" href="/paycheck-calculator/"><span class="st-ico" aria-hidden="true">' + allIco + '</span><span class="st-name">All states</span></a>\n'
    + liveSorted.map((c) => '      <a class="st-cube" href="/paycheck-calculator/' + SLUG[c] + '/"><img src="/assets/flags/' + c.toLowerCase() + '.webp" width="60" height="40" alt="Flag of ' + NAMES[c] + '" loading="lazy"><span class="st-name">' + NAMES[c] + '</span></a>').join('\n')
    + '\n    </div>\n    <!--PAYCUBES:END-->';
  if (h.includes('<!--PAYCUBES:START-->')) h = h.replace(/<!--PAYCUBES:START-->[\s\S]*?<!--PAYCUBES:END-->/, () => cubes);
  else {
    h = h.replace(/(<button class="cat-tab" type="button" data-cat="finance"[^>]*>[^<]*<br>[^<]*<\/button>)/, (m) => m + '\n    <button class="cat-tab" type="button" data-cat="paycheck" role="tab" aria-selected="false">Paycheck<br>Calculators</button>');
    const a = h.indexOf('<section id="grp-finance"'); const b = h.indexOf('</section>', a) + '</section>'.length;
    const sec = '\n\n  <section id="grp-paycheck" class="cat-grp cat-grp--hidden" aria-label="Paycheck calculators by state">\n    <p class="st-lead">Pick your state for a paycheck calculator with its own tax rules — take-home pay after federal tax, Social Security, Medicare and state tax.</p>\n    ' + cubes + '\n  </section>';
    h = h.slice(0, b) + sec + h.slice(b);
    h = h.replace("finance:document.getElementById('grp-finance')", () => "finance:document.getElementById('grp-finance'),paycheck:document.getElementById('grp-paycheck')");
  }
  if (h !== o) { fs.writeFileSync(f, crlf ? h.replace(/\n/g, '\r\n') : h); console.log('homepage updated'); }
  const C = ROOT + 'assets/style.css'; let c = fs.readFileSync(C, 'utf8');
  if (!c.includes('.st-cubes')) fs.appendFileSync(C, [
    "  .st-lead{color:var(--ink-soft);font-size:15px;line-height:1.55;margin:0 0 16px;max-width:720px}",
    "  .st-cubes{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}",
    "  .st-cube{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:118px;padding:14px 10px;background:var(--card);border:1px solid var(--line);border-radius:14px;text-decoration:none;color:var(--ink);transition:.14s}",
    "  .st-cube:hover{border-color:var(--amber);box-shadow:0 4px 14px rgba(36,26,17,.08);transform:translateY(-1px)}",
    "  .st-cube img{display:block;width:60px;height:40px;border-radius:4px;box-shadow:0 0 0 1px rgba(36,26,17,.12)}",
    "  .st-cube .st-ico{display:flex;align-items:center;justify-content:center;width:60px;height:40px}",
    "  .st-cube .st-name{font-family:'Fraunces',serif;font-weight:600;font-size:15px;text-align:center;line-height:1.25}",
    "  @media(max-width:430px){.st-cubes{grid-template-columns:repeat(2,minmax(0,1fr))}}", ''].join('\n'));
})();
