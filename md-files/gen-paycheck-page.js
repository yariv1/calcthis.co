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
const exKids = pc(base(65000 / 26, 26, { fed: { w4: 'new', status: 'single', credit: 2 * E.CHILD_CREDIT } }));
const exLocal = pc(base(65000 / 26, 26, { localPct: 1.5 }));
const exMo65 = pc(base(65000 / 12, 12)), exMo100 = pc(base(100000 / 12, 12)), exMo40 = pc(base(40000 / 12, 12));

const liveCodes = Object.keys(E.STATES).filter((c) => E.STATES[c].method !== 'pending');
const NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
const liveWithTax = liveCodes.filter((c) => E.STATES[c].method !== 'none').map((c) => NAMES[c]).sort();
const noTax = liveCodes.filter((c) => E.STATES[c].method === 'none').map((c) => NAMES[c]).sort();
const listAnd = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const pending = Object.keys(NAMES).filter((c) => liveCodes.indexOf(c) < 0).map((c) => NAMES[c]).sort();
const nLive = liveCodes.length;

const faqs = [
  ['What is a take home pay calculator?', `A take home pay calculator turns your gross pay (what you earn before anything is taken out) into your net pay — the amount that reaches your bank account. It subtracts federal income tax, Social Security, Medicare, state income tax and any deductions you choose, such as a 401(k) or health insurance. Enter your pay above and the take home pay shows up as you type, per paycheck and per year.`],
  ['How is my paycheck calculated?', `Take-home pay = gross pay − before-tax deductions − federal income tax − Social Security − Medicare − state income tax − after-tax deductions. On a ${m0(65000)} salary paid bi-weekly (${m(65000 / 26)} gross) for a single filer in a state with no income tax, federal tax is ${m(ex1.fed)}, Social Security ${m(ex1.ss)} and Medicare ${m(ex1.med)}, so you take home ${m(ex1.net)} a paycheck (${m0(ex1.net * 26)} a year).`],
  ['How much is taken out of a $65,000 salary in California or New York?', `On the same ${m0(65000)} bi-weekly salary (single, no extra allowances), California withholds ${m(ex2.state)} in income tax plus ${m(ex2.programTotal)} of State Disability Insurance, leaving ${m(ex2.net)} a paycheck. New York withholds ${m(ex3.state)} in income tax plus ${m(ex3.programTotal)} of disability and paid family leave, leaving ${m(ex3.net)}. Pick your state to see yours.`],
  ['Does a 401(k) lower my paycheck taxes?', `A traditional 401(k) lowers your federal and most state income tax but not Social Security or Medicare. Putting 6% of the ${m0(65000)} salary (${m(65000 / 26 * 0.06)} a paycheck) into a 401(k) lowers take-home only from ${m(ex1.net)} to ${m(ex401.net)} — ${m(ex1.net - ex401.net)} less, because federal tax drops from ${m(ex1.fed)} to ${m(ex401.fed)}. Type “6%” in the 401(k) field under Go advanced to try it.`],
  ['When does Social Security tax stop?', `Social Security (6.2%) is withheld only on the first ${m0(E.SS_BASE)} of wages in 2026. On a ${m0(250000)} salary paid monthly you pay it through ${MONTHS[ssStop - 1]} and part of ${MONTHS[ssStop]}, then it stops and your take-home jumps — ${m(big[0].net)} in January versus ${m(big[11].net)} in December. The yearly chart under your result marks the paycheck where it stops.`],
  ['How much is my monthly take-home pay?', `Choose “Monthly” as your pay frequency, or look at the monthly row in the table of all ten pay schedules. For a single filer in a state with no income tax, ${m0(40000)} a year takes home ${m(exMo40.net)} a month, ${m0(65000)} a year takes home ${m(exMo65.net)} a month and ${m0(100000)} a year takes home ${m(exMo100.net)} a month after federal income tax, Social Security and Medicare. Pick your state to include state tax.`],
  ['How do children and dependents change my paycheck?', `Under Go advanced, type your children under 17 and other dependents. The calculator fills Form W-4 Step 3 with $2,200 for each child and $500 for each other dependent, so your employer withholds less federal income tax. Those W-4 amounts assume income of $200,000 or less ($400,000 if married filing jointly). For example, a single filer on ${m0(65000)} a year paid bi-weekly with two children takes home ${m(exKids.net)} a paycheck instead of ${m(ex1.net)}.`],
  ['Can I add city or local income tax?', `Yes. Under Go advanced, type your city or county income tax rate in City or local tax. The calculator takes that percentage from your pay after before-tax deductions and shows it as its own line. It is an estimate — check your city’s own withholding rules. At 1.5% on ${m0(65000)} a year paid bi-weekly the local tax is ${m(exLocal.local)} a paycheck.`],
  ['Will I get a refund or owe tax?', `Under your result, the refund or owe line compares the federal income tax your paychecks withhold over the year with the federal tax on your return (standard deduction, the Step 3 credits you entered, this job only). A single filer with a standard W-4 usually lands near zero; checking the two-jobs box or adding extra withholding builds a refund, while claiming too many credits means a bill. It also shows how much extra to withhold per paycheck to break even.`],
  ['Does the calculator work for hourly pay and overtime?', `Yes — switch to Hourly. At $22 an hour for 40 hours a week your gross is ${m(hourWeekly)} a week (${m0(hourAnnual)} a year) and you take home ${m(exH.net)} a week as a single filer with no state tax. Under Go advanced, add overtime hours: 5 hours a week at 1.5× brings gross to ${m(otWeekly)} and take-home to ${m(exOT.net)}.`]
];

