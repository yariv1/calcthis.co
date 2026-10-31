const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates the Unit Converter hub (/unit-converter/) and every category converter (length, weight, volume, temperature, area, speed,
   data storage, cooking, px/rem), and registers them (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage tab + hasPart).
   Every number in the SEO text comes from CalcThis.unitEngine in assets/app.js. Run: node md-files/gen-unit-pages.js   then   node build.js
   Adding a pair page later (e.g. /cm-to-inches/): add it to PAIRS below. */
global.CalcThis = {};
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
eval(app.slice(app.indexOf('/* UNIT-ENGINE:START */'), app.indexOf('/* UNIT-ENGINE:END */')));
const E = CalcThis.unitEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const auto = nl(fs.readFileSync(ROOT + 'auto-loan-calculator/index.html', 'utf8'));
const hdr = auto.slice(auto.indexOf('<!--HEADER:START-->'), auto.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = auto.slice(auto.indexOf('<!--FOOTER:START-->'), auto.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = auto.slice(0, auto.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const cselEmpty = (id) => `<div class="csel" id="${id}" data-value=""><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val"></span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const fld = (id, label, unit, ph, val) => `<div class="fld"><label class="lab" for="${id}">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</label><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"${val ? ' value="' + val + '"' : ''}></div></div>`;

/* ---------- helpers on the engine ---------- */
const F = (x, p) => E.fmt(x, p || 'auto');
const sym = (cat, id) => E.unit(cat, id).sym;
const nm = (cat, id) => E.unit(cat, id).name;
const withSym = (v, s) => v + (s === '%' || s.charAt(0) === '°' ? '' : ' ') + s;
const cv = (cat, a, b, x, o) => E.convert(cat, a, b, x, o);
const T2 = (x) => String(+x.toFixed(2)).replace('-', '−');
const FF = (cat, x, p) => (cat === 'temperature' ? T2(x) : F(x, p));
const say = (cat, a, b, x, o) => withSym(FF(cat, x), sym(cat, a)) + ' = ' + withSym(FF(cat, cv(cat, a, b, x, o)), sym(cat, b));
const val = (cat, a, b, x, o, p) => withSym(FF(cat, cv(cat, a, b, x, o), p), sym(cat, b));
const one = (cat, a, b, o) => '1 ' + sym(cat, a) + ' = ' + withSym(E.fmt(cv(cat, a, b, 1, o), '10sig'), sym(cat, b));
const CSS = { root: 16, parent: 16, vw: 1920, vh: 1080 };

/* ---------- per-category content ---------- */
const P = {
  length: {
    h1: 'Length Converter', eyebrow: 'Inches, centimeters, feet, meters, miles and more',
    title: 'Length Converter — Inches, cm, Feet, Meters, Miles, km | CalcThis',
    desc: 'Free length converter: inches to cm, feet to meters, miles to km and more. Every unit at once, inches as tape-measure fractions, and a live ruler.',
    hero: 'Convert <strong>inches, centimeters, feet, meters, miles</strong> and more. Type a value and every length unit shows at once — inches also as a tape-measure fraction — with a live ruler for anything up to 32 cm.',
    pairs: [['in', 'cm', [1, 2, 5, 6, 10, 12, 24, 36]], ['cm', 'in', [1, 5, 10, 15, 30, 50, 100, 180]], ['ft', 'm', [1, 2, 3, 5, 6, 10, 50, 100]], ['mi', 'km', [1, 3.1, 5, 10, 13.1, 26.2, 50, 100]]],
    formula: () => `<div class="formula">cm = inches × 2.54<small>INCHES = CM ÷ 2.54 · FEET × 0.3048 = METERS · MILES × 1.609344 = KM</small></div>`,
    steps: () => `<p>Every length unit is defined from the meter, so any conversion is one multiplication. The inch is exactly 2.54 centimeters (the 1959 international yard and pound agreement), the foot is 12 inches, and the mile is 5,280 feet or exactly 1.609344 kilometers. To convert centimeters to inches, divide by 2.54: ${say('length', 'cm', 'in', 180)}, which is ${E.tape(cv('length', 'cm', 'in', 180)).text} in on a tape measure.</p>`,
    faqs: () => [
      ['How many centimeters are in an inch?', `Exactly 2.54. ${say('length', 'in', 'cm', 1)}, ${say('length', 'in', 'cm', 12)} and ${say('length', 'in', 'cm', 36)}. The inch has been defined as 2.54 cm since the international agreement of 1959.`],
      ['How do I convert cm to inches?', `Divide the centimeters by 2.54. ${say('length', 'cm', 'in', 180)} — on a tape measure that is ${E.tape(cv('length', 'cm', 'in', 180)).text} inches, or ${Math.floor(cv('length', 'cm', 'in', 180) / 12)} ft ${E.tape(cv('length', 'cm', 'in', 180) % 12).text} in. Choose inches as the result unit and the tape-measure fraction appears under the answer.`],
      ['How many feet are in a mile?', `5,280 feet, or 1,760 yards: ${say('length', 'mi', 'ft', 1)}. A mile is exactly 1.609344 kilometers.`],
      ['How do I convert miles to kilometers?', `Multiply miles by 1.609344. ${say('length', 'mi', 'km', 26.2)} for a marathon and ${say('length', 'km', 'mi', 10)} for a 10K.`],
      ['What is a nautical mile?', `A nautical mile is exactly 1,852 meters, used in sea and air navigation: ${say('length', 'nmi', 'mi', 1)} and ${say('length', 'nmi', 'km', 1)}.`]
    ],
    related: ['weight', 'volume', 'area', 'temperature']
  },
  weight: {
    h1: 'Weight Converter', eyebrow: 'Kilograms, pounds, ounces, grams, stone and tons',
    title: 'Weight Converter — kg, Pounds, Ounces, Grams, Stone, Tons | CalcThis',
    desc: 'Free weight converter: kg to pounds, ounces to grams, stone to kg and more. Every unit at once, with pounds and ounces split out.',
    hero: 'Convert <strong>kilograms, pounds, ounces, grams, stone and tons</strong>. Type a weight and every unit shows at once — and a result in pounds is also split into pounds and ounces.',
    pairs: [['kg', 'lb', [1, 5, 10, 20, 50, 70, 80, 100]], ['lb', 'kg', [1, 5, 10, 50, 100, 150, 180, 200]], ['oz', 'g', [1, 2, 4, 8, 12, 16, 100]], ['st', 'lb', [1, 8, 10, 11, 12, 14, 15]]],
    formula: () => `<div class="formula">lb = kg × 2.2046226<small>KG = LB × 0.45359237 · G = OZ × 28.349523 · LB = STONE × 14</small></div>`,
    steps: () => `<p>Weight units are all defined from the kilogram. The pound is exactly 0.45359237 kg and the ounce is exactly 1/16 of a pound, 28.349523 g. To go from pounds to kilograms multiply by 0.45359237: ${say('weight', 'lb', 'kg', 150)}. To go the other way multiply by 2.2046226: ${say('weight', 'kg', 'lb', 70)}.</p>`,
    faqs: () => [
      ['How many pounds are in a kilogram?', `${one('weight', 'kg', 'lb')} (rounded). ${say('weight', 'kg', 'lb', 70)}, ${say('weight', 'kg', 'lb', 100)}.`],
      ['How do I convert pounds to kg?', `Multiply pounds by 0.45359237, which is exact. ${say('weight', 'lb', 'kg', 150)} and ${say('weight', 'lb', 'kg', 200)}.`],
      ['How many ounces are in a pound?', `16. ${say('weight', 'lb', 'oz', 1)}, and one ounce is ${say('weight', 'oz', 'g', 1)}.`],
      ['How much is a stone in pounds and kg?', `One stone is 14 pounds: ${say('weight', 'st', 'lb', 1)} = ${withSym(F(cv('weight', 'st', 'kg', 1)), 'kg')}. So 11 stone is ${say('weight', 'st', 'kg', 11)}.`],
      ['What is the difference between a metric ton, a US ton and a long ton?', `A metric ton (tonne) is 1,000 kg = ${withSym(F(cv('weight', 't', 'lb', 1)), 'lb')}. A US (short) ton is ${say('weight', 'ston', 'lb', 1)}, and an imperial (long) ton is ${say('weight', 'lton', 'lb', 1)}.`]
    ],
    related: ['length', 'volume', 'cooking', 'temperature']
  },
  volume: {
    h1: 'Volume Converter', eyebrow: 'Liters, gallons, cups, fluid ounces and more',
    title: 'Volume Converter — Liters, Gallons, Cups, mL, Fluid Ounces | CalcThis',
    desc: 'Free volume converter: gallons to liters, cups to mL, fluid ounces, quarts, pints — US and imperial — with every unit at once.',
    hero: 'Convert <strong>liters, milliliters, gallons, quarts, pints, cups and fluid ounces</strong> — US and imperial side by side, because a US gallon and a UK gallon are not the same. Every unit shows at once.',
    pairs: [['gal', 'l', [1, 2, 5, 10, 15, 20]], ['l', 'gal', [1, 2, 5, 10, 20, 50]], ['cup', 'ml', [0.25, 0.5, 1, 2, 4]], ['floz', 'ml', [1, 2, 4, 8, 12, 16]]],
    formula: () => `<div class="formula">L = US gallons × 3.785411784<small>ML = US CUPS × 236.5882365 · US GAL = 4 QT = 8 PT = 16 CUPS = 128 FL OZ</small></div>`,
    steps: () => `<p>Volume units are defined from the liter. The US gallon is exactly 231 cubic inches, or 3.785411784 liters, and the imperial gallon is exactly 4.54609 liters — about 20% bigger. US measures are built from the gallon: 4 quarts, 8 pints, 16 cups, 128 fluid ounces, 256 tablespoons. Example: ${say('volume', 'gal', 'l', 5)}, but ${say('volume', 'ukgal', 'l', 5)}.</p>`,
    faqs: () => [
      ['How many liters are in a gallon?', `A US gallon is ${withSym(F(cv('volume', 'gal', 'l', 1), '10sig'), 'L')}; an imperial (UK) gallon is ${withSym(F(cv('volume', 'ukgal', 'l', 1)), 'L')}. ${say('volume', 'gal', 'l', 10)}.`],
      ['How many cups are in a gallon?', `16 US cups: ${say('volume', 'gal', 'cup', 1)}. A gallon is also ${say('volume', 'gal', 'qt', 1)}, ${say('volume', 'gal', 'pt', 1)} and ${say('volume', 'gal', 'floz', 1)}.`],
      ['How many mL are in a cup?', `A US cup is ${withSym(F(cv('volume', 'cup', 'ml', 1)), 'mL')}. Metric cups used in the UK, Canada and Australia are 250 mL. ${say('volume', 'cup', 'floz', 1)}, ${say('volume', 'cup', 'tbsp', 1)}.`],
      ['What is the difference between US and imperial pints?', `A US pint is ${withSym(F(cv('volume', 'pt', 'ml', 1)), 'mL')} and an imperial pint is ${withSym(F(cv('volume', 'ukpt', 'ml', 1)), 'mL')}. A US fluid ounce is ${withSym(F(cv('volume', 'floz', 'ml', 1)), 'mL')}, an imperial one ${withSym(F(cv('volume', 'ukfloz', 'ml', 1)), 'mL')}.`],
      ['How do I convert liters to gallons?', `Divide liters by 3.785411784 for US gallons: ${say('volume', 'l', 'gal', 10)}. For imperial gallons divide by 4.54609: ${say('volume', 'l', 'ukgal', 10)}.`]
    ],
    related: ['cooking', 'weight', 'length', 'area']
  },
  temperature: {
    h1: 'Temperature Converter', eyebrow: 'Celsius, Fahrenheit, Kelvin and Rankine',
    title: 'Temperature Converter — Celsius, Fahrenheit, Kelvin | CalcThis',
    desc: 'Free temperature converter: °C to °F, °F to °C, Kelvin and Rankine, with the formula shown and a live thermometer scale.',
    hero: 'Convert <strong>Celsius, Fahrenheit, Kelvin and Rankine</strong>. Type a temperature and see every scale at once, the formula that was used, and where it sits on a thermometer.',
    pairs: [['c', 'f', [-40, 0, 20, 25, 37, 100, 180, 200]], ['f', 'c', [0, 32, 68, 72, 98.6, 212, 350, 450]], ['c', 'k', [-273.15, 0, 25, 100]]],
    formula: () => `<div class="formula">°F = °C × 9/5 + 32<small>°C = (°F − 32) × 5/9 · K = °C + 273.15</small></div>`,
    steps: () => `<p>Unlike lengths or weights, temperature scales have different zero points, so you multiply <em>and</em> add. Celsius to Fahrenheit: multiply by 9/5 and add 32 — ${say('temperature', 'c', 'f', 25)}. Fahrenheit to Celsius: subtract 32, then multiply by 5/9 — ${say('temperature', 'f', 'c', 72)}. Kelvin is Celsius plus 273.15, and absolute zero is 0 K, which is ${val('temperature', 'k', 'c', 0)} or ${val('temperature', 'k', 'f', 0)}.</p>`,
    faqs: () => [
      ['How do I convert Celsius to Fahrenheit?', `Multiply by 9/5 (1.8) and add 32. ${say('temperature', 'c', 'f', 25)}, ${say('temperature', 'c', 'f', 100)} and ${say('temperature', 'c', 'f', 0)}.`],
      ['How do I convert Fahrenheit to Celsius?', `Subtract 32, then multiply by 5/9. ${say('temperature', 'f', 'c', 98.6)}, ${say('temperature', 'f', 'c', 212)} and ${say('temperature', 'f', 'c', 350)}.`],
      ['At what temperature are Celsius and Fahrenheit equal?', `At −40: ${say('temperature', 'c', 'f', -40)}. It is the only temperature where the two scales read the same number.`],
      ['What is normal body temperature in Celsius and Fahrenheit?', `The traditional average is ${say('temperature', 'c', 'f', 37)}. Water freezes at ${say('temperature', 'c', 'f', 0)} and boils at ${say('temperature', 'c', 'f', 100)} at sea level.`],
      ['How do I convert Celsius to Kelvin?', `Add 273.15. ${say('temperature', 'c', 'k', 25)}. Kelvin has no degree sign and starts at absolute zero: ${say('temperature', 'k', 'c', 0)}.`]
    ],
    related: ['cooking', 'length', 'weight', 'speed']
  },
  area: {
    h1: 'Area Converter', eyebrow: 'Square feet, square meters, acres, hectares and more',
    title: 'Area Converter — Square Feet, Square Meters, Acres, Hectares | CalcThis',
    desc: 'Free area converter: square feet to square meters, acres to hectares, square miles and more. Every unit at once.',
    hero: 'Convert <strong>square feet, square meters, acres, hectares, square miles</strong> and more. Type an area and every unit shows at once.',
    pairs: [['ft2', 'm2', [1, 100, 500, 1000, 2000, 5000]], ['m2', 'ft2', [1, 10, 50, 100, 200, 1000]], ['ac', 'ft2', [0.25, 0.5, 1, 2, 5, 10]], ['ha', 'ac', [1, 2, 5, 10, 50, 100]]],
    formula: () => `<div class="formula">m² = ft² × 0.09290304<small>FT² = M² × 10.763910 · ACRE = 43,560 FT² = 4,046.8564 M² · HECTARE = 10,000 M²</small></div>`,
    steps: () => `<p>Area units are squares of length units, so the factor is the length factor squared: 1 ft = 0.3048 m, so 1 ft² = 0.3048² = 0.09290304 m². An acre is exactly 43,560 square feet, a hectare is 10,000 square meters, and a square mile is 640 acres. Example: ${say('area', 'ft2', 'm2', 1000)} and ${say('area', 'ha', 'ac', 5)}.</p>`,
    faqs: () => [
      ['How many square feet are in an acre?', `43,560. ${say('area', 'ac', 'ft2', 1)} = ${withSym(F(cv('area', 'ac', 'm2', 1)), 'm²')}. A quarter acre is ${say('area', 'ac', 'ft2', 0.25)}.`],
      ['How do I convert square feet to square meters?', `Multiply by 0.09290304. ${say('area', 'ft2', 'm2', 1000)} and ${say('area', 'ft2', 'm2', 2500)}.`],
      ['How do I convert square meters to square feet?', `Multiply by 10.763910. ${say('area', 'm2', 'ft2', 100)} and ${say('area', 'm2', 'ft2', 50)}.`],
      ['How many acres are in a hectare?', `${say('area', 'ha', 'ac', 1)}. A hectare is 10,000 m², so ${say('area', 'ha', 'ft2', 1)}.`],
      ['How many acres are in a square mile?', `640. ${say('area', 'mi2', 'ac', 1)} and ${say('area', 'mi2', 'km2', 1)}.`]
    ],
    related: ['length', 'volume', 'weight', 'speed']
  },
  speed: {
    h1: 'Speed Converter', eyebrow: 'mph, km/h, m/s, knots and ft/s',
    title: 'Speed Converter — mph, km/h, m/s, Knots | CalcThis',
    desc: 'Free speed converter: mph to km/h, km/h to mph, m/s, knots and feet per second. Every unit at once.',
    hero: 'Convert <strong>miles per hour, kilometers per hour, meters per second, knots and feet per second</strong>. Type a speed and every unit shows at once.',
    pairs: [['mph', 'kmh', [10, 25, 30, 55, 60, 65, 70, 80]], ['kmh', 'mph', [10, 30, 50, 80, 100, 120, 130]], ['kn', 'mph', [1, 5, 10, 20, 30]]],
    formula: () => `<div class="formula">km/h = mph × 1.609344<small>MPH = KM/H ÷ 1.609344 · M/S = KM/H ÷ 3.6 · 1 KNOT = 1.852 KM/H</small></div>`,
    steps: () => `<p>Speed units are a length per time, so they follow the length factors: ${one('length', 'mi', 'km')} exactly, and an hour is 3,600 seconds. Therefore ${say('speed', 'mph', 'kmh', 60)} and ${say('speed', 'kmh', 'ms', 100)}. A knot is one nautical mile (1,852 m) per hour, so ${say('speed', 'kn', 'kmh', 1)}.</p>`,
    faqs: () => [
      ['How do I convert mph to km/h?', `Multiply by 1.609344. ${say('speed', 'mph', 'kmh', 60)}, ${say('speed', 'mph', 'kmh', 70)} and ${say('speed', 'mph', 'kmh', 30)}.`],
      ['How do I convert km/h to mph?', `Divide by 1.609344. ${say('speed', 'kmh', 'mph', 100)}, ${say('speed', 'kmh', 'mph', 120)} and ${say('speed', 'kmh', 'mph', 50)}.`],
      ['How do I convert km/h to m/s?', `Divide by 3.6. ${say('speed', 'kmh', 'ms', 100)}. In the other direction multiply m/s by 3.6: ${say('speed', 'ms', 'kmh', 10)}.`],
      ['How fast is a knot?', `One nautical mile per hour: ${say('speed', 'kn', 'kmh', 1)} = ${say('speed', 'kn', 'mph', 1)}. A ship at 20 knots travels ${say('speed', 'kn', 'kmh', 20)}.`],
      ['How many feet per second is 60 mph?', `${say('speed', 'mph', 'fts', 60)} — a handy figure because one mph is almost exactly 1.4667 ft/s.`]
    ],
    related: ['length', 'temperature', 'weight', 'area']
  },
  data: {
    h1: 'Data Storage Converter', eyebrow: 'Bytes, KB, MB, GB, TB, KiB, MiB, GiB and bits',
    title: 'Data Storage Converter — MB, GB, TB, GiB, Bits, Bytes | CalcThis',
    desc: 'Free data storage converter: MB to GB, GB to TB, bits to bytes, and decimal (1,000) versus binary (1,024) units such as GB and GiB.',
    hero: 'Convert <strong>bits, bytes, KB, MB, GB, TB and PB</strong> — and the binary units KiB, MiB, GiB and TiB. Decimal and binary sizes are shown side by side, so you can see why a 1 TB drive reads about 931 GB in Windows.',
    pairs: [['GB', 'MB', [1, 2, 5, 10, 100]], ['MB', 'GB', [100, 500, 1000, 2500, 5000]], ['TB', 'GB', [0.5, 1, 2, 4, 8]], ['GB', 'GiB', [1, 128, 256, 512, 1000]]],
    formula: () => `<div class="formula">1 GB = 1,000 MB (decimal) · 1 GiB = 1,024 MiB (binary)<small>1 BYTE = 8 BITS · 1 KB = 1,000 BYTES · 1 KiB = 1,024 BYTES</small></div>`,
    steps: () => `<p>There are two systems. Storage makers and the SI system use decimal prefixes: ${say('data', 'GB', 'MB', 1)}. Computers address memory in powers of two, so the IEC created binary units: ${say('data', 'GiB', 'MiB', 1)}. A byte is 8 bits. A 1 TB drive holds 1,000,000,000,000 bytes, which is ${val('data', 'TB', 'GiB', 1, undefined, '2dp')} — the number Windows shows, labelled “GB”.</p>`,
    faqs: () => [
      ['How many MB are in a GB?', `${say('data', 'GB', 'MB', 1)} in the decimal system used by storage makers and networks, and ${say('data', 'GiB', 'MiB', 1)} in the binary system.`],
      ['Why does my 1 TB drive show less than 1 TB?', `The drive is sold in decimal units: 1 TB is ${val('data', 'TB', 'GiB', 1, undefined, '2dp')}. Windows divides by 1,024 but still writes “GB”, so a 1 TB drive shows about ${F(cv('data', 'TB', 'GiB', 1), '4sig')} GB. macOS uses decimal units, so it shows 1 TB.`],
      ['How many bytes are in a kilobyte?', `1,000 bytes in the decimal system (${say('data', 'kB', 'B', 1)}) and 1,024 bytes in the binary system (${say('data', 'KiB', 'B', 1)}).`],
      ['What is the difference between MB and Mb?', `A capital B is bytes and a small b is bits: ${say('data', 'MB', 'Mb', 1)}. Internet speeds are sold in megabits per second, so a 100 Mbps connection moves at most ${val('data', 'Mb', 'MB', 100)} of data per second.`],
      ['How many GB are in a TB?', `${say('data', 'TB', 'GB', 1)} decimal, or ${say('data', 'TiB', 'GiB', 1)} binary. A 256 GB phone is ${val('data', 'GB', 'GiB', 256, undefined, '2dp')}.`]
    ],
    related: ['cooking', 'length', 'weight', 'area']
  },
  cooking: {
    h1: 'Cooking Measurement Converter', eyebrow: 'Cups to grams, tablespoons, mL and oven temperatures',
    title: 'Cooking Converter — Cups to Grams, Tbsp, mL, Oven °F to °C | CalcThis',
    desc: 'Free cooking converter: cups to grams for 50 ingredients, tablespoons, teaspoons, mL, ounces, sticks of butter, plus oven °F to °C, fan oven and gas mark.',
    hero: 'Convert <strong>cups, tablespoons, teaspoons, mL, grams and ounces</strong> for the ingredient you are actually using — a cup of flour and a cup of honey weigh very different amounts — and switch to <strong>oven temperatures</strong> for °C, °F, fan oven and gas mark.',
    pairs: [['cup', 'g', [0.25, 0.5, 1, 2]], ['tbsp', 'ml', [1, 2, 4]], ['stick', 'g', [0.5, 1, 2]]],
    formula: () => `<div class="formula">grams = cups × grams per cup<small>ALL-PURPOSE FLOUR 120 G · SUGAR 200 G · BUTTER 226.8 G · WATER 237 G PER US CUP</small></div>`,
    steps: () => `<p>Cups and tablespoons measure volume, grams measure weight, so going between them needs the ingredient's density. A US cup of all-purpose flour is about 120 g, a cup of granulated sugar 200 g, a cup of butter 226.8 g (two sticks) and a cup of water 237 g. The values are typical (about ±5%) — flour packs differently from scoop to scoop, so for baking weigh it. Volume to volume and weight to weight need no ingredient: ${say('cooking', 'tbsp', 'tsp', 1)}, ${say('cooking', 'lb', 'g', 1)}.</p>`,
    faqs: () => {
      const o = (i, s) => ({ ing: i, std: s || 'us' }), ov = E.ovenAll('f', 350);
      return [
        ['How many grams are in a cup of flour?', `A US cup of all-purpose flour weighs about ${val('cooking', 'cup', 'g', 1, o('flour'))} (typical; ±5%). Half a cup is ${val('cooking', 'cup', 'g', 0.5, o('flour'))}, a cup of bread flour weighs the same, and cake flour about ${val('cooking', 'cup', 'g', 1, o('cakeflour'))}.`],
        ['How many grams are in a cup of sugar or butter?', `A US cup of granulated sugar is about ${val('cooking', 'cup', 'g', 1, o('sugar'))}, packed brown sugar ${val('cooking', 'cup', 'g', 1, o('brownsugar'))} and butter ${val('cooking', 'cup', 'g', 1, o('butter'))}. One US stick of butter (8 tablespoons) is ${val('cooking', 'stick', 'g', 1, o('butter'))}.`],
        ['How many mL are in a cup, tablespoon and teaspoon?', `A US cup is ${val('cooking', 'cup', 'ml', 1, undefined, '2dp')}, a tablespoon ${val('cooking', 'tbsp', 'ml', 1, undefined, '2dp')} and a teaspoon ${val('cooking', 'tsp', 'ml', 1, undefined, '2dp')}. A metric cup (UK, Australia, Canada) is ${val('cooking', 'cup', 'ml', 1, o('flour', 'uk'))}, and an Australian tablespoon is ${val('cooking', 'tbsp', 'ml', 1, o('flour', 'au'))}.`],
        ['How many teaspoons are in a tablespoon, and tablespoons in a cup?', `${say('cooking', 'tbsp', 'tsp', 1)}, ${say('cooking', 'cup', 'tbsp', 1)} (US) and ${say('cooking', 'cup', 'floz', 1)}. In Australia a tablespoon is 20 mL, so a metric cup holds ${F(cv('cooking', 'cup', 'tbsp', 1, o('flour', 'au')))} tablespoons.`],
        ['What is 350°F in Celsius, fan oven and gas mark?', `350 °F is ${+ov.C.toFixed(1)} °C, normally rounded to ${Math.round(ov.C / 5) * 5} °C, which is ${Math.round(ov.C / 5) * 5 - 20} °C in a fan oven and gas mark ${ov.gas[1]}. Switch the converter to “Oven temperature” for any other temperature.`]
      ];
    },
    related: ['volume', 'weight', 'temperature', 'length']
  },
  css: {
    h1: 'PX to REM Converter', eyebrow: 'Pixels, rem, em, points and percent for CSS',
    title: 'PX to REM Converter — px, rem, em, pt, % for CSS | CalcThis',
    desc: 'Free px to rem converter with a custom root font size: convert pixels to rem, em, pt, percent and vw for CSS, with a live text sample.',
    hero: 'Convert <strong>pixels to rem and rem to pixels</strong> — and em, points, picas, percent and viewport units — using your own root font size. A live text sample shows the size you are converting to.',
    pairs: [['px', 'rem', [8, 12, 14, 16, 18, 20, 24, 32, 48, 64]], ['rem', 'px', [0.5, 0.75, 1, 1.25, 1.5, 2, 3]], ['pt', 'px', [8, 10, 12, 14, 18, 24]]],
    formula: () => `<div class="formula">rem = px ÷ root font size<small>PX = REM × ROOT FONT SIZE · BROWSERS DEFAULT TO 16 PX · 1 IN = 96 PX · 1 PT = 4/3 PX</small></div>`,
    steps: () => `<p>A <strong>rem</strong> is the root (html) font size, which browsers set to 16 px unless you change it, so ${say('css', 'px', 'rem', 24, CSS)} and ${say('css', 'rem', 'px', 1.5, CSS)}. An <strong>em</strong> is the font size of the element's parent, so it equals rem only when the parent is the root size. A CSS inch is always 96 px, a point is 1/72 inch: ${say('css', 'pt', 'px', 12, CSS)}.</p>`,
    faqs: () => [
      ['How do I convert px to rem?', `Divide the pixels by the root font size, 16 px by default. ${say('css', 'px', 'rem', 24, CSS)}, ${say('css', 'px', 'rem', 14, CSS)} and ${say('css', 'px', 'rem', 10, CSS)}. If your root size is 10 px, enter 10 in the root font size box above and 24 px becomes ${F(24 / 10)} rem.`],
      ['How do I convert rem to px?', `Multiply rem by the root font size. ${say('css', 'rem', 'px', 1, CSS)}, ${say('css', 'rem', 'px', 1.5, CSS)} and ${say('css', 'rem', 'px', 2, CSS)}.`],
      ['What is the difference between em and rem?', `Rem is relative to the root font size and em to the parent element's font size. ${say('css', 'px', 'em', 24, { root: 16, parent: 20 })} when the parent is 20 px, but ${say('css', 'px', 'rem', 24, CSS)} whatever the parent is. Set the parent size under Go advanced to convert em.`],
      ['How many pixels are in a point, pica and inch?', `In CSS: ${say('css', 'pt', 'px', 1, CSS)}, ${say('css', 'pc', 'px', 1, CSS)} and ${say('css', 'in', 'px', 1, CSS)}. So a 12 pt font is ${val('css', 'pt', 'px', 12, CSS)}.`],
      ['How do I convert px to vw?', `Divide the pixels by the viewport width and multiply by 100. On a 1,920 px wide viewport ${say('css', 'px', 'vw', 960, CSS)}. Enter your viewport width under Go advanced.`]
    ],
    related: ['length', 'data', 'cooking', 'area']
  }
};
const ICON = {"all":"<circle cx=\"16\" cy=\"16\" r=\"12\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\"/><path d=\"M9 12.5h12.5l-3-3M23 19.5H10.5l3 3\" stroke=\"#37503F\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>","length":"<rect x=\"3\" y=\"10\" width=\"26\" height=\"12\" rx=\"2.5\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\"/><path d=\"M8 10v5M12 10v3M16 10v5M20 10v3M24 10v5\" stroke=\"#37503F\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>","weight":"<path d=\"M7 27h18l-2.5-13h-13z\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle cx=\"16\" cy=\"8.5\" r=\"4.5\" fill=\"#fff\" stroke=\"#8F5C13\" stroke-width=\"1.4\"/><path d=\"M16 8.5l2-2\" stroke=\"#B5761F\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><path d=\"M12 20h8\" stroke=\"#37503F\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>","volume":"<path d=\"M9 4h14M11 4v7l-5 13a2.5 2.5 0 0 0 2.3 3.5h15.4A2.5 2.5 0 0 0 26 24l-5-13V4\" fill=\"#fff\" stroke=\"#8F5C13\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><path d=\"M8.4 19.5h15.2l2.4 5.6a2 2 0 0 1-1.8 2.9H7.8A2 2 0 0 1 6 25.1z\" fill=\"#B5761F\" opacity=\".85\"/><path d=\"M17 11h3M17 15h3\" stroke=\"#37503F\" stroke-width=\"1.3\" stroke-linecap=\"round\"/>","temperature":"<path d=\"M13 5.5a3 3 0 0 1 6 0V17a5.5 5.5 0 1 1-6 0z\" fill=\"#fff\" stroke=\"#8F5C13\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle cx=\"16\" cy=\"22\" r=\"3\" fill=\"#B5761F\"/><path d=\"M16 10v12\" stroke=\"#B5761F\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M22 8h3M22 12h2M22 16h3\" stroke=\"#37503F\" stroke-width=\"1.3\" stroke-linecap=\"round\"/>","area":"<rect x=\"5\" y=\"5\" width=\"22\" height=\"22\" rx=\"2\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\"/><path d=\"M5 12.3h22M5 19.7h22M12.3 5v22M19.7 5v22\" stroke=\"#37503F\" stroke-width=\"1.1\" opacity=\".7\"/><path d=\"M9 23l5-5M9 23v-3.5M9 23h3.5\" stroke=\"#B5761F\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>","speed":"<path d=\"M4.5 24a11.5 11.5 0 1 1 23 0\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\" stroke-linecap=\"round\"/><path d=\"M16 23l5.5-8\" stroke=\"#B5761F\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"16\" cy=\"23\" r=\"2\" fill=\"#37503F\"/><path d=\"M8 18l1.4.8M16 10.5v1.6M24 18l-1.4.8\" stroke=\"#37503F\" stroke-width=\"1.3\" stroke-linecap=\"round\"/>","data":"<rect x=\"4\" y=\"6\" width=\"24\" height=\"9\" rx=\"2\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\"/><rect x=\"4\" y=\"17\" width=\"24\" height=\"9\" rx=\"2\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\"/><circle cx=\"9\" cy=\"10.5\" r=\"1.4\" fill=\"#B5761F\"/><circle cx=\"9\" cy=\"21.5\" r=\"1.4\" fill=\"#B5761F\"/><path d=\"M14 10.5h9M14 21.5h9\" stroke=\"#37503F\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>","cooking":"<path d=\"M6 14h20v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><path d=\"M4 14h24M3 17.5h3M26 17.5h3\" stroke=\"#8F5C13\" stroke-width=\"1.4\" stroke-linecap=\"round\"/><path d=\"M12 4.5c-1.5 2 1.5 3 0 5M17 4.5c-1.5 2 1.5 3 0 5M22 4.5c-1.5 2 1.5 3 0 5\" stroke=\"#B5761F\" stroke-width=\"1.5\" stroke-linecap=\"round\" fill=\"none\"/>","css":"<rect x=\"3\" y=\"6\" width=\"26\" height=\"20\" rx=\"3\" fill=\"#EFE7D8\" stroke=\"#8F5C13\" stroke-width=\"1.4\"/><path d=\"M12.5 12l-4 4 4 4M19.5 12l4 4-4 4\" stroke=\"#37503F\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M17.2 11l-2.4 10\" stroke=\"#B5761F\" stroke-width=\"1.6\" stroke-linecap=\"round\"/>"};
const cubeSvg = (k) => `<svg width="34" height="34" viewBox="0 0 32 32" fill="none">${ICON[k]}</svg>`;
const ORDER = E.ORDER;
const slugOf = (c) => E.CATS[c].slug;
const urlOf = (c) => '/' + slugOf(c) + '/';

const jsonApp = (name, url, desc) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name, url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: desc });
const jsonFaq = (f) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) });
const escA = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
function headFor(o) {
  return headTop
    .replace(/<title>[^<]*<\/title>/, () => '<title>' + o.title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + escA(o.desc) + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + o.url + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + escA(o.ogTitle || o.title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + escA(o.desc) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + o.url + '">');
}
const pill = (href, label, svg) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>\n        ${label}\n      </a>`;
const PILLSVG = '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>';

function bodyFor(o) {
  return `<body class="p-loan p-unit" data-cat="${o.cat}"${o.pair ? ` data-from="${o.pair.a}" data-to="${o.pair.b}" data-ex="${o.pair.ex}"${o.pair.ing ? ` data-ing="${o.pair.ing}"` : ''}` : ''}>
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">${o.eyebrow}</div>
    <h1>${o.h1}</h1>
    <p>${o.hero}</p>
  </section>

  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Convert</h2>

        <div class="fld"><span class="lab">Converter</span>${cselEmpty('unCat')}</div>
        <div class="fld" id="unModeWrap" style="display:none"><div class="modeseg" id="unModeSeg" role="group" aria-label="What to convert">
          <button class="on" type="button" data-v="conv">Cups, grams &amp; mL</button>
          <button type="button" data-v="oven">Oven temperature</button>
        </div></div>

        ${fld('unVal', 'Value', '', 'e.g. ' + o.ph)}
        <div class="un-conv">
          <div class="fld"><span class="lab">From</span>${cselEmpty('unFrom')}</div>
          <button class="un-swap" id="unSwap" type="button" aria-label="Swap the two units" title="Swap units"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg></button>
          <div class="fld"><span class="lab">To</span>${cselEmpty('unTo')}</div>
        </div>

        <div id="unBaseFld" style="display:none">${fld('unBase', 'Root font size', 'px', 'e.g. 16', '16')}</div>
        <div id="unIngFld" style="display:none"><div class="fld"><span class="lab">Ingredient</span>${cselEmpty('unIng')}</div><p class="un-note">Used when you convert between volume (cups, mL) and weight (grams, ounces).</p></div>

        <p class="add-note ln-hint" id="unHint" style="display:none"></p>

        <div class="chips" aria-label="Try an example">
          <button type="button" id="unEx">See an example</button>${o.pair ? o.pair.vals.slice(0, 6).map((v) => `\n          <button type="button" data-val="${v}">${v}</button>`).join('') : ''}
        </div>

        <div id="unAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="fld"><span class="lab">Result precision</span>${cselEmpty('unPrec')}</div>
          <div class="fld" id="unStdFld" style="display:none"><span class="lab">Cup size</span>${cselEmpty('unStd')}</div>
          <div id="unCssAdv" style="display:none">
            ${fld('unParent', 'Parent font size (for em and %)', 'px', 'e.g. 16')}
            <div class="ln-two">
              ${fld('unVw', 'Viewport width', 'px', 'e.g. 1440')}
              ${fld('unVh', 'Viewport height', 'px', 'e.g. 900')}
            </div>
          </div>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="unAdvBtn" type="button">
            <span id="unAdvBtnLab">Go advanced</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="unResLab">Result</div>
          <div class="res-big" id="unBig">—</div>
          <div class="res-sub" id="unSub">Enter a value to convert.</div>
        </div>

        <div id="unResults" style="display:none">
          <p class="res-tip adv-tip" id="unTip" style="display:none"></p>
          <div id="unVisWrap" style="display:none"><div class="fc-grp">See it</div><div class="ln-box" id="unVis"></div></div>
          <div class="fc-grp">All units at once</div>
          <table class="dtable ln-terms" id="unTable"></table>
          <p class="res-tip" id="unFormula" style="display:none"></p>
          <div><button class="btn" id="unCopy" type="button" style="margin-top:6px">Copy result</button></div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="unMLab">Result</span>
    <div class="mbar-vals"><b id="unMVal">—</b><span id="unMDec"></span></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More converters and calculators that may interest you</p>
    <div class="pills">
${o.pills.join('\n')}
    </div>
  </div>

${o.content}

${ftr}

</div>

<script src="/assets/app.js?v=235"></script>
<script>CalcThis.initUnitConverter();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
}
function write(rel, html) { const dir = ROOT + rel.replace(/index\.html$/, ''); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(ROOT + rel, html.replace(/\n/g, '\r\n')); }

