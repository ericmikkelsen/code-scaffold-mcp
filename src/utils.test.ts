import test from 'node:test';
import assert from 'node:assert/strict';
import { toSourceLiteral, extractTypeParams } from './utils.js';

// ──────────────────────────────────────────────────────────────
// toSourceLiteral
// ──────────────────────────────────────────────────────────────

test('toSourceLiteral - string value is double-quoted', () => {
  assert.equal(toSourceLiteral('hello'), '"hello"');
});

test('toSourceLiteral - number value', () => {
  assert.equal(toSourceLiteral(42), '42');
});

test('toSourceLiteral - boolean true', () => {
  assert.equal(toSourceLiteral(true), 'true');
});

test('toSourceLiteral - boolean false', () => {
  assert.equal(toSourceLiteral(false), 'false');
});

test('toSourceLiteral - null', () => {
  assert.equal(toSourceLiteral(null), 'null');
});

test('toSourceLiteral - undefined', () => {
  assert.equal(toSourceLiteral(undefined), 'undefined');
});

test('toSourceLiteral - plain object', () => {
  assert.equal(toSourceLiteral({ id: '1', name: 'Alice' }), '{ "id": "1", "name": "Alice" }');
});

test('toSourceLiteral - array', () => {
  assert.equal(toSourceLiteral([1, 2, 3]), '[1, 2, 3]');
});

test('toSourceLiteral - empty object', () => {
  assert.equal(toSourceLiteral({}), '{}');
});

test('toSourceLiteral - nested object', () => {
  assert.equal(toSourceLiteral({ a: { b: 1 } }), '{ "a": { "b": 1 } }');
});

test('toSourceLiteral - string with special characters is correctly escaped', () => {
  assert.equal(toSourceLiteral('say "hi"'), '"say \\"hi\\""');
});

test('toSourceLiteral - throws on Infinity', () => {
  assert.throws(() => toSourceLiteral(Infinity), TypeError);
});

test('toSourceLiteral - throws on NaN', () => {
  assert.throws(() => toSourceLiteral(NaN), TypeError);
});

test('toSourceLiteral - throws on function', () => {
  assert.throws(() => toSourceLiteral(() => {}), TypeError);
});

test('toSourceLiteral - throws on symbol', () => {
  assert.throws(() => toSourceLiteral(Symbol('x')), TypeError);
});

test('toSourceLiteral - throws on Map', () => {
  assert.throws(() => toSourceLiteral(new Map()), TypeError);
});

test('toSourceLiteral - throws on Date', () => {
  assert.throws(() => toSourceLiteral(new Date()), TypeError);
});

test('toSourceLiteral - throws on circular reference', () => {
  const obj: Record<string, unknown> = {};
  obj['self'] = obj;
  assert.throws(() => toSourceLiteral(obj), TypeError);
});

// ──────────────────────────────────────────────────────────────
// extractTypeParams
// ──────────────────────────────────────────────────────────────

test('extractTypeParams - returns empty array when no uppercase letters found', () => {
  assert.deepEqual(extractTypeParams(['string', 'number', 'boolean']), []);
});

test('extractTypeParams - detects T from T[]', () => {
  assert.deepEqual(extractTypeParams(['T[]']), ['T']);
});

test('extractTypeParams - detects T from T[][]', () => {
  assert.deepEqual(extractTypeParams(['T[][]']), ['T']);
});

test('extractTypeParams - detects T from Array<T>', () => {
  assert.deepEqual(extractTypeParams(['Array<T>']), ['T']);
});

test('extractTypeParams - detects multiple params K and V from Map<K, V>', () => {
  assert.deepEqual(extractTypeParams(['Map<K, V>']), ['K', 'V']);
});

test('extractTypeParams - deduplicates across multiple type strings', () => {
  assert.deepEqual(extractTypeParams(['T[]', 'number', 'T[][]']), ['T']);
});

test('extractTypeParams - preserves order of first appearance across strings', () => {
  assert.deepEqual(extractTypeParams(['T[]', 'K', 'V']), ['T', 'K', 'V']);
});

test('extractTypeParams - does not match multi-letter identifiers like Array', () => {
  assert.deepEqual(extractTypeParams(['Array<string>']), []);
});

test('extractTypeParams - does not match multi-letter identifiers like Record', () => {
  assert.deepEqual(extractTypeParams(['Record<string, string>']), []);
});

test('extractTypeParams - handles empty array input', () => {
  assert.deepEqual(extractTypeParams([]), []);
});
