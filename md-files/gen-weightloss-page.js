const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /weight-loss-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.wlEngine / deficitEngine / bmrEngine. Run: node md-files/gen-weightloss-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['BMR', 'DEFICIT', 'WL'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.wlEngine, D = CalcThis.deficitEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
const g0 = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const LB = 2.20462;

/* ---------- worked example: woman, 35, 168 cm, 80 kg, light activity (x1.375), goal 70 kg in 20 weeks ---------- */
const X = { male: false, W: 80, H: 168, A: 35, f: 1.375, formula: 'mifflin', bf: null };
const M = D.maint(X), s = D.slope(X);
const bmr = CalcThis.bmrEngine.mifflin(false, 80, 168, 35);
const DAYS = 140, W0 = 80, G0 = 70;
const ps = D.forDate(M, s, W0, G0, DAYS, 'simple'), pr = D.forDate(M, s, W0, G0, DAYS, 'real');
const wkKg = ps.D * 7 / 7700;
const ES = E.earliest(M, s, W0, G0, false);
const ex8 = D.forDate(M, s, W0, G0, 8 * 7, 'simple');
const byRows = [8, 12, 16, 20, 26, 52].map((wk) => { const p = D.forDate(M, s, W0, G0, wk * 7, 'simple'), per = (W0 - G0) / wk, low = p.I < 1200 ? ' <small>below the 1,200 minimum</small>' : (per > E.CAP_KG ? ' <small>over 2 lb a week</small>' : (per > 0.01 * W0 ? ' <small>over 1% a week</small>' : '')); return '<tr><td>' + (wk === 26 ? '6 months' : (wk === 52 ? '1 year' : wk + ' weeks')) + '</td><td>' + g0(p.I) + ' kcal' + low + '</td><td>' + f2(per) + ' kg (' + f2(per * LB) + ' lb)</td></tr>'; }).join('');
const paceRows = [0.25, 0.5, 0.75, 1].map((k) => '<tr><td>' + f2(k) + ' kg (' + f2(k * LB) + ' lb) a week</td><td>' + g0(k * 7700 / 7) + ' kcal</td><td>' + g0(M - k * 7700 / 7) + ' kcal</td></tr>').join('');

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Centers for Disease Control and Prevention, <a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html" rel="noopener">Steps for Losing Weight</a> (updated 2025-01-17, read 2026-11-06): people who lose weight at a gradual, steady pace — about 1 to 2 pounds a week — are more likely to keep it off; a 5% weight reduction for a person who weighs 200 pounds is 10 pounds, which can lower the risk of some chronic diseases.</li>
          <li>National Heart, Lung, and Blood Institute, <a href="https://www.nhlbi.nih.gov/health/heart-healthy-living/healthy-weight" rel="noopener">Aim for a Healthy Weight</a> (updated 2025-12-11, read 2026-11-06): for people with overweight or obesity, health professionals recommend losing 5% to 10% of initial weight over about 6 months; a loss of 3% to 5% can lower triglycerides and blood glucose.</li>
          <li>Competitor pages opened 2026-11-06 for their inputs: FatCalc (NIH body-weight model; keeps intake at or above 1,200 kcal for women and 1,500 for men) and Alma (plan by a goal date or a weekly pace).</li>
          <li>Maintenance: Mifflin-St Jeor times the activity factor (or Katch-McArdle with body fat), as on our <a href="/bmr-calculator/">BMR calculator</a>. The energy rule of 7,700 kcal per kg (3,500 per lb) and the “you burn less as you get lighter” estimate are the same models used on our <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>; they are estimates, not measurements. The 1,200 and 1,500 kcal figures are the commonly used minimums; no single primary source was read for them.</li>
        </ul>
        <p><small>For information only, not medical advice. If you are under 18, pregnant or breastfeeding, have a medical condition or a history of disordered eating, talk to a clinician before cutting calories.</small></p>`;

const P = {
  slug: 'weight-loss-calculator', name: 'Weight Loss Calculator', menu: 'Weight Loss',
  title: 'Weight Loss Calculator by Date — Calories to Reach Goal',
  desc: 'Weight loss calculator by date: enter your goal weight and a target date to get the calories to eat a day, the weekly loss and the fastest safe date.',
  h1: 'Weight Loss Calculator by Date', eyebrow: 'Goal weight · target date or pace · calories a day · fastest safe date',
  lead: `Enter your <strong>weight</strong>, <strong>goal weight</strong> and a <strong>target date</strong> — you get the <strong>calories to eat a day</strong>, how much you lose a week and the <strong>fastest date within the guidelines</strong>. A woman of 80 kg and 168 cm who wants to reach <strong>70 kg in 20 weeks</strong> burns about <strong>${g0(M)} kcal</strong> and eats about <strong>${g0(ps.I)} kcal</strong>.`,
  schema: 'Free weight loss calculator by date: calories to eat a day to reach a goal weight by a target date (or at a weekly pace), from Mifflin-St Jeor maintenance, with the simple 7,700 kcal rule and a realistic estimate side by side, the fastest date within the guidelines, a weight curve, milestone dates and calories for six target dates.',
  llms: 'Free weight loss calculator by date: goal weight + target date (or pace) to calories a day, weekly loss, fastest safe date, weight curve and calories for six target dates, simple and realistic estimates.',
  card: 'Goal weight and a target date to calories a day: weekly loss, the fastest safe date, milestone dates and a weight curve.',
  faqs: [
    ['How do I calculate weight loss by a date?', `Work out the weight to lose, turn it into calories, and spread it over the days you have. For the example (80 kg to 70 kg in 20 weeks): 10 kg × 7,700 kcal ÷ 140 days = <strong>${g0(ps.D)} kcal</strong> a day. Your maintenance is ${g0(M)} kcal (Mifflin-St Jeor ${g0(bmr)} × 1.375), so you eat ${g0(M)} − ${g0(ps.D)} = <strong>${g0(ps.I)} kcal</strong>. The calculator does this for your numbers and checks it against the minimum and pace limits.`],
    ['How many calories should I eat to lose weight by a date?', `Your maintenance minus the daily deficit the date needs. In the example the date needs ${g0(ps.D)} kcal a day, so about ${g0(ps.I)} kcal. A closer date needs a bigger deficit: the same goal in 8 weeks would need ${g0(ex8.D)} kcal a day, leaving ${g0(ex8.I)} kcal, which the calculator flags as too fast.`],
    ['How fast can I lose weight safely?', `The CDC says people who lose weight at a gradual, steady pace — about 1 to 2 pounds (0.45–0.9 kg) a week — are more likely to keep it off, and NHLBI recommends 5% to 10% of initial weight over about 6 months for people with overweight or obesity. The calculator flags a plan faster than 2 lb a week or 1% of your body weight a week, or one that puts you under 1,200 kcal (women) or 1,500 kcal (men).`],
    ['What if my target date is too soon?', `The calculator still shows the calories the date would need, flags them, and gives the <strong>fastest date within the guidelines</strong> — for the example, ${(() => { const d = ES.simple; return Math.round(d / 7) + ' weeks'; })()} eating ${g0(ES.I)} kcal. If the date would need more calories than you burn, it says so and shows that date instead of a blank result.`],
    ['Why are there two numbers, simple and realistic?', `The simple rule treats your body as a machine that burns the same every day: 7,700 kcal per kg, spread evenly. In real life you burn about ${g0(s)} kcal less a day for every kg you lose, so the same intake becomes a smaller deficit. To still arrive on the date you have to start lower: ${g0(pr.I)} kcal at first instead of ${g0(ps.I)} for the example, rising as you lose. The calculator shows both and lets you choose the headline under Go advanced.`],
    ['How many calories is 1 kg or 1 lb of weight loss?', 'About 7,700 kcal per kg, or 3,500 per lb, is the usual rule of thumb used here as the simple estimate. It is an approximation: the real mix of fat, muscle and water changes with the person, and your body burns less as you lose weight, which is why the realistic estimate is shown too.'],
    ['How much weight can I lose in a month?', `At the pace of 0.5 kg (1.1 lb) a week it is about ${f1(0.5 * 52 / 12)} kg (${f1(0.5 * 52 / 12 * LB)} lb) a month, which needs a deficit of ${g0(0.5 * 7700 / 7)} kcal a day. At 1 kg (2.2 lb) a week it is about ${f1(52 / 12)} kg a month and ${g0(1 * 7700 / 7)} kcal a day — more than the CDC’s 1 to 2 pounds a week for most people. Use “At a pace” to see the date a pace gives.`],
    ['What percentage of my body weight is this?', `The calculator shows it for you: 10 kg of 80 kg is ${f1(10 / 80 * 100)}% of the example’s body weight, which is in the 5–10% range NHLBI gives for about 6 months. Our <a href="/percentage-change-calculator/">percentage change calculator</a> works out any other before-and-after figure.`],
    ['Is this the same as the calorie deficit calculator?', 'They use the same energy model but start from different questions. This page starts from a goal weight and a date and gives you the calories. The <a href="/calorie-deficit-calculator/">calorie deficit calculator</a> starts from a deficit, a pace or what you eat, and the <a href="/calorie-calculator/">calorie calculator</a> gives a pace table with a protein target.'],
    ['Can I use it to gain weight?', 'No — it plans a loss. For a calorie surplus use the <a href="/bulking-calculator/">bulking calculator</a>.']
  ],
  pills: [['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'], ['/tdee-calculator/', 'TDEE Calculator', '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>'], ['/calorie-calculator/', 'Calorie Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/bmi-calculator/', 'BMI Calculator', '<path d="M12 4v16M5 9l7-5 7 5"/>']]
};

const tfld = (id, label, unit, ph, uid, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;
const actOpts = [['1.2', 'Sedentary — little or no exercise'], ['1.375', 'Light — 1–3 days/week'], ['1.55', 'Moderate — 3–5 days/week'], ['1.725', 'Active — 6–7 days/week'], ['1.9', 'Very active — hard training / physical job']];

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
        <h2 class="card-h2">About you</h2>
        ${seg('wlSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${seg('wlMain', 'Calories you burn', [['est', 'Estimate it'], ['known', 'I know it']], 'est')}
        <div id="wlEstWrap">
          ${tfld('wlAge', 'Age', 'years', 'e.g. 35', null, 'numeric')}
          ${seg('wlHU', 'Height units', [['cm', 'cm'], ['in', 'inches'], ['m', 'm']], 'in')}
          ${tfld('wlH', 'Height', 'inches or 5\'10', 'e.g. 66 or 5\'6', 'wlHL', 'text')}
          ${csel('wlAct', '1.375', 'Activity level', actOpts)}
        </div>
        <div id="wlKnownWrap" style="display:none">
          ${tfld('wlMaint', 'Calories you burn', 'kcal a day · your maintenance', 'e.g. 2100', null, 'numeric')}
          <p class="av-note" style="margin:0 0 8px">The calories you burn in a day to stay at your weight (also called maintenance), for example from tracking your food and weight for a few weeks. It is used as given; weight is still needed.</p>
        </div>
        ${seg('wlWU', 'Weight units', [['kg', 'kg'], ['lb', 'lb'], ['st', 'st']], 'lb')}
        ${tfld('wlW', 'Current weight', 'lb', 'e.g. 185', 'wlWL')}
        ${tfld('wlG', 'Goal weight', 'lb', 'e.g. 165', 'wlGL')}
        <div class="proj-sep"></div>
        <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Plan by</span><div class="modeseg" id="wlPlan" role="group" aria-label="Plan by"><button class="on" type="button" data-v="date">A target date</button><button type="button" data-v="pace">A weekly pace</button></div></div>
        <div id="wlDateWrap" style="margin-top:14px">
          <label class="fld" for="wlDate" style="margin-bottom:0"><span class="lab">Reach my goal by</span><div class="inp"><input id="wlDate" type="text" autocomplete="off" placeholder="Pick a date"></div></label>
        </div>
        <div id="wlPaceWrap" style="display:none;margin-top:14px">
          <label class="fld" for="wlPace" style="margin-bottom:0"><span class="lab">Weight loss <span class="unit" id="wlPaceL">lb a week</span></span><div class="inp"><input id="wlPace" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 1"></div></label>
        </div>
        <div class="chips" id="wlChips"></div>
        <p class="av-note" id="wlPaceNote" style="display:none;margin:8px 0 8px">Leave it empty to start at 1 lb (0.5 kg) a week, the gentle end of the CDC’s 1 to 2 pounds.</p>
        <div class="res-hint" id="wlHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="wlAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Headline estimate</span><div class="modeseg" id="wlModel" role="group" aria-label="Headline estimate"><button class="on" type="button" data-v="simple">Simple rule</button><button type="button" data-v="real">Realistic</button></div></div>
          <p class="av-note" style="margin:0 0 8px">Both are always shown below. Realistic allows for burning less as you lose, so it starts lower.</p>
          ${tfld('wlBf', 'Body fat', '% · optional, uses Katch-McArdle', 'e.g. 30')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="wlAdvBtn" type="button">
            <span id="wlAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Calories a day to reach your goal</div>
          <div class="res-big"><span id="wlBig">—</span></div>
          <div class="res-sub" id="wlSub" data-empty="Enter your weight, goal weight and a date.">Enter your weight, goal weight and a date.</div>
        </div>
        <div id="wlBody" style="display:none">
          <p class="res-tip adv-tip" id="wlTip"></p>
          <div id="wlFlags"></div>
          <div id="wlRows"></div>
          <p class="bm-h">What you eat and what you burn</p>
          <div id="wlBar"></div>
          <p class="bm-h">Weight over time</p>
          <div id="wlChart"></div>
          <div class="bm-key"><span><i class="wl-lr"></i>Realistic (you burn less as you lose)</span><span><i class="wl-ls"></i>Simple 7,700 rule</span></div>
          <p class="av-note" id="wlNoGoal" style="display:none">Add a goal weight for the date. The chart shows the next 16 weeks.</p>
          <div id="wlMileWrap" style="display:none">
            <p class="bm-h">Where you should be on the way</p>
            <table class="dtable" id="wlMile"></table>
          </div>
          <div id="wlByDateWrap" style="display:none">
            <p class="bm-h">Calories for other target dates</p>
            <table class="dtable" id="wlByDate"></table>
            <p class="cb-note">Click a row to plan for that date.</p>
          </div>
          <p class="cb-note">An estimate for adults, not medical advice. The 7,700 kcal per kg rule is a simplification, and how fast you lose varies from person to person.</p>
        </div>`;

  const left = `
        <h2>How to use the weight loss calculator</h2>
        <p>Pick <strong>female or male</strong>, enter your <strong>age</strong>, <strong>height</strong>, <strong>activity level</strong>, <strong>current weight</strong> and <strong>goal weight</strong> — or, next to <strong>Calories you burn</strong>, choose <strong>I know it</strong> and type the calories you burn a day (your maintenance). Then pick a <strong>target date</strong> (or tap 4 weeks, 12 weeks, 6 months), or switch to <strong>a weekly pace</strong> to see the date it gives.</p>
        <p>You get the calories to eat a day, the loss per week as a share of your body weight, the <strong>fastest date within the guidelines</strong>, a weight curve, milestone dates and the calories for six other target dates. Open <strong>Go advanced</strong> to choose the realistic estimate as the headline or to enter your body fat.</p>

        <h2>The weight loss by date formula</h2>
        <div class="formula">
          Calories a day = maintenance − (weight to lose × 7,700 ÷ days)
          <small>MAINTENANCE = BMR × ACTIVITY FACTOR · 7,700 KCAL PER KG (3,500 PER LB)</small>
        </div>
        <p>For a woman of 35, 168 cm and 80 kg with light activity: BMR (Mifflin-St Jeor) = ${g0(bmr)} kcal, maintenance = ${g0(bmr)} × 1.375 = <strong>${g0(M)} kcal</strong>. To lose 10 kg in 140 days she needs a deficit of 10 × 7,700 ÷ 140 = <strong>${g0(ps.D)} kcal</strong> a day, so she eats about <strong>${g0(ps.I)} kcal</strong> and loses ${f2(wkKg)} kg (${f2(wkKg * LB)} lb) a week.</p>

        <h2>Safe pace and minimums</h2>
        <ul>
          <li><strong>1 to 2 pounds a week.</strong> The CDC links a gradual, steady pace of about 1 to 2 pounds (0.45–0.9 kg) a week with keeping the weight off.</li>
          <li><strong>5–10% over about 6 months.</strong> NHLBI’s recommendation for people with overweight or obesity.</li>
          <li><strong>A floor on what you eat.</strong> The calculator flags under 1,200 kcal for women or 1,500 for men, the commonly used minimums.</li>
          <li><strong>Under 18, pregnant or with a medical condition:</strong> talk to a doctor before cutting calories.</li>
        </ul>`;
  const right = `
        <h2>Calories for other target dates</h2>
        <table class="dtable"><thead><tr><th>Reach 70 kg in</th><th>Eat a day</th><th>Loss a week</th></tr></thead><tbody>${byRows}</tbody></table>
        <p>Same woman, simple rule: the shorter the time, the lower the calories — and the faster the pace. The calculator flags the rows that go below the minimum or past 2 lb (0.9 kg) a week.</p>

        <h2>Calories by weekly pace</h2>
        <table class="dtable"><thead><tr><th>Loss a week</th><th>Deficit</th><th>Eat (maintenance ${g0(M)})</th></tr></thead><tbody>${paceRows}</tbody></table>
        <p>The deficit is the loss per week × 7,700 ÷ 7. About 0.45 kg (1 lb) a week needs roughly 500 kcal a day.</p>

        <h2>Simple rule or realistic?</h2>
        <p>The simple rule spreads 7,700 kcal per kg evenly. In real life you burn about <strong>${g0(s)} kcal less per kg lost</strong>, so the same intake gives a smaller deficit as you get lighter. To arrive on the same date the realistic plan starts lower — ${g0(pr.I)} kcal instead of ${g0(ps.I)} in the example — and rises as you lose. The weight curve plots both. See also the <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-wl">
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
    <span class="mbar-lab" id="wlMLab">Calories a day for your goal</span>
    <div class="mbar-vals"><b id="wlMVal">—</b></div>
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

<script src="/assets/datepicker.min.js"></script>
<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initWlCalc();</script>
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
const prevSlug = 'bulking-calculator', prevMenu = 'Bulking', prevName = 'Bulking Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps2 + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "/bulking-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/bulking-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M16 6v17M9 17l7 7 7-7" stroke="#37503F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="16" cy="6" r="2.2" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — calories a day to reach a goal weight by a target date: weekly loss, fastest safe date, weight curve and milestone dates</span></li>\n');
    return h;
  });
}
