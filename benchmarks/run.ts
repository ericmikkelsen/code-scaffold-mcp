/**
 * Benchmark harness: scaffolded vs. bare prompts for LLM function generation.
 *
 * Run against OpenAI:
 *   OPENAI_API_KEY=sk-... node --import tsx/esm benchmarks/run.ts
 *
 * Run against a local Ollama server (OpenAI-compatible endpoint):
 *   ollama serve &
 *   ollama pull mistral-small
 *   BENCH_BASE_URL=http://localhost:11434/v1 \
 *     BENCH_MODEL=mistral-small \
 *     node --import tsx/esm benchmarks/run.ts
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
import { toSourceLiteral } from '../src/utils.js';

const BASE_URL = process.env.BENCH_BASE_URL;
const MODEL = process.env.BENCH_MODEL ?? (BASE_URL ? 'mistral-small' : 'gpt-4o');
const TEMPERATURE = Number(process.env.BENCH_TEMPERATURE ?? '0');
const BENCH_CONDITIONS_RAW = process.env.BENCH_CONDITIONS ?? 'bare,scaffolded';
const BENCH_FIXTURES_RAW = process.env.BENCH_FIXTURES;
const LOG_PROMPTS = process.env.BENCH_LOG_PROMPTS === '1';

const ANSI = {
  reset: '\u001b[0m',
  fgBlack: '\u001b[30m',
  fgGreen: '\u001b[32m',
  fgPink: '\u001b[95m',
  bgBlack: '\u001b[40m',
  bgPink: '\u001b[105m',
} as const;

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
      examples: [
        { args: ['  many   spaces  here  '], output: 'many-spaces-here' },
        { args: ['Hello, World!'], output: 'hello-world' },
        { args: ['---weird---title---'], output: 'weird-title' },
        { args: [''], output: '' },
      ],
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
      examples: [
        { args: [[1, 2, 3], 0], output: [] },
      ],
    },
    oracleFile: 'chunk.test.ts',
    barePrompt:
      'Implement a generic TypeScript function called `chunk` with signature ' +
      '`chunk<T>(arr: T[], size: number): T[][]` that splits an array into chunks ' +
      'of at most `size` items. The last chunk may be shorter. ' +
      'Reply with only a single TypeScript file containing `export function chunk<T>(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'fizzbuzz',
      language: 'ts',
      paramDefs: [
        { name: 'n', tsType: 'number', example: 5, description: 'How many entries to generate, starting at 1' },
      ],
      outputType: 'string[]',
      returnDescription: 'An array of length `n` with classic FizzBuzz strings for 1..n',
      exampleOutput: ['1', '2', 'Fizz', '4', 'Buzz'],
    },
    oracleFile: 'fizzbuzz.test.ts',
    barePrompt:
      'Implement a TypeScript function called `fizzbuzz` with signature ' +
      '`fizzbuzz(n: number): string[]` that returns an array of length `n` containing ' +
      'the classic FizzBuzz output for the integers 1..n. For each i: if i is divisible ' +
      'by both 3 and 5 the entry is "FizzBuzz"; if divisible by only 3 it is "Fizz"; ' +
      'if divisible by only 5 it is "Buzz"; otherwise the decimal string of i. ' +
      'Reply with only a single TypeScript file containing `export function fizzbuzz(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'isPalindrome',
      language: 'ts',
      paramDefs: [
        { name: 'text', tsType: 'string', example: 'Race car', description: 'The string to test' },
      ],
      outputType: 'boolean',
      returnDescription: 'True if `text` reads the same forwards and backwards (case- and punctuation-insensitive)',
      exampleOutput: true,
    },
    oracleFile: 'isPalindrome.test.ts',
    barePrompt:
      'Implement a TypeScript function called `isPalindrome` with signature ' +
      '`isPalindrome(text: string): boolean` that returns true if `text` reads the ' +
      'same forwards and backwards after lowercasing and removing all non-alphanumeric ' +
      'characters. The empty string counts as a palindrome. ' +
      'Reply with only a single TypeScript file containing `export function isPalindrome(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'flatten',
      language: 'ts',
      paramDefs: [
        { name: 'arr', tsType: 'T[][]', example: [[1, 2], [3, 4]], description: 'An array of arrays to flatten one level' },
      ],
      outputType: 'T[]',
      returnDescription: 'A new array with all sub-array elements concatenated, in order',
      exampleOutput: [1, 2, 3, 4],
    },
    oracleFile: 'flatten.test.ts',
    barePrompt:
      'Implement a generic TypeScript function called `flatten` with signature ' +
      '`flatten<T>(arr: T[][]): T[]` that concatenates the contents of each ' +
      'sub-array into a single flat array, preserving order. Only one level of ' +
      'flattening — nested sub-arrays remain nested. ' +
      'Reply with only a single TypeScript file containing `export function flatten<T>(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'wordCount',
      language: 'ts',
      paramDefs: [
        { name: 'text', tsType: 'string', example: 'hello world', description: 'The string whose words should be counted' },
      ],
      outputType: 'number',
      returnDescription: 'The number of whitespace-separated, non-empty word tokens in `text`',
      exampleOutput: 2,
    },
    oracleFile: 'wordCount.test.ts',
    barePrompt:
      'Implement a TypeScript function called `wordCount` with signature ' +
      '`wordCount(text: string): number` that returns the number of whitespace-separated ' +
      'word tokens in `text`. Leading, trailing and runs of internal whitespace must not ' +
      'create empty tokens. An all-whitespace or empty string returns 0. ' +
      'Reply with only a single TypeScript file containing `export function wordCount(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'unique',
      language: 'ts',
      paramDefs: [
        { name: 'arr', tsType: 'T[]', example: [1, 2, 2, 3, 1], description: 'The array to deduplicate' },
      ],
      outputType: 'T[]',
      returnDescription: 'A new array containing each value from `arr` only once, in first-seen order',
      exampleOutput: [1, 2, 3],
    },
    oracleFile: 'unique.test.ts',
    barePrompt:
      'Implement a generic TypeScript function called `unique` with signature ' +
      '`unique<T>(arr: T[]): T[]` that returns a new array containing each value ' +
      'from `arr` only once, preserving the order of first occurrence. Use SameValueZero ' +
      'equality (i.e. the same equality semantics as `Set`). ' +
      'Reply with only a single TypeScript file containing `export function unique<T>(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'coerce',
      language: 'ts',
      paramDefs: [
        { name: 'value', tsType: 'string | number', example: '42', description: 'The value to coerce' },
      ],
      outputType: 'number',
      returnDescription: 'The numeric value; strings are parsed via Number()',
      exampleOutput: 42,
    },
    oracleFile: 'coerce.test.ts',
    barePrompt:
      'Implement a TypeScript function called `coerce` with signature ' +
      '`coerce(value: string | number): number` that returns the numeric value. ' +
      'When value is already a number, return it unchanged. When value is a string, ' +
      'parse it using Number() — so "42" becomes 42, "3.14" becomes 3.14, and ' +
      'non-numeric strings produce NaN. ' +
      'Reply with only a single TypeScript file containing `export function coerce(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'safeUpperCase',
      language: 'ts',
      paramDefs: [
        { name: 'value', tsType: 'string | null', example: 'hello', description: 'The string to uppercase, or null' },
      ],
      outputType: 'string',
      returnDescription: "The uppercased string, or '' when value is null",
      exampleOutput: 'HELLO',
    },
    oracleFile: 'safeUpperCase.test.ts',
    barePrompt:
      'Implement a TypeScript function called `safeUpperCase` with signature ' +
      '`safeUpperCase(value: string | null): string` that returns the uppercased version ' +
      "of value. When value is null, return an empty string. " +
      'Reply with only a single TypeScript file containing `export function safeUpperCase(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'applyAll',
      language: 'ts',
      paramDefs: [
        { name: 'items', tsType: 'string[]', example: ['a', 'b', 'c'], description: 'Array of strings to transform' },
        { name: 'transform', tsType: '(item: string) => string', example: null, description: 'Function applied to each item' },
      ],
      outputType: 'string[]',
      returnDescription: 'A new array with transform applied to every element of items',
      exampleOutput: ['A', 'B', 'C'],
    },
    oracleFile: 'applyAll.test.ts',
    barePrompt:
      'Implement a TypeScript function called `applyAll` with signature ' +
      '`applyAll(items: string[], transform: (item: string) => string): string[]` that ' +
      'returns a new array produced by calling transform on every element of items. ' +
      'An empty items array returns an empty array. The original array must not be mutated. ' +
      'Reply with only a single TypeScript file containing `export function applyAll(...)` — no markdown, no commentary.',
  },
  {
    config: {
      name: 'lookup',
      language: 'ts',
      paramDefs: [
        { name: 'record', tsType: 'Record<string, string>', example: { a: '1', b: '2' }, description: 'The object to search' },
        { name: 'key', tsType: 'string', example: 'a', description: 'The key to find' },
      ],
      outputType: 'string | null',
      returnDescription: 'The value for key, or null if the key is not present',
      exampleOutput: '1',
    },
    oracleFile: 'lookup.test.ts',
    barePrompt:
      'Implement a TypeScript function called `lookup` with signature ' +
      '`lookup(record: Record<string, string>, key: string): string | null` that ' +
      'returns the string value stored at key in record, or null if the key is absent. ' +
      'Reply with only a single TypeScript file containing `export function lookup(...)` — no markdown, no commentary.',
  },
];

type Condition = 'bare' | 'scaffolded';

type Result = {
  fixture: string;
  condition: Condition;
  model: string;
  temperature: number;
  llmMs: number | null;
  completionTokens: number | null;
  promptTokens: number | null;
  passed: boolean;
  testOutput: string;
  error?: string;
};

function parseConditions(raw: string): Condition[] {
  const requested = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (requested.length === 0) {
    throw new Error('BENCH_CONDITIONS is empty. Use a comma-separated list like bare,scaffolded or scaffolded.');
  }

  const out: Condition[] = [];
  for (const value of requested) {
    if (value !== 'bare' && value !== 'scaffolded') {
      throw new Error(`Invalid BENCH_CONDITIONS value '${value}'. Allowed values: bare, scaffolded.`);
    }
    if (!out.includes(value)) {
      out.push(value);
    }
  }

  return out;
}

function parseFixtureNames(raw: string | undefined): Set<string> | null {
  if (!raw) {
    return null;
  }

  const names = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (names.length === 0) {
    throw new Error('BENCH_FIXTURES is empty. Use a comma-separated list like clamp,chunk or omit it.');
  }

  return new Set(names);
}

function colorForCondition(condition: Condition): string {
  return condition === 'bare' ? ANSI.fgGreen : ANSI.fgPink;
}

function logPrompt(fixtureName: string, condition: Condition, prompt: string): void {
  const color = colorForCondition(condition);
  const title = `[${fixtureName}] (${condition})`;
  console.log(`\n${color}${title}${ANSI.reset}`);
  console.log(`${color}${prompt}${ANSI.reset}\n`);
}

function buildScaffoldedPrompt(source: string, _config: ScaffoldFunctionConfig): string {
  return [
    'Complete the function implementation by replacing the return statement with correct business logic.',
    'Reply with only the completed TypeScript source file — no markdown, no commentary.',
    '',
    '<scaffold>',
    source,
    '</scaffold>',
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
  // Mark the temp dir as ESM so tsx resolves `./<name>.js` imports against the
  // adjacent `.ts` source instead of falling back to CJS resolution (which
  // would always fail with MODULE_NOT_FOUND).
  writeFileSync(join(workDir, 'package.json'), '{"type":"module"}\n');
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
    llmSeconds: r.llmMs == null ? '—' : (r.llmMs / 1000).toFixed(2),
    completionTokens: r.completionTokens ?? '—',
    promptTokens: r.promptTokens ?? '—',
    passed: r.passed ? 'pass' : 'FAIL',
  }));

  console.log(
    `\nModel: ${MODEL}  Temperature: ${TEMPERATURE}` +
      (BASE_URL ? `  Endpoint: ${BASE_URL}` : '') +
      '\n',
  );

  // Build custom colored table
  const fixtureNames = [...new Set(results.map((r) => r.fixture))];
  const headers = ['fixture', 'condition', 'llmSeconds', 'completionTokens', 'promptTokens', 'Δsecs', 'Δtokens', 'passed'];
  
  // Print header
  const headerRow = headers.map(h => h.padEnd(12)).join('  ');
  console.log(headerRow);
  console.log('─'.repeat(headerRow.length));

  // Print rows with color coding
  for (const row of rows) {
    const rowStyle = row.condition === 'bare'
      ? `${ANSI.bgBlack}${ANSI.fgGreen}`
      : `${ANSI.bgPink}${ANSI.fgBlack}`;
    
    // Calculate deltas for this fixture
    let secondsDelta = '—';
    let tokensDelta = '—';
    if (row.condition === 'scaffolded') {
      const bare = results.find((r) => r.fixture === row.fixture && r.condition === 'bare');
      const scaff = results.find((r) => r.fixture === row.fixture && r.condition === 'scaffolded');
      
      if (bare?.llmMs != null && scaff?.llmMs != null) {
        const delta = (scaff.llmMs - bare.llmMs) / 1000;
        const sign = delta > 0 ? '+' : '';
        secondsDelta = `${sign}${delta.toFixed(2)}`;
      }
      
      if (bare?.completionTokens != null && scaff?.completionTokens != null) {
        const delta = scaff.completionTokens - bare.completionTokens;
        const sign = delta > 0 ? '+' : '';
        tokensDelta = `${sign}${delta}`;
      }
    }

    const cells = [
      row.fixture.padEnd(12),
      row.condition.padEnd(12),
      String(row.llmSeconds).padEnd(12),
      String(row.completionTokens).padEnd(12),
      String(row.promptTokens).padEnd(12),
      secondsDelta.padEnd(12),
      tokensDelta.padEnd(12),
      row.passed.padEnd(12),
    ];
    
    const coloredRow = `${rowStyle}${cells.join('  ')}${ANSI.reset}`;
    console.log(coloredRow);
  }

  // Per-fixture summary
  if (results.some((r) => r.condition === 'bare') && results.some((r) => r.condition === 'scaffolded')) {
    let totalSecondsDelta = 0;
    let totalTokensDelta = 0;
    let secondsPairs = 0;
    let tokenPairs = 0;

    console.log('\nDelta (scaffolded - bare) completion tokens:');
    for (const name of fixtureNames) {
      const bare = results.find((r) => r.fixture === name && r.condition === 'bare');
      const scaff = results.find((r) => r.fixture === name && r.condition === 'scaffolded');
      if (bare?.llmMs != null && scaff?.llmMs != null) {
        totalSecondsDelta += (scaff.llmMs - bare.llmMs) / 1000;
        secondsPairs += 1;
      }
      if (bare?.completionTokens != null && scaff?.completionTokens != null) {
        const delta = scaff.completionTokens - bare.completionTokens;
        totalTokensDelta += delta;
        tokenPairs += 1;
        const sign = delta > 0 ? '+' : '';
        console.log(
          `  ${name}: bare=${bare.completionTokens} scaffolded=${scaff.completionTokens} ` +
            `delta=${sign}${delta}  bare=${bare.passed ? 'pass' : 'FAIL'} scaffolded=${scaff.passed ? 'pass' : 'FAIL'}`,
        );
      }
    }

    console.log('\nTotal delta (scaffolded - bare):');
    if (secondsPairs > 0) {
      const sign = totalSecondsDelta > 0 ? '+' : '';
      console.log(`  seconds: ${sign}${totalSecondsDelta.toFixed(2)} across ${secondsPairs} fixture pairs`);
    }
    if (tokenPairs > 0) {
      const sign = totalTokensDelta > 0 ? '+' : '';
      console.log(`  completion tokens: ${sign}${totalTokensDelta} across ${tokenPairs} fixture pairs`);
    }
  }

  // Aggregate pass rate per condition — the headline number for the harness.
  console.log('\nPass rate:');
  for (const cond of ['bare', 'scaffolded'] as const) {
    const subset = results.filter((r) => r.condition === cond);
    if (subset.length === 0) {
      continue;
    }
    const passes = subset.filter((r) => r.passed).length;
    console.log(`  ${cond.padEnd(10)} ${passes}/${subset.length}`);
  }
}

async function main(): Promise<void> {
  if (!BASE_URL && !process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set; the benchmark cannot run.');
    console.error('Set OPENAI_API_KEY and re-run, or point at a local OpenAI-compatible server:');
    console.error('  BENCH_BASE_URL=http://localhost:11434/v1 BENCH_MODEL=mistral-small \\');
    console.error('    node --import tsx/esm benchmarks/run.ts');
    process.exit(1);
  }

  const client = new OpenAI({
    baseURL: BASE_URL,
    // Ollama (and most OpenAI-compatible servers) ignore the key but the SDK
    // requires a non-empty string. Fall back to a placeholder when targeting a
    // local server without OPENAI_API_KEY.
    apiKey: process.env.OPENAI_API_KEY ?? (BASE_URL ? 'not-needed' : undefined),
  });

  const selectedConditions = parseConditions(BENCH_CONDITIONS_RAW);
  const selectedFixtureNames = parseFixtureNames(BENCH_FIXTURES_RAW);
  const selectedFixtures = selectedFixtureNames
    ? fixtures.filter((f) => selectedFixtureNames.has(f.config.name))
    : fixtures;

  if (selectedFixtures.length === 0) {
    const available = fixtures.map((f) => f.config.name).join(', ');
    throw new Error(`No fixtures selected. BENCH_FIXTURES='${BENCH_FIXTURES_RAW}' did not match any fixture. Available: ${available}`);
  }

  if (selectedFixtureNames) {
    const available = new Set(fixtures.map((f) => f.config.name));
    const unknown = [...selectedFixtureNames].filter((name) => !available.has(name));
    if (unknown.length > 0) {
      throw new Error(`Unknown fixtures in BENCH_FIXTURES: ${unknown.join(', ')}`);
    }
  }

  const results: Result[] = [];
  const startedAt = new Date().toISOString();

  console.log(
    `Running fixtures: ${selectedFixtures.map((f) => f.config.name).join(', ')} | conditions: ${selectedConditions.join(', ')}`,
  );

  for (const fixture of selectedFixtures) {
    const { config, oracleFile, barePrompt } = fixture;
    const scaffold = scaffoldFunction(config);
    const scaffoldedPrompt = buildScaffoldedPrompt(scaffold.source, config);

    for (const [condition, prompt] of [
      ['bare', barePrompt],
      ['scaffolded', scaffoldedPrompt],
    ].filter(([condition]) => selectedConditions.includes(condition as Condition)) as readonly [Condition, string][]) {
      console.log(`\n→ ${config.name} [${condition}] — calling ${MODEL}…`);
      if (LOG_PROMPTS) {
        logPrompt(config.name, condition, prompt);
      }
      let result: Result;
      try {
        const llmStart = Date.now();
        const { text, completionTokens, promptTokens } = await callLLM(client, prompt);
        const llmMs = Date.now() - llmStart;
        const cleaned = cleanLLMOutput(text);
        const { passed, output } = runOracle(config.name, condition, cleaned, oracleFile);
        result = {
          fixture: config.name,
          condition,
          model: MODEL,
          temperature: TEMPERATURE,
          llmMs,
          completionTokens,
          promptTokens,
          passed,
          testOutput: output.slice(-MAX_TEST_OUTPUT_CHARS),
        };
        console.log(
          `  tokens=${completionTokens ?? '?'}  secs=${(llmMs / 1000).toFixed(2)}  passed=${passed}`,
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
          llmMs: null,
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
