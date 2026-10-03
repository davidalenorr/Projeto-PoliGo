// Orquestra fila + sessão + API. Superfície que a instrumentação da Fase 2
// (os `emit*`) vai chamar — nenhum ponto do app ainda chama isto.
import { getSession } from './session.ts';
import { getQueue, saveQueue } from './queueStorage.ts';
import { enqueue, takeBatch, markSent, markFailed } from './eventQueue.ts';
import { ingestEvents } from './api.ts';
import type { NewSyncEvent } from './types.ts';

const BATCH_SIZE = 50;

export async function enqueueEvent(event: NewSyncEvent): Promise<void> {
  const session = await getSession();
  if (!session) return; // aluno não entrou em turma: nada a enfileirar

  const queue = await getQueue();
  await saveQueue(enqueue(queue, event));
}

export async function flushQueue(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const queue = await getQueue();
  const now = Date.now();
  const batch = takeBatch(queue, BATCH_SIZE, now);
  if (batch.length === 0) return;

  const result = await ingestEvents(session.studentId, session.classId, batch);
  const ids = batch.map((item) => item.clientEventId);

  const updated = result.ok ? markSent(queue, ids) : markFailed(queue, ids, now);
  await saveQueue(updated);
}
