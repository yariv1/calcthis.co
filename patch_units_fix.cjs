/* Guarded idempotent patch: fix imperial-default detection in /assets/app.js.
   BUG: it defaulted to imperial when navigator.language was en-US, even for
   users physically outside the US (language != location). This replaces the
   language-based check with a TIMEZONE-only check across all three engines
   (Body Fat, TDEE, One Rep Max), so e.g. Asia/Jerusalem -> metric.
   - THROWS if the expected 3 old blocks aren't found
   - idempotent (skips if already fixed)
   Run from repo root:  node patch_units_fix.cjs  */
const fs = require('fs');
const FILE = fs.existsSync('assets/app.js') ? 'assets/app.js' : 'app.js';
let src = fs.readFileSync(FILE, 'utf8');

const OLD = `  function prefersImperial() {
    try {
      var langs = [];
      if (typeof navigator !== 'undefined') {
        if (navigator.language) langs.push(navigator.language);
        if (navigator.languages && navigator.languages.length) langs = langs.concat(navigator.languages);
      }
      for (var i = 0; i < langs.length; i++) {
        if (('' + langs[i]).toUpperCase().indexOf('-US') !== -1) return true;
      }
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
      var us = ['America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
        'America/Phoenix','America/Anchorage','America/Detroit','America/Boise',
        'America/Indiana/Indianapolis','America/Kentucky/Louisville','Pacific/Honolulu'];
      return us.indexOf(tz) !== -1;
    } catch (e) { return false; }
  }`;

const NEW = `  function prefersImperial() {
    // Location-based only (timezone). Do NOT use navigator.language —
    // en-US UI is common outside the US and must not force imperial.
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
      var us = ['America/New_York','America/Detroit','America/Kentucky/Louisville',
        'America/Kentucky/Monticello','America/Indiana/Indianapolis','America/Indiana/Vincennes',
        'America/Indiana/Winamac','America/Indiana/Marengo','America/Indiana/Petersburg',
        'America/Indiana/Vevay','America/Chicago','America/Indiana/Tell_City',
        'America/Indiana/Knox','America/Menominee','America/North_Dakota/Center',
        'America/North_Dakota/New_Salem','America/North_Dakota/Beulah','America/Denver',
        'America/Boise','America/Phoenix','America/Los_Angeles','America/Anchorage',
        'America/Juneau','America/Sitka','America/Metlakatla','America/Yakutat',
        'America/Nome','America/Adak','Pacific/Honolulu'];
      return us.indexOf(tz) !== -1;
    } catch (e) { return false; }
  }`;

const already = src.split(NEW).length - 1;
const found = src.split(OLD).length - 1;

if (already >= 3 && found === 0) {
  console.log('[units-fix] already applied — skipping.');
  process.exit(0);
}
if (found !== 3) {
  throw new Error('[units-fix] expected 3 old detection blocks, found ' + found +
    ' (already-fixed: ' + already + ') — aborting, file not patched.');
}

src = src.split(OLD).join(NEW);
fs.writeFileSync(FILE, src);
console.log('[units-fix] replaced 3 detection blocks (timezone-only) in ' + FILE + '.');
