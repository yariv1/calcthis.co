/* Generates /whats-new/ (release log + corrections). Copies the About page shell (header/footer markers, p-legal) and replaces head + main.
   Add a new entry at the TOP of ENTRIES for every release, then run: node md-files/gen-whatsnew-page.js && node build.js */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..') + path.sep;
const A = (slug, name) => { if (!fs.existsSync(ROOT + slug + '/index.html')) throw new Error('missing page ' + slug); return '<a href="/' + slug + '/">' + name + '</a>'; };
const ENTRIES = [
  ['2026-11-22', 'November 22, 2026', [
    'New: ' + A('dilution-calculator', 'Dilution Calculator') + ' — concentrate and water for any strength, ratio (1:10, 1 in 10, 10x) or factor, in percent, ppm, mg/mL, molar or fold units, with a flask drawn to scale, the mixing order and the same batch at other ratios.',
    'Fixed: on the ' + A('mg-to-ml-calculator', 'mg to mL Calculator') + ', the error message under the volume box now sits under the whole row instead of half the width.',
    'Changed: the menu group Medication &amp; Dosage is now called Medication &amp; Lab; it holds the mg to mL, dilution and peptide reconstitution calculators.',
  ]],
  ['2026-11-21', 'November 21, 2026', [
    'New: ' + A('mg-to-ml-calculator', 'mg to mL Calculator') + ' — type a dose and the strength printed on the label and see the milliliters on a to-scale syringe, with mL to mg, strength, teaspoons, tablespoons and label strengths read on DailyMed.',
    'New: a Medication &amp; Dosage group in the menu, with the mg to mL calculator and the peptide reconstitution calculator.',
  ]],
  ['2026-11-20', 'November 20, 2026', [
    'Improved: the contact address is now help@calcthis.co on every page, and the feedback button and contact form send to it.',
  ]],
  ['2026-11-14', 'November 14, 2026', [
    'New: ' + A('amortization-calculator', 'Amortization Calculator') + ' — a chart of every payment split into principal and interest, ten payment frequencies, extra payments and a full schedule.',
  ]],
  ['2026-11-13', 'November 13, 2026', [
    'New: ' + A('compound-interest-calculator', 'Compound Interest Calculator') + ' and ' + A('z-score-calculator', 'Z-Score Calculator') + '.',
  ]],
  ['2026-11-12', 'November 12, 2026', [
    'Improved: the 18 unit-conversion pages (for example ' + A('cm-to-inches', 'cm to inches') + ' and ' + A('kg-to-lbs', 'kg to lbs') + ') now have a worked example, a mental shortcut with its measured error, common mistakes and a longer reference table. Definitions come from NIST publications read on this date.',
  ]],
  ['2026-11-11', 'November 11, 2026', [
    'Correction: the ' + A('paycheck-calculator/alaska', 'Alaska paycheck calculator') + ' now withholds the employee unemployment-insurance share (0.50% of wages up to $54,200, at most $271 a year). It was missing before.',
    'Improved: the paycheck pages for states without a wage income tax explain what still comes out of pay; the pages for taxed states show take-home pay at the state minimum wage (US Department of Labor table updated November 5, 2026).',
    'Improved: the random-number pages for 1-3, 1-10, 1-13 and 1-100 now show the average, the spread and the odds of repeats, calculated exactly.',
  ]],
  ['2026-11-10', 'November 10, 2026', [
    'New: ' + A('p-value-calculator', 'P-Value Calculator') + ', ' + A('confidence-interval-calculator', 'Confidence Interval Calculator') + ', ' + A('seconds-to-hours-calculator', 'Seconds to Hours') + ', ' + A('minutes-to-hours-calculator', 'Minutes to Hours') + ' and ' + A('seconds-to-minutes-calculator', 'Seconds to Minutes') + ' calculators.',
  ]],
  ['2026-11-09', 'November 9, 2026', [
    'New: ' + A('unit-price-calculator', 'Unit Price Calculator') + ' — compare products by price per unit and see the best buy.',
    'Improved: twelve existing calculators gained options that other well-known calculators offer.',
  ]],
  ['2026-11-08', 'November 8, 2026', [
    'New: ' + A('markup-calculator', 'Markup') + ', ' + A('profit-margin-calculator', 'Profit Margin') + ', ' + A('discount-calculator', 'Discount') + ', ' + A('commission-calculator', 'Commission') + ' and ' + A('realtor-commission-calculator', 'Realtor Commission') + ' calculators.',
    'Improved: money fields show the currency symbol inside the box, and results follow the same symbol and side as the chosen currency.',
  ]],
  ['2026-11-07', 'November 7, 2026', [
    'New: ' + A('caffeine-calculator', 'Caffeine Calculator') + ', ' + A('caffeine-half-life-calculator', 'Caffeine Half Life') + ', ' + A('fiber-calculator', 'Fiber') + ', ' + A('creatine-calculator', 'Creatine') + ', ' + A('vitamin-d-calculator', 'Vitamin D') + ' and ' + A('body-recomposition-calculator', 'Body Recomposition') + ' calculators.',
    'Improved: a field that depends on another now says so when the other one is empty, instead of staying silent (FFMI, dog food, caffeine half life, fiber, keto, net carbs, calories burned).',
  ]],
  ['2026-11-06', 'November 6, 2026', [
    'New: ' + A('weight-loss-calculator', 'Weight Loss Calculator by Date') + ', ' + A('weight-loss-percentage-calculator', 'Weight Loss Percentage') + ', ' + A('max-heart-rate-calculator', 'Max Heart Rate') + ', ' + A('bulking-calculator', 'Bulking') + ' and ' + A('ffmi-calculator', 'FFMI') + ' calculators.',
  ]],
  ['2026-11-05', 'November 5, 2026', [
    'New: ' + A('dog-food-calculator', 'Dog Food') + ', ' + A('bsa-calculator', 'Body Surface Area') + ', ' + A('intermittent-fasting-calculator', 'Intermittent Fasting') + ', ' + A('keto-calculator', 'Keto') + ', ' + A('net-carb-calculator', 'Net Carb') + ' and ' + A('calories-burned-calculator', 'Calories Burned') + ' calculators.',
  ]],
];
const TITLE = 'What’s New on CalcThis — Updates and Corrections';
const DESC = 'A dated list of the calculators, features and corrections added to CalcThis, newest first, including every fix to a published number.';
const URL = 'https://calcthis.co/whats-new/';
let html = fs.readFileSync(ROOT + 'about/index.html', 'utf8');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
html = html.replace(/<title>[^<]*<\/title>/, '<title>' + esc(TITLE) + '</title>')
  .replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + URL + '$2')
  .replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + esc(TITLE) + '$2').replace(/(<meta name="twitter:title" content=")[^"]*(")/, '$1' + esc(TITLE) + '$2')
  .replace(/(<meta name="description" content=")[^"]*(")/, '$1' + esc(DESC) + '$2').replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + esc(DESC) + '$2').replace(/(<meta name="twitter:description" content=")[^"]*(")/, '$1' + esc(DESC) + '$2')
  .replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + URL + '$2')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">\n' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: TITLE.replace(/’/g, "'"), url: URL, description: DESC, inLanguage: 'en-US', isPartOf: { '@type': 'WebSite', name: 'CalcThis', url: 'https://calcthis.co/' } }, null, 2) + '\n</script>');
const main = '<main class="legal-page">\n  <div class="legal-content">\n    <h1>What’s new on CalcThis</h1>\n    <p>Every calculator, improvement and correction, newest first. If you find a wrong number, write to <a href="mailto:help@calcthis.co">help@calcthis.co</a>; fixes to published numbers are listed here as corrections.</p>\n' +
  ENTRIES.map((e) => '\n    <h2><time datetime="' + e[0] + '">' + e[1] + '</time></h2>\n    <ul>\n' + e[2].map((x) => '      <li>' + x + '</li>').join('\n') + '\n    </ul>').join('\n') + '\n  </div>\n</main>';
html = html.replace(/<main class="legal-page">[\s\S]*?<\/main>/, main);
fs.mkdirSync(ROOT + 'whats-new', { recursive: true });
fs.writeFileSync(ROOT + 'whats-new/index.html', html);
console.log('ok whats-new', html.length);
