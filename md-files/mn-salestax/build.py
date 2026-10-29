import json, re
L = json.load(open('lines.json'))
recs = []          # {county, name, kind, rates, star}
county = None
cur = None         # last record (for continuation)
mode = None        # 'town' | 'name' | None
pend = None        # pending name-only line (name possibly continued by a rates-only line)
heading_skip = False
def is_county(n):
    return bool(re.search(r'\bCounty\b', n)) and not n.startswith('Townships') and 'City of' not in n
def clean_county(n):
    n = re.sub(r'\s*\(Beginning.*$', '', n); n = re.sub(r'\s*County\s*$', '', n).strip(); return n
def new_rec(name, rates, c):
    global cur, mode
    r = {'county': c, 'name': name, 'rates': dict(rates)}
    recs.append(r); cur = r
    mode = 'town' if name.startswith('Townships') else 'name'
    return r
for l in L:
    n, rt = l['name'], l['rates']
    if 'comb' in rt:
        if n == '' and pend is not None:          # name on previous line, numbers on this one
            n = pend['name']; pend = None
            if cur and cur.get('_pendname'): pass
        elif pend is not None:
            pend = None
        if n.endswith(', City of') or re.search(r', City of( \(.*)?$', n):
            c = None
        else: c = county
        heading_skip = False
        new_rec(n, rt, c)
        continue
    if rt and not n:                               # superscript/footnote only line
        if cur is not None:
            for k, v in rt.items(): cur['rates'].setdefault(k, v)
        continue
    if not n: continue
    # name-only line
    if re.match(r'^(\d{1,2}, 20\d\d\)|20\d\d\))$', n) or n.startswith('(Beginning'):
        continue
    if re.match(r'^Garrison, Kathio, West Mille Lacs|^Sanitary (Sewer|Dist)', n) or (heading_skip and not is_county(n)):
        county = 'Garrison-Kathio-West Mille Lacs Sanitary District'; heading_skip = True; cur = None; mode = None; continue
    if is_county(n):
        county = clean_county(n); cur = None; mode = None; pend = None; continue
    if mode == 'town' and cur is not None and not re.search(r', City of', n):
        cur['name'] += ' ' + n; continue
    if re.search(r', City of( \(.*)?$', n):
        pend = {'name': n}; continue
    if cur is not None and mode == 'name':
        cur['name'] += ' ' + n; continue
    pend = {'name': n}
# clean
out = []
for r in recs:
    nm = re.sub(r'\s+', ' ', r['name']).strip()
    nm = nm.replace('- ', '-')
    r['name'] = nm
bad = []
for r in recs:
    x = r['rates']; s = round(sum(x.get(k, 0) for k in ('ol', 'oa', 'city', 'cty', 'st')), 4)
    if abs(s - x['comb']) > 1e-6: bad.append((r['county'], r['name'][:60], x, s))
print(len(recs), 'records', len(bad), 'sum mismatches')
for b in bad: print(b)
json.dump(recs, open('recs.json', 'w'), indent=0)
