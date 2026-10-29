const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Rewrites the homepage "Calculators that do one thing well" block (index.html, between <!--ABOUT:START--> and <!--ABOUT:END-->)
   as scannable category cards: an icon, a one-line summary and a list of every tool with a short description (all crawlable links).
   Run: node md-files/gen-home-about.js   (idempotent). Add a calculator = add a line to its category below. */
const ic = (p) => '<svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">' + p + '</svg>';
const ICONS = {
  construction: ic('<path d="M4 26h24M7 26V13l9-7 9 7v13" stroke="#8F5C13" stroke-width="1.6" stroke-linejoin="round" fill="#EFE7D8"/><path d="M13 26v-7h6v7" stroke="#37503F" stroke-width="1.6" stroke-linejoin="round"/>'),
  health: ic('<path d="M16 27C8 21 5 16.5 5 12.5A6 6 0 0 1 16 9a6 6 0 0 1 11 3.5C27 16.5 24 21 16 27z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 16h4l2-4 3 7 2-3h5" stroke="#B5761F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  school: ic('<path d="M3 12l13-6 13 6-13 6z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 15v6c0 2 4 4 8 4s8-2 8-4v-6M29 12v8" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>'),
  math: ic('<rect x="5" y="4" width="22" height="24" rx="3" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6"/><path d="M10 10h12" stroke="#B5761F" stroke-width="2" stroke-linecap="round"/><path d="M11 16h3M18 16h3M11 22h3M18 22h3" stroke="#37503F" stroke-width="2" stroke-linecap="round"/>'),
  kitchen: ic('<path d="M6 14h20v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 14h24M3 18h3M26 18h3" stroke="#8F5C13" stroke-width="1.6" stroke-linecap="round"/><path d="M12 4.5c-1.5 2 1.5 3 0 5M17 4.5c-1.5 2 1.5 3 0 5M22 4.5c-1.5 2 1.5 3 0 5" stroke="#B5761F" stroke-width="1.6" stroke-linecap="round"/>'),
  money: ic('<circle cx="16" cy="16" r="12" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6"/><path d="M19.5 11.5c-.8-1.2-2-1.8-3.5-1.8-2 0-3.3 1-3.3 2.6 0 3.7 7 1.8 7 5.5 0 1.6-1.4 2.7-3.4 2.7-1.7 0-3-.7-3.8-2M16 7.5v2.2M16 22.3v2.2" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>'),
  units: ic('<rect x="3" y="10" width="26" height="12" rx="2.5" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6"/><path d="M8 10v5M12 10v3M16 10v5M20 10v3M24 10v5" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>'),
  bolt: ic('<path d="M18 3L7 18h8l-2 11 11-15h-8z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6" stroke-linejoin="round"/>'),
  free: ic('<path d="M16 4l3.5 7.2 7.9 1.1-5.7 5.6 1.3 7.9L16 22l-7 3.8 1.3-7.9-5.7-5.6 7.9-1.1z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.6" stroke-linejoin="round"/>')
};
const CATS = [
  { k: 'construction', h: 'Construction & gardening', p: 'Thirteen estimating jobs for the lumber yard, garden centre and paint aisle. Every tool keeps a running project total, so you can add several boards, areas or beds and price the whole job at once — with a waste factor so you order enough the first time.', items: [
    ['/board-foot-calculator/', 'Board foot', 'lumber and cost for a cut list'], ['/gravel-calculator/', 'Gravel', 'tons or bags for a driveway or path'], ['/sand-calculator/', 'Sand', 'a paver base or leveling job'],
    ['/topsoil-calculator/', 'Topsoil', 'a lawn or raised bed, by yard or bag'], ['/mulch-calculator/', 'Mulch', 'garden beds'], ['/concrete-calculator/', 'Concrete', 'bags for a slab or footing'],
    ['/flooring-calculator/', 'Flooring', 'boxes for a room'], ['/tile-calculator/', 'Tile', 'a floor, wall or backsplash'], ['/square-footage-calculator/', 'Square footage', '13 shapes with a live diagram'],
    ['/tape-measure-fraction-calculator/', 'Tape measure fractions', 'feet, inches and fractions on a live ruler'], ['/stair-calculator/', 'Stairs', 'rise, run, stringer length and a materials estimate'],
    ['/paint-calculator/', 'Paint', 'cans to buy, leftover and cost'], ['/wallpaper-calculator/', 'Wallpaper', 'rolls counted in whole strips']] },
  { k: 'health', h: 'Health & fitness', p: 'Twenty tools for training, body measurements and nutrition, most with a live gauge, chart or scale so you see where you stand and not just a number.', items: [
    ['/pace-calculator/', 'Running pace', 'pace, time or distance'], ['/race-time-predictor/', 'Race time predictor', '5K to marathon from one race'], ['/vo2-max-calculator/', 'VO2 max', 'aerobic fitness on an age and sex gauge'],
    ['/heart-rate-zone-calculator/', 'Heart rate zones', 'your five training zones'], ['/zone-2-heart-rate-calculator/', 'Zone 2 heart rate', 'your aerobic base range'], ['/bmi-calculator/', 'BMI', 'category scale and healthy weight range'],
    ['/body-fat-calculator/', 'Body fat', 'the US Navy tape method'], ['/ideal-weight-calculator/', 'Ideal weight', 'four formulas on one scale'], ['/lean-body-mass-calculator/', 'Lean body mass', 'lean-versus-fat composition'],
    ['/waist-to-hip-ratio-calculator/', 'Waist-to-hip ratio', 'a sex-specific health-risk gauge'], ['/calorie-calculator/', 'Calories', 'a daily target for a goal weight'], ['/bmr-calculator/', 'BMR', 'five formulas on one scale'],
    ['/tdee-calculator/', 'TDEE', 'maintenance calories and macros'], ['/one-rep-max-calculator/', 'One rep max', 'a full training table'], ['/sleep-calculator/', 'Sleep cycles', 'ideal bedtimes and wake-up times'],
    ['/water-intake-calculator/', 'Water intake', 'a glass-by-glass daily plan'], ['/macro-calculator/', 'Macros', 'protein, carb and fat targets'], ['/protein-intake-calculator/', 'Protein intake', 'a daily target with food equivalents'],
    ['/steps-to-miles-calculator/', 'Steps to miles', 'distance from your own stride'], ['/peptide-reconstitution-calculator/', 'Peptide reconstitution', 'exact syringe draw units']] },
  { k: 'school', h: 'School & grades', p: 'Find out what you need on the final, work out your GPA, and curve a whole class in one go.', items: [
    ['/final-grade-calculator/', 'Final grade', 'the score you need to hit your target'], ['/gpa-calculator/', 'GPA', 'college and high school, weighted or not'], ['/grade-calculator/', 'Grade', 'weighted course grades'],
    ['/test-score-calculator/', 'Test score', 'percentage, letter grade and AP score'], ['/grade-curve-calculator/', 'Grade curve', 'curve a class with a before and after chart']] },
  { k: 'math', h: 'Math & numbers', p: 'Everyday math with step-by-step working and a live picture of what is happening.', items: [
    ['/fraction-calculator/', 'Fractions', 'any number of fractions, with a bar diagram'], ['/standard-deviation-calculator/', 'Standard deviation', 'sample and population side by side'], ['/scientific-notation-calculator/', 'Scientific notation', 'every notation at once'],
    ['/weighted-average-calculator/', 'Weighted average', 'with a contribution bar'], ['/ratio-calculator/', 'Ratio', 'solve for the missing value'], ['/percentage-calculator/', 'Percentage', 'the common percent questions'],
    ['/age-calculator/', 'Age', 'exact years, months and days'], ['/date-calculator/', 'Date', 'days between dates, or add and subtract'], ['/time-calculator/', 'Time', 'elapsed time, durations and time cards'],
    ['/hours-calculator/', 'Hours', 'shifts, breaks, overtime and pay'], ['/triangle-calculator/', 'Triangle', 'solved and drawn to scale']] },
  { k: 'kitchen', h: 'Cooking & kitchen', p: 'Scale a recipe, convert measures the way a kitchen reads them, and plan the turkey backwards from dinner time.', items: [
    ['/recipe-converter/', 'Recipe converter', 'scale servings, cups to grams'], ['/turkey-cooking-time-calculator/', 'Turkey cooking time', 'oven, roaster, grill, smoker or fryer'], ['/turkey-thawing-time-calculator/', 'Turkey thawing time', 'fridge or cold water'], ['/turkey-size-calculator/', 'Turkey size', 'how big a bird for your guests'],
    ['/cooking-converter/', 'Cooking converter', 'cups, grams, mL and oven temperatures']] },
  { k: 'money', h: 'Money & finance', p: 'Payments, take-home pay and tax, with charts that show where the money goes.', items: [
    ['/mortgage-calculator/', 'Mortgage', 'payment, balance chart and extra payments'], ['/loan-calculator/', 'Loan', 'any frequency, true APR with fees'], ['/auto-loan-calculator/', 'Auto loan', 'trade-in, tax and fees'],
    ['/paycheck-calculator/', 'Paycheck', 'take-home pay after federal and state tax'], ['/sales-tax-calculator/', 'Sales tax', 'by state, with exempt items and local rates']] },
  { k: 'units', h: 'Unit converters', p: 'One converter per job, with every unit of the family shown at once.', items: [
    ['/unit-converter/', 'All unit converters', 'start here'], ['/length-converter/', 'Length', 'inches, cm, feet, meters, miles'], ['/weight-converter/', 'Weight', 'kg, pounds, ounces, stone'], ['/volume-converter/', 'Volume', 'liters, gallons, cups'],
    ['/temperature-converter/', 'Temperature', 'Celsius, Fahrenheit, Kelvin'], ['/area-converter/', 'Area', 'square feet, acres, hectares'], ['/speed-converter/', 'Speed', 'mph, km/h, knots'], ['/data-storage-converter/', 'Data storage', 'MB, GB, TB, GiB'], ['/px-to-rem-converter/', 'PX to REM', 'CSS units with your root size']] }
];
const esc = (t) => t.replace(/&/g, '&amp;');
const card = (c) => `      <article class="about-cat">
        <div class="about-head"><span class="about-ico">${ICONS[c.k]}</span><h3>${esc(c.h)}</h3></div>
        <p>${esc(c.p)}</p>
        <ul class="about-list">
${c.items.map((i) => `          <li><a href="${i[0]}">${esc(i[1])}</a><span> — ${esc(i[2])}</span></li>`).join('\n')}
        </ul>
      </article>`;
const html = `<!--ABOUT:START-->
  <section class="about">
    <h2>Calculators that do one thing well</h2>
    <p class="about-lead">Most calculator sites are huge libraries where every tool is a compromise — a generic form bolted onto a shared template. <strong>CalcThis takes the opposite approach.</strong></p>
    <p class="about-lead">Each calculator is built around one real-world task, so the inputs match how you actually measure and the results come out in the units your supplier sells by. It works the instant you type — no compute button, no account, no clutter.</p>

    <div class="about-grid">
${CATS.map(card).join('\n')}
    </div>

    <div class="about-why">
      <div><span class="about-ico">${ICONS.bolt}</span><h3>Why single-purpose beats all-in-one</h3><p>A dedicated tool can make choices a general calculator can't: sensible defaults, the exact options people really use, unit handling that matches the trade, and a layout tuned for one job on a phone at the lumber yard or garden centre. <strong>Fast, accurate and purpose-built</strong>, one calculator at a time.</p></div>
      <div><span class="about-ico">${ICONS.free}</span><h3>Free, instant, no sign-up</h3><p>Every calculator on CalcThis is free, needs no account, and runs entirely in your browser. Pick the one you need above and get your answer in seconds.</p></div>
    </div>
  </section>
<!--ABOUT:END-->`;
const f = ROOT + 'index.html';
let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
if (s.includes('<!--ABOUT:START-->')) s = s.replace(/<!--ABOUT:START-->[\s\S]*?<!--ABOUT:END-->/, () => html);
else { const a = s.indexOf('<section class="prose">'), b = s.indexOf('</section>', a) + '</section>'.length; if (a < 0) throw new Error('prose not found'); s = s.slice(0, a) + html + s.slice(b); }
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('homepage About block written (' + CATS.reduce((n, c) => n + c.items.length, 0) + ' links)');
