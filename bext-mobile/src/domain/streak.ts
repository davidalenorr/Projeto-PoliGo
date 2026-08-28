// Lógica pura de "ofensiva" (streak) diária — sem I/O, para ser testável.
// A camada de storage (src/storage/streaks.ts) só cuida de ler/gravar e passar as datas.

export type StreakState = {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // 'YYYY-MM-DD' ('' = nunca ativo)
};

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Data (YYYY-MM-DD) de `days` dias atrás a partir de `from` (padrão: agora). */
export function dateStringDaysAgo(days: number, from: Date = new Date()): string {
  const date = new Date(from.getTime());
  date.setDate(date.getDate() - days);
  return toDateString(date);
}

/**
 * Estado "de leitura": se a última atividade foi antes de ontem, a ofensiva
 * atual já vale 0 (mesmo sem gravar nada).
 */
export function viewStreak(state: StreakState, today: string, yesterday: string): StreakState {
  if (state.lastActiveDate !== today && state.lastActiveDate !== yesterday) {
    return { ...state, currentStreak: 0 };
  }
  return state;
}

/**
 * Registra uma atividade em `today`:
 * - já ativo hoje  -> nada muda
 * - ativo ontem    -> ofensiva +1
 * - qualquer outro -> ofensiva reinicia em 1
 * `bestStreak` nunca diminui.
 */
export function advanceStreak(
  state: StreakState,
  today: string,
  yesterday: string,
): { state: StreakState; streakIncreased: boolean } {
  if (state.lastActiveDate === today) {
    return { state, streakIncreased: false };
  }

  const currentStreak = state.lastActiveDate === yesterday ? state.currentStreak + 1 : 1;
  const bestStreak = Math.max(state.bestStreak, currentStreak);

  return {
    state: { currentStreak, bestStreak, lastActiveDate: today },
    streakIncreased: true,
  };
}
