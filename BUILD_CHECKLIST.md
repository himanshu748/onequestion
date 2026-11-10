# OneQuestion build and evidence

Built November 9, 2026. Status refers to observed implementation behavior, not production readiness or contest acceptance.

## Acceptance criteria

A coordinator can create a supported event, add original volunteer messages, review prerequisites independently, compute an exact eligible draft, compare single and paired hypothetical answers, record an actual reply, reload the persisted result and export an actual roster without source messages. Previewing must never mutate saved facts. Conditional, conflicting, absent and unreviewed evidence must not establish eligibility. The fictional demo must be visibly labeled and remain separate from real provider evidence.

| Phase / check | Status | Evidence / limit |
| --- | --- | --- |
| Inspect prior brief; preserve concept and scope | Passed | PRD.md preserves the available original chat excerpt, including its retrieval-limit note |
| Define design before frontend | Passed | design.md; warm workbench, visible hypothetical mode, source inspection, mobile panels |
| Verify current official rules and API contracts | Passed | Official pages retrieved November 9; references in README and docs/SUBMISSION.md |
| Exact matching objective and stable ties | Passed | Min-cost maximum matching; 400 seeded small graphs agree with an independently written exhaustive oracle |
| Canonical three-to-four-role reassignment | Passed | Unit test and browser: Ana/Ben/Cy → Dee/Ana/Ben/Cy; three existing people move |
| No assignment from unresolved or unreviewed facts | Passed | Domain tests plus manual review browser journey |
| Separate availability, willingness, qualifications, approval | Passed | Independent gates; explicit manual approval only |
| Single and two-question outcomes | Passed | Branch tests, including 3/3/3/4 dependency; bounded ten-candidate search and visible truncation |
| Preview isolation | Passed | Snapshot equality in unit test; browser preview → return still shows three roles |
| Actual replies and persistence | Passed | Browser reply → four roles → reload; HTTP server shutdown/restart retains reply in SQLite |
| Stale saves and untrusted imports | Passed | HTTP regression: 409 on stale revision; backup imports clear review state and baseline |
| Prevent changed or unanchored Clocked proposals from silent approval | Passed | HTTP tests reject changing a conditional proposal through acceptance and affirmative proposals lacking valid evidence |
| Unicode anchors | Passed | Code-point slicing test with emoji; invalid anchors rejected; exact live spans recorded |
| Input and export behavior | Passed | Date/time/timezone checks; CSV quotes/newlines; formula-prefix protection; browser CSV download inspected |
| Fresh event journey | Passed | Browser created a one-role event, added a fictional source, separately reviewed availability and willingness, reached 1/1 coverage |
| Browser CSV import | Passed | Quoted volunteer CSV imported through actual file chooser |
| Loopback and origin protection | Passed | Binds 127.0.0.1; Host and Origin allowlist; HTTP cross-origin write rejected |
| API credentials | Passed | Authorized server key saved in ignored .env with mode 0600; no credential in source or frontend bundle |
| Free credits and spending boundary | Passed | Redeemed CLOCKEDHACKATHON; account showed 20,000 free credits; six live calls used 42; refreshed account showed 19,958 remaining and $0 authorized overage |
| Real Fill / Extract / Decide adapters | Passed, bounded | Six real requests; role/requirement compilation, two people analyzed, eight-case Decide batch; docs/LIVE_VALIDATION.json |
| Semantic robustness benchmark | Not complete | Eight fictional cases passed once; no 60-case held-out evaluation, repeated trials or general accuracy estimate |
| Browser-to-provider analysis and review | Passed, bounded | Deployed browser invoked real Extract + Decide, showed seven unreviewed proposals, accepted one anchored availability fact and retained it after reload. Fill was exercised separately through deployed API; docs/BROWSER_LIVE_VALIDATION.json |
| Desktop and 360 px rendering | Passed | 1440×1000 and 360×800 local and deployed browser inspection; no main-page overflow after repair |
| Keyboard and reduced motion | Passed | Mobile tab arrow navigation, dialog Escape and focus restoration; reduced-motion media emulation |
| Accessibility automation | Passed for inspected screens | axe WCAG A/AA checks; zero violations on desktop (1440×1000) and mobile (360×800) current-plan screens after contrast, semantics and overflow fixes. This is not a full accessibility certification |
| Types, tests, dependency audit and build | Passed | Current keyless suite: 17 tests, including 400 graph comparisons and zero-allowance validation ordering; strict TypeScript; npm audit: zero advisories; Vite build passes |
| Independent users and external qualifications | Not tested | No usability study or real credential verification |
| Cloudflare runtime and private sessions | Passed locally | Real Worker + local D1: two visitor sessions cannot read, mutate or delete each other’s events; stale saves, imports, owner access and body limits checked |
| Public deployment | Passed | Workers Free ($0 current plan) verified in dashboard; HTTPS API checks in docs/HOSTED_VALIDATION.json; browser preview, actual reply and reload passed |
| Deployed provider integration | Passed, bounded | Three additional real requests through deployed Worker: Fill, Extract, Decide; docs/HOSTED_LIVE_VALIDATION.json. One explicit sound skill classified conditional, requiring correction |
| GitHub repository | Passed | Public himanshu748/onequestion; main pushed; remote SHA matches local; homepage points to deployed app |
| GitHub CI runner | Blocked externally | Run 42591564447 had zero steps: GitHub reports the account is locked due to a billing issue. No billing changes made; local 12 tests and build passed |
| Recorded demo and final field copy | Passed locally | 93-second H.264 1920×1080 60 fps browser video; actual Fill request; four video thumbnails inspected; all form text below limits; public playback and seek-to-31-seconds passed after deployment; exact HTTP 206 prefix bytes checked |
| Contest submission | Confirmed saved | Explicit entrant authorization; Clocked displayed ENTRY SAVED on November 9 at 6:44 PM; docs/SUBMISSION_RECEIPT.json |
| Project license | MIT on preview branch | Explicit entrant request on 10 Nov; LICENSE added on ui-polish, awaiting production/main approval |