const jsonLdApp = {
  '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Paycheck Calculator', url: 'https://calcthis.co/paycheck-calculator/', applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Paycheck and take home pay calculator for salary and hourly pay: federal income tax (2020+ and older W-4, children and dependents), Social Security, Medicare, state and city income tax, deductions and overtime, with a take-home breakdown, refund-or-owe line and what-if comparison.'
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
    <h1>Paycheck &amp; <span style="white-space:nowrap">Take-Home</span> Pay Calculator</h1>
    <p>This take home pay calculator turns your salary or hourly pay into your <strong>paycheck after tax</strong>: enter it and see your <strong>take-home pay</strong> after <strong>federal income tax, Social Security, Medicare</strong> and your <strong>state tax</strong>. See where every dollar of each paycheck goes, how a raise or a 401(k) changes it, and your pay on every pay schedule at once.</p>
  </section>`;
const CONTENT_MAIN = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the paycheck and take home pay calculator</h2>
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
        <p><strong>No state income tax:</strong> ${listAnd(noTax)}. Only federal tax and FICA apply${noTax.indexOf('Washington') >= 0 ? ' (Washington still has employee-paid paid-family-leave and long-term-care premiums, which the calculator includes)' : ''}.</p>
        <p><strong>Computed from the official 2026 formula:</strong> ${listAnd(liveWithTax)}.</p>
        <p><strong>Every other state</strong> shows federal tax and FICA only and says so. Under Go advanced you can type your state’s tax rate for a flat estimate, clearly labelled as an estimate — the calculator never picks a state rate for you.</p>
        <p><strong>Coming next</strong>, as each official formula is checked: ${listAnd(pending)}.</p>
        <p><strong>City and local tax:</strong> not included unless you type a rate under Go advanced (City or local tax), which is taken from your pay after before-tax deductions.</p>

        <h2>Children, dependents and your refund</h2>
        <p>Under Go advanced, type the number of <strong>children under 17</strong> and <strong>other dependents</strong> and the calculator fills W-4 Step 3 for you: $2,200 per child and $500 per other dependent, which lowers the federal tax withheld from each paycheck. Below your result, the <strong>refund or owe</strong> line compares the federal tax withheld over the year with the tax on your return, so you can see whether you are on track for a refund or a bill, and how much extra to withhold to break even.</p>

        <h2>Before-tax and after-tax deductions</h2>
        <p>A traditional 401(k) lowers your federal and most state income tax but not Social Security or Medicare. Health, dental and vision premiums and HSA or FSA contributions through payroll lower both. Roth contributions and union dues come out after tax and change nothing about your taxes. With 6% of the ${m0(65000)} salary going into a 401(k), take-home falls only ${m(ex1.net - ex401.net)} a paycheck because federal tax drops by ${m(ex1.fed - ex401.fed)}. Type <strong>6%</strong> instead of a dollar amount to enter a share of pay.</p>

        <h2>Hourly pay and overtime</h2>
        <p>Switch to Hourly, enter your rate and hours per week and pick how often you are paid. At $22 an hour for 40 hours your gross is ${m(hourWeekly)} a week. Under Go advanced, add overtime hours and the pay multiplier: 5 hours a week at 1.5× lifts gross to ${m(otWeekly)} and take-home to ${m(exOT.net)}.</p>

        <h2>What it does not include</h2>
        <p>This is an estimate of withholding for 2026, not payroll or tax advice. Your employer’s payroll system, local taxes, other withholdings and your final tax return can differ. The refund or owe line counts federal income tax on this one job with the standard deduction. Employer-paid taxes are not part of your paycheck.</p>

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
          <div class="fld"><label class="lab" for="pcGross">Gross pay, before taxes <span class="unit">$</span></label><div class="inp"><input id="pcGross" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 65000"><span class="len-toggle" id="pcUnitSeg"><button type="button" class="on" data-v="year">per year</button><button type="button" data-v="period">per paycheck</button></span></div></div>
        </div>
        <div id="pcHourBox" style="display:none">
          <div class="ln-two">
            ${fld('pcRate', 'Hourly rate', '$', 'e.g. 22')}
            ${fld('pcHours', 'Hours per week', '', 'e.g. 40')}
          </div>
        </div>

        <div class="fld"><span class="lab">Pay frequency</span>${csel('pcFreq', 'biweekly', 'Bi-weekly', freqOpts)}</div>
        <div class="fld"><span class="lab">State</span><div class="st-ta"><div class="inp"><input id="pcStateIn" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="pcStateList" aria-label="State" placeholder="Federal taxes only — type to pick a state"><input id="pcState" type="hidden" value=""></div><div class="st-ta-list" id="pcStateList" role="listbox" style="display:none"></div></div></div>
        <div class="fld" id="pcCountyFld" style="display:none"><span class="lab" id="pcCountyLab">County where you live</span><div class="st-ta"><div class="inp"><input id="pcCountyIn" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="pcCountyList" aria-label="County" placeholder="Type a county name"><input id="pcCounty" type="hidden" value=""></div><div class="st-ta-list" id="pcCountyList" role="listbox" style="display:none"></div></div></div>
        <div class="fld"><span class="lab">Filing status</span>${csel('pcStatus', 'single', 'Single or married filing separately', [['single', 'Single or married filing separately'], ['married', 'Married filing jointly'], ['hoh', 'Head of household']])}</div>

        <div id="pcNycFld" style="display:none">${chk('pcNyc', 'I live in New York City (adds NYC income tax)')}</div>

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
            <div class="ln-two">
              ${fld('pcKids', 'Children under 17', '', 'e.g. 2')}
              ${fld('pcOthDep', 'Other dependents', '', 'e.g. 1')}
            </div>
            <p class="add-note" style="margin:-4px 0 12px">Fills W-4 Step 3 for you: $2,200 for each child under 17 and $500 for each other dependent.</p>
            ${fld('pcCredit', 'Other Step 3 credits', '$ a year', 'e.g. 500')}
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

          <div class="fc-grp">City or local tax</div>
          ${fld('pcLocal', 'City or local income tax rate', '%', 'e.g. 1.5')}
          <p class="add-note" style="margin:-4px 0 12px">Your city’s or county’s rate, taken from pay after before-tax deductions. An estimate — check your city’s own rules.</p>

          <div id="pcStRateFld">
            <div class="fc-grp">State income tax estimate</div>
            ${fld('pcStRate', 'Your state’s income tax rate', '%', 'e.g. 4.5')}
            <p class="add-note" style="margin:-4px 0 12px">This state’s exact formula isn’t built yet. Type its rate (see your state revenue department) for a flat estimate; leave it empty for federal tax only.</p>
          </div>

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
          <div id="pcNycWrap" style="display:none"><p class="res-tip adv-tip" id="pcNycTip"></p></div>

          <div class="fc-grp">Where each paycheck dollar goes</div>
          <div class="ln-bar" id="pcBar"></div>
          <div class="ln-leg" id="pcBarLeg"></div>

          <table class="dtable ln-terms" id="pcTable"></table>

          <div class="fc-grp">Refund or owe at tax time</div>
          <p class="res-tip adv-tip" id="pcRefund"></p>

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
const listing = [];
liveSorted.forEach((c) => { listing.push({ c, name: NAMES[c], slug: SLUG[c], flag: c.toLowerCase(), nyc: false }); if (c === 'NY') listing.push({ c: 'NYC', name: 'New York City', slug: 'new-york-city', flag: 'nyc', nyc: true }); });
const stateLinks = (except) => '<ul class="pc-statelist">' + listing.filter((o) => o.c !== except).map((o) => '<li><a href="/paycheck-calculator/' + o.slug + '/">' + o.name + ' Paycheck Calculator</a></li>').join('') + '</ul>';
const cmpRows = liveSorted.map((c) => ({ c, r: stateExamples(c)[1] })).sort((x, y) => y.r.net - x.r.net);
const cmpTable = '<p>Take-home pay on a ' + m0(65000) + ' salary, single filer, paid bi-weekly in 2026, no deductions — ranked from highest to lowest across the states with a live calculator:</p>\n    <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>State</th><th>Net per paycheck</th><th>Net per year</th><th>State tax per paycheck</th></tr></thead><tbody>' + cmpRows.map((o) => '<tr><td><a href="/paycheck-calculator/' + SLUG[o.c] + '/">' + NAMES[o.c] + '</a></td><td>' + m(o.r.net) + '</td><td>' + m0(o.r.net * 26) + '</td><td>' + m(o.r.state + o.r.prog) + '</td></tr>').join('') + '</tbody></table></div>';
const byState = '\n    <h2 style="margin-top:36px">Take-home pay on ' + m0(65000) + ' by state</h2>\n    ' + cmpTable + '\n    <h2 style="margin-top:36px">Paycheck calculator by state</h2>\n    ' + stateLinks() + '\n';
const contentMain = CONTENT_MAIN.replace('\n    <h2 style="margin-top:36px">Common questions</h2>', () => byState + '\n    <h2 style="margin-top:36px">Common questions</h2>');

const HUB_TITLE = 'Paycheck & Take-Home Pay Calculator 2026 — After Tax', HUB_DESC = 'Take home pay calculator: your paycheck after federal, state, Social Security and Medicare tax. Salary or hourly, 401(k), overtime and a what-if raise.';
if (HUB_TITLE.length > 60 || HUB_DESC.length > 158) { console.error('hub SEO length', HUB_TITLE.length, HUB_DESC.length); process.exit(1); }
write('paycheck-calculator/index.html', pageHtml({
  title: HUB_TITLE,
  desc: HUB_DESC,
  ogTitle: HUB_TITLE,
  ogDesc: 'See your take-home pay after federal, Social Security, Medicare and state tax — salary or hourly, with deductions, overtime and a what-if raise.',
  url: 'https://calcthis.co/paycheck-calculator/', app: jsonLdApp, faq: jsonLdFaq, hero: HERO_MAIN, content: contentMain
}));
console.log('main page written; live states', nLive, 'pending', pending.length);

// ---------------- state pages ----------------
const FORM = { AL: 'Form A-4', AZ: 'Form A-4', CA: 'Form DE 4', CO: 'Form DR 0004 (optional — without it your federal W-4 is used)', GA: 'Form G-4', IA: 'the IA W-4', IL: 'Form IL-W-4', KY: 'Form K-4', MI: 'Form MI-W4', MN: 'Form W-4MN', MO: 'Form MO W-4', MT: 'Form MW-4', NC: 'Form NC-4', NY: 'Form IT-2104', PA: '', VA: 'Form VA-4', NJ: 'Form NJ-W4', OH: 'Form IT 4', MA: 'Form M-4', MD: 'Form MW507', WI: 'Form WT-4', IN: 'Form WH-4', OR: 'Form OR-W-4', UT: 'the federal Form W-4 and its filing status (there is no separate Utah allowance form)', LA: 'Form L-4 (R-1300)', OK: 'Form OK-W-4', NE: 'Form W-4N', AR: 'Form AR4EC', HI: 'Form HW-4' };
const LOCALS = {
  NY: 'New York City residents also pay a city income tax — tick “I live in New York City” in the calculator or use the New York City paycheck calculator. Yonkers residents also pay a local tax, which is not included.',
  PA: 'Most Pennsylvania workers also pay a local earned income tax (commonly about 1%) and Philadelphia has its own wage tax; none of these are included here.',
  MI: 'Detroit and some other Michigan cities charge a city income tax, which is not included here.',
  MO: 'St. Louis and Kansas City charge a 1% earnings tax, which is not included here.',
  KY: 'Many Kentucky cities and counties charge an occupational license tax, which is not included here.',
  AL: 'Some Alabama cities and counties charge an occupational tax, which is not included here.',
  CO: 'Denver and a few other Colorado cities charge an occupational privilege tax, which is not included here.',
  NJ: 'New Jersey cities do not charge an income tax on wages, so there is no local tax to add.',
  OH: 'Many Ohio cities charge a municipal income tax and many school districts charge their own income tax; neither is included here, so add your rate under Go advanced.',
  MA: 'Massachusetts cities and towns do not charge a local income tax.',
  MD: 'Maryland county tax is included — pick your county or Baltimore City above and the calculator uses its 2026 rate.',
  WI: 'Wisconsin has no local income tax.',
  IN: 'Indiana county tax is included — pick your county above and the calculator adds its rate. City taxes do not exist in Indiana.',
  OR: 'Some Oregon residents also owe Multnomah County and Portland-area Metro income taxes, which this calculator does not include; add your rate under Go advanced.',
  UT: 'Utah has no local income tax.',
  AR: 'Arkansas has no local income tax on wages.',
  HI: 'Hawaii has no local income tax on wages.',
  LA: 'Louisiana has no local income tax on wages.',
  OK: 'Oklahoma has no local income tax on wages.',
  NE: 'Nebraska has no local income tax on wages.'
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
    case 'NJ': return 'New Jersey withholds with the Division of Taxation’s percentage method: your pay less $1,000 a year for each allowance on Form NJ-W4, then graduated rates from 1.5% to 11.8% (Rate A for single filers, Rate B for married and head-of-household filers). Employees also pay unemployment and workforce development (0.425% up to $44,800), disability insurance (0.19% up to $171,100) and family leave insurance (0.23% up to $171,100).';
    case 'OH': return 'Ohio withholds 1.6% on the first $26,050 of annual taxable pay, 2.99% up to $100,000 and 3.4% above that, after subtracting $650 for each exemption claimed on Form IT 4. These are the percentage-method tables effective August 1, 2026.';
    case 'MA': return 'Massachusetts withholds 5% of pay after subtracting your Social Security and Medicare tax (up to $2,000 a year) and an amount for the exemptions you claim on Form M-4 ($1,000 each plus $3,400 once you claim any), plus 9% on annual pay above $1,107,750. Employees also pay 0.46% toward Paid Family and Medical Leave up to the Social Security wage limit.';
    case 'MD': return 'Maryland withholds with the Comptroller’s percentage chart: state rates from 4.75% to 6.5% plus your county’s local rate (2.25% to 3.30%), after a $3,400 standard deduction and $3,200 for each exemption claimed on Form MW507. Without a county on file the Comptroller withholds local tax at 3.30%.';
    case 'WI': return 'Wisconsin withholds 3.54%, 4.65%, 5.3% and 7.65% of annual pay after a sliding standard deduction (up to $6,702 single, $9,461 married) and $400 for each exemption claimed on Form WT-4.';
    case 'IN': return 'Indiana withholds a flat 2.95% state rate plus your county’s rate (0.5% to 3.0%) on pay after $1,000 for each personal exemption and $1,500 for each dependent exemption claimed on Form WH-4.';
    case 'OR': return 'Oregon withholds 4.75%, 6.75%, 8.75% and 9.9% after subtracting the federal income tax withheld from your pay (up to $8,750 a year), a $2,910 standard deduction ($5,820 married) and a $263 credit for each allowance on Form OR-W-4. Employees also pay 0.6% for Paid Leave Oregon (up to $184,500) and the 0.1% statewide transit tax.';
    case 'UT': return 'Utah withholds a flat 4.45% of annual pay, less a withholding allowance of $485 ($970 married) that shrinks by 1.3% of pay above $9,348 ($18,696 married).';
    case 'AR': return 'Arkansas withholds 2%, 3%, 3.4% and 3.7% by formula: annual pay less a $2,470 standard deduction, a bracket percentage minus a fixed adjustment, then $29 off for each exemption claimed on Form AR4EC. The top rate fell from 3.9% to 3.7% in 2026 and the Department of Finance and Administration posted the new formula on May 29, 2026.';
    case 'HI': return 'Hawaii withholds 1.4% to 7.9% in eight steps after subtracting $1,144 for each allowance on Form HW-4 and an extra $4,350 withholding allowance; single filers (including unmarried heads of household) and married filers have their own tables. Employees also pay up to 0.5% of weekly wages (at most $7.50 a week) toward Temporary Disability Insurance.';
    case 'LA': return 'Louisiana withholds a flat 3.09% (the 3% income tax rate plus a small cushion) of your pay after subtracting a standard deduction spread over the pay periods: $12,875 a year for a single filer and $25,750 for married filing jointly, head of household or a surviving spouse (Form L-4 claim “1” or “2”).';
    case 'OK': return 'Oklahoma withholds 2.5%, 3.5% and 4.5% in three steps from its Packet OW-2 tables, after subtracting $1,000 a year for each allowance claimed on Form OK-W-4. Single filers pay tax above $10,100 a year and married filers above $20,200, and the result is rounded to the whole dollar.';
    case 'NE': return 'Nebraska withholds 2.26%, 3.22%, 4.21%, 4.35%, 4.48% and 4.60% in six steps from its Circular EN tables, after subtracting $2,440 a year for each allowance claimed on Form W-4N. Head-of-household filers use the single table and surviving spouses use the married table.';
    case 'WA': return 'Washington has no state income tax, but employees pay for the state’s Paid Family & Medical Leave program (about 0.81% of wages up to the Social Security limit) and the WA Cares long-term-care fund (0.58% of all wages).';
    default: return n + ' does not tax wages, so your paycheck has only federal income tax, Social Security and Medicare.';
  }
}
function stateExamples(c) {
  const S = E.STATES[c], rows = [];
  [[40000, 'single'], [65000, 'single'], [100000, 'single'], [65000, 'married'], [30000, 'single'], [50000, 'single'], [75000, 'single'], [150000, 'single'], [100000, 'married']].forEach(([a, st]) => {
    const inp = base(a / 26, 26, { fed: { w4: 'new', status: st }, state: { code: c, status: st, allowances: c === 'AZ' ? null : 0, allowances2: 0, county: S.defaultCounty } });
    const p = pc(inp);
    rows.push({ a, st, gross: a / 26, fed: p.fed, ss: p.ss, med: p.med + p.addl, state: p.state + p.county, prog: p.programTotal, net: p.net });
  });
  return rows;
}
function monthly65(c) { return pc(base(65000 / 12, 12, { fed: { w4: 'new', status: 'single' }, state: { code: c, status: 'single', allowances: c === 'AZ' ? null : 0, allowances2: 0, county: E.STATES[c].defaultCounty } })); }
function stateFaqs(c) {
  const n = NAMES[c], S = E.STATES[c], ex = stateExamples(c), e65 = ex[1], none = S.method === 'none', prog = programsText(S);
  const cty = S.defaultCounty ? ' (' + S.defaultCounty + ')' : '', sw = S.counties ? 'state and county' : 'state';
  const f = [];
  f.push([`How much is taken out of a $65,000 salary in ${n}?`,
    `On a ${m0(65000)} salary paid bi-weekly (${m(65000 / 26)} gross) for a single filer with no allowances${cty}, ${n} ${none && !prog ? 'withholds no state income tax' : 'withholds ' + m(e65.state) + ' of ' + sw + ' income tax' + (e65.prog > 0 ? ' plus ' + m(e65.prog) + ' of ' + prog : '')}, federal income tax is ${m(e65.fed)}, Social Security ${m(e65.ss)} and Medicare ${m(e65.med)}. Take-home pay is ${m(e65.net)} a paycheck, about ${m0(e65.net * 26)} a year.`]);
  const mo = monthly65(c);
  f.push([`What is the monthly take-home pay on a $65,000 salary in ${n}?`,
    `A single filer on ${m0(65000)} a year paid monthly in ${n}${cty} takes home about ${m(mo.net)} a month (${m(mo.gross)} gross): federal income tax ${m(mo.fed)}, Social Security ${m(mo.ss)}, Medicare ${m(mo.med)}${none && !mo.programTotal ? ', and no ' + n + ' income tax' : ', ' + n + ' ' + (mo.programTotal > 0 ? sw + ' income tax ' + m(mo.state + mo.county) + ' and ' + m(mo.programTotal) + ' of state programs' : sw + ' income tax ' + m(mo.state + mo.county))}.`]);
  f.push([`Does ${n} tax paychecks differently for married workers?`,
    `Federal withholding does, and ${none ? n + ' has no state income tax to change' : n + ' uses its own married tables or deductions'}. For a ${m0(65000)} salary paid bi-weekly, a married filer in ${n} takes home ${m(ex[3].net)} a paycheck versus ${m(e65.net)} for a single filer.`]);
  f.push([`Which form do I fill out for ${n} withholding?`,
    FORM[c] ? `${n} uses ${FORM[c]}. Under Go advanced the calculator asks for the same details, so your result matches what your employer would withhold.` : (none ? `${n} has no state income tax form because it does not tax wages — only your federal Form W-4 matters.` : `${n} withholding is a flat rate with no state allowance form — only your federal Form W-4 matters for federal tax.`)]);
  f.push([`Does this ${n} calculator include local taxes?`, (LOCALS[c] || 'City, county and school-district taxes are not included by default.') + ' Open Go advanced to add a local tax rate as an estimate. State and federal figures follow the 2026 official withholding methods.']);
  f.push([`What is my take-home pay on $40,000 or $100,000 in ${n}?`,
    `Single filer, paid bi-weekly${cty}: ${m0(40000)} a year gives ${m(ex[0].net)} a paycheck; ${m0(100000)} a year gives ${m(ex[2].net)} a paycheck.`]);
  const byA = (a, st) => ex.find((r) => r.a === a && r.st === st);
  [30000, 50000, 75000, 150000].forEach((a) => { const r = byA(a, 'single'); f.push([`What is ${m0(a)} a year after taxes in ${n}?`, `A single filer paid bi-weekly in ${n}${cty} on ${m0(a)} a year takes home about ${m(r.net)} a paycheck, roughly ${m0(r.net * 26)} a year after federal income tax${none && !r.prog ? '' : ', ' + n + ' tax'}, Social Security and Medicare. That is an effective total tax rate of about ${((1 - r.net * 26 / a) * 100).toFixed(1)}%.`]); });
  return f;
}
function stateContent(c, faqs2) {
  const n = NAMES[c], S = E.STATES[c], ex = stateExamples(c);
  const exSorted = ex.slice().sort((x, y) => (x.st === y.st ? x.a - y.a : (x.st === 'single' ? -1 : 1)));
  const rowsHtml = exSorted.map((r) => `<tr><td>${m0(r.a)}${r.st === 'single' ? '' : ' married'}</td><td>${m(r.fed)}</td><td>${m(r.ss + r.med)}</td><td>${S.method === 'none' && !r.prog ? '$0.00' : m(r.state + r.prog)}</td><td>${m(r.net)}</td></tr>`).join('');
  return `  <section class="content">
    <div class="grid2">
      <div>
        <h2>${n} take-home pay at a glance</h2>
        <p><strong>${m0(65000)} a year in ${n}${S.defaultCounty ? ' (' + S.defaultCounty + ')' : ''}</strong> (single, bi-weekly, 2026) is <strong>${m(ex[1].net)} a paycheck</strong>, about ${m0(ex[1].net * 26)} a year. <strong>${m0(100000)}</strong> is <strong>${m(ex[2].net)}</strong> a paycheck. Updated for the 2026 tax year using the IRS Publication 15-T method${S.method === 'none' ? '' : ' and the official ' + n + ' withholding formula'}.</p>
        <h2>How ${n} paycheck tax works</h2>
        <p>${fact(c)}</p>
        <p>${c === 'NY' ? 'Live in New York City? Tick “I live in New York City” above, or use the <a href="/paycheck-calculator/new-york-city/">New York City paycheck calculator</a>, to add the city’s resident income tax. Yonkers and other local taxes are not included.' : (LOCALS[c] || 'City, county and school-district taxes are not included.')} Under Go advanced you can add a city or local tax rate as an estimate.</p>
        <h2>${n} paycheck examples</h2>
        <p>Single filer unless marked, paid bi-weekly in 2026, no extra withholding, no deductions${S.defaultCounty ? ', living in ' + S.defaultCounty : ''}. Amounts are per paycheck:</p>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Pay</th><th>Federal</th><th>FICA</th><th>${n}</th><th>Net pay</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
        <p>FICA is Social Security plus Medicare.</p>
      </div>
      <div>
        <h2>Use the ${n} take home pay calculator</h2>
        <p>The state is already set to <strong>${n}</strong> above. Enter your salary or hourly rate, your pay frequency and filing status, and the result appears as you type. Under <strong>Go advanced</strong> you can match your Form W-4 (new or 2019-or-earlier), add children and dependents, a city or local tax rate, 401(k), insurance and other deductions, enter year-to-date pay and add overtime.</p>
        <p>You also get a bar showing where each paycheck dollar goes, a refund-or-owe line for tax time, a what-if for a raise or a bigger 401(k), and your pay on all ten schedules. This is an estimate of withholding, not payroll or tax advice.</p>
        <h2>Other states</h2>
        ${stateLinks(c)}
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
  const app = Object.assign({}, jsonLdApp, { dateModified: ['NJ', 'OH', 'MA', 'MD', 'WI', 'IN', 'OR', 'UT', 'LA', 'OK', 'NE', 'AR', 'HI'].indexOf(c) >= 0 ? '2026-11-02' : '2026-10-27', name: n + ' Paycheck Calculator', url, description: n + ' paycheck and take home pay calculator for salary and hourly pay: federal income tax, Social Security, Medicare' + (E.STATES[c].method === 'none' ? '' : ', ' + n + ' state tax') + ', deductions and overtime.' });
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f2.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' },
    { '@type': 'ListItem', position: 2, name: 'Paycheck Calculator', item: 'https://calcthis.co/paycheck-calculator/' },
    { '@type': 'ListItem', position: 3, name: n, item: url }] };
  const hero = `  <section class="hero">
    <div class="eyebrow">${n} · 2026 tax rates</div>
    <h1>${n} Paycheck &amp; <span style="white-space:nowrap">Take-Home</span> Pay Calculator</h1>
    <p>This ${n} take home pay calculator shows your <strong>${n} take-home pay</strong> after <strong>federal income tax, Social Security, Medicare</strong>${E.STATES[c].method === 'none' ? (E.STATES[c].programs ? ' and the state’s employee-paid programs' : ' — ' + n + ' has no state income tax') : (E.STATES[c].counties ? ', <strong>' + n + ' state tax</strong> and <strong>county tax</strong>' : ' and <strong>' + n + ' state tax</strong>')}. On a ${m0(65000)} salary paid bi-weekly a single filer${E.STATES[c].defaultCounty ? ' in ' + E.STATES[c].defaultCounty : ''} takes home about <strong>${m(e65.net)}</strong> a paycheck.</p>
  </section>`;
  const stTitle = n + ' Paycheck & Take-Home Pay Calculator 2026';
  let stDesc = n + ' take home pay calculator: ' + m0(65000) + ' a year is ' + m(e65.net) + ' bi-weekly after tax. Salary or hourly, 401(k), overtime, 2026 rates.';
  if (stTitle.length > 60 || stDesc.length > 158) { console.error('state SEO length', n, stTitle.length, stDesc.length); process.exit(1); }
  write('paycheck-calculator/' + SLUG[c] + '/index.html', pageHtml({
    title: stTitle, desc: stDesc, ogTitle: stTitle, url, app, faq, extraLd: [crumbs], hero, content: stateContent(c, f2), bodyAttr: ' data-state="' + c + '"'
  }));
  nState++;
});
console.log('state pages written', nState);

