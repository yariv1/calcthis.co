#!/usr/bin/env node
/* QA gate hook (2026-11-06). Enforces CLAUDE.md "full QA and debugging BEFORE handoff" mechanically.
 *  - Stop: if the final message hands the user a localhost preview link of a calculator page that has no VALID QA pass
 *    (md-files/qa-passes/<slug>.json, bound to a content hash), the turn is blocked and must continue.
 *  - PreToolUse (Bash): `git commit` / `git push` / a real `node build.js` is denied while any gated calculator page lacks a valid pass.
 * A pass is only produced by `node md-files/qa/run.js <slug>` (headless Chrome, 375px + desktop, key-by-key typing, chaos, oracle, screenshots). */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..') + '/';
let QA; try { QA = require(path.join(ROOT, 'md-files/qa/hash.js')); } catch (e) { process.exit(0); }
let payload; try { payload = JSON.parse(fs.readFileSync(0, 'utf8')); } catch (e) { process.exit(0); }
const gated = (() => { try { return QA.gated(ROOT); } catch (e) { return []; } })();
const problems = (slugs) => slugs.filter((s) => gated.indexOf(s) >= 0).map((s) => { const r = QA.check(ROOT, s); return r.ok ? null : s + ': ' + r.why; }).filter(Boolean);

if (payload.hook_event_name === 'PreToolUse') {
  const cmd = ((payload.tool_input || {}).command || '');
  if (payload.tool_name !== 'Bash' || !/(^|[;&|\s])(git\s+(commit|push)|node\s+build\.js)(\s|$)/.test(cmd)) process.exit(0);
  const p = problems(gated);
  if (p.length) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'CALCULATOR QA GATE: commit/push/build is blocked until every new calculator has a valid QA pass.\n' + p.map((x) => '  - ' + x).join('\n') + '\nRun node md-files/qa/run.js <slug> (must print QA PASS), look at the screenshots, then retry. Do not narrate; do not apologise.' } }));
  }
  process.exit(0);
}

/* Stop */
const tp = payload.transcript_path; if (!tp || !fs.existsSync(tp)) process.exit(0);
let entries = []; try { entries = fs.readFileSync(tp, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean); } catch (e) { process.exit(0); }
let last = null;
for (let i = entries.length - 1; i >= 0; i--) { const e = entries[i]; if (e.type === 'assistant' && e.message && Array.isArray(e.message.content) && e.message.content.some((c) => c.type === 'text' && (c.text || '').trim())) { last = e; break; } }
if (!last) process.exit(0);
const text = last.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
const slugs = []; for (const m of text.matchAll(/(?:localhost|127\.0\.0\.1|10\.0\.0\.19):\d+\/([a-z0-9][a-z0-9\/-]*?)\/?(?=[\s)\]>"'`]|$)/gi)) { const s = m[1].replace(/\/$/, ''); if (slugs.indexOf(s) < 0) slugs.push(s); }
const p = problems(slugs);
if (p.length) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason: 'CALCULATOR QA GATE (CLAUDE.md hard rule): the final message presents a preview link for a calculator that has NO valid QA pass:\n' + p.map((x) => '  - ' + x).join('\n') + '\nRun node md-files/qa/run.js <slug> until it prints QA PASS, LOOK at the screenshots (desktop and mobile), fix anything wrong, and only then present the preview. Do NOT apologise or narrate - continue with tool calls.' }));
}
process.exit(0);