## Browser environment and evidence

### 10 Nov update verification

- Passed: all 14 local tests, including the real local Worker/D1 test (16.721 seconds), and strict TypeScript/Vite build. GitHub CI is not claimed green.
- Passed: keyless recorded-review archive compared with saved Fill and browser validation records, including every original Unicode anchor and the unchanged conditional classification.
- Passed: deployed demo/root smoke checks, 13 optional caption cues, recorded-review desktop/mobile rendering and anonymous analysis denial. No new Clocked provider calls.
- Confirmed saved: three revised entry fields after exact `submit` approval, 10 Nov, 2:52 PM IST. Full text matches after refresh; actual saved-banner screenshot and updated receipt retained. Public release verification is recorded in the agent log.
- Blocked: active LinkedIn mention cannot be verified while signed out. Local draft exists; no post published and People’s Choice remains off.

Local URL: http://127.0.0.1:4317. Chromium (Google Chrome for Testing), with desktop and mobile-sized viewports. The Browser plugin was not available; the legacy Playwright skill wrapper's @playwright/mcp package exposed no CLI, so QA used @playwright/cli with the already installed browser executable. No replacement browser was downloaded. A dedicated Browser plugin can improve future in-app QA ergonomics.

Checked page title and URL, meaningful rendered content, absence of a framework error overlay, console health, screenshots and primary interactions. Development HMR reload messages during edits were distinguished from the production-mode checks. Screenshots are actual captures; the displayed volunteers and interpretations are fictional.

## Material limits

The local server is single-user. Hosted storage is private to an HttpOnly browser cookie, with no user-account login, cross-device recovery or collaboration. Live access requires an owner code and has a six-request daily cap. It supports one shared interval, up to 12 people and 8 slots. Scope is intentionally bounded; unsupported schedules require another model. Clocked errors and stale results never become affirmative evidence. No automatic messaging, external approval, calendar writes or provider calls occur during previews. Paid overage was not enabled. Hosted smoke testing and recording used six additional free provider requests within the six-per-day cap. Further evaluation beyond this bounded check needs its own budget.
