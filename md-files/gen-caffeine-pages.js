const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /caffeine-calculator/ and /caffeine-half-life-calculator/ and registers them (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.cafEngine. Run: node md-files/gen-caffeine-pages.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['CAF'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.cafEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const g = E.grp, tr1 = (x) => E.trim(x, 1);

/* ---------- worked numbers ---------- */
const COF = E.byId('coffee').mg;
const A3 = 3 * COF, A3pct = Math.round(A3 / 400 * 100), A3room = 400 - A3, A3cups = tr1(A3room / COF);
const cupsIn400 = tr1(400 / COF);
const T50 = 50, T50lo = E.HC * T50, T50hi = E.EFSA * T50, COLA = E.byId('cola').mg, ENG = E.byId('energy').mg;
const colaPct = Math.round(COLA / T50lo * 100), engPct = Math.round(ENG / T50lo * 100);
const HLt = E.HL.typ;
const dosesEx = [{ t: 8 * 60, mg: COF }, { t: 14 * 60, mg: COF }], Bex = 22 * 60 + 30;
const exLeft = Math.round(E.bodyAt(dosesEx, Bex, HLt));
const exOne = Math.round(E.bodyAt([{ t: 8 * 60, mg: COF }], Bex, HLt));
const left400 = Math.round(E.decay(400, 6, HLt));
const dec = [1, 2, 3, 4].map((k) => Math.round(COF * Math.pow(0.5, k)));
const lastBy50 = E.clock(Bex - HLt * 60, false), lastBy25 = E.clock(Bex - 2 * HLt * 60, false), lastBy12 = E.clock(Bex - 3 * HLt * 60, false);
const drinkRows = E.DRINKS.filter((d) => d.id !== 'own').map((d) => '<tr><td>' + d.name + '</td><td>' + d.size + '</td><td>' + d.mg + ' mg</td></tr>').join('');
const drinkTable = '<table class="dtable"><thead><tr><th>Drink</th><th>One serving</th><th>Caffeine</th></tr></thead><tbody>' + drinkRows + '</tbody></table>';

const SRC_COMMON = `<li>FDA, <a href="https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much" rel="noopener">Spilling the Beans: How Much Caffeine Is Too Much?</a> (read 2026-11-06; content current as of 08/28/2024): the FDA cites 400 milligrams a day, about two to three 12-fluid-ounce cups of coffee, as an amount not generally associated with negative effects for most healthy adults; people who are pregnant, trying to become pregnant or breastfeeding should ask a health care provider whether they need to limit caffeine; medical experts advise against energy drinks for children and teens.</li>
          <li>Verster JC, Koenig J, Caffeine intake and its sources: a review of national representative studies, Crit Rev Food Sci Nutr 2018;58:1250–1259 (abstract read via Europe PMC, 2026-11-06): Health Canada 2.5 mg/kg body weight a day for children and adolescents and 400 mg a day for adults; EFSA 3 mg/kg a day for children and adolescents and 400 mg a day for adults.</li>
          <li>USDA FoodData Central, SR Legacy (read through the public API, 2026-11-06), caffeine per 100 g: brewed coffee 40 mg, espresso 212 mg, instant coffee prepared with water 26 mg, black tea 20 mg, green tea 12 mg, cola 9 mg, decaffeinated brewed coffee 1 mg, dark chocolate 70–85% cacao 80 mg, energy drinks 31 mg (AMP) and 33 mg (Rockstar). The serving sizes and the energy-drink figure (the two values averaged, 32 mg per 100 g, on a 16 fl oz can) are ours; real products vary, so check the label.</li>`;
const SRC_LIMIT = `<h2>Sources</h2>
        <ul>
          ${SRC_COMMON}
        </ul>
        <p><small>For information only, not medical advice. The limits are for healthy people; ask a clinician if you have a heart condition, anxiety, trouble sleeping or take medicines.</small></p>`;
const SRC_HALF = `<h2>Sources</h2>
        <ul>
          <li>“Cardiovascular effects of coffee and caffeine”, Am J Cardiol 1984 (abstract read via Europe PMC, 2026-11-06): caffeine half-life 5.1 hours in non-smokers and 5.3 hours in non-users, against 3.2 hours in smokers and 4.1 hours in heavy caffeine users.</li>
          <li>Drake C, Roehrs T, Shambroom J, Roth T, <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3805807/" rel="noopener">Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed</a>, J Clin Sleep Med 2013;9:1195–1200 (read 2026-11-06): 400 mg of caffeine taken at bedtime, 3 hours before or 6 hours before bed each disturbed sleep compared with placebo; the authors point to the high variability of caffeine’s half-life.</li>
          <li>Caffeine clearance test in patients with liver cirrhosis, Zhonghua Yi Xue Za Zhi (Taipei) 1996 (abstract read via Europe PMC): the elimination half-life was significantly longer in the patient group than in the comparison group.</li>
          <li>Drink amounts: USDA FoodData Central (SR Legacy, public API, read 2026-11-06) gives the caffeine per 100 g of each drink; we multiply by a typical serving. Check the label for energy drinks and anything not listed.</li>
        </ul>
        <p><small>For information only, not medical advice. The curve is a simple model: it treats each drink as absorbed at once and removed at a steady half-life. Real people differ a lot.</small></p>`;

const PAGES = [
  {
    key: 'limit', slug: 'caffeine-calculator', name: 'Caffeine Calculator', menu: 'Caffeine', body: 'p-bmr p-caf', init: 'initCafLimitCalc',
    title: 'Caffeine Calculator — Daily Limit by Weight and Age',
    desc: 'Caffeine calculator: add your drinks, see the mg of caffeine against the daily limit for adults, teens and children by weight, and how much room is left.',
    h1: 'Caffeine Calculator', eyebrow: 'Drinks tally · daily limit by age and weight · cups left',
    lead: `Add the <strong>drinks</strong> you had — coffee, espresso, tea, cola, an energy drink or your own amount in mg — and see the <strong>total caffeine</strong> against the <strong>daily limit</strong> for an adult, or for a teen or child by body weight. ${A3 / COF} cups of brewed coffee is <strong>${A3} mg</strong>, ${A3pct}% of the 400 mg adult limit, with room for about ${A3cups} more.`,
    schema: 'Free caffeine calculator: add coffee, tea, cola, energy drinks or your own mg and see total caffeine against the 400 mg adult daily limit (FDA, Health Canada, EFSA) or the per-kilogram limit for teens and children, with the cups of coffee left.',
    llms: 'Free caffeine calculator: a drinks tally in mg against the 400 mg adult daily limit or the per-kg limit for teens and children, with cups of coffee left; pregnancy points to a health care provider.',
    card: 'Total the caffeine in your drinks and compare it with the daily limit for adults, or teens and children by weight.',
    faqs: [
      ['How much caffeine is too much in a day?', `For most healthy adults the FDA cites 400 milligrams a day as an amount not generally associated with negative effects, about two to three 12-fluid-ounce cups of coffee. Health Canada and EFSA give the same 400 mg for adults. On this calculator’s averages (${COF} mg per 8 fl oz cup of brewed coffee) 400 mg is ${cupsIn400} such cups.`],
      ['How much caffeine is in a cup of coffee?', `About ${COF} mg in an 8 fl oz cup of brewed coffee on the USDA average of 40 mg per 100 g, ${E.byId('espresso').mg} mg in a 1 fl oz shot of espresso, ${E.byId('instant').mg} mg in instant coffee and ${E.byId('decaf').mg} mg in decaf. Real cups vary with the beans, the brew and the size, so switch the amount to ml for any size, or type the mg from the label under “My own amount”.`],
      ['What is the caffeine limit for teens and children?', `Health Canada gives 2.5 mg per kilogram of body weight a day for children and adolescents and EFSA gives 3 mg per kg. For a ${T50} kg (110 lb) teen that is ${g(T50lo)} mg and ${g(T50hi)} mg: one 12 fl oz can of cola (${COLA} mg) is ${colaPct}% of the lower figure, and one 16 fl oz energy drink (${ENG} mg) is ${engPct}% of it. The FDA adds that medical experts advise against energy drinks for children and teens. The calculator uses the lower Health Canada number as the limit.`],
      ['Is caffeine safe during pregnancy or breastfeeding?', 'The FDA says that if you are pregnant, trying to become pregnant or breastfeeding, you should ask your health care provider whether you need to limit caffeine. This calculator still adds up your drinks if you choose the pregnant or breastfeeding option, but it shows no limit.'],
      ['How many cups of coffee is 400 mg?', `${cupsIn400} cups of brewed coffee at ${COF} mg per 8 fl oz cup. The FDA’s own comparison is about two to three 12-fluid-ounce cups, because a bigger cup holds more.`],
      ['Does decaf coffee have caffeine?', `A little. The USDA lists 1 mg per 100 g for brewed decaf, so ${E.byId('decaf').mg} mg in an 8 fl oz cup. Add it with the Decaf coffee option if you want it counted.`],
      ['How do I add a drink that is not in the list?', 'Choose “My own amount (mg)”, type the caffeine in one serving from the label and the number of servings you had. Energy drinks vary a lot by brand, so the label is more accurate than the typical value.'],
      ['How long does the caffeine stay in my body?', 'Roughly half of a dose is gone after 5 hours in a typical non-smoker, but it varies a lot from person to person. The <a href="/caffeine-half-life-calculator/">caffeine half life calculator</a> draws the curve for your drinks and shows how much is left at bedtime.']
    ],
    pills: [['/caffeine-half-life-calculator/', 'Caffeine Half Life Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'], ['/water-intake-calculator/', 'Water Intake Calculator', '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'], ['/sleep-calculator/', 'Sleep Calculator', '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'], ['/calorie-calculator/', 'Calorie Calculator', '<path d="M12 3s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/>']]
  },
  {
    key: 'half', slug: 'caffeine-half-life-calculator', name: 'Caffeine Half Life Calculator', menu: 'Caffeine Half Life', body: 'p-bmr p-chl', init: 'initCafHalfCalc',
    title: 'Caffeine Half Life Calculator — Caffeine Left at Bedtime',
    desc: 'Caffeine half life calculator: enter your drinks and times, see the caffeine left in your body at bedtime on a curve and the last time to drink coffee.',
    h1: 'Caffeine Half Life Calculator', eyebrow: 'Caffeine curve · left at bedtime · last drink by · your own half-life',
    lead: `Enter <strong>what you drank and when</strong> and see the caffeine in your body on a curve through the day, plus how much is <strong>left at bedtime</strong>. With a ${HLt}-hour half-life, a cup of brewed coffee (${COF} mg) at 8:00 am and another at 2:00 pm leave about <strong>${exLeft} mg</strong> at 10:30 pm.`,
    schema: 'Free caffeine half life calculator: enter drinks with the time you had them, pick a 5 h, smoker 3.2 h or your own half-life and see a curve of caffeine in your body, the amount left at bedtime and the last time to drink coffee so only half, a quarter or an eighth is left.',
    llms: 'Free caffeine half life calculator: drinks with times, a half-life you can change (5 h typical, 3.2 h smoker, your own), the caffeine curve, mg left at bedtime and the last drink by for half, a quarter or an eighth left.',
    card: 'See the caffeine in your body over the day from your drinks and times, and how much is left at bedtime.',
    faqs: [
      ['What is the half-life of caffeine?', 'It is the time it takes your body to remove half of the caffeine. A 1984 study found 5.1 hours in non-smokers and 5.3 hours in non-users of caffeine, against 3.2 hours in smokers and 4.1 hours in heavy caffeine users. The calculator uses 5 hours as typical, 3.2 hours for a smoker, or any value from 1 to 24 hours you enter under “My own”.'],
      ['How long does caffeine stay in your system?', `With a ${HLt}-hour half-life, a ${COF} mg cup is down to ${dec[0]} mg after 5 hours, ${dec[1]} mg after 10, ${dec[2]} mg after 15 and ${dec[3]} mg after 20 hours. A cup at 8:00 am still leaves ${exOne} mg at 10:30 pm. The calculator draws this for all your drinks added together.`],
      ['When should I stop drinking coffee before bed?', `There is no single answer. In a 2013 sleep study 400 mg of caffeine taken even 6 hours before bedtime disturbed sleep compared with placebo, and the authors note how much the half-life varies between people. The “Finish a drink by” table shows the clock time that leaves half, a quarter or an eighth of a drink at bedtime: for bedtime at 10:30 pm and a ${HLt}-hour half-life that is ${lastBy50}, ${lastBy25} and ${lastBy12}.`],
      ['How much caffeine is left after 6 hours?', `The model says half of it after one half-life, so with ${HLt} hours a 400 mg dose leaves about ${left400} mg 6 hours later (400 × 0.5 to the power of 6 ÷ ${HLt}). That is arithmetic on a typical half-life, not a measurement of you.`],
      ['Does smoking change how fast I clear caffeine?', 'In the 1984 study smokers had a half-life of 3.2 hours against 5.1 in non-smokers. Choose “Smoker” to use 3.2 hours, or enter your own.'],
      ['What can make caffeine stay longer?', 'Half-lives differ a lot between people, as the sleep study’s authors note. In one study of patients with liver cirrhosis the half-life was significantly longer than in the comparison group. If you know yours or a clinician has told you it is longer, enter it under “My own”.'],
      ['How accurate is the curve?', 'It is a simple model: each drink is treated as absorbed all at once at the time you enter, and the amount then halves every half-life. That slightly overstates the first hour and ignores everything that makes people different, so treat it as a guide. Your own half-life is the biggest unknown.'],
      ['How much caffeine is in my drinks?', 'The drinks are USDA averages per serving (a cup of brewed coffee is about 95 mg), or type the mg from the label. The <a href="/caffeine-calculator/">caffeine calculator</a> adds up a whole day against the daily limit.']
    ],
    pills: [['/caffeine-calculator/', 'Caffeine Calculator', '<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8zM17 9h2a2 2 0 0 1 0 4h-2"/>'], ['/sleep-calculator/', 'Sleep Calculator', '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'], ['/water-intake-calculator/', 'Water Intake Calculator', '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'], ['/intermittent-fasting-calculator/', 'Intermittent Fasting Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>']]
  }
];

const tfld = (id, label, unit, ph, mode) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'decimal'}" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const seg = (id, label, opts, on, rowId) => `<div class="ctl-row"${rowId ? ' id="' + rowId + '"' : ''}><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map((o) => `<button${String(o[0]) === String(on) ? ' class="on"' : ''} type="button" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
const GHOST = '<span class="g-off">-</span><span class="g-off">-</span><span class="g-sep">:</span><span class="g-off">-</span><span class="g-off">-</span>';
const tfield = (id, inId, label, ap) => `<div class="fld ch-tf" id="${id}" data-ap="${ap}"><span class="lab">${label}</span><div class="time-field"><div class="time-box"><div class="time-ghost" aria-hidden="true">${GHOST}</div><input id="${inId}" class="time-digits" type="text" inputmode="numeric" autocomplete="off" maxlength="5" aria-label="${label}"></div><div class="seg ap-seg"><button type="button" data-ap="am">AM</button><button type="button" data-ap="pm">PM</button></div></div></div>`;
const csel = (id, val, label, opts) => `<label class="fld"><span class="lab">${label}</span><div class="csel" id="${id}" data-value="${val}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${opts.filter((o) => String(o[0]) === String(val))[0][1]}</span>${chev}</button><div class="csel-panel" role="listbox">${opts.map((o) => `<button type="button" class="csel-opt${String(o[0]) === String(val) ? ' on' : ''}" role="option" aria-selected="${String(o[0]) === String(val)}" data-value="${o[0]}">${o[1]}</button>`).join('')}</div></div></label>`;
const plus = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const addRow = (p) => `<div class="add-row split" style="margin-top:10px"><button class="btn" id="${p}Add" type="button">${plus} Add drink</button><button class="linkbtn" id="${p}Clear" type="button">Clear all</button></div>`;

function build(P) {
  if (P.title.length > 60) throw new Error('title too long ' + P.title.length + ' ' + P.title);
  if (P.desc.length > 158) throw new Error('desc too long ' + P.desc.length);
  const url = 'https://calcthis.co/' + P.slug + '/', L = P.key === 'limit';
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
  const hint = (id) => `<div class="res-hint" id="${id}" style="display:none;text-align:left;margin:4px 0 8px"></div>`;

  let input, result, left, right, mb;
  if (L) {
    input = `
        <h2 class="card-h2">Your drinks</h2>
        ${csel('cfWho', 'a', 'Who is it for', [['a', 'Healthy adult'], ['t', 'Teen or child'], ['p', 'Pregnant, trying to become pregnant or breastfeeding']])}
        <div id="cfRows" class="cf-rows one"></div>
        ${hint('cfHint')}
        ${addRow('cf')}
        <div class="proj-sep"></div>
        ${seg('cfWu', 'Weight unit', [['lb', 'lb'], ['kg', 'kg']], 'lb')}
        <label class="fld" for="cfW"><span class="lab">Body weight <span class="unit"><span id="cfWUnit">lb</span> · <span id="cfWOpt">optional</span></span></span><div class="inp"><input id="cfW" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 150"></div></label>
        <div id="cfAdvIn" style="display:none">
          ${tfld('cfLim', 'Daily limit I use', 'mg · optional', 'e.g. 300')}
          <p class="av-note" style="margin:0 0 8px">Replaces the default limit if your clinician gave you a different one.</p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="cfAdvBtn" type="button">
            <span id="cfAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
    result = `
        <div class="bf-res">
          <div class="res-lab">Caffeine in your drinks</div>
          <div class="res-big"><span id="cfBig">—</span></div>
          <div class="res-sub" id="cfSub" data-empty="Add a drink and how much you had.">Add a drink and how much you had.</div>
        </div>
        <div id="cfBody" style="display:none">
          <p class="res-tip adv-tip" id="cfTip"></p>
          <div id="cfBar"></div>
          <p class="bm-h">Drink by drink</p>
          <table class="dtable" id="cfTable"></table>
          <p class="cb-note" id="cfKg" style="display:none"></p>
          <p class="bm-h">Daily limits</p>
          <table class="dtable" id="cfLimits"></table>
          <p class="cb-note">An estimate for healthy people, not medical advice. Caffeine in real drinks varies with the brand, the brew and the size.</p>
        </div>`;
    mb = '<span class="mbar-lab" id="cfMLab">Caffeine today</span>\n    <div class="mbar-vals"><b id="cfMVal">—</b></div>';
    left = `
        <h2>How to use the caffeine calculator</h2>
        <p>Choose <strong>who it is for</strong>, pick a <strong>drink</strong> and type <strong>how much you had</strong>, in cups or in ml. Press <strong>Add drink</strong> for each more. The total, the share of the daily limit and the cups of coffee left update as you type. For a teen or child add the <strong>body weight</strong>, because their limit is per kilogram.</p>
        <p>Open <strong>Go advanced</strong> if your clinician gave you a different daily limit.</p>

        <h2>Caffeine in common drinks</h2>
        ${drinkTable}
        <p>Averages from the USDA database; your cup may differ. Switch the amount to ml for any size, or use “My own amount” with the mg on the label.</p>`;
    right = `
        <h2>Daily caffeine limits</h2>
        <p><strong>Healthy adults:</strong> the FDA cites 400 mg a day, about two to three 12-fluid-ounce cups of coffee; Health Canada and EFSA also give 400 mg. At ${COF} mg per 8 fl oz cup that is ${cupsIn400} cups.</p>
        <p><strong>Teens and children:</strong> 2.5 mg per kg of body weight a day (Health Canada) or 3 mg per kg (EFSA): at ${T50} kg that is ${g(T50lo)} mg or ${g(T50hi)} mg. The FDA advises against energy drinks for children and teens.</p>
        <p><strong>Pregnant, trying to become pregnant or breastfeeding:</strong> ask your health care provider; the FDA gives no single number.</p>

        <h2>A worked example</h2>
        <p>Three 8 fl oz cups of brewed coffee: 3 × ${COF} = ${A3} mg, ${A3pct}% of 400 mg, which leaves ${A3room} mg, about ${A3cups} more cups. For timing, see the <a href="/caffeine-half-life-calculator/">caffeine half life calculator</a>.</p>
        ${SRC_LIMIT}`;
  } else {
    input = `
        <h2 class="card-h2">Your drinks</h2>
        ${seg('chClk', 'Clock', [['12', '12-hour'], ['24', '24-hour']], '12')}
        <div id="chRows" class="cf-rows one"></div>
        ${hint('chHint')}
        ${addRow('ch')}
        <div class="proj-sep"></div>
        ${tfield('chBed', 'chBedIn', 'Your bedtime · optional', 'pm')}
        ${csel('chHLs', 'typ', 'Half-life', [['typ', 'Typical adult — 5 hours'], ['smoke', 'Smoker — 3.2 hours'], ['fast', 'Fast metabolizer — about 3 hours'], ['slow', 'Slow metabolizer — about 8 hours'], ['preg', 'Pregnant — about 11.5 hours'], ['own', 'My own']])}
        <div id="chHLWrap" style="display:none">${tfld('chHLc', 'Half-life', 'hours', 'e.g. 6')}</div>
        <div id="chAdvIn" style="display:none">
          ${tfld('chTar', 'Most caffeine I am comfortable with at bedtime', 'mg · optional', 'e.g. 25')}
          <p class="av-note" style="margin:0 0 8px">Adds the clock time to finish your last drink by so that no more than this is left from it at bedtime.</p>
          <div class="ctl-row"><span class="ctl-lab">Weight unit</span><div class="seg" id="chWu" role="group" aria-label="Weight unit"><button class="on" type="button" data-v="lb">lb</button><button type="button" data-v="kg">kg</button></div></div>
          <label class="fld" for="chW"><span class="lab">Body weight <span class="unit"><span id="chWUnit">lb</span> · optional</span></span><div class="inp"><input id="chW" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 150"></div></label>
          <p class="av-note" id="chWNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="chAdvBtn" type="button">
            <span id="chAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
    result = `
        <div class="bf-res">
          <div class="res-lab" id="chLab">Caffeine in your body</div>
          <div class="res-big"><span id="chBig">—</span></div>
          <div class="res-sub" id="chSub" data-empty="Add a drink, how much you had today and the last time you had it.">Add a drink, how much you had today and the last time you had it.</div>
        </div>
        <div id="chBody" style="display:none">
          <p class="res-tip adv-tip" id="chTip"></p>
          <p class="bm-h">Caffeine in your body through the day</p>
          <div class="cf-curve" id="chCurve"></div>
          <p class="bm-h">How fast your last drink fades</p>
          <table class="dtable" id="chDecay"></table>
          <div id="chByWrap" style="display:none">
            <p class="bm-h">Finish a drink by</p>
            <table class="dtable" id="chBy"></table>
          </div>
          <p class="cb-note">A simple model, not medical advice: each drink is treated as absorbed at once, then the amount halves every half-life. Real people differ a lot.</p>
        </div>`;
    mb = '<span class="mbar-lab" id="chMLab">Caffeine left</span>\n    <div class="mbar-vals"><b id="chMVal">—</b></div>';
    left = `
        <h2>How to use the caffeine half life calculator</h2>
        <p>Pick a <strong>drink</strong>, type <strong>how much you had today</strong> (cups or ml) and the <strong>last time you had it</strong>; press <strong>Add drink</strong> for each more. Add your <strong>bedtime</strong> to see how much is still in your body then. Choose a <strong>half-life</strong>: typical (5 hours), smoker (3.2 hours) or your own.</p>
        <p>Open <strong>Go advanced</strong> to set the most caffeine you are comfortable with at bedtime and get the clock time to stop by.</p>

        <h2>The formula</h2>
        <div class="formula">
          amount left = dose × 0.5 ^ (hours since the drink ÷ half-life)
          <small>EACH DRINK IS HALVED EVERY HALF-LIFE; THE DRINKS ADD UP</small>
        </div>
        <p>With a ${HLt}-hour half-life: ${COF} mg at 8:00 am is ${exOne} mg at 10:30 pm; add a second cup at 2:00 pm and the total at 10:30 pm is ${exLeft} mg.</p>

        <h2>Which drinks?</h2>
        <p>Each drink in the list carries a typical caffeine amount per serving, and “My own amount” takes the mg from a label. The full list with serving sizes is on the <a href="/caffeine-calculator/">caffeine calculator</a>.</p>`;
    right = `
        <h2>How long caffeine lasts</h2>
        <p>Half-life is the time to remove half. A 1984 study measured 5.1 hours in non-smokers, 5.3 in non-users, 4.1 in heavy users and 3.2 in smokers. After one half-life half is left, after two a quarter, after three an eighth: a ${COF} mg cup leaves ${dec[0]}, ${dec[1]}, ${dec[2]} and ${dec[3]} mg after 5, 10, 15 and 20 hours at ${HLt} hours.</p>

        <h2>Caffeine and sleep</h2>
        <p>In a 2013 study 400 mg of caffeine taken at bedtime, 3 hours before or 6 hours before bed each disturbed sleep compared with placebo. The curve marks the 6-hour point before your bedtime. With a ${HLt}-hour half-life 400 mg six hours before bed would leave about ${left400} mg at bedtime — model arithmetic, not a safe line: half-lives vary a lot.</p>
        <p>For the whole-day total against the daily limit, see the <a href="/caffeine-calculator/">caffeine calculator</a>.</p>
        ${SRC_HALF}`;
  }

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
    ${mb}
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
<script>CalcThis.${P.init}();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log(P.slug, 'written; title', P.title.length, 'desc', P.desc.length);
}

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s2 = fs.readFileSync(fl, 'utf8'); const crlf = s2.includes('\r\n'); s2 = s2.replace(/\r\n/g, '\n'); const o = s2; s2 = fn(s2); if (s2 !== o) { fs.writeFileSync(fl, crlf ? s2.replace(/\n/g, '\r\n') : s2); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
let prev = { slug: 'max-heart-rate-calculator', menu: 'Max Heart Rate', name: 'Max Heart Rate Calculator', llms: 'Max Heart Rate Calculator by Age' };
PAGES.forEach((P) => {
  build(P);
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace("  { file: '" + prev.slug + "/index.html', slug: '" + ps2 + "' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms.replace(/[()]/g, '\\$&') + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M6 11h17v8a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7v-8z" stroke="#37503F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 13h2a3 3 0 0 1 0 6h-2" stroke="#37503F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="14.5" cy="6" r="2" fill="#B5761F"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — ' + (P.key === 'limit' ? 'total the caffeine in your drinks against the daily limit for adults, teens and children by weight' : 'the caffeine in your body through the day from your drinks and times, and what is left at bedtime') + '</span></li>\n');
    return h;
  });
  prev = { slug: P.slug, menu: P.menu, name: P.name, llms: P.title.split(' — ')[0] };
});
