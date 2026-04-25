import test from 'node:test';
import assert from 'node:assert/strict';
import { toJSDOC } from './jsdoc.js';
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
  example: 42,
};

const noDescParam: ParamDef = {
  name: 'value',
  tsType: 'boolean',
  example: true,
};

test('toJSDOC - TypeScript mode single param with description', () => {
  const result = toJSDOC([emailParam], 'boolean', 'ts');
  assert.equal(
    result,
    [
      '/**',
      ' * TODO: Describe the function purpose.',
      ' * @param email - Email to validate',
      ' * @returns Expected return type for this scaffold',
      ' */',
    ].join('\n'),
  );
});

test('toJSDOC - JavaScript mode single param with description', () => {
  const result = toJSDOC([emailParam], 'boolean', 'js');
  assert.equal(
    result,
    [
      '/**',
      ' * TODO: Describe the function purpose.',
      ' * @param {string} email - Email to validate',
      ' * @returns {boolean} Expected return type for this scaffold',
      ' */',
    ].join('\n'),
  );
});

test('toJSDOC - TypeScript mode multiple params', () => {
  const result = toJSDOC([emailParam, countParam], 'void', 'ts');
  assert.ok(result.includes(' * @param email - Email to validate'));
  assert.ok(result.includes(' * @param count - count'));
  assert.ok(result.includes(' * @returns Expected return type for this scaffold'));
});

test('toJSDOC - JavaScript mode multiple params', () => {
  const result = toJSDOC([emailParam, countParam], 'void', 'js');
  assert.ok(result.includes(' * @param {string} email - Email to validate'));
  assert.ok(result.includes(' * @param {number} count - count'));
  assert.ok(result.includes(' * @returns {void} Expected return type for this scaffold'));
});

test('toJSDOC - falls back to param name when description is absent (TS)', () => {
  const result = toJSDOC([noDescParam], 'string', 'ts');
  assert.ok(result.includes(' * @param value - value'));
});

test('toJSDOC - falls back to param name when description is absent (JS)', () => {
  const result = toJSDOC([noDescParam], 'string', 'js');
  assert.ok(result.includes(' * @param {boolean} value - value'));
});

test('toJSDOC - defaults to TypeScript mode', () => {
  const result = toJSDOC([emailParam], 'boolean');
  assert.ok(result.includes(' * @param email - Email to validate'));
  assert.ok(!result.includes('{string}'));
});

test('toJSDOC - empty params still produces header and returns tag', () => {
  const result = toJSDOC([], 'void', 'ts');
  assert.ok(result.startsWith('/**'));
  assert.ok(result.includes(' * TODO: Describe the function purpose.'));
  assert.ok(result.includes(' * @returns Expected return type for this scaffold'));
  assert.ok(result.endsWith(' */'));
});

test('toJSDOC - custom returnDescription overrides placeholder (TS)', () => {
  const result = toJSDOC([emailParam], 'boolean', 'ts', 'True if the email is valid');
  assert.ok(result.includes(' * @returns True if the email is valid'));
  assert.ok(!result.includes('Expected return type for this scaffold'));
});

test('toJSDOC - custom returnDescription overrides placeholder (JS)', () => {
  const result = toJSDOC([emailParam], 'boolean', 'js', 'True if the email is valid');
  assert.ok(result.includes(' * @returns {boolean} True if the email is valid'));
  assert.ok(!result.includes('Expected return type for this scaffold'));
});

test('toJSDOC - renders @example tags when name and examples are provided', () => {
  const result = toJSDOC([countParam], 'number', 'ts', undefined, 'double', [
    { args: [3], output: 6 },
    { args: [0], output: 0 },
  ]);
  assert.ok(result.includes(' * @example'));
  assert.ok(result.includes(' * // returns 6'));
  assert.ok(result.includes(' * double(3)'));
  assert.ok(result.includes(' * // returns 0'));
  assert.ok(result.includes(' * double(0)'));
  assert.ok(result.endsWith(' */'));
});

test('toJSDOC - no @example tags when examples array is empty', () => {
  const result = toJSDOC([countParam], 'number', 'ts', undefined, 'double', []);
  assert.ok(!result.includes('@example'));
});

test('toJSDOC - no @example tags when name is omitted', () => {
  const result = toJSDOC([countParam], 'number', 'ts', undefined, undefined, [{ args: [1], output: 2 }]);
  assert.ok(!result.includes('@example'));
});
