const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /intermittent-fasting-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json). Every number in the text comes from CalcThis.fastEngine. Run: node md-files/gen-fasting-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['BMR-ENGINE', 'DEFICIT-ENGINE', 'KETO-ENGINE', 'FAST-ENGINE'].forEach((m) => eval(app.slice(app.indexOf('/* ' + m + ':START */'), app.indexOf('/* ' + m + ':END */'))));
const E = CalcThis.fastEngine, K = CalcThis.ketoEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const clk = (m) => E.fmtClock(m, false);

/* ---------- worked numbers ---------- */
const D168 = E.daily({ anchor: 'last', min: 20 * 60, fast: 16 });
const D168f = E.daily({ anchor: 'first', min: 12 * 60, fast: 16 });
const D186 = E.daily({ anchor: 'last', min: 20 * 60, fast: 18 });
const DAY = E.daily({ anchor: 'day', bed: 23 * 60, gap: 3, fast: 16 });
const RAMP = E.ramp({ from: 12, to: 16, weeks: 4, fixed: 'last', min: 20 * 60 });
const W52 = E.week('52', 2400), WADF = E.week('adf', 2400);
const methodsTbl = E.METHODS.filter((m) => m.kind === 'daily' && m.fast).map((m) => { const d = E.daily({ anchor: 'last', min: 20 * 60, fast: m.fast }); return '<tr><td>' + m.name.split(' —')[0] + '</td><td>' + m.fast + ' h</td><td>' + (24 - m.fast) + ' h</td><td>' + clk(d.first) + ' – ' + clk(d.last) + '</td></tr>'; }).join('');

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Anton SD, Moehl K, Donahoo WT et al., <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5783752/" rel="noopener">Flipping the Metabolic Switch: Understanding and Applying the Health Benefits of Fasting</a>, Obesity 2018;26:254–268 — the metabolic switch “typically occurs between 12 to 36 hours after cessation of food consumption depending on the liver glycogen content at the beginning of the fast” and exercise; time-restricted feeding typically restricts eating to 8–12 hours a day; the 5:2 diet is no more than 500 calories on two days a week; alternate-day modified fasting uses less than 25% of baseline energy on low days (read November 2026).</li>
          <li>Lowe DA et al., <a href="https://pubmed.ncbi.nlm.nih.gov/32986097/" rel="noopener">Effects of Time-Restricted Eating on Weight Loss and Other Metabolic Parameters in Women and Men With Overweight and Obesity: The TREAT Randomized Clinical Trial</a>, JAMA Internal Medicine 2020;180:1491 — 116 adults, 12 weeks of 16:8 (12 pm–8 pm) against three structured meals: −0.94 kg against −0.68 kg, no significant difference between groups (−0.26 kg, P = .63).</li>
          <li>Liu D et al., <a href="https://pubmed.ncbi.nlm.nih.gov/35443107/" rel="noopener">Calorie Restriction with or without Time-Restricted Eating in Weight Loss</a>, New England Journal of Medicine 2022;386:1495–1504 — 139 adults with obesity, 12 months, eating 8 a.m.–4 p.m. plus calorie restriction against calorie restriction alone: −8.0 kg against −6.3 kg, difference −1.8 kg (95% CI −4.0 to 0.4; P = 0.11).</li>
          <li>Mifflin MD et al., American Journal of Clinical Nutrition 1990;51:241 — the maintenance calories behind the optional calorie figures (times the activity level you choose); 7,700 kcal per kg of body fat is the usual rule of thumb.</li>
        </ul>
        <p><small>For information only, not medical advice. Intermittent fasting is not suitable for everyone — talk to a doctor first if you are pregnant or breastfeeding, under 18, have a history of disordered eating, have diabetes or take medication that has to be taken with food, or are underweight.</small></p>`;

const P = {
  slug: 'intermittent-fasting-calculator', name: 'Intermittent Fasting Calculator', menu: 'Intermittent Fasting',
  title: 'Intermittent Fasting Calculator — Your Eating Window',
  desc: 'Intermittent fasting calculator for 16:8, 18:6, 20:4, OMAD, 5:2 and custom: set your window from your last bite or first meal and plan a week-by-week ramp-up.',
  h1: 'Intermittent Fasting Calculator', eyebrow: '16:8 · 18:6 · 20:4 · OMAD · 5:2 · by last bite, first meal or your day',
  lead: `Pick a method and tell the calculator your <strong>last bite</strong>, your <strong>first meal</strong> or just when you go to bed — you get your <strong>eating window</strong> on a 24-hour clock, where you are right now, and a <strong>ramp-up plan</strong> if you are building up. On 16:8 with the last bite at 8:00 PM you eat again at <strong>${clk(D168.first)}</strong>.`,
  schema: 'Free intermittent fasting calculator: 12:12, 14:10, 16:8, 18:6, 20:4, OMAD, custom daily fasts, 5:2, alternate-day and 24-72 hour fasts. Set the eating window by last bite, first meal or bedtime, with a 24-hour clock, a live where-am-I-now status, weekday and weekend windows, meal times and a week-by-week ramp-up plan.',
  llms: 'Free intermittent fasting calculator: 16:8, 18:6, 20:4, OMAD, 5:2, alternate-day, custom and 24-72 h fasts; eating window from last bite, first meal or bedtime, 24-hour clock, live status, meal times and a ramp-up plan.',
  card: 'Your eating window for 16:8, 18:6, 20:4, OMAD, 5:2 and more — from your last bite, first meal or bedtime — with a live status and a week-by-week ramp-up.',
  faqs: [
    ['How do I calculate my intermittent fasting window?', `Your fasting window starts at your last bite and lasts the hours of your method; your eating window is the rest of the 24 hours. On 16:8 with the last bite at 8:00 PM you fast 16 hours, so you eat again at ${clk(D168.first)} and the eating window is ${clk(D168f.first)} – ${clk(D168f.last)}. Choose First meal instead if that is the time you know: a first meal at 12:00 PM on 16:8 means the last bite is at ${clk(D168f.last)}.`],
    ['What are the common intermittent fasting schedules?', `The daily ones are 12:12, 14:10, 16:8, 18:6, 20:4 and OMAD (one meal a day, 23:1) — the first number is hours fasting, the second hours eating. 5:2 is normal eating five days a week and no more than ${E.LOW52} calories on two days; alternate-day fasting alternates low days (less than 25% of your usual calories) with normal days. A review of the research (Anton 2018) describes daily time-restricted eating as typically 8–12 hours of eating.`],
    ['Does intermittent fasting help you lose weight?', 'Mostly through eating fewer calories. In a 12-week trial of 116 adults, 16:8 eating (12 pm–8 pm) lost no more weight than three structured meals — −0.94 kg against −0.68 kg, a difference of −0.26 kg that was not significant (Lowe 2020). In a 12-month trial of 139 adults with obesity, adding an 8 a.m.–4 p.m. window to calorie restriction gave −8.0 kg against −6.3 kg, also not a significant difference (−1.8 kg, P = 0.11; Liu 2022). A window can make eating less easier for some people; it is not a shortcut by itself.'],
    ['What is the metabolic switch?', 'It is the point in a fast when the liver’s glycogen runs low and the body shifts toward fat and ketones for fuel. A review of the research (Anton 2018) says it typically occurs between 12 and 36 hours after the last food, depending on the liver glycogen you start with and how much you exercise. The calculator shows where your fast ends against that 12–36 hour range — on 16:8 it ends 4 hours past the 12-hour point.'],
    ['What is the 5:2 diet?', `You eat normally five days a week and eat no more than ${E.LOW52} calories on two days (Anton 2018). Pick the two low days in the calculator. With details added under Go advanced it shows your average calories a day and the weekly calorie gap: for someone who maintains weight on 2,400 kcal, 5:2 averages about ${Math.round(W52.intake)} kcal a day if the other days are eaten at maintenance — about ${(W52.kgWeek).toFixed(2)} kg a week.`],
    ['What is alternate-day fasting?', `Every other day is a low day with less than 25% of your usual energy (alternate-day modified fasting, Anton 2018) and the other days are eaten normally. For someone who maintains weight on 2,400 kcal a low day is up to ${WADF.low} kcal. The calculator shows the 14-day pattern.`],
    ['How do I work up to 16:8 or a longer fast?', `Use Go advanced: enter the hours you fast now and the weeks you want to take. The ramp table moves the window in half-hour steps. From a 12-hour fast to 16 hours over 4 weeks with the last bite fixed at 8:00 PM, the first meal moves from ${clk(RAMP[0].first)} to ${clk(RAMP[1].first)}, ${clk(RAMP[2].first)}, ${clk(RAMP[3].first)} and ${clk(RAMP[4].first)}.`],
    ['What if my weekends are different?', 'Under Go advanced choose “Different at weekends” and enter the weekend time; the result shows both windows, and the live status uses the weekend window on Saturday and Sunday.'],
    ['Can I build my window around when I sleep?', `Yes. Choose “My day”, enter your bedtime and how many hours before bed you want to stop eating (3 if you leave it empty). With a bedtime of 11:00 PM and a 3-hour gap on 16:8, the last bite is at ${clk(DAY.last)} and the first meal at ${clk(DAY.first)}.`],
    ['Who should not try intermittent fasting?', 'Intermittent fasting is not suitable for everyone. Talk to a doctor first if you are pregnant or breastfeeding, are under 18, have had an eating disorder, have diabetes or take medication that has to be taken with food, are underweight, or are considering a fast of 24 hours or more. The calculator asks about these and does not show a schedule for the first three.']
  ],
  pills: [['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'], ['/keto-calculator/', 'Keto Calculator', '<path d="M12 3c4 2 7 5 7 9a7 7 0 0 1-14 0c0-4 3-7 7-9z"/><path d="M12 21V9"/>'], ['/sleep-calculator/', 'Sleep Calculator', '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>'], ['/tdee-calculator/', 'TDEE Calculator', '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>']]
};

const tfld = (id, label, unit, ph, uid, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on, rowId) => `<div class="ctl-row"${rowId ? ' id="' + rowId + '"' : ''}><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label.replace(/<[^>]+>/g, '')}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;
const GHOST = '<span class="g-off">-</span><span class="g-off">-</span><span class="g-sep">:</span><span class="g-off">-</span><span class="g-off">-</span>';
const tfield = (id, label, labId, ap, now) => `<div class="fld if-tf" id="${id}" data-ap="${ap}"><span class="lab"><span id="${labId}">${label}</span>${now ? '<button type="button" class="linkbtn if-now">Now</button>' : ''}</span><div class="time-field"><div class="time-box"><div class="time-ghost" aria-hidden="true">${GHOST}</div><input class="time-digits" type="text" inputmode="numeric" autocomplete="off" maxlength="5" aria-label="${label}"></div><div class="seg ap-seg"><button type="button" data-ap="am">AM</button><button type="button" data-ap="pm">PM</button></div></div></div>`;
const ACT = [[1.2, 'Sedentary — little or no exercise'], [1.375, 'Light — 1–3 days/week'], [1.55, 'Moderate — 3–5 days/week'], [1.725, 'Active — 6–7 days/week'], [1.9, 'Very active — hard training / physical job']];
const DAYN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FLAGS = [['preg', 'I am pregnant or breastfeeding'], ['u18', 'I am under 18'], ['ed', 'I have a history of disordered eating'], ['dm', 'I have diabetes or take medication that has to be taken with food'], ['under', 'I have been told I am underweight']];

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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'HealthApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const input = `
        <h2 class="card-h2">Your schedule</h2>
        ${csel('ifMethod', '16', 'Method', E.METHODS.map((m) => [m.id, m.name]))}
        <div id="ifCustWrap" style="display:none">${tfld('ifCust', 'Fasting hours a day', 'hours (10–23)', 'e.g. 15')}</div>
        <div id="ifExtWrap" style="display:none">${tfld('ifExt', 'Length of the fast', 'hours (24–72)', 'e.g. 36')}</div>
        ${seg('ifClk', 'Clock', [['12', '12-hour'], ['24', '24-hour']], '12', 'ifClkRow')}
        ${seg('ifAnc', 'I know my', [['last', 'Last bite'], ['first', 'First meal'], ['day', 'My day']], 'last', 'ifAncRow')}
        <div id="ifT1Wrap">${tfield('ifT1', 'Last bite', 'ifT1Lab', 'pm', true)}</div>
        <div id="ifDayWrap" style="display:none">${tfield('ifWake', 'Wake-up time (optional)', 'ifWakeLab', 'am', false)}${tfield('ifBed', 'Bedtime', 'ifBedLab', 'pm', false)}${tfld('ifGap', 'Stop eating before bed', 'hours (blank = 3)', 'e.g. 3')}</div>
        <div id="ifDaysWrap" style="display:none"><span class="ctl-lab" style="display:block;margin:0 0 6px">Your two low-calorie days</span><div class="chips-days" id="ifDays">${DAYN.map((d, i) => `<button type="button" data-v="${i}"${i === 0 || i === 3 ? ' class="on"' : ''}>${d}</button>`).join('')}</div></div>
        <div id="ifAdfWrap" style="display:none">${seg('ifAdf', 'Day 1 is a', [['low', 'Low day'], ['normal', 'Normal day']], 'low')}</div>
        <p class="if-h" style="margin-top:6px">Before you start — tick any that apply</p>
        ${FLAGS.map((f) => `<label class="dc-check"><input type="checkbox" id="ifF_${f[0]}"><span>${f[1]}</span></label>`).join('\n        ')}
        <div class="res-hint" id="ifHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="ifAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${seg('ifWk', 'Weekends', [['same', 'Same'], ['diff', 'Different']], 'same', 'ifWkRow')}
          <div id="ifWkWrap" style="display:none">${tfield('ifT2', 'Last bite on weekends', 'ifT2Lab', 'pm', false)}</div>
          ${seg('ifMeals', 'Meals in the window', [[1, '1'], [2, '2'], [3, '3'], [4, '4']], 3, 'ifMealsRow')}
          <div id="ifRampWrap"><p class="if-h">Ramp-up plan (optional)</p><div class="cb-two">${tfld('ifRampFrom', 'Fasting now', 'hours', 'e.g. 12')}${tfld('ifRampWeeks', 'Weeks', 'to get there', 'e.g. 4')}</div></div>
          <p class="if-h">Your details for calories (optional)</p>
          ${seg('ifSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
          ${tfld('ifAge', 'Age', 'years', 'e.g. 35')}
          ${seg('ifHU', 'Height units', [['in', 'inches'], ['cm', 'cm']], 'in')}
          ${tfld('ifHt', 'Height', 'inches or 5\'10', 'e.g. 70 or 5\'10', 'ifHL', 'text')}
          ${seg('ifWU', 'Weight units', [['lb', 'lb'], ['kg', 'kg'], ['st', 'st']], 'lb')}
          ${tfld('ifW', 'Weight', 'lb', 'e.g. 154', 'ifWL')}
          ${csel('ifAct', 1.55, 'Activity level', ACT)}
          ${seg('ifGoal', 'Goal', [['lose', 'Lose weight'], ['maint', 'Maintain'], ['gain', 'Gain']], 'lose')}
          ${seg('ifPace', '<span id="ifPaceLab">Lose per week</span>', [[0, '0.5 lb'], [1, '1 lb'], [2, '1.5 lb'], [3, '2 lb']], 1, 'ifPaceRow')}
          <p class="av-note" style="margin:0 0 8px">Calories come from your resting rate (Mifflin-St Jeor) times your activity level and are split across your meals.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="ifAdvBtn" type="button">
            <span id="ifAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="ifResLab">Eating window</div>
          <div class="res-big"><span id="ifBig">—</span></div>
          <div class="res-sub" id="ifSub" data-empty="Pick a method and enter a time.">Pick a method and enter a time.</div>
        </div>
        <div class="if-warn" id="ifWarn" style="display:none"></div>
        <div id="ifBody" style="display:none">
          <p class="res-tip adv-tip" id="ifTip"></p>
          <div class="if-live" id="ifLive" style="display:none"></div>
          <div id="ifRingBox"><p class="bm-h">Your 24-hour clock today</p><div class="if-ring" id="ifRing"></div></div>
          <div id="ifSwitchBox"><p class="bm-h">Where your fast ends against the 12–36 hour range</p><div id="ifSwitch"></div><p class="cb-note">The metabolic switch typically occurs 12–36 hours after the last food, depending on liver glycogen and exercise (Anton 2018) — a range, not a stopwatch.</p></div>
          <div id="ifStripBox" style="display:none"><p class="bm-h">Your week</p><div id="ifStrip"></div></div>
          <div class="proj-sep"></div>
          <table class="dtable" id="ifRows"></table>
          <div id="ifMealBox"><p class="bm-h">Meals in your window</p><table class="dtable" id="ifMeal"></table><p class="cb-note" id="ifMealNote"></p></div>
          <div id="ifRampBox" style="display:none"><p class="bm-h">Ramp-up plan</p><table class="dtable" id="ifRamp"></table><p class="cb-note" id="ifRampMsg" style="display:none"></p></div>
          <p class="cb-note">For information only — not medical advice. Fasting is not suitable for everyone.</p>
        </div>`;

  const left = `
        <h2>How to use the intermittent fasting calculator</h2>
        <p>Choose a <strong>method</strong>, then tell the calculator the one time you know: your <strong>last bite</strong> of the day, your <strong>first meal</strong>, or your <strong>bedtime</strong> and how long before it you want to stop eating. The result is your eating window, a 24-hour clock with your meals, where you are right now, and where your fast ends against the research range for the metabolic switch.</p>
        <p>For <strong>5:2</strong> pick your two low-calorie days; for <strong>alternate-day</strong> see the 14-day pattern; for a <strong>24–72 hour fast</strong> see when it ends. Go advanced adds a different weekend window, meals, a ramp-up plan and calories from your own details.</p>

        <h2>The fasting window maths</h2>
        <div class="formula">
          first meal = last bite + fasting hours · eating window = 24 − fasting hours
          <small>16:8 = 16 HOURS FASTING, 8 HOURS EATING</small>
        </div>
        <p>Last bite at 8:00 PM on 16:8: 8:00 PM + 16 h = <strong>${clk(D168.first)}</strong>, so you eat ${clk(D168f.first)} – ${clk(D168f.last)} (8 hours). Know the first meal instead — 12:00 PM — and the last bite is 12:00 PM + 8 h = ${clk(D168f.last)}. On 18:6 with the same last bite the first meal is ${clk(D186.first)}.</p>

        <h2>Every daily method, with a last bite at 8:00 PM</h2>
        <table class="dtable"><thead><tr><th>Method</th><th>Fasting</th><th>Eating</th><th>Eating window</th></tr></thead><tbody>${methodsTbl}</tbody></table>`;
  const right = `
        <h2>Does the eating window help you lose weight?</h2>
        <p>The two long trials found that a window on its own gave no significant extra weight loss. In the 12-week TREAT trial (Lowe 2020, 116 adults) 16:8 from 12 pm to 8 pm lost −0.94 kg against −0.68 kg for three structured meals — a difference of −0.26 kg (P = .63). In a 12-month trial (Liu 2022, 139 adults with obesity) an 8 a.m.–4 p.m. window plus calorie restriction lost −8.0 kg against −6.3 kg for calorie restriction alone, a difference of −1.8 kg (95% CI −4.0 to 0.4; P = 0.11). Total calories still decide; a window helps if it makes eating less easier for you. Work out your calories with the <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>.</p>

        <h2>The metabolic switch</h2>
        <p>The review by Anton and colleagues (2018) describes the metabolic switch as the shift from glucose to fatty acids and ketones when liver glycogen is used up, and says it typically occurs between 12 and 36 hours after the last food — earlier or later depending on how much glycogen you start with and how much you exercise. A 16-hour daily fast therefore ends 4 hours past the 12-hour mark; most people’s daily windows never reach 36 hours.</p>

        <h2>5:2 and alternate-day fasting</h2>
        <p>The 5:2 diet is normal eating five days and no more than ${E.LOW52} calories on two days. Alternate-day modified fasting uses less than 25% of baseline energy on the low days. If you maintain your weight on 2,400 kcal, 5:2 averages ${Math.round(W52.intake)} kcal a day (a weekly gap of ${Math.round(W52.deficit * 7).toLocaleString('en-US')} kcal, about ${W52.kgWeek.toFixed(2)} kg) and alternate-day averages ${Math.round(WADF.intake)} kcal if the normal days are eaten at maintenance.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-if">
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
    <span class="mbar-lab" id="ifMLab">Eating window</span>
    <div class="mbar-vals"><b id="ifMVal">—</b></div>
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
<script>CalcThis.initFastCalc();</script>
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
function edit(rel, fn) { const fl = ROOT + rel; let s = fs.readFileSync(fl, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fl, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
const prevSlug = 'net-carb-calculator', prevMenu = 'Net Carb', prevName = 'Net Carb Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s) => s.includes("slug: '" + slug + "'") ? s : s.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <a href="' + ps + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <li><a href="' + ps + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + slug + '"') ? s : s.replace('  "/dog-age-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/dog-age-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5"/>
          <path d="M16 8v8l5 3" stroke="#37503F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="/steps-to-miles-calculator/">', () => card + '    <a class="calc" href="/steps-to-miles-calculator/">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — your eating window for 16:8, 18:6, 20:4, OMAD and 5:2, with a ramp-up plan</span></li>\n');
    return h;
  });
}
