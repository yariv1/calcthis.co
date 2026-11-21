const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /mg-to-ml-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials with the new "Medication & Dosage" group, homepage tab + card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.mgmlEngine. Run: node md-files/gen-mgml-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['MGML'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.mgmlEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const f = (x) => E.fmt(x, 'a');

/* ---------- worked numbers ---------- */
const DT = [1, 2.5, 5, 10, 50, 500], ST = [1, 5, 10, 20, 50];
const tblAt = '<div class="mm-wide"><table class="dtable"><thead><tr><th>Dose</th>' + ST.map((s) => '<th>' + s + '</th>').join('') + '</tr></thead><tbody>' + DT.map((d) => '<tr><td>' + f(d) + ' mg</td>' + ST.map((s) => '<td>' + f(d / s) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
const labRows = [];
E.MEDS.forEach((g) => g.items.forEach((it) => labRows.push('<tr><td>' + it[1] + '</td><td>' + f(it[2]) + ' mg per ' + f(it[3]) + ' mL</td><td>' + f(it[2] / it[3]) + ' mg per mL</td></tr>')));
const tblLab = '<table class="dtable"><thead><tr><th>Product</th><th>Label</th><th>Strength</th></tr></thead><tbody>' + labRows.join('') + '</tbody></table>';
const LQ = (id) => E.fillOf(id).a;
const liqRows = [['water', 'Water'], ['milk', 'Whole milk'], ['olive', 'Olive oil'], ['canola', 'Canola oil'], ['honey', 'Honey']].map((r) => '<tr><td>' + r[1] + '</td><td>' + f(LQ(r[0])) + ' mg per mL</td><td>' + f(1000 / LQ(r[0])) + ' mL per 1,000 mg</td></tr>').join('');
const tblLiq = '<table class="dtable"><thead><tr><th>Liquid</th><th>Density</th><th>1,000 mg is</th></tr></thead><tbody>' + liqRows + '</tbody></table>';
const mass = '<table class="dtable"><thead><tr><th>Unit</th><th>In mg</th><th>In mcg</th></tr></thead><tbody><tr><td>1 g</td><td>1,000 mg</td><td>1,000,000 mcg</td></tr><tr><td>1 mg</td><td>1 mg</td><td>1,000 mcg</td></tr><tr><td>1 mcg</td><td>0.001 mg</td><td>1 mcg</td></tr></tbody></table>';
const three = '<table class="dtable"><thead><tr><th>You know</th><th>You want</th><th>Formula</th><th>Example</th></tr></thead><tbody><tr><td>Dose and strength</td><td>Volume</td><td>mL = mg ÷ mg per mL</td><td>500 mg ÷ 250 mg per mL = ' + f(500 / 250) + ' mL</td></tr><tr><td>Volume and strength</td><td>Dose</td><td>mg = mL × mg per mL</td><td>5 mL × 100 mg per mL = ' + f(5 * 100) + ' mg</td></tr><tr><td>Dose and volume</td><td>Strength</td><td>mg per mL = mg ÷ mL</td><td>200 mg ÷ 10 mL = ' + f(200 / 10) + ' mg per mL</td></tr></tbody></table>';
const ibu = 100 / 5, amx = 250 / 5;

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Label strengths: DailyMed (US National Library of Medicine), the labels read on 2026-11-21: children’s acetaminophen oral suspension, 160 mg in each 5 mL (American Health Packaging, updated 21 October 2024); Children’s Motrin ibuprofen suspension, 100 mg in each 5 mL; infants’ ibuprofen drops, 50 mg in each 1.25 mL; diphenhydramine oral solution, 12.5 mg per 5 mL; children’s cetirizine, 5 mg in each 5 mL; amoxicillin for oral suspension, 125 mg and 250 mg in each 5 mL, the same label also names a 400 mg per 5 mL suspension, and 200 mg per 5 mL (A-S Medication Solutions label, updated 30 October 2026); azithromycin for oral suspension, 100 mg and 200 mg per 5 mL; cefdinir for oral suspension, 125 mg and 250 mg per 5 mL; cephalexin for oral suspension, 125 mg and 250 mg per 5 mL; testosterone cypionate injection, 100 mg and 200 mg per mL. Brands and strengths change, so always use the label on your own bottle.</li>
          <li>Teaspoons, tablespoons and spoons: MedlinePlus, Liquid medication administration (review date 1 October 2025, read 2026-11-21): 1 mL = 1 cc, 2.5 mL = 1/2 teaspoon, 5 mL = 1 teaspoon, 15 mL = 1 tablespoon; a flatware teaspoon can hold anywhere from 2.5 mL to 10 mL; check that the units on the cup or syringe match the units of the dose. The US customary teaspoon in NIST Special Publication 811, Appendix B.8 is 4.928922 mL; medicine labels use 5 mL.</li>
          <li>Volume units: NIST Special Publication 811, Appendix B.8 (read 2026-11-12 and 2026-11-21): US fluid ounce 29.57353 mL, US cup 236.5882 mL, imperial gallon 4.54609 L. The UK fluid ounce here, 28.4130625 mL, is 4.54609 L divided by 160, the number of imperial fluid ounces in a gallon; the 160 is not on the NIST page.</li>
          <li>Density of liquids: water is roughly 1 gram per milliliter (USGS Water Science School, Water Density, read 2026-11-21), so 1,000 mg per mL. Whole milk (244 g per US cup), olive oil (216 g), canola oil (218 g) and honey (339 g) come from the USDA FoodData Central cup weights (SR Legacy, read 2026-11-21), divided by 236.5882 mL. The cooking ingredients in the picker use the typical grams per US cup of our <a href="/recipe-converter/">recipe converter</a>, which can differ by about 5% with how you scoop.</li>
          <li>Not on this page: any recommended dose, how much to give a child or an adult, and strengths I could not read on a label. Ask a pharmacist or the prescriber how much to take.</li>
        </ul>
        <p><small>For information only, not medical advice. This calculator does arithmetic with the numbers you type. It cannot know whether a dose is right for a person. Check the strength on your own label and ask a pharmacist before giving any medicine, especially to a child.</small></p>`;

const P = {
  slug: 'mg-to-ml-calculator', name: 'mg to mL Calculator', menu: 'mg to mL', body: 'p-bmr p-mm',
  title: 'mg to mL Calculator — Convert a Dose to Milliliters',
  desc: 'mg to mL calculator: enter the dose and the strength on the label, get milliliters on a to-scale syringe. Also mL to mg, mg per mL, tsp, tbsp and mcg.',
  h1: 'mg to mL Calculator', eyebrow: 'mg to mL · mL to mg · strength per mL · to-scale syringe',
  lead: `Type the <strong>dose in mg</strong> and the <strong>strength on the label</strong> (for example <strong>250 mg in 5 mL</strong>) and see the <strong>milliliters</strong> to measure, drawn on a <strong>syringe to scale</strong>, with teaspoons, tablespoons and fluid ounces. Convert <strong>mL to mg</strong> or find a strength too. A milligram is weight and a milliliter is volume, so the strength (mg per mL) is what links them.`,
  schema: 'Free mg to mL calculator: convert a dose in mg, mcg or g to milliliters with the strength on the label (mg per mL or mg per 5 mL), mL to mg, and the strength from a dose and a volume. Shows a to-scale syringe, teaspoons, tablespoons, fluid ounces, label presets read on DailyMed and densities for water and common liquids.',
  llms: 'Free mg to mL calculator: dose and label strength to milliliters, mL to mg, find the strength, to-scale syringe drawing, teaspoons and tablespoons, label presets from DailyMed, water and cooking densities.',
  card: 'Dose in mg and the strength on the label to milliliters, on a to-scale syringe. Also mL to mg and the strength from a dose and a volume.',
  faqs: [
    ['How do I convert mg to mL?', `Divide the dose in mg by the strength in mg per mL. mg are weight and mL are volume, so you need the strength of the liquid. 50 mg at ${f(20)} mg per mL is ${f(50 / 20)} mL. For water, 1 mL weighs about 1,000 mg, so 1,000 mg is about 1 mL.`],
    ['How many mL is 10 mg?', `It depends on the strength. 10 mg is ${f(10 / 1)} mL at 1 mg per mL, ${f(10 / 5)} mL at 5 mg per mL, ${f(10 / 10)} mL at 10 mg per mL, ${f(10 / 20)} mL at 20 mg per mL, ${f(10 / 50)} mL at 50 mg per mL and ${f(10 / 100)} mL at 100 mg per mL. For water it is ${f(10 / 1000)} mL.`],
    ['How many mL is 2.5 mg?', `${f(2.5 / 1)} mL at 1 mg per mL, ${f(2.5 / 5)} mL at 5 mg per mL, ${f(2.5 / 10)} mL at 10 mg per mL, ${f(2.5 / 20)} mL at 20 mg per mL and ${f(2.5 / 50)} mL at 50 mg per mL. Type your own strength in the calculator to see it on a syringe.`],
    ['How many mL is 50 mg?', `${f(50 / 10)} mL at 10 mg per mL, ${f(50 / 20)} mL at 20 mg per mL, ${f(50 / 50)} mL at 50 mg per mL, ${f(50 / 100)} mL at 100 mg per mL and ${f(50 / 250)} mL at 250 mg per mL. A 50 mg dose of children’s ibuprofen at ${f(ibu)} mg per mL (100 mg in 5 mL) is ${f(50 / ibu)} mL.`],
    ['How many mL is 500 mg?', `${f(500 / 100)} mL at 100 mg per mL, ${f(500 / 250)} mL at 250 mg per mL, ${f(500 / amx)} mL at ${f(amx)} mg per mL (250 mg in 5 mL) and ${f(500 / 1000)} mL for water. At 1 mg per mL it would be ${f(500)} mL, which shows why the strength matters.`],
    ['How do I read a label such as 250 mg/5 mL?', `It means every 5 mL holds 250 mg, so the strength is 250 ÷ 5 = ${f(250 / 5)} mg per mL. Type 250 in the amount box and 5 in the liquid box, or pick the label from the list. Leave the liquid box empty when the label says “per mL”.`],
    ['How do I convert mcg to mL?', `Divide mcg by 1,000 to get mg, then divide by the strength. 500 mcg is 0.5 mg, which is ${f(0.5 / 1)} mL at 1 mg per mL. The calculator takes mcg, mg or g in the dose box and shows all three.`],
    ['How many mL is a teaspoon or tablespoon of medicine?', 'Medicine labels use 1 teaspoon = 5 mL and 1 tablespoon = 15 mL (MedlinePlus). A flatware teaspoon can hold anywhere from 2.5 mL to 10 mL, so use the syringe or cup that came with the medicine.'],
    ['Does this calculator tell me how much medicine to take?', 'No. It does the arithmetic with the numbers you type and never suggests a dose. Take the dose from your label or prescriber and ask a pharmacist if anything is unclear.']
  ],
  pills: [['/peptide-reconstitution-calculator/', 'Peptide Reconstitution Calculator', '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>'], ['/volume-converter/', 'Volume Converter', '<path d="M7 3h10l-1 18H8L7 3zM7 9h10"/>'], ['/weight-converter/', 'Weight Converter', '<path d="M6 21h12l-2-12H8L6 21zM9 9a3 3 0 1 1 6 0"/>'], ['/cooking-converter/', 'Cooking Converter', '<path d="M5 13h14l-1 7H6l-1-7zM4 13h16M9 8c0-2 2-2 2-4"/>']]
};

const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const box = (label, unitTxt, id, ph, uid, u, btns) => `<div class="fld"><span class="lab">${label}${unitTxt ? ' <span class="unit">' + unitTxt + '</span>' : ''}</span><div class="cf-box"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" aria-label="${label}"><div class="seg cf-u" id="${uid}" data-u="${u}" role="group" aria-label="${label} unit">${btns.map((b) => `<button type="button"${b[0] === u ? ' class="on"' : ''} data-v="${b[0]}">${b[1]}</button>`).join('')}</div></div></div>`;
const ms = (id, label, opts, on) => '<div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">' + label + '</span><div class="modeseg" id="' + id + '" role="group" aria-label="' + label + '">' + opts.map((o) => '<button' + (o[0] === on ? ' class="on"' : '') + ' type="button" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div></div>';
const cselShell = (id, label, val, txt) => `<div class="csel" id="${id}" data-value="${val}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${txt}</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const syrOpts = '<button type="button" class="csel-opt on" role="option" aria-selected="true" data-value="a">Auto</button>' + E.SIZES.map((s) => `<button type="button" class="csel-opt" role="option" aria-selected="false" data-value="${s}">${s} mL</button>`).join('');

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
        <div class="sl-head"><h2 class="card-h2">Your dose</h2><button class="linkbtn" id="mmClear" type="button">Clear fields</button></div>
        ${ms('mmMode', 'What do you want to find?', [['mgml', 'mg to mL'], ['mlmg', 'mL to mg'], ['strength', 'Strength']], 'mgml')}
        <div id="mmDoseF">${box('Dose', 'the amount of medicine', 'mmDose', 'e.g. 50', 'mmDu', 'mg', [['mcg', 'mcg'], ['mg', 'mg'], ['g', 'g']])}
        <p class="cb-note" id="mmDoseN"></p></div>
        <div id="mmVolF" style="display:none"><div class="two"><div class="fld"><span class="lab" id="mmVolLab">Volume the dose is in</span><div class="cf-box"><input id="mmVol" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 2.5" aria-label="Volume"></div></div><div class="fld"><span class="lab">Volume unit</span>${cselShell('mmVu', 'Volume unit', 'ml', 'mL')}</div></div>
        <p class="cb-note" id="mmVolN"></p></div>
        <div class="res-hint" id="mmHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="mmStrWrap">
          <div class="proj-sep"></div>
          <p class="bm-h">Strength on the label</p>
          ${box('Amount of medicine on the label', '', 'mmSa', 'e.g. 250', 'mmSu', 'mg', [['mcg', 'mcg'], ['mg', 'mg'], ['g', 'g']])}
          ${box('In this much liquid', 'empty = 1', 'mmSp', 'e.g. 5', 'mmSpu', 'ml', [['ml', 'mL'], ['l', 'L']])}
          <p class="cb-note" id="mmSn"></p>
          <div class="fld"><span class="lab">Quick strengths <span class="unit">mg per mL</span></span><div class="chips" id="mmChips">${E.CHIPS.map((c) => `<button type="button" data-v="${c}">${c} mg/mL</button>`).join('')}</div></div>
          <div class="fld"><span class="lab">Or pick a label or liquid</span><div class="st-ta"><div class="inp"><input id="mmPreIn" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="mmPreList" aria-label="Label or liquid" placeholder="Type a medicine or a liquid, e.g. amoxicillin"><input id="mmPre" type="hidden" value=""></div><div class="st-ta-list" id="mmPreList" role="listbox" style="display:none"></div></div></div>
        </div>
        <div id="mmAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="bm-h">Advanced</p>
          <div class="fld" id="mmRuF"><span class="lab">Show the volume in</span>${cselShell('mmRu', 'Show the volume in', 'ml', 'mL')}</div>
          ${ms('mmDec', 'Decimal places', [['a', 'Auto'], ['2', '2'], ['3', '3'], ['4', '4']], 'a')}
          <div class="fld"><span class="lab">Syringe size in the drawing</span><div class="csel" id="mmSyrSz" data-value="a" aria-label="Syringe size"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">Auto</span>${chev}</button><div class="csel-panel" role="listbox">${syrOpts}</div></div></div>
          <div class="fld"><span class="lab">Marks on your syringe are every <span class="unit">mL</span></span><div class="inp"><input id="mmMark" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 0.1" aria-label="Gap between marks in mL"></div></div>
          <p class="cb-note" id="mmMarkN"></p>
          <div class="fld"><span class="lab">Bottle size <span class="unit">mL</span></span><div class="inp"><input id="mmBot" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 100" aria-label="Bottle size in mL"></div></div>
          <p class="cb-note" id="mmBotN"></p>
          <div class="fld"><span class="lab">Doses a day</span><div class="inp"><input id="mmDpd" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 2" aria-label="Doses a day"></div></div>
          <p class="cb-note" id="mmDpdN"></p>
          <div class="proj-sep"></div>
          <p class="bm-h">Dose from body weight</p>
          <div class="fld"><span class="lab">Dose per kg of body weight <span class="unit">mg per kg</span></span><div class="inp"><input id="mmKg" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 10" aria-label="Dose in mg per kg of body weight"></div></div>
          ${box('Body weight', '', 'mmWt', 'e.g. 20', 'mmWu', 'kg', [['kg', 'kg'], ['lb', 'lb']])}
          <p class="cb-note" id="mmKgN"></p>
          <button class="linkbtn" id="mmKgUse" type="button" style="display:none;margin-bottom:8px"></button>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="mmAdvBtn" type="button">
            <span id="mmAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="mmLab">Volume to measure</div>
          <div class="res-big"><span id="mmBig">—</span></div>
          <div class="res-sub" id="mmSub" data-empty="Enter the dose and the strength from the label.">Enter the dose and the strength from the label.</div>
        </div>
        <div id="mmBody" style="display:none">
          <p class="res-tip adv-tip" id="mmTip"></p>
          <div id="mmWarn" style="display:none"></div>
          <div id="mmSyrWrap">
            <p class="bm-h">On a syringe</p>
            <div class="mm-syr" id="mmSyr"></div>
            <p class="mm-cap" id="mmSyrCap"></p>
          </div>
          <p class="bm-h">What is in the bottle</p>
          <div id="mmRule"></div>
          <p class="mm-cap" id="mmRuleCap"></p>
          <div class="mm-tools"><button class="linkbtn" id="mmSave" type="button">Save to my list</button><button class="linkbtn" type="button" data-copy="mmCopyTxt">Copy result</button></div>
          <div id="mmCopyTxt" style="display:none"></div>
          <div id="mmListWrap" style="display:none"><p class="bm-h">My list <button class="linkbtn" id="mmListClear" type="button" style="margin-left:8px">Clear list</button></p><div id="mmList"></div><p class="cb-note">Kept on this page only. It is gone when you reload.</p></div>
          <div id="mmTabWrap"><p class="bm-h" id="mmTabH"></p><table class="dtable" id="mmTab"></table><p class="cb-note">Click a row to use it.</p></div>
          <p class="bm-h">The same volume in every unit</p>
          <table class="dtable" id="mmUnits"></table>
          <p class="bm-h">The same medicine in every unit</p>
          <table class="dtable" id="mmMass"></table>
          <p class="bm-h">The same strength written other ways</p>
          <table class="dtable" id="mmStrU"></table>
          <p class="cb-note">For information only, not medical advice. This only does arithmetic with the numbers you type. Check the strength on your own label and ask a pharmacist before giving any medicine.</p>
        </div>`;
  const left = `
        <h2>How to use the mg to mL calculator</h2>
        <p>Pick what you want to find: <strong>mg to mL</strong> (the usual one), <strong>mL to mg</strong>, or the <strong>strength</strong> from a dose and a volume.</p>
        <p>Type the <strong>dose</strong> and choose mcg, mg or g. Then type the <strong>strength on the label</strong> the way it is printed: for “250 mg per 5 mL” enter <strong>250</strong> in the first box and <strong>5</strong> in the second. If the label says “per mL”, leave the second box empty. You can also pick a label from the list (read on DailyMed) or a liquid such as water or milk.</p>
        <p>The result shows the volume to measure on a syringe drawn to scale, in teaspoons and tablespoons, and in every other unit. Under <strong>Go advanced</strong> you can set the decimal places, the syringe size and the gap between marks on your syringe, and see how many doses a bottle holds. If your prescription gives a dose per kg of body weight, work out the dose in mg there and use it with one click.</p>

        <h2>The mg to mL formula</h2>
        <div class="formula">
          mL = mg ÷ (mg per mL)
          <small>MILLIGRAMS ARE WEIGHT, MILLILITERS ARE VOLUME: THE STRENGTH LINKS THEM</small>
        </div>
        ${three}
        <p>Without the strength there is no single answer: 1,000 mg of water is about 1 mL, but 1,000 mg of honey is ${f(1000 / LQ('honey'))} mL and 1,000 mg of a 250 mg per mL medicine is ${f(1000 / 250)} mL.</p>

        <h2>How to read a medicine label</h2>
        <p>Liquid medicines print the strength as “mg in a volume”. “250 mg/5 mL” means every 5 mL holds 250 mg, so the strength is 250 ÷ 5 = <strong>${f(250 / 5)} mg per mL</strong>. “100 mg/5 mL” is ${f(100 / 5)} mg per mL and “50 mg/1.25 mL” is ${f(50 / 1.25)} mg per mL. The calculator does the division for you and shows the result as mg per mL, per 5 mL, per teaspoon and as a percentage.</p>
        <p>Two products of the same medicine can have different strengths, so a dose that is ${f(50 / ibu)} mL of one bottle can be a different volume of another. Always use the strength printed on the bottle in your hand.</p>
        <h2>mg, mcg and g</h2>
        ${mass}
        <p>Mixing up mg and mcg is a factor of 1,000. The calculator shows what you typed in all three units under the dose box.</p>`;
  const right = `
        <h2>mg to mL at common strengths</h2>
        <p>Arithmetic only, not doses. The columns are the strength in mg per mL and each cell is the volume in mL. Use the calculator above for your own strength:</p>
        ${tblAt}
        <h2>Label strengths read on DailyMed</h2>
        ${tblLab}
        <p>These are the strengths printed on the labels listed in the sources. Antibiotic liquids start as a powder and are mixed with water as the label says; the strength is for the mixed liquid.</p>

        <h2>Teaspoons, tablespoons and syringes</h2>
        <p>On medicine labels, <strong>5 mL is 1 teaspoon</strong>, <strong>2.5 mL is half a teaspoon</strong> and <strong>15 mL is 1 tablespoon</strong> (MedlinePlus). A spoon from the kitchen drawer can hold anywhere from 2.5 mL to 10 mL, so use the oral syringe or cup that came with the medicine. Check that the units on it (teaspoon, tablespoon or mL) match the units of the dose, and watch the decimal point: 0.5 mL is not 5 mL. The syringe drawing on this page is schematic and to scale for the size it shows; the marks on your own syringe are what count.</p>

        <h2>Water and everyday liquids</h2>
        <p>Water is about 1 gram per mL, so 1 mL weighs about 1,000 mg. Other liquids are heavier or lighter, which changes the answer:</p>
        ${tblLiq}
        <p>For cooking, the <a href="/cooking-converter/">cooking converter</a> and the <a href="/recipe-converter/">recipe converter</a> do the same job for cups and grams. For peptide vials, use the <a href="/peptide-reconstitution-calculator/">peptide reconstitution calculator</a>.</p>
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
    <span class="mbar-lab" id="mmMLab">Volume to measure</span>
    <div class="mbar-vals"><b id="mmMVal">—</b></div>
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
<script>CalcThis.initMgMlCalc();</script>
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
const pepSlug = '/peptide-reconstitution-calculator/';
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(/  \{ file: 'amortization-calculator\/index\.html',\s+slug: '\/amortization-calculator\/' \},\n/, (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[Amortization Calculator[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "/amortization-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/amortization-calculator/": {'));
  /* header: new group "Medication & Dosage" (after Cooking & Kitchen); the peptide link moves into it */
  edit('partials/header.html', (s2) => {
    if (s2.includes('href="' + slug + '"')) return s2;
    s2 = s2.replace('          <a href="' + pepSlug + '">Peptide Reconstitution</a>\n', '');
    return s2.replace('          <a href="/turkey-size-calculator/">Turkey Size</a>\n', (mm) => mm + '          <span class="menu-col-head">Medication &amp; Lab</span>\n          <a href="' + slug + '">' + P.menu + '</a>\n          <a href="' + pepSlug + '">Peptide Reconstitution</a>\n');
  });
  /* footer: new pillar after Cooking & Kitchen */
  edit('partials/footer.html', (s2) => {
    if (s2.includes('href="' + slug + '"')) return s2;
    s2 = s2.replace('          <li><a href="' + pepSlug + '">Peptide Reconstitution Calculator</a></li>\n', '');
    const col = '<div class="footer-col" style="order:5">\n        <button class="footer-col-btn" aria-expanded="false" type="button">\n          <span class="fttl"><span class="ft1">Medication &amp;</span> <span class="ft2">Lab</span></span>\n          <svg class="footer-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>\n        </button>\n        <ul class="footer-links">\n          <li><a href="' + slug + '">' + P.name + '</a></li>\n          <li><a href="' + pepSlug + '">Peptide Reconstitution Calculator</a></li>\n        </ul>\n      </div>\n\n';
    return s2.replace('<div class="footer-col" style="order:6">', () => col + '<div class="footer-col" style="order:6">');
  });
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "Amortization Calculator"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    const cardOf = (href, ico, name, desc) => `    <a class="calc" href="${href}">
      <span class="ico" aria-hidden="true">
${ico}
      </span>
      <h3>${name}</h3>
      <p>${desc}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>
`;
    const ico = '        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">\n          <rect x="9" y="12" width="14" height="6" rx="2" stroke="#37503F" stroke-width="2.2"/>\n          <path d="M23 15h5M9 15H5l-2 0" stroke="#37503F" stroke-width="2.2" stroke-linecap="round"/>\n          <path d="M13 12v6M17 12v6" stroke="#B5761F" stroke-width="2" stroke-linecap="round"/>\n        </svg>';
    /* move the peptide card out of Health into the new group */
    const pm = h.match(/    <a class="calc" href="\/peptide-reconstitution-calculator\/">[\s\S]*?    <\/a>\n/);
    let pepCard = pm ? pm[0] : '';
    if (pepCard && !h.includes('id="grp-medication"')) h = h.replace(pepCard, '');
    if (!h.includes('id="grp-medication"')) {
      const sec = '  <section id="grp-medication" class="cat-grp cat-grp--hidden" aria-label="Medication &amp; Lab calculators">\n  <div class="cards">\n\n' + cardOf(slug, ico, P.name, P.card) + '\n' + pepCard + '\n  </div>\n  </section>\n\n';
      h = h.replace('  <section id="grp-academic"', () => sec + '  <section id="grp-academic"');
      h = h.replace('    <button class="cat-tab" type="button" data-cat="academic"', () => '    <button class="cat-tab" type="button" data-cat="medication" role="tab" aria-selected="false">Medication &amp;<br>Lab</button>\n    <button class="cat-tab" type="button" data-cat="academic"');
      h = h.replace("health:document.getElementById('grp-health'),", () => "health:document.getElementById('grp-health'),medication:document.getElementById('grp-medication'),");
    }
    const li = '<a href="' + slug + '">' + P.name + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="/amortization-calculator/">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a><span> — dose in mg and the strength on the label to milliliters on a to-scale syringe, mL to mg and the strength from a dose and a volume</span></li>\n');
    return h;
  });
}
