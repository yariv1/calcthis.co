"""Builds assets/data/va-rates.json (Virginia Tax 'Jan 2026 - Present' sheet) and assets/data/nc-rates.json (NCDOR current rates table).
Row format [label, sales %, use %, food %, food use %] like the other place files.
Run: python md-files/va-nc-salestax/mk.py <path to va.xlsx> <path to nccur.txt>
  va.xlsx  = https://www.tax.virginia.gov/sites/default/files/inline-files/sales-and-use-tax-rates-by-locality-by-date.xlsx
  nccur.txt = text of https://www.ncdor.gov/taxes-forms/sales-and-use-tax/sales-and-use-tax-rates/current-sales-and-use-tax-rates"""
import sys, json, re, os
import openpyxl

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

def r3(x):
    return round(x + 1e-12, 4)

# ---- Virginia ----
wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
ws = wb['Jan 2026 - Present']
rows = []
for r in ws.iter_rows(values_only=True):
    name, code, gen, food = r[1], r[2], r[3], r[4]
    if not isinstance(code, int) or not isinstance(gen, (int, float)):
        continue
    nm = str(name).strip()
    county = code < 51500
    nm = nm.replace(' Of ', ' of ')
    if county:
        label = nm if nm.endswith(' County') else nm + ' County'
    else:
        label = nm if nm.endswith(' City') else nm + ' City'
    rows.append([label, r3(gen * 100), r3(gen * 100), r3(food * 100), r3(food * 100)])
VA_ALIAS = {'Fairfax County': 'Reston, Herndon, McLean, Vienna', 'Loudoun County': 'Leesburg, Ashburn', 'Prince William County': 'Woodbridge, Dale City', 'Henrico County': 'Glen Allen', 'Chesterfield County': 'Midlothian', 'Montgomery County': 'Blacksburg'}
for r in rows:
    if r[0] in VA_ALIAS:
        r[0] = r[0] + ' (' + VA_ALIAS[r[0]] + ')'
rows.sort(key=lambda x: x[0])
print('VA rows', len(rows), sorted(set(x[1] for x in rows)))
json.dump(rows, open(os.path.join(root, 'assets/data/va-rates.json'), 'w'), separators=(',', ':'))

# ---- North Carolina ----
txt = open(sys.argv[2], encoding='utf8').read()
txt = re.sub(r'\s+', ' ', txt)
i = txt.index('Rate Alamance')
seg = txt[i + 5:]
seg = seg[:seg.index('Export Table Data')]
pairs = re.findall(r'([A-Z][A-Za-z\. ]+?) (\d+(?:\.\d+)?)%(\*?)', seg)
nc = []
for nm, rate, star in pairs:
    nm = nm.strip()
    nc.append([nm + ' County', float(rate), float(rate), 2, 2])
NC_ALIAS = {'Mecklenburg County': 'Charlotte', 'Wake County': 'Raleigh', 'Durham County': 'Durham', 'Guilford County': 'Greensboro', 'Forsyth County': 'Winston-Salem', 'Cumberland County': 'Fayetteville', 'Buncombe County': 'Asheville', 'New Hanover County': 'Wilmington', 'Pitt County': 'Greenville', 'Gaston County': 'Gastonia', 'Onslow County': 'Jacksonville'}
for r in nc:
    if r[0] in NC_ALIAS:
        r[0] = r[0] + ' (' + NC_ALIAS[r[0]] + ')'
nc.sort(key=lambda x: x[0])
print('NC rows', len(nc), sorted(set(x[1] for x in nc)))
json.dump(nc, open(os.path.join(root, 'assets/data/nc-rates.json'), 'w'), separators=(',', ':'))
