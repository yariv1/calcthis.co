const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /keto-calculator/ (daily keto macros) and /net-carb-calculator/ (food label maths + day tally) and registers both (sitemap, build.js PAGES,
   llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json). Every number in the text comes from CalcThis.ketoEngine / netcarbEngine.
   Run: node md-files/gen-keto-pages.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['BMR-ENGINE', 'DEFICIT-ENGINE', 'KETO-ENGINE', 'NETCARB-ENGINE'].forEach((m) => eval(app.slice(app.indexOf('/* ' + m + ':START */'), app.indexOf('/* ' + m + ':END */'))));
const K = CalcThis.ketoEngine, N = CalcThis.netcarbEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const f = (x, d) => (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
const t1 = (x) => String(parseFloat(f(x, 1)));
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const g0 = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const LB = 2.20462;

/* ---------- worked numbers ---------- */
const EX = { male: false, W: 70, H: 165, A: 35, f: 1.55, bf: null, goal: 'lose', pace: 0.5, cap: 25, pg: 1.5, basis: 'ideal', kcal: null, G: null, meals: 3 };
const R = K.solve(EX);
const EXm = K.solve(Object.assign({}, EX, { male: true, W: 90, H: 180, A: 40, f: 1.375, goal: 'maint' }));
const capTbl = K.CAPS.map((c) => '<tr><td>' + c + ' g</td>' + [1500, 1800, 2200].map((k) => '<td>' + f(c * 4 / k * 100, 1).replace(/\.0$/, '') + '%</td>').join('') + '</tr>').join('');
const protTbl = [55, 65, 75, 85].map((kg) => '<tr><td>' + kg + ' kg (' + Math.round(kg * LB) + ' lb)</td>' + K.PROT.map((p) => '<td>' + Math.round(p.g * kg) + ' g</td>').join('') + '</tr>').join('');
const NC = N.split({ label: 'us', total: 22, fiber: 6, alc: 8, f: N.frac('mal') });
const NCeu = N.split({ label: 'eu', total: 16, fiber: 6, alc: 8, f: N.frac('mal') });
const sugTbl = N.TYPES.map((t) => '<tr><td>' + t.name + '</td><td>' + (t.gi === null ? '—' : t.gi) + '</td><td>' + Math.round(N.frac(t.id) * 100) + '%</td><td>' + (t.id === 'ery' ? '0' : '2.4') + '</td></tr>').join('');
const mal = (x) => t1(x);

const SRC_K = `<h2>Sources</h2>
        <ul>
          <li>Volek JS, Phinney SD, Krauss RM et al., <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8537012/" rel="noopener">Alternative Dietary Patterns for Americans: Low-Carbohydrate Diets</a>, Nutrients 2021;13(10):3299 — the 20–50 g carbohydrate range “assuming protein is not consumed in excess”, protein of 1.2–2.0 g per kg of adjusted (ideal) body weight, typically 1.2–1.5 g/kg (read November 2026).</li>
          <li>Mifflin MD et al., A new predictive equation for resting energy expenditure, American Journal of Clinical Nutrition 1990;51:241, and the Katch–McArdle equation (370 + 21.6 × lean body mass in kg) when you enter body fat — multiplied by the activity level you choose.</li>
          <li>Devine BJ, Gentamicin therapy, Drug Intelligence and Clinical Pharmacy 1974;8:650 — the ideal body weight (50 kg for men, 45.5 kg for women, plus 2.3 kg per inch over 5 feet) the protein target is taken from.</li>
          <li>Regulation (EU) No 1169/2011, <a href="https://www.legislation.gov.uk/eur/2011/1169/annex/XIV" rel="noopener">Annex XIV</a> — 4 kcal per gram of protein and carbohydrate, 9 kcal per gram of fat.</li>
          <li>The 7,700 kcal per kilogram of body fat (about 3,500 per pound) is the usual rule of thumb; real weight change varies from person to person.</li>
        </ul>
        <p><small>An estimate for information only. A ketogenic diet is not suitable for everyone — talk to a doctor first if you have diabetes, kidney or liver disease, take medication, or are pregnant or breastfeeding. Not medical or dietary advice.</small></p>`;
const SRC_N = `<h2>Sources</h2>
        <ul>
          <li>Livesey G, <a href="https://www.cambridge.org/core/journals/nutrition-research-reviews/article/health-potential-of-polyols-as-sugar-replacers-with-emphasis-on-low-glycaemic-properties/51B0744C8573925A7A74FF2AD87429F9" rel="noopener">Health potential of polyols as sugar replacers, with emphasis on low glycaemic properties</a>, Nutrition Research Reviews 2003;16:163 — glycaemic index of erythritol 0, xylitol 13, sorbitol 9, maltitol 35 (glucose 100, sucrose 65); the share of each sugar alcohol counted here.</li>
          <li>Regulation (EU) No 1169/2011, <a href="https://www.legislation.gov.uk/eur/2011/1169/annex/I" rel="noopener">Annex I</a> (“carbohydrate” means any carbohydrate metabolised by humans and includes polyols; fibre is defined separately) and <a href="https://www.legislation.gov.uk/eur/2011/1169/annex/XIV" rel="noopener">Annex XIV</a> (carbohydrate 4 kcal/g, polyols 2.4 kcal/g, fibre 2 kcal/g, erythritol 0 kcal/g) — why UK and EU labels differ from US and Canadian ones.</li>
          <li>Volek JS et al., <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8537012/" rel="noopener">Nutrients 2021;13(10):3299</a> — the 20–50 g a day carbohydrate range for a ketogenic diet.</li>
          <li>“Other, mixed or not sure” counts half of the sugar alcohol, the common rule of thumb (net carbs = total carbohydrate − fiber − sugar alcohol ÷ 2) used by tools such as Omni Calculator and Inch Calculator — a convention, not a measured value.</li>
        </ul>
        <p><small>An estimate for information only — your own response to fiber and sugar alcohols varies. If you take insulin or other diabetes medication, do not use net carb counts to set doses without your care team. Not medical or dietary advice.</small></p>`;

const pillIco = {
  carb: '<path d="M12 3c4 2 7 5 7 9a7 7 0 0 1-14 0c0-4 3-7 7-9z"/><path d="M12 21V9"/>',
  calc: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  fire: '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>',
  scale: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z"/>'
};
const PAGES = {
  keto: {
    slug: 'keto-calculator', name: 'Keto Calculator', menu: 'Keto',
    title: 'Keto Calculator — Daily Macros and Net Carb Limit',
    desc: 'Keto calculator: daily calories, protein, fat and net carbs from your size, activity and weight goal, with a carb-limit scale and the grams for each meal.',
    h1: 'Keto Calculator', eyebrow: 'Keto macros · net carb limit · lose, maintain or gain',
    lead: `Enter your <strong>size</strong>, <strong>activity</strong> and goal — you get your daily <strong>calories</strong> and the <strong>net carbs, protein and fat</strong> in grams, with the carb limit shown on the usual 20–50 g keto range. A 35-year-old woman, 165 cm and 70 kg, losing 0.5 kg a week on 25 g net carbs eats about <strong>${g0(R.kcal)} kcal</strong>: <strong>${Math.round(R.protG)} g</strong> protein and <strong>${Math.round(R.fatG)} g</strong> fat.`,
    schema: 'Free keto calculator: daily calories, net carbs, protein and fat in grams from your age, height, weight and activity (Mifflin-St Jeor or Katch-McArdle), with a weight-loss, maintenance or gain pace, a net carb limit of 20-50 g, protein by ideal body weight and per-meal grams.',
    llms: 'Free keto calculator: daily calories and net carbs, protein and fat in grams from your size, activity and pace; carb limit 20-50 g, protein per kg ideal body weight, per-meal grams.',
    card: 'Daily keto macros — calories, net carbs, protein and fat in grams for losing, maintaining or gaining weight, with the carb limit shown on the 20–50 g range.',
    faqs: [
      ['How many net carbs should I eat on keto?', 'The usual range is 20–50 grams of carbohydrate a day. A 2021 review by Volek, Phinney and colleagues describes it as a general range that varies from person to person, assuming protein is not eaten in excess. The calculator starts at 25 g and lets you pick 20, 25, 30 or 50 g — or your own number under Go advanced — and shows where your choice sits on that range. Most people count net carbs (total carbohydrate minus fiber and part of any sugar alcohol); the <a href="/net-carb-calculator/">net carb calculator</a> does that for a food label.'],
      ['How are keto macros calculated?', `Calories first: your resting rate (Mifflin-St Jeor, or Katch-McArdle if you give your body fat) times your activity level gives the calories to maintain your weight; a weight-loss or gain pace then moves it by 1,100 kcal a day per kilogram a week (7,700 kcal per kg of body fat). Net carbs are your chosen limit, protein is grams per kilogram of ideal body weight, and fat is whatever calories are left at 9 kcal a gram. For the example above: ${g0(R.maint)} kcal to maintain, ${g0(R.kcal)} to lose 0.5 kg a week, ${t1(R.carbG)} g carbs (${t1(R.carbG * 4)} kcal), ${Math.round(R.protG)} g protein (${Math.round(R.protG * 4)} kcal) and ${Math.round(R.fatG)} g fat (${Math.round(R.fatG * 9)} kcal).`],
      ['How much protein should I eat on keto?', `The Volek review gives 1.2–2.0 grams per kilogram of ideal body weight, typically 1.2–1.5 g/kg, and notes little evidence for more than 2.0 g/kg, which makes ketosis harder to reach. The calculator offers 1.2 (lower), 1.5 (typical) and 2.0 (higher) g/kg. At 1.5 g/kg an ideal weight of ${t1(R.ref)} kg gives ${Math.round(R.protG)} g.`],
      ['Why is protein based on ideal body weight and not my actual weight?', 'The research the ranges come from states protein per kilogram of ideal or adjusted body weight, not total weight, so someone with extra weight does not get a very large protein number. The calculator uses the Devine ideal weight for your height (or your actual weight if that is lower). Under Go advanced you can switch to your actual weight, for example if you have a lot of muscle.'],
      ['How much fat should I eat on keto?', `Fat is what remains after carbs and protein: calories minus 4 kcal per gram of each, divided by 9. In the example that is ${Math.round(R.fatG)} g a day — about ${Math.round(R.fatPct)}% of calories. If you are losing weight, some of that fat is meant to come from your own body, so the number is a ceiling, not a target to hit.`],
      ['How fast can I lose weight on keto?', 'The calculator lets you pick 0.5, 1, 1.5 or 2 lb (0.25, 0.5, 0.75 or 1 kg) a week and warns when the pace is faster than 1% of your body weight a week or the calories would fall below 1,200 (women) or 1,500 (men) a day. Real loss slows over time; the <a href="/calorie-deficit-calculator/">calorie deficit calculator</a> models that.'],
      ['Do I count total carbs or net carbs?', 'The 20–50 g range in the research is stated as carbohydrate. In practice many people subtract fiber (and some sugar alcohols) and count net carbs, which lets more vegetables fit. If you want to be strict, count total carbs; if you count net carbs, the net carb calculator shows a strict, a best-estimate and a lenient count.'],
      ['Is a ketogenic diet safe?', 'It is not suitable for everyone. Talk to a doctor first if you have diabetes (especially if you take medication), kidney or liver disease, take any regular medication, or are pregnant or breastfeeding. This calculator is for adults and gives an estimate for information only, not medical advice.'],
      ['Can I use the calculator to maintain or gain weight?', 'Yes. Choose Maintain for your maintenance calories or Gain for a surplus at the pace you pick; the carb limit and protein stay the same and fat takes the remaining calories.']
    ],
    pills: [['/net-carb-calculator/', 'Net Carb Calculator', pillIco.carb], ['/macro-calculator/', 'Macro Calculator', pillIco.scale], ['/calorie-deficit-calculator/', 'Calorie Deficit Calculator', pillIco.calc], ['/protein-intake-calculator/', 'Protein Intake Calculator', pillIco.heart]]
  },
  net: {
    slug: 'net-carb-calculator', name: 'Net Carb Calculator', menu: 'Net Carb',
    title: 'Net Carb Calculator — Label Maths and a Daily Tally',
    desc: 'Net carb calculator for any food label: US or EU labels, sugar alcohol by type, strict to lenient counts, and a running total against your daily carb limit.',
    h1: 'Net Carb Calculator', eyebrow: 'Net carbs · US and EU labels · sugar alcohol by type · day tally',
    lead: `Type the <strong>total carbohydrate</strong>, <strong>fiber</strong> and <strong>sugar alcohol</strong> from a food label — you get the <strong>net carbs</strong>, with a strict and a lenient count beside the best estimate and a running total of your day. A US label showing 22 g carbohydrate, 6 g fiber and 8 g maltitol works out to about <strong>${mal(NC.net)} g</strong> net carbs.`,
    schema: 'Free net carb calculator: total carbohydrate minus fiber and sugar alcohol for US, Canadian, UK and EU labels, per serving or per 100 g, sugar alcohol counted by type (erythritol, xylitol, sorbitol, maltitol), strict, best and lenient counts and a daily net carb tally against a 20-50 g limit.',
    llms: 'Free net carb calculator: net carbs from a US or EU food label, per serving or per 100 g, sugar alcohol by type, strict/best/lenient counts and a daily tally against a 20-50 g limit.',
    card: 'Net carbs from any food label — US or EU, per serving or per 100 g, sugar alcohol by type — with strict and lenient counts and a daily tally.',
    faqs: [
      ['What are net carbs?', 'Net carbs are the carbohydrates that raise blood sugar: total carbohydrate minus the fiber and, in part, the sugar alcohols, which are digested little or not at all. It is a counting convention rather than a line on a nutrition label, so different tools subtract different amounts — this calculator shows three counts so you can see the spread.'],
      ['How do I calculate net carbs?', `On a US or Canadian label: net carbs = total carbohydrate − fiber − the part of the sugar alcohol that does not count. For 22 g total carbohydrate, 6 g fiber and 8 g maltitol: 22 − 6 − (8 × (1 − 0.35)) = ${mal(NC.net)} g. Counting all the sugar alcohol (strict) gives ${mal(NC.strict)} g; counting none of it (lenient) gives ${mal(NC.lenient)} g.`],
      ['Do sugar alcohols count as carbs?', `Partly, and it depends on which one. The calculator counts each by its glycaemic index relative to glucose (Livesey, 2003): erythritol 0, xylitol 13, sorbitol 9 and maltitol 35 — so ${Math.round(N.frac('ery') * 100)}%, ${Math.round(N.frac('xyl') * 100)}%, ${Math.round(N.frac('sor') * 100)}% and ${Math.round(N.frac('mal') * 100)}% of the grams. For “other, mixed or not sure” it counts half, the common rule of thumb. Maltitol is the one that most often surprises people.`],
      ['Why do US and EU labels give different numbers?', `They define carbohydrate differently. US and Canadian labels show Total Carbohydrate, which includes dietary fiber and sugar alcohol, so you subtract the fiber. UK and EU labels show Carbohydrate without the fibre (fibre is listed separately), with sugar alcohols (polyols) inside it, so you do not subtract fibre again. A UK label saying 16 g carbohydrate, 6 g fibre and 8 g maltitol gives ${mal(NCeu.net)} g net carbs — the same food as the 22 g US label above.`],
      ['Should I count net carbs or total carbs on keto?', 'The 20–50 g a day range in the ketogenic-diet research is stated as carbohydrate, so total carbs is the strictest reading. Counting net carbs lets more fibre-rich vegetables fit and is what most keto calculators use. If you are unsure, watch the strict figure: if it stays inside your limit, every method does.'],
      ['How many net carbs per day?', 'On a ketogenic diet the usual range is 20–50 g of carbohydrate a day, varying from person to person. The day tally checks what you add against 20, 25, 30 or 50 g or your own limit. The <a href="/keto-calculator/">keto calculator</a> works out the rest of your macros from it.'],
      ['Can I rely on net carbs if I have diabetes?', 'Be careful. Net carb counts can understate how much a food raises blood sugar, because fiber and sugar alcohols differ in how much they are absorbed. If you take insulin or other diabetes medication, ask your care team how to count carbohydrate for dosing rather than using net carbs.'],
      ['What does the “per 100 g” option do?', 'Many labels give values per 100 g as well as per serving. Choose Per 100 g, enter the figures from that column, and type how many grams you ate — the calculator scales the result. Leave the amount empty to see the net carbs in 100 g.'],
      ['How does the day tally work?', 'After each food, press Add to my day. The list adds up your net carbs (best estimate), shows how many grams are left of your daily limit and what the strict and lenient totals would be, so one mislabelled bar does not blow the day.']
    ],
    pills: [['/keto-calculator/', 'Keto Calculator', pillIco.carb], ['/macro-calculator/', 'Macro Calculator', pillIco.scale], ['/calorie-calculator/', 'Calorie Calculator', pillIco.fire], ['/tdee-calculator/', 'TDEE Calculator', pillIco.calc]]
  }
};

const tfld = (id, label, unit, ph, uid, extra) => `<label class="fld" for="${id}"><span class="lab"${extra && extra.labId ? ' id="' + extra.labId + '"' : ''}>${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${extra && extra.mode ? extra.mode : 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label.replace(/<[^>]+>/g, '')}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;

function build(kind) {
  const P = PAGES[kind], keto = kind === 'keto', url = 'https://calcthis.co/' + P.slug + '/';
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

  const ACT = [[1.2, 'Sedentary — little or no exercise'], [1.375, 'Light — 1–3 days/week'], [1.55, 'Moderate — 3–5 days/week'], [1.725, 'Active — 6–7 days/week'], [1.9, 'Very active — hard training / physical job']];
  const inputKeto = `
        <h2 class="card-h2">About you</h2>
        ${seg('kzSex', 'Sex', [['f', 'Female'], ['m', 'Male']], 'f')}
        ${tfld('kzAge', 'Age', 'years', 'e.g. 35')}
        ${seg('kzHU', 'Height units', [['in', 'inches'], ['cm', 'cm']], 'in')}
        ${tfld('kzHt', 'Height', 'inches or 5\'10', 'e.g. 70 or 5\'10', 'kzHL', { mode: 'text' })}
        ${seg('kzWU', 'Weight units', [['lb', 'lb'], ['kg', 'kg'], ['st', 'st']], 'lb')}
        ${tfld('kzW', 'Weight', 'lb', 'e.g. 154', 'kzWL')}
        ${csel('kzAct', 1.55, 'Activity level', ACT)}
        <div class="proj-sep"></div>
        ${seg('kzGoal', 'Goal', [['lose', 'Lose weight'], ['maint', 'Maintain'], ['gain', 'Gain']], 'lose')}
        <div id="kzPaceWrap">${seg('kzPace', '<span id="kzPaceLab">Lose per week</span>', [[0, '0.5 lb'], [1, '1 lb'], [2, '1.5 lb'], [3, '2 lb']], 1)}</div>
        ${seg('kzCap', 'Net carb limit a day', K.CAPS.map((c) => [c, c + ' g']), 25)}
        ${seg('kzProt', 'Protein, g per kg ideal weight', K.PROT.map((p) => [p.g, p.g.toFixed(1)]), 1.5)}
        <p class="av-note" style="margin:0 0 8px">Net carbs 20–50 g and protein 1.2–2.0 g/kg ideal weight are the ranges in the ketogenic-diet research (Volek 2021).</p>
        <div class="res-hint" id="kzHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="kzAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="cb-two">${tfld('kzBf', 'Body fat', '%', 'e.g. 28 (optional)')}${tfld('kzKcal', 'Your own calories', 'kcal', 'e.g. 1800')}</div>
          <div class="cb-two">${tfld('kzCapOwn', 'Your own carb limit', 'g', 'e.g. 35')}${tfld('kzTarget', 'Target weight', 'lb', 'e.g. 145', 'kzTL')}</div>
          ${seg('kzBasis', 'Protein per kg of', [['ideal', 'Ideal weight'], ['actual', 'Actual weight']], 'ideal')}
          ${seg('kzMeals', 'Meals a day', [[2, '2'], [3, '3'], [4, '4'], [5, '5']], 3)}
          <p class="av-note" style="margin:0 0 8px">Body fat switches the estimate to Katch-McArdle. Your own calories replace the target. A target weight adds the time to reach it.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="kzAdvBtn" type="button">
            <span id="kzAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const inputNet = `
        <h2 class="card-h2">The food label</h2>
        ${seg('ncLab', 'Label from', [['us', 'US / Canada'], ['eu', 'UK / EU / other']], 'us')}
        <p class="av-note" id="ncLabNote" style="margin-top:0"></p>
        ${seg('ncBasis', 'Values are', [['serv', 'Per serving'], ['100', 'Per 100 g']], 'serv')}
        ${tfld('ncTot', 'Total carbohydrate', 'g', 'e.g. 22', null, { labId: 'ncTotLab' })}
        ${tfld('ncFib', 'Dietary fiber', 'g', 'e.g. 6 (optional)', null, { labId: 'ncFibLab' })}
        ${tfld('ncAlc', 'Sugar alcohol', 'g', 'e.g. 8 (optional)')}
        <div id="ncTypeWrap" style="display:none">${csel('ncType', 'oth', 'Which sugar alcohol?', N.TYPES.map((t) => [t.id, t.name]))}</div>
        ${tfld('ncEat', 'Servings eaten', 'servings (blank = 1)', 'e.g. 1 or 0.5', 'ncEatU', { labId: 'ncEatLab' })}
        <div class="proj-sep"></div>
        ${seg('ncLim', 'Daily net carb limit', K.CAPS.map((c) => [c, c + ' g']), 25)}
        <label class="fld" for="ncName"><span class="lab">Food name <span class="unit">for your day list (optional)</span></span><div class="inp"><input id="ncName" type="text" maxlength="40" autocomplete="off" placeholder="e.g. Protein bar"></div></label>
        <div class="res-hint" id="ncHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="ncAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="cb-two">${tfld('ncOwn', 'Your own daily limit', 'g', 'e.g. 35')}${tfld('ncShare', 'Sugar alcohol counted', '%', 'e.g. 50')}</div>
          <p class="av-note" style="margin:0 0 8px">Your own limit replaces the 20–50 g choices. The counted share overrides the type: 0 counts none of the sugar alcohol, 100 counts all of it.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="ncAdvBtn" type="button">
            <span id="ncAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const resultKeto = `
        <div class="bf-res">
          <div class="res-lab">Daily calories</div>
          <div class="res-big"><span id="kzBig">—</span></div>
          <div class="res-sub" id="kzSub" data-empty="Enter your age, height and weight.">Enter your age, height and weight.</div>
        </div>
        <div id="kzBody" style="display:none">
          <p class="res-tip adv-tip" id="kzTip"></p>
          <p class="bm-h">Where your calories come from</p>
          <div id="kzBar"></div>
          <p class="bm-h">Your net carb limit on the 20–50 g keto range</p>
          <div id="kzCapRule"></div>
          <p class="bm-h">Your protein within its range (1.2–2.0 g/kg ideal weight)</p>
          <div id="kzProtRule"></div>
          <div class="proj-sep"></div>
          <table class="dtable" id="kzRows"></table>
          <p class="bm-h" id="kzMealH">Per meal</p>
          <table class="dtable" id="kzMeal"></table>
          <p class="cb-note">An estimate for adults — not medical or dietary advice. Talk to a doctor before starting a ketogenic diet if you have a medical condition or take medication.</p>
        </div>`;
  const resultNet = `
        <div class="bf-res">
          <div class="res-lab" id="ncResLab">Net carbs</div>
          <div class="res-big"><span id="ncBig">—</span></div>
          <div class="res-sub" id="ncSub" data-empty="Enter the total carbohydrate from the label.">Enter the total carbohydrate from the label.</div>
        </div>
        <div id="ncBody" style="display:none">
          <p class="res-tip adv-tip" id="ncTip"></p>
          <p class="bm-h">Where the carbs go</p>
          <div id="ncBar"></div>
          <div class="proj-sep"></div>
          <table class="dtable" id="ncRows"></table>
          <div class="add-row" style="margin-top:16px"><button class="btn" id="ncAdd" type="button" disabled><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>Add to my day</button></div>
          <p class="cb-note">An estimate — your body’s response to fiber and sugar alcohols varies. Not medical or dietary advice.</p>
        </div>
        <div class="cb-day" id="ncDay" style="display:none"></div>`;

  const left = keto ? `
        <h2>How to use the keto calculator</h2>
        <p>Enter your <strong>age, height and weight</strong>, pick your <strong>activity level</strong> and a goal. For weight loss choose how many pounds (or kilograms) a week; the daily target drops by about 500 kcal for each pound. Choose your <strong>net carb limit</strong> (20, 25, 30 or 50 g) and a protein level. The result shows calories, grams of net carbs, protein and fat, where each sits on its research range, and the grams for each meal.</p>
        <p>Open <strong>Go advanced</strong> to add your body fat (Katch-McArdle), your own calories or carb limit, a target weight for the time to goal, the protein basis and the number of meals.</p>

        <h2>How the keto macros are worked out</h2>
        <div class="formula">
          kcal = maintenance ± pace × 1,100 · net carbs = your limit · protein = g/kg × ideal weight · fat = (kcal − 4 × protein − 4 × carbs) ÷ 9
          <small>MIFFLIN-ST JEOR · VOLEK 2021 RANGES · 4 / 4 / 9 KCAL PER GRAM</small>
        </div>
        <p>Example: a 35-year-old woman, 165 cm and 70 kg, moderately active. Maintenance is ${g0(R.maint)} kcal; losing 0.5 kg a week takes ${g0(R.maint - R.kcal)} off, so <strong>${g0(R.kcal)} kcal</strong>. Ideal weight (Devine) is ${t1(R.ibw)} kg, so protein at 1.5 g/kg is <strong>${Math.round(R.protG)} g</strong>; net carbs are 25 g; fat is the remaining <strong>${Math.round(R.fatG)} g</strong>. A 40-year-old man, 180 cm and 90 kg, lightly active, maintaining: ${g0(EXm.kcal)} kcal, ${Math.round(EXm.protG)} g protein, ${Math.round(EXm.fatG)} g fat.</p>

        <h2>What share of your calories 20–50 g of carbs is</h2>
        <table class="dtable"><thead><tr><th>Net carbs a day</th><th>1,500 kcal</th><th>1,800 kcal</th><th>2,200 kcal</th></tr></thead><tbody>${capTbl}</tbody></table>` : `
        <h2>How to use the net carb calculator</h2>
        <p>Choose whether the label is <strong>US / Canada</strong> or <strong>UK / EU</strong>, then type the <strong>total carbohydrate</strong>, <strong>fiber</strong> and <strong>sugar alcohol</strong> in grams. If there is sugar alcohol, pick which one. The result shows the net carbs, a <strong>strict</strong> count (all sugar alcohol included) and a <strong>lenient</strong> count (none), and where the grams go. Press <strong>Add to my day</strong> to keep a running total against your daily limit.</p>

        <h2>The net carbs formula</h2>
        <div class="formula">
          net carbs = total carbohydrate − fiber − sugar alcohol × (1 − counted share)
          <small>US / CANADA LABEL · ON A UK / EU LABEL THE CARBOHYDRATE ALREADY EXCLUDES FIBRE</small>
        </div>
        <p>US label with 22 g total carbohydrate, 6 g fiber and 8 g maltitol (counted at ${Math.round(N.frac('mal') * 100)}%): 22 − 6 − 8 × ${f(1 - N.frac('mal'), 2)} = <strong>${mal(NC.net)} g</strong>. Strict is <strong>${mal(NC.strict)} g</strong>, lenient <strong>${mal(NC.lenient)} g</strong>. On a UK label the same food reads 16 g carbohydrate and 6 g fibre: 16 − 8 × ${f(1 - N.frac('mal'), 2)} = <strong>${mal(NCeu.net)} g</strong>.</p>

        <h2>How much of each sugar alcohol counts</h2>
        <table class="dtable"><thead><tr><th>Sugar alcohol</th><th>Glycaemic index</th><th>Counted here</th><th>kcal per gram (EU)</th></tr></thead><tbody>${sugTbl}</tbody></table>`;
  const right = keto ? `
        <h2>How much protein on keto</h2>
        <p>The research range is 1.2–2.0 g of protein per kilogram of ideal body weight, typically 1.2–1.5 g/kg. Grams a day by ideal weight:</p>
        <table class="dtable"><thead><tr><th>Ideal weight</th>${K.PROT.map((p) => '<th>' + p.g.toFixed(1) + ' g/kg</th>').join('')}</tr></thead><tbody>${protTbl}</tbody></table>

        <h2>Net carbs and ketosis</h2>
        <p>Carbohydrate and, in excess, protein both limit how much ketone the liver makes. The 20–50 g range is a general one: how much you can eat and still be in ketosis varies from person to person. A blood ketone meter or urine strips can tell you where you are; this calculator cannot. For a food label use the <a href="/net-carb-calculator/">net carb calculator</a>.</p>

        <h2>Keto macros for weight loss</h2>
        <p>A weight-loss pace is a calorie deficit; the carb limit and protein stay put, so fat shrinks. If you want the deficit modelled over time, use the <a href="/calorie-deficit-calculator/">calorie deficit calculator</a>; for a non-keto split use the <a href="/macro-calculator/">macro calculator</a>.</p>
        ${SRC_K}` : `
        <h2>US labels vs UK and EU labels</h2>
        <table class="dtable"><thead><tr><th></th><th>US / Canada</th><th>UK / EU</th></tr></thead><tbody><tr><td>Label line</td><td>Total Carbohydrate</td><td>Carbohydrate</td></tr><tr><td>Fiber</td><td>Inside total carbohydrate</td><td>Listed separately (fibre)</td></tr><tr><td>Sugar alcohol</td><td>Inside total carbohydrate</td><td>Inside carbohydrate (polyols)</td></tr><tr><td>To get net carbs</td><td>Subtract fiber and the counted sugar alcohol</td><td>Subtract the counted sugar alcohol only</td></tr></tbody></table>

        <h2>Why three counts</h2>
        <p>Net carbs is not an official label figure, and fiber and sugar alcohols are not absorbed equally. <strong>Strict</strong> subtracts only the fiber, <strong>lenient</strong> subtracts the fiber and all the sugar alcohol, and the <strong>best estimate</strong> subtracts the fiber and the share of the sugar alcohol that is not counted. If a food fits your limit even by the strict count, it fits by every count.</p>

        <h2>Net carbs and your daily limit</h2>
        <p>On a ketogenic diet the usual range is 20–50 g of carbohydrate a day. Pick 20, 25, 30 or 50 g (or your own under Go advanced) and the tally under the result shows what is left. The <a href="/keto-calculator/">keto calculator</a> turns that limit into calories, protein and fat.</p>
        ${SRC_N}`;

  const body = `<body class="p-bmr p-kz">
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
      <div class="card-pad">${keto ? inputKeto : inputNet}
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">${keto ? resultKeto : resultNet}
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="${keto ? 'kz' : 'nc'}MLab">${keto ? 'Calories' : 'Net carbs'}</span>
    <div class="mbar-vals"><b id="${keto ? 'kz' : 'nc'}MVal">—</b></div>
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
<script>CalcThis.${keto ? 'initKetoCalc' : 'initNetCarbCalc'}();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log(P.slug, 'written; title', P.title.length, 'desc', P.desc.length);
}
build('keto'); build('net');

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s = fs.readFileSync(fl, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fl, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
let prevSlug = 'calories-burned-running-calculator', prevMenu = 'Calories Burned Running', prevName = 'Calories Burned Running Calculator';
['keto', 'net'].forEach((kind) => {
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
          <path d="M16 4c6 3 10 7 10 12a10 10 0 0 1-20 0c0-5 4-9 10-12z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M16 26V12" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — ' + (kind === 'keto' ? 'daily keto macros: calories, net carbs, protein and fat' : 'net carbs from a food label, strict to lenient, with a day tally') + '</span></li>\n');
    return h;
  });
  prevSlug = P.slug; prevMenu = P.menu; prevName = P.name;
});