const tile = (c) => `<a class="un-tile" href="${urlOf(c)}"><b>${E.CATS[c].name === 'CSS units (px, rem, em)' ? 'PX to REM' : E.CATS[c].name + ' converter'}</b><span>${P[c].eyebrow}</span></a>`;
const catLinks = (except) => '<ul class="pc-statelist">' + ORDER.filter((c) => c !== except).map((c) => '<li><a href="' + urlOf(c) + '">' + P[c].h1 + '</a></li>').join('') + '</ul>';

function pairTable(cat, a, b, vals, o) {
  const rows = vals.map((x0) => { const x = typeof x0 === 'string' ? E.parse(x0) : x0; return '<tr><td>' + withSym(typeof x0 === 'string' ? x0 : F(x0), sym(cat, a)) + '</td><td>' + withSym(F(cv(cat, a, b, x, o)), sym(cat, b)) + '</td></tr>'; }).join('');
  return '<div class="pc-tblwrap"><table class="dtable"><thead><tr><th>' + nm(cat, a) + '</th><th>' + nm(cat, b) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}
const SOURCE = '<p class="st-src">Sources: factors are the exact international definitions — <a href="https://www.bipm.org/en/publications/si-brochure" rel="noopener">BIPM SI Brochure</a>, <a href="https://www.nist.gov/pml/special-publication-811" rel="noopener">NIST Special Publication 811</a> and, for binary data units, IEC 80000-13.</p>';

