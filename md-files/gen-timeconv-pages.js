const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
/* Regenerates /seconds-to-hours-calculator/, /minutes-to-hours-calculator/, /seconds-to-minutes-calculator/ and registers them (sitemap, build.js PAGES, llms.txt, header/footer partials,
   homepage card + hasPart + about list, seo-meta-hand.json). Every number in the text comes from CalcThis.timeConvEngine. Run: node md-files/gen-timeconv-pages.js, then node build.js. */
const app = fs.readFileSync(ROOT + 'assets/app.js', 'utf8');
var CalcThis = {};
eval(app.slice(app.indexOf('/* TIMECONV-ENGINE:START */'), app.indexOf('/* TIMECONV-ENGINE:END */')));
const X = CalcThis.timeConvEngine, f = X.fmtNum;
const ASSETVER = fs.readFileSync(ROOT + '.assetver', 'utf8').trim();
const nl = (s) => s.replace(/\r\n/g, '\n');
const cal = nl(fs.readFileSync(ROOT + 'calorie-calculator/index.html', 'utf8'));
const hdr = cal.slice(cal.indexOf('<!--HEADER:START-->'), cal.indexOf('<!--HEADER:END-->') + '<!--HEADER:END-->'.length);
const ftr = cal.slice(cal.indexOf('<!--FOOTER:START-->'), cal.indexOf('<!--FOOTER:END-->') + '<!--FOOTER:END-->'.length);
const headTop = cal.slice(0, cal.indexOf('<script type="application/ld+json">'));
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const wh = (s) => X.words(s, 'h'), wm = (s) => X.words(s, 'm'), ck = (s) => X.clock(s, 'h'), ckm = (s) => X.clock(s, 'm');
const hrs = (s) => f(s / 3600), mns = (s) => f(s / 60), N = (x) => f(x, 0);

const SRC = (first, f2, f3, closing) => `<h2>Sources</h2>
        <ul>
          <li>${first}</li>
          <li>${f2}</li>
          <li>${f3}</li>
        </ul>
        <p><small>${closing}</small></p>`;

