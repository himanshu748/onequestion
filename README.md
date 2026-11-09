# OneQuestion

Find the missing answer that could complete a volunteer roster, and see exactly how assignments would change.

OneQuestion is a planning workbench for coordinators of small events. Original volunteer messages stay beside reviewed facts. An exact matching engine fills the roles that the evidence supports, then computes both outcomes of a clarification. A hypothetical preview never changes the saved facts.

![OneQuestion workbench with source evidence, three filled roles and both clarification outcomes](docs/workbench.png)

Try the [hosted app](https://onequestion.tbud.workers.dev), or run it locally. The hosted example and manual planning need no account or provider credits. [Hosting and privacy details](docs/DEPLOYMENT.md).

## Run locally

Requires **Node.js 22.13 or newer** (tested with 22.14.0) and npm. Node's built-in SQLite API is experimental on Node 22 and may emit a warning.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4317**. Click **Try the four-person example**. No account, API key, paid service, or network call to Clocked is needed for this example.

1. The current draft fills three of four roles: Ana at Welcome, Ben at Tickets, Cy at AV. Dee is unassigned.
2. Preview confirmation of Cy's keyholder access. Four roles become fillable; three existing volunteers change roles.
3. Return to the current plan. It still has three filled roles.
4. Record a fictional actual reply, with a reviewer and a reason. The saved roster now fills four roles.
5. Reload: the reply survives. Review the fact as unknown, or reset the example, to return to three.

The example's messages and interpretations are **hand-authored fictional fixtures**, not saved or simulated Clocked responses. Roster calculations, persistence, imports and exports are real local behavior.

For a production-mode local run:

```sh
npm run build
npm start
```

The Express app binds only to loopback and is intended for a trusted single-user Mac. The hosted version uses a separate Cloudflare Worker with private browser sessions and D1 storage.

## Plan your own event

Create an event with an explicit date, IANA timezone and same-day time interval. Add each individual role, any qualification, and whether coordinator approval is required. For a role needing two people, create two individual slots. Review every requirement before creating the workspace.

Add volunteers and paste their original messages. You can also import a JSON array of `{ "name": "Ana", "text": "Original message" }` objects, or UTF-8 CSV with **name,text** headers. Quoted commas and newlines are supported. Files are limited to 200 KB; each pasted message to 8,000 characters.

In **People & evidence**, review availability, role willingness, qualification and approval separately. Only reviewed affirmative facts enable assignments. Manual corrections and replies require a reviewer and reason. Unknown, conditional, conflicting and unreviewed facts do not establish eligibility. Adding a new source invalidates that person's prior reviews so contradictory information is not silently ignored.

The supported planning model is one shared interval, at most 12 volunteers and 8 simultaneous slots, with at most one slot per person. Single-question analysis is bounded to 10 eligible candidate facts; the UI discloses when more exist. All pairs of those candidates are evaluated, including all four answer branches. Recurring shifts, overlapping intervals, travel, cross-person dependencies and attendance prediction are unsupported.

## Clocked integration

The optional integration uses the official **clocked-sdk 0.7.0**, with its documented schemas:

| Endpoint | Purpose | Effect in OneQuestion |
| --- | --- | --- |
| Fill | Extract role names and explicit requirements from the organizer brief; flag unsupported constraints | Proposes editable role slots and requirements for coordinator review |
| Extract | Find exact source phrases for person-specific prerequisites | Produces verifiable evidence anchors; invalid spans cannot support affirmative approval |
| Decide | Classify each prerequisite as yes, no, unknown, conditional or conflict | Proposes facts that remain ineligible until reviewed |

Fill does not automatically map extracted qualifications to roles or expand capacities. The coordinator explicitly reviews that mapping. Coordinator approval is always manual. A high classification confidence never becomes a probability of a human's future answer.

Live calls are **disabled in a fresh checkout**. This Mac has an authorized private configuration using free credits only. To enable another installation after authorizing provider-credit use, set `CLOCKED_API_KEY` and `CLOCKED_ENABLED=true` in the server environment and restart. Do not put the key in frontend code. The run scripts automatically load a local `.env` when present. To configure another installation, copy `.env.example` to `.env` and fill it privately. An explicit equivalent command is:

```sh
node --env-file=.env --import tsx server/index.ts
```

On the hosted app, **Enable live analysis** accepts a private owner access code for one hour. Public visitors cannot spend the shared Clocked credits. The hosted Worker reserves at most **six provider requests per UTC day**, shared across owner sessions, including failed attempts. Local server limits below are separate.

Each **Analyze with Clocked** action makes at most two provider requests, sequentially: Extract then Decide. Brief compilation makes one Fill request. Requests have a 60-second per-call timeout and a single attempt; SDK idempotency keys are retained within each call. The server allows one analysis at a time and 40 analysis actions per process. These limits bound requests, **not money**; provider credit usage varies with input and model execution time. No automatic retry or background analysis is performed. A manually repeated failed action may use another idempotency key and consume further credits. Canceling the browser interaction does not cancel provider work already accepted.

Source snapshots sent to Clocked include the selected person's messages plus event requirements. They are private data sent to Clocked when live analysis is invoked. No messages are sent by the fictional example, manual review, previews, matching, CSV export or pair analysis. A failed or stale analysis leaves the saved workspace unchanged and reports an error. Proposals require fresh review. A bounded live validation on November 9 used six requests and 42 free credits. Fill returned four role names and two explicit requirements; Extract/Decide produced proposals for Cy and Ben with valid exact spans for affirmative facts. A separate eight-case Decide batch matched all eight expected labels, including conflicts, conditional availability and withdrawals. This was an adapter-level run on fictional inputs, not a browser-to-provider end-to-end trial, repeated evaluation or a broad accuracy estimate. See [live validation evidence](docs/LIVE_VALIDATION.json). A later deployed HTTPS smoke test exercised Fill, Extract and Decide through the real Worker in three additional requests. Its proposals stayed unreviewed, and affirmative proposals had valid exact spans. One explicit sound-operation qualification was conservatively labeled conditional; coordinator review remains necessary. See [deployed results](docs/HOSTED_LIVE_VALIDATION.json). The canonical demo remains hand-authored.

Official references checked November 9, 2026: [Fill](https://clocked.rezolve.ai/docs/fill), [Extract](https://clocked.rezolve.ai/docs/extract), [Decide](https://clocked.rezolve.ai/docs/decide), [quickstart](https://clocked.rezolve.ai/docs/quickstart). Automated adapter regression tests use synthetic HTTP responses. The separate live evidence above identifies what was actually called.

## Evidence, persistence and export

Locally, SQLite stores workspaces under `data/onequestion.sqlite`. Hosted workspaces live in Cloudflare D1, scoped to an unguessable HttpOnly browser-session cookie, with up to five events per browser and 30-day expiry after the last edit. Clearing cookies loses access; export a private backup for recovery. There is no cross-device account recovery. The browser stores only the last selected workspace ID in localStorage. Source offsets are validated using Unicode code points, not JavaScript UTF-16 indices. Original text and whitespace are preserved. Reviewed changes retain the previous state, reviewer and reason; current reply details remain on the fact. A revision number prevents stale saves from another tab.

**Roster CSV** exports the actual saved draft, event details and volunteer names. It omits source text and private fact history, and neutralizes spreadsheet formula prefixes. Names are personal data: review them before sharing. No automatic redaction service or anonymization claim is made.

**Private workspace backup** includes all sources, names and history. Keep it secure. Restore makes a new workspace ID and requires fresh review of every imported fact. Delete event removes its current database record; this is not forensic erasure of SQLite pages, Cloudflare recovery snapshots, operating-system snapshots or exported backups.

The exact solver maximizes coverage, then minimizes changes to already assigned people. Stable person/slot ordering chooses a reproducible result when the mathematical objective ties. A changed existing person includes becoming unassigned; newly assigned volunteers do not count as changes. Pair and single-question coverage claims apply only to the supported model and stated answer assumptions. An eligible draft is not confirmation that people accepted their assignments.

## Verification

```sh
npm test
npm run build
npm audit
```

Tests cover the canonical reassignment, conditional and approval gates, a two-answer dependency, Unicode spans, CSV parsing and injection protection, schema errors, 400 reproducible small graphs compared with exhaustive enumeration, and the real HTTP entry point with SQLite restart persistence, stale saves, origin protection and untrusted imports. A real local Cloudflare Worker + D1 test also checks visitor isolation, owner access, workspace limits and oversized requests. Clocked adapter tests use synthetic responses. See [BUILD_CHECKLIST.md](BUILD_CHECKLIST.md) for actual check status and [docs/SUBMISSION.md](docs/SUBMISSION.md) for the prepared demo and submission copy.

## Architecture and limits

React + Vite render the workbench. Express owns local validation, the official Clocked SDK and SQLite. The hosted Worker reuses the validation and adapter modules, scopes D1 queries to a session owner, and keeps provider secrets server-side. `src/domain.ts` is the pure min-cost maximum matching and question engine; the same module supports local browser previews. No third-party optimizer or agent framework is required. Hosted plan and question calculations run in the browser to keep Worker CPU bounded.

There is no user-account login, collaboration, automatic backup export, auto-messaging, calendar integration or external credential verification. Protect and Verify were deferred to finish the core three-endpoint journey; the roster export minimizes fields locally and makes no redaction or model-grounding claim. There is no independent-user usability study or broad/repeated semantic benchmark. The app is published for a bounded hackathon demo; production readiness and contest submission are not established. A recorded demo, project license selection and final contest entry remain pending.

## Troubleshooting

- **Port in use:** set `PORT=4318 npm run dev` and open the corresponding loopback URL. The same-origin guard follows that port.
- **Clocked button disabled:** locally, restart with both required variables set. Hosted, use **Enable live analysis** with the private owner code. Keys never go in browser storage.
- **No questions:** review incomplete prerequisites first. Conflicts and unreviewed facts require a coordinator, and questions with more than two missing prerequisites on a connection are outside the bounded opportunity search.
- **Stale edit:** reload the workspace after another tab changes it.
- **Reset:** restores only the fictional workspace. It does not alter other events.
- **No roster:** check full-interval availability and role willingness independently; qualifications alone do not establish availability.

Third-party dependencies retain their own licenses in their installed packages. No project license or contributor identity has been selected on the user's behalf.
