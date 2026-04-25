import test from 'node:test';
import assert from 'node:assert/strict';
import { wordCount } from './wordCount.js';

test('empty string returns 0', () => {
  assert.equal(wordCount(''), 0);
});

test('whitespace-only string returns 0', () => {
  assert.equal(wordCount('   '), 0);
  assert.equal(wordCount('\t\n  '), 0);
});

test('single word returns 1', () => {
  assert.equal(wordCount('hello'), 1);
});

test('counts simple space-separated words', () => {
  assert.equal(wordCount('hello world'), 2);
  assert.equal(wordCount('one two three four'), 4);
});

test('collapses runs of internal whitespace', () => {
  assert.equal(wordCount('hello   world'), 2);
  assert.equal(wordCount('a\t\tb\nc'), 3);
});

test('ignores leading and trailing whitespace', () => {
  assert.equal(wordCount('  hello world  '), 2);
  assert.equal(wordCount('\n  one  \t'), 1);
});

test('punctuation attached to a word is part of that word', () => {
  assert.equal(wordCount('hello, world!'), 2);
});
