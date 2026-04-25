/**
 * Benchmark harness: scaffolded vs. bare prompts for LLM function generation.
 *
 * Run:
 *   OPENAI_API_KEY=sk-... node --import tsx/esm benchmarks/run.ts
 *
 * For each fixture, sends two single-shot prompts (bare vs scaffolded) to the
 * configured LLM, writes the resulting source to a temp file, runs the hidden
 * oracle test suite against it in a child process, and records the result.
 *
 * Results are printed as a comparison table on stdout and appended to
 * benchmarks/results.ndjson for later analysis.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, copyFileSync, appendFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import OpenAI from 'openai';
import { scaffoldFunction } from '../src/index.js';
import type { ScaffoldFunctionConfig } from '../src/index.js';

const MODEL = process.env.BENCH_MODEL ?? 'gpt-4o';
const TEMPERATURE = Number(process.env.BENCH_TEMPERATURE ?? '0');

/** Maximum characters of oracle test output retained per result in results.ndjson. */
const MAX_TEST_OUTPUT_CHARS = 2000;
/** Maximum trailing lines of oracle output to print on a failure. */
const MAX_FAILURE_OUTPUT_LINES = 20;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORACLE_DIR = join(__dirname, 'oracle');
const RESULTS_PATH = join(__dirname, 'results.ndjson');

type Fixture = {
  config: ScaffoldFunctionConfig;
  /** Path (relative to benchmarks/oracle) of the oracle test file for this fn */
  oracleFile: string;
  /** Bare prompt — what an LLM gets with no scaffold context */
  barePrompt: string;
};

const fixtures: Fixture[] = [
  {
    config: {
      name: 'clamp',
      language: 'ts',
      paramDefs: [
        { name: 'value', tsType: 'number', example: 5, description: 'The number to clamp' },
        { name: 'min', tsType: 'number', example: 0, description: 'Lower bound (inclusive)' },
        { name: 'max', tsType: 'number', example: 10, description: 'Upper bound (inclusive)' },
      ],
      outputType: 'number',
      returnDescription: 'The value constrained to [min, max]',
      exampleOutput: 5,
    },
    oracleFile: 'clamp.test.ts',
    barePrompt:
      'Implement a TypeScript function called `clamp` that takes ' +
      '(value: number, min: number, max: number): number and returns the value ' +
      'clamped to the inclusive range [min, max]. ' +
      'Reply with only a single TypeScript file containing `export function clamp(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'slugify',
      language: 'ts',
      paramDefs: [
        { name: 'title', tsType: 'string', example: 'Hello World', description: 'The title to slugify' },
      ],
      outputType: 'string',
      returnDescription: 'A URL-safe slug derived from the title',
      exampleOutput: 'hello-world',
    },
    oracleFile: 'slugify.test.ts',
    barePrompt:
      'Implement a TypeScript function called `slugify` that takes (title: string): string ' +
      'and returns a lowercase, hyphen-separated, URL-safe slug. ' +
      'It should collapse whitespace, strip punctuation, and trim leading/trailing hyphens. ' +
      'Reply with only a single TypeScript file containing `export function slugify(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'chunk',
      language: 'ts',
      paramDefs: [
        { name: 'arr', tsType: 'T[]', example: [1, 2, 3, 4], description: 'The array to split' },
        { name: 'size', tsType: 'number', example: 2, description: 'Maximum size of each chunk' },
      ],
      outputType: 'T[][]',
      returnDescription: 'An array of chunks, each at most `size` long',
      exampleOutput: [[1, 2], [3, 4]],
    },
    oracleFile: 'chunk.test.ts',
    barePrompt:
      'Implement a generic TypeScript function called `chunk` with signature ' +
      '`chunk<T>(arr: T[], size: number): T[][]` that splits an array into chunks ' +
      'of at most `size` items. The last chunk may be shorter. ' +
      'Reply with only a single TypeScript file containing `export function chunk<T>(...)` — no markdown, no commentary.',
  },
];

type Condition = 'bare' | 'scaffolded';

type Result = {
  fixture: string;
  condition: Condition;
  model: string;
  temperature: number;
  completionTokens: number | null;
  promptTokens: number | null;
  passed: boolean;
  testOutput: string;
  error?: string;
};

function buildScaffoldedPrompt(source: string, testSource: string): string {
  return [
    'Here is a TypeScript scaffold. Replace the TODO with a correct implementation.',
    'Keep the existing exported function signature and JSDoc. ',
    'Reply with only the completed TypeScript source file — no markdown, no commentary.',
    '',
    '<scaffold>',
    source,
    '</scaffold>',
    '',
    '<test>',
    testSource,
    '</test>',
  ].join('\n');
}

/**
 * Strip common LLM artifacts: leading/trailing markdown code fences.
 */
