# Clocked Build Challenge — saved entry

Updated entry saved **10 Nov 2026, 2:52 PM IST**, after the entrant replied exactly `submit`. Clocked displayed **ENTRY SAVED**. Refreshed the form and read all three complete text fields back: each matches the copy below exactly. [Saved receipt](SUBMISSION_RECEIPT.json); [masked original 9 Nov baseline](ENTRY_BASELINE_2026-11-10.json).

The update adds the recorded-review judge path and evidence explanation. Fixed fields remain unchanged. People’s Choice is off, its URL empty, and no LinkedIn post was published. The local draft’s active mention remains unverified because LinkedIn is signed out.

## Fixed fields

- Project: OneQuestion
- Demo: https://onequestion.tbud.workers.dev/demo/
- Repository: https://github.com/himanshu748/onequestion
- Write-up: https://github.com/himanshu748/onequestion#readme
- Endpoints: Decide, Extract, Fill
- Awards: Best Overall App; Best Use of Decide, Extract, or Fill
- Solo entrant name and GitHub handle unchanged; contact email masked in project records
- People’s Choice: off; post URL empty; local draft only

## Saved update diff

| Field | Saved 9 Nov | Saved 10 Nov | Main change |
| --- | ---: | ---: | --- |
| Overview | 1,537 | 1,473 | Explicit four-step keyless judge path; recorded outputs distinguished from fixtures |
| Integration | 2,345 | 2,472 | Recorded Fill/Extract/Decide outputs, exact anchors, conditional result and validation links |
| Learned | 1,457 | 1,528 | Recorded run variation, judge access, captions and honest test/CI boundaries |

## Overview

1,473 / 2,000 characters

A volunteer coordinator has four people, four roles, and a draft that fills only three. Another reminder to everyone does not explain the gap. OneQuestion shows which specific missing answer could change the whole roster.

Review availability, willingness, qualifications and approval as separate facts. An exact matching engine builds an eligible draft and previews both answers to a clarification without changing saved evidence. In the fictional example, confirming Cy’s venue access unlocks three reassignments and the fourth role. Confirming Dee’s sound skill alone does not improve coverage. Only a recorded actual reply updates the saved evidence and plan.

Judge path: watch the 93-second video, try the keyless four-person example, then open “Recorded 9 Nov Clocked review” from the demo page. That read-only view shows saved real Fill/Extract/Decide outputs, exact source anchors, the conservative conditional classification and the original review screenshot. It makes no new provider call. The interactive example’s starting interpretations are clearly labelled hand-authored fictional fixtures. Developers may optionally run locally with their own Clocked key.

The app includes private browser workspaces, persistence, bounded paired-question analysis, roster CSV and private backup import/export. Anonymous analysis is rejected. Scope: one interval, up to 12 people and eight roles. An eligible draft does not confirm that a volunteer accepted an assignment.

## The integration

2,472 / 3,000 characters

Fill proposes editable role names and explicit requirement text from the organizer’s brief and flags unsupported scheduling constraints. Its output changes the event intake fields. A coordinator checks capacities and maps qualifications to the right roles; extraction does not silently approve that mapping.

Extract and Decide use one volunteer’s immutable source snapshot plus dated event requirements. Extract returns exact phrases and Unicode code-point positions, which OneQuestion checks against the original text. Decide separately classifies availability, willingness and qualifications as yes, no, unknown, conditional or conflict. Coordinator approval remains manual.

New proposals remain unreviewed. Accepting an affirmative proposal requires a valid same-person anchor. A correction records a reviewer and reason and is labelled coordinator-provided. A new message invalidates previous reviews. Failed or stale analyses do not replace saved evidence. Only reviewed affirmative facts enable matching edges.

The exact min-cost maximum matching engine maximizes filled roles, then minimizes changes to existing assignments. It evaluates both single-answer branches and all four branches of bounded question pairs. Model confidence is not treated as the probability of a human’s future reply.

The keyless “Recorded 9 Nov Clocked review” links the saved validation JSONs, original source snapshot, exact anchors and docs/clocked-review.png. It shows three recorded Fill role proposals and the requirement they produced, plus seven separate Extract/Decide proposals. One explicit sound-operation statement was conservatively classified conditional; the archive preserves that result and the review boundary. Availability was explicitly reviewed and persisted after reload; six proposals remained unreviewed. These are real recorded provider outputs on fictional inputs, not fresh calls or the hand-authored example.

The public judge path makes no Clocked request. Anonymous analysis and wrong access codes are rejected; no shared owner code is published. Server-side adapters use the official SDK with bounded requests and a six-request hosted daily cap. Developers can run the local Express/SQLite app with their own key; hosted workspaces use session-scoped Cloudflare D1 storage. Synthetic adapter tests and recorded provider evidence are distinguished. The initial eight-case Decide batch matched all eight labels once; no broad accuracy estimate is claimed.

## What you learned

1,528 / 2,000 characters

A clarification’s local connection does not tell you its whole-roster effect. In the example, one qualification unlocks a reassignment chain, while another answer adds no coverage. Computing both complete outcomes makes that difference visible without inventing a probability for a person’s answer.

Evidence also needs a clear authority boundary. Exact source positions are checked against an immutable snapshot. Model proposals, reviewed facts, manual corrections and hypothetical answers remain distinct. New source information requires fresh review.

A recorded run classified an explicit sound-operation statement conditional. The review page preserves that conservative result beside the quote instead of silently repairing it. The earlier adapter run classified the same skill yes; the archive identifies these as separate recorded runs, not a general accuracy result.

The judge path now separates the labelled hand-authored example from a keyless archive of real 9 Nov Clocked outputs. Judges can inspect the proposals, anchors and screenshot without a credential or a new provider request. The video is silent, with optional English walkthrough captions and a text alternative.

Deployment introduced a separate trust boundary: private browser sessions, D1 ownership checks, optimistic revisions and anonymous provider denial. The matching engine is checked against exhaustive enumeration on 400 bounded graphs. Local test/build results are recorded in the agent log; no green CI or production-readiness claim is made.

## Rules and evidence

Official [rules](https://clocked.rezolve.ai/build-challenge/rules) and [challenge](https://clocked.rezolve.ai/challenge) were freshly fetched on 10 Nov. Changes still says none since 19 Oct 2026. The rules remain the source of truth.

Hard deadline: **11 Nov 2026, 10:29 AM IST**. Working target: **11 Nov, 8:00 AM IST**. Never edit the form after the hard deadline. Keep the demo and repository reachable through 18 Nov 2026.

The new recorded review is an immutable keyless presentation of known fictional 9 Nov QA data, with the original same-person Extract spans, saved Decide labels, original screenshot and provenance links. Its Fill record is the saved request shown in the video. There are no new model outputs. The first adapter run and later browser run classified sound skill differently; that variation is disclosed. No broad accuracy estimate is claimed.

`npm test` passed all 14 tests, including the real local Worker + D1 test (no timeout). `npm run build` passed. The new regression cross-checks the recorded classifications, review states and Unicode spans against original validation records. No green CI claim is made. See [agent log](CLOCKED_AGENT_LOG.md) for timestamped actions and current browser checks.

## Gated actions

The entrant’s exact `submit` approved this form save and the Phase 5 public-file commit/push. LinkedIn publication was not approved and remains gated. No further form edit is planned. The repository’s license has not been changed; no billing changes or spending are authorized.
