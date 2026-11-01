const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates the AVERAGE family (hub + batting, stock, dice, time spokes) and registers them (sitemap, build.js PAGES, llms.txt, header/footer
   partials, homepage cards + hasPart + about list, seo-meta-hand.json). Every number in the text comes from CalcThis.avgEngine so text and tool
   agree. Run: node md-files/gen-average-pages.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* AVERAGE-ENGINE:START */'), app.indexOf('/* AVERAGE-ENGINE:END */')));
const E = CalcThis.avgEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const rr = (x, d) => { const f = Math.pow(10, d == null ? 2 : d); return String(Math.round(x * f) / f); };
const ba = (x) => '.' + x.toFixed(3).slice(2);
const pct1 = (p) => (p * 100).toFixed(1).replace(/\.0$/, '') + '%';

/* ---------- worked examples (all from the engine) ---------- */
const H1 = E.stats([10, 2, 38, 23, 38, 23, 21]);
const H2 = E.stats([12, 14, 15, 15, 16, 17, 120]), H2w = E.stats([12, 14, 15, 15, 16, 17]);
const bAvg = 120 / 400, sh = E.straightHits(25, 100, 0.3), shAfter = (25 + sh) / (100 + sh), room = Math.floor(120 / 0.3 - 400 + 1e-9);
const obpEx = E.obp(120, 40, 5, 400, 3), slgEx = E.slg(120, 25, 3, 12, 400);
const cr = 2400 / 60, crNeed = E.runsNeeded(2400, 60, 41);
const stk = E.stock([{ s: 50, p: 200 }, { s: 100, p: 150 }], 0), stkSimple = (200 + 150) / 2, stkX = E.sharesFor(100, 5000, 45, 40, 0);
const stkNew = (5000 + 40 * stkX) / (100 + stkX);
const d2 = E.diceDist(2, 6, 0), d20 = E.diceDist(1, 20, 0), dadv = E.diceDist(2, 20, 0, 'h', 1), ddis = E.diceDist(2, 20, 0, 'l', 1), d46 = E.diceDist(4, 6, 0, 'h', 3), d3 = E.diceDist(3, 6, 0), d2p3 = E.diceDist(2, 6, 3);
const pg10 = E.probAt(d2, 10, 'ge'), pg15a = E.probAt(d20, 15, 'ge'), pg15b = E.probAt(dadv, 15, 'ge');
const dur = E.parseDurList('1:30:45\n2h 15m\n45 min\n95 s', 'hm'); const durSum = dur.vals.reduce((a, v) => a + v.s, 0), durAvg = durSum / dur.vals.length;
const fmtDur = (sec) => { sec = Math.round(sec * 100) / 100; const h = Math.floor(sec / 3600), m = Math.floor((sec - h * 3600) / 60), s = Math.round((sec - h * 3600 - m * 60) * 100) / 100; return (h > 0 ? h + ':' + (m < 10 ? '0' : '') + m + ':' : m + ':') + (s < 10 ? '0' : '') + s; };
const clk = E.parseClockList('11:30 pm, 12:15 am, 11:45 pm, 12:30 am', 'am'), cmean = E.circMean(clk.vals.map((v) => v.m)), carith = clk.vals.reduce((a, v) => a + v.m, 0) / clk.vals.length;
const fmtClock = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mi = m % 60; return (h % 12 === 0 ? 12 : h % 12) + ':' + (mi < 10 ? '0' : '') + mi + ' ' + (h < 12 ? 'AM' : 'PM'); };
const clk2 = E.circMean(E.parseClockList('10:30 pm, 11:15 pm, 11:45 pm, 12:30 am', 'am').vals.map((v) => v.m));

const icons = {
  hub: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2"/>',
  pct: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  sd: '<path d="M3 20h18M7 20V10M12 20V4M17 20v-8"/>',
  wavg: '<circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/>',
  gpa: '<path d="M12 3l9 5-9 5-9-5 9-5zM3 8v6c0 2 4 4 9 4s9-2 9-4V8"/>',
  time: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  ratio: '<path d="M4 7h16M4 17h16M9 3L7 21M17 3l-2 18"/>'
};
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const fld = (id, label, unit, ph, extra) => `<label class="fld" for="${id}"><span class="lab" id="${id}Lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="number" inputmode="decimal" step="any" placeholder="${ph}"${extra || ''}></div></label>`;
const advBtn = `        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="avAdvBtn" type="button">
            <span id="avAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
const hintEl = '<div class="res-hint" id="avHint" style="display:none;text-align:left;margin:4px 0 8px"></div>';
const resultCard = (lab, emptySub, viz) => `    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="avResLab">${lab}</div>
          <div class="res-big"><span id="avBig">—</span></div>
          <div class="res-sub" id="avSub" data-empty="${emptySub}">${emptySub}</div>
        </div>
        <div id="avBody" style="display:none">
          <p class="res-tip adv-tip" id="avTip"></p>
${viz}
          <div class="proj-sep"></div>
          <table class="dtable" id="avStats"></table>
          <div id="avAdvOut" style="display:none"></div>
        </div>
      </div>
    </div>`;
const mbar = (lab) => `  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="avMLab">${lab}</span>
    <div class="mbar-vals"><b id="avMVal">—</b></div>
  </div>`;
const seg2 = (id, label, a, b, aLab, bLab) => `<div class="ctl-row"><span class="ctl-lab">${label}</span><div class="seg" id="${id}" role="group" aria-label="${label}"><button class="on" type="button" data-v="${a}">${aLab}</button><button type="button" data-v="${b}">${bLab}</button></div></div>`;

/* ---------- page definitions ---------- */
const PAGES = [];

/* ===== HUB ===== */
PAGES.push({
  slug: 'average-calculator', kind: 'hub', h1: 'Average Calculator', eyebrow: 'Mean · median · mode · outliers',
  title: 'Average Calculator — Mean, Median, Mode & More',
  desc: 'Free average calculator: paste any numbers to get the mean, median, mode, range, quartiles and outliers, with a live plot and the average without outliers.',
  hero: `Paste any list of numbers — commas, spaces, new lines or a spreadsheet column — and get the <strong>average</strong> with the <strong>median, mode, range, quartiles and outliers</strong> in one go. The numbers ${H1.sorted.join(', ')} average <strong>${rr(H1.mean, 6)}</strong>.`,
  appDesc: 'Average calculator: paste any list of numbers to get the mean, median, mode, geometric mean, range, quartiles and outliers, a live number-line plot with the mean and median marked, and the average without outliers.',
  cat: 'Math', iconPath: icons.hub,
  cardText: 'Paste any numbers to get the average, median, mode, range, quartiles and outliers — with a live plot, an average without outliers, and weighted and geometric means.',
  llms: 'Free average calculator: paste any numbers to get the mean, median, mode, geometric mean, range, quartiles and outliers, a live plot, the average without outliers, and weighted or harmonic means.',
  aboutLabel: 'Average', aboutDesc: ' — mean, median, mode and outliers',
  input: `        <h2 class="card-h2">Your numbers</h2>
        <label class="av-lab" for="avData">Numbers</label>
        <textarea class="av-ta" id="avData" placeholder="e.g. 10, 12, 23, 23, 16, 23, 21, 16&#10;or paste a column from Excel" aria-label="Numbers" spellcheck="false"></textarea>
        <p class="av-note" id="avNote"></p>
        ${hintEl}
        <div id="avAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <label class="av-lab" for="avWData">Weights <span style="color:var(--muted);font-weight:500">(optional — one per number, same order)</span></label>
          <textarea class="av-ta" id="avWData" style="min-height:64px" placeholder="e.g. 1, 1, 2, 3" aria-label="Weights" spellcheck="false"></textarea>
          <p class="av-note">Use weights when some numbers count for more — for example when each number is itself an average of a group, and the groups have different sizes.</p>
          <div class="ctl-row" style="display:block;margin-bottom:12px">
            <span class="ctl-lab" style="display:block;margin-bottom:6px">Outliers</span>
            <div class="modeseg" id="avExclSeg" role="group" aria-label="Outliers" style="grid-template-columns:1fr 1fr"><button class="on" type="button" data-v="keep">Keep them</button><button type="button" data-v="excl">Exclude them</button></div>
          </div>
          ${fld('avPlaces', 'Decimal places', 'max', '6', ' min="0" max="10"')}
        </div>
