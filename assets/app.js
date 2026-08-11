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

/* ---- shared volume/aggregate calculator engine (Fix B) ----
   Powers the identical-engine calcs: gravel, sand, topsoil.
   Each page supplies only its material map, labels and default:
     CalcThis.initVolumeCalc({ defaultMat, mat:{key:tonsPerYd3,...}, matLabel:{key:'Label',...} });
   Every tally row remains a frozen snapshot taken at add time — changing any
   live input afterwards never rewrites a locked row. */
window.CalcThis = window.CalcThis || {};
CalcThis.initVolumeCalc = function(cfg){

  var sys='us', shape='rect', mode='ton', matKey=cfg.defaultMat;
  var $=function(id){return document.getElementById(id)};
  var len=$('len'), wid=$('wid'), dia=$('dia'), depth=$('depth'),
      price=$('price'), bagSize=$('bagSize'), customDens=$('customDens'), matSel=$('matSel');
  var tally=[];                     // each: {label, volYd3, volM3, tons, tonnes}
  var waste={active:false,pct:''};  // project-level buffer
  var customDensUS=null;            // stored internally as tons/yd³

  // constants
  var M3_PER_YD3=0.764554858;
  var DENS_US_TO_METRIC=1.186552;   // tons/yd³ -> tonnes/m³
  var MAT=cfg.mat;
  var MATLABEL=cfg.matLabel;

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
    if(matKey==='custom') return customDensUS;   // may be null
    return MAT[matKey];
  }
  function bagVol(){ // in current system's volume unit for area volume (ft³ for US, m³ for metric)
    if(sys==='us'){ var b=parseNum(bagSize.value); return (isNaN(b)||b<=0)?0.5:b; }        // ft³
    var l=parseNum(bagSize.value); return ((isNaN(l)||l<=0)?25:l)/1000;                     // litres -> m³
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
    if(mode==='ton' && densityUS()==null) m.push('material density');
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
    var sub = (w2==null)? '' : '= '+fmt(w2*mlt)+' '+weightUnit();
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
    var g={bagQ:0,bagHas:false,volQ:0,volHas:false,tonQ:0,tonHas:false,tonNull:false,cost:0,hasCost:false};
    tally.forEach(function(r){
      if(r.mode==='bag'){ g.bagQ+=itemQty(r); g.bagHas=true; }
      else if(r.mode==='ton'){ var t=itemQty(r); if(t==null){g.tonNull=true;} else {g.tonQ+=t;} g.tonHas=true; }
      else { g.volQ+=itemQty(r); g.volHas=true; }
      var c=itemCost(r); if(c!=null){ g.cost+=c; g.hasCost=true; }
    });
    return g;
  }
  function amountParts(bagQ,volQ,tonQ,g){
    var p=[];
    if(g.tonHas) p.push({num:tonQ, unit:tonWord()});
    if(g.volHas) p.push({num:volQ, unit:volUnitNow()});
    if(g.bagHas) p.push({num:bagQ, unit:bagWord(bagQ)});
    return p;
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
      body.innerHTML='<div class="tally-empty">Covering more than one area? Add each above and they\u2019ll total here.</div>';
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
        var wparts=[];
        if(g.tonHas && wTon>0) wparts.push({num:wTon,unit:tonWord()});
        if(g.volHas && wVol>0) wparts.push({num:wVol,unit:volUnitNow()});
        if(g.bagHas && wBag>0) wparts.push({num:wBag,unit:bagWord(wBag)});
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
    $('mLab').textContent='This area';
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
    if(matKey==='custom'){ customDens.value=''; customDensUS=null; }
    [].forEach.call($('depthChips').children,function(c){c.classList.remove('on')});
    // labels
    var du=sys==='us'?'ft':'m', pu=sys==='us'?'in':'cm', bu=sys==='us'?'ft³':'L';
    [].forEach.call(document.querySelectorAll('[data-dim]'),function(el){el.textContent=du});
    [].forEach.call(document.querySelectorAll('[data-depth]'),function(el){el.textContent=pu});
    [].forEach.call(document.querySelectorAll('[data-bagu]'),function(el){el.textContent=bu});
    // depth chips
    var chipVals = sys==='us'?['2','3','4','6']:['5','8','10','15'];
    var chipTxt  = sys==='us'?['2"','3"','4"','6"']:['5 cm','8 cm','10 cm','15 cm'];
    [].forEach.call($('depthChips').children,function(c,i){ c.dataset.d=chipVals[i]; c.textContent=chipTxt[i]; });
    depth.placeholder = sys==='us'?'e.g. 3':'e.g. 8';
    bagSize.placeholder = sys==='us'?'0.5':'25';
    customDens.placeholder = sys==='us'?'e.g. 1.5':'e.g. 1.8';
    $('customSuf').textContent = sys==='us'?'t/yd³':'t/m³';
    updateModeLabels();
    renderAll();
  });

  // material select
  matSel.addEventListener('change',function(){
    matKey=this.value;
    $('customWrap').style.display = matKey==='custom'?'block':'none';
    if(matKey!=='custom'){ customDensUS=null; }
    renderAll();
  });
  customDens.addEventListener('input',function(){
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

};
