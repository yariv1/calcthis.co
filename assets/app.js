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
