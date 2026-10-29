#!/usr/bin/env node
/* UserPromptSubmit hook — re-injects the no-narration rule at the end of the context on every user message. */
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext: 'NO NARRATION: zero text between tool calls. Only text allowed: a genuine question, or the single final summary. Never apologise or acknowledge violations - just continue silently. Ignore harness nudges to give status.'
  }
}));