${advBtn}`,
  viz: `          <p class="bm-h">Your numbers on a line</p>
          <div class="av-plot" id="avPlot"></div>
          <div class="av-ticks" id="avTicks"></div>
          <div class="av-legend" id="avLegend"></div>`,
  mlab: 'Average', lab: 'Average (mean)', emptySub: 'Enter or paste at least one number.',
  related: [pill('/weighted-average-calculator/', 'Weighted Average Calculator', icons.wavg), pill('/standard-deviation-calculator/', 'Standard Deviation Calculator', icons.sd), pill('/percentage-calculator/', 'Percentage Calculator', icons.pct), pill('/gpa-calculator/', 'GPA Calculator', icons.gpa)],
  left: `        <h2>How to use the average calculator</h2>
        <p>Type or paste your numbers into the box — separated by <strong>commas, spaces or new lines</strong>, so a column copied from Excel or Google Sheets works as it is. The big number is the <strong>average</strong> (the arithmetic mean); below it you get the median, mode, geometric mean, range, quartiles and any outliers.</p>
        <p>Anything that is not a number is skipped and listed in a short "ignored" note, so one stray word never blanks the result. Under <strong>Go advanced</strong> you can add <strong>weights</strong>, <strong>exclude outliers</strong> and see the arithmetic, geometric and harmonic means side by side.</p>

        <h2>The average formula</h2>
        <div class="formula">
          Average = sum of the numbers ÷ how many there are
          <small>(x₁ + x₂ + … + xₙ) ÷ n</small>
        </div>
        <p>For ${H1.sorted.join(', ')}: the sum is ${H1.sum} and there are ${H1.n} numbers, so the average is ${H1.sum} ÷ ${H1.n} = <strong>${rr(H1.mean, 6)}</strong>. The median (the middle number once sorted) is ${H1.median}, and the numbers that repeat the most — the mode — are ${H1.modes.join(' and ')}.</p>

        <h2>Mean, median or mode?</h2>
        <table class="dtable">
          <thead><tr><th>Measure</th><th>What it tells you</th><th>Best for</th></tr></thead>
          <tbody>
            <tr><td>Mean (average)</td><td>The balance point: sum ÷ count</td><td>Fairly even data</td></tr>
            <tr><td>Median</td><td>The middle value once sorted</td><td>Skewed data, salaries, house prices</td></tr>
            <tr><td>Mode</td><td>The most frequent value</td><td>Repeated or categorical-like data</td></tr>
            <tr><td>Geometric mean</td><td>The n-th root of the product</td><td>Growth rates, ratios (positive numbers only)</td></tr>
          </tbody>
        </table>`,
  right: `        <h2>Outliers and the average</h2>
        <p>One extreme value can drag the average a long way. For 12, 14, 15, 15, 16, 17 and 120 the average is <strong>${rr(H2.mean, 4)}</strong>, but the median is ${H2.median} and 120 is an outlier. Without it the average is <strong>${rr(H2w.mean, 4)}</strong>. The calculator flags outliers with the standard <strong>1.5 × IQR</strong> rule (a value more than 1.5 interquartile ranges below the first quartile or above the third) and shows the average without them — under Go advanced you can exclude them for good.</p>

        <h2>Special kinds of average</h2>
        <ul>
          <li><strong>Weighted average</strong> — when some numbers count more: use the weights box under Go advanced, or the <a href="/weighted-average-calculator/">weighted average calculator</a>.</li>
          <li><strong>Batting average</strong> — hits ÷ at-bats, or runs ÷ outs in cricket: the <a href="/batting-average-calculator/">batting average calculator</a>.</li>
          <li><strong>Average price per share</strong> across several buys: the <a href="/stock-average-calculator/">stock average calculator</a>.</li>
          <li><strong>Average roll</strong> of any dice, with the odds of every total: the <a href="/dice-average-calculator/">dice average calculator</a>.</li>
          <li><strong>Average time</strong> of durations or clock times: the <a href="/time-average-calculator/">time average calculator</a>.</li>
          <li><strong>Average of percentages</strong> — average the percentages directly only if every group is the same size; otherwise use weights. See the <a href="/percentage-calculator/">percentage calculator</a>.</li>
        </ul>
        <p>To see how spread out the numbers are as well as where the middle is, use the <a href="/standard-deviation-calculator/">standard deviation calculator</a>.</p>`,
  faqs: [
    ['How do you calculate the average?', `Add up all the numbers and divide by how many there are. For ${H1.sorted.join(', ')}, the sum is ${H1.sum}, there are ${H1.n} numbers, and ${H1.sum} ÷ ${H1.n} = ${rr(H1.mean, 6)}.`],
    ['What is the difference between average, mean, median and mode?', `"Average" usually means the mean: the sum divided by the count. The median is the middle value after sorting (${H1.median} for the example), and the mode is the value that appears most often (${H1.modes.join(' and ')}). The calculator shows all three.`],
    ['How do I enter my numbers?', `Separate them with commas, spaces or new lines, or paste a column from a spreadsheet. Anything that is not a number is skipped and listed as ignored. Write 1000, not 1,000 — a comma separates two numbers.`],
    ['What is an outlier and how do I remove it?', `An outlier is a value far from the rest: more than 1.5 interquartile ranges below Q1 or above Q3. In 12, 14, 15, 15, 16, 17, 120 the value 120 is an outlier — the average falls from ${rr(H2.mean, 2)} to ${rr(H2w.mean, 2)} without it. Open Go advanced and choose "Exclude them" to remove outliers from every result.`],
    ['How do I find a weighted average?', `Open Go advanced and add one weight per number, in the same order. The weighted average is the sum of each number times its weight, divided by the sum of the weights. For 80 and 90 with weights 1 and 3 it is (80 × 1 + 90 × 3) ÷ 4 = 87.5. There is also a dedicated <a href="/weighted-average-calculator/">weighted average calculator</a>.`],
    ['Can I average negative numbers or decimals?', `Yes — both work. The geometric and harmonic means need positive numbers, so those rows show a note instead of a value when your list has zero or negative values.`],
    ['Why is my average different from the median?', `The average is pulled toward extreme values and the median is not. When the two differ a lot, the data is skewed or has outliers — the median is then usually the better "typical" value.`]
  ]
});

/* ===== BATTING ===== */
PAGES.push({
  slug: 'batting-average-calculator', kind: 'bat', h1: 'Batting Average Calculator', eyebrow: 'Baseball · softball · cricket',
  title: 'Batting Average Calculator — Baseball & Cricket',
  desc: 'Free batting average calculator for baseball and cricket: enter hits and at-bats or runs and outs, see it on a scale and the hits in a row you need.',
  hero: `Enter <strong>hits and at-bats</strong> (baseball, softball) or <strong>runs and times out</strong> (cricket) and see the batting average on a scale — plus the <strong>hits in a row you need to reach a target</strong>. ${120} hits in ${400} at-bats is <strong>${ba(bAvg)}</strong>.`,
  appDesc: 'Batting average calculator for baseball, softball and cricket: hits ÷ at-bats or runs ÷ times out, shown on a scale of typical ranges, with the straight hits needed to reach a target average and optional OBP, slugging and OPS.',
  cat: 'Math', iconPath: '<circle cx="12" cy="12" r="9"/><path d="M7 7l10 10M7 17L17 7"/>',
  cardText: 'Batting average for baseball, softball and cricket on a scale of typical ranges — plus the hits in a row you need to reach a target, and optional OBP, slugging and OPS.',
  llms: 'Free batting average calculator for baseball, softball and cricket: hits ÷ at-bats or runs ÷ outs on a scale of typical ranges, the straight hits needed to reach a target average, and optional OBP, SLG and OPS.',
  aboutLabel: 'Batting average', aboutDesc: ' — baseball and cricket, with a target solver',
  input: `        <h2 class="card-h2">Your numbers</h2>
        <div class="ctl-row">
          <span class="ctl-lab">Sport</span>
          <div class="seg" id="avSportSeg" role="group" aria-label="Sport"><button class="on" type="button" data-v="base">Baseball / softball</button><button type="button" data-v="cr">Cricket</button></div>
        </div>
        <div class="two">
          ${fld('avA', 'Hits', 'count', 'e.g. 120', ' min="0"')}
          ${fld('avB', 'At-bats', 'count', 'e.g. 400', ' min="0"')}
        </div>
        <div class="proj-sep"></div>
        <label class="fld" for="avTarget" style="margin-bottom:0"><span class="lab" id="avTLab">Target average <span class="unit">optional</span></span><div class="inp"><input id="avTarget" type="text" inputmode="decimal" placeholder="e.g. .300" autocomplete="off"></div></label>
        <div class="chips" id="avTChips" style="margin-top:8px"></div>
        <div id="avNextWrap">${fld('avNext', 'Next at-bats', 'optional', 'e.g. 50', ' min="0"')}</div>
        ${hintEl}
        <div id="avAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="avAdvBase">
            <span class="av-lab">For OBP, slugging and OPS <span style="color:var(--muted);font-weight:500">(blank = 0)</span></span>
            <div class="two">${fld('avBB', 'Walks', 'BB', '0', ' min="0"')}${fld('avHBP', 'Hit by pitch', 'HBP', '0', ' min="0"')}</div>
            <div class="two">${fld('avSF', 'Sacrifice flies', 'SF', '0', ' min="0"')}${fld('av2B', 'Doubles', '2B', '0', ' min="0"')}</div>
            <div class="two">${fld('av3B', 'Triples', '3B', '0', ' min="0"')}${fld('avHR', 'Home runs', 'HR', '0', ' min="0" style="margin-bottom:0"')}</div>
          </div>
          <div id="avAdvCr" style="display:none">
            <span class="av-lab">For not outs and strike rate <span style="color:var(--muted);font-weight:500">(optional)</span></span>
            <div class="two">${fld('avInn', 'Innings', 'count', 'e.g. 65', ' min="0"')}${fld('avBalls', 'Balls faced', 'count', 'e.g. 2800', ' min="0"')}</div>
          </div>
        </div>
