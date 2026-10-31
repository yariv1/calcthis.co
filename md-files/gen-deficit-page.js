const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /calorie-deficit-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json). Every number in the text comes from CalcThis.deficitEngine (+ bmrEngine), so text and tool agree. Run: node md-files/gen-deficit-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* BMR-ENGINE:START */'), app.indexOf('/* BMR-ENGINE:END */')));
eval(app.slice(app.indexOf('/* DEFICIT-ENGINE:START */'), app.indexOf('/* DEFICIT-ENGINE:END */')));
const E = CalcThis.deficitEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const c0 = (x) => Math.round(x).toLocaleString('en-US');
const r1 = (x) => String(Math.round(x * 10) / 10);
const r2 = (x) => String(Math.round(x * 100) / 100);
const wk = (days) => Math.round(days / 7);
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

/* ---------- the worked example: woman, 35, 165 cm, 80 kg, moderate (x1.55), goal 70 kg ---------- */
const X = { male: false, W: 80, H: 165, A: 35, f: 1.55, formula: 'mifflin', bf: null }, G = 70;
const M = E.maint(X), s = E.slope(X);
const bmr = CalcThis.bmrEngine.mifflin(false, 80, 165, 35);
const at = (D) => { const I = M - D, sd = E.simpleDays(D, X.W, G), rd = E.realDays(M, I, s, X.W, G); return { D, I, wkKg: D * 7 / E.KCAL_KG, wkLb: D * 7 / E.KCAL_KG / E.LB, sd, rd }; };
const a250 = at(250), a500 = at(500), a750 = at(750), a1000 = at(1000);
const ladder = [a250, a500, a750, a1000].map((a) => '<tr><td>' + c0(a.D) + '</td><td>' + c0(a.I) + '</td><td>' + r2(a.wkKg) + ' kg (' + r2(a.wkLb) + ' lb)</td><td>' + wk(a.sd) + ' weeks</td><td>' + (a.rd.days == null ? 'levels off first' : wk(a.rd.days) + ' weeks') + '</td></tr>').join('');
const pct500 = a500.D / M * 100;
const dateEx = E.forDate(M, s, X.W, G, 90, 'simple');
const kcalPerLb = 3500;

