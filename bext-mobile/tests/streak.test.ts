import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceStreak,
  viewStreak,
  toDateString,
  dateStringDaysAgo,
  type StreakState,
} from '../src/domain/streak.ts';

const TODAY = '2026-08-27';
const YESTERDAY = '2026-08-26';

const empty: StreakState = { currentStreak: 0, bestStreak: 0, lastActiveDate: '' };

test('toDateString / dateStringDaysAgo', () => {
  const ref = new Date('2026-08-27T12:00:00');
  assert.equal(toDateString(ref), '2026-08-27');
  assert.equal(dateStringDaysAgo(1, ref), '2026-08-26');
  assert.equal(dateStringDaysAgo(0, ref), '2026-08-27');
  assert.equal(dateStringDaysAgo(30, new Date('2026-03-01T12:00:00')), '2026-01-30');
});

test('advanceStreak: primeira atividade começa em 1', () => {
  const { state, streakIncreased } = advanceStreak(empty, TODAY, YESTERDAY);
  assert.equal(streakIncreased, true);
  assert.deepEqual(state, { currentStreak: 1, bestStreak: 1, lastActiveDate: TODAY });
});

test('advanceStreak: dia consecutivo soma 1', () => {
  const prev: StreakState = { currentStreak: 3, bestStreak: 3, lastActiveDate: YESTERDAY };
  const { state, streakIncreased } = advanceStreak(prev, TODAY, YESTERDAY);
  assert.equal(streakIncreased, true);
  assert.deepEqual(state, { currentStreak: 4, bestStreak: 4, lastActiveDate: TODAY });
});

test('advanceStreak: segunda atividade no mesmo dia não muda nada', () => {
  const prev: StreakState = { currentStreak: 4, bestStreak: 9, lastActiveDate: TODAY };
  const { state, streakIncreased } = advanceStreak(prev, TODAY, YESTERDAY);
  assert.equal(streakIncreased, false);
  assert.deepEqual(state, prev);
});

test('advanceStreak: buraco de dias reinicia em 1 e preserva o recorde', () => {
  const prev: StreakState = { currentStreak: 8, bestStreak: 8, lastActiveDate: '2026-08-20' };
  const { state } = advanceStreak(prev, TODAY, YESTERDAY);
  assert.equal(state.currentStreak, 1);
  assert.equal(state.bestStreak, 8, 'recorde nunca diminui');
});

test('viewStreak: zera a ofensiva atual se a última atividade é antiga', () => {
  const stale: StreakState = { currentStreak: 5, bestStreak: 10, lastActiveDate: '2026-08-01' };
  assert.deepEqual(viewStreak(stale, TODAY, YESTERDAY), {
    currentStreak: 0,
    bestStreak: 10,
    lastActiveDate: '2026-08-01',
  });
});

test('viewStreak: mantém a ofensiva se ativo hoje ou ontem', () => {
  const active: StreakState = { currentStreak: 5, bestStreak: 10, lastActiveDate: YESTERDAY };
  assert.deepEqual(viewStreak(active, TODAY, YESTERDAY), active);
});