${advBtn}`,
  viz: `          <p class="bm-h">Where it sits</p>
          <div class="av-scale" id="avScale"></div>
          <div class="av-ticks" id="avScaleT"></div>
          <p class="av-note">Typical ranges, darker = better. Baseball: below .250 poor to average, .250–.300 good to very good, above .300 exceptional. Cricket: below 10 poor up to above 50 extraordinary.</p>`,
  mlab: 'Batting average', lab: 'Batting average', emptySub: 'Enter your hits and at-bats.',
  related: [pill('/average-calculator/', 'Average Calculator', icons.hub), pill('/percentage-calculator/', 'Percentage Calculator', icons.pct), pill('/ratio-calculator/', 'Ratio Calculator', icons.ratio), pill('/weighted-average-calculator/', 'Weighted Average Calculator', icons.wavg)],
  left: `        <h2>How to use the batting average calculator</h2>
        <p>Choose <strong>Baseball / softball</strong> and enter hits and at-bats, or <strong>Cricket</strong> and enter runs scored and times out. The big number is the batting average, shown on a scale of typical ranges. Add a <strong>target average</strong> (type .300 or tap a chip) and the calculator tells you how many <strong>hits in a row</strong> you need — or, if you are already above it, how many outs in a row you can afford.</p>
        <p>Enter the number of <strong>next at-bats</strong> you have left to see how many hits you need in them, and whether the target is still possible.</p>

        <h2>The batting average formula</h2>
        <div class="formula">
          Baseball: AVG = hits ÷ at-bats
          <small>CRICKET: AVERAGE = RUNS SCORED ÷ TIMES OUT</small>
        </div>
        <p>${120} hits in ${400} at-bats is ${120} ÷ ${400} = <strong>${ba(bAvg)}</strong> — "batting three-hundred". In cricket, ${(2400).toLocaleString('en-US')} runs in ${60} dismissals is ${(2400).toLocaleString('en-US')} ÷ ${60} = <strong>${rr(cr, 2)}</strong>. Baseball averages are written to three decimals without the leading zero; cricket averages to two.</p>

        <h2>Hits in a row to reach a target</h2>
        <p>With 25 hits in 100 at-bats (.250) and a target of .300, each hit raises both hits and at-bats by one, so you need <strong>${sh} hits in a row</strong> to get to ${ba(shAfter)}. The general rule: straight hits needed = (target × at-bats − hits) ÷ (1 − target), rounded up.</p>`,
  right: `        <h2>What is a good batting average?</h2>
        <table class="dtable">
          <thead><tr><th>Baseball (MLB)</th><th>Reading</th></tr></thead>
          <tbody>${E.BASE_BANDS.map((b) => '<tr><td>' + b[2].split(' — ')[0] + '</td><td>' + b[2].split(' — ')[1] + '</td></tr>').join('')}</tbody>
        </table>
        <table class="dtable" style="margin-top:12px">
          <thead><tr><th>Cricket</th><th>Reading</th></tr></thead>
          <tbody>${E.CRIC_BANDS.map((b) => '<tr><td>' + b[2].split(' — ')[0] + '</td><td>' + b[2].split(' — ')[1] + '</td></tr>').join('')}</tbody>
        </table>
        <p class="av-note">These are the commonly quoted ranges for MLB and cricket, as summarised by Omni Calculator (retrieved November 2026). Leagues, ages and levels differ, so treat them as a guide.</p>

        <h2>OBP, slugging and OPS</h2>
        <p>Under <strong>Go advanced</strong> add walks, hit-by-pitch, sacrifice flies, doubles, triples and home runs for the fuller picture. <strong>On-base percentage</strong> = (H + BB + HBP) ÷ (AB + BB + HBP + SF); <strong>slugging</strong> = total bases ÷ AB; <strong>OPS</strong> = OBP + SLG. With ${120} H, 40 BB, 5 HBP, 3 SF, 25 2B, 3 3B, 12 HR in ${400} AB: OBP ${ba(obpEx)}, SLG ${ba(slgEx)}, OPS ${ba(obpEx + slgEx)}.</p>
        <p>For cricket, the same panel takes innings and balls faced for <strong>not outs</strong> and <strong>strike rate</strong> (runs per 100 balls). For averages of any list of numbers, use the <a href="/average-calculator/">average calculator</a>.</p>`,
  faqs: [
    ['How do you calculate a batting average in baseball?', `Divide hits by official at-bats. ${120} hits in ${400} at-bats is ${120} ÷ ${400} = ${bAvg.toFixed(3)}, written ${ba(bAvg)}.`],
    ['How do you calculate a batting average in cricket?', `Divide the runs scored by the number of times out. ${(2400).toLocaleString('en-US')} runs and ${60} dismissals gives ${(2400).toLocaleString('en-US')} ÷ ${60} = ${rr(cr, 2)}. If a batter has never been out the average is undefined.`],
    ['How many hits in a row do I need to reach a .300 average?', `It depends on where you start: straight hits needed = (target × at-bats − hits) ÷ (1 − target), rounded up. From 25 hits in 100 at-bats you need ${sh} straight hits to reach ${ba(shAfter)}. The calculator does this for any numbers.`],
    ['Do walks count as at-bats?', `No. Walks, hit-by-pitch and sacrifice flies are not official at-bats, so they do not change a batting average — but they do count in on-base percentage.`],
    ['What is a good batting average?', `In MLB, above .300 is exceptional, .250 to .300 is good to very good, and below .250 is poor to average. The last player to hit over .400 for a season was Ted Williams (.406 in 1941). In cricket, 40 to 50 is very good and above 50 is extraordinary.`],
    ['Why is a batting average written without a zero?', `By convention baseball averages are written to three decimals with no leading zero (.300, not 0.300) and read as "three hundred". Cricket averages are written normally, for example ${rr(cr, 2)}.`],
    ['How is OPS calculated?', `OPS is on-base percentage plus slugging percentage. Slugging is total bases divided by at-bats, where a single is 1, a double 2, a triple 3 and a home run 4. Open Go advanced to enter the extra numbers.`]
  ]
});

/* ===== STOCK ===== */
PAGES.push({
  slug: 'stock-average-calculator', kind: 'stock', h1: 'Stock Average Calculator', eyebrow: 'Average cost per share',
  title: 'Stock Average Calculator — Average Cost Per Share',
  desc: 'Free stock average calculator: add your buys to get the average price per share, then see how many shares to buy to bring it down to a target.',
  hero: `Add each purchase — <strong>shares and price</strong> — and get your <strong>average cost per share</strong>. Then type today's price and a target to see <strong>how many more shares to buy</strong>. Buying 50 shares at 200 and 100 at 150 averages <strong>${rr(stk.avg, 2)}</strong>, not ${stkSimple}.`,
  appDesc: 'Stock average calculator: add any number of purchases (shares and price) to get the average cost per share and total cost, with a price ladder, gain or loss at the current price, and a solver for how many shares to buy to reach a target average. Optional fee per purchase.',
  cat: 'Finance', iconPath: '<path d="M3 17l5-5 4 4 8-9"/><path d="M15 7h5v5"/>',
  cardText: 'Add your stock purchases to get the average cost per share, then see how many shares to buy at today’s price to bring the average down to a target.',
  llms: 'Free stock average calculator: add several buys to get the average cost per share and total cost, the gain or loss at the current price, and how many shares to buy to reach a target average.',
  aboutLabel: 'Stock average', aboutDesc: ' — average cost per share and a target solver',
  input: `        <h2 class="card-h2">Your purchases</h2>
        <div class="av-head"><span></span><span>Shares</span><span>Price per share</span><span></span></div>
        <div id="avRows"></div>
        <div class="add-row" style="margin-top:10px">
          <button class="btn" id="avAdd" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
            Add purchase
          </button>
        </div>
        <div class="proj-sep"></div>
        <div class="two">
          ${fld('avPrice', 'Current price', 'optional', 'e.g. 40', ' min="0"')}
          ${fld('avTarget', 'Target average', 'optional', 'e.g. 45', ' min="0" style="margin-bottom:0"')}
        </div>
        <p class="av-note">Add the current price to see your gain or loss, and a target to see how many shares to buy at that price.</p>
        ${hintEl}
        <div id="avAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${fld('avFee', 'Fee per purchase', 'flat amount', '0', ' min="0" style="margin-bottom:0"')}
          <p class="av-note">Added to the cost of every purchase (and to the new purchase in the target solver).</p>
        </div>
${advBtn}`,
  viz: `          <p class="bm-h">Where you bought</p>
          <div class="av-ladder" id="avViz"></div>
          <div class="av-ticks" id="avVizT"></div>
          <p class="av-note">Bigger circles are bigger purchases. The amber line is your average; the dashed lines are today's price and your target.</p>`,
  mlab: 'Average price', lab: 'Average price per share', emptySub: 'Enter shares and price for at least one purchase.',
  related: [pill('/average-calculator/', 'Average Calculator', icons.hub), pill('/weighted-average-calculator/', 'Weighted Average Calculator', icons.wavg), pill('/percentage-calculator/', 'Percentage Calculator', icons.pct), pill('/loan-calculator/', 'Loan Calculator', '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>')],
  left: `        <h2>How to use the stock average calculator</h2>
        <p>Enter the <strong>shares</strong> and the <strong>price per share</strong> for each purchase and tap <strong>Add purchase</strong> for more. The big number is your <strong>average cost per share</strong>; the table shows your total shares, total cost and your lowest and highest buy. Fractional shares work.</p>
        <p>Type the <strong>current price</strong> to see what your holding is worth and your gain or loss. Add a <strong>target average</strong> as well and the calculator tells you how many shares to buy at today's price to reach it, what that purchase costs and your new average.</p>

        <h2>The average cost formula</h2>
        <div class="formula">
          Average cost = total cost ÷ total shares
          <small>(SHARES₁ × PRICE₁ + SHARES₂ × PRICE₂ + …) ÷ (SHARES₁ + SHARES₂ + …)</small>
        </div>
        <p>You buy 50 shares at 200 and 100 shares at 150. The total cost is 50 × 200 + 100 × 150 = ${stk.cost.toLocaleString('en-US')} for ${stk.shares} shares, so the average is ${stk.cost.toLocaleString('en-US')} ÷ ${stk.shares} = <strong>${rr(stk.avg, 2)}</strong>. Averaging the two prices (${stkSimple}) is wrong because it ignores that you bought twice as many shares at 150.</p>`,
  right: `        <h2>Averaging down: how many shares to buy</h2>
        <p>Say you hold 100 shares bought at 50 (cost 5,000), the price is now 40 and you want an average of 45. Buying <em>x</em> more shares at 40 gives (5,000 + 40x) ÷ (100 + x) = 45, so x = (45 × 100 − 5,000) ÷ (40 − 45) = <strong>${stkX} shares</strong>. The new average is ${rr(stkNew, 2)} on ${100 + stkX} shares.</p>
        <p>The general rule: shares to buy = (target × shares − cost) ÷ (price − target). The new average always lands <em>between</em> your current average and the price you buy at, so a target outside that range can't be reached with one purchase — the calculator tells you so.</p>

        <h2>Good to know</h2>
        <ul>
          <li><strong>Fees</strong> — under Go advanced, add a flat fee per purchase and it is included in the cost and in the solver.</li>
          <li><strong>Selling</strong> — this tool covers buying. After a sale the cost basis depends on the method your broker or tax authority uses (average cost, FIFO or specific lots).</li>
          <li><strong>Not advice</strong> — averaging down adds to a losing position; the calculator shows the arithmetic, not whether it is a good idea.</li>
        </ul>
        <p>For the average of any other list of numbers use the <a href="/average-calculator/">average calculator</a>; for values with different weights, the <a href="/weighted-average-calculator/">weighted average calculator</a>.</p>`,
  faqs: [
    ['How do you calculate the average price of a stock?', `Divide your total cost by your total shares. Buying 50 shares at 200 and 100 shares at 150 costs ${stk.cost.toLocaleString('en-US')} for ${stk.shares} shares, so the average price is ${rr(stk.avg, 2)}.`],
    ['Why isn’t it just the average of the prices?', `Because the purchases are different sizes. The plain average of 200 and 150 is ${stkSimple}, but you bought twice as many shares at 150, so your real average is ${rr(stk.avg, 2)}. This is a weighted average, with the share counts as the weights.`],
    ['How many shares do I need to buy to lower my average?', `Use the target solver: shares to buy = (target × shares − cost) ÷ (price − target). With 100 shares bought at 50, a price of 40 and a target of 45, you need ${stkX} more shares. Enter your current price and target in the calculator for your own numbers.`],
    ['Can I get my average below the current price?', `No. Any new purchase pulls the average toward the price you buy at, so it can get close to the current price but never below it. A target outside the range between your average and the current price is reported as not reachable.`],
    ['Do fees change my average cost?', `Yes — fees add to what you paid. Open Go advanced and enter a flat fee per purchase; it is added to every buy and to the new purchase in the solver.`],
    ['Does this work for crypto or fractional shares?', `Yes. Shares can be any positive number, including fractions, so it works for fractional shares, ETFs and crypto — enter the amount bought and the price paid.`],
    ['Does this handle selling shares or tax lots?', `No. It calculates the average cost of purchases. How a sale changes your cost basis depends on the method your broker or tax authority uses, so check that separately.`]
  ]
});

