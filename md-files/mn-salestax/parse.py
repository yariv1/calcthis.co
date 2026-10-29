import pdfplumber, re, json
p = pdfplumber.open('q4.pdf')
PCT = re.compile(r'^(\d+\.\d+)%(\d?)$')
def col(x):
    if x < 225: return None
    if x < 270: return 'ol'
    if x < 300: return 'oa'
    if x < 360: return 'city'
    if x < 415: return 'cty'
    if x < 470: return 'st'
    return 'comb'
lines = []
for pi, pg in enumerate(p.pages):
    if pi == 0: continue
    ws = [w for w in pg.extract_words(keep_blank_chars=False) if 70 < w['top'] < 740]
    byy = []
    for w in sorted(ws, key=lambda w: (w['top'], w['x0'])):
        for g in byy:
            if abs(g[0] - w['top']) <= 2.6: g[1].append(w); break
        else: byy.append([w['top'], [w]])
    for y, g in sorted(byy):
        g.sort(key=lambda w: w['x0'])
        text = ' '.join(w['text'] for w in g)
        if re.search(r'Local Sales and Use Tax Rate Guide|Effective 10/1/2026|County/City|^\d+$|Sales Tax Rate$|Combined|Other Other|Local Area|Rate Rate', text) and not PCT.search(text): continue
        name = ' '.join(w['text'] for w in g if not PCT.match(w['text']) and w['x0'] < 225)
        rates = {}
        for w in g:
            m = PCT.match(w['text'])
            if m:
                c = col(w['x0']); rates[c] = float(m.group(1)); 
                if m.group(2): rates['fn_' + c] = m.group(2)
        # words at x>=225 that are not rates are ignored (none expected)
        lines.append({'pg': pi + 1, 'y': round(y), 'name': name.strip(), 'rates': rates})
json.dump(lines, open('lines.json', 'w'), indent=0)
print(len(lines))
