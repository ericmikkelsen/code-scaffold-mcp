# Project Plan

The library is being built in five phases. Each phase ships as one or more PRs and adds a distinct scaffold target.

| Phase | Scope | Effort | Target | Status |
|---|---|---|---|---|
| **1. Core Functions MVP** | `ParamDef`, `toJSParams`, `toJSDOC`, `scaffoldFunction`, 100% tests | 4–5 days | Apr 24–28 | ✅ Done |
| **2. Advanced Types** | Unions, generics, mapped, conditional, tuple, function types | 3–4 days | Apr 29–May 2 | ✅ Done |
| **3. Skill/Scaffold Hybrid Prompting** | Lean scaffold + behavior skill cards + self-check loop in benchmark harness | 2–3 days | May 3–5 | ✅ Done |
| **4. Sanity Schema Generator** | `scaffoldSchema` — generates Sanity `defineType()` schema with GROQ example and preview config | 2–3 days | May 6–8 | 🔲 Planned |
| **5. CLI + MCP Server** | CLI commands + MCP-compliant server + VSCode wiring | 2–3 days | May 9–11 | 🔲 Planned |

---

## Phase 1 — Core Functions MVP ✅ Done

**Goal:** Ship `scaffoldFunction` that generates a typed function skeleton + `node:test` template for both `ts` and `js` targets.

**Deliverables:**
- `ParamDef` type (`name`, `tsType`, `example`, `description?`)
- `toJSParams(paramDefs)` → function parameter string
- `toJSDOC(paramDefs, returnType)` → formatted JSDoc block
- `scaffoldFunction(config)` → `{ fileName, testFileName, source, testSource }`
- 100% test coverage on all generator code

**Day-by-day breakdown:**
- Day 1: `ParamDef` type, `toJSParams` MVP
- Day 2: `toJSDOC`, `scaffoldFunction` basic version
- Day 3: `testTemplateGenerator` (node:test templates)
- Day 4: generator tests at 100% coverage
- Day 5: polish + README + example mini-project usage

**Language behavior:**
- `ts`: `.ts` extension, inline TypeScript types in signatures, JSDoc for readability
- `js`: `.js` extension, types stripped from signatures, full JSDoc `@param`/`@returns` emitted

---

## Phase 3 — Skill/Scaffold Hybrid Prompting ✅ Done

**Goal:** Improve correctness-per-token by combining minimal scaffold output with small, task-specific behavior guidance cards.

**Deliverables:**
- Add `behaviorTags` metadata on benchmark fixtures.
- Add a skill-card registry for edge-case-heavy behaviors (ordering, bounds, empty-input handling).
- Inject at most two relevant skill cards into scaffolded prompts.
- Add a compact self-check block before final code output.
- Benchmark A/B runs on `topKFrequent`, `parseQueryString`, and `coerce`.

**Success criteria:**
- Scaffolded pass rate matches or exceeds current best run.
- Median scaffolded completion tokens decrease by at least 20% versus the heavy-scaffold baseline.
- No regression in generated file validity and oracle test execution.

---

## Phase 4 — Sanity Schema Generator 🔲 Planned

**Goal:** Ship `scaffoldSchema` that generates a Sanity `defineType()` schema file from a field-definition config.

**Deliverables:**
- `scaffoldSchema(config)` accepting `name`, `fields`, `preview`
- Output: `schemas/[name].ts` with full `defineType()`
- Includes: GROQ query example, content modeling rationale comment, preview config example

**MCP tool contract:**

Request:
```json
{
  "name": "author",
  "fields": [{ "name": "name", "type": "string", "required": true }],
  "preview": { "title": "name" }
}
```

Response:
```json
{
  "fileName": "author.ts",
  "source": "...generated sanity schema source..."
}
```

---

## Phase 5 — CLI + MCP Server 🔲 Planned

**Goal:** Expose all scaffold generators via a CLI and an MCP-compliant server.

**Deliverables:**
- CLI commands:
  ```bash
  scaffold-fn --name validateEmail --params tsTypes.json --lang ts --output ./functions/
  scaffold-schema --name author --from schema-template.json
  ```
- MCP server with tool discovery + structured inputs/outputs
- VSCode wiring (point editor at local MCP server)

**MCP tool contracts:**

`scaffold_function` — see Phase 1 for request/response shape.

`scaffold_sanity_schema` — see Phase 4 for request/response shape.