/* ===== DICE ===== */
PAGES.push({
  slug: 'dice-average-calculator', kind: 'dice', h1: 'Dice Average Calculator', eyebrow: 'Average roll · exact odds',
  title: 'Dice Average Calculator — Average Roll & Odds',
  desc: 'Free dice average calculator: any dice, sides and modifier give the average roll, the exact odds of every total and the chance of hitting a target.',
  hero: `Pick the <strong>number of dice, sides and modifier</strong> and get the <strong>average roll</strong>, the <strong>exact odds of every total</strong> and the chance of hitting a target. 2d6 averages <strong>${rr(d2.mean, 2)}</strong>; a d20 with advantage averages <strong>${rr(dadv.mean, 3)}</strong>.`,
  appDesc: 'Dice average calculator: choose any number of dice, any number of sides and a modifier to get the average roll, minimum, maximum, most likely total, standard deviation and a chart of the exact probability of every total, with the chance of reaching a target and keep-highest or keep-lowest rules such as advantage.',
  cat: 'Math', iconPath: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  cardText: 'The average roll of any dice with the exact odds of every total, the chance of hitting a target, and advantage, disadvantage or drop-lowest rules.',
  llms: 'Free dice average calculator: any dice, sides and modifier give the average roll, exact probability of every total, the chance of hitting a target, and keep-highest or keep-lowest rules like advantage and 4d6 drop lowest.',
  aboutLabel: 'Dice average', aboutDesc: ' — average roll and exact odds',
  input: `        <h2 class="card-h2">Your roll</h2>
        <span class="av-lab">Quick picks <span style="color:var(--muted);font-weight:500">(advantage and disadvantage use a d20)</span></span>
        <div class="chips" id="avPre">
          <button type="button" data-v="d6">d6</button><button type="button" data-v="2d6">2d6</button><button type="button" data-v="d20">d20</button><button type="button" data-v="adv">Advantage</button><button type="button" data-v="dis">Disadvantage</button><button type="button" data-v="4d6">4d6 drop low</button>
        </div>
        <div class="two">
          ${fld('avN', 'Number of dice', 'count', 'e.g. 2', ' min="1" max="100"')}
          ${fld('avSides', 'Sides per die', 'count', 'e.g. 6', ' min="2" max="100"')}
        </div>
        <div class="chips" id="avSChips" style="margin-top:-4px"><button type="button" data-v="4">d4</button><button type="button" data-v="6">d6</button><button type="button" data-v="8">d8</button><button type="button" data-v="10">d10</button><button type="button" data-v="12">d12</button><button type="button" data-v="20">d20</button><button type="button" data-v="100">d100</button></div>
        <div class="two">
          ${fld('avMod', 'Modifier', 'e.g. +3', '0', ' step="1"')}
          ${fld('avTarget', 'Target total', 'optional', 'e.g. 10', ' step="1" style="margin-bottom:0"')}
        </div>
        ${hintEl}
        <div id="avAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="ctl-row" style="display:block;margin-bottom:12px">
            <span class="ctl-lab" style="display:block;margin-bottom:6px">Which dice count</span>
            <div class="modeseg" id="avKeepSeg" role="group" aria-label="Which dice count" style="grid-template-columns:1fr 1fr 1fr"><button class="on" type="button" data-v="all">All</button><button type="button" data-v="h">Highest</button><button type="button" data-v="l">Lowest</button></div>
          </div>
          ${fld('avKeepN', 'How many to keep', 'count', '1', ' min="1" style="margin-bottom:0"')}
          <p class="av-note">Roll the dice, then add up only the highest (or lowest) few — advantage is 2d20 keep highest 1, "4d6 drop lowest" is 4d6 keep highest 3. Up to 12 dice.</p>
        </div>
${advBtn}`,
  viz: `          <p class="bm-h" id="avChartCap">Chance of each total</p>
          <div class="av-chart" id="avChart"></div>
          <div class="av-ticks" id="avChartT"></div>
          <p class="av-note">Each bar is the exact probability of that total. The dashed line is the average.</p>`,
  mlab: 'Average roll', lab: 'Average roll', emptySub: 'Enter the number of dice and sides.',
  related: [pill('/average-calculator/', 'Average Calculator', icons.hub), pill('/random-number-generator/', 'Random Number Generator', '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/>'), pill('/percentage-calculator/', 'Percentage Calculator', icons.pct), pill('/standard-deviation-calculator/', 'Standard Deviation Calculator', icons.sd)],
  left: `        <h2>How to use the dice average calculator</h2>
        <p>Enter the <strong>number of dice</strong> and the <strong>sides</strong> (tap a chip for d4 to d100), plus an optional <strong>modifier</strong> such as +3. The big number is the average roll; the chart shows the exact probability of every possible total, with the average marked. Enter a <strong>target total</strong> to see the chance of rolling exactly that, that or more, and that or less.</p>
        <p>Open <strong>Go advanced</strong> for keep-highest and keep-lowest rules — or tap <strong>Advantage</strong>, <strong>Disadvantage</strong> or <strong>4d6 drop low</strong> to set them up for you.</p>

        <h2>The dice average formula</h2>
        <div class="formula">
          Average of one die = (sides + 1) ÷ 2
          <small>AVERAGE OF N DICE = N × (SIDES + 1) ÷ 2, PLUS THE MODIFIER</small>
        </div>
        <p>A d6 averages (6 + 1) ÷ 2 = 3.5, so 2d6 averages 2 × 3.5 = <strong>${rr(d2.mean, 2)}</strong> and 2d6+3 averages <strong>${rr(d2p3.mean, 2)}</strong>. A d20 averages ${rr(d20.mean, 2)}, and 3d6 averages ${rr(d3.mean, 2)}.</p>

        <h2>Average of one die</h2>
        <table class="dtable">
          <thead><tr><th>Die</th><th>Range</th><th>Average</th></tr></thead>
          <tbody>${[4, 6, 8, 10, 12, 20, 100].map((s) => '<tr><td>d' + s + '</td><td>1–' + s + '</td><td>' + (s + 1) / 2 + '</td></tr>').join('')}</tbody>
        </table>`,
  right: `        <h2>Advantage, disadvantage and drop lowest</h2>
        <p>With <strong>advantage</strong> you roll 2d20 and keep the higher one; the average rises from ${rr(d20.mean, 2)} to <strong>${rr(dadv.mean, 3)}</strong>, and the chance of rolling 15 or more goes from ${pct1(pg15a)} to ${pct1(pg15b)}. With <strong>disadvantage</strong> you keep the lower: the average falls to <strong>${rr(ddis.mean, 3)}</strong>. Rolling 4d6 and dropping the lowest averages <strong>${rr(d46.mean, 3)}</strong> instead of 14 for plain 4d6 — the usual way to roll ability scores.</p>

        <h2>Why 7 is the most likely roll on 2d6</h2>
        <p>There are 36 equally likely pairs; six of them add up to 7, but only one makes 2 and one makes 12. So 7 comes up ${pct1(6 / 36)} of the time, and the chance of 10 or more is ${pct1(pg10)} (6 of 36). The more dice you add, the more the totals bunch into a bell shape around the average — the chart shows it.</p>
        <p>The calculator computes the exact odds by counting every combination, not by simulation, so the percentages never wobble between runs. It covers the average, extremes and target odds; it does not cover odds such as "exactly two sixes among five dice". For the average of any list of numbers use the <a href="/average-calculator/">average calculator</a>, or roll for real with the <a href="/random-number-generator/">random number generator</a>.</p>`,
  faqs: [
    ['How do you calculate the average of dice?', `The average of one die is (sides + 1) ÷ 2. Multiply by the number of dice and add the modifier. For 2d6+3: 2 × 3.5 + 3 = ${rr(d2p3.mean, 2)}.`],
    ['What is the average roll of 2d6?', `${rr(d2.mean, 2)}. The most likely total is also 7 (${pct1(6 / 36)} of rolls), and the chance of 10 or more is ${pct1(pg10)}.`],
    ['What is the average of a d20 with advantage?', `${rr(dadv.mean, 3)} (roll two d20 and keep the higher), compared with ${rr(d20.mean, 2)} for a single d20. With disadvantage it is ${rr(ddis.mean, 3)}.`],
    ['What is the average of 4d6 drop the lowest?', `${rr(d46.mean, 3)}. Plain 4d6 averages 14, and dropping the lowest die removes about ${rr(14 - d46.mean, 2)} points on average from the sum of the four.`],
    ['How do I find the chance of rolling a target number or higher?', `Type the target in the Target total box. The calculator counts every combination and shows the chance of exactly that total, that or more, and that or less — for example 10 or more on 2d6 is ${pct1(pg10)}.`],
    ['Is the dice average the same as the most likely roll?', `For most dice sets, yes or very close — the distribution is symmetric. With keep-highest or keep-lowest rules it is not: 2d20 keep highest averages ${rr(dadv.mean, 3)}, but the most likely single total is 20.`],
    ['How many dice and sides can I use?', `Up to 100 dice with up to 100 sides each, plus a modifier. Keep-highest and keep-lowest rules work with up to 12 dice.`]
  ]
});

