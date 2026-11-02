const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /percentage-change-calculator/ and registers it (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart + about list,
   seo-meta-hand.json) plus a cross-link from /percentage-calculator/. Every number in the text comes from CalcThis.pctEngine. Run: node md-files/gen-pctchange-page.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* PCT-ENGINE:START */'), app.indexOf('/* PCT-ENGINE:END */')));
const E = CalcThis.pctEngine;
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const rr = (x, d) => { const f = Math.pow(10, d == null ? 2 : d); return String(Math.round(x * f) / f); };
const sgn = (x, d) => (x > 0 ? '+' : (x < 0 ? '−' : '')) + rr(Math.abs(x), d);

/* ---------- worked examples ---------- */
const c1 = E.change(80, 96), c2 = E.change(100, 125), c3 = E.change(125, 100), net = E.change(100, E.finalFrom(125, -25));
const cn1 = E.change(-25, 25), cn2 = E.change(-25, -50), cs = E.change(3.5, 2.625), cp = E.change(2, 3);
const fin = E.finalFrom(80, 25), sta = E.startFrom(120, 20).v;
const S = E.series([100, 110, 99, 120]);
const tm = E.change(5400, 4320);

const faqs = [
  ['How do you calculate percentage change?', `Subtract the starting value from the ending value, divide by the starting value, and multiply by 100: (end − start) ÷ start × 100. Going from 80 to 96 gives (96 − 80) ÷ 80 × 100 = ${sgn(c1.pct)}%. A positive answer is an increase, a negative one a decrease.`],
  ['Why does a 25% rise followed by a 25% fall not get me back to where I started?', `Because the second percentage is measured from a bigger number. 100 up 25% is 125; 125 down 25% is ${rr(E.finalFrom(125, -25), 2)}, a net change of ${sgn(net.pct, 2)}%. To get back from 125 to 100 you need a ${sgn(c3.pct, 0)}% change. The calculator always shows the percentage you need to get back.`],
  ['How do I find the percentage change when the starting value is negative?', `Divide by the absolute value of the starting value, which keeps the sign meaningful: going from −25 to 25 is (25 − (−25)) ÷ |−25| × 100 = ${sgn(cn1.pct, 0)}%, an increase, and from −25 to −50 is ${sgn(cn2.pct, 0)}%, a decrease. Percent change is easiest to interpret when both values are positive, so the calculator adds a note when the start is negative.`],
  ['What if the starting value is zero?', `The percent change is undefined: there is no starting size to compare with, and dividing by zero has no answer. From 0 to 0 there is no change (0%). The calculator says so in plain words and still shows the absolute change.`],
  ['What is the difference between percent change and percentage points?', `If a rate rises from 2% to 3%, it went up by ${sgn(cp.abs, 0)} percentage point — but the percent change is ${sgn(cp.pct, 0)}%, because 3 is half as big again as 2. Open Go advanced and set the values to percentages to see both side by side.`],
  ['How do I find the original value after a percentage increase?', `Divide the final value by 1 plus the percentage as a decimal. If a price is 120 after a 20% increase, the original was 120 ÷ 1.2 = ${rr(sta, 2)}. Choose "Starting value" at the top of the calculator and enter the end value and the percentage.`],
  ['How do I calculate the new value after a percentage increase or decrease?', `Multiply the starting value by 1 plus the percentage (as a decimal). 80 increased by 25% is 80 × 1.25 = ${rr(fin, 2)}; a decrease uses a minus, so 80 down 25% is 80 × 0.75 = 60. Choose "Final value" at the top.`],
  ['Can I find the percentage change across a whole list of values?', `Yes — open Go advanced and paste the values in order. For 100, 110, 99, 120 you get ${sgn(S.rows[1].pct, 0)}%, ${sgn(S.rows[2].pct, 0)}% and ${sgn(S.rows[3].pct, 2)}% for each step, a total of ${sgn(S.total.pct, 0)}%, and a compound rate of ${sgn(S.cagr, 2)}% per period.`],
  ['Does it work with times?', `Yes. Enter times such as 1:30:00 and 1:12:00 (h:mm:ss) or 1:30 and 1:12 (m:ss) in both boxes: the change from 1:30:00 to 1:12:00 is ${sgn(tm.pct, 0)}%. Use the same format in both boxes.`]
];
const title = 'Percentage Change Calculator — Increase, Decrease & Back';
const desc = 'Free percentage change calculator: find the % change between two values, the final or starting value, and the % you need to get back to the start.';
const url = 'https://calcthis.co/percentage-change-calculator/';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const head = headTop
  .replace(/<title>[^<]*<\/title>/, () => '<title>' + title + '</title>')
  .replace(/<meta name="description" content="[^"]*">/, () => '<meta name="description" content="' + esc(desc) + '">')
  .replace(/<link rel="canonical" href="[^"]*">/, () => '<link rel="canonical" href="' + url + '">')
  .replace(/<meta property="og:title" content="[^"]*">/, () => '<meta property="og:title" content="' + esc(title) + '">')
  .replace(/<meta property="og:description" content="[^"]*">/, () => '<meta property="og:description" content="' + esc(desc) + '">')
  .replace(/<meta property="og:url" content="[^"]*">/, () => '<meta property="og:url" content="' + url + '">')
  .replace(/<meta name="twitter:title" content="[^"]*">/, () => '<meta name="twitter:title" content="' + esc(title) + '">')
  .replace(/<meta name="twitter:description" content="[^"]*">/, () => '<meta name="twitter:description" content="' + esc(desc) + '">');
