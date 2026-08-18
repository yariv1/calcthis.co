/* Guarded idempotent patch: append the .p-1rm block to /assets/style.css
   - skips if already applied (idempotent)
   - THROWS if the cat-grp anchor is missing (wrong/corrupt file)
   Run from repo root:  node patch_1rm_css.cjs  */
const fs = require('fs');
const FILE = fs.existsSync('assets/style.css') ? 'assets/style.css' : 'style.css';
let src = fs.readFileSync(FILE, 'utf8');
if (src.indexOf('.p-1rm') !== -1) { console.log('[1rm/css] already applied — skipping.'); process.exit(0); }
const anchor = '.cat-grp[hidden]{display:none}';
const n = src.split(anchor).length - 1;
if (n !== 1) throw new Error('[1rm/css] expected 1 cat-grp anchor, found ' + n + ' — aborting, file not patched.');
const BLOCK = "\n  /* =========================================================\n     FITNESS · ONE REP MAX  (body.p-1rm) — 1RM estimator\n     Reuses .seg, .dtable tr.cur, .advbtn / .add-row.split.\n     ========================================================= */\n  .p-1rm .fld{margin-bottom:16px}\n  .p-1rm #unitSeg{flex:none}\n  .p-1rm .bf-res{margin:2px 0 16px}\n  .p-1rm .dtable td:first-child{color:var(--ink)}\n  .p-1rm #advOut{margin:6px 0 4px}\n  .p-1rm .orm-head{font-size:12.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--spruce-soft);margin:2px 0 4px}\n  .p-1rm .bf-cmp{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:1px dashed var(--line)}\n  .p-1rm .bf-cmp:last-of-type{border-bottom:none}\n  .p-1rm .bf-cmp .k{font-size:13.5px;font-weight:500;color:var(--ink-soft)}\n  .p-1rm .bf-cmp .v{font-family:'Fraunces',serif;font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink)}\n";
src = src.replace(anchor, anchor + '\n' + BLOCK);
fs.writeFileSync(FILE, src);
console.log('[1rm/css] appended .p-1rm block to ' + FILE + '.');
