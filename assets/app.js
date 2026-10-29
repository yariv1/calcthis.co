/* CalcThis shared runtime — loaded on every page.
   Page-specific calculator logic stays inline on each page.
   Pages that need a different fmt/parseNum (e.g. board-foot fractions,
   higher-precision rounding) redefine them inside their own script scope. */
(function () {
  // ---- site menu (hamburger) ----
  var btn = document.getElementById('menuBtn'), menu = document.getElementById('siteMenu');
  if (btn && menu) {
    function open(){menu.hidden=false;btn.classList.add('open');btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-label','Close menu');}
    function close(){menu.hidden=true;btn.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Open menu');}
    btn.addEventListener('click',function(e){e.stopPropagation();menu.hidden?open():close();});
    document.addEventListener('click',function(e){if(!menu.hidden&&!menu.contains(e.target)&&!btn.contains(e.target))close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden)close();});
    // ---- typeahead over every menu link ----
    var inp = document.getElementById('menuSearch'), res = document.getElementById('menuResults'), cols = menu.querySelector('.menu-cols'), idx = null;
    function build() {
      idx = []; var head = '';
      [].forEach.call(menu.querySelectorAll('.menu-col > *'), function (n) {
        if (n.classList.contains('menu-col-head')) { head = n.textContent.trim(); return; }
        if (n.tagName === 'A') idx.push({ t: n.textContent.trim(), h: n.getAttribute('href'), g: head, k: (n.textContent + ' calculator').toLowerCase() });
      });
      menu.querySelectorAll('.menu-col').forEach(function () {});
    }
    function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function search() {
      var q = inp.value.trim().toLowerCase();
      if (!q) { res.hidden = true; res.innerHTML = ''; if (cols) cols.hidden = false; return; }
      if (!idx) build();
      var toks = q.split(/\s+/), out = [];
      idx.forEach(function (it) {
        var ok = toks.every(function (t) { return it.k.indexOf(t) >= 0; }); if (!ok) return;
        var score = it.k.indexOf(toks[0]) === 0 ? 0 : (it.k.indexOf(' ' + toks[0]) >= 0 ? 1 : 2);
        out.push({ it: it, s: score });
      });
      out.sort(function (a, b) { return a.s - b.s; });
      if (cols) cols.hidden = true; res.hidden = false;
      res.innerHTML = out.length ? out.slice(0, 12).map(function (o) { return '<a href="' + o.it.h + '"><span>' + esc(o.it.t) + '</span><small>' + esc(o.it.g) + '</small></a>'; }).join('') : '<p class="menu-none">No calculator found for “' + esc(inp.value.trim()) + '”.</p>';
    }
    if (inp && res) {
      inp.addEventListener('input', search);
      inp.addEventListener('keydown', function (e) {
        var links = [].slice.call(res.querySelectorAll('a'));
        if (e.key === 'Enter' && links[0]) { e.preventDefault(); location.href = links[0].getAttribute('href'); }
        else if (e.key === 'ArrowDown' && links[0]) { e.preventDefault(); links[0].focus(); }
        else if (e.key === 'Escape' && inp.value) { e.stopPropagation(); inp.value = ''; search(); }
      });
      res.addEventListener('keydown', function (e) {
        var links = [].slice.call(res.querySelectorAll('a')), i = links.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' && links[i + 1]) { e.preventDefault(); links[i + 1].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? links[i - 1] : inp).focus(); }
      });
      btn.addEventListener('click', function () { if (!menu.hidden && window.matchMedia('(hover:hover) and (pointer:fine)').matches) setTimeout(function () { inp.focus(); }, 30); else if (menu.hidden) { inp.value = ''; search(); } });
    }
  }
  // ---- auto year (footer copyright) ----
  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
})();

/* ---- custom select (.csel) — see the CSS block in style.css for why this
   exists: a native <select>'s open panel can't be styled, so .csel replaces
   it with an on-brand button + floating panel while exposing the same
   `.value` + `change` event surface a native select has, so calculator code
   written as `select.addEventListener('change', function(){ x = this.value })`
   works completely unchanged. Auto-initializes every `.csel` on the page. ---- */
window.CalcThis = window.CalcThis || {};
(function () {
  function initCsel(root) {
    var btn = root.querySelector('.csel-btn');
    var lab = root.querySelector('.csel-val');
    var panel = root.querySelector('.csel-panel');
    var opts = [].slice.call(root.querySelectorAll('.csel-opt'));
    if (!btn || !panel || !opts.length) return;
    var current = root.getAttribute('data-value') || opts[0].getAttribute('data-value');

    function optFor(v) { for (var i = 0; i < opts.length; i++) if (opts[i].getAttribute('data-value') === v) return opts[i]; return null; }
    function select(v, fire) {
      var o = optFor(v); if (!o) return;
      current = v; root.setAttribute('data-value', v);
      if (lab) lab.textContent = o.textContent;
      opts.forEach(function (op) {
        var on = op === o;
        op.classList.toggle('on', on);
        op.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (fire) root.dispatchEvent(new Event('change', { bubbles: true }));
    }
    function isOpen() { return panel.style.display === 'block'; }
    function openPanel() { panel.style.display = 'block'; btn.setAttribute('aria-expanded', 'true'); root.classList.add('open'); }
    function closePanel() { panel.style.display = 'none'; btn.setAttribute('aria-expanded', 'false'); root.classList.remove('open'); }

    // The `.value` property is defined on `root` exactly once, ever, and forwards to
    // `root._cselApi` — a plain object whose get/set this call (and any later re-init
    // call, for a dynamically-rebuilt dropdown like a per-row select) simply overwrites.
    // Redefining the property itself a second time throws ("Cannot redefine property"),
    // which is exactly what broke re-initializing a dropdown after rebuilding its options
    // (found 2026-09-22 on the Weighted Average Calculator's dynamically-populated
    // "Solve for" row picker — silently aborted the page's whole init script).
    if (!root._cselApi) {
      root._cselApi = {};
      Object.defineProperty(root, 'value', {
        get: function () { return root._cselApi.get(); },
        set: function (v) { root._cselApi.set(v); }
      });
    }
    root._cselApi.get = function () { return current; };
    root._cselApi.set = function (v) { select(v, false); };

    // Option-click listeners are safe to rebind every call: a dynamic-dropdown rebuild
    // replaces `.csel-panel`'s innerHTML, so these are always freshly-created nodes —
    // old ones (with their old listeners) are garbage collected, not leaked.
    opts.forEach(function (o) {
      o.addEventListener('click', function () { select(this.getAttribute('data-value'), true); closePanel(); btn.focus(); });
    });

    // btn/document listeners bind ONCE ever per root — rebinding them on every re-init
    // would stack duplicate document-level Escape/outside-click handlers forever.
    if (!root._cselInit) {
      root._cselInit = true;
      btn.addEventListener('click', function (e) { e.stopPropagation(); isOpen() ? closePanel() : openPanel(); });
      document.addEventListener('click', function (e) { if (isOpen() && !root.contains(e.target)) closePanel(); });
      document.addEventListener('keydown', function (e) {
        if (!isOpen()) return;
        if (e.key === 'Escape') { closePanel(); btn.focus(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          var idx = 0; for (var i = 0; i < opts.length; i++) if (opts[i].getAttribute('data-value') === current) { idx = i; break; }
          idx = e.key === 'ArrowDown' ? Math.min(opts.length - 1, idx + 1) : Math.max(0, idx - 1);
          select(opts[idx].getAttribute('data-value'), true);
        }
      });
    }
    closePanel();
    select(current, false);
  }
  CalcThis.initCsel = initCsel;
  CalcThis.initAllCsel = function (root) { [].forEach.call((root || document).querySelectorAll('.csel'), initCsel); };
  CalcThis.initAllCsel();
})();

/* ---- shared: clear (X) button inside any text field that has a value, shown while the field is focused (design system, 2026-10-29) ----
   Skips read-only/disabled fields, search fields (native X), datepicker fields, masked time fields and outputs. */
(function () {
  var xb = null, cur = null;
  function eligible(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    var t = (el.getAttribute('type') || 'text').toLowerCase();
    if (t !== 'text' && t !== 'tel' && t !== 'number' && t !== 'email' && t !== 'url') return false;
    if (el.readOnly || el.disabled || el.datepicker || el.hasAttribute('data-no-clear')) return false;
    var w = el.parentNode; if (!w || !w.classList || !w.classList.contains('inp')) return false;
    if (el.closest('.time-box, .time-field, .isout, .csel')) return false;
    return true;
  }
  function build() {
    if (xb) return xb;
    xb = document.createElement('button'); xb.type = 'button'; xb.className = 'inp-x'; xb.tabIndex = -1; xb.setAttribute('aria-label', 'Clear'); xb.title = 'Clear';
    xb.innerHTML = '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8"/></svg>';
    xb.addEventListener('mousedown', function (e) { e.preventDefault(); });
    xb.addEventListener('click', function () {
      if (!cur) return; var el = cur; el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.focus(); sync();
    });
    return xb;
  }
  function hide() { if (xb && xb.parentNode) xb.parentNode.removeChild(xb); if (cur && cur._xpad != null) { cur.style.paddingRight = cur._xpad; cur._xpad = null; } cur = null; }
  function sync() {
    if (!cur) return;
    if (!cur.value) { if (xb && xb.parentNode) xb.parentNode.removeChild(xb); return; }
    var w = cur.parentNode, b = build(), right = 10, ad = w.querySelector('.suf, .len-toggle');
    if (ad) right = ad.offsetWidth + 18;
    if (b.parentNode !== w) w.appendChild(b);
    b.style.right = right + 'px';
    if (cur._xpad == null) { cur._xpad = cur.style.paddingRight; }
    var need = right + 30, have = parseFloat(getComputedStyle(cur).paddingRight) || 0;
    cur.style.paddingRight = Math.max(need, have) + 'px';
  }
  document.addEventListener('focusin', function (e) { var el = e.target; if (!eligible(el)) return; if (cur && cur !== el) hide(); cur = el; sync(); });
  document.addEventListener('focusout', function (e) { if (e.target === cur) hide(); });
  document.addEventListener('input', function (e) { if (e.target === cur) sync(); });
})();

/* ---- shared: homepage category tabs get scroll arrows on desktop (YouTube-style chips row) ---- */
(function () {
  var tabs = document.getElementById('catTabs'); if (!tabs || tabs.parentNode.classList.contains('cat-tabs-wrap')) return;
  var wrap = document.createElement('div'); wrap.className = 'cat-tabs-wrap';
  tabs.parentNode.insertBefore(wrap, tabs); wrap.appendChild(tabs);
  function mk(dir) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'cat-arrow cat-arrow-' + dir; b.setAttribute('aria-label', dir === 'l' ? 'Scroll categories left' : 'Scroll categories right');
    b.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (dir === 'l' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6') + '"/></svg></span>';
    b.addEventListener('click', function () { tabs.scrollBy({ left: (dir === 'l' ? -1 : 1) * Math.max(160, tabs.clientWidth * 0.7), behavior: 'smooth' }); });
    wrap.appendChild(b); return b;
  }
  var L = mk('l'), R = mk('r');
  function upd() { var max = tabs.scrollWidth - tabs.clientWidth; L.classList.toggle('show', tabs.scrollLeft > 2); R.classList.toggle('show', max > 2 && tabs.scrollLeft < max - 2); }
  tabs.addEventListener('scroll', upd); window.addEventListener('resize', upd); window.addEventListener('load', upd); upd();
  /* keep the selected tab in view when it is chosen (also by the page's own hash/keyboard handling) */
  tabs.addEventListener('click', function (e) { var t = e.target.closest('.cat-tab'); if (t) { var r = t.getBoundingClientRect(), c = tabs.getBoundingClientRect(); if (r.left < c.left + 40 || r.right > c.right - 40) tabs.scrollBy({ left: (r.left + r.right) / 2 - (c.left + c.right) / 2, behavior: 'smooth' }); } });
})();

/* ---- shared calc helpers (global) ---- */
function parseNum(v){
  if(v==null) return NaN;
  v=(''+v).trim();
  if(!v) return NaN;
  var n=parseFloat(v);
  return isNaN(n)?NaN:n;
}
function money(n){return '$'+n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function bagWord(n){ return n===1?'bag':'bags'; }
function fmt(n){
  if(n==null||isNaN(n)) return '—';
  if(n>=100) return n.toFixed(1).replace(/\.0$/,'');
  var r=Math.round(n*100)/100;
  var s=''+r; if(s.indexOf('.')>=0) s=s.replace(/\.?0+$/,''); return s||'0';
}

/* ===== CalcThis shared volume engine (Fix B) =====
   ONE core, two entry points:
     initVolumeCalc(cfg)      labeled  — material selector + ton/yd³/bag (gravel, sand, topsoil)
     initVolumeCalcLite(cfg)  no-material — yd³/bag only, unlabeled rows (mulch, ...)
   Both call _initVolumeCore below; the only difference is cfg.hasMaterial and the
   material/ton layer it gates. Frozen-snapshot tally discipline lives here once:
   a locked row never changes when a live input changes. */
window.CalcThis = window.CalcThis || {};
function _initVolumeCore(cfg){

  var sys='us', shape='rect', mode=cfg.startMode, matKey=cfg.defaultMat;
  var $=function(id){return document.getElementById(id)};
  var len=$('len'), wid=$('wid'), dia=$('dia'), depth=$('depth'),
      price=$('price'), bagSize=$('bagSize'), customDens=$('customDens'), matSel=$('matSel');
  var tally=[];                     // each: {label, volYd3, volM3, tons, tonnes}
  var waste={active:false,pct:''};  // project-level buffer
  var customDensUS=null;            // stored internally as tons/yd³

  // constants
  var M3_PER_YD3=0.764554858;
  var DENS_US_TO_METRIC=1.186552;   // tons/yd³ -> tonnes/m³
  var MAT=cfg.mat||{};
  var MATLABEL=cfg.matLabel||{};

  function parseNum(v){
    if(v==null) return NaN;
    v=(''+v).trim();
    if(!v) return NaN;
    var n=parseFloat(v);
    return isNaN(n)?NaN:n;
  }
  function fmt(n){
    if(n==null||isNaN(n)) return '—';
    if(n>=100) return n.toFixed(1).replace(/\.0$/,'');
    var r=Math.round(n*100)/100;
    var s=''+r; if(s.indexOf('.')>=0) s=s.replace(/\.?0+$/,''); return s||'0';
  }
  function money(n){return '$'+n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}

  function densityUS(){
    if(!cfg.hasMaterial) return null;
    if(matKey==='custom') return customDensUS;   // may be null
    return MAT[matKey];
  }
  function bagVol(){ // in current system's volume unit for area volume (ft³ for US, m³ for metric)
    if(sys==='us'){ var b=parseNum(bagSize.value); return (isNaN(b)||b<=0)?(cfg.bagDefaultUS||0.5):b; }        // ft³
    var l=parseNum(bagSize.value); return ((isNaN(l)||l<=0)?(cfg.bagDefaultMetricL||25):l)/1000;                     // litres -> m³
  }

  // current area volume in current system's cubic unit (ft³ US, m³ metric)
  function areaVol(){
    var d;
    if(sys==='us'){ var din=parseNum(depth.value); if(isNaN(din)||din<=0) return NaN; d=din/12; }
    else { var dcm=parseNum(depth.value); if(isNaN(dcm)||dcm<=0) return NaN; d=dcm/100; }
    if(shape==='rect'){
      var L=parseNum(len.value), W=parseNum(wid.value);
      if(isNaN(L)||isNaN(W)||L<=0||W<=0) return NaN;
      return L*W*d;
    } else {
      var D=parseNum(dia.value); if(isNaN(D)||D<=0) return NaN;
      var r=D/2; return Math.PI*r*r*d;
    }
  }

  // canonical volumes/weights for the current area (null if dims incomplete)
  function currentArea(){
    var v=areaVol(); if(isNaN(v)) return null;
    var volYd3, volM3;
    if(sys==='us'){ volYd3=v/27; volM3=volYd3*M3_PER_YD3; }
    else { volM3=v; volYd3=v/M3_PER_YD3; }
    var d=densityUS();
    var tons  = (d==null)? null : volYd3*d;
    var tonnes= (d==null)? null : volM3*(d*DENS_US_TO_METRIC);
    return {volYd3:volYd3, volM3:volM3, tons:tons, tonnes:tonnes};
  }

  // completeness: dims+depth valid, and (mode!=='ton' OR density known)
  function areaComplete(){
    if(currentArea()==null) return false;
    if(mode==='ton' && densityUS()==null) return false;
    return true;
  }
  function listMissing(){
    var m=[];
    var din=parseNum(depth.value);
    if(shape==='rect'){
      if(isNaN(parseNum(len.value))||parseNum(len.value)<=0) m.push('length');
      if(isNaN(parseNum(wid.value))||parseNum(wid.value)<=0) m.push('width');
    } else {
      if(isNaN(parseNum(dia.value))||parseNum(dia.value)<=0) m.push('diameter');
    }
    if(isNaN(din)||din<=0) m.push('depth');
    if(mode==='ton' && densityUS()==null) m.push(cfg.densityWord||'material density');
    if(!m.length) return 'the details';
    if(m.length===1) return m[0];
    return m.slice(0,-1).join(', ')+' and '+m[m.length-1];
  }

  // unit label helpers
  function qtyUnit(){
    if(mode==='bag') return 'bags';
    if(mode==='ton') return sys==='us'?'tons':'tonnes';
    return sys==='us'?'cu yd':'m³';
  }
  function volUnit(){ return sys==='us'?'cu yd':'m³'; }
  function weightUnit(){ return sys==='us'?'tons':'tonnes'; }

  // given canonical volumes {volYd3,volM3,tons,tonnes} and waste %, return the "sold by" quantity + a sub figure
  // returns {qty, qtyNull, subTxt}  (qty already includes waste; bags are ceil'd)
  function soldQty(v, wp){
    var mlt = (wp&&wp>0)? (1+wp/100) : 1;
    if(mode==='bag'){
      var vol = (sys==='us'? v.volYd3*27 : v.volM3) * mlt;   // ft³ or m³
      var bags = Math.ceil(vol / bagVol());
      return {qty:bags, qtyNull:false, subTxt:'= '+fmt((sys==='us'?v.volYd3:v.volM3)*mlt)+' '+volUnit()};
    }
    if(mode==='ton'){
      var w=(sys==='us'?v.tons:v.tonnes);
      if(w==null) return {qty:null, qtyNull:true, subTxt:'= '+fmt((sys==='us'?v.volYd3:v.volM3)*mlt)+' '+volUnit()};
      return {qty:w*mlt, qtyNull:false, subTxt:'= '+fmt((sys==='us'?v.volYd3:v.volM3)*mlt)+' '+volUnit()};
    }
    // yd3 / m3
    var vol2=(sys==='us'?v.volYd3:v.volM3)*mlt;
    var w2=(sys==='us'?v.tons:v.tonnes);
    var sub = !cfg.hasMaterial ? (sys==='us' ? '= '+fmt(v.volYd3*27*mlt)+' cu ft' : '') : ((w2==null)? '' : '= '+fmt(w2*mlt)+' '+weightUnit());
    return {qty:vol2, qtyNull:false, subTxt:sub};
  }

  function priceVal(){ var p=parseNum(price.value); return (!isNaN(p)&&p>0)?p:null; }

  // one bag's volume expressed in cubic yards (for converting bag price <-> $/yd³)
  function bagVolYd3(){ return sys==='us'? bagVol()/27 : bagVol()/M3_PER_YD3; }
  // tons per yd³ for the CURRENT material/system (null if density unknown). US canonical unit is tons/yd³.
  function tonsPerYd3(){ var d=densityUS(); return d==null?null:d; }   // densityUS is already tons/yd³

  // convert the LIVE price (current mode + system) into a canonical $ per yd³, stored on lock.
  // returns null if no price, or if ton-priced with unknown density.
  function liveRateYd3(){
    var p=priceVal(); if(p==null) return null;
    if(mode==='bag') return p / bagVolYd3();                 // $/bag -> $/yd³
    if(mode==='ton'){
      var d=densityUS(); if(d==null) return null;            // $/ton -> $/yd³ via tons per yd³
      return sys==='us' ? p*d : p*(d*DENS_US_TO_METRIC)*M3_PER_YD3;   // $/tonne -> $/yd³
    }
    return sys==='us' ? p : p*M3_PER_YD3;                    // $/yd³, or ($/m³ -> $/yd³)
  }

  // cost for a sold-quantity (qty already in mode unit incl waste). For bag, qty is bags.
  function costFor(sq){
    var p=priceVal(); if(p==null||sq.qty==null) return null;
    return sq.qty*p;
  }

  // per-item quantity in THAT ROW's own sold-by unit (frozen at add time)
  function itemQty(r){
    if(r.mode==='bag'){ return Math.ceil(r.volYd3 / r.bagVolYd3); }
    if(r.mode==='ton'){ return sys==='us'? r.tons : r.tonnes; }
    return sys==='us'? r.volYd3 : r.volM3;
  }
  // per-item cost uses the row's LOCKED canonical rate ($/yd³) and its own frozen unit
  function itemCost(r){
    if(r.rate==null) return null;                    // canonical $/yd³
    if(r.mode==='bag'){ return itemQty(r) * (r.rate * r.bagVolYd3); }
    return r.volYd3 * r.rate;                         // ton & yd³/m³: physical, system-independent
  }

  function areaLabel(){
    var du=sys==='us'?'ft':'m';
    var pu=sys==='us'?'in':'cm';
    var dp=depth.value.trim()||'?';
    if(shape==='rect'){
      var L=len.value.trim()||'?', W=wid.value.trim()||'?';
      return L+'×'+W+du+' · '+dp+pu;
    }
    var D=dia.value.trim()||'?';
    return 'Ø'+D+du+' · '+dp+pu;
  }

  // ---------- live area (single) ----------
  function renderArea(){
    var v=currentArea();
    var b=$('addBtn'), complete=areaComplete();
    b.disabled=!complete;
    b.style.opacity=complete?'1':'.5';
    b.style.cursor=complete?'pointer':'not-allowed';
    $('hint').style.display=complete?'none':'block';
    $('addNote').style.display=complete?'block':'none';
    if(!complete) $('hint').textContent='Enter '+listMissing();

    $('resUnit').textContent=qtyUnit();
    $('resCostWrap').classList.remove('hide');   // always reserve the row — no layout jump
    $('resTip').classList.remove('hide');
    if(v==null || (mode==='ton'&&densityUS()==null)){
      $('resQty').textContent='—';
      $('resSub').textContent = (v!=null ? (soldQty(v,0).subTxt||'Enter dimensions to see the amount.') : 'Enter dimensions to see the amount.');
      $('resCost').textContent='—';
      return;
    }
    var sq=soldQty(v,0);
    $('resQty').textContent = sq.qtyNull?'—':fmt(sq.qty);
    $('resSub').textContent = sq.subTxt || '';
    var c=costFor(sq);
    $('resCost').textContent = (c!=null)? money(c) : '—';
  }

  // ---------- project tally (each row keeps the unit it was added in) ----------
  function bagWord(n){ return n===1?'bag':'bags'; }
  function volUnitNow(){ return sys==='us'?'cu yd':'m³'; }
  function tonWord(){ return sys==='us'?'tons':'tonnes'; }

  function rowQtyText(r){
    var q=itemQty(r);
    if(q==null) return {txt:'—',na:true};
    if(r.mode==='bag') return {txt:fmt(q)+' '+bagWord(q), na:false};
    if(r.mode==='ton') return {txt:fmt(q)+' '+tonWord(), na:false};
    return {txt:fmt(q)+' '+volUnitNow(), na:false};
  }
  function rowCost(r){
    var c=itemCost(r);
    return (c==null)?{txt:'—',na:true}:{txt:money(c),na:false};
  }

  // sum quantities into per-unit groups: bags, cu yd/m³, tons/tonnes
  function groupTotals(){
    var g={bagQ:0,bagHas:false,volQ:0,volHas:false,tonQ:0,tonHas:false,tonNull:false,cost:0,hasCost:false,order:[]};
    tally.forEach(function(r){
      var k=r.mode==='bag'?'bag':(r.mode==='ton'?'ton':'vol');
      if(g.order.indexOf(k)<0) g.order.push(k);   // total lists units in the order they were first added
      if(r.mode==='bag'){ g.bagQ+=itemQty(r); g.bagHas=true; }
      else if(r.mode==='ton'){ var t=itemQty(r); if(t==null){g.tonNull=true;} else {g.tonQ+=t;} g.tonHas=true; }
      else { g.volQ+=itemQty(r); g.volHas=true; }
      var c=itemCost(r); if(c!=null){ g.cost+=c; g.hasCost=true; }
    });
    return g;
  }
  function amountParts(bagQ,volQ,tonQ,g){
    var val={ton:tonQ, vol:volQ, bag:bagQ};
    var lab={ton:tonWord(), vol:volUnitNow(), bag:bagWord(bagQ)};
    var has={ton:g.tonHas, vol:g.volHas, bag:g.bagHas};
    return g.order.filter(function(k){return has[k];}).map(function(k){return {num:val[k], unit:lab[k]};});
  }
  function partsStr(parts,plus){
    return parts.map(function(p){return (plus?'+':'')+fmt(p.num)+' '+p.unit;}).join(plus?'  ':' + ');
  }

  function renderTally(){
    var body=$('tallyBody'), tot=$('projTotal');
    var g=groupTotals();
    var wp = waste.active ? parseNum(waste.pct) : NaN;
    var hasWp = waste.active && !isNaN(wp) && wp>0;
    var mlt = hasWp ? wp/100 : 0;

    var wBag = g.bagHas ? Math.ceil(g.bagQ*mlt) : 0;
    var wVol = g.volHas ? g.volQ*mlt : 0;
    var wTon = g.tonHas ? g.tonQ*mlt : 0;
    var wCost = g.hasCost ? g.cost*mlt : 0;
    var tBag=g.bagQ+wBag, tVol=g.volQ+wVol, tTon=g.tonQ+wTon, tCost=g.cost+wCost;

    updateMbar(g, tBag, tVol, tTon, tCost);

    if(!tally.length){
      body.innerHTML='<div class="tally-empty">'+cfg.emptyText+'</div>';
      tot.style.display='none'; $('clearBtn').style.display='none';
      waste.active=false; waste.pct=''; $('wastePct').value='';
      $('wasteRow').style.display='none'; $('addWasteBtn').style.display='none';
      return;
    }
    $('clearBtn').style.display='inline';

    var html='';
    tally.forEach(function(r,i){
      var q=rowQtyText(r), c=rowCost(r);
      html+='<div class="trow"><span class="desc">'+(r.matLabel?'<span class="m">'+r.matLabel+'</span>':'')+'<span class="d">'+r.label+'</span></span>'
          +'<span class="qt'+(q.na?' na':'')+'">'+q.txt+'</span>'
          +'<span class="rc'+(c.na?' na':'')+'">'+c.txt+'</span>'
          +'<button class="x" data-i="'+i+'" aria-label="Remove">×</button></div>';
    });
    body.innerHTML=html;

    if(waste.active){
      $('wasteRow').style.display='grid';
      $('addWasteBtn').style.display='none';
      var wq=$('wasteQty'), wr=$('wasteRc');
      if(hasWp){
        var wval={ton:wTon, vol:wVol, bag:wBag};
        var wlab={ton:tonWord(), vol:volUnitNow(), bag:bagWord(wBag)};
        var whas={ton:g.tonHas&&wTon>0, vol:g.volHas&&wVol>0, bag:g.bagHas&&wBag>0};
        var wparts=g.order.filter(function(k){return whas[k];}).map(function(k){return {num:wval[k], unit:wlab[k]};});
        wq.className='qt'; wq.textContent = wparts.length? partsStr(wparts,true) : '—';
        if(g.hasCost){ wr.className='rc'; wr.textContent='+'+money(wCost); }
        else { wr.className='rc na'; wr.textContent='—'; }
      } else {
        wq.className='qt na'; wq.textContent='—';
        wr.className='rc na'; wr.textContent='—';
      }
    } else {
      $('wasteRow').style.display='none';
      $('addWasteBtn').style.display='block';
    }

    tot.style.display='grid';
    $('projCount').textContent='';
    $('totalUnit').textContent='';
    $('totalQty').textContent = partsStr(amountParts(tBag,tVol,tTon,g),false);
    if(g.hasCost){
      $('totalCostRow').style.display='block';
      $('totalCost').style.display='block';
      $('totalCost').textContent=money(tCost);
    } else {
      $('totalCostRow').style.display='none';
      $('totalCost').style.display='none';
    }
  }

  function segHTML(parts){
    return parts.map(function(p){return '<b>'+fmt(p.num)+'</b> '+p.unit;}).join(' + ');
  }
  function updateMbar(g, tBag, tVol, tTon, tCost){
    if(tally.length){
      $('mLab').textContent='Project total';
      $('mSeg').innerHTML = segHTML(amountParts(tBag,tVol,tTon,g));
      if(g.hasCost){ $('mCostWrap').classList.remove('hide'); $('mCost').textContent=money(tCost); }
      else { $('mCostWrap').classList.add('hide'); }
      return;
    }
    // no areas → mirror the live single area in the currently-selected unit
    $('mLab').textContent=cfg.thisLabel||'This area';
    var v=currentArea();
    if(v==null || (mode==='ton'&&densityUS()==null)){
      $('mSeg').innerHTML='<b>—</b> '+qtyUnit(); $('mCostWrap').classList.add('hide'); return;
    }
    var sq=soldQty(v,0);
    $('mSeg').innerHTML='<b>'+(sq.qtyNull?'—':fmt(sq.qty))+'</b> '+qtyUnit();
    var c=costFor(sq);
    if(c!=null){ $('mCostWrap').classList.remove('hide'); $('mCost').textContent=money(c); }
    else { $('mCostWrap').classList.add('hide'); }
  }

  function renderAll(){ renderArea(); renderTally(); }

  // ---------- events ----------
  [len,wid,dia,depth,price,bagSize].forEach(function(el){el.addEventListener('input',renderAll)});

  // depth chip may be cleared on manual depth typing
  depth.addEventListener('input',function(){
    [].forEach.call($('depthChips').children,function(c){c.classList.remove('on')});
  });
  $('depthChips').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b)return;
    depth.value=b.dataset.d;
    [].forEach.call(this.children,function(c){c.classList.toggle('on',c===b)});
    renderAll();
  });

  // shape toggle
  $('shapeSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b)return;
    if(b.dataset.shape===shape) return;
    shape=b.dataset.shape;
    [].forEach.call(this.children,function(c){c.classList.toggle('on',c===b)});
    $('rectFields').style.display = shape==='rect'?'block':'none';
    $('circleFields').style.display = shape==='circle'?'block':'none';
    renderAll();
  });

  // unit system toggle
  $('unitSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b)return;
    if(b.dataset.sys===sys) return;
    sys=b.dataset.sys;
    [].forEach.call(this.children,function(c){c.classList.toggle('on',c===b)});
    // dimension & price units differ across systems → clear the live inputs.
    // Locked areas keep their canonical $/yd³ rate, so their cost re-expresses correctly.
    len.value='';wid.value='';dia.value='';depth.value='';price.value='';bagSize.value='';
    if(matKey==='custom' && customDens){ customDens.value=''; customDensUS=null; }
    [].forEach.call($('depthChips').children,function(c){c.classList.remove('on')});
    // labels
    var du=sys==='us'?'ft':'m', pu=sys==='us'?'in':'cm', bu=sys==='us'?'ft³':'L';
    [].forEach.call(document.querySelectorAll('[data-dim]'),function(el){el.textContent=du});
    [].forEach.call(document.querySelectorAll('[data-depth]'),function(el){el.textContent=pu});
    [].forEach.call(document.querySelectorAll('[data-bagu]'),function(el){el.textContent=bu});
    // depth chips
    var chipVals = sys==='us'?cfg.depthChips.us:cfg.depthChips.metric;
    var chipTxt  = sys==='us'?cfg.depthChipTxt.us:cfg.depthChipTxt.metric;
    [].forEach.call($('depthChips').children,function(c,i){ c.dataset.d=chipVals[i]; c.textContent=chipTxt[i]; });
    depth.placeholder = sys==='us'?cfg.depthPh.us:cfg.depthPh.metric;
    bagSize.placeholder = sys==='us'?cfg.bagPh.us:cfg.bagPh.metric;
    if(customDens) customDens.placeholder = sys==='us'?(cfg.customPh?cfg.customPh.us:''):(cfg.customPh?cfg.customPh.metric:'');
    var _cs=$('customSuf'); if(_cs) _cs.textContent = sys==='us'?'t/yd³':'t/m³';
    updateModeLabels();
    renderAll();
  });

  // material select
  if(matSel) matSel.addEventListener('change',function(){
    matKey=this.value;
    $('customWrap').style.display = matKey==='custom'?'block':'none';
    if(matKey!=='custom'){ customDensUS=null; }
    renderAll();
  });
  if(customDens) customDens.addEventListener('input',function(){
    var v=parseNum(this.value);
    if(isNaN(v)||v<=0){ customDensUS=null; }
    else { customDensUS = sys==='us'? v : v/DENS_US_TO_METRIC; }
    renderAll();
  });

  // sold-by mode
  function updateModeLabels(){
    var unitWord = mode==='ton'?(sys==='us'?'ton':'tonne'):(mode==='yd3'?(sys==='us'?'cubic yard':'m³'):'bag');
    var sufWord  = mode==='ton'?(sys==='us'?'$/ton':'$/tonne'):(mode==='yd3'?(sys==='us'?'$/yd³':'$/m³'):'$/bag');
    $('priceLab').textContent='Price per '+unitWord;
    $('priceSuf').textContent=sufWord;
    var _seg=$('modeSeg');
    var _tb=_seg.querySelector('button[data-mode="ton"]'); if(_tb) _tb.textContent = sys==='us'?'Ton':'Tonne';
    var _yb=_seg.querySelector('button[data-mode="yd3"]'); if(_yb) _yb.textContent = sys==='us'?'Cubic yard':'m³';
    $('bagWrap').style.display = mode==='bag'?'block':'none';
  }
  $('modeSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b)return;
    if(b.dataset.mode===mode) return;
    mode=b.dataset.mode;
    [].forEach.call(this.children,function(c){c.classList.toggle('on',c===b)});
    price.value='';   // live price is per-unit — user re-enters in the new unit. Locked areas keep their canonical rate.
    updateModeLabels();
    renderAll();
  });

  // add / clear / remove
  $('addBtn').addEventListener('click',function(){
    if(!areaComplete()) return;
    var v=currentArea(); if(v==null) return;
    // LOCK price ($/yd³ canonical) AND this row's own sold-by unit + bag size, frozen at add time
    tally.push({label:areaLabel(), matLabel:(MATLABEL[matKey]||''), volYd3:v.volYd3, volM3:v.volM3, tons:v.tons, tonnes:v.tonnes,
                mode:mode, bagVolYd3:bagVolYd3(), rate:liveRateYd3()});
    // clear the form for the next area; sold-by/material/shape/system stay as the current selection
    len.value='';wid.value='';dia.value='';depth.value='';price.value='';bagSize.value='';
    [].forEach.call($('depthChips').children,function(c){c.classList.remove('on')});
    renderAll();
    (shape==='rect'?len:dia).focus();
  });
  $('clearFieldsBtn').addEventListener('click',function(){
    len.value='';wid.value='';dia.value='';depth.value='';price.value='';bagSize.value='';
    [].forEach.call($('depthChips').children,function(c){c.classList.remove('on')});
    renderAll();
    (shape==='rect'?len:dia).focus();
  });
  $('tallyBody').addEventListener('click',function(e){
    var x=e.target.closest('.x'); if(!x)return;
    tally.splice(+x.dataset.i,1); renderTally();
  });
  $('clearBtn').addEventListener('click',function(){tally=[];renderTally()});

  // waste
  $('addWasteBtn').addEventListener('click',function(){
    if(!tally.length) return;
    waste.active=true; waste.pct=''; $('wastePct').value='';
    renderTally(); $('wastePct').focus();
  });
  $('wastePct').addEventListener('input',function(){ waste.pct=this.value; renderTally(); });
  $('wasteRemove').addEventListener('click',function(){
    waste.active=false; waste.pct=''; $('wastePct').value=''; renderTally();
  });

  updateModeLabels();
  renderAll();

}
CalcThis.initVolumeCalc = function(cfg){ cfg.hasMaterial=true; if(!cfg.startMode) cfg.startMode='ton'; _initVolumeCore(cfg); };
CalcThis.initVolumeCalcLite = function(cfg){ cfg.hasMaterial=false; cfg.startMode='yd3'; cfg.mat={}; cfg.matLabel={}; cfg.defaultMat=null; _initVolumeCore(cfg); };

/* ===== CalcThis shared AREA engine (flooring, tile, …) =====
   Same frozen-snapshot tally discipline as the volume core, but the physical
   model is AREA (sq ft / m²) → boxes (area ÷ box coverage, ceil) or direct area.
   ONE core, one entry point today:
     initAreaCalc(cfg)   — material selector + Box / Sq-ft modes (flooring)
   Structurally parallel to _initVolumeCore so QA + behaviour match; a future
   tile calculator reuses this same core with its own config. Locked rows read
   ONLY from their own snapshot — changing a live input never alters a locked row. */
function _initAreaCore(cfg){

  var sys='us', shape='rect', mode=cfg.startMode||'box', matKey=cfg.defaultMat;
  var $=function(id){return document.getElementById(id)};
  var len=$('len'), wid=$('wid'), dia=$('dia'),
      price=$('price'), boxCov=$('boxCov'), matSel=$('matSel');
  var tileW=$('tileW'), tileH=$('tileH'), perBox=$('perBox');   // tile mode only (may be null)
  var tally=[];                     // each: {label, matLabel, areaSqft, areaM2, mode, boxCov, tileAreaSqft, rate}
  var waste={active:false,pct:''};

  var FT2_PER_M2=10.7639104;
  var IN2_PER_FT2=144, CM2_PER_M2=10000;
  var MAT=cfg.mat||{};              // {key: sq ft per box}
  var MATLABEL=cfg.matLabel||{};
  var TILESIZE=cfg.tileSize||{};    // {key:[w,h]} individual tile size, US inches

  function parseNum(v){ if(v==null) return NaN; v=(''+v).trim(); if(!v) return NaN; var n=parseFloat(v); return isNaN(n)?NaN:n; }
  function fmt(n){ if(n==null||isNaN(n)) return '—'; if(n>=100) return n.toFixed(1).replace(/\.0$/,''); var r=Math.round(n*100)/100; var s=''+r; if(s.indexOf('.')>=0) s=s.replace(/\.?0+$/,''); return s||'0'; }
  function money(n){return '$'+n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}

  // material's typical box coverage (sq ft/box, US canonical) with a global fallback
  function matCovUS(){ var c=MAT[matKey]; return (c&&c>0)? c : (cfg.covDefaultUS||20); }
  // live box coverage in sq ft, from the input, falling back to the material typical
  function boxCovSqft(){
    if(!boxCov) return matCovUS();
    var c=parseNum(boxCov.value);
    if(isNaN(c)||c<=0) return matCovUS();
    return sys==='us'? c : c*FT2_PER_M2;   // m²/box -> sq ft/box
  }

  // ----- tile mode helpers (individual tile size -> tiles) -----
  // live individual-tile area in sq ft, from tileW/tileH (US inches, metric cm). null if incomplete.
  function tileAreaSqft(){
    if(!tileW||!tileH) return null;
    var w=parseNum(tileW.value), h=parseNum(tileH.value);
    if(isNaN(w)||isNaN(h)||w<=0||h<=0) return null;
    if(sys==='us') return (w*h)/IN2_PER_FT2;          // in² -> ft²
    return ((w*h)/CM2_PER_M2)*FT2_PER_M2;             // cm² -> m² -> ft²
  }
  function perBoxVal(){ if(!perBox) return null; var n=parseNum(perBox.value); return (!isNaN(n)&&n>0)?Math.floor(n):null; }
  function tileDimsOK(){ return !cfg.tileMode || mode!=='tile' || tileAreaSqft()!=null; }

  // current room area (null if dims incomplete)
  function currentArea(){
    var a;
    if(shape==='rect'){
      var L=parseNum(len.value), W=parseNum(wid.value);
      if(isNaN(L)||isNaN(W)||L<=0||W<=0) return null;
      a=L*W;                                 // ft² (US) or m² (metric)
    } else {
      var D=parseNum(dia.value); if(isNaN(D)||D<=0) return null;
      var r=D/2; a=Math.PI*r*r;
    }
    var areaSqft, areaM2;
    if(sys==='us'){ areaSqft=a; areaM2=a/FT2_PER_M2; }
    else { areaM2=a; areaSqft=a*FT2_PER_M2; }
    return {areaSqft:areaSqft, areaM2:areaM2};
  }

  function areaComplete(){ return currentArea()!=null && tileDimsOK(); }
  function listMissing(){
    var m=[];
    if(shape==='rect'){
      if(isNaN(parseNum(len.value))||parseNum(len.value)<=0) m.push('length');
      if(isNaN(parseNum(wid.value))||parseNum(wid.value)<=0) m.push('width');
    } else {
      if(isNaN(parseNum(dia.value))||parseNum(dia.value)<=0) m.push('diameter');
    }
    if(cfg.tileMode && mode==='tile' && tileAreaSqft()==null) m.push('tile size');
    if(!m.length) return 'the details';
    if(m.length===1) return m[0];
    return m.slice(0,-1).join(', ')+' and '+m[m.length-1];
  }

  function areaUnit(){ return sys==='us'?'sq ft':'m²'; }
  function qtyUnit(){ return mode==='box'?'boxes':(mode==='tile'?'tiles':areaUnit()); }

  // sold quantity for canonical area incl waste (boxes/tiles ceil'd)
  function soldQty(v, wp){
    var mlt=(wp&&wp>0)?(1+wp/100):1;
    var areaTxt='= '+fmt((sys==='us'?v.areaSqft:v.areaM2)*mlt)+' '+areaUnit();
    if(mode==='box'){
      var cov=boxCovSqft();
      var boxes=Math.ceil((v.areaSqft*mlt)/cov);
      return {qty:boxes, qtyNull:false, subTxt:areaTxt};
    }
    if(mode==='tile'){
      var ta=tileAreaSqft(); if(ta==null||ta<=0) return {qty:null, qtyNull:true, subTxt:''};
      var tiles=Math.ceil((v.areaSqft*mlt)/ta);
      var pb=perBoxVal();
      var sub=areaTxt;
      if(pb){ var bx=Math.ceil(tiles/pb); sub+=' \u00b7 \u2248 '+bx+' '+boxWord(bx); }
      return {qty:tiles, qtyNull:false, subTxt:sub};
    }
    var area=(sys==='us'?v.areaSqft:v.areaM2)*mlt;
    return {qty:area, qtyNull:false, subTxt:''};
  }

  function priceVal(){ var p=parseNum(price.value); return (!isNaN(p)&&p>0)?p:null; }

  // canonical $ per sq ft from the LIVE price (current mode+system); null if none
  function liveRateSqft(){
    var p=priceVal(); if(p==null) return null;
    if(mode==='box'){ var cov=boxCovSqft(); return cov>0? p/cov : null; }   // $/box -> $/sq ft
    if(mode==='tile'){ var ta=tileAreaSqft(); return (ta&&ta>0)? p/ta : null; } // $/tile -> $/sq ft
    return sys==='us'? p : p/FT2_PER_M2;                                     // $/sq ft, or $/m² -> $/sq ft
  }
  function costFor(sq){ var p=priceVal(); if(p==null||sq.qty==null) return null; return sq.qty*p; }

  // per-row quantity in THAT ROW's own sold-by unit (frozen at add time)
  function itemQty(r){
    if(r.mode==='box'){ return Math.ceil(r.areaSqft / r.boxCov); }
    if(r.mode==='tile'){ return Math.ceil(r.areaSqft / r.tileAreaSqft); }
    return sys==='us'? r.areaSqft : r.areaM2;
  }
  // per-row cost uses the row's LOCKED canonical $/sq ft rate + its own frozen unit
  function itemCost(r){
    if(r.rate==null) return null;
    if(r.mode==='box'){ return itemQty(r) * (r.rate * r.boxCov); }        // boxes × $/box
    if(r.mode==='tile'){ return itemQty(r) * (r.rate * r.tileAreaSqft); } // tiles × $/tile
    return r.areaSqft * r.rate;                                            // area: physical, system-independent
  }

  function areaLabel(){
    var du=sys==='us'?'ft':'m';
    if(shape==='rect'){
      var L=len.value.trim()||'?', W=wid.value.trim()||'?';
      return L+'×'+W+' '+du;
    }
    var D=dia.value.trim()||'?';
    return 'Ø'+D+' '+du;
  }

  // ---------- live single room ----------
  function renderArea(){
    var v=currentArea(); var b=$('addBtn'), complete=areaComplete();
    b.disabled=!complete; b.style.opacity=complete?'1':'.5'; b.style.cursor=complete?'pointer':'not-allowed';
    $('hint').style.display=complete?'none':'block';
    $('addNote').style.display=complete?'block':'none';
    if(!complete) $('hint').textContent='Enter '+listMissing();
    $('resUnit').textContent=qtyUnit();
    $('resCostWrap').classList.remove('hide');
    $('resTip').classList.remove('hide');
    if(v==null){
      $('resQty').textContent='—'; $('resSub').textContent='Enter dimensions to see the amount.'; $('resCost').textContent='—'; return;
    }
    var sq=soldQty(v,0);
    $('resQty').textContent=sq.qtyNull?'—':fmt(sq.qty);
    $('resSub').textContent=sq.subTxt||'';
    var c=costFor(sq);
    $('resCost').textContent=(c!=null)?money(c):'—';
  }

  // ---------- project tally ----------
  function boxWord(n){ return n===1?'box':'boxes'; }
  function tileWord(n){ return n===1?'tile':'tiles'; }
  function areaUnitNow(){ return sys==='us'?'sq ft':'m²'; }
  function rowQtyText(r){
    var q=itemQty(r); if(q==null) return {txt:'—',na:true};
    if(r.mode==='box') return {txt:fmt(q)+' '+boxWord(q), na:false};
    if(r.mode==='tile') return {txt:fmt(q)+' '+tileWord(q), na:false};
    return {txt:fmt(q)+' '+areaUnitNow(), na:false};
  }
  function rowCost(r){ var c=itemCost(r); return (c==null)?{txt:'—',na:true}:{txt:money(c),na:false}; }

  function groupTotals(){
    var g={boxQ:0,boxHas:false,tileQ:0,tileHas:false,areaQ:0,areaHas:false,cost:0,hasCost:false,order:[]};
    tally.forEach(function(r){
      var k=r.mode==='box'?'box':(r.mode==='tile'?'tile':'area');
      if(g.order.indexOf(k)<0) g.order.push(k);   // total lists units in the order first added
      if(r.mode==='box'){ g.boxQ+=itemQty(r); g.boxHas=true; }
      else if(r.mode==='tile'){ g.tileQ+=itemQty(r); g.tileHas=true; }
      else { g.areaQ+=itemQty(r); g.areaHas=true; }
      var c=itemCost(r); if(c!=null){ g.cost+=c; g.hasCost=true; }
    });
    return g;
  }
  function amountParts(boxQ,tileQ,areaQ,g){
    var val={box:boxQ, tile:tileQ, area:areaQ};
    var lab={box:boxWord(boxQ), tile:tileWord(tileQ), area:areaUnitNow()};
    var has={box:g.boxHas, tile:g.tileHas, area:g.areaHas};
    return g.order.filter(function(k){return has[k];}).map(function(k){return {num:val[k], unit:lab[k]};});
  }
  function partsStr(parts,plus){ return parts.map(function(p){return (plus?'+':'')+fmt(p.num)+' '+p.unit;}).join(plus?'  ':' + '); }

  function renderTally(){
    var body=$('tallyBody'), tot=$('projTotal');
    var g=groupTotals();
    var wp=waste.active?parseNum(waste.pct):NaN;
    var hasWp=waste.active&&!isNaN(wp)&&wp>0;
    var mlt=hasWp?wp/100:0;
    var wBox=g.boxHas?Math.ceil(g.boxQ*mlt):0;
    var wTile=g.tileHas?Math.ceil(g.tileQ*mlt):0;
    var wArea=g.areaHas?g.areaQ*mlt:0;
    var wCost=g.hasCost?g.cost*mlt:0;
    var tBox=g.boxQ+wBox, tTile=g.tileQ+wTile, tArea=g.areaQ+wArea, tCost=g.cost+wCost;

    updateMbar(g,tBox,tTile,tArea,tCost);

    if(!tally.length){
      body.innerHTML='<div class="tally-empty">'+cfg.emptyText+'</div>';
      tot.style.display='none'; $('clearBtn').style.display='none';
      waste.active=false; waste.pct=''; $('wastePct').value='';
      $('wasteRow').style.display='none'; $('addWasteBtn').style.display='none';
      return;
    }
    $('clearBtn').style.display='inline';
    var html='';
    tally.forEach(function(r,i){
      var q=rowQtyText(r), c=rowCost(r);
      html+='<div class="trow"><span class="desc">'+(r.matLabel?'<span class="m">'+r.matLabel+'</span>':'')+'<span class="d">'+r.label+'</span></span>'
          +'<span class="qt'+(q.na?' na':'')+'">'+q.txt+'</span>'
          +'<span class="rc'+(c.na?' na':'')+'">'+c.txt+'</span>'
          +'<button class="x" data-i="'+i+'" aria-label="Remove">×</button></div>';
    });
    body.innerHTML=html;

    if(waste.active){
      $('wasteRow').style.display='grid';
      $('addWasteBtn').style.display='none';
      var wq=$('wasteQty'), wr=$('wasteRc');
      if(hasWp){
        var wval={box:wBox, tile:wTile, area:wArea};
        var wlab={box:boxWord(wBox), tile:tileWord(wTile), area:areaUnitNow()};
        var whas={box:g.boxHas&&wBox>0, tile:g.tileHas&&wTile>0, area:g.areaHas&&wArea>0};
        var wparts=g.order.filter(function(k){return whas[k];}).map(function(k){return {num:wval[k], unit:wlab[k]};});
        wq.className='qt'; wq.textContent=wparts.length?partsStr(wparts,true):'—';
        if(g.hasCost){ wr.className='rc'; wr.textContent='+'+money(wCost); }
        else { wr.className='rc na'; wr.textContent='—'; }
      } else {
        wq.className='qt na'; wq.textContent='—';
        wr.className='rc na'; wr.textContent='—';
      }
    } else {
      $('wasteRow').style.display='none';
      $('addWasteBtn').style.display='block';
    }

    tot.style.display='grid';
    $('projCount').textContent='';
    $('totalUnit').textContent='';
    $('totalQty').textContent=partsStr(amountParts(tBox,tTile,tArea,g),false);
    if(g.hasCost){
      $('totalCostRow').style.display='block'; $('totalCost').style.display='block'; $('totalCost').textContent=money(tCost);
    } else {
      $('totalCostRow').style.display='none'; $('totalCost').style.display='none';
    }
  }

  function segHTML(parts){ return parts.map(function(p){return '<b>'+fmt(p.num)+'</b> '+p.unit;}).join(' + '); }
  function updateMbar(g,tBox,tTile,tArea,tCost){
    if(tally.length){
      $('mLab').textContent='Project total';
      $('mSeg').innerHTML=segHTML(amountParts(tBox,tTile,tArea,g));
      if(g.hasCost){ $('mCostWrap').classList.remove('hide'); $('mCost').textContent=money(tCost); }
      else { $('mCostWrap').classList.add('hide'); }
      return;
    }
    $('mLab').textContent=cfg.thisLabel||'This room';
    var v=currentArea();
    if(v==null){ $('mSeg').innerHTML='<b>—</b> '+qtyUnit(); $('mCostWrap').classList.add('hide'); return; }
    var sq=soldQty(v,0);
    $('mSeg').innerHTML='<b>'+(sq.qtyNull?'—':fmt(sq.qty))+'</b> '+qtyUnit();
    var c=costFor(sq);
    if(c!=null){ $('mCostWrap').classList.remove('hide'); $('mCost').textContent=money(c); }
    else { $('mCostWrap').classList.add('hide'); }
  }

  function renderAll(){ renderArea(); renderTally(); }

  // prefill the box-coverage field from the material's typical, in current system
  function prefillCov(){
    if(!boxCov) return;
    var c=MAT[matKey];
    if(matKey==='custom' || !c || c<=0){ boxCov.value=''; return; }
    boxCov.value = sys==='us'? c : +(c/FT2_PER_M2).toFixed(2);
  }
  // prefill individual tile W×H from the material's typical size (US inches -> cm in metric)
  function prefillTileSize(){
    if(!tileW||!tileH) return;
    var s=TILESIZE[matKey];
    if(matKey==='custom' || !s || !s.length){ tileW.value=''; tileH.value=''; return; }
    if(sys==='us'){ tileW.value=s[0]; tileH.value=s[1]; }
    else { tileW.value=+(s[0]*2.54).toFixed(1); tileH.value=+(s[1]*2.54).toFixed(1); }
  }

  // ---------- events ----------
  [len,wid,dia,price].forEach(function(el){ if(el) el.addEventListener('input',renderAll); });
  if(boxCov) boxCov.addEventListener('input',renderAll);
  [tileW,tileH,perBox].forEach(function(el){ if(el) el.addEventListener('input',renderAll); });

  $('shapeSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b)return;
    if(b.dataset.shape===shape) return;
    shape=b.dataset.shape;
    [].forEach.call(this.children,function(c){c.classList.toggle('on',c===b)});
    $('rectFields').style.display=shape==='rect'?'block':'none';
    $('circleFields').style.display=shape==='circle'?'block':'none';
    renderAll();
  });

  $('unitSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b)return;
    if(b.dataset.sys===sys) return;
    sys=b.dataset.sys;
    [].forEach.call(this.children,function(c){c.classList.toggle('on',c===b)});
    // dimension & price units differ across systems → clear live inputs.
    // Locked rows keep their canonical $/sq ft rate, so their cost re-expresses correctly.
    len.value='';wid.value='';dia.value='';price.value='';
    var du=sys==='us'?'ft':'m';
    [].forEach.call(document.querySelectorAll('[data-dim]'),function(el){el.textContent=du});
    var cu=sys==='us'?'sq ft/box':'m²/box';
    [].forEach.call(document.querySelectorAll('[data-cov]'),function(el){el.textContent=cu});
    var tu=sys==='us'?'in':'cm';
    [].forEach.call(document.querySelectorAll('[data-tdim]'),function(el){el.textContent=tu});
    prefillCov();
    prefillTileSize();
    updateModeLabels();
    renderAll();
  });

  if(matSel) matSel.addEventListener('change',function(){
    matKey=this.value;
    prefillCov();
    prefillTileSize();
    renderAll();
  });

  function updateModeLabels(){
    var unitWord = mode==='box'?'box':(mode==='tile'?'tile':(sys==='us'?'sq ft':'m²'));
    var sufWord  = mode==='box'?'$/box':(mode==='tile'?'$/tile':(sys==='us'?'$/sq ft':'$/m²'));
    $('priceLab').textContent='Price per '+unitWord;
    $('priceSuf').textContent=sufWord;
    var sqBtn=$('modeSeg').querySelector('button[data-mode="sqft"]');
    if(sqBtn) sqBtn.textContent = sys==='us'?'Sq ft':'m²';
    var bw=$('boxWrap'); if(bw) bw.style.display = mode==='box'?'block':'none';
    var tw=$('tileWrap'); if(tw) tw.style.display = mode==='tile'?'block':'none';
  }
  $('modeSeg').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b)return;
    if(b.dataset.mode===mode) return;
    mode=b.dataset.mode;
    [].forEach.call(this.children,function(c){c.classList.toggle('on',c===b)});
    price.value='';   // live price is per-unit — user re-enters in the new unit. Locked rows keep their rate.
    updateModeLabels();
    renderAll();
  });

  // add / clear / remove
  $('addBtn').addEventListener('click',function(){
    if(!areaComplete()) return;
    var v=currentArea(); if(v==null) return;
    tally.push({label:areaLabel(), matLabel:(MATLABEL[matKey]||''), areaSqft:v.areaSqft, areaM2:v.areaM2,
                mode:mode, boxCov:boxCovSqft(), tileAreaSqft:tileAreaSqft(), rate:liveRateSqft()});
    len.value='';wid.value='';dia.value='';price.value='';
    renderAll();
    (shape==='rect'?len:dia).focus();
  });
  $('clearFieldsBtn').addEventListener('click',function(){
    len.value='';wid.value='';dia.value='';price.value='';
    renderAll();
    (shape==='rect'?len:dia).focus();
  });
  $('tallyBody').addEventListener('click',function(e){
    var x=e.target.closest('.x'); if(!x)return;
    tally.splice(+x.dataset.i,1); renderTally();
  });
  $('clearBtn').addEventListener('click',function(){tally=[];renderTally()});

  // waste
  $('addWasteBtn').addEventListener('click',function(){
    if(!tally.length) return;
    waste.active=true; waste.pct=''; $('wastePct').value='';
    renderTally(); $('wastePct').focus();
  });
  $('wastePct').addEventListener('input',function(){ waste.pct=this.value; renderTally(); });
  $('wasteRemove').addEventListener('click',function(){ waste.active=false; waste.pct=''; $('wastePct').value=''; renderTally(); });

  prefillCov();
  prefillTileSize();
  updateModeLabels();
  renderAll();
}
CalcThis.initAreaCalc = function(cfg){ cfg.hasMaterial=true; if(!cfg.startMode) cfg.startMode='box'; _initAreaCore(cfg); };
CalcThis.initTileCalc = function(cfg){ cfg.hasMaterial=true; cfg.tileMode=true; if(!cfg.startMode) cfg.startMode='tile'; _initAreaCore(cfg); };

/* ===== CalcThis Pace engine (Pillar 2 · Fitness) =====
   CalcThis.initPaceCalc(cfg) — running pace / time / distance solver.
   Independent of the area/volume cores. Internal units: distance in km,
   time in seconds, pace in seconds-per-km. Live-solves the chosen target
   field from the other two, always derives speed, and (advanced mode)
   renders per-km/mi splits with even/negative/positive pacing plus
   equivalent finish-times for the standard race distances. */
CalcThis.initPaceCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var KM_PER_MI = 1.609344;
  var PRESET = { '5k': 5, '10k': 10, 'half': 21.0975, 'marathon': 42.195, 'mile': 1.609344 };

  var target = 'pace';   // pace | time | distance
  var distUnit = 'km';   // km | mi
  var paceUnit = 'km';   // km | mi  (per km / per mile)
  var splitUnit = 'km';  // km | mi
  var strategy = 'even'; // even | neg | pos
  var advanced = false;
  var lastValid = null;  // {dKm, tSec, pKm}

  var distIn = $('distVal'), hIn = $('h'), mIn = $('m'), sIn = $('s'),
      pmIn = $('pMin'), psIn = $('pSec'), deltaIn = $('splitDelta');
  var distFld = $('distFld'), timeFld = $('timeFld'), paceFld = $('paceFld'),
      distChips = $('distChips');

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function pad(n) { n = Math.round(n); return (n < 10 ? '0' : '') + n; }
  function hms(sec) {
    if (!isFinite(sec) || sec <= 0) return '—';
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
  }
  function paceStr(secPerKm, unit) {
    if (!isFinite(secPerKm) || secPerKm <= 0) return '—';
    var per = unit === 'mi' ? secPerKm * KM_PER_MI : secPerKm;
    var m = Math.floor(per / 60), s = Math.round(per % 60);
    if (s === 60) { m++; s = 0; }
    return m + ':' + pad(s);
  }
  function trimNum(n, d) {
    if (!isFinite(n)) return '—';
    var s = n.toFixed(d == null ? 2 : d);
    return s.replace(/\.?0+$/, '');
  }

  // ---- readers (to internal units) ----
  function readDistKm() {
    var v = num(distIn.value);
    if (isNaN(v) || v <= 0) return NaN;
    return distUnit === 'mi' ? v * KM_PER_MI : v;
  }
  function readTimeSec() {
    var h = num(hIn.value), m = num(mIn.value), s = num(sIn.value);
    var t = (isNaN(h) ? 0 : h) * 3600 + (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
    return t > 0 ? t : NaN;
  }
  function readPaceSecPerKm() {
    var m = num(pmIn.value), s = num(psIn.value);
    var per = (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
    if (per <= 0) return NaN;
    return paceUnit === 'mi' ? per / KM_PER_MI : per;
  }

  // ---- writers (fill the read-only target field) ----
  function writeTime(sec) {
    if (!isFinite(sec) || sec <= 0) { hIn.value = mIn.value = sIn.value = ''; return; }
    sec = Math.round(sec);
    hIn.value = Math.floor(sec / 3600);
    mIn.value = Math.floor((sec % 3600) / 60);
    sIn.value = sec % 60;
  }
  function writePace(secPerKm) {
    if (!isFinite(secPerKm) || secPerKm <= 0) { pmIn.value = psIn.value = ''; return; }
    var per = paceUnit === 'mi' ? secPerKm * KM_PER_MI : secPerKm;
    var m = Math.floor(per / 60), s = Math.round(per % 60);
    if (s === 60) { m++; s = 0; }
    pmIn.value = m; psIn.value = s;
  }
  function writeDist(km) {
    if (!isFinite(km) || km <= 0) { distIn.value = ''; return; }
    distIn.value = trimNum(distUnit === 'mi' ? km / KM_PER_MI : km, 3);
  }

  // ---- split table ----
  function renderSplits(dKm, tSec, pKm) {
    var wrap = $('splitTable');
    var totUnit = dKm / (splitUnit === 'mi' ? KM_PER_MI : 1);
    var avgPer = pKm * (splitUnit === 'mi' ? KM_PER_MI : 1); // sec per split unit
    var segN = Math.max(1, Math.ceil(totUnit - 1e-9));
    var lens = [], i;
    for (i = 0; i < segN; i++) lens.push(1);
    var rem = totUnit - (segN - 1);
    lens[segN - 1] = (rem > 1e-6 && rem < 1) ? rem : 1;

    var delta = num(deltaIn.value); if (isNaN(delta) || delta < 0) delta = 0;
    var offset = strategy === 'even' ? 0 : delta / 2;
    // ramp -1..+1 across segments; neg split = start slower (higher pace first)
    var times = [], raw = 0;
    for (i = 0; i < segN; i++) {
      var r = segN === 1 ? 0 : (i / (segN - 1)) * 2 - 1; // -1..+1
      var sign = strategy === 'neg' ? -1 : 1;            // neg: first slower
      var pacePer = avgPer + sign * offset * r;
      var ti = pacePer * lens[i];
      times.push(ti); raw += ti;
    }
    var scale = raw > 0 ? tSec / raw : 1;                // keep total exact
    var rows = '', cum = 0, distAcc = 0;
    for (i = 0; i < segN; i++) {
      var t = times[i] * scale; cum += t; distAcc += lens[i];
      var splitPace = t / lens[i]; // sec per unit
      var lbl = (Math.abs(lens[i] - 1) < 1e-6)
        ? trimNum(distAcc, 2) + (splitUnit === 'mi' ? ' mi' : ' km')
        : trimNum(distAcc, 2) + (splitUnit === 'mi' ? ' mi' : ' km');
      rows += '<tr><td>' + lbl + '</td><td>' + paceStr(splitUnit === 'mi' ? splitPace / KM_PER_MI : splitPace, splitUnit) +
              '</td><td>' + hms(t) + '</td><td>' + hms(cum) + '</td></tr>';
    }
    wrap.innerHTML =
      '<thead><tr><th>Distance</th><th>Split pace</th><th>Split time</th><th>Elapsed</th></tr></thead><tbody>' +
      rows + '</tbody>';
    $('splitMeta').textContent =
      (strategy === 'even' ? 'Even' : strategy === 'neg' ? 'Negative' : 'Positive') +
      ' · per ' + (splitUnit === 'mi' ? 'mile' : 'km');
  }

  function renderFinish(pKm, dKm) {
    // short landmark row follows the unit toggle; named races stay fixed
    var shortRow = distUnit === 'mi' ? { label: '1 mile', km: 1.609344 } : { label: '1 km', km: 1 };
    var list = [shortRow,
      { label: '5K', km: 5 },
      { label: '10K', km: 10 },
      { label: 'Half marathon', km: 21.0975 },
      { label: 'Marathon', km: 42.195 }
    ];
    var body = '', shown = {};
    list.forEach(function (f) {
      shown[f.km.toFixed(3)] = 1;
      var cur = Math.abs(f.km - dKm) < 0.01 ? ' class="cur"' : '';
      body += '<tr' + cur + '><td>' + f.label + '</td><td>' + hms(f.km * pKm) + '</td><td>' +
              paceStr(pKm, paceUnit) + '/' + (paceUnit === 'mi' ? 'mi' : 'km') + '</td></tr>';
    });
    if (dKm > 0 && !shown[dKm.toFixed(3)]) {
      body = '<tr class="cur"><td>' + trimNum(distUnit === 'mi' ? dKm / KM_PER_MI : dKm, 2) +
             ' ' + (distUnit === 'mi' ? 'mi' : 'km') + ' (yours)</td><td>' + hms(dKm * pKm) +
             '</td><td>' + paceStr(pKm, paceUnit) + '/' + (paceUnit === 'mi' ? 'mi' : 'km') +
             '</td></tr>' + body;
    }
    $('finishTable').innerHTML =
      '<thead><tr><th>Distance</th><th>Finish</th><th>Pace</th></tr></thead><tbody>' + body + '</tbody>';
  }

  // ---- core solve ----
  function solve() {
    var dKm, tSec, pKm;
    if (target === 'pace') {
      dKm = readDistKm(); tSec = readTimeSec();
      pKm = (dKm > 0 && tSec > 0) ? tSec / dKm : NaN;
      writePace(pKm);
    } else if (target === 'time') {
      dKm = readDistKm(); pKm = readPaceSecPerKm();
      tSec = (dKm > 0 && pKm > 0) ? dKm * pKm : NaN;
      writeTime(tSec);
    } else {
      tSec = readTimeSec(); pKm = readPaceSecPerKm();
      dKm = (tSec > 0 && pKm > 0) ? tSec / pKm : NaN;
      writeDist(dKm);
    }

    var ok = isFinite(dKm) && dKm > 0 && isFinite(tSec) && tSec > 0 && isFinite(pKm) && pKm > 0;
    var resBig = $('resBig'), resUnit = $('resUnit'), resLab = $('resLab'),
        resSub = $('resSub'), speedWrap = $('speedWrap'), speedVal = $('speedVal');

    if (target === 'pace') {
      resLab.textContent = 'Your pace';
      resBig.textContent = ok ? paceStr(pKm, paceUnit) : '—';
      resUnit.textContent = '/' + (paceUnit === 'mi' ? 'mi' : 'km');
    } else if (target === 'time') {
      resLab.textContent = 'Your finish time';
      resBig.textContent = ok ? hms(tSec) : '—';
      resUnit.textContent = '';
    } else {
      resLab.textContent = 'Your distance';
      resBig.textContent = ok ? trimNum(distUnit === 'mi' ? dKm / KM_PER_MI : dKm, 2) : '—';
      resUnit.textContent = distUnit === 'mi' ? 'mi' : 'km';
    }

    if (ok) {
      var kmh = dKm / (tSec / 3600), mph = kmh / KM_PER_MI;
      speedVal.textContent = trimNum(kmh, 2) + ' km/h · ' + trimNum(mph, 2) + ' mph';
      speedWrap.style.display = '';
      resSub.textContent = 'Pace ' + paceStr(pKm, 'km') + '/km · ' + paceStr(pKm, 'mi') + '/mi';
      lastValid = { dKm: dKm, tSec: tSec, pKm: pKm };
    } else {
      speedWrap.style.display = 'none';
      resSub.textContent = target === 'pace' ? 'Enter distance and time.'
        : target === 'time' ? 'Enter distance and pace.' : 'Enter time and pace.';
      lastValid = null;
    }

    // mobile bar
    var mBig = $('mBig'), mUnit = $('mUnit'), mSpeed = $('mSpeed');
    if (mBig) {
      mBig.textContent = resBig.textContent; mUnit.textContent = resUnit.textContent;
      mSpeed.textContent = ok ? trimNum(dKm / (tSec / 3600), 1) + ' km/h' : '';
    }

    // advanced outputs
    if (advanced) {
      if (ok) {
        renderSplits(dKm, tSec, pKm);
        renderFinish(pKm, dKm);
        $('splitWrap').style.display = '';
        $('finishWrap').style.display = '';
      } else {
        $('splitWrap').style.display = 'none';
        $('finishWrap').style.display = 'none';
      }
    }
  }

  // ---- target UI (which field is the read-only result) ----
  function applyTarget() {
    [['pace', paceFld, [pmIn, psIn]], ['time', timeFld, [hIn, mIn, sIn]], ['distance', distFld, [distIn]]]
      .forEach(function (g) {
        var isOut = g[0] === target;
        g[1].classList.toggle('isout', isOut);
        g[2].forEach(function (inp) { if (inp) inp.readOnly = isOut; });
      });
    distChips.style.display = target === 'distance' ? 'none' : '';
  }

  // ---- wiring ----
  function seg(id, attr, fn) {
    var box = $(id); if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(box.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on'); fn(b.getAttribute(attr));
    });
  }

  seg('targetSeg', 'data-t', function (v) { target = v; applyTarget(); solve(); });
  seg('distUnitSeg', 'data-du', function (v) {
    if (v === distUnit) return;
    // preserve physical distance + pace; one unit system drives dist, pace and splits
    var km = readDistKm(), sk = readPaceSecPerKm();
    distUnit = v; paceUnit = v; splitUnit = v;
    setUnitLabels();
    if (isFinite(km) && km > 0 && target !== 'distance') writeDist(km);
    if (isFinite(sk) && sk > 0 && target !== 'pace') writePace(sk);
    clearChips(); solve();
  });
  seg('stratSeg', 'data-st', function (v) {
    strategy = v;
    $('deltaFld').style.display = v === 'even' ? 'none' : '';
    solve();
  });

  function setUnitLabels() {
    [].forEach.call(document.querySelectorAll('[data-du]'), function (el) {
      if (el.tagName !== 'BUTTON') el.textContent = distUnit === 'mi' ? 'mi' : 'km';
    });
    [].forEach.call(document.querySelectorAll('[data-pu-suf]'), function (el) {
      el.textContent = '/' + (paceUnit === 'mi' ? 'mi' : 'km');
    });
  }

  function clearChips() {
    [].forEach.call(distChips.querySelectorAll('button'), function (b) { b.classList.remove('on'); });
  }
  distChips.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    clearChips(); b.classList.add('on');
    var km = PRESET[b.getAttribute('data-p')];
    distIn.value = trimNum(distUnit === 'mi' ? km / KM_PER_MI : km, 3);
    solve();
  });

  // live inputs
  [distIn, hIn, mIn, sIn, pmIn, psIn, deltaIn].forEach(function (inp) {
    if (!inp) return;
    inp.addEventListener('input', function () {
      if (inp === distIn) clearChips();
      solve();
    });
  });

  // advanced toggle
  var advBtn = $('advBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('advIn').style.display = advanced ? '' : 'none';
    if (!advanced) { $('splitWrap').style.display = 'none'; $('finishWrap').style.display = 'none'; }
    solve();
    if (advanced) { var sw = $('splitWrap'); if (sw && sw.scrollIntoView) sw.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });

  setUnitLabels();
  applyTarget();
  solve();
};

/* ===== CalcThis Heart-Rate Zone engine (Pillar 2 · Fitness) =====
   CalcThis.initHRZoneCalc(cfg) — 5-zone training-HR calculator.
   Independent of the area/volume/pace engines. Simple mode: age only,
   %-of-max HR (Tanaka 208-0.7*age). Advanced mode reveals resting HR
   (adds a Karvonen / heart-rate-reserve column) and an optional max-HR
   override. Zone 2 (fat-burn / aerobic base) is highlighted. Live. */
CalcThis.initHRZoneCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var advanced = false;

  var ZONES = [
    { n:1, name:'Recovery',    sub:'very light',      lo:0.50, hi:0.60 },
    { n:2, name:'Endurance',   sub:'fat burn \u00b7 base', lo:0.60, hi:0.70 },
    { n:3, name:'Tempo',       sub:'aerobic power',   lo:0.70, hi:0.80 },
    { n:4, name:'Threshold',   sub:'lactate',         lo:0.80, hi:0.90 },
    { n:5, name:'VO\u2082 max', sub:'maximum effort', lo:0.90, hi:1.00 }
  ];

  var ageIn = $('age'), rhrIn = $('rhr'), maxIn = $('maxhr');
  if (!ageIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function bpm(x) { return Math.round(x); }

  function solve() {
    var age = num(ageIn.value);
    var ageOK = isFinite(age) && age >= 5 && age <= 120;

    var ov = maxIn ? num(maxIn.value) : NaN;
    var hasOverride = isFinite(ov) && ov > 0;
    var maxHR = hasOverride ? Math.round(ov) : (ageOK ? Math.round(208 - 0.7 * age) : NaN);

    var resting = rhrIn ? num(rhrIn.value) : NaN;
    var karv = advanced && isFinite(resting) && resting > 0 && isFinite(maxHR) && resting < maxHR;

    var resBig = $('resBig'), resUnit = $('resUnit'), resLab = $('resLab'), resSub = $('resSub');
    resLab.textContent = hasOverride ? 'Your max heart rate' : 'Your estimated max heart rate';

    if (!(isFinite(maxHR) && maxHR > 0)) {
      resBig.textContent = '\u2014'; resUnit.textContent = '';
      resSub.textContent = 'Enter your age to see your zones.';
      $('zoneTable').innerHTML = '';
      if ($('kvNote')) $('kvNote').style.display = 'none';
      return;
    }

    resBig.textContent = maxHR; resUnit.textContent = 'bpm';

    function lo(z) { return karv ? bpm(resting + (maxHR - resting) * z.lo) : bpm(maxHR * z.lo); }
    function hi(z) { return karv ? bpm(resting + (maxHR - resting) * z.hi) : bpm(maxHR * z.hi); }

    var z2 = ZONES[1];
    resSub.textContent = 'Zone 2 \u00b7 ' + z2.sub + ': ' + lo(z2) + '\u2013' + hi(z2) + ' bpm';

    var head = '<thead><tr><th>Zone</th><th>% of max</th><th>' +
      (karv ? 'Heart rate \u00b7 Karvonen' : 'Heart rate') + '</th></tr></thead>';
    var rows = '';
    ZONES.forEach(function (z) {
      var cur = z.n === 2 ? ' class="cur"' : '';
      rows += '<tr' + cur + '><td>Zone ' + z.n +
        ' <span class="zsub">' + z.name + ' \u00b7 ' + z.sub + '</span></td>' +
        '<td>' + Math.round(z.lo * 100) + '\u2013' + Math.round(z.hi * 100) + '%</td>' +
        '<td>' + lo(z) + '\u2013' + hi(z) + ' bpm</td></tr>';
    });
    $('zoneTable').innerHTML = head + '<tbody>' + rows + '</tbody>';

    if ($('kvNote')) $('kvNote').style.display = karv ? '' : 'none';
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

  [ageIn, rhrIn, maxIn].forEach(function (inp) {
    if (!inp) return;
    inp.addEventListener('input', solve);
  });

  solve();
};

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
  var sex = 'female', unit = 'cm', advanced = false;

  var CATS = {
    male: [
      { name:'Essential fat', hi:5,   range:'2\u20135%'   },
      { name:'Athletes',      hi:13,  range:'6\u201313%'  },
      { name:'Fitness',       hi:17,  range:'14\u201317%' },
      { name:'Average',       hi:24,  range:'18\u201324%' },
      { name:'Obese',         hi:999, range:'25%+'        }
    ],
    female: [
      { name:'Essential fat', hi:13,  range:'10\u201313%' },
      { name:'Athletes',      hi:20,  range:'14\u201320%' },
      { name:'Fitness',       hi:24,  range:'21\u201324%' },
      { name:'Average',       hi:31,  range:'25\u201331%' },
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
      ' \u00b7 body fat</th></tr></thead>';
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
      resBig.textContent = '\u2014'; resUnit.textContent = '';
      resSub.textContent = sex === 'female'
        ? 'Enter height, neck, waist and hip to see your body fat.'
        : 'Enter height, neck and waist to see your body fat.';
      fillCatTable(NaN);
      if ($('advOut')) $('advOut').style.display = 'none';
      return;
    }

    resBig.textContent = one(bf); resUnit.textContent = '%';
    resSub.textContent = catFor(bf).name + ' \u00b7 US Navy tape method';
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
          '<p class="res-tip">The Navy tape method and the BMI method use different inputs, so they rarely match exactly \u2014 Navy reads where you carry fat, BMI uses only weight and height. Both are estimates.</p>';
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

  var hf0 = $('hipFld'); if (hf0) hf0.style.display = sex === 'female' ? '' : 'none';

  // Default to inches for US users (imperial audience); metric elsewhere.
  function prefersImperial() {
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
  }
  if (cfg.unit === 'in' || cfg.unit === 'cm') unit = cfg.unit;
  else if (prefersImperial()) unit = 'in';
  applyUnit();

  solve();
};

/* -----------------------------------------------------------
   CalcThis.initTDEECalc(cfg) — TDEE / daily-calorie / maintenance.
   Independent engine. Simple: sex + age + height + weight + unit
   toggle + activity level -> Mifflin-St Jeor BMR x activity =
   maintenance calories, with a goal table (cut/maintain/bulk),
   maintain row highlighted. Advanced: optional body-fat % switches
   BMR to Katch-McArdle, and reveals BMR + a protein/carb/fat macro
   split for the maintenance figure. Live, no button. Inches default
   for US users (metric elsewhere). */
CalcThis.initTDEECalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var sex = 'female', unit = 'cm', advanced = false;

  var GOALS = [
    { name:'Weight loss',  sub:'≈0.5 kg/wk', d:-500 },
    { name:'Mild loss',    sub:'≈0.25 kg/wk', d:-250 },
    { name:'Maintain',     sub:'stay the same', d:0 },
    { name:'Mild gain',    sub:'≈0.25 kg/wk', d:250 },
    { name:'Weight gain',  sub:'≈0.5 kg/wk', d:500 }
  ];

  var ageIn = $('age'), heightIn = $('height'), weightIn = $('weight'),
      bfIn = $('bodyfat'), actSel = $('activity');
  if (!ageIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function toCm(v) { return unit === 'in' ? v * 2.54 : v; }
  function toKg(v) { return unit === 'in' ? v / 2.2046226 : v; }
  function r0(x) { return Math.round(x); }

  var PH = {
    cm: { height:'178', weight:'80' },
    in: { height:'70',  weight:'176' }
  };
  function applyUnit() {
    var mu = unit === 'in' ? 'in' : 'cm', wu = unit === 'in' ? 'lb' : 'kg', p = PH[unit];
    if ($('uHeight')) $('uHeight').textContent = mu;
    if ($('uWeight')) $('uWeight').textContent = wu;
    if (heightIn) heightIn.placeholder = p.height;
    if (weightIn) weightIn.placeholder = p.weight;
    if (unitSeg) [].forEach.call(unitSeg.querySelectorAll('button'), function (x) {
      x.classList.toggle('on', x.getAttribute('data-unit') === unit);
    });
  }

  function compute() {
    var age = num(ageIn.value), h = toCm(num(heightIn.value)), w = toKg(num(weightIn.value));
    if (!(isFinite(age) && age > 0 && isFinite(h) && h > 0 && isFinite(w) && w > 0)) return null;
    var act = actSel ? parseFloat(actSel.value) : 1.55;
    if (!(act > 0)) act = 1.55;
    var bf = advanced ? num(bfIn ? bfIn.value : NaN) : NaN;
    var useKatch = advanced && isFinite(bf) && bf > 0 && bf < 70;
    var bmr;
    if (useKatch) {
      var lbm = w * (1 - bf / 100);
      bmr = 370 + 21.6 * lbm;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161);
    }
    var tdee = bmr * act;
    return { bmr: bmr, tdee: tdee, w: w, method: useKatch ? 'Katch-McArdle' : 'Mifflin-St Jeor' };
  }

  function fillGoalTable(tdee) {
    var head = '<thead><tr><th>Goal</th><th>Calories</th></tr></thead>';
    var rows = '';
    GOALS.forEach(function (g) {
      var cur = g.d === 0 ? ' class="cur"' : '';
      var cals = tdee != null ? r0(tdee + g.d).toLocaleString() + ' kcal' : '—';
      rows += '<tr' + cur + '><td>' + g.name + ' <span class="zsub">' + g.sub + '</span></td><td>' + cals + '</td></tr>';
    });
    $('goalTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
  }

  function solve() {
    var c = compute();
    var resBig = $('resBig'), resUnit = $('resUnit'), resSub = $('resSub');

    if (!c) {
      resBig.textContent = '—'; resUnit.textContent = '';
      resSub.textContent = 'Enter age, height, weight and activity to see your calories.';
      fillGoalTable(null);
      if ($('advOut')) $('advOut').style.display = 'none';
      return;
    }

    resBig.textContent = r0(c.tdee).toLocaleString(); resUnit.textContent = 'kcal/day';
    resSub.textContent = 'Maintenance · ' + c.method + ' method';
    fillGoalTable(c.tdee);

    var advOut = $('advOut');
    if (advanced && advOut) {
      var protein_g = 1.6 * c.w;
      var protein_k = protein_g * 4;
      var fat_k = 0.25 * c.tdee, fat_g = fat_k / 9;
      var carbs_k = c.tdee - protein_k - fat_k; if (carbs_k < 0) carbs_k = 0;
      var carbs_g = carbs_k / 4;
      var pctP = Math.round(protein_k / c.tdee * 100),
          pctF = Math.round(fat_k / c.tdee * 100),
          pctC = Math.round(carbs_k / c.tdee * 100);
      advOut.innerHTML =
        '<div class="bf-cmp"><span class="k">BMR (at rest)</span><span class="v">' + r0(c.bmr).toLocaleString() + ' kcal</span></div>' +
        '<div class="macro-head">Daily macros at maintenance</div>' +
        '<div class="macro"><span class="k">Protein</span><span class="g">' + r0(protein_g) + ' g</span><span class="pc">' + pctP + '%</span></div>' +
        '<div class="macro"><span class="k">Carbs</span><span class="g">' + r0(carbs_g) + ' g</span><span class="pc">' + pctC + '%</span></div>' +
        '<div class="macro"><span class="k">Fat</span><span class="g">' + r0(fat_g) + ' g</span><span class="pc">' + pctF + '%</span></div>' +
        '<p class="res-tip">Protein set at 1.6 g/kg, fat at 25% of calories, carbs the rest. Scale grams with your goal calories above. ' +
        (c.method === 'Katch-McArdle' ? 'Using Katch-McArdle from your body fat %.' : 'Add your body fat % for a Katch-McArdle estimate.') + '</p>';
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
      solve();
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

  [ageIn, heightIn, weightIn, bfIn].forEach(function (inp) { if (inp) inp.addEventListener('input', solve); });
  if (actSel) actSel.addEventListener('change', solve);

  function prefersImperial() {
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
  }
  if (cfg.unit === 'in' || cfg.unit === 'cm') unit = cfg.unit;
  else if (prefersImperial()) unit = 'in';
  applyUnit();

  solve();
};

/* -----------------------------------------------------------
   CalcThis.initBMICalc(cfg) — Body Mass Index.
   Independent engine. Simple: unit toggle + height + weight ->
   BMI, WHO category, a live position marker on a colour-coded
   BMI scale, and the healthy-weight range for that height with
   the change needed to reach it. Advanced: a target-BMI input
   (default 22) -> target weight + change, plus BMI Prime and the
   Ponderal Index. Live, no button. Inches default for US users
   (metric elsewhere). */
CalcThis.initBMICalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'cm', advanced = false;

  var CATS = [
    { name: 'Underweight', hi: 18.5, range: '< 18.5' },
    { name: 'Normal',      hi: 25,   range: '18.5 – 24.9' },
    { name: 'Overweight',  hi: 30,   range: '25.0 – 29.9' },
    { name: 'Obese',       hi: 999,  range: '30.0 +' }
  ];
  var SCALE_MIN = 12, SCALE_MAX = 42;

  // height/weight chart — plot bounds in metric (kg, cm); ticks per unit
  var CH = { x0: 42, y0: 10, x1: 312, y1: 270 };   // drawing box inside a 320x308 viewBox
  var WB = [38, 142], HB = [138, 202];
  var TICKS = {
    cm: { w: [40, 60, 80, 100, 120, 140], h: [140, 150, 160, 170, 180, 190, 200] },
    in: { w: [100, 150, 200, 250, 300], h: [55, 60, 65, 70, 75] }
  };

  var heightIn = $('height'), weightIn = $('weight'), targetIn = $('targetBmi');
  if (!heightIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function toCm(v) { return unit === 'in' ? v * 2.54 : v; }
  function toKg(v) { return unit === 'in' ? v / 2.2046226 : v; }
  function fromKg(v) { return unit === 'in' ? v * 2.2046226 : v; }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function wUnit() { return unit === 'in' ? 'lb' : 'kg'; }

  function catFor(bmi) {
    for (var i = 0; i < CATS.length; i++) { if (bmi < CATS[i].hi) return CATS[i]; }
    return CATS[CATS.length - 1];
  }

  var PH = { cm: { height: '178', weight: '75' }, in: { height: '70', weight: '165' } };
  function applyUnit() {
    if ($('uHeight')) $('uHeight').textContent = unit === 'in' ? 'in' : 'cm';
    if ($('uWeight')) $('uWeight').textContent = wUnit();
    var p = PH[unit];
    heightIn.placeholder = p.height;
    if (weightIn) weightIn.placeholder = p.weight;
    if (unitSeg) [].forEach.call(unitSeg.querySelectorAll('button'), function (x) {
      x.classList.toggle('on', x.getAttribute('data-unit') === unit);
    });
  }

  function fillCatTable(bmi) {
    var has = isFinite(bmi), cur = has ? catFor(bmi) : null;
    var head = '<thead><tr><th>Category</th><th>BMI</th></tr></thead>';
    var rows = '';
    CATS.forEach(function (c) {
      var on = cur && c.name === cur.name ? ' class="cur"' : '';
      rows += '<tr' + on + '><td>' + c.name + '</td><td>' + c.range + '</td></tr>';
    });
    $('catTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
  }

  // ---- height vs weight chart ----
  function sx(kg) { kg = Math.max(WB[0], Math.min(WB[1], kg)); return CH.x0 + (kg - WB[0]) / (WB[1] - WB[0]) * (CH.x1 - CH.x0); }
  function sy(cm) { cm = Math.max(HB[0], Math.min(HB[1], cm)); return CH.y1 - (cm - HB[0]) / (HB[1] - HB[0]) * (CH.y1 - CH.y0); }
  function curve(bmi) {
    var p = [], N = 24, i, w;
    for (i = 0; i <= N; i++) { w = WB[0] + (WB[1] - WB[0]) * i / N; p.push(sx(w) + ',' + sy(100 * Math.sqrt(w / bmi))); }
    return p;
  }
  function renderChart(kg, cm) {
    var svg = $('bmiChartSvg'); if (!svg) return;
    var c185 = curve(18.5), c25 = curve(25), c30 = curve(30);
    var midX = (CH.x0 + CH.x1) / 2, midY = (CH.y0 + CH.y1) / 2;
    var g = '';
    g += '<polygon points="' + c185.join(' ') + ' ' + CH.x1 + ',' + CH.y0 + ' ' + CH.x0 + ',' + CH.y0 + '" fill="#5A7361" fill-opacity=".22"/>';
    g += '<polygon points="' + c185.join(' ') + ' ' + c25.slice().reverse().join(' ') + '" fill="#37503F" fill-opacity=".34"/>';
    g += '<polygon points="' + c25.join(' ') + ' ' + c30.slice().reverse().join(' ') + '" fill="#B5761F" fill-opacity=".34"/>';
    g += '<polygon points="' + c30.join(' ') + ' ' + CH.x1 + ',' + CH.y1 + ' ' + CH.x0 + ',' + CH.y1 + '" fill="#8F5C13" fill-opacity=".42"/>';
    [c185, c25, c30].forEach(function (c) { g += '<polyline points="' + c.join(' ') + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>'; });
    g += '<rect x="' + CH.x0 + '" y="' + CH.y0 + '" width="' + (CH.x1 - CH.x0) + '" height="' + (CH.y1 - CH.y0) + '" fill="none" stroke="#E7DECF" stroke-width="1"/>';
    var tk = TICKS[unit === 'in' ? 'in' : 'cm'];
    tk.w.forEach(function (tv) {
      var kv = unit === 'in' ? tv / 2.2046226 : tv; if (kv < WB[0] || kv > WB[1]) return;
      var x = sx(kv);
      g += '<line x1="' + x + '" y1="' + CH.y1 + '" x2="' + x + '" y2="' + (CH.y1 + 4) + '" stroke="#8A7A66" stroke-width="1"/>';
      g += '<text x="' + x + '" y="' + (CH.y1 + 18) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + tv + '</text>';
    });
    tk.h.forEach(function (tv) {
      var cv = unit === 'in' ? tv * 2.54 : tv; if (cv < HB[0] || cv > HB[1]) return;
      var y = sy(cv);
      g += '<line x1="' + (CH.x0 - 4) + '" y1="' + y + '" x2="' + CH.x0 + '" y2="' + y + '" stroke="#8A7A66" stroke-width="1"/>';
      g += '<text x="' + (CH.x0 - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + tv + '</text>';
    });
    g += '<text x="' + midX + '" y="305" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#5B4C3B">Weight (' + (unit === 'in' ? 'lb' : 'kg') + ')</text>';
    g += '<text x="13" y="' + midY + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#5B4C3B" transform="rotate(-90 13 ' + midY + ')">Height (' + (unit === 'in' ? 'in' : 'cm') + ')</text>';
    var cx = sx(kg), cy = sy(cm);
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + CH.y1 + '" stroke="#241A11" stroke-width="1" stroke-dasharray="3 2" opacity=".4"/>';
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + CH.x0 + '" y2="' + cy + '" stroke="#241A11" stroke-width="1" stroke-dasharray="3 2" opacity=".4"/>';
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#241A11" stroke="#fff" stroke-width="2"/>';
    svg.innerHTML = g;
  }

  function solve() {
    var h = toCm(num(heightIn.value)), w = toKg(num(weightIn.value));
    var resBig = $('resBig'), resUnit = $('resUnit'), resSub = $('resSub');
    var gauge = $('bmiGauge'), marker = $('bmiMarker'), range = $('bmiRange');

    if (!(isFinite(h) && h > 0 && isFinite(w) && w > 0)) {
      resBig.textContent = '—'; if (resUnit) resUnit.textContent = '';
      resSub.textContent = 'Enter your height and weight to see your BMI.';
      if (gauge) gauge.style.visibility = 'hidden';
      if (range) range.innerHTML = '';
      if ($('bmiChart')) $('bmiChart').style.display = 'none';
      if ($('bmiNote')) $('bmiNote').style.display = 'none';
      fillCatTable(NaN);
      if ($('advOut')) $('advOut').style.display = 'none';
      return;
    }

    var m = h / 100;
    var bmi = w / (m * m);
    var cat = catFor(bmi);
    resBig.textContent = one(bmi); if (resUnit) resUnit.textContent = '';
    resSub.textContent = cat.name + ' · World Health Organization';
    fillCatTable(bmi);

    if ($('bmiChart')) { $('bmiChart').style.display = ''; renderChart(w, h); }
    if ($('bmiNote')) $('bmiNote').style.display = bmi >= 25 ? '' : 'none';

    if (gauge && marker) {
      gauge.style.visibility = 'visible';
      var pct = (bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      marker.style.left = Math.max(0, Math.min(100, pct)) + '%';
    }

    var loKg = 18.5 * m * m, hiKg = 24.9 * m * m;
    if (range) {
      var msg = 'Healthy weight for this height: <strong>' + one(fromKg(loKg)) + ' – ' +
        one(fromKg(hiKg)) + ' ' + wUnit() + '</strong>';
      if (bmi >= 25) msg += ' · lose <strong>' + one(fromKg(w - hiKg)) + ' ' + wUnit() + '</strong> to reach it';
      else if (bmi < 18.5) msg += ' · gain <strong>' + one(fromKg(loKg - w)) + ' ' + wUnit() + '</strong> to reach it';
      range.innerHTML = msg;
    }

    var advOut = $('advOut');
    if (advanced && advOut) {
      var tb = targetIn ? num(targetIn.value) : NaN;
      if (!(isFinite(tb) && tb > 0)) tb = 22;
      var tgtKg = tb * m * m, diff = fromKg(tgtKg - w);
      var diffTxt = Math.abs(diff) < 0.05 ? 'you’re there' :
        (diff < 0 ? 'lose ' : 'gain ') + one(Math.abs(diff)) + ' ' + wUnit();
      var prime = bmi / 25, pondl = w / (m * m * m);
      advOut.innerHTML =
        '<div class="bf-cmp"><span class="k">Target weight at BMI ' + one(tb) + '</span><span class="v">' + one(fromKg(tgtKg)) + ' ' + wUnit() + '</span></div>' +
        '<div class="bf-cmp"><span class="k">To reach it</span><span class="v">' + diffTxt + '</span></div>' +
        '<div class="bf-cmp"><span class="k">BMI Prime</span><span class="v">' + (Math.round(prime * 100) / 100).toFixed(2) + '</span></div>' +
        '<div class="bf-cmp"><span class="k">Ponderal Index</span><span class="v">' + one(pondl) + ' kg/m³</span></div>' +
        '<p class="res-tip">BMI Prime is your BMI divided by 25 — under 1 sits inside the normal range. The Ponderal Index divides weight by height cubed, which holds up better at extreme heights. BMI alone can’t tell muscle from fat.</p>';
      advOut.style.display = '';
    } else if (advOut) {
      advOut.style.display = 'none';
    }
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

  [heightIn, weightIn, targetIn].forEach(function (inp) { if (inp) inp.addEventListener('input', solve); });

  function prefersImperial() {
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
  }
  if (cfg.unit === 'in' || cfg.unit === 'cm') unit = cfg.unit;
  else if (prefersImperial()) unit = 'in';
  applyUnit();

  solve();
};

/* -----------------------------------------------------------
   CalcThis.initIdealWeightCalc(cfg) — "how much should I weigh".
   Headline output is a RANGE (the BMI 18.5-24.9 weight span for
   the entered height), not a single number. The classic formulas
   (Robinson, Devine, Miller, Hamwi) are plotted as ticks on the
   same scale so the user sees they are just points inside the
   healthy band. Advanced: current weight -> distance to range,
   and a body-frame adjustment that places a target within the
   range. Live, no button. Inches default for US users. */
CalcThis.initIdealWeightCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'cm', sex = 'female', frame = 'medium', advanced = false;

  var BMIN = 15, BMAX = 32, LO = 18.5, HI = 25;

  var heightIn = $('height'), weightIn = $('curWeight');
  if (!heightIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function toCm(v) { return unit === 'in' ? v * 2.54 : v; }
  function toKg(v) { return unit === 'in' ? v / 2.2046226 : v; }
  function fromKg(v) { return unit === 'in' ? v * 2.2046226 : v; }
  function wUnit() { return unit === 'in' ? 'lb' : 'kg'; }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function r0(x) { return Math.round(x); }
  function pct(bmi) { return Math.max(0, Math.min(100, (bmi - BMIN) / (BMAX - BMIN) * 100)); }

  function hInDisp(hIn) {
    var ft = Math.floor(hIn / 12), inch = Math.round(hIn - ft * 12);
    if (inch === 12) { ft++; inch = 0; }
    return ft + "'" + inch + '"';
  }

  var PH = { cm: '178', in: '70' };
  function applyUnit() {
    if ($('uHeight')) $('uHeight').textContent = unit === 'in' ? 'in' : 'cm';
    if ($('uWeight')) $('uWeight').textContent = wUnit();
    heightIn.placeholder = PH[unit];
    if (weightIn) weightIn.placeholder = unit === 'in' ? '175' : '80';
    if (unitSeg) [].forEach.call(unitSeg.querySelectorAll('button'), function (x) {
      x.classList.toggle('on', x.getAttribute('data-unit') === unit);
    });
  }

  // ideal-weight formulas -> kg. over = inches over 5 ft (may be negative).
  function formulas(hIn) {
    var o = hIn - 60;
    return sex === 'male'
      ? { Robinson: 52 + 1.9 * o, Devine: 50 + 2.3 * o, Miller: 56.2 + 1.41 * o, Hamwi: 48 + 2.7 * o }
      : { Robinson: 49 + 1.7 * o, Devine: 45.5 + 2.3 * o, Miller: 53.1 + 1.36 * o, Hamwi: 45.5 + 2.2 * o };
  }
  var FKEYS = ['Robinson', 'Devine', 'Miller', 'Hamwi'];

  function solve() {
    var hCm = toCm(num(heightIn.value));
    var res = $('resBig'), sub = $('resSub'), viz = $('iwViz'), band = $('iwBand'),
        ticks = $('iwTicks'), tbl = $('iwTable'), sentence = $('iwSentence'),
        curOut = $('iwCurOut'), frameOut = $('iwFrameOut'),
        curM = $('iwCurMarker'), frameM = $('iwFrameMarker');

    if (!(isFinite(hCm) && hCm >= 130 && hCm <= 220)) {
      res.textContent = '—';
      sub.textContent = 'Enter your height to see your healthy weight range.';
      viz.style.visibility = 'hidden';
      tbl.innerHTML = ''; sentence.innerHTML = '';
      if (curOut) curOut.innerHTML = '';
      if (frameOut) frameOut.innerHTML = '';
      return;
    }

    var m = hCm / 100, hIn = hCm / 2.54;
    var loKg = LO * m * m, hiKg = HI * m * m;
    var f = formulas(hIn);
    var fVals = FKEYS.map(function (k) { return f[k]; });
    var fMin = Math.min.apply(null, fVals), fMax = Math.max.apply(null, fVals);

    res.textContent = r0(fromKg(loKg)) + ' – ' + r0(fromKg(hiKg)) + ' ' + wUnit();
    sub.textContent = 'Healthy weight range for ' +
      (unit === 'in' ? hInDisp(hIn) : r0(hCm) + ' cm') + ' · ' + (sex === 'male' ? 'male' : 'female');

    viz.style.visibility = 'visible';
    band.style.left = pct(LO) + '%';
    band.style.width = (pct(HI) - pct(LO)) + '%';

    var tHtml = '';
    FKEYS.forEach(function (k) {
      tHtml += '<span class="iw-tick" style="left:' + pct(f[k] / (m * m)) + '%" title="' + k + '"></span>';
    });
    $('iwTickLayer').innerHTML = tHtml;

    ticks.innerHTML =
      '<span style="left:' + pct(LO) + '%">' + r0(fromKg(loKg)) + '</span>' +
      '<span style="left:' + pct(HI) + '%">' + r0(fromKg(hiKg)) + '</span>';

    var rows = '';
    FKEYS.forEach(function (k) {
      rows += '<tr><td>' + k + '</td><td>' + r0(fromKg(f[k])) + ' ' + wUnit() + '</td></tr>';
    });
    tbl.innerHTML = '<thead><tr><th>Formula</th><th>Estimate</th></tr></thead><tbody>' + rows + '</tbody>';

    sentence.innerHTML = 'Most guidelines put a healthy weight for your height between <strong>' +
      r0(fromKg(loKg)) + ' and ' + r0(fromKg(hiKg)) + ' ' + wUnit() + '</strong>. The classic formulas land at <strong>' +
      r0(fromKg(fMin)) + '–' + r0(fromKg(fMax)) + ' ' + wUnit() +
      '</strong>, inside that range — a reference point, not a single correct number.';

    var cw = weightIn ? toKg(num(weightIn.value)) : NaN;
    if (isFinite(cw) && cw > 0) {
      var cbmi = cw / (m * m);
      curM.style.display = ''; curM.style.left = pct(cbmi) + '%';
      var msg;
      if (cw > hiKg) msg = 'You are <strong>' + one(fromKg(cw - hiKg)) + ' ' + wUnit() + '</strong> above the top of your healthy range.';
      else if (cw < loKg) msg = 'You are <strong>' + one(fromKg(loKg - cw)) + ' ' + wUnit() + '</strong> below the bottom of your healthy range.';
      else msg = 'You are <strong>within</strong> your healthy weight range.';
      curOut.innerHTML =
        '<div class="bf-cmp"><span class="k">Current weight</span><span class="v">' + one(fromKg(cw)) + ' ' + wUnit() + ' · BMI ' + one(cbmi) + '</span></div>' +
        '<p class="res-tip">' + msg + '</p>';
    } else {
      curM.style.display = 'none';
      if (curOut) curOut.innerHTML = '';
    }

    if (advanced && frameOut) {
      var frac = frame === 'small' ? 0.25 : (frame === 'large' ? 0.75 : 0.5);
      var tgtKg = loKg + (hiKg - loKg) * frac;
      frameM.style.display = ''; frameM.style.left = pct(tgtKg / (m * m)) + '%';
      var wr = sex === 'male'
        ? 'under 6.75 in / 17 cm is small, over 7.5 in / 19 cm is large'
        : 'under 5.5 in / 14 cm is small, over 5.75 in / 14.5 cm is large';
      frameOut.innerHTML =
        '<div class="bf-cmp"><span class="k">Frame-adjusted target (' + frame + ' frame)</span><span class="v">' + r0(fromKg(tgtKg)) + ' ' + wUnit() + '</span></div>' +
        '<p class="res-tip">A larger frame carries more bone and lean mass, so a target higher in the healthy range is normal. Measure your wrist: ' + wr + '.</p>';
    } else {
      if (frameM) frameM.style.display = 'none';
      if (frameOut) frameOut.innerHTML = '';
    }
  }

  var unitSeg = $('unitSeg');
  if (unitSeg) unitSeg.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
    unit = b.getAttribute('data-unit'); applyUnit(); solve();
  });
  var sexSeg = $('sexSeg');
  if (sexSeg) sexSeg.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
    sex = b.getAttribute('data-sex');
    [].forEach.call(sexSeg.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    solve();
  });
  var frameSeg = $('frameSeg');
  if (frameSeg) frameSeg.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
    frame = b.getAttribute('data-frame');
    [].forEach.call(frameSeg.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    solve();
  });

  var advBtn = $('advBtn');
  if (advBtn) advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('advIn').style.display = advanced ? '' : 'none';
    solve();
    if (advanced) { var a = $('advIn'); if (a && a.scrollIntoView) a.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });

  [heightIn, weightIn].forEach(function (inp) { if (inp) inp.addEventListener('input', solve); });

  function prefersImperial() {
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
  }
  if (cfg.unit === 'in' || cfg.unit === 'cm') unit = cfg.unit;
  else if (prefersImperial()) unit = 'in';
  applyUnit();
  solve();
};

/* -----------------------------------------------------------
   CalcThis.initAgeCalc(cfg) — chronological age.
   Independent engine. Date of birth -> exact age in
   years/months/days, a live-ticking seconds count, totals
   (months/weeks/days/hours), the weekday you were born, a
   next-birthday countdown, and a life-progress timeline to your
   next decade with 1,000- and 10,000-day milestones plotted.
   Advanced: your age on any past or future date. Live, no button. */
CalcThis.initAgeCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  var advanced = false, ticker = null, dpDob = null, dpOn = null;

  var dobIn = $('dob'), onIn = $('onDate');
  if (!dobIn) return;

  function parseD(v) {
    if (!v) return null;
    var p = ('' + v).split('-');
    if (p.length !== 3) return null;
    var y = +p[0], m = +p[1], d = +p[2];
    if (!(y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }
  function midnight(dt) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()); }
  function addDays(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n); }
  function isoOf(dt) { return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2); }
  function fmtD(d) { return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function diffDays(a, b) { return Math.round((midnight(b) - midnight(a)) / 86400000); }

  function ymd(from, to) {
    var y = to.getFullYear() - from.getFullYear();
    var m = to.getMonth() - from.getMonth();
    var d = to.getDate() - from.getDate();
    if (d < 0) { m--; d += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d };
  }
  function ymdStr(o) {
    return o.y + (o.y === 1 ? ' year, ' : ' years, ') + o.m + (o.m === 1 ? ' month, ' : ' months, ') +
      o.d + (o.d === 1 ? ' day' : ' days');
  }
  function nextBirthday(dob, today) {
    function bd(yr) {
      if (dob.getMonth() === 1 && dob.getDate() === 29 && new Date(yr, 1, 29).getMonth() !== 1) return new Date(yr, 2, 1);
      return new Date(yr, dob.getMonth(), dob.getDate());
    }
    var b = bd(today.getFullYear());
    if (diffDays(today, b) <= 0) b = bd(today.getFullYear() + 1);
    return b;
  }

  function renderTimeline(dob, today) {
    var svg = $('ageTl'); if (!svg) return;
    var age = ymd(dob, today).y;
    var nextDec = Math.floor(age / 10) * 10 + 10;
    function decBd(n) { return new Date(dob.getFullYear() + n, dob.getMonth(), dob.getDate()); }
    var t0 = dob.getTime(), t1 = decBd(nextDec).getTime();
    var x0 = 12, x1 = 308, y = 44, h = 12;
    function sx(dt) { return x0 + Math.max(0, Math.min(1, (dt.getTime() - t0) / (t1 - t0))) * (x1 - x0); }
    var g = '';
    g += '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="' + h + '" rx="6" fill="#EDF2ED"/>';
    g += '<rect x="' + x0 + '" y="' + y + '" width="' + (sx(today) - x0) + '" height="' + h + '" rx="6" fill="#B5761F"/>';
    for (var d = 10; d < nextDec; d += 10) {
      var dx = sx(decBd(d));
      g += '<line x1="' + dx + '" y1="' + (y - 4) + '" x2="' + dx + '" y2="' + (y + h + 4) + '" stroke="#8A7A66" stroke-width="1"/>';
      g += '<text x="' + dx + '" y="' + (y + h + 18) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + d + '</text>';
    }
    var nx = sx(today);
    g += '<line x1="' + nx + '" y1="' + (y - 14) + '" x2="' + nx + '" y2="' + (y + h + 6) + '" stroke="#241A11" stroke-width="1.5"/>';
    g += '<circle cx="' + nx + '" cy="' + (y + h / 2) + '" r="4" fill="#241A11" stroke="#fff" stroke-width="1.5"/>';
    g += '<text x="' + nx + '" y="' + (y - 19) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#241A11">' + age + '</text>';
    g += '<text x="' + x0 + '" y="18" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">Born ' + dob.getFullYear() + '</text>';
    g += '<text x="' + x1 + '" y="18" text-anchor="end" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + nextDec + '</text>';
    svg.innerHTML = g;
  }

  function stopTick() { if (ticker) { clearInterval(ticker); ticker = null; } }

  function pickedDate(dp, inp) {
    if (dp) { var d = dp.getDate(); return d ? midnight(d) : null; }
    return parseD(inp ? inp.value : '');
  }

  function solve() {
    stopTick();
    var dob = pickedDate(dpDob, dobIn);
    var today = midnight(new Date());
    var big = $('resBig'), unit = $('resUnit'), sub = $('resSub');

    if (!dob || diffDays(dob, today) < 0) {
      big.textContent = '—'; unit.textContent = '';
      sub.textContent = dob ? 'That date is in the future — enter your date of birth.' : 'Enter your date of birth to see your age.';
      if ($('ageDetail')) $('ageDetail').style.display = 'none';
      if ($('advOut')) $('advOut').style.display = 'none';
      return;
    }

    var a = ymd(dob, today), days = diffDays(dob, today);
    var months = a.y * 12 + a.m, weeks = Math.floor(days / 7);
    big.textContent = a.y; unit.textContent = a.y === 1 ? 'year old' : 'years old';
    sub.textContent = a.m + (a.m === 1 ? ' month, ' : ' months, ') + a.d + (a.d === 1 ? ' day' : ' days');
    if ($('ageDetail')) $('ageDetail').style.display = '';

    var dobExact = dob.getTime();
    function tick() { if ($('ageSecs')) $('ageSecs').textContent = Math.floor((Date.now() - dobExact) / 1000).toLocaleString(); }
    tick(); ticker = setInterval(tick, 1000);

    $('ageTotals').innerHTML =
      '<thead><tr><th>In total</th><th></th></tr></thead><tbody>' +
      '<tr><td>Months</td><td>' + months.toLocaleString() + '</td></tr>' +
      '<tr><td>Weeks</td><td>' + weeks.toLocaleString() + '</td></tr>' +
      '<tr><td>Days</td><td>' + days.toLocaleString() + '</td></tr>' +
      '<tr><td>Hours</td><td>' + (days * 24).toLocaleString() + '</td></tr>' +
      '</tbody>';

    var isBday = today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate();
    var nb = nextBirthday(dob, today), toNb = diffDays(today, nb), turning = nb.getFullYear() - dob.getFullYear();
    $('ageFacts').innerHTML =
      '<div class="bf-cmp"><span class="k">You were born on a</span><span class="v">' + DOW[dob.getDay()] + '</span></div>' +
      '<div class="bf-cmp"><span class="k">Next birthday</span><span class="v">' + (isBday ? 'Today!' : toNb.toLocaleString() + (toNb === 1 ? ' day' : ' days')) + '</span></div>' +
      (isBday ? '' : '<div class="bf-cmp"><span class="k">You’ll turn ' + turning + ' on</span><span class="v">' + fmtD(nb) + '</span></div>');

    renderTimeline(dob, today);

    var k1 = (Math.floor(days / 1000) + 1) * 1000, k10 = (Math.floor(days / 10000) + 1) * 10000;
    $('ageMiles').innerHTML =
      '<div class="age-mile"><span>' + k1.toLocaleString() + ' days old</span><span>' + fmtD(addDays(dob, k1)) + '</span></div>' +
      '<div class="age-mile"><span>' + k10.toLocaleString() + ' days old</span><span>' + fmtD(addDays(dob, k10)) + '</span></div>';

    var advOut = $('advOut');
    if (advanced && advOut) {
      var on = pickedDate(dpOn, onIn);
      if (!on) {
        advOut.innerHTML = '<p class="res-tip adv-tip">Pick a date to see how old you were — or will be — then.</p>';
      } else if (diffDays(dob, on) < 0) {
        advOut.innerHTML = '<p class="res-tip adv-tip">That date is before your date of birth.</p>';
      } else {
        var rel = diffDays(today, on);
        advOut.innerHTML = '<p class="res-tip adv-tip">On <strong>' + fmtD(on) + '</strong> you ' +
          (rel > 0 ? 'will be' : (rel === 0 ? 'are' : 'were')) + ' <strong>' + ymdStr(ymd(dob, on)) +
          '</strong> old — ' + diffDays(dob, on).toLocaleString() + ' days.</p>';
      }
      advOut.style.display = '';
    } else if (advOut) {
      advOut.style.display = 'none';
    }
  }

  var advBtn = $('advBtn');
  if (advBtn) {
    advBtn.addEventListener('click', function () {
      advanced = !advanced;
      advBtn.classList.toggle('open', advanced);
      $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
      $('advIn').style.display = advanced ? '' : 'none';
      solve();
      if (advanced) { var el = $('advIn'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
  }

  if (window.Datepicker) {
    dpDob = new Datepicker(dobIn, { format: 'd MM yyyy', autohide: true, weekStart: 0, todayHighlight: true, maxDate: new Date() });
    dobIn.addEventListener('changeDate', solve);
    if (onIn) {
      dpOn = new Datepicker(onIn, { format: 'd MM yyyy', autohide: true, weekStart: 0, todayHighlight: true });
      onIn.addEventListener('changeDate', solve);
      dpOn.setDate(new Date());
    }
  } else {
    dobIn.max = isoOf(new Date());
    if (onIn && !onIn.value) onIn.value = isoOf(new Date());
  }
  ['input', 'change'].forEach(function (ev) {
    dobIn.addEventListener(ev, solve);
    if (onIn) onIn.addEventListener(ev, solve);
  });

  solve();
};

/* -----------------------------------------------------------
   CalcThis.initCalorieCalc(cfg) — calories to reach a goal weight.
   Independent engine. Mifflin-St Jeor BMR (Katch-McArdle when a
   body-fat % is given) x activity = maintenance. Enter a goal
   weight -> daily calorie target for a chosen pace, a pace table
   (gentle / moderate / fast) with unsafe rows flagged, a projected
   weight-loss curve with 25/50/75% milestone dates and a goal
   date, plus a protein target. Advanced: plan by target date
   instead of pace, body-fat % (Katch-McArdle), full macro split.
   Live, no button. Inches default for US users. */
CalcThis.initCalorieCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var sex = 'female', unit = 'cm', advanced = false, pace = 'moderate', planByDate = false, dpTarget = null;

  var KCAL_PER_KG = 7700;
  var PACES = { gentle: 0.25, moderate: 0.5, fast: 1.0 };
  var PACE_ORDER = ['gentle', 'moderate', 'fast'];
  var PACE_LABEL = { gentle: 'Gentle', moderate: 'Moderate', fast: 'Fast' };
  var PACE_RATE = {
    gentle: { cm: '0.25 kg', in: '0.5 lb' },
    moderate: { cm: '0.5 kg', in: '1 lb' },
    fast: { cm: '1 kg', in: '2 lb' }
  };
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var ageIn = $('age'), heightIn = $('height'), weightIn = $('weight'), goalIn = $('goal'),
      bfIn = $('bodyfat'), actSel = $('activity'), targetIn = $('targetDate');
  if (!ageIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function toCm(v) { return unit === 'in' ? v * 2.54 : v; }
  function toKg(v) { return unit === 'in' ? v / 2.2046226 : v; }
  function fromKg(v) { return unit === 'in' ? v * 2.2046226 : v; }
  function r0(x) { return Math.round(x); }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function wU() { return unit === 'in' ? 'lb' : 'kg'; }
  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function fmtD(d) { return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function floorCal() { return sex === 'female' ? 1200 : 1500; }

  var PH = {
    cm: { age: '30', height: '178', weight: '85', goal: '75' },
    in: { age: '30', height: '70', weight: '187', goal: '165' }
  };
  function applyUnit() {
    var mu = unit === 'in' ? 'in' : 'cm', wu = wU(), p = PH[unit];
    if ($('uHeight')) $('uHeight').textContent = mu;
    if ($('uWeight')) $('uWeight').textContent = wu;
    if ($('uGoal')) $('uGoal').textContent = wu;
    if (heightIn) heightIn.placeholder = p.height;
    if (weightIn) weightIn.placeholder = p.weight;
    if (goalIn) goalIn.placeholder = p.goal;
    if (ageIn) ageIn.placeholder = p.age;
    if (unitSeg) [].forEach.call(unitSeg.querySelectorAll('button'), function (x) {
      x.classList.toggle('on', x.getAttribute('data-unit') === unit);
    });
  }

  function bmrOf(wKg) {
    var h = toCm(num(heightIn.value)), age = num(ageIn.value);
    if (!(wKg > 0 && h > 0 && age > 0)) return null;
    var bf = advanced ? num(bfIn ? bfIn.value : NaN) : NaN;
    if (isFinite(bf) && bf > 0 && bf < 70) {
      return { bmr: 370 + 21.6 * (wKg * (1 - bf / 100)), method: 'Katch-McArdle' };
    }
    return { bmr: 10 * wKg + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161), method: 'Mifflin-St Jeor' };
  }

  function model() {
    var wKg = toKg(num(weightIn.value));
    var m = bmrOf(wKg);
    if (!m) return null;
    var act = actSel ? parseFloat(actSel.value) : 1.55; if (!(act > 0)) act = 1.55;
    var goalKg = toKg(num(goalIn.value));
    var hasGoal = isFinite(goalKg) && goalKg > 0;
    var dir = !hasGoal ? -1 : (goalKg < wKg ? -1 : (goalKg > wKg ? 1 : 0));
    return { bmr: m.bmr, method: m.method, tdee: m.bmr * act, wKg: wKg, goalKg: goalKg, hasGoal: hasGoal, dir: dir };
  }

  function calForRate(md, weeklyKg) { return md.tdee + md.dir * (weeklyKg * KCAL_PER_KG / 7); }
  function unsafe(md, weeklyKg, cal) {
    if (md.dir === -1 && cal < floorCal()) return 'below';
    if (weeklyKg > 0.0125 * md.wKg) return 'fast';
    return null;
  }
  function weeksToGoal(md, weeklyKg) {
    if (!md.hasGoal || md.dir === 0 || !(weeklyKg > 0)) return null;
    return Math.abs(md.goalKg - md.wKg) / weeklyKg;
  }

  function renderChart(md, weeklyKg) {
    var svg = $('calChart'); if (!svg) return;
    var weeks = weeksToGoal(md, weeklyKg);
    if (weeks == null || weeks <= 0 || weeks > 520) { $('calChartWrap').style.display = 'none'; return; }
    $('calChartWrap').style.display = '';
    var X0 = 46, X1 = 312, Y0 = 16, Y1 = 158;
    var wStart = md.wKg, wEnd = md.goalKg;
    var lo = Math.min(wStart, wEnd), hi = Math.max(wStart, wEnd), pad = (hi - lo) * 0.12 || 1;
    lo -= pad; hi += pad;
    function sx(wk) { return X0 + wk / weeks * (X1 - X0); }
    function sy(kg) { return Y1 - (kg - lo) / (hi - lo) * (Y1 - Y0); }
    var today = midnight(new Date());
    var g = '';
    g += '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" fill="none" stroke="#E7DECF" stroke-width="1"/>';
    // y ticks (start & goal weight)
    [wStart, wEnd].forEach(function (kg) {
      var y = sy(kg);
      g += '<line x1="' + (X0 - 4) + '" y1="' + y + '" x2="' + X0 + '" y2="' + y + '" stroke="#8A7A66" stroke-width="1"/>';
      g += '<text x="' + (X0 - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + one(fromKg(kg)) + '</text>';
    });
    // projection line + fill
    g += '<path d="M' + sx(0) + ' ' + Y1 + ' L' + sx(0) + ' ' + sy(wStart) + ' L' + sx(weeks) + ' ' + sy(wEnd) + ' L' + sx(weeks) + ' ' + Y1 + ' Z" fill="#B5761F" fill-opacity=".10"/>';
    g += '<line x1="' + sx(0) + '" y1="' + sy(wStart) + '" x2="' + sx(weeks) + '" y2="' + sy(wEnd) + '" stroke="#B5761F" stroke-width="2"/>';
    // milestone dots 25/50/75/100
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var wk = weeks * f, kg = wStart + (wEnd - wStart) * f;
      var x = sx(wk), y = sy(kg), d = addDays(today, Math.round(wk * 7));
      g += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="#B5761F" stroke="#fff" stroke-width="1.5"/>';
      if (f === 1) g += '<text x="' + x + '" y="' + (Y1 + 20) + '" text-anchor="end" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#5B4C3B">' + fmtD(d) + '</text>';
    });
    g += '<text x="' + X0 + '" y="' + (Y1 + 20) + '" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">today</text>';
    g += '<text x="13" y="' + ((Y0 + Y1) / 2) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#5B4C3B" transform="rotate(-90 13 ' + ((Y0 + Y1) / 2) + ')">Weight (' + wU() + ')</text>';
    svg.innerHTML = g;
  }

  function fillPaceTable(md) {
    var head = '<thead><tr><th>Pace</th><th>Per week</th><th>Calories</th></tr></thead>';
    var rows = '';
    PACE_ORDER.forEach(function (k) {
      var wk = PACES[k], cal = calForRate(md, wk), u = unsafe(md, wk, cal);
      var cls = (k === pace && !planByDate) ? ' cur' : '';
      var flag = u === 'below' ? '<span class="cal-warn">below safe min</span>' : (u === 'fast' ? '<span class="cal-warn">fast</span>' : '');
      rows += '<tr class="cal-row' + cls + '" data-pace="' + k + '"><td>' + PACE_LABEL[k] + '</td><td>' +
        PACE_RATE[k][unit === 'in' ? 'in' : 'cm'] + '/wk</td><td>' + r0(cal).toLocaleString() + flag + '</td></tr>';
    });
    $('paceTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
  }

  function solve() {
    var md = model();
    var big = $('resBig'), unitEl = $('resUnit'), sub = $('resSub');
    var detail = $('calDetail'), note = $('calNote');

    if (!md) {
      big.textContent = '—'; unitEl.textContent = '';
      sub.textContent = 'Enter your age, height, weight and activity to see your target.';
      if (detail) detail.style.display = 'none';
      if (note) note.style.display = 'none';
      if ($('advOut')) $('advOut').style.display = 'none';
      return;
    }

    if (detail) detail.style.display = '';
    fillPaceTable(md);

    // determine the active plan: by date (advanced) or by pace
    var weeklyKg, planTxt, dateWeeks = null;
    if (planByDate && dpTarget && dpTarget.getDate() && md.hasGoal && md.dir !== 0) {
      var td = midnight(dpTarget.getDate()), today = midnight(new Date());
      dateWeeks = (td - today) / 6048e5;
      if (dateWeeks > 0) {
        weeklyKg = Math.abs(md.goalKg - md.wKg) / dateWeeks;
        planTxt = 'to reach ' + one(fromKg(md.goalKg)) + ' ' + wU() + ' by ' + fmtD(td);
      }
    }
    if (weeklyKg == null) { weeklyKg = PACES[pace]; planTxt = PACE_LABEL[pace].toLowerCase() + ' pace'; }

    var cal = calForRate(md, weeklyKg);
    var u = unsafe(md, weeklyKg, cal);
    var perDay = weeklyKg * KCAL_PER_KG / 7;

    if (md.dir === 0) {
      big.textContent = r0(md.tdee).toLocaleString(); unitEl.textContent = 'kcal/day';
      sub.textContent = "You're at your goal — this is your maintenance.";
    } else {
      big.textContent = r0(cal).toLocaleString(); unitEl.textContent = 'kcal/day';
      sub.textContent = '≈ ' + r0(perDay).toLocaleString() + ' kcal/day ' + (md.dir === -1 ? 'below' : 'above') +
        ' maintenance · ' + planTxt;
    }

    // safety note
    if (note) {
      if (u === 'below') {
        note.className = 'cal-note warn'; note.style.display = '';
        note.textContent = 'That target is under the ' + floorCal() + ' kcal safe minimum for ' +
          (sex === 'female' ? 'women' : 'men') + '. Choose a gentler pace, or get medical guidance before eating this low.';
      } else if (u === 'fast') {
        note.className = 'cal-note warn'; note.style.display = '';
        note.textContent = md.dir === 1
          ? 'That surplus adds weight faster than about 1% of your bodyweight a week — most of the extra would be fat, not muscle. A gentler pace makes for leaner gains.'
          : 'This loses more than about 1% of your bodyweight per week — faster than most guidelines advise. A gentler pace protects muscle and is easier to sustain.';
      } else { note.style.display = 'none'; }
    }

    // goal line + chart
    var wk = weeksToGoal(md, weeklyKg);
    if ($('calGoal')) {
      if (wk != null) {
        var gd = addDays(midnight(new Date()), Math.round(wk * 7));
        $('calGoal').innerHTML = 'At this rate you reach <strong>' + one(fromKg(md.goalKg)) + ' ' + wU() +
          '</strong> around <strong>' + fmtD(gd) + '</strong> — about ' +
          (wk < 12 ? r0(wk) + ' weeks' : one(wk / 4.345) + ' months') + '.';
        $('calGoal').style.display = '';
      } else if (!md.hasGoal) {
        $('calGoal').innerHTML = 'Add a <strong>goal weight</strong> for a target date and a projected path.';
        $('calGoal').style.display = '';
      } else { $('calGoal').style.display = 'none'; }
    }
    renderChart(md, weeklyKg);

    // protein
    if ($('calProtein')) {
      var pg = 1.8 * md.wKg;
      $('calProtein').innerHTML = 'Protein: aim for about <strong>' + r0(pg) + ' g/day</strong> (1.8 g/kg) to hold on to muscle' +
        (md.dir === -1 ? ' while losing.' : '.');
    }
    if ($('calMaint')) $('calMaint').innerHTML = 'Maintenance (' + md.method + '): <strong>' + r0(md.tdee).toLocaleString() + ' kcal/day</strong>.';

    // advanced macro split
    var advOut = $('advOut');
    if (advanced && advOut) {
      var base = md.dir === 0 ? md.tdee : cal;
      var pk = 1.8 * md.wKg * 4, fk = 0.25 * base, ck = base - pk - fk; if (ck < 0) ck = 0;
      advOut.innerHTML =
        '<div class="macro-head">Daily macros at ' + r0(base).toLocaleString() + ' kcal</div>' +
        '<div class="macro"><span class="k">Protein</span><span class="g">' + r0(pk / 4) + ' g</span><span class="pc">' + Math.round(pk / base * 100) + '%</span></div>' +
        '<div class="macro"><span class="k">Carbs</span><span class="g">' + r0(ck / 4) + ' g</span><span class="pc">' + Math.round(ck / base * 100) + '%</span></div>' +
        '<div class="macro"><span class="k">Fat</span><span class="g">' + r0(fk / 9) + ' g</span><span class="pc">' + Math.round(fk / base * 100) + '%</span></div>' +
        '<p class="res-tip">The 7700 kcal per kg rule is a planning estimate — real loss slows as you go because your body adapts, so re-check every few weeks. For a fuller macro breakdown use the <a href="/tdee-calculator/">TDEE calculator</a>.</p>';
      advOut.style.display = '';
    } else if (advOut) { advOut.style.display = 'none'; }
  }

  var sexSeg = $('sexSeg');
  if (sexSeg) sexSeg.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
    sex = b.getAttribute('data-sex');
    [].forEach.call(sexSeg.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    solve();
  });

  var unitSeg = $('unitSeg');
  if (unitSeg) unitSeg.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
    unit = b.getAttribute('data-unit');
    try { localStorage.setItem('ct_units', unit); } catch (err) {}
    applyUnit(); solve();
  });

  var paceTable = $('paceTable');
  if (paceTable) paceTable.addEventListener('click', function (e) {
    var tr = e.target.closest ? e.target.closest('.cal-row') : null; if (!tr) return;
    pace = tr.getAttribute('data-pace'); planByDate = false;
    if ($('planDateWrap')) { var t = $('planToggle'); if (t) t.checked = false; $('planDateWrap').style.display = 'none'; }
    solve();
  });

  var planToggle = $('planToggle');
  if (planToggle) planToggle.addEventListener('change', function () {
    planByDate = this.checked;
    if ($('planDateWrap')) $('planDateWrap').style.display = planByDate ? '' : 'none';
    solve();
  });

  var advBtn = $('advBtn');
  if (advBtn) advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('advIn').style.display = advanced ? '' : 'none';
    if (!advanced) { planByDate = false; if (planToggle) planToggle.checked = false; if ($('planDateWrap')) $('planDateWrap').style.display = 'none'; }
    solve();
    if (advanced) { var a = $('advIn'); if (a && a.scrollIntoView) a.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });

  [ageIn, heightIn, weightIn, goalIn, bfIn].forEach(function (inp) { if (inp) inp.addEventListener('input', solve); });
  if (actSel) actSel.addEventListener('change', solve);
  if (targetIn) {
    if (window.Datepicker) {
      dpTarget = new Datepicker(targetIn, { format: 'd MM yyyy', autohide: true, weekStart: 0, todayHighlight: true, minDate: new Date() });
      targetIn.addEventListener('changeDate', solve);
    } else {
      targetIn.addEventListener('change', solve);
    }
  }

  function prefersImperial() {
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
  }
  var savedU; try { savedU = localStorage.getItem('ct_units'); } catch (e) {}
  if (cfg.unit === 'in' || cfg.unit === 'cm') unit = cfg.unit;
  else if (savedU === 'in' || savedU === 'cm') unit = savedU;
  else if (prefersImperial()) unit = 'in';
  applyUnit();

  solve();
};

/* -----------------------------------------------------------
   CalcThis.init1RMCalc(cfg) — one-rep-max estimator.
   Independent engine. Enter weight + reps of a working set ->
   estimated 1RM (Epley by default). A %-of-1RM training table
   maps common rep targets to working weights, with the entered
   rep row highlighted. Optional lift selector (bench/squat/…)
   for context only. Advanced: Brzycki + Lombardi + the average
   of the three formulas. lb default for US users, kg elsewhere.
   Live, no button. */
CalcThis.init1RMCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'kg', advanced = false;

  // reps -> % of 1RM (classic strength chart)
  var PCT = [
    { r:1,  p:100 }, { r:2, p:97 }, { r:3, p:94 }, { r:4, p:92 }, { r:5, p:89 },
    { r:6,  p:86 },  { r:7, p:83 }, { r:8, p:81 }, { r:9, p:78 }, { r:10, p:75 },
    { r:12, p:71 },  { r:15, p:67 }
  ];

  var wIn = $('weight'), rIn = $('reps'), liftSel = $('lift');
  if (!wIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function fmtW(x) { var v = r1(x); return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)); }

  var PH = { kg: '60', lb: '135' };
  function applyUnit() {
    var u = unit;
    if ($('uWeight')) $('uWeight').textContent = u;
    if (wIn) wIn.placeholder = PH[u];
    if (unitSeg) [].forEach.call(unitSeg.querySelectorAll('button'), function (x) {
      x.classList.toggle('on', x.getAttribute('data-unit') === u);
    });
  }

  // 1RM formulas (w = weight, r = reps)
  function epley(w, r)   { return r === 1 ? w : w * (1 + r / 30); }
  function brzycki(w, r) { var d = 1.0278 - 0.0278 * r; return d > 0 ? w / d : NaN; }
  function lombardi(w, r){ return w * Math.pow(r, 0.10); }

  function fillPctTable(orm, reps) {
    var u = unit;
    var head = '<thead><tr><th>Reps</th><th>% of 1RM</th><th>Weight</th></tr></thead>';
    var rows = '';
    PCT.forEach(function (row) {
      var cur = (isFinite(reps) && reps === row.r) ? ' class="cur"' : '';
      var wt = (orm != null) ? fmtW(orm * row.p / 100) + ' ' + u : '—';
      rows += '<tr' + cur + '><td>' + row.r + '</td><td>' + row.p + '%</td><td>' + wt + '</td></tr>';
    });
    $('pctTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
  }

  function solve() {
    var w = num(wIn.value), r = num(rIn ? rIn.value : NaN);
    var resBig = $('resBig'), resUnit = $('resUnit'), resSub = $('resSub');
    var ok = isFinite(w) && w > 0 && isFinite(r) && r >= 1 && r <= 15;

    if (!ok) {
      resBig.textContent = '—'; resUnit.textContent = '';
      resSub.textContent = (isFinite(r) && r > 15)
        ? 'Estimates are reliable up to about 15 reps — use a heavier set.'
        : 'Enter the weight and reps of a set to estimate your 1RM.';
      fillPctTable(null, NaN);
      if ($('advOut')) {
        if (advanced) {
          $('advOut').innerHTML = '<div class="orm-head">By formula</div>' +
            '<p class="res-tip">Enter a weight and reps above to compare the Epley, Brzycki and Lombardi estimates side by side.</p>';
          $('advOut').style.display = '';
        } else {
          $('advOut').style.display = 'none';
        }
      }
      return;
    }

    var epl = epley(w, r);
    resBig.textContent = fmtW(epl); resUnit.textContent = unit;
    var lift = liftSel && liftSel.value ? liftSel.value : '';
    resSub.textContent = (lift ? lift + ' · ' : '') + 'Epley estimate from ' + fmtW(w) + ' ' + unit + ' × ' + r;
    fillPctTable(epl, r);

    var advOut = $('advOut');
    if (advanced && advOut) {
      var br = brzycki(w, r), lo = lombardi(w, r);
      var vals = [epl, br, lo].filter(function (x) { return isFinite(x) && x > 0; });
      var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      advOut.innerHTML =
        '<div class="orm-head">By formula</div>' +
        '<div class="bf-cmp"><span class="k">Epley</span><span class="v">' + fmtW(epl) + ' ' + unit + '</span></div>' +
        '<div class="bf-cmp"><span class="k">Brzycki</span><span class="v">' + (isFinite(br) ? fmtW(br) + ' ' + unit : '—') + '</span></div>' +
        '<div class="bf-cmp"><span class="k">Lombardi</span><span class="v">' + fmtW(lo) + ' ' + unit + '</span></div>' +
        '<div class="bf-cmp"><span class="k">Average</span><span class="v">' + fmtW(avg) + ' ' + unit + '</span></div>' +
        '<p class="res-tip">Different formulas weight reps differently, so they diverge on high-rep sets. The hero uses Epley; the average is a reasonable middle. All are estimates — the only true 1RM is a tested single.</p>';
      advOut.style.display = '';
    } else if (advOut) {
      advOut.style.display = 'none';
    }
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
      solve();
    });
  }

  [wIn, rIn].forEach(function (inp) { if (inp) inp.addEventListener('input', solve); });
  if (liftSel) liftSel.addEventListener('change', solve);

  function prefersImperial() {
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
  }
  if (cfg.unit === 'lb' || cfg.unit === 'kg') unit = cfg.unit;
  else if (prefersImperial()) unit = 'lb';
  applyUnit();

  solve();
};
/* -----------------------------------------------------------
   CalcThis.initSleepCalc(cfg) — sleep-cycle bedtime / wake-time planner.
   Independent engine (modeled on HRZone). Uses ~90-minute sleep cycles
   plus a ~15-minute fall-asleep buffer. Two modes:
     wake  — "I want to wake up at [time]"  -> ideal BEDTIMES
     sleep — "I'm going to sleep at [time]" -> ideal WAKE-UP times
   Outputs 4 options (6/5/4/3 cycles = 9h/7.5h/6h/4.5h); the recommended
   7.5–9 h rows (5–6 cycles) are highlighted. Times only — no unit system,
   no location logic. Live, no button. */
CalcThis.initSleepCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var mode = 'wake';                     // 'wake' | 'sleep'
  var CYCLE = 90, BUFFER = 15;           // minutes
  var OPTS = [6, 5, 4, 3];               // cycle counts, most sleep first
  var band = 'adult';                    // 'kid' | 'teen' | 'adult' | 'older'
  var meridiem = 'am';                    // 'am' | 'pm' | '24'

  // NSF/CDC recommended nightly sleep by age band (hours). Reaffirmed 2026.
  // rec = which whole 90-min cycle counts (of OPTS) fall inside the band.
  var BANDS = {
    kid:   { label: 'Kid',          lo: 9, hi: 11, note: 'kids 6\u201312',    rec: [6] },
    teen:  { label: 'Teen',         lo: 8, hi: 10, note: 'teens 13\u201317',  rec: [6] },
    adult: { label: 'Adult',        lo: 7, hi: 9,  note: 'adults 18\u201364', rec: [5, 6] },
    older: { label: 'Older adult',  lo: 7, hi: 8,  note: 'older adults 65+',  rec: [5] }
  };
  function isRec(c) { return BANDS[band].rec.indexOf(c) !== -1; }

  var timeIn = $('timeIn'), modeSeg = $('modeSeg'),
      nowBtn = $('nowBtn'), timeLab = $('timeLab'), ageSel = $('ageSel'),
      apSeg = $('apSeg'), clockIc = $('clockIc'), ghostEl = $('timeGhost');
  if (!timeIn) return;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function is24() { return meridiem === '24'; }

  // Group the raw digits into an hour/minute pair for a fixed HH:MM mask.
  // Smart hour: a leading digit that can't start a valid 2-digit hour
  // (>2 in 24h, >1 in 12h) is treated as a complete single-digit hour and padded.
  function splitDigits(raw) {
    var d = ('' + raw).replace(/\D/g, '').slice(0, 4);
    if (!d) return { empty: true };
    var maxFirst = is24() ? '2' : '1';
    if (d[0] > maxFirst) return { hDig: '0' + d[0], mDig: d.slice(1, 3), hourDone: true };
    if (d.length === 1) return { hDig: d, mDig: '', hourDone: false };
    return { hDig: d.slice(0, 2), mDig: d.slice(2, 4), hourDone: true };
  }

  // Reformat the field to the masked "HH:MM" (partial ok) and repaint the ghost scaffold.
  function refresh() {
    var s = splitDigits(timeIn.value);
    var val = s.empty ? '' : (s.hourDone ? s.hDig + ':' + s.mDig : s.hDig);
    if (val !== timeIn.value) timeIn.value = val;
    if (!ghostEl) return;
    var hc = s.empty ? '' : s.hDig, mc = s.empty ? '' : s.mDig;
    var cells = [hc[0], hc[1], ':', mc[0], mc[1]], html = '';
    for (var i = 0; i < 5; i++) {
      if (i === 2) html += '<span class="g-sep">:</span>';
      else if (cells[i] != null) html += '<span class="g-on">' + cells[i] + '</span>';
      else html += '<span class="g-off">-</span>';
    }
    ghostEl.innerHTML = html;
  }

  // Field value + current meridiem -> minutes since midnight, or NaN.
  function parseTime() {
    var s = splitDigits(timeIn.value);
    if (s.empty) return NaN;
    var h = +s.hDig;
    var md = s.mDig, m = md.length === 0 ? 0 : (md.length === 1 ? (+md) * 10 : +md);
    if (m > 59) return NaN;
    if (is24()) { if (h > 23) return NaN; return h * 60 + m; }
    if (h < 1 || h > 12) return NaN;      // 12-hour clock
    var base = h % 12;                    // 12 -> 0
    if (meridiem === 'pm') base += 12;
    return base * 60 + m;
  }

  function applyMeridiem() {
    if (apSeg) [].forEach.call(apSeg.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', b.getAttribute('data-ap') === meridiem);
    });
  }

  // Fill the field with the current local time, honoring the active meridiem mode.
  function setNow() {
    var d = new Date(), H = d.getHours(), M = d.getMinutes();
    if (is24()) {
      timeIn.value = pad(H) + ':' + pad(M);
    } else {
      meridiem = H < 12 ? 'am' : 'pm'; applyMeridiem();
      var h12 = H % 12; if (h12 === 0) h12 = 12;
      timeIn.value = pad(h12) + ':' + pad(M);
    }
    refresh();
  }

  // minutes since midnight -> "HH:MM" (24h mode) or "h:MM AM/PM" (12h modes)
  function fmtClock(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60), mi = mins % 60;
    if (is24()) return pad(h) + ':' + pad(mi);
    var ap = h < 12 ? 'AM' : 'PM', h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + pad(mi) + ' ' + ap;
  }
  function fmtDur(cycles) {
    var h = cycles * 1.5;                 // 90 min = 1.5 h
    return (h % 1 === 0 ? h.toFixed(0) : h.toFixed(1)) + ' h';
  }

  function applyModeLabels() {
    if (timeLab) timeLab.textContent = mode === 'wake'
      ? 'I want to wake up at' : 'I\u2019m going to sleep at';
    if (nowBtn) nowBtn.style.display = mode === 'sleep' ? '' : 'none';
    if (modeSeg) [].forEach.call(modeSeg.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', b.getAttribute('data-mode') === mode);
    });
  }

  function timeFor(base, cycles) {
    return mode === 'wake'
      ? base - (cycles * CYCLE + BUFFER)
      : base + BUFFER + cycles * CYCLE;
  }

  function solve() {
    var base = parseTime();
    var resBig = $('resBig'), resUnit = $('resUnit'),
        resLab = $('resLab'), resSub = $('resSub');
    resLab.textContent = mode === 'wake' ? 'Ideal bedtime' : 'Ideal wake-up time';
    if (ageSel && ageSel.value !== band && BANDS[ageSel.value]) band = ageSel.value;

    if (!isFinite(base)) {
      resBig.textContent = '\u2014'; resUnit.textContent = '';
      resSub.textContent = mode === 'wake'
        ? 'Enter the time you need to wake up to see when to head to bed.'
        : 'Enter the time you\u2019ll go to sleep — or tap Now — to see when to wake up.';
      $('sleepTable').innerHTML = '';
      return;
    }

    var b = BANDS[band];
    var top = b.rec[b.rec.length - 1], bot = b.rec[0];   // top = most cycles recommended
    var hero = timeFor(base, top);
    resBig.textContent = fmtClock(hero); resUnit.textContent = '';
    var range = (bot === top)
      ? fmtDur(top) + ' (' + top + ' cycles)'
      : fmtDur(bot) + '\u2013' + fmtDur(top) + ' (' + bot + '\u2013' + top + ' cycles)';
    resSub.textContent = (mode === 'wake' ? 'Lights out here' : 'Set your alarm here') +
      ' for ' + range + ' \u2014 the target for ' + b.note + '. More options below.';

    var col1 = mode === 'wake' ? 'Go to bed at' : 'Wake up at';
    var head = '<thead><tr><th>' + col1 + '</th><th>Sleep</th><th>Cycles</th></tr></thead>';
    var rows = '';
    OPTS.forEach(function (c) {
      var cur = isRec(c) ? ' class="cur"' : '';
      rows += '<tr' + cur + '><td>' + fmtClock(timeFor(base, c)) + '</td><td>' +
        fmtDur(c) + '</td><td>' + c + '</td></tr>';
    });
    $('sleepTable').innerHTML = head + '<tbody>' + rows + '</tbody>';
  }

  if (modeSeg) {
    modeSeg.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
      var m = b.getAttribute('data-mode'); if (!m || m === mode) return;
      mode = m;
      // entering "sleep" mode with an empty field: prefill current time ("sleep now")
      if (mode === 'sleep' && timeIn.value.trim() === '') setNow();
      applyModeLabels();
      solve();
    });
  }
  if (apSeg) {
    apSeg.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
      var to = b.getAttribute('data-ap'); if (!to || to === meridiem) return;
      var from = meridiem;
      // am <-> pm: keep the dial digits, just flip the meaning (7:30 AM <-> 7:30 PM).
      if (from !== '24' && to !== '24') {
        meridiem = to; applyMeridiem(); solve(); return;
      }
      var mins = parseTime();                 // parsed under the OLD mode
      if (to === '24') {                      // 12h -> 24h: absolute time
        meridiem = to;
        if (isFinite(mins)) timeIn.value = pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
      } else {                                // 24h -> am/pm: keep the dial reading, honor the clicked side
        var s = splitDigits(timeIn.value);    // still under 24h
        meridiem = to;                        // ALWAYS the button the user pressed
        if (!s.empty) {
          var H = +s.hDig, h12 = H % 12; if (h12 === 0) h12 = 12;
          var md = s.mDig, mm = md.length === 0 ? '00' : (md.length === 1 ? md + '0' : md);
          timeIn.value = pad(h12) + ':' + mm;
        }
      }
      applyMeridiem(); refresh(); solve();
    });
  }
  if (clockIc) clockIc.addEventListener('click', function () { timeIn.focus(); });
  if (nowBtn) nowBtn.addEventListener('click', function () { setNow(); solve(); });
  if (ageSel) ageSel.addEventListener('change', function () {
    if (BANDS[ageSel.value]) band = ageSel.value; solve();
  });
  timeIn.addEventListener('input', function () { refresh(); solve(); });

  applyMeridiem();
  refresh();
  applyModeLabels();
  solve();
};

/* -----------------------------------------------------------
   CalcThis.initPredictorCalc(cfg) — race time predictor.
   Independent engine. Reuses pace's formatting *patterns* (hms /
   paceStr / trimNum re-implemented locally — no shared global state).
   From one recent race (distance + time) it predicts finish times for
   every standard distance with TWO models side by side:
     • Riegel:  T2 = T1 * (D2/D1)^1.06
     • VDOT (Daniels/Gilbert): VO2 cost + %VO2max drop, solved by
       bisection for the target-distance time.
   Simple mode = full prediction table + VDOT fitness score + speed.
   Advanced = per-km/mi even splits for a chosen target + pace cross-link.
   Internal units: distance km, time seconds, pace sec/km. Live, no button. */
CalcThis.initPredictorCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var KM_PER_MI = 1.609344;
  var PRESET = { '5k': 5, '10k': 10, 'half': 21.0975, 'marathon': 42.195, 'mile': 1.609344 };

  var unit = 'km';            // km | mi — display distance + predicted pace
  var advanced = false;
  var splitTarget = 'marathon';
  var last = null;           // {d1km, t1sec, vdot}

  var distIn = $('distVal'), hIn = $('h'), mIn = $('m'), sIn = $('s'),
      distChips = $('distChips');
  if (!distIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function pad(n) { n = Math.round(n); return (n < 10 ? '0' : '') + n; }
  function hms(sec) {
    if (!isFinite(sec) || sec <= 0) return '\u2014';
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
  }
  function paceStr(secPerKm, u) {
    if (!isFinite(secPerKm) || secPerKm <= 0) return '\u2014';
    var per = u === 'mi' ? secPerKm * KM_PER_MI : secPerKm;
    var m = Math.floor(per / 60), s = Math.round(per % 60);
    if (s === 60) { m++; s = 0; }
    return m + ':' + pad(s);
  }
  function trimNum(n, d) {
    if (!isFinite(n)) return '\u2014';
    return (n.toFixed(d == null ? 2 : d)).replace(/\.?0+$/, '');
  }

  function readD1km() {
    var v = num(distIn.value);
    if (isNaN(v) || v <= 0) return NaN;
    return unit === 'mi' ? v * KM_PER_MI : v;
  }
  function readT1sec() {
    var h = num(hIn.value), m = num(mIn.value), s = num(sIn.value);
    var t = (isNaN(h) ? 0 : h) * 3600 + (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
    return t > 0 ? t : NaN;
  }

  // ---- models ----
  function riegel(t1sec, d1km, d2km) { return t1sec * Math.pow(d2km / d1km, 1.06); }

  function vo2cost(vMpMin) { return -4.60 + 0.182258 * vMpMin + 0.000104 * vMpMin * vMpMin; }
  function pctMax(tMin) {
    return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);
  }
  function vdotFrom(d1km, t1sec) {
    var meters = d1km * 1000, tMin = t1sec / 60, v = meters / tMin;
    return vo2cost(v) / pctMax(tMin);
  }
  function predictVdot(vdot, d2km, seedSec) {
    var meters = d2km * 1000;
    function g(tSec) { var tMin = tSec / 60, v = meters / tMin; return vo2cost(v) / pctMax(tMin) - vdot; }
    var lo = Math.max(3, seedSec * 0.35), hi = seedSec * 2.8, i;
    for (i = 0; i < 80 && g(lo) < 0; i++) lo *= 0.7;   // push lo until g(lo) > 0
    for (i = 0; i < 80 && g(hi) > 0; i++) hi *= 1.4;   // push hi until g(hi) < 0
    for (i = 0; i < 90; i++) { var mid = (lo + hi) / 2; if (g(mid) > 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  var TARGETS = [
    { key: 'mile', label: '1 mi', km: 1.609344 },
    { key: '5k', label: '5K', km: 5 },
    { key: '10k', label: '10K', km: 10 },
    { key: 'half', label: 'Half', km: 21.0975 },
    { key: 'marathon', label: 'Marathon', km: 42.195 }
  ];

  function renderTable(d1km, t1sec, vdot) {
    var body = '';
    TARGETS.forEach(function (f) {
      var rieg = riegel(t1sec, d1km, f.km);
      var vd = predictVdot(vdot, f.km, rieg);
      var pKm = vd / f.km;
      var isInput = Math.abs(f.km - d1km) < 0.01;
      var cur = isInput ? ' class="cur"' : '';
      body += '<tr' + cur + '><td>' + f.label + (isInput ? ' <span class="zsub">your race</span>' : '') +
        '</td><td>' + hms(rieg) + '</td><td>' + hms(vd) + '</td><td>' +
        paceStr(pKm, unit) + '/' + (unit === 'mi' ? 'mi' : 'km') + '</td></tr>';
    });
    $('predTable').innerHTML =
      '<thead><tr><th>Distance</th><th>Riegel</th><th>VDOT</th><th>Pace \u00b7 VDOT</th></tr></thead><tbody>' +
      body + '</tbody>';
  }

  function renderSplits(vdot, d1km, t1sec) {
    var tgt = null, i;
    for (i = 0; i < TARGETS.length; i++) if (TARGETS[i].key === splitTarget) tgt = TARGETS[i];
    if (!tgt) tgt = TARGETS[4];
    var rieg = riegel(t1sec, d1km, tgt.km);
    var predSec = predictVdot(vdot, tgt.km, rieg);
    var pKm = predSec / tgt.km;                       // sec per km (even)
    var totUnit = tgt.km / (unit === 'mi' ? KM_PER_MI : 1);
    var avgPer = pKm * (unit === 'mi' ? KM_PER_MI : 1); // sec per split unit
    var segN = Math.max(1, Math.ceil(totUnit - 1e-9));
    var rows = '', cum = 0, distAcc = 0;
    for (i = 0; i < segN; i++) {
      var len = (i === segN - 1) ? (totUnit - (segN - 1)) : 1;
      if (len <= 1e-6) len = 1;
      var t = avgPer * len; cum += t; distAcc += len;
      rows += '<tr><td>' + trimNum(distAcc, 2) + ' ' + (unit === 'mi' ? 'mi' : 'km') + '</td><td>' +
        paceStr(pKm, unit) + '</td><td>' + hms(t) + '</td><td>' + hms(cum) + '</td></tr>';
    }
    $('splitTable').innerHTML =
      '<thead><tr><th>Distance</th><th>Pace</th><th>Split</th><th>Elapsed</th></tr></thead><tbody>' +
      rows + '</tbody>';
    $('splitMeta').textContent = tgt.label + ' \u00b7 VDOT \u00b7 even pace \u00b7 ' + hms(predSec);
  }

  function solve() {
    var d1km = readD1km(), t1sec = readT1sec();
    var ok = isFinite(d1km) && d1km > 0 && isFinite(t1sec) && t1sec > 0;

    var resBig = $('resBig'), resUnit = $('resUnit'), resLab = $('resLab'), resSub = $('resSub');
    var predWrap = $('predWrap'), tipEl = $('predTip');

    if (!ok) {
      resLab.textContent = 'Your fitness score';
      resBig.textContent = '\u2014'; resUnit.textContent = '';
      resSub.textContent = 'Enter a recent race distance and time.';
      $('predTable').innerHTML = '';
      if (predWrap) predWrap.style.display = 'none';
      if (tipEl) tipEl.style.display = 'none';
      if ($('splitWrap')) $('splitWrap').style.display = 'none';
      var mb0 = $('mBig'); if (mb0) { mb0.textContent = '\u2014'; $('mUnit').textContent = ''; $('mSpeed').textContent = ''; }
      last = null;
      return;
    }

    var vdot = vdotFrom(d1km, t1sec);
    var pKm = t1sec / d1km;
    last = { d1km: d1km, t1sec: t1sec, vdot: vdot };

    resLab.textContent = 'Your fitness score (VDOT)';
    resBig.textContent = trimNum(vdot, 1);
    resUnit.textContent = 'VDOT';
    resSub.textContent = 'From ' + trimNum(unit === 'mi' ? d1km / KM_PER_MI : d1km, 2) + ' ' +
      (unit === 'mi' ? 'mi' : 'km') + ' in ' + hms(t1sec) + ' \u00b7 ' +
      paceStr(pKm, unit) + '/' + (unit === 'mi' ? 'mi' : 'km');

    renderTable(d1km, t1sec, vdot);
    if (predWrap) predWrap.style.display = '';
    if (tipEl) tipEl.style.display = '';

    // mobile bar: VDOT + marathon prediction
    var marSec = predictVdot(vdot, 42.195, riegel(t1sec, d1km, 42.195));
    var mb = $('mBig'); if (mb) { mb.textContent = trimNum(vdot, 1); $('mUnit').textContent = 'VDOT'; $('mSpeed').textContent = 'Marathon ' + hms(marSec); }

    if (advanced) { renderSplits(vdot, d1km, t1sec); $('splitWrap').style.display = ''; }
  }

  // ---- wiring ----
  function seg(id, attr, fn) {
    var box = $(id); if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(box.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on'); fn(b.getAttribute(attr));
    });
  }

  function clearChips() { [].forEach.call(distChips.querySelectorAll('button'), function (b) { b.classList.remove('on'); }); }

  seg('distUnitSeg', 'data-du', function (v) {
    if (v === unit) return;
    var km = readD1km();
    unit = v;
    [].forEach.call(document.querySelectorAll('[data-du]'), function (el) {
      if (el.tagName !== 'BUTTON') el.textContent = unit === 'mi' ? 'mi' : 'km';
    });
    if (isFinite(km) && km > 0) distIn.value = trimNum(unit === 'mi' ? km / KM_PER_MI : km, 3);
    clearChips(); solve();
  });

  distChips.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    clearChips(); b.classList.add('on');
    var km = PRESET[b.getAttribute('data-p')];
    distIn.value = trimNum(unit === 'mi' ? km / KM_PER_MI : km, 3);
    solve();
  });

  seg('splitSeg', 'data-tg', function (v) { splitTarget = v; if (advanced) solve(); });

  [distIn, hIn, mIn, sIn].forEach(function (inp) {
    if (!inp) return;
    inp.addEventListener('input', function () { if (inp === distIn) clearChips(); solve(); });
  });

  var advBtn = $('advBtn');
  if (advBtn) {
    advBtn.addEventListener('click', function () {
      advanced = !advanced;
      advBtn.classList.toggle('open', advanced);
      $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
      $('advIn').style.display = advanced ? '' : 'none';
      if (!advanced) { $('splitWrap').style.display = 'none'; }
      solve();
      if (advanced) { var sw = $('splitWrap'); if (sw && sw.scrollIntoView) sw.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
  }

  solve();
};

/* -----------------------------------------------------------
   CalcThis.initVO2MaxCalc(cfg) — VO2 max estimator.
   Independent engine. Two methods:
     rhr  — resting heart rate: VO2max = 15.3 * (HRmax/HRrest),
            HRmax = 208 - 0.7*age (Tanaka, same as Heart Rate Zone calc).
     walk — 1-mile walk test (Kline/Rockport): VO2max = 132.853 -
            0.0769*lb - 0.3877*age + 6.315*sexM - 3.2649*min - 0.1565*hr.
   Differentiator: a live percentile gauge against Cooper Institute
   age+sex norms (quartile bands), plus (Go advanced) equivalent race
   times reusing the exact VDOT solver from Race Time Predictor
   (vo2cost/pctMax/predictVdot re-implemented locally — no shared
   global state, same pattern as initPredictorCalc itself uses).
   Live, no button. */
CalcThis.initVO2MaxCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var sex = 'female', method = 'rhr', unit = 'imp', advanced = false;

  // Cooper Institute / ACSM norms, ml/kg/min: [p10, p25, p50, p75, p90] per age band
  var NORMS = {
    male: {
      20: [32.1, 40.1, 48.0, 55.2, 61.8], 30: [30.2, 35.9, 42.4, 49.2, 56.5],
      40: [26.8, 31.9, 37.8, 45.0, 52.1], 50: [22.8, 27.1, 32.6, 39.7, 45.6],
      60: [19.8, 23.7, 28.2, 34.5, 40.3], 70: [17.1, 20.4, 24.4, 30.4, 36.6]
    },
    female: {
      20: [23.9, 30.5, 37.6, 44.7, 51.3], 30: [20.9, 25.3, 30.2, 36.1, 41.4],
      40: [18.8, 22.1, 26.7, 32.4, 38.4], 50: [17.3, 19.9, 23.4, 27.6, 32.0],
      60: [14.6, 17.2, 20.0, 23.8, 27.0], 70: [13.6, 15.6, 18.3, 20.8, 23.1]
    }
  };
  var SCALE_MIN = 10, SCALE_MAX = 68;
  var CATS = [
    { name: 'Below average', cls: 0 },
    { name: 'Average', cls: 1 },
    { name: 'Good', cls: 2 },
    { name: 'Excellent', cls: 3 }
  ];
  var BAND_COLORS = ['#8F5C13', '#B5761F', '#5A7361', '#37503F'];

  var ageIn = $('vxAge'), rhrIn = $('vxRhr'), weightIn = $('vxWeight'),
      walkMIn = $('vxWalkM'), walkSIn = $('vxWalkS'), walkHRIn = $('vxWalkHR');
  if (!ageIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function normRow(age) {
    var band = Math.floor(Math.max(20, Math.min(79, age)) / 10) * 10;
    if (band > 70) band = 70;
    return NORMS[sex][band];
  }
  function catFor(vo2, row) {
    if (vo2 < row[1]) return CATS[0];
    if (vo2 < row[2]) return CATS[1];
    if (vo2 < row[3]) return CATS[2];
    return CATS[3];
  }

  // ---- VDOT solver, copied from initPredictorCalc (self-contained, no shared state) ----
  function vo2cost(vMpMin) { return -4.60 + 0.182258 * vMpMin + 0.000104 * vMpMin * vMpMin; }
  function pctMax(tMin) {
    return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);
  }
  function predictVdot(vdot, d2km, seedSec) {
    var meters = d2km * 1000;
    function g(tSec) { var tMin = tSec / 60, v = meters / tMin; return vo2cost(v) / pctMax(tMin) - vdot; }
    var lo = Math.max(3, seedSec * 0.35), hi = seedSec * 2.8, i;
    for (i = 0; i < 80 && g(lo) < 0; i++) lo *= 0.7;
    for (i = 0; i < 80 && g(hi) > 0; i++) hi *= 1.4;
    for (i = 0; i < 90; i++) { var mid = (lo + hi) / 2; if (g(mid) > 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  function hms(sec) {
    if (!isFinite(sec) || sec <= 0) return '—';
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
  }
  var RACE_TARGETS = [
    { label: '5K', km: 5 }, { label: '10K', km: 10 },
    { label: 'Half', km: 21.0975 }, { label: 'Marathon', km: 42.195 }
  ];

  function computeRhr(age, rhr) {
    var hrMax = 208 - 0.7 * age;
    return 15.3 * (hrMax / rhr);
  }
  function computeWalk(age, isMale, weightLb, walkMin, hr) {
    return 132.853 - 0.0769 * weightLb - 0.3877 * age + 6.315 * (isMale ? 1 : 0) -
      3.2649 * walkMin - 0.1565 * hr;
  }

  function renderGauge(vo2, row) {
    var gauge = $('vxGauge'), marker = $('vxMarker'), bar = $('vxBar'), ticks = $('vxTicks');
    if (!gauge) return;
    gauge.style.visibility = 'visible';
    var edges = [SCALE_MIN, row[1], row[2], row[3], SCALE_MAX];
    var stops = [];
    for (var i = 0; i < 4; i++) {
      var p0 = (edges[i] - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      var p1 = (edges[i + 1] - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      stops.push(BAND_COLORS[i] + ' ' + p0 + '%', BAND_COLORS[i] + ' ' + p1 + '%');
    }
    bar.style.background = 'linear-gradient(to right,' + stops.join(',') + ')';
    var pct = (vo2 - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
    marker.style.left = Math.max(0, Math.min(100, pct)) + '%';
    var tickVals = [row[0], row[1], row[2], row[3], row[4]];
    var html = '';
    tickVals.forEach(function (v) {
      var p = (v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      html += '<span style="left:' + p + '%">' + Math.round(v) + '</span>';
    });
    ticks.innerHTML = html;
  }

  function renderRaceTable(vo2) {
    var wrap = $('vxAdvOut'); if (!wrap) return;
    if (!advanced) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    var body = '';
    RACE_TARGETS.forEach(function (t) {
      var seedSec = t.km * 300; // universal wide-bracket seed, 5 min/km
      var sec = predictVdot(vo2, t.km, seedSec);
      body += '<tr><td>' + t.label + '</td><td>' + hms(sec) + '</td></tr>';
    });
    $('vxRaceTable').innerHTML =
      '<thead><tr><th>Distance</th><th>Estimated time</th></tr></thead><tbody>' + body + '</tbody>';
  }

  function solve() {
    var age = num(ageIn.value);
    var resBig = $('vxResBig'), resSub = $('vxResSub'), catEl = $('vxCat');
    var ageOk = isFinite(age) && age >= 10 && age <= 99;
    var vo2 = NaN;

    if (ageOk && method === 'rhr') {
      var rhr = num(rhrIn.value);
      if (isFinite(rhr) && rhr > 0) vo2 = computeRhr(age, rhr);
    } else if (ageOk && method === 'walk') {
      var wRaw = num(weightIn.value), wLb = isFinite(wRaw) ? (unit === 'met' ? wRaw * 2.2046226 : wRaw) : NaN;
      var wm = num(walkMIn.value), ws = num(walkSIn.value), hr = num(walkHRIn.value);
      var walkMin = (isNaN(wm) ? 0 : wm) + (isNaN(ws) ? 0 : ws) / 60;
      if (isFinite(wLb) && wLb > 0 && walkMin > 0 && isFinite(hr) && hr > 0) {
        vo2 = computeWalk(age, sex === 'male', wLb, walkMin, hr);
      }
    }

    if (!(isFinite(vo2) && vo2 > 0)) {
      resBig.textContent = '—';
      resSub.textContent = method === 'rhr' ? 'Enter your age and resting heart rate.' :
        'Enter your age, weight, walk time and finishing heart rate.';
      if ($('vxGauge')) $('vxGauge').style.visibility = 'hidden';
      if (catEl) catEl.innerHTML = '';
      if ($('vxAdvOut')) $('vxAdvOut').style.display = 'none';
      return;
    }

    var row = normRow(age);
    var cat = catFor(vo2, row);
    resBig.textContent = one(vo2);
    $('vxResUnit').textContent = 'ml/kg/min';
    resSub.textContent = method === 'rhr' ? 'Resting heart rate method' : '1-mile walk test method';
    catEl.innerHTML = 'Fitness category: <strong>' + cat.name + '</strong> for a ' +
      Math.floor(Math.max(20, Math.min(79, age)) / 10) * 10 + 's ' + sex;
    renderGauge(vo2, row);
    renderRaceTable(vo2);
  }

  function seg(id, attr, fn) {
    var box = $(id); if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(box.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on'); fn(b.getAttribute(attr));
    });
  }

  seg('vxSexSeg', 'data-sex', function (v) { sex = v; solve(); });
  seg('vxMethodSeg', 'data-m', function (v) {
    method = v;
    $('vxRhrIn').style.display = v === 'rhr' ? '' : 'none';
    $('vxWalkIn').style.display = v === 'walk' ? '' : 'none';
    solve();
  });
  seg('vxUnitSeg', 'data-u', function (v) {
    if (v === unit) return;
    var w = num(weightIn.value);
    unit = v;
    $('vxWUnit').textContent = unit === 'met' ? 'kg' : 'lb';
    if (isFinite(w) && w > 0) {
      weightIn.value = Math.round(unit === 'met' ? w / 2.2046226 : w * 2.2046226);
    }
    solve();
  });

  [ageIn, rhrIn, weightIn, walkMIn, walkSIn, walkHRIn].forEach(function (inp) {
    if (!inp) return;
    inp.addEventListener('input', solve);
  });

  var advBtn = $('vxAdvBtn');
  if (advBtn) {
    advBtn.addEventListener('click', function () {
      advanced = !advanced;
      advBtn.classList.toggle('open', advanced);
      $('vxAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
      $('vxAdvIn').style.display = advanced ? '' : 'none';
      if (!advanced) {
        method = 'rhr';
        $('vxRhrIn').style.display = '';
        $('vxWalkIn').style.display = 'none';
        var mseg = $('vxMethodSeg');
        if (mseg) [].forEach.call(mseg.querySelectorAll('button'), function (b) {
          b.classList.toggle('on', b.getAttribute('data-m') === 'rhr');
        });
      }
      solve();
    });
  }

  solve();
};

/* -----------------------------------------------------------
   CalcThis.initDateCalc(cfg) — date calculator.
   Independent engine. Two modes:
     between  — days / weeks / months / years between two dates,
                with a live span bar (month gridlines, weekend
                shading in business-day mode, a "today" marker),
                the weekday + day-of-year of each date, and totals.
                Advanced: business days only + exclude US federal
                holidays.
     addsub   — add or subtract years / months / weeks / days from
                a start date; returns the resulting date, its
                weekday and day-of-year, on the same span bar.
   Reuses the vendored vanillajs-datepicker. Live, no button. */
CalcThis.initDateCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  var mode = 'between', op = 'add', advanced = false;
  var dpFrom = null, dpTo = null, dpStart = null;
  var holCache = {};

  var fromIn = $('fromDate'), toIn = $('toDate'), startIn = $('startDate');
  var yIn = $('addY'), moIn = $('addMo'), wIn = $('addW'), dIn = $('addD');
  var incEnd = $('incEnd'), bizOnly = $('bizOnly'), exclHol = $('exclHol');
  if (!fromIn) return;

  function midnight(dt) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()); }
  function addDays(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n); }
  function diffDays(a, b) { return Math.round((midnight(b) - midnight(a)) / 86400000); }
  function isoOf(dt) { return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2); }
  function fmtD(d) { return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtShort(d) { return d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
  function num(v) { var n = parseInt(('' + v).trim(), 10); return isNaN(n) || n < 0 ? 0 : n; }
  function dayOfYear(d) { return diffDays(new Date(d.getFullYear(), 0, 1), d) + 1; }

  function parseD(v) {
    if (!v) return null;
    var p = ('' + v).split('-');
    if (p.length !== 3) return null;
    var y = +p[0], m = +p[1], d = +p[2];
    if (!(y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }
  function picked(dp, inp) {
    if (dp) { var d = dp.getDate(); return d ? midnight(d) : null; }
    return parseD(inp ? inp.value : '');
  }

  function ymd(from, to) {
    var y = to.getFullYear() - from.getFullYear();
    var m = to.getMonth() - from.getMonth();
    var d = to.getDate() - from.getDate();
    if (d < 0) { m--; d += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d };
  }
  function ymdStr(o) {
    var parts = [];
    if (o.y) parts.push(o.y + (o.y === 1 ? ' year' : ' years'));
    if (o.m) parts.push(o.m + (o.m === 1 ? ' month' : ' months'));
    parts.push(o.d + (o.d === 1 ? ' day' : ' days'));
    return parts.join(', ');
  }

  // ---- US federal holidays (observed), computed per year ----
  function usHolidays(year) {
    function nth(month, weekday, n) {
      var first = new Date(year, month, 1);
      var add = (weekday - first.getDay() + 7) % 7;
      return new Date(year, month, 1 + add + (n - 1) * 7);
    }
    function last(month, weekday) {
      var eom = new Date(year, month + 1, 0);
      var sub = (eom.getDay() - weekday + 7) % 7;
      return new Date(year, month + 1, 0 - sub);
    }
    function obs(d) { var wd = d.getDay(); if (wd === 0) return addDays(d, 1); if (wd === 6) return addDays(d, -1); return d; }
    return [
      obs(new Date(year, 0, 1)),   // New Year's Day
      nth(0, 1, 3),                // MLK Day
      nth(1, 1, 3),                // Presidents' Day
      last(4, 1),                  // Memorial Day
      obs(new Date(year, 5, 19)),  // Juneteenth
      obs(new Date(year, 6, 4)),   // Independence Day
      nth(8, 1, 1),                // Labor Day
      nth(9, 1, 2),                // Columbus Day
      obs(new Date(year, 10, 11)), // Veterans Day
      nth(10, 4, 4),               // Thanksgiving
      obs(new Date(year, 11, 25))  // Christmas Day
    ].map(function (d) { return midnight(d).getTime(); });
  }
  function isHoliday(d) {
    var y = d.getFullYear();
    if (!holCache[y]) holCache[y] = usHolidays(y);
    return holCache[y].indexOf(midnight(d).getTime()) >= 0;
  }

  // count business / weekend / holiday days across the counted set
  function breakdown(from, to, inc) {
    var start = inc ? midnight(from) : addDays(from, 1);
    var biz = 0, wknd = 0, hol = 0;
    for (var d = new Date(start); diffDays(d, to) >= 0; d = addDays(d, 1)) {
      var wd = d.getDay();
      if (wd === 0 || wd === 6) { wknd++; continue; }
      if (isHoliday(d)) { hol++; if (!(exclHol && exclHol.checked)) biz++; }
      else biz++;
    }
    return { biz: biz, wknd: wknd, hol: hol };
  }

  function addYMWD(d, sign, y, mo, w, dd) {
    var t = new Date(d.getFullYear() + sign * y, d.getMonth() + sign * mo, 1);
    var dim = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    var res = new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), dim));
    return addDays(res, sign * (w * 7 + dd));
  }

  // ---- span bar ----
  function renderBar(a, b, showWeekends) {
    var svg = $('dcBar'); if (!svg) return;
    var lo = midnight(a < b ? a : b), hi = midnight(a < b ? b : a);
    var span = diffDays(lo, hi);
    var x0 = 14, x1 = 306, y = 46, h = 12;
    var t0 = lo.getTime(), t1 = hi.getTime() || t0 + 1;
    function sx(dt) { return x0 + Math.max(0, Math.min(1, (dt.getTime() - t0) / (t1 - t0))) * (x1 - x0); }
    var g = '';
    g += '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="' + h + '" rx="6" fill="#EDF2ED"/>';
    // weekend shading (only when readable + requested)
    if (showWeekends && span > 0 && span <= 140) {
      for (var d = new Date(lo); diffDays(d, hi) > 0; d = addDays(d, 1)) {
        var wd = d.getDay();
        if (wd === 6 || wd === 0) {
          var xa = sx(d), xb = sx(addDays(d, 1));
          g += '<rect x="' + xa + '" y="' + y + '" width="' + Math.max(0.6, xb - xa) + '" height="' + h + '" fill="#D8C8A8"/>';
        }
      }
    } else {
      g += '<rect x="' + x0 + '" y="' + y + '" width="' + (sx(hi) - x0) + '" height="' + h + '" rx="6" fill="#B5761F"/>';
    }
    // month-boundary ticks
    if (span > 0 && span <= 3660) {
      var m = new Date(lo.getFullYear(), lo.getMonth() + 1, 1);
      var guard = 0;
      while (m < hi && guard++ < 200) {
        var mx = sx(m);
        g += '<line x1="' + mx + '" y1="' + (y - 3) + '" x2="' + mx + '" y2="' + (y + h + 3) + '" stroke="#8A7A66" stroke-width="1" opacity=".5"/>';
        m = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      }
    }
    // today marker
    var today = midnight(new Date());
    if (diffDays(lo, today) >= 0 && diffDays(today, hi) >= 0 && span > 0) {
      var nx = sx(today);
      g += '<line x1="' + nx + '" y1="' + (y - 13) + '" x2="' + nx + '" y2="' + (y + h + 5) + '" stroke="#241A11" stroke-width="1.5"/>';
      g += '<circle cx="' + nx + '" cy="' + (y + h / 2) + '" r="3.5" fill="#241A11" stroke="#fff" stroke-width="1.5"/>';
      g += '<text x="' + nx + '" y="' + (y - 18) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#241A11">today</text>';
    }
    // endpoint labels
    g += '<text x="' + x0 + '" y="' + (y + h + 20) + '" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + fmtShort(lo) + '</text>';
    g += '<text x="' + x1 + '" y="' + (y + h + 20) + '" text-anchor="end" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + fmtShort(hi) + '</text>';
    g += '<text x="' + ((x0 + x1) / 2) + '" y="26" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#241A11">' + span.toLocaleString() + (span === 1 ? ' day' : ' days') + '</text>';
    svg.innerHTML = g;
  }

  function setLabels() {
    $('dcResLab').textContent = mode === 'between' ? 'Days between' : 'Resulting date';
    $('betweenIn').style.display = mode === 'between' ? '' : 'none';
    $('addsubIn').style.display = mode === 'addsub' ? '' : 'none';
    $('advRow').style.display = mode === 'between' ? '' : 'none';
    if (mode === 'addsub' && advanced) { advanced = false; $('advBtn').classList.remove('open'); $('advBtnLab').textContent = 'Go advanced'; $('advIn').style.display = 'none'; }
  }

  function solveBetween() {
    var a = picked(dpFrom, fromIn), b = picked(dpTo, toIn);
    var big = $('dcResBig'), unit = $('dcResUnit'), sub = $('dcResSub');
    if (!a || !b) {
      big.textContent = '—'; unit.textContent = '';
      sub.textContent = a || b ? 'Pick both dates to see the gap.' : 'Pick a start and end date.';
      $('dcDetail').style.display = 'none';
      return;
    }
    var swapped = b < a;
    var lo = swapped ? b : a, hi = swapped ? a : b;
    var inc = incEnd && incEnd.checked;
    var days = diffDays(lo, hi) + (inc ? 1 : 0);
    var o = ymd(lo, hi);
    var weeks = Math.floor(days / 7), rem = days % 7;
    big.textContent = days.toLocaleString();
    unit.textContent = days === 1 ? 'day' : 'days';
    sub.textContent = (swapped ? 'That end date is before the start — showing the gap. ' : '') +
      '= ' + weeks.toLocaleString() + (weeks === 1 ? ' week' : ' weeks') + (rem ? ', ' + rem + (rem === 1 ? ' day' : ' days') : '') +
      '  ·  ' + ymdStr(o);
    $('dcDetail').style.display = '';

    var bd = (advanced && bizOnly && bizOnly.checked) ? breakdown(lo, hi, inc) : null;
    renderBar(lo, hi, !!bd);

    var months = o.y * 12 + o.m;
    $('dcTotals').innerHTML =
      '<thead><tr><th>In total</th><th></th></tr></thead><tbody>' +
      '<tr><td>Years, months, days</td><td>' + ymdStr(o) + '</td></tr>' +
      '<tr><td>Months</td><td>' + months.toLocaleString() + '</td></tr>' +
      '<tr><td>Weeks</td><td>' + weeks.toLocaleString() + '</td></tr>' +
      '<tr><td>Days</td><td>' + days.toLocaleString() + '</td></tr>' +
      '<tr><td>Hours</td><td>' + (days * 24).toLocaleString() + '</td></tr>' +
      '</tbody>';

    var facts =
      '<div class="bf-cmp"><span class="k">' + fmtShort(lo) + ' is a</span><span class="v">' + DOW[lo.getDay()] + '</span></div>' +
      '<div class="bf-cmp"><span class="k">' + fmtShort(hi) + ' is a</span><span class="v">' + DOW[hi.getDay()] + '</span></div>' +
      '<div class="bf-cmp"><span class="k">Day of the year (' + hi.getFullYear() + ')</span><span class="v">' + dayOfYear(hi) + ' of ' + (((hi.getFullYear() % 4 === 0 && hi.getFullYear() % 100 !== 0) || hi.getFullYear() % 400 === 0) ? 366 : 365) + '</span></div>';
    if (bd) {
      facts +=
        '<div class="bf-cmp"><span class="k">Business days</span><span class="v">' + bd.biz.toLocaleString() + '</span></div>' +
        '<div class="bf-cmp"><span class="k">Weekend days</span><span class="v">' + bd.wknd.toLocaleString() + '</span></div>';
      if (exclHol && exclHol.checked) facts += '<div class="bf-cmp"><span class="k">US federal holidays</span><span class="v">' + bd.hol.toLocaleString() + '</span></div>';
    }
    $('dcFacts').innerHTML = facts;
  }

  function solveAddSub() {
    var s = picked(dpStart, startIn);
    var big = $('dcResBig'), unit = $('dcResUnit'), sub = $('dcResSub');
    var y = num(yIn.value), mo = num(moIn.value), w = num(wIn.value), dd = num(dIn.value);
    if (!s || (y + mo + w + dd === 0)) {
      big.textContent = '—'; unit.textContent = '';
      sub.textContent = !s ? 'Pick a start date.' : 'Enter an amount to add or subtract.';
      $('dcDetail').style.display = 'none';
      return;
    }
    var sign = op === 'sub' ? -1 : 1;
    var res = addYMWD(s, sign, y, mo, w, dd);
    var total = diffDays(s, res);
    big.textContent = fmtShort(res);
    unit.textContent = '';
    sub.textContent = DOW[res.getDay()] + '  ·  ' + (op === 'sub' ? '' : '+') + total.toLocaleString() + (Math.abs(total) === 1 ? ' day' : ' days') + ' from the start';
    $('dcDetail').style.display = '';
    renderBar(s, res, false);

    var o = ymd(res < s ? res : s, res < s ? s : res);
    $('dcTotals').innerHTML =
      '<thead><tr><th>The gap</th><th></th></tr></thead><tbody>' +
      '<tr><td>Years, months, days</td><td>' + ymdStr(o) + '</td></tr>' +
      '<tr><td>Total days</td><td>' + Math.abs(total).toLocaleString() + '</td></tr>' +
      '<tr><td>Weeks</td><td>' + Math.floor(Math.abs(total) / 7).toLocaleString() + '</td></tr>' +
      '</tbody>';
    $('dcFacts').innerHTML =
      '<div class="bf-cmp"><span class="k">Start date</span><span class="v">' + DOW[s.getDay()] + ', ' + fmtShort(s) + '</span></div>' +
      '<div class="bf-cmp"><span class="k">Result</span><span class="v">' + DOW[res.getDay()] + ', ' + fmtShort(res) + '</span></div>' +
      '<div class="bf-cmp"><span class="k">Day of the year (' + res.getFullYear() + ')</span><span class="v">' + dayOfYear(res) + '</span></div>';
  }

  function solve() { if (mode === 'between') solveBetween(); else solveAddSub(); }

  $('modeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.mode === mode) return;
    mode = b.dataset.mode;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    setLabels(); solve();
  });
  $('opSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.op === op) return;
    op = b.dataset.op;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    solve();
  });

  var advBtn = $('advBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('advIn').style.display = advanced ? '' : 'none';
    solve();
    if (advanced) { var el = $('advIn'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });

  [incEnd, bizOnly, exclHol].forEach(function (el) { if (el) el.addEventListener('change', solve); });
  [yIn, moIn, wIn, dIn].forEach(function (el) { if (el) el.addEventListener('input', solve); });

  var today = new Date();
  if (window.Datepicker) {
    var opt = { format: 'd MM yyyy', autohide: true, weekStart: 0, todayHighlight: true };
    dpFrom = new Datepicker(fromIn, opt);
    dpTo = new Datepicker(toIn, opt);
    dpStart = new Datepicker(startIn, opt);
    [fromIn, toIn, startIn].forEach(function (el) { el.addEventListener('changeDate', solve); });
    dpFrom.setDate(today);
    dpTo.setDate(addDays(today, 90));
    dpStart.setDate(today);
  } else {
    fromIn.value = isoOf(today); toIn.value = isoOf(addDays(today, 90)); startIn.value = isoOf(today);
  }
  ['input', 'change'].forEach(function (ev) {
    [fromIn, toIn, startIn].forEach(function (el) { el.addEventListener(ev, solve); });
  });
  if (dIn && !dIn.value) dIn.value = '30';

  setLabels();
  solve();
};

/* -----------------------------------------------------------
   CalcThis.initWaterCalc(cfg) — daily water intake.
   Independent engine. Baseline 35 mL/kg/day (30 mL/kg for
   older adults), floored near the IOM/NASEM Adequate Intake
   for beverages, plus additions for activity, hot climate and
   (advanced) pregnancy or breastfeeding. Shows the target in
   glasses / litres / fl oz, a stacked bar of what makes up the
   number, and a glass-by-glass schedule across the waking day.
   Live, no button. Female default. */
CalcThis.initWaterCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'kg', sex = 'female', act = 'none', clim = 'temperate', special = 'none', advanced = false;

  var GLASS = 250;        // mL per glass
  var OZ = 29.5735;       // mL per US fl oz
  var LB = 2.2046226;
  var ACT_ADD = { none: 0, light: 350, moderate: 700, intense: 1100 };
  var SPECIAL_ADD = { none: 0, pregnant: 300, breastfeeding: 700 };

  var wIn = $('weight'), ageIn = $('age'), coffeeIn = $('coffee');
  if (!wIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function r0(x) { return Math.round(x); }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function applyUnit() {
    if ($('uWeight')) $('uWeight').textContent = unit === 'lb' ? 'lb' : 'kg';
    if (wIn) wIn.placeholder = unit === 'lb' ? '150' : '68';
  }

  function targetParts() {
    var w = num(wIn.value);
    if (isNaN(w) || w <= 0) return null;
    var wKg = unit === 'lb' ? w / LB : w;
    if (wKg < 20 || wKg > 350) return null;
    var age = advanced ? num(ageIn.value) : NaN;
    var perKg = (isFinite(age) && age >= 65) ? 30 : 33;
    var base = perKg * wKg;
    var floor = sex === 'male' ? 2500 : 2000;
    if (base < floor) base = floor;
    var actAdd = ACT_ADD[act] || 0;
    var heatAdd = clim === 'hot' ? 500 : 0;
    var spAdd = (advanced && sex === 'female') ? (SPECIAL_ADD[special] || 0) : 0;
    return { base: base, act: actAdd, heat: heatAdd, special: spAdd, total: base + actAdd + heatAdd + spAdd, age: age };
  }

  function renderBar(p) {
    var wrap = $('wtrBar'); if (!wrap) return;
    var segs = [
      { k: 'base', lab: 'Base need', v: p.base },
      { k: 'act', lab: 'Activity', v: p.act },
      { k: 'heat', lab: 'Hot climate', v: p.heat },
      { k: 'special', lab: special === 'breastfeeding' ? 'Breastfeeding' : 'Pregnancy', v: p.special }
    ].filter(function (s) { return s.v > 0; });
    wrap.innerHTML = segs.map(function (s) {
      return '<span class="wtr-seg ' + s.k + '" style="flex:' + s.v + '">' + (s.v / p.total > 0.12 ? one(s.v / 1000) + ' L' : '') + '</span>';
    }).join('');
    $('wtrKey').innerHTML = segs.map(function (s) {
      return '<span><i class="k-' + s.k + '"></i>' + s.lab + ' &middot; ' + r0(s.v).toLocaleString() + ' ml</span>';
    }).join('');
  }

  var GLASS_SVG = '<svg viewBox="0 0 20 26" aria-hidden="true">' +
    '<path d="M2 1h16l-1.5 22a2 2 0 0 1-2 1.9H5.5a2 2 0 0 1-2-1.9L2 1z" fill="#EFE2C7"/>' +
    '<path d="M3 9h14l-1 14a2 2 0 0 1-2 1.9H6a2 2 0 0 1-2-1.9L3 9z" fill="#B5761F"/></svg>';
  var GRP_ICON = {
    morning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M5 10l2 1M19 10l-2 1M4 18h16M8 18a4 4 0 0 1 8 0"/></svg>',
    afternoon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>',
    evening: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/></svg>'
  };

  // split the day's glasses into 3 named blocks — front-loaded, easing off in the evening
  function renderDay(totalMl) {
    var n = Math.max(4, Math.round(totalMl / GLASS));
    var morning = Math.round(n * 0.40);
    var afternoon = Math.round(n * 0.35);
    var evening = n - morning - afternoon;
    if (evening < 1) { evening = 1; afternoon = n - morning - evening; }
    var blocks = [
      { k: 'morning', lab: 'Morning', when: 'wake – noon', c: morning },
      { k: 'afternoon', lab: 'Afternoon', when: 'noon – 6pm', c: afternoon },
      { k: 'evening', lab: 'Evening', when: '6 – 10pm', c: evening }
    ];
    $('wtrDay').innerHTML = blocks.map(function (b) {
      var glasses = '';
      for (var i = 0; i < b.c; i++) glasses += GLASS_SVG;
      return '<div class="wtr-grp">' +
        '<div class="wtr-grp-h"><span class="ic">' + GRP_ICON[b.k] + '</span>' + b.lab +
        ' <span class="when">' + b.when + '</span>' +
        '<span class="cnt">' + b.c + (b.c === 1 ? ' glass' : ' glasses') + '</span></div>' +
        '<div class="wtr-glasses">' + glasses + '</div></div>';
    }).join('');
    return n;
  }

  function solve() {
    var p = targetParts();
    var big = $('resBig'), unitEl = $('resUnit'), sub = $('resSub');
    if (!p) {
      big.textContent = '—'; unitEl.textContent = '';
      sub.textContent = 'Enter your weight to see your daily target.';
      $('wtrDetail').style.display = 'none';
      return;
    }
    var glasses = Math.max(4, Math.round(p.total / GLASS));
    big.textContent = glasses;
    unitEl.textContent = glasses === 1 ? 'glass a day' : 'glasses a day';
    sub.textContent = '≈ ' + one(p.total / 1000) + ' L  ·  ' + r0(p.total / OZ) + ' fl oz  ·  a 250 ml glass';
    $('wtrDetail').style.display = '';

    renderBar(p);
    renderDay(p.total);

    $('wtrTable').innerHTML =
      '<thead><tr><th>Your target</th><th></th></tr></thead><tbody>' +
      '<tr><td>Glasses (250 ml)</td><td>' + glasses + '</td></tr>' +
      '<tr><td>Litres</td><td>' + one(p.total / 1000) + ' L</td></tr>' +
      '<tr><td>US fluid ounces</td><td>' + r0(p.total / OZ) + ' fl oz</td></tr>' +
      '<tr><td>US cups (240 ml)</td><td>' + one(p.total / 240) + '</td></tr>' +
      '</tbody>';

    var cof = advanced ? num(coffeeIn.value) : NaN;
    var note = '<strong>Food gives you roughly another 20%</strong> on top of this, so the figure above is water and other drinks only. ';
    if (isFinite(cof) && cof > 0) {
      note += 'Your ' + r0(cof) + ' cup' + (cof === 1 ? '' : 's') + ' of coffee or tea count toward the total — mildly diuretic, but still a net gain of about ' +
        one((cof * 240) / 1000) + ' L.';
    } else {
      note += 'Coffee and tea count too — they are only mildly diuretic and still hydrate you.';
    }
    $('wtrNote').innerHTML = note;
  }

  // ---- toggles ----
  function bindSeg(id, fn) {
    var seg = $(id); if (!seg) return;
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
      fn(b); solve();
    });
  }
  bindSeg('unitSeg', function (b) {
    var nu = b.dataset.unit;
    if (nu !== unit) {
      var w = num(wIn.value);
      if (isFinite(w) && w > 0) wIn.value = one(nu === 'lb' ? w * LB : w / LB);
      unit = nu; applyUnit();
    }
  });
  bindSeg('sexSeg', function (b) {
    sex = b.dataset.sex;
    var sp = $('specialRow'); if (sp) sp.style.display = (advanced && sex === 'female') ? '' : 'none';
  });
  bindSeg('actSeg', function (b) { act = b.dataset.act; });
  bindSeg('climSeg', function (b) { clim = b.dataset.clim; });
  bindSeg('specialSeg', function (b) { special = b.dataset.special; });

  wIn.addEventListener('input', solve);
  [ageIn, coffeeIn].forEach(function (el) { if (el) el.addEventListener('input', solve); });

  var advBtn = $('advBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('advIn').style.display = advanced ? '' : 'none';
    var sp = $('specialRow'); if (sp) sp.style.display = (advanced && sex === 'female') ? '' : 'none';
    solve();
    if (advanced) { var el = $('advIn'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });

  applyUnit();
  solve();
};

/* -----------------------------------------------------------
   CalcThis.initTimeCalc(cfg) — time calculator.
   Independent engine. Three modes:
     elapsed  — duration between a start and end clock time,
                rolling to the next day if end <= start (+ extra
                full days in advanced). Live 24h timeline bar.
     addsub   — add/subtract h:m:s entries into a running list
                with a live running total (tally pattern).
     timecard — Mon-Sun clock in/out + break minutes -> daily
                and weekly hours (+ decimal), a week-at-a-glance
                bar chart, and optional hourly pay.
   Clock-time fields reuse the Sleep calculator's masked h:mm
   digit input (stable, no native picker jumpiness) + a visible
   AM/PM toggle instead of a hidden native time control.
   Live, no button. */
CalcThis.initTimeCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var mode = 'elapsed', op = 'add', elAdvanced = false, tcAdvanced = false;
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var asList = [];

  if (!$('elStart')) return;

  function num(v) { var n = parseInt(('' + v).trim(), 10); return isNaN(n) || n < 0 ? 0 : n; }
  function fnum(v) { var n = parseFloat(('' + v).trim()); return isNaN(n) || n < 0 ? NaN : n; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hm(mins) { var h = Math.floor(mins / 60), m = Math.round(mins % 60); return h + ' hr' + (m ? ' ' + m + ' min' : ''); }
  function dec(mins) { return (Math.round((mins / 60) * 100) / 100).toFixed(2).replace(/\.00$/, ''); }

  // ---- masked h:mm digit field + AM/PM toggle (shared by every clock-time input) ----
  function splitDigits(raw) {
    var d = ('' + raw).replace(/\D/g, '').slice(0, 4);
    if (!d) return { empty: true };
    if (d[0] > '1') return { hDig: '0' + d[0], mDig: d.slice(1, 3), hourDone: true };
    if (d.length === 1) return { hDig: d, mDig: '', hourDone: false };
    return { hDig: d.slice(0, 2), mDig: d.slice(2, 4), hourDone: true };
  }
  function refreshGhost(input, ghost) {
    var s = splitDigits(input.value);
    var val = s.empty ? '' : (s.hourDone ? s.hDig + ':' + s.mDig : s.hDig);
    if (val !== input.value) input.value = val;
    var hc = s.empty ? '' : s.hDig, mc = s.empty ? '' : s.mDig;
    var cells = [hc[0], hc[1], ':', mc[0], mc[1]], html = '';
    for (var i = 0; i < 5; i++) {
      if (i === 2) html += '<span class="g-sep">:</span>';
      else if (cells[i] != null) html += '<span class="g-on">' + cells[i] + '</span>';
      else html += '<span class="g-off">-</span>';
    }
    ghost.innerHTML = html;
  }
  function parseField(input, ap) {
    var s = splitDigits(input.value);
    if (s.empty) return null;
    var h = +s.hDig;
    var md = s.mDig, m = md.length === 0 ? 0 : (md.length === 1 ? (+md) * 10 : +md);
    if (m > 59 || h < 1 || h > 12) return null;
    var base = h % 12; if (ap === 'pm') base += 12;
    return base * 60 + m;
  }
  // wires one masked input + its ghost + its AM/PM seg; returns {minutes()}
  function makeTimeField(inputId, ghostId, apSegId) {
    var input = $(inputId), ghost = $(ghostId), apSeg = $(apSegId);
    var ap = apSeg.querySelector('button.on').dataset.ap;
    apSeg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.ap === ap) return;
      ap = b.dataset.ap;
      [].forEach.call(apSeg.children, function (c) { c.classList.toggle('on', c === b); });
      solve();
    });
    input.addEventListener('input', function () { refreshGhost(input, ghost); solve(); });
    refreshGhost(input, ghost);
    return { minutes: function () { return parseField(input, ap); } };
  }

  function setLabels() {
    $('elapsedIn').style.display = mode === 'elapsed' ? '' : 'none';
    $('addsubIn').style.display = mode === 'addsub' ? '' : 'none';
    $('timecardIn').style.display = mode === 'timecard' ? '' : 'none';
    $('elDetail').style.display = mode === 'elapsed' ? '' : 'none';
    $('asDetail').style.display = mode === 'addsub' ? '' : 'none';
    $('tcDetail').style.display = mode === 'timecard' ? '' : 'none';
    $('tcResLab').textContent = mode === 'elapsed' ? 'Elapsed time' : mode === 'addsub' ? 'Running total' : 'This week';
  }

  // ---- 24h timeline bar (elapsed mode) ----
  function renderElBar(startMin, endMin, extraDays) {
    var svg = $('elBar'); if (!svg) return;
    var x0 = 14, x1 = 306, y = 46, h = 12, W = x1 - x0;
    function sx(m) { return x0 + Math.max(0, Math.min(1, (m % 1440) / 1440)) * W; }
    var g = '<rect x="' + x0 + '" y="' + y + '" width="' + W + '" height="' + h + '" rx="6" fill="#EDF2ED"/>';
    var wrapped = endMin < startMin;
    if (!wrapped && extraDays === 0) {
      g += '<rect x="' + sx(startMin) + '" y="' + y + '" width="' + Math.max(1, sx(endMin) - sx(startMin)) + '" height="' + h + '" rx="6" fill="#B5761F"/>';
    } else {
      g += '<rect x="' + sx(startMin) + '" y="' + y + '" width="' + Math.max(1, x1 - sx(startMin)) + '" height="' + h + '" fill="#B5761F"/>';
      g += '<rect x="' + x0 + '" y="' + y + '" width="' + Math.max(1, sx(endMin) - x0) + '" height="' + h + '" fill="#B5761F"/>';
    }
    // hour ticks every 6h
    [0, 360, 720, 1080, 1440].forEach(function (m) {
      var mx = sx(m === 1440 ? 0 : m);
      if (m === 0 || m === 1440) mx = m === 0 ? x0 : x1;
      g += '<line x1="' + mx + '" y1="' + (y - 3) + '" x2="' + mx + '" y2="' + (y + h + 3) + '" stroke="#8A7A66" stroke-width="1" opacity=".4"/>';
    });
    var labs = ['12am', '6am', '12pm', '6pm', '12am'];
    [x0, x0 + W * 0.25, x0 + W * 0.5, x0 + W * 0.75, x1].forEach(function (px, i) {
      var anchor = i === 0 ? 'start' : (i === 4 ? 'end' : 'middle');
      g += '<text x="' + px + '" y="' + (y + h + 20) + '" text-anchor="' + anchor + '" font-family="Inter,sans-serif" font-size="11" fill="#8A7A66">' + labs[i] + '</text>';
    });
    g += '<text x="' + ((x0 + x1) / 2) + '" y="26" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#241A11">' +
      (wrapped ? 'crosses midnight' : (extraDays > 0 ? '+' + extraDays + ' extra day' + (extraDays === 1 ? '' : 's') : 'same day')) + '</text>';
    svg.innerHTML = g;
  }

  function solveElapsed() {
    var big = $('tcResBig'), unit = $('tcResUnit'), sub = $('tcResSub');
    var sMin = elStartField.minutes(), eMin = elEndField.minutes();
    if (sMin === null || eMin === null) {
      big.textContent = '—'; unit.textContent = '';
      sub.textContent = 'Pick a start and end time.';
      $('elDetail').style.display = 'none';
      return;
    }
    var extra = elAdvanced ? num(elExtraDays.value) : 0;
    var totalMin = eMin - sMin;
    if (totalMin < 0) totalMin += 1440;
    totalMin += extra * 1440;
    big.textContent = hm(totalMin).split(' hr')[0];
    unit.textContent = 'hr' + (totalMin % 60 ? ' ' + Math.round(totalMin % 60) + ' min' : '');
    sub.textContent = '= ' + Math.round(totalMin).toLocaleString() + ' minutes  ·  ' + dec(totalMin) + ' decimal hours';
    $('elDetail').style.display = '';
    renderElBar(sMin, eMin, extra);
    $('elTotals').innerHTML =
      '<thead><tr><th>In total</th><th></th></tr></thead><tbody>' +
      '<tr><td>Hours &amp; minutes</td><td>' + hm(totalMin) + '</td></tr>' +
      '<tr><td>Total minutes</td><td>' + Math.round(totalMin).toLocaleString() + '</td></tr>' +
      '<tr><td>Total seconds</td><td>' + (Math.round(totalMin) * 60).toLocaleString() + '</td></tr>' +
      '<tr><td>Decimal hours</td><td>' + dec(totalMin) + '</td></tr>' +
      '</tbody>';
  }

  // ---- add/subtract running tally ----
  function renderAsList() {
    var wrap = $('asRows'), empty = $('asEmpty');
    if (!asList.length) { empty.style.display = ''; wrap.innerHTML = ''; }
    else {
      empty.style.display = 'none';
      var running = 0;
      wrap.innerHTML = asList.map(function (e, i) {
        running += e.sign * e.mins;
        var sign = e.sign > 0 ? '+' : '−';
        return '<div class="arow"><span class="desc"><b>' + sign + ' ' + hm(e.mins) + '</b></span>' +
          '<span class="run">' + (running < 0 ? '−' : '') + hm(Math.abs(running)) + '</span>' +
          '<button class="x" data-i="' + i + '" type="button" aria-label="Remove">&times;</button></div>';
      }).join('');
    }
    var total = asList.reduce(function (t, e) { return t + e.sign * e.mins; }, 0);
    var big = $('tcResBig'), unit = $('tcResUnit'), sub = $('tcResSub');
    if (!asList.length) {
      big.textContent = '—'; unit.textContent = '';
      sub.textContent = 'Add a time to start a running total.';
    } else {
      var neg = total < 0;
      big.textContent = (neg ? '−' : '') + hm(Math.abs(total)).split(' hr')[0];
      unit.textContent = 'hr' + (Math.abs(total) % 60 ? ' ' + Math.round(Math.abs(total) % 60) + ' min' : '');
      sub.textContent = '= ' + (neg ? '−' : '') + dec(Math.abs(total)) + ' decimal hours  ·  ' + asList.length + (asList.length === 1 ? ' entry' : ' entries');
    }
  }

  // ---- time card ----
  function miniTf(idBase, defAp) {
    return '<div class="tf">' +
      '<div class="time-box">' +
      '<div class="time-ghost" id="' + idBase + 'Ghost" aria-hidden="true"><span class="g-off">-</span><span class="g-off">-</span><span class="g-sep">:</span><span class="g-off">-</span><span class="g-off">-</span></div>' +
      '<input id="' + idBase + '" class="time-digits" type="text" inputmode="numeric" autocomplete="off" maxlength="5" aria-label="' + idBase + '">' +
      '</div>' +
      '<div class="ap-mini" id="' + idBase + 'Ap">' +
      '<button type="button" data-ap="am"' + (defAp === 'am' ? ' class="on"' : '') + '>AM</button>' +
      '<button type="button" data-ap="pm"' + (defAp === 'pm' ? ' class="on"' : '') + '>PM</button>' +
      '</div></div>';
  }
  var tcInField = [], tcOutField = [];
  function buildTcRows() {
    var wrap = $('tcRows'); if (!wrap) return;
    wrap.innerHTML = DAYS.map(function (d, i) {
      return '<div class="tc-day">' +
        '<div class="tc-dlab">' + d + '</div>' +
        '<div class="tc-in">' + miniTf('tcIn' + i, 'am') + '</div>' +
        '<div class="tc-out">' + miniTf('tcOut' + i, 'pm') + '</div>' +
        '<label class="fld tc-brk" for="tcBrk' + i + '"><span class="lab">Break</span><div class="inp"><input id="tcBrk' + i + '" type="text" inputmode="numeric" placeholder="0"><span class="suf">min</span></div></label>' +
        '</div>';
    }).join('');
    tcInField = []; tcOutField = [];
    DAYS.forEach(function (d, i) {
      tcInField.push(makeTimeField('tcIn' + i, 'tcIn' + i + 'Ghost', 'tcIn' + i + 'Ap'));
      tcOutField.push(makeTimeField('tcOut' + i, 'tcOut' + i + 'Ghost', 'tcOut' + i + 'Ap'));
    });
    [].slice.call(wrap.querySelectorAll('#tcRows > .tc-day input[id^="tcBrk"]')).forEach(function (el) {
      el.addEventListener('input', solve);
    });
  }

  function dayMinutes(i) {
    var inMin = tcInField[i].minutes(), outMin = tcOutField[i].minutes();
    if (inMin === null || outMin === null) return 0;
    var brk = num($('tcBrk' + i).value);
    var m = outMin - inMin;
    if (m < 0) m += 1440;
    m -= brk;
    return Math.max(0, m);
  }

  function renderTcChart(mins) {
    var svg = $('tcChart'); if (!svg) return;
    var x0 = 20, x1 = 306, top = 10, base = 108, bw = (x1 - x0) / 7;
    var maxH = Math.max(8 * 60, Math.max.apply(null, mins)) * 1.15 || 480;
    var g = '<line x1="' + x0 + '" y1="' + base + '" x2="' + x1 + '" y2="' + base + '" stroke="#E7DECF" stroke-width="1"/>';
    DAYS.forEach(function (d, i) {
      var m = mins[i];
      var bh = (m / maxH) * (base - top);
      var bx = x0 + i * bw + bw * 0.18, bwid = bw * 0.64;
      var fill = m > 480 ? '#B5761F' : '#37503F';
      g += '<rect x="' + bx + '" y="' + (base - bh) + '" width="' + bwid + '" height="' + Math.max(0, bh) + '" rx="3" fill="' + fill + '"/>';
      if (m > 0) g += '<text x="' + (bx + bwid / 2) + '" y="' + (base - bh - 6) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="10.5" font-weight="700" fill="#241A11">' + dec(m) + '</text>';
      g += '<text x="' + (bx + bwid / 2) + '" y="' + (base + 18) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#8A7A66">' + d + '</text>';
    });
    svg.innerHTML = g;
  }

  function solveTimecard() {
    var mins = DAYS.map(function (_, i) { return dayMinutes(i); });
    var total = mins.reduce(function (a, b) { return a + b; }, 0);
    var worked = mins.filter(function (m) { return m > 0; }).length;
    var big = $('tcResBig'), unit = $('tcResUnit'), sub = $('tcResSub');
    if (total === 0) {
      big.textContent = '—'; unit.textContent = '';
      sub.textContent = 'Enter clock-in and clock-out times for each day worked.';
    } else {
      big.textContent = dec(total);
      unit.textContent = 'hours this week';
      sub.textContent = '= ' + hm(total) + '  ·  across ' + worked + (worked === 1 ? ' day' : ' days') + ' worked';
    }
    renderTcChart(mins);
    var rows = DAYS.map(function (d, i) {
      return '<tr><td>' + d + '</td><td>' + (mins[i] > 0 ? hm(mins[i]) + ' &middot; ' + dec(mins[i]) : '&mdash;') + '</td></tr>';
    }).join('');
    $('tcTable').innerHTML = '<thead><tr><th>Day</th><th>Hours</th></tr></thead><tbody>' + rows +
      '<tr class="cur"><td>Week total</td><td>' + hm(total) + ' &middot; ' + dec(total) + '</td></tr></tbody>';

    var payTip = $('tcPayTip');
    var rate = tcAdvanced ? fnum($('tcRate').value) : NaN;
    if (isFinite(rate) && rate > 0 && total > 0) {
      payTip.style.display = '';
      payTip.innerHTML = '<strong>' + dec(total) + ' hours &times; $' + rate.toFixed(2) + '/hr = $' + ((total / 60) * rate).toFixed(2) + '</strong> for the week (no overtime multiplier applied).';
    } else {
      payTip.style.display = 'none';
    }
  }

  function solve() {
    if (mode === 'elapsed') solveElapsed();
    else if (mode === 'addsub') renderAsList();
    else solveTimecard();
  }

  $('modeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.mode === mode) return;
    mode = b.dataset.mode;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    setLabels(); solve();
  });

  $('opSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.op === op) return;
    op = b.dataset.op;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
  });

  var elStartField = makeTimeField('elStart', 'elStartGhost', 'elStartAp');
  var elEndField = makeTimeField('elEnd', 'elEndGhost', 'elEndAp');
  var elExtraDays = $('elExtraDays');
  if (elExtraDays) elExtraDays.addEventListener('input', solve);

  var elAdvBtn = $('elAdvBtn');
  elAdvBtn.addEventListener('click', function () {
    elAdvanced = !elAdvanced;
    elAdvBtn.classList.toggle('open', elAdvanced);
    $('elAdvBtnLab').textContent = elAdvanced ? 'Go simple' : 'Go advanced';
    $('elAdvIn').style.display = elAdvanced ? '' : 'none';
    solve();
  });

  $('asAddBtn').addEventListener('click', function () {
    var h = num($('asH').value), m = num($('asM').value), s = num($('asS').value);
    var mins = h * 60 + m + s / 60;
    if (mins <= 0) return;
    asList.push({ sign: op === 'sub' ? -1 : 1, mins: mins });
    $('asH').value = ''; $('asM').value = ''; $('asS').value = '';
    renderAsList();
  });
  $('asClearBtn').addEventListener('click', function () { asList = []; renderAsList(); });
  $('asRows').addEventListener('click', function (e) {
    var b = e.target.closest('.x'); if (!b) return;
    asList.splice(+b.dataset.i, 1);
    renderAsList();
  });

  var tcAdvBtn = $('tcAdvBtn');
  tcAdvBtn.addEventListener('click', function () {
    tcAdvanced = !tcAdvanced;
    tcAdvBtn.classList.toggle('open', tcAdvanced);
    $('tcAdvBtnLab').textContent = tcAdvanced ? 'Go simple' : 'Go advanced';
    $('tcAdvIn').style.display = tcAdvanced ? '' : 'none';
    solve();
  });
  var tcRate = $('tcRate'); if (tcRate) tcRate.addEventListener('input', solve);

  buildTcRows();
  setLabels();
  solve();
};

/* -----------------------------------------------------------
   CalcThis.initFractionCalc(cfg) — tape measure fraction calculator.
   Independent engine. Add/subtract feet-inches-fraction entries
   into a running total (tally pattern), rounded to a chosen
   precision (1/8, 1/16, 1/32, 1/64), with a live ruler showing
   the nearest-1/16 tick. Advanced = multiply the total or split
   it into N equal parts with a marks list. Live, no button. */
CalcThis.initFractionCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var op = 'add', scaleOp = 'mul', advanced = false;
  var list = [];

  var feetIn = $('frFeet'), inchIn = $('frInch'), numIn = $('frNum'), denSel = $('frDen'), precSel = $('frPrec');
  if (!feetIn) return;

  function num(v) { var n = parseFloat(('' + v).trim()); return isNaN(n) || n < 0 ? 0 : n; }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function simplify(n, d) { if (n === 0) return { n: 0, d: 1 }; var g = gcd(n, d); return { n: n / g, d: d / g }; }

  function readEntry() {
    var f = num(feetIn.value), i = num(inchIn.value);
    var n = num(numIn.value), d = parseInt(denSel.value, 10) || 16;
    var frac = d > 0 ? n / d : 0;
    return f * 12 + i + frac;
  }

  // total signed inches -> "7' 5-3/8"" at the chosen precision
  function fmtLen(totalInches) {
    var precDen = parseInt(precSel.value, 10) || 16;
    var sign = totalInches < 0 ? '−' : '';
    var abs = Math.abs(totalInches);
    var steps = Math.round(abs * precDen);
    var wholeInches = Math.floor(steps / precDen);
    var remNum = steps - wholeInches * precDen;
    var feet = Math.floor(wholeInches / 12), inch = wholeInches % 12;
    var s = simplify(remNum, precDen);
    var fracStr = s.n ? (s.n + '/' + s.d) : '';
    var out = '';
    if (feet) out += feet + "' ";
    out += inch + (fracStr ? '-' + fracStr : '') + '"';
    return sign + out;
  }

  function totalInches() { return list.reduce(function (t, e) { return t + (e.sign * e.inches); }, 0); }

  // ---- ruler: nearest-1/16 tick + exact-precision label ----
  function renderRuler(t) {
    var svg = $('frRuler'); if (!svg) return;
    var precDen = parseInt(precSel.value, 10) || 16;
    var abs = Math.abs(t);
    var steps = Math.round(abs * precDen);
    var wholeInches = Math.floor(steps / precDen);
    var remNum = steps - wholeInches * precDen;
    var inchOnly = wholeInches % 12;
    var s = simplify(remNum, precDen);
    var pos16 = Math.round((s.n / s.d) * 16);
    var x0 = 14, x1 = 306, y = 40, h = 14, W = x1 - x0;
    var g = '<rect x="' + x0 + '" y="' + y + '" width="' + W + '" height="' + h + '" rx="4" fill="#EDF2ED"/>';
    for (var i = 0; i <= 16; i++) {
      var x = x0 + (i / 16) * W;
      var major = i === 0 || i === 16, quarter = i % 4 === 0, eighth = i % 2 === 0;
      var th = major ? 18 : quarter ? 13 : eighth ? 10 : 7;
      var sw = major ? 1.8 : quarter ? 1.3 : 1;
      g += '<line x1="' + x + '" y1="' + (y + h / 2 - th / 2) + '" x2="' + x + '" y2="' + (y + h / 2 + th / 2) + '" stroke="#8A7A66" stroke-width="' + sw + '" opacity="' + (major ? 1 : .6) + '"/>';
    }
    var mx = x0 + (pos16 / 16) * W;
    g += '<line x1="' + mx + '" y1="' + (y - 10) + '" x2="' + mx + '" y2="' + (y + h + 6) + '" stroke="#B5761F" stroke-width="2"/>';
    g += '<circle cx="' + mx + '" cy="' + (y - 10) + '" r="3.5" fill="#B5761F"/>';
    g += '<text x="' + x0 + '" y="' + (y + h + 20) + '" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + inchOnly + '"</text>';
    g += '<text x="' + x1 + '" y="' + (y + h + 20) + '" text-anchor="end" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + (inchOnly + 1) + '"</text>';
    var labelText = (t < 0 ? '−' : '') + inchOnly + (s.n ? '-' + s.n + '/' + s.d : '') + '"';
    g += '<text x="' + mx + '" y="' + (y - 16) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#241A11">' + labelText + '</text>';
    svg.innerHTML = g;
  }

  function renderList() {
    var wrap = $('frRows'), empty = $('frEmpty');
    if (!list.length) { empty.style.display = ''; wrap.innerHTML = ''; }
    else {
      empty.style.display = 'none';
      var running = 0;
      wrap.innerHTML = list.map(function (e, i) {
        running += e.sign * e.inches;
        var sign = e.sign > 0 ? '+' : '−';
        return '<div class="arow"><span class="desc"><b>' + sign + ' ' + fmtLen(e.inches) + '</b></span>' +
          '<span class="run">' + fmtLen(running) + '</span>' +
          '<button class="x" data-i="' + i + '" type="button" aria-label="Remove">&times;</button></div>';
      }).join('');
    }
  }

  function solve() {
    var big = $('frResBig'), sub = $('frResSub');
    if (!list.length) {
      big.textContent = '—';
      sub.textContent = 'Add a measurement to start a running total.';
      $('frDetail').style.display = 'none';
    } else {
      var t = totalInches();
      big.textContent = fmtLen(t);
      var dec = (Math.round(t * 1000) / 1000);
      sub.textContent = dec.toFixed(3).replace(/\.?0+$/, '') + '" decimal  ·  ' + (Math.round(t * 25.4 * 10) / 10) + ' mm';
      $('frDetail').style.display = '';
      renderRuler(t);
      renderList();
      var mm = t * 25.4;
      $('frTotals').innerHTML =
        '<thead><tr><th>In total</th><th></th></tr></thead><tbody>' +
        '<tr><td>Feet, inches, fraction</td><td>' + fmtLen(t) + '</td></tr>' +
        '<tr><td>Decimal inches</td><td>' + dec.toFixed(3).replace(/\.?0+$/, '') + '"</td></tr>' +
        '<tr><td>Decimal feet</td><td>' + (Math.round((t / 12) * 1000) / 1000).toFixed(3).replace(/\.?0+$/, '') + " ft</td></tr>" +
        '<tr><td>Millimetres</td><td>' + (Math.round(mm * 10) / 10) + ' mm</td></tr>' +
        '<tr><td>Centimetres</td><td>' + (Math.round(mm / 10 * 100) / 100) + ' cm</td></tr>' +
        '</tbody>';
    }
    solveScale();
  }

  function solveScale() {
    var out = $('frScaleOut'), wrap = $('frMarksWrap');
    if (!advanced) return;
    var t = totalInches();
    var n = parseFloat(($('frScaleN').value || '').trim());
    if (!list.length || !t || isNaN(n) || n <= 0) {
      out.textContent = !list.length ? 'Add a measurement to the list first.' : 'Enter a number.';
      wrap.style.display = 'none';
      return;
    }
    if (scaleOp === 'mul') {
      out.innerHTML = '<strong>' + fmtLen(t) + ' × ' + n + ' = ' + fmtLen(t * n) + '</strong>';
      wrap.style.display = 'none';
    } else {
      var parts = Math.max(1, Math.round(n));
      var per = t / parts;
      out.innerHTML = '<strong>' + fmtLen(t) + ' ÷ ' + parts + ' = ' + fmtLen(per) + ' each</strong>';
      var rows = '';
      for (var i = 1; i < parts; i++) rows += '<tr><td>Mark ' + i + '</td><td>' + fmtLen(per * i) + '</td></tr>';
      if (rows) {
        $('frMarksTable').innerHTML = '<thead><tr><th>From one end</th><th></th></tr></thead><tbody>' + rows + '</tbody>';
        wrap.style.display = '';
      } else wrap.style.display = 'none';
    }
  }

  $('frOpSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.op === op) return;
    op = b.dataset.op;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
  });

  $('frAddBtn').addEventListener('click', function () {
    var inches = readEntry();
    if (!inches) return;
    list.push({ sign: op === 'sub' ? -1 : 1, inches: inches });
    feetIn.value = ''; inchIn.value = ''; numIn.value = '';
    solve();
  });
  $('frClearBtn').addEventListener('click', function () { list = []; solve(); });
  $('frRows').addEventListener('click', function (e) {
    var b = e.target.closest('.x'); if (!b) return;
    list.splice(+b.dataset.i, 1);
    solve();
  });

  precSel.addEventListener('change', solve);

  $('frScaleSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.sc === scaleOp) return;
    scaleOp = b.dataset.sc;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    $('frScaleLab').textContent = scaleOp === 'mul' ? 'Multiply by' : 'Number of equal parts';
    $('frScaleN').placeholder = scaleOp === 'mul' ? 'e.g. 3' : 'e.g. 4';
    solveScale();
  });
  $('frScaleN').addEventListener('input', solveScale);

  var advBtn = $('frAdvBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('frAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('frAdvIn').style.display = advanced ? '' : 'none';
    $('frAdvOut').style.display = advanced ? '' : 'none';
    solveScale();
    if (advanced) { var el = $('frAdvIn'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });

  solve();
};

/* -----------------------------------------------------------
   CalcThis.initStepsMilesCalc(cfg) — steps to miles/km.
   Independent engine. Steps x personal stride length (from height
   + sex via the pedometer-standard 0.413/0.415 formula, or a
   custom override) -> distance. Live distance-milestone progress
   bar (1 mile / 5K / 10K / half / marathon ticks) instead of a
   bare number. Advanced: weight + walking speed/incline chips ->
   calories burned (ACSM walking metabolic equation) for that
   distance, plus a speed-vs-calories curve across 0/5/10% incline.
   Live, no button. Inches default for US users. */
CalcThis.initStepsMilesCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'cm', sex = 'female', advanced = false, speedMph = 3, inclinePct = 0;

  var IN_PER_MILE = 63360, KM_PER_MI = 1.609344, LB_PER_KG = 2.2046226;
  var LANDMARKS = [
    { mi: 1,    short: '1 mi',    label: '1 mile' },
    { mi: 3.1,  short: '5K',      label: 'a 5K' },
    { mi: 6.2,  short: '10K',     label: 'a 10K' },
    { mi: 13.1, short: 'Half',    label: 'a half marathon' },
    { mi: 26.2, short: 'Marathon',label: 'a marathon' }
  ];
  var MAX_MI = 26.2;
  var SPEED_STEPS = [2, 2.5, 3, 3.5, 4];

  var stepsIn = $('steps'), heightIn = $('height'), strideIn = $('stride'), weightIn = $('weight');
  if (!stepsIn) return;
  var unitSeg = $('unitSeg'), sexSeg = $('sexSeg'), speedChips = $('speedChips'), inclineChips = $('inclineChips');
  var advBtn = $('advBtn'), advIn = $('advIn'), advOut = $('advOut');

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function toIn(v) { return unit === 'cm' ? v / 2.54 : v; }
  function toKg(v) { return unit === 'in' ? v / LB_PER_KG : v; }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function trim1(x) { var s = x.toFixed(1); return s.replace(/\.0$/, ''); }

  function prefersImperial() {
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
      var us = ['America/New_York', 'America/Detroit', 'America/Kentucky/Louisville',
        'America/Kentucky/Monticello', 'America/Indiana/Indianapolis', 'America/Indiana/Vincennes',
        'America/Indiana/Winamac', 'America/Indiana/Marengo', 'America/Indiana/Petersburg',
        'America/Indiana/Vevay', 'America/Chicago', 'America/Indiana/Tell_City',
        'America/Indiana/Knox', 'America/Menominee', 'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem', 'America/North_Dakota/Beulah', 'America/Denver',
        'America/Boise', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage',
        'America/Juneau', 'America/Sitka', 'America/Metlakatla', 'America/Yakutat',
        'America/Nome', 'America/Adak', 'Pacific/Honolulu'];
      return us.indexOf(tz) !== -1;
    } catch (e) { return false; }
  }

  var PH = { cm: { height: '168' }, in: { height: '66' } };
  function applyUnit() {
    var mu = unit === 'in' ? 'in' : 'cm', wu = unit === 'in' ? 'lb' : 'kg';
    if ($('uHeight')) $('uHeight').textContent = mu;
    if ($('uStride')) $('uStride').textContent = mu;
    if ($('uWeight')) $('uWeight').textContent = wu;
    if (heightIn) heightIn.placeholder = PH[unit].height;
    if (unitSeg) [].forEach.call(unitSeg.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', b.getAttribute('data-unit') === unit);
    });
    if (speedChips) [].forEach.call(speedChips.querySelectorAll('button'), function (b) {
      var mph = parseFloat(b.getAttribute('data-mph'));
      b.textContent = unit === 'in' ? trim1(mph) + ' mph' : trim1(mph * KM_PER_MI) + ' km/h';
    });
  }

  function strideInches() {
    var custom = strideIn ? num(strideIn.value) : NaN;
    if (isFinite(custom) && custom > 0) return toIn(custom);
    var h = toIn(num(heightIn.value));
    if (isFinite(h) && h > 0) return h * (sex === 'male' ? 0.413 : 0.415);
    return sex === 'male' ? 30 : 26.4;
  }

  function buildTicks() {
    var el = $('stmTicks'); if (!el) return;
    el.innerHTML = LANDMARKS.map(function (l) {
      return '<span style="left:' + (l.mi / MAX_MI * 100) + '%">' + l.short + '</span>';
    }).join('');
  }

  // ACSM walking metabolic equation (valid ~1.9-4mph on a treadmill grade)
  function kcalFor(mph, incPct, distMi, wKg) {
    var speedMmin = mph * 26.8224, grade = incPct / 100;
    var vo2 = 0.1 * speedMmin + 1.8 * speedMmin * grade + 3.5;
    var met = vo2 / 3.5;
    var kcalPerMin = met * 3.5 * wKg / 200;
    var durMin = distMi / mph * 60;
    return kcalPerMin * durMin;
  }
  function durTxt(min) {
    min = Math.round(min);
    if (min < 60) return min + ' min';
    var h = Math.floor(min / 60), m = min % 60;
    return h + 'h' + (m ? ' ' + m + 'm' : '');
  }

  function renderCalChart(distMi, wKg) {
    var svg = $('calChart'); if (!svg) return;
    var X0 = 46, X1 = 320, Y0 = 14, Y1 = 150;
    var incs = [{ p: 0, c: '#8F5C13' }, { p: 5, c: '#B5761F' }, { p: 10, c: '#37503F' }];
    var speeds = [], s;
    for (s = 2; s <= 4.5001; s += 0.25) speeds.push(Math.round(s * 100) / 100);
    var lo = Infinity, hi = -Infinity;
    var lines = incs.map(function (inc) {
      var pts = speeds.map(function (sp) { var k = kcalFor(sp, inc.p, distMi, wKg); if (k < lo) lo = k; if (k > hi) hi = k; return { sp: sp, k: k }; });
      return { inc: inc, pts: pts };
    });
    var pad = (hi - lo) * 0.12 || 5; lo = Math.max(0, lo - pad); hi += pad;
    function sx(sp) { return X0 + (sp - 2) / 2.5 * (X1 - X0); }
    function sy(k) { return Y1 - (k - lo) / (hi - lo) * (Y1 - Y0); }
    var g = '';
    g += '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" fill="none" stroke="#E7DECF" stroke-width="1"/>';
    [2, 3, 4].forEach(function (sp) {
      var x = sx(sp);
      g += '<line x1="' + x + '" y1="' + Y1 + '" x2="' + x + '" y2="' + (Y1 + 4) + '" stroke="#8A7A66" stroke-width="1"/>';
      g += '<text x="' + x + '" y="' + (Y1 + 17) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + (unit === 'in' ? sp : trim1(sp * KM_PER_MI)) + '</text>';
    });
    [lo, hi].forEach(function (k) {
      var y = sy(k);
      g += '<line x1="' + (X0 - 4) + '" y1="' + y + '" x2="' + X0 + '" y2="' + y + '" stroke="#8A7A66" stroke-width="1"/>';
      g += '<text x="' + (X0 - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-family="Inter,sans-serif" font-size="12" fill="#8A7A66">' + Math.round(k) + '</text>';
    });
    lines.forEach(function (ln) {
      var pts = ln.pts.map(function (p) { return sx(p.sp) + ',' + sy(p.k); }).join(' ');
      g += '<polyline points="' + pts + '" fill="none" stroke="' + ln.inc.c + '" stroke-width="2"/>';
    });
    var selLine = lines.filter(function (ln) { return ln.inc.p === inclinePct; })[0] || lines[0];
    var selK = kcalFor(speedMph, inclinePct, distMi, wKg);
    g += '<circle cx="' + sx(speedMph) + '" cy="' + sy(selK) + '" r="4" fill="' + selLine.inc.c + '" stroke="#fff" stroke-width="2"/>';
    g += '<text x="' + ((X0 + X1) / 2) + '" y="178" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#5B4C3B">Speed (' + (unit === 'in' ? 'mph' : 'km/h') + ')</text>';
    g += '<text x="13" y="' + ((Y0 + Y1) / 2) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#5B4C3B" transform="rotate(-90 13 ' + ((Y0 + Y1) / 2) + ')">Calories (kcal)</text>';
    svg.innerHTML = g;
  }

  function solve() {
    var resBig = $('resBig'), resUnit = $('resUnit'), resSub = $('resSub');
    var gauge = $('stmGauge'), marker = $('stmMarker'), cat = $('stmCat');
    var steps = num(stepsIn.value);

    if (!(isFinite(steps) && steps > 0)) {
      resBig.textContent = '—'; if (resUnit) resUnit.textContent = '';
      resSub.textContent = 'Enter your steps to see the distance.';
      if (gauge) gauge.style.visibility = 'hidden';
      if (cat) cat.textContent = '';
      if (advOut) advOut.style.display = 'none';
      return;
    }

    var strideI = strideInches();
    var distMi = steps * strideI / IN_PER_MILE;
    var distKm = distMi * KM_PER_MI;
    var stepsPerMile = Math.round(IN_PER_MILE / strideI);

    resBig.textContent = unit === 'in' ? one(distMi) : one(distKm);
    if (resUnit) resUnit.textContent = unit === 'in' ? 'mi' : 'km';
    resSub.textContent = '≈ ' + stepsPerMile.toLocaleString() + ' steps per mile at a ' +
      (unit === 'in' ? one(strideI) + '"' : one(strideI * 2.54) + ' cm') + ' stride';

    if (gauge && marker) {
      gauge.style.visibility = 'visible';
      marker.style.left = Math.max(0, Math.min(100, distMi / MAX_MI * 100)) + '%';
    }
    if (cat) {
      var reached = null, i;
      for (i = LANDMARKS.length - 1; i >= 0; i--) { if (distMi >= LANDMARKS[i].mi) { reached = LANDMARKS[i]; break; } }
      if (distMi >= MAX_MI) {
        cat.innerHTML = 'That’s <strong>' + one(distMi / MAX_MI) + ' marathons</strong> worth of walking.';
      } else if (reached) {
        cat.innerHTML = 'That’s about the same distance as <strong>' + reached.label + '</strong>.';
      } else {
        cat.innerHTML = 'Keep going — every step counts toward that first mile.';
      }
    }

    if (advOut) {
      var wKg = weightIn ? toKg(num(weightIn.value)) : NaN;
      if (advanced && isFinite(wKg) && wKg > 0) {
        var kcal = kcalFor(speedMph, inclinePct, distMi, wKg);
        var durMin = distMi / speedMph * 60;
        var speedTxt = unit === 'in' ? trim1(speedMph) + ' mph' : trim1(speedMph * KM_PER_MI) + ' km/h';
        $('calSummary').innerHTML = 'At <strong>' + speedTxt + '</strong> on a <strong>' + inclinePct + '% incline</strong>, this distance takes about <strong>' + durTxt(durMin) + '</strong> and burns approximately <strong>' + Math.round(kcal) + ' kcal</strong>.';
        if ($('calChartWrap')) $('calChartWrap').style.display = '';
        renderCalChart(distMi, wKg);
        advOut.style.display = '';
      } else if (advanced) {
        $('calSummary').innerHTML = 'Enter your weight above to see calories burned for this distance.';
        advOut.style.display = '';
        if ($('calChartWrap')) $('calChartWrap').style.display = 'none';
      } else {
        advOut.style.display = 'none';
      }
    }
  }

  if (unitSeg) unitSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    unit = b.getAttribute('data-unit');
    applyUnit(); solve();
  });
  if (sexSeg) sexSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    sex = b.getAttribute('data-sex');
    [].forEach.call(sexSeg.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    solve();
  });
  if (speedChips) speedChips.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    speedMph = parseFloat(b.getAttribute('data-mph'));
    [].forEach.call(speedChips.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    solve();
  });
  if (inclineChips) inclineChips.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    inclinePct = parseFloat(b.getAttribute('data-inc'));
    [].forEach.call(inclineChips.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    solve();
  });
  [stepsIn, heightIn, strideIn, weightIn].forEach(function (inp) { if (inp) inp.addEventListener('input', solve); });

  if (advBtn) advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    if (advIn) advIn.style.display = advanced ? '' : 'none';
    solve();
    if (advanced && advIn && advIn.scrollIntoView) advIn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  if (cfg.unit === 'in' || cfg.unit === 'cm') unit = cfg.unit;
  else if (prefersImperial()) unit = 'in';
  applyUnit();
  buildTicks();
  solve();
};

/* -----------------------------------------------------------
   CalcThis.initProteinCalc(cfg) — daily protein target.
   Independent engine. Goal picks a g/kg-of-bodyweight multiplier
   (Sedentary/RDA 0.8, General fitness 1.4, Muscle gain 1.9,
   Cutting 2.4). If a body-fat % is entered (Go advanced), the
   target switches to g/kg-of-LEAN-mass instead (1.0/1.6/2.3/2.7),
   which is re-expressed as an effective g/kg-bodyweight figure so
   it plots on the same gauge either way. Age 65+ bumps the
   Sedentary/RDA baseline from 0.8 to 1.1 g/kg (PROT-AGE Study
   Group recommends 1.0-1.2 g/kg for older adults against
   sarcopenia; the other goals already sit above that threshold).
   Sex gates a Pregnant/Breastfeeding option in Go advanced, adding
   the RDA deltas (+14 g/day pregnancy, +25 g/day breastfeeding) on
   top of the selected goal.
   Differentiator: a live gauge (bar + marker + ticks, same
   technique as VO2 Max's vx-gauge, fixed science-based bands
   instead of per-user norms) plotting the target across the full
   RDA -> aggressive-cut spectrum, instead of every competitor's
   bare number. Plus food equivalents (same divisors as the Macro
   calculator: ~46g/chicken breast, ~6g/egg) and (Go advanced) a
   per-meal split table. Live, no button. */
CalcThis.initProteinCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var LB_PER_KG = 2.2046226;
  var unit = 'imp', sex = 'female', goal = 'fit', special = 'none', meals = 4, advanced = false;

  // g per kg of TOTAL bodyweight (simple/default mode); sed is the under-65 RDA figure
  var GOAL_TOTAL = { sed: 0.8, fit: 1.4, gain: 1.9, cut: 2.4 };
  // g per kg of LEAN mass (advanced mode, when body fat % is entered)
  var GOAL_LBM = { sed: 1.0, fit: 1.6, gain: 2.3, cut: 2.7 };
  var GOAL_LABEL = { sed: 'Sedentary (RDA)', fit: 'General fitness', gain: 'Muscle gain', cut: 'Fat loss (cutting)' };
  // PROT-AGE Study Group: 1.0-1.2 g/kg for adults 65+ (midpoint used below), vs 0.8 standard RDA
  var SED_OLDER_TOTAL = 1.1, SED_OLDER_LBM = 1.3;
  // RDA absolute increments over non-pregnant baseline
  var SPECIAL_ADD = { pregnant: 14, breastfeeding: 25 };

  var SCALE_MIN = 0.8, SCALE_MAX = 2.8;
  var BAND_EDGES = [0.8, 1.2, 1.6, 2.2, 2.8];
  var BAND_COLORS = ['#8F5C13', '#B5761F', '#5A7361', '#37503F'];

  var weightIn = $('piWeight'), bfIn = $('piBf'), ageIn = $('piAge');
  if (!weightIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function r0(n) { return Math.round(n); }

  // effGPerKg is always the canonical g/kg figure (the formulas are calibrated in kg);
  // the gauge and its tick labels display in whichever unit is currently selected —
  // g/lb when unit is 'imp' (the common US "grams per pound" framing), g/kg when 'met'.
  function renderGauge(effGPerKg) {
    var gauge = $('piGauge'), marker = $('piMarker'), bar = $('piBar'), ticks = $('piTicks');
    if (!gauge) return;
    gauge.style.visibility = 'visible';
    var conv = unit === 'imp' ? (1 / LB_PER_KG) : 1;
    var dp = unit === 'imp' ? 2 : 1;
    var stops = [];
    for (var i = 0; i < 4; i++) {
      var p0 = (BAND_EDGES[i] - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      var p1 = (BAND_EDGES[i + 1] - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      stops.push(BAND_COLORS[i] + ' ' + p0 + '%', BAND_COLORS[i] + ' ' + p1 + '%');
    }
    bar.style.background = 'linear-gradient(to right,' + stops.join(',') + ')';
    var pct = (effGPerKg - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
    marker.style.left = Math.max(0, Math.min(100, pct)) + '%';
    var html = '';
    BAND_EDGES.forEach(function (v) {
      var p = (v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      html += '<span style="left:' + p + '%">' + (v * conv).toFixed(dp) + '</span>';
    });
    ticks.innerHTML = html;
  }

  function renderEquiv(proteinG) {
    var wrap = $('piEquiv'); if (!wrap) return;
    var chicken = (proteinG / 46).toFixed(1);
    var eggs = Math.round(proteinG / 6);
    $('piEquivTxt').innerHTML = '<strong>' + chicken + '</strong> chicken breasts &nbsp;·&nbsp; <strong>' + eggs + '</strong> eggs';
    wrap.style.display = '';
  }

  function renderMeals(proteinG) {
    var wrap = $('piAdvOut'); if (!wrap) return;
    if (!advanced) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    var per = Math.floor(proteinG / meals);
    var rem = proteinG - per * meals;
    var body = '';
    for (var i = 1; i <= meals; i++) {
      var g = per + (i === meals ? rem : 0);
      body += '<tr><td>Meal ' + i + '</td><td>' + g + ' g</td></tr>';
    }
    $('piMealTable').innerHTML = '<thead><tr><th>Meal</th><th>Protein</th></tr></thead><tbody>' + body + '</tbody>';
  }

  function solve() {
    var wRaw = num(weightIn.value);
    var resBig = $('piResBig'), resSub = $('piResSub'), catEl = $('piCat');
    if (!(isFinite(wRaw) && wRaw > 0)) {
      resBig.textContent = '—';
      resSub.textContent = 'Enter your weight to see your daily protein target.';
      if ($('piGauge')) $('piGauge').style.visibility = 'hidden';
      if (catEl) catEl.innerHTML = '';
      if ($('piEquiv')) $('piEquiv').style.display = 'none';
      if ($('piAdvOut')) $('piAdvOut').style.display = 'none';
      return;
    }
    var wKg = unit === 'imp' ? wRaw / LB_PER_KG : wRaw;
    var age = num(ageIn ? ageIn.value : '');
    var isOlder = isFinite(age) && age >= 65;
    var bf = num(bfIn ? bfIn.value : '');
    var hasBf = isFinite(bf) && bf > 0 && bf < 60;
    var protein, effGPerKg;
    if (hasBf) {
      var lbm = wKg * (1 - bf / 100);
      var lbmMult = (goal === 'sed' && isOlder) ? SED_OLDER_LBM : GOAL_LBM[goal];
      protein = lbm * lbmMult;
      effGPerKg = protein / wKg;
    } else {
      effGPerKg = (goal === 'sed' && isOlder) ? SED_OLDER_TOTAL : GOAL_TOTAL[goal];
      protein = wKg * effGPerKg;
    }
    var hasSpecial = advanced && sex === 'female' && special !== 'none';
    var specialAdd = hasSpecial ? SPECIAL_ADD[special] : 0;
    protein += specialAdd;
    var proteinG = r0(protein);
    resBig.textContent = proteinG;
    $('piResUnit').textContent = 'g / day';
    var dispVal = unit === 'imp' ? (effGPerKg / LB_PER_KG).toFixed(2) : effGPerKg.toFixed(1);
    var dispUnit = unit === 'imp' ? 'g/lb' : 'g/kg';
    var subParts = 'at ' + dispVal + ' ' + dispUnit + (hasBf ? ' bodyweight-equivalent (lean-mass basis)' : '') +
      (goal === 'sed' && isOlder ? ' (age 65+ baseline)' : '') + ' for ' + GOAL_LABEL[goal];
    if (hasSpecial) subParts += ' + ' + specialAdd + ' g/day for ' + special;
    resSub.textContent = subParts;
    var catTxt = 'Goal: <strong>' + GOAL_LABEL[goal] + '</strong>' + (hasBf ? ' · based on your lean body mass' : '');
    if (goal === 'sed' && isOlder) catTxt += ' · age-65+ baseline';
    if (hasSpecial) catTxt += ' · +' + specialAdd + ' g/day for ' + special;
    catEl.innerHTML = catTxt;
    renderGauge(effGPerKg);
    renderEquiv(proteinG);
    renderMeals(proteinG);
  }

  function seg(id, attr, fn) {
    var box = $(id); if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(box.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on'); fn(b.getAttribute(attr));
    });
  }

  seg('piUnitSeg', 'data-u', function (v) {
    if (v === unit) return;
    var w = num(weightIn.value);
    unit = v;
    $('piWUnit').textContent = unit === 'met' ? 'kg' : 'lb';
    if (isFinite(w) && w > 0) {
      weightIn.value = Math.round(unit === 'met' ? w / LB_PER_KG : w * LB_PER_KG);
    }
    solve();
  });
  seg('piGoalChips', 'data-goal', function (v) { goal = v; solve(); });
  seg('piMealsChips', 'data-meals', function (v) { meals = parseInt(v, 10); solve(); });
  seg('piSexSeg', 'data-sex', function (v) {
    sex = v;
    var sp = $('piSpecialRow'); if (sp) sp.style.display = (advanced && sex === 'female') ? '' : 'none';
    solve();
  });
  seg('piSpecialSeg', 'data-special', function (v) { special = v; solve(); });

  [weightIn, bfIn, ageIn].forEach(function (inp) { if (inp) inp.addEventListener('input', solve); });

  var advBtn = $('piAdvBtn');
  if (advBtn) advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('piAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('piAdvIn').style.display = advanced ? '' : 'none';
    if (!advanced && bfIn) bfIn.value = '';
    var sp = $('piSpecialRow'); if (sp) sp.style.display = (advanced && sex === 'female') ? '' : 'none';
    solve();
  });

  solve();
};

/* ===== CalcThis Square Footage engine =====
   CalcThis.initSqftCalc() — 13 shape modes (rectangle family, circle family,
   triangle family, trapezoid family, wall-minus-window, known area), a
   running multi-area project tally (same trow/waste/mbar discipline as the
   volume/area cores), and a live SVG diagram that redraws proportionally as
   dimensions are typed, with an exact-value legend below it. Independent
   engine, no shared state with the volume/area cores — their material/box/
   bag layer doesn't apply to a pure area calculator. */
CalcThis.initSqftCalc = function () {
  var $ = function (id) { return document.getElementById(id); };
  var FT2_PER_M2 = 10.7639104, ACRE_FT2 = 43560, SQFT_PER_SQYD = 9, HECTARE_M2 = 10000;

  var sys = 'us', shape = 'rect';
  var tally = [];               // {label, areaSqft, areaM2, rate}
  var waste = { active: false, pct: '' };

  var FIELD_LABEL = {
    len: 'length', wid: 'width', side: 'side',
    rbL: 'outer length', rbW: 'outer width', rbBw: 'border width',
    roomLen: 'length', roomWid: 'width',
    dia: 'diameter',
    cbDia: 'outer diameter', cbBw: 'border width',
    anOut: 'outer diameter', anIn: 'inner diameter',
    t3a: 'side A', t3b: 'side B', t3c: 'side C',
    tbBase: 'base', tbH: 'height',
    trB1: 'base 1', trB2: 'base 2', trH: 'height',
    cwB1: 'short height', cwB2: 'tall height', cwH: 'width',
    wwL: 'wall length', wwH: 'wall height', winW: 'window width', winH: 'window height', winQty: 'window count',
    knownArea: 'area'
  };
  var SHAPE_NAME = {
    rect: 'Rectangle', square: 'Square', rectborder: 'Rectangle border', room: 'Room',
    circle: 'Circle', circleborder: 'Circle border', annulus: 'Annulus',
    tri3: 'Triangle', tribh: 'Triangle', trap: 'Trapezoid', cathedral: 'Cathedral wall',
    wallwin: 'Wall minus window', known: 'Known area'
  };
  var SHAPES = {
    rect: { fields: ['len', 'wid'], calc: function (v) { return v.len * v.wid; } },
    square: { fields: ['side'], calc: function (v) { return v.side * v.side; } },
    rectborder: { fields: ['rbL', 'rbW', 'rbBw'], calc: function (v) { var iL = v.rbL - 2 * v.rbBw, iW = v.rbW - 2 * v.rbBw; if (iL <= 0 || iW <= 0) return NaN; return v.rbL * v.rbW - iL * iW; } },
    room: { fields: ['roomLen', 'roomWid'], calc: function (v) { return v.roomLen * v.roomWid; } },
    circle: { fields: ['dia'], calc: function (v) { var r = v.dia / 2; return Math.PI * r * r; } },
    circleborder: { fields: ['cbDia', 'cbBw'], calc: function (v) { var r = v.cbDia / 2, ir = r - v.cbBw; if (ir <= 0) return NaN; return Math.PI * (r * r - ir * ir); } },
    annulus: { fields: ['anOut', 'anIn'], calc: function (v) { if (v.anIn >= v.anOut) return NaN; var ro = v.anOut / 2, ri = v.anIn / 2; return Math.PI * (ro * ro - ri * ri); } },
    tri3: { fields: ['t3a', 't3b', 't3c'], calc: function (v) { var a = v.t3a, b = v.t3b, c = v.t3c; if (a + b <= c || a + c <= b || b + c <= a) return NaN; var s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); } },
    tribh: { fields: ['tbBase', 'tbH'], calc: function (v) { return 0.5 * v.tbBase * v.tbH; } },
    trap: { fields: ['trB1', 'trB2', 'trH'], calc: function (v) { return 0.5 * (v.trB1 + v.trB2) * v.trH; } },
    cathedral: { fields: ['cwB1', 'cwB2', 'cwH'], calc: function (v) { return 0.5 * (v.cwB1 + v.cwB2) * v.cwH; } },
    wallwin: { fields: ['wwL', 'wwH', 'winW', 'winH', 'winQty'], calc: function (v) { var a = v.wwL * v.wwH - (v.winQty || 1) * (v.winW * v.winH); if (a <= 0) return NaN; return a; } },
    known: { fields: ['knownArea'], calc: function (v) { return v.knownArea; } }
  };

  function num(id) { var el = $(id); if (!el) return NaN; var n = parseFloat((el.value || '').trim()); return isNaN(n) ? NaN : n; }
  function fmt(n) { if (n == null || isNaN(n)) return '—'; if (n >= 100) return n.toFixed(1).replace(/\.0$/, ''); var r = Math.round(n * 100) / 100; var s = '' + r; if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, ''); return s || '0'; }
  function money(n) { return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtLen(n) { return (n == null || isNaN(n)) ? '?' : fmt(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function rawVals() {
    var v = {};
    SHAPES[shape].fields.forEach(function (f) { v[f] = num(f); });
    if (shape === 'wallwin' && (isNaN(v.winQty) || v.winQty <= 0)) v.winQty = 1;
    return v;
  }
  function qtyVal() { var q = num('sqQty'); return (!isNaN(q) && q > 0) ? Math.floor(q) : 1; }

  function localArea() {
    var v = rawVals(), fields = SHAPES[shape].fields;
    for (var i = 0; i < fields.length; i++) { var f = fields[i]; if (f === 'winQty') continue; if (isNaN(v[f]) || v[f] <= 0) return null; }
    var a = SHAPES[shape].calc(v);
    if (isNaN(a) || a <= 0) return null;
    return a;
  }
  function listMissing() {
    var v = rawVals(), m = [];
    SHAPES[shape].fields.forEach(function (f) { if (f === 'winQty') return; if (isNaN(v[f]) || v[f] <= 0) m.push(FIELD_LABEL[f]); });
    if (!m.length) return 'valid dimensions';
    if (m.length === 1) return m[0];
    return m.slice(0, -1).join(', ') + ' and ' + m[m.length - 1];
  }
  function currentArea() {
    var a = localArea(); if (a == null) return null;
    a *= qtyVal();
    var areaSqft, areaM2;
    if (sys === 'us') { areaSqft = a; areaM2 = a / FT2_PER_M2; } else { areaM2 = a; areaSqft = a * FT2_PER_M2; }
    return { areaSqft: areaSqft, areaM2: areaM2 };
  }
  function areaComplete() { return currentArea() != null; }
  function areaUnit() { return sys === 'us' ? 'sq ft' : 'm²'; }
  function subConv(v) {
    if (sys === 'us') {
      var yd = v.areaSqft / SQFT_PER_SQYD, ac = v.areaSqft / ACRE_FT2;
      var s = '= ' + fmt(yd) + ' sq yd';
      if (ac >= 0.01) s += ' · ' + fmt(ac) + ' acres';
      return s;
    }
    var ha = v.areaM2 / HECTARE_M2;
    var s2 = '= ' + fmt(v.areaSqft) + ' sq ft';
    if (ha >= 0.01) s2 += ' · ' + fmt(ha) + ' ha';
    return s2;
  }
  function priceVal() { var p = num('sqPrice'); return (!isNaN(p) && p > 0) ? p : null; }
  function liveRateSqft() { var p = priceVal(); if (p == null) return null; return sys === 'us' ? p : p / FT2_PER_M2; }
  function costFor(v) { var p = priceVal(); if (p == null) return null; return (sys === 'us' ? v.areaSqft : v.areaM2) * p; }
  function areaLabel() {
    if (shape === 'room') { var nm = $('roomName'); return (nm && nm.value.trim()) || 'Room'; }
    return SHAPE_NAME[shape];
  }

  /* ---------- live diagram (proportioned outline + exact-value legend) ---------- */
  function diagramUnit() { return sys === 'us' ? 'ft' : 'm'; }
  function legendRow(v) {
    var out = '';
    SHAPES[shape].fields.forEach(function (f) {
      if (f === 'winQty') { out += '<span><b>Windows</b> ' + (isNaN(v[f]) ? 1 : v[f]) + '</span>'; return; }
      var unit = (shape === 'known') ? areaUnit() : diagramUnit();
      out += '<span><b>' + cap(FIELD_LABEL[f]) + '</b> ' + fmtLen(v[f]) + ' ' + unit + '</span>';
    });
    return out;
  }
  function scaledBox(lRaw, wRaw, IW, IH) {
    var l = (!isNaN(lRaw) && lRaw > 0) ? lRaw : 1, w = (!isNaN(wRaw) && wRaw > 0) ? wRaw : 1;
    var ar = l / w; ar = Math.max(0.35, Math.min(2.85, ar));
    var rw, rh;
    if (ar >= IW / IH) { rw = IW; rh = IW / ar; } else { rh = IH; rw = IH * ar; }
    return { w: rw, h: rh };
  }
  function diagramFor(key, v) {
    var PADX = 40, PADY = 26, IW = 300 - PADX * 2, IH = 150 - PADY * 2;
    var CX = 150, CY = 26 + IH / 2;
    var FILL = 'rgba(55,80,63,.10)', STROKE = 'var(--ink)';
    function poly(pts) { return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="1.6" stroke-linejoin="round"/>'; }

    if (key === 'rect' || key === 'square' || key === 'room') {
      var l = key === 'square' ? v.side : (key === 'room' ? v.roomLen : v.len);
      var w = key === 'square' ? v.side : (key === 'room' ? v.roomWid : v.wid);
      var b = scaledBox(l, w, IW, IH);
      var x = CX - b.w / 2, y = CY - b.h / 2;
      return '<rect x="' + x + '" y="' + y + '" width="' + b.w + '" height="' + b.h + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="1.6" rx="2"/>';
    }
    if (key === 'rectborder') {
      var b2 = scaledBox(v.rbL, v.rbW, IW, IH);
      var x2 = CX - b2.w / 2, y2 = CY - b2.h / 2;
      var pxPerUnit = b2.w / (v.rbL || 1);
      var bwPx = Math.min(b2.w / 2 - 4, Math.max(4, (isNaN(v.rbBw) ? 0 : v.rbBw) * pxPerUnit));
      var s = '<rect x="' + x2 + '" y="' + y2 + '" width="' + b2.w + '" height="' + b2.h + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="1.6"/>';
      s += '<rect x="' + (x2 + bwPx) + '" y="' + (y2 + bwPx) + '" width="' + Math.max(2, b2.w - 2 * bwPx) + '" height="' + Math.max(2, b2.h - 2 * bwPx) + '" fill="var(--paper)" stroke="' + STROKE + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
      return s;
    }
    if (key === 'circle') {
      var r = Math.min(IW, IH) / 2;
      return '<circle cx="' + CX + '" cy="' + CY + '" r="' + r + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="1.6"/>' +
        '<line x1="' + (CX - r) + '" y1="' + CY + '" x2="' + (CX + r) + '" y2="' + CY + '" stroke="var(--amber)" stroke-width="1.2" stroke-dasharray="3 3"/>';
    }
    if (key === 'circleborder' || key === 'annulus') {
      var ro = Math.min(IW, IH) / 2;
      var ratio = key === 'circleborder'
        ? Math.max(0.15, Math.min(0.85, 1 - (isNaN(v.cbBw) ? 0 : v.cbBw) / ((v.cbDia || 1) / 2)))
        : Math.max(0.15, Math.min(0.85, (isNaN(v.anIn) ? 0 : v.anIn) / (v.anOut || 1)));
      var ri = ro * ratio;
      return '<circle cx="' + CX + '" cy="' + CY + '" r="' + ro + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="1.6"/>' +
        '<circle cx="' + CX + '" cy="' + CY + '" r="' + ri + '" fill="var(--paper)" stroke="' + STROKE + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
    }
    if (key === 'tri3' || key === 'tribh') {
      var base = key === 'tribh' ? v.tbBase : v.t3a, height;
      if (key === 'tribh') { height = v.tbH; }
      else {
        var a = v.t3a, bb = v.t3b, c = v.t3c;
        if (isNaN(a) || isNaN(bb) || isNaN(c) || a <= 0) { base = 1; height = 1; }
        else { var cosA = (a * a + c * c - bb * bb) / (2 * a * c); cosA = Math.max(-1, Math.min(1, cosA)); var apexX = c * cosA; height = c * Math.sqrt(Math.max(0, 1 - cosA * cosA)); base = a; }
      }
      var tb = scaledBox(base, height, IW, IH);
      var bx = CX - tb.w / 2, by = CY + tb.h / 2;
      var apexPx = key === 'tri3' && !isNaN(v.t3a) && !isNaN(v.t3b) && !isNaN(v.t3c) ? (bx + (v.t3c * Math.max(-1, Math.min(1, (v.t3a * v.t3a + v.t3c * v.t3c - v.t3b * v.t3b) / (2 * v.t3a * v.t3c)))) * (tb.w / (base || 1))) : (bx + tb.w * 0.35);
      return poly([[bx, by], [bx + tb.w, by], [apexPx, by - tb.h]]);
    }
    if (key === 'trap' || key === 'cathedral') {
      if (key === 'trap') {
        var tw = scaledBox(Math.max(v.trB1 || 1, v.trB2 || 1), v.trH || 1, IW, IH);
        var topW = tw.w * ((v.trB1 || 1) / Math.max(v.trB1 || 1, v.trB2 || 1));
        var botW = tw.w * ((v.trB2 || 1) / Math.max(v.trB1 || 1, v.trB2 || 1));
        var tx = CX - tw.w / 2, ty = CY - tw.h / 2, by2 = CY + tw.h / 2;
        return poly([[CX - topW / 2, ty], [CX + topW / 2, ty], [CX + botW / 2, by2], [CX - botW / 2, by2]]);
      }
      var maxH = Math.max(v.cwB1 || 1, v.cwB2 || 1);
      var cw = scaledBox(v.cwH || 1, maxH, IW, IH);
      var h1 = cw.h * ((v.cwB1 || 1) / maxH), h2 = cw.h * ((v.cwB2 || 1) / maxH);
      var lx = CX - cw.w / 2, rx = CX + cw.w / 2, baseY = CY + cw.h / 2;
      return poly([[lx, baseY - h1], [rx, baseY - h2], [rx, baseY], [lx, baseY]]);
    }
    if (key === 'wallwin') {
      var wb = scaledBox(v.wwL, v.wwH, IW, IH);
      var wx = CX - wb.w / 2, wy = CY - wb.h / 2;
      var s3 = '<rect x="' + wx + '" y="' + wy + '" width="' + wb.w + '" height="' + wb.h + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="1.6"/>';
      var winWpx = Math.min(wb.w * 0.7, Math.max(10, (isNaN(v.winW) ? wb.w * 0.25 : v.winW) * (wb.w / (v.wwL || 1))));
      var winHpx = Math.min(wb.h * 0.7, Math.max(10, (isNaN(v.winH) ? wb.h * 0.25 : v.winH) * (wb.h / (v.wwH || 1))));
      var winX = wx + wb.w * 0.18, winY = wy + (wb.h - winHpx) / 2;
      s3 += '<rect x="' + winX + '" y="' + winY + '" width="' + winWpx + '" height="' + winHpx + '" fill="var(--paper)" stroke="' + STROKE + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
      return s3;
    }
    return null; // known area — no shape to draw
  }
  function renderDiagram() {
    var box = $('sqDiagram'); if (!box) return;
    var v = rawVals();
    var shapeSvg = diagramFor(shape, v);
    var legend = '<div class="sq-diagram-legend">' + legendRow(v) + '</div>';
    if (shapeSvg == null) {
      box.innerHTML = '<div class="sq-diagram-empty">Known area is entered directly — no shape to draw.</div>' + legend;
      return;
    }
    box.innerHTML = '<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">' + shapeSvg + '</svg>' + legend;
  }

  /* ---------- live single area ---------- */
  function renderArea() {
    var v = currentArea(), b = $('addBtn'), complete = areaComplete();
    b.disabled = !complete; b.style.opacity = complete ? '1' : '.5'; b.style.cursor = complete ? 'pointer' : 'not-allowed';
    $('hint').style.display = complete ? 'none' : 'block';
    $('addNote').style.display = complete ? 'block' : 'none';
    if (!complete) $('hint').textContent = 'Enter ' + listMissing();
    $('resUnit').textContent = areaUnit();
    $('resCostWrap').classList.remove('hide');
    $('resTip').classList.remove('hide');
    if (v == null) {
      $('resQty').textContent = '—'; $('resSub').textContent = 'Enter dimensions to see the area.'; $('resCost').textContent = '—';
    } else {
      $('resQty').textContent = fmt(sys === 'us' ? v.areaSqft : v.areaM2);
      $('resSub').textContent = subConv(v);
      var c = costFor(v); $('resCost').textContent = (c != null) ? money(c) : '—';
    }
    renderDiagram();
  }

  /* ---------- project tally ---------- */
  function groupTotals() {
    var g = { areaSqft: 0, areaM2: 0, cost: 0, hasCost: false };
    tally.forEach(function (r) {
      g.areaSqft += r.areaSqft; g.areaM2 += r.areaM2;
      var c = (r.rate != null) ? r.areaSqft * r.rate : null;
      if (c != null) { g.cost += c; g.hasCost = true; }
    });
    return g;
  }
  function renderTally() {
    var body = $('tallyBody'), tot = $('projTotal');
    var g = groupTotals();
    var wp = waste.active ? parseFloat(waste.pct) : NaN;
    var hasWp = waste.active && !isNaN(wp) && wp > 0;
    var mlt = hasWp ? wp / 100 : 0;
    var wSqft = g.areaSqft * mlt, wM2 = g.areaM2 * mlt, wCost = g.cost * mlt;
    var tSqft = g.areaSqft + wSqft, tM2 = g.areaM2 + wM2, tCost = g.cost + wCost;

    updateMbar(g, tSqft, tM2, tCost);

    if (!tally.length) {
      body.innerHTML = '<div class="tally-empty">Doing more than one area? Add each above and they’ll total here.</div>';
      tot.style.display = 'none'; $('clearBtn').style.display = 'none';
      waste.active = false; waste.pct = ''; $('wastePct').value = '';
      $('wasteRow').style.display = 'none'; $('addWasteBtn').style.display = 'none';
      return;
    }
    $('clearBtn').style.display = 'inline';
    var html = '';
    tally.forEach(function (r, i) {
      var c = (r.rate != null) ? money(r.areaSqft * r.rate) : null;
      html += '<div class="trow"><span class="desc"><span class="d">' + r.label + '</span></span>'
        + '<span class="qt">' + fmt(sys === 'us' ? r.areaSqft : r.areaM2) + ' ' + areaUnit() + '</span>'
        + '<span class="rc' + (c == null ? ' na' : '') + '">' + (c == null ? '—' : c) + '</span>'
        + '<button class="x" data-i="' + i + '" aria-label="Remove">×</button></div>';
    });
    body.innerHTML = html;

    if (waste.active) {
      $('wasteRow').style.display = 'grid';
      $('addWasteBtn').style.display = 'none';
      var wq = $('wasteQty'), wr = $('wasteRc');
      if (hasWp) {
        wq.className = 'qt'; wq.textContent = '+' + fmt(sys === 'us' ? wSqft : wM2) + ' ' + areaUnit();
        if (g.hasCost) { wr.className = 'rc'; wr.textContent = '+' + money(wCost); } else { wr.className = 'rc na'; wr.textContent = '—'; }
      } else { wq.className = 'qt na'; wq.textContent = '—'; wr.className = 'rc na'; wr.textContent = '—'; }
    } else { $('wasteRow').style.display = 'none'; $('addWasteBtn').style.display = 'block'; }

    tot.style.display = 'grid';
    $('totalQty').textContent = fmt(sys === 'us' ? tSqft : tM2);
    $('totalUnit').textContent = areaUnit();
    if (g.hasCost) { $('totalCostRow').style.display = 'block'; $('totalCost').style.display = 'block'; $('totalCost').textContent = money(tCost); }
    else { $('totalCostRow').style.display = 'none'; $('totalCost').style.display = 'none'; }
  }
  function updateMbar(g, tSqft, tM2, tCost) {
    if (tally.length) {
      $('mLab').textContent = 'Project total';
      $('mSeg').innerHTML = '<b>' + fmt(sys === 'us' ? tSqft : tM2) + '</b> ' + areaUnit();
      if (g.hasCost) { $('mCostWrap').classList.remove('hide'); $('mCost').textContent = money(tCost); } else { $('mCostWrap').classList.add('hide'); }
      return;
    }
    $('mLab').textContent = 'This area';
    var v = currentArea();
    if (v == null) { $('mSeg').innerHTML = '<b>—</b> ' + areaUnit(); $('mCostWrap').classList.add('hide'); return; }
    $('mSeg').innerHTML = '<b>' + fmt(sys === 'us' ? v.areaSqft : v.areaM2) + '</b> ' + areaUnit();
    var c = costFor(v);
    if (c != null) { $('mCostWrap').classList.remove('hide'); $('mCost').textContent = money(c); } else { $('mCostWrap').classList.add('hide'); }
  }

  function renderAll() { renderArea(); renderTally(); }

  /* ---------- unit labels ---------- */
  function updateUnitLabels() {
    var du = diagramUnit();
    [].forEach.call(document.querySelectorAll('#sqFields [data-dim]'), function (el) { el.textContent = du; });
    var au = areaUnit();
    var kf = $('knownArea'); if (kf) { var suf = kf.parentElement.querySelector('[data-areaunit]'); if (suf) suf.textContent = au; }
    var pl = $('priceLab'), ps = $('priceSuf');
    if (pl) pl.textContent = 'Price per ' + au;
    if (ps) ps.textContent = '$/' + au;
  }

  /* ---------- events ---------- */
  var fieldsRoot = $('sqFields');
  if (fieldsRoot) fieldsRoot.addEventListener('input', renderAll);
  [$('sqQty'), $('sqPrice')].forEach(function (el) { if (el) el.addEventListener('input', renderAll); });

  $('shapeSel').addEventListener('change', function () {
    shape = this.value;
    [].forEach.call(document.querySelectorAll('#sqFields > div'), function (d) { d.style.display = (d.id === 'f-' + shape) ? 'block' : 'none'; });
    updateUnitLabels();
    renderAll();
  });

  $('unitSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.sys === sys) return;
    sys = b.dataset.sys;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    [].forEach.call(document.querySelectorAll('#sqFields input'), function (el) { el.value = ''; });
    updateUnitLabels();
    renderAll();
  });

  $('addBtn').addEventListener('click', function () {
    if (!areaComplete()) return;
    var v = currentArea(); if (v == null) return;
    tally.push({ label: areaLabel(), areaSqft: v.areaSqft, areaM2: v.areaM2, rate: liveRateSqft() });
    [].forEach.call(document.querySelectorAll('#sqFields input'), function (el) { el.value = ''; });
    $('sqQty').value = ''; $('sqPrice').value = '';
    renderAll();
    var first = document.querySelector('#f-' + shape + ' input'); if (first) first.focus();
  });
  $('clearFieldsBtn').addEventListener('click', function () {
    [].forEach.call(document.querySelectorAll('#sqFields input'), function (el) { el.value = ''; });
    $('sqQty').value = ''; $('sqPrice').value = '';
    renderAll();
  });
  $('tallyBody').addEventListener('click', function (e) {
    var x = e.target.closest('.x'); if (!x) return;
    tally.splice(+x.dataset.i, 1); renderTally();
  });
  $('clearBtn').addEventListener('click', function () { tally = []; renderTally(); });

  $('addWasteBtn').addEventListener('click', function () {
    if (!tally.length) return;
    waste.active = true; waste.pct = ''; $('wastePct').value = '';
    renderTally(); $('wastePct').focus();
  });
  $('wastePct').addEventListener('input', function () { waste.pct = this.value; renderTally(); });
  $('wasteRemove').addEventListener('click', function () { waste.active = false; waste.pct = ''; $('wastePct').value = ''; renderTally(); });

  updateUnitLabels();
  renderAll();
};

/* ===== CalcThis Stair engine =====
   CalcThis.initStairCalc() — solves a straight flight from total rise plus
   either a known run (per step or total) and either a target riser height or
   a fixed step count, for a standard or flush stringer mount. Differentiator
   vs. every competitor checked (calculator.net, Omnicalculator, ConCalculator,
   stair-calculator.com): a live to-scale side-view diagram, a colour-coded
   IRC/comfort code-check table, AND a materials + cost estimate (stringer
   count from stair width, stock-length rounding, tread/riser board footage
   with a waste allowance) — no competitor found in research combines a
   diagram with an actual buy-list. Independent engine, no shared state. */
CalcThis.initStairCalc = function () {
  var $ = function (id) { return document.getElementById(id); };

  var sys = 'us', runMode = 'perstep', riseMode = 'height', mount = 'standard';
  var riserClosed = true, headroomOn = false, stringerKey = '2x12';
  var STRINGER_W_IN = { '2x12': 11.25, '2x10': 9.25, '2x8': 7.25 };
  var STOCK_IN = [96, 120, 144, 168, 192, 240];   // 8/10/12/14/16/20 ft
  var STOCK_CM = [240, 300, 360, 420, 480, 600];  // 2.4/3/3.6/4.2/4.8/6 m

  function num(id) { var el = $(id); if (!el) return NaN; var n = parseFloat((el.value || '').trim()); return isNaN(n) ? NaN : n; }
  function fmt(n, dec) {
    if (n == null || isNaN(n)) return '—';
    dec = dec == null ? 2 : dec;
    var r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
    var s = r.toFixed(dec);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }
  function money(n) { return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function smallUnit() { return sys === 'us' ? 'in' : 'cm'; }
  function bigUnit() { return sys === 'us' ? 'ft' : 'm'; }
  function fmtSmall(n) { return fmt(n, 2) + ' ' + smallUnit(); }
  function fmtBig(nSmall) {
    if (nSmall == null || isNaN(nSmall)) return '—';
    if (sys === 'us') { var ft = Math.floor(nSmall / 12), inch = nSmall - ft * 12; return ft + "' " + fmt(inch, 1) + '"'; }
    return fmt(nSmall / 100, 2) + ' m';
  }

  function updateUnitLabels() {
    var bu = bigUnit(), su = smallUnit();
    [].forEach.call(document.querySelectorAll('[data-bigunit]'), function (el) { el.textContent = bu; });
    [].forEach.call(document.querySelectorAll('[data-smallunit]'), function (el) { el.textContent = su; });
    $('runLab').innerHTML = (runMode === 'perstep' ? 'Run per step' : 'Total run') + ' <span class="unit" data-bigunit-inline>' + su + '</span>';
    if (riseMode === 'height') {
      $('riseLab').innerHTML = 'Target riser height <span class="unit">' + su + '</span>';
      $('riseValSuf').textContent = su; $('riseValSuf').style.display = '';
    } else {
      $('riseLab').innerHTML = 'Number of steps <span class="unit">count</span>';
      $('riseValSuf').textContent = ''; $('riseValSuf').style.display = 'none';
    }
    $('lumberSuf').textContent = '$/' + bu;
  }

  function readInputs() {
    var TRbig = num('totalRise'), SWbig = num('stairWidth');
    var TR = (!isNaN(TRbig) && TRbig > 0) ? (sys === 'us' ? TRbig * 12 : TRbig * 100) : NaN;
    var SW = (!isNaN(SWbig) && SWbig > 0) ? (sys === 'us' ? SWbig * 12 : SWbig * 100) : NaN;
    var runValRaw = num('runVal'), riseValRaw = num('riseVal');
    var treadThick = num('treadThick'); if (isNaN(treadThick) || treadThick < 0) treadThick = sys === 'us' ? 1 : 2.5;
    var riserThick = num('riserThick'); if (isNaN(riserThick) || riserThick < 0) riserThick = sys === 'us' ? 0.75 : 1.9;
    var wastePctRaw = num('wastePct'); var wastePct = (!isNaN(wastePctRaw) && wastePctRaw >= 0) ? wastePctRaw : 10;
    var headroomVal = num('headroomVal');
    var headroomReqRaw = num('headroomReq'); var headroomReq = (!isNaN(headroomReqRaw) && headroomReqRaw > 0) ? headroomReqRaw : (sys === 'us' ? 80 : 203);
    var priceStringer = num('priceStringer'); if (isNaN(priceStringer) || priceStringer <= 0) priceStringer = null;
    var priceLumber = num('priceLumber'); if (isNaN(priceLumber) || priceLumber <= 0) priceLumber = null;
    return { TR: TR, SW: SW, runValRaw: runValRaw, riseValRaw: riseValRaw, treadThick: treadThick, riserThick: riserThick, wastePct: wastePct, headroomVal: headroomVal, headroomReq: headroomReq, priceStringer: priceStringer, priceLumber: priceLumber };
  }

  function solve() {
    var v = readInputs();
    var complete = !isNaN(v.TR) && !isNaN(v.runValRaw) && v.runValRaw > 0 && !isNaN(v.riseValRaw) && v.riseValRaw > 0;
    if (!complete) return null;

    var numSteps;
    if (riseMode === 'height') numSteps = Math.max(1, Math.round(v.TR / v.riseValRaw));
    else numSteps = Math.max(1, Math.round(v.riseValRaw));
    var actualRiser = v.TR / numSteps;

    var treadsForRun = mount === 'standard' ? Math.max(1, numSteps - 1) : numSteps;
    var runStep, totalRun;
    if (runMode === 'perstep') { runStep = v.runValRaw; totalRun = runStep * treadsForRun; }
    else { totalRun = v.runValRaw; runStep = totalRun / treadsForRun; }

    var stringerHeight = mount === 'flush' ? v.TR : v.TR - actualRiser;
    var stringerLength = Math.sqrt(totalRun * totalRun + stringerHeight * stringerHeight);
    var angleDeg = Math.atan2(stringerHeight, totalRun) * 180 / Math.PI;
    var numTreads = treadsForRun, numRisers = numSteps;

    /* ---- materials ---- */
    var spacingLimit = sys === 'us' ? 24 : 61;
    var numStringers = isNaN(v.SW) ? 2 : Math.max(2, Math.ceil(v.SW / spacingLimit) + 1);
    var buffer = sys === 'us' ? 12 : 30;
    var neededLen = stringerLength + buffer;
    var stock = sys === 'us' ? STOCK_IN : STOCK_CM;
    var stockLen = stock[stock.length - 1], overStock = true;
    for (var i = 0; i < stock.length; i++) { if (stock[i] >= neededLen) { stockLen = stock[i]; overStock = false; break; } }

    var SWforMat = isNaN(v.SW) ? null : v.SW;
    var treadLin = SWforMat != null ? numTreads * SWforMat : null;
    var riserLin = (riserClosed && SWforMat != null) ? numRisers * SWforMat : 0;
    var lumberLinRaw = (treadLin != null) ? treadLin + riserLin : null;
    var wasteMult = 1 + v.wastePct / 100;
    var lumberLinWaste = (lumberLinRaw != null) ? lumberLinRaw * wasteMult : null;

    var stringerCost = v.priceStringer != null ? numStringers * v.priceStringer : null;
    var lumberCost = (v.priceLumber != null && lumberLinWaste != null) ? (lumberLinWaste / (sys === 'us' ? 12 : 100)) * v.priceLumber : null;
    var totalCost = (stringerCost != null || lumberCost != null) ? (stringerCost || 0) + (lumberCost || 0) : null;

    return {
      v: v, numSteps: numSteps, actualRiser: actualRiser, runStep: runStep, totalRun: totalRun,
      stringerHeight: stringerHeight, stringerLength: stringerLength, angleDeg: angleDeg,
      numTreads: numTreads, numRisers: numRisers, numStringers: numStringers, stockLen: stockLen, overStock: overStock,
      treadLin: treadLin, riserLin: riserLin, lumberLinWaste: lumberLinWaste,
      stringerCost: stringerCost, lumberCost: lumberCost, totalCost: totalCost
    };
  }

  /* ---------- diagram ---------- */
  function capLine(x1, y1, x2, y2, color, w) {
    var cap = 5, dx = x2 - x1, dy = y2 - y1, mag = Math.sqrt(dx * dx + dy * dy) || 1;
    var px = -(dy / mag), py = dx / mag;
    var s = '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + color + '" stroke-width="' + w + '"/>';
    s += '<line x1="' + (x1 - px * cap).toFixed(1) + '" y1="' + (y1 - py * cap).toFixed(1) + '" x2="' + (x1 + px * cap).toFixed(1) + '" y2="' + (y1 + py * cap).toFixed(1) + '" stroke="' + color + '" stroke-width="' + w + '"/>';
    s += '<line x1="' + (x2 - px * cap).toFixed(1) + '" y1="' + (y2 - py * cap).toFixed(1) + '" x2="' + (x2 + px * cap).toFixed(1) + '" y2="' + (y2 + py * cap).toFixed(1) + '" stroke="' + color + '" stroke-width="' + w + '"/>';
    return s;
  }
  function renderDiagram(r) {
    var box = $('stairDiagram');
    if (!r) { box.innerHTML = '<div class="sq-diagram-empty">Enter your dimensions to see the diagram.</div>'; return; }
    var AXIS = 'rgba(36,26,17,.4)', DIM_RISE = 'var(--amber-deep)', DIM_RUN = 'var(--spruce)';
    var n = Math.min(r.numSteps, 14);
    var AXL = 48, AXB = 40, PADT = 14, PADR = 16, VW = 380, VH = 228;
    var IW = VW - AXL - PADR, IH = VH - PADT - AXB;
    var ar = r.totalRun / r.stringerHeight; ar = Math.max(0.6, Math.min(3.2, ar));
    var boxW, boxH;
    if (ar >= IW / IH) { boxW = IW; boxH = IW / ar; } else { boxH = IH; boxW = IH * ar; }
    var x0 = AXL, yBase = PADT + IH;
    var stepW = boxW / n, stepH = boxH / n;
    var topX = x0 + n * stepW, topY = yBase - n * stepH;

    var pts = [[x0, yBase]];
    for (var i = 1; i <= n; i++) {
      pts.push([x0 + (i - 1) * stepW, yBase - (i - 1) * stepH]);
      pts.push([x0 + i * stepW, yBase - (i - 1) * stepH]);
      pts.push([x0 + i * stepW, yBase - i * stepH]);
    }
    pts.push([topX, yBase]);
    var poly = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');

    var s = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" xmlns="http://www.w3.org/2000/svg" font-family="Inter,sans-serif">';
    /* stair silhouette + stringer line */
    s += '<polygon points="' + poly + '" fill="rgba(55,80,63,.12)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/>';
    s += '<line x1="' + x0 + '" y1="' + yBase + '" x2="' + topX + '" y2="' + topY + '" stroke="var(--ink-soft)" stroke-width="1.2" stroke-dasharray="3 3"/>';

    /* total-rise axis (left) */
    var riseAxisX = x0 - 18;
    s += '<line x1="' + riseAxisX + '" y1="' + topY + '" x2="' + x0 + '" y2="' + topY + '" stroke="' + AXIS + '" stroke-width="1" stroke-dasharray="2 2"/>';
    s += capLine(riseAxisX, yBase, riseAxisX, topY, AXIS, 1.1);
    s += '<text x="' + (riseAxisX - 9) + '" y="' + ((yBase + topY) / 2) + '" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink-soft)" transform="rotate(-90 ' + (riseAxisX - 9) + ' ' + ((yBase + topY) / 2) + ')">Total rise ' + fmtBig(r.v.TR) + '</text>';

    /* total-run axis (bottom) */
    var runAxisY = yBase + 18;
    s += '<line x1="' + topX + '" y1="' + yBase + '" x2="' + topX + '" y2="' + runAxisY + '" stroke="' + AXIS + '" stroke-width="1" stroke-dasharray="2 2"/>';
    s += capLine(x0, runAxisY, topX, runAxisY, AXIS, 1.1);
    s += '<text x="' + ((x0 + topX) / 2) + '" y="' + (runAxisY + 17) + '" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink-soft)">Total run ' + fmtBig(r.totalRun) + '</text>';

    /* angle arc */
    var rad = r.angleDeg * Math.PI / 180, arcR = 24;
    var ex = x0 + arcR * Math.cos(rad), ey = yBase - arcR * Math.sin(rad);
    s += '<path d="M ' + (x0 + arcR) + ' ' + yBase + ' A ' + arcR + ' ' + arcR + ' 0 0 0 ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + '" fill="none" stroke="var(--amber)" stroke-width="1.3"/>';
    s += '<text x="' + (x0 + arcR + 6) + '" y="' + (yBase - 8) + '" font-size="12" font-weight="700" fill="var(--amber-deep)">' + fmt(r.angleDeg, 1) + '&deg;</text>';

    /* one-step callout (run + rise of a single step) */
    var mid = Math.max(0, Math.min(n - 1, Math.floor(n / 2) - 1));
    var mx0 = x0 + mid * stepW, my0 = yBase - mid * stepH, mx1 = mx0 + stepW, my1 = my0 - stepH;
    s += capLine(mx0, my0 - 7, mx1 - 3, my0 - 7, DIM_RUN, 1.3);
    s += '<text x="' + ((mx0 + mx1) / 2 - 6) + '" y="' + (my0 - 12) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + DIM_RUN + '">' + fmtSmall(r.runStep) + '</text>';
    s += capLine(mx1 + 9, my0, mx1 + 9, my1, DIM_RISE, 1.3);
    s += '<text x="' + (mx1 + 13) + '" y="' + ((my0 + my1) / 2 + 4) + '" font-size="12" font-weight="700" fill="' + DIM_RISE + '">' + fmtSmall(r.actualRiser) + '</text>';

    s += '</svg>';
    var legend = '<div class="sq-diagram-legend"><span><b>Rise</b> ' + fmtSmall(r.actualRiser) + '</span><span><b>Run</b> ' + fmtSmall(r.runStep) + '</span><span><b>Steps</b> ' + r.numSteps + '</span><span><b>Angle</b> ' + fmt(r.angleDeg, 1) + '&deg;</span>' + (r.numSteps > 14 ? '<span>(diagram shows 14 of ' + r.numSteps + ' steps)</span>' : '') + '</div>';
    box.innerHTML = s + legend;
  }

  /* ---------- code & comfort checks ---------- */
  function checkRow(label, valueText, ok, note) {
    return '<tr><td>' + label + '</td><td>' + valueText + '</td><td class="' + (ok ? 'stair-ok' : 'stair-bad') + '">' + (ok ? '✓ Pass' : '✗ ' + note) + '</td></tr>';
  }
  function renderChecks(r) {
    var body = $('checksBody');
    if (!r) { body.innerHTML = '<tr><td colspan="3" class="stair-empty">Enter your dimensions to run the checks.</td></tr>'; return; }
    var us = sys === 'us';
    var rows = '';
    var riserMax = us ? 7.75 : 19.7;
    rows += checkRow('Riser height (max)', fmtSmall(r.actualRiser), r.actualRiser <= riserMax, 'over ' + riserMax + ' ' + smallUnit());
    var treadMin = us ? 10 : 25.4;
    rows += checkRow('Tread run (min)', fmtSmall(r.runStep), r.runStep >= treadMin, 'under ' + treadMin + ' ' + smallUnit());
    var comfort = 2 * r.actualRiser + r.runStep;
    var cLo = us ? 24 : 61, cHi = us ? 25 : 64;
    rows += checkRow('2×Riser + Run (comfort)', fmtSmall(comfort), comfort >= cLo && comfort <= cHi, 'outside ' + cLo + '–' + cHi + ' ' + smallUnit());
    rows += checkRow('Angle (comfort)', fmt(r.angleDeg, 1) + '&deg;', r.angleDeg >= 30 && r.angleDeg <= 40, 'outside 30–40°');
    if (!isNaN(r.v.SW)) {
      var widthMin = us ? 36 : 91.4;
      rows += checkRow('Stair width (min)', fmtSmall(r.v.SW), r.v.SW >= widthMin, 'under ' + widthMin + ' ' + smallUnit());
    }
    if (headroomOn && !isNaN(r.v.headroomVal)) {
      rows += checkRow('Headroom (min)', fmtSmall(r.v.headroomVal), r.v.headroomVal >= r.v.headroomReq, 'under ' + fmt(r.v.headroomReq, 1) + ' ' + smallUnit());
    }
    body.innerHTML = rows;
    var tip = $('headroomTip');
    if (headroomOn && !isNaN(r.v.headroomVal)) {
      var ok = r.v.headroomVal >= r.v.headroomReq;
      tip.style.display = 'block'; tip.className = 'res-tip adv-tip';
      tip.innerHTML = ok
        ? '<strong>Headroom OK</strong> — your planned ' + fmtSmall(r.v.headroomVal) + ' clears the ' + fmt(r.v.headroomReq, 1) + ' ' + smallUnit() + ' minimum.'
        : '<strong>Headroom too low</strong> — your planned ' + fmtSmall(r.v.headroomVal) + ' is under the ' + fmt(r.v.headroomReq, 1) + ' ' + smallUnit() + ' minimum. Raise the floor opening or lower the stair start.';
    } else { tip.style.display = 'none'; }
  }

  /* ---------- materials ---------- */
  function matRow(label, qty, cost) {
    return '<tr><td>' + label + '</td><td>' + qty + '</td><td' + (cost == null ? ' class="stair-na"' : '') + '>' + (cost == null ? '—' : money(cost)) + '</td></tr>';
  }
  function renderMaterials(r) {
    var body = $('matBody');
    if (!r) { body.innerHTML = '<tr><td colspan="3" class="stair-empty">Enter your dimensions to see the materials estimate.</td></tr>'; return; }
    var us = sys === 'us';
    var stockDisp = us ? fmt(r.stockLen / 12, 0) + ' ft' : fmt(r.stockLen / 100, 1) + ' m';
    var rows = '';
    rows += matRow('Stringers (' + (us ? stockDisp : stockDisp) + ' ea' + (r.overStock ? ', custom length' : '') + ')', r.numStringers + '&times;', r.stringerCost);
    if (r.treadLin != null) {
      rows += matRow('Tread boards', r.numTreads + '&times; (' + fmtBig(r.treadLin) + ' total)', null);
      if (riserClosed) rows += matRow('Riser boards', r.numRisers + '&times; (' + fmtBig(r.riserLin) + ' total)', null);
      rows += matRow('Tread + riser lumber, +' + fmt(r.v.wastePct, 0) + '% waste', fmtBig(r.lumberLinWaste), r.lumberCost);
    } else {
      rows += '<tr><td colspan="3" class="stair-empty">Enter stair width to estimate tread &amp; riser lumber.</td></tr>';
    }
    if (r.totalCost != null) rows += '<tr class="cur"><td colspan="2"><strong>Estimated total</strong></td><td><strong>' + money(r.totalCost) + '</strong></td></tr>';
    body.innerHTML = rows;
  }

  /* ---------- render all ---------- */
  function renderAll() {
    var r = solve();
    $('riseOutUnit').textContent = smallUnit();
    if (!r) {
      $('riseOut').textContent = '—';
      $('resSub').textContent = 'Enter your total rise, run and riser height (or step count).';
    } else {
      $('riseOut').textContent = fmt(r.actualRiser, 2);
      $('resSub').textContent = 'Run ' + fmtSmall(r.runStep) + ' · ' + r.numRisers + ' risers, ' + r.numTreads + ' treads · Angle ' + fmt(r.angleDeg, 1) + '° · Stringer ' + fmtBig(r.stringerLength);
    }
    renderDiagram(r);
    renderChecks(r);
    renderMaterials(r);
  }

  /* ---------- events ---------- */
  $('unitSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.sys === sys) return;
    sys = b.dataset.sys;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    [].forEach.call(document.querySelectorAll('.p-stair input[type="number"]'), function (el) { el.value = ''; });
    updateUnitLabels(); renderAll();
  });
  $('runModeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.m === runMode) return;
    runMode = b.dataset.m;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    $('runVal').value = ''; updateUnitLabels(); renderAll();
  });
  $('riseModeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.m === riseMode) return;
    riseMode = b.dataset.m;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    $('riseVal').value = ''; updateUnitLabels(); renderAll();
  });
  $('mountSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.m === mount) return;
    mount = b.dataset.m;
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    renderAll();
  });
  $('riserSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    riserClosed = b.dataset.m === 'yes';
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    $('riserThickFld').style.display = riserClosed ? '' : 'none';
    renderAll();
  });
  $('headroomSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    headroomOn = b.dataset.m === 'yes';
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    $('headroomFlds').style.display = headroomOn ? '' : 'none';
    renderAll();
  });
  $('stringerSel').addEventListener('change', function () { stringerKey = this.value; renderAll(); });

  var grid = document.querySelector('.p-stair .grid');
  if (grid) grid.addEventListener('input', function (e) { if (e.target.tagName === 'INPUT') renderAll(); });

  var advBtn = $('advBtn'), advPanel = $('advPanel');
  advBtn.addEventListener('click', function () {
    var advanced = advPanel.style.display === 'none';
    advPanel.style.display = advanced ? 'block' : 'none';
    advBtn.classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
  });

  updateUnitLabels();
  renderAll();
};

/* -----------------------------------------------------------
   CalcThis.initLbmCalc() — lean body mass.
   Boer/James/Hume formulas (adults) or Peters formula (age <=14)
   from height + weight + sex. Differentiator vs. calculator.net,
   Omnicalculator and ajdesigner (all checked live, all bare
   number/table output): a live lean-vs-fat composition bar, all
   three adult formulas plotted on one scale against a typical
   healthy range (reuses the Ideal Weight calculator's .iw-bar
   tick pattern exactly — same "multiple formulas as ticks on one
   scale" idea, not reinvented), an exact result from a known
   body-fat % (Go advanced), and a protein-target reference tied
   to lean mass. Independent engine, no shared state. Live, no
   button. */
CalcThis.initLbmCalc = function () {
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'cm', sex = 'female', ageCat = 'adult', advanced = false;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function toCm(v) { return unit === 'in' ? v * 2.54 : v; }
  function toKg(v) { return unit === 'in' ? v / 2.2046226 : v; }
  function fromKg(v) { return unit === 'in' ? v * 2.2046226 : v; }
  function wUnit() { return unit === 'in' ? 'lb' : 'kg'; }
  function r1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function r0(x) { return Math.round(x); }
  function pctScale(v, min, max) { return Math.max(0, Math.min(100, (v - min) / (max - min) * 100)); }

  function boer(W, H) { return sex === 'male' ? 0.407 * W + 0.267 * H - 19.2 : 0.252 * W + 0.473 * H - 48.3; }
  function james(W, H) { return sex === 'male' ? 1.1 * W - 128 * Math.pow(W / H, 2) : 1.07 * W - 148 * Math.pow(W / H, 2); }
  function hume(W, H) { return sex === 'male' ? 0.32810 * W + 0.33929 * H - 29.5336 : 0.29569 * W + 0.41813 * H - 43.2933; }
  function peters(W, H) { return 3.8 * (0.0215 * Math.pow(W, 0.6469) * Math.pow(H, 0.7236)); }
  function healthyBFRange() { return sex === 'male' ? [14, 25] : [21, 31]; }

  var PH = { cm: '165', in: '65' };
  function applyUnit() {
    $('uHeight').textContent = unit === 'in' ? 'in' : 'cm';
    $('uWeight').textContent = wUnit();
    $('height').placeholder = PH[unit];
    $('weight').placeholder = unit === 'in' ? '145' : '65';
    [].forEach.call($('unitSeg').children, function (x) { x.classList.toggle('on', x.getAttribute('data-unit') === unit); });
  }

  function renderBar(leanKg, W) {
    var wrap = $('lbmBarWrap');
    if (!(W > 0) || !(leanKg >= 0)) { wrap.style.visibility = 'hidden'; return; }
    wrap.style.visibility = 'visible';
    var leanPct = Math.max(0, Math.min(100, leanKg / W * 100)), fatPct = 100 - leanPct;
    $('lbmLeanSeg').style.width = leanPct + '%';
    $('lbmFatSeg').style.width = fatPct + '%';
    $('lbmLeanLab').textContent = r0(leanPct) + '%';
    $('lbmFatLab').textContent = r0(fatPct) + '%';
  }

  function solve() {
    var H = toCm(num($('height').value)), W = toKg(num($('weight').value));
    var resBig = $('resBig'), resSub = $('resSub'), resTip = $('resTip'), resUnit = $('resUnit'), resLab = $('resLab');
    var tableWrap = $('lbmTableWrap');

    if (!(H > 0 && W > 0)) {
      resBig.textContent = '—'; resUnit.textContent = '';
      resSub.textContent = 'Enter your height and weight to see your lean body mass.';
      resTip.textContent = '';
      $('lbmBarWrap').style.visibility = 'hidden';
      $('lbmTable').innerHTML = '';
      $('lbmViz').style.visibility = 'hidden';
      $('lbmProteinOut').innerHTML = '';
      return;
    }

    if (ageCat === 'child') {
      var lbmC = peters(W, H), bfC = (W - lbmC) / W * 100;
      resLab.textContent = 'Estimated lean body mass';
      resBig.textContent = r1(fromKg(lbmC)); resUnit.textContent = wUnit();
      resSub.textContent = 'Peters formula (ages 14 and younger) · implied body fat ' + r0(bfC) + '%';
      resTip.innerHTML = 'Adult formulas (Boer, James, Hume) are not derived for growing children, so this uses the pediatric <strong>Peters formula</strong> instead.';
      renderBar(lbmC, W);
      tableWrap.style.display = 'none';
      $('advOut').style.display = 'none';
      return;
    }
    tableWrap.style.display = '';

    var boerKg = boer(W, H), jamesKg = james(W, H), humeKg = hume(W, H);
    var bfRaw = num($('bfPct').value);
    var bfKnown = (advanced && bfRaw > 0 && bfRaw < 100) ? bfRaw : null;
    var exactKg = bfKnown != null ? W * (1 - bfKnown / 100) : null;
    var headlineKg = exactKg != null ? exactKg : boerKg;

    resLab.textContent = exactKg != null ? 'Lean body mass (exact)' : 'Lean body mass';
    resBig.textContent = r1(fromKg(headlineKg)); resUnit.textContent = wUnit();
    resSub.textContent = (exactKg != null ? 'From your ' + r1(bfKnown) + '% body fat' : 'Boer formula') +
      ' · ' + r0(headlineKg / W * 100) + '% of body weight';

    renderBar(headlineKg, W);

    var rows = '';
    [['Boer', boerKg, true], ['James', jamesKg, false], ['Hume', humeKg, false]].forEach(function (f) {
      var bf = (W - f[1]) / W * 100;
      rows += '<tr' + (f[2] ? ' class="cur"' : '') + '><td>' + f[0] + '</td><td>' + r1(fromKg(f[1])) + ' ' + wUnit() + '</td><td>' + r0(bf) + '%</td></tr>';
    });
    $('lbmTable').innerHTML = '<thead><tr><th>Formula</th><th>Lean mass</th><th>Body fat</th></tr></thead><tbody>' + rows + '</tbody>';

    var fMin = Math.min(boerKg, jamesKg, humeKg), fMax = Math.max(boerKg, jamesKg, humeKg);
    resTip.innerHTML = 'The three formulas span <strong>' + r1(fromKg(fMin)) + '–' + r1(fromKg(fMax)) + ' ' + wUnit() +
      '</strong> at this height and weight — that spread is the honest uncertainty in any height-and-weight estimate.';

    if (advanced) {
      $('advOut').style.display = '';
      var range = healthyBFRange();
      var bandLoKg = W * (1 - range[1] / 100), bandHiKg = W * (1 - range[0] / 100);
      var vals = [boerKg, jamesKg, humeKg, bandLoKg, bandHiKg]; if (exactKg != null) vals.push(exactKg);
      var scaleMin = Math.min.apply(null, vals) * 0.94, scaleMax = Math.max.apply(null, vals) * 1.06;
      function pct(v) { return pctScale(v, scaleMin, scaleMax); }
      $('lbmViz').style.visibility = 'visible';
      $('lbmBand').style.left = pct(bandLoKg) + '%';
      $('lbmBand').style.width = (pct(bandHiKg) - pct(bandLoKg)) + '%';
      var tHtml = '';
      [['Boer', boerKg], ['James', jamesKg], ['Hume', humeKg]].forEach(function (p) {
        tHtml += '<span class="iw-tick" style="left:' + pct(p[1]) + '%" title="' + p[0] + '"></span>';
      });
      $('lbmTickLayer').innerHTML = tHtml;
      $('lbmScaleTicks').innerHTML =
        '<span style="left:' + pct(bandLoKg) + '%">' + r0(fromKg(bandLoKg)) + '</span>' +
        '<span style="left:' + pct(bandHiKg) + '%">' + r0(fromKg(bandHiKg)) + '</span>';
      var curM = $('lbmCurMarker'), curKeyWrap = $('lbmCurKeyWrap');
      if (exactKg != null) { curM.style.display = ''; curM.style.left = pct(exactKg) + '%'; curKeyWrap.style.display = ''; }
      else { curM.style.display = 'none'; curKeyWrap.style.display = 'none'; }

      var loG = 1.6 * headlineKg, hiG = 2.2 * headlineKg;
      $('lbmProteinOut').innerHTML =
        '<div class="bf-cmp"><span class="k">Protein reference (1.6–2.2 g/kg lean mass)</span><span class="v">' + r0(loG) + '–' + r0(hiG) + ' g/day</span></div>' +
        '<p class="res-tip">Based on your lean mass, not total weight — see the <a href="/protein-intake-calculator/">protein intake calculator</a> for a full daily target.</p>';
    } else {
      $('advOut').style.display = 'none';
    }
  }

  $('unitSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    unit = b.getAttribute('data-unit'); applyUnit(); solve();
  });
  $('sexSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    sex = b.getAttribute('data-sex');
    [].forEach.call($('sexSeg').children, function (x) { x.classList.toggle('on', x === b); });
    solve();
  });
  $('ageSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    ageCat = b.getAttribute('data-age');
    [].forEach.call($('ageSeg').children, function (x) { x.classList.toggle('on', x === b); });
    var isChild = ageCat === 'child';
    $('sexRow').style.display = isChild ? 'none' : '';
    $('advRow').style.display = isChild ? 'none' : '';
    if (isChild && advanced) {
      advanced = false;
      $('advIn').style.display = 'none';
      $('advOut').style.display = 'none';
      $('advBtnLab').textContent = 'Go advanced';
      $('advBtn').classList.remove('open');
    }
    solve();
  });
  $('advBtn').addEventListener('click', function () {
    advanced = !advanced;
    $('advBtn').classList.toggle('open', advanced);
    $('advBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('advIn').style.display = advanced ? '' : 'none';
    solve();
  });
  [$('height'), $('weight'), $('bfPct')].forEach(function (el) { if (el) el.addEventListener('input', solve); });

  applyUnit();
  solve();
};

/* ===== CalcThis Waist-to-Hip Ratio engine =====
   CalcThis.initWhrCalc(cfg) — WHR = waist / hip. Unitless, so no
   conversion is needed for the ratio itself — waist and hip just need
   to share a unit, which the in/cm toggle already guarantees.
   Differentiator: a live sex-specific health-risk gauge (bar + marker +
   ticks, same technique as Protein Intake's pi-gauge) using WHO-based
   3-tier bands that differ by sex (female low <=0.80/mod .81-.85/high
   >=.86; male low <=0.95/mod .96-1.00/high >1.00), plus an informal
   apple/pear body-shape read. Go advanced adds a WHO absolute
   waist-circumference obesity cross-check (>=35in/88cm female,
   >=40in/102cm male) reusing the waist value already entered — no
   extra input. Independent engine, no shared state. */
CalcThis.initWhrCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'imp', sex = 'female', advanced = false;

  var SCALE_MIN = 0.65, SCALE_MAX = 1.15;
  var EDGES = {
    female: [0.65, 0.80, 0.85, 1.15],
    male: [0.65, 0.95, 1.00, 1.15]
  };
  var TICK_VALS = { female: [0.80, 0.85], male: [0.95, 1.00] };
  var BAND_COLORS = ['#37503F', '#B5761F', '#b23030'];
  var WAIST_OBESITY = { imp: { female: 35, male: 40 }, met: { female: 88, male: 102 } };

  var waistIn = $('whrWaist'), hipIn = $('whrHip'), heightIn = $('whrHeight');
  if (!waistIn) return;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }

  function risk(ratio) {
    var e = EDGES[sex];
    if (ratio <= e[1]) return 'low';
    if (ratio <= e[2]) return 'moderate';
    return 'high';
  }
  var RISK_LABEL = { low: 'Low health risk', moderate: 'Moderate health risk', high: 'Higher health risk' };
  var SHAPE_LABEL = {
    low: 'a "pear" tendency — more weight on the hips and thighs',
    moderate: 'an in-between build, sometimes called "avocado"-shaped',
    high: 'an "apple" tendency — more weight around the waist'
  };

  function renderGauge(ratio) {
    var gauge = $('whrGauge'), marker = $('whrMarker'), bar = $('whrBar'), ticks = $('whrTicks');
    if (!gauge) return;
    gauge.style.visibility = 'visible';
    var e = EDGES[sex], stops = [];
    for (var i = 0; i < 3; i++) {
      var p0 = (e[i] - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      var p1 = (e[i + 1] - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      stops.push(BAND_COLORS[i] + ' ' + p0 + '%', BAND_COLORS[i] + ' ' + p1 + '%');
    }
    bar.style.background = 'linear-gradient(to right,' + stops.join(',') + ')';
    var pct = (ratio - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
    marker.style.left = Math.max(0, Math.min(100, pct)) + '%';
    var html = '';
    TICK_VALS[sex].forEach(function (v) {
      var p = (v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100;
      html += '<span style="left:' + p + '%">' + v.toFixed(2) + '</span>';
    });
    ticks.innerHTML = html;
  }

  function renderAdvanced(waist) {
    var wrap = $('whrAdvOut'); if (!wrap) return;
    if (!advanced) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    var threshold = WAIST_OBESITY[unit][sex];
    var uLabel = unit === 'imp' ? 'in' : 'cm';
    var flag = $('whrWaistFlag');
    var msg = waist >= threshold
      ? 'Your waist alone (<strong>' + waist + ' ' + uLabel + '</strong>) is at or above the WHO abdominal-obesity threshold of <strong>' + threshold + ' ' + uLabel + '</strong> for ' + sex + 's, an independent risk marker on top of your WHR.'
      : 'Your waist alone (<strong>' + waist + ' ' + uLabel + '</strong>) is below the WHO abdominal-obesity threshold of <strong>' + threshold + ' ' + uLabel + '</strong> for ' + sex + 's.';
    var h = num(heightIn ? heightIn.value : '');
    if (isFinite(h) && h > 0) {
      var whtr = waist / h;
      var whtrTxt = whtr.toFixed(2);
      msg += whtr < 0.5
        ? ' Your waist-to-height ratio is <strong>' + whtrTxt + '</strong>, below the widely used 0.5 guideline (keep your waist under half your height).'
        : ' Your waist-to-height ratio is <strong>' + whtrTxt + '</strong>, at or above the widely used 0.5 guideline (keep your waist under half your height) — a second signal worth a look.';
    } else {
      msg += ' Add your height above to also check your waist-to-height ratio.';
    }
    flag.innerHTML = msg;
  }

  function solve() {
    var w = num(waistIn.value), h = num(hipIn.value);
    var resBig = $('whrResBig'), resSub = $('whrResSub'), catEl = $('whrCat');
    if (!(isFinite(w) && w > 0 && isFinite(h) && h > 0)) {
      resBig.textContent = '—';
      resSub.textContent = 'Enter your waist and hip measurements to see your ratio.';
      if ($('whrGauge')) $('whrGauge').style.visibility = 'hidden';
      if (catEl) catEl.innerHTML = '';
      if ($('whrAdvOut')) $('whrAdvOut').style.display = 'none';
      return;
    }
    var ratio = w / h;
    var r = risk(ratio);
    resBig.textContent = ratio.toFixed(2);
    $('whrResUnit').textContent = 'WHR';
    var uLabel = unit === 'imp' ? 'in' : 'cm';
    resSub.textContent = w + ' ' + uLabel + ' waist ÷ ' + h + ' ' + uLabel + ' hip';
    catEl.innerHTML = '<strong>' + RISK_LABEL[r] + '</strong> for a ' + sex + ' — ' + SHAPE_LABEL[r] + '.';
    renderGauge(ratio);
    renderAdvanced(w);
  }

  function seg(id, attr, fn) {
    var box = $(id); if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(box.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on'); fn(b.getAttribute(attr));
    });
  }

  var CM_PER_IN = 2.54;
  seg('whrUnitSeg', 'data-u', function (v) {
    if (v === unit) return;
    var w = num(waistIn.value), h = num(hipIn.value);
    unit = v;
    var lab = unit === 'met' ? 'cm' : 'in';
    $('whrWUnit').textContent = lab; $('whrHUnit').textContent = lab;
    if ($('whrHtUnit')) $('whrHtUnit').textContent = lab + ' · optional, adds a waist-to-height check';
    if (isFinite(w) && w > 0) waistIn.value = Math.round((unit === 'met' ? w * CM_PER_IN : w / CM_PER_IN) * 10) / 10;
    if (isFinite(h) && h > 0) hipIn.value = Math.round((unit === 'met' ? h * CM_PER_IN : h / CM_PER_IN) * 10) / 10;
    var ht = num(heightIn ? heightIn.value : '');
    if (heightIn && isFinite(ht) && ht > 0) heightIn.value = Math.round((unit === 'met' ? ht * CM_PER_IN : ht / CM_PER_IN) * 10) / 10;
    solve();
  });
  seg('whrSexSeg', 'data-sex', function (v) { sex = v; solve(); });

  [waistIn, hipIn].forEach(function (inp) { inp.addEventListener('input', solve); });
  if (heightIn) heightIn.addEventListener('input', solve);

  var advBtn = $('whrAdvBtn');
  if (advBtn) advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('whrAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    if ($('whrAdvIn')) $('whrAdvIn').style.display = advanced ? '' : 'none';
    solve();
  });

  solve();
};

/* ===== CalcThis Weighted Average engine =====
   CalcThis.initWavgCalc(cfg) — dynamic value+weight rows (reuses the
   GPA Calculator's add/remove-row pattern, generalized to 2 plain
   number fields instead of grade+credits+type). Differentiator: a
   live per-row contribution bar (weight_i / sum(weights) as a %,
   same stacked-segment technique as Water Intake/Lean Body Mass,
   color-cycling since row count is unbounded) plus a simple-average
   comparison line, and a Go-advanced reverse-solve mode (given a
   target weighted average and which row is unknown, solve for that
   row's value — same idea as Final Grade Calculator's target-solve,
   applied to an arbitrary row instead of a fixed final exam slot).
   Independent engine, no shared state. */
CalcThis.initWavgCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var rowsWrap = $('waRows');
  if (!rowsWrap) return;
  var rows = [];
  var rowId = 0;
  var advanced = false;
  var COLORS = 6;

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function fmt(n) {
    if (!isFinite(n)) return '—';
    var r = Math.round(n * 100) / 100;
    var s = '' + r;
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }

  function buildRow(id, data) {
    var div = document.createElement('div');
    div.className = 'wa-row';
    div.setAttribute('data-rid', id);
    div.innerHTML =
      '<input type="text" class="win wa-label" placeholder="Label" value="' + ((data && data.label) || '').replace(/"/g, '&quot;') + '" aria-label="Row label">' +
      '<input type="number" inputmode="decimal" class="win wa-value" placeholder="Value" value="' + ((data && data.value) || '') + '" aria-label="Value">' +
      '<input type="number" inputmode="decimal" class="win wa-weight" placeholder="Weight" value="' + ((data && data.weight != null) ? data.weight : '1') + '" aria-label="Weight">' +
      '<button class="x" type="button" aria-label="Remove row">&#215;</button>';
    function onChange() { readRow(id, div); solve(); }
    div.querySelector('.wa-label').addEventListener('input', onChange);
    div.querySelector('.wa-value').addEventListener('input', onChange);
    div.querySelector('.wa-weight').addEventListener('input', onChange);
    div.querySelector('.x').addEventListener('click', function () {
      rows = rows.filter(function (r) { return r._id !== id; });
      div.parentNode.removeChild(div);
      renderSolveOptions();
      solve();
    });
    return div;
  }

  function readRow(id, div) {
    var idx = -1;
    for (var i = 0; i < rows.length; i++) if (rows[i]._id === id) { idx = i; break; }
    var obj = {
      _id: id,
      label: div.querySelector('.wa-label').value,
      value: div.querySelector('.wa-value').value,
      weight: div.querySelector('.wa-weight').value
    };
    if (idx >= 0) rows[idx] = obj; else rows.push(obj);
  }

  function addRow(data) {
    var id = ++rowId;
    var obj = { _id: id, label: (data && data.label) || '', value: (data && data.value) || '', weight: (data && data.weight != null) ? data.weight : '1' };
    rows.push(obj);
    var div = buildRow(id, obj);
    rowsWrap.appendChild(div);
    renderSolveOptions();
    return div;
  }

  // Rebuilt only when rows are added/removed (not on every keystroke) — re-running
  // CalcThis.initCsel on every input would stack duplicate document-level listeners
  // (Escape/outside-click) forever, since initCsel is designed to run once per element.
  function renderSolveOptions() {
    var box = $('waSolveRow'); if (!box) return;
    var panel = box.querySelector('.csel-panel');
    var current = box.getAttribute('data-value');
    var validIds = {};
    var html = '';
    rows.forEach(function (r, i) {
      validIds[r._id] = true;
      var lab = (r.label && r.label.trim()) ? r.label.trim() : ('Row ' + (i + 1));
      html += '<button type="button" class="csel-opt' + (('' + r._id) === current ? ' on' : '') + '" role="option" data-value="' + r._id + '">' + lab.replace(/</g, '&lt;') + '</button>';
    });
    panel.innerHTML = html || '<button type="button" class="csel-opt" role="option" data-value="">No rows yet</button>';
    if (!validIds[current]) {
      box.setAttribute('data-value', rows.length ? ('' + rows[0]._id) : '');
    }
    CalcThis.initCsel(box);
  }

  function renderBar(shares) {
    var wrap = $('waBarWrap'), bar = $('waBar'), key = $('waKey');
    if (!shares.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    var barHtml = '', keyHtml = '';
    shares.forEach(function (s, i) {
      var c = 'c' + (i % COLORS);
      var pct = s.pct;
      barHtml += '<span class="wavg-seg ' + c + '" style="width:' + pct + '%">' + (pct >= 8 ? pct.toFixed(0) + '%' : '') + '</span>';
      keyHtml += '<span><i class="' + c + '"></i>' + s.label + ' — ' + pct.toFixed(1) + '%</span>';
    });
    bar.innerHTML = barHtml;
    key.innerHTML = keyHtml;
  }

  function solve() {
    var resBig = $('waResBig'), resSub = $('waResSub');
    var valid = [];
    rows.forEach(function (r, i) {
      var x = num(r.value), w = num(r.weight);
      if (isFinite(x) && isFinite(w) && w > 0) {
        var lab = (r.label && r.label.trim()) ? r.label.trim() : ('Row ' + (i + 1));
        valid.push({ x: x, w: w, label: lab });
      }
    });
    if (!valid.length) {
      resBig.textContent = '—';
      resSub.textContent = 'Enter at least one value and weight.';
      $('waBarWrap').style.display = 'none';
      $('waCmpWrap').style.display = 'none';
    } else {
      var sumW = 0, sumWX = 0, sumX = 0;
      valid.forEach(function (v) { sumW += v.w; sumWX += v.w * v.x; sumX += v.x; });
      var wavg = sumWX / sumW;
      var simple = sumX / valid.length;
      resBig.textContent = fmt(wavg);
      resSub.textContent = valid.length + ' value' + (valid.length === 1 ? '' : 's') + ' · weights totaling ' + fmt(sumW);
      renderBar(valid.map(function (v) { return { label: v.label, pct: v.w / sumW * 100 }; }));
      $('waCmpWrap').style.display = valid.length > 1 ? '' : 'none';
      $('waSimple').textContent = fmt(simple);
    }
    solveAdvanced();
  }

  function solveAdvanced() {
    var out = $('waAdvOut'); if (!out) return;
    if (!advanced) { out.style.display = 'none'; return; }
    out.style.display = '';
    var msg = $('waSolveOut');
    var target = num($('waTarget').value);
    var solveId = $('waSolveRow').getAttribute('data-value');
    if (!rows.length) { msg.innerHTML = 'Add at least one row first.'; return; }
    if (!solveId) { msg.innerHTML = 'Pick which row to solve for.'; return; }
    if (!isFinite(target)) { msg.innerHTML = 'Enter a target weighted average.'; return; }
    var known = [], target_w = null, target_label = '';
    var ok = true;
    rows.forEach(function (r, i) {
      var w = num(r.weight);
      var lab = (r.label && r.label.trim()) ? r.label.trim() : ('Row ' + (i + 1));
      if (('' + r._id) === solveId) {
        target_w = w; target_label = lab;
        if (!isFinite(w) || w <= 0) ok = false;
        return;
      }
      var x = num(r.value);
      if (!isFinite(x) || !isFinite(w) || w <= 0) { ok = false; return; }
      known.push({ x: x, w: w });
    });
    if (!ok || target_w == null) {
      msg.innerHTML = 'Enter a value and weight for every other row, and a weight for the row you’re solving for.';
      return;
    }
    var sumWOther = 0, sumWXOther = 0;
    known.forEach(function (k) { sumWOther += k.w; sumWXOther += k.w * k.x; });
    var sumW = sumWOther + target_w;
    var needed = (target * sumW - sumWXOther) / target_w;
    msg.innerHTML = 'To reach a weighted average of <strong>' + fmt(target) + '</strong>, <strong>' + target_label + '</strong> needs a value of <strong>' + fmt(needed) + '</strong> (at its weight of ' + fmt(target_w) + ').';
  }

  var addBtn = $('waAddBtn');
  if (addBtn) addBtn.addEventListener('click', function () { addRow(); solve(); });

  var targetIn = $('waTarget');
  if (targetIn) targetIn.addEventListener('input', solveAdvanced);
  var solveRowBox = $('waSolveRow');
  if (solveRowBox) solveRowBox.addEventListener('change', solveAdvanced);

  var advBtn = $('waAdvBtn');
  if (advBtn) advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('waAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('waAdvIn').style.display = advanced ? '' : 'none';
    solve();
  });

  addRow({ label: '', value: '', weight: '1' });
  addRow({ label: '', value: '', weight: '1' });
  addRow({ label: '', value: '', weight: '1' });
  solve();
};

/* =========================================================
   SCHOOL · GRADE CURVE CALCULATOR
   Paste/CSV grade list + highest-possible-grade + a curve method.
   Default view: a 3-button .modeseg (Add points / Highest→100% /
   % boost) — always visible, no click-to-reveal. Go advanced opens
   a real panel ABOVE the button (display:none -> '', the mandatory
   pattern — never fold advanced-only choices into a closed dropdown
   with no visible on-page change, that shipped broken once already)
   containing a second .csel for the 4 deeper methods; picking one
   there overrides the simple toggle until set back to "use the
   simple method above". Differentiator: a live before/after
   letter-grade distribution bar (same stacked-segment technique as
   Weighted Average's contribution bar) plus a mean/median/std-dev
   before/after table and a per-student breakdown.
   ========================================================= */
CalcThis.initGradeCurveCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var gradesEl = $('gcGrades');
  if (!gradesEl) return;
  var maxEl = $('gcMax'), simpleSeg = $('gcMethodSeg'), advBox = $('gcAdvMethod'),
      advPanel = $('gcAdvPanel'), extraEl = $('gcExtra'), advExtraEl = $('gcAdvExtra');
  var simpleMethod = 'add';
  var advanced = false;

  var LABELS = {
    add: 'Add points', highest: 'Highest grade → 100%', percent: 'Percentage boost',
    target: 'Reach a target mean', bell: 'Bell curve', sqrt: 'Square root', mult: 'Multiply by factor'
  };

  function activeMethod() {
    var adv = advBox.getAttribute('data-value');
    return adv ? adv : simpleMethod;
  }

  function num(v) { v = parseFloat(('' + v).trim()); return isNaN(v) ? NaN : v; }
  function fmt(n) {
    if (!isFinite(n)) return '—';
    var r = Math.round(n * 100) / 100;
    var s = '' + r;
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }
  function signed(n) {
    if (!isFinite(n)) return '—';
    return (n > 0 ? '+' : '') + fmt(n);
  }

  // ---- extra fields per method ----
  function fieldHtml(id) {
    if (id === 'add') return '<label class="fld" for="gcPts"><span class="lab">Points to add</span><div class="inp"><input id="gcPts" type="number" inputmode="decimal" placeholder="5"></div></label>';
    if (id === 'percent') return '<label class="fld" for="gcPct"><span class="lab">Boost percentage<span class="unit">%</span></span><div class="inp"><input id="gcPct" type="number" inputmode="decimal" placeholder="10"></div></label>';
    if (id === 'target') return '<label class="fld" for="gcTargetMean"><span class="lab">Desired class mean</span><div class="inp"><input id="gcTargetMean" type="number" inputmode="decimal" placeholder="80"></div></label>';
    if (id === 'bell') return '<div class="two">'
      + '<label class="fld" for="gcBellMean"><span class="lab">Desired mean</span><div class="inp"><input id="gcBellMean" type="number" inputmode="decimal" placeholder="75"></div></label>'
      + '<label class="fld" for="gcBellSd"><span class="lab">Desired std. dev.</span><div class="inp"><input id="gcBellSd" type="number" inputmode="decimal" placeholder="12"></div></label>'
      + '</div>';
    if (id === 'sqrt') return '<label class="fld" for="gcSqrtScale"><span class="lab">Scale factor<span class="unit">optional</span></span><div class="inp"><input id="gcSqrtScale" type="number" inputmode="decimal" placeholder="1"></div></label>';
    if (id === 'mult') return '<label class="fld" for="gcMult"><span class="lab">Multiplier</span><div class="inp"><input id="gcMult" type="number" inputmode="decimal" placeholder="1.1"></div></label>';
    return '';
  }
  function renderExtra() {
    extraEl.innerHTML = fieldHtml(simpleMethod);
    [].forEach.call(extraEl.querySelectorAll('input'), function (el) { el.addEventListener('input', solve); });
  }
  function renderAdvExtra() {
    var adv = advBox.getAttribute('data-value');
    advExtraEl.innerHTML = adv ? fieldHtml(adv) : '';
    [].forEach.call(advExtraEl.querySelectorAll('input'), function (el) { el.addEventListener('input', solve); });
  }

  // ---- parsing ----
  function parseGrades() {
    var raw = gradesEl.value.split(/[\s,;]+/);
    var out = [];
    raw.forEach(function (tok) {
      var n = num(tok);
      if (isFinite(n)) out.push(n);
    });
    return out;
  }

  function stats(arr) {
    if (!arr.length) return null;
    var n = arr.length;
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var mean = arr.reduce(function (a, b) { return a + b; }, 0) / n;
    var median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    var variance = arr.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / n;
    var sd = Math.sqrt(variance);
    return { mean: mean, median: median, sd: sd, min: sorted[0], max: sorted[n - 1] };
  }

  function clamp(v, max) { return Math.max(0, Math.min(max, v)); }

  function curveArr(arr, max, orig) {
    var id = activeMethod();
    if (id === 'add') {
      var pts = num($('gcPts') ? $('gcPts').value : ''); if (!isFinite(pts)) pts = 0;
      return arr.map(function (x) { return clamp(x + pts, max); });
    }
    if (id === 'highest') {
      var top = orig.max;
      var factor = top > 0 ? max / top : 1;
      return arr.map(function (x) { return clamp(x * factor, max); });
    }
    if (id === 'percent') {
      var pct = num($('gcPct') ? $('gcPct').value : ''); if (!isFinite(pct)) pct = 0;
      return arr.map(function (x) { return clamp(x * (1 + pct / 100), max); });
    }
    if (id === 'target') {
      var tm = num($('gcTargetMean') ? $('gcTargetMean').value : '');
      if (!isFinite(tm)) return arr.map(function (x) { return clamp(x, max); });
      var diff = tm - orig.mean;
      return arr.map(function (x) { return clamp(x + diff, max); });
    }
    if (id === 'bell') {
      var bm = num($('gcBellMean') ? $('gcBellMean').value : '');
      var bs = num($('gcBellSd') ? $('gcBellSd').value : '');
      if (!isFinite(bm) || !isFinite(bs) || orig.sd === 0) return arr.map(function (x) { return clamp(x, max); });
      return arr.map(function (x) { var z = (x - orig.mean) / orig.sd; return clamp(bm + z * bs, max); });
    }
    if (id === 'sqrt') {
      var sf = num($('gcSqrtScale') ? $('gcSqrtScale').value : ''); if (!isFinite(sf) || sf <= 0) sf = 1;
      return arr.map(function (x) { return clamp(Math.sqrt(Math.max(0, x) / max) * max * sf, max); });
    }
    if (id === 'mult') {
      var mu = num($('gcMult') ? $('gcMult').value : ''); if (!isFinite(mu)) mu = 1;
      return arr.map(function (x) { return clamp(x * mu, max); });
    }
    return arr.map(function (x) { return clamp(x, max); });
  }

  function letterBuckets(arr, max) {
    var edges = [0.9 * max, 0.8 * max, 0.7 * max, 0.6 * max];
    var c = { gA: 0, gB: 0, gC: 0, gD: 0, gF: 0 };
    arr.forEach(function (x) {
      if (x >= edges[0]) c.gA++;
      else if (x >= edges[1]) c.gB++;
      else if (x >= edges[2]) c.gC++;
      else if (x >= edges[3]) c.gD++;
      else c.gF++;
    });
    return c;
  }

  function renderBar(el, counts, total) {
    var order = ['gA', 'gB', 'gC', 'gD', 'gF'];
    var html = '';
    order.forEach(function (k) {
      if (!counts[k]) return;
      var pct = counts[k] / total * 100;
      html += '<span class="gc-seg ' + k + '" style="width:' + pct + '%">' + (pct >= 8 ? counts[k] : '') + '</span>';
    });
    el.innerHTML = html;
  }

  function renderLegend(before, after) {
    var order = [['gA', 'A'], ['gB', 'B'], ['gC', 'C'], ['gD', 'D'], ['gF', 'F']];
    var html = '';
    order.forEach(function (pair) {
      var k = pair[0];
      if (!before[k] && !after[k]) return;
      html += '<span><i class="' + k + '"></i>' + pair[1] + ' — ' + before[k] + ' → ' + after[k] + '</span>';
    });
    $('gcLegend').innerHTML = html;
  }

  function solve() {
    var grades = parseGrades();
    var max = num(maxEl.value); if (!isFinite(max) || max <= 0) max = 100;

    if (!grades.length) {
      $('gcResBig').textContent = '—';
      $('gcResSub').textContent = "Paste your class's grades to get started.";
      $('gcEmpty').style.display = 'block';
      $('gcResults').style.display = 'none';
      return;
    }
    $('gcEmpty').style.display = 'none';
    $('gcResults').style.display = '';

    var orig = stats(grades);
    var curved = curveArr(grades, max, orig);
    var curvedStats = stats(curved);

    $('gcResBig').textContent = fmt(curvedStats.mean);
    $('gcResSub').textContent = 'was ' + fmt(orig.mean) + ', now ' + fmt(curvedStats.mean) + ' · ' + grades.length + ' student' + (grades.length === 1 ? '' : 's') + ' · ' + (LABELS[activeMethod()] || activeMethod());

    var beforeB = letterBuckets(grades, max), afterB = letterBuckets(curved, max);
    renderBar($('gcBarBefore'), beforeB, grades.length);
    renderBar($('gcBarAfter'), afterB, grades.length);
    renderLegend(beforeB, afterB);

    var rows = [
      ['Mean', orig.mean, curvedStats.mean],
      ['Median', orig.median, curvedStats.median],
      ['Std. deviation', orig.sd, curvedStats.sd],
      ['Lowest score', orig.min, curvedStats.min],
      ['Highest score', orig.max, curvedStats.max]
    ];
    $('gcStatsBody').innerHTML = rows.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td>' + fmt(r[1]) + '</td><td>' + fmt(r[2]) + '</td></tr>';
    }).join('');

    $('gcRowsBody').innerHTML = grades.map(function (x, i) {
      var c = curved[i];
      return '<tr><td>Student ' + (i + 1) + '</td><td>' + fmt(x) + '</td><td>' + fmt(c) + '</td><td>' + signed(c - x) + '</td></tr>';
    }).join('');
  }

  // ---- CSV import: extract every number in the file, refill the same
  // textarea (one entry surface, not a separate mode) ----
  var csvBtn = $('gcImportBtn'), csvFile = $('gcCsvFile');
  if (csvBtn && csvFile) {
    csvBtn.addEventListener('click', function () { csvFile.click(); });
    csvFile.addEventListener('change', function () {
      var f = csvFile.files && csvFile.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        var text = '' + reader.result;
        var nums = text.match(/-?\d+(\.\d+)?/g) || [];
        gradesEl.value = nums.join(', ');
        solve();
      };
      reader.readAsText(f);
      csvFile.value = '';
    });
  }

  gradesEl.addEventListener('input', solve);
  maxEl.addEventListener('input', solve);

  simpleSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    simpleMethod = b.dataset.m;
    [].forEach.call(simpleSeg.children, function (c) { c.classList.toggle('on', c === b); c.setAttribute('aria-selected', c === b ? 'true' : 'false'); });
    renderExtra();
    solve();
  });

  advBox.addEventListener('change', function () { renderAdvExtra(); solve(); });

  var advBtn = $('gcAdvBtn');
  if (advBtn) advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('gcAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    advPanel.style.display = advanced ? '' : 'none';
    if (!advanced) {
      advBox.value = '';   // revert to the simple toggle above when closing
      renderAdvExtra();
    }
    solve();
  });

  renderExtra();
  solve();
};

/* =========================================================
   MATH · FRACTION CALCULATOR
   Operand rows (any count) joined by + − × ÷ of, evaluated with normal
   precedence on exact BigInt fractions (so large numbers never lose
   precision — no separate "big number" mode needed). Two modes via
   .modeseg: Calculate, and Simplify / convert (one value in -> fraction,
   mixed number, decimal, percent). Differentiator: a live bar diagram of
   the operation — operands, the common-denominator re-slice for pure
   add/subtract chains, and the result on one scale. Go advanced opens a
   real panel (decimal places) and reveals Compare / LCD / formula output.
   ========================================================= */
CalcThis.initFractionsCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var rowsWrap = $('fcRows');
  if (!rowsWrap) return;
  var Z = BigInt(0), O = BigInt(1), TWO = BigInt(2), TEN = BigInt(10);
  var mode = 'calc', advanced = false, rowId = 0, rows = [];
  var OPS = [['add', '+'], ['sub', '−'], ['mul', '×'], ['div', '÷'], ['of', 'of']];
  var SYM = { add: '+', sub: '−', mul: '×', div: '÷', of: '×' };

  // ---------- exact fraction math ----------
  function babs(x) { return x < Z ? -x : x; }
  function gcd(a, b) { a = babs(a); b = babs(b); while (b !== Z) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function mk(n, d) {
    if (d === Z) throw new Error('A denominator can’t be 0.');
    if (d < Z) { n = -n; d = -d; }
    return { n: n, d: d };
  }
  function red(f) { var g = gcd(f.n, f.d); return (g === O) ? f : { n: f.n / g, d: f.d / g }; }
  function decToFrac(s) {
    var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var parts = s.split('.'), ip = parts[0] || '0', fp = parts[1] || '';
    var n = BigInt(ip + fp), d = TEN ** BigInt(fp.length);
    return mk(neg ? -n : n, d);
  }
  function parseVal(s) {
    s = ('' + s).trim().replace(/−/g, '-');
    var m;
    if ((m = /^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s))) {
      var d = BigInt(m[4]);
      if (d === Z) throw new Error('A denominator can’t be 0.');
      var n = BigInt(m[2]) * d + BigInt(m[3]);
      return { f: mk(m[1] ? -n : n, d), kind: 'mixed', raw: s };
    }
    if ((m = /^(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)$/.exec(s))) {
      var a = decToFrac(m[1]), b = decToFrac(m[2]);
      if (b.n === Z) throw new Error('A denominator can’t be 0.');
      var plain = !/\./.test(m[1]) && !/\./.test(m[2]);
      return { f: mk(a.n * b.d, a.d * b.n), kind: plain ? 'frac' : 'dec', raw: s };
    }
    if (/^-?\d*\.?\d+$/.test(s)) return { f: decToFrac(s), kind: s.indexOf('.') >= 0 ? 'dec' : 'int', raw: s };
    throw new Error('Can’t read “' + s + '” — try 3/4, 1 3/4, 0.125 or 7.');
  }
  function addF(a, b) { return mk(a.n * b.d + b.n * a.d, a.d * b.d); }
  function cmp(a, b) { var x = a.n * b.d - b.n * a.d; return x < Z ? -1 : (x > Z ? 1 : 0); }

  // ---------- formatting ----------
  function t(f) { return f.d === O ? f.n.toString() : f.n.toString() + '/' + f.d.toString(); }
  function mixedTxt(f) {
    if (f.d === O) return f.n.toString();
    var n = babs(f.n), w = n / f.d, r = n % f.d;
    if (w === Z) return t(f);
    return (f.n < Z ? '-' : '') + w + ' ' + r + '/' + f.d;
  }
  function stacked(n, d) { return '<span class="fc-f"><span class="fc-n">' + n + '</span><span class="fc-d">' + d + '</span></span>'; }
  function bigHtml(f) {
    var neg = f.n < Z ? '−' : '', n = babs(f.n);
    if (f.d === O) return neg + n;
    var w = n / f.d, r = n % f.d;
    if (w === Z) return neg + stacked(n, f.d);
    return neg + '<span class="fc-w">' + w + '</span>' + stacked(r, f.d);
  }
  function decStr(f, places) {
    var neg = f.n < Z, n = babs(f.n), d = f.d;
    var scale = TEN ** BigInt(places);
    var exact = (n * scale) % d === Z;
    var q = (n * scale * TWO + d) / (d * TWO);
    var s = q.toString();
    while (s.length <= places) s = '0' + s;
    var ip = s.slice(0, s.length - places), fp = s.slice(s.length - places).replace(/0+$/, '');
    var out = ip + (fp ? '.' + fp : '');
    if (neg && q !== Z) out = '-' + out;
    return { text: out, exact: exact };
  }
  function placesVal() {
    var v = parseInt($('fcPlaces').value, 10);
    if (isNaN(v)) return 4;
    return Math.max(0, Math.min(12, v));
  }
  function esc(s) { return ('' + s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  // ---------- operation steps ----------
  function finish(raw, lines) {
    var r = red(raw);
    if (raw.d !== O) {
      if (r.n !== raw.n || r.d !== raw.d) lines.push('Simplify: divide the top and bottom by their greatest common factor (' + gcd(raw.n, raw.d) + ') → ' + t(r) + '.');
      else lines.push(t(raw) + ' is already in lowest terms.');
    }
    if (r.d !== O && babs(r.n) > r.d) lines.push('As a mixed number: ' + mixedTxt(r) + '.');
    return r;
  }
  function paren(x) { return x < Z ? '(' + x + ')' : '' + x; }
  function addSubStep(a, b, sub) {
    var lines = [], l = lcm(a.d, b.d), sg = sub ? '−' : '+';
    var an = a.n * (l / a.d), bn = b.n * (l / b.d);
    if (a.d === b.d) lines.push('Same denominator (' + a.d + ') — ' + (sub ? 'subtract' : 'add') + ' the numerators.');
    else {
      lines.push('Denominators ' + a.d + ' and ' + b.d + ' → least common denominator (LCD) = ' + l + '.');
      lines.push('Rewrite over ' + l + ': ' + t(a) + ' = ' + an + '/' + l + ' and ' + t(b) + ' = ' + bn + '/' + l + '.');
    }
    var num = sub ? an - bn : an + bn;
    lines.push((sub ? 'Subtract' : 'Add') + ' the numerators: ' + an + ' ' + sg + ' ' + paren(bn) + ' = ' + num + ' → ' + num + '/' + l + '.');
    return { f: finish(mk(num, l), lines), lines: lines };
  }
  function mulStep(a, b) {
    var lines = [], n = a.n * b.n, d = a.d * b.d;
    lines.push('Multiply the numerators: ' + a.n + ' × ' + b.n + ' = ' + n + '. Multiply the denominators: ' + a.d + ' × ' + b.d + ' = ' + d + ' → ' + n + '/' + d + '.');
    return { f: finish(mk(n, d), lines), lines: lines };
  }
  function divStep(a, b) {
    if (b.n === Z) throw new Error('Can’t divide by zero.');
    var rec = mk(b.d, b.n), lines = [];
    lines.push('To divide, flip the second fraction (its reciprocal): ' + t(b) + ' → ' + t(rec) + ', then multiply.');
    var n = a.n * rec.n, d = a.d * rec.d;
    lines.push(t(a) + ' × ' + t(rec) + ' = ' + n + '/' + d + '.');
    return { f: finish(mk(n, d), lines), lines: lines };
  }
  function convNote(p) {
    if (p.kind === 'mixed') return p.raw + ' as an improper fraction = ' + t(p.f) + '.';
    if (p.kind === 'dec') { var r = red(p.f); return p.raw + ' as a fraction = ' + t(p.f) + (r.n !== p.f.n || r.d !== p.f.d ? ' = ' + t(r) : '') + '.'; }
    return null;
  }
  function evalChain(terms) {
    var vs = [terms[0].f], ops = [], blocks = [], i, r, left;
    for (i = 1; i < terms.length; i++) {
      var op = terms[i].op, f = terms[i].f;
      if (op === 'mul' || op === 'div' || op === 'of') {
        left = vs.pop();
        r = (op === 'div') ? divStep(left, f) : mulStep(left, f);
        blocks.push({ title: t(left) + ' ' + SYM[op] + ' ' + t(f) + ' = ' + t(r.f), lines: r.lines });
        vs.push(r.f);
      } else { ops.push(op); vs.push(f); }
    }
    var acc = vs[0];
    for (i = 0; i < ops.length; i++) {
      var b = vs[i + 1];
      r = addSubStep(acc, b, ops[i] === 'sub');
      blocks.push({ title: t(acc) + ' ' + SYM[ops[i]] + ' ' + t(b) + ' = ' + t(r.f), lines: r.lines });
      acc = r.f;
    }
    return { f: acc, blocks: blocks };
  }

  // ---------- bar diagram ----------
  function num(f) { return Number(f.n) / Number(f.d); }
  function barRow(label, f, S, den, cls) {
    var pct = Math.min(100, Math.abs(num(f)) / S * 100), dn = Number(den), N = S * dn, ticks = '', i;
    if (dn > 0 && N <= 48) {
      for (i = 1; i < N; i++) ticks += '<span class="fc-t' + (i % dn === 0 ? ' fc-tw' : '') + '" style="left:' + (i / N * 100) + '%"></span>';
    } else {
      for (i = 1; i < S; i++) ticks += '<span class="fc-t fc-tw" style="left:' + (i / S * 100) + '%"></span>';
    }
    return '<div class="fc-brow"><div class="fc-blab">' + label + '</div><div class="fc-bar"><span class="fc-fill ' + cls + '" style="width:' + pct + '%"></span>' + ticks + '</div></div>';
  }
  function renderBars(terms, result) {
    var vals = terms.map(function (x) { return x.f; }), maxAbs = Math.abs(num(result)), i;
    vals.forEach(function (f) { maxAbs = Math.max(maxAbs, Math.abs(num(f))); });
    if (!isFinite(maxAbs)) return '<p class="fc-bnote">Numbers this large are shown in the working below.</p>';
    var S = Math.max(1, Math.ceil(maxAbs - 1e-9));
    if (S > 6) return '<p class="fc-bnote">The bar diagram shows values up to 6 — this one is bigger, so see the working below.</p>';
    var html = '';
    if (vals.length > 1 || mode === 'calc') html += '<div class="fc-grp">' + (vals.length > 1 ? 'Your fractions' : 'Your fraction') + '</div>';
    vals.forEach(function (f) { html += barRow(mixedTxt(f), f, S, f.d, f.n < Z ? 'neg' : ''); });
    var additive = terms.length > 1 && terms.every(function (x, k) { return k === 0 || x.op === 'add' || x.op === 'sub'; });
    if (additive) {
      var L = vals.reduce(function (acc, f) { return lcm(acc, f.d); }, O);
      if (vals.some(function (f) { return f.d !== L; })) {
        html += '<div class="fc-grp">Sliced into equal pieces (LCD ' + L + ')</div>';
        terms.forEach(function (x, k) {
          var s = (k > 0 && x.op === 'sub') ? mk(-x.f.n, x.f.d) : x.f;
          html += barRow(s.n * (L / s.d) + '/' + L, s, S, L, s.n < Z ? 'neg' : '');
        });
      }
    }
    if (terms.length > 1) {
      html += '<div class="fc-grp">Result</div>' + barRow(mixedTxt(result), result, S, result.d, 'res');
    }
    return html;
  }

  // ---------- rendering ----------
  function setEmpty(msg) {
    $('fcResBig').textContent = '—';
    $('fcResSub').textContent = msg;
    $('fcResults').style.display = 'none';
    $('fcMVal').textContent = '—';
    $('fcMDec').textContent = '';
  }
  function stepsHtml(notes, blocks) {
    var html = '';
    if (notes.length) html += '<h4>Reading your numbers</h4><ul>' + notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>';
    blocks.forEach(function (b, k) {
      if (blocks.length > 1) html += '<h4>Step ' + (k + 1) + ': ' + b.title + '</h4>';
      html += '<ul>' + b.lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>';
    });
    if (blocks.length > 1) html = '<p class="add-note" style="text-align:left;margin:0 0 4px">× and ÷ are done before + and −, like normal arithmetic.</p>' + html;
    return html;
  }
  // the action, written out: '1/3 + 2 = 2 1/3' (or 'as typed = simplified' for one value)
  function rawHtml(p) {
    if (p.kind === 'frac') return (p.f.n < Z ? '−' : '') + stacked(babs(p.f.n), p.f.d);
    if (p.kind === 'mixed') return bigHtml(p.f);
    return esc(p.raw.replace(/^-/, '−'));
  }
  function eqHtml(f, terms) {
    var ans = '<span class="fc-ans">' + bigHtml(f) + '</span>', left;
    if (mode === 'single' || terms.length === 1) {
      left = rawHtml(terms[0].p);
      if (left === bigHtml(f)) return '<div class="fc-eqrow">' + ans + '</div>';
      return '<div class="fc-eqrow"><span>' + left + '</span><span class="fc-op">=</span>' + ans + '</div>';
    }
    // × ÷ groups are done first, so when they sit inside a longer + / − expression, bracket them
    var groups = [[terms[0]]];
    terms.slice(1).forEach(function (x) {
      if (x.op === 'mul' || x.op === 'div' || x.op === 'of') groups[groups.length - 1].push(x);
      else groups.push([x]);
    });
    var bracket = groups.length > 1;
    left = groups.map(function (g, gi) {
      var inner = g.map(function (x, k) {
        return (k > 0 ? '<span class="fc-op">' + SYM[x.op] + '</span>' : '') + '<span>' + bigHtml(x.f) + '</span>';
      }).join('');
      if (bracket && g.length > 1) inner = '<span class="fc-par">(</span>' + inner + '<span class="fc-par">)</span>';
      return (gi > 0 ? '<span class="fc-op">' + SYM[g[0].op] + '</span>' : '') + '<span class="fc-grp2">' + inner + '</span>';
    }).join('');
    return '<div class="fc-eqrow">' + left + '<span class="fc-op">=</span>' + ans + '</div>';
  }
  function showResult(f, terms, blocks, notes) {
    var places = placesVal(), dec = decStr(f, places), pct = decStr(mk(f.n * BigInt(100), f.d), places);
    $('fcResLab').textContent = mode === 'single' ? 'Simplified' : 'Result';
    $('fcResBig').innerHTML = eqHtml(f, terms);
    var parts = [];
    if (f.d !== O && babs(f.n) > f.d) parts.push(mixedTxt(f));
    var minus = function (s) { return s.replace(/^-/, '−'); };
    parts.push((dec.exact ? '' : '≈ ') + minus(dec.text));
    parts.push((pct.exact ? '' : '≈ ') + minus(pct.text) + '%');
    $('fcResSub').textContent = (parts[0].charAt(0) === '≈' ? '' : '= ') + parts.join(' · ');
    $('fcResults').style.display = '';
    $('fcMLab').textContent = mode === 'single' ? 'Simplified' : 'Result';
    $('fcMVal').textContent = (f.d !== O && babs(f.n) > f.d) ? mixedTxt(f) : t(f);
    $('fcMDec').textContent = f.d === O ? '' : ' = ' + minus(dec.text) + (dec.exact ? '' : '…');
    $('fcBars').innerHTML = renderBars(terms, f);
    $('fcSteps').innerHTML = stepsHtml(notes, blocks);

    var advOut = $('fcAdvOut');
    var show = advanced && mode === 'calc' && terms.length >= 2;
    advOut.style.display = show ? '' : 'none';
    if (!show) return;
    var sorted = terms.map(function (x) { return x.f; }).sort(cmp), cm = '';
    sorted.forEach(function (x, k) {
      if (k > 0) cm += (cmp(sorted[k - 1], x) === 0) ? ' = ' : ' < ';
      cm += mixedTxt(x);
    });
    $('fcCompare').textContent = 'Smallest to largest: ' + cm;
    var fm = $('fcFormula');
    if (terms.length === 2) {
      var a = terms[0].f, b = terms[1].f, op = terms[1].op, ft;
      if (op === 'add') ft = '(' + a.n + '×' + b.d + ' + ' + b.n + '×' + a.d + ') / (' + a.d + '×' + b.d + ')';
      else if (op === 'sub') ft = '(' + a.n + '×' + b.d + ' − ' + b.n + '×' + a.d + ') / (' + a.d + '×' + b.d + ')';
      else if (op === 'div') ft = '(' + a.n + '×' + b.d + ') / (' + a.d + '×' + b.n + ')';
      else ft = '(' + a.n + '×' + b.n + ') / (' + a.d + '×' + b.d + ')';
      fm.textContent = 'Formula: ' + ft + ' = ' + t(f);
      fm.style.display = '';
    } else fm.style.display = 'none';
    var L = terms.reduce(function (acc, x) { return lcm(acc, x.f.d); }, O);
    document.querySelector('#fcLcdWrap .fc-grp').textContent = 'Over the common denominator (LCD ' + L + ')';
    $('fcLcdBody').innerHTML = terms.map(function (x) {
      return '<tr><td>' + t(x.f) + '</td><td>' + x.f.n * (L / x.f.d) + '/' + L + '</td></tr>';
    }).join('');
    $('fcLcdWrap').style.display = '';
  }

  function clearErrors() {
    [].forEach.call(rowsWrap.querySelectorAll('.fc-err'), function (e) { e.style.display = 'none'; e.textContent = ''; });
  }
  function rowErr(idx, msg) {
    var rowEl = rowsWrap.querySelectorAll('.fc-row')[idx];
    if (!rowEl) return;
    var e = rowEl.querySelector('.fc-err');
    e.textContent = msg; e.style.display = '';
  }

  function render() {
    clearErrors();
    var limit = mode === 'single' ? 1 : rows.length, terms = [], notes = [], hasErr = false;
    var typing = false;
    rows.slice(0, limit).forEach(function (r, idx) {
      var s = r.text.trim();
      if (!s) return;
      // still mid-typing (e.g. '2/', '1 3', '-', '0.') -> skip quietly, no error, keep the rest of the result
      if (/[\/.\-−]$/.test(s) || /^-?\d+\s+\d+$/.test(s)) { typing = true; return; }
      try {
        var p = parseVal(s), cn = convNote(p);
        if (cn) notes.push(cn);
        terms.push({ f: red(p.f), op: r.op, p: p, idx: idx });
      } catch (e) { hasErr = true; rowErr(idx, e.message); }
    });
    if (hasErr) { setEmpty('Check the highlighted entry.'); return; }
    if (!terms.length && typing) { setEmpty('Keep typing your fraction…'); return; }
    if (!terms.length) { setEmpty(mode === 'single' ? 'Enter a fraction, mixed number or decimal.' : 'Enter at least two fractions to calculate.'); return; }
    try {
      if (mode === 'single' || terms.length === 1) {
        var p0 = terms[0].p, f0 = terms[0].f, lines = [];
        if (p0.kind === 'int') lines.push(p0.raw + ' is a whole number, so it equals ' + p0.raw + '/1.');
        else finish(p0.f, lines);
        var places = placesVal(), d0 = decStr(f0, places), p1 = decStr(mk(f0.n * BigInt(100), f0.d), places);
        if (f0.d !== O) lines.push('As a decimal: ' + f0.n + ' ÷ ' + f0.d + ' = ' + (d0.exact ? '' : '≈ ') + d0.text + '.');
        lines.push('As a percent: ' + d0.text + ' × 100 = ' + (p1.exact ? '' : '≈ ') + p1.text + '%.');
        showResult(f0, terms.slice(0, 1), [{ title: '', lines: lines }], notes);
        return;
      }
      var ev = evalChain(terms);
      showResult(ev.f, terms, ev.blocks, notes);
    } catch (e) { setEmpty(e.message); }
  }

  // ---------- rows ----------
  function buildRow(r, i) {
    var div = document.createElement('div');
    div.className = 'fc-row';
    var opHtml = '';
    if (i > 0 && mode === 'calc') {
      opHtml = '<div class="seg" role="group" aria-label="Operator">' + OPS.map(function (o) {
        return '<button type="button" data-op="' + o[0] + '"' + (r.op === o[0] ? ' class="on"' : '') + '>' + o[1] + '</button>';
      }).join('') + '</div>';
    }
    var ph = mode === 'single' ? '3/4, 1 3/4 or 0.125' : '3/4 or 1 3/4';
    div.innerHTML = '<div class="fc-opcell">' + opHtml + '</div>'
      + '<div class="inp"><input type="text" inputmode="text" autocomplete="off" placeholder="' + ph + '" value="' + esc(r.text) + '" aria-label="Fraction ' + (i + 1) + '"></div>'
      + (i >= 2 && mode === 'calc' ? '<button class="x" type="button" aria-label="Remove">&#215;</button>' : '')
      + '<div class="fc-err" style="display:none"></div>';
    if (!(i >= 2 && mode === 'calc')) div.className += ' nox';
    div.querySelector('input').addEventListener('input', function () { r.text = this.value; render(); });
    var seg = div.querySelector('.seg');
    if (seg) seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      r.op = b.dataset.op;
      [].forEach.call(seg.children, function (c) { c.classList.toggle('on', c === b); });
      render();
    });
    var x = div.querySelector('.x');
    if (x) x.addEventListener('click', function () {
      rows = rows.filter(function (q) { return q !== r; });
      buildRows(); render();
    });
    return div;
  }
  function buildRows() {
    rowsWrap.innerHTML = '';
    rows.forEach(function (r, i) {
      if (mode === 'single' && i > 0) return;
      rowsWrap.appendChild(buildRow(r, i));
    });
  }
  function newRow() { return { id: ++rowId, op: 'add', text: '' }; }

  $('fcAddBtn').addEventListener('click', function () {
    rows.push(newRow());
    buildRows(); render();
    var ins = rowsWrap.querySelectorAll('input');
    if (ins.length) ins[ins.length - 1].focus();
  });

  var modeSeg = $('fcModeSeg');
  modeSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.m === mode) return;
    mode = b.dataset.m;
    [].forEach.call(modeSeg.children, function (c) { c.classList.toggle('on', c === b); c.setAttribute('aria-selected', c === b ? 'true' : 'false'); });
    $('fcAddWrap').style.display = mode === 'calc' ? '' : 'none';
    $('fcInputNote').innerHTML = mode === 'calc'
      ? 'Type fractions like <b>3/4</b>, mixed numbers like <b>1 3/4</b>, decimals like <b>0.125</b>, or whole numbers.'
      : 'Enter one fraction, mixed number or decimal — you get it simplified, as a mixed number, a decimal and a percent.';
    buildRows(); render();
  });

  $('fcPlaces').addEventListener('input', render);

  var advBtn = $('fcAdvBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('fcAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('fcAdvIn').style.display = advanced ? '' : 'none';
    render();
  });

  rows = [newRow(), newRow()];
  buildRows();
  render();
};

/* =========================================================
   MATH · STANDARD DEVIATION CALCULATOR
   Paste anything (commas / spaces / lines / Excel column) -> sample s AND
   population σ always shown side by side, mean, variance, sum of squares and
   step-by-step working. Differentiators: a live number-line dot plot (mean,
   ±1 / ±2 SD bands, dots coloured by distance), quiet "N ignored" cleaning,
   a plain-English reading of the spread. Go advanced (real panel above the
   button): value+count data, outlier threshold + one-click exclude &
   recalculate, confidence level, decimals; results gain quartiles / mode /
   relative SD / confidence interval and a z-score table. All statistics are
   count-weighted so "value + count" data never has to be expanded.
   ========================================================= */
CalcThis.initSdCalc = function (cfg) {
  cfg = cfg || {};
  var $ = function (id) { return document.getElementById(id); };
  var dataEl = $('sdData');
  if (!dataEl) return;
  var kind = 'sample', fmtMode = 'list', thr = 2, excl = false, lvl = 1, advanced = false, lastPlot = null;

  // two-tailed t critical values, columns = 90% / 95% / 99%; df between rows uses the lower row (conservative)
  var T = {
    1: [6.314, 12.706, 63.657], 2: [2.920, 4.303, 9.925], 3: [2.353, 3.182, 5.841], 4: [2.132, 2.776, 4.604],
    5: [2.015, 2.571, 4.032], 6: [1.943, 2.447, 3.707], 7: [1.895, 2.365, 3.499], 8: [1.860, 2.306, 3.355],
    9: [1.833, 2.262, 3.250], 10: [1.812, 2.228, 3.169], 11: [1.796, 2.201, 3.106], 12: [1.782, 2.179, 3.055],
    13: [1.771, 2.160, 3.012], 14: [1.761, 2.145, 2.977], 15: [1.753, 2.131, 2.947], 16: [1.746, 2.120, 2.921],
    17: [1.740, 2.110, 2.898], 18: [1.734, 2.101, 2.878], 19: [1.729, 2.093, 2.861], 20: [1.725, 2.086, 2.845],
    21: [1.721, 2.080, 2.831], 22: [1.717, 2.074, 2.819], 23: [1.714, 2.069, 2.807], 24: [1.711, 2.064, 2.797],
    25: [1.708, 2.060, 2.787], 26: [1.706, 2.056, 2.779], 27: [1.703, 2.052, 2.771], 28: [1.701, 2.048, 2.763],
    29: [1.699, 2.045, 2.756], 30: [1.697, 2.042, 2.750], 40: [1.684, 2.021, 2.704], 60: [1.671, 2.000, 2.660],
    120: [1.658, 1.980, 2.617]
  };
  var TK = Object.keys(T).map(Number).sort(function (a, b) { return a - b; });
  function tcrit(df, l) {
    if (df >= 1000) return [1.645, 1.960, 2.576][l];
    var k = TK[0];
    for (var i = 0; i < TK.length; i++) if (TK[i] <= df) k = TK[i];
    return T[k][l];
  }

  function esc(s) { return ('' + s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function places() { var v = parseInt($('sdPlaces').value, 10); return isNaN(v) ? 4 : Math.max(0, Math.min(10, v)); }
  function fmt(x) {
    if (!isFinite(x)) return '—';
    var s = x.toFixed(places());
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s.replace(/^-/, '−');
  }
  function fmtInt(x) { return Math.round(x).toLocaleString('en-US'); }

  // ---------- parsing ----------
  var NUM = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
  function tok(s) { s = s.replace(/−/g, '-'); return NUM.test(s) ? parseFloat(s) : NaN; }
  function parse() {
    var text = dataEl.value, entries = [], ignored = [];
    if (fmtMode === 'list') {
      text.split(/[\s,;]+/).forEach(function (t) {
        if (!t) return;
        var v = tok(t);
        if (isFinite(v)) entries.push({ x: v, c: 1 }); else ignored.push(t);
      });
    } else {
      text.split(/\r?\n/).forEach(function (line) {
        line = line.trim();
        if (!line) return;
        var parts = line.replace(/[×*]/g, ' ').split(/[\s,;]+/).filter(function (p) { return p && !/^x$/i.test(p); });
        var v = parts.length >= 2 ? tok(parts[0]) : NaN, c = parts.length >= 2 ? tok(parts[1]) : NaN;
        if (isFinite(v) && isFinite(c) && c >= 1 && Math.floor(c) === c) entries.push({ x: v, c: c });
        else ignored.push(line);
      });
    }
    return { entries: entries, ignored: ignored };
  }

  // ---------- statistics (count-weighted) ----------
  function compute(es) {
    var n = 0, sum = 0, ss = 0, mn = Infinity, mx = -Infinity;
    es.forEach(function (e) { n += e.c; sum += e.c * e.x; if (e.x < mn) mn = e.x; if (e.x > mx) mx = e.x; });
    if (!n) return null;
    var mean = sum / n;
    es.forEach(function (e) { ss += e.c * (e.x - mean) * (e.x - mean); });
    var varP = ss / n, varS = n > 1 ? ss / (n - 1) : NaN;
    return { n: n, sum: sum, mean: mean, ss: ss, varP: varP, varS: varS, sdP: Math.sqrt(varP), sdS: Math.sqrt(varS), min: mn, max: mx };
  }
  function activeSd(st) { return kind === 'sample' ? st.sdS : st.sdP; }
  function distinct(es) {
    var m = {}, out = [];
    es.forEach(function (e) { var k = '' + e.x; if (m[k] === undefined) { m[k] = out.length; out.push({ x: e.x, c: 0 }); } out[m[k]].c += e.c; });
    return out.sort(function (a, b) { return a.x - b.x; });
  }
  function quantiles(es) {
    var d = distinct(es), cum = [], N = 0;
    d.forEach(function (e) { N += e.c; cum.push(N); });
    function at(k) { var lo = 0, hi = cum.length - 1; while (lo < hi) { var mid = (lo + hi) >> 1; if (cum[mid] > k) hi = mid; else lo = mid + 1; } return d[lo].x; }
    return function (p) {
      var pos = (N - 1) * p, a = Math.floor(pos), b = Math.ceil(pos);
      return at(a) + (pos - a) * (at(b) - at(a));
    };
  }
  function modeText(es) {
    var d = distinct(es), best = 0, vals = [];
    d.forEach(function (e) { if (e.c > best) { best = e.c; vals = [e.x]; } else if (e.c === best) vals.push(e.x); });
    if (best === 1 && d.length > 1) return 'none (every value appears once)';
    return vals.slice(0, 4).map(fmt).join(', ') + (vals.length > 4 ? '…' : '') + ' (×' + best + ')';
  }

  // ---------- number-line plot ----------
  function drawPlot(ctx) {
    var box = $('sdPlot'), ticks = $('sdTicks'), W = box.clientWidth || 300;
    var es = ctx.entries, mean = ctx.st.mean, sd = (isFinite(ctx.sd) && ctx.sd > 0) ? ctx.sd : 0;
    var allMin = Infinity, allMax = -Infinity;
    es.forEach(function (e) { if (e.x < allMin) allMin = e.x; if (e.x > allMax) allMax = e.x; });
    var lo = Math.min(allMin, mean - 2 * sd), hi = Math.max(allMax, mean + 2 * sd);
    if (hi - lo === 0) { lo -= 1; hi += 1; }
    var pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
    function px(v) { return (v - lo) / (hi - lo) * W; }
    function pc(v) { return Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)); }
    var html = '';
    if (sd > 0) {
      html += '<div class="sd-band2" style="left:' + pc(mean - 2 * sd) + '%;width:' + (pc(mean + 2 * sd) - pc(mean - 2 * sd)) + '%"></div>';
      html += '<div class="sd-band1" style="left:' + pc(mean - sd) + '%;width:' + (pc(mean + sd) - pc(mean - sd)) + '%"></div>';
    }
    html += '<div class="sd-mean" style="left:' + pc(mean) + '%"></div>';
    var DOT = 12, rows = [], maxRow = 0, sorted = es.slice().sort(function (a, b) { return a.x - b.x; });
    sorted.forEach(function (e) {
      var cls = e.out ? 'dx' : (sd > 0 ? (Math.abs(e.x - mean) / sd <= 1 + 1e-12 ? '' : (Math.abs(e.x - mean) / sd <= 2 + 1e-12 ? 'd1' : 'd2')) : '');
      var units = Math.min(e.c, 10);
      for (var u = 0; u < units; u++) {
        var x = px(e.x), r = 0;
        while (r < 9 && rows[r] !== undefined && x - rows[r] < DOT) r++;
        rows[r] = x; if (r > maxRow) maxRow = r;
        html += '<span class="sd-dot ' + cls + '" style="left:' + pc(e.x) + '%;bottom:' + (7 + r * DOT) + 'px"></span>';
      }
    });
    box.style.height = (maxRow * DOT + 30) + 'px';
    box.innerHTML = html;
    var t = [], wide = W >= 420;
    if (sd > 0) {
      if (wide) t.push(mean - 2 * sd);
      t.push(mean - sd, mean, mean + sd);
      if (wide) t.push(mean + 2 * sd);
    } else t.push(mean);
    ticks.innerHTML = t.map(function (v) {
      var p = Math.max(7, Math.min(93, pc(v)));
      return '<span style="left:' + p + '%;transform:translateX(-50%)">' + fmt(v) + '</span>';
    }).join('');
    var lg = '';
    if (sd > 0) {
      lg = '<span><i style="background:var(--spruce)"></i>within 1 SD</span><span><i style="background:var(--amber)"></i>1–2 SD</span><span><i style="background:#b23030"></i>beyond 2 SD</span>';
      if (es.some(function (e) { return e.out; })) lg += '<span><i style="border:1.5px solid var(--muted)"></i>excluded</span>';
      lg += '<span><i style="background:var(--amber);border-radius:1px;width:3px;height:11px"></i>mean</span>';
    }
    $('sdLegend').innerHTML = lg;
  }

  // ---------- main render ----------
  function setEmpty(P) {
    $('sdValS').textContent = '—'; $('sdValP').textContent = '—';
    $('sdFormS').textContent = 'Paste your numbers to start.'; $('sdFormP').textContent = '';
    $('sdResults').style.display = 'none';
    $('sdMVal').textContent = '—'; $('sdMDec').textContent = '';
    lastPlot = null;
  }
  function render() {
    var P = parse(), entries = P.entries, note = $('sdNote');
    if (!dataEl.value.trim()) note.textContent = fmtMode === 'list' ? 'Separate with commas, spaces or new lines.' : 'One pair per line: the value, then how many times it occurs (e.g. 85, 3).';
    else {
      var nTot = entries.reduce(function (a, e) { return a + e.c; }, 0);
      note.textContent = (fmtMode === 'list' ? entries.length + ' value' + (entries.length === 1 ? '' : 's') + ' read'
        : entries.length + ' row' + (entries.length === 1 ? '' : 's') + ' read · n = ' + fmtInt(nTot))
        + (P.ignored.length ? ' · ' + P.ignored.length + ' ignored (' + P.ignored.slice(0, 4).join(', ') + (P.ignored.length > 4 ? '…' : '') + ')' : '');
    }
    if (!entries.length) { setEmpty(P); return; }

    var full = compute(entries), sd0 = activeSd(full), canFlag = isFinite(sd0) && sd0 > 0;
    entries.forEach(function (e) { e.f = canFlag && Math.abs(e.x - full.mean) / sd0 > thr + 1e-12; e.out = false; });
    var flagged = entries.filter(function (e) { return e.f; });
    var data = entries;
    if (excl && flagged.length && flagged.length < entries.length) {
      data = entries.filter(function (e) { return !e.f; });
      flagged.forEach(function (e) { e.out = true; });
    }
    var st = compute(data), sd = activeSd(st), n = st.n;

    // tiles
    $('sdTileS').classList.toggle('on', kind === 'sample');
    $('sdTileP').classList.toggle('on', kind === 'pop');
    $('sdValS').textContent = isFinite(st.sdS) ? fmt(st.sdS) : '—';
    $('sdFormS').textContent = n > 1 ? 's = √(SS ÷ (n − 1)) = √(' + fmt(st.ss) + ' ÷ ' + fmtInt(n - 1) + ')' : 'Needs at least 2 values.';
    $('sdValP').textContent = fmt(st.sdP);
    $('sdFormP').textContent = 'σ = √(SS ÷ n) = √(' + fmt(st.ss) + ' ÷ ' + fmtInt(n) + ')';
    $('sdMLab').textContent = kind === 'sample' ? 'Sample SD (s)' : 'Population SD (σ)';
    $('sdMVal').textContent = isFinite(sd) ? fmt(sd) : '—';
    $('sdMDec').textContent = ' · mean ' + fmt(st.mean);
    $('sdResults').style.display = '';

    // plain-English reading
    var plain;
    if (!isFinite(sd)) plain = 'Add at least 2 values to get a sample standard deviation — the population version is shown on the right.';
    else if (sd === 0) plain = 'Every value is identical, so there is no spread — the standard deviation is 0.';
    else {
      var k = 0; data.forEach(function (e) { if (Math.abs(e.x - st.mean) <= sd + 1e-12) k += e.c; });
      plain = fmtInt(k) + ' of ' + fmtInt(n) + ' values (' + Math.round(k / n * 100) + '%) fall within 1 SD of the mean, between ' + fmt(st.mean - sd) + ' and ' + fmt(st.mean + sd) + '. For bell-shaped data, about 68% is typical.';
    }
    $('sdPlain').textContent = plain;

    // exclusion note
    var ex = $('sdExcl');
    if (excl && advanced) {
      var cnt = flagged.reduce(function (a, e) { return a + e.c; }, 0);
      if (!canFlag) ex.textContent = 'Outliers need a standard deviation above 0, so nothing was excluded.';
      else if (!flagged.length) ex.textContent = 'No values are beyond ' + thr + ' SD of the mean, so nothing was excluded.';
      else if (flagged.length >= entries.length) ex.textContent = 'Every value is beyond ' + thr + ' SD, so nothing was excluded.';
      else ex.textContent = 'Excluded ' + fmtInt(cnt) + ' outlier' + (cnt === 1 ? '' : 's') + ' (' + flagged.slice(0, 6).map(function (e) { return fmt(e.x); }).join(', ') + (flagged.length > 6 ? '…' : '') + ') — the ' + (kind === 'sample' ? 'sample' : 'population') + ' standard deviation changed from ' + fmt(sd0) + ' to ' + fmt(sd) + '.';
      ex.style.display = '';
    } else ex.style.display = 'none';

    // number line
    lastPlot = { entries: entries, st: st, sd: sd };
    drawPlot(lastPlot);

    // stats table
    $('sdStatsBody').innerHTML = [
      ['Mean (x̄)', fmt(st.mean)], ['Count (n)', fmtInt(n)], ['Sum (Σx)', fmt(st.sum)],
      ['Sum of squares (SS)', fmt(st.ss)], ['Sample variance (s²)', isFinite(st.varS) ? fmt(st.varS) : '—'],
      ['Population variance (σ²)', fmt(st.varP)]
    ].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('');

    // advanced output
    var adv = $('sdAdvOut');
    adv.style.display = advanced ? '' : 'none';
    if (advanced) {
      var q = quantiles(data), q1 = q(0.25), med = q(0.5), q3 = q(0.75), rows = [
        ['Minimum', fmt(st.min)], ['Maximum', fmt(st.max)], ['Range', fmt(st.max - st.min)],
        ['Median', fmt(med)], ['Lower quartile (Q1)', fmt(q1)], ['Upper quartile (Q3)', fmt(q3)],
        ['Interquartile range (IQR)', fmt(q3 - q1)], ['Mode', modeText(data)]
      ];
      if (isFinite(sd) && st.mean !== 0) rows.push(['Relative SD (coefficient of variation)', fmt(sd / Math.abs(st.mean) * 100) + '%']);
      if (n > 1 && isFinite(st.sdS)) {
        var se = st.sdS / Math.sqrt(n), tc = tcrit(n - 1, lvl), moe = tc * se, lv = ['90', '95', '99'][lvl];
        rows.push(['Standard error of the mean', fmt(se)], ['t critical value (df ' + fmtInt(n - 1) + ', ' + lv + '%)', tc.toFixed(3)],
          ['Margin of error (' + lv + '%)', '± ' + fmt(moe)], ['Confidence interval for the mean (' + lv + '%)', fmt(st.mean - moe) + ' to ' + fmt(st.mean + moe)]);
      }
      $('sdDescBody').innerHTML = rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('');

      // z-scores (full data, active SD)
      var zn = $('sdZNote'), zb = $('sdZBody');
      if (!canFlag) { zn.textContent = 'z-scores need a standard deviation above 0.'; zb.innerHTML = ''; }
      else {
        var zr = distinct(entries).map(function (e) { return { x: e.x, c: e.c, z: (e.x - full.mean) / sd0 }; });
        zr.sort(function (a, b) { return Math.abs(b.z) - Math.abs(a.z); });
        var fcount = flagged.reduce(function (a, e) { return a + e.c; }, 0);
        zn.textContent = 'Based on the full data: mean ' + fmt(full.mean) + ', ' + (kind === 'sample' ? 'sample' : 'population') + ' SD ' + fmt(sd0) + '. ' + (fcount ? fmtInt(fcount) + ' value' + (fcount === 1 ? ' is' : 's are') + ' beyond ' + thr + ' SD.' : 'No value is beyond ' + thr + ' SD.') + ' Sorted by distance from the mean.';
        zb.innerHTML = zr.slice(0, 300).map(function (r) {
          var isOut = Math.abs(r.z) > thr + 1e-12;
          return '<tr' + (isOut && excl ? ' class="sd-xrow"' : '') + '><td>' + fmt(r.x) + '</td><td>' + fmtInt(r.c) + '</td><td>' + (r.z < 0 ? '−' : '') + Math.abs(r.z).toFixed(2) + '</td><td class="' + (isOut ? 'sd-flag' : 'sd-ok') + '">' + (isOut ? (excl ? 'Outlier — excluded' : 'Outlier') : 'Within range') + '</td></tr>';
        }).join('');
      }
    }

    // steps
    var counts = fmtMode === 'counts';
    $('sdSteps').innerHTML = '<ul><li>Count: n = ' + fmtInt(n) + '. Sum: Σx = ' + fmt(st.sum) + '.</li><li>Mean: x̄ = ' + fmt(st.sum) + ' ÷ ' + fmtInt(n) + ' = <b>' + fmt(st.mean) + '</b>.</li><li>Subtract the mean from each value and square the result:</li></ul>';
    $('sdStepsHead').innerHTML = counts ? '<tr><th>Value</th><th>Count</th><th>x − mean</th><th>Count × (x − mean)²</th></tr>' : '<tr><th>Value</th><th>x − mean</th><th>(x − mean)²</th></tr>';
    var cap = 1000;
    $('sdStepsBody').innerHTML = data.slice(0, cap).map(function (e) {
      var d = e.x - st.mean;
      return counts ? '<tr><td>' + fmt(e.x) + '</td><td>' + fmtInt(e.c) + '</td><td>' + fmt(d) + '</td><td>' + fmt(e.c * d * d) + '</td></tr>'
        : '<tr><td>' + fmt(e.x) + '</td><td>' + fmt(d) + '</td><td>' + fmt(d * d) + '</td></tr>';
    }).join('') + (data.length > cap ? '<tr><td colspan="' + (counts ? 4 : 3) + '">… and ' + fmtInt(data.length - cap) + ' more rows (all included in the totals)</td></tr>' : '');
    $('sdSteps2').innerHTML = '<ul><li>Add the squares: SS = <b>' + fmt(st.ss) + '</b>.</li>'
      + (n > 1 ? '<li>Sample variance: s² = SS ÷ (n − 1) = ' + fmt(st.ss) + ' ÷ ' + fmtInt(n - 1) + ' = ' + fmt(st.varS) + ', so s = √' + fmt(st.varS) + ' = <b>' + fmt(st.sdS) + '</b>.</li>' : '<li>A sample standard deviation needs at least 2 values.</li>')
      + '<li>Population variance: σ² = SS ÷ n = ' + fmt(st.ss) + ' ÷ ' + fmtInt(n) + ' = ' + fmt(st.varP) + ', so σ = √' + fmt(st.varP) + ' = <b>' + fmt(st.sdP) + '</b>.</li></ul>';
  }

  // ---------- controls ----------
  function setSeg(id, v) {
    [].forEach.call($(id).children, function (b) { b.classList.toggle('on', b.dataset.v === '' + v); });
  }
  function wireSeg(id, cb) {
    $(id).addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      setSeg(id, b.dataset.v); cb(b.dataset.v); render();
    });
  }
  wireSeg('sdKindSeg', function (v) { kind = v; });
  wireSeg('sdThrSeg', function (v) { thr = parseFloat(v); });
  wireSeg('sdExclSeg', function (v) { excl = v === 'excl'; });
  wireSeg('sdLvlSeg', function (v) { lvl = parseInt(v, 10); });
  wireSeg('sdFormatSeg', function (v) {
    fmtMode = v;
    $('sdDataLab').textContent = v === 'list' ? 'Numbers' : 'Value, count (one pair per line)';
    dataEl.placeholder = v === 'list' ? 'e.g. 10, 12, 23, 23, 16, 23, 21, 16\nor paste a column from Excel' : 'value, count — one pair per line\n85, 3\n90, 5\n72, 2';
  });
  dataEl.addEventListener('input', render);
  $('sdPlaces').addEventListener('input', render);

  var csvBtn = $('sdImportBtn'), csvFile = $('sdCsvFile');
  csvBtn.addEventListener('click', function () { csvFile.click(); });
  csvFile.addEventListener('change', function () {
    var f = csvFile.files && csvFile.files[0]; if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var lines = ('' + reader.result).split(/\r?\n/).map(function (l) { return (l.match(/-?\d+(\.\d+)?(e[-+]?\d+)?/gi) || []).join(', '); }).filter(Boolean);
      dataEl.value = fmtMode === 'list' ? lines.join(', ') : lines.join('\n');
      render();
    };
    reader.readAsText(f);
    csvFile.value = '';
  });

  var advBtn = $('sdAdvBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('sdAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('sdAdvIn').style.display = advanced ? '' : 'none';
    if (!advanced) { excl = false; thr = 2; lvl = 1; setSeg('sdExclSeg', 'keep'); setSeg('sdThrSeg', '2'); setSeg('sdLvlSeg', '1'); }
    render();
  });

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (lastPlot) drawPlot(lastPlot); }, 120); });

  render();
};

/* ===== CalcThis Paint engine =====
   CalcThis.initPaintCalc() — interior or exterior paint from room (or wall-by-wall)
   dimensions: wall area minus doors/windows, optional ceiling and trim & doors, per-surface
   coats and coverage, optional primer and waste. Differentiator vs. every competitor checked
   (Omnicalculator, Sherwin-Williams, Behr, PaintColorHQ — all bare-number, one volume out):
   a live room diagram (every wall drawn flat with its area, openings, ceiling plan, trim),
   a real shopping list per surface (cans to buy + leftover + cost) and a multi-room project
   total. Lengths are held internally in feet and paint in US gallons; the unit toggle only
   changes what is read and shown. Independent engine, no shared state. */
CalcThis.initPaintCalc = function () {
  var $ = function (id) { return document.getElementById(id); };
  var FT_PER_M = 3.280839895, FT2_PER_M2 = 10.7639104, L_PER_GAL = 3.785411784;
  var COV = { smooth: 400, medium: 350, rough: 300 };       // sq ft per US gallon
  var PRIMER_COV = 300, CASING_FT = 0.25;
  var SQFTGAL_TO_M2L = (1 / FT2_PER_M2) / L_PER_GAL;        // 0.024543
  var M2L_TO_SQFTGAL = 1 / SQFTGAL_TO_M2L;                  // 40.746

  var sys = 'us', surf = 'interior', measure = 'room', coats = 2, tex = 'medium', primer = false;
  var ceilCoats = 0, trimCoats = 0;                          // 0 = same as walls
  var also = { ceiling: false, trim: false };
  var tally = [];
  var advanced = false;
  var wallRowCount = 0;

  var NAME = { walls: 'Walls', ceiling: 'Ceiling', trim: 'Trim & doors', primer: 'Primer' };
  var PAINT = { walls: 'wall paint', ceiling: 'ceiling paint', trim: 'trim paint', primer: 'primer' };
  var ORDER = ['walls', 'ceiling', 'trim', 'primer'];

  function num(id) { var el = typeof id === 'string' ? $(id) : id; if (!el) return NaN; var n = parseFloat((el.value || '').trim()); return isNaN(n) ? NaN : n; }
  function pos(id) { var n = num(id); return (!isNaN(n) && n > 0) ? n : NaN; }
  function cnt(id) { var n = num(id); return (!isNaN(n) && n > 0) ? Math.floor(n) : 0; }
  function lenFt(v) { return sys === 'us' ? v : v * FT_PER_M; }
  function smallFt(v) { return sys === 'us' ? v / 12 : v / 100 * FT_PER_M; }
  function fmt(n) { if (n == null || isNaN(n)) return '—'; if (n >= 100) return Math.round(n).toString(); var r = Math.round(n * 10) / 10; return r.toString(); }
  function fmtV(n) { var r = Math.round(n * 10) / 10; if (r === 0 && n > 0) return '<0.1'; return r.toString(); }
  function money(n) { return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function joinList(a) { if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function vol(gal) { return sys === 'us' ? gal : gal * L_PER_GAL; }
  function volUnit() { return sys === 'us' ? 'gal' : 'L'; }
  function areaTxt(ft2) { return sys === 'us' ? fmt(ft2) + ' sq ft' : fmt(ft2 / FT2_PER_M2) + ' m²'; }
  function covDisp(sqftGal) { return sys === 'us' ? fmt(sqftGal) : (Math.round(sqftGal * SQFTGAL_TO_M2L * 10) / 10).toString(); }
  function sizes() { return sys === 'us' ? [1, 0.25] : [5, 2.5, 1]; }

  /* ---------- buy list: fewest-waste combination of can sizes ---------- */
  function bestBuy(need, sz) {
    function zeros(k) { var a = []; for (var i = 0; i < k; i++) a.push(0); return a; }
    if (need <= 1e-9) return { counts: zeros(sz.length), vol: 0, cans: 0 };
    function go(n, i) {
      var s = sz[i];
      if (i === sz.length - 1) { var c = Math.max(0, Math.ceil(n / s - 1e-9)); return { counts: [c], vol: c * s, cans: c }; }
      var f = Math.floor(n / s + 1e-9), rem = n - f * s;
      var rest = go(rem, i + 1);
      var a = { counts: [f].concat(rest.counts), vol: f * s + rest.vol, cans: f + rest.cans };
      if (rem > 1e-9) {
        var b = { counts: [f + 1].concat(zeros(sz.length - i - 1)), vol: (f + 1) * s, cans: f + 1 };
        if (b.vol < a.vol - 1e-9 || (Math.abs(b.vol - a.vol) < 1e-9 && b.cans < a.cans)) return b;
      }
      return a;
    }
    return go(need, 0);
  }
  function buyLabel(b) {
    var parts = [], i;
    if (sys === 'us') {
      if (b.counts[0] > 0) parts.push(b.counts[0] + ' gal');
      if (b.counts[1] > 0) parts.push(b.counts[1] + ' qt');
    } else {
      var labs = ['5 L', '2.5 L', '1 L'];
      for (i = 0; i < b.counts.length; i++) if (b.counts[i] > 0) parts.push(b.counts[i] > 1 ? b.counts[i] + ' × ' + labs[i] : labs[i]);
    }
    return parts.length ? parts.join(' + ') : '—';
  }

  /* ---------- read the inputs (lengths converted to feet) ---------- */
  function wallRowEls() { return [].slice.call($('ptWallRows').querySelectorAll('.pt-wrow')); }
  function readRoom() {
    var r = { ok: false, missing: [], walls: [], perim: 0, ceilArea: null, doors: 0, wins: 0, plan: null };
    if (measure === 'room') {
      var L = pos('ptLen'), W = pos('ptWid'), H = pos('ptHgt');
      if (isNaN(L)) r.missing.push('length');
      if (isNaN(W)) r.missing.push('width');
      if (isNaN(H)) r.missing.push(surf === 'interior' ? 'ceiling height' : 'wall height');
      if (r.missing.length) return r;
      L = lenFt(L); W = lenFt(W); H = lenFt(H);
      var pk = pos('ptPeak'); pk = isNaN(pk) ? 0 : lenFt(pk);
      r.walls = [{ w: L, h: H, d: 0, n: 0, p: 0 }, { w: W, h: H, d: 0, n: 0, p: pk }, { w: L, h: H, d: 0, n: 0, p: 0 }, { w: W, h: H, d: 0, n: 0, p: pk }];
      r.doors = cnt('ptDoors'); r.wins = cnt('ptWins');
      r.perim = 2 * (L + W); r.ceilArea = L * W; r.plan = { l: L, w: W };
    } else {
      wallRowEls().forEach(function (row) {
        var g = function (f) { return row.querySelector('[data-f="' + f + '"]'); };
        var w = pos(g('w')), h = pos(g('h'));
        if (isNaN(w) || isNaN(h)) return;                    // half-typed row: skipped quietly
        var d = cnt(g('d')), n = cnt(g('n')), p = pos(g('p'));
        r.walls.push({ w: lenFt(w), h: lenFt(h), d: d, n: n, p: isNaN(p) ? 0 : lenFt(p) });
        r.doors += d; r.wins += n; r.perim += lenFt(w);
      });
      if (!r.walls.length) { r.missing.push('width and height for at least one wall'); return r; }
      if (also.ceiling && surf === 'interior') {
        var ca = pos('ptCeilArea');
        if (isNaN(ca)) { r.missing.push('ceiling area'); return r; }
        r.ceilArea = sys === 'us' ? ca : ca * FT2_PER_M2;
      }
    }
    r.ok = true;
    return r;
  }

  /* ---------- the maths ---------- */
  function dimFt(id, defUs, defMet) { var v = pos(id); if (isNaN(v)) v = sys === 'us' ? defUs : defMet; return lenFt(v); }
  function compute(r) {
    var dW = dimFt('ptDoorW', 3, 0.9), dH = dimFt('ptDoorH', 6.7, 2), wW = dimFt('ptWinW', 3, 0.9), wH = dimFt('ptWinH', 5, 1.5);
    var doorA = dW * dH, winA = wW * wH;
    var gross = 0, peakA = 0;
    r.walls.forEach(function (w) { gross += w.w * w.h; peakA += 0.5 * w.w * w.p; });
    var open = r.doors * doorA + r.wins * winA;
    var wallsA = gross + peakA - open;
    if (wallsA <= 0) return null;
    var ceilA = (surf === 'interior' && also.ceiling && r.ceilArea) ? r.ceilArea : 0;
    var trimA = 0, baseFt = 0, crownFt = 0;
    if (also.trim) {
      var casing = (r.doors * (2 * dH + dW) + r.wins * 2 * (wW + wH)) * CASING_FT;
      if (surf === 'interior') {
        var bv = pos('ptBase'), cv = num('ptCrown');
        baseFt = smallFt(isNaN(bv) ? (sys === 'us' ? 5 : 12) : bv);
        crownFt = smallFt((isNaN(cv) || cv < 0) ? 0 : cv);
        trimA = r.doors * doorA * 2 + Math.max(0, r.perim - r.doors * dW) * baseFt + r.perim * crownFt + casing;
      } else {
        trimA = r.doors * doorA + casing;
      }
    }
    var ov = pos('ptCov');
    var cov = isNaN(ov) ? COV[tex] : (sys === 'us' ? ov : ov * M2L_TO_SQFTGAL);
    var wv = num('ptWaste'), waste = (isNaN(wv) || wv < 0) ? 0 : wv, mult = 1 + waste / 100;
    var cc = { walls: coats, ceiling: ceilCoats || coats, trim: trimCoats || coats };
    var s = {};
    s.walls = { area: wallsA, coats: cc.walls, gal: wallsA * cc.walls / cov * mult };
    if (ceilA > 0) s.ceiling = { area: ceilA, coats: cc.ceiling, gal: ceilA * cc.ceiling / cov * mult };
    if (trimA > 0) s.trim = { area: trimA, coats: cc.trim, gal: trimA * cc.trim / cov * mult };
    if (primer) { var pa = wallsA + ceilA; s.primer = { area: pa, coats: 1, gal: pa / PRIMER_COV * mult }; }
    var paintGal = 0, paintArea = 0;
    ['walls', 'ceiling', 'trim'].forEach(function (k) { if (s[k]) { paintGal += s[k].gal; paintArea += s[k].area; } });
    return { s: s, gross: gross, peakA: peakA, open: open, doors: r.doors, wins: r.wins, cov: cov, waste: waste, paintGal: paintGal, paintArea: paintArea, doorW: dW, doorH: dH, winW: wW, winH: wH, baseFt: baseFt };
  }

  /* ---------- shopping list table ---------- */
  function priceVal() { var p = num('ptPrice'); return (!isNaN(p) && p > 0) ? p : null; }
  function shopTable(rows, soleLabel) {
    var sole = rows.length === 1 && rows[0].key === 'walls';
    var html = '<div class="stable-wrap"><table class="stable pt-shop"><thead><tr><th>' + (sole ? 'Area' : 'Surface') + '</th><th>Need</th><th>Buy</th><th>Left</th></tr></thead><tbody>';
    var bought = 0, left = 0, buys = [];
    rows.forEach(function (row) {
      var need = vol(row.gal), b = bestBuy(need, sizes()), l = Math.max(0, b.vol - need);
      bought += b.vol; left += l;
      buys.push({ key: row.key, label: buyLabel(b) });
      var sub = areaTxt(row.area) + (row.coats ? ' × ' + row.coats + (row.coats > 1 ? ' coats' : ' coat') : '');
      if (sole && soleLabel) html += '<tr class="pt-lab"><td colspan="4">' + soleLabel + '</td></tr>';
      html += '<tr><td>' + (sole ? '' : NAME[row.key]) + '<span class="pt-sub">' + sub + '</span></td><td>' + fmtV(need) + ' ' + volUnit() + '</td><td class="pt-buy">' + buyLabel(b) + '</td><td>' + fmtV(l) + ' ' + volUnit() + '</td></tr>';
    });
    html += '</tbody></table></div>';
    return { html: html, bought: bought, left: left, buys: buys };
  }
  function rowsFrom(s) { var out = []; ORDER.forEach(function (k) { if (s[k] && s[k].gal > 0) out.push({ key: k, area: s[k].area, coats: s[k].coats, gal: s[k].gal }); }); return out; }
  function plainLine(shop, leftTxt) {
    var parts = [], prim = '';
    shop.buys.forEach(function (b) { if (b.key === 'primer') prim = b.label + ' of primer'; else parts.push(b.label + ' of ' + PAINT[b.key]); });
    var txt = 'Buy ' + joinList(parts.concat(prim ? [prim] : [])) + '.';
    if (shop.left > 0.04) txt += ' About ' + fmtV(shop.left) + ' ' + volUnit() + ' left over for touch-ups.';
    return txt;
  }

  /* ---------- live diagram ---------- */
  function renderDiagram(r, c) {
    var box = $('ptDiagram');
    if (!r || !r.ok || !c) { box.innerHTML = '<div class="sq-diagram-empty">Enter your room size and every wall will be drawn here, flat, with its area.</div>'; return; }
    var walls = r.walls, n = walls.length, VW = 280, PAD = 8, GAP = 6, TOP = 8, i, k;
    var totW = 0, maxH = 0;
    walls.forEach(function (w) { totW += w.w; maxH = Math.max(maxH, w.h + w.p); });
    var ws = Math.min((VW - 2 * PAD - GAP * (n - 1)) / totW, 96 / maxH);
    var stripH = maxH * ws, base = TOP + stripH;
    // openings per wall: real counts in wall-by-wall mode, spread evenly (illustration) in room mode
    var dArr = [], nArr = [];
    for (i = 0; i < n; i++) { dArr.push(measure === 'room' ? 0 : walls[i].d); nArr.push(measure === 'room' ? 0 : walls[i].n); }
    if (measure === 'room') { for (k = 0; k < r.doors; k++) dArr[k % n]++; for (k = 0; k < r.wins; k++) nArr[(k + 1) % n]++; }
    var trimOn = also.trim && surf === 'interior';
    var WALL_F = 'rgba(181,118,31,.17)', STROKE = 'var(--ink)', TRIM = 'var(--spruce)';
    var svg = '', x = PAD, letters = '';
    for (i = 0; i < n; i++) {
      var w = walls[i], wpx = w.w * ws, hpx = w.h * ws, top = base - hpx;
      if (w.p > 0) svg += '<polygon points="' + x + ',' + top + ' ' + (x + wpx) + ',' + top + ' ' + (x + wpx / 2) + ',' + (top - w.p * ws) + '" fill="' + WALL_F + '" stroke="' + STROKE + '" stroke-width="1.4" stroke-linejoin="round"/>';
      svg += '<rect x="' + x + '" y="' + top + '" width="' + wpx + '" height="' + hpx + '" fill="' + WALL_F + '" stroke="' + STROKE + '" stroke-width="1.4"/>';
      if (trimOn && c.baseFt > 0) { var bh = Math.max(3, c.baseFt * ws); svg += '<rect x="' + x + '" y="' + (base - bh) + '" width="' + wpx + '" height="' + bh + '" fill="' + TRIM + '" opacity=".85"/>'; }
      var slots = Math.min(6, dArr[i] + nArr[i]), si = 0, slotW = wpx / (slots + 1);
      var stroke = also.trim ? TRIM : STROKE, dash = also.trim ? '' : ' stroke-dasharray="4 3"';
      for (k = 0; k < Math.min(dArr[i], 6); k++) {
        si++; var dw = Math.min(c.doorW * ws, slotW * 0.8), dh = Math.min(c.doorH * ws, hpx * 0.92);
        svg += '<rect x="' + (x + slotW * si - dw / 2) + '" y="' + (base - dh) + '" width="' + dw + '" height="' + dh + '" fill="var(--paper)" stroke="' + stroke + '" stroke-width="1.3"' + dash + '/>';
      }
      for (k = 0; k < nArr[i] && si < 6; k++) {
        si++; var ww = Math.min(c.winW * ws, slotW * 0.8), wh = Math.min(c.winH * ws, hpx * 0.6);
        svg += '<rect x="' + (x + slotW * si - ww / 2) + '" y="' + (base - hpx * 0.55 - wh / 2) + '" width="' + ww + '" height="' + wh + '" fill="var(--paper)" stroke="' + stroke + '" stroke-width="1.3"' + dash + '/>';
      }
      var gA = w.w * w.h + 0.5 * w.w * w.p;
      letters += '<text x="' + (x + wpx / 2) + '" y="' + (base + 15) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-soft)">' + String.fromCharCode(65 + (i % 26)) + '</text>';
      if (wpx >= 50) letters += '<text x="' + (x + wpx / 2) + '" y="' + (base + 29) + '" text-anchor="middle" font-size="12" font-weight="500" fill="var(--ink)">' + areaTxt(gA) + '</text>';
      x += wpx + GAP;
    }
    svg += letters;
    var H = base + 34;
    if (also.ceiling && surf === 'interior' && r.ceilArea) {
      var py = base + 42, boxW = 110, boxH = 38, pw, ph, ar = r.plan ? r.plan.l / r.plan.w : 1.6;
      ar = Math.max(0.4, Math.min(2.5, ar));
      if (ar >= boxW / boxH) { pw = boxW; ph = boxW / ar; } else { ph = boxH; pw = boxH * ar; }
      svg += '<rect x="' + PAD + '" y="' + (py + (boxH - ph) / 2) + '" width="' + pw + '" height="' + ph + '" fill="rgba(55,80,63,.16)" stroke="' + STROKE + '" stroke-width="1.4"/>';
      svg += '<text x="' + (PAD + boxW + 12) + '" y="' + (py + boxH / 2 + 4) + '" font-size="12" font-weight="600" fill="var(--ink)">Ceiling · ' + areaTxt(r.ceilArea) + '</text>';
      H = py + boxH + 6;
    }
    var key = '<span class="pt-key"><i style="background:rgba(181,118,31,.4)"></i>Walls</span>';
    if (also.ceiling && surf === 'interior') key += '<span class="pt-key"><i style="background:rgba(55,80,63,.4)"></i>Ceiling</span>';
    if (also.trim) key += '<span class="pt-key"><i style="background:var(--spruce)"></i>Trim &amp; doors</span>';
    var leg = '<span><b>Walls to paint</b> ' + areaTxt(c.s.walls.area) + '</span>';
    if (c.open > 0) leg += '<span><b>Openings</b> −' + areaTxt(c.open) + '</span>';
    if (c.peakA > 0) leg += '<span><b>Gable / peak</b> +' + areaTxt(c.peakA) + '</span>';
    if (measure === 'room' && (r.doors + r.wins) > 0) leg += '<span class="pt-note">Openings are placed for illustration.</span>';
    box.innerHTML = '<svg viewBox="0 0 ' + VW + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg><div class="pt-keys">' + key + '</div><div class="sq-diagram-legend">' + leg + '</div>';
  }

  /* ---------- live room ---------- */
  var live = null;                                         // {r, c} of the room being edited
  function setAddEnabled(ok) { var b = $('ptAddBtn'); b.disabled = !ok; b.style.opacity = ok ? '1' : '.5'; b.style.cursor = ok ? 'pointer' : 'not-allowed'; }
  function renderRoom() {
    var r = readRoom(), c = r.ok ? compute(r) : null;
    live = (r.ok && c) ? { r: r, c: c } : null;
    setAddEnabled(!!live);
    $('ptHint').style.display = live ? 'none' : 'block';
    $('ptAddNote').style.display = live ? 'block' : 'none';
    if (!r.ok) $('ptHint').textContent = 'Enter ' + joinList(r.missing);
    else if (!c) $('ptHint').textContent = 'The openings are bigger than the walls — check the sizes';
    renderDiagram(r, c);
    $('ptResUnit').textContent = volUnit();
    var res = $('ptResBody');
    if (!live) {
      $('ptResQty').textContent = '—';
      $('ptResSub').textContent = 'Enter the room size to see how much paint you need.';
      res.style.display = 'none';
      return;
    }
    $('ptResQty').textContent = fmtV(vol(c.paintGal));
    $('ptResSub').textContent = areaTxt(c.paintArea) + ' to paint' + (c.waste > 0 ? ' · incl. ' + fmt(c.waste) + '% extra' : '');
    var shop = shopTable(rowsFrom(c.s));
    $('ptShop').innerHTML = shop.html;
    $('ptPlain').textContent = plainLine(shop);
    var p = priceVal();
    $('ptCostWrap').classList.toggle('hide', p == null);
    if (p != null) $('ptCost').textContent = money(shop.bought * p);
    var covTxt = covDisp(c.cov) + ' ' + (sys === 'us' ? 'sq ft per gallon' : 'm² per litre');
    $('ptAssume').textContent = 'Assumes ' + covTxt + ', a ' + fmtDim(c.doorW) + ' × ' + fmtDim(c.doorH) + ' door and a ' + fmtDim(c.winW) + ' × ' + fmtDim(c.winH) + ' window' + (primer ? ', primer at ' + covDisp(PRIMER_COV) + ' ' + (sys === 'us' ? 'sq ft per gallon' : 'm² per litre') : '') + '.';
    res.style.display = '';
  }
  function fmtDim(ft) { var v = sys === 'us' ? ft : ft / FT_PER_M; var u = sys === 'us' ? ' ft' : ' m'; return (Math.round(v * 10) / 10) + u; }

  /* ---------- project tally ---------- */
  function sumTally() {
    var t = { gal: { walls: 0, ceiling: 0, trim: 0, primer: 0 }, area: { walls: 0, ceiling: 0, trim: 0, primer: 0 }, paintGal: 0 };
    tally.forEach(function (row) { ORDER.forEach(function (k) { t.gal[k] += row.gal[k]; t.area[k] += row.area[k]; }); t.paintGal += row.paintGal; });
    return t;
  }
  function renderTally() {
    var body = $('ptTallyBody');
    var t = sumTally(), shop = null;
    if (!tally.length) {
      body.innerHTML = '<div class="tally-empty">Painting more than one room? Add each above and they’ll total here with one shopping list.</div>';
      $('ptProj').style.display = 'none'; $('ptProjTotal').style.display = 'none'; $('ptClearAll').style.display = 'none';
    } else {
      $('ptClearAll').style.display = 'inline';
      var html = '';
      tally.forEach(function (row, i) {
        html += '<div class="trow"><span class="desc"><span class="d">' + row.label + '</span></span>'
          + '<span class="qt">' + fmtV(vol(row.paintGal)) + ' ' + volUnit() + '</span>'
          + '<span class="rc">' + areaTxt(row.paintArea) + '</span>'
          + '<button class="x" data-i="' + i + '" aria-label="Remove">×</button></div>';
      });
      body.innerHTML = html;
      var rows = [];
      ORDER.forEach(function (k) { if (t.gal[k] > 0) rows.push({ key: k, area: t.area[k], coats: 0, gal: t.gal[k] }); });
      shop = shopTable(rows, tally.length === 1 && tally[0].named ? tally[0].label : '');
      $('ptProjShop').innerHTML = shop.html;
      $('ptProj').style.display = '';
      $('ptProjTotal').style.display = 'grid';
      $('ptTotQty').textContent = fmtV(vol(t.paintGal));
      $('ptTotUnit').textContent = volUnit();
      $('ptProjCount').textContent = '(' + tally.length + (tally.length === 1 ? ' room)' : ' rooms)');
      var p = priceVal();
      $('ptTotCostRow').style.display = p == null ? 'none' : 'block';
      $('ptTotCost').style.display = p == null ? 'none' : 'block';
      if (p != null) $('ptTotCost').textContent = money(shop.bought * p);
    }
    updateMbar(t, shop);
  }
  function updateMbar(t, shop) {
    var cw = $('mCostWrap'), p = priceVal();
    if (tally.length) {
      $('mLab').textContent = 'Project total';
      $('mSeg').innerHTML = '<b>' + fmtV(vol(t.paintGal)) + '</b> ' + volUnit();
      if (p != null && shop) { cw.classList.remove('hide'); $('mCost').textContent = money(shop.bought * p); } else cw.classList.add('hide');
      return;
    }
    $('mLab').textContent = 'This room';
    if (!live) { $('mSeg').innerHTML = '<b>—</b> ' + volUnit(); cw.classList.add('hide'); return; }
    $('mSeg').innerHTML = '<b>' + fmtV(vol(live.c.paintGal)) + '</b> ' + volUnit();
    if (p != null) { var sh = shopTable(rowsFrom(live.c.s)); cw.classList.remove('hide'); $('mCost').textContent = money(sh.bought * p); } else cw.classList.add('hide');
  }
  function renderAll() { renderRoom(); renderTally(); }

  /* ---------- wall-by-wall rows ---------- */
  function addWallRow() {
    var row = document.createElement('div');
    row.className = 'pt-wrow';
    row.innerHTML = '<span class="pt-wl"></span>'
      + ['w', 'h', 'd', 'n', 'p'].map(function (f) { return '<input class="win" data-f="' + f + '" type="number" inputmode="decimal" min="0" placeholder="0" aria-label="' + ({ w: 'Wall width', h: 'Wall height', d: 'Doors', n: 'Windows', p: 'Peak height' })[f] + '">'; }).join('')
      + '<button class="x" type="button" aria-label="Remove wall">×</button>';
    $('ptWallRows').appendChild(row);
    renumber();
  }
  function renumber() { wallRowEls().forEach(function (row, i) { row.querySelector('.pt-wl').textContent = String.fromCharCode(65 + (i % 26)); }); }
  function resetWallRows() { $('ptWallRows').innerHTML = ''; for (var i = 0; i < 4; i++) addWallRow(); }

  /* ---------- labels / visibility ---------- */
  function setSeg(id, v, attr) { [].forEach.call($(id).children, function (b) { b.classList.toggle('on', b.getAttribute(attr || 'data-v') === String(v)); }); }
  function updateUnitLabels() {
    var us = sys === 'us';
    [].forEach.call(document.querySelectorAll('#ptInCard [data-dim]'), function (el) { el.textContent = us ? 'ft' : 'm'; });
    [].forEach.call(document.querySelectorAll('#ptInCard [data-small]'), function (el) { el.textContent = us ? 'in' : 'cm'; });
    [].forEach.call(document.querySelectorAll('#ptInCard [data-cov]'), function (el) { el.textContent = us ? 'sq ft/gal' : 'm²/L'; });
    [].forEach.call(document.querySelectorAll('#ptInCard [data-ptarea]'), function (el) { el.textContent = us ? 'sq ft' : 'm²'; });
    $('ptDoorW').placeholder = us ? '3' : '0.9'; $('ptDoorH').placeholder = us ? '6.7' : '2';
    $('ptWinW').placeholder = us ? '3' : '0.9'; $('ptWinH').placeholder = us ? '5' : '1.5';
    $('ptBase').placeholder = us ? '5' : '12';
    $('ptCov').placeholder = covDisp(COV[tex]);
    $('ptPriceLab').textContent = us ? 'Price per gallon' : 'Price per litre';
    $('ptPriceSuf').textContent = us ? '$/gal' : '$/L';
    $('ptTexNote').textContent = us
      ? 'Smooth 400 · Medium 350 · Rough 300 sq ft per gallon'
      : 'Smooth ' + covDisp(400) + ' · Medium ' + covDisp(350) + ' · Rough ' + covDisp(300) + ' m² per litre';
  }
  function applySurface() {
    var ext = surf === 'exterior';
    $('ptHgtLab').firstChild.nodeValue = ext ? 'Wall height ' : 'Ceiling height ';
    $('ptAlsoCeil').style.display = ext ? 'none' : '';
    if (ext && also.ceiling) { also.ceiling = false; $('ptAlsoCeil').classList.remove('on'); }
    $('ptTrimDims').style.display = ext ? 'none' : '';
    $('ptName').placeholder = ext ? 'e.g. Front of house' : 'e.g. Living room';
    $('ptCeilAreaFld').style.display = (measure === 'walls' && also.ceiling && !ext) ? '' : 'none';
    $('ptCeilCoatFld').style.display = (also.ceiling && !ext) ? '' : 'none';
    $('ptTrimCoatFld').style.display = also.trim ? '' : 'none';
  }
  function applyMeasure() {
    var rm = measure === 'room';
    $('ptRoomFields').style.display = rm ? '' : 'none';
    $('ptWallFields').style.display = rm ? 'none' : '';
    $('ptPeakFld').style.display = rm ? '' : 'none';
    applySurface();
  }
  function clearRoomFields(keepHeight) {
    ['ptLen', 'ptWid', 'ptDoors', 'ptWins', 'ptCeilArea', 'ptName'].forEach(function (id) { $(id).value = ''; });
    if (!keepHeight) $('ptHgt').value = '';
    resetWallRows();
  }

  /* ---------- events ---------- */
  $('ptInCard').addEventListener('input', renderAll);

  $('ptUnitSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.sys === sys) return;
    sys = b.dataset.sys; setSeg('ptUnitSeg', sys, 'data-sys');
    [].forEach.call(document.querySelectorAll('#ptInCard input'), function (el) { if (el.id !== 'ptName' && el.id !== 'ptWaste') el.value = ''; });
    resetWallRows(); updateUnitLabels(); renderAll();
  });
  $('ptSurfSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.v === surf) return;
    surf = b.dataset.v; setSeg('ptSurfSeg', surf); applySurface(); renderAll();
  });
  $('ptCoats').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    coats = +b.dataset.v; [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); }); renderAll();
  });
  $('ptAlso').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    also[b.dataset.k] = !also[b.dataset.k]; b.classList.toggle('on', also[b.dataset.k]); applySurface(); renderAll();
  });
  $('ptMeasureSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.v === measure) return;
    measure = b.dataset.v; setSeg('ptMeasureSeg', measure); applyMeasure(); renderAll();
  });
  $('ptTexSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    tex = b.dataset.v; setSeg('ptTexSeg', tex); $('ptCov').placeholder = covDisp(COV[tex]); renderAll();
  });
  $('ptPrimerSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    primer = b.dataset.v === 'yes'; setSeg('ptPrimerSeg', b.dataset.v); renderAll();
  });
  $('ptCeilCoatSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; ceilCoats = +b.dataset.v; setSeg('ptCeilCoatSeg', b.dataset.v); renderAll(); });
  $('ptTrimCoatSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; trimCoats = +b.dataset.v; setSeg('ptTrimCoatSeg', b.dataset.v); renderAll(); });

  $('ptAddWall').addEventListener('click', function () { addWallRow(); var rows = wallRowEls(); rows[rows.length - 1].querySelector('input').focus(); });
  $('ptWallRows').addEventListener('click', function (e) {
    var x = e.target.closest('.x'); if (!x) return;
    var rows = wallRowEls(); if (rows.length <= 1) { [].forEach.call(rows[0].querySelectorAll('input'), function (i) { i.value = ''; }); }
    else x.closest('.pt-wrow').remove();
    renumber(); renderAll();
  });

  $('ptAddBtn').addEventListener('click', function () {
    if (!live) return;
    var c = live.c, area = {}, gal = {};
    ORDER.forEach(function (k) { area[k] = c.s[k] ? c.s[k].area : 0; gal[k] = c.s[k] ? c.s[k].gal : 0; });
    var nm = $('ptName').value.trim();
    tally.push({ label: nm || (surf === 'exterior' ? 'Exterior' : 'Room'), named: !!nm, area: area, gal: gal, paintGal: c.paintGal, paintArea: c.paintArea });
    clearRoomFields(true);
    renderAll();
    var first = measure === 'room' ? $('ptLen') : $('ptWallRows').querySelector('input'); if (first) first.focus();
  });
  $('ptClearFields').addEventListener('click', function () { clearRoomFields(false); renderAll(); });
  $('ptTallyBody').addEventListener('click', function (e) { var x = e.target.closest('.x'); if (!x) return; tally.splice(+x.dataset.i, 1); renderAll(); });
  $('ptClearAll').addEventListener('click', function () { tally = []; renderAll(); });

  function resetAdvanced() {
    measure = 'room'; tex = 'medium'; primer = false; ceilCoats = 0; trimCoats = 0;
    setSeg('ptMeasureSeg', 'room'); setSeg('ptTexSeg', 'medium'); setSeg('ptPrimerSeg', 'no'); setSeg('ptCeilCoatSeg', '0'); setSeg('ptTrimCoatSeg', '0');
    ['ptCov', 'ptDoorW', 'ptDoorH', 'ptWinW', 'ptWinH', 'ptBase', 'ptCrown', 'ptPeak', 'ptWaste', 'ptPrice', 'ptCeilArea'].forEach(function (id) { $(id).value = ''; });
    resetWallRows(); updateUnitLabels(); applyMeasure(); renderAll();
  }
  var advBtn = $('ptAdvBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('ptAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('ptAdvIn').style.display = advanced ? '' : 'none';
    if (!advanced) resetAdvanced();
  });

  resetWallRows();
  updateUnitLabels();
  applyMeasure();
  renderAll();
};

/* ===== CalcThis Wallpaper engine =====
   CalcThis.initWallpaperCalc() — rolls of wallpaper by the STRIP method (how paperhangers
   count): each wall is hung in whole vertical strips, each cut to wall height + trim, rounded
   up to the pattern repeat (half-drop: alternate strips need one extra repeat), and strips are
   cut from rolls in order. Differentiator vs. every competitor checked (Omnicalculator, Inch
   Calculator, Kalk.pro, Materio — all bare numbers or an area ÷ roll-area guess): a live strip
   diagram (every wall with its strips colour-coded by the roll they are cut from), the plain
   area answer shown next to the true strip answer, roll presets, match type, a spare-strips
   line, a shopping list with leftover and cost, and a multi-room project total. Lengths are
   held internally in centimetres; the unit toggle only changes what is read and shown.
   Independent engine, no shared state. */
CalcThis.initWallpaperCalc = function () {
  var $ = function (id) { return document.getElementById(id); };
  var IN = 2.54, FT = 30.48, YD = 91.44, CM2_PER_FT2 = 929.0304;
  var PRESET = { us: { w: 20.5 * IN, l: 33 * FT }, eu: { w: 53, l: 1005 } };
  var PALETTE = ['#37503F', '#B5761F', '#6B7A9E', '#A4795A', '#5E8C7B', '#8F5C13'];

  var sys = 'us', preset = 'us', measure = 'room', match = 'straight', soldBy = 'roll';
  var tally = [], advanced = false;

  function num(id) { var el = typeof id === 'string' ? $(id) : id; if (!el) return NaN; var n = parseFloat((el.value || '').trim()); return isNaN(n) ? NaN : n; }
  function pos(id) { var n = num(id); return (!isNaN(n) && n > 0) ? n : NaN; }
  function cnt(id) { var n = num(id); return (!isNaN(n) && n > 0) ? Math.floor(n) : 0; }
  function lenCm(v) { return sys === 'us' ? v * FT : v * 100; }
  function smallCm(v) { return sys === 'us' ? v * IN : v; }
  function fmtN(n, d) { var r = Math.round(n * Math.pow(10, d)) / Math.pow(10, d); return r.toString(); }
  function fmtLen(cm) {
    if (sys === 'us') {
      var inch = Math.round(cm / IN), ft = Math.floor(inch / 12), i = inch % 12;
      if (ft === 0) return i + ' in';
      return ft + ' ft' + (i ? ' ' + i + ' in' : '');
    }
    return fmtN(cm / 100, 2) + ' m';
  }
  function fmtSmall(cm) { return sys === 'us' ? fmtN(cm / IN, 1) + ' in' : fmtN(cm, 1) + ' cm'; }
  function fmtArea(cm2) { return sys === 'us' ? fmtN(cm2 / CM2_PER_FT2, cm2 / CM2_PER_FT2 >= 100 ? 0 : 1) + ' sq ft' : fmtN(cm2 / 10000, cm2 / 10000 >= 100 ? 0 : 1) + ' m²'; }
  function money(n) { return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function joinList(a) { if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function priceVal() { var p = num('wpPrice'); return (!isNaN(p) && p > 0) ? p : null; }
  function yardUnitCm() { return sys === 'us' ? YD : 100; }
  function yardName() { return sys === 'us' ? 'yd' : 'm'; }

  /* ---------- read inputs ---------- */
  function wallRowEls() { return [].slice.call($('wpWallRows').querySelectorAll('.wp-wrow')); }
  function readRoom() {
    var r = { ok: false, missing: [], walls: [], doors: 0, wins: 0 };
    if (measure === 'room') {
      var L = pos('wpLen'), W = pos('wpWid'), H = pos('wpHgt');
      if (isNaN(L)) r.missing.push('length');
      if (isNaN(W)) r.missing.push('width');
      if (isNaN(H)) r.missing.push('ceiling height');
      if (r.missing.length) return r;
      L = lenCm(L); W = lenCm(W); H = lenCm(H);
      r.walls = [{ w: L, h: H }, { w: W, h: H }, { w: L, h: H }, { w: W, h: H }];
      r.doors = cnt('wpDoors'); r.wins = cnt('wpWins');
    } else {
      wallRowEls().forEach(function (row) {
        var g = function (f) { return row.querySelector('[data-f="' + f + '"]'); };
        var w = pos(g('w')), h = pos(g('h'));
        if (isNaN(w) || isNaN(h)) return;                    // half-typed row: skipped quietly
        var d = cnt(g('d')), n = cnt(g('n'));
        r.walls.push({ w: lenCm(w), h: lenCm(h), d: d, n: n });
        r.doors += d; r.wins += n;
      });
      if (!r.walls.length) { r.missing.push('width and height for at least one wall'); return r; }
    }
    r.ok = true;
    return r;
  }
  function readSettings() {
    var s = { missing: [] };
    if (preset === 'custom') {
      var rw = pos('wpRollW'), rl = pos('wpRollL');
      if (isNaN(rw)) s.missing.push('roll width');
      if (isNaN(rl) && soldBy === 'roll') s.missing.push('roll length');
      s.rollW = isNaN(rw) ? 0 : smallCm(rw); s.rollL = isNaN(rl) ? 0 : lenCm(rl);
    } else { s.rollW = PRESET[preset].w; s.rollL = PRESET[preset].l; }
    var rep = pos('wpRepeat'); s.repeat = isNaN(rep) ? 0 : smallCm(rep);
    s.match = match;
    var tv = num('wpTrim'); s.trim = (!isNaN(tv) && tv >= 0) ? smallCm(tv) : (sys === 'us' ? 4 * IN : 10);
    var ov = num('wpOverlap'); s.overlap = (!isNaN(ov) && ov > 0) ? smallCm(ov) : 0;
    s.spare = cnt('wpSpare');
    var wv = num('wpWaste'); s.waste = (!isNaN(wv) && wv > 0) ? wv : 0;
    s.yard = soldBy === 'yard';
    return s;
  }

  /* ---------- the strip maths ---------- */
  function plan(r, s) {
    var stripW = s.rollW - s.overlap;
    if (stripW <= 0) return null;
    var R = (s.match !== 'random' && s.repeat > 0) ? s.repeat : 0;
    var cuts = [], per = [], seq = 0, maxH = 0, i, k;
    r.walls.forEach(function (w) {
      var n = Math.ceil(w.w / stripW - 1e-9), base = w.h + s.trim;
      var L1 = R ? Math.ceil(base / R - 1e-9) * R : base;
      for (k = 0; k < n; k++) { cuts.push((s.match === 'half' && R && seq % 2 === 1) ? L1 + R : L1); seq++; }
      per.push({ n: n, cut: L1 });
      maxH = Math.max(maxH, L1);
    });
    var baseN = cuts.length, all = cuts.slice();
    var extra = 0;
    if (s.waste > 0) extra += Math.ceil(baseN * s.waste / 100 - 1e-9);
    extra += s.spare;
    var avg = cuts.reduce(function (a, b) { return a + b; }, 0) / baseN;
    for (i = 0; i < extra; i++) all.push(avg);
    return { cuts: cuts, all: all, per: per, baseN: baseN, extra: extra, stripW: stripW, R: R, maxCut: Math.max.apply(null, all), half: s.match === 'half' && R > 0 };
  }
  function pack(cuts, rollL) {
    var rolls = 0, rem = 0, idx = [], used = 0;
    cuts.forEach(function (c) {
      if (c > rem + 1e-6) { rolls++; rem = rollL; }
      rem -= c; used += c; idx.push(rolls - 1);
    });
    return { rolls: rolls, idx: idx, left: rolls * rollL - used };
  }

  /* ---------- diagram ---------- */
  var openA = null;
  function renderDiagram(r, p, pk, s) {
    var box = $('wpDiagram');
    if (!r || !r.ok || !p) { box.innerHTML = '<div class="sq-diagram-empty">Enter your room size and every wall will be drawn here with its strips.</div>'; return; }
    var walls = r.walls, n = walls.length, VW = 280, PAD = 8, GAP = 6, TOP = 8, i, k;
    var maxW = 0, maxH = 0;
    walls.forEach(function (w) { maxW = Math.max(maxW, w.w); maxH = Math.max(maxH, w.h); });
    var cols = n === 1 ? 1 : 2, rowsN = Math.ceil(n / cols), cw = (VW - 2 * PAD - GAP * (cols - 1)) / cols;
    var ws = Math.min(cw / maxW, 84 / maxH), rowH = maxH * ws + 42;
    var svg = '', caps = '', ci = 0;
    var dArr = [], nArr = [];
    for (i = 0; i < n; i++) { dArr.push(measure === 'room' ? 0 : walls[i].d); nArr.push(measure === 'room' ? 0 : walls[i].n); }
    if (measure === 'room') { for (k = 0; k < r.doors; k++) dArr[k % n]++; for (k = 0; k < r.wins; k++) nArr[(k + 1) % n]++; }
    var dW = openA.doorW, dH = openA.doorH, wW = openA.winW, wH = openA.winH;
    for (i = 0; i < n; i++) {
      var w = walls[i], wpx = w.w * ws, hpx = w.h * ws, sp = p.per[i].n;
      var x = PAD + (i % cols) * (cw + GAP) + (cw - wpx) / 2, base = TOP + Math.floor(i / cols) * rowH + maxH * ws, top = base - hpx;
      for (k = 0; k < sp; k++) {
        var sx = x + k * p.stripW * ws, sw = (k === sp - 1) ? (w.w - k * p.stripW) * ws : p.stripW * ws;
        var col = pk ? PALETTE[pk.idx[ci] % PALETTE.length] : PALETTE[0];
        ci++;
        svg += '<rect x="' + sx + '" y="' + top + '" width="' + Math.max(sw, 0.5) + '" height="' + hpx + '" fill="' + col + '" fill-opacity=".5" stroke="var(--paper)" stroke-width="0.8"/>';
      }
      svg += '<rect x="' + x + '" y="' + top + '" width="' + wpx + '" height="' + hpx + '" fill="none" stroke="var(--ink)" stroke-width="1.4"/>';
      var slots = Math.min(6, dArr[i] + nArr[i]), si = 0, slotW = wpx / (slots + 1);
      for (k = 0; k < Math.min(dArr[i], 6); k++) {
        si++; var dw = Math.min(dW * ws, slotW * 0.8), dh = Math.min(dH * ws, hpx * 0.92);
        svg += '<rect x="' + (x + slotW * si - dw / 2) + '" y="' + (base - dh) + '" width="' + dw + '" height="' + dh + '" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.3" stroke-dasharray="4 3"/>';
      }
      for (k = 0; k < nArr[i] && si < 6; k++) {
        si++; var ww = Math.min(wW * ws, slotW * 0.8), wh = Math.min(wH * ws, hpx * 0.6);
        svg += '<rect x="' + (x + slotW * si - ww / 2) + '" y="' + (base - hpx * 0.55 - wh / 2) + '" width="' + ww + '" height="' + wh + '" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.3" stroke-dasharray="4 3"/>';
      }
      caps += '<text x="' + (x + wpx / 2) + '" y="' + (base + 15) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-soft)">' + String.fromCharCode(65 + (i % 26)) + '</text>';
      if (wpx >= 44) caps += '<text x="' + (x + wpx / 2) + '" y="' + (base + 29) + '" text-anchor="middle" font-size="12" font-weight="500" fill="var(--ink)">' + sp + (sp === 1 ? ' strip' : ' strips') + '</text>';
    }
    var H = TOP + rowsN * rowH - 6;
    var key = '';
    if (pk && !s.yard) {
      var nk = Math.min(pk.rolls, PALETTE.length);
      for (i = 0; i < nk; i++) key += '<span class="wp-key"><i style="background:' + PALETTE[i] + ';opacity:.6"></i>Roll ' + (i + 1) + '</span>';
      if (pk.rolls > PALETTE.length) key += '<span class="wp-note">Colours repeat after ' + PALETTE.length + ' rolls.</span>';
    }
    var leg = '';
    if (measure === 'room' && (r.doors + r.wins) > 0) leg = '<span class="wp-note">Openings are placed for illustration.</span>';
    box.innerHTML = '<svg viewBox="0 0 ' + VW + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' + svg + caps + '</svg>'
      + (key ? '<div class="wp-keys">' + key + '</div>' : '')
      + '<div class="sq-diagram-legend"><span><b>Each coloured strip</b> is one drop of paper' + (key ? ', coloured by the roll it is cut from' : '') + '</span>' + leg + '</div>';
  }

  /* ---------- live room ---------- */
  var live = null;
  function setAddEnabled(ok) { var b = $('wpAddBtn'); b.disabled = !ok; b.style.opacity = ok ? '1' : '.5'; b.style.cursor = ok ? 'pointer' : 'not-allowed'; }
  function row(k, v, strong) { return '<tr' + (strong ? ' class="cur"' : '') + '><td>' + k + '</td><td>' + v + '</td></tr>'; }
  function compute() {
    var r = readRoom(), s = readSettings();
    var o = { r: r, s: s, p: null, pk: null, err: null };
    if (!r.ok) { o.err = 'Enter ' + joinList(r.missing); return o; }
    if (s.missing.length) { o.err = 'Enter ' + joinList(s.missing); return o; }
    o.p = plan(r, s);
    if (!o.p) { o.err = 'The side overlap is bigger than the roll width'; return o; }
    if (!s.yard) {
      if (o.p.maxCut > s.rollL + 1e-6) { o.err = 'A strip (' + fmtLen(o.p.maxCut) + ') is longer than the roll (' + fmtLen(s.rollL) + ') — check the roll length'; o.p = null; return o; }
      o.pk = pack(o.p.all, s.rollL);
    }
    return o;
  }
  function openings() {
    var us = sys === 'us';
    var dw = pos('wpDoorW'), dh = pos('wpDoorH'), ww = pos('wpWinW'), wh = pos('wpWinH');
    return {
      doorW: lenCm(isNaN(dw) ? (us ? 3 : 0.9) : dw), doorH: lenCm(isNaN(dh) ? (us ? 6.7 : 2) : dh),
      winW: lenCm(isNaN(ww) ? (us ? 3 : 0.9) : ww), winH: lenCm(isNaN(wh) ? (us ? 5 : 1.5) : wh)
    };
  }
  function grossArea(r) { var a = 0; r.walls.forEach(function (w) { a += w.w * w.h; }); return a; }
  function netArea(r) { var a = grossArea(r) - r.doors * openA.doorW * openA.doorH - r.wins * openA.winW * openA.winH; return a; }
  function result(o) {
    var s = o.s, p = o.p, out = { rows: '', qty: 0, unit: '', cost: null, plain: '', sub: '' };
    var price = priceVal();
    var area = netArea(o.r);
    if (s.yard) {
      var tot = p.all.reduce(function (a, b) { return a + b; }, 0);
      var buy = Math.ceil(tot / yardUnitCm() * 2 - 1e-9) / 2;
      out.qty = buy; out.unit = yardName();
      out.rows = row('Strips to hang', p.baseN) + row('Cut length per strip', fmtLen(p.per[0].cut)) + (p.extra ? row('Spare / waste strips', '+' + p.extra) : '') + row('Total length', fmtN(tot / yardUnitCm(), 1) + ' ' + yardName()) + row('To buy', fmtN(buy, 1) + ' ' + yardName(), true);
      if (price != null) out.cost = buy * price;
      out.plain = 'Order ' + fmtN(buy, 1) + ' ' + (sys === 'us' ? 'yards' : 'metres') + ' of wallpaper for ' + p.baseN + ' strips' + (p.extra ? ' plus ' + p.extra + ' spare' : '') + '.';
      out.sub = p.baseN + ' strips · ' + fmtLen(p.per[0].cut) + ' each';
      return out;
    }
    var rolls = o.pk.rolls, naive = Math.max(1, Math.ceil(area / (s.rollW * s.rollL) - 1e-9));
    var perRoll = Math.floor(s.rollL / p.per[0].cut + 1e-9);
    out.qty = rolls; out.unit = rolls === 1 ? 'roll' : 'rolls';
    out.rows = row('Strips to hang', p.baseN)
      + row('Cut length per strip', fmtLen(p.per[0].cut) + (p.half ? ' <span class="wp-sub">(+ ' + fmtSmall(p.R) + ' on alternate strips)</span>' : ''))
      + row('Strips per roll', p.half ? '≈ ' + fmtN(p.all.length / rolls, 1) : perRoll)
      + (p.extra ? row('Spare / waste strips', '+' + p.extra) : '')
      + row('Rolls to buy', rolls, true)
      + row('Left over', fmtLen(o.pk.left))
      + row('By area only', naive + (naive === 1 ? ' roll' : ' rolls'));
    if (price != null) out.cost = rolls * price;
    out.sub = p.baseN + ' strips · ' + fmtLen(p.per[0].cut) + ' each' + (p.extra ? ' · incl. ' + p.extra + ' spare' : '');
    if (rolls > naive) out.plain = 'Buy ' + rolls + ' rolls. By area it looks like ' + naive + ' — but wallpaper is hung in whole strips, so you need ' + rolls + '.';
    else if (rolls === naive) out.plain = 'Buy ' + rolls + (rolls === 1 ? ' roll' : ' rolls') + ' — the same as a plain area estimate, so little is lost to strips.';
    else out.plain = 'Buy ' + rolls + (rolls === 1 ? ' roll' : ' rolls') + '.';
    return out;
  }
  function renderRoom() {
    openA = openings();
    var o = compute();
    live = (o.p && !o.err) ? o : null;
    setAddEnabled(!!live);
    $('wpHint').style.display = live ? 'none' : 'block';
    $('wpAddNote').style.display = live ? 'block' : 'none';
    if (o.err) $('wpHint').textContent = o.err;
    renderDiagram(o.r, live ? o.p : null, live ? o.pk : null, o.s);
    var body = $('wpResBody');
    if (!live) {
      $('wpResQty').textContent = '—'; $('wpResUnit').textContent = soldBy === 'yard' ? yardName() : 'rolls';
      $('wpResSub').textContent = 'Enter the room size to see how many rolls you need.';
      body.style.display = 'none';
      return;
    }
    var out = result(o);
    $('wpResQty').textContent = fmtN(out.qty, 1);
    $('wpResUnit').textContent = out.unit;
    $('wpResSub').textContent = out.sub;
    $('wpPlain').textContent = out.plain;
    $('wpRows').innerHTML = out.rows;
    $('wpCostWrap').classList.toggle('hide', out.cost == null);
    if (out.cost != null) $('wpCost').textContent = money(out.cost);
    $('wpAssume').textContent = 'Roll ' + fmtSmall(o.s.rollW) + ' wide' + (o.s.yard ? '' : ' × ' + fmtLen(o.s.rollL) + ' long') + ', ' + (o.p.R ? 'pattern repeat ' + fmtSmall(o.p.R) + (o.p.half ? ' (half-drop)' : ' (straight match)') : 'no pattern repeat') + ', ' + fmtSmall(o.s.trim) + ' trim allowance.';
    body.style.display = '';
  }

  /* ---------- project tally ---------- */
  function groups() {
    var g = {}, order = [];
    tally.forEach(function (t) {
      var key = (t.yard ? 'y' : 'r') + '|' + Math.round(t.rollW * 10) + '|' + Math.round(t.rollL);
      if (!g[key]) { g[key] = { yard: t.yard, rollW: t.rollW, rollL: t.rollL, cuts: [] }; order.push(key); }
      g[key].cuts = g[key].cuts.concat(t.cuts);
    });
    return order.map(function (k) { return g[k]; });
  }
  function projTotals() {
    var gs = groups(), rolls = 0, yard = 0, left = 0, rows = '', strips = 0;
    gs.forEach(function (g) {
      var spec = fmtSmall(g.rollW) + ' wide' + (g.yard ? '' : ' × ' + fmtLen(g.rollL));
      strips += g.cuts.length;
      if (g.yard) {
        var tot = g.cuts.reduce(function (a, b) { return a + b; }, 0), buy = Math.ceil(tot / yardUnitCm() * 2 - 1e-9) / 2;
        yard += buy; rows += row(spec + ' (by the ' + (sys === 'us' ? 'yard' : 'metre') + ')', fmtN(buy, 1) + ' ' + yardName(), true);
      } else {
        var pk = pack(g.cuts, g.rollL); rolls += pk.rolls; left += pk.left;
        rows += row(spec, pk.rolls + (pk.rolls === 1 ? ' roll' : ' rolls'), true);
      }
    });
    return { rolls: rolls, yard: yard, left: left, rows: rows, strips: strips, multi: gs.length > 1, onlyYard: rolls === 0 && yard > 0 };
  }
  function renderTally() {
    var body = $('wpTallyBody'), t = null;
    if (!tally.length) {
      body.innerHTML = '<div class="tally-empty">Papering more than one room? Add each above and they’ll total here with one order.</div>';
      $('wpProj').style.display = 'none'; $('wpProjTotal').style.display = 'none'; $('wpClearAll').style.display = 'none';
    } else {
      $('wpClearAll').style.display = 'inline';
      var html = '';
      tally.forEach(function (r, i) {
        html += '<div class="trow"><span class="desc"><span class="d">' + r.label + '</span></span>'
          + '<span class="qt">' + r.strips + (r.strips === 1 ? ' strip' : ' strips') + '</span>'
          + '<span class="rc">' + fmtArea(r.area) + '</span>'
          + '<button class="x" data-i="' + i + '" aria-label="Remove">×</button></div>';
      });
      body.innerHTML = html;
      t = projTotals();
      var price = priceVal();
      var lab = (tally.length === 1 && tally[0].named) ? '<tr class="wp-lab"><td colspan="2">' + tally[0].label + '</td></tr>' : '';
      $('wpProjRows').innerHTML = lab + t.rows + (t.rolls > 0 ? row('Left over', fmtLen(t.left)) : '');
      $('wpProj').style.display = '';
      $('wpProjTotal').style.display = 'grid';
      $('wpTotQty').textContent = t.onlyYard ? fmtN(t.yard, 1) : t.rolls;
      $('wpTotUnit').textContent = t.onlyYard ? yardName() : (t.rolls === 1 ? 'roll' : 'rolls');
      $('wpProjCount').textContent = '(' + tally.length + (tally.length === 1 ? ' room)' : ' rooms)');
      var cost = price == null ? null : (t.rolls + t.yard) * price;
      $('wpTotCostRow').style.display = cost == null ? 'none' : 'block';
      $('wpTotCost').style.display = cost == null ? 'none' : 'block';
      if (cost != null) $('wpTotCost').textContent = money(cost);
    }
    updateMbar(t);
  }
  function updateMbar(t) {
    var cw = $('mCostWrap'), p = priceVal();
    if (tally.length && t) {
      $('mLab').textContent = 'Project total';
      $('mSeg').innerHTML = '<b>' + (t.onlyYard ? fmtN(t.yard, 1) : t.rolls) + '</b> ' + (t.onlyYard ? yardName() : (t.rolls === 1 ? 'roll' : 'rolls'));
      if (p != null) { cw.classList.remove('hide'); $('mCost').textContent = money((t.rolls + t.yard) * p); } else cw.classList.add('hide');
      return;
    }
    $('mLab').textContent = 'This room';
    if (!live) { $('mSeg').innerHTML = '<b>—</b> ' + (soldBy === 'yard' ? yardName() : 'rolls'); cw.classList.add('hide'); return; }
    var out = result(live);
    $('mSeg').innerHTML = '<b>' + fmtN(out.qty, 1) + '</b> ' + out.unit;
    if (out.cost != null) { cw.classList.remove('hide'); $('mCost').textContent = money(out.cost); } else cw.classList.add('hide');
  }
  function renderAll() { renderRoom(); renderTally(); }

  /* ---------- wall-by-wall rows ---------- */
  function addWallRow() {
    var row = document.createElement('div');
    row.className = 'wp-wrow';
    row.innerHTML = '<span class="wp-wl"></span>'
      + ['w', 'h', 'd', 'n'].map(function (f) { return '<input class="win" data-f="' + f + '" type="number" inputmode="decimal" min="0" placeholder="0" aria-label="' + ({ w: 'Wall width', h: 'Wall height', d: 'Doors', n: 'Windows' })[f] + '">'; }).join('')
      + '<button class="x" type="button" aria-label="Remove wall">×</button>';
    $('wpWallRows').appendChild(row);
    renumber();
  }
  function renumber() { wallRowEls().forEach(function (row, i) { row.querySelector('.wp-wl').textContent = String.fromCharCode(65 + (i % 26)); }); }
  function resetWallRows() { $('wpWallRows').innerHTML = ''; for (var i = 0; i < 4; i++) addWallRow(); }

  /* ---------- labels / visibility ---------- */
  function setSeg(id, v, attr) { [].forEach.call($(id).children, function (b) { b.classList.toggle('on', b.getAttribute(attr || 'data-v') === String(v)); }); }
  function updateUnitLabels() {
    var us = sys === 'us';
    [].forEach.call(document.querySelectorAll('#wpInCard [data-dim]'), function (el) { el.textContent = us ? 'ft' : 'm'; });
    [].forEach.call(document.querySelectorAll('#wpInCard [data-small]'), function (el) { el.textContent = us ? 'in' : 'cm'; });
    $('wpDoorW').placeholder = us ? '3' : '0.9'; $('wpDoorH').placeholder = us ? '6.7' : '2';
    $('wpWinW').placeholder = us ? '3' : '0.9'; $('wpWinH').placeholder = us ? '5' : '1.5';
    $('wpTrim').placeholder = us ? '4' : '10';
    var yd = soldBy === 'yard';
    $('wpPriceLab').textContent = yd ? 'Price per ' + (us ? 'yard' : 'metre') : 'Price per roll';
    $('wpPriceSuf').textContent = yd ? '$/' + yardName() : '$/roll';
    var p = preset === 'custom' ? null : PRESET[preset];
    $('wpRollNote').textContent = p ? fmtSmall(p.w) + ' wide × ' + fmtLen(p.l) + ' long' : 'Enter the width and length printed on your roll.';
    $('wpRollLenFld').style.display = yd ? 'none' : '';
  }
  function applyMeasure() {
    var rm = measure === 'room';
    $('wpRoomFields').style.display = rm ? '' : 'none';
    $('wpWallFields').style.display = rm ? 'none' : '';
  }
  function applyRoll() {
    $('wpRollCustom').style.display = preset === 'custom' ? '' : 'none';
    updateUnitLabels();
  }
  function clearRoomFields(keepHeight) {
    ['wpLen', 'wpWid', 'wpDoors', 'wpWins', 'wpName'].forEach(function (id) { $(id).value = ''; });
    if (!keepHeight) $('wpHgt').value = '';
    resetWallRows();
  }

  /* ---------- events ---------- */
  $('wpInCard').addEventListener('input', renderAll);

  $('wpUnitSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.sys === sys) return;
    sys = b.dataset.sys; setSeg('wpUnitSeg', sys, 'data-sys');
    [].forEach.call(document.querySelectorAll('#wpInCard input'), function (el) { if (el.id !== 'wpName' && el.id !== 'wpWaste' && el.id !== 'wpSpare') el.value = ''; });
    resetWallRows(); updateUnitLabels(); renderAll();
  });
  $('wpRoll').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.v === preset) return;
    preset = b.dataset.v; setSeg('wpRoll', preset); applyRoll(); renderAll();
  });
  $('wpMeasureSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.v === measure) return;
    measure = b.dataset.v; setSeg('wpMeasureSeg', measure); applyMeasure(); renderAll();
  });
  $('wpMatchSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    match = b.dataset.v; setSeg('wpMatchSeg', match); renderAll();
  });
  $('wpSoldSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    soldBy = b.dataset.v; setSeg('wpSoldSeg', soldBy); updateUnitLabels(); renderAll();
  });

  $('wpAddWall').addEventListener('click', function () { addWallRow(); var rows = wallRowEls(); rows[rows.length - 1].querySelector('input').focus(); });
  $('wpWallRows').addEventListener('click', function (e) {
    var x = e.target.closest('.x'); if (!x) return;
    var rows = wallRowEls(); if (rows.length <= 1) { [].forEach.call(rows[0].querySelectorAll('input'), function (i) { i.value = ''; }); }
    else x.closest('.wp-wrow').remove();
    renumber(); renderAll();
  });

  $('wpAddBtn').addEventListener('click', function () {
    if (!live) return;
    var nm = $('wpName').value.trim();
    tally.push({ label: nm || 'Room', named: !!nm, cuts: live.p.all.slice(), strips: live.p.baseN, area: grossArea(live.r), rollW: live.s.rollW, rollL: live.s.yard ? 0 : live.s.rollL, yard: live.s.yard });
    clearRoomFields(true);
    renderAll();
    var first = measure === 'room' ? $('wpLen') : $('wpWallRows').querySelector('input'); if (first) first.focus();
  });
  $('wpClearFields').addEventListener('click', function () { clearRoomFields(false); renderAll(); });
  $('wpTallyBody').addEventListener('click', function (e) { var x = e.target.closest('.x'); if (!x) return; tally.splice(+x.dataset.i, 1); renderAll(); });
  $('wpClearAll').addEventListener('click', function () { tally = []; renderAll(); });

  function resetAdvanced() {
    measure = 'room'; match = 'straight'; soldBy = 'roll';
    setSeg('wpMeasureSeg', 'room'); setSeg('wpMatchSeg', 'straight'); setSeg('wpSoldSeg', 'roll');
    ['wpDoorW', 'wpDoorH', 'wpWinW', 'wpWinH', 'wpTrim', 'wpOverlap', 'wpSpare', 'wpWaste'].forEach(function (id) { $(id).value = ''; });
    resetWallRows(); updateUnitLabels(); applyMeasure(); renderAll();
  }
  var advBtn = $('wpAdvBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('wpAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('wpAdvIn').style.display = advanced ? '' : 'none';
    if (!advanced) resetAdvanced();
  });

  resetWallRows();
  applyRoll();
  applyMeasure();
  renderAll();
};

/* ===== CalcThis Scientific Notation engine =====
   CalcThis.initSciCalc() — one smart box that converts any number format (3672.2, 2.3e11,
   3.5 × 10^-12) AND evaluates whole expressions ((3×10^4)(2×10^6), 4e5 + 7e4, √(9e10)) into
   every notation at once. Differentiator vs. every competitor checked (calculator.net,
   CalculatorSoup, Omnicalculator, Pearson, Kanaries, DQYDJ — converter and calculator are
   separate tools, or only Pearson draws anything behind toggles): a live decimal-point shift
   strip, a power-of-ten / SI-prefix ruler, all formats with copy buttons, exact maths, an
   auto-normalise note and plain-English steps shown by default. All numbers are exact decimals
   held as BigInt coefficient × 10^exponent (+ − × exact; ÷ and √ to 40 digits, flagged).
   Independent engine, no shared state. */
CalcThis.initSciCalc = function () {
  var $ = function (id) { return document.getElementById(id); };
  var P = 40;                                           // digits kept for ÷ and √
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  var SI = { '-30': ['quecto', 'q'], '-27': ['ronto', 'r'], '-24': ['yocto', 'y'], '-21': ['zepto', 'z'], '-18': ['atto', 'a'], '-15': ['femto', 'f'], '-12': ['pico', 'p'], '-9': ['nano', 'n'], '-6': ['micro', 'µ'], '-3': ['milli', 'm'], '0': ['', ''], '3': ['kilo', 'k'], '6': ['mega', 'M'], '9': ['giga', 'G'], '12': ['tera', 'T'], '15': ['peta', 'P'], '18': ['exa', 'E'], '21': ['zetta', 'Z'], '24': ['yotta', 'Y'], '27': ['ronna', 'R'], '30': ['quetta', 'Q'] };
  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  var SCALE = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion'];

  var style = 'sup', rmode = 'sig';
  var advanced = false;

  /* ---------- exact decimal: {neg, c: BigInt >= 0, e: int} = ±c × 10^e ---------- */
  function pow10(n) { return 10n ** BigInt(n); }
  function mk(neg, c, e) {
    if (c === 0n) return { neg: false, c: 0n, e: 0 };
    while (c % 10n === 0n) { c /= 10n; e++; }
    return { neg: neg, c: c, e: e };
  }
  function isZero(v) { return v.c === 0n; }
  function fail(msg) { var x = new Error(msg); x.user = true; throw x; }
  function add(a, b) {
    if (isZero(a)) return b; if (isZero(b)) return a;
    var e = Math.min(a.e, b.e);
    if (Math.max(a.e, b.e) - e > 20000) fail('Those two numbers are too far apart in size to add exactly');
    var x = a.c * pow10(a.e - e) * (a.neg ? -1n : 1n), y = b.c * pow10(b.e - e) * (b.neg ? -1n : 1n), s = x + y;
    return mk(s < 0n, s < 0n ? -s : s, e);
  }
  function neg(a) { return isZero(a) ? a : { neg: !a.neg, c: a.c, e: a.e }; }
  function mul(a, b) { return mk(a.neg !== b.neg, a.c * b.c, a.e + b.e); }
  function roundSig(v, n) {
    var D = v.c.toString().length;
    if (D <= n) return v;
    var drop = D - n, p = pow10(drop), q = v.c / p, r = v.c % p;
    if (r * 2n >= p) q += 1n;
    return mk(v.neg, q, v.e + drop);
  }
  function roundDec(v, n) {
    if (-v.e <= n) return v;
    var drop = -v.e - n, p = pow10(drop), q = v.c / p, r = v.c % p;
    if (r * 2n >= p) q += 1n;
    return mk(v.neg, q, -n);
  }
  function div(a, b, st) {
    if (isZero(b)) fail('Can’t divide by zero');
    if (isZero(a)) return a;
    var sh = P + b.c.toString().length, num = a.c * pow10(sh), q = num / b.c, r = num % b.c;
    var out = mk(a.neg !== b.neg, q, a.e - b.e - sh);
    if (r !== 0n) { st.approx = true; out = roundSig(out, P); }
    return out;
  }
  function isqrt(n) { if (n < 2n) return n; var x = n, y = (x + 1n) / 2n; while (y < x) { x = y; y = (x + n / x) / 2n; } return x; }
  function sqrt(a, st) {
    if (a.neg) fail('No real square root of a negative number');
    if (isZero(a)) return a;
    var c = a.c, e = a.e;
    if (e % 2 !== 0) { c *= 10n; e -= 1; }
    var extra = P + 2, scaled = c * pow10(2 * extra), s = isqrt(scaled);
    if (s * s !== scaled) st.approx = true;
    return roundSig(mk(false, s, e / 2 - extra), P);
  }
  function toInt(v) { if (v.e >= 0) return Number(v.c * pow10(v.e)) * (v.neg ? -1 : 1); return null; }
  function log10v(v) { var D = v.c.toString(), m = parseFloat(D.slice(0, 15).replace(/^(\d)/, '$1.')); return (v.e + D.length - 1) + Math.log10(m); }
  function fromFloat(x) {
    if (!isFinite(x)) fail('That result is too large to show');
    if (x === 0) return mk(false, 0n, 0);
    var s = Math.abs(x).toExponential(14), m = s.split('e'), d = m[0].replace('.', ''), e = parseInt(m[1], 10) - 14;
    return mk(x < 0, BigInt(d), e);
  }
  function pw(a, b, st) {
    var k = toInt(b);
    if (k !== null && Math.abs(k) <= 5000) {
      if (isZero(a)) { if (k === 0) fail('0 to the power 0 is undefined'); if (k < 0) fail('Can’t divide by zero'); return a; }
      if (Math.abs(k) * a.c.toString().length > 30000) fail('That power is too big to work out exactly');
      var r = mk(a.neg && (Math.abs(k) % 2 === 1), a.c ** BigInt(Math.abs(k)), a.e * Math.abs(k));
      return k < 0 ? div(mk(false, 1n, 0), r, st) : r;
    }
    if (a.neg) fail('Can’t raise a negative number to a fractional power');
    if (isZero(a)) return a;
    var L = log10v(a) * (b.neg ? -1 : 1) * Number(b.c) * Math.pow(10, b.e);
    if (!isFinite(L) || Math.abs(L) > 100000) fail('That power is too big to show');
    st.approx = true;
    var ip = Math.floor(L), fp = L - ip;
    return roundSig(mk(false, BigInt(Math.round(Math.pow(10, fp) * 1e14)), ip - 14), 14);
  }

  /* ---------- formatting ---------- */
  function sup(n) { return ('' + n).split('').map(function (ch) { return SUP[ch] || ch; }).join(''); }
  function commas(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function digits(v) { return v.c.toString(); }
  function expOf(v) { return v.e + digits(v).length - 1; }
  function mdig(v) { var D = v.c.toString(); if (v.sf && v.sf > D.length) D += new Array(v.sf - D.length + 1).join('0'); return D; }
  function mantissa(v) { var D = mdig(v); return D.length > 1 ? D[0] + '.' + D.slice(1) : D; }
  function styled(m, b, st) {
    if (st === 'plain') return m + ' x 10^' + b;
    if (st === 'latex') return m + ' \\times 10^{' + b + '}';
    if (st === 'dot') return m + ' · 10' + sup(b);
    return m + ' × 10' + sup(b);
  }
  function sciStr(v, st) {
    if (isZero(v)) return '0';
    return (v.neg ? '-' : '') + styled(mantissa(v), expOf(v), st || style);
  }
  function eStr(v) { if (isZero(v)) return '0'; return (v.neg ? '-' : '') + mantissa(v) + 'e' + expOf(v); }
  function engParts(v, force) {
    if (isZero(v)) return { m: '0', b: 0 };
    var b = expOf(v), bE = (force !== null && !isNaN(force)) ? force : Math.floor(b / 3) * 3;
    var D = mdig(v), pos = b - bE + 1, m;
    if (pos <= 0) m = '0.' + new Array(-pos + 1).join('0') + D;
    else if (pos >= D.length) m = D + new Array(pos - D.length + 1).join('0');
    else m = D.slice(0, pos) + '.' + D.slice(pos);
    return { m: (v.neg ? '-' : '') + m, b: bE };
  }
  function plainStr(v) {
    if (isZero(v)) return '0';
    var D = digits(v), s;
    if (v.e >= 0) { if (D.length + v.e > 120) return null; s = D + new Array(v.e + 1).join('0'); return (v.neg ? '-' : '') + commas(s); }
    var pos = D.length + v.e;
    if (pos > 0) s = commas(D.slice(0, pos)) + '.' + D.slice(pos);
    else { if (-pos > 120) return null; s = '0.' + new Array(-pos + 1).join('0') + D; }
    return (v.neg ? '-' : '') + s;
  }
  function below1000(n) {
    var out = [];
    if (n >= 100) { out.push(ONES[Math.floor(n / 100)] + ' hundred'); n %= 100; }
    if (n > 0) { if (n < 20) out.push(ONES[n]); else out.push(TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')); }
    return out.join(' ');
  }
  function words(v) {
    if (isZero(v)) return 'zero';
    var D = digits(v), ip, fp = '';
    if (v.e >= 0) { ip = D + new Array(v.e + 1).join('0'); }
    else { var pos = D.length + v.e; if (pos > 0) { ip = D.slice(0, pos); fp = D.slice(pos); } else { ip = '0'; fp = new Array(-pos + 1).join('0') + D; } }
    if (ip.length > 66 || fp.length > 24) return null;
    var parts = [], g = 0, s = ip;
    if (/^0+$/.test(ip)) parts.push('zero');
    else {
      var groups = [];
      while (s.length) { groups.unshift(parseInt(s.slice(-3), 10)); s = s.slice(0, -3); }
      groups.forEach(function (n, i) { if (n > 0) parts.push(below1000(n) + (SCALE[groups.length - 1 - i] ? ' ' + SCALE[groups.length - 1 - i] : '')); });
    }
    var out = parts.join(' ');
    if (fp) out += ' point ' + fp.split('').map(function (d) { return ONES[+d]; }).join(' ');
    return (v.neg ? 'negative ' : '') + out;
  }
  function siName(b) { var p = SI[String(b)]; return p ? (p[0] ? p[0] + ' (' + p[1] + ')' : '') : ''; }

  /* ---------- parsing ---------- */
  function normalizeText(s) {
    return s.replace(/[−–—]/g, '-').replace(/[×·⋅∙✕]/g, '*').replace(/÷/g, '/').replace(/\*\*/g, '^').replace(/\r?\n/g, ' ')
      .replace(/\d{1,3}(?:,\d{3})+(?!\d)/g, function (m) { return m.replace(/,/g, ''); }).replace(/(\d),(?=\d)/g, '$1.').replace(/,/g, '').replace(/(\d) (?=\d{3}(\D|$))/g, '$1');
  }
  var NUM_RE = /^(\d+\.?\d*|\.\d+)/;
  var EXP_RE = /^(?:[eE]([+-]?\d+)|\s*[xX*]\s*10\s*\^\s*(?:\(\s*([+-]?\d+)\s*\)|([+-]?\d+))|\s*[xX*]?\s*10([⁺⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+))/;
  var SUPREV = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '' };
  function tokenize(s) {
    var toks = [], i = 0, m;
    while (i < s.length) {
      var ch = s[i];
      if (ch === ' ') { i++; continue; }
      if ((m = NUM_RE.exec(s.slice(i)))) {
        var txt = m[0], rest = s.slice(i + txt.length), ex = EXP_RE.exec(rest), exp = 0, src = txt, sci = false;
        if (ex) {
          sci = true;
          if (ex[1] !== undefined) exp = parseInt(ex[1], 10);
          else if (ex[2] !== undefined) exp = parseInt(ex[2], 10);
          else if (ex[3] !== undefined) exp = parseInt(ex[3], 10);
          else exp = parseInt(ex[4].split('').map(function (c) { return SUPREV[c]; }).join(''), 10);
          src = txt + ex[0];
        }
        var dot = txt.indexOf('.'), d = txt.replace('.', ''), e = (dot >= 0 ? -(txt.length - dot - 1) : 0) + exp;
        if (Math.abs(exp) > 100000) fail('Exponent too large (limit ±100,000)');
        toks.push({ t: 'num', v: mk(false, BigInt(d || '0'), e), src: src, mant: txt, sci: sci, e: /^[0-9.]+[eE]/.test(src) });
        i += src.length; continue;
      }
      if (SUPREV[ch] !== undefined) {
        var j = i, ds = '';
        while (j < s.length && SUPREV[s[j]] !== undefined) { ds += SUPREV[s[j]]; j++; }
        if (ds === '' || ds === '-') fail('bad');
        toks.push({ t: '^' }); toks.push({ t: 'num', v: mk(ds[0] === '-', BigInt(ds.replace('-', '')), 0), src: ds, mant: ds, sci: false, e: false });
        i = j; continue;
      }
      if (ch === '√') { toks.push({ t: 'sqrt' }); i++; continue; }
      if (/^sqrt/i.test(s.slice(i))) { toks.push({ t: 'sqrt' }); i += 4; continue; }
      if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^' || ch === '(' || ch === ')') { toks.push({ t: ch }); i++; continue; }
      if (ch === 'x' || ch === 'X') { toks.push({ t: '*' }); i++; continue; }
      fail('bad');
    }
    return toks;
  }
  function parse(toks) {
    var p = 0;
    function peek() { return toks[p]; }
    function expr() {
      var a = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) { var op = toks[p++].t; a = { t: op, a: a, b: term() }; }
      return a;
    }
    function term() {
      var a = unary();
      for (;;) {
        var k = peek();
        if (k && (k.t === '*' || k.t === '/')) { p++; a = { t: k.t, a: a, b: unary() }; }
        else if (k && (k.t === '(' || k.t === 'sqrt')) { a = { t: '*', a: a, b: unary() }; }
        else break;
      }
      return a;
    }
    function unary() {
      var k = peek();
      if (k && k.t === '-') { p++; return { t: 'neg', a: unary() }; }
      if (k && k.t === '+') { p++; return unary(); }
      return power();
    }
    function power() {
      var a = atom();
      if (peek() && peek().t === '^') { p++; return { t: '^', a: a, b: unary() }; }
      return a;
    }
    function atom() {
      var k = toks[p++];
      if (!k) fail('bad');
      if (k.t === 'num') return k;
      if (k.t === '(') { var e = expr(); if (!peek() || peek().t !== ')') fail('bad'); p++; return { t: 'group', a: e }; }
      if (k.t === 'sqrt') { var n = peek(); if (n && n.t === '(') { p++; var e2 = expr(); if (!peek() || peek().t !== ')') fail('bad'); p++; return { t: 'sqrt', a: e2 }; } return { t: 'sqrt', a: atom() }; }
      fail('bad');
    }
    var tree = expr();
    if (p < toks.length) fail('bad');
    return tree;
  }
  function stepNum(v, st, operand) {
    if (st.approx) v = roundSig(v, 15);
    var b = isZero(v) ? 0 : expOf(v);
    if (operand && b >= -3 && b <= 3) { var p = plainStr(v); if (p) return p; }
    return operand ? '(' + sciStr(v, st.style) + ')' : sciStr(v, st.style);
  }
  function evalTree(n, st) {
    var a, b, r, line;
    switch (n.t) {
      case 'num': return n.v;
      case 'group': return evalTree(n.a, st);
      case 'neg': return neg(evalTree(n.a, st));
      case 'sqrt': a = evalTree(n.a, st); r = sqrt(a, st); var sa = stepNum(a, st, true); if (sa[0] !== '(') sa = '(' + sa + ')'; st.steps.push('√' + sa + ' = ' + stepNum(r, st, false) + (st.approx ? ' (rounded)' : '')); return r;
      default:
        a = evalTree(n.a, st); b = evalTree(n.b, st);
        if (n.t === '+') r = add(a, b);
        else if (n.t === '-') r = add(a, neg(b));
        else if (n.t === '*') r = mul(a, b);
        else if (n.t === '/') r = div(a, b, st);
        else r = pw(a, b, st);
        var sym = { '+': '+', '-': '−', '*': '×', '/': '÷', '^': '^' }[n.t];
        if ((n.t === '+' || n.t === '-') && !isZero(a) && !isZero(b) && expOf(a) !== expOf(b)) {
          var mx = Math.max(expOf(a), expOf(b)), pa = engParts(a, mx), pb = engParts(b, mx);
          st.steps.push('Give both numbers the same power of 10: ' + styled(pa.m, mx, st.style) + ' and ' + styled(pb.m, mx, st.style) + '.');
        }
        var bs2 = stepNum(b, st, true); if (b.neg && bs2[0] !== '(') bs2 = '(' + bs2 + ')';
        st.steps.push(stepNum(a, st, true) + ' ' + sym + ' ' + bs2 + ' = ' + stepNum(r, st, false) + (st.approx ? ' (rounded)' : ''));
        return r;
    }
  }
  function evaluate(raw) {
    var text = normalizeText(raw), tries = [text], cur = text, k, tail = text.replace(/\s*[xX*]\s*10\s*(\^\s*\(?\s*[+-]?)?$/, '');
    if (tail !== text && tail) { tries.push(tail); cur = tail; }
    for (k = 0; k < 6; k++) {
      var t2 = cur.replace(/[\s+\-*\/^(xX√eE.]+$/, '');
      if (t2 === cur || !t2) break;
      tries.push(t2); cur = t2;
    }
    for (k = 0; k < tries.length; k++) {
      var tx = tries[k], open = (tx.match(/\(/g) || []).length - (tx.match(/\)/g) || []).length;
      if (open > 0) tx += new Array(open + 1).join(')');
      var st = { approx: false, steps: [], style: style };
      try {
        var toks = tokenize(tx), tree = parse(toks), v = evalTree(tree, st);
        var lit = tree.t === 'num' ? tree : (tree.t === 'neg' && tree.a.t === 'num' ? tree.a : null);
        return { v: v, st: st, lit: lit, neg: tree.t === 'neg', partial: k > 0, shown: tx };
      } catch (err) {
        if (err.user && err.message !== 'bad') return { error: err.message };
      }
    }
    return { error: 'Can’t read that yet — try 3.2e5, 3.2 × 10^5 or (3×10^4)(2×10^6)' };
  }
  function dispSrc(s) { return s.replace(/\s+/g, ' ').replace(/\*/g, '×'); }
  function sigFigs(lit) {
    var m = lit.mant.replace('.', '').replace(/^0+/, '');
    if (!m) return null;
    if (lit.mant.indexOf('.') < 0 && !lit.sci) m = m.replace(/0+$/, '');
    return m.length || 1;
  }

  /* ---------- picture 1: the decimal-point shift ---------- */
  function renderStrip(v) {
    var box = $('sciStrip');
    if (isZero(v)) { box.innerHTML = '<div class="sq-diagram-empty">Zero is just 0 — there is no decimal point to move.</div>'; return; }
    var D = digits(v), full, p0;
    var extraTrail = 0, extraLead = 0;
    if (v.e >= 0) { full = D.split('').concat(new Array(v.e > 400 ? 400 : v.e).fill('0')); p0 = full.length; extraTrail = v.e > 400 ? v.e - 400 : 0; }
    else {
      var pos = D.length + v.e;
      if (pos > 0) { full = D.split(''); p0 = pos; }
      else { full = ['0'].concat(new Array(Math.min(-pos, 400)).fill('0'), D.split('')); p0 = 1; extraLead = -pos > 400 ? -pos - 400 : 0; }
    }
    var firstNZ = 0; while (full[firstNZ] === '0') firstNZ++;
    var p1 = firstNZ + 1, b = expOf(v), moved = b;
    // build tiles, collapsing long zero runs and long digit strings
    var tiles = [], i = 0;
    while (i < full.length) {
      if (full[i] === '0' && i !== 0) {
        var j = i; while (j < full.length && full[j] === '0') j++;
        if (j - i >= 6) { tiles.push({ k: 'run', n: (j - i) + (j === full.length ? extraTrail : 0) + (i === 1 ? extraLead : 0), s: i, en: j - 1 }); i = j; continue; }
      }
      tiles.push({ k: 'd', ch: full[i], s: i, en: i }); i++;
    }
    var nTiles = tiles.length;
    if (nTiles > 14) {
      var keepL = 6, keepR = 6, mid = tiles.slice(keepL, nTiles - keepR);
      // keep the tiles that hold either decimal point
      var hold = mid.filter(function (t) { return (t.s <= p0 && p0 <= t.en + 1) || (t.s <= p1 && p1 <= t.en + 1); });
      if (!hold.length) tiles = tiles.slice(0, keepL).concat([{ k: 'gap', s: mid[0].s, en: mid[mid.length - 1].en, n: mid[mid.length - 1].en - mid[0].s + 1 }], tiles.slice(nTiles - keepR));
    }
    var units = 0; tiles.forEach(function (t) { units += t.k === 'd' ? 1 : (t.k === 'run' ? 3 : 1.6); });
    var VW = 280, PAD = 10, tw = Math.min(22, (VW - 2 * PAD) / units), x = PAD + ((VW - 2 * PAD) - units * tw) / 2, svg = '';
    tiles.forEach(function (t) {
      var w = (t.k === 'd' ? 1 : (t.k === 'run' ? 3 : 1.6)) * tw; t.x = x; t.w = w;
      var lead = t.k === 'd' && t.s < firstNZ, fill = lead || t.k === 'run' ? 'rgba(55,80,63,.10)' : 'rgba(181,118,31,.20)';
      svg += '<rect x="' + (x + 1) + '" y="44" width="' + (w - 2) + '" height="30" rx="4" fill="' + fill + '" stroke="var(--line)" stroke-width="1"/>';
      var label = t.k === 'd' ? t.ch : (t.k === 'run' ? '⋯ ' + t.n + '×0' : '⋯');
      svg += '<text x="' + (x + w / 2) + '" y="64" text-anchor="middle" font-size="' + (t.k === 'd' ? 15 : 12) + '" font-weight="600" fill="var(--ink)">' + label + '</text>';
      x += w;
    });
    function bx(idx) { for (var q = 0; q < tiles.length; q++) { var t = tiles[q]; if (idx <= t.s) return t.x; if (idx <= t.en + 1) return idx === t.en + 1 ? t.x + t.w : t.x; } var l = tiles[tiles.length - 1]; return l.x + l.w; }
    var x0 = bx(p0), x1 = bx(p1);
    svg += '<circle cx="' + x0 + '" cy="80" r="4" fill="var(--ink)"/>';
    var label2;
    if (moved === 0) { svg += '<text x="' + (VW / 2) + '" y="18" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink-soft)">Already in place — exponent 0</text>'; svg += '<circle cx="' + x1 + '" cy="80" r="4.5" fill="var(--amber)"/>'; }
    else {
      svg += '<circle cx="' + x1 + '" cy="80" r="4.5" fill="var(--amber)"/>';
      var mid2 = (x0 + x1) / 2, up = 30;
      svg += '<path d="M' + x0 + ' 40 Q' + mid2 + ' ' + (40 - up) + ' ' + x1 + ' 40" fill="none" stroke="var(--amber)" stroke-width="1.8"/>';
      svg += '<path d="M' + x1 + ' 41 l-5 -7 M' + x1 + ' 41 l5 -7" stroke="var(--amber)" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
      label2 = 'moved ' + Math.abs(moved) + (Math.abs(moved) === 1 ? ' place ' : ' places ') + (moved > 0 ? 'left' : 'right');
      svg += '<text x="' + Math.max(60, Math.min(VW - 60, mid2)) + '" y="12" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink-soft)">' + label2 + '</text>';
    }
    box.innerHTML = '<svg viewBox="0 0 ' + VW + ' 92" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>'
      + '<div class="sq-diagram-legend"><span><b>●</b> where the decimal point is</span><span><b style="color:var(--amber)">●</b> where it has to go (one non-zero digit to its left)</span></div>';
  }

  /* ---------- picture 2: power-of-ten ruler with SI prefixes ---------- */
  function renderRuler(v) {
    var box = $('sciRuler');
    if (isZero(v)) { box.innerHTML = ''; return; }
    var VW = 280, X0 = 14, X1 = 266, LO = -12, HI = 12, per = (X1 - X0) / (HI - LO), svg = '', t;
    svg += '<line x1="' + X0 + '" y1="40" x2="' + X1 + '" y2="40" stroke="var(--line)" stroke-width="3" stroke-linecap="round"/>';
    for (t = LO; t <= HI; t += 3) {
      var tx = X0 + (t - LO) * per, sy = SI[String(t)][1] || '1';
      svg += '<line x1="' + tx + '" y1="34" x2="' + tx + '" y2="46" stroke="var(--ink)" stroke-width="1.4" opacity=".55"/>';
      svg += '<text x="' + tx + '" y="62" text-anchor="middle" font-size="12" font-weight="600" fill="var(--muted)">' + sy + '</text>';
    }
    var L = log10v(v), pin = L < LO ? LO : (L > HI ? HI : L), mx = X0 + (pin - LO) * per, off = L < LO || L > HI;
    svg += '<polygon points="' + mx + ',38 ' + (mx - 6) + ',24 ' + (mx + 6) + ',24" fill="var(--amber)"/>';
    var lab = '10' + sup(Math.round(expOf(v))) + (off ? (L > HI ? ' →' : ' ←') : '');
    svg += '<text x="' + Math.max(26, Math.min(VW - 26, mx)) + '" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="var(--amber-deep)">≈ ' + lab + '</text>';
    box.innerHTML = '<svg viewBox="0 0 ' + VW + ' 70" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>'
      + '<div class="sq-diagram-legend"><span>Ticks are SI prefixes: <b>p</b> pico · <b>n</b> nano · <b>µ</b> micro · <b>m</b> milli · <b>k</b> kilo · <b>M</b> mega · <b>G</b> giga · <b>T</b> tera</span></div>';
  }

  /* ---------- steps ---------- */
  function buildSteps(res, v) {
    var st = res.st, out = [], lit = res.lit;
    if (lit) {
      var b = expOf(v), plain = plainStr(v), sciS = sciStr(v), sg = res.neg ? '-' : '';
      if (isZero(v)) return ['Zero is written 0 in every notation — there is no decimal point to move.'];
      if (lit.sci) {
        var frac = lit.mant.indexOf('.') >= 0 ? lit.mant.length - lit.mant.indexOf('.') - 1 : 0;
        var cv = mk(false, BigInt(lit.mant.replace('.', '')), -frac), cb = expOf(cv);
        out.push('Start with ' + sg + dispSrc(lit.src) + '.');
        if (cb === 0) out.push('The coefficient ' + lit.mant + ' is already between 1 and 10, so it is in proper scientific notation.');
        else {
          out.push('The coefficient ' + lit.mant + ' is not between 1 and 10, so move its decimal point ' + Math.abs(cb) + (Math.abs(cb) === 1 ? ' place ' : ' places ') + (cb > 0 ? 'left' : 'right') + ' and change the exponent by ' + (cb > 0 ? '+' : '−') + Math.abs(cb) + '. That gives ' + sciS + '.');
        }
        if (plain && b !== 0) out.push('To write it as an ordinary number, move the decimal point ' + Math.abs(b) + (Math.abs(b) === 1 ? ' place ' : ' places ') + (b > 0 ? 'right' : 'left') + ': ' + plain + '.');
      } else {
        out.push('Start with the number ' + (plain || sg + lit.src) + '.');
        out.push('Move the decimal point until there is one non-zero digit to its left: ' + mantissa(v) + '.');
        if (b === 0) out.push('You did not need to move it, so the exponent is 0.');
        else out.push('You moved it ' + Math.abs(b) + (Math.abs(b) === 1 ? ' place ' : ' places ') + (b > 0 ? 'to the left, so the exponent is +' + b : 'to the right, so the exponent is −' + Math.abs(b)) + '.');
        out.push('Write it as ' + sciS + '.');
      }
      return out;
    }
    st.steps.forEach(function (s) { out.push(s); });
    out.push('Written in proper scientific notation: ' + sciStr(v) + '.');
    return out;
  }

  /* ---------- render ---------- */
  function dispVal(res) {
    var v = res.v, n = parseInt($('sciRoundN').value, 10);
    res.long = false;
    if (!isNaN(n) && n > 0) return rmode === 'sig' ? roundSig(v, n) : roundDec(v, Math.min(n, 100));
    if (res.st.approx) return roundSig(v, 15);
    if (digits(v).length > 60) { res.long = true; return roundSig(v, 60); }
    return v;
  }
  function row(k, val, copy, sub, wide) {
    if (wide) return '<tr><td colspan="2">' + k + '<span class="sci-wide">' + val + '</span></td><td class="sci-cp">' + (copy != null ? '<button type="button" class="linkbtn" data-copy="' + String(copy).replace(/"/g, '&quot;') + '">Copy</button>' : '') + '</td></tr>';
    return '<tr><td>' + k + (sub ? '<span class="sci-sub">' + sub + '</span>' : '') + '</td><td class="sci-val">' + val + '</td><td class="sci-cp">' + (copy != null ? '<button type="button" class="linkbtn" data-copy="' + String(copy).replace(/"/g, '&quot;') + '">Copy</button>' : '') + '</td></tr>';
  }
  function setEmpty(msg) {
    $('sciBig').textContent = '—'; $('sciSub').textContent = 'Type a number or an expression to see it in every notation.';
    $('sciResBody').style.display = 'none';
    $('sciHint').textContent = msg || ''; $('sciHint').style.display = msg ? 'block' : 'none';
    $('sciNote').style.display = 'none';
    $('sciMVal').textContent = '—';
  }
  function render() {
    var raw = $('sciIn').value.trim();
    if (!raw) { setEmpty(''); return; }
    var res = evaluate(raw);
    if (res.error) { setEmpty(res.error); return; }
    $('sciHint').style.display = 'none';
    var v = dispVal(res);
    if (res.lit && !res.st.approx && isNaN(parseInt($('sciRoundN').value, 10))) { var sfn = sigFigs(res.lit); if (sfn) v = { neg: v.neg, c: v.c, e: v.e, sf: sfn }; }
    var engN = parseInt($('sciEngN').value, 10), eng = engParts(v, isNaN(engN) ? null : engN);
    var plain = plainStr(v), b = expOf(v), wd = words(v);
    $('sciNote').style.display = res.partial ? 'block' : 'none';
    if (res.partial) $('sciNote').textContent = 'Showing the result for “' + res.shown + '” so far…';
    $('sciBig').textContent = sciStr(v);
    $('sciSub').textContent = plain ? '= ' + plain : '= a number too long to write out (about 10' + sup(b) + ')';
    var tip;
    if (isZero(v)) tip = 'Zero stays 0 in every notation.';
    else if (b === 0) tip = sciStr(v, 'sup') + ' — the exponent is 0, so the number is already between 1 and 10 and the decimal point does not move.';
    else tip = 'In ' + sciStr(v, 'sup') + ', the decimal point ' + (b > 0 ? 'moves ' + b + (b === 1 ? ' place to the right' : ' places to the right') : 'moves ' + (-b) + (b === -1 ? ' place to the left' : ' places to the left')) + ' to give the ordinary number.';
    if (res.long) tip += ' The exact value has more than 60 digits, so it is shown to 60 significant figures.';
    if (res.st.approx && isNaN(parseInt($('sciRoundN').value, 10))) tip += ' The exact value never ends, so it is rounded to 15 significant figures.';
    $('sciPlain').textContent = tip;
    var rows = '';
    rows += row('Scientific notation', sciStr(v), sciStr(v));
    rows += row('E-notation', eStr(v), eStr(v));
    rows += row('Engineering notation', isZero(v) ? '0' : styled(eng.m, eng.b, style).replace(/^/, ''), isZero(v) ? '0' : styled(eng.m, eng.b, style), isZero(v) ? '' : siName(eng.b));
    rows += row('Real number', plain ? plain.replace(/,/g, ',<wbr>') : '—', plain ? plain.replace(/,/g, '') : null);
    rows += row('Order of magnitude', isZero(v) ? '—' : b, isZero(v) ? null : b);
    if (res.lit) { var sf = sigFigs(res.lit); if (sf) rows += row('Significant figures', sf, sf); }
    rows += row('In words', wd || '—', wd, null, true);
    $('sciRows').innerHTML = rows;
    renderStrip(v); renderRuler(v);
    var steps = buildSteps(res, v);
    $('sciSteps').innerHTML = steps.map(function (s) { return '<li>' + s.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</li>'; }).join('');
    // normalise note
    var nn = '';
    if (res.lit && res.lit.sci) { var mval = parseFloat(res.lit.mant); if (!(mval >= 1 && mval < 10) && mval !== 0) nn = 'Your input ' + dispSrc(res.lit.src) + ' wasn’t in proper form (the coefficient must be at least 1 and under 10) — it’s normalised to ' + sciStr(v, 'sup') + '.'; }
    $('sciNorm').textContent = nn; $('sciNorm').style.display = nn ? 'block' : 'none';
    $('sciResBody').style.display = '';
    $('sciMVal').textContent = sciStr(v, style === 'latex' ? 'sup' : style);
  }

  /* ---------- events ---------- */
  var inp = $('sciIn');
  inp.addEventListener('input', render);
  function setSeg(id, v) { [].forEach.call($(id).children, function (b) { b.classList.toggle('on', b.getAttribute('data-v') === String(v)); }); }
  $('sciInsert').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = b.getAttribute('data-ins'), s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, en = inp.selectionEnd == null ? s : inp.selectionEnd;
    inp.value = inp.value.slice(0, s) + t + inp.value.slice(en);
    var pos = s + t.length; inp.focus(); try { inp.setSelectionRange(pos, pos); } catch (x) {}
    render();
  });
  $('sciTry').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    inp.value = b.getAttribute('data-ex'); render();
  });
  $('sciStyleSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; style = b.getAttribute('data-v'); setSeg('sciStyleSeg', style); render(); });
  $('sciRoundSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; rmode = b.getAttribute('data-v'); setSeg('sciRoundSeg', rmode); render(); });
  $('sciRoundN').addEventListener('input', render);
  $('sciEngN').addEventListener('input', render);
  $('sciRows').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-copy]'); if (!b) return;
    var txt = b.getAttribute('data-copy');
    var orig = b.getAttribute('data-orig') || b.textContent; b.setAttribute('data-orig', orig);
    function show(msg) { b.textContent = msg; clearTimeout(b._t); b._t = setTimeout(function () { b.textContent = orig; }, 1300); }
    function legacy() {
      var ta = document.createElement('textarea'), ok = false;
      ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (x) { ok = false; }
      document.body.removeChild(ta);
      show(ok ? 'Copied' : 'Press Ctrl+C');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { show('Copied'); }, legacy);
    else legacy();
  });
  var advBtn = $('sciAdvBtn');
  advBtn.addEventListener('click', function () {
    advanced = !advanced;
    advBtn.classList.toggle('open', advanced);
    $('sciAdvBtnLab').textContent = advanced ? 'Go simple' : 'Go advanced';
    $('sciAdvIn').style.display = advanced ? '' : 'none';
    if (!advanced) { style = 'sup'; rmode = 'sig'; setSeg('sciStyleSeg', 'sup'); setSeg('sciRoundSeg', 'sig'); $('sciRoundN').value = ''; $('sciEngN').value = ''; render(); }
  });

  render();
};

/* =========================================================
   RECIPE CONVERTER — pure engine (no DOM). Parses pasted ingredient lines
   (quantity / unit / name, fractions, ranges, "200g butter", "butter – 250g"),
   scales them and re-expresses every amount the way a kitchen measures:
   measuring-cup and spoon fractions in US mode, whole grams / tens of ml in
   Metric mode, whole eggs, plus a density table (about 40 ingredients) so
   cups <-> grams works per ingredient. Independent engine, no shared state.
   ========================================================= */
/* RECIPE-ENGINE:START */
CalcThis.recipeEngine = (function () {
  var UF = { '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8' };
  var GLY = { '0.125': '⅛', '0.25': '¼', '0.333': '⅓', '0.375': '⅜', '0.5': '½', '0.625': '⅝', '0.667': '⅔', '0.75': '¾', '0.875': '⅞' };
  var S_CUP = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1];
  var S_TSP = [0, 1 / 8, 1 / 4, 1 / 2, 3 / 4, 1];
  var S_CNT = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1];
  var S_HALF = [0, 1 / 2, 1];
  var S_OZ = [0, 1 / 8, 1 / 4, 1 / 2, 3 / 4, 1];

  var CFG = {
    us: { cup: 236.588, tbsp: 14.7868, tsp: 4.92892, floz: 29.5735, pint: 473.176, quart: 946.353, gallon: 3785.41 },
    uk: { cup: 250, tbsp: 15, tsp: 5, floz: 28.4131, pint: 568.261, quart: 1136.52, gallon: 4546.09 },
    au: { cup: 250, tbsp: 20, tsp: 5, floz: 28.4131, pint: 568.261, quart: 1136.52, gallon: 4546.09 }
  };
  var US_CUP_ML = 236.588;
  var WT = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
  var VOLML = { ml: 1, l: 1000, dl: 100, cl: 10, stick: 118.294 };       // fixed-size volume units
  var CFGVOL = { cup: 1, tbsp: 1, tsp: 1, floz: 1, pint: 1, quart: 1, gallon: 1 };  // sizes depend on the cup standard

  var ALIAS = {};
  function al(canon, words) { words.split(' ').forEach(function (w) { ALIAS[w] = canon; }); }
  al('cup', 'cup cups c');
  al('tbsp', 'tbsp tbsps tbs tbl tb tablespoon tablespoons');
  al('tsp', 'tsp tsps teaspoon teaspoons');
  al('pint', 'pint pints pt pts');
  al('quart', 'quart quarts qt qts');
  al('gallon', 'gallon gallons gal');
  al('ml', 'ml mls milliliter milliliters millilitre millilitres');
  al('l', 'l liter liters litre litres');
  al('dl', 'dl deciliter deciliters decilitre decilitres');
  al('cl', 'cl centiliter centiliters centilitre centilitres');
  al('g', 'g gm gms gram grams');
  al('kg', 'kg kgs kilo kilos kilogram kilograms');
  al('oz', 'oz ounce ounces');
  al('lb', 'lb lbs pound pounds');
  al('stick', 'stick sticks');
  al('clove', 'clove cloves'); al('can', 'can cans tin tins'); al('jar', 'jar jars');
  al('package', 'package packages pkg pkgs packet packets'); al('bunch', 'bunch bunches');
  al('sprig', 'sprig sprigs'); al('slice', 'slice slices'); al('piece', 'piece pieces');
  al('head', 'head heads'); al('stalk', 'stalk stalks'); al('bottle', 'bottle bottles');
  al('pinch', 'pinch pinches'); al('dash', 'dash dashes'); al('handful', 'handful handfuls');
  al('fillet', 'fillet fillets'); al('ear', 'ear ears'); al('sheet', 'sheet sheets');
  var PLURAL = { clove: 'cloves', can: 'cans', jar: 'jars', package: 'packages', bunch: 'bunches', sprig: 'sprigs', slice: 'slices', piece: 'pieces', head: 'heads', stalk: 'stalks', bottle: 'bottles', pinch: 'pinches', dash: 'dashes', handful: 'handfuls', stick: 'sticks', fillet: 'fillets', ear: 'ears', sheet: 'sheets', cup: 'cups', pint: 'pints', quart: 'quarts', gallon: 'gallons' };

  /* ---------- density table: [pattern, grams per US cup, type] — s = measured by weight, l = a liquid ---------- */
  var DENS_SRC = [
    ['all[- ]purpose flour|plain flour|ap flour|white flour', 120, 's'], ['bread flour|strong flour', 120, 's'],
    ['cake flour|pastry flour', 114, 's'], ['whole[- ]?wheat flour|wholemeal flour|whole[- ]grain flour', 113, 's'],
    ['self[- ](?:rising|raising) flour', 120, 's'], ['almond flour|almond meal|ground almonds', 96, 's'],
    ['rye flour', 102, 's'], ['flour', 120, 's'],
    ['cornmeal|polenta', 138, 's'], ['cornstarch|corn starch|cornflour|corn flour', 128, 's'],
    ['powdered sugar|confectioners\'? sugar|icing sugar', 120, 's'], ['brown sugar', 213, 's'],
    ['caster sugar|superfine sugar|granulated sugar|white sugar|sugar', 200, 's'],
    ['butter|margarine', 226.8, 's'], ['shortening|lard', 205, 's'],
    ['honey', 340, 's'], ['maple syrup', 322, 's'], ['molasses', 340, 's'], ['corn syrup|golden syrup', 340, 's'],
    ['water', 237, 'l'], ['milk|buttermilk', 245, 'l'], ['heavy cream|whipping cream|double cream|single cream|cream', 238, 'l'],
    ['olive oil', 216, 'l'], ['oil', 218, 'l'],
    ['yogurt|yoghurt', 245, 's'], ['sour cream', 240, 's'], ['cream cheese', 232, 's'],
    ['peanut butter|almond butter|nut butter', 256, 's'], ['jam|jelly|marmalade|preserves', 320, 's'],
    ['applesauce', 244, 's'], ['pumpkin pur[eé]e|canned pumpkin', 245, 's'], ['mashed bananas?', 225, 's'],
    ['rolled oats|old[- ]fashioned oats|quick oats|oats|oatmeal', 90, 's'],
    ['cooked rice', 158, 's'], ['rice', 185, 's'],
    ['cocoa powder|cocoa|cacao powder', 85, 's'], ['chocolate chips|chocolate chunks', 170, 's'],
    ['salt', 288, 's'], ['baking powder', 192, 's'], ['baking soda|bicarbonate of soda', 220, 's'], ['cream of tartar', 144, 's'],
    ['walnuts|pecans', 113, 's'], ['almonds', 142, 's'],
    ['raisins', 149, 's'], ['dried cranberries|craisins', 120, 's'], ['shredded coconut|coconut flakes|desiccated coconut|flaked coconut', 85, 's'],
    ['cheddar|mozzarella|shredded cheese|grated cheese', 113, 's'], ['parmesan|parmigiano|pecorino', 100, 's'],
    ['breadcrumbs|bread crumbs', 108, 's'], ['panko', 60, 's'],
    ['vanilla extract', 208, 'l'], ['lemon juice|lime juice|orange juice|apple juice|juice', 244, 'l'],
    ['broth|stock', 240, 'l'], ['vinegar', 239, 'l']
  ];
  var DENS = DENS_SRC.map(function (d) { return { re: new RegExp('\\b(?:' + d[0] + ')s?\\b', 'i'), g: d[1], t: d[2] }; });
  var EGG_G = 50;

  function lookup(name) {
    var best = null, bl = 0;
    for (var i = 0; i < DENS.length; i++) {
      var m = DENS[i].re.exec(name);
      if (m && m[0].length > bl) { bl = m[0].length; best = DENS[i]; }
    }
    return best ? { gpm: best.g / US_CUP_ML, t: best.t } : null;
  }
  function isEgg(name, unit) { return !unit && /\begg(?!plant|\s*noodle)s?\b/i.test(name); }

  /* ---------- number helpers ---------- */
  function commas(s) { return String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function dec(x, dp) { var s = String(+x.toFixed(dp)).split('.'); return commas(s[0]) + (s[1] ? '.' + s[1] : ''); }
  function nice(x, set) {
    var w = Math.floor(x + 1e-9), p = x - w, best = 0, bd = 9;
    for (var i = 0; i < set.length; i++) { var d = Math.abs(p - set[i]); if (d < bd - 1e-12) { bd = d; best = set[i]; } }
    if (best >= 1 - 1e-9) { w += 1; best = 0; }
    var g = best ? (GLY[String(Math.round(best * 1000) / 1000)] || '') : '';
    return { w: w, f: best, val: w + best, txt: (w ? commas(w) : '') + g, zero: (w + best) === 0 };
  }
  function normFr(s) {
    return s.replace(/(\d)\s*([½⅓⅔¼¾⅛⅜⅝⅞])/g, '$1 $2').replace(/[½⅓⅔¼¾⅛⅜⅝⅞]/g, function (c) { return UF[c]; });
  }
  function toNum(s) {
    s = s.trim();
    var m;
    if ((m = /^(\d+)[\s-]+(\d+)\/(\d+)$/.exec(s))) { return +m[3] ? +m[1] + (+m[2]) / (+m[3]) : NaN; }
    if ((m = /^(\d+)\/(\d+)$/.exec(s))) { return +m[2] ? (+m[1]) / (+m[2]) : NaN; }
    if (/^\d+,\d{1,2}$/.test(s)) return parseFloat(s.replace(',', '.'));
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return parseFloat(s.replace(/,/g, ''));
    if (/^(\d+\.?\d*|\.\d+)$/.test(s)) return parseFloat(s);
    return NaN;
  }
  function parseAmount(s) { return toNum(normFr(String(s == null ? '' : s))); }

  var NUM = '(?:\\d+[\\s-]+\\d+\\/\\d+|\\d+\\/\\d+|\\d+,\\d{1,2}(?!\\d)|\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d*\\.\\d+|\\d+)';
  var RANGE_RX = new RegExp('^(' + NUM + ')(?:\\s*(?:-|\\u2013|\\u2014|to)\\s*(' + NUM + '))?');

  function takeUnit(rest) {
    var unit = '', raw = '', note = '', m;
    rest = rest.replace(/^\s+/, '');
    function paren() { if (rest.charAt(0) === '(') { var i = rest.indexOf(')'); if (i > 0) { note += (note ? ' ' : '') + rest.slice(1, i).trim(); rest = rest.slice(i + 1).replace(/^\s+/, ''); } } }
    paren();
    m = /^(fl\.?\s*oz\.?|fluid\s+ounces?)(?![A-Za-z])/i.exec(rest);
    if (m) { unit = 'floz'; raw = m[0].replace(/\.$/, ''); rest = rest.slice(m[0].length); }
    else {
      m = /^([A-Za-zµ]+)\.?/.exec(rest);
      if (m && ALIAS[m[1].toLowerCase()]) { unit = ALIAS[m[1].toLowerCase()]; raw = m[1]; rest = rest.slice(m[0].length); }
    }
    rest = rest.replace(/^\s+/, '');
    paren();
    rest = rest.replace(/^of\s+/i, '').replace(/^[\s,.:;–—-]+/, '');
    return { unit: unit, raw: raw, note: note, rest: rest.trim() };
  }
  function kindOf(u) { return (CFGVOL[u] || VOLML[u]) ? 'v' : (WT[u] ? 'w' : 'c'); }

  function parseQty(s) {
    var m = RANGE_RX.exec(s);
    if (!m) return null;
    var lo = toNum(m[1]), hi = m[2] ? toNum(m[2]) : lo;
    if (isNaN(lo) || isNaN(hi)) return null;
    if (hi < lo) { var t = lo; lo = hi; hi = t; }
    var after = s.slice(m[0].length), extra = '', mm;
    if (lo === hi) {                              // '100g-150g butter', '100 g to 150 g butter'
      mm = new RegExp('^\\s*([A-Za-z\\u00b5]+)\\.?\\s*(?:-|\\u2013|\\u2014|to)\\s*(' + NUM + ')\\s*([A-Za-z\\u00b5]+)\\.?\\s*(.*)$', 'i').exec(after);
      if (mm && ALIAS[mm[1].toLowerCase()] && ALIAS[mm[1].toLowerCase()] === ALIAS[mm[3].toLowerCase()] && toNum(mm[2]) > lo) { hi = toNum(mm[2]); extra = '–' + mm[2] + ' ' + mm[3]; after = mm[1] + ' ' + mm[4]; }
    }
    var u = takeUnit(after);
    if (u.unit === 'lb' && lo === hi) {          // '1 lb 4 oz' is one quantity
      var mo = /^(\d+(?:\.\d+)?(?:\s+\d+\/\d+|\/\d+)?)\s*(?:oz|ounces?)\b\.?\s*(.*)$/i.exec(u.rest);
      if (mo && !isNaN(toNum(mo[1]))) { lo = hi = lo + toNum(mo[1]) / 16; extra = ' ' + mo[1] + ' oz'; u.rest = mo[2].replace(/^of\s+/i, ''); }
    }
    return { lo: lo, hi: hi, qtxt: m[0].trim(), unit: u.unit, raw: u.raw + extra, note: u.note, name: u.rest };
  }

  function parseLine(line) {
    var s = normFr(String(line).replace(/^\s*[-*•·–]\s+/, '')).replace(/\s+/g, ' ').trim();
    var q = parseQty(s), row;
    if (q && q.lo > 0 && q.hi < 1e7 && (q.unit || q.name)) {
      row = { ok: true, src: line, lo: q.lo, hi: q.hi, unit: q.unit, kind: kindOf(q.unit), note: q.note, name: q.name, qtxt: q.qtxt + (q.raw ? ' ' + q.raw : '') };
      return row;
    }
    var t = /^(.+?)\s*[,:–—-]\s*(\d.*)$/.exec(s);
    if (t) {
      var q2 = parseQty(t[2]);
      if (q2 && q2.lo > 0 && q2.unit && !q2.name) {
        return { ok: true, src: line, lo: q2.lo, hi: q2.hi, unit: q2.unit, kind: kindOf(q2.unit), note: q2.note, name: t[1].trim(), qtxt: q2.qtxt + (q2.raw ? ' ' + q2.raw : '') };
      }
    }
    return { ok: false, src: line, name: s };
  }

  /* ---------- formatters: each returns { n, u, err, ex, comp } ---------- */
  function mkR(n, u, err, ex, comp) { return { n: n, u: u, err: err || 0, ex: (err || 0) > 0.02 ? ex : '', comp: !!comp }; }

  function fmtVolUS(ml, cfg) {
    var cups = ml / cfg.cup, r;
    if (cups >= 0.22) {
      r = nice(cups, S_CUP);
      if (!r.zero && Math.abs(r.val - cups) / cups <= 0.04) return mkR(r.txt, r.val > 1 ? 'cups' : 'cup', Math.abs(r.val - cups) / cups, dec(cups, 2) + ' cups');
      // not a real measuring-cup fraction: say it as cups + tablespoons instead
      var qml = cfg.cup / 4, wc = Math.floor(cups + 1e-9), rem = ml - wc * cfg.cup, q = Math.floor(rem / qml + 1e-9), lt;
      lt = nice((rem - q * qml) / cfg.tbsp, S_HALF);
      if (lt.val * cfg.tbsp >= qml * 0.999) { q += 1; lt = nice(0, S_HALF); }
      if (q >= 4) { wc += 1; q -= 4; }
      if (wc === 0 && ml / cfg.tbsp <= 8.25) {
        var tb2 = nice(ml / cfg.tbsp, S_HALF);
        return mkR(tb2.txt, 'tbsp', Math.abs(tb2.val * cfg.tbsp - ml) / ml, dec(ml / cfg.tbsp, 2) + ' tbsp');
      }
      var cv = nice(wc + q / 4, S_CUP), tot = (wc + q / 4) * cfg.cup + lt.val * cfg.tbsp;
      return mkR(cv.txt + (cv.val > 1 ? ' cups' : ' cup') + (lt.val ? ' + ' + lt.txt : ''), lt.val ? 'tbsp' : '', Math.abs(tot - ml) / ml, dec(cups, 2) + ' cups', !!lt.val);
    }
    var per = Math.round(cfg.tbsp / cfg.tsp), S = Math.round(ml / cfg.tsp * 2) / 2;
    if (S >= per) {
      var tb = Math.floor(S / per), rem = S - tb * per, err = Math.abs(S * cfg.tsp - ml) / ml;
      var exTb = dec(ml / cfg.tbsp, 2) + ' tbsp';
      if (rem) { r = nice(rem, S_TSP); return mkR(tb + ' tbsp + ' + r.txt, 'tsp', err, exTb, true); }
      return mkR(String(tb), 'tbsp', err, exTb);
    }
    var x = ml / cfg.tsp;
    if (x < 0.0625) return mkR('a pinch', '', 0, '');
    r = nice(x, S_TSP);
    if (r.zero) return mkR('a pinch', '', 0, '');
    return mkR(r.txt, 'tsp', Math.abs(r.val - x) / x, dec(x, 2) + ' tsp');
  }
  function fmtMl(ml) {
    var v, e;
    if (ml >= 1000) { v = Math.round(ml / 10) / 100; return mkR(dec(v, 2), 'L', Math.abs(v * 1000 - ml) / ml, dec(ml / 1000, 3) + ' L'); }
    if (ml >= 100) v = Math.round(ml / 10) * 10;
    else if (ml >= 15) v = Math.round(ml / 5) * 5;
    else v = Math.round(ml / 1.25) * 1.25;
    if (v === 0) return mkR('a pinch', '', 0, '');
    e = Math.abs(v - ml) / ml;
    return mkR(dec(v, 2), 'ml', e, dec(ml, 1) + ' ml');
  }
  function fmtG(g) {
    var v;
    if (g >= 1000) { v = Math.round(g / 10) / 100; return mkR(dec(v, 2), 'kg', Math.abs(v * 1000 - g) / g, dec(g / 1000, 3) + ' kg'); }
    if (g >= 10) v = Math.round(g);
    else if (g >= 1) v = Math.round(g * 2) / 2;
    else v = Math.round(g * 10) / 10;
    if (v === 0) return mkR('a pinch', '', 0, '');
    return mkR(dec(v, 1), 'g', Math.abs(v - g) / g, dec(g, 2) + ' g');
  }
  function fmtOz(oz) {
    var r;
    if (oz >= 16) {
      var tot = Math.round(oz * 2) / 2, lb = Math.floor(tot / 16), rem = tot - lb * 16, err = Math.abs(tot - oz) / oz;
      if (rem) { r = nice(rem, S_OZ); return mkR(lb + ' lb ' + r.txt, 'oz', err, dec(oz / 16, 2) + ' lb', true); }
      return mkR(String(lb), 'lb', err, dec(oz / 16, 2) + ' lb');
    }
    r = nice(oz, S_OZ);
    if (r.zero) return mkR('under ⅛', 'oz', 0, '');
    return mkR(r.txt, 'oz', Math.abs(r.val - oz) / oz, dec(oz, 2) + ' oz');
  }
  function fmtKeep(val, unit) {          // keep a fl oz / pint / quart / gallon in its own unit, to a sensible fraction
    var r = nice(val, val < 3 ? S_CNT : S_HALF);
    if (r.zero) r = nice(val, S_OZ);
    var label = unit === 'floz' ? 'fl oz' : (r.val > 1 && PLURAL[unit] ? PLURAL[unit] : unit);
    return mkR(r.zero ? dec(val, 2) : r.txt, label, r.zero ? 0 : Math.abs(r.val - val) / val, dec(val, 2) + ' ' + label);
  }
  function fmtCount(val, unit, name) {
    var r, word;
    if (isEgg(name, unit)) {
      if (val < 0.75) { r = nice(val, S_CNT); return mkR(r.zero ? dec(val, 2) : r.txt, '', 0, ''); }
      var n = Math.round(val + 1e-9);
      var res = mkR(String(n), '', 0, '');
      var fr = val - Math.floor(val);
      if (Math.abs(fr - 0.5) < 0.15 || Math.abs(fr - 0.25) < 0.1 || Math.abs(fr - 0.75) < 0.1) res.egg = 'exactly ' + nice(val, S_CNT).txt + ' — round to ' + (Math.abs(fr - 0.5) < 0.15 ? Math.floor(val) + ' or ' + (Math.floor(val) + 1) : n) + ', or beat one and measure out the part you need (a large egg is about 3 tbsp)';
      return res;
    }
    r = nice(val, val < 2 ? S_CNT : S_HALF);
    if (r.zero) r = nice(val, [0, 1 / 8, 1 / 4, 1]);
    word = unit ? (r.val > 1 && PLURAL[unit] ? PLURAL[unit] : unit) : '';
    return mkR(r.zero ? dec(val, 2) : r.txt, word, r.zero ? 0 : Math.abs(r.val - val) / val, dec(val, 2) + (word ? ' ' + word : ''));
  }
  function full(r) { return r.n + (r.u ? ' ' + r.u : ''); }

  /* ---------- base quantities ---------- */
  function unitMl(u, cfg) { return CFGVOL[u] ? cfg[u] : VOLML[u]; }
  function baseOf(row, val, cfg) {     // { ml } or { g } or null
    if (row.kind === 'v') return { ml: val * unitMl(row.unit, cfg) };
    if (row.kind === 'w') return { g: val * WT[row.unit] };
    return null;
  }
  function usForm(b, d, cfg) {
    if (b.ml != null) return fmtVolUS(b.ml, cfg);
    if (d) return fmtVolUS(b.g / d.gpm, cfg);
    return fmtOz(b.g / WT.oz);
  }
  function metForm(b, d) {
    if (b.ml != null) return (d && d.t === 's') ? fmtG(b.ml * d.gpm) : fmtMl(b.ml);
    return fmtG(b.g);
  }
  function asIsForm(row, val, b, d, cfg) {
    var u = row.unit;
    if (u === 'cup' || u === 'tbsp' || u === 'tsp') return fmtVolUS(b.ml, cfg);
    if (u === 'ml' || u === 'l' || u === 'dl' || u === 'cl') return fmtMl(b.ml);
    if (u === 'stick') return fmtCount(val, 'stick', '');
    if (row.kind === 'v') return fmtKeep(val, u);
    if (u === 'g' || u === 'kg') return fmtG(b.g);
    return fmtOz(b.g / WT.oz);
  }
  function altIsUS(row) { return !!(CFGVOL[row.unit] || row.unit === 'stick' || row.unit === 'oz' || row.unit === 'lb'); }

  var SPICE = /\b(salt|pepper|cayenne|chil[il]e?|chili powder|paprika|cumin|cinnamon|nutmeg|ginger|curry|oregano|thyme|turmeric|cardamom|allspice|mustard powder|garlic powder|onion powder|clove powder|ground cloves|vanilla)\b/i;
  var LEAVEN = /\b(baking powder|baking soda|bicarbonate|yeast)\b/i;

  /* the scaled, converted form of one parsed row */
  function convert(row, f, mode, cfg, dual) {
    var d = lookup(row.name), out = { name: row.name, note: row.note, alt: '', ex: '', egg: '', warn: '' };
    if (row.note && row.kind !== 'c') {
      var nm = /^(about|approx\.?|approximately|around|~)\s*/i.exec(row.note), nq = parseQty(normFr(row.note.slice(nm ? nm[0].length : 0)));
      if (nq && nq.unit && !nq.name && kindOf(nq.unit) !== 'c' && nq.lo > 0) {
        var nr = { ok: true, lo: nq.lo, hi: nq.hi, unit: nq.unit, kind: kindOf(nq.unit), name: row.name, note: '' };
        var no = convert(nr, f, mode, cfg, false);
        out.note = (nm ? 'about ' : '') + no.full;
      }
    }
    function one(val) {
      var b = baseOf(row, val, cfg), r;
      if (row.kind === 'c') return { r: fmtCount(val, row.unit, row.name), b: null };
      if (mode === 'us') r = usForm(b, d, cfg);
      else if (mode === 'metric') r = metForm(b, d);
      else r = asIsForm(row, val, b, d, cfg);
      return { r: r, b: b };
    }
    var A = one(row.lo * f), B = row.hi > row.lo ? one(row.hi * f) : null, p = A.r;
    if (B) {
      if (A.r.u === B.r.u && !A.r.comp && !B.r.comp) p = { n: A.r.n + '–' + B.r.n, u: A.r.u, ex: '' };
      else p = { n: full(A.r) + ' – ' + full(B.r), u: '', ex: '' };
    } else out.egg = A.r.egg || '';
    out.p = p; out.full = full(p); out.ex = B ? '' : (p.ex || '');
    if (dual && A.b) {
      var mid = (row.lo + row.hi) / 2 * f, b = baseOf(row, mid, cfg), ar;
      var primaryUS = mode === 'us' || (mode === 'asis' && altIsUS(row));
      ar = primaryUS ? metForm(b, d) : usForm(b, d, cfg);
      out.alt = (B ? (function () { var a2 = primaryUS ? metForm(baseOf(row, row.lo * f, cfg), d) : usForm(baseOf(row, row.lo * f, cfg), d, cfg), a3 = primaryUS ? metForm(baseOf(row, row.hi * f, cfg), d) : usForm(baseOf(row, row.hi * f, cfg), d, cfg); return a2.u === a3.u ? a2.n + '–' + a3.n + ' ' + a2.u : full(a2) + ' – ' + full(a3); })() : full(ar));
      if (out.alt === out.full) out.alt = '';
    }
    var small = row.kind === 'v' && (row.unit === 'tsp' || row.unit === 'tbsp') || row.unit === 'pinch' || row.unit === 'dash';
    if (SPICE.test(row.name) && small && f >= 3) out.warn = 'At ×' + fx(f) + ', add this gradually and taste — salt and strong spices don’t need to scale in full.';
    else if (LEAVEN.test(row.name) && (f >= 3 || f <= 1 / 3)) out.warn = 'Leavening doesn’t scale perfectly this far — measure carefully and expect to adjust.';
    return out;
  }
  function fx(f) {
    if (Math.abs(f - Math.round(f)) < 0.005) return String(Math.round(f));
    var r = nice(f, S_CNT);
    if (!r.zero && Math.abs(r.val - f) / f < 0.004 && r.val < 20) return r.txt;
    return dec(f, f < 10 ? 2 : 1);
  }
  function massOf(row, f, cfg) {          // grams of this row once scaled, or null when unknown
    var mid = (row.lo + row.hi) / 2 * f, d = lookup(row.name);
    if (row.kind === 'w') return mid * WT[row.unit];
    if (row.kind === 'v') return d ? mid * unitMl(row.unit, cfg) * d.gpm : null;
    if (isEgg(row.name, row.unit)) return mid * EGG_G;
    return null;
  }

  /* ---------- oven temperatures ---------- */
  var GAS = [[225, '¼'], [250, '½'], [275, '1'], [300, '2'], [325, '3'], [350, '4'], [375, '5'], [400, '6'], [425, '7'], [450, '8'], [475, '9']];
  var F2C = { 250: 120, 275: 135, 300: 150, 325: 165, 350: 175, 375: 190, 400: 200, 425: 220, 450: 230, 475: 245, 500: 260 };
  function oven(val, unit) {
    var F = unit === 'F' ? val : Math.round((val * 9 / 5 + 32) / 25) * 25;
    var C = unit === 'C' ? val : (F2C[F] != null ? F2C[F] : Math.round((val - 32) * 5 / 9 / 5) * 5);
    var gas = null, bd = 99;
    GAS.forEach(function (g) { var d = Math.abs(g[0] - F); if (d < bd) { bd = d; gas = g[1]; } });
    return { F: F, C: C, fan: C - 20, gas: bd <= 12.5 + 1e-9 ? gas : null };
  }

  return { CFG: CFG, parseLine: parseLine, parseAmount: parseAmount, convert: convert, massOf: massOf, lookup: lookup, fx: fx, nice: nice, dec: dec, fmtG: fmtG, fmtVolUS: fmtVolUS, fmtMl: fmtMl, fmtOz: fmtOz, full: full, oven: oven, S_CNT: S_CNT };
})();
/* RECIPE-ENGINE:END */

/* =========================================================
   CalcThis.initRecipeCalc() — paste a recipe, set the servings, get every amount
   scaled AND kitchen-ready (cup/spoon fractions, whole grams, whole eggs), with
   cups <-> grams per ingredient. Differentiator vs. every competitor checked
   (Gigacalculator, Instacart, CalculateQuick, Omnicalculator — all give raw math
   such as "5 1/2 eggs" or "3/4 cup + 2 tbsp + 2 tsp"; none draws anything): kitchen
   rounding with the exact value shown alongside, per-line scale warnings, a
   what's-in-it-by-weight bar, and (Go advanced) a to-scale pan diagram with
   pan-size scaling, cup standard, both systems side by side, oven temperature
   and per-ingredient cost. Engine: CalcThis.recipeEngine. No shared state. */
CalcThis.initRecipeCalc = function () {
  var E = CalcThis.recipeEngine;
  var $ = function (id) { return document.getElementById(id); };
  var st = { out: 'asis', mode: 'serv', adv: false, pan: false, dual: false, cup: 'us', pu: 'in', tu: 'F' };
  var prices = {}, costSig = '', lastText = '';
  var EXAMPLES = {
    pancakes: { orig: '4', text: '1 1/2 cups all-purpose flour\n3 1/2 tsp baking powder\n1 tsp salt\n1 tbsp white sugar\n1 1/4 cups milk\n1 egg\n3 tbsp butter, melted' },
    cookies: { orig: '24', text: '2 1/4 cups all-purpose flour\n1 tsp baking soda\n1 tsp salt\n1 cup butter\n3/4 cup granulated sugar\n3/4 cup packed brown sugar\n2 large eggs\n2 tsp vanilla extract\n2 cups chocolate chips' },
    bread: { orig: '8', text: '500 g bread flour\n10 g salt\n7 g dried yeast\n320 ml water\n1 tbsp olive oil' }
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function setSeg(id, v) { [].forEach.call($(id).children, function (b) { b.classList.toggle('on', b.getAttribute('data-v') === String(v)); }); }
  function setHint(msg) { var h = $('rcHint'); h.textContent = msg || ''; h.style.display = msg ? 'block' : 'none'; }
  function pos(id) { var v = E.parseAmount($(id).value); return v > 0 ? v : NaN; }

  /* ---------- scale factor ---------- */
  function area(shape, w, l) { return shape === 'round' ? Math.PI * w * w / 4 : w * l; }
  function panSizes() {
    var os = $('rcOpShape').value, ts = $('rcTpShape').value;
    var ow = pos('rcOpW'), ol = os === 'round' ? ow : pos('rcOpL'), tw = pos('rcTpW'), tl = ts === 'round' ? tw : pos('rcTpL');
    return { os: os, ts: ts, ow: ow, ol: ol, tw: tw, tl: tl, ok: ow > 0 && ol > 0 && tw > 0 && tl > 0 };
  }
  function factor() {
    var typed, f;
    if (st.adv && st.pan) {
      var P = panSizes();
      if (!P.ok) return { f: 1, kind: 'none', hint: 'Enter both pan sizes to scale by pan. Showing the recipe at ×1 for now.' };
      var a1 = area(P.os, P.ow, P.ol), a2 = area(P.ts, P.tw, P.tl);
      return { f: a2 / a1, kind: 'pan', P: P, a1: a1, a2: a2 };
    }
    if (st.mode === 'serv') {
      var oText = $('rcOrig').value.trim(), wText = $('rcWant').value.trim();
      if (!oText && !wText) return { f: 1, kind: 'none' };
      var o = pos('rcOrig'), w = pos('rcWant');
      if (!(o > 0) || !(w > 0)) return { f: 1, kind: 'none', hint: (oText && !(o > 0)) || (wText && !(w > 0)) ? 'Servings must be a number above 0.' : 'Enter both servings to scale the recipe. Showing it at ×1 for now.' };
      f = w / o;
      if (f > 1000 || f < 0.001) return { f: 1, kind: 'none', hint: 'That is an extreme change (×' + E.fx(f) + ') — check the two serving numbers.' };
      return { f: f, kind: 'serv', o: o, w: w };
    }
    typed = $('rcMult').value.trim();
    if (!typed) return { f: 1, kind: 'none' };
    f = E.parseAmount(typed);
    if (!(f > 0)) return { f: 1, kind: 'none', hint: 'Type a number above 0, like 2 or 1/2.' };
    if (f > 1000 || f < 0.001) return { f: 1, kind: 'none', hint: 'That is an extreme multiplier — check the number.' };
    return { f: f, kind: 'mult' };
  }

  /* ---------- pan diagram ---------- */
  function renderPan(F) {
    var wrap = $('rcPanWrap');
    if (F.kind !== 'pan') { wrap.style.display = 'none'; return; }
    var P = F.P, u = st.pu === 'in' ? 'in' : 'cm', sq = st.pu === 'in' ? 'sq in' : 'sq cm';
    var mx = Math.max(P.ow, P.ol, P.tw, P.tl), k = 92 / mx, svg = '', cy = 66;
    function shape(cx, shp, w, l, cls) {
      var W = w * k, H = l * k;
      if (shp === 'round') return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (W / 2) + '" fill="' + cls + '" stroke="var(--amber-deep)" stroke-width="1.6"/>';
      return '<rect x="' + (cx - W / 2) + '" y="' + (cy - H / 2) + '" width="' + W + '" height="' + H + '" rx="5" fill="' + cls + '" stroke="var(--amber-deep)" stroke-width="1.6"/>';
    }
    function dims(shp, w, l) { return shp === 'round' ? E.dec(w, 1) + ' ' + u + ' round' : E.dec(w, 1) + ' × ' + E.dec(l, 1) + ' ' + u; }
    svg += '<text x="64" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-soft)">Original pan</text>';
    svg += '<text x="216" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-soft)">Your pan</text>';
    svg += shape(64, P.os, P.ow, P.ol, 'rgba(55,80,63,.14)') + shape(216, P.ts, P.tw, P.tl, 'rgba(181,118,31,.24)');
    svg += '<text x="140" y="62" text-anchor="middle" font-size="14" font-weight="700" fill="var(--amber-deep)">×' + E.fx(F.f) + '</text>';
    svg += '<path d="M118 70h44M154 64l8 6-8 6" stroke="var(--amber)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    svg += '<text x="64" y="132" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">' + esc(dims(P.os, P.ow, P.ol)) + '</text>';
    svg += '<text x="216" y="132" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">' + esc(dims(P.ts, P.tw, P.tl)) + '</text>';
    svg += '<text x="64" y="148" text-anchor="middle" font-size="12" font-weight="500" fill="var(--muted)">' + E.dec(F.a1, 1) + ' ' + sq + '</text>';
    svg += '<text x="216" y="148" text-anchor="middle" font-size="12" font-weight="500" fill="var(--muted)">' + E.dec(F.a2, 1) + ' ' + sq + '</text>';
    $('rcPan').innerHTML = '<svg viewBox="0 0 280 156" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg><div class="sq-diagram-legend"><span>Drawn to scale. Amounts scale with the pan <b>area</b>, so the batter keeps the same depth.</span></div>';
    wrap.style.display = '';
  }

  /* ---------- composition by weight ---------- */
  function renderComp(rows, f, cfg, F) {
    var items = [], total = 0, n = 0, tot = rows.filter(function (r) { return r.ok; }).length;
    rows.forEach(function (r) {
      if (!r.ok) return;
      var g = E.massOf(r, f, cfg);
      if (g > 0) { items.push({ name: r.name.replace(/,.*$/, '').trim() || 'ingredient', g: g }); total += g; n++; }
    });
    var wrap = $('rcCompWrap');
    if (items.length < 2) { wrap.style.display = 'none'; return; }
    items.sort(function (a, b) { return b.g - a.g; });
    var top = items.slice(0, 6), rest = items.slice(6), other = 0; rest.forEach(function (i) { other += i.g; });
    if (other > 0) top.push({ name: 'Other', g: other, other: true });
    var bar = '', key = '';
    top.forEach(function (it, i) {
      var pct = it.g / total * 100, c = it.other ? 'c6' : 'c' + i;
      bar += '<div class="rc-seg ' + c + '" style="width:' + pct + '%" title="' + esc(it.name) + ' ' + Math.round(pct) + '%">' + (pct >= 13 ? Math.round(pct) + '%' : '') + '</div>';
      key += '<span><i class="' + c + '"></i>' + esc(it.name) + ' ' + (pct < 1 ? '<1' : Math.round(pct)) + '%</span>';
    });
    var per = '';
    if (F.kind === 'serv') per = ' · about ' + E.full(E.fmtG(total / F.w)) + ' per serving';
    $('rcComp').innerHTML = '<div class="rc-bar">' + bar + '</div><div class="rc-key">' + key + '</div>';
    $('rcCompNote').textContent = 'Total about ' + E.full(E.fmtG(total)) + per + '. Based on ' + n + ' of ' + tot + ' ingredients with a known weight (an egg counts as 50 g).';
    wrap.style.display = '';
  }

  /* ---------- cost ---------- */
  function keyOf(r) { return r.src.trim().toLowerCase(); }
  function updateCost(rows, f, F) {
    var orig = 0, any = false;
    rows.forEach(function (r) { if (!r.ok) return; var v = parseFloat(prices[keyOf(r)]); if (v >= 0) { orig += v; any = true; } });
    var el = $('rcCostTot');
    if (!any) { el.textContent = 'Enter the price of each original amount to see the cost of the scaled recipe.'; return; }
    var sc = orig * f, txt = 'Original recipe ' + money(orig) + ' · scaled ' + money(sc);
    if (F.kind === 'serv') txt += ' · ' + money(sc / F.w) + ' per serving';
    el.textContent = txt;
  }
  function buildCost(rows, f, F) {
    var okRows = rows.filter(function (r) { return r.ok; });
    var sig = okRows.map(keyOf).join('\n');
    if (sig !== costSig) {
      costSig = sig;
      $('rcCostRows').innerHTML = okRows.map(function (r, i) {
        var k = keyOf(r), v = prices[k] == null ? '' : prices[k];
        return '<div class="rc-crow"><span class="rc-cname">' + esc((r.qtxt + ' ' + r.name).trim()) + '</span><div class="inp"><input type="text" inputmode="decimal" data-k="' + esc(k) + '" value="' + esc(v) + '" placeholder="0.00" aria-label="Price of ' + esc(r.name) + '"></div></div>';
      }).join('');
    }
    updateCost(rows, f, F);
  }

  /* ---------- oven ---------- */
  function renderOven() {
    var el = $('rcOven'), v = parseFloat($('rcTemp').value);
    if (!st.adv || !(v > 0) || v > 700) { el.style.display = 'none'; return; }
    var o = E.oven(v, st.tu);
    el.textContent = st.tu === 'F'
      ? v + ' °F = ' + o.C + ' °C (fan ' + o.fan + ' °C)' + (o.gas ? ' · gas mark ' + o.gas : '')
      : v + ' °C = ' + o.F + ' °F · fan ' + o.fan + ' °C' + (o.gas ? ' · gas mark ' + o.gas : '');
    el.style.display = '';
  }

  /* ---------- main render ---------- */
  var current = [];
  function empty() {
    $('rcBig').textContent = '—';
    $('rcSub').textContent = 'Paste your ingredients, then set the servings or a multiplier.';
    $('rcBody').style.display = 'none'; $('rcMVal').textContent = '—'; setHint('');
    current = []; costSig = '';
  }
  function render() {
    var text = $('rcText').value, lines = text.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) { empty(); return; }
    var F = factor(), cfg = E.CFG[st.cup], f = F.f;
    setHint(F.hint || '');
    var rows = lines.map(function (l) {
      var p = E.parseLine(l);
      if (p.ok) p.out = E.convert(p, f, st.out, cfg, st.dual);
      return p;
    });
    current = rows;
    var big = F.kind === 'none' ? '×1' : '×' + E.fx(f);
    $('rcBig').textContent = big;
    var sub;
    if (F.kind === 'serv') sub = 'Serves ' + E.dec(F.w, 2) + ' · scaled from ' + E.dec(F.o, 2) + ' — every amount × ' + E.fx(f);
    else if (F.kind === 'mult') sub = 'Every amount × ' + E.fx(f);
    else if (F.kind === 'pan') sub = 'Pan area ' + E.dec(F.a1, 1) + ' → ' + E.dec(F.a2, 1) + ' ' + (st.pu === 'in' ? 'sq in' : 'sq cm');
    else sub = 'No scaling yet — set the servings or a multiplier to resize it.';
    $('rcSub').textContent = sub;

    var tip = '';
    if (F.kind === 'pan') tip = 'The amounts scale with the pan area, so the batter keeps the same depth and the bake time should stay close to the original. Start checking a few minutes early.';
    else if (f >= 1.5) tip = 'Bigger batch: use a bigger pan or pot (or bake in two), and start checking doneness a little early — cooking time rarely scales with the amounts.';
    else if (f <= 0.67) tip = 'Smaller batch: use a smaller pan so it keeps its depth, and check for doneness early — it will usually be done sooner.';
    $('rcTip').textContent = tip; $('rcTip').style.display = tip ? '' : 'none';

    var html = '', plain = [], noAmt = 0;
    rows.forEach(function (r) {
      if (!r.ok) {
        noAmt++; plain.push(r.src.trim());
        html += '<div class="rc-row rc-na"><div class="rc-amt"><span class="rc-alt">no amount</span></div><div class="rc-name">' + esc(r.src) + '</div></div>';
        return;
      }
      var o = r.out, name = o.name + (o.note ? ' (' + o.note + ')' : '');
      var subs = ['was ' + r.qtxt];
      if (o.ex) subs.push('exactly ' + o.ex);
      html += '<div class="rc-row"><div class="rc-amt"><b>' + esc(o.full) + '</b>' + (o.alt ? '<span class="rc-alt">(' + esc(o.alt) + ')</span>' : '') + '</div>'
        + '<div class="rc-name">' + esc(name) + '<span class="rc-sub">' + esc(subs.join(' · ')) + '</span>'
        + (o.egg ? '<span class="rc-warn">' + esc(o.egg) + '</span>' : '') + (o.warn ? '<span class="rc-warn">' + esc(o.warn) + '</span>' : '') + '</div></div>';
      plain.push(o.full + (o.alt ? ' (' + o.alt + ')' : '') + ' ' + name);
    });
    $('rcList').innerHTML = html;
    lastText = plain.join('\n');
    var note = noAmt ? noAmt + (noAmt === 1 ? ' line has' : ' lines have') + ' no amount, so ' + (noAmt === 1 ? 'it is' : 'they are') + ' shown as written.' : '';
    $('rcListNote').textContent = note; $('rcListNote').style.display = note ? '' : 'none';

    renderPan(F);
    renderComp(rows, f, cfg, F);
    $('rcCostWrap').style.display = st.adv ? '' : 'none';
    if (st.adv) buildCost(rows, f, F);
    renderOven();
    $('rcBody').style.display = '';
    $('rcMVal').textContent = F.kind === 'none' ? '×1' : '×' + E.fx(f) + (F.kind === 'serv' ? ' · serves ' + E.dec(F.w, 2) : '');
  }

  /* ---------- events ---------- */
  ['rcText', 'rcOrig', 'rcWant', 'rcMult', 'rcOpW', 'rcOpL', 'rcTpW', 'rcTpL', 'rcTemp'].forEach(function (id) { $(id).addEventListener('input', render); });
  $('rcOutSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.out = b.getAttribute('data-v'); setSeg('rcOutSeg', st.out); render(); });
  $('rcModeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    st.mode = b.getAttribute('data-v'); setSeg('rcModeSeg', st.mode);
    $('rcServBox').style.display = st.mode === 'serv' ? '' : 'none';
    $('rcMultBox').style.display = st.mode === 'mult' ? '' : 'none';
    render();
  });
  $('rcQuick').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = parseFloat(b.getAttribute('data-k'));
    if (st.adv && st.pan) { setHint('Scaling by pan size is on — switch it off under Go advanced to use the quick multipliers.'); return; }
    if (st.mode === 'serv') {
      var o = pos('rcOrig');
      if (!(o > 0)) { setHint('Enter how many servings the recipe makes first, then pick a multiplier.'); return; }
      $('rcWant').value = String(Math.round(o * k * 100) / 100);
    } else $('rcMult').value = String(k);
    render();
  });
  $('rcTry').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var ex = EXAMPLES[b.getAttribute('data-ex')]; if (!ex) return;
    $('rcText').value = ex.text; $('rcOrig').value = ex.orig; $('rcWant').value = '';
    st.mode = 'serv'; setSeg('rcModeSeg', 'serv'); $('rcServBox').style.display = ''; $('rcMultBox').style.display = 'none';
    render();
  });
  $('rcScaleSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    st.pan = b.getAttribute('data-v') === 'pan'; setSeg('rcScaleSeg', st.pan ? 'pan' : 'size');
    $('rcPanBox').style.display = st.pan ? '' : 'none'; render();
  });
  $('rcPanUnitSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.pu = b.getAttribute('data-v'); setSeg('rcPanUnitSeg', st.pu); render(); });
  function shapeUI() {
    var os = $('rcOpShape').value === 'round', ts = $('rcTpShape').value === 'round';
    $('rcOpLWrap').style.display = os ? 'none' : ''; $('rcTpLWrap').style.display = ts ? 'none' : '';
    $('rcOpWLab').textContent = os ? 'Diameter' : 'Width'; $('rcTpWLab').textContent = ts ? 'Diameter' : 'Width';
  }
  $('rcOpShape').addEventListener('change', function () { shapeUI(); render(); });
  $('rcTpShape').addEventListener('change', function () { shapeUI(); render(); });
  $('rcCup').addEventListener('change', function () { st.cup = this.value; render(); });
  $('rcDualSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.dual = b.getAttribute('data-v') === 'both'; setSeg('rcDualSeg', st.dual ? 'both' : 'one'); render(); });
  $('rcTempSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.tu = b.getAttribute('data-v'); setSeg('rcTempSeg', st.tu); render(); });
  $('rcCostRows').addEventListener('input', function (e) {
    var t = e.target; if (!t.getAttribute || !t.getAttribute('data-k')) return;
    prices[t.getAttribute('data-k')] = t.value;
    var F = factor(); updateCost(current, F.f, F);
  });
  $('rcCopy').addEventListener('click', function () {
    var b = this, txt = lastText; if (!txt) return;
    var orig = b.getAttribute('data-orig') || b.textContent; b.setAttribute('data-orig', orig);
    function show(msg) { b.textContent = msg; clearTimeout(b._t); b._t = setTimeout(function () { b.textContent = orig; }, 1300); }
    function legacy() {
      var ta = document.createElement('textarea'), ok = false;
      ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (x) { ok = false; }
      document.body.removeChild(ta);
      show(ok ? 'Copied' : 'Press Ctrl+C');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { show('Copied'); }, legacy);
    else legacy();
  });
  $('rcPrint').addEventListener('click', function () { window.print(); });
  var advBtn = $('rcAdvBtn');
  advBtn.addEventListener('click', function () {
    st.adv = !st.adv;
    advBtn.classList.toggle('open', st.adv);
    $('rcAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('rcAdvIn').style.display = st.adv ? '' : 'none';
    if (!st.adv) {
      st.pan = false; st.dual = false; st.cup = 'us'; st.pu = 'in'; st.tu = 'F'; prices = {}; costSig = '';
      setSeg('rcScaleSeg', 'size'); setSeg('rcDualSeg', 'one'); setSeg('rcPanUnitSeg', 'in'); setSeg('rcTempSeg', 'F');
      $('rcPanBox').style.display = 'none'; $('rcCup').value = 'us'; $('rcOpShape').value = 'rect'; $('rcTpShape').value = 'rect';
      ['rcOpW', 'rcOpL', 'rcTpW', 'rcTpL', 'rcTemp'].forEach(function (id) { $(id).value = ''; });
      shapeUI();
    }
    render();
  });

  shapeUI();
  render();
};

/* =========================================================
   BMR CALCULATOR — pure engine (no DOM). Five published equations for basal
   metabolic rate in kcal/day: Mifflin-St Jeor (1990), Harris-Benedict (1919),
   revised Harris-Benedict (Roza & Shizgal 1984), Schofield (WHO/FAO 1985, the only
   one that covers children and teenagers) and Katch-McArdle (needs body fat %).
   ========================================================= */
/* BMR-ENGINE:START */
CalcThis.bmrEngine = (function () {
  var KJ = 4.184;                                   // kJ per kcal
  var LEVELS = [
    { id: 'sed', f: 1.2, name: 'Sedentary', desc: 'little or no exercise' },
    { id: 'light', f: 1.375, name: 'Light', desc: '1–3 days a week' },
    { id: 'mod', f: 1.55, name: 'Moderate', desc: '3–5 days a week' },
    { id: 'act', f: 1.725, name: 'Active', desc: '6–7 days a week' },
    { id: 'very', f: 1.9, name: 'Very active', desc: 'hard training or a physical job' }
  ];
  var NAMES = {
    mifflin: 'Mifflin-St Jeor', hbrev: 'Revised Harris-Benedict', hb: 'Harris-Benedict', schofield: 'Schofield', katch: 'Katch-McArdle'
  };
  // Schofield, MJ/day = a x kg + b, by age band
  var SCH = {
    m: [[3, 0.249, -0.127], [10, 0.095, 2.110], [18, 0.074, 2.754], [30, 0.063, 2.896], [60.0001, 0.048, 3.653], [999, 0.049, 2.459]],
    f: [[3, 0.244, -0.130], [10, 0.085, 2.033], [18, 0.056, 2.898], [30, 0.062, 2.036], [60.0001, 0.034, 3.538], [999, 0.038, 2.755]]
  };

  function mifflin(m, W, H, A) { return 10 * W + 6.25 * H - 5 * A + (m ? 5 : -161); }
  function hb(m, W, H, A) { return m ? 66.5 + 13.75 * W + 5.003 * H - 6.755 * A : 655.1 + 9.563 * W + 1.850 * H - 4.676 * A; }
  function hbrev(m, W, H, A) { return m ? 88.362 + 13.397 * W + 4.799 * H - 5.677 * A : 447.593 + 9.247 * W + 3.098 * H - 4.330 * A; }
  function schofield(m, W, A) {
    var t = SCH[m ? 'm' : 'f'];
    for (var i = 0; i < t.length; i++) if (A < t[i][0]) return (t[i][1] * W + t[i][2]) * 1000 / KJ;
    return NaN;
  }
  function katch(lbm) { return 370 + 21.6 * lbm; }

  /* o = { male, W (kg), H (cm), A (years), bf (% or null) } -> list of { id, name, kcal } for the formulas that apply */
  function all(o) {
    var out = [], adult = o.A >= 18;
    if (adult) {
      out.push({ id: 'mifflin', name: NAMES.mifflin, kcal: mifflin(o.male, o.W, o.H, o.A) });
      out.push({ id: 'hbrev', name: NAMES.hbrev, kcal: hbrev(o.male, o.W, o.H, o.A) });
      out.push({ id: 'hb', name: NAMES.hb, kcal: hb(o.male, o.W, o.H, o.A) });
    }
    out.push({ id: 'schofield', name: NAMES.schofield, kcal: schofield(o.male, o.W, o.A) });
    if (adult && o.bf > 0 && o.bf < 100) out.push({ id: 'katch', name: NAMES.katch, kcal: katch(o.W * (1 - o.bf / 100)) });
    return out;
  }
  /* which formula is the headline: the user's pick if it applies, else Mifflin (adults) / Schofield (under 18) */
  function pick(list, want, A) {
    var def = A >= 18 ? 'mifflin' : 'schofield', i;
    for (i = 0; i < list.length; i++) if (list[i].id === want) return list[i];
    for (i = 0; i < list.length; i++) if (list[i].id === def) return list[i];
    return list[0];
  }
  /* typical split of a day's energy at one activity factor: digestion ~10% of the total, the rest above BMR is movement */
  function split(bmr, f) {
    var tdee = bmr * f, dig = tdee * 0.10, act = Math.max(0, tdee - bmr - dig);
    return { tdee: tdee, bmr: bmr, dig: dig, act: act, total: bmr + dig + act };
  }
  return { KJ: KJ, LEVELS: LEVELS, NAMES: NAMES, mifflin: mifflin, hb: hb, hbrev: hbrev, schofield: schofield, katch: katch, all: all, pick: pick, split: split };
})();
/* BMR-ENGINE:END */

/* =========================================================
   CalcThis.initBmrCalc() — basal metabolic rate. Differentiator vs. calculator.net,
   Omnicalculator, Gigacalculator and bmrcalculator.org (all checked live; one bare
   number, a formula dropdown, or two formulas side by side — none plots the spread):
   every published formula at once on one scale with a plain-English spread, kcal AND
   kJ AND per hour together, a clickable activity table that drives a "where your
   calories go" bar and lose / maintain / gain targets with a below-BMR flag, and
   Schofield for ages 10-17. Go advanced = body fat % (Katch-McArdle), choose the
   headline formula, per-kg figures. Engine: CalcThis.bmrEngine. No shared state. */
CalcThis.initBmrCalc = function () {
  var E = CalcThis.bmrEngine;
  var $ = function (id) { return document.getElementById(id); };
  var st = { unit: 'met', sex: 'female', adv: false, level: 'mod', want: 'mifflin' };
  var LB = 0.45359237, IN = 2.54;
  var keep = { H: null, W: null };          // exact values carried across a unit switch until the user edits that field
  var PH = { met: ['170', '65'], imp: ['5', '7', '145'], uk: ['5', '7', '10', '5'] };

  function num(id) { var v = parseFloat(($(id).value + '').trim()); return isNaN(v) ? NaN : v; }
  function blank(id) { return !($(id).value + '').trim(); }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function r0(x) { return Math.round(x); }
  function setHint(m) { var h = $('bmHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  function level() { for (var i = 0; i < E.LEVELS.length; i++) if (E.LEVELS[i].id === st.level) return E.LEVELS[i]; return E.LEVELS[2]; }

  /* ---------- read / write height + weight in the chosen units ---------- */
  function readH() {
    if (keep.H != null) return keep.H;
    if (st.unit === 'met') return blank('bmHcm') ? NaN : num('bmHcm');
    if (blank('bmHft') && blank('bmHin')) return NaN;
    var ft = blank('bmHft') ? 0 : num('bmHft'), inch = blank('bmHin') ? 0 : num('bmHin');
    return (ft * 12 + inch) * IN;
  }
  function readW() {
    if (keep.W != null) return keep.W;
    if (st.unit === 'met') return blank('bmWkg') ? NaN : num('bmWkg');
    if (st.unit === 'imp') return blank('bmWlb') ? NaN : num('bmWlb') * LB;
    if (blank('bmWst') && blank('bmWlb2')) return NaN;
    var s = blank('bmWst') ? 0 : num('bmWst'), l = blank('bmWlb2') ? 0 : num('bmWlb2');
    return (s * 14 + l) * LB;
  }
  function writeH(cm) {
    if (!(cm > 0)) return;
    if (st.unit === 'met') { $('bmHcm').value = String(Math.round(cm * 10) / 10); return; }
    var tot = cm / IN, ft = Math.floor(tot / 12), inch = Math.round((tot - ft * 12) * 10) / 10;
    if (inch >= 12) { ft += 1; inch = 0; }
    $('bmHft').value = String(ft); $('bmHin').value = String(inch);
  }
  function writeW(kg) {
    if (!(kg > 0)) return;
    if (st.unit === 'met') { $('bmWkg').value = String(Math.round(kg * 10) / 10); return; }
    var lb = kg / LB;
    if (st.unit === 'imp') { $('bmWlb').value = String(Math.round(lb * 10) / 10); return; }
    var s = Math.floor(lb / 14), l = Math.round((lb - s * 14) * 10) / 10;
    if (l >= 14) { s += 1; l = 0; }
    $('bmWst').value = String(s); $('bmWlb2').value = String(l);
  }
  function showUnit() {
    $('bmHmet').style.display = st.unit === 'met' ? '' : 'none';
    $('bmHimp').style.display = st.unit === 'met' ? 'none' : '';
    $('bmWmet').style.display = st.unit === 'met' ? '' : 'none';
    $('bmWimp').style.display = st.unit === 'imp' ? '' : 'none';
    $('bmWuk').style.display = st.unit === 'uk' ? '' : 'none';
    $('bmHcm').placeholder = PH.met[0]; $('bmWkg').placeholder = PH.met[1];
    $('bmHft').placeholder = PH.imp[0]; $('bmHin').placeholder = PH.imp[1]; $('bmWlb').placeholder = PH.imp[2];
    $('bmWst').placeholder = PH.uk[2]; $('bmWlb2').placeholder = PH.uk[3];
    [].forEach.call($('bmUnitSeg').children, function (b) { b.classList.toggle('on', b.getAttribute('data-v') === st.unit); });
  }

  /* ---------- pictures ---------- */
  function renderScale(list, head) {
    var vals = list.map(function (x) { return x.kcal; }), lo = head.kcal * 0.9, hi = head.kcal * 1.1;
    var min = Math.min.apply(null, vals.concat([lo])) * 0.97, max = Math.max.apply(null, vals.concat([hi])) * 1.03;
    function pct(v) { return Math.max(0, Math.min(100, (v - min) / (max - min) * 100)); }
    $('bmBand').style.left = pct(lo) + '%'; $('bmBand').style.width = (pct(hi) - pct(lo)) + '%';
    var t = '';
    list.forEach(function (x) { if (x.id !== head.id) t += '<span class="iw-tick" style="left:' + pct(x.kcal) + '%" title="' + x.name + ' ' + commas(r0(x.kcal)) + '"></span>'; });
    $('bmTickLayer').innerHTML = t;
    var c = $('bmCur'); c.style.display = ''; c.style.left = pct(head.kcal) + '%';
    $('bmScaleTicks').innerHTML = '<span style="left:' + pct(lo) + '%">' + commas(r0(lo)) + '</span><span style="left:' + pct(hi) + '%">' + commas(r0(hi)) + '</span>';
  }
  function renderSplit(bmr) {
    var s = E.split(bmr, level().f), parts = [['Resting (BMR)', s.bmr, 'c0'], ['Digestion', s.dig, 'c3'], ['Movement', s.act, 'c1']], bar = '', key = '';
    parts.forEach(function (p) {
      var pc = p[1] / s.total * 100;
      bar += '<div class="bm-seg ' + p[2] + '" style="width:' + pc + '%">' + (pc >= 12 ? r0(pc) + '%' : '') + '</div>';
      key += '<span><i class="' + p[2] + '"></i>' + p[0] + ' ' + commas(r0(p[1])) + ' kcal</span>';
    });
    $('bmSplit').innerHTML = '<div class="bm-bar">' + bar + '</div><div class="bm-key">' + key + '</div>';
    $('bmSplitH').textContent = 'Where your ' + commas(r0(s.tdee)) + ' calories go (' + level().name.toLowerCase() + ')';
  }

  /* ---------- main ---------- */
  function empty(msg) {
    $('bmBig').textContent = '—'; $('bmUnitTxt').textContent = '';
    $('bmSub').textContent = 'Enter your age, height and weight to see your BMR.';
    $('bmBody').style.display = 'none'; $('bmMVal').textContent = '—';
    setHint(msg || '');
  }
  function solve() {
    var A = num('bmAge'), H = readH(), W = readW();
    if (blank('bmAge') && isNaN(H) && isNaN(W)) { empty(''); return; }
    if (isNaN(A) || isNaN(H) || isNaN(W)) { empty(''); return; }
    if (A < 10 || A > 100) { empty('Enter an age from 10 to 100.'); return; }
    if (H < 100 || H > 250) { empty('Height should be between 100 and 250 cm (3 ft 3 in to 8 ft 2 in).'); return; }
    if (W < 20 || W > 400) { empty('Weight should be between 20 and 400 kg (44 to 880 lb).'); return; }
    setHint('');
    var bfRaw = $('bmBf').value.trim() ? parseFloat($('bmBf').value) : NaN;
    var bf = (st.adv && bfRaw >= 3 && bfRaw <= 70) ? bfRaw : null;
    var list = E.all({ male: st.sex === 'male', W: W, H: H, A: A, bf: bf });
    var head = E.pick(list, st.adv ? st.want : 'mifflin', A), bmr = head.kcal;
    var fellBack = st.adv && st.want !== 'mifflin' && st.want !== head.id;

    $('bmBig').textContent = commas(r0(bmr)); $('bmUnitTxt').textContent = 'kcal/day';
    $('bmSub').textContent = head.name + ' · ' + commas(r0(bmr * E.KJ)) + ' kJ/day · ' + r0(bmr / 24) + ' kcal an hour';
    $('bmMVal').textContent = commas(r0(bmr)) + ' kcal/day';

    var mn = Math.min.apply(null, list.map(function (x) { return x.kcal; })), mx = Math.max.apply(null, list.map(function (x) { return x.kcal; }));
    var tip;
    if (list.length === 1) tip = 'For ages under 18 only the <strong>Schofield</strong> equation applies — the Mifflin and Harris-Benedict equations were built from adults.';
    else tip = 'The formulas span <strong>' + commas(r0(mn)) + '–' + commas(r0(mx)) + ' kcal</strong> for you. Estimates like these usually land within about 10% of a lab measurement, so treat <strong>' + commas(r0(bmr * 0.9)) + '–' + commas(r0(bmr * 1.1)) + '</strong> as your realistic range.';
    if (fellBack) tip += ' ' + (st.want === 'katch' ? 'Katch-McArdle needs a body fat % — showing ' + head.name + ' instead.' : E.NAMES[st.want] + ' doesn’t apply at this age — showing ' + head.name + ' instead.');
    $('bmTip').innerHTML = tip;

    var rows = '';
    list.forEach(function (x) {
      var d = x.kcal - bmr;
      rows += '<tr' + (x.id === head.id ? ' class="cur"' : '') + '><td>' + x.name + '</td><td>' + commas(r0(x.kcal)) + '</td><td>' + (x.id === head.id ? '—' : (d > 0 ? '+' : '−') + Math.abs(r0(d))) + '</td></tr>';
    });
    $('bmTable').innerHTML = '<thead><tr><th>Formula</th><th>kcal/day</th><th>vs. headline</th></tr></thead><tbody>' + rows + '</tbody>';

    if (list.length > 1) { $('bmScaleWrap').style.display = ''; renderScale(list, head); } else $('bmScaleWrap').style.display = 'none';

    var act = '';
    E.LEVELS.forEach(function (lv) {
      act += '<tr data-l="' + lv.id + '" tabindex="0"' + (lv.id === st.level ? ' class="cur"' : '') + '><td>' + lv.name + '<span class="bm-sub">' + lv.desc + '</span></td><td>×' + lv.f + '</td><td>' + commas(r0(bmr * lv.f)) + '</td></tr>';
    });
    $('bmAct').innerHTML = '<thead><tr><th>Activity level</th><th>× BMR</th><th>kcal/day</th></tr></thead><tbody>' + act + '</tbody>';
    renderSplit(bmr);

    var tdee = bmr * level().f, imp = st.unit !== 'met';
    var T = [['Lose weight', tdee - 500, imp ? 'about 1 lb a week' : 'about 0.45 kg a week'], ['Maintain', tdee, 'hold your weight'], ['Gain slowly', tdee + 300, 'a small surplus']], th = '';
    T.forEach(function (t) {
      var low = t[1] < bmr;
      th += '<div class="bf-cmp"><span class="k">' + t[0] + '<span class="bm-sub">' + t[2] + (low ? '' : '') + '</span></span><span class="v">' + commas(r0(t[1])) + ' kcal</span></div>' + (low ? '<p class="bm-flag">Below your BMR — too aggressive to sustain. Try the <a href="/calorie-calculator/">calorie calculator</a> for a safe pace.</p>' : '');
    });
    $('bmTargets').innerHTML = th;
    $('bmTargetsH').textContent = 'Daily targets at ' + level().name.toLowerCase() + ' activity';

    if (st.adv) {
      var adv = '<div class="bf-cmp"><span class="k">Per kg of body weight</span><span class="v">' + (Math.round(bmr / W * 10) / 10) + ' kcal</span></div>';
      if (bf != null) adv += '<div class="bf-cmp"><span class="k">Per kg of lean mass</span><span class="v">' + (Math.round(bmr / (W * (1 - bf / 100)) * 10) / 10) + ' kcal</span></div>';
      adv += '<div class="bf-cmp"><span class="k">Per minute</span><span class="v">' + (Math.round(bmr / 1440 * 100) / 100) + ' kcal</span></div>';
      adv += '<p class="res-tip adv-tip">BMR is measured fasted, rested and warm. <strong>RMR</strong> (resting metabolic rate) is measured under looser conditions and usually reads 5–10% higher — the equations above estimate BMR, and are normally used as RMR too.</p>';
      $('bmAdvOut').innerHTML = adv; $('bmAdvOut').style.display = '';
    } else $('bmAdvOut').style.display = 'none';
    $('bmBody').style.display = '';
  }

  /* ---------- events ---------- */
  ['bmAge', 'bmBf'].forEach(function (id) { $(id).addEventListener('input', solve); });
  ['bmHcm', 'bmHft', 'bmHin'].forEach(function (id) { $(id).addEventListener('input', function () { keep.H = null; solve(); }); });
  ['bmWkg', 'bmWlb', 'bmWst', 'bmWlb2'].forEach(function (id) { $(id).addEventListener('input', function () { keep.W = null; solve(); }); });
  $('bmSexSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.sex = b.getAttribute('data-v'); [].forEach.call($('bmSexSeg').children, function (x) { x.classList.toggle('on', x === b); }); solve(); });
  $('bmUnitSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var v = b.getAttribute('data-v'); if (v === st.unit) return;
    var H = readH(), W = readW();
    st.unit = v; showUnit();
    ['bmHcm', 'bmHft', 'bmHin', 'bmWkg', 'bmWlb', 'bmWst', 'bmWlb2'].forEach(function (id) { $(id).value = ''; });
    writeH(H); writeW(W); keep.H = H > 0 ? H : null; keep.W = W > 0 ? W : null; solve();
  });
  $('bmAct').addEventListener('click', function (e) { var tr = e.target.closest('tr[data-l]'); if (!tr) return; st.level = tr.getAttribute('data-l'); solve(); });
  $('bmAct').addEventListener('keydown', function (e) { if (e.key !== 'Enter' && e.key !== ' ') return; var tr = e.target.closest('tr[data-l]'); if (!tr) return; e.preventDefault(); st.level = tr.getAttribute('data-l'); solve(); var n = $('bmAct').querySelector('tr[data-l="' + st.level + '"]'); if (n) n.focus(); });
  $('bmFormula').addEventListener('change', function () { st.want = this.value; solve(); });
  $('bmAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('bmAdvBtn').classList.toggle('open', st.adv);
    $('bmAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('bmAdvIn').style.display = st.adv ? '' : 'none';
    if (!st.adv) { st.want = 'mifflin'; $('bmFormula').value = 'mifflin'; $('bmBf').value = ''; }
    solve();
  });

  showUnit();
  solve();
};

/* =========================================================
   HOURS CALCULATOR — pure engine (no DOM). Loose clock parsing ("9", "915", "9:15a",
   "5p", "1730", "0830", noon, midnight), end-after-start resolution with overnight
   shifts, break parsing (minutes, "1h", "0:30", or a clock range such as "12-12:30"),
   payroll rounding, overtime (daily threshold + weekly threshold, no pyramiding) and
   minutes <-> decimal-hours <-> h:mm conversion.
   ========================================================= */
/* HOURS-ENGINE:START */
CalcThis.hoursEngine = (function () {
  /* ---------- clock parsing ---------- */
  /* -> null | { kind: 'am'|'pm'|'24'|'amb', min (kind != amb), h, m } ; amb = 1-12 with no marker */
  function parseClock(txt, c24) {
    var t = String(txt == null ? '' : txt).toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
    if (!t) return null;
    if (t === 'noon') return { kind: 'pm', min: 720, h: 12, m: 0 };
    if (t === 'midnight') return { kind: 'am', min: 0, h: 12, m: 0 };
    var m = /^(\d{1,2}):(\d{2})(a|am|p|pm)?$/.exec(t) || /^(\d{1,2})(\d{2})(a|am|p|pm)?$/.exec(t) || /^(\d{1,2})()(a|am|p|pm)?$/.exec(t);
    if (!m) return null;
    var hs = m[1], h = parseInt(hs, 10), mi = m[2] ? parseInt(m[2], 10) : 0, mk = m[3] ? m[3].charAt(0) : '';
    if (mi > 59) return null;
    if (mk) {
      if (h < 1 || h > 12) return null;
      return { kind: mk === 'p' ? 'pm' : 'am', min: (h % 12) * 60 + (mk === 'p' ? 720 : 0) + mi, h: h, m: mi };
    }
    var lead = /^0\d/.test(hs);
    if (c24 || h >= 13 || lead || h === 0) {
      if (h > 24 || (h === 24 && mi > 0)) return null;
      return { kind: '24', min: h * 60 + mi, h: h, m: mi };
    }
    if (h < 1 || h > 12) return null;
    return { kind: 'amb', h: h, m: mi };
  }
  function fmtClock(min, c24) {
    var d = ((min % 1440) + 1440) % 1440, h = Math.floor(d / 60), m = d % 60, mm = (m < 10 ? '0' : '') + m;
    if (c24) return (h < 10 ? '0' : '') + h + ':' + mm;
    return ((h % 12) || 12) + ':' + mm + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  function ambHalf(p) { return (p.h === 12 || p.h <= 4) ? 1 : 0; }           // workday guess: 12 and 1-4 are afternoon, 5-11 morning

  /* a single clock time -> minutes in the day (for the dates mode) */
  function single(txt, c24, half) {
    var p = parseClock(txt, c24); if (!p) return null;
    if (p.kind !== 'amb') return { min: p.min % 1440, label: fmtClock(p.min, c24), amb: false };
    if (half == null) half = ambHalf(p);
    var min = (p.h % 12) * 60 + p.m + half * 720;
    return { min: min, label: fmtClock(min, c24), amb: true };
  }

  /* start + end text -> { ok, sMin, eMin, dur, sLabel, eLabel, sAmb, eAmb, next } ; an end that is not later than the start belongs to the next day */
  function resolve(sTxt, eTxt, o) {
    o = o || {};
    var s = parseClock(sTxt, o.c24), e = parseClock(eTxt, o.c24);
    if (!s || !e) return { ok: false, s: s, e: e };
    var sMin, eMin, sAmb = s.kind === 'amb', eAmb = e.kind === 'amb';
    if (sAmb) { var half = o.sHalf != null ? o.sHalf : ambHalf(s); sMin = (s.h % 12) * 60 + s.m + half * 720; } else sMin = s.min;
    if (eAmb) {
      var base = (e.h % 12) * 60 + e.m;
      if (o.eHalf != null) { eMin = base + o.eHalf * 720; while (eMin < sMin) eMin += 1440; }
      else { var c = [base, base + 720, base + 1440, base + 2160], i = 0; while (i < c.length - 1 && c[i] <= sMin) i++; eMin = c[i]; }
    } else {
      eMin = e.min;
      if (eMin < sMin) eMin += 1440;
    }
    return { ok: true, sMin: sMin, eMin: eMin, dur: eMin - sMin, sLabel: fmtClock(sMin, o.c24), eLabel: fmtClock(eMin, o.c24), sAmb: sAmb, eAmb: eAmb, next: eMin >= 1440 };
  }

  /* ---------- breaks ---------- */
  /* "30", "30 min", "1h", "0:30", "15, 15", "12-12:30", "12:00 to 12:30" -> { total, items:[{min, from, to}], err } */
  function parseBreaks(txt, o) {
    var out = { total: 0, items: [], err: '' };
    var t = String(txt == null ? '' : txt).trim();
    if (!t) return out;
    var parts = t.split(/\s*(?:,|;|\+|\band\b)\s*/i);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim(); if (!p) continue;
      var m, min = null, from = null, to = null;
      if ((m = /^(.+?)\s*(?:-|–|—|\bto\b)\s*(.+)$/i.exec(p))) {
        var r = resolve(m[1], m[2], o);
        if (r.ok) { min = r.dur; from = r.sMin % 1440; to = r.eMin; }
      }
      if (min === null && (m = /^(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)?$/i.exec(p))) min = parseFloat(m[1]);
      else if (min === null && (m = /^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)$/i.exec(p))) min = parseFloat(m[1]) * 60;
      else if (min === null && (m = /^(\d+):(\d{2})$/.exec(p)) && +m[2] < 60) min = +m[1] * 60 + +m[2];
      if (min === null || !isFinite(min) || min < 0) { out.err = p; return out; }
      out.items.push({ min: min, from: from, to: to });
      out.total += min;
    }
    return out;
  }

  /* ---------- rounding / formatting ---------- */
  function roundMin(min, rule) { return rule > 0 ? Math.round(min / rule) * rule : min; }
  function hm(min) {
    var r = Math.round(min), h = Math.floor(r / 60), m = r % 60;
    if (h === 0) return m + ' min';
    return commas(h) + ' h' + (m ? ' ' + m + ' min' : '');
  }
  function hmFull(min) { var r = Math.round(min), h = Math.floor(r / 60); return h === 0 ? (r % 60) + ' min' : commas(h) + ' h ' + (r % 60) + ' min'; }
  function colon(min) { var r = Math.round(min), m = r % 60; return Math.floor(r / 60) + ':' + (m < 10 ? '0' : '') + m; }
  function dec(min, dp) { return (min / 60).toFixed(dp == null ? 2 : dp); }
  function commas(s) { return String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- overtime ---------- */
  /* dayMins: array of worked minutes per day. opts: { weekly (hours or 0), daily (hours or 0) } -> { reg, ot } in minutes.
     Daily overtime comes off first; weekly overtime applies to what is left, so no hour is counted twice. */
  function overtime(dayMins, o) {
    var tot = 0, dayOT = 0, i;
    for (i = 0; i < dayMins.length; i++) {
      var d = dayMins[i] || 0; tot += d;
      if (o.daily > 0) dayOT += Math.max(0, d - o.daily * 60);
    }
    var regAfterDaily = tot - dayOT, wkOT = o.weekly > 0 ? Math.max(0, regAfterDaily - o.weekly * 60) : 0;
    var ot = dayOT + wkOT;
    return { total: tot, ot: ot, reg: tot - ot };
  }

  /* ---------- converting a duration ---------- */
  /* from: 'min' | 'dec' | 'hm' -> minutes (float) or null */
  function parseDuration(txt, from) {
    var t = String(txt == null ? '' : txt).trim().toLowerCase();
    t = /^\d+,\d{1,2}$/.test(t) ? t.replace(',', '.') : t.replace(/,/g, '');   // 7,75 is a decimal comma; 1,500 is a thousand
    if (!t) return null;
    var m;
    if (from === 'hm') {
      if ((m = /^(\d+):(\d{1,2})$/.exec(t))) return +m[2] < 60 ? +m[1] * 60 + +m[2] : null;
      if ((m = /^(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?)?$/.exec(t))) return parseFloat(m[1]) * 60 + (m[2] ? parseFloat(m[2]) : 0);
      if ((m = /^(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?$/.exec(t))) return parseFloat(m[1]);
      return null;
    }
    if (!/^\d+(?:\.\d+)?$|^\.\d+$/.test(t)) return null;
    var v = parseFloat(t);
    return from === 'dec' ? v * 60 : v;
  }

  return { parseClock: parseClock, fmtClock: fmtClock, single: single, resolve: resolve, parseBreaks: parseBreaks, roundMin: roundMin, hm: hm, hmFull: hmFull, colon: colon, dec: dec, commas: commas, overtime: overtime, parseDuration: parseDuration };
})();
/* HOURS-ENGINE:END */

/* =========================================================
   CalcThis.initHoursCalc() — hours worked / hours between / weekly hours / minutes<->hours.
   Differentiator vs. calculator.net, CalculatorSoup, Gigacalculator, Inch Calculator and
   Clockify's time card (all checked live: bare numbers, AM/PM dropdowns, no picture of the
   shift): the site's own masked digit time field with the AM/PM toggle inside it (type 9 or
   915 — the colon fills itself), split shifts, breaks as minutes or as a clock range, a
   24-hour shift ribbon with the breaks cut out (overnight wraps), every format at once (h:mm,
   decimal, minutes) with payroll rounding shown before/after, and a Convert mode with a
   decimal-hour ruler. Go advanced = 24-hour clock, rounding (5 / 6 / 15 min), hourly rate,
   daily/weekly overtime. Time fields are the Time Calculator's .time-field / .ap-seg
   component, identical in every mode. Engine: CalcThis.hoursEngine. No shared state. */
CalcThis.initHoursCalc = function () {
  var E = CalcThis.hoursEngine;
  var $ = function (id) { return document.getElementById(id); };
  var st = { mode: 'shift', adv: false, c24: false, round: 0, conv: 'min' };
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dpS = null, dpE = null;

  function setHint(m) { var h = $('hrHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  function numOf(id) { var v = parseFloat(($(id).value + '').trim()); return isNaN(v) || v < 0 ? 0 : v; }
  function money(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  /* ---------- masked h:mm digit field + AM/PM toggle (same logic as the Time Calculator; 24-hour variant added) ---------- */
  function splitDigits(raw) {
    var d = ('' + raw).replace(/\D/g, '').slice(0, 4);
    if (!d) return { empty: true };
    var lim = st.c24 ? '2' : '1';
    if (d[0] > lim) return { hDig: '0' + d[0], mDig: d.slice(1, 3), hourDone: true };
    if (st.c24 && d[0] === '2' && d.length >= 2 && d[1] > '3') return { hDig: '02', mDig: d.slice(1, 3), hourDone: true };
    if (d.length === 1) return { hDig: d, mDig: '', hourDone: false };
    return { hDig: d.slice(0, 2), mDig: d.slice(2, 4), hourDone: true };
  }
  function refreshGhost(f) {
    var s = splitDigits(f.input.value);
    var val = s.empty ? '' : (s.hourDone ? s.hDig + ':' + s.mDig : s.hDig);
    if (val !== f.input.value) f.input.value = val;
    var hc = s.empty ? '' : s.hDig, mc = s.empty ? '' : s.mDig, cells = [hc[0], hc[1], ':', mc[0], mc[1]], html = '';
    for (var i = 0; i < 5; i++) {
      if (i === 2) html += '<span class="g-sep">:</span>';
      else if (cells[i] != null) html += '<span class="g-on">' + cells[i] + '</span>';
      else html += '<span class="g-off">-</span>';
    }
    f.ghost.innerHTML = html;
  }
  /* minutes after midnight, or null while the field is empty / not a valid time */
  function fieldMin(f) {
    var s = splitDigits(f.input.value);
    if (s.empty) return null;
    var h = +s.hDig, md = s.mDig, m = md.length === 0 ? 0 : (md.length === 1 ? (+md) * 10 : +md);
    if (m > 59) return null;
    if (st.c24) return h > 23 ? null : h * 60 + m;
    if (h < 1 || h > 12) return null;
    var base = h % 12; if (f.ap === 'pm') base += 12;
    return base * 60 + m;
  }
  function paintAp(f) { [].forEach.call(f.seg.children, function (b) { b.classList.toggle('on', b.getAttribute('data-ap') === f.ap); }); }
  var GHOST = '<span class="g-off">-</span><span class="g-off">-</span><span class="g-sep">:</span><span class="g-off">-</span><span class="g-off">-</span>';
  var APBTNS = '<button type="button" data-ap="am">AM</button><button type="button" data-ap="pm">PM</button>';
  /* full-size field (Time Calculator's elapsed-time look) */
  function tfFull(label, defAp, withNow) {
    return '<div class="fld hr-tf" data-ap="' + defAp + '"><span class="lab">' + label + (withNow ? '<button type="button" class="linkbtn hr-now">Now</button>' : '') + '</span>' +
      '<div class="time-field"><div class="time-box"><div class="time-ghost" aria-hidden="true">' + GHOST + '</div>' +
      '<input class="time-digits" type="text" inputmode="numeric" autocomplete="off" maxlength="5" aria-label="' + label.replace(/<[^>]*>/g, '') + '"></div>' +
      '<div class="seg ap-seg">' + APBTNS + '</div></div><div class="hr-info"></div></div>';
  }
  function wire(tf) {
    var seg = tf.querySelector('.ap-seg');
    tf._f = { input: tf.querySelector('.time-digits'), ghost: tf.querySelector('.time-ghost'), seg: seg, ap: tf.getAttribute('data-ap'), info: tf.querySelector('.hr-info') };
    paintAp(tf._f); return tf._f;
  }
  function wireAll(root) { [].forEach.call(root.querySelectorAll('.hr-tf'), function (tf) { if (!tf._f) wire(tf); }); }
  function setField(tf, text, ap) { var f = tf._f; f.input.value = text; if (ap) f.ap = ap; refreshGhost(f); paintAp(f); }
  function clearField(tf) { setField(tf, '', tf.getAttribute('data-ap')); }
  function nowParts() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), mm = (m < 10 ? '0' : '') + m;
    var h12 = (h % 12) || 12;
    return st.c24 ? { t: (h < 10 ? '0' : '') + h + ':' + mm, ap: h < 12 ? 'am' : 'pm' } : { t: (h12 < 10 ? '0' : '') + h12 + ':' + mm, ap: h < 12 ? 'am' : 'pm' };
  }
  function setInfo(tf, txt) { if (tf._f.info) tf._f.info.textContent = txt || ''; }

  /* start + end fields -> { sMin, eMin, dur, next, sLabel, eLabel } (an end earlier than the start is the next day) */
  function pairOf(sTf, eTf) {
    var s = fieldMin(sTf._f), e = fieldMin(eTf._f);
    if (s == null || e == null) { setInfo(eTf, ''); return null; }
    var next = e < s; if (next) e += 1440;
    setInfo(eTf, next ? 'Ends the next day' : '');
    return { sMin: s, eMin: e, dur: e - s, next: next, sLabel: E.fmtClock(s, st.c24), eLabel: E.fmtClock(e, st.c24) };
  }

  /* ---------- shift mode ---------- */
  function addShift(sv, sap, ev, eap) {
    var n = $('hrShifts').children.length, row = document.createElement('div'); row.className = 'hr-shift';
    row.innerHTML = (n ? '<div class="hr-shifthead"><span>Shift ' + (n + 1) + '</span><button type="button" class="linkbtn hr-x">Remove</button></div>' : '') +
      tfFull('Start time' + (n ? '' : ''), 'am', n === 0) + tfFull('End time', 'pm', n === 0);
    $('hrShifts').appendChild(row);
    wireAll(row);
    var tfs = row.querySelectorAll('.hr-tf');
    if (sv != null) setField(tfs[0], sv, sap); if (ev != null) setField(tfs[1], ev, eap);
  }
  function renumber() { [].forEach.call($('hrShifts').children, function (row, i) { var h = row.querySelector('.hr-shifthead span'); if (h) h.textContent = 'Shift ' + (i + 1); }); }
  function clearShifts() { $('hrShifts').innerHTML = ''; }

  function ribbon(shifts, breaks) {
    var X0 = 12, W = 296, svg = '';
    function x(min) { return X0 + Math.max(0, Math.min(1440, min)) / 1440 * W; }
    svg += '<rect x="' + X0 + '" y="26" width="' + W + '" height="24" rx="6" fill="#EFE7D8"/>';
    [0, 6, 12, 18, 24].forEach(function (h) {
      var tx = x(h * 60), lab = h === 0 || h === 24 ? '12a' : (h === 12 ? '12p' : (h < 12 ? h + 'a' : (h - 12) + 'p'));
      svg += '<line x1="' + tx + '" y1="52" x2="' + tx + '" y2="58" stroke="var(--muted)" stroke-width="1.2"/>';
      svg += '<text x="' + tx + '" y="72" text-anchor="middle" font-size="12" font-weight="600" fill="var(--muted)">' + lab + '</text>';
    });
    function seg(a, b, fill, extra) { if (b > a) svg += '<rect x="' + x(a) + '" y="26" width="' + Math.max(1.5, x(b) - x(a)) + '" height="24" fill="' + fill + '"' + (extra || '') + '/>'; }
    shifts.forEach(function (r) {
      if (r.eMin - r.sMin >= 1440) { seg(0, 1440, 'var(--amber)'); return; }
      var s = r.sMin % 1440, e = r.eMin - (r.sMin - s);
      if (e <= 1440) seg(s, e, 'var(--amber)'); else { seg(s, 1440, 'var(--amber)'); seg(0, e - 1440, 'var(--amber)'); }
    });
    breaks.forEach(function (b) {
      if (b.from == null) return;
      var f = b.from, t = b.to;
      if (t <= 1440) seg(f, t, '#FCFAF6', ' stroke="var(--amber-deep)" stroke-width="1" stroke-dasharray="3 2"'); else { seg(f, 1440, '#FCFAF6'); seg(0, t - 1440, '#FCFAF6'); }
    });
    return '<svg viewBox="0 18 320 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="24-hour ribbon of the shift">' + svg + '</svg>';
  }
  function trows(rows) { return '<tbody>' + rows.map(function (r) { return '<tr' + (r[2] ? ' class="cur"' : '') + '><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody>'; }

  function empty(label) {
    $('hrBig').textContent = '—'; $('hrUnit').textContent = '';
    $('hrSub').textContent = label || 'Enter a start and an end time.';
    ['hrShiftOut', 'hrWeekOut', 'hrDatesOut', 'hrConvOut'].forEach(function (id) { $(id).style.display = 'none'; });
    var ml = { shift: 'Hours worked', week: 'Week total', dates: 'Hours between', convert: 'Duration' }[st.mode];
    $('hrMVal').textContent = '—'; $('hrResLab').textContent = ml; $('hrMLab').textContent = ml;
  }
  function show(big, sub, mlab) {
    $('hrBig').textContent = big; $('hrUnit').textContent = '';
    $('hrSub').textContent = sub; $('hrMVal').textContent = big; $('hrMLab').textContent = mlab; $('hrResLab').textContent = mlab;
    $('hrMVal').style.fontSize = '';
  }
  function plain(n) { return String(Math.round(n * 1000) / 1000); }
  function cash(n) { return '$' + (Math.abs(n - Math.round(n)) < 0.005 ? Math.round(n).toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); }
  /* with an hourly rate, the sticky bar shows the sum: 40h × $22 = $880 */
  function mbarPay(regMin, otMin, mult) {
    var rate = numOf('hrRate'); if (!(st.adv && rate > 0)) return;
    var total = regMin + otMin, pay = regMin / 60 * rate + otMin / 60 * rate * mult;
    var val = plain(total / 60) + 'h × ' + cash(rate) + ' = ' + cash(pay);
    $('hrMLab').textContent = otMin > 0 ? 'Hourly rate (+ overtime ×' + mult + ')' : 'Hourly rate';
    $('hrMVal').textContent = val; $('hrMVal').style.fontSize = val.length > 22 ? '16px' : '';
  }
  function payRow(rows, minutes, label) {
    var rate = numOf('hrRate');
    if (st.adv && rate > 0) rows.push([label || 'Pay at ' + money(rate) + '/h', money(minutes / 60 * rate), true]);
  }

  function solveShift() {
    var rows = [].slice.call($('hrShifts').children), shifts = [], total = 0;
    rows.forEach(function (row) {
      var tfs = row.querySelectorAll('.hr-tf'), r = pairOf(tfs[0], tfs[1]);
      if (r) { shifts.push(r); total += r.dur; }
    });
    var b = E.parseBreaks($('hrBreak').value, { c24: st.c24 }), hint = '';
    if (b.err) { hint = 'Couldn’t read the break “' + b.err + '” — try 30, 1h or 12:00-12:30.'; b = { total: 0, items: [] }; }
    if (!shifts.length) { empty('Enter a start and an end time.'); setHint(hint); return; }
    var brk = b.total, net = total - brk;
    if (net < 0) { hint = hint || 'Your breaks are longer than the shift.'; net = 0; brk = total; }
    setHint(hint);
    var rounded = E.roundMin(net, st.round);
    show(E.hm(rounded), '= ' + E.dec(rounded) + ' decimal hours · ' + E.commas(Math.round(rounded)) + ' minutes', 'Hours worked');
    var t = [];
    shifts.forEach(function (r, i) { t.push([(shifts.length > 1 ? 'Shift ' + (i + 1) + ' · ' : '') + r.sLabel + ' → ' + r.eLabel + (r.next ? ' (next day)' : ''), E.hmFull(r.dur)]); });
    if (brk > 0) t.push(['Breaks', '− ' + E.hmFull(brk)]);
    t.push(['Hours and minutes', E.hmFull(net), true]);
    t.push(['Decimal hours', E.dec(net)]);
    t.push(['Total minutes', E.commas(Math.round(net))]);
    if (st.round > 0) t.push(['Rounded to ' + st.round + ' min', E.colon(rounded) + ' · ' + E.dec(rounded) + ' h']);
    payRow(t, rounded); mbarPay(rounded, 0, 1);
    $('hrShiftTbl').innerHTML = trows(t);
    $('hrRibbon').innerHTML = ribbon(shifts, b.items) +
      '<div class="hr-key"><span><i class="k-w"></i>Worked</span>' + (b.items.some(function (x) { return x.from != null; }) ? '<span><i class="k-b"></i>Break</span>' : '') +
      (b.items.some(function (x) { return x.from == null; }) ? '<span>− ' + E.hm(b.items.filter(function (x) { return x.from == null; }).reduce(function (a, x) { return a + x.min; }, 0)) + ' of breaks (no clock time given)</span>' : '') + '</div>';
    var tip = '';
    if (total >= 1440) tip = 'That’s a span of a day or more — for dates use the “Dates” tab.';
    else if (rounded >= 12 * 60) tip = 'A shift of ' + E.hm(rounded) + ' — double-check the AM/PM on the times above.';
    $('hrShiftTip').textContent = tip; $('hrShiftTip').style.display = tip ? '' : 'none';
    ['hrWeekOut', 'hrDatesOut', 'hrConvOut'].forEach(function (id) { $(id).style.display = 'none'; });
    $('hrShiftOut').style.display = '';
  }

  /* ---------- week mode ---------- */
  function buildWeek() {
    var h = '';
    DAYS.forEach(function (d) {
      h += '<div class="hr-day"><div class="hr-daylab">' + d + '</div>' + tfFull('Start time', 'am', false) + tfFull('End time', 'pm', false) +
        '<label class="fld"><span class="lab">Unpaid break</span><div class="inp"><input class="hr-bin" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="e.g. 30" aria-label="' + d + ' break"></div></label></div>';
    });
    $('hrWeekRows').innerHTML = h; wireAll($('hrWeekRows'));
  }
  function solveWeek() {
    var days = [], mins = [], nDays = 0, hint = '', rows = [].slice.call($('hrWeekRows').children);
    rows.forEach(function (row, i) {
      var tfs = row.querySelectorAll('.hr-tf'), r = pairOf(tfs[0], tfs[1]), net = 0, worked = false;
      if (r) {
        var b = E.parseBreaks(row.querySelector('.hr-bin').value, { c24: st.c24 }), brk = b.err ? 0 : b.total;
        if (b.err && !hint) hint = 'Couldn’t read the break on ' + DAYS[i] + ' (“' + b.err + '”).';
        net = Math.max(0, r.dur - brk); if (brk > r.dur && !hint) hint = 'The break on ' + DAYS[i] + ' is longer than the shift.';
        net = E.roundMin(net, st.round); worked = true; nDays++;
      }
      days.push({ d: DAYS[i], net: net, worked: worked, r: r }); mins.push(net);
    });
    setHint(hint);
    if (!nDays) { empty('Enter a start and an end time for at least one day.'); return; }
    var otw = st.adv ? numOf('hrOtW') : 0, otd = st.adv ? numOf('hrOtD') : 0, mult = st.adv && numOf('hrOtM') > 0 ? numOf('hrOtM') : 1.5;
    var ot = E.overtime(mins, { weekly: otw, daily: otd });
    show(E.hm(ot.total), '= ' + E.dec(ot.total) + ' decimal hours · ' + nDays + (nDays === 1 ? ' day' : ' days') + ' worked', 'Week total');
    var t = [];
    days.forEach(function (d) { if (d.worked) t.push([d.d + ' · ' + d.r.sLabel + ' → ' + d.r.eLabel, E.colon(d.net) + ' · ' + E.dec(d.net)]); });
    t.push(['Total hours', E.hmFull(ot.total), true]);
    t.push(['Decimal hours', E.dec(ot.total)]);
    if (st.adv && (otw > 0 || otd > 0)) { t.push(['Regular hours', E.hmFull(ot.reg)]); t.push(['Overtime hours (×' + mult + ')', E.hmFull(ot.ot)]); }
    var rate = numOf('hrRate');
    if (st.adv && rate > 0) t.push(['Gross pay', money(ot.reg / 60 * rate + ot.ot / 60 * rate * mult), true]);
    mbarPay(ot.reg, ot.ot, mult);
    $('hrWeekTbl').innerHTML = trows(t);
    var maxH = Math.max(10, Math.ceil(Math.max.apply(null, mins) / 60)), X0 = 14, BW = 30, GAP = 12, Y0 = 118, HH = 90, svg = '';
    function y(h) { return Y0 - h / maxH * HH; }
    svg += '<line x1="8" y1="' + y(8) + '" x2="312" y2="' + y(8) + '" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 3"/>';
    svg += '<text x="312" y="' + (y(8) - 4) + '" text-anchor="end" font-size="12" font-weight="600" fill="var(--muted)">8 h</text>';
    days.forEach(function (d, i) {
      var bx = X0 + i * (BW + GAP), h = d.net / 60;
      if (h > 0) {
        var base = Math.min(h, 8); svg += '<rect x="' + bx + '" y="' + y(base) + '" width="' + BW + '" height="' + (Y0 - y(base)) + '" rx="3" fill="var(--spruce)"/>';
        if (h > 8) svg += '<rect x="' + bx + '" y="' + y(h) + '" width="' + BW + '" height="' + (y(8) - y(h)) + '" rx="3" fill="var(--amber)"/>';
        svg += '<text x="' + (bx + BW / 2) + '" y="' + (y(h) - 5) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">' + (Math.round(h * 100) / 100) + '</text>';
      }
      svg += '<text x="' + (bx + BW / 2) + '" y="136" text-anchor="middle" font-size="12" font-weight="600" fill="var(--muted)">' + d.d + '</text>';
    });
    $('hrWeekChart').innerHTML = '<svg viewBox="0 0 320 142" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hours worked each day">' + svg + '</svg><div class="hr-key"><span><i class="k-reg"></i>Up to 8 h</span><span><i class="k-o"></i>Over 8 h</span></div>';
    var tip = '';
    if (st.adv && otw > 0 && ot.ot > 0) tip = 'Overtime starts after ' + otw + ' h in the week' + (otd > 0 ? ' or ' + otd + ' h in a day' : '') + '. Rules differ by employer and place — check yours.';
    $('hrWeekTip').textContent = tip; $('hrWeekTip').style.display = tip ? '' : 'none';
    ['hrShiftOut', 'hrDatesOut', 'hrConvOut'].forEach(function (id) { $(id).style.display = 'none'; });
    $('hrWeekOut').style.display = '';
  }

  /* ---------- dates mode ---------- */
  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function pickDate(dp) { if (dp) { var d = dp.getDate(); return d ? midnight(d) : null; } return null; }
  function dateTime(day, min) { return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(min / 60), min % 60); }
  function fmtDT(day, min) { return DOW[day.getDay()] + ' ' + day.getDate() + ' ' + MON[day.getMonth()] + ' ' + day.getFullYear() + ', ' + E.fmtClock(min, st.c24); }
  function solveDates() {
    var sTf = $('hrDST').querySelector('.hr-tf'), eTf = $('hrDET').querySelector('.hr-tf');
    var sd = pickDate(dpS), ed = pickDate(dpE);
    if (!sd || !ed) { empty('Pick a start date and an end date.'); setHint(''); return; }
    var sBlank = !sTf._f.input.value.trim(), eBlank = !eTf._f.input.value.trim();
    var s = sBlank ? 0 : fieldMin(sTf._f), e = eBlank ? 0 : fieldMin(eTf._f);
    if (s == null || e == null) { empty('Enter the times like 9:00 and pick AM or PM.'); setHint(''); return; }
    var a = dateTime(sd, s), b = dateTime(ed, e), mins = Math.round((b - a) / 60000);
    if (mins < 0) { empty('The end is before the start.'); setHint('The end is before the start — check the dates and times.'); return; }
    setHint('');
    var rounded = E.roundMin(mins, st.round), dd = Math.floor(rounded / 1440), rem = rounded % 1440;
    show(E.hm(rounded), '= ' + E.dec(rounded) + ' decimal hours · ' + E.commas(Math.round(rounded)) + ' minutes', 'Hours between');
    var t = [[fmtDT(sd, s) + ' → ' + fmtDT(ed, e), E.hmFull(mins)], ['Hours and minutes', E.hmFull(rounded), true], ['Decimal hours', E.dec(rounded)], ['Total minutes', E.commas(Math.round(rounded))]];
    if (dd > 0) t.push(['Days and hours', dd + (dd === 1 ? ' day' : ' days') + (rem ? ' ' + E.hm(rem) : '')]);
    var wall = Math.round((Date.UTC(ed.getFullYear(), ed.getMonth(), ed.getDate(), 0, e) - Date.UTC(sd.getFullYear(), sd.getMonth(), sd.getDate(), 0, s)) / 60000);
    if (wall !== mins) t.push(['Daylight-saving change', (mins - wall > 0 ? '+' : '−') + E.hm(Math.abs(mins - wall)) + ' included']);
    if (st.round > 0) t.push(['Rounded to ' + st.round + ' min', E.colon(rounded)]);
    payRow(t, rounded); mbarPay(rounded, 0, 1);
    $('hrDatesTbl').innerHTML = trows(t);
    var n = Math.round((ed - sd) / 86400000) + 1, svg = '', CW = 296;
    if (n <= 45) {
      var cw = CW / n;
      for (var i = 0; i < n; i++) {
        var from = i === 0 ? s : 0, to = i === n - 1 ? e : 1440;
        svg += '<rect x="' + (12 + i * cw + 0.5) + '" y="14" width="' + (cw - 1) + '" height="30" rx="3" fill="#EFE7D8"/>';
        if (to > from) svg += '<rect x="' + (12 + i * cw + 0.5 + from / 1440 * (cw - 1)) + '" y="14" width="' + Math.max(1.5, (to - from) / 1440 * (cw - 1)) + '" height="30" rx="3" fill="var(--amber)"/>';
      }
    } else svg += '<rect x="12" y="14" width="' + CW + '" height="30" rx="6" fill="var(--amber)"/>';
    svg += '<text x="12" y="62" font-size="12" font-weight="600" fill="var(--muted)">' + sd.getDate() + ' ' + MON[sd.getMonth()] + '</text><text x="308" y="62" text-anchor="end" font-size="12" font-weight="600" fill="var(--muted)">' + ed.getDate() + ' ' + MON[ed.getMonth()] + '</text>';
    svg += '<text x="160" y="62" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink-soft)">' + n + (n === 1 ? ' calendar day' : ' calendar days') + '</text>';
    $('hrDatesBar').innerHTML = '<svg viewBox="0 0 320 68" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Span between the two date-times">' + svg + '</svg>';
    ['hrShiftOut', 'hrWeekOut', 'hrConvOut'].forEach(function (id) { $(id).style.display = 'none'; });
    $('hrDatesOut').style.display = '';
  }

  /* ---------- convert mode ---------- */
  function solveConv() {
    setHint('');
    var raw = $('hrConvVal').value.trim();
    if (!raw) { empty('Type a number of minutes, decimal hours or h:mm.'); return; }
    var mins = E.parseDuration(raw, st.conv);
    if (mins === null) { empty('Couldn’t read that.'); setHint(st.conv === 'hm' ? 'Type it like 7:45 or 7h 45m.' : 'Type a plain number, like ' + (st.conv === 'dec' ? '7.75' : '465') + '.'); return; }
    if (mins > 1e7) { empty('That’s too large.'); setHint('Try a smaller number.'); return; }
    show(E.hm(mins), '= ' + E.dec(mins) + ' decimal hours · ' + E.commas(Math.round(mins * 100) / 100) + ' minutes', 'Duration');
    var t = [['Hours and minutes', E.hmFull(mins), true], ['As h:mm', E.colon(mins)], ['Decimal hours', (mins / 60).toFixed(4).replace(/0{1,2}$/, '')], ['Minutes', E.commas(Math.round(mins * 100) / 100)], ['Seconds', E.commas(Math.round(mins * 60))]];
    if (mins >= 1440) t.push(['Days and hours', Math.floor(mins / 1440) + ' d' + (Math.round(mins % 1440) ? ' ' + E.hm(mins % 1440) : '')]);
    $('hrConvTbl').innerHTML = trows(t);
    var frac = (mins % 60) / 60, whole = Math.floor(mins / 60), svg = '', X0 = 14, W = 292, mx = X0 + frac * W;
    svg += '<rect x="' + X0 + '" y="26" width="' + W + '" height="14" rx="7" fill="#EFE7D8"/><rect x="' + X0 + '" y="26" width="' + Math.max(0, frac * W) + '" height="14" rx="7" fill="var(--spruce)" opacity=".85"/>';
    [[0, '0', '0'], [15, '15', '.25'], [30, '30', '.5'], [45, '45', '.75'], [60, '60', '1']].forEach(function (k) {
      var tx = X0 + k[0] / 60 * W;
      svg += '<line x1="' + tx + '" y1="22" x2="' + tx + '" y2="44" stroke="var(--ink)" stroke-width="1.2" opacity=".45"/>';
      svg += '<text x="' + tx + '" y="58" text-anchor="middle" font-size="12" font-weight="600" fill="var(--muted)">' + k[1] + ' min</text>';
      svg += '<text x="' + tx + '" y="74" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink-soft)">' + k[2] + ' h</text>';
    });
    svg += '<polygon points="' + mx + ',24 ' + (mx - 6) + ',10 ' + (mx + 6) + ',10" fill="var(--amber)"/>';
    $('hrRuler').innerHTML = '<svg viewBox="0 0 320 82" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Position within the hour">' + svg + '</svg><div class="hr-key"><span>' + whole + ' whole ' + (whole === 1 ? 'hour' : 'hours') + ' + the marked part of the next hour</span></div>';
    ['hrShiftOut', 'hrWeekOut', 'hrDatesOut'].forEach(function (id) { $(id).style.display = 'none'; });
    $('hrConvOut').style.display = '';
  }

  function render() {
    if (st.mode === 'shift') solveShift();
    else if (st.mode === 'week') solveWeek();
    else if (st.mode === 'dates') solveDates();
    else solveConv();
  }

  /* ---------- events ---------- */
  function setSeg(id, v) { [].forEach.call($(id).children, function (b) { b.classList.toggle('on', b.getAttribute('data-v') === String(v)); }); }
  function setMode(m) {
    st.mode = m; setSeg('hrModeSeg', m);
    $('hrShiftIn').style.display = m === 'shift' ? '' : 'none'; $('hrWeekIn').style.display = m === 'week' ? '' : 'none';
    $('hrDatesIn').style.display = m === 'dates' ? '' : 'none'; $('hrConvIn').style.display = m === 'convert' ? '' : 'none';
    $('hrAdvRow').style.display = m === 'convert' ? 'none' : '';
    $('hrAdvIn').style.display = st.adv && m !== 'convert' ? '' : 'none';
    $('hrOtBox').style.display = m === 'week' ? '' : 'none';
    $('hrClockFld').style.display = m === 'convert' ? 'none' : '';
    $('hrCardH').textContent = { shift: 'Hours worked', week: 'Weekly hours', dates: 'Hours between dates', convert: 'Convert hours and minutes' }[m];
    setHint(''); render();
  }
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.p-hours')) return;
    if (t.classList.contains('time-digits')) { var tf = t.closest('.hr-tf'); if (tf && tf._f) refreshGhost(tf._f); render(); return; }
    if (t.classList.contains('hr-bin') || /^hr(Break|Rate|OtW|OtD|OtM|ConvVal)$/.test(t.id)) render();
  });
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest || !t.closest('.p-hours')) return;
    var apb = t.closest('.ap-seg button');
    if (apb) { var tf = apb.closest('.hr-tf'); if (tf && tf._f && apb.getAttribute('data-ap') !== tf._f.ap) { tf._f.ap = apb.getAttribute('data-ap'); paintAp(tf._f); render(); } return; }
    var now = t.closest('.hr-now');
    if (now) { var tf2 = now.closest('.hr-tf'), np = nowParts(); setField(tf2, np.t, np.ap); render(); }
  });
  $('hrModeSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setMode(b.getAttribute('data-v')); });
  $('hrConvSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.conv = b.getAttribute('data-v'); setSeg('hrConvSeg', st.conv); $('hrConvVal').placeholder = { min: 'e.g. 465', dec: 'e.g. 7.75', hm: 'e.g. 7:45' }[st.conv]; render(); });
  $('hrClockSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var to24 = b.getAttribute('data-v') === '24'; if (to24 === st.c24) return;
    var all = [].slice.call(document.querySelectorAll('.hr-tf')), old = all.map(function (tf) { return fieldMin(tf._f); });   // read in the old mode
    st.c24 = to24; setSeg('hrClockSeg', to24 ? '24' : '12'); document.body.classList.toggle('c24', to24);
    all.forEach(function (tf, i) {
      var m = old[i]; if (m == null) { refreshGhost(tf._f); return; }
      var h = Math.floor(m / 60), mi = m % 60, mm = (mi < 10 ? '0' : '') + mi;
      if (to24) setField(tf, (h < 10 ? '0' : '') + h + ':' + mm, tf._f.ap); else { var h12 = (h % 12) || 12; setField(tf, (h12 < 10 ? '0' : '') + h12 + ':' + mm, h < 12 ? 'am' : 'pm'); }
    });
    render();
  });
  $('hrRound').addEventListener('change', function () { st.round = parseInt(this.value, 10) || 0; render(); });
  $('hrAddShift').addEventListener('click', function () { addShift(); var ins = $('hrShifts').querySelectorAll('.time-digits'); ins[ins.length - 2].focus(); });
  $('hrShifts').addEventListener('click', function (e) { var x = e.target.closest('.hr-x'); if (!x) return; var row = x.closest('.hr-shift'); row.parentNode.removeChild(row); renumber(); render(); });
  $('hrTry').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-ex'), rows = { day: [['09:00', 'am', '05:00', 'pm']], night: [['10:00', 'pm', '06:00', 'am']], split: [['08:00', 'am', '12:00', 'pm'], ['01:30', 'pm', '05:30', 'pm']] }[k], br = { day: '30', night: '30', split: '' }[k];
    if (st.c24) { st.c24 = false; document.body.classList.remove('c24'); setSeg('hrClockSeg', '12'); }
    clearShifts(); rows.forEach(function (r) { addShift(r[0], r[1], r[2], r[3]); }); $('hrBreak').value = br;
    render();
  });
  $('hrWeekFill').addEventListener('click', function () {
    if (st.c24) { st.c24 = false; document.body.classList.remove('c24'); setSeg('hrClockSeg', '12'); }
    [].forEach.call($('hrWeekRows').children, function (row, i) {
      var tfs = row.querySelectorAll('.hr-tf'), on = i < 5;
      if (on) { setField(tfs[0], '09:00', 'am'); setField(tfs[1], '05:30', 'pm'); } else { clearField(tfs[0]); clearField(tfs[1]); }
      row.querySelector('.hr-bin').value = on ? '30' : '';
    });
    render();
  });
  $('hrWeekClear').addEventListener('click', function () {
    [].forEach.call($('hrWeekRows').querySelectorAll('.hr-tf'), clearField);
    [].forEach.call($('hrWeekRows').querySelectorAll('.hr-bin'), function (i) { i.value = ''; });
    render();
  });
  $('hrAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('hrAdvBtn').classList.toggle('open', st.adv);
    $('hrAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('hrAdvIn').style.display = st.adv ? '' : 'none';
    if (!st.adv) {
      st.round = 0; $('hrRound').value = '0';
      ['hrRate', 'hrOtW', 'hrOtD', 'hrOtM'].forEach(function (id) { $(id).value = ''; });
    }
    setMode(st.mode);
  });

  /* ---------- init ---------- */
  $('hrDST').innerHTML = tfFull('Start time <span class="unit">12:00 AM if blank</span>', 'am', false);
  $('hrDET').innerHTML = tfFull('End time <span class="unit">12:00 AM if blank</span>', 'pm', false);
  wireAll($('hrDST')); wireAll($('hrDET'));
  addShift(); buildWeek();
  if (window.Datepicker) {
    var opt = { format: 'd MM yyyy', autohide: true, weekStart: 0, todayHighlight: true };
    dpS = new Datepicker($('hrDS'), opt); dpE = new Datepicker($('hrDE'), opt);
    [$('hrDS'), $('hrDE')].forEach(function (el) { el.addEventListener('changeDate', render); });
  }
  ['input', 'change'].forEach(function (ev) { [$('hrDS'), $('hrDE')].forEach(function (el) { el.addEventListener(ev, render); }); });
  setMode('shift');
};

/* =========================================================
   MATH · TRIANGLE CALCULATOR
   Right-triangle / Pythagorean mode (any 2 values) and any-triangle mode (any 3
   of a, b, c, A, B, C — SSS / SAS / ASA / AAS / SSA incl. the ambiguous case),
   all from ONE set of boxes (no mode dropdown). Inputs accept numbers, √5, 2√3,
   sqrt(5), pi/4. Differentiators: a live to-scale triangle diagram (optional
   heights / medians / incircle / circumcircle), both triangles of an SSA
   ambiguity, special-triangle recognition (30-60-90, 45-45-90, Pythagorean
   triples), a "squares on the sides" picture for right triangles, plain-English
   steps shown by default. Go advanced (real panel above the button): diagram
   overlays, rounding (decimals / significant figures); results gain medians,
   in/circumradius, exterior angles, coordinates, centres, DMS / radians, Copy.
   ========================================================= */
/* TRIANGLE-ENGINE:START */
CalcThis.triEngine = (function () {
  var PI = Math.PI;
  function cl(x) { return Math.max(-1, Math.min(1, x)); }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  function fromSides(a, b, c) {
    var m = Math.max(a, b, c), e = 1e-9 * m;
    if (a + b - c <= e || a + c - b <= e || b + c - a <= e) return null;
    var A = Math.acos(cl((b * b + c * c - a * a) / (2 * b * c)));
    var B = Math.acos(cl((a * a + c * c - b * b) / (2 * a * c)));
    return { a: a, b: b, c: c, A: A, B: B, C: PI - A - B };
  }
  function up(k) { return k.toUpperCase(); }
  function lo(k) { return k.toLowerCase(); }

  // g: any of a b c A B C (angles in radians), all > 0. Needs exactly the keys of one 3-value set.
  function solve3(g) {
    var sides = ['a', 'b', 'c'].filter(function (k) { return g[k] != null; });
    var angs = ['A', 'B', 'C'].filter(function (k) { return g[k] != null; });
    if (!sides.length) return { err: 'needside' };
    if (sides.length === 3) {
      var t = fromSides(g.a, g.b, g.c);
      return t ? { sols: [t], method: 'SSS' } : { err: 'ineq' };
    }
    var i;
    if (angs.length >= 2) {
      var X = angs[0], Y = angs[1];
      var T = ['A', 'B', 'C'].filter(function (k) { return k !== X && k !== Y; })[0];
      var third = PI - g[X] - g[Y];
      if (third <= 1e-9) return { err: 'angsum' };
      var ang = {}; ang[X] = g[X]; ang[Y] = g[Y]; ang[T] = third;
      var s = sides[0], r = g[s] / Math.sin(ang[up(s)]);
      var res = {};
      ['A', 'B', 'C'].forEach(function (k) { res[k] = ang[k]; res[lo(k)] = r * Math.sin(ang[k]); });
      return { sols: [res], method: (s === lo(T)) ? 'ASA' : 'AAS' };
    }
    var s1 = sides[0], s2 = sides[1], Ag = angs[0];
    var thirdSide = ['a', 'b', 'c'].filter(function (k) { return k !== s1 && k !== s2; })[0];
    if (lo(Ag) === thirdSide) { // SAS
      var x = Math.sqrt(g[s1] * g[s1] + g[s2] * g[s2] - 2 * g[s1] * g[s2] * Math.cos(g[Ag]));
      var o = {}; o[s1] = g[s1]; o[s2] = g[s2]; o[thirdSide] = x;
      var t2 = fromSides(o.a, o.b, o.c);
      return t2 ? { sols: [t2], method: 'SAS' } : { err: 'ineq' };
    }
    // SSA: Ag is opposite one of the two known sides
    var p = g[lo(Ag)], qk = (lo(Ag) === s1) ? s2 : s1, q = g[qk];
    var sq = q * Math.sin(g[Ag]) / p;
    if (sq > 1 + 1e-9) return { err: 'ssa' };
    sq = (Math.abs(sq - 1) < 1e-9) ? 1 : Math.min(1, sq);
    var Q1 = Math.asin(sq), cands = [Q1];
    if (Math.abs(sq - 1) > 1e-9 && Math.abs(Q1 - PI / 2) > 1e-9) cands.push(PI - Q1);
    var sols = [];
    cands.forEach(function (Q) {
      var thd = PI - g[Ag] - Q;
      if (thd <= 1e-9) return;
      var Tk = ['A', 'B', 'C'].filter(function (k) { return k !== Ag && k !== up(qk); })[0];
      var rr = p / Math.sin(g[Ag]);
      var o2 = {}; o2[Ag] = g[Ag]; o2[up(qk)] = Q; o2[Tk] = thd;
      o2[lo(Ag)] = p; o2[qk] = q; o2[lo(Tk)] = rr * Math.sin(thd);
      sols.push(o2);
    });
    if (!sols.length) return { err: 'ssa' };
    return { sols: sols, method: 'SSA' };
  }

  function consistent(sol, g, K) {
    var ok = true;
    ['a', 'b', 'c'].forEach(function (k) { if (g[k] != null && Math.abs(sol[k] - g[k]) > 0.002 * Math.max(g[k], sol[k])) ok = false; });
    ['A', 'B', 'C'].forEach(function (k) { if (g[k] != null && Math.abs(sol[k] - g[k]) > 0.05 * PI / 180) ok = false; });
    if (K != null) { var ar = 0.5 * sol.a * sol.b * Math.sin(sol.C); if (Math.abs(ar - K) > 0.002 * Math.max(ar, K)) ok = false; }
    return ok;
  }

  // g: given values (sides >0, angles rad). opts.right: C = 90 deg is implied; g.K = area (right mode only).
  function solve(g, opts) {
    opts = opts || {};
    var K = (g.K != null) ? g.K : null;
    var h = {}; ['a', 'b', 'c', 'A', 'B', 'C'].forEach(function (k) { if (g[k] != null) h[k] = g[k]; });
    var derived = null;
    if (opts.right) {
      if (h.C != null && Math.abs(h.C - PI / 2) > 1e-9) return { err: 'rightC' };
      h.C = PI / 2;
      if (K != null) {
        var first = ['a', 'b', 'c', 'A', 'B'].filter(function (k) { return h[k] != null; })[0];
        if (!first) return { err: 'need2' };
        var la = null, lb = null;
        if (first === 'a') { la = h.a; lb = 2 * K / h.a; }
        else if (first === 'b') { lb = h.b; la = 2 * K / h.b; }
        else if (first === 'c') {
          var d = h.c * h.c - 4 * K;
          if (d < -1e-9 * h.c * h.c) return { err: 'areaHyp' };
          d = Math.sqrt(Math.max(0, d));
          var sm = Math.sqrt(h.c * h.c + 4 * K);
          la = (sm - d) / 2; lb = (sm + d) / 2;
        } else if (first === 'A') {
          if (h.A >= PI / 2 - 1e-9) return { err: 'angsum' };
          lb = Math.sqrt(2 * K / Math.tan(h.A)); la = lb * Math.tan(h.A);
        } else {
          if (h.B >= PI / 2 - 1e-9) return { err: 'angsum' };
          la = Math.sqrt(2 * K / Math.tan(h.B)); lb = la * Math.tan(h.B);
        }
        derived = { a: la, b: lb };
        if (h.a == null) h.a = la;
        if (h.b == null) h.b = lb;
      }
    }
    var keys = ['a', 'b', 'c', 'A', 'B', 'C'].filter(function (k) { return h[k] != null; });
    if (keys.length < 3) return { err: 'few' };
    var combos = [], i, j, l;
    for (i = 0; i < keys.length; i++) for (j = i + 1; j < keys.length; j++) for (l = j + 1; l < keys.length; l++) {
      var c3 = [keys[i], keys[j], keys[l]];
      if (c3.some(function (k) { return k === lo(k); })) combos.push(c3);
    }
    if (!combos.length) return { err: 'needside' };
    var best = null, firstErr = null;
    for (i = 0; i < combos.length; i++) {
      var sub = {}; combos[i].forEach(function (k) { sub[k] = h[k]; });
      var r = solve3(sub);
      if (r.sols) { best = r; break; }
      if (!firstErr) firstErr = r;
    }
    if (!best) return firstErr;
    var sols = best.sols.filter(function (s) { return consistent(s, h, K); });
    if (!sols.length) return { err: 'inconsistent' };
    sols = sols.filter(function (s) { return Math.min(s.a, s.b, s.c) / Math.max(s.a, s.b, s.c) > 1e-7; });
    if (!sols.length) return { err: 'extreme' };
    return { sols: sols, method: best.method, derived: derived };
  }

  function metrics(t) {
    var a = t.a, b = t.b, c = t.c, A = t.A, B = t.B, C = t.C;
    var K = 0.5 * a * b * Math.sin(C), p = a + b + c, s = p / 2;
    var m = {
      a: a, b: b, c: c, A: A, B: B, C: C, K: K, p: p, s: s,
      ha: 2 * K / a, hb: 2 * K / b, hc: 2 * K / c,
      ma: 0.5 * Math.sqrt(2 * b * b + 2 * c * c - a * a),
      mb: 0.5 * Math.sqrt(2 * a * a + 2 * c * c - b * b),
      mc: 0.5 * Math.sqrt(2 * a * a + 2 * b * b - c * c),
      r: K / s, R: a * b * c / (4 * K)
    };
    var PA = { x: 0, y: 0 }, PB = { x: c, y: 0 }, PC = { x: b * Math.cos(A), y: b * Math.sin(A) };
    m.PA = PA; m.PB = PB; m.PC = PC;
    m.cen = { x: (PA.x + PB.x + PC.x) / 3, y: (PA.y + PB.y + PC.y) / 3 };
    m.inc = { x: (a * PA.x + b * PB.x + c * PC.x) / p, y: (a * PA.y + b * PB.y + c * PC.y) / p };
    var D = 2 * (PA.x * (PB.y - PC.y) + PB.x * (PC.y - PA.y) + PC.x * (PA.y - PB.y));
    var sa = PA.x * PA.x + PA.y * PA.y, sb = PB.x * PB.x + PB.y * PB.y, sc = PC.x * PC.x + PC.y * PC.y;
    m.cir = { x: (sa * (PB.y - PC.y) + sb * (PC.y - PA.y) + sc * (PA.y - PB.y)) / D, y: (sa * (PC.x - PB.x) + sb * (PA.x - PC.x) + sc * (PB.x - PA.x)) / D };
    // classification
    var mx = Math.max(a, b, c), mn = Math.min(a, b, c), e = 1e-9 * mx;
    var eq = function (x, y) { return Math.abs(x - y) <= e; };
    m.sideType = (eq(a, b) && eq(b, c)) ? 'equilateral' : (eq(a, b) || eq(b, c) || eq(a, c)) ? 'isosceles' : 'scalene';
    var s2 = [a * a, b * b, c * c].sort(function (x, y) { return x - y; });
    var dd = s2[0] + s2[1] - s2[2];
    m.angType = Math.abs(dd) <= 1e-9 * s2[2] ? 'right' : (dd > 0 ? 'acute' : 'obtuse');
    var deg = [A, B, C].map(function (x) { return x * 180 / PI; }).sort(function (x, y) { return x - y; });
    m.special = null;
    if (m.angType === 'right' && Math.abs(deg[0] - 30) < 1e-6 && Math.abs(deg[1] - 60) < 1e-6) m.special = '30-60-90';
    else if (m.angType === 'right' && Math.abs(deg[0] - 45) < 1e-6) m.special = '45-45-90';
    var sd = [a, b, c].sort(function (x, y) { return x - y; });
    m.triple = null;
    if (m.angType === 'right' && sd.every(function (x) { return x >= 1 && Math.abs(x - Math.round(x)) < 1e-9 * Math.max(1, x); })) {
      var ia = Math.round(sd[0]), ib = Math.round(sd[1]), ic = Math.round(sd[2]);
      var g = gcd(gcd(ia, ib), ic);
      m.triple = { base: [ia / g, ib / g, ic / g], k: g, ints: [ia, ib, ic] };
    }
    return m;
  }
  return { solve: solve, metrics: metrics };
})();
/* TRIANGLE-ENGINE:END */

CalcThis.initTriangleCalc = function () {
  var E = CalcThis.triEngine;
  var $ = function (id) { return document.getElementById(id); };
  if (!$('triFields')) return;
  var PI = Math.PI;
  var st = { mode: 'right', ang: 'deg', adv: false, sig: false, n: 4, sol: 0, show: { h: false, m: false, i: false, c: false } };
  var vals = { a: '', b: '', c: '', A: '', B: '', C: '', K: '' };
  var DEFS = {
    right: [['a', 'Leg a', 's'], ['b', 'Leg b', 's'], ['c', 'Hypotenuse c', 's'], ['A', 'Angle A', 'g'], ['B', 'Angle B', 'g'], ['K', 'Area', 'k']],
    any: [['a', 'Side a', 's'], ['b', 'Side b', 's'], ['c', 'Side c', 's'], ['A', 'Angle A', 'g'], ['B', 'Angle B', 'g'], ['C', 'Angle C', 'g']]
  };
  var ERR = {
    needside: 'Add at least one side length — angles alone can’t fix the size of a triangle.',
    ineq: 'No triangle has these sides: the two shorter sides must add up to more than the longest.',
    angsum: 'The angles must add up to less than 180° (90° in a right triangle, so A and B must each be under 90°).',
    ssa: 'No triangle fits these values — the side opposite the angle is too short to reach.',
    inconsistent: 'These values don’t all fit the same triangle. Clear one of the boxes and try again.',
    rightC: 'In a right triangle C is always 90°.',
    areaHyp: 'That area is too large for a right triangle with this hypotenuse.',
    need2: 'Enter any 2 values: two lengths, a length and an angle, or the area with one more value.',
    extreme: 'These values are too far apart to solve reliably — the longest side is over ten million times the shortest.',
    few: ''
  };

  function setHint(m) { var h = $('triHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  function unitTxt() { var u = $('triUnit').value; return (u && u !== 'none') ? u : ''; }

  /* ---------- tiny safe expression parser: numbers, pi, √x, sqrt(x), + - * / ^, brackets, implicit × ---------- */
  function parse(raw) {
    var s = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/°/g, '').replace(/π/g, 'pi').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!s) return { empty: true };
    if (s.indexOf('.') < 0) s = s.replace(/,/g, '.');
    var toks = [], re = /(\d+\.?\d*(?:e[+\-]?\d+)?|\.\d+(?:e[+\-]?\d+)?)|(pi)|(sqrt)|(√)|([()+\-*\/^])/g, m, last = 0;
    while ((m = re.exec(s))) { if (m.index !== last) return { bad: true }; toks.push(m[1] ? { n: parseFloat(m[1]) } : { o: m[0] }); last = re.lastIndex; }
    if (last !== s.length || !toks.length) return { bad: true };
    var pos = 0;
    function peek() { return toks[pos]; }
    function isOp(t, o) { return t && t.o === o; }
    function startsAtom(t) { return t && (t.n != null || t.o === 'pi' || t.o === 'sqrt' || t.o === '√' || t.o === '('); }
    function expr() { var v = term(); while (peek() && (isOp(peek(), '+') || isOp(peek(), '-'))) { var o = toks[pos++].o; var r = term(); v = o === '+' ? v + r : v - r; } return v; }
    function term() {
      var v = unary();
      for (;;) {
        var t = peek();
        if (isOp(t, '*') || isOp(t, '/')) { pos++; var r = unary(); v = t.o === '*' ? v * r : v / r; }
        else if (startsAtom(t)) { v = v * pow(); }
        else break;
      }
      return v;
    }
    function unary() { if (isOp(peek(), '-')) { pos++; return -unary(); } if (isOp(peek(), '+')) { pos++; return unary(); } return pow(); }
    function pow() { var b = atom(); if (isOp(peek(), '^')) { pos++; return Math.pow(b, unary()); } return b; }
    function atom() {
      var t = toks[pos++];
      if (!t) throw 0;
      if (t.n != null) return t.n;
      if (t.o === 'pi') return PI;
      if (t.o === '(') { var v = expr(); if (!isOp(toks[pos], ')')) throw 0; pos++; return v; }
      if (t.o === 'sqrt' || t.o === '√') {
        var inner;
        if (isOp(peek(), '(')) { pos++; inner = expr(); if (!isOp(toks[pos], ')')) throw 0; pos++; }
        else { var n = toks[pos++]; if (!n) throw 0; if (n.n != null) inner = n.n; else if (n.o === 'pi') inner = PI; else throw 0; }
        if (inner < 0) throw 0;
        return Math.sqrt(inner);
      }
      throw 0;
    }
    try { var v = expr(); if (pos !== toks.length || !isFinite(v)) return { bad: true }; return { v: v }; } catch (e) { return { bad: true }; }
  }

  /* ---------- number formatting ---------- */
  function trim(s) { return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
  function fmt(x) {
    if (!isFinite(x)) return '—';
    if (Math.abs(x) < 1e-12) x = 0;
    var s;
    if (st.sig) {
      var v = Number(x.toPrecision(st.n));
      var mag = v === 0 ? 0 : Math.floor(Math.log10(Math.abs(v)));
      s = trim(v.toFixed(Math.max(0, st.n - 1 - mag)));
    } else s = trim(x.toFixed(st.n));
    if (s === '-0') s = '0';
    return s.replace('-', '−');
  }
  function degOf(r) { return r * 180 / PI; }
  function piForm(r) {
    var k = r / PI;
    for (var d = 1; d <= 12; d++) { var nn = k * d; if (Math.abs(nn - Math.round(nn)) < 1e-9 && Math.round(nn) !== 0) { var n = Math.round(nn); var top = (n === 1 ? '' : (n === -1 ? '−' : String(n).replace('-', '−'))) + 'π'; return d === 1 ? top : top + '/' + d; } }
    return null;
  }
  function angTxt(r) { return st.ang === 'deg' ? fmt(degOf(r)) + '°' : fmt(r) + ' rad'; }
  function dms(r) {
    var d = degOf(r), D = Math.floor(d + 1e-9), mm = (d - D) * 60, M = Math.floor(mm + 1e-9), S = Math.round((mm - M) * 60 * 100) / 100;
    if (S >= 60) { S -= 60; M++; } if (M >= 60) { M -= 60; D++; }
    return D + '° ' + M + '′ ' + trim(S.toFixed(2)) + '″';
  }
  function radTxt(r) { var p = piForm(r); return fmt(r) + ' rad' + (p ? ' = ' + p : ''); }
  function lenTxt(x) { return fmt(x) + (unitTxt() ? ' ' + unitTxt() : ''); }
  function areaTxt(x) { return fmt(x) + (unitTxt() ? ' ' + unitTxt() + '²' : ''); }
  function pt(p) { return '(' + fmt(p.x) + ', ' + fmt(p.y) + ')'; }

  /* ---------- fields ---------- */
  function buildFields() {
    var html = '';
    DEFS[st.mode].forEach(function (d) {
      var key = d[0], lab = d[1], kind = d[2], unit = kind === 's' ? unitTxt() : kind === 'k' ? (unitTxt() ? unitTxt() + '²' : '') : (st.ang === 'deg' ? '°' : 'rad');
      var ph = kind === 's' ? 'e.g. 3' : kind === 'k' ? 'e.g. 6' : (st.ang === 'deg' ? 'e.g. 45' : 'e.g. 0.785');
      html += '<div class="fld"><label class="lab" for="tri_' + key + '">' + lab + (unit ? ' <span class="unit">' + unit + '</span>' : '') + '</label>' +
        '<div class="inp"><input id="tri_' + key + '" data-k="' + key + '" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + ph + '" value="' + (vals[key] || '').replace(/"/g, '&quot;') + '"></div></div>';
    });
    if (st.mode === 'right') html += '<p class="tri-lock"><b>Angle C = ' + (st.ang === 'deg' ? '90°' : '1.5708 rad (π/2)') + '</b> — the right angle, always fixed. Legs a and b meet at C; c is the hypotenuse, opposite C.</p>';
    $('triFields').innerHTML = html;
    [].forEach.call($('triFields').querySelectorAll('input'), function (el) {
      el.addEventListener('input', function () { vals[el.getAttribute('data-k')] = el.value; render(); });
    });
  }
  function setVals(o) {
    Object.keys(vals).forEach(function (k) { vals[k] = o[k] != null ? String(o[k]) : ''; });
    buildFields(); render();
  }

  /* ---------- diagram ---------- */
  function diagram(m) {
    var W = 300, H = 250, padX = 40, padT = 30, padB = 30;
    var P = [m.PA, m.PB, m.PC];
    var minx = Math.min(P[0].x, P[1].x, P[2].x), maxx = Math.max(P[0].x, P[1].x, P[2].x), miny = Math.min(P[0].y, P[1].y, P[2].y), maxy = Math.max(P[0].y, P[1].y, P[2].y);
    if (st.show.c) { minx = Math.min(minx, m.cir.x - m.R); maxx = Math.max(maxx, m.cir.x + m.R); miny = Math.min(miny, m.cir.y - m.R); maxy = Math.max(maxy, m.cir.y + m.R); }
    var sc = Math.min((W - 2 * padX) / (maxx - minx || 1), (H - padT - padB) / (maxy - miny || 1));
    var ox = (W - (maxx - minx) * sc) / 2 - minx * sc, oy = H - padB - (H - padT - padB - (maxy - miny) * sc) / 2 + miny * sc;
    var X = function (p) { return ox + p.x * sc; }, Y = function (p) { return oy - p.y * sc; };
    var f1 = function (v) { return (Math.round(v * 10) / 10); };
    var A = { x: X(m.PA), y: Y(m.PA) }, B = { x: X(m.PB), y: Y(m.PB) }, C = { x: X(m.PC), y: Y(m.PC) };
    var G = { x: X(m.cen), y: Y(m.cen) };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Triangle drawn to scale">';
    var halo = 'paint-order="stroke" stroke="#FCFAF6" stroke-width="3.5" stroke-linejoin="round"';
    if (st.show.c) s += '<circle cx="' + f1(X(m.cir)) + '" cy="' + f1(Y(m.cir)) + '" r="' + f1(m.R * sc) + '" fill="none" stroke="#7A8F7B" stroke-width="1.5" stroke-dasharray="5 4"/>';
    if (st.show.i) s += '<circle cx="' + f1(X(m.inc)) + '" cy="' + f1(Y(m.inc)) + '" r="' + f1(m.r * sc) + '" fill="rgba(181,118,31,.10)" stroke="#B5761F" stroke-width="1.5"/>';
    s += '<polygon points="' + f1(A.x) + ',' + f1(A.y) + ' ' + f1(B.x) + ',' + f1(B.y) + ' ' + f1(C.x) + ',' + f1(C.y) + '" fill="rgba(31,77,63,.10)" stroke="#1F4D3F" stroke-width="2.4" stroke-linejoin="round"/>';
    function foot(p, q, r) { var dx = r.x - q.x, dy = r.y - q.y, t = ((p.x - q.x) * dx + (p.y - q.y) * dy) / (dx * dx + dy * dy); return { x: q.x + t * dx, y: q.y + t * dy }; }
    if (st.show.h) {
      [[A, B, C], [B, A, C], [C, A, B]].forEach(function (v) { var ft = foot(v[0], v[1], v[2]); s += '<line x1="' + f1(v[0].x) + '" y1="' + f1(v[0].y) + '" x2="' + f1(ft.x) + '" y2="' + f1(ft.y) + '" stroke="#B5761F" stroke-width="1.5" stroke-dasharray="4 3"/>'; });
    }
    if (st.show.m) {
      [[A, B, C], [B, A, C], [C, A, B]].forEach(function (v) { var mx = (v[1].x + v[2].x) / 2, my = (v[1].y + v[2].y) / 2; s += '<line x1="' + f1(v[0].x) + '" y1="' + f1(v[0].y) + '" x2="' + f1(mx) + '" y2="' + f1(my) + '" stroke="#7A8F7B" stroke-width="1.5" stroke-dasharray="2 3"/>'; });
    }
    // right-angle marker(s) + angle labels
    var V = [[A, B, C, 'A', m.A], [B, A, C, 'B', m.B], [C, A, B, 'C', m.C]];
    V.forEach(function (v) {
      var p = v[0], u1 = unitVec(p, v[1]), u2 = unitVec(p, v[2]);
      if (Math.abs(v[4] - PI / 2) < 1e-6) {
        var q = 11;
        s += '<path d="M' + f1(p.x + u1.x * q) + ' ' + f1(p.y + u1.y * q) + ' L' + f1(p.x + (u1.x + u2.x) * q) + ' ' + f1(p.y + (u1.y + u2.y) * q) + ' L' + f1(p.x + u2.x * q) + ' ' + f1(p.y + u2.y * q) + '" fill="none" stroke="#1F4D3F" stroke-width="1.6"/>';
      }
      var bis = { x: u1.x + u2.x, y: u1.y + u2.y }, bl = Math.hypot(bis.x, bis.y) || 1; bis = { x: bis.x / bl, y: bis.y / bl };
      var dist = Math.min(34, 14 + 26 / Math.max(0.35, Math.sin(v[4] / 2) * 1.6));
      var tx = p.x + bis.x * dist, ty = p.y + bis.y * dist;
      s += '<text x="' + f1(tx) + '" y="' + f1(ty + 4) + '" text-anchor="middle" font-size="12" fill="#6B5A44" ' + halo + '>' + (st.ang === 'deg' ? trim(degOf(v[4]).toFixed(2)) + '°' : trim(v[4].toFixed(3))) + '</text>';
      var out = { x: -bis.x, y: -bis.y };
      s += '<text x="' + f1(p.x + out.x * 15) + '" y="' + f1(p.y + out.y * 15 + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#241A11">' + v[3] + '</text>';
    });
    function unitVec(p, q) { var dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1; return { x: dx / l, y: dy / l }; }
    // side labels (outside)
    [[B, C, 'a', m.a, A], [A, C, 'b', m.b, B], [A, B, 'c', m.c, C]].forEach(function (e) {
      var mx = (e[0].x + e[1].x) / 2, my = (e[0].y + e[1].y) / 2, nx = -(e[1].y - e[0].y), ny = e[1].x - e[0].x, nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      var vx = e[4].x - mx, vy = e[4].y - my;
      if (nx * vx + ny * vy > 0) { nx = -nx; ny = -ny; }
      var anchor = Math.abs(nx) > 0.55 ? (nx > 0 ? 'start' : 'end') : 'middle';
      s += '<text x="' + f1(mx + nx * 11) + '" y="' + f1(my + ny * 11 + 4) + '" text-anchor="' + anchor + '" font-size="12" font-weight="600" fill="#B5761F" ' + halo + '>' + e[2] + ' = ' + fmt(e[3]) + '</text>';
    });
    s += '</svg>';
    return s;
  }

  function squares(m) {
    if (m.angType !== 'right') return '';
    var q = [m.a, m.b, m.c].sort(function (x, y) { return x - y; });
    var legs = [q[0], q[1]], hyp = q[2], S = 84, base = 98;
    var sa = legs[0] / hyp * S, sb = legs[1] / hyp * S, sc = S, gap = 28, x = 6;
    var s = '<svg viewBox="0 0 300 124" role="img" aria-label="Squares on the three sides">';
    function sq(x0, size, fill, lab) {
      return '<rect x="' + x0.toFixed(1) + '" y="' + (base - size).toFixed(1) + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" fill="' + fill + '" stroke="#241A11" stroke-opacity=".35"/>' +
        '<text x="' + (x0 + size / 2).toFixed(1) + '" y="118" text-anchor="middle" font-size="12" font-weight="600" fill="#241A11">' + lab + '</text>';
    }
    var tot = sa + sb + sc + 2 * gap; x = (300 - tot) / 2;
    s += sq(x, sa, 'rgba(181,118,31,.55)', fmt(legs[0] * legs[0]));
    s += '<text x="' + (x + sa + gap / 2).toFixed(1) + '" y="' + (base - 6) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#6B5A44">+</text>';
    x += sa + gap; s += sq(x, sb, 'rgba(31,77,63,.55)', fmt(legs[1] * legs[1]));
    s += '<text x="' + (x + sb + gap / 2).toFixed(1) + '" y="' + (base - 6) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#6B5A44">=</text>';
    x += sb + gap; s += sq(x, sc, 'rgba(36,26,17,.28)', fmt(hyp * hyp));
    return s + '</svg>';
  }

  /* ---------- steps ---------- */
  function stepsFor(sol, res, rightMode, m, gv) {
    var a = m.a, b = m.b, c = m.c, A = m.A, B = m.B, C = m.C, L = [], d = function (r) { return fmt(degOf(r)) + '°'; };
    var sq = function (x) { return fmt(x) + '²'; };
    if (rightMode) {
      if (gv.K != null && res.derived) L.push('Area = ½ × a × b, so the two legs are a = ' + fmt(res.derived.a) + ' and b = ' + fmt(res.derived.b) + '.');
      var legs = (gv.a != null || (res.derived)) && (gv.b != null || res.derived);
      if (legs) { L.push('Pythagorean theorem: c² = a² + b², so c = √(' + sq(a) + ' + ' + sq(b) + ') = √' + fmt(a * a + b * b) + ' = ' + fmt(c) + '.'); }
      else if (gv.c != null && (gv.a != null || gv.b != null)) {
        var kn = gv.a != null ? 'a' : 'b', ot = gv.a != null ? 'b' : 'a';
        L.push('Pythagorean theorem: ' + ot + '² = c² − ' + kn + '², so ' + ot + ' = √(' + sq(c) + ' − ' + sq(gv.a != null ? a : b) + ') = √' + fmt(c * c - (gv.a != null ? a * a : b * b)) + ' = ' + fmt(gv.a != null ? b : a) + '.');
      } else {
        var knA = gv.A != null ? 'A' : 'B';
        L.push((knA === 'A' ? 'B' : 'A') + ' = 90° − ' + knA + ' = ' + d(knA === 'A' ? B : A) + '.');
        L.push('Use sine, cosine and tangent: opposite = hypotenuse × sin(angle), adjacent = hypotenuse × cos(angle), opposite = adjacent × tan(angle). This gives a = ' + fmt(a) + ', b = ' + fmt(b) + ', c = ' + fmt(c) + '.');
      }
      if (legs || gv.c != null) {
        L.push('A = tan⁻¹(a ÷ b) = tan⁻¹(' + fmt(a) + ' ÷ ' + fmt(b) + ') = ' + d(A) + '.');
        L.push('B = 90° − A = ' + d(B) + '.');
      }
      L.push('Area = ½ × a × b = ½ × ' + fmt(a) + ' × ' + fmt(b) + ' = ' + fmt(m.K) + '.');
      return L;
    }
    var meth = res.method;
    if (meth === 'SSS') {
      L.push('Three sides known (SSS). Law of cosines: A = cos⁻¹((b² + c² − a²) ÷ 2bc) = ' + d(A) + '.');
      L.push('B = cos⁻¹((a² + c² − b²) ÷ 2ac) = ' + d(B) + '.');
      L.push('C = 180° − A − B = ' + d(C) + '.');
    } else if (meth === 'SAS') {
      L.push('Two sides and the angle between them (SAS). Law of cosines gives the third side from the other two and that angle.');
      L.push('Sides a, b, c = ' + fmt(a) + ', ' + fmt(b) + ', ' + fmt(c) + '.');
      L.push('The other angles come from the law of cosines: A = ' + d(A) + ', B = ' + d(B) + ', C = ' + d(C) + '.');
    } else if (meth === 'ASA' || meth === 'AAS') {
      L.push('Two angles and a side (' + meth + '). The third angle is 180° minus the other two: A = ' + d(A) + ', B = ' + d(B) + ', C = ' + d(C) + '.');
      L.push('Law of sines: a ÷ sin A = b ÷ sin B = c ÷ sin C. That gives a = ' + fmt(a) + ', b = ' + fmt(b) + ', c = ' + fmt(c) + '.');
    } else {
      L.push('Two sides and an angle not between them (SSA). Law of sines: sin(second angle) = other side × sin(known angle) ÷ side opposite it.');
      L.push('Angles A, B, C = ' + d(A) + ', ' + d(B) + ', ' + d(C) + '; sides a, b, c = ' + fmt(a) + ', ' + fmt(b) + ', ' + fmt(c) + '.');
      if (res.sols.length > 1) L.push('The sine matches two different angles (one acute, one obtuse), so there are two valid triangles — use the switch above the diagram.');
    }
    L.push('Area = ½ × a × b × sin C = ' + fmt(m.K) + '. Perimeter = a + b + c = ' + fmt(m.p) + '.');
    return L;
  }

  /* ---------- rendering ---------- */
  var last = null;
  function setEmpty(msg, hint) {
    $('triResBig').textContent = '—';
    $('triResSub').textContent = msg;
    $('triResLab').textContent = 'Area';
    $('triResults').style.display = 'none';
    $('triMLab').textContent = 'Area'; $('triMVal').textContent = '—'; $('triMDec').textContent = '';
    setHint(hint || '');
    last = null;
  }
  function render() {
    var right = st.mode === 'right', g = {}, filled = 0, firstBad = null, badKey = null, needBase = right ? 'Enter any 2 values: two lengths, a length and an angle, or the area with one more.' : 'Enter any 3 values (at least one side) — sides, angles, or a mix.';
    DEFS[st.mode].forEach(function (d) {
      var k = d[0], kind = d[2], p = parse(vals[k] || '');
      if (p.empty) return;
      if (p.bad) { if (!firstBad) { firstBad = d[1]; badKey = k; } return; }
      var v = p.v;
      if (kind === 'g') { if (st.ang === 'deg') v = v * PI / 180; }
      if (!(v > 0)) { if (!firstBad) { firstBad = d[1]; badKey = k; } return; }
      if (kind === 'g' && v >= PI - 1e-12) { if (!firstBad) { firstBad = d[1]; badKey = k; } return; }
      g[k] = v; filled++;
    });
    if (firstBad) { setEmpty(needBase, 'Can’t read “' + firstBad + '” yet — type a positive number like 3 or 2.5; angles must be under ' + (st.ang === 'rad' ? '3.14 rad' : '180°') + '.'); return; }
    var minVals = right ? 2 : 3;
    if (filled < minVals) { setEmpty(needBase, ''); return; }
    var res = E.solve(g, { right: right });
    if (res.err) { setEmpty(needBase, ERR[res.err] || 'These values don’t make a triangle.'); return; }
    setHint('');
    if (st.sol >= res.sols.length) st.sol = 0;
    var m = E.metrics(res.sols[st.sol]);
    last = { m: m, res: res, g: g };
    var typeTxt = (m.sideType === 'equilateral') ? 'equilateral' : m.angType + ' ' + m.sideType;
    var typeCap = typeTxt.charAt(0).toUpperCase() + typeTxt.slice(1) + ' triangle';
    $('triResLab').textContent = 'Area';
    $('triResBig').textContent = areaTxt(m.K);
    $('triResSub').textContent = typeCap + ' · perimeter ' + lenTxt(m.p);
    $('triMLab').textContent = 'Area'; $('triMVal').textContent = areaTxt(m.K); $('triMDec').textContent = ' · ' + typeTxt;
    $('triResults').style.display = '';

    // solution switch
    var sw = $('triSwitch');
    if (res.sols.length > 1) {
      sw.style.display = '';
      sw.innerHTML = '<button type="button" data-i="0" class="' + (st.sol === 0 ? 'on' : '') + '">Triangle 1</button><button type="button" data-i="1" class="' + (st.sol === 1 ? 'on' : '') + '">Triangle 2</button>';
    } else sw.style.display = 'none';

    $('triDia').innerHTML = diagram(m);

    // takeaway
    var tip = '', t = m.triple;
    if (m.special === '30-60-90') {
      var sh = Math.min(m.a, m.b, m.c);
      tip = 'A 30-60-90 triangle: sides are in the ratio 1 : √3 : 2 — short leg ' + fmt(sh) + ', long leg ' + fmt(sh * Math.sqrt(3)) + ', hypotenuse ' + fmt(sh * 2) + '.';
    } else if (m.special === '45-45-90') {
      var lg = Math.min(m.a, m.b, m.c);
      tip = 'A 45-45-90 triangle: sides are in the ratio 1 : 1 : √2 — both legs ' + fmt(lg) + ', hypotenuse ' + fmt(lg * Math.SQRT2) + '.';
    } else if (t) {
      var sd = t.ints;
      tip = t.k === 1 ? 'A ' + t.base.join('-') + ' right triangle — a Pythagorean triple (' + sd[0] + '² + ' + sd[1] + '² = ' + sd[2] + '²).' : 'A right triangle in the ' + t.base.join('-') + ' ratio (×' + t.k + ') — a multiple of a Pythagorean triple.';
    } else if (m.sideType === 'equilateral') tip = 'Equilateral: all three sides are equal and every angle is 60°.';
    else if (m.angType === 'right') { var qq = [m.a, m.b, m.c].sort(function (x, y) { return x - y; }); tip = 'A right triangle: ' + fmt(qq[0]) + '² + ' + fmt(qq[1]) + '² = ' + fmt(qq[0] * qq[0] + qq[1] * qq[1]) + ' = ' + fmt(qq[2]) + '².'; }
    else if (m.angType === 'obtuse') tip = 'Obtuse: one angle is more than 90°' + (m.sideType === 'isosceles' ? ', and two sides are equal.' : '.');
    else tip = 'Acute: all three angles are less than 90°' + (m.sideType === 'isosceles' ? ', and two sides are equal.' : '.');
    if (res.sols.length > 1) tip += ' These values fit two different triangles (the ambiguous SSA case) — switch between them above.';
    $('triTip').textContent = tip;

    // sides & angles
    var tb = '<thead><tr><th>Vertex</th><th>Angle</th><th>Opposite side</th></tr></thead><tbody>';
    [['A', m.A, 'a', m.a], ['B', m.B, 'b', m.b], ['C', m.C, 'c', m.c]].forEach(function (r) { tb += '<tr><td>' + r[0] + '</td><td>' + angTxt(r[1]) + '</td><td>' + r[2] + ' = ' + lenTxt(r[3]) + '</td></tr>'; });
    $('triTbl').innerHTML = tb + '</tbody>';
    var ms = '<tbody><tr><td>Area</td><td>' + areaTxt(m.K) + '</td></tr><tr><td>Perimeter p</td><td>' + lenTxt(m.p) + '</td></tr><tr><td>Semiperimeter s</td><td>' + lenTxt(m.s) + '</td></tr>' +
      '<tr><td>Height to side a (h<sub>a</sub>)</td><td>' + lenTxt(m.ha) + '</td></tr><tr><td>Height to side b (h<sub>b</sub>)</td><td>' + lenTxt(m.hb) + '</td></tr><tr><td>Height to side c (h<sub>c</sub>)</td><td>' + lenTxt(m.hc) + '</td></tr></tbody>';
    $('triMeas').innerHTML = ms;

    var sqs = squares(m);
    $('triSqWrap').style.display = sqs ? '' : 'none';
    $('triSq').innerHTML = sqs;

    $('triAdvOut').style.display = st.adv ? '' : 'none';
    if (st.adv) {
      var ex = '<tbody>' +
        '<tr><td>Median to a (m<sub>a</sub>)</td><td>' + lenTxt(m.ma) + '</td></tr><tr><td>Median to b (m<sub>b</sub>)</td><td>' + lenTxt(m.mb) + '</td></tr><tr><td>Median to c (m<sub>c</sub>)</td><td>' + lenTxt(m.mc) + '</td></tr>' +
        '<tr><td>Inradius r</td><td>' + lenTxt(m.r) + '</td></tr><tr><td>Circumradius R</td><td>' + lenTxt(m.R) + '</td></tr>' +
        '<tr><td>Exterior angle at A</td><td>' + angTxt(PI - m.A) + '</td></tr><tr><td>Exterior angle at B</td><td>' + angTxt(PI - m.B) + '</td></tr><tr><td>Exterior angle at C</td><td>' + angTxt(PI - m.C) + '</td></tr>' +
        '<tr><td>Vertices A · B · C</td><td>' + pt(m.PA) + ' · ' + pt(m.PB) + ' · ' + pt(m.PC) + '</td></tr>' +
        '<tr><td>Centroid</td><td>' + pt(m.cen) + '</td></tr><tr><td>Incenter</td><td>' + pt(m.inc) + '</td></tr><tr><td>Circumcenter</td><td>' + pt(m.cir) + '</td></tr></tbody>';
      $('triAdvTbl').innerHTML = ex;
      var an = '<thead><tr><th>Angle</th><th>Degrees</th><th>DMS</th><th>Radians</th></tr></thead><tbody>';
      [['A', m.A], ['B', m.B], ['C', m.C]].forEach(function (r) { an += '<tr><td>' + r[0] + '</td><td>' + fmt(degOf(r[1])) + '°</td><td>' + dms(r[1]) + '</td><td>' + radTxt(r[1]) + '</td></tr>'; });
      $('triAngTbl').innerHTML = an + '</tbody>';
    }
    var steps = stepsFor(res.sols[st.sol], res, right, m, g);
    $('triSteps').innerHTML = '<ul>' + steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
  }

  /* ---------- controls ---------- */
  function seg(id, attr, fn) {
    var el = $(id);
    [].forEach.call(el.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(el.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        fn(b.getAttribute(attr));
      });
    });
  }
  seg('triModeSeg', 'data-m', function (v) { st.mode = v; st.sol = 0; buildFields(); render(); });
  seg('triAngSeg', 'data-v', function (v) {
    st.ang = v;
    ['A', 'B', 'C'].forEach(function (k) {
      if (!vals[k]) return;
      var p = parse(vals[k]);
      if (p.v == null) return;
      var nv = v === 'rad' ? p.v * PI / 180 : p.v * 180 / PI;
      vals[k] = String(Number(nv.toPrecision(12)));
    });
    buildFields(); render();
  });
  $('triUnit').addEventListener('change', function () { buildFields(); render(); });
  $('triSwitch').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.sol = parseInt(b.getAttribute('data-i'), 10); render(); });
  [].forEach.call($('triOn').querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () { var k = b.getAttribute('data-k'); st.show[k] = !st.show[k]; b.classList.toggle('on', st.show[k]); b.setAttribute('aria-pressed', st.show[k] ? 'true' : 'false'); render(); });
  });
  seg('triRoundSeg', 'data-v', function (v) { st.sig = v === 'sig'; $('triPlacesLab').textContent = st.sig ? 'significant figures' : 'decimal places'; $('triPlaces').setAttribute('max', st.sig ? '12' : '10'); readRound(); render(); });
  function readRound() {
    var v = parseInt($('triPlaces').value, 10);
    var lim = st.sig ? [1, 12] : [0, 10];
    st.n = isNaN(v) ? 4 : Math.max(lim[0], Math.min(lim[1], v));
  }
  $('triPlaces').addEventListener('input', function () { readRound(); render(); });
  [].forEach.call($('triEx').querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () {
      var ex = b.getAttribute('data-ex');
      st.ang = 'deg'; st.sol = 0;
      [].forEach.call($('triAngSeg').querySelectorAll('button'), function (x) { x.classList.toggle('on', x.getAttribute('data-v') === 'deg'); });
      var setMode = function (m) { st.mode = m; [].forEach.call($('triModeSeg').querySelectorAll('button'), function (x) { x.classList.toggle('on', x.getAttribute('data-m') === m); }); };
      if (ex === '345') { setMode('right'); setVals({ a: 3, b: 4 }); }
      else if (ex === '369') { setMode('right'); setVals({ a: 5, A: 30 }); }
      else if (ex === '454') { setMode('right'); setVals({ a: 7, A: 45 }); }
      else if (ex === 'ssa') { setMode('any'); setVals({ a: 8, b: 10, A: 40 }); }
      else { setMode('any'); setVals({ a: 5, b: 6, c: 7 }); }
    });
  });
  $('triAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('triAdvBtn').classList.toggle('open', st.adv);
    $('triAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('triAdvIn').style.display = st.adv ? '' : 'none';
    if (!st.adv) { st.show = { h: false, m: false, i: false, c: false }; st.sig = false; st.n = 4; $('triPlaces').value = ''; [].forEach.call($('triOn').querySelectorAll('button'), function (b) { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); [].forEach.call($('triRoundSeg').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === 'dp'); }); $('triPlacesLab').textContent = 'decimal places'; }
    render();
  });
  $('triCopy').addEventListener('click', function () {
    if (!last) return;
    var m = last.m, lines = ['Triangle: a = ' + lenTxt(m.a) + ', b = ' + lenTxt(m.b) + ', c = ' + lenTxt(m.c), 'Angles: A = ' + angTxt(m.A) + ', B = ' + angTxt(m.B) + ', C = ' + angTxt(m.C),
      'Area = ' + areaTxt(m.K), 'Perimeter = ' + lenTxt(m.p), 'Heights: ha = ' + lenTxt(m.ha) + ', hb = ' + lenTxt(m.hb) + ', hc = ' + lenTxt(m.hc),
      'Medians: ma = ' + lenTxt(m.ma) + ', mb = ' + lenTxt(m.mb) + ', mc = ' + lenTxt(m.mc), 'Inradius = ' + lenTxt(m.r) + ', Circumradius = ' + lenTxt(m.R)];
    var btn = $('triCopy'), txt = lines.join('\n');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy results'; }, 1600); };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
  });

  buildFields();
  render();
};

/* =========================================================
   FINANCE · MORTGAGE CALCULATOR  (body.p-loan)
   One amortization engine (CalcThis.loanEngine, pure — no DOM) plus the
   page code. The same engine will drive the Loan and Auto Loan pages.
   ========================================================= */
/* LOAN-ENGINE:START */
CalcThis.loanEngine = (function () {
  // monthly interest rate from a yearly percentage; 'semi' = Canadian semi-annual compounding
  function mrate(apr, comp) { var a = apr / 100; return comp === 'semi' ? Math.pow(1 + a / 2, 1 / 6) - 1 : a / 12; }
  function pmt(P, r, n) { if (n <= 0) return 0; if (r === 0) return P / n; return P * r / (1 - Math.pow(1 + r, -n)); }
  // o: { P, apr, n, comp, extra, yAmt, yMonth, oAmt, oAt, startMonth }
  // Payment k falls in calendar month (startMonth + k) % 12; the first payment is one month after the start.
  function run(o) {
    var r = mrate(o.apr, o.comp), pay = pmt(o.P, r, o.n), bal = o.P, rows = [], tot = 0, k = 0, cross = 0, sm = o.startMonth || 0;
    while (bal > 0.005 && k < o.n) {
      k++;
      var start = bal, intr = start * r, sp = pay - intr, ex = o.extra || 0;
      if (o.yAmt && ((sm + k) % 12) === (o.yMonth % 12)) ex += o.yAmt;
      if (o.oAmt && k === o.oAt) ex += o.oAmt;
      var pr = sp + ex;
      if (pr >= start - 0.005 || k === o.n) pr = start;
      bal = start - pr;
      if (!cross && sp > intr) cross = k;
      tot += intr;
      rows.push({ k: k, start: start, intr: intr, sp: sp, pr: pr, pay: intr + pr, bal: bal < 0.005 ? 0 : bal });
    }
    return { pay: pay, r: r, rows: rows, count: k, totInt: tot, totPaid: tot + o.P, cross: cross };
  }
  // half a monthly payment every 2 weeks, interest accruing at apr/26
  function biweekly(P, apr, pay) {
    var rr = apr / 100 / 26, bal = P, tot = 0, k = 0, half = pay / 2;
    while (bal > 0.005 && k < 5000) {
      k++;
      var i = bal * rr; tot += i;
      var pr = half - i; if (pr <= 0) return null;
      if (pr >= bal) pr = bal;
      bal -= pr;
    }
    return { periods: k, months: k * 12 / 26, interest: tot };
  }
  // ---- generic periodic engine (Loan / Auto Loan pages) ----
  // ppy = payments per year; comp = compounding periods per year (number) or 'c' for continuous.
  // Per-payment rate = (1 + effective annual rate)^(1/ppy) - 1, where the effective rate comes from the compounding rule.
  function prate(apr, ppy, comp) {
    var a = apr / 100;
    if (comp === ppy) return a / ppy;
    var eff = comp === 'c' ? Math.exp(a) - 1 : Math.pow(1 + a / comp, comp) - 1;
    return Math.pow(1 + eff, 1 / ppy) - 1;
  }
  // o: { P, apr, ppy, comp, n, extra } — extra is added to every payment
  function runP(o) {
    var r = prate(o.apr, o.ppy, o.comp), pay = pmt(o.P, r, o.n), bal = o.P, rows = [], tot = 0, k = 0, cross = 0, ex = o.extra || 0;
    while (bal > 0.005 && k < o.n) {
      k++;
      var start = bal, intr = start * r, sp = pay - intr, pr = sp + ex;
      if (pr >= start - 0.005 || k === o.n) pr = start;
      bal = start - pr;
      if (!cross && sp > intr) cross = k;
      tot += intr;
      rows.push({ k: k, start: start, intr: intr, sp: sp, pr: pr, pay: intr + pr, bal: bal < 0.005 ? 0 : bal });
    }
    return { pay: pay, r: r, rows: rows, count: k, totInt: tot, totPaid: tot + o.P, cross: cross };
  }
  // the loan a given payment can carry
  function borrowable(pay, r, n) { return r === 0 ? pay * n : pay * (1 - Math.pow(1 + r, -n)) / r; }
  // nominal yearly rate (%) at which `net` cash received equals n level payments of `pay`
  function aprFromCash(net, pay, n, ppy) {
    if (!(net > 0) || !(pay > 0)) return 0;
    if (net / n >= pay) return 0;
    var lo = 0, hi = 1, i;
    while (pmt(net, hi, n) < pay && hi < 1e6) hi *= 2;
    for (i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (pmt(net, mid, n) < pay) lo = mid; else hi = mid; }
    return (lo + hi) / 2 * ppy * 100;
  }
  // ---- vehicle purchase math (Auto Loan page) ----
  // o: { price, inc, down, trade, owed, taxPct, fees, inLoan, taxFull }
  // sales tax is charged on price minus trade-in (or the full price when taxFull); cash incentives do not lower the taxed amount
  function autoDeal(o) {
    var tb = o.taxFull ? o.price : Math.max(0, o.price - o.trade);
    var tax = tb * (o.taxPct || 0) / 100, net = o.trade - o.owed, tf = tax + o.fees;
    var L = o.price - o.inc - o.down - net + (o.inLoan ? tf : 0);
    return { tax: tax, taxBase: tb, net: net, negEq: net < 0 ? -net : 0, L: L, upfront: o.down + (o.inLoan ? 0 : tf), tf: tf };
  }
  // the vehicle price a given loan amount supports (inverse of autoDeal)
  function autoMaxPrice(o, L) {
    var t = (o.taxPct || 0) / 100, net = o.trade - o.owed, a = o.taxFull ? 0 : o.trade;
    if (!o.inLoan) return L + o.inc + o.down + net;
    var p = (L + o.inc + o.down + net - o.fees + t * a) / (1 + t);
    if (p < a) p = L + o.inc + o.down + net - o.fees;
    return p;
  }
  return { mrate: mrate, pmt: pmt, run: run, biweekly: biweekly, prate: prate, runP: runP, borrowable: borrowable, aprFromCash: aprFromCash, autoDeal: autoDeal, autoMaxPrice: autoMaxPrice };
})();
/* LOAN-ENGINE:END */

CalcThis.initMortgageCalc = function () {
  var E = CalcThis.loanEngine;
  var $ = function (id) { return document.getElementById(id); };
  if (!$('lnPrice')) return;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var now = new Date();
  var st = { downU: 'pct', taxU: 'pct', comp: 'us', adv: false, sched: 'yearly' };
  var last = null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function comma(x) { return x.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  function mon(x) { return '$' + x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function mon0(x) { return '$' + comma(Math.round(x)); }
  function kfmt(x) { return x >= 1e6 ? '$' + (Math.round(x / 1e5) / 10) + 'M' : x >= 1e3 ? '$' + Math.round(x / 1e3) + 'k' : '$' + Math.round(x); }
  function pct(x) { return (Math.round(x * 100) / 100) + '%'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function span(m) {
    var y = Math.floor(m / 12), mo = Math.round(m - y * 12);
    if (mo === 12) { y++; mo = 0; }
    if (!y && !mo) return '0 months';
    return (y ? plural(y, 'year') : '') + (y && mo ? ' ' : '') + (mo ? plural(mo, 'month') : '');
  }
  function dateTxt(sm, sy, k) { var t = sm + k; return MON[t % 12] + ' ' + (sy + Math.floor(t / 12)); }

  /* ---------- reading fields ---------- */
  function read(id) {
    var el = $(id); if (!el) return { e: true };
    var s = (el.value || '').trim(); if (!s) return { e: true };
    var t = s.replace(/[$,%\s]/g, '');
    if (/^[-+.]*$/.test(t)) return { e: true, partial: true };
    var v = Number(t);
    return isNaN(v) || !isFinite(v) ? { bad: true } : { v: v };
  }
  var LABELS = { lnPrice: 'Home price', lnDown: 'Down payment', lnRate: 'Interest rate', lnTerm: 'Loan term', lnExtra: 'Extra payment', lnStartY: 'Start year', lnTax: 'Property tax', lnIns: 'Home insurance', lnPmi: 'PMI', lnHoa: 'HOA', lnOther: 'Other costs', lnGrow: 'Yearly cost increase', lnYAmt: 'Yearly extra', lnOAmt: 'One-time extra', lnOY: 'One-time year' };
  var EXS = { lnPrice: '400000', lnDown: '20', lnRate: '6.5', lnTerm: '30', lnExtra: '200', lnStartY: '2026', lnTax: '1.2', lnIns: '1500', lnPmi: '0.8', lnHoa: '50', lnOther: '600', lnGrow: '3', lnYAmt: '5000', lnOAmt: '20000', lnOY: '2027' };
  var BASE = 'Enter the home price, interest rate and loan term to see your payment.';

  function setEmpty(msg, hint) {
    $('lnResLab').textContent = 'Monthly payment';
    $('lnResBig').textContent = '—';
    $('lnResSub').textContent = msg;
    $('lnResults').style.display = 'none';
    $('lnMLab').textContent = 'Monthly payment'; $('lnMVal').textContent = '—'; $('lnMDec').textContent = '';
    var h = $('lnHint'); h.textContent = hint || ''; h.style.display = hint ? 'block' : 'none';
    last = null;
  }

  function calc() {
    var ids = ['lnPrice', 'lnDown', 'lnRate', 'lnTerm', 'lnExtra'];
    if (st.adv) ids = ids.concat(['lnStartY', 'lnTax', 'lnIns', 'lnPmi', 'lnHoa', 'lnOther', 'lnGrow', 'lnYAmt', 'lnOAmt', 'lnOY']);
    var f = {}, i;
    for (i = 0; i < ids.length; i++) {
      f[ids[i]] = read(ids[i]);
      if (f[ids[i]].bad) return { hint: 'Can’t read “' + LABELS[ids[i]] + '” yet — type a plain number like ' + EXS[ids[i]] + '.' };
    }
    var val = function (id, d) { return f[id] && f[id].v != null ? f[id].v : d; };
    if (f.lnPrice.e || f.lnRate.e || f.lnTerm.e) return { msg: BASE };
    var price = f.lnPrice.v, apr = f.lnRate.v, term = f.lnTerm.v;
    if (!(price > 0)) return { msg: BASE, hint: 'The home price must be more than 0.' };
    if (price > 1e9) return { msg: BASE, hint: 'That home price is too large to calculate — enter it in dollars, like 400000.' };
    if (apr < 0 || apr > 30) return { msg: BASE, hint: 'Enter the yearly interest rate as a percentage between 0 and 30, like 6.5.' };
    if (!(term > 0) || term > 50) return { msg: BASE, hint: 'The loan term must be between 1 and 50 years.' };
    var dv = val('lnDown', 0), downD;
    if (dv < 0) return { msg: BASE, hint: 'The down payment can’t be negative.' };
    if (st.downU === 'pct') { if (dv >= 100) return { msg: BASE, hint: 'A down payment of 100% or more covers the whole price — there is no loan to pay off.' }; downD = price * dv / 100; }
    else { if (dv >= price) return { msg: BASE, hint: 'That down payment covers the whole price — there is no loan to pay off.' }; downD = dv; }
    var extra = val('lnExtra', 0);
    if (extra < 0) return { msg: BASE, hint: 'The extra payment can’t be negative.' };
    var P = price - downD, n = Math.max(1, Math.round(term * 12));
    var sm = parseInt($('lnStartM').value, 10) || 0;
    var sy = f.lnStartY && f.lnStartY.v != null ? Math.round(f.lnStartY.v) : now.getFullYear();
    var yAmt = val('lnYAmt', 0), oAmt = val('lnOAmt', 0), oAt = 0;
    if (yAmt < 0 || oAmt < 0) return { msg: BASE, hint: 'Extra payments can’t be negative.' };
    if (oAmt > 0) {
      var oy = f.lnOY && f.lnOY.v != null ? Math.round(f.lnOY.v) : sy;
      oAt = (oy * 12 + parseInt($('lnOM').value, 10)) - (sy * 12 + sm);
      if (oAt < 1 || oAt > n) return { msg: BASE, hint: 'The one-time extra payment must fall after the loan starts and before it ends.' };
    }
    var comp = st.comp;
    var o = { P: P, apr: apr, n: n, comp: comp, extra: extra, yAmt: yAmt, yMonth: parseInt($('lnYM').value, 10), oAmt: oAmt, oAt: oAt, startMonth: sm };
    var base = E.run({ P: P, apr: apr, n: n, comp: comp, startMonth: sm });
    var hasExtra = extra > 0 || yAmt > 0 || oAmt > 0;
    var real = hasExtra ? E.run(o) : base;
    // monthly costs
    var tv = val('lnTax', 0), taxY = st.taxU === 'pct' ? price * tv / 100 : tv;
    var costs = { tax: taxY / 12, ins: val('lnIns', 0) / 12, hoa: val('lnHoa', 0), other: val('lnOther', 0) / 12, grow: val('lnGrow', 0), pmiRate: val('lnPmi', 0) };
    if (tv < 0 || costs.ins < 0 || costs.hoa < 0 || costs.other < 0 || costs.pmiRate < 0 || costs.grow < 0) return { msg: BASE, hint: 'Costs can’t be negative.' };
    if (st.taxU === 'pct' && tv > 100) return { msg: BASE, hint: 'Property tax as a percentage must be between 0 and 100 — typically around 1 or 2.' };
    if (costs.pmiRate > 10) return { msg: BASE, hint: 'PMI is a yearly percentage of the loan, usually under 2 — for example 0.8.' };
    if (costs.grow > 50) return { msg: BASE, hint: 'Costs rise each year by a percentage — for example 3.' };
    if (taxY > price || costs.ins * 12 > price || costs.hoa * 12 > price || costs.other * 12 > price) return { msg: BASE, hint: 'One of the yearly costs is larger than the home price — check the amounts.' };
    var needsPmi = P > 0.8 * price + 0.005;
    return { price: price, downD: downD, downP: downD / price * 100, apr: apr, term: term, P: P, n: n, sm: sm, sy: sy, extra: extra, yAmt: yAmt, oAmt: oAmt, base: base, real: real, hasExtra: hasExtra, costs: costs, needsPmi: needsPmi, comp: comp };
  }

  /* ---------- costs per month ---------- */
  function costAt(c, k, d) { // k = payment number (1-based)
    var g = Math.pow(1 + c.grow / 100, Math.floor((k - 1) / 12));
    var pmi = 0;
    if (c.pmiRate > 0 && d.needsPmi) { var row = d.real.rows[k - 1] || d.base.rows[k - 1]; if (row && row.start > 0.8 * d.price) pmi = d.P * c.pmiRate / 100 / 12; }
    return { tax: c.tax * g, ins: c.ins * g, hoa: c.hoa * g, other: c.other * g, pmi: pmi };
  }

  /* ---------- charts ---------- */
  function balanceChart(d) {
    var W = 300, H = 190, ml = 46, mr = 8, mt = 10, mb = 26, pw = W - ml - mr, ph = H - mt - mb;
    var n = d.base.count, P = d.P;
    var X = function (k) { return ml + pw * k / n; }, Y = function (b) { return mt + ph * (1 - b / P); };
    function path(rows) { var p = 'M' + X(0).toFixed(1) + ',' + Y(P).toFixed(1); rows.forEach(function (r) { p += ' L' + X(r.k).toFixed(1) + ',' + Y(r.bal).toFixed(1); }); return p; }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Loan balance over time">';
    [0, 0.5, 1].forEach(function (t) { var y = Y(P * t); s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E7DCC8" stroke-width="1"/><text x="' + (ml - 6) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="13" fill="#6B5B4A">' + kfmt(P * t) + '</text>'; });
    var yrs = n / 12, step = yrs <= 6 ? 1 : yrs <= 12 ? 2 : yrs <= 30 ? 5 : 10;
    for (var y = 0; y <= yrs + 1e-9; y += step) { var x = X(y * 12); s += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (mt + ph) + '" y2="' + (mt + ph + 4) + '" stroke="#9A8870"/><text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="13" fill="#6B5B4A">' + (y === 0 ? 'Yr 0' : y) + '</text>'; }
    s += '<path d="' + path(d.base.rows) + ' L' + X(n).toFixed(1) + ',' + Y(0).toFixed(1) + ' L' + X(0).toFixed(1) + ',' + Y(0).toFixed(1) + ' Z" fill="#37503F" fill-opacity=".12"/>';
    s += '<path d="' + path(d.base.rows) + '" fill="none" stroke="#37503F" stroke-width="2" stroke-linejoin="round"/>';
    if (d.hasExtra) s += '<path d="' + path(d.real.rows) + '" fill="none" stroke="#B5761F" stroke-width="2.4" stroke-linejoin="round"/>';
    if (d.base.cross) {
      var cr = d.base.rows[d.base.cross - 1], cx = X(cr.k), cy = Y(cr.bal);
      s += '<line x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + cy.toFixed(1) + '" y2="' + (mt + ph) + '" stroke="#B5761F" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="4.5" fill="#B5761F" stroke="#fff" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  }
  function shareStrip(d) {
    var W = 300, H = 84, top = 6, bh = 56, rows = d.base.rows, years = Math.ceil(d.base.count / 12), bw = (W - 2) / years;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Share of each year’s payments going to interest and principal">';
    for (var y = 0; y < years; y++) {
      var it = 0, sp = 0;
      for (var m = y * 12; m < Math.min(rows.length, y * 12 + 12); m++) { it += rows[m].intr; sp += rows[m].sp; }
      var tot = it + sp, ish = tot > 0 ? it / tot : 0, ih = bh * ish, x = 1 + y * bw, w = Math.max(1, bw - 1);
      s += '<rect x="' + x.toFixed(1) + '" y="' + top + '" width="' + w.toFixed(1) + '" height="' + ih.toFixed(1) + '" fill="#B5761F"/><rect x="' + x.toFixed(1) + '" y="' + (top + ih).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (bh - ih).toFixed(1) + '" fill="#37503F"/>';
    }
    s += '<line x1="0" x2="' + W + '" y1="' + (top + bh / 2) + '" y2="' + (top + bh / 2) + '" stroke="#fff" stroke-width="1.4" stroke-dasharray="4 3"/>';
    s += '<text x="1" y="' + (H - 6) + '" font-size="13" fill="#6B5B4A">Year 1</text><text x="' + (W - 1) + '" y="' + (H - 6) + '" text-anchor="end" font-size="13" fill="#6B5B4A">Year ' + years + '</text>';
    return s + '</svg>';
  }

  /* ---------- schedule ---------- */
  function schedHtml(d) {
    var rows = d.real.rows, hasX = d.hasExtra, s = '';
    if (st.sched === 'yearly') {
      s = '<thead><tr><th>Year</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>';
      for (var y = 0; y * 12 < rows.length; y++) {
        var it = 0, pr = 0, lastRow = null;
        for (var m = y * 12; m < Math.min(rows.length, y * 12 + 12); m++) { it += rows[m].intr; pr += rows[m].pr; lastRow = rows[m]; }
        s += '<tr><td>' + (y + 1) + '</td><td>' + mon0(it) + '</td><td>' + mon0(pr) + '</td><td>' + mon0(lastRow.bal) + '</td></tr>';
      }
    } else {
      s = '<thead><tr><th>#</th><th>Date</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>';
      rows.forEach(function (r) { s += '<tr><td>' + r.k + '</td><td>' + dateTxt(d.sm, d.sy, r.k) + '</td><td>' + mon(r.intr) + '</td><td>' + mon(r.pr) + '</td><td>' + mon(r.bal) + '</td></tr>'; });
    }
    return s + '</tbody>';
  }

  /* ---------- render ---------- */
  function render() {
    var d = calc();
    if (d.hint != null || d.msg != null) { setEmpty(d.msg || BASE, d.hint || ''); return; }
    var h = $('lnHint'); h.style.display = 'none'; h.textContent = '';
    var c = d.costs, pay = d.base.pay, c1 = costAt(c, 1, d), costSum1 = c1.tax + c1.ins + c1.hoa + c1.other + c1.pmi, total1 = pay + costSum1;
    var anyCost = costSum1 > 0;
    last = { d: d, total1: total1 };
    var rateTxt = (Math.round(d.apr * 1000) / 1000) + '%', termTxt = (Math.round(d.term * 100) / 100) + (d.term === 1 ? ' year' : ' years');
    $('lnResLab').textContent = anyCost ? 'Total monthly payment' : 'Monthly payment';
    $('lnResBig').textContent = mon(total1);
    $('lnResSub').textContent = (anyCost ? 'Principal & interest ' + mon(pay) + ' · ' : '') + 'loan ' + mon0(d.P) + ' at ' + rateTxt + ' for ' + termTxt;
    $('lnMLab').textContent = anyCost ? 'Total monthly' : 'Monthly payment'; $('lnMVal').textContent = mon(total1);
    $('lnMDec').textContent = ' · ' + (Math.round(d.term * 100) / 100) + ' yr @ ' + rateTxt;
    $('lnResults').style.display = '';

    // takeaway
    var r1 = d.base.rows[0], tip = 'In your first payment, ' + mon(r1.intr) + ' goes to interest and ' + mon(r1.sp) + ' to the loan. ';
    if (d.base.cross === 1) tip = 'From your very first payment more goes to the loan than to interest (' + mon(r1.sp) + ' vs ' + mon(r1.intr) + '). ';
    else if (d.base.cross) tip += 'Principal first outweighs interest in payment ' + d.base.cross + ' (year ' + Math.ceil(d.base.cross / 12) + ').';
    else tip += 'Interest outweighs principal for the whole loan.';
    $('lnTip').textContent = tip.trim();

    // extra-payment savings
    var sv = $('lnSave');
    if (d.hasExtra) {
      var saved = d.base.totInt - d.real.totInt, sooner = d.base.count - d.real.count;
      sv.style.display = '';
      sv.textContent = 'Your extra payments save ' + mon0(saved) + ' in interest and finish ' + (sooner > 0 ? span(sooner) + ' sooner' : 'on schedule') + ' — paid off ' + dateTxt(d.sm, d.sy, d.real.count) + ' instead of ' + dateTxt(d.sm, d.sy, d.base.count) + '.';
    } else sv.style.display = 'none';

    // PMI note
    var pn = $('lnPmiNote');
    if (d.needsPmi && !(c.pmiRate > 0)) { pn.style.display = ''; pn.textContent = 'With less than 20% down, lenders usually add private mortgage insurance (PMI). Add its yearly rate under Go advanced to include it.'; }
    else pn.style.display = 'none';

    $('lnChart').innerHTML = balanceChart(d);
    $('lnChartLeg').innerHTML = '<span><i style="background:#37503F"></i>Balance</span>' + (d.hasExtra ? '<span><i style="background:#B5761F"></i>Balance with extra payments</span>' : '') + (d.base.cross ? '<span><i class="ln-dot"></i>Principal overtakes interest (year ' + Math.ceil(d.base.cross / 12) + ')</span>' : '');
    $('lnStrip').innerHTML = shareStrip(d);

    // lifetime bar
    var totP = d.real.totInt + d.P, pP = d.P / totP * 100, pI = 100 - pP;
    $('lnLife').innerHTML = '<div class="ln-seg ln-p" style="width:' + pP.toFixed(2) + '%">' + (pP >= 14 ? Math.round(pP) + '%' : '') + '</div><div class="ln-seg ln-i" style="width:' + pI.toFixed(2) + '%">' + (pI >= 14 ? Math.round(pI) + '%' : '') + '</div>';
    $('lnLifeLeg').innerHTML = '<span><i style="background:#37503F"></i>Principal ' + mon0(d.P) + '</span><span><i style="background:#B5761F"></i>Interest ' + mon0(d.real.totInt) + '</span>';

    // summary
    var sm = '<tbody><tr><td>Loan amount</td><td>' + mon0(d.P) + '</td></tr><tr><td>Down payment</td><td>' + mon0(d.downD) + ' (' + pct(d.downP) + ')</td></tr>' +
      '<tr><td>Total interest</td><td>' + mon0(d.real.totInt) + '</td></tr><tr><td>Total of ' + d.real.count + ' payments</td><td>' + mon0(d.real.totPaid) + '</td></tr>' +
      '<tr><td>Paid off</td><td>' + dateTxt(d.sm, d.sy, d.real.count) + '</td></tr>';
    if (d.hasExtra) sm += '<tr><td>Interest saved by extra payments</td><td>' + mon0(d.base.totInt - d.real.totInt) + '</td></tr>';
    $('lnSum').innerHTML = sm + '</tbody>';

    // monthly cost breakdown
    var cw = $('lnCostWrap');
    if (anyCost) {
      cw.style.display = '';
      var items = [['Principal & interest', pay, '#37503F'], ['Property tax', c1.tax, '#6F8F78'], ['Home insurance', c1.ins, '#B5761F'], ['PMI', c1.pmi, '#8F5C13'], ['HOA', c1.hoa, '#CBBBA0'], ['Other costs', c1.other, '#9A8870']].filter(function (x) { return x[1] > 0.004; });
      var bar = '', rows = '';
      items.forEach(function (x) { bar += '<div class="ln-seg" style="width:' + (x[1] / total1 * 100).toFixed(2) + '%;background:' + x[2] + '"></div>'; rows += '<tr><td><i class="ln-dotc" style="background:' + x[2] + '"></i>' + x[0] + '</td><td>' + mon(x[1]) + '</td></tr>'; });
      rows += '<tr class="cur"><td>Total</td><td>' + mon(total1) + '</td></tr>';
      $('lnCostBar').innerHTML = bar; $('lnCostTbl').innerHTML = '<tbody>' + rows + '</tbody>';
      var pmiNote = '';
      if (c1.pmi > 0) { var kEnd = 0; for (var q = 0; q < d.real.rows.length; q++) { if (d.real.rows[q].start <= 0.8 * d.price) { kEnd = q + 1; break; } } pmiNote = kEnd ? 'PMI is charged until your balance falls to 80% of the home price — it drops off from payment ' + kEnd + ' (' + dateTxt(d.sm, d.sy, kEnd) + ').' : 'PMI would be charged for the whole loan.'; }
      if (c.grow > 0) pmiNote += (pmiNote ? ' ' : '') + 'Taxes, insurance, HOA and other costs are shown for year 1; they rise ' + pct(c.grow) + ' a year after that.';
      $('lnCostNote').textContent = pmiNote; $('lnCostNote').style.display = pmiNote ? '' : 'none';
    } else cw.style.display = 'none';

    // compare terms
    var termList = [10, 15, 20, 30]; var ty = d.n / 12;
    if (termList.indexOf(ty) < 0) { termList.push(ty); termList.sort(function (a, b) { return a - b; }); }
    var r = E.mrate(d.apr, d.comp), tt = '<thead><tr><th>Term</th><th>Monthly P&amp;I</th><th>Total interest</th></tr></thead><tbody>';
    termList.forEach(function (t) { var nn = Math.round(t * 12), p = E.pmt(d.P, r, nn), ti = p * nn - d.P; tt += '<tr' + (Math.abs(t - ty) < 1e-9 ? ' class="cur"' : '') + '><td>' + (Math.round(t * 100) / 100) + ' years</td><td>' + mon(p) + '</td><td>' + mon0(ti) + '</td></tr>'; });
    $('lnTerms').innerHTML = tt + '</tbody>';

    // advanced: biweekly
    var bw = $('lnBiWrap');
    if (st.adv) {
      bw.style.display = '';
      var b = E.biweekly(d.P, d.apr, pay);
      if (b) {
        var bs = d.base.totInt - b.interest, bm = d.base.count - b.months;
        $('lnBiTbl').innerHTML = '<tbody><tr><td>Payment every 2 weeks</td><td>' + mon(pay / 2) + '</td></tr><tr><td>Paid off after</td><td>' + span(b.months) + ' (instead of ' + span(d.base.count) + ')</td></tr><tr><td>Total interest</td><td>' + mon0(b.interest) + '</td></tr><tr><td>Interest saved vs monthly</td><td>' + mon0(bs) + '</td></tr></tbody>';
        $('lnBiNote').textContent = 'Half the monthly payment every two weeks adds up to 26 half-payments — one extra monthly payment a year' + (bm > 0.5 ? ', finishing ' + span(bm) + ' sooner.' : '.');
      } else { $('lnBiTbl').innerHTML = ''; $('lnBiNote').textContent = ''; }
    } else bw.style.display = 'none';

    $('lnSched').innerHTML = schedHtml(d);
    var cm = $('lnSchedNote');
    cm.textContent = d.hasExtra ? 'Schedule includes your extra payments.' : '';
    cm.style.display = d.hasExtra ? '' : 'none';
  }

  /* ---------- controls ---------- */
  function seg(id, attr, fn) {
    var el = $(id);
    [].forEach.call(el.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(el.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        fn(b.getAttribute(attr));
      });
    });
  }
  function fmtPlain(x) { return String(Number(x.toFixed(4))); }
  // %/$ toggle that carries the exact value across when the price is known
  function unitToggle(segId, fieldId, key, base) {
    seg(segId, 'data-u', function (u) {
      var prev = st[key]; st[key] = u;
      var el = $(fieldId), v = read(fieldId), p = read('lnPrice');
      if (prev !== u && v.v != null && p.v > 0) {
        var cv = u === 'usd' ? p.v * v.v / (base || 100) : v.v / p.v * 100, okIn = u === 'usd' ? (v.v >= 0 && v.v <= 100) : (v.v >= 0 && cv <= 100);
        el.value = okIn ? fmtPlain(cv) : '';
      }
      el.placeholder = u === 'pct' ? (key === 'downU' ? 'e.g. 20' : 'e.g. 1.2') : (key === 'downU' ? 'e.g. 80000' : 'e.g. 4800');
      render();
    });
  }
  unitToggle('lnDownSeg', 'lnDown', 'downU');
  unitToggle('lnTaxSeg', 'lnTax', 'taxU');
  seg('lnCompSeg', 'data-v', function (v) { st.comp = v; render(); });
  seg('lnSchedSeg', 'data-v', function (v) { st.sched = v; if (last) $('lnSched').innerHTML = schedHtml(last.d); });
  ['lnPrice', 'lnDown', 'lnRate', 'lnTerm', 'lnExtra', 'lnStartY', 'lnTax', 'lnIns', 'lnPmi', 'lnHoa', 'lnOther', 'lnGrow', 'lnYAmt', 'lnOAmt', 'lnOY'].forEach(function (id) {
    $(id).addEventListener('input', function () { if (id === 'lnTerm') markTerm(); render(); });
  });
  ['lnStartM', 'lnYM', 'lnOM'].forEach(function (id) { $(id).addEventListener('change', render); });
  function markTerm() {
    var v = read('lnTerm').v;
    [].forEach.call($('lnTermChips').querySelectorAll('button'), function (b) { b.classList.toggle('on', v != null && Number(b.getAttribute('data-t')) === v); });
  }
  [].forEach.call($('lnTermChips').querySelectorAll('button'), function (b) { b.addEventListener('click', function () { $('lnTerm').value = b.getAttribute('data-t'); markTerm(); render(); }); });
  $('lnEx').addEventListener('click', function () {
    st.downU = 'pct';
    [].forEach.call($('lnDownSeg').querySelectorAll('button'), function (x) { x.classList.toggle('on', x.getAttribute('data-u') === 'pct'); });
    $('lnDown').placeholder = 'e.g. 20';
    $('lnPrice').value = '400000'; $('lnDown').value = '20'; $('lnRate').value = '6.5'; $('lnTerm').value = '30'; markTerm(); render();
  });
  $('lnAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('lnAdvBtn').classList.toggle('open', st.adv);
    $('lnAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('lnAdvIn').style.display = st.adv ? '' : 'none';
    if (!st.adv) {
      ['lnStartY', 'lnTax', 'lnIns', 'lnPmi', 'lnHoa', 'lnOther', 'lnGrow', 'lnYAmt', 'lnOAmt', 'lnOY'].forEach(function (id) { $(id).value = ''; });
      $('lnStartM').value = String(now.getMonth()); $('lnYM').value = '0'; $('lnOM').value = String(now.getMonth());
      st.comp = 'us'; st.taxU = 'pct'; $('lnTax').placeholder = 'e.g. 1.2';
      [].forEach.call($('lnCompSeg').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === 'us'); });
      [].forEach.call($('lnTaxSeg').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-u') === 'pct'); });
    }
    render();
  });
  $('lnCopy').addEventListener('click', function () {
    if (!last) return;
    var d = last.d, lines = ['Mortgage: ' + mon0(d.price) + ' home, ' + mon0(d.downD) + ' down (' + pct(d.downP) + '), loan ' + mon0(d.P) + ' at ' + d.apr + '% for ' + d.term + ' years',
      'Principal & interest: ' + mon(d.base.pay) + ' a month', 'Total monthly payment: ' + mon(last.total1),
      'Total interest: ' + mon0(d.real.totInt), 'Total of ' + d.real.count + ' payments: ' + mon0(d.real.totPaid), 'Paid off: ' + dateTxt(d.sm, d.sy, d.real.count)];
    if (d.hasExtra) lines.push('Interest saved by extra payments: ' + mon0(d.base.totInt - d.real.totInt));
    var btn = $('lnCopy'), txt = lines.join('\n');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy results'; }, 1600); };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
  });

  $('lnStartM').value = String(now.getMonth());
  $('lnYM').value = '0';
  $('lnOM').value = String(now.getMonth());
  $('lnStartY').placeholder = 'e.g. ' + now.getFullYear();
  $('lnOY').placeholder = 'e.g. ' + (now.getFullYear() + 1);
  render();
};

/* =========================================================
   FINANCE · LOAN CALCULATOR  (body.p-loan)
   Same engine as the Mortgage page (CalcThis.loanEngine.runP) with any
   payment frequency, any compounding rule, an origination fee that shows
   the true APR, and a reverse "what can I borrow?" mode.
   ========================================================= */
CalcThis.initLoanCalc = function () {
  var E = CalcThis.loanEngine;
  var $ = function (id) { return document.getElementById(id); };
  if (!$('lnAmount')) return;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var ADJ = { 365: 'Daily', 52: 'Weekly', 26: 'Bi-weekly', 24: 'Semi-monthly', 12: 'Monthly', 4: 'Quarterly', 2: 'Semi-annual', 1: 'Yearly' };
  var PER = { 365: 'day', 52: 'week', 26: '2 weeks', 24: 'half month', 12: 'month', 4: 'quarter', 2: '6 months', 1: 'year' };
  var CNAME = { 1: 'yearly', 2: 'semi-annually', 4: 'quarterly', 12: 'monthly', 24: 'semi-monthly', 26: 'bi-weekly', 52: 'weekly', 365: 'daily', c: 'continuously' };
  var HOW = { out: 'taken out of the loan', 'in': 'added to the loan', up: 'paid upfront' };
  var now = new Date();
  var st = { mode: 'pay', termU: 'yr', feeU: 'pct', adv: false, sched: 'yearly' };
  var last = null;

  function comma(x) { return x.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  function mon(x) { if (Math.abs(x) < 0.005) x = 0; return '$' + x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function mon0(x) { return '$' + comma(Math.round(x) || 0); }
  function kfmt(x) { return x >= 1e6 ? '$' + (Math.round(x / 1e5) / 10) + 'M' : x >= 1e4 ? '$' + Math.round(x / 1e3) + 'k' : x >= 1e3 ? '$' + (Math.round(x / 100) / 10) + 'k' : '$' + Math.round(x); }
  function pct(x) { return (Math.round(x * 100) / 100) + '%'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function span(m) {
    var y = Math.floor(m / 12), mo = Math.round(m - y * 12);
    if (mo === 12) { y++; mo = 0; }
    if (!y && !mo) return '0 months';
    return (y ? plural(y, 'year') : '') + (y && mo ? ' ' : '') + (mo ? plural(mo, 'month') : '');
  }
  function ppyNow() { return parseInt($('lnFreq').value, 10) || 12; }
  function compNow() { var v = $('lnComp').value; return v === 'c' ? 'c' : (parseInt(v, 10) || 12); }
  function dateTxt(sm, sy, k, ppy) {
    if (12 % ppy === 0) { var t = sm + k * 12 / ppy; return MON[((t % 12) + 12) % 12] + ' ' + (sy + Math.floor(t / 12)); }
    var dt = new Date(sy, sm, 1); dt.setDate(dt.getDate() + Math.round(k * 365 / ppy));
    return MON[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
  }
  function termTxt(d) { var m = d.termY * 12; return m >= 0.95 ? span(Math.round(m)) : plural(d.n, 'payment'); }

  /* ---------- reading fields ---------- */
  function read(id) {
    var el = $(id); if (!el) return { e: true };
    var s = (el.value || '').trim(); if (!s) return { e: true };
    var t = s.replace(/[$,%\s]/g, '');
    if (/^[-+.]*$/.test(t)) return { e: true, partial: true };
    var v = Number(t);
    return isNaN(v) || !isFinite(v) ? { bad: true } : { v: v };
  }
  var LABELS = { lnAmount: 'Loan amount', lnAfford: 'Payment', lnRate: 'Interest rate', lnTerm: 'Loan term', lnExtra: 'Extra payment', lnFee: 'Origination fee', lnStartY: 'Start year' };
  var EXS = { lnAmount: '15000', lnAfford: '300', lnRate: '8.5', lnTerm: '5', lnExtra: '25', lnFee: '2', lnStartY: '2026' };
  function baseMsg() { return st.mode === 'pay' ? 'Enter the loan amount, interest rate and loan term to see your payment.' : 'Enter the payment you can afford, the interest rate and the loan term to see how much you can borrow.'; }

  function setEmpty(msg, hint) {
    var afford = st.mode === 'afford';
    $('lnResLab').textContent = afford ? 'You can borrow' : ADJ[ppyNow()] + ' payment';
    $('lnResBig').textContent = '—';
    $('lnResSub').textContent = msg;
    $('lnResults').style.display = 'none';
    $('lnMLab').textContent = afford ? 'You can borrow' : ADJ[ppyNow()] + ' payment'; $('lnMVal').textContent = '—'; $('lnMDec').textContent = '';
    var h = $('lnHint'); h.textContent = hint || ''; h.style.display = hint ? 'block' : 'none';
    last = null;
  }

  function calc() {
    var afford = st.mode === 'afford', BASE = baseMsg();
    var ids = afford ? ['lnAfford', 'lnRate', 'lnTerm'] : ['lnAmount', 'lnRate', 'lnTerm', 'lnExtra'];
    if (st.adv) { ids.push('lnStartY'); if (!afford) ids.push('lnFee'); }
    var f = {}, i;
    for (i = 0; i < ids.length; i++) {
      f[ids[i]] = read(ids[i]);
      if (f[ids[i]].bad) return { hint: 'Can’t read “' + LABELS[ids[i]] + '” yet — type a plain number like ' + EXS[ids[i]] + '.' };
    }
    var val = function (id, d) { return f[id] && f[id].v != null ? f[id].v : d; };
    var mainId = afford ? 'lnAfford' : 'lnAmount';
    if (f[mainId].e || f.lnRate.e || f.lnTerm.e) return { msg: BASE };
    var main = f[mainId].v, apr = f.lnRate.v, term = f.lnTerm.v;
    if (!(main >= (afford ? 0.01 : 1))) return { msg: BASE, hint: afford ? 'The payment must be at least $0.01.' : 'The loan amount must be at least $1.' };
    if (main > 1e9) return { msg: BASE, hint: afford ? 'That payment is too large to calculate — enter it in dollars, like 300.' : 'That loan amount is too large to calculate — enter it in dollars, like 15000.' };
    if (apr < 0 || apr > 100) return { msg: BASE, hint: 'Enter the yearly interest rate as a percentage between 0 and 100, like 8.5.' };
    if (!(term > 0)) return { msg: BASE, hint: 'The loan term must be more than 0.' };
    var termY = st.termU === 'yr' ? term : term / 12;
    if (termY > 50) return { msg: BASE, hint: 'The loan term can be at most 50 years (600 months).' };
    var ppy = ppyNow(), comp = compNow(), n = Math.round(termY * ppy);
    if (n < 1) return { msg: BASE, hint: 'That term is shorter than one payment — lengthen the term or pay more often.' };
    if (n > 20000) return { msg: BASE, hint: 'That many payments is too many to calculate — shorten the term or pay less often.' };
    var sm = parseInt($('lnStartM').value, 10) || 0;
    var sy = f.lnStartY && f.lnStartY.v != null ? Math.round(f.lnStartY.v) : now.getFullYear();
    if (sy < 1900 || sy > 2200) return { msg: BASE, hint: 'Enter the start year as four digits, like ' + now.getFullYear() + '.' };
    var d = { afford: afford, apr: apr, term: term, termY: termY, ppy: ppy, comp: comp, n: n, sm: sm, sy: sy, extra: 0, F: 0, how: 'out', A: main };
    if (afford) {
      var r0 = E.prate(apr, ppy, comp), Pb = E.borrowable(main, r0, n);
      if (!(Pb >= 1)) return { msg: BASE, hint: 'That payment is too small to borrow anything at this rate and term — try a larger payment.' };
      d.P = Pb; d.A = Pb; d.Q = main; d.N = Pb;
    } else {
      var extra = val('lnExtra', 0);
      if (extra < 0) return { msg: BASE, hint: 'The extra payment can’t be negative.' };
      if (extra > main) return { msg: BASE, hint: 'The extra payment is larger than the whole loan — check the amount.' };
      var fv = val('lnFee', 0), F = 0;
      if (fv < 0) return { msg: BASE, hint: 'The fee can’t be negative.' };
      if (st.feeU === 'pct') { if (fv > 50) return { msg: BASE, hint: 'The origination fee is a percentage of the loan, usually between 1 and 8 — for example 2.' }; F = main * fv / 100; }
      else { if (fv >= main) return { msg: BASE, hint: 'The fee can’t be as large as the loan itself.' }; F = fv; }
      var how = $('lnFeeHow').value || 'out';
      d.how = how; d.F = F; d.extra = extra; d.P = how === 'in' ? main + F : main; d.N = how === 'in' ? main : main - F;
    }
    d.base = E.runP({ P: d.P, apr: apr, ppy: ppy, comp: comp, n: n });
    d.hasExtra = d.extra > 0;
    d.real = d.hasExtra ? E.runP({ P: d.P, apr: apr, ppy: ppy, comp: comp, n: n, extra: d.extra }) : d.base;
    d.trueApr = d.F > 0 ? E.aprFromCash(d.N, d.base.pay, n, ppy) : null;
    return d;
  }

  /* ---------- charts ---------- */
  function balanceChart(d) {
    var W = 300, H = 190, ml = 46, mr = 8, mt = 10, mb = 26, pw = W - ml - mr, ph = H - mt - mb;
    var n = d.base.count, P = d.P, yrs = n / d.ppy, inMonths = yrs <= 2, tot = inMonths ? yrs * 12 : yrs;
    var X = function (k) { return ml + pw * k / n; }, Y = function (b) { return mt + ph * (1 - b / P); };
    function path(rows) { var p = 'M' + X(0).toFixed(1) + ',' + Y(P).toFixed(1); var sk = Math.max(1, Math.ceil(rows.length / 400)); rows.forEach(function (r, ix) { if (ix % sk === 0 || ix === rows.length - 1) p += ' L' + X(r.k).toFixed(1) + ',' + Y(r.bal).toFixed(1); }); return p; }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Loan balance over time">';
    [0, 0.5, 1].forEach(function (t) { var y = Y(P * t); s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E7DCC8" stroke-width="1"/><text x="' + (ml - 6) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="13" fill="#6B5B4A">' + kfmt(P * t) + '</text>'; });
    var step = inMonths ? (tot <= 6 ? 1 : tot <= 12 ? 2 : 4) : (tot <= 6 ? 1 : tot <= 12 ? 2 : tot <= 30 ? 5 : 10);
    for (var u = 0; u <= tot + 1e-9; u += step) {
      var x = ml + pw * u / tot;
      s += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (mt + ph) + '" y2="' + (mt + ph + 4) + '" stroke="#9A8870"/><text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="13" fill="#6B5B4A">' + (u === 0 ? (inMonths ? 'Mo 0' : 'Yr 0') : u) + '</text>';
    }
    s += '<path d="' + path(d.base.rows) + ' L' + X(n).toFixed(1) + ',' + Y(0).toFixed(1) + ' L' + X(0).toFixed(1) + ',' + Y(0).toFixed(1) + ' Z" fill="#37503F" fill-opacity=".12"/>';
    s += '<path d="' + path(d.base.rows) + '" fill="none" stroke="#37503F" stroke-width="2" stroke-linejoin="round"/>';
    if (d.hasExtra) s += '<path d="' + path(d.real.rows) + '" fill="none" stroke="#B5761F" stroke-width="2.4" stroke-linejoin="round"/>';
    if (d.base.cross && d.base.cross > 1) {
      var cr = d.base.rows[d.base.cross - 1], cx = X(cr.k), cy = Y(cr.bal);
      s += '<line x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + cy.toFixed(1) + '" y2="' + (mt + ph) + '" stroke="#B5761F" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="4.5" fill="#B5761F" stroke="#fff" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  }
  function groupSize(d) { return d.base.count / d.ppy > 3 ? d.ppy : Math.max(1, Math.ceil(d.base.count / 36)); }
  function shareStrip(d) {
    var W = 300, H = 84, top = 6, bh = 56, rows = d.base.rows, gs = groupSize(d), groups = Math.ceil(rows.length / gs), bw = (W - 2) / groups, byYear = gs === d.ppy && d.base.count / d.ppy > 3;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Share of each period’s payments going to interest and principal">';
    for (var g = 0; g < groups; g++) {
      var it = 0, sp = 0;
      for (var m = g * gs; m < Math.min(rows.length, g * gs + gs); m++) { it += rows[m].intr; sp += rows[m].sp; }
      var tot = it + sp, ish = tot > 0 ? it / tot : 0, ih = bh * ish, x = 1 + g * bw, w = Math.max(1, bw - 1);
      s += '<rect x="' + x.toFixed(1) + '" y="' + top + '" width="' + w.toFixed(1) + '" height="' + ih.toFixed(1) + '" fill="#B5761F"/><rect x="' + x.toFixed(1) + '" y="' + (top + ih).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (bh - ih).toFixed(1) + '" fill="#37503F"/>';
    }
    s += '<line x1="0" x2="' + W + '" y1="' + (top + bh / 2) + '" y2="' + (top + bh / 2) + '" stroke="#fff" stroke-width="1.4" stroke-dasharray="4 3"/>';
    s += '<text x="1" y="' + (H - 6) + '" font-size="13" fill="#6B5B4A">' + (byYear ? 'Year 1' : 'Start') + '</text><text x="' + (W - 1) + '" y="' + (H - 6) + '" text-anchor="end" font-size="13" fill="#6B5B4A">' + (byYear ? 'Year ' + groups : 'Payoff') + '</text>';
    return s + '</svg>';
  }

  /* ---------- schedule ---------- */
  var CAP = 600;
  function schedHtml(d) {
    var rows = d.real.rows, s = '', ppy = d.ppy;
    if (st.sched === 'yearly') {
      s = '<thead><tr><th>Year</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>';
      for (var y = 0; y * ppy < rows.length; y++) {
        var it = 0, pr = 0, lastRow = null;
        for (var m = y * ppy; m < Math.min(rows.length, y * ppy + ppy); m++) { it += rows[m].intr; pr += rows[m].pr; lastRow = rows[m]; }
        s += '<tr><td>' + (y + 1) + '</td><td>' + mon0(it) + '</td><td>' + mon0(pr) + '</td><td>' + mon0(lastRow.bal) + '</td></tr>';
      }
    } else {
      s = '<thead><tr><th>#</th><th>Date</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>';
      rows.slice(0, CAP).forEach(function (r) { s += '<tr><td>' + r.k + '</td><td>' + dateTxt(d.sm, d.sy, r.k, ppy) + '</td><td>' + mon(r.intr) + '</td><td>' + mon(r.pr) + '</td><td>' + mon(r.bal) + '</td></tr>'; });
    }
    return s + '</tbody>';
  }
  function schedNote(d) {
    var t = [];
    if (d.hasExtra) t.push('Schedule includes your extra payments.');
    if (st.sched !== 'yearly' && d.real.rows.length > CAP) t.push('Showing the first ' + CAP + ' of ' + comma(d.real.rows.length) + ' payments — the yearly view covers them all.');
    return t.join(' ');
  }

  /* ---------- render ---------- */
  function render() {
    var d = calc(), ppy = ppyNow();
    $('lnAfUnit').textContent = '$ per ' + PER[ppy];
    if (d.hint != null || d.msg != null) { setEmpty(d.msg || baseMsg(), d.hint || ''); return; }
    var h = $('lnHint'); h.style.display = 'none'; h.textContent = '';
    var pay = d.base.pay, rateTxt = (Math.round(d.apr * 1000) / 1000) + '%', adj = ADJ[d.ppy];
    last = { d: d };
    var tt = termTxt(d);
    if (d.afford) {
      $('lnResLab').textContent = 'You can borrow';
      $('lnResBig').textContent = mon0(d.P);
      $('lnResSub').textContent = 'paying ' + mon(d.Q) + ' every ' + PER[d.ppy] + ' at ' + rateTxt + ' for ' + tt;
      $('lnMLab').textContent = 'You can borrow'; $('lnMVal').textContent = mon0(d.P);
    } else {
      $('lnResLab').textContent = adj + ' payment';
      $('lnResBig').textContent = mon(pay);
      $('lnResSub').textContent = 'loan ' + mon0(d.A) + ' at ' + rateTxt + ' for ' + tt + (d.hasExtra ? ' · plus ' + mon(d.extra) + ' extra each time' : '');
      $('lnMLab').textContent = adj + ' payment'; $('lnMVal').textContent = mon(pay);
    }
    $('lnMDec').textContent = ' · ' + tt + ' @ ' + rateTxt;
    $('lnResults').style.display = '';

    // takeaway
    var r1 = d.base.rows[0], tip = 'In your first payment, ' + mon(r1.intr) + ' goes to interest and ' + mon(r1.sp) + ' to the loan. ';
    if (d.base.cross === 1) tip = 'From your very first payment more goes to the loan than to interest (' + mon(r1.sp) + ' vs ' + mon(r1.intr) + '). ';
    else if (d.base.cross) tip += 'Principal first outweighs interest in payment ' + d.base.cross + ' (' + (d.base.count / d.ppy > 3 ? 'year ' + Math.ceil(d.base.cross / d.ppy) : 'about ' + Math.round(d.base.cross / d.base.count * 100) + '% of the way through') + ').';
    else tip += 'Interest outweighs principal for the whole loan.';
    $('lnTip').textContent = tip.trim();

    var ft = $('lnFeeTip');
    if (d.F > 0) { ft.style.display = ''; ft.textContent = 'With the ' + mon(d.F) + ' fee ' + HOW[d.how] + ', your ' + rateTxt + ' loan really costs ' + (Math.round(d.trueApr * 100) / 100) + '% APR.'; }
    else ft.style.display = 'none';

    var sv = $('lnSave');
    if (d.hasExtra) {
      var saved = d.base.totInt - d.real.totInt, sooner = d.base.count - d.real.count;
      sv.style.display = '';
      sv.textContent = 'Your extra ' + mon(d.extra) + ' each payment saves ' + mon0(saved) + ' in interest and finishes ' + (sooner > 0 ? (sooner / d.ppy >= 0.2 ? span(sooner / d.ppy * 12) : plural(sooner, 'payment')) + ' sooner' : 'on schedule') + ' — paid off ' + dateTxt(d.sm, d.sy, d.real.count, d.ppy) + ' instead of ' + dateTxt(d.sm, d.sy, d.base.count, d.ppy) + '.';
    } else sv.style.display = 'none';

    $('lnChartTtl').textContent = 'Your balance over the loan (' + (d.base.count / d.ppy <= 2 ? 'months' : 'years') + ')';
    $('lnChart').innerHTML = balanceChart(d);
    $('lnChartLeg').innerHTML = '<span><i style="background:#37503F"></i>Balance</span>' + (d.hasExtra ? '<span><i style="background:#B5761F"></i>Balance with extra payments</span>' : '') + (d.base.cross > 1 ? '<span><i class="ln-dot"></i>Principal overtakes interest</span>' : '');
    $('lnStripTtl').textContent = groupSize(d) === d.ppy && d.base.count / d.ppy > 3 ? 'Interest vs principal in each year’s payments' : 'Interest vs principal across your payments';
    $('lnStrip').innerHTML = shareStrip(d);

    var totP = d.real.totInt + d.P, pP = d.P / totP * 100, pI = 100 - pP;
    $('lnLife').innerHTML = '<div class="ln-seg ln-p" style="width:' + pP.toFixed(2) + '%">' + (pP >= 14 ? Math.round(pP) + '%' : '') + '</div><div class="ln-seg ln-i" style="width:' + pI.toFixed(2) + '%">' + (pI >= 14 ? Math.round(pI) + '%' : '') + '</div>';
    $('lnLifeLeg').innerHTML = '<span><i style="background:#37503F"></i>Principal ' + mon0(d.P) + '</span><span><i style="background:#B5761F"></i>Interest ' + mon0(d.real.totInt) + '</span>';

    var sm = '<tbody>';
    if (d.afford) sm += '<tr><td>You can borrow</td><td>' + mon0(d.P) + '</td></tr><tr><td>Payment</td><td>' + mon(d.Q) + ' every ' + PER[d.ppy] + '</td></tr>';
    else {
      sm += '<tr><td>Loan amount</td><td>' + mon0(d.A) + '</td></tr>';
      if (d.F > 0) {
        sm += '<tr><td>Origination fee</td><td>' + mon(d.F) + '</td></tr>';
        if (d.how === 'in') sm += '<tr><td>Amount financed</td><td>' + mon0(d.P) + '</td></tr>';
        else if (d.how === 'out') sm += '<tr><td>You receive</td><td>' + mon0(d.N) + '</td></tr>';
      }
    }
    sm += '<tr><td>Total interest</td><td>' + mon0(d.real.totInt) + '</td></tr><tr><td>Total of ' + comma(d.real.count) + ' payments</td><td>' + mon0(d.real.totPaid) + '</td></tr>';
    if (d.F > 0) sm += '<tr><td>Interest + fee</td><td>' + mon0(d.real.totInt + d.F) + '</td></tr><tr><td>True APR with the fee</td><td>' + (Math.round(d.trueApr * 100) / 100) + '%</td></tr>';
    sm += '<tr><td>Paid off</td><td>' + dateTxt(d.sm, d.sy, d.real.count, d.ppy) + '</td></tr>';
    if (d.hasExtra) sm += '<tr><td>Interest saved by extra payments</td><td>' + mon0(d.base.totInt - d.real.totInt) + '</td></tr>';
    if (st.adv) sm += '<tr><td>Effective yearly rate</td><td>' + (Math.round((Math.pow(1 + d.base.r, d.ppy) - 1) * 10000) / 100) + '%</td></tr>';
    $('lnSum').innerHTML = sm + '</tbody>';

    // compare terms
    var termList = [1, 3, 5, 7, 10], ty = d.n / d.ppy;
    if (!termList.some(function (t) { return Math.abs(t - ty) < 1e-9; })) { termList.push(ty); termList.sort(function (a, b) { return a - b; }); }
    var r = E.prate(d.apr, d.ppy, d.comp);
    $('lnTermsTtl').textContent = d.afford ? 'What that payment borrows over other terms — same payment and rate' : 'Compare loan terms — same amount and rate';
    var tbl = '<thead><tr><th>Term</th><th>' + (d.afford ? 'You can borrow' : adj + ' payment') + '</th><th>Total interest</th></tr></thead><tbody>';
    termList.forEach(function (t) {
      var nn = Math.round(t * d.ppy); if (nn < 1) return;
      var cur = Math.abs(t - ty) < 1e-9, lab = t >= 1 && Math.abs(t * 12 - Math.round(t * 12)) < 1e-6 ? span(Math.round(t * 12)) : plural(nn, 'payment');
      if (d.afford) { var pb = E.borrowable(d.Q, r, nn); tbl += '<tr' + (cur ? ' class="cur"' : '') + '><td>' + lab + '</td><td>' + mon0(pb) + '</td><td>' + mon0(d.Q * nn - pb) + '</td></tr>'; }
      else { var p = E.pmt(d.P, r, nn); tbl += '<tr' + (cur ? ' class="cur"' : '') + '><td>' + lab + '</td><td>' + mon(p) + '</td><td>' + mon0(p * nn - d.P) + '</td></tr>'; }
    });
    $('lnTerms').innerHTML = tbl + '</tbody>';

    $('lnCopyWrap').style.display = st.adv ? '' : 'none';
    $('lnSched').innerHTML = schedHtml(d);
    var cm = $('lnSchedNote'), nt = schedNote(d);
    cm.textContent = nt; cm.style.display = nt ? '' : 'none';
  }

  /* ---------- controls ---------- */
  function seg(id, attr, fn) {
    var el = $(id);
    [].forEach.call(el.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(el.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        fn(b.getAttribute(attr));
      });
    });
  }
  function fmtPlain(x, dp) { return String(Number(x.toFixed(dp == null ? 4 : dp))); }
  seg('lnTermSeg', 'data-u', function (u) {
    var prev = st.termU; st.termU = u;
    var el = $('lnTerm'), v = read('lnTerm');
    if (prev !== u && v.v != null) {
      var cv = u === 'mo' ? v.v * 12 : v.v / 12, lim = u === 'mo' ? 600 : 50;
      el.value = v.v > 0 && cv > 0 && cv <= lim ? fmtPlain(cv, u === 'mo' ? 2 : 4) : '';
    }
    el.placeholder = u === 'yr' ? 'e.g. 5' : 'e.g. 60';
    $('lnTermUnit').textContent = u === 'yr' ? 'years' : 'months';
    markTerm(); render();
  });
  seg('lnFeeSeg', 'data-u', function (u) {
    var prev = st.feeU; st.feeU = u;
    var el = $('lnFee'), v = read('lnFee'), p = read('lnAmount');
    if (prev !== u && v.v != null && p.v > 0) {
      var cv = u === 'usd' ? p.v * v.v / 100 : v.v / p.v * 100, okIn = u === 'usd' ? (v.v >= 0 && v.v <= 50) : (v.v >= 0 && cv <= 50);
      el.value = okIn ? fmtPlain(cv, 4) : '';
    }
    el.placeholder = u === 'pct' ? 'e.g. 2' : 'e.g. 300';
    render();
  });
  seg('lnModeSeg', 'data-v', function (v) {
    st.mode = v;
    var afford = v === 'afford';
    $('lnAmtFld').style.display = afford ? 'none' : '';
    $('lnAfFld').style.display = afford ? '' : 'none';
    $('lnExtraFld').style.display = afford ? 'none' : '';
    $('lnFeeGrp').style.display = afford ? 'none' : '';
    $('lnEx').textContent = afford ? 'See an example: pay $300 every month, 8.5%, 5 years' : 'See an example: $15,000 loan, 8.5%, 5 years';
    render();
  });
  seg('lnSchedSeg', 'data-v', function (v) { st.sched = v; if (last) { $('lnSched').innerHTML = schedHtml(last.d); var nt = schedNote(last.d); $('lnSchedNote').textContent = nt; $('lnSchedNote').style.display = nt ? '' : 'none'; } });
  ['lnAmount', 'lnAfford', 'lnRate', 'lnTerm', 'lnExtra', 'lnFee', 'lnStartY'].forEach(function (id) {
    $(id).addEventListener('input', function () { if (id === 'lnTerm') markTerm(); render(); });
  });
  ['lnFreq', 'lnComp', 'lnFeeHow', 'lnStartM'].forEach(function (id) { $(id).addEventListener('change', function () { markTerm(); render(); }); });
  function markTerm() {
    var v = read('lnTerm').v, y = v != null ? (st.termU === 'yr' ? v : v / 12) : null;
    [].forEach.call($('lnTermChips').querySelectorAll('button'), function (b) { b.classList.toggle('on', y != null && Math.abs(Number(b.getAttribute('data-t')) - y) < 1e-9); });
  }
  [].forEach.call($('lnTermChips').querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () { var t = Number(b.getAttribute('data-t')); $('lnTerm').value = st.termU === 'yr' ? String(t) : String(t * 12); markTerm(); render(); });
  });
  $('lnEx').addEventListener('click', function () {
    st.termU = 'yr';
    [].forEach.call($('lnTermSeg').querySelectorAll('button'), function (x) { x.classList.toggle('on', x.getAttribute('data-u') === 'yr'); });
    $('lnTerm').placeholder = 'e.g. 5'; $('lnTermUnit').textContent = 'years';
    if (st.mode === 'afford') $('lnAfford').value = '300'; else $('lnAmount').value = '15000';
    $('lnRate').value = '8.5'; $('lnTerm').value = '5'; markTerm(); render();
  });
  $('lnAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('lnAdvBtn').classList.toggle('open', st.adv);
    $('lnAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('lnAdvIn').style.display = st.adv ? '' : 'none';
    if (!st.adv) {
      ['lnFee', 'lnStartY'].forEach(function (id) { $(id).value = ''; });
      $('lnStartM').value = String(now.getMonth()); $('lnFreq').value = '12'; $('lnComp').value = '12'; $('lnFeeHow').value = 'out';
      st.feeU = 'pct'; $('lnFee').placeholder = 'e.g. 2';
      [].forEach.call($('lnFeeSeg').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-u') === 'pct'); });
    }
    render();
  });
  $('lnCopy').addEventListener('click', function () {
    if (!last) return;
    var d = last.d, lines = [];
    if (d.afford) lines.push('Loan I can afford: ' + mon0(d.P) + ' at ' + d.apr + '% for ' + termTxt(d) + ', paying ' + mon(d.Q) + ' every ' + PER[d.ppy]);
    else lines.push('Loan: ' + mon0(d.A) + ' at ' + d.apr + '% for ' + termTxt(d) + ', compounding ' + CNAME[d.comp], ADJ[d.ppy] + ' payment: ' + mon(d.base.pay));
    lines.push('Total interest: ' + mon0(d.real.totInt), 'Total of ' + comma(d.real.count) + ' payments: ' + mon0(d.real.totPaid), 'Paid off: ' + dateTxt(d.sm, d.sy, d.real.count, d.ppy));
    if (d.F > 0) lines.push('Origination fee: ' + mon(d.F) + ' (' + HOW[d.how] + ')', 'True APR with the fee: ' + (Math.round(d.trueApr * 100) / 100) + '%');
    if (d.hasExtra) lines.push('Interest saved by extra payments: ' + mon0(d.base.totInt - d.real.totInt));
    var btn = $('lnCopy'), txt = lines.join('\n');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy results'; }, 1600); };
    var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok); } catch (e) { done(false); } };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, legacy); } catch (e) { legacy(); }
  });

  $('lnStartM').value = String(now.getMonth());
  $('lnStartY').placeholder = 'e.g. ' + now.getFullYear();
  render();
};

/* =========================================================
   FINANCE · AUTO LOAN CALCULATOR  (body.p-loan)
   Shares CalcThis.loanEngine (runP / borrowable / autoDeal / autoMaxPrice).
   ========================================================= */
CalcThis.initAutoCalc = function () {
  var E = CalcThis.loanEngine;
  var $ = function (id) { return document.getElementById(id); };
  if (!$('auPrice')) return;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var now = new Date();
  var st = { mode: 'pay', adv: false, sched: 'yearly' };
  var last = null;

  function comma(x) { return x.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  function mon(x) { if (Math.abs(x) < 0.005) x = 0; return '$' + x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function mon0(x) { return '$' + comma(Math.round(x) || 0); }
  function kfmt(x) { return x >= 1e6 ? '$' + (Math.round(x / 1e5) / 10) + 'M' : x >= 1e4 ? '$' + Math.round(x / 1e3) + 'k' : x >= 1e3 ? '$' + (Math.round(x / 100) / 10) + 'k' : '$' + Math.round(x); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function span(m) {
    var y = Math.floor(m / 12), mo = Math.round(m - y * 12);
    if (mo === 12) { y++; mo = 0; }
    if (!y && !mo) return '0 months';
    return (y ? plural(y, 'year') : '') + (y && mo ? ' ' : '') + (mo ? plural(mo, 'month') : '');
  }
  function dateTxt(sm, sy, k) { var t = sm + k; return MON[((t % 12) + 12) % 12] + ' ' + (sy + Math.floor(t / 12)); }

  function read(id) {
    var el = $(id); if (!el) return { e: true };
    var s = (el.value || '').trim(); if (!s) return { e: true };
    var t = s.replace(/[$,%\s]/g, '');
    if (/^[-+.]*$/.test(t)) return { e: true, partial: true };
    var v = Number(t);
    return isNaN(v) || !isFinite(v) ? { bad: true } : { v: v };
  }
  var LABELS = { auPrice: 'Vehicle price', auPay: 'Payment', auRate: 'Interest rate', auTerm: 'Loan term', auInc: 'Cash incentives', auDown: 'Down payment', auTrade: 'Trade-in value', auOwed: 'Amount owed on trade-in', auTax: 'Sales tax', auFees: 'Title, registration and fees', auExtra: 'Extra payment', auDep: 'Yearly value loss', auStartY: 'Start year' };
  var EXS = { auPrice: '35000', auPay: '500', auRate: '6.5', auTerm: '60', auInc: '1000', auDown: '5000', auTrade: '8000', auOwed: '3000', auTax: '7', auFees: '500', auExtra: '50', auDep: '15', auStartY: '2026' };
  function baseMsg() { return st.mode === 'pay' ? 'Enter the vehicle price, interest rate and loan term to see your monthly payment.' : 'Enter the monthly payment you can afford, the interest rate and the loan term to see the car price it covers.'; }

  function setEmpty(msg, hint) {
    var afford = st.mode === 'afford', lab = afford ? 'Car price you can afford' : 'Monthly payment';
    $('auResLab').textContent = lab; $('auResBig').textContent = '—'; $('auResSub').textContent = msg;
    $('auResults').style.display = 'none';
    $('auMLab').textContent = lab; $('auMVal').textContent = '—'; $('auMDec').textContent = '';
    var h = $('auHint'); h.textContent = hint || ''; h.style.display = hint ? 'block' : 'none';
    last = null;
  }

  function calc() {
    var afford = st.mode === 'afford', BASE = baseMsg(), mainId = afford ? 'auPay' : 'auPrice';
    var ids = [mainId, 'auRate', 'auTerm', 'auInc', 'auDown', 'auTrade', 'auOwed', 'auTax', 'auFees'];
    if (st.adv) { ids.push('auDep', 'auStartY'); if (!afford) ids.push('auExtra'); }
    var f = {}, i;
    for (i = 0; i < ids.length; i++) {
      f[ids[i]] = read(ids[i]);
      if (f[ids[i]].bad) return { hint: 'Can’t read “' + LABELS[ids[i]] + '” yet — type a plain number like ' + EXS[ids[i]] + '.' };
    }
    var val = function (id, d) { return f[id] && f[id].v != null ? f[id].v : d; };
    if (f[mainId].e || f.auRate.e || f.auTerm.e) return { msg: BASE };
    var main = f[mainId].v, apr = f.auRate.v, term = f.auTerm.v;
    if (afford) {
      if (!(main >= 0.01)) return { msg: BASE, hint: 'The payment must be at least $0.01.' };
      if (main > 1e7) return { msg: BASE, hint: 'That payment is too large to calculate — enter it in dollars, like 500.' };
    } else {
      if (!(main >= 1)) return { msg: BASE, hint: 'The vehicle price must be at least $1.' };
      if (main > 1e9) return { msg: BASE, hint: 'That price is too large to calculate — enter it in dollars, like 35000.' };
    }
    if (apr < 0 || apr > 100) return { msg: BASE, hint: 'Enter the yearly interest rate as a percentage between 0 and 100, like 6.5.' };
    if (!(term > 0)) return { msg: BASE, hint: 'The loan term must be more than 0 months.' };
    if (term > 120) return { msg: BASE, hint: 'The loan term can be at most 120 months (10 years).' };
    var n = Math.round(term);
    if (n < 1) return { msg: BASE, hint: 'The loan term must be at least 1 month.' };
    var o = { price: main, inc: val('auInc', 0), down: val('auDown', 0), trade: val('auTrade', 0), owed: val('auOwed', 0), taxPct: val('auTax', 0), fees: val('auFees', 0), inLoan: $('auInLoan').checked, taxFull: st.adv && $('auTaxBase').value === 'full' };
    var chk = [['inc', 'auInc'], ['down', 'auDown'], ['trade', 'auTrade'], ['owed', 'auOwed'], ['fees', 'auFees']];
    for (i = 0; i < chk.length; i++) {
      if (o[chk[i][0]] < 0) return { msg: BASE, hint: '“' + LABELS[chk[i][1]] + '” can’t be negative.' };
      if (o[chk[i][0]] > 1e9) return { msg: BASE, hint: '“' + LABELS[chk[i][1]] + '” is too large to calculate — enter it in dollars.' };
    }
    if (o.taxPct < 0 || o.taxPct > 30) return { msg: BASE, hint: 'Enter sales tax as a percentage, usually between 0 and 10 — for example 7.' };
    var dep = st.adv ? val('auDep', 0) : 0;
    if (dep < 0 || dep > 90) return { msg: BASE, hint: 'Enter the yearly value loss as a percentage between 0 and 90 — for example 15.' };
    var extra = !afford && st.adv ? val('auExtra', 0) : 0;
    if (extra < 0) return { msg: BASE, hint: 'The extra payment can’t be negative.' };
    var sm = parseInt($('auStartM').value, 10) || 0;
    var sy = f.auStartY && f.auStartY.v != null ? Math.round(f.auStartY.v) : now.getFullYear();
    if (sy < 1900 || sy > 2200) return { msg: BASE, hint: 'Enter the start year as four digits, like ' + now.getFullYear() + '.' };
    var r = apr / 1200, L, price;
    if (afford) {
      L = E.borrowable(main, r, n);
      if (!(L >= 1)) return { msg: BASE, hint: 'That payment is too small to borrow anything at this rate and term — try a larger payment.' };
      price = E.autoMaxPrice(o, L);
      if (!(price >= 1)) return { msg: BASE, hint: 'That payment is too small once your fees and trade-in debt are covered — try a larger payment.' };
      if (price > 1e10) return { msg: BASE, hint: 'That result is too large to calculate — check the numbers.' };
      if (o.inc > price || o.down > price || o.trade > price || o.fees > price) return { msg: BASE, hint: 'With these amounts that payment is too small to buy a car — try a larger payment, or lower the down payment, trade-in debt or fees.' };
      o.price = price;
    } else {
      price = main;
      if (o.inc > price) return { msg: BASE, hint: 'The cash incentives are larger than the vehicle price — check the amount.' };
      if (o.down > price) return { msg: BASE, hint: 'The down payment is larger than the vehicle price — check the amount.' };
      if (o.trade > price) return { msg: BASE, hint: 'The trade-in is worth more than the vehicle you are buying — check the amount.' };
      if (o.fees > price) return { msg: BASE, hint: 'The fees are larger than the vehicle price — check the amount.' };
      if (extra > price) return { msg: BASE, hint: 'The extra payment is larger than the vehicle price — check the amount.' };
    }
    var dl = E.autoDeal(o);
    if (!afford) { L = dl.L; if (!(L >= 1)) return { msg: BASE, hint: 'Your down payment, trade-in and incentives already cover the whole price — there is nothing to finance.' }; }
    var d = { afford: afford, apr: apr, n: n, r: r, sm: sm, sy: sy, o: o, deal: dl, L: L, price: price, pay: afford ? main : null, extra: extra, dep: dep };
    d.base = E.runP({ P: L, apr: apr, ppy: 12, comp: 12, n: n });
    d.hasExtra = extra > 0;
    d.real = d.hasExtra ? E.runP({ P: L, apr: apr, ppy: 12, comp: 12, n: n, extra: extra }) : d.base;
    d.totCost = price - o.inc + dl.tax + o.fees + d.real.totInt;
    return d;
  }

  /* ---------- charts ---------- */
  function valueAt(d, k) { return d.price * Math.pow(1 - d.dep / 100, k / 12); }
  function balanceChart(d) {
    var W = 300, H = 190, ml = 46, mr = 8, mt = 10, mb = 26, pw = W - ml - mr, ph = H - mt - mb;
    var n = d.base.count, hasDep = d.dep > 0, top = hasDep ? Math.max(d.L, d.price) : d.L, inMonths = n <= 24, tot = inMonths ? n : n / 12;
    var X = function (k) { return ml + pw * k / n; }, Y = function (b) { return mt + ph * (1 - b / top); };
    function path(rows) { var p = 'M' + X(0).toFixed(1) + ',' + Y(d.L).toFixed(1); rows.forEach(function (r) { p += ' L' + X(r.k).toFixed(1) + ',' + Y(r.bal).toFixed(1); }); return p; }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Loan balance over time">';
    [0, 0.5, 1].forEach(function (t) { var y = Y(top * t); s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E7DCC8" stroke-width="1"/><text x="' + (ml - 6) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="14" fill="#6B5B4A">' + kfmt(top * t) + '</text>'; });
    var step = inMonths ? (tot <= 6 ? 1 : tot <= 12 ? 2 : 4) : (tot <= 6 ? 1 : tot <= 12 ? 2 : 5);
    for (var u = 0; u <= tot + 1e-9; u += step) {
      var x = ml + pw * u / tot;
      s += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (mt + ph) + '" y2="' + (mt + ph + 4) + '" stroke="#9A8870"/><text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="14" fill="#6B5B4A">' + (u === 0 ? (inMonths ? 'Mo 0' : 'Yr 0') : u) + '</text>';
    }
    s += '<path d="' + path(d.base.rows) + ' L' + X(n).toFixed(1) + ',' + Y(0).toFixed(1) + ' L' + X(0).toFixed(1) + ',' + Y(0).toFixed(1) + ' Z" fill="#37503F" fill-opacity=".12"/>';
    if (hasDep) {
      var vp = ''; for (var k = 0; k <= n; k++) vp += (k ? ' L' : 'M') + X(k).toFixed(1) + ',' + Y(valueAt(d, k)).toFixed(1);
      s += '<path d="' + vp + '" fill="none" stroke="#B5761F" stroke-width="2" stroke-dasharray="5 4"/>';
    }
    s += '<path d="' + path(d.base.rows) + '" fill="none" stroke="#37503F" stroke-width="2" stroke-linejoin="round"/>';
    if (d.hasExtra) s += '<path d="' + path(d.real.rows) + '" fill="none" stroke="#B5761F" stroke-width="2.4" stroke-linejoin="round"/>';
    if (hasDep && d.cross != null && d.cross > 0 && d.cross < n) {
      var cr = d.base.rows[d.cross - 1], cx = X(cr.k), cy = Y(cr.bal);
      s += '<line x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + cy.toFixed(1) + '" y2="' + (mt + ph) + '" stroke="#B5761F" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="4.5" fill="#B5761F" stroke="#fff" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  }

  /* ---------- schedule ---------- */
  var CAP = 600;
  function schedHtml(d) {
    var rows = d.real.rows, s = '';
    if (st.sched === 'yearly') {
      s = '<thead><tr><th>Year</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>';
      for (var y = 0; y * 12 < rows.length; y++) {
        var it = 0, pr = 0, lastRow = null;
        for (var m = y * 12; m < Math.min(rows.length, y * 12 + 12); m++) { it += rows[m].intr; pr += rows[m].pr; lastRow = rows[m]; }
        s += '<tr><td>' + (y + 1) + '</td><td>' + mon0(it) + '</td><td>' + mon0(pr) + '</td><td>' + mon0(lastRow.bal) + '</td></tr>';
      }
    } else {
      s = '<thead><tr><th>#</th><th>Date</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>';
      rows.slice(0, CAP).forEach(function (r) { s += '<tr><td>' + r.k + '</td><td>' + dateTxt(d.sm, d.sy, r.k) + '</td><td>' + mon(r.intr) + '</td><td>' + mon(r.pr) + '</td><td>' + mon(r.bal) + '</td></tr>'; });
    }
    return s + '</tbody>';
  }
  function schedNote(d) { return d.hasExtra ? 'Schedule includes your extra payments.' : ''; }

  /* ---------- render ---------- */
  function render() {
    var d = calc();
    $('auAfUnit').textContent = '$ per month';
    if (d.hint != null || d.msg != null) { setEmpty(d.msg || baseMsg(), d.hint || ''); return; }
    var h = $('auHint'); h.style.display = 'none'; h.textContent = '';
    var o = d.o, dl = d.deal, pay = d.base.pay, rateTxt = (Math.round(d.apr * 1000) / 1000) + '%', tt = plural(d.n, 'month');
    last = { d: d };
    if (d.afford) {
      $('auResLab').textContent = 'Car price you can afford'; $('auResBig').textContent = mon0(d.price);
      $('auResSub').textContent = 'paying ' + mon(d.pay) + ' a month at ' + rateTxt + ' for ' + tt + ' · loan ' + mon0(d.L);
      $('auMLab').textContent = 'Car price you can afford'; $('auMVal').textContent = mon0(d.price); $('auMDec').textContent = ' · ' + mon(d.pay) + '/mo';
    } else {
      $('auResLab').textContent = 'Monthly payment'; $('auResBig').textContent = mon(pay);
      $('auResSub').textContent = 'financing ' + mon0(d.L) + ' at ' + rateTxt + ' for ' + tt + (d.hasExtra ? ' · plus ' + mon(d.extra) + ' extra each month' : '');
      $('auMLab').textContent = 'Monthly payment'; $('auMVal').textContent = mon(pay); $('auMDec').textContent = ' · ' + tt + ' @ ' + rateTxt;
    }
    $('auResults').style.display = '';

    // takeaways
    var tips = [], up = [];
    if (Math.round(o.down) > 0) up.push(mon0(o.down) + ' down');
    if (!o.inLoan && Math.round(dl.tf) > 0) up.push(mon0(dl.tf) + ' of sales tax and fees');
    tips.push('You pay ' + mon0(dl.upfront) + ' at signing' + (up.length ? ' — ' + up.join(' plus ') : '') + '.');
    if (Math.round(dl.negEq) > 0) tips.push('You owe ' + mon0(dl.negEq) + ' more on your trade-in than it is worth, and that shortfall is added to this loan.');
    $('auTip').textContent = tips.join(' ');
    var sv = $('auSave');
    if (d.hasExtra) {
      var saved = d.base.totInt - d.real.totInt, sooner = d.base.count - d.real.count;
      sv.style.display = ''; sv.textContent = 'Your extra ' + mon(d.extra) + ' a month saves ' + mon0(saved) + ' in interest and finishes ' + (sooner > 0 ? span(sooner) + ' sooner' : 'on schedule') + ' — paid off ' + dateTxt(d.sm, d.sy, d.real.count) + ' instead of ' + dateTxt(d.sm, d.sy, d.base.count) + '.';
    } else sv.style.display = 'none';

    // value vs balance
    d.cross = null;
    var dv = $('auDepTip');
    if (d.dep > 0) {
      var lastUnder = 0, dtxt = (Math.round(d.dep * 100) / 100) + '% a year';
      for (var k = 0; k <= d.base.count; k++) { var bal = k === 0 ? d.L : d.base.rows[k - 1].bal; if (bal > valueAt(d, k) + 0.005) lastUnder = k; }
      dv.style.display = '';
      if (lastUnder === 0) dv.textContent = 'At ' + dtxt + ', the car stays worth more than you owe for the whole loan.';
      else if (lastUnder >= d.base.count) dv.textContent = 'At ' + dtxt + ', you owe more than the car is worth for the entire loan.';
      else { d.cross = lastUnder + 1; dv.textContent = 'At ' + dtxt + ', you owe more than the car is worth until payment ' + d.cross + ' (' + dateTxt(d.sm, d.sy, d.cross) + ').'; }
    } else dv.style.display = 'none';

    $('auChartTtl').textContent = d.dep > 0 ? 'Your balance vs what the car is worth' : 'Your balance over the loan';
    $('auChart').innerHTML = balanceChart(d);
    $('auChartLeg').innerHTML = '<span><i style="background:#37503F"></i>Loan balance</span>' + (d.dep > 0 ? '<span><i style="background:#B5761F;opacity:.7"></i>Car value (' + (Math.round(d.dep * 100) / 100) + '% a year)</span>' : '') + (d.hasExtra ? '<span><i style="background:#B5761F"></i>Balance with extra payments</span>' : '') + (d.cross ? '<span><i class="ln-dot"></i>You owe less than it is worth</span>' : '');

    // where the money goes
    var credits = Math.max(0, dl.net) + o.inc, seg = [
      ['Paid upfront', dl.upfront, '#8F5C13'], ['Trade-in & incentives', credits, '#6E8A74'], ['Loan principal', d.L, '#37503F'], ['Interest', d.real.totInt, '#B5761F']
    ], tot = 0; seg.forEach(function (x) { tot += x[1]; });
    var bar = '', leg = '';
    seg.forEach(function (x) {
      if (x[1] <= 0) return;
      var p = x[1] / tot * 100;
      bar += '<div class="ln-seg" style="width:' + p.toFixed(2) + '%;background:' + x[2] + '">' + (p >= 12 ? Math.round(p) + '%' : '') + '</div>';
      leg += '<span><i style="background:' + x[2] + '"></i>' + x[0] + ' ' + mon0(x[1]) + '</span>';
    });
    $('auLife').innerHTML = bar; $('auLifeLeg').innerHTML = leg;

    var sm = '<tbody><tr><td>' + (d.afford ? 'Car price you can afford' : 'Vehicle price') + '</td><td>' + mon0(d.price) + '</td></tr>';
    if (Math.round(o.inc) > 0) sm += '<tr><td>Cash incentives</td><td>−' + mon0(o.inc) + '</td></tr>';
    sm += '<tr><td>Sales tax' + (o.taxPct > 0 ? ' (' + (Math.round(o.taxPct * 1000) / 1000) + '%)' : '') + '</td><td>' + mon0(dl.tax) + '</td></tr>';
    if (Math.round(o.fees) > 0) sm += '<tr><td>Title, registration &amp; fees</td><td>' + mon0(o.fees) + '</td></tr>';
    if (Math.round(Math.abs(dl.net)) > 0) sm += '<tr><td>Trade-in ' + (dl.net >= 0 ? 'equity' : 'shortfall (added to loan)') + '</td><td>' + (dl.net >= 0 ? '−' : '') + mon0(Math.abs(dl.net)) + '</td></tr>';
    if (Math.round(o.down) > 0) sm += '<tr><td>Down payment</td><td>−' + mon0(o.down) + '</td></tr>';
    sm += '<tr><td>Amount financed</td><td>' + mon0(d.L) + '</td></tr><tr><td>Upfront payment</td><td>' + mon0(dl.upfront) + '</td></tr>';
    sm += '<tr><td>Total interest</td><td>' + mon0(d.real.totInt) + '</td></tr><tr><td>Total of ' + comma(d.real.count) + ' payments</td><td>' + mon0(d.real.totPaid) + '</td></tr>';
    sm += '<tr><td>Total cost (price, interest, tax, fees)</td><td>' + mon0(d.totCost) + '</td></tr><tr><td>Paid off</td><td>' + dateTxt(d.sm, d.sy, d.real.count) + '</td></tr>';
    if (d.hasExtra) sm += '<tr><td>Interest saved by extra payments</td><td>' + mon0(d.base.totInt - d.real.totInt) + '</td></tr>';
    $('auSum').innerHTML = sm + '</tbody>';

    // compare terms
    var termList = [36, 48, 60, 72, 84];
    if (termList.indexOf(d.n) < 0) { termList.push(d.n); termList.sort(function (a, b) { return a - b; }); }
    $('auTermsTtl').textContent = d.afford ? 'What the same payment buys over other terms' : 'Compare loan terms — same price and rate';
    var tbl = '<thead><tr><th>Term</th><th>' + (d.afford ? 'Car price' : 'Payment') + '</th><th>Total interest</th></tr></thead><tbody>';
    termList.forEach(function (nn) {
      var cur = nn === d.n;
      if (d.afford) { var Lb = E.borrowable(d.pay, d.r, nn), pr = E.autoMaxPrice(o, Lb); tbl += '<tr' + (cur ? ' class="cur"' : '') + '><td>' + nn + ' months</td><td>' + (pr >= 1 ? mon0(pr) : '—') + '</td><td>' + (Lb >= 1 ? mon0(d.pay * nn - Lb) : '—') + '</td></tr>'; }
      else { var p = E.pmt(d.L, d.r, nn); tbl += '<tr' + (cur ? ' class="cur"' : '') + '><td>' + nn + ' months</td><td>' + mon(p) + '</td><td>' + mon0(p * nn - d.L) + '</td></tr>'; }
    });
    $('auTerms').innerHTML = tbl + '</tbody>';

    $('auCopyWrap').style.display = st.adv ? '' : 'none';
    $('auSched').innerHTML = schedHtml(d);
    var cm = $('auSchedNote'), nt = schedNote(d);
    cm.textContent = nt; cm.style.display = nt ? '' : 'none';
  }

  /* ---------- controls ---------- */
  function seg(id, attr, fn) {
    var el = $(id);
    [].forEach.call(el.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(el.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        fn(b.getAttribute(attr));
      });
    });
  }
  seg('auModeSeg', 'data-v', function (v) {
    st.mode = v;
    var afford = v === 'afford';
    $('auPriceFld').style.display = afford ? 'none' : '';
    $('auPayFld').style.display = afford ? '' : 'none';
    $('auExtraFld').style.display = afford ? 'none' : '';
    $('auEx').textContent = afford ? 'See an example: $500 a month, $5,000 down, 7% tax' : 'See an example: $35,000 car, $5,000 down, $8,000 trade-in';
    render();
  });
  seg('auSchedSeg', 'data-v', function (v) { st.sched = v; if (last) { $('auSched').innerHTML = schedHtml(last.d); var nt = schedNote(last.d); $('auSchedNote').textContent = nt; $('auSchedNote').style.display = nt ? '' : 'none'; } });
  ['auPrice', 'auPay', 'auRate', 'auTerm', 'auInc', 'auDown', 'auTrade', 'auOwed', 'auTax', 'auFees', 'auExtra', 'auDep', 'auStartY'].forEach(function (id) {
    $(id).addEventListener('input', function () { if (id === 'auTerm') markTerm(); render(); });
  });
  $('auInLoan').addEventListener('change', render);
  ['auTaxBase', 'auStartM'].forEach(function (id) { $(id).addEventListener('change', render); });
  function markTerm() {
    var v = read('auTerm').v;
    [].forEach.call($('auTermChips').querySelectorAll('button'), function (b) { b.classList.toggle('on', v != null && Number(b.getAttribute('data-t')) === v); });
  }
  [].forEach.call($('auTermChips').querySelectorAll('button'), function (b) {
    b.addEventListener('click', function () { $('auTerm').value = b.getAttribute('data-t'); markTerm(); render(); });
  });
  $('auEx').addEventListener('click', function () {
    var afford = st.mode === 'afford';
    $('auPay').value = afford ? '500' : ''; $('auPrice').value = afford ? '' : '35000';
    $('auRate').value = '6.5'; $('auTerm').value = '60'; $('auDown').value = '5000'; $('auInc').value = '';
    $('auTrade').value = afford ? '' : '8000'; $('auOwed').value = afford ? '' : '3000'; $('auTax').value = '7'; $('auFees').value = '500';
    markTerm(); render();
  });
  $('auAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('auAdvBtn').classList.toggle('open', st.adv);
    $('auAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('auAdvIn').style.display = st.adv ? '' : 'none';
    if (!st.adv) {
      ['auExtra', 'auDep', 'auStartY'].forEach(function (id) { $(id).value = ''; });
      $('auTaxBase').value = 'diff'; $('auStartM').value = String(now.getMonth());
    }
    render();
  });
  $('auCopy').addEventListener('click', function () {
    if (!last) return;
    var d = last.d, dl = d.deal, lines = [];
    if (d.afford) lines.push('Car price I can afford: ' + mon0(d.price) + ' (paying ' + mon(d.pay) + ' a month at ' + d.apr + '% for ' + d.n + ' months)');
    else lines.push('Vehicle price: ' + mon0(d.price), 'Monthly payment: ' + mon(d.base.pay) + ' (' + d.n + ' months at ' + d.apr + '%)');
    lines.push('Amount financed: ' + mon0(d.L), 'Sales tax: ' + mon0(dl.tax), 'Upfront payment: ' + mon0(dl.upfront), 'Total interest: ' + mon0(d.real.totInt), 'Total cost (price, interest, tax, fees): ' + mon0(d.totCost), 'Paid off: ' + dateTxt(d.sm, d.sy, d.real.count));
    if (d.hasExtra) lines.push('Interest saved by extra payments: ' + mon0(d.base.totInt - d.real.totInt));
    var btn = $('auCopy'), txt = lines.join('\n');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy results'; }, 1600); };
    var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok); } catch (e) { done(false); } };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, legacy); } catch (e) { legacy(); }
  });

  $('auStartM').value = String(now.getMonth());
  $('auStartY').placeholder = 'e.g. ' + now.getFullYear();
  render();
};

/* =========================================================
   FINANCE · PAYCHECK CALCULATOR  (body.p-pay)
   One pure engine (CalcThis.payEngine — no DOM): IRS Pub 15-T federal withholding,
   FICA, and each state's official withholding formula; page code follows.
   ========================================================= */
/* PAY-ENGINE:START */
CalcThis.payEngine = (function () {
  var YEAR = 2026;
  var PPY = { daily: 260, weekly: 52, weekly53: 53, biweekly: 26, biweekly27: 27, semimonthly: 24, monthly: 12, quarterly: 4, semiannual: 2, annual: 1 };
  var SS_RATE = 0.062, SS_BASE = 184500, MED_RATE = 0.0145, ADDL_RATE = 0.009, ADDL_THR = 200000;
  var ALLOWANCE_OLD = 4300, STEP2_MFJ = 12900, STEP2_OTHER = 8600;
  // IRS Pub 15-T (2026), annual percentage method, checked against the IRS PDF. Rows: [floor, base, rate].
  var STD = {
    married: [[0, 0, 0], [19300, 0, .10], [44100, 2480, .12], [120100, 11600, .22], [230700, 35932, .24], [422850, 82048, .32], [531750, 116896, .35], [788000, 206583.50, .37]],
    single: [[0, 0, 0], [7500, 0, .10], [19900, 1240, .12], [57900, 5800, .22], [113200, 17966, .24], [209275, 41024, .32], [263725, 58448, .35], [648100, 192979.25, .37]],
    hoh: [[0, 0, 0], [15550, 0, .10], [33250, 1770, .12], [83000, 7740, .22], [121250, 16155, .24], [217300, 39207, .32], [271750, 56631, .35], [656150, 191171, .37]]
  };
  var CHK = {
    married: [[0, 0, 0], [16100, 0, .10], [28500, 1240, .12], [66500, 5800, .22], [121800, 17966, .24], [217875, 41024, .32], [272325, 58448, .35], [400450, 103291.75, .37]],
    single: [[0, 0, 0], [8050, 0, .10], [14250, 620, .12], [33250, 2900, .22], [60900, 8983, .24], [108938, 20512, .32], [136163, 29224, .35], [328350, 96489.63, .37]],
    hoh: [[0, 0, 0], [12075, 0, .10], [20925, 885, .12], [45800, 3870, .22], [64925, 8077.50, .24], [112950, 19603.50, .32], [140175, 28315.50, .35], [332375, 95585.50, .37]]
  };
  function tab(rows, x) {
    if (!(x > 0)) return 0;
    var r = rows[0];
    for (var i = 1; i < rows.length; i++) if (x >= rows[i][0]) r = rows[i]; else break;
    return r[1] + r[2] * (x - r[0]);
  }
  function whole(x) { return Math.floor(x + 0.5); }
  function num(v) { v = +v; return isFinite(v) ? v : 0; }

  // Federal income tax withheld for one pay period (Pub 15-T Worksheet 1A).
  function federal(o) {
    var ppy = o.ppy, annual = o.wages * ppy, aaw, rows, st = o.status;
    if (o.w4 === 'old') {
      aaw = annual - num(o.allowances) * ALLOWANCE_OLD;
      rows = STD[st === 'married' ? 'married' : 'single'];
    } else {
      var s2 = o.step2 ? 0 : (st === 'married' ? STEP2_MFJ : STEP2_OTHER);
      aaw = annual + num(o.other4a) - (num(o.ded4b) + s2);
      rows = (o.step2 ? CHK : STD)[st];
    }
    if (aaw < 0) aaw = 0;
    var tent = tab(rows, aaw) / ppy;
    var cr = o.w4 === 'old' ? 0 : num(o.credit) / ppy;
    var t = Math.max(0, tent - cr);
    return { aaw: aaw, tentative: tent, tax: t + num(o.extra) };
  }

  // Social Security / Medicare for one pay period. ytd = gross wages already paid this year (before this check).
  function fica(o) {
    var w = o.wages, ytd = o.ytd || 0, ss = 0, med = 0, add = 0;
    if (!o.exemptSS) ss = Math.max(0, Math.min(w, SS_BASE - ytd)) * SS_RATE;
    if (!o.exemptMed) {
      med = w * MED_RATE;
      add = Math.max(0, ytd + w - Math.max(ytd, ADDL_THR)) * ADDL_RATE;
    }
    return { ss: ss, med: med, addl: add };
  }

  // ---------- State income tax ----------
  // Every record is copied from the official state publication named in src (see md-files/paycheck-state-data.js).
  var STATES = {};
  var METHODS = {
    none: function () { return { tax: 0 }; },
    // annualize, subtract standard deduction + dependents/allowances, flat rate
    flatann: function (S, o) {
      var a = o.wages * o.ppy, sd = S.stdDed ? (S.stdDed[o.status] || 0) : 0;
      var ded = sd + (S.dep || 0) * num(o.allowances) + (S.allow2 || 0) * num(o.allowances2);
      var t = Math.max(0, a - ded) * S.rate / o.ppy;
      if (S.roundWhole) t = whole(t);
      return { tax: t };
    },
    // annualize, subtract standard deduction + per-allowance amount, progressive rows
    ann: function (S, o) {
      var a = o.wages * o.ppy, sd = S.stdDed ? (S.stdDed[o.status] || 0) : 0;
      var ded = sd + (S.allow || 0) * num(o.allowances) + (S.allow2 || 0) * num(o.allowances2);
      var rows = S.tab[o.status === 'hoh' && S.tab.hoh ? 'hoh' : (o.status === 'married' ? 'married' : 'single')];
      var t = Math.max(0, tab(rows, Math.max(0, a - ded))) / o.ppy;
      if (S.roundUp) t = Math.ceil(t - 1e-9);
      return { tax: S.roundWhole ? whole(t) : t };
    },
    // Arizona: wages x the percentage chosen on Form A-4 (default 2.0%)
    pct: function (S, o) {
      var p = o.allowances === undefined || o.allowances === null || o.allowances === '' ? S.defaultPct : num(o.allowances);
      return { tax: o.wages * p / 100 };
    },
    // Iowa: (annual wages - deduction) x rate, less the allowance amount from the IA W-4
    ia: function (S, o) {
      var a = o.wages * o.ppy, d = S.ded[o.status] || S.ded.single;
      return { tax: Math.max(0, (Math.max(0, a - d) * S.rate - num(o.allowances))) / o.ppy };
    },
    ca: function (S, o) {
      var a = o.wages * o.ppy, st = o.status, al = num(o.allowances), ex = num(o.allowances2);
      var key = st === 'hoh' ? 'hoh' : (st === 'married' ? (al >= 2 ? 'married2' : 'married0') : 'single');
      if (a <= S.lowIncome[key]) return { tax: 0 };
      var tx = Math.max(0, a - ex * S.estDed - S.stdDed[key]);
      var tb = st === 'hoh' ? 'hoh' : (st === 'married' ? 'married' : 'single');
      return { tax: Math.max(0, tab(S.tab[tb], tx) - al * S.credit) / o.ppy };
    },
    ny: function (S, o) {
      var a = o.wages * o.ppy, st = o.status === 'married' ? 'married' : 'single';
      var net = a - (S.ded[st] + S.exemption * num(o.allowances));
      if (net <= 0) return { tax: 0 };
      var T = S.top[st], t;
      if (net >= T.from) { var rr = T.rows[0]; for (var i = 0; i < T.rows.length; i++) if (net >= T.rows[i][0]) rr = T.rows[i]; t = net * rr[1]; }
      else t = tab(S.tab[st], net);
      return { tax: t / o.ppy };
    },
    // Alabama: Form A-4 exemption code (S / M / H) + dependents; the annual federal tax withheld is deducted
    al: function (S, o) {
      var gi = o.wages * o.ppy, st = o.status, ceil = Math.ceil;
      var sd;
      if (st === 'married') sd = gi <= 25999 ? 8500 : (gi < 35500 ? 8500 - 175 * ceil((gi - 25999) / 500) : 5000);
      else if (st === 'hoh') sd = gi <= 25999 ? 5200 : (gi < 35500 ? 5200 - 135 * ceil((gi - 25999) / 500) : 2500);
      else sd = gi <= 25999 ? 3000 : (gi < 35500 ? 3000 - 25 * ceil((gi - 25999) / 500) : 2500);
      var pe = st === 'married' || st === 'hoh' ? 3000 : 1500;
      var dp = gi <= 50000 ? 1000 : (gi <= 100000 ? 500 : 300);
      var taxable = gi - sd - o.fedTax * o.ppy - pe - dp * num(o.allowances);
      if (taxable <= 0) return { tax: 0 };
      var t = st === 'married' ? Math.min(taxable, 1000) * .02 + Math.max(0, Math.min(taxable, 6000) - 1000) * .04 + Math.max(0, taxable - 6000) * .05
        : Math.min(taxable, 500) * .02 + Math.max(0, Math.min(taxable, 3000) - 500) * .04 + Math.max(0, taxable - 3000) * .05;
      return { tax: t / o.ppy };
    }
  };
  function stateTax(code, o) {
    var S = STATES[code];
    if (!S || S.method === 'pending') return null;
    return METHODS[S.method](S, o);
  }
  // Employee-paid state payroll programs: rate on wages up to an annual wage base, using year-to-date wages.
  function programs(code, wages, ytd, ppy) {
    var S = STATES[code], out = [];
    if (!S || !S.programs) return out;
    for (var i = 0; i < S.programs.length; i++) {
      var p = S.programs[i], base = p.base || 1e12;
      var w = Math.max(0, Math.min(ytd + wages, base) - Math.min(ytd, base));
      var amt = w * p.rate;
      if (p.capAnnual) amt = Math.min(amt, p.capAnnual / ppy);   // e.g. NY disability: 0.5% of wages, at most $0.60 a week
      out.push({ name: p.name, amt: amt });
    }
    return out;
  }

  // ---------- Whole paycheck ----------
  // inp: { gross, ppy, ytd, preTax:[{amt, inc, fica, kind}], postTax:[{amt}], fed:{...}, ficaX:{exemptSS, exemptMed}, state:{code, status, allowances, allowances2, extra, exempt}, roundFed }
  function paycheck(inp) {
    var ppy = inp.ppy, g = num(inp.gross), i, pre = inp.preTax || [], post = inp.postTax || [];
    var preInc = 0, preFica = 0, preAll = 0;
    for (i = 0; i < pre.length; i++) {
      var a = num(pre[i].amt); preAll += a;
      if (pre[i].inc !== false) preInc += a;
      if (pre[i].fica) preFica += a;
    }
    var incWages = Math.max(0, g - preInc), ficaWages = Math.max(0, g - preFica);
    var fx = inp.fed || {};
    var fedR = fx.exempt ? { tax: 0, aaw: 0, tentative: 0 } : federal({
      wages: incWages, ppy: ppy, w4: fx.w4 || 'new', status: fx.status || 'single', step2: !!fx.step2, credit: fx.credit,
      other4a: fx.other4a, ded4b: fx.ded4b, extra: fx.extra, allowances: fx.allowances
    });
    var fedTax = inp.roundFed ? whole(fedR.tax) : fedR.tax;
    var fc = fica({ wages: ficaWages, ytd: inp.ytd, exemptSS: inp.ficaX && inp.ficaX.exemptSS, exemptMed: inp.ficaX && inp.ficaX.exemptMed });
    var st = inp.state || {}, stateAmt = 0, stateKnown = true, progs = [];
    if (st.code) {
      var S = STATES[st.code], stW = Math.max(0, g - preStateInc(pre, S));
      var r = stateTax(st.code, { wages: stW, ppy: ppy, status: st.status || fx.status || 'single', allowances: st.allowances, allowances2: st.allowances2, fedTax: fedTax });
      if (r === null) stateKnown = false;
      else if (!st.exempt) stateAmt = r.tax + num(st.extra);
      if (r !== null) progs = programs(st.code, ficaWages, inp.ytd || 0, ppy);
    }
    var progAll = 0; for (i = 0; i < progs.length; i++) progAll += progs[i].amt;
    var postAll = 0; for (i = 0; i < post.length; i++) postAll += num(post[i].amt);
    var net = g - preAll - fedTax - fc.ss - fc.med - fc.addl - stateAmt - progAll - postAll;
    return { gross: g, preTax: preAll, fed: fedTax, ss: fc.ss, med: fc.med, addl: fc.addl, state: stateAmt, programs: progs, programTotal: progAll, stateKnown: stateKnown, post: postAll, net: net, aaw: fedR.aaw, incWages: incWages, ficaWages: ficaWages };
  }
  function preStateInc(pre, S) {
    var s = 0;
    for (var i = 0; i < pre.length; i++) {
      if (pre[i].inc === false) continue;
      if (S && S.taxes401k && pre[i].kind === '401k') continue;
      s += num(pre[i].amt);
    }
    return s;
  }

  return { YEAR: YEAR, PPY: PPY, SS_BASE: SS_BASE, STD: STD, CHK: CHK, tab: tab, federal: federal, fica: fica, paycheck: paycheck, STATES: STATES, METHODS: METHODS, stateTax: stateTax, programs: programs, whole: whole };
})();
/* PAY-ENGINE:END */
/* PAY-STATES:START */
(function (S) {
  function none(n, extra) { var o = { name: n, method: 'none', src: 'No state tax on wages' }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  S.AK = none('Alaska'); S.FL = none('Florida'); S.NV = none('Nevada'); S.NH = none('New Hampshire'); S.SD = none('South Dakota');
  S.TN = none('Tennessee'); S.TX = none('Texas'); S.WY = none('Wyoming');
  S.WA = none('Washington', { programs: [{ name: 'WA Paid Family & Medical Leave', rate: .0113 * .7143, base: 184500 }, { name: 'WA Cares Fund', rate: .0058 }] });
  S.CA = { name: 'California', method: 'ca', src: 'https://edd.ca.gov/siteassets/files/pdf_pub_ctr/26methb.pdf', stdDed: { single: 5706, married0: 5706, married2: 11412, hoh: 11412 },
    lowIncome: { single: 18896, married0: 18896, married2: 37791, hoh: 37791 }, credit: 168.30, estDed: 1000,
    tab: {
      single: [[0, 0, .011], [11079, 121.87, .022], [26264, 455.94, .044], [41452, 1124.21, .066], [57542, 2186.15, .088], [72724, 3522.17, .1023], [371479, 34084.81, .1133], [445771, 42502.09, .1243], [742953, 79441.81, .1353], [1000000, 114220.27, .1463]],
      married: [[0, 0, .011], [22158, 243.74, .022], [52528, 911.88, .044], [82904, 2248.42, .066], [115084, 4372.30, .088], [145448, 7044.33, .1023], [742958, 68169.60, .1133], [891542, 85004.17, .1243], [1000000, 98485.50, .1353], [1485906, 164228.58, .1463]],
      hoh: [[0, 0, .011], [22173, 243.90, .022], [52530, 911.75, .044], [67716, 1579.93, .066], [83805, 2641.80, .088], [98990, 3978.08, .1023], [505208, 45534.18, .1133], [606251, 56982.35, .1243], [1000000, 105925.35, .1353], [1010417, 107334.77, .1463]]
    }, programs: [{ name: 'CA State Disability Insurance', rate: .013 }] };
  S.GA = { name: 'Georgia', method: 'flatann', src: 'https://dor.georgia.gov/document/document/2026-employers-tax-guide-updated-june-2026/download', rate: .0499, stdDed: { married: 30000, single: 15000, hoh: 15000 }, dep: 5000 };
  S.NY = { name: 'New York', method: 'ny', src: 'https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nys.pdf', ded: { single: 7400, married: 7950 }, exemption: 1000,
    tab: {
      single: [[0, 0, .039], [8500, 332, .044], [11700, 472, .0515], [13900, 586, .054], [80650, 4190, .059], [96800, 5143, .0703], [107650, 5906, .0753], [157650, 9673, .064], [215400, 13369, .1144], [265400, 19091, .0735]],
      married: [[0, 0, .039], [8500, 332, .044], [11700, 472, .0515], [13900, 586, .054], [80650, 4190, .059], [96800, 5143, .0657], [107650, 5855, .0707], [157650, 9388, .0801], [211550, 13708, .064], [323200, 20854, .1349], [373200, 27600, .0735], [1077550, 79369, .0765]]
    },
    top: { single: { from: 1077550, rows: [[1077550, .1045], [5000000, .111], [25000000, .117]] }, married: { from: 2155350, rows: [[2155350, .1045], [5000000, .111], [25000000, .117]] } },
    programs: [{ name: 'NY State Disability (SDI)', rate: .005, capAnnual: 31.20 }, { name: 'NY Paid Family Leave', rate: .00432, base: 95350 }] };
  S.IL = { name: 'Illinois', method: 'flatann', src: 'https://tax.illinois.gov/forms/withholding/currentyear/il-700-t-withholding-guide-tables.html', rate: .0495, dep: 2925, allow2: 1000 };
  S.MI = { name: 'Michigan', method: 'flatann', src: 'https://www.michigan.gov/taxes/business-taxes/withholding/calendar-year-tax-information', rate: .0425, dep: 5900 };
  S.NC = { name: 'North Carolina', method: 'flatann', src: 'https://www.ncdor.gov/income-tax-withholding-tables-and-instructions-employers/open', rate: .0409, stdDed: { single: 12750, married: 12750, hoh: 19125 }, dep: 2500, roundWhole: true };
  S.VA = { name: 'Virginia', method: 'ann', src: 'https://www.tax.virginia.gov/sites/default/files/vatax-pdf/employer-withholding-instructions.pdf', stdDed: { single: 8750, married: 8750, hoh: 8750 }, allow: 930,
    tab: { single: [[0, 0, .02], [3000, 60, .03], [5000, 120, .05], [17000, 720, .0575]], married: [[0, 0, .02], [3000, 60, .03], [5000, 120, .05], [17000, 720, .0575]] } };
  S.MN = { name: 'Minnesota', method: 'ann', programs: [{ name: 'MN Paid Leave', rate: .0044, base: 184500 }], src: 'https://www.revenue.state.mn.us/sites/default/files/2025-12/wh-inst-26.pdf', allow: 5300,
    tab: { single: [[0, 0, 0], [4700, 0, .0535], [38010, 1782.09, .068], [114130, 6958.25, .0785], [207850, 14315.27, .0985]], married: [[0, 0, 0], [14700, 0, .0535], [63400, 2605.45, .068], [208180, 12450.49, .0785], [352630, 23789.82, .0985]] } };
  S.AL = { name: 'Alabama', method: 'al', src: 'https://revenue.alabama.gov/wp-content/uploads/2026/01/whbooklet_0126.pdf' };
  S.AZ = { name: 'Arizona', method: 'pct', src: 'https://azdor.gov/forms/withholding', defaultPct: 2.0 };
  S.CO = { name: 'Colorado', method: 'flatann', src: 'https://tax.colorado.gov/sites/default/files/documents/DR_1098_Colorado_Withholding_Worksheet_for_Employees.pdf', rate: .044, stdDed: { single: 5500, married: 11000, hoh: 5500 },
    programs: [{ name: 'CO Paid Family & Medical Leave', rate: .0044, base: 184500 }] };
  S.KY = { name: 'Kentucky', method: 'flatann', src: 'https://revenue.ky.gov/Forms/2026%20Withholding%20Formula.pdf', rate: .035, stdDed: { single: 3360, married: 3360, hoh: 3360 } };
  S.IA = { name: 'Iowa', method: 'ia', src: 'https://revenue.iowa.gov/media/53/download', rate: .038, ded: { single: 13000, married: 26000, hoh: 19500 } };
  S.MO = { name: 'Missouri', method: 'ann', note: 'Missouri “married” assumes the spouse does not work (full $32,200 deduction); if your spouse works, choose Single. Withholding is rounded to the dollar, as Missouri requires.', src: 'https://dor.mo.gov/forms/Withholding%20Formula_2026.pdf', roundWhole: true, stdDed: { single: 16100, married: 32200, hoh: 24150 },
    tab: { single: [[0, 0, 0], [1348, 0, 0.02], [2696, 26.96, 0.025], [4044, 60.66, 0.03], [5392, 101.1, 0.035], [6740, 148.28, 0.04], [8088, 202.2, 0.045], [9436, 262.86, 0.047]], married: [[0, 0, 0], [1348, 0, 0.02], [2696, 26.96, 0.025], [4044, 60.66, 0.03], [5392, 101.1, 0.035], [6740, 148.28, 0.04], [8088, 202.2, 0.045], [9436, 262.86, 0.047]] } };
  S.MT = { name: 'Montana', method: 'ann', src: 'https://revenuefiles.mt.gov/files/Forms/Montana_Employer_and_Information_Agent_Guide_with_Tax_Tables.pdf', roundUp: true,
    note: 'Montana “married” assumes only one spouse works (the Form MW-4 line 1b table); if both spouses work, choose Single. Withholding is rounded up to the next dollar, as Montana requires.',
    tab: { single: [[0, 0, 0], [16100, 0, .047], [63600, 2232.5, .0565]], married: [[0, 0, 0], [32200, 0, .047], [127200, 4465, .0565]], hoh: [[0, 0, 0], [24150, 0, .047], [95400, 3348.75, .0565]] } };
  S.PA = { name: 'Pennsylvania', method: 'flatann', src: 'https://www.pa.gov/agencies/dli/resources/for-employers-and-educators/how-to-file/uc-tax', rate: .0307, taxes401k: true, programs: [{ name: 'PA Unemployment (employee)', rate: .0007 }] };
  var SL = { AL: 'alabama', AK: 'alaska', AZ: 'arizona', CA: 'california', CO: 'colorado', FL: 'florida', GA: 'georgia', IL: 'illinois', IA: 'iowa', KY: 'kentucky', MI: 'michigan', MN: 'minnesota', MO: 'missouri', MT: 'montana', NV: 'nevada', NH: 'new-hampshire', NY: 'new-york', NC: 'north-carolina', PA: 'pennsylvania', SD: 'south-dakota', TN: 'tennessee', TX: 'texas', VA: 'virginia', WA: 'washington', WY: 'wyoming' };
  for (var k in SL) if (S[k]) S[k].slug = SL[k];
})(CalcThis.payEngine.STATES);
/* PAY-STATES:END */

CalcThis.initPayCalc = function () {
  var E = CalcThis.payEngine;
  var $ = function (id) { return document.getElementById(id); };
  if (!$('pcGross')) return;
  var st = { mode: 'salary', unit: 'year', w4: 'new', adv: false };
  var last = null;
  var FREQ = [['daily', 'Daily'], ['weekly', 'Weekly'], ['weekly53', 'Weekly (53 paychecks)'], ['biweekly', 'Bi-weekly'], ['biweekly27', 'Bi-weekly (27 paychecks)'], ['semimonthly', 'Semi-monthly'], ['monthly', 'Monthly'], ['quarterly', 'Quarterly'], ['semiannual', 'Semi-annually'], ['annual', 'Annually']];
  var FREQ_WORD = { daily: 'daily', weekly: 'weekly', weekly53: 'weekly', biweekly: 'bi-weekly', biweekly27: 'bi-weekly', semimonthly: 'semi-monthly', monthly: 'monthly', quarterly: 'quarterly', semiannual: 'semi-annual', annual: 'annual' };
  var NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
  // Labels for each state's own withholding form fields (the tax data itself lives in CalcThis.payEngine.STATES).
  var SFIELDS = {
    AL: ['Dependents (Form A-4)'], AZ: ['Withholding percentage (Form A-4, default 2)'], IA: ['Total allowance amount (IA W-4)'], CA: ['Allowances (DE 4)', 'Extra allowances for deductions (DE 4)'], GA: ['Dependents (Form G-4)'],
    IL: ['Basic allowances (IL-W-4, line 1)', 'Additional allowances (IL-W-4, line 2)'], MI: ['Exemptions (MI-W4)'], MN: ['Allowances (W-4MN)'],
    NC: ['Allowances (NC-4)'], NY: ['Exemptions (IT-2104)'], VA: ['Exemptions (VA-4)']
  };

  function comma(x) { return x.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  function mon(x) { if (Math.abs(x) < 0.005) x = 0; return (x < 0 ? '−$' : '$') + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function monS(x) { return Math.abs(x) >= 1e5 ? mon0(x) : mon(x); }
  function mon0(x) { x = Math.round(x) || 0; return (x < 0 ? '−$' : '$') + comma(Math.abs(x)); }
  function pct(x) { return (Math.round(x * 10) / 10) + '%'; }
  function kfmt(x) { return x >= 1e6 ? '$' + (Math.round(x / 1e5) / 10) + 'M' : x >= 1e3 ? '$' + (Math.round(x / 100) / 10) + 'k' : '$' + Math.round(x); }

  function read(id) {
    var el = $(id); if (!el) return { e: true };
    var s = (el.value || '').trim(); if (!s) return { e: true };
    var t = s.replace(/[$,\s]/g, '');
    if (/^[-+.]*$/.test(t)) return { e: true, partial: true };
    var isPct = /%$/.test(t); t = t.replace(/%$/, '');
    var v = Number(t);
    return isNaN(v) || !isFinite(v) || t === '' ? { bad: true } : { v: v, pct: isPct };
  }
  var LABELS = { pcGross: 'Pay', pcRate: 'Hourly rate', pcHours: 'Hours per week', pcOtHours: 'Overtime hours', pcOtMult: 'Overtime multiplier', pcYtd: 'Year-to-date pay', pcCredit: 'Step 3 amount', pc4a: 'Step 4(a) other income', pc4b: 'Step 4(b) deductions', pcFedExtra: 'Extra federal withholding', pcAllow: 'Allowances', pcStAllow: 'State allowances or amount', pcStAllow2: 'Additional state allowances', pcStExtra: 'Extra state withholding', pc401k: '401(k) contribution', pcHealth: 'Health insurance', pcHsa: 'HSA / FSA / commuter', pcPreOther: 'Other before-tax deduction', pcRoth: 'Roth contribution', pcPostOther: 'Other after-tax deduction' };
  var EXS = { pcGross: '65000', pcRate: '22', pcHours: '40', pcOtHours: '5', pcOtMult: '1.5', pcYtd: '30000', pcCredit: '2000', pc4a: '1000', pc4b: '5000', pcFedExtra: '25', pcAllow: '2', pcStAllow: '2', pcStAllow2: '1', pcStExtra: '10', pc401k: '6%', pcHealth: '150', pcHsa: '50', pcPreOther: '25', pcRoth: '100', pcPostOther: '30' };
  var BASE = 'Enter your pay to see your take-home pay.';

  function setEmpty(msg, hint) {
    $('pcResLab').textContent = 'Take-home pay'; $('pcResBig').textContent = '—'; $('pcResSub').textContent = msg;
    $('pcResults').style.display = 'none';
    $('pcMLab').textContent = 'Take-home pay'; $('pcMVal').textContent = '—'; $('pcMDec').textContent = '';
    var h = $('pcHint'); h.textContent = hint || ''; h.style.display = hint ? 'block' : 'none';
    last = null;
  }

  function stateCode() { return $('pcState').value || ''; }
  function freqKey() { return $('pcFreq').value || 'biweekly'; }
  function statusKey() { return $('pcStatus').value || 'single'; }

  // one paycheck for a given annual pay + settings (used for the table, all-frequencies, what-if and the yearly chart)
  function buildInput(c, gross, ppy, ytd, ded) {
    var pre = [
      { amt: ded.k401, inc: true, fica: false, kind: '401k' }, { amt: ded.health, inc: true, fica: true }, { amt: ded.hsa, inc: true, fica: true }, { amt: ded.preOther, inc: true, fica: false }
    ];
    return {
      gross: gross, ppy: ppy, ytd: ytd, preTax: pre, postTax: [{ amt: ded.roth }, { amt: ded.postOther }], roundFed: c.round,
      fed: { w4: c.w4, status: c.status, step2: c.step2, credit: c.credit, other4a: c.other4a, ded4b: c.ded4b, extra: c.fedExtra, allowances: c.allow, exempt: c.exFed },
      ficaX: { exemptSS: c.exSS, exemptMed: c.exMed },
      state: c.state ? { code: c.state, status: c.status, allowances: c.stAllow, allowances2: c.stAllow2, extra: c.stExtra, exempt: c.exState } : null
    };
  }

  function calc() {
    var ids = [];
    var hourly = st.mode === 'hourly';
    ids.push(hourly ? 'pcRate' : 'pcGross'); if (hourly) ids.push('pcHours');
    if (st.adv) { ids.push('pcYtd', 'pc401k', 'pcHealth', 'pcHsa', 'pcPreOther', 'pcRoth', 'pcPostOther', 'pcStAllow', 'pcStAllow2', 'pcStExtra'); if (st.w4 === 'new') ids.push('pcCredit', 'pc4a', 'pc4b', 'pcFedExtra'); else ids.push('pcAllow', 'pcFedExtra'); if (hourly) ids.push('pcOtHours', 'pcOtMult'); }
    var f = {}, i;
    for (i = 0; i < ids.length; i++) {
      f[ids[i]] = read(ids[i]);
      if (f[ids[i]].bad) return { hint: 'Can’t read “' + LABELS[ids[i]] + '” yet — type a plain number like ' + EXS[ids[i]] + '.' };
    }
    var val = function (id, d) { return f[id] && f[id].v != null ? f[id].v : d; };
    var main = hourly ? f.pcRate : f.pcGross;
    if (main.e || (hourly && f.pcHours.e)) return { msg: BASE };
    var ppy = E.PPY[freqKey()], adv = st.adv, gross, annual, weekly = null;
    if (hourly) {
      var rate = f.pcRate.v, hrs = f.pcHours.v, ot = adv ? val('pcOtHours', 0) : 0, mult = adv && f.pcOtMult && f.pcOtMult.v != null ? f.pcOtMult.v : 1.5;
      if (!(rate > 0)) return { msg: BASE, hint: 'The hourly rate must be more than $0.' };
      if (rate > 10000) return { msg: BASE, hint: 'That hourly rate is too large to calculate — enter it in dollars, like 22.' };
      if (hrs < 0 || hrs > 168) return { msg: BASE, hint: 'Hours per week must be between 0 and 168.' };
      if (ot < 0 || hrs + ot > 168) return { msg: BASE, hint: 'Regular plus overtime hours can’t be more than 168 a week.' };
      if (mult < 1 || mult > 5) return { msg: BASE, hint: 'The overtime multiplier is usually 1.5 — enter a value between 1 and 5.' };
      weekly = rate * hrs + rate * mult * ot;
      annual = weekly * 52; gross = annual / ppy;
      if (!(gross > 0)) return { msg: BASE, hint: 'Enter more than 0 hours a week.' };
    } else {
      var g = f.pcGross.v;
      if (!(g > 0)) return { msg: BASE, hint: 'Pay must be more than $0.' };
      if (g > 1e9) return { msg: BASE, hint: 'That amount is too large to calculate — enter it in dollars, like 65000.' };
      if (st.unit === 'year') { annual = g; gross = g / ppy; } else { gross = g; annual = g * ppy; }
    }
    if (annual > 1e9) return { msg: BASE, hint: 'That amount is too large to calculate — check the numbers.' };
    var c = { w4: st.w4, status: statusKey(), step2: adv && st.w4 === 'new' && $('pcStep2').checked, credit: adv ? val('pcCredit', 0) : 0, other4a: adv ? val('pc4a', 0) : 0, ded4b: adv ? val('pc4b', 0) : 0, fedExtra: adv ? val('pcFedExtra', 0) : 0, allow: adv ? val('pcAllow', 0) : 0,
      round: adv && $('pcRound').checked, exFed: adv && $('pcExFed').checked, exSS: adv && $('pcExSS').checked, exMed: adv && $('pcExMed').checked, exState: adv && $('pcExState').checked,
      state: stateCode(), stAllow: adv && f.pcStAllow && f.pcStAllow.v != null ? f.pcStAllow.v : (stateCode() === 'AZ' ? null : 0), stAllow2: adv ? val('pcStAllow2', 0) : 0, stExtra: adv ? val('pcStExtra', 0) : 0 };
    var nn = ['credit', 'other4a', 'ded4b', 'fedExtra', 'allow', 'stAllow', 'stAllow2', 'stExtra'], nl = ['pcCredit', 'pc4a', 'pc4b', 'pcFedExtra', 'pcAllow', 'pcStAllow', 'pcStAllow2', 'pcStExtra'];
    for (i = 0; i < nn.length; i++) {
      if (c[nn[i]] < 0) return { msg: BASE, hint: '“' + LABELS[nl[i]] + '” can’t be negative.' };
      if (c[nn[i]] > 1e9) return { msg: BASE, hint: '“' + LABELS[nl[i]] + '” is too large to calculate — enter it in dollars.' };
    }
    var sc = c.state;
    if (sc === 'AZ' && c.stAllow != null && c.stAllow > 3.5) return { msg: BASE, hint: 'Enter the Form A-4 withholding percentage — 0.5, 1, 1.5, 2, 2.5, 3 or 3.5.' };
    if (sc !== 'IA' && sc !== 'AZ' && (c.stAllow > 99 || c.stAllow2 > 99)) return { msg: BASE, hint: 'Enter the number of allowances as a small whole number, like 2.' };
    if (c.allow > 99) return { msg: BASE, hint: 'Enter the number of allowances as a small whole number, like 2.' };
    var ytd = adv ? val('pcYtd', 0) : 0;
    if (ytd < 0) return { msg: BASE, hint: 'Year-to-date pay can’t be negative.' };
    if (ytd > 1e9) return { msg: BASE, hint: 'Year-to-date pay is too large to calculate — enter it in dollars.' };
    // deductions: "6%" means a percentage of the paycheck, anything else is dollars per paycheck
    var ded = {}, dk = { k401: 'pc401k', health: 'pcHealth', hsa: 'pcHsa', preOther: 'pcPreOther', roth: 'pcRoth', postOther: 'pcPostOther' }, dpct = {};
    for (var key in dk) {
      var r = adv ? f[dk[key]] : { e: true };
      if (r.e) { ded[key] = 0; continue; }
      if (r.v < 0) return { msg: BASE, hint: '“' + LABELS[dk[key]] + '” can’t be negative.' };
      if (r.pct && r.v > 100) return { msg: BASE, hint: '“' + LABELS[dk[key]] + '” can’t be more than 100% of your pay.' };
      ded[key] = r.pct ? gross * r.v / 100 : r.v; dpct[key] = r.pct ? r.v : null;
      if (ded[key] > 1e9) return { msg: BASE, hint: '“' + LABELS[dk[key]] + '” is too large to calculate — enter it in dollars.' };
    }
    var totDed = ded.k401 + ded.health + ded.hsa + ded.preOther + ded.roth + ded.postOther;
    if (totDed > gross) return { msg: BASE, hint: 'Your deductions are more than your pay for one paycheck — check the amounts.' };
    var p = E.paycheck(buildInput(c, gross, ppy, ytd, ded));
    if (!(p.net > -1e-9)) return { msg: BASE, hint: 'Taxes and deductions come to more than your pay — check the amounts.' };
    return { c: c, ded: ded, dpct: dpct, gross: gross, annual: annual, ppy: ppy, ytd: ytd, p: p, hourly: hourly, weekly: weekly };
  }

  /* ---------- helpers on a calc result ---------- */
  function yearSim(d, gross, ppy, ded) {
    var tot = { gross: 0, pre: 0, fed: 0, ss: 0, med: 0, addl: 0, state: 0, prog: 0, post: 0, net: 0 }, rows = [], ssStop = -1, addlStart = -1;
    for (var k = 0; k < ppy; k++) {
      var y = gross * k;
      var q = E.paycheck(buildInput(d.c, gross, ppy, y, ded));
      tot.gross += q.gross; tot.pre += q.preTax; tot.fed += q.fed; tot.ss += q.ss; tot.med += q.med; tot.addl += q.addl; tot.state += q.state; tot.prog += q.programTotal; tot.post += q.post; tot.net += q.net;
      rows.push(q.net);
      if (ssStop < 0 && q.ss < q.ficaWages * 0.062 - 0.005 && !d.c.exSS) ssStop = k;
      if (addlStart < 0 && q.addl > 0.005) addlStart = k;
    }
    return { t: tot, rows: rows, ssStop: ssStop, addlStart: addlStart };
  }
  function scaleDed(ded, from, to) { var o = {}; for (var k in ded) o[k] = ded[k] * from / to; return o; }

  /* ---------- rendering ---------- */
  function capChart(d, ys) {
    var n = ys.rows.length, W = 300, H = 170, ml = 44, mr = 8, mt = 12, mb = 28, pw = W - ml - mr, ph = H - mt - mb;
    var lo = Infinity, hi = -Infinity; ys.rows.forEach(function (v) { if (v < lo) lo = v; if (v > hi) hi = v; });
    var pad = (hi - lo) * 0.25 || hi * 0.1 || 1; lo = Math.max(0, lo - pad); hi = hi + pad * 0.5;
    var X = function (k) { return ml + pw * (n === 1 ? 0.5 : k / (n - 1)); }, Y = function (v) { return mt + ph * (1 - (v - lo) / (hi - lo)); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Take-home pay for each paycheck of the year">';
    [0, 0.5, 1].forEach(function (t) { var v = lo + (hi - lo) * t, y = Y(v); s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E7DCC8" stroke-width="1"/><text x="' + (ml - 6) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="14" fill="#6B5B4A">' + kfmt(v) + '</text>'; });
    var path = ''; ys.rows.forEach(function (v, k) { if (k) path += ' L' + X(k).toFixed(1) + ',' + Y(ys.rows[k - 1]).toFixed(1); path += (k ? ' L' : 'M') + X(k).toFixed(1) + ',' + Y(v).toFixed(1); });
    s += '<path d="' + path + '" fill="none" stroke="#37503F" stroke-width="2.2" stroke-linejoin="round"/>';
    [[ys.ssStop, '#B5761F'], [ys.addlStart, '#8F5C13']].forEach(function (m) {
      if (m[0] < 0 || m[0] >= n) return;
      var x = X(m[0]), y = Y(ys.rows[m[0]]);
      s += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" y2="' + (mt + ph) + '" stroke="' + m[1] + '" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" fill="' + m[1] + '" stroke="#fff" stroke-width="1.5"/>';
    });
    s += '<text x="' + ml + '" y="' + (H - 6) + '" font-size="14" fill="#6B5B4A">Paycheck 1</text><text x="' + (W - mr) + '" y="' + (H - 6) + '" text-anchor="end" font-size="14" fill="#6B5B4A">' + n + '</text>';
    return s + '</svg>';
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function monthOf(k, n) { return MONTHS[Math.min(11, Math.floor(k / n * 12))]; }

  function render() {
    var d = calc();
    if (d.hint != null || d.msg != null) { setEmpty(d.msg || BASE, d.hint || ''); return; }
    var h = $('pcHint'); h.style.display = 'none'; h.textContent = '';
    var p = d.p, c = d.c, ppy = d.ppy, code = c.state, S = code ? E.STATES[code] : null, sname = code ? NAMES[code] : '';
    var fw = FREQ_WORD[freqKey()];
    last = { d: d };
    $('pcResLab').textContent = 'Take-home pay per paycheck';
    $('pcResBig').textContent = mon(p.net);
    $('pcResSub').textContent = mon(p.gross) + ' gross · ' + fw + (code ? ' · ' + sname : ' · federal taxes only') + ' · ' + mon0(p.net * ppy) + ' a year';
    $('pcMLab').textContent = 'Take-home per paycheck'; $('pcMVal').textContent = mon(p.net); $('pcMDec').textContent = ' · ' + mon0(p.gross) + ' gross';
    $('pcResults').style.display = '';

    // full-year projection (exact Social Security cap)
    var ys = yearSim(d, p.gross, ppy, d.ded), T = ys.t;
    var taxTot = p.fed + p.ss + p.med + p.addl + p.state + p.programTotal;
    var tip = 'Of every $1 you earn, you keep about ' + Math.round(p.net / p.gross * 100) + '¢' + (p.gross > 0 ? ' — ' + pct(taxTot / p.gross * 100) + ' goes to taxes' : '') + '.';
    $('pcTip').textContent = tip;
    var sn = $('pcStateNote');
    if (code && !p.stateKnown) { sn.style.display = ''; sn.textContent = sname + ' state income tax isn’t in this calculator yet — the result shows federal tax and FICA only, so your real take-home will be lower by what ' + sname + ' withholds. Locals are also not included.'; }
    else if (!code) { sn.style.display = ''; sn.textContent = 'Pick your state to include state income tax. Federal taxes only are shown now.'; }
    else sn.style.display = 'none';

    // where each paycheck dollar goes
    var seg = [['Take-home', Math.max(0, p.net), '#37503F'], ['Federal tax', p.fed, '#B5761F'], ['Social Security', p.ss, '#8F5C13'], ['Medicare', p.med + p.addl, '#C99A55'], ['State & local', p.state + p.programTotal, '#6B7A9E'], ['Before-tax deductions', p.preTax, '#6E8A74'], ['After-tax deductions', p.post, '#A4795A']], bar = '', leg = '';
    seg.forEach(function (x) {
      var q = x[1] / p.gross * 100;
      if (!(q > 0.05)) return;
      bar += '<div class="ln-seg" style="width:' + q.toFixed(2) + '%;background:' + x[2] + '">' + (q >= 12 ? Math.round(q) + '%' : '') + '</div>';
      leg += '<span><i style="background:' + x[2] + '"></i>' + x[0] + ' ' + mon0(x[1]) + ' (' + pct(q) + ')</span>';
    });
    $('pcBar').innerHTML = bar; $('pcBarLeg').innerHTML = leg;

    // table: per paycheck | per year
    var rows = [['Gross pay', p.gross, T.gross, '']];
    if (p.preTax > 0.005) rows.push(['Before-tax deductions', -p.preTax, -T.pre, '']);
    rows.push(['Federal income tax', -p.fed, -T.fed, '']);
    rows.push(['Social Security (6.2%)', -p.ss, -T.ss, '']);
    rows.push(['Medicare (1.45%)', -p.med, -T.med, '']);
    if (p.addl > 0.005 || T.addl > 0.005) rows.push(['Additional Medicare (0.9%)', -p.addl, -T.addl, '']);
    if (code && p.stateKnown && !c.exState) rows.push([sname + ' income tax', -p.state, -T.state, '']);
    if (p.programs.length) p.programs.forEach(function (q) { rows.push([q.name, -q.amt, null, 'prog']); });
    if (p.post > 0.005) rows.push(['After-tax deductions', -p.post, -T.post, '']);
    var progYear = {};
    // yearly figures for state payroll programs
    if (p.programs.length) {
      for (var k = 0; k < ppy; k++) { var qq = E.paycheck(buildInput(c, p.gross, ppy, p.gross * k, d.ded)); qq.programs.forEach(function (z) { progYear[z.name] = (progYear[z.name] || 0) + z.amt; }); }
    }
    var tb = '<thead><tr><th></th><th>Per paycheck</th><th>Per year</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var yr = r[3] === 'prog' ? -(progYear[r[0]] || 0) : r[2];
      tb += '<tr><td>' + r[0] + '</td><td>' + monS(r[1]) + '</td><td>' + mon0(yr) + '</td></tr>';
    });
    tb += '<tr class="cur"><td>Take-home pay</td><td>' + monS(p.net) + '</td><td>' + mon0(T.net) + '</td></tr></tbody>';
    $('pcTable').innerHTML = tb;

    // what-if
    renderWhatIf(d, ys);

    // all pay frequencies
    var ft = '<thead><tr><th>Paid</th><th>Paycheck</th><th>Take-home</th></tr></thead><tbody>';
    FREQ.forEach(function (fr) {
      var pp = E.PPY[fr[0]], g2 = d.annual / pp, dd = scaleDed(d.ded, ppy, pp), q = E.paycheck(buildInput(c, g2, pp, 0, dd));
      ft += '<tr' + (fr[0] === freqKey() ? ' class="cur"' : '') + '><td>' + fr[1] + '</td><td>' + monS(g2) + '</td><td>' + monS(q.net) + '</td></tr>';
    });
    $('pcFreq2').innerHTML = ft + '</tbody>';

    // Social Security cap chart
    var cw = $('pcCapWrap');
    if (ys.ssStop >= 0 || ys.addlStart >= 0) {
      cw.style.display = '';
      $('pcCapBox').innerHTML = capChart(d, ys);
      var cl = '<span><i style="background:#37503F"></i>Take-home each paycheck</span>';
      if (ys.ssStop >= 0) cl += '<span><i class="ln-dot"></i>Social Security stops at ' + mon0(E.SS_BASE) + ' — paycheck ' + (ys.ssStop + 1) + ' (' + monthOf(ys.ssStop, ppy) + ')</span>';
      if (ys.addlStart >= 0) cl += '<span><i style="background:#8F5C13"></i>Additional Medicare starts above $200,000 — paycheck ' + (ys.addlStart + 1) + '</span>';
      $('pcCapLeg').innerHTML = cl;
    } else {
      cw.style.display = 'none';
    }

    // assumptions
    var as = [];
    as.push('Tax year ' + E.YEAR + ' — federal income tax by the IRS Publication 15-T percentage method (' + (c.w4 === 'old' ? 'Form W-4 from 2019 or earlier, ' + c.allow + ' allowance' + (c.allow === 1 ? '' : 's') : 'Form W-4 from 2020 or later') + ').');
    as.push('Social Security 6.2% up to ' + mon0(E.SS_BASE) + ' of wages in the year; Medicare 1.45%; Additional Medicare 0.9% on wages above $200,000.');
    if (d.ytd > 0) as.push('Year-to-date pay of ' + mon0(d.ytd) + ' is counted toward the Social Security limit.');
    if (code && p.stateKnown) as.push(sname + ' income tax by the state’s official ' + E.YEAR + ' withholding formula' + (S.src && /^https?:/.test(S.src) ? ' (<a href="' + S.src + '" target="_blank" rel="noopener">source</a>)' : '') + '.');
    if (code && p.stateKnown && S.programs) as.push('Includes ' + S.programs.map(function (q) { return q.name; }).join(' and ') + ' (employee-paid).');
    if (code && p.stateKnown && S.note) as.push(S.note);
    as.push('City, county and school-district taxes are not included.');
    as.push('Amounts are not rounded' + (c.round ? ' except federal withholding, rounded to the nearest dollar' : '') + '. Employer taxes are not part of your paycheck and are not included.');
    $('pcAssume').innerHTML = as.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    $('pcCopyWrap').style.display = st.adv ? '' : 'none';
  }

  function renderWhatIf(d, ys) {
    var rs = read('pcWiRaise'), ks = read('pcWiK'), out = $('pcWiOut'), c = d.c, ppy = d.ppy, p = d.p;
    if (rs.bad || ks.bad) { out.textContent = 'Type plain numbers, like 5 and 6.'; return; }
    var raise = rs.e ? 0 : rs.v, kp = ks.e ? 0 : ks.v;
    if (raise < 0 || raise > 1000 || kp < 0 || kp > 100) { out.textContent = 'Use a raise between 0 and 1000%, and a 401(k) between 0 and 100%.'; return; }
    if (!raise && !kp) { out.textContent = 'Type a raise or a 401(k) percentage to see how your take-home changes.'; return; }
    var txt = [], k;
    if (raise) {
      var g2 = p.gross * (1 + raise / 100), q = E.paycheck(buildInput(c, g2, ppy, d.ytd, d.ded)), y2 = yearSim(d, g2, ppy, d.ded).t.net;
      txt.push('A ' + pct(raise) + ' raise lifts your gross to ' + mon(g2) + ' and your take-home by ' + mon(q.net - p.net) + ' a paycheck (' + mon0(y2 - ys.t.net) + ' a year) to ' + mon(q.net) + '.');
    }
    if (kp) {
      var ded2 = {}; for (k in d.ded) ded2[k] = d.ded[k];
      var add = p.gross * kp / 100; ded2.k401 = d.ded.k401 + add;
      if (ded2.k401 + ded2.health + ded2.hsa + ded2.preOther + ded2.roth + ded2.postOther > p.gross) { out.textContent = 'Those deductions would be more than your pay.'; return; }
      var q2 = E.paycheck(buildInput(c, p.gross, ppy, d.ytd, ded2)), y3 = yearSim(d, p.gross, ppy, ded2).t.net;
      txt.push('Putting another ' + pct(kp) + ' of pay (' + mon(add) + ') into a traditional 401(k) lowers your take-home by only ' + mon(p.net - q2.net) + ' a paycheck (' + mon0(ys.t.net - y3) + ' a year), because it cuts your income tax by ' + mon((p.fed + p.state) - (q2.fed + q2.state)) + '.');
    }
    out.textContent = txt.join(' ');
  }

  /* ---------- state-specific fields ---------- */
  function syncStateFields() {
    var code = stateCode(), lab = SFIELDS[code], live = code && E.STATES[code] && E.STATES[code].method !== 'pending';
    $('pcStAllowFld').style.display = lab ? '' : 'none';
    $('pcStAllow2Fld').style.display = lab && lab[1] ? '' : 'none';
    if (lab) { $('pcStAllowLab').firstChild.nodeValue = lab[0] + ' '; if (lab[1]) $('pcStAllow2Lab').firstChild.nodeValue = lab[1] + ' '; }
    $('pcStExtraFld').style.display = live && E.STATES[code].method !== 'none' ? '' : 'none';
    $('pcExStateFld').style.display = live && E.STATES[code].method !== 'none' ? '' : 'none';
    $('pcStGrp').style.display = live && E.STATES[code].method !== 'none' ? '' : 'none';
  }

  /* ---------- controls ---------- */
  function seg(id, attr, fn) {
    var el = $(id);
    [].forEach.call(el.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        [].forEach.call(el.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        fn(b.getAttribute(attr));
      });
    });
  }
  seg('pcModeSeg', 'data-v', function (v) {
    st.mode = v; var hr = v === 'hourly';
    $('pcSalBox').style.display = hr ? 'none' : ''; $('pcHourBox').style.display = hr ? '' : 'none'; $('pcOtGrp').style.display = hr && st.adv ? '' : 'none';
    $('pcEx').textContent = hr ? 'See an example: $22 an hour, 40 hours a week' : 'See an example: $65,000 a year, bi-weekly';
    render();
  });
  seg('pcUnitSeg', 'data-v', function (v) { st.unit = v; render(); });
  seg('pcW4Seg', 'data-v', function (v) { st.w4 = v; $('pcW4New').style.display = v === 'new' ? '' : 'none'; $('pcW4Old').style.display = v === 'old' ? '' : 'none'; render(); });

  var panel = $('pcState').querySelector('.csel-panel'), ph = '<button type="button" class="csel-opt on" role="option" aria-selected="true" data-value="">Federal taxes only</button>';
  Object.keys(NAMES).sort(function (a, b) { return NAMES[a] < NAMES[b] ? -1 : 1; }).forEach(function (cd) {
    var s = E.STATES[cd], ok = s && s.method !== 'pending';
    ph += '<button type="button" class="csel-opt" role="option" aria-selected="false" data-value="' + cd + '">' + NAMES[cd] + (ok ? '' : ' · federal only') + '</button>';
  });
  panel.innerHTML = ph; CalcThis.initCsel($('pcState'));

  ['pcGross', 'pcRate', 'pcHours', 'pcOtHours', 'pcOtMult', 'pcYtd', 'pcCredit', 'pc4a', 'pc4b', 'pcFedExtra', 'pcAllow', 'pcStAllow', 'pcStAllow2', 'pcStExtra', 'pc401k', 'pcHealth', 'pcHsa', 'pcPreOther', 'pcRoth', 'pcPostOther', 'pcWiRaise', 'pcWiK'].forEach(function (id) { $(id).addEventListener('input', render); });
  ['pcStep2', 'pcRound', 'pcExFed', 'pcExSS', 'pcExMed', 'pcExState'].forEach(function (id) { $(id).addEventListener('change', render); });
  ['pcFreq', 'pcStatus'].forEach(function (id) { $(id).addEventListener('change', render); });
  var FORM_IDS = ['pcGross', 'pcRate', 'pcHours', 'pcOtHours', 'pcOtMult', 'pcYtd', 'pcCredit', 'pc4a', 'pc4b', 'pcFedExtra', 'pcAllow', 'pcStExtra', 'pc401k', 'pcHealth', 'pcHsa', 'pcPreOther', 'pcRoth', 'pcPostOther', 'pcWiRaise', 'pcWiK'];
  var CHECK_IDS = ['pcStep2', 'pcRound', 'pcExFed', 'pcExSS', 'pcExMed', 'pcExState'];
  function activeBtn(id) { var b = $(id).querySelector('button.on'); return b ? b.getAttribute('data-v') : null; }
  function saveForm(target) {
    try {
      var o = { t: Date.now(), state: stateCode(), freq: freqKey(), status: statusKey(), mode: st.mode, unit: st.unit, w4: st.w4, adv: st.adv, f: {}, c: {} };
      FORM_IDS.forEach(function (id) { o.f[id] = $(id).value; });
      CHECK_IDS.forEach(function (id) { o.c[id] = $(id).checked; });
      sessionStorage.setItem('pcForm', JSON.stringify(o));
    } catch (e) {}
  }
  function restoreForm() {
    try {
      var raw = sessionStorage.getItem('pcForm'); if (!raw) return;
      sessionStorage.removeItem('pcForm');
      var o = JSON.parse(raw); if (!o || Date.now() - o.t > 15000) return;
      var click = function (id, v) { var b = $(id).querySelector('button[data-v="' + v + '"]'); if (b && !b.classList.contains('on')) b.click(); };
      if (o.mode) click('pcModeSeg', o.mode);
      if (o.unit) click('pcUnitSeg', o.unit);
      if (o.adv && !st.adv) $('pcAdvBtn').click();
      if (o.w4) click('pcW4Seg', o.w4);
      if (o.freq) $('pcFreq').value = o.freq;
      if (o.status) $('pcStatus').value = o.status;
      if (o.state !== undefined && (o.state === '' || NAMES[o.state])) $('pcState').value = o.state;
      for (var id in o.f) if ($(id) && o.f[id]) $(id).value = o.f[id];
      for (var cid in o.c) if ($(cid)) $(cid).checked = !!o.c[cid];
    } catch (e) {}
  }
  $('pcState').addEventListener('change', function () {
    var code = stateCode(), S = code ? E.STATES[code] : null;
    var target = S && S.slug ? '/paycheck-calculator/' + S.slug + '/' : '/paycheck-calculator/';
    if (location.pathname !== target && !window.__pcNoNav) { saveForm(); location.href = target; return; }  // __pcNoNav: test hook so fuzz tests can switch states without leaving the page
    $('pcStAllow').value = ''; $('pcStAllow2').value = ''; syncStateFields(); render();
  });

  $('pcEx').addEventListener('click', function () {
    if (st.mode === 'hourly') { $('pcRate').value = '22'; $('pcHours').value = '40'; } else { $('pcGross').value = '65000'; }
    render();
  });
  $('pcAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('pcAdvBtn').classList.toggle('open', st.adv);
    $('pcAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('pcAdvIn').style.display = st.adv ? '' : 'none';
    $('pcOtGrp').style.display = st.adv && st.mode === 'hourly' ? '' : 'none';
    if (!st.adv) {
      ['pcOtHours', 'pcOtMult', 'pcYtd', 'pcCredit', 'pc4a', 'pc4b', 'pcFedExtra', 'pcAllow', 'pcStAllow', 'pcStAllow2', 'pcStExtra', 'pc401k', 'pcHealth', 'pcHsa', 'pcPreOther', 'pcRoth', 'pcPostOther'].forEach(function (id) { $(id).value = ''; });
      ['pcStep2', 'pcRound', 'pcExFed', 'pcExSS', 'pcExMed', 'pcExState'].forEach(function (id) { $(id).checked = false; });
      st.w4 = 'new'; $('pcW4New').style.display = ''; $('pcW4Old').style.display = 'none';
      [].forEach.call($('pcW4Seg').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === 'new'); });
    }
    render();
  });
  $('pcCopy').addEventListener('click', function () {
    if (!last) return;
    var d = last.d, p = d.p, lines = ['Gross pay: ' + mon(p.gross) + ' (' + FREQ_WORD[freqKey()] + ')', 'Federal income tax: ' + mon(p.fed), 'Social Security: ' + mon(p.ss), 'Medicare: ' + mon(p.med + p.addl)];
    if (d.c.state && p.stateKnown) lines.push(NAMES[d.c.state] + ' tax and programs: ' + mon(p.state + p.programTotal));
    if (p.preTax > 0.005) lines.push('Before-tax deductions: ' + mon(p.preTax));
    if (p.post > 0.005) lines.push('After-tax deductions: ' + mon(p.post));
    lines.push('Take-home pay: ' + mon(p.net) + ' per paycheck (' + mon0(p.net * d.ppy) + ' a year)');
    var btn = $('pcCopy'), txt = lines.join('\n');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy results'; }, 1600); };
    var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok); } catch (e) { done(false); } };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, legacy); } catch (e) { legacy(); }
  });

  var pre = document.body.getAttribute('data-state');
  if (pre && NAMES[pre]) { $('pcState').value = pre; }
  restoreForm();
  syncStateFields();
  render();
};

/* =========================================================
   COOKING · TURKEY CALCULATORS — cooking time (/turkey-cooking-time-calculator/),
   thawing time (/turkey-thawing-time-calculator/) and size (/turkey-size-calculator/).
   Cooking + thawing share ONE engine + UI (body data-tk="cook" | "thaw" only changes
   which result leads). Every number is USDA FSIS: "Turkey Basics: Safe Cooking" (325 F
   roasting chart), "Safe Thawing" (fridge ~24 h per 4-5 lb, cold water ~30 min per lb)
   and "Turkey: Alternate Routes to the Table" (electric roaster, grill, smoker, deep fryer,
   microwave, cooking from frozen = +50%). Differentiator: enter the dinner date + time and
   get the whole plan backwards (thaw start -> oven in -> check -> out -> serve) with a late
   flag when the fridge cannot finish. Dates/time reuse the Hours calculator's masked h:mm
   field + AM/PM and the vendored datepicker.
   ========================================================= */
/* TURKEY-ENGINE:START */
CalcThis.turkeyEngine = (function () {
  var LB_PER_KG = 2.2046226218;
  /* [from lb, to lb, low hours, high hours] — USDA FSIS, 325 F, fresh or thawed bird */
  var CHART = {
    whole: {
      unstuffed: [[8, 12, 2.75, 3], [12, 14, 3, 3.75], [14, 18, 3.75, 4.25], [18, 20, 4.25, 4.5], [20, 24, 4.5, 5]],
      stuffed: [[8, 12, 3, 3.5], [12, 14, 3.5, 4], [14, 18, 4, 4.25], [18, 20, 4.25, 4.75], [20, 24, 4.75, 5.25]]
    },
    breast: { unstuffed: [[4, 6, 1.5, 2.25], [6, 8, 2.25, 3.25]] }
  };
  /* USDA "Alternate Routes": minutes per pound, size range, temperature */
  var METHODS = {
    oven: { label: 'Oven', chart: true, short: '325 °F (163 °C)', temp: '325 °F (163 °C) or higher; no preheating needed.' },
    roaster: { label: 'Electric roaster oven', chart: true, short: '325 °F (163 °C)', temp: '325 °F (163 °C) at least — check the appliance manual.' },
    grill: { label: 'Covered grill (gas or charcoal)', from: 8, to: 16, lo: 15, hi: 18, nostuff: true, short: 'grill at 225–300 °F', temp: 'Keep the air in the grill at 225–300 °F (107–149 °C) and use a drip pan. Do not stuff.' },
    smoker: { label: 'Smoker', from: 8, to: 12, lo: 20, hi: 30, nostuff: true, short: 'smoker at 225–300 °F', temp: 'Keep the smoker at 225–300 °F (107–149 °C) and use a drip pan. Do not stuff.' },
    fry: { label: 'Deep fryer', from: 8, to: 12, lo: 3, hi: 5, nostuff: true, short: 'oil at 350 °F (177 °C)', temp: 'Keep the oil at 350 °F (177 °C). Do not stuff.' },
    micro: { label: 'Microwave', from: 8, to: 14, lo: 9, hi: 10, nostuff: true, short: 'medium (50%) power', temp: 'Medium (50%) power in an oven cooking bag; rotate during cooking. Do not stuff.' }
  };
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var FR = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };

  function rows(cut, stuffed) { var c = CHART[cut] || CHART.whole; return (stuffed && cut === 'whole') ? c.stuffed : c.unstuffed; }
  /* the USDA oven row for this weight, or null (outside the chart) */
  function cook(lb, cut, stuffed) {
    if (!(lb > 0)) return null;
    var r = rows(cut, stuffed);
    for (var i = 0; i < r.length; i++) if (lb >= r[i][0] && lb <= r[i][1]) return { from: r[i][0], to: r[i][1], lo: r[i][2], hi: r[i][3] };
    return null;
  }
  function range(cut, stuffed) { var r = rows(cut, stuffed); return { min: r[0][0], max: r[r.length - 1][1] }; }
  /* cooking time for any method / cavity / frozen state.
     o: { lb, cut, method, cav:'un'|'part'|'st', frozen:boolean }  ->  { c } or { err:{k,..} }
     c: { from, to, lo, hi (hours), chart:boolean, mixed, frozen, est, fb } */
  function estC(lb, rpm, why, extra) {
    var h = lb * rpm / 60, c = { from: lb, to: lb, lo: h, hi: h, est: true, why: why, rpm: rpm, chart: true };
    for (var k in (extra || {})) c[k] = extra[k];
    return c;
  }
  /* cooking time for any method / cavity / frozen state — ALWAYS returns a time: the USDA figure when it has one,
     otherwise a labelled estimate that extends the nearest USDA rate (c.est + c.why).
     o: { lb, cut, method, cav:'un'|'part'|'st', frozen:boolean }  ->  { c }
     c: { from, to, lo, hi (hours), chart:boolean, mixed, frozen, est, why, rpm, fb } */
  function cookX(o) {
    var M = METHODS[o.method] || METHODS.oven, lb = o.lb, cut = o.cut, cav = o.cav || 'un', c = null;
    if (M.chart) {
      if (cav === 'part' && cut === 'whole') {
        var u = cook(lb, 'whole', false), s = cook(lb, 'whole', true);
        if (u && s) c = { from: u.from, to: u.to, lo: (u.lo + s.lo) / 2, hi: (u.hi + s.hi) / 2, mixed: true };
      } else c = cook(lb, cut, cav === 'st');
      if (!c && cut === 'whole' && lb >= 4 && lb < 8) { c = cook(lb, 'breast', false); if (c) c.fb = true; }
      if (!c && lb < 4) c = estC(lb, 22.5, 'below');
      if (!c) { var r = rows(cut, cav === 'st'), top = r[r.length - 1]; c = estC(lb, top[3] * 60 / top[1], 'above', { top: top[1] }); }
      c.chart = true;
    } else {
      c = { from: M.from, to: M.to, lo: lb * M.lo / 60, hi: lb * M.hi / 60, chart: false };
      if (!(cut === 'whole' && lb >= M.from && lb <= M.to)) { c.est = true; c.why = cut === 'breast' ? 'breast-method' : 'method-range'; }
    }
    if (o.frozen && M.chart) { c.lo *= 1.5; c.hi *= 1.5; c.frozen = true; if (c.rpm) c.rpm *= 1.5; }
    c.method = o.method;
    return { c: c };
  }
  /* thaw hours: fridge 24 h per 5 lb (fast end) to 24 h per 4 lb (plan on this), cold water 30 min per lb */
  function thaw(lb) {
    return { fridgeLo: lb * 24 / 5, fridgeHi: lb * 24 / 4, cold: lb * 0.5, inTable: lb >= 4 && lb <= 24 };
  }
  function q(h) {
    var n = Math.round(h * 4) / 4, w = Math.floor(n), f = n - w;
    return (w || !f ? String(w) : '') + FR[f];
  }
  function hm(h) {
    var m = Math.round(h * 60), a = Math.floor(m / 60), b = m % 60;
    return a ? a + ' h' + (b ? ' ' + b + ' min' : '') : b + ' min';
  }
  function dur(h) {
    if (h < 24) return hm(h);
    var d = Math.round(h / 24 * 10) / 10, s = d % 1 === 0 ? String(d) : d.toFixed(1);
    return s + (d === 1 ? ' day' : ' days');
  }
  function days(h) { var d = Math.round(h / 24 * 10) / 10; return d % 1 === 0 ? String(d) : d.toFixed(1); }
  function clock(d) { var h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM'); }
  function day(d) { return DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); }
  function when(d) { return day(d) + ' · ' + clock(d); }
  /* "15", "15.5", "15 lb 8 oz", "240 oz", "6.8 kg", "6800 g" -> pounds. unit = default for a bare number */
  function parseWeight(raw, unit) {
    var t = String(raw).toLowerCase().trim();
    t = /^\d+,\d{1,2}(?!\d)/.test(t) && t.indexOf(',') === t.lastIndexOf(',') ? t.replace(',', '.') : t.replace(/,/g, '');
    if (!t) return { none: true };
    var full = /^(?:\s*(?:\d+(?:\.\d+)?|\.\d+)\s*(?:pounds?|lbs?|ounces?|oz|kilograms?|kgs?|grams?|kg|lb|g)?\s*)+$/;
    if (!full.test(t)) return { err: true };
    var re = /(\d+(?:\.\d+)?|\.\d+)\s*(pounds?|lbs?|ounces?|oz|kilograms?|kgs?|grams?|kg|lb|g)?/g, m, toks = [];
    while ((m = re.exec(t))) { if (m[0] === '') { re.lastIndex++; continue; } toks.push({ n: parseFloat(m[1]), u: m[2] ? (/^(pound|lb)/.test(m[2]) ? 'lb' : /^(ounce|oz)/.test(m[2]) ? 'oz' : /^(kilo|kg)/.test(m[2]) ? 'kg' : 'g') : '' }); }
    if (!toks.length) return { err: true };
    if (toks.length > 1 && toks.some(function (x) { return !x.u; })) return { err: true };
    var seen = {}, lb = 0;
    for (var i = 0; i < toks.length; i++) {
      var k = toks[i].u || unit; if (seen[k]) return { err: true }; seen[k] = 1;
      lb += k === 'lb' ? toks[i].n : k === 'oz' ? toks[i].n / 16 : k === 'kg' ? toks[i].n * LB_PER_KG : toks[i].n / 1000 * LB_PER_KG;
    }
    return { lb: lb };
  }

  /* the whole plan, worked backwards from the serving time
     o: { serve:Date, now:Date, lb, c (cook result), frozen:boolean (needs thawing), method:'fridge'|'cold', restMin, brineH } */
  function plan(o) {
    var c = o.c, th = thaw(o.lb);
    if (!c) return null;
    var HR = 3600000, rest = o.restMin, notes = [], steps = [];
    var oven = new Date(o.serve.getTime() - rest * 60000 - c.hi * HR);
    var brineH = o.brineH || 0;
    if (brineH > 0 && o.frozen && o.method === 'cold') { notes.push('brine'); brineH = 0; }
    var prepEnd = brineH > 0 ? new Date(oven.getTime() - brineH * HR) : oven;
    var thawH = o.method === 'cold' ? th.cold : th.fridgeHi;
    var thawStart = o.frozen ? new Date(prepEnd.getTime() - thawH * HR) : null;
    var late = false, coldOk = false, ovenLate = oven.getTime() < o.now.getTime();
    if (thawStart && thawStart.getTime() < o.now.getTime()) {
      late = true;
      if (o.method === 'fridge') coldOk = new Date(prepEnd.getTime() - th.cold * HR).getTime() >= o.now.getTime();
    }
    var M = METHODS[c.method] || METHODS.oven;
    var dur0 = (c.est && c.lo === c.hi) ? 'about ' + hm(c.lo) : (c.chart ? q(c.lo) + (c.lo === c.hi ? '' : '–' + q(c.hi)) + ' hours' : hm(c.lo) + ' to ' + hm(c.hi));
    if (thawStart) steps.push({ t: thawStart, k: 'thaw', what: o.method === 'cold' ? 'Start thawing in cold water' : 'Start thawing in the refrigerator',
      det: o.method === 'cold' ? 'About ' + hm(th.cold) + '. Leak-proof bag, cold tap water, change the water every 30 minutes.' : 'Plan on ' + dur(th.fridgeHi) + ' at 40 °F (4 °C) or below. A thawed turkey keeps 1–2 days, so a day early is fine.' });
    if (brineH > 0) steps.push({ t: prepEnd, k: 'prep', what: 'Start brining', det: brineH + ' hour' + (brineH === 1 ? '' : 's') + ' in the refrigerator before cooking.' });
    steps.push({ t: oven, k: 'oven', what: 'Turkey goes in' + (c.method === 'fry' ? ' the fryer' : c.method === 'grill' ? ' the grill' : c.method === 'smoker' ? ' the smoker' : c.method === 'micro' ? ' the microwave' : ' the oven'), det: M.temp + (c.frozen ? ' Cooking from frozen: no oven bag, and take the giblets out as it thaws.' : '') + ' Cooking takes ' + dur0 + '.' });
    steps.push({ t: new Date(oven.getTime() + c.lo * HR), k: 'check', what: 'Start checking the temperature', det: 'Thigh, wing and thickest part of the breast must reach 165 °F (74 °C).' });
    steps.push({ t: new Date(oven.getTime() + c.hi * HR), k: 'out', what: 'Done, latest', det: 'Let it stand ' + rest + ' minutes so the juices set.' });
    steps.push({ t: o.serve, k: 'serve', what: 'Carve and serve', det: '' });
    return { steps: steps, oven: oven, thawStart: thawStart, c: c, th: th, late: late, coldOk: coldOk, ovenLate: ovenLate, notes: notes };
  }
  /* turkey size to buy: pounds from adults / children / leftovers */
  function size(o) {
    var adults = Math.max(0, o.adults - (o.veg || 0)), need = adults * o.adultP + o.kids * o.kidP, total = need * (o.leftovers ? o.leftX : 1);
    return { adultLb: adults * o.adultP, kidLb: o.kids * o.kidP, baseLb: need, totalLb: total, leftLb: total - need, buy: Math.ceil(total - 1e-9) };
  }
  return { LB_PER_KG: LB_PER_KG, CHART: CHART, METHODS: METHODS, cook: cook, cookX: cookX, range: range, thaw: thaw, q: q, hm: hm, dur: dur, days: days, clock: clock, day: day, when: when, parseWeight: parseWeight, plan: plan, size: size };
})();
/* TURKEY-ENGINE:END */

CalcThis.initTurkeyCalc = function () {
  var E = CalcThis.turkeyEngine;
  var $ = function (id) { return document.getElementById(id); };
  var PAGE = document.body.getAttribute('data-tk') === 'thaw' ? 'thaw' : 'cook';
  /* state: 'thaw' = frozen, thaw first · 'fresh' = fresh or thawed · 'frozen' = cook from frozen */
  var st = { unit: 'lb', state: 'thaw', cut: 'whole', cav: 'un', method: 'fridge', cook: 'oven', adv: false, ap: 'pm' };
  var dp = null;
  var tf = null;

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function nowDate() { return window.__tkNow ? new Date(window.__tkNow) : new Date(); }
  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function num(v) { var t = String(v).replace(/,/g, '').trim(); var n = t === '' ? NaN : Number(t); return isFinite(n) ? n : NaN; }
  function fmtN(n) { return String(Math.round(n * 10) / 10); }
  function setHint(m) { var h = $('tkHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  function setSeg(id, v) { [].forEach.call($(id).querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); }); }

  /* ---------- masked h:mm field + AM/PM (same logic as the Hours calculator, 12-hour) ---------- */
  function splitDigits(raw) {
    var d = ('' + raw).replace(/\D/g, '').slice(0, 4);
    if (!d) return { empty: true };
    if (d[0] > '1') return { hDig: '0' + d[0], mDig: d.slice(1, 3), hourDone: true };
    if (d.length === 1) return { hDig: d, mDig: '', hourDone: false };
    return { hDig: d.slice(0, 2), mDig: d.slice(2, 4), hourDone: true };
  }
  function refreshGhost() {
    var s = splitDigits(tf.input.value);
    var val = s.empty ? '' : (s.hourDone ? s.hDig + ':' + s.mDig : s.hDig);
    if (val !== tf.input.value) tf.input.value = val;
    var hc = s.empty ? '' : s.hDig, mc = s.empty ? '' : s.mDig, cells = [hc[0], hc[1], ':', mc[0], mc[1]], html = '';
    for (var i = 0; i < 5; i++) {
      if (i === 2) html += '<span class="g-sep">:</span>';
      else if (cells[i] != null) html += '<span class="g-on">' + cells[i] + '</span>';
      else html += '<span class="g-off">-</span>';
    }
    tf.ghost.innerHTML = html;
  }
  function fieldMin() {
    var s = splitDigits(tf.input.value);
    if (s.empty) return null;
    var h = +s.hDig, md = s.mDig, m = md.length === 0 ? 0 : (md.length === 1 ? (+md) * 10 : +md);
    if (m > 59 || h < 1 || h > 12) return null;
    return ((h % 12) + (st.ap === 'pm' ? 12 : 0)) * 60 + m;
  }
  function paintAp() { [].forEach.call(tf.seg.children, function (b) { b.classList.toggle('on', b.getAttribute('data-ap') === st.ap); }); }

  /* ---------- readers ---------- */
  function readWeight() {
    var raw = $('tkW').value.trim();
    if (!raw) return { none: true };
    var p = E.parseWeight(raw, st.unit);
    if (p.err || !(p.lb > 0)) return { err: (st.unit === 'lb' ? 'Enter the turkey’s weight as a number, like 15 — or 15 lb 8 oz.' : 'Enter the turkey’s weight as a number, like 7 — or 6800 g.') };
    var lb = p.lb;
    if (lb > 60) return { err: 'That’s heavier than any turkey sold — check the weight and the unit.' };
    if (lb < 1) return { err: 'That’s too small for a turkey — check the weight and the unit.' };
    return { n: st.unit === 'lb' ? lb : lb / E.LB_PER_KG, lb: lb };
  }
  function wl(lb) { return st.unit === 'lb' ? fmtN(lb) + ' lb' : fmtN(lb / E.LB_PER_KG) + ' kg (' + fmtN(lb) + ' lb)'; }
  function wr(a, b) { return st.unit === 'lb' ? a + ' to ' + b + ' lb' : fmtN(a / E.LB_PER_KG) + ' to ' + fmtN(b / E.LB_PER_KG) + ' kg (' + a + ' to ' + b + ' lb)'; }
  function wTxt(w) { return st.unit === 'lb' ? fmtN(w.n) + ' lb' : fmtN(w.n) + ' kg (' + fmtN(w.lb) + ' lb)'; }
  function readOpt(id, def, min, max, msg) {
    var raw = $(id).value.trim();
    if (!raw) return { v: def };
    var n = num(raw);
    if (!isFinite(n) || n < min || n > max) return { v: def, err: msg };
    return { v: n };
  }

  /* ---------- render ---------- */
  function rowsHtml(rows) { return '<tbody>' + rows.map(function (r) { return '<tr' + (r[2] ? ' class="cur"' : '') + '><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody>'; }
  function show(id, on) { $(id).style.display = on ? '' : 'none'; }
  function setPrimary(lab, big, sub, mlab, mval) {
    $('tkResLab').textContent = lab; $('tkBig').textContent = big; $('tkSub').textContent = sub;
    $('tkMLab').textContent = mlab; $('tkMVal').textContent = mval;
  }
  function blank(msg, hint) {
    var lab = PAGE === 'cook' ? 'Cooking time' : 'Thawing time';
    setPrimary(lab, '—', msg, lab, '—');
    $('tkUnitLab').textContent = '';
    show('tkOut', false); setHint(hint || '');
  }
  function rangeTxt(c) {
    if (c.hi < 1.5) return { big: Math.round(c.lo * 60) + (c.lo === c.hi ? '' : '–' + Math.round(c.hi * 60)) + ' min', unit: '' };
    return { big: E.q(c.lo) + (c.lo === c.hi ? '' : '–' + E.q(c.hi)), unit: 'hours' };
  }
  function cookHint(err, lb) {
    var M = E.METHODS[st.cook];
    if (!err) return '';
    if (err.k === 'methodcut') return 'The USDA gives ' + M.label.toLowerCase() + ' times for whole turkeys of ' + wr(M.from, M.to) + ' — switch the cut to Whole turkey.';
    if (err.k === 'method') return 'The USDA gives ' + M.label.toLowerCase() + ' times for turkeys of ' + wr(M.from, M.to) + '.';
    if (err.k === 'frozen') return 'The USDA gives a cook-from-frozen time only for an unstuffed whole turkey of ' + wr(8, 24) + ' in an oven or electric roaster.';
    if (err.cut === 'breast') return lb > 8 ? 'The USDA chart for a turkey breast stops at ' + wl(8) + ' — for a bigger bird choose Whole turkey.' : 'The USDA has no roasting time for this weight.';
    return 'The USDA chart stops at ' + wl(24) + ', so there is no official roasting time for a bigger bird.';
  }

  function render() {
    var w = readWeight();
    var M = E.METHODS[st.cook], ovenLike = !!M.chart;
    var cutName = st.cut === 'breast' ? 'turkey breast' : 'whole turkey';
    var needsThaw = st.state === 'thaw' || (st.state === 'frozen' && !ovenLike), fromFrozen = st.state === 'frozen' && ovenLike;
    var noStuff = st.cut === 'breast' || M.nostuff || fromFrozen;
    var cav = noStuff ? 'un' : st.cav;
    $('tkStuffFld').style.display = noStuff ? 'none' : '';
    $('tkMethFld').style.display = needsThaw ? '' : 'none';
    if (w.none) { blank('Enter your turkey’s weight.', ''); return; }
    if (w.err) { blank('Enter your turkey’s weight.', w.err); return; }
    var hints = [];
    var lb = w.lb, th = E.thaw(lb);
    var cx = E.cookX({ lb: lb, cut: st.cut, method: st.cook, cav: cav, frozen: fromFrozen }), c = cx.c || null, chint = cookHint(cx.err, lb);
    if (!c && PAGE === 'cook') hints.push(chint);
    var rest = readOpt('tkRest', 20, 0, 240, 'Rest time must be 0 to 240 minutes — using 20.'), brine = readOpt('tkBrine', 0, 0, 72, 'Brining time must be 0 to 72 hours.');
    if (rest.err) hints.push(rest.err);
    if (brine.err) hints.push(brine.err);
    var cavName = cav === 'st' ? ', stuffed' : cav === 'part' ? ', partly stuffed' : ', unstuffed';
    var cutLab = (c && c.est) ? cutName + ', estimate' : (c && c.fb) ? 'whole turkey, USDA turkey-breast row' : cutName + (st.cut === 'whole' ? cavName : '');
    if (c && !ovenLike) cutLab = cutName + ' · ' + M.label.toLowerCase() + (c.est ? ', estimate' : '');
    if (c && c.frozen) cutLab += ' · from frozen';
    var verb = ovenLike ? 'Roasting' : 'Cooking', cut0 = st.cut;

    /* thaw box */
    var thawRows = [];
    thawRows.push(['Refrigerator', (th.fridgeHi >= 24 ? E.days(th.fridgeLo) + ' to ' + E.dur(th.fridgeHi) : E.dur(th.fridgeLo) + ' to ' + E.dur(th.fridgeHi)) + (th.fridgeHi >= 24 ? ' <small>(' + E.hm(th.fridgeLo) + ' to ' + E.hm(th.fridgeHi) + ')</small>' : ''), st.method === 'fridge']);
    thawRows.push(['Cold water', E.hm(th.cold) + ' <small>(' + (st.unit === 'lb' ? '30 min per lb' : '66 min per kg') + ')</small>', st.method === 'cold']);
    $('tkThawTbl').innerHTML = rowsHtml(thawRows);
    var tt = st.method === 'cold'
      ? 'Cold water: leak-proof bag, cold tap water, change the water every 30 minutes — and cook the turkey immediately after it thaws.'
      : 'Refrigerator: plan on the long end — ' + E.dur(th.fridgeHi) + ' at 40 °F (4 °C) or below. A thawed turkey keeps in the fridge 1–2 days before cooking.';
    if (!th.inTable) tt += ' (Outside the USDA table of ' + wr(4, 24) + ', so this extends the same rule: 24 hours per ' + wr(4, 5) + '.)';
    $('tkThawTip').textContent = tt;
    $('tkThawFresh').textContent = fromFrozen ? 'You are cooking from frozen, so there is no thawing step — the USDA adds 50% to the cooking time instead.' : 'A fresh or already-thawed turkey needs no thawing — it goes straight to the oven.';
    $('tkThawFresh').style.display = needsThaw ? 'none' : '';
    $('tkThawTbl').style.display = needsThaw ? '' : 'none';
    $('tkThawTip').style.display = needsThaw ? '' : 'none';

    /* cook box */
    if (c) {
      var rt = rangeTxt(c), cr = [['Turkey', wTxt(w) + ' · ' + cutLab]], single = c.lo === c.hi;
      if (c.est) cr.push([ovenLike ? 'USDA chart row' : 'USDA range', c.why === 'below' ? 'Below the chart — it starts at ' + wl(4) : c.why === 'above' ? 'Above the chart — it stops at ' + wl(c.top) : wr(M.from, M.to) + ' whole turkeys only']);
      else cr.push([ovenLike ? 'USDA chart row' : 'USDA range', wr(c.from, c.to) + (c.fb ? ' (turkey breast)' : '') + (c.mixed ? ' (between unstuffed and stuffed)' : '')]);
      cr.push([(c.est ? 'Estimated ' + verb.toLowerCase() : verb) + ' time' + (ovenLike ? ' at ' + M.short : ' (' + M.short + ')'), (c.est && single) ? 'about ' + E.hm(c.lo) : (c.chart ? rt.big + (rt.unit ? ' ' + rt.unit : '') : E.hm(c.lo) + ' to ' + E.hm(c.hi)), true]);
      if (!single) {
        cr.push(['In hours and minutes', E.hm(c.lo) + ' to ' + E.hm(c.hi)]);
        cr.push(['Start checking the temperature after', E.hm(c.lo)]);
        cr.push(['Plan on', E.hm(c.hi) + ' to cook']);
      }
      var rpmTxt = c.rpm ? (st.unit === 'lb' ? (Math.round(c.rpm * 2) / 2) + ' minutes per pound' : Math.round(c.rpm * E.LB_PER_KG) + ' minutes per kg') : '';
      var nt = '';
      if (c.est && c.why === 'below') nt = 'Estimate only: the USDA chart starts at ' + wl(4) + ', so this extends its ' + wr(4, 6) + ' turkey-breast rate (about ' + rpmTxt + '). Go by the 165 °F thermometer reading.';
      else if (c.est && c.why === 'above') nt = 'Estimate only: the USDA chart stops at ' + wl(c.top) + ', so this extends its top row (about ' + rpmTxt + '). Go by the 165 °F thermometer reading.';
      else if (c.est && c.why === 'breast-method') nt = 'Estimate only: the USDA gives ' + M.label.toLowerCase() + ' times for whole turkeys of ' + wr(M.from, M.to) + '; this applies the same minutes per pound to your turkey breast. Go by the 165 °F thermometer reading.';
      else if (c.est && c.why === 'method-range') nt = 'Estimate only: the USDA gives ' + M.label.toLowerCase() + ' times for turkeys of ' + wr(M.from, M.to) + '; this applies the same minutes per pound to your weight. Go by the 165 °F thermometer reading.';
      else if (c.fb) nt = 'The USDA lists no whole turkey under ' + wl(8) + ' — this is its ' + wr(4, 8) + ' turkey-breast time.';
      else if (c.mixed) nt = 'Partly stuffed is the midpoint of the USDA unstuffed and stuffed times.';
      else if (!ovenLike) nt = M.temp;
      if (nt) cr.push(['Note', nt]);
      if (c.frozen) cr.push(['Note', 'Cooking from frozen adds 50% to the time (USDA, published for unstuffed whole turkeys of ' + wr(8, 24) + '). Do not use an oven cooking bag, and take the giblets out as it thaws.' + (c.est || c.fb || c.mixed || cut0 !== 'whole' ? ' Applied here to your turkey.' : '')]);
      if (st.state === 'frozen' && !ovenLike) cr.push(['Note', 'The USDA adds 50% for cooking from frozen only in an oven or electric roaster — for this method the plan thaws the turkey first.']);
      $('tkCookTbl').innerHTML = rowsHtml(cr);
      show('tkCookTbl', true); show('tkCookTip', true); $('tkCookNone').style.display = 'none';
    } else {
      $('tkCookNone').textContent = chint || 'There is no USDA time for this weight.';
      show('tkCookTbl', false); show('tkCookTip', false); $('tkCookNone').style.display = '';
    }

    /* primary result */
    var feeds = Math.floor(lb / 1.5) + '–' + Math.floor(lb) + ' guests';
    var sub1 = wTxt(w) + ' · feeds about ' + feeds;
    if (PAGE === 'cook') {
      if (c) {
        var rb = rangeTxt(c), es = c.est && c.lo === c.hi, big = c.est ? '~' + (es ? E.hm(c.lo) : rb.big) : rb.big;
        $('tkUnitLab').textContent = es ? '' : rb.unit;
        setPrimary(verb + ' time', big, (ovenLike ? 'at ' + M.short : M.short) + ' · ' + cutLab + ' · ' + wTxt(w), verb + ' time', es ? big : big + (rb.unit ? ' h' : ''));
      } else { $('tkUnitLab').textContent = ''; setPrimary('Cooking time', '—', chint || 'No USDA time for this weight.', 'Cooking time', '—'); }
    } else {
      if (needsThaw) {
        var tb = st.method === 'cold' ? E.hm(th.cold) : E.days(th.fridgeLo) + '–' + E.days(th.fridgeHi);
        $('tkUnitLab').textContent = st.method === 'cold' ? '' : 'days';
        setPrimary('Thawing time', tb, (st.method === 'cold' ? 'in cold water · change the water every 30 min · ' : 'in the refrigerator · plan on ' + E.dur(th.fridgeHi) + ' · ') + sub1, 'Thawing time', st.method === 'cold' ? E.hm(th.cold) : E.days(th.fridgeLo) + '–' + E.days(th.fridgeHi) + ' days');
      } else {
        $('tkUnitLab').textContent = '';
        setPrimary('Thawing time', 'None', (fromFrozen ? 'Cooking from frozen — no thawing step · ' : 'A fresh or already-thawed turkey goes straight to the oven · ') + sub1, 'Thawing time', 'None');
      }
    }
    show('tkOut', true);

    /* dinner plan */
    var dd = dp ? dp.getDate() : null, mins = fieldMin(), planHtml = '', planOn = false, planTip = '';
    var timeRaw = tf.input.value.trim();
    if (dd && !timeRaw) { hints.push('Add a dinner time to see your schedule.'); }
    else if (dd && mins == null) { hints.push('Enter the dinner time like 6:30 and pick AM or PM.'); }
    else if (!dd && timeRaw && mins != null) { hints.push('Pick a dinner date to see your schedule.'); }
    else if (dd && mins != null) {
      var serve = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate(), Math.floor(mins / 60), mins % 60), now = nowDate();
      if (serve.getTime() <= now.getTime()) hints.push('That dinner time has already passed — pick a later date or time.');
      else if (!c) hints.push('The schedule needs a USDA cooking time. ' + chint);
      else {
        var p = E.plan({ serve: serve, now: now, lb: lb, c: c, frozen: needsThaw, method: st.method, restMin: rest.v, brineH: brine.v });
        planOn = true;
        var items = [];
        p.steps.forEach(function (s, i) {
          var nxt = p.steps[i + 1];
          items.push('<li class="tk-st tk-' + s.k + '"><span class="tk-dot"></span><div class="tk-when">' + E.when(s.t) + '</div><div class="tk-what">' + esc(s.what) + '</div>' + (s.det ? '<div class="tk-det">' + esc(s.det) + '</div>' : '') +
            (nxt ? '<div class="tk-gap">' + E.dur(Math.round((nxt.t - s.t) / 36000) / 100) + ' later</div>' : '') + '</li>');
        });
        planHtml = '<ol class="tk-tl">' + items.join('') + '</ol>';
        if (p.ovenLate) {
          planTip = 'For dinner at that time the turkey should already be in the oven — move dinner later.';
        } else if (p.late) {
          planTip = p.coldOk
            ? 'The refrigerator can no longer finish in time — start thawing in cold water instead (' + E.hm(p.th.cold) + ', cook right after) or move dinner later.'
            : 'There is not enough time left to thaw this turkey safely — move dinner later, pick a smaller turkey, or cook a fresh one.';
        } else if (p.notes.indexOf('brine') >= 0) {
          planTip = 'A cold-water thawed turkey must be cooked right away, so the brining step is left out — use the refrigerator to thaw if you want to brine.';
        }
      }
    }
    $('tkTL').innerHTML = planHtml;
    show('tkPlanBox', planOn);
    $('tkPlanTip').textContent = planTip; $('tkPlanTip').style.display = planTip ? '' : 'none';

    /* guests */
    var gu = readOpt('tkGuests', 0, 1, 200, 'Guests must be a number from 1 to 200.');
    if (gu.err) hints.push(gu.err);
    var gn = '';
    if (gu.v > 0) gn = 'For ' + gu.v + (gu.v === 1 ? ' guest' : ' guests') + ' buy about ' + (st.unit === 'lb' ? fmtN(gu.v) + '–' + fmtN(gu.v * 1.5) + ' lb' : fmtN(gu.v / E.LB_PER_KG) + '–' + fmtN(gu.v * 1.5 / E.LB_PER_KG) + ' kg') + ' of whole turkey (1–1.5 lb per person; the higher end leaves leftovers). The <a href="/turkey-size-calculator/">turkey size calculator</a> adds children and leftovers.';
    $('tkGuestNote').innerHTML = gn; $('tkGuestNote').style.display = gn ? '' : 'none';
    setHint(hints.length ? hints[0] : '');
  }

  /* ---------- events ---------- */
  function readUnitSwitch(to) {
    if (to === st.unit) return;
    var raw = $('tkW').value.trim(), p = E.parseWeight(raw, st.unit);
    st.unit = to; setSeg('tkUnit', to);
    $('tkWUnit').textContent = to; $('tkW').placeholder = to === 'lb' ? 'e.g. 15 or 15 lb 8 oz' : 'e.g. 7 or 6800 g';
    if (raw && !p.err && p.lb > 0 && p.lb <= 60) {
      var conv = to === 'kg' ? p.lb / E.LB_PER_KG : p.lb;
      $('tkW').value = String(Math.round(conv * 10) / 10);
    }
    render();
  }
  function nextHoliday(kind) {
    var now = nowDate(), y = now.getFullYear();
    function mk(yr) { if (kind === 'tg') { var f = new Date(yr, 10, 1); return new Date(yr, 10, 1 + (4 - f.getDay() + 7) % 7 + 21); } return new Date(yr, 11, 25); }
    var d = mk(y); if (d < midnight(now)) d = mk(y + 1); return d;
  }
  function bind(id, key, map) { $(id).addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st[key] = b.getAttribute('data-v'); setSeg(id, st[key]); render(); }); }
  $('tkUnit').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) readUnitSwitch(b.getAttribute('data-v')); });
  bind('tkState', 'state'); bind('tkCut', 'cut'); bind('tkStuff', 'cav'); bind('tkMethod', 'method');
  $('tkCook').addEventListener('change', function () { st.cook = this.value || 'oven'; render(); });
  $('tkDay').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var d = nextHoliday(b.getAttribute('data-v'));
    if (dp) dp.setDate(d); else $('tkDate').value = d.getDate() + ' ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()] + ' ' + d.getFullYear();
    render();
  });
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t.closest || !t.closest('.p-turkey')) return;
    if (t.classList.contains('time-digits')) { refreshGhost(); render(); return; }
    if (/^tk(W|Rest|Brine|Guests|Date)$/.test(t.id)) render();
  });
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest || !t.closest('.p-turkey')) return;
    var apb = t.closest('.ap-seg button');
    if (apb) { var ap = apb.getAttribute('data-ap'); if (ap !== st.ap) { st.ap = ap; paintAp(); render(); } }
  });
  $('tkAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('tkAdvBtn').classList.toggle('open', st.adv);
    $('tkAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('tkAdv').style.display = st.adv ? '' : 'none';
    if (!st.adv) ['tkRest', 'tkBrine', 'tkGuests'].forEach(function (id) { $(id).value = ''; });
    render();
  });

  /* ---------- init ---------- */
  var tfEl = $('tkTime');
  tf = { input: tfEl.querySelector('.time-digits'), ghost: tfEl.querySelector('.time-ghost'), seg: tfEl.querySelector('.ap-seg') };
  paintAp(); refreshGhost();
  if (window.Datepicker) {
    dp = new Datepicker($('tkDate'), { format: 'd MM yyyy', autohide: true, weekStart: 0, todayHighlight: true, minDate: new Date() });
    $('tkDate').addEventListener('changeDate', render);
  }
  ['change'].forEach(function (ev) { $('tkDate').addEventListener(ev, render); });
  /* ?w=15&u=lb from the size calculator */
  try {
    var qs = new URLSearchParams(location.search), qw = qs.get('w'), qu = qs.get('u');
    if (qu === 'kg') readUnitSwitch('kg');
    if (qw && /^\d+(\.\d+)?$/.test(qw)) $('tkW').value = qw;
  } catch (e) {}
  render();
};

/* =========================================================
   COOKING · TURKEY SIZE CALCULATOR (/turkey-size-calculator/) — adults, children, leftovers
   -> the size to buy, plus the thaw and cook times for it (USDA, same engine) and a one-click
   hand-off to the cooking calculator. Visual: a stacked bar of who eats what.
   ========================================================= */
CalcThis.initTurkeySizeCalc = function () {
  var E = CalcThis.turkeyEngine;
  var $ = function (id) { return document.getElementById(id); };
  var st = { unit: 'lb', left: false, adv: false };
  function num(v) { var t = String(v).replace(/,/g, '').trim(); var n = t === '' ? NaN : Number(t); return isFinite(n) ? n : NaN; }
  function fmtN(n) { return String(Math.round(n * 10) / 10); }
  function setSeg(id, v) { [].forEach.call($(id).querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); }); }
  function setHint(m) { var h = $('tsHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  function W(lb) { return st.unit === 'lb' ? fmtN(lb) + ' lb' : fmtN(lb / E.LB_PER_KG) + ' kg'; }
  function opt(id, def, min, max, msg, hints) {
    var raw = $(id).value.trim(); if (!raw) return def;
    var n = num(raw); if (!isFinite(n) || n < min || n > max) { hints.push(msg); return def; } return n;
  }
  /* a portion typed in the shown unit -> pounds; the range is checked in pounds */
  function optU(id, defLb, minLb, maxLb, msg, hints) {
    var raw = $(id).value.trim(); if (!raw) return defLb;
    var n = num(raw), lb = st.unit === 'kg' ? n * E.LB_PER_KG : n;
    if (!isFinite(n) || lb < minLb - 1e-9 || lb > maxLb + 1e-9) { hints.push(msg); return defLb; }
    return lb;
  }
  function cnt(id, label, hints) {
    var raw = $(id).value.trim(); if (!raw) return 0;
    var n = num(raw);
    if (!/^\d+$/.test(raw) || n > 500) { hints.push(label + ' must be a whole number from 0 to 500.'); return null; }
    return n;
  }
  function setPrimary(lab, big, unit, sub, mval) { $('tsResLab').textContent = lab; $('tsBig').textContent = big; $('tsUnitLab').textContent = unit; $('tsSub').textContent = sub; $('tsMVal').textContent = mval; }
  function rowsHtml(rows) { return '<tbody>' + rows.map(function (r) { return '<tr' + (r[2] ? ' class="cur"' : '') + '><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody>'; }
  function times(lb) {
    var th = E.thaw(lb), un = E.cookX({ lb: lb, cut: 'whole', method: 'oven', cav: 'un' }), sf = E.cookX({ lb: lb, cut: 'whole', method: 'oven', cav: 'st' });
    var br = E.cookX({ lb: lb, cut: 'breast', method: 'oven', cav: 'un' });
    var rg = function (r) { return r.c ? (r.c.est ? 'about ' + E.hm(r.c.lo) : E.q(r.c.lo) + (r.c.lo === r.c.hi ? '' : '–' + E.q(r.c.hi)) + ' hours') : '—'; };
    return { th: th, un: rg(un), sf: rg(sf), br: rg(br) };
  }
  function render() {
    var hints = [];
    var a = cnt('tsAdults', 'Adults', hints), k = cnt('tsKids', 'Children', hints);
    if (a === null || k === null) { $('tsOut').style.display = 'none'; setPrimary('Turkey to buy', '—', '', 'Enter the number of adults.', '—'); setHint(hints[0]); return; }
    if (!a && !k) { $('tsOut').style.display = 'none'; setPrimary('Turkey to buy', '—', '', 'Enter the number of adults and children.', '—'); setHint(''); return; }
    var veg = cnt('tsVeg', 'Adults not eating turkey', hints); if (veg === null) veg = 0;
    if (veg > a) { hints.push('Adults not eating turkey can’t be more than the adults.'); veg = 0; }
    var aP = optU('tsAdultP', 1, 0.25, 5, 'Portion per adult must be ' + W(0.25) + ' to ' + W(5) + ' — using ' + W(1) + '.', hints);
    var kP = optU('tsKidP', 0.5, 0.1, 5, 'Portion per child must be ' + W(0.1) + ' to ' + W(5) + ' — using ' + W(0.5) + '.', hints);
    var lX = opt('tsLeftX', 1.5, 1, 4, 'Leftover multiplier must be 1 to 4 — using 1.5.', hints);
    var r = E.size({ adults: a, kids: k, veg: veg, adultP: aP, kidP: kP, leftovers: st.left, leftX: lX });
    if (!(r.totalLb > 0)) { $('tsOut').style.display = 'none'; setPrimary('Turkey to buy', '—', '', 'Everyone is skipping the turkey.', '—'); setHint(hints[0] || ''); return; }
    var guests = a + k, who = (a ? a + (a === 1 ? ' adult' : ' adults') : '') + (a && k ? ' and ' : '') + (k ? k + (k === 1 ? ' child' : ' children') : '') + (st.left ? ' · with leftovers' : '');
    var buy = r.buy, k2 = 1, each = buy, note = '';
    if (buy > 24) { k2 = Math.ceil(buy / 24); each = Math.ceil(buy / k2); note = 'That is bigger than most ovens and the USDA chart (' + W(24) + ') allow — buy ' + k2 + ' turkeys of about ' + W(each) + ' each.'; }
    else if (buy < 8) note = 'A whole turkey this small is hard to find — buy a turkey breast of about ' + W(Math.max(buy, 1)) + ', or the smallest whole turkey (' + W(8) + ') and enjoy the leftovers.';
    var mult = k2 > 1 ? k2 + ' × ' : '';
    setPrimary('Turkey to buy', mult + (st.unit === 'lb' ? String(each) : fmtN(each / E.LB_PER_KG)), st.unit === 'lb' ? 'lb' : 'kg', who, mult + W(each));
    $('tsOut').style.display = '';
    /* stacked bar */
    var tot = r.totalLb, seg = [['ts-a', r.adultLb, 'Adults'], ['ts-k', r.kidLb, 'Children'], ['ts-l', r.leftLb, 'Leftovers']].filter(function (s) { return s[1] > 0.0001; });
    $('tsBar').innerHTML = '<div class="ts-bar">' + seg.map(function (s) { return '<span class="' + s[0] + '" style="width:' + (s[1] / tot * 100) + '%"></span>'; }).join('') + '</div><div class="ts-key">' + seg.map(function (s) { return '<span><i class="' + s[0] + '"></i>' + s[2] + ' ' + W(s[1]) + '</span>'; }).join('') + '</div>';
    var rows = [['Guests', String(guests) + (veg ? ' (' + veg + ' skipping turkey)' : '')], ['Meat needed', W(r.totalLb) + (st.left ? ' (' + W(r.baseLb) + ' + leftovers)' : '')], ['Turkey to buy', mult + W(each) + (each < 8 ? ' turkey breast' : ' whole turkey'), true]];
    $('tsTbl').innerHTML = rowsHtml(rows);
    var T = times(Math.max(1, each)), breast = each < 8;
    $('tsTimesH').textContent = 'Thaw and cook a ' + W(each) + (breast ? ' turkey breast' : ' turkey');
    var cr = [['Thaw in the refrigerator', E.days(T.th.fridgeLo) + ' to ' + E.dur(T.th.fridgeHi)], ['Thaw in cold water', E.hm(T.th.cold)]];
    if (breast) cr.push(['Roast the breast at 325 °F (163 °C)', T.br]);
    else { cr.push(['Roast unstuffed at 325 °F (163 °C)', T.un]); cr.push(['Roast stuffed at 325 °F (163 °C)', T.sf]); }
    $('tsTimesTbl').innerHTML = rowsHtml(cr);
    var link = '/turkey-cooking-time-calculator/?w=' + (st.unit === 'lb' ? each : fmtN(each / E.LB_PER_KG)) + '&u=' + st.unit;
    $('tsPlan').setAttribute('href', link);
    $('tsNote').textContent = note; $('tsNote').style.display = note ? '' : 'none';
    setHint(hints[0] || '');
  }
  document.addEventListener('input', function (e) { var t = e.target; if (t.closest && t.closest('.p-turksize') && /^ts[A-Z]/.test(t.id)) render(); });
  $('tsUnit').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var to = b.getAttribute('data-v'); if (to === st.unit) return;
    ['tsAdultP', 'tsKidP'].forEach(function (id) { var raw = $(id).value.trim(), n = num(raw); if (raw && isFinite(n) && n > 0) $(id).value = String(Math.round((to === 'kg' ? n / E.LB_PER_KG : n * E.LB_PER_KG) * 100) / 100); });
    st.unit = to; setSeg('tsUnit', st.unit);
    $('tsPUnitA').textContent = to === 'lb' ? 'lb — blank = 1' : 'kg — blank = 0.45'; $('tsPUnitK').textContent = to === 'lb' ? 'lb — blank = 0.5' : 'kg — blank = 0.23';
    $('tsAdultP').placeholder = to === 'lb' ? '1' : '0.45'; $('tsKidP').placeholder = to === 'lb' ? '0.5' : '0.23';
    render();
  });
  $('tsLeft').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.left = b.getAttribute('data-v') === 'yes'; setSeg('tsLeft', st.left ? 'yes' : 'no'); render(); });
  $('tsAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('tsAdvBtn').classList.toggle('open', st.adv);
    $('tsAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    $('tsAdv').style.display = st.adv ? '' : 'none';
    if (!st.adv) ['tsVeg', 'tsAdultP', 'tsKidP', 'tsLeftX'].forEach(function (id) { $(id).value = ''; });
    render();
  });
  render();
};

/* =========================================================
   FINANCE · SALES TAX CALCULATOR — hub (/sales-tax-calculator/) + one page per state
   (/sales-tax-calculator/new-jersey/ …). One engine + one UI. A state page is "live" only when
   its rate, exempt categories, special zones and shipping rule come from the state's own
   published guidance (source + date shown on the page); every other state still calculates
   from its STATE rate and is labelled "state rate only" with the sourced maximum local add-on
   shown as a range — never a guessed local rate. State pages: <body data-state="NJ">.
   State rates + local ranges: Tax Foundation, "2026 Sales Tax Rates, Midyear Update"
   (rates as of July 1, 2026). NJ rules: NJ Division of Taxation bulletins S&U-4 and S&U-5.
   ========================================================= */
/* SALESTAX-ENGINE:START */
CalcThis.saleTaxEngine = (function () {
  var SRC_TF = 'https://taxfoundation.org/data/all/state/2026-sales-tax-rates-midyear/';
  /* code: [name, state rate %, average local %, maximum local %] */
  var T = {
    AL: ['Alabama', 4, 5.46, 8], AK: ['Alaska', 0, 1.82, 7.85], AZ: ['Arizona', 5.6, 2.94, 5.3], AR: ['Arkansas', 6.5, 2.98, 6.13], CA: ['California', 7.25, 1.78, 5.25],
    CO: ['Colorado', 2.9, 4.99, 9.1], CT: ['Connecticut', 6.35, 0, 0], DE: ['Delaware', 0, 0, 0], DC: ['District of Columbia', 6, 0, 0], FL: ['Florida', 6, 0.98, 2],
    GA: ['Georgia', 4, 3.56, 5], HI: ['Hawaii', 4, 0.5, 0.5], ID: ['Idaho', 6, 0.03, 3], IL: ['Illinois', 6.25, 2.73, 4.75], IN: ['Indiana', 7, 0, 0],
    IA: ['Iowa', 6, 0.94, 1], KS: ['Kansas', 6.5, 2.21, 4.25], KY: ['Kentucky', 6, 0, 0], LA: ['Louisiana', 5, 5.13, 7], ME: ['Maine', 5.5, 0, 0],
    MD: ['Maryland', 6, 0, 0], MA: ['Massachusetts', 6.25, 0, 0], MI: ['Michigan', 6, 0, 0], MN: ['Minnesota', 6.875, 1.26, 3], MS: ['Mississippi', 7, 0.06, 1],
    MO: ['Missouri', 4.225, 4.22, 6.25], MT: ['Montana', 0, 0, 0], NE: ['Nebraska', 5.5, 1.48, 2], NV: ['Nevada', 6.85, 1.39, 1.53], NH: ['New Hampshire', 0, 0, 0],
    NJ: ['New Jersey', 6.625, 0, 0], NM: ['New Mexico', 4.875, 2.8, 4.56], NY: ['New York', 4, 4.54, 4.88], NC: ['North Carolina', 4.75, 2.35, 3.5], ND: ['North Dakota', 5, 2.09, 3.75],
    OH: ['Ohio', 5.75, 1.54, 2.25], OK: ['Oklahoma', 4.5, 4.56, 7], OR: ['Oregon', 0, 0, 0], PA: ['Pennsylvania', 6, 0.34, 2], RI: ['Rhode Island', 7, 0, 0],
    SC: ['South Carolina', 6, 1.49, 3], SD: ['South Dakota', 4.2, 1.91, 4.5], TN: ['Tennessee', 7, 2.61, 2.75], TX: ['Texas', 6.25, 1.95, 2], UT: ['Utah', 6.1, 1.32, 4.7],
    VT: ['Vermont', 6, 0.43, 1], VA: ['Virginia', 5.3, 0.47, 2.7], WA: ['Washington', 6.5, 3.07, 4.2], WV: ['West Virginia', 6, 0.6, 1.4], WI: ['Wisconsin', 5, 0.72, 2.9], WY: ['Wyoming', 4, 1.39, 3]
  };
  var S = {};
  Object.keys(T).forEach(function (c) { S[c] = { code: c, name: T[c][0], base: T[c][1], avgLocal: T[c][2], maxLocal: T[c][3], live: false, src: [{ t: 'Tax Foundation — 2026 sales tax rates (July 1, 2026)', u: SRC_TF }] }; });
  var NJ_GUIDE = { t: 'NJ Division of Taxation — New Jersey Sales Tax Guide (S&U-4)', u: 'https://www.nj.gov/treasury/taxation/pdf/pubs/sales/su4.pdf' };
  var NJ_MAIL = { t: 'NJ Division of Taxation — Making Mail-Order and Internet Sales (S&U-5)', u: 'https://www.nj.gov/treasury/taxation/pdf/pubs/sales/su5.pdf' };
  Object.assign(S.NJ, {
    live: true, slug: 'new-jersey', eff: 'July 1, 2026', nearby: ['NY', 'PA', 'DE'],
    src: [NJ_GUIDE, NJ_MAIL, { t: 'Tax Foundation — 2026 sales tax rates (July 1, 2026)', u: SRC_TF }],
    cats: [
      { id: 'general', label: 'Other goods', long: 'Most other goods', taxable: true, note: 'Most goods are taxable.' },
      { id: 'grocery', label: 'Groceries', long: 'Groceries (food for home)', taxable: false, note: 'Food bought for home use is exempt. Candy, soft drinks, alcohol, tobacco and prepared food are taxable.' },
      { id: 'clothing', label: 'Clothing', long: 'Clothing and shoes', taxable: false, note: 'Exempt at any price. Fur clothing, accessories, and sports, recreational or protective equipment are taxable.' },
      { id: 'drugs', label: 'Medicine', long: 'Prescription and over-the-counter drugs', taxable: false, note: 'Prescription and over-the-counter drugs are exempt.' },
      { id: 'prepared', label: 'Restaurant', long: 'Restaurant and prepared food', taxable: true, note: 'Food heated by the seller, combined by the seller, or sold with utensils is taxable.' },
      { id: 'candy', label: 'Candy & soda', long: 'Candy and soft drinks', taxable: true, note: 'Taxable, even in a grocery store (exempt when paid with SNAP benefits).' }
    ],
    zones: [
      { id: 'std', std: true, label: 'Anywhere in New Jersey', rate: 6.625 },
      { id: 'uez', label: 'Urban Enterprise Zone store, in person', rate: 3.3125, cats: ['general'], ignore: 'The half-rate Urban Enterprise Zone price covers most goods bought in person from a certified seller — the standard rate is used for this item. Ask the store.' },
      { id: 'salem', label: 'Salem County store, in person', rate: 3.3125, cats: ['general', 'candy'], ignore: 'Salem County’s half rate does not cover prepared food — the standard rate is used for this item.' },
      { id: 'wild', label: 'Wildwood, Wildwood Crest or North Wildwood', rate: 8.625, cats: ['prepared'], ignore: 'The extra 2% Cape May tourism tax applies to restaurant food and drink, lodging and admissions — the standard rate is used for this item.' }
    ],
    shipNote: 'Delivery charges are taxed when the item is taxable and not taxed when it is exempt. A mixed shipment is split by price.',
    others: [
      { t: 'Urban Enterprise Zones and Salem County', d: 'In-person sales by certified sellers in an Urban Enterprise Zone, and most in-person goods sales in Salem County, are taxed at half the rate: 3.3125%. Online, mail-order, services, prepared food, alcohol and motor vehicles in Salem County pay the full rate. Pick your location above.' },
      { t: 'Atlantic City', d: 'A luxury tax of 9% applies to certain sales, rentals and services (3% on alcohol sold by the drink). The state rate is reduced so the combined rate never passes 12.625%.' },
      { t: 'Wildwood, Wildwood Crest and North Wildwood', d: 'A 2% tourism tax is added to restaurant food and drink, lodging and admissions: 8.625% in total. Pick your location above.' },
      { t: 'Hotels and short-term rentals', d: 'Sales tax plus a state occupancy fee of 5% (1% in Newark, Jersey City and Atlantic City; 3.15% in the three Wildwoods) and up to 3% municipal occupancy tax. These fees are not included in the calculator.' },
      { t: 'Bought online or out of state', d: 'If the seller did not charge New Jersey tax, you owe 6.625% use tax on the price plus delivery. If you paid a lower rate elsewhere, you owe the difference — enter that rate under Go advanced.' }
    ]
  });
  /* Missouri: the rate depends on the exact place (city, county and special districts) — every row of the Missouri Department of
     Revenue rate table (October–December 2026, run 8/25/2026) is in /assets/data/mo-rates.json and picked with a typeahead. */
  var MO_DOR = { t: 'Missouri Department of Revenue — Sales/Use Tax', u: 'https://dor.mo.gov/taxation/business/tax-types/sales-use/' };
  Object.assign(S.MO, {
    live: true, slug: 'missouri', eff: 'the October–December 2026 rate table (updated August 25, 2026)',
    src: [MO_DOR, { t: 'Missouri DOR — Sales and Use Tax Rate Tables, Oct–Dec 2026', u: 'https://dor.mo.gov/pdf/rates/2026/october2026.pdf' }, { t: 'Missouri DOR — Sales Tax Reduction on Food', u: 'https://dor.mo.gov/taxation/business/tax-types/sales-use/reduction-on-food.html' }, { t: 'Missouri DOR — Sales Tax Taxability and Exemptions FAQ', u: 'https://dor.mo.gov/faq/taxation/business/sales-use-tax-exemptions.html' }, { t: 'Missouri DOR — Letter Ruling 8387 on delivery charges (March 24, 2026)', u: 'https://dor.mo.gov/rulings/show/8387' }, { t: 'Missouri DOR — Back-to-School Sales Tax Holiday', u: 'https://dor.mo.gov/taxation/business/tax-types/sales-use/holidays/back-to-school/consumers.html' }],
    places: { url: '/assets/data/mo-rates.json', n: 2597, lo: 5.225, hi: 13.238, baseHi: 11.488, foodLo: 2.225, foodHi: 9.85, hubNote: ' (more in districts)', ph: 'Type your city, e.g. Springfield', hint: 'Every place in Missouri adds local tax. Type your city or county and pick the line that matches where the seller is. Lines with CID or TDD are shopping-center districts that add tax.' },
    cats: [
      { id: 'general', label: 'Other goods', long: 'Most other goods', taxable: true, note: 'Taxable at the full combined rate. Over-the-counter medicine is taxable unless it is prescribed or bought by a person with a disability.' },
      { id: 'grocery', label: 'Groceries', long: 'Groceries (food for home)', taxable: true, rate: 'food', note: 'The state rate on food for home use is cut to 1.225%, but local taxes still apply to food — so the rate is the “food” rate listed for your place.' },
      { id: 'prepared', label: 'Restaurant', long: 'Restaurant and prepared food', taxable: true, note: 'Full rate. A seller whose prepared food is more than 80% of its gross receipts charges the full rate on all its food, and food sold at places of amusement is taxed at the full rate.' },
      { id: 'drugs', label: 'Prescription', long: 'Prescription drugs, insulin and hearing aids', taxable: false, note: 'Prescription drugs, insulin and hearing aids are exempt. Over-the-counter medicine is taxable unless prescribed or bought by a person with a disability.' }
    ],
    shipOpt: true, shipOptLabel: 'Shipping and handling are billed as one charge',
    shipNote: 'A delivery charge that is usual, customary and listed separately on the bill is not taxed. If shipping and handling are billed as one charge, the whole charge is taxed — use the shipping box in the calculator.',
    others: [
      { t: 'Local tax everywhere', d: 'Every place in Missouri adds city, county or district tax to the 4.225% state rate. In the October–December 2026 table the combined rate runs from 5.225% to 11.488%, and up to 13.238% inside some special districts. Search your place above.' },
      { t: 'Shopping-center districts (CID, TDD)', d: 'A Community Improvement District or Transportation Development District adds its own tax inside its boundaries. Each one is a separate line in the place search — pick it if the store is inside one.' },
      { t: 'Groceries', d: 'The state rate on food for home use is 1.225% (down from 4.225%). Local taxes still apply to food and drink, and a few places leave some of them off food — the calculator uses the food rate listed for your place.' },
      { t: 'Restaurants and amusement places', d: 'The reduced food rate does not apply when more than 80% of a seller’s gross receipts are prepared food, or to food sold at places of amusement, entertainment or recreation. Food trucks charge the full rate of the place where they sell.' },
      { t: 'Delivery charges', d: 'Separately stated, usual and customary delivery charges are not taxed (RSMo 144.010; DOR letter ruling 8387). A combined “shipping and handling” charge is taxed in full.' },
      { t: 'Back-to-school sales tax holiday', d: 'From 12:01 a.m. on the first Friday in August until midnight on Sunday, clothing of $100 or less, school supplies up to $50, software up to $350, computers and peripherals up to $1,500 and graphing calculators up to $150 are free of state and local sales tax. The calculator does not apply the holiday — outside those days all of these are taxed at your place’s rate.' },
      { t: 'Adult-use marijuana', d: 'Some places add a separate local tax on adult-use marijuana. It is not included in this calculator.' },
      { t: 'Bought online or out of state', d: 'If the seller did not charge Missouri tax you owe use tax at the state rate of 4.225% plus the local use tax where you use the item. Pick your place and enter any tax the seller charged under Go advanced. A use tax return is required once your untaxed purchases pass $2,000 in a year.' },
      { t: 'Rates change every quarter', d: 'Local rates change in January, April, July and October. The rates here are from the October–December 2026 table.' }
    ]
  });
  /* Ohio: the rate is the county rate (plus a few transit-area portions of cities) from the Department of Taxation table, October 1 - December 31, 2026 */
  Object.assign(S.OH, {
    live: true, slug: 'ohio', eff: 'the October 1 – December 31, 2026 county rate table',
    src: [{ t: 'Ohio Department of Taxation — Sales and Use Tax', u: 'https://tax.ohio.gov/business/sales-and-use-tax' }, { t: 'Ohio DOR — Sales and Use Tax Rates by County, Q4 2026', u: 'https://tax.ohio.gov/business/sales-and-use-tax/rate-tables/by-county-q4-2026' }, { t: 'Ohio DOR — Sales and Use Taxability', u: 'https://tax.ohio.gov/business/sales-and-use-tax/taxability' }, { t: 'Ohio DOR — Information Release ST 2004-01, Food Definition', u: 'https://dam.assets.ohio.gov/image/upload/tax.ohio.gov/sales_and_use/information_releases/st200401.pdf' }, { t: 'Ohio Admin. Code 5703-9-52 — Delivery charges', u: 'https://codes.ohio.gov/ohio-administrative-code/rule-5703-9-52' }, { t: 'Ohio DOR — Sales Tax Holiday 2026', u: 'https://tax.ohio.gov/business/sales-and-use-tax/sales-tax-holiday' }],
    places: { url: '/assets/data/oh-rates.json', n: 93, lo: 6.5, hi: 8.25, baseHi: 8, noFood: true, short: true, hubNote: ' (up to 2.5% in transit areas)', ph: 'Type your county or city, e.g. Franklin', hint: 'Every county in Ohio adds its own tax. Type your county or a big city and pick where you receive the item. A few city areas on a transit line have their own rate and are listed separately.' },
    cats: [
      { id: 'general', label: 'Other goods', long: 'Most goods, including clothing and medicine without a prescription', taxable: true, note: 'Clothing, electronics, furniture, over-the-counter medicine, vitamins and supplements, soft drinks, alcohol and tobacco are taxable.' },
      { id: 'grocery', label: 'Food to go', long: 'Groceries and takeout food (eaten off the premises)', taxable: false, note: 'Food bought to eat off the premises is exempt, takeout included. Soft drinks, alcohol, dietary supplements and tobacco are taxable — choose “Other goods” for those.' },
      { id: 'prepared', label: 'Eat-in meal', long: 'Restaurant meals and food eaten on the premises', taxable: true, note: 'Food eaten on the premises, restaurant meals and catered food are taxable.' },
      { id: 'drugs', label: 'Prescription', long: 'Prescription medicine and supplies', taxable: false, note: 'Prescription medicine and supplies (insulin, test strips, syringes), doctor-prescribed equipment and prescription glasses and contacts are exempt. Over-the-counter medicine, vitamins and supplements are taxable.' },
      { id: 'baby', label: 'Baby & period', long: 'Baby products and feminine hygiene products', taxable: false, note: 'Children’s diapers, cribs, strollers and car seats that meet safety standards, and pads, tampons and period underwear are exempt.' }
    ],
    shipNote: 'A delivery charge from the seller is part of the price: it is taxed with a taxable item, not taxed with an exempt one, and a mixed shipment is split by price or weight. A carrier you pay directly is not taxed.',
    others: [
      { t: 'County and transit taxes', d: 'Every county adds its own tax, and some add a transit tax, to the 5.75% state rate. In the October–December 2026 table the combined rate runs from 6.5% to 8%, and the law caps it at 8.75%. Search your county above.' },
      { t: 'Transit-area city portions', d: 'The parts of Columbus, Dublin, Westerville and Reynoldsburg that lie in Delaware, Fairfield, Licking or Union County, and the part of Rossford in Wood County, pay the Central Ohio Transit Authority (COTA) or Toledo Area Regional Transit Authority (TARTA) rate, up to 8.25%. They are separate lines in the search.' },
      { t: 'Food', d: 'Food bought to eat off the premises is exempt, takeout included. Soft drinks, alcohol, dietary supplements and tobacco are taxable, and so is food eaten on the premises.' },
      { t: 'Medicine and medical items', d: 'Prescription medicine and supplies, doctor-prescribed equipment and prescription glasses and contacts are exempt. Over-the-counter medicine, vitamins and supplements are taxable.' },
      { t: 'Baby and period products', d: 'Children’s diapers, cribs, strollers, car seats and feminine hygiene products are exempt.' },
      { t: 'Back-to-school sales tax holiday', d: 'In 2026 it ran from 12:00 a.m. Friday, August 7 to 11:59 p.m. Sunday, August 9: clothing of $75 or less, school supplies of $20 or less and school instructional materials of $20 or less per item were exempt. The dates and limits are set each year. The calculator does not apply the holiday.' },
      { t: 'Delivery charges', d: 'A delivery charge the seller adds is taxed when the item is taxable. If a shipment mixes taxable and exempt items the charge is split by price or weight; if the seller does not split it, the whole charge is taxed.' },
      { t: 'Bought online or out of state', d: 'If the seller did not charge Ohio tax you owe Ohio use tax at your county’s rate. Pick your county and enter any tax the seller charged under Go advanced.' },
      { t: 'Rates change every quarter', d: 'County and transit rates can only change on January 1, April 1, July 1 or October 1. Warren County rose from 6.75% to 7.25% on October 1, 2026; the rates here are from the October–December 2026 table.' }
    ]
  });
  /* Minnesota: the rate is the combined state + local rate for the exact place, from the Department of Revenue Local Sales and Use Tax Rate Guide
     effective 10/1/2026 – 12/31/2026 (every row is in /assets/data/mn-rates.json). Special local taxes (restaurant, entertainment, lodging) are shown, not computed. */
  Object.assign(S.MN, {
    live: true, slug: 'minnesota', eff: 'the October 1 – December 31, 2026 Local Sales and Use Tax Rate Guide',
    src: [{ t: 'Minnesota Department of Revenue — Local Sales and Use Tax Rate Guide, effective 10/1/2026', u: 'https://www.revenue.state.mn.us/sites/default/files/2026-08/local-sales-and-use-tax-rate-guide-2026-q4.pdf' }, { t: 'Minnesota DOR — Special Local Taxes, Fact Sheet 164S (4th quarter 2026)', u: 'https://www.revenue.state.mn.us/sites/default/files/2026-07/164s-2026-4th-quarter_0.pdf' }, { t: 'Minnesota DOR — Minneapolis Special Local Taxes, Fact Sheet 164M (Feb. 2025)', u: 'https://www.revenue.state.mn.us/sites/default/files/2025-02/fs164m.pdf' }, { t: 'Minnesota DOR — Food and Food Ingredients', u: 'https://www.revenue.state.mn.us/guide/food-and-food-ingredients' }, { t: 'Minnesota DOR — Clothing', u: 'https://www.revenue.state.mn.us/clothing' }, { t: 'Minnesota DOR — Drugs', u: 'https://www.revenue.state.mn.us/guide/drugs' }, { t: 'Minnesota DOR — Delivery Charges', u: 'https://www.revenue.state.mn.us/guide/delivery-charges' }],
    places: { url: '/assets/data/mn-rates.json', n: 2116, lo: 6.875, hi: 9.875, baseHi: 9.875, noFood: true, hubNote: ' (St. Paul)', ph: 'Type your city, e.g. Minneapolis', hint: 'Local tax in Minnesota depends on the city, county and township. Type your city and pick it. A city can appear twice (“City of …” and a line with its county); they normally match, so pick the one for your county.' },
    cats: [
      { id: 'general', label: 'Other goods', long: 'Most other goods', taxable: true, note: 'Most goods are taxable. Vitamins and other dietary supplements, candy, soft drinks, alcohol and tobacco products (but not cigarettes) are taxable too.' },
      { id: 'grocery', label: 'Groceries', long: 'Groceries (food for home)', taxable: false, note: 'Food and food ingredients are exempt. Candy, soft drinks, alcohol, prepared food, dietary supplements and food from vending machines are taxable.' },
      { id: 'clothing', label: 'Clothing', long: 'Clothing and shoes', taxable: false, note: 'General-use clothing is exempt at any price. Fur clothing, clothing accessories (handbags, jewelry, nonprescription sunglasses), sports or recreational equipment and protective equipment are taxable.' },
      { id: 'drugs', label: 'Medicine', long: 'Prescription and over-the-counter drugs', taxable: false, note: 'Prescription drugs and over-the-counter drugs (with a Drug Facts panel or active-ingredient list) are exempt. Vitamins and minerals are taxable dietary supplements.' },
      { id: 'prepared', label: 'Restaurant', long: 'Restaurant and prepared food', taxable: true, note: 'Food prepared by the seller or sold with eating utensils is taxable. Some cities add a food and beverage tax on top — see the note under your place.' },
      { id: 'candy', label: 'Candy & soda', long: 'Candy and soft drinks', taxable: true, note: 'Taxable, even in a grocery store. Soft drinks include sweetened water and fruit drinks with 50% juice or less.' }
    ],
    shipNote: 'A delivery charge from the seller is taxed when the item is taxable and not taxed when the item is exempt. A mixed shipment is split by price or weight, and a carrier you pay directly is not taxed.',
    others: [
      { t: 'Local tax depends on the place', d: 'Minnesota’s state rate is 6.875%. Cities, counties and transit areas add their own, so in the October–December 2026 guide the combined rate runs from 6.875% to 9.875% (St. Paul). Search your place above.' },
      { t: 'Twin Cities metro tax', d: 'The seven metro counties — Anoka, Carver, Dakota, Hennepin, Ramsey, Scott and Washington — add 1% (0.25% for housing and 0.75% for transportation). Many counties outside the metro add a 0.5% county or transit tax.' },
      { t: 'Restaurant, entertainment and liquor taxes', d: 'Some places add a special tax that is not in the combined rate: a food and beverage tax on restaurant sales in Detroit Lakes (1%), Mankato (0.5%), Marshall (1.5%), North Mankato (0.5%), Proctor (1%) and the Giants Ridge area (1%); St. Cloud (1% food and 1% liquor); Mankato (0.5% entertainment); and in Minneapolis a 3% entertainment tax everywhere plus 3% restaurant and liquor taxes downtown. A 2.5% liquor gross receipts tax can also apply. Your place’s extras are shown under the search box.' },
      { t: 'Hotels and lodging', d: 'Short-term lodging is taxable, and many places add a local lodging tax: for example 7% in Rochester and St. Paul (hotels with 50 or more rooms), 3% in Minneapolis, Plymouth, Richfield, Woodbury and Cottage Grove, and 4.5% in Marshall. Lodging taxes are not included in the calculator.' },
      { t: 'Food, clothing and medicine', d: 'Groceries, general clothing, prescription drugs and over-the-counter drugs are exempt. Candy, soft drinks, alcohol, prepared food, supplements, fur, clothing accessories, sports gear and protective equipment are taxable.' },
      { t: 'Delivery charges', d: 'A delivery charge from the seller follows the item: taxed with a taxable item, not taxed with an exempt one. A separate retail delivery fee of 50 cents applies to qualifying deliveries of $100 or more; it is shown on the receipt, is not part of the sales tax and is not included here.' },
      { t: 'Bought online or out of state', d: 'If the seller did not charge Minnesota tax you owe use tax at the combined rate for where you use the item. Pick your place and enter any tax the seller charged under Go advanced.' },
      { t: 'Rates change every quarter', d: 'Local rates change in January, April, July and October. The rates here are from the October–December 2026 guide.' }
    ]
  });
  function r2(x) { return Math.round(x * 100 + 1e-9) / 100; }
  function cat(st, id) { var l = st && st.cats ? st.cats : []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function zone(st, id) { var l = st && st.zones ? st.zones : []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  /* the rate that applies to one purchase */
  function rateFor(o) {
    var st = o.state ? S[o.state] : null;
    if (!st) return { rate: o.own == null ? 0 : o.own, taxable: true, ignored: '' };
    var c = cat(st, o.cat);
    if (c && !c.taxable) return { rate: 0, taxable: false, ignored: '', cat: c };
    if (o.own != null) return { rate: o.own, taxable: true, ignored: '', cat: c };
    if (st.places) {
      if (!o.place) return { rate: null, taxable: true, ignored: '', cat: c, needsPlace: true };
      var fd = !!(c && c.rate === 'food');
      return { rate: fd ? o.place.food : o.place.sales, useRate: fd ? o.place.foodUse : o.place.use, taxable: true, ignored: '', cat: c, place: o.place };
    }
    var z = zone(st, o.zone);
    if (!z || z.std) return { rate: st.base, taxable: true, ignored: '', cat: c };
    if (z.cats && z.cats.indexOf(o.cat) < 0) return { rate: st.base, taxable: true, ignored: z.ignore || '', cat: c };
    return { rate: z.rate, taxable: true, ignored: '', zone: z, cat: c };
  }
  /* add tax: items [{amt, cat}], ship, zone, own (rate % or null), paid (rate % already charged or null), shipTaxed (only used when the state's own shipping rule is not on file) */
  function add(o) {
    var items = o.items || [], ship = o.ship || 0, sum = 0, i;
    items.forEach(function (it) { sum += it.amt; });
    var lines = [], taxSum = 0, shipTax = 0, owedRaw = 0, paid = o.paid == null ? null : o.paid;
    var stt = o.state ? S[o.state] : null, shipTaxed = (stt && stt.live && !stt.shipOpt) ? true : !!o.shipTaxed;
    for (i = 0; i < items.length; i++) {
      var it = items[i], rf = rateFor({ state: o.state, cat: it.cat, zone: o.zone, own: o.own, place: o.place });
      var tax = r2(it.amt * rf.rate / 100);
      var share = sum > 0 ? ship * it.amt / sum : 0;
      if (shipTaxed) shipTax += share * rf.rate / 100;
      if (paid != null && rf.taxable) owedRaw += (it.amt + (shipTaxed ? share : 0)) * Math.max(0, (rf.useRate != null ? rf.useRate : rf.rate) - paid) / 100;
      lines.push({ amt: it.amt, cat: it.cat, rate: rf.rate, taxable: rf.taxable, tax: tax, ignored: rf.ignored, catObj: rf.cat });
      taxSum += tax;
    }
    shipTax = r2(shipTax);
    var tax2 = r2(taxSum + shipTax), subtotal = r2(sum), total = r2(subtotal + ship + tax2);
    var base = subtotal + ship;
    var rates = lines.filter(function (l) { return l.taxable; }).map(function (l) { return l.rate; });
    var same = rates.length > 0 && rates.every(function (x) { return x === rates[0]; });
    return { lines: lines, subtotal: subtotal, ship: r2(ship), shipTax: shipTax, tax: tax2, total: total, effective: base > 0 ? tax2 / base * 100 : 0, rate: same ? rates[0] : null, mixed: rates.length > 0 && !same, ignored: lines.map(function (l) { return l.ignored; }).filter(Boolean).filter(function (v, k, a) { return a.indexOf(v) === k; }), owed: paid == null ? null : r2(owedRaw), paid: paid };
  }
  /* tax-inclusive total -> price before tax and the tax inside it */
  function reverse(o) {
    var rf = rateFor({ state: o.state, cat: o.cat, zone: o.zone, own: o.own, place: o.place }), tot = r2(o.total);
    var pre = rf.rate > 0 ? r2(tot / (1 + rf.rate / 100)) : tot;
    return { total: tot, pre: pre, tax: r2(tot - pre), rate: rf.rate, taxable: rf.taxable, ignored: rf.ignored, catObj: rf.cat };
  }
  function findRate(before, after) { return before > 0 ? (after - before) / before * 100 : NaN; }
  /* state rate only: the total at the state rate and at the state rate plus the maximum local add-on */
  function range(code, base) {
    var st = S[code]; if (!st) return null;
    return { lo: r2(base * (1 + st.base / 100)), hi: r2(base * (1 + (st.base + st.maxLocal) / 100)), none: st.maxLocal === 0 };
  }
  return { STATES: S, SRC_TF: SRC_TF, r2: r2, cat: cat, zone: zone, rateFor: rateFor, add: add, reverse: reverse, findRate: findRate, range: range };
})();
/* SALESTAX-ENGINE:END */

CalcThis.initSalesTaxCalc = function () {
  var E = CalcThis.saleTaxEngine, $ = function (id) { return document.getElementById(id); };
  var st = { mode: 'add', adv: false, rows: [{ amt: '', cat: 'general' }], place: null }, last = null;
  var MAX = 1e9;
  var placeData = null, placeState = 'idle', placeHits = [], placeAct = -1, placeShown = 0;
  function num(v) { var t = String(v).replace(/[$,\s%]/g, ''); var n = t === '' ? NaN : Number(t); return isFinite(n) ? n : NaN; }
  function mon(x) { return (x < 0 ? '−' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(x) { return String(Math.round(x * 10000) / 10000) + '%'; }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function setSeg(id, v) { [].forEach.call($(id).querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); }); }
  function setHint(m) { var h = $('stHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  function code() { return $('stState').value || ''; }
  function S() { return code() ? E.STATES[code()] : null; }
  function live() { var s = S(); return !!(s && s.live); }
  function placed() { var s = S(); return !!(s && s.live && s.places); }
  /* ---- place search (states whose rate depends on the exact city / county / district) ---- */
  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/\bsaint\b/g, 'st').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  /* the input shows a short name when the full label is long (Ohio: county + its cities, transit-area portions); the full label is shown under the field */
  function shortLabel(l, on) {
    if (!on) return l;
    var tr = l.match(/^(.*?) — .*\(([^)]*)\)$/); if (tr) return tr[1] + ' — ' + tr[2];
    return l.replace(/ \([^)]*\)$/, '');
  }
  function loadPlaces() {
    var s = S(); if (!placed() || placeData || placeState === 'loading') return;
    placeState = 'loading';
    var done = function (ok, d) { if (ok) { placeData = d.map(function (r) { return { label: r[0], short: shortLabel(r[0], s.places.short), sales: r[1], use: r[2], food: r[3], foodUse: r[4], note: r[5] || '', key: ' ' + norm(r[0]) }; }); placeState = 'ok'; } else placeState = 'err'; placeNote(); render(); if (document.activeElement === $('stPlace')) showPlaceList(!!st.place); };
    try { fetch(s.places.url).then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); }).then(function (d) { done(true, d); }, function () { done(false); }); } catch (e) { done(false); }
  }
  function closePlaceList() { $('stPlaceList').style.display = 'none'; $('stPlace').setAttribute('aria-expanded', 'false'); placeAct = -1; }
  /* the full list is drawn in chunks (Missouri has 2,597 rows): the next chunk is added when the list is scrolled near its end */
  function optHtml(p, i) { return '<button type="button" class="st-ta-opt' + (st.place === p ? ' on' : '') + '" role="option" data-i="' + i + '"><span>' + esc(p.label) + '</span><b>' + pct(p.sales) + '</b></button>'; }
  function moreOpts() {
    var box = $('stPlaceList'); if (placeShown >= placeHits.length || box.scrollTop + box.clientHeight < box.scrollHeight - 120) return;
    var end = Math.min(placeHits.length, placeShown + 120), h = ''; for (var i = placeShown; i < end; i++) h += optHtml(placeHits[i], i);
    box.insertAdjacentHTML('beforeend', h); placeShown = end;
  }
  function showPlaceList(full) {
    var box = $('stPlaceList'), q = full ? '' : norm($('stPlace').value);
    if (!placeData) { closePlaceList(); return; }
    var toks = q ? q.split(' ') : [], hits = placeData.filter(function (p) { return toks.every(function (t) { return p.key.indexOf(' ' + t) >= 0; }); });
    var starts = hits.filter(function (p) { return p.key.indexOf(' ' + q) === 0; }), rest = hits.filter(function (p) { return p.key.indexOf(' ' + q) !== 0; });
    var part = function (a, b) { return (a.label.indexOf(' — ') >= 0 ? 1 : 0) - (b.label.indexOf(' — ') >= 0 ? 1 : 0); };
    var all = starts.slice().sort(part).concat(rest.slice().sort(part)); var cap = q ? 60 : all.length; placeHits = all.slice(0, cap); placeAct = -1;
    if (!all.length) { box.innerHTML = '<div class="st-ta-none">No place matches “' + esc($('stPlace').value.trim()) + '”. Try the city or county name only.</div>'; }
    else { var selI = q ? -1 : placeHits.indexOf(st.place); placeShown = q ? placeHits.length : Math.min(placeHits.length, Math.max(120, selI + 40)); box.innerHTML = placeHits.slice(0, placeShown).map(optHtml).join('') + (q && all.length > 60 ? '<div class="st-ta-none">Showing 60 of ' + all.length + ' — keep typing to narrow it down.</div>' : ''); }
    box.style.display = 'block'; $('stPlace').setAttribute('aria-expanded', 'true');
    var cur = box.querySelector('.st-ta-opt.on'); if (cur) box.scrollTop = Math.max(0, cur.offsetTop - 60); else box.scrollTop = 0;
  }
  function pickPlace(p) {
    if (!p) return;
    st.place = p; $('stPlace').value = p.short; $('stPlace').title = p.label; closePlaceList(); placeNote(); render();
  }
  function placeNote() {
    var n = $('stPlaceNote'), p = st.place, s = S();
    if (!p) { n.textContent = placeState === 'loading' ? 'Loading the official rate table…' : (placeState === 'err' ? 'The rate table could not be loaded. Enter your combined rate under Go advanced instead.' : (s && s.places ? s.places.hint : '')); return; }
    n.textContent = (p.short !== p.label ? p.label + ': ' : '') + pct(p.sales) + ' combined' + (s.places.noFood ? '' : ' on most goods') + ' (' + pct(s.base) + ' state + ' + pct(Math.round((p.sales - s.base) * 1000) / 1000) + ' local)' + (s.places.noFood ? '.' : ' · ' + pct(p.food) + ' on groceries.') + (p.note ? ' ' + p.note : '');
  }
  var CHEV = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  function setPanel(root, opts, val) {
    var panel = root.querySelector('.csel-panel');
    panel.innerHTML = opts.map(function (o) { return '<button type="button" class="csel-opt' + (o[0] === val ? ' on' : '') + '" role="option" aria-selected="' + (o[0] === val) + '" data-value="' + esc(o[0]) + '">' + esc(o[1]) + '</button>'; }).join('');
    root.setAttribute('data-value', val);
    root.querySelector('.csel-val').textContent = (opts.filter(function (o) { return o[0] === val; })[0] || opts[0])[1];
    CalcThis.initCsel(root);
  }
  function catOpts() { var s = S(); return s && s.cats ? s.cats.map(function (c) { return [c.id, c.label]; }) : []; }

  /* ---- item rows ---- */
  function buildRows() {
    var cats = live() ? catOpts() : [], box = $('stItems');
    box.innerHTML = st.rows.map(function (r, i) {
      var lab = i === 0 ? 'Item price' : 'Item ' + (i + 1) + ' price';
      var amt = '<div class="fld"><div class="st-lab"><label class="lab" for="stAmt' + i + '">' + lab + ' <span class="unit">$</span></label>' + (i > 0 ? '<button type="button" class="st-rm" data-i="' + i + '">Remove</button>' : '') + '</div><div class="inp"><input id="stAmt' + i + '" class="st-amt" data-i="' + i + '" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. ' + (i === 0 ? '100' : '25.99') + '" value="' + esc(r.amt) + '"></div></div>';
      if (!cats.length) return '<div class="st-row">' + amt + '</div>';
      return '<div class="st-row ln-two">' + amt + '<div class="fld"><div class="st-lab"><span class="lab">Type</span></div><div class="csel st-cat" data-i="' + i + '" data-value="' + esc(r.cat) + '"><button type="button" class="csel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="csel-val"></span>' + CHEV + '</button><div class="csel-panel" role="listbox"></div></div></div></div>';
    }).join('');
    [].forEach.call(box.querySelectorAll('.st-cat'), function (el) { setPanel(el, cats, el.getAttribute('data-value')); });
  }
  function syncState() {
    var s = S(), lv = live();
    st.rows.forEach(function (r) { if (!lv || !E.cat(s, r.cat)) r.cat = 'general'; });
    buildRows();
    var zs = lv && s.zones ? s.zones.map(function (z) { return [z.id, z.label]; }) : [];
    $('stZoneFld').style.display = zs.length && st.mode !== 'find' ? '' : 'none';
    if (zs.length) setPanel($('stZone'), zs, zs[0][0]);
    $('stRevCatFld').style.display = lv && st.mode === 'rev' ? '' : 'none';
    if (lv) setPanel($('stRevCat'), catOpts(), 'general');
    $('stRateFld').style.display = s ? 'none' : '';
    $('stOwnFld').style.display = s ? '' : 'none';
    $('stOther').style.display = lv ? '' : 'none';
    $('stShipTaxFld').style.display = (!lv || (s && s.shipOpt)) && st.mode === 'add' ? '' : 'none';
    $('stShipTaxFld').querySelector('span').textContent = lv && s.shipOpt ? s.shipOptLabel : 'My state charges sales tax on shipping';
    $('stShipTaxed').checked = false;
    st.place = null; $('stPlace').value = ''; closePlaceList();
    $('stPlaceFld').style.display = placed() && st.mode !== 'find' ? '' : 'none';
    if (placed()) { $('stPlace').placeholder = s.places.ph || 'Type your city or county'; placeNote(); loadPlaces(); }
    $('stShipNote').textContent = lv && s.shipNote ? s.shipNote : '';
    $('stShipNote').style.display = lv && s.shipNote ? '' : 'none';
    if (lv) {
      $('stOtherList').innerHTML = s.others.map(function (x) { return '<li><b>' + esc(x.t) + '.</b> ' + esc(x.d) + '</li>'; }).join('');
      $('stOtherH').textContent = 'Other taxes and fees in ' + s.name;
    }
  }
  function showMode() {
    var m = st.mode, s = S();
    $('stAddBox').style.display = m === 'add' ? '' : 'none';
    $('stRevBox').style.display = m === 'rev' ? '' : 'none';
    $('stFindBox').style.display = m === 'find' ? '' : 'none';
    $('stZoneFld').style.display = live() && S().zones && m !== 'find' ? '' : 'none';
    $('stRevCatFld').style.display = live() && m === 'rev' ? '' : 'none';
    $('stPaidFld').style.display = m === 'add' ? '' : 'none';
    $('stShipTaxFld').style.display = (!live() || (s && s.shipOpt)) && m === 'add' ? '' : 'none';
    $('stPlaceFld').style.display = placed() && m !== 'find' ? '' : 'none';
    $('stOwnFld').style.display = s && m !== 'find' ? '' : 'none';
    $('stRateFld').style.display = !s && m !== 'find' ? '' : 'none';
    var hasAdv = m === 'add' || (m === 'rev' && !!s);
    $('stAdvBtn').parentNode.style.display = hasAdv ? '' : 'none';
    $('stAdvIn').style.display = hasAdv && st.adv ? '' : 'none';
    $('stEx').textContent = m === 'find' ? 'See an example: $100 before tax, $108.25 after' : (m === 'rev' ? 'See an example: a $106.63 total with tax included' : 'See an example: a $100 purchase');
  }

  /* ---- results ---- */
  function table(head, rows) {
    return '<thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr' + (r[3] ? ' class="cur"' : '') + '><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody>';
  }
  function bar(segs) {
    var tot = segs.reduce(function (a, s) { return a + s[1]; }, 0); if (!(tot > 0)) return ['', ''];
    var k = segs.filter(function (s) { return s[1] > 0.0049; });
    return ['<div class="ln-bar">' + k.map(function (s) { return '<span class="ln-seg ' + s[0] + '" style="width:' + (s[1] / tot * 100) + '%"></span>'; }).join('') + '</div>', k.map(function (s) { return '<span><i class="ln-dotc ' + s[0] + '"></i>' + s[2] + ' ' + mon(s[1]) + '</span>'; }).join('')];
  }
  function neighbours(base) {
    var s = S(); if (!live() || !s.nearby) return '';
    var rows = [[s.name, mon(E.r2(base * (1 + s.base / 100))), pct(s.base) + ', no local tax']].concat(s.nearby.map(function (c) {
      var o = E.STATES[c], r = E.range(c, base);
      return [o.name, o.maxLocal ? mon(r.lo) + ' – ' + mon(r.hi) : mon(r.lo), pct(o.base) + (o.maxLocal ? ' plus up to ' + pct(o.maxLocal) + ' local' : (o.base ? ', no local tax' : ', no sales tax'))];
    }));
    return '<div class="fc-grp">The same purchase next door</div><table class="dtable ln-terms st-near">' + table(['State', 'Total', 'Rate'], rows) + '</table><p class="res-tip">Price only (no shipping), general goods, state rate and the highest local add-on. Source: Tax Foundation, rates as of July 1, 2026.</p>';
  }
  function empty(lab, msg, hint) {
    $('stResLab').textContent = lab; $('stBig').textContent = '—'; $('stSub').textContent = msg; $('stMVal').textContent = '—';
    $('stResults').style.display = 'none'; last = null; setHint(hint || '');
  }
  function getOwn(hints) {
    var s = S(), id = s ? 'stOwn' : 'stRate', raw = $(id).value.trim();
    if (!raw) return null;
    var n = num(raw);
    if (!isFinite(n) || n < 0 || n > 30) { hints.push('Sales tax rate must be a number from 0 to 30, like 6.625.'); return null; }
    return n;
  }
  function rangeLine(s, base, own, plus) {
    if (own != null || !s || s.live) return '';
    var r = E.range(s.code, base); r.lo = E.r2(r.lo + plus); r.hi = E.r2(r.hi + plus);
    if (r.none) return s.name + (s.base ? ' has no local sales tax, so the state rate of ' + pct(s.base) + ' is the full rate.' : ' has no state sales tax and no local sales tax.');
    return 'This is the ' + s.name + ' state rate (' + pct(s.base) + ') only. Cities and counties may add up to ' + pct(s.maxLocal) + ' more, which would make the total between ' + mon(r.lo) + ' and ' + mon(r.hi) + '. Enter your exact combined rate under Go advanced to get one number.';
  }
  /* a state whose rate depends on the place, with no place picked yet: show the official range instead of a guess */
  function needPlace(items, ship, shipChk, hints) {
    var s = S(), P = s.places, loT = 0, hiT = 0, sum = 0, taxable = 0;
    items.forEach(function (it) { var c = E.cat(s, it.cat); sum += it.amt; if (c && !c.taxable) return; taxable += it.amt; var f = c && c.rate === 'food'; loT += it.amt * (f ? P.foodLo : P.lo) / 100; hiT += it.amt * (f ? P.foodHi : P.hi) / 100; });
    var shT = shipChk && taxable > 0 ? ship : 0, lo = E.r2(sum + ship + loT + shT * P.lo / 100), hi = E.r2(sum + ship + hiT + shT * P.hi / 100);
    $('stResLab').textContent = 'Total with tax'; $('stBig').textContent = '—'; $('stMVal').textContent = placeState === 'err' ? '—' : 'Pick your place';
    $('stSub').textContent = placeState === 'err' ? 'The rate table could not be loaded — enter your combined rate under Go advanced.' : (taxable > 0 ? 'Pick your place above for the exact total. It runs from ' + mon(lo) + ' to ' + mon(hi) + ' depending on where you are in ' + s.name + '.' : 'No sales tax on this purchase');
    $('stResults').style.display = 'none'; last = null; setHint(hints[0] || '');
  }
  function renderAdd(hints) {
    var s = S(), own = getOwn(hints), items = [], bad = false;
    st.rows.forEach(function (r) {
      var raw = String(r.amt).trim(); if (!raw) return;
      var n = num(raw);
      if (!isFinite(n) || n < 0 || n > MAX) { bad = true; return; }
      items.push({ amt: n, cat: r.cat });
    });
    if (bad) hints.push('Item price must be a number like 49.99 — only dollars and cents.');
    var shipRaw = $('stShip').value.trim(), ship = 0;
    if (shipRaw) { var sn = num(shipRaw); if (!isFinite(sn) || sn < 0 || sn > MAX) hints.push('Shipping must be a number like 7.50.'); else ship = sn; }
    var paid = null, pr = $('stPaid').value.trim();
    if (pr) { var pn = num(pr); if (!isFinite(pn) || pn < 0 || pn > 30) hints.push('Tax already charged must be a rate from 0 to 30, like 4.'); else paid = pn; }
    if (!items.length) { empty('Total', 'Enter an item price to see the tax.', hints[0]); return; }
    if (!s && own == null) { empty('Total', 'Enter the sales tax rate for your area.', hints[0]); return; }
    var zone = live() && $('stZoneFld').style.display !== 'none' ? $('stZone').value : null;
    var shipChk = (!live() || (s && s.shipOpt)) && $('stShipTaxed').checked;
    var shipApplies = live() && !s.shipOpt ? true : shipChk;
    if (placed() && own == null && !st.place) { needPlace(items, ship, shipChk, hints); return; }
    var pl = placed() && own == null ? st.place : null;
    var r = E.add({ state: code() || null, items: items, ship: ship, zone: zone, own: own, paid: paid, shipTaxed: shipChk, place: pl });
    var rate = r.rate != null ? pct(r.rate) : 'mixed rates';
    $('stResLab').textContent = 'Total with tax'; $('stBig').textContent = mon(r.total);
    $('stSub').textContent = r.tax > 0 ? mon(r.tax) + ' of sales tax' + (r.rate != null ? ' at ' + rate : '') : 'No sales tax on this purchase';
    $('stMLab').textContent = 'Total with tax'; $('stMVal').textContent = mon(r.total);
    var rows = r.lines.map(function (l, i) {
      var nm = (items.length > 1 ? 'Item ' + (i + 1) : 'Item') + (l.catObj && live() ? ' · ' + esc(l.catObj.label) : '');
      return [nm, mon(l.amt), l.taxable ? mon(l.tax) + ' <small>' + pct(l.rate) + '</small>' : 'exempt'];
    });
    if (r.ship > 0) rows.push(['Shipping', mon(r.ship), r.shipTax > 0 ? mon(r.shipTax) : (r.lines.some(function (l) { return l.taxable; }) && shipApplies ? '$0.00' : 'not taxed')]);
    rows.push(['Total', mon(r.total), mon(r.tax) + ' tax', true]);
    $('stTable').innerHTML = table(['', 'Price', 'Tax'], rows);
    var b = bar([['ln-p', r.subtotal, 'Items'], ['ln-s', r.ship, 'Shipping'], ['ln-i', r.tax, 'Sales tax']]);
    $('stBar').innerHTML = b[0]; $('stBarLeg').innerHTML = b[1];
    var tip = '';
    if (!s) tip = 'Using your sales tax rate of ' + pct(own) + '.';
    else if (own != null) tip = 'Using your own rate of ' + pct(own) + ' on the taxable items.';
    else if (s.live && s.places) {
      var exm2 = r.lines.filter(function (l) { return !l.taxable; });
      tip = 'Rate for ' + pl.label + ': ' + pct(pl.sales) + (s.places.noFood ? ' on taxable items.' : ' on most goods and restaurant food, ' + pct(pl.food) + ' on groceries.');
      if (exm2.length) tip += ' ' + exm2.map(function (l) { return l.catObj.label + ': ' + l.catObj.note; }).filter(function (v, k, a) { return a.indexOf(v) === k; }).join(' ');
      if (r.ship > 0) tip += shipChk ? ' Shipping is taxed because it is billed with handling as one charge.' : ' Shipping is not taxed because it is listed separately.';
    } else if (s.live) {
      var exm = r.lines.filter(function (l) { return !l.taxable; });
      tip = (r.rate === s.base && !r.mixed ? s.name + ' has one statewide rate of ' + pct(s.base) + ' and no city or county sales tax, so this total is exact.' : (r.rate != null && r.rate !== s.base ? 'Rate used: ' + pct(r.rate) + ' (' + E.zone(s, $('stZone').value).label + ').' : (r.mixed ? 'Different items have different rates.' : '')));
      if (exm.length) tip += ' ' + exm.map(function (l) { return l.catObj.label + ': ' + l.catObj.note; }).filter(function (v, k, a) { return a.indexOf(v) === k; }).join(' ');
      if (r.ignored.length) tip += ' ' + r.ignored.join(' ');
    } else tip = rangeLine(s, r.subtotal + (shipChk ? r.ship : 0), own, shipChk ? 0 : r.ship);
    $('stTip').textContent = tip.trim(); $('stTip').style.display = tip.trim() ? '' : 'none';
    var extra = '';
    if (r.owed != null && (s || own != null)) extra = '<div class="fc-grp">Bought out of state or online?</div><p class="res-tip">The seller charged ' + pct(r.paid) + '. ' + (!r.lines.some(function (l) { return l.taxable; }) ? 'These items are exempt, so no use tax is owed.' : r.owed > 0 ? 'You still owe about <b>' + mon(r.owed) + '</b> in use tax' + (s ? ' to ' + s.name : '') + ' to make up the difference.' : 'That already covers the tax rate here, so no use tax is owed.') + '</p>';
    var plain = s && s.live && !s.places && own == null && r.lines.every(function (l) { return l.cat === 'general' && l.rate === s.base; });
    $('stExtra').innerHTML = extra + (plain ? neighbours(r.subtotal) : '');
    $('stResults').style.display = '';
    $('stCopyWrap').style.display = '';
    last = { mode: 'add', r: r, s: s, rate: rate, place: pl && pl.label };
    setHint(hints[0] || '');
  }
  function renderRev(hints) {
    var s = S(), own = getOwn(hints), raw = $('stTotal').value.trim();
    if (!raw) { empty('Price before tax', 'Enter the total you paid, tax included.', hints[0]); return; }
    var n = num(raw);
    if (!isFinite(n) || n < 0 || n > MAX) { empty('Price before tax', 'Enter the total you paid, tax included.', 'Total must be a number like 106.63 — only dollars and cents.'); return; }
    if (!s && own == null) { empty('Price before tax', 'Enter the sales tax rate for your area.', hints[0]); return; }
    var zone = live() && $('stZoneFld').style.display !== 'none' ? $('stZone').value : null;
    if (placed() && own == null && !st.place) {
      var rc = E.cat(s, $('stRevCat').value), P = s.places, f = rc && rc.rate === 'food';
      var a = E.r2(n / (1 + (f ? P.foodHi : P.hi) / 100)), b = E.r2(n / (1 + (f ? P.foodLo : P.lo) / 100));
      empty('Price before tax', placeState === 'err' ? 'The rate table could not be loaded — enter your combined rate under Go advanced.' : (rc && !rc.taxable ? 'No sales tax is included — this kind of item is exempt.' : 'Pick your place above for the exact price. Before tax it is between ' + mon(a) + ' and ' + mon(b) + ' depending on where you are in ' + s.name + '.'), hints[0]); if (placeState !== 'err') $('stMVal').textContent = 'Pick your place'; return;
    }
    var pl = placed() && own == null ? st.place : null;
    var r = E.reverse({ state: code() || null, total: n, cat: live() ? $('stRevCat').value : 'general', zone: zone, own: own, place: pl });
    $('stResLab').textContent = 'Price before tax'; $('stBig').textContent = mon(r.pre);
    $('stSub').textContent = r.tax > 0 ? 'Includes ' + mon(r.tax) + ' of sales tax at ' + pct(r.rate) : (r.taxable ? 'No tax is included at a 0% rate' : 'No sales tax is included — this kind of item is exempt');
    $('stMLab').textContent = 'Price before tax'; $('stMVal').textContent = mon(r.pre);
    $('stTable').innerHTML = table(['', 'Amount', ''], [['Price before tax', mon(r.pre), ''], ['Sales tax ' + pct(r.rate), mon(r.tax), ''], ['Total paid', mon(r.total), '', true]]);
    var b = bar([['ln-p', r.pre, 'Price'], ['ln-i', r.tax, 'Sales tax']]); $('stBar').innerHTML = b[0]; $('stBarLeg').innerHTML = b[1];
    var tip = '';
    if (!s) tip = 'Using your sales tax rate of ' + pct(own) + '.';
    else if (own != null) tip = 'Using your own rate of ' + pct(own) + ' on this item.';
    else if (s.live) { tip = r.taxable ? (r.rate === s.base ? s.name + ' has one statewide rate of ' + pct(s.base) + ' and no city or county sales tax, so this is exact.' : 'Rate used: ' + pct(r.rate) + (pl ? ' for ' + pl.label : '') + '.') : r.catObj.note; if (r.ignored) tip += ' ' + r.ignored; }
    else if (own == null && s.maxLocal > 0) { var lowPre = E.r2(n / (1 + (s.base + s.maxLocal) / 100)); tip = 'This uses the ' + s.name + ' state rate (' + pct(s.base) + ') only. If your city or county adds up to ' + pct(s.maxLocal) + ', the price before tax would be between ' + mon(lowPre) + ' and ' + mon(r.pre) + '. Enter your exact combined rate under Go advanced to get one number.'; }
    else tip = rangeLine(s, r.pre, own, 0);
    $('stTip').textContent = tip.trim(); $('stTip').style.display = tip.trim() ? '' : 'none';
    $('stExtra').innerHTML = '';
    $('stResults').style.display = ''; $('stCopyWrap').style.display = '';
    last = { mode: 'rev', r: r, s: s, place: pl && pl.label };
    setHint(hints[0] || '');
  }
  function renderFind(hints) {
    var s = S(), b = $('stBefore').value.trim(), a = $('stAfter').value.trim();
    if (!b || !a) { empty('Sales tax rate', 'Enter the price before tax and the price after tax.', ''); return; }
    var nb = num(b), na = num(a);
    if (!isFinite(nb) || nb <= 0 || nb > MAX) { empty('Sales tax rate', 'Enter the price before tax and the price after tax.', 'Price before tax must be a number above 0, like 100.'); return; }
    if (!isFinite(na) || na < 0 || na > MAX) { empty('Sales tax rate', 'Enter the price before tax and the price after tax.', 'Price after tax must be a number like 108.25.'); return; }
    if (na < nb) { empty('Sales tax rate', 'The price after tax can’t be lower than the price before tax.', 'Price after tax must be at least the price before tax.'); return; }
    var rate = E.findRate(nb, na), tax = E.r2(na - nb);
    $('stResLab').textContent = 'Sales tax rate'; $('stBig').textContent = pct(rate);
    $('stSub').textContent = mon(tax) + ' of tax on ' + mon(nb);
    $('stMLab').textContent = 'Sales tax rate'; $('stMVal').textContent = pct(rate);
    $('stTable').innerHTML = table(['', 'Amount', ''], [['Price before tax', mon(nb), ''], ['Sales tax', mon(tax), pct(rate)], ['Price after tax', mon(na), '', true]]);
    var bb = bar([['ln-p', nb, 'Price'], ['ln-i', tax, 'Sales tax']]); $('stBar').innerHTML = bb[0]; $('stBarLeg').innerHTML = bb[1];
    var tip = 'Prices rounded to the cent can move the rate by a few thousandths of a percent.';
    if (s && s.live && s.places) tip = rate < s.places.lo - 0.02 ? 'That is lower than any combined ' + s.name + ' rate (the lowest is ' + pct(s.places.lo) + '), so some of the tax may be missing from the price. ' + tip : (rate > s.places.hi + 0.02 ? 'That is higher than any combined ' + s.name + ' rate (the highest is ' + pct(s.places.hi) + '), so it may include other charges. ' + tip : 'Combined ' + s.name + ' rates run from ' + pct(s.places.lo) + ' to ' + pct(s.places.hi) + ' (' + pct(s.base) + ' state plus local tax). ' + tip);
    else if (s && s.live) tip = Math.abs(rate - s.base) < 0.02 ? 'That matches ' + s.name + '’s statewide rate of ' + pct(s.base) + '. ' + tip : s.name + '’s statewide rate is ' + pct(s.base) + ' — this rate is ' + (rate > s.base ? 'higher' : 'lower') + ', so a different rate, a zone rate or a fee may be involved. ' + tip;
    else if (s) tip = Math.abs(rate - s.base) < 0.02 ? 'That matches ' + s.name + '’s state rate of ' + pct(s.base) + '. ' + tip : s.name + '’s state rate is ' + pct(s.base) + (s.maxLocal ? ', and cities and counties may add up to ' + pct(s.maxLocal) + '.' : '.') + ' ' + tip;
    $('stTip').textContent = tip; $('stTip').style.display = '';
    $('stExtra').innerHTML = '';
    $('stResults').style.display = ''; $('stCopyWrap').style.display = '';
    last = { mode: 'find', rate: rate, tax: tax, nb: nb, na: na, s: s };
    setHint('');
  }
  function render() {
    var hints = [];
    var typed = st.mode === 'add' ? (st.rows.some(function (r) { return String(r.amt).trim() !== ''; }) || $('stShip').value.trim() !== '') : (st.mode === 'rev' ? $('stTotal').value.trim() !== '' : ($('stBefore').value.trim() !== '' || $('stAfter').value.trim() !== ''));
    $('stEx').parentNode.style.display = typed ? 'none' : '';
    if (st.mode === 'add') renderAdd(hints); else if (st.mode === 'rev') renderRev(hints); else renderFind(hints);
  }

  /* ---- events ---- */
  $('stItems').addEventListener('input', function (e) { var t = e.target; if (t.classList.contains('st-amt')) { st.rows[+t.getAttribute('data-i')].amt = t.value; render(); } });
  $('stItems').addEventListener('change', function (e) { var t = e.target; if (t.classList && t.classList.contains('st-cat')) { st.rows[+t.getAttribute('data-i')].cat = t.value; render(); } });
  $('stItems').addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.st-rm'); if (!b) return; st.rows.splice(+b.getAttribute('data-i'), 1); if (!st.rows.length) st.rows.push({ amt: '', cat: 'general' }); buildRows(); render(); });
  $('stAddItem').addEventListener('click', function () { if (st.rows.length >= 30) return; st.rows.push({ amt: '', cat: 'general' }); buildRows(); var i = $('stAmt' + (st.rows.length - 1)); if (i) i.focus(); render(); });
  ['stShip', 'stTotal', 'stBefore', 'stAfter', 'stRate', 'stOwn', 'stPaid'].forEach(function (id) { $(id).addEventListener('input', render); });
  ['stZone', 'stRevCat'].forEach(function (id) { $(id).addEventListener('change', render); });
  $('stShipTaxed').addEventListener('change', render);
  var pi = $('stPlace');
  pi.addEventListener('input', function () { st.place = null; pi.title = ''; placeNote(); showPlaceList(); render(); });
  pi.addEventListener('focus', function () { loadPlaces(); if (st.place) { pi.select(); showPlaceList(true); } else showPlaceList(); });
  pi.addEventListener('blur', function () { setTimeout(closePlaceList, 150); });
  pi.addEventListener('keydown', function (e) {
    var opts = $('stPlaceList').querySelectorAll('.st-ta-opt'); if (!opts.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); placeAct = e.key === 'ArrowDown' ? Math.min(opts.length - 1, placeAct + 1) : Math.max(0, placeAct - 1); [].forEach.call(opts, function (o, i) { o.classList.toggle('on', i === placeAct); }); opts[placeAct].scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); pickPlace(placeHits[placeAct >= 0 ? placeAct : 0]); }
    else if (e.key === 'Escape') closePlaceList();
  });
  $('stPlaceList').addEventListener('scroll', moreOpts);
  $('stPlaceList').addEventListener('mousedown', function (e) { e.preventDefault(); var b = e.target.closest('.st-ta-opt'); if (!b) return; pickPlace(placeHits[+b.getAttribute('data-i')]); });
  $('stModeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; st.mode = b.getAttribute('data-v'); setSeg('stModeSeg', st.mode); showMode(); render();
  });
  /* state dropdown = navigation: a state with its own page opens it, carrying the form over */
  var FORM = ['stShip', 'stTotal', 'stBefore', 'stAfter', 'stRate'];
  function saveForm() {
    try { sessionStorage.setItem('stForm', JSON.stringify({ t: Date.now(), mode: st.mode, rows: st.rows.map(function (r) { return { amt: r.amt, cat: 'general' }; }), f: FORM.reduce(function (o, id) { o[id] = $(id).value; return o; }, {}), state: code() })); } catch (e) {}
  }
  function restoreForm() {
    try {
      var raw = sessionStorage.getItem('stForm'); if (!raw) return; sessionStorage.removeItem('stForm');
      var o = JSON.parse(raw); if (!o || Date.now() - o.t > 15000) return;
      if (o.mode && o.mode !== st.mode) { st.mode = o.mode; setSeg('stModeSeg', st.mode); }
      if (o.rows && o.rows.length) st.rows = o.rows.slice(0, 30);
      for (var id in o.f) if ($(id) && o.f[id]) $(id).value = o.f[id];
    } catch (e) {}
  }
  $('stState').addEventListener('change', function () {
    var c = code(), s = c ? E.STATES[c] : null;
    var target = s && s.live ? '/sales-tax-calculator/' + s.slug + '/' : '/sales-tax-calculator/';
    if (location.pathname !== target && !window.__stNoNav) { saveForm(); try { sessionStorage.setItem('stState', c); } catch (e) {} location.href = target; return; }
    $('stOwn').value = ''; $('stPaid').value = ''; $('stRate').value = '';
    syncState(); showMode(); render();
  });
  $('stEx').addEventListener('click', function () {
    var s = S(), rate = s ? s.base : 8.25;
    if (st.mode === 'find') { $('stBefore').value = '100'; $('stAfter').value = String(E.r2(100 * (1 + rate / 100))); }
    else if (st.mode === 'rev') { $('stTotal').value = String(E.r2(100 * (1 + rate / 100))); }
    else { st.rows = [{ amt: '100', cat: 'general' }]; buildRows(); $('stShip').value = ''; }
    if (!s) { $('stRate').value = '8.25'; }
    render();
  });
  $('stAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv;
    $('stAdvBtn').classList.toggle('open', st.adv);
    $('stAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    if (!st.adv) { $('stOwn').value = ''; $('stPaid').value = ''; }
    showMode(); render();
  });
  $('stCopy').addEventListener('click', function () {
    if (!last) return; var lines = [], s = last.s;
    if (last.mode === 'add') {
      var r = last.r; lines.push('Price: ' + mon(r.subtotal)); if (r.ship > 0) lines.push('Shipping: ' + mon(r.ship));
      lines.push('Sales tax' + (r.rate != null ? ' (' + pct(r.rate) + ')' : '') + ': ' + mon(r.tax)); lines.push('Total: ' + mon(r.total));
    } else if (last.mode === 'rev') { var q = last.r; lines.push('Total paid: ' + mon(q.total)); lines.push('Sales tax (' + pct(q.rate) + '): ' + mon(q.tax)); lines.push('Price before tax: ' + mon(q.pre)); }
    else { lines.push('Price before tax: ' + mon(last.nb)); lines.push('Price after tax: ' + mon(last.na)); lines.push('Sales tax rate: ' + pct(last.rate)); }
    if (last.place) lines.unshift('Place: ' + last.place);
    if (s) lines.unshift(s.name + ' sales tax');
    var btn = $('stCopy'), txt = lines.join('\n');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy results'; }, 1600); };
    var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok); } catch (e) { done(false); } };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, legacy); } catch (e) { legacy(); }
  });

  /* ---- init ---- */
  var names = Object.keys(E.STATES).sort(function (a, b) { return E.STATES[a].name < E.STATES[b].name ? -1 : 1; });
  var opts = [['', 'Any state — enter my own rate']].concat(names.filter(function (c) { return E.STATES[c].live; }).map(function (c) { return [c, E.STATES[c].name]; }));
  var pre = document.body.getAttribute('data-state'), carried = '';
  try { carried = sessionStorage.getItem('stState') || ''; sessionStorage.removeItem('stState'); } catch (e) {}
  var startState = pre && E.STATES[pre] ? pre : (carried && E.STATES[carried] && !E.STATES[carried].live ? carried : '');
  setPanel($('stState'), opts, startState);
  restoreForm();
  syncState(); showMode();
  render();
};

/* =========================================================
   UNIT CONVERTER — one engine for every converter page (hub + length, weight, volume, temperature, area, speed,
   data storage, cooking, px/rem). Pure (no DOM). Every factor is an exact international definition
   (BIPM SI brochure, NIST Handbook 44 / Special Publication 811, IEC 80000-13 for data units).
   CalcThis.unitEngine  ·  CalcThis.initUnitConverter (ids un*)
   ========================================================= */
/* UNIT-ENGINE:START */
CalcThis.unitEngine = (function () {
  function U(id, name, sym, f, grp) { return { id: id, name: name, sym: sym, f: f, grp: grp || '' }; }
  var CATS = {};
  CATS.length = { slug: 'length-converter', name: 'Length', units: [
    U('mm', 'Millimeters', 'mm', 0.001, 'Metric'), U('cm', 'Centimeters', 'cm', 0.01, 'Metric'), U('m', 'Meters', 'm', 1, 'Metric'), U('km', 'Kilometers', 'km', 1000, 'Metric'),
    U('um', 'Micrometers', 'µm', 1e-6, 'Metric'), U('nm', 'Nanometers', 'nm', 1e-9, 'Metric'),
    U('in', 'Inches', 'in', 0.0254, 'US / imperial'), U('ft', 'Feet', 'ft', 0.3048, 'US / imperial'), U('yd', 'Yards', 'yd', 0.9144, 'US / imperial'), U('mi', 'Miles', 'mi', 1609.344, 'US / imperial'),
    U('nmi', 'Nautical miles', 'nmi', 1852, 'Other'), U('ly', 'Light-years', 'ly', 9460730472580800, 'Other')
  ], neg: true, from: 'in', to: 'cm', ex: 12 };
  CATS.weight = { slug: 'weight-converter', name: 'Weight', units: [
    U('mg', 'Milligrams', 'mg', 1e-6, 'Metric'), U('g', 'Grams', 'g', 1e-3, 'Metric'), U('kg', 'Kilograms', 'kg', 1, 'Metric'), U('t', 'Metric tons (tonnes)', 't', 1000, 'Metric'), U('ug', 'Micrograms', 'µg', 1e-9, 'Metric'),
    U('oz', 'Ounces', 'oz', 0.028349523125, 'US / imperial'), U('lb', 'Pounds', 'lb', 0.45359237, 'US / imperial'), U('st', 'Stone', 'st', 6.35029318, 'US / imperial'),
    U('ston', 'US tons (short tons)', 'US ton', 907.18474, 'US / imperial'), U('lton', 'Imperial tons (long tons)', 'long ton', 1016.0469088, 'US / imperial')
  ], neg: false, from: 'lb', to: 'kg', ex: 150 };
  CATS.volume = { slug: 'volume-converter', name: 'Volume', units: [
    U('ml', 'Milliliters', 'mL', 0.001, 'Metric'), U('l', 'Liters', 'L', 1, 'Metric'), U('m3', 'Cubic meters', 'm³', 1000, 'Metric'),
    U('tsp', 'Teaspoons (US)', 'tsp', 0.00492892159375, 'US'), U('tbsp', 'Tablespoons (US)', 'tbsp', 0.01478676478125, 'US'), U('floz', 'Fluid ounces (US)', 'fl oz', 0.0295735295625, 'US'),
    U('cup', 'Cups (US)', 'cup', 0.2365882365, 'US'), U('pt', 'Pints (US)', 'pt', 0.473176473, 'US'), U('qt', 'Quarts (US)', 'qt', 0.946352946, 'US'), U('gal', 'Gallons (US)', 'gal', 3.785411784, 'US'),
    U('ukfloz', 'Fluid ounces (imperial)', 'imp fl oz', 0.0284130625, 'Imperial'), U('ukpt', 'Pints (imperial)', 'imp pt', 0.56826125, 'Imperial'), U('ukqt', 'Quarts (imperial)', 'imp qt', 1.1365225, 'Imperial'), U('ukgal', 'Gallons (imperial)', 'imp gal', 4.54609, 'Imperial'),
    U('in3', 'Cubic inches', 'in³', 0.016387064, 'Other'), U('ft3', 'Cubic feet', 'ft³', 28.316846592, 'Other')
  ], neg: false, from: 'gal', to: 'l', ex: 1 };
  CATS.area = { slug: 'area-converter', name: 'Area', units: [
    U('mm2', 'Square millimeters', 'mm²', 1e-6, 'Metric'), U('cm2', 'Square centimeters', 'cm²', 1e-4, 'Metric'), U('m2', 'Square meters', 'm²', 1, 'Metric'), U('ha', 'Hectares', 'ha', 10000, 'Metric'), U('km2', 'Square kilometers', 'km²', 1e6, 'Metric'),
    U('in2', 'Square inches', 'in²', 0.00064516, 'US / imperial'), U('ft2', 'Square feet', 'ft²', 0.09290304, 'US / imperial'), U('yd2', 'Square yards', 'yd²', 0.83612736, 'US / imperial'), U('ac', 'Acres', 'ac', 4046.8564224, 'US / imperial'), U('mi2', 'Square miles', 'mi²', 2589988.110336, 'US / imperial')
  ], neg: false, from: 'ft2', to: 'm2', ex: 1000 };
  CATS.speed = { slug: 'speed-converter', name: 'Speed', units: [
    U('ms', 'Meters per second', 'm/s', 1), U('kmh', 'Kilometers per hour', 'km/h', 1 / 3.6), U('mph', 'Miles per hour', 'mph', 0.44704), U('kn', 'Knots', 'kn', 1852 / 3600), U('fts', 'Feet per second', 'ft/s', 0.3048), U('cms', 'Centimeters per second', 'cm/s', 0.01)
  ], neg: true, from: 'mph', to: 'kmh', ex: 60 };
  CATS.data = { slug: 'data-storage-converter', name: 'Data storage', units: [
    U('b', 'Bits', 'bit', 1, 'Basic'), U('B', 'Bytes', 'B', 8, 'Basic'),
    U('kB', 'Kilobytes (1,000 bytes)', 'KB', 8e3, 'Decimal (SI)'), U('MB', 'Megabytes', 'MB', 8e6, 'Decimal (SI)'), U('GB', 'Gigabytes', 'GB', 8e9, 'Decimal (SI)'), U('TB', 'Terabytes', 'TB', 8e12, 'Decimal (SI)'), U('PB', 'Petabytes', 'PB', 8e15, 'Decimal (SI)'),
    U('KiB', 'Kibibytes (1,024 bytes)', 'KiB', 8192, 'Binary (IEC)'), U('MiB', 'Mebibytes', 'MiB', 8388608, 'Binary (IEC)'), U('GiB', 'Gibibytes', 'GiB', 8589934592, 'Binary (IEC)'), U('TiB', 'Tebibytes', 'TiB', 8796093022208, 'Binary (IEC)'), U('PiB', 'Pebibytes', 'PiB', 9007199254740992, 'Binary (IEC)'),
    U('kb', 'Kilobits', 'Kb', 1e3, 'Bits'), U('Mb', 'Megabits', 'Mb', 1e6, 'Bits'), U('Gb', 'Gigabits', 'Gb', 1e9, 'Bits'), U('Tb', 'Terabits', 'Tb', 1e12, 'Bits')
  ], neg: false, from: 'GB', to: 'MB', ex: 1 };
  /* temperature: each unit has to(x) -> degrees Celsius and from(c) */
  CATS.temperature = { slug: 'temperature-converter', name: 'Temperature', units: [
    { id: 'c', name: 'Celsius', sym: '°C', to: function (x) { return x; }, fr: function (c) { return c; } },
    { id: 'f', name: 'Fahrenheit', sym: '°F', to: function (x) { return (x - 32) * 5 / 9; }, fr: function (c) { return c * 9 / 5 + 32; } },
    { id: 'k', name: 'Kelvin', sym: 'K', to: function (x) { return x - 273.15; }, fr: function (c) { return c + 273.15; } },
    { id: 'r', name: 'Rankine', sym: '°R', to: function (x) { return (x - 491.67) * 5 / 9; }, fr: function (c) { return (c + 273.15) * 9 / 5; } }
  ], neg: true, from: 'f', to: 'c', ex: 98.6, temp: true };
  CATS.css = { slug: 'px-to-rem-converter', name: 'CSS units (px, rem, em)', units: [
    U('px', 'Pixels', 'px', 1), U('rem', 'rem (root font size)', 'rem', 1), U('em', 'em (parent font size)', 'em', 1), U('pct', 'Percent (of parent font size)', '%', 1),
    U('pt', 'Points', 'pt', 96 / 72), U('pc', 'Picas', 'pc', 16), U('in', 'Inches', 'in', 96), U('cm', 'Centimeters', 'cm', 96 / 2.54), U('mm', 'Millimeters', 'mm', 96 / 25.4),
    U('vw', 'Viewport width (vw)', 'vw', 1), U('vh', 'Viewport height (vh)', 'vh', 1)
  ], neg: false, from: 'px', to: 'rem', ex: 24, css: true };
  CATS.cooking = { slug: 'cooking-converter', name: 'Cooking', units: [
    U('tsp', 'Teaspoons', 'tsp', 0, 'Volume'), U('tbsp', 'Tablespoons', 'tbsp', 0, 'Volume'), U('floz', 'Fluid ounces', 'fl oz', 0, 'Volume'), U('cup', 'Cups', 'cup', 0, 'Volume'), U('ml', 'Milliliters', 'mL', 0, 'Volume'), U('l', 'Liters', 'L', 0, 'Volume'), U('stick', 'Sticks of butter', 'stick', 0, 'Volume'),
    U('g', 'Grams', 'g', 1, 'Weight'), U('kg', 'Kilograms', 'kg', 1000, 'Weight'), U('oz', 'Ounces', 'oz', 28.349523125, 'Weight'), U('lb', 'Pounds', 'lb', 453.59237, 'Weight')
  ], neg: false, from: 'cup', to: 'g', ex: 1, cook: true };
  var CAT_ORDER = ['length', 'weight', 'volume', 'temperature', 'area', 'speed', 'data', 'cooking', 'css'];

  function unit(cat, id) { var l = CATS[cat].units; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  /* ---------- cooking: cups <-> grams per ingredient, grams per US cup (typical values, about +-5%) ---------- */
  var US_CUP_ML = 236.5882365;
  var CUP_STD = { us: { tsp: 4.92892159375, tbsp: 14.78676478125, floz: 29.5735295625, cup: 236.5882365 }, uk: { tsp: 5, tbsp: 15, floz: 28.4130625, cup: 250 }, au: { tsp: 5, tbsp: 20, floz: 28.4130625, cup: 250 } };
  var ING = [
    ['flour', 'All-purpose flour', 120], ['breadflour', 'Bread flour', 120], ['cakeflour', 'Cake flour', 114], ['wwflour', 'Whole wheat flour', 113], ['almondflour', 'Almond flour', 96], ['ryeflour', 'Rye flour', 102],
    ['cornmeal', 'Cornmeal', 138], ['cornstarch', 'Cornstarch', 128], ['sugar', 'Granulated sugar', 200], ['brownsugar', 'Brown sugar (packed)', 213], ['powsugar', 'Powdered sugar', 120],
    ['butter', 'Butter', 226.8], ['shortening', 'Shortening or lard', 205], ['oil', 'Vegetable oil', 218], ['oliveoil', 'Olive oil', 216],
    ['honey', 'Honey', 340], ['maple', 'Maple syrup', 322], ['molasses', 'Molasses', 340], ['jam', 'Jam or jelly', 320],
    ['water', 'Water', 237], ['milk', 'Milk', 245], ['cream', 'Heavy cream', 238], ['yogurt', 'Yogurt', 245], ['sourcream', 'Sour cream', 240], ['creamcheese', 'Cream cheese', 232],
    ['peanutbutter', 'Peanut butter', 256], ['applesauce', 'Applesauce', 244], ['pumpkin', 'Pumpkin puree', 245], ['banana', 'Mashed banana', 225],
    ['oats', 'Rolled oats', 90], ['rice', 'Rice (uncooked)', 185], ['cookedrice', 'Rice (cooked)', 158], ['cocoa', 'Cocoa powder', 85], ['chips', 'Chocolate chips', 170],
    ['salt', 'Salt (table)', 288], ['bakingpowder', 'Baking powder', 192], ['bakingsoda', 'Baking soda', 220],
    ['walnuts', 'Walnuts or pecans', 113], ['almonds', 'Almonds', 142], ['raisins', 'Raisins', 149], ['coconut', 'Shredded coconut', 85],
    ['cheddar', 'Cheddar (shredded)', 113], ['parmesan', 'Parmesan (grated)', 100], ['breadcrumbs', 'Breadcrumbs', 108], ['panko', 'Panko', 60],
    ['vanilla', 'Vanilla extract', 208], ['lemonjuice', 'Lemon juice', 244], ['broth', 'Broth or stock', 240], ['vinegar', 'Vinegar', 239]
  ];
  function ingredient(id) { for (var i = 0; i < ING.length; i++) if (ING[i][0] === id) return { id: id, name: ING[i][1], gpc: ING[i][2], gpm: ING[i][2] / US_CUP_ML }; return null; }
  function cookMl(u, std) { if (u === 'ml') return 1; if (u === 'l') return 1000; if (u === 'stick') return 118.29411825; return (CUP_STD[std] || CUP_STD.us)[u]; }
  function cookKind(u) { return (u === 'g' || u === 'kg' || u === 'oz' || u === 'lb') ? 'w' : 'v'; }
  function cookConv(from, to, x, o) {
    var std = (o && o.std) || 'us', ing = o && o.ing ? ingredient(o.ing) : ingredient('flour');
    var kf = cookKind(from), kt = cookKind(to);
    if (kf === 'w' && kt === 'w') return x * unit('cooking', from).f / unit('cooking', to).f;
    if (kf === 'v' && kt === 'v') return x * cookMl(from, std) / cookMl(to, std);
    if (kf === 'v') { var g = x * cookMl(from, std) * ing.gpm; return g / unit('cooking', to).f; }
    var ml = x * unit('cooking', from).f / ing.gpm; return ml / cookMl(to, std);
  }

  /* ---------- oven temperatures ---------- */
  var GAS = [[0.25, '¼', 225], [0.5, '½', 250], [1, '1', 275], [2, '2', 300], [3, '3', 325], [4, '4', 350], [5, '5', 375], [6, '6', 400], [7, '7', 425], [8, '8', 450], [9, '9', 475]];
  var OVEN_UNITS = [{ id: 'c', name: 'Celsius', sym: '°C' }, { id: 'f', name: 'Fahrenheit', sym: '°F' }, { id: 'fan', name: 'Fan oven (Celsius)', sym: '°C fan' }, { id: 'gas', name: 'Gas mark', sym: 'gas mark' }];
  function gasF(x) { for (var i = 0; i < GAS.length; i++) if (Math.abs(GAS[i][0] - x) < 1e-9) return GAS[i][2]; return null; }
  function ovenAll(from, x) {
    var F;
    if (from === 'f') F = x; else if (from === 'c') F = x * 9 / 5 + 32; else if (from === 'fan') F = (x + 20) * 9 / 5 + 32; else { F = gasF(x); if (F == null) return null; }
    var C = (F - 32) * 5 / 9, gas = null, bd = 1e9;
    GAS.forEach(function (g) { var d = Math.abs(g[2] - F); if (d < bd) { bd = d; gas = g; } });
    return { F: F, C: C, fan: C - 20, gas: bd <= 13 ? gas : null, gasExact: from === 'gas' };
  }

  /* ---------- the conversion ---------- */
  /* o: css { root, parent, vw, vh }, cook { ing, std } */
  function cssPx(id, o) {
    var root = o.root, parent = o.parent == null ? root : o.parent;
    if (id === 'rem') return root; if (id === 'em') return parent; if (id === 'pct') return parent / 100; if (id === 'vw') return o.vw / 100; if (id === 'vh') return o.vh / 100;
    return unit('css', id).f;
  }
  function convert(cat, from, to, x, o) {
    var c = CATS[cat];
    if (c.temp) return unit(cat, to).fr(unit(cat, from).to(x));
    if (c.cook) return cookConv(from, to, x, o);
    if (c.css) return x * cssPx(from, o) / cssPx(to, o);
    return x * unit(cat, from).f / unit(cat, to).f;
  }
  function all(cat, from, x, o) { return CATS[cat].units.map(function (u) { return { u: u, v: convert(cat, from, u.id, x, o) }; }); }

  /* ---------- number formatting ---------- */
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '' };
  function commas(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function expo(x, n) {
    var p = x.toExponential(Math.max(0, n - 1)).split('e'), m = p[0], e = p[1];
    if (m.indexOf('.') >= 0) m = m.replace(/0+$/, '').replace(/\.$/, '');
    return m + ' × 10' + String(parseInt(e, 10)).split('').map(function (ch) { return SUP[ch]; }).join('');
  }
  /* prec: 'auto' | '2dp' | '4dp' | '6dp' | '4sig' | '10sig' */
  function fmt(x, prec) {
    if (!isFinite(x)) return '—';
    if (x === 0 || Math.abs(x) < 1e-300) return '0';
    var a = Math.abs(x), p = prec || 'auto', m = /^(\d+)(dp|sig)$/.exec(p), n = m ? +m[1] : 8, mode = m ? m[2] : 'sig', s;
    if (mode === 'dp' && a < 1e15) {
      s = x.toFixed(n);
      if (+s === 0) { mode = 'sig'; n = 4; }
      else { var t = s.split('.'); return (t[0].charAt(0) === '-' ? '−' : '') + commas(t[0].replace('-', '')) + (t[1] ? '.' + t[1] : ''); }
    }
    if (a >= 1e15 || a < 1e-6) return (x < 0 ? '−' : '') + expo(a, Math.min(n, 10));
    s = String(Number(a.toPrecision(Math.min(Math.max(n, 1), 15))));
    if (s.indexOf('e') >= 0) return (x < 0 ? '−' : '') + expo(a, Math.min(n, 10));
    var q = s.split('.');
    return (x < 0 ? '−' : '') + commas(q[0]) + (q[1] ? '.' + q[1] : '');
  }
  /* inches as a tape-measure fraction: nearest 1/16 */
  function tape(inches) {
    var neg = inches < 0, v = Math.abs(inches), sx = Math.round(v * 16), w = Math.floor(sx / 16), r = sx % 16, d = 16;
    while (r && r % 2 === 0) { r /= 2; d /= 2; }
    var txt = (neg ? '−' : '') + (w ? w : '') + (r ? (w ? ' ' : '') + r + '/' + d : (w ? '' : '0'));
    return { text: txt, exact: Math.abs(sx / 16 - v) < 1e-9 };
  }
  /* number parsing: 12.5, 1,234.5, 1/2, 1 1/2, 1e3, 1,5 */
  function parse(s) {
    s = String(s == null ? '' : s).replace(/[−–]/g, '-').trim();
    if (!s) return NaN;
    var m, neg = false;
    if (s.charAt(0) === '-') { neg = true; s = s.slice(1).trim(); } else if (s.charAt(0) === '+') s = s.slice(1).trim();
    var v;
    if ((m = /^(\d+)[\s-]+(\d+)\/(\d+)$/.exec(s))) v = +m[3] ? +m[1] + (+m[2]) / (+m[3]) : NaN;
    else if ((m = /^(\d+)\/(\d+)$/.exec(s))) v = +m[2] ? (+m[1]) / (+m[2]) : NaN;
    else if (/^\d+,\d{1,2}$/.test(s)) v = parseFloat(s.replace(',', '.'));
    else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) v = parseFloat(s.replace(/,/g, ''));
    else if (/^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) v = parseFloat(s);
    else v = NaN;
    return neg ? -v : v;
  }
  return { CATS: CATS, ORDER: CAT_ORDER, unit: unit, convert: convert, all: all, fmt: fmt, tape: tape, parse: parse, ING: ING, ingredient: ingredient, CUP_STD: CUP_STD, GAS: GAS, OVEN_UNITS: OVEN_UNITS, ovenAll: ovenAll, cssPx: cssPx, cookKind: cookKind, commas: commas };
})();
/* UNIT-ENGINE:END */

CalcThis.initUnitConverter = function () {
  var E = CalcThis.unitEngine, $ = function (id) { return document.getElementById(id); };
  var CAT = document.body.getAttribute('data-cat') || 'length', C = E.CATS[CAT];
  var st = { mode: 'conv', adv: false, prec: 'auto', std: 'us', ing: 'flour' }, last = null;
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function setHint(m) { var h = $('unHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  function setSeg(id, v) { [].forEach.call($(id).querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); }); }
  function fmt(x) { return E.fmt(x, st.prec); }
  function withSym(v, sym) { return v + (sym === '%' || sym.charAt(0) === '°' ? '' : ' ') + sym; }
  function pos(t) { var n = E.parse(t); return isFinite(n) && n > 0 && n <= 1e6 ? n : NaN; }
  var CHEV = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  function setPanel(root, opts, val) {
    var panel = root.querySelector('.csel-panel');
    panel.innerHTML = opts.map(function (o) { return '<button type="button" class="csel-opt' + (o[0] === val ? ' on' : '') + '" role="option" aria-selected="' + (o[0] === val) + '" data-value="' + esc(o[0]) + '">' + esc(o[1]) + '</button>'; }).join('');
    root.setAttribute('data-value', val);
    root.querySelector('.csel-val').textContent = (opts.filter(function (o) { return o[0] === val; })[0] || opts[0])[1];
    CalcThis.initCsel(root);
  }
  function unitOpts() {
    if (CAT === 'cooking' && st.mode === 'oven') return E.OVEN_UNITS.map(function (u) { return [u.id, u.sym + ' — ' + u.name]; });
    return C.units.map(function (u) { return [u.id, u.sym + ' — ' + u.name]; });
  }
  function defaults() {
    if (CAT === 'cooking' && st.mode === 'oven') return { from: 'f', to: 'c', ex: 350 };
    return { from: C.from, to: C.to, ex: C.ex };
  }
  function usym(id) { if (CAT === 'cooking' && st.mode === 'oven') return E.OVEN_UNITS.filter(function (u) { return u.id === id; })[0].sym; return E.unit(CAT, id).sym; }
  function setUnits(from, to) { var o = unitOpts(); setPanel($('unFrom'), o, from); setPanel($('unTo'), o, to); }
  function cssOpts() {
    var o = { root: pos($('unBase').value), parent: null, vw: pos($('unVw').value), vh: pos($('unVh').value) };
    var p = pos($('unParent').value); o.parent = isFinite(p) ? p : o.root; return o;
  }

  /* ---------- visuals ---------- */
  function ruler(cm) {
    var x0 = 10, ppc = 280 / 32, s = '<svg viewBox="0 0 300 116" role="img" aria-label="Ruler in centimeters and inches"><rect x="10" y="24" width="280" height="66" rx="4" fill="#F5EFE4" stroke="#D9C79F"/>';
    var i, x;
    for (i = 0; i <= 32; i++) { x = x0 + i * ppc; s += '<line x1="' + x + '" y1="24" x2="' + x + '" y2="' + (24 + (i % 5 === 0 ? 14 : 8)) + '" stroke="#37503F" stroke-width="1"/>'; if (i % 5 === 0 && i > 0) s += '<text x="' + x + '" y="54" font-size="14" text-anchor="middle" fill="#37503F">' + i + '</text>'; }
    for (i = 0; i <= 12; i++) { x = x0 + i * 2.54 * ppc; s += '<line x1="' + x + '" y1="90" x2="' + x + '" y2="' + (90 - 14) + '" stroke="#8F5C13" stroke-width="1"/>'; if (i % 2 === 0 && i > 0) s += '<text x="' + x + '" y="82" font-size="14" text-anchor="middle" fill="#8F5C13">' + i + '</text>'; }
    var mx = x0 + cm * ppc, lab = fmt(cm) + ' cm', lx = Math.min(Math.max(mx, 40), 260);
    s += '<line x1="' + mx + '" y1="14" x2="' + mx + '" y2="100" stroke="#B5761F" stroke-width="2.4"/><circle cx="' + mx + '" cy="14" r="4" fill="#B5761F"/><text x="' + lx + '" y="114" font-size="14" font-weight="700" text-anchor="middle" fill="#2a2118">' + lab + '</text></svg>';
    return s;
  }
  function thermo(c, label) {
    var lo = -50, hi = 250, W = 280, X = function (t) { return 10 + (Math.min(hi, Math.max(lo, t)) - lo) / (hi - lo) * W; };
    var s = '<svg viewBox="0 0 300 78" role="img" aria-label="Temperature scale from -50 to 250 degrees Celsius"><defs><linearGradient id="unGrad" x1="0" x2="1"><stop offset="0" stop-color="#6E97B0"/><stop offset=".3" stop-color="#E9DDC3"/><stop offset=".6" stop-color="#D9A24A"/><stop offset="1" stop-color="#A8442F"/></linearGradient></defs><rect x="10" y="30" width="280" height="14" rx="7" fill="url(#unGrad)" stroke="#D9C79F"/>';
    [-40, 0, 37, 100, 200].forEach(function (t) { s += '<line x1="' + X(t) + '" y1="44" x2="' + X(t) + '" y2="50" stroke="#2a2118" stroke-width="1.4"/><text x="' + X(t) + '" y="68" font-size="14" text-anchor="middle" fill="#2a2118">' + (t < 0 ? '−' + (-t) : t) + '</text>'; });
    var mx = X(c), on = c >= lo && c <= hi;
    s += '<path d="M' + (mx - 6) + ' 16 L' + (mx + 6) + ' 16 L' + mx + ' 28 Z" fill="#B5761F"/><text x="' + Math.min(Math.max(mx, 40), 260) + '" y="12" font-size="14" font-weight="700" text-anchor="middle" fill="#2a2118">' + esc(on ? label : 'Off the scale') + '</text></svg>';
    return s + '<div class="un-vleg">Scale in °C: −40 (same in °F) · 0 freezes · 37 body · 100 boils at sea level' + (on ? '' : ' · <b>your value is off the scale, shown at the edge</b>') + '</div>';
  }
  function visual(px, x, from, to, v) {
    var h = '';
    if (CAT === 'length') {
      var cm = E.convert('length', from, 'cm', x);
      h = cm >= 0 && cm <= 32 ? ruler(cm) + '<div class="un-vleg">Top: centimeters · bottom: inches · the ruler shows 0–32 cm (12.6 in)</div>' : '';
    } else if (C.temp) h = thermo(E.convert('temperature', from, 'c', x), withSym(fmt(x), E.unit('temperature', from).sym));
    else if (C.css) {
      var p = E.convert('css', from, 'px', x, cssOpts());
      if (isFinite(p) && p > 0) { var shown = Math.min(120, Math.max(8, p)); h = '<div class="un-sample" style="font-size:' + shown + 'px">The quick brown fox</div><div class="un-vleg">Sample text at ' + fmt(p) + ' px' + (shown !== p ? ' (drawn at ' + shown + ' px so it fits)' : '') + '</div>'; }
    }
    $('unVis').innerHTML = h; $('unVisWrap').style.display = h ? '' : 'none';
  }

  /* ---------- result ---------- */
  function empty(msg, hint) {
    $('unResLab').textContent = 'Result'; $('unBig').textContent = '—'; $('unSub').textContent = msg || 'Enter a value to convert.'; $('unMVal').textContent = '—'; $('unMLab').textContent = 'Result';
    $('unResults').style.display = 'none'; last = null; setHint(hint || '');
  }
  function tableHtml(rows, curId) {
    return '<thead><tr><th>Unit</th><th>Value</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr' + (r.id === curId ? ' class="cur"' : '') + '><td>' + esc(r.name) + '</td><td>' + esc(r.val) + '</td></tr>'; }).join('') + '</tbody>';
  }
  var TFORM = { 'c>f': '°F = °C × 9/5 + 32', 'f>c': '°C = (°F − 32) × 5/9', 'c>k': 'K = °C + 273.15', 'k>c': '°C = K − 273.15', 'f>k': 'K = (°F − 32) × 5/9 + 273.15', 'k>f': '°F = (K − 273.15) × 9/5 + 32', 'c>r': '°R = (°C + 273.15) × 9/5', 'r>c': '°C = °R × 5/9 − 273.15', 'f>r': '°R = °F + 459.67', 'r>f': '°F = °R − 459.67', 'k>r': '°R = K × 9/5', 'r>k': 'K = °R × 5/9' };
  function renderOven(raw, from, to) {
    var x = E.parse(raw);
    if (!isFinite(x)) { empty('Enter an oven temperature.', 'Enter a number like 350, 180 or 4.'); return; }
    if (from === 'gas' && !E.GAS.some(function (g) { return Math.abs(g[0] - x) < 1e-9; })) { empty('Pick a gas mark.', 'Gas marks run ¼ (0.25), ½ (0.5) and 1 to 9.'); return; }
    if (from !== 'gas' && (x < 0 || x > 1000)) { empty('Enter an oven temperature.', 'Oven temperatures run from 0 to 1000 — try 350 for °F or 180 for °C.'); return; }
    var o = E.ovenAll(from, x), U = E.OVEN_UNITS, fu = U.filter(function (u) { return u.id === from; })[0], tu = U.filter(function (u) { return u.id === to; })[0];
    var ofmt = function (v) { return st.prec === 'auto' ? String(+v.toFixed(1)) : fmt(v); };
    var val = to === 'c' ? o.C : to === 'f' ? o.F : to === 'fan' ? o.fan : null;
    var big = to === 'gas' ? (o.gas ? 'Gas mark ' + o.gas[1] : 'Off the scale') : withSym(ofmt(val), tu.sym);
    $('unResLab').textContent = (from === 'gas' ? 'Gas mark ' + (E.GAS.filter(function (g) { return Math.abs(g[0] - x) < 1e-9; })[0][1]) : withSym(fmt(x), fu.sym)) + ' =';
    $('unBig').textContent = big; $('unMLab').textContent = $('unResLab').textContent; $('unMVal').textContent = big;
    $('unSub').textContent = to === 'gas' && !o.gas ? 'This temperature is outside the gas mark scale (¼ to 9, 225–475 °F).' : withSym(ofmt(o.F), '°F') + ' = ' + withSym(ofmt(o.C), '°C') + ' = ' + withSym(ofmt(o.fan), '°C fan') + (o.gas ? ' = gas mark ' + o.gas[1] : '');
    var rC = Math.round(o.C / 5) * 5, rF = Math.round(o.F / 25) * 25;
    $('unTip').textContent = from === 'f' ? 'Recipes usually round this to ' + rC + ' °C (' + (rC - 20) + ' °C in a fan oven).' : (from === 'gas' ? '' : 'Recipes usually round this to ' + rF + ' °F.');
    $('unTip').style.display = $('unTip').textContent ? '' : 'none';
    $('unVis').innerHTML = ''; $('unVisWrap').style.display = 'none';
    $('unTable').innerHTML = tableHtml([{ id: 'c', name: 'Celsius (°C)', val: ofmt(o.C) }, { id: 'f', name: 'Fahrenheit (°F)', val: ofmt(o.F) }, { id: 'fan', name: 'Fan oven (°C fan)', val: ofmt(o.fan) }, { id: 'gas', name: 'Gas mark (nearest)', val: o.gas ? o.gas[1] : '—' }], to);
    $('unFormula').textContent = 'Fan oven = °C − 20. Gas mark is the nearest standard setting (marks are 25 °F apart). Oven dials are only accurate to about ±10 °C.';
    $('unResults').style.display = ''; setHint('');
    last = { text: $('unResLab').textContent.replace(/ =$/, '') + ' = ' + big, lines: ['Celsius: ' + ofmt(o.C) + ' °C', 'Fahrenheit: ' + ofmt(o.F) + ' °F', 'Fan oven: ' + ofmt(o.fan) + ' °C', 'Gas mark: ' + (o.gas ? o.gas[1] : '—')] };
  }
  function render() {
    var from = $('unFrom').getAttribute('data-value'), to = $('unTo').getAttribute('data-value'), raw = $('unVal').value.trim();
    if (!raw) { empty(); return; }
    if (CAT === 'cooking' && st.mode === 'oven') { renderOven(raw, from, to); return; }
    var x = E.parse(raw);
    if (!isFinite(x)) { empty('Enter a number.', 'Enter a number like 12.5, 1/2 or 1 1/2 — digits only.'); return; }
    if (Math.abs(x) > 1e30) { empty('That number is too large.', 'Enter a value below 1,000,000,000,000,000,000,000,000,000,000.'); return; }
    if (!C.neg && x < 0) { empty('Enter 0 or more.', 'This value cannot be negative — enter 0 or more.'); return; }
    var o = null, fu = E.unit(CAT, from), tu = E.unit(CAT, to);
    if (C.temp && E.convert('temperature', from, 'c', x) < -273.15 - 1e-9) { empty('Below absolute zero.', 'Nothing can be colder than absolute zero (−273.15 °C, −459.67 °F, 0 K).'); return; }
    if (C.css) {
      o = cssOpts();
      if (!isFinite(o.root)) { empty('Enter the root font size.', 'Enter the root (base) font size in px — browsers use 16.'); return; }
      if ($('unParent').value.trim() && !isFinite(pos($('unParent').value))) { empty('Check the parent font size.', 'Parent font size must be a number above 0, like 16.'); return; }
      if ((from === 'vw' || to === 'vw') && !isFinite(o.vw)) { empty('Enter the viewport width.', 'To use vw, open Go advanced and enter your viewport width in px, like 1440.'); return; }
      if ((from === 'vh' || to === 'vh') && !isFinite(o.vh)) { empty('Enter the viewport height.', 'To use vh, open Go advanced and enter your viewport height in px, like 900.'); return; }
    }
    if (C.cook) o = { ing: st.ing, std: st.std };
    var v = E.convert(CAT, from, to, x, o);
    if (!isFinite(v)) { empty('That number is too large.', 'The result is too large to show — try a smaller value.'); return; }
    var vs = fmt(v), big = withSym(vs, tu.sym), one = E.convert(CAT, from, to, 1, o);
    $('unResLab').textContent = withSym(fmt(x), fu.sym) + ' ='; $('unBig').textContent = big; $('unMLab').textContent = $('unResLab').textContent; $('unMVal').textContent = big;
    var sub;
    if (C.temp) sub = TFORM[from + '>' + to] || 'Same unit';
    else if (from === to) sub = 'Same unit — nothing to convert.';
    else sub = '1 ' + fu.sym + ' = ' + withSym(E.fmt(one, st.prec === 'auto' ? '10sig' : st.prec), tu.sym) + (C.css ? ' (root font size ' + fmt(o.root) + ' px)' : '') + (C.cook && E.cookKind(from) !== E.cookKind(to) ? ' of ' + E.ingredient(st.ing).name.toLowerCase() : '');
    $('unSub').textContent = sub;
    /* tip */
    var tip = '';
    if (CAT === 'length' && (to === 'in' || to === 'ft')) { var inch = E.convert('length', from, 'in', x), t = E.tape(inch); tip = to === 'in' ? 'On a tape measure that is ' + t.text + ' in' + (t.exact ? '' : ' (nearest 1/16 in)') + '.' : (function () { var ft = Math.floor(Math.abs(inch) / 12 + 1e-9), rem = inch - Math.sign(inch) * ft * 12, tr = E.tape(Math.abs(rem)); return 'That is ' + (inch < 0 ? '−' : '') + ft + ' ft ' + tr.text + ' in' + (tr.exact ? '' : ' (nearest 1/16 in)') + '.'; })(); }
    else if (CAT === 'weight' && to === 'lb' && x > 0) { var lbv = v, wl = Math.floor(lbv + 1e-9), oz = (lbv - wl) * 16; if (oz > 15.995) { wl += 1; oz = 0; } tip = lbv < 1e6 ? 'That is ' + wl + ' lb ' + E.fmt(oz, '1dp').replace(/\.0$/, '') + ' oz.' : ''; }
    else if (CAT === 'data') {
      var dec = /^(kB|MB|GB|TB|PB)$/, bin = /^(KiB|MiB|GiB|TiB|PiB)$/;
      if ((dec.test(from) && bin.test(to)) || (bin.test(from) && dec.test(to))) tip = 'Drives are sold in decimal units (1 GB = 1,000,000,000 bytes) while Windows reports binary units (1 GiB = 1,073,741,824 bytes) but still labels them GB — that is why a 1 TB drive shows about 931 GB.';
    }
    else if (C.cook && E.cookKind(from) !== E.cookKind(to)) { var ing = E.ingredient(st.ing); tip = ing.name + ' weighs about ' + fmt(ing.gpc) + ' g per US cup — typical values, about ±5%. For baking, weigh it.'; }
    $('unTip').textContent = tip; $('unTip').style.display = tip ? '' : 'none';
    visual(null, x, from, to, v);
    var rows = E.all(CAT, from, x, o).map(function (r) { return { id: r.u.id, name: r.u.name + ' (' + r.u.sym + ')', val: fmt(r.v) }; });
    $('unTable').innerHTML = tableHtml(rows, from);
    $('unFormula').textContent = C.css ? 'px ÷ root font size = rem. Root font size ' + fmt(o.root) + ' px' + (isFinite(pos($('unParent').value)) ? ', parent font size ' + fmt(o.parent) + ' px.' : ' (em and % use it too unless you set a parent size under Go advanced).') : (C.temp ? '' : 'Every unit is converted through one base unit, using exact international definitions.');
    $('unFormula').style.display = $('unFormula').textContent ? '' : 'none';
    $('unResults').style.display = ''; setHint('');
    last = { text: withSym(fmt(x), fu.sym) + ' = ' + big, lines: [sub] };
  }

  /* ---------- wiring ---------- */
  function showMode() {
    var cook = CAT === 'cooking', oven = cook && st.mode === 'oven', css = !!C.css;
    $('unModeSeg').parentNode.style.display = cook ? '' : 'none';
    $('unIngFld').style.display = cook && !oven ? '' : 'none';
    $('unBaseFld').style.display = css ? '' : 'none';
    $('unStdFld').style.display = cook && !oven ? '' : 'none';
    $('unCssAdv').style.display = css ? '' : 'none';
    $('unAdvIn').style.display = st.adv ? '' : 'none';
    var d = defaults(); $('unEx').textContent = 'See an example: ' + d.ex + ' ' + usym(d.from) + ' to ' + usym(d.to);
  }
  $('unVal').addEventListener('input', render);
  $('unFrom').addEventListener('change', render); $('unTo').addEventListener('change', render);
  ['unBase', 'unParent', 'unVw', 'unVh'].forEach(function (id) { $(id).addEventListener('input', render); });
  $('unSwap').addEventListener('click', function () { var f = $('unFrom').getAttribute('data-value'), t = $('unTo').getAttribute('data-value'); setUnits(t, f); render(); });
  $('unModeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; st.mode = b.getAttribute('data-v'); setSeg('unModeSeg', st.mode);
    var d = defaults(); $('unVal').value = ''; setUnits(d.from, d.to); showMode(); render();
  });
  $('unEx').addEventListener('click', function () { var d = defaults(); $('unVal').value = String(d.ex); setUnits(d.from, d.to); render(); });
  $('unAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv; $('unAdvBtn').classList.toggle('open', st.adv); $('unAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    if (!st.adv) { st.prec = 'auto'; st.std = 'us'; setPanel($('unPrec'), PREC, 'auto'); setPanel($('unStd'), STD, 'us'); $('unParent').value = ''; $('unVw').value = ''; $('unVh').value = ''; }
    showMode(); render();
  });
  $('unPrec').addEventListener('change', function () { st.prec = $('unPrec').getAttribute('data-value'); render(); });
  $('unStd').addEventListener('change', function () { st.std = $('unStd').getAttribute('data-value'); render(); });
  $('unIng').addEventListener('change', function () { st.ing = $('unIng').getAttribute('data-value'); render(); });
  $('unCopy').addEventListener('click', function () {
    if (!last) return; var btn = $('unCopy'), txt = [last.text].concat(last.lines).join('\n');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy result'; }, 1600); };
    var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok); } catch (e) { done(false); } };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, legacy); } catch (e) { legacy(); }
  });
  /* category dropdown = navigation (keeps the typed value for 15 s) */
  $('unCat').addEventListener('change', function () {
    var c = $('unCat').getAttribute('data-value'), target = '/' + E.CATS[c].slug + '/';
    if (location.pathname !== target && c !== CAT && !window.__unNoNav) { try { sessionStorage.setItem('unForm', JSON.stringify({ t: Date.now(), v: $('unVal').value })); } catch (e) {} location.href = target; }
  });

  /* ---------- init ---------- */
  var PREC = [['auto', 'Auto (up to 8 digits)'], ['2dp', '2 decimal places'], ['4dp', '4 decimal places'], ['6dp', '6 decimal places'], ['4sig', '4 significant digits'], ['10sig', '10 significant digits']];
  var STD = [['us', 'US cup (237 mL)'], ['uk', 'UK / metric cup (250 mL)'], ['au', 'Australian cup (250 mL, 20 mL tablespoon)']];
  setPanel($('unCat'), E.ORDER.map(function (k) { return [k, E.CATS[k].name]; }), CAT);
  setPanel($('unPrec'), PREC, 'auto'); setPanel($('unStd'), STD, 'us');
  setPanel($('unIng'), E.ING.map(function (i) { return [i[0], i[1]]; }), 'flour');
  var d0 = defaults(); setUnits(d0.from, d0.to);
  try { var raw = sessionStorage.getItem('unForm'); if (raw) { sessionStorage.removeItem('unForm'); var o = JSON.parse(raw); if (o && Date.now() - o.t < 15000 && o.v) $('unVal').value = o.v; } } catch (e) {}
  showMode(); render();
};

/* =========================================================
   RANDOM NUMBER GENERATOR — one engine for the hub and every range page.
   Pure (no DOM). Randomness = crypto.getRandomValues with rejection sampling (no modulo bias), BigInt arithmetic so any
   range up to 999 digits and up to 999 decimal places is exact.
   CalcThis.rngEngine  ·  CalcThis.initRngCalc (ids rg*)
   ========================================================= */
/* RNG-ENGINE:START */
CalcThis.rngEngine = (function () {
  var Z = BigInt(0), O = BigInt(1), TWO = BigInt(2), TEN = BigInt(10);
  var MAXD = 999, MAXN = 10000, MAXSETS = 100, MAXTOTAL = 100000, ENUM = 400000, MAXEXCL = 5000;
  var src = null, buf = null, bp = 0;
  function setSource(f) { src = f || null; buf = null; bp = 0; }
  function take(n) {
    if (src) return src(n);
    if (!buf || bp + n > buf.length) {
      var size = Math.max(8192, n), i;
      buf = new Uint8Array(size);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) { for (i = 0; i < size; i += 65536) crypto.getRandomValues(buf.subarray(i, Math.min(size, i + 65536))); }
      else for (i = 0; i < size; i++) buf[i] = Math.floor(Math.random() * 256);
      bp = 0;
    }
    var o = buf.subarray(bp, bp + n); bp += n; return o;
  }
  /* uniform integer in [0, n) for a Number n between 1 and 2^32 */
  function randInt(n) {
    if (n <= 1) return 0;
    var lim = Math.floor(4294967296 / n) * n, b, x;
    for (;;) { b = take(4); x = b[0] * 16777216 + ((b[1] << 16) | (b[2] << 8) | b[3]); if (x < lim) return x % n; }
  }
  /* uniform BigInt in [0, n) for any BigInt n >= 1 */
  function randBelow(n) {
    if (n <= O) return Z;
    if (n <= BigInt(4294967296)) return BigInt(randInt(Number(n)));
    var bits = n.toString(2).length, nb = Math.ceil(bits / 8), mask = (O << BigInt(bits)) - O, b, h, i, x;
    for (;;) {
      b = take(nb); h = '';
      for (i = 0; i < nb; i++) h += (b[i] < 16 ? '0' : '') + b[i].toString(16);
      x = BigInt('0x' + h) & mask;
      if (x < n) return x;
    }
  }
  function amod(v, m) { var r = v % m; return r < Z ? r + m : r; }
  function abs(v) { return v < Z ? -v : v; }
  /* "12.5" -> scaled BigInt (x 10^dp). mode: 'ceil' | 'floor' | 'exact'. Returns {v} or {err}. */
  function parseScaled(t, dp, mode) {
    var s = String(t).replace(/[\s,_]/g, '').replace(/[−–]/g, '-');
    if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return { err: 'badnum' };
    var neg = s.charAt(0) === '-'; if (/^[-+]/.test(s)) s = s.slice(1);
    var ip = s.split('.')[0] || '0', fp = s.split('.')[1] || '';
    ip = ip.replace(/^0+(?=\d)/, '');
    if (ip.length > MAXD) return { err: 'toobig' };
    var extra = false;
    if (fp.length > dp) { extra = /[1-9]/.test(fp.slice(dp)); if (extra && dp === 0 && mode === 'exact') return { err: 'whole' }; fp = fp.slice(0, dp); }
    while (fp.length < dp) fp += '0';
    var m = BigInt(ip + fp);
    if (extra) {
      if (mode === 'exact') return { err: 'precision' };
      if (!neg) { if (mode === 'ceil') m = m + O; }
      else { if (mode === 'floor') m = m + O; }
    }
    return { v: neg ? -m : m };
  }
  function fmtScaled(v, dp) {
    var neg = v < Z, s = abs(v).toString();
    if (dp > 0) { while (s.length < dp + 1) s = '0' + s; s = s.slice(0, s.length - dp) + '.' + s.slice(s.length - dp); }
    return (neg ? '-' : '') + s;
  }
  function commas(s) { return String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function bigCount(n) { var s = n.toString(); return s.length <= 18 ? commas(s) : 'about 10^' + (s.length - 1); }

  var MSG = {
    empty: 'Enter a minimum and a maximum, or tap a range below.',
    badnum: 'Enter numbers like 1 and 100 — digits only.',
    whole: 'Whole numbers only — switch to Decimals to use values like 2.5.',
    precision: 'That has more decimal places than you asked for — raise the decimal places.',
    toobig: 'Numbers can have up to 999 digits.',
    order: 'The minimum is higher than the maximum, or no value fits between them.',
    step: 'The step must be a number above 0.',
    count: 'How many numbers must be a whole number from 1 to 10,000.',
    sets: 'Sets must be a whole number from 1 to 100.',
    total: 'That is more than 100,000 numbers in total — ask for fewer.',
    dp: 'Decimal places must be a whole number from 0 to 999.',
    odd: 'The number of odd numbers must be between 0 and how many numbers you ask for.',
    none: 'No numbers fit — check the minimum, maximum, step, exclude list and odd/even setting.',
    range: 'No numbers fit between those limits with that step.'
  };

  /* prepare a validated "context" from settings, or {err, msg} */
  function prep(o) {
    var type = o.type === 'dec' ? 'dec' : 'int', dp = 0, n;
    var fail = function (code, extra) { return { err: code, msg: (extra || '') + MSG[code] }; };
    if (type === 'dec') {
      var dt = String(o.dp == null ? '' : o.dp).trim();
      if (dt === '') dp = 2; else { if (!/^\d+$/.test(dt) || +dt > MAXD) return fail('dp'); dp = +dt; }
    }
    if (!String(o.min == null ? '' : o.min).trim() || !String(o.max == null ? '' : o.max).trim()) return fail('empty');
    var lo = parseScaled(o.min, dp, dp === 0 ? 'exact' : 'ceil'), hi = parseScaled(o.max, dp, dp === 0 ? 'exact' : 'floor');
    if (lo.err) return fail(lo.err); if (hi.err) return fail(hi.err);
    lo = lo.v; hi = hi.v;
    if (lo > hi) return fail('order');
    var step = O, stxt = String(o.step == null ? '' : o.step).trim();
    if (stxt) { var sv = parseScaled(stxt, dp, 'exact'); if (sv.err) return fail(sv.err === 'whole' ? 'whole' : 'step'); if (sv.v <= Z) return fail('step'); step = sv.v; }
    var K = (hi - lo) / step, k0 = Z;
    if (o.incMin === false) k0 = O;
    if (o.incMax === false && amod(hi - lo, step) === Z) K = K - O;
    var N = K - k0 + O;
    if (N <= Z) return fail('range');
    /* exclusions */
    var excl = {}, ecount = 0, etxt = String(o.exclude == null ? '' : o.exclude).trim();
    if (etxt) {
      var toks = etxt.split(/[,;\s]+/).filter(function (x) { return x !== ''; }), i, ev, k;
      if (toks.length > MAXEXCL) return { err: 'exclude', msg: 'The exclude list can hold up to 5,000 numbers.' };
      for (i = 0; i < toks.length; i++) {
        ev = parseScaled(toks[i], dp, 'exact');
        if (ev.err) return { err: 'exclude', msg: 'Can’t read “' + toks[i].slice(0, 20) + '” in the exclude list — use numbers separated by commas or spaces.' };
        if (amod(ev.v - lo, step) !== Z) continue;
        k = (ev.v - lo) / step;
        if (k >= k0 && k <= K && !excl[k.toString()]) { excl[k.toString()] = 1; ecount++; }
      }
    }
    var parity = type === 'int' ? (o.parity || 'any') : 'any';
    var stepEven = amod(step, TWO) === Z, loPar = Number(amod(lo, TWO));
    /* parity of grid index k: value = lo + k*step */
    function parOfK(k) { return stepEven ? loPar : Number(amod(BigInt(loPar) + amod(k, TWO), TWO)); }
    function countK(par) {  /* eligible count for par in {-1 any, 0 even, 1 odd} */
      var tot;
      if (par < 0) tot = N;
      else if (stepEven) tot = (loPar === par) ? N : Z;
      else {
        /* k in [k0,K] with (loPar + k) % 2 == par  <=>  k % 2 == (par - loPar) mod 2 */
        var want = ((par - loPar) % 2 + 2) % 2, firstK = (Number(amod(k0, TWO)) === want) ? k0 : k0 + O;
        tot = firstK > K ? Z : (K - firstK) / TWO + O;
      }
      var kk;
      for (kk in excl) { if (par < 0 || parOfK(BigInt(kk)) === par) tot = tot - O; }
      return tot;
    }
    var ctx = { type: type, dp: dp, lo: lo, hi: hi, step: step, k0: k0, K: K, N: N, excl: excl, ecount: ecount, parity: parity };
    ctx.value = function (k) { return lo + k * step; };
    ctx.count = function (par) { return countK(par); };
    ctx.ok = function (k, par) { return !excl[k.toString()] && (par < 0 || parOfK(k) === par); };
    /* every eligible value as {v, s} when there are at most `max` of them, else null */
    ctx.list = function (par, max) {
      if (par == null) par = -1;
      if (countK(par) > BigInt(max) || N > BigInt(ENUM)) return null;
      var out = [], n2 = Number(N), j, k;
      for (j = 0; j < n2; j++) { k = k0 + BigInt(j); if (ctx.ok(k, par)) { var v = ctx.value(k); out.push({ v: v, s: fmtScaled(v, dp) }); } }
      return out;
    };
    /* draw n numbers matching par (-1 any, 0 even, 1 odd) */
    ctx.draw = function (n, par, unique) {
      var Ec = countK(par), out = [], i, j, k, arr, t, off, guard, seen;
      if (n <= 0) return { out: [] };
      if (Ec <= Z) return { err: 'none', msg: MSG.none };
      if (unique && BigInt(n) > Ec) return { err: 'many', msg: 'Only ' + bigCount(Ec) + ' different number' + (Ec === O ? ' fits' : 's fit') + ' with no repeats — ask for ' + (Ec === O ? 'one' : bigCount(Ec) + ' or fewer') + ', or allow repeats.', limit: Ec };
      if (N <= BigInt(ENUM)) {
        arr = []; var n2 = Number(N);
        for (j = 0; j < n2; j++) { k = k0 + BigInt(j); if (ctx.ok(k, par)) arr.push(k); }
        if (unique) {
          for (i = 0; i < n; i++) { j = i + randInt(arr.length - i); t = arr[i]; arr[i] = arr[j]; arr[j] = t; out.push(arr[i]); }
        } else for (i = 0; i < n; i++) out.push(arr[randInt(arr.length)]);
      } else {
        seen = {}; guard = 0;
        while (out.length < n && guard < 200 * n + 2000) {
          guard++; off = randBelow(N); k = k0 + off;
          if (!ctx.ok(k, par)) continue;
          if (unique) { if (seen[off.toString()]) continue; seen[off.toString()] = 1; }
          out.push(k);
        }
        if (out.length < n) return { err: 'none', msg: MSG.none };
      }
      return { out: out.map(function (kk) { return ctx.value(kk); }) };
    };
    return ctx;
  }

  function stats(vals, dp) {
    var mn = vals[0], mx = vals[0], sum = Z, i;
    for (i = 0; i < vals.length; i++) { if (vals[i] < mn) mn = vals[i]; if (vals[i] > mx) mx = vals[i]; sum = sum + vals[i]; }
    var md = dp < 2 ? 2 : dp, scale = TEN ** BigInt(md - dp), num = sum * scale, cnt = BigInt(vals.length);
    var q = abs(num) / cnt, r = abs(num) % cnt; if (r * TWO >= cnt) q = q + O;
    var ms = fmtScaled(num < Z ? -q : q, md);
    if (ms.indexOf('.') > -1) { var keep = dp, parts = ms.split('.'), f = parts[1]; while (f.length > keep && f.charAt(f.length - 1) === '0') f = f.slice(0, -1); ms = f ? parts[0] + '.' + f : parts[0]; }
    return { min: fmtScaled(mn, dp), max: fmtScaled(mx, dp), sum: fmtScaled(sum, dp), mean: ms };
  }

  function sideErr(r, word, n, par, ctx) {
    if (r.err === 'many') return { err: 'many', msg: 'Only ' + bigCount(r.limit) + ' ' + word + ' number' + (r.limit === O ? ' is' : 's are') + ' available with no repeats — ask for fewer ' + word + ' numbers or allow repeats.' };
    if (r.err === 'none') return { err: 'none', msg: 'There are no ' + word + ' numbers in that range, so it can’t include ' + word + ' numbers — change the odd/even setting.' };
    return r;
  }
  /* generate sets of numbers. o: min max count type dp unique step exclude parity oddCount incMin incMax sets sort */
  function generate(o) {
    var ctx = prep(o); if (ctx.err) return ctx;
    var ct = String(o.count == null ? '' : o.count).trim().replace(/,/g, ''), cn = ct === '' ? 1 : +ct;
    if (!/^\d*$/.test(ct) || !isFinite(cn) || cn < 1 || cn > MAXN) return { err: 'count', msg: MSG.count };
    var st = String(o.sets == null ? '' : o.sets).trim(), sn = st === '' ? 1 : +st;
    if (!/^\d*$/.test(st) || !isFinite(sn) || sn < 1 || sn > MAXSETS) return { err: 'sets', msg: MSG.sets };
    if (cn * sn > MAXTOTAL) return { err: 'total', msg: MSG.total };
    var unique = !!o.unique, par = ctx.parity, sets = [], s, i, g, res, vals, oddN, evenN, pickOdd;
    var ot = String(o.oddCount == null ? '' : o.oddCount).trim();
    if (par === 'custom') { if (!/^\d+$/.test(ot) || +ot > cn) return { err: 'odd', msg: MSG.odd }; }
    for (s = 0; s < sn; s++) {
      if (par === 'odd' || par === 'even') { res = ctx.draw(cn, par === 'odd' ? 1 : 0, unique); if (res.err) return res; vals = res.out; }
      else if (par === 'half' || par === 'custom') {
        if (par === 'custom') oddN = +ot; else { oddN = Math.floor(cn / 2); if (cn % 2 && randInt(2) === 1) oddN += 1; }
        evenN = cn - oddN;
        res = ctx.draw(oddN, 1, unique); if (res.err) return sideErr(res, 'odd', oddN, 1);
        g = ctx.draw(evenN, 0, unique); if (g.err) return sideErr(g, 'even', evenN, 0);
        vals = res.out.concat(g.out);
        for (i = vals.length - 1; i > 0; i--) { var j = randInt(i + 1), t = vals[i]; vals[i] = vals[j]; vals[j] = t; }
      } else { res = ctx.draw(cn, -1, unique); if (res.err) return res; vals = res.out; }
      if (o.sort === 'asc') vals.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
      else if (o.sort === 'desc') vals.sort(function (a, b) { return a < b ? 1 : a > b ? -1 : 0; });
      sets.push(vals.map(function (v) { return { v: v, s: fmtScaled(v, ctx.dp) }; }));
    }
    return { ok: true, sets: sets, ctx: ctx, eligible: ctx.count(-1) };
  }

  return { generate: generate, prep: prep, stats: stats, randInt: randInt, randBelow: randBelow, setSource: setSource, fmt: fmtScaled, parse: parseScaled, bigCount: bigCount, commas: commas, MAXN: MAXN, MSG: MSG };
})();
/* RNG-ENGINE:END */

CalcThis.initRngCalc = function () {
  var E = CalcThis.rngEngine, $ = function (id) { return document.getElementById(id); }, B = document.body;
  var st = { mode: B.getAttribute('data-mode') === 'draw' ? 'draw' : 'gen', type: 'int', adv: false, sort: 'none', par: 'any', fmt: 'comma' };
  var shown = null, pile = null, recent = [], rot = 0, wheelKey = '', MAXBALLS = 1500, MAXHIST = 60;
  var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function setSeg(id, v) { [].forEach.call($(id).querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); }); }
  function setPanel(root, opts, val) {
    var panel = root.querySelector('.csel-panel');
    panel.innerHTML = opts.map(function (o) { return '<button type="button" class="csel-opt' + (o[0] === val ? ' on' : '') + '" role="option" aria-selected="' + (o[0] === val) + '" data-value="' + esc(o[0]) + '">' + esc(o[1]) + '</button>'; }).join('');
    root.setAttribute('data-value', val);
    root.querySelector('.csel-val').textContent = (opts.filter(function (o) { return o[0] === val; })[0] || opts[0])[1];
    CalcThis.initCsel(root);
  }
  function setHint(m) { var h = $('rgHint'); h.textContent = m || ''; h.style.display = m ? 'block' : 'none'; }
  var SORT = [['none', 'Don’t sort'], ['asc', 'Low to high'], ['desc', 'High to low']];
  var FMT = [['comma', 'Commas'], ['space', 'Spaces'], ['line', 'New lines (spreadsheet column)'], ['row', 'Tabs (spreadsheet row)']];
  var PAR = [['any', 'Any numbers'], ['odd', 'Odd numbers only'], ['even', 'Even numbers only'], ['half', 'Half odd, half even'], ['custom', 'Choose how many are odd']];
  function parOpts() { return st.mode === 'draw' ? PAR.slice(0, 3) : PAR; }

  function read() {
    var adv = st.adv, draw = st.mode === 'draw';
    return {
      min: $('rgMin').value, max: $('rgMax').value, count: draw ? '1' : $('rgCount').value, type: st.type, dp: $('rgDp').value,
      unique: draw ? true : $('rgUnique').checked, sort: draw ? 'none' : st.sort,
      step: adv ? $('rgStep').value : '', exclude: adv ? $('rgExcl').value : '',
      parity: adv && st.type === 'int' ? st.par : 'any', oddCount: $('rgOdd').value,
      incMin: adv ? $('rgIncMin').checked : true, incMax: adv ? $('rgIncMax').checked : true,
      sets: adv && !draw ? $('rgSets').value : '1'
    };
  }
  function parCode(p) { return p === 'odd' ? 1 : p === 'even' ? 0 : -1; }

  /* ---------- layout ---------- */
  function layout() {
    var draw = st.mode === 'draw';
    $('rgCountFld').style.display = draw ? 'none' : '';
    $('rgUniqueWrap').style.display = draw ? 'none' : '';
    $('rgSortFld').style.display = draw ? 'none' : '';
    $('rgDpFld').style.display = st.type === 'dec' ? '' : 'none';
    $('rgGo').textContent = draw ? 'Draw a number' : 'Generate';
    $('rgReset').style.display = draw ? '' : 'none';
    $('rgAdvIn').style.display = st.adv ? '' : 'none';
    $('rgParFld').style.display = st.type === 'int' ? '' : 'none';
    $('rgOddFld').style.display = st.type === 'int' && st.par === 'custom' && !draw ? '' : 'none';
    $('rgSetsFld').style.display = draw ? 'none' : '';
    $('rgGo').disabled = false; $('rgBtns').classList.toggle('draw', draw);
    var d = draw ? 'Drawn numbers leave the pile, so none repeats until you reset it.' : '';
    $('rgModeNote').textContent = d; $('rgModeNote').style.display = d ? '' : 'none';
    var mn = $('rgMin').value.trim(), mx = $('rgMax').value.trim();
    [].forEach.call($('rgChips').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-min') === mn && b.getAttribute('data-max') === mx); });
  }
  function hideResults() {
    $('rgResults').style.display = 'none'; $('rgBallsWrap').style.display = 'none'; $('rgVisWrap').style.display = 'none'; $('rgBig').textContent = '—'; $('rgBig').classList.remove('rg-long');
    $('rgResLab').textContent = 'Result'; $('rgSub').textContent = st.mode === 'draw' ? 'Press Draw a number.' : 'Press Generate.';
    $('rgMLab').textContent = 'Result'; $('rgMVal').textContent = '—'; shown = null; preview();
  }
  function preview() {
    if (shown) return;
    var s = read(), ct = s.count.trim(); if (st.mode === 'gen' && ct !== '' && ct !== '1') return;
    var ctx = E.prep(s); if (ctx.err) return;
    var pool = ctx.list(parCode(s.parity), 100);
    if (pool && pool.length >= 2) { $('rgVisWrap').style.display = ''; $('rgVisLab').textContent = 'The wheel'; showWheel(pool, null, null, true); }
  }
  function invalidate() { hideResults(); setHint(''); $('rgGo').disabled = false; layout(); }
  function fail(r) { hideResults(); setHint(r.msg || ''); $('rgSub').textContent = r.err === 'empty' ? 'Enter a minimum and a maximum.' : 'Check the settings on the left.'; }

  /* ---------- visuals ---------- */
  var SLICE = ['#F5EFE4', '#EBDDBE'];
  function wheelSvg(pool, win, used, startRot) {
    var M = pool.length, a = 360 / M, cx = 150, cy = 164, r = 134, i, s, labelled = M <= 24 && pool.every(function (p) { return p.s.length <= 7; });
    function pt(deg, rad) { var t = deg * Math.PI / 180; return (cx + rad * Math.sin(t)).toFixed(2) + ' ' + (cy - rad * Math.cos(t)).toFixed(2); }
    s = '<svg viewBox="0 0 300 316" role="img" aria-label="Number wheel with ' + M + ' numbers"><g id="rgWheel" style="transform-origin:' + cx + 'px ' + cy + 'px;transform:rotate(' + startRot + 'deg)">';
    for (i = 0; i < M; i++) {
      var fill = i === win ? '#B5761F' : (used && used[pool[i].s] ? '#DDD6C8' : SLICE[i % 2]);
      if (M === 1) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="#D9C79F"/>';
      else s += '<path d="M' + cx + ' ' + cy + ' L' + pt(i * a, r) + ' A' + r + ' ' + r + ' 0 ' + (a > 180 ? 1 : 0) + ' 1 ' + pt((i + 1) * a, r) + ' Z" fill="' + fill + '" stroke="#D9C79F" stroke-width="' + (M > 40 ? 0.6 : 1) + '"/>';
      if (labelled) { var cen = (i + 0.5) * a, left = cen > 180, tf = left ? cen + 90 : cen - 90; s += '<text transform="rotate(' + tf.toFixed(2) + ' ' + cx + ' ' + cy + ')" x="' + (left ? cx - r + 9 : cx + r - 9) + '" y="' + (cy + 5) + '" text-anchor="' + (left ? 'start' : 'end') + '" font-size="14" font-weight="600" fill="' + (i === win ? '#fff' : (used && used[pool[i].s] ? '#9A8F7E' : '#2a2118')) + '">' + esc(pool[i].s) + '</text>'; }
    }
    s += '</g><circle cx="' + cx + '" cy="' + cy + '" r="34" fill="#fff" stroke="#D9C79F" stroke-width="1.4"/>';
    var w = win >= 0 ? pool[win].s : '';
    if (w && w.length <= 7) s += '<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-size="' + (w.length <= 3 ? 20 : 15) + '" font-weight="700" fill="#2a2118">' + esc(w) + '</text>';
    s += '<path d="M150 30 L139 6 L161 6 Z" fill="#2a2118"/></svg>';
    return { svg: s, centre: (win + 0.5) * a };
  }
  function short(t) { return t.length > 11 ? t.slice(0, 9) + '…' : t; }
  function stripSvg(vals, lo, hi, dp) {
    var X0 = 16, X1 = 284, n = vals.length, i, s = '<svg viewBox="' + (n === 1 ? '0 22 300 88' : n > 300 ? '0 10 300 98' : '0 42 300 66') + '" role="img" aria-label="Where the numbers fall between the minimum and the maximum">';
    function frac(v) { return hi > lo ? Number((v - lo) * BigInt(1000000) / (hi - lo)) / 1000000 : 0.5; }
    s += '<line x1="' + X0 + '" y1="62" x2="' + X1 + '" y2="62" stroke="#D9C79F" stroke-width="3" stroke-linecap="round"/>';
    if (n > 300) {
      var bins = [], b, mx = 1; for (i = 0; i < 20; i++) bins.push(0);
      for (i = 0; i < n; i++) { b = Math.min(19, Math.floor(frac(vals[i]) * 20)); bins[b]++; if (bins[b] > mx) mx = bins[b]; }
      for (i = 0; i < 20; i++) { var h = Math.max(bins[i] ? 2 : 0, bins[i] / mx * 46); s += '<rect x="' + (X0 + i * 13.4 + 1).toFixed(1) + '" y="' + (62 - h).toFixed(1) + '" width="11.4" height="' + h.toFixed(1) + '" rx="2" fill="#B5761F" opacity=".8"/>'; }
    } else {
      for (i = 0; i < n; i++) s += '<circle cx="' + (X0 + frac(vals[i]) * (X1 - X0)).toFixed(1) + '" cy="62" r="' + (n === 1 ? 8 : 6) + '" fill="#B5761F" fill-opacity="' + (n === 1 ? 1 : 0.6) + '" stroke="#fff"/>';
      if (n === 1) { var x = Math.min(Math.max(X0 + frac(vals[0]) * (X1 - X0), 40), 260); s += '<text x="' + x.toFixed(1) + '" y="38" text-anchor="middle" font-size="14" font-weight="700" fill="#2a2118">' + esc(short(E.fmt(vals[0], dp))) + '</text>'; }
    }
    s += '<text x="' + X0 + '" y="92" font-size="14" fill="#6b5f50">' + esc(short(E.fmt(lo, dp))) + '</text><text x="' + X1 + '" y="92" text-anchor="end" font-size="14" fill="#6b5f50">' + esc(short(E.fmt(hi, dp))) + '</text></svg>';
    return s;
  }
  function showWheel(pool, winS, used, idle) {
    var key = pool.length + ':' + pool[0].s + ':' + pool[pool.length - 1].s, win = -1, i;
    for (i = 0; i < pool.length; i++) if (pool[i].s === winS) { win = i; break; }
    if (key !== wheelKey) { rot = 0; wheelKey = key; }
    var w = wheelSvg(pool, win, used, rot);
    $('rgVis').innerHTML = w.svg + '<div class="un-vleg">' + (idle ? 'Every possible number is a slice — press ' + (st.mode === 'draw' ? 'Draw a number' : 'Generate') + ' to spin.' : used ? 'Grey slices are already drawn.' : 'Every possible number is a slice.') + '</div>';
    $('rgVisLab').textContent = 'The wheel';
    if (idle) return;
    var g = $('rgWheel'), fin = Math.ceil(rot / 360) * 360 + 1080 - w.centre;
    g.setAttribute('data-rot', fin);
    if (reduce) { g.style.transform = 'rotate(' + fin + 'deg)'; }
    else setTimeout(function () { g.style.transition = 'transform 1.7s cubic-bezier(.17,.67,.2,1)'; g.style.transform = 'rotate(' + fin + 'deg)'; }, 30);
    rot = fin;
  }

  /* ---------- results ---------- */
  function setBig(t) { var b = $('rgBig'); b.textContent = t; b.classList.toggle('rg-long', t.length > 12); }
  function rangeText(ctx) { return 'between ' + E.fmt(ctx.lo, ctx.dp) + ' and ' + E.fmt(ctx.hi, ctx.dp); }
  function chanceText(n) { return n > BigInt(1) ? ' · each has a 1 in ' + E.bigCount(n) + ' chance' : ''; }
  function showHist() {
    var h = $('rgHist'), list = st.mode === 'draw' ? (pile ? pile.drawn : []) : recent, lab, items;
    if (st.mode === 'draw') { if (list.length < 2) { h.style.display = 'none'; return; } lab = 'Drawn so far (' + list.length + ')'; items = list.length > MAXHIST ? list.slice(-MAXHIST) : list; if (list.length > MAXHIST) lab += ', latest ' + MAXHIST; }
    else { if (list.length < 2) { h.style.display = 'none'; return; } lab = 'Recent'; items = list.slice(1); }
    h.innerHTML = '<div class="fc-grp">' + lab + '</div><div class="rg-balls rg-small">' + items.map(function (t) { return '<span class="rg-ball">' + esc(t) + '</span>'; }).join('') + '</div>';
    h.style.display = '';
  }
  function showGen(r) {
    var sets = r.sets, ctx = r.ctx, total = 0, all = [], i, j;
    sets.forEach(function (s) { total += s.length; s.forEach(function (x) { all.push(x); }); });
    shown = { r: r, total: total };
    var parWord = ctx.parity === 'odd' ? ' · odd numbers only' : ctx.parity === 'even' ? ' · even numbers only' : '';
    var single = total === 1;
    if (single) {
      $('rgResLab').textContent = 'Your random number'; setBig(all[0].s);
      $('rgSub').textContent = 'Between ' + E.fmt(ctx.lo, ctx.dp) + ' and ' + E.fmt(ctx.hi, ctx.dp) + ' · ' + E.bigCount(r.eligible) + ' possible number' + (r.eligible === BigInt(1) ? '' : 's') + chanceText(r.eligible) + parWord;
      recent.unshift(all[0].s); if (recent.length > 13) recent.pop();
      $('rgMLab').textContent = 'Your number'; $('rgMVal').textContent = all[0].s.length > 14 ? all[0].s.slice(0, 12) + '…' : all[0].s;
    } else {
      $('rgResLab').textContent = 'Random numbers'; setBig(E.commas(total) + ' number' + (total === 1 ? '' : 's'));
      $('rgSub').textContent = E.commas(total) + ' random ' + (total === 1 ? 'number ' : 'numbers ') + rangeText(ctx) + ' · ' + (read().unique ? 'no repeats' : 'repeats allowed') + (read().sort === 'asc' ? ' · low to high' : read().sort === 'desc' ? ' · high to low' : '') + (sets.length > 1 ? ' · ' + sets.length + ' sets' : '') + parWord;
      var first = sets[0].slice(0, 3).map(function (x) { return x.s; }).join(', ');
      $('rgMLab').textContent = 'Your numbers'; $('rgMVal').textContent = (first.length > 22 ? first.slice(0, 20) : first) + (total > 3 || first.length > 22 ? '…' : '');
    }
    /* balls */
    var html = '', shownN = 0, cut = false;
    for (i = 0; i < sets.length && !cut; i++) {
      if (sets.length > 1) html += '<div class="rg-setlab">Set ' + (i + 1) + '</div>';
      html += '<div class="rg-balls">';
      for (j = 0; j < sets[i].length; j++) { if (shownN >= MAXBALLS) { cut = true; break; } html += '<span class="rg-ball">' + esc(sets[i][j].s) + '</span>'; shownN++; }
      html += '</div>';
    }
    if (cut) html += '<p class="un-note">Showing the first ' + E.commas(MAXBALLS) + ' numbers — Copy and Download include all ' + E.commas(total) + '.</p>';
    $('rgBalls').innerHTML = single ? '' : html; $('rgBallsWrap').style.display = single ? 'none' : '';
    /* stats */
    var sh = '';
    if (total >= 2) {
      sh = '<thead><tr>' + (sets.length > 1 ? '<th>Set</th>' : '') + '<th>Lowest</th><th>Highest</th><th>Sum</th><th>Average</th></tr></thead><tbody>';
      sets.slice(0, 30).forEach(function (s, k) { var q = E.stats(s.map(function (x) { return x.v; }), ctx.dp); sh += '<tr>' + (sets.length > 1 ? '<td>' + (k + 1) + '</td>' : '') + '<td>' + esc(q.min) + '</td><td>' + esc(q.max) + '</td><td>' + esc(q.sum) + '</td><td>' + esc(q.mean) + '</td></tr>'; });
      sh += '</tbody>';
    }
    $('rgStats').innerHTML = sh; $('rgStatsWrap').style.display = sh ? '' : 'none';
    /* visual */
    var par = ctx.parity === 'odd' ? 1 : ctx.parity === 'even' ? 0 : -1, pool = single ? ctx.list(par, 100) : null;
    if (single && pool && pool.length >= 2) { $('rgVisWrap').style.display = ''; showWheel(pool, all[0].s, null); }
    else { $('rgVis').innerHTML = stripSvg(all.map(function (x) { return x.v; }), ctx.lo, ctx.hi, ctx.dp) + '<div class="un-vleg">' + (total > 300 ? 'Bars show how many numbers landed in each slice of the range.' : 'Each dot is a number, placed between your minimum and maximum.') + '</div>'; $('rgVisLab').textContent = 'Where your numbers landed'; $('rgVisWrap').style.display = ''; }
    showHist();
    $('rgResults').style.display = ''; setHint('');
  }
  function showDraw(x) {
    var left = pile.left.length, total = pile.all.length, ctx = pile.ctx;
    var cur = x ? x.s : pile.drawn[pile.drawn.length - 1];
    if (cur !== undefined) {
      $('rgResLab').textContent = 'Drawn number ' + pile.drawn.length; setBig(cur);
      $('rgMLab').textContent = 'Drawn #' + pile.drawn.length; $('rgMVal').textContent = cur.length > 14 ? cur.slice(0, 12) + '…' : cur;
    }
    $('rgSub').textContent = left ? E.commas(left) + ' of ' + E.commas(total) + ' numbers left in the pile · ' + rangeText(ctx) : 'That was the last number — press Reset pile to put them all back.';
    $('rgGo').disabled = !left;
    $('rgBallsWrap').style.display = 'none'; $('rgStatsWrap').style.display = 'none';
    var used = {}; pile.drawn.forEach(function (t) { used[t] = 1; });
    if (total >= 2 && total <= 100) { $('rgVisWrap').style.display = ''; showWheel(pile.all, x ? x.s : pile.drawn[pile.drawn.length - 1], used); }
    else {
      var vals = pile.drawn.length ? pile.all.filter(function (p) { return used[p.s]; }).map(function (p) { return p.v; }) : [];
      $('rgVis').innerHTML = stripSvg(vals.length ? vals : [ctx.lo], ctx.lo, ctx.hi, ctx.dp) + '<div class="un-vleg">Dots are the numbers drawn so far.</div>'; $('rgVisLab').textContent = 'Drawn so far'; $('rgVisWrap').style.display = '';
    }
    shown = { draw: true };
    showHist(); $('rgResults').style.display = ''; setHint('');
  }
  function sigOf(s) { return JSON.stringify([s.min.trim(), s.max.trim(), s.type, s.type === 'dec' ? s.dp.trim() : '', s.step.trim(), s.exclude.trim(), s.parity, s.incMin, s.incMax]); }
  function runDraw() {
    var s = read(), ctx = E.prep(s);
    if (ctx.err) { fail(ctx); return; }
    var sg = sigOf(s);
    if (!pile || pile.sig !== sg) {
      var all = ctx.list(parCode(s.parity), 100000);
      if (!all) { fail({ err: 'big', msg: 'There are too many numbers to draw one at a time (limit 100,000) — use Pick numbers, or narrow the range.' }); return; }
      if (!all.length) { fail({ err: 'none', msg: E.MSG.none }); return; }
      pile = { sig: sg, all: all, left: all.slice(), drawn: [], ctx: ctx };
    }
    if (!pile.left.length) { showDraw(null); return; }
    var i = E.randInt(pile.left.length), x = pile.left.splice(i, 1)[0];
    pile.drawn.push(x.s); showDraw(x);
  }
  function run() {
    $('rgGo').disabled = false;
    if (st.mode === 'draw') { runDraw(); return; }
    var r = E.generate(read());
    if (!r.ok) { fail(r); return; }
    showGen(r);
  }

  /* ---------- copy / download ---------- */
  function textOut() {
    var sep = { comma: ', ', space: ' ', line: '\n', row: '\t' }[st.fmt];
    if (shown && shown.draw) return pile ? pile.drawn.join(sep) : '';
    if (!shown) return '';
    return shown.r.sets.map(function (s) { return s.map(function (x) { return x.s; }).join(sep); }).join(st.fmt === 'line' ? '\n\n' : '\n');
  }
  $('rgCopy').addEventListener('click', function () {
    var txt = textOut(); if (!txt) return; var btn = $('rgCopy');
    var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy numbers'; }, 1600); };
    var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok); } catch (e) { done(false); } };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, legacy); } catch (e) { legacy(); }
  });
  $('rgDl').addEventListener('click', function () {
    var txt = textOut(); if (!txt) return;
    try { var url = URL.createObjectURL(new Blob([txt + '\n'], { type: 'text/plain' })), a = document.createElement('a'); a.href = url; a.download = 'random-numbers.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); } catch (e) {}
  });

  /* ---------- wiring ---------- */
  $('rgGo').addEventListener('click', run);
  $('rgReset').addEventListener('click', function () { pile = null; hideResults(); setHint(''); $('rgHist').style.display = 'none'; layout(); wheelKey = ''; rot = 0; });
  ['rgMin', 'rgMax', 'rgCount', 'rgDp', 'rgStep', 'rgExcl', 'rgOdd', 'rgSets'].forEach(function (id) {
    $(id).addEventListener('input', invalidate);
    $(id).addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
  });
  ['rgUnique', 'rgIncMin', 'rgIncMax'].forEach(function (id) { $(id).addEventListener('change', invalidate); });
  $('rgSort').addEventListener('change', function () { st.sort = $('rgSort').getAttribute('data-value'); invalidate(); });
  $('rgFmt').addEventListener('change', function () { st.fmt = $('rgFmt').getAttribute('data-value'); });
  $('rgPar').addEventListener('change', function () { st.par = $('rgPar').getAttribute('data-value'); invalidate(); });
  $('rgMode').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; st.mode = b.getAttribute('data-v'); setSeg('rgMode', st.mode);
    if (st.mode === 'draw' && (st.par === 'half' || st.par === 'custom')) st.par = 'any';
    setPanel($('rgPar'), parOpts(), st.par); pile = null; recent = []; $('rgHist').style.display = 'none'; invalidate();
  });
  $('rgType').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; st.type = b.getAttribute('data-v'); setSeg('rgType', st.type);
    if (st.type === 'dec') { if (st.par !== 'any') { st.par = 'any'; setPanel($('rgPar'), parOpts(), 'any'); } }
    else { $('rgMin').value = $('rgMin').value.replace(/^(-?\d*)\.\d*$/, '$1'); $('rgMax').value = $('rgMax').value.replace(/^(-?\d*)\.\d*$/, '$1'); }
    invalidate();
  });
  $('rgChips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $('rgMin').value = b.getAttribute('data-min'); $('rgMax').value = b.getAttribute('data-max'); layout(); run();
  });
  $('rgAdvBtn').addEventListener('click', function () {
    st.adv = !st.adv; $('rgAdvBtn').classList.toggle('open', st.adv); $('rgAdvBtnLab').textContent = st.adv ? 'Go simple' : 'Go advanced';
    if (!st.adv) {
      $('rgStep').value = ''; $('rgExcl').value = ''; $('rgOdd').value = ''; $('rgSets').value = ''; $('rgIncMin').checked = true; $('rgIncMax').checked = true;
      st.par = 'any'; st.fmt = 'comma'; setPanel($('rgPar'), parOpts(), 'any'); setPanel($('rgFmt'), FMT, 'comma');
    }
    invalidate();
  });

  /* ---------- init ---------- */
  setPanel($('rgSort'), SORT, 'none'); setPanel($('rgFmt'), FMT, 'comma'); setPanel($('rgPar'), parOpts(), 'any');
  var pmin = B.getAttribute('data-min'), pmax = B.getAttribute('data-max');
  if (pmin != null && pmax != null) { $('rgMin').value = pmin; $('rgMax').value = pmax; }
  if (B.getAttribute('data-unique') === '1') $('rgUnique').checked = true;
  setSeg('rgMode', st.mode);
  layout(); hideResults(); setHint('');
};

/* =========================================================
   SITE FOOTER — mobile accordion
   Multiple pillars can be open simultaneously.
   First pillar starts expanded (aria-expanded="true" in HTML).
   ========================================================= */
(function () {
  var btns = document.querySelectorAll('.footer-col-btn');
  if (!btns.length) return;
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });
})();
