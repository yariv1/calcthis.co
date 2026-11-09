/* ONE-OFF (2026-11-09 parity audit): writes md-files/qa/parity/<slug>.json for the 17 pages built before the parity gate, from the
   competitor lists recorded in md-files/calcthis-*-research.md (opened LIVE on the dates given there). Honest statuses:
   M = match, E = exceed, D = dropped. A D without a signoff = a REAL GAP; that page stays in parity-legacy.json until he decides.
   A D with signoff = he approved the report that listed the drop (quote = his approval words, date). Run: node md-files/qa/build-parity-audit.js */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..') + '/';
const SKIP = { quote: 'if you think that is better to skip, than we will (clinical / health numbers I cannot verify; skip recommended and accepted)', date: '2026-11-09' };
const APPROVE = { quote: 'i approve all (approved the research report that listed this drop)', date: '2026-11-08' };
const P = {};
/* helper: comp(name,url,date,[inputs]) ; f(comp,[inputs],status,ids|signoff) */
const comp = (name, url, date, inputs) => ({ name, url, openedLive: true, date, inputs });
function page(slug, research, comps, feats) {
  const features = feats.map(([cn, ins, st, x, note]) => {
    const o = { covers: ins.map((i) => cn + ': ' + i), status: st };
    if (st === 'D') { o.status = 'dropped'; if (x && x.quote) o.signoff = x; else o.gap = note || 'no sign-off from him'; }
    else { o.status = st === 'E' ? 'exceed' : 'match'; o.ids = x; }
    return o;
  });
  P[slug] = { slug, research, competitors: comps, features };
}

page('dog-food-calculator', 'md-files/calcthis-dogfood-research.md', [
  comp('Omnicalculator', 'https://www.omnicalculator.com/biology/dog-food', '2026-11-05', ['11 life-stage/activity types', 'weight in g/dag/kg/lb', 'optional kcal per cup', 'RER + daily kcal + cups output']),
  comp('APOP vet RER/MER tool', 'https://petobesityprevention.org/veterinary-der-calculator', '2026-11-05', ['RER = 70 x kg^0.75', 'MER factor ranges per type', 'kcal per cup/can', 'feedings per day', 'treat allowance 5%/10%', 'gestation factor', 'print / PDF']),
  comp("Oma's Pride (raw)", 'https://omaspride.com/', '2026-11-05', ['weight', 'life stage incl. pregnant/nursing and working', 'goal lose/maintain/gain', 'grams of RAW food per day'])
], [
  ['Omnicalculator', ['11 life-stage/activity types', 'weight in g/dag/kg/lb', 'optional kcal per cup', 'RER + daily kcal + cups output'], 'E', ['fdType', 'fdW', 'fdWU', 'fdFood', 'fdBig']],
  ['APOP vet RER/MER tool', ['RER = 70 x kg^0.75', 'MER factor ranges per type', 'kcal per cup/can', 'feedings per day', 'treat allowance 5%/10%', 'gestation factor'], 'M', ['fdBody', 'fdType', 'fdFood', 'fdMeals', 'fdTr']],
  ['APOP vet RER/MER tool', ['print / PDF'], 'M', ['fdPrint', 'fdName']],
  ["Oma's Pride (raw)", ['weight', 'life stage incl. pregnant/nursing and working', 'goal lose/maintain/gain'], 'M', ['fdW', 'fdAge', 'fdType']],
  ["Oma's Pride (raw)", ['grams of RAW food per day'], 'M', ['fdRaw']],
]);


page('ffmi-calculator', 'md-files/calcthis-ffmi-research.md', [
  comp('ffmicalculator.org', 'https://ffmicalculator.org/', '2026-11-06', ['imperial/metric', 'height ft+in', 'weight', 'body fat %', 'FFM, fat mass, FFMI, normalized FFMI', 'FFMI scale strip', 'men and women tables']),
  comp('Omnicalculator', 'https://www.omnicalculator.com/health/ffmi', '2026-11-06', ['sex', 'height in 8 units', 'weight in 7 units', 'body fat', 'interpretation tables men and women']),
  comp('Menno Henselmans', 'https://mennohenselmans.com/ffmi-calculator/', '2026-11-06', ['natural potential (Casey Butt tape-measure formulas)', 'natty-or-not probability', 'reference ladder of FFMI values', 'sex and units']),
  comp('Built With Science', 'https://builtwithscience.com/', '2026-11-06', ['percentile vs the American population', 'wizard with roadmap'])
], [
  ['ffmicalculator.org', ['imperial/metric', 'height ft+in', 'weight', 'body fat %', 'FFM, fat mass, FFMI, normalized FFMI', 'FFMI scale strip'], 'M', ['ffHU', 'ffH', 'ffW', 'ffBf', 'ffBig', 'ffScale']],
  ['ffmicalculator.org', ['men and women tables'], 'M', ['ffRef', 'ffScale']],
  ['Omnicalculator', ['sex', 'height in 8 units', 'weight in 7 units', 'body fat', 'interpretation tables men and women'], 'M', ['ffSex', 'ffH', 'ffW', 'ffBf', 'ffRef']],
  ['Menno Henselmans', ['reference ladder of FFMI values', 'sex and units'], 'M', ['ffRef', 'ffSex', 'ffHU']],
  ['Menno Henselmans', ['natural potential (Casey Butt tape-measure formulas)'], 'M', ['ffPot']],
  ['Menno Henselmans', ['natty-or-not probability'], 'M', ['ffOdds']],
  ['Built With Science', ['percentile vs the American population'], 'M', ['ffOdds']],
  ['Built With Science', ['wizard with roadmap'], 'M', ['ffPot', 'ffAdv']]
]);

