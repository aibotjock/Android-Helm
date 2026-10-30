// Turns data/deadlines.json into generated/DEADLINES.md with passed / within 60 days / upcoming.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deadlineStatus } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/deadlines.json'), 'utf8')).deadlines;
const today = new Date();
const rows = items
  .map(d => ({ ...d, ...deadlineStatus(d.date, today) }))
  .sort((a, b) => a.date.localeCompare(b.date));
const out = [
  '# Google Play dated obligations', '',
  `Generated ${today.toISOString().slice(0, 10)}. Dates come from the sources listed in each row. "Approximate" means the source gives a month, not a day.`, '',
  '| Date | Status | Obligation | Source | Note |', '|---|---|---|---|---|',
  ...rows.map(r => `| ${r.date}${r.approximate ? ' (approx.)' : ''} | ${r.state} | ${r.title} | ${r.source} | ${r.note || ''} |`), '',
];
fs.writeFileSync(path.join(ROOT, 'generated/DEADLINES.md'), out.join('\n'));
const soon = rows.filter(r => r.state === 'within 60 days');
console.log(`deadlines: ${rows.length}; within 60 days: ${soon.length}`);
for (const r of soon) console.log(`  ${r.date} ${r.title}`);
