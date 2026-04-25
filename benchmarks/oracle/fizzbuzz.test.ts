import test from 'node:test';
import assert from 'node:assert/strict';
import { fizzbuzz } from './fizzbuzz.js';

test('returns an empty array for n=0', () => {
  assert.deepEqual(fizzbuzz(0), []);
});

test('handles the first 15 entries correctly', () => {
  assert.deepEqual(fizzbuzz(15), [
    '1', '2', 'Fizz', '4', 'Buzz',
    'Fizz', '7', '8', 'Fizz', 'Buzz',
    '11', 'Fizz', '13', '14', 'FizzBuzz',
  ]);
});

test('returns strings only', () => {
  for (const entry of fizzbuzz(30)) {
    assert.equal(typeof entry, 'string');
  }
});

test('length always equals n', () => {
  assert.equal(fizzbuzz(1).length, 1);
  assert.equal(fizzbuzz(7).length, 7);
  assert.equal(fizzbuzz(100).length, 100);
});

test('multiples of 15 are FizzBuzz', () => {
  const out = fizzbuzz(45);
  assert.equal(out[14], 'FizzBuzz');
  assert.equal(out[29], 'FizzBuzz');
  assert.equal(out[44], 'FizzBuzz');
});
