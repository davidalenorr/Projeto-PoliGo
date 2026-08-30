import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBadges } from '../src/domain/badges.ts';
import { buildTrail } from '../src/domain/trail.ts';
import { missions } from '../src/data/missions.ts';
import { phases } from '../src/data/phases.ts';
import { bossIdForPhase } from '../src/domain/rank.ts';

const ordered = [...phases].sort((a, b) => a.number - b.number);
const phaseMissionIds = (phaseId: string) => missions.filter((m) => m.phaseId === phaseId).map((m) => m.id);

test('progresso zero: só as conquistas de pontos/misão ficam bloqueadas', () => {
  const badges = computeBadges(buildTrail([]), 0);
  assert.equal(badges.length, 10);
  assert.equal(new Set(badges.map((b) => b.id)).size, 10);
  assert.ok(badges.every((b) => !b.unlocked));
  assert.ok(badges.every((b) => b.title.trim() && b.description.trim()));
});

test('primeira missão desbloqueia "Primeiros Passos"', () => {
  const badges = computeBadges(buildTrail([phaseMissionIds(ordered[0].id)[0]]), 0);
  assert.equal(badges.find((b) => b.id === 'b1')?.unlocked, true);
  assert.equal(badges.find((b) => b.id === 'b2')?.unlocked, false);
});

test('concluir fase 1 + chefão desbloqueia distrito e primeiro chefão', () => {
  const ids = [...phaseMissionIds(ordered[0].id), bossIdForPhase(ordered[0].id)];
  const badges = computeBadges(buildTrail(ids), 60);
  assert.equal(badges.find((b) => b.id === 'b2')?.unlocked, true); // distrito 1
  assert.equal(badges.find((b) => b.id === 'b3')?.unlocked, true); // primeiro chefão
});

test('pontos desbloqueiam as conquistas de Pts', () => {
  const zero = buildTrail([]);
  assert.equal(computeBadges(zero, 100).find((b) => b.id === 'b9')?.unlocked, true);
  assert.equal(computeBadges(zero, 249).find((b) => b.id === 'b10')?.unlocked, false);
  assert.equal(computeBadges(zero, 250).find((b) => b.id === 'b10')?.unlocked, true);
});

test('100% desbloqueia todas as conquistas', () => {
  const everything = [...missions.map((m) => m.id), ...phases.map((p) => bossIdForPhase(p.id))];
  const badges = computeBadges(buildTrail(everything), 999);
  assert.ok(badges.every((b) => b.unlocked), badges.filter((b) => !b.unlocked).map((b) => b.id).join(','));
});
