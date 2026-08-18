/* Guarded idempotent patch: append CalcThis.initBodyFatCalc to /assets/app.js
   - skips if already applied (idempotent)
   - THROWS if the HRZone anchor is missing (wrong/corrupt file)
   Run from repo root:  node patch_bodyfat_app.cjs  */
const fs = require('fs');
const FILE = fs.existsSync('assets/app.js') ? 'assets/app.js' : 'app.js';

let src = fs.readFileSync(FILE, 'utf8');

if (src.indexOf('CalcThis.initBodyFatCalc') !== -1) {
  console.log('[bodyfat/app] already applied — skipping.');
  process.exit(0);
}
const anchor = 'CalcThis.initHRZoneCalc = function';
const n = src.split(anchor).length - 1;
if (n !== 1) throw new Error('[bodyfat/app] expected 1 HRZone anchor, found ' + n + ' — aborting, file not patched.');

const ENGINE = `
/* -----------------------------------------------------------
   CalcThis.initBodyFatCalc(cfg) — US Navy tape-method body-fat %.
   Independent of the area/volume/pace/hrzone engines. Simple mode:
   sex toggle + height / neck / waist (+ hip for female), cm/in unit
   toggle, US Navy formula, category table with the user's row
   highlighted. Advanced mode adds a BMI-method cross-check plus
   fat-mass / lean-mass (needs age + weight). Live, no button. */
CalcThis.initBodyFatCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var sex = 'male', unit = 'cm', advanced = false;

  var CATS = {
    male: [
      { name:'Essential fat', hi:5,   range:'2\\u20135%'   },
      { name:'Athletes',      hi:13,  range:'6\\u201313%'  },
      { name:'Fitness',       hi:17,  range:'14\\u201317%' },
      { name:'Average',       hi:24,  range:'18\\u201324%' },
      { name:'Obese',         hi:999, range:'25%+'        }
    ],
    female: [
      { name:'Essential fat', hi:13,  range:'10\\u201313%' },
      { name:'Athletes',      hi:20,  range:'14\\u201320%' },
      { name:'Fitness',       hi:24,  range:'21\\u201324%' },
      { name:'Average',       hi:31,  range:'25\\u201331%' },
      { name:'Obese',         hi:999, range:'32%+'        }
    ]
  };

  var heightIn = $('height'), neckIn = $('neck'), waistIn = $('waist'), hipIn = $('hip'),
      ageIn = $('age'), weightIn = $('weight');
  if (!heightIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function toCm(v) { return unit === 'in' ? v * 2.54 : v; }
  function toKg(v) { return unit === 'in' ? v / 2.2046226 : v; }
  function log10(x) { return Math.log(x) / Math.LN10; }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }

  function catFor(bf) {
    var arr = CATS[sex];
    for (var i = 0; i < arr.length; i++) { if (bf <= arr[i].hi) return arr[i]; }
    return arr[arr.length - 1];
  }

  function navyBF() {
    var h = toCm(num(heightIn.value)), nk = toCm(num(neckIn.value)), w = toCm(num(waistIn.value));
    if (!(isFinite(h) && h > 0 && isFinite(nk) && nk > 0 && isFinite(w) && w > 0)) return NaN;
    var bf;
    if (sex === 'male') {
      var d = w - nk; if (!(d > 0)) return NaN;
      bf = 495 / (1.0324 - 0.19077 * log10(d) + 0.15456 * log10(h)) - 450;
    } else {
      var hp = toCm(num(hipIn ? hipIn.value : NaN)); if (!(isFinite(hp) && hp > 0)) return NaN;
      var s = w + hp - nk; if (!(s > 0)) return NaN;
      bf = 495 / (1.29579 - 0.35004 * log10(s) + 0.22100 * log10(h)) - 450;
    }
    if (!isFinite(bf)) return NaN;
    if (bf < 1) bf = 1; if (bf > 75) bf = 75;
    return bf;
  }

  function fillCatTable(bf) {
    var arr = CATS[sex], hasBf = isFinite(bf), cur = hasBf ? catFor(bf) : null;
    var head = '<thead><tr><th>Category</th><th>' + (sex === 'male' ? 'Men' : 'Women') +
      ' \\u00b7 body fat</th></tr></thead>';
    var rows = '';
    arr.forEach(function (c) {
      var on = cur && c.name === cur.name ? ' class="cur"' : '';
      rows += '<tr' + on + '><td>' + c.name + '</td><td>' + c.range + '</td></tr>';
    });
    $('catTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
  }

  function solve() {
    var bf = navyBF();
    var resBig = $('resBig'), resUnit = $('resUnit'), resSub = $('resSub');

    if (!isFinite(bf)) {
      resBig.textContent = '\\u2014'; resUnit.textContent = '';
      resSub.textContent = sex === 'female'
        ? 'Enter height, neck, waist and hip to see your body fat.'
        : 'Enter height, neck and waist to see your body fat.';
      fillCatTable(NaN);
      if ($('advOut')) $('advOut').style.display = 'none';
      return;
    }

    resBig.textContent = one(bf); resUnit.textContent = '%';
    resSub.textContent = catFor(bf).name + ' \\u00b7 US Navy tape method';
    fillCatTable(bf);

    var advOut = $('advOut');
    if (advanced && advOut) {
      var age = num(ageIn ? ageIn.value : NaN);
      var wKg = isFinite(num(weightIn ? weightIn.value : NaN)) ? toKg(num(weightIn.value)) : NaN;
      var h = toCm(num(heightIn.value));
      var parts = [];

      if (isFinite(age) && age > 0 && isFinite(wKg) && wKg > 0 && isFinite(h) && h > 0) {
        var bmi = wKg / Math.pow(h / 100, 2);
        var sexVal = sex === 'male' ? 1 : 0;
        var bmiBF = 1.20 * bmi + 0.23 * age - 10.8 * sexVal - 5.4;
        if (bmiBF < 1) bmiBF = 1;
        parts.push('<div class="bf-cmp"><span class="k">BMI-method estimate</span><span class="v">' + one(bmiBF) + '%</span></div>');
      }
      if (isFinite(wKg) && wKg > 0) {
        var fatKg = wKg * bf / 100, leanKg = wKg - fatKg, u = unit === 'in' ? 'lb' : 'kg';
        var fatD = unit === 'in' ? fatKg * 2.2046226 : fatKg;
        var leanD = unit === 'in' ? leanKg * 2.2046226 : leanKg;
        parts.push('<div class="bf-cmp"><span class="k">Fat mass</span><span class="v">' + one(fatD) + ' ' + u + '</span></div>');
        parts.push('<div class="bf-cmp"><span class="k">Lean mass</span><span class="v">' + one(leanD) + ' ' + u + '</span></div>');
      }

      if (parts.length) {
        advOut.innerHTML = parts.join('') +
          '<p class="res-tip">The Navy tape method and the BMI method use different inputs, so they rarely match exactly \\u2014 Navy reads where you carry fat, BMI uses only weight and height. Both are estimates.</p>';
      } else {
        advOut.innerHTML = '<p class="res-tip">Add your age and weight above for a BMI-method cross-check and your fat / lean mass.</p>';
      }
      advOut.style.display = '';
    } else if (advOut) {
      advOut.style.display = 'none';
    }
  }

  var sexSeg = $('sexSeg');
  if (sexSeg) {
    sexSeg.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
      sex = b.getAttribute('data-sex');
      [].forEach.call(sexSeg.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
      var hf = $('hipFld'); if (hf) hf.style.display = sex === 'female' ? '' : 'none';
      solve();
    });
  }

  var PH = {
    cm: { height:'178', neck:'38', waist:'92', hip:'100', weight:'80' },
    in: { height:'70',  neck:'15', waist:'36', hip:'40',  weight:'176' }
  };
  function applyUnit() {
    var mu = unit === 'in' ? 'in' : 'cm', wu = unit === 'in' ? 'lb' : 'kg', p = PH[unit];
    ['uHeight', 'uNeck', 'uWaist', 'uHip'].forEach(function (id) { if ($(id)) $(id).textContent = mu; });
    if ($('uWeight')) $('uWeight').textContent = wu;
    if (heightIn) heightIn.placeholder = p.height;
    if (neckIn) neckIn.placeholder = p.neck;
    if (waistIn) waistIn.placeholder = p.waist;
    if (hipIn) hipIn.placeholder = p.hip;
    if (weightIn) weightIn.placeholder = p.weight;
    if (unitSeg) [].forEach.call(unitSeg.querySelectorAll('button'), function (x) {
      x.classList.toggle('on', x.getAttribute('data-unit') === unit);
    });
  }

  var unitSeg = $('unitSeg');
  if (unitSeg) {
    unitSeg.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
      unit = b.getAttribute('data-unit');
      applyUnit();
      solve();
    });
  }

  var advBtn = $('advBtn');
  if (advBtn) {
    advBtn.addEventListener('click', function () {
      advanced = !advanced;
      advBtn.classList.toggle('open', advanced);
      $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
      $('advIn').style.display = advanced ? '' : 'none';
      solve();
      if (advanced) { var a = $('advIn'); if (a && a.scrollIntoView) a.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
  }

  [heightIn, neckIn, waistIn, hipIn, ageIn, weightIn].forEach(function (inp) {
    if (!inp) return; inp.addEventListener('input', solve);
  });

  var hf0 = $('hipFld'); if (hf0) hf0.style.display = 'none';

  // Default to inches for US users (imperial audience); metric elsewhere.
  function prefersImperial() {
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
  }
  if (cfg.unit === 'in' || cfg.unit === 'cm') unit = cfg.unit;
  else if (prefersImperial()) unit = 'in';
  applyUnit();

  solve();
};
`;

fs.writeFileSync(FILE, src.replace(/\s*$/, '\n') + ENGINE);
console.log('[bodyfat/app] appended initBodyFatCalc to ' + FILE + '.');
