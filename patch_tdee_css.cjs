/* Guarded idempotent patch: append the .p-tdee block to /assets/style.css
   - skips if already applied (idempotent)
   - THROWS if the cat-grp anchor is missing (wrong/corrupt file)
   Run from repo root:  node patch_tdee_css.cjs  */
const fs = require('fs');
const FILE = fs.existsSync('assets/style.css') ? 'assets/style.css' : 'style.css';

let src = fs.readFileSync(FILE, 'utf8');

if (src.indexOf('.p-tdee') !== -1) {
  console.log('[tdee/css] already applied — skipping.');
  process.exit(0);
}
const anchor = '.cat-grp[hidden]{display:none}';
const n = src.split(anchor).length - 1;
if (n !== 1) throw new Error('[tdee/css] expected 1 cat-grp anchor, found ' + n + ' — aborting, file not patched.');

const BLOCK = "\n  /* =========================================================\n     FITNESS · TDEE / CALORIES  (body.p-tdee) — Mifflin-St Jeor\n     Reuses .seg, .dtable tr.cur, .advbtn / .add-row.split.\n     ========================================================= */\n  .p-tdee .fld{margin-bottom:16px}\n  .p-tdee .bf-units{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 18px}\n  .p-tdee .bf-units .ul{font-size:13px;font-weight:600;color:var(--ink-soft)}\n  .p-tdee #sexSeg{flex:none}\n  .p-tdee .bf-res{margin:2px 0 16px}\n  .p-tdee .dtable td:first-child{color:var(--ink)}\n  .p-tdee .zsub{color:var(--muted);font-weight:500;font-size:12.5px}\n  .p-tdee #advOut{margin:6px 0 4px}\n  .p-tdee .bf-cmp{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:1px dashed var(--line)}\n  .p-tdee .bf-cmp:first-child{border-top:1px dashed var(--line)}\n  .p-tdee .bf-cmp .k{font-size:13.5px;font-weight:500;color:var(--ink-soft)}\n  .p-tdee .bf-cmp .v{font-family:'Fraunces',serif;font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink)}\n  .p-tdee .macro-head{font-size:12.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--spruce-soft);margin:14px 0 4px}\n  .p-tdee .macro{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--line)}\n  .p-tdee .macro:last-of-type{border-bottom:none}\n  .p-tdee .macro .k{font-size:14px;font-weight:600;color:var(--ink)}\n  .p-tdee .macro .g{font-family:'Fraunces',serif;font-size:18px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink)}\n  .p-tdee .macro .pc{font-size:13px;color:var(--muted);font-weight:600;font-variant-numeric:tabular-nums;min-width:40px;text-align:right}\n";

src = src.replace(anchor, anchor + '\n' + BLOCK);
fs.writeFileSync(FILE, src);
console.log('[tdee/css] appended .p-tdee block to ' + FILE + '.');
