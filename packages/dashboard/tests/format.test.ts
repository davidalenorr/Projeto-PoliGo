import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatRelativeTime, toCsv, trailPercent } from '../lib/format.ts';

test('formatDuration', () => {
  assert.equal(formatDuration(49000), '0:49');
  assert.equal(formatDuration(125000), '2:05');
  assert.equal(formatDuration(null), '—');
  assert.equal(formatDuration(-5), '—');
});

test('formatRelativeTime', () => {
  const now = Date.parse('2026-10-03T18:00:00.000Z');
  assert.equal(formatRelativeTime(null, now), '—');
  assert.equal(formatRelativeTime('2026-10-03T17:59:30.000Z', now), 'agora');
  assert.equal(formatRelativeTime('2026-10-03T17:30:00.000Z', now), '30min');
  assert.equal(formatRelativeTime('2026-10-03T12:00:00.000Z', now), '6h');
  assert.equal(formatRelativeTime('2026-10-01T18:00:00.000Z', now), '2d');
});

test('trailPercent', () => {
  assert.equal(trailPercent(0, 43), 0);
  assert.equal(trailPercent(1, 43), 2);
  assert.equal(trailPercent(43, 43), 100);
  assert.equal(trailPercent(50, 43), 100, 'clamps above total instead of exceeding 100');
  assert.equal(trailPercent(5, 0), 0, 'no missions in app -> 0, no division by zero');
});

test('toCsv escapes commas, quotes and newlines; empty/null becomes blank', () => {
  const columns = [
    { key: 'name', label: 'Aluno' },
    { key: 'note', label: 'Nota' },
  ];
  const csv = toCsv(
    [
      { name: 'Ana', note: null },
      { name: 'O, "Grande"', note: 'linha\nquebrada' },
    ],
    columns,
  );

  assert.equal(
    csv,
    'Aluno,Nota\r\nAna,\r\n"O, ""Grande""","linha\nquebrada"',
  );
});
