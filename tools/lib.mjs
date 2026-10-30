// Pure helpers shared by the refresh tools. No dependencies: Node 18+ only.
import crypto from 'node:crypto';

export const PRIORITY_CADENCE = { P0: 7, P1: 30, P2: 90, P3: 365 };
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ' };

export function decode(s) {
  return s.replace(/&(?:amp|lt|gt|quot|#39|#x27|nbsp);/g, m => ENT[m]);
}

export function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decode(m ? m[1] : '').replace(/\s+/g, ' ').trim();
}

// Visible text only; scripts, styles and comments removed. Used for hashing and local diffs, never committed.
export function normalizeText(html) {
  const stripped = html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decode(stripped).replace(/\s+/g, ' ').trim();
}

export function extractLinks(html, base) {
  const out = new Set();
  const re = /href\s*=\s*["']([^"'#][^"']*)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    try { const u = new URL(decode(m[1]), base); u.hash = ''; out.add(u.href); } catch { /* ignore bad links */ }
  }
  return [...out];
}

// Tracking and display-only parameters are dropped so one page has one address.
const DROP_PARAMS = ['hl', 'visit_id', 'rd', 'sjid'];
export function canonical(u) {
  const x = new URL(u);
  x.hash = '';
  for (const p of DROP_PARAMS) x.searchParams.delete(p);
  x.pathname = x.pathname.replace(/\/+$/, '') || '/';
  return x.href.replace(/\?$/, '');
}

export function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Front matter: a block between --- lines with "key: value" or "key: [a, b]".
export function parseFrontMatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    fm[kv[1]] = v;
  }
  return fm;
}

export function validateSources(doc) {
  const errors = [];
  const ids = new Set();
  const list = Array.isArray(doc?.sources) ? doc.sources : [];
  for (const s of list) {
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) errors.push(`bad id: ${s.id}`);
    if (ids.has(s.id)) errors.push(`duplicate id: ${s.id}`);
    ids.add(s.id);
    if (!/^https:\/\//.test(s.url || '')) errors.push(`not https: ${s.id}`);
    if (!(s.priority in PRIORITY_CADENCE)) errors.push(`bad priority: ${s.id}`);
    if (s.cadence_days !== undefined && s.cadence_days !== PRIORITY_CADENCE[s.priority]) errors.push(`cadence must match priority: ${s.id}`);
    const depth = s.crawl_depth ?? 0;
    if (!Number.isInteger(depth) || depth < 0 || depth > 3) errors.push(`bad crawl_depth: ${s.id}`);
    if (depth > 0 && !s.crawl_prefix) errors.push(`crawl needs crawl_prefix: ${s.id}`);
  }
  return { ok: errors.length === 0, errors, ids };
}

// Compares two registries. A page missing from the new run is "removed" only after staleDays unseen.
export function diffRegistries(prev, next, { today = new Date(), staleDays = 60 } = {}) {
  const pm = new Map((prev?.pages || []).map(p => [p.url, p]));
  const nm = new Map((next?.pages || []).map(p => [p.url, p]));
  const changed = [], added = [], removed = [];
  for (const [url, n] of nm) {
    if (!n.sha256) continue; // a page that failed this run has no new content to compare
    const p = pm.get(url);
    if (!p) added.push(n);
    else if (p.sha256 !== n.sha256) changed.push({ url, title: n.title });
  }
  for (const [url, p] of pm) {
    if (nm.has(url)) continue;
    const ageDays = (today - new Date(p.lastSeen)) / 864e5;
    if (ageDays > staleDays) removed.push(p);
  }
  return { changed, added, removed };
}

export function deadlineStatus(date, today = new Date()) {
  const t = Date.parse(date + 'T00:00:00Z');
  const base = Date.parse(today.toISOString().slice(0, 10) + 'T00:00:00Z');
  const days = Math.round((t - base) / 864e5);
  if (days < 0) return { state: 'passed', days };
  if (days <= 60) return { state: 'within 60 days', days };
  return { state: 'upcoming', days };
}

// robots.txt: only the rules that apply to every crawler ("User-agent: *") are used.
export function parseRobots(text) {
  const rules = [];
  let applies = false;
  for (const raw of String(text || '').split('\n')) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    if (key === 'user-agent') applies = val === '*';
    else if (key === 'disallow' && applies && val) rules.push(val);
  }
  return rules;
}

const escapeRe = s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
export function isDisallowed(pathWithQuery, rules) {
  return rules.some(rule => {
    let body = rule, end = '';
    if (body.endsWith('$')) { body = body.slice(0, -1); end = '$'; }
    return new RegExp('^' + body.split('*').map(escapeRe).join('.*') + end).test(pathWithQuery);
  });
}
