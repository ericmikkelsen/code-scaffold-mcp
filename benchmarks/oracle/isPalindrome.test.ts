import test from 'node:test';
import assert from 'node:assert/strict';
import { isPalindrome } from './isPalindrome.js';

test('empty string is a palindrome', () => {
  assert.equal(isPalindrome(''), true);
});

test('single character is a palindrome', () => {
  assert.equal(isPalindrome('a'), true);
});

test('simple palindromes', () => {
  assert.equal(isPalindrome('racecar'), true);
  assert.equal(isPalindrome('level'), true);
});

test('case-insensitive', () => {
  assert.equal(isPalindrome('RaceCar'), true);
  assert.equal(isPalindrome('Level'), true);
});

test('ignores non-alphanumeric characters', () => {
  assert.equal(isPalindrome('A man, a plan, a canal: Panama'), true);
  assert.equal(isPalindrome('No lemon, no melon!'), true);
});

test('non-palindromes return false', () => {
  assert.equal(isPalindrome('hello'), false);
  assert.equal(isPalindrome('typescript'), false);
});

test('digits are considered alphanumeric', () => {
  assert.equal(isPalindrome('12321'), true);
  assert.equal(isPalindrome('1a2b2a1'), true);
  assert.equal(isPalindrome('12345'), false);
});

test('whitespace-only string is a palindrome', () => {
  assert.equal(isPalindrome('   '), true);
});
