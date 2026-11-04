// Builds assets/data/fl-rates.json from the Florida DOR "Discretionary Sales Surtax Information for Calendar Year 2026" (DR-15DSS, R. 11/25,
// https://floridarevenue.com/Forms_library/current/dr15dss_26.pdf; saved here as dr15dss_2026.pdf). Row = [label, combined%, use%, food%, foodUse%, note].
// Combined = 6% state + the county's TOTAL discretionary surtax. The surtax applies only to the first $5,000 of a single item (engine: places.cap).
// Totals were read with pdfplumber word coordinates and checked against the per-surtax lines of the same form.
// Refresh every November (new DR-15DSS): update SURTAX, EXPIRES and the engine FL record (eff, n, lo, hi), then `node md-files/fl-salestax/mk.js`.
const fs = require('fs'), path = require('path');
const SURTAX = {
  'Alachua': 1.5, 'Baker': 1, 'Bay': 1, 'Bradford': 1, 'Brevard': 1, 'Broward': 1, 'Calhoun': 1.5, 'Charlotte': 1, 'Citrus': 0, 'Clay': 1.5, 'Collier': 0, 'Columbia': 1.5,
  'DeSoto': 1.5, 'Dixie': 1, 'Duval': 1.5, 'Escambia': 1.5, 'Flagler': 1, 'Franklin': 1.5, 'Gadsden': 1.5, 'Gilchrist': 1, 'Glades': 1, 'Gulf': 1, 'Hamilton': 2, 'Hardee': 1,
  'Hendry': 1.5, 'Hernando': 0.5, 'Highlands': 1.5, 'Hillsborough': 1.5, 'Holmes': 1.5, 'Indian River': 1, 'Jackson': 1.5, 'Jefferson': 1, 'Lafayette': 1, 'Lake': 1, 'Lee': 0.5,
  'Leon': 1.5, 'Levy': 1, 'Liberty': 1.5, 'Madison': 1.5, 'Manatee': 1, 'Marion': 1.5, 'Martin': 0.5, 'Miami-Dade': 1, 'Monroe': 1.5, 'Nassau': 1, 'Okaloosa': 1, 'Okeechobee': 1,
  'Orange': 0.5, 'Osceola': 1.5, 'Palm Beach': 0.5, 'Pasco': 1, 'Pinellas': 1, 'Polk': 1, 'Putnam': 1, 'St. Johns': 0.5, 'St. Lucie': 1, 'Santa Rosa': 1, 'Sarasota': 1, 'Seminole': 1,
  'Sumter': 1, 'Suwannee': 1, 'Taylor': 1, 'Union': 1, 'Volusia': 0.5, 'Wakulla': 1.5, 'Walton': 1, 'Washington': 1.5
};
// surtaxes that the form lists with an expiration date of Dec 31, 2026
const EXPIRES = {
  'Brevard': 'Both 0.5% surtaxes on the 2026 form are listed to expire December 31, 2026.',
  'Charlotte': 'The 1% surtax on the 2026 form is listed to expire December 31, 2026.',
  'Liberty': 'One 0.5% surtax on the 2026 form is listed to expire December 31, 2026.',
  'Santa Rosa': 'One 0.5% surtax on the 2026 form is listed to expire December 31, 2026.'
};
// city -> county (convenience aliases: the rate is always the county's; Florida has no city sales taxes)
const CITIES = {
  'Miami': 'Miami-Dade', 'Hialeah': 'Miami-Dade', 'Miami Beach': 'Miami-Dade', 'Miami Gardens': 'Miami-Dade', 'Homestead': 'Miami-Dade', 'Doral': 'Miami-Dade', 'Coral Gables': 'Miami-Dade',
  'Orlando': 'Orange', 'Winter Park': 'Orange', 'Apopka': 'Orange', 'Ocoee': 'Orange',
  'Tampa': 'Hillsborough', 'Brandon': 'Hillsborough', 'Plant City': 'Hillsborough', 'Jacksonville': 'Duval', 'Jacksonville Beach': 'Duval',
  'St. Petersburg': 'Pinellas', 'Clearwater': 'Pinellas', 'Largo': 'Pinellas', 'Fort Lauderdale': 'Broward', 'Hollywood': 'Broward', 'Pembroke Pines': 'Broward', 'Coral Springs': 'Broward',
  'Miramar': 'Broward', 'Davie': 'Broward', 'Sunrise': 'Broward', 'Plantation': 'Broward', 'Pompano Beach': 'Broward', 'Tallahassee': 'Leon', 'Cape Coral': 'Lee', 'Fort Myers': 'Lee',
  'Bonita Springs': 'Lee', 'Port St. Lucie': 'St. Lucie', 'Fort Pierce': 'St. Lucie', 'Gainesville': 'Alachua', 'Pensacola': 'Escambia', 'Naples': 'Collier', 'Marco Island': 'Collier',
  'Sarasota': 'Sarasota', 'Venice': 'Sarasota', 'Daytona Beach': 'Volusia', 'Deltona': 'Volusia', 'Boca Raton': 'Palm Beach', 'West Palm Beach': 'Palm Beach', 'Boynton Beach': 'Palm Beach',
  'Delray Beach': 'Palm Beach', 'Jupiter': 'Palm Beach', 'Kissimmee': 'Osceola', 'Lakeland': 'Polk', 'Winter Haven': 'Polk', 'Palm Bay': 'Brevard', 'Melbourne': 'Brevard', 'Titusville': 'Brevard',
  'Ocala': 'Marion', 'Panama City': 'Bay', 'Panama City Beach': 'Bay', 'Key West': 'Monroe', 'Marathon': 'Monroe', 'St. Augustine': 'St. Johns', 'Fort Walton Beach': 'Okaloosa', 'Destin': 'Okaloosa',
  'Crestview': 'Okaloosa', 'Bradenton': 'Manatee', 'Punta Gorda': 'Charlotte', 'Port Charlotte': 'Charlotte', 'Spring Hill': 'Hernando', 'Sanford': 'Seminole', 'Altamonte Springs': 'Seminole',
  'Vero Beach': 'Indian River', 'Fernandina Beach': 'Nassau', 'Lake City': 'Columbia', 'Milton': 'Santa Rosa', 'Gulf Breeze': 'Santa Rosa', 'New Port Richey': 'Pasco', 'Wesley Chapel': 'Pasco',
  'Leesburg': 'Lake', 'Clermont': 'Lake', 'Mount Dora': 'Lake', 'Stuart': 'Martin', 'Palm Coast': 'Flagler', 'Immokalee': 'Collier', 'Apalachicola': 'Franklin', 'Marianna': 'Jackson', 'Live Oak': 'Suwannee'
};
const out = [], seen = new Set(), clean = (c) => c + ' County';
Object.keys(SURTAX).sort().forEach((c) => { const r = Math.round((6 + SURTAX[c]) * 1000) / 1000; out.push([clean(c), r, r, r, r, EXPIRES[c] || '']); seen.add(clean(c)); });
Object.keys(CITIES).sort().forEach((city) => {
  const c = CITIES[city]; if (!(c in SURTAX)) throw new Error('unknown county ' + c);
  const r = Math.round((6 + SURTAX[c]) * 1000) / 1000, label = city + ' — ' + clean(c); if (seen.has(label)) throw new Error('dup ' + label);
  seen.add(label); out.push([label, r, r, r, r, 'A city in ' + clean(c) + ': Florida has no city sales taxes, so the county rate applies. ' + (EXPIRES[c] || '')]);
});
if (Object.keys(SURTAX).length !== 67) throw new Error('need 67 counties, got ' + Object.keys(SURTAX).length);
fs.writeFileSync(path.join(__dirname, '..', '..', 'assets', 'data', 'fl-rates.json'), JSON.stringify(out.map((r) => r.map((x) => typeof x === 'string' ? x.trim() : x))));
const rates = out.map((x) => x[1]);
console.log(out.length, Math.min.apply(null, rates), Math.max.apply(null, rates));
