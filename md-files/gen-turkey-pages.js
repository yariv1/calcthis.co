const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates the two turkey pages (cooking time + thawing time). Every number in the SEO text is computed from the
   engine in assets/app.js (TURKEY-ENGINE block) so the text and the tool agree to the digit.
   Run: node md-files/gen-turkey-pages.js   then   node build.js */
global.CalcThis = {};
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
eval(app.slice(app.indexOf('/* TURKEY-ENGINE:START */'), app.indexOf('/* TURKEY-ENGINE:END */')));
const E = CalcThis.turkeyEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const tpl = nl(fs.readFileSync(ROOT + 'hours-calculator/index.html', 'utf8'));
const headTop = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'));
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const rng = (c) => E.q(c.lo) + (c.lo === c.hi ? '' : '–' + E.q(c.hi));
const cookOf = (lb, st) => E.cook(lb, 'whole', st);
const c15 = cookOf(15, false), c15s = cookOf(15, true), c12 = cookOf(12, false), c12s = cookOf(12, true), c20 = cookOf(20, false), c20s = cookOf(20, true);
const t10 = E.thaw(10), t12 = E.thaw(12), t15 = E.thaw(15), t20 = E.thaw(20);
const fr = (t) => E.days(t.fridgeLo) + ' to ' + E.days(t.fridgeHi) + ' days';

// Thanksgiving 2026 (Thu Nov 26): when must a fridge thaw start for an 11:00 AM oven?
function thawStartFor(lb) { const oven = new Date(2026, 10, 26, 11, 0); return E.when(new Date(oven.getTime() - E.thaw(lb).fridgeHi * 3600000)); }

const FEAT = ['USDA roasting times by weight, stuffed or unstuffed', 'Whole turkey or turkey breast', 'Refrigerator and cold-water thaw times side by side',
  'Enter the dinner date and time to get the whole plan backwards', 'Warns when the refrigerator can no longer finish in time', 'Brining, rest time and guest count under Go advanced', 'Pounds or kilograms'];

