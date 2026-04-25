import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp } from './clamp.js';

test('value inside range is returned unchanged', () => {
  assert.equal(clamp(5, 0, 10), 5);
});

test('value below min is clamped to min', () => {
  assert.equal(clamp(-3, 0, 10), 0);
});

test('value above max is clamped to max', () => {
  assert.equal(clamp(99, 0, 10), 10);
});

test('value equal to bounds is returned unchanged', () => {
  assert.equal(clamp(0, 0, 10), 0);
  assert.equal(clamp(10, 0, 10), 10);
});

test('works with negative ranges', () => {
  assert.equal(clamp(-5, -10, -1), -5);
  assert.equal(clamp(-100, -10, -1), -10);
  assert.equal(clamp(0, -10, -1), -1);
});

test('works with floating point numbers', () => {
  assert.equal(clamp(1.5, 0, 2), 1.5);
  assert.equal(clamp(2.5, 0, 2), 2);
});
