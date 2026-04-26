import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQueryString } from './parseQueryString.js';

test('parses simple key-value pairs with leading question mark', () => {
  assert.deepEqual(parseQueryString('?page=1&sort=asc'), {
    page: '1',
    sort: 'asc',
  });
});

test('decodes percent-encoded keys and values', () => {
  assert.deepEqual(parseQueryString('city=New%20York&first%20name=Ada'), {
    city: 'New York',
    'first name': 'Ada',
  });
});

test('treats missing equals as empty string values', () => {
  assert.deepEqual(parseQueryString('flag&name=eric'), {
    flag: '',
    name: 'eric',
  });
});

test('keeps the last value for repeated keys', () => {
  assert.deepEqual(parseQueryString('a=1&a=2&a=3'), {
    a: '3',
  });
});

test('ignores empty segments and handles empty input', () => {
  assert.deepEqual(parseQueryString('&&a=1&&b=2&'), {
    a: '1',
    b: '2',
  });
  assert.deepEqual(parseQueryString(''), {});
  assert.deepEqual(parseQueryString('?'), {});
});
