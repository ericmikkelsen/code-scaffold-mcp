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

test('testTemplateGenerator - TypeScript mode correct imports and no extension', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    { input: { email: 'dev@example.com' }, output: true },
    'ts',
  );

  assert.ok(result.includes("import test from 'node:test';"));
  assert.ok(result.includes("import assert from 'node:assert/strict';"));
  assert.ok(result.includes("import { validateEmail } from './validateEmail';"));
});

test('testTemplateGenerator - JavaScript mode import includes .js extension', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    { input: { email: 'dev@example.com' }, output: true },
    'js',
  );

  assert.ok(result.includes("import { validateEmail } from './validateEmail.js';"));
});

test('testTemplateGenerator - wiring test uses param example as call arg', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    { input: { email: 'dev@example.com' }, output: true },
    'ts',
  );

  assert.ok(result.includes("assert.equal(validateEmail('dev@example.com'), true);"));
});

test('testTemplateGenerator - wiring test serializes non-string output', () => {
  const result = testTemplateGenerator(
    'square',
    [countParam],
    { input: { count: 5 }, output: 25 },
    'ts',
  );

  assert.ok(result.includes('assert.equal(square(5), 25);'));
});

test('testTemplateGenerator - edge-case test references first param name', () => {
  const result = testTemplateGenerator(
    'validateEmail',
    [emailParam],
    { input: { email: 'dev@example.com' }, output: true },
    'ts',
  );

  assert.ok(result.includes('// Example: invalid email cases should be asserted here.'));
});

test('testTemplateGenerator - edge-case test with multiple params uses first param name', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam, countParam],
    { input: { email: 'a@b.com', count: 5 }, output: 0 },
    'ts',
  );

  assert.ok(result.includes('// Example: invalid email cases should be asserted here.'));
});

test('testTemplateGenerator - no params falls back to "input" in edge-case comment', () => {
  const result = testTemplateGenerator('fn', [], { input: {}, output: null }, 'ts');
  assert.ok(result.includes('// Example: invalid input cases should be asserted here.'));
});

test('testTemplateGenerator - multiple params are all passed to call expression', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam, countParam],
    { input: { email: 'a@b.com', count: 5 }, output: true },
    'ts',
  );

  assert.ok(result.includes("assert.equal(fn('dev@example.com', 5), true);"));
});

test('testTemplateGenerator - defaults to TypeScript mode', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam],
    { input: { email: 'a@b.com' }, output: false },
  );

  assert.ok(result.includes("import { fn } from './fn';"));
  assert.ok(!result.includes("import { fn } from './fn.js';"));
});

test('testTemplateGenerator - output ends with trailing newline', () => {
  const result = testTemplateGenerator(
    'fn',
    [emailParam],
    { input: { email: 'x' }, output: true },
    'ts',
  );

  assert.ok(result.endsWith('\n'));
});
