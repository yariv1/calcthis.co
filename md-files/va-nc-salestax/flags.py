"""Rasterises city flag SVGs (Wikimedia Commons) to 60x40 webp like the other flag cubes. Usage: python flags.py <dir with chi.svg lax.svg lvs.svg>"""
import sys, os, io
import fitz
from PIL import Image

src = sys.argv[1]
out = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'flags'))
for code in ('chi', 'lax', 'lvs'):
    doc = fitz.open(os.path.join(src, code + '.svg'))
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(240 / page.rect.width, 240 / page.rect.width), alpha=False)
    im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
    w, h = im.size
    tw, th = 60, 40
    # cover-fit to 60x40
    k = max(tw / w, th / h)
    im = im.resize((max(tw, round(w * k)), max(th, round(h * k))), Image.LANCZOS)
    l, t = (im.width - tw) // 2, (im.height - th) // 2
    im = im.crop((l, t, l + tw, t + th))
    im.save(os.path.join(out, code + '.webp'), 'WEBP', quality=90)
    print(code, w, h, '->', im.size)
