import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFlexibleNumber,
  numbersEqual,
  parsePairInput,
} from '../src/utils/equationValidation.ts';

test('parseFlexibleNumber: inteiros e espaços', () => {
  assert.equal(parseFlexibleNumber('5'), 5);
  assert.equal(parseFlexibleNumber('  7 '), 7);
  assert.equal(parseFlexibleNumber('-3'), -3);
});

test('parseFlexibleNumber: fração', () => {
  assert.equal(parseFlexibleNumber('23/5'), 23 / 5);
  assert.equal(parseFlexibleNumber('10 / 4'), 2.5);
  assert.equal(parseFlexibleNumber('5/0'), null, 'divisão por zero é inválida');
});

test('parseFlexibleNumber: vírgula decimal', () => {
  assert.equal(parseFlexibleNumber('4,5'), 4.5);
  assert.equal(parseFlexibleNumber('0,25'), 0.25);
});

test('parseFlexibleNumber: entradas inválidas', () => {
  assert.equal(parseFlexibleNumber('foo'), null);
  assert.equal(parseFlexibleNumber(''), null);
  assert.equal(parseFlexibleNumber('  '), null);
  // @ts-expect-error valida guarda de tipo em runtime
  assert.equal(parseFlexibleNumber(null), null);
});

test('numbersEqual: tolerância', () => {
  assert.equal(numbersEqual(1.00001, 1.0, 1e-6), false);
  assert.equal(numbersEqual(1.000000001, 1.0, 1e-6), true);
  assert.equal(numbersEqual(5 / 13, 0.3846153846, 1e-2), true);
  assert.equal(numbersEqual(10, 10), true);
});

test('parsePairInput', () => {
  assert.deepEqual(parsePairInput('4', '3'), { x: 4, y: 3 });
  assert.deepEqual(parsePairInput('1/2', '0,5'), { x: 0.5, y: 0.5 });
  assert.equal(parsePairInput('x', '3'), null);
  assert.equal(parsePairInput('3', ''), null);
});