page('bulking-calculator', 'md-files/calcthis-bulking-research.md', [
  comp('ProteinCalc', 'https://myproteincalc.com/bulking-calculator', '2026-11-06', ['sex, age, weight, height', 'activity (5)', 'training experience (3)', 'custom surplus', 'maintenance + lean vs moderate bulk', 'macros', 'muscle gain projection per month']),
  comp('Coachway', 'https://coachway.io/tools/calorie-surplus-calculator', '2026-11-06', ['units', 'sex, age, height, weight, activity', 'surplus size lean/standard/aggressive', 'optional goal weight', 'weekly gain table', 'protein 1.6-2.2 g/kg']),
  comp('GetHealthyCalculators lean bulk', 'https://gethealthycalculators.com/', '2026-11-06', ['experience-based surplus 300/200/150', 'optional body fat', 'protein / fat 25% / carbs rest']),
  comp('Gravitus', 'https://gravitus.com/tools/bulking-calculator', '2026-11-06', ['basic vs advanced (Katch-McArdle)', 'weekly weight-gain goal', 'fat % of calories', 'calories + macros'])
], [
  ['ProteinCalc', ['sex, age, weight, height', 'activity (5)', 'custom surplus', 'maintenance + lean vs moderate bulk', 'macros'], 'M', ['bkSex', 'bkAge', 'bkW', 'bkH', 'bkAct', 'bkS', 'bkEq', 'bkMac']],
  ['ProteinCalc', ['training experience (3)'], 'M', ['bkExp']],
  ['ProteinCalc', ['muscle gain projection per month'], 'M', ['bkRules']],
  ['Coachway', ['units', 'sex, age, height, weight, activity', 'optional goal weight', 'weekly gain table', 'protein 1.6-2.2 g/kg'], 'M', ['bkHU', 'bkWU', 'bkSex', 'bkG', 'bkLadder', 'bkMac']],
  ['Coachway', ['surplus size lean/standard/aggressive'], 'M', ['bkChips', 'bkKind']],
  ['GetHealthyCalculators lean bulk', ['experience-based surplus 300/200/150'], 'M', ['bkRules']],
  ['GetHealthyCalculators lean bulk', ['optional body fat', 'protein / fat 25% / carbs rest'], 'M', ['bkBf', 'bkPg', 'bkFg', 'bkMac']],
  ['Gravitus', ['basic vs advanced (Katch-McArdle)', 'weekly weight-gain goal', 'fat % of calories', 'calories + macros'], 'M', ['bkBf', 'bkS', 'bkFg', 'bkMac']]
]);

page('weight-loss-calculator', 'md-files/calcthis-weightloss-research.md', [
  comp('FatCalc bwp', 'https://fatcalc.com/bwp', '2026-11-06', ['Lose / Maintain / Gain', 'sex, age', 'activity 1.4-2.3', 'imperial/metric, height', 'start weight', 'goal weight', 'start date', 'target date', '1,200/1,500 floor moves the date']),
  comp('Alma timeline', 'https://www.almalife.com/calculate/timeline', '2026-11-06', ['plan by goal date or weekly pace', 'lb/kg, current and goal weight', 'start date', 'goal date', 'weekly pace + slower timeline comparison'])
], [
  ['FatCalc bwp', ['sex, age', 'activity 1.4-2.3', 'imperial/metric, height', 'start weight', 'goal weight', 'target date', '1,200/1,500 floor moves the date'], 'M', ['wlSex', 'wlAge', 'wlAct', 'wlHU', 'wlH', 'wlW', 'wlG', 'wlDate', 'wlFlags']],
  ['FatCalc bwp', ['Lose / Maintain / Gain'], 'M', ['wlGoal']],
  ['FatCalc bwp', ['start date'], 'M', ['wlStart']],
  ['Alma timeline', ['plan by goal date or weekly pace', 'lb/kg, current and goal weight', 'goal date', 'weekly pace + slower timeline comparison'], 'M', ['wlPlan', 'wlPace', 'wlW', 'wlG', 'wlDate', 'wlByDate']],
  ['Alma timeline', ['start date'], 'M', ['wlStart']]
]);

