> Historical product brief. Planning documents now live together in docs/: [design](design.md), [build checklist](BUILD_CHECKLIST.md). Original instructions below are preserved as project history.

# OneQuestion: Product Requirements Document

Version: 1.0
Project: OneQuestion
Competition: Clocked Build Challenge
Primary award target: Best Use of Decide / Extract / Fill
Additional target: Best Overall App

## 0. Implementation instructions

Implement the complete OneQuestion application described in this document.

Begin by:

1. Saving this document as `PRD.md`.
2. Creating a project-specific `design.md` in the repository root.
3. Creating `BUILD_CHECKLIST.md` with phased implementation tasks, acceptance conditions, and evidence fields.
4. Verifying the current Clocked request and response contracts.
5. Running a small live API feasibility experiment when credentials are available.
6. Continuing into implementation, verification, and deployment preparation.

The planning documents are the beginning of the work. Continue until the application’s required user journeys work.

Make ordinary implementation decisions independently and document material decisions. Request clarification only when a missing requirement or credential genuinely prevents progress.

If a Clocked API key is unavailable:

- Implement the real server-side adapter.
- Implement the deterministic planning engine.
- Complete the interface and synthetic demonstration.
- Label simulated responses clearly.
- Mark live integration verification as blocked.
- State exactly which environment variable or access is missing.
- Do not report live integration as completed.

Keep `design.md`, the implementation, and `BUILD_CHECKLIST.md` consistent throughout development.

A checklist item becomes complete only when its acceptance condition has been demonstrated. Record a test result, screenshot, output artifact, or reproducible manual verification alongside it.

## 1. Product definition

### Product name

OneQuestion

### Core promise

Find the missing answer that could improve an event roster, and show exactly how the assignments would change.

### Primary user

A coordinator organizing a small event with volunteer information distributed across messages, notes, and incomplete forms.

### Problem

A coordinator may have enough volunteers but insufficiently clear information to construct a complete roster.

Messages contain:

- Conditional availability.
- Unclear qualifications.
- Role preferences.
- Pending access or approval.
- Partial dates and times.
- Conflicting updates.
- Statements that apply to a different event.

An incomplete roster does not explain which uncertainty is worth resolving first.

### Product behavior

OneQuestion:

1. Reads the organizer’s role requirements.
2. Reads volunteer messages while preserving their original wording.
3. Produces typed requirements and evidence-backed proposed facts.
4. Keeps missing, conditional, and conflicting information unresolved.
5. Computes the best feasible roster under the accepted facts.
6. Simulates possible answers to unresolved questions.
7. Shows how each answer could change coverage and assignments.
8. Updates the actual draft when a real reply is recorded and reviewed.

### Distinctive interaction

A clarification card shows:

“If confirmed: 4 of 4 roles can be filled.
If denied: 3 of 4 roles remain fillable.”

The user can preview the assignment changes, inspect the source evidence, and record the actual answer.

### Positioning

“OneQuestion turns incomplete volunteer messages into an evidence-backed roster, then shows which unanswered fact could improve coverage and how the assignments would change.”

Describe this as a differentiated workflow using established matching techniques. Do not claim a new mathematical algorithm or worldwide novelty.

## 2. Product goals and scope

### Required outcomes

- A user can create a small event from an organizer brief.
- Volunteer notes become inspectable proposed facts.
- The current roster uses established prerequisites.
- Conditional information remains conditional.
- Each proposed clarification has correctly calculated answer branches.
- Hypothetical previews cannot change actual facts.
- Real replies can change the roster through a visible reassignment.
- Every source-based explanation can be traced to original evidence.
- A fresh visitor can run the supplied demonstration.
- A reviewer can reproduce the application setup and planning results.

### Initial supported model

- One event per planning workspace.
- One approved event date and timezone.
- One start and end interval shared by every slot.
- Up to 12 volunteers.
- Up to 8 individual slots.
- One volunteer per slot.
- At most one simultaneous assignment per volunteer.
- Up to 10 unresolved binary, person-specific facts.
- Single-question and two-question comparisons.
- Pasted text and small JSON/CSV imports.

A role requiring multiple people becomes multiple individually identified slots.

### Deferred scope

