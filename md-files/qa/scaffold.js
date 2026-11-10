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
    { /* FINAL GATE (md-files/qa/final.js): every new calculator is listed in gate2.json and gets a starter text/extremes/visual script */
      const g2 = path.join(ROOT, 'md-files/qa/gate2.json'); let g = []; try { g = JSON.parse(fs.readFileSync(g2, 'utf8')); } catch (e) { /* new file */ }
      if (g.indexOf(slug) < 0) { g.push(slug); fs.writeFileSync(g2, JSON.stringify(g, null, 1) + '\n'); console.log('added ' + slug + ' to md-files/qa/gate2.json: write md-files/qa/text/' + slug + '.js, md-files/qa/sidebyside/' + slug + '.json, then node md-files/qa/final.js ' + slug); }
      const tx = path.join(ROOT, 'md-files/qa/text/' + slug + '.js');
      if (!fs.existsSync(tx)) { fs.mkdirSync(path.dirname(tx), { recursive: true }); fs.writeFileSync(tx, '/* FINAL GATE script for ' + slug + ': return { fails, cats: { textVsTool, extremes, visual }, runs }. See md-files/qa/final.js. textVsTool = every number in the page text re-derived by driving the tool; extremes = min/max/odd values vs an independent reference; visual = what is drawn, re-measured from the DOM. Each category >= 5 checks per viewport. */\nmodule.exports = async function (ctx) { return { fails: [\'TODO write the checks\'], cats: {}, runs: 0 }; };\n'); console.log('wrote starter ' + path.relative(ROOT, tx)); }
    }
    const pf = path.join(ROOT, 'md-files/qa/parity/' + slug + '.json');
    if (!fs.existsSync(pf)) { fs.mkdirSync(path.dirname(pf), { recursive: true }); fs.writeFileSync(pf, JSON.stringify({ slug, research: 'md-files/calcthis-' + slug + '-research.md', competitors: [{ name: '', url: '', openedLive: false, date: '', inputs: [] }], features: [], _todo: 'open EVERY competitor live, list EVERY input/mode/output as a string, then one feature per group: covers = ["Name: input", ...], status match|exceed|dropped, ids = page element ids; dropped needs signoff {quote, date} in his own words. See md-files/qa/parity.js' }, null, 2) + '\n'); console.log('wrote starter ' + path.relative(ROOT, pf)); }
  } finally { try { ch.proc.kill(); } catch (e) { /* gone */ } srv.close(); }
  process.exit(0);
})();
