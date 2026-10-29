import json, re, collections
R = json.load(open('recs.json'))
def fm(x): return ('%.4f' % x).rstrip('0').rstrip('.')
# specials: city/area -> text (from DOR Fact Sheet 164S rev. July 2026 and 164M rev. Feb 2025)
LOD = lambda r: fm(r) + '% lodging tax'
SP = {
 'Detroit Lakes': '1% food and beverage tax on restaurant sales',
 'Mankato': '0.5% food and beverage tax on restaurant sales, 0.5% entertainment tax on admissions, 3% lodging tax',
 'Marshall': '1.5% food and beverage tax on restaurant sales, 4.5% lodging tax',
 'North Mankato': '0.5% food and beverage tax on restaurant sales',
 'Proctor': '1% food and beverage tax on restaurant sales',
 'St. Cloud': '1% liquor tax and 1% food tax at restaurants and other places of refreshment',
 'Biwabik': '2% admissions and recreation tax, 1% food and beverage tax and 2% lodging tax inside the Giants Ridge Recreation Area',
 'Cottage Grove': '3% lodging tax', 'Plymouth': '3% lodging tax', 'Richfield': '3% lodging tax', 'Faribault': '3% lodging tax',
 'Fairmont': '3% lodging tax', 'Grand Rapids': '3% lodging tax', 'Ortonville': '3% lodging tax', 'Waseca': '3% lodging tax',
 'Woodbury': '3% lodging tax', 'Northfield': '3% lodging tax', 'Rochester': '7% lodging tax',
 'St. Paul': '7% lodging tax (hotels with 50 or more rooms; 3% under 50 rooms)',
 'Two Harbors': '1% city lodging tax plus 4% Lake County lodging tax',
 'Minneapolis': '3% entertainment tax on admissions, 3% lodging tax (hotels over 50 rooms), and in the downtown area a 3% restaurant tax and a 3% liquor tax',
}
CHISAGO = {'Chisago City', 'Center City', 'Lindstrom', 'Shafer', "Taylors Falls", "Taylor's Falls", 'Amador', 'Chisago Lake', 'Chisago Lakes', 'Franconia'}
VERM = {'Tower', 'Greenwood', 'Vermilion Lake', 'Beatty', 'Breitung'}
def special(city, county, kind):
    c = city
    t = SP.get(c)
    if kind == 'town':
        t = None
        if county == 'Chisago' and c in CHISAGO: t = '3% Chisago Lakes Area lodging tax'
        if county == 'St. Louis' and c in VERM: t = '3% Lake Vermilion Area lodging tax'
        if county == 'Lake': t = '4% Lake County lodging tax'
        if county == 'Lake of the Woods': t = '3% Lake of the Woods County lodging tax'
        return t
    else:
        if county == 'Chisago' and c in CHISAGO: t = (t + ' and ' if t else '') + '3% Chisago Lakes Area lodging tax'
        if county == 'St. Louis' and c in VERM: t = (t + ' and ' if t else '') + '3% Lake Vermilion Area lodging tax'
    if county == 'Lake' and kind != 'town' and c != 'Two Harbors': t = (t + ' and ' if t else '') + '4% Lake County lodging tax'
    if county == 'Lake' and kind == 'town': t = '4% Lake County lodging tax'
    if county == 'Lake of the Woods': t = (t + ' and ' if t else '') + '3% Lake of the Woods County lodging tax'
    return t
rows = []; seen = collections.defaultdict(list)
ended = ('Albert Lea', 'Blackduck', 'New London', 'Scanlon')
for r in R:
    nm = r['name'].replace('Fairbault','Faribault').replace('Stewertville','Stewartville').replace('St. Peter. City of','St. Peter, City of'); cty = r['county'] or ''; x = r['rates']
    if nm.startswith(tuple(e + ', City of' for e in ended)) and re.search(r'\((E|e)nding', nm): continue
    comb = x['comb']
    if nm.startswith('Townships:'):
        names = nm[len('Townships:'):]
        names = re.sub(r'\band\s+', ',', names) if re.search(r', and ', names) or names.strip().startswith('and ') else names
        names = re.sub(r',?\s+and\s+', ', ', names)
        parts = [p.strip() for p in names.split(',') if p.strip()]
        for p in parts:
            star = '*' in p; p = p.replace('*', '').strip()
            if not p: continue
            lab = p + ' Township — ' + (cty + ' County' if 'Sanitary' not in cty else cty)
            note = special(p, cty, 'town')
            rows.append([lab, comb, 'star' if star else '', note or '', p])
        continue
    star = '*' in nm; nm = nm.replace('*', '').strip()
    if nm.endswith(', City of'):
        base = nm[:-len(', City of')].strip(); lab = 'City of ' + base; note = special(base, None, 'city'); name_for = base
    else:
        lab = nm + ' — ' + (cty + ' County' if 'Sanitary' not in cty else cty); note = special(nm, cty, 'city'); name_for = nm
    rows.append([lab, comb, 'star' if star else '', note or '', name_for])
# dedupe
out = {}; dups = []
for lab, comb, star, note, nf in rows:
    if lab in out:
        if out[lab][0] != comb: dups.append((lab, out[lab][0], comb))
        continue
    out[lab] = (comb, star, note)
print(len(rows), 'rows', len(out), 'unique', len(dups), 'conflicting dups')
for d in dups: print(d)
data = []
for lab, (comb, star, note) in out.items():
    parts = []
    if note: parts.append('Also charged here, not included in this rate: ' + note + '.')
    if star: parts.append('This place may fall in more than one tax area — use the DOR address lookup if you are near its edge.')
    data.append([lab, comb, comb, comb, comb, ' '.join(parts)])
data.append(['Anywhere else in Minnesota — not listed in the DOR guide', 6.875, 6.875, 6.875, 6.875, 'The DOR rate guide lists only places that have a local sales tax, so a place missing from it is shown at the 6.875% state rate. Confirm with the DOR address lookup if you are unsure.'])
json.dump(data, open('mn-rates.json', 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
combs = [d[1] for d in data]
combs=[d[1] for d in data]
print(len(data), 'places; lo', min(combs), 'hi', max(combs))
cityhi = max(d[1] for d in data if 'Township' not in d[0]); print('city hi', cityhi)
import os; print(os.path.getsize('mn-rates.json'))
import sys
sys.stdout.reconfigure(encoding='utf8')
for d in data[:6] + [d for d in data if 'Mankato' in d[0] or d[0].startswith('City of Minneapolis') or 'Garrison' in d[0]][:12]: print(d)
