import test from 'node:test';
import assert from 'node:assert/strict';
import { unique } from './unique.js';

test('empty array returns empty array', () => {
  assert.deepEqual(unique([]), []);
});

test('already-unique array is returned unchanged in order', () => {
  assert.deepEqual(unique([1, 2, 3]), [1, 2, 3]);
});

test('removes duplicate numbers, preserving first-seen order', () => {
  assert.deepEqual(unique([1, 2, 2, 3, 1]), [1, 2, 3]);
  assert.deepEqual(unique([3, 1, 2, 1, 3, 2]), [3, 1, 2]);
});

test('works with strings', () => {
  assert.deepEqual(unique(['a', 'b', 'a', 'c', 'b']), ['a', 'b', 'c']);
});

test('NaN is treated as a single value (SameValueZero)', () => {
  const out = unique([NaN, 1, NaN, 2, NaN]);
  assert.equal(out.length, 3);
  assert.ok(Number.isNaN(out[0]));
  assert.equal(out[1], 1);
  assert.equal(out[2], 2);
});

test('treats object identity, not deep equality', () => {
  const a = { x: 1 };
  const b = { x: 1 };
  assert.deepEqual(unique([a, a, b]), [a, b]);
});

test('returns a new array, not the input', () => {
  const input = [1, 2, 3];
  const out = unique(input);
  assert.notEqual(out, input);
});
