# Builds assets/data/ca-rates.json from the CDTFA "California City & County Sales & Use Tax Rates" xlsx
# (https://cdtfa.ca.gov/taxes-and-fees/SalesTaxRates10-1-26.xlsx, effective Oct 1 2026). Row = [label, combined%, use%, food%, foodUse%, note]
# Refresh quarterly: download the new xlsx as rates.xlsx here, run this, copy ca-rates.json, update n/lo/hi + eff + src in the engine CA record.
import openpyxl, json, os, collections
here = os.path.dirname(os.path.abspath(__file__))
ws = openpyxl.load_workbook(os.path.join(here, 'rates.xlsx'), read_only=True).active
out = []; seen = set()
rows = [r for r in ws.iter_rows(min_row=4, values_only=True) if r[0] and r[1] is not None]
dupc = collections.Counter(r[0] for r in rows if r[3] == 'City')
for r in rows:
    name, rate, county, typ, note = r[0], r[1], r[2], r[3], r[4]
    rt = round(rate * 100, 4)
    if typ == 'City': label = name if dupc[name] == 1 else name + ' \u2014 ' + county + ' County'
    elif name.endswith('Unincorporated Area'): label = name.replace(' Unincorporated Area', '') + ' (unincorporated areas)'
    else: label = name
    n = ''
    if typ == 'County' and 'Unincorporated' in name: n = 'Applies to the unincorporated areas of ' + county + ' County only \u2014 cities inside the county have their own lines.'
    elif note: n = str(note)
    if label in seen: raise SystemExit('dup ' + label)
    seen.add(label); out.append([label, rt, rt, rt, rt, n])
out.sort(key=lambda x: x[0].lower())
json.dump(out, open(os.path.join(here, '..', '..', 'assets', 'data', 'ca-rates.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(len(out), min(x[1] for x in out), max(x[1] for x in out))
