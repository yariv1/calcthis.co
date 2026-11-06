#!/usr/bin/env node
/* The CalcThis calculator QA gate. Usage: node md-files/qa/run.js <slug> [<slug> ...]
   Starts a static server, drives the real page in headless Chrome (mobile 375x812 AND desktop) with md-files/qa/page-harness.js
   and the page's oracle (md-files/qa/oracles/<slug>.js, an independent re-implementation of the maths), takes screenshots of every
   state, and writes md-files/qa-passes/<slug>.json. build.js and the Stop hook refuse to ship a page without a valid pass record.
   No npm dependencies: Chrome DevTools Protocol over Node's built-in WebSocket. */
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '../..') + '/';
const H = require('./hash.js');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter((p) => fs.existsSync(p))[0];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'text/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function serve() {
  return new Promise((res) => {
    const srv = http.createServer((q, s) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.normalize(path.join(ROOT, p));
      if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end('nf'); }
      s.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
    }).listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.cb = {}; this.ev = []; ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && this.cb[d.id]) { this.cb[d.id](d); delete this.cb[d.id]; } else if (d.method) this.ev.push(d); }); }
  send(method, params) { return new Promise((res, rej) => { const id = ++this.id; this.cb[id] = (d) => d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result); this.ws.send(JSON.stringify({ id, method, params: params || {} })); }); }
  async eval(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: 120000 }); if (r.exceptionDetails) throw new Error('page: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; }
  async waitEvent(name, ms) { const t0 = Date.now(); while (Date.now() - t0 < (ms || 15000)) { const i = this.ev.findIndex((e) => e.method === name); if (i >= 0) { this.ev.splice(i, 1); return true; } await sleep(30); } return false; }
}

async function launch() {
  if (!CHROME) throw new Error('no Chrome/Edge found');
  const port = 9300 + Math.floor(Math.random() * 500), dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-chrome-'));
  const proc = cp.spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + dir, '--no-first-run', '--disable-gpu', '--hide-scrollbars', '--disable-extensions', 'about:blank'], { stdio: 'ignore' });
  let list = null;
  for (let i = 0; i < 100 && !list; i++) { await sleep(150); try { const r = await fetch('http://127.0.0.1:' + port + '/json'); const j = await r.json(); list = j.filter((t) => t.type === 'page')[0]; } catch (e) { /* not up yet */ } }
  if (!list) { proc.kill(); throw new Error('Chrome did not start'); }
  const ws = new WebSocket(list.webSocketDebuggerUrl); await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
  const c = new CDP(ws); await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Log.enable');
  return { c, proc, dir };
}

async function viewport(c, mobile) {
  if (mobile) await c.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  else await c.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
}
async function load(c, url) { c.ev.length = 0; await c.send('Page.navigate', { url }); await c.waitEvent('Page.loadEventFired', 20000); await sleep(600); }
function consoleErrors(c) {
  const out = [];
  c.ev.forEach((e) => {
    if (e.method === 'Runtime.exceptionThrown') out.push('exception: ' + ((e.params.exceptionDetails.exception || {}).description || e.params.exceptionDetails.text).slice(0, 200));
    else if (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error') out.push('console.error: ' + e.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 200));
    else if (e.method === 'Log.entryAdded' && e.params.entry.level === 'error' && !/favicon|fonts\.g/.test(e.params.entry.url || '') && !/favicon|fonts\.g|report-only Content Security Policy/.test(e.params.entry.text || '')) out.push('log: ' + e.params.entry.text.slice(0, 200) + ' ' + (e.params.entry.url || ''));
  });
  return out;
}
async function shot(c, file) { const r = await c.send('Page.captureScreenshot', { format: 'png' }); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(r.data, 'base64')); }

