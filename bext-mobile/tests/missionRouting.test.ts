import test from 'node:test';
import assert from 'node:assert/strict';
import {
  orderedPhaseMissionIds,
  findNextIncompleteMissionId,
  phaseCompletionPercent,
  isPhaseComplete,
  countCompletedInPhase,
} from '../src/domain/missionRouting.ts';
import { missions } from '../src/data/missions.ts';
import { phases } from '../src/data/phases.ts';

test('orderedPhaseMissionIds preserva a ordem de missions.ts', () => {
  assert.deepEqual(orderedPhaseMissionIds(missions, 'fase1'), [
    'fase1_m1',
    'fase1_m2',
    'fase1_m3',
    'fase1_m4',
    'fase1_m5',
  ]);
  assert.deepEqual(orderedPhaseMissionIds(missions, 'faseX'), []);
});

test('findNextIncompleteMissionId', () => {
  const ids = ['a', 'b', 'c', 'd'];
  assert.equal(findNextIncompleteMissionId(ids, []), 'a');
  assert.equal(findNextIncompleteMissionId(ids, ['a', 'b']), 'c');
  assert.equal(findNextIncompleteMissionId(ids, ['a', 'c']), 'b', 'pula os concluídos fora de ordem');
  assert.equal(findNextIncompleteMissionId(ids, ['a', 'b', 'c', 'd']), undefined);
  assert.equal(findNextIncompleteMissionId([], []), undefined);
});

test('phaseCompletionPercent arredonda e trata fase vazia', () => {
  assert.equal(phaseCompletionPercent(0, 5), 0);
  assert.equal(phaseCompletionPercent(1, 3), 33);
  assert.equal(phaseCompletionPercent(2, 3), 67);
  assert.equal(phaseCompletionPercent(5, 5), 100);
  assert.equal(phaseCompletionPercent(3, 0), 0, 'sem missões -> 0, sem divisão por zero');
});

test('isPhaseComplete', () => {
  assert.equal(isPhaseComplete(5, 5), true);
  assert.equal(isPhaseComplete(6, 5), true, 'robusto a contagem acima do total');
  assert.equal(isPhaseComplete(4, 5), false);
  assert.equal(isPhaseComplete(0, 0), false, 'fase vazia não conta como completa');
});

test('countCompletedInPhase só conta ids da fase', () => {
  const phaseIds = ['fase2_m1', 'fase2_m2', 'fase2_m3'];
  assert.equal(countCompletedInPhase(phaseIds, ['fase2_m1', 'fase2_m3', 'fase1_m1']), 2);
  assert.equal(countCompletedInPhase(phaseIds, []), 0);
});

test('integração: percorrer uma fase inteira com as funções puras', () => {
  const phaseId = 'fase3';
  const ids = orderedPhaseMissionIds(missions, phaseId);
  const total = ids.length;
  const completed: string[] = [];

  for (let step = 0; step < total; step++) {
    const next = findNextIncompleteMissionId(ids, completed);
    assert.equal(next, ids[step]);
    assert.equal(isPhaseComplete(countCompletedInPhase(ids, completed), total), false);
    completed.push(next as string);
  }

  assert.equal(findNextIncompleteMissionId(ids, completed), undefined);
  assert.equal(isPhaseComplete(countCompletedInPhase(ids, completed), total), true);
  assert.equal(phaseCompletionPercent(countCompletedInPhase(ids, completed), total), 100);
});

test('sanidade: cada fase 1..10 tem missões', () => {
  for (let n = 1; n <= 10; n++) {
    assert.ok(
      orderedPhaseMissionIds(missions, `fase${n}`).length > 0,
      `fase${n} deveria ter missões`,
    );
  }
  assert.equal(phases.length, 10);
});
