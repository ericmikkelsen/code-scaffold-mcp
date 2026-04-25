import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slugify.js';

test('lowercases and hyphenates a simple title', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('collapses multiple spaces into a single hyphen', () => {
  assert.equal(slugify('  many   spaces  here  '), 'many-spaces-here');
});

test('strips punctuation', () => {
  assert.equal(slugify('Hello, World!'), 'hello-world');
});

test('handles already-slug input', () => {
  assert.equal(slugify('already-a-slug'), 'already-a-slug');
});

test('returns empty string for empty input', () => {
  assert.equal(slugify(''), '');
});

test('strips leading and trailing hyphens', () => {
  assert.equal(slugify('---weird---title---'), 'weird-title');
});
