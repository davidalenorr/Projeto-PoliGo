import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeIsolateXSteps,
  makeSystemPairSteps,
  makeTalesSteps,
  makeTrigRatioSteps,
  makeTangentSteps,
  makeScaleSteps,
  makeGeoProbSteps,
  makePercentAreaSteps,
  type GeneratedEquationStep,
} from '../src/missions/procedural.ts';
import { equationMissionConfigs } from '../src/data/equationMissions.ts';

const ITER = 2000;

/** Invariantes que TODO passo gerado deve satisfazer, seja qual for a missão. */
function assertStepShape(step: GeneratedEquationStep, ctx: string) {
  assert.ok(step.id.trim().length > 0, `${ctx}: id vazio`);
  assert.ok(step.prompt.trim().length > 0, `${ctx}: enunciado vazio`);
  assert.ok(['number', 'pair'].includes(step.type), `${ctx}: tipo inválido`);
  assert.ok(step.explanation && step.explanation.trim().length > 0, `${ctx}: sem explicação`);
  if (step.type === 'number') {
    assert.equal(typeof step.expected, 'number', `${ctx}: esperado deveria ser número`);
    assert.ok(Number.isFinite(step.expected as number), `${ctx}: esperado não finito`);
  } else {
    const pair = step.expected as { x: number; y: number };
    assert.ok(Number.isFinite(pair.x) && Number.isFinite(pair.y), `${ctx}: par não finito`);
  }
}

function assertGeneratorBasics(name: string, gen: () => GeneratedEquationStep[]) {
  for (let i = 0; i < ITER; i++) {
    const steps = gen();
    assert.equal(steps.length, 3, `${name}: deveria gerar 3 passos`);
    assert.equal(new Set(steps.map((s) => s.id)).size, 3, `${name}: ids repetidos`);
    steps.forEach((s, idx) => assertStepShape(s, `${name}[${idx}]`));
  }
}

test('todos os geradores respeitam o formato de passo', () => {
  assertGeneratorBasics('makeIsolateXSteps', makeIsolateXSteps);
  assertGeneratorBasics('makeSystemPairSteps', makeSystemPairSteps);
  assertGeneratorBasics('makeTalesSteps', makeTalesSteps);
  assertGeneratorBasics('makeTrigRatioSteps', makeTrigRatioSteps);
  assertGeneratorBasics('makeTangentSteps', makeTangentSteps);
  assertGeneratorBasics('makeScaleSteps', makeScaleSteps);
  assertGeneratorBasics('makeGeoProbSteps', makeGeoProbSteps);
  assertGeneratorBasics('makePercentAreaSteps', makePercentAreaSteps);
});

test('makeIsolateXSteps: o valor esperado resolve a equação do enunciado', () => {
  for (let i = 0; i < ITER; i++) {
    const [s1, s2, s3] = makeIsolateXSteps();

    const m1 = s1.prompt.match(/^x \+ (\d+) = (\d+)$/);
    assert.ok(m1, `s1 não casou: ${s1.prompt}`);
    assert.equal(s1.expected, Number(m1![2]) - Number(m1![1]));

    const m2 = s2.prompt.match(/^(\d+)x = (\d+)$/);
    assert.ok(m2, `s2 não casou: ${s2.prompt}`);
    assert.equal(s2.expected, Number(m2![2]) / Number(m2![1]));
    assert.ok(Number.isInteger(s2.expected), 's2 deveria dar inteiro');

    const m3 = s3.prompt.match(/^(\d+)x - (\d+) = (\d+)$/);
    assert.ok(m3, `s3 não casou: ${s3.prompt}`);
    assert.equal(s3.expected, (Number(m3![3]) + Number(m3![2])) / Number(m3![1]));
    assert.ok(Number.isInteger(s3.expected), 's3 deveria dar inteiro');
  }
});

test('makeSystemPairSteps: o par (x,y) satisfaz as duas equações', () => {
  const parseEq = (eq: string) => {
    const m = eq.trim().match(/^(\d*)x\s*([+-])\s*(\d*)y\s*=\s*(-?\d+)$/);
    assert.ok(m, `não parseei "${eq}"`);
    return {
      a: m![1] === '' ? 1 : Number(m![1]),
      b: (m![2] === '-' ? -1 : 1) * (m![3] === '' ? 1 : Number(m![3])),
      c: Number(m![4]),
    };
  };

  for (let i = 0; i < ITER; i++) {
    for (const step of makeSystemPairSteps()) {
      const [e1, e2] = step.prompt.split(';').map(parseEq);
      const { x, y } = step.expected as { x: number; y: number };
      assert.ok(Number.isInteger(x) && Number.isInteger(y), `${step.id}: par não inteiro`);
      assert.ok(x > 0 && y > 0, `${step.id}: par não positivo (${x},${y})`);
      assert.equal(e1.a * x + e1.b * y, e1.c, `${step.id}: 1ª equação falhou`);
      assert.equal(e2.a * x + e2.b * y, e2.c, `${step.id}: 2ª equação falhou`);
    }
  }
});

