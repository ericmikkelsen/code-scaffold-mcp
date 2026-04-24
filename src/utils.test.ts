import test from 'node:test';
import assert from 'node:assert/strict';
import { toSourceLiteral } from './utils.js';

test('toSourceLiteral - string value is single-quoted', () => {
  assert.equal(toSourceLiteral('hello'), "'hello'");
});

test('toSourceLiteral - number value', () => {
  assert.equal(toSourceLiteral(42), '42');
});

test('toSourceLiteral - boolean true', () => {
  assert.equal(toSourceLiteral(true), 'true');
});

test('toSourceLiteral - boolean false', () => {
  assert.equal(toSourceLiteral(false), 'false');
});

test('toSourceLiteral - null', () => {
  assert.equal(toSourceLiteral(null), 'null');
});

test('toSourceLiteral - undefined', () => {
  assert.equal(toSourceLiteral(undefined), 'undefined');
});

test('toSourceLiteral - plain object', () => {
  assert.equal(toSourceLiteral({ id: '1', name: 'Alice' }), "{ id: '1', name: 'Alice' }");
});

test('toSourceLiteral - array', () => {
  assert.equal(toSourceLiteral([1, 2, 3]), '[ 1, 2, 3 ]');
});

test('toSourceLiteral - empty object', () => {
  assert.equal(toSourceLiteral({}), '{}');
});

test('toSourceLiteral - nested object', () => {
  assert.equal(toSourceLiteral({ a: { b: 1 } }), '{ a: { b: 1 } }');
});
