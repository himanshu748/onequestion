# Clocked Build Challenge entry copy

Submitted November 9, 2026. Clocked displayed **ENTRY SAVED**, last saved **9 Nov 2026 at 6:44 PM**. [Submission receipt](SUBMISSION_RECEIPT.json). The copy below is the submitted entry.

## Project and links

Project name: **OneQuestion**

- Demo: https://onequestion.tbud.workers.dev/demo/
- Working app: https://onequestion.tbud.workers.dev
- Public source: https://github.com/himanshu748/onequestion
- Write-up: https://github.com/himanshu748/onequestion#readme

Awards: **Best Overall App** and **Best Use of Decide, Extract, or Fill**. Endpoints: **Decide, Extract, Fill**. People’s Choice is not selected; it requires a separate authorized LinkedIn post.

## Overview

1,537 / 2,000 characters

A volunteer coordinator has four people, four roles, and a roster that only fills three. Another reminder to everyone won’t explain the gap. OneQuestion shows which specific missing answer could change the whole plan.

Paste the organizer’s brief and volunteer messages. Review availability, willingness, qualifications and approval as separate facts. The workbench builds an eligible draft, then previews both answers to a clarification without changing saved evidence. In the fictional four-person example, confirming Cy’s venue access unlocks a chain of three reassignments and fills the fourth role. Confirming Dee’s sound skill alone does not improve coverage. Recording an actual reply updates the saved facts and roster; a preview never does.

Clocked Fill proposes editable roles and requirements, Extract anchors evidence to exact source text, and Decide proposes explicit yes/no/unknown/conditional/conflict classifications. People review the proposals before they enable assignments. An exact matching engine computes the roster consequences rather than asking a model to invent an allocation.

The deployed app includes private browser workspaces, persistent storage, paired-question analysis, a source-free roster CSV and private backup import/export. The example uses fictional data and hand-authored starting interpretations; the demo separately shows real Clocked behavior. The supported scope is one interval, up to 12 people and eight roles. It does not send messages or confirm that a volunteer accepted an assignment.

## The integration

2,345 / 3,000 characters

Fill turns an organizer’s brief into proposed role names and explicit requirement text, and flags unsupported scheduling constraints. Its output populates editable role fields. The coordinator checks capacities and maps qualifications to the correct roles; extraction does not silently approve that mapping.

Extract and Decide operate on one volunteer’s immutable source snapshot plus the dated event requirements. Extract returns exact phrases and Unicode code-point positions. OneQuestion validates those positions against the original text. Decide classifies each prerequisite independently as yes, no, unknown, conditional or conflict. Availability, role willingness, qualification and coordinator approval are distinct gates. Coordinator approval remains manual.

These outputs change the evidence inspector and the planning graph. New proposals remain unreviewed. An affirmative model proposal can only be accepted with a valid same-person source anchor; a correction is explicitly labeled coordinator-provided and records a reviewer and reason. Adding a new message invalidates earlier reviews. Failed or stale analyses do not replace saved evidence.

Only reviewed affirmative facts enable an edge in an exact min-cost maximum matching calculation. The engine maximizes filled roles, then minimizes changes to existing assignments. It evaluates both answer branches for single questions and all four branches for bounded pairs. Classification confidence is never treated as a probability of a person’s future reply.

The repository includes synthetic adapter regression tests and separate evidence for real Fill, Extract and Decide calls. A deployed-browser test showed seven real proposals, explicitly accepted one anchored fact, and preserved it after reload. One clear sound-operation statement was conservatively classified conditional, so review and correction are necessary. The initial eight-case Decide batch matched all eight labels once; this is not a general accuracy estimate.

Provider credentials stay server-side. Hosted live calls require a private owner code and share a six-request daily cap; the public example and manual planning need no key. The app is hosted on Cloudflare Workers Free with private D1 workspaces. A local Express/SQLite option and instructions for using a developer’s own Clocked key are included.

## What you learned

1,455 / 2,000 characters

The question with the most obvious local connection is not always the question that changes the roster. In the example, one qualification unlocks a whole reassignment chain; another seemingly useful answer adds no coverage. Calculating both complete outcomes makes that difference visible without inventing a probability for a human’s answer.

Source positions also matter more than a plausible explanation. We validate Extract’s Unicode offsets against the original text, keep an immutable analysis snapshot, and require fresh review when new information arrives. A model’s interpretation, a coordinator’s correction and a hypothetical answer have different authority and remain visibly separate.

Live testing exposed a useful failure: an explicit sound-operation qualification was classified conditional. The app preserves that uncertainty instead of silently making an assignment. Review is a required interaction rather than a decorative confidence score.

Deployment required a separate trust boundary. The local single-user server became a session-scoped Cloudflare Worker with persistent D1 storage, optimistic revisions and owner-only provider access. The matching engine was changed to min-cost maximum matching, with 400 bounded graphs checked against exhaustive enumeration. Thirteen local tests and the build passed. GitHub’s CI runner could not start because of an account billing lock; no hosted CI pass or production-readiness claim is made.

## Demonstration and evidence

The 93-second silent video is an actual browser capture with chapter cards and idle pauses removed. It shows previously generated real Extract/Decide proposals, then a separate hand-authored fictional roster, both clarification previews, a fictional actual reply, reload persistence and a roster CSV. A real Fill request is made during the recording, returning three editable roles and one qualification requirement. It used 10 free credits; the hosted daily counter reached six. No additional provider requests are needed to watch the video or use the public example.

The original canonical example remains hand-authored. Original messages are fictional in all recorded scenarios. The video does not show a new Extract/Decide request, and it does not claim a broad accuracy result. The recorded CSV contains roles and names, with no source text.

Evidence: [initial provider validation](LIVE_VALIDATION.json), [deployed API validation](HOSTED_LIVE_VALIDATION.json), [browser analysis/review validation](BROWSER_LIVE_VALIDATION.json), [demo validation](DEMO_VALIDATION.json).

## Official requirements checked

[Official rules](https://clocked.rezolve.ai/build-challenge/rules) and [entry form](https://clocked.rezolve.ai/challenge#submit) were rechecked November 9. The form allows 2,000 characters for the overview, 3,000 for the integration and 2,000 for lessons. It requires a demo link or video, public source with setup and real development history, endpoints and integration details, award selections, team contact details and agreement to the rules.

Deadline: **November 10, 2026 at 11:59 p.m. America/New_York**, equivalent to **November 11 at 10:29 a.m. Asia/Kolkata**. Keep the demo and repository accessible through November 18. No changes were listed since the rules’ October 19 publication.

## Submission status

The entrant explicitly authorized the contact details, official rules agreement and submission. The official authenticated form confirmed **ENTRY SAVED**. Best Overall App and Best Use of Decide, Extract, or Fill were selected; People’s Choice was not. No LinkedIn post was made. A saved entry does not establish eligibility, judging results or an award.

The entry remains editable until the deadline. Keep the demo and repository accessible through November 18. No follow-up edit has been sent to Clocked after this receipt.

The repository has no newly selected project license; the official rules require public access and respect for third-party licenses, but do not specify an open-source license. GitHub Actions could not start because of an account billing lock; local tests and the build passed. No billing changes were made.
