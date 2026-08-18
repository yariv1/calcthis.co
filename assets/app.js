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
  var sex = 'male', unit = 'cm', advanced = false;

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

  var hf0 = $('hipFld'); if (hf0) hf0.style.display = 'none';

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
  var sex = 'male', unit = 'cm', advanced = false;

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
