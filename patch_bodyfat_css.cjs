/* Guarded idempotent patch: append the .p-bodyfat block to /assets/style.css
   - skips if already applied (idempotent)
   - THROWS if the HRZone/cat-grp anchor is missing (wrong/corrupt file)
   Run from repo root:  node patch_bodyfat_css.cjs  */
const fs = require('fs');
const FILE = fs.existsSync('assets/style.css') ? 'assets/style.css' : 'style.css';

let src = fs.readFileSync(FILE, 'utf8');

if (src.indexOf('.p-bodyfat') !== -1) {
  console.log('[bodyfat/css] already applied — skipping.');
  process.exit(0);
}
const anchor = '.cat-grp[hidden]{display:none}';
const n = src.split(anchor).length - 1;
if (n !== 1) throw new Error('[bodyfat/css] expected 1 cat-grp anchor, found ' + n + ' — aborting, file not patched.');

const BLOCK = `
  /* =========================================================
     FITNESS · BODY FAT  (body.p-bodyfat) — Navy tape method
     Reuses .seg (sex + unit), .dtable tr.cur (category row),
     .advbtn / .add-row.split (advanced toggle).
     ========================================================= */
  .p-bodyfat .fld{margin-bottom:16px}
  .p-bodyfat .bf-units{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 18px}
  .p-bodyfat .bf-units .ul{font-size:13px;font-weight:600;color:var(--ink-soft)}
  .p-bodyfat #sexSeg{flex:none}
  .p-bodyfat .bf-res{margin:2px 0 16px}
  .p-bodyfat .dtable td:first-child{color:var(--ink)}
  .p-bodyfat #advOut{margin:6px 0 4px}
  .p-bodyfat .bf-cmp{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:1px dashed var(--line)}
  .p-bodyfat .bf-cmp:first-child{border-top:1px dashed var(--line)}
  .p-bodyfat .bf-cmp .k{font-size:13.5px;font-weight:500;color:var(--ink-soft)}
  .p-bodyfat .bf-cmp .v{font-family:'Fraunces',serif;font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink)}
`;

src = src.replace(anchor, anchor + '\n' + BLOCK);
fs.writeFileSync(FILE, src);
console.log('[bodyfat/css] appended .p-bodyfat block to ' + FILE + '.');
