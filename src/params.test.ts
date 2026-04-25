import test from 'node:test';
import assert from 'node:assert/strict';
import { toJSParams } from './params.js';
import type { ParamDef } from './types.js';

const emailParam: ParamDef = {
  name: 'email',
  tsType: 'string',
  example: 'dev@example.com',
  description: 'Email to validate',
};

const countParam: ParamDef = {
  name: 'count',
  tsType: 'number',
  example: 42,
};

const configParam: ParamDef = {
  name: 'config',
  tsType: '{ id: string }',
  example: { id: 'abc' },
  description: 'Config object',
};

test('toJSParams - TypeScript mode produces typed parameters', () => {
  assert.equal(toJSParams([emailParam], 'ts'), 'email: string');
});

test('toJSParams - TypeScript mode with multiple params', () => {
  assert.equal(toJSParams([emailParam, countParam], 'ts'), 'email: string, count: number');
});

test('toJSParams - TypeScript mode with complex type', () => {
  assert.equal(toJSParams([configParam], 'ts'), 'config: { id: string }');
});

test('toJSParams - JavaScript mode produces param names only', () => {
  assert.equal(toJSParams([emailParam], 'js'), 'email');
});

test('toJSParams - JavaScript mode with multiple params', () => {
  assert.equal(toJSParams([emailParam, countParam], 'js'), 'email, count');
});

test('toJSParams - defaults to TypeScript mode', () => {
  assert.equal(toJSParams([emailParam]), 'email: string');
});

test('toJSParams - empty params returns empty string', () => {
  assert.equal(toJSParams([], 'ts'), '');
  assert.equal(toJSParams([], 'js'), '');
});
