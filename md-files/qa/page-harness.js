/* In-page QA harness (injected by md-files/qa/run.js). Generic: works on any CalcThis calculator page from a small fixture.
   Everything it checks is something a past bug got through. Do NOT weaken a check to make a page pass - fix the page. */
(function () {
  var Q = window.__qa = { fails: [], notes: [], cfg: null, mobile: false, steps: 0 };
  var $ = function (id) { return document.getElementById(id); };
  var BAD = /NaN|undefined|Infinity|\bnull\b/;
  function fail(tag, msg) { if (Q.fails.length < 60) Q.fails.push(tag + ': ' + msg); }
  function vis(e) { return !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'; }
  function fire(el, type) { el.dispatchEvent(new Event(type, { bubbles: true })); }
  Q.init = function (cfg, mobile) { Q.cfg = cfg; Q.mobile = !!mobile; Q.fails = []; Q.notes = []; Q.steps = 0; };
  Q.set = function (id, v) {
    var e = $(id); if (!e) throw new Error('no #' + id);
    e.value = v; fire(e, e.classList.contains('csel') ? 'change' : 'input');
  };
  Q.seg = function (id, v) {
    var c = $(id); if (!c) throw new Error('no #' + id);
    var b = [].filter.call(c.children, function (x) { return x.getAttribute('data-v') === String(v); })[0];
    if (!b) throw new Error('no option ' + v + ' in #' + id); b.click();
  };
  Q.click = function (id) { $(id).click(); };
  Q.text = function (id) { return ($(id) ? $(id).textContent : '').replace(/\s+/g, ' ').trim(); };
  Q.val = function (id) { return $(id).value; };
  /* what the user can operate right now */
  Q.discover = function () {
    var texts = [].filter.call(document.querySelectorAll('.card input[id]'), function (e) { return /^(text|number|)$/.test(e.getAttribute('type') || '') && vis(e); }).map(function (e) { return e.id; });
    var segs = {};
    [].forEach.call(document.querySelectorAll('.seg[id], .modeseg[id]'), function (c) { if (vis(c)) segs[c.id] = [].map.call(c.children, function (b) { return b.getAttribute('data-v'); }).filter(Boolean); });
    var csels = {};
    [].forEach.call(document.querySelectorAll('.csel[id]'), function (c) { if (vis(c)) csels[c.id] = [].map.call(c.querySelectorAll('.csel-opt'), function (o) { return o.getAttribute('data-value'); }); });
    var chips = [].filter.call(document.querySelectorAll('.chips[id]'), vis).map(function (c) { return c.id; });
    var adv = [].filter.call(document.querySelectorAll('.advbtn[id]'), vis).map(function (c) { return c.id; });
    return { texts: texts, segs: segs, csels: csels, chips: chips, adv: adv };
  };
  Q.state = function () {
    var r = Q.cfg.result;
    return { big: Q.text(r.big), body: vis($(r.body)), hint: vis($(r.hint)), hintText: Q.text(r.hint) };
  };
  /* invariants that must hold after EVERY interaction */
  Q.invariants = function (tag) {
    Q.steps++;
    var r = Q.cfg.result, st = Q.state();
    var scope = ($(r.body) ? $(r.body).textContent : '') + ' ' + Q.text(r.big) + ' ' + Q.text(r.hint);
    if (BAD.test(scope)) fail(tag, 'NaN/undefined/Infinity/null in the result: ' + scope.replace(/\s+/g, ' ').slice(0, 120));
    if (st.body && st.big === '—') fail(tag, 'result body visible but headline is a dash');
    if (!st.body && st.big !== '—') fail(tag, 'result body hidden but headline shows ' + st.big);
    if (st.body && st.hint && !/(ignored|for now|left out|without|default)/i.test(st.hintText)) fail(tag, 'a hard error is shown next to a visible result: ' + st.hintText.slice(0, 80));
    var de = document.documentElement;
    if (de.scrollWidth > de.clientWidth + 1) fail(tag, 'page wider than the screen: scrollWidth ' + de.scrollWidth + ' > clientWidth ' + de.clientWidth + ' (offenders: ' + Q.wide().join(', ') + ')');
    if (Q.mobile && $('mbar') && Math.abs($('mbar').getBoundingClientRect().bottom - innerHeight) > 1) fail(tag, 'floating bar not at the bottom edge: ' + $('mbar').getBoundingClientRect().bottom + ' vs ' + innerHeight);
    if (st.hint) {
      var h = $(r.hint), p = h.previousElementSibling;
      if (!p || !(p.querySelector('input') || p.matches('.chips,.cb-two,.fld'))) fail(tag, 'hint is not directly under a field (previous sibling: ' + (p ? p.className || p.tagName : 'none') + ')');
    }
  };
  Q.wide = function () {
    var w = document.documentElement.clientWidth;
    return [].filter.call(document.querySelectorAll('body *'), function (e) { return e.getBoundingClientRect().right > w + 1 && !/^(SCRIPT|STYLE)$/.test(e.tagName); }).slice(0, 4).map(function (e) { return (e.id ? '#' + e.id : (e.className || e.tagName)) + ':' + Math.round(e.getBoundingClientRect().right); });
  };
  Q.apply = function (steps) {
    steps.forEach(function (s) { if (s[0] === 'seg') Q.seg(s[1], s[2]); else if (s[0] === 'set') Q.set(s[1], s[2]); else if (s[0] === 'click') Q.click(s[1]); });
  };
  /* 1. start state */
  Q.start = function () {
    var ids = {}, dup = [];
    [].forEach.call(document.querySelectorAll('[id]'), function (e) { if (ids[e.id]) dup.push(e.id); ids[e.id] = 1; });
    if (dup.length) fail('start', 'duplicate ids: ' + dup.join(','));
    var d = Q.discover();
    d.texts.forEach(function (id) { if ($(id).value) fail('start', '#' + id + ' is pre-filled with "' + $(id).value + '" (pages must start empty)'); });
    var st = Q.state();
    if (st.big !== '—' || st.body) fail('start', 'a result shows before any input: ' + st.big);
    if (st.hint) fail('start', 'a hint shows before any input');
    if (!d.adv.length) fail('start', 'no Go advanced button found');
    if (Q.mobile && !$('mbar')) fail('start', 'no #mbar sticky bar on a page that must have one');
    Q.invariants('start');
    return d;
  };
  /* 2. fill to a valid result */
  Q.fill = function () {
    Q.apply(Q.cfg.fill); Q.invariants('fill');
    var st = Q.state(); if (!st.body || st.big === '—') fail('fill', 'the fixture inputs do not produce a result (hint: "' + st.hintText + '")');
  };
  /* 3. half-typed values: every optional field is typed key by key; the result must stay and the hint must be under the field */
  Q.progressive = function () {
    var req = Q.cfg.required || [], samples = Q.cfg.optionalSamples || {}, generic = ['1', '12', '123', '0.5', '0.', '99999', '5\'10'];
    function pass(label) {
      var d = Q.discover();
      d.texts.forEach(function (id) {
        if (req.indexOf(id) >= 0) return;
        var list = (samples[id] || []).concat(generic), before = $(id).value;
        list.forEach(function (v) {
          for (var k = 1; k <= v.length; k++) {
            Q.set(id, v.slice(0, k)); var st = Q.state();
            if (!st.body || st.big === '—') fail('typing', label + 'typing "' + v.slice(0, k) + '" into optional #' + id + ' hid the result (hint: "' + st.hintText.slice(0, 70) + '")');
            Q.invariants('typing #' + id + '=' + v.slice(0, k));
          }
        });
        Q.set(id, before);
      });
    }
    function openAdv() { Q.discover().adv.forEach(function (a) { if (!/Go simple/.test(Q.text(a))) Q.click(a); }); }
    openAdv(); pass('');
    (Q.cfg.variants || []).forEach(function (v, i) { Q.fillReset(); openAdv(); Q.apply(v); pass('[variant ' + i + '] '); });
    Q.fillReset();
  };
  Q.fillReset = function () { Q.apply(Q.cfg.fill); };
  /* 4. required fields: any junk may hide the result, but then a visible hint under the field must say why; and it must recover */
  Q.required = function () {
    var junk = ['', 'abc', '-5', '0', '1e3', '.', '99999999', '０'];
    (Q.cfg.required || []).forEach(function (id) {
      var keep = $(id).value;
      junk.forEach(function (j) {
        Q.set(id, j); Q.invariants('required #' + id + '=' + j);
        var st = Q.state();
        if (!st.body && j !== '' && !st.hint) fail('required', 'junk "' + j + '" in #' + id + ' hid the result without any hint');
      });
      Q.set(id, keep);
      var st2 = Q.state(); if (!st2.body) fail('required', '#' + id + ' did not recover after the valid value was typed back');
    });
  };
  /* 5. every control in every position */
  Q.controls = function () {
    var d = Q.discover();
    Object.keys(d.segs).forEach(function (id) { d.segs[id].forEach(function (v) { Q.seg(id, v); Q.invariants('seg #' + id + '=' + v); }); });
    Object.keys(d.csels).forEach(function (id) { d.csels[id].forEach(function (v) { Q.set(id, v); Q.invariants('csel #' + id + '=' + v); }); });
    Q.fillReset();
  };
  /* 6. random chaos in chunks */
  Q.chaos = function (n, seed) {
    var s = seed || 1; var rnd = function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    var pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
    var base = ['', 'x', '-1', '0', '0.', '1', '12', '1e2', '5\'10', '99999', '0.5', '25', '180', '75', '165', '1,5', '.5', '--', ' '];
    var pool = Q.cfg.pools || {};
    for (var i = 0; i < n; i++) {
      var d = Q.discover(), kinds = ['text', 'text', 'text', 'seg', 'csel', 'adv', 'chip'], k = pick(kinds), tag = 'chaos#' + i + ' ' + k;
      try {
        if (k === 'text' && d.texts.length) { var id = pick(d.texts); Q.set(id, pick((pool[id] || []).concat(base))); tag += ' ' + id; }
        else if (k === 'seg') { var sids = Object.keys(d.segs); if (sids.length) { var sid = pick(sids); Q.seg(sid, pick(d.segs[sid])); tag += ' ' + sid; } }
        else if (k === 'csel') { var cids = Object.keys(d.csels); if (cids.length) { var cid = pick(cids); Q.set(cid, pick(d.csels[cid])); tag += ' ' + cid; } }
        else if (k === 'adv' && d.adv.length && rnd() < 0.15) Q.click(d.adv[0]);
        else if (k === 'chip' && d.chips.length) { var ch = $(pick(d.chips)).children; if (ch.length) pick([].slice.call(ch)).click(); }
      } catch (e) { fail(tag, 'threw ' + e.message); }
      Q.invariants(tag);
    }
  };
  /* 7. the floating bar must not move while scrolling */
  Q.scroll = function () {
    if (!Q.mobile || !$('mbar')) return;
    var H = document.documentElement.scrollHeight, bottoms = {}, x;
    for (var y = 0; y < H; y += Math.max(40, Math.round(H / 40))) { window.scrollTo(0, y); x = Math.round($('mbar').getBoundingClientRect().bottom); bottoms[x] = 1; if (getComputedStyle($('mbar')).display === 'none') fail('scroll', 'floating bar hidden at scroll ' + y); }
    window.scrollTo(0, 0);
    if (Object.keys(bottoms).length !== 1) fail('scroll', 'floating bar moved while scrolling: bottoms ' + Object.keys(bottoms).join(','));
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) fail('scroll', 'page wider than the screen after scrolling');
  };
  Q.report = function () { return { fails: Q.fails, steps: Q.steps }; };
})();