- Recurring schedules.
- Multiple overlapping shifts.
- Travel-time optimization.
- Payroll and attendance tracking.
- Predictions about no-shows.
- Calendar synchronization.
- Automated volunteer invitations or reminders.
- External credential or certification verification.
- General-purpose constraint programming.
- PDF, image, audio, and video ingestion.
- Cross-person dependencies such as shared transport or mandatory pairings.

Unsupported requirements must remain visible. The application must not silently simplify them into supported constraints.

## 3. Mandatory project-specific design.md

Create `design.md` before frontend implementation.

It must contain resolved design decisions for OneQuestion’s actual product. Every screen, component, state, and interaction described below must have a corresponding design decision.

### 3.1 Product personality

Design OneQuestion as a calm planning workbench.

The interface should make three things immediately understandable:

1. What can be assigned using the current evidence.
2. Which facts remain unresolved.
3. What would change if a particular answer were received.

Coverage counts, unresolved questions, and source evidence are the main visual elements.

### 3.2 Visual direction

Use this starting direction and refine it into concrete tokens:

- Warm off-white page background.
- White or lightly tinted working surfaces.
- Dark ink typography.
- Restrained cobalt for primary actions.
- Green for established eligibility.
- Amber for unresolved or conditional information.
- Red for explicit blockers or conflicts.
- A distinct blue outline and persistent label for hypothetical previews.
- Warm highlighting for source quotations.

Choose exact accessible color values and document them.

Use a readable sans-serif for ordinary content. Use tabular numerals for coverage and comparison counts.

Document:

- Font families and fallbacks.
- Type scale.
- Spacing scale.
- Border and radius values.
- Surface hierarchy.
- Status colors and accompanying labels.
- Button hierarchy.
- Focus styling.
- Source-highlight styling.
- Motion duration and reduced-motion behavior.

Use motion to explain reassignment. Keep the rest of the interface stable.

### 3.3 Desktop layout

At sufficiently wide viewports, use three coordinated areas:

- Left: source messages and evidence.
- Center: current roster and uncovered slots.
- Right: clarification questions and answer previews.

The event header remains visible and contains:

- Event name.
- Date, interval, and timezone.
- Coverage, such as “3 of 4 roles filled.”
- Current versus hypothetical mode.
- Analysis freshness.
- Access to export and reset.

Selecting an assignment highlights the supporting evidence.

Selecting a question highlights the missing prerequisite and the affected assignments.

Document actual column behavior and minimum usable widths.

### 3.4 Tablet and mobile layout

At narrower widths, reorganize the interface into:

- Plan.
- Questions.
- Evidence.

Preserve the selected person, question, source, and preview when moving between views.

Keep coverage and hypothetical-mode status visible.

Ensure usability at 360 px width. Avoid requiring horizontal page scrolling for the main workflow.

### 3.5 Required screens and states

Specify the layout and behavior of:

1. Start screen.
2. Event and role intake.
3. Volunteer source intake.
4. Requirements and fact review.
5. Current roster.
6. Single-question opportunities.
7. Two-question opportunities.
8. Hypothetical answer preview.
9. Record-reply form.
10. Evidence inspector.
11. Export preview.
12. Analysis failure and recovery.
13. Stale-result state.
14. Empty and partially configured workspaces.

### 3.6 State vocabulary

Define visual treatments for:

- Proposed interpretation.
- Accepted interpretation.
- Established affirmative fact.
- Established negative fact.
- Unknown.
- Conditional.
- Conflicting evidence.
- Pending coordinator approval.
- Hypothetical.
- Stale.
- API failure.
- Partial analysis.

Every state needs readable text. Color alone is insufficient.

A failed API call must be visually distinguishable from a fact that is genuinely unknown.

### 3.7 Critical interaction specification

Document the complete sequence:

- Open a question.
- Preview yes.
- Inspect the changed assignments.
- Preview no.
- Return to the current plan.
- Record an actual reply.
- Review its interpretation.
- Recompute the actual plan.

Previewing and recording a reply must use distinct controls and states.

### 3.8 Accessibility

Specify:

- Keyboard navigation.
- Focus order.
- Visible focus indicators.
- Accessible status announcements.
- Form labels and inline errors.
- Contrast checks.
- Reduced-motion behavior.
- Touch-target sizes.
- Non-drag alternatives for any assignment interaction.

The application must be operable without drag-and-drop.

### 3.9 Required design artifacts

Include:

