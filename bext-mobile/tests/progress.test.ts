import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCurrentPhaseNumber,
  getCurrentPhaseIndex,
  getPhaseIdFromNumber,
  getFirstMissionIdForPhase,
} from '../src/domain/progress.ts';
import { missions } from '../src/data/missions.ts';

test('getCurrentPhaseNumber: extrai o número do rótulo', () => {
  assert.equal(getCurrentPhaseNumber('Fase 1: Detetive das Formas'), 1);
  assert.equal(getCurrentPhaseNumber('Fase 7: Somente Equações'), 7);
  assert.equal(getCurrentPhaseNumber('fase 3'), 3, 'case-insensitive');
});

test('getCurrentPhaseNumber: fallback para 1', () => {
  assert.equal(getCurrentPhaseNumber(undefined), 1);
  assert.equal(getCurrentPhaseNumber(''), 1);
  assert.equal(getCurrentPhaseNumber('sem número'), 1);
  assert.equal(getCurrentPhaseNumber('Fase 0'), 1, 'nunca abaixo de 1');
});

test('getCurrentPhaseNumber: respeita maxPhases', () => {
  assert.equal(getCurrentPhaseNumber('Fase 12: X', 10), 10);
  assert.equal(getCurrentPhaseNumber('Fase 5: X', 10), 5);
});

test('getCurrentPhaseIndex é o número menos 1', () => {
  assert.equal(getCurrentPhaseIndex('Fase 4: X'), 3);
  assert.equal(getCurrentPhaseIndex(undefined), 0);
});

test('getPhaseIdFromNumber', () => {
  assert.equal(getPhaseIdFromNumber(1), 'fase1');
  assert.equal(getPhaseIdFromNumber(10), 'fase10');
});

test('getFirstMissionIdForPhase', () => {
  assert.equal(getFirstMissionIdForPhase('fase1', missions), 'fase1_m1');
  assert.equal(getFirstMissionIdForPhase('fase7', missions), 'fase7_m1');
  assert.equal(getFirstMissionIdForPhase('faseX', missions), undefined);
});