/* ---------- three pages ---------- */
const PAGES = [];
{ /* seconds to hours */
  const ex = 7260, ex2 = 5400, d1 = 86400;
  const refS = [900, 1800, 3600, 5400, 7200, 10000, 14400, 21600, 36000, 43200, 86400];
  const refH = [1, 2, 3, 4, 5, 6, 8, 10, 12, 24];
  PAGES.push({
    kind: 'sec-hr', slug: 'seconds-to-hours-calculator', name: 'Seconds to Hours Calculator', menu: 'Seconds to Hours',
    title: 'Seconds to Hours Calculator: Convert s to h:m:s',
    desc: 'Seconds to hours calculator: type seconds, get hours as a decimal and as h:m:s, see the leftover on a clock, add a list of times and go back to seconds.',
    h1: 'Seconds to Hours Calculator', eyebrow: 'Seconds to hours and hours to seconds · decimal and h:mm:ss · add a list of times',
    cardH: 'Convert seconds to hours', phA: '5400', phB: '1.5', sn: 'Seconds', tn: 'Hours', two: 'hm', ringTop: 'h',
    lead: `Type the <strong>seconds</strong> and get the <strong>hours</strong> as a decimal and as hours, minutes and seconds. <strong>${N(ex2)} seconds</strong> is <strong>${hrs(ex2)} hours</strong> (${wh(ex2)}); <strong>${N(d1)} seconds</strong> is <strong>${hrs(d1)} hours</strong>. Type hours in the second box to go the other way, or add a whole list of times under Go advanced.`,
    schema: 'Free seconds to hours calculator: converts seconds to hours as a decimal and as hours, minutes and seconds, converts hours back to seconds in the second box, accepts 1:30:00 or 1h 30m, draws the leftover on a clock ring, shows every format at once and adds up a pasted list of times.',
    llms: 'Free seconds to hours calculator: seconds to decimal hours and h:m:s, hours to seconds, clock ring, every format at once with Copy, and the total of a pasted list.',
    card: 'Seconds to hours as a decimal and as h:m:s, hours to seconds, a clock ring and the total of a list.',
    about: 'seconds to decimal hours and h:m:s, hours to seconds, the total of a list',
    faqs: [
      ['How many seconds are in an hour?', `There are ${N(3600)} seconds in an hour: 60 minutes × 60 seconds. A day has ${N(86400)} seconds, a week ${N(604800)}, a 30-day month ${N(2592000)} and a 365-day year ${N(31536000)}.`],
      ['How do I convert seconds to hours?', `Divide the seconds by ${N(3600)}. ${N(ex2)} seconds ÷ ${N(3600)} = ${hrs(ex2)} hours. In the calculator, type the seconds in the first box and the hours appear in the second.`],
      ['How many hours is 86,400 seconds?', `${N(86400)} seconds is ${hrs(86400)} hours, exactly one day (${ck(86400)}).`],
      ['How many hours is 7,200 seconds?', `${N(7200)} seconds is ${hrs(7200)} hours (${ck(7200)}).`],
      ['How do I convert seconds to hours, minutes and seconds?', `Take the whole hours from seconds ÷ ${N(3600)}, then turn what is left into minutes and seconds. ${N(ex)} seconds is ${hrs(ex)} hours, which is ${wh(ex)}: 2 × ${N(3600)} = ${N(7200)}, and the ${N(60)} seconds left over make 1 minute. The calculator shows this as ${ck(ex)}.`],
      ['How do I convert hours to seconds?', `Multiply the hours by ${N(3600)}. 3 hours is ${N(10800)} seconds and 24 hours is ${N(86400)} seconds. In the calculator, type the hours in the second box and the seconds appear in the first.`],
      ['How do I total a list of times?', `Open Go advanced and paste the values, one per line or separated by semicolons. 5400, 7200 and 1:30:00 give ${N(5400 + 7200 + 5400)} seconds in all, which is ${hrs(5400 + 7200 + 5400)} hours; each line also gets its own row in a small table.`],
      ['How do I do it in Excel or Google Sheets?', `For decimal hours divide by ${N(3600)}: if the seconds are in A1, type =A1/3600. For a clock time divide by ${N(86400)} (the seconds in a day) and format the cell as [h]:mm:ss.`],
      ['Does it take daylight saving or leap seconds into account?', 'No. Every hour is counted as 3,600 seconds and every day as 86,400 seconds, which is how clocks and timesheets add durations.']
    ],
    tables: { ref: refS.map((s) => [N(s), s]), refHead: ['Seconds', 'Hours', 'Hours:min:sec'], refRow: (s) => [N(s), hrs(s), ck(s)] },
    body1: `Start with <strong>Seconds</strong>: the <strong>Hours</strong> box fills in while you type, and the large figure above is that same time as decimal hours. The plain-words line below it and the clock ring show where inside the final hour you are. Start with the hours instead and the seconds box answers.`,
    body2: `Not only digits work: <strong>1:30:00</strong>, <strong>1h 30m</strong> and <strong>90 min</strong> are accepted, and a short line under the boxes shows how your entry was understood. <strong>Go advanced</strong> opens a box for a whole list of times with a total, and extra units such as weeks, months and years.`,
    formula: `hours = seconds ÷ 3,600`, formulaSmall: 'DECIMAL HOURS = SECONDS ÷ 3,600',
    workedHead: 'Worked example',
    worked: `${N(ex)} seconds ÷ ${N(3600)} = ${hrs(ex)} hours. For the hours, minutes and seconds form: ${N(ex)} ÷ ${N(3600)} gives 2 whole hours (2 × ${N(3600)} = ${N(7200)} seconds), the ${N(ex - 7200)} seconds left over are 1 minute and 0 seconds, so ${N(ex)} seconds is ${wh(ex)} (${ck(ex)}).`,
    right: () => `
        <h2>Hours to seconds</h2>
        <p>To go the other way multiply the hours by ${N(3600)}, or just type the hours in the second box of the calculator: the first box shows the seconds. Click a row to see it in the calculator.</p>
        <table class="dtable tc-ref" id="tcRef2"><thead><tr><th>Hours</th><th>Seconds</th></tr></thead><tbody>${refH.map((h) => `<tr data-v="${h * 3600}"><td>${N(h)}</td><td>${N(h * 3600)}</td></tr>`).join('')}</tbody></table>
        <h2>Seconds in a day, week, month and year</h2>
        <ul>
          <li>1 minute: ${N(60)} seconds</li>
          <li>1 hour: ${N(3600)} seconds</li>
          <li>1 day: ${N(86400)} seconds (${N(24)} hours)</li>
          <li>1 week: ${N(604800)} seconds</li>
          <li>30-day month: ${N(2592000)} seconds</li>
          <li>365-day year: ${N(31536000)} seconds</li>
        </ul>
        <h2>Related tools</h2>
        <p>To work out the length of a shift or add times on a time card use the <a href="/hours-calculator/">hours calculator</a>, to add and subtract clock times the <a href="/time-calculator/">time calculator</a>, and to convert between other units the <a href="/unit-converter/">unit converter</a>. For the other direction of the minute scale see the <a href="/minutes-to-hours-calculator/">minutes to hours calculator</a> and the <a href="/seconds-to-minutes-calculator/">seconds to minutes calculator</a>.</p>`,
    pills: [['/hours-calculator/', 'Hours Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'], ['/time-calculator/', 'Time Calculator', '<path d="M7 4h10M7 20h10M8 4c0 5 8 5 8 8s-8 3-8 8"/>'], ['/minutes-to-hours-calculator/', 'Minutes to Hours', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5"/>'], ['/seconds-to-minutes-calculator/', 'Seconds to Minutes', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>']],
    srcFirst: 'The method — divide by the size of the unit, then split the remainder into whole minutes and seconds — is the one Inch Calculator and Omnicalculator publish for seconds to hours (both opened 2026-11-10; their examples are 5,400 seconds = 1.5 hours and 7,260 seconds = 2 hours 1 minute, which this page reproduces). Reading typed forms such as 1h 30m, the list total and the clock ring are this page\'s own arithmetic.',
    srcF2: 'Conversion factors are definitions: one hour is 60 minutes of 60 seconds, so 3,600 seconds, and one day is 24 hours, so 86,400 seconds. Inch Calculator quotes the SI definition of the second (the caesium 133 frequency) from the BIPM brochure; that brochure itself was not opened for this page.',
    srcF3: 'Every hour counts as exactly 3,600 seconds here, so daylight saving changes and leap seconds are ignored. Decimal results show up to six places, and the h:mm:ss form is exact to the millisecond.',
    srcClose: 'For information only. Check how your employer or school wants a time written before you copy a result.',
    prev: { slug: 'hours-calculator', menu: 'Hours', name: 'Hours Calculator', llms: 'Hours Calculator' }
  });
}
{ /* minutes to hours */
  const refM = [15, 30, 45, 60, 90, 115, 120, 150, 180, 240, 300, 360, 480, 1000];
  const six = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
  const S = (m) => m * 60;
  PAGES.push({
    kind: 'min-hr', slug: 'minutes-to-hours-calculator', name: 'Minutes to Hours Calculator', menu: 'Minutes to Hours',
    title: 'Minutes to Hours Calculator: Decimal Hours and h:mm',
    desc: 'Minutes to hours calculator: type minutes, get decimal hours and h:mm, round to 5, 6 or 15 minutes for timesheets, add a list of times and go back to minutes.',
    h1: 'Minutes to Hours Calculator', eyebrow: 'Minutes to decimal hours and h:mm · timesheet rounding · add a list of times',
    cardH: 'Convert minutes to hours', phA: '150', phB: '2.5', sn: 'Minutes', tn: 'Hours', two: 'hm', ringTop: 'h', round: true,
    lead: `Type the <strong>minutes</strong> and get the <strong>hours</strong> as a decimal and as hours and minutes. <strong>${N(90)} minutes</strong> is <strong>${hrs(S(90))} hours</strong> (${wh(S(90))}); <strong>${N(150)} minutes</strong> is <strong>${hrs(S(150))} hours</strong> (${wh(S(150))}). Go advanced rounds to the nearest 5, 6 or 15 minutes for timesheets and adds up a list of times.`,
    schema: 'Free minutes to hours calculator: converts minutes to decimal hours and to hours and minutes, hours back to minutes, accepts 8h 30m or 1:30, rounds to the nearest 5, 6 or 15 minutes for timesheets, draws the leftover on a clock ring and adds up a pasted list of times.',
    llms: 'Free minutes to hours calculator: minutes to decimal hours and h:mm, hours to minutes, rounding to 5, 6 or 15 minutes for timesheets, clock ring and list totals.',
    card: 'Minutes to decimal hours and h:mm, timesheet rounding to 5, 6 or 15 minutes, a clock ring and the total of a list.',
    about: 'minutes to decimal hours and h:mm, timesheet rounding, the total of a list',
    faqs: [
      ['How do I convert minutes to hours?', `Divide the minutes by 60. ${N(90)} minutes ÷ 60 = ${hrs(S(90))} hours. In the calculator, type the minutes in the first box and the hours appear in the second.`],
      ['How many hours is 150 minutes?', `${N(150)} minutes is ${hrs(S(150))} hours, or ${wh(S(150))} (${ck(S(150))}).`],
      ['How many hours is 180 minutes?', `${N(180)} minutes is ${hrs(S(180))} hours (${ck(S(180))}).`],
      ['How many hours is 300 minutes?', `${N(300)} minutes is ${hrs(S(300))} hours (${ck(S(300))}).`],
      ['How many hours is 1,000 minutes?', `${N(1000)} minutes is ${hrs(S(1000))} hours, which is ${wh(S(1000))} (${ck(S(1000))}).`],
      ['How many hours is 115 minutes?', `${N(115)} minutes is ${hrs(S(115))} hours, which is ${wh(S(115))} (${ck(S(115))}).`],
      ['How do I convert hours and minutes to decimal hours?', `Add the minutes divided by 60 to the whole hours: 8 hours 30 minutes is 8 + 30 ÷ 60 = 8.5 hours. In the calculator type 8h 30m (or 510) in the minutes box and read ${hrs(S(510))} in the hours box.`],
      ['Why is 7.5 hours not 7:50?', `Because the part after the decimal point is a fraction of an hour, not minutes. 7.5 hours is 7 hours and 30 minutes (7:30); 7:50 is 7 hours 50 minutes, which is ${hrs(S(470))} decimal hours.`],
      ['How do I round minutes to the nearest 15, 6 or 5 for a timesheet?', `Open Go advanced and pick a rounding. For example ${N(100)} minutes to the nearest 15 minutes is ${N(X.roundTo(S(100), 15) / 60)} minutes, which is ${hrs(X.roundTo(S(100), 15))} hours. Rounding to 6 minutes gives tenths of an hour. Use whichever rule your employer states.`],
      ['How do I total a column of durations?', `In Go advanced paste one value per line. ${N(45)}, ${N(90)} and 1:30 come to ${N(45 + 90 + 90)} minutes, or ${hrs(S(45 + 90 + 90))} hours, with each line converted next to it.`]
    ],
    tables: { refHead: ['Minutes', 'Hours', 'Hours:min:sec'] },
    refRows: refM.map((m) => [N(m), hrs(S(m)), ck(S(m)), m]),
    body1: `Enter your <strong>Minutes</strong> and read decimal <strong>Hours</strong> straight away: 45 minutes becomes 0.75, 90 becomes 1.5. The plain-words line and the clock face show the leftover inside the last hour, and typing hours instead gives you the minutes.`,
    body2: `Timesheet formats work too: <strong>8h 30m</strong> or <strong>2:15</strong> (hours and minutes) are read for you, and a line under the boxes confirms how. In <strong>Go advanced</strong> pick rounding to the nearest <strong>5, 6 or 15 minutes</strong>, paste a column of durations for a total, or see weeks, months and years.`,
    formula: `hours = minutes ÷ 60`, formulaSmall: 'DECIMAL HOURS = WHOLE HOURS + MINUTES ÷ 60',
    workedHead: 'Worked example',
    worked: `${N(150)} minutes ÷ 60 = ${hrs(S(150))} hours. For the hours and minutes form: ${N(150)} ÷ 60 gives 2 whole hours (2 × 60 = 120 minutes) and ${N(30)} minutes left over, so ${N(150)} minutes is ${wh(S(150))} (${ck(S(150))}). And 8 hours 30 minutes as decimal hours: 8 + ${N(30)} ÷ 60 = 8.5.`,
    right: () => `
        <h2>Six-minute steps: minutes to decimal hours</h2>
        <p>Timesheets that count in tenths of an hour use six-minute steps. Click a row to see it in the calculator.</p>
        <table class="dtable tc-ref" id="tcRef2"><thead><tr><th>Minutes</th><th>Decimal hours</th></tr></thead><tbody>${six.map((m) => `<tr data-v="${m}"><td>${N(m)}</td><td>${hrs(S(m))}</td></tr>`).join('')}</tbody></table>
        <h2>The mistake to avoid</h2>
        <p>The digits after the decimal point are a fraction of an hour, not minutes: 7.5 hours is 7 hours 30 minutes (7:30), not 7:50, and 8:45 is ${hrs(S(525))} hours, not 8.45. The calculator shows both forms side by side so you can copy the one your form asks for.</p>
        <h2>Rounding for timesheets</h2>
        <p>Open Go advanced and choose the nearest 5, 6 or 15 minutes. For ${N(100)} minutes the nearest 15 is ${N(X.roundTo(S(100), 15) / 60)} minutes (${hrs(X.roundTo(S(100), 15))} hours). This page only does the arithmetic: use the rounding rule your employer or payroll system states.</p>
        <h2>Related tools</h2>
        <p>To work out a shift with breaks, overtime and pay use the <a href="/hours-calculator/">hours calculator</a>, to add and subtract clock times the <a href="/time-calculator/">time calculator</a>, and to convert between other units the <a href="/unit-converter/">unit converter</a>. For smaller units see the <a href="/seconds-to-hours-calculator/">seconds to hours calculator</a> and the <a href="/seconds-to-minutes-calculator/">seconds to minutes calculator</a>.</p>`,
    pills: [['/hours-calculator/', 'Hours Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'], ['/time-calculator/', 'Time Calculator', '<path d="M7 4h10M7 20h10M8 4c0 5 8 5 8 8s-8 3-8 8"/>'], ['/seconds-to-hours-calculator/', 'Seconds to Hours', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'], ['/overtime-calculator/', 'Overtime Calculator', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>']],
    srcFirst: 'The method — divide the minutes by 60, then turn the remainder into minutes — is the one Inch Calculator, Omnicalculator and DQYDJ publish for minutes to hours (opened 2026-11-10; Inch Calculator\'s 90 minutes = 1.5 hours is reproduced here). The 7.5 hours is 7:30 note, the six-minute steps, the rounding choices, the list total and the clock ring are this page\'s own arithmetic.',
    srcF2: 'An hour is 60 minutes by definition, so a minute is exactly 1/60 of an hour and the part of an hour after the decimal point is minutes ÷ 60: 30 minutes is 0.5 hour, 15 minutes is 0.25 hour.',
    srcF3: 'The rounding choices on this page (5, 6 and 15 minutes) are plain nearest-multiple rounding with halves rounded up. They are not a legal rule: use the policy of your employer or payroll system.',
    srcClose: 'For information only. Timesheet rules differ by employer and place; this page only does the arithmetic.',
    prev: { slug: 'seconds-to-hours-calculator', menu: 'Seconds to Hours', name: 'Seconds to Hours Calculator', llms: 'Seconds to Hours Calculator' }
  });
}
{ /* seconds to minutes */
  const refS = [30, 60, 90, 300, 500, 900, 1000, 1200, 1800, 3600];
  PAGES.push({
    kind: 'sec-min', slug: 'seconds-to-minutes-calculator', name: 'Seconds to Minutes Calculator', menu: 'Seconds to Minutes',
    title: 'Seconds to Minutes Calculator: Convert s to min and s',
    desc: 'Seconds to minutes calculator: type seconds, get minutes as a decimal and as m:ss, see the leftover on a clock, add a list of times and go back to seconds.',
    h1: 'Seconds to Minutes Calculator', eyebrow: 'Seconds to minutes and minutes to seconds · decimal and m:ss · add a list of times',
    cardH: 'Convert seconds to minutes', phA: '90', phB: '1.5', sn: 'Seconds', tn: 'Minutes', two: 'ms', ringTop: 'm',
    lead: `Type the <strong>seconds</strong> and get the <strong>minutes</strong> as a decimal and as minutes and seconds. <strong>${N(90)} seconds</strong> is <strong>${mns(90)} minutes</strong> (${wm(90)}); <strong>${N(300)} seconds</strong> is <strong>${mns(300)} minutes</strong>. Type minutes in the second box to go the other way, or add a list of times under Go advanced.`,
    schema: 'Free seconds to minutes calculator: converts seconds to minutes as a decimal and as minutes and seconds, converts minutes back to seconds in the second box, accepts 1:30 or 1m 30s, draws the leftover on a clock ring, shows every format at once and adds up a pasted list of times.',
    llms: 'Free seconds to minutes calculator: seconds to decimal minutes and m:ss, minutes to seconds, clock ring, every format at once with Copy, and the total of a pasted list.',
    card: 'Seconds to minutes as a decimal and as m:ss, minutes to seconds, a clock ring and the total of a list.',
    about: 'seconds to decimal minutes and m:ss, minutes to seconds, the total of a list',
    faqs: [
      ['How many seconds are in a minute?', `There are 60 seconds in a minute. An hour has ${N(3600)} seconds and a day ${N(86400)}.`],
      ['How do I convert seconds to minutes?', `Divide the seconds by 60. ${N(90)} seconds ÷ 60 = ${mns(90)} minutes. In the calculator, type the seconds in the first box and the minutes appear in the second.`],
      ['How many minutes is 300 seconds?', `${N(300)} seconds is ${mns(300)} minutes (${ckm(300)}).`],
      ['How many minutes is 3,600 seconds?', `${N(3600)} seconds is ${mns(3600)} minutes, which is 1 hour.`],
      ['How many minutes is 1,000 seconds?', `${N(1000)} seconds is ${mns(1000)} minutes, which is ${wm(1000)} (${ckm(1000)}).`],
      ['How many minutes is 500 seconds?', `${N(500)} seconds is ${mns(500)} minutes, which is ${wm(500)} (${ckm(500)}).`],
      ['How many minutes is 900, 1,200 and 1,800 seconds?', `${N(900)} seconds is ${mns(900)} minutes, ${N(1200)} seconds is ${mns(1200)} minutes and ${N(1800)} seconds is ${mns(1800)} minutes.`],
      ['How do I convert seconds to minutes and seconds?', `Take the whole minutes from seconds ÷ 60 and keep the remainder as seconds. ${N(1000)} seconds ÷ 60 gives ${N(16)} whole minutes (${N(16)} × 60 = ${N(960)}) with ${N(40)} seconds left, so ${N(1000)} seconds is ${wm(1000)}.`],
      ['How do I convert minutes to seconds?', `Multiply the minutes by 60. 5 minutes is ${N(300)} seconds and 15 minutes is ${N(900)} seconds. In the calculator, type the minutes in the second box and the seconds appear in the first.`],
      ['How do I add up lap or clip times?', `In Go advanced type one time per line: ${N(45)}, ${N(90)} and 1:15 total ${N(45 + 90 + 75)} seconds, which is ${mns(45 + 90 + 75)} minutes (${wm(45 + 90 + 75)}).`]
    ],
    tables: { refHead: ['Seconds', 'Minutes', 'Minutes:seconds'] },
    refRows: refS.map((s) => [N(s), mns(s), ckm(s), s]),
    body1: `Put the <strong>Seconds</strong> in and the <strong>Minutes</strong> appear as a decimal alongside; below the big number sits the same time as minutes and seconds, and the ring treats one minute as a full circle so you can see the extra seconds. Typing minutes works in reverse.`,
    body2: `Stopwatch style input works: <strong>1:30</strong> (minutes and seconds), <strong>1m 30s</strong> or <strong>90 sec</strong>. The line under the boxes shows how the entry was read. <strong>Go advanced</strong> takes a list of lap or clip times, one per line, and adds them up.`,
    formula: `minutes = seconds ÷ 60`, formulaSmall: 'DECIMAL MINUTES = SECONDS ÷ 60',
    workedHead: 'Worked example',
    worked: `${N(1000)} seconds ÷ 60 = ${mns(1000)} minutes. For the minutes and seconds form: ${N(1000)} ÷ 60 gives ${N(16)} whole minutes (${N(16)} × 60 = ${N(960)} seconds) and ${N(40)} seconds left over, so ${N(1000)} seconds is ${wm(1000)} (${ckm(1000)}).`,
    right: () => `
        <h2>Minutes to seconds</h2>
        <p>To go the other way multiply the minutes by 60, or just type the minutes in the second box of the calculator: the first box shows the seconds. Click a row to see it in the calculator.</p>
        <table class="dtable tc-ref" id="tcRef2"><thead><tr><th>Minutes</th><th>Seconds</th></tr></thead><tbody>${[1, 2, 5, 10, 15, 20, 30, 45, 60].map((m) => `<tr data-v="${m * 60}"><td>${N(m)}</td><td>${N(m * 60)}</td></tr>`).join('')}</tbody></table>
        <h2>Timing, laps and clips</h2>
        <p>Stopwatch laps, video clips and song lengths are usually written as minutes and seconds. The "Minutes:seconds" line of the calculator is that form, so ${N(1000)} seconds reads as ${ckm(1000)}. Paste a list of lap or clip lengths under Go advanced to get the total.</p>
        <h2>Related tools</h2>
        <p>To add and subtract clock times use the <a href="/time-calculator/">time calculator</a>, to work out a shift the <a href="/hours-calculator/">hours calculator</a>, and to convert between other units the <a href="/unit-converter/">unit converter</a>. For longer spans see the <a href="/seconds-to-hours-calculator/">seconds to hours calculator</a> and the <a href="/minutes-to-hours-calculator/">minutes to hours calculator</a>.</p>`,
    pills: [['/time-calculator/', 'Time Calculator', '<path d="M7 4h10M7 20h10M8 4c0 5 8 5 8 8s-8 3-8 8"/>'], ['/hours-calculator/', 'Hours Calculator', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'], ['/seconds-to-hours-calculator/', 'Seconds to Hours', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'], ['/minutes-to-hours-calculator/', 'Minutes to Hours', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5"/>']],
    srcFirst: 'The method — divide the seconds by 60, then keep the remainder as seconds — is the one Inch Calculator and DQYDJ publish for seconds to minutes (opened 2026-11-10; Inch Calculator\'s 90 seconds = 1.5 minutes = 1 minute 30 seconds is reproduced here). Reading typed forms such as 1m 30s, the list total and the clock ring are this page\'s own arithmetic.',
    srcF2: 'A minute is 60 seconds by definition, so a second is 1/60 of a minute; the seconds left after the whole minutes stay as seconds in the minutes and seconds form.',
    srcF3: 'Decimal minutes show up to six places and the minutes and seconds form is exact to the millisecond. The clock ring uses one minute as the full circle.',
    srcClose: 'For information only. Check the format a stopwatch, form or video editor expects before you copy a result.',
    prev: { slug: 'minutes-to-hours-calculator', menu: 'Minutes to Hours', name: 'Minutes to Hours Calculator', llms: 'Minutes to Hours Calculator' }
  });
}

const pill = (href, label, p) => `      <a class="pill" href="${href}">\n        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>\n        ${label}\n      </a>`;
const COPY = (id) => `<button class="linkbtn tc-cp" type="button" data-copy="${id}">Copy</button>`;

function build(P) {
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
  const jsonApp = { '@context': 'https://schema.org', '@type': 'WebApplication', name: P.name, url, applicationCategory: 'UtilityApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: P.schema };
  const jsonFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: P.faqs.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1].replace(/<[^>]+>/g, '') } })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'CalcThis', item: 'https://calcthis.co/' }, { '@type': 'ListItem', position: 2, name: P.name, item: url }] };
  const ld = [jsonApp, jsonFaq, crumbs].map((j) => '<script type="application/ld+json">\n' + JSON.stringify(j, null, 2) + '\n</script>\n').join('');

  const roundSel = P.round ? `
          <div class="fld"><span class="lab">Round to the nearest</span><div class="csel" id="tcRound" data-value="0" aria-label="Round to the nearest"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val">No rounding</span>${chev}</button><div class="csel-panel" role="listbox"><button type="button" class="csel-opt on" role="option" aria-selected="true" data-value="0">No rounding</button><button type="button" class="csel-opt" role="option" aria-selected="false" data-value="5">5 minutes</button><button type="button" class="csel-opt" role="option" aria-selected="false" data-value="6">6 minutes (tenths of an hour)</button><button type="button" class="csel-opt" role="option" aria-selected="false" data-value="15">15 minutes</button></div></div></div>
          <p class="av-note" id="tcRoundNote"></p>` : '';
  const fld = (id, label, ph) => `<label class="fld" for="${id}"><span class="lab">${label}</span><div class="inp"><input id="${id}" type="text" autocomplete="off" placeholder="e.g. ${ph}"></div></label>`;
  const input = `
        <h2 class="card-h2">${P.cardH}</h2>
        <div class="tc-two">${fld('tcA', P.sn, P.phA)}${fld('tcB', P.tn, P.phB)}</div>
        <div class="res-hint" id="tcHint" style="display:none;text-align:left;margin:4px 0 8px"></div>
        <p class="av-note" id="tcNote"></p>
        <div id="tcAdvIn" style="display:none">
          <div class="proj-sep"></div>
          <label class="fld" for="tcList"><span class="lab">Several values <span class="unit">optional</span></span><textarea class="tc-ta" id="tcList" placeholder="e.g. ${P.kind === 'min-hr' ? '45&#10;90&#10;1:30' : P.kind === 'sec-min' ? '45&#10;90&#10;1:15' : '5400&#10;7200&#10;1:30:00'}" aria-label="Several values, one per line" spellcheck="false"></textarea></label>
          <p class="av-note" id="tcListNote"></p>${roundSel}
        </div>
        <div class="add-row split" style="margin-top:16px">
          <button class="linkbtn" id="tcClear" type="button">Clear fields</button>
          <button class="advbtn" id="tcAdvBtn" type="button">
            <span id="tcAdvBtnLab">Go advanced</span>
            ${chev}
          </button>
        </div>`;
  const units = [['s', 'tcFsec', 'Total in seconds'], ['m', 'tcFmin', 'Total in minutes'], ['h', 'tcFhr', 'Total in hours'], ['d', 'tcFday', 'Total in days']].filter((u) => u[0] !== P.kind.split('-')[1].replace('hr', 'h').replace('min', 'm'));
  const tgt = P.kind.split('-')[1] === 'hr' ? 'h' : 'm';
  const rows = [
    ['tcFdec', `${P.tn} (decimal)`], ['tcF2dp', `${P.tn}, rounded to 2 decimal places`], ['tcFclock', tgt === 'h' ? 'Clock form (h:mm:ss)' : 'Clock form (m:ss)'], ['tcFwords', 'In words']
  ].concat(units.filter((u) => u[0] !== tgt).map((u) => [u[1], u[2]]));
  const fmtRows = rows.map((r) => `<tr><td>${r[1]}</td><td id="${r[0]}"></td><td>${COPY(r[0])}</td></tr>`).join('') +
    (P.round ? `<tr id="tcFrRow" style="display:none"><td id="tcFrL"></td><td id="tcFr"></td><td>${COPY('tcFr')}</td></tr>` : '');
  const moreWrap = tgt === 'h' ? `
          <div id="tcMoreWrap" style="display:none">
            <p class="bm-h">More time units</p>
            <table class="dtable" id="tcMore"><tbody>${[['tcFwk', 'Total in weeks'], ['tcFmo', 'Total in months (30 days)'], ['tcFyr', 'Total in years (365 days)'], ['tcFdhm', 'Days, hours, minutes, seconds'], ['tcFwdh', 'Weeks, days, hours, minutes, seconds'], ['tcFymd', 'Years, months, days, hours, minutes, seconds']].map((r) => `<tr><td>${r[1]}</td><td id="${r[0]}"></td><td>${COPY(r[0])}</td></tr>`).join('')}</tbody></table>
            <p class="cb-note">Here a month is 30 days and a year is 365 days.</p>
          </div>` : '';
  const result = `
        <div class="bf-res">
          <div class="res-lab" id="tcLab">${P.tn}</div>
          <div class="res-big"><span id="tcBig">—</span></div>
          <div class="res-sub" id="tcSub" data-empty="Type a time in either box.">Type a time in either box.</div>
        </div>
        <div id="tcBody" style="display:none">
          <p class="res-tip adv-tip" id="tcTip"></p>
          <div class="tc-ring" id="tcRingWrap"></div>
          <p class="cb-note tc-cap" id="tcRingCap"></p>
          <p class="bm-h">Every format at once</p>
          <table class="dtable" id="tcFormats"><tbody>${fmtRows}</tbody></table>
          <p class="cb-note">Click Copy beside a value to copy it.</p>${moreWrap}
          <div id="tcBatchWrap" style="display:none">
            <p class="bm-h">Your list</p>
            <table class="dtable" id="tcBatch"></table>
          </div>
        </div>`;
  const moreRows = [['tcFwk', 'Total in weeks'], ['tcFmo', 'Total in months (30 days)'], ['tcFyr', 'Total in years (365 days)'], ['tcFdhm', 'Days, hours, minutes, seconds'], ['tcFwdh', 'Weeks, days, hours, minutes, seconds'], ['tcFymd', 'Years, months, days, hours, minutes, seconds']];
  void moreRows;
  const refRows = P.refRows || P.tables.ref.map((r) => { const s = r[1]; return [r[0], P.tables.refRow(s)[1], P.tables.refRow(s)[2], s]; });
  const refTbl = `<table class="dtable tc-ref" id="tcRef"><thead><tr><th>${P.tables.refHead[0]}</th><th>${P.tables.refHead[1]}</th><th>${P.tables.refHead[2]}</th></tr></thead><tbody>${refRows.map((r) => `<tr data-v="${r[3]}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>`;
  const left = `
        <h2>How to use the ${P.name.toLowerCase()}</h2>
        <p>${P.body1}</p>
        <p>${P.body2}</p>
        <h2>The formula</h2>
        <div class="formula">
          ${P.formula}
          <small>${P.formulaSmall}</small>
        </div>
        <p>${P.worked}</p>
        <h2>${P.sn} to ${P.tn.toLowerCase()} chart</h2>
        <p>The numbers people look up most. Click a row to see it in the calculator.</p>
        ${refTbl}`;
  const right = P.right() + '\n        ' + SRC(P.srcFirst, P.srcF2, P.srcF3, P.srcClose);
  const body = `<body class="p-bmr p-tc">
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
    <span class="mbar-lab" id="tcMLab">${P.tn}</span>
    <div class="mbar-vals"><b id="tcMVal">—</b></div>
  </div>

  <div class="related-calcs">
    <p class="related-calcs-h">More calculators that may interest you</p>
    <div class="pills">
${P.pills.map((p) => pill(p[0], p[1], p[2])).join('\n')}
    </div>
  </div>

  <section class="content">
    <div class="grid2" id="tcContent">
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

<script src="/assets/app.js?v=${ASSETVER}"></script>
<script>CalcThis.initTimeConvCalc('${P.kind}');</script>
<script src="/feedback.js" defer></script>
</body>
</html>
`;
  const dir = ROOT + P.slug + '/'; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + 'index.html', (head + ld + '</head>\n' + body).replace(/\n/g, '\r\n'));
  console.log(P.slug, 'written; title', P.title.length, 'desc', P.desc.length);
}

