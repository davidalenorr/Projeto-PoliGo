// Fila de eventos — funções puras (sem AsyncStorage/RN), estilo
// src/domain/*. A persistência fica em queueStorage.ts.
import type { QueuedSyncEvent, NewSyncEvent } from './types.ts';

const MAX_ATTEMPTS_BACKOFF_MS = 30 * 60 * 1000; // teto de 30 min
const BASE_BACKOFF_MS = 5 * 1000;

export function enqueue(queue: QueuedSyncEvent[], event: NewSyncEvent): QueuedSyncEvent[] {
  if (queue.some((item) => item.clientEventId === event.clientEventId)) {
    return queue;
  }
  return [...queue, { ...event, attempts: 0 }];
}

export function dueItems(queue: QueuedSyncEvent[], now: number): QueuedSyncEvent[] {
  return queue.filter((item) => item.nextAttemptAt === undefined || item.nextAttemptAt <= now);
}

export function takeBatch(queue: QueuedSyncEvent[], maxSize: number, now: number): QueuedSyncEvent[] {
  return dueItems(queue, now).slice(0, maxSize);
}

export function markSent(queue: QueuedSyncEvent[], clientEventIds: string[]): QueuedSyncEvent[] {
  const sent = new Set(clientEventIds);
  return queue.filter((item) => !sent.has(item.clientEventId));
}

export function backoffMs(attempts: number): number {
  return Math.min(BASE_BACKOFF_MS * 2 ** attempts, MAX_ATTEMPTS_BACKOFF_MS);
}

export function markFailed(
  queue: QueuedSyncEvent[],
  clientEventIds: string[],
  now: number,
): QueuedSyncEvent[] {
  const failed = new Set(clientEventIds);
  return queue.map((item) => {
    if (!failed.has(item.clientEventId)) return item;
    const attempts = item.attempts + 1;
    return { ...item, attempts, nextAttemptAt: now + backoffMs(attempts) };
  });
}
