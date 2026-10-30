# Refresh schedule and procedure

## Schedule
| Priority | Checked | Typical sources |
|---|---|---|
| P0 | Weekly | Developer Program Policy, Policy Deadlines, policy announcements, target API, closed testing, data safety, account deletion, subscriptions, payments, sensitive permissions, developer verification |
| P1 | Monthly | Most playbooks' sources, store listing, ads, technical quality, app signing |
| P2 | Quarterly | Full Help Center index, pre-launch tools, SDK guidance |
| P3 | Yearly | Distribution agreement, Play terms, other platform terms |

The scheduled workflow runs weekly (Monday 06:17 UTC). Only sources whose cadence has passed are checked.

## What a run does
1. Runs the tests.
2. Checks each due source, one request at a time.
3. Records changes in `generated/CHANGES.md`, deadline status in `generated/DEADLINES.md`, and the run summary in `generated/RUN.md`.
4. Commits metadata only.
5. Opens an issue if pages changed or if any source was blocked.

## What to do with an issue
1. Read `generated/CHANGES.md`. For each changed page, open the page and read the change yourself.
2. If it affects a playbook, update the playbook and its `last_reviewed` date.
3. If it sets a new date, add it to `data/deadlines.json` with its source.
4. If it is a new policy with a compliance window, record the window's end date.
5. Run `node tools/validate.mjs` and `node --test tests/`, then commit.

## If a site blocks the crawler
The run records the block in `generated/RUN.md` and keeps the previous records. Those sources are retried next run. For P0 sources, also read the page by hand in the same week. Do not work around a block.

## Running it by hand
```
node --test tests/
node tools/crawl.mjs          # checks only sources that are due
node tools/crawl.mjs --force  # checks everything (uses more requests)
node tools/diff.mjs <old> <new>
node tools/status.mjs
node tools/validate.mjs
```