function writeCat(c) {
  const p = P[c], C = E.CATS[c], url = 'https://calcthis.co' + urlOf(c), f = p.faqs();
  const o = c === 'css' ? CSS : (c === 'cooking' ? { ing: 'flour', std: 'us' } : undefined);
  const tables = p.pairs.map((x) => '<h3>' + nm(c, x[0]) + ' to ' + nm(c, x[1]).toLowerCase() + '</h3>' + pairTable(c, x[0], x[1], x[2], x[0] === 'cup' || x[0] === 'stick' ? { ing: x[0] === 'stick' ? 'butter' : 'flour', std: 'us' } : o)).join('');
  const oven = c === 'cooking' ? (() => { const rows = [225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475].map((fv) => { const r = E.ovenAll('f', fv); return '<tr><td>' + fv + ' °F</td><td>' + (+r.C.toFixed(1)) + ' °C</td><td>' + (+r.fan.toFixed(1)) + ' °C</td><td>' + (r.gas ? r.gas[1] : '—') + '</td></tr>'; }).join(''); return '<h3>Oven temperatures</h3><div class="pc-tblwrap"><table class="dtable"><thead><tr><th>°F</th><th>°C</th><th>Fan °C</th><th>Gas mark</th></tr></thead><tbody>' + rows + '</tbody></table></div><p>Fan oven = °C − 20. Most recipes round °C to the nearest 5 (350 °F → 175 or 180 °C). Gas mark is the nearest standard setting.</p>'; })() : '';
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to convert ${c === 'css' ? 'px to rem' : C.name.toLowerCase()}</h2>
        ${p.steps()}
        <h2>The formula</h2>
        ${p.formula()}
        <h2>Common conversions</h2>
        ${tables}${oven}
        ${SOURCE}
      </div>
      <div>
        <h2>Use the ${p.h1.toLowerCase()}</h2>
        <p>Type a value, pick the unit you have and the unit you want, and the answer appears with every other unit in the same family listed below it. Use the swap button to flip the two units. Under <strong>Go advanced</strong> you can set how many digits the result shows${c === 'css' ? ', your parent font size for em and %, and your viewport size for vw and vh' : (c === 'cooking' ? ' and choose a US, UK or Australian cup' : '')}.</p>
        ${popularLinks(c)}<h2>Other converters</h2>
        <p><a href="/unit-converter/">All unit converters</a></p>
        ${catLinks(c)}
        <p>Also see the <a href="/recipe-converter/">Recipe Converter</a>, which scales and converts a whole recipe at once.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' },
    { '@type': 'ListItem', position: 2, name: 'Unit Converter', item: 'https://calcthis.co/unit-converter/' },
    { '@type': 'ListItem', position: 3, name: p.h1, item: url }] };
  const pills = p.related.map((r) => pill(urlOf(r), P[r].h1, PILLSVG)).concat([pill('/recipe-converter/', 'Recipe Converter', PILLSVG)]);
  const ex = C.ex;
  const html = headFor({ title: p.title, desc: p.desc, url }) + [jsonApp(p.h1, url, p.desc), jsonFaq(f), crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('') + '</head>\n' + bodyFor({ cat: c, eyebrow: p.eyebrow, h1: p.h1, hero: p.hero, ph: String(ex), content, pills });
  write(slugOf(c) + '/index.html', html);
}

