const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /bulking-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.bulkEngine / deficitEngine / bmrEngine. Run: node md-files/gen-bulking-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['BMR', 'DEFICIT', 'BULK'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.bulkEngine, D = CalcThis.deficitEngine;
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

/* ---------- worked example: man, 28, 180 cm, 80 kg, moderate (x1.55), goal 85 kg ---------- */
const X = { male: true, W: 80, H: 180, A: 28, f: 1.55, formula: 'mifflin', bf: null };
const M = D.maint(X), s = D.slope(X);
const bmr = CalcThis.bmrEngine.mifflin(true, 80, 180, 28);
const S25 = E.surplus('pace', 0.25, M, 80), S50 = E.surplus('pace', 0.5, M, 80), P10 = E.surplus('pct', 10, M, 80), P20 = E.surplus('pct', 20, M, 80);
const q25 = E.equiv(S25, M, 80), q50 = E.equiv(S50, M, 80);
const sd = E.daysSimple(S25, 80, 85), rd = E.daysReal(S25, s, 80, 85);
const wk = (d) => Math.round(d / 7);
const wtRows = [50, 60, 70, 80, 90, 100, 110].map((w) => '<tr><td>' + w + ' kg (' + f1(w * 2.20462) + ' lb)</td><td>+' + g0(E.surplus('pace', 0.25, 0, w)) + ' kcal · ' + f2(w * 0.0025) + ' kg a week</td><td>+' + g0(E.surplus('pace', 0.5, 0, w)) + ' kcal · ' + f2(w * 0.005) + ' kg a week</td></tr>').join('');
const lad = [0, 8, 16, 24].map((w) => { const wt = E.wSimple(S25, 80, w * 7); return '<tr><td>Week ' + w + '</td><td>' + f1(wt) + ' kg</td><td>' + g0(E.eatAt(M, s, 80, S25, wt)) + ' kcal</td></tr>'; }).join('');
const Mac = E.macros(M + S25, 80, 1.8, 1.0);

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Iraki J, Fitschen P, Espinar S, Helms E, <a href="https://pubmed.ncbi.nlm.nih.gov/31247944/" rel="noopener">Nutrition Recommendations for Bodybuilders in the Off-Season: A Narrative Review</a>, Sports 2019;7(7):154 (abstract read via Europe PMC, 2026-11-06): a hyper-energetic diet of about 10–20% above maintenance with a target weight gain of about 0.25–0.5% of body weight per week for novice and intermediate bodybuilders, advanced bodybuilders more conservative (no figure given); protein 1.6–2.2 g/kg a day, optimal 0.40–0.55 g/kg per meal over 3–6 meals; fat 0.5–1.5 g/kg a day; carbohydrate at least 3–5 g/kg a day.</li>
          <li>Helms ER et al., <a href="https://pubmed.ncbi.nlm.nih.gov/37914977/" rel="noopener">Effect of Small and Large Energy Surpluses on Strength, Muscle, and Skinfold Thickness in Resistance-Trained Individuals</a>, Sports Medicine – Open 2023;9:102 (abstract read via Europe PMC): 21 trained lifters randomized to maintenance, a 5% or a 15% surplus for 8 weeks (17 completed); faster body-mass gain mainly increased fat gain rather than muscle thickness or squat 1-RM. A small, short study of mixed-experience lifters.</li>
          <li>Competitor pages opened 2026-11-06 for their inputs and presets: ProteinCalc, Coachway, GetHealthyCalculators and Gravitus. Their per-experience calorie surpluses and monthly muscle-gain figures cite no study, so this calculator does not use them.</li>
          <li>Maintenance: Mifflin-St Jeor times the activity factor (or Katch-McArdle with body fat), as on our <a href="/bmr-calculator/">BMR calculator</a>. The energy rule of 7,700 kcal per kg of body weight is the same simplification used on our <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>; the real split between muscle, fat and water varies.</li>
        </ul>
        <p><small>For information only, not medical advice. A bulk adds weight; if you have a health condition or a history of disordered eating, talk to a clinician first. The calculator does not estimate how much of the gain is muscle.</small></p>`;

const P = {
  slug: 'bulking-calculator', name: 'Bulking Calculator', menu: 'Bulking',
  title: 'Bulking Calculator — Calories, Macros & Calorie Surplus',
  desc: 'Bulking calculator: calories to eat for a calorie surplus set by pace, percent or kcal, with macros and a weight curve showing the time to your goal weight.',
  h1: 'Bulking Calculator', eyebrow: 'Calorie surplus · pace, percent or kcal · macros · weight curve · time to goal',
  lead: `Enter your <strong>weight</strong>, <strong>height</strong> and <strong>activity</strong> — you get the <strong>calories to eat to bulk</strong> and the <strong>calorie surplus</strong>, set by pace, percent or kcal, with macros and a curve that shows how long your goal weight takes. A man of 80 kg and 180 cm at maintenance of <strong>${g0(M)} kcal</strong> eats about <strong>${g0(M + S25)} kcal</strong> for a 0.25% a week lean bulk.`,
  schema: 'Free bulking and calorie surplus calculator: calories to eat to gain weight from Mifflin-St Jeor maintenance, with the surplus set by pace (% of body weight a week), % of maintenance or kcal, macros per kg from a published review, a flag when the surplus is above the researched range, and a weight curve with the time to your goal weight as maintenance rises.',
  llms: 'Free bulking and calorie surplus calculator: calories to eat from maintenance plus a surplus set by pace (0.25-0.5% of body weight a week), percent (10-20%) or kcal, with macros, a calories-by-week ladder and a weight curve with time to goal.',
  card: 'Calories to eat to bulk: a calorie surplus set by pace, percent or kcal, with macros and a weight curve showing the time to your goal weight.',
  faqs: [
    ['How many calories should I eat to bulk?', `Eat your maintenance calories plus a surplus. For a man of 80 kg and 180 cm, 28 years old, with moderate activity, maintenance is about ${g0(M)} kcal (Mifflin-St Jeor ${g0(bmr)} × 1.55). A surplus of 10–20% above maintenance, the range in a 2019 review of off-season bodybuilding nutrition, is ${g0(P10)}–${g0(P20)} kcal, so about ${g0(M + P10)}–${g0(M + P20)} kcal a day. The calculator does this for your numbers.`],
    ['How do I calculate a calorie surplus?', `A calorie surplus is what you eat above maintenance. Step 1: maintenance = BMR × activity factor. Step 2: add the surplus. You can set the surplus as a pace — 0.25% of your body weight a week is ${f2(80 * 0.0025)} kg for 80 kg, which at 7,700 kcal per kg is ${g0(S25)} kcal a day — or as a percent of maintenance, or as kcal. Target = ${g0(M)} + ${g0(S25)} = ${g0(M + S25)} kcal.`],
    ['How big should a bulking calorie surplus be?', `The 2019 review gives about 10–20% above maintenance and a target gain of 0.25–0.5% of body weight a week for novice and intermediate lifters, with advanced lifters more conservative. For the 80 kg man that is ${g0(S25)}–${g0(S50)} kcal a day (${f1(q25.pct)}–${f1(q50.pct)}% of maintenance). In an 8-week trial of 17 trained lifters, larger surpluses mainly added fat rather than muscle (Helms 2023), so more is not better. The calculator flags a surplus above these ranges.`],
    ['How much weight should I gain per week when bulking?', `About 0.25–0.5% of your body weight a week, from the review: ${f2(80 * 0.0025)}–${f2(80 * 0.005)} kg (${f2(80 * 0.0025 * 2.20462)}–${f2(80 * 0.005 * 2.20462)} lb) a week at 80 kg. The surplus for a given weight is simple: about ${f2(0.25 / 100 * 7700 / 7)} kcal per kg of body weight a day for 0.25% a week and ${f2(0.5 / 100 * 7700 / 7)} for 0.5%. This is scale weight; the calculator does not say how much is muscle, because no source I read gives a reliable split.`],
    ['How many extra calories add 1 lb or 1 kg?', 'About 3,500 kcal per lb or 7,700 kcal per kg of body weight is the usual rule of thumb, used here as the simple estimate. It is an approximation: the real mix of muscle, fat and water changes with training, diet and the person, and maintenance rises as you gain, which is why the calculator also shows a more realistic curve.'],
    ['How much protein, fat and carbs do I need when bulking?', `The 2019 review gives protein of 1.6–2.2 g/kg a day (0.40–0.55 g/kg per meal over 3–6 meals), fat of 0.5–1.5 g/kg a day and carbohydrate of at least 3–5 g/kg a day to fuel training. The calculator starts at 1.8 g/kg protein and 1.0 g/kg fat and gives carbohydrate the rest: for the 80 kg man at ${g0(M + S25)} kcal that is ${g0(Mac.p)} g protein, ${g0(Mac.f)} g fat and ${g0(Mac.c)} g carbohydrate, and it warns when a figure leaves the review’s range.`],
    ['Why does the calculator show two times to reach my goal weight?', `The simple rule assumes you keep gaining at the same pace by raising calories as you go. In reality maintenance rises by about ${g0(s)} kcal for every kg you gain, so eating the same amount produces a smaller surplus each week. For the example (80 kg to 85 kg at ${g0(S25)} kcal of surplus) the simple rule gives about ${wk(sd)} weeks and the realistic one ${rd.days == null ? 'levels off before the goal' : 'about ' + wk(rd.days) + ' weeks'}. The ladder under the chart shows what to eat each few weeks to keep the pace.`],
    ['What is a lean bulk, and what is a dirty bulk?', 'A lean bulk is a small, controlled surplus, at the low end of the ranges above, so weight rises slowly. A “dirty bulk” means eating as much as possible. The only trial I read comparing surpluses (Helms 2023, small and short) found that larger surpluses mainly added fat, so the calculator defaults to the low end and has no dirty-bulk preset.'],
    ['Can women use this bulking calculator?', 'Yes. Maintenance uses the Mifflin-St Jeor equation for either sex, and the surplus is set as a percent of body weight or maintenance, so it scales with the person. The review’s ranges are not given separately for women, so the same ranges are used. Choose female or male and enter your own numbers.'],
    ['Should I bulk or lose fat first?', 'The calculator does not decide that. A bulk adds weight; if you want to lose fat first or at the same time, use the <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>, and see the <a href="/protein-intake-calculator/">protein intake calculator</a> for protein on its own.']
  ],
  pills: [['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'], ['/tdee-calculator/', 'TDEE Calculator', '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>'], ['/macro-calculator/', 'Macro Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/ffmi-calculator/', 'FFMI Calculator', '<path d="M4 12v8M8 9v14M24 9v14M28 12v8"/>']]
};
P.pills[3][2] = '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>';

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
        ${seg('bkSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${seg('bkMain', 'Calories you burn', [['est', 'Estimate it'], ['known', 'I know it']], 'est')}
        <div id="bkEstWrap">
          ${tfld('bkAge', 'Age', 'years', 'e.g. 28', null, 'numeric')}
          ${seg('bkHU', 'Height units', [['cm', 'cm'], ['in', 'inches'], ['m', 'm']], 'in')}
          ${tfld('bkH', 'Height', 'inches or 5\'10', 'e.g. 70 or 5\'10', 'bkHL', 'text')}
          ${csel('bkAct', '1.55', 'Activity level', actOpts)}
        </div>
        <div id="bkKnownWrap" style="display:none">
          ${tfld('bkMaint', 'Calories you burn', 'kcal a day · your maintenance', 'e.g. 2700', null, 'numeric')}
          <p class="av-note" style="margin:0 0 8px">The calories you burn in a day to stay at your weight (also called maintenance), for example from tracking your food and weight for a few weeks. It is used as given; weight is still needed.</p>
        </div>
        ${seg('bkWU', 'Weight units', [['kg', 'kg'], ['lb', 'lb'], ['st', 'st']], 'lb')}
        ${tfld('bkW', 'Current weight', 'lb', 'e.g. 165', 'bkWL')}
        ${tfld('bkG', 'Goal weight', 'lb · optional', 'e.g. 175', 'bkGL')}
        <div class="proj-sep"></div>
        ${seg('bkKind', 'Set the surplus by', [['pace', 'Pace'], ['pct', 'Percent'], ['kcal', 'Kcal']], 'pace')}
        <label class="fld" for="bkS" style="margin-bottom:0"><span class="lab" id="bkSLab">Weight gain <span class="unit" id="bkSL">% of body weight a week</span></span><div class="inp"><input id="bkS" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 0.25"></div></label>
        <div class="chips" id="bkChips"></div>
        <p class="av-note" style="margin:8px 0 8px">Leave it empty to start at the low end of the researched range: 0.25% of body weight a week, 10% above maintenance or 250 kcal.</p>
        <div class="res-hint" id="bkHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="bkAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Training experience</span><div class="modeseg" id="bkExp" role="group" aria-label="Training experience"><button type="button" data-v="beg">Beginner</button><button class="on" type="button" data-v="inter">Intermediate</button><button type="button" data-v="adv">Advanced</button></div></div>
          <p class="av-note" style="margin:0 0 8px">Beginners and intermediates: the review’s 0.25–0.5% a week. Advanced: it says to be more conservative, so anything above 0.25% is flagged.</p>
          ${tfld('bkBf', 'Body fat', '% · optional, uses Katch-McArdle', 'e.g. 15')}
          <div class="cb-two">${tfld('bkPg', 'Protein', 'g per kg', 'e.g. 1.8')}${tfld('bkFg', 'Fat', 'g per kg', 'e.g. 1.0')}</div>
          ${seg('bkMeals', 'Meals a day', [['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']], '4')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="bkAdvBtn" type="button">
            <span id="bkAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Calories a day to bulk</div>
          <div class="res-big"><span id="bkBig">—</span></div>
          <div class="res-sub" id="bkSub" data-empty="Enter your weight and details.">Enter your weight and details.</div>
        </div>
        <div id="bkBody" style="display:none">
          <p class="res-tip adv-tip" id="bkTip"></p>
          <div id="bkFlags"></div>
          <div id="bkEq"></div>
          <p class="bm-h">What you burn and the surplus</p>
          <div id="bkBar"></div>
          <p class="bm-h">Your pace against the researched range</p>
          <div id="bkPace"></div>
          <p class="bm-h">Weight over time</p>
          <div id="bkGoalRows"></div>
          <div id="bkChart"></div>
          <div class="bm-key"><span><i class="bk-lr"></i>Same food (maintenance rises as you gain)</span><span><i class="bk-ls"></i>Steady pace (raise calories)</span></div>
          <p class="av-note" id="bkNoGoal" style="display:none">Add a goal weight for the time to goal. The chart shows the next 16 weeks.</p>
          <p class="bm-h">What to eat to keep the pace</p>
          <table class="dtable" id="bkLadder"></table>
          <p class="cb-note" id="bkLadderNote"></p>
          <p class="bm-h">Macros</p>
          <table class="dtable" id="bkMac"></table>
          <div id="bkMacNote"></div>
          <p class="bm-h">What other bulking calculators assume</p>
          <table class="dtable" id="bkRules"></table>
          <p class="cb-note">Rules of thumb from GetHealthyCalculators (surplus by experience) and ProteinCalc (muscle gain per month). Neither cites a study, so they are not used for the numbers above, which follow the Iraki 2019 review. Not verified by us.</p>
          <p class="cb-note">An estimate for adults, not medical advice. The surplus ranges and macro ranges come from a published review; the 7,700 kcal per kg rule is a simplification, and the calculator does not estimate how much of the gain is muscle.</p>
        </div>`;

  const left = `
        <h2>How to use the bulking calculator</h2>
        <p>Pick <strong>male or female</strong>, enter your <strong>age</strong>, <strong>height</strong> (centimetres, inches or 5'10, metres), <strong>activity level</strong> and <strong>weight</strong> — or choose <strong>I know it</strong> and type your maintenance calories. Then set the surplus the way you think about it: a <strong>pace</strong> in percent of body weight a week, a <strong>percent</strong> above maintenance, or <strong>kcal</strong> a day — and see all three. Add a <strong>goal weight</strong> for the time to goal.</p>
        <p>Open <strong>Go advanced</strong> for training experience, body fat (Katch-McArdle), your own protein and fat per kg and the number of meals.</p>

        <h2>The calorie surplus formula</h2>
        <div class="formula">
          Calories to bulk = maintenance + surplus · maintenance = BMR × activity factor
          <small>PACE: SURPLUS = % × WEIGHT (KG) × 7,700 ÷ 7 · PERCENT: SURPLUS = % × MAINTENANCE</small>
        </div>
        <p>For a man of 80 kg and 180 cm, 28 years old, moderate activity: BMR (Mifflin-St Jeor) = ${g0(bmr)} kcal, maintenance = ${g0(bmr)} × 1.55 = <strong>${g0(M)} kcal</strong>. A pace of 0.25% a week is ${f2(80 * 0.0025)} kg, a surplus of <strong>${g0(S25)} kcal</strong> a day, so about <strong>${g0(M + S25)} kcal</strong>.</p>`;
  const right = `
        <h2>Surplus by body weight</h2>
        <table class="dtable"><thead><tr><th>Body weight</th><th>0.25% a week</th><th>0.5% a week</th></tr></thead><tbody>${wtRows}</tbody></table>
        <p>The researched pace is 0.25–0.5% of body weight a week for novice and intermediate lifters. The kcal is the surplus above maintenance at 7,700 kcal per kg; heavier people need a bigger surplus for the same pace.</p>

        <h2>Why the calories must keep rising</h2>
        <table class="dtable"><thead><tr><th>When</th><th>Weight</th><th>Eat to keep the pace</th></tr></thead><tbody>${lad}</tbody></table>
        <p>Same man, 0.25% a week: maintenance rises about ${g0(s)} kcal per kg gained, so the calories needed to keep the pace go up with his weight.</p>

        <h2>Bigger is not better</h2>
        <p>In an 8-week trial of 17 trained lifters, larger surpluses mainly added fat rather than muscle thickness or squat strength (Helms 2023, small and short). That is why the calculator starts at the low end, flags anything above the review’s ranges and offers no “dirty bulk” preset. See also the <a href="/calorie-deficit-calculator/">calorie deficit calculator</a> for the other direction.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-bk">
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
    <span class="mbar-lab" id="bkMLab">Calories a day to bulk</span>
    <div class="mbar-vals"><b id="bkMVal">—</b></div>
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
<script>CalcThis.initBulkCalc();</script>
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
const prevSlug = 'ffmi-calculator', prevMenu = 'FFMI', prevName = 'FFMI Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "/ffmi-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/ffmi-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M16 26V9M9 15l7-7 7 7" stroke="#37503F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="16" cy="26" r="2.2" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — calories to eat to bulk: a calorie surplus set by pace, percent or kcal, with macros and a weight curve with time to goal</span></li>\n');
    return h;
  });
}
