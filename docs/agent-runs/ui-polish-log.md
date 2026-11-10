# OneQuestion UI polish run

All times IST (Asia/Calcutta). Started 10 Nov 2026, 2:57 PM IST. Hard freeze: 11 Nov 2026, 8:30 AM IST. Production deployment, pushing to main, Clocked form saves and public posts require a new exact `submit`. No such approval applies to this run yet.

## Scope and acceptance

Audience: judges evaluating the existing OneQuestion journey. Improve visual hierarchy and interaction craft on the demo, workbench and recorded review. Preserve all factual copy, four-step judge path, source evidence, provider boundaries, APIs and data. No new provider calls, credentials, spending or billing changes. No production writes. Acceptance: 14 tests/build pass, real desktop/laptop/mobile journeys and keyboard/captions/reduced-motion/anonymous rejection pass, mobile Lighthouse performance/accessibility at least 90, measured zero load CLS on the two static pages. Awwwards quality is a design aim, not a certification or award claim.

## 10 Nov, 3:02 PM IST — direction, within 45-minute budget

Verified fresh official Awwwards pages (HTTP 200 via Node; web reader could not access them), plus original site/official gallery images:

| Reference | Confirmed Site of the Day | Relevant observation | Adaptation |
| --- | --- | --- | --- |
| [Illoca](https://www.awwwards.com/sites/illoca) | 4 Sep 2026 | Large type, paper surface, diagrams make an invisible AI workflow tangible | Give the one-question idea a clear typographic stage and restrained schematic |
| [Cerebrium](https://www.awwwards.com/sites/cerebrium) | 10 Sep 2026 | Oversized hierarchy, one signal accent, direct product actions | Separate the proposition from secondary explanation; maintain blue as action signal |
| [Heron AI](https://www.awwwards.com/sites/heron-ai) | 12 Oct 2026 | Fine rules, precise framing, product review embodied in the composition | Treat recorded evidence as an inspectable editorial document |

The first browser captures hit site preloaders. Actual gallery images were then read visually; Heron's completed live first screen was also inspected. Reference images stay in local `work/ui-polish`, not product assets. No reference branding/layout/code copied.

**Selected direction — a considered question, an inspectable answer.** Instrument Sans (400–700 variable) for interface and body, Instrument Serif regular/italic for large display and source quotations. Self-hosted Latin WOFF2, two families, OFL licenses included; optional font loading avoids late swaps. Warm paper #f7f6f2, ink #20252d, existing signal blue #304bd0, subtle sage for confirmed facts and amber for conditional evidence. 8 px spacing grid with 4 px optical increments; 1280 px editorial canvas, 48 px desktop gutters, 20 px mobile. Display 64–104 px desktop, 48–56 px mobile; body 16–18 px, small evidence metadata at least 12 px. Radii 8/16/24 px, thin clear borders, restrained shadows. No gradients, 3D/canvas, custom cursor, scroll-jacking or continuous animation.

**Motion:** primary reveal 360 ms, secondary stagger 60/120 ms, longest total 480 ms; hover 140 ms, answer/result transition 220–280 ms, signature cubic-bezier(.2,.7,.2,1). Only transform/opacity for entrances; content visible without JS. No scroll-triggered hiding. All animations/transitions off under reduced motion. Existing controls and semantics stay in place.

**Baseline:** actual production SHA is a0029cf8b548cd258a1c1b60422479b031ffc750 after the prior authorized release. Local annotated tags `fallback-6e45adf` (requested older baseline) and `production-before-ui-polish` (actual current production) created without moving main or pushing. Working branch `ui-polish`.

Before captures: local `output/playwright/ui-polish/before-demo-{1440,1280,390}.png` and `before-review-{1440,390}.png`; real captures, production unchanged. The current public example is hand-authored; recorded outputs remain recorded real outputs on fictional inputs.

## Phase 2 commit ledger

Entries below record each requested build slice. Verification findings and preview details follow after implementation.

### 10 Nov, 3:03 PM IST — 1. Hero and first screen

Implemented demo typographic hero, restrained original question schematic, numbered judge path with unchanged content/order/links, shared self-hosted font assets with licenses, responsive canvas and finite 320–480 ms entrance choreography. Existing video/captions and all factual paragraphs retained. No JavaScript or API changes. Build passed. First slice is confined to ui-polish; production unchanged.

### 10 Nov, 03:05 PM IST — 2. Question and answer interaction

Added presentation-only workbench skin: larger question hierarchy, tactile answer tiles, stronger selected/focus boundaries, short 220–260 ms state transitions, redesigned existing empty/error/dialog treatments. No event handlers, API contracts, data or visible factual copy changed. Reduced-motion disables all transitions.

### 10 Nov, 03:06 PM IST — 3. Result and evidence view

Refined coverage hierarchy, progress bars, roster cards, source quotations and fact review spacing/type. Existing conditional/unreviewed/reviewed distinctions, data, source text and actions untouched. Existing reassignment animation remains finite (260 ms); no chart or behavior added.

### 10 Nov, 03:07 PM IST — 4. Recorded review page

Reframed archive with large serif title, prominent recorded-not-live boundary, spacious typed proposal cards, readable exact quotes/offsets, conditional-card treatment, preserved screenshot proportions and clear provenance links. Original evidence JSON/image and source snapshot byte-unchanged. Original factual text retained; only wrapper structure and presentation changed.

## 10 Nov, 03:11 PM IST — addendum: contest score takes priority

User narrowed remaining work: recorded outputs inside the interactive example, concise README, explicit MIT license, focused readability fixes, then verification/preview. Existing branch work retained; no further broad redesign.

### Addendum 1 — in-example recorded integration

Added a read-only recorded-output panel inside demo workspaces, importing the same recorded-review JSON at build time. Exact visible label: “Recorded 9 Nov Clocked output, no live call”. Shows actual Fill roles/requirement, all seven Extract quotes and saved Decide labels, original JSON/source links and review boundary. It has no effects, network calls or workspace mutation path. Existing hand-authored plan data and matching remain untouched. Full records expand with native details; source offsets remain inspectable.

### 10 Nov, 03:12 PM IST — Addendum 2: README

Kept the four-step judge path and concise endpoint table; added explicit Protect/Verify not-used row. Moved the recorded validation chronology to docs/VALIDATION_HISTORY.md and storage/evidence/export/solver detail to docs/EVIDENCE_AND_PERSISTENCE.md with links back. Removed the open license-selection sentence and obsolete no-license footer. No evidence claims dropped or upgraded.

### 10 Nov, 03:12 PM IST — Addendum 3: MIT license

Added the standard MIT LICENSE with 2026 Himanshu Kumar copyright, as explicitly requested, and linked it in README. Included font OFL notices remain applicable to those third-party assets.

### 10 Nov, 03:14 PM IST — Addendum 4: focused visual/readability pass

Retained static demo/archive visual direction and first welcome screen. Removed the earlier broad workbench question/result skin to respect the narrowed scope. Raised small grey metadata on the two static pages and first app screen to at least 14 px, with dark AA-oriented colors. Removed the duplicate header live-access action; the sidebar action remains. Consolidated six repeated archive awaiting-review notes into one section note. Quote offsets moved into native keyboard-accessible details, leaving plain highlighted quotes. Existing silent-video captions already have 13 cues and remain byte-unchanged. Added OG card and shared existing favicon; no new product claims.

Preview preparation uses a separate onequestion-ui-polish Worker and D1 database (be5e48c2-c380-4b10-ae16-439f5e724d22), with no Clocked secrets and zero configured provider allowance. Original production database and Worker configuration unchanged.

## 10 Nov, 03:24 PM IST — preview verification and performance investigation

Isolated preview deployed at https://onequestion-ui-polish.tbud.workers.dev (production unchanged). Desktop 1440, laptop 1280 and mobile 390 demo/review/welcome checks passed: no horizontal overflow, visible small text at least 14 px, native disclosure keyboard access, preserved four-step path. In-example archive matches all seven saved labels/quotes, makes zero provider-route requests and leaves the complete saved workspace byte-equivalent. Keyboard confirmation preview reaches 4/4, return remains 3/4; reduced-motion computed styles have no active animations/transitions. Anonymous Analyze, Fill and deliberately wrong token return 403; video plays with 13 caption cues and HTTP 206 range support. Browser receipt retained locally.

An initial QA request used the wrong response nesting/revision and brief field; it produced a harness failure, not provider access. Corrected to the actual API contract and reran successfully. A local setup request previously returned 400 while the preview DB identifier was changed; local migrations were applied to that new isolated identifier.

All 14 tests initially passed after implementation (real D1 7.606 seconds). A repeat under browser workload passed D1 but the HTTP test exceeded its 5-second server-start readiness budget: 13 passed, 1 failed. No test or runtime code changed to mask this; an idle rerun is pending.

Mobile Lighthouse 12.8.2: review 100 performance / 100 accessibility, CLS 0. Initial demo 61 / 100, CLS 0; trace reports zero page scripts and a long unattributable task during offscreen native-video setup. Testing content-visibility with an explicit reserved player ratio; controls, video preload and caption data unchanged. No production approval is implied by a preview.

## 10 Nov, 03:26 PM IST — backend addendum accepted

Backend items 1–7 take priority, then optional pure-move extraction only before 11 Nov ~6:30 AM IST. Created explicit local fallback-a0029cf tag at confirmed production base; existing ui-polish ancestry already starts there. No tag or branch pushed.

Prior verification checkpoint: complete 14-test suite passed with test concurrency 1, including HTTP (2.288 seconds) and real D1 (5.745 seconds). No timeout budgets or runtime logic changed to obtain this pass. Preview review Lighthouse 100/100, welcome 94/98 (heading-order diagnostic); fixed welcome section heading semantics without changing its text. Preview-only player geometry/content-visibility adjustment awaits final retest after backend.

### 10 Nov, 03:27 PM IST — Backend 1: build prerequisites and fail-fast startup

Added package pretest vite build, moved build before test in README/check workflow, and made Cloudflare test assert dist/index.html before setup. Child spawn errors/early exits now produce clear readiness errors, and cleanup avoids waiting for an already-exited child. npm test && npm run build passed: all 14 tests, real D1 4.649 seconds. Fresh disposable clone proof follows this commit. No provider calls.

### 10 Nov, 03:29 PM IST — Backend 2: validate before budget reservation

Exported pure prepareAnalysis: person membership, non-derived source presence, unchanged combined snapshot <=16000 chars, at least one non-approval fact and room under 100 sources. Worker and Express call it before budget/active accounting; analyzePerson also validates direct callers before constructing the client. Added keyless purity/invalid-input regression. npm test && npm run build passed all 15 tests (real D1 8.165 seconds). Fresh-clone reproduction is running independently in a disposable local clone with no .env.

### 10 Nov, 03:32 PM IST — Backend 3: safe hosted errors and structured logging

Worker now preserves explicit expected status/message and Zod 400s; otherwise returns generic 500, or generic 502 for SDK/provider-response errors. Logs only known route template, method, numeric status and a bounded error name; no bodies, sources, tokens, keys or exception messages. Added keyless fetch-level response/log regression. Production wrangler observability enabled in configuration only; no production deploy. npm test && npm run build passed all 16 tests, real D1 4.686 seconds.

Fresh clone proof: npm ci passed (181 packages); original a0029cf Cloudflare test with dist removed failed after 23.823 seconds in this environment (not the reported 120 seconds). Patched direct invocation fails immediately with the explicit missing-dist message. In the same disposable clone, rm -rf dist followed by npm test rebuilt assets via pretest and passed all 14 tests present at Backend 1. Evidence: local fresh-clone-baseline.txt, fresh-clone-fail-fast.txt and fresh-clone-npm-test.txt. No .env copied.

Demo mobile Lighthouse after offscreen-player rendering fix: 94 performance / 100 accessibility, CLS 0. The previous 61 result is retained as diagnostic evidence, not hidden.

### 10 Nov, 03:33 PM IST — Backend 4: zero-budget keyless runtime regression

Second real local Worker starts with the explicitly synthetic key and zero daily allowance, unlocks using a synthetic local code, then asserts compile 429, unknown-person analysis 400 (not 429), and valid analysis 429. No provider call occurs. Current suite count updated to 17 in README/checklist. npm test && npm run build passed 17/17; original D1 scenario 4.580 seconds, zero-budget Worker 3.342 seconds.

### 10 Nov, 03:35 PM IST — Backend 5: Express parity

Added the missing proposal-ID stale guard with 409, and explicit 429 statuses for both local analysis/compile request ceilings. Extended real HTTP regression to reach the local ceiling while provider calls are disabled, then verify both routes return 429. README states Express local development / Worker hosted. npm test && npm run build passed all 17 tests, D1 scenarios 4.684 / 3.287 seconds.

### 10 Nov, 03:36 PM IST — Backend 6: bounded inputs and safe parsing

NaN/Infinity budget configuration falls back to six through a pure bounded helper. Decide uses Status.safeParse, removing the classification cast. Browser API client handles non-JSON failures with a generic status message. Added persisted label/note/history/ID bounds and keyless bounds tests; canonical demo and all archived anchors still parse. npm test && npm run build passed all 19 tests, D1 scenarios 7.154 / 6.660 seconds. Planned browser error-response smoke follows the component move.

### 10 Nov, 03:38 PM IST — Backend 7: judge-visible documentation tidy

Moved PRD, build checklist and design into docs; fixed README and all local Markdown targets, including five relative evidence links exposed by the earlier history move. Added comments for hosted token/allowance variables without supplying values. README documents the deferred access-code throttling migration and keeps Extract/Decide sequential. Suite count is 19. npm test && npm run build passed 19/19; real D1 scenarios 25.996 / 9.256 seconds, within their timeout. All seven required backend items are complete before the optional refactor cutoff.

### 10 Nov, 03:44 PM IST — Backend 8: pure-move component extraction

Completed before the 11 Nov ~6:30 AM IST cutoff. Moved Avatar, Dialog, FactForm and EventForm into src/components, shared display labels into a small sibling module, and api/download into src/api.ts. AST extraction hashes confirm App and all six moved function bodies byte-identical; only exports/imports and moved constants changed. styles.css untouched. Typecheck passed; npm test && npm run build passed 19/19 (D1 scenarios 11.092 / 4.344 seconds).

Real local browser smoke exercised the relocated event form, reply form, native dialog Escape/focus restoration and roster CSV download. A synthetic non-JSON 503 displays the generic status error without exposing its HTML body. Initial smoke locators targeted the startup catch and an exact nested label; corrected to the actual POST failure path and accessible combobox role. No app fix was needed for those harness mismatches.