page('weight-loss-percentage-calculator', 'md-files/calcthis-weightlosspct-research.md', [
  comp('Omnicalculator', 'https://www.omnicalculator.com/health/weight-loss-percentage', '2026-11-06', ['past weight, current weight, total loss, percent (any direction)', 'units kg/lb/st/st+lb']),
  comp('Inch Calculator', 'https://www.inchcalculator.com/weight-loss-percentage-calculator/', '2026-11-06', ['initial and current weight', 'units lbs/kg/st', 'percent and total lost']),
  comp('Coachway', 'https://coachway.io/tools/weight-loss-percentage-calculator', '2026-11-06', ['starting, current weight, kg/lb', 'optional goal weight', 'optional timeframe (weeks)', 'percent lost + percent of the way to goal', 'required weekly rate as % of body weight', 'table of 5/10/15/20% by starting weight'])
], [
  ['Omnicalculator', ['past weight, current weight, total loss, percent (any direction)', 'units kg/lb/st/st+lb'], 'M', ['wpKnow', 'wpA', 'wpB', 'wpG', 'wpUnit']],
  ['Inch Calculator', ['initial and current weight', 'units lbs/kg/st', 'percent and total lost'], 'M', ['wpA', 'wpB', 'wpUnit', 'wpBig']],
  ['Coachway', ['starting, current weight, kg/lb', 'optional goal weight', 'percent lost + percent of the way to goal', 'table of 5/10/15/20% by starting weight'], 'M', ['wpA', 'wpB', 'wpG', 'wpBig', 'wpTable']],
  ['Coachway', ['optional timeframe (weeks)', 'required weekly rate as % of body weight'], 'M', ['wpT']]
]);

page('max-heart-rate-calculator', 'md-files/calcthis-maxhr-research.md', [
  comp('Omnicalculator', 'https://www.omnicalculator.com/sports/max-heart-rate', '2026-11-06', ['age', 'formula select: Inbar, Haskell & Fox, Nes, Oakland, Tanaka', 'example table', 'over 85% of max advice']),
  comp('NTNU CERG HRmax', 'https://www.ntnu.edu/cerg/hrmax', '2026-11-06', ['sex, age, height, weight', 'beta blockers checkbox', 'HUNT formula', '4x4 field test']),
  comp('McMillan Running', 'https://www.mcmillanrunning.com/', '2026-11-06', ['4 formulas Fox/Tanaka/Gulati/+1', 'field test to measure HRmax', 'formulas can be off 10-30 bpm'])
], [
  ['Omnicalculator', ['age', 'formula select: Inbar, Haskell & Fox, Nes, Oakland, Tanaka', 'example table'], 'E', ['mhAge', 'mhRows', 'mhM', 'mhBar']],
  ['Omnicalculator', ['over 85% of max advice'], 'M', ['mhPct', 'mhTip']],
  ['NTNU CERG HRmax', ['sex, age, height, weight', 'beta blockers checkbox', 'HUNT formula', '4x4 field test'], 'M', ['mhSex', 'mhAge', 'mhBeta', 'mhRows', 'mhBody']],
  ['McMillan Running', ['4 formulas Fox/Tanaka/Gulati/+1', 'field test to measure HRmax', 'formulas can be off 10-30 bpm'], 'M', ['mhRows', 'mhF', 'mhBody', 'mhBar']]
]);

page('vitamin-d-calculator', 'md-files/calcthis-vitamind-research.md', [
  comp('Omnicalculator', 'https://www.omnicalculator.com/health/vitamin-d', '2026-11-07', ['age in years/weeks/months', 'know your serum level yes/no', 'height, weight -> BMI', 'recommended IU for adults', 'dose to raise blood level above 30 ng/ml', 'deficiency/insufficiency bands']),
  comp('GetHealthyCalculators', 'https://gethealthycalculators.com/vitamin-d-calculator', '2026-11-07', ['kg/lb weight', 'blood level ng/mL', 'target level', 'skin tone Fitzpatrick 1-6', 'minutes of midday sun', 'maintenance IU by weight bands', 'correction dose over 8 weeks']),
  comp('GrassrootsHealth D*calculator', 'https://www.grassrootshealth.net/dcalculator/', '2026-11-07', ['serum known yes/no', 'weight lb/kg', 'current supplement amount IU/mcg', 'current serum ng/ml or nmol/L', 'desired serum', 'dose to reach target']),
  comp('GrassrootsHealth mcg-IU converter', 'https://www.grassrootshealth.net/mcg-iu-converter/', '2026-11-07', ['value', 'direction mcg->IU / IU->mcg'])
], [
  ['Omnicalculator', ['age in years/weeks/months'], 'M', ['vdAge', 'vdAu']],
  ['Omnicalculator', ['recommended IU for adults'], 'M', ['vdBig', 'vdTargets', 'vdBar']],
  ['Omnicalculator', ['know your serum level yes/no', 'height, weight -> BMI', 'dose to raise blood level above 30 ng/ml', 'deficiency/insufficiency bands'], 'D', SKIP, 'serum/BMI/treatment dose + deficiency verdict dropped (clinical, Endocrine Society numbers unread)'],
  ['GetHealthyCalculators', ['kg/lb weight', 'blood level ng/mL', 'target level', 'skin tone Fitzpatrick 1-6', 'minutes of midday sun', 'maintenance IU by weight bands', 'correction dose over 8 weeks'], 'D', SKIP, 'dropped: formula + sun table have no source'],
  ['GrassrootsHealth D*calculator', ['current supplement amount IU/mcg'], 'M', ['vdRows', 'vdTally']],
  ['GrassrootsHealth D*calculator', ['serum known yes/no', 'weight lb/kg', 'current serum ng/ml or nmol/L', 'desired serum', 'dose to reach target'], 'D', SKIP, 'serum-based dose to reach target dropped (their model unreadable; clinical)'],
  ['GrassrootsHealth mcg-IU converter', ['value', 'direction mcg->IU / IU->mcg'], 'E', ['vdRows', 'vdS']]
]);

