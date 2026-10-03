import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSession } from '../src/sync/session.ts';

// getSession/saveSession/clearSession/getOrCreateDeviceId are AsyncStorage-backed
// and not unit-testable under node --test (no RN runtime) — same reason
// src/storage/*.ts files have no direct tests today.

test('buildSession assembles a session from the join-class response', () => {
  const session = buildSession('student-1', 'class-1', 'Turma de teste', 'device-1');

  assert.deepEqual(session, {
    studentId: 'student-1',
    classId: 'class-1',
    className: 'Turma de teste',
    deviceId: 'device-1',
  });
});
