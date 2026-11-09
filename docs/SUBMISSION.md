# Clocked Build Challenge preparation

Prepared November 9, 2026. This document is a local draft, not a submitted entry.

## Official constraints

The [official rules](https://clocked.rezolve.ai/build-challenge/rules) were retrieved November 9, 2026. They require a new working application built October 21–November 10, meaningful Clocked integration, a demo link or short video, and public source with setup instructions and development history. Submission closes November 10 at 11:59 p.m. America/New_York, equivalent to **November 11, 2026 at 10:29 a.m. Asia/Kolkata**. Entries remain reviewable through November 18. AI-assisted development is allowed. Eligibility, payment eligibility, affiliation and team consent must be verified by the entrant.

The overall rubric allocates 25 points to usefulness, 30 to the core Clocked integration, 15 to useful additional endpoints, 20 to implementation/UX and 10 to explanation/reproducibility. The Decide/Extract/Fill category allocates 40 to depth, 30 to meaningful breadth, 20 to usefulness/execution and 10 to explanation/reproducibility. These facts come from the official rules; no score or winning probability is claimed.

## Project overview

OneQuestion helps a small-event coordinator decide which missing answer is worth chasing. It turns volunteer messages into inspectable prerequisites, builds an eligible draft roster, and shows the exact whole-roster consequences of both possible answers to a clarification.

The key moment: three of four roles can be filled. Confirming one person's venue access unlocks a reassignment chain and fills the fourth role. Previewing that answer changes nothing in the actual plan. Recording and reviewing the real reply changes the evidence, and then the plan.

## Endpoint explanation

Fill proposes roles and explicit requirement text from the organizer's brief. Extract locates exact phrases in volunteer messages, including Unicode source positions. Decide classifies availability, willingness and qualifications with explicit unknown, conditional and conflict options. The coordinator reviews proposals; the exact local optimizer uses only accepted affirmative prerequisites. Manual coordinator approval cannot be manufactured by a model.

These adapters are implemented and checked with synthetic HTTP responses. A separate live run made six successful requests using 42 free credits, covering all three core endpoints and eight labeled Decide cases (8/8 matched expectations). See LIVE_VALIDATION.json. A later deployed HTTPS API smoke test exercised all three endpoints in three additional requests; see HOSTED_LIVE_VALIDATION.json. One explicit sound skill was conservatively classified conditional, demonstrating why review remains required. A complete browser-to-provider recording and broader/repeated semantic evaluation remain unverified. The default example still uses hand-authored interpretations.

## Demo sequence, about three minutes

1. **0:00–0:25:** Show the original volunteer messages and three filled roles. Explain the coordinator's uncertainty, not a generic scheduling problem.
2. **0:25–1:00:** Compare Cy's access question and Dee's AV question. Preview confirmation and denial. Show the unchanged actual state and the exact reassignment.
3. **1:00–1:35:** Record the fictional confirmation and reviewer. Show the actual roster become complete; reload to demonstrate persistence. State explicitly that the dataset is fictional and interpretations are hand-authored.
4. **1:35–2:10:** Inspect source evidence and separate availability, willingness, qualification and coordinator approval. Reopen the access fact as unknown; coverage returns to three.
5. **2:10–2:35:** Show the bounded pair analysis and a source-free roster CSV. Explain what the private backup contains.
6. **2:35–3:00:** After live credentials are available, show a real Fill → Extract → Decide journey, review actual responses, and describe observed failures and measured results. A small adapter-level live validation is recorded, but this browser-to-provider recording remains unmade and must not be simulated as live.

## Before submission

- Completed: authorized sign-in, redeemed CLOCKEDHACKATHON for 20,000 total free credits, created a private application key, and performed six live requests. Overage remained $0. Further evaluation needs its own agreed request/credit budget; do not add billing.
- Run difficult semantic cases: conditional availability, ambiguous dates, conflicting updates, wrong-event messages, explicit withdrawal, unsupported qualifications and missing willingness. Report unsupported confirmations separately from missed clear confirmations. Eight scoped live Decide cases passed once; this is not a general accuracy result or held-out benchmark.
- Verify the [public repository](https://github.com/himanshu748/onequestion), development history and [hosted app](https://onequestion.tbud.workers.dev). Project license selection remains open.
- Produce a real screen recording, public demo/video, required team details and the final submission form. Use Deepgram exclusively if generated narration is authorized and needed. No generated narration or contest submission has occurred.
- Select Best Overall App and the Decide/Extract/Fill category after verifying the actual integration. Optional People’s Choice requires an authorized public LinkedIn post and official mention; no outreach or post has been made.

Protect/Guard/Inspect and Verify/Compare/Rerank categories are not pursued in this implementation. Their endpoints were deferred because they do not yet add a verified core capability. Unnecessary calls would not earn rubric credit.
