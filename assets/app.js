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
