import test from 'node:test';
import assert from 'node:assert/strict';
import { coerce } from './coerce.js';

test('number input is returned as-is', () => {
  assert.equal(coerce(0), 0);
  assert.equal(coerce(-7), -7);
  assert.equal(coerce(3.14), 3.14);
});

test('numeric string is parsed to a number', () => {
  assert.equal(coerce('3.14'), 3.14);
  assert.equal(coerce('0'), 0);
  assert.equal(coerce('-7'), -7);
});

test('non-numeric string produces NaN', () => {
  assert.ok(Number.isNaN(coerce('abc')));
});

test('empty string produces NaN', () => {
  assert.ok(Number.isNaN(coerce('')));
});
