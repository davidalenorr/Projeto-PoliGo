import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeExternalAngleQuizQuestions,
  makeSymmetryAxesQuizQuestions,
  makePythagorasQuizQuestions,
  makeAngleSumQuizQuestions,
  makePerimeterQuizQuestions,
  makePerimeterGuardianQuizQuestions,
  makeApothemaSecretQuizQuestions,
  makeSupremeEngineerQuizQuestions,
  makeTriangleBalanceQuizQuestions,
  makeShapeAreaCase,
  makeShapeAreaCases,
  type GeneratedQuizQuestion,
} from '../src/missions/procedural.ts';

const ITER = 2000;

function assertQuizShape(q: GeneratedQuizQuestion, ctx: string) {
  assert.ok(q.id.trim().length > 0, `${ctx}: id vazio`);
  assert.ok(q.prompt.trim().length > 0, `${ctx}: enunciado vazio`);
  assert.ok(q.explanation.trim().length > 0, `${ctx}: sem explicação`);
  assert.ok(Array.isArray(q.options) && q.options.length >= 3, `${ctx}: menos de 3 opções`);
  assert.equal(new Set(q.options).size, q.options.length, `${ctx}: opções repetidas (${q.options.join(' | ')})`);
  assert.ok(q.options.includes(q.answer), `${ctx}: resposta "${q.answer}" não está nas opções`);
}

function assertGeneratorBasics(name: string, gen: () => GeneratedQuizQuestion[], expectedCount = 3) {
  for (let i = 0; i < ITER; i++) {
    const qs = gen();
    assert.equal(qs.length, expectedCount, `${name}: contagem de questões`);
    assert.equal(new Set(qs.map((q) => q.id)).size, qs.length, `${name}: ids repetidos`);
    qs.forEach((q, idx) => assertQuizShape(q, `${name}[${idx}]`));
  }
}

test('todos os geradores de quiz respeitam o formato de questão', () => {
  assertGeneratorBasics('makeExternalAngleQuizQuestions', makeExternalAngleQuizQuestions);
  assertGeneratorBasics('makeSymmetryAxesQuizQuestions', makeSymmetryAxesQuizQuestions);
  assertGeneratorBasics('makePythagorasQuizQuestions', makePythagorasQuizQuestions);
  assertGeneratorBasics('makeAngleSumQuizQuestions', makeAngleSumQuizQuestions);
  assertGeneratorBasics('makePerimeterQuizQuestions', makePerimeterQuizQuestions);
  assertGeneratorBasics('makePerimeterGuardianQuizQuestions', makePerimeterGuardianQuizQuestions);
  assertGeneratorBasics('makeApothemaSecretQuizQuestions', makeApothemaSecretQuizQuestions);
  assertGeneratorBasics('makeSupremeEngineerQuizQuestions', makeSupremeEngineerQuizQuestions);
  assertGeneratorBasics('makeTriangleBalanceQuizQuestions', makeTriangleBalanceQuizQuestions);
});

test('makeExternalAngleQuizQuestions: resposta = 360°/n', () => {
  for (let i = 0; i < ITER; i++) {
    for (const q of makeExternalAngleQuizQuestions()) {
      const n = Number(q.prompt.match(/de (\d+) lados/)![1]);
      assert.equal(q.answer, `${360 / n}°`);
      assert.ok(Number.isInteger(360 / n), `360/${n} deveria ser inteiro`);
    }
  }
});

test('makeSymmetryAxesQuizQuestions: resposta = n', () => {
  for (let i = 0; i < ITER; i++) {
    for (const q of makeSymmetryAxesQuizQuestions()) {
      const n = Number(q.prompt.match(/n = (\d+)/)![1]);
      assert.equal(q.answer, `${n}`);
    }
  }
});

test('makePythagorasQuizQuestions: a resposta satisfaz o teorema', () => {
  for (let i = 0; i < ITER; i++) {
    for (const q of makePythagorasQuizQuestions()) {
      const catetos = q.prompt.match(/catetos medem (\d+) e (\d+)/);
      const outro = q.prompt.match(/cateto mede (\d+) e a hipotenusa (\d+)/);
      if (catetos) {
        const [a, b] = [Number(catetos[1]), Number(catetos[2])];
        assert.equal(q.answer, `${Math.sqrt(a * a + b * b)}`);
      } else {
        assert.ok(outro, `formato inesperado: ${q.prompt}`);
        const [b, c] = [Number(outro![1]), Number(outro![2])];
        assert.equal(q.answer, `${Math.sqrt(c * c - b * b)}`);
      }
      assert.ok(Number.isInteger(Number(q.answer)), `resposta não inteira: ${q.answer}`);
    }
  }
});

test('makeAngleSumQuizQuestions: x = 180 − a − b, positivo', () => {
  for (let i = 0; i < ITER; i++) {
    for (const q of makeAngleSumQuizQuestions()) {
      const m = q.prompt.match(/medem x, (\d+)° e (\d+)°/)!;
      const x = 180 - Number(m[1]) - Number(m[2]);
      assert.equal(q.answer, `${x}°`);
      assert.ok(x > 0, `x deveria ser positivo (${x})`);
    }
  }
});

test('makePerimeterQuizQuestions: resposta = soma dos lados', () => {
  for (let i = 0; i < ITER; i++) {
    for (const q of makePerimeterQuizQuestions()) {
      const lados = [...q.prompt.matchAll(/(\d+) m/g)].map((mm) => Number(mm[1]));
      const total = lados.reduce((s, v) => s + v, 0);
      assert.equal(q.answer, `${total} m`);
    }
  }
});

test('makeShapeAreaCase: área coerente com a forma e a resposta', () => {
  for (let i = 0; i < ITER; i++) {
    const c = makeShapeAreaCase('x1');
    const expectedArea =
      c.shape === 'quadrado' ? c.a * c.a : c.shape === 'retangulo' ? c.a * c.b : (c.a * c.b) / 2;
    assert.equal(c.answer, `${expectedArea} m²`);
    assert.ok(Number.isInteger(expectedArea), `área não inteira (${c.shape}: ${c.a},${c.b})`);
    assert.ok(c.options.includes(c.answer));
    assert.equal(new Set(c.options).size, c.options.length);
  }
  assert.deepEqual(makeShapeAreaCases().map((c) => c.id), ['a1', 'a2', 'a3']);
});