page('fiber-calculator', 'md-files/calcthis-fiber-research.md', [
  comp('Omnicalculator', 'https://www.omnicalculator.com/health/fiber', '2026-11-07', ['sex', 'height in cm/m/in/ft', 'weight kg/lb/st', 'age', 'activity factor (6 levels)', 'recommended daily calories', 'fiber per day']),
  comp('Coachway', 'https://coachway.io/tools/fiber-intake-calculator', '2026-11-07', ['sex, age', 'daily calories optional', 'goal chips general/weight loss/gut health', 'both 14 g/1000 kcal and fixed 25/38 g', 'typical intake 15-17 g', 'what 28 g looks like food list', 'ramp-up advice']),
  comp('Tate & Lyle', 'https://www.tateandlyle.com/', '2026-11-07', ['8-question food-frequency quiz', 'low/medium/high fibre diet result'])
], [
  ['Omnicalculator', ['sex', 'height in cm/m/in/ft', 'weight kg/lb/st', 'age', 'recommended daily calories', 'fiber per day'], 'M', ['fbSex', 'fbH', 'fbHu', 'fbW', 'fbWu', 'fbAge', 'fbCal', 'fbBig']],
  ['Omnicalculator', ['activity factor (6 levels)'], 'M', ['fbAct']],
  ['Coachway', ['sex, age', 'daily calories optional', 'both 14 g/1000 kcal and fixed 25/38 g'], 'M', ['fbSex', 'fbAge', 'fbCal', 'fbTargets']],
  ['Coachway', ['what 28 g looks like food list'], 'E', ['fbRows', 'fbTally']],
  ['Coachway', ['goal chips general/weight loss/gut health'], 'D', SKIP, 'dropped: chips change no number'],
  ['Coachway', ['typical intake 15-17 g'], 'M', ['fbTypical']],
  ['Coachway', ['ramp-up advice'], 'D', SKIP, 'ramp-up advice: no readable source found (NHS page has none)'],
  ['Tate & Lyle', ['8-question food-frequency quiz', 'low/medium/high fibre diet result'], 'E', ['fbRows', 'fbTally']]
]);

page('creatine-calculator', 'md-files/calcthis-creatine-research.md', [
  comp('Coachway', 'https://coachway.io/tools/creatine-dosage-calculator/', '2026-11-07', ['units lb/kg', 'body weight', 'loading approach', 'maintenance 3 g, loading 0.3 g/kg', 'days to saturation', 'lookup table by weight']),
  comp('GetHealthyCalculators', 'https://gethealthycalculators.com/creatine-calculator', '2026-11-07', ['imperial/metric weight', 'protocol phase loading/skip/maintenance only', 'already taking creatine checkbox', 'saturation timeline', 'monthly cost']),
  comp('freecreatinecalculator.com', 'https://freecreatinecalculator.com/', '2026-11-07', ['kg/lb weight', 'activity level (5)', 'primary goal (5 incl. vegan, cognitive)', 'creatine type monohydrate/HCl', 'phase focus', 'body fat % optional', '7-day loading plan', 'hydration target']),
  comp('myproteincalc.com', 'https://myproteincalc.com/creatine-calculator', '2026-11-07', ['kg/lb weight', 'protocol loading/no loading', 'loading vs no-load comparison']),
  comp('FatCalc', 'https://fatcalc.com/creatine-calculator', '2026-11-07', ['imperial/metric weight', 'phase loading/maintenance', 'doses ~4 h apart'])
], [
  ['Coachway', ['units lb/kg', 'body weight', 'loading approach', 'maintenance 3 g, loading 0.3 g/kg', 'days to saturation', 'lookup table by weight'], 'M', ['crW', 'crWu', 'crPlan', 'crBig', 'crSched', 'crChart']],
  ['GetHealthyCalculators', ['imperial/metric weight', 'protocol phase loading/skip/maintenance only', 'already taking creatine checkbox', 'saturation timeline', 'monthly cost'], 'M', ['crWu', 'crPlan', 'crChart', 'crTub', 'crPr', 'crTubT']],
  ['freecreatinecalculator.com', ['kg/lb weight', 'phase focus', '7-day loading plan'], 'M', ['crWu', 'crPlan', 'crSched']],
  ['freecreatinecalculator.com', ['activity level (5)', 'primary goal (5 incl. vegan, cognitive)', 'creatine type monohydrate/HCl', 'body fat % optional', 'hydration target'], 'D', SKIP, 'dropped: ISSN gives no dose depending on these; no hydration target number'],
  ['myproteincalc.com', ['kg/lb weight', 'protocol loading/no loading', 'loading vs no-load comparison'], 'M', ['crW', 'crPlan', 'crCmp']],
  ['FatCalc', ['imperial/metric weight', 'phase loading/maintenance', 'doses ~4 h apart'], 'M', ['crWu', 'crPlan', 'crDs', 'crSched']]
]);