function widget(page) {
  const GHOST = '<span class="g-off">-</span><span class="g-off">-</span><span class="g-sep">:</span><span class="g-off">-</span><span class="g-off">-</span>';
  const cookBox = `        <div id="tkCookBox">
          <div class="tk-cap">Roasting</div>
          <table class="dtable" id="tkCookTbl"></table>
          <p class="tk-none" id="tkCookNone" style="display:none">There is no USDA roasting time for this weight — see the note above the result.</p>
          <p class="res-tip adv-tip" id="tkCookTip">Done when a food thermometer reads <strong>165 °F (74 °C)</strong> in the innermost part of the thigh, the innermost part of the wing and the thickest part of the breast. Let it stand about 20 minutes before carving.</p>
        </div>`;
  const planBox = `        <div id="tkPlanBox" style="display:none">
          <div class="tk-cap">Your plan, worked back from dinner</div>
          <div id="tkTL"></div>
          <p class="res-tip adv-tip" id="tkPlanTip" style="display:none"></p>
        </div>`;
  const thawBox = `        <div id="tkThawBox">
          <div class="tk-cap">Thawing — two safe ways</div>
          <p class="tk-none" id="tkThawFresh" style="display:none">A fresh or already-thawed turkey needs no thawing — it goes straight to the oven.</p>
          <table class="dtable" id="tkThawTbl"></table>
          <p class="res-tip adv-tip" id="tkThawTip"></p>
        </div>`;
  const order = page === 'cook' ? [cookBox, planBox, thawBox] : [thawBox, planBox, cookBox];
  return `  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">${page === 'cook' ? 'Turkey cooking time' : 'Turkey thawing time'}</h2>

        <div class="ctl-row">
          <span class="ctl-lab">Weight units</span>
          <div class="seg" id="tkUnit" role="group" aria-label="Weight units">
            <button class="on" type="button" data-v="lb">Pounds</button>
            <button type="button" data-v="kg">Kilograms</button>
          </div>
        </div>

        <label class="fld" for="tkW">
          <span class="lab">Turkey weight <span class="unit" id="tkWUnit">lb</span></span>
          <div class="inp"><input id="tkW" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 15"></div>
        </label>

        <div class="fld">
          <span class="lab">Cut</span>
          <div class="seg tk-seg" id="tkCut" role="group" aria-label="Whole turkey or breast">
            <button class="on" type="button" data-v="whole">Whole turkey</button>
            <button type="button" data-v="breast">Turkey breast</button>
          </div>
        </div>

        <div class="fld" id="tkStuffFld">
          <span class="lab">Cavity</span>
          <div class="seg tk-seg" id="tkStuff" role="group" aria-label="Stuffed or unstuffed">
            <button class="on" type="button" data-v="unstuffed">Unstuffed</button>
            <button type="button" data-v="stuffed">Stuffed</button>
          </div>
        </div>

        <div class="fld">
          <span class="lab">The turkey is</span>
          <div class="seg tk-seg" id="tkState" role="group" aria-label="Frozen or fresh">
            <button class="on" type="button" data-v="frozen">Frozen</button>
            <button type="button" data-v="fresh">Fresh or thawed</button>
          </div>
        </div>

        <div class="fld" id="tkMethFld">
          <span class="lab">Thaw it</span>
          <div class="seg tk-seg" id="tkMethod" role="group" aria-label="Thawing method">
            <button class="on" type="button" data-v="fridge">In the refrigerator</button>
            <button type="button" data-v="cold">In cold water</button>
          </div>
        </div>

        <div class="proj-sep"></div>

        <label class="fld" for="tkDate">
          <span class="lab">Dinner date <span class="unit">optional — adds your schedule</span></span>
          <div class="inp"><input id="tkDate" type="text" inputmode="numeric" placeholder="e.g. 26 November 2026" autocomplete="off"></div>
        </label>
        <div class="chips tk-chips" id="tkDay">
          <button type="button" data-v="tg">Thanksgiving</button>
          <button type="button" data-v="xm">Christmas Day</button>
        </div>
        <div class="fld tk-tf">
          <span class="lab">Dinner time</span>
          <div class="time-field" id="tkTime"><div class="time-box"><div class="time-ghost" aria-hidden="true">${GHOST}</div><input class="time-digits" type="text" inputmode="numeric" autocomplete="off" maxlength="5" aria-label="Dinner time"></div><div class="seg ap-seg"><button type="button" data-ap="am">AM</button><button type="button" data-ap="pm">PM</button></div></div>
        </div>

        <div class="res-hint" id="tkHint" style="display:none;text-align:left;margin:0 0 8px"></div>

        <div id="tkAdv" style="display:none">
          <div class="proj-sep"></div>
          <label class="fld" for="tkRest">
            <span class="lab">Rest before carving <span class="unit">minutes — blank = 20</span></span>
            <div class="inp"><input id="tkRest" type="text" inputmode="numeric" autocomplete="off" placeholder="20"></div>
          </label>
          <label class="fld" for="tkBrine">
            <span class="lab">Brine before roasting <span class="unit">hours — optional</span></span>
            <div class="inp"><input id="tkBrine" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 12"></div>
          </label>
          <label class="fld" for="tkGuests" style="margin-bottom:0">
            <span class="lab">Guests <span class="unit">optional — suggests a size to buy</span></span>
            <div class="inp"><input id="tkGuests" type="text" inputmode="numeric" autocomplete="off" placeholder="e.g. 10"></div>
          </label>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="tkAdvBtn" type="button">
            <span id="tkAdvBtnLab">Go advanced</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="tkResLab">${page === 'cook' ? 'Roasting time' : 'Thawing time'}</div>
          <div class="res-big"><span id="tkBig">—</span> <span class="res-unit" id="tkUnitLab"></span></div>
          <div class="res-sub" id="tkSub">Enter your turkey’s weight.</div>
        </div>

        <div id="tkOut" style="display:none">
${order.join('\n\n')}
          <p class="tk-note" id="tkGuestNote" style="display:none"></p>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="tkMLab">${page === 'cook' ? 'Roasting time' : 'Thawing time'}</span>
    <div class="mbar-vals"><b id="tkMVal">—</b></div>
  </div>
`;
}