const faqs = [
  ['What is a calorie deficit?', `A calorie deficit means eating fewer calories than your body burns in a day, so it makes up the gap from stored energy, mostly fat. For the woman in the example (${c0(M)} kcal maintenance), eating ${c0(a500.I)} kcal is a deficit of ${c0(a500.D)} kcal a day, about ${r2(a500.wkKg)} kg (${r2(a500.wkLb)} lb) a week.`],
  ['How do I calculate my calorie deficit?', `Work out your maintenance calories (what you burn in a day), then subtract what you eat. Maintenance is your BMR times an activity factor: for the example, ${c0(bmr)} × 1.55 = ${c0(M)} kcal. Eat ${c0(a500.I)} and the deficit is ${c0(M)} − ${c0(a500.I)} = ${c0(a500.D)} kcal. Or start from the other end: a loss of 1 lb a week needs about 500 kcal a day, because a pound of body fat is roughly ${c0(kcalPerLb)} kcal.`],
  ['How big should my calorie deficit be?', `Most plans use 250 to 750 kcal a day, which is roughly 0.25 to 0.75 kg (0.5 to 1.5 lb) a week at the example's weight. A deficit of ${c0(a500.D)} kcal is ${Math.round(pct500)}% of maintenance. Bigger deficits lose faster but are harder to keep up, and the calculator flags any plan below ${c0(1200)} kcal a day for women or ${c0(1500)} for men, or one that loses more than 1% of your body weight a week.`],
  ['How long will it take to lose weight in a calorie deficit?', `With the simple rule (${c0(E.KCAL_KG)} kcal per kg), losing 10 kg at a ${c0(a500.D)} kcal deficit takes about ${wk(a500.sd)} weeks. A more realistic estimate is ${a500.rd.days == null ? 'longer, because your intake would level off first' : wk(a500.rd.days) + ' weeks'}, because you burn less as you get lighter — the calculator shows both and plots them on one chart.`],
  ['Why is the realistic time longer than the simple rule?', `The simple rule assumes you burn the same number of calories every day. In reality maintenance falls by about ${c0(s)} kcal for every kg you lose, so a fixed intake becomes a smaller deficit over time. That is why weight loss slows down and why you may need to eat a little less, or move a little more, as you go.`],
  ['Should I cut calories or exercise more?', `Either works, and many people do both. A deficit of ${c0(a500.D)} kcal could be ${c0(a500.D)} kcal less food, or 300 kcal less food plus ${c0(a500.D - 300)} kcal burned by exercise. The calculator lets you add exercise and shows how much it raises what you can eat, with the safe minimum marked on the bar.`],
  ['Is a 1,000 calorie deficit safe?', `For many people it is too aggressive: at the example's maintenance of ${c0(M)} kcal it would mean eating ${c0(a1000.I)} kcal, ${a1000.I < 1200 ? 'below' : 'close to'} the ${c0(1200)} kcal a day minimum usually advised without medical supervision. It also loses about ${r2(a1000.wkKg)} kg a week. Larger deficits are best discussed with a doctor or dietitian.`],
  ['What if I already know my maintenance calories?', `Choose “I know it” under Maintenance and type the number — for example from tracking your intake and weight for a few weeks. The calculator then skips the estimate and uses your number as given. It still needs your weight, and a goal weight if you want a timeline.`]
];
const title = 'Calorie Deficit Calculator — Daily Deficit & Time to Goal';
const desc = 'Free calorie deficit calculator: how many calories to cut and eat to lose weight. ' + c0(a500.D) + ' kcal a day is ' + r2(a500.wkKg) + ' kg a week; simple vs realistic time to goal.';
const url = 'https://calcthis.co/calorie-deficit-calculator/';
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
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Calorie Deficit Calculator', url, applicationCategory: 'HealthApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Calorie deficit calculator: set the deficit in calories a day, as a weekly pace, by a target date or from what you eat, and see what to eat, the loss per week and the time to your goal — with a simple-rule vs realistic weight curve, an energy bar that splits the deficit into food and exercise, and a ladder of deficits side by side.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Calorie Deficit Calculator', item: url }] };
const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

const pill = (href, label, path) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>\n        ${label}\n      </a>`;
const csel = (id, val, opts) => `<div class="csel" id="${id}" data-value="${val}">
              <button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="csel-val">${opts.filter((o) => o[0] === val)[0][1]}</span>
                ${chev}
              </button>
              <div class="csel-panel" role="listbox">
${opts.map((o) => `                <button type="button" class="csel-opt${o[0] === val ? ' on' : ''}" role="option" aria-selected="${o[0] === val}" data-value="${o[0]}">${o[1]}</button>`).join('\n')}
              </div>
            </div>`;
const actOpts = [['1.2', 'Sedentary — little or no exercise'], ['1.375', 'Light — 1–3 days/week'], ['1.55', 'Moderate — 3–5 days/week'], ['1.725', 'Active — 6–7 days/week'], ['1.9', 'Very active — hard training / physical job']];
const fOpts = [['mifflin', 'Mifflin-St Jeor (recommended)'], ['hbrev', 'Revised Harris-Benedict'], ['katch', 'Katch-McArdle (needs body fat %)']];
const wfields = (p, label, opt) => `        <div id="df${p}met">
          <label class="fld" for="df${p}kg"><span class="lab">${label} <span class="unit">kg</span></span><div class="inp"><input id="df${p}kg" type="number" inputmode="decimal" min="20" max="400" step="any" placeholder="${p === 'W' ? '80' : '70'}"></div></label>
        </div>
        <div id="df${p}imp" style="display:none">
          <label class="fld" for="df${p}lb"><span class="lab">${label} <span class="unit">lb</span></span><div class="inp"><input id="df${p}lb" type="number" inputmode="decimal" min="44" max="880" step="any" placeholder="${p === 'W' ? '176' : '154'}"></div></label>
        </div>
        <div id="df${p}uk" style="display:none">
          <div class="two">
            <label class="fld" for="df${p}st"><span class="lab">${label} <span class="unit">st</span></span><div class="inp"><input id="df${p}st" type="number" inputmode="numeric" min="0" max="63" step="any" placeholder="${p === 'W' ? '12' : '11'}"></div></label>
            <label class="fld" for="df${p}lb2"><span class="lab">&nbsp; <span class="unit">lb</span></span><div class="inp"><input id="df${p}lb2" type="number" inputmode="decimal" min="0" max="13.9" step="any" placeholder="${p === 'W' ? '8' : '0'}"></div></label>
          </div>
        </div>`;

const hero = `  <section class="hero">
    <div class="eyebrow">Deficit · pace · date · what you eat</div>
    <h1>Calorie Deficit Calculator</h1>
    <p>Set your <strong>calorie deficit</strong> four ways — kcal a day, pace per week, a target date or what you eat — and see how much to eat, how fast you lose and <strong>when you reach your goal</strong>, with the simple rule and a <strong>realistic</strong> estimate side by side. A ${c0(a500.D)} kcal deficit is about <strong>${r2(a500.wkKg)} kg (${r2(a500.wkLb)} lb)</strong> a week.</p>
  </section>`;

const body = `<body class="p-bmr p-def">
<div class="wrap">

