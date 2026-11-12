/* Unique written content for the 18 unit-pair pages (added 2026-11-12, session #10, SEO thin-content fix).
   Used by gen-unit-pages.js. Every number comes from the unit engine (H.say / H.val / H.cv), so text and tool always agree.
   Facts read 2026-11-12: NIST SP 811 Appendix B.8 (inch 2.54 cm, foot 0.3048 m, yard 0.9144 m, mile 1609.344 m, nautical mile 1852 m and hectare
   10,000 m2 are exact; US cup 236.5882 mL, tablespoon 14.78676 mL, teaspoon 4.928922 mL, US fl oz 29.57353 mL, US liquid quart 0.9463529 L,
   US gallon 3.785412 L, avoirdupois ounce 28.34952 g, pound 0.4535924 kg, knot 0.514444 m/s, acre based on the US survey foot 4046.873 m2;
   deg C = (deg F - 32)/1.8, K = deg C + 273.15), NIST SP 811 chapter 4 (kilo/mega/giga are never 1024-powers), NIST binary prefixes page (IEC 1998),
   NIST kilogram introduction (platinum-iridium prototype until the November 2018 vote), NIST kelvin introduction (0 K = -273.15 C = -459.67 F). */
module.exports = (H) => {
  const { say, val, cv, F, FF, pairTable, E } = H;
  const pct = (x) => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(1) + '%';
  const err = (cat, a, b, f, xs, o) => { let m = 0; xs.forEach((x) => { const t = cv(cat, a, b, x, o); m = Math.max(m, Math.abs((f(x) - t) / t)); }); return (m * 100).toFixed(1) + '%'; };
  const rel = (approx, exact) => pct((approx / exact - 1) * 100);
  const L = (arr) => '<ul>' + arr.map((s) => '<li>' + s + '</li>').join('') + '</ul>';
  const X = {};

  X['cm-to-inches'] = {
    defs: () => `<p>A <strong>centimeter</strong> is one hundredth of a meter (the SI prefix centi means 10⁻²). An <strong>inch</strong> is defined as exactly 2.54 centimeters, which makes a foot exactly 30.48 cm and a yard exactly 91.44 cm (NIST SP 811, Appendix B.8).</p><p>Because the factor is exact, the definition never rounds. If two calculators disagree on a cm-to-inch answer, the only difference is how many decimals each one shows.</p>`,
    work: () => { const x = 173, i = cv('length', 'cm', 'in', x); return `<p>Take a height of ${x} cm. Divide by 2.54: ${say('length', 'cm', 'in', x)}. Split that into feet and inches: ${Math.floor(i / 12)} ft and ${F(i % 12, '4sig')} in, or ${Math.floor(i / 12)} ft ${E.tape(i % 12).text} in on a tape measure (nearest 1/16 in).</p>`; },
    tip: () => `<p>For a quick estimate multiply the centimeters by 4 and drop one zero (× 0.4): ${val('length', 'cm', 'in', 100)} exactly, but the shortcut says 40 in. It runs ${rel(0.4, 1 / 2.54)} high at any size (25–200 cm), which is fine for a shelf or a suitcase and too coarse for anything you will cut.</p>`,
    mist: () => [`<strong>Rounding 2.54 to 2.5.</strong> It looks harmless, but it turns ${val('length', 'cm', 'in', 100)} into 40 in, ${rel(0.4, 1 / 2.54)} too high.`, `<strong>Reading decimals as fractions.</strong> ${val('length', 'cm', 'in', 10)} is not 3 9/10 in: the .937 means about 15/16, so it is ${E.tape(cv('length', 'cm', 'in', 10)).text} in on a tape.`, `<strong>Mixing up cm and mm.</strong> 25 mm is ${val('length', 'mm', 'cm', 25)}, which is ${val('length', 'mm', 'in', 25)}, not ${val('length', 'cm', 'in', 25)}.`],
    ref: { cat: 'length', a: 'cm', b: 'in', vals: [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 14, 15, 18, 20, 22, 25, 28, 30, 35, 45, 70, 75, 90, 100, 120, 150, 160, 165, 170, 175, 180, 185, 190, 200], title: 'Centimeters to inches — quick reference' }
  };

  X['kg-to-lbs'] = {
    defs: () => `<p>The <strong>kilogram</strong> is the SI unit of mass. For more than a century it was the mass of a platinum-iridium cylinder kept near Paris (the International Prototype of the Kilogram, nicknamed Le Grand K); in November 2018 the international community voted to redefine it from a constant of nature instead (NIST, “Kilogram: Introduction”). The <strong>pound</strong> is defined from the kilogram as 0.45359237 kg; NIST lists it as 0.4535924 kg (SP 811, Appendix B.8).</p><p>A pound is 16 ounces and a stone is 14 pounds, which is why body weights are written as 12 st 5 lb in the UK and as plain pounds in the US.</p>`,
    work: () => { const x = 82, p = cv('weight', 'kg', 'lb', x); return `<p>Take ${x} kg. Multiply by 2.2046226: ${say('weight', 'kg', 'lb', x)}. The decimal part is a fraction of a pound, so multiply it by 16 for ounces: 0.${String(p.toFixed(4)).split('.')[1]} × 16 = ${F((p % 1) * 16, '1dp')} oz. So ${x} kg is ${Math.floor(p)} lb ${F((p % 1) * 16, '1dp')} oz.</p>`; },
    tip: () => `<p>Double the kilograms and add 10% of that doubled number: for 82 kg, 164 + 16.4 = 180.4 lb against the exact ${val('weight', 'kg', 'lb', 82)}. The shortcut is within ${err('weight', 'kg', 'lb', (x) => x * 2.2, [20, 50, 82, 100, 150])} of the right answer, so it is good for a luggage allowance or a quick body-weight check.</p>`,
    mist: () => [`<strong>Treating decimal pounds as ounces.</strong> ${val('weight', 'kg', 'lb', 68)} is not 149 lb 9 oz; the .9 is 0.9 of a pound, about 14 oz.`, `<strong>Using 2.2 instead of 2.2046.</strong> ${val('weight', 'kg', 'lb', 100)} becomes 220 lb, which is ${rel(2.2, 2.2046226)} off — small, but it adds up for shipping weights.`, `<strong>Mixing kg and lb on a form.</strong> Doses, luggage limits and shipping rates are often per kg or per lb; check which one the field wants before typing a converted number.`],
    ref: { cat: 'weight', a: 'kg', b: 'lb', vals: [0.5, 1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 120, 150], title: 'Kilograms to pounds — quick reference' }
  };

  X['celsius-to-fahrenheit'] = {
    defs: () => `<p>On the Celsius scale water freezes at 0 °C and boils at 100 °C at sea level; on the Fahrenheit scale those points are 32 °F and 212 °F, so one Celsius degree is 1.8 Fahrenheit degrees. NIST gives the relation as t/°C = (t/°F − 32)/1.8 (SP 811, Appendix B.8).</p><p>Both scales sit on top of the kelvin: 0 K is −273.15 °C or −459.67 °F, and a change of one kelvin equals a change of one degree Celsius (NIST, “Kelvin: Introduction”). The same page puts room temperature at about 70 °F, 21 °C or 294 K.</p>`,
    work: () => `<p>Take ${say('temperature', 'c', 'f', 22).split(' = ')[0]}. Multiply by 1.8: 22 × 1.8 = 39.6. Add 32: 39.6 + 32 = 71.6. So ${say('temperature', 'c', 'f', 22)}. Going back, subtract 32 first and then divide by 1.8: (71.6 − 32) ÷ 1.8 = 22.</p>`,
    tip: () => `<p>Double the Celsius value and add 30. It is exact only at 10 °C: at 0 °C it gives 30 instead of ${val('temperature', 'c', 'f', 0)} (2 °F low), at 20 °C it gives 70 instead of ${val('temperature', 'c', 'f', 20)} (2 °F high) and at 30 °C it gives 90 instead of ${val('temperature', 'c', 'f', 30)} (4 °F high). That is fine for weather and no use for baking or lab work.</p>`,
    mist: () => [`<strong>Forgetting the offset.</strong> Multiplying 22 by 1.8 and stopping gives 39.6 °F; you must add 32 to reach ${val('temperature', 'c', 'f', 22)}.`, `<strong>Adding 32 before multiplying.</strong> (22 + 32) × 1.8 = 97.2 is wrong; multiply first, then add.`, `<strong>Converting a change as if it were a reading.</strong> A temperature rise of 10 °C is a rise of 18 °F, not 50 °F; the +32 offset applies to readings only.`],
    ref: { cat: 'temperature', a: 'c', b: 'f', vals: [-40, -30, -20, -10, 0, 5, 10, 15, 18, 20, 21, 22, 25, 30, 35, 37, 40, 50, 60, 100, 120, 150, 160, 175, 180, 190, 200, 220, 230, 250], title: 'Celsius to Fahrenheit — quick reference' }
  };

  X['mm-to-inches'] = {
    defs: () => `<p>A <strong>millimeter</strong> is one thousandth of a meter. An <strong>inch</strong> is exactly 25.4 millimeters (2.54 cm; NIST SP 811, Appendix B.8), so a foot is exactly 304.8 mm.</p><p>Millimeters and decimal inches are both used for small parts, and the exact factor lets you move between them without any drift: ${say('length', 'in', 'mm', 1)}, ${say('length', 'in', 'mm', 0.5)} and ${say('length', 'in', 'mm', 0.125)}.</p>`,
    work: () => { const x = 38, i = cv('length', 'mm', 'in', x); return `<p>Take ${x} mm. Divide by 25.4: ${say('length', 'mm', 'in', x)}. To read it on a tape measure, round to the nearest 1/16 in: ${E.tape(i).text} in. The difference between the decimal and the fraction is ${F(Math.abs(i - 1.5) * 25.4, '2sig')} mm.</p>`; },
    tip: () => `<p>Divide the millimeters by 25 instead of 25.4: ${val('length', 'mm', 'in', 100)} exactly, but the shortcut gives 4 in. It is always ${rel(1 / 25, 1 / 25.4)} high, which is about 0.4 mm on every 25 mm.</p>`,
    mist: () => [`<strong>Treating 6 mm as 1/4 in.</strong> A quarter inch is ${val('length', 'in', 'mm', 0.25)}, so a 6 mm part is ${F(6.35 - 6, '2sig')} mm smaller than a 1/4 in one.`, `<strong>Mixing up mm and cm.</strong> 10 mm is ${val('length', 'mm', 'cm', 10)} and ${val('length', 'mm', 'in', 10)}; 10 cm is ${val('length', 'cm', 'in', 10)}.`, `<strong>Quoting too many decimals.</strong> ${val('length', 'mm', 'in', 7)} is a measurement you cannot read off a ruler; round to the precision your tool can actually measure.`],
    ref: { cat: 'length', a: 'mm', b: 'in', vals: [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 19, 20, 22, 25, 30, 32, 38, 40, 50, 60, 75, 100, 150, 200, 250, 300], title: 'Millimeters to inches — quick reference' }
  };

  X['grams-to-ounces'] = {
    defs: () => `<p>A <strong>gram</strong> is one thousandth of a kilogram. The avoirdupois <strong>ounce</strong> is one sixteenth of a pound, about 28.35 g (NIST lists 28.34952 g in SP 811, Appendix B.8). It measures weight, not volume.</p><p>Fluid ounces are a different unit: a US fluid ounce is 29.57353 mL (NIST), so “8 oz” on a milk carton and “8 oz” of cheese are not the same kind of ounce.</p>`,
    work: () => { const x = 250; return `<p>Take ${x} g of butter. Divide by 28.349523: ${say('weight', 'g', 'oz', x)}. As pounds and ounces: ${Math.floor(cv('weight', 'g', 'oz', x) / 16)} lb ${F(cv('weight', 'g', 'oz', x) % 16, '1dp')} oz. To check, go back: ${say('weight', 'oz', 'g', 8.8)}.</p>`; },
    tip: () => `<p>Divide the grams by 28 for ounces: ${val('weight', 'g', 'oz', 280)} exactly, and the shortcut says 10 oz. It is ${rel(1 / 28, 1 / 28.349523125)} high, which is under half an ounce at 1 lb. Dividing by 30 is easier but ${rel(1 / 30, 1 / 28.349523125)} low.</p>`,
    mist: () => [`<strong>Mixing up weight and fluid ounces.</strong> ${val('weight', 'oz', 'g', 8)} is the weight of 8 oz of flour; 8 fl oz is ${val('volume', 'floz', 'ml', 8)} of volume.`, `<strong>Treating a 454 g pack as 16 oz exactly.</strong> ${val('weight', 'lb', 'g', 1)} is 453.59 g, so packs labelled 454 g and 1 lb are the same thing, rounded.`, `<strong>Using the wrong direction.</strong> Grams are smaller than ounces, so the ounce number is always smaller: ${say('weight', 'g', 'oz', 100)}.`],
    ref: { cat: 'weight', a: 'g', b: 'oz', vals: [5, 10, 15, 20, 25, 28, 30, 50, 60, 75, 85, 100, 113, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 454, 500, 750, 1000], title: 'Grams to ounces — quick reference' }
  };

  X['ml-to-oz'] = {
    defs: () => `<p>A <strong>milliliter</strong> is one thousandth of a liter, the same volume as one cubic centimeter. A US <strong>fluid ounce</strong> is 29.57353 mL (NIST SP 811, Appendix B.8), so a US cup of 8 fl oz is ${val('volume', 'cup', 'ml', 1)}.</p><p>The imperial (UK) fluid ounce is smaller, ${val('volume', 'ukfloz', 'ml', 1)}, because the imperial pint holds 20 fluid ounces and the US pint only 16. Which one a recipe or label means depends on the country it was written for.</p>`,
    work: () => { const x = 355; return `<p>Take a ${x} mL can. Divide by 29.5735: ${say('volume', 'ml', 'floz', x)}, the familiar “12 fl oz” can. In imperial ounces the same can is ${val('volume', 'ml', 'ukfloz', x)}. To check, multiply back: ${say('volume', 'floz', 'ml', 12)}.</p>`; },
    tip: () => `<p>Divide by 30 for a quick answer: ${val('volume', 'ml', 'floz', 500)} exactly, shortcut 16.7 fl oz. It is ${rel(1 / 30, 1 / 29.5735295625)} low, which is plenty for a drink or a bottle and not enough for a dosage.</p>`,
    mist: () => [`<strong>Using the wrong ounce.</strong> 250 mL is ${val('volume', 'ml', 'floz', 250)} (US) but ${val('volume', 'ml', 'ukfloz', 250)} (imperial), about 4% different.`, `<strong>Assuming 1 mL weighs 1 g.</strong> That is only true for water; use the <a href="/cups-to-grams/">cups to grams converter</a> for ingredients.`, `<strong>Mixing up fl oz and oz.</strong> A fluid ounce measures volume; for weight use <a href="/grams-to-ounces/">grams to ounces</a>.`],
    ref: { cat: 'volume', a: 'ml', b: 'floz', vals: [5, 10, 15, 30, 50, 60, 75, 100, 120, 150, 177, 200, 237, 250, 300, 330, 355, 375, 440, 473, 500, 568, 750, 1000], title: 'Milliliters to US fluid ounces — quick reference' }
  };

  X['mb-to-gb'] = {
    defs: () => `<p>In the SI system a <strong>megabyte</strong> is exactly 1,000,000 bytes and a <strong>gigabyte</strong> is exactly 1,000,000,000 bytes (NIST: 1 MB = 10⁶ B, 1 GB = 10⁹ B). NIST also states that kilo, mega and giga may never be used to mean powers of 1,024 (SP 811, chapter 4).</p><p>Computer memory comes in powers of two, so in December 1998 the IEC approved separate names: the <strong>mebibyte</strong> (1 MiB = 2²⁰ B = 1,048,576 B) and the <strong>gibibyte</strong> (1 GiB = 2³⁰ B = 1,073,741,824 B). Eight bits make one byte.</p>`,
    work: () => `<p>Take 2,500 MB. In decimal units divide by 1,000: ${say('data', 'MB', 'GB', 2500)}. In binary units divide by 1,024: ${say('data', 'MiB', 'GiB', 2500)}. The two answers differ by ${F((1 - 1000 / 1024) * 100, '2sig')}%, because a gibibyte is ${F(cv('data', 'GiB', 'GB', 1), '4sig')} GB.</p>`,
    tip: () => `<p>To convert decimal megabytes to gigabytes, move the decimal point three places left. To judge a drive: a 500 GB disk holds ${val('data', 'GB', 'GiB', 500)} when a program reports it in binary units, a 1,000 GB disk holds ${val('data', 'GB', 'GiB', 1000)}, so the “missing” space is just two units meeting, not a fault.</p>`,
    mist: () => [`<strong>Mixing MB and Mb.</strong> A capital B is a byte, a small b is a bit: ${say('data', 'MB', 'Mb', 1)}. A 100 Mbps connection moves at most ${val('data', 'Mb', 'MB', 100)} per second.`, `<strong>Mixing decimal and binary.</strong> ${val('data', 'MiB', 'MB', 1)} is not 1 MB; ${say('data', 'MiB', 'MB', 1024)} while 1,024 MB is ${val('data', 'MB', 'GB', 1024)}.`, `<strong>Expecting a 1,000 GB drive to show 1,000 GB.</strong> Software that divides by 1,024 reports ${val('data', 'GB', 'GiB', 1000)}.`],
    ref: { cat: 'data', a: 'MB', b: 'GB', vals: [1, 5, 10, 50, 100, 250, 500, 512, 750, 1000, 1024, 2000, 2048, 4000, 4096, 5000, 8000, 10000, 16000, 32000, 64000, 128000, 256000], title: 'Megabytes to gigabytes — quick reference' }
  };

  X['kb-to-mb'] = {
    defs: () => `<p>In the SI system a <strong>kilobyte</strong> is exactly 1,000 bytes and a <strong>megabyte</strong> is exactly 1,000,000 bytes (NIST: 1 MB = 10⁶ B). NIST states that kilo and mega must not stand for 1,024 and 1,048,576 (SP 811, chapter 4).</p><p>The IEC names for the binary sizes, approved in December 1998, are the <strong>kibibyte</strong> (1 KiB = 1,024 B) and the <strong>mebibyte</strong> (1 MiB = 1,048,576 B). A file size shown in KiB or MiB is a binary size even when the label says KB or MB.</p>`,
    work: () => `<p>Take a 3,500 KB file. In decimal units divide by 1,000: ${say('data', 'kB', 'MB', 3500)}. In binary units divide by 1,024: ${say('data', 'KiB', 'MiB', 3500)}. A mebibyte is ${F(cv('data', 'MiB', 'MB', 1), '4sig')} MB, so the binary figure is always about ${F((1 - 1 / 1.048576) * 100, '2sig')}% smaller.</p>`,
    tip: () => `<p>Move the decimal point three places left for KB to MB (decimal). For a binary size, divide by 1,000 and take off about 5%: ${val('data', 'KiB', 'MiB', 10000)} exactly, against 10 × 0.95 = 9.5 MiB by the shortcut.</p>`,
    mist: () => [`<strong>Mixing KB and Kb.</strong> A small b is a bit: ${say('data', 'kB', 'kb', 1)}. File sizes use bytes, connection speeds use bits.`, `<strong>Expecting 1,000 KB = 1 MiB.</strong> ${say('data', 'KiB', 'MiB', 1024)} while 1,000 KiB is only ${val('data', 'KiB', 'MiB', 1000)}.`, `<strong>Using decimal for memory.</strong> RAM and cache sizes are binary, so ${val('data', 'MiB', 'KiB', 1)} is the number to use there.`],
    ref: { cat: 'data', a: 'kB', b: 'MB', vals: [1, 5, 10, 50, 100, 250, 500, 512, 750, 1000, 1024, 2000, 2048, 3500, 5000, 10000, 10240, 25000, 50000, 100000], title: 'Kilobytes to megabytes — quick reference' }
  };

  X['cups-to-grams'] = {
    defs: () => `<p>A US <strong>cup</strong> is a volume: 236.5882 mL (NIST SP 811, Appendix B.8), or 16 tablespoons. A <strong>gram</strong> is a weight, one thousandth of a kilogram. There is no fixed number of grams in a cup, because each ingredient has its own density: a cup holds about ${val('cooking', 'cup', 'g', 1, { ing: 'flour', std: 'us' })} of all-purpose flour and ${val('cooking', 'cup', 'g', 1, { ing: 'honey', std: 'us' })} of honey.</p><p>The values on this page are typical, about ±5%, because flour packs differently from scoop to scoop. Metric countries often use a 250 mL cup, which the Go advanced option applies.</p>`,
    work: () => { const o = { ing: 'flour', std: 'us' }; return `<p>A recipe needs 1 3/4 cups of all-purpose flour. Multiply by the grams per cup: 1.75 × ${val('cooking', 'cup', 'g', 1, o)} = ${val('cooking', 'cup', 'g', 1.75, o)}. For 1 3/4 cups of granulated sugar the same step gives ${val('cooking', 'cup', 'g', 1.75, { ing: 'sugar', std: 'us' })}, and for butter ${val('cooking', 'cup', 'g', 1.75, { ing: 'butter', std: 'us' })}.</p>`; },
    tip: () => `<p>Memorize three anchors: flour about ${val('cooking', 'cup', 'g', 1, { ing: 'flour', std: 'us' })} per cup, sugar about ${val('cooking', 'cup', 'g', 1, { ing: 'sugar', std: 'us' })}, butter ${val('cooking', 'cup', 'g', 1, { ing: 'butter', std: 'us' })} (two sticks). Most flours, starches and meals fall between 95 and 140 g per cup, which makes a rough answer easy to sanity-check.</p>`,
    mist: () => [`<strong>Using one number for every ingredient.</strong> A cup of flour and a cup of honey differ by ${F(cv('cooking', 'cup', 'g', 1, { ing: 'honey', std: 'us' }) - cv('cooking', 'cup', 'g', 1, { ing: 'flour', std: 'us' }), '3sig')} g.`, `<strong>Scooping flour straight from the bag.</strong> It packs, so a “cup” can weigh noticeably more than ${val('cooking', 'cup', 'g', 1, { ing: 'flour', std: 'us' })}; spoon it into the cup and level it, or weigh it.`, `<strong>Mixing cup standards.</strong> A US cup is ${val('volume', 'cup', 'ml', 1)}, a metric cup 250 mL; for a large cake that is a 5.7% difference.`],
    ref: 'ingredients'
  };

  X['feet-to-inches'] = {
    defs: () => `<p>A <strong>foot</strong> is exactly 0.3048 meters (NIST SP 811, Appendix B.8) and is divided into 12 <strong>inches</strong>, so an inch is exactly 2.54 cm. A yard is 3 feet and a mile is 5,280 feet, exactly 1,609.344 m.</p><p>Heights are the most common use: people say 5 ft 10 in, while forms often ask for total inches (${val('length', 'ft', 'in', 5)} + 10 = 70 in).</p>`,
    work: () => `<p>Take a height of 6 ft 2 in. Multiply the feet by 12: 6 × 12 = 72. Add the leftover inches: 72 + 2 = ${6 * 12 + 2} in. In centimeters that is ${val('length', 'in', 'cm', 74)}. To reverse, divide by 12: ${say('length', 'in', 'ft', 74)}, which is 6 ft 2 in (0.1667 ft × 12 = 2 in).</p>`,
    tip: () => `<p>To multiply feet by 12 in your head, do ×10 and add ×2: 7 ft is 70 + 14 = 84 in. For inches to feet, divide by 12 and read the remainder as inches: 100 in ÷ 12 is 8 with a remainder of 4, so 8 ft 4 in.</p>`,
    mist: () => [`<strong>Reading 5.10 ft as 5 ft 10 in.</strong> Decimal feet are not feet-and-inches: 5.10 ft is ${val('length', 'ft', 'in', 5.1)}, whereas 5 ft 10 in is 70 in.`, `<strong>Forgetting the leftover inches.</strong> ${val('length', 'ft', 'in', 6)} is only the feet part of 6 ft 2 in.`, `<strong>Mixing up square and linear feet.</strong> 10 ft × 12 = 120 in is a length; areas multiply by 144 (12 × 12) to get square inches.`],
    ref: { cat: 'length', a: 'ft', b: 'in', vals: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9, 10, 12, 15, 20, 25, 50, 100], title: 'Feet to inches — quick reference' }
  };

  X['yards-to-meters'] = {
    defs: () => `<p>A <strong>yard</strong> is exactly 0.9144 meters and equals 3 feet or 36 inches. A mile is 1,760 yards, exactly 1,609.344 m (NIST SP 811, Appendix B.8: yard, foot, inch and mile are all exact). A <strong>meter</strong> is the SI unit of length.</p><p>Because the yard is a bit shorter than a meter, the meter figure is always smaller than the yard figure it comes from, and the other way round.</p>`,
    work: () => `<p>A football field is 100 yards between the goal lines. Multiply by 0.9144: ${say('length', 'yd', 'm', 100)}. A 100 m sprint going the other way: divide by 0.9144, ${say('length', 'm', 'yd', 100)}, which is ${F(cv('length', 'm', 'yd', 100) - 100, '3sig')} yd longer than the field.</p>`,
    tip: () => `<p>Take away about a tenth: 200 yards × 0.9 = 180 m, against the exact ${val('length', 'yd', 'm', 200)}. The shortcut is ${rel(0.9, 0.9144)} off. For meters to yards add about a tenth (+9% is closer): 100 m + 9 = 109 yd, exact ${val('length', 'm', 'yd', 100)}.`,
    mist: () => [`<strong>Treating a meter as a yard.</strong> Over 400 m the difference is ${F(cv('length', 'm', 'yd', 400) - 400, '3sig')} yards.`, `<strong>Mixing up miles and kilometers.</strong> 1,760 yd is one mile = ${val('length', 'yd', 'm', 1760)}, not 1,000 m.`, `<strong>Rounding 0.9144 to 0.91.</strong> ${val('length', 'yd', 'm', 1000)} becomes 910 m, ${rel(0.91, 0.9144)} off.`],
    ref: { cat: 'length', a: 'yd', b: 'm', vals: [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 110, 150, 200, 220, 300, 400, 440, 500, 880, 1000, 1760], title: 'Yards to meters — quick reference' }
  };

  X['liters-to-quarts'] = {
    defs: () => `<p>A <strong>liter</strong> is one cubic decimeter. A US liquid <strong>quart</strong> is 0.946353 L and a US gallon (4 quarts) is 3.785412 L (NIST SP 811, Appendix B.8), so a liter is a little more than a quart.</p><p>The imperial quart, used for UK recipes and older labels, is ${val('volume', 'ukqt', 'l', 1)}, about 20% bigger than the US one. Pick the right one before you convert.</p>`,
    work: () => `<p>A bottle holds 3.5 L. Divide by 0.946353: ${say('volume', 'l', 'qt', 3.5)}. As gallons: ${val('volume', 'l', 'gal', 3.5)}. In imperial quarts the same bottle is ${val('volume', 'l', 'ukqt', 3.5)}. Check by multiplying back: ${say('volume', 'qt', 'l', 3.7)}.</p>`,
    tip: () => `<p>Add 6% to the liters (L × 1.06): ${val('volume', 'l', 'qt', 5)} exactly, the shortcut gives 5.3 qt. It is within ${err('volume', 'l', 'qt', (x) => x * 1.06, [1, 2, 5, 10, 20])} of the right answer.</p>`,
    mist: () => [`<strong>Mixing US and imperial quarts.</strong> 2 L is ${val('volume', 'l', 'qt', 2)} US but ${val('volume', 'l', 'ukqt', 2)} imperial.`, `<strong>Treating a liter as a quart.</strong> A 4 L jug is ${val('volume', 'l', 'qt', 4)}, a little over a gallon, not exactly 4 quarts.`, `<strong>Mixing liquid and dry measures.</strong> This page uses US liquid quarts; a dry quart is a different volume and is not the same as the liquid one.`],
    ref: { cat: 'volume', a: 'l', b: 'qt', vals: [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7.5, 8, 10, 12, 15, 20, 25, 50], title: 'Liters to US quarts — quick reference' }
  };

  X['celsius-to-kelvin'] = {
    defs: () => `<p>The <strong>kelvin</strong> is the SI unit of temperature. It is written without a degree sign, and a change of one kelvin is the same size as a change of one degree Celsius, but the scale starts at absolute zero: 0 K = −273.15 °C = −459.67 °F (NIST, “Kelvin: Introduction”). NIST gives the relation as T/K = t/°C + 273.15 (SP 811, Appendix B.8).</p><p>Because of that fixed offset, no temperature below 0 K exists, and the converter rejects it.</p>`,
    work: () => `<p>Body temperature is 37 °C. Add 273.15: ${say('temperature', 'c', 'k', 37)}. For a laboratory freezer at −80 °C: ${say('temperature', 'c', 'k', -80)}. Going back, subtract 273.15: ${say('temperature', 'k', 'c', 294)}, which NIST gives as room temperature at 294 K (about 21 °C).</p>`,
    tip: () => `<p>For everyday numbers add 273: ${val('temperature', 'c', 'k', 25)} exactly, 298 by the shortcut. The shortcut is 0.15 K low at every temperature, which is smaller than most thermometers can resolve, but keep the .15 for physics and chemistry formulas.</p>`,
    mist: () => [`<strong>Writing °K.</strong> The unit is K, not °K, and it is spoken as “kelvins”.`, `<strong>Adding 32 or multiplying by 1.8.</strong> Kelvin and Celsius degrees are the same size, so only the offset 273.15 changes the number.`, `<strong>Entering a negative kelvin value.</strong> ${say('temperature', 'k', 'c', 0)} is absolute zero; nothing can be colder.`],
    ref: { cat: 'temperature', a: 'c', b: 'k', vals: [-273.15, -196, -80, -40, -20, -10, 0, 4, 10, 15, 20, 21, 25, 30, 37, 40, 50, 80, 100, 121, 150, 200, 500, 1000], title: 'Celsius to Kelvin — quick reference' }
  };

  X['knots-to-mph'] = {
    defs: () => `<p>A <strong>nautical mile</strong> is exactly 1,852 meters (NIST SP 811, Appendix B.8) and a <strong>knot</strong> is one nautical mile per hour, 0.514444 m/s. A statute mile, the one behind “miles per hour”, is exactly 1,609.344 m.</p><p>The nautical mile is about 15% longer than a statute mile, which is why a speed in knots is a smaller number than the same speed in mph by about the same percentage.</p>`,
    work: () => `<p>A boat travels at 18 knots. Multiply by 1.150779: ${say('speed', 'kn', 'mph', 18)}. In km/h: ${say('speed', 'kn', 'kmh', 18)}. Going back, a 60 mph wind in knots is ${say('speed', 'mph', 'kn', 60)}.</p>`,
    tip: () => `<p>Add 15% to the knots to get mph: for 35 kn that is 35 + 5.25 = 40.25 mph against the exact ${val('speed', 'kn', 'mph', 35)}. The shortcut is within ${err('speed', 'kn', 'mph', (x) => x * 1.15, [5, 10, 20, 35, 60, 120])}. For knots to km/h, multiply by 1.85.</p>`,
    mist: () => [`<strong>Saying “knots per hour”.</strong> A knot already means one nautical mile per hour, so “knots per hour” would be an acceleration.`, `<strong>Using statute miles for distance at sea.</strong> ${say('length', 'nmi', 'mi', 1)}; charts and flight plans use nautical miles.`, `<strong>Comparing knots with mph directly.</strong> 30 kn and 30 mph are not the same: ${say('speed', 'kn', 'mph', 30)}.`],
    ref: { cat: 'speed', a: 'kn', b: 'mph', vals: [1, 2, 3, 5, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40, 50, 60, 80, 100, 120, 150, 250, 450, 500], title: 'Knots to mph — quick reference' }
  };

  X['cups-to-tablespoons'] = {
    defs: () => `<p>In US measures a <strong>cup</strong> is 236.5882 mL and a <strong>tablespoon</strong> is 14.78676 mL (NIST SP 811, Appendix B.8), so a cup is exactly 16 tablespoons. A teaspoon is 4.928922 mL, so a tablespoon is 3 teaspoons and a cup 48 teaspoons.</p><p>Recipes usually round these to 240 mL, 15 mL and 5 mL. The rounded cup is ${val('volume', 'cup', 'ml', 1)} before rounding, so a 240 mL measuring cup is about 1.4% larger than a US cup.</p>`,
    work: () => `<p>A recipe wants 2/3 cup of oil. Multiply by 16: 2/3 × 16 = ${val('volume', 'cup', 'tbsp', 2 / 3, undefined, '4sig')}, that is 10 tbsp + 2 tsp. For 5/8 cup: ${val('volume', 'cup', 'tbsp', 0.625)}. Going back, divide by 16: ${say('volume', 'tbsp', 'cup', 6)}.</p>`,
    tip: () => `<p>Remember the quarters: 1/4 cup = 4 tbsp, 1/2 cup = 8 tbsp, 3/4 cup = 12 tbsp and 1 cup = 16 tbsp. Anything else is a multiple of 1/16 cup (1 tbsp): 1/8 cup = 2 tbsp, 1/3 cup = ${val('volume', 'cup', 'tbsp', 1 / 3, undefined, '4sig')}.</p>`,
    mist: () => [`<strong>Using 15 tablespoons per cup.</strong> The US cup is 16 tablespoons; 15 mL is only the rounded tablespoon.`, `<strong>Mixing tablespoon standards.</strong> The US tablespoon is ${val('volume', 'tbsp', 'ml', 1)}; a metric tablespoon is exactly 15 mL and an Australian one 20 mL, so a 12-tablespoon recipe changes by up to a third.`, `<strong>Mixing up tablespoons and teaspoons.</strong> ${say('volume', 'tbsp', 'tsp', 1)}; a cup is ${val('volume', 'cup', 'tsp', 1)}.`],
    ref: { cat: 'volume', a: 'cup', b: 'tbsp', vals: [0.0625, 0.125, 0.25, 1 / 3, 0.375, 0.5, 0.625, 2 / 3, 0.75, 0.875, 1, 1.25, 1.5, 2, 2.5, 3, 4], title: 'Cups to tablespoons — quick reference', note: true }
  };

  X['tablespoons-to-teaspoons'] = {
    defs: () => `<p>A US <strong>tablespoon</strong> is 14.78676 mL and a <strong>teaspoon</strong> is 4.928922 mL (NIST SP 811, Appendix B.8), exactly one third of a tablespoon, so 1 tbsp = 3 tsp and 1 US fl oz = 2 tbsp = 6 tsp.</p><p>Many labels round the teaspoon to 5 mL and the tablespoon to 15 mL; the 3-to-1 ratio stays the same.</p>`,
    work: () => `<p>A recipe wants 2 1/2 tablespoons of sugar but you only have a teaspoon. Multiply by 3: ${say('volume', 'tbsp', 'tsp', 2.5)}. For 1/3 tablespoon: ${say('volume', 'tbsp', 'tsp', 1 / 3)}. Going back, 9 tsp is ${say('volume', 'tsp', 'tbsp', 9)}.</p>`,
    tip: () => `<p>Think in threes: 1 tsp = 1/3 tbsp, 2 tsp = 2/3 tbsp, 3 tsp = 1 tbsp. Half a tablespoon is 1 1/2 teaspoons and a quarter tablespoon is 3/4 teaspoon.</p>`,
    mist: () => [`<strong>Using the Australian tablespoon.</strong> It is 20 mL, which is 4 teaspoons, so the same recipe changes by a third.`, `<strong>Rounding 1/3 tbsp to 1 tsp.</strong> It is exact in the 3:1 ratio, but a leveled measure is rarely exact; the precision is about ±5%.`, `<strong>Mixing volume and weight.</strong> Spoons measure volume; a tablespoon of salt, honey and flour all weigh differently.`],
    ref: { cat: 'volume', a: 'tbsp', b: 'tsp', vals: [0.25, 1 / 3, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16], title: 'Tablespoons to teaspoons — quick reference', note: true }
  };

  X['acres-to-sq-ft'] = {
    defs: () => `<p>An <strong>acre</strong> is 43,560 square feet, which is ${val('area', 'ac', 'm2', 1)} when the foot is the international foot (exactly 0.3048 m). NIST lists the acre based on the older US survey foot as 4,046.873 m² (SP 811, Appendix B.8); the two differ by less than 0.0005%, so the choice only matters for large land surveys.</p><p>A <strong>hectare</strong> is exactly 10,000 m² (NIST), which is ${val('area', 'ha', 'ac', 1)}, so one acre is about 0.405 hectares.</p>`,
    work: () => `<p>A lot is 0.28 acre. Multiply by 43,560: ${say('area', 'ac', 'ft2', 0.28)}. Going the other way, a 12,000 sq ft lot is ${say('area', 'ft2', 'ac', 12000)}. If a lot is 100 ft wide, its depth is ${F(cv('area', 'ac', 'ft2', 0.28) / 100, '4sig')} ft.</p>`,
    tip: () => `<p>For a quick estimate use 44,000 sq ft per acre: 0.5 acre is about 22,000 sq ft against the exact ${val('area', 'ac', 'ft2', 0.5)}, ${rel(44000, 43560)} high. An acre is also roughly a square 209 ft on a side: √43,560 = ${F(Math.sqrt(43560), '4sig')} ft.</p>`,
    mist: () => [`<strong>Confusing square feet with feet.</strong> A 209 ft × 209 ft square is one acre; 43,560 ft in a line is more than 8 miles.`, `<strong>Mixing acres and hectares.</strong> ${say('area', 'ha', 'ac', 1)}; a 5-hectare plot is ${val('area', 'ha', 'ac', 5)}, not 5 acres.`, `<strong>Mixing square miles and acres.</strong> A square mile is ${val('area', 'mi2', 'ac', 1)}.`],
    ref: { cat: 'area', a: 'ac', b: 'ft2', vals: [0.01, 0.05, 0.1, 0.125, 0.15, 0.2, 0.25, 0.3, 0.33, 0.4, 0.5, 0.75, 1, 1.5, 2, 2.5, 5, 10, 20, 40, 160, 640], title: 'Acres to square feet — quick reference' }
  };

  X['tablespoons-to-ml'] = {
    defs: () => `<p>A US <strong>tablespoon</strong> is 14.78676 mL (NIST SP 811, Appendix B.8), a <strong>teaspoon</strong> is 4.928922 mL and a US fluid ounce is 29.57353 mL, which is exactly 2 tablespoons. A <strong>milliliter</strong> is one thousandth of a liter.</p><p>Food labels and many recipes round the tablespoon to 15 mL, the metric tablespoon; the Australian tablespoon is 20 mL. The converter above uses the exact US value.</p>`,
    work: () => `<p>A recipe needs 3 tablespoons of lemon juice. Multiply by 14.78676: ${say('volume', 'tbsp', 'ml', 3)}. With the rounded 15 mL it is 45 mL, a difference of ${F(45 - cv('volume', 'tbsp', 'ml', 3), '2sig')} mL. Going back, 100 mL is ${say('volume', 'ml', 'tbsp', 100)}.</p>`,
    tip: () => `<p>Use 15 mL per tablespoon and 5 mL per teaspoon: ${val('volume', 'tbsp', 'ml', 4)} exactly, 60 mL by the shortcut, ${rel(15, 14.78676478)} high. For a few spoonfuls of liquid that is invisible; for a medicine dose use the exact value or a marked syringe.</p>`,
    mist: () => [`<strong>Mixing tablespoon standards.</strong> 3 US tablespoons are ${val('volume', 'tbsp', 'ml', 3)}, 3 metric ones 45 mL and 3 Australian ones 60 mL.`, `<strong>Treating a kitchen spoon as a measure.</strong> A spoon from the cutlery drawer can differ a lot from a measuring tablespoon; use a measuring spoon.`, `<strong>Assuming a spoon of any ingredient weighs the same.</strong> It is a volume: ${val('volume', 'tbsp', 'ml', 1)} of water weighs about 15 g, of honey more, of flour much less.`],
    ref: { cat: 'volume', a: 'tbsp', b: 'ml', vals: [0.25, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 32], title: 'Tablespoons to milliliters — quick reference' }
  };

  /* ---------- renderer ---------- */
  const refTable = (r) => {
    if (r === 'ingredients') {
      const rows = E.ING.filter((i) => ['flour', 'breadflour', 'cakeflour', 'wwflour', 'almondflour', 'sugar', 'brownsugar', 'powsugar', 'butter', 'oil', 'honey', 'water', 'milk', 'oats', 'rice', 'cocoa', 'salt', 'bakingpowder', 'walnuts', 'almonds', 'raisins', 'peanutbutter', 'chips', 'cornstarch'].includes(i[0])).map((i) => '<tr><td>' + i[1] + '</td><td>' + val('cooking', 'cup', 'g', 1, { ing: i[0], std: 'us' }) + '</td><td>' + val('cooking', 'cup', 'g', 0.5, { ing: i[0], std: 'us' }) + '</td></tr>').join('');
      return '<h2>Grams per cup — 24 common ingredients</h2><table class="dtable"><thead><tr><th>Ingredient</th><th>1 US cup</th><th>1/2 US cup</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }
    return '<h2>' + r.title + '</h2>' + pairTable(r.cat, r.a, r.b, r.vals);
  };
  return (slug, p) => {
    const x = X[slug];
    if (!x) return '';
    const lw = (s) => s.replace(/\s*\(.*\)/, '').toLowerCase();
    const lw2 = (s) => (p.cat === 'temperature' ? s.replace(/\s*\(.*\)/, '') : lw(s));
    return '<h2>What are ' + lw2(H.nm(p.cat, p.a)) + ' and ' + lw2(H.nm(p.cat, p.b)) + '?</h2>' + x.defs() + '<h2>Worked example, step by step</h2>' + x.work() + '<h2>Quick mental math</h2>' + x.tip() + '<h2>Common mistakes</h2>' + L(x.mist()) + refTable(x.ref);
  };
};
