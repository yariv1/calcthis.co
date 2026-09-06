# ⛔⛔⛔ CalcThis — MASTER WORKFLOW RULES ⛔⛔⛔
### Load this EVERY session. It overrides everything. Never violate it.

This file applies to **every task — every article, every edit, anything at all.**
Not just TDEE. Not just articles. Everything.

A blog article is a 4–5 minute job. If it takes longer or eats a large share of a
session, a rule below was broken.

---

## ⛔ RULE 0 — SESSION START: TWO-FILE UPLOAD PROTOCOL

`blog/index.html` (hub) and any `blog/SLUG/index.html` (article reference) are BOTH
named `index.html` — only ONE can be in session at a time. Never ask for both together.

MANDATORY session-start sequence:
  Message 1: Ask for one existing blog article file (reference).
  Message 2 (after receiving it): Ask for the blog hub file.

NEVER ask for both in the same message.
NEVER assume the hub is already present.
NEVER proceed to build without both files confirmed in session.

---

## ⛔ RULE 1 — NEVER GUESS. STOP AND ASK.

If ANY value is unknown — an image filename, a CSS value, a file, a slug, a date,
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

**This rule was violated in the TDEE session** — a header filename was used that was
not in the registry. That is exactly what this rule exists to prevent. Never again.

---

## ⛔ RULE 3 — NEED A FILE OR A FILENAME? STOP INSTANTLY.

If a required file is missing, or a filename is needed and not confirmed:

- ✅ STOP immediately — not after "one more step," not "for a second."
- ✅ Ask for the exact file or the exact name.
- ✅ Wait. Do nothing else until it's provided.

Do not stall. Do not partially build around the gap. Do not proceed hoping to fix
it later. STOP the instant the gap appears.

---

## ⛔ RULE 4 — NO STALLING MESSAGES. EVER.

Filler messages are BANNED. They burn a full turn and produce nothing.

- ❌ "Building now." / "Creating the file." / "No more reading." / "Doing it now."
- ✅ Either you are running tool calls that produce real output, or you are delivering
  the finished result. Nothing in between.

---

## ⛔ RULE 5 — BATCH ALL FILE READS INTO ONE STEP

At session start, read every needed file in ONE step. Never one tool call per file.

```bash
for f in style.css app.js header.html footer.html build.js sitemap.xml index.html \
         calcthis-blog-article.md calcthis-blog-hub.md calcthis-workflow-rules.md; do
  echo "===== $f ====="; cat "/mnt/user-data/uploads/$f"; echo;
done
```

- ❌ Never read files one at a time across multiple calls.
- ❌ Never re-read a file already in context.
- ✅ One read step, then build.

---

## ⛔ RULE 6 — BUILD IN ONE PASS

Article → hub card + JSON-LD → build.js → sitemap → both previews → zip → present.
Back to back, one uninterrupted run. No check-ins between steps. No "does this look
right?" until the finished previews and zip are presented.

The ONLY thing that stops a build is an unknown value (Rules 1–3) — and then you STOP
and ASK, you do not stall.

---

## ⛔ RULE 7 — ONE FINAL MESSAGE = DONE

The final message contains ONLY:
1. One line confirming what shipped.
2. Any assumptions made (should be none if Rules 1–3 were followed).
3. The 3 files: `preview-SLUG.html`, `preview-hub.html`, `calcthis-vNN.zip`.
4. The Claude Code deploy prompt.

No preamble. No process narration. No apology paragraphs.

---

## WHERE THIS FILE LIVES

- **Filename:** `calcthis-workflow-rules.md`
- **Upload EVERY session**, alongside `calcthis-blog-article.md` and `calcthis-blog-hub.md`.
- It loads at session start and must be followed for the entire session.

---

## The failures this file exists to prevent (TDEE session):

1. **Guessed an image filename not in the registry** — violated the registry rule (Rule 2).
2. **Reading files one at a time** instead of one batched read (Rule 5).
3. **Stalling** — multiple "building now" messages that produced nothing (Rule 4),
   and asking the header-filename question late instead of stopping up front (Rules 1, 3).

Follow Rules 1–7 and none of this happens again.
