# Builds assets/data/tx-rates.json from the Texas Comptroller "Texas Sales and Use Tax Rates" table (October 2026)
# https://comptroller.texas.gov/taxes/sales/city.php  (saved here as city.html; same data as city-rates.xlsx / city-rates.pdf)
# Row = [label, combined%, use%, food%, foodUse%, note]; the note lists the pieces that make up the rate.
# Refresh quarterly (Jan/Apr/Jul/Oct): curl the page again, run this, copy tx-rates.json to assets/data, update n/lo/hi/baseHi + eff + src in the engine TX record.
import re, html, json, os, collections
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, 'city.html'), encoding='utf8', errors='ignore').read()
t = re.sub(r'(?s)<(script|style)[^>]*>.*?</\1>', '', t)
rows = []
for r in re.findall(r'(?s)<tr[^>]*>(.*?)</tr>', t):
    c = [html.unescape(re.sub(r'<[^>]+>', '', x)).replace('\xa0', ' ').strip() for x in re.findall(r'(?s)<t[dh][^>]*>(.*?)</t[dh]>', r)]
    if len(c) == 4 and c[0] != 'Name': rows.append(c)
places = []
for c in rows:
    if c[3] not in ('', '�'):
        places.append({'name': c[0], 'rate': c[2], 'total': c[3], 'parts': []})
    elif places:
        places[-1]['parts'].append((c[0], c[2]))
def pct(x):
    return round(float(x) * 100, 4) if x not in ('', None) else 0.0
def fmt(v):
    s = ('%.4f' % v).rstrip('0').rstrip('.')
    return s
out = []; seen = collections.Counter()
for p in places:
    total = pct(p['total'])
    parts = []
    if pct(p['rate']): parts.append((p['name'], pct(p['rate'])))
    for n, r in p['parts']:
        if pct(r): parts.append((n, pct(r)))
    label = re.sub(r'\s+', ' ', p['name'])
    out.append({'label': label, 'total': total, 'parts': parts})
# same place listed several times (county / special-district variants) with the SAME combined rate -> one row
grp = collections.defaultdict(list)
for o in out: grp[o['label']].append(o)
merged = []; done = set()
for o in out:
    g = grp[o['label']]
    if len(g) > 1 and len({x['total'] for x in g}) == 1:
        if o['label'] in done: continue
        done.add(o['label']); o['variants'] = len(g); merged.append(o)
    else: merged.append(o)
out = merged
# make labels unique: same name + different pieces -> add the first county/district piece
cnt = collections.Counter(o['label'] for o in out)
for o in out:
    if cnt[o['label']] > 1:
        extra = [n for n, r in o['parts'] if n != o['label']]
        if extra: o['label'] = o['label'] + ' — ' + extra[0]
final = []; seen = {}
for o in out:
    key = o['label']
    if key in seen:
        if seen[key]['total'] == o['total']: continue  # exact duplicate row
        k = 2
        while key + ' (' + str(k) + ')' in seen: k += 1
        o['label'] = key + ' (' + str(k) + ')'; key = o['label']
    seen[key] = o; final.append(o)
data = []
for o in final:
    s = sum(r for n, r in o['parts'])
    note = 'State 6.25%' + ''.join(' + ' + n + ' ' + fmt(r) + '%' for n, r in o['parts']) + ' = ' + fmt(o['total']) + '%' + (' (capped at 8.25%)' if abs(6.25 + s - o['total']) > 0.0005 else '')
    if o.get('variants'): note = 'State 6.25% + local = ' + fmt(o['total']) + '%. The Comptroller lists ' + str(o['variants']) + ' county or special-district variants of this place and all of them total ' + fmt(o['total']) + '%.'
    data.append([o['label'], o['total'], o['total'], o['total'], o['total'], note])
data.sort(key=lambda x: x[0].lower())
json.dump(data, open(os.path.join(here, '..', '..', 'assets', 'data', 'tx-rates.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(len(data), min(x[1] for x in data), max(x[1] for x in data))
bad = [x for x in data if abs(6.25 + sum(float(m) for m in re.findall(r'\+ [^+=]*? ([\d.]+)%', x[5])) - x[1]) > 0.0005 and 'capped' not in x[5]]
print('sum mismatches', len(bad), bad[:3])
