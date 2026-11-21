const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /serial-dilution-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials in the "Medication & Lab" group after Retatrutide, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.sdEngine. Run: node md-files/gen-serialdilution-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
['SERIALDIL'].forEach((k) => eval(app.slice(app.indexOf('/* ' + k + '-ENGINE:START */'), app.indexOf('/* ' + k + '-ENGINE:END */'))));
const E = CalcThis.sdEngine;
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
const S0 = 1000000, F0 = 10, N0 = 6, NEED = 100;
const T0 = E.tubes({ mode: 'factor', stock: S0, factor: F0, n: N0, first: 0 });
const PL = E.plan(S0, T0.c, NEED);
const tblSeries = '<table class="dtable"><thead><tr><th>Tube</th><th>Concentration</th><th>Pipette: take + diluent = make</th></tr></thead><tbody>' + T0.c.map((c, i) => '<tr><td>' + (i + 1) + '</td><td>' + f(c) + '</td><td>' + f(PL.rows[i].take) + ' µL of ' + (i === 0 ? 'stock' : 'tube ' + i) + ' + ' + f(PL.rows[i].dil) + ' µL diluent = ' + f(PL.rows[i].made) + ' µL</td></tr>').join('') + '</tbody></table>';
const tblFac = '<table class="dtable"><thead><tr><th>Factor per step</th><th>Ratio</th><th>Last tube after ' + N0 + ' tubes</th><th>Total dilution</th></tr></thead><tbody>' + [2, 3, 5, 10].map((F) => { const t = E.tubes({ mode: 'factor', stock: S0, factor: F, n: N0, first: 0 }); return '<tr><td>' + F + '×</td><td>1 : ' + (F - 1) + '</td><td>' + f(t.c[N0 - 1]) + '</td><td>' + f(S0 / t.c[N0 - 1]) + '×</td></tr>'; }).join('') + '</tbody></table>';
const half = Math.sqrt(10), TH = E.tubes({ mode: 'factor', stock: S0, factor: half, n: 4, first: 0 });
const RG = E.tubes({ mode: 'range', stock: S0, factor: 0, n: 0, from: 1000, to: 1 + 0 }), RG2 = E.tubes({ mode: 'range', stock: S0, factor: 10, n: 0, from: 1000, to: 1 });
const RGn = E.tubes({ mode: 'range', stock: S0, factor: 0, n: 4, from: 1000, to: 1 });
const CNT = 32, PMl = 0.2, TUBEC = 1e-6, TIT = E.titer(CNT, PMl, 1, TUBEC), TUBEPM = CNT / PMl;
const ER = E.spread([10, 10, 10, 10, 10, 10], 2)[5];

const SRC = `<h2>Sources</h2>
        <ul>
          <li>The plate-count back-calculation (colonies ÷ volume plated in mL, then divided by the dilution of the tube) and the range of 30 to 300 colonies for a countable plate: Pakpour and Horgan, General Microbiology Laboratory Manual, Lab 9 “Standard Plate Count” (LibreTexts, read 2026-11-22). Its example, 32 colonies from 200 µL of a 10<sup>−6</sup> tube, gives 160 per mL and 1.6 × 10<sup>8</sup> per mL in the original, and is the example used here.</li>
          <li>The series arithmetic (concentration of tube k = first tube ÷ factor<sup>k − 1</sup>, the volume to take = volume to make ÷ the step ratio) is plain division, the same on every calculator opened on 2026-11-22: Omnicalculator, AAT Bioquest, calculate.co.nz, ConductScience, Easy Unit Converter, dilution.phage.org (Abedon) and Pearson. The page lets you type the concentration unit as a label and never converts between a mass and a molar unit.</li>
          <li>Pipetting error and the smallest volume your pipette handles: no figure is taken from any calculator. You type your own, and the page shows what it does to the series. Other calculators advise preparing extra volume for pipetting loss; the percent you add here is yours.</li>
        </ul>
        <p><small>For laboratory planning, not a validated protocol. The page does arithmetic with the numbers you type. Mix every tube well and change the tip between tubes; check the plan with your own protocol or supervisor.</small></p>`;

