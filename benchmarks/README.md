# Benchmarks: scaffolded vs. bare prompts

This directory contains a standalone harness that measures whether passing the
output of `scaffoldFunction()` to an LLM produces correct implementations using
**fewer completion tokens** than a plain English description of the same
function.

It is **not** part of the library's test suite. It makes real network calls to
OpenAI and costs a few cents per run.

## Running

```sh
export OPENAI_API_KEY=sk-...
# Optional overrides:
#   BENCH_MODEL=gpt-4o-mini BENCH_TEMPERATURE=0
node --import tsx/esm benchmarks/run.ts
```

The harness exits early with a clear error if `OPENAI_API_KEY` is unset.

## What it does

For each fixture in `run.ts` (`clamp`, `slugify`, `chunk`):

1. Builds a **bare** prompt — a plain English description of the function.
2. Builds a **scaffolded** prompt — wraps the output of `scaffoldFunction()`
   (source + companion test file) and asks the model to fill in the TODO.
3. Sends both prompts (single-shot, no retries) to the configured model and
   records `usage.completion_tokens`.
4. Writes the model's output to an isolated temp dir alongside the **hidden
   oracle test file** from `benchmarks/oracle/` and runs it via
   `node --import tsx/esm --test`.
5. Records `passed` (boolean) per `(fixture, condition)`.

Results are written to `benchmarks/results.ndjson` (one JSON line per
`(fixture, condition)` per run) and a comparison table is printed to stdout.

## Interpreting results

The scaffold is **a win** when, for the same fixture:

- `scaffolded.completionTokens < bare.completionTokens`, **and**
- `scaffolded.passed >= bare.passed` (no regression in correctness).

Even break-even tokens with a higher first-shot pass rate is a win.

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
