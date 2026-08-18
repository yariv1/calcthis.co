'use strict';
/* Guarded idempotent patch: insert .p-sleep block into assets/style.css
   after the .cat-grp[hidden]{display:none} anchor.
   Idempotent: skips if .p-sleep already present. Run from repo root. */
const fs = require('fs');
const F = 'assets/style.css';
let s = fs.readFileSync(F, 'utf8');

if (s.indexOf('.p-sleep') !== -1) {
  console.log('[style.css] .p-sleep already present — skipping.');
  process.exit(0);
}
const anchor = '.cat-grp[hidden]{display:none}';
const n = s.split(anchor).length - 1;
if (n !== 1) throw new Error('[style.css] expected exactly 1 anchor, found ' + n + ' — aborting.');

const BLOCK = "\n  /* ---------------------------------------------------------\n     FITNESS · SLEEP  (body.p-sleep) — sleep-cycle planner\n     Reuses .seg (mode), .dtable tr.cur (recommended rows),\n     .res-big / .bf-res. No advanced mode. */\n  .p-sleep .fld{margin-bottom:16px}\n  .p-sleep #modeSeg{display:flex;width:100%;margin-bottom:18px}\n  .p-sleep #modeSeg button{flex:1;text-align:center}\n  .p-sleep .time-lab{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:600;color:var(--ink-soft);margin-bottom:6px}\n  .p-sleep #nowBtn{font:inherit;font-size:12.5px;font-weight:600;color:var(--amber-deep);background:none;border:0;cursor:pointer;padding:2px 4px}\n  .p-sleep #nowBtn:hover{color:var(--amber)}\n  .p-sleep .time-field{display:flex;align-items:center;gap:10px;width:100%;background:#FBF6EC;border:1px solid var(--line);border-radius:11px;padding:6px 8px 6px 14px;transition:.15s}\n  .p-sleep .time-field:focus-within{border-color:var(--amber);background:#fff;box-shadow:0 0 0 3px rgba(181,118,31,.13)}\n  .p-sleep .time-box{position:relative;flex:none;width:70px;height:34px}\n  .p-sleep .time-ghost,.p-sleep .time-digits{position:absolute;inset:0;width:100%;height:100%;font:inherit;font-size:19px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:1px;line-height:34px;padding:0;margin:0;border:0;background:none}\n  .p-sleep .time-ghost{display:block;z-index:1;pointer-events:none;white-space:pre}\n  .p-sleep .time-ghost .g-on{color:var(--ink)}\n  .p-sleep .time-ghost .g-off{color:var(--muted)}\n  .p-sleep .time-ghost .g-sep{color:var(--ink-soft)}\n  .p-sleep .time-digits{z-index:2;color:transparent;caret-color:var(--ink)}\n  .p-sleep .time-digits:focus{outline:none}\n  .p-sleep .ap-seg{flex:none;padding:2px}\n  .p-sleep .ap-seg button{padding:6px 11px;font-size:12.5px}\n  .p-sleep .clock-ic{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:none;border:0;background:none;color:var(--muted);cursor:pointer;border-radius:8px;padding:0}\n  .p-sleep .clock-ic:hover{color:var(--amber-deep);background:#F3EADA}\n  .p-sleep .bf-res{margin:2px 0 16px}\n  .p-sleep .dtable td:first-child{color:var(--ink);font-weight:600}\n  .p-sleep .dtable td{font-variant-numeric:tabular-nums}\n";
const idx = s.indexOf(anchor) + anchor.length;
s = s.slice(0, idx) + '\n' + BLOCK.replace(/^\n+/, '').replace(/\n+$/, '') + '\n' + s.slice(idx);
fs.writeFileSync(F, s);
console.log('[style.css] .p-sleep block inserted OK.');