${hdr}

${hero}

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">About you</h2>

        <div class="ctl-row">
          <span class="ctl-lab">Units</span>
          <div class="seg" id="dfUnitSeg" role="group" aria-label="Units">
            <button class="on" type="button" data-v="met">Metric</button>
            <button type="button" data-v="imp">US</button>
            <button type="button" data-v="uk">UK</button>
          </div>
        </div>

        <div class="ctl-row">
          <span class="ctl-lab">Sex</span>
          <div class="seg" id="dfSexSeg" role="group" aria-label="Sex">
            <button class="on" type="button" data-v="female">Female</button>
            <button type="button" data-v="male">Male</button>
          </div>
        </div>

        <div class="ctl-row">
          <span class="ctl-lab">Maintenance</span>
          <div class="seg" id="dfMainSeg" role="group" aria-label="How to get your maintenance calories">
            <button class="on" type="button" data-v="est">Estimate it</button>
            <button type="button" data-v="known">I know it</button>
          </div>
        </div>

        <div id="dfEst">
          <label class="fld" for="dfAge">
            <span class="lab">Age <span class="unit">years</span></span>
            <div class="inp"><input id="dfAge" type="number" inputmode="numeric" min="15" max="100" placeholder="35"></div>
          </label>

          <div id="dfHmet">
            <label class="fld" for="dfHcm">
              <span class="lab">Height <span class="unit">cm</span></span>
              <div class="inp"><input id="dfHcm" type="number" inputmode="decimal" min="100" max="250" step="any" placeholder="165"></div>
            </label>
          </div>
          <div id="dfHimp" style="display:none">
            <div class="two">
              <label class="fld" for="dfHft"><span class="lab">Height <span class="unit">ft</span></span><div class="inp"><input id="dfHft" type="number" inputmode="numeric" min="0" max="8" step="any" placeholder="5"></div></label>
              <label class="fld" for="dfHin"><span class="lab">&nbsp; <span class="unit">in</span></span><div class="inp"><input id="dfHin" type="number" inputmode="decimal" min="0" max="11.9" step="any" placeholder="5"></div></label>
            </div>
          </div>

          <label class="fld">
            <span class="lab">Activity level</span>
            ${csel('dfAct', '1.55', actOpts)}
          </label>
        </div>

        <div id="dfKnown" style="display:none">
          <label class="fld" for="dfMaint">
            <span class="lab">Maintenance <span class="unit">kcal a day</span></span>
            <div class="inp"><input id="dfMaint" type="number" inputmode="numeric" min="800" max="8000" step="any" placeholder="2300"></div>
          </label>
        </div>

