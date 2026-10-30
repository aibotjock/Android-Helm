# Android Helm

A map, checklist and refresh pipeline for building Android apps that meet Google Play's current rules.

**Not legal advice.** Google's own pages are the authority. This repository tells you where those pages are, what they say in short form, when they change, and what to check before you ship.

## What is here

- **`playbooks/`**: checklists for release, developer verification, target API, closed testing, data safety, account deletion, subscriptions and billing, permissions, security flags, store listing, ads, technical quality, AI-generated content, child safety, SDKs and account health. Each playbook lists the sources it comes from.
- **`sources/sources.json`**: 44 Google pages we watch, each with a priority that sets how often it is checked.
- **`data/deadlines.json`**: dated obligations (compliance windows, effective dates), each with its source.
- **`generated/`**: what the refresh last found: the page registry, changes, deadline status and run summary.
- **`docs/`**: architecture decisions, the refresh procedure and a catalogue of Play Console features.
- **`tools/`** and **`tests/`**: the refresh tools. No dependencies: Node 18 or later.

## Current status

- **Seeded:** the registry holds 222 pages recorded on 30 October 2026.
- **Automated refresh:** the weekly workflow is in place, but the repository's own crawler has not completed a run yet. On 30 October 2026 Google refused the crawler's requests. The crawler now pauses a site after a refusal and does not try to get around it. Until a run completes, read the P0 pages by hand each week.
- **Deadlines within 60 days** (as of 30 October 2026): the target API extension date (1 November 2026) and the end of the 30-day window for the 29 October 2026 policy update (28 November 2026, calculated).

## Use it

```
node --test tests/          # tests for the tools
node tools/validate.mjs     # checks sources, deadlines and playbooks
node tools/status.mjs       # deadline table
node tools/crawl.mjs        # checks sources that are due
```

Playbooks are plain Markdown with front matter: `title`, `sources`, `last_reviewed` and `verified`. `validate.mjs` fails if a playbook cites a source that does not exist.

## Copyright

This repository stores URLs, titles, dates, hashes and our own summaries. It does not store Google's page text. Page text is cached locally and git-ignored. Summaries are written in our own words and cite their source. Where a short quotation is needed, keep it brief and link the original.

## Contributing

Add or change a source in `sources/sources.json`, add a deadline only after reading its source, and update a playbook with a new `last_reviewed` date. Run `node tools/validate.mjs` and `node --test tests/` before opening a pull request.

## Licence

Code: MIT (see `LICENSE`). Written documentation (playbooks and docs): Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/). Google's own pages are not covered by this licence.
