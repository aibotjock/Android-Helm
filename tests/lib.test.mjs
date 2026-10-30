import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, extractTitle, extractLinks, canonical, parseFrontMatter, validateSources, diffRegistries, deadlineStatus, parseRobots, isDisallowed } from '../tools/lib.mjs';

test('visible text only, scripts and tags removed, entities decoded', () => {
  assert.equal(normalizeText('<style>x{}</style><p>Hello&nbsp;&amp; <b>bye</b></p><script>1</script>'), 'Hello & bye');
});
test('title is read and decoded', () => {
  assert.equal(extractTitle('<html><title> A &amp; B </title></html>'), 'A & B');
});
test('links resolve against the base and drop fragments', () => {
  assert.deepEqual(extractLinks('<a href="/x#top">a</a><a href="https://e.com/y">b</a>', 'https://e.com/z'), ['https://e.com/x', 'https://e.com/y']);
});
test('canonical drops display parameters and trailing slashes', () => {
  assert.equal(canonical('https://support.google.com/googleplay/android-developer/answer/1/?hl=en&visit_id=2'), 'https://support.google.com/googleplay/android-developer/answer/1');
});
test('front matter lists are parsed', () => {
  const fm = parseFrontMatter('---\ntitle: T\nsources: [a, b]\nlast_reviewed: 2026-10-30\n---\nbody');
  assert.deepEqual(fm, { title: 'T', sources: ['a', 'b'], last_reviewed: '2026-10-30' });
});
test('source validation rejects bad priority, http and duplicate ids', () => {
  const r = validateSources({ sources: [
    { id: 'a', url: 'https://x.test', priority: 'P0', cadence_days: 7 },
    { id: 'a', url: 'http://x.test', priority: 'P9' },
  ] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.includes('duplicate')));
  assert.ok(r.errors.some(e => e.includes('not https')));
  assert.ok(r.errors.some(e => e.includes('bad priority')));
});
test('diff finds changed and new pages; removes only after the stale window', () => {
  const today = new Date('2026-10-30T00:00:00Z');
  const prev = { pages: [
    { url: 'u1', sha256: 'a', title: 'one', lastSeen: '2026-10-29' },
    { url: 'u2', sha256: 'b', title: 'two', lastSeen: '2026-06-01' },
  ] };
  const next = { pages: [ { url: 'u1', sha256: 'changed', title: 'one' }, { url: 'u3', sha256: 'c', title: 'three' } ] };
  const d = diffRegistries(prev, next, { today });
  assert.deepEqual(d.changed.map(c => c.url), ['u1']);
  assert.deepEqual(d.added.map(a => a.url), ['u3']);
  assert.deepEqual(d.removed.map(r => r.url), ['u2']);
});
test('deadline status: passed, within 60 days, upcoming', () => {
  const today = new Date('2026-10-30T12:00:00Z');
  assert.equal(deadlineStatus('2026-09-30', today).state, 'passed');
  assert.equal(deadlineStatus('2026-11-28', today).state, 'within 60 days');
  assert.equal(deadlineStatus('2027-04-14', today).state, 'upcoming');
});

test('robots: only the all-crawler group applies; wildcards and end anchors work', () => {
  const rules = parseRobots('User-agent: Googlebot\nDisallow: /private\n\nUser-agent: *\nDisallow: /*?*authuser=\nDisallow: /tmp$\n');
  assert.deepEqual(rules, ['/*?*authuser=', '/tmp$']);
  assert.equal(isDisallowed('/help/x?authuser=1', rules), true);
  assert.equal(isDisallowed('/tmp', rules), true);
  assert.equal(isDisallowed('/tmp/more', rules), false);
  assert.equal(isDisallowed('/private', rules), false);
});