/* ---------- hub ---------- */
function writeHub() {
  const url = 'https://calcthis.co/unit-converter/';
  const f = [
    ['What units can this unit converter convert?', 'Length (inches, cm, feet, meters, miles, km), weight (kg, pounds, ounces, grams, stone, tons), volume (liters, gallons, cups, mL, fluid ounces — US and imperial), temperature (Celsius, Fahrenheit, Kelvin, Rankine), area (square feet, square meters, acres, hectares), speed (mph, km/h, m/s, knots), data storage (bytes, KB, MB, GB, TB and the binary KiB, MiB, GiB), cooking measures (cups to grams per ingredient, oven temperatures) and CSS units (px, rem, em, pt, %).'],
    ['How do I convert units?', `Pick the converter, type the value, choose the unit you have and the unit you want. Every conversion is one multiplication by a fixed factor — for example ${say('length', 'in', 'cm', 1)} and ${say('weight', 'lb', 'kg', 1)} — except temperature, which also adds an offset: ${say('temperature', 'f', 'c', 212)}.`],
    ['What is the difference between metric and imperial units?', `Metric units (meter, gram, liter) are based on powers of ten; imperial and US customary units (inch, pound, gallon) are not. The two are linked by exact definitions: ${one('length', 'in', 'cm')}, ${one('weight', 'lb', 'kg')} and ${one('volume', 'gal', 'l')}. A US gallon and an imperial gallon differ: ${withSym(F(cv('volume', 'gal', 'l', 1)), 'L')} against ${withSym(F(cv('volume', 'ukgal', 'l', 1)), 'L')}.`],
    ['Are the conversions exact?', 'The factors are exact international definitions (BIPM, NIST and IEC), and the result is shown to 8 significant digits by default — choose up to 10 significant digits, or a fixed number of decimals, under Go advanced. The one approximate case is cooking: cups to grams uses typical ingredient densities (about ±5%).'],
    ['Why do the converters have separate pages?', 'Each converter does one job: the length converter shows a ruler, the temperature converter a thermometer scale, the px to rem converter a live text sample, and the cooking converter knows what a cup of flour weighs. Use the converter menu at the top of the calculator to switch.']
  ];
  const popular = [['length', 'in', 'cm', 12], ['length', 'mi', 'km', 26.2], ['weight', 'lb', 'kg', 150], ['weight', 'kg', 'lb', 70], ['volume', 'gal', 'l', 5], ['temperature', 'f', 'c', 350], ['temperature', 'c', 'f', 37], ['area', 'ac', 'ft2', 1], ['speed', 'mph', 'kmh', 60], ['data', 'TB', 'GiB', 1], ['css', 'px', 'rem', 24]];
  const prow = popular.map((x) => '<tr><td>' + withSym(F(x[3]), sym(x[0], x[1])) + '</td><td>' + withSym(F(cv(x[0], x[1], x[2], x[3], x[0] === 'css' ? CSS : undefined)), sym(x[0], x[2])) + '</td><td><a href="' + urlOf(x[0]) + '">' + E.CATS[x[0]].name + '</a></td></tr>').join('');
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>Pick a converter</h2>
        <div class="un-tiles">${ORDER.map(tile).join('')}</div>
        <h2>How to use the unit converter</h2>
        <p>Type the value, choose the unit you have and the unit you want, and the answer appears instantly — with every other unit in the same family listed below it, so you rarely need a second conversion. The swap button flips the two units, and <strong>Go advanced</strong> sets the number of digits shown.</p>
        <h2>Popular conversions</h2>
        <div class="pc-tblwrap"><table class="dtable"><thead><tr><th>From</th><th>To</th><th>Converter</th></tr></thead><tbody>${prow}</tbody></table></div>
        ${SOURCE}
      </div>
      <div>
        <h2>One tool per job</h2>
        <p>Each converter is built for what people actually do with it. <strong>Length</strong> shows a ruler and tape-measure fractions, <strong>weight</strong> splits pounds into pounds and ounces, <strong>temperature</strong> draws a thermometer, <strong>data storage</strong> explains why a 1 TB drive reads 931 GB, <strong>cooking</strong> converts cups to grams for the ingredient you pick, and <strong>px to rem</strong> uses your own root font size.</p>
        <h2>All converters</h2>
        ${catLinks('')}
        <p>For a whole recipe use the <a href="/recipe-converter/">Recipe Converter</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Unit Converter', item: url }] };
  const title = 'Unit Converter — Length, Weight, Volume, Temperature, Cooking & More | CalcThis', desc = 'Free unit converter: length, weight, volume, temperature, area, speed, data storage, cooking measures and px to rem. Every unit at once, exact factors.';
  const pills = ['length', 'weight', 'cooking', 'css'].map((r) => pill(urlOf(r), P[r].h1, PILLSVG));
  const html = headFor({ title, desc, url, ogTitle: 'Unit Converter — Convert Any Unit' }) + [jsonApp('Unit Converter', url, desc), jsonFaq(f), crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('') + '</head>\n' + bodyFor({ cat: 'length', eyebrow: 'Length, weight, volume, temperature, cooking, data and more', h1: 'Unit Converter', hero: 'Convert <strong>any common unit</strong> — length, weight, volume, temperature, area, speed, data storage, cooking measures and CSS px to rem. Pick a converter, type a value, and every unit in the family shows at once.', ph: '12', content, pills });
  write('unit-converter/index.html', html);
}

/* ---------- PAIR pages: /cm-to-inches/ etc. (a pair and its reverse are ONE page) ---------- */
const PAIRS = [
  { slug: 'cm-to-inches', cat: 'length', a: 'cm', b: 'in', ex: 50, vals: [15, 20, 25, 30, 40, 50, 60], rvals: [1, 2, 5, 6, 10, 12, 24, 36],
    h1: 'CM to Inches Converter', link: 'cm to inches', title: 'CM to Inches Converter — Centimeters to Inches (and Inches to CM) | CalcThis',
    eyebrow: 'Centimeters to inches, and inches to centimeters', sib: ['mm-to-inches', 'celsius-to-fahrenheit', 'kg-to-lbs'],
    formula: '<div class="formula">inches = cm ÷ 2.54<small>CM = INCHES × 2.54 · 1 INCH = EXACTLY 2.54 CM</small></div>',
    steps: () => `<p>An inch is defined as exactly 2.54 centimeters, so the conversion is one division. Divide the centimeters by 2.54: ${say('length', 'cm', 'in', 50)}. On a tape measure that is ${E.tape(cv('length', 'cm', 'in', 50)).text} inches, to the nearest 1/16.</p><p>To go the other way, multiply inches by 2.54: ${say('length', 'in', 'cm', 12)}. The swap button flips the direction.</p>`,
    faqs: () => [
      ['How many inches are in a centimeter?', `${one('length', 'cm', 'in')} (rounded). Because an inch is exactly 2.54 cm, dividing by 2.54 is always exact.`],
      ['How do I convert cm to inches?', `Divide by 2.54. ${say('length', 'cm', 'in', 25)}, ${say('length', 'cm', 'in', 30)} and ${say('length', 'cm', 'in', 60)}.`],
      ['How do I convert inches to cm?', `Multiply by 2.54. ${say('length', 'in', 'cm', 1)}, ${say('length', 'in', 'cm', 12)} and ${say('length', 'in', 'cm', 36)}.`],
      ['What is 180 cm in feet and inches?', `${say('length', 'cm', 'in', 180)}, which is ${Math.floor(cv('length', 'cm', 'in', 180) / 12)} ft ${E.tape(cv('length', 'cm', 'in', 180) % 12).text} in. The converter shows the feet-and-inches split under the answer when you convert to feet.`],
      ['How do I read centimeters as a fraction of an inch?', `Choose inches as the result and the answer is also shown as a tape-measure fraction, rounded to the nearest 1/16 in: ${say('length', 'cm', 'in', 15)} is ${E.tape(cv('length', 'cm', 'in', 15)).text} in.`]
    ] },
  { slug: 'kg-to-lbs', cat: 'weight', a: 'kg', b: 'lb', ex: 70, vals: [20, 50, 60, 65, 80, 90, 100], rvals: [1, 10, 100, 150, 180, 200],
    h1: 'KG to Lbs Converter', link: 'kg to lbs', title: 'KG to Lbs Converter — Kilograms to Pounds (and Pounds to KG) | CalcThis',
    eyebrow: 'Kilograms to pounds, and pounds to kilograms', sib: ['grams-to-ounces', 'cm-to-inches', 'celsius-to-fahrenheit'],
    formula: '<div class="formula">pounds = kg × 2.2046226<small>KG = POUNDS × 0.45359237 · 1 LB = EXACTLY 0.45359237 KG</small></div>',
    steps: () => `<p>The pound is defined as exactly 0.45359237 kilograms. To convert kg to lbs, multiply by 2.2046226: ${say('weight', 'kg', 'lb', 70)}. The result is also split into pounds and ounces under the answer.</p><p>To go the other way, multiply pounds by 0.45359237: ${say('weight', 'lb', 'kg', 150)}. Use the swap button to flip the direction.</p>`,
    faqs: () => [
      ['How many pounds are in a kilogram?', `${one('weight', 'kg', 'lb')} (rounded). A quick mental rule: double the kilograms and add 10%.`],
      ['How do I convert kg to lbs?', `Multiply by 2.2046226. ${say('weight', 'kg', 'lb', 60)}, ${say('weight', 'kg', 'lb', 80)} and ${say('weight', 'kg', 'lb', 100)}.`],
      ['How do I convert lbs to kg?', `Multiply by 0.45359237 (or divide by 2.2046226). ${say('weight', 'lb', 'kg', 150)} and ${say('weight', 'lb', 'kg', 200)}.`],
      ['What is 70 kg in pounds and ounces?', `${say('weight', 'kg', 'lb', 70)}, which is ${Math.floor(cv('weight', 'kg', 'lb', 70))} lb ${E.fmt((cv('weight', 'kg', 'lb', 70) % 1) * 16, '1dp').replace(/\.0$/, '')} oz.`],
      ['How many kg is a stone?', `One stone is 14 pounds: ${say('weight', 'st', 'kg', 1)}. So 11 stone is ${say('weight', 'st', 'kg', 11)}.`]
    ] },
  { slug: 'celsius-to-fahrenheit', cat: 'temperature', a: 'c', b: 'f', ex: 25, vals: [20, 25, 30, 40, 180, 200], rvals: [32, 68, 72, 98.6, 212, 350],
    h1: 'Celsius to Fahrenheit Converter', link: 'Celsius to Fahrenheit', title: 'Celsius to Fahrenheit Converter — °C to °F (and °F to °C) | CalcThis',
    eyebrow: '°C to °F, and °F to °C, with a thermometer', sib: ['cm-to-inches', 'kg-to-lbs', 'ml-to-oz'],
    formula: '<div class="formula">°F = °C × 9/5 + 32<small>°C = (°F − 32) × 5/9 · −40 IS THE SAME ON BOTH SCALES</small></div>',
    steps: () => `<p>Multiply the Celsius temperature by 9/5 (1.8), then add 32: ${say('temperature', 'c', 'f', 25)}. Temperature scales have different zero points, so unlike lengths or weights you multiply <em>and</em> add.</p><p>For Fahrenheit to Celsius, subtract 32 first, then multiply by 5/9: ${say('temperature', 'f', 'c', 72)}. A thermometer under the answer shows where it sits between −50 and 250 °C.</p>`,
    faqs: () => [
      ['How do I convert Celsius to Fahrenheit?', `Multiply by 1.8 and add 32. ${say('temperature', 'c', 'f', 20)}, ${say('temperature', 'c', 'f', 30)} and ${say('temperature', 'c', 'f', 40)}.`],
      ['What is 200 °C in Fahrenheit?', `${say('temperature', 'c', 'f', 200)}. Common oven settings: ${say('temperature', 'c', 'f', 180)}.`],
      ['How do I convert Fahrenheit to Celsius?', `Subtract 32, then multiply by 5/9. ${say('temperature', 'f', 'c', 68)}, ${say('temperature', 'f', 'c', 98.6)} and ${say('temperature', 'f', 'c', 212)}.`],
      ['At what temperature are Celsius and Fahrenheit equal?', `At −40: ${say('temperature', 'c', 'f', -40)}. It is the only point where both scales show the same number.`],
      ['What are the freezing and boiling points of water?', `Water freezes at ${say('temperature', 'c', 'f', 0)} and boils at ${say('temperature', 'c', 'f', 100)} at sea level. Body temperature is ${say('temperature', 'c', 'f', 37)}.`]
    ] },
  { slug: 'mm-to-inches', cat: 'length', a: 'mm', b: 'in', ex: 25, vals: [5, 10, 12, 20, 30, 100], rvals: [0.25, 0.5, 1, 2, 4],
    h1: 'MM to Inches Converter', link: 'mm to inches', title: 'MM to Inches Converter — Millimeters to Inches (and Inches to MM) | CalcThis',
    eyebrow: 'Millimeters to inches, and inches to millimeters', sib: ['cm-to-inches', 'ml-to-oz', 'grams-to-ounces'],
    formula: '<div class="formula">inches = mm ÷ 25.4<small>MM = INCHES × 25.4 · 1 INCH = EXACTLY 25.4 MM</small></div>',
    steps: () => `<p>An inch is exactly 25.4 millimeters, so divide the millimeters by 25.4: ${say('length', 'mm', 'in', 100)}. As a tape-measure fraction, ${say('length', 'mm', 'in', 10)} is about ${E.tape(cv('length', 'mm', 'in', 10)).text} in.</p><p>To go the other way, multiply inches by 25.4: ${say('length', 'in', 'mm', 1)}. The ruler under the answer shows both scales for values up to 32 cm.</p>`,
    faqs: () => [
      ['How many inches are in a millimeter?', `${one('length', 'mm', 'in')} (rounded). One inch is exactly 25.4 mm.`],
      ['How do I convert mm to inches?', `Divide by 25.4. ${say('length', 'mm', 'in', 5)}, ${say('length', 'mm', 'in', 12)} and ${say('length', 'mm', 'in', 30)}.`],
      ['How do I convert inches to mm?', `Multiply by 25.4. ${say('length', 'in', 'mm', 0.25)}, ${say('length', 'in', 'mm', 0.5)} and ${say('length', 'in', 'mm', 2)}.`],
      ['How many mm is 1/8, 1/4 and 1/2 inch?', `${say('length', 'in', 'mm', 0.125)}, ${say('length', 'in', 'mm', 0.25)} and ${say('length', 'in', 'mm', 0.5)}.`],
      ['How many millimeters are in a centimeter?', `10: ${say('length', 'cm', 'mm', 1)}. So ${say('length', 'mm', 'cm', 25)}.`]
    ] },
  { slug: 'grams-to-ounces', cat: 'weight', a: 'g', b: 'oz', ex: 100, vals: [28, 30, 150, 200, 300, 400], rvals: [1, 2, 4, 8, 12, 16],
    h1: 'Grams to Ounces Converter', link: 'grams to ounces', title: 'Grams to Ounces Converter — g to oz (and Ounces to Grams) | CalcThis',
    eyebrow: 'Grams to ounces, and ounces to grams', sib: ['kg-to-lbs', 'ml-to-oz', 'mm-to-inches'],
    formula: '<div class="formula">ounces = grams ÷ 28.349523<small>GRAMS = OUNCES × 28.349523 · 16 OZ = 1 LB</small></div>',
    steps: () => `<p>An avoirdupois ounce is exactly 28.349523125 grams (1/16 of a pound). Divide grams by 28.349523 to get ounces: ${say('weight', 'g', 'oz', 100)}. To go the other way multiply ounces by 28.349523: ${say('weight', 'oz', 'g', 4)}.</p><p>This is weight, not volume. For fluid ounces, use the <a href="/ml-to-oz/">mL to oz converter</a>; for cups of an ingredient, use the <a href="/cooking-converter/">cooking converter</a>.</p>`,
    faqs: () => [
      ['How many ounces are in a gram?', `${one('weight', 'g', 'oz')} (rounded). It is the reverse of ${one('weight', 'oz', 'g')}.`],
      ['How do I convert grams to ounces?', `Divide by 28.349523. ${say('weight', 'g', 'oz', 28)}, ${say('weight', 'g', 'oz', 200)} and ${say('weight', 'g', 'oz', 500)}.`],
      ['How do I convert ounces to grams?', `Multiply by 28.349523. ${say('weight', 'oz', 'g', 1)}, ${say('weight', 'oz', 'g', 8)} and ${say('weight', 'oz', 'g', 16)}.`],
      ['How many grams are in a pound?', `${say('weight', 'lb', 'g', 1)}. So a quarter pound is ${say('weight', 'lb', 'g', 0.25)}.`],
      ['Are ounces of weight the same as fluid ounces?', `No. An ounce of weight is ${say('weight', 'oz', 'g', 1)}; a US fluid ounce is ${say('volume', 'floz', 'ml', 1)} of volume. Only for water do they come close: 1 fl oz of water weighs about 29.6 g.`]
    ] },
  { slug: 'ml-to-oz', cat: 'volume', a: 'ml', b: 'floz', ex: 250, vals: [30, 50, 100, 150, 200, 250, 500, 750], rvals: [1, 2, 4, 8, 12, 16],
    h1: 'mL to Oz Converter', link: 'mL to oz', title: 'mL to Oz Converter — Milliliters to Fluid Ounces (and Oz to mL) | CalcThis',
    eyebrow: 'Milliliters to fluid ounces, and fluid ounces to mL', sib: ['grams-to-ounces', 'kg-to-lbs', 'celsius-to-fahrenheit'],
    formula: '<div class="formula">US fl oz = mL ÷ 29.5735296<small>ML = US FL OZ × 29.5735296 · IMPERIAL FL OZ = 28.4130625 ML</small></div>',
    steps: () => `<p>A US fluid ounce is exactly 29.5735295625 mL. Divide milliliters by 29.5735 to get US fluid ounces: ${say('volume', 'ml', 'floz', 250)}. To go the other way multiply fluid ounces by 29.5735: ${say('volume', 'floz', 'ml', 8)}.</p><p>An imperial (UK) fluid ounce is slightly smaller: ${say('volume', 'ml', 'ukfloz', 250)}. Pick “Fluid ounces (imperial)” in the To menu to use it. Ounces of weight are different — see <a href="/grams-to-ounces/">grams to ounces</a>.</p>`,
    faqs: () => [
      ['How many fluid ounces are in a milliliter?', `${one('volume', 'ml', 'floz')} (rounded) — US fluid ounces. One US fl oz is ${withSym(F(cv('volume', 'floz', 'ml', 1)), 'mL')}.`],
      ['How do I convert mL to oz?', `Divide by 29.5735. ${say('volume', 'ml', 'floz', 100)}, ${say('volume', 'ml', 'floz', 500)} and ${say('volume', 'ml', 'floz', 750)}.`],
      ['How do I convert oz to mL?', `Multiply fluid ounces by 29.5735. ${say('volume', 'floz', 'ml', 1)}, ${say('volume', 'floz', 'ml', 8)} and ${say('volume', 'floz', 'ml', 16)}.`],
      ['How many mL is a cup in fluid ounces?', `A US cup is 8 fl oz: ${say('volume', 'cup', 'ml', 1)}. A 12 fl oz can holds ${say('volume', 'floz', 'ml', 12)}.`],
      ['Is a UK fluid ounce the same as a US fluid ounce?', `No. A US fl oz is ${withSym(F(cv('volume', 'floz', 'ml', 1)), 'mL')} and an imperial fl oz is ${withSym(F(cv('volume', 'ukfloz', 'ml', 1)), 'mL')} — about 4% smaller.`]
    ] },
  { slug: 'mb-to-gb', cat: 'data', a: 'MB', b: 'GB', ex: 1024, vals: [100, 1000, 1024, 4096, 16000], rvals: [1, 2, 4, 8, 16],
    h1: 'MB to GB Converter', link: 'MB to GB', title: 'MB to GB Converter — Megabytes to Gigabytes (and GB to MB) | CalcThis',
    eyebrow: 'Megabytes to gigabytes, and gigabytes to megabytes', sib: ['kb-to-mb', 'kg-to-lbs', 'feet-to-inches'],
    formula: '<div class="formula">GB = MB ÷ 1,000 (decimal) · GiB = MiB ÷ 1,024 (binary)<small>1 GB = 1,000 MB · 1 GIB = 1,024 MIB · 1 BYTE = 8 BITS</small></div>',
    steps: () => `<p>Storage makers, networks and macOS use decimal units, so you divide megabytes by 1,000: ${say('data', 'MB', 'GB', 4096)}. Windows and memory use powers of two (binary units), so divide by 1,024: ${say('data', 'MiB', 'GiB', 4096)}.</p><p>That is why 1,024 MB is ${say('data', 'MB', 'GB', 1024)} in the decimal system but exactly ${say('data', 'MiB', 'GiB', 1024)} in the binary one. Use the To menu to pick GiB when you need the binary result.</p>`,
    faqs: () => [
      ['How many MB are in a GB?', `${say('data', 'GB', 'MB', 1)} in the decimal system used by storage makers and networks, and ${say('data', 'GiB', 'MiB', 1)} in the binary system used by Windows and RAM.`],
      ['How do I convert MB to GB?', `Divide by 1,000 (decimal). ${say('data', 'MB', 'GB', 100)}, ${say('data', 'MB', 'GB', 500)} and ${say('data', 'MB', 'GB', 16000)}.`],
      ['How many GB is 1024 MB?', `${say('data', 'MB', 'GB', 1024)} in decimal units, or exactly ${say('data', 'MiB', 'GiB', 1024)} in binary units.`],
      ['How do I convert GB to MB?', `Multiply by 1,000. ${say('data', 'GB', 'MB', 2)}, ${say('data', 'GB', 'MB', 8)} and ${say('data', 'GB', 'MB', 16)}.`],
      ['What is the difference between MB and Mb?', `A capital B is bytes and a small b is bits: ${say('data', 'MB', 'Mb', 1)}. Internet speeds use megabits, so a 100 Mbps line moves at most ${val('data', 'Mb', 'MB', 100)} per second.`]
    ] },
  { slug: 'kb-to-mb', cat: 'data', a: 'kB', b: 'MB', ex: 10000, vals: [100, 1000, 10000, 10240], rvals: [1, 5, 10, 100],
    h1: 'KB to MB Converter', link: 'KB to MB', title: 'KB to MB Converter — Kilobytes to Megabytes (and MB to KB) | CalcThis',
    eyebrow: 'Kilobytes to megabytes, and megabytes to kilobytes', sib: ['mb-to-gb', 'kg-to-lbs', 'feet-to-inches'],
    formula: '<div class="formula">MB = KB ÷ 1,000 (decimal) · MiB = KiB ÷ 1,024 (binary)<small>1 MB = 1,000 KB · 1 MIB = 1,024 KIB</small></div>',
    steps: () => `<p>In the decimal system divide kilobytes by 1,000: ${say('data', 'kB', 'MB', 10000)}. In the binary system, used by Windows file sizes, divide kibibytes by 1,024: ${say('data', 'KiB', 'MiB', 10240)}.</p><p>So 10,240 KB is ${say('data', 'kB', 'MB', 10240)} in decimal units but exactly ${say('data', 'KiB', 'MiB', 10240)} in binary units. Choose KiB and MiB in the unit menus for the binary result.</p>`,
    faqs: () => [
      ['How many KB are in an MB?', `${say('data', 'MB', 'kB', 1)} in the decimal system and ${say('data', 'MiB', 'KiB', 1)} in the binary system.`],
      ['How do I convert KB to MB?', `Divide by 1,000. ${say('data', 'kB', 'MB', 100)}, ${say('data', 'kB', 'MB', 1000)} and ${say('data', 'kB', 'MB', 10000)}.`],
      ['How many MB is 10240 KB?', `${say('data', 'kB', 'MB', 10240)} in decimal units, or exactly ${say('data', 'KiB', 'MiB', 10240)} in binary units.`],
      ['How do I convert MB to KB?', `Multiply by 1,000. ${say('data', 'MB', 'kB', 1)}, ${say('data', 'MB', 'kB', 5)} and ${say('data', 'MB', 'kB', 100)}.`],
      ['What is the difference between KB and Kb?', `A capital B is bytes and a small b is bits: ${say('data', 'kB', 'kb', 1)}.`]
    ] },
  { slug: 'cups-to-grams', cat: 'cooking', a: 'cup', b: 'g', ex: 1, ing: 'flour', vals: [1.5, 2, 3, 4],
    answer: () => 'A US cup of all-purpose flour = ' + val('cooking', 'cup', 'g', 1, { ing: 'flour', std: 'us' }),
    desc: 'Free cups to grams converter: pick the ingredient — flour, sugar, butter and 50 more — and get the weight in grams or ounces, plus a table of the most common amounts.',
    h1: 'Cups to Grams Converter', link: 'cups to grams', title: 'Cups to Grams Converter — Flour, Sugar, Butter & 50 Ingredients | CalcThis',
    eyebrow: 'Cups to grams for the ingredient you are using', sib: ['cups-to-tablespoons', 'grams-to-ounces', 'ml-to-oz'],
    formula: '<div class="formula">grams = cups × grams per cup<small>ALL-PURPOSE FLOUR 120 G · SUGAR 200 G · BUTTER 226.8 G PER US CUP · GRAMS ÷ G PER CUP = CUPS</small></div>',
    steps: () => `<p>A cup measures volume and a gram measures weight, so the answer depends on the ingredient. Pick it in the Ingredient menu: ${say('cooking', 'cup', 'g', 1, { ing: 'flour' })} for all-purpose flour, ${say('cooking', 'cup', 'g', 1, { ing: 'sugar' })} for granulated sugar and ${say('cooking', 'cup', 'g', 1, { ing: 'butter' })} for butter.</p><p>Values are typical (about ±5%) because flour packs differently from scoop to scoop — for baking, weigh it. Under Go advanced you can switch to a UK/metric (250 mL) or Australian cup.</p>`,
    tables: () => { const t = (ing, name) => `<h3>${name}: cups to grams</h3>` + pairTable('cooking', 'cup', 'g', [0.25, '1/3', 0.5, '3/4', 1, 1.5, 2, 3, 4], { ing, std: 'us' }); return `<h2>Common values by ingredient</h2>` + t('flour', 'All-purpose flour') + t('sugar', 'Granulated sugar') + t('butter', 'Butter') + `<h3>All-purpose flour: grams to cups</h3>` + pairTable('cooking', 'g', 'cup', [30, 60, 100, 120, 125, 250, 500], { ing: 'flour', std: 'us' }); },
    faqs: () => { const o = (i) => ({ ing: i, std: 'us' }); return [
      ['How many grams are in a cup of flour?', `A US cup of all-purpose flour is about ${val('cooking', 'cup', 'g', 1, o('flour'))}. Half a cup is ${val('cooking', 'cup', 'g', 0.5, o('flour'))} and 2 cups are ${val('cooking', 'cup', 'g', 2, o('flour'))}. Cake flour is lighter, about ${val('cooking', 'cup', 'g', 1, o('cakeflour'))}.`],
      ['How many grams are in a cup of sugar?', `Granulated sugar is about ${val('cooking', 'cup', 'g', 1, o('sugar'))} per US cup, packed brown sugar ${val('cooking', 'cup', 'g', 1, o('brownsugar'))} and powdered sugar ${val('cooking', 'cup', 'g', 1, o('powsugar'))}.`],
      ['How many grams are in a cup of butter?', `A US cup of butter is about ${val('cooking', 'cup', 'g', 1, o('butter'))} — two sticks. One stick is ${val('cooking', 'stick', 'g', 1, o('butter'))}.`],
      ['How do I convert grams to cups?', `Divide the grams by the ingredient's grams per cup. ${say('cooking', 'g', 'cup', 250, o('flour'))} of all-purpose flour, but ${say('cooking', 'g', 'cup', 250, o('sugar'))} of sugar.`],
      ['Why is a cup of one ingredient a different weight from another?', `Cups measure space, not weight: a cup of honey is ${val('cooking', 'cup', 'g', 1, o('honey'))} and a cup of flour ${val('cooking', 'cup', 'g', 1, o('flour'))}. Values are typical, about ±5%, so weigh baking ingredients when you can.`]
    ]; } },
  { slug: 'feet-to-inches', cat: 'length', a: 'ft', b: 'in', ex: 5, vals: [1, 3, 4, 5, 6, 8], rvals: [12, 24, 36, 60, 72, 100],
    h1: 'Feet to Inches Converter', link: 'feet to inches', title: 'Feet to Inches Converter — ft to in (and Inches to Feet) | CalcThis',
    eyebrow: 'Feet to inches, and inches to feet and inches', sib: ['cm-to-inches', 'yards-to-meters', 'mm-to-inches'],
    formula: '<div class="formula">inches = feet × 12<small>FEET = INCHES ÷ 12 · 1 FOOT = 12 INCHES = 30.48 CM</small></div>',
    steps: () => `<p>A foot is exactly 12 inches, so multiply feet by 12: ${say('length', 'ft', 'in', 5)}. For a height such as 5 ft 10 in, convert the feet and add the inches: 5 × 12 + 10 = ${5 * 12 + 10} in.</p><p>To go the other way divide inches by 12: ${say('length', 'in', 'ft', 72)}. When the result is in feet, the converter also shows it as feet and inches under the answer.</p>`,
    faqs: () => [
      ['How many inches are in a foot?', `${say('length', 'ft', 'in', 1)}, which is ${say('length', 'ft', 'cm', 1)}.`],
      ['How do I convert feet to inches?', `Multiply by 12. ${say('length', 'ft', 'in', 3)}, ${say('length', 'ft', 'in', 6)} and ${say('length', 'ft', 'in', 8)}.`],
      ['How do I convert inches to feet?', `Divide by 12. ${say('length', 'in', 'ft', 36)}, ${say('length', 'in', 'ft', 60)} and ${say('length', 'in', 'ft', 100)} — which is 8 ft 4 in.`],
      ['How many inches is 5 feet 10 inches?', `5 × 12 + 10 = ${5 * 12 + 10} inches, which is ${say('length', 'in', 'cm', 70)}.`],
      ['How many inches are in a yard?', `${say('length', 'yd', 'in', 1)}, or 3 feet.`]
    ] },
  { slug: 'yards-to-meters', cat: 'length', a: 'yd', b: 'm', ex: 100, vals: [25, 40, 50, 100, 200, 300, 500], rvals: [1, 10, 50, 100, 400],
    h1: 'Yards to Meters Converter', link: 'yards to meters', title: 'Yards to Meters Converter — yd to m (and Meters to Yards) | CalcThis',
    eyebrow: 'Yards to meters, and meters to yards', sib: ['feet-to-inches', 'cm-to-inches', 'knots-to-mph'],
    formula: '<div class="formula">meters = yards × 0.9144<small>YARDS = METERS ÷ 0.9144 · 1 YARD = EXACTLY 0.9144 M = 3 FEET</small></div>',
    steps: () => `<p>A yard is defined as exactly 0.9144 meters, so multiply yards by 0.9144: ${say('length', 'yd', 'm', 100)}. A 100-yard football field is ${say('length', 'yd', 'm', 100)}.</p><p>To go the other way divide meters by 0.9144: ${say('length', 'm', 'yd', 100)}. A quick mental rule: a meter is a little more than a yard (about 9% more).</p>`,
    faqs: () => [
      ['How many meters are in a yard?', `${say('length', 'yd', 'm', 1)} exactly. That is also ${say('length', 'yd', 'ft', 1)}.`],
      ['How do I convert yards to meters?', `Multiply by 0.9144. ${say('length', 'yd', 'm', 50)}, ${say('length', 'yd', 'm', 200)} and ${say('length', 'yd', 'm', 500)}.`],
      ['How do I convert meters to yards?', `Divide by 0.9144. ${say('length', 'm', 'yd', 10)}, ${say('length', 'm', 'yd', 100)} and ${say('length', 'm', 'yd', 400)}.`],
      ['How many meters is a 100-yard field?', `${say('length', 'yd', 'm', 100)}. A 100 m sprint is ${say('length', 'm', 'yd', 100)}.`],
      ['How many yards are in a mile?', `${say('length', 'mi', 'yd', 1)}, or 5,280 feet.`]
    ] },
  { slug: 'liters-to-quarts', cat: 'volume', a: 'l', b: 'qt', ex: 2, vals: [1.5, 2, 2.5, 3, 4, 5, 8], rvals: [1, 2, 4, 8],
    h1: 'Liters to Quarts Converter', link: 'liters to quarts', title: 'Liters to Quarts Converter — L to qt (and Quarts to Liters) | CalcThis',
    eyebrow: 'Liters to US quarts, and quarts to liters', sib: ['ml-to-oz', 'cups-to-tablespoons', 'yards-to-meters'],
    formula: '<div class="formula">US quarts = liters ÷ 0.946352946<small>LITERS = US QUARTS × 0.946352946 · 1 US GAL = 4 QT · IMPERIAL QT = 1.1365225 L</small></div>',
    steps: () => `<p>A US liquid quart is exactly 0.946352946 liters. Divide liters by 0.946353 to get US quarts: ${say('volume', 'l', 'qt', 2)}. To go the other way multiply quarts by 0.946353: ${say('volume', 'qt', 'l', 4)}.</p><p>An imperial (UK) quart is bigger: ${say('volume', 'l', 'ukqt', 2)}. Pick “Quarts (imperial)” in the To menu to use it.</p>`,
    faqs: () => [
      ['How many quarts are in a liter?', `${one('volume', 'l', 'qt')} (rounded) — US liquid quarts. A liter is a little more than a quart.`],
      ['How do I convert liters to quarts?', `Divide by 0.946353 (or multiply by 1.0566882). ${say('volume', 'l', 'qt', 1.5)}, ${say('volume', 'l', 'qt', 3)} and ${say('volume', 'l', 'qt', 5)}.`],
      ['How do I convert quarts to liters?', `Multiply by 0.946353. ${say('volume', 'qt', 'l', 1)}, ${say('volume', 'qt', 'l', 2)} and ${say('volume', 'qt', 'l', 8)}.`],
      ['How many liters are in a gallon?', `${say('volume', 'gal', 'l', 1)}, which is ${say('volume', 'gal', 'qt', 1)}.`],
      ['Is a UK quart the same as a US quart?', `No. A US quart is ${withSym(F(cv('volume', 'qt', 'l', 1)), 'L')} and an imperial quart is ${withSym(F(cv('volume', 'ukqt', 'l', 1)), 'L')} — about 20% bigger.`]
    ] },
  { slug: 'celsius-to-kelvin', cat: 'temperature', a: 'c', b: 'k', ex: 25, vals: [-40, 0, 25, 37, 100], rvals: [0, 100, 273.15, 300, 373.15],
    h1: 'Celsius to Kelvin Converter', link: 'Celsius to Kelvin', title: 'Celsius to Kelvin Converter — °C to K (and Kelvin to Celsius) | CalcThis',
    eyebrow: '°C to K, and K to °C, with a thermometer', sib: ['celsius-to-fahrenheit', 'knots-to-mph', 'mb-to-gb'],
    answer: () => say('temperature', 'c', 'k', 0) + ', ' + say('temperature', 'c', 'k', 100),
    formula: '<div class="formula">K = °C + 273.15<small>°C = K − 273.15 · ABSOLUTE ZERO = 0 K = −273.15 °C</small></div>',
    steps: () => `<p>Kelvin and Celsius degrees are the same size, so you only add or subtract an offset: K = °C + 273.15. ${say('temperature', 'c', 'k', 25)}. Water freezes at ${say('temperature', 'c', 'k', 0)} and boils at ${say('temperature', 'c', 'k', 100)}.</p><p>To go the other way subtract: ${say('temperature', 'k', 'c', 300)}. Kelvin has no degree sign and cannot go below 0 K, absolute zero (${say('temperature', 'k', 'c', 0)}).</p>`,
    faqs: () => [
      ['How do I convert Celsius to Kelvin?', `Add 273.15. ${say('temperature', 'c', 'k', 0)}, ${say('temperature', 'c', 'k', 25)} and ${say('temperature', 'c', 'k', 100)}.`],
      ['How do I convert Kelvin to Celsius?', `Subtract 273.15. ${say('temperature', 'k', 'c', 273.15)}, ${say('temperature', 'k', 'c', 300)} and ${say('temperature', 'k', 'c', 373.15)}.`],
      ['What is absolute zero in Celsius?', `${say('temperature', 'k', 'c', 0)} — the lowest temperature possible. The converter shows a message for anything colder.`],
      ['Why is there no degree sign on Kelvin?', 'Kelvin is an absolute scale named after Lord Kelvin, so it is written K, not °K. A change of 1 K equals a change of 1 °C.'],
      ['What is room temperature in Kelvin?', `About ${say('temperature', 'c', 'k', 20)} to ${say('temperature', 'c', 'k', 25)}. Body temperature is ${say('temperature', 'c', 'k', 37)}.`]
    ] },
  { slug: 'knots-to-mph', cat: 'speed', a: 'kn', b: 'mph', ex: 20, vals: [20, 21, 30, 35, 40, 50, 60, 120], rvals: [10, 25, 30, 60, 70],
    h1: 'Knots to MPH Converter', link: 'knots to mph', title: 'Knots to MPH Converter — kn to mph (and MPH to Knots) | CalcThis',
    eyebrow: 'Knots to miles per hour, and mph to knots', sib: ['yards-to-meters', 'celsius-to-kelvin', 'feet-to-inches'],
    formula: '<div class="formula">mph = knots × 1.150779<small>KNOTS = MPH × 0.868976 · 1 KNOT = 1 NAUTICAL MILE PER HOUR = 1.852 KM/H</small></div>',
    steps: () => `<p>A knot is one nautical mile per hour, and a nautical mile is exactly 1,852 meters, so multiply knots by 1.150779 to get miles per hour: ${say('speed', 'kn', 'mph', 20)}. In km/h: ${say('speed', 'kn', 'kmh', 20)}.</p><p>To go the other way multiply mph by 0.868976: ${say('speed', 'mph', 'kn', 60)}. A quick mental rule: add about 15% to knots to get mph.</p>`,
    faqs: () => [
      ['How many mph is one knot?', `${say('speed', 'kn', 'mph', 1)} (rounded), which is ${say('speed', 'kn', 'kmh', 1)}.`],
      ['How do I convert knots to mph?', `Multiply by 1.150779. ${say('speed', 'kn', 'mph', 20)}, ${say('speed', 'kn', 'mph', 35)} and ${say('speed', 'kn', 'mph', 60)}.`],
      ['How do I convert mph to knots?', `Multiply by 0.868976. ${say('speed', 'mph', 'kn', 25)}, ${say('speed', 'mph', 'kn', 60)} and ${say('speed', 'mph', 'kn', 70)}.`],
      ['How fast is 120 knots in mph?', `${say('speed', 'kn', 'mph', 120)} — a typical small-aircraft cruise speed. A 30-knot wind is ${say('speed', 'kn', 'mph', 30)}.`],
      ['What is a nautical mile?', `Exactly 1,852 meters: ${say('length', 'nmi', 'mi', 1)} and ${say('length', 'nmi', 'km', 1)}.`]
    ] },
  { slug: 'cups-to-tablespoons', cat: 'volume', a: 'cup', b: 'tbsp', ex: 1, vals: ['1/8', '1/4', '1/3', '1/2', '3/4', '1', '2'], rvals: [1, 2, 4, 8, 16],
    h1: 'Cups to Tablespoons Converter', link: 'cups to tablespoons', title: 'Cups to Tablespoons Converter — Cups to Tbsp (and Tbsp to Cups) | CalcThis',
    eyebrow: 'Cups to tablespoons, and tablespoons to cups', sib: ['cups-to-grams', 'liters-to-quarts', 'ml-to-oz'],
    formula: '<div class="formula">tablespoons = cups × 16<small>CUPS = TABLESPOONS ÷ 16 · 1 TBSP = 3 TSP = 1/2 FL OZ · US MEASURES</small></div>',
    steps: () => `<p>In US measures one cup is exactly 16 tablespoons, so multiply cups by 16: 3/4 cup = ${val('volume', 'cup', 'tbsp', 0.75)}. Half a cup is 8 tablespoons and a quarter cup is 4.</p><p>To go the other way divide tablespoons by 16: ${say('volume', 'tbsp', 'cup', 4)}. Australian tablespoons are 20 mL, so a metric cup holds 12.5 of them — see the <a href="/cooking-converter/">cooking converter</a> for that.</p>`,
    faqs: () => [
      ['How many tablespoons are in a cup?', `${say('volume', 'cup', 'tbsp', 1)} in US measures. A tablespoon is ${val('volume', 'tbsp', 'ml', 1)}.`],
      ['How many tablespoons are in 1/2, 1/3 and 1/4 cup?', `1/2 cup = ${val('volume', 'cup', 'tbsp', 0.5)}, 1/3 cup = ${val('volume', 'cup', 'tbsp', 1 / 3)} (5 tbsp + 1 tsp) and 1/4 cup = ${val('volume', 'cup', 'tbsp', 0.25)}.`],
      ['How many tablespoons are in 3/4 cup?', `3/4 cup = ${val('volume', 'cup', 'tbsp', 0.75)}, and 1/8 cup = ${val('volume', 'cup', 'tbsp', 0.125)}.`],
      ['How do I convert tablespoons to cups?', `Divide by 16. ${say('volume', 'tbsp', 'cup', 2)}, ${say('volume', 'tbsp', 'cup', 8)} and ${say('volume', 'tbsp', 'cup', 12)}.`],
      ['How many teaspoons are in a tablespoon?', `${say('volume', 'tbsp', 'tsp', 1)}, so a cup is ${say('volume', 'cup', 'tsp', 1)}.`]
    ] },
  { slug: 'tablespoons-to-teaspoons', cat: 'volume', a: 'tbsp', b: 'tsp', ex: 2, vals: [1, 1.5, 2, 3, 4], rvals: [1, 2, 3, 6, 12],
    h1: 'Tablespoons to Teaspoons Converter', link: 'tablespoons to teaspoons', title: 'Tablespoons to Teaspoons Converter — Tbsp to Tsp (and Tsp to Tbsp) | CalcThis',
    eyebrow: 'Tablespoons to teaspoons, and teaspoons to tablespoons', sib: ['cups-to-tablespoons', 'tablespoons-to-ml', 'cups-to-grams'],
    formula: '<div class="formula">teaspoons = tablespoons × 3<small>TABLESPOONS = TEASPOONS ÷ 3 · 1 TBSP = 3 TSP = 1/2 FL OZ (US)</small></div>',
    steps: () => `<p>In US measures a tablespoon is exactly 3 teaspoons, so multiply tablespoons by 3: ${say('volume', 'tbsp', 'tsp', 2)}. Half a tablespoon is 1.5 teaspoons.</p><p>To go the other way divide teaspoons by 3: ${say('volume', 'tsp', 'tbsp', 12)}. Australian tablespoons are 20 mL and hold 4 teaspoons — see the <a href="/cooking-converter/">cooking converter</a> for that standard.</p>`,
    faqs: () => [
      ['How many teaspoons are in a tablespoon?', `${say('volume', 'tbsp', 'tsp', 1)} in the US, UK and Canada. In Australia a tablespoon is 20 mL, which is 4 teaspoons.`],
      ['How many teaspoons are in 1.5, 2 and 3 tablespoons?', `${say('volume', 'tbsp', 'tsp', 1.5)}, ${say('volume', 'tbsp', 'tsp', 2)} and ${say('volume', 'tbsp', 'tsp', 3)}.`],
      ['How do I convert teaspoons to tablespoons?', `Divide by 3. ${say('volume', 'tsp', 'tbsp', 1)}, ${say('volume', 'tsp', 'tbsp', 6)} and ${say('volume', 'tsp', 'tbsp', 12)}.`],
      ['How many mL are a teaspoon and a tablespoon?', `A US teaspoon is ${val('volume', 'tsp', 'ml', 1)} and a tablespoon ${val('volume', 'tbsp', 'ml', 1)} (often rounded to 5 and 15 mL).`],
      ['How many tablespoons are in a cup?', `${say('volume', 'cup', 'tbsp', 1)}, so a cup is ${say('volume', 'cup', 'tsp', 1)}.`]
    ] },
  { slug: 'acres-to-sq-ft', cat: 'area', a: 'ac', b: 'ft2', ex: 0.25, vals: [0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.33], rvals: [1000, 5000, 10000, 43560, 100000],
    h1: 'Acres to Square Feet Converter', link: 'acres to square feet', title: 'Acres to Square Feet Converter — Acres to Sq Ft (and Sq Ft to Acres) | CalcThis',
    eyebrow: 'Acres to square feet, and square feet to acres', sib: ['feet-to-inches', 'yards-to-meters', 'tablespoons-to-ml'],
    formula: '<div class="formula">square feet = acres × 43,560<small>ACRES = SQ FT ÷ 43,560 · 1 ACRE = 4,046.8564 M² · 1 HECTARE = 2.4710538 ACRES</small></div>',
    steps: () => `<p>An acre is exactly 43,560 square feet, so multiply acres by 43,560: ${say('area', 'ac', 'ft2', 0.25)} for a quarter acre. A typical suburban lot of 0.25 to 0.33 acre is 10,890 to 14,375 square feet.</p><p>To go the other way divide square feet by 43,560: ${say('area', 'ft2', 'ac', 10000)}. Under the answer the converter also lists square meters, hectares and square miles.</p>`,
    faqs: () => [
      ['How many square feet are in an acre?', `${say('area', 'ac', 'ft2', 1)}, which is ${val('area', 'ac', 'm2', 1)}.`],
      ['How many square feet are in a quarter acre?', `${say('area', 'ac', 'ft2', 0.25)}. A third of an acre (0.33 ac) is ${val('area', 'ac', 'ft2', 0.33)} and half an acre (0.5 ac) is ${val('area', 'ac', 'ft2', 0.5)}.`],
      ['How do I convert square feet to acres?', `Divide by 43,560. ${say('area', 'ft2', 'ac', 10000)}, ${say('area', 'ft2', 'ac', 43560)} and ${say('area', 'ft2', 'ac', 100000)}.`],
      ['How big is an acre as a square?', `About 208.7 feet on each side (the square root of 43,560 sq ft), or ${val('area', 'ac', 'm2', 1)}.`],
      ['How many acres are in a hectare?', `${say('area', 'ha', 'ac', 1)}, and a square mile is ${val('area', 'mi2', 'ac', 1)}.`]
    ] },
  { slug: 'tablespoons-to-ml', cat: 'volume', a: 'tbsp', b: 'ml', ex: 2, vals: [1, 1.5, 2, 3, 4, 5, 6], rvals: [5, 10, 15, 30, 50, 100],
    h1: 'Tablespoons to mL Converter', link: 'tablespoons to mL', title: 'Tablespoons to mL Converter — Tbsp to Milliliters (and mL to Tbsp) | CalcThis',
    eyebrow: 'Tablespoons to milliliters, and mL to tablespoons', sib: ['tablespoons-to-teaspoons', 'ml-to-oz', 'cups-to-grams'],
    formula: '<div class="formula">mL = US tablespoons × 14.78676478<small>TBSP = ML ÷ 14.78676478 · 1 TSP = 4.92892159 ML · METRIC TBSP = 15 ML · AUSTRALIAN TBSP = 20 ML</small></div>',
    steps: () => `<p>A US tablespoon is exactly 14.78676478 mL, which recipes round to 15 mL. Multiply tablespoons by 14.78676: ${say('volume', 'tbsp', 'ml', 2)}. To go the other way divide mL by 14.78676: ${say('volume', 'ml', 'tbsp', 30)}.</p><p>A metric tablespoon is exactly 15 mL and an Australian one is 20 mL, so a 3-tablespoon recipe is 45 mL in the UK and 60 mL in Australia. The <a href="/cooking-converter/">cooking converter</a> lets you pick the standard.</p>`,
    faqs: () => [
      ['How many mL are in a tablespoon?', `A US tablespoon is ${val('volume', 'tbsp', 'ml', 1)}, usually rounded to 15 mL. A metric tablespoon is exactly 15 mL and an Australian tablespoon 20 mL.`],
      ['How many mL are in 2 and 3 tablespoons?', `${say('volume', 'tbsp', 'ml', 2)} and ${say('volume', 'tbsp', 'ml', 3)} in US measures.`],
      ['How do I convert mL to tablespoons?', `Divide by 14.78676. ${say('volume', 'ml', 'tbsp', 15)}, ${say('volume', 'ml', 'tbsp', 30)} and ${say('volume', 'ml', 'tbsp', 100)}.`],
      ['How many mL are in a teaspoon?', `${val('volume', 'tsp', 'ml', 1)} (US), usually rounded to 5 mL.`],
      ['How many tablespoons are in a cup?', `${say('volume', 'cup', 'tbsp', 1)}, which is ${val('volume', 'cup', 'ml', 1)}.`]
    ] }
];
const pairUrl = (p) => '/' + p.slug + '/';
const popularLinks = (c) => { const l = PAIRS.filter((p) => p.cat === c); return l.length ? '<h2>Popular conversions</h2><ul class="pc-statelist">' + l.map((p) => '<li><a href="' + pairUrl(p) + '">' + p.h1.replace(' Converter', '') + '</a></li>').join('') + '</ul>' : ''; };

const lw = (t) => t.replace(/^\S+/, (w) => w.toLowerCase());
function writePair(p) {
  const c = p.cat, url = 'https://calcthis.co' + pairUrl(p), f = p.faqs();
  const answer = p.answer ? p.answer() : c === 'temperature' ? say(c, p.a, p.b, 0) + ', ' + say(c, p.a, p.b, 100) : one(c, p.a, p.b);
  const desc = p.desc ? p.desc : answer + '. Free ' + p.link + ' converter, both directions: type any value for an instant answer, with a table of the most common values.';
  const hero = `<strong>${answer}.</strong> Type a value for an instant answer — use the swap button for ${lw(nm(c, p.b))} to ${lw(nm(c, p.a))} — with a table of the most common values below.`;
  const content = `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to convert ${p.link}</h2>
        ${p.steps()}
        <h2>The formula</h2>
        ${p.formula}
        ${p.tables ? p.tables() : `<h2>${nm(c, p.a)} to ${nm(c, p.b).toLowerCase()} — common values</h2>
        ${pairTable(c, p.a, p.b, p.vals)}
        <h2>${nm(c, p.b)} to ${nm(c, p.a).toLowerCase()} — common values</h2>
        ${pairTable(c, p.b, p.a, p.rvals)}`}
        ${SOURCE}
      </div>
      <div>
        <h2>More conversions</h2>
        <ul class="pc-statelist">${p.sib.map((s) => { const q = PAIRS.find((x) => x.slug === s); return '<li><a href="' + pairUrl(q) + '">' + q.h1.replace(' Converter', '') + '</a></li>'; }).join('')}</ul>
        <p>Need another unit? Use the full <a href="${urlOf(c)}">${P[c].h1.toLowerCase()}</a>, or see <a href="/unit-converter/">all unit converters</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>`;
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' },
    { '@type': 'ListItem', position: 2, name: 'Unit Converter', item: 'https://calcthis.co/unit-converter/' },
    { '@type': 'ListItem', position: 3, name: P[c].h1, item: 'https://calcthis.co' + urlOf(c) },
    { '@type': 'ListItem', position: 4, name: p.h1, item: url }] };
  const pills = [pill(urlOf(c), P[c].h1, PILLSVG)].concat(p.sib.map((s) => { const q = PAIRS.find((x) => x.slug === s); return pill(pairUrl(q), q.h1, PILLSVG); })).concat([pill('/unit-converter/', 'Unit Converter', PILLSVG)]);
  const html = headFor({ title: p.title, desc, url }) + [jsonApp(p.h1, url, desc), jsonFaq(f), crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('') + '</head>\n' + bodyFor({ cat: c, eyebrow: p.eyebrow, h1: p.h1, hero, ph: String(p.ex), content, pills, pair: p });
  write(p.slug + '/index.html', html);
}