${wfields('W', 'Current weight')}
${wfields('G', 'Goal weight')}
        <p class="df-note" style="margin-top:-6px">Goal weight is optional — add it for the time to goal and the weight curve.</p>

        <div class="proj-sep"></div>
        <div class="ctl-row" style="display:block">
          <span class="ctl-lab" style="display:block;margin-bottom:6px">Set the deficit by</span>
          <div class="modeseg" id="dfPlanSeg" role="group" aria-label="Set the deficit by">
            <button class="on" type="button" data-v="def">Deficit</button>
            <button type="button" data-v="pace">Pace</button>
            <button type="button" data-v="date">Date</button>
            <button type="button" data-v="intake">I eat</button>
          </div>
        </div>

        <div id="dfPdef" style="margin-top:14px">
          <label class="fld" for="dfDef" style="margin-bottom:0">
            <span class="lab">Daily deficit <span class="unit">kcal a day</span></span>
            <div class="inp"><input id="dfDef" type="number" inputmode="numeric" min="1" step="any" placeholder="500"></div>
          </label>
          <div class="chips" id="dfDefChips"></div>
        </div>
        <div id="dfPpace" style="display:none;margin-top:14px">
          <label class="fld" for="dfPace" style="margin-bottom:0">
            <span class="lab">Weight loss <span class="unit" id="dfPaceUnit">kg per week</span></span>
            <div class="inp"><input id="dfPace" type="number" inputmode="decimal" min="0" step="any" placeholder="0.5"></div>
          </label>
          <div class="chips" id="dfPaceChips"></div>
        </div>
        <div id="dfPdate" style="display:none;margin-top:14px">
          <label class="fld" for="dfDate" style="margin-bottom:0">
            <span class="lab">Reach my goal by <span class="unit">needs a goal weight</span></span>
            <div class="inp"><input id="dfDate" type="text" autocomplete="off" placeholder="Pick a date"></div>
          </label>
        </div>
        <div id="dfPintake" style="display:none;margin-top:14px">
          <label class="fld" for="dfIntake" style="margin-bottom:0">
            <span class="lab">Calories I eat <span class="unit">kcal a day</span></span>
            <div class="inp"><input id="dfIntake" type="number" inputmode="numeric" min="300" step="any" placeholder="1800"></div>
          </label>
        </div>

        <div class="res-hint" id="dfHint" style="display:none;text-align:left;margin:12px 0 0"></div>

        <div id="dfAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="dfAdvEst">
            <label class="fld">
              <span class="lab">Maintenance formula</span>
              ${csel('dfFormula', 'mifflin', fOpts)}
            </label>
            <label class="fld" for="dfBf">
              <span class="lab">Body fat <span class="unit">% · optional, enables Katch-McArdle</span></span>
              <div class="inp"><input id="dfBf" type="number" inputmode="decimal" min="3" max="70" step="any" placeholder="e.g. 28"></div>
            </label>
          </div>
          <div class="ctl-row" style="display:block;margin-bottom:0">
            <span class="ctl-lab" style="display:block;margin-bottom:6px">Time to goal in the headline</span>
            <div class="modeseg m2" id="dfModelSeg" role="group" aria-label="How to time the goal">
              <button class="on" type="button" data-v="simple">Simple rule</button>
              <button type="button" data-v="real">Realistic</button>
            </div>
          </div>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="dfAdvBtn" type="button">
            <span id="dfAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="dfResLab">Your daily calorie deficit</div>
          <div class="res-big"><span id="dfBig">—</span> <span class="res-unit" id="dfUnitTxt"></span></div>
          <div class="res-sub" id="dfSub">Enter your details to see your deficit.</div>
        </div>

        <div id="dfBody" style="display:none">
          <p class="res-tip adv-tip" id="dfTip"></p>
          <div id="dfFlags"></div>

          <div class="bf-cmp"><span class="k" id="dfMaintLab">Maintenance</span><span class="v" id="dfMaintRow">—</span></div>
          <div id="dfRows"></div>

          <div id="dfBarWrap">
            <p class="bm-h" id="dfBarH">Where your day goes</p>
            <div id="dfBar"></div>
          </div>

          <div id="dfExWrap">
            <p class="bm-h" style="margin-top:18px">Eat less or move more?</p>
            <p class="df-note" style="margin-top:-4px">Extra kcal you burn a day with exercise, on top of your activity level. Each one lets you eat that much more for the same deficit.</p>
            <div class="chips" id="dfExChips"></div>
          </div>

          <div id="dfChartBlock" style="display:none">
            <p class="bm-h" style="margin-top:18px">Weight over time</p>
            <div id="dfChart"></div>
            <div class="bm-key"><span><i class="df-lr"></i>Realistic (maintenance falls as you lose)</span><span><i class="df-ls"></i>Simple rule</span></div>
          </div>
          <p class="df-note" id="dfNoGoal" style="display:none;margin-top:14px">Add a goal weight to see the time to goal and the weight curve.</p>

          <div id="dfLadderWrap">
            <div class="proj-sep"></div>
            <div class="tally-head"><h3>Deficits side by side</h3></div>
            <p class="add-note" id="dfLadderNote" style="text-align:left;margin:-6px 0 6px"></p>
            <table class="dtable bm-act" id="dfLadder"></table>
          </div>

          <div id="dfAdvOut" style="display:none"></div>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="dfMLab">Deficit</span>
    <div class="mbar-vals"><b id="dfMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More health calculators that may interest you</p>
    <div class="pills">
