/* Regenerates the Random Number Generator hub (/random-number-generator/) and its range pages (1-100, 1-10, 1-3, 1-13, no repeats, wheel)
   and registers them (sitemap, build.js PAGES, llms.txt, header/footer partials, homepage card + hasPart).
   Every number in the SEO text comes from plain arithmetic in this file or CalcThis.rngEngine in assets/app.js.
   Run: node md-files/gen-rng-pages.js   then   node build.js
   Add a range page: add it to PAGES below. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
global.CalcThis = {};
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
eval(app.slice(app.indexOf('/* RNG-ENGINE:START */'), app.indexOf('/* RNG-ENGINE:END */')));
const nl = (s) => s.replace(/\r\n/g, '\n');
const auto = nl(fs.readFileSync(ROOT + 'auto-loan-calculator/index.html', 'utf8'));
const hdr = auto.slice(auto.indexOf('<!--HEADER:START-->'), auto.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = auto.slice(auto.indexOf('<!--FOOTER:START-->'), auto.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = auto.slice(0, auto.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const cselEmpty = (id) => `<div class="csel" id="${id}" data-value=""><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val"></span>${chev}</button><div class="csel-panel" role="listbox"></div></div>`;
const fld = (id, label, ph, mode, id2) => `<div class="fld"${id2 ? ' id="' + id2 + '"' : ''}><label class="lab" for="${id}">${label}</label><div class="inp"><input id="${id}" type="text" inputmode="${mode || 'numeric'}" autocomplete="off" placeholder="${ph}"></div></div>`;
const check = (id, label, sub, on) => `<label class="dc-check" for="${id}"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><span>${label}${sub ? ' <span class="unit" style="font-weight:500;color:var(--muted)">' + sub + '</span>' : ''}</span></label>`;

/* ---------- plain arithmetic helpers for the SEO text ---------- */
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const pct = (x) => { const v = Math.round(x * 1000) / 10; return String(v).replace(/\.0$/, '') + '%'; };
const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function choose(n, k) { let r = BigInt(1); for (let i = 1; i <= k; i++) r = r * BigInt(n - k + i) / BigInt(i); return r; }
function facts(a, b) {
  const nums = []; for (let i = a; i <= b; i++) nums.push(i);
  const n = nums.length, even = nums.filter((x) => x % 2 === 0).length, odd = n - even, pr = nums.filter(isPrime).length, mid = (a + b) / 2, upper = nums.filter((x) => x > mid).length;
  return { n, even, odd, pr, upper, mid };
}
const factsTable = (a, b) => {
  const f = facts(a, b);
  const rows = [['Any one number you name', '1 in ' + f.n + ' (' + pct(1 / f.n) + ')'], ['The same number twice in a row', '1 in ' + f.n + ' (' + pct(1 / f.n) + ')'], ['An even number', f.even + ' of ' + f.n + ' (' + pct(f.even / f.n) + ')'], ['An odd number', f.odd + ' of ' + f.n + ' (' + pct(f.odd / f.n) + ')'], ['A prime number', f.pr + ' of ' + f.n + ' (' + pct(f.pr / f.n) + ')'], ['A number above ' + Math.floor(f.mid), f.upper + ' of ' + f.n + ' (' + pct(f.upper / f.n) + ')']];
  return '<div class="pc-tblwrap"><table class="dtable"><thead><tr><th>On a single draw from ' + a + ' to ' + b + '</th><th>Chance</th></tr></thead><tbody>' + rows.map((r) => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</tbody></table></div>';
};

const RANGES = [[1, 2], [1, 3], [1, 6], [1, 10], [1, 13], [1, 100], [1, 1000]];
const chips = RANGES.map((r) => `<button type="button" data-min="${r[0]}" data-max="${r[1]}">${r[0]}–${commas(r[1])}</button>`).join('');

/* ---------- page definitions ---------- */
const PAGES = [
  {
    slug: 'random-number-generator', hub: true, h1: 'Random Number Generator', eyebrow: 'Whole numbers, decimals, no repeats, sets and a number wheel',
    title: 'Random Number Generator — Any Range, No Repeats | CalcThis',
    desc: 'Free random number generator: pick one or many numbers in any range, with or without repeats, decimals, odd or even, sets, and a spinning number wheel. Secure, unbiased, no sign-up.',
    hero: 'Pick <strong>one number or thousands</strong> from any range — whole numbers or decimals, with or without repeats. Tap a range, press Generate, and watch the wheel land on your number.',
    min: '', max: '', mode: 'gen', unique: false
  },
  {
    slug: 'random-number-generator-1-100', h1: 'Random Number Generator 1–100', eyebrow: 'A random number from 1 to 100', min: '1', max: '100', mode: 'gen', unique: false,
    title: 'Random Number Generator 1–100 — Pick 1 to 100 | CalcThis',
    desc: 'Pick a random number from 1 to 100 instantly. Get one number or many, with or without repeats, odd or even, sorted — 100 is included. Free, unbiased, no sign-up.',
    hero: 'Press <strong>Generate</strong> to get a random number from 1 to 100 (both included). Need several? Raise “How many numbers” and switch on <strong>No repeats</strong>.'
  },
  {
    slug: 'random-number-generator-1-10', h1: 'Random Number Generator 1–10', eyebrow: 'A random number from 1 to 10', min: '1', max: '10', mode: 'gen', unique: false,
    title: 'Random Number Generator 1–10 — Pick 1 to 10 | CalcThis',
    desc: 'Pick a random number from 1 to 10 instantly, with a spinning number wheel. One number or many, with or without repeats. Free, unbiased, no sign-up.',
    hero: 'Press <strong>Generate</strong> to spin the wheel and get a random number from 1 to 10. Both 1 and 10 are included.'
  },
  {
    slug: 'random-number-generator-1-3', h1: 'Random Number Generator 1–3', eyebrow: 'A random number from 1 to 3', min: '1', max: '3', mode: 'gen', unique: false,
    title: 'Random Number Generator 1–3 — Pick 1, 2 or 3 | CalcThis',
    desc: 'Pick 1, 2 or 3 at random with a spinning wheel — a fair way to choose between three options. Free, unbiased, no sign-up.',
    hero: 'Press <strong>Generate</strong> to pick 1, 2 or 3 — each has the same one-in-three chance. A fair way to choose between three options.'
  },
  {
    slug: 'random-number-generator-1-13', h1: 'Random Number Generator 1–13', eyebrow: 'A random number from 1 to 13', min: '1', max: '13', mode: 'gen', unique: false,
    title: 'Random Number Generator 1–13 — Pick 1 to 13 | CalcThis',
    desc: 'Pick a random number from 1 to 13 instantly, with a spinning wheel — handy for card ranks (ace to king), a 13-item list or a class draw. Free and unbiased.',
    hero: 'Press <strong>Generate</strong> to spin the wheel and get a random number from 1 to 13. Switch on <strong>Draw one at a time</strong> to deal them out with no repeats.'
  },
  {
    slug: 'random-number-generator-no-repeats', h1: 'Random Number Generator With No Repeats', eyebrow: 'Unique numbers — none appears twice', min: '', max: '', mode: 'gen', unique: true,
    title: 'Random Number Generator With No Repeats | CalcThis',
    desc: 'Generate random numbers with no repeats: set a range, choose how many, and every number is unique. Or draw one at a time from a pile. Free, unbiased, no sign-up.',
    hero: 'Every number you get is <strong>different</strong>. Set a range, choose how many, and press Generate — or draw them one at a time from a pile.'
  },
  {
    slug: 'random-number-generator-wheel', h1: 'Random Number Wheel', eyebrow: 'Spin a wheel of numbers', min: '1', max: '10', mode: 'draw', unique: true,
    title: 'Random Number Wheel — Spin to Pick a Number | CalcThis',
    desc: 'Spin a random number wheel: set any range, spin, and the wheel lands on a number. Each spin can remove the number so none repeats. Free, no sign-up.',
    hero: 'Set your range, press <strong>Draw a number</strong> and the wheel spins to a winner. Drawn numbers turn grey, so none comes up twice until you reset.'
  }
];
const hubPage = PAGES[0];
const urlOf = (p) => '/' + p.slug + '/';
const rangeTiles = () => PAGES.slice(1).map((p) => `<a class="un-tile" href="${urlOf(p)}"><b>${p.h1.replace('Random Number Generator ', '').replace('With No Repeats', 'No repeats') || p.h1}</b><span>${p.eyebrow}</span></a>`).join('');

/* ---------- FAQ ---------- */
const FQ_RANDOM = ['Is this random number generator truly random?', 'The numbers come from your browser’s secure random source (the same one used for encryption keys), and the range maths is exact, so no number is favoured. It is a computer-generated source rather than hardware noise, which is more than enough for games, draws, raffles, sampling and classroom use.'];
const FQ_BIG = ['How big can the numbers be?', 'Whole numbers can have up to 999 digits and decimals up to 999 decimal places. The maths is exact, so a range like 1 to 10^50 works without rounding.'];
function faqFor(p) {
  const a = p.min ? +p.min : null, b = p.max ? +p.max : null;
  if (p.hub) return [
    ['How do I generate a random number?', 'Type a minimum and a maximum (or tap a range such as 1–100), choose how many numbers you want and press Generate. Both limits are included, so 1 to 10 can give 1 or 10.'],
    ['How do I get random numbers with no repeats?', 'Tick <strong>No repeats</strong> and each number can appear only once. You can ask for at most as many numbers as the range holds — from 1 to 10 that is 10. To deal numbers out one by one, switch to <strong>Draw one at a time</strong>.'],
    ['How do I generate random decimals?', 'Choose <strong>Decimals</strong> and set the decimal places. From 0 to 1 with 3 decimal places you get values such as 0.482.'],
    ['Can I get only odd or even numbers?', 'Yes — open <strong>Go advanced</strong> and pick odd only, even only, half odd and half even, or the exact number of odd numbers you want.'],
    ['Can I leave certain numbers out?', 'Yes. Under <strong>Go advanced</strong>, type the numbers to skip in “Leave out these numbers”, for example 13 42 99. You can also count in steps, such as every 5th number.'],
    FQ_RANDOM, FQ_BIG
  ];
  const n = b - a + 1, base = [
    ['How do I get a random number between ' + a + ' and ' + b + '?', 'Press <strong>Generate</strong>. Both ' + a + ' and ' + b + ' are included, so each of the ' + commas(n) + ' numbers has a 1 in ' + commas(n) + ' chance (' + pct(1 / n) + ').'],
    ['Can I get several numbers from ' + a + ' to ' + b + ' with no repeats?', 'Yes — tick <strong>No repeats</strong> and set “How many numbers”. You can ask for up to ' + commas(n) + ', which returns every number from ' + a + ' to ' + b + ' in random order.'],
    ['What are the odds of the same number twice in a row?', 'It is 1 in ' + commas(n) + ' (' + pct(1 / n) + '). Each draw is independent, so a number that just came up is no more or less likely next time.'],
    FQ_RANDOM
  ];
  if (p.slug.endsWith('1-100')) base.splice(3, 0, ['How many numbers from 1 to 100 are prime?', facts(1, 100).pr + ' of the 100 — ' + pct(facts(1, 100).pr / 100) + '. Primes are numbers whose only divisors are 1 and themselves, such as 2, 3, 5, 7 and 97.']);
  if (p.slug.endsWith('1-10')) base.splice(3, 0, ['How do I draw 1 to 10 without repeating?', 'Switch to <strong>Draw one at a time</strong>. Each draw removes the number from the pile, so after ten draws you have dealt every number from 1 to 10 exactly once.']);
  if (p.slug.endsWith('1-3')) base.splice(3, 0, ['Can I use it to decide between three options?', 'Yes. Give each option a number from 1 to 3 and press Generate. Every option has the same ' + pct(1 / 3) + ' chance, so the choice is fair.']);
  if (p.slug.endsWith('1-13')) base.splice(3, 0, ['Can I use 1 to 13 for playing cards?', 'Yes — a suit has 13 ranks: ace (1), 2 to 10, jack (11), queen (12) and king (13). Use <strong>Draw one at a time</strong> to deal them with no repeats.']);
  if (p.slug.endsWith('no-repeats')) base.splice(1, 1, ['How do I draw lottery-style numbers?', 'Set the range, for example 1 to 49, choose how many numbers (say 6), keep <strong>No repeats</strong> ticked and press Generate. There are ' + commas(choose(49, 6)) + ' different ways to pick 6 numbers from 49, so any one combination has about a 1 in ' + commas(choose(49, 6)) + ' chance.']);
  if (p.slug.endsWith('wheel')) base.splice(1, 1, ['How does the number wheel pick a number?', 'The number is chosen first with the secure random source, then the wheel spins to land on it — so the animation never changes the odds. Every number has an equal slice.']);
  return base;
}

/* ---------- content sections ---------- */
const SRC = '<p class="st-src">Randomness: <a href="https://developer.mozilla.org/docs/Web/API/Crypto/getRandomValues" rel="noopener">Web Crypto getRandomValues</a>. Probabilities on this page are exact counts — favourable numbers divided by all numbers in the range.</p>';
function contentFor(p) {
  const f = faqFor(p);
  const faqHtml = f.map((q) => `    <details class="faq"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('\n');
  if (p.hub) return `  <section class="content">
    <div class="grid2">
      <div>
        <h2>How to use the random number generator</h2>
        <ol class="rg-steps">
          <li>Type a <strong>minimum</strong> and a <strong>maximum</strong> — or tap a ready-made range.</li>
          <li>Choose <strong>how many</strong> numbers you want.</li>
          <li>Tick <strong>No repeats</strong> if each number may appear only once.</li>
          <li>Press <strong>Generate</strong> — copy or download the result.</li>
        </ol>
        <h2>Pick a range</h2>
        <div class="un-tiles">${rangeTiles()}</div>
        <h2>What it can do</h2>
        <ul class="rg-list">
          <li>One number or up to <strong>10,000</strong> at a time</li>
          <li>Whole numbers or <strong>decimals</strong> (up to 999 places)</li>
          <li><strong>No repeats</strong>, or draw one at a time from a pile</li>
          <li>Odd only, even only, or half and half</li>
          <li>Leave numbers out, or count in steps</li>
          <li>Several sets at once, sorted either way</li>
          <li>Copy or download as commas, spaces, lines or a spreadsheet row</li>
        </ul>
      </div>
      <div>
        <h2>How random are the numbers?</h2>
        <p>Each number comes from your browser’s secure random source — the one used for encryption keys.</p>
        <p>The range is sliced without bias, so every number has exactly the same chance. Nothing is sent to a server.</p>
        <p>It suits games, draws, raffles, sampling and homework. For passwords or keys, use a dedicated password generator.</p>
        <h2>Chances at a glance</h2>
        ${factsTable(1, 10)}
        ${factsTable(1, 100)}
        ${SRC}
        <p>Need maths on your numbers? Try the <a href="/standard-deviation-calculator/">Standard Deviation Calculator</a> or the <a href="/percentage-calculator/">Percentage Calculator</a>.</p>
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqHtml}
  </section>`;
  const a = +p.min || 1, b = +p.max || 100, n = b - a + 1;
  const useCases = {
    'random-number-generator-1-100': ['Pick a winner by entry number', 'Guess-the-number games', 'Choose a random page, row or percentage', 'Classroom and raffle draws'],
    'random-number-generator-1-10': ['Rate-or-rank games', 'Pick one of ten items or people', 'Number guessing for kids', 'Draw all ten with no repeats'],
    'random-number-generator-1-3': ['Choose between three options', 'Rock-paper-scissors style tie-breaks', 'Pick one of three people', 'Quick fair decisions'],
    'random-number-generator-1-13': ['Card ranks from ace to king', 'Pick one of thirteen items or people', 'Class or team draws', 'Deal all thirteen with no repeats'],
    'random-number-generator-no-repeats': ['Lottery-style picks', 'Raffles where each ticket can win once', 'Assigning order or seats', 'Shuffling a list of numbers'],
    'random-number-generator-wheel': ['Classroom picker wheels', 'Games and giveaways', 'Choosing turns with no repeat', 'Making a draw visible to a group']
  }[p.slug] || [];
  const intro = p.slug.endsWith('wheel')
    ? '<p>The wheel has one slice per number. The number is chosen with a secure random source, then the wheel spins to land on it.</p><p>With <strong>Draw one at a time</strong>, each drawn number turns grey and cannot come up again until you press Reset pile.</p>'
    : p.slug.endsWith('no-repeats')
      ? '<p>Tick <strong>No repeats</strong> (already on) and every number in a result is different.</p><p>You can ask for at most as many numbers as your range holds. Need them one at a time? Switch to <strong>Draw one at a time</strong>.</p>'
      : '<p>Both ' + a + ' and ' + b + ' can come up — that is ' + commas(n) + ' possible numbers, each equally likely.</p><p>Change the range any time, or ask for many numbers at once with <strong>No repeats</strong>.</p>';
  return `  <section class="content">
    <div class="grid2">
      <div>
        <h2>${p.slug.endsWith('wheel') ? 'How the number wheel works' : p.slug.endsWith('no-repeats') ? 'How no-repeat numbers work' : 'How to get a random number from ' + a + ' to ' + b}</h2>
        ${intro}
        <h2>Good for</h2>
        <ul class="rg-list">${useCases.map((u) => '<li>' + u + '</li>').join('')}</ul>
        <h2>More ranges</h2>
        <div class="un-tiles">${PAGES.filter((q) => q.slug !== p.slug && !q.hub).slice(0, 4).map((q) => `<a class="un-tile" href="${urlOf(q)}"><b>${q.h1.replace('Random Number Generator ', '').replace('With No Repeats', 'No repeats') || q.h1}</b><span>${q.eyebrow}</span></a>`).join('')}</div>
        <p>For anything else use the <a href="/random-number-generator/">Random Number Generator</a> with any range.</p>
      </div>
      <div>
        <h2>The odds</h2>
        ${p.slug.endsWith('no-repeats') || p.slug.endsWith('wheel') ? factsTable(a, b) : factsTable(a, b)}
        ${SRC}
      </div>
    </div>

    <h2 style="margin-top:36px">Common questions</h2>
${faqHtml}
  </section>`;
}

const jsonApp = (name, url, desc) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name, url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: desc });
const strip = (t) => t.replace(/<[^>]+>/g, '');
const jsonFaq = (f) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: strip(q[1]) } })) });
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
const pillsFor = (p) => (p.hub
  ? [['/random-number-generator-1-100/', 'Random Number 1–100'], ['/random-number-generator-wheel/', 'Random Number Wheel'], ['/standard-deviation-calculator/', 'Standard Deviation Calculator'], ['/percentage-calculator/', 'Percentage Calculator']]
  : [['/random-number-generator/', 'Random Number Generator'], ['/random-number-generator-no-repeats/', 'No-Repeat Generator'], ['/percentage-calculator/', 'Percentage Calculator'], ['/ratio-calculator/', 'Ratio Calculator']].filter((x) => x[0] !== urlOf(p))).map((x) => pill(x[0], x[1], PILLSVG));

function bodyFor(p) {
  return `<body class="p-loan p-rng" data-mode="${p.mode}" data-min="${p.min}" data-max="${p.max}" data-unique="${p.unique ? '1' : '0'}">
<div class="wrap">

${hdr}

  <section class="hero">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1>${p.h1}</h1>
    <p>${p.hero}</p>
  </section>

  <div class="grid">
    <div class="card">
      <div class="card-pad">
        <h2 class="card-h2">Generate</h2>

        <div class="modeseg" id="rgMode" role="group" aria-label="How to pick">
          <button class="on" type="button" data-v="gen">Pick numbers</button>
          <button type="button" data-v="draw">Draw one at a time</button>
        </div>
        <div class="modeseg" id="rgType" role="group" aria-label="Number type">
          <button class="on" type="button" data-v="int">Whole numbers</button>
          <button type="button" data-v="dec">Decimals</button>
        </div>

        <div class="ln-two">
          ${fld('rgMin', 'Minimum', 'e.g. 1', 'text')}
          ${fld('rgMax', 'Maximum', 'e.g. 100', 'text')}
        </div>
        <div class="chips" id="rgChips" aria-label="Quick ranges" style="margin:-4px 0 16px">${chips}</div>

        <div id="rgCountFld">${fld('rgCount', 'How many numbers', 'e.g. 1')}</div>
        <div id="rgDpFld" style="display:none">${fld('rgDp', 'Decimal places', 'e.g. 2')}</div>
        <div id="rgUniqueWrap">${check('rgUnique', 'No repeats', 'each number comes up once', p.unique)}</div>
        <div class="fld" id="rgSortFld"><span class="lab">Sort</span>${cselEmpty('rgSort')}</div>

        <div class="rg-btns" id="rgBtns">
          <button class="btn" id="rgGo" type="button">Generate</button>
          <button class="btn btn-ghost" id="rgReset" type="button" style="display:none">Reset pile</button>
        </div>
        <p class="un-note" id="rgModeNote" style="display:none;margin-top:10px"></p>
        <p class="add-note ln-hint" id="rgHint" style="display:none"></p>

        <div id="rgAdvIn" style="display:none">
          <div class="proj-sep"></div>
          ${fld('rgStep', 'Count in steps of', 'e.g. 5')}
          ${fld('rgExcl', 'Leave out these numbers', 'e.g. 13 42 99', 'text')}
          <div class="fld" id="rgParFld"><span class="lab">Odd or even</span>${cselEmpty('rgPar')}</div>
          <div id="rgOddFld" style="display:none">${fld('rgOdd', 'How many of them are odd', 'e.g. 3')}</div>
          <div id="rgSetsFld">${fld('rgSets', 'How many sets', 'e.g. 1')}</div>
          ${check('rgIncMin', 'Include the minimum', '', true)}
          ${check('rgIncMax', 'Include the maximum', '', true)}
          <div class="fld" style="margin-top:10px"><span class="lab">Copy and download as</span>${cselEmpty('rgFmt')}</div>
        </div>

        <div class="add-row split" style="margin-top:16px">
          <span></span>
          <button class="advbtn" id="rgAdvBtn" type="button">
            <span id="rgAdvBtnLab">Go advanced</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-pad">
        <div class="ln-res">
          <div class="res-lab" id="rgResLab">Result</div>
          <div class="res-big" id="rgBig">—</div>
          <div class="res-sub" id="rgSub">Press Generate.</div>
        </div>

        <div id="rgBallsWrap" style="display:none"><div class="fc-grp">Your numbers</div><div id="rgBalls"></div></div>
        <div id="rgVisWrap" style="display:none"><div class="fc-grp" id="rgVisLab">The wheel</div><div class="ln-box" id="rgVis"></div></div>

        <div id="rgResults" style="display:none">
          <div id="rgStatsWrap" style="display:none"><div class="fc-grp">At a glance</div><table class="dtable ln-terms" id="rgStats"></table></div>
          <div id="rgHist" style="display:none"></div>
          <div class="rg-btnrow">
            <button class="btn btn-ghost" id="rgCopy" type="button">Copy numbers</button>
            <button class="btn btn-ghost" id="rgDl" type="button">Download .txt</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- mobile sticky bar -->
  <div class="mbar" id="mbar">
    <span class="mbar-lab" id="rgMLab">Result</span>
    <div class="mbar-vals"><b id="rgMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More tools that may interest you</p>
    <div class="pills">
${pillsFor(p).join('\n')}
    </div>
  </div>

${contentFor(p)}

${ftr}

</div>

<script src="/assets/app.js?v=242"></script>
<script>CalcThis.initRngCalc();</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
}
function write(rel, html) { const dir = ROOT + rel.replace(/index\.html$/, ''); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(ROOT + rel, html.replace(/\n/g, '\r\n')); }

PAGES.forEach((p) => {
  const url = 'https://calcthis.co' + urlOf(p), f = faqFor(p);
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }].concat(p.hub ? [{ '@type': 'ListItem', position: 2, name: 'Random Number Generator', item: url }] : [{ '@type': 'ListItem', position: 2, name: 'Random Number Generator', item: 'https://calcthis.co/random-number-generator/' }, { '@type': 'ListItem', position: 3, name: p.h1, item: url }]) };
  const html = headFor({ title: p.title, desc: p.desc, url, ogTitle: p.h1 }) + [jsonApp(p.h1, url, p.desc), jsonFaq(f), crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('') + '</head>\n' + bodyFor(p);
  write(p.slug + '/index.html', html);
});
console.log('pages written:', PAGES.length);

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fp = ROOT + rel; let s = fs.readFileSync(fp, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s !== o) { fs.writeFileSync(fp, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('updated', rel); } }
const slugs = PAGES.map(urlOf);
edit('sitemap.xml', (sm) => {
  const today = new Date().toISOString().slice(0, 10); let add = '';
  slugs.forEach((u) => { if (!sm.includes('<loc>https://calcthis.co' + u + '</loc>')) add += '  <url>\n    <loc>https://calcthis.co' + u + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' + (u === '/random-number-generator/' ? '0.8' : '0.7') + '</priority>\n  </url>\n'; });
  return add ? sm.replace('</urlset>', () => add + '</urlset>') : sm;
});
edit('build.js', (s) => {
  let add = '';
  slugs.forEach((u) => { const file = u.slice(1) + 'index.html'; if (!s.includes("file: '" + file + "'")) add += "  { file: '" + file + "', slug: '" + u + "' },\n"; });
  return add ? s.replace("  { file: 'paycheck-calculator/index.html',   slug: '/paycheck-calculator/' },\n", (mm) => mm + add) : s;
});
edit('llms.txt', (lt) => {
  lt = lt.replace(/\n## Random number generator\n[\s\S]*?(?=\n## |$)/, '');
  return lt.trimEnd() + '\n\n## Random number generator\n' + PAGES.map((p) => '- [' + p.h1 + '](https://calcthis.co' + urlOf(p) + '): ' + p.desc).join('\n') + '\n';
});
edit('partials/header.html', (s) => (s.includes('/random-number-generator/') ? s : s.replace('          <a href="/triangle-calculator/">Triangle</a>\n', (mm) => mm + '          <a href="/random-number-generator/">Random Number</a>\n')));
edit('partials/footer.html', (s) => (s.includes('/random-number-generator/') ? s : s.replace('          <li><a href="/triangle-calculator/">Triangle Calculator</a></li>\n', (mm) => mm + '          <li><a href="/random-number-generator/">Random Number Generator</a></li>\n')));
edit('index.html', (h) => {
  if (!h.includes('"name": "Random Number Generator"')) h = h.replace(/(        \{ "@type": "WebApplication", "name": "Triangle Calculator"[^\n]*\n)/, (mm) => mm + '        { "@type": "WebApplication", "name": "Random Number Generator", "url": "https://calcthis.co/random-number-generator/", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
  if (!h.includes('href="/random-number-generator/"')) {
    const i = h.indexOf('    <a class="calc" href="/triangle-calculator/">'); const j = h.indexOf('    </a>\n', i) + '    </a>\n'.length;
    const card = '    <a class="calc" href="/random-number-generator/">\n      <span class="ico" aria-hidden="true">\n        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">\n          <rect x="5" y="5" width="22" height="22" rx="5" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.3"/>\n          <circle cx="11" cy="11" r="1.9" fill="#B5761F"/><circle cx="21" cy="11" r="1.9" fill="#37503F"/><circle cx="16" cy="16" r="1.9" fill="#B5761F"/><circle cx="11" cy="21" r="1.9" fill="#37503F"/><circle cx="21" cy="21" r="1.9" fill="#B5761F"/>\n        </svg>\n      </span>\n      <h3>Random Number Generator</h3>\n      <p>Pick one number or thousands from any range — whole numbers or decimals, with or without repeats, odd or even, in sets — and watch a spinning number wheel land on the result.</p>\n      <span class="go">Open calculator\n        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>\n      </span>\n    </a>\n';
    h = h.slice(0, j) + card + h.slice(j);
  }
  return h;
});
