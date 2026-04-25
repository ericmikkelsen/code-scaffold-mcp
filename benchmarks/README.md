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
ollama pull qwen2.5-coder:1.5b   # or any other small instruct/coder model

# Run the harness:
BENCH_BASE_URL=http://localhost:11434/v1 \
  BENCH_MODEL=qwen2.5-coder:1.5b \
  node --import tsx/esm benchmarks/run.ts
```

When `BENCH_BASE_URL` is set the harness no longer requires `OPENAI_API_KEY`.
Any small coder model that fits on your machine works (`qwen2.5-coder:1.5b`,
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
3. Sends both prompts (single-shot, no retries) to the configured model and
   records `usage.completion_tokens` (when the server reports it).
4. Writes the model's output to an isolated temp dir alongside the **hidden
   oracle test file** from `benchmarks/oracle/` and runs it via
   `node --import tsx/esm --test`.
5. Records `passed` (boolean) per `(fixture, condition)`.

Results are written to `benchmarks/results.ndjson` (one JSON line per
`(fixture, condition)` per run) and a comparison table — plus a per-fixture
token-delta breakdown and aggregate pass-rate per condition — is printed to
stdout.

## Fixtures

The harness ships with a varied set of small functions chosen to exercise
different shapes of code-generation problem:

| Fixture        | Signature                                      | Why it's here |
| -------------- | ---------------------------------------------- | ------------- |
| `clamp`        | `(value, min, max: number) => number`          | Trivial branching, baseline |
| `slugify`      | `(title: string) => string`                    | Regex / string normalization, easy to get subtly wrong |
| `chunk`        | `<T>(arr: T[], size: number) => T[][]`         | Generic, loop-with-bounds |
| `fizzbuzz`     | `(n: number) => string[]`                      | Classic specification, needs exact output strings |
| `isPalindrome` | `(text: string) => boolean`                    | Case- and punctuation-insensitivity is the gotcha |
| `flatten`      | `<T>(arr: T[][]) => T[]`                       | Generic, must flatten exactly one level |
| `wordCount`    | `(text: string) => number`                     | Edge cases around empty / whitespace strings |
| `unique`       | `<T>(arr: T[]) => T[]`                         | Order preservation + SameValueZero (NaN) |

## Interpreting results

The scaffold is **a win** when, for the same fixture:

- `scaffolded.completionTokens < bare.completionTokens`, **and**
- `scaffolded.passed >= bare.passed` (no regression in correctness).

Even break-even tokens with a higher first-shot pass rate is a win. The
aggregate pass-rate line at the bottom of the run is the headline number.

## Adding a new fixture

1. Append a `Fixture` entry to `fixtures` in `run.ts` with a
   `ScaffoldFunctionConfig`, a bare prompt, and the oracle file name.
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