const P = {
  slug: 'serial-dilution-calculator', name: 'Serial Dilution Calculator', menu: 'Serial Dilution', body: 'p-bmr p-sd',
  title: 'Serial Dilution Calculator: Tubes, Volumes, Titer',
  desc: 'Serial dilution calculator: the concentration of every tube, the volume to take and diluent to add, and the original count from a plate. Draws the tubes.',
  h1: 'Serial Dilution Calculator', eyebrow: 'Concentration of every tube · volumes to pipette · from X down to Y · plate count',
  lead: `Type the <strong>stock concentration</strong>, the <strong>dilution factor</strong> and the <strong>number of tubes</strong>, and see the concentration of every tube drawn as a row of tubes. For a stock of ${f(S0)}, a tenfold factor and ${N0} tubes, tube ${N0} is <strong>${f(T0.c[N0 - 1])}</strong>, a total dilution of ${f(S0 / T0.c[N0 - 1])}×. Add how much each tube must give for your assay and the page works <strong>backwards</strong> to the volume to make, the volume to take and the diluent to add in every tube. Type a count from a plate to find the concentration of the original sample.`,
  schema: 'Free serial dilution calculator: the concentration of every tube from the stock, the dilution factor and the number of tubes, a series from X down to Y, or your own list of concentrations; a volume planner that works backwards from the last tube, a smallest-pipette-volume check, error spread, a row of tubes drawn to scale and a plate-count back-calculation.',
  llms: 'Free serial dilution calculator: concentration of every tube, volumes to take and diluent to add, series from X down to Y, error spread and plate-count titer; draws the tubes.',
  card: 'The concentration of every tube, the volumes to pipette, a series from X down to Y and the count back from a plate, with the tubes drawn.',
  faqs: [
    ['How do I calculate a serial dilution?', 'Divide the stock concentration by the dilution factor to get tube 1, then divide each tube by the factor again to get the next. For a stock of ' + f(S0) + ' and a factor of ' + F0 + ', the tubes are ' + T0.c.map(f).join(', ') + '. The last tube is ' + f(S0 / T0.c[N0 - 1]) + ' times weaker than the stock.'],
    ['What does a 1:10 serial dilution mean?', 'A ratio of 1 : 10 means 1 part of the sample and 10 parts of diluent, so 11 parts in total and a factor of 11. A tenfold dilution, often called a 1 in 10 dilution, is 1 part sample and 9 parts diluent, a factor of 10. The page has a switch for “Fold”, “Ratio 1 : X” and “Transfer / total”, so you can type it the way your protocol says it.'],
    ['How much do I take and how much diluent do I add?', 'The volume to take is the volume you make divided by the step factor, and the diluent is what is left. To end with ' + f(NEED) + ' µL in a tenfold series, tube ' + N0 + ' takes ' + f(PL.rows[N0 - 1].take) + ' µL and ' + f(PL.rows[N0 - 1].dil) + ' µL of diluent. Earlier tubes must hold more, because the next tube takes some of their liquid.'],
    ['Why do the first tubes need more volume?', 'Each tube must give ' + f(NEED) + ' µL for your assay and also feed the next tube. Working backwards from the last tube, tube ' + (N0 - 1) + ' makes ' + f(PL.rows[N0 - 2].made) + ' µL and tube 1 makes ' + f(PL.rows[0].made) + ' µL. The stock needed for the whole series is ' + f(PL.stock) + ' µL.'],
    ['How do I get from a concentration to another in the fewest tubes?', 'Choose “From X down to Y”, type both concentrations and either the factor or the number of tubes. With ' + f(1000) + ' to 1 and a factor of 10 you need ' + RG2.n + ' tubes; with ' + RGn.n + ' tubes the factor is ' + f(RGn.factor) + '.'],
    ['How do I find the concentration of the original sample from a plate count?', 'Divide the colonies counted by the volume plated in millilitres, then divide by the concentration of the tube it came from (written as a fraction of the original). In the lab manual example, ' + CNT + ' colonies from ' + f(PMl * 1000) + ' µL of a 10<sup>−6</sup> tube is ' + f(TUBEPM) + ' per mL, so the original has ' + f(TIT) + ' per mL. Plates with 30 to 300 colonies are called countable.'],
    ['Does pipetting error add up along the series?', 'Yes. Every step repeats the error of the one before it. If you type ' + f(2) + '% for one step, ' + ER.steps + ' steps give about ±' + f(ER.rss) + '% if the errors are independent and at most ±' + f(ER.worst) + '% if they all point the same way. The number is yours: no pipette accuracy is assumed.'],
    ['Can I use my own list of concentrations?', 'Yes. Choose “My own list” and type the concentration of every tube from the strongest to the weakest. The page gives the step between tubes, the volumes to take and diluent to add, and flags any tube that is not weaker than the one before.'],
    ['What concentration units does it use?', 'Choose M, mM, µM, nM, pM, fM, mg/mL, µg/mL, ng/mL, %, cells/mL, CFU/mL, PFU/mL or ×. The unit is a label only: every tube uses the unit of your stock and nothing is converted.']
  ],
  pills: [['/dilution-calculator/', 'Dilution Calculator', '<path d="M7 3h10l-1 18H8L7 3zM7 9h10"/>'], ['/mg-to-ml-calculator/', 'mg to mL Calculator', '<path d="M10 5h12M12 5v8l-5 10a3 3 0 0 0 3 4h12a3 3 0 0 0 3-4l-5-10V5"/>'], ['/scientific-notation-calculator/', 'Scientific Notation Calculator', '<path d="M6 18L18 6M8 8h.01M16 16h.01"/>'], ['/confidence-interval-calculator/', 'Confidence Interval Calculator', '<path d="M3 12h18M7 8v8M17 8v8"/>']]
};

