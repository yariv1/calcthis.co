# ⛔⛔⛔ CalcThis — MASTER WORKFLOW RULES ⛔⛔⛔
### Load this EVERY session. It overrides everything. Never violate it.

This file applies to **every task — every article, every calculator, every edit, anything at all.**

A blog article is a 4–5 minute job. If it takes longer or eats a large share of a
session, a rule below was broken.

---

## ⛔ RULE 1 — NEVER GUESS. STOP AND ASK.

If ANY value is unknown — an image filename, a CSS value, a slug, a date,
anything at all — **STOP IMMEDIATELY and ask.**

- ❌ Do NOT guess.
- ❌ Do NOT estimate.
- ❌ Do NOT reconstruct from memory.
- ❌ Do NOT infer a filename from a "pattern."
- ✅ STOP. ASK. WAIT for the answer.

If in doubt → STOP → ASK. Every single time. No exceptions.

---

## ⛔ RULE 2 — THE IMAGE NAME REGISTRY IS LAW

The master image registry in `calcthis-blog-hub.md` is the ONLY source of truth for
image filenames. This rule exists specifically to prevent using a wrong filename.

- ✅ If a filename IS in the registry → use it exactly, character for character.
- ⛔ If a filename is NOT in the registry → **STOP AND ASK.** Do not invent it.
  Do not adapt another name. Do not follow a "naming pattern." STOP AND ASK.
- ✅ The moment a new image name is confirmed by the user, add it to the registry
  in `calcthis-blog-hub.md` in the SAME step, before any HTML is written.

---

## ⛔ RULE 3 — NEED A FILE OR A FILENAME? STOP INSTANTLY.

If a required file is missing or unreadable, or a filename is needed and not confirmed:

- ✅ STOP immediately — not after "one more step," not "for a second."
- ✅ Ask for the exact file or the exact name.
- ✅ Wait. Do nothing else until it's provided or resolved.

Do not stall. Do not partially build around the gap. Do not proceed hoping to fix
it later. STOP the instant the gap appears.

---

## ⛔ RULE 4 — NO STALLING MESSAGES. EVER. NO NARRATION. EVER.

Filler messages are BANNED. They burn a full turn and produce nothing.

- ❌ "Building now." / "Creating the file." / "No more reading." / "Doing it now."
- ✅ Either you are running tool calls that produce real output, or you are delivering
  the finished result. Nothing in between.

**No narration of moves, ever — this is the same rule, not a separate one.** No "reading
files now," "let me check X," "now writing the CSS," "verifying Y" between tool calls, even
during a long multi-step build (calculator, article, QA pass). Work silently. The ONLY text
that belongs mid-task is a genuine question needing the user's input to proceed. Everything
else — narration, progress updates, "thinking out loud" — is a Rule 4 violation exactly like
a stalling message, because it produces the same thing: text instead of either a real tool
call or the finished result. This has been violated repeatedly (2026-09-13 session, called
out twice by the user in the same session) — it is not a soft preference, treat it with the
same weight as every other ⛔ rule in this file.

## ⛔ RULE 4.5 — A MULTI-STEP DELIVERABLE ISN'T DONE UNTIL EVERY PART OF IT SHIPS IN THE SAME REPLY

When a task has multiple required deliverables (e.g. a blog article = article HTML + image
prompts + clickable preview links, per `calcthis-blog-article.md`), getting pulled into deep
verification or QA on one part (unit-toggle checks, debugging a chart, etc.) is not a reason
to stop before the others ship. Before sending the final message, re-read the workflow's own
checklist and confirm every item is actually present in THIS reply — not "I'll do it next
turn," not silently skipped because attention drifted to a sub-task. QA and verification are
means to a correct, presentable result — they are never themselves a stopping point.

---

## ⛔ RULE 5 — BATCH ALL FILE READS INTO ONE STEP

At session start, read every needed file in ONE step. Never one file per call.

```bash
cat assets/style.css assets/app.js partials/header.html partials/footer.html build.js sitemap.xml
```

- ❌ Never read files one at a time across multiple calls.
- ❌ Never re-read a file already in context.
- ✅ One read step, then build.

---

## ⛔ RULE 6 — BUILD IN ONE PASS

All changes → preview → present.
Back to back, one uninterrupted run. No check-ins between steps. No "does this look
right?" until the finished preview is presented.

The ONLY thing that stops a build is an unknown value (Rules 1–3) — and then you STOP
and ASK, you do not stall.

---

## ⛔ RULE 7 — ONE FINAL MESSAGE = DONE

The final message contains ONLY:
1. One line confirming what shipped.
2. Any assumptions made (should be none if Rules 1–3 were followed).
3. Preview file(s) for approval.

No preamble. No process narration. No apology paragraphs.

### Preview approval ≠ deploy approval

- "Looks good" on the preview means the BUILD is right. It does NOT authorize a push.
- The user previews in their own Chrome first. `node build.js` + commit + **push to main**
  only happen after an explicit "deploy" / "push" / "ship it" in a later message.
- `git push` to `main` = the live deploy (host auto-builds). Treat it as a separate, gated step.
- After the deploy: update CLAUDE.md + nav/footer/roadmap skill files.

---

## ⛔ RULE 8 — EVERY CALCULATOR MUST BEAT THE COMPETITION BY ONE CLEAR THING

Before writing code: research the top-ranking calculators for the keyword, then decide the
**one** thing we do better — usually a live visual aid (bar / gauge / marker / diagram) and/or
a genuinely useful extra output. Power-user depth goes behind **Go advanced**; the default
view stays minimal. No bloat — nothing ships "just in case".
Full checklist: `calcthis-design-system.md` → "PRODUCT PHILOSOPHY".

## RULE 9 — PREVIEW IS SERVED, AND SHOWN BOTH WAYS

End every build by: (1) `preview_start` `calcthis-static` + open `http://localhost:8123/<slug>/`
in the browser pane and verify it works, (2) give the user the localhost + `<LAN-IP>:8123`
Chrome links in the final message. Details: `calcthis-working-rules.md` → "Previews".

## The failures these rules exist to prevent:

1. **Guessed an image filename not in the registry** — violated the registry rule (Rule 2).
2. **Reading files one at a time** instead of one batched read (Rule 5).
3. **Stalling** — multiple "building now" messages that produced nothing (Rule 4),
   and asking questions late instead of stopping up front (Rules 1, 3).
4. **Narrating moves during a build** ("reading files now," "let me verify X") instead of
   working silently — Rule 4, called out twice in one session (2026-09-13).
5. **Shipping a partial deliverable** — building the article/calculator and running QA, but
   not circling back to send the image prompts and clickable preview links in the same
   reply — Rule 4.5, same session.

Follow Rules 1–9 (4 and 4.5 especially) and none of this happens again.