- Annotated layouts for desktop and mobile.
- A component inventory with responsibilities.
- A state-transition table.
- An interaction walkthrough using the canonical four-person demo.
- An explanation of how the visual choices support evidence inspection and question comparison.

After implementation, update `design.md` to reflect the actual interface.

## 4. Main user journeys

### Journey A: Try the example

1. Open the application.
2. Select “Try the four-person example.”
3. Load an isolated synthetic workspace.
4. Show its sources, reviewed facts, existing draft, and unresolved questions.
5. Let the visitor preview both answers.
6. Let the visitor record a fictional confirmation within the demo.
7. Update the roster.
8. Allow reset to the original state.

Identify the data as fictional.

If responses are simulated, identify them as simulated. If they are actual saved API responses, identify them as recorded and retain their provenance.

### Journey B: Create a plan

1. Enter event name, date, timezone, start, and end.
2. Paste the organizer’s role brief.
3. Compile requirements using Fill.
4. Review proposed roles, capacities, and prerequisites.
5. Correct incomplete or ambiguous requirements.
6. Approve the canonical event requirements.

Do not invent a missing timezone, capacity, or date.

### Journey C: Add volunteer information

1. Add a known volunteer identity.
2. Paste one or more source messages.
3. Supply message timestamps when available.
4. Run Extract and contextual Decide analysis.
5. Display the proposed facts and source evidence.
6. Review interpretations.
7. Identify unresolved prerequisites.
8. Compute the current eligible roster draft.

Accepting an interpretation confirms that it represents the source. It does not independently verify an external qualification.

### Journey D: Resolve a useful question

1. Select a clarification.
2. Inspect its yes and no outcomes.
3. Obtain the answer outside the application.
4. Select “Record reply.”
5. Enter the actual answer, respondent or authority, and supporting text.
6. Interpret the reply in the context of the exact question.
7. Preserve any new condition or conflict.
8. Apply the required review.
9. Recompute the actual roster.

A reply such as “Yes, if I finish early” must remain conditional.

### Journey E: Change or withdraw evidence

1. Edit, replace, withdraw, or reattribute a source.
2. Invalidate dependent interpretations and planning results.
3. Mark the previous result stale.
4. Reanalyze the current revision.
5. Display the updated roster and questions.
6. Preserve the revision history.

## 5. Clocked integration requirements

### 5.1 Fill: organizer requirements

Input:

- Event brief.
- Clearly identified role descriptions.
- Explicit organizer context.

Output owned by this integration:

- Proposed event fields.
- Role names.
- Capacities.
- Required qualifications.
- Approval requirements.
- Missing or ambiguous requirements.

Use documented typed fields.

If the API does not support the nested structure needed by the application, make smaller validated calls and assemble the internal record in code.

For evidence-bearing extraction fields, explicitly set `infer: false`.

Keep original source values separate from parsed dates, numbers, and canonical application values.

### 5.2 Extract: volunteer evidence

Input:

- Original volunteer messages.

Output owned by this integration:

- Short verbatim source facts.
- Their source positions.
- Evidence for availability, willingness, skills, qualifications, and conditions.
- Explicit missing values.

Extract is not responsible for deciding whether a fact is affirmative.

For example, extracting “Saturday” from “I cannot do Saturday” must not establish availability.

Display surrounding source context where a short extracted value would hide negation or conditions.

Preserve the original text unchanged.

### 5.3 Decide: contextual interpretation

Input:

- Approved event requirements.
- Full relevant messages.
- Validated extracted evidence.
- The scoped question being assessed.

Output owned by this integration:

- Proposed prerequisite states.
- Supported, blocked, or unresolved compatibility.
- Conditional, negative, missing, or conflicting interpretations.

Use explicit unresolved alternatives.

Do not classify solely from isolated extracted keywords.

Use only documented response fields. Map those responses into internal application types through a validated adapter.

Derive user-facing explanations from prerequisite states and evidence. Do not assume the endpoint returns application-specific rationale or citation fields unless the current contract actually provides them.

For questions requiring several messages, ensure all relevant context is available to the request.

### 5.4 Optional Protect integration

Add after the core workflow works.

Purpose:

- Prepare a shareable evidence report.
- Remove detected contact details and private information from the exported projection.

Show an export preview.

The exported artifact must actually reflect the transformation.

