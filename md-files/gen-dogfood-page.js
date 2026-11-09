const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /dog-food-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.dogFoodEngine. Run: node md-files/gen-dogfood-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* DOGFOOD-ENGINE:START */'), app.indexOf('/* DOGFOOD-ENGINE:END */')));
const E = CalcThis.dogFoodEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const r0 = (x) => Math.round(x);
const grp = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const t1 = (x) => String(parseFloat((Math.round(x * 10) / 10).toFixed(1)));
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- worked numbers ---------- */
const rows = [5, 10, 20, 30, 40].map((kg) => { const n = E.calc(kg, 'neut'), i = E.calc(kg, 'intact'); return { kg, lb: kg * 2.20462, n, i }; });
const tbl = rows.map((r) => '<tr><td>' + r.kg + ' kg (' + t1(r.lb) + ' lb)</td><td>' + grp(r.n.rer) + '</td><td>' + grp(r.n.merLo) + '–' + grp(r.n.merHi) + '</td><td>' + grp(r.i.merLo) + '–' + grp(r.i.merHi) + '</td></tr>').join('');
const fTbl = E.TYPES.map((t) => '<tr><td>' + t.label + '</td><td>' + (t.lo === t.hi ? t.f.toFixed(1) : t.lo.toFixed(1) + '–' + t.hi.toFixed(1)) + '</td></tr>').join('');
const X = E.calc(20, 'neut'), X25 = E.calc(25, 'intact'), P8 = E.calc(8, 'puppy'), P4 = E.calc(8, 'puppy4'), L = E.calc(30, 'loss');
const cups20 = X.mer / 350;
const tr10 = X.mer * 0.10;

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Pet Nutrition Alliance, <a href="https://petnutritionalliance.org/wp-content/uploads/2023/03/MER.RER_.PNA_.pdf" rel="noopener">Calculating Calories Based on Pet Needs</a> (opened 2026-11-09): lactation 2–6 × RER for dogs and cats, gestation 1.6–2.0 × RER for dogs.</li>
          <li>Association for Pet Obesity Prevention (APOP), <a href="https://www.petobesityprevention.org/veterinary-der-calculator" rel="noopener">RER &amp; MER Energy Calculator</a> (opened 2026-11-05): RER = 70 × body weight in kg<sup>0.75</sup>; MER = RER × activity or life-stage factor — sedentary or indoor adult 1.0–1.4, typical neutered adult 1.4–1.6, typical intact adult 1.6–1.8, weight-loss planning 1.0–1.2, working or highly active dogs 1.6–11, puppy under 4 months 3.0, puppy 4 months and older 2.0, gestation 3.0; treats up to 10% of daily calories and subtracted from the daily amount.</li>
          <li><a href="https://www.omnicalculator.com/biology/dog-food" rel="noopener">Omnicalculator dog food calculator</a> (opened 2026-11-05): the same RER formula with one factor per type — inactive 1.2, neutered 1.6, intact 1.8, weight loss 1.0, weight gain 1.7, senior 1.1, working dog 2, 3 and 5 for light, moderate and heavy work. The factors for weight gain, senior and the three working types come from this source only.</li>
          <li>Typical food calories, read from product pages on 2026-11-05: <a href="https://www.hillspet.com/dog-food/science-diet-adult-original-dry" rel="noopener">Hill’s Science Diet Adult Chicken &amp; Barley dry</a> — 3,675 kcal/kg, 365 kcal per 8 fl oz cup; <a href="https://www.royalcanin.com/ca/dogs/products/retail-products/medium-adult-3004" rel="noopener">Royal Canin Medium Adult dry</a> (Canada page) — 3,616 kcal/kg, 340 kcal per cup; <a href="https://www.hillspet.com/dog-food/science-diet-adult-chicken-canned" rel="noopener">Hill’s Science Diet Adult Chicken &amp; Barley canned</a> — 369 kcal per 13 oz (370 g) can; <a href="https://www.pedigree.com/products/wet/choice-cuts-gravy-adult-wet-dog-food-can-beef" rel="noopener">Pedigree Choice Cuts in Gravy canned</a> — 884 kcal/kg, 332 kcal per 13.2 oz can. The page uses the rounded average of each pair (dry 350 kcal per cup and 3,650 per kg, wet 350 per 13 oz can and 940 per kg). Two products per type is a small sample, so the typical value is only a starting point.</li>
          <li>Both sources say the result is a starting estimate that depends on the individual dog; the APOP tool says to adjust from current intake, weight trend, body condition, health and measured response.</li>
        </ul>
        <p><small>For information only. This calculator does not replace your veterinarian, who can set a feeding plan for your dog’s health, body condition and any medical condition. For a nursing mother the factor depends on the litter size and the week of nursing, so the page uses the middle of the 2–6 range; ask your vet.</small></p>`;

const P = {
  slug: 'dog-food-calculator', name: 'Dog Food Calculator', menu: 'Dog Food',
  title: 'Dog Food Calculator — How Much to Feed Your Dog',
  desc: 'Dog food calculator: daily calories for your dog by weight and life stage, then cups, grams or cans from your own food, per meal, with a treat budget.',
  h1: 'Dog Food Calculator', eyebrow: 'Daily calories · cups, grams or cans · per meal · treat budget · puppies to seniors',
  lead: `Enter your dog’s <strong>weight</strong> and <strong>age</strong> — you get the <strong>recommended calories a day</strong>, then how many <strong>cups of dry food or cans of wet food</strong> that is, per day and per meal. A neutered adult of 20 kg (44 lb) needs about <strong>${grp(X.mer)} kcal a day</strong> — ${(Math.round(cups20 * 4) / 4)} cups of a 350 kcal-per-cup food.`,
  schema: 'Free dog food calculator: daily calories for a dog by weight and life stage (adult, puppy, senior, weight loss, working, pregnant), converted to cups, grams or cans from the food label, split per meal, with a treat budget, mixed feeding and a range instead of one false number.',
  llms: 'Free dog food calculator: daily calories by weight and life stage (RER x factor), as a range, converted to cups, grams or cans from your own food, per meal, with a treat budget and mixed feeding.',
  card: 'How much to feed your dog: daily calories by weight and life stage, then cups, grams or cans from your own food, per meal, with a treat budget.',
  faqs: [
    ['How much should I feed my dog?', `Start from calories: a dog’s resting energy requirement is 70 × weight in kg<sup>0.75</sup>, and the daily need is that times a factor for its life stage and activity. For a 20 kg neutered adult that is ${grp(X.rer)} kcal at rest and about ${grp(X.merLo)}–${grp(X.merHi)} kcal a day. Then divide by the calories in your food — a food with 350 kcal per cup means about ${(Math.round(cups20 * 4) / 4)} cups a day. Weigh your dog every couple of weeks and adjust from the trend.`],
    ['How many calories does a dog need a day?', `It depends on weight and life stage. At 5, 10, 20, 30 and 40 kg a neutered adult needs about ${rows.map((r) => grp(r.n.mer)).join(', ')} kcal a day (factor 1.6). Intact adults use 1.6–1.8 times the resting need and sedentary or overweight-prone dogs 1.0–1.4, so the same dog can need ${grp(E.calc(20, 'inactive').merLo)}–${grp(E.calc(20, 'intact').merHi)} kcal a day at 20 kg depending on the type.`],
    ['How do I work out cups of dog food?', `Divide the daily calories by the calories in a cup of your food. Dry food typically has about 350 kcal per US cup (two labels I read: Hill’s Science Diet Adult 365, Royal Canin Medium Adult 340), so ${grp(X.mer)} ÷ 350 = ${(Math.round(cups20 * 100) / 100)} cups, shown as about ${E.frac(cups20)} cups. The calculator does this for you with a typical value; choose “My own” and type the calories from your bag for an exact figure, because foods differ. A cup is a US 8 fl oz cup (237 ml) unless you enter your own scoop size under Go advanced.`],
    ['How much should a puppy eat?', `Puppies use more calories for their weight: the factor is 3.0 times the resting need under 4 months and 2.0 from 4 months (APOP and Omnicalculator agree). An 8 kg puppy needs about ${grp(P4.mer)} kcal a day under 4 months and ${grp(P8.mer)} kcal from 4 months. The calculation uses the puppy’s current weight, so recalculate as it grows; enter the age in months and the right factor is picked for you.`],
    ['How much should I feed a dog that needs to lose weight?', `Veterinary guidance gives 1.0–1.2 times the resting need for weight-loss planning; this calculator uses 1.0 for the headline and shows the range. For a 30 kg dog that is about ${grp(L.merLo)}–${grp(L.merHi)} kcal a day. A weight-loss plan needs a vet to set the target weight and recheck it, so treat this as a starting figure.`],
    ['How many treats can my dog have?', `APOP says treats should stay at or below 10% of daily calories and be subtracted from the daily amount rather than added. For the 20 kg neutered dog, 10% is about ${grp(tr10)} kcal, so the food drops to about ${grp(X.mer - tr10)} kcal. Pick 5% or 10% in the calculator and it does the subtraction.`],
    ['Why does the calculator show a range?', 'Dogs of the same weight differ in activity, age, coat, breed and metabolism, and the two sources give factor ranges rather than single values for adults. A range is more honest than one exact number; the headline uses the single factor Omnicalculator gives and the range comes from the APOP tool.'],
    ['Is the raw food rule of 2–3% of body weight right?', 'Raw-food sellers often quote 2–3% of body weight a day for adult dogs. That figure came from commercial pages, not from a veterinary source I could read, so it is shown only as a comparison under Go advanced. Raw and fresh foods differ a lot in calories per kg and I found no verified typical value, so choose “My own” and enter the kcal per kg from the label.'],
    ['Can I feed two foods, like kibble and wet?', 'Yes. Under Go advanced add a second food with its calories and the share of the food calories it should supply; the calculator then gives the amount of each. The first food is whichever type you picked, dry, wet or your own. Treats are taken off the top first.'],
    ['Does this work for senior dogs?', 'It has a senior type with a factor of 1.1 times the resting need, taken from Omnicalculator; the APOP tool does not give a separate senior factor. Older dogs vary a lot, so use your vet and the weight trend to adjust. See the <a href="/dog-age-calculator/">dog age calculator</a> for when a dog counts as senior.']
  ],
  pills: [['/dog-age-calculator/', 'Dog Age Calculator', '<path d="M12 3a3 3 0 0 1 3 3v2H9V6a3 3 0 0 1 3-3zM7 21c0-5 2-8 5-8s5 3 5 8"/>'], ['/cat-age-calculator/', 'Cat Age Calculator', '<circle cx="12" cy="13" r="7"/><path d="M6 8l-1-5 4 3M18 8l1-5-4 3"/>'], ['/calories-burned-walking-calculator/', 'Calories Burned Walking', '<path d="M13 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10 21l2-7 3 3v4M9 12l3-3 3 2"/>'], ['/water-intake-calculator/', 'Water Intake Calculator', '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>']]
};

const tfld = (id, label, unit, ph, uid, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit"' + (uid ? ' id="' + uid + '"' : '') + '>' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;

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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'LifestyleApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const input = `
        <h2 class="card-h2">Your dog</h2>
        <div class="fld"><span class="lab">Breed <span class="unit">optional · fills in a typical weight</span></span><div class="st-ta"><div class="inp"><input id="fdBreedIn" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="fdBreedList" aria-label="Breed" placeholder="Type a breed"><input id="fdBreed" type="hidden" value=""></div><div class="st-ta-list" id="fdBreedList" role="listbox" style="display:none"></div></div></div>
        <p class="av-note" id="fdBreedNote" style="margin:-6px 0 8px"></p>
        ${seg('fdWU', 'Weight units', [['kg', 'kg'], ['lb', 'lb']], 'kg')}
        ${tfld('fdW', 'Your dog’s weight', 'kg', 'e.g. 20', 'fdWL')}
        ${seg('fdAgeSeg', 'Age', [['puppy', 'Puppy'], ['adult', 'Adult'], ['senior', 'Senior']], 'adult')}
        <div id="fdAgeWrap" style="display:none">${tfld('fdAge', 'Puppy’s age', 'months · optional', 'e.g. 3')}<p class="av-note" style="margin:-6px 0 8px">Under 4 months a puppy needs 3.0 times its resting calories, from 4 months 2.0 times. Without the age we use 2.0.</p></div>
        <div id="fdNeuWrap">${seg('fdNeu', 'Neutered or spayed?', [['y', 'Yes'], ['n', 'No']], 'y')}</div>
        <div class="proj-sep"></div>
        ${seg('fdFT', 'Type of food', [['dry', 'Dry'], ['wet', 'Wet'], ['own', 'My own']], 'dry')}
        <div id="fdOwnWrap" style="display:none">
          ${seg('fdFU', 'Measure the food in', [['cup', 'Cups'], ['can', 'Cans'], ['kg', 'Grams']], 'cup')}
          ${tfld('fdFood', 'Calories in the food', 'kcal per cup', 'e.g. 350', 'fdFoodL')}
          <p class="av-note" style="margin:0 0 8px">It is on the bag or can, under “calorie content” or “ME”. Per kg is the most reliable; a cup on the label is a US 8 fl oz cup.</p>
        </div>
        ${seg('fdMeals', 'Meals a day', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']], '2')}
        ${seg('fdTr', 'Treats', [['0', 'None'], ['5', '5%'], ['10', '10%']], '0')}
        <div class="res-hint" id="fdHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="fdAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${csel('fdType', 'auto', 'More specific type of dog', [['auto', 'Use the choices above']].concat(E.TYPES.map((t) => [t.id, t.label])))}
          <label class="fld" for="fdName"><span class="lab">Dog’s name <span class="unit">optional</span></span><div class="inp"><input id="fdName" type="text" autocomplete="off" placeholder="e.g. Max"></div></label>
          <p class="av-note" id="fdNameNote">Shown at the top of the printout, with today’s date.</p>
          ${tfld('fdCup', 'Your cup holds', 'ml · optional', 'e.g. 150')}
          <p class="av-note" style="margin:0 0 8px">The standard US cup is 237 ml. If your scoop is smaller or larger, enter its size and the cups are counted in your scoop.</p>
          ${tfld('fdOwn', 'Your own factor', '× resting need', 'e.g. 1.5')}
          <p class="av-note" style="margin:0 0 8px">Replaces the type’s factor. 1.0–1.2 for weight loss, 1.6–1.8 for a typical adult — use what your vet gave you.</p>
          ${seg('fdBU', 'Food 2 measured in', [['cup', 'Cups'], ['can', 'Cans'], ['kg', 'Grams']], 'cup')}
          <div class="cb-two">${tfld('fdB', 'Food 2', 'kcal per cup', 'e.g. 1000', 'fdBL')}${tfld('fdShare', 'Share', '% of calories', 'e.g. 30')}</div>
          <p class="av-note" style="margin:0 0 8px">Mix kibble with wet or raw: say what share of the food calories the second food gives and you get the amount of each. Treats come off first.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="fdAdvBtn" type="button">
            <span id="fdAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab">Recommended calories a day</div>
          <div class="res-big"><span id="fdBig">—</span></div>
          <div class="res-sub" id="fdSub" data-empty="Enter your dog’s weight.">Enter your dog’s weight.</div>
        </div>
        <div id="fdBody" style="display:none">
          <p class="print-only" id="fdPrintHead"></p>
          <p class="res-tip adv-tip" id="fdTip"></p>
          <p class="bm-h">Resting need and your dog’s range</p>
          <div id="fdRule"></div>
          <p class="bm-h">Food and treats</p>
          <div id="fdSplit"></div>
          <p class="bm-h" id="fdFeedH" style="display:none">How much to feed</p>
          <table class="dtable" id="fdFeed"></table>
          <div id="fdPics"></div>
          <p class="av-note" id="fdNoFood" style="display:none">Enter your food’s calories to see the amount.</p>
          <p class="cb-note" id="fdTypNote" style="display:none"></p>
          <p class="cb-note" id="fdRaw" style="display:none"></p>
          <button class="btn" id="fdPrint" type="button" data-print="fdPrintHead|fdName|Dog food plan" style="margin-top:6px">Print / save PDF</button>
          <p class="cb-note">An estimate from weight and life stage — not veterinary advice. Weigh your dog every couple of weeks and adjust with your vet.</p>
        </div>`;

  const left = `
        <h2>How to use the dog food calculator</h2>
        <p>Enter your dog’s <strong>weight</strong> (or pick a breed for a typical adult weight), say whether it is a <strong>puppy, adult or senior</strong>, and for an adult whether it is neutered. The headline is the recommended calories a day. Then choose the <strong>type of food</strong>: dry kibble or wet (canned) uses a typical calorie value and gives the cups or cans a day and per meal; <strong>My own</strong> lets you type the calories from your bag or can for an exact amount. Pick a <strong>treat</strong> share if you give treats.</p>
        <p>Open <strong>Go advanced</strong> for a more specific type of dog (weight loss, working, pregnant…), your own cup size in ml, your own factor from your vet, or to split the calories between two foods, such as kibble and wet or raw.</p>

        <h2>How dog calories are calculated</h2>
        <div class="formula">
          Resting need (kcal) = 70 × weight in kg<sup>0.75</sup> · Daily need = resting need × factor
          <small>THE FACTOR DEPENDS ON LIFE STAGE AND ACTIVITY</small>
        </div>
        <table class="dtable"><thead><tr><th>Type of dog</th><th>Factor</th></tr></thead><tbody>${fTbl}</tbody></table>
        <p>Adults show a range where the veterinary tool gives one; the headline uses the single factor from Omnicalculator. For a 20 kg neutered dog: 70 × 20<sup>0.75</sup> = <strong>${grp(X.rer)} kcal</strong> at rest, × 1.6 = <strong>${grp(X.mer)} kcal</strong> a day.</p>`;
  const right = `
        <h2>Daily calories by weight</h2>
        <table class="dtable"><thead><tr><th>Dog’s weight</th><th>At rest</th><th>Neutered adult</th><th>Not neutered</th></tr></thead><tbody>${tbl}</tbody></table>
        <p>All figures in kcal a day (neutered 1.4–1.6 × resting, not neutered 1.6–1.8 ×). Treat them as a starting point: the same weight can mean a couch dog or a working dog.</p>

        <h2>Adjust from your dog, not the number</h2>
        <p>Both sources say the figure is an estimate. If your dog is gaining or losing weight, change the amount and check again in a couple of weeks; for puppies, recalculate as they grow. For a dog that needs to lose weight, or one with a health condition, ask your vet to set the plan. See also the <a href="/dog-age-calculator/">dog age calculator</a>.</p>
        ${SRC}`;

  const body = `<body class="p-bmr p-fd">
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
    <span class="mbar-lab" id="fdMLab">Recommended calories a day</span>
    <div class="mbar-vals"><b id="fdMVal">—</b></div>
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
<script>CalcThis.initDogFoodCalc();</script>
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
const prevSlug = 'bsa-calculator', prevMenu = 'BSA', prevName = 'BSA Calculator';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps = '/' + prevSlug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s) => s.includes("slug: '" + slug + "'") ? s : s.replace("  { file: '" + prevSlug + "/index.html', slug: '" + ps + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prevName + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <a href="' + ps + '">' + prevMenu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s) => s.includes('href="' + slug + '"') ? s : s.replace('          <li><a href="' + ps + '">' + prevName + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + slug + '"') ? s : s.replace('  "/bsa-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/bsa-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prevName + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "LifestyleApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M5 14h22l-2.5 12a3 3 0 0 1-3 2.4H10.5a3 3 0 0 1-3-2.4z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M11 9c1-2 3-3 5-3s4 1 5 3" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — daily calories for your dog by weight and life stage, then cups, grams or cans from your own food</span></li>\n');
    return h;
  });
}
