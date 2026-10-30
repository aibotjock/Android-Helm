// Compares the registry before and after a run. Writes generated/CHANGES.md (URLs and titles only).
// Usage: node tools/diff.mjs <old registry.json> <new registry.json>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffRegistries } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [oldPath, newPath] = process.argv.slice(2);
const read = p => {
  try { const t = p ? fs.readFileSync(p, 'utf8').trim() : ''; return t ? JSON.parse(t) : { pages: [] }; }
  catch { return { pages: [] }; }
};
const { changed, added, removed } = diffRegistries(read(oldPath), read(newPath));
const lines = [
  '# Policy registry changes', '',
  `- Changed pages: ${changed.length}`, `- New pages: ${added.length}`, `- Removed pages (unseen for 60+ days): ${removed.length}`, '',
  '## Changed', ...changed.map(c => `- ${c.title || c.url} — ${c.url}`), '',
  '## New', ...added.map(a => `- ${a.title || a.url} — ${a.url}`), '',
  '## Removed', ...removed.map(r => `- ${r.title || r.url} — ${r.url}`), '',
  'Review each change against the playbooks before updating them. Page text is never stored in this repository.', '',
];
fs.writeFileSync(path.join(ROOT, 'generated/CHANGES.md'), lines.join('\n'));
console.log(`changed ${changed.length}, new ${added.length}, removed ${removed.length}`);
