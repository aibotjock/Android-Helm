// Checks due sources and records each page's URL, title, hash and last-seen date.
// Page text is cached in cache/ (never committed). Politeness: one request at a time, 2 seconds apart,
// robots.txt honoured, back-off on 429/503, and a source is retried next run if it was blocked.
// Usage: node tools/crawl.mjs [--force]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRIORITY_CADENCE, extractTitle, normalizeText, extractLinks, canonical, sha256, validateSources, parseRobots, isDisallowed } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');
const UA = 'android-helm-refresh/1.0 (+https://github.com/aibotjock/Android-Helm)';
const DELAY_MS = 2000, TIMEOUT_MS = 25000, MAX_BLOCKS_PER_SOURCE = 5;
const ASSET = /\.(png|jpe?g|gif|svg|webp|ico|css|js|pdf|zip|woff2?|ttf)(\?|$)/i;
const read = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback);
const write = (p, obj) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 1) + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const sources = read(path.join(ROOT, 'sources/sources.json'), { sources: [] });
const check = validateSources(sources);
if (!check.ok) { console.error(check.errors.join('\n')); process.exit(1); }

const statePath = path.join(ROOT, 'state/state.json');
const regPath = path.join(ROOT, 'generated/registry.json');
const runPath = path.join(ROOT, 'generated/RUN.md');
const state = read(statePath, {});
const prev = read(regPath, { pages: [] });
const prevByUrl = new Map(prev.pages.map(p => [p.url, p]));
const now = new Date();
const today = now.toISOString().slice(0, 10);
const isDue = s => FORCE || !state[s.id]?.last_checked || (now - new Date(state[s.id].last_checked)) / 864e5 >= PRIORITY_CADENCE[s.priority];
const due = sources.sources.filter(isDue);

let lastRequest = 0;
async function politeGet(url, headers = {}) {
  const wait = lastRequest + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,text/plain', ...headers }, redirect: 'follow', signal: ctrl.signal });
    const body = res.status === 304 ? '' : await res.text();
    return { status: res.status, finalUrl: res.url || url, body, etag: res.headers.get('etag'), lastModified: res.headers.get('last-modified'), retryAfter: res.headers.get('retry-after') };
  } finally { clearTimeout(timer); }
}

// A site that rate-limits or shows a bot check is not retried in this run. Retrying harder would be
// the wrong response to a refusal, so the host is paused for the rest of the run and noted in RUN.md.
const blockedHosts = new Set();
const isBlocked = res => res.status === 429 || res.status === 503 || /\/sorry\//.test(res.finalUrl || '');
async function getPolite(url, headers) {
  const host = new URL(url).host;
  if (blockedHosts.has(host)) return { status: 'paused', finalUrl: url, body: '' };
  const res = await politeGet(url, headers);
  if (isBlocked(res)) blockedHosts.add(host);
  return res;
}

const robotsCache = new Map();
async function robotsRules(origin) {
  if (!robotsCache.has(origin)) {
    try { const r = await politeGet(origin + '/robots.txt'); robotsCache.set(origin, r.status === 200 ? parseRobots(r.body) : []); }
    catch { robotsCache.set(origin, []); }
  }
  return robotsCache.get(origin);
}

const runReport = { checked: [], blocked: [], skippedRobots: [], failed: [] };
const pages = new Map(); // url -> record for this run
const seen = new Set();

