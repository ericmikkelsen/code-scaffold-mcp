import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAll } from './applyAll.js';

test('applies transform to every item', () => {
  assert.deepEqual(
    applyAll(['a', 'b', 'c'], (s) => s.toUpperCase()),
    ['A', 'B', 'C'],
  );
});

test('returns empty array for empty input', () => {
  assert.deepEqual(applyAll([], (s) => s.toUpperCase()), []);
});

test('transform is applied in order', () => {
  assert.deepEqual(
    applyAll(['hello', 'world'], (s) => s + '!'),
    ['hello!', 'world!'],
  );
});

test('does not mutate the input array', () => {
  const input = ['x', 'y'];
  applyAll(input, (s) => s.toUpperCase());
  assert.deepEqual(input, ['x', 'y']);
});

test('each item is transformed independently', () => {
  const calls: string[] = [];
  applyAll(['a', 'b', 'c'], (s) => { calls.push(s); return s; });
  assert.deepEqual(calls, ['a', 'b', 'c']);
});
