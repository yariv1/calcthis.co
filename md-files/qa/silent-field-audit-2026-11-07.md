# Silent-field audit of the older health pages (2026-11-07)

Tool: `node md-files/qa/audit-silent.js <slug> ...` (headless Chrome, desktop). Flags: CONTEXT-SILENT (on a filled page, clearing and doubling a field change nothing visible), DEPENDENT-SILENT (with field X emptied and the result still showing, typing Y changes nothing), alone-silent (from the empty page typing only this field changes nothing — normal on pages with a required field, informational only). It has false positives: sample value equal to the default, date fields, unit-label fields, fields that matter only in a sub-mode.

## Fixed (gated pages, QA PASS again, oracles updated)
- **FFMI**: "Body fat at your goal" without a target FFMI did nothing -> hint "Type your target FFMI first. The goal body fat is ignored for now."
- **Dog food**: second-food share without a second food, and a second food without a share, did nothing -> hints under the field.
- **Caffeine half life**: "amount you are comfortable with" without a bedtime did nothing -> "Add your bedtime first. ..."
- **Fiber**: "Fiber per 1,000 kcal I use" without calories did nothing -> "Add your calories first. ..."
- **Creatine** (earlier): tub price / scoop without tub size -> hint. **Vitamin D**: row notes + hints (built with the rule).

## Real findings NOT fixed (legacy pages, would have to leave `legacy.json` and get a fixture + oracle — his call)
- **Calories burned walking / running**: distance without time (and height without age / age without height) show nothing; "pace needs steps".
- **Net carb**: fiber / alcohol / amount eaten / share typed before the total carbs show nothing; "amount eaten" depends on a share.
- **Intermittent fasting**: ramp-up "from" hours / "weeks" typed alone show nothing (needs both).
- **Keto**: custom net carb cap / target weight / calories typed with no body data show nothing (page needs the body fields first, no hint).
- **Weight loss / percentage / max HR / caffeine limit / bulking**: only alone-silent on pages whose required fields are empty (no result yet) — acceptable by the old convention, but a hint "Enter X first" would be friendlier.

## False positives checked by hand
Dog / cat age date of birth (sample not a date), BSA dose-unit text, calories burned hub (needs an activity chosen from the list), bulking protein/fat g per kg (macro table always shows), fiber PK (sample equals the default 14), vitamin D / creatine (hint already visible).
