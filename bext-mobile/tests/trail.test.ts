import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrail } from '../src/domain/trail.ts';
import { missions } from '../src/data/missions.ts';
import { phases } from '../src/data/phases.ts';
import { bossIdForPhase } from '../src/domain/rank.ts';

const phaseMissionIds = (phaseId: string) => missions.filter((m) => m.phaseId === phaseId).map((m) => m.id);
const ordered = [...phases].sort((a, b) => a.number - b.number);

test('trilha vazia: fase 1 é a atual, o resto bloqueado', () => {
  const trail = buildTrail([]);
  assert.equal(trail.nodes.length, phases.length);
  assert.equal(trail.totalPhases, phases.length);
  assert.equal(trail.nodes[0].status, 'current');
  assert.ok(trail.nodes.slice(1).every((n) => n.status === 'locked'));
  assert.equal(trail.districtsRestored, 0);
  assert.equal(trail.bossesDefeated, 0);
  assert.equal(trail.rank.current.title, 'Recruta');
  assert.equal(trail.medals.length, 0);
});

test('concluir as missões da fase 1 desbloqueia a fase 2', () => {
  const trail = buildTrail(phaseMissionIds(ordered[0].id));
  assert.equal(trail.nodes[0].status, 'done');
  assert.equal(trail.nodes[0].missionsComplete, true);
  assert.equal(trail.nodes[0].bossDefeated, false);
  assert.equal(trail.nodes[1].status, 'current');
  assert.equal(trail.nodes[2].status, 'locked');
  assert.equal(trail.districtsRestored, 1);
});

test('derrotar o chefão da fase 1 concede a medalha e sobe a patente', () => {
  const ids = [...phaseMissionIds(ordered[0].id), bossIdForPhase(ordered[0].id)];
  const trail = buildTrail(ids);
  assert.equal(trail.nodes[0].bossDefeated, true);
  assert.equal(trail.nodes[0].status, 'done'); // concluir o chefão não muda o status (missões já feitas)
  assert.equal(trail.bossesDefeated, 1);
  assert.equal(trail.medals.length, 1);
  assert.equal(trail.medals[0].phaseId, ordered[0].id);
  assert.equal(trail.rank.current.title, 'Detetive Júnior');
});

test('buraco no progresso: fase 3 fica bloqueada se a fase 2 não terminou', () => {
  // conclui fase 1 inteira + só parte da fase 2
  const partialPhase2 = phaseMissionIds(ordered[1].id).slice(0, 1);
  const trail = buildTrail([...phaseMissionIds(ordered[0].id), ...partialPhase2]);
  assert.equal(trail.nodes[1].status, 'current');
  assert.ok(trail.nodes[1].missionsDone >= 1 && !trail.nodes[1].missionsComplete);
  assert.equal(trail.nodes[2].status, 'locked');
});

test('tudo concluído: todos os distritos restaurados, 10 medalhas, patente máxima', () => {
  const everything = [
    ...missions.map((m) => m.id),
    ...phases.map((p) => bossIdForPhase(p.id)),
  ];
  const trail = buildTrail(everything);
  assert.ok(trail.nodes.every((n) => n.status === 'done'));
  assert.equal(trail.districtsRestored, phases.length);
  assert.equal(trail.bossesDefeated, phases.length);
  assert.equal(trail.medals.length, phases.length);
  assert.equal(trail.rank.current.title, 'Lenda da Cidade Nítida');
  assert.equal(trail.rank.next, null);
});

test('cada nó carrega distrito, chefão e medalha da narrativa', () => {
  for (const node of buildTrail([]).nodes) {
    assert.ok(node.district.trim().length > 0);
    assert.ok(node.bossName.trim().length > 0);
    assert.ok(node.medal.emoji.trim().length > 0 && node.medal.name.trim().length > 0);
    assert.ok(node.missionsTotal > 0, `${node.phaseId} sem missões`);
  }
});
