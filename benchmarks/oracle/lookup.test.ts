import test from 'node:test';
import assert from 'node:assert/strict';
import { lookup } from './lookup.js';

test('returns value when key exists', () => {
  assert.equal(lookup({ a: '1', b: '2' }, 'b'), '2');
});

test('returns null when key is absent', () => {
  assert.equal(lookup({ a: '1' }, 'missing'), null);
});

test('returns null for empty record', () => {
  assert.equal(lookup({}, 'any'), null);
});

test('keys are case-sensitive', () => {
  assert.equal(lookup({ Key: 'val' }, 'key'), null);
  assert.equal(lookup({ Key: 'val' }, 'Key'), 'val');
});

test('returns empty string value when key maps to empty string', () => {
  assert.equal(lookup({ a: '' }, 'a'), '');
});
