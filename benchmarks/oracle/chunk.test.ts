import test from 'node:test';
import assert from 'node:assert/strict';
import { chunk } from './chunk.js';

test('splits an evenly divisible array', () => {
  assert.deepEqual(chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
});

test('last chunk is shorter when not evenly divisible', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('chunk size larger than array yields a single chunk', () => {
  assert.deepEqual(chunk([1, 2], 5), [[1, 2]]);
});

test('empty array yields empty result', () => {
  assert.deepEqual(chunk([], 3), []);
});

test('chunk size of 1 yields singleton chunks', () => {
  assert.deepEqual(chunk(['a', 'b', 'c'], 1), [['a'], ['b'], ['c']]);
});

test('throws or returns empty on non-positive size', () => {
  // Either behavior is acceptable; we only require it doesn't loop forever
  // or return a malformed result.
  let result: unknown;
  let threw = false;
  try {
    result = chunk([1, 2, 3], 0);
  } catch {
    threw = true;
  }
  assert.ok(threw || (Array.isArray(result) && (result as unknown[]).length === 0));
});
