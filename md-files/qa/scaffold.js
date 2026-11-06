#!/usr/bin/env node
/* node md-files/qa/scaffold.js <slug> <bodyClass> <BLOCK1,BLOCK2> <resultBigId> <resultBodyId> <hintId>
   Opens the generated page in headless Chrome, lists every input / toggle / dropdown it found, and writes a fixture + oracle STARTER
   (md-files/qa/fixtures/<slug>.json, md-files/qa/oracles/<slug>.js) if they do not exist. The starters FAIL the gate until you fill them:
   the fixture needs `fill` steps that reach a valid result, `required` (fields whose bad value may end the result) and sample values for
   optional fields; the oracle must be an INDEPENDENT re-implementation of the maths (never call the page's own engine) comparing >= 100 runs. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..') + '/';
const { serve, launch, viewport, load } = require('./run.js');
(async () => {
  const [slug, bodyClass, blocks, big, body, hint] = process.argv.slice(2);
  if (!hint) { console.log('usage: node md-files/qa/scaffold.js <slug> <bodyClass e.g. p-xx> <BLOCK[,BLOCK]> <bigId> <bodyId> <hintId>'); process.exit(2); }
  const { srv, port } = await serve(), ch = await launch();
  try {
    await viewport(ch.c, false); await load(ch.c, 'http://127.0.0.1:' + port + '/' + slug + '/');
    await ch.c.eval(fs.readFileSync(ROOT + 'md-files/qa/page-harness.js', 'utf8'));
    await ch.c.eval('__qa.init({result:{big:' + JSON.stringify(big) + ',body:' + JSON.stringify(body) + ',hint:' + JSON.stringify(hint) + '}},false)');
    const d = await ch.c.eval('__qa.discover()');
    console.log('Found text inputs: ' + d.texts.join(', ') + '\nSegments: ' + JSON.stringify(d.segs) + '\nDropdowns: ' + JSON.stringify(d.csels) + '\nChips: ' + d.chips.join(', ') + '\nAdvanced buttons: ' + d.adv.join(', '));
    const fx = path.join(ROOT, 'md-files/qa/fixtures/' + slug + '.json'), orc = path.join(ROOT, 'md-files/qa/oracles/' + slug + '.js');
    if (!fs.existsSync(fx)) { fs.writeFileSync(fx, JSON.stringify({ slug, bodyClass, blocks: blocks.split(','), result: { big, body, hint }, required: [], fill: [], optionalSamples: {}, variants: [], scrollTo: '', errorState: [], _todo: 'fill: steps that reach a valid result (set EVERY segment to its default too); required: text fields whose bad value may end the result; optionalSamples: valid values typed key by key into optional fields; variants: steps that reveal hidden fields' }, null, 2) + '\n'); console.log('wrote starter ' + path.relative(ROOT, fx)); }
    if (!fs.existsSync(orc)) { fs.writeFileSync(orc, "/* ORACLE for " + slug + ": an INDEPENDENT re-implementation of the maths (never call CalcThis.*Engine). Drive the real inputs with ctx.set/ctx.seg/ctx.click,\n   read what the page DISPLAYS with ctx.text, compare with your own numbers over >= 100 random runs (units, modes, edges). ctx.fill() resets to the fixture's valid state. */\nmodule.exports = async function (ctx) {\n  const fails = []; let runs = 0;\n  // TODO: loop >= 100 random valid inputs, compute the expected numbers yourself, compare with ctx.text(...), push mismatches to fails\n  return { runs, fails };\n};\n"); console.log('wrote starter ' + path.relative(ROOT, orc)); }
  } finally { try { ch.proc.kill(); } catch (e) { /* gone */ } srv.close(); }
  process.exit(0);
})();