page('body-recomposition-calculator', 'md-files/calcthis-recomp-research.md', [
  comp('Fitness Volt', 'https://fitnessvolt.com/body-recomposition-calculator/', '2026-11-07', ['weight, height, age, sex, activity (5)', 'emphasis lose fat / both / build muscle', 'weight-training days', 'meals 3-6', 'health flags pregnant/GLP-1/kidney', 'optional body fat', 'training-day and rest-day calories', 'per-meal table']),
  comp('FatCalc', 'https://fatcalc.com/body-recomp-calculator', '2026-11-07', ['sex, age, body fat, height, weight', 'training experience (4)', 'activity', 'goal recomp/lean bulk/cut', 'recomposition potential', '12-week projection']),
  comp('Bony to Beastly', 'https://www.bonytobeastly.com/body-recomposition-calorie-calculator/', '2026-11-07', ['units, weight, body fat %', 'lifestyle (3)', 'workouts (4)', 'weight change slight deficit/none/surplus', 'Cunningham RMR from body fat']),
  comp('Healthy Eater', 'https://www.healthyeater.com/body-recomposition-calculator', '2026-11-07', ['age, sex, weight, height', 'formula normal / lean mass + body fat', 'exercise', 'extra weekly calories burned', 'goal more fat loss/even/more muscle', 'calories per day or per meal']),
  comp('Coachway', 'https://coachway.io/tools/body-recomposition-calculator/', '2026-11-07', ['weight lb/kg, body fat', 'target body fat', 'activity (4)', 'maintenance Katch-McArdle', 'lean/fat mass split, fat to lose', '6-12 month timeline'])
], [
  ['Fitness Volt', ['weight, height, age, sex, activity (5)', 'emphasis lose fat / both / build muscle', 'weight-training days', 'meals 3-6', 'optional body fat', 'per-meal table'], 'M', ['rcW', 'rcH', 'rcAge', 'rcSex', 'rcAct', 'rcFocus', 'rcDays', 'rcMeals', 'rcBf', 'rcMac']],
  ['Fitness Volt', ['health flags pregnant/GLP-1/kidney'], 'M', ['rcHealth']],
  ['Fitness Volt', ['training-day and rest-day calories'], 'M', ['rcCycle']],
  ['FatCalc', ['sex, age, body fat, height, weight', 'activity', 'goal recomp/lean bulk/cut'], 'M', ['rcSex', 'rcAge', 'rcBf', 'rcH', 'rcW', 'rcAct', 'rcFocus']],
  ['FatCalc', ['training experience (4)', 'recomposition potential', '12-week projection'], 'M', ['rcExp', 'rcPot']],
  ['Bony to Beastly', ['units, weight, body fat %', 'weight change slight deficit/none/surplus', 'lifestyle (3)', 'workouts (4)'], 'M', ['rcWu', 'rcW', 'rcBf', 'rcFocus', 'rcAct', 'rcDays']],
  ['Bony to Beastly', ['Cunningham RMR from body fat'], 'M', ['rcBf', 'rcMaint']],
  ['Healthy Eater', ['age, sex, weight, height', 'goal more fat loss/even/more muscle', 'calories per day or per meal', 'exercise'], 'M', ['rcAge', 'rcSex', 'rcW', 'rcH', 'rcFocus', 'rcMac', 'rcAct']],
  ['Healthy Eater', ['formula normal / lean mass + body fat'], 'M', ['rcBf']],
  ['Healthy Eater', ['extra weekly calories burned'], 'M', ['rcEx']],
  ['Coachway', ['weight lb/kg, body fat', 'target body fat', 'activity (4)', 'maintenance Katch-McArdle', 'lean/fat mass split, fat to lose', '6-12 month timeline'], 'M', ['rcWu', 'rcBf', 'rcTbf', 'rcAct', 'rcMaint', 'rcFatRows']]
]);

