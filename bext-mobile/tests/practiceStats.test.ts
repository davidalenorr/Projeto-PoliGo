import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyPracticeStats,
  accumulateQuickQuiz,
  quickQuizAccuracy,
} from '../src/domain/practiceStats.ts';

test('emptyPracticeStats começa zerado', () => {
  assert.deepEqual(emptyPracticeStats(), {
    quickQuizSessions: 0,
    quickQuizAnswered: 0,
    quickQuizCorrect: 0,
  });
});

test('accumulateQuickQuiz soma sessão, respostas e acertos', () => {
  let s = emptyPracticeStats();
  s = accumulateQuickQuiz(s, 6, 8);
  assert.deepEqual(s, { quickQuizSessions: 1, quickQuizAnswered: 8, quickQuizCorrect: 6 });
  s = accumulateQuickQuiz(s, 8, 8);
  assert.deepEqual(s, { quickQuizSessions: 2, quickQuizAnswered: 16, quickQuizCorrect: 14 });
});

test('accumulateQuickQuiz limita acertos ao total e ignora negativos', () => {
  const s = accumulateQuickQuiz(emptyPracticeStats(), 12, 8);
  assert.equal(s.quickQuizCorrect, 8);
  const s2 = accumulateQuickQuiz(emptyPracticeStats(), -3, -1);
  assert.deepEqual(s2, { quickQuizSessions: 1, quickQuizAnswered: 0, quickQuizCorrect: 0 });
});

test('quickQuizAccuracy: 0 sem respostas, arredondado com respostas', () => {
  assert.equal(quickQuizAccuracy(emptyPracticeStats()), 0);
  assert.equal(quickQuizAccuracy({ quickQuizSessions: 2, quickQuizAnswered: 16, quickQuizCorrect: 14 }), 88);
  assert.equal(quickQuizAccuracy({ quickQuizSessions: 1, quickQuizAnswered: 3, quickQuizCorrect: 1 }), 33);
});