// ---------------- New York City page ----------------
(function () {
  const NYC_URL = 'https://calcthis.co/paycheck-calculator/new-york-city/';
  const row = (a, st, ppy) => pc(base(a / (ppy || 26), ppy || 26, { fed: { w4: 'new', status: st }, state: { code: 'NY', status: st, allowances: 0, allowances2: 0 }, nyc: { on: true, exemptions: 0 } }));
  const rowNo = (a, st, ppy) => pc(base(a / (ppy || 26), ppy || 26, { fed: { w4: 'new', status: st }, state: { code: 'NY', status: st, allowances: 0, allowances2: 0 } }));
  const e65 = row(65000, 'single'), e65n = rowNo(65000, 'single'), e100 = row(100000, 'single'), e40 = row(40000, 'single'), e65m = row(65000, 'married');
  const mo65 = row(65000, 'single', 12), mo100 = row(100000, 'single', 12), mo40 = row(40000, 'single', 12);
  const sample = [[40000, 'single'], [65000, 'single'], [100000, 'single'], [150000, 'single'], [65000, 'married'], [100000, 'married'], [150000, 'married']].map(([a, st]) => ({ a, st, p: row(a, st) }));
  const rowsHtml = sample.map((r) => '<tr><td>' + m0(r.a) + (r.st === 'single' ? '' : ' married') + '</td><td>' + m(r.p.fed) + '</td><td>' + m(r.p.ss + r.p.med + r.p.addl) + '</td><td>' + m(r.p.state + r.p.programTotal) + '</td><td>' + m(r.p.nyc) + '</td><td>' + m(r.p.net) + '</td></tr>').join('');
  const hrRate = 30, hrWk = hrRate * 40, hr = pc(base(hrWk, 52, { fed: { w4: 'new', status: 'single' }, state: { code: 'NY', status: 'single', allowances: 0, allowances2: 0 }, nyc: { on: true, exemptions: 0 } }));
  const faqsN = [
    ['How much is taken out of a $65,000 salary in New York City?', `On a ${m0(65000)} salary paid bi-weekly (${m(65000 / 26)} gross) for a single filer with no exemptions, New York City withholds ${m(e65.nyc)} of city income tax, New York State ${m(e65.state)} plus ${m(e65.programTotal)} of disability and paid family leave, federal income tax ${m(e65.fed)}, Social Security ${m(e65.ss)} and Medicare ${m(e65.med)}. Take-home pay is ${m(e65.net)} a paycheck, about ${m0(e65.net * 26)} a year.`],
    ['What is the take-home pay on $100,000 in NYC?', `A single filer on ${m0(100000)} a year paid bi-weekly in New York City takes home ${m(e100.net)} a paycheck (about ${m0(e100.net * 26)} a year), after ${m(e100.nyc)} of city tax and ${m(e100.state)} of state tax per paycheck. Paid monthly the same salary takes home ${m(mo100.net)} a month.`],
    ['What is the monthly take-home pay on $65,000 in NYC?', `Paid monthly, ${m0(65000)} a year (${m(mo65.gross)} gross) takes home ${m(mo65.net)} a month for a single filer in New York City: federal tax ${m(mo65.fed)}, Social Security ${m(mo65.ss)}, Medicare ${m(mo65.med)}, New York State tax ${m(mo65.state)} plus ${m(mo65.programTotal)} of state programs, and New York City tax ${m(mo65.nyc)}. For ${m0(40000)} a year it is ${m(mo40.net)} a month.`],
    ['How much does New York City income tax take from a paycheck?', `On ${m0(65000)} a year paid bi-weekly the city tax withholding is ${m(e65.nyc)} a paycheck, about ${m0(e65.nyc * 26)} a year, which is ${((e65.nyc / e65.gross) * 100).toFixed(1)}% of gross pay. Without the city tax the same single filer would take home ${m(e65n.net)} a paycheck instead of ${m(e65.net)}.`],
    ['Do I pay NYC income tax if I live outside the city?', `The New York City withholding tables are for New York City residents, so someone who works in the city but lives elsewhere, for example in New Jersey or on Long Island, does not have NYC income tax withheld. Untick “I live in New York City” in the calculator to see New York State tax only. Yonkers has its own local tax, which is not included.`],
    ['How is NYC withholding calculated?', `New York City uses the official withholding method published by the New York State Tax Department (NYS-50-T-NYC, effective January 1 to December 31, 2026): subtract a deduction allowance (${m0(5000)} a year single, ${m0(5500)} married) plus ${m0(1000)} for each exemption claimed on Form IT-2104, then apply rates from 2.05% to 4.25% in six steps. Single and married use the same rate steps. This calculator follows the per-paycheck tables for daily, weekly, bi-weekly, semi-monthly and monthly pay.`],
    ['Does the calculator work for hourly pay in NYC?', `Yes — switch to Hourly. At ${m0(hrRate)} an hour for 40 hours a week your gross is ${m(hrWk)} a week and a single filer takes home ${m(hr.net)} a week after federal, New York State and New York City tax, Social Security and Medicare.`]
  ];
  const title = 'NYC Paycheck & Take-Home Pay Calculator 2026 (New York City)';
  const desc = 'NYC take home pay calculator: ' + m0(65000) + ' a year is ' + m(e65.net) + ' bi-weekly after federal, state and New York City tax. 2026 rates.';
  if (title.length > 60 || desc.length > 158) { console.error('NYC SEO length', title.length, desc.length); process.exit(1); }
  const app = Object.assign({}, jsonLdApp, { dateModified: '2026-11-02', name: 'New York City Paycheck Calculator', url: NYC_URL, description: 'NYC paycheck and take home pay calculator for salary and hourly pay: federal income tax, Social Security, Medicare, New York State tax, New York City resident income tax, deductions and overtime.' });
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqsN.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' },
    { '@type': 'ListItem', position: 2, name: 'Paycheck Calculator', item: 'https://calcthis.co/paycheck-calculator/' },
    { '@type': 'ListItem', position: 3, name: 'New York City', item: NYC_URL }] };
  const hero = `  <section class="hero">
    <div class="eyebrow">New York City · 2026 tax rates</div>
    <h1>New York City (NYC) Paycheck &amp; <span style="white-space:nowrap">Take-Home</span> Pay Calculator</h1>
    <p>This NYC take home pay calculator shows your <strong>take-home pay</strong> after <strong>federal income tax, Social Security, Medicare, New York State tax</strong> and <strong>New York City income tax</strong>. On a ${m0(65000)} salary paid bi-weekly a single filer takes home about <strong>${m(e65.net)}</strong> a paycheck.</p>
  </section>`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>NYC take-home pay at a glance</h2>
        <p><strong>${m0(65000)} a year in New York City</strong> (single, bi-weekly, 2026) is <strong>${m(e65.net)} a paycheck</strong>, about ${m0(e65.net * 26)} a year. <strong>${m0(100000)}</strong> is <strong>${m(e100.net)}</strong> a paycheck. Of the ${m(e65.gross)} gross, ${m(e65.nyc)} goes to New York City income tax and ${m(e65.state + e65.programTotal)} to New York State.</p>
        <h2>How New York City income tax works</h2>
        <p>New York City residents pay a city income tax on top of New York State tax. Employers withhold it with the official method in the New York State Tax Department publication NYS-50-T-NYC, effective January 1 to December 31, 2026. It subtracts a deduction allowance of ${m0(5000)} a year for a single filer (${m0(5500)} married) plus ${m0(1000)} for each exemption on Form IT-2104, then applies steps from 2.05% to 4.25%. The exemptions you enter for New York State are used for the city too.</p>
        <p>The calculator follows the per-paycheck tables for daily, weekly, bi-weekly, semi-monthly and monthly pay and checks against the examples printed in the publication. State disability insurance and paid family leave are included as for any New York paycheck.</p>
        <h2>NYC paycheck examples</h2>
        <p>Paid bi-weekly in 2026, no exemptions, no deductions. Amounts are per paycheck:</p>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>Pay</th><th>Federal</th><th>FICA</th><th>NY State</th><th>NYC</th><th>Net pay</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
        <p>FICA is Social Security plus Medicare. NY State includes disability and paid family leave.</p>
      </div>
      <div>
        <h2>Use the NYC take home pay calculator</h2>
        <p>The state is set to <strong>New York City</strong> above. Enter your salary or hourly rate, pay frequency and filing status and the result appears as you type, with the city tax as its own line and a note on what you would keep outside the city. If you live outside New York City, untick <strong>I live in New York City</strong> to see New York State tax only. Under <strong>Go advanced</strong> you can match your W-4, add children and dependents, 401(k), insurance and other deductions, year-to-date pay and overtime.</p>
        <p>This is an estimate of withholding, not payroll or tax advice. Yonkers and other local taxes are not included.</p>
        <h2>Other states</h2>
        ${stateLinks('NYC')}
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions about NYC paychecks</h2>
${faqsN.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
  write('paycheck-calculator/new-york-city/index.html', pageHtml({ title, desc, ogTitle: title, url: NYC_URL, app, faq, extraLd: [crumbs], hero, content, bodyAttr: ' data-state="NY" data-nyc="1"' }));
  console.log('NYC page written');
})();

