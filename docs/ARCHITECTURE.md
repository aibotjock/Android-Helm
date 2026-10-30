# Architecture and decisions

## What the repository is
A map and a checklist for building Android apps that meet Google Play's current rules. It holds our own summaries, linked to the sources they come from, plus a registry of which Google pages exist and whether they have changed.

## Decisions

**1. Facts and links, not copies.** Google's pages are copyrighted. The repository stores URLs, titles, dates, hashes and our own summaries, never page text. Page text is cached locally in `cache/` and is git-ignored.

**2. No dependencies.** The tools use Node 18+ built-ins only. Nothing to install, nothing to break, and the same code runs locally and in GitHub Actions.

**3. Priority sets the rhythm.** Each source has a priority that sets how often it is checked: P0 weekly, P1 monthly, P2 quarterly, P3 yearly. The rules that change most often are checked most often.

**4. Polite access.** One request at a time, two seconds apart. robots.txt is honoured. If a site refuses or rate-limits us, the crawler pauses that site for the rest of the run, keeps the previous record, and retries next time. It never tries other identities or headers to get around a refusal.

**5. Humans approve policy changes.** The tools detect and report changes. They never edit playbooks. A person reads the change, decides what it means, and updates the playbook with a new `last_reviewed` date.

**6. Dated obligations are curated.** Each deadline is added by hand from its source, with a note. `status.mjs` computes passed, within 60 days and upcoming. A deadline without a day in the source is marked approximate.

**7. Public-safe.** No app data, no account data, no secrets, no keystores. The repository can be public.

**8. Features are separate from policy.** `docs/FEATURES.md` lists Play Console features. Policy and features change at different speeds, so they are kept apart.

## Layout
| Path | Purpose | Changes |
|---|---|---|
| `sources/sources.json` | Sources, priorities, crawl rules | When Google adds or moves a page |
| `data/deadlines.json` | Dated obligations, curated | When a source states a new date |
| `generated/registry.json` | Every recorded page: URL, title, hash, last seen | Each run (automated) |
| `generated/CHANGES.md` | What changed since the last run | Each run (automated) |
| `generated/DEADLINES.md` | Deadline status table | Each run (automated) |
| `generated/RUN.md` | What the last run did, including blocks | Each run (automated) |
| `state/` | Check dates and cache validators | Each run (automated) |
| `playbooks/` | Our checklists, linked to sources | By hand, after review |
| `docs/` | Architecture, refresh, features | By hand |
| `tools/` | Crawl, diff, status, validate | By hand |
| `tests/` | Tests for the tools | By hand |
| `.github/workflows/` | Scheduled refresh | By hand |