const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Percentage Change Calculator', url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Percentage change calculator: the percent change between a starting and an ending value, the final value after a percent increase or decrease, or the starting value from an end value and a percent, with a before-and-after bar picture, the percentage needed to get back to the start, working shown, time values and a list of values over time.' };
const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: 'Percentage Change Calculator', item: url }] };
const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');
const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const tfld = (id, label, unit, ph, extra) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}"${extra || ''}></div></label>`;
const nfld = (id, label, unit, ph, extra) => `<label class="fld" for="${id}"><span class="lab">${label}${unit ? ' <span class="unit">' + unit + '</span>' : ''}</span><div class="inp"><input id="${id}" type="number" inputmode="decimal" step="any" placeholder="${ph}"${extra || ''}></div></label>`;

const body = `<body class="p-bmr p-avg p-pct">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">Increase · decrease · and back again</div>
    <h1>Percentage Change Calculator</h1>
    <p>Enter a <strong>starting and an ending value</strong> to get the percent change — or find the <strong>final</strong> or <strong>starting value</strong> from a percentage. You also see <strong>what it takes to get back</strong>: 80 to 96 is <strong>${sgn(c1.pct)}%</strong>, but 96 back to 80 is <strong>${sgn(c1.back, 2)}%</strong>.</p>
  </section>

  <div class="grid">

    <!-- INPUT -->
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Your values</h2>
        <div class="modeseg" id="pcModeSeg" role="group" aria-label="Find" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:14px"><button class="on" type="button" data-v="chg">% change</button><button type="button" data-v="fin">Final value</button><button type="button" data-v="sta">Start value</button></div>
        <div id="pcAWrap">${tfld('pcA', 'Starting value', '', 'e.g. 80')}</div>
        <div id="pcBWrap">${tfld('pcB', 'Ending value', '', 'e.g. 96')}</div>
        <div id="pcPWrap">${tfld('pcP', 'Percent change', '%', 'e.g. 25 or −20', ' style="margin-bottom:0"')}</div>
        <div id="pcDirWrap">
          <div class="ctl-row" style="margin-top:12px"><span class="ctl-lab">Direction</span><div class="seg" id="pcDirSeg" role="group" aria-label="Direction"><button class="on" type="button" data-v="inc">Increase</button><button type="button" data-v="dec">Decrease</button></div></div>
          <div class="chips" id="pcChips"><button type="button" data-v="10">+10%</button><button type="button" data-v="25">+25%</button><button type="button" data-v="50">+50%</button><button type="button" data-v="-10">−10%</button><button type="button" data-v="-25">−25%</button><button type="button" data-v="-50">−50%</button></div>
        </div>
        <p class="av-note" id="pcFormatNote">Numbers, $ and commas are fine — or times like 1:30:00. A minus sign in the percent means a decrease.</p>
        <div class="res-hint" id="pcHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <div id="pcAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <div class="ctl-row" style="display:block;margin-bottom:12px">
            <span class="ctl-lab" style="display:block;margin-bottom:6px">The values are</span>
            <div class="modeseg" id="pcPPSeg" role="group" aria-label="The values are" style="grid-template-columns:1fr 1fr"><button class="on" type="button" data-v="num">Plain numbers</button><button type="button" data-v="pct">Percentages</button></div>
          </div>
          ${nfld('pcDp', 'Decimal places', 'max', '2', ' min="0" max="10"')}
          <label class="av-lab" for="pcSeries">Values over time <span style="color:var(--muted);font-weight:500">(optional)</span></label>
          <textarea class="av-ta" id="pcSeries" style="min-height:84px" placeholder="e.g. 100, 110, 99, 120" aria-label="Values over time" spellcheck="false"></textarea>
          <p class="av-note" id="pcSeriesNote"></p>
        </div>
        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="pcAdvBtn" type="button">
            <span id="pcAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT -->
    <div class="card">
      <div class="card-pad">
        <div class="bf-res">
          <div class="res-lab" id="pcResLab">Percent change</div>
          <div class="res-big"><span id="pcBig">—</span></div>
          <div class="res-sub" id="pcSub" data-empty="Enter a starting and an ending value.">Enter a starting and an ending value.</div>
        </div>
        <div id="pcBody" style="display:none">
          <p class="res-tip adv-tip" id="pcTip"></p>
          <p class="bm-h">Before and after</p>
          <div id="pcViz"></div>
          <p class="bm-h" style="margin-top:16px">The working</p>
          <ul class="pc-steps" id="pcSteps"></ul>
          <div class="proj-sep"></div>
          <table class="dtable" id="pcStats"></table>
        </div>
        <div id="pcSeriesOut" style="display:none"></div>
      </div>
    </div>

  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="pcMLab">Percent change</span>
    <div class="mbar-vals"><b id="pcMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${pill('/percentage-calculator/', 'Percentage Calculator', '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>')}
${pill('/average-calculator/', 'Average Calculator', '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2"/>')}
${pill('/ratio-calculator/', 'Ratio Calculator', '<path d="M4 7h16M4 17h16M9 3L7 21M17 3l-2 18"/>')}
${pill('/sales-tax-calculator/', 'Sales Tax Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>')}
    </div>
  </div>

  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the percentage change calculator</h2>
        <p>Pick what you want to find. <strong>Percent change</strong> takes a starting and an ending value. <strong>Final value</strong> takes a starting value and a percentage (use a minus sign, or the Decrease button, for a drop). <strong>Starting value</strong> works backwards from an ending value and a percentage.</p>
        <p>Below the answer you get a <strong>before-and-after bar</strong>, the working, the change in absolute terms, the multiplier, and the <strong>percentage you would need to get back to the start</strong>. Values can include $ and commas, or be times like 1:30:00.</p>

        <h2>The percentage change formula</h2>
        <div class="formula">
          % change = (end − start) ÷ |start| × 100
          <small>POSITIVE = INCREASE · NEGATIVE = DECREASE</small>
        </div>
        <p>From 80 to 96: (96 − 80) ÷ 80 × 100 = <strong>${sgn(c1.pct)}%</strong>. From 96 back to 80: (80 − 96) ÷ 96 × 100 = <strong>${sgn(c1.back, 2)}%</strong>. The two are different because each is measured from a different starting point.</p>

        <h2>Why going back needs a different percentage</h2>
        <table class="dtable">
          <thead><tr><th>Change</th><th>Percent</th><th>To get back</th></tr></thead>
          <tbody>
            <tr><td>100 → 125</td><td>${sgn(c2.pct, 0)}%</td><td>${sgn(c2.back, 0)}%</td></tr>
            <tr><td>80 → 96</td><td>${sgn(c1.pct, 0)}%</td><td>${sgn(c1.back, 2)}%</td></tr>
            <tr><td>100 → 50</td><td>${sgn(E.change(100, 50).pct, 0)}%</td><td>${sgn(E.change(100, 50).back, 0)}%</td></tr>
            <tr><td>100 → 200</td><td>${sgn(E.change(100, 200).pct, 0)}%</td><td>${sgn(E.change(100, 200).back, 0)}%</td></tr>
          </tbody>
        </table>
        <p>That is why +25% then −25% leaves you at ${rr(E.finalFrom(125, -25), 2)}, not 100.</p>
      </div>

      <div>
        <h2>Percent increase and percent decrease</h2>
        <p>They are the same formula. A positive result is a percent <strong>increase</strong>, a negative one is a percent <strong>decrease</strong> — the calculator labels it either way, so there is no need for two tools. A decrease can never be more than 100% (that takes the value to zero), but an increase can be any size.</p>

        <h2>Negative and zero starting values</h2>
        <p>The formula divides by the <em>absolute</em> value of the start, so the answer keeps its meaning: −25 to 25 is <strong>${sgn(cn1.pct, 0)}%</strong> (an increase of 50 on a base of 25) and −25 to −50 is <strong>${sgn(cn2.pct, 0)}%</strong>. A start of <strong>0</strong> has no percentage — the calculator says so and shows the absolute change instead.</p>

        <h2>Percent change vs percentage points</h2>
        <p>When both values are themselves percentages, the plain difference is in <strong>percentage points</strong>. A rate that goes from 2% to 3% rises ${sgn(cp.abs, 0)} point but ${sgn(cp.pct, 0)}% in relative terms. Switch on <strong>Go advanced</strong> and choose "Percentages" to see both.</p>

        <h2>A list of values over time</h2>
        <p>Paste values in order under Go advanced — monthly sales, yearly prices, anything — to see the change from each value to the next, the total change from first to last, the average of the period changes and the <strong>compound rate per period</strong>. For 100, 110, 99, 120 that is ${sgn(S.rows[1].pct, 0)}%, ${sgn(S.rows[2].pct, 0)}%, ${sgn(S.rows[3].pct, 2)}%, a total of ${sgn(S.total.pct, 0)}% and ${sgn(S.cagr, 2)}% a period compounded.</p>
        <p>For percent of a number, or what percent one number is of another, use the <a href="/percentage-calculator/">percentage calculator</a>; for the average of a list, the <a href="/average-calculator/">average calculator</a>; to see what a pay raise does to hourly, monthly and yearly pay, the <a href="/salary-calculator/">salary calculator</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqs.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n')}
  </section>

${ftr}

</div>

<script src="/assets/app.js?v=280"></script>
<script>CalcThis.initPctChangeCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
const dir = ROOT + 'percentage-change-calculator/'; fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
console.log('page written; title', title.length, 'desc', desc.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const f = ROOT + rel; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
edit('build.js', (s) => s.includes("slug: '/percentage-change-calculator/'") ? s : s.replace("  { file: 'percentage-calculator/index.html', slug: '/percentage-calculator/' },\n", (mm) => mm + "  { file: 'percentage-change-calculator/index.html', slug: '/percentage-change-calculator/' },\n"));
edit('llms.txt', (lt) => lt.includes('/percentage-change-calculator/') ? lt : lt.replace(/(- \[Percentage Calculator[^\n]*\n)/, (mm) => mm + '- [' + title + '](' + url + '): Free percentage change calculator: the percent change between two values, the final or starting value from a percentage, the percentage needed to get back to the start, working shown, time values, and a list of values over time with compound rate.\n'));
edit('partials/header.html', (s) => s.includes('/percentage-change-calculator/') ? s : s.replace('          <a href="/percentage-calculator/">Percentage</a>\n', (mm) => mm + '          <a href="/percentage-change-calculator/">Percentage Change</a>\n'));
edit('partials/footer.html', (s) => s.includes('/percentage-change-calculator/') ? s : s.replace('          <li><a href="/percentage-calculator/">Percentage Calculator</a></li>\n', (mm) => mm + '          <li><a href="/percentage-change-calculator/">Percentage Change Calculator</a></li>\n'));
edit('md-files/seo-meta-hand.json', (s) => s.includes('"/percentage-change-calculator/"') ? s : s.replace('  "/percentage-calculator/": {', () => '  "/percentage-change-calculator/": {\n    "t": ' + JSON.stringify(title) + ',\n    "d": ' + JSON.stringify(desc) + '\n  },\n  "/percentage-calculator/": {'));
edit('index.html', (h) => {
  if (!h.includes('"name": "Percentage Change Calculator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Percentage Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Percentage Change Calculator", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('<h3>Percentage Change Calculator</h3>')) {
    const card = `    <a class="calc" href="/percentage-change-calculator/">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8F5C13" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-5 4 4 8-9"/><path d="M15 7h5v5"/></svg>
      </span>
      <h3>Percentage Change Calculator</h3>
      <p>Percent change between two values, the final or starting value from a percentage, and the percentage you need to get back to where you started — with working and a before-and-after bar.</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
    h = h.replace('    <a class="calc" href="/percentage-calculator/">', () => card + '    <a class="calc" href="/percentage-calculator/">');
  }
  if (!h.includes('<a href="/percentage-change-calculator/">Percentage change</a><span>')) h = h.replace(/(          <li><a href="\/percentage-calculator\/">Percentage<\/a><span>[^\n]*\n)/, (mm) => mm + '          <li><a href="/percentage-change-calculator/">Percentage change</a><span> — increase, decrease and the way back</span></li>\n');
  return h;
});
edit('percentage-calculator/index.html', (h) => h.includes('/percentage-change-calculator/') ? h : h.replace('A positive result is an increase; negative is a decrease.</p>', () => 'A positive result is an increase; negative is a decrease. For a starting or final value, the percentage needed to get back, or a whole list of values, use the <a href="/percentage-change-calculator/">percentage change calculator</a>.</p>'));
