import test from 'node:test';
import assert from 'node:assert/strict';
import { missions, getMissionById, getMissionsByPhaseId } from '../src/data/missions.ts';
import { phases, getPhaseByNumber } from '../src/data/phases.ts';
import { equationMissionConfigs } from '../src/data/equationMissions.ts';
import { numbersEqual } from '../src/utils/equationValidation.ts';

test('ids de missão são únicos', () => {
  const ids = missions.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('toda missão referencia uma fase existente e tem campos válidos', () => {
  const phaseIds = new Set(phases.map((p) => p.id));
  for (const mission of missions) {
    assert.ok(phaseIds.has(mission.phaseId), `${mission.id} aponta para fase inexistente ${mission.phaseId}`);
    assert.ok(mission.title.trim().length > 0, `${mission.id} sem título`);
    assert.ok(mission.points > 0, `${mission.id} com pontos <= 0`);
    assert.ok(Array.isArray(mission.tips) && mission.tips.length > 0, `${mission.id} sem dicas`);
    assert.ok(['fácil', 'médio', 'difícil'].includes(mission.difficulty), `${mission.id} dificuldade inválida`);
  }
});

test('helpers de missão', () => {
  assert.equal(getMissionById('fase1_m1')?.title, missions[0].title);
  assert.equal(getMissionById('naoexiste'), undefined);
  assert.equal(getMissionsByPhaseId('fase1').length, 5);
});

test('fases numeradas de 1 a 10 sem buracos', () => {
  const numbers = phases.map((p) => p.number).sort((a, b) => a - b);
  assert.deepEqual(numbers, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(getPhaseByNumber(3)?.id, 'fase3');
  assert.equal(getPhaseByNumber(99), undefined);
});

test('equationMissionConfigs: ids batem com missões reais', () => {
  for (const id of Object.keys(equationMissionConfigs)) {
    assert.ok(getMissionById(id), `config de equação para missão inexistente: ${id}`);
  }
});

test('equationMissionConfigs: cada passo é coerente e verificável', () => {
  for (const [id, config] of Object.entries(equationMissionConfigs)) {
    assert.ok(config.title.trim().length > 0, `${id} sem título`);
    assert.ok(config.steps.length > 0, `${id} sem passos`);
    for (const step of config.steps) {
      assert.ok(step.prompt.trim().length > 0, `${id}/${step.id} sem enunciado`);
      assert.ok(['number', 'pair'].includes(step.type), `${id}/${step.id} tipo inválido`);
      if (step.type === 'number') {
        assert.equal(typeof step.expected, 'number', `${id}/${step.id} esperado deveria ser número`);
        assert.ok(Number.isFinite(step.expected as number), `${id}/${step.id} esperado não finito`);
      } else {
        const pair = step.expected as { x: number; y: number };
        assert.equal(typeof pair.x, 'number');
        assert.equal(typeof pair.y, 'number');
      }
      assert.ok(step.explanation && step.explanation.trim().length > 0, `${id}/${step.id} sem explicação`);
    }
  }
});

test('fase7_m3: os sistemas propostos têm mesmo par-solução que o esperado', () => {
  // Regressão: dois destes sistemas eram impossíveis antes do item 2.
  const parseSystem = (prompt: string) =>
    prompt.split(';').map((eq) => {
      // formatos: "x + y = 7", "2x + y = 10", "x - y = 1", "3x - y = 5"
      const m = eq.trim().match(/^(\d*)x\s*([+-])\s*(\d*)y\s*=\s*(-?\d+)$/);
      assert.ok(m, `não consegui parsear "${eq}"`);
      const a = m![1] === '' ? 1 : Number(m![1]);
      const sign = m![2] === '-' ? -1 : 1;
      const b = sign * (m![3] === '' ? 1 : Number(m![3]));
      const c = Number(m![4]);
      return { a, b, c };
    });

  for (const step of equationMissionConfigs.fase7_m3.steps) {
    const [e1, e2] = parseSystem(step.prompt);
    const { x, y } = step.expected as { x: number; y: number };
    assert.ok(numbersEqual(e1.a * x + e1.b * y, e1.c), `${step.id}: 1ª equação não satisfeita por (${x},${y})`);
    assert.ok(numbersEqual(e2.a * x + e2.b * y, e2.c), `${step.id}: 2ª equação não satisfeita por (${x},${y})`);
  }
});