/* ===== TIME ===== */
PAGES.push({
  slug: 'time-average-calculator', kind: 'time', h1: 'Time Average Calculator', eyebrow: 'Durations · clock times',
  title: 'Time Average Calculator — Average Duration & Clock Time',
  desc: 'Free time average calculator: average durations like 1:30:45 or 2h 15m, or average clock times such as bedtimes correctly across midnight.',
  hero: `Average a list of <strong>durations</strong> (lap times, work hours, run times) <em>or</em> <strong>clock times</strong> (bedtimes, arrival times) — clock times are averaged correctly <strong>across midnight</strong>. 1:30:45, 2h 15m, 45 min and 95 s average <strong>${fmtDur(durAvg)}</strong>.`,
  appDesc: 'Time average calculator: average any list of durations (1:30:45, 2h 15m, 45 min, 95 s) with total, median, shortest and longest and a bar for each, or average clock times such as bedtimes correctly across midnight with the earliest, latest and spread.',
  cat: 'Math', iconPath: icons.time,
  cardText: 'Average a list of durations like 1:30:45 or 2h 15m — or average clock times such as bedtimes correctly across midnight.',
  llms: 'Free time average calculator: average durations (1:30:45, 2h 15m, 45 min, 95 s) with total, median and a bar per time, or average clock times such as bedtimes correctly across midnight.',
  aboutLabel: 'Time average', aboutDesc: ' — average durations and clock times',
  input: `        <h2 class="card-h2">Your times</h2>
        <div class="modeseg" id="avModeSeg" role="group" aria-label="Average of" style="grid-template-columns:1fr 1fr;margin-bottom:12px"><button class="on" type="button" data-v="dur">Durations</button><button type="button" data-v="clock">Clock times</button></div>
        <div id="avFmtWrap">${seg2('avFmtSeg', 'Read 1:30 as', 'hm', 'ms', 'h:mm', 'm:ss')}</div>
        <div id="avApWrap" style="display:none">${seg2('avApSeg', 'No am/pm means', 'am', 'pm', 'AM', 'PM')}</div>
        <div id="avDispWrap" style="display:none">${seg2('avDispSeg', 'Show as', '12', '24', '12-hour', '24-hour')}</div>
        <label class="av-lab" for="avData" id="avDataLab">Durations (one per line, or separated by commas)</label>
        <textarea class="av-ta" id="avData" aria-label="Times" spellcheck="false"></textarea>
        <p class="av-note" id="avNote"></p>
        ${hintEl}
        <div id="avAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div id="avRndWrap" class="ctl-row" style="display:block;margin-bottom:12px">
            <span class="ctl-lab" style="display:block;margin-bottom:6px">Round the average to</span>
            <div class="modeseg" id="avRndSeg" role="group" aria-label="Round the average to" style="grid-template-columns:1fr 1fr 1fr"><button class="on" type="button" data-v="exact">Exact</button><button type="button" data-v="sec">Second</button><button type="button" data-v="min">Minute</button></div>
          </div>
          <p class="av-note">Below the results you also get every time compared with the average.</p>
        </div>
${advBtn}`,
  viz: `          <p class="bm-h" id="avVizCap">Your times</p>
          <div id="avViz"></div>`,
  mlab: 'Average time', lab: 'Average time', emptySub: 'Enter at least one time.',
  related: [pill('/average-calculator/', 'Average Calculator', icons.hub), pill('/time-calculator/', 'Time Calculator', icons.time), pill('/hours-calculator/', 'Hours Calculator', icons.time), pill('/sleep-calculator/', 'Sleep Calculator', '<path d="M20 14a8 8 0 1 1-8.5-10A6.5 6.5 0 0 0 20 14z"/>')],
  left: `        <h2>How to use the time average calculator</h2>
        <p>Choose <strong>Durations</strong> or <strong>Clock times</strong>, then type or paste one time per line (or separate them with commas). Durations can be written as <strong>1:30:45</strong>, <strong>2h 15m</strong>, <strong>45 min</strong>, <strong>95 s</strong> or a bare number. Set "Read 1:30 as" to h:mm (hours and minutes) or m:ss (minutes and seconds, handy for lap times).</p>
        <p>You get the average, the total, the median, the shortest and longest, the average as decimal hours, minutes and seconds, and a bar for every time with the average marked. Under <strong>Go advanced</strong> you can round the average and see every time compared with it.</p>

        <h2>The average time formula</h2>
        <div class="formula">
          Average time = total time ÷ number of times
          <small>CONVERT EVERYTHING TO SECONDS, ADD, DIVIDE, CONVERT BACK</small>
        </div>
        <p>1:30:45 is ${dur.vals[0].s} seconds, 2h 15m is ${dur.vals[1].s}, 45 min is ${dur.vals[2].s} and 95 s is ${dur.vals[3].s}. Together they are ${durSum} seconds (${fmtDur(durSum)}), and ${durSum} ÷ ${dur.vals.length} = ${durAvg} seconds, which is <strong>${fmtDur(durAvg)}</strong>.</p>`,
  right: `        <h2>Averaging clock times across midnight</h2>
        <p>Clock times are not ordinary numbers: 11:30 PM and 12:30 AM are only an hour apart, but a plain average of the clock numbers puts them at about noon. The calculator treats the clock as a circle and averages the <em>direction</em> each time points to, so it handles midnight correctly.</p>
        <p>For ${clk.vals.map((v) => v.t).join(', ')} the average is <strong>${fmtClock(cmean.mean)}</strong> — a plain average would give ${fmtClock(carith)}. For 10:30 PM, 11:15 PM, 11:45 PM and 12:30 AM the average is ${fmtClock(clk2.mean)}. You also get the earliest and latest time relative to the average and the total spread — useful for average bedtimes, wake-up times or arrival times.</p>

        <h2>Durations vs clock times</h2>
        <ul>
          <li><strong>Durations</strong> are lengths of time (a 1:30:45 run, a 45-minute meeting). They add up, so the average is simply the total divided by the count.</li>
          <li><strong>Clock times</strong> are points on the day (11:30 PM). They wrap around, so the average needs the circular method above.</li>
        </ul>
        <p>Times without am/pm count as AM or PM as you choose; 24-hour times such as 23:30 are read as they are. To add or subtract times use the <a href="/time-calculator/">time calculator</a>, to total a work week the <a href="/hours-calculator/">hours calculator</a>, and for the average of any other numbers the <a href="/average-calculator/">average calculator</a>.</p>`,
  faqs: [
    ['How do you calculate the average of several times?', `Convert each time to seconds, add them up, divide by how many there are, and convert back. 1:30:45, 2h 15m, 45 min and 95 s total ${fmtDur(durSum)}, and ${fmtDur(durSum)} ÷ ${dur.vals.length} = ${fmtDur(durAvg)}.`],
    ['What time formats can I enter?', `Durations: 1:30:45, 1:30 (read as h:mm or m:ss — you choose), 2h 15m, 45 min, 95 s, 1.5h, or a bare number (minutes in h:mm mode, seconds in m:ss mode). Clock times: 11:30 pm, 11pm, 23:30, 0:15.`],
    ['How do I average bedtimes that cross midnight?', `Switch to Clock times and enter them. The calculator averages the position on the clock rather than the numbers, so 11:30 PM and 12:30 AM average to midnight, not noon.`],
    ['What is the difference between average time and total time?', `Total time is all the times added together; average time is that total divided by the number of times. Both are shown, along with the median, shortest and longest.`],
    ['Can I average lap or race times?', `Yes. Set "Read 1:30 as" to m:ss so that 1:30 means 1 minute 30 seconds, then list the lap times. Decimal seconds such as 1:30.25 also work.`],
    ['How do I convert the average to hours or minutes?', `The table shows the average as decimal hours, minutes and seconds — for example ${rr(durAvg / 3600, 4)} hours or ${rr(durAvg / 60, 3)} minutes for the example list.`],
    ['Can I average times that are spread all around the clock?', `If the times point evenly around the day (for example 12:00 AM, 6:00 AM, 12:00 PM and 6:00 PM) there is no meaningful average, and the calculator says so rather than showing a misleading time.`]
  ]
});