test('makeTalesSteps: multiplicação cruzada bate com o esperado', () => {
  for (let i = 0; i < ITER; i++) {
    for (const step of makeTalesSteps()) {
      // formas: "x/p = q/r", "p/x = r/q", "q/r = x/p"
      const frac = step.prompt.replace('. Qual o valor de x?', '');
      const [lhs, rhs] = frac.split(' = ');
      const [ln, ld] = lhs.split('/');
      const [rn, rd] = rhs.split('/');
      const x = step.expected as number;
      const val = (s: string) => (s === 'x' ? x : Number(s));
      // produto dos meios = produto dos extremos
      assert.equal(val(ln) * val(rd), val(ld) * val(rn), `${step.id}: proporção não fecha (${step.prompt})`);
      assert.ok(Number.isInteger(x) && x > 0, `${step.id}: x inválido`);
    }
  }
});

test('makeTrigRatioSteps: razões coerentes com tripla 3-4-5', () => {
  for (let i = 0; i < ITER; i++) {
    const [s1, s2, s3] = makeTrigRatioSteps();
    assert.ok(Math.abs((s1.expected as number) - 0.6) < 1e-9, 'sen θ deveria ser 0,6');
    assert.ok(Math.abs((s2.expected as number) - 0.8) < 1e-9, 'cos θ deveria ser 0,8');
    assert.ok(Number.isInteger(s3.expected as number) && (s3.expected as number) > 0, 's3 inteiro');
  }
});

test('makeTangentSteps: alturas/tangentes positivas e limpas', () => {
  for (let i = 0; i < ITER; i++) {
    const steps = makeTangentSteps();
    for (const step of steps) {
      const v = step.expected as number;
      assert.ok(v > 0 && Number.isFinite(v), `${step.id}: valor inválido`);
      // tg2 pede a tangente (uma das opções); as demais pedem altura inteira
      if (step.id === 'tg2') {
        assert.ok([0.5, 1, 1.5, 2, 2.5].includes(v), `tg2 fora do conjunto: ${v}`);
      } else {
        assert.ok(Number.isInteger(v), `${step.id}: altura não inteira (${v})`);
      }
    }
  }
});

test('makeScaleSteps: distâncias positivas e inteiras', () => {
  for (let i = 0; i < ITER; i++) {
    for (const step of makeScaleSteps()) {
      const v = step.expected as number;
      assert.ok(Number.isInteger(v) && v > 0, `${step.id}: valor inválido (${v})`);
    }
  }
});

test('makeGeoProbSteps: probabilidades e áreas plausíveis', () => {
  for (let i = 0; i < ITER; i++) {
    const [p1, p2, p3] = makeGeoProbSteps();
    assert.ok([10, 20, 25, 40, 50].includes(p1.expected as number), 'p1 fora do conjunto');
    assert.ok([10, 20, 25, 50].includes(p2.expected as number), 'p2 fora do conjunto');
    assert.ok(Number.isInteger(p3.expected as number) && (p3.expected as number) > 0, 'p3 inválido');
  }
});

test('makePercentAreaSteps: área = porcentagem do total, inteira', () => {
  for (let i = 0; i < ITER; i++) {
    for (const step of makePercentAreaSteps()) {
      // "Uma horta de {total}m² destina {pct}% para {nome}."
      const m = step.prompt.match(/horta de ([\d.]+)m² destina (\d+)%/);
      assert.ok(m, `não parseei: ${step.prompt}`);
      const total = Number(m![1].replace(/\./g, ''));
      const pct = Number(m![2]);
      assert.equal(step.expected, (pct / 100) * total);
      assert.ok(Number.isInteger(step.expected as number), `${step.id}: não inteiro`);
    }
  }
});

test('equationMissionConfigs: toda missão com generate produz 3 passos coerentes', () => {
  for (const [id, config] of Object.entries(equationMissionConfigs)) {
    const gen = config.generate;
    if (!gen) continue;
    for (let i = 0; i < 500; i++) {
      const steps = gen() as GeneratedEquationStep[];
      assert.equal(steps.length, config.steps.length, `${id}: generate mudou a contagem de passos`);
      steps.forEach((s: GeneratedEquationStep, idx: number) => assertStepShape(s, `${id}[${idx}]`));
    }
  }
});
