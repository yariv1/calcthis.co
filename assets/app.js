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
  }
  // ---- auto year (footer copyright) ----
  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
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
        advOut.innerHTML = '<p class="res-tip">Pick a date to see how old you were — or will be — then.</p>';
      } else if (diffDays(dob, on) < 0) {
        advOut.innerHTML = '<p class="res-tip">That date is before your date of birth.</p>';
      } else {
        var rel = diffDays(today, on);
        advOut.innerHTML = '<p class="res-tip">On <strong>' + fmtD(on) + '</strong> you ' +
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
