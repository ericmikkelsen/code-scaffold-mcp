import test from 'node:test';
import assert from 'node:assert/strict';
import { scaffoldFunction } from './scaffold.js';
import type { ScaffoldFunctionConfig } from './types.js';

const tsConfig: ScaffoldFunctionConfig = {
  name: 'validateEmail',
  paramDefs: [
    { name: 'email', tsType: 'string', example: 'dev@example.com', description: 'Email to validate' },
  ],
  outputType: 'boolean',
  exampleInput: { email: 'dev@example.com' },
  exampleOutput: true,
  language: 'ts',
};

const jsConfig: ScaffoldFunctionConfig = {
  ...tsConfig,
  language: 'js',
};

// ──────────────────────────────────────────────────────────────
// File names
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - TS produces .ts file names', () => {
  const { fileName, testFileName } = scaffoldFunction(tsConfig);
  assert.equal(fileName, 'validateEmail.ts');
  assert.equal(testFileName, 'validateEmail.test.ts');
});

test('scaffoldFunction - JS produces .js file names', () => {
  const { fileName, testFileName } = scaffoldFunction(jsConfig);
  assert.equal(fileName, 'validateEmail.js');
  assert.equal(testFileName, 'validateEmail.test.js');
});

// ──────────────────────────────────────────────────────────────
// TS source output
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - TS source includes JSDoc without type braces', () => {
  const { source } = scaffoldFunction(tsConfig);
  assert.ok(source.includes(' * @param email - Email to validate'));
  assert.ok(!source.includes('{string}'));
  assert.ok(source.includes(' * @returns Expected return type for this scaffold'));
});

test('scaffoldFunction - TS source has typed function signature', () => {
  const { source } = scaffoldFunction(tsConfig);
  assert.ok(source.includes('export function validateEmail(email: string): boolean {'));
});

test('scaffoldFunction - TS source includes TODO comment and example comments', () => {
  const { source } = scaffoldFunction(tsConfig);
  assert.ok(source.includes('// TODO: implement business logic'));
  assert.ok(source.includes("// Example input from scaffold config: { email: 'dev@example.com' }"));
  assert.ok(source.includes('// Example output from scaffold config: true'));
});

test('scaffoldFunction - TS source returns exampleOutput as placeholder', () => {
  const { source } = scaffoldFunction(tsConfig);
  assert.ok(source.includes('return true;'));
});

test('scaffoldFunction - TS source matches spec example exactly', () => {
  const { source } = scaffoldFunction(tsConfig);
  const expected = [
    '/**',
    ' * TODO: Describe the function purpose.',
    ' * @param email - Email to validate',
    ' * @returns Expected return type for this scaffold',
    ' */',
    'export function validateEmail(email: string): boolean {',
    '  // TODO: implement business logic',
    "  // Example input from scaffold config: { email: 'dev@example.com' }",
    '  // Example output from scaffold config: true',
    '',
    '  return true;',
    '}',
    '',
  ].join('\n');
  assert.equal(source, expected);
});

// ──────────────────────────────────────────────────────────────
// JS source output
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - JS source includes JSDoc with type braces', () => {
  const { source } = scaffoldFunction(jsConfig);
  assert.ok(source.includes(' * @param {string} email - Email to validate'));
  assert.ok(source.includes(' * @returns {boolean} Expected return type for this scaffold'));
});

test('scaffoldFunction - JS source has untyped function signature', () => {
  const { source } = scaffoldFunction(jsConfig);
  assert.ok(source.includes('export function validateEmail(email) {'));
  assert.ok(!source.includes('email: string'));
  assert.ok(!source.includes('): boolean'));
});

test('scaffoldFunction - JS source matches spec example exactly', () => {
  const { source } = scaffoldFunction(jsConfig);
  const expected = [
    '/**',
    ' * TODO: Describe the function purpose.',
    ' * @param {string} email - Email to validate',
    ' * @returns {boolean} Expected return type for this scaffold',
    ' */',
    'export function validateEmail(email) {',
    '  // TODO: implement business logic',
    "  // Example input from scaffold config: { email: 'dev@example.com' }",
    '  // Example output from scaffold config: true',
    '',
    '  return true;',
    '}',
    '',
  ].join('\n');
  assert.equal(source, expected);
});

// ──────────────────────────────────────────────────────────────
// TS test source output
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - TS test imports without .ts extension', () => {
  const { testSource } = scaffoldFunction(tsConfig);
  assert.ok(testSource.includes("import { validateEmail } from './validateEmail';"));
});

test('scaffoldFunction - TS test includes wiring assertion', () => {
  const { testSource } = scaffoldFunction(tsConfig);
  assert.ok(testSource.includes("assert.equal(validateEmail('dev@example.com'), true);"));
});

test('scaffoldFunction - TS test matches spec example exactly', () => {
  const { testSource } = scaffoldFunction(tsConfig);
  const expected = [
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { validateEmail } from './validateEmail';",
    '',
    "test('TODO: replace with real behavior tests', () => {",
    '  // This starter test confirms wiring only.',
    "  assert.equal(validateEmail('dev@example.com'), true);",
    '});',
    '',
    "test('TODO: add edge cases after implementation', () => {",
    '  // Example: invalid email cases should be asserted here.',
    '  assert.ok(true);',
    '});',
    '',
  ].join('\n');
  assert.equal(testSource, expected);
});

// ──────────────────────────────────────────────────────────────
// JS test source output
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - JS test imports with .js extension', () => {
  const { testSource } = scaffoldFunction(jsConfig);
  assert.ok(testSource.includes("import { validateEmail } from './validateEmail.js';"));
});

test('scaffoldFunction - JS test matches spec example exactly', () => {
  const { testSource } = scaffoldFunction(jsConfig);
  const expected = [
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { validateEmail } from './validateEmail.js';",
    '',
    "test('TODO: replace with real behavior tests', () => {",
    '  // This starter test confirms wiring only.',
    "  assert.equal(validateEmail('dev@example.com'), true);",
    '});',
    '',
    "test('TODO: add edge cases after implementation', () => {",
    '  // Example: invalid email cases should be asserted here.',
    '  assert.ok(true);',
    '});',
    '',
  ].join('\n');
  assert.equal(testSource, expected);
});

// ──────────────────────────────────────────────────────────────
// Multiple params
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - multiple params all appear in signature', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'createUser',
    paramDefs: [
      { name: 'name', tsType: 'string', example: 'Alice' },
      { name: 'age', tsType: 'number', example: 30 },
    ],
    outputType: 'User',
    exampleInput: { name: 'Alice', age: 30 },
    exampleOutput: { id: '1', name: 'Alice', age: 30 },
    language: 'ts',
  };

  const { source } = scaffoldFunction(config);
  assert.ok(source.includes('export function createUser(name: string, age: number): User {'));
});

// ──────────────────────────────────────────────────────────────
// Non-primitive return values
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - object exampleOutput serialized as return value', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'getUser',
    paramDefs: [{ name: 'id', tsType: 'string', example: '1' }],
    outputType: 'User',
    exampleInput: { id: '1' },
    exampleOutput: { id: '1', name: 'Alice' },
    language: 'ts',
  };

  const { source } = scaffoldFunction(config);
  assert.ok(source.includes("return { id: '1', name: 'Alice' };"));
});