writeHub(); ORDER.forEach(writeCat); PAIRS.forEach(writePair);
console.log('pages written: hub +', ORDER.length, 'converters +', PAIRS.length, 'pair pages');

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fp = ROOT + rel; let s = fs.readFileSync(fp, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fp, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const slugs = ['/unit-converter/'].concat(ORDER.map(urlOf)).concat(PAIRS.map(pairUrl));
edit('sitemap.xml', (sm) => {
  const today = new Date().toISOString().slice(0, 10); let add = '';
  slugs.forEach((u) => { if (!sm.includes('<loc>https://calcthis.co' + u + '</loc>')) add += '  <url>\n    <loc>https://calcthis.co' + u + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' + (u === '/unit-converter/' ? '0.8' : '0.7') + '</priority>\n  </url>\n'; });
  return add ? sm.replace('</urlset>', () => add + '</urlset>') : sm;
});
edit('build.js', (s) => {
  let add = '';
  slugs.forEach((u) => { const file = u.slice(1) + 'index.html'; if (!s.includes("file: '" + file + "'")) add += "  { file: '" + file + "', slug: '" + u + "' },\n"; });
  return add ? s.replace("  { file: 'paycheck-calculator/index.html',   slug: '/paycheck-calculator/' },\n", (mm) => mm + add) : s;
});
edit('llms.txt', (lt) => {
  lt = lt.replace(/\n## Unit converters\n[\s\S]*?(?=\n## |$)/, '');
  return lt.trimEnd() + '\n\n## Unit converters\n- [Unit Converter](https://calcthis.co/unit-converter/): convert length, weight, volume, temperature, area, speed, data storage, cooking measures and px to rem.\n' + ORDER.map((c) => '- [' + P[c].h1 + '](https://calcthis.co' + urlOf(c) + '): ' + P[c].eyebrow + '.').join('\n') + '\n' + PAIRS.map((p) => '- [' + p.h1 + '](https://calcthis.co' + pairUrl(p) + '): ' + p.eyebrow + '.').join('\n') + '\n';
});
edit('partials/header.html', (s) => {
  const block = '          <!--UNITNAV:START-->\n          <span class="menu-col-head">Unit Converters</span>\n          <a href="/unit-converter/">Unit Converter</a>\n' + ORDER.map((c) => '          <a href="' + urlOf(c) + '">' + P[c].h1.replace(' Converter', '').replace('Cooking Measurement', 'Cooking') + ' Converter</a>').join('\n') + '\n          <!--UNITNAV:END-->\n';
  if (s.includes('<!--UNITNAV:START-->')) return s.replace(/          <!--UNITNAV:START-->[\s\S]*?<!--UNITNAV:END-->\n/, () => block);
  return s.replace('          <span class="menu-col-head">Money &amp; Finance</span>\n', (mm) => block + mm);
});
edit('partials/footer.html', (s) => {
  const block = '<!--UNITFOOT:START-->\n<div class="footer-col" style="order:7">\n        <button class="footer-col-btn" aria-expanded="false" type="button">\n          <span class="fttl"><span class="ft1">Unit</span> <span class="ft2">Converters</span></span>\n          <svg class="footer-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>\n        </button>\n        <ul class="footer-links">\n          <li><a href="/unit-converter/">Unit Converter</a></li>\n' + ORDER.map((c) => '          <li><a href="' + urlOf(c) + '">' + P[c].h1 + '</a></li>').join('\n') + '\n        </ul>\n      </div>\n<!--UNITFOOT:END-->\n';
  if (s.includes('<!--UNITFOOT:START-->')) return s.replace(/<!--UNITFOOT:START-->[\s\S]*?<!--UNITFOOT:END-->\n/, () => block);
  const i = s.indexOf('          <!--STAXFOOT:END-->'); const j = s.indexOf('      </div>\n', i) + '      </div>\n'.length;
  return s.slice(0, j) + block + s.slice(j);
});
edit('index.html', (h) => {
  if (!h.includes('"name": "Unit Converter"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Sales Tax Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Unit Converter", "url": "https://calcthis.co/unit-converter/", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('data-cat="units"')) h = h.replace(/(    <button class="cat-tab" type="button" data-cat="salestax"[^\n]*\n)/, (mm) => mm + '    <button class="cat-tab" type="button" data-cat="units" role="tab" aria-selected="false">Unit<br>Converters</button>\n');
  if (!h.includes('id="grp-units"')) h = h.replace('  <section class="prose">', () => '  <section id="grp-units" class="cat-grp cat-grp--hidden" aria-label="Unit converters">\n    <p class="st-lead">One converter per job — length with a ruler, temperature with a thermometer, cooking by ingredient, px to rem with your own root size.</p>\n    <!--UNITCUBES:START-->\n    <!--UNITCUBES:END-->\n  </section>\n\n  <section class="prose">');
  const cubeA = (href, k, name, cls) => '      <a class="st-cube' + (cls || '') + '" href="' + href + '"><span class="st-ico" aria-hidden="true">' + cubeSvg(k) + '</span><span class="st-name">' + name + '</span></a>';
  const cubes = ['    <!--UNITCUBES:START-->', '    <div class="st-cubes">', cubeA('/unit-converter/', 'all', 'All converters', ' st-all')].concat(ORDER.map((c) => cubeA(urlOf(c), c, c === 'css' ? 'PX to REM' : E.CATS[c].name))).concat(['    </div>', '    <!--UNITCUBES:END-->']).join('\n');
  h = h.replace(/    <!--UNITCUBES:START-->[\s\S]*?<!--UNITCUBES:END-->/, () => cubes);
  if (!/units:document\.getElementById\('grp-units'\)/.test(h)) h = h.replace("salestax:document.getElementById('grp-salestax')", () => "salestax:document.getElementById('grp-salestax'),units:document.getElementById('grp-units')");
  return h;
});