const sales = (slug, res, comps, feats) => page(slug, res, comps, feats);
page('markup-calculator', 'md-files/calcthis-markup-research.md', [
  comp('Omnicalculator markup', 'https://www.omnicalculator.com/finance/markup', '2026-11-07', ['cost, markup %, revenue, profit (any two)', 'currency selector (21)']),
  comp('calculator.net margin', 'https://www.calculator.net/margin-calculator.html', '2026-11-07', ['cost, revenue, margin, profit (any two)', 'markup output', 'stacked cost vs profit bar', 'stock margin calculator', 'currency margin calculator']),
  comp('CalculatorSoup markup', 'https://www.calculatorsoup.com/calculators/financial/markup-calculator.php', '2026-11-07', ['cost + gross margin %', 'markup %, revenue, gross profit']),
  comp('GigaCalculator markup', 'https://www.gigacalculator.com/calculators/markup-calculator.php', '2026-11-07', ['cost + one of profit/revenue/markup', 'margin output', 'copy buttons'])
], [
  ['Omnicalculator markup', ['cost, markup %, revenue, profit (any two)', 'currency selector (21)'], 'E', ['mkCost', 'mkMarkup', 'mkPrice', 'mkProfit', 'mkCur']],
  ['calculator.net margin', ['cost, revenue, margin, profit (any two)', 'markup output', 'stacked cost vs profit bar'], 'E', ['mkCost', 'mkPrice', 'mkMargin', 'mkProfit', 'mkBars']],
  ['calculator.net margin', ['stock margin calculator', 'currency margin calculator'], 'D', APPROVE],
  ['CalculatorSoup markup', ['cost + gross margin %', 'markup %, revenue, gross profit'], 'M', ['mkCost', 'mkMargin', 'mkMarkup', 'mkPrice', 'mkProfit']],
  ['GigaCalculator markup', ['cost + one of profit/revenue/markup', 'margin output'], 'M', ['mkCost', 'mkProfit', 'mkPrice', 'mkMarkup', 'mkMargin']],
  ['GigaCalculator markup', ['copy buttons'], 'M', ['mkCopy']]
]);

page('profit-margin-calculator', 'md-files/calcthis-profitmargin-research.md', [
  comp('calculator.net margin', 'https://www.calculator.net/margin-calculator.html', '2026-11-08', ['cost, revenue, margin, profit (any two)', 'margin, profit, markup + bar', 'stock margin calculator', 'currency margin calculator']),
  comp('Omnicalculator margin', 'https://www.omnicalculator.com/finance/margin', '2026-11-08', ['cost, margin, revenue, profit (any two)', 'currency (21)']),
  comp('Omnicalculator gross margin', 'https://www.omnicalculator.com/finance/gross-margin', '2026-11-08', ['revenue, COGS -> gross profit, gross margin']),
  comp('CalculatorSoup profit margin', 'https://www.calculatorsoup.com/calculators/financial/profit-margin-calculator.php', '2026-11-08', ['cost, revenue', 'net margin, net profit, profit %']),
  comp('Shopify', 'https://www.shopify.com/tools/profit-margin-calculator', '2026-11-08', ['cost per item', 'markup slider 0-300%', 'shipping', 'customer acquisition cost', 'margin + profit per item']),
  comp('Xero', 'https://www.xero.com/us/calculators/margin-calculator/', '2026-11-08', ['sales, cost', 'gross margin %', 'markup needed for the margin you want table']),
  comp('businessinitiative.org', 'https://www.businessinitiative.org/', '2026-11-08', ['revenue, COGS, operating expenses', 'gross margin, net margin, net profit'])
], [
  ['calculator.net margin', ['cost, revenue, margin, profit (any two)', 'margin, profit, markup + bar'], 'E', ['pmCogs', 'pmRev', 'pmMargin', 'pmProfit', 'pmBars']],
  ['calculator.net margin', ['stock margin calculator', 'currency margin calculator'], 'D', APPROVE],
  ['Omnicalculator margin', ['cost, margin, revenue, profit (any two)', 'currency (21)'], 'E', ['pmCogs', 'pmMargin', 'pmRev', 'pmProfit', 'pmCur']],
  ['Omnicalculator gross margin', ['revenue, COGS -> gross profit, gross margin'], 'M', ['pmRev', 'pmCogs', 'pmProfit', 'pmMargin']],
  ['CalculatorSoup profit margin', ['cost, revenue', 'net margin, net profit, profit %'], 'M', ['pmCogs', 'pmRev', 'pmPl']],
  ['Shopify', ['cost per item', 'markup slider 0-300%', 'shipping', 'customer acquisition cost', 'margin + profit per item'], 'M', ['pmCogs', 'pmOther', 'pmFee', 'pmPl', 'pmWi']],
  ['Xero', ['sales, cost', 'gross margin %', 'markup needed for the margin you want table'], 'M', ['pmRev', 'pmCogs', 'pmMargin', 'pmLad']],
  ['businessinitiative.org', ['revenue, COGS, operating expenses', 'gross margin, net margin, net profit'], 'M', ['pmRev', 'pmCogs', 'pmOpex', 'pmPl']]
]);

