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
out twice by the user in the same session, and again 2026-09-14) — it is not a soft
preference, treat it with the same weight as every other ⛔ rule in this file. It is also
now the very first hard rule at the top of `CLAUDE.md` — check it there every response, not
just here, since memory recall alone has already failed to prevent repeat violations.

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

## ⛔ RULE 8.5 — NEVER SHIP WITH FEWER INPUTS THAN COMPETITORS. VERIFY BY SCREENSHOT, NOT TEXT-FETCH ALONE.

This exists after the Protein Intake Calculator shipped **without Age or Sex** even though the
research step had already found — and reported — that calculator.net's protein calculator uses
Age, Gender, Height, Weight and Activity level. The finding was made and then not acted on. That
is a research-to-build gap, not a one-off miss, and it casts doubt on every prior build's
research unless this is fixed structurally.

1. **Feature/input floor, not ceiling.** Rule 8's "beat them by one clear thing" is about the
   **differentiator** — it is never permission to show fewer inputs than competitors just
   because our differentiator lives elsewhere. Before finalizing the input list for a new
   calculator, explicitly check every input field the top 3-5 competitors expose. CalcThis
   must match or exceed that list. If a competitor field is deliberately being dropped (truly
   redundant, not just inconvenient to add), say so explicitly in the research report and get
   the user's sign-off on dropping it — do not drop it silently.
2. **Text-only research is never enough on its own — always open the actual calculator in the
   Browser tool.** WebFetch/WebSearch summaries can describe a page in prose and still omit
   fields, defaults, shape/mode selectors, or toggles that are only obvious from actually
   looking at the rendered, interactive form. This is not a fallback for when something seems
   off — it is a **mandatory step of every competitor research pass, every time**: for every
   top competitor checked, `preview_start`/`navigate` to the live calculator, screenshot it,
   and where the tool has a shape/mode dropdown or similar, click through the options (e.g.
   `read_page`/`find` to enumerate a `<select>`'s full option list) to see everything it
   actually offers — not just its default state. Confirmed once this way (2026-09-14, Square
   Footage research): a text-fetch summary of calculatorsoup.com undercounted — the real page
   had a 13-option shape dropdown, only visible by opening it and reading the rendered
   `<select>`. If a competitor site genuinely can't be opened (blocked, paywalled, no working
   render) — stop and ask the user for a screenshot before finalizing the input list. Do not
   proceed on a text summary alone, ever, even when nothing about it looks suspicious.
3. This applies to the **research report step** (before approval) — the report itself must
   list every input field of every competitor checked, not just the differentiator idea, so
   the user can catch a gap like this before the build starts, not after.

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
6. **Finding a competitor input during research and then not building it** — the Protein
   Intake Calculator's research correctly identified that calculator.net uses Age, Gender,
   Height, Weight and Activity level, but the build shipped with only Weight and a goal
   chip. A finding that never reaches the input list is the same as never having researched
   it — Rule 8.5 (2026-09-14).
7. **Trusting a text-only WebFetch summary of a competitor page over actually opening it** —
   Square Footage research (2026-09-14): a text-fetch summary of calculatorsoup.com's
   calculator looked complete but undercounted its shape dropdown; opening the live page in
   the Browser tool and reading the rendered `<select>` found 13 shape modes, not the ~9
   implied by the summary. Fixed by making a Browser-tool visual pass mandatory for every
   competitor, every time, not just when something looks off — Rule 8.5.

Follow Rules 1–9 (4, 4.5 and 8.5 especially) and none of this happens again.
