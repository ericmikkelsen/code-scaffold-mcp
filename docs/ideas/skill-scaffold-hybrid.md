# Skill/Scaffold Hybrid Prompting

## Problem Statement
How might we keep scaffolded outputs structurally consistent while improving edge-case correctness without large token and latency growth?

## Recommended Direction
Use a two-layer approach:
- Minimal scaffold for output shape (signature, imports/exports, JSDoc structure, wiring test compatibility)
- Small behavior skill cards for task-specific correctness constraints

## Why This Direction
- Scaffold-only prompting keeps code shape stable but can over-spend tokens.
- Skill-only prompting can improve behavioral reasoning but reduce structural consistency.
- A hybrid keeps deterministic file shape while injecting only the behavior guidance needed for each task.

## MVP Scope
- Add `behaviorTags: string[]` to benchmark fixtures.
- Add a skill-card registry keyed by behavior tag.
- Inject at most two cards per scaffolded prompt.
- Add a short self-check section before final output.
- Run A/B benchmarks on:
  - `topKFrequent`
  - `parseQueryString`
  - `coerce`

## Success Criteria
- Scaffolded pass rate is at least as good as current best.
- Median scaffolded completion tokens are reduced by at least 20% vs heavy-scaffold baseline.
- No regression in generated file validity or oracle test execution.

## Key Assumptions
- Most current failures are due to missing behavioral constraints, not missing structure.
- One or two relevant cards are enough; more cards add noise and cost.
- A short self-check improves reliability on boundary conditions.

## Validation Plan
- Run ablation with 0/1/2/3 cards and compare pass rate + token cost.
- Run with and without self-check block on identical fixture sets.
- Repeat runs to reduce single-sample variance.

## Not Doing
- No custom JSDoc tags for constraints.
- No large per-fixture hardcoded prompt paragraphs.
- No runtime dependency additions.
