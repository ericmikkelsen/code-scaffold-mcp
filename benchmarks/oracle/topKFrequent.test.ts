import test from 'node:test';
import assert from 'node:assert/strict';
import { topKFrequent } from './topKFrequent.js';

test('returns top-k words by frequency', () => {
  assert.deepEqual(
    topKFrequent(['i', 'love', 'leetcode', 'i', 'love', 'coding'], 2),
    ['i', 'love'],
  );
});

test('breaks ties lexicographically ascending', () => {
  assert.deepEqual(topKFrequent(['b', 'a', 'c', 'b', 'a', 'c'], 3), ['a', 'b', 'c']);
});

test('returns empty when k is zero or negative', () => {
  assert.deepEqual(topKFrequent(['a', 'a', 'b'], 0), []);
  assert.deepEqual(topKFrequent(['a', 'a', 'b'], -1), []);
});

test('returns all ranked unique words when k exceeds unique count', () => {
  assert.deepEqual(topKFrequent(['z', 'z', 'a'], 10), ['z', 'a']);
});

test('handles empty input', () => {
  assert.deepEqual(topKFrequent([], 3), []);
});