Keep raw sensitive findings outside the shared export.

### 5.5 Optional Verify integration

Add after the core workflow works.

Purpose:

- Check source-dependent statements in assignment explanations.

Examples:

- Whether a volunteer explicitly offered to perform a role.
- Whether the supplied source contains an access confirmation.

Use claim-level results.

Matching arithmetic and optimality are verified by deterministic code, not by asking Verify to infer calculations from messages.

### 5.6 Integration honesty

Every credited endpoint must change application behavior or output.

A successful HTTP response is not sufficient evidence of meaningful integration.

Record endpoint-to-feature mappings in the README.

## 6. Facts, evidence, and authority

### 6.1 Distinct prerequisite dimensions

Keep these separate:

- Availability.
- Role willingness.
- Qualification.
- Required coordinator approval.

“I am free” does not establish willingness for every role.

“I have done this before” does not automatically satisfy a requirement for coordinator-verified qualification.

Each role requirement must specify whether self-report is sufficient.

### 6.2 Assertions and effective facts

An assertion records what a source says.

Assertion values:

- Yes.
- No.
- Conditional.
- Not stated.

Review states:

- Pending.
- Accepted.
- Rejected.

Effective fact states:

- Yes.
- No.
- Unknown.
- Conditional.
- Conflict.
- Pending review.

Only established affirmative prerequisites can enable an eligible assignment.

### 6.3 Evidence validation

For every displayed evidence span, verify:

- The source exists.
- The source version matches.
- Start and end are valid.
- End is exclusive.
- The quotation exactly equals the original code-point slice.

Clocked positions refer to Unicode code points.

In JavaScript, do not assume ordinary UTF-16 string indexes are interchangeable with those offsets.

An invalid evidence anchor becomes a review issue.

Do not silently fabricate a replacement quote or alter the original text to make an offset appear correct.

### 6.4 Conflicts and corrections

A later message does not automatically override an earlier applicable message.

Preserve both assertions.

Resolve supersession through:

- An explicit correction in the source.
- A clearly scoped withdrawal.
- A coordinator’s recorded resolution.

Record who resolved the conflict and why.

### 6.5 Manual entries

Allow a coordinator to enter a fact manually with explicit provenance.

Label it as coordinator-provided information.

Do not attach a fabricated source quotation to a manual fact.

## 7. Planning engine

### 7.1 Eligible assignments

Create a person-to-slot connection only when:

1. Full-interval availability is established.
2. Willingness for that role is established.
3. Required qualifications satisfy the role’s verification policy.
4. Required coordinator approvals are present.
5. No unresolved applicable conflict remains.

A high model probability cannot bypass these conditions.

Call the result an “eligible roster draft.”

A feasible draft does not establish that every volunteer has accepted the final assignment.

### 7.2 Objective

Use an exact algorithm:

1. Maximize the number of filled slots.
2. Among equally complete rosters, minimize changes to the existing draft.
3. Use stable ordering to choose a reproducible display when mathematical ties remain.

A change means a previously assigned person moves to a different slot or becomes unassigned.

Assigning a previously unassigned person does not count as changing an existing assignment.

### 7.3 Implementation

Use exact bipartite matching or a suitable dynamic program.

The bounded eight-slot model makes exact computation practical.

Keep the solver in a pure module independent of the UI and Clocked adapter.

Cross-check small cases against exhaustive enumeration.

### 7.4 Single-question analysis

Each candidate question resolves one binary, person-specific proposition.

For each question:

1. Create a hypothetical yes state.
2. Rebuild eligibility.
3. Solve the resulting graph.
4. Create a hypothetical no state.
5. Rebuild eligibility.
6. Solve again.
7. Store coverage and assignments for both branches.
8. Count changed existing assignments.
9. Record all assumptions.

Rank single questions by:

- Highest possible coverage.
- Fewest existing assignments changed in the improving branch.

Keep remaining ties visible.

Stable alphabetical ordering may organize a tie but must not imply superior question value.

### 7.5 Two-question analysis

Evaluate all unordered pairs of unresolved facts.

For ten facts, there are 45 pairs.

Evaluate all four answer com

## Retrieval note
The original chat export truncates at its 20,000-character message limit. The preserved text above is the available source; BUILD_CHECKLIST.md and design.md record the implemented scope and evidence. No omitted requirements are claimed as verified.
