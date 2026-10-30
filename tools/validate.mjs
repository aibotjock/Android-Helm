// Checks the repository is consistent: source registry, deadline references, playbook front matter and links.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSources, parseFrontMatter } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources/sources.json'), 'utf8'));
const check = validateSources(sources);
errors.push(...check.errors);
const deadlines = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/deadlines.json'), 'utf8')).deadlines;
for (const d of deadlines) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errors.push(`deadline date format: ${d.id}`);
  if (!check.ids.has(d.source)) errors.push(`deadline ${d.id} cites unknown source ${d.source}`);
}
const dir = path.join(ROOT, 'playbooks');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
  const fm = parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (!fm) { errors.push(`${f}: missing front matter`); continue; }
  if (!fm.title) errors.push(`${f}: missing title`);
  if (!Array.isArray(fm.sources) || fm.sources.length === 0) errors.push(`${f}: needs sources`);
  for (const s of fm.sources || []) if (!check.ids.has(s)) errors.push(`${f}: unknown source ${s}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.last_reviewed || '')) errors.push(`${f}: last_reviewed must be YYYY-MM-DD`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`ok: ${check.ids.size} sources, ${deadlines.length} deadlines, playbooks checked`);