${pill('/calorie-calculator/', 'Calorie Calculator', '<path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2 0-3 0-5 2-8z"/>')}
${pill('/tdee-calculator/', 'TDEE Calculator', '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>')}
${pill('/bmr-calculator/', 'BMR Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
${pill('/macro-calculator/', 'Macro Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 3"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the calorie deficit calculator</h2>
        <p>Choose your <strong>units</strong> and <strong>sex</strong>, then either let the calculator <strong>estimate</strong> your maintenance calories from your age, height, weight and activity level, or choose <strong>I know it</strong> and type your own number. Add your <strong>current weight</strong> and, if you want a timeline, a <strong>goal weight</strong>.</p>
        <p>Then set the deficit the way that suits you: <strong>Deficit</strong> (kcal a day), <strong>Pace</strong> (kg or lb a week, or a percentage of your weight), <strong>Date</strong> (the deficit you need to reach your goal by a day) or <strong>I eat</strong> (type what you eat and see the deficit it gives). Use the <strong>exercise</strong> chips to see how burning more changes what you can eat, and tap a row of the <strong>side-by-side</strong> table to use it.</p>

        <h2>What is a calorie deficit?</h2>
        <p>A calorie deficit is eating fewer calories than your body burns. Your body makes up the difference from stored energy, mostly body fat. The size of the deficit decides how fast you lose: a bigger gap loses faster, but is harder to keep up and can cut into the food you need.</p>

        <h2>The calorie deficit formula</h2>
        <div class="formula">
          Deficit = calories you burn − calories you eat
          <small>${c0(E.KCAL_KG)} KCAL ≈ 1 KG OF BODY FAT (3,500 KCAL ≈ 1 LB)</small>
        </div>
        <p>Take the example: a 35-year-old woman, 165 cm and 80 kg, moderately active. Her BMR is <strong>${c0(bmr)} kcal</strong> (Mifflin-St Jeor), and ${c0(bmr)} × 1.55 gives a maintenance of <strong>${c0(M)} kcal</strong> a day. Eating ${c0(a500.I)} kcal is a deficit of <strong>${c0(a500.D)} kcal</strong> (${Math.round(pct500)}% of maintenance), which loses about <strong>${r2(a500.wkKg)} kg</strong> (${r2(a500.wkLb)} lb) a week.</p>
      </div>

      <div>
        <h2>How big a deficit?</h2>
        <p>For the same woman, aiming for 70 kg (a 10 kg loss), here is what each deficit means:</p>
        <table class="dtable">
          <thead><tr><th>Deficit</th><th>She eats</th><th>Per week</th><th>Simple</th><th>Realistic</th></tr></thead>
          <tbody>${ladder}</tbody>
        </table>
        <p>The last two columns are explained below. The calculator shows this table for your own numbers and highlights any row that falls under the safe minimum.</p>

        <h2>Simple rule or realistic?</h2>
        <p>The simple rule divides the energy in the weight you want to lose (${c0(E.KCAL_KG)} kcal per kg) by your deficit. It treats your body as a machine that burns the same every day. In real life you burn about <strong>${c0(s)} kcal less per kg lost</strong>, so the same intake becomes a smaller deficit as you get lighter. The realistic estimate allows for that, so it is a little longer — and a very small deficit can level off before you reach the goal. The weight curve plots both.</p>

        <h2>Safe limits</h2>
        <ul>
          <li><strong>A floor on what you eat.</strong> The calculator flags eating under ${c0(1200)} kcal a day for women or ${c0(1500)} for men — the minimums usually advised without medical supervision.</li>
          <li><strong>A cap on the pace.</strong> It flags a plan that loses more than 1% of your body weight a week.</li>
          <li><strong>Under 18, pregnant or with a medical condition:</strong> talk to a doctor before cutting calories.</li>
        </ul>
        <p>For a full plan built around a goal date, with a pace table and protein target, use the <a href="/calorie-calculator/">calorie calculator</a>; for your maintenance calories and macros, the <a href="/tdee-calculator/">TDEE calculator</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/datepicker.min.js"></script>
<script src="/assets/app.js?v=270"></script>
<script>CalcThis.initDeficitCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const dir = ROOT + 'calorie-deficit-calculator/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '/calorie-deficit-calculator/'") ? s : s.replace("  { file: 'bmr-calculator/index.html',          slug: '/bmr-calculator/' },\n", (mm) => mm + "  { file: 'calorie-deficit-calculator/index.html', slug: '/calorie-deficit-calculator/' },\n"));
edit('llms.txt', (lt) => lt.includes('/calorie-deficit-calculator/') ? lt : lt.replace(/(- \[BMR Calculator[^\n]*\n)/, (mm) => mm + '- [Calorie Deficit Calculator — Daily Deficit & Time to Goal](' + url + '): Free calorie deficit calculator: set the deficit in kcal a day, as a weekly pace, by a target date or from what you eat, and see what to eat, the loss per week and the time to your goal, with a simple-rule vs realistic weight curve.\n'));
edit('partials/header.html', (s) => s.includes('/calorie-deficit-calculator/') ? s : s.replace('          <a href="/calorie-calculator/">Calorie</a>\n', (mm) => mm + '          <a href="/calorie-deficit-calculator/">Calorie Deficit</a>\n'));
edit('partials/footer.html', (s) => s.includes('/calorie-deficit-calculator/') ? s : s.replace('          <li><a href="/calorie-calculator/">Calorie Calculator</a></li>\n', (mm) => mm + '          <li><a href="/calorie-deficit-calculator/">Calorie Deficit Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"/calorie-deficit-calculator/"') ? s : s.replace('  "/bmr-calculator/": {', () => '  "/calorie-deficit-calculator/": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/bmr-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Calorie Deficit Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "BMR Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Calorie Deficit Calculator", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Calorie Deficit Calculator</h3>')) {
    const card = `    <a class="calc" href="/calorie-deficit-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/>
          <path d="M9 12h14M9 20h8" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M20 18l3 3 3-3" stroke="#B5761F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <h3>Calorie Deficit Calculator</h3>
      <p>Set your deficit in kcal a day, as a weekly pace, by a target date or from what you eat, and see what to eat, the loss per week and the time to goal — simple rule and realistic side by side, with the food-vs-exercise split.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('    <a class="calc" href="/tdee-calculator/">', () => card + '    <a class="calc" href="/tdee-calculator/">');
  }
  if (!h.includes('<a href="/calorie-deficit-calculator/">Calorie deficit</a><span>')) h = h.replace(/(          <li><a href="\/bmr-calculator\/">BMR<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="/calorie-deficit-calculator/">Calorie deficit</a><span> — deficit by kcal, pace, date or what you eat</span></li>\n');
  return h;
});
