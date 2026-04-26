import test from 'node:test';
import assert from 'node:assert/strict';
import { tsTypeToJSDoc } from './type-converter.js';

// ──────────────────────────────────────────────────────────────
// Primitives — pass through unchanged
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - string passes through', () => {
  assert.equal(tsTypeToJSDoc('string'), 'string');
});

test('tsTypeToJSDoc - number passes through', () => {
  assert.equal(tsTypeToJSDoc('number'), 'number');
});

test('tsTypeToJSDoc - boolean passes through', () => {
  assert.equal(tsTypeToJSDoc('boolean'), 'boolean');
});

test('tsTypeToJSDoc - void passes through', () => {
  assert.equal(tsTypeToJSDoc('void'), 'void');
});

test('tsTypeToJSDoc - null passes through', () => {
  assert.equal(tsTypeToJSDoc('null'), 'null');
});

test('tsTypeToJSDoc - undefined passes through', () => {
  assert.equal(tsTypeToJSDoc('undefined'), 'undefined');
});

test('tsTypeToJSDoc - any passes through', () => {
  assert.equal(tsTypeToJSDoc('any'), 'any');
});

test('tsTypeToJSDoc - unknown passes through', () => {
  assert.equal(tsTypeToJSDoc('unknown'), 'unknown');
});

test('tsTypeToJSDoc - never passes through', () => {
  assert.equal(tsTypeToJSDoc('never'), 'never');
});

// ──────────────────────────────────────────────────────────────
// Object literals and array shorthand — pass through
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - plain object type passes through', () => {
  assert.equal(tsTypeToJSDoc('{ id: string }'), '{ id: string }');
});

test('tsTypeToJSDoc - array shorthand passes through', () => {
  assert.equal(tsTypeToJSDoc('string[]'), 'string[]');
});

// ──────────────────────────────────────────────────────────────
// Generic types — pass through (modern JSDoc accepts <> notation)
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - Array<string> passes through', () => {
  assert.equal(tsTypeToJSDoc('Array<string>'), 'Array<string>');
});

test('tsTypeToJSDoc - Promise<string> passes through', () => {
  assert.equal(tsTypeToJSDoc('Promise<string>'), 'Promise<string>');
});

test('tsTypeToJSDoc - Map<string, number> passes through', () => {
  assert.equal(tsTypeToJSDoc('Map<string, number>'), 'Map<string, number>');
});

test('tsTypeToJSDoc - nested generic passes through', () => {
  assert.equal(tsTypeToJSDoc('Promise<Array<string>>'), 'Promise<Array<string>>');
});

// ──────────────────────────────────────────────────────────────
// Union types — wrapped in parens, spaces removed
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - two-branch union wraps in parens', () => {
  assert.equal(tsTypeToJSDoc('string | number'), '(string|number)');
});

test('tsTypeToJSDoc - three-branch union', () => {
  assert.equal(tsTypeToJSDoc('string | number | boolean'), '(string|number|boolean)');
});

test('tsTypeToJSDoc - nullable type (T | null)', () => {
  assert.equal(tsTypeToJSDoc('string | null'), '(string|null)');
});

test('tsTypeToJSDoc - optional type (T | undefined)', () => {
  assert.equal(tsTypeToJSDoc('string | undefined'), '(string|undefined)');
});

test('tsTypeToJSDoc - union without spaces', () => {
  assert.equal(tsTypeToJSDoc('string|number'), '(string|number)');
});

test('tsTypeToJSDoc - union with generic branch does not split inner |', () => {
  // Array<string | number> has | inside <>, should not be treated as top-level union
  assert.equal(tsTypeToJSDoc('Array<string | number>'), 'Array<string | number>');
});

// ──────────────────────────────────────────────────────────────
// Tuple types — converted to Array
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - simple tuple becomes Array', () => {
  assert.equal(tsTypeToJSDoc('[string, number]'), 'Array');
});

test('tsTypeToJSDoc - three-element tuple becomes Array', () => {
  assert.equal(tsTypeToJSDoc('[string, number, boolean]'), 'Array');
});

// ──────────────────────────────────────────────────────────────
// Function types — converted to JSDoc function() syntax
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - zero-param arrow function type', () => {
  assert.equal(tsTypeToJSDoc('() => void'), 'function(): void');
});

test('tsTypeToJSDoc - one-param arrow function type', () => {
  assert.equal(tsTypeToJSDoc('(x: string) => boolean'), 'function(string): boolean');
});

test('tsTypeToJSDoc - two-param arrow function type', () => {
  assert.equal(tsTypeToJSDoc('(x: string, y: number) => void'), 'function(string, number): void');
});

test('tsTypeToJSDoc - arrow function with complex return type', () => {
  assert.equal(tsTypeToJSDoc('(id: string) => Promise<string>'), 'function(string): Promise<string>');
});

test('tsTypeToJSDoc - arrow function param type is also converted', () => {
  assert.equal(tsTypeToJSDoc('(val: string | number) => boolean'), 'function((string|number)): boolean');
});

// ──────────────────────────────────────────────────────────────
// Mapped types — converted to Object
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - mapped type with keyof becomes Object', () => {
  assert.equal(tsTypeToJSDoc('{ [K in keyof T]: T[K] }'), 'Object');
});

test('tsTypeToJSDoc - mapped type with in becomes Object', () => {
  assert.equal(tsTypeToJSDoc('{ [K in string]: number }'), 'Object');
});

// ──────────────────────────────────────────────────────────────
// Conditional types — converted to *
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - conditional type becomes *', () => {
  assert.equal(tsTypeToJSDoc('T extends string ? A : B'), '*');
});

test('tsTypeToJSDoc - conditional type with complex branches becomes *', () => {
  assert.equal(tsTypeToJSDoc('T extends Array<string> ? string[] : never'), '*');
});

// ──────────────────────────────────────────────────────────────
// Whitespace handling
// ──────────────────────────────────────────────────────────────

test('tsTypeToJSDoc - leading/trailing whitespace is trimmed', () => {
  assert.equal(tsTypeToJSDoc('  string  '), 'string');
});

test('tsTypeToJSDoc - union with extra whitespace normalises', () => {
  assert.equal(tsTypeToJSDoc('  string  |  number  '), '(string|number)');
});
