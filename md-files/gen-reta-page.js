const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /retatrutide-dosage-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials in the "Medication & Lab" group after Dilution, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.retaEngine. Run: node md-files/gen-reta-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['RETA'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.retaEngine;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const f = (x) => E.fmt(x, 'a');

/* ---------- worked numbers, all from the engine ---------- */
const V = 10, W = 2, C = V / W, D1 = 1, dr1 = E.draw(D1, C), W1 = 1, C1 = V / W1, dr2 = E.draw(D1, C1), perVial = Math.floor(V / D1 + 1e-9);
const pl = E.plan([{ doseMg: 1, weeks: 2 }, { doseMg: 2, weeks: 2 }], 1, V), s2 = E.draw(2, C);
const wantU = 25, wNeed = E.waterFor(V, D1, wantU);
const tblWater = '<table class="dtable"><thead><tr><th>Water added</th><th>Strength</th><th>Draw for ' + f(D1) + ' mg</th></tr></thead><tbody>' + E.WATERS.map((w) => { const c = V / w, d = E.draw(D1, c); return '<tr><td>' + f(w) + ' mL</td><td>' + f(c) + ' mg per mL</td><td>' + f(d.units) + ' units (' + f(d.ml) + ' mL)</td></tr>'; }).join('') + '</tbody></table>';
const tblUnits = '<table class="dtable"><thead><tr><th>Units</th><th>Volume</th><th>Peptide at ' + f(C) + ' mg per mL</th></tr></thead><tbody>' + E.UREF.map((u) => '<tr><td>' + u + '</td><td>' + f(u / 100) + ' mL</td><td>' + f(u / 100 * C) + ' mg</td></tr>').join('') + '</tbody></table>';
const tblSyr = '<table class="dtable"><thead><tr><th>Syringe</th><th>Holds</th><th>Units marked</th></tr></thead><tbody>' + E.SIZES.map((b) => '<tr><td>' + f(b) + ' mL</td><td>' + f(b) + ' mL</td><td>0 to ' + Math.round(b * 100) + '</td></tr>').join('') + '</tbody></table>';

const SRC = `<h2>Sources</h2>
        <ul>
          <li>Retatrutide’s status: Eli Lilly and Company, press release of May 21, 2026 (investor.lilly.com, read 2026-11-22), which calls it “an investigational, first-in-class GIP, GLP-1, and glucagon triple hormone receptor agonist”. Because it is investigational there is no approved product label to take a strength or a dose from, so this page never gives one.</li>
          <li>The arithmetic (strength = vial ÷ water, volume = dose ÷ strength, a syringe with 100 units to the millilitre) is the same on every peptide calculator opened on 2026-11-22: Omnicalculator, calculate.co.nz, thepeptidecatalog, peptideprotocolwiki, peptidedeck and glp3planner. It is plain unit arithmetic and does not depend on the medicine.</li>
          <li>The feature set was compared with those calculators, all opened live on 2026-11-22. Their titration ladders, “documented protocols” and half-life charts are not copied: they state doses, and this page states none.</li>
        </ul>
        <p><small>For information only, not medical advice. This page does arithmetic with the numbers you type. It does not say what to take, how much or how often. Check every number with your prescriber or pharmacist.</small></p>`;

const P = {
  slug: 'retatrutide-dosage-calculator', name: 'Retatrutide Dosage Calculator', menu: 'Retatrutide Dosage', body: 'p-bmr p-rt',
  title: 'Retatrutide Dosage Calculator: Syringe Units & Vials',
  desc: 'Retatrutide dosage calculator: type your vial, water and your own steps to see syringe units, weeks per vial and vials needed. Arithmetic only, no doses.',
  h1: 'Retatrutide Dosage Calculator', eyebrow: 'Vial · water · syringe units · your own schedule · vials needed',
  lead: `Type the <strong>peptide in your vial</strong>, the <strong>water you add</strong> and <strong>the dose you were given</strong>, and see the <strong>syringe units</strong> on a syringe drawn to scale. For ${f(V)} mg in ${f(W)} mL of water (${f(C)} mg per mL), a ${f(D1)} mg dose is <strong>${f(dr1.units)} units</strong>. Add your own steps and weeks to see the units for each step and how many vials the whole plan needs. This page only does arithmetic: it never suggests a dose, and retatrutide is an investigational medicine, so take every dose from your prescriber.`,
  schema: 'Free retatrutide dosage calculator: syringe units from the vial size, the water added and a dose you type, the water to add for a wanted draw, a ready-made liquid mode, your own multi-step schedule with units per step, weeks per vial and vials needed, a syringe drawn to scale and a timeline of your schedule against the vials. Arithmetic only, no recommended doses.',
  llms: 'Free retatrutide dosage calculator: syringe units from vial, water and your dose; water to add; your own steps with vials needed; syringe drawn to scale. Arithmetic only, no doses.',
  card: 'Syringe units from the vial, the water and the dose you type, with your own steps and vials needed. Arithmetic only.',
  faqs: [
    ['How do I calculate retatrutide syringe units?', 'Divide the peptide in the vial by the water you added to get the strength, divide your dose by the strength to get the volume, and multiply the volume in mL by 100 for units on a syringe with 100 units to the millilitre. For ' + f(V) + ' mg in ' + f(W) + ' mL (' + f(C) + ' mg per mL), ' + f(D1) + ' mg is ' + f(dr1.ml) + ' mL, which is ' + f(dr1.units) + ' units.'],
    ['How much water should I add to the vial?', 'This page does not choose that for you. The water changes the strength but not the amount of peptide: ' + f(V) + ' mg in 1 mL gives ' + f(dr2.units) + ' units for ' + f(D1) + ' mg, in ' + f(W) + ' mL ' + f(dr1.units) + ' units. Use “Water to add” to find the water that gives the draw you want, or the table of other water volumes to compare.'],
    ['Does this calculator tell me what dose to take?', 'No. It never suggests a dose, a schedule or a strength. You type the doses you were given by your prescriber or pharmacy, and it does the arithmetic.'],
    ['Is retatrutide approved?', 'Eli Lilly describes retatrutide as investigational (press release of May 21, 2026). There is no approved product label to read a strength or a dose from, so check every number with a prescriber or pharmacist. This page is arithmetic, not medical advice.'],
    ['How many vials does my schedule need?', 'Choose Powder vial, type the vial size and the water, then type each step as a dose and a number of weeks. The page opens a new vial when the rest cannot cover the next injection and lists the vials needed and what is left. For example (only to show the arithmetic): ' + f(1) + ' mg for 2 weeks then ' + f(2) + ' mg for 2 weeks at 1 a week uses ' + f(pl.mg) + ' mg, so ' + pl.vials.length + ' vial of ' + f(V) + ' mg with ' + f(pl.vials[0].left) + ' mg left.'],
    ['Why does it warn about whole units?', 'Syringes are marked in whole units, so a draw such as ' + f(E.draw(1, 3).units) + ' units cannot be measured exactly. The warning shows the closest whole unit and the dose it really gives, so you can see the difference before you choose the water.'],
    ['What is the difference between mg and mcg?', '1 mg is 1,000 mcg. A mix-up is a thousandfold error, so the page shows every dose in both: ' + f(D1) + ' mg = ' + f(D1 / E.MASS.mcg) + ' mcg.'],
    ['What if I have a ready-made liquid and not a powder vial?', 'Choose “Ready liquid” and type the strength exactly as printed, for example 5 mg in 1 mL. There is no water step; the page gives the units for each dose and, if you type the liquid in the whole container, how many doses and containers your schedule needs.'],
    ['Which syringe sizes does it handle?', 'A 1 mL, 0.5 mL or 0.3 mL syringe, all marked 100 units to the millilitre, so they hold 100, 50 and 30 units. If a dose does not fit the syringe you chose, the page says so and shows the water that would make it fit.']
  ],
  pills: [['/peptide-reconstitution-calculator/', 'Peptide Reconstitution Calculator', '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>'], ['/mg-to-ml-calculator/', 'mg to mL Calculator', '<path d="M10 5h12M12 5v8l-5 10a3 3 0 0 0 3 4h12a3 3 0 0 0 3-4l-5-10V5"/>'], ['/dilution-calculator/', 'Dilution Calculator', '<path d="M7 3h10l-1 18H8L7 3zM7 9h10"/>'], ['/volume-converter/', 'Volume Converter', '<path d="M6 21h12l-2-12H8L6 21zM9 9a3 3 0 1 1 6 0"/>']]
};

const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const box = (label, unitTxt, id, ph, uid, u, btns) => `<div class="fld"><span class="lab">${label}${unitTxt ? ' <span class="unit">' + unitTxt + '</span>' : ''}</span><div class="cf-box"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" aria-label="${label}">${uid ? `<div class="seg cf-u" id="${uid}" data-u="${u}" role="group" aria-label="${label} unit">${btns.map((b) => `<button type="button" data-v="${b[0]}"${b[0] === u ? ' class="on"' : ''}>${b[1]}</button>`).join('')}</div>` : ''}</div></div>`;
const ms = (id, label, opts, on) => '<div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">' + label + '</span><div class="modeseg" id="' + id + '" role="group" aria-label="' + label + '">' + opts.map((o) => '<button' + (o[0] === on ? ' class="on"' : '') + ' type="button" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div></div>';
const note = (id) => `<p class="cb-note" id="${id}"></p>`;
const chips = (id, label, unit, arr, suffix) => `<div class="fld"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="chips" id="${id}" role="group" aria-label="${label}">${arr.map((c) => `<button type="button" data-v="${c}">${c}${suffix || ''}</button>`).join('')}</div></div>`;
const stepRow = (n) => `<div class="rt-step" id="rtR${n}"${n === 1 ? '' : ' style="display:none"'}>
          <p class="rt-steph"><span>Step ${n}</span>${n === 1 ? '' : `<button class="rt-x" id="rtX${n}" type="button" aria-label="Remove step ${n}">Remove</button>`}</p>
          <div class="two"><div class="fld"><span class="lab">Dose per injection</span><div class="cf-box"><input id="rtD${n}" type="text" inputmode="decimal" autocomplete="off" placeholder="${n === 1 ? 'e.g. 1' : 'e.g. 2'}" aria-label="Dose per injection, step ${n}"></div></div><div class="fld"><span class="lab">Weeks <span class="unit">optional</span></span><div class="cf-box"><input id="rtW${n}" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 2" aria-label="Weeks, step ${n}"></div></div></div>
          ${note('rtRN' + n)}
        </div>`;

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
        <div class="sl-head"><h2 class="card-h2">Your vial and doses</h2><button class="linkbtn" id="rtClear" type="button">Clear fields</button></div>
        ${ms('rtForm', 'How do you have it?', [['vial', 'Powder vial'], ['liquid', 'Ready liquid']], 'vial')}
        <div id="rtVialW">
          ${box('Peptide in the vial', 'printed on the vial', 'rtVial', 'e.g. 10', 'rtVu', 'mg', [['mcg', 'mcg'], ['mg', 'mg'], ['iu', 'IU']])}
          <div id="rtIpmW" style="display:none"><div class="fld"><span class="lab">IU in 1 mg <span class="unit">printed on the label</span></span><div class="cf-box"><input id="rtIpm" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 3" aria-label="IU per mg"></div></div>${note('rtIpmN')}</div>
          ${note('rtVialN')}
          ${chips('rtVChips', 'Quick vial sizes', 'mg', E.VCHIPS, '')}
          <div id="rtFindW">${ms('rtFind', 'What do you want to find?', [['units', 'Syringe units'], ['water', 'Water to add']], 'units')}</div>
          <div id="rtWaterF">
            <div class="fld"><span class="lab">Water you add <span class="unit">mL</span></span><div class="cf-box"><input id="rtWater" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 2" aria-label="Water added in mL"></div></div>
            ${note('rtWaterN')}
            ${chips('rtWChips', 'Quick water', 'mL', E.WCHIPS, '')}
          </div>
          <div id="rtWantW" style="display:none">
            <div class="fld"><span class="lab">Units you want to draw <span class="unit">for the dose in step 1</span></span><div class="cf-box"><input id="rtWant" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 25" aria-label="Units to draw"></div></div>
            ${note('rtWantN')}
          </div>
        </div>
        <div id="rtLiqW" style="display:none">
          ${box('Strength on the label', 'the amount printed', 'rtLA', 'e.g. 5', 'rtLu', 'mg', [['mcg', 'mcg'], ['mg', 'mg']])}
          <div class="fld"><span class="lab">…in how many mL <span class="unit">leave empty for 1 mL</span></span><div class="cf-box"><input id="rtLP" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 1" aria-label="Volume on the label in mL"></div></div>
          ${note('rtLN')}
          <div class="fld"><span class="lab">Liquid in the whole container <span class="unit">mL · optional</span></span><div class="cf-box"><input id="rtLTot" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 3" aria-label="Liquid in the whole container in mL"></div></div>
          ${note('rtLTotN')}
        </div>
        <div class="proj-sep"></div>
        <p class="bm-h">Your doses</p>
        ${ms('rtDu', 'Dose unit', [['mcg', 'mcg'], ['mg', 'mg']], 'mg')}
        <div class="fld"><span class="lab">Injections a week <span class="unit">leave empty for 1</span></span><div class="cf-box"><input id="rtFreq" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 1" aria-label="Injections a week"></div></div>
        ${note('rtFreqN')}
        <div class="chips" id="rtFChips" role="group" aria-label="Common injections a week">${E.FCHIPS.map((c) => `<button type="button" data-v="${c}">${c} a week</button>`).join('')}</div>
        ${[1, 2, 3, 4, 5, 6].map(stepRow).join('\n        ')}
        <button class="linkbtn" id="rtAdd" type="button" style="margin:4px 0 12px">+ Add another step</button>
        ${ms('rtSyrSz', 'Syringe size', [['1', '1 mL'], ['0.5', '0.5 mL'], ['0.3', '0.3 mL']], '1')}
        <p class="cb-note">All three are marked in units: 100 units = 1 mL, so they hold 100, 50 and 30 units.</p>
        <div class="res-hint" id="rtHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="rtAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${ms('rtDec', 'Decimal places', [['a', 'Auto'], ['1', '1'], ['2', '2'], ['3', '3']], 'a')}
          <p class="bm-h">Dose from body weight <span class="unit" style="font-weight:400">optional</span></p>
          <div class="fld"><span class="lab">Dose per kg of body weight <span class="unit">mg per kg</span></span><div class="cf-box"><input id="rtKg" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 0.05" aria-label="Dose in mg per kg of body weight"></div></div>
          ${box('Body weight', '', 'rtWt', 'e.g. 80', 'rtWu', 'kg', [['kg', 'kg'], ['lb', 'lb']])}
          ${note('rtKgN')}
          <button class="linkbtn" id="rtKgUse" type="button" style="display:none;margin-bottom:8px"></button>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="rtAdvBtn" type="button">
            <span id="rtAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="rtLab">Syringe units for your dose</div>
          <div class="res-big"><span id="rtBig">—</span></div>
          <div class="res-sub" id="rtSub" data-empty="Type the vial, the water and the dose you were given to see the syringe units.">Type the vial, the water and the dose you were given to see the syringe units.</div>
        </div>
        <div id="rtBody" style="display:none">
          <p class="res-tip adv-tip" id="rtTip"></p>
          <div id="rtWarn" style="display:none"></div>
          <div id="rtSyrWrap">
            <p class="bm-h">On a syringe</p>
            <div class="rt-syr" id="rtSyr"></div>
            <p class="rt-cap" id="rtSyrCap"></p>
          </div>
          <div id="rtTlWrap" style="display:none">
            <p class="bm-h">Your schedule and your vials</p>
            <div class="rt-tl" id="rtTl"></div>
            <p class="rt-cap" id="rtTlCap"></p>
            <table class="dtable" id="rtTot"></table>
          </div>
          <div id="rtSchedWrap" style="display:none">
            <p class="bm-h">Your steps</p>
            <table class="dtable" id="rtSched"></table>
            <p class="cb-note" id="rtSchedKey"></p>
          </div>
          <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="rtCopyTxt" style="margin-left:8px">Copy result</button></p>
          <table class="dtable" id="rtNums"></table>
          <div id="rtCopyTxt" style="display:none"></div>
          <div id="rtWTabWrap" style="display:none">
            <p class="bm-h">The same dose with other water</p>
            <table class="dtable" id="rtWTab"></table>
            <p class="cb-note">Click a row to use that water.</p>
          </div>
          <p class="bm-h">Units on the syringe</p>
          <table class="dtable" id="rtUTab"></table>
          <p class="cb-note">For information only, not medical advice. This only does arithmetic with the numbers you type. It never suggests a dose. Check every number with your prescriber or pharmacist.</p>
        </div>`;
  const left = `
        <h2>How to use the retatrutide dosage calculator</h2>
        <p>Choose <strong>Powder vial</strong> and type the peptide printed on the vial, then the water you add: the <strong>strength</strong> and the <strong>syringe units</strong> for the dose appear at once, on a syringe drawn to scale. Have a ready-made liquid instead? Choose <strong>Ready liquid</strong> and type the strength exactly as the label prints it.</p>
        <p>Type the <strong>dose you were given</strong>. To see a whole plan, add <strong>steps</strong>: each is a dose and a number of weeks, with the injections a week. You get the units for every step, a timeline against your vials, the vials needed and what is left. Pick <strong>Water to add</strong> to work backwards from the units you want to draw.</p>
        <h2>The formulas</h2>
        <div class="formula">
          units = dose ÷ (vial ÷ water) × 100
          <small>STRENGTH = VIAL ÷ WATER · VOLUME = DOSE ÷ STRENGTH · UNITS = mL × 100</small>
        </div>
        <p>Worked out with this calculator: a ${f(V)} mg vial with ${f(W)} mL of water is ${f(C)} mg per mL. A ${f(D1)} mg dose is ${f(D1)} ÷ ${f(C)} = ${f(dr1.ml)} mL, which is ${f(dr1.units)} units. The vial holds ${perVial} doses of ${f(D1)} mg. With only ${f(W1)} mL of water the strength doubles to ${f(C1)} mg per mL and the same dose is ${f(dr2.units)} units. To draw ${f(wantU)} units for ${f(D1)} mg, add ${f(wNeed)} mL of water to the ${f(V)} mg vial.</p>
        <h2>The same dose with other water</h2>
        <p>The amount of water changes the strength, not the amount of peptide in the vial:</p>
        ${tblWater}
        <h2>Your own schedule: the arithmetic</h2>
        <p>Only to show how the steps add up (these are not suggested doses): at ${f(C)} mg per mL, ${f(1)} mg is ${f(dr1.units)} units and ${f(2)} mg is ${f(s2.units)} units. ${f(1)} mg for 2 weeks and then ${f(2)} mg for 2 weeks at 1 injection a week is ${pl.inj} injections and ${f(pl.mg)} mg, which fits in ${pl.vials.length} vial of ${f(V)} mg with ${f(pl.vials[0].left)} mg left. When the rest of a vial cannot cover the next dose, a new vial is opened and the leftover is not used.</p>`;
  const right = `
        <h2>Units, mL and mg</h2>
        <p>A syringe marked 100 units to the millilitre has 1 unit = 0.01 mL. The mg a unit holds depends on the strength, so the same 10 units are a different dose at a different strength:</p>
        ${tblUnits}
        <h2>Syringe sizes</h2>
        ${tblSyr}
        <h2>What the calculator does not do</h2>
        <p>It does not say what to take, how much or how often, and it does not read a label for you. Retatrutide is an investigational medicine, so there is no approved product label here to take a strength or a dose from. Use the numbers from your prescriber or pharmacy, and let a pharmacist check the strength, the water and the units. Titration ladders, “protocols” and half-life charts found on other pages state doses, so this page leaves them out.</p>
        <h2>Whole units and syringe size</h2>
        <p>If the draw is not a whole number of units, the page shows the closest whole unit and the dose it really gives. If a dose needs more than the syringe holds, it says so and shows how much water would make it fit.</p>
        <h2>Related tools</h2>
        <p>For milligrams to milliliters from a printed label use the <a href="/mg-to-ml-calculator/">mg to mL calculator</a>; for vial size, water and syringe units for any peptide the <a href="/peptide-reconstitution-calculator/">peptide reconstitution calculator</a>; for making a weaker solution the <a href="/dilution-calculator/">dilution calculator</a>; and for other volume units the <a href="/volume-converter/">volume converter</a>.</p>
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
    <span class="mbar-lab" id="rtMLab">Draw</span>
    <div class="mbar-vals"><b id="rtMVal">—</b></div>
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

    <h2 id="rtFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initRetaCalc();</script>
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
const prev = { slug: 'dilution-calculator', menu: 'Dilution', name: 'Dilution Calculator', llms: 'Dilution Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("  \\{ file: '" + prev.slug + "/index\\.html',\\s+slug: '" + ps2.replace(/\//g, '\\/') + "' \\},\\n"), (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms.replace(/ /g, '[ ]') + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="13" width="18" height="6" rx="2" stroke="#37503F" stroke-width="2.2"/>
          <path d="M24 16h5M6 16H3M13 13v6M17 13v6" stroke="#37503F" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 16h6" stroke="#D99A33" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      const anchor = '    <a class="calc" href="/peptide-reconstitution-calculator/">';
      h = h.replace(anchor, () => card + anchor);
    }
    const li = '<a href="' + slug + '">' + P.name + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a><span> — syringe units from the vial, the water and a dose you type, with your own steps and the vials they need; arithmetic only, no doses</span></li>\n');
    return h;
  });
}
