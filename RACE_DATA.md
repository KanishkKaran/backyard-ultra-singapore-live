# Race data contract

The public dashboard is currently driven by `lib/race-data.ts`. The next milestone replaces that sample module with a read-only Google Sheets CSV feed while keeping the same `Runner` shape.

## Recommended workbook

### `Race` tab

| event_name | timezone | course_km | start_at | current_yard |
|---|---|---:|---|---:|
| Backyard Ultra Singapore | Asia/Singapore | 6.706 | 2026-10-18T00:00:00+08:00 | 21 |

### `Runners` tab

| bib | name | country | status |
|---:|---|---|---|
| 24 | Marcus Lim | Singapore | active |

Allowed statuses: `active`, `out`, `dns`.

### `Yards` tab

One row represents one runner's attempt at one yard. Do not manually calculate cumulative totals; the website will derive them.

| yard | bib | started_at | finished_at | result |
|---:|---:|---|---|---|
| 20 | 24 | 2026-10-18T19:00:00+08:00 | 2026-10-18T19:42:16+08:00 | finished |

Allowed results: `started`, `finished`, `dnf`, `dns`.

## Ingestion rules

- Publish only the required tabs as CSV; never expose a private workbook or edit credentials.
- Refresh the server-side feed every 15–30 seconds and serve the last valid snapshot if Google Sheets is unavailable.
- Validate bibs, timestamps, yard numbers and status values before updating the public race state.
- Treat a yard as completed only when `result` is `finished` and `finished_at` is present.
- Display the source refresh time so race control can detect a stale feed.