/* ---------- registration (idempotent) ---------- */
function edit(rel, fn) { const fl = ROOT + rel; let s2 = fs.readFileSync(fl, 'utf8'); const crlf = s2.includes('\r\n'); s2 = s2.replace(/\r\n/g, '\n'); const o = s2; s2 = fn(s2); if (s2 !== o) { fs.writeFileSync(fl, crlf ? s2.replace(/\n/g, '\r\n') : s2); console.log('updated', rel); } }
const today = new Date().toISOString().slice(0, 10);
function register(P) {
  const prev = P.prev, url = 'https://calcthis.co/' + P.slug + '/', slug = '/' + P.slug + '/', ps2 = '/' + prev.slug + '/';
  edit('sitemap.xml', (sm) => sm.includes('<loc>' + url + '</loc>') ? sm : sm.replace('</urlset>', () => '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>'));
  edit('build.js', (s2) => s2.includes("slug: '" + slug + "'") ? s2 : s2.replace(new RegExp("(  \\{ file: '" + prev.slug + "/index\\.html',[^\\n]*\\n)"), (mm) => mm + "  { file: '" + P.slug + "/index.html',          slug: '" + slug + "' },\n"));
  edit('llms.txt', (lt) => lt.includes(slug) ? lt : lt.replace(new RegExp('(- \\[' + prev.llms + '[^\\n]*\\n)'), (mm) => mm + '- [' + P.title + '](' + url + '): ' + P.llms + '\n'));
  edit('partials/header.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <a href="' + ps2 + '">' + prev.menu + '</a>\n', (mm) => mm + '          <a href="' + slug + '">' + P.menu + '</a>\n'));
  edit('partials/footer.html', (s2) => s2.includes('href="' + slug + '"') ? s2 : s2.replace('          <li><a href="' + ps2 + '">' + prev.name + '</a></li>\n', (mm) => mm + '          <li><a href="' + slug + '">' + P.name + '</a></li>\n'));
  edit('md-files/seo-meta-hand.json', (s2) => s2.includes('"' + slug + '"') ? s2 : s2.replace('  "' + ps2 + '": {', () => '  "' + slug + '": {\n    "t": ' + JSON.stringify(P.title) + ',\n    "d": ' + JSON.stringify(P.desc) + '\n  },\n  "' + ps2 + '": {'));
  edit('index.html', (h) => {
    if (!h.includes('"name": "' + P.name + '"')) h = h.replace(new RegExp('(        \\{ "@type": "WebApplication", "name": "' + prev.name + '"[^\\n]*\\n)'), (mm) => mm + '        { "@type": "WebApplication", "name": "' + P.name + '", "url": "' + url + '", "applicationCategory": "UtilityApplication", "operatingSystem": "Any (web browser)", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } },\n');
    if (!h.includes('<h3>' + P.name + '</h3>')) {
      const card = `    <a class="calc" href="${slug}">
      <span class="ico" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" fill="#EFE7D8" stroke="#8F5C13" stroke-width="1.4"/><path d="M16 9v7l5 3" stroke="#37503F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <h3>${P.name}</h3>
      <p>${P.card}</p>
      <span class="go">Open calculator
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>

`;
      h = h.replace('    <a class="calc" href="' + ps2 + '">', () => card + '    <a class="calc" href="' + ps2 + '">');
    }
    const li = '<a href="' + slug + '">' + P.menu + '</a><span>';
    if (!h.includes(li)) h = h.replace(new RegExp('(          <li><a href="' + ps2.replace(/\//g, '\\/') + '">[^\\n]*\\n)'), (mm) => mm + '          <li><a href="' + slug + '">' + P.menu + '</a><span> — ' + P.about + '</span></li>\n');
    return h;
  });
}
PAGES.forEach((P) => { build(P); register(P); });
