const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /dilution-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials in the "Medication & Lab" group, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.dilutionEngine (fmt). Run: node md-files/gen-dilution-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['DILUTION'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.dilutionEngine;
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
const RT = [1, 2, 3, 4, 5, 9, 10, 19, 20, 49, 50, 99, 100];
const tblRatio = '<div class="dl-wide"><table class="dtable"><thead><tr><th>Ratio</th><th>Concentrate</th><th>Water</th><th>Strength left</th></tr></thead><tbody>' + RT.map((r) => '<tr><td>1 : ' + r + '</td><td>' + f(1000 / (1 + r)) + ' mL</td><td>' + f(1000 * r / (1 + r)) + ' mL</td><td>' + f(100 / (1 + r)) + ' %</td></tr>').join('') + '</tbody></table></div>';
const meaning = '<table class="dtable"><thead><tr><th>Written as</th><th>Parts</th><th>Factor</th></tr></thead><tbody><tr><td>1 : 3</td><td>1 part concentrate + 3 parts water = 4 parts</td><td>4× weaker</td></tr><tr><td>1 in 4</td><td>1 part concentrate in 4 parts, so 3 parts water</td><td>4× weaker</td></tr><tr><td>4×</td><td>1 part concentrate + 3 parts water</td><td>4× weaker</td></tr><tr><td>1 : 10</td><td>1 part concentrate + 10 parts water = 11 parts</td><td>' + f(11) + '× weaker</td></tr></tbody></table>';
const formulas = '<table class="dtable"><thead><tr><th>You want</th><th>Formula</th></tr></thead><tbody><tr><td>Concentrate to use</td><td>V1 = C2 × V2 ÷ C1</td></tr><tr><td>Water to add</td><td>V2 − V1</td></tr><tr><td>Dilution factor</td><td>C1 ÷ C2 = V2 ÷ V1</td></tr><tr><td>Ratio 1 : X</td><td>X = factor − 1</td></tr></tbody></table>';
const ex1 = { vc: 1000 / 10, vw: 1000 - 100 }, ex2 = { vc: 50 / 100, vw: 50 - 0.5 }, ex3 = { vc: 500 / 11, vw: 500 * 10 / 11 }, ex4 = { vc: 500 * 0.4 / 2.0 }, ex5 = { vc: 2000 / (99 / 70), vw: 2000 - 2000 / (99 / 70) };

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The rule behind the calculator: LibreTexts, Chemistry, 13.7 Solution Dilution (last modified 18 February 2026, read 2026-11-21): adding water changes the volume and the concentration but the number of moles of solute does not change, so M1 V1 = M2 V2. Its worked example (100 mL of 2.0 M HCl made up to 500 mL gives 0.40 M) is reproduced above.</li>
          <li>ppm and mg/L: Yale, Water Knowledge for All, Units for Pollutant Concentrations (read 2026-11-21): since 1 L of fresh water has a mass of 1 kg, 1 mg/L is 1 mg/kg, also called 1 part per million. This holds for dilute water-like liquids only. In this calculator % means grams per 100 mL, so 1 % = 10 g/L = 10,000 mg/L = 10,000 ppm.</li>
          <li>Mixing order: University of Illinois Division of Research Safety, Mineral Acids (read 2026-11-21): always dilute by adding acid to water and not water to acid; adding water to concentrated acid may cause violent boiling and splashing. The CDC page Cleaning and Disinfecting with Bleach (read 2026-11-21): never mix household bleach with any other cleaners or disinfectants, and bleach solutions will not be as effective after being mixed with water for over 24 hours.</li>
          <li>Volume units: NIST Special Publication 811, Appendix B.8 (read 2026-11-12 and 2026-11-21): US cup 236.5882 mL, US fluid ounce 29.57353 mL, US teaspoon 4.928922 mL, US tablespoon 14.78676 mL, US gallon 3.785412 L, imperial gallon 4.54609 L. The UK fluid ounce (4.54609 L ÷ 160), pint (÷ 8) are derived from the imperial gallon; the 160 and 8 are not on the NIST page.</li>
          <li>Not handled: percent by weight (w/w) with different densities, solutes that react, precipitate or evaporate, and liquids that do not mix ideally (ethanol and water shrink a little when mixed). Ask the supplier or the safety data sheet for those.</li>
        </ul>
        <p><small>For information only. Strong acids, bases, bleach and other chemicals can burn or give off harmful fumes: follow the label and the safety data sheet, wear goggles and gloves, and never mix cleaners.</small></p>`;

const P = {
  slug: 'dilution-calculator', name: 'Dilution Calculator', menu: 'Dilution', body: 'p-bmr p-dl',
  title: 'Dilution Calculator — C1V1, Ratio and Factor',
  desc: 'Dilution calculator: concentrate and water for any strength, ratio (1:10) or factor, in mL, cups or gallons, with a flask drawn to scale.',
  h1: 'Dilution Calculator', eyebrow: 'C1V1 = C2V2 · dilution ratio · dilution factor · flask drawn to scale',
  lead: `Type the <strong>strength you have</strong> and the <strong>strength you need</strong> (or a ratio like <strong>1:10</strong>) and how much you want to make. You get the <strong>concentrate and the water</strong> to mix, a <strong>flask drawn to scale</strong>, the order to mix in and the same batch at other strengths. Works in %, ppm, mg/mL, molar and “10×” units, and in mL, cups or gallons.`,
  schema: 'Free dilution calculator: concentrate and water for a target strength (C1V1 = C2V2), a dilution ratio (1:10, 1 in 10, 10x) or the strength you made from the volumes you used. Percent, ppm, mg/mL, molar and fold units, 13 volume units, a flask drawn to scale, the mixing order and one batch at many strengths.',
  llms: 'Free dilution calculator: C1V1 = C2V2, dilution ratio and factor, concentrate and water amounts in mL, cups or gallons, percent, ppm, molar and fold units, a flask drawn to scale, mixing order and a table of the same batch at other strengths.',
  card: 'Concentrate and water for any strength, ratio or factor, with a flask drawn to scale, the mixing order and the same batch at other strengths.',
  faqs: [
    ['How do you calculate a dilution?', `Use C1 × V1 = C2 × V2: the amount of solute stays the same when you add water. The concentrate you need is V1 = C2 × V2 ÷ C1, and the water is V2 − V1. To make 500 mL at 0.40 M from a 2.0 M stock you need ${f(ex4.vc)} mL of stock and ${f(500 - ex4.vc)} mL of water.`],
    ['What does a 1:10 dilution mean?', `1:10 means 1 part concentrate and 10 parts water, 11 parts in all, so the strength is ${f(100 / 11)}% of the concentrate. “1 in 10” or “10×” means 1 part in 10 parts in all, so 9 parts water. The calculator reads both and writes out which one you typed.`],
    ['How much concentrate do I need for 1 litre at 1:10?', `For 1 L at a 1:10 ratio: ${f(1000 / 11)} mL of concentrate and ${f(10000 / 11)} mL of water. For 1 in 10 (10×) it is ${f(100)} mL of concentrate and ${f(900)} mL of water.`],
    ['How do I dilute 10% to 1%?', `The factor is 10 ÷ 1 = 10. For 1 L you need ${f(ex1.vc)} mL of the 10% concentrate and ${f(ex1.vw)} mL of water. For other sizes scale both amounts.`],
    ['How do I dilute a stock in mM to µM?', `Type the stock in mM and the target in µM; the calculator converts the units. Diluting 10 mM to 100 µM is a factor of 100, so for 50 mL you need ${f(ex2.vc)} mL of stock and ${f(ex2.vw)} mL of diluent.`],
    ['Can I dilute to a stronger solution?', 'No. Adding water can only make a liquid weaker, so the target must be below the strength you have. The calculator says so if you type a stronger target.'],
    ['Does this work for alcohol or percent by weight?', `It works when the amounts of concentrate and water simply add up. Alcohol and water shrink a little when mixed, and a percent by weight needs the densities. For example, 2 L at 70% from 99% needs about ${f(ex5.vc)} mL of the 99% and ${f(ex5.vw)} mL of water if the volumes add up exactly; check the label or the safety data sheet for the real figure.`],
    ['Which goes in first, the water or the concentrate?', 'Add the concentrate to the water, slowly and stirring. University safety guidance for acids is to always add acid to water and not water to acid, because water added to a concentrate can boil violently and splash. Never mix bleach with other cleaners, and use a bleach solution within 24 hours (CDC).'],
    ['How do I convert ppm to percent?', 'For water-like liquids 1 ppm is 1 mg/L, and 1 % (g per 100 mL) is 10 g/L, so 1 % = 10,000 ppm and 100 ppm = 0.01 %. You can type the stock in one unit and the target in another of the same kind and the calculator converts.']
  ],
  pills: [['/mg-to-ml-calculator/', 'mg to mL Calculator', '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>'], ['/peptide-reconstitution-calculator/', 'Peptide Reconstitution Calculator', '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>'], ['/volume-converter/', 'Volume Converter', '<path d="M7 3h10l-1 18H8L7 3zM7 9h10"/>'], ['/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19M7 8a1.5 1.5 0 1 0 0-.01M17 17a1.5 1.5 0 1 0 0-.01"/>']]
};

const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const ms = (id, label, opts, on) => '<div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">' + label + '</span><div class="modeseg" id="' + id + '" role="group" aria-label="' + label + '">' + opts.map((o) => '<button' + (o[0] === on ? ' class="on"' : '') + ' type="button" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div></div>';
const cselShell = (id, label, val, txt, opts) => `<div class="csel" id="${id}" data-value="${val}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${txt}</span>${chev}</button><div class="csel-panel" role="listbox">${opts || ''}</div></div>`;
const cbox = (id, ph, label) => `<div class="cf-box"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" aria-label="${label}"></div>`;
const pair = (label, id, ph, uid, uLabel, uTxt, uVal, unitLab) => `<div class="two"><div class="fld"><span class="lab">${label}</span>${cbox(id, ph, label.replace(/<[^>]+>/g, ''))}</div><div class="fld"><span class="lab">${unitLab || 'Unit'}</span>${cselShell(uid, uLabel, uVal, uTxt)}</div></div>`;
const vkOpts = [['final', 'Final volume'], ['conc', 'Concentrate volume'], ['water', 'Water volume']].map((o, i) => `<button type="button" class="csel-opt${i === 0 ? ' on' : ''}" role="option" aria-selected="${i === 0}" data-value="${o[0]}">${o[1]}</button>`).join('');

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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const input = `
        <div class="sl-head"><h2 class="card-h2">Your dilution</h2><button class="linkbtn" id="dlClear" type="button">Clear fields</button></div>
        ${ms('dlHow', 'How is the dilution given?', [['str', 'Strengths'], ['rat', 'Ratio'], ['vol', 'Volumes']], 'str')}
        ${pair('<span id="dlC1Lab">Strength you have</span>', 'dlC1', 'e.g. 10', 'dlU1', 'Unit of the strength you have', '% (w/v)', 'pct')}
        <p class="cb-note" id="dlC1N"></p>
        <div id="dlStrB">${pair('Strength you need', 'dlC2', 'e.g. 1', 'dlU2', 'Unit of the strength you need', '% (w/v)', 'pct')}
        <p class="cb-note" id="dlC2N"></p></div>
        <div id="dlRatB" style="display:none"><div class="fld"><span class="lab">Dilution</span><div class="cf-box"><input id="dlRat" type="text" inputmode="text" autocomplete="off" placeholder="e.g. 1:10 or 1 in 10 or 10x" aria-label="Dilution"><div class="seg cf-u" id="dlRs" data-u="r" role="group" aria-label="A plain number means"><button type="button" class="on" data-v="r">1 : X</button><button type="button" data-v="f">X ×</button></div></div></div>
        <p class="cb-note" id="dlRatN"></p></div>
        <div class="res-hint" id="dlHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div class="proj-sep"></div>
        <div id="dlVolB"><div class="fld"><span class="lab">The volume I know</span>${cselShell('dlVk', 'The volume I know', 'final', 'Final volume', vkOpts)}</div>
        ${pair('Amount', 'dlV', 'e.g. 1000', 'dlVu', 'Volume unit', 'mL', 'ml', 'Volume unit')}
        <p class="cb-note" id="dlVN"></p></div>
        <div id="dlVolsB" style="display:none">${pair('Concentrate I used', 'dlVc', 'e.g. 100', 'dlVcu', 'Concentrate unit', 'mL', 'ml', 'Volume unit')}
        <p class="cb-note" id="dlVcN"></p>
        ${pair('Water I added', 'dlVw', 'e.g. 900', 'dlVwu', 'Water unit', 'mL', 'ml', 'Volume unit')}
        <p class="cb-note" id="dlVwN"></p></div>
        <div id="dlAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <p class="bm-h">Advanced</p>
          <div class="fld"><span class="lab">Make extra <span class="unit">%</span></span><div class="inp"><input id="dlX" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 10" aria-label="Extra volume in percent"></div></div>
          <p class="cb-note" id="dlXN"></p>
          ${ms('dlDec', 'Decimal places', [['a', 'Auto'], ['2', '2'], ['3', '3'], ['4', '4']], 'a')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="dlAdvBtn" type="button">
            <span id="dlAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="dlLab">Concentrate to use</div>
          <div class="res-big"><span id="dlBig">—</span></div>
          <div class="res-sub" id="dlSub" data-empty="Enter the strengths and how much you want to make.">Enter the strengths and how much you want to make.</div>
        </div>
        <div id="dlBody" style="display:none">
          <p class="res-tip adv-tip" id="dlTip"></p>
          <p class="bm-h">The flask, to scale</p>
          <div class="dl-flask" id="dlFlask"></div>
          <div class="dl-legend" id="dlLegend"></div>
          <p class="bm-h">Mixing order</p>
          <ol class="dl-steps" id="dlSteps"></ol>
          <p class="cb-note">Add the concentrate to the water, never the water to a strong concentrate: adding water to a concentrated acid can boil violently and splash. Never mix bleach with other cleaners.</p>
          <p class="bm-h">How strong it ends up</p>
          <div id="dlBar"></div>
          <p class="mm-cap" id="dlBarCap"></p>
          <div class="mm-tools"><button class="linkbtn" type="button" data-copy="dlCopyTxt">Copy result</button></div>
          <div id="dlCopyTxt" style="display:none"></div>
          <div id="dlBatchWrap"><p class="bm-h" id="dlBatchH"></p><div class="dl-wide"><table class="dtable" id="dlBatch"></table></div><p class="cb-note">Click a row to use that ratio.</p></div>
          <p class="bm-h">What the dilution means</p>
          <table class="dtable" id="dlEq"></table>
          <p class="bm-h">The same amounts in other units</p>
          <table class="dtable" id="dlUnits"></table>
          <p class="cb-note">For information only. Check the label and the safety data sheet of what you dilute, and wear goggles and gloves for strong chemicals.</p>
        </div>`;
  const left = `
        <h2>How to use the dilution calculator</h2>
        <p>Choose how the dilution is given. <strong>Strengths</strong>: type the strength you have and the strength you need, each with its unit. <strong>Ratio</strong>: type it the way you read it, <strong>1:10</strong>, <strong>1 in 10</strong> or <strong>10x</strong>; a plain number is read as the choice on the right. <strong>Volumes</strong>: type the concentrate and the water you already mixed to see the ratio and the strength you made.</p>
        <p>Then say which volume you know: the <strong>final volume</strong> you want to make, the <strong>concentrate</strong> you have, or the <strong>water</strong> you have. You get the concentrate and the water to mix, the flask to scale, the mixing order and a table of the same batch at other strengths. Under Go advanced you can make extra to cover what sticks to the container.</p>

        <h2>The dilution formula</h2>
        <div class="formula">
          C1 × V1 = C2 × V2
          <small>ADDING WATER CHANGES THE VOLUME, NOT THE AMOUNT OF SOLUTE</small>
        </div>
        ${formulas}
        <p>C1 and V1 are the strength and volume of the concentrate, C2 and V2 the strength and volume you end up with. Use the same unit for C1 and C2 and the same unit for the volumes; this calculator converts units for you, but never between mass, molar and × units.</p>

        <h2>1:10, 1 in 10 and 10× are not the same</h2>
        ${meaning}
        <p>Always check which one a recipe or label means. This calculator writes out what it read: “1 : 10 means 1 part concentrate + 10 parts water = 11 parts”.</p>`;
  const right = `
        <h2>Worked examples</h2>
        <p>10% concentrate to 1%, making 1 L: the factor is 10, so ${f(ex1.vc)} mL of concentrate and ${f(ex1.vw)} mL of water.</p>
        <p>Lab stock, 10 mM to 100 µM, making 50 mL: the factor is 100, so ${f(ex2.vc)} mL of stock and ${f(ex2.vw)} mL of diluent.</p>
        <p>Ratio 1 : 10, making 500 mL: 11 parts in all, so ${f(ex3.vc)} mL of concentrate and ${f(ex3.vw)} mL of water.</p>
        <p>2.0 M stock to 0.40 M, making 500 mL: ${f(ex4.vc)} mL of stock and ${f(500 - ex4.vc)} mL of water (the LibreTexts example).</p>

        <h2>Common ratios for 1 litre</h2>
        ${tblRatio}

        <h2>Limits and safety</h2>
        <p>The calculator assumes the liquids simply add up and the solute does not react, so it suits water-based mixes, cleaners, stock solutions and brines. A percent by weight with different densities, alcohol-water mixes and solutes that react need more than C1V1. Add the concentrate to the water, never the other way round for acids and other strong concentrates, and never mix bleach with other cleaners.</p>
        <p>For doses of a liquid medicine from the strength on its label, use the <a href="/mg-to-ml-calculator/">mg to mL calculator</a>; for a peptide vial, the <a href="/peptide-reconstitution-calculator/">peptide reconstitution calculator</a>.</p>
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
    <span class="mbar-lab" id="dlMLab">Concentrate to use</span>
    <div class="mbar-vals"><b id="dlMVal">—</b></div>
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
<script>CalcThis.initDilutionCalc();</script>
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
const prev = { slug: 'mg-to-ml-calculator', menu: 'mg to mL', name: 'mg to mL Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("  \\{ file: '" + prev.slug + "/index\\.html',\\s+slug: '" + ps2.replace(/\//g, '\\/') + "' \\},\\n"), (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(/(- \[mg to mL Calculator[^\n]*\n)/, (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('partials/header.html', (s2) => { s2 = s2.replace('Medication &amp; Dosage</span>', 'Medication &amp; Lab</span>'); return s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'); });
  edit('partials/footer.html', (s2) => { s2 = s2.replace('<span class="ft1">Medication &amp;</span> <span class="ft2">Dosage</span>', '<span class="ft1">Medication &amp;</span> <span class="ft2">Lab</span>'); return s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'); });
  edit('index.html', (h) => {
    h = h.replace('Medication &amp;<br>Dosage</button>', 'Medication &amp;<br>Lab</button>').replace('aria-label="Medication &amp; Dosage calculators"', 'aria-label="Medication &amp; Lab calculators"');
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M10 5h12M12 5v8l-5 10a3 3 0 0 0 3 4h12a3 3 0 0 0 3-4l-5-10V5" stroke="#37503F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 21h14l1.5 3a1.5 1.5 0 0 1-1.4 2H8.9a1.5 1.5 0 0 1-1.4-2L9 21z" fill="#D99A33" opacity=".85"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a><span> — concentrate and water for any strength, ratio (1:10) or factor, with a flask drawn to scale and the same batch at other strengths</span></li>\n');
    return h;
  });
}
