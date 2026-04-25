import test from 'node:test';
import assert from 'node:assert/strict';
import { flatten } from './flatten.js';

test('empty outer array yields empty array', () => {
  assert.deepEqual(flatten([]), []);
});

test('empty inner arrays are skipped', () => {
  assert.deepEqual(flatten([[], [], []]), []);
});

test('concatenates simple number arrays in order', () => {
  assert.deepEqual(flatten([[1, 2], [3, 4]]), [1, 2, 3, 4]);
  assert.deepEqual(flatten([[1], [2], [3]]), [1, 2, 3]);
});

test('preserves order across mixed-size sub-arrays', () => {
  assert.deepEqual(flatten([[1, 2, 3], [], [4], [5, 6]]), [1, 2, 3, 4, 5, 6]);
});

test('works with strings', () => {
  assert.deepEqual(flatten([['a', 'b'], ['c']]), ['a', 'b', 'c']);
});

test('only flattens one level — nested arrays remain nested', () => {
  assert.deepEqual(
    flatten([[[1, 2]], [[3, 4]]]),
    [[1, 2], [3, 4]],
  );
});

test('returns a new array, not the input', () => {
  const input = [[1], [2]];
  const out = flatten(input);
  assert.notEqual(out, input);
  assert.notEqual(out, input[0]);
});
