#!/usr/bin/env node
/* Stop hook — enforces CLAUDE.md's "no narration" hard rule mechanically.
 *
 * Text-generation itself can't be intercepted before it's shown — hooks only
 * fire around tool calls and turn lifecycle events. So this can't hide a
 * narration line the instant it's typed. What it CAN do: at the end of every
 * turn, re-read the transcript, and if any assistant text block was sent
 * BEFORE the final message and isn't a genuine question, block the Stop
 * event. That forces the turn to continue instead of ending cleanly, with
 * the violation fed back as the reason — so it's caught and corrected every
 * single time, not just when the user happens to be watching.
 */
const fs = require('fs');

let input = '';
try { input = fs.readFileSync(0, 'utf8'); } catch (e) { process.exit(0); }

let payload;
try { payload = JSON.parse(input); } catch (e) { process.exit(0); }

const transcriptPath = payload.transcript_path;
if (!transcriptPath || !fs.existsSync(transcriptPath)) process.exit(0);

let lines;
try { lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n'); }
catch (e) { process.exit(0); }

const entries = [];
for (const line of lines) {
  if (!line) continue;
  try { entries.push(JSON.parse(line)); } catch (e) { /* skip malformed line */ }
}

// Find the start of the current turn: the most recent real user message
// (a typed message, not a tool_result-only entry).
let turnStart = -1;
for (let i = entries.length - 1; i >= 0; i--) {
  const e = entries[i];
  if (e.type === 'user' && e.message && e.message.role === 'user') {
    const content = e.message.content;
    const isRealUserText = Array.isArray(content)
      ? content.some(function (c) { return c.type === 'text'; })
      : typeof content === 'string';
    if (isRealUserText) { turnStart = i; break; }
  }
}
if (turnStart === -1) process.exit(0);

const assistantEntries = entries.slice(turnStart + 1).filter(function (e) {
  return e.type === 'assistant' && e.message && e.message.role === 'assistant';
});
if (assistantEntries.length < 2) process.exit(0); // nothing "mid-task" if only one message

const earlier = assistantEntries.slice(0, -1); // exclude the final message

const violations = [];
for (const entry of earlier) {
  const content = entry.message.content || [];
  for (const block of content) {
    if (block.type !== 'text') continue;
    const text = (block.text || '').trim();
    if (!text) continue;
    if (text.endsWith('?')) continue; // a genuine question is allowed mid-task
    violations.push(text.length > 160 ? text.slice(0, 160) + '…' : text);
  }
}

if (violations.length) {
  const out = {
    decision: 'block',
    reason:
      'NO-NARRATION RULE VIOLATION (CLAUDE.md hard rule #1, top of the file): the ' +
      'following assistant text was sent mid-task, before the final message, and is ' +
      'not a question:\n' +
      violations.map(function (v) { return '  - "' + v + '"'; }).join('\n') +
      '\nThe user has called this out repeatedly and explicitly asked for automatic ' +
      'enforcement that does not depend on them watching the screen. Acknowledge this ' +
      'specific violation to the user in one short line, then continue with zero ' +
      'narration for the rest of the session: tool calls back to back, a genuine ' +
      'question, or the final summary — nothing else.'
  };
  process.stdout.write(JSON.stringify(out));
}
process.exit(0);
