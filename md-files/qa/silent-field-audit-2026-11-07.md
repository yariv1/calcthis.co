# Silent-field audit of the older health pages (2026-11-07)

Tool: `node md-files/qa/audit-silent.js <slug> ...` (headless Chrome, desktop). Flags: CONTEXT-SILENT (on a filled page, clearing and doubling a field change nothing visible), DEPENDENT-SILENT (with field X emptied and the result still showing, typing Y changes nothing), alone-silent (from the empty page typing only this field changes nothing — normal on pages with a required field, informational only). It has false positives: sample value equal to the default, date fields, unit-label fields, fields that matter only in a sub-mode.

## Fixed (gated pages, QA PASS again, oracles updated)
- **FFMI**: "Body fat at your goal" without a target FFMI did nothing -> hint "Type your target FFMI first. The goal body fat is ignored for now."
- **Dog food**: second-food share without a second food, and a second food without a share, did nothing -> hints under the field.
- **Caffeine half life**: "amount you are comfortable with" without a bedtime did nothing -> "Add your bedtime first. ..."
- **Fiber**: "Fiber per 1,000 kcal I use" without calories did nothing -> "Add your calories first. ..."
- **Creatine** (earlier): tub price / scoop without tub size -> hint. **Vitamin D**: row notes + hints (built with the rule).

## Legacy pages fixed afterwards (2026-11-07, hints only; pages stay in legacy.json = no fixture/oracle; each verified in the browser)
- **Calories burned walking / running / hub**: age without height (or height without age) under Go advanced now says "Add both your age and your height to personalise the resting rate — the standard estimate is used for now." (the distance/time/speed trio is "any two of three" and fills the third field itself — not a bug; the hub's flags were false positives).
- **Net carb**: fiber / sugar alcohol / amount eaten / share / own limit typed before the total carbohydrate now say "Type the total carbohydrate from the label first ..."; a share typed when the label has no sugar alcohol says it is ignored.
- **Keto**: any field typed while age, height or weight is missing now says which of the three to add.
- **Intermittent fasting**: no change needed — the ramp-up already says "Enter both the hours you fast now and the weeks"; the audit flag was only because no result exists on an empty page.
- Pages with a required field and no result yet (weight loss, weight loss %, max HR, caffeine limit, bulking) keep the old convention (nothing until the required fields are filled).

## False positives checked by hand
Dog / cat age date of birth (sample not a date), BSA dose-unit text, calories burned hub (needs an activity chosen from the list), bulking protein/fat g per kg (macro table always shows), fiber PK (sample equals the default 14), vitamin D / creatine (hint already visible).
