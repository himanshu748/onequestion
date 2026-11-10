# OneQuestion design

The user is an event coordinator trying to close a specific gap in a small volunteer roster. The workbench keeps current evidence, actual coverage, and hypothetical answers visibly separate. The central task is to find one clarification that changes the plan.

## Visual system

Warm paper #f7f6f2, white working surfaces, ink #20252d, secondary ink #626873, cobalt #304bd0, affirmative #236247, unresolved #865709, negative #a43535. Status text accompanies every color. System sans-serif for the workbench; Georgia for the editorial welcome headline. Type: 12/14/16/20/28/44 px. Spacing: 4/8/12/16/24/32/48 px. Border #dedfdc; radii 8/12/18 px. Focus is a 3 px cobalt outline with 3 px offset. Sources use pale warm highlight #fff0bd.

Desktop: 230 px navigation rail, flexible main content; workbench has 260 px evidence, flexible roster, 300 px questions at 1250 px and wider. Between 900 and 1250, evidence is a separate tab. Mobile: compact header, scrollable navigation and Plan / Questions / Evidence tabs. Main workflow fits 360 px without horizontal page scrolling. Header preserves coverage and a persistent preview banner. Forms use a dialog with labeled controls and visible error messages.

## Screens, components and states

Welcome offers an isolated fictional example or a new event. Event intake collects name/date/IANA timezone/start/end and explicit role requirements. Sources intake collects an identified volunteer and original text, or imports JSON/CSV. Fill proposes requirements; Extract provides exact quotes; Decide proposes separate availability/willingness/qualification states. Proposed facts require coordinator review before planning. Manual facts require a recorded reason and are labeled coordinator-provided.

Roster cards show slot, assignee, evidence and changes from the actual baseline. A question card shows both coverage outcomes, no predicted probability of a human answer. A pairs view shows all four answer branches and labels equal single-question ranks as ties. An evidence inspector shows unchanged source text, code-point-validated highlighted quotes, provider/manual provenance and acceptance controls. Export preview distinguishes public roster (no source messages) and private workspace backup. Reset and deletion require a deliberate dialog action. Errors keep the last saved plan. Edits increment a revision, invalidate source analysis and clear previews; server revision conflicts require reload.

| Action | Result | Saved state changes? |
| --- | --- | --- |
| Preview yes/no | Blue-bordered hypothetical plan, changed-person labels | No |
| Return to current | Existing saved roster | No |
| Record reply | Reply text plus explicit proposition answer and reviewer | On confirmation |
| Reopen fact | Preserve history, remove affirmative eligibility | Yes |
| Review interpretation | Inspect source and accept/reject proposal | Yes |

Canonical walkthrough: Ana→Welcome, Ben→Tickets, Cy→AV; Keyholder empty, Dee unassigned. Cy's access question previews four roles; Dee's AV question still yields three. Recording Cy's affirmative answer gives Dee→Welcome, Ana→Tickets, Ben→AV, Cy→Keyholder. Removing that answer returns to three. Preview alone never changes the saved plan.

## Accessibility and motion

Semantic buttons, native forms, keyboard-operable dialogs, initial dialog focus, Escape to close, focus restoration, visible focus, 44 px touch targets, polite live status announcements. Assignment inspection and confirmation require no dragging. Tabs preserve the selected source/question. Motion uses 160 ms feedback and 220 ms ease-out card changes; no ambient or continuous animation. Reduced motion removes movement and transitions. State text remains available without motion or color. Offline/API failures show an explicit error; unknown facts keep their own label. Stale analyses cannot be accepted. Empty events explain the next action.


## 10 Nov preview refinements

The ui-polish preview uses self-hosted Instrument Sans / Instrument Serif, a 14 px metadata floor on the judge pages and initial app screens, the same status colors and a clearly separated recorded-output archive. Broader workbench layout changes were removed after the entrant narrowed scope. [Design and verification log](agent-runs/ui-polish-log.md).
