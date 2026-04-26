# Benchmarks: scaffolded vs. bare prompts

This directory contains a standalone harness that measures whether passing the
output of `scaffoldFunction()` to an LLM produces correct implementations using
**fewer completion tokens** than a plain English description of the same
function.

It is **not** part of the library's test suite. It makes real LLM calls — either
to OpenAI (which costs money) or to a local OpenAI-compatible server (free, no
network required).

## Running

### Against OpenAI

```sh
export OPENAI_API_KEY=sk-...
# Optional overrides:
#   BENCH_MODEL=gpt-4o-mini BENCH_TEMPERATURE=0
node --import tsx/esm benchmarks/run.ts
```

### Against a local Ollama server

[Ollama](https://ollama.com) exposes an OpenAI-compatible endpoint at
`http://localhost:11434/v1`, so the same harness works unchanged — just point
it at the local URL.

```sh
# One-time setup:
ollama serve &              # in another terminal, or as a service
ollama pull mistral-small   # or any other small instruct/coder model

# Run the harness:
BENCH_BASE_URL=http://localhost:11434/v1 \
   BENCH_MODEL=mistral-small \
  node --import tsx/esm benchmarks/run.ts
```

When `BENCH_BASE_URL` is set the harness no longer requires `OPENAI_API_KEY`.
Any small coder model that fits on your machine works (`mistral-small`,
`qwen2.5-coder:3b`, `llama3.2:3b`, `phi3:mini`, etc.). Smaller models are the
interesting case for this harness — they have the most to gain from a tightly
constrained prompt.

The harness exits early with a clear error if neither `OPENAI_API_KEY` nor
`BENCH_BASE_URL` is set.

## What it does

For each fixture in `run.ts`:

1. Builds a **bare** prompt — a plain English description of the function.
2. Builds a **scaffolded** prompt — wraps the output of `scaffoldFunction()`
   (source + companion test file) and asks the model to fill in the TODO.
3. Builds a **skill-hybrid** prompt — the same scaffold source as `scaffolded`,
   plus up to two behavior-specific skill cards selected from the `SKILL_CARDS`
   registry based on the fixture's `behaviorTags`, plus a compact self-check
   block at the end.
4. Sends each enabled prompt (single-shot, no retries) to the configured model
   and records `usage.completion_tokens` (when the server reports it).
5. Writes the model's output to an isolated temp dir alongside the **hidden
   oracle test file** from `benchmarks/oracle/` and runs it via
   `node --import tsx/esm --test`.
6. Records `passed` (boolean) per `(fixture, condition)`.

Results are written to `benchmarks/results.ndjson` (one JSON line per
`(fixture, condition)` per run) and a comparison table — plus a per-fixture
token-delta breakdown and aggregate pass-rate per condition — is printed to
stdout.

## Low-compute mode

If you want to use less local compute, run fewer conditions and/or fewer fixtures.

```sh
# Scaffolded-only (roughly one third the calls)
BENCH_CONDITIONS=scaffolded node --import tsx/esm benchmarks/run.ts

# Skill-hybrid only
BENCH_CONDITIONS=skill-hybrid node --import tsx/esm benchmarks/run.ts

# A/B: compare skill-hybrid against scaffolded on targeted fixtures
BENCH_CONDITIONS=scaffolded,skill-hybrid \
BENCH_FIXTURES=topKFrequent,parseQueryString,coerce \
  node --import tsx/esm benchmarks/run.ts

# Only selected fixtures
BENCH_FIXTURES=clamp,chunk,wordCount node --import tsx/esm benchmarks/run.ts

# Combine both for a cheap smoke run
BENCH_CONDITIONS=scaffolded \
BENCH_FIXTURES=clamp,chunk,wordCount \
node --import tsx/esm benchmarks/run.ts
```

The table also includes `llmSeconds` (elapsed inference time per request) and
`Δsecs`/`Δtokens` columns showing the delta versus `bare` for every non-bare
condition.

## Conditions

| Condition | Prompt shape | Tags / cards used |
|---|---|---|
| `bare` | Plain English description of the function | None |
| `scaffolded` | Scaffold source (JSDoc + signature + TODO) | None |
| `skill-hybrid` | Scaffold source + `<guidance>` block (≤2 skill cards) + 3-line self-check | Selected from fixture's `behaviorTags` |

The `skill-hybrid` condition is the experimental path. It keeps the scaffold
compact and adds targeted, imperative guidance only for the edge-case-heavy
behaviors that are most likely to trip up a model. The `scaffolded` condition is
preserved as a stable baseline for historical A/B comparison.

## Skill cards and behavior tags

Each fixture in `run.ts` carries an optional `behaviorTags` array that names the
primary failure modes for that function. The `SKILL_CARDS` constant maps each
tag to ≤3 sentences of imperative guidance:

| Tag | Card guidance |
|---|---|
| `bounds` | Return `[]` immediately when size/k ≤ 0; never extend beyond array length. |
| `empty-input` | Empty string or array must return the zero-value output — never throw. |
| `nan-handling` | Empty string and non-numeric strings must return `NaN`, not `0`. |
| `ordering` | Sort by the primary key descending, secondary key ascending on ties. |
| `percent-encoding` | Decode keys and values with `decodeURIComponent`; missing `=` means empty string. |
| `null-handling` | Return the specified fallback immediately when the nullable param is null. |
| `tie-breaking` | Break frequency ties lexicographically ascending (lower letter wins). |
| `one-level-only` | Flatten exactly one level — do not recursively flatten nested arrays. |
| `deduplication` | Use SameValueZero equality (Set semantics); preserve first-seen order. |

### Adding a new skill card

1. Add an entry to `SKILL_CARDS` in `run.ts` with a short, memorable tag name.
2. Tag any fixtures where that behavior is the primary failure mode.
3. The card will be automatically injected (as long as fewer than 2 other cards
   are already selected for that fixture — earlier tags take priority).

## Fixtures

The harness ships with a varied set of small functions chosen to exercise
different shapes of code-generation problem:

| Fixture          | Signature                                                         | `behaviorTags`                    | Why it's here |
| ---------------- | ----------------------------------------------------------------- | --------------------------------- | ------------- |
| `clamp`          | `(value, min, max: number) => number`                             | `bounds`                          | Trivial branching, baseline |
| `slugify`        | `(title: string) => string`                                       | `empty-input`                     | Regex / string normalization, easy to get subtly wrong |
| `chunk`          | `<T>(arr: T[], size: number) => T[][]`                            | `bounds`                          | Generic, loop-with-bounds |
| `fizzbuzz`       | `(n: number) => string[]`                                         | `empty-input`                     | Classic specification, needs exact output strings |
| `isPalindrome`   | `(text: string) => boolean`                                       | `empty-input`                     | Case- and punctuation-insensitivity is the gotcha |
| `flatten`        | `<T>(arr: T[][]) => T[]`                                          | `one-level-only`                  | Generic, must flatten exactly one level |
| `wordCount`      | `(text: string) => number`                                        | `empty-input`                     | Edge cases around empty / whitespace strings |
| `unique`         | `<T>(arr: T[]) => T[]`                                            | `deduplication`                   | Order preservation + SameValueZero (NaN) |
| `coerce`         | `(value: string \| number) => number`                             | `nan-handling`, `empty-input`     | Union param type; NaN edge cases |
| `safeUpperCase`  | `(value: string \| null) => string`                               | `null-handling`                   | Nullable param type; null-handling branch |
| `applyAll`       | `(items: string[], transform: (item: string) => string) => string[]` | `empty-input`                  | Arrow-function param type; immutability |
| `lookup`         | `(record: Record<string, string>, key: string) => string \| null` | `null-handling`                   | Record param + union return type |
| `mergeIntervals` | `(intervals: { start: number; end: number }[]) => { start: number; end: number }[]` | `ordering`, `empty-input` | Sorting + overlap/touch merge logic |
| `parseQueryString` | `(query: string) => Record<string, string>`                    | `percent-encoding`, `empty-input` | Parsing/decoding rules + repeated-key behavior |
| `topKFrequent`   | `(words: string[], k: number) => string[]`                        | `tie-breaking`, `bounds`          | Frequency counting + deterministic tie-break ranking |

## Interpreting results

The scaffold is **a win** when, for the same fixture:

- `scaffolded.completionTokens < bare.completionTokens`, **and**
- `scaffolded.passed >= bare.passed` (no regression in correctness).

The skill-hybrid variant is **an additional win** when:

- `skill-hybrid.completionTokens <= scaffolded.completionTokens`, **and**
- `skill-hybrid.passed >= scaffolded.passed` (higher first-shot pass rate).

Even break-even tokens with a higher first-shot pass rate is a win. The
aggregate pass-rate line at the bottom of the run is the headline number.

## Adding a new fixture

1. Append a `Fixture` entry to `fixtures` in `run.ts` with a
   `ScaffoldFunctionConfig`, a bare prompt, the oracle file name, and a
   `behaviorTags` array naming the edge-case-heavy behaviors for that function.
2. Add the corresponding hidden test file to `benchmarks/oracle/<name>.test.ts`.
   It should import from `./<name>.js` (the harness writes the LLM output to
   `<name>.ts` next to a copy of the oracle file at run time).
3. The oracle test should cover edge cases that **differ from** the example
   values in the `ScaffoldFunctionConfig`, otherwise the wiring assertion
   alone could pass.

## Files

- `run.ts` — the harness entry point.
- `oracle/*.test.ts` — hidden test suites the LLM never sees.
- `results.ndjson` — append-only log of every run (gitignored if you wish).