async function runSlug(slug, base, chrome) {
  const hh = H.pageHash(ROOT, slug); if (!hh) throw new Error('no fixture for ' + slug);
  const fx = hh.fixture, c = chrome.c, harness = fs.readFileSync(ROOT + 'md-files/qa/page-harness.js', 'utf8');
  const rec = { slug, pass: false, at: new Date().toISOString(), hash: hh.hash, viewports: {}, oracle: null, shots: [], console: [] };
  const shotDir = 'md-files/qa-passes/shots/';
  for (const mobile of [true, false]) {
    const vp = mobile ? 'mobile' : 'desktop', fails = [];
    await viewport(c, mobile); await load(c, base + '/' + slug + '/');
    await c.eval(harness); await c.eval('__qa.init(' + JSON.stringify(fx) + ',' + mobile + ')');
    const step = async (name, js) => { try { await c.eval(js); } catch (e) { fails.push(name + ' threw: ' + e.message); } };
    await step('start', '__qa.start()');
    await shot(c, ROOT + shotDir + slug + '-1-empty-' + vp + '.png'); rec.shots.push(shotDir + slug + '-1-empty-' + vp + '.png');
    await step('fill', '__qa.fill()');
    await c.eval('window.scrollTo(0,0)');
    await shot(c, ROOT + shotDir + slug + '-2-filled-' + vp + '.png'); rec.shots.push(shotDir + slug + '-2-filled-' + vp + '.png');
    if (fx.scrollTo) { await c.eval('document.getElementById(' + JSON.stringify(fx.scrollTo) + ').scrollIntoView()'); await sleep(150); }
    await shot(c, ROOT + shotDir + slug + '-3-result-' + vp + '.png'); rec.shots.push(shotDir + slug + '-3-result-' + vp + '.png');
    await step('progressive', '__qa.progressive()');
    await step('required', '__qa.required()');
    await step('controls', '__qa.controls()');
    await c.eval('(function(){var a=document.querySelector(".advbtn");if(a&&!/Go simple/.test(a.textContent))a.click()})()');
    await c.eval('__qa.fillReset()'); await c.eval('window.scrollTo(0,0)');
    await shot(c, ROOT + shotDir + slug + '-4-advanced-' + vp + '.png'); rec.shots.push(shotDir + slug + '-4-advanced-' + vp + '.png');
    if (fx.errorState) { await c.eval('__qa.apply(' + JSON.stringify(fx.errorState) + ')'); await c.eval('document.getElementById(' + JSON.stringify(fx.errorState[0][1]) + ').scrollIntoView({block:"center"})'); await sleep(150); }
    await shot(c, ROOT + shotDir + slug + '-5-error-' + vp + '.png'); rec.shots.push(shotDir + slug + '-5-error-' + vp + '.png');
    await c.eval('__qa.fillReset()');
    for (let i = 0; i < 6; i++) await step('chaos', '__qa.chaos(100,' + (1000 + i * 77 + (mobile ? 1 : 0)) + ')');
    await c.eval('__qa.fillReset()');
    await step('scroll', '__qa.scroll()');
    await shot(c, ROOT + shotDir + slug + '-6-after-chaos-' + vp + '.png'); rec.shots.push(shotDir + slug + '-6-after-chaos-' + vp + '.png');
    const rep = await c.eval('__qa.report()');
    const ce = consoleErrors(c);
    rec.console = rec.console.concat(ce.map((x) => vp + ' ' + x));
    rec.viewports[vp] = { steps: rep.steps, fails: fails.concat(rep.fails) };
  }
  /* oracle: independent maths, on the desktop page */
  const of = ROOT + 'md-files/qa/oracles/' + slug + '.js';
  await viewport(c, false); await load(c, base + '/' + slug + '/'); await c.eval(harness); await c.eval('__qa.init(' + JSON.stringify(fx) + ',false)');
  if (fs.existsSync(of)) {
    const ctx = { set: (id, v) => c.eval('__qa.set(' + JSON.stringify(id) + ',' + JSON.stringify(String(v)) + ')'), seg: (id, v) => c.eval('__qa.seg(' + JSON.stringify(id) + ',' + JSON.stringify(String(v)) + ')'), text: (id) => c.eval('__qa.text(' + JSON.stringify(id) + ')'), val: (id) => c.eval('__qa.val(' + JSON.stringify(id) + ')'), click: (id) => c.eval('__qa.click(' + JSON.stringify(id) + ')'), eval: (e) => c.eval(e), fill: () => c.eval('__qa.fillReset()') };
    try { rec.oracle = await require(of)(ctx); } catch (e) { rec.oracle = { runs: 0, fails: ['oracle threw: ' + e.message] }; }
  } else rec.oracle = { runs: 0, fails: ['no oracle md-files/qa/oracles/' + slug + '.js - every calculator needs an independent re-implementation of its maths'] };
  if (!(rec.oracle.runs >= 100)) rec.oracle.fails.push('the oracle must compare at least 100 random runs (did ' + rec.oracle.runs + ')');
  const allFails = [].concat(rec.viewports.mobile.fails, rec.viewports.desktop.fails, rec.oracle.fails, rec.console);
  rec.pass = allFails.length === 0;
  fs.mkdirSync(ROOT + 'md-files/qa-passes', { recursive: true });
  fs.writeFileSync(ROOT + 'md-files/qa-passes/' + slug + '.json', JSON.stringify(rec, null, 1));
  return { rec, allFails };
}

module.exports = { serve, launch, viewport, load, CDP, shot };
if (require.main === module) (async () => {
  const slugs = process.argv.slice(2); if (!slugs.length) { console.log('usage: node md-files/qa/run.js <slug> ...'); process.exit(2); }
  const { srv, port } = await serve(); const chrome = await launch(); let bad = 0;
  try {
    for (const slug of slugs) {
      const { rec, allFails } = await runSlug(slug, 'http://127.0.0.1:' + port, chrome);
      console.log((rec.pass ? 'QA PASS ' : 'QA FAIL ') + slug + '  mobile steps ' + rec.viewports.mobile.steps + ', desktop steps ' + rec.viewports.desktop.steps + ', oracle runs ' + rec.oracle.runs + ', screenshots ' + rec.shots.length);
      allFails.slice(0, 40).forEach((f) => console.log('   - ' + f)); if (allFails.length > 40) console.log('   ... ' + (allFails.length - 40) + ' more'); if (!rec.pass) bad++;
      if (rec.pass) console.log('   Now LOOK at the screenshots in md-files/qa-passes/shots/' + slug + '-* before presenting (desktop AND mobile).');
    }
  } finally { try { chrome.proc.kill(); } catch (e) { /* gone */ } srv.close(); try { fs.rmSync(chrome.dir, { recursive: true, force: true }); } catch (e) { /* locked */ } }
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error('QA runner error: ' + e.message); process.exit(2); });
