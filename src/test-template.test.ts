import test from 'node:test';
import assert from 'node:assert/strict';
import { testTemplateGenerator } from './test-template.js';
import type { ParamDef } from './types.js';

const emailParam: ParamDef = {
  name: 'email',
  tsType: 'string',
  example: 'dev@example.com',
  description: 'Email to validate',
};

const countParam: ParamDef = {
  name: 'count',
  tsType: 'number',
  example: 5,
};

test('testTemplateGenerator - TypeScript mode correct imports with .js extension', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    true,
    'ts',
  );

  assert.ok(result.includes("import test from 'node:test';"));
  assert.ok(result.includes("import assert from 'node:assert/strict';"));
  assert.ok(result.includes("import { validateEmail } from './validateEmail.js';"));
});

test('testTemplateGenerator - JavaScript mode import includes .js extension', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    true,
    'js',
  );

  assert.ok(result.includes("import { validateEmail } from './validateEmail.js';"));
});

test('testTemplateGenerator - wiring test uses param example as call arg', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    true,
    'ts',
  );

  assert.ok(result.includes('assert.deepEqual(validateEmail("dev@example.com"), true);'));
});

test('testTemplateGenerator - wiring test serializes non-string output', () => {
  const result = testTemplateGenerator(
    'square',
    [countParam],
    25,
    'ts',
  );

  assert.ok(result.includes('assert.deepEqual(square(5), 25);'));
});

test('testTemplateGenerator - edge-case test references first param name', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    true,
    'ts',
  );

  assert.ok(result.includes('// Example: invalid email cases should be asserted here.'));
});

test('testTemplateGenerator - edge-case test with multiple params uses first param name', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam, countParam],
    0,
    'ts',
  );

  assert.ok(result.includes('// Example: invalid email cases should be asserted here.'));
});

test('testTemplateGenerator - no params falls back to "input" in edge-case comment', () => {
  const result = testTemplateGenerator('fn', [], null, 'ts');
  assert.ok(result.includes('// Example: invalid input cases should be asserted here.'));
});

test('testTemplateGenerator - multiple params are all passed to call expression', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam, countParam],
    true,
    'ts',
  );

  assert.ok(result.includes('assert.deepEqual(fn("dev@example.com", 5), true);'));
});

test('testTemplateGenerator - defaults to TypeScript mode', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam],
    false,
  );

  assert.ok(result.includes("import { fn } from './fn.js';"));
  assert.ok(!result.includes("import { fn } from './fn'"));
});

test('testTemplateGenerator - output ends with trailing newline', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam],
    true,
    'ts',
  );

  assert.ok(result.endsWith('\n'));
});

test('testTemplateGenerator - object output uses deepEqual assertion', () => {
  const result = testTemplateGenerator(
    'getUser',
    [{ name: 'id', tsType: 'string', example: '1' }],
    { id: '1', name: 'Alice' },
    'ts',
  );

  assert.ok(result.includes('assert.deepEqual(getUser("1"), { "id": "1", "name": "Alice" });'));
});

test('testTemplateGenerator - returnPlaceholder uses function typeof assertion', () => {
  const result = testTemplateGenerator(
    'makeGreeter',
    [{ name: 'prefix', tsType: 'string', example: 'Hello' }],
    null,
    'ts',
    '(_name) => prefix',
  );

  assert.ok(result.includes('const result = makeGreeter("Hello");'));
  assert.ok(result.includes("assert.strictEqual(typeof result, 'function', 'makeGreeter should return a function');"));
  assert.ok(!result.includes('assert.deepEqual('));
});