function cleanLLMOutput(raw: string): string {
  let out = raw.trim();
  const fenceMatch = out.match(/^```(?:typescript|ts|javascript|js)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenceMatch) {
    out = fenceMatch[1];
  }
  return out.trim() + '\n';
}

async function callLLM(
  client: OpenAI,
  prompt: string,
): Promise<{ text: string; completionTokens: number | null; promptTokens: number | null }> {
  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    messages: [
      {
        role: 'system',
        content:
          'You are a precise code generator. Output only the requested source file. ' +
          'Do not include explanations or markdown fences.',
      },
      { role: 'user', content: prompt },
    ],
  });
  const choice = response.choices[0];
  const text = choice?.message?.content ?? '';
  return {
    text,
    completionTokens: response.usage?.completion_tokens ?? null,
    promptTokens: response.usage?.prompt_tokens ?? null,
  };
}

/**
 * Write the LLM-produced source + the oracle test file into an isolated temp
 * dir and run `node:test` against them via tsx/esm. Returns pass/fail and the
 * captured output.
 */
function runOracle(
  fixtureName: string,
  condition: Condition,
  source: string,
  oracleFile: string,
): { passed: boolean; output: string } {
  const workDir = join(tmpdir(), `bench-${fixtureName}-${condition}-${process.pid}`);
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  const sourcePath = join(workDir, `${fixtureName}.ts`);
  const testPath = join(workDir, `${fixtureName}.test.ts`);
  writeFileSync(sourcePath, source);
  copyFileSync(join(ORACLE_DIR, oracleFile), testPath);

  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx/esm', '--test', testPath],
    { encoding: 'utf8', timeout: 30_000 },
  );

  const output = (result.stdout ?? '') + (result.stderr ?? '');
  return { passed: result.status === 0, output };
}

function printTable(results: Result[]): void {
  const rows = results.map((r) => ({
    fixture: r.fixture,
    condition: r.condition,
    completionTokens: r.completionTokens ?? '—',
    promptTokens: r.promptTokens ?? '—',
    passed: r.passed ? 'pass' : 'FAIL',
  }));
  console.log(`\nModel: ${MODEL}  Temperature: ${TEMPERATURE}\n`);
  console.table(rows);

  // Per-fixture summary
  const fixtureNames = [...new Set(results.map((r) => r.fixture))];
  console.log('\nDelta (scaffolded - bare) completion tokens:');
  for (const name of fixtureNames) {
    const bare = results.find((r) => r.fixture === name && r.condition === 'bare');
    const scaff = results.find((r) => r.fixture === name && r.condition === 'scaffolded');
    if (bare?.completionTokens != null && scaff?.completionTokens != null) {
      const delta = scaff.completionTokens - bare.completionTokens;
      const sign = delta > 0 ? '+' : '';
      console.log(
        `  ${name}: bare=${bare.completionTokens} scaffolded=${scaff.completionTokens} ` +
          `delta=${sign}${delta}  bare=${bare.passed ? 'pass' : 'FAIL'} scaffolded=${scaff.passed ? 'pass' : 'FAIL'}`,
      );
    }
  }
}

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set; the benchmark cannot run.');
    console.error('Set OPENAI_API_KEY and re-run: node --import tsx/esm benchmarks/run.ts');
    process.exit(1);
  }

  const client = new OpenAI();
  const results: Result[] = [];
  const startedAt = new Date().toISOString();

  for (const fixture of fixtures) {
    const { config, oracleFile, barePrompt } = fixture;
    const scaffold = scaffoldFunction(config);
    const scaffoldedPrompt = buildScaffoldedPrompt(scaffold.source, scaffold.testSource);

    for (const [condition, prompt] of [
      ['bare', barePrompt],
      ['scaffolded', scaffoldedPrompt],
    ] as const) {
      console.log(`\n→ ${config.name} [${condition}] — calling ${MODEL}…`);
      let result: Result;
      try {
        const { text, completionTokens, promptTokens } = await callLLM(client, prompt);
        const cleaned = cleanLLMOutput(text);
        const { passed, output } = runOracle(config.name, condition, cleaned, oracleFile);
        result = {
          fixture: config.name,
          condition,
          model: MODEL,
          temperature: TEMPERATURE,
          completionTokens,
          promptTokens,
          passed,
          testOutput: output.slice(-MAX_TEST_OUTPUT_CHARS),
        };
        console.log(
          `  tokens=${completionTokens ?? '?'}  passed=${passed}`,
        );
        if (!passed) {
          console.log(output.split('\n').slice(-MAX_FAILURE_OUTPUT_LINES).join('\n'));
        }
      } catch (err) {
        result = {
          fixture: config.name,
          condition,
          model: MODEL,
          temperature: TEMPERATURE,
          completionTokens: null,
          promptTokens: null,
          passed: false,
          testOutput: '',
          error: err instanceof Error ? err.message : String(err),
        };
        console.error(`  error: ${result.error}`);
      }
      results.push(result);
      appendFileSync(
        RESULTS_PATH,
        JSON.stringify({ startedAt, ...result }) + '\n',
      );
    }
  }

  printTable(results);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