// ---------------- sitemap (idempotent) ----------------
(function () {
  const f = ROOT + 'sitemap.xml'; let sm = fs.readFileSync(f, 'utf8'); const crlf = sm.includes('\r\n'); sm = sm.replace(/\r\n/g, '\n');
  const today = new Date().toISOString().slice(0, 10); let add = '';
  listing.forEach((o) => { const u = 'https://calcthis.co/paycheck-calculator/' + o.slug + '/'; if (!sm.includes('<loc>' + u + '</loc>')) add += '  <url>\n    <loc>' + u + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n'; });
  if (add) { sm = sm.replace('</urlset>', () => add + '</urlset>'); fs.writeFileSync(f, crlf ? sm.replace(/\n/g, '\r\n') : sm); console.log('sitemap: added', (add.match(/<url>/g) || []).length); }
  // llms.txt: keep a "Paycheck calculators by state" section current
  const lf = ROOT + 'llms.txt'; let lt = fs.readFileSync(lf, 'utf8'); const lcrlf = lt.includes('\r\n'); lt = lt.replace(/\r\n/g, '\n');
  lt = lt.replace(/\n## Paycheck calculators by state\n[\s\S]*?(?=\n## |$)/, '');
  lt = lt.trimEnd() + '\n\n## Paycheck calculators by state\n' + listing.map((o) => '- [' + o.name + ' Paycheck Calculator](https://calcthis.co/paycheck-calculator/' + o.slug + '/): take-home pay after federal tax, FICA' + (o.nyc ? ', New York State and New York City income tax' : (E.STATES[o.c].method === 'none' ? '' : ' and ' + o.name + ' state tax')) + '.').join('\n') + '\n';
  fs.writeFileSync(lf, lcrlf ? lt.replace(/\n/g, '\r\n') : lt);
})();
console.log(JSON.stringify({ ex1: ex1.net, ex2: ex2.net, ex3: ex3.net, exM: exM.fed, ex401: ex401.net, ssStop, jan: big[0].net, dec: big[11].net, exH: exH.net, exOT: exOT.net }));

// ---------------- nav + footer: "Paycheck Calculators" section (partials) ----------------
(function () {
  function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('partial updated', rel); } }
  const hdrLinks = '          <a href="/paycheck-calculator/">Paycheck Calculator (all states)</a>\n' + listing.map((o) => '          <a href="/paycheck-calculator/' + o.slug + '/">' + o.name + ' Paycheck Calculator</a>').join('\n') + '\n';
  const hdrBlock = '<!--PAYNAV:START-->\n        <div class="menu-col">\n          <span class="menu-col-head">Paycheck Calculators</span>\n' + hdrLinks + '        </div>\n        <!--PAYNAV:END-->';
  edit('partials/header.html', (s) => {
    if (s.includes('<!--PAYNAV:START-->')) return s.replace(/<!--PAYNAV:START-->[\s\S]*?<!--PAYNAV:END-->/, () => hdrBlock);
    s = s.replace('          <a href="/paycheck-calculator/">Paycheck</a>\n        </div>\n', () => '        </div>\n        ' + hdrBlock + '\n');
    return s;
  });
  const ftrLinks = '          <li><a href="/paycheck-calculator/">Paycheck Calculator (all states)</a></li>\n' + listing.map((o) => '          <li><a href="/paycheck-calculator/' + o.slug + '/">' + o.name + ' Paycheck Calculator</a></li>').join('\n') + '\n';
  const ftrBlock = '<!--PAYFOOT:START-->\n      <div class="footer-col footer-col--wide">\n        <button class="footer-col-btn" aria-expanded="false" type="button">\n          <span class="fttl"><span class="ft1">Paycheck</span> <span class="ft2">Calculators</span></span>\n          <svg class="footer-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>\n        </button>\n        <ul class="footer-links">\n' + ftrLinks + '        </ul>\n      </div>\n      <!--PAYFOOT:END-->';
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
  const cubes = '<!--PAYCUBES:START-->\n    <div class="st-cubes">\n      <a class="st-cube st-all" href="/paycheck-calculator/"><span class="st-ico" aria-hidden="true">' + allIco + '</span><span class="st-name">All states</span><span class="st-sub">Paycheck Calculator</span></a>\n'
    + listing.map((o) => '      <a class="st-cube" href="/paycheck-calculator/' + o.slug + '/"><img src="/assets/flags/' + o.flag + '.webp" width="60" height="40" alt="' + o.name + ' paycheck calculator' + (o.nyc ? '' : ' — flag of ' + o.name) + '" loading="lazy"><span class="st-name">' + o.name + '</span><span class="st-sub">Paycheck Calculator</span></a>').join('\n')
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
