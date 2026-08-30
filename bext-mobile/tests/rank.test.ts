import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RANKS,
  computeRank,
  bossIdForPhase,
  phaseIdForBoss,
  isBossId,
  countBossesDefeated,
  bossReward,
  earnedMedals,
  TOTAL_MEDALS,
} from '../src/domain/rank.ts';
import { phaseNarratives } from '../src/data/narrative.ts';

test('RANKS: min estritamente crescente, começa em 0', () => {
  assert.equal(RANKS[0].min, 0);
  for (let i = 1; i < RANKS.length; i++) {
    assert.ok(RANKS[i].min > RANKS[i - 1].min, `RANKS[${i}] não é maior que o anterior`);
    assert.ok(RANKS[i].title.trim().length > 0);
    assert.ok(RANKS[i].emoji.trim().length > 0);
  }
});

test('computeRank: fronteiras da escada', () => {
  assert.equal(computeRank(0).current.title, 'Recruta');
  assert.equal(computeRank(0).next?.title, 'Detetive Júnior');
  assert.equal(computeRank(0).toNext, 1);

  assert.equal(computeRank(1).current.title, 'Detetive Júnior');
  assert.equal(computeRank(1).toNext, 2); // próxima em 3

  const mid = computeRank(2);
  assert.equal(mid.current.title, 'Detetive Júnior');
  assert.equal(mid.toNext, 1);
  assert.equal(mid.progress, 0.5); // 1 de 2 no intervalo [1,3)

  assert.equal(computeRank(3).current.title, 'Detetive');
  assert.equal(computeRank(7).current.title, 'Mestre Geômetra');
});

test('computeRank: topo da escada', () => {
  const top = computeRank(10);
  assert.equal(top.current.title, 'Lenda da Cidade Nítida');
  assert.equal(top.next, null);
  assert.equal(top.toNext, 0);
  assert.equal(top.progress, 1);
  assert.equal(computeRank(99).current.title, 'Lenda da Cidade Nítida');
});

test('computeRank: entradas negativas/quebradas tratadas como 0', () => {
  assert.equal(computeRank(-5).current.title, 'Recruta');
  assert.equal(computeRank(2.9).current.title, 'Detetive Júnior');
});

test('helpers de id de chefão', () => {
  assert.equal(bossIdForPhase('fase3'), 'fase3_boss');
  assert.equal(phaseIdForBoss('fase3_boss'), 'fase3');
  assert.equal(phaseIdForBoss(bossIdForPhase('fase10')), 'fase10');
  assert.ok(isBossId('fase1_boss'));
  assert.ok(!isBossId('fase1_m2'));
  assert.ok(!isBossId('boss'));
});

test('countBossesDefeated conta só ids de chefão', () => {
  assert.equal(countBossesDefeated(['fase1_m1', 'fase1_boss', 'fase2_boss', 'x']), 2);
  assert.equal(countBossesDefeated([]), 0);
});

test('bossReward cresce com a fase e nunca é <= 0', () => {
  assert.equal(bossReward(1), 50);
  assert.equal(bossReward(10), 140);
  assert.ok(bossReward(2) > bossReward(1));
  assert.equal(bossReward(0), 50); // fallback para fase 1
  assert.equal(bossReward(NaN), 50);
});

test('earnedMedals: uma medalha por chefão derrotado, na ordem da narrativa', () => {
  const medals = earnedMedals(['fase3_boss', 'fase1_boss', 'fase1_m2']);
  assert.deepEqual(
    medals.map((m) => m.phaseId),
    ['fase1', 'fase3'],
  );
  for (const medal of medals) {
    assert.ok(medal.emoji.length > 0 && medal.name.length > 0 && medal.bossName.length > 0);
  }
  assert.equal(earnedMedals([]).length, 0);
  assert.equal(TOTAL_MEDALS, phaseNarratives.length);
});
