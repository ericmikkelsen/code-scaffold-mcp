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
  exampleOutput: true,
  examples: [
    { args: ['invalid'], output: false },
  ],
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
  assert.ok(source.includes(' * @example'));
  assert.ok(source.includes(' * // returns true'));
  assert.ok(source.includes(' * validateEmail("dev@example.com")'));
  assert.ok(source.includes(' * // returns false'));
  assert.ok(source.includes(' * validateEmail("invalid")'));
});

test('scaffoldFunction - TS source has typed function signature', () => {
  const { source } = scaffoldFunction(tsConfig);
  assert.ok(source.includes('export function validateEmail(email: string): boolean {'));
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
    ' * @example',
    ' * // returns true',
    ' * validateEmail("dev@example.com")',
    ' * @example',
    ' * // returns false',
    ' * validateEmail("invalid")',
    ' */',
    'export function validateEmail(email: string): boolean {',
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
  assert.ok(source.includes(' * @example'));
  assert.ok(source.includes(' * // returns true'));
  assert.ok(source.includes(' * validateEmail("dev@example.com")'));
  assert.ok(source.includes(' * // returns false'));
  assert.ok(source.includes(' * validateEmail("invalid")'));
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
    ' * @example',
    ' * // returns true',
    ' * validateEmail("dev@example.com")',
    ' * @example',
    ' * // returns false',
    ' * validateEmail("invalid")',
    ' */',
    'export function validateEmail(email) {',
    '  return true;',
    '}',
    '',
  ].join('\n');
  assert.equal(source, expected);
});

// ──────────────────────────────────────────────────────────────
// TS test source output
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - TS test imports with .js extension', () => {
  const { testSource } = scaffoldFunction(tsConfig);
  assert.ok(testSource.includes("import { validateEmail } from './validateEmail.js';"));
});

test('scaffoldFunction - TS test includes wiring assertion', () => {
  const { testSource } = scaffoldFunction(tsConfig);
  assert.ok(testSource.includes('assert.deepEqual(validateEmail("dev@example.com"), true);'));
});

test('scaffoldFunction - TS test matches spec example exactly', () => {
  const { testSource } = scaffoldFunction(tsConfig);
  const expected = [
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { validateEmail } from './validateEmail.js';",
    '',
    "test('TODO: replace with real behavior tests', () => {",
    '  // This starter test confirms wiring only.',
    '  assert.deepEqual(validateEmail("dev@example.com"), true);',
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
    '  assert.deepEqual(validateEmail("dev@example.com"), true);',
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
    exampleOutput: { id: '1', name: 'Alice' },
    language: 'ts',
  };

  const { source } = scaffoldFunction(config);
  assert.ok(source.includes('return { "id": "1", "name": "Alice" };'));
});

// ──────────────────────────────────────────────────────────────
// Object output — generated wiring test uses deepEqual
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - object exampleOutput generates deepEqual in wiring test', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'getUser',
    paramDefs: [{ name: 'id', tsType: 'string', example: '1' }],
    outputType: 'User',
    exampleOutput: { id: '1', name: 'Alice' },
    language: 'ts',
  };

  const { testSource } = scaffoldFunction(config);
  assert.ok(testSource.includes('assert.deepEqual(getUser("1"), { "id": "1", "name": "Alice" });'));
});

// ──────────────────────────────────────────────────────────────
// Name validation
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - throws on empty name', () => {
  assert.throws(
    () => scaffoldFunction({ name: '', paramDefs: [], outputType: 'void', exampleOutput: undefined, language: 'ts' }),
    /not a valid JavaScript identifier/,
  );
});

test('scaffoldFunction - throws on name starting with digit', () => {
  assert.throws(
    () => scaffoldFunction({ name: '1bad', paramDefs: [], outputType: 'void', exampleOutput: undefined, language: 'ts' }),
    /not a valid JavaScript identifier/,
  );
});

test('scaffoldFunction - throws on name with hyphens', () => {
  assert.throws(
    () => scaffoldFunction({ name: 'my-func', paramDefs: [], outputType: 'void', exampleOutput: undefined, language: 'ts' }),
    /not a valid JavaScript identifier/,
  );
});

test('scaffoldFunction - throws on reserved keyword as function name', () => {
  assert.throws(
    () => scaffoldFunction({ name: 'default', paramDefs: [], outputType: 'void', exampleOutput: undefined, language: 'ts' }),
    /reserved JavaScript keyword/,
  );
});

test('scaffoldFunction - throws on reserved keyword as function name (class)', () => {
  assert.throws(
    () => scaffoldFunction({ name: 'class', paramDefs: [], outputType: 'void', exampleOutput: undefined, language: 'ts' }),
    /reserved JavaScript keyword/,
  );
});

// ──────────────────────────────────────────────────────────────
// Param name validation
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - throws on param name starting with digit', () => {
  assert.throws(
    () => scaffoldFunction({
      name: 'myFunc',
      paramDefs: [{ name: '1bad', tsType: 'string', example: 'x' }],
      outputType: 'void',
      exampleOutput: undefined,
      language: 'ts',
    }),
    /not a valid JavaScript identifier/,
  );
});

