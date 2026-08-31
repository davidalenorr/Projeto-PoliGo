// Estatísticas de prática livre (Modo Treino Livre) — funções puras.
// A camada de storage em src/storage/practiceStats.ts só persiste isto.

export type PracticeStats = {
  /** Sessões de treino livre concluídas. */
  quickQuizSessions: number;
  /** Total de questões respondidas em treino livre. */
  quickQuizAnswered: number;
  /** Total de acertos em treino livre. */
  quickQuizCorrect: number;
};

export function emptyPracticeStats(): PracticeStats {
  return { quickQuizSessions: 0, quickQuizAnswered: 0, quickQuizCorrect: 0 };
}

/** Soma uma sessão de treino livre ao acumulado. `correct` é limitado a `total`. */
export function accumulateQuickQuiz(
  prev: PracticeStats,
  correct: number,
  total: number,
): PracticeStats {
  const t = Math.max(0, Math.floor(total || 0));
  const c = Math.max(0, Math.min(Math.floor(correct || 0), t));
  return {
    quickQuizSessions: prev.quickQuizSessions + 1,
    quickQuizAnswered: prev.quickQuizAnswered + t,
    quickQuizCorrect: prev.quickQuizCorrect + c,
  };
}

/** Precisão em treino livre, 0–100 (0 se ainda não respondeu nada). */
export function quickQuizAccuracy(stats: PracticeStats): number {
  return stats.quickQuizAnswered > 0
    ? Math.round((stats.quickQuizCorrect / stats.quickQuizAnswered) * 100)
    : 0;
}
