import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeIntervals } from './mergeIntervals.js';

test('merges overlapping and touching intervals after sorting by start', () => {
  const input = [
    { start: 8, end: 10 },
    { start: 1, end: 3 },
    { start: 2, end: 6 },
    { start: 10, end: 12 },
  ];
  assert.deepEqual(mergeIntervals(input), [
    { start: 1, end: 6 },
    { start: 8, end: 12 },
  ]);
});

test('keeps non-overlapping intervals separate', () => {
  assert.deepEqual(mergeIntervals([
    { start: 1, end: 2 },
    { start: 4, end: 5 },
    { start: 7, end: 9 },
  ]), [
    { start: 1, end: 2 },
    { start: 4, end: 5 },
    { start: 7, end: 9 },
  ]);
});

test('fully contained intervals collapse to the outer interval', () => {
  assert.deepEqual(mergeIntervals([
    { start: 1, end: 10 },
    { start: 2, end: 3 },
    { start: 4, end: 8 },
  ]), [{ start: 1, end: 10 }]);
});

test('returns empty array for empty input', () => {
  assert.deepEqual(mergeIntervals([]), []);
});

test('does not mutate the input array', () => {
  const input = [
    { start: 5, end: 6 },
    { start: 1, end: 2 },
  ];
  const snapshot = JSON.parse(JSON.stringify(input)) as Array<{ start: number; end: number }>;
  mergeIntervals(input);
  assert.deepEqual(input, snapshot);
});