test('scaffoldFunction - throws on param name with hyphens', () => {
  assert.throws(
    () => scaffoldFunction({
      name: 'myFunc',
      paramDefs: [{ name: 'my-param', tsType: 'string', example: 'x' }],
      outputType: 'void',
      exampleOutput: undefined,
      language: 'ts',
    }),
    /not a valid JavaScript identifier/,
  );
});

test('scaffoldFunction - throws on reserved keyword as param name', () => {
  assert.throws(
    () => scaffoldFunction({
      name: 'myFunc',
      paramDefs: [{ name: 'return', tsType: 'string', example: 'x' }],
      outputType: 'void',
      exampleOutput: undefined,
      language: 'ts',
    }),
    /reserved JavaScript keyword/,
  );
});

test('scaffoldFunction - throws on reserved keyword as param name (class)', () => {
  assert.throws(
    () => scaffoldFunction({
      name: 'myFunc',
      paramDefs: [{ name: 'class', tsType: 'string', example: 'x' }],
      outputType: 'void',
      exampleOutput: undefined,
      language: 'ts',
    }),
    /reserved JavaScript keyword/,
  );
});

// ──────────────────────────────────────────────────────────────
// Advanced types — union, arrow-function, nullable, generics
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - union tsType appears verbatim in TS signature', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'coerce',
    paramDefs: [{ name: 'value', tsType: 'string | number', example: '42', description: 'Value to coerce' }],
    outputType: 'number',
    exampleOutput: 42,
    language: 'ts',
  };
  const { source } = scaffoldFunction(config);
  assert.ok(source.includes('export function coerce(value: string | number): number {'));
});

test('scaffoldFunction - union tsType becomes JSDoc union in JS @param', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'coerce',
    paramDefs: [{ name: 'value', tsType: 'string | number', example: '42', description: 'Value to coerce' }],
    outputType: 'number',
    exampleOutput: 42,
    language: 'js',
  };
  const { source } = scaffoldFunction(config);
  assert.ok(source.includes(' * @param {(string|number)} value - Value to coerce'));
  assert.ok(source.includes('export function coerce(value) {'));
});

test('scaffoldFunction - arrow-function tsType becomes JSDoc function() in JS @param', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'applyAll',
    paramDefs: [
      { name: 'items', tsType: 'string[]', example: ['a'], description: 'Items' },
      { name: 'transform', tsType: '(item: string) => string', example: null, description: 'Transform fn' },
    ],
    outputType: 'string[]',
    exampleOutput: ['A'],
    language: 'js',
  };
  const { source } = scaffoldFunction(config);
  assert.ok(source.includes(' * @param {function(string): string} transform - Transform fn'));
  assert.ok(source.includes('export function applyAll(items, transform) {'));
});

test('scaffoldFunction - nullable union tsType becomes JSDoc union in JS @param', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'safeUpperCase',
    paramDefs: [{ name: 'value', tsType: 'string | null', example: 'hello', description: 'Input or null' }],
    outputType: 'string',
    exampleOutput: 'HELLO',
    language: 'js',
  };
  const { source } = scaffoldFunction(config);
  assert.ok(source.includes(' * @param {(string|null)} value - Input or null'));
});

test('scaffoldFunction - generic outputType appears verbatim in TS return suffix', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'fetchUser',
    paramDefs: [{ name: 'id', tsType: 'string', example: '1', description: 'User ID' }],
    outputType: 'Promise<string>',
    exampleOutput: 'alice',
    language: 'ts',
  };
  const { source } = scaffoldFunction(config);
  assert.ok(source.includes('export function fetchUser(id: string): Promise<string> {'));
});

test('scaffoldFunction - union outputType becomes JSDoc union in JS @returns', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'maybeFind',
    paramDefs: [{ name: 'key', tsType: 'string', example: 'foo', description: 'Key' }],
    outputType: 'string | null',
    returnDescription: 'The value or null if not found',
    exampleOutput: null,
    language: 'js',
  };
  const { source } = scaffoldFunction(config);
  assert.ok(source.includes(' * @returns {(string|null)} The value or null if not found'));
});

// ──────────────────────────────────────────────────────────────
// returnDescription
// ──────────────────────────────────────────────────────────────

test('scaffoldFunction - custom returnDescription appears in JSDoc', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'validateEmail',
    paramDefs: [{ name: 'email', tsType: 'string', example: 'a@b.com', description: 'Email' }],
    outputType: 'boolean',
    returnDescription: 'True if the email address is valid',
    exampleOutput: true,
    language: 'ts',
  };

  const { source } = scaffoldFunction(config);
  assert.ok(source.includes(' * @returns True if the email address is valid'));
});

test('scaffoldFunction - returnDescription works in JS mode', () => {
  const config: ScaffoldFunctionConfig = {
    name: 'validateEmail',
    paramDefs: [{ name: 'email', tsType: 'string', example: 'a@b.com', description: 'Email' }],
    outputType: 'boolean',
    returnDescription: 'True if the email address is valid',
    exampleOutput: true,
    language: 'js',
  };

  const { source } = scaffoldFunction(config);
  assert.ok(source.includes(' * @returns {boolean} True if the email address is valid'));
});
