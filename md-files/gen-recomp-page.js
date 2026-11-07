const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /body-recomposition-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.recompEngine / deficitEngine / bmrEngine. Run: node md-files/gen-recomp-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['BMR', 'DEFICIT', 'RECOMP'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.recompEngine, D = CalcThis.deficitEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'.replace('stroke-width="2"', 'stroke-width="2.4"');
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
const g0 = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked example: woman, 35, 168 cm, 70 kg, moderate (x1.55) ---------- */
const X = { male: false, W: 70, H: 168, A: 35, f: 1.55, formula: 'mifflin', bf: null };
const M = D.maint(X), Mr = Math.round(M), bmr = CalcThis.bmrEngine.mifflin(false, 70, 168, 35);
const T = E.targets(M, false), mac = T.map((t) => E.macros(t.cal, 70, E.PROT_DEF, E.FAT_DEF));
const sc = (cut) => f2(cut * 7 / E.KCAL_KG);
const fp = E.fatPlan(70, 30, 25), wkF = E.weeks(fp.lose, T[0].cut), wkB = E.weeks(fp.lose, T[1].cut);
const tbl = '<table class="dtable"><thead><tr><th></th>' + T.map((t) => '<th>' + t.name + '</th>').join('') + '</tr></thead><tbody>' +
  '<tr><td>Calories cut</td>' + T.map((t) => '<td>' + (t.cut ? '−' + g0(t.cut) : '0') + '</td>').join('') + '</tr>' +
  '<tr><td>Calories</td>' + T.map((t) => '<td>' + g0(t.cal) + '</td>').join('') + '</tr>' +
  '<tr><td>Protein</td>' + mac.map((m) => '<td>' + g0(m.p) + ' g</td>').join('') + '</tr>' +
  '<tr><td>Carbs</td>' + mac.map((m) => '<td>' + g0(Math.max(0, m.c)) + ' g</td>').join('') + '</tr>' +
  '<tr><td>Fat</td>' + mac.map((m) => '<td>' + g0(m.f) + ' g</td>').join('') + '</tr>' +
  '<tr><td>Scale a week (fat only)</td>' + T.map((t) => '<td>' + (t.cut ? '−' + sc(t.cut) + ' kg' : '0') + '</td>').join('') + '</tr></tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Murphy C, Koehler K, <a href="https://pubmed.ncbi.nlm.nih.gov/34623701/" rel="noopener">Energy deficiency impairs resistance training gains in lean mass but not strength: a meta-analysis and meta-regression</a>, Scandinavian Journal of Medicine &amp; Science in Sports 2022;32(1):125–137 (abstract read via Europe PMC, 2026-11-07): an energy deficit of about 500 kcal a day prevented gains in lean mass; lean-mass gains were impaired in the deficit group compared with controls while strength gains were comparable; people who lift to preserve lean mass during weight loss should avoid deficits larger than 500 kcal a day. This is the “~500 kcal line” on the ruler.</li>
          <li>Ribeiro AS et al., Effects of different dietary energy intake following resistance training on muscle mass and body fat in bodybuilders: a pilot study, Journal of Human Kinetics 2019;70:125–134 (abstract read via Europe PMC): 11 male bodybuilders over 4 weeks; the group eating more (about 67.5 kcal per kg a day against about 50.1) gained more body fat (+7.4% against +0.8%) and more muscle (+2.7% against +1.1%). A pilot in 11 men, so it is not used to set any number here.</li>
          <li>Protein 1.6–2.2 g per kg a day, fat 0.5–1.5 g per kg and carbohydrate of at least 3 g per kg to fuel training: Iraki J et al., Nutrition Recommendations for Bodybuilders in the Off-Season, Sports 2019;7(7):154 (abstract read). That review is about gaining, not cutting; I found no source I could read for protein in a deficit, so this calculator uses ${E.PROT_DEF} g per kg for all three focuses, inside that range, and the same ${E.FAT_DEF} g per kg of fat.</li>
          <li>The three focuses are this calculator’s own presets (${T.map((t) => t.cut ? '−' + t.cut : 'what you burn').join(', ')} kcal), chosen to stay under the ~500 kcal line. They are not from a study. Calories you burn: Mifflin-St Jeor times the activity factor, or Katch-McArdle when you give a body fat percentage, as on our <a href="/bmr-calculator/">BMR calculator</a>. The minimum of 1,200 kcal (women) or 1,500 kcal (men) and the 7,700 kcal per kg of body weight rule are the same simple rules as on our <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>; the minimum has no primary source.</li>
          <li>The body fat estimate is the US Navy method, the same formula as our <a href="/body-fat-calculator/">body fat calculator</a>: an estimate from a tape measure, not a measurement.</li>
          <li>Competitor pages opened 2026-11-07 for their inputs and presets: Fitness Volt, FatCalc, Bony to Beastly, Healthy Eater and Coachway. Not used because I found no source I could read: muscle-gain projections by training experience, extra calories on training days, and any number for pregnancy, breastfeeding, GLP-1 medicines or kidney disease.</li>
        </ul>
        <p><small>For information only, not medical advice. If you are pregnant or breastfeeding, take a GLP-1 or other weight medicine, have kidney disease or a history of disordered eating, ask a clinician before changing how you eat; this page gives no numbers for those cases.</small></p>`;

const P = {
  slug: 'body-recomposition-calculator', name: 'Body Recomposition Calculator', menu: 'Body Recomposition', body: 'p-bmr p-rc',
  title: 'Body Recomposition Calculator — Calories & Macros',
  desc: 'Body recomposition calculator: calories and protein to lose fat and build muscle, three goals side by side and the 500-calorie research limit on a ruler.',
  h1: 'Body Recomposition Calculator', eyebrow: 'Lose fat and build muscle · three goals side by side · calorie ruler · macros',
  lead: `Enter your <strong>weight</strong>, <strong>height</strong>, <strong>age</strong> and <strong>activity</strong> — you get the <strong>calories and protein</strong> for losing fat, building muscle or both at once, side by side, with a ruler that shows where each sits against the <strong>500-calorie deficit limit</strong> from the research. A woman of 70 kg and 168 cm burning <strong>${g0(Mr)} kcal</strong> eats about <strong>${g0(T[1].cal)} kcal</strong> to do both.`,
  schema: 'Free body recomposition calculator: calories, protein, carbs and fat for losing fat, building muscle or both at once, shown side by side from Mifflin-St Jeor or Katch-McArdle, with a calorie ruler against the 500 kcal deficit where lean-mass gains were prevented in a 2022 meta-analysis, the scale change a week, and a US Navy body fat estimate.',
  llms: 'Free body recomposition calculator: calories and macros to lose fat, build muscle or both, three goals side by side, a calorie ruler against the 500 kcal research limit, scale change a week, a body fat estimate and fat to lose for a target body fat.',
  card: 'Calories and protein to lose fat and build muscle: three goals side by side, a calorie ruler against the research limit and a body fat estimate.',
  faqs: [
    ['What is body recomposition?', 'Body recomposition means losing fat and keeping or building muscle at the same time, so your shape changes more than your weight. It needs strength training, enough protein and a calorie intake near what you burn rather than a large cut.'],
    ['How many calories should I eat for body recomposition?', `Start from the calories you burn and eat a little under them, or exactly that. For a woman of 70 kg and 168 cm, 35 years old, with moderate activity, you burn about ${g0(Mr)} kcal (Mifflin-St Jeor ${g0(bmr)} × 1.55). This calculator’s three presets are ${g0(T[0].cal)} kcal (${g0(T[0].cut)} under, more fat loss), ${g0(T[1].cal)} kcal (${g0(T[1].cut)} under, both) and ${g0(T[2].cal)} kcal (what you burn, more muscle focus). They are presets of this page, not from a study.`],
    ['Can you lose fat and build muscle at the same time?', 'The 2022 meta-analysis I read found that an energy deficit of about 500 kcal a day prevented gains in lean mass, while strength gains stayed comparable. That is why the presets here stay under 500 kcal under what you burn, and why the ruler marks that line. How much muscle a given person gains while losing fat I did not find a source for, so the calculator gives no muscle-gain projection.'],
    ['How big a calorie deficit is too big for recomposition?', 'In the 2022 meta-analysis, a deficit of about 500 kcal a day prevented gains in lean mass, and the authors say people who lift to preserve lean mass during weight loss should avoid deficits larger than 500 kcal a day. The calculator’s biggest preset is 400 kcal under what you burn.'],
    ['How much protein for body recomposition?', `This calculator uses ${E.PROT_DEF} g per kg of body weight a day, inside the 1.6–2.2 g per kg range from a 2019 review of off-season nutrition. For 70 kg that is ${g0(mac[1].p)} g a day, the same every day, split across your meals. That review is about gaining; I found no readable source specific to cutting, so I did not push the number higher.`],
    ['Why does the scale barely move on body recomposition?', `On the simple rule of 7,700 kcal per kg, a 200 kcal cut is about ${sc(200)} kg a week of fat and no cut is none, and any muscle you gain hides part of that. So watch your waist, photos and the weights you lift as well as the scale.`],
    ['Do I need to know my body fat?', 'No. Without it, calories you burn come from your age, height, weight and activity (Mifflin-St Jeor). If you give a body fat percentage, the calculator uses Katch-McArdle, which is based on lean mass. You can also estimate it from your waist and neck (and hip for women) with the US Navy method, right on the page.'],
    ['How long will it take to reach my target body fat?', `Type your current and target body fat under Go advanced. The calculator keeps your lean mass the same and works out the fat to lose. For example 70 kg at 30% body fat and a target of 25% means about ${f1(fp.lose)} kg of fat to lose, about ${Math.round(wkF)} weeks at ${g0(T[0].cut)} kcal under what you burn or ${Math.round(wkB)} weeks at ${g0(T[1].cut)} kcal under, on the simple rule. Building muscle would change the result.`],
    ['How many days a week should I lift?', 'Most recomposition guides suggest at least 3 strength sessions a week. The studies I read give no number, so the calculator shows it as a reminder under Go advanced and does not change the calories with it.'],
    ['Is body recomposition safe for everyone?', 'This page is for information only. If you are pregnant or breastfeeding, take a GLP-1 or other weight medicine, have kidney disease or a history of disordered eating, ask a clinician; the calculator gives no numbers for those cases.']
  ],
  pills: [['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'], ['/macro-calculator/', 'Macro Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/protein-intake-calculator/', 'Protein Intake Calculator', '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>'], ['/body-fat-calculator/', 'Body Fat Calculator', '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>']]
};

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const box = (label, id, ph, uid, u, btns) => `<div class="fld"><span class="lab">${label}</span><div class="cf-box"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" aria-label="${label}"><div class="seg cf-u" id="${uid}" data-u="${u}" role="group" aria-label="${label} unit">${btns.map((b) => `<button type="button"${b[0] === u ? ' class="on"' : ''} data-v="${b[0]}">${b[1]}</button>`).join('')}</div></div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;
const actOpts = [['1.2', 'Sedentary — little or no exercise'], ['1.375', 'Light — 1–3 days/week'], ['1.55', 'Moderate — 3–5 days/week'], ['1.725', 'Active — 6–7 days/week'], ['1.9', 'Very active — hard training / physical job']];
const radio = (k, on, title, id, d) => `<button class="radopt${on ? ' on' : ''}" type="button" role="radio" aria-checked="${on}" data-v="${k}"><i class="rd"></i><span class="t"><b>${title}<span class="rc-k" id="${id}"></span></b><span class="d">${d}</span></span></button>`;

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
        ${seg('rcSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${box('Weight', 'rcW', 'e.g. 165', 'rcWu', 'lb', [['lb', 'lb'], ['kg', 'kg'], ['st', 'st']])}
        ${box('Height', 'rcH', 'e.g. 70 or 5\'10', 'rcHu', 'in', [['in', 'inches'], ['cm', 'cm']])}
        ${tfld('rcAge', 'Age', 'years', 'e.g. 35', 'numeric')}
        ${csel('rcAct', '1.55', 'Activity level', actOpts)}
        <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Your focus</span><div class="radgrp" id="rcFocus" role="radiogroup" aria-label="Your focus">${radio('fat', false, 'Lose more fat', 'rcK1', 'Eat about ' + T[0].cut + ' calories under what you burn. The biggest cut here, still under the ~500 limit from the research.')}${radio('both', true, 'Lose fat and build muscle', 'rcK2', 'Eat about ' + T[1].cut + ' calories under what you burn. A small cut.')}${radio('muscle', false, 'Build more muscle', 'rcK3', 'Eat what you burn. No cut: the scale stays about flat while you lift.')}</div></div>
        <div class="proj-sep"></div>
        ${tfld('rcBf', 'Body fat', '% · optional', 'e.g. 22')}
        <p class="av-note" id="rcBfNote" style="display:none"></p>
        <div class="chips"><button type="button" id="rcEstBtn">Estimate it from my measurements</button></div>
        <div class="rc-est" id="rcEstIn" style="display:none">
          ${tfld('rcWa', 'Waist', 'at the belly button', 'e.g. 34')}
          ${tfld('rcNe', 'Neck', 'narrowest part', 'e.g. 14')}
          <div id="rcHipFld">${tfld('rcHi', 'Hip', 'widest part', 'e.g. 40')}</div>
          <p class="cb-note" id="rcEstNote" style="display:none"></p>
          <div class="chips"><button type="button" id="rcUse" style="display:none"></button></div>
        </div>
        <div class="res-hint" id="rcHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="rcAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${tfld('rcMaint', 'Calories you burn', 'kcal a day · optional', 'e.g. 2200', 'numeric')}
          <p class="av-note" id="rcMaintNote"></p>
          ${tfld('rcTbf', 'Target body fat', '% · optional', 'e.g. 18')}
          <p class="av-note" id="rcTbfNote" style="display:none"></p>
          <div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">Strength sessions a week</span><div class="seg" id="rcDays" role="group" aria-label="Strength sessions a week"><button type="button" data-v="2">2</button><button class="on" type="button" data-v="3">3</button><button type="button" data-v="4">4</button><button type="button" data-v="5">5</button><button type="button" data-v="6">6</button></div></div>
          <p class="av-note" id="rcDaysNote"></p>
          ${seg('rcMeals', 'Meals a day', [['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']], '4')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="rcAdvBtn" type="button">
            <span id="rcAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Calories a day for your focus</div>
          <div class="res-big"><span id="rcBig">—</span></div>
          <div class="res-sub" id="rcSub" data-empty="Enter your weight, age and height.">Enter your weight, age and height.</div>
        </div>
        <div id="rcBody" style="display:none">
          <p class="res-tip adv-tip" id="rcTip"></p>
          <div id="rcFlags"></div>
          <p class="bm-h">Your calories against the research limit</p>
          <div id="rcRuler"></div>
          <div class="bm-key"><span><i class="rc-ky no"></i>~${E.LIMIT} kcal or more under what you burn: lean-mass gains were prevented</span><span><i class="rc-ky ok"></i>Less than that</span></div>
          <p class="cb-note" id="rcRuleNote"></p>
          <p class="bm-h">The three goals side by side</p>
          <table class="dtable" id="rcCmp"></table>
          <p class="cb-note">*The scale change is the simple 7,700 kcal per kg rule for fat only; muscle you gain would hide part of it, so also measure your waist, take photos and track the weights you lift. The three focuses are this page’s own presets, not from a study.</p>
          <p class="bm-h">Your pick, per meal</p>
          <table class="dtable" id="rcMac"></table>
          <div id="rcFatWrap" style="display:none">
            <p class="bm-h">Fat to lose to reach your target body fat</p>
            <div id="rcFatRows"></div>
            <p class="cb-note">Keeps your lean mass the same and uses the simple rule; building muscle would change it.</p>
          </div>
          <p class="cb-note">For information only, not medical advice. Pregnant, breastfeeding, taking a GLP-1 or other weight medicine, kidney disease or a history of disordered eating: ask a clinician first.</p>
        </div>`;
  const left = `
        <h2>How to use the body recomposition calculator</h2>
        <p>Type your <strong>weight</strong>, <strong>height</strong>, <strong>age</strong> and <strong>activity level</strong>, then choose your <strong>focus</strong>: lose more fat, lose fat and build muscle, or build more muscle. All three are always shown side by side, so you can compare without running it again.</p>
        <p>Know your body fat? Type it and the calories use your lean mass (Katch-McArdle). Don’t? Press <em>Estimate it from my measurements</em> and the page works it out from your waist, neck and (for women) hip. Open <strong>Go advanced</strong> to type the calories you burn if you know them, set a target body fat to see the fat to lose, and choose your meals a day.</p>

        <h2>The numbers</h2>
        <div class="formula">
          calories = what you burn − cut (0, ${T[1].cut} or ${T[0].cut} kcal), never below ${g0(E.floor(false))} (women) or ${g0(E.floor(true))} (men)
          <small>PROTEIN ${E.PROT_DEF} G PER KG · FAT ${E.FAT_DEF} G PER KG · CARBOHYDRATE THE REST</small>
        </div>
        <p>A woman of 70 kg, 168 cm, 35 years old with moderate activity burns about ${g0(Mr)} kcal:</p>
        ${tbl}`;
  const right = `
        <h2>What body recomposition means</h2>
        <p>Body recomposition is losing fat and keeping or building muscle at the same time, so your shape changes more than your weight. The research on it is thin, which is why this page shows the one hard number I could read: a 2022 meta-analysis found that a deficit of about ${E.LIMIT} kcal a day prevented gains in lean mass, and the ruler marks that line.</p>

        <h2>Why the scale barely moves</h2>
        <p>A small cut is a small number on the scale (${sc(200)} kg a week at ${g0(T[1].cut)} kcal under, on the simple rule) and any muscle gained hides part of it. Measure your waist, take photos and track the weights you lift as well.</p>

        <h2>Related tools</h2>
        <p>For the full macro split see the <a href="/macro-calculator/">macro calculator</a>, for a plain fat-loss plan the <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>, and for gaining the <a href="/bulking-calculator/">bulking calculator</a>.</p>
        ${SRC}`;

  const body = `<body class="${P.body}">
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
    <span class="mbar-lab" id="rcMLab">Calories a day</span>
    <div class="mbar-vals"><b id="rcMVal">—</b></div>
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
<script>CalcThis.initRecompCalc();</script>
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
const prev = { slug: 'vitamin-d-calculator', menu: 'Vitamin D', name: 'Vitamin D Calculator', llms: 'Vitamin D Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace("  { file: '" + prev.slug + "/index.html', slug: '" + ps2 + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M5 12v8M9 9v14M23 9v14M27 12v8M9 16h14" stroke="#37503F" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="16" cy="6" r="2" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — calories and protein to lose fat and build muscle, three goals side by side, a calorie ruler against the research limit and a body fat estimate</span></li>\n');
    return h;
  });
}