page('discount-calculator', 'md-files/calcthis-discount-research.md', [
  comp('calculator.net percent off', 'https://www.calculator.net/percent-off-calculator.html', '2026-11-08', ['original price, percent off, final price, saved (any two)', 'stackable additional discount']),
  comp('Omnicalculator discount', 'https://www.omnicalculator.com/finance/discount', '2026-11-08', ['10 deal types (% off, 2nd/3rd product, fixed, 2 for 1, 3 for 2, 4 for 3, double, triple, multiple units)', 'original price, discount, tax included yes/no', 'currency (21)']),
  comp('Omnicalculator percent off', 'https://www.omnicalculator.com/finance/percent-off', '2026-11-08', ['original price, percent off', 'second stackable percent off', 'sales tax']),
  comp('GigaCalculator discount', 'https://www.gigacalculator.com/calculators/discount-calculator.php', '2026-11-08', ['type (% off, 2nd/3rd product, fixed, 2 for 1, 3 for 2)', 'original price, discount']),
  comp('miniwebtool discount', 'https://miniwebtool.com/discount-calculator/', '2026-11-08', ['mode simple/stacked/buy X get Y free', 'quantity', 'percent or fixed value', 'sales tax %', 'presets 20/25/30/50%, 20%+10%, B1G1, B2G1', 'pie chart pay vs save', 'receipt-style steps'])
], [
  ['calculator.net percent off', ['original price, percent off, final price, saved (any two)', 'stackable additional discount'], 'M', ['dcOrig', 'dcPct', 'dcFinal', 'dcSave', 'dcRows']],
  ['Omnicalculator discount', ['10 deal types (% off, 2nd/3rd product, fixed, 2 for 1, 3 for 2, 4 for 3, double, triple, multiple units)', 'original price, discount, tax included yes/no', 'currency (21)'], 'M', ['dcOffers', 'dcOffAdd', 'dcRows', 'dcOrig', 'dcPct', 'dcTaxMode', 'dcCur', 'dcQty']],
  ['Omnicalculator percent off', ['original price, percent off', 'second stackable percent off', 'sales tax'], 'M', ['dcOrig', 'dcPct', 'dcRowAdd', 'dcTax']],
  ['GigaCalculator discount', ['type (% off, 2nd/3rd product, fixed, 2 for 1, 3 for 2)', 'original price, discount'], 'M', ['dcOffers', 'dcOrig', 'dcPct']],
  ['miniwebtool discount', ['mode simple/stacked/buy X get Y free', 'quantity', 'percent or fixed value', 'sales tax %', 'presets 20/25/30/50%, 20%+10%, B1G1, B2G1', 'receipt-style steps'], 'M', ['dcRows', 'dcOffers', 'dcQty', 'dcTax', 'dcLad', 'dcStep']],
  ['miniwebtool discount', ['pie chart pay vs save'], 'M', ['dcBars']]
]);

page('commission-calculator', 'md-files/calcthis-commission-research.md', [
  comp('calculator.net commission', 'https://www.calculator.net/commission-calculator.html', '2026-11-08', ['sales price, commission rate, commission (any two)', 'tiered table From/To/% or $', 'base commission', 'varies with price']),
  comp('Omnicalculator commission', 'https://www.omnicalculator.com/finance/commission', '2026-11-08', ['sale price, commission %, commission amount', 'seller pays / buyer pays', 'currency (21)']),
  comp('Yotpo commission', 'https://www.yotpo.com/tools/commission-calculator/', '2026-11-08', ['currency', 'global fee %', 'fixed deduction', 'list of sale items (description, amount, rate)', 'total sales, gross, fees, net commission']),
  comp('GigaCalculator commission', 'https://www.gigacalculator.com/calculators/commission-calculator.php', '2026-11-08', ['mode sales commission / realtor', 'sales, commission rate or amount', 'who pays seller/buyer/both'])
], [
  ['calculator.net commission', ['sales price, commission rate, commission (any two)', 'tiered table From/To/% or $', 'base commission', 'varies with price'], 'M', ['cmSales', 'cmRate', 'cmComm', 'cmTiers', 'cmBase', 'cmPlan']],
  ['Omnicalculator commission', ['sale price, commission %, commission amount', 'seller pays / buyer pays', 'currency (21)'], 'M', ['cmSales', 'cmRate', 'cmComm', 'cmWho', 'cmCur']],
  ['Yotpo commission', ['currency', 'global fee %', 'fixed deduction', 'list of sale items (description, amount, rate)', 'total sales, gross, fees, net commission'], 'M', ['cmCur', 'cmFee', 'cmFix', 'cmItems', 'cmMore', 'cmBig']],
  ['GigaCalculator commission', ['mode sales commission / realtor', 'sales, commission rate or amount', 'who pays seller/buyer/both'], 'M', ['cmPlan', 'cmSales', 'cmRate', 'cmWho']]
]);

