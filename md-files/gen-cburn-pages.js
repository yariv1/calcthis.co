const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /calories-burned-calculator/ (hub: By activity + Walk or run), /calories-burned-walking-calculator/ and
   /calories-burned-running-calculator/ (speed + incline, ACSM equations) and registers all three (sitemap, build.js PAGES, llms.txt,
   header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json). Every number in the text comes from CalcThis.cburnEngine.
   Run: node md-files/gen-cburn-pages.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* CBURN-ENGINE:START */'), app.indexOf('/* CBURN-ENGINE:END */')));
const E = CalcThis.cburnEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const f = (x, d) => (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const g0 = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const LB = 2.20462;
const kgOf = (lb) => lb / LB;
const kc = (met, lb, min) => E.perMin(met, kgOf(lb)) * min;            // total kcal
const nt = (met, lb, min) => (E.perMin(met, kgOf(lb)) - E.perMin(1, kgOf(lb))) * min; // extra kcal
const act = (name) => { const a = E.find(name); if (!a) throw new Error('no activity ' + name); return a; };
const vmet = (mode, mph, gr) => E.vo2(mode, mph * E.MPH, gr || 0) / 3.5;
const WTS = [125, 155, 185];
const wLab = (lb) => lb + ' lb (' + Math.round(kgOf(lb)) + ' kg)';

/* ---------- worked numbers ---------- */
const RUN = act('Running, 6.0–6.3 mph (10 min/mile)');
const runKcal = kc(RUN.met, 155, 30), runNet = nt(RUN.met, 155, 30);
const wk35 = vmet('walk', 3.5), wk3 = vmet('walk', 3), wk3i5 = vmet('walk', 3, 5), wk3i10 = vmet('walk', 3, 10);
const rn6 = vmet('run', 6), rn8 = vmet('run', 8);
const TBL = ['Walking, brisk (3.5–3.9 mph)', 'Running, 6.0–6.3 mph (10 min/mile)', 'Cycling, 12–13.9 mph, moderate effort', 'Swimming laps, freestyle, slow (recreational)', 'Elliptical trainer, moderate effort', 'Weight training, multiple exercises (8–15 reps)', 'High-intensity interval training, moderate', 'Yoga, Hatha or general', 'Dancing, nightclub, disco or line dancing, vigorous', 'Tennis, singles', 'Hiking, cross country', 'Cleaning house, moderate effort'];
const tblAct = TBL.map((n) => { const a = act(n); return '<tr><td>' + n + '</td><td>' + f(a.met, 1) + '</td>' + WTS.map((w) => '<td>' + g0(kc(a.met, w, 30)) + '</td>').join('') + '</tr>'; }).join('');
const spdTbl = (mode, speeds, minutes, label) => speeds.map((s) => '<tr><td>' + s + ' mph (' + f(s * E.MPH, 1) + ' km/h)</td>' + WTS.map((w) => '<td>' + g0(E.perMin(vmet(mode, s), kgOf(w)) * minutes) + '</td>').join('') + '</tr>').join('');
const perMile = (mode, speeds) => speeds.map((s) => '<tr><td>' + s + ' mph (' + f(60 / s, 1).replace(/\.0$/, '') + ' min/mile)</td>' + WTS.map((w) => '<td>' + g0(E.perMin(vmet(mode, s), kgOf(w)) * 60 / s) + '</td>').join('') + '</tr>').join('');
const inclTbl = [0, 2, 5, 8, 10].map((g) => '<tr><td>' + g + '%</td><td>' + f(vmet('walk', 3, g), 1) + '</td>' + WTS.map((w) => '<td>' + g0(E.perMin(vmet('walk', 3, g), kgOf(w)) * 60) + '</td>').join('') + '</tr>').join('');
const thead = (first, a, b) => '<thead><tr><th>' + first + '</th>' + (a ? '<th>' + a + '</th>' : '') + WTS.map((w) => '<th>' + wLab(w) + '</th>').join('') + '</tr></thead>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Herrmann SD, Willis EA, Ainsworth BE et al., <a href="https://pacompendium.com/" rel="noopener">2024 Adult Compendium of Physical Activities</a>, Journal of Sport and Health Science 2024;13:6–12 — the MET value of every activity in the list (read on pacompendium.com, November 2026).</li>
          <li>American College of Sports Medicine, <em>Guidelines for Exercise Testing and Prescription</em> — the walking and running metabolic equations (VO₂ = 0.1·speed + 1.8·speed·grade + 3.5 and 0.2·speed + 0.9·speed·grade + 3.5, speed in m/min) and the 3.5 mL O₂/kg/min resting convention behind “calories = MET × 3.5 × kg ÷ 200”.</li>
          <li>Mifflin MD et al., A new predictive equation for resting energy expenditure, American Journal of Clinical Nutrition 1990;51:241 — the optional personalised resting rate.</li>
          <li>USDA <a href="https://fdc.nal.usda.gov/" rel="noopener">FoodData Central</a> (SR Legacy) — the food equivalents: banana 105, cola 150, large egg 72, medium apple 95, tablespoon of olive oil 119 kcal (per-100 g values × a typical portion, rounded).</li>
          <li>The 7,700 kcal per kilogram of body fat (about 3,500 per pound) is the usual rule of thumb; real weight change varies from person to person.</li>
        </ul>
        <p><small>An estimate for information only — calories burned vary with fitness, body composition, terrain and technique. Not medical or dietary advice.</small></p>`;

const pillIco = {
  fire: '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>',
  calc: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="M12 21l1-6-3-3 2-5 4 2 2 3M9 21l1-5"/>',
  pace: '<circle cx="12" cy="13" r="8"/><path d="M12 13l3-4M9 2h6"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z"/>',
  scale: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'
};
const PAGES = {
  hub: {
    slug: 'calories-burned-calculator', name: 'Calories Burned Calculator', menu: 'Calories Burned',
    title: 'Calories Burned Calculator — Any Activity or Workout',
    desc: 'Calories burned calculator for ' + E.ACT.length + ' activities: total and extra calories, other activities side by side, walking and running by speed and incline.',
    h1: 'Calories Burned Calculator', eyebrow: 'Any activity · walking and running by pace · total and extra calories',
    lead: `Pick an <strong>activity</strong>, add your <strong>time</strong> and <strong>weight</strong> — you get the calories burned <strong>and</strong> how many of them are extra, beyond what you would burn resting anyway. A <strong>155 lb</strong> person running at 6 mph for 30 minutes burns about <strong>${g0(runKcal)} kcal</strong>, of which about ${g0(runNet)} is extra.`,
    schema: 'Free calories burned calculator: ' + E.ACT.length + ' activities from the 2024 Compendium of Physical Activities, walking and running by speed, pace and incline (ACSM equations), total vs extra calories, other activities for the same time, time to burn a goal, an optional personalised resting rate and a day tally.',
    llms: 'Free calories burned calculator for ' + E.ACT.length + ' activities (Compendium METs) with total and extra calories, a same-time comparison, walking and running by speed and incline, time to burn a goal and a day tally.',
    card: 'Calories burned for ' + E.ACT.length + ' activities — total and extra, other activities side by side, walking and running by speed and incline, and a tally for your whole day.',
    faqs: [
      ['How do I calculate calories burned?', `Calories burned = MET × 3.5 × weight in kg ÷ 200 per minute, times the minutes. A 155 lb (70.3 kg) person running at 6.0–6.3 mph (MET ${f(RUN.met, 1)}) for 30 minutes burns ${f(RUN.met, 1)} × 3.5 × 70.3 ÷ 200 × 30 = ${g0(runKcal)} kcal. The calculator does the arithmetic from the activity list, so you only enter the activity, the time and your weight.`],
      ['What is a MET?', 'A MET (metabolic equivalent) is how many times more energy an activity uses than sitting quietly. Sitting is 1 MET, brisk walking about 4.8, running at 6 mph about 9.3. The values here come from the 2024 Adult Compendium of Physical Activities. Multiply by body weight and time to get calories.'],
      ['What is the difference between total and extra calories?', `Your body burns calories even at rest, so the total for a workout includes calories you would have burned anyway. The “extra” (net) figure subtracts the resting part — for the 30-minute run above, ${g0(runKcal)} kcal in total but about ${g0(runNet)} kcal extra. If you are counting what a workout adds to your day, the extra figure is the fairer one; many calculators show only the total.`],
      ['How many calories does walking burn?', `At a brisk 3.5–3.9 mph a 155 lb person burns about ${g0(kc(act('Walking, brisk (3.5–3.9 mph)').met, 155, 60))} kcal an hour. The <a href="/calories-burned-walking-calculator/">walking calculator</a> works from your speed and incline instead, so a hill or a faster pace is reflected.`],
      ['How many calories does running burn?', `At 6.0–6.3 mph a 155 lb person burns about ${g0(kc(RUN.met, 155, 60))} kcal an hour, or about ${g0(kc(RUN.met, 155, 60) / 6.15)} kcal a mile. The <a href="/calories-burned-running-calculator/">running calculator</a> takes your pace and any incline.`],
      ['How accurate is a calories burned calculator?', 'It is an estimate. The MET system is built on an average adult, so fitter people, people with more muscle, older people and people who stop and start during an activity can differ by 10–30%. Use the number to compare activities and track trends rather than as an exact count. The advanced option replaces the standard resting rate with one worked out from your age, sex and height, which can tighten it.'],
      ['How do I find how long it takes to burn a number of calories?', 'Open Go advanced, enter the calories you want to burn, and the result adds how long that takes at the activity you chose. The “same time, other activities” list lets you compare how quickly other activities would get there.'],
      ['Can I add several activities for one day?', 'Yes. After each calculation press “Add to my day”. The list keeps a running total of calories, the extra over resting, and the body-fat equivalent of the extra.'],
      ['Does the calculator use my age and sex?', 'The standard estimate does not — it works from activity, time and weight like the published tables. If you add your sex, age and height under Go advanced, the calculator uses your own resting metabolic rate (Mifflin-St Jeor) in place of the standard 3.5 mL/kg/min, and shows the standard estimate beside it.']
    ],
    pills: [['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', pillIco.calc], ['/tdee-calculator/', 'TDEE Calculator', pillIco.fire], ['/steps-to-miles-calculator/', 'Steps to Miles', pillIco.walk], ['/heart-rate-zone-calculator/', 'Heart Rate Zones', pillIco.heart]]
  },
  walk: {
    slug: 'calories-burned-walking-calculator', name: 'Calories Burned Walking Calculator', menu: 'Calories Burned Walking',
    title: 'Calories Burned Walking Calculator — Speed, Incline, Time',
    desc: 'Calories burned walking calculator: enter your speed or distance and time, plus incline and weight, to get total and extra calories (ACSM equation).',
    h1: 'Calories Burned Walking Calculator', eyebrow: 'Walking · speed, distance, time and incline · treadmill or outdoors',
    lead: `Enter any <strong>two</strong> of distance, time and speed (or pace) — the third fills in — add an <strong>incline</strong> and your <strong>weight</strong>. A <strong>155 lb</strong> person walking at 3 mph burns about <strong>${g0(E.perMin(wk3, kgOf(155)) * 60)} kcal an hour</strong> on the flat and about <strong>${g0(E.perMin(wk3i5, kgOf(155)) * 60)}</strong> at a 5% incline.`,
    schema: 'Free calories burned walking calculator: distance, time, speed or pace with incline and weight, using the ACSM walking equation. Shows total and extra calories, calories per mile or km, other speeds side by side, steps converted to distance and time to burn a goal.',
    llms: 'Free calories burned walking calculator: distance, time, speed or pace plus incline and weight (ACSM walking equation), total and extra calories, per mile or km, other speeds side by side.',
    card: 'Calories burned walking from your speed, distance or time and an incline — total and extra, per mile or km, with other speeds side by side.',
    faqs: [
      ['How many calories does walking burn?', `It depends on weight, speed and incline. A 155 lb (70.3 kg) person burns about ${g0(E.perMin(wk3, kgOf(155)) * 60)} kcal an hour walking 3 mph on flat ground, about ${g0(E.perMin(vmet('walk', 3.5), kgOf(155)) * 60)} at 3.5 mph and about ${g0(E.perMin(wk3i5, kgOf(155)) * 60)} at 3 mph up a 5% grade (ACSM walking equation). Enter your own numbers in the calculator above.`],
      ['How do I calculate calories burned walking?', `The ACSM walking equation gives oxygen use: VO₂ = 0.1 × speed + 1.8 × speed × grade + 3.5 (speed in metres a minute, grade as a fraction). Divide by 3.5 for METs, then calories a minute = METs × 3.5 × weight in kg ÷ 200. At 3 mph (80.5 m/min) flat that is ${f(wk3, 2)} METs, so ${g0(E.perMin(wk3, kgOf(155)) * 60)} kcal an hour for a 155 lb person.`],
      ['How many calories does walking a mile burn?', `For a 155 lb person walking at 3 mph on flat ground, about ${g0(E.perMin(wk3, kgOf(155)) * 60 / 3)} kcal a mile (${g0(E.perMin(wk3, kgOf(155)) * 60 / 3 * 0.621371)} a kilometre), of which about ${g0((E.perMin(wk3, kgOf(155)) - E.perMin(1, kgOf(155))) * 60 / 3)} is extra beyond what you would burn resting for the same 20 minutes. The calculator shows both for your numbers.`],
      ['How many calories does 10,000 steps burn?', 'Steps depend on stride length, so the calculator turns steps into a distance from your height (stride ≈ 0.415 × height for women, 0.413 for men) — open Go advanced, add your height and enter your steps. The distance then flows into the walking equation with your speed or time. Our <a href="/steps-to-miles-calculator/">steps to miles calculator</a> shows the conversion on its own.'],
      ['Does walking uphill burn more calories?', `Yes — a lot more. At 3 mph a 155 lb person burns about ${g0(E.perMin(wk3, kgOf(155)) * 60)} kcal an hour flat, ${g0(E.perMin(vmet('walk', 3, 5), kgOf(155)) * 60)} at 5% and ${g0(E.perMin(vmet('walk', 3, 10), kgOf(155)) * 60)} at 10%. On a treadmill, set the incline to the percent grade and enter it above.`],
      ['Is this the same on a treadmill?', 'Yes. The ACSM equation was built from treadmill and track measurements, so a treadmill walk at a set speed and incline fits it directly. Outdoors, wind, surface and stopping make the real figure a little different.'],
      ['Why does the calculator stop being reliable above 4 mph?', `The ACSM walking equation is validated from about 1.9 to 3.7 mph and is generally stretched to about 4 mph; above that, people change gait and it reads low (at 4.5 mph it gives ${f(vmet('walk', 4.5), 1)} METs where the Compendium lists 7.0 for 4.5–4.9 mph). For a fast walk, pick “Walking, fast (4.5–4.9 mph)” in the <a href="/calories-burned-calculator/">all-activities calculator</a>, or use Running above about 5 mph.`],
      ['What is the difference between total and extra calories?', 'The total includes the calories your body would burn resting over the same time. The extra figure subtracts them — it is what the walk adds to your day, and the number to use if you are working out a calorie deficit.'],
      ['Does downhill walking burn fewer calories?', 'Yes, but the ACSM equation does not model downhill, so enter 0 for flat ground (a slight overestimate). The all-activities calculator has a downhill walking entry (−3% to −12% treadmill) from the Compendium.']
    ],
    pills: [['/calories-burned-calculator/', 'Calories Burned (all activities)', pillIco.fire], ['/steps-to-miles-calculator/', 'Steps to Miles', pillIco.walk], ['/pace-calculator/', 'Pace Calculator', pillIco.pace], ['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', pillIco.calc]]
  },
  run: {
    slug: 'calories-burned-running-calculator', name: 'Calories Burned Running Calculator', menu: 'Calories Burned Running',
    title: 'Calories Burned Running Calculator — Per Mile and Pace',
    desc: 'Calories burned running calculator: enter your pace or distance and time, plus incline and weight, for total and extra calories and calories per mile.',
    h1: 'Calories Burned Running Calculator', eyebrow: 'Running · pace, distance, time and incline · per mile or km',
    lead: `Enter any <strong>two</strong> of distance, time and pace (or speed) — the third fills in — add an <strong>incline</strong> and your <strong>weight</strong>. A <strong>155 lb</strong> person running at 6 mph (10 min/mile) burns about <strong>${g0(E.perMin(rn6, kgOf(155)) * 10)} kcal a mile</strong>.`,
    schema: 'Free calories burned running calculator: distance, time, pace or speed with incline and weight, using the ACSM running equation. Shows total and extra calories, calories per mile or km, other speeds side by side and time to burn a goal.',
    llms: 'Free calories burned running calculator: distance, time, pace or speed plus incline and weight (ACSM running equation), total and extra calories, per mile or km, other speeds side by side.',
    card: 'Calories burned running from your pace, distance or time and an incline — total and extra, per mile or km, with other speeds side by side.',
    faqs: [
      ['How many calories does running burn?', `A 155 lb (70.3 kg) person burns about ${g0(E.perMin(rn6, kgOf(155)) * 60)} kcal an hour at 6 mph (10 min/mile) and about ${g0(E.perMin(rn8, kgOf(155)) * 60)} at 8 mph (7.5 min/mile), by the ACSM running equation. Enter your own pace and weight above.`],
      ['How many calories does running a mile burn?', `About ${g0(E.perMin(rn6, kgOf(155)) * 10)} kcal for a 155 lb person at a 10 min/mile pace, and about ${g0(E.perMin(rn8, kgOf(155)) * 60 / 8)} at 7.5 min/mile. A mile costs a similar amount at most paces; the pace mostly changes how fast you spend it. The table above gives a mile at several speeds and weights, and the calculator shows “per mile” and “per km” for your numbers.`],
      ['How do I calculate calories burned running?', `The ACSM running equation gives oxygen use: VO₂ = 0.2 × speed + 0.9 × speed × grade + 3.5 (speed in metres a minute, grade as a fraction). Divide by 3.5 for METs, then calories a minute = METs × 3.5 × weight in kg ÷ 200. At 6 mph (161 m/min) flat that is ${f(rn6, 2)} METs, which is ${f(E.perMin(rn6, kgOf(155)), 1)} kcal a minute for a 155 lb person.`],
      ['Does running uphill or on an incline burn more?', `Yes. At 6 mph a 155 lb person burns about ${g0(E.perMin(vmet('run', 6), kgOf(155)) * 60)} kcal an hour flat and about ${g0(E.perMin(vmet('run', 6, 5), kgOf(155)) * 60)} at a 5% incline. On a treadmill, enter the incline percent.`],
      ['What is the difference between total and extra calories?', 'The total includes calories your body would burn resting during the run. The extra figure subtracts them — it is what the run adds to your day, and the one to use for a calorie deficit.'],
      ['Is the ACSM running equation accurate for jogging?', 'The ACSM running equation applies above about 5 mph, or to jogging faster than 3 mph if you are actually jogging. Below 5 mph the calculator still gives a figure but flags it; if you are walking, use the <a href="/calories-burned-walking-calculator/">walking calculator</a>.'],
      ['How accurate is a calories burned running calculator?', 'It is an estimate: terrain, wind, running economy, fitness and body composition move the real figure by 10% or more. It is a good guide for comparing runs and tracking trends. The advanced option swaps the standard resting rate for one from your age, sex and height.'],
      ['How many calories do I burn in a 5K or a marathon?', `A 5K is 3.107 miles — about ${g0(E.perMin(rn6, kgOf(155)) * 10 * 3.107)} kcal for a 155 lb person at 10 min/mile; a marathon (26.2 miles) about ${g0(E.perMin(rn6, kgOf(155)) * 10 * 26.2)}. Enter the distance and your pace to see yours, with the extra over resting beside it.`]
    ],
    pills: [['/calories-burned-calculator/', 'Calories Burned (all activities)', pillIco.fire], ['/pace-calculator/', 'Pace Calculator', pillIco.pace], ['/race-time-predictor/', 'Race Time Predictor', pillIco.pace], ['/heart-rate-zone-calculator/', 'Heart Rate Zones', pillIco.heart]]
  }
};

const tfld = (id, label, unit, ph, uid) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on, cls) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${o[0] === on ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;

function build(kind) {
  const P = PAGES[kind], hub = kind === 'hub', url = 'https://calcthis.co/' + P.slug + '/';
  if (P.title.length > 60) throw new Error('title too long ' + P.title.length);
  if (P.desc.length > 158) throw new Error('desc too long ' + P.desc.length);
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

  const actBlock = hub ? `
        <div id="cbActWrap">
          <div class="fld"><span class="lab">Activity</span><div class="st-ta"><div class="inp"><input id="cbActIn" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="cbActList" aria-label="Activity" placeholder="Type to find one, e.g. run, bike, clean"><input id="cbAct" type="hidden" value=""></div><div class="st-ta-list" id="cbActList" role="listbox" style="display:none"></div></div></div>
          <div class="cb-two">${tfld('cbH', 'Time', 'hours', 'e.g. 1')}${tfld('cbM', 'and', 'minutes', 'e.g. 30')}</div>
        </div>` : '';
  const spdBlock = `
        <div id="cbSpdWrap"${hub ? ' style="display:none"' : ''}>
          ${hub ? seg('cbMov', 'Moving by', [['walk', 'Walking'], ['run', 'Running']], 'walk') : ''}
          ${seg('cbDU', 'Distance units', [['mi', 'Miles'], ['km', 'Kilometres']], 'mi')}
          <div class="cb-two">${tfld('cbD', 'Distance', 'mi', 'e.g. 3.1', 'cbDL')}${tfld('cbT', 'Time', 'min or h:mm:ss', 'e.g. 45 or 1:15:00')}</div>
          <div class="cb-two">${tfld('cbV', 'Speed', 'mph', 'e.g. 3.5', 'cbVL')}${tfld('cbP', 'Pace', 'min/mi', 'e.g. 17:09', 'cbPL')}</div>
          <div class="cb-two">${tfld('cbG', 'Incline', '%', 'e.g. 5 (optional)')}<span></span></div>
          <p class="av-note" style="margin-top:0">Fill in any two of distance, time and speed or pace — the rest follows.</p>
        </div>`;
  const adv = `<div id="cbAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${seg('cbEU', 'Energy unit', [['kcal', 'kcal'], ['kj', 'kJ']], 'kcal')}
          ${tfld('cbGoal', 'Calories to burn', 'kcal', 'e.g. 300 — shows the time it takes', 'cbGoalU')}
          <p class="av-note" style="margin:0 0 8px">Personalise with your resting rate (optional — uses Mifflin-St Jeor instead of the standard 3.5 mL/kg/min):</p>
          ${seg('cbSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
          <div class="cb-two">${tfld('cbAge', 'Age', 'years', 'e.g. 35')}${tfld('cbHt', 'Height', 'cm', 'e.g. 170', 'cbHtU')}</div>
          ${seg('cbHU', 'Height units', [['cm', 'cm'], ['in', 'inches']], 'cm')}
          <div id="cbStepsFld"${hub ? ' style="display:none"' : ''}>${tfld('cbSteps', 'Steps taken', '', 'e.g. 8000 — needs your height')}</div>
        </div>`;

  const tblWalk = `<table class="dtable"><thead><tr><th>Walking speed</th>${WTS.map((w) => '<th>' + wLab(w) + '</th>').join('')}</tr></thead><tbody>${spdTbl('walk', [2, 2.5, 3, 3.5, 4], 60)}</tbody></table>`;
  const tblIncl = `<table class="dtable"><thead><tr><th>Incline at 3 mph</th><th>METs</th>${WTS.map((w) => '<th>' + wLab(w) + '</th>').join('')}</tr></thead><tbody>${inclTbl}</tbody></table>`;
  const tblRunMile = `<table class="dtable"><thead><tr><th>Running pace</th>${WTS.map((w) => '<th>' + wLab(w) + '</th>').join('')}</tr></thead><tbody>${perMile('run', [5, 6, 7, 8, 9, 10])}</tbody></table>`;
  const tblRunHour = `<table class="dtable"><thead><tr><th>Running speed (30 minutes)</th>${WTS.map((w) => '<th>' + wLab(w) + '</th>').join('')}</tr></thead><tbody>${spdTbl('run', [5, 6, 7, 8, 9, 10], 30)}</tbody></table>`;
  const tblAll = `<table class="dtable"><thead><tr><th>Activity</th><th>MET</th>${WTS.map((w) => '<th>' + wLab(w) + '</th>').join('')}</tr></thead><tbody>${tblAct}</tbody></table>`;

  const FORM = (hub ? `<div class="formula">
          calories = MET × 3.5 × weight (kg) ÷ 200 × minutes
          <small>COMPENDIUM OF PHYSICAL ACTIVITIES · ACSM</small>
        </div>` : `<div class="formula">
          VO₂ = ${kind === 'walk' ? '0.1 × speed + 1.8 × speed × grade' : '0.2 × speed + 0.9 × speed × grade'} + 3.5 ; calories/min = VO₂ × weight (kg) ÷ 200
          <small>ACSM ${kind === 'walk' ? 'WALKING' : 'RUNNING'} EQUATION · SPEED IN m/min, GRADE AS A FRACTION</small>
        </div>`);
  const left = hub ? `
        <h2>How to use the calories burned calculator</h2>
        <p>Choose <strong>By activity</strong>, type the activity (try “run”, “bike” or “clean”), then add the <strong>time</strong> and your <strong>weight</strong>. The big number is the total calories burned; under it you see how much of that is <strong>extra</strong> over the calories you burn resting anyway, as a split bar.</p>
        <p>Under <strong>Walk or run</strong> you can fill in any two of distance, time and speed or pace, add an incline, and get calories per mile or km. Every result also lists the <strong>same time in other activities</strong> (or at other speeds), so you can see what a swap would be worth. Press <strong>Add to my day</strong> to build a total for several activities.</p>

        <h2>The calories burned formula</h2>
        ${FORM}
        <p>For a 155 lb (70.3 kg) person running at 6.0–6.3 mph (MET ${f(RUN.met, 1)}) for 30 minutes: ${f(RUN.met, 1)} × 3.5 × 70.3 ÷ 200 × 30 = <strong>${g0(runKcal)} kcal</strong>. The resting part — 1 MET for the same time — is ${g0(kc(1, 155, 30))} kcal, so the <strong>extra</strong> is <strong>${g0(runNet)} kcal</strong>.</p>

        <h2>Calories burned in 30 minutes, by weight</h2>
        <p>Total calories for half an hour of common activities (MET values from the 2024 Compendium):</p>
        ${tblAll}` : kind === 'walk' ? `
        <h2>How to use the walking calculator</h2>
        <p>Enter any <strong>two</strong> of distance, time and speed or pace and the third fills in. Add an <strong>incline</strong> (a treadmill setting or the hill's percent grade) and your <strong>weight</strong>. The result shows total calories, the <strong>extra</strong> over resting, calories per mile or km, and the same time at other speeds. Open Go advanced to turn <strong>steps</strong> into distance (add your height) or to see the time needed to burn a calorie goal.</p>

        <h2>The walking calories formula</h2>
        ${FORM}
        <p>Walking 3 mph (80.5 m/min) on the flat: VO₂ = 0.1 × 80.5 + 3.5 = ${f(0.1 * 80.4672 + 3.5, 1)} mL/kg/min, or ${f(wk3, 2)} METs — ${f(E.perMin(wk3, kgOf(155)), 1)} kcal a minute for a 155 lb person, ${g0(E.perMin(wk3, kgOf(155)) * 60)} an hour. At a 5% incline the 1.8 × speed × grade term adds ${f(1.8 * 80.4672 * 0.05, 1)} mL/kg/min: ${f(wk3i5, 2)} METs, ${g0(E.perMin(wk3i5, kgOf(155)) * 60)} kcal an hour.</p>` : `
        <h2>How to use the running calculator</h2>
        <p>Enter any <strong>two</strong> of distance, time and pace or speed and the third fills in. Add an <strong>incline</strong> and your <strong>weight</strong>. The result shows total calories, the <strong>extra</strong> over resting, calories per mile or km, and the same time at other speeds. Go advanced adds a calorie goal (time needed), a personalised resting rate and an energy unit switch.</p>

        <h2>The running calories formula</h2>
        ${FORM}
        <p>Running 6 mph (160.9 m/min) on the flat: VO₂ = 0.2 × 160.9 + 3.5 = ${f(0.2 * 160.9344 + 3.5, 1)} mL/kg/min, or ${f(rn6, 2)} METs — ${f(E.perMin(rn6, kgOf(155)), 1)} kcal a minute for a 155 lb person, ${g0(E.perMin(rn6, kgOf(155)) * 60)} an hour, ${g0(E.perMin(rn6, kgOf(155)) * 10)} a mile.</p>`;
  const right = hub ? `
        <h2>Total calories versus extra calories</h2>
        <p>Your body burns around ${g0(kc(1, 155, 60))} kcal an hour at rest if you weigh 155 lb, so any activity's total includes calories you would have burned sitting still. Most calculators show only the total. This one splits it: the <strong>extra</strong> is what the activity adds. A one-hour brisk walk is ${g0(kc(act('Walking, brisk (3.5–3.9 mph)').met, 155, 60))} kcal in total but ${g0(nt(act('Walking, brisk (3.5–3.9 mph)').met, 155, 60))} extra for a 155 lb person.</p>

        <h2>What is a MET?</h2>
        <p>A MET is the energy of sitting quietly, 3.5 mL of oxygen per kilogram per minute. An activity at 4 METs uses four times that. The list has ${E.ACT.length} activities from the Compendium of Physical Activities, from sleeping (1.0) to running 12 mph (18.5). The values assume an average adult doing the activity at a steady rate, which is why real results vary.</p>

        <h2>Walking and running by speed</h2>
        <p>For walking and running the Compendium gives broad speed bands. Choose <strong>Walk or run</strong> and the calculator uses the ACSM equations, which take your exact speed and any incline — see the <a href="/calories-burned-walking-calculator/">walking</a> and <a href="/calories-burned-running-calculator/">running</a> calculators.</p>
        ${SRC}` : `
        <h2>${kind === 'walk' ? 'Calories burned walking, per hour' : 'Calories burned running, per mile'}</h2>
        <p>${kind === 'walk' ? 'One hour of level walking at different speeds (ACSM equation, total calories):' : 'Total calories per mile at different paces (ACSM equation):'}</p>
        ${kind === 'walk' ? tblWalk : tblRunMile}
        <h2>${kind === 'walk' ? 'How incline changes it' : 'Running, 30 minutes at different speeds'}</h2>
        ${kind === 'walk' ? '<p>One hour at 3 mph — each 1% of grade adds about ' + f(1.8 * 80.4672 * 0.01 / 3.5, 2) + ' METs:</p>' + tblIncl : '<p>Half an hour on the flat, total calories:</p>' + tblRunHour}
        <p>Total calories include the ${g0(E.perMin(1, kgOf(155)) * 60)} kcal an hour a 155 lb person burns resting; the calculator's <strong>extra</strong> figure removes it. For other activities see the <a href="/calories-burned-calculator/">all-activities calculator</a>.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-cb">
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
      <div class="card-pad">
        <h2 class="card-h2">Your workout</h2>
        ${hub ? '<div class="modeseg" id="cbMode" role="group" aria-label="Calculate by" style="grid-template-columns:1fr 1fr;margin-bottom:14px"><button class="on" type="button" data-v="act">By activity</button><button type="button" data-v="spd">Walk or run</button></div>' : ''}${actBlock}${spdBlock}
        ${seg('cbWU', 'Weight units', [['lb', 'lb'], ['kg', 'kg'], ['st', 'st']], 'lb')}
        ${tfld('cbW', 'Your weight', 'lb', 'e.g. 154', 'cbWL')}
        <div class="res-hint" id="cbHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        ${adv}
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="cbAdvBtn" type="button">
            <span id="cbAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="cbResLab">Calories burned</div>
          <div class="res-big"><span id="cbBig">—</span></div>
          <div class="res-sub" id="cbSub" data-empty="${hub ? 'Pick an activity, a time and your weight.' : 'Enter a speed (or a distance and a time) and your weight.'}">${hub ? 'Pick an activity, a time and your weight.' : 'Enter a speed (or a distance and a time) and your weight.'}</div>
        </div>
        <div id="cbBody" style="display:none">
          <p class="res-tip adv-tip" id="cbTip"></p>
          <p class="bm-h">Resting calories vs. extra calories</p>
          <div id="cbBar"></div>
          <div class="proj-sep"></div>
          <table class="dtable" id="cbRows"></table>
          <p class="bm-h" id="cbRankH">The same time, other activities</p>
          <div id="cbRank"></div>
          <div class="add-row" style="margin-top:16px"><button class="btn" id="cbAdd" type="button" disabled><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>Add to my day</button></div>
          <p class="cb-note">An estimate — real burn varies with fitness, body composition and terrain. Not medical or dietary advice.</p>
        </div>
        <div class="cb-day" id="cbDay" style="display:none"></div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="cbMLab">Calories</span>
    <div class="mbar-vals"><b id="cbMVal">—</b></div>
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
<script>CalcThis.initCburnCalc('${kind}');</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log(P.slug, 'written; title', P.title.length, 'desc', P.desc.length);
}
build('hub'); build('walk'); build('run');

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s = fs.readFileSync(fl, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fl, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
let prevSlug = 'cat-age-calculator', prevMenu = 'Cat Age', prevName = 'Cat Age Calculator';
['hub', 'walk', 'run'].forEach((kind) => {
  const P = PAGES[kind], url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s) => s.includes("slug: '" + slug + "'") ? s : s.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName.replace(/[()]/g, '\\$&') + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <a href="' + ps + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <li><a href="' + ps + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + slug + '"') ? s : s.replace('  "/dog-age-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/dog-age-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M16 3s8 7 8 14a8 8 0 0 1-16 0c0-3 1-5 3-7 0 3 1.5 4.5 3 4.5 0-4 1-7 2-11.5z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M16 18v6" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — ' + (kind === 'hub' ? 'calories burned by activity, total and extra' : kind === 'walk' ? 'calories burned walking by speed and incline' : 'calories burned running by pace and incline') + '</span></li>\n');
    return h;
  });
  prevSlug = P.slug; prevMenu = P.menu; prevName = P.name;
});