async function crawlSource(source) {
  const origin = new URL(source.url).origin;
  const queue = [{ url: source.url, depth: 0 }];
  const perSourceFetched = { n: 0 };
  let blocks = 0;
  const sourceState = state[source.id] || {};
  let incomplete = false;

  while (queue.length && blocks < MAX_BLOCKS_PER_SOURCE) {
    const { url, depth } = queue.shift();
    const key = canonical(url);
    if (seen.has(key)) continue;
    seen.add(key);
    if (perSourceFetched.n >= (source.crawl_cap ?? 1)) break;

    const rules = await robotsRules(new URL(key).origin);
    const p = new URL(key).pathname + new URL(key).search;
    if (isDisallowed(p, rules)) { runReport.skippedRobots.push(key); continue; }

    const useCond = depth === 0 && !FORCE;
    const headers = {};
    if (useCond && sourceState.etag) headers['If-None-Match'] = sourceState.etag;
    if (useCond && sourceState.last_modified) headers['If-Modified-Since'] = sourceState.last_modified;

    let r;
    try { r = await getPolite(key, headers); }
    catch (e) { runReport.failed.push({ url: key, error: e.message }); incomplete = true; continue; }
    perSourceFetched.n++;

    if (r.status === 'paused') { runReport.blocked.push({ url: key, status: 'host paused after an earlier block in this run' }); incomplete = true; blocks++; continue; }
    if (isBlocked(r)) { runReport.blocked.push({ url: key, status: r.status }); blocks++; incomplete = true; continue; }
    const finalKey = canonical(r.finalUrl);
    if (new URL(finalKey).origin !== origin && new URL(finalKey).origin !== new URL(key).origin) {
      runReport.failed.push({ url: key, error: `redirected off-site to ${new URL(finalKey).origin}; not recorded` }); continue;
    }
    if (r.status === 304) {
      const old = prevByUrl.get(key);
      if (old) pages.set(key, { ...old, lastSeen: today, source_id: source.id, depth });
      continue;
    }
    if (r.status !== 200) { runReport.failed.push({ url: key, error: `HTTP ${r.status}` }); if (depth === 0) incomplete = true; continue; }

    const html = r.body || '';
    const text = normalizeText(html);
    if (!text) { runReport.failed.push({ url: key, error: 'no text' }); continue; }
    fs.mkdirSync(path.join(ROOT, 'cache/text'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'cache/text', sha256(finalKey).slice(0, 40) + '.txt'), text);
    pages.set(finalKey, { url: finalKey, title: extractTitle(html), status: 200, sha256: sha256(text), source_id: source.id, depth, lastSeen: today });
    if (depth === 0) state[source.id] = { ...sourceState, etag: r.etag || sourceState.etag, last_modified: r.lastModified || sourceState.last_modified };

    if (depth < (source.crawl_depth ?? 0)) {
      for (const link of extractLinks(html, finalKey)) {
        if (!link.startsWith(source.crawl_prefix) || ASSET.test(link)) continue;
        if (!seen.has(canonical(link))) queue.push({ url: link, depth: depth + 1 });
      }
    }
  }
  if (blocks >= MAX_BLOCKS_PER_SOURCE) runReport.blocked.push({ url: source.url, status: 'source stopped after repeated blocks' });
  if (incomplete) state[source.id] = { ...state[source.id], incomplete: true };
  else state[source.id] = { ...state[source.id], last_checked: today, incomplete: false };
  runReport.checked.push({ id: source.id, pages: perSourceFetched.n, incomplete });
}

console.log(`due: ${due.length} of ${sources.sources.length} sources`);
for (const source of due) {
  await crawlSource(source);
  console.log(`${source.id}: ${runReport.checked.at(-1).pages} requests${runReport.checked.at(-1).incomplete ? ' (incomplete, retry next run)' : ''}`);
}

// Merge: pages from this run replace older records; pages from sources not due keep their old record.
const merged = new Map(prev.pages.map(p => [p.url, p]));
for (const [url, rec] of pages) merged.set(url, { ...merged.get(url), ...rec });
const out = [...merged.values()].sort((a, b) => a.url.localeCompare(b.url));
write(regPath, { generatedAt: now.toISOString(), counts: { pages: out.length }, pages: out });
write(statePath, state);

const lines = [
  '# Last crawl run', '',
  `Run: ${now.toISOString()}. Sources due: ${due.length}. Pages recorded: ${out.length} (${pages.size} this run).`, '',
  '## Sources', ...runReport.checked.map(c => `- ${c.id}: ${c.pages} requests${c.incomplete ? ' — incomplete, will retry' : ''}`), '',
  '## Blocked (rate limited or refused)', ...(runReport.blocked.length ? runReport.blocked.map(b => `- ${b.url} (${b.status})`) : ['- none']), '',
  '## Failed', ...(runReport.failed.length ? runReport.failed.map(f => `- ${f.url}: ${f.error}`) : ['- none']), '',
  '## Skipped by robots.txt', ...(runReport.skippedRobots.length ? runReport.skippedRobots.map(s => `- ${s}`) : ['- none']), '',
];
fs.writeFileSync(runPath, lines.join('\n'));
write(path.join(ROOT, 'state/run.json'), { at: now.toISOString(), due: due.length, checked: runReport.checked.length, blocked: runReport.blocked.length, failed: runReport.failed.length, pagesThisRun: pages.size });
console.log(`registry: ${out.length} pages (${pages.size} recorded this run); blocked ${runReport.blocked.length}, failed ${runReport.failed.length}`);
process.exit(0);
