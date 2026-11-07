#!/usr/bin/env node
/* SILENT-FIELD AUDIT (QA item 19): node md-files/qa/audit-silent.js <slug> [<slug> ...]
   For every visible text field (after opening Go advanced) it checks that typing a value changes something the user can see.
   ALONE   = from the empty page, typing only this field changes nothing visible (no result, no hint, no note) -> the user gets no feedback.
   CONTEXT = on a page filled to a valid result, clearing this field AND doubling its value both change nothing visible -> the field has no visible effect. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..') + '/';
const { serve, launch, viewport, load } = require('./run.js');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PAGE = `(function(){
  var vis=function(e){var r=e.getBoundingClientRect();var cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none';};
  window.__au={
    open:function(){[].forEach.call(document.querySelectorAll('.advbtn'),function(b){if(!b.classList.contains('open'))b.click();});},
    fields:function(){return [].filter.call(document.querySelectorAll('.card input[id]'),function(e){return /^(text|number|)$/.test(e.getAttribute('type')||'')&&vis(e)&&!/date|time|pick|search|type a/i.test(e.placeholder||'');}).map(function(e){return{id:e.id,ph:e.placeholder||'',val:e.value};});},
    snap:function(){var g=document.querySelector('.grid')||document.body;var t=g.innerText.replace(/\\s+/g,' ').trim();var m=document.getElementById('mbar');return t+'|'+(m?m.innerText.replace(/\\s+/g,' '):'');},
    set:function(id,v){var e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}
  };return 'ok';})()`;
function sample(ph) { const m = String(ph).replace(/,/g, '').match(/\d+(\.\d+)?/); return m ? m[0] : '12'; }
async function auditPage(c, base, slug) {
  const res = { slug, alone: [], context: [], fields: 0, err: null };
  await viewport(c, false); await load(c, base + '/' + slug + '/');
  await c.eval(PAGE); await c.eval('__au.open()'); await sleep(250);
  const fields = await c.eval('JSON.stringify(__au.fields())').then(JSON.parse); res.fields = fields.length;
  if (!fields.length) { res.err = 'no visible text fields'; return res; }
  const S0 = await c.eval('__au.snap()');
  for (const f of fields) {
    const v = sample(f.ph); await c.eval('__au.set(' + JSON.stringify(f.id) + ',' + JSON.stringify(v) + ')'); await sleep(120);
    const S1 = await c.eval('__au.snap()'); if (S1 === S0) res.alone.push(f.id + ' ("' + f.ph + '")');
    await c.eval('__au.set(' + JSON.stringify(f.id) + ',"")'); await sleep(60);
  }
  /* valid context: fill every field from its placeholder sample, then check a result appeared */
  for (const f of fields) await c.eval('__au.set(' + JSON.stringify(f.id) + ',' + JSON.stringify(sample(f.ph)) + ')');
  await sleep(300);
  const SF = await c.eval('__au.snap()');
  if (SF === S0) { res.err = 'filling every field from its placeholder changed nothing (no result reached) - context test skipped'; return res; }
  for (const f of fields) {
    const v = sample(f.ph), dbl = String(parseFloat(v) * 2 || 3);
    await c.eval('__au.set(' + JSON.stringify(f.id) + ',"")'); await sleep(120); const A = await c.eval('__au.snap()');
    await c.eval('__au.set(' + JSON.stringify(f.id) + ',' + JSON.stringify(dbl) + ')'); await sleep(120); const B = await c.eval('__au.snap()');
    await c.eval('__au.set(' + JSON.stringify(f.id) + ',' + JSON.stringify(v) + ')'); await sleep(60);
    if (A === SF && B === SF) res.context.push(f.id + ' ("' + f.ph + '")');
  }
  /* DEPENDENT: with X emptied the result is still showing, but changing Y changes nothing, while with X filled it does -> Y silently needs X */
  res.dep = [];
  for (const X of fields) {
    await c.eval('__au.set(' + JSON.stringify(X.id) + ',"")'); await sleep(150);
    const P0 = await c.eval('__au.snap()'); if (P0 === S0 || P0.length < SF.length * 0.5) { await c.eval('__au.set(' + JSON.stringify(X.id) + ',' + JSON.stringify(sample(X.ph)) + ')'); continue; }
    for (const Y of fields) {
      if (Y.id === X.id || res.context.some((z) => z.indexOf(Y.id + ' ') === 0)) continue;
      const v = sample(Y.ph);
      await c.eval('__au.set(' + JSON.stringify(Y.id) + ',"")'); await sleep(120); const Q0 = await c.eval('__au.snap()');
      await c.eval('__au.set(' + JSON.stringify(Y.id) + ',' + JSON.stringify(v) + ')'); await sleep(120); const Q1 = await c.eval('__au.snap()');
      if (Q1 === Q0 && Q0.length >= SF.length * 0.5) res.dep.push(Y.id + ' needs ' + X.id);
    }
    await c.eval('__au.set(' + JSON.stringify(X.id) + ',' + JSON.stringify(sample(X.ph)) + ')'); await sleep(100);
  }
  return res;
}
(async () => {
  const slugs = process.argv.slice(2); if (!slugs.length) { console.log('usage: node md-files/qa/audit-silent.js <slug> ...'); process.exit(2); }
  const { srv, port } = await serve(), ch = await launch(), base = 'http://127.0.0.1:' + port, out = [];
  try { for (const s of slugs) { try { out.push(await auditPage(ch.c, base, s)); } catch (e) { out.push({ slug: s, err: 'threw: ' + e.message, alone: [], context: [], fields: 0 }); } } }
  finally { try { ch.proc.kill(); } catch (e) { /* gone */ } srv.close(); }
  out.forEach((r) => console.log((r.context.length || (r.dep && r.dep.length) ? 'BUG  ' : (r.alone.length ? 'warn ' : 'ok   ')) + r.slug + '  fields ' + r.fields + (r.err ? '  [' + r.err + ']' : '') + (r.context.length ? '\n      CONTEXT-SILENT: ' + r.context.join(', ') : '') + (r.dep && r.dep.length ? '\n      DEPENDENT-SILENT: ' + r.dep.join('; ') : '') + (r.alone.length ? '\n      alone-silent: ' + r.alone.join(', ') : '')));
  process.exit(0);
})();
