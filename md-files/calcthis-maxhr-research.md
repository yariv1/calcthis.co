# Max heart rate calculator — research (2026-11-06, NOT built, awaiting "Approve all")

Ahrefs: `max heart rate calculator` >10K Medium; `target heart rate calculator` >1000; `heart rate calculator` >1000.

## Existing coverage (read 2026-11-06)
- /heart-rate-zone-calculator/ "Heart Rate Zone Calculator — Zone 2, Karvonen & Max HR": age (+ resting HR optional, max HR override) -> 5 zones; max HR = Tanaka only.
- /zone-2-heart-rate-calculator/: Zone 2 range; formula picker Fox / Tanaka / Gulati; small formula table.
Neither shows all formulas side by side, an age chart, a field test, or a beta-blocker warning; their intent is zones. Max HR itself is a distinct head intent (the SERP = dedicated max-HR tools). Verdict: ONE new page /max-heart-rate-calculator/; link both zone pages <-> it; retune the zone page title to drop the "Max HR" tail (undecided).

## Competitors opened LIVE (2026-11-06)
- Omnicalculator /sports/max-heart-rate: age only; formula select: Inbar (205.8 − 0.685 age), Haskell & Fox (220 − age), Nes (211 − 0.64 age), Oakland nonlinear (192 − 0.007 age^2), Tanaka (208 − 0.7 age); example table for age 35; says >85% of max: consult a doctor.
- NTNU CERG HRmax calculator: sex, age, height, weight, "I am on beta blockers"; HUNT formula 211 − 0.64 age; 4x4 field test (warm up, two 4-min intervals with 3 min active rest, third interval pushed to exhaustion; highest HR = HRmax); real HRmax can detect disease; beta blockers reduce HRmax.
- McMillan Running: 4 formulas (Fox/Haskell, Tanaka, Gulati women, + a 4th) + McMillan field test; "formulas can be off 10-30 bpm".
- Coachway (snippet only): 220 − age, Tanaka, Gellish (186 at 30), chart ages 18-75.
- Not opened: calculator.net target heart rate, heartspecialist.sg, Barbell Medicine, heart.org.

## Input parity
age; sex (NTNU, Gulati is women-only); formula choice (Omni: 5); beta-blocker checkbox (NTNU). NTNU's height/weight boxes do not change its formula (age only) — not needed.

## Sources READ (Europe PMC abstracts, 2026-11-06)
- Tanaka H, Monahan KD, Seals DR, J Am Coll Cardiol 2001;37:153-156: meta-analysis 351 studies / 18,712 subjects: HRmax = 208 − 0.7 x age; lab study of 514 healthy subjects 209 − 0.7 x age; same for men and women, independent of habitual activity.
- Gulati M et al., Circulation 2010;122:130-137 (5,437 asymptomatic women): mean peak HR = 206 − 0.88 x age; lower peak HR linked to higher risk of death.
- Nes BM et al., Scand J Med Sci Sports 2013;23:697-704 (HUNT, 3,320 healthy adults): HRmax = 211 − 0.64 x age, SEE 10.8 bpm, no interaction with gender, activity, VO2max or BMI.
- Fox/Haskell 220 − age: read only as described in Tanaka's abstract (commonly used) and competitor pages; original 1971 paper NOT read. Inbar and Oakland constants: read only on Omnicalculator (originals NOT read) -> if included, flagged on the page.

## Proposed differentiators
Visual: every formula as a dot on one bpm scale with your headline marked and the SEE (+/-10.8 bpm, Nes) shown as the typical spread for one person; plus an age chart (20-80).
Functional: (1) 5-6 formulas side by side with lowest-highest spread and a headline you pick (default Tanaka); (2) "I measured it" field: enter your test peak -> how far it is above/below each formula, then 5 zones from YOUR number (link/handoff to the zone page); (3) NTNU 4x4 field-test steps on the page (source read); (4) beta-blocker checkbox -> formulas flagged as too high (NTNU says beta blockers reduce HRmax); (5) % of max table (50-100%) in bpm.
Dropped: Gellish (not read), height/weight inputs, medical safety thresholds beyond what NTNU/Tanaka/Nes say.
