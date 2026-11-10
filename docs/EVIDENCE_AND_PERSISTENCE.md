## Evidence, persistence and export

Locally, SQLite stores workspaces under `data/onequestion.sqlite`. Hosted workspaces live in Cloudflare D1, scoped to an unguessable HttpOnly browser-session cookie, with up to five events per browser and 30-day expiry after the last edit. Clearing cookies loses access; export a private backup for recovery. There is no cross-device account recovery. The browser stores only the last selected workspace ID in localStorage. Source offsets are validated using Unicode code points, not JavaScript UTF-16 indices. Original text and whitespace are preserved. Reviewed changes retain the previous state, reviewer and reason; current reply details remain on the fact. A revision number prevents stale saves from another tab.

**Roster CSV** exports the actual saved draft, event details and volunteer names. It omits source text and private fact history, and neutralizes spreadsheet formula prefixes. Names are personal data: review them before sharing. No automatic redaction service or anonymization claim is made.

**Private workspace backup** includes all sources, names and history. Keep it secure. Restore makes a new workspace ID and requires fresh review of every imported fact. Delete event removes its current database record; this is not forensic erasure of SQLite pages, Cloudflare recovery snapshots, operating-system snapshots or exported backups.

The exact solver maximizes coverage, then minimizes changes to already assigned people. Stable person/slot ordering chooses a reproducible result when the mathematical objective ties. A changed existing person includes becoming unassigned; newly assigned volunteers do not count as changes. Pair and single-question coverage claims apply only to the supported model and stated answer assumptions. An eligible draft is not confirmation that people accepted their assignments.


[Back to the README](../README.md)
