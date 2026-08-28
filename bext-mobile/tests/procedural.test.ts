import test from 'node:test';
import assert from 'node:assert/strict';
import {
  randInt,
  pick,
  makeTriangleArea,
  makeTriangulation,
  makeApothem,
  makeLinear,
  makeSystem,
  makePythagorasCase,
  makePythagorasCases,
  makeCube,
  makePrism,
  makeSurface,
} from '../src/missions/procedural.ts';

test('randInt fica dentro do intervalo (inclusive)', () => {
  for (let i = 0; i < 5000; i++) {
    const value = randInt(3, 7);
    assert.ok(Number.isInteger(value) && value >= 3 && value <= 7);
  }
  assert.equal(randInt(4, 4), 4);
});

test('pick devolve um elemento do array', () => {
  const options = ['a', 'b', 'c'] as const;
  for (let i = 0; i < 200; i++) {
    assert.ok(options.includes(pick(options)));
  }
});

const ITER = 5000;

test('makeTriangleArea: resposta inteira e coerente', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makeTriangleArea();
    assert.ok(Number.isInteger(q.area));
    assert.equal(q.area, (q.base * q.height) / 2);
    assert.ok(q.base > 0 && q.height > 0);
  }
});

test('makeTriangulation: total = soma das partes', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makeTriangulation();
    assert.equal(q.parts.length, 3);
    assert.equal(q.total, q.parts.reduce((sum, part) => sum + part, 0));
    assert.ok(Number.isInteger(q.total));
  }
});

test('makeApothem: A = (P × a) / 2, inteira', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makeApothem();
    assert.equal(q.area, (q.perimeter * q.apothem) / 2);
    assert.ok(Number.isInteger(q.area));
  }
});

test('makeLinear: a·x + b = c com x inteiro', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makeLinear();
    assert.ok(Number.isInteger(q.x));
    assert.equal(q.a * q.x + q.b, q.c);
    assert.match(q.equation, /^\d+x \+ \d+ = \d+$/);
  }
});

test('makeSystem: solução inteira, x > y, equações batem', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makeSystem();
    assert.ok(Number.isInteger(q.x) && Number.isInteger(q.y));
    assert.ok(q.x > q.y, 'x > y para a diferença ser positiva');
    assert.equal(q.sumEquation, `2x + 2y = ${2 * (q.x + q.y)}`);
    assert.equal(q.diffEquation, `x - y = ${q.x - q.y}`);
  }
});

test('makePythagorasCase: expected inteiro e positivo, prompt não-vazio', () => {
  for (let i = 0; i < ITER; i++) {
    const c = makePythagorasCase();
    assert.ok(Number.isInteger(c.expected) && c.expected > 0);
    assert.ok(c.prompt.length > 0);
  }
  assert.equal(makePythagorasCases(4).length, 4);
});

test('makeCube: V = a³', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makeCube();
    assert.equal(q.volume, q.edge ** 3);
  }
});

test('makePrism: V = c × l × h', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makePrism();
    assert.equal(q.volume, q.length * q.width * q.height);
  }
});

test('makeSurface: A = 2(ab + ac + bc)', () => {
  for (let i = 0; i < ITER; i++) {
    const q = makeSurface();
    assert.equal(q.area, 2 * (q.a * q.b + q.a * q.c + q.b * q.c));
    assert.ok(Number.isInteger(q.area));
  }
});
