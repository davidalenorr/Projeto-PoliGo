// Os cinco pontos de instrumentação do jogo. Cada emit* enfileira e dispara
// flush() best-effort — nunca bloqueia a UI nem propaga erro de rede.
import { randomUuidV4 } from './ids.ts';
import { enqueueEvent, flushQueue } from './flush.ts';
import type { NewSyncEvent } from './types.ts';

function emit(event: Omit<NewSyncEvent, 'clientEventId' | 'occurredAt'>): void {
  const fullEvent: NewSyncEvent = {
    ...event,
    clientEventId: randomUuidV4(),
    occurredAt: new Date().toISOString(),
  };

  enqueueEvent(fullEvent).then(() => flushQueue());
}

export function emitMissionStarted(missionId: string, phaseNumber: number): void {
  emit({ type: 'mission_started', missionId, phaseNumber });
}

export function emitMissionAttempt(missionId: string, phaseNumber: number, correct: boolean): void {
  emit({ type: 'mission_attempt', missionId, phaseNumber, correct });
}

export function emitMissionCompleted(missionId: string, phaseNumber: number, durationMs: number): void {
  emit({ type: 'mission_completed', missionId, phaseNumber, durationMs });
}

export function emitBossDefeated(missionId: string, phaseNumber: number): void {
  emit({ type: 'boss_defeated', missionId, phaseNumber });
}

export function emitQuizSession(total: number, correct: number): void {
  emit({ type: 'quiz_session', payload: { total, correct } });
}