const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const cbox = (id, ph, aria) => `<div class="cf-box"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" aria-label="${aria}"></div>`;
const fld = (label, unitTxt, id, ph) => `<div class="fld"><span class="lab">${label}${unitTxt ? ' <span class="unit">' + unitTxt + '</span>' : ''}</span>${cbox(id, ph, label)}</div>`;
const ms = (id, label, opts, on) => '<div class="ctl-row" style="display:block"><span class="ctl-lab" style="display:block;margin-bottom:6px">' + label + '</span><div class="modeseg" id="' + id + '" role="group" aria-label="' + label + '">' + opts.map((o) => '<button' + (o[0] === on ? ' class="on"' : '') + ' type="button" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div></div>';
const note = (id) => `<p class="cb-note" id="${id}"></p>`;
const cselShell = (id, label, val, txt) => `<div class="csel" id="${id}" data-value="${val}" aria-label="${label}"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">${txt}</span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const presets = E.PRESETS.map((p) => `<button type="button" data-f="${p[0]}" data-n="${p[1]}">${p[2]}</button>`).join('');

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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'EducationalApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const input = `
        <div class="sl-head"><h2 class="card-h2">Your series</h2><button class="linkbtn" id="sdClear" type="button">Clear fields</button></div>
        <div class="two"><div class="fld"><span class="lab">Stock concentration</span>${cbox('sdStock', 'e.g. 1e9', 'Stock concentration')}</div><div class="fld"><span class="lab">Unit <span class="unit">a label only</span></span>${cselShell('sdUnit', 'Concentration unit', 'cfuml', 'CFU/mL')}</div></div>
        ${note('sdStockN')}
        <p class="cb-note" style="margin:-2px 0 10px"><button class="linkbtn" id="sdEx" type="button">Try an example</button></p>
        ${ms('sdMode', 'How do you set the series?', [['factor', 'Factor and tubes'], ['range', 'From X down to Y'], ['list', 'My own list']], 'factor')}
        <div class="fld"><span class="lab">Volumes in <span class="unit">every volume on this page</span></span>${cselShell('sdVu', 'Volumes in', 'ul', 'µL')}</div>
        <div id="sdFtW">${ms('sdFt', 'Type the dilution as', [['fold', 'Fold (10)'], ['ratio', 'Ratio 1 : X'], ['tv', 'Transfer / total']], 'fold')}</div>
        <div id="sdFacW">
          <div id="sdFacF"><div class="fld"><span class="lab"><span id="sdFactorLab">Dilution factor (fold)</span> <span class="unit" id="sdFactorUnit">e.g. 10 = tenfold</span></span>${cbox('sdFactor', 'e.g. 10', 'Dilution factor')}</div></div>
          <div id="sdTVW" style="display:none"><div class="two">${fld('Volume you transfer', '', 'sdT', 'e.g. 100')}${fld('Total volume after adding diluent', '', 'sdV', 'e.g. 1000')}</div></div>
          ${note('sdFacN')}
        </div>
        <div id="sdNW">
          ${fld('Number of tubes', 'steps', 'sdN', 'e.g. 6')}
          ${note('sdNN')}
          <div class="chips" id="sdPre" role="group" aria-label="Common series">${presets}</div>
        </div>
        <div id="sdRngW" style="display:none"><div class="two">${fld('First tube', '', 'sdFrom', 'e.g. 1000')}${fld('Last tube', '', 'sdTo', 'e.g. 1')}</div>${note('sdRngN')}</div>
        <div id="sdListW" style="display:none"><div class="fld"><span class="lab">Concentration of every tube <span class="unit">strongest first</span></span><textarea id="sdList" rows="3" autocomplete="off" placeholder="e.g. 1000, 100, 10, 1" aria-label="Concentration of every tube"></textarea></div>${note('sdListN')}</div>
        <div class="proj-sep"></div>
        <p class="bm-h">Volumes <span class="unit" style="font-weight:400">optional</span></p>
        ${fld('Liquid each tube must give', 'for your assay', 'sdVol', 'e.g. 100')}
        ${note('sdVolN')}
        <div class="res-hint" id="sdHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="sdAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${ms('sdFm', 'Show the numbers as', [['a', 'Normal'], ['s', 'Scientific']], 'a')}
          ${ms('sdSg', 'Significant digits in the concentrations', [['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']], '4')}
          <div id="sdFirstW">${fld('First tube starts at', 'if not stock ÷ factor', 'sdFirst', 'e.g. 1000')}${note('sdFirstN')}</div>
          ${fld('Replicates', 'optional', 'sdRep', 'e.g. 3')}
          ${note('sdRepN')}
          ${fld('Extra for pipetting loss', '%', 'sdLoss', 'e.g. 10')}
          ${note('sdLossN')}
          ${fld('Smallest volume you can pipette', 'in the volume unit above', 'sdMin', 'e.g. 5')}
          ${note('sdMinN')}
          ${ms('sdEt', 'The error of one step is given as', [['p', 'Percent'], ['v', 'Volume']], 'p')}
          <div class="fld"><span class="lab">Error of one dilution step <span class="unit" id="sdErrUnit">%</span></span>${cbox('sdErr', 'e.g. 2', 'Error of one dilution step')}</div>
          ${note('sdErrN')}
          <p class="bm-h">Single dilution from the stock <span class="unit" style="font-weight:400">C1 × V1 = C2 × V2</span></p>
          <div class="two">${fld('Concentration you want', '', 'sdC2', 'e.g. 1000')}${fld('Final volume you want', 'volume unit above', 'sdV2', 'e.g. 500')}</div>
          ${note('sdC1N')}
          <p class="bm-h">Names for the copied protocol <span class="unit" style="font-weight:400">optional</span></p>
          <div class="two"><div class="fld"><span class="lab">Stock name</span><div class="cf-box"><input id="sdSN" type="text" autocomplete="off" placeholder="e.g. culture" aria-label="Stock name"></div></div><div class="fld"><span class="lab">Diluent name</span><div class="cf-box"><input id="sdDN" type="text" autocomplete="off" placeholder="e.g. saline" aria-label="Diluent name"></div></div></div>
          ${note('sdNmN')}
          <p class="bm-h">Count back from a plate <span class="unit" style="font-weight:400">optional</span></p>
          ${fld('Colonies or plaques counted', '', 'sdCnt', 'e.g. 32')}
          <div class="two">${fld('Volume plated', '', 'sdPlate', 'e.g. 200')}${ms('sdPu', 'Plated in', [['ul', 'µL'], ['ml', 'mL']], 'ul')}</div>
          ${fld('Tube that was plated', 'leave empty for the last tube', 'sdTubeN', 'e.g. 6')}
          ${note('sdTubeNN')}
          ${note('sdCbN')}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="sdAdvBtn" type="button">
            <span id="sdAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="sdLab">Concentration of the last tube</div>
          <div class="res-big"><span id="sdBig">—</span></div>
          <div class="res-sub" id="sdSub" data-empty="Type the stock, the dilution factor and the number of tubes to see every tube.">Type the stock, the dilution factor and the number of tubes to see every tube.</div>
        </div>
        <div id="sdBody" style="display:none">
          <p class="res-tip adv-tip" id="sdTip"></p>
          <div id="sdWarn" style="display:none"></div>
          <p class="bm-h">Your tubes</p>
          <div class="sd-tubes" id="sdTubes"></div>
          <p class="rt-cap" id="sdTubesCap"></p>
          <p class="bm-h">Tube by tube</p>
          <div class="rt-wide"><table class="dtable" id="sdTab"></table></div>
          <p class="bm-h">The numbers <button class="linkbtn" type="button" data-copy="sdCopyTxt" style="margin-left:8px">Copy result</button></p>
          <table class="dtable" id="sdNums"></table>
          <div id="sdCopyTxt" style="display:none"></div>
          <div id="sdCbWrap" style="display:none">
            <p class="bm-h">The original sample</p>
            <p class="sd-cb" id="sdCb"></p>
          </div>
          <p class="bm-h">How it was worked out</p>
          <ol class="sd-steps" id="sdSteps"></ol>
          <p class="cb-note">For laboratory planning, not a validated protocol. Mix every tube well and change the tip between tubes.</p>
        </div>`;
  const left = `
        <h2>How to use the serial dilution calculator</h2>
        <p>Type the <strong>stock concentration</strong> and choose its unit. Then choose how you set the series: <strong>Factor and tubes</strong> (a factor such as 10 and a number of tubes), <strong>From X down to Y</strong> (the first and last concentration, and the page finds the factor or the number of tubes), or <strong>My own list</strong> (the concentration of every tube).</p>
        <p>Add <strong>the liquid each tube must give</strong> and the page works out how much to make, take and dilute in every tube, starting from the last. Under <strong>Go advanced</strong> you can add replicates, an allowance for pipetting loss, the smallest volume you can pipette, the error of one step, and a plate count to find the original concentration.</p>
        <h2>The formulas</h2>
        <div class="formula">
          tube k = first tube ÷ factor^(k − 1)
          <small>TUBE 1 = STOCK ÷ FACTOR · TAKE = MADE ÷ FACTOR · DILUENT = MADE − TAKE · ORIGINAL = COUNT ÷ VOLUME PLATED (mL) ÷ TUBE DILUTION</small>
        </div>
        <p>Worked out with this calculator: a stock of ${f(S0)} diluted ${F0}-fold in ${N0} tubes gives ${T0.c.map(f).join(', ')}. To end with ${f(NEED)} µL in every tube, working backwards:</p>
        ${tblSeries}
        <p>The whole series needs ${f(PL.stock)} µL of stock and ${f(PL.diluent)} µL of diluent.</p>
        <h2>Common series</h2>
        <p>The total dilution after ${N0} tubes for a stock of ${f(S0)}:</p>
        ${tblFac}
        <p>A half-log series uses a factor of √10 = ${f(half)}: ${TH.c.map(f).join(', ')} for four tubes, so every second tube is a tenfold step.</p>`;
  const right = `
        <h2>From X down to Y</h2>
        <p>Choose “From X down to Y” when you know the concentrations you want. From ${f(1000)} down to 1 with a factor of ${F0} takes ${RG2.n} tubes; with ${RGn.n} tubes the factor is ${f(RGn.factor)}. If the factor does not divide the range evenly, the last step is smaller so the last tube lands exactly on the concentration you typed.</p>
        <h2>Counting back from a plate</h2>
        <p>Plate a known volume from one tube and count the colonies. Divide the count by the volume in millilitres, then by the dilution of that tube. In the lab manual example, ${CNT} colonies from ${f(PMl * 1000)} µL of a 10<sup>−6</sup> tube is ${CNT} ÷ ${f(PMl)} = ${f(TUBEPM)} per mL, and ${f(TUBEPM)} ÷ 10<sup>−6</sup> = ${f(TIT)} per mL in the original. A count of 30 to 300 is the range the manual calls countable.</p>
        <h2>Error and the smallest volume</h2>
        <p>Every step repeats the error of the one before it. With ${f(2)}% per step, ${ER.steps} steps give about ±${f(ER.rss)}% for independent errors and at most ±${f(ER.worst)}%. If a transfer is smaller than the smallest volume you can pipette, the page flags it: use a smaller factor, more liquid in the tube, or an extra step.</p>
        <h2>What the calculator does not do</h2>
        <p>It does not choose a factor, a volume or a pipette for you, it does not convert between a mass and a molar concentration, and it does not replace your protocol. It does the arithmetic with the numbers you type.</p>
        <h2>Related tools</h2>
        <p>For a single dilution use the <a href="/dilution-calculator/">dilution calculator</a>; for milligrams to milliliters the <a href="/mg-to-ml-calculator/">mg to mL calculator</a>; for very large or small counts the <a href="/scientific-notation-calculator/">scientific notation calculator</a>; and for the uncertainty of a mean the <a href="/confidence-interval-calculator/">confidence interval calculator</a>.</p>
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
    <span class="mbar-lab" id="sdMLab">Last tube</span>
    <div class="mbar-vals"><b id="sdMVal">—</b></div>
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

    <h2 id="sdFaq" style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initSerialDilCalc();</script>
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
const prev = { slug: 'retatrutide-dosage-calculator', menu: 'Retatrutide Dosage', name: 'Retatrutide Dosage Calculator', llms: 'Retatrutide Dosage Calculator' };
{
  const url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("  \\{ file: '" + prev.slug + "/index\\.html',\\s+slug: '" + ps2.replace(/\//g, '\\/') + "' \\},\\n"), (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms.replace(/ /g, '[ ]') + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "EducationalApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M5 8v13a3 3 0 0 0 6 0V8M13 8v13a3 3 0 0 0 6 0V8M21 8v13a3 3 0 0 0 6 0V8" stroke="#37503F" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M5 17h6M13 19h6M21 21h6" stroke="#D99A33" stroke-width="3" stroke-linecap="round"/>
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
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a><span> — the concentration of every tube, the volumes to pipette, a series from X down to Y and the count back from a plate, with the tubes drawn</span></li>\n');
    return h;
  });
}
