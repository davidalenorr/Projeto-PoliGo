import test from 'node:test';
import assert from 'node:assert/strict';
import { bossMissionConfigs, getBossConfig, type BossQuestion } from '../src/data/bossMissions.ts';
import { phaseNarratives, getPhaseNarrative } from '../src/data/narrative.ts';
import { phases } from '../src/data/phases.ts';

const PHASE_IDS = phases.map((p) => p.id);

function assertQuestion(q: BossQuestion, ctx: string) {
  assert.ok(q.id.trim().length > 0, `${ctx}: id vazio`);
  assert.ok(q.prompt.trim().length > 0, `${ctx}: enunciado vazio`);
  assert.ok(q.explanation.trim().length > 0, `${ctx}: sem explicação`);
  assert.ok(Array.isArray(q.options) && q.options.length >= 3, `${ctx}: menos de 3 opções`);
  assert.equal(new Set(q.options).size, q.options.length, `${ctx}: opções repetidas (${q.options.join(' | ')})`);
  assert.ok(q.options.includes(q.answer), `${ctx}: resposta "${q.answer}" fora das opções`);
}

test('há exatamente um chefão por fase, com phaseId coerente', () => {
  assert.deepEqual(Object.keys(bossMissionConfigs).sort(), [...PHASE_IDS].sort());
  for (const [key, config] of Object.entries(bossMissionConfigs)) {
    assert.equal(config.phaseId, key);
    assert.ok(config.title.trim().length > 0, `${key}: sem título`);
    assert.equal(getBossConfig(key), config);
  }
});

test('cada duelo gera 4 questões coerentes (300 sorteios por fase)', () => {
  for (const [phaseId, config] of Object.entries(bossMissionConfigs)) {
    for (let i = 0; i < 300; i++) {
      const qs = config.buildQuestions();
      assert.equal(qs.length, 4, `${phaseId}: deveria gerar 4 questões`);
      assert.equal(new Set(qs.map((q) => q.id)).size, qs.length, `${phaseId}: ids repetidos`);
      qs.forEach((q, idx) => assertQuestion(q, `${phaseId}[${idx}]`));
    }
  }
});

test('toda fase tem narrativa; medalhas e nomes de chefão são únicos', () => {
  for (const id of PHASE_IDS) {
    const n = getPhaseNarrative(id);
    assert.ok(n, `fase ${id} sem narrativa`);
    assert.ok(n!.intro.trim().length > 0 && n!.bossTaunt.trim().length > 0 && n!.bossDefeat.trim().length > 0);
    assert.ok(n!.medal.emoji.trim().length > 0 && n!.medal.name.trim().length > 0);
  }
  assert.equal(phaseNarratives.length, PHASE_IDS.length);
  assert.equal(new Set(phaseNarratives.map((n) => n.medal.name)).size, phaseNarratives.length);
  assert.equal(new Set(phaseNarratives.map((n) => n.medal.emoji)).size, phaseNarratives.length);
  assert.equal(new Set(phaseNarratives.map((n) => n.bossName)).size, phaseNarratives.length);
});
