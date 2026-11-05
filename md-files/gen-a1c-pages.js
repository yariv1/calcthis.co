const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /a1c-calculator/ (hub: A1C <-> eAG / glucose, mmol/mol, GMI beside it) and /gmi-calculator/ (CGM mean glucose -> GMI, compared with
   a lab A1C) and registers both (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list, seo-meta-hand.json).
   Every number in the text comes from CalcThis.a1cEngine. Run: node md-files/gen-a1c-pages.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* A1C-ENGINE:START */'), app.indexOf('/* A1C-ENGINE:END */')));
const E = CalcThis.a1cEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const f = (x, d) => (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const e0 = (a) => f(E.eag(a), 0), e1 = (a) => f(E.eag(a) / E.MG, 1), m0 = (a) => f(E.ifcc(a), 0);

/* ---------- worked numbers ---------- */
const g154 = E.eag(7), a7 = E.a1cFromEag(154), gm154 = E.gmi(154), a250 = E.a1cFromEag(250), gm250 = E.gmi(250);
const a85 = E.a1cFromEag(8.6 * E.MG);
const chartRows = []; for (let a = 5; a <= 12.001; a += 0.5) chartRows.push(Math.round(a * 2) / 2);
const chartHtml = chartRows.map((a) => `<tr data-a="${a.toFixed(1)}"><td>${a.toFixed(1)}</td><td>${m0(a)}</td><td>${e0(a)}</td><td>${e1(a)}</td></tr>`).join('');
const chartStatic = chartRows.map((a) => `<tr><td>${a.toFixed(1)}</td><td>${m0(a)}</td><td>${e0(a)}</td><td>${e1(a)}</td></tr>`).join('');
const gmiRows = [100, 120, 140, 154, 180, 200, 250, 300].map((g) => `<tr><td>${g} mg/dL (${f(g / E.MG, 1)} mmol/L)</td><td>${f(E.gmi(g), 1)}%</td><td>${f(E.a1cFromEag(g), 1)}%</td></tr>`).join('');

const SRC = `<h2>Sources</h2>
        <ul>
          <li>American Diabetes Association, <a href="https://professional.diabetes.org/glucose_calc" rel="noopener">eAG/A1C conversion calculator</a> — the relationship eAG = 28.7 × A1C − 46.7 (checked November 2026).</li>
          <li>Nathan DM et al., <a href="https://diabetesjournals.org/care/article/31/8/1473/28589/Translating-the-A1C-Assay-Into-Estimated-Average" rel="noopener">Translating the A1C assay into estimated average glucose values</a>, Diabetes Care 2008;31:1473 — the ADAG study behind the formula (R² = 0.84).</li>
          <li>Bergenstal RM et al., Glucose Management Indicator (GMI), Diabetes Care 2018;41:2275 — GMI = 3.31 + 0.02392 × mean glucose (mg/dL); see the <a href="https://www.jaeb.org/gmi/" rel="noopener">Jaeb Center GMI page</a>.</li>
          <li>Selvin E, <a href="https://diabetesjournals.org/care/article/47/6/906/154177/The-Glucose-Management-Indicator-Time-to-Change" rel="noopener">The Glucose Management Indicator: time to change course?</a>, Diabetes Care 2024;47:906 — the 28% of people whose lab A1C and GMI differ by 0.5 points or more.</li>
          <li><a href="https://www.accu-chek.com/tools/a1c-calculator" rel="noopener">Accu-Chek A1C guide</a> — normal below 5.7%, prediabetes 5.7%–6.4%, diabetes 6.5% or above, and the ADA goal of 7% or lower for many adults with diabetes.</li>
        </ul>
        <p><small>For information only — not medical advice and not a diagnosis. A diagnosis needs a laboratory test, repeated if the result is abnormal. Your own goal and treatment are for you and your care team.</small></p>`;

const PAGES = {
  a1c: {
    slug: 'a1c-calculator', name: 'A1C Calculator',
    title: 'A1C Calculator — A1C to Blood Sugar (eAG) and Back',
    desc: 'A1C calculator: convert A1C to average blood sugar (eAG) or glucose to A1C in mg/dL, mmol/L and mmol/mol, with a scale, your goal and GMI.',
    h1: 'A1C Calculator', eyebrow: 'A1C · average blood sugar · both directions',
    lead: `Type <strong>any one</strong> number — A1C %, A1C in mmol/mol, or average glucose in mg/dL or mmol/L — and the others fill in. An A1C of <strong>7.0%</strong> is an estimated average glucose of <strong>${e0(7)} mg/dL</strong> (${e1(7)} mmol/L).`,
    schema: 'Free A1C calculator: convert A1C to estimated average glucose (eAG) or average glucose to A1C in mg/dL, mmol/L and mmol/mol, with an A1C scale showing the normal, prediabetes and diabetes ranges, a goal marker, GMI for CGM users and a list of readings.',
    llms: 'Free A1C calculator: convert A1C to average blood sugar (eAG) or glucose to A1C in mg/dL, mmol/L and mmol/mol, with a labelled scale, a goal marker, GMI beside it and a list of readings.',
    card: 'Convert A1C to average blood sugar (eAG) or glucose to A1C — mg/dL, mmol/L and mmol/mol linked, on a scale with your goal, with GMI for CGM users.',
    faqs: [
      ['How do I convert A1C to average blood sugar?', `Multiply the A1C by 28.7 and subtract 46.7: eAG (mg/dL) = 28.7 × A1C − 46.7. An A1C of 7.0% gives 28.7 × 7 − 46.7 = ${e0(7)} mg/dL; divide by 18.016 for mmol/L, ${e1(7)}. This is the relationship from the ADAG study that the American Diabetes Association uses.`],
      ['How do I convert average blood sugar to A1C?', `Add 46.7 to the average glucose (mg/dL) and divide by 28.7. An average of 154 mg/dL gives (154 + 46.7) ÷ 28.7 = ${f(a7, 1)}%. For mmol/L, multiply by 18.016 first: 8.6 mmol/L is ${f(8.6 * E.MG, 0)} mg/dL, an A1C of ${f(a85, 1)}%. Type either number into the calculator and the other fills in.`],
      ['What is a normal A1C?', `Below 5.7% is normal, 5.7% to 6.4% is the prediabetes range and 6.5% or higher is the diabetes range — a 5.7% A1C is about ${e0(5.7)} mg/dL and a 6.5% A1C about ${e0(6.5)} mg/dL. A diagnosis needs a laboratory test, repeated if abnormal; a calculator cannot diagnose.`],
      ['What is the average blood sugar for an A1C of 7?', `About ${e0(7)} mg/dL (${e1(7)} mmol/L), or ${m0(7)} mmol/mol in the newer international units. The calculator also shows where 7% sits on a scale next to the normal, prediabetes and diabetes ranges.`],
      ['What is A1C in mmol/mol?', `Many countries report A1C as mmol/mol (IFCC units) instead of %. mmol/mol = (A1C% − 2.15) × 10.929, so 7.0% is ${m0(7)} mmol/mol and 6.5% is ${m0(6.5)} mmol/mol. Type either unit and the calculator converts.`],
      ['What is the difference between A1C, eAG and GMI?', `A1C is a lab blood test (a percentage of glycated hemoglobin). eAG is that A1C expressed in glucose units using the ADAG formula. GMI is a different estimate worked out from the average glucose of a continuous glucose monitor (CGM) — GMI = 3.31 + 0.02392 × mean glucose in mg/dL. The two formulas cross near 154 mg/dL and drift apart elsewhere: at 250 mg/dL the ADAG formula gives ${f(a250, 1)}% and GMI ${f(gm250, 1)}%. Enter an average glucose and the calculator shows both; the <a href="/gmi-calculator/">GMI calculator</a> goes deeper.`],
      ['Why does my meter average not match my A1C?', 'A1C reflects roughly the last two to three months, because red blood cells live about three months, while a meter shows single moments. The formula is also an average across many people (R² 0.84), not an exact rule for one person, and frequent highs and lows can average out to a normal-looking A1C. A gap is common — discuss it with your care team.'],
      ['Can I enter a list of readings?', 'Yes. Open Go advanced, choose mg/dL or mmol/L and paste your readings, one per line or separated by commas. The calculator averages them and fills in the estimated A1C and GMI. It ignores anything that is not a plausible glucose value and tells you how many it ignored.'],
      ['Can this calculator diagnose diabetes?', 'No. It converts numbers using published formulas and shows which range a value falls in. Diagnosis and treatment decisions need a laboratory test and your healthcare professional.']
    ],
    pills: [['/gmi-calculator/', 'GMI Calculator', '<path d="M3 12h4l3-8 4 16 3-8h4"/>'], ['/bmi-calculator/', 'BMI Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/waist-to-hip-ratio-calculator/', 'Waist-to-Hip Ratio', '<path d="M4 7h16M4 17h16M9 3L7 21M17 3l-2 18"/>'], ['/calorie-calculator/', 'Calorie Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>']]
  },
  gmi: {
    slug: 'gmi-calculator', name: 'GMI Calculator',
    title: 'GMI Calculator — Glucose Management Indicator to A1C',
    desc: 'GMI calculator: turn your CGM average glucose (mg/dL or mmol/L) into a Glucose Management Indicator and compare it with your lab A1C.',
    h1: 'GMI Calculator', eyebrow: 'CGM average glucose → Glucose Management Indicator',
    lead: `Enter your CGM <strong>mean glucose</strong> (mg/dL or mmol/L) or a <strong>GMI</strong> and get the other — then add your lab A1C to see the gap. A mean glucose of <strong>154 mg/dL</strong> is a GMI of <strong>${f(gm154, 1)}%</strong>.`,
    schema: 'Free GMI calculator: convert CGM mean glucose in mg/dL or mmol/L to the Glucose Management Indicator (GMI, the estimated A1C), or GMI back to mean glucose, and compare it with a lab A1C on a scale beside the ADAG-formula estimate.',
    llms: 'Free GMI (Glucose Management Indicator) calculator: CGM mean glucose in mg/dL or mmol/L to GMI and back, compared with your lab A1C and the ADAG-formula estimate on one scale.',
    card: 'Turn your CGM average glucose into a GMI — mg/dL and mmol/L linked — and compare it with your lab A1C and the ADAG estimate on one scale.',
    faqs: [
      ['What is GMI?', 'GMI, the Glucose Management Indicator, is an estimate of what your A1C would be, worked out from the average glucose of a continuous glucose monitor (CGM). It replaced the older term “estimated A1C” in 2018 so people would stop expecting it to match a lab result exactly.'],
      ['How do I calculate GMI?', `GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL). A mean glucose of 154 mg/dL gives 3.31 + 0.02392 × 154 = ${f(gm154, 1)}%. If your report is in mmol/L, multiply by 18.016 first — 8.6 mmol/L is ${f(8.6 * E.MG, 0)} mg/dL, a GMI of ${f(E.gmi(8.6 * E.MG), 1)}%.`],
      ['How do I convert GMI to average glucose?', `Reverse the formula: mean glucose (mg/dL) = (GMI − 3.31) ÷ 0.02392. A GMI of 7.0% is ${f(E.gFromGmi(7), 0)} mg/dL (${f(E.gFromGmi(7) / E.MG, 1)} mmol/L). Type the GMI into the calculator and the glucose fills in.`],
      ['Why is my GMI different from my lab A1C?', 'They measure different things: A1C reflects glycated hemoglobin over about three months, GMI reflects the glucose your sensor recorded in the period you chose. In the research that defined GMI, about 28% of people had a lab A1C and GMI that differed by 0.5 percentage points or more, so a gap is common. Add your lab A1C in the calculator to see yours; raise a large gap with your care team.'],
      ['Is GMI the same as the A1C formula on an A1C calculator?', `No. An A1C calculator uses the ADAG formula (A1C = (average glucose + 46.7) ÷ 28.7). GMI uses a formula fitted to CGM data. They give the same answer near 154 mg/dL and drift apart from there: at 250 mg/dL the ADAG formula gives ${f(a250, 1)}% and GMI ${f(gm250, 1)}%. The calculator shows both side by side.`],
      ['Can GMI diagnose diabetes?', 'No. GMI is an estimate for people who already use a CGM, and a diagnosis needs a laboratory test, repeated if abnormal. Use it to talk with your care team, not to change treatment on your own.'],
      ['Can I enter a list of readings?', 'Yes. Open Go advanced, choose mg/dL or mmol/L and paste your readings, one per line or separated by commas; the calculator averages them and fills in the GMI. A CGM report’s mean glucose is more representative than a handful of readings.']
    ],
    pills: [['/a1c-calculator/', 'A1C Calculator', '<path d="M3 12h4l3-8 4 16 3-8h4"/>'], ['/bmi-calculator/', 'BMI Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'], ['/water-intake-calculator/', 'Water Intake Calculator', '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>'], ['/calorie-calculator/', 'Calorie Calculator', '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>']]
  }
};

const tfld = (id, label, unit, ph) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"></div></label>`;
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;

function build(kind) {
  const P = PAGES[kind], hub = kind === 'a1c', url = 'https://calcthis.co/' + P.slug + '/';
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

  const fields = hub
    ? tfld('a1AC', 'A1C', '%', 'e.g. 6.5') + tfld('a1MM', 'A1C (IFCC)', 'mmol/mol', 'e.g. 48') + tfld('a1MG', 'Average glucose', 'mg/dL', 'e.g. 154') + tfld('a1ML', 'Average glucose', 'mmol/L', 'e.g. 8.6')
    : tfld('a1GM', 'GMI', '%', 'e.g. 7.0') + tfld('a1MG', 'Mean glucose', 'mg/dL', 'e.g. 154') + tfld('a1ML', 'Mean glucose', 'mmol/L', 'e.g. 8.6') + tfld('a1Lab', 'Your lab A1C', '%', 'optional, e.g. 7.2');
  const adv = `<div id="a1AdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${hub ? tfld('a1Goal', 'Your A1C goal', '%', '7') : ''}
          <div class="ctl-row" style="display:block;margin-bottom:10px">
            <span class="ctl-lab" style="display:block;margin-bottom:6px">Readings are in</span>
            <div class="modeseg" id="a1Unit" role="group" aria-label="Readings are in" style="grid-template-columns:1fr 1fr"><button class="on" type="button" data-v="mg">mg/dL</button><button type="button" data-v="mmol">mmol/L</button></div>
          </div>
          <label class="av-lab" for="a1List">List of glucose readings <span style="color:var(--muted);font-weight:500">(optional)</span></label>
          <textarea class="av-ta" id="a1List" style="min-height:84px" placeholder="e.g. 112, 145, 98, 176, 130" aria-label="List of glucose readings" spellcheck="false"></textarea>
          <p class="av-note" id="a1ListNote"></p>
        </div>`;
  const chartCard = hub ? `
        <h2>A1C to blood sugar chart</h2>
        <p>Every half point from 5.0% to 12.0%. Tap any row to put it in the calculator above.</p>
        <table class="dtable a1-chart" id="a1Chart">
          <thead><tr><th>A1C %</th><th>mmol/mol</th><th>mg/dL</th><th>mmol/L</th></tr></thead>
          <tbody>${chartHtml}</tbody>
        </table>` : '';
  const left = hub ? `
        <h2>How to use the A1C calculator</h2>
        <p>Type your <strong>A1C</strong> in % or in mmol/mol, or an <strong>average glucose</strong> in mg/dL or mmol/L. Whichever you type, the other three fill in — there is no mode to switch. Under the result you get a <strong>scale</strong> that marks your number against the normal, prediabetes and diabetes ranges, with your goal marker, and a line telling you where it falls.</p>
        <p>Enter an average glucose and you also see the <strong>GMI</strong> — the estimate used for continuous glucose monitor (CGM) data — beside the ADAG-formula A1C. Under Go advanced you can set your own goal or paste a <strong>list of readings</strong> and let the calculator average them.</p>

        <h2>The A1C to eAG formula</h2>
        <div class="formula">
          eAG (mg/dL) = 28.7 × A1C − 46.7
          <small>ESTIMATED AVERAGE GLUCOSE · ADAG STUDY</small>
        </div>
        <p>For an A1C of 7.0%: 28.7 × 7 − 46.7 = <strong>${e0(7)} mg/dL</strong>, or ${e1(7)} mmol/L (divide by 18.016). Backwards, (154 + 46.7) ÷ 28.7 = <strong>${f(a7, 1)}%</strong>. In mmol/mol the same 7.0% is <strong>${m0(7)}</strong>: (A1C − 2.15) × 10.929.</p>
        ${chartCard}` : `
        <h2>How to use the GMI calculator</h2>
        <p>Enter the <strong>mean glucose</strong> from your CGM report in mg/dL or mmol/L — or a <strong>GMI</strong> to work backwards — and the other fields fill in. Add your latest <strong>lab A1C</strong> to see the gap between the two. The scale marks your GMI (and your lab A1C) against the normal, prediabetes and diabetes ranges.</p>
        <p>Below the result the calculator shows the <strong>ADAG-formula A1C</strong> for the same average, so you can see why a general A1C calculator and your CGM app can disagree. Under Go advanced you can paste a list of readings and let it average them.</p>

        <h2>The GMI formula</h2>
        <div class="formula">
          GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL)
          <small>GLUCOSE MANAGEMENT INDICATOR</small>
        </div>
        <p>A mean glucose of 154 mg/dL: 3.31 + 0.02392 × 154 = <strong>${f(gm154, 1)}%</strong>. A mean of 8.6 mmol/L is ${f(8.6 * E.MG, 0)} mg/dL, a GMI of <strong>${f(E.gmi(8.6 * E.MG), 1)}%</strong>. Backwards: (GMI − 3.31) ÷ 0.02392, so 7.0% is <strong>${f(E.gFromGmi(7), 0)} mg/dL</strong>.</p>`;
  const right = hub ? `
        <h2>A1C, eAG and GMI — not the same thing</h2>
        <p><strong>A1C</strong> is a lab test of glycated hemoglobin. <strong>eAG</strong> is that A1C written in glucose units. <strong>GMI</strong> is computed from a CGM's average glucose with a different formula, fitted to sensor data. They agree near 154 mg/dL and drift apart elsewhere:</p>
        <table class="dtable">
          <thead><tr><th>Average glucose</th><th>GMI</th><th>ADAG A1C</th></tr></thead>
          <tbody>${gmiRows}</tbody>
        </table>
        <p>If your number came from a CGM, use the <a href="/gmi-calculator/">GMI calculator</a>; if it came from a lab A1C or a meter average, the A1C calculator above.</p>

        <h2>The A1C ranges</h2>
        <table class="dtable">
          <thead><tr><th>A1C</th><th>mmol/mol</th><th>Average glucose</th><th>Range</th></tr></thead>
          <tbody>
            <tr><td>Below 5.7%</td><td>below ${m0(5.7)}</td><td>below ${e0(5.7)} mg/dL</td><td>Normal</td></tr>
            <tr><td>5.7%–6.4%</td><td>${m0(5.7)}–${m0(6.4)}</td><td>${e0(5.7)}–${e0(6.4)} mg/dL</td><td>Prediabetes</td></tr>
            <tr><td>6.5% or higher</td><td>${m0(6.5)} or more</td><td>${e0(6.5)} mg/dL or more</td><td>Diabetes</td></tr>
          </tbody>
        </table>
        <p>A single result does not make a diagnosis; it has to be a laboratory test and is normally repeated. The ADA's common goal for adults with diabetes is 7% or lower, but personal goals vary with age, pregnancy and other factors.</p>

        <h2>Why your meter and your A1C disagree</h2>
        <p>A1C averages roughly two to three months of glucose, while a meter shows moments. The formula is an average over many people (R² 0.84), not an exact rule for one person, and swings up and down can average out to a normal-looking A1C. Paste your readings under Go advanced to see their average against your lab result.</p>
        ${SRC}` : `
        <h2>GMI vs A1C</h2>
        <p>An A1C test measures glycated hemoglobin, which builds up over about three months. GMI is worked out from the average glucose your sensor recorded. In the research that defined GMI, about <strong>28%</strong> of people had a lab A1C and GMI that differed by 0.5 percentage points or more, so a gap is common and not an error.</p>

        <h2>GMI and the ADAG formula side by side</h2>
        <table class="dtable">
          <thead><tr><th>Mean glucose</th><th>GMI</th><th>ADAG A1C</th></tr></thead>
          <tbody>${gmiRows}</tbody>
        </table>
        <p>The two formulas cross near 154 mg/dL: at 250 mg/dL the ADAG A1C is ${f(a250, 1)}% while GMI is ${f(gm250, 1)}%. For a lab A1C expressed as average glucose, or glucose-to-A1C conversions in mg/dL, mmol/L and mmol/mol, use the <a href="/a1c-calculator/">A1C calculator</a>.</p>

        <h2>A1C to average glucose</h2>
        <table class="dtable">
          <thead><tr><th>A1C %</th><th>mmol/mol</th><th>mg/dL</th><th>mmol/L</th></tr></thead>
          <tbody>${chartStatic}</tbody>
        </table>
        ${SRC}`;
  const body = `<body class="p-bmr p-avg p-a1c">
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
      <div class="card-pad">
        <h2 class="card-h2">${hub ? 'Your number' : 'Your CGM numbers'}</h2>
        <div class="a1-fields">${fields}</div>
        <p class="av-note" style="margin-top:0">${hub ? 'Type in any box — the others fill in.' : 'Type in any glucose or GMI box — the others fill in.'}</p>
        <div class="res-hint" id="a1Hint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        ${adv}
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="a1AdvBtn" type="button">
            <span id="a1AdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="a1ResLab">${hub ? 'Estimated average glucose (eAG)' : 'Glucose Management Indicator (GMI)'}</div>
          <div class="res-big"><span id="a1Big">—</span></div>
          <div class="res-sub" id="a1Sub" data-empty="${hub ? 'Enter an A1C or an average glucose.' : 'Enter a mean glucose or a GMI.'}">${hub ? 'Enter an A1C or an average glucose.' : 'Enter a mean glucose or a GMI.'}</div>
        </div>
        <div id="a1Body" style="display:none">
          <p class="res-tip adv-tip" id="a1Tip"></p>
          <p class="bm-h">On the scale</p>
          <div id="a1Scale"></div>
          <div class="proj-sep"></div>
          <table class="dtable" id="a1Rows"></table>
          <p class="a1-note">An estimate from published formulas — not medical advice and not a diagnosis.</p>
        </div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="a1MLab">${hub ? 'eAG' : 'GMI'}</span>
    <div class="mbar-vals"><b id="a1MVal">—</b></div>
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

<script src="/assets/app.js?v=309"></script>
<script>CalcThis.initA1cCalc('${kind}');</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log(P.slug, 'written; title', P.title.length, 'desc', P.desc.length);
}
build('a1c'); build('gmi');

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s = fs.readFileSync(fl, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fl, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
Object.keys(PAGES).forEach((kind) => {
  const P = PAGES[kind], url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s) => s.includes("slug: '" + slug + "'") ? s : s.replace("  { file: 'waist-to-hip-ratio-calculator/index.html', slug: '/waist-to-hip-ratio-calculator/' },\n", (mm) => mm + "  { file: '" + P.slug + "/index.html', slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(/(- \[Waist-to-Hip Ratio Calculator[^\n]*\n)/, (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s) => s.includes(slug) ? s : s.replace('          <a href="/waist-to-hip-ratio-calculator/">Waist-to-Hip Ratio</a>\n', (mm) => mm + '          <a href="' + slug + '">' + (kind === 'a1c' ? 'A1C' : 'GMI') + '</a>\n'));
  edit('partials/footer.html', (s) => s.includes(slug) ? s : s.replace('          <li><a href="/waist-to-hip-ratio-calculator/">Waist-to-Hip Ratio Calculator</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s) => s.includes('"' + slug + '"') ? s : s.replace('  "/waist-to-hip-ratio-calculator/": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "/waist-to-hip-ratio-calculator/": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Waist-to-Hip Ratio Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "HealthApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path d="M16 4s8 9 8 14a8 8 0 0 1-16 0c0-5 8-14 8-14z" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M11 19h10M16 14v10" stroke="#37503F" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="/calorie-calculator/">', () => card + '    <a class="calc" href="/calorie-calculator/">');
    }
    if (!h.includes('<a href="' + slug + '">' + (kind === 'a1c' ? 'A1C' : 'GMI') + '</a><span>')) h = h.replace(/(          <li><a href="\/waist-to-hip-ratio-calculator\/">Waist-to-hip ratio<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="' + slug + '">' + (kind === 'a1c' ? 'A1C' : 'GMI') + '</a><span> — ' + (kind === 'a1c' ? 'A1C to average blood sugar and back' : 'CGM average glucose to GMI') + '</span></li>\n');
    return h;
  });
});
