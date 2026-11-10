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