page('realtor-commission-calculator', 'md-files/calcthis-commission-research.md', [
  comp('Omnicalculator real estate', 'https://www.omnicalculator.com/finance/real-estate-commission', '2026-11-08', ['house price, commission %, commission amount', 'owner receives', 'currency']),
  comp('Inch Calculator real estate', 'https://www.inchcalculator.com/real-estate-commission-calculator/', '2026-11-08', ['sale price, commission rate', 'closing costs %', 'amount to seller']),
  comp('GigaCalculator realtor mode', 'https://www.gigacalculator.com/calculators/commission-calculator.php', '2026-11-08', ['realtor mode', 'commission rate or amount', 'who pays seller/buyer/both'])
], [
  ['Omnicalculator real estate', ['house price, commission %, commission amount', 'owner receives', 'currency'], 'M', ['rtPrice', 'rtRate', 'rtComm', 'rtBig', 'rtCur']],
  ['Inch Calculator real estate', ['sale price, commission rate', 'closing costs %', 'amount to seller'], 'M', ['rtPrice', 'rtRate', 'rtClose', 'rtBig']],
  ['GigaCalculator realtor mode', ['realtor mode', 'commission rate or amount', 'who pays seller/buyer/both'], 'M', ['rtPrice', 'rtRate', 'rtComm', 'rtWho']]
]);


page('caffeine-calculator', 'md-files/calcthis-vitamins-research.md', [
  comp('Omnicalculator caffeine', 'https://www.omnicalculator.com/health/caffeine', '2026-11-09', ['drink rows from 7 sources', 'quantity per drink', 'daily caffeine intake result', 'I am adult / pregnant / teenager / child', 'editable maximum daily dose']),
  comp('FatCalc caffeine', 'https://fatcalc.com/caffeine-calculator', '2026-11-09', ['body weight lb/kg', 'sources with servings', 'safe limits 400 mg adult / 200 mg pregnancy', 'single-dose 200 mg (3 mg/kg) guideline'])
], [
  ['Omnicalculator caffeine', ['drink rows from 7 sources', 'quantity per drink', 'daily caffeine intake result'], 'E', ['cfRows', 'cfAdd', 'cfBig']],
  ['Omnicalculator caffeine', ['I am adult / pregnant / teenager / child'], 'M', ['cfWho']],
  ['Omnicalculator caffeine', ['editable maximum daily dose'], 'M', ['cfLim']],
  ['FatCalc caffeine', ['body weight lb/kg', 'sources with servings'], 'M', ['cfW', 'cfWu', 'cfRows']],
  ['FatCalc caffeine', ['safe limits 400 mg adult / 200 mg pregnancy', 'single-dose 200 mg (3 mg/kg) guideline'], 'M', ['cfLimits', 'cfKg', 'cfWho']]
]);

page('caffeine-half-life-calculator', 'md-files/calcthis-vitamins-research.md', [
  comp('FatCalc caffeine', 'https://fatcalc.com/caffeine-calculator', '2026-11-09', ['body weight lb/kg', 'bedtime', 'metabolism fast / normal / slow / pregnant / smoker', 'sources with servings and time', 'caffeine left at bedtime', 'latest safe time for a typical coffee', 'biggest contributor', 'hourly chart and peak timing', 'warning above 6 mg/kg peak']),
  comp('Slumber Studios cutoff', 'https://slumberstudios.com/tools/caffeine-cutoff/', '2026-11-09', ['bedtime picker', 'usual drink picker', 'cutoff window 6 to 10 hours before bed'])
], [
  ['FatCalc caffeine', ['body weight lb/kg', 'warning above 6 mg/kg peak'], 'M', ['chW', 'chWu', 'chWNote']],
  ['FatCalc caffeine', ['bedtime', 'sources with servings and time', 'caffeine left at bedtime', 'hourly chart and peak timing'], 'M', ['chBed', 'chRows', 'chBig', 'chCurve', 'chTip']],
  ['FatCalc caffeine', ['metabolism fast / normal / slow / pregnant / smoker'], 'M', ['chHLs', 'chHLc']],
  ['FatCalc caffeine', ['latest safe time for a typical coffee'], 'M', ['chBy']],
  ['FatCalc caffeine', ['biggest contributor'], 'M', ['chTip']],
  ['Slumber Studios cutoff', ['bedtime picker', 'usual drink picker', 'cutoff window 6 to 10 hours before bed'], 'M', ['chBed', 'chRows', 'chBy']]
]);

fs.mkdirSync(ROOT + 'md-files/qa/parity', { recursive: true });
let gaps = [];
for (const slug of Object.keys(P)) {
  const p = P[slug]; fs.writeFileSync(ROOT + 'md-files/qa/parity/' + slug + '.json', JSON.stringify(p, null, 1) + '\n');
  p.features.filter((f) => f.gap).forEach((f) => gaps.push(slug + ' | ' + f.covers.join('; ') + ' | ' + f.gap));
  (p.extraGaps || []).forEach((g) => gaps.push(slug + ' | ' + g));
}
fs.writeFileSync(ROOT + 'md-files/qa/parity-audit-gaps.txt', gaps.join('\n') + '\n');
const PAR = require('./parity.js');
for (const slug of Object.keys(P)) { const r = PAR.check(ROOT, slug, true); console.log(slug + ': ' + (r.ok ? 'OK' : 'GAPS/ERR -> ' + r.why.slice(0, 110))); }
