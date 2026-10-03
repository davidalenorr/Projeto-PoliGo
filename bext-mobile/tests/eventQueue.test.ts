import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enqueue,
  dueItems,
  takeBatch,
  markSent,
  markFailed,
  backoffMs,
} from '../src/sync/eventQueue.ts';
import type { NewSyncEvent } from '../src/sync/types.ts';

function mkEvent(clientEventId: string, occurredAt = '2026-10-03T12:00:00.000Z'): NewSyncEvent {
  return { clientEventId, type: 'mission_started', occurredAt };
}

test('enqueue dedupes by clientEventId', () => {
  let queue = enqueue([], mkEvent('a'));
  queue = enqueue(queue, mkEvent('b'));
  queue = enqueue(queue, mkEvent('a'));

  assert.equal(queue.length, 2);
  assert.deepEqual(queue.map((e) => e.clientEventId), ['a', 'b']);
});

test('enqueue preserves insertion order (FIFO)', () => {
  let queue = enqueue([], mkEvent('a'));
  queue = enqueue(queue, mkEvent('b'));
  queue = enqueue(queue, mkEvent('c'));

  assert.deepEqual(queue.map((e) => e.clientEventId), ['a', 'b', 'c']);
});

test('dueItems excludes items with a future nextAttemptAt', () => {
  const now = 1000;
  let queue = enqueue([], mkEvent('a'));
  queue = enqueue(queue, mkEvent('b'));
  queue = markFailed(queue, ['a'], now);

  const due = dueItems(queue, now);
  assert.deepEqual(due.map((e) => e.clientEventId), ['b']);
});

test('dueItems includes an item once its backoff has elapsed', () => {
  let queue = enqueue([], mkEvent('a'));
  queue = markFailed(queue, ['a'], 1000);
  const retryAt = queue[0].nextAttemptAt!;

  assert.deepEqual(dueItems(queue, retryAt - 1), []);
  assert.deepEqual(dueItems(queue, retryAt).map((e) => e.clientEventId), ['a']);
});

test('takeBatch respects order and maxSize, skipping items not yet due', () => {
  let queue = enqueue([], mkEvent('a'));
  queue = enqueue(queue, mkEvent('b'));
  queue = enqueue(queue, mkEvent('c'));
  queue = markFailed(queue, ['a'], 0); // 'a' now has a future nextAttemptAt

  const batch = takeBatch(queue, 1, 0);
  assert.deepEqual(batch.map((e) => e.clientEventId), ['b']);
});

test('markSent removes acknowledged items and keeps the rest in order', () => {
  let queue = enqueue([], mkEvent('a'));
  queue = enqueue(queue, mkEvent('b'));
  queue = enqueue(queue, mkEvent('c'));

  const updated = markSent(queue, ['b']);
  assert.deepEqual(updated.map((e) => e.clientEventId), ['a', 'c']);
});

test('markFailed increments attempts and grows backoff exponentially', () => {
  let queue = enqueue([], mkEvent('a'));
  queue = markFailed(queue, ['a'], 0);
  assert.equal(queue[0].attempts, 1);
  const firstDelay = queue[0].nextAttemptAt!;

  queue = markFailed(queue, ['a'], 0);
  assert.equal(queue[0].attempts, 2);
  const secondDelay = queue[0].nextAttemptAt!;

  assert.ok(secondDelay > firstDelay, 'backoff should grow with more attempts');
});

test('backoffMs is capped', () => {
  assert.ok(backoffMs(2) > backoffMs(1));
  assert.equal(backoffMs(20), backoffMs(10), 'should hit the cap and stop growing');
});
