import test from 'node:test';
import assert from 'node:assert/strict';
import { safeUpperCase } from './safeUpperCase.js';

test('lowercase string is uppercased', () => {
  assert.equal(safeUpperCase('world'), 'WORLD');
});

test('already uppercase string is returned unchanged', () => {
  assert.equal(safeUpperCase('HELLO'), 'HELLO');
});

test('mixed case is fully uppercased', () => {
  assert.equal(safeUpperCase('HeLLo WoRLd'), 'HELLO WORLD');
});

test('empty string returns empty string', () => {
  assert.equal(safeUpperCase(''), '');
});

test('null returns empty string', () => {
  assert.equal(safeUpperCase(null), '');
});