const PILL = (href, label, icon) => `      <a class="pill" href="${href}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>
        ${label}
      </a>`;
const IC = { clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>', pot: '<path d="M5 13h14l-1.5 7h-11L5 13z"/><path d="M4 13h16M9 8c0-2 2-2 2-4M14 8c0-2 2-2 2-4"/>', frac: '<path d="M7 5v14M17 5v14M3 9h18M3 15h18"/>' };
function related(page) {
  const pills = page === 'cook'
    ? [PILL('/turkey-thawing-time-calculator/', 'Turkey Thawing Time Calculator', IC.clock), PILL('/recipe-converter/', 'Recipe Converter', IC.pot), PILL('/time-calculator/', 'Time Calculator', IC.clock), PILL('/date-calculator/', 'Date Calculator', IC.cal)]
    : [PILL('/turkey-cooking-time-calculator/', 'Turkey Cooking Time Calculator', IC.pot), PILL('/recipe-converter/', 'Recipe Converter', IC.pot), PILL('/date-calculator/', 'Date Calculator', IC.cal), PILL('/time-calculator/', 'Time Calculator', IC.clock)];
  return `  <div class="related-calcs">
    <p class="related-calcs-h">More cooking, date and time calculators that may interest you</p>
    <div class="pills">
${pills.join('\n')}
    </div>
  </div>
`;
}

// ---------------- content ----------------
const chartRows = [['4 to 6 lb (breast)', '1½ to 2¼ hours', '—'], ['6 to 8 lb (breast)', '2¼ to 3¼ hours', '—']].concat(
  E.CHART.whole.unstuffed.map((u, i) => { const s = E.CHART.whole.stuffed[i]; return [u[0] + ' to ' + u[1] + ' lb', E.q(u[2]) + (u[2] === u[3] ? '' : ' to ' + E.q(u[3])) + ' hours', E.q(s[2]) + ' to ' + E.q(s[3]) + ' hours']; }));
const chartTable = `<table class="dtable"><thead><tr><th>Turkey weight</th><th>Unstuffed</th><th>Stuffed</th></tr></thead><tbody>${chartRows.map((r) => '<tr><td>' + r.join('</td><td>') + '</td></tr>').join('')}</tbody></table>`;
const thawTable = `<table class="dtable"><thead><tr><th>Turkey weight</th><th>Refrigerator</th><th>Cold water</th></tr></thead><tbody>
            <tr><td>4 to 12 lb</td><td>1 to 3 days</td><td>2 to 6 hours</td></tr>
            <tr><td>12 to 16 lb</td><td>3 to 4 days</td><td>6 to 8 hours</td></tr>
            <tr><td>16 to 20 lb</td><td>4 to 5 days</td><td>8 to 10 hours</td></tr>
            <tr><td>20 to 24 lb</td><td>5 to 6 days</td><td>10 to 12 hours</td></tr></tbody></table>`;
const hmx = (h) => E.hm(h);

const cookFaqs = [
  ['How long does it take to cook a 15 lb turkey?', `A 15 lb unstuffed turkey takes ${rng(c15)} hours at 325 °F (${E.hm(c15.lo)} to ${E.hm(c15.hi)}), and a stuffed one takes ${rng(c15s)} hours, according to the USDA chart. Start checking the temperature at the early end and plan on the late end.`],
  ['How long does it take to cook a 20 lb turkey?', `A 20 lb unstuffed turkey takes ${rng(c20)} hours at 325 °F and a stuffed one ${rng(c20s)} hours. Anything over 24 lb is beyond the USDA chart, so rely on the thermometer rather than the clock.`],
  ['How much longer does a stuffed turkey take?', `A little longer: a 12 lb turkey takes ${rng(c12)} hours unstuffed and ${rng(c12s)} hours stuffed. The USDA recommends cooking stuffing in a casserole for the best safety, and if you do stuff the bird the stuffing must also reach 165 °F in the center.`],
  ['What temperature should the oven be, and when is the turkey done?', 'Set the oven to no lower than 325 °F. The turkey is done when a food thermometer reads at least 165 °F (74 °C) in the innermost part of the thigh, the innermost part of the wing and the thickest part of the breast.'],
  ['Do I need to preheat the oven for a turkey?', 'No. The USDA says preheating is not necessary for roasting a turkey. Put it in a shallow roasting pan 2 to 2½ inches deep, breast side up on a flat wire rack, and set the oven to 325 °F or higher.'],
  ['How long should a turkey rest before carving?', 'About 20 minutes. The USDA recommends letting the bird stand 20 minutes before removing the stuffing and carving so the juices set and the turkey carves more easily. The calculator uses 20 minutes unless you change it under Go advanced.'],
  ['How long should I thaw a frozen turkey first?', `In the refrigerator allow roughly 24 hours for every 4 to 5 pounds — a 15 lb turkey needs ${fr(t15)}. In cold water allow about 30 minutes per pound. The <a href="/turkey-thawing-time-calculator/">turkey thawing time calculator</a> plans it for you.`]
];
const thawFaqs = [
  ['How long does it take to thaw a 15 lb turkey?', `In the refrigerator a 15 lb turkey takes ${fr(t15)} (about ${E.dur(t15.fridgeHi)} on the safe side), and in cold water about ${E.hm(t15.cold)}. These follow the USDA rule of 24 hours per 4 to 5 pounds in the fridge and 30 minutes per pound in cold water.`],
  ['How long does it take to thaw a 20 lb turkey?', `A 20 lb turkey takes ${fr(t20)} in the refrigerator and about ${E.hm(t20.cold)} in cold water. For a 20 lb bird the fridge is a five-day job, so it is the one to start earliest.`],
  ['Can I thaw a turkey on the counter?', 'No. A package of frozen poultry left on the counter for more than 2 hours is not at a safe temperature — the outer layer reaches the Danger Zone between 40 and 140 °F while the center is still frozen. Use the refrigerator, cold water or the microwave.'],
  ['How do I thaw a turkey in cold water?', `Keep the turkey in its leak-proof wrapper or bag, submerge it in cold tap water and change the water every 30 minutes. Allow about 30 minutes per pound — a 12 lb turkey is ${E.hm(t12.cold)} — and cook it immediately afterwards.`],
  ['When should I take the turkey out of the freezer for Thanksgiving?', `Work back from the oven. For an 11:00 AM oven time on Thanksgiving Thursday (November 26, 2026), a 12 lb turkey must be in the fridge by ${thawStartFor(12)}, a 15 lb turkey by ${thawStartFor(15)} and a 20 lb turkey by ${thawStartFor(20)}. A thawed turkey keeps 1 to 2 days in the fridge, so an extra day is fine.`],
  ['Can I refreeze a turkey after thawing it?', 'A turkey thawed in the refrigerator can be refrozen without cooking, though quality may suffer. One thawed in cold water or the microwave must be cooked immediately. After cooking, the meat can be refrozen either way.']
];

function contentCook() {
  return `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the turkey cooking time calculator</h2>
        <p>Enter the turkey’s weight in pounds or kilograms, choose <strong>Whole turkey</strong> or <strong>Turkey breast</strong> and, for a whole bird, stuffed or unstuffed. The result is the USDA roasting time at 325 °F, shown as a range — start checking the temperature at the early end and plan on the late end.</p>
        <p>Add your <strong>dinner date and time</strong> and the calculator works backwards into a plan: when to start thawing, when the turkey goes in the oven, when to start checking, when it comes out and when you carve. Under <strong>Go advanced</strong> you can set the rest time, add a brine and enter your guest count to see what size to buy.</p>

        <h2>Turkey cooking time by weight</h2>
        <p>These are the USDA FSIS roasting times for a fresh or thawed turkey in a 325 °F oven:</p>
        ${chartTable}

        <h2>How long to cook a 12, 15 or 20 lb turkey</h2>
        <p>A <strong>12 lb turkey</strong> takes ${rng(c12)} hours unstuffed (${rng(c12s)} stuffed). A <strong>15 lb turkey</strong> takes <strong>${rng(c15)} hours</strong> unstuffed (${rng(c15s)} stuffed), and a <strong>20 lb turkey</strong> takes ${rng(c20)} hours unstuffed (${rng(c20s)} stuffed). Times are a guide; the thermometer decides when the turkey is done.</p>
      </div>
      <div>
        <h2>What changes the roasting time</h2>
        <p>The USDA lists the variables that make a real turkey differ from the chart: a partially frozen bird takes longer, a stuffed bird takes longer, ovens heat unevenly and are often a little off, dark pans cook faster than shiny ones, a deep pan reduces heat circulation, a foil tent for the whole time slows cooking, a lid or an oven bag speeds it, and a turkey or pan that is too big for the oven blocks the heat. Check with a thermometer — the clock is only an estimate.</p>

        <h2>Safe temperature and resting</h2>
        <p>Cook the turkey to a safe minimum internal temperature of <strong>165 °F (74 °C)</strong>, measured in the innermost part of the thigh, the innermost part of the wing and the thickest part of the breast — and in the center of the stuffing if you stuffed it. Then let it stand about 20 minutes before carving.</p>

        <h2>Plan the whole dinner backwards</h2>
        <p>The roasting time is only one step. A frozen turkey needs days in the refrigerator first — see the <a href="/turkey-thawing-time-calculator/">turkey thawing time calculator</a> — and the dinner-time field above puts every step on a timeline. Scaling the rest of the menu? The <a href="/recipe-converter/">recipe converter</a> changes servings and converts cups to grams.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${cookFaqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
}
function contentThaw() {
  return `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the turkey thawing time calculator</h2>
        <p>Enter the turkey’s weight and pick how you will thaw it — <strong>in the refrigerator</strong> (the easiest and safest) or <strong>in cold water</strong> (much faster, but it needs attention). The result is the thawing time, and the table shows both methods side by side.</p>
        <p>Add your <strong>dinner date and time</strong> and you get the exact day and hour to start thawing, worked back from when the turkey goes in the oven. If the refrigerator can no longer finish in time, the calculator says so and shows the cold-water option instead.</p>

        <h2>Turkey thawing time by weight</h2>
        <p>These are the USDA FSIS thawing times for a whole turkey:</p>
        ${thawTable}

        <h2>The rule behind the numbers</h2>
        <div class="formula">
          refrigerator = 24 hours per 4 to 5 lb &nbsp;·&nbsp; cold water = 30 minutes per lb
          <small>PLAN ON THE LONG END OF THE REFRIGERATOR RANGE</small>
        </div>
        <p>A <strong>10 lb</strong> turkey takes ${fr(t10)} in the fridge or ${E.hm(t10.cold)} in cold water. A <strong>15 lb</strong> turkey takes <strong>${fr(t15)}</strong> or ${E.hm(t15.cold)}. A <strong>20 lb</strong> turkey takes ${fr(t20)} or ${E.hm(t20.cold)}.</p>
      </div>
      <div>
        <h2>Three safe ways to thaw a turkey</h2>
        <p><strong>Refrigerator:</strong> keep it in a container so the juices cannot drip onto other food, in a fridge at 40 °F (4 °C) or below. A thawed turkey can stay there 1 to 2 days before cooking.</p>
        <p><strong>Cold water:</strong> keep it in a leak-proof bag, submerge it in cold tap water and change the water every 30 minutes. Cook it immediately after it thaws.</p>
        <p><strong>Microwave:</strong> follow the manufacturer’s instructions and cook the turkey immediately afterwards, because parts of it may start to warm up.</p>

        <h2>Never on the counter</h2>
        <p>As soon as a turkey starts to thaw, bacteria that were present before freezing can grow again. Frozen poultry left on the counter for more than 2 hours is not at a safe temperature: the outside sits in the 40–140 °F Danger Zone while the middle is still frozen.</p>

        <h2>Then the oven</h2>
        <p>Once it is thawed, the <a href="/turkey-cooking-time-calculator/">turkey cooking time calculator</a> gives the USDA roasting time, and the dinner-time field above links the thaw and the roast into one timeline.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${thawFaqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
}

const PAGES = [
  {
    page: 'cook', slug: 'turkey-cooking-time-calculator', name: 'Turkey Cooking Time Calculator',
    title: 'Turkey Cooking Time Calculator — USDA Times by Weight | CalcThis',
    desc: `Turkey cooking time calculator: a 15 lb unstuffed turkey roasts ${rng(c15)} hours at 325 °F (USDA). Enter weight, stuffing and dinner time to get when it goes in the oven.`,
    ogTitle: 'Turkey Cooking Time Calculator — How Long to Cook a Turkey',
    ogDesc: 'USDA roasting times by weight, stuffed or unstuffed — then enter your dinner time and get when to thaw, roast and carve.',
    eyebrow: 'USDA times · planned back from dinner', h1: 'Turkey Cooking Time Calculator',
    hero: 'Find out <strong>how long to cook a turkey</strong> by weight, stuffed or unstuffed — the USDA times at 325 °F — then enter your dinner time and get the whole plan: when to start thawing, when the turkey goes in the oven and when to start checking the temperature.',
    faqs: cookFaqs, content: contentCook, ld: 'Turkey cooking time by USDA chart, whole turkey or breast, stuffed or unstuffed, with a dinner-time plan.'
  },
  {
    page: 'thaw', slug: 'turkey-thawing-time-calculator', name: 'Turkey Thawing Time Calculator',
    title: 'Turkey Thawing Time Calculator — Fridge & Cold Water | CalcThis',
    desc: `Turkey thawing time calculator: a 15 lb turkey takes ${fr(t15)} in the fridge or ${E.hm(t15.cold)} in cold water (USDA). Enter your dinner time to get when to start thawing.`,
    ogTitle: 'Turkey Thawing Time Calculator — How Long to Thaw a Turkey',
    ogDesc: 'Refrigerator and cold-water thawing times by weight — then enter your dinner time and get the day and hour to start.',
    eyebrow: 'Fridge or cold water · day and hour to start', h1: 'Turkey Thawing Time Calculator',
    hero: 'Find out <strong>how long to thaw a turkey</strong> in the refrigerator or in cold water, then enter your dinner time and get the day and hour to start thawing — plus when the turkey goes in the oven.',
    faqs: thawFaqs, content: contentThaw, ld: 'Turkey thawing time by USDA chart, refrigerator and cold water, with the day and hour to start.'
  }
];

function headFor(p) {
  const url = 'https://calcthis.co/' + p.slug + '/';
  let h = headTop;
  const sub = (re, rep) => { if (!re.test(h)) throw new Error('head replace failed ' + re); h = h.replace(re, () => rep); };
  sub(/<title>[^<]*<\/title>/, '<title>' + esc(p.title) + '</title>');
  sub(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + esc(p.desc) + '">');
  sub(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">');
  sub(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + esc(p.ogTitle) + '">');
  sub(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + esc(p.ogDesc) + '">');
  sub(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + url + '">');
  const strip = (t) => t.replace(/<[^>]+>/g, '');
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', name: p.name, url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: p.ld, featureList: FEAT, dateModified: '2026-10-28' },
    { '@type': 'FAQPage', mainEntity: p.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: strip(q[1]) } })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: p.name, item: url }] }
  ] };
  return h + '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 2) + '\n</script>\n</head>\n';
}

PAGES.forEach((p) => {
  const html = headFor(p) + `<body class="p-turkey" data-tk="${p.page}">
<div class="wrap">

<!--HEADER:START-->
<!--HEADER:END-->

  <section class="hero">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1>${p.h1}</h1>
    <p>${p.hero}</p>
  </section>

${widget(p.page)}
${related(p.page)}
${p.content()}

<!--FOOTER:START-->
<!--FOOTER:END-->

</div>

<script src="/assets/datepicker.min.js"></script>
<script src="/assets/app.js?v=194"></script>
<script>CalcThis.initTurkeyCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + p.slug + '/';
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', html.replace(/\n/g, '\r\n'));
  console.log('written', p.slug);
});
