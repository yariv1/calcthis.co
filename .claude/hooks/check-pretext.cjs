#!/usr/bin/env node
/* PreToolUse hook (all tools) - stops narration AT THE SOURCE without ever causing a duplicate final message.
 *
 * Why: the old Stop hook blocked a turn that had mid-task text and forced the whole final summary to be written AGAIN (the user saw every answer twice).
 * Now: if the assistant text sitting directly before this tool call is not a genuine question, the TOOL CALL is denied with a short reason, so the text is
 * never followed by work; the next attempt is a tool call without text. The Stop hook (check-narration.cjs) no longer blocks, so no turn is ever re-sent.
 */
const fs = require('fs');
let input = ''; try { input = fs.readFileSync(0, 'utf8'); } catch (e) { process.exit(0); }
let p; try { p = JSON.parse(input); } catch (e) { process.exit(0); }
const tp = p.transcript_path; if (!tp || !fs.existsSync(tp)) process.exit(0);
let lines; try { lines = fs.readFileSync(tp, 'utf8').trim().split('\n'); } catch (e) { process.exit(0); }
const entries = []; for (const l of lines) { if (!l) continue; try { entries.push(JSON.parse(l)); } catch (e) { /* skip */ } }
const bad = [];
for (let i = entries.length - 1; i >= 0; i--) {
  const e = entries[i];
  if (!(e.type === 'assistant' && e.message && e.message.role === 'assistant')) break; /* stop at the previous user / tool_result entry */
  for (const b of (e.message.content || [])) {
    if (b.type !== 'text') continue;
    const t = (b.text || '').trim(); if (!t || t.endsWith('?')) continue;
    bad.push(t.length > 120 ? t.slice(0, 120) + '...' : t);
  }
}
if (bad.length) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'NO TEXT BEFORE TOOL CALLS (CLAUDE.md rule 1). Text before this call: "' + bad.join(' | ') + '". Call the tool again with NO text before it. Write only ONE final message at the very end. Do not mention this denial.' } }));
}
process.exit(0);