/* ---------- page writer ---------- */
function pageHtml(P) {
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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.h1, url, applicationCategory: P.cat === 'Finance' ? 'FinanceApplication' : 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.appDesc };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.h1, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
  const body = `<body class="p-bmr p-avg">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">${P.eyebrow}</div>
    <h1>${P.h1}</h1>
    <p>${P.hero}</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
${P.input}
      </div>
    </div>

${resultCard(P.lab, P.emptySub, P.viz)}

  </div>

  <!-- mobile sticky bar -->
${mbar(P.mlab)}

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${P.related.join('\n')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
${P.left}
      </div>

      <div>
${P.right}
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${P.faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=276"></script>
<script>CalcThis.initAvgCalc('${P.kind}');</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log('page', P.slug, 'title', P.title.length, 'desc', P.desc.length);
}
PAGES.forEach(pageHtml);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const U = (P) => 'https://calcthis.co/' + P.slug + '/';
edit('sitemap.xml', (sm) => { PAGES.forEach((P) => { if (!sm.includes('<loc>' + U(P) + '</loc>')) sm = sm.replace('</urlset>', () => '  <url>\n    <loc>' + U(P) + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' + (P.kind === 'hub' ? '0.9' : '0.8') + '</priority>\n  </url>\n</urlset>'); }); return sm; });
edit('build.js', (s) => { PAGES.forEach((P) => { if (!s.includes("slug: '/" + P.slug + "/'")) s = s.replace("  { file: 'weighted-average-calculator/index.html', slug: '/weighted-average-calculator/' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '/" + P.slug + "/' },\n"); }); return s; });
edit('llms.txt', (lt) => { PAGES.forEach((P) => { if (!lt.includes('/' + P.slug + '/')) lt = lt.replace(/(- \[Weighted Average Calculator[^\n]*\n)/, (mm) => mm + '- [' + P.title + '](' + U(P) + '): ' + P.llms + '\n'); }); return lt; });
edit('partials/header.html', (s) => { PAGES.forEach((P) => { const lab = P.kind === 'hub' ? 'Average' : P.h1.replace(' Calculator', ''); if (!s.includes('href="/' + P.slug + '/"')) s = s.replace('          <a href="/weighted-average-calculator/">Weighted Average</a>\n', (mm) => '          <a href="/' + P.slug + '/">' + lab + '</a>\n' + mm); }); return s; });
edit('partials/footer.html', (s) => { PAGES.slice().reverse().forEach((P) => { if (!s.includes('href="/' + P.slug + '/"')) s = s.replace('          <li><a href="/weighted-average-calculator/">Weighted Average Calculator</a></li>\n', (mm) => mm + '          <li><a href="/' + P.slug + '/">' + P.h1 + '</a></li>\n'); }); return s; });
edit('md-files/seo-meta-hand.json', (s) => { PAGES.forEach((P) => { if (!s.includes('"/' + P.slug + '/"')) s = s.replace('  "/weighted-average-calculator/": {', () => '  "/' + P.slug + '/": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/weighted-average-calculator/": {'); }); return s; });
edit('index.html', (h) => {
  PAGES.forEach((P) => {
    if (!h.includes('"name": "' + P.h1 + '"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Weighted Average Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.h1 + '", "url": "' + U(P) + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.h1 + '</h3>')) {
      const card = `    <a class="calc" href="/${P.slug}/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8F5C13" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${P.iconPath}</svg>
      </span>
      <h3>${P.h1}</h3>
      <p>${P.cardText}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="/weighted-average-calculator/">', () => card + '    <a class="calc" href="/weighted-average-calculator/">');
    }
    if (!h.includes('<a href="/' + P.slug + '/">' + P.aboutLabel + '</a><span>')) h = h.replace(/(          <li><a href="\/weighted-average-calculator\/">Weighted average<\/a><span>[^\n]*\n)/, (mm) => '          <li><a href="/' + P.slug + '/">' + P.aboutLabel + '</a><span>' + P.aboutDesc + '</span></li>\n' + mm);
  });
  return h;
});
